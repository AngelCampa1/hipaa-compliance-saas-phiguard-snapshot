import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyTurnstile } from './turnstile'

describe('verifyTurnstile', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('fails closed in production when the secret is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubGlobal('fetch', vi.fn())

    await expect(verifyTurnstile('token', '127.0.0.1')).resolves.toEqual({
      success: false,
      bypassed: false,
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('bypasses verification outside production when the secret is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    await expect(verifyTurnstile(undefined)).resolves.toEqual({
      success: true,
      bypassed: true,
    })
  })
})
