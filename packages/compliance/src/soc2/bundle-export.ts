import { and, gte, lte, eq, inArray } from 'drizzle-orm'
import {
  evidenceFileScans,
  memberships,
  soc2Evidence,
  type DB,
  type Soc2Evidence,
} from '@phiguard/db'
import {
  getAuditExportsBucketBinding,
  getAuditExportsBucketName,
  writeAuditEvent,
} from '@phiguard/audit'
import { validateManualEvidenceFileKey } from './evidence.js'

const BUCKET = getAuditExportsBucketName() || 'phiguard-audit-exports'
const GOVERNANCE_RETENTION_YEARS = 7

function buildGovernanceRetentionDate(from = new Date()) {
  return new Date(from.getTime() + GOVERNANCE_RETENTION_YEARS * 365 * 24 * 60 * 60 * 1000)
}

async function assertBundleExportActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  opts: { tenantId: string; actorId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, opts.actorId), eq(memberships.tenantId, opts.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error('SOC 2 bundle export actor is not a member of this organization')
  }
}

export async function exportEvidenceBundle(
  db: Pick<DB, 'select' | 'insert'>,
  opts: { tenantId: string; actorId: string; from: Date; to: Date },
): Promise<{ key: string }> {
  if (Number.isNaN(opts.from.getTime()) || Number.isNaN(opts.to.getTime())) {
    throw new Error('Evidence bundle window dates must be valid')
  }

  if (opts.to.getTime() < opts.from.getTime()) {
    throw new Error('Evidence bundle window end must be on or after window start')
  }

  await assertBundleExportActorBelongsToTenant(db, opts)

  const rows: Soc2Evidence[] = await db
    .select()
    .from(soc2Evidence)
    .where(
      and(
        eq(soc2Evidence.tenantId, opts.tenantId),
        gte(soc2Evidence.collectedAt, opts.from),
        lte(soc2Evidence.collectedAt, opts.to),
      ),
    )

  const artifactKeys = rows
    .map((row) => row.fileKey)
    .filter((fileKey): fileKey is string => Boolean(fileKey))
  const scanRows =
    artifactKeys.length > 0
      ? await db
          .select({
            s3Key: evidenceFileScans.s3Key,
            avStatus: evidenceFileScans.avStatus,
          })
          .from(evidenceFileScans)
          .where(
            and(
              eq(evidenceFileScans.tenantId, opts.tenantId),
              inArray(evidenceFileScans.s3Key, artifactKeys),
            ),
          )
      : []
  const scanStatusByKey = new Map(scanRows.map((scan) => [scan.s3Key, scan.avStatus]))
  const exportableRows = rows.filter((row) => {
    if (!row.fileKey) return true

    try {
      validateManualEvidenceFileKey(row.fileKey, opts.tenantId)
    } catch {
      return false
    }

    return (
      scanStatusByKey.get(row.fileKey) === 'clean' || scanStatusByKey.get(row.fileKey) === 'skipped'
    )
  })

  // Group by controlId
  const byControl: Record<string, Soc2Evidence[]> = {}
  for (const row of exportableRows) {
    const list = byControl[row.controlId] ?? []
    list.push(row)
    byControl[row.controlId] = list
  }

  const bundle = {
    tenantId: opts.tenantId,
    from: opts.from.toISOString(),
    to: opts.to.toISOString(),
    exportedAt: new Date().toISOString(),
    controls: byControl,
  }

  const timestamp = Date.now()
  const key = `soc2-bundles/${opts.tenantId}/${timestamp}-evidence-bundle.json`

  const bucket = getAuditExportsBucketBinding()
  if (!bucket) {
    throw new Error(`Audit export bucket binding is not configured for ${BUCKET}`)
  }

  await bucket.put(key, JSON.stringify(bundle, null, 2), {
    httpMetadata: {
      contentType: 'application/json',
    },
    customMetadata: {
      retentionMode: 'GOVERNANCE',
      retainUntil: buildGovernanceRetentionDate().toISOString(),
    },
  })

  await writeAuditEvent(db, {
    tenantId: opts.tenantId,
    actorId: opts.actorId,
    action: 'soc2.bundle_exported',
    resourceType: 'soc2_bundle',
    resourceId: key,
    after: {
      s3Key: key,
      evidenceCount: exportableRows.length,
      from: opts.from.toISOString(),
      to: opts.to.toISOString(),
    },
  })

  return { key }
}
