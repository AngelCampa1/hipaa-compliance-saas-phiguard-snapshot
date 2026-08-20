import { boolean, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps, tenantIdCol } from './_conventions.js'

export const trainingCourses = pgTable('training_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  title: text('title').notNull(),
  description: text('description'),
  frequencyDays: integer('frequency_days').notNull().default(365),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps(),
})

export type TrainingCourse = typeof trainingCourses.$inferSelect
