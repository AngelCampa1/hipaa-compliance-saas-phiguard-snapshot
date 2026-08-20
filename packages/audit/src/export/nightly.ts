/**
 * Nightly append-only export of audit events to object storage.
 *
 * Requirements:
 * - One object per tenant per day
 * - Gzip compressed JSONL
 * - Key format: exports/{YYYY}/{MM}/{DD}/{tenantId}/audit-{YYYY-MM-DD}.jsonl.gz
 * - Retention metadata for compliance mode
 */

import { gzipSync } from 'node:zlib'
import { and, asc, eq, gt, gte, lt, or, sql } from 'drizzle-orm'
import { auditEvents } from '../schema/audit-events.phi.js'
import { logger } from '../logger.js'
import { getAuditExportsBucketBinding, type ObjectStorageBucket } from '../object-storage.js'

const PAGE_SIZE = 1000
const COMPLIANCE_RETENTION_DAYS = 365 * 6

export interface NightlyExportOptions {
  bucket: string
  region?: string
  bucketBinding?: ObjectStorageBucket | null
}

function buildComplianceRetentionDate(from = new Date()) {
  const retainUntil = new Date(from)
  retainUntil.setUTCDate(retainUntil.getUTCDate() + COMPLIANCE_RETENTION_DAYS)
  return retainUntil
}

type AnyDb = {
  selectDistinct: (...args: unknown[]) => {
    from: (...args: unknown[]) => {
      where: (...args: unknown[]) => Promise<Array<{ tenantId: string }>>
    }
  }
  select: (...args: unknown[]) => {
    from: (...args: unknown[]) => {
      where: (...args: unknown[]) => {
        orderBy: (...args: unknown[]) => {
          limit: (count: number) => Promise<Array<Record<string, unknown>>>
        }
      }
    }
  }
}

export async function runNightlyExport(db: AnyDb, options: NightlyExportOptions) {
  const now = new Date()
  const windowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const windowStart = new Date(windowEnd)
  windowStart.setUTCDate(windowStart.getUTCDate() - 1)

  const tenantRows = await db
    .selectDistinct({ tenantId: auditEvents.tenantId })
    .from(auditEvents)
    .where(
      and(
        sql`${auditEvents.createdAt} >= ${windowStart.toISOString()}`,
        lt(auditEvents.createdAt, windowEnd),
        sql`${auditEvents.tenantId} IS NOT NULL`,
      ),
    )

  const tenantIds = tenantRows
    .map((row) => row.tenantId)
    .filter((tenantId): tenantId is string => typeof tenantId === 'string' && tenantId.length > 0)

  if (tenantIds.length === 0) {
    logger.safe.info('nightly-export: no tenants with audit events in window')
    return
  }

  logger.safe.info({ tenantCount: tenantIds.length }, 'nightly-export: discovered tenants')

  const bucketBinding = options.bucketBinding ?? getAuditExportsBucketBinding()
  if (!bucketBinding) {
    throw new Error('Audit exports bucket binding is not configured')
  }

  const yyyy = windowStart.getUTCFullYear().toString()
  const mm = String(windowStart.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(windowStart.getUTCDate()).padStart(2, '0')
  const exportDate = `${yyyy}-${mm}-${dd}`
  const failures: Array<{ tenantId: string; error: unknown }> = []

  for (const tenantId of tenantIds) {
    try {
      let cursorCreatedAt: Date | null = null
      let cursorId = ''
      const lines: string[] = []

      for (;;) {
        const cursorPredicate = cursorCreatedAt
          ? or(
              gt(auditEvents.createdAt, cursorCreatedAt),
              and(eq(auditEvents.createdAt, cursorCreatedAt), gt(auditEvents.id, cursorId)),
            )
          : undefined
        const rows = await db
          .select()
          .from(auditEvents)
          .where(
            and(
              eq(auditEvents.tenantId, tenantId),
              gte(auditEvents.createdAt, windowStart),
              lt(auditEvents.createdAt, windowEnd),
              cursorPredicate,
            ),
          )
          .orderBy(asc(auditEvents.createdAt), asc(auditEvents.id))
          .limit(PAGE_SIZE)

        if (rows.length === 0) break

        for (const row of rows) {
          lines.push(JSON.stringify(row))
        }

        const last = rows[rows.length - 1] as { createdAt?: Date | string; id?: string }
        cursorCreatedAt = last.createdAt instanceof Date
          ? last.createdAt
          : last.createdAt
            ? new Date(last.createdAt)
            : cursorCreatedAt
        cursorId = last.id ?? cursorId

        if (rows.length < PAGE_SIZE) break
      }

      if (lines.length === 0) continue

      const compressed = gzipSync(Buffer.from(lines.join('\n'), 'utf-8'))
      const key = `exports/${yyyy}/${mm}/${dd}/${tenantId}/audit-${exportDate}.jsonl.gz`

      await bucketBinding.put(key, compressed, {
        httpMetadata: {
          contentEncoding: 'gzip',
          contentType: 'application/x-ndjson',
        },
        onlyIf: {
          etagDoesNotMatch: '*',
        },
        customMetadata: {
          retentionMode: 'COMPLIANCE',
          retainUntil: buildComplianceRetentionDate(now).toISOString(),
        },
      })
      logger.safe.info(
        { tenantId, key, sizeBytes: compressed.length, eventCount: lines.length },
        'nightly-export: uploaded tenant export to object storage',
      )
    } catch (error) {
      logger.safe.error({ tenantId, err: error }, 'nightly-export: failed tenant export')
      failures.push({ tenantId, error })
    }
  }

  if (failures.length > 0) {
    const failedTenants = failures.map((failure) => failure.tenantId).join(', ')
    throw new Error(`nightly-export failed for tenants: ${failedTenants}`)
  }
}
