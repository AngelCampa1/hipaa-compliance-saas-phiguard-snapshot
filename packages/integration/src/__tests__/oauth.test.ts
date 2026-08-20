import { afterEach, describe, it, expect, vi } from 'vitest'
import { buildAuthorizeUrl, generatePkce, exchangeCode } from '../oauth.js'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('generatePkce', () => {
  it('returns codeVerifier and codeChallenge', () => {
    const { codeVerifier, codeChallenge } = generatePkce()
    expect(codeVerifier.length).toBeGreaterThan(30)
    expect(codeChallenge.length).toBeGreaterThan(30)
    expect(codeVerifier).not.toBe(codeChallenge)
  })
})

describe('buildAuthorizeUrl', () => {
  it('includes PKCE params and state for Google', () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')
    const { codeChallenge } = generatePkce()
    const url = buildAuthorizeUrl('google', 'my-state', codeChallenge)
    expect(url).toContain('accounts.google.com')
    expect(url).toContain('state=my-state')
    expect(url).toContain('code_challenge_method=S256')
  })

  it('uses Microsoft endpoint for microsoft provider', () => {
    vi.stubEnv('MICROSOFT_OAUTH_CLIENT_ID', 'test-ms')
    vi.stubEnv('MICROSOFT_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('MICROSOFT_OAUTH_REDIRECT_URI', 'http://localhost/callback')
    vi.stubEnv('MICROSOFT_TENANT_ID', 'common')
    const { codeChallenge } = generatePkce()
    const url = buildAuthorizeUrl('microsoft', 'state', codeChallenge)
    expect(url).toContain('microsoftonline.com')
  })

  it('fails before building a provider redirect when required config is missing', () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', '')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const { codeChallenge } = generatePkce()

    expect(() => buildAuthorizeUrl('google', 'my-state', codeChallenge)).toThrow(
      'OAuth provider google is not configured: missing GOOGLE_OAUTH_CLIENT_SECRET',
    )
  })
})

describe('exchangeCode', () => {
  it('calls the token endpoint and returns token response', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    // Minimal JWT-like id_token with email claim (base64url encoded)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ email: 'test@example.com', sub: '123' })).toString(
      'base64url',
    )
    const fakeIdToken = `${header}.${payload}.fakesig`

    const mockResponse = {
      access_token: 'access-token-value',
      refresh_token: 'refresh-token-value',
      expires_in: 3600,
      scope: 'openid email https://www.googleapis.com/auth/calendar.events',
      id_token: fakeIdToken,
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response)

    const result = await exchangeCode('google', 'auth-code', 'code-verifier')

    expect(result.accessToken).toBe('access-token-value')
    expect(result.refreshToken).toBe('refresh-token-value')
    expect(result.accountEmail).toBe('test@example.com')
    expect(result.scopes).toContain('openid')
    expect(result.expiresAt).toBeInstanceOf(Date)
  })

  it('throws on non-200 token response', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"error":"invalid_grant"}',
    } as unknown as Response)
    await expect(exchangeCode('google', 'bad-code', 'verifier')).rejects.toThrow(
      /OAuth token exchange failed/,
    )
  })

  it('throws when the provider omits refresh_token', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'access-token-value',
        expires_in: 3600,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
      }),
    } as unknown as Response)

    await expect(exchangeCode('google', 'auth-code', 'code-verifier')).rejects.toThrow(
      'OAuth token exchange failed: google did not return a refresh token',
    )
  })

  it('throws when the provider omits access_token', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        refresh_token: 'refresh-token-value',
        expires_in: 3600,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
      }),
    } as unknown as Response)

    await expect(exchangeCode('google', 'auth-code', 'code-verifier')).rejects.toThrow(
      'OAuth token exchange failed: google did not return an access token',
    )
  })

  it('throws when the provider returns an invalid token expiry', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'access-token-value',
        refresh_token: 'refresh-token-value',
        expires_in: 0,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
      }),
    } as unknown as Response)

    await expect(exchangeCode('google', 'auth-code', 'code-verifier')).rejects.toThrow(
      'OAuth token exchange failed: google did not return a valid expiry',
    )
  })

  it('throws when the provider id token does not identify the account email', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ sub: '123' })).toString('base64url')
    const fakeIdToken = `${header}.${payload}.fakesig`

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'access-token-value',
        refresh_token: 'refresh-token-value',
        expires_in: 3600,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
        id_token: fakeIdToken,
      }),
    } as unknown as Response)

    await expect(exchangeCode('google', 'auth-code', 'code-verifier')).rejects.toThrow(
      'OAuth token exchange failed: google did not return an account email',
    )
  })

  it('throws when the provider id token email claim is not a string', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ email: { address: 'test@example.com' } })).toString(
      'base64url',
    )
    const fakeIdToken = `${header}.${payload}.fakesig`

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'access-token-value',
        refresh_token: 'refresh-token-value',
        expires_in: 3600,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
        id_token: fakeIdToken,
      }),
    } as unknown as Response)

    await expect(exchangeCode('google', 'auth-code', 'code-verifier')).rejects.toThrow(
      'OAuth token exchange failed: google did not return an account email',
    )
  })

  it('throws when the provider id token has a malformed segment count', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-secret')
    vi.stubEnv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost/callback')

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ email: 'test@example.com' })).toString(
      'base64url',
    )
    const fakeIdToken = `${header}.${payload}.fakesig.extra`

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'access-token-value',
        refresh_token: 'refresh-token-value',
        expires_in: 3600,
        scope: 'openid email https://www.googleapis.com/auth/calendar.events',
        id_token: fakeIdToken,
      }),
    } as unknown as Response)

    await expect(exchangeCode('google', 'auth-code', 'code-verifier')).rejects.toThrow(
      'OAuth token exchange failed: google did not return an account email',
    )
  })
})
