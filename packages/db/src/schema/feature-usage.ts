import { integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'

export const featureUsage = pgTable(
  'feature_usage',
  {
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    featureKey: text('feature_key').notNull(),
    firstUsedAt: timestamp('first_used_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow(),
    useCount: integer('use_count').notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.featureKey] })],
)

export type FeatureUsageRow = typeof featureUsage.$inferSelect
export type NewFeatureUsageRow = typeof featureUsage.$inferInsert
