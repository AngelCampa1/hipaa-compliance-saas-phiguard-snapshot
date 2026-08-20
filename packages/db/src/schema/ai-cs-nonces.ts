import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const aiCsNonces = pgTable('ai_cs_nonces', {
  nonce: text('nonce').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AiCsNonce = typeof aiCsNonces.$inferSelect
export type NewAiCsNonce = typeof aiCsNonces.$inferInsert
