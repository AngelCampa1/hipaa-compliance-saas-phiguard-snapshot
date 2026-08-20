import { boolean, pgEnum, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { timestamps } from './_conventions.js'

export const locationStatusEnum = pgEnum('location_status', ['active', 'inactive'])

export const locations = pgTable(
  'locations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: locationStatusEnum('status').notNull().default('active'),
    isPrimary: boolean('is_primary').notNull().default(false),
    ...timestamps(),
  },
  (t) => [unique().on(t.organizationId, t.slug)],
)

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
