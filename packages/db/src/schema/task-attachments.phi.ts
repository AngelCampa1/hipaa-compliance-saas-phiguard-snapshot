import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { tenantIdCol } from './_conventions.js'
import { tasks } from './tasks.phi.js'
import { users } from './users.phi.js'

export const avStatusEnum = pgEnum('av_status', ['pending', 'clean', 'infected', 'skipped'])

export const taskAttachments = pgTable('task_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  tenantId: tenantIdCol(),
  s3Key: text('s3_key').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  uploadedBy: uuid('uploaded_by')
    .notNull()
    .references(() => users.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  avStatus: avStatusEnum('av_status').notNull().default('pending'),
})

export type TaskAttachment = typeof taskAttachments.$inferSelect
export type NewTaskAttachment = typeof taskAttachments.$inferInsert
