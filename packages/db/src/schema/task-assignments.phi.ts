import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { tenantIdCol } from './_conventions.js'
import { tasks } from './tasks.phi.js'
import { users } from './users.phi.js'

export const taskAssignments = pgTable(
  'task_assignments',
  {
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: tenantIdCol(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    assignedBy: uuid('assigned_by')
      .notNull()
      .references(() => users.id),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.userId] })],
)

export type TaskAssignment = typeof taskAssignments.$inferSelect
export type NewTaskAssignment = typeof taskAssignments.$inferInsert
