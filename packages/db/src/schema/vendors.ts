import { jsonb, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps, tenantIdCol } from './_conventions.js'

export const vendorStatusEnum = pgEnum('vendor_status', ['active', 'inactive', 'pending_baa'])

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: tenantIdCol(),
  name: text('name').notNull(),
  website: text('website'),
  contactEmail: text('contact_email'),
  dataCategories: jsonb('data_categories').$type<string[]>().notNull().default([]),
  status: vendorStatusEnum('status').notNull().default('pending_baa'),
  ...timestamps(),
})

export type Vendor = typeof vendors.$inferSelect
