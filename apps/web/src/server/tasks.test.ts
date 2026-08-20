import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSession } from '../lib/session.js'

const listTasksMock = vi.fn()
const getTaskMock = vi.fn()
const createTaskMock = vi.fn()
const updateTaskStatusMock = vi.fn()
const updateTaskDueAtMock = vi.fn()
const updateTaskMock = vi.fn()
const addCommentMock = vi.fn()
const assignTaskMock = vi.fn()
const bulkAssignTaskMock = vi.fn()
const bulkUpdateTaskStatusMock = vi.fn()
const archiveTaskMock = vi.fn()
const createAttachmentMock = vi.fn()
const deleteTaskAttachmentMock = vi.fn()
const getTaskAttachmentMock = vi.fn()
const listTaskAttachmentsMock = vi.fn()
const getDbMock = vi.fn()
const syncTaskToCalendarMock = vi.fn()
const deleteTaskCalendarEventMock = vi.fn()
const updateTaskCalendarEventMock = vi.fn()
class CalendarEventNotFoundErrorMock extends Error {}
const decryptTokenMock = vi.fn()
const encryptTokenMock = vi.fn()
const loggerWarnMock = vi.fn()
const getSessionFnMock = vi.fn()
const runInAuditContextMock = vi.fn(async (_actorId: string, fn: () => Promise<unknown>) => fn())
const resolveActiveLocationAccessMock = vi.fn()
const generatePresignedUploadUrlMock = vi.fn()
const generatePresignedDownloadUrlMock = vi.fn()
const buildAttachmentKeyMock = vi.fn()
const assertUploadedObjectMock = vi.fn()
const dispatchAttachmentScanRequestMock = vi.fn()
const isMockUploadsEnabledMock = vi.fn()
const requireAttachmentsBucketNameMock = vi.fn(() => {
  const bucket = process.env.ATTACHMENTS_BUCKET_NAME ?? process.env.ATTACHMENTS_BUCKET_NAME

  if (!bucket) {
    throw new Error('Attachment storage is not configured')
  }

  return bucket
})
let tasksModulePromise: Promise<typeof import('./tasks.js')>

vi.mock('@phiguard/audit', () => ({
  auditEvents: {
    id: 'auditId',
    tenantId: 'auditTenantId',
    action: 'auditAction',
    actorId: 'auditActorId',
    resourceType: 'auditResourceType',
    resourceId: 'auditResourceId',
    before: 'auditBefore',
    after: 'auditAfter',
    createdAt: 'auditCreatedAt',
  },
  logger: {
    safe: {
      warn: loggerWarnMock,
    },
  },
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  integrationConnections: {
    id: 'connectionId',
    organizationId: 'organizationId',
    provider: 'provider',
    accessTokenCiphertext: 'accessTokenCiphertext',
    refreshTokenCiphertext: 'refreshTokenCiphertext',
    kmsKeyId: 'kmsKeyId',
    status: 'status',
    expiresAt: 'expiresAt',
    scopes: 'scopes',
  },
  integrationSyncRecords: {
    organizationId: 'syncOrganizationId',
    connectionId: 'syncConnectionId',
    resourceType: 'syncResourceType',
    resourceId: 'syncResourceId',
    providerEventId: 'syncProviderEventId',
    providerUrl: 'syncProviderUrl',
    status: 'syncStatus',
  },
  memberships: {
    id: 'membershipId',
    userId: 'membershipUserId',
    tenantId: 'membershipTenantId',
    role: 'membershipRole',
  },
  locationGrants: {
    tenantId: 'grantTenantId',
    membershipId: 'grantMembershipId',
    locationId: 'grantLocationId',
  },
  tasks: {
    id: 'taskId',
    tenantId: 'taskTenantId',
    locationId: 'taskLocationId',
    status: 'taskStatus',
    dueAt: 'taskDueAt',
  },
}))

vi.mock('@phiguard/db/tasks', () => ({
  listTasks: listTasksMock,
  getTask: getTaskMock,
  createTask: createTaskMock,
  updateTaskStatus: updateTaskStatusMock,
  updateTaskDueAt: updateTaskDueAtMock,
  updateTask: updateTaskMock,
  addComment: addCommentMock,
  assignTask: assignTaskMock,
  bulkAssignTask: bulkAssignTaskMock,
  bulkUpdateTaskStatus: bulkUpdateTaskStatusMock,
  archiveTask: archiveTaskMock,
  createAttachment: createAttachmentMock,
  deleteTaskAttachment: deleteTaskAttachmentMock,
  getTaskAttachment: getTaskAttachmentMock,
  listTaskAttachments: listTaskAttachmentsMock,
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((fn) => fn),
  })),
}))

vi.mock('@phiguard/integration/calendar-sync', () => ({
  CalendarEventNotFoundError: CalendarEventNotFoundErrorMock,
  deleteTaskCalendarEvent: deleteTaskCalendarEventMock,
  syncTaskToCalendar: syncTaskToCalendarMock,
  updateTaskCalendarEvent: updateTaskCalendarEventMock,
}))

vi.mock('@phiguard/integration/token-crypto', () => ({
  decryptToken: decryptTokenMock,
  encryptToken: encryptTokenMock,
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('../lib/audit.server.js', () => ({
  runInAuditContext: runInAuditContextMock,
}))

vi.mock('../lib/attachment-scan.js', () => ({
  dispatchAttachmentScanRequest: dispatchAttachmentScanRequestMock,
}))

vi.mock('./access.js', () => ({
  assertCommercialProductAccess: vi.fn(),
  canManageOrganization: vi.fn(
    (access) => access.role === 'org_owner' || access.role === 'org_admin',
  ),
  canWriteLocations: vi.fn((access) => access.role !== 'auditor'),
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
  getReadLocationIds: vi.fn((access, requestedLocationId) =>
    requestedLocationId ? [requestedLocationId] : access.allowedLocationIds,
  ),
  getWriteLocationId: vi.fn((access, requestedLocationId) => {
    if (access.role === 'auditor') {
      throw new Error('Location not found or access denied')
    }

    if (requestedLocationId) {
      return requestedLocationId
    }

    if (access.allowedLocationIds.length === 1) {
      return access.allowedLocationIds[0]
    }

    throw new Error('Location is required')
  }),
}))

vi.mock('../lib/s3.js', () => ({
  assertUploadedObject: assertUploadedObjectMock,
  buildMockUploadUrl: vi.fn((key: string) => `/api/uploads/mock?key=${encodeURIComponent(key)}`),
  generatePresignedDownloadUrl: generatePresignedDownloadUrlMock,
  generatePresignedUploadUrl: generatePresignedUploadUrlMock,
  buildAttachmentKey: buildAttachmentKeyMock,
  isMockUploadsEnabled: isMockUploadsEnabledMock,
  requireAttachmentsBucketName: requireAttachmentsBucketNameMock,
  MAX_UPLOAD_BYTES: 25 * 1024 * 1024,
}))

describe('task server functions', () => {
  const db = { tag: 'db' }

  beforeAll(async () => {
    tasksModulePromise = import('./tasks.js')
    await tasksModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()
    getDbMock.mockReturnValue(db)
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'location_staff',
      accessLevel: 'location',
      allowedLocationIds: ['location-1'],
      locations: [{ id: 'location-1', name: 'Main Clinic' }],
      defaultLocationId: 'location-1',
      canAccessAllLocations: false,
    })
    buildAttachmentKeyMock.mockReturnValue('attachments/org-1/task-1/mock_evidence.txt')
    dispatchAttachmentScanRequestMock.mockResolvedValue(undefined)
    isMockUploadsEnabledMock.mockReturnValue(false)
    decryptTokenMock.mockImplementation(async (encrypted) => {
      if (encrypted.ciphertext === 'access-ciphertext') return 'access-token'
      if (encrypted.ciphertext === 'refresh-ciphertext') return 'refresh-token'
      return 'decrypted-token'
    })
    encryptTokenMock.mockImplementation(async (plaintext, keyId) => ({
      ciphertext: `${plaintext}-ciphertext`,
      encryptedDataKey: keyId,
      iv: 'iv',
    }))
  })

  it('scopes task reads to all allowed locations by default', async () => {
    listTasksMock.mockResolvedValue([])

    const { listTasksFn } = await tasksModulePromise

    await listTasksFn({
      data: {
        status: 'open',
      },
    })

    expect(listTasksMock).toHaveBeenCalledWith(db, {
      tenantId: 'org-1',
      locationIds: ['location-1'],
      status: 'open',
      assigneeId: undefined,
    })
  })

  it('exposes write and admin capability flags from task scope', async () => {
    const { buildTaskScope } = await tasksModulePromise

    expect(
      buildTaskScope({
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'location_staff',
        accessLevel: 'location',
        allowedLocationIds: ['location-1'],
        locations: [{ id: 'location-1', name: 'Main Clinic' }],
        defaultLocationId: 'location-1',
        canAccessAllLocations: false,
      } as never),
    ).toMatchObject({
      canWrite: true,
      canAdmin: false,
    })
  })

  it('creates a task in the only allowed location when none is selected', async () => {
    createTaskMock.mockResolvedValue({ id: 'task-1' })

    const { createTaskFn } = await tasksModulePromise

    await createTaskFn({
      data: {
        title: 'Follow up with clinic',
      },
    })

    expect(createTaskMock).toHaveBeenCalledWith(db, {
      tenantId: 'org-1',
      locationId: 'location-1',
      title: 'Follow up with clinic',
      description: undefined,
      priority: undefined,
      dueAt: undefined,
      createdBy: 'user-1',
    })
  })

  it('syncs due tasks to active calendar integrations without sending task text', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })
    const insert = vi.fn().mockReturnValue({
      values: insertValues,
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(integrationRows),
        }),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert,
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    createTaskMock.mockResolvedValue({
      id: 'task-1',
      title: 'Patient John needs oncology follow-up',
    })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-1',
      providerUrl: 'https://calendar.google.com/event?eid=1',
    })

    const { createTaskFn } = await tasksModulePromise

    await createTaskFn({
      data: {
        title: 'Patient John needs oncology follow-up',
        dueAt: '2026-05-01T09:00:00.000Z',
      },
    })

    expect(syncTaskToCalendarMock).toHaveBeenCalledWith(
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        taskId: 'task-1',
        dueAt: new Date('2026-05-01T09:00:00.000Z'),
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    const loadConnection = syncTaskToCalendarMock.mock.calls[0][1].loadConnection as (
      connectionId: string,
    ) => Promise<{ scopes?: string[] }>
    await expect(loadConnection('11111111-1111-4111-8111-111111111111')).resolves.toEqual(
      expect.objectContaining({
        scopes: ['openid', 'email'],
      }),
    )
    expect(JSON.stringify(syncTaskToCalendarMock.mock.calls)).not.toContain('Patient John')
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        connectionId: '11111111-1111-4111-8111-111111111111',
        resourceType: 'task',
        resourceId: 'task-1',
        providerEventId: 'calendar-event-1',
        providerUrl: 'https://calendar.google.com/event?eid=1',
        status: 'created',
      }),
    )
  })

  it('logs non-PHI metadata when best-effort calendar sync fails', async () => {
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(integrationRows),
        }),
      }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    createTaskMock.mockResolvedValue({ id: 'task-1' })
    syncTaskToCalendarMock.mockRejectedValue(new Error('provider unavailable'))

    const { createTaskFn } = await tasksModulePromise

    await createTaskFn({
      data: {
        title: 'Patient John needs oncology follow-up',
        dueAt: '2026-05-01T09:00:00.000Z',
      },
    })

    expect(loggerWarnMock).toHaveBeenCalledWith(
      {
        component: 'tasks',
        organizationId: 'org-1',
        taskId: 'task-1',
        failedSyncCount: 1,
      },
      'task calendar sync failed for one or more active connections',
    )
    expect(JSON.stringify(loggerWarnMock.mock.calls)).not.toContain('Patient John')
  })

  it('keeps task creation successful when recording a calendar sync result fails', async () => {
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockRejectedValue(new Error('sync record insert failed')),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(integrationRows),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: insertValues,
      }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    createTaskMock.mockResolvedValue({
      id: 'task-1',
      title: 'Patient John needs oncology follow-up',
    })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-1',
      providerUrl: 'https://calendar.google.com/event?eid=1',
    })

    const { createTaskFn } = await tasksModulePromise

    await expect(
      createTaskFn({
        data: {
          title: 'Patient John needs oncology follow-up',
          dueAt: '2026-05-01T09:00:00.000Z',
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'task-1',
      }),
    )

    expect(loggerWarnMock).toHaveBeenCalledWith(
      {
        component: 'tasks',
        organizationId: 'org-1',
        taskId: 'task-1',
        failedSyncCount: 1,
      },
      'task calendar sync failed for one or more active connections',
    )
    expect(JSON.stringify(loggerWarnMock.mock.calls)).not.toContain('Patient John')
  })

  it('preserves stored calendar scopes when token refresh omits scope data', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(integrationRows),
        }),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({
        values: insertValues,
      }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    createTaskMock.mockResolvedValue({ id: 'task-1' })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-1',
    })

    const { createTaskFn } = await tasksModulePromise

    await createTaskFn({
      data: {
        title: 'Follow up with clinic',
        dueAt: '2026-05-01T09:00:00.000Z',
      },
    })

    const saveConnectionTokens = syncTaskToCalendarMock.mock.calls[0][1].saveConnectionTokens as (
      connectionId: string,
      tokens: {
        accessToken: string
        refreshToken: string
        expiresAt: Date
        scopes: string[]
      },
    ) => Promise<void>

    await saveConnectionTokens('11111111-1111-4111-8111-111111111111', {
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
      expiresAt: new Date('2026-05-01T11:00:00Z'),
      scopes: [],
    })

    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'fresh-access-token-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'fresh-refresh-token-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T11:00:00Z'),
      }),
    )
  })

  it('guards refreshed calendar token writes against stale connection snapshots', async () => {
    const updateWhere = vi.fn().mockResolvedValue(undefined)
    const updateSet = vi.fn().mockReturnValue({
      where: updateWhere,
    })
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(integrationRows),
        }),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({
        values: insertValues,
      }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    createTaskMock.mockResolvedValue({ id: 'task-1' })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-1',
    })

    const { createTaskFn } = await tasksModulePromise

    await createTaskFn({
      data: {
        title: 'Follow up with clinic',
        dueAt: '2026-05-01T09:00:00.000Z',
      },
    })

    const saveConnectionTokens = syncTaskToCalendarMock.mock.calls[0][1].saveConnectionTokens as (
      connectionId: string,
      tokens: {
        accessToken: string
        refreshToken: string
        expiresAt: Date
        scopes: string[]
      },
    ) => Promise<void>

    await saveConnectionTokens('11111111-1111-4111-8111-111111111111', {
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
      expiresAt: new Date('2026-05-01T11:00:00Z'),
      scopes: [],
    })

    const condition = JSON.stringify(updateWhere.mock.calls[0]?.[0])
    expect(condition).toContain('refreshTokenCiphertext')
    expect(condition).toContain('refresh-ciphertext')
    expect(condition).toContain('expiresAt')
    expect(condition).toContain('2026-05-01T10:00:00.000Z')
  })

  it('does not call calendar integrations for tasks without due dates', async () => {
    createTaskMock.mockResolvedValue({ id: 'task-1' })

    const { createTaskFn } = await tasksModulePromise

    await createTaskFn({
      data: {
        title: 'Follow up with clinic',
      },
    })

    expect(syncTaskToCalendarMock).not.toHaveBeenCalled()
  })

  it('requires a location when the caller can access multiple locations', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: ['location-1', 'location-2'],
      locations: [
        { id: 'location-1', name: 'Main Clinic' },
        { id: 'location-2', name: 'Satellite Clinic' },
      ],
      defaultLocationId: 'location-1',
      canAccessAllLocations: true,
    })

    const { createTaskFn } = await tasksModulePromise

    await expect(
      createTaskFn({
        data: {
          title: 'Review overdue checklist',
          locationId: undefined,
        },
      }),
    ).rejects.toThrow('Location is required')

    expect(createTaskMock).not.toHaveBeenCalled()
  })

  it('rejects task status updates outside the caller location scope', async () => {
    getTaskMock.mockResolvedValue(null)

    const { updateStatusFn } = await tasksModulePromise

    await expect(
      updateStatusFn({
        data: {
          taskId: 'task-1',
          status: 'done',
        },
      }),
    ).rejects.toThrow('Task not found')

    expect(getTaskMock).toHaveBeenCalledWith(db, 'task-1', 'org-1', ['location-1'])
    expect(updateTaskStatusMock).not.toHaveBeenCalled()
  })

  it('deletes mapped calendar events when a due task is marked done', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      title: 'Patient John needs oncology follow-up',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
    })
    updateTaskStatusMock.mockResolvedValue({ id: 'task-1', status: 'done' })
    deleteTaskCalendarEventMock.mockResolvedValue(undefined)

    const { updateStatusFn } = await tasksModulePromise

    await updateStatusFn({
      data: {
        taskId: 'task-1',
        status: 'done',
      },
    })

    expect(deleteTaskCalendarEventMock).toHaveBeenCalledWith(
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'deleted',
      }),
    )
    expect(JSON.stringify(deleteTaskCalendarEventMock.mock.calls)).not.toContain('Patient John')
  })

  it('keeps status updates successful and logs non-PHI metadata when calendar deletion fails', async () => {
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      title: 'Patient John needs oncology follow-up',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
    })
    updateTaskStatusMock.mockResolvedValue({ id: 'task-1', status: 'done' })
    deleteTaskCalendarEventMock.mockRejectedValue(new Error('provider unavailable'))

    const { updateStatusFn } = await tasksModulePromise

    await expect(
      updateStatusFn({
        data: {
          taskId: 'task-1',
          status: 'done',
        },
      }),
    ).resolves.toEqual({ id: 'task-1', status: 'done' })

    expect(loggerWarnMock).toHaveBeenCalledWith(
      {
        component: 'tasks',
        organizationId: 'org-1',
        taskId: 'task-1',
        failedSyncCount: 1,
      },
      'task calendar delete failed for one or more active connections',
    )
    expect(JSON.stringify(loggerWarnMock.mock.calls)).not.toContain('Patient John')
  })

  it('deletes mapped calendar events when a due task is archived', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      title: 'Patient John needs oncology follow-up',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
    })
    archiveTaskMock.mockResolvedValue({
      id: 'task-1',
      archivedAt: new Date('2026-05-01T10:00:00.000Z'),
    })
    deleteTaskCalendarEventMock.mockResolvedValue(undefined)

    const { archiveTaskFn } = await tasksModulePromise

    await archiveTaskFn({
      data: {
        taskId: 'task-1',
      },
    })

    expect(archiveTaskMock).toHaveBeenCalledWith(dbWithIntegrations, {
      taskId: 'task-1',
      tenantId: 'org-1',
      actorId: 'user-1',
    })
    expect(deleteTaskCalendarEventMock).toHaveBeenCalledWith(
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'deleted',
      }),
    )
    expect(JSON.stringify(deleteTaskCalendarEventMock.mock.calls)).not.toContain('Patient John')
  })

  it('recreates calendar events when a completed due task is reopened', async () => {
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '22222222-2222-4222-8222-222222222222',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: insertValues,
      }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      title: 'Patient John needs oncology follow-up',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
      status: 'done',
    })
    updateTaskStatusMock.mockResolvedValue({
      id: 'task-1',
      status: 'open',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
    })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-2',
      providerUrl: 'https://calendar.google.com/event?eid=2',
    })

    const { updateStatusFn } = await tasksModulePromise

    await updateStatusFn({
      data: {
        taskId: 'task-1',
        status: 'open',
      },
    })

    expect(syncTaskToCalendarMock).toHaveBeenCalledWith(
      {
        connectionId: '22222222-2222-4222-8222-222222222222',
        taskId: 'task-1',
        dueAt: new Date('2026-05-01T09:00:00.000Z'),
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: '22222222-2222-4222-8222-222222222222',
        resourceType: 'task',
        resourceId: 'task-1',
        providerEventId: 'calendar-event-2',
        status: 'created',
      }),
    )
    expect(JSON.stringify(syncTaskToCalendarMock.mock.calls)).not.toContain('Patient John')
  })

  it('updates mapped calendar events when a due date changes', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      title: 'Patient John needs oncology follow-up',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
      status: 'open',
    })
    updateTaskDueAtMock.mockResolvedValue({
      id: 'task-1',
      dueAt: new Date('2026-05-03T09:00:00.000Z'),
    })
    updateTaskCalendarEventMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-1',
      providerUrl: 'https://calendar.google.com/event?eid=1',
    })

    const { updateDueAtFn } = await tasksModulePromise

    await updateDueAtFn({
      data: {
        taskId: 'task-1',
        dueAt: '2026-05-03T09:00:00.000Z',
      },
    })

    expect(updateTaskDueAtMock).toHaveBeenCalledWith(dbWithIntegrations, {
      taskId: 'task-1',
      tenantId: 'org-1',
      actorId: 'user-1',
      dueAt: new Date('2026-05-03T09:00:00.000Z'),
    })
    expect(updateTaskCalendarEventMock).toHaveBeenCalledWith(
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        taskId: 'task-1',
        providerEventId: 'calendar-event-1',
        dueAt: new Date('2026-05-03T09:00:00.000Z'),
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'created',
        providerUrl: 'https://calendar.google.com/event?eid=1',
      }),
    )
    expect(JSON.stringify(updateTaskCalendarEventMock.mock.calls)).not.toContain('Patient John')
  })

  it('creates missing calendar events for active connections during due date updates', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        provider: 'microsoft',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({
        values: insertValues,
      }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
      status: 'open',
    })
    updateTaskDueAtMock.mockResolvedValue({
      id: 'task-1',
      dueAt: new Date('2026-05-03T09:00:00.000Z'),
      status: 'open',
    })
    updateTaskCalendarEventMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-1',
      providerUrl: 'https://calendar.google.com/event?eid=1',
    })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'microsoft',
      providerEventId: 'calendar-event-2',
      providerUrl: 'https://outlook.office.com/calendar/item/2',
    })

    const { updateDueAtFn } = await tasksModulePromise

    await updateDueAtFn({
      data: {
        taskId: 'task-1',
        dueAt: '2026-05-03T09:00:00.000Z',
      },
    })

    expect(updateTaskCalendarEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      }),
      expect.any(Object),
    )
    expect(syncTaskToCalendarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: '22222222-2222-4222-8222-222222222222',
        taskId: 'task-1',
        dueAt: new Date('2026-05-03T09:00:00.000Z'),
      }),
      expect.any(Object),
    )
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: '22222222-2222-4222-8222-222222222222',
        providerEventId: 'calendar-event-2',
        status: 'created',
      }),
    )
  })

  it('recreates stale calendar sync records when provider event is missing during due date update', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'stale-calendar-event',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
      status: 'open',
    })
    updateTaskDueAtMock.mockResolvedValue({
      id: 'task-1',
      dueAt: new Date('2026-05-03T09:00:00.000Z'),
      status: 'open',
    })
    updateTaskCalendarEventMock.mockRejectedValue(
      new CalendarEventNotFoundErrorMock('provider event missing'),
    )
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'replacement-calendar-event',
      providerUrl: 'https://calendar.google.com/event?eid=replacement',
    })

    const { updateDueAtFn } = await tasksModulePromise

    await updateDueAtFn({
      data: {
        taskId: 'task-1',
        dueAt: '2026-05-03T09:00:00.000Z',
      },
    })

    expect(syncTaskToCalendarMock).toHaveBeenCalledWith(
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        taskId: 'task-1',
        dueAt: new Date('2026-05-03T09:00:00.000Z'),
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        providerEventId: 'replacement-calendar-event',
        providerUrl: 'https://calendar.google.com/event?eid=replacement',
        status: 'created',
      }),
    )
  })

  it('deletes mapped calendar events when a due date is cleared', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const integrationRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        provider: 'google',
        accessTokenCiphertext: JSON.stringify({
          ciphertext: 'access-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        refreshTokenCiphertext: JSON.stringify({
          ciphertext: 'refresh-ciphertext',
          encryptedDataKey: 'integration-key',
          iv: 'iv',
        }),
        kmsKeyId: 'integration-key',
        scopes: ['openid', 'email'],
        expiresAt: new Date('2026-05-01T10:00:00Z'),
      },
    ]
    const syncRows = [
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
    ]
    const dbWithIntegrations = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(syncRows),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(integrationRows),
          }),
        }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
    }
    getDbMock.mockReturnValue(dbWithIntegrations)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      dueAt: new Date('2026-05-01T09:00:00.000Z'),
      status: 'open',
    })
    updateTaskDueAtMock.mockResolvedValue({
      id: 'task-1',
      dueAt: null,
    })
    deleteTaskCalendarEventMock.mockResolvedValue(undefined)

    const { updateDueAtFn } = await tasksModulePromise

    await updateDueAtFn({
      data: {
        taskId: 'task-1',
        dueAt: null,
      },
    })

    expect(deleteTaskCalendarEventMock).toHaveBeenCalledWith(
      {
        connectionId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-1',
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'deleted',
      }),
    )
  })

  it('rejects task writes for read-only auditors', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'auditor',
      accessLevel: 'organization',
      allowedLocationIds: ['location-1'],
      locations: [{ id: 'location-1', name: 'Main Clinic' }],
      defaultLocationId: 'location-1',
      canAccessAllLocations: true,
    })
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })

    const { updateStatusFn } = await tasksModulePromise

    await expect(
      updateStatusFn({
        data: {
          taskId: 'task-1',
          status: 'done',
        },
      }),
    ).rejects.toThrow('Location not found or access denied')

    expect(updateTaskStatusMock).not.toHaveBeenCalled()
  })

  it('rejects empty task edits before calling the database update helper', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })

    const { updateTaskFn } = await tasksModulePromise

    await expect(
      updateTaskFn({
        data: {
          taskId: 'task-1',
        },
      }),
    ).rejects.toThrow('At least one task field must be provided')

    expect(updateTaskMock).not.toHaveBeenCalled()
  })

  it('rejects task assignment to users outside the active organization', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const assignmentDb = {
      ...db,
      select: vi.fn().mockReturnValue(membershipQuery),
    }
    getDbMock.mockReturnValue(assignmentDb)

    const { assignTaskFn } = await tasksModulePromise

    await expect(
      assignTaskFn({
        data: {
          taskId: 'task-1',
          userId: 'outside-user',
        },
      }),
    ).rejects.toThrow('Assignee is not a member of this organization')

    expect(assignTaskMock).not.toHaveBeenCalled()
  })

  it('rejects task assignment when the assignee lacks access to the task location', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'membership-2',
          role: 'location_staff',
        },
      ]),
    }
    const grantsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ locationId: 'location-2' }]),
    }
    const assignmentDb = {
      ...db,
      select: vi.fn().mockReturnValueOnce(membershipQuery).mockReturnValueOnce(grantsQuery),
    }
    getDbMock.mockReturnValue(assignmentDb)

    const { assignTaskFn } = await tasksModulePromise

    await expect(
      assignTaskFn({
        data: {
          taskId: 'task-1',
          userId: 'staff-user',
        },
      }),
    ).rejects.toThrow('Assignee is outside the task location scope')

    expect(assignTaskMock).not.toHaveBeenCalled()
  })

  it('rejects task assignment to read-only auditors', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'membership-2',
          role: 'auditor',
        },
      ]),
    }
    const assignmentDb = {
      ...db,
      select: vi.fn().mockReturnValue(membershipQuery),
    }
    getDbMock.mockReturnValue(assignmentDb)

    const { assignTaskFn } = await tasksModulePromise

    await expect(
      assignTaskFn({
        data: {
          taskId: 'task-1',
          userId: 'auditor-user',
        },
      }),
    ).rejects.toThrow('Read-only auditors cannot be assigned operational tasks')

    expect(assignTaskMock).not.toHaveBeenCalled()
  })

  it('deletes calendar events when bulk status updates complete tasks', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const taskSnapshotQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          status: 'open',
          dueAt: new Date('2026-05-01T09:00:00.000Z'),
        },
      ]),
    }
    const syncRowsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          connectionId: '22222222-2222-4222-8222-222222222222',
          providerEventId: 'calendar-event-1',
        },
      ]),
    }
    const integrationRowsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          id: '22222222-2222-4222-8222-222222222222',
          provider: 'google',
          accessTokenCiphertext: JSON.stringify({
            ciphertext: 'access-ciphertext',
            encryptedDataKey: 'integration-key',
            iv: 'iv',
          }),
          refreshTokenCiphertext: JSON.stringify({
            ciphertext: 'refresh-ciphertext',
            encryptedDataKey: 'integration-key',
            iv: 'iv',
          }),
          kmsKeyId: 'integration-key',
          scopes: ['openid', 'email'],
          expiresAt: new Date('2026-05-01T10:00:00Z'),
        },
      ]),
    }
    const bulkDb = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce(taskSnapshotQuery)
        .mockReturnValueOnce(syncRowsQuery)
        .mockReturnValueOnce(integrationRowsQuery),
      update: vi.fn().mockReturnValue({ set: updateSet }),
    }
    getDbMock.mockReturnValue(bulkDb)
    bulkUpdateTaskStatusMock.mockResolvedValue({ updated: 1 })
    deleteTaskCalendarEventMock.mockResolvedValue(undefined)

    const { bulkUpdateStatusFn } = await tasksModulePromise

    await bulkUpdateStatusFn({
      data: {
        taskIds: ['11111111-1111-4111-8111-111111111111'],
        status: 'done',
      },
    })

    expect(bulkUpdateTaskStatusMock).toHaveBeenCalledWith(bulkDb, {
      taskIds: ['11111111-1111-4111-8111-111111111111'],
      tenantId: 'org-1',
      actorId: 'user-1',
      status: 'done',
      locationIds: ['location-1'],
    })
    expect(deleteTaskCalendarEventMock).toHaveBeenCalledWith(
      {
        connectionId: '22222222-2222-4222-8222-222222222222',
        providerEventId: 'calendar-event-1',
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ status: 'deleted' }))
  })

  it('recreates calendar events when bulk status updates reopen completed due tasks', async () => {
    const insertValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    })
    const taskSnapshotQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          status: 'done',
          dueAt: new Date('2026-05-01T09:00:00.000Z'),
        },
      ]),
    }
    const syncRowsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    }
    const integrationRowsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          id: '22222222-2222-4222-8222-222222222222',
          provider: 'google',
          accessTokenCiphertext: JSON.stringify({
            ciphertext: 'access-ciphertext',
            encryptedDataKey: 'integration-key',
            iv: 'iv',
          }),
          refreshTokenCiphertext: JSON.stringify({
            ciphertext: 'refresh-ciphertext',
            encryptedDataKey: 'integration-key',
            iv: 'iv',
          }),
          kmsKeyId: 'integration-key',
          scopes: ['openid', 'email'],
          expiresAt: new Date('2026-05-01T10:00:00Z'),
        },
      ]),
    }
    const bulkDb = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce(taskSnapshotQuery)
        .mockReturnValueOnce(syncRowsQuery)
        .mockReturnValueOnce(integrationRowsQuery),
      insert: vi.fn().mockReturnValue({ values: insertValues }),
    }
    getDbMock.mockReturnValue(bulkDb)
    bulkUpdateTaskStatusMock.mockResolvedValue({ updated: 1 })
    syncTaskToCalendarMock.mockResolvedValue({
      provider: 'google',
      providerEventId: 'calendar-event-2',
      providerUrl: null,
    })

    const { bulkUpdateStatusFn } = await tasksModulePromise

    await bulkUpdateStatusFn({
      data: {
        taskIds: ['11111111-1111-4111-8111-111111111111'],
        status: 'open',
      },
    })

    expect(syncTaskToCalendarMock).toHaveBeenCalledWith(
      {
        connectionId: '22222222-2222-4222-8222-222222222222',
        taskId: '11111111-1111-4111-8111-111111111111',
        dueAt: new Date('2026-05-01T09:00:00.000Z'),
      },
      expect.objectContaining({
        loadConnection: expect.any(Function),
        saveConnectionTokens: expect.any(Function),
      }),
    )
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        connectionId: '22222222-2222-4222-8222-222222222222',
        resourceType: 'task',
        resourceId: '11111111-1111-4111-8111-111111111111',
        providerEventId: 'calendar-event-2',
        status: 'created',
      }),
    )
  })

  it('rejects bulk task assignment to users outside the active organization', async () => {
    const taskLocationQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ locationId: 'location-1' }]),
    }
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const assignmentDb = {
      ...db,
      select: vi.fn().mockReturnValueOnce(taskLocationQuery).mockReturnValueOnce(membershipQuery),
    }
    getDbMock.mockReturnValue(assignmentDb)

    const { bulkAssignFn } = await tasksModulePromise

    await expect(
      bulkAssignFn({
        data: {
          taskIds: ['11111111-1111-4111-8111-111111111111'],
          userId: 'outside-user',
        },
      }),
    ).rejects.toThrow('Assignee is not a member of this organization')

    expect(bulkAssignTaskMock).not.toHaveBeenCalled()
  })

  it('rejects bulk task assignment to read-only auditors', async () => {
    const taskLocationQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ locationId: 'location-1' }]),
    }
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'membership-2',
          role: 'auditor',
        },
      ]),
    }
    const assignmentDb = {
      ...db,
      select: vi.fn().mockReturnValueOnce(taskLocationQuery).mockReturnValueOnce(membershipQuery),
    }
    getDbMock.mockReturnValue(assignmentDb)

    const { bulkAssignFn } = await tasksModulePromise

    await expect(
      bulkAssignFn({
        data: {
          taskIds: ['11111111-1111-4111-8111-111111111111'],
          userId: 'auditor-user',
        },
      }),
    ).rejects.toThrow('Read-only auditors cannot be assigned operational tasks')

    expect(bulkAssignTaskMock).not.toHaveBeenCalled()
  })

  it('rejects bulk task assignment when the assignee lacks a required writable location', async () => {
    const taskLocationQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ locationId: 'location-1' }]),
    }
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'membership-2',
          role: 'location_staff',
        },
      ]),
    }
    const grantsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ locationId: 'location-2' }]),
    }
    const assignmentDb = {
      ...db,
      select: vi
        .fn()
        .mockReturnValueOnce(taskLocationQuery)
        .mockReturnValueOnce(membershipQuery)
        .mockReturnValueOnce(grantsQuery),
    }
    getDbMock.mockReturnValue(assignmentDb)

    const { bulkAssignFn } = await tasksModulePromise

    await expect(
      bulkAssignFn({
        data: {
          taskIds: ['11111111-1111-4111-8111-111111111111'],
          userId: 'staff-user',
        },
      }),
    ).rejects.toThrow('Assignee is outside the task location scope')

    expect(bulkAssignTaskMock).not.toHaveBeenCalled()
  })

  it('marks auditors as read-only in the task scope payload', async () => {
    const { buildTaskScope } = await tasksModulePromise

    expect(
      buildTaskScope({
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'auditor',
        accessLevel: 'organization',
        allowedLocationIds: ['location-1'],
        locations: [{ id: 'location-1', name: 'Main Clinic' }],
        defaultLocationId: 'location-1',
        canAccessAllLocations: true,
      } as never),
    ).toMatchObject({
      canWrite: false,
      canAdmin: false,
    })
  })

  it('rejects presign requests when attachment storage is not configured', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    delete process.env.ATTACHMENTS_BUCKET_NAME

    const { presignUploadFn } = await tasksModulePromise

    await expect(
      presignUploadFn({
        data: {
          taskId: 'task-1',
          filename: 'evidence.txt',
          contentType: 'text/plain',
          sizeBytes: 128,
        },
      }),
    ).rejects.toThrow('Attachment storage is not configured')

    expect(buildAttachmentKeyMock).toHaveBeenCalledWith('org-1', 'task-1', 'evidence.txt')
    expect(generatePresignedUploadUrlMock).not.toHaveBeenCalled()
  })

  it('returns a real presigned upload URL when attachment storage is configured', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    generatePresignedUploadUrlMock.mockResolvedValue('https://signed-upload.example')

    const { presignUploadFn } = await tasksModulePromise

    await presignUploadFn({
      data: {
        taskId: 'task-1',
        filename: 'evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    })

    expect(generatePresignedUploadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'attachments/org-1/task-1/mock_evidence.txt',
      organizationId: 'org-1',
      contentType: 'text/plain',
      sizeBytes: 128,
      expiresIn: 300,
    })
  })

  it('persists pending attachments before requesting malware scanning so callbacks have a row to update', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    createAttachmentMock.mockResolvedValue({ id: 'attachment-1' })

    const { completeUploadFn } = await tasksModulePromise

    await completeUploadFn({
      data: {
        taskId: 'task-1',
        s3Key: 'attachments/org-1/task-1/mock_evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    })

    expect(assertUploadedObjectMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'attachments/org-1/task-1/mock_evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
    })
    expect(dispatchAttachmentScanRequestMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      bucket: 'attachments-bucket',
      key: 'attachments/org-1/task-1/mock_evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
    })
    expect(createAttachmentMock).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        taskId: 'task-1',
        tenantId: 'org-1',
        uploadedBy: 'user-1',
        avStatus: 'pending',
      }),
    )
    expect(createAttachmentMock.mock.invocationCallOrder[0]).toBeLessThan(
      dispatchAttachmentScanRequestMock.mock.invocationCallOrder[0] as number,
    )
  })

  it('keeps pending attachments and rejects completion when malware scanning is not accepted', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    createAttachmentMock.mockResolvedValue({ id: 'attachment-1' })
    dispatchAttachmentScanRequestMock.mockRejectedValue(
      new Error('Attachment malware scanning is not configured'),
    )

    const { completeUploadFn } = await tasksModulePromise

    await expect(
      completeUploadFn({
        data: {
          taskId: 'task-1',
          s3Key: 'attachments/org-1/task-1/mock_evidence.txt',
          contentType: 'text/plain',
          sizeBytes: 128,
        },
      }),
    ).rejects.toThrow('Attachment malware scanning is not configured')

    expect(assertUploadedObjectMock).toHaveBeenCalled()
    expect(createAttachmentMock).toHaveBeenCalled()
    expect(deleteTaskAttachmentMock).not.toHaveBeenCalled()
  })

  it('rejects attachment completion when attachment storage is not configured', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    delete process.env.ATTACHMENTS_BUCKET_NAME

    const { completeUploadFn } = await tasksModulePromise

    await expect(
      completeUploadFn({
        data: {
          taskId: 'task-1',
          s3Key: 'attachments/org-1/task-1/mock_evidence.txt',
          contentType: 'text/plain',
          sizeBytes: 128,
        },
      }),
    ).rejects.toThrow('Attachment storage is not configured')

    expect(assertUploadedObjectMock).not.toHaveBeenCalled()
    expect(dispatchAttachmentScanRequestMock).not.toHaveBeenCalled()
    expect(createAttachmentMock).not.toHaveBeenCalled()
  })

  it('persists an attachment in mock upload mode without attachment storage', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    delete process.env.ATTACHMENTS_BUCKET_NAME
    isMockUploadsEnabledMock.mockReturnValue(true)
    createAttachmentMock.mockResolvedValue({ id: 'attachment-1' })

    const { completeUploadFn } = await tasksModulePromise

    await completeUploadFn({
      data: {
        taskId: 'task-1',
        s3Key: 'attachments/org-1/task-1/mock_evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    })

    expect(assertUploadedObjectMock).not.toHaveBeenCalled()
    expect(dispatchAttachmentScanRequestMock).not.toHaveBeenCalled()
    expect(createAttachmentMock).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        taskId: 'task-1',
        tenantId: 'org-1',
        s3Key: 'attachments/org-1/task-1/mock_evidence.txt',
        uploadedBy: 'user-1',
        avStatus: 'skipped',
      }),
    )
  })

  it('loads persisted task attachments for the scoped task', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    listTaskAttachmentsMock.mockResolvedValue([
      {
        id: 'attachment-1',
        taskId: 'task-1',
        tenantId: 'org-1',
        s3Key: 'attachments/org-1/task-1/evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    ])

    const { listTaskAttachmentsFn } = await tasksModulePromise

    await listTaskAttachmentsFn({
      data: { taskId: 'task-1' },
    })

    expect(listTaskAttachmentsMock).toHaveBeenCalledWith(db, 'task-1', 'org-1')
  })

  it('returns task activity rows with serialized before and after payloads', async () => {
    const createdAt = new Date('2026-05-20T08:00:00.000Z')
    const activityRows = [
      {
        id: 'event-1',
        action: 'task.comment.added',
        actorId: 'user-1',
        before: null,
        after: { taskId: 'task-1' },
        createdAt,
      },
      {
        id: 'event-2',
        action: 'task.attachment.scan_completed',
        actorId: 'attachment-scan',
        before: { avStatus: 'pending' },
        after: { taskId: 'task-1', avStatus: 'clean' },
        createdAt,
      },
      {
        id: 'event-3',
        action: 'task.attachment.deleted',
        actorId: 'user-1',
        before: {
          contentType: 'text/plain',
          sizeBytes: 128,
          avStatus: 'pending',
        },
        after: { taskId: 'task-1' },
        createdAt,
      },
    ]
    const query = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(activityRows),
    }
    const activityDb = { ...db, select: vi.fn().mockReturnValue(query) }
    getDbMock.mockReturnValue(activityDb)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })

    const { listTaskActivityFn } = await tasksModulePromise

    await expect(listTaskActivityFn({ data: { taskId: 'task-1' } })).resolves.toEqual([
      {
        id: 'event-1',
        action: 'task.comment.added',
        actorId: 'user-1',
        before: null,
        after: JSON.stringify({ taskId: 'task-1' }),
        createdAt,
      },
      {
        id: 'event-2',
        action: 'task.attachment.scan_completed',
        actorId: 'attachment-scan',
        before: JSON.stringify({ avStatus: 'pending' }),
        after: JSON.stringify({ taskId: 'task-1', avStatus: 'clean' }),
        createdAt,
      },
      {
        id: 'event-3',
        action: 'task.attachment.deleted',
        actorId: 'user-1',
        before: JSON.stringify({
          contentType: 'text/plain',
          sizeBytes: 128,
          avStatus: 'pending',
        }),
        after: JSON.stringify({ taskId: 'task-1' }),
        createdAt,
      },
    ])

    expect(query.where).toHaveBeenCalled()
  })

  it('returns an empty activity list when no audit rows exist', async () => {
    const createdAt = new Date('2026-05-20T08:00:00.000Z')
    const updatedAt = new Date('2026-05-20T09:15:00.000Z')
    const query = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const activityDb = { ...db, select: vi.fn().mockReturnValue(query) }
    getDbMock.mockReturnValue(activityDb)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
      status: 'blocked',
      createdAt,
      updatedAt,
    })

    const { listTaskActivityFn } = await tasksModulePromise

    await expect(listTaskActivityFn({ data: { taskId: 'task-1' } })).resolves.toEqual([])
  })

  it('downloads a clean attachment for a scoped readable task', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'clean',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    const result = await downloadTaskAttachmentFn({
      data: { taskId: 'task-1', attachmentId: 'attachment-1' },
    })

    expect(getTaskAttachmentMock).toHaveBeenCalledWith(db, {
      taskId: 'task-1',
      attachmentId: 'attachment-1',
      tenantId: 'org-1',
    })
    expect(generatePresignedDownloadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'attachments/org-1/task-1/evidence.txt',
      organizationId: 'org-1',
      expiresIn: 900,
    })
    expect(result).toEqual({ downloadUrl: 'https://signed-download.example' })
  })

  it('downloads clean attachments for read-only scoped users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'auditor',
      accessLevel: 'location',
      allowedLocationIds: ['location-1'],
      locations: [{ id: 'location-1', name: 'Main Clinic' }],
      defaultLocationId: 'location-1',
      canAccessAllLocations: false,
    })
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'clean',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).resolves.toEqual({ downloadUrl: 'https://signed-download.example' })
  })

  it('rejects attachment downloads when the task is outside the readable scope', async () => {
    getTaskMock.mockResolvedValue(null)
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Task not found')

    expect(getTaskAttachmentMock).not.toHaveBeenCalled()
    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects attachment downloads when the attachment is missing', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue(null)
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Attachment not found')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects clean attachment downloads when attachment storage is not configured', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'clean',
    })
    delete process.env.ATTACHMENTS_BUCKET_NAME

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Attachment storage is not configured')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects attachment downloads until malware scanning is complete', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'pending',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Attachment scan is not complete')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects infected attachment downloads', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'infected',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Attachment failed malware scanning')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects skipped attachment downloads', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'skipped',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Attachment scan is not complete')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('downloads skipped attachments through the mock route when mock uploads are enabled', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/mock_evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'skipped',
    })
    delete process.env.ATTACHMENTS_BUCKET_NAME

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).resolves.toEqual({
      downloadUrl: '/api/uploads/mock?key=attachments%2Forg-1%2Ftask-1%2Fmock_evidence.txt',
    })

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects attachment downloads for keys outside the task prefix', async () => {
    getTaskMock.mockResolvedValue({
      id: 'task-1',
      tenantId: 'org-1',
      locationId: 'location-1',
    })
    getTaskAttachmentMock.mockResolvedValue({
      id: 'attachment-1',
      taskId: 'task-1',
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/other-task/evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
      avStatus: 'clean',
    })
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'

    const { downloadTaskAttachmentFn } = await tasksModulePromise

    await expect(
      downloadTaskAttachmentFn({
        data: { taskId: 'task-1', attachmentId: 'attachment-1' },
      }),
    ).rejects.toThrow('Invalid attachment key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })
})

function makeSession(userId: string, organizationId: string): AppSession {
  return {
    user: {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: 'session-id',
      token: 'session-token',
      userId,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      activeOrganizationId: organizationId,
    },
  } as AppSession
}
