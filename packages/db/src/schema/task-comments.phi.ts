import { pgTable, uuid, text } from 'drizzle-orm/pg-core'
import { tenantIdCol, timestamps } from './_conventions.js'
import { tasks } from './tasks.phi.js'
import { users } from './users.phi.js'

export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  tenantId: tenantIdCol(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id),
  body: text('body').notNull(),
  ...timestamps(),
})

export type TaskComment = typeof taskComments.$inferSelect
export type NewTaskComment = typeof taskComments.$inferInsert
