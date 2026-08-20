import { and, eq, notInArray } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import type { DB } from '@phiguard/db'
import {
  memberships,
  programPolicies,
  policyAcknowledgements,
  type ProgramPolicy,
} from '@phiguard/db'

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

function policyAuditMetadata(
  policy: Pick<ProgramPolicy, 'status' | 'version' | 'effectiveDate' | 'requiresAcknowledgement'>,
) {
  return {
    status: policy.status,
    version: policy.version,
    effectiveDate: policy.effectiveDate,
    requiresAcknowledgement: policy.requiresAcknowledgement,
  }
}

async function assertPolicyUserBelongsToTenant(
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

async function assertPolicyActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; actorId: string },
) {
  await assertPolicyUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.actorId,
    errorMessage: 'Policy actor is not a member of this organization',
  })
}

async function lockPublishedPolicyOrThrow(
  tx: Pick<DB, 'select'>,
  input: { policyId: string; tenantId: string },
) {
  const [policy] = await maybeForUpdate(
    tx
      .select()
      .from(programPolicies)
      .where(
        and(eq(programPolicies.id, input.policyId), eq(programPolicies.tenantId, input.tenantId)),
      ),
  ).limit(1)

  if (!policy) throw new Error('Policy not found')
  if (policy.status !== 'published') throw new Error('Only published policies can be versioned')

  return policy
}

export async function createPolicy(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    title: string
    bodyMarkdown: string
    version: string
    effectiveDate?: Date
    requiresAcknowledgement: boolean
  },
): Promise<ProgramPolicy> {
  await assertPolicyActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [policy] = await tx
      .insert(programPolicies)
      .values({
        tenantId: input.tenantId,
        title: input.title,
        bodyMarkdown: input.bodyMarkdown,
        version: input.version,
        effectiveDate: input.effectiveDate,
        requiresAcknowledgement: input.requiresAcknowledgement,
        status: 'draft',
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'policy.created',
      resourceType: 'program_policy',
      resourceId: policy.id,
      after: policyAuditMetadata(policy),
    })

    return policy
  })
}

export async function updatePolicyDraft(
  db: DB,
  input: {
    policyId: string
    tenantId: string
    actorId: string
    title: string
    bodyMarkdown: string
    version: string
    effectiveDate?: Date
    requiresAcknowledgement: boolean
  },
): Promise<ProgramPolicy> {
  const [policy] = await db
    .select()
    .from(programPolicies)
    .where(
      and(eq(programPolicies.id, input.policyId), eq(programPolicies.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!policy) throw new Error('Policy not found')
  if (policy.status !== 'draft') throw new Error('Only draft policies can be edited')

  await assertPolicyActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updatedPolicy] = await tx
      .update(programPolicies)
      .set({
        title: input.title,
        bodyMarkdown: input.bodyMarkdown,
        version: input.version,
        effectiveDate: input.effectiveDate,
        requiresAcknowledgement: input.requiresAcknowledgement,
      })
      .where(
        and(
          eq(programPolicies.id, input.policyId),
          eq(programPolicies.tenantId, input.tenantId),
          eq(programPolicies.status, 'draft'),
        ),
      )
      .returning()

    if (!updatedPolicy) {
      throw new Error('Only draft policies can be edited')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'policy.updated',
      resourceType: 'program_policy',
      resourceId: input.policyId,
      before: policyAuditMetadata(policy),
      after: policyAuditMetadata(updatedPolicy),
    })

    return updatedPolicy
  })
}

export async function publishPolicy(
  db: DB,
  input: {
    policyId: string
    tenantId: string
    actorId: string
  },
): Promise<void> {
  // Verify the policy exists and belongs to the requesting tenant
  const [policy] = await db
    .select({ id: programPolicies.id, status: programPolicies.status })
    .from(programPolicies)
    .where(
      and(eq(programPolicies.id, input.policyId), eq(programPolicies.tenantId, input.tenantId)),
    )
    .limit(1)
  if (!policy) throw new Error('Policy not found')
  if (policy.status !== 'draft') throw new Error('Only draft policies can be published')

  await assertPolicyActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  await db.transaction(async (tx) => {
    const [updatedPolicy] = await tx
      .update(programPolicies)
      .set({ status: 'published' })
      .where(
        and(
          eq(programPolicies.id, input.policyId),
          eq(programPolicies.tenantId, input.tenantId),
          eq(programPolicies.status, 'draft'),
        ),
      )
      .returning()

    if (!updatedPolicy) {
      throw new Error('Only draft policies can be published')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'policy.published',
      resourceType: 'program_policy',
      resourceId: input.policyId,
      after: { status: 'published' },
    })
  })
}

export async function acknowledgePolicy(
  db: DB,
  input: {
    policyId: string
    userId: string
    tenantId: string
    ipAddress?: string
  },
): Promise<void> {
  // Verify the policy belongs to the requesting tenant
  const [policy] = await db
    .select({ id: programPolicies.id })
    .from(programPolicies)
    .where(
      and(
        eq(programPolicies.id, input.policyId),
        eq(programPolicies.tenantId, input.tenantId),
        eq(programPolicies.status, 'published'),
        eq(programPolicies.requiresAcknowledgement, true),
      ),
    )
    .limit(1)
  if (!policy) throw new Error('Policy not found')

  await assertPolicyUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.userId,
    errorMessage: 'Policy not found',
  })

  const [existing] = await db
    .select({ id: policyAcknowledgements.id })
    .from(policyAcknowledgements)
    .where(
      and(
        eq(policyAcknowledgements.policyId, input.policyId),
        eq(policyAcknowledgements.userId, input.userId),
      ),
    )
    .limit(1)

  if (existing) return // already acknowledged - idempotent

  const now = new Date()

  await db.transaction(async (tx) => {
    const [acknowledgement] = await tx
      .insert(policyAcknowledgements)
      .values({
        policyId: input.policyId,
        userId: input.userId,
        acknowledgedAt: now,
        ipAddress: input.ipAddress,
      })
      .onConflictDoNothing({
        target: [policyAcknowledgements.policyId, policyAcknowledgements.userId],
      })
      .returning({ id: policyAcknowledgements.id })

    if (!acknowledgement) {
      return
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.userId,
      action: 'policy.acknowledged',
      resourceType: 'program_policy',
      resourceId: input.policyId,
      after: { acknowledgedAt: now },
    })
  })
}

export async function listPendingAcknowledgements(
  db: DB,
  input: {
    userId: string
    tenantId: string
  },
) {
  await assertPolicyUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.userId,
    errorMessage: 'User not found in organization',
  })

  // Get all acknowledgements for this user
  const userAcks = await db
    .select({ policyId: policyAcknowledgements.policyId })
    .from(policyAcknowledgements)
    .where(eq(policyAcknowledgements.userId, input.userId))

  const acknowledgedPolicyIds = userAcks.map((ack) => ack.policyId)

  // Return published policies that require acknowledgement and haven't been acknowledged yet
  const conditions = [
    eq(programPolicies.tenantId, input.tenantId),
    eq(programPolicies.status, 'published'),
    eq(programPolicies.requiresAcknowledgement, true),
  ]

  if (acknowledgedPolicyIds.length > 0) {
    conditions.push(notInArray(programPolicies.id, acknowledgedPolicyIds))
  }

  return db
    .select()
    .from(programPolicies)
    .where(and(...conditions))
}

export async function createPolicyVersion(
  db: DB,
  input: {
    policyId: string
    tenantId: string
    actorId: string
  },
): Promise<ProgramPolicy> {
  const [source] = await db
    .select()
    .from(programPolicies)
    .where(
      and(eq(programPolicies.id, input.policyId), eq(programPolicies.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!source) throw new Error('Policy not found')
  if (source.status !== 'published') throw new Error('Only published policies can be versioned')

  await assertPolicyActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const lockedSource = await lockPublishedPolicyOrThrow(tx, input)

    const [newPolicy] = await tx
      .insert(programPolicies)
      .values({
        tenantId: input.tenantId,
        title: lockedSource.title,
        bodyMarkdown: lockedSource.bodyMarkdown,
        version: lockedSource.version,
        effectiveDate: lockedSource.effectiveDate ?? undefined,
        requiresAcknowledgement: lockedSource.requiresAcknowledgement,
        status: 'draft',
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'policy.version_created',
      resourceType: 'program_policy',
      resourceId: newPolicy.id,
      after: { sourceId: lockedSource.id, ...policyAuditMetadata(newPolicy) },
    })

    return newPolicy
  })
}

export async function archivePolicy(
  db: DB,
  input: {
    policyId: string
    tenantId: string
    actorId: string
  },
): Promise<void> {
  const [policy] = await db
    .select({ id: programPolicies.id, status: programPolicies.status })
    .from(programPolicies)
    .where(
      and(eq(programPolicies.id, input.policyId), eq(programPolicies.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!policy) throw new Error('Policy not found')
  await assertPolicyActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  if (policy.status === 'archived') return // idempotent

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(programPolicies)
      .set({ status: 'archived' })
      .where(
        and(
          eq(programPolicies.id, input.policyId),
          eq(programPolicies.tenantId, input.tenantId),
          eq(programPolicies.status, policy.status),
        ),
      )
      .returning()

    if (!updated) throw new Error('Policy changed before it could be archived')

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'policy.archived',
      resourceType: 'program_policy',
      resourceId: input.policyId,
      after: { status: 'archived' },
    })
  })
}

export async function restorePolicy(
  db: DB,
  input: {
    policyId: string
    tenantId: string
    actorId: string
  },
): Promise<void> {
  const [policy] = await db
    .select({ id: programPolicies.id, status: programPolicies.status })
    .from(programPolicies)
    .where(
      and(eq(programPolicies.id, input.policyId), eq(programPolicies.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!policy) throw new Error('Policy not found')
  await assertPolicyActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  if (policy.status !== 'archived') throw new Error('Only archived policies can be restored')

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(programPolicies)
      .set({ status: 'published' })
      .where(
        and(
          eq(programPolicies.id, input.policyId),
          eq(programPolicies.tenantId, input.tenantId),
          eq(programPolicies.status, 'archived'),
        ),
      )
      .returning()

    if (!updated) throw new Error('Policy changed before it could be restored')

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'policy.restored',
      resourceType: 'program_policy',
      resourceId: input.policyId,
      after: { status: 'published' },
    })
  })
}
