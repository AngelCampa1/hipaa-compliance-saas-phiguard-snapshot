import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { locations, timestamps, tenantIdCol, users } from '@phiguard/db'
import { policies } from './policies.js'

export const policyAssignmentStatusEnum = pgEnum('policy_assignment_status', [
  'assigned',
  'completed',
])

export const policyAssignments = pgTable(
  'policy_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdCol(),
    policyId: uuid('policy_id')
      .notNull()
      .references(() => policies.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    status: policyAssignmentStatusEnum('status').notNull().default('assigned'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    assignedBy: uuid('assigned_by').references(() => users.id),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedBy: uuid('completed_by').references(() => users.id),
    ...timestamps(),
  },
  (t) => [unique().on(t.policyId, t.locationId)],
)

export type PolicyAssignment = typeof policyAssignments.$inferSelect
export type NewPolicyAssignment = typeof policyAssignments.$inferInsert
