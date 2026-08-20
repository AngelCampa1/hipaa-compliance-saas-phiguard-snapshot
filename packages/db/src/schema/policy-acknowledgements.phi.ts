import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { programPolicies } from './policies.js'
import { users } from './users.phi.js'
import { timestamps } from './_conventions.js'

export const policyAcknowledgements = pgTable(
  'policy_acknowledgements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    policyId: uuid('policy_id')
      .notNull()
      .references(() => programPolicies.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('policy_acknowledgements_policy_user_unique').on(table.policyId, table.userId),
  ],
)

export type PolicyAcknowledgement = typeof policyAcknowledgements.$inferSelect
