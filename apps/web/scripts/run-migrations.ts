import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '../../../packages/db/drizzle')

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) throw new Error('DATABASE_URL not set')

const client = postgres(dbUrl, { max: 1 })
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()
let applied = 0
let skipped = 0
const failures: string[] = []

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf-8')
  const stmts = sql
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean)

  for (const stmt of stmts) {
    try {
      await client.unsafe(stmt)
      applied++
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      if (
        ['42701', '42P07', '42710'].includes(err.code ?? '') ||
        err.message?.includes('already exists')
      ) {
        skipped++
      } else {
        failures.push(`[${file}] ${err.code ?? 'UNKNOWN'}: ${err.message ?? 'Migration failed'}`)
        break
      }
    }
  }

  if (failures.length > 0) break
}

await client.end()

if (failures.length > 0) {
  process.stderr.write(`Migration failed:\n${failures.join('\n')}\n`)
  process.exit(1)
}

console.log(`Migrations: applied=${applied} skipped/already-existed=${skipped}`)
