import { eq, and, asc, getTableColumns, sql } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import { locations, memberships, users, type DB } from '@phiguard/db'
import { incidents } from './schema/incidents.phi.js'
import type { Incident, NewIncident } from './schema/incidents.phi.js'
import { incidentUpdates } from './schema/incident-updates.phi.js'
import type { IncidentUpdate } from './schema/incident-updates.phi.js'

// Immutable state machine for incident status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  reported: ['triaging'],
  triaging: ['contained'],
  contained: ['resolved'],
  resolved: ['closed'],
  closed: [],
}

async function assertIncidentUserBelongsToTenant(
  db: DB,
  input: {
    userId: string
    tenantId: string
    errorMessage: string
  },
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

async function assertIncidentActorBelongsToTenant(
  db: DB,
  input: { actorId: string; tenantId: string },
) {
  await assertIncidentUserBelongsToTenant(db, {
    userId: input.actorId,
    tenantId: input.tenantId,
    errorMessage: 'Incident actor is not a member of this organization',
  })
}

async function assertIncidentLocationBelongsToTenant(
  db: DB,
  input: { locationId: string; tenantId: string },
) {
  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.id, input.locationId), eq(locations.organizationId, input.tenantId)))
    .limit(1)

  if (!location) {
    throw new Error('Incident location not found')
  }
}

/**
 * Transition an incident to a new status, enforcing the VALID_TRANSITIONS
 * state machine. Throws if the transition is invalid.
 * Writes an audit event on success.
 */
export async function transitionIncident(
  db: DB,
  input: {
    incidentId: string
    tenantId: string
    actorId: string
    toStatus: 'triaging' | 'contained' | 'resolved' | 'closed'
  },
): Promise<Incident> {
  // Fetch current incident with tenant scoping
  const [current] = await db
    .select()
    .from(incidents)
    .where(and(eq(incidents.id, input.incidentId), eq(incidents.tenantId, input.tenantId)))
    .limit(1)

  if (!current) {
    throw new Error(`Incident not found or does not belong to tenant: ${input.incidentId}`)
  }

  await assertIncidentActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  const allowedNext = VALID_TRANSITIONS[current.status] ?? []
  if (!allowedNext.includes(input.toStatus)) {
    throw new Error(
      `Invalid transition: ${current.status} → ${input.toStatus}. ` +
        `Allowed next states: [${allowedNext.join(', ') || 'none'}]`,
    )
  }

  const now = new Date()
  const setPayload: Partial<Incident> = {
    status: input.toStatus,
    updatedAt: now,
  }

  if (input.toStatus === 'resolved') {
    setPayload.resolvedAt = now
  }
  if (input.toStatus === 'closed') {
    setPayload.closedAt = now
  }

  const auditAction =
    input.toStatus === 'resolved'
      ? 'incident.resolved'
      : input.toStatus === 'closed'
        ? 'incident.closed'
        : 'incident.status_changed'

  // Atomic: update + audit write must succeed or fail together
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(incidents)
      .set(setPayload)
      .where(
        and(
          eq(incidents.id, input.incidentId),
          eq(incidents.tenantId, input.tenantId),
          eq(incidents.status, current.status),
        ),
      )
      .returning()

    if (!row) {
      throw new Error('Incident status changed before the transition could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: auditAction,
      resourceType: 'incident',
      resourceId: input.incidentId,
      before: { status: current.status },
      after: { status: input.toStatus },
    })

    return row
  })

  return updated
}

/**
 * Create a new incident record, scoped to the given tenant.
 * Writes an audit event on success.
 * NOTE: summary field may contain PHI - never log it.
 */
export async function createIncident(
  db: DB,
  input: {
    tenantId: string
    locationId: string
    title: string
    summary?: string
    severity: string
    category: string
    discoveredAt: Date
    discoveredBy?: string
    affectedSystems?: string[]
    actorId: string
  },
): Promise<Incident> {
  await assertIncidentLocationBelongsToTenant(db, {
    locationId: input.locationId,
    tenantId: input.tenantId,
  })
  await assertIncidentActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })
  if (input.discoveredBy) {
    await assertIncidentUserBelongsToTenant(db, {
      userId: input.discoveredBy,
      tenantId: input.tenantId,
      errorMessage: 'Incident discovered user is not a member of this organization',
    })
  }

  const values: NewIncident = {
    tenantId: input.tenantId,
    locationId: input.locationId,
    title: input.title,
    summary: input.summary ?? null,
    severity: input.severity as Incident['severity'],
    category: input.category as Incident['category'],
    status: 'reported',
    discoveredAt: input.discoveredAt,
    discoveredBy: input.discoveredBy ?? null,
    affectedSystems: input.affectedSystems ?? null,
    reportedAt: new Date(),
  }

  return db.transaction(async (tx) => {
    const [created] = await tx.insert(incidents).values(values).returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: created.locationId,
      actorId: input.actorId,
      action: 'incident.created',
      resourceType: 'incident',
      resourceId: created.id,
      after: {
        // HIPAA: omit title and summary - both are free-text fields that may contain PHI
        severity: created.severity,
        category: created.category,
        status: created.status,
      },
    })

    return created
  })
}

/**
 * Update editable descriptive fields on an existing incident.
 * Writes an audit event capturing before/after state.
 * NOTE: summary field may contain PHI - never log it.
 */
export async function updateIncident(
  db: DB,
  input: {
    incidentId: string
    tenantId: string
    actorId: string
    title?: string
    summary?: string | null
    severity?: string
    category?: string
  },
): Promise<Incident> {
  if (
    input.title === undefined &&
    input.summary === undefined &&
    input.severity === undefined &&
    input.category === undefined
  ) {
    throw new Error('At least one incident field must be provided')
  }

  const [current] = await db
    .select()
    .from(incidents)
    .where(and(eq(incidents.id, input.incidentId), eq(incidents.tenantId, input.tenantId)))
    .limit(1)

  if (!current) throw new Error('Incident not found')

  await assertIncidentActorBelongsToTenant(db, {
    actorId: input.actorId,
    tenantId: input.tenantId,
  })

  const setPayload: Partial<Incident> = { updatedAt: new Date() }
  if (input.title !== undefined) setPayload.title = input.title
  if (input.summary !== undefined) setPayload.summary = input.summary
  if (input.severity !== undefined) setPayload.severity = input.severity as Incident['severity']
  if (input.category !== undefined) setPayload.category = input.category as Incident['category']

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(incidents)
      .set(setPayload)
      .where(and(eq(incidents.id, input.incidentId), eq(incidents.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Incident changed before the update could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: current.locationId,
      actorId: input.actorId,
      action: 'incident.updated',
      resourceType: 'incident',
      resourceId: input.incidentId,
      before: {
        // HIPAA: omit title and summary from audit log
        severity: current.severity,
        category: current.category,
      },
      after: {
        severity: updated.severity,
        category: updated.category,
      },
    })

    return updated
  })
}

/**
 * Append an immutable update note to an incident.
 * NOTE: text field may contain operational context - never log it.
 * Writes an audit event on success.
 */
export async function appendIncidentUpdate(
  db: DB,
  input: {
    incidentId: string
    tenantId: string
    authorId: string
    text: string
  },
): Promise<IncidentUpdate> {
  const [incident] = await db
    .select({ id: incidents.id, locationId: incidents.locationId })
    .from(incidents)
    .where(and(eq(incidents.id, input.incidentId), eq(incidents.tenantId, input.tenantId)))
    .limit(1)

  if (!incident) throw new Error('Incident not found')

  await assertIncidentActorBelongsToTenant(db, {
    actorId: input.authorId,
    tenantId: input.tenantId,
  })

  return db.transaction(async (tx) => {
    const [record] = await tx
      .insert(incidentUpdates)
      .values({
        tenantId: input.tenantId,
        incidentId: input.incidentId,
        authorId: input.authorId,
        text: input.text,
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      locationId: incident.locationId,
      actorId: input.authorId,
      action: 'incident.update_appended',
      resourceType: 'incident',
      resourceId: input.incidentId,
      // HIPAA: do not include note text in audit log
      after: { noteId: record.id },
    })

    return record
  })
}

export type IncidentUpdateWithAuthor = IncidentUpdate & { authorName: string }

/**
 * List all append-only updates for a given incident, ordered chronologically.
 */
export async function listIncidentUpdates(
  db: DB,
  input: { incidentId: string; tenantId: string },
): Promise<IncidentUpdateWithAuthor[]> {
  // Join through incidents to enforce tenant isolation.
  const [incident] = await db
    .select({ id: incidents.id })
    .from(incidents)
    .where(and(eq(incidents.id, input.incidentId), eq(incidents.tenantId, input.tenantId)))
    .limit(1)

  if (!incident) throw new Error('Incident not found')

  return db
    .select({
      ...getTableColumns(incidentUpdates),
      authorName: sql<string>`coalesce(${users.name}, ${users.email})`,
    })
    .from(incidentUpdates)
    .innerJoin(users, eq(incidentUpdates.authorId, users.id))
    .where(
      and(
        eq(incidentUpdates.incidentId, input.incidentId),
        eq(incidentUpdates.tenantId, input.tenantId),
      ),
    )
    .orderBy(asc(incidentUpdates.createdAt))
}
