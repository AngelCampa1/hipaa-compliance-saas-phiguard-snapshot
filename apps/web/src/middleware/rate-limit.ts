import { eq, lt, sql } from 'drizzle-orm'
import { getDb, rateLimitBuckets, type DB } from '@phiguard/db/server'

const STALE_BUCKET_TTL_MULTIPLIER = 10

interface Bucket {
  tokens: number
  lastRefill: number
}

export interface RateLimitDecision {
  allowed: boolean
  retryAfterSeconds: number
}

export interface RateLimitStore {
  takeToken: (
    bucketKey: string,
    now: Date,
    opts: RateLimitOptions,
  ) => Promise<RateLimitDecision>
}

export interface RateLimitOptions {
  /** Prefix namespace for bucket keys to avoid collisions between limiters */
  keyPrefix?: string
  /** Maximum tokens (burst capacity) */
  maxTokens: number
  /** Tokens added per window period */
  refillRate: number
  /** Refill window in milliseconds */
  windowMs: number
  /** Maximum time to wait on the backend store before failing open to memory */
  backendTimeoutMs?: number
}

const DEFAULT_BACKEND_TIMEOUT_MS = 250

class RateLimitBackendTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Rate limit backend timed out after ${timeoutMs}ms`)
    this.name = 'RateLimitBackendTimeoutError'
  }
}

function isMissingRateLimitBucketTableError(error: unknown) {
  let current: unknown = error

  while (current && typeof current === 'object') {
    const candidate = current as {
      cause?: unknown
      code?: string
      message?: string
    }

    if (
      candidate.code === '42P01' ||
      (typeof candidate.message === 'string' &&
        candidate.message.includes('rate_limit_buckets') &&
        candidate.message.includes('does not exist'))
    ) {
      return true
    }

    current = candidate.cause
  }

  return false
}

function isRateLimitDisabled() {
  return process.env.DISABLE_RATE_LIMIT === 'true'
}

function isHyperdriveConnectionString(connectionString: string | undefined) {
  if (!connectionString) {
    return false
  }

  try {
    return new URL(connectionString).hostname.endsWith('.hyperdrive.local')
  } catch {
    return false
  }
}

function shouldUseRequestScopedStore() {
  return isHyperdriveConnectionString(process.env.DATABASE_URL)
}

function getBucketKey(prefix: string, request: Request) {
  return `${prefix}:${getRequestIp(request)}`
}

function getRequestIp(request: Request) {
  if (process.env.TRUSTED_PROXY === 'true') {
    return (
      request.headers.get('cf-connecting-ip')?.trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    )
  }
  // Without a trusted proxy, forwarded headers cannot be trusted since any
  // client can spoof them to bypass rate limits. Fall back to 'unknown' as
  // the Web API has no socket.remoteAddress equivalent.
  return 'unknown'
}

export function calculateRetryAfterSeconds(lastRefillMs: number, nowMs: number, windowMs: number) {
  const nextRefillInMs = Math.max(windowMs - (nowMs - lastRefillMs), 0)
  return Math.max(1, Math.ceil(nextRefillInMs / 1000))
}

function createInMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, Bucket>()

  return {
    async takeToken(bucketKey, now, opts) {
      const nowMs = now.getTime()

      for (const [key, bucket] of buckets) {
        if (nowMs - bucket.lastRefill > opts.windowMs * 2) {
          buckets.delete(key)
        }
      }

      let bucket = buckets.get(bucketKey) ?? {
        tokens: opts.maxTokens,
        lastRefill: nowMs,
      }

      const elapsedMs = nowMs - bucket.lastRefill
      const refillWindows = Math.floor(elapsedMs / opts.windowMs)
      if (refillWindows > 0) {
        bucket = {
          tokens: Math.min(opts.maxTokens, bucket.tokens + refillWindows * opts.refillRate),
          lastRefill: nowMs,
        }
      }

      if (bucket.tokens <= 0) {
        buckets.set(bucketKey, bucket)
        return {
          allowed: false,
          retryAfterSeconds: calculateRetryAfterSeconds(bucket.lastRefill, nowMs, opts.windowMs),
        }
      }

      bucket.tokens -= 1
      buckets.set(bucketKey, bucket)

      return {
        allowed: true,
        retryAfterSeconds: 0,
      }
    },
  }
}

function createPostgresRateLimitStore(db: DB): RateLimitStore {
  let nextCleanupAt = 0

  async function cleanupStaleBuckets(now: Date, windowMs: number) {
    const nowMs = now.getTime()
    if (nowMs < nextCleanupAt) {
      return
    }

    nextCleanupAt = nowMs + windowMs * STALE_BUCKET_TTL_MULTIPLIER
    const staleBefore = new Date(nowMs - windowMs * STALE_BUCKET_TTL_MULTIPLIER)

    await db.delete(rateLimitBuckets).where(lt(rateLimitBuckets.updatedAt, staleBefore))
  }

  return {
    async takeToken(bucketKey, now, opts) {
      await cleanupStaleBuckets(now, opts.windowMs)

      return db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${bucketKey}))`)

        const [bucket] = await tx
          .select()
          .from(rateLimitBuckets)
          .where(eq(rateLimitBuckets.bucketKey, bucketKey))
          .limit(1)

        if (!bucket) {
          await tx.insert(rateLimitBuckets).values({
            bucketKey,
            tokens: opts.maxTokens - 1,
            lastRefill: now,
            updatedAt: now,
          })

          return {
            allowed: true,
            retryAfterSeconds: 0,
          }
        }

        const nowMs = now.getTime()
        const lastRefillMs = bucket.lastRefill.getTime()
        const elapsedMs = Math.max(nowMs - lastRefillMs, 0)
        const refillWindows = Math.floor(elapsedMs / opts.windowMs)
        const availableTokens =
          refillWindows > 0
            ? Math.min(opts.maxTokens, bucket.tokens + refillWindows * opts.refillRate)
            : bucket.tokens
        const nextLastRefill = refillWindows > 0 ? now : bucket.lastRefill

        if (availableTokens <= 0) {
          await tx
            .update(rateLimitBuckets)
            .set({
              lastRefill: nextLastRefill,
              updatedAt: now,
            })
            .where(eq(rateLimitBuckets.bucketKey, bucketKey))

          return {
            allowed: false,
            retryAfterSeconds: calculateRetryAfterSeconds(
              nextLastRefill.getTime(),
              nowMs,
              opts.windowMs,
            ),
          }
        }

        await tx
          .update(rateLimitBuckets)
          .set({
            tokens: availableTokens - 1,
            lastRefill: nextLastRefill,
            updatedAt: now,
          })
          .where(eq(rateLimitBuckets.bucketKey, bucketKey))

        return {
          allowed: true,
          retryAfterSeconds: 0,
        }
      })
    },
  }
}

function createDefaultRateLimitStore(): RateLimitStore {
  if (process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL) {
    return createInMemoryRateLimitStore()
  }

  return createPostgresRateLimitStore(getDb())
}

function validateOptions(opts: RateLimitOptions) {
  if (opts.maxTokens < 1) {
    throw new Error('maxTokens must be at least 1')
  }

  if (opts.refillRate < 1) {
    throw new Error('refillRate must be at least 1')
  }

  if (opts.windowMs < 1) {
    throw new Error('windowMs must be at least 1')
  }

  if (opts.backendTimeoutMs !== undefined && opts.backendTimeoutMs < 1) {
    throw new Error('backendTimeoutMs must be at least 1')
  }
}

function withBackendTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new RateLimitBackendTimeoutError(timeoutMs))
    }, timeoutMs)

    promise.then(
      (value) => {
        clearTimeout(timeoutId)
        resolve(value)
      },
      (error) => {
        clearTimeout(timeoutId)
        reject(error)
      },
    )
  })
}

function decisionToResponse(decision: RateLimitDecision): Response | null {
  if (decision.allowed) {
    return null
  }

  return new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(decision.retryAfterSeconds),
    },
  })
}

/**
 * Builds the shared token-take loop used by every limiter variant. The returned
 * runner accepts a precomputed bucket key (IP-derived or identifier-derived) and
 * owns the store-fallback state, so all variants share the same Postgres ->
 * in-memory failover behavior without duplicating orchestration.
 */
function createRateLimitRunner(opts: RateLimitOptions, store?: RateLimitStore) {
  validateOptions(opts)
  const backendTimeoutMs = opts.backendTimeoutMs ?? DEFAULT_BACKEND_TIMEOUT_MS
  const fallbackStore = createInMemoryRateLimitStore()
  let activeStore = store
  let temporaryFallbackUntilMs = 0
  let warnedAboutStoreFallback = false

  return async function takeToken(bucketKey: string): Promise<RateLimitDecision> {
    const now = new Date()
    const nowMs = now.getTime()

    try {
      if (nowMs < temporaryFallbackUntilMs) {
        return await fallbackStore.takeToken(bucketKey, now, opts)
      }

      const currentStore =
        activeStore ??
        (shouldUseRequestScopedStore()
          ? createDefaultRateLimitStore()
          : (activeStore ??= createDefaultRateLimitStore()))

      const decision = await withBackendTimeout(
        currentStore.takeToken(bucketKey, now, opts),
        backendTimeoutMs,
      )
      temporaryFallbackUntilMs = 0
      return decision
    } catch (error) {
      if (!warnedAboutStoreFallback) {
        warnedAboutStoreFallback = true
        // Intentionally avoid request-path logging here. In Cloudflare Workers,
        // buffered writes can cross request boundaries and crash later requests
        // with cross-request I/O errors.
      }

      if (
        error instanceof RateLimitBackendTimeoutError ||
        isMissingRateLimitBucketTableError(error)
      ) {
        if (error instanceof RateLimitBackendTimeoutError) {
          temporaryFallbackUntilMs = nowMs + opts.windowMs
        } else {
          activeStore = fallbackStore
        }
      }

      return fallbackStore.takeToken(bucketKey, now, opts)
    }
  }
}

/**
 * Creates a rate limit middleware function for a given configuration.
 * Uses a shared Postgres-backed bucket store when DATABASE_URL is present,
 * and falls back to an in-memory store in tests or local no-DB contexts.
 */
export function createRateLimitMiddleware(
  opts: RateLimitOptions,
  store?: RateLimitStore,
) {
  const keyPrefix = opts.keyPrefix ?? 'global'
  const run = createRateLimitRunner(opts, store)

  return async function rateLimitMiddleware(request: Request): Promise<Response | null> {
    if (isRateLimitDisabled()) {
      return null
    }

    const decision = await run(getBucketKey(keyPrefix, request))
    return decisionToResponse(decision)
  }
}

/**
 * Creates a rate limiter keyed on an arbitrary identifier (e.g. a normalized
 * email) rather than the request IP. Lets a single target be throttled even
 * when the abuse rotates source IPs. Shares the same store/fallback behavior
 * as {@link createRateLimitMiddleware}.
 */
export function createIdentifierRateLimitMiddleware(
  opts: RateLimitOptions,
  store?: RateLimitStore,
) {
  const keyPrefix = opts.keyPrefix ?? 'global'
  const run = createRateLimitRunner(opts, store)

  return async function identifierRateLimit(identifier: string): Promise<Response | null> {
    if (isRateLimitDisabled()) {
      return null
    }

    const decision = await run(`${keyPrefix}:${identifier}`)
    return decisionToResponse(decision)
  }
}
