import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import * as crypto from 'node:crypto'
import { eq, and } from 'drizzle-orm'
import { getDb, organizations, integrationConnections } from '@phiguard/db/server'
import { writeAuditEvent } from '@phiguard/audit'
import { recordFeatureUsage, requireFeatureForOrg } from '@phiguard/billing'
import { generatePkce, buildAuthorizeUrl, exchangeCode } from '@phiguard/integration/oauth'
import { encryptToken } from '@phiguard/integration/token-crypto'
import { requireSecret } from '@phiguard/auth'
export { requireSecret }
import { getSessionFn } from '../lib/session.js'
import { runInAuditContext } from '../lib/audit.server.js'
import {
  assertCommercialProductAccess,
  canManageOrganization,
  resolveActiveLocationAccess,
} from './access.js'

// ---------------------------------------------------------------------------
// State JWT helpers (HMAC-SHA256 signed, no external dep)
// ---------------------------------------------------------------------------

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000

function requireStateSecret() {
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET
  if (betterAuthSecret && betterAuthSecret.length >= 16) {
    return betterAuthSecret
  }

  const legacyAuthSecret = process.env.AUTH_SECRET
  if (legacyAuthSecret && legacyAuthSecret.length >= 16) {
    return legacyAuthSecret
  }

  throw new Error(
    'Required env var BETTER_AUTH_SECRET or AUTH_SECRET is missing or too short (min 16 chars)',
  )
}

function stateEncryptionKey(secret: string) {
  return crypto.createHash('sha256').update(secret).digest()
}

function signState(payload: object): string {
  const secret = requireStateSecret()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', stateEncryptionKey(secret), iv)
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return [
    'v1',
    iv.toString('base64url'),
    ciphertext.toString('base64url'),
    tag.toString('base64url'),
  ].join('.')
}

function verifyState(token: string): Record<string, unknown> {
  const secret = requireStateSecret()
  const parts = token.split('.')
  if (parts.length !== 4) {
    throw new Error('Invalid state token format')
  }
  const [version, ivInput, ciphertextInput, tagInput] = parts
  if (version !== 'v1' || !ivInput || !ciphertextInput || !tagInput) {
    throw new Error('Invalid state token format')
  }

  const iv = Buffer.from(ivInput, 'base64url')
  const ciphertext = Buffer.from(ciphertextInput, 'base64url')
  const tag = Buffer.from(tagInput, 'base64url')

  let plaintext: string
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', stateEncryptionKey(secret), iv)
    decipher.setAuthTag(tag)
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch {
    throw new Error('State signature mismatch')
  }

  const payload = JSON.parse(plaintext) as Record<string, unknown>

  if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) {
    throw new Error('State token expired')
  }

  return payload
}

// ---------------------------------------------------------------------------
// Session helper
// ---------------------------------------------------------------------------

async function requireOrgSession({ requireManage = true }: { requireManage?: boolean } = {}) {
  const session = await getSessionFn()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const tenantId = session.session.activeOrganizationId
  if (!tenantId) throw new Error('No active organization')
  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)
  if (requireManage && !canManageOrganization(access)) {
    throw new Error('Only organization administrators can manage integrations')
  }
  return { session, userId: access.userId, tenantId: access.organizationId, db }
}

async function requireOrgPlan(tenantId: string) {
  const db = getDb()
  const [org] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialEndsAt: organizations.trialEndsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, tenantId))
    .limit(1)
  if (!org) throw new Error('Organization not found')
  return org
}

async function gateIntegrationsBasic(tenantId: string) {
  const org = await requireOrgPlan(tenantId)
  requireFeatureForOrg(org, 'integrations_basic')
  if (org.planStatus === 'trialing') {
    void recordFeatureUsage(getDb(), tenantId, 'integrations_basic').catch(() => {
      // best-effort
    })
  }
  return org.plan
}

// ---------------------------------------------------------------------------
// startIntegrationInstallFn
// ---------------------------------------------------------------------------

const StartInstallInput = z.object({
  provider: z.enum(['google', 'microsoft']),
  acknowledgedCalendarCompliance: z.literal(true, {
    message: 'Calendar compliance acknowledgment is required',
  }),
})

export const startIntegrationInstallFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => StartInstallInput.parse(data))
  .handler(async ({ data }) => {
    if (!data.acknowledgedCalendarCompliance) {
      throw new Error('Calendar compliance acknowledgment is required')
    }

    const { userId, tenantId } = await requireOrgSession()
    await gateIntegrationsBasic(tenantId)

    const { codeVerifier, codeChallenge } = generatePkce()
    const nonce = crypto.randomBytes(16).toString('hex')
    const startedAt = Date.now()

    const statePayload = {
      tenantId,
      userId,
      nonce,
      provider: data.provider,
      codeVerifier,
      startedAt,
      expiresAt: startedAt + OAUTH_STATE_TTL_MS,
    }

    const state = signState(statePayload)
    const authorizeUrl = buildAuthorizeUrl(data.provider, state, codeChallenge)

    return { authorizeUrl }
  })

// ---------------------------------------------------------------------------
// listConnectionsFn
// ---------------------------------------------------------------------------

export const listConnectionsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { tenantId, db } = await requireOrgSession({ requireManage: false })
  await gateIntegrationsBasic(tenantId)

  return db
    .select({
      id: integrationConnections.id,
      provider: integrationConnections.provider,
      accountEmail: integrationConnections.accountEmail,
      status: integrationConnections.status,
      createdAt: integrationConnections.createdAt,
      locationId: integrationConnections.locationId,
    })
    .from(integrationConnections)
    .where(
      and(
        eq(integrationConnections.organizationId, tenantId),
        eq(integrationConnections.status, 'active'),
      ),
    )
})

// ---------------------------------------------------------------------------
// revokeConnectionFn
// ---------------------------------------------------------------------------

const RevokeConnectionInput = z.object({
  connectionId: z.string().uuid(),
})

export const revokeConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => RevokeConnectionInput.parse(data))
  .handler(async ({ data }) => {
    const { userId, tenantId, db } = await requireOrgSession()
    await gateIntegrationsBasic(tenantId)

    // Verify ownership before revoking
    const [connection] = await db
      .select({ id: integrationConnections.id, provider: integrationConnections.provider })
      .from(integrationConnections)
      .where(
        and(
          eq(integrationConnections.id, data.connectionId),
          eq(integrationConnections.organizationId, tenantId),
          eq(integrationConnections.status, 'active'),
        ),
      )
      .limit(1)

    if (!connection) throw new Error('Integration connection not found')

    await runInAuditContext(userId, async () => {
      await db.transaction(async (tx) => {
        const [updatedConnection] = await tx
          .update(integrationConnections)
          .set({
            status: 'revoked',
            accessTokenCiphertext: '',
            refreshTokenCiphertext: '',
            scopes: [],
            expiresAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(integrationConnections.id, connection.id),
              eq(integrationConnections.organizationId, tenantId),
              eq(integrationConnections.status, 'active'),
            ),
          )
          .returning({ id: integrationConnections.id })

        if (!updatedConnection) {
          throw new Error('Integration connection could not be revoked')
        }

        await writeAuditEvent(tx, {
          tenantId,
          actorId: userId,
          action: 'integration.revoked',
          resourceType: 'integration_connection',
          resourceId: connection.id,
          after: { provider: connection.provider, status: 'revoked', tokensDeleted: true },
        })
      })
    })
  })

// ---------------------------------------------------------------------------
// handleOAuthCallbackFn (used by the callback route)
// ---------------------------------------------------------------------------

export { signState, verifyState, exchangeCode, encryptToken }
