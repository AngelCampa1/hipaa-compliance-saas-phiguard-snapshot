import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { getDb, organizations } from '@phiguard/db/server'
import { resolveActiveLocationAccess } from '../../../server/access'
import {
  POSTHOG_CAPTURE_URL,
  isApprovedProductAnalyticsEvent,
  isPublicSignupAnalyticsEvent,
  isSafePublicSignupDistinctId,
  sanitizePublicSignupAnalyticsProperties,
  sanitizeProductAnalyticsProperties,
} from '../../../lib/product-analytics'

type ProductAnalyticsCaptureBody = {
  event?: unknown
  distinct_id?: unknown
  timestamp?: unknown
  properties?: unknown
}

const MAX_PRODUCT_ANALYTICS_BODY_BYTES = 8_192

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function readBoundedJsonBody(request: Request): Promise<ProductAnalyticsCaptureBody | null> {
  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_PRODUCT_ANALYTICS_BODY_BYTES) {
    return null
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_PRODUCT_ANALYTICS_BODY_BYTES) {
    return null
  }

  return JSON.parse(new TextDecoder().decode(body)) as ProductAnalyticsCaptureBody
}

async function getOrganizationAnalyticsProperties(organizationId: string) {
  const [organization] = await getDb()
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  return {
    organization_id: organizationId,
    plan: organization?.plan ?? undefined,
    plan_status: organization?.planStatus ?? undefined,
    $groups: { organization: organizationId },
  }
}

function sanitizeForwardedProperties(
  eventName: string,
  properties: Record<string, unknown>,
  organizationProperties: Awaited<ReturnType<typeof getOrganizationAnalyticsProperties>>,
  role: string,
) {
  const { $group_type, ...eventProperties } = properties

  const sanitizedProperties: Record<string, unknown> =
    sanitizeProductAnalyticsProperties(eventProperties)

  if (eventName === '$set') {
    return {
      $set: {
        organization_id: organizationProperties.organization_id,
        plan: organizationProperties.plan,
        plan_status: organizationProperties.plan_status,
        role,
      },
      $groups: { organization: organizationProperties.organization_id },
    }
  }

  if ($group_type === 'organization') {
    sanitizedProperties.$group_type = 'organization'
    sanitizedProperties.$group_key = organizationProperties.organization_id
    sanitizedProperties.$group_set = {
      plan: organizationProperties.plan,
      plan_status: organizationProperties.plan_status,
    }
    return sanitizedProperties
  }

  return {
    ...sanitizedProperties,
    ...organizationProperties,
  }
}

async function forwardAnalyticsEvent(input: {
  apiKey: string
  eventName: string
  distinctId?: string
  properties: Record<string, unknown>
}) {
  try {
    await fetch(POSTHOG_CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: input.apiKey,
        event: input.eventName,
        ...(input.distinctId ? { distinct_id: input.distinctId } : {}),
        timestamp: new Date().toISOString(),
        properties: input.properties,
      }),
    })
  } catch {
    // Product analytics is best-effort; capture failures must not break app requests.
  }
}

export async function handleProductAnalyticsCaptureRequest(request: Request) {
  if (process.env.PRODUCT_ANALYTICS_ENABLED !== 'true') {
    return new Response(null, { status: 204 })
  }

  const apiKey = process.env.VITE_POSTHOG_KEY
  if (!apiKey) {
    return new Response(null, { status: 204 })
  }

  let body: ProductAnalyticsCaptureBody
  try {
    const parsedBody = await readBoundedJsonBody(request)
    if (!parsedBody) {
      return new Response('Analytics payload too large', { status: 413 })
    }
    body = parsedBody
  } catch {
    return new Response('Invalid JSON payload', { status: 400 })
  }

  const eventName = body.event
  const properties = body.properties

  const isGroupIdentify = eventName === '$groupidentify'
  const isPersonSet = eventName === '$set'
  const isAlias = eventName === '$create_alias'
  if (
    typeof eventName !== 'string' ||
    (!isApprovedProductAnalyticsEvent(eventName) &&
      !isGroupIdentify &&
      !isPersonSet &&
      !isAlias) ||
    !isPlainObject(properties)
  ) {
    return new Response('Invalid analytics payload', { status: 400 })
  }

  if (isPublicSignupAnalyticsEvent(eventName)) {
    if (!isSafePublicSignupDistinctId(body.distinct_id)) {
      return new Response('Invalid analytics payload', { status: 400 })
    }

    await forwardAnalyticsEvent({
      apiKey,
      eventName,
      distinctId: body.distinct_id,
      properties: sanitizePublicSignupAnalyticsProperties(properties),
    })

    return new Response(null, { status: 204 })
  }

  const { resolveAppSessionFromHeaders } = await import('../../../lib/session.server.js')
  const session = await resolveAppSessionFromHeaders(request.headers)
  const activeOrganizationId = session?.session.activeOrganizationId

  if (!session?.user?.id || !activeOrganizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (isAlias) {
    if (!isSafePublicSignupDistinctId(body.distinct_id)) {
      return new Response('Invalid analytics payload', { status: 400 })
    }

    await forwardAnalyticsEvent({
      apiKey,
      eventName,
      properties: {
        distinct_id: body.distinct_id,
        alias: session.user.id,
      },
    })

    return new Response(null, { status: 204 })
  }

  const access = await resolveActiveLocationAccess(getDb(), session)
  const organizationProperties = await getOrganizationAnalyticsProperties(access.organizationId)

  await forwardAnalyticsEvent({
    apiKey,
    eventName,
    distinctId: session.user.id,
    properties: sanitizeForwardedProperties(
      eventName,
      properties,
      organizationProperties,
      access.role,
    ),
  })

  return new Response(null, { status: 204 })
}

export const Route = createFileRoute('/api/analytics/product')({
  server: {
    handlers: {
      POST: ({ request }) => handleProductAnalyticsCaptureRequest(request),
    },
  },
})
