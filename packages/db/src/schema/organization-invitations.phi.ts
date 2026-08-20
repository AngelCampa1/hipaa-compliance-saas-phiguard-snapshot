import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { users } from './users.phi.js'
import { roleEnum } from './memberships.js'

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'rejected',
  'canceled',
])

export const organizationInvitations = pgTable('organization_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: roleEnum('role').notNull().default('location_staff'),
  status: invitationStatusEnum('status').notNull().default('pending'),
  teamId: text('team_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  inviterId: uuid('inviter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export type OrganizationInvitation = typeof organizationInvitations.$inferSelect
export type NewOrganizationInvitation = typeof organizationInvitations.$inferInsert
