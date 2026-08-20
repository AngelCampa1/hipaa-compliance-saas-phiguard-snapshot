import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import {
  accessReviews,
  accessReviewItems,
  locationGrants,
  locations,
  memberships,
  type DB,
} from '@phiguard/db'

type ReviewDecision = 'keep' | 'revoke' | 'change_role'
type ReviewTargetRole = 'org_admin' | 'auditor' | 'location_manager' | 'location_staff'
const LOCATION_SCOPED_ROLES = new Set<ReviewTargetRole>(['location_manager', 'location_staff'])

type AuditCapableDb = Pick<DB, 'select' | 'insert' | 'update' | 'delete' | 'transaction'>

async function getReturnedRows<T>(
  query: unknown,
  fields: Record<string, unknown>,
): Promise<T[]> {
  if (
    query &&
    typeof query === 'object' &&
    typeof (query as { returning?: unknown }).returning === 'function'
  ) {
    return (query as { returning: (returningFields: Record<string, unknown>) => Promise<T[]> })
      .returning(fields)
  }

  const result = await query
  if (Array.isArray(result)) {
    return result as T[]
  }

  return result === undefined ? ([{}] as T[]) : []
}

async function assertAccessReviewActorBelongsToTenant(
  db: Pick<AuditCapableDb, 'select'>,
  opts: { tenantId: string; actorId: string },
): Promise<void> {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, opts.actorId), eq(memberships.tenantId, opts.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error('Access review actor is not a member of this organization')
  }
}

async function lockOpenReviewOrThrow(
  tx: Pick<AuditCapableDb, 'select'>,
  reviewId: string,
  tenantId: string,
): Promise<void> {
  const [review] = await tx
    .select({ id: accessReviews.id, status: accessReviews.status })
    .from(accessReviews)
    .where(and(eq(accessReviews.id, reviewId), eq(accessReviews.tenantId, tenantId)))
    .for('update')
    .limit(1)

  if (!review) throw new Error('Access review not found')
  if (review.status === 'closed') throw new Error('Access review is already closed')
}

async function lockUndecidedItemOrThrow(
  tx: Pick<AuditCapableDb, 'select'>,
  reviewId: string,
  itemId: string,
): Promise<void> {
  const [item] = await tx
    .select({ id: accessReviewItems.id, decision: accessReviewItems.decision })
    .from(accessReviewItems)
    .where(and(eq(accessReviewItems.id, itemId), eq(accessReviewItems.reviewId, reviewId)))
    .for('update')
    .limit(1)

  if (!item) throw new Error('Access review item not found')
  if (item.decision) throw new Error('Access review item already has a decision')
}

async function ensureLocationGrantForRole(
  tx: Pick<AuditCapableDb, 'select' | 'insert'>,
  opts: { tenantId: string; membershipId: string; targetRole: ReviewTargetRole },
): Promise<void> {
  if (!LOCATION_SCOPED_ROLES.has(opts.targetRole)) {
    return
  }

  const existingGrant = await tx
    .select({ locationId: locationGrants.locationId })
    .from(locationGrants)
    .innerJoin(locations, eq(locations.id, locationGrants.locationId))
    .where(
      and(
        eq(locationGrants.tenantId, opts.tenantId),
        eq(locationGrants.membershipId, opts.membershipId),
        eq(locations.organizationId, opts.tenantId),
        eq(locations.status, 'active'),
      ),
    )
    .limit(1)

  if (existingGrant.length > 0) {
    return
  }

  const [defaultLocation] = await tx
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.organizationId, opts.tenantId), eq(locations.status, 'active')))
    .orderBy(desc(locations.isPrimary), asc(locations.createdAt), asc(locations.name))
    .limit(1)

  if (!defaultLocation) {
    throw new Error('Location-scoped access review role changes require an active location')
  }

  await tx
    .insert(locationGrants)
    .values({
      tenantId: opts.tenantId,
      membershipId: opts.membershipId,
      locationId: defaultLocation.id,
    })
    .onConflictDoNothing()
}

export async function openAccessReview(
  db: AuditCapableDb,
  opts: {
    tenantId: string
    actorId: string
    periodStart: Date
    periodEnd: Date
  },
): Promise<{ reviewId: string }> {
  if (Number.isNaN(opts.periodStart.getTime()) || Number.isNaN(opts.periodEnd.getTime())) {
    throw new Error('Access review period dates must be valid')
  }

  if (opts.periodEnd.getTime() < opts.periodStart.getTime()) {
    throw new Error('Access review period end must be on or after period start')
  }

  return db.transaction(async (tx) => {
    await assertAccessReviewActorBelongsToTenant(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
    })

    // Find all active memberships for the tenant inside the same transaction
    const activeMemberships = await tx
      .select({ id: memberships.id })
      .from(memberships)
      .where(eq(memberships.tenantId, opts.tenantId))

    // Create the review header and its items atomically
    const [review] = await tx
      .insert(accessReviews)
      .values({
        tenantId: opts.tenantId,
        periodStart: opts.periodStart,
        periodEnd: opts.periodEnd,
        status: 'open' as const,
      })
      .returning()

    if (activeMemberships.length > 0) {
      await tx.insert(accessReviewItems).values(
        activeMemberships.map((m: { id: string }) => ({
          reviewId: review.id,
          membershipId: m.id,
        })),
      )
    }

    await writeAuditEvent(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
      action: 'access_review.opened',
      resourceType: 'access_review',
      resourceId: review.id,
      after: {
        status: 'open',
        periodStart: opts.periodStart,
        periodEnd: opts.periodEnd,
        itemCount: activeMemberships.length,
      },
    })

    return { reviewId: review.id }
  })
}

export async function recordDecision(
  db: AuditCapableDb,
  opts: {
    reviewId: string
    itemId: string
    decision: ReviewDecision
    targetRole?: ReviewTargetRole
    notes: string
    actorId: string
    tenantId: string
  },
): Promise<void> {
  if (opts.decision === 'change_role' && !opts.targetRole) {
    throw new Error('Target role is required for access review role changes')
  }

  const notes = opts.notes.trim()
  if (opts.decision !== 'keep' && notes.length === 0) {
    throw new Error('Reviewer notes are required for revoke and role-change decisions')
  }

  // Verify the review belongs to the requesting tenant before mutating
  const [review] = await db
    .select({ id: accessReviews.id, status: accessReviews.status })
    .from(accessReviews)
    .where(and(eq(accessReviews.id, opts.reviewId), eq(accessReviews.tenantId, opts.tenantId)))
    .limit(1)
  if (!review) throw new Error('Access review not found')
  if (review.status === 'closed') throw new Error('Access review is already closed')

  await assertAccessReviewActorBelongsToTenant(db, {
    tenantId: opts.tenantId,
    actorId: opts.actorId,
  })

  const [item] = await db
    .select({
      id: accessReviewItems.id,
      decision: accessReviewItems.decision,
      membershipId: accessReviewItems.membershipId,
      membershipTenantId: memberships.tenantId,
      membershipRole: memberships.role,
    })
    .from(accessReviewItems)
    .leftJoin(
      memberships,
      and(eq(accessReviewItems.membershipId, memberships.id), eq(memberships.tenantId, opts.tenantId)),
    )
    .where(and(eq(accessReviewItems.id, opts.itemId), eq(accessReviewItems.reviewId, review.id)))
    .limit(1)

  if (!item) throw new Error('Access review item not found')
  if (item.decision) throw new Error('Access review item already has a decision')
  if (!item.membershipId || item.membershipTenantId !== opts.tenantId) {
    throw new Error('Access review item not found')
  }

  const now = new Date()

  if (opts.decision === 'revoke') {
    await db.transaction(async (tx) => {
      await lockOpenReviewOrThrow(tx, review.id, opts.tenantId)
      await lockUndecidedItemOrThrow(tx, review.id, item.id)

      const [currentMembership] = await tx
        .select({ id: memberships.id, role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.id, item.membershipId), eq(memberships.tenantId, opts.tenantId)))
        .for('update')
        .limit(1)

      if (!currentMembership) {
        throw new Error('Access review item not found')
      }
      if (currentMembership.role === 'org_owner') {
        throw new Error('Owner role cannot be revoked through an access review')
      }

      // Revoke path: wrap in a transaction so that a failed audit write rolls back the
      // membership delete, preventing a state where access is removed but unlogged.
      const [deletedMembership] = await getReturnedRows<{ id: string }>(
        tx
        .delete(memberships)
        .where(and(eq(memberships.id, item.membershipId), eq(memberships.tenantId, opts.tenantId))),
        { id: memberships.id },
      )

      if (!deletedMembership) {
        throw new Error('Access review item not found')
      }

      const [updatedItem] = await getReturnedRows<{ id: string }>(
        tx
        .update(accessReviewItems)
        .set({ decision: opts.decision, notes, decidedAt: now })
        .where(and(eq(accessReviewItems.id, item.id), eq(accessReviewItems.reviewId, review.id))),
        { id: accessReviewItems.id },
      )

      if (!updatedItem) {
        throw new Error('Access review item not found')
      }

      await writeAuditEvent(tx, {
        tenantId: opts.tenantId,
        actorId: opts.actorId,
        action: 'access_review.decision_recorded',
        resourceType: 'access_review_item',
        resourceId: opts.itemId,
        after: { decision: opts.decision },
      })

      await writeAuditEvent(tx, {
        tenantId: opts.tenantId,
        actorId: opts.actorId,
        action: 'membership.revoked',
        resourceType: 'membership',
        resourceId: item.membershipId,
        after: { revokedViaAccessReview: opts.reviewId },
      })
    })
    return
  }

  if (opts.decision === 'change_role') {
    const targetRole = opts.targetRole
    if (!targetRole) {
      throw new Error('Target role is required for access review role changes')
    }

    await db.transaction(async (tx) => {
      await lockOpenReviewOrThrow(tx, review.id, opts.tenantId)
      await lockUndecidedItemOrThrow(tx, review.id, item.id)

      const [currentMembership] = await tx
        .select({ id: memberships.id, role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.id, item.membershipId), eq(memberships.tenantId, opts.tenantId)))
        .for('update')
        .limit(1)

      if (!currentMembership) {
        throw new Error('Access review item not found')
      }
      if (currentMembership.role === 'org_owner') {
        throw new Error('Owner role cannot be changed through an access review')
      }

      await ensureLocationGrantForRole(tx, {
        tenantId: opts.tenantId,
        membershipId: currentMembership.id,
        targetRole,
      })

      const [updatedMembership] = await getReturnedRows<{ id: string }>(
        tx
        .update(memberships)
        .set({ role: targetRole })
        .where(and(eq(memberships.id, item.membershipId), eq(memberships.tenantId, opts.tenantId))),
        { id: memberships.id },
      )

      if (!updatedMembership) {
        throw new Error('Access review item not found')
      }

      const [updatedItem] = await getReturnedRows<{ id: string }>(
        tx
        .update(accessReviewItems)
        .set({ decision: opts.decision, notes, decidedAt: now })
        .where(and(eq(accessReviewItems.id, item.id), eq(accessReviewItems.reviewId, review.id))),
        { id: accessReviewItems.id },
      )

      if (!updatedItem) {
        throw new Error('Access review item not found')
      }

      await writeAuditEvent(tx, {
        tenantId: opts.tenantId,
        actorId: opts.actorId,
        action: 'access_review.decision_recorded',
        resourceType: 'access_review_item',
        resourceId: opts.itemId,
        after: { decision: opts.decision, targetRole },
      })

      await writeAuditEvent(tx, {
        tenantId: opts.tenantId,
        actorId: opts.actorId,
        action: 'membership.role_changed',
        resourceType: 'membership',
        resourceId: item.membershipId,
        before: { role: currentMembership.role },
        after: { role: targetRole, changedViaAccessReview: opts.reviewId },
      })
    })
    return
  }

  // Keep decisions still need atomicity so audit failure rolls back the item update.
  await db.transaction(async (tx) => {
    await lockOpenReviewOrThrow(tx, review.id, opts.tenantId)
    await lockUndecidedItemOrThrow(tx, review.id, item.id)

    const [updatedItem] = await getReturnedRows<{ id: string }>(
      tx
      .update(accessReviewItems)
      .set({ decision: opts.decision, notes, decidedAt: now })
      .where(and(eq(accessReviewItems.id, item.id), eq(accessReviewItems.reviewId, review.id))),
      { id: accessReviewItems.id },
    )

    if (!updatedItem) {
      throw new Error('Access review item not found')
    }

    await writeAuditEvent(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
      action: 'access_review.decision_recorded',
      resourceType: 'access_review_item',
      resourceId: opts.itemId,
      after: { decision: opts.decision },
    })
  })
}

export async function closeAccessReview(
  db: AuditCapableDb,
  opts: { reviewId: string; actorId: string; tenantId: string },
): Promise<void> {
  await db.transaction(async (tx) => {
    await assertAccessReviewActorBelongsToTenant(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
    })

    const [review] = await tx
      .select({ id: accessReviews.id, status: accessReviews.status })
      .from(accessReviews)
      .where(and(eq(accessReviews.id, opts.reviewId), eq(accessReviews.tenantId, opts.tenantId)))
      .for('update')
      .limit(1)
    if (!review) throw new Error('Access review not found')
    if (review.status === 'closed') throw new Error('Access review is already closed')

    const undecided = await tx
      .select({ id: accessReviewItems.id })
      .from(accessReviewItems)
      .where(and(eq(accessReviewItems.reviewId, review.id), isNull(accessReviewItems.decision)))
      .for('update')

    if (undecided.length > 0) {
      throw new Error(`Cannot close review: ${undecided.length} undecided item(s) remain`)
    }

    const now = new Date()

    const [updatedReview] = await getReturnedRows<{ id: string }>(
      tx
      .update(accessReviews)
      .set({
        status: 'closed' as const,
        completedByUserId: opts.actorId,
        completedAt: now,
      })
      .where(eq(accessReviews.id, review.id)),
      { id: accessReviews.id },
    )

    if (!updatedReview) {
      throw new Error('Access review not found')
    }

    await writeAuditEvent(tx, {
      tenantId: opts.tenantId,
      actorId: opts.actorId,
      action: 'access_review.closed',
      resourceType: 'access_review',
      resourceId: opts.reviewId,
      after: { status: 'closed', completedAt: now },
    })
  })
}
