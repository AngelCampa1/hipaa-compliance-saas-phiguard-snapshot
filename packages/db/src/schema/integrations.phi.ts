import { sql } from 'drizzle-orm'
import {
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { locations } from './locations.js'
import { users } from './users.phi.js'
import { timestamps } from './_conventions.js'

export const integrationProviderEnum = pgEnum('integration_provider', ['google', 'microsoft'])
export const integrationStatusEnum = pgEnum('integration_status', ['active', 'revoked', 'error'])

export const integrationConnections = pgTable(
  'integration_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
    provider: integrationProviderEnum('provider').notNull(),
    accountEmail: text('account_email').notNull(),
    accessTokenCiphertext: text('access_token_ciphertext').notNull(),
    refreshTokenCiphertext: text('refresh_token_ciphertext').notNull(),
    kmsKeyId: text('kms_key_id').notNull(),
    scopes: jsonb('scopes').$type<string[]>().notNull().default([]),
    status: integrationStatusEnum('status').notNull().default('active'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    installStartedAt: timestamp('install_started_at', { withTimezone: true }),
    installedByUserId: uuid('installed_by_user_id').references(() => users.id),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('integration_connections_org_provider_active_unique')
      .on(t.organizationId, t.provider)
      .where(sql`${t.status} = 'active'`),
  ],
)

export const integrationSyncRecords = pgTable(
  'integration_sync_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    connectionId: uuid('connection_id')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade' }),
    resourceType: text('resource_type').notNull(),
    resourceId: uuid('resource_id').notNull(),
    providerEventId: text('provider_event_id').notNull(),
    providerUrl: text('provider_url'),
    status: text('status').notNull().default('created'),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('integration_sync_records_connection_resource_unique').on(
      t.connectionId,
      t.resourceType,
      t.resourceId,
    ),
    uniqueIndex('integration_sync_records_connection_event_unique').on(
      t.connectionId,
      t.providerEventId,
    ),
    index('integration_sync_records_org_resource_idx').on(
      t.organizationId,
      t.resourceType,
      t.resourceId,
    ),
  ],
)

export type IntegrationConnection = typeof integrationConnections.$inferSelect
export type NewIntegrationConnection = typeof integrationConnections.$inferInsert
export type IntegrationSyncRecord = typeof integrationSyncRecords.$inferSelect
export type NewIntegrationSyncRecord = typeof integrationSyncRecords.$inferInsert
