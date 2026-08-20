import { logger } from '@phiguard/audit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AUTH_LOCKOUT_THRESHOLD,
  createInMemoryAuthLockoutStore,
  getLoginLockoutState,
  normalizeLoginIdentifier,
  recordFailedLoginForIdentifier,
  resetLoginLockoutForIdentifier,
} from './auth-lockout'

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('@phiguard/audit')
  vi.doUnmock('@phiguard/db/server')
})

describe('auth lockout', () => {
  it('normalizes login identifiers without preserving email case', () => {
    expect(normalizeLoginIdentifier(' User@Example.COM ')).toBe('user@example.com')
  })

  it('locks an identifier after repeated failed attempts in the same window', async () => {
    const store = createInMemoryAuthLockoutStore()
    const now = new Date('2026-05-20T12:00:00Z')

    for (let i = 0; i < AUTH_LOCKOUT_THRESHOLD; i += 1) {
      await recordFailedLoginForIdentifier('owner@example.com', { store, now })
    }

    const state = await getLoginLockoutState('OWNER@example.com', { store, now })

    expect(state.locked).toBe(true)
    expect(state.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('resets failed attempts after a successful sign-in', async () => {
    const store = createInMemoryAuthLockoutStore()
    const now = new Date('2026-05-20T12:00:00Z')

    await recordFailedLoginForIdentifier('owner@example.com', { store, now })
    await resetLoginLockoutForIdentifier('owner@example.com', { store })

    const state = await getLoginLockoutState('owner@example.com', { store, now })

    expect(state.locked).toBe(false)
    expect(state.retryAfterSeconds).toBe(0)
  })

  it('fails open when the lockout store is unavailable', async () => {
    const warn = vi.spyOn(logger.safe, 'warn').mockImplementation(() => undefined)
    const store = {
      async get() {
        throw new Error('database unavailable for owner@example.com')
      },
      async recordFailure() {
        throw new Error('database unavailable for owner@example.com')
      },
      async delete() {
        throw new Error('database unavailable for owner@example.com')
      },
    }

    await expect(
      getLoginLockoutState('owner@example.com', { store }),
    ).resolves.toEqual({
      locked: false,
      retryAfterSeconds: 0,
    })
    await expect(recordFailedLoginForIdentifier('owner@example.com', { store })).resolves.toBe(
      undefined,
    )
    await expect(resetLoginLockoutForIdentifier('owner@example.com', { store })).resolves.toBe(
      undefined,
    )

    expect(warn).toHaveBeenCalledTimes(3)
    expect(warn.mock.calls.map(([payload]) => payload)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          component: 'auth-lockout',
          name: 'Error',
          operation: 'get',
          stackHash: expect.any(String),
        }),
        expect.objectContaining({
          component: 'auth-lockout',
          name: 'Error',
          operation: 'recordFailure',
          stackHash: expect.any(String),
        }),
        expect.objectContaining({
          component: 'auth-lockout',
          name: 'Error',
          operation: 'delete',
          stackHash: expect.any(String),
        }),
      ]),
    )
    expect(JSON.stringify(warn.mock.calls)).not.toContain('owner@example.com')
    expect(JSON.stringify(warn.mock.calls)).not.toContain('database unavailable')
  })

  it('fails open when the default lockout store cannot be resolved', async () => {
    const warn = vi.fn()
    const originalDatabaseUrl = process.env.DATABASE_URL
    const originalNodeEnv = process.env.NODE_ENV
    const restoreEnv = () => {
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl
      }
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }

    vi.resetModules()
    vi.doMock('@phiguard/audit', () => ({
      logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn,
        get safe() {
          return this
        },
      },
    }))
    vi.doMock('@phiguard/db/server', () => ({
      getDb() {
        throw new Error('store unavailable for owner@example.com')
      },
      rateLimitBuckets: {},
    }))

    process.env.DATABASE_URL = 'postgres://example.invalid/phiguard'
    process.env.NODE_ENV = 'production'

    try {
      const authLockout = await import('./auth-lockout')

      await expect(authLockout.getLoginLockoutState('owner@example.com')).resolves.toEqual({
        locked: false,
        retryAfterSeconds: 0,
      })
      await expect(authLockout.recordFailedLoginForIdentifier('owner@example.com')).resolves.toBe(
        undefined,
      )
      await expect(authLockout.resetLoginLockoutForIdentifier('owner@example.com')).resolves.toBe(
        undefined,
      )
    } finally {
      restoreEnv()
    }

    expect(warn.mock.calls.map(([payload]) => payload)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ component: 'auth-lockout', operation: 'get' }),
        expect.objectContaining({ component: 'auth-lockout', operation: 'recordFailure' }),
        expect.objectContaining({ component: 'auth-lockout', operation: 'delete' }),
      ]),
    )
    expect(JSON.stringify(warn.mock.calls)).not.toContain('owner@example.com')
  })
})
