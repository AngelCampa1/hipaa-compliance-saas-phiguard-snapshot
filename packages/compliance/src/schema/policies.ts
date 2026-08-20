import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { timestamps, tenantIdCol } from '@phiguard/db'

// NOT .phi.ts - policy documents are not PHI
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  title: text('title').notNull(),
  body: text('body').notNull(), // markdown
  version: text('version').notNull().default('1.0'),
  effectiveAt: timestamp('effective_at', { withTimezone: true }),
  ...timestamps(),
})

export type Policy = typeof policies.$inferSelect
export type NewPolicy = typeof policies.$inferInsert
