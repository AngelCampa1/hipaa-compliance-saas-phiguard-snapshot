import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveTask,
  updateTask,
  updateTaskDueAt,
  updateTaskStatus,
} from './index.js'
import { writeAuditEvent } from '@phiguard/audit'

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

function createMockDb(updateRows: unknown[]) {
  const beforeTask = {
    id: 'task-1',
    tenantId: 'tenant-1',
    locationId: 'location-1',
    title: 'Existing task',
    description: 'Existing description',
    status: 'open',
    priority: 'medium',
    dueAt: null,
    archivedAt: null,
  }

  const selectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([beforeTask]),
  }
  const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(updateRows),
  }
  const db = {
    select: vi.fn().mockReturnValue(selectChain),
    update: vi.fn().mockReturnValue(updateChain),
    transaction: vi.fn((callback: (tx: typeof db) => Promise<unknown>) => callback(db)),
  }

  return db
}

describe('task stale write guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not audit a stale status update', async () => {
    const db = createMockDb([])

    await expect(
      updateTaskStatus(db as never, {
        taskId: 'task-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        status: 'done',
      }),
    ).rejects.toThrow('Task task-1 not found or access denied for tenant tenant-1')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit a stale due-date update', async () => {
    const db = createMockDb([])

    await expect(
      updateTaskDueAt(db as never, {
        taskId: 'task-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        dueAt: new Date('2026-05-01T12:00:00.000Z'),
      }),
    ).rejects.toThrow('Task task-1 not found or access denied for tenant tenant-1')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit a stale task field update', async () => {
    const db = createMockDb([])

    await expect(
      updateTask(db as never, {
        taskId: 'task-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        priority: 'high',
      }),
    ).rejects.toThrow('Task task-1 not found')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit a stale task archive update', async () => {
    const db = createMockDb([])

    await expect(
      archiveTask(db as never, {
        taskId: 'task-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('Task task-1 not found')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})
