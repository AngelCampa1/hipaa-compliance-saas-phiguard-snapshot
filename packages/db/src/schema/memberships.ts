import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './_conventions.js'
import { users } from './users.phi.js'
import { organizations } from './organizations.js'

export const roleEnum = pgEnum('role', [
  'org_owner',
  'org_admin',
  'location_manager',
  'location_staff',
  'auditor',
])

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull().default('location_staff'),
    invitedBy: uuid('invited_by').references(() => users.id),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }).notNull().defaultNow(),
    ...timestamps(),
  },
  (t) => [unique().on(t.userId, t.tenantId)],
)

export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert
