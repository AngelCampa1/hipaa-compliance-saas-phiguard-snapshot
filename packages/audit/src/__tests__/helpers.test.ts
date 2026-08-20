import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auditedWrite } from '../helpers.js'
import type { WriteAuditEventInput } from '../write.js'

const { writeAuditEventMock } = vi.hoisted(() => ({
  writeAuditEventMock: vi.fn(),
}))

vi.mock('../write.js', async () => {
  const actual = await vi.importActual<typeof import('../write.js')>('../write.js')
  return { ...actual, writeAuditEvent: writeAuditEventMock }
})

const makeMockDb = () => {
  const insertMock = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
  const transactionMock = vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
    // Simulate a transaction: run callback and propagate errors (simulates rollback on throw)
    const tx = { transaction: transactionMock, insert: insertMock }
    return fn(tx)
  })
  return { transaction: transactionMock, insert: insertMock }
}

describe('auditedWrite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    writeAuditEventMock.mockResolvedValue(undefined)
  })

  it('executes the mutation and writes the audit event', async () => {
    writeAuditEventMock.mockResolvedValue(undefined)
    const row = { id: 'row-1', name: 'test' }
    const db = makeMockDb()
    const mutation = vi.fn().mockResolvedValue(row)
    const eventFactory = vi.fn().mockReturnValue({
      tenantId: 'org-1',
      actorId: 'user-1',
      action: 'task.created',
      resourceType: 'task',
      resourceId: row.id,
    } satisfies WriteAuditEventInput)

    const result = await auditedWrite(db, mutation, eventFactory)

    expect(mutation).toHaveBeenCalledOnce()
    expect(eventFactory).toHaveBeenCalledWith(row)
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ insert: expect.any(Function), transaction: expect.any(Function) }),
      {
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'task.created',
        resourceType: 'task',
        resourceId: 'row-1',
      },
    )
    expect(result).toBe(row)
  })

  it('does not write the audit event when the mutation throws', async () => {
    const db = makeMockDb()
    const mutation = vi.fn().mockRejectedValue(new Error('DB error'))

    await expect(
      auditedWrite(db, mutation, () => ({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'task.created',
        resourceType: 'task',
        resourceId: 'row-1',
      })),
    ).rejects.toThrow('DB error')

    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rolls back mutation when audit write fails (atomicity guarantee)', async () => {
    writeAuditEventMock.mockRejectedValue(new Error('audit insert failed'))
    const db = makeMockDb()
    const mutation = vi.fn().mockResolvedValue({ id: 'row-1' })

    await expect(
      auditedWrite(db, mutation, () => ({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'task.created',
        resourceType: 'task',
        resourceId: 'row-1',
      })),
    ).rejects.toThrow('audit insert failed')

    // Both ran inside the transaction - the error propagation simulates rollback.
    // In a real DB, the transaction would be rolled back, undoing the mutation.
    expect(mutation).toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalled()
    expect(db.transaction).toHaveBeenCalledOnce()
  })

  it('runs mutation and audit write inside a single transaction', async () => {
    const db = makeMockDb()
    const mutation = vi.fn().mockResolvedValue({ id: 'row-2' })

    await auditedWrite(db, mutation, () => ({
      tenantId: 'org-1',
      actorId: 'user-1',
      action: 'task.updated',
      resourceType: 'task',
      resourceId: 'row-2',
    }))

    // The transaction wrapper must be called exactly once
    expect(db.transaction).toHaveBeenCalledOnce()
    // The mutation receives the tx handle (an object with insert + transaction)
    expect(mutation).toHaveBeenCalledWith(
      expect.objectContaining({ insert: expect.any(Function), transaction: expect.any(Function) }),
    )
  })
})
