import './zod-meta-shim'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAccessControl } from 'better-auth/plugins/access'
import { organization } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import {
  accounts,
  getDb,
  organizationInvitations,
  organizations,
  sessions,
  users,
  verifications,
} from '@phiguard/db/server'
import { memberships } from '@phiguard/db/server'
import { sendOrganizationInviteEmail, sendPasswordResetEmail } from '@phiguard/email'
import { logger } from '@phiguard/audit'
import { encryptToken } from '@phiguard/integration/token-crypto'
import { shouldUseSecureCookies } from './lib/cookies.js'
import { syncBetterAuthSecretEnv } from './lib/secrets.js'
import { hashCredentialPassword, verifyCredentialPassword } from './password.js'

export async function encryptAccountTokens(
  account: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const keyId = process.env.AUTH_TOKEN_KEY_ID
  const result = { ...account }
  const fields = ['accessToken', 'refreshToken', 'idToken'] as const
  const hasTokenMaterial = fields.some((field) => {
    const value = account[field]
    return typeof value === 'string' && value.length > 0
  })

  if (!keyId) {
    if (hasTokenMaterial && process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_TOKEN_KEY_ID must be set before storing OAuth account tokens')
    }

    return account
  }

  let anyEncrypted = false

  for (const field of fields) {
    const value = account[field]
    if (typeof value === 'string' && value) {
      const enc = await encryptToken(value, keyId)
      result[`${field}Enc`] = JSON.stringify(enc)
      delete result[field]
      anyEncrypted = true
    }
  }

  if (anyEncrypted) {
    result['tokenKmsKeyId'] = keyId
    for (const field of fields) {
      result[field] = null
    }
  }

  return result
}

function collectTrustedOrigins() {
  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.APP_URL,
    process.env.PLAYWRIGHT_APP_URL,
    process.env.PLAYWRIGHT_BASE_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3210',
    'http://127.0.0.1:3210',
  ]

  const origins = new Set<string>()

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    try {
      origins.add(new URL(candidate).origin)
    } catch {
      // Ignore malformed env values and fall back to known local origins.
    }
  }

  return Array.from(origins)
}

const organizationAc = createAccessControl({
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
} as const)

const organizationRoles = {
  org_owner: organizationAc.newRole({
    organization: ['update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    team: ['create', 'update', 'delete'],
    ac: ['create', 'read', 'update', 'delete'],
  }),
  org_admin: organizationAc.newRole({
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    team: ['create', 'update', 'delete'],
  }),
  location_manager: organizationAc.newRole({
    organization: [],
    member: ['create', 'update'],
    invitation: ['create', 'cancel'],
    team: [],
    ac: [],
  }),
  location_staff: organizationAc.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: [],
  }),
  auditor: organizationAc.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: ['read'],
  }),
}

function firstPresentEnv(...values: Array<string | undefined>) {
  return values.find((value) => value !== undefined && value !== '')
}

function collectSocialProviders() {
  const googleClientId = firstPresentEnv(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_ID,
  )
  const googleClientSecret = firstPresentEnv(
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  )

  if (!googleClientId || !googleClientSecret) {
    return {}
  }

  return {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  }
}

export const authAdapterSchema = {
  users,
  sessions,
  accounts,
  verifications,
  organizations,
  memberships,
  organization_invitations: organizationInvitations,
}

export const authOptions = {
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: collectTrustedOrigins(),
  advanced: {
    database: {
      generateId: 'uuid' as const,
    },
    useSecureCookies: shouldUseSecureCookies(),
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashCredentialPassword,
      verify: ({ hash, password }: { hash: string; password: string }) =>
        verifyCredentialPassword(hash, password),
    },
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      try {
        await sendPasswordResetEmail({ toEmail: user.email, resetUrl: url })
      } catch (err) {
        logger.safe.error(
          {
            component: 'auth',
            err: err instanceof Error ? err : new Error('Unknown reset email failure'),
          },
          'sendResetPassword: failed to send reset email',
        )
        throw new Error('Password reset email could not be sent')
      }
    },
  },
  socialProviders: collectSocialProviders(),
  user: {
    modelName: 'users',
    fields: {
      email: 'email',
      emailVerified: 'emailVerified',
      name: 'name',
      image: 'image',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
  session: {
    modelName: 'sessions',
    expiresIn: 60 * 15,
    updateAge: 60 * 5,
    fields: {
      userId: 'userId',
      expiresAt: 'expiresAt',
      token: 'token',
      ipAddress: 'ipAddress',
      userAgent: 'userAgent',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    cookieCache: {
      enabled: true,
      maxAge: 60 * 15, // 15-minute idle timeout (HIPAA guidance)
    },
  },
  account: {
    modelName: 'accounts',
    fields: {
      accountId: 'accountId',
      providerId: 'providerId',
      userId: 'userId',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      idToken: 'idToken',
      accessTokenExpiresAt: 'accessTokenExpiresAt',
      refreshTokenExpiresAt: 'refreshTokenExpiresAt',
      scope: 'scope',
      password: 'password',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
  verification: {
    modelName: 'verifications',
    fields: {
      identifier: 'identifier',
      value: 'value',
      expiresAt: 'expiresAt',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
  databaseHooks: {
    account: {
      create: {
        before: async (account: Record<string, unknown>) => {
          return { data: await encryptAccountTokens(account) }
        },
      },
      update: {
        before: async (account: Record<string, unknown>) => {
          return { data: await encryptAccountTokens(account) }
        },
      },
    },
  },
  plugins: [
    organization({
      ac: organizationAc,
      creatorRole: 'org_owner',
      requireEmailVerificationOnInvitation: true,
      roles: organizationRoles,
      sendInvitationEmail: async (data) => {
        const acceptUrl = new URL(
          `/accept-invite/${data.id}`,
          process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
        ).toString()

        try {
          await sendOrganizationInviteEmail({
            acceptUrl,
            expiresAt: data.invitation.expiresAt,
            inviterName: data.inviter.user.name || data.inviter.user.email,
            organizationName: data.organization.name,
            role: data.role,
            toEmail: data.email,
          })
        } catch (err) {
          // Log the failure without including the recipient email address (PHI).
          logger.safe.error(
            { invitationId: data.id, organizationId: data.organization.id },
            'sendInvitationEmail: failed to send invitation email',
          )
          throw err // Re-throw so Better Auth can handle and may roll back the invitation row.
        }
      },
      membershipLimit: async (_user, organization) => {
        // SELECT FOR UPDATE inside a transaction serializes concurrent membership checks.
        // A DB-level trigger enforcing the cap is the only complete fix; tracked as a known concern.
        return getDb().transaction(async (tx) => {
          const [org] = await tx
            .select({ maxMembers: organizations.maxMembers })
            .from(organizations)
            .where(eq(organizations.id, organization.id))
            .for('update')
            .limit(1)

          return org?.maxMembers ?? 10
        })
      },
      schema: {
        session: {
          fields: {
            activeOrganizationId: 'activeOrganizationId',
          },
        },
        organization: {
          modelName: 'organizations',
          fields: {
            name: 'name',
            slug: 'slug',
            logo: 'logo',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          },
        },
        member: {
          modelName: 'memberships',
          fields: {
            organizationId: 'tenantId',
            userId: 'userId',
            role: 'role',
            createdAt: 'createdAt',
          },
        },
        invitation: {
          modelName: 'organization_invitations',
          fields: {
            organizationId: 'organizationId',
            email: 'email',
            role: 'role',
            status: 'status',
            teamId: 'teamId',
            expiresAt: 'expiresAt',
            inviterId: 'inviterId',
            createdAt: 'createdAt',
          },
        },
      },
    }),
  ],
}

function isHyperdriveConnectionString(connectionString: string | undefined) {
  if (!connectionString) {
    return false
  }

  try {
    return new URL(connectionString).hostname.endsWith('.hyperdrive.local')
  } catch {
    return false
  }
}

function createAuth() {
  syncBetterAuthSecretEnv()

  return betterAuth({
    ...authOptions,
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
      schema: authAdapterSchema,
    }),
  })
}

let _auth: ReturnType<typeof createAuth> | null = null

export function getAuth() {
  if (isHyperdriveConnectionString(process.env.DATABASE_URL)) {
    return createAuth()
  }

  if (!_auth) {
    _auth = createAuth()
  }

  return _auth
}

export type Auth = ReturnType<typeof createAuth>
