import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.phi.js'
import { timestamps, tenantIdCol } from './_conventions.js'

export const riskAssessmentStatusEnum = pgEnum('risk_assessment_status', [
  'open',
  'in_review',
  'closed',
])
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high', 'critical'])

export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  title: text('title').notNull(),
  status: riskAssessmentStatusEnum('status').notNull().default('open'),
  reviewerId: uuid('reviewer_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  ...timestamps(),
})

export const riskItems = pgTable('risk_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => riskAssessments.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  description: text('description').notNull(),
  likelihood: integer('likelihood').notNull(), // 1-5
  impact: integer('impact').notNull(), // 1-5
  score: integer('score').notNull(), // computed: likelihood * impact
  mitigation: text('mitigation').notNull().default(''),
  ownerId: uuid('owner_id').references(() => users.id),
  dueAt: timestamp('due_at', { withTimezone: true }),
  status: riskLevelEnum('status').notNull().default('medium'),
  ...timestamps(),
})

export type RiskAssessment = typeof riskAssessments.$inferSelect
export type RiskItem = typeof riskItems.$inferSelect
