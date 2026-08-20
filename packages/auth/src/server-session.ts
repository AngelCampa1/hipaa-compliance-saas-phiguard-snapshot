import type { Session, User } from 'better-auth'
import { parseCookies, serializeSignedCookie } from 'better-call'
import { and, eq, gt } from 'drizzle-orm'
import { getDb, sessions, users } from '@phiguard/db/server'
import { authOptions } from './auth.js'
import { getBetterAuthCookieName, shouldUseSecureCookies } from './lib/cookies.js'
import { requireAuthSecret } from './lib/secrets.js'

export type ResolvedServerSession = {
  setCookieHeaders?: string[]
  session: Session & {
    activeOrganizationId?: string | null
  }
  user: User
}

const DEFAULT_SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7
const DEFAULT_SESSION_UPDATE_AGE_SECONDS = 1440 * 60
const authCookieOptions = authOptions as {
  advanced?: {
    cookiePrefix?: string
    useSecureCookies?: boolean
  }
  session?: {
    expiresIn?: number
    updateAge?: number
  }
}
function getCookieName(name: string) {
  return getBetterAuthCookieName(name)
}

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: shouldUseSecureCookies(),
  }
}

function getSessionCookieValue(headers: Headers) {
  const cookieHeader = headers.get('cookie')

  if (!cookieHeader) {
    return {
      cookies: null,
      sessionCookieValue: null,
    }
  }

  const cookies = parseCookies(cookieHeader)
  return {
    cookies,
    sessionCookieValue: cookies.get(getCookieName('session_token')) ?? null,
  }
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['verify'],
  )
}

async function extractVerifiedSessionToken(cookieValue: string, secret: string) {
  const signatureStart = cookieValue.lastIndexOf('.')
  if (signatureStart < 1) {
    return null
  }

  const token = cookieValue.slice(0, signatureStart)
  const signatureBase64 = cookieValue.slice(signatureStart + 1)
  if (!signatureBase64) {
    return null
  }

  try {
    const signatureBinary = atob(signatureBase64)
    const signature = Uint8Array.from(signatureBinary, (char) => char.charCodeAt(0))
    const signingKey = await importSigningKey(secret)
    const isValid = await crypto.subtle.verify(
      'HMAC',
      signingKey,
      signature,
      new TextEncoder().encode(token),
    )

    return isValid ? token : null
  } catch {
    return null
  }
}

export async function resolveSessionFromHeaders(
  headers: Headers,
): Promise<ResolvedServerSession | null> {
  const { cookies, sessionCookieValue } = getSessionCookieValue(headers)
  const dontRememberMe = cookies?.get(getCookieName('dont_remember')) != null

  if (!sessionCookieValue) {
    return null
  }

  const cookieValue = sessionCookieValue
  if (!cookieValue) {
    return null
  }

  const token = await extractVerifiedSessionToken(cookieValue, requireAuthSecret())
  if (!token) {
    return null
  }

  const [record] = await getDb()
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!record) {
    return null
  }

  const expiresInSeconds =
    authCookieOptions.session?.expiresIn ?? DEFAULT_SESSION_EXPIRES_IN_SECONDS
  const updateAgeSeconds =
    authCookieOptions.session?.updateAge ?? DEFAULT_SESSION_UPDATE_AGE_SECONDS
  const shouldRefresh =
    !dontRememberMe
    && record.session.expiresAt.valueOf() - expiresInSeconds * 1000 + updateAgeSeconds * 1000 <= Date.now()

  let resolvedSession = {
    ...record.session,
  }
  let setCookieHeaders: string[] | undefined

  if (shouldRefresh) {
    const refreshedExpiresAt = new Date(Date.now() + expiresInSeconds * 1000)
    const refreshedUpdatedAt = new Date()

    await getDb()
      .update(sessions)
      .set({
        expiresAt: refreshedExpiresAt,
        updatedAt: refreshedUpdatedAt,
      })
      .where(eq(sessions.id, record.session.id))

    resolvedSession = {
      ...resolvedSession,
      expiresAt: refreshedExpiresAt,
      updatedAt: refreshedUpdatedAt,
    }
    setCookieHeaders = [
      await serializeSignedCookie(
        getCookieName('session_token'),
        record.session.token,
        requireAuthSecret(),
        {
          ...getAuthCookieOptions(),
          maxAge: expiresInSeconds,
        },
      ),
    ]
  }

  return {
    setCookieHeaders,
    session: resolvedSession,
    user: {
      ...record.user,
      name: record.user.name ?? '',
    },
  } satisfies ResolvedServerSession
}
