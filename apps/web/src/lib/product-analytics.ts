import { PUBLIC_PLAN_IDS } from '@phiguard/billing/plans'

export const POSTHOG_CAPTURE_URL = 'https://us.i.posthog.com/capture/'
export const PRODUCT_ANALYTICS_CAPTURE_PATH = '/api/analytics/product'

const SENSITIVE_PROPERTY_PATTERN =
  /(email|name|title|description|body|comment|note|filename|file_name|s3|key|patient|phi|evidence|text|address|phone)/i
const EMAIL_VALUE_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PUBLIC_SIGNUP_DISTINCT_ID_PATTERN =
  /^(?:signup|public)_(?:[a-f0-9]{32}|[a-z0-9]{6,13}_[a-z0-9]{8,16})$/i
const PUBLIC_SIGNUP_PLANS = new Set<string>(PUBLIC_PLAN_IDS)
const PUBLIC_SIGNUP_SOURCES = new Set(['email', 'google'])
const PUBLIC_SIGNUP_STATUSES = new Set(['attempted', 'succeeded', 'failed'])
const PUBLIC_SIGNUP_CTA_LOCATIONS = new Set(['pricing-card'])
const PUBLIC_SIGNUP_REASONS = new Set([
  'weak_password',
  'auth_error',
  'google_error',
  'invalid_credentials',
  'request_failed',
  'email_mismatch',
  'expired',
  'invalid_link',
])
const PUBLIC_AUTH_ACTIONS = new Set(['accept_invite'])
const PUBLIC_PARTNER_ACTIONS = new Set([
  'magic_link',
  'referral_redirect',
  'retry',
  'copy_referral_link',
])
const PUBLIC_PARTNER_CATEGORIES = new Set(['referrals', 'partner_login', 'partner_dashboard'])
const PUBLIC_ATTRIBUTION_VALUE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/i
const PUBLIC_REFERRER_HOST_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}\.)+[a-z]{2,}$/i
const PUBLIC_FIRST_TOUCH_ID_PATTERN = /^ft_[a-z0-9]{6,13}_[a-z0-9]{8,16}$/i
const PUBLIC_ATTRIBUTION_SENSITIVE_VALUE_PATTERN =
  /(clinic|patient|phone|address|owner|staff|doctor|provider|member|email|name)/i
const PHONE_LIKE_VALUE_PATTERN = /\d{3}[-.\s]?\d{4}/

export const PUBLIC_PRODUCT_ANALYTICS_EVENTS = [
  'signup_started',
  'signup_completed',
  'signup_failed',
  'signup_confirmation_resent',
  'signup_confirmation_resend_failed',
  'signup_continue_clicked',
  'login_started',
  'login_completed',
  'login_failed',
  'login_google_started',
  'login_google_failed',
  'password_reset_link_clicked',
  'signup_link_clicked',
  'password_reset_requested',
  'password_reset_request_failed',
  'password_reset_resent',
  'password_reset_resend_failed',
  'password_reset_email_changed',
  'login_link_clicked',
  'invite_viewed',
  'invite_accept_started',
  'invite_accept_completed',
  'invite_accept_failed',
  'invite_auth_redirect_clicked',
  'invite_signup_redirect_clicked',
  'partner_referral_opened',
  'partner_magic_link_requested',
  'partner_magic_link_request_failed',
  'partner_magic_link_check_email_viewed',
  'partner_magic_link_verified',
  'partner_magic_link_verify_failed',
  'partner_login_error_viewed',
  'partner_dashboard_viewed',
  'partner_dashboard_empty_state_viewed',
  'partner_dashboard_error_viewed',
  'partner_dashboard_retry_clicked',
  'partner_referral_link_copied',
] as const

export const APPROVED_PRODUCT_ANALYTICS_EVENTS = [
  ...PUBLIC_PRODUCT_ANALYTICS_EVENTS,
  'plan_selected',
  'legal_terms_accepted',
  'baa_signed',
  'trial_started',
  'checkout_started',
  'checkout_returned',
  'checkout_completed',
  'checkout_cancelled',
  'app_session_started',
  'app_page_viewed',
  'app_navigation_clicked',
  'app_nav_section_toggled',
  'app_account_menu_opened',
  'app_account_action_clicked',
  'app_support_link_clicked',
  'app_task_create_opened',
  'app_help_opened',
  'app_organization_switched',
  'app_action_blocked',
  'app_support_session_started',
  'app_support_message_sent',
  'app_support_response_received',
  'app_support_escalated',
  'app_support_error_shown',
  'feature_gate_viewed',
  'feature_gate_upgrade_clicked',
  'app_error_boundary_viewed',
  'app_error_retry_clicked',
  'dashboard_viewed',
  'activation_completed',
  'onboarding_plan_selected',
  'onboarding_validation_failed',
  'onboarding_documents_load_failed',
  'onboarding_action_failed',
  'onboarding_continue_clicked',
  'task_created',
  'task_empty_state_viewed',
  'task_completed',
  'task_assigned',
  'task_comment_added',
  'task_attachment_added',
  'task_list_viewed',
  'task_create_started',
  'task_filter_changed',
  'task_search_performed',
  'task_sort_changed',
  'task_page_changed',
  'task_selection_changed',
  'task_action_failed',
  'task_bulk_status_changed',
  'task_bulk_assigned',
  'task_status_changed',
  'task_due_date_updated',
  'task_updated',
  'task_archived',
  'checklist_assigned',
  'checklist_item_completed',
  'checklist_item_reopened',
  'checklist_evidence_uploaded',
  'checklist_evidence_downloaded',
  'checklist_completed',
  'checklist_archived',
  'checklist_location_filter_changed',
  'checklist_renamed',
  'checklist_deleted',
  'checklist_action_failed',
  'file_upload_completed',
  'file_upload_failed',
  'compliance_dashboard_viewed',
  'compliance_dashboard_section_opened',
  'compliance_program_dashboard_viewed',
  'compliance_program_section_opened',
  'incident_created',
  'incident_closed',
  'incident_updated',
  'incident_status_changed',
  'incident_update_added',
  'incident_list_viewed',
  'incident_report_started',
  'incident_filter_changed',
  'incident_search_performed',
  'incident_sort_changed',
  'incident_empty_state_viewed',
  'incident_exported',
  'policy_acknowledged',
  'policy_created',
  'policy_published',
  'policy_draft_updated',
  'policy_version_created',
  'policy_archived',
  'policy_restored',
  'policy_action_failed',
  'training_record_completed',
  'training_exported',
  'training_course_created',
  'training_course_status_changed',
  'training_assigned',
  'training_certificate_downloaded',
  'training_unassigned',
  'training_completion_reopened',
  'training_due_date_updated',
  'training_reassigned',
  'risk_assessment_created',
  'risk_item_created',
  'risk_item_updated',
  'risk_item_deleted',
  'risk_assessment_status_changed',
  'risk_assessment_reopened',
  'risk_assessment_renamed',
  'risk_assessment_deleted',
  'vendor_added',
  'vendor_baa_recorded',
  'vendor_updated',
  'vendor_status_changed',
  'vendor_baa_evidence_downloaded',
  'vendor_baa_history_opened',
  'vendor_baa_metadata_updated',
  'vendor_filter_changed',
  'vendor_sort_changed',
  'vendor_action_failed',
  'member_invited',
  'member_role_changed',
  'member_removed',
  'member_action_failed',
  'member_settings_retry_clicked',
  'member_role_change_dialog_opened',
  'member_role_change_cancelled',
  'member_remove_dialog_opened',
  'member_remove_cancelled',
  'invitation_resent',
  'invitation_cancelled',
  'invitation_link_opened',
  'location_created',
  'location_updated',
  'location_status_changed',
  'location_grants_updated',
  'location_action_failed',
  'location_settings_retry_clicked',
  'location_grant_update_blocked',
  'integration_connect_dialog_opened',
  'integration_connect_cancelled',
  'integration_compliance_acknowledged',
  'integration_connect_started',
  'integration_connect_completed',
  'integration_connect_failed',
  'integration_callback_completed',
  'integration_callback_failed',
  'integration_settings_load_failed',
  'integration_settings_retry_clicked',
  'integration_revoke_started',
  'integration_revoked',
  'integration_revoke_failed',
  'report_viewed',
  'report_exported',
  'report_export_failed',
  'report_drilldown_clicked',
  'report_sort_changed',
  'report_empty_state_viewed',
  'audit_search_performed',
  'audit_events_load_failed',
  'audit_events_retry_clicked',
  'audit_export_started',
  'audit_export_completed',
  'audit_export_failed',
  'access_reviews_viewed',
  'access_review_filter_changed',
  'access_review_sort_changed',
  'access_review_empty_state_viewed',
  'access_review_open_started',
  'access_review_open_cancelled',
  'access_review_action_failed',
  'access_review_feature_gate_viewed',
  'access_review_opened',
  'access_review_decision_recorded',
  'access_review_closed',
  'soc2_evidence_viewed',
  'soc2_evidence_filter_changed',
  'soc2_evidence_sort_changed',
  'soc2_evidence_empty_state_viewed',
  'soc2_evidence_action_failed',
  'soc2_evidence_feature_gate_viewed',
  'soc2_evidence_bundle_exported',
  'soc2_audit_evidence_collected',
  'soc2_evidence_downloaded',
  'soc2_evidence_recorded',
  'soc2_dashboard_viewed',
  'soc2_controls_viewed',
  'soc2_controls_filter_changed',
  'soc2_controls_search_performed',
  'soc2_controls_sort_changed',
  'soc2_control_evidence_opened',
  'soc2_auditor_viewed',
  'help_search_performed',
  'help_search_empty',
  'help_category_selected',
  'help_topic_opened',
  'dashboard_scope_changed',
  'dashboard_metric_clicked',
  'dashboard_action_clicked',
  'profile_viewed',
  'profile_section_started',
  'profile_display_name_updated',
  'profile_email_change_requested',
  'profile_password_updated',
  'profile_action_failed',
  'account_deletion_started',
  'account_deletion_requested',
  'security_keys_viewed',
  'security_key_enrollment_unavailable_viewed',
  'first_run_step_clicked',
  'first_run_banner_dismissed',
  'partner_admin_viewed',
  'partner_admin_filter_changed',
  'partner_admin_search_performed',
  'partner_admin_sort_changed',
  'partner_admin_exported',
  'partner_admin_empty_state_viewed',
  'partner_admin_payout_run_started',
  'partner_admin_payout_run_completed',
  'partner_admin_payout_run_failed',
  'partner_admin_partner_approved',
  'partner_admin_partner_approve_failed',
  'partner_admin_payout_marked_paid',
  'partner_admin_payout_mark_paid_failed',
  'partner_admin_access_denied_viewed',
  'partner_admin_load_retry_clicked',
  'billing_portal_opened',
  'payment_failed',
  'subscription_started',
  'subscription_past_due',
  'subscription_cancelled',
  'subscription_updated',
  'downgrade_warning_shown',
  'billing_plan_selected',
  'billing_cadence_changed',
  'billing_action_failed',
  'billing_invoice_opened',
  'billing_legal_document_downloaded',
  'billing_legal_document_download_failed',
] as const

const APPROVED_PROPERTY_KEYS = new Set([
  'source_app',
  'page_path',
  'landing_page',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'referring_domain',
  'country',
  'lead_type',
  'activation_type',
  'route',
  'destination_route',
  'source',
  'medium',
  'campaign',
  'content',
  'term',
  'page_category',
  'landing_path',
  'plan',
  'plan_status',
  'previous_plan_status',
  'role',
  'status',
  'priority',
  'feature',
  'action',
  'provider',
  'report_type',
  'export_format',
  'filter_count',
  'row_count_bucket',
  'visible_row_count_bucket',
  'open_row_count_bucket',
  'has_active_filters',
  'can_write',
  'filter_type',
  'filter_state',
  'query_length_bucket',
  'empty_state_type',
  'sort_key',
  'sort_dir',
  'can_manage',
  'previous_role',
  'target_role',
  'trigger',
  'support_channel',
  'operation',
  'error_type',
  'reason',
  'category',
  'topic',
  'metric',
  'step',
  'step_name',
  'has_payment_method',
  'days_until_trial_end',
  'trial_day',
  'member_count_bucket',
  'location_count_bucket',
  'organization_age_days',
  'activation_status',
  'is_first_run',
  'count',
  'selected_plan',
  'minimum_plan',
  'missing_features',
  'billing_cadence',
  'document_type',
  'amount_cents',
  'currency',
])

const COARSE_STRING_PROPERTY_KEYS = new Set([
  'lead_type',
  'activation_type',
  'plan',
  'plan_status',
  'previous_plan_status',
  'role',
  'status',
  'priority',
  'feature',
  'action',
  'provider',
  'report_type',
  'export_format',
  'row_count_bucket',
  'sort_key',
  'sort_dir',
  'previous_role',
  'target_role',
  'trigger',
  'support_channel',
  'operation',
  'error_type',
  'reason',
  'category',
  'topic',
  'metric',
  'step',
  'step_name',
  'activation_status',
  'selected_plan',
  'minimum_plan',
  'billing_cadence',
  'document_type',
  'currency',
])
const COARSE_STRING_VALUE_PATTERN = /^[a-z0-9][a-z0-9_./:+-]{0,119}$/i

function isSafeScalarAnalyticsValue(value: unknown) {
  return (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  )
}

const ROUTE_PATTERNS: Array<[RegExp, string]> = [
  [/^\/signup$/, '/signup'],
  [/^\/signup\/check-email$/, '/signup/check-email'],
  [/^\/login$/, '/login'],
  [/^\/forgot-password$/, '/forgot-password'],
  [/^\/accept-invite\/[^/]+$/, '/accept-invite/$invitationId'],
  [/^\/partner\/login$/, '/partner/login'],
  [/^\/partner\/verify$/, '/partner/verify'],
  [/^\/partner\/dashboard$/, '/partner/dashboard'],
  [/^\/partner\/[^/]+$/, '/partner/$code'],
  [/^\/api\/uploads\/direct$/, '/api/uploads/direct'],
  [/^\/app\/dashboard$/, '/app/dashboard'],
  [/^\/app\/tasks$/, '/app/tasks'],
  [/^\/app\/tasks\/new$/, '/app/tasks/new'],
  [/^\/app\/tasks\/[^/]+$/, '/app/tasks/$taskId'],
  [/^\/app\/compliance$/, '/app/compliance'],
  [/^\/app\/compliance\/checklists$/, '/app/compliance/checklists'],
  [/^\/app\/compliance\/checklists\/[^/]+$/, '/app/compliance/checklists/$checklistId'],
  [/^\/app\/compliance\/program$/, '/app/compliance/program'],
  [/^\/app\/compliance\/program\/policies$/, '/app/compliance/program/policies'],
  [/^\/app\/compliance\/program\/policies\/[^/]+$/, '/app/compliance/program/policies/$policyId'],
  [/^\/app\/compliance\/program\/risk$/, '/app/compliance/program/risk'],
  [/^\/app\/compliance\/program\/training$/, '/app/compliance/program/training'],
  [/^\/app\/compliance\/program\/vendors$/, '/app/compliance/program/vendors'],
  [/^\/app\/compliance\/incidents$/, '/app/compliance/incidents'],
  [/^\/app\/compliance\/incidents\/new$/, '/app/compliance/incidents/new'],
  [/^\/app\/compliance\/incidents\/[^/]+$/, '/app/compliance/incidents/$incidentId'],
  [/^\/app\/compliance\/policies$/, '/app/compliance/policies'],
  [/^\/app\/reports$/, '/app/reports'],
  [/^\/app\/reports\/compliance$/, '/app/reports/compliance'],
  [/^\/app\/reports\/tasks$/, '/app/reports/tasks'],
  [/^\/app\/audit$/, '/app/audit'],
  [/^\/app\/audit\/export$/, '/app/audit/export'],
  [/^\/app\/help$/, '/app/help'],
  [/^\/app\/onboarding$/, '/app/onboarding'],
  [/^\/app\/billing$/, '/app/billing'],
  [/^\/app\/settings\/members$/, '/app/settings/members'],
  [/^\/app\/settings\/locations$/, '/app/settings/locations'],
  [/^\/app\/settings\/integrations$/, '/app/settings/integrations'],
  [/^\/app\/settings\/profile$/, '/app/settings/profile'],
  [/^\/app\/settings\/security-keys$/, '/app/settings/security-keys'],
  [/^\/api\/integrations\/[^/]+\/callback$/, '/api/integrations/$provider/callback'],
  [/^\/app\/soc2$/, '/app/soc2'],
  [/^\/app\/soc2\/controls$/, '/app/soc2/controls'],
  [/^\/app\/soc2\/evidence$/, '/app/soc2/evidence'],
  [/^\/app\/soc2\/auditor$/, '/app/soc2/auditor'],
  [/^\/app\/soc2\/access-reviews$/, '/app/soc2/access-reviews'],
  [/^\/app\/soc2\/access-reviews\/[^/]+$/, '/app/soc2/access-reviews/$reviewId'],
  [/^\/app\/admin\/partners$/, '/app/admin/partners'],
]

type ProductAnalyticsEvent = (typeof APPROVED_PRODUCT_ANALYTICS_EVENTS)[number]
export type PublicProductAnalyticsEvent = (typeof PUBLIC_PRODUCT_ANALYTICS_EVENTS)[number]
type ProductAnalyticsProperties = Record<string, unknown>

type ProductAnalyticsOrganization = {
  id: string
  plan?: string | null
  planStatus?: string | null
  memberCount?: number | null
  locationCount?: number | null
}

type ProductAnalyticsOptions = {
  apiKey: string | undefined
  distinctId: string | undefined
  organization: ProductAnalyticsOrganization | undefined
  fetch?: (url: string, init: RequestInit) => Promise<Response>
  captureUrl?: string
  now?: () => Date
}

export type ProductAnalytics = {
  capture: (
    eventName: ProductAnalyticsEvent,
    properties?: ProductAnalyticsProperties,
  ) => Promise<void>
  aliasSignupDistinctId: (signupDistinctId: string) => Promise<void>
  identifyUser: () => Promise<void>
  identifyOrganization: () => Promise<void>
}

export function captureServerProductAnalyticsEvent(input: {
  userId: string
  organizationId: string
  eventName: ProductAnalyticsEvent
  properties?: ProductAnalyticsProperties
}) {
  const analytics = createProductAnalytics({
    apiKey:
      process.env.PRODUCT_ANALYTICS_ENABLED === 'true'
        ? process.env.VITE_POSTHOG_KEY
        : undefined,
    distinctId: input.userId,
    organization: { id: input.organizationId },
    captureUrl: POSTHOG_CAPTURE_URL,
  })

  void analytics.capture(input.eventName, input.properties).catch(() => undefined)
}

function bucketCount(value: number | null | undefined) {
  if (!value || value <= 0) return '0'
  if (value === 1) return '1'
  if (value <= 5) return '2-5'
  if (value <= 10) return '6-10'
  if (value <= 30) return '11-30'
  if (value <= 100) return '31-100'
  return '101+'
}

export function getProductAnalyticsRowCountBucket(count: number | null | undefined) {
  if (count === null || count === undefined) return 'unknown'
  if (count === 0) return '0'
  if (count <= 100) return '1-100'
  if (count <= 1000) return '101-1000'
  if (count <= 10000) return '1001-10000'
  return '10001+'
}

export function normalizeProductAnalyticsRoute(route: string) {
  const pathname = route.split('?')[0]?.split('#')[0] ?? route
  const normalizedPathname =
    pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname

  const match = ROUTE_PATTERNS.find(([pattern]) => pattern.test(normalizedPathname))
  return match?.[1] ?? '/app/other'
}

export function sanitizeProductAnalyticsProperties(properties: ProductAnalyticsProperties = {}) {
  const sanitized = Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (!APPROVED_PROPERTY_KEYS.has(key)) return false
      if (!isSafeScalarAnalyticsValue(value)) return false
      if (SENSITIVE_PROPERTY_PATTERN.test(key) && key !== 'sort_key') return false
      if (typeof value === 'string' && EMAIL_VALUE_PATTERN.test(value)) return false
      if (
        typeof value === 'string' &&
        COARSE_STRING_PROPERTY_KEYS.has(key) &&
        !COARSE_STRING_VALUE_PATTERN.test(value)
      ) {
        return false
      }
      return value !== undefined && value !== null && value !== ''
    }),
  )

  if (typeof sanitized.route === 'string') {
    sanitized.route = normalizeProductAnalyticsRoute(sanitized.route)
  }
  if (typeof sanitized.destination_route === 'string') {
    sanitized.destination_route = normalizeProductAnalyticsRoute(sanitized.destination_route)
  }

  return sanitized
}

export function isApprovedProductAnalyticsEvent(
  eventName: string,
): eventName is ProductAnalyticsEvent {
  return APPROVED_PRODUCT_ANALYTICS_EVENTS.includes(eventName as ProductAnalyticsEvent)
}

export function isPublicSignupAnalyticsEvent(eventName: string) {
  return PUBLIC_PRODUCT_ANALYTICS_EVENTS.includes(eventName as PublicProductAnalyticsEvent)
}

export function isSafePublicSignupDistinctId(value: unknown): value is string {
  return typeof value === 'string' && PUBLIC_SIGNUP_DISTINCT_ID_PATTERN.test(value)
}

export async function capturePublicProductAnalyticsEvent(input: {
  apiKey: string | undefined
  eventName: PublicProductAnalyticsEvent
  distinctId: string
  properties?: ProductAnalyticsProperties
  fetch?: (url: string, init: RequestInit) => Promise<Response>
  now?: () => Date
}) {
  if (!input.apiKey) return
  if (!isPublicSignupAnalyticsEvent(input.eventName)) return
  if (!isSafePublicSignupDistinctId(input.distinctId)) return

  const captureFetch =
    input.fetch ?? ((url: string, init: RequestInit) => globalThis.fetch(url, init))
  const now = input.now ?? (() => new Date())

  try {
    await captureFetch(POSTHOG_CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: input.apiKey,
        event: input.eventName,
        distinct_id: input.distinctId,
        timestamp: now().toISOString(),
        properties: sanitizePublicSignupAnalyticsProperties(input.properties),
      }),
    })
  } catch {
    // Public analytics is best-effort and must not affect redirects or page actions.
  }
}

export function sanitizePublicSignupAnalyticsProperties(
  properties: ProductAnalyticsProperties = {},
) {
  const sanitized: ProductAnalyticsProperties = {}

  if (typeof properties.route === 'string') {
    const route = normalizeProductAnalyticsRoute(properties.route)
    if (
      route === '/signup' ||
      route === '/signup/check-email' ||
      route === '/login' ||
      route === '/forgot-password' ||
      route === '/accept-invite/$invitationId' ||
      route === '/partner/login' ||
      route === '/partner/verify' ||
      route === '/partner/dashboard' ||
      route === '/partner/$code'
    ) {
      sanitized.route = route
    }
  }

  if (typeof properties.destination_route === 'string') {
    sanitized.destination_route = normalizeProductAnalyticsRoute(properties.destination_route)
  }

  if (
    typeof properties.selected_plan === 'string' &&
    PUBLIC_SIGNUP_PLANS.has(properties.selected_plan)
  ) {
    sanitized.selected_plan = properties.selected_plan
  }

  if (typeof properties.source === 'string' && PUBLIC_SIGNUP_SOURCES.has(properties.source)) {
    sanitized.source = properties.source
  }

  if (typeof properties.status === 'string' && PUBLIC_SIGNUP_STATUSES.has(properties.status)) {
    sanitized.status = properties.status
  }

  if (typeof properties.reason === 'string' && PUBLIC_SIGNUP_REASONS.has(properties.reason)) {
    sanitized.reason = properties.reason
  }

  if (typeof properties.provider === 'string' && PUBLIC_SIGNUP_SOURCES.has(properties.provider)) {
    sanitized.provider = properties.provider
  }

  if (typeof properties.action === 'string' && PUBLIC_AUTH_ACTIONS.has(properties.action)) {
    sanitized.action = properties.action
  }

  if (typeof properties.action === 'string' && PUBLIC_PARTNER_ACTIONS.has(properties.action)) {
    sanitized.action = properties.action
  }

  if (
    typeof properties.category === 'string' &&
    PUBLIC_PARTNER_CATEGORIES.has(properties.category)
  ) {
    sanitized.category = properties.category
  }

  if (typeof properties.count === 'number' && Number.isFinite(properties.count)) {
    sanitized.count = Math.max(0, Math.min(10_000, Math.round(properties.count)))
  }

  if (typeof properties.landing_path === 'string') {
    const landingPath = normalizePublicLandingPath(properties.landing_path)
    if (landingPath) sanitized.landing_path = landingPath
  }

  if (typeof properties.initial_referrer_host === 'string') {
    const referrerHost = sanitizePublicReferrerHost(properties.initial_referrer_host)
    if (referrerHost) sanitized.initial_referrer_host = referrerHost
  }

  if (
    typeof properties.first_touch_id === 'string' &&
    PUBLIC_FIRST_TOUCH_ID_PATTERN.test(properties.first_touch_id)
  ) {
    sanitized.first_touch_id = properties.first_touch_id
  }

  for (const key of [
    'initial_utm_source',
    'initial_utm_medium',
    'initial_utm_campaign',
    'initial_utm_content',
    'initial_utm_term',
  ]) {
    const value = properties[key]
    if (typeof value !== 'string') continue

    const sanitizedValue = sanitizePublicAttributionValue(value)
    if (sanitizedValue) sanitized[key] = sanitizedValue
  }

  if (
    typeof properties.cta_location === 'string' &&
    PUBLIC_SIGNUP_CTA_LOCATIONS.has(properties.cta_location)
  ) {
    sanitized.cta_location = properties.cta_location
  }

  if (typeof properties.pricing_plan === 'string' && PUBLIC_SIGNUP_PLANS.has(properties.pricing_plan)) {
    sanitized.pricing_plan = properties.pricing_plan
  }

  return sanitized
}

function sanitizePublicAttributionValue(value: string) {
  const trimmed = value.trim().slice(0, 64)
  if (!trimmed || EMAIL_VALUE_PATTERN.test(trimmed)) return undefined
  if (!PUBLIC_ATTRIBUTION_VALUE_PATTERN.test(trimmed)) return undefined
  if (PUBLIC_ATTRIBUTION_SENSITIVE_VALUE_PATTERN.test(trimmed)) return undefined
  if (PHONE_LIKE_VALUE_PATTERN.test(trimmed)) return undefined
  return trimmed
}

function sanitizePublicReferrerHost(value: string) {
  const trimmed = value.trim().toLowerCase().slice(0, 120)
  if (!PUBLIC_REFERRER_HOST_PATTERN.test(trimmed)) return undefined
  if (PUBLIC_ATTRIBUTION_SENSITIVE_VALUE_PATTERN.test(trimmed)) return undefined
  return trimmed
}

function normalizePublicLandingPath(value: string) {
  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return undefined

  const path = trimmed.split('?')[0]?.split('#')[0]?.slice(0, 200)
  return path && path !== '/' ? path : '/'
}

function getOrganizationProperties(organization: ProductAnalyticsOrganization) {
  return {
    organization_id: organization.id,
    plan: organization.plan ?? undefined,
    plan_status: organization.planStatus ?? undefined,
    member_count_bucket: bucketCount(organization.memberCount),
    location_count_bucket: bucketCount(organization.locationCount),
  }
}

export function createProductAnalytics(options: ProductAnalyticsOptions): ProductAnalytics {
  const captureFetch =
    options.fetch ?? ((url: string, init: RequestInit) => globalThis.fetch(url, init))
  const captureUrl = options.captureUrl ?? PRODUCT_ANALYTICS_CAPTURE_PATH
  const now = options.now ?? (() => new Date())

  const send = async (eventName: string, properties: ProductAnalyticsProperties) => {
    if (!options.apiKey || !options.distinctId || !options.organization?.id) return

    await captureFetch(captureUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        api_key: options.apiKey,
        event: eventName,
        distinct_id: options.distinctId,
        timestamp: now().toISOString(),
        properties,
      }),
    })
  }

  return {
    async aliasSignupDistinctId(signupDistinctId) {
      if (
        !options.apiKey ||
        !options.distinctId ||
        !options.organization?.id ||
        !isSafePublicSignupDistinctId(signupDistinctId)
      ) {
        return
      }

      await captureFetch(captureUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          api_key: options.apiKey,
          event: '$create_alias',
          distinct_id: signupDistinctId,
          timestamp: now().toISOString(),
          properties: {},
        }),
      })
    },

    async capture(eventName, properties = {}) {
      if (!isApprovedProductAnalyticsEvent(eventName)) {
        throw new Error(`Unsupported product analytics event: ${eventName}`)
      }

      if (!options.organization) return

      await send(eventName, {
        ...getOrganizationProperties(options.organization),
        $groups: {
          organization: options.organization.id,
        },
        ...sanitizeProductAnalyticsProperties(properties),
      })
    },

    async identifyUser() {
      if (!options.organization) return

      await send('$set', {
        $set: getOrganizationProperties(options.organization),
        $groups: {
          organization: options.organization.id,
        },
      })
    },

    async identifyOrganization() {
      if (!options.organization) return

      const groupProperties = getOrganizationProperties(options.organization)
      const { organization_id: _organizationId, ...groupSet } = groupProperties

      await send('$groupidentify', {
        $group_type: 'organization',
        $group_key: options.organization.id,
        $group_set: groupSet,
      })
    },
  }
}
