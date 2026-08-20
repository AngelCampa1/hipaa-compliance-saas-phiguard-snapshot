import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { partnerPayouts } from './partner-payouts.js'
import { partners } from './partners.js'
import { referrals } from './referrals.js'
import { timestamps } from './_conventions.js'

export const referralRevenueEvents = pgTable(
  'referral_revenue_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referralId: uuid('referral_id')
      .notNull()
      .references(() => referrals.id, { onDelete: 'cascade' }),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    stripeInvoiceId: text('stripe_invoice_id').notNull(),
    amountCents: integer('amount_cents').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }).notNull(),
    payoutId: uuid('payout_id').references(() => partnerPayouts.id, { onDelete: 'set null' }),
    payoutAllocatedAt: timestamp('payout_allocated_at', { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('referral_revenue_events_stripe_invoice_id_unique').on(table.stripeInvoiceId),
    index('referral_revenue_events_partner_paid_at_idx').on(table.partnerId, table.paidAt),
    index('referral_revenue_events_referral_id_idx').on(table.referralId),
    index('referral_revenue_events_payout_id_idx').on(table.payoutId),
  ],
)

export type ReferralRevenueEvent = typeof referralRevenueEvents.$inferSelect
