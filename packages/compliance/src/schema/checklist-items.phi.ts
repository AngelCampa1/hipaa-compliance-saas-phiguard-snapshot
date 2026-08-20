import { pgTable, pgEnum, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { locations, timestamps, tenantIdCol, users } from '@phiguard/db'
import { checklists } from './checklists.js'

export const itemStatusEnum = pgEnum('checklist_item_status', ['pending', 'complete', 'na'])

export const checklistItems = pgTable('checklist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  checklistId: uuid('checklist_id').notNull().references(() => checklists.id, { onDelete: 'cascade' }),
  tenantId: tenantIdCol(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  hipaaReference: text('hipaa_reference'),
  status: itemStatusEnum('status').notNull().default('pending'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id, { onDelete: 'set null' }),
  // HIPAA: evidence field may contain PHI - see *.phi.ts naming convention
  evidence: text('evidence'), // s3 key if evidence file was uploaded
  ...timestamps(),
})

export type ChecklistItem = typeof checklistItems.$inferSelect
export type NewChecklistItem = typeof checklistItems.$inferInsert
