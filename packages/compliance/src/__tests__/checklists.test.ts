import { afterAll, beforeAll, describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import { locations, memberships, organizations, users } from '@phiguard/db'
import { eq } from 'drizzle-orm'
import {
  archiveChecklist,
  attachEvidence,
  computeProgress,
  completeItem,
  deleteChecklist,
  renameChecklist,
  reopenItem,
} from '../checklists.js'
import { checklistItems } from '../schema/checklist-items.phi.js'
import { checklists } from '../schema/checklists.js'
import { writeAuditEvent } from '@phiguard/audit'

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
}))

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('checklist mutation actor membership integration', () => {
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
        slug: `primary-${org.id.slice(0, 8)}`,
        isPrimary: true,
      })
      .returning()
    await db.insert(memberships).values(makeMembership({ tenantId: org.id, userId: user.id }))

    return { org, user, location }
  }

  async function seedChecklist(input?: { itemStatus?: 'pending' | 'complete' }) {
    const { db } = requireTestDB()
    const tenant = await seedTenant()
    const [checklist] = await db
      .insert(checklists)
      .values({
        tenantId: tenant.org.id,
        locationId: tenant.location.id,
        name: 'Actor membership checklist',
      })
      .returning()
    const [item] = await db
      .insert(checklistItems)
      .values({
        checklistId: checklist.id,
        tenantId: tenant.org.id,
        locationId: tenant.location.id,
        title: 'Review safeguard',
        status: input?.itemStatus ?? 'pending',
        completedAt: input?.itemStatus === 'complete' ? new Date() : null,
        completedBy: input?.itemStatus === 'complete' ? tenant.user.id : null,
      })
      .returning()

    return { ...tenant, checklist, item }
  }

  it('rejects item completion when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedChecklist()
    const tenantB = await seedTenant()

    await expect(
      completeItem(db, {
        itemId: tenantA.item.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
      }),
    ).rejects.toThrow('Checklist actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.id, tenantA.item.id))
      .limit(1)
    expect(current?.status).toBe('pending')
    expect(current?.completedBy).toBeNull()
  })

  it('rejects item reopen when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedChecklist({ itemStatus: 'complete' })
    const tenantB = await seedTenant()

    await expect(
      reopenItem(db, {
        itemId: tenantA.item.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
      }),
    ).rejects.toThrow('Checklist actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.id, tenantA.item.id))
      .limit(1)
    expect(current?.status).toBe('complete')
    expect(current?.completedBy).toBe(tenantA.user.id)
  })

  it('rejects evidence attachment when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedChecklist()
    const tenantB = await seedTenant()

    await expect(
      attachEvidence(db, {
        itemId: tenantA.item.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        evidence: `storage://phiguard-evidence/evidence/${tenantA.org.id}/checklist-items/${tenantA.item.id}/item.pdf`,
      }),
    ).rejects.toThrow('Checklist actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.id, tenantA.item.id))
      .limit(1)
    expect(current?.evidence).toBeNull()
  })

  it('rejects checklist archive when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedChecklist()
    const tenantB = await seedTenant()

    await expect(
      archiveChecklist(db, {
        checklistId: tenantA.checklist.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
      }),
    ).rejects.toThrow('Checklist actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(checklists)
      .where(eq(checklists.id, tenantA.checklist.id))
      .limit(1)
    expect(current?.status).toBe('active')
  })

  it('rejects checklist rename when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedChecklist()
    const tenantB = await seedTenant()

    await expect(
      renameChecklist(db, {
        checklistId: tenantA.checklist.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        name: 'Renamed by outsider',
      }),
    ).rejects.toThrow('Checklist actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(checklists)
      .where(eq(checklists.id, tenantA.checklist.id))
      .limit(1)
    expect(current?.name).toBe('Actor membership checklist')
  })

  it('rejects checklist delete when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedChecklist()
    const tenantB = await seedTenant()

    await expect(
      deleteChecklist(db, {
        checklistId: tenantA.checklist.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
      }),
    ).rejects.toThrow('Checklist actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(checklists)
      .where(eq(checklists.id, tenantA.checklist.id))
      .limit(1)
    expect(current?.id).toBe(tenantA.checklist.id)
  })
})

describe('computeProgress', () => {
  it('returns correct progress for partial completion', () => {
    const items = [
      { status: 'complete' },
      { status: 'complete' },
      { status: 'pending' },
      { status: 'pending' },
      { status: 'pending' },
    ]
    const result = computeProgress(items)
    expect(result.total).toBe(5)
    expect(result.complete).toBe(2)
    expect(result.pct).toBe(40)
  })

  it('returns pct: 0 when there are 0 items (no division by zero)', () => {
    const result = computeProgress([])
    expect(result.total).toBe(0)
    expect(result.complete).toBe(0)
    expect(result.pct).toBe(0)
  })

  it('returns 100 pct when all items are complete', () => {
    const items = [{ status: 'complete' }, { status: 'complete' }]
    const result = computeProgress(items)
    expect(result.pct).toBe(100)
  })

  it('counts na items separately and excludes them from pct calculation denominator', () => {
    const items = [
      { status: 'complete' },
      { status: 'na' },
      { status: 'pending' },
    ]
    const result = computeProgress(items)
    expect(result.naCount).toBe(1)
    expect(result.total).toBe(3)
    expect(result.complete).toBe(1)
    expect(result.pct).toBe(50)
  })

  it('returns 100 pct when every item is na', () => {
    const result = computeProgress([{ status: 'na' }, { status: 'na' }])
    expect(result.total).toBe(2)
    expect(result.naCount).toBe(2)
    expect(result.complete).toBe(0)
    expect(result.pct).toBe(100)
  })
})

describe('completeItem', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    updateSet: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
  }
  let mockItem: {
    id: string
    checklistId: string
    tenantId: string
    locationId: string
    title: string
    description: null
    hipaaReference: null
    status: string
    completedAt: null
    completedBy: null
    evidence: null
    createdAt: Date
    updatedAt: Date
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockItem = {
      id: 'item-1',
      checklistId: 'checklist-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      title: 'Test item',
      description: null,
      hipaaReference: null,
      status: 'pending',
      completedAt: null,
      completedBy: null,
      evidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedItem = { ...mockItem, status: 'complete', completedAt: new Date(), completedBy: 'actor-1' }

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockItem]),
    }

    const updateSet = vi.fn().mockReturnThis()
    const updateChain = {
      set: updateSet,
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([updatedItem]),
    }

    mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
      updateSet,
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn((fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
    }
  })

  it('completes an item and writes an audit event', async () => {
    const result = await completeItem(mockDb as unknown as Parameters<typeof completeItem>[0], {
      itemId: 'item-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
    })

    expect(result).toBeDefined()
    expect(result.status).toBe('complete')
    expect(writeAuditEvent).toHaveBeenCalledOnce()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'checklist_item.completed',
        resourceType: 'checklist_item',
        resourceId: 'item-1',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        actorId: 'actor-1',
      }),
    )
  })

  it('does not accept evidence through completion', async () => {
    const result = await completeItem(mockDb as unknown as Parameters<typeof completeItem>[0], {
      itemId: 'item-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
      evidence: 'storage://bucket/key',
    } as Parameters<typeof completeItem>[1] & { evidence: string })

    expect(result).toBeDefined()
    expect(mockDb.updateSet).toHaveBeenCalledWith(
      expect.not.objectContaining({ evidence: expect.anything() }),
    )
  })

  it('does not audit when the item update is stale', async () => {
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    })

    await expect(
      completeItem(mockDb as unknown as Parameters<typeof completeItem>[0], {
        itemId: 'item-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('Item not found or tenant mismatch')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('reopenItem', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const completedItem = {
      id: 'item-1',
      checklistId: 'checklist-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      title: 'Test item',
      description: null,
      hipaaReference: null,
      status: 'complete',
      completedAt: new Date(),
      completedBy: 'actor-1',
      evidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const reopenedItem = { ...completedItem, status: 'pending', completedAt: null, completedBy: null }

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([completedItem]),
    }

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([reopenedItem]),
    }

    mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn((fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
    }
  })

  it('resets status to pending and clears completedAt', async () => {
    const result = await reopenItem(mockDb as unknown as Parameters<typeof reopenItem>[0], {
      itemId: 'item-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
    })

    expect(result.status).toBe('pending')
    expect(result.completedAt).toBeNull()
  })

  it('writes an audit event on reopen', async () => {
    await reopenItem(mockDb as unknown as Parameters<typeof reopenItem>[0], {
      itemId: 'item-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
    })

    expect(writeAuditEvent).toHaveBeenCalledOnce()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'checklist_item.reopened',
        resourceType: 'checklist_item',
        resourceId: 'item-1',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        actorId: 'actor-1',
      }),
    )
  })

  it('does not audit when the reopen update is stale', async () => {
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    })

    await expect(
      reopenItem(mockDb as unknown as Parameters<typeof reopenItem>[0], {
        itemId: 'item-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('Item not found or tenant mismatch')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('attachEvidence', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const currentItem = {
      id: 'item-1',
      checklistId: 'checklist-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      title: 'Test item',
      description: null,
      hipaaReference: null,
      status: 'pending',
      completedAt: null,
      completedBy: null,
      evidence: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedItem = {
      ...currentItem,
      evidence: 'storage://phiguard-evidence/evidence/tenant-1/checklist-items/item-1/upload.txt',
      updatedAt: new Date(),
    }

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([currentItem]),
    }

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([updatedItem]),
    }

    mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn((fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
    }
  })

  it('stores the evidence key and writes an audit event', async () => {
    const evidence = 'storage://phiguard-evidence/evidence/tenant-1/checklist-items/item-1/upload.txt'
    const result = await attachEvidence(mockDb as unknown as Parameters<typeof attachEvidence>[0], {
      itemId: 'item-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
      evidence,
    })

    expect(result.evidence).toBe(evidence)
    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'checklist_item.evidence_uploaded',
        resourceType: 'checklist_item',
        resourceId: 'item-1',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        actorId: 'actor-1',
      }),
    )
  })

  it('does not duplicate raw evidence URIs into the immutable audit payload', async () => {
    const evidence =
      'storage://phiguard-evidence/evidence/tenant-1/checklist-items/item-1/patient-jane.pdf'
    await attachEvidence(mockDb as unknown as Parameters<typeof attachEvidence>[0], {
      itemId: 'item-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
      evidence,
    })

    const auditPayload = vi.mocked(writeAuditEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(auditPayload?.before)).not.toContain(evidence)
    expect(JSON.stringify(auditPayload?.after)).not.toContain(evidence)
    expect(auditPayload?.after).toEqual({ evidenceAttached: true })
  })

  it('rejects raw text that is not a storage URI', async () => {
    await expect(
      attachEvidence(mockDb as unknown as Parameters<typeof attachEvidence>[0], {
        itemId: 'item-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        evidence: 'This policy has been reviewed and approved.',
      }),
    ).rejects.toThrow('must be a storage URI')
  })

  it('rejects http:// URLs that are not storage URIs', async () => {
    await expect(
      attachEvidence(mockDb as unknown as Parameters<typeof attachEvidence>[0], {
        itemId: 'item-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        evidence: 'https://example.com/file.pdf',
      }),
    ).rejects.toThrow('must be a storage URI')
  })

  it('rejects storage evidence keys outside the tenant checklist item prefix', async () => {
    await expect(
      attachEvidence(mockDb as unknown as Parameters<typeof attachEvidence>[0], {
        itemId: 'item-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        evidence: 'storage://phiguard-evidence/evidence/tenant-1/checklist-items/other-item/upload.txt',
      }),
    ).rejects.toThrow('Invalid evidence key')

    expect(mockDb.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit when the evidence update is stale', async () => {
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    })

    await expect(
      attachEvidence(mockDb as unknown as Parameters<typeof attachEvidence>[0], {
        itemId: 'item-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        evidence: 'storage://phiguard-evidence/evidence/tenant-1/checklist-items/item-1/upload.txt',
      }),
    ).rejects.toThrow('Item not found or tenant mismatch')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('checklist management', () => {
  const mockChecklist = {
    id: 'checklist-1',
    tenantId: 'tenant-1',
    locationId: 'location-1',
    templateId: null,
    name: 'Security checklist',
    status: 'active',
    dueAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  function createChecklistDb(options?: {
    updateResult?: unknown[]
    deleteResult?: unknown[]
    completedCount?: number
  }) {
    const selectChecklistChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockChecklist]),
    }
    const selectMembershipChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const selectCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ cnt: options?.completedCount ?? 0 }]),
    }
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(options?.updateResult ?? [mockChecklist]),
    }
    const deleteChain = {
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(options?.deleteResult ?? [{ id: 'checklist-1' }]),
    }
    const mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce(selectChecklistChain)
        .mockReturnValueOnce(selectMembershipChain)
        .mockReturnValue(selectCountChain),
      update: vi.fn().mockReturnValue(updateChain),
      delete: vi.fn().mockReturnValue(deleteChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn((fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
    }
    return mockDb
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not audit when archive update is stale', async () => {
    const mockDb = createChecklistDb({ updateResult: [] })

    await expect(
      archiveChecklist(mockDb as unknown as Parameters<typeof archiveChecklist>[0], {
        checklistId: 'checklist-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('Checklist not found')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit when rename update is stale', async () => {
    const mockDb = createChecklistDb({ updateResult: [] })

    await expect(
      renameChecklist(mockDb as unknown as Parameters<typeof renameChecklist>[0], {
        checklistId: 'checklist-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        name: 'Updated checklist',
      }),
    ).rejects.toThrow('Checklist not found')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('renames a checklist without writing checklist names to audit metadata', async () => {
    const mockDb = createChecklistDb({
      updateResult: [{ ...mockChecklist, name: 'Updated checklist for Jane Patient' }],
    })

    await renameChecklist(mockDb as unknown as Parameters<typeof renameChecklist>[0], {
      checklistId: 'checklist-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
      name: 'Updated checklist for Jane Patient',
    })

    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'checklist.renamed',
        before: { nameChanged: false },
        after: { nameChanged: true },
      }),
    )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('Jane Patient')
  })

  it('does not audit when delete is stale', async () => {
    const mockDb = createChecklistDb({ deleteResult: [] })

    await expect(
      deleteChecklist(mockDb as unknown as Parameters<typeof deleteChecklist>[0], {
        checklistId: 'checklist-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('Checklist not found')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not write checklist names to audit metadata when deleting', async () => {
    const mockDb = createChecklistDb()

    await deleteChecklist(mockDb as unknown as Parameters<typeof deleteChecklist>[0], {
      checklistId: 'checklist-1',
      tenantId: 'tenant-1',
      actorId: 'actor-1',
    })

    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'checklist.deleted',
        before: { status: 'active' },
      }),
    )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('Security checklist')
  })

  it('does not delete when an item is completed after the precheck', async () => {
    const selectChecklistChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockChecklist]),
    }
    const selectMembershipChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const precheckCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ cnt: 0 }]),
    }
    const transactionalCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ cnt: 1 }]),
    }
    const deleteChain = {
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'checklist-1' }]),
    }
    const mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce(selectChecklistChain)
        .mockReturnValueOnce(selectMembershipChain)
        .mockReturnValueOnce(precheckCountChain)
        .mockReturnValueOnce(transactionalCountChain),
      delete: vi.fn().mockReturnValue(deleteChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn((fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
    }

    await expect(
      deleteChecklist(mockDb as unknown as Parameters<typeof deleteChecklist>[0], {
        checklistId: 'checklist-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('This checklist has completed items and cannot be deleted')

    expect(mockDb.delete).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})
