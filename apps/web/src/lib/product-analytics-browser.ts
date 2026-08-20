import {
  PRODUCT_ANALYTICS_CAPTURE_PATH,
  createProductAnalytics,
  getProductAnalyticsRowCountBucket,
  isApprovedProductAnalyticsEvent,
  isPublicSignupAnalyticsEvent,
  isSafePublicSignupDistinctId,
  sanitizePublicSignupAnalyticsProperties,
  type ProductAnalytics,
  type PublicProductAnalyticsEvent,
} from './product-analytics'

export { getProductAnalyticsRowCountBucket }

declare global {
  interface Window {
    phiguardProductAnalytics?: ProductAnalytics
  }
}

export function initProductAnalytics(input: {
  distinctId?: string
  organization?: {
    id: string
    plan?: string | null
    planStatus?: string | null
    memberCount?: number | null
    locationCount?: number | null
  }
}) {
  if (typeof window === 'undefined') return null

  const analytics = createProductAnalytics({
    apiKey: import.meta.env.VITE_POSTHOG_KEY,
    distinctId: input.distinctId,
    organization: input.organization,
  })

  window.phiguardProductAnalytics = analytics
  const signupDistinctId = getExistingSignupAnalyticsDistinctId()
  if (signupDistinctId) {
    void analytics.aliasSignupDistinctId(signupDistinctId).catch(() => undefined)
  }
  void analytics.identifyUser().catch(() => undefined)
  void analytics.identifyOrganization().catch(() => undefined)
  return analytics
}

export function trackProductEvent(
  eventName: Parameters<ProductAnalytics['capture']>[0],
  properties?: Parameters<ProductAnalytics['capture']>[1],
) {
  if (typeof window === 'undefined') return
  void window.phiguardProductAnalytics?.capture(eventName, properties).catch(() => undefined)
}

function getSignupAnalyticsDistinctId() {
  const storageKey = 'phiguard_signup_analytics_id'
  const existing = window.localStorage.getItem(storageKey)
  if (isSafePublicSignupDistinctId(existing)) return existing

  const generated =
    typeof window.crypto?.randomUUID === 'function'
      ? `signup_${window.crypto.randomUUID().replace(/-/g, '')}`
      : `signup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(storageKey, generated)
  return generated
}

function getExistingSignupAnalyticsDistinctId() {
  const existing = window.localStorage.getItem('phiguard_signup_analytics_id')
  return isSafePublicSignupDistinctId(existing) ? existing : undefined
}

function getPublicAnalyticsDistinctId() {
  const storageKey = 'phiguard_public_analytics_id'
  const existing = window.localStorage.getItem(storageKey)
  if (isSafePublicSignupDistinctId(existing)) return existing

  const generated =
    typeof window.crypto?.randomUUID === 'function'
      ? `public_${window.crypto.randomUUID().replace(/-/g, '')}`
      : `public_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(storageKey, generated)
  return generated
}

export function trackPublicSignupEvent(
  eventName:
    | 'signup_started'
    | 'signup_completed'
    | 'signup_failed'
    | 'signup_confirmation_resent'
    | 'signup_confirmation_resend_failed'
    | 'signup_continue_clicked',
  properties: Record<string, unknown> = {},
) {
  trackPublicAnalyticsEvent(eventName, properties)
}

export function trackPublicAuthEvent(
  eventName: Exclude<PublicProductAnalyticsEvent, Parameters<typeof trackPublicSignupEvent>[0]>,
  properties: Record<string, unknown> = {},
) {
  trackPublicAnalyticsEvent(eventName, properties, getSignupAnalyticsDistinctId)
}

export function trackPublicPartnerEvent(
  eventName:
    | 'partner_magic_link_requested'
    | 'partner_magic_link_request_failed'
    | 'partner_magic_link_check_email_viewed'
    | 'partner_login_error_viewed'
    | 'partner_dashboard_viewed'
    | 'partner_dashboard_empty_state_viewed'
    | 'partner_dashboard_error_viewed'
    | 'partner_dashboard_retry_clicked'
    | 'partner_referral_link_copied',
  properties: Record<string, unknown> = {},
) {
  trackPublicAnalyticsEvent(eventName, properties, getPublicAnalyticsDistinctId)
}

function trackPublicAnalyticsEvent(
  eventName: string,
  properties: Record<string, unknown>,
  getDistinctId = getSignupAnalyticsDistinctId,
) {
  if (typeof window === 'undefined') return
  if (!isApprovedProductAnalyticsEvent(eventName) || !isPublicSignupAnalyticsEvent(eventName))
    return

  const apiKey = import.meta.env.VITE_POSTHOG_KEY
  if (!apiKey) return

  void fetch(PRODUCT_ANALYTICS_CAPTURE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      api_key: apiKey,
      event: eventName,
      distinct_id: getDistinctId(),
      timestamp: new Date().toISOString(),
      properties: sanitizePublicSignupAnalyticsProperties(properties),
    }),
  }).catch(() => undefined)
}
