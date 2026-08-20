import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getDbMock,
  dbSelectMock,
  dbFromMock,
  dbInnerJoinMock,
  dbWhereMock,
  dbLimitMock,
  dbUpdateMock,
  dbUpdateSetMock,
  dbUpdateWhereMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  dbSelectMock: vi.fn(),
  dbFromMock: vi.fn(),
  dbInnerJoinMock: vi.fn(),
  dbWhereMock: vi.fn(),
  dbLimitMock: vi.fn(),
  dbUpdateMock: vi.fn(),
  dbUpdateSetMock: vi.fn(),
  dbUpdateWhereMock: vi.fn(),
}))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

import { resolveSessionFromHeaders } from '../server-session.js'

describe('resolveSessionFromHeaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    dbLimitMock.mockResolvedValue([
      {
        session: {
          id: 'sess-1',
          userId: 'user-1',
          token: 'token-123',
          expiresAt: new Date('2099-01-01T00:00:00.000Z'),
          activeOrganizationId: 'org-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        user: {
          id: 'user-1',
          email: 'owner@example.com',
          emailVerified: true,
          name: 'Owner',
          image: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      },
    ])
    dbWhereMock.mockReturnValue({ limit: dbLimitMock })
    dbInnerJoinMock.mockReturnValue({ where: dbWhereMock })
    dbFromMock.mockReturnValue({ innerJoin: dbInnerJoinMock })
    dbSelectMock.mockReturnValue({ from: dbFromMock })
    dbUpdateWhereMock.mockResolvedValue(undefined)
    dbUpdateSetMock.mockReturnValue({ where: dbUpdateWhereMock })
    dbUpdateMock.mockReturnValue({ set: dbUpdateSetMock })
    getDbMock.mockReturnValue({
      select: dbSelectMock,
      update: dbUpdateMock,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when the request does not include a session cookie', async () => {
    await expect(resolveSessionFromHeaders(new Headers())).resolves.toBeNull()
    expect(getDbMock).not.toHaveBeenCalled()
  })

  it('loads the session and user for a valid signed session cookie', async () => {
    const headers = new Headers({
      cookie: `better-auth.session_token=${await signCookieValue('token-123', process.env.BETTER_AUTH_SECRET ?? '')}`,
    })

    const session = await resolveSessionFromHeaders(headers)

    expect(session?.session.id).toBe('sess-1')
    expect(session?.session.activeOrganizationId).toBe('org-1')
    expect(session?.user.email).toBe('owner@example.com')
    expect(dbLimitMock).toHaveBeenCalledWith(1)
  })

  it('loads production bootstrap cookies with the secure Better Auth prefix', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('BETTER_AUTH_SECRET', 'test-better-auth-secret')

    const { resolveSessionFromHeaders: resolveProductionSessionFromHeaders } =
      await import('../server-session.js')
    const headers = new Headers({
      cookie: `__Secure-better-auth.session_token=${await signCookieValue('token-123', process.env.BETTER_AUTH_SECRET ?? '')}`,
    })

    const session = await resolveProductionSessionFromHeaders(headers)

    expect(session?.session.id).toBe('sess-1')
    expect(dbLimitMock).toHaveBeenCalledWith(1)

    if (originalNodeEnv === undefined) {
      vi.unstubAllEnvs()
    } else {
      vi.stubEnv('NODE_ENV', originalNodeEnv)
    }
  })

  it('rejects tampered signed cookies', async () => {
    const headers = new Headers({
      cookie: 'better-auth.session_token=token-123.invalid-signature',
    })

    await expect(resolveSessionFromHeaders(headers)).resolves.toBeNull()
    expect(getDbMock).not.toHaveBeenCalled()
  })

  it('refreshes near-expiry sessions to the configured 15-minute idle window', async () => {
    dbLimitMock.mockResolvedValueOnce([
      {
        session: {
          id: 'sess-1',
          userId: 'user-1',
          token: 'token-123',
          expiresAt: new Date('2026-01-01T00:04:00.000Z'),
          activeOrganizationId: 'org-1',
          createdAt: new Date('2025-12-25T00:00:00.000Z'),
          updatedAt: new Date('2025-12-25T00:00:00.000Z'),
        },
        user: {
          id: 'user-1',
          email: 'owner@example.com',
          emailVerified: true,
          name: null,
          image: null,
          createdAt: new Date('2025-12-01T00:00:00.000Z'),
          updatedAt: new Date('2025-12-01T00:00:00.000Z'),
        },
      },
    ])
    const headers = new Headers({
      cookie: `better-auth.session_token=${await signCookieValue('token-123', process.env.BETTER_AUTH_SECRET ?? '')}`,
    })

    const session = await resolveSessionFromHeaders(headers)

    expect(dbUpdateMock).toHaveBeenCalledOnce()
    expect(dbUpdateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt: new Date('2026-01-01T00:15:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    )
    expect(session?.session.expiresAt).toEqual(new Date('2026-01-01T00:15:00.000Z'))
    expect(session?.user.name).toBe('')
    expect(session?.setCookieHeaders?.[0]).toContain('better-auth.session_token=')
  })
})

async function signCookieValue(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))

  return encodeURIComponent(`${value}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`)
}
