import { and, eq } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import type { DB } from '@phiguard/db'
import {
  memberships,
  riskAssessments,
  riskItems,
  type RiskAssessment,
  type RiskItem,
} from '@phiguard/db'

export type RiskAssessmentStatus = RiskAssessment['status']

export function computeRiskScore(likelihood: number, impact: number): number {
  assertRiskRating('likelihood', likelihood)
  assertRiskRating('impact', impact)
  return likelihood * impact
}

function riskLevelForScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 20) return 'critical'
  if (score >= 15) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

function riskItemAuditMetadata(
  item: Pick<
    RiskItem,
    | 'assessmentId'
    | 'category'
    | 'likelihood'
    | 'impact'
    | 'score'
    | 'status'
    | 'ownerId'
    | 'dueAt'
  >,
) {
  return {
    assessmentId: item.assessmentId,
    category: item.category,
    likelihood: item.likelihood,
    impact: item.impact,
    score: item.score,
    status: item.status,
    ownerId: item.ownerId,
    dueAt: item.dueAt,
  }
}

function riskAssessmentAuditMetadata(
  assessment: Pick<RiskAssessment, 'status' | 'reviewerId' | 'reviewedAt'>,
) {
  return {
    status: assessment.status,
    reviewerId: assessment.reviewerId,
    reviewedAt: assessment.reviewedAt,
  }
}

function maybeForUpdate<T>(query: T): T {
  if (
    query &&
    typeof query === 'object' &&
    typeof (query as { for?: unknown }).for === 'function'
  ) {
    return (query as unknown as { for: (strength: 'update') => T }).for('update')
  }

  return query
}

async function assertRiskUserBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; userId: string; errorMessage: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.userId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error(input.errorMessage)
  }
}

async function assertRiskActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; actorId: string },
) {
  await assertRiskUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.actorId,
    errorMessage: 'Risk actor is not a member of this organization',
  })
}

async function assertRiskOwnerBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; ownerId: string },
) {
  await assertRiskUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.ownerId,
    errorMessage: 'Risk owner is not a member of this organization',
  })
}

async function lockOpenRiskAssessmentOrThrow(
  tx: Pick<DB, 'select'>,
  input: { tenantId: string; assessmentId: string },
) {
  const [assessment] = await maybeForUpdate(
    tx
      .select({ id: riskAssessments.id, status: riskAssessments.status })
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.id, input.assessmentId),
          eq(riskAssessments.tenantId, input.tenantId),
        ),
      ),
  ).limit(1)

  if (!assessment) {
    throw new Error('Risk assessment not found')
  }

  if (assessment.status === 'closed') {
    throw new Error('Closed risk assessments cannot be changed')
  }
}

async function lockOpenRiskItemOrThrow(
  tx: Pick<DB, 'select'>,
  input: { tenantId: string; itemId: string },
) {
  const [item] = await maybeForUpdate(
    tx
      .select({
        id: riskItems.id,
        assessmentStatus: riskAssessments.status,
      })
      .from(riskItems)
      .innerJoin(riskAssessments, eq(riskItems.assessmentId, riskAssessments.id))
      .where(and(eq(riskItems.id, input.itemId), eq(riskAssessments.tenantId, input.tenantId))),
  ).limit(1)

  if (!item) {
    throw new Error('Risk item not found')
  }

  if (item.assessmentStatus === 'closed') {
    throw new Error('Closed risk assessments cannot be changed')
  }
}

export async function createRiskItem(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    assessmentId: string
    category: string
    description: string
    likelihood: number
    impact: number
    mitigation?: string
    ownerId?: string | null
    dueAt?: Date | null
  },
): Promise<RiskItem> {
  const [assessment] = await db
    .select({ id: riskAssessments.id, status: riskAssessments.status })
    .from(riskAssessments)
    .where(
      and(eq(riskAssessments.id, input.assessmentId), eq(riskAssessments.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!assessment) {
    throw new Error('Risk assessment not found')
  }

  if (assessment.status === 'closed') {
    throw new Error('Closed risk assessments cannot be changed')
  }

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })
  if (input.ownerId) {
    await assertRiskOwnerBelongsToTenant(db, {
      tenantId: input.tenantId,
      ownerId: input.ownerId,
    })
  }

  const score = computeRiskScore(input.likelihood, input.impact)
  return db.transaction(async (tx) => {
    await lockOpenRiskAssessmentOrThrow(tx, {
      tenantId: input.tenantId,
      assessmentId: input.assessmentId,
    })

    const [item] = await tx
      .insert(riskItems)
      .values({
        assessmentId: input.assessmentId,
        category: input.category,
        description: input.description,
        likelihood: input.likelihood,
        impact: input.impact,
        score,
        status: riskLevelForScore(score),
        mitigation: input.mitigation ?? '',
        ownerId: input.ownerId ?? null,
        dueAt: input.dueAt,
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_item.created',
      resourceType: 'risk_item',
      resourceId: item.id,
      after: riskItemAuditMetadata(item),
    })

    return item
  })
}

export async function createRiskAssessment(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    title: string
  },
): Promise<RiskAssessment> {
  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [assessment] = await tx
      .insert(riskAssessments)
      .values({ tenantId: input.tenantId, title: input.title })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_assessment.created',
      resourceType: 'risk_assessment',
      resourceId: assessment.id,
      after: riskAssessmentAuditMetadata(assessment),
    })

    return assessment
  })
}

export async function deleteRiskItem(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    itemId: string
  },
): Promise<void> {
  const [item] = await db
    .select({
      id: riskItems.id,
      assessmentId: riskItems.assessmentId,
      assessmentStatus: riskAssessments.status,
      category: riskItems.category,
      description: riskItems.description,
      likelihood: riskItems.likelihood,
      impact: riskItems.impact,
      score: riskItems.score,
      status: riskItems.status,
      mitigation: riskItems.mitigation,
      ownerId: riskItems.ownerId,
      dueAt: riskItems.dueAt,
    })
    .from(riskItems)
    .innerJoin(riskAssessments, eq(riskItems.assessmentId, riskAssessments.id))
    .where(and(eq(riskItems.id, input.itemId), eq(riskAssessments.tenantId, input.tenantId)))
    .limit(1)

  if (!item) {
    throw new Error('Risk item not found')
  }

  if (item.assessmentStatus === 'closed') {
    throw new Error('Closed risk assessments cannot be changed')
  }

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  const { assessmentStatus: _assessmentStatus, ...itemBefore } = item

  await db.transaction(async (tx) => {
    await lockOpenRiskItemOrThrow(tx, {
      tenantId: input.tenantId,
      itemId: input.itemId,
    })

    const [deleted] = await tx
      .delete(riskItems)
      .where(eq(riskItems.id, input.itemId))
      .returning({ id: riskItems.id })

    if (!deleted) {
      throw new Error('Risk item changed before it could be deleted')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_item.deleted',
      resourceType: 'risk_item',
      resourceId: input.itemId,
      before: riskItemAuditMetadata(itemBefore),
    })
  })
}

export async function updateRiskItem(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    itemId: string
    category: string
    description: string
    likelihood: number
    impact: number
    mitigation?: string
    ownerId?: string | null
    dueAt?: Date | null
  },
): Promise<RiskItem> {
  const [item] = await db
    .select({
      id: riskItems.id,
      assessmentId: riskItems.assessmentId,
      assessmentStatus: riskAssessments.status,
      category: riskItems.category,
      description: riskItems.description,
      likelihood: riskItems.likelihood,
      impact: riskItems.impact,
      score: riskItems.score,
      status: riskItems.status,
      mitigation: riskItems.mitigation,
      ownerId: riskItems.ownerId,
      dueAt: riskItems.dueAt,
    })
    .from(riskItems)
    .innerJoin(riskAssessments, eq(riskItems.assessmentId, riskAssessments.id))
    .where(and(eq(riskItems.id, input.itemId), eq(riskAssessments.tenantId, input.tenantId)))
    .limit(1)

  if (!item) {
    throw new Error('Risk item not found')
  }

  if (item.assessmentStatus === 'closed') {
    throw new Error('Closed risk assessments cannot be changed')
  }

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })
  if (input.ownerId) {
    await assertRiskOwnerBelongsToTenant(db, {
      tenantId: input.tenantId,
      ownerId: input.ownerId,
    })
  }

  const { assessmentStatus: _assessmentStatus, ...itemBefore } = item

  const score = computeRiskScore(input.likelihood, input.impact)
  const updates = {
    category: input.category,
    description: input.description,
    likelihood: input.likelihood,
    impact: input.impact,
    score,
    status: riskLevelForScore(score),
    mitigation: input.mitigation ?? '',
    ownerId: input.ownerId ?? null,
    dueAt: input.dueAt ?? null,
  }

  return db.transaction(async (tx) => {
    await lockOpenRiskItemOrThrow(tx, {
      tenantId: input.tenantId,
      itemId: input.itemId,
    })

    const [updated] = await tx
      .update(riskItems)
      .set(updates)
      .where(eq(riskItems.id, input.itemId))
      .returning()

    if (!updated) {
      throw new Error('Risk item not found')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_item.updated',
      resourceType: 'risk_item',
      resourceId: input.itemId,
      before: riskItemAuditMetadata(itemBefore),
      after: riskItemAuditMetadata(updated),
    })

    return updated
  })
}

export async function updateRiskAssessmentStatus(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    assessmentId: string
    status: RiskAssessmentStatus
  },
): Promise<RiskAssessment> {
  const [assessment] = await db
    .select({
      id: riskAssessments.id,
      tenantId: riskAssessments.tenantId,
      title: riskAssessments.title,
      status: riskAssessments.status,
      reviewerId: riskAssessments.reviewerId,
      reviewedAt: riskAssessments.reviewedAt,
    })
    .from(riskAssessments)
    .where(
      and(eq(riskAssessments.id, input.assessmentId), eq(riskAssessments.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!assessment) {
    throw new Error('Risk assessment not found')
  }

  if (assessment.status === 'closed') {
    throw new Error(
      input.status === 'closed'
        ? 'Closed risk assessments cannot be changed'
        : 'Closed risk assessments cannot be reopened',
    )
  }

  if (assessment.status === 'open' && input.status === 'closed') {
    throw new Error('Risk assessment must be in review before it can be closed')
  }

  if (assessment.status === 'in_review' && input.status === 'open') {
    throw new Error('Risk assessments cannot move backward from review')
  }

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  const updates = {
    status: input.status,
    reviewerId: input.status === 'closed' ? input.actorId : null,
    reviewedAt: input.status === 'closed' ? new Date() : null,
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(riskAssessments)
      .set(updates)
      .where(
        and(
          eq(riskAssessments.id, input.assessmentId),
          eq(riskAssessments.tenantId, input.tenantId),
          eq(riskAssessments.status, assessment.status),
        ),
      )
      .returning()

    if (!updated) {
      throw new Error('Risk assessment changed before the status update could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: input.status === 'closed' ? 'risk_assessment.reviewed' : 'risk_assessment.updated',
      resourceType: 'risk_assessment',
      resourceId: input.assessmentId,
      before: riskAssessmentAuditMetadata(assessment),
      after: riskAssessmentAuditMetadata(updated),
    })

    return updated
  })
}

function assertRiskRating(name: 'likelihood' | 'impact', value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error(`${name} must be an integer from 1 to 5`)
  }
}

export interface RiskSummary {
  high: number
  medium: number
  low: number
}

/**
 * Bucket risk items by score band:
 *   high   = score >= 15
 *   medium = score 6-14
 *   low    = score <= 5
 */
export function summarizeAssessment(items: { score: number }[]): RiskSummary {
  const summary: RiskSummary = { high: 0, medium: 0, low: 0 }

  for (const item of items) {
    if (item.score >= 15) {
      summary.high++
    } else if (item.score >= 6) {
      summary.medium++
    } else {
      summary.low++
    }
  }

  return summary
}

export async function reopenRiskAssessment(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    assessmentId: string
  },
): Promise<RiskAssessment> {
  const [assessment] = await db
    .select()
    .from(riskAssessments)
    .where(
      and(eq(riskAssessments.id, input.assessmentId), eq(riskAssessments.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!assessment) throw new Error('Risk assessment not found')

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(riskAssessments)
      .set({ status: 'open', reviewerId: null, reviewedAt: null })
      .where(
        and(
          eq(riskAssessments.id, input.assessmentId),
          eq(riskAssessments.tenantId, input.tenantId),
          eq(riskAssessments.status, assessment.status),
        ),
      )
      .returning()

    if (!updated) {
      throw new Error('Risk assessment changed before it could be reopened')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_assessment.reopened',
      resourceType: 'risk_assessment',
      resourceId: input.assessmentId,
      before: { status: assessment.status },
      after: { status: 'open' },
    })

    return updated
  })
}

export async function renameRiskAssessment(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    assessmentId: string
    title: string
  },
): Promise<RiskAssessment> {
  const [assessment] = await db
    .select()
    .from(riskAssessments)
    .where(
      and(eq(riskAssessments.id, input.assessmentId), eq(riskAssessments.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!assessment) throw new Error('Risk assessment not found')

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(riskAssessments)
      .set({ title: input.title })
      .where(
        and(
          eq(riskAssessments.id, input.assessmentId),
          eq(riskAssessments.tenantId, input.tenantId),
          eq(riskAssessments.status, assessment.status),
        ),
      )
      .returning()

    if (!updated) {
      throw new Error('Risk assessment changed before it could be renamed')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_assessment.renamed',
      resourceType: 'risk_assessment',
      resourceId: input.assessmentId,
      before: { titleChanged: false },
      after: { titleChanged: input.title !== assessment.title },
    })

    return updated
  })
}

export async function deleteRiskAssessment(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    assessmentId: string
  },
): Promise<void> {
  const [assessment] = await db
    .select()
    .from(riskAssessments)
    .where(
      and(eq(riskAssessments.id, input.assessmentId), eq(riskAssessments.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!assessment) throw new Error('Risk assessment not found')

  await assertRiskActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(riskAssessments)
      .where(
        and(
          eq(riskAssessments.id, input.assessmentId),
          eq(riskAssessments.tenantId, input.tenantId),
          eq(riskAssessments.status, assessment.status),
        ),
      )
      .returning({ id: riskAssessments.id })

    if (!deleted) {
      throw new Error('Risk assessment changed before it could be deleted')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'risk_assessment.deleted',
      resourceType: 'risk_assessment',
      resourceId: input.assessmentId,
      before: { status: assessment.status },
    })
  })
}
