import { eq, and, inArray, asc, desc, isNull, sql } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import type { DB } from '../client.js'
import { locations } from '../schema/locations.js'
import { memberships } from '../schema/memberships.js'
import { tasks } from '../schema/tasks.phi.js'
import { taskAssignments } from '../schema/task-assignments.phi.js'
import { taskComments } from '../schema/task-comments.phi.js'
import { taskAttachments } from '../schema/task-attachments.phi.js'
import type { Task } from '../schema/tasks.phi.js'
import type { TaskComment } from '../schema/task-comments.phi.js'
import type { TaskAttachment } from '../schema/task-attachments.phi.js'

export type { Task, TaskComment, TaskAttachment }

function auditedTaskMutation<T>(db: DB, callback: (tx: DB) => Promise<T>): Promise<T> {
  return db.transaction((tx) => callback(tx as unknown as DB))
}

async function assertTaskLocationBelongsToTenant(
  db: DB,
  input: { locationId: string; tenantId: string },
) {
  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.id, input.locationId), eq(locations.organizationId, input.tenantId)))
    .limit(1)

  if (!location) {
    throw new Error('Task location not found')
  }
}

async function hasTenantMembership(
  db: DB,
  input: { userId: string; tenantId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.userId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  return Boolean(membership)
}

async function assertTaskActorBelongsToTenant(
  db: DB,
  input: { actorId: string; tenantId: string },
) {
  const hasMembership = await hasTenantMembership(db, {
    userId: input.actorId,
    tenantId: input.tenantId,
  })

  if (!hasMembership) {
    throw new Error('Task actor is not a member of this organization')
  }
}

function assertTaskAttachmentKey(input: { tenantId: string; taskId: string; s3Key: string }) {
  const expectedPrefix = `attachments/${input.tenantId}/${input.taskId}/`
  if (!input.s3Key.startsWith(expectedPrefix) || input.s3Key.length === expectedPrefix.length) {
    throw new Error('Invalid task attachment key')
  }
}

async function assertTaskAssigneeBelongsToTenant(
  db: DB,
  input: { userId: string; tenantId: string },
) {
  const hasMembership = await hasTenantMembership(db, input)

  if (!hasMembership) {
    throw new Error('Assignee is not a member of this organization')
  }
}

export async function createTask(
  db: DB,
  input: {
    tenantId: string
    locationId: string
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    dueAt?: Date
    createdBy: string
  },
): Promise<Task> {
  return auditedTaskMutation(db, async (tx) => {
    await assertTaskLocationBelongsToTenant(tx, {
      locationId: input.locationId,
      tenantId: input.tenantId,
    })
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.createdBy,
      tenantId: input.tenantId,
    })

    const [task] = await tx
      .insert(tasks)
      .values({
        tenantId: input.tenantId,
        locationId: input.locationId,
        title: input.title,
        description: input.description,
        priority: input.priority ?? 'medium',
        dueAt: input.dueAt,
        createdBy: input.createdBy,
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.createdBy,
      action: 'task.created',
      resourceType: 'task',
      resourceId: task.id,
      after: { status: task.status, priority: task.priority },
    })

    return task
  })
}

export async function updateTaskStatus(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    actorId: string
    status: 'open' | 'in_progress' | 'blocked' | 'done'
  },
): Promise<Task> {
  return auditedTaskMutation(db, async (tx) => {
    const [before] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!before) {
      throw new Error(
        `Task ${input.taskId} not found or access denied for tenant ${input.tenantId}`,
      )
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.actorId,
      tenantId: input.tenantId,
    })

    const [updated] = await tx
      .update(tasks)
      .set({ status: input.status })
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error(
        `Task ${input.taskId} not found or access denied for tenant ${input.tenantId}`,
      )
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'task.status_updated',
      resourceType: 'task',
      resourceId: input.taskId,
      before: { status: before.status },
      after: { status: input.status },
    })

    return updated
  })
}

export async function updateTaskDueAt(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    actorId: string
    dueAt: Date | null
  },
): Promise<Task> {
  return auditedTaskMutation(db, async (tx) => {
    const [before] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!before) {
      throw new Error(
        `Task ${input.taskId} not found or access denied for tenant ${input.tenantId}`,
      )
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.actorId,
      tenantId: input.tenantId,
    })

    const [updated] = await tx
      .update(tasks)
      .set({ dueAt: input.dueAt })
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error(
        `Task ${input.taskId} not found or access denied for tenant ${input.tenantId}`,
      )
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'task.due_date_updated',
      resourceType: 'task',
      resourceId: input.taskId,
      before: { dueAt: before.dueAt?.toISOString() ?? null },
      after: { dueAt: input.dueAt?.toISOString() ?? null },
    })

    return updated
  })
}

export async function assignTask(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    userId: string
    assignedBy: string
  },
): Promise<void> {
  await auditedTaskMutation(db, async (tx) => {
    const [existingTask] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!existingTask) {
      throw new Error('Task not found or tenant mismatch')
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.assignedBy,
      tenantId: input.tenantId,
    })

    await assertTaskAssigneeBelongsToTenant(tx, {
      userId: input.userId,
      tenantId: input.tenantId,
    })

    const insertedAssignments = await tx
      .insert(taskAssignments)
      .values({
        taskId: input.taskId,
        tenantId: input.tenantId,
        userId: input.userId,
        assignedBy: input.assignedBy,
      })
      .onConflictDoNothing()
      .returning({ taskId: taskAssignments.taskId })

    if (insertedAssignments.length === 0) {
      return
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.assignedBy,
      action: 'task.assigned',
      resourceType: 'task',
      resourceId: input.taskId,
      after: { userId: input.userId },
    })
  })
}

export async function listTaskComments(
  db: DB,
  taskId: string,
  tenantId: string,
): Promise<TaskComment[]> {
  return db
    .select()
    .from(taskComments)
    .where(and(eq(taskComments.taskId, taskId), eq(taskComments.tenantId, tenantId)))
    .orderBy(taskComments.createdAt)
}

export async function addComment(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    authorId: string
    body: string
  },
): Promise<TaskComment> {
  return auditedTaskMutation(db, async (tx) => {
    const [existingTask] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!existingTask) {
      throw new Error('Task not found or tenant mismatch')
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.authorId,
      tenantId: input.tenantId,
    })

    const [comment] = await tx
      .insert(taskComments)
      .values({
        taskId: input.taskId,
        tenantId: input.tenantId,
        authorId: input.authorId,
        body: input.body,
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.authorId,
      action: 'task.comment.added',
      resourceType: 'task_comment',
      resourceId: comment.id,
      after: { taskId: input.taskId },
    })

    return comment
  })
}

export async function createAttachment(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    s3Key: string
    contentType: string
    sizeBytes: number
    uploadedBy: string
    avStatus?: TaskAttachment['avStatus']
  },
): Promise<TaskAttachment> {
  return auditedTaskMutation(db, async (tx) => {
    const [existingTask] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!existingTask) {
      throw new Error('Task not found or tenant mismatch')
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.uploadedBy,
      tenantId: input.tenantId,
    })
    assertTaskAttachmentKey({
      tenantId: input.tenantId,
      taskId: input.taskId,
      s3Key: input.s3Key,
    })

    const [existingAttachment] = await tx
      .select()
      .from(taskAttachments)
      .where(
        and(
          eq(taskAttachments.taskId, input.taskId),
          eq(taskAttachments.tenantId, input.tenantId),
          eq(taskAttachments.s3Key, input.s3Key),
        ),
      )
      .limit(1)

    if (existingAttachment) {
      return existingAttachment
    }

    const [attachment] = await tx
      .insert(taskAttachments)
      .values({
        taskId: input.taskId,
        tenantId: input.tenantId,
        s3Key: input.s3Key,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        uploadedBy: input.uploadedBy,
        avStatus: input.avStatus ?? 'pending',
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.uploadedBy,
      action: 'task.attachment.uploaded',
      resourceType: 'task_attachment',
      resourceId: attachment.id,
      after: {
        taskId: input.taskId,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
      },
    })

    return attachment
  })
}

export async function deleteTaskAttachment(
  db: DB,
  input: {
    attachmentId: string
    tenantId: string
    actorId?: string
  },
): Promise<void> {
  await auditedTaskMutation(db, async (tx) => {
    const [attachment] = await tx
      .delete(taskAttachments)
      .where(
        and(
          eq(taskAttachments.id, input.attachmentId),
          eq(taskAttachments.tenantId, input.tenantId),
        ),
      )
      .returning()

    if (!attachment) {
      return
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'task.attachment.deleted',
      resourceType: 'task_attachment',
      resourceId: attachment.id,
      before: {
        contentType: attachment.contentType,
        sizeBytes: attachment.sizeBytes,
        avStatus: attachment.avStatus,
      },
      after: {
        taskId: attachment.taskId,
      },
    })
  })
}

export async function listTaskAttachments(
  db: DB,
  taskId: string,
  tenantId: string,
): Promise<TaskAttachment[]> {
  return db
    .select()
    .from(taskAttachments)
    .where(and(eq(taskAttachments.taskId, taskId), eq(taskAttachments.tenantId, tenantId)))
    .orderBy(asc(taskAttachments.uploadedAt), asc(taskAttachments.id))
}

export async function getTaskAttachment(
  db: DB,
  input: {
    taskId: string
    attachmentId: string
    tenantId: string
  },
): Promise<TaskAttachment | null> {
  const [attachment] = await db
    .select()
    .from(taskAttachments)
    .where(
      and(
        eq(taskAttachments.id, input.attachmentId),
        eq(taskAttachments.taskId, input.taskId),
        eq(taskAttachments.tenantId, input.tenantId),
      ),
    )
    .limit(1)

  return attachment ?? null
}

export async function updateTaskAttachmentScanResult(
  db: DB,
  input: {
    tenantId: string
    s3Key: string
    avStatus: Extract<TaskAttachment['avStatus'], 'clean' | 'infected'>
  },
): Promise<TaskAttachment | null> {
  return auditedTaskMutation(db, async (tx) => {
    const [attachment] = await tx
      .update(taskAttachments)
      .set({ avStatus: input.avStatus })
      .where(
        and(
          eq(taskAttachments.tenantId, input.tenantId),
          eq(taskAttachments.s3Key, input.s3Key),
          eq(taskAttachments.avStatus, 'pending'),
        ),
      )
      .returning()

    if (!attachment) {
      const [existing] = await tx
        .select()
        .from(taskAttachments)
        .where(
          and(
            eq(taskAttachments.tenantId, input.tenantId),
            eq(taskAttachments.s3Key, input.s3Key),
            eq(taskAttachments.avStatus, input.avStatus),
          ),
        )
        .limit(1)

      return existing ?? null
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: 'attachment-scan',
      action: 'task.attachment.scan_completed',
      resourceType: 'task_attachment',
      resourceId: attachment.id,
      after: {
        taskId: attachment.taskId,
        avStatus: input.avStatus,
      },
    })

    return attachment
  })
}

export type TaskSortField = 'default' | 'dueAt' | 'priority' | 'createdAt' | 'title'
export type TaskSortDir = 'asc' | 'desc'

const PRIORITY_ORDER = sql`CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END`
const IS_NOT_DONE = sql`CASE WHEN status != 'done' THEN 0 ELSE 1 END`
const IS_OVERDUE = sql`CASE WHEN due_at IS NOT NULL AND due_at < NOW() AND status != 'done' THEN 0 ELSE 1 END`

export async function listTasks(
  db: DB,
  filters: {
    tenantId: string
    locationIds?: string[]
    status?: string
    assigneeId?: string
    includeArchived?: boolean
    sort?: TaskSortField
    sortDir?: TaskSortDir
    page?: number
    pageSize?: number
  },
): Promise<{ tasks: Task[]; total: number }> {
  if (filters.locationIds && filters.locationIds.length === 0) {
    return { tasks: [], total: 0 }
  }

  const baseConditions = [eq(tasks.tenantId, filters.tenantId)]

  if (!filters.includeArchived) {
    baseConditions.push(isNull(tasks.archivedAt))
  }

  if (filters.locationIds?.length) {
    baseConditions.push(inArray(tasks.locationId, filters.locationIds))
  }

  if (filters.status) {
    baseConditions.push(
      eq(tasks.status, filters.status as 'open' | 'in_progress' | 'blocked' | 'done'),
    )
  }

  if (filters.assigneeId) {
    const assignments = await db
      .select({ taskId: taskAssignments.taskId })
      .from(taskAssignments)
      .where(
        and(
          eq(taskAssignments.userId, filters.assigneeId),
          eq(taskAssignments.tenantId, filters.tenantId),
        ),
      )
    const taskIds = assignments.map((a) => a.taskId)
    if (taskIds.length === 0) return { tasks: [], total: 0 }
    baseConditions.push(inArray(tasks.id, taskIds))
  }

  const where = and(...baseConditions)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(where)

  const total = count ?? 0

  const sort = filters.sort ?? 'default'
  const dir = filters.sortDir ?? 'asc'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any[]
  if (sort === 'dueAt') {
    orderBy =
      dir === 'asc'
        ? [asc(tasks.dueAt), asc(tasks.createdAt)]
        : [desc(tasks.dueAt), desc(tasks.createdAt)]
  } else if (sort === 'priority') {
    orderBy =
      dir === 'asc'
        ? [asc(PRIORITY_ORDER), asc(tasks.dueAt)]
        : [desc(PRIORITY_ORDER), desc(tasks.dueAt)]
  } else if (sort === 'createdAt') {
    orderBy = dir === 'asc' ? [asc(tasks.createdAt)] : [desc(tasks.createdAt)]
  } else if (sort === 'title') {
    orderBy = dir === 'asc' ? [asc(tasks.title)] : [desc(tasks.title)]
  } else {
    orderBy = [asc(IS_NOT_DONE), asc(IS_OVERDUE), asc(PRIORITY_ORDER), asc(tasks.dueAt)]
  }

  const pageSize = filters.pageSize ?? 50
  const page = filters.page ?? 1
  const offset = (page - 1) * pageSize

  const rows = await db
    .select()
    .from(tasks)
    .where(where)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset(offset)

  return { tasks: rows, total }
}

export async function updateTask(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    actorId: string
    title?: string
    description?: string | null
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  },
): Promise<Task> {
  return auditedTaskMutation(db, async (tx) => {
    const [before] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!before) {
      throw new Error(`Task ${input.taskId} not found`)
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.actorId,
      tenantId: input.tenantId,
    })

    const patch: Partial<typeof tasks.$inferInsert> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.description !== undefined) patch.description = input.description
    if (input.priority !== undefined) patch.priority = input.priority

    if (Object.keys(patch).length === 0) {
      throw new Error('At least one task field must be provided')
    }

    const [updated] = await tx
      .update(tasks)
      .set(patch)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error(`Task ${input.taskId} not found`)
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'task.updated',
      resourceType: 'task',
      resourceId: input.taskId,
      before: {
        titleChanged: input.title !== undefined && input.title !== before.title,
        descriptionChanged:
          input.description !== undefined &&
          (input.description ?? null) !== (before.description ?? null),
        priority: before.priority,
      },
      after: {
        titleChanged: input.title !== undefined && updated.title !== before.title,
        descriptionChanged:
          input.description !== undefined &&
          (updated.description ?? null) !== (before.description ?? null),
        priority: updated.priority,
      },
    })

    return updated
  })
}

export async function archiveTask(
  db: DB,
  input: {
    taskId: string
    tenantId: string
    actorId: string
  },
): Promise<Task> {
  return auditedTaskMutation(db, async (tx) => {
    const [before] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .limit(1)

    if (!before) {
      throw new Error(`Task ${input.taskId} not found`)
    }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.actorId,
      tenantId: input.tenantId,
    })

    const [updated] = await tx
      .update(tasks)
      .set({ archivedAt: new Date() })
      .where(and(eq(tasks.id, input.taskId), eq(tasks.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error(`Task ${input.taskId} not found`)
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'task.archived',
      resourceType: 'task',
      resourceId: input.taskId,
      before: { archivedAt: null },
      after: { archivedAt: updated.archivedAt?.toISOString() ?? null },
    })

    return updated
  })
}

export async function bulkUpdateTaskStatus(
  db: DB,
  input: {
    taskIds: string[]
    tenantId: string
    actorId: string
    status: 'open' | 'in_progress' | 'blocked' | 'done'
    locationIds?: string[]
  },
): Promise<{ updated: number }> {
  if (input.taskIds.length === 0) return { updated: 0 }
  if (input.locationIds && input.locationIds.length === 0) return { updated: 0 }

  return auditedTaskMutation(db, async (tx) => {
    const conditions = [eq(tasks.tenantId, input.tenantId), inArray(tasks.id, input.taskIds)]
    if (input.locationIds?.length) {
      conditions.push(inArray(tasks.locationId, input.locationIds))
    }

    const existing = await tx
      .select({ id: tasks.id, status: tasks.status })
      .from(tasks)
      .where(and(...conditions))

    if (existing.length === 0) return { updated: 0 }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.actorId,
      tenantId: input.tenantId,
    })

    const existingIds = existing.map((t) => t.id)

    await tx
      .update(tasks)
      .set({ status: input.status })
      .where(and(eq(tasks.tenantId, input.tenantId), inArray(tasks.id, existingIds)))

    await Promise.all(
      existing.map((t) =>
        writeAuditEvent(tx, {
          tenantId: input.tenantId,
          actorId: input.actorId,
          action: 'task.status_updated',
          resourceType: 'task',
          resourceId: t.id,
          before: { status: t.status },
          after: { status: input.status },
        }),
      ),
    )

    return { updated: existing.length }
  })
}

export async function bulkAssignTask(
  db: DB,
  input: {
    taskIds: string[]
    tenantId: string
    actorId: string
    userId: string
    locationIds?: string[]
  },
): Promise<{ updated: number }> {
  if (input.taskIds.length === 0) return { updated: 0 }
  if (input.locationIds && input.locationIds.length === 0) return { updated: 0 }

  return auditedTaskMutation(db, async (tx) => {
    const conditions = [eq(tasks.tenantId, input.tenantId), inArray(tasks.id, input.taskIds)]
    if (input.locationIds?.length) {
      conditions.push(inArray(tasks.locationId, input.locationIds))
    }

    const existing = await tx
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(...conditions))

    const existingIds = existing.map((t) => t.id)
    if (existingIds.length === 0) return { updated: 0 }
    await assertTaskActorBelongsToTenant(tx, {
      actorId: input.actorId,
      tenantId: input.tenantId,
    })

    await assertTaskAssigneeBelongsToTenant(tx, {
      userId: input.userId,
      tenantId: input.tenantId,
    })

    const insertedAssignmentRows = await Promise.all(
      existingIds.map(async (taskId) => {
        const [insertedAssignment] = await tx
          .insert(taskAssignments)
          .values({
            taskId,
            tenantId: input.tenantId,
            userId: input.userId,
            assignedBy: input.actorId,
          })
          .onConflictDoNothing()
          .returning({ taskId: taskAssignments.taskId })

        if (!insertedAssignment) {
          return null
        }

        await writeAuditEvent(tx, {
          tenantId: input.tenantId,
          actorId: input.actorId,
          action: 'task.assigned',
          resourceType: 'task',
          resourceId: taskId,
          after: { userId: input.userId },
        })

        return insertedAssignment
      }),
    )

    return { updated: insertedAssignmentRows.filter(Boolean).length }
  })
}

export async function getTask(
  db: DB,
  taskId: string,
  tenantId: string,
  locationIds?: string[],
): Promise<Task | null> {
  if (locationIds && locationIds.length === 0) {
    return null
  }

  const conditions = [eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)]

  if (locationIds?.length) {
    conditions.push(inArray(tasks.locationId, locationIds))
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .limit(1)

  return task ?? null
}

export async function getTaskAssigneeId(
  db: DB,
  taskId: string,
  tenantId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ userId: taskAssignments.userId })
    .from(taskAssignments)
    .where(and(eq(taskAssignments.taskId, taskId), eq(taskAssignments.tenantId, tenantId)))
    .limit(1)

  return row?.userId ?? null
}
