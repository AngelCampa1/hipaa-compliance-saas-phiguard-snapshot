import { and, desc, eq, inArray, or } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import { locations, memberships, type DB } from '@phiguard/db'
import { checklists, type Checklist } from './schema/checklists.js'
import { checklistItems, type ChecklistItem } from './schema/checklist-items.phi.js'
import { checklistTemplates } from './schema/checklist-templates.js'
import { policies } from './schema/policies.js'
import { policyAssignments, type PolicyAssignment } from './schema/policy-assignments.js'
import {
  canonicalizeTemplateId,
  getCompatibleStarterTemplateIds,
  getStarterTemplateItems,
} from './seeds/starter-templates.js'

async function assertLocationsBelongToTenant(
  db: DB,
  input: { tenantId: string; locationIds: string[] },
) {
  const locationIds = [...new Set(input.locationIds)]
  if (locationIds.length === 0) return

  const rows = await db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.organizationId, input.tenantId), inArray(locations.id, locationIds)))

  if (rows.length !== locationIds.length) {
    throw new Error('Location not found or tenant mismatch')
  }
}

async function assertAssignmentActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; actorId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.actorId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error('Assignment actor is not a member of this organization')
  }
}

export async function assignChecklistTemplateToLocations(
  db: DB,
  input: {
    tenantId: string
    templateId: string
    locationIds: string[]
    actorId: string
    dueAt?: Date
  },
) {
  const locationIds = [...new Set(input.locationIds)]
  await assertAssignmentActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  if (locationIds.length === 0) {
    return {
      created: [] satisfies Checklist[],
      skippedLocationIds: [] satisfies string[],
    }
  }

  const canonicalTemplateId = canonicalizeTemplateId(input.templateId)
  const compatibleTemplateIds = getCompatibleStarterTemplateIds(input.templateId)
  const starterTemplateName = inferTemplateName(canonicalTemplateId)
  const [persistedTemplate] = await db
    .select({
      id: checklistTemplates.id,
      name: checklistTemplates.name,
    })
    .from(checklistTemplates)
    .where(
      or(
        inArray(checklistTemplates.id, compatibleTemplateIds),
        eq(checklistTemplates.name, starterTemplateName),
      ),
    )
    .limit(1)
  const templateItems = getStarterTemplateItems(canonicalTemplateId)
  if (!persistedTemplate || templateItems.length === 0) {
    throw new Error('Checklist template not found')
  }

  await assertLocationsBelongToTenant(db, {
    tenantId: input.tenantId,
    locationIds,
  })

  const existing = await db
    .select({
      locationId: checklists.locationId,
      checklistId: checklists.id,
    })
    .from(checklists)
    .where(
      and(
        eq(checklists.tenantId, input.tenantId),
        inArray(checklists.templateId, compatibleTemplateIds),
        inArray(checklists.locationId, locationIds),
        inArray(checklists.status, ['active', 'completed']),
      ),
    )

  const existingLocationIds = new Set(existing.map((row) => row.locationId))
  const locationIdsToCreate = locationIds.filter(
    (locationId) => !existingLocationIds.has(locationId),
  )

  if (locationIdsToCreate.length === 0) {
    return {
      created: [] satisfies Checklist[],
      skippedLocationIds: locationIds.filter((locationId) =>
        existingLocationIds.has(locationId),
      ),
    }
  }

  const created = await db.transaction(async (tx) => {
    const results: Checklist[] = []

    for (const locationId of locationIdsToCreate) {
      const [checklist] = await tx
        .insert(checklists)
        .values({
          tenantId: input.tenantId,
          locationId,
          templateId: persistedTemplate.id,
          name: persistedTemplate.name,
          dueAt: input.dueAt ?? null,
        })
        .returning()

      const createdItems: ChecklistItem[] = await tx
        .insert(checklistItems)
        .values(
          templateItems.map((item) => ({
            checklistId: checklist.id,
            tenantId: input.tenantId,
            locationId,
            title: item.title,
            description: item.description,
            hipaaReference: item.hipaaReference,
          })),
        )
        .returning()

      for (const item of createdItems) {
        await writeAuditEvent(tx, {
          tenantId: input.tenantId,
          locationId,
          actorId: input.actorId,
          action: 'checklist_item.create',
          resourceType: 'checklist_item',
          resourceId: item.id,
          after: {
            checklistId: checklist.id,
            templateId: input.templateId,
            canonicalTemplateId,
            title: item.title,
            status: item.status,
          },
        })
      }

      await writeAuditEvent(tx, {
        tenantId: input.tenantId,
        locationId,
        actorId: input.actorId,
        action: 'checklist.assigned',
        resourceType: 'checklist',
        resourceId: checklist.id,
        after: {
          templateId: input.templateId,
          canonicalTemplateId,
          status: checklist.status,
        },
      })

      results.push(checklist)
    }

    return results
  })

  return {
    created,
    skippedLocationIds: locationIds.filter((locationId) =>
      existingLocationIds.has(locationId),
    ),
  }
}

export async function assignPolicyToLocations(
  db: DB,
  input: {
    tenantId: string
    policyId: string
    locationIds: string[]
    actorId: string
    dueAt?: Date
  },
) {
  const locationIds = [...new Set(input.locationIds)]
  await assertAssignmentActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  const [policy] = await db
    .select()
    .from(policies)
    .where(and(eq(policies.id, input.policyId), eq(policies.tenantId, input.tenantId)))
    .limit(1)

  if (!policy) {
    throw new Error('Policy not found')
  }

  if (locationIds.length === 0) {
    return {
      policy,
      created: [] satisfies PolicyAssignment[],
      skippedLocationIds: [] satisfies string[],
    }
  }

  await assertLocationsBelongToTenant(db, {
    tenantId: input.tenantId,
    locationIds,
  })

  const existingAssignments = await db
    .select({
      locationId: policyAssignments.locationId,
      assignmentId: policyAssignments.id,
    })
    .from(policyAssignments)
    .where(
      and(
        eq(policyAssignments.tenantId, input.tenantId),
        eq(policyAssignments.policyId, input.policyId),
        inArray(policyAssignments.locationId, locationIds),
      ),
    )

  const existingLocationIds = new Set(existingAssignments.map((row) => row.locationId))
  const locationIdsToCreate = locationIds.filter(
    (locationId) => !existingLocationIds.has(locationId),
  )

  if (locationIdsToCreate.length === 0) {
    return {
      policy,
      created: [] satisfies PolicyAssignment[],
      skippedLocationIds: locationIds.filter((locationId) =>
        existingLocationIds.has(locationId),
      ),
    }
  }

  const created = await db.transaction(async (tx) => {
    const rows: PolicyAssignment[] = []

    for (const locationId of locationIdsToCreate) {
      const [assignment] = await tx
        .insert(policyAssignments)
        .values({
          tenantId: input.tenantId,
          policyId: input.policyId,
          locationId,
          dueAt: input.dueAt ?? null,
          assignedBy: input.actorId,
        })
        .onConflictDoNothing({
          target: [policyAssignments.policyId, policyAssignments.locationId],
        })
        .returning()

      if (!assignment) {
        continue
      }

      await writeAuditEvent(tx, {
        tenantId: input.tenantId,
        locationId,
        actorId: input.actorId,
        action: 'policy.assigned',
        resourceType: 'policy_assignment',
        resourceId: assignment.id,
        after: {
          policyId: input.policyId,
          status: assignment.status,
        },
      })

      rows.push(assignment)
    }

    return rows
  })

  return {
    policy,
    created,
    skippedLocationIds: locationIds.filter(
      (locationId) =>
        existingLocationIds.has(locationId) ||
        !created.some((assignment) => assignment.locationId === locationId),
    ),
  }
}

export async function completePolicyAssignment(
  db: DB,
  input: {
    tenantId: string
    assignmentId: string
    actorId: string
  },
) {
  const [current] = await db
    .select()
    .from(policyAssignments)
    .where(
      and(
        eq(policyAssignments.id, input.assignmentId),
        eq(policyAssignments.tenantId, input.tenantId),
      ),
    )
    .limit(1)

  if (!current) {
    throw new Error('Policy assignment not found')
  }

  await assertAssignmentActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(policyAssignments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completedBy: input.actorId,
      })
      .where(
        and(
          eq(policyAssignments.id, current.id),
          eq(policyAssignments.tenantId, input.tenantId),
          eq(policyAssignments.status, current.status),
        ),
      )
      .returning()

    if (!updated) {
      throw new Error('Policy assignment changed before completion could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: 'policy.completed',
      resourceType: 'policy_assignment',
      resourceId: updated.id,
      before: { status: current.status },
      after: { status: updated.status },
    })

    return updated
  })
}

export async function reopenPolicyAssignment(
  db: DB,
  input: {
    tenantId: string
    assignmentId: string
    actorId: string
  },
) {
  const [current] = await db
    .select()
    .from(policyAssignments)
    .where(
      and(
        eq(policyAssignments.id, input.assignmentId),
        eq(policyAssignments.tenantId, input.tenantId),
      ),
    )
    .limit(1)

  if (!current) {
    throw new Error('Policy assignment not found')
  }

  await assertAssignmentActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(policyAssignments)
      .set({
        status: 'assigned',
        completedAt: null,
        completedBy: null,
      })
      .where(
        and(
          eq(policyAssignments.id, current.id),
          eq(policyAssignments.tenantId, input.tenantId),
          eq(policyAssignments.status, current.status),
        ),
      )
      .returning()

    if (!updated) {
      throw new Error('Policy assignment changed before it could be reopened')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: 'policy.reopened',
      resourceType: 'policy_assignment',
      resourceId: updated.id,
      before: { status: current.status },
      after: { status: updated.status },
    })

    return updated
  })
}

export async function listPolicyAssignments(
  db: DB,
  input: {
    tenantId: string
    locationIds: string[]
    policyId?: string
  },
) {
  if (input.locationIds.length === 0) {
    return []
  }

  const conditions = [
    eq(policyAssignments.tenantId, input.tenantId),
    inArray(policyAssignments.locationId, input.locationIds),
  ]
  if (input.policyId) {
    conditions.push(eq(policyAssignments.policyId, input.policyId))
  }
  return db
    .select()
    .from(policyAssignments)
    .where(and(...conditions))
    .orderBy(desc(policyAssignments.assignedAt))
}

function inferTemplateName(templateId: string) {
  const canonicalTemplateId = canonicalizeTemplateId(templateId)
  const entries = {
    '11111111-1111-4111-8111-111111111111': 'Access Review',
    '22222222-2222-4222-8222-222222222222': 'Risk Assessment Cadence',
    '33333333-3333-4333-8333-333333333333': 'BAA Inventory',
    '44444444-4444-4444-8444-444444444444': 'Workforce Training Log',
  } as const

  return entries[canonicalTemplateId as keyof typeof entries] ?? 'Checklist'
}
