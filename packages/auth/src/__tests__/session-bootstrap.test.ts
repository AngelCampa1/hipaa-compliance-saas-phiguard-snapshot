import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertValues = vi.fn()
const serializeSignedCookie = vi.fn()

vi.mock('@phiguard/db/server', () => ({
  getDb: vi.fn(() => ({
    insert: vi.fn(() => ({
      values: insertValues,
    })),
  })),
  sessions: {},
}))

vi.mock('better-call', () => ({
  serializeSignedCookie: (...args: unknown[]) => serializeSignedCookie(...args),
}))

describe('createSessionBootstrapCookie', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    insertValues.mockResolvedValue(undefined)
    serializeSignedCookie.mockResolvedValue('better-auth.session_token=signed-token; Path=/; HttpOnly')
  })

  it('fails closed when neither auth secret is configured', async () => {
    delete process.env.AUTH_SECRET
    delete process.env.BETTER_AUTH_SECRET

    const { createSessionBootstrapCookie } = await import('../session-bootstrap.js')

    await expect(createSessionBootstrapCookie('user-id-123')).rejects.toThrow(
      'Required env var BETTER_AUTH_SECRET or AUTH_SECRET is missing or too short (min 16 chars)',
    )
    expect(insertValues).not.toHaveBeenCalled()
    expect(serializeSignedCookie).not.toHaveBeenCalled()
  })

  it('creates a signed Better Auth session cookie when a secret exists', async () => {
    process.env.BETTER_AUTH_SECRET = 'better-auth-secret-that-is-long-enough'

    const { createSessionBootstrapCookie } = await import('../session-bootstrap.js')
    const cookie = await createSessionBootstrapCookie('user-id-123', {
      activeOrganizationId: 'org-123',
    })

    expect(cookie).toContain('better-auth.session_token=')
    expect(insertValues).toHaveBeenCalledTimes(1)
    expect(serializeSignedCookie).toHaveBeenCalledWith(
      'better-auth.session_token',
      expect.any(String),
      'better-auth-secret-that-is-long-enough',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      }),
    )
  })

  it('creates production bootstrap cookies with the secure Better Auth prefix', async () => {
    process.env.BETTER_AUTH_SECRET = 'better-auth-secret-that-is-long-enough'
    vi.stubEnv('NODE_ENV', 'production')

    const { createSessionBootstrapCookie } = await import('../session-bootstrap.js')
    await createSessionBootstrapCookie('user-id-123')

    expect(serializeSignedCookie).toHaveBeenCalledWith(
      '__Secure-better-auth.session_token',
      expect.any(String),
      'better-auth-secret-that-is-long-enough',
      expect.objectContaining({
        secure: true,
      }),
    )
  })
})
