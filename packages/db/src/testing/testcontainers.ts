import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as schema from '../schema/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '../../drizzle')

export type DB = ReturnType<typeof drizzle<typeof schema>>

export interface TestDB {
  db: DB
  connectionString: string
  teardown: () => Promise<void>
}

type StartedPostgreSqlContainer = Awaited<ReturnType<PostgreSqlContainer['start']>>

function isMissingContainerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('no such container') ||
    message.includes('No such container') ||
    message.includes('Could not find a working container runtime strategy')
  )
}

function isConnectTimeoutError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('CONNECT_TIMEOUT')
}

function getContainerConnectionString(container: StartedPostgreSqlContainer) {
  const connectionUrl = new URL(container.getConnectionUri())

  // Docker Desktop on Windows can intermittently time out when clients resolve
  // testcontainer Postgres endpoints through `localhost`.
  if (connectionUrl.hostname === 'localhost') {
    connectionUrl.hostname = '127.0.0.1'
  }

  return connectionUrl.toString()
}

export function hasContainerRuntime() {
  if (
    process.env.DOCKER_HOST ||
    process.env.TESTCONTAINERS_HOST_OVERRIDE ||
    process.env.TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE
  ) {
    return true
  }

  try {
    execFileSync('docker', ['info'], { stdio: 'ignore', timeout: 5_000 })
    return true
  } catch {
    if (process.env.CI === 'true') {
      throw new Error('Container runtime is required for DB-backed test suites in CI')
    }

    return false
  }
}

export async function createTestDB(): Promise<TestDB> {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt++) {
    let container: StartedPostgreSqlContainer | undefined
    let client: ReturnType<typeof postgres> | undefined

    try {
      try {
        container = await new PostgreSqlContainer('postgres:16-alpine').start()
      } catch (error) {
        if (!isMissingContainerError(error) || attempt > 0) {
          throw error
        }

        // Testcontainers can occasionally race with Docker cleanup under parallel workspace runs.
        // Retry once with a fresh container before failing the suite.
        container = await new PostgreSqlContainer('postgres:16-alpine').start()
      }

      const migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()

      if (migrationFiles.length === 0) {
        throw new Error(`No migration files found in ${migrationsDir}`)
      }

      const connectionString = getContainerConnectionString(container)
      client = postgres(connectionString, { max: 1 })

      // Run migration SQL files in order
      for (const file of migrationFiles) {
        const sql = readFileSync(join(migrationsDir, file), 'utf-8')
        // Strip drizzle-kit statement-breakpoint markers and run each statement
        const statements = sql
          .split('--> statement-breakpoint')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)

        for (const statement of statements) {
          await client.unsafe(statement)
        }
      }

      const db = drizzle(client, { schema })
      const teardown = async () => {
        await client!.end().catch(() => {})
        await container!.stop().catch((error: unknown) => {
          if (!isMissingContainerError(error)) {
            throw error
          }
        })
      }

      return {
        db,
        connectionString,
        teardown,
      }
    } catch (error) {
      lastError = error
      await client?.end().catch(() => {})
      await container?.stop().catch((stopError: unknown) => {
        if (!isMissingContainerError(stopError)) {
          throw stopError
        }
      })

      if (!isConnectTimeoutError(error) || attempt > 0) {
        throw error
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}
