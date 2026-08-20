import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { partners } from './partners.js'
import { timestamps } from './_conventions.js'

export const partnerUsers = pgTable('partner_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').notNull().references(() => partners.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  ...timestamps(),
})
export type PartnerUser = typeof partnerUsers.$inferSelect
