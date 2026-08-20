import { eq, and, count } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import { memberships, type DB } from '@phiguard/db'
import { checklistItems } from './schema/checklist-items.phi.js'
import type { ChecklistItem } from './schema/checklist-items.phi.js'
import { checklists } from './schema/checklists.js'
import type { Checklist } from './schema/checklists.js'

export interface ProgressResult {
  total: number
  complete: number
  naCount: number
  pct: number
}

/**
 * Compute completion progress for a list of checklist items.
 * Returns pct: 0 when there are no items (no division by zero).
 */
export function computeProgress(items: { status: string }[]): ProgressResult {
  const total = items.length
  if (total === 0) {
    return { total: 0, complete: 0, naCount: 0, pct: 0 }
  }

  const complete = items.filter((i) => i.status === 'complete').length
  const naCount = items.filter((i) => i.status === 'na').length
  const applicableTotal = total - naCount
  const pct = applicableTotal === 0 ? 100 : Math.round((complete / applicableTotal) * 100)

  return { total, complete, naCount, pct }
}

async function assertChecklistActorBelongsToTenant(
  db: DB,
  input: { actorId: string; tenantId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.actorId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error('Checklist actor is not a member of this organization')
  }
}

/**
 * Mark a checklist item as complete, scoped to the given tenant.
 * Writes an audit event on success.
 */
export async function completeItem(
  db: DB,
  input: {
    itemId: string
    tenantId: string
    actorId: string
  },
): Promise<ChecklistItem> {
  const [current] = await db
    .select()
    .from(checklistItems)
    .where(and(eq(checklistItems.id, input.itemId), eq(checklistItems.tenantId, input.tenantId)))
    .limit(1)

  if (!current) {
    throw new Error('Item not found or tenant mismatch')
  }
  await assertChecklistActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  const now = new Date()

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(checklistItems)
      .set({
        status: 'complete',
        completedAt: now,
        completedBy: input.actorId as string,
        updatedAt: now,
      })
      .where(and(eq(checklistItems.id, input.itemId), eq(checklistItems.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Item not found or tenant mismatch')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: 'checklist_item.completed',
      resourceType: 'checklist_item',
      resourceId: input.itemId,
      before: { status: current.status },
      after: { status: 'complete', completedAt: now },
    })

    return updated
  })
}

const STORAGE_KEY_PATTERN = /^storage:\/\/[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]\/.+/

function parseEvidenceStorageKey(evidence: string) {
  const path = evidence.slice('storage://'.length)
  const separatorIndex = path.indexOf('/')

  if (separatorIndex <= 0 || separatorIndex === path.length - 1) {
    return null
  }

  return path.slice(separatorIndex + 1)
}

function assertChecklistEvidenceStorageKey(input: {
  evidence: string
  itemId: string
  tenantId: string
}) {
  const key = parseEvidenceStorageKey(input.evidence)
  const expectedPrefix = `evidence/${input.tenantId}/checklist-items/${input.itemId}/`

  if (!key || !key.startsWith(expectedPrefix) || key.length === expectedPrefix.length) {
    throw new Error('Invalid evidence key')
  }
}

export async function attachEvidence(
  db: DB,
  input: {
    itemId: string
    tenantId: string
    actorId: string
    evidence: string
  },
): Promise<ChecklistItem> {
  if (!STORAGE_KEY_PATTERN.test(input.evidence)) {
    throw new Error(
      `Invalid evidence value: must be a storage URI (storage://bucket/key). Raw text is not accepted.`,
    )
  }

  const [current] = await db
    .select()
    .from(checklistItems)
    .where(and(eq(checklistItems.id, input.itemId), eq(checklistItems.tenantId, input.tenantId)))
    .limit(1)

  if (!current) {
    throw new Error('Item not found or tenant mismatch')
  }
  await assertChecklistActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })
  assertChecklistEvidenceStorageKey(input)

  const now = new Date()

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(checklistItems)
      .set({
        evidence: input.evidence,
        updatedAt: now,
      })
      .where(and(eq(checklistItems.id, input.itemId), eq(checklistItems.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Item not found or tenant mismatch')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: 'checklist_item.evidence_uploaded',
      resourceType: 'checklist_item',
      resourceId: input.itemId,
      before: { evidenceAttached: Boolean(current.evidence) },
      after: { evidenceAttached: true },
    })

    return updated
  })
}

/**
 * Reopen a completed checklist item (reset to pending, clear completedAt).
 * Writes an audit event on success.
 */
export async function reopenItem(
  db: DB,
  input: {
    itemId: string
    tenantId: string
    actorId: string
  },
): Promise<ChecklistItem> {
  const [current] = await db
    .select()
    .from(checklistItems)
    .where(and(eq(checklistItems.id, input.itemId), eq(checklistItems.tenantId, input.tenantId)))
    .limit(1)

  if (!current) {
    throw new Error('Item not found or tenant mismatch')
  }
  await assertChecklistActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  const now = new Date()

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(checklistItems)
      .set({
        status: 'pending',
        completedAt: null,
        completedBy: null,
        updatedAt: now,
      })
      .where(and(eq(checklistItems.id, input.itemId), eq(checklistItems.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Item not found or tenant mismatch')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: 'checklist_item.reopened',
      resourceType: 'checklist_item',
      resourceId: input.itemId,
      before: { status: current.status },
      after: { status: 'pending', completedAt: null },
    })

    return updated
  })
}

async function requireChecklist(
  db: DB,
  input: { checklistId: string; tenantId: string },
): Promise<Checklist> {
  const [checklist] = await db
    .select()
    .from(checklists)
    .where(and(eq(checklists.id, input.checklistId), eq(checklists.tenantId, input.tenantId)))
    .limit(1)

  if (!checklist) throw new Error('Checklist not found')

  return checklist
}

async function countCompletedChecklistItems(
  db: Pick<DB, 'select'>,
  input: { checklistId: string; tenantId: string },
) {
  const [completedRow] = await db
    .select({ cnt: count() })
    .from(checklistItems)
    .where(
      and(
        eq(checklistItems.checklistId, input.checklistId),
        eq(checklistItems.tenantId, input.tenantId),
        eq(checklistItems.status, 'complete'),
      ),
    )

  return Number(completedRow?.cnt ?? 0)
}

function assertChecklistHasNoCompletedItems(completedCount: number) {
  if (completedCount > 0) {
    throw new Error(
      'This checklist has completed items and cannot be deleted. Archive it instead.',
    )
  }
}

export async function archiveChecklist(
  db: DB,
  input: {
    checklistId: string
    tenantId: string
    actorId: string
  },
): Promise<Checklist> {
  const checklist = await requireChecklist(db, {
    checklistId: input.checklistId,
    tenantId: input.tenantId,
  })
  await assertChecklistActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  const now = new Date()

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(checklists)
      .set({ status: 'archived', updatedAt: now })
      .where(and(eq(checklists.id, input.checklistId), eq(checklists.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Checklist not found')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: checklist.locationId,
      actorId: input.actorId,
      action: 'checklist.archived',
      resourceType: 'checklist',
      resourceId: input.checklistId,
      before: { status: checklist.status },
      after: { status: 'archived' },
    })

    return updated
  })
}

export async function renameChecklist(
  db: DB,
  input: {
    checklistId: string
    tenantId: string
    actorId: string
    name: string
  },
): Promise<Checklist> {
  const checklist = await requireChecklist(db, {
    checklistId: input.checklistId,
    tenantId: input.tenantId,
  })
  await assertChecklistActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  const now = new Date()

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(checklists)
      .set({ name: input.name, updatedAt: now })
      .where(and(eq(checklists.id, input.checklistId), eq(checklists.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Checklist not found')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: checklist.locationId,
      actorId: input.actorId,
      action: 'checklist.renamed',
      resourceType: 'checklist',
      resourceId: input.checklistId,
      before: { nameChanged: false },
      after: { nameChanged: input.name !== checklist.name },
    })

    return updated
  })
}

/**
 * Delete a checklist only if no items are completed.
 * Throws if any completed items exist; caller should offer "Archive instead".
 */
export async function deleteChecklist(
  db: DB,
  input: {
    checklistId: string
    tenantId: string
    actorId: string
  },
): Promise<void> {
  const checklist = await requireChecklist(db, {
    checklistId: input.checklistId,
    tenantId: input.tenantId,
  })
  await assertChecklistActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  assertChecklistHasNoCompletedItems(
    await countCompletedChecklistItems(db, {
      checklistId: input.checklistId,
      tenantId: input.tenantId,
    }),
  )

  await db.transaction(async (tx) => {
    assertChecklistHasNoCompletedItems(
      await countCompletedChecklistItems(tx, {
        checklistId: input.checklistId,
        tenantId: input.tenantId,
      }),
    )

    const [deleted] = await tx
      .delete(checklists)
      .where(and(eq(checklists.id, input.checklistId), eq(checklists.tenantId, input.tenantId)))
      .returning({ id: checklists.id })

    if (!deleted) {
      throw new Error('Checklist not found')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: checklist.locationId,
      actorId: input.actorId,
      action: 'checklist.deleted',
      resourceType: 'checklist',
      resourceId: input.checklistId,
      before: { status: checklist.status },
    })
  })
}
