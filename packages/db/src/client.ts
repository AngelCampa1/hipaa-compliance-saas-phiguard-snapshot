import { AsyncLocalStorage } from 'node:async_hooks'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.js'

// Lazy singleton - only connect when DATABASE_URL is available
// (allows importing schema without a live DB connection in tests)
let _db: ReturnType<typeof drizzle> | null = null
type PostgresClient = ReturnType<typeof postgres>
type DrizzleDb = ReturnType<typeof drizzle>

const hyperdriveDbStore = new AsyncLocalStorage<{ client?: PostgresClient; db?: DrizzleDb }>()

function isHyperdriveConnectionString(connectionString: string) {
  try {
    return new URL(connectionString).hostname.endsWith('.hyperdrive.local')
  } catch {
    return false
  }
}

function shouldDisableSsl(connectionString: string) {
  if (process.env.DATABASE_SSL === 'false') {
    return true
  }

  if (isHyperdriveConnectionString(connectionString)) {
    return true
  }

  if (['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
    return true
  }

  try {
    const url = new URL(connectionString)
    return ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

function createClient(connectionString: string) {
  return postgres(connectionString, {
    ssl: shouldDisableSsl(connectionString) ? false : { rejectUnauthorized: true },
    max: isHyperdriveConnectionString(connectionString) ? 5 : undefined,
    fetch_types: isHyperdriveConnectionString(connectionString) ? false : undefined,
    prepare: isHyperdriveConnectionString(connectionString) ? false : undefined,
  })
}

function createDb(connectionString: string) {
  return drizzle(createClient(connectionString), { schema })
}

function createHyperdriveDb(connectionString: string) {
  const client = postgres(connectionString, {
    ssl: shouldDisableSsl(connectionString) ? false : { rejectUnauthorized: true },
    max: 5,
    fetch_types: false,
    prepare: false,
  })

  return { client, db: drizzle(client, { schema }) }
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  // Workers must not reuse database clients across requests. Hyperdrive already
  // maintains the underlying pool, so the safe path is one client per request.
  if (isHyperdriveConnectionString(connectionString)) {
    const store = hyperdriveDbStore.getStore()
    if (store) {
      if (!store.db) {
        const scoped = createHyperdriveDb(connectionString)
        store.client = scoped.client
        store.db = scoped.db
      }

      return store.db
    }

    return createHyperdriveDb(connectionString).db
  }

  if (!_db) {
    _db = createDb(connectionString)
  }

  return _db
}

export function withDbContext<T>(fn: () => T): T {
  const store: { client?: PostgresClient; db?: DrizzleDb } = {}

  const closeScopedClient = async () => {
    const close = store.client?.end
    if (typeof close !== 'function') return
    try {
      await close.call(store.client, { timeout: 1 })
    } catch {
      // Request-scoped Hyperdrive clients should not mask the operation result.
    }
  }

  return hyperdriveDbStore.run(store, () => {
    try {
      const result = fn()
      const maybePromise = result as unknown
      if (
        maybePromise &&
        typeof maybePromise === 'object' &&
        typeof (maybePromise as Promise<unknown>).finally === 'function'
      ) {
        return (maybePromise as Promise<unknown>).finally(closeScopedClient) as T
      }

      void closeScopedClient()
      return result
    } catch (error) {
      void closeScopedClient()
      throw error
    }
  })
}

export type DB = ReturnType<typeof getDb>
