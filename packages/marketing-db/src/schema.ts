import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

const timestamp = (name: string) => text(name)
const createdAt = () =>
  text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

export const marketingLeads = sqliteTable(
  'marketing_leads',
  {
    id: id(),
    email: text('email').notNull(),
    magnetSlug: text('magnet_slug').notNull(),
    createdAt: createdAt(),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    referrer: text('referrer'),
    sourcePagePath: text('source_page_path'),
    landingPagePath: text('landing_page_path'),
    initialReferrerHost: text('initial_referrer_host'),
    initialUtmSource: text('initial_utm_source'),
    initialUtmMedium: text('initial_utm_medium'),
    initialUtmCampaign: text('initial_utm_campaign'),
    initialUtmContent: text('initial_utm_content'),
    initialUtmTerm: text('initial_utm_term'),
    ctaContext: text('cta_context'),
    consentMarketingAt: timestamp('consent_marketing_at'),
  },
  (t) => [
    unique('marketing_leads_email_slug_unique').on(t.email, t.magnetSlug),
    index('marketing_leads_magnet_slug_created_at_idx').on(t.magnetSlug, t.createdAt),
  ],
)

export type MarketingLead = typeof marketingLeads.$inferSelect
export type NewMarketingLead = typeof marketingLeads.$inferInsert

export const emailSubscriptions = sqliteTable('email_subscriptions', {
  id: id(),
  email: text('email').notNull().unique(),
  subscribed: integer('subscribed', { mode: 'boolean' }).notNull().default(true),
  unsubscribedAt: timestamp('unsubscribed_at'),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  source: text('source'),
  createdAt: createdAt(),
})

export type EmailSubscription = typeof emailSubscriptions.$inferSelect
export type NewEmailSubscription = typeof emailSubscriptions.$inferInsert

// Token-bucket rate-limit state for the marketing lead-capture form. Lives in D1
// alongside the marketing data it protects so throttling never touches Neon.
// Timestamps are ISO strings to match the rest of the marketing schema.
export const rateLimitBuckets = sqliteTable(
  'rate_limit_buckets',
  {
    bucketKey: text('bucket_key').primaryKey(),
    tokens: integer('tokens').notNull(),
    lastRefill: text('last_refill').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('rate_limit_buckets_updated_at_idx').on(t.updatedAt)],
)

export type RateLimitBucket = typeof rateLimitBuckets.$inferSelect
export type NewRateLimitBucket = typeof rateLimitBuckets.$inferInsert

