import { beforeAll, describe, expect, it, vi } from 'vitest'
import { getSchema } from 'better-auth/db'
import { organizationInvitations } from '@phiguard/db/server'

let authModulePromise: Promise<typeof import('../auth.js')>

beforeAll(() => {
  process.env.DATABASE_URL ??= 'postgres://postgres:postgres@127.0.0.1:5432/phiguard_test'
  authModulePromise = import('../auth.js')
})

describe('auth configuration', () => {
  it('exports authOptions for schema inspection and migration generation', async () => {
    const authModule = await import('../auth.js')

    expect(authModule).toHaveProperty('authOptions')
  }, 30_000)

  it('maps auth and organization tables onto the application schema', async () => {
    const authModule = await authModulePromise
    const authOptions = (authModule as { authOptions?: Parameters<typeof getSchema>[0] })
      .authOptions

    expect(authOptions).toBeDefined()

    const schema = getSchema(authOptions!)

    expect(schema).toHaveProperty('users')
    expect(schema.users.fields).toHaveProperty('emailVerified')
    expect(schema.users.fields).toHaveProperty('image')

    expect(schema).toHaveProperty('sessions')
    expect(schema.sessions.fields).toHaveProperty('activeOrganizationId')

    expect(schema).toHaveProperty('organizations')
    expect(schema.organizations.fields).toHaveProperty('logo')

    expect(schema).toHaveProperty('memberships')
    expect(schema.memberships.fields).toHaveProperty('tenantId')
    expect(schema.memberships.fields).toHaveProperty('userId')

    expect(schema).toHaveProperty('organization_invitations')
    expect(schema.organization_invitations.fields).toHaveProperty('organizationId')
    expect(schema.organization_invitations.fields).toHaveProperty('inviterId')
  })

  it('provides the drizzle adapter with the snake_case schema map it needs at runtime', async () => {
    const authModule = await authModulePromise

    expect(
      (authModule as { authAdapterSchema?: Record<string, unknown> }).authAdapterSchema,
    ).toMatchObject({
      users: expect.anything(),
      sessions: expect.anything(),
      accounts: expect.anything(),
      verifications: expect.anything(),
      organizations: expect.anything(),
      memberships: expect.anything(),
      organization_invitations: organizationInvitations,
    })
  })

  it('configures organization and location roles', async () => {
    const authModule = await authModulePromise
    const authOptions = (
      authModule as {
        authOptions?: {
          plugins?: Array<{ id?: string; options?: { roles?: Record<string, unknown> } }>
        }
      }
    ).authOptions

    const organizationPlugin = authOptions?.plugins?.find((plugin) => plugin.id === 'organization')

    expect(organizationPlugin?.options?.roles).toHaveProperty('org_owner')
    expect(organizationPlugin?.options?.roles).toHaveProperty('org_admin')
    expect(organizationPlugin?.options?.roles).toHaveProperty('location_manager')
    expect(organizationPlugin?.options?.roles).toHaveProperty('location_staff')
    expect(organizationPlugin?.options?.roles).toHaveProperty('auditor')
  })

  it('requires verified email ownership before accepting organization invitations', async () => {
    const authModule = await authModulePromise
    const authOptions = (
      authModule as {
        authOptions?: {
          plugins?: Array<{
            id?: string
            options?: { requireEmailVerificationOnInvitation?: boolean }
          }>
        }
      }
    ).authOptions

    const organizationPlugin = authOptions?.plugins?.find((plugin) => plugin.id === 'organization')

    expect(organizationPlugin?.options?.requireEmailVerificationOnInvitation).toBe(true)
  })

  it('uses UUID ids for Better Auth database records', async () => {
    const authModule = await authModulePromise
    const authOptions = (
      authModule as { authOptions?: { advanced?: { database?: { generateId?: string } } } }
    ).authOptions

    expect(authOptions?.advanced?.database?.generateId).toBe('uuid')
  })

  it('allows local preview origins used by the production-style Playwright server', async () => {
    const authModule = await authModulePromise
    const authOptions = (authModule as { authOptions?: { trustedOrigins?: string[] } }).authOptions

    expect(authOptions?.trustedOrigins).toEqual(
      expect.arrayContaining(['http://localhost:3210', 'http://127.0.0.1:3210']),
    )
  })

  it('forces secure cookies in production regardless of url configuration', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('BETTER_AUTH_URL', 'http://staging.internal')
    const authModule = await import('../auth.js')
    const authOptions = (
      authModule as { authOptions?: { advanced?: { useSecureCookies?: boolean } } }
    ).authOptions
    expect(authOptions?.advanced?.useSecureCookies).toBe(true)
    vi.unstubAllEnvs()
  })

  it('configures session expiration for a 15-minute HIPAA idle timeout', async () => {
    const authModule = await authModulePromise
    const authOptions = (
      authModule as {
        authOptions?: {
          session?: {
            expiresIn?: number
            updateAge?: number
            cookieCache?: { maxAge?: number }
          }
        }
      }
    ).authOptions
    expect(authOptions?.session?.expiresIn).toBe(60 * 15)
    expect(authOptions?.session?.updateAge).toBe(60 * 5)
    expect(authOptions?.session?.cookieCache?.maxAge).toBe(60 * 15)
  })

  it('configures Google when social provider secrets are available', async () => {
    vi.resetModules()
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', '')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', '')
    const authModule = await import('../auth.js')
    const authOptions = (
      authModule as {
        authOptions?: {
          socialProviders?: {
            google?: {
              clientId?: string
              clientSecret?: string
            }
          }
        }
      }
    ).authOptions

    expect(authOptions?.socialProviders?.google).toEqual({
      clientId: 'google-client-id',
      clientSecret: 'google-client-secret',
    })
    vi.unstubAllEnvs()
  })

  it('does not configure Google with empty social provider secrets', async () => {
    vi.resetModules()
    vi.stubEnv('GOOGLE_CLIENT_ID', '')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', '')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', '')
    const authModule = await import('../auth.js')
    const authOptions = (
      authModule as {
        authOptions?: {
          socialProviders?: {
            google?: {
              clientId?: string
              clientSecret?: string
            }
          }
        }
      }
    ).authOptions

    expect(authOptions?.socialProviders?.google).toBeUndefined()
    vi.unstubAllEnvs()
  })

  it('falls back to legacy Google OAuth env names when primary env names are blank', async () => {
    vi.resetModules()
    vi.stubEnv('GOOGLE_CLIENT_ID', '')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'legacy-google-client-id')
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'legacy-google-client-secret')
    const authModule = await import('../auth.js')
    const authOptions = (
      authModule as {
        authOptions?: {
          socialProviders?: {
            google?: {
              clientId?: string
              clientSecret?: string
            }
          }
        }
      }
    ).authOptions

    expect(authOptions?.socialProviders?.google).toEqual({
      clientId: 'legacy-google-client-id',
      clientSecret: 'legacy-google-client-secret',
    })
    vi.unstubAllEnvs()
  })

  it('does not swallow password reset email delivery failures', async () => {
    vi.resetModules()
    vi.doMock('@phiguard/email', () => ({
      sendOrganizationInviteEmail: vi.fn(),
      sendPasswordResetEmail: vi
        .fn()
        .mockRejectedValue(new Error('Provider failed for patient@example.com')),
    }))
    const authModule = await import('../auth.js')
    const authOptions = (
      authModule as {
        authOptions?: {
          emailAndPassword?: {
            sendResetPassword?: (input: { user: { email: string }; url: string }) => Promise<void>
          }
        }
      }
    ).authOptions

    await expect(
      authOptions?.emailAndPassword?.sendResetPassword?.({
        user: { email: 'patient@example.com' },
        url: 'https://my.phiguard.app/reset',
      }),
    ).rejects.toThrow('Password reset email could not be sent')

    vi.doUnmock('@phiguard/email')
  })
})
