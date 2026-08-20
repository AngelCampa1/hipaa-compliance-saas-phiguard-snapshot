import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { createRateLimitMiddleware } from './rate-limit'

function makeRequest(ip = '1.2.3.4'): Request {
  return new Request('http://localhost/api/test', {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('createRateLimitMiddleware', () => {
  beforeEach(() => {
    // Enable proxy trust so forwarded headers are respected in existing tests
    process.env.TRUSTED_PROXY = 'true'
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    delete process.env.DISABLE_RATE_LIMIT
    delete process.env.TRUSTED_PROXY
  })

  // Regression guard (2026-06-01 outage hardening): client IP must be derived
  // from cf-connecting-ip first under a trusted proxy. Reverting to
  // x-forwarded-for-first would let buckets diverge per spoofable header and
  // weaken rate limiting behind Cloudflare. See
  // docs/adr/0018-hyperdrive-request-scoped-db.md.
  it('keys buckets on cf-connecting-ip before forwarded headers when proxy is trusted', async () => {
    const middleware = createRateLimitMiddleware({
      keyPrefix: 'cf-ip',
      maxTokens: 1,
      refillRate: 1,
      windowMs: 60_000,
    })

    const sameClientFirst = new Request('http://localhost/api/test', {
      headers: { 'cf-connecting-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' },
    })
    const sameClientSecond = new Request('http://localhost/api/test', {
      headers: { 'cf-connecting-ip': '9.9.9.9', 'x-forwarded-for': '2.2.2.2' },
    })

    // First request consumes the only token for client 9.9.9.9.
    expect(await middleware(sameClientFirst)).toBeNull()
    // Same cf-connecting-ip (despite a different x-forwarded-for) must hit the
    // same bucket and be throttled.
    const blocked = await middleware(sameClientSecond)
    expect(blocked).not.toBeNull()
    expect(blocked!.status).toBe(429)
  })

  it('allows requests under the token limit', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 5, refillRate: 5, windowMs: 60_000 })
    for (let i = 0; i < 5; i++) {
      const result = await middleware(makeRequest())
      expect(result).toBeNull()
    }
  })

  it('returns 429 after exhausting tokens', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 3, refillRate: 3, windowMs: 60_000 })
    // Exhaust the bucket
    await middleware(makeRequest())
    await middleware(makeRequest())
    await middleware(makeRequest())
    // Next request should be blocked
    const result = await middleware(makeRequest())
    expect(result).not.toBeNull()
    expect(result!.status).toBe(429)
  })

  it('429 response body contains error message', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })
    await middleware(makeRequest()) // consume the one token
    const result = (await middleware(makeRequest()))!
    const body = await result.json()
    expect(body).toEqual({ error: 'Too many requests' })
  })

  it('429 response includes Retry-After header', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })
    await middleware(makeRequest())
    const result = (await middleware(makeRequest()))!
    expect(result.headers.get('Retry-After')).toBe('60')
  })

  it('tracks different IPs independently', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 2, refillRate: 2, windowMs: 60_000 })
    // IP A uses 2 tokens
    await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '1.1.1.1' } }))
    await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '1.1.1.1' } }))
    // IP A is now exhausted
    const blockedA = await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '1.1.1.1' } }))
    expect(blockedA?.status).toBe(429)
    // IP B still has full tokens
    const allowedB = await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '2.2.2.2' } }))
    expect(allowedB).toBeNull()
  })

  it('refills tokens after the window elapses', async () => {
    vi.useFakeTimers()
    const middleware = createRateLimitMiddleware({ maxTokens: 2, refillRate: 2, windowMs: 60_000 })

    // Exhaust tokens at t=0
    await middleware(makeRequest())
    await middleware(makeRequest())
    expect((await middleware(makeRequest()))?.status).toBe(429)

    // Advance time past one full window
    vi.advanceTimersByTime(60_001)

    // Should be allowed again after refill
    const result = await middleware(makeRequest())
    expect(result).toBeNull()
  })

  it('uses "unknown" as IP key when x-forwarded-for header is absent', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })
    const req = new Request('http://localhost/')
    await middleware(req) // consume the one token for "unknown"
    const result = await middleware(req)
    expect(result?.status).toBe(429)
  })

  it('handles comma-separated x-forwarded-for and uses the first IP', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })
    const req1 = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3' },
    })
    const req2 = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })
    await middleware(req1) // consumes token for 10.0.0.1
    const result = await middleware(req2) // same IP, exhausted
    expect(result?.status).toBe(429)
  })

  it('prefers x-real-ip over forwarded-for when present', async () => {
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })
    const req1 = new Request('http://localhost/', {
      headers: {
        'x-real-ip': '203.0.113.1',
        'x-forwarded-for': '10.0.0.1',
      },
    })
    const req2 = new Request('http://localhost/', {
      headers: {
        'x-real-ip': '203.0.113.1',
        'x-forwarded-for': '10.0.0.2',
      },
    })

    await middleware(req1)
    const result = await middleware(req2)

    expect(result?.status).toBe(429)
  })

  it('evicts stale buckets to prevent unbounded Map growth', async () => {
    vi.useFakeTimers()
    const windowMs = 100
    const middleware = createRateLimitMiddleware({ maxTokens: 5, refillRate: 5, windowMs })

    // Create a bucket for IP A at t=0
    await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '10.0.0.1' } }))

    // Advance time by 3 windows - IP A's bucket is now stale
    vi.advanceTimersByTime(windowMs * 3)

    // Make a request from IP B - this triggers the eviction sweep
    await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '10.0.0.2' } }))

    // IP A should have a fresh bucket (re-created on next request), meaning its
    // old stale entry was evicted. We verify by checking it gets maxTokens again.
    const resultA = await middleware(new Request('http://localhost/', { headers: { 'x-forwarded-for': '10.0.0.1' } }))
    // If eviction happened correctly, IP A now has a fresh bucket and this request is allowed
    expect(resultA).toBeNull()
  })

  it('bypasses rate limiting when DISABLE_RATE_LIMIT is enabled', async () => {
    process.env.DISABLE_RATE_LIMIT = 'true'
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })

    await middleware(makeRequest())
    const result = await middleware(makeRequest())

    expect(result).toBeNull()
  })

  it('falls back to an in-memory store when the Postgres bucket table is missing', async () => {
    const failingStore = {
      takeToken: vi.fn().mockRejectedValue(
        Object.assign(new Error('relation "rate_limit_buckets" does not exist'), {
          code: '42P01',
        }),
      ),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 1, refillRate: 1, windowMs: 60_000 },
      failingStore,
    )

    const first = await middleware(makeRequest())
    const second = await middleware(makeRequest())

    expect(first).toBeNull()
    expect(second?.status).toBe(429)
    expect(failingStore.takeToken).toHaveBeenCalledTimes(1)
  })

  it('falls back to an in-memory store when the missing table error is wrapped', async () => {
    const failingStore = {
      takeToken: vi.fn().mockRejectedValue(
        Object.assign(new Error('Failed query'), {
          cause: Object.assign(new Error('relation "rate_limit_buckets" does not exist'), {
            code: '42P01',
          }),
        }),
      ),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 1, refillRate: 1, windowMs: 60_000 },
      failingStore,
    )

    const first = await middleware(makeRequest())
    const second = await middleware(makeRequest())

    expect(first).toBeNull()
    expect(second?.status).toBe(429)
    expect(failingStore.takeToken).toHaveBeenCalledTimes(1)
  })

  it('falls back when the backend store times out', async () => {
    vi.useFakeTimers()

    const stalledStore = {
      takeToken: vi.fn(() => new Promise<never>(() => {})),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 1, refillRate: 1, windowMs: 60_000, backendTimeoutMs: 250 },
      stalledStore,
    )

    const pendingResult = middleware(makeRequest())
    await vi.advanceTimersByTimeAsync(250)
    const result = await pendingResult

    expect(result).toBeNull()
    expect(stalledStore.takeToken).toHaveBeenCalledTimes(1)
  })

  it('sticks to the in-memory fallback after the first backend timeout', async () => {
    vi.useFakeTimers()

    const stalledStore = {
      takeToken: vi.fn(() => new Promise<never>(() => {})),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 1, refillRate: 1, windowMs: 60_000, backendTimeoutMs: 250 },
      stalledStore,
    )

    const firstAttempt = middleware(makeRequest())
    await vi.advanceTimersByTimeAsync(250)
    expect(await firstAttempt).toBeNull()

    const secondAttempt = await middleware(makeRequest())

    expect(secondAttempt?.status).toBe(429)
    expect(stalledStore.takeToken).toHaveBeenCalledTimes(1)
  })

  it('retries the backend after the timeout fallback cooldown expires', async () => {
    vi.useFakeTimers()

    const recoveringStore = {
      takeToken: vi
        .fn()
        .mockImplementationOnce(() => new Promise<never>(() => {}))
        .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 }),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 2, refillRate: 2, windowMs: 1_000, backendTimeoutMs: 250 },
      recoveringStore,
    )

    const firstAttempt = middleware(makeRequest())
    await vi.advanceTimersByTimeAsync(250)
    expect(await firstAttempt).toBeNull()

    expect(await middleware(makeRequest())).toBeNull()
    expect(recoveringStore.takeToken).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1_000)

    expect(await middleware(makeRequest())).toBeNull()
    expect(recoveringStore.takeToken).toHaveBeenCalledTimes(2)
  })

  it('preserves 429 behavior when the active store responds normally', async () => {
    const healthyStore = {
      takeToken: vi
        .fn()
        .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 })
        .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 17 }),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 1, refillRate: 1, windowMs: 60_000, backendTimeoutMs: 250 },
      healthyStore,
    )

    expect(await middleware(makeRequest())).toBeNull()

    const blocked = await middleware(makeRequest())

    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get('Retry-After')).toBe('17')
    expect(healthyStore.takeToken).toHaveBeenCalledTimes(2)
  })

  it('does not permanently stick to the fallback after a transient backend error', async () => {
    const recoveringStore = {
      takeToken: vi
        .fn()
        .mockRejectedValueOnce(new Error('temporary network error'))
        .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 })
        .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 9 }),
    }
    const middleware = createRateLimitMiddleware(
      { maxTokens: 1, refillRate: 1, windowMs: 60_000, backendTimeoutMs: 250 },
      recoveringStore,
    )

    expect(await middleware(makeRequest())).toBeNull()
    expect(await middleware(makeRequest())).toBeNull()

    const blocked = await middleware(makeRequest())

    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get('Retry-After')).toBe('9')
    expect(recoveringStore.takeToken).toHaveBeenCalledTimes(3)
  })

  it('ignores x-forwarded-for when TRUSTED_PROXY is not set', async () => {
    delete process.env.TRUSTED_PROXY

    // With maxTokens: 1, a second request from the same bucket should be blocked.
    // Without TRUSTED_PROXY, both requests from different spoofed IPs fall into the
    // same "unknown" bucket, so the second request is rate-limited.
    const middleware = createRateLimitMiddleware({ maxTokens: 1, refillRate: 1, windowMs: 60_000 })

    const req1 = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    })
    const req2 = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '2.2.2.2' },
    })

    await middleware(req1) // consumes the one token for "unknown"
    const result = await middleware(req2) // also "unknown" - bucket exhausted

    expect(result?.status).toBe(429)
  })
})
