import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestDB, hasContainerRuntime, type TestDB } from '../testing/index.js'
import { makeMembership, makeOrganization, makeUser } from '../testing/factories.js'
import { locations } from '../schema/locations.js'
import { memberships } from '../schema/memberships.js'
import { organizations } from '../schema/organizations.js'
import { users } from '../schema/users.phi.js'
import { taskAssignments } from '../schema/task-assignments.phi.js'
import { taskAttachments } from '../schema/task-attachments.phi.js'
import { taskComments } from '../schema/task-comments.phi.js'
import { tasks } from '../schema/tasks.phi.js'
import {
  createTask,
  updateTask,
  updateTaskDueAt,
  updateTaskStatus,
  assignTask,
  addComment,
  listTaskComments,
  createAttachment,
  deleteTaskAttachment,
  getTaskAttachment,
  listTaskAttachments,
  updateTaskAttachmentScanResult,
  listTasks,
  getTask,
  bulkUpdateTaskStatus,
  bulkAssignTask,
} from './index.js'
import { auditEvents } from '@phiguard/audit'
import { and, eq } from 'drizzle-orm'

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('task integration with audit events', () => {
  let testDB: TestDB | undefined

  beforeAll(async () => {
    testDB = await createTestDB()
  }, 120_000)

  afterAll(async () => {
    await testDB?.teardown()
  })

  function requireTestDB(): TestDB {
    if (!testDB) {
      throw new Error('Test database not initialized')
    }

    return testDB
  }

  async function seedTenant() {
    const { db } = requireTestDB()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [location] = await db
      .insert(locations)
      .values({
        organizationId: org.id,
        name: `${org.name} Main`,
        slug: 'primary',
        isPrimary: true,
      })
      .returning()
    await db.insert(memberships).values(makeMembership({ tenantId: org.id, userId: user.id }))
    return { org, user, location }
  }

  async function seedMember(tenantId: string) {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    await db.insert(memberships).values(makeMembership({ tenantId, userId: user.id }))
    return user
  }

  function withFailingAuditWrites(db: TestDB['db']): TestDB['db'] {
    function wrap(candidate: TestDB['db']): TestDB['db'] {
      return new Proxy(candidate, {
        get(target, prop, receiver) {
          if (prop === 'insert') {
            return (table: unknown) => {
              if (table === auditEvents) {
                throw new Error('simulated audit write failure')
              }

              return target.insert(table as never)
            }
          }

          if (prop === 'transaction') {
            return (callback: (tx: TestDB['db']) => Promise<unknown>) =>
              target.transaction((tx) => callback(wrap(tx as unknown as TestDB['db'])))
          }

          const value = Reflect.get(target, prop, receiver)
          return typeof value === 'function' ? value.bind(target) : value
        },
      }) as TestDB['db']
    }

    return wrap(db)
  }

  describe('createTask', () => {
    it('inserts a task row and returns it', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Set up HIPAA policies',
        createdBy: user.id,
      })

      expect(task.id).toBeTruthy()
      expect(task.tenantId).toBe(org.id)
      expect(task.locationId).toBe(location.id)
      expect(task.title).toBe('Set up HIPAA policies')
      expect(task.status).toBe('open')
      expect(task.priority).toBe('medium')
    })

    it('writes a task.create audit event', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Audit trail test task',
        createdBy: user.id,
      })

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))

      expect(events.length).toBeGreaterThan(0)
      expect(events[0].action).toBe('task.created')
      expect(events[0].tenantId).toBe(org.id)
      expect(JSON.stringify(events[0].after)).not.toContain('Audit trail test task')
    })

    it('respects optional fields: priority and description', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Urgent task',
        description: 'This is urgent',
        priority: 'urgent',
        createdBy: user.id,
      })

      expect(task.priority).toBe('urgent')
      expect(task.description).toBe('This is urgent')
    })

    it('rolls back the task row when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      await expect(
        createTask(withFailingAuditWrites(db), {
          tenantId: org.id,
          locationId: location.id,
          title: 'Rollback task creation',
          createdBy: user.id,
        }),
      ).rejects.toThrow('simulated audit write failure')

      const rows = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.tenantId, org.id), eq(tasks.title, 'Rollback task creation')))

      expect(rows).toEqual([])
    })

    it('rejects task creation when the location belongs to another tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      await expect(
        createTask(db, {
          tenantId: tenantA.org.id,
          locationId: tenantB.location.id,
          title: 'Cross-tenant location task',
          createdBy: tenantA.user.id,
        }),
      ).rejects.toThrow('Task location not found')

      const rows = await db
        .select()
        .from(tasks)
        .where(
          and(eq(tasks.tenantId, tenantA.org.id), eq(tasks.title, 'Cross-tenant location task')),
        )

      expect(rows).toEqual([])
    })

    it('rejects task creation when the creator is not a member of the task tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      await expect(
        createTask(db, {
          tenantId: tenantA.org.id,
          locationId: tenantA.location.id,
          title: 'Cross-tenant creator task',
          createdBy: tenantB.user.id,
        }),
      ).rejects.toThrow('Task actor is not a member of this organization')

      const rows = await db
        .select()
        .from(tasks)
        .where(
          and(eq(tasks.tenantId, tenantA.org.id), eq(tasks.title, 'Cross-tenant creator task')),
        )

      expect(rows).toEqual([])
    })
  })

  describe('updateTaskStatus', () => {
    it('changes task status', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Status test task',
        createdBy: user.id,
      })

      const updated = await updateTaskStatus(db, {
        taskId: task.id,
        tenantId: org.id,
        actorId: user.id,
        status: 'in_progress',
      })

      expect(updated.status).toBe('in_progress')
    })

    it('writes a task.status_update audit event', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Audit status test',
        createdBy: user.id,
      })

      await updateTaskStatus(db, {
        taskId: task.id,
        tenantId: org.id,
        actorId: user.id,
        status: 'done',
      })

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))

      const statusEvent = events.find((event) => event.action === 'task.status_updated')
      expect(statusEvent).toBeTruthy()
      expect(statusEvent?.actorId).toBe(user.id)
    })

    it('rolls back the status update when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Rollback status test',
        createdBy: user.id,
      })

      await expect(
        updateTaskStatus(withFailingAuditWrites(db), {
          taskId: task.id,
          tenantId: org.id,
          actorId: user.id,
          status: 'done',
        }),
      ).rejects.toThrow('simulated audit write failure')

      const [current] = await db.select().from(tasks).where(eq(tasks.id, task.id)).limit(1)
      expect(current?.status).toBe('open')
    })

    it('rejects status updates when the actor is not a member of the task tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Actor membership status test',
        createdBy: tenantA.user.id,
      })

      await expect(
        updateTaskStatus(db, {
          taskId: task.id,
          tenantId: tenantA.org.id,
          actorId: tenantB.user.id,
          status: 'done',
        }),
      ).rejects.toThrow('Task actor is not a member of this organization')

      const [current] = await db.select().from(tasks).where(eq(tasks.id, task.id)).limit(1)
      expect(current?.status).toBe('open')
    })
  })

  describe('updateTaskDueAt', () => {
    it('changes a task due date and writes an audit event', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Due date test task',
        createdBy: user.id,
      })

      const dueAt = new Date('2026-05-03T09:00:00.000Z')
      const updated = await updateTaskDueAt(db, {
        taskId: task.id,
        tenantId: org.id,
        actorId: user.id,
        dueAt,
      })

      expect(updated.dueAt).toEqual(dueAt)

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))
      const dueDateEvent = events.find((event) => event.action === 'task.due_date_updated')

      expect(dueDateEvent).toBeTruthy()
      expect(dueDateEvent?.actorId).toBe(user.id)
    })

    it('rolls back the due-date update when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Rollback due date test',
        createdBy: user.id,
      })

      await expect(
        updateTaskDueAt(withFailingAuditWrites(db), {
          taskId: task.id,
          tenantId: org.id,
          actorId: user.id,
          dueAt: new Date('2026-05-03T09:00:00.000Z'),
        }),
      ).rejects.toThrow('simulated audit write failure')

      const [current] = await db.select().from(tasks).where(eq(tasks.id, task.id)).limit(1)
      expect(current?.dueAt).toBeNull()
    })
  })

  describe('updateTask', () => {
    it('updates PHI-bearing fields without copying their values into audit metadata', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Patient Smith follow-up',
        description: 'Call about Patient Smith lab results',
        createdBy: user.id,
      })

      await updateTask(db, {
        taskId: task.id,
        tenantId: org.id,
        actorId: user.id,
        title: 'Patient Smith referral update',
        description: 'Schedule Patient Smith oncology referral',
        priority: 'high',
      })

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))
      const updateEvent = events.find((event) => event.action === 'task.updated')

      expect(updateEvent).toBeTruthy()
      expect(updateEvent?.before).toMatchObject({
        titleChanged: true,
        descriptionChanged: true,
        priority: 'medium',
      })
      expect(updateEvent?.after).toMatchObject({
        titleChanged: true,
        descriptionChanged: true,
        priority: 'high',
      })
      expect(JSON.stringify(updateEvent)).not.toContain('Patient Smith')
    })

    it('clears a task description when description is set to null', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Description clear test',
        description: 'Remove this note',
        createdBy: user.id,
      })

      const updated = await updateTask(db, {
        taskId: task.id,
        tenantId: org.id,
        actorId: user.id,
        description: null,
      })

      expect(updated.description).toBeNull()

      const [current] = await db.select().from(tasks).where(eq(tasks.id, task.id)).limit(1)
      expect(current?.description).toBeNull()

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))
      const updateEvent = events.find((event) => event.action === 'task.updated')

      expect(updateEvent?.before).toMatchObject({ descriptionChanged: true })
      expect(updateEvent?.after).toMatchObject({ descriptionChanged: true })
      expect(JSON.stringify(updateEvent)).not.toContain('Remove this note')
    })

    it('rejects empty updates before writing a no-op audit event', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Empty update test',
        createdBy: user.id,
      })

      await expect(
        updateTask(db, {
          taskId: task.id,
          tenantId: org.id,
          actorId: user.id,
        }),
      ).rejects.toThrow('At least one task field must be provided')

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))
      expect(events.some((event) => event.action === 'task.updated')).toBe(false)
    })
  })

  describe('assignTask', () => {
    it('creates an assignment row', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Assign test task',
        createdBy: user.id,
      })

      await assignTask(db, {
        taskId: task.id,
        tenantId: org.id,
        userId: assignee.id,
        assignedBy: user.id,
      })

      // Verify assignment is retrievable (task detail should show it)
      const fetched = await getTask(db, task.id, org.id)
      expect(fetched).not.toBeNull()
    })

    it('writes a task.assign audit event', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Assign audit test',
        createdBy: user.id,
      })

      await assignTask(db, {
        taskId: task.id,
        tenantId: org.id,
        userId: assignee.id,
        assignedBy: user.id,
      })

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))

      const assignEvent = events.find((event) => event.action === 'task.assigned')
      expect(assignEvent).toBeTruthy()
    })

    it('does not write a duplicate assignment audit event for an existing assignment', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Duplicate assign audit test',
        createdBy: user.id,
      })

      await assignTask(db, {
        taskId: task.id,
        tenantId: org.id,
        userId: assignee.id,
        assignedBy: user.id,
      })
      await assignTask(db, {
        taskId: task.id,
        tenantId: org.id,
        userId: assignee.id,
        assignedBy: user.id,
      })

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))
      const assignEvents = events.filter((event) => event.action === 'task.assigned')
      expect(assignEvents).toHaveLength(1)
    })

    it('throws when taskId belongs to a different tenant (cross-tenant block)', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()
      const assignee = await seedMember(tenantB.org.id)

      // Task created under tenantA
      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'TenantA private task',
        createdBy: tenantA.user.id,
      })

      // TenantB attempts to assign tenantA's task - must throw
      await expect(
        assignTask(db, {
          taskId: task.id,
          tenantId: tenantB.org.id,
          userId: assignee.id,
          assignedBy: tenantB.user.id,
        }),
      ).rejects.toThrow('Task not found or tenant mismatch')
    })

    it('throws when the assignee is not a member of the task tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()
      const assignee = await seedMember(tenantB.org.id)

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Tenant A private assignment',
        createdBy: tenantA.user.id,
      })

      await expect(
        assignTask(db, {
          taskId: task.id,
          tenantId: tenantA.org.id,
          userId: assignee.id,
          assignedBy: tenantA.user.id,
        }),
      ).rejects.toThrow('Assignee is not a member of this organization')

      const rows = await db
        .select()
        .from(taskAssignments)
        .where(and(eq(taskAssignments.taskId, task.id), eq(taskAssignments.userId, assignee.id)))

      expect(rows).toEqual([])
    })

    it('rolls back the assignment when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Rollback assignment test',
        createdBy: user.id,
      })

      await expect(
        assignTask(withFailingAuditWrites(db), {
          taskId: task.id,
          tenantId: org.id,
          userId: assignee.id,
          assignedBy: user.id,
        }),
      ).rejects.toThrow('simulated audit write failure')

      const rows = await db
        .select()
        .from(taskAssignments)
        .where(and(eq(taskAssignments.taskId, task.id), eq(taskAssignments.userId, assignee.id)))

      expect(rows).toEqual([])
    })
  })

  describe('addComment', () => {
    it('inserts a comment and returns it', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Comment test task',
        createdBy: user.id,
      })

      const comment = await addComment(db, {
        taskId: task.id,
        tenantId: org.id,
        authorId: user.id,
        body: 'This is a compliance note.',
      })

      expect(comment.id).toBeTruthy()
      expect(comment.body).toBe('This is a compliance note.')
      expect(comment.taskId).toBe(task.id)
      expect(comment.tenantId).toBe(org.id)
    })

    it('writes a task.comment.add audit event', async () => {
      const { db } = requireTestDB()
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
        body: 'Audit comment body',
      })

      const events = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.resourceId, comment.id))

      const commentEvent = events.find((event) => event.action === 'task.comment.added')
      expect(commentEvent).toBeTruthy()
    })

    it('throws when taskId belongs to a different tenant (cross-tenant block)', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      // Task created under tenantA
      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'TenantA private task',
        createdBy: tenantA.user.id,
      })

      // TenantB attempts to add a comment to tenantA's task - must throw
      await expect(
        addComment(db, {
          taskId: task.id,
          tenantId: tenantB.org.id,
          authorId: tenantB.user.id,
          body: 'Cross-tenant comment attempt',
        }),
      ).rejects.toThrow('Task not found or tenant mismatch')
    })

    it('throws when the author is not a member of the task tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Foreign author task',
        createdBy: tenantA.user.id,
      })

      await expect(
        addComment(db, {
          taskId: task.id,
          tenantId: tenantA.org.id,
          authorId: tenantB.user.id,
          body: 'Cross-tenant author attempt',
        }),
      ).rejects.toThrow('Task actor is not a member of this organization')

      const comments = await listTaskComments(db, task.id, tenantA.org.id)
      expect(comments).toEqual([])
    })

    it('rolls back the comment when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Rollback comment test',
        createdBy: user.id,
      })

      await expect(
        addComment(withFailingAuditWrites(db), {
          taskId: task.id,
          tenantId: org.id,
          authorId: user.id,
          body: 'This should roll back.',
        }),
      ).rejects.toThrow('simulated audit write failure')

      const rows = await db
        .select()
        .from(taskComments)
        .where(
          and(eq(taskComments.taskId, task.id), eq(taskComments.body, 'This should roll back.')),
        )

      expect(rows).toEqual([])
    })
  })

  describe('createAttachment', () => {
    it('inserts an attachment and returns it', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Attachment test task',
        createdBy: user.id,
      })

      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/document.pdf`,
        contentType: 'application/pdf',
        sizeBytes: 102400,
        uploadedBy: user.id,
      })

      expect(attachment.id).toBeTruthy()
      expect(attachment.s3Key).toBe(`attachments/${org.id}/${task.id}/document.pdf`)
      expect(attachment.avStatus).toBe('pending')
    })

    it('can explicitly skip malware scanning for mock attachments', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Mock attachment test task',
        createdBy: user.id,
      })

      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/mock-document.pdf`,
        contentType: 'application/pdf',
        sizeBytes: 102400,
        uploadedBy: user.id,
        avStatus: 'skipped',
      })

      expect(attachment.avStatus).toBe('skipped')
    })

    it('writes a task.attachment.upload audit event', async () => {
      const { db } = requireTestDB()
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
        s3Key: `attachments/${org.id}/${task.id}/report.pdf`,
        contentType: 'application/pdf',
        sizeBytes: 204800,
        uploadedBy: user.id,
      })

      const events = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.resourceId, attachment.id))

      const uploadEvent = events.find((event) => event.action === 'task.attachment.uploaded')
      expect(uploadEvent).toBeTruthy()
      expect(JSON.stringify(uploadEvent?.after)).not.toContain('evidence.pdf')
    })

    it('returns the existing attachment when the same storage key is completed twice', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Attachment idempotency test',
        createdBy: user.id,
      })

      const s3Key = `attachments/${org.id}/${task.id}/report.pdf`
      const first = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key,
        contentType: 'application/pdf',
        sizeBytes: 204800,
        uploadedBy: user.id,
      })

      const second = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key,
        contentType: 'application/pdf',
        sizeBytes: 204800,
        uploadedBy: user.id,
      })

      expect(second.id).toBe(first.id)

      const events = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.action, 'task.attachment.uploaded'))

      const uploadEventsForAttachment = events.filter((event) => event.resourceId === first.id)
      expect(uploadEventsForAttachment).toHaveLength(1)
    })

    it('throws when taskId belongs to a different tenant (cross-tenant block)', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      // Task created under tenantA
      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'TenantA private task',
        createdBy: tenantA.user.id,
      })

      // TenantB attempts to attach a file to tenantA's task - must throw
      await expect(
        createAttachment(db, {
          taskId: task.id,
          tenantId: tenantB.org.id,
          s3Key: `attachments/${tenantB.org.id}/${task.id}/doc.pdf`,
          contentType: 'application/pdf',
          sizeBytes: 1024,
          uploadedBy: tenantB.user.id,
        }),
      ).rejects.toThrow('Task not found or tenant mismatch')
    })

    it('throws when the uploader is not a member of the task tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Foreign uploader task',
        createdBy: tenantA.user.id,
      })

      await expect(
        createAttachment(db, {
          taskId: task.id,
          tenantId: tenantA.org.id,
          s3Key: `attachments/${tenantA.org.id}/${task.id}/foreign.txt`,
          contentType: 'text/plain',
          sizeBytes: 42,
          uploadedBy: tenantB.user.id,
        }),
      ).rejects.toThrow('Task actor is not a member of this organization')

      const attachments = await listTaskAttachments(db, task.id, tenantA.org.id)
      expect(attachments).toEqual([])
    })

    it('rejects attachment keys outside the task storage prefix', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Invalid attachment key task',
        createdBy: user.id,
      })

      await expect(
        createAttachment(db, {
          taskId: task.id,
          tenantId: org.id,
          s3Key: `attachments/${org.id}/other-task/evidence.txt`,
          contentType: 'text/plain',
          sizeBytes: 128,
          uploadedBy: user.id,
        }),
      ).rejects.toThrow('Invalid task attachment key')

      const attachments = await listTaskAttachments(db, task.id, org.id)
      expect(attachments).toEqual([])
    })

    it('rolls back the attachment when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Rollback attachment test',
        createdBy: user.id,
      })
      const s3Key = `attachments/${org.id}/${task.id}/rollback.txt`

      await expect(
        createAttachment(withFailingAuditWrites(db), {
          taskId: task.id,
          tenantId: org.id,
          s3Key,
          contentType: 'text/plain',
          sizeBytes: 42,
          uploadedBy: user.id,
        }),
      ).rejects.toThrow('simulated audit write failure')

      const rows = await db
        .select()
        .from(taskAttachments)
        .where(and(eq(taskAttachments.taskId, task.id), eq(taskAttachments.s3Key, s3Key)))

      expect(rows).toEqual([])
    })
  })

  describe('deleteTaskAttachment', () => {
    it('removes a pending attachment scoped to the tenant', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Delete pending attachment',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/pending.txt`,
        contentType: 'text/plain',
        sizeBytes: 1024,
        uploadedBy: user.id,
      })

      await deleteTaskAttachment(db, {
        attachmentId: attachment.id,
        tenantId: org.id,
        actorId: user.id,
      })

      await expect(
        getTaskAttachment(db, {
          taskId: task.id,
          attachmentId: attachment.id,
          tenantId: org.id,
        }),
      ).resolves.toBeNull()
    })

    it('does not delete another tenant attachment with the same id input', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()
      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Cross-tenant delete guard',
        createdBy: tenantA.user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: tenantA.org.id,
        s3Key: `attachments/${tenantA.org.id}/${task.id}/pending.txt`,
        contentType: 'text/plain',
        sizeBytes: 1024,
        uploadedBy: tenantA.user.id,
      })

      await deleteTaskAttachment(db, {
        attachmentId: attachment.id,
        tenantId: tenantB.org.id,
        actorId: tenantB.user.id,
      })

      await expect(
        getTaskAttachment(db, {
          taskId: task.id,
          attachmentId: attachment.id,
          tenantId: tenantA.org.id,
        }),
      ).resolves.toMatchObject({ id: attachment.id })
    })

    it('writes a task.attachment.deleted audit event without exposing the storage key', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Delete attachment audit event',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/patient-name.txt`,
        contentType: 'text/plain',
        sizeBytes: 1024,
        uploadedBy: user.id,
      })

      await deleteTaskAttachment(db, {
        attachmentId: attachment.id,
        tenantId: org.id,
        actorId: user.id,
      })

      const events = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.resourceId, attachment.id))
      const deleteEvent = events.find((event) => event.action === 'task.attachment.deleted')

      expect(deleteEvent).toBeTruthy()
      expect(deleteEvent?.actorId).toBe(user.id)
      expect(JSON.stringify(deleteEvent?.before)).not.toContain('patient-name.txt')
      expect(deleteEvent?.after).toEqual({ taskId: task.id })
    })

    it('rolls back attachment deletion when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Delete attachment rollback',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/delete-rollback.txt`,
        contentType: 'text/plain',
        sizeBytes: 1024,
        uploadedBy: user.id,
      })

      await expect(
        deleteTaskAttachment(withFailingAuditWrites(db), {
          attachmentId: attachment.id,
          tenantId: org.id,
          actorId: user.id,
        }),
      ).rejects.toThrow('simulated audit write failure')

      await expect(
        getTaskAttachment(db, {
          taskId: task.id,
          attachmentId: attachment.id,
          tenantId: org.id,
        }),
      ).resolves.toMatchObject({ id: attachment.id })
    })
  })

  describe('updateTaskAttachmentScanResult', () => {
    it('marks an attachment clean by tenant and storage key without exposing filenames in audit metadata', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Attachment scan task',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/patient-name.txt`,
        contentType: 'text/plain',
        sizeBytes: 42,
        uploadedBy: user.id,
      })

      const updated = await updateTaskAttachmentScanResult(db, {
        tenantId: org.id,
        s3Key: attachment.s3Key,
        avStatus: 'clean',
      })

      expect(updated?.avStatus).toBe('clean')

      const events = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.resourceId, attachment.id))
      const scanEvent = events.find((event) => event.action === 'task.attachment.scan_completed')

      expect(scanEvent).toBeTruthy()
      expect(JSON.stringify(scanEvent?.after)).not.toContain('patient-name.txt')
    })

    it('does not update cross-tenant attachments with the same storage key', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const { org: otherOrg } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Tenant scoped scan task',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/evidence.txt`,
        contentType: 'text/plain',
        sizeBytes: 42,
        uploadedBy: user.id,
      })

      const updated = await updateTaskAttachmentScanResult(db, {
        tenantId: otherOrg.id,
        s3Key: attachment.s3Key,
        avStatus: 'infected',
      })

      expect(updated).toBeNull()
    })

    it('does not overwrite terminal scan results', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Terminal scan task',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/evidence.txt`,
        contentType: 'text/plain',
        sizeBytes: 42,
        uploadedBy: user.id,
      })

      await updateTaskAttachmentScanResult(db, {
        tenantId: org.id,
        s3Key: attachment.s3Key,
        avStatus: 'infected',
      })

      const replayed = await updateTaskAttachmentScanResult(db, {
        tenantId: org.id,
        s3Key: attachment.s3Key,
        avStatus: 'clean',
      })

      expect(replayed).toBeNull()

      const current = await getTaskAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        attachmentId: attachment.id,
      })
      expect(current?.avStatus).toBe('infected')
    })

    it('treats duplicate terminal scan callbacks as idempotent', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Duplicate scan callback task',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/evidence.txt`,
        contentType: 'text/plain',
        sizeBytes: 42,
        uploadedBy: user.id,
      })

      await updateTaskAttachmentScanResult(db, {
        tenantId: org.id,
        s3Key: attachment.s3Key,
        avStatus: 'clean',
      })

      const replayed = await updateTaskAttachmentScanResult(db, {
        tenantId: org.id,
        s3Key: attachment.s3Key,
        avStatus: 'clean',
      })

      expect(replayed).toMatchObject({
        id: attachment.id,
        avStatus: 'clean',
      })
    })

    it('rolls back the scan status update when audit writing fails', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Rollback scan status task',
        createdBy: user.id,
      })
      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/scan-rollback.txt`,
        contentType: 'text/plain',
        sizeBytes: 42,
        uploadedBy: user.id,
      })

      await expect(
        updateTaskAttachmentScanResult(withFailingAuditWrites(db), {
          tenantId: org.id,
          s3Key: attachment.s3Key,
          avStatus: 'clean',
        }),
      ).rejects.toThrow('simulated audit write failure')

      const current = await getTaskAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        attachmentId: attachment.id,
      })
      expect(current?.avStatus).toBe('pending')
    })
  })

  describe('listTaskAttachments', () => {
    it('returns persisted attachments for a task in the current tenant', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Attachment list task',
        createdBy: user.id,
      })

      const attachment = await createAttachment(db, {
        taskId: task.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${task.id}/evidence.txt`,
        contentType: 'text/plain',
        sizeBytes: 128,
        uploadedBy: user.id,
      })

      const result = await listTaskAttachments(db, task.id, org.id)

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe(attachment.id)
      expect(result[0]?.s3Key).toBe(`attachments/${org.id}/${task.id}/evidence.txt`)
    })

    it('does not return attachments from another tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Tenant A attachment task',
        createdBy: tenantA.user.id,
      })

      await createAttachment(db, {
        taskId: task.id,
        tenantId: tenantA.org.id,
        s3Key: `attachments/${tenantA.org.id}/${task.id}/evidence.txt`,
        contentType: 'text/plain',
        sizeBytes: 128,
        uploadedBy: tenantA.user.id,
      })

      const result = await listTaskAttachments(db, task.id, tenantB.org.id)

      expect(result).toEqual([])
    })
  })

  describe('getTaskAttachment', () => {
    it('returns only the attachment matching the task and tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      const taskA = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Tenant A attachment task',
        createdBy: tenantA.user.id,
      })
      const taskB = await createTask(db, {
        tenantId: tenantB.org.id,
        locationId: tenantB.location.id,
        title: 'Tenant B attachment task',
        createdBy: tenantB.user.id,
      })

      const attachmentA = await createAttachment(db, {
        taskId: taskA.id,
        tenantId: tenantA.org.id,
        s3Key: `attachments/${tenantA.org.id}/${taskA.id}/a.txt`,
        contentType: 'text/plain',
        sizeBytes: 1,
        uploadedBy: tenantA.user.id,
      })
      await createAttachment(db, {
        taskId: taskB.id,
        tenantId: tenantB.org.id,
        s3Key: `attachments/${tenantB.org.id}/${taskB.id}/b.txt`,
        contentType: 'text/plain',
        sizeBytes: 1,
        uploadedBy: tenantB.user.id,
      })

      await expect(
        getTaskAttachment(db, {
          taskId: taskA.id,
          attachmentId: attachmentA.id,
          tenantId: tenantB.org.id,
        }),
      ).resolves.toBeNull()
      await expect(
        getTaskAttachment(db, {
          taskId: taskA.id,
          attachmentId: attachmentA.id,
          tenantId: tenantA.org.id,
        }),
      ).resolves.toMatchObject({
        id: attachmentA.id,
        taskId: taskA.id,
        tenantId: tenantA.org.id,
      })
    })

    it('does not return an attachment from another task in the same tenant', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const taskA = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'First attachment task',
        createdBy: user.id,
      })
      const taskB = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Second attachment task',
        createdBy: user.id,
      })
      const attachmentB = await createAttachment(db, {
        taskId: taskB.id,
        tenantId: org.id,
        s3Key: `attachments/${org.id}/${taskB.id}/b.txt`,
        contentType: 'text/plain',
        sizeBytes: 1,
        uploadedBy: user.id,
      })

      await expect(
        getTaskAttachment(db, {
          taskId: taskA.id,
          attachmentId: attachmentB.id,
          tenantId: org.id,
        }),
      ).resolves.toBeNull()
    })
  })

  describe('listTasks', () => {
    it('returns tasks for a tenant', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Task A',
        createdBy: user.id,
      })
      await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Task B',
        createdBy: user.id,
      })

      const result = await listTasks(db, {
        tenantId: org.id,
        locationIds: [location.id],
      })
      const titles = result.tasks.map((t) => t.title)
      expect(titles).toContain('Task A')
      expect(titles).toContain('Task B')
    })

    it('filters by status', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const taskA = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Open task',
        createdBy: user.id,
      })
      const taskB = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Done task',
        createdBy: user.id,
      })

      await updateTaskStatus(db, {
        taskId: taskB.id,
        tenantId: org.id,
        actorId: user.id,
        status: 'done',
      })

      const openTasks = await listTasks(db, {
        tenantId: org.id,
        locationIds: [location.id],
        status: 'open',
      })
      const openIds = openTasks.tasks.map((t) => t.id)
      expect(openIds).toContain(taskA.id)
      expect(openIds).not.toContain(taskB.id)
    })

    it('enforces tenant isolation - never returns cross-tenant tasks', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Tenant A private task',
        createdBy: tenantA.user.id,
      })

      await createTask(db, {
        tenantId: tenantB.org.id,
        locationId: tenantB.location.id,
        title: 'Tenant B private task',
        createdBy: tenantB.user.id,
      })

      const tenantATasks = await listTasks(db, {
        tenantId: tenantA.org.id,
        locationIds: [tenantA.location.id],
      })
      const tenantBTasks = await listTasks(db, {
        tenantId: tenantB.org.id,
        locationIds: [tenantB.location.id],
      })

      const tenantAIds = tenantATasks.tasks.map((t) => t.tenantId)
      const tenantBIds = tenantBTasks.tasks.map((t) => t.tenantId)

      // All results scoped to their respective tenant
      expect(tenantAIds.every((id) => id === tenantA.org.id)).toBe(true)
      expect(tenantBIds.every((id) => id === tenantB.org.id)).toBe(true)

      // Tasks don't bleed across tenants
      const tenantATaskIds = tenantATasks.tasks.map((t) => t.id)
      const tenantBTaskIds = tenantBTasks.tasks.map((t) => t.id)
      const overlap = tenantATaskIds.filter((id) => tenantBTaskIds.includes(id))
      expect(overlap).toHaveLength(0)
    })

    it('filters by assigneeId', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)

      const assignedTask = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Assigned task',
        createdBy: user.id,
      })
      await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Unassigned task',
        createdBy: user.id,
      })

      await assignTask(db, {
        taskId: assignedTask.id,
        tenantId: org.id,
        userId: assignee.id,
        assignedBy: user.id,
      })

      const result = await listTasks(db, {
        tenantId: org.id,
        locationIds: [location.id],
        assigneeId: assignee.id,
      })
      const ids = result.tasks.map((t) => t.id)
      expect(ids).toContain(assignedTask.id)
      expect(ids.length).toBe(1)
    })

    it('returns no tasks when the caller has no readable locations', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Hidden task',
        createdBy: user.id,
      })

      const result = await listTasks(db, { tenantId: org.id, locationIds: [] })

      expect(result).toEqual({ tasks: [], total: 0 })
    })
  })

  describe('getTask', () => {
    it('returns the task when it exists in the tenant', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Fetch me',
        createdBy: user.id,
      })

      const fetched = await getTask(db, task.id, org.id, [location.id])
      expect(fetched).not.toBeNull()
      expect(fetched?.id).toBe(task.id)
    })

    it('returns null when taskId belongs to a different tenant', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Tenant A task',
        createdBy: tenantA.user.id,
      })

      // Tenant B tries to access Tenant A's task
      const result = await getTask(db, task.id, tenantB.org.id, [tenantB.location.id])
      expect(result).toBeNull()
    })

    it('returns null when task is outside the caller location scope', async () => {
      const { db } = requireTestDB()
      const tenant = await seedTenant()
      const [secondaryLocation] = await db
        .insert(locations)
        .values({
          organizationId: tenant.org.id,
          name: 'Secondary site',
          slug: 'secondary-site',
        })
        .returning()

      const task = await createTask(db, {
        tenantId: tenant.org.id,
        locationId: secondaryLocation.id,
        title: 'Secondary location task',
        createdBy: tenant.user.id,
      })

      const result = await getTask(db, task.id, tenant.org.id, [tenant.location.id])
      expect(result).toBeNull()
    })

    it('returns null when the caller has no readable locations', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'No-access task',
        createdBy: user.id,
      })

      const result = await getTask(db, task.id, org.id, [])

      expect(result).toBeNull()
    })
  })

  describe('bulk mutations location scoping', () => {
    it('bulkUpdateTaskStatus only mutates tasks within the writable location set', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const [otherLocation] = await db
        .insert(locations)
        .values({
          organizationId: org.id,
          name: 'Other site',
          slug: 'other-site',
        })
        .returning()

      const inScope = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'In-scope task',
        createdBy: user.id,
      })
      const outOfScope = await createTask(db, {
        tenantId: org.id,
        locationId: otherLocation.id,
        title: 'Out-of-scope task',
        createdBy: user.id,
      })

      const result = await bulkUpdateTaskStatus(db, {
        taskIds: [inScope.id, outOfScope.id],
        tenantId: org.id,
        actorId: user.id,
        status: 'done',
        locationIds: [location.id],
      })

      expect(result.updated).toBe(1)

      const [refreshedInScope] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, inScope.id))
        .limit(1)
      const [refreshedOutOfScope] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, outOfScope.id))
        .limit(1)

      expect(refreshedInScope?.status).toBe('done')
      expect(refreshedOutOfScope?.status).toBe('open')
    })

    it('bulkAssignTask only assigns tasks within the writable location set', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)
      const [otherLocation] = await db
        .insert(locations)
        .values({
          organizationId: org.id,
          name: 'Other site',
          slug: 'other-site',
        })
        .returning()

      const inScope = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'In-scope assignable',
        createdBy: user.id,
      })
      const outOfScope = await createTask(db, {
        tenantId: org.id,
        locationId: otherLocation.id,
        title: 'Out-of-scope assignable',
        createdBy: user.id,
      })

      const result = await bulkAssignTask(db, {
        taskIds: [inScope.id, outOfScope.id],
        tenantId: org.id,
        actorId: user.id,
        userId: assignee.id,
        locationIds: [location.id],
      })

      expect(result.updated).toBe(1)

      const assignments = await db
        .select()
        .from(taskAssignments)
        .where(eq(taskAssignments.userId, assignee.id))

      const assignedTaskIds = assignments.map((a) => a.taskId)
      expect(assignedTaskIds).toContain(inScope.id)
      expect(assignedTaskIds).not.toContain(outOfScope.id)
    })

    it('bulkAssignTask does not count or audit assignments that already exist', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()
      const assignee = await seedMember(org.id)

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'Duplicate bulk assignment',
        createdBy: user.id,
      })

      await bulkAssignTask(db, {
        taskIds: [task.id],
        tenantId: org.id,
        actorId: user.id,
        userId: assignee.id,
        locationIds: [location.id],
      })

      const result = await bulkAssignTask(db, {
        taskIds: [task.id],
        tenantId: org.id,
        actorId: user.id,
        userId: assignee.id,
        locationIds: [location.id],
      })

      expect(result.updated).toBe(0)

      const events = await db.select().from(auditEvents).where(eq(auditEvents.resourceId, task.id))
      const assignEvents = events.filter((event) => event.action === 'task.assigned')
      expect(assignEvents).toHaveLength(1)
    })

    it('bulkAssignTask rejects assignees outside the task tenant before assigning any tasks', async () => {
      const { db } = requireTestDB()
      const tenantA = await seedTenant()
      const tenantB = await seedTenant()
      const assignee = await seedMember(tenantB.org.id)

      const task = await createTask(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Cross-tenant bulk assignment',
        createdBy: tenantA.user.id,
      })

      await expect(
        bulkAssignTask(db, {
          taskIds: [task.id],
          tenantId: tenantA.org.id,
          actorId: tenantA.user.id,
          userId: assignee.id,
          locationIds: [tenantA.location.id],
        }),
      ).rejects.toThrow('Assignee is not a member of this organization')

      const assignments = await db
        .select()
        .from(taskAssignments)
        .where(and(eq(taskAssignments.taskId, task.id), eq(taskAssignments.userId, assignee.id)))

      expect(assignments).toEqual([])
    })

    it('returns updated: 0 when the writable location set is empty', async () => {
      const { db } = requireTestDB()
      const { org, user, location } = await seedTenant()

      const task = await createTask(db, {
        tenantId: org.id,
        locationId: location.id,
        title: 'No writable locations',
        createdBy: user.id,
      })

      const statusResult = await bulkUpdateTaskStatus(db, {
        taskIds: [task.id],
        tenantId: org.id,
        actorId: user.id,
        status: 'done',
        locationIds: [],
      })
      expect(statusResult.updated).toBe(0)

      const assignee = await seedMember(org.id)
      const assignResult = await bulkAssignTask(db, {
        taskIds: [task.id],
        tenantId: org.id,
        actorId: user.id,
        userId: assignee.id,
        locationIds: [],
      })
      expect(assignResult.updated).toBe(0)

      const [refreshed] = await db.select().from(tasks).where(eq(tasks.id, task.id)).limit(1)
      expect(refreshed?.status).toBe('open')
    })
  })
})
