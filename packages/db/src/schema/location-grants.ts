import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { tenantIdCol } from './_conventions.js'
import { memberships } from './memberships.js'
import { locations } from './locations.js'

export const locationGrants = pgTable(
  'location_grants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdCol(),
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => memberships.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.membershipId, t.locationId)],
)

export type LocationGrant = typeof locationGrants.$inferSelect
export type NewLocationGrant = typeof locationGrants.$inferInsert
