import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { vendors } from './vendors.js'
import { timestamps } from './_conventions.js'

export const vendorBaas = pgTable('vendor_baas', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  signedAt: timestamp('signed_at', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  documentFileKey: text('document_file_key'),
  signerName: text('signer_name').notNull(),
  signerEmail: text('signer_email').notNull(),
  ...timestamps(),
})

export type VendorBaa = typeof vendorBaas.$inferSelect
