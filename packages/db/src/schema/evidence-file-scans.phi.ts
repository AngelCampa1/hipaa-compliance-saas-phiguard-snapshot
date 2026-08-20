import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { tenantIdCol, timestamps } from './_conventions.js'
import { avStatusEnum } from './task-attachments.phi.js'
import { users } from './users.phi.js'

export const evidenceFileScans = pgTable(
  'evidence_file_scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdCol(),
    s3Key: text('s3_key').notNull(),
    avStatus: avStatusEnum('av_status').notNull().default('pending'),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
    scannedAt: timestamp('scanned_at', { withTimezone: true }),
    ...timestamps(),
  },
  (t) => [unique().on(t.tenantId, t.s3Key)],
)

export type EvidenceFileScan = typeof evidenceFileScans.$inferSelect
export type NewEvidenceFileScan = typeof evidenceFileScans.$inferInsert
