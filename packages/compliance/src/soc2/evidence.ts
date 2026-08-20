import { and, eq, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm'
import { auditEvents, writeAuditEvent } from '@phiguard/audit'
import { memberships, soc2Controls, soc2Evidence, type DB } from '@phiguard/db'
import { SOC2_CONTROLS_SEED } from './controls-seed.js'

export interface AuditQueryResult {
  count: number
  actions: string[]
  from: Date
  to: Date
}

export function getManualEvidenceFileKeyPrefix(tenantId: string): string {
  return `evidence/${tenantId}/soc2/`
}

export function validateManualEvidenceFileKey(fileKey: string, tenantId: string): string {
  const trimmedFileKey = fileKey.trim()
  const prefix = getManualEvidenceFileKeyPrefix(tenantId)

  if (!trimmedFileKey) throw new Error('Evidence file key is required')
  if (!trimmedFileKey.startsWith(prefix) || trimmedFileKey.length === prefix.length) {
    throw new Error(`Evidence file key must start with ${prefix}`)
  }

  return trimmedFileKey
}

function isBundledControlId(controlId: string): boolean {
  return SOC2_CONTROLS_SEED.some((control) => control.controlId === controlId)
}

async function assertSoc2ActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; actorId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.actorId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error('SOC 2 actor is not a member of this organization')
  }
}

export async function collectAuditEvidence(
  db: Pick<DB, 'select' | 'insert'>,
  opts: {
    tenantId: string
    controlId: string
    actionFilters: string[]
    from: Date
    to: Date
  },
): Promise<{ evidenceId: string; count: number }> {
  if (Number.isNaN(opts.from.getTime()) || Number.isNaN(opts.to.getTime())) {
    throw new Error('Audit evidence window dates must be valid')
  }

  if (opts.to.getTime() < opts.from.getTime()) {
    throw new Error('Audit evidence window end must be on or after window start')
  }

  const conditions = [
    eq(auditEvents.tenantId, opts.tenantId),
    gte(auditEvents.createdAt, opts.from),
    lte(auditEvents.createdAt, opts.to),
  ]

  if (opts.actionFilters.length > 0) {
    conditions.push(inArray(auditEvents.action, opts.actionFilters))
  }

  const rows = await db
    .select({ count: sql<string>`count(*)` })
    .from(auditEvents)
    .where(and(...conditions))

  const count = parseInt(rows[0]?.count ?? '0', 10)

  const metadata: Record<string, unknown> = {
    count,
    actions: opts.actionFilters,
    from: opts.from.toISOString(),
    to: opts.to.toISOString(),
  }

  const [inserted] = await db
    .insert(soc2Evidence)
    .values({
      tenantId: opts.tenantId,
      controlId: opts.controlId,
      source: 'audit_log' as const,
      queryRef: `audit_events where action IN [${opts.actionFilters.join(', ')}]`,
      metadata,
    })
    .returning()

  return { evidenceId: inserted.id, count }
}

export async function recordManualEvidence(
  db: Pick<DB, 'transaction'>,
  opts: {
    tenantId: string
    actorId: string
    controlId: string
    fileKey: string
    summary: string
  },
): Promise<{ evidenceId: string }> {
  const controlId = opts.controlId.trim()
  const fileKey = validateManualEvidenceFileKey(opts.fileKey, opts.tenantId)
  const summary = opts.summary.trim()

  if (!controlId) throw new Error('Control ID is required')
  if (!summary) throw new Error('Evidence summary is required')

  return db.transaction(async (tx) => {
    await assertSoc2ActorBelongsToTenant(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
    })

    const [control] = await tx
      .select({ id: soc2Controls.id })
      .from(soc2Controls)
      .where(
        and(
          eq(soc2Controls.controlId, controlId),
          or(isNull(soc2Controls.tenantId), eq(soc2Controls.tenantId, opts.tenantId)),
        ),
      )
      .limit(1)

    if (!control && !isBundledControlId(controlId)) {
      throw new Error('SOC 2 control not found')
    }

    const [inserted] = await tx
      .insert(soc2Evidence)
      .values({
        tenantId: opts.tenantId,
        controlId,
        source: 'manual_upload' as const,
        fileKey,
        queryRef: summary,
        metadata: {
          summary,
        },
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
      action: 'soc2.evidence_recorded',
      resourceType: 'soc2_evidence',
      resourceId: inserted.id,
      after: {
        controlId,
        source: 'manual_upload',
        hasArtifact: true,
      },
    })

    return { evidenceId: inserted.id }
  })
}

// Maps each control to the audit actions that provide evidence
export const CONTROL_AUDIT_MAP: Record<string, string[]> = {
  'CC1.1': ['org.created', 'member.role_updated', 'membership.role_changed'],
  'CC2.1': ['organization.updated', 'policy.published', 'policy.acknowledged'],
  'CC3.1': [
    'risk_assessment.created',
    'risk_assessment.updated',
    'risk_assessment.reviewed',
    'risk_item.created',
    'risk_item.updated',
    'risk_item.deleted',
  ],
  'CC4.1': ['risk_assessment.reviewed', 'audit_log.exported', 'soc2.bundle_exported'],
  'CC5.1': ['policy.published', 'training.assigned', 'invitation.accepted', 'member.removed'],
  'CC6.1': [
    'invitation.accepted',
    'member.removed',
    'member.role_updated',
    'membership.role_changed',
    'membership.revoked',
  ],
  'CC6.2': ['invitation.accepted'],
  'CC7.2': ['org.created', 'invitation.accepted', 'policy.published'],
  'CC8.1': ['organization.updated', 'integration.installed', 'integration.revoked'],
  'CC9.1': ['incident.created', 'incident.resolved', 'incident.closed'],
}
