import { createHash } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { getDb, rateLimitBuckets, type DB } from '@phiguard/db/server'
import { logger } from '@phiguard/audit'

export const AUTH_LOCKOUT_THRESHOLD = 5
export const AUTH_LOCKOUT_WINDOW_MS = 15 * 60 * 1000

type LockoutRecord = {
  attempts: number
  windowStartedAt: Date
}

type AuthLockoutStore = {
  get: (bucketKey: string) => Promise<LockoutRecord | null>
  recordFailure: (bucketKey: string, now: Date) => Promise<void>
  delete: (bucketKey: string) => Promise<void>
}

type LockoutOptions = {
  store?: AuthLockoutStore
  now?: Date
}

export function normalizeLoginIdentifier(identifier: string) {
  return identifier.trim().toLocaleLowerCase('en-US')
}

function getBucketKey(identifier: string) {
  const normalized = normalizeLoginIdentifier(identifier)
  if (!normalized) return null

  const digest = createHash('sha256').update(normalized).digest('hex')
  return `auth-lockout:${digest}`
}

export function createInMemoryAuthLockoutStore(): AuthLockoutStore {
  const records = new Map<string, LockoutRecord>()

  return {
    async get(bucketKey) {
      return records.get(bucketKey) ?? null
    },
    async recordFailure(bucketKey, now) {
      const current = records.get(bucketKey)
      const nextRecord =
        !current || isExpired(current, now)
          ? { attempts: 1, windowStartedAt: now }
          : {
              attempts: current.attempts + 1,
              windowStartedAt: current.windowStartedAt,
            }

      records.set(bucketKey, nextRecord)
    },
    async delete(bucketKey) {
      records.delete(bucketKey)
    },
  }
}

function createPostgresAuthLockoutStore(db: DB): AuthLockoutStore {
  return {
    async get(bucketKey) {
      const [row] = await db
        .select()
        .from(rateLimitBuckets)
        .where(eq(rateLimitBuckets.bucketKey, bucketKey))
        .limit(1)

      if (!row) {
        return null
      }

      return {
        attempts: row.tokens,
        windowStartedAt: row.lastRefill,
      }
    },
    async recordFailure(bucketKey, now) {
      await db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${bucketKey}))`)

        const [current] = await tx
          .select()
          .from(rateLimitBuckets)
          .where(eq(rateLimitBuckets.bucketKey, bucketKey))
          .limit(1)

        const nextRecord =
          !current ||
          isExpired({ attempts: current.tokens, windowStartedAt: current.lastRefill }, now)
            ? { attempts: 1, windowStartedAt: now }
            : {
                attempts: current.tokens + 1,
                windowStartedAt: current.lastRefill,
              }

        if (!current) {
          await tx.insert(rateLimitBuckets).values({
            bucketKey,
            tokens: nextRecord.attempts,
            lastRefill: nextRecord.windowStartedAt,
            updatedAt: now,
          })
          return
        }

        await tx
          .update(rateLimitBuckets)
          .set({
            tokens: nextRecord.attempts,
            lastRefill: nextRecord.windowStartedAt,
            updatedAt: now,
          })
          .where(eq(rateLimitBuckets.bucketKey, bucketKey))
      })
    },
    async delete(bucketKey) {
      await db.delete(rateLimitBuckets).where(eq(rateLimitBuckets.bucketKey, bucketKey))
    },
  }
}

let defaultStore: AuthLockoutStore | null = null

function getDefaultStore() {
  if (defaultStore) {
    return defaultStore
  }

  defaultStore =
    process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL
      ? createInMemoryAuthLockoutStore()
      : createPostgresAuthLockoutStore(getDb())

  return defaultStore
}

function isExpired(record: LockoutRecord, now: Date) {
  return now.getTime() - record.windowStartedAt.getTime() >= AUTH_LOCKOUT_WINDOW_MS
}

function logLockoutStoreFailure(operation: 'delete' | 'get' | 'recordFailure', err: unknown) {
  try {
    logger.safe.warn(
      {
        component: 'auth-lockout',
        operation,
        name: err instanceof Error ? err.name : 'UnknownError',
        stackHash:
          err instanceof Error && err.stack
            ? createHash('sha1').update(err.stack).digest('hex').slice(0, 12)
            : 'no-stack',
      },
      'auth-lockout: storage operation failed',
    )
  } catch {
    // Lockout telemetry should never block authentication.
  }
}

function resolveLockoutStore(
  operation: 'delete' | 'get' | 'recordFailure',
  opts: LockoutOptions,
) {
  try {
    return opts.store ?? getDefaultStore()
  } catch (err) {
    logLockoutStoreFailure(operation, err)
    return null
  }
}

export async function getLoginLockoutState(identifier: string, opts: LockoutOptions = {}) {
  const bucketKey = getBucketKey(identifier)
  if (!bucketKey) {
    return { locked: false, retryAfterSeconds: 0 }
  }

  const store = resolveLockoutStore('get', opts)
  if (!store) {
    return { locked: false, retryAfterSeconds: 0 }
  }
  const now = opts.now ?? new Date()
  let record: LockoutRecord | null
  try {
    record = await store.get(bucketKey)
  } catch (err) {
    logLockoutStoreFailure('get', err)
    return { locked: false, retryAfterSeconds: 0 }
  }

  if (!record) {
    return { locked: false, retryAfterSeconds: 0 }
  }

  if (isExpired(record, now)) {
    try {
      await store.delete(bucketKey)
    } catch (err) {
      logLockoutStoreFailure('delete', err)
    }
    return { locked: false, retryAfterSeconds: 0 }
  }

  if (record.attempts < AUTH_LOCKOUT_THRESHOLD) {
    return { locked: false, retryAfterSeconds: 0 }
  }

  const windowEndsAt = record.windowStartedAt.getTime() + AUTH_LOCKOUT_WINDOW_MS

  return {
    locked: true,
    retryAfterSeconds: Math.max(1, Math.ceil((windowEndsAt - now.getTime()) / 1000)),
  }
}

export async function recordFailedLoginForIdentifier(
  identifier: string,
  opts: LockoutOptions = {},
) {
  const bucketKey = getBucketKey(identifier)
  if (!bucketKey) {
    return
  }

  const store = resolveLockoutStore('recordFailure', opts)
  if (!store) {
    return
  }
  const now = opts.now ?? new Date()
  try {
    await store.recordFailure(bucketKey, now)
  } catch (err) {
    logLockoutStoreFailure('recordFailure', err)
  }
}

export async function resetLoginLockoutForIdentifier(
  identifier: string,
  opts: Pick<LockoutOptions, 'store'> = {},
) {
  const bucketKey = getBucketKey(identifier)
  if (!bucketKey) {
    return
  }

  const store = resolveLockoutStore('delete', opts)
  if (!store) {
    return
  }
  try {
    await store.delete(bucketKey)
  } catch (err) {
    logLockoutStoreFailure('delete', err)
  }
}
