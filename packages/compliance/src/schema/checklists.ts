import { pgTable, pgEnum, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { locations, timestamps, tenantIdCol } from '@phiguard/db'
import { checklistTemplates } from './checklist-templates.js'

export const checklistStatusEnum = pgEnum('checklist_status', ['active', 'completed', 'archived'])

export const checklists = pgTable('checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => checklistTemplates.id),
  name: text('name').notNull(),
  status: checklistStatusEnum('status').notNull().default('active'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  ...timestamps(),
})

export type Checklist = typeof checklists.$inferSelect
export type NewChecklist = typeof checklists.$inferInsert
