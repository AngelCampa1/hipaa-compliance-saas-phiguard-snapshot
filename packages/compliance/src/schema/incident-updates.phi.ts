import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { tenantIdCol, timestamps, users } from '@phiguard/db'
import { incidents } from './incidents.phi.js'

// .phi.ts - the `text` field is a free-form note that may contain patient context (PHI-WARNING)
// Append-only: never UPDATE or DELETE rows from this table.

export const incidentUpdates = pgTable('incident_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  incidentId: uuid('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id),
  text: text('text').notNull(), // PHI-WARNING: may contain patient context - never log this field
  ...timestamps(),
})

export type IncidentUpdate = typeof incidentUpdates.$inferSelect
export type NewIncidentUpdate = typeof incidentUpdates.$inferInsert
