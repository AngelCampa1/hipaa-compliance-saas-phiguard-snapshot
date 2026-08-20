import { uuid, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'

/**
 * Returns a tenant_id column referencing organizations(id).
 * Use as an assignment (not a spread) in table definitions:
 *   tenantId: tenantIdCol()   ✓
 *   ...tenantIdCol()          ✗
 */
export function tenantIdCol() {
  return uuid('tenant_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' })
}

export function timestamps() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
  }
}
