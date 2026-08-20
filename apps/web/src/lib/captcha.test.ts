import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyCaptcha } from './captcha'

describe('verifyCaptcha', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('fails closed in production when the secret is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CAPTCHA_SECRET_KEY', '')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubGlobal('fetch', vi.fn())

    await expect(verifyCaptcha('token', '127.0.0.1')).resolves.toEqual({
      success: false,
      bypassed: false,
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('bypasses verification outside production when the secret is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('CAPTCHA_SECRET_KEY', '')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    await expect(verifyCaptcha(undefined)).resolves.toEqual({
      success: true,
      bypassed: true,
    })
  })

  it('uses the Turnstile siteverify URL by default', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CAPTCHA_SECRET_KEY', 'secret')
    vi.stubEnv('CAPTCHA_VERIFY_URL', '')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(verifyCaptcha('token')).resolves.toEqual({
      success: true,
      bypassed: false,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('accepts the legacy Turnstile secret env name', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CAPTCHA_SECRET_KEY', '')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'legacy-secret')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }),
    )

    await expect(verifyCaptcha('token')).resolves.toEqual({
      success: true,
      bypassed: false,
    })
  })
})
