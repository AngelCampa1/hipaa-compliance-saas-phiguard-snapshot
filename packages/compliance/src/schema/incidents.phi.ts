import { pgTable, pgEnum, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { locations, timestamps, tenantIdCol } from '@phiguard/db'

// .phi.ts - the `summary` field may reference patient context (PHI-WARNING)
// See UI: incident intake form must display PHI warning on the summary field

export const incidentSeverityEnum = pgEnum('incident_severity', ['low', 'medium', 'high', 'critical'])
export const incidentCategoryEnum = pgEnum('incident_category', [
  'unauthorized_access',
  'lost_device',
  'phishing',
  'improper_disposal',
  'system_compromise',
  'workforce_violation',
  'other',
])
export const incidentStatusEnum = pgEnum('incident_status', [
  'reported',
  'triaging',
  'contained',
  'resolved',
  'closed',
])

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary'), // PHI-WARNING: may contain patient context - never log this field
  severity: incidentSeverityEnum('severity').notNull(),
  category: incidentCategoryEnum('category').notNull(),
  status: incidentStatusEnum('status').notNull().default('reported'),
  discoveredAt: timestamp('discovered_at', { withTimezone: true }).notNull(),
  discoveredBy: uuid('discovered_by'),
  affectedSystems: text('affected_systems').array(), // structured list, not free text
  reportedAt: timestamp('reported_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  ...timestamps(),
})

export type Incident = typeof incidents.$inferSelect
export type NewIncident = typeof incidents.$inferInsert
