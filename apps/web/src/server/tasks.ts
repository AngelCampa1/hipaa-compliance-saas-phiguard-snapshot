import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm'
import { auditEvents, logger } from '@phiguard/audit'
import {
  integrationConnections,
  integrationSyncRecords,
  locationGrants,
  memberships,
  tasks,
} from '@phiguard/db/server'
import {
  CalendarEventNotFoundError,
  deleteTaskCalendarEvent,
  syncTaskToCalendar,
  updateTaskCalendarEvent,
} from '@phiguard/integration/calendar-sync'
import { decryptToken, encryptToken } from '@phiguard/integration/token-crypto'
import { runInAuditContext } from '../lib/audit.server.js'
import { dispatchAttachmentScanRequest } from '../lib/attachment-scan.js'
import { getSessionFn } from '../lib/session.js'
import {
  ALLOWED_UPLOAD_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  assertUploadedObject,
  buildAttachmentKey,
  buildMockUploadUrl,
  generatePresignedDownloadUrl,
  generatePresignedUploadUrl,
  requireAttachmentsBucketName,
  isMockUploadsEnabled,
} from '../lib/s3.js'
import {
  assertCommercialProductAccess,
  canManageOrganization,
  canWriteLocations,
  getReadLocationIds,
  getWriteLocationId,
  resolveActiveLocationAccess,
} from './access.js'

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const ListTasksInput = z.object({
  status: z.enum(['open', 'in_progress', 'blocked', 'done']).optional(),
  assigneeId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  sort: z.enum(['default', 'dueAt', 'priority', 'createdAt', 'title']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(200).optional(),
  includeArchived: z.boolean().optional(),
})

const UpdateTaskInput = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
}).refine(
  (input) =>
    input.title !== undefined || input.description !== undefined || input.priority !== undefined,
  { message: 'At least one task field must be provided' },
)

const ArchiveTaskInput = z.object({
  taskId: z.string().uuid(),
})

const BulkUpdateStatusInput = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(['open', 'in_progress', 'blocked', 'done']),
})

const BulkAssignInput = z.object({
  taskIds: z.array(z.string().uuid()).min(1).max(100),
  userId: z.string().uuid(),
})

const GetTaskInput = z.object({
  taskId: z.string().uuid(),
})

const ListTaskCommentsInput = z.object({
  taskId: z.string().uuid(),
})

const CreateTaskInput = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueAt: z.string().datetime().optional(),
  locationId: z.string().uuid().optional(),
})

const UpdateStatusInput = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'blocked', 'done']),
})

const UpdateDueAtInput = z.object({
  taskId: z.string().uuid(),
  dueAt: z.string().datetime().nullable(),
})

const AddCommentInput = z.object({
  taskId: z.string().uuid(),
  body: z.string().min(1).max(10000),
})

const AssignTaskInput = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
})

const PresignUploadInput = z.object({
  taskId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  contentType: z.string().refine((t) => ALLOWED_UPLOAD_CONTENT_TYPES.has(t), {
    message: 'File type not allowed',
  }),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, { message: 'File exceeds 25 MB limit' }),
})

const CompleteUploadInput = z.object({
  taskId: z.string().uuid(),
  s3Key: z.string().min(1),
  contentType: z.string().refine((t) => ALLOWED_UPLOAD_CONTENT_TYPES.has(t), {
    message: 'File type not allowed',
  }),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, { message: 'File exceeds 25 MB limit' }),
})

const DownloadTaskAttachmentInput = z.object({
  taskId: z.string().uuid(),
  attachmentId: z.string().uuid(),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireSession() {
  const session = await getSessionFn()
  if (!session?.user?.id || !session?.session?.activeOrganizationId) {
    throw new Error('Unauthorized')
  }
  return session
}

async function loadTaskDatabase() {
  const [{ getDb }, taskDb] = await Promise.all([
    import('@phiguard/db/server'),
    import('@phiguard/db/tasks'),
  ])

  return {
    db: getDb(),
    ...taskDb,
  }
}

type ActiveCalendarConnection = {
  id: string
  provider: 'google' | 'microsoft'
  accessTokenCiphertext: string
  refreshTokenCiphertext: string
  kmsKeyId: string
  scopes: string[]
  expiresAt: Date | null
}

type CreatedCalendarSyncRecord = {
  connectionId: string
  providerEventId: string
}

function parseEncryptedToken(value: string) {
  return JSON.parse(value) as {
    ciphertext: string
    encryptedDataKey: string
    iv: string
  }
}

async function listActiveCalendarConnections(
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db'],
  organizationId: string,
): Promise<ActiveCalendarConnection[]> {
  return db
    .select({
      id: integrationConnections.id,
      provider: integrationConnections.provider,
      accessTokenCiphertext: integrationConnections.accessTokenCiphertext,
      refreshTokenCiphertext: integrationConnections.refreshTokenCiphertext,
      kmsKeyId: integrationConnections.kmsKeyId,
      scopes: integrationConnections.scopes,
      expiresAt: integrationConnections.expiresAt,
    })
    .from(integrationConnections)
    .where(
      and(
        eq(integrationConnections.organizationId, organizationId),
        eq(integrationConnections.status, 'active'),
      ),
    )
}

async function listCreatedCalendarSyncRecords(
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db'],
  organizationId: string,
  taskId: string,
): Promise<CreatedCalendarSyncRecord[]> {
  return db
    .select({
      connectionId: integrationSyncRecords.connectionId,
      providerEventId: integrationSyncRecords.providerEventId,
    })
    .from(integrationSyncRecords)
    .where(
      and(
        eq(integrationSyncRecords.organizationId, organizationId),
        eq(integrationSyncRecords.resourceType, 'task'),
        eq(integrationSyncRecords.resourceId, taskId),
        eq(integrationSyncRecords.status, 'created'),
      ),
    )
}

function calendarConnectionDependencies(
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db'],
  connection: ActiveCalendarConnection,
) {
  return {
    loadConnection: async () => ({
      provider: connection.provider,
      accessToken: await decryptToken(parseEncryptedToken(connection.accessTokenCiphertext)),
      refreshToken: await decryptToken(parseEncryptedToken(connection.refreshTokenCiphertext)),
      expiresAt: connection.expiresAt,
      scopes: connection.scopes,
    }),
    saveConnectionTokens: async (
      _connectionId: string,
      tokens: {
        accessToken: string
        refreshToken: string
        expiresAt: Date
        scopes: string[]
      },
    ) => {
      const [accessToken, refreshToken] = await Promise.all([
        encryptToken(tokens.accessToken, connection.kmsKeyId),
        encryptToken(tokens.refreshToken, connection.kmsKeyId),
      ])

      await db
        .update(integrationConnections)
        .set({
          accessTokenCiphertext: JSON.stringify(accessToken),
          refreshTokenCiphertext: JSON.stringify(refreshToken),
          scopes: tokens.scopes.length > 0 ? tokens.scopes : connection.scopes,
          expiresAt: tokens.expiresAt,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(integrationConnections.id, connection.id),
            eq(integrationConnections.status, 'active'),
            eq(integrationConnections.refreshTokenCiphertext, connection.refreshTokenCiphertext),
            connection.expiresAt
              ? eq(integrationConnections.expiresAt, connection.expiresAt)
              : isNull(integrationConnections.expiresAt),
          ),
        )
    },
  }
}

async function syncCreatedTaskToCalendars(input: {
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db']
  organizationId: string
  taskId: string
  dueAt?: Date
}) {
  if (!input.dueAt) return

  const connections = await listActiveCalendarConnections(input.db, input.organizationId)

  const results = await Promise.allSettled(
    connections.map(async (connection) => {
      const dependencies = calendarConnectionDependencies(input.db, connection)

      return {
        connectionId: connection.id,
        result: await syncTaskToCalendar(
          {
            connectionId: connection.id,
            taskId: input.taskId,
            dueAt: input.dueAt!,
          },
          dependencies,
        ),
      }
    }),
  )

  const recordResults = await Promise.allSettled(
    results
      .filter((result) => result.status === 'fulfilled')
      .map(async (result) => {
        const synced = result.value
        await input.db
          .insert(integrationSyncRecords)
          .values({
            organizationId: input.organizationId,
            connectionId: synced.connectionId,
            resourceType: 'task',
            resourceId: input.taskId,
            providerEventId: synced.result.providerEventId,
            providerUrl: synced.result.providerUrl ?? null,
            status: 'created',
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              integrationSyncRecords.connectionId,
              integrationSyncRecords.resourceType,
              integrationSyncRecords.resourceId,
            ],
            set: {
              providerEventId: synced.result.providerEventId,
              providerUrl: synced.result.providerUrl ?? null,
              status: 'created',
              updatedAt: new Date(),
            },
          })
      }),
  )

  const failedSyncCount = [
    ...results,
    ...recordResults,
  ].filter((result) => result.status === 'rejected').length

  if (failedSyncCount > 0) {
    logger.safe.warn(
      {
        component: 'tasks',
        organizationId: input.organizationId,
        taskId: input.taskId,
        failedSyncCount,
      },
      'task calendar sync failed for one or more active connections',
    )
  }
}

async function deleteDoneTaskFromCalendars(input: {
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db']
  organizationId: string
  taskId: string
}) {
  const syncRecords = await listCreatedCalendarSyncRecords(
    input.db,
    input.organizationId,
    input.taskId,
  )
  if (syncRecords.length === 0) return

  const connections = await listActiveCalendarConnections(input.db, input.organizationId)
  const connectionsById = new Map(connections.map((connection) => [connection.id, connection]))

  const results = await Promise.allSettled(
    syncRecords
      .map((record) => {
        const connection = connectionsById.get(record.connectionId)
        return connection ? { record, connection } : null
      })
      .filter(
        (
          entry,
        ): entry is {
          record: CreatedCalendarSyncRecord
          connection: ActiveCalendarConnection
        } => Boolean(entry),
      )
      .map(async ({ record, connection }) => {
        await deleteTaskCalendarEvent(
          {
            connectionId: record.connectionId,
            providerEventId: record.providerEventId,
          },
          calendarConnectionDependencies(input.db, connection),
        )

        await input.db
          .update(integrationSyncRecords)
          .set({
            status: 'deleted',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(integrationSyncRecords.connectionId, record.connectionId),
              eq(integrationSyncRecords.resourceType, 'task'),
              eq(integrationSyncRecords.resourceId, input.taskId),
              eq(integrationSyncRecords.providerEventId, record.providerEventId),
            ),
          )
      }),
  )

  const failedSyncCount = results.filter((result) => result.status === 'rejected').length

  if (failedSyncCount > 0) {
    logger.safe.warn(
      {
        component: 'tasks',
        organizationId: input.organizationId,
        taskId: input.taskId,
        failedSyncCount,
      },
      'task calendar delete failed for one or more active connections',
    )
  }
}

async function updateTaskDueAtInCalendars(input: {
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db']
  organizationId: string
  taskId: string
  dueAt: Date | null
  status: 'open' | 'in_progress' | 'blocked' | 'done'
}) {
  if (input.status === 'done' || !input.dueAt) {
    await deleteDoneTaskFromCalendars({
      db: input.db,
      organizationId: input.organizationId,
      taskId: input.taskId,
    })
    return
  }

  const syncRecords = await listCreatedCalendarSyncRecords(
    input.db,
    input.organizationId,
    input.taskId,
  )
  const connections = await listActiveCalendarConnections(input.db, input.organizationId)
  const connectionsById = new Map(connections.map((connection) => [connection.id, connection]))
  const syncedConnectionIds = new Set(syncRecords.map((record) => record.connectionId))

  const updateResults = await Promise.allSettled(
    syncRecords
      .map((record) => {
        const connection = connectionsById.get(record.connectionId)
        return connection ? { record, connection } : null
      })
      .filter(
        (
          entry,
        ): entry is {
          record: CreatedCalendarSyncRecord
          connection: ActiveCalendarConnection
        } => Boolean(entry),
      )
      .map(async ({ record, connection }) => {
        const dependencies = calendarConnectionDependencies(input.db, connection)
        let result: Awaited<ReturnType<typeof updateTaskCalendarEvent>>

        try {
          result = await updateTaskCalendarEvent(
            {
              connectionId: record.connectionId,
              taskId: input.taskId,
              providerEventId: record.providerEventId,
              dueAt: input.dueAt!,
            },
            dependencies,
          )
        } catch (error) {
          if (!(error instanceof CalendarEventNotFoundError)) {
            throw error
          }

          result = await syncTaskToCalendar(
            {
              connectionId: record.connectionId,
              taskId: input.taskId,
              dueAt: input.dueAt!,
            },
            dependencies,
          )
        }

        await input.db
          .update(integrationSyncRecords)
          .set({
            providerEventId: result.providerEventId,
            providerUrl: result.providerUrl ?? null,
            status: 'created',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(integrationSyncRecords.connectionId, record.connectionId),
              eq(integrationSyncRecords.resourceType, 'task'),
              eq(integrationSyncRecords.resourceId, input.taskId),
              eq(integrationSyncRecords.providerEventId, record.providerEventId),
            ),
          )
      }),
  )

  const createResults = await Promise.allSettled(
    connections
      .filter((connection) => !syncedConnectionIds.has(connection.id))
      .map(async (connection) => {
        const result = await syncTaskToCalendar(
          {
            connectionId: connection.id,
            taskId: input.taskId,
            dueAt: input.dueAt!,
          },
          calendarConnectionDependencies(input.db, connection),
        )

        await input.db
          .insert(integrationSyncRecords)
          .values({
            organizationId: input.organizationId,
            connectionId: connection.id,
            resourceType: 'task',
            resourceId: input.taskId,
            providerEventId: result.providerEventId,
            providerUrl: result.providerUrl ?? null,
            status: 'created',
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              integrationSyncRecords.connectionId,
              integrationSyncRecords.resourceType,
              integrationSyncRecords.resourceId,
            ],
            set: {
              providerEventId: result.providerEventId,
              providerUrl: result.providerUrl ?? null,
              status: 'created',
              updatedAt: new Date(),
            },
          })
      }),
  )

  const failedSyncCount = [...updateResults, ...createResults].filter(
    (result) => result.status === 'rejected',
  ).length

  if (failedSyncCount > 0) {
    logger.safe.warn(
      {
        component: 'tasks',
        organizationId: input.organizationId,
        taskId: input.taskId,
        failedSyncCount,
      },
      'task calendar update failed for one or more active connections',
    )
  }
}

async function requireTaskAccess() {
  const session = await requireSession()
  const { db } = await loadTaskDatabase()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)

  return { db, access }
}

export function buildTaskScope(access: Awaited<ReturnType<typeof resolveActiveLocationAccess>>) {
  return {
    locations: access.locations.map((location) => ({
      id: location.id,
      name: location.name,
    })),
    defaultLocationId: access.defaultLocationId,
    canAccessAllLocations: access.canAccessAllLocations,
    canWrite: canWriteLocations(access),
    canAdmin: canManageOrganization(access),
  }
}

async function requireScopedTask(taskId: string, mode: 'read' | 'write' = 'read') {
  const { getTask } = await loadTaskDatabase()
  const { db, access } = await requireTaskAccess()
  const task = await getTask(db, taskId, access.organizationId, getReadLocationIds(access))

  if (!task) {
    throw new Error('Task not found')
  }

  if (mode === 'write') {
    getWriteLocationId(access, task.locationId)
  }

  return { db, access, task }
}

function assertTaskAttachmentKey(tenantId: string, taskId: string, key: string) {
  const expectedPrefix = `attachments/${tenantId}/${taskId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error('Invalid attachment key')
  }
}

async function assertTaskAssigneeAccess(input: {
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db']
  organizationId: string
  taskLocationIds: string[]
  userId: string
}) {
  const [membership] = await input.db
    .select({ id: memberships.id, role: memberships.role })
    .from(memberships)
    .where(
      and(eq(memberships.tenantId, input.organizationId), eq(memberships.userId, input.userId)),
    )
    .limit(1)

  if (!membership) {
    throw new Error('Assignee is not a member of this organization')
  }

  if (membership.role === 'auditor') {
    throw new Error('Read-only auditors cannot be assigned operational tasks')
  }

  if (membership.role === 'org_owner' || membership.role === 'org_admin') {
    return
  }

  const grants = await input.db
    .select({ locationId: locationGrants.locationId })
    .from(locationGrants)
    .where(
      and(
        eq(locationGrants.tenantId, input.organizationId),
        eq(locationGrants.membershipId, membership.id),
      ),
    )
    .limit(100)

  const grantedLocationIds = new Set(grants.map((grant) => grant.locationId))
  if (!input.taskLocationIds.every((locationId) => grantedLocationIds.has(locationId))) {
    throw new Error('Assignee is outside the task location scope')
  }
}

async function listBulkTaskLocationIds(input: {
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db']
  organizationId: string
  taskIds: string[]
  locationIds?: string[]
}) {
  if (input.locationIds && input.locationIds.length === 0) return []

  const conditions = [eq(tasks.tenantId, input.organizationId), inArray(tasks.id, input.taskIds)]
  if (input.locationIds?.length) {
    conditions.push(inArray(tasks.locationId, input.locationIds))
  }

  const rows = await input.db
    .select({ locationId: tasks.locationId })
    .from(tasks)
    .where(and(...conditions))

  return [...new Set(rows.map((row) => row.locationId))]
}

async function listBulkTaskCalendarSnapshots(input: {
  db: Awaited<ReturnType<typeof loadTaskDatabase>>['db']
  organizationId: string
  taskIds: string[]
  locationIds?: string[]
}) {
  if (input.locationIds && input.locationIds.length === 0) return []

  const conditions = [eq(tasks.tenantId, input.organizationId), inArray(tasks.id, input.taskIds)]
  if (input.locationIds?.length) {
    conditions.push(inArray(tasks.locationId, input.locationIds))
  }

  return input.db
    .select({
      id: tasks.id,
      status: tasks.status,
      dueAt: tasks.dueAt,
    })
    .from(tasks)
    .where(and(...conditions))
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const listTasksFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => ListTasksInput.parse(data))
  .handler(async ({ data }) => {
    const { listTasks } = await loadTaskDatabase()
    const { db, access } = await requireTaskAccess()

    return listTasks(db, {
      tenantId: access.organizationId,
      locationIds: getReadLocationIds(access, data.locationId),
      status: data.status,
      assigneeId: data.assigneeId,
      sort: data.sort,
      sortDir: data.sortDir,
      page: data.page,
      pageSize: data.pageSize,
      includeArchived: data.includeArchived,
    })
  })

export const getTaskScopeFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { access } = await requireTaskAccess()

  return buildTaskScope(access)
})

export const getTaskFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => GetTaskInput.parse(data))
  .handler(async ({ data }) => {
    const { getTaskAssigneeId } = await loadTaskDatabase()
    const { db, access, task } = await requireScopedTask(data.taskId)
    const assigneeId = await getTaskAssigneeId(db, task.id, access.organizationId)
    return { ...task, assigneeId: assigneeId ?? undefined }
  })

export const listTaskCommentsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => ListTaskCommentsInput.parse(data))
  .handler(async ({ data }) => {
    const { listTaskComments } = await loadTaskDatabase()
    const { db, access, task } = await requireScopedTask(data.taskId)
    return listTaskComments(db, task.id, access.organizationId)
  })

export const createTaskFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CreateTaskInput.parse(data))
  .handler(async ({ data }) => {
    const { createTask } = await loadTaskDatabase()
    const { db, access } = await requireTaskAccess()

    return runInAuditContext(access.userId, async () => {
      const dueAt = data.dueAt ? new Date(data.dueAt) : undefined
      const task = await createTask(db, {
        tenantId: access.organizationId,
        locationId: getWriteLocationId(access, data.locationId),
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueAt,
        createdBy: access.userId,
      })

      await syncCreatedTaskToCalendars({
        db,
        organizationId: access.organizationId,
        taskId: task.id,
        dueAt,
      })

      return task
    })
  })

export const updateStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateStatusInput.parse(data))
  .handler(async ({ data }) => {
    const { updateTaskStatus } = await loadTaskDatabase()
    const { db, access, task: currentTask } = await requireScopedTask(data.taskId, 'write')

    return runInAuditContext(access.userId, async () => {
      const task = await updateTaskStatus(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        actorId: access.userId,
        status: data.status,
      })

      if (data.status === 'done') {
        await deleteDoneTaskFromCalendars({
          db,
          organizationId: access.organizationId,
          taskId: data.taskId,
        })
      } else if (currentTask.status === 'done' && currentTask.dueAt) {
        await updateTaskDueAtInCalendars({
          db,
          organizationId: access.organizationId,
          taskId: data.taskId,
          dueAt: currentTask.dueAt,
          status: data.status,
        })
      }

      return task
    })
  })

export const updateDueAtFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateDueAtInput.parse(data))
  .handler(async ({ data }) => {
    const { updateTaskDueAt } = await loadTaskDatabase()
    const { db, access, task: currentTask } = await requireScopedTask(data.taskId, 'write')

    return runInAuditContext(access.userId, async () => {
      const dueAt = data.dueAt ? new Date(data.dueAt) : null
      const task = await updateTaskDueAt(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        actorId: access.userId,
        dueAt,
      })

      await updateTaskDueAtInCalendars({
        db,
        organizationId: access.organizationId,
        taskId: data.taskId,
        dueAt,
        status: task.status ?? currentTask.status,
      })

      return task
    })
  })

export const addCommentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => AddCommentInput.parse(data))
  .handler(async ({ data }) => {
    const { addComment } = await loadTaskDatabase()
    const { db, access } = await requireScopedTask(data.taskId, 'write')

    return runInAuditContext(access.userId, () =>
      addComment(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        authorId: access.userId,
        body: data.body,
      }),
    )
  })

export const assignTaskFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => AssignTaskInput.parse(data))
  .handler(async ({ data }) => {
    const { assignTask } = await loadTaskDatabase()
    const { db, access, task } = await requireScopedTask(data.taskId, 'write')

    await assertTaskAssigneeAccess({
      db,
      organizationId: access.organizationId,
      taskLocationIds: [task.locationId],
      userId: data.userId,
    })

    return runInAuditContext(access.userId, () =>
      assignTask(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        userId: data.userId,
        assignedBy: access.userId,
      }),
    )
  })

export const presignUploadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => PresignUploadInput.parse(data))
  .handler(async ({ data }) => {
    const { access } = await requireScopedTask(data.taskId, 'write')
    const key = buildAttachmentKey(access.organizationId, data.taskId, data.filename)

    if (isMockUploadsEnabled()) {
      return {
        uploadUrl: buildMockUploadUrl(key),
        key,
      }
    }

    const bucket = requireAttachmentsBucketName()
    const uploadUrl = await generatePresignedUploadUrl({
      bucket,
      key,
      organizationId: access.organizationId,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      expiresIn: 300,
    })

    return { uploadUrl, key }
  })

export const completeUploadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CompleteUploadInput.parse(data))
  .handler(async ({ data }) => {
    const { createAttachment } = await loadTaskDatabase()
    const { db, access } = await requireScopedTask(data.taskId, 'write')
    const mockUploadsEnabled = isMockUploadsEnabled()

    assertTaskAttachmentKey(access.organizationId, data.taskId, data.s3Key)

    let bucket: string | null = null
    if (!mockUploadsEnabled) {
      bucket = requireAttachmentsBucketName()
      await assertUploadedObject({
        bucket,
        key: data.s3Key,
        contentType: data.contentType,
        sizeBytes: data.sizeBytes,
      })
    }

    const attachment = await runInAuditContext(access.userId, () =>
      createAttachment(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        s3Key: data.s3Key,
        contentType: data.contentType,
        sizeBytes: data.sizeBytes,
        uploadedBy: access.userId,
        avStatus: mockUploadsEnabled ? 'skipped' : 'pending',
      }),
    )

    if (!mockUploadsEnabled) {
      try {
        await dispatchAttachmentScanRequest({
          organizationId: access.organizationId,
          key: data.s3Key,
          bucket: bucket!,
          contentType: data.contentType,
          sizeBytes: data.sizeBytes,
        })
      } catch (error) {
        logger.safe.warn(
          {
            component: 'tasks',
            organizationId: access.organizationId,
            taskId: data.taskId,
            attachmentId: attachment.id,
          },
          'task attachment scan dispatch failed after pending attachment was recorded',
        )
        throw error
      }
    }

    return attachment
  })

export const listTaskAttachmentsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => GetTaskInput.parse(data))
  .handler(async ({ data }) => {
    const { listTaskAttachments } = await loadTaskDatabase()
    const { db, access, task } = await requireScopedTask(data.taskId)

    return listTaskAttachments(db, task.id, access.organizationId)
  })

export const downloadTaskAttachmentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => DownloadTaskAttachmentInput.parse(data))
  .handler(async ({ data }) => {
    const { getTaskAttachment } = await loadTaskDatabase()
    const { db, access, task } = await requireScopedTask(data.taskId)
    const attachment = await getTaskAttachment(db, {
      taskId: task.id,
      attachmentId: data.attachmentId,
      tenantId: access.organizationId,
    })

    if (!attachment) {
      throw new Error('Attachment not found')
    }

    if (attachment.avStatus === 'infected') {
      throw new Error('Attachment failed malware scanning')
    }

    if (attachment.avStatus === 'skipped' && isMockUploadsEnabled()) {
      assertTaskAttachmentKey(access.organizationId, task.id, attachment.s3Key)
      return { downloadUrl: buildMockUploadUrl(attachment.s3Key) }
    }

    if (attachment.avStatus !== 'clean') {
      throw new Error('Attachment scan is not complete')
    }

    assertTaskAttachmentKey(access.organizationId, task.id, attachment.s3Key)

    const bucket = requireAttachmentsBucketName()
    const downloadUrl = await generatePresignedDownloadUrl({
      bucket,
      key: attachment.s3Key,
      organizationId: access.organizationId,
      expiresIn: 900,
    })

    return { downloadUrl }
  })

const ListTaskActivityInput = z.object({ taskId: z.string().uuid() })

export const listTaskActivityFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => ListTaskActivityInput.parse(data))
  .handler(async ({ data }) => {
    const { db, access } = await requireScopedTask(data.taskId)

    const events = await db
      .select({
        id: auditEvents.id,
        action: auditEvents.action,
        actorId: auditEvents.actorId,
        before: auditEvents.before,
        after: auditEvents.after,
        createdAt: auditEvents.createdAt,
      })
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.tenantId, access.organizationId),
          or(
            and(eq(auditEvents.resourceType, 'task'), eq(auditEvents.resourceId, data.taskId)),
            and(
              eq(auditEvents.resourceType, 'task_comment'),
              sql`${auditEvents.after}->>'taskId' = ${data.taskId}`,
            ),
            and(
              eq(auditEvents.resourceType, 'task_attachment'),
              sql`${auditEvents.after}->>'taskId' = ${data.taskId}`,
            ),
          ),
        ),
      )
      .orderBy(desc(auditEvents.createdAt))
      .limit(100)

    return events.map((e) => ({
      id: e.id,
      action: e.action,
      actorId: e.actorId,
      before: e.before ? JSON.stringify(e.before) : null,
      after: e.after ? JSON.stringify(e.after) : null,
      createdAt: e.createdAt,
    }))
  })

export const updateTaskFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateTaskInput.parse(data))
  .handler(async ({ data }) => {
    const { updateTask } = await loadTaskDatabase()
    const { db, access } = await requireScopedTask(data.taskId, 'write')

    if (data.title === undefined && data.description === undefined && data.priority === undefined) {
      throw new Error('At least one task field must be provided')
    }

    return runInAuditContext(access.userId, () =>
      updateTask(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
        description: data.description,
        priority: data.priority,
      }),
    )
  })

export const archiveTaskFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ArchiveTaskInput.parse(data))
  .handler(async ({ data }) => {
    const { archiveTask } = await loadTaskDatabase()
    const { db, access } = await requireScopedTask(data.taskId, 'write')

    return runInAuditContext(access.userId, async () => {
      const task = await archiveTask(db, {
        taskId: data.taskId,
        tenantId: access.organizationId,
        actorId: access.userId,
      })

      await deleteDoneTaskFromCalendars({
        db,
        organizationId: access.organizationId,
        taskId: data.taskId,
      })

      return task
    })
  })

// Restrict bulk mutations to the caller's writable locations. Org-scoped
// admins can mutate any location in the tenant; location-scoped users
// (location_manager, location_staff) may only mutate tasks in locations
// they have grants for. Unauthorized IDs are silently dropped rather than
// throwing so a single foreign ID does not abort the entire batch.
function writableLocationIds(
  access: Awaited<ReturnType<typeof requireTaskAccess>>['access'],
): string[] | undefined {
  if (access.canAccessAllLocations) return undefined
  return access.allowedLocationIds
}

export const bulkUpdateStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => BulkUpdateStatusInput.parse(data))
  .handler(async ({ data }) => {
    const { bulkUpdateTaskStatus } = await loadTaskDatabase()
    const { db, access } = await requireTaskAccess()

    if (!canWriteLocations(access)) {
      throw new Error('Unauthorized')
    }

    const locationIds = writableLocationIds(access)
    const taskSnapshots = await listBulkTaskCalendarSnapshots({
      db,
      organizationId: access.organizationId,
      taskIds: data.taskIds,
      locationIds,
    })

    const result = await runInAuditContext(access.userId, () =>
      bulkUpdateTaskStatus(db, {
        taskIds: data.taskIds,
        tenantId: access.organizationId,
        actorId: access.userId,
        status: data.status,
        locationIds,
      }),
    )

    if (result.updated === 0) return result

    await Promise.all(
      taskSnapshots.map((task) => {
        if (data.status === 'done') {
          return deleteDoneTaskFromCalendars({
            db,
            organizationId: access.organizationId,
            taskId: task.id,
          })
        }

        if (task.status === 'done' && task.dueAt) {
          return updateTaskDueAtInCalendars({
            db,
            organizationId: access.organizationId,
            taskId: task.id,
            dueAt: task.dueAt,
            status: data.status,
          })
        }

        return Promise.resolve()
      }),
    )

    return result
  })

export const bulkAssignFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => BulkAssignInput.parse(data))
  .handler(async ({ data }) => {
    const { bulkAssignTask } = await loadTaskDatabase()
    const { db, access } = await requireTaskAccess()

    if (!canWriteLocations(access)) {
      throw new Error('Unauthorized')
    }

    const locationIds = writableLocationIds(access)
    const taskLocationIds = await listBulkTaskLocationIds({
      db,
      organizationId: access.organizationId,
      taskIds: data.taskIds,
      locationIds,
    })

    if (taskLocationIds.length === 0) {
      return { updated: 0 }
    }

    await assertTaskAssigneeAccess({
      db,
      organizationId: access.organizationId,
      taskLocationIds,
      userId: data.userId,
    })

    return runInAuditContext(access.userId, () =>
      bulkAssignTask(db, {
        taskIds: data.taskIds,
        tenantId: access.organizationId,
        actorId: access.userId,
        userId: data.userId,
        locationIds,
      }),
    )
  })
