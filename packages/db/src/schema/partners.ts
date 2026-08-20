import { pgEnum, pgTable, text, uuid, integer } from 'drizzle-orm/pg-core'
import { timestamps } from './_conventions.js'

export const partnerStatusEnum = pgEnum('partner_status', ['active', 'pending', 'inactive'])

export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  company: text('company'),
  website: text('website'),
  referralCode: text('referral_code').notNull().unique(),
  commissionPct: integer('commission_pct').notNull().default(20),
  status: partnerStatusEnum('status').notNull().default('pending'),
  ...timestamps(),
})
export type Partner = typeof partners.$inferSelect
