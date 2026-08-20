import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.phi.js'

export const planEnum = pgEnum('plan', ['essentials', 'clinic', 'group', 'compliance_ops'])
export const planStatusEnum = pgEnum('plan_status', [
  'selection_required',
  'trial_pending',
  'trialing',
  'active',
  'paused',
  'past_due',
  'canceled',
])

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  plan: planEnum('plan').notNull().default('essentials'),
  planStatus: planStatusEnum('plan_status').notNull().default('selection_required'),
  planSelectedAt: timestamp('plan_selected_at', { withTimezone: true }),
  interestedPlan: planEnum('interested_plan'),
  billingPriceMonthlyCents: integer('billing_price_monthly_cents'),
  trialStartedAt: timestamp('trial_started_at', { withTimezone: true }),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  baaSignedAt: timestamp('baa_signed_at', { withTimezone: true }),
  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
  maxMembers: integer('max_members').notNull().default(10),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  baaSignedByUserId: uuid('baa_signed_by_user_id').references(() => users.id),
  termsAcceptedByUserId: uuid('terms_accepted_by_user_id').references(() => users.id),
  baaSignedPdfS3Key: text('baa_signed_pdf_s3_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
