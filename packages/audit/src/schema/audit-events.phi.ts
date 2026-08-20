import { pgTable, uuid, text, jsonb, inet, timestamp, index } from 'drizzle-orm/pg-core'

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    locationId: uuid('location_id'),
    actorId: text('actor_id').notNull(),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    ip: inet('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_events_tenant_ts').on(table.tenantId, table.createdAt.desc()),
    index('idx_audit_events_resource').on(table.resourceType, table.resourceId),
    index('idx_audit_events_actor_ts').on(table.actorId, table.createdAt.desc()),
  ],
)

export type AuditEvent = typeof auditEvents.$inferSelect
export type NewAuditEvent = typeof auditEvents.$inferInsert
