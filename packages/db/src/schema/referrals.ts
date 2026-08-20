import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { partners } from './partners.js'
import { organizations } from './organizations.js'
import { timestamps } from './_conventions.js'

export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').notNull().references(() => partners.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  signedUpAt: timestamp('signed_up_at', { withTimezone: true }).notNull(),
  firstPaidAt: timestamp('first_paid_at', { withTimezone: true }),
  lifetimeValueCents: integer('lifetime_value_cents').notNull().default(0),
  totalPaidOutCents: integer('total_paid_out_cents').notNull().default(0),
  ...timestamps(),
}, (t) => [
  uniqueIndex('referrals_partner_id_organization_id_unique').on(t.partnerId, t.organizationId),
])
export type Referral = typeof referrals.$inferSelect
