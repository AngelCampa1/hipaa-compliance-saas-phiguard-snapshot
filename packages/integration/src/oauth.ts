import { createHash, randomBytes } from 'node:crypto'

export type OAuthProvider = 'google' | 'microsoft'

interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  tenantId?: string // Microsoft only
}

function requireConfigValue(
  provider: OAuthProvider,
  name: keyof OAuthConfig,
  value: string | undefined,
): string {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  const envName =
    provider === 'google'
      ? `GOOGLE_OAUTH_${name === 'clientId' ? 'CLIENT_ID' : name === 'clientSecret' ? 'CLIENT_SECRET' : 'REDIRECT_URI'}`
      : `MICROSOFT_OAUTH_${name === 'clientId' ? 'CLIENT_ID' : name === 'clientSecret' ? 'CLIENT_SECRET' : 'REDIRECT_URI'}`

  throw new Error(`OAuth provider ${provider} is not configured: missing ${envName}`)
}

function getConfig(provider: OAuthProvider): OAuthConfig {
  if (provider === 'google') {
    return {
      clientId: requireConfigValue(provider, 'clientId', process.env.GOOGLE_OAUTH_CLIENT_ID),
      clientSecret: requireConfigValue(
        provider,
        'clientSecret',
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      ),
      redirectUri: requireConfigValue(
        provider,
        'redirectUri',
        process.env.GOOGLE_OAUTH_REDIRECT_URI,
      ),
    }
  }
  return {
    clientId: requireConfigValue(provider, 'clientId', process.env.MICROSOFT_OAUTH_CLIENT_ID),
    clientSecret: requireConfigValue(
      provider,
      'clientSecret',
      process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
    ),
    redirectUri: requireConfigValue(
      provider,
      'redirectUri',
      process.env.MICROSOFT_OAUTH_REDIRECT_URI,
    ),
    tenantId: process.env.MICROSOFT_TENANT_ID ?? 'common',
  }
}

export function generatePkce(): {
  codeVerifier: string
  codeChallenge: string
} {
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

const GOOGLE_SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events']

const MICROSOFT_SCOPES = ['openid', 'email', 'Calendars.ReadWrite', 'offline_access']

export function buildAuthorizeUrl(
  provider: OAuthProvider,
  state: string,
  codeChallenge: string,
): string {
  const cfg = getConfig(provider)
  const scopes = provider === 'google' ? GOOGLE_SCOPES : MICROSOFT_SCOPES

  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/authorize?${params}`
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scopes: string[]
  accountEmail: string
}

export interface RefreshedTokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scopes: string[]
}

export async function exchangeCode(
  provider: OAuthProvider,
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const cfg = getConfig(provider)

  const tokenUrl =
    provider === 'google'
      ? 'https://oauth2.googleapis.com/token'
      : `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
    code,
    code_verifier: codeVerifier,
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth token exchange failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    scope?: string
    id_token?: string
  }

  if (typeof data.access_token !== 'string' || data.access_token.length === 0) {
    throw new Error(`OAuth token exchange failed: ${provider} did not return an access token`)
  }

  if (typeof data.refresh_token !== 'string' || data.refresh_token.length === 0) {
    throw new Error(`OAuth token exchange failed: ${provider} did not return a refresh token`)
  }

  if (typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) || data.expires_in <= 0) {
    throw new Error(`OAuth token exchange failed: ${provider} did not return a valid expiry`)
  }

  // Decode email from id_token (JWT, no verification needed because we trust the provider).
  const accountEmail = extractEmailFromIdToken(data.id_token ?? '')
  if (!accountEmail) {
    throw new Error(`OAuth token exchange failed: ${provider} did not return an account email`)
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scopes: data.scope ? data.scope.split(' ').filter(Boolean) : [],
    accountEmail,
  }
}

export async function refreshAccessToken(
  provider: OAuthProvider,
  refreshToken: string,
  fetchImpl: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<RefreshedTokenResponse> {
  const cfg = getConfig(provider)

  const tokenUrl =
    provider === 'google'
      ? 'https://oauth2.googleapis.com/token'
      : `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await fetchImpl(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth token refresh failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }

  if (typeof data.access_token !== 'string' || data.access_token.length === 0) {
    throw new Error(`OAuth token refresh failed: ${provider} did not return an access token`)
  }

  if (typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) || data.expires_in <= 0) {
    throw new Error(`OAuth token refresh failed: ${provider} did not return a valid expiry`)
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(now().getTime() + data.expires_in * 1000),
    scopes: data.scope ? data.scope.split(' ').filter(Boolean) : [],
  }
}

function extractEmailFromIdToken(idToken: string): string {
  if (!idToken) return ''
  try {
    const parts = idToken.split('.')
    if (parts.length !== 3) return ''
    const payload = parts[1]
    if (!payload) return ''
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: unknown
      preferred_username?: unknown
    }
    const email = decoded.email ?? decoded.preferred_username
    return typeof email === 'string' && email.length > 0 ? email : ''
  } catch {
    return ''
  }
}
