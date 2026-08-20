import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './_conventions.js'
import { organizations } from './organizations.js'
import { users } from './users.phi.js'
import { memberships } from './memberships.js'

export const accessReviewStatusEnum = pgEnum('access_review_status', ['open', 'closed'])
export const reviewDecisionEnum = pgEnum('review_decision', ['keep', 'revoke', 'change_role'])

export const accessReviews = pgTable('access_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  status: accessReviewStatusEnum('status').notNull().default('open'),
  completedByUserId: uuid('completed_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  ...timestamps(),
})

export const accessReviewItems = pgTable('access_review_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').notNull().references(() => accessReviews.id, { onDelete: 'cascade' }),
  membershipId: uuid('membership_id')
    .notNull()
    .references(() => memberships.id, { onDelete: 'cascade' }),
  decision: reviewDecisionEnum('decision'),
  notes: text('notes'),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  ...timestamps(),
})

export type AccessReview = typeof accessReviews.$inferSelect
export type NewAccessReview = typeof accessReviews.$inferInsert
export type AccessReviewItem = typeof accessReviewItems.$inferSelect
export type NewAccessReviewItem = typeof accessReviewItems.$inferInsert
