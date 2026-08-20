#!/usr/bin/env node
/**
 * Drops and rebuilds a local Postgres database, then applies every Drizzle
 * migration in order.
 *
 *   node scripts/reset-local-db.mjs                 # phiguard
 *   node scripts/reset-local-db.mjs phiguard_demo   # a named database
 *
 * This exists because `drizzle-kit migrate` swallows the underlying Postgres
 * error when a statement fails, which makes a broken local database very hard
 * to diagnose. Applying the SQL directly surfaces the failing file and message.
 *
 * The Playwright global setup imports `recreateDatabase` and `applyMigrations`
 * from here so there is one implementation rather than two that drift.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

export const MIGRATIONS_DIR = join(repoRoot, 'packages', 'db', 'drizzle')
export const DEFAULT_HOST = '127.0.0.1:5432'
export const DEFAULT_CREDENTIALS = 'phiguard:phiguard_dev'

export const adminUrlFor = (host = DEFAULT_HOST) =>
  `postgresql://${DEFAULT_CREDENTIALS}@${host}/postgres`
export const databaseUrlFor = (dbName, host = DEFAULT_HOST) =>
  `postgresql://${DEFAULT_CREDENTIALS}@${host}/${dbName}`

/** Terminates open connections, then drops and recreates the database. */
export async function recreateDatabase(dbName, adminUrl = adminUrlFor()) {
  const admin = postgres(adminUrl, { max: 1, onnotice: () => {} })

  try {
    await admin.unsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid()
    `)
    await admin.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`)
    await admin.unsafe(`CREATE DATABASE "${dbName}"`)
  } finally {
    await admin.end()
  }
}

/**
 * Migration filenames in journal order. Falls back to lexical order only when
 * there is no journal to read, and fails loudly if the journal names a file
 * that is not on disk rather than quietly skipping it.
 */
function journalOrder(migrationsDir) {
  const journalPath = join(migrationsDir, 'meta', '_journal.json')
  const onDisk = new Set(readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')))

  if (!existsSync(journalPath)) {
    return [...onDisk].sort()
  }

  const { entries } = JSON.parse(readFileSync(journalPath, 'utf8'))
  const ordered = [...entries]
    .sort((a, b) => a.idx - b.idx)
    .map((entry) => `${entry.tag}.sql`)

  const missing = ordered.filter((file) => !onDisk.has(file))
  if (missing.length > 0) {
    throw new Error(`Journal references migrations that are not on disk: ${missing.join(', ')}`)
  }

  // Anything present but unjournalled would otherwise be dropped silently.
  const unlisted = [...onDisk].filter((file) => !ordered.includes(file)).sort()
  return [...ordered, ...unlisted]
}

/**
 * Applies every `.sql` file in migration order, splitting on Drizzle's
 * statement breakpoints. Throws with the failing file name attached.
 *
 * Order comes from `meta/_journal.json`, which is what `drizzle-kit migrate`
 * itself uses. Sorting filenames instead would be wrong: concurrent branches
 * minted colliding migration numbers (see ADR 0017), so the journal's `idx`
 * sequence and lexical filename order genuinely diverge in this repository.
 * A local database built in the wrong order is exactly the kind of silent
 * difference this script exists to avoid.
 */
export async function applyMigrations(databaseUrl, migrationsDir = MIGRATIONS_DIR) {
  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} })

  try {
    const files = journalOrder(migrationsDir)

    if (files.length === 0) {
      throw new Error(`No migration files found in ${migrationsDir}`)
    }

    for (const file of files) {
      const statements = readFileSync(join(migrationsDir, file), 'utf8')
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean)

      for (const statement of statements) {
        try {
          await client.unsafe(statement)
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error)
          throw new Error(`Migration ${file} failed: ${detail}`)
        }
      }
    }

    return files.length
  } finally {
    await client.end()
  }
}

async function main() {
  const dbName = process.argv[2] ?? 'phiguard'
  const databaseUrl = databaseUrlFor(dbName)

  console.log(`Recreating database "${dbName}"...`)
  await recreateDatabase(dbName)

  const applied = await applyMigrations(databaseUrl)
  console.log(`Applied ${applied} migrations to "${dbName}".`)
  console.log('')
  console.log('  DATABASE_URL=' + databaseUrl)
}

// Only run as a CLI when invoked directly; the Playwright setup imports the
// helpers above instead.
const invokedDirectly = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/reset-local-db.mjs')
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
