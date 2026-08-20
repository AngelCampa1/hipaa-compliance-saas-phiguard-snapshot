import { pgTable, uuid, text, pgEnum, timestamp } from 'drizzle-orm/pg-core'
import { locations } from './locations.js'
import { tenantIdCol, timestamps } from './_conventions.js'
import { users } from './users.phi.js'

export const taskStatusEnum = pgEnum('task_status', ['open', 'in_progress', 'blocked', 'done'])
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent'])

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('open'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  ...timestamps(),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
