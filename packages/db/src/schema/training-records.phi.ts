import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { trainingCourses } from './training-courses.js'
import { users } from './users.phi.js'
import { timestamps } from './_conventions.js'

export const trainingStatusEnum = pgEnum('training_status', [
  'not_started',
  'in_progress',
  'completed',
  'overdue',
])

export const trainingRecords = pgTable(
  'training_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => trainingCourses.id, { onDelete: 'cascade' }),
    status: trainingStatusEnum('status').notNull().default('not_started'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
    certificateFileKey: text('certificate_file_key'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('training_records_user_course_unique').on(table.userId, table.courseId),
  ],
)

export type TrainingRecord = typeof trainingRecords.$inferSelect
