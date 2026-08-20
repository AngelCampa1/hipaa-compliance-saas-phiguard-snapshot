import { index, inet, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { tenantIdCol, timestamps } from './_conventions.js'
import { users } from './users.phi.js'

export const legalDocumentTypeEnum = pgEnum('legal_document_type', ['terms', 'baa'])

export const legalAcceptances = pgTable(
  'legal_acceptances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdCol(),
    documentType: legalDocumentTypeEnum('document_type').notNull(),
    documentVersion: text('document_version').notNull(),
    documentTitle: text('document_title').notNull(),
    contentHash: text('content_hash').notNull(),
    customerEntityName: text('customer_entity_name').notNull(),
    signerName: text('signer_name').notNull(),
    signerTitle: text('signer_title').notNull(),
    signerEmail: text('signer_email').notNull(),
    acceptedByUserId: uuid('accepted_by_user_id').notNull().references(() => users.id),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }).notNull().defaultNow(),
    ip: inet('ip'),
    userAgent: text('user_agent'),
    snapshot: jsonb('snapshot').notNull(),
    executedPdfBase64: text('executed_pdf_base64'),
    executedPdfSha256: text('executed_pdf_sha256'),
    executedPdfSizeBytes: integer('executed_pdf_size_bytes'),
    executedPdfMimeType: text('executed_pdf_mime_type'),
    ...timestamps(),
  },
  (table) => [
    index('idx_legal_acceptances_tenant_type_ts').on(
      table.tenantId,
      table.documentType,
      table.acceptedAt.desc(),
    ),
  ],
)

export type LegalAcceptance = typeof legalAcceptances.$inferSelect
export type NewLegalAcceptance = typeof legalAcceptances.$inferInsert
