import { pgTable, uuid, text } from 'drizzle-orm/pg-core'
import { tenantIdCol, timestamps } from './_conventions.js'

export const aiCsEscalations = pgTable('ai_cs_escalations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull(),
  appId: text('app_id').notNull().default('phiguard'),
  reason: text('reason'),
  message: text('message'),
  contact: text('contact'),
  currentPath: text('current_path'),
  status: text('status').notNull().default('open'),
  ...timestamps(),
})

export type AiCsEscalation = typeof aiCsEscalations.$inferSelect
export type NewAiCsEscalation = typeof aiCsEscalations.$inferInsert
