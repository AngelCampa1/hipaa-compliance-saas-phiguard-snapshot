const POSTHOG_CAPTURE_URL = 'https://us.i.posthog.com/capture/'

const BILLING_ANALYTICS_EVENTS = [
  'checkout_started',
  'checkout_completed',
  'trial_started',
  'subscription_started',
  'payment_failed',
  'subscription_past_due',
  'subscription_cancelled',
  'subscription_updated',
] as const

const APPROVED_BILLING_PROPERTY_KEYS = new Set([
  'organization_id',
  'plan',
  'plan_status',
  'billing_cadence',
  'amount_cents',
  'currency',
  'has_payment_method',
])

const SENSITIVE_PROPERTY_PATTERN =
  /(email|name|title|description|body|comment|note|filename|file_name|s3|key|patient|phi|evidence|text|address|phone|stripe|customer|invoice|subscription|url)/i
const EMAIL_VALUE_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const SAFE_ORGANIZATION_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,127}$/i

export type BillingAnalyticsEvent = (typeof BILLING_ANALYTICS_EVENTS)[number]
export type BillingAnalyticsProperties = Record<string, unknown>

function isApprovedBillingAnalyticsEvent(eventName: string): eventName is BillingAnalyticsEvent {
  return BILLING_ANALYTICS_EVENTS.includes(eventName as BillingAnalyticsEvent)
}

function sanitizeBillingAnalyticsProperties(properties: BillingAnalyticsProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (!APPROVED_BILLING_PROPERTY_KEYS.has(key)) return false
      if (SENSITIVE_PROPERTY_PATTERN.test(key)) return false
      if (typeof value === 'string' && EMAIL_VALUE_PATTERN.test(value)) return false
      return value !== undefined && value !== null && value !== ''
    }),
  )
}

function isSafeOrganizationId(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (!SAFE_ORGANIZATION_ID_PATTERN.test(value)) return false
  if (EMAIL_VALUE_PATTERN.test(value)) return false
  if (/^(cus|sub|in|pi|pm|cs)_/i.test(value)) return false
  return !SENSITIVE_PROPERTY_PATTERN.test(value)
}

export async function captureBillingAnalyticsEvent(
  eventName: BillingAnalyticsEvent,
  properties: BillingAnalyticsProperties,
) {
  if (!isApprovedBillingAnalyticsEvent(eventName)) {
    throw new Error(`Unsupported billing analytics event: ${eventName}`)
  }

  const apiKey = process.env.VITE_POSTHOG_KEY
  const organizationId = isSafeOrganizationId(properties.organization_id)
    ? properties.organization_id
    : null

  if (!apiKey || !organizationId) return

  const sanitizedProperties = sanitizeBillingAnalyticsProperties(properties)

  await fetch(POSTHOG_CAPTURE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      event: eventName,
      distinct_id: organizationId,
      timestamp: new Date().toISOString(),
      properties: {
        ...sanitizedProperties,
        $groups: { organization: organizationId },
      },
    }),
  })
}
