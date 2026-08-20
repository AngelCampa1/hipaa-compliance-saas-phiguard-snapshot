import { createFileRoute } from '@tanstack/react-router'
import { eq, sql } from 'drizzle-orm'
import { getDb, integrationConnections, organizations } from '@phiguard/db/server'
import { writeAuditEvent } from '@phiguard/audit'
import { isAdmin, resolveOrganizationAccess } from '@phiguard/auth'
import { recordFeatureUsage, requireFeatureForOrg } from '@phiguard/billing'
import { BaaService } from '@phiguard/baa'
import { exchangeCode } from '@phiguard/integration/oauth'
import { encryptToken } from '@phiguard/integration/token-crypto'
import { getSessionFn } from '../../../lib/session.js'
import { captureServerProductAnalyticsEvent } from '../../../lib/product-analytics.js'
import { assertCommercialProductAccess } from '../../../server/access.js'
import { verifyState } from '../../../server/integrations.js'

type IntegrationProvider = 'google' | 'microsoft'

function isIntegrationProvider(provider: string): provider is IntegrationProvider {
  return provider === 'google' || provider === 'microsoft'
}

type IntegrationCallbackFailureReason =
  | 'access_denied'
  | 'encryption_not_configured'
  | 'plan_required'
  | 'token_exchange'
  | 'encryption_failed'
  | 'stale_state'

function captureIntegrationCallbackEvent(input: {
  userId: string
  organizationId: string
  provider: IntegrationProvider
  eventName: 'integration_callback_completed' | 'integration_callback_failed'
  status: 'connected' | 'failed'
  reason?: IntegrationCallbackFailureReason
}) {
  captureServerProductAnalyticsEvent({
    userId: input.userId,
    organizationId: input.organizationId,
    eventName: input.eventName,
    properties: {
      route: '/api/integrations/$provider/callback',
      provider: input.provider,
      status: input.status,
      reason: input.reason,
    },
  })
}

async function resolveLegalCurrent(db: ReturnType<typeof getDb>, tenantId: string) {
  const legalStatus = await new BaaService().getLegalStatus({ orgId: tenantId }, db)

  return Boolean(
    legalStatus.terms.acceptedAt
    && legalStatus.baa.acceptedAt
    && legalStatus.terms.isCurrent
    && legalStatus.baa.isCurrent,
  )
}

async function withIntegrationInstallTransaction(
  db: ReturnType<typeof getDb>,
  fn: (tx: ReturnType<typeof getDb>) => Promise<void>,
) {
  const transactionalDb = db as ReturnType<typeof getDb> & {
    transaction?: (fn: (tx: ReturnType<typeof getDb>) => Promise<void>) => Promise<void>
  }

  if (typeof transactionalDb.transaction === 'function') {
    await transactionalDb.transaction(fn)
    return
  }

  // Fallback for test doubles only. Drizzle on Postgres always exposes `transaction`
  // in production; this branch exists so unit tests can pass a minimal mock db
  // without a transaction implementation. Do not rely on it at runtime.
  await fn(db)
}

export async function handleIntegrationCallback(
  request: Request,
  provider: string,
): Promise<Response> {
  if (!isIntegrationProvider(provider)) {
    return new Response('Unknown provider', { status: 400 })
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const stateToken = url.searchParams.get('state')

  if (!code || !stateToken) {
    return new Response('Missing code or state', { status: 400 })
  }

  let statePayload: Record<string, unknown>
  try {
    statePayload = verifyState(stateToken)
  } catch {
    return new Response('Invalid state token', { status: 400 })
  }

  const { tenantId, userId, codeVerifier, provider: stateProvider, startedAt } = statePayload
  if (
    typeof tenantId !== 'string' ||
    typeof userId !== 'string' ||
    typeof codeVerifier !== 'string' ||
    typeof startedAt !== 'number' ||
    stateProvider !== provider
  ) {
    return new Response('State payload mismatch', { status: 400 })
  }
  const stateStartedAt = new Date(startedAt)
  if (Number.isNaN(stateStartedAt.getTime())) {
    return new Response('State payload mismatch', { status: 400 })
  }

  const session = await getSessionFn()
  if (!session?.user?.id || session.user.id !== userId) {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'access_denied',
    })
    return new Response(null, {
      status: 302,
      headers: { Location: '/app/settings/integrations?status=error&reason=access_denied' },
    })
  }

  const encryptionKeyId = process.env.INTEGRATION_TOKEN_KEY_ID ?? process.env.INTEGRATION_KMS_KEY_ID
  if (!encryptionKeyId) {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'encryption_not_configured',
    })
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/app/settings/integrations?status=error&reason=encryption_not_configured',
      },
    })
  }

  const db = getDb()
  const access = await resolveOrganizationAccess(db, {
    activeOrganizationId: tenantId,
    userId,
  })

  if (access.status !== 'ready' || !isAdmin(access.scope.role)) {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'access_denied',
    })
    return new Response(null, {
      status: 302,
      headers: { Location: '/app/settings/integrations?status=error&reason=access_denied' },
    })
  }

  const [organization] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialStartedAt: organizations.trialStartedAt,
      trialEndsAt: organizations.trialEndsAt,
      stripeCustomerId: organizations.stripeCustomerId,
      stripeSubscriptionId: organizations.stripeSubscriptionId,
    })
    .from(organizations)
    .where(eq(organizations.id, tenantId))
    .limit(1)

  try {
    assertCommercialProductAccess({
      commercial: organization
        ? {
            ...organization,
            legalCurrent: await resolveLegalCurrent(db, tenantId),
          }
        : null,
    })
    requireFeatureForOrg(
      {
        plan: organization?.plan,
        planStatus: organization?.planStatus,
        trialEndsAt: organization?.trialEndsAt,
      },
      'integrations_basic',
    )
    if (organization?.planStatus === 'trialing') {
      void recordFeatureUsage(db, tenantId, 'integrations_basic').catch(() => {
        // best-effort
      })
    }
  } catch {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'plan_required',
    })
    return new Response(null, {
      status: 302,
      headers: { Location: '/app/settings/integrations?status=error&reason=plan_required' },
    })
  }

  let tokenResponse: Awaited<ReturnType<typeof exchangeCode>>
  try {
    tokenResponse = await exchangeCode(provider, code, codeVerifier)
  } catch {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'token_exchange',
    })
    const callbackUrl = `/app/settings/integrations?status=error&reason=token_exchange`
    return new Response(null, {
      status: 302,
      headers: { Location: callbackUrl },
    })
  }

  let encryptedAccess: Awaited<ReturnType<typeof encryptToken>>
  let encryptedRefresh: Awaited<ReturnType<typeof encryptToken>>
  try {
    const encryptedTokens = await Promise.all([
      encryptToken(tokenResponse.accessToken, encryptionKeyId),
      encryptToken(tokenResponse.refreshToken, encryptionKeyId),
    ])
    encryptedAccess = encryptedTokens[0]
    encryptedRefresh = encryptedTokens[1]
  } catch {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'encryption_failed',
    })
    return new Response(null, {
      status: 302,
      headers: { Location: '/app/settings/integrations?status=error&reason=encryption_failed' },
    })
  }

  let installedConnectionId: string | null = null
  await withIntegrationInstallTransaction(db, async (tx) => {
    const [connection] = await tx
      .insert(integrationConnections)
      .values({
        organizationId: tenantId,
        provider,
        accountEmail: tokenResponse.accountEmail,
        accessTokenCiphertext: JSON.stringify(encryptedAccess),
        refreshTokenCiphertext: JSON.stringify(encryptedRefresh),
        kmsKeyId: encryptionKeyId,
        scopes: tokenResponse.scopes,
        status: 'active',
        expiresAt: tokenResponse.expiresAt,
        installStartedAt: stateStartedAt,
        installedByUserId: userId,
      })
      .onConflictDoUpdate({
        target: [integrationConnections.organizationId, integrationConnections.provider],
        targetWhere: sql`${integrationConnections.status} = 'active'`,
        setWhere: sql`coalesce(${integrationConnections.installStartedAt}, ${integrationConnections.updatedAt}) <= ${stateStartedAt}`,
        set: {
          accountEmail: tokenResponse.accountEmail,
          accessTokenCiphertext: JSON.stringify(encryptedAccess),
          refreshTokenCiphertext: JSON.stringify(encryptedRefresh),
          kmsKeyId: encryptionKeyId,
          scopes: tokenResponse.scopes,
          status: 'active',
          expiresAt: tokenResponse.expiresAt,
          installStartedAt: stateStartedAt,
          installedByUserId: userId,
          updatedAt: new Date(),
        },
      })
      .returning({ id: integrationConnections.id })

    if (!connection) return
    installedConnectionId = connection.id

    await writeAuditEvent(tx, {
      tenantId,
      actorId: userId,
      action: 'integration.installed',
      resourceType: 'integration_connection',
      resourceId: connection.id,
      after: {
        provider,
        status: 'active',
      },
    })
  })

  if (!installedConnectionId) {
    captureIntegrationCallbackEvent({
      userId,
      organizationId: tenantId,
      provider,
      eventName: 'integration_callback_failed',
      status: 'failed',
      reason: 'stale_state',
    })
    return new Response(null, {
      status: 302,
      headers: { Location: '/app/settings/integrations?status=error&reason=stale_state' },
    })
  }

  captureIntegrationCallbackEvent({
    userId,
    organizationId: tenantId,
    provider,
    eventName: 'integration_callback_completed',
    status: 'connected',
  })

  return new Response(null, {
    status: 302,
    headers: { Location: '/app/settings/integrations?status=connected' },
  })
}

export const Route = createFileRoute('/api/integrations/$provider/callback')({
  server: {
    handlers: {
      GET: async ({ request, params }) => handleIntegrationCallback(request, params.provider),
    },
  },
})
