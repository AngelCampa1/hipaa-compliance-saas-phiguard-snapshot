import { randomBytes } from 'node:crypto'
import { getDb, sessions } from '@phiguard/db/server'
import { serializeSignedCookie } from 'better-call'
import { getBetterAuthCookieName, shouldUseSecureCookies } from './lib/cookies.js'
import { requireAuthSecret } from './lib/secrets.js'

export async function createSessionBootstrapCookie(
  userId: string,
  options?: {
    activeOrganizationId?: string
  },
): Promise<string> {
  const db = getDb()
  const secret = requireAuthSecret()
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const sessionId = randomBytes(16).toString('hex')

  await db.insert(sessions).values({
    id: sessionId,
    activeOrganizationId: options?.activeOrganizationId ?? null,
    userId,
    token,
    expiresAt,
    ipAddress: '',
    userAgent: '',
  })

  return serializeSignedCookie(
    getBetterAuthCookieName('session_token'),
    token,
    secret,
    {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: shouldUseSecureCookies(),
    },
  )
}
