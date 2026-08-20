import { setObjectStorageBindings, type ObjectStorageBucket } from '@phiguard/audit'
import { BILLING_CADENCES, PLANS, PROMOTIONS, PUBLIC_PLAN_IDS } from '@phiguard/billing/plans'
import { setMarketingDbBinding, type MarketingD1Database } from '@phiguard/marketing-db/server'

const STRIPE_PRICE_BINDING_KEYS = PUBLIC_PLAN_IDS.flatMap((planId) =>
  BILLING_CADENCES.map((cadence) => PLANS[planId].stripePriceEnvKeys[cadence]),
)
const STRIPE_PROMOTION_BINDING_KEYS = Object.values(PROMOTIONS).map(
  (promotion) => promotion.stripeCouponEnvKey,
)

const STRING_BINDING_KEYS = [
  'APP_ENV',
  'APP_URL',
  'AI_CS_CLIENT_ASSERTION_SECRET',
  'AI_CS_FREE_TEXT_ENABLED',
  'AI_CS_WORKER_ORIGIN',
  'ATTACHMENT_SCAN_REQUEST_SECRET',
  'ATTACHMENT_SCAN_REQUEST_URL',
  'ATTACHMENT_SCAN_WEBHOOK_SECRET',
  'AUTH_SECRET',
  'AUTH_TOKEN_ENCRYPTION_KEY',
  'AUTH_TOKEN_KEY_ID',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'DATABASE_SSL',
  'DATABASE_URL',
  'DISABLE_RATE_LIMIT',
  'DIRECT_UPLOAD_SECRET',
  'EMAIL_FROM',
  'ENABLE_MOCK_UPLOADS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REDIRECT_URI',
  'INTEGRATION_TOKEN_ENCRYPTION_KEY',
  'INTEGRATION_KMS_KEY_ID',
  'INTEGRATION_TOKEN_KEY_ID',
  'MAIL_SMTP_HOST',
  'MAIL_SMTP_PORT',
  'MARKETING_SITE_URL',
  'MICROSOFT_OAUTH_CLIENT_ID',
  'MICROSOFT_OAUTH_CLIENT_SECRET',
  'MICROSOFT_OAUTH_REDIRECT_URI',
  'MICROSOFT_TENANT_ID',
  'NODE_ENV',
  'PHIGUARD_READ_ONLY_MODE',
  'PRODUCT_ANALYTICS_ENABLED',
  'R2_ATTACHMENTS_BUCKET',
  'R2_AUDIT_EXPORTS_BUCKET',
  'R2_LEAD_MAGNETS_BUCKET',
  'R2_PUBLIC_ORIGIN',
  'RESEND_API_KEY',
  'RESEND_WEBHOOK_SECRET',
  'SEQUENCER_BASE_URL',
  'SEQUENCER_CF_ACCESS_CLIENT_ID',
  'SEQUENCER_CF_ACCESS_CLIENT_SECRET',
  'SENTRY_API_DSN',
  'SENTRY_DSN',
  'SCHEDULED_JOBS_ENABLED',
  'STRIPE_PRICE_CLINIC',
  'STRIPE_PRICE_ESSENTIALS',
  'STRIPE_PRICE_GROUP',
  ...STRIPE_PRICE_BINDING_KEYS,
  ...STRIPE_PROMOTION_BINDING_KEYS,
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TRUSTED_PROXY',
  'CAPTCHA_SECRET_KEY',
  'CAPTCHA_VERIFY_URL',
  'TURNSTILE_SECRET_KEY',
  'VITE_APP_ENV',
  'VITE_POSTHOG_KEY',
  'VITE_SENTRY_APP_DSN',
  'VITE_SENTRY_DSN',
] as const

type RuntimeBindings = Record<string, unknown> & {
  HYPERDRIVE?: {
    connectionString?: string
  }
  MARKETING_DB?: MarketingD1Database
  R2_ATTACHMENTS?: ObjectStorageBucket
  R2_AUDIT_EXPORTS?: ObjectStorageBucket
  R2_LEAD_MAGNETS?: ObjectStorageBucket
  ATTACHMENTS_BUCKET?: ObjectStorageBucket
  AUDIT_EXPORTS_BUCKET?: ObjectStorageBucket
  LEAD_MAGNETS_BUCKET?: ObjectStorageBucket
}

function setEnvValue(key: string, value: string | undefined) {
  if (!value) {
    return
  }

  process.env[key] = value
}

export function syncRuntimeEnv(bindings?: RuntimeBindings) {
  if (!bindings) {
    setObjectStorageBindings()
    setMarketingDbBinding()
    return
  }

  for (const key of STRING_BINDING_KEYS) {
    const value = bindings[key]
    if (typeof value === 'string' && value) {
      process.env[key] = value
    }
  }

  const hyperdriveConnectionString = bindings.HYPERDRIVE?.connectionString
  if (hyperdriveConnectionString) {
    process.env.DATABASE_URL = hyperdriveConnectionString
  }

  setEnvValue('DATABASE_SSL', process.env.DATABASE_SSL ?? 'true')
  setEnvValue('NODE_ENV', process.env.NODE_ENV ?? 'production')
  setEnvValue('TRUSTED_PROXY', process.env.TRUSTED_PROXY ?? 'true')

  if (!process.env.BETTER_AUTH_URL && process.env.APP_URL) {
    process.env.BETTER_AUTH_URL = process.env.APP_URL
  }

  setObjectStorageBindings({
    attachments: bindings.ATTACHMENTS_BUCKET ?? bindings.R2_ATTACHMENTS,
    auditExports: bindings.AUDIT_EXPORTS_BUCKET ?? bindings.R2_AUDIT_EXPORTS,
    leadMagnets: bindings.LEAD_MAGNETS_BUCKET ?? bindings.R2_LEAD_MAGNETS,
  })
  setMarketingDbBinding(bindings.MARKETING_DB)
}
