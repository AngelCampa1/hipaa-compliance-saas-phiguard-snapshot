import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { locations } from './locations.js'
import { timestamps, tenantIdCol } from './_conventions.js'

export const policyStatusEnum = pgEnum('policy_status', ['draft', 'published', 'archived'])

// Named 'program_policies' in the database to avoid collision with compliance-starter 'policies' table
export const programPolicies = pgTable('program_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  bodyMarkdown: text('body_markdown').notNull(),
  version: text('version').notNull().default('1.0'),
  effectiveDate: timestamp('effective_date', { withTimezone: true }),
  requiresAcknowledgement: boolean('requires_acknowledgement').notNull().default(true),
  status: policyStatusEnum('status').notNull().default('draft'),
  ...timestamps(),
})

export type ProgramPolicy = typeof programPolicies.$inferSelect
