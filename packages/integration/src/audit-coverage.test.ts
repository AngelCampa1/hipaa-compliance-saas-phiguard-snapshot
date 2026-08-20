/**
 * Audit coverage integration test.
 *
 * Verifies representative PHI-adjacent mutation paths write audit events.
 * Uses testcontainers to spin up a real Postgres DB with migrations.
 *
 * Action names verified from:
 *   - packages/db/src/tasks/index.ts:
 *     task.created, task.status_updated, task.assigned, task.comment.added, task.attachment.uploaded
 *   - packages/compliance/src/checklists.ts:
 *     checklist_item.completed, checklist_item.reopened
 *   - packages/compliance/src/incidents.ts:
 *     incident.created, incident.status_changed
 *   - packages/baa/src/service.ts:
 *     terms.accepted, baa.accepted
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { auditEvents, withAuditContext } from '@phiguard/audit'
import { BaaService, getStandardLegalDocument, hashDocument } from '@phiguard/baa'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
} from '@phiguard/db/testing'
import { locations, memberships, organizations, users } from '@phiguard/db'
import {
  addComment,
  assignTask,
  createAttachment,
  createTask,
  updateTaskStatus,
} from '@phiguard/db/tasks'
import {
  checklists,
  checklistItems,
  completeItem,
  createIncident,
  reopenItem,
  transitionIncident,
} from '@phiguard/compliance'

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('audit coverage integration', () => {
let testDB: Awaited<ReturnType<typeof createTestDB>>

beforeAll(async () => {
  testDB = await createTestDB()
}, 120_000)

afterAll(async () => {
  await testDB.teardown()
})

async function seedTenant() {
  const { db } = testDB
  const [org] = await db.insert(organizations).values(makeOrganization()).returning()
  const [user] = await db.insert(users).values(makeUser()).returning()
  const [location] = await db
    .insert(locations)
    .values({
      organizationId: org.id,
      name: 'Primary Location',
      slug: `primary-${org.id.slice(0, 8)}`,
      isPrimary: true,
    })
    .returning()
  await db.insert(memberships).values(makeMembership({ tenantId: org.id, userId: user.id }))

  return { org, user, location }
}

async function getAuditEventsForResource(resourceId: string) {
  const { db } = testDB
  return db.select().from(auditEvents).where(eq(auditEvents.resourceId, resourceId))
}

describe('task mutations - audit coverage', () => {
  it('createTask writes task.created', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const task = await withAuditContext({ actorId: user.id }, () =>
      createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'HIPAA policy review task',
        createdBy: user.id,
      }),
    )

    const events = await getAuditEventsForResource(task.id)
    const createEvent = events.find((event) => event.action === 'task.created')
    expect(createEvent).toBeDefined()
    expect(createEvent?.resourceType).toBe('task')
    expect(createEvent?.tenantId).toBe(org.id)
  })

  it('updateTaskStatus writes task.status_updated', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const task = await createTask(db, {
      tenantId: org.id,
      locationId: location.id,
      title: 'Status update audit test',
      createdBy: user.id,
    })

    await updateTaskStatus(db, {
      taskId: task.id,
      tenantId: org.id,
      actorId: user.id,
      status: 'in_progress',
    })

    const events = await getAuditEventsForResource(task.id)
    const updateEvent = events.find((event) => event.action === 'task.status_updated')
    expect(updateEvent).toBeDefined()
    expect(updateEvent?.resourceType).toBe('task')
  })

  it('assignTask writes task.assigned', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()
    const [assignee] = await db.insert(users).values(makeUser()).returning()
    await db.insert(memberships).values(makeMembership({ tenantId: org.id, userId: assignee.id }))

    const task = await createTask(db, {
      tenantId: org.id,
      locationId: location.id,
      title: 'Assignment audit test',
      createdBy: user.id,
    })

    await assignTask(db, {
      taskId: task.id,
      tenantId: org.id,
      userId: assignee.id,
      assignedBy: user.id,
    })

    const events = await getAuditEventsForResource(task.id)
    const assignEvent = events.find((event) => event.action === 'task.assigned')
    expect(assignEvent).toBeDefined()
    expect(assignEvent?.resourceType).toBe('task')
  })

  it('addComment writes task.comment.added', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const task = await createTask(db, {
      tenantId: org.id,
      locationId: location.id,
      title: 'Comment audit test',
      createdBy: user.id,
    })

    const comment = await addComment(db, {
      taskId: task.id,
      tenantId: org.id,
      authorId: user.id,
      body: 'Reviewed HIPAA section 164.312.',
    })

    const events = await getAuditEventsForResource(comment.id)
    const commentEvent = events.find((event) => event.action === 'task.comment.added')
    expect(commentEvent).toBeDefined()
    expect(commentEvent?.resourceType).toBe('task_comment')
  })

  it('createAttachment writes task.attachment.uploaded', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const task = await createTask(db, {
      tenantId: org.id,
      locationId: location.id,
      title: 'Attachment audit test',
      createdBy: user.id,
    })

    const attachment = await createAttachment(db, {
      taskId: task.id,
      tenantId: org.id,
      s3Key: `attachments/${org.id}/${task.id}/policy.pdf`,
      contentType: 'application/pdf',
      sizeBytes: 12_345,
      uploadedBy: user.id,
    })

    const events = await getAuditEventsForResource(attachment.id)
    const attachEvent = events.find((event) => event.action === 'task.attachment.uploaded')
    expect(attachEvent).toBeDefined()
    expect(attachEvent?.resourceType).toBe('task_attachment')
  })
})

describe('compliance mutations - audit coverage', () => {
  async function seedChecklist() {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const [checklist] = await db
      .insert(checklists)
      .values({
        tenantId: org.id,
        locationId: location.id,
        name: 'HIPAA Security Rule Checklist',
      })
      .returning()

    const [item] = await db
      .insert(checklistItems)
      .values({
        checklistId: checklist.id,
        tenantId: org.id,
        locationId: location.id,
        title: 'Implement access controls',
        hipaaReference: '164.312(a)(1)',
      })
      .returning()

    return { org, user, location, item }
  }

  it('completeItem writes checklist_item.completed', async () => {
    const { db } = testDB
    const { org, user, item } = await seedChecklist()

    await completeItem(db, {
      itemId: item.id,
      tenantId: org.id,
      actorId: user.id,
    })

    const events = await getAuditEventsForResource(item.id)
    const completeEvent = events.find((event) => event.action === 'checklist_item.completed')
    expect(completeEvent).toBeDefined()
    expect(completeEvent?.resourceType).toBe('checklist_item')
    expect(completeEvent?.tenantId).toBe(org.id)
  })

  it('reopenItem writes checklist_item.reopened', async () => {
    const { db } = testDB
    const { org, user, item } = await seedChecklist()

    await completeItem(db, {
      itemId: item.id,
      tenantId: org.id,
      actorId: user.id,
    })

    await reopenItem(db, {
      itemId: item.id,
      tenantId: org.id,
      actorId: user.id,
    })

    const events = await getAuditEventsForResource(item.id)
    const reopenEvent = events.find((event) => event.action === 'checklist_item.reopened')
    expect(reopenEvent).toBeDefined()
    expect(reopenEvent?.resourceType).toBe('checklist_item')
  })

  it('createIncident writes incident.created', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const incident = await createIncident(db, {
      tenantId: org.id,
      locationId: location.id,
      title: 'Potential unauthorized access',
      severity: 'high',
      category: 'unauthorized_access',
      discoveredAt: new Date(),
      actorId: user.id,
    })

    const events = await getAuditEventsForResource(incident.id)
    const createEvent = events.find((event) => event.action === 'incident.created')
    expect(createEvent).toBeDefined()
    expect(createEvent?.resourceType).toBe('incident')
    expect(createEvent?.tenantId).toBe(org.id)
  })

  it('transitionIncident writes incident.status_changed', async () => {
    const { db } = testDB
    const { org, user, location } = await seedTenant()

    const incident = await createIncident(db, {
      tenantId: org.id,
      locationId: location.id,
      title: 'Device lost incident',
      severity: 'medium',
      category: 'lost_device',
      discoveredAt: new Date(),
      actorId: user.id,
    })

    await transitionIncident(db, {
      incidentId: incident.id,
      tenantId: org.id,
      actorId: user.id,
      toStatus: 'triaging',
    })

    const events = await getAuditEventsForResource(incident.id)
    const transitionEvent = events.find((event) => event.action === 'incident.status_changed')
    expect(transitionEvent).toBeDefined()
    expect(transitionEvent?.resourceType).toBe('incident')
    expect(transitionEvent?.before).toMatchObject({ status: 'reported' })
    expect(transitionEvent?.after).toMatchObject({ status: 'triaging' })
  })
})

describe('legal acceptance mutations - audit coverage', () => {
  it('acceptLegalDocuments writes terms.accepted and baa.accepted', async () => {
    const { db } = testDB
    const { org, user } = await seedTenant()
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')
    const terms = getStandardLegalDocument('terms')
    const baa = getStandardLegalDocument('baa')

    await service.acceptLegalDocuments(
      {
        orgId: org.id,
        userId: user.id,
        userEmail: user.email,
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: user.name ?? user.email,
        signerTitle: 'Founder',
        acceptedAt,
        expectedTermsVersion: terms.version,
        expectedTermsHash: hashDocument(terms),
        expectedBaaVersion: baa.version,
        expectedBaaHash: hashDocument(baa),
        executedArtifacts: {},
      },
      db,
    )

    const termsEvents = await getAuditEventsForResource(`${org.id}:terms:${acceptedAt.toISOString()}`)
    const baaEvents = await getAuditEventsForResource(`${org.id}:baa:${acceptedAt.toISOString()}`)
    const termsEvent = termsEvents.find((event) => event.action === 'terms.accepted')
    const baaEvent = baaEvents.find((event) => event.action === 'baa.accepted')

    expect(termsEvent).toBeDefined()
    expect(termsEvent?.tenantId).toBe(org.id)
    expect(termsEvent?.actorId).toBe(user.id)
    expect(termsEvent?.resourceType).toBe('legal_acceptance')
    expect(termsEvent?.after).toMatchObject({
      documentType: 'terms',
      documentVersion: terms.version,
      acceptedAt: acceptedAt.toISOString(),
    })

    expect(baaEvent).toBeDefined()
    expect(baaEvent?.tenantId).toBe(org.id)
    expect(baaEvent?.actorId).toBe(user.id)
    expect(baaEvent?.resourceType).toBe('legal_acceptance')
    expect(baaEvent?.after).toMatchObject({
      documentType: 'baa',
      documentVersion: baa.version,
      acceptedAt: acceptedAt.toISOString(),
    })
  })
})

})
