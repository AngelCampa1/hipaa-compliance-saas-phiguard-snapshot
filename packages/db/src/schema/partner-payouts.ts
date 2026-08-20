import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, uuid, integer, text, timestamp, check } from 'drizzle-orm/pg-core'
import { partners } from './partners.js'
import { timestamps } from './_conventions.js'

export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'paid', 'cancelled'])

export const partnerPayouts = pgTable(
  'partner_payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'cascade' }),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
    amountCents: integer('amount_cents').notNull(),
    status: payoutStatusEnum('status').notNull().default('pending'),
    externalReference: text('external_reference'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    check(
      'partner_payouts_paid_reference_check',
      sql`${table.status} != 'paid' OR (${table.externalReference} IS NOT NULL AND length(btrim(${table.externalReference})) > 0 AND ${table.paidAt} IS NOT NULL)`,
    ),
  ],
)
export type PartnerPayout = typeof partnerPayouts.$inferSelect
