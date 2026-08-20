import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { timestamps } from './_conventions.js'

export const evidenceSourceEnum = pgEnum('soc2_evidence_source', [
  'audit_log', 'manual_upload', 'automated_check',
])

export const soc2Evidence = pgTable('soc2_evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  controlId: text('control_id').notNull(), // e.g. 'CC6.1' - not FK, controls may be global
  source: evidenceSourceEnum('source').notNull(),
  collectedAt: timestamp('collected_at', { withTimezone: true }).notNull().defaultNow(),
  fileKey: text('file_key'),         // storage key for manual uploads
  queryRef: text('query_ref'),       // description of automated query
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  ...timestamps(),
})

export type Soc2Evidence = typeof soc2Evidence.$inferSelect
export type NewSoc2Evidence = typeof soc2Evidence.$inferInsert
