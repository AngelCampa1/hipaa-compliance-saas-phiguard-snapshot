import { describe, it, expect, afterEach } from 'vitest'
import { requireAuthSecret, requireSecret, syncBetterAuthSecretEnv } from '../lib/secrets.js'

describe('requireSecret', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  it('throws when env var is missing', () => {
    delete process.env.AUTH_SECRET
    expect(() => requireSecret('AUTH_SECRET')).toThrow(
      'Required env var AUTH_SECRET is missing or too short (min 16 chars)',
    )
  })

  it('throws when env var is set but shorter than 16 chars', () => {
    process.env.AUTH_SECRET = 'short'
    expect(() => requireSecret('AUTH_SECRET')).toThrow(
      'Required env var AUTH_SECRET is missing or too short (min 16 chars)',
    )
  })

  it('returns value when env var is set and long enough', () => {
    process.env.AUTH_SECRET = 'a-sufficiently-long-secret-value'
    expect(requireSecret('AUTH_SECRET')).toBe('a-sufficiently-long-secret-value')
  })

  it('throws when env var is exactly 15 chars (boundary: one below minimum)', () => {
    process.env.AUTH_SECRET = '123456789012345' // 15 chars
    expect(() => requireSecret('AUTH_SECRET')).toThrow(
      'Required env var AUTH_SECRET is missing or too short (min 16 chars)',
    )
  })

  it('accepts env var that is exactly 16 chars (boundary: minimum)', () => {
    process.env.AUTH_SECRET = '1234567890123456' // 16 chars
    expect(requireSecret('AUTH_SECRET')).toBe('1234567890123456')
  })

  it('prefers BETTER_AUTH_SECRET when both auth secrets are valid', () => {
    process.env.BETTER_AUTH_SECRET = 'better-auth-secret-value'
    process.env.AUTH_SECRET = 'legacy-auth-secret-value'

    expect(requireAuthSecret()).toBe('better-auth-secret-value')
  })

  it('falls back to AUTH_SECRET when BETTER_AUTH_SECRET is missing', () => {
    delete process.env.BETTER_AUTH_SECRET
    process.env.AUTH_SECRET = 'legacy-auth-secret-value'

    expect(requireAuthSecret()).toBe('legacy-auth-secret-value')
  })

  it('falls back to AUTH_SECRET when BETTER_AUTH_SECRET is too short', () => {
    process.env.BETTER_AUTH_SECRET = 'short'
    process.env.AUTH_SECRET = 'legacy-auth-secret-value'

    expect(requireAuthSecret()).toBe('legacy-auth-secret-value')
  })

  it('syncs BETTER_AUTH_SECRET from AUTH_SECRET when only the legacy secret is valid', () => {
    delete process.env.BETTER_AUTH_SECRET
    process.env.AUTH_SECRET = 'legacy-auth-secret-value'

    syncBetterAuthSecretEnv()

    expect(process.env.BETTER_AUTH_SECRET).toBe('legacy-auth-secret-value')
  })
})
