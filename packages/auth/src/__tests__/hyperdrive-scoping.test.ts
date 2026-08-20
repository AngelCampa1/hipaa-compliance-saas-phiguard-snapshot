import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Regression guard for the 2026-06-01 production outage. getAuth() must build a
// fresh better-auth instance per request under Hyperdrive so the underlying DB
// client is never reused across Worker requests. A cached _auth instance reused
// its DB client and caused intermittent sign-in 500s after deploy. Off Hyperdrive
// the singleton is correct. See docs/adr/0018-hyperdrive-request-scoped-db.md.

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

const HYPERDRIVE_URL = 'postgres://user:pass@phiguard.hyperdrive.local:5432/phiguard'
const DIRECT_URL = 'postgres://postgres:postgres@127.0.0.1:5432/phiguard_test'

describe('getAuth Hyperdrive request scoping', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const originalBetterAuthSecret = process.env.BETTER_AUTH_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret'
    // better-auth's drizzle adapter only needs an object here; it is not queried
    // at construction time, which is all getAuth() exercises.
    getDbMock.mockReturnValue({})
  })

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }
    if (originalBetterAuthSecret === undefined) {
      delete process.env.BETTER_AUTH_SECRET
    } else {
      process.env.BETTER_AUTH_SECRET = originalBetterAuthSecret
    }
    vi.resetModules()
  })

  it('returns a fresh auth instance per call under Hyperdrive', async () => {
    process.env.DATABASE_URL = HYPERDRIVE_URL
    vi.resetModules()
    const { getAuth } = await import('../auth.js')

    expect(getAuth()).not.toBe(getAuth())
  }, 60_000)

  it('caches a singleton auth instance when not on Hyperdrive', async () => {
    process.env.DATABASE_URL = DIRECT_URL
    vi.resetModules()
    const { getAuth } = await import('../auth.js')

    const first = getAuth()
    expect(getAuth()).toBe(first)
  }, 30_000)
})
