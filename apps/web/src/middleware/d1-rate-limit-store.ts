import { eq, lt } from 'drizzle-orm'
import { getMarketingDb, rateLimitBuckets } from '@phiguard/marketing-db/server'
import {
  calculateRetryAfterSeconds,
  type RateLimitStore,
} from './rate-limit.js'

// Delete buckets untouched for this many windows. Mirrors the Postgres store so
// the two backends age out abandoned keys on the same schedule.
const STALE_BUCKET_TTL_MULTIPLIER = 10

/**
 * Cloudflare D1-backed token-bucket store for the marketing lead-capture
 * limiters. Keeps marketing abuse protection on the same Cloudflare D1 database
 * as the leads it guards, so throttling never wakes Neon.
 *
 * Unlike {@link createPostgresRateLimitStore}, this store has no
 * `pg_advisory_xact_lock` or wrapping interactive transaction — drizzle's D1
 * driver does not support them. It uses a sequential read -> conditional write
 * instead. The small read-modify-write race is acceptable for low-volume
 * marketing abuse protection, and the runner already fails open to its
 * in-memory store on any error.
 *
 * The D1 binding is set per request via `setMarketingDbBinding`, so
 * `getMarketingDb()` is resolved lazily inside `takeToken` rather than at
 * construction time.
 */
export function createD1RateLimitStore(): RateLimitStore {
  // Module-singleton closure state: the store is constructed once, but the D1
  // binding rotates per request. Stale-bucket cleanup cadence is therefore
  // process-global by design — every request shares the same D1 database, so a
  // single throttled DELETE per isolate is correct.
  let nextCleanupAt = 0

  async function cleanupStaleBuckets(
    db: ReturnType<typeof getMarketingDb>,
    now: Date,
    windowMs: number,
  ) {
    const nowMs = now.getTime()
    if (nowMs < nextCleanupAt) {
      return
    }

    nextCleanupAt = nowMs + windowMs * STALE_BUCKET_TTL_MULTIPLIER
    const staleBefore = new Date(nowMs - windowMs * STALE_BUCKET_TTL_MULTIPLIER).toISOString()

    await db.delete(rateLimitBuckets).where(lt(rateLimitBuckets.updatedAt, staleBefore))
  }

  return {
    async takeToken(bucketKey, now, opts) {
      const db = getMarketingDb()
      await cleanupStaleBuckets(db, now, opts.windowMs)

      const nowMs = now.getTime()
      const nowIso = now.toISOString()

      const [bucket] = await db
        .select()
        .from(rateLimitBuckets)
        .where(eq(rateLimitBuckets.bucketKey, bucketKey))
        .limit(1)

      if (!bucket) {
        // First request for this key. ON CONFLICT covers the race where a
        // concurrent request inserted the row between our select and insert:
        // we accept the request and only touch updated_at rather than
        // double-decrementing.
        await db
          .insert(rateLimitBuckets)
          .values({
            bucketKey,
            tokens: opts.maxTokens - 1,
            lastRefill: nowIso,
            updatedAt: nowIso,
          })
          .onConflictDoUpdate({
            target: rateLimitBuckets.bucketKey,
            set: { updatedAt: nowIso },
          })

        return {
          allowed: true,
          retryAfterSeconds: 0,
        }
      }

      const lastRefillMs = new Date(bucket.lastRefill).getTime()
      const elapsedMs = Math.max(nowMs - lastRefillMs, 0)
      const refillWindows = Math.floor(elapsedMs / opts.windowMs)
      const availableTokens =
        refillWindows > 0
          ? Math.min(opts.maxTokens, bucket.tokens + refillWindows * opts.refillRate)
          : bucket.tokens
      const nextLastRefillIso = refillWindows > 0 ? nowIso : bucket.lastRefill

      if (availableTokens <= 0) {
        await db
          .update(rateLimitBuckets)
          .set({
            lastRefill: nextLastRefillIso,
            updatedAt: nowIso,
          })
          .where(eq(rateLimitBuckets.bucketKey, bucketKey))

        return {
          allowed: false,
          retryAfterSeconds: calculateRetryAfterSeconds(
            new Date(nextLastRefillIso).getTime(),
            nowMs,
            opts.windowMs,
          ),
        }
      }

      await db
        .update(rateLimitBuckets)
        .set({
          tokens: availableTokens - 1,
          lastRefill: nextLastRefillIso,
          updatedAt: nowIso,
        })
        .where(eq(rateLimitBuckets.bucketKey, bucketKey))

      return {
        allowed: true,
        retryAfterSeconds: 0,
      }
    },
  }
}
