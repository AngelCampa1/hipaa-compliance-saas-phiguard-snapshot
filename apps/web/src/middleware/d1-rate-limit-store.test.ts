import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RateLimitOptions } from './rate-limit.js'

const getMarketingDbMock = vi.fn()

// Replace only getMarketingDb; keep the real schema exports so the store's
// drizzle eq()/lt() conditions are built against real columns.
vi.mock('@phiguard/marketing-db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/marketing-db/server')>(
    '@phiguard/marketing-db/server',
  )
  return { ...actual, getMarketingDb: getMarketingDbMock }
})

/**
 * Minimal stand-in for the drizzle D1 client. Each test exercises a single
 * bucket key, so the fake stores at most one row and ignores the (real) drizzle
 * conditions the store passes — which keeps the token-bucket math under test
 * without reimplementing a SQL engine.
 */
function createFakeMarketingDb() {
  const rows = new Map<string, Record<string, unknown>>()
  let rejectSelectWith: Error | null = null

  const resolved = <T>(value: T) => Promise.resolve(value)

  return {
    rows,
    rejectSelectOnceWith(error: Error) {
      rejectSelectWith = error
    },
    delete() {
      return { where: () => resolved(undefined) }
    },
    select() {
      return {
        from() {
          return {
            where() {
              return {
                limit() {
                  if (rejectSelectWith) {
                    const error = rejectSelectWith
                    rejectSelectWith = null
                    return Promise.reject(error)
                  }
                  const all = [...rows.values()]
                  return resolved(all.length ? [all[0]] : [])
                },
              }
            },
          }
        },
      }
    },
    insert() {
      return {
        values(value: Record<string, unknown>) {
          return {
            onConflictDoUpdate() {
              const key = value.bucketKey as string
              if (!rows.has(key)) {
                rows.set(key, { ...value })
              }
              return resolved(undefined)
            },
          }
        },
      }
    },
    update() {
      return {
        set(patch: Record<string, unknown>) {
          return {
            where() {
              const [first] = [...rows.entries()]
              if (first) {
                rows.set(first[0], { ...first[1], ...patch })
              }
              return resolved(undefined)
            },
          }
        },
      }
    },
  }
}

describe('createD1RateLimitStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves the D1 binding lazily inside takeToken, not at construction', async () => {
    const { createD1RateLimitStore } = await import('./d1-rate-limit-store.js')
    const store = createD1RateLimitStore()
    expect(getMarketingDbMock).not.toHaveBeenCalled()

    getMarketingDbMock.mockReturnValue(createFakeMarketingDb())
    await store.takeToken('leads:1.2.3.4', new Date('2026-06-03T00:00:00.000Z'), {
      keyPrefix: 'leads',
      maxTokens: 5,
      refillRate: 3,
      windowMs: 60_000,
    })
    expect(getMarketingDbMock).toHaveBeenCalledOnce()
  })

  it('allows exactly maxTokens requests in a window, then denies', async () => {
    const fakeDb = createFakeMarketingDb()
    getMarketingDbMock.mockReturnValue(fakeDb)

    const { createD1RateLimitStore } = await import('./d1-rate-limit-store.js')
    const store = createD1RateLimitStore()
    const opts: RateLimitOptions = {
      keyPrefix: 'leads',
      maxTokens: 3,
      refillRate: 1,
      windowMs: 60_000,
    }
    const now = new Date('2026-06-03T00:00:00.000Z')

    const first = await store.takeToken('leads:k', now, opts)
    const second = await store.takeToken('leads:k', now, opts)
    const third = await store.takeToken('leads:k', now, opts)
    const fourth = await store.takeToken('leads:k', now, opts)

    expect([first.allowed, second.allowed, third.allowed]).toEqual([true, true, true])
    expect(fourth.allowed).toBe(false)
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('refills tokens after a full window elapses', async () => {
    const fakeDb = createFakeMarketingDb()
    getMarketingDbMock.mockReturnValue(fakeDb)

    const { createD1RateLimitStore } = await import('./d1-rate-limit-store.js')
    const store = createD1RateLimitStore()
    const opts: RateLimitOptions = {
      keyPrefix: 'leads',
      maxTokens: 1,
      refillRate: 1,
      windowMs: 1_000,
    }

    const t0 = new Date('2026-06-03T00:00:00.000Z')
    const allowed = await store.takeToken('leads:k', t0, opts)
    const deniedSameInstant = await store.takeToken('leads:k', t0, opts)
    const afterRefill = await store.takeToken(
      'leads:k',
      new Date(t0.getTime() + 1_000),
      opts,
    )

    expect(allowed.allowed).toBe(true)
    expect(deniedSameInstant.allowed).toBe(false)
    expect(afterRefill.allowed).toBe(true)
  })

  it('propagates store errors so the runner can fail open', async () => {
    const fakeDb = createFakeMarketingDb()
    fakeDb.rejectSelectOnceWith(new Error('D1 unavailable'))
    getMarketingDbMock.mockReturnValue(fakeDb)
    // Seed a row so the read path (not the insert path) is exercised.
    fakeDb.rows.set('leads:k', {
      bucketKey: 'leads:k',
      tokens: 1,
      lastRefill: '2026-06-03T00:00:00.000Z',
      updatedAt: '2026-06-03T00:00:00.000Z',
    })

    const { createD1RateLimitStore } = await import('./d1-rate-limit-store.js')
    const store = createD1RateLimitStore()

    await expect(
      store.takeToken('leads:k', new Date('2026-06-03T00:00:01.000Z'), {
        keyPrefix: 'leads',
        maxTokens: 3,
        refillRate: 1,
        windowMs: 60_000,
      }),
    ).rejects.toThrow('D1 unavailable')
  })
})
