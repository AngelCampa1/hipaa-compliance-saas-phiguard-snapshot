import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { writeAuditEvent } from '@phiguard/audit'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import { locations, memberships, organizations, users } from '@phiguard/db'
import { and, eq } from 'drizzle-orm'
import {
  assignChecklistTemplateToLocations,
  assignPolicyToLocations,
  completePolicyAssignment,
  listPolicyAssignments,
  reopenPolicyAssignment,
} from '../assignments.js'
import { checklistTemplates } from '../schema/checklist-templates.js'
import { checklistItems } from '../schema/checklist-items.phi.js'
import { checklists } from '../schema/checklists.js'
import { policies } from '../schema/policies.js'
import { policyAssignments } from '../schema/policy-assignments.js'

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

type ChecklistAssignmentMockDb = {
  select: ReturnType<typeof vi.fn>
  transaction: ReturnType<typeof vi.fn>
}

type PolicyStatusMockDb = {
  select: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  transaction: ReturnType<typeof vi.fn>
}

type PolicyListMockDb = {
  select: ReturnType<typeof vi.fn>
}

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

const accessReviewCreatedItems = [
  {
    id: 'item-1',
    checklistId: 'checklist-1',
    tenantId: 'tenant-1',
    locationId: 'location-1',
    title: 'Review active user accounts and access levels',
    status: 'pending',
  },
  {
    id: 'item-2',
    checklistId: 'checklist-1',
    tenantId: 'tenant-1',
    locationId: 'location-1',
    title: 'Remove access for terminated workforce members',
    status: 'pending',
  },
  {
    id: 'item-3',
    checklistId: 'checklist-1',
    tenantId: 'tenant-1',
    locationId: 'location-1',
    title: 'Review administrator and owner privileges',
    status: 'pending',
  },
]

describeWithTestDB('assignment integration tenant isolation', () => {
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

  async function seedAccessReviewTemplate() {
    const { db } = requireTestDB()
    await db
      .insert(checklistTemplates)
      .values({
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Access Review',
        description: 'Access review starter checklist',
        isBuiltIn: true,
      })
      .onConflictDoNothing()
  }

  it('rejects checklist template assignment to locations outside the tenant', async () => {
    const { db } = requireTestDB()
    await seedAccessReviewTemplate()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      assignChecklistTemplateToLocations(db, {
        tenantId: tenantA.org.id,
        templateId: '11111111-1111-4111-8111-111111111111',
        locationIds: [tenantB.location.id],
        actorId: tenantA.user.id,
      }),
    ).rejects.toThrow('Location not found or tenant mismatch')

    const createdChecklists = await db
      .select()
      .from(checklists)
      .where(
        and(
          eq(checklists.tenantId, tenantA.org.id),
          eq(checklists.locationId, tenantB.location.id),
        ),
      )
    expect(createdChecklists).toEqual([])

    const createdItems = await db
      .select()
      .from(checklistItems)
      .where(
        and(
          eq(checklistItems.tenantId, tenantA.org.id),
          eq(checklistItems.locationId, tenantB.location.id),
        ),
      )
    expect(createdItems).toEqual([])
  })

  it('rejects policy assignment to locations outside the tenant', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()
    const [policy] = await db
      .insert(policies)
      .values({
        tenantId: tenantA.org.id,
        title: 'Workstation Security',
        body: 'Policy body',
        version: '1.0',
      })
      .returning()

    await expect(
      assignPolicyToLocations(db, {
        tenantId: tenantA.org.id,
        policyId: policy.id,
        locationIds: [tenantB.location.id],
        actorId: tenantA.user.id,
      }),
    ).rejects.toThrow('Location not found or tenant mismatch')

    const createdAssignments = await db
      .select()
      .from(policyAssignments)
      .where(
        and(
          eq(policyAssignments.tenantId, tenantA.org.id),
          eq(policyAssignments.locationId, tenantB.location.id),
        ),
      )

    expect(createdAssignments).toEqual([])
  })
})

describe('assignChecklistTemplateToLocations', () => {
  let mockDb: ChecklistAssignmentMockDb

  beforeEach(() => {
    vi.clearAllMocks()

    mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([
            {
              id: '11111111-1111-4111-8111-111111111111',
              name: 'Access Review',
            },
          ]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ id: 'location-1' }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      transaction: vi.fn(async (fn) =>
        fn({
          insert: vi
            .fn()
            .mockReturnValueOnce({
              values: vi.fn().mockReturnThis(),
              returning: vi.fn().mockResolvedValue([
                {
                  id: 'checklist-1',
                  tenantId: 'tenant-1',
                  locationId: 'location-1',
                  templateId: '11111111-1111-4111-8111-111111111111',
                  name: 'Access Review',
                  status: 'active',
                },
              ]),
            })
            .mockReturnValueOnce({
              values: vi.fn().mockReturnThis(),
              returning: vi.fn().mockResolvedValue(accessReviewCreatedItems),
            }),
        }),
      ),
    }
  })

  it('creates missing checklists and writes audit events', async () => {
    const result = await assignChecklistTemplateToLocations(
      mockDb as unknown as Parameters<typeof assignChecklistTemplateToLocations>[0],
      {
        tenantId: 'tenant-1',
        templateId: '11111111-1111-4111-8111-111111111111',
        locationIds: ['location-1'],
        actorId: 'user-1',
      },
    )

    expect(result.created).toHaveLength(1)
    expect(writeAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'checklist.assigned',
        resourceType: 'checklist',
        locationId: 'location-1',
      }),
    )
  })

  it('rejects checklist assignment before the empty-location shortcut when the actor is not a tenant member', async () => {
    mockDb.select = vi.fn().mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    })

    await expect(
      assignChecklistTemplateToLocations(
        mockDb as unknown as Parameters<typeof assignChecklistTemplateToLocations>[0],
        {
          tenantId: 'tenant-1',
          templateId: '11111111-1111-4111-8111-111111111111',
          locationIds: [],
          actorId: 'other-user',
        },
      ),
    ).rejects.toThrow('Assignment actor is not a member of this organization')

    expect(mockDb.select).toHaveBeenCalledOnce()
    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('writes audit events for checklist items created from the starter template', async () => {
    mockDb.transaction = vi.fn(async (fn) => {
      const checklist = {
        id: 'checklist-1',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        templateId: '11111111-1111-4111-8111-111111111111',
        name: 'Access Review',
        status: 'active',
      }

      return fn({
        insert: vi
          .fn()
          .mockReturnValueOnce({
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([checklist]),
          })
          .mockReturnValueOnce({
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue(accessReviewCreatedItems),
          }),
      })
    })

    await assignChecklistTemplateToLocations(
      mockDb as unknown as Parameters<typeof assignChecklistTemplateToLocations>[0],
      {
        tenantId: 'tenant-1',
        templateId: '11111111-1111-4111-8111-111111111111',
        locationIds: ['location-1'],
        actorId: 'user-1',
      },
    )

    const itemAuditEvents = vi
      .mocked(writeAuditEvent)
      .mock.calls.map(([, event]) => event)
      .filter((event) => event.action === 'checklist_item.create')

    expect(itemAuditEvents).toEqual([
      expect.objectContaining({
        tenantId: 'tenant-1',
        locationId: 'location-1',
        actorId: 'user-1',
        action: 'checklist_item.create',
        resourceType: 'checklist_item',
        resourceId: 'item-1',
        after: expect.objectContaining({
          checklistId: 'checklist-1',
          status: 'pending',
          title: 'Review active user accounts and access levels',
        }),
      }),
      expect.objectContaining({
        resourceId: 'item-2',
        after: expect.objectContaining({
          checklistId: 'checklist-1',
          status: 'pending',
          title: 'Remove access for terminated workforce members',
        }),
      }),
      expect.objectContaining({
        resourceId: 'item-3',
        after: expect.objectContaining({
          checklistId: 'checklist-1',
          status: 'pending',
          title: 'Review administrator and owner privileges',
        }),
      }),
    ])
  })

  it('treats legacy starter template ids as the same checklist family', async () => {
    mockDb.select = vi
      .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([
            {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Access Review',
            },
          ]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ id: 'location-1' }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            locationId: 'location-1',
            checklistId: 'legacy-checklist-1',
          },
        ]),
      })

    const result = await assignChecklistTemplateToLocations(
      mockDb as unknown as Parameters<typeof assignChecklistTemplateToLocations>[0],
      {
        tenantId: 'tenant-1',
        templateId: '11111111-1111-4111-8111-111111111111',
        locationIds: ['location-1'],
        actorId: 'user-1',
      },
    )

    expect(result.created).toHaveLength(0)
    expect(result.skippedLocationIds).toEqual(['location-1'])
    expect(mockDb.transaction).not.toHaveBeenCalled()
  })

  it('uses the persisted legacy template id when upgrading an existing database', async () => {
    mockDb.select = vi
      .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([
            {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Access Review',
            },
          ]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ id: 'location-1' }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      })

    const insertChecklistValues = vi.fn().mockReturnThis()
    const insertChecklistReturning = vi.fn().mockResolvedValue([
      {
        id: 'checklist-1',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        templateId: '00000000-0000-0000-0000-000000000001',
        name: 'Access Review',
        status: 'active',
      },
    ])
    const insertChecklistItemsValues = vi.fn().mockReturnThis()
    const insertChecklistItemsReturning = vi.fn().mockResolvedValue([accessReviewCreatedItems[0]])

    mockDb.transaction = vi.fn(async (fn) =>
      fn({
        insert: vi
          .fn()
          .mockReturnValueOnce({
            values: insertChecklistValues,
            returning: insertChecklistReturning,
          })
          .mockReturnValueOnce({
            values: insertChecklistItemsValues,
            returning: insertChecklistItemsReturning,
          }),
      }),
    )

    await assignChecklistTemplateToLocations(
      mockDb as unknown as Parameters<typeof assignChecklistTemplateToLocations>[0],
      {
        tenantId: 'tenant-1',
        templateId: '11111111-1111-4111-8111-111111111111',
        locationIds: ['location-1'],
        actorId: 'user-1',
      },
    )

    expect(insertChecklistValues).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: '00000000-0000-0000-0000-000000000001',
        name: 'Access Review',
      }),
    )
  })
})

describe('assignPolicyToLocations', () => {
  let mockDb: ChecklistAssignmentMockDb

  beforeEach(() => {
    vi.clearAllMocks()

    mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([
            {
              id: 'policy-1',
              tenantId: 'tenant-1',
              title: 'Workstation Security',
            },
          ]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ id: 'location-1' }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      transaction: vi.fn(async (fn) =>
        fn({
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnThis(),
            onConflictDoNothing: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([
              {
                id: 'assignment-1',
                tenantId: 'tenant-1',
                policyId: 'policy-1',
                locationId: 'location-1',
                status: 'assigned',
              },
            ]),
          }),
        }),
      ),
    }
  })

  it('creates missing policy assignments and writes audit events', async () => {
    const result = await assignPolicyToLocations(
      mockDb as unknown as Parameters<typeof assignPolicyToLocations>[0],
      {
        tenantId: 'tenant-1',
        policyId: 'policy-1',
        locationIds: ['location-1'],
        actorId: 'user-1',
      },
    )

    expect(result.created).toHaveLength(1)
    expect(writeAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'policy.assigned',
        resourceType: 'policy_assignment',
        locationId: 'location-1',
      }),
    )
  })

  it('does not audit when a concurrent policy assignment wins the insert race', async () => {
    const returning = vi.fn().mockResolvedValue([])
    const onConflictDoNothing = vi.fn().mockReturnValue({ returning })
    const values = vi.fn().mockReturnValue({ onConflictDoNothing })
    mockDb.transaction = vi.fn(async (fn) =>
      fn({
        insert: vi.fn().mockReturnValue({ values }),
      }),
    )

    const result = await assignPolicyToLocations(
      mockDb as unknown as Parameters<typeof assignPolicyToLocations>[0],
      {
        tenantId: 'tenant-1',
        policyId: 'policy-1',
        locationIds: ['location-1'],
        actorId: 'user-1',
      },
    )

    expect(onConflictDoNothing).toHaveBeenCalled()
    expect(result.created).toEqual([])
    expect(result.skippedLocationIds).toEqual(['location-1'])
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('rejects policy assignment when the actor is not a tenant member', async () => {
    mockDb.select = vi
      .fn()
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      })

    await expect(
      assignPolicyToLocations(
        mockDb as unknown as Parameters<typeof assignPolicyToLocations>[0],
        {
          tenantId: 'tenant-1',
          policyId: 'policy-1',
          locationIds: ['location-1'],
          actorId: 'other-user',
        },
      ),
    ).rejects.toThrow('Assignment actor is not a member of this organization')

    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('rejects policy assignment before policy lookup when the actor is not a tenant member', async () => {
    mockDb.select = vi.fn().mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    })

    await expect(
      assignPolicyToLocations(
        mockDb as unknown as Parameters<typeof assignPolicyToLocations>[0],
        {
          tenantId: 'tenant-1',
          policyId: 'policy-1',
          locationIds: [],
          actorId: 'other-user',
        },
      ),
    ).rejects.toThrow('Assignment actor is not a member of this organization')

    expect(mockDb.select).toHaveBeenCalledOnce()
    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('policy assignment status transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function makePolicyStatusDb(current: { status: string }, updateReturns = true) {
    const row = {
      id: 'assignment-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      ...current,
    }
    const updateSet = vi.fn((updates) => ({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue(updateReturns ? [{ ...row, ...updates }] : []),
      }),
    }))
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([row]),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      transaction: vi.fn((fn: (tx: PolicyStatusMockDb) => Promise<unknown>) => fn(mockDb)),
      updateSet,
    }

    return mockDb
  }

  it('marks a policy assignment complete', async () => {
    const current = {
      id: 'assignment-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      status: 'assigned',
    }
    const updated = { ...current, status: 'completed' }

    const mockDb: PolicyStatusMockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([current]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updated]),
      }),
      transaction: vi.fn((fn: (tx: PolicyStatusMockDb) => Promise<unknown>) => fn(mockDb)),
    }

    const result = await completePolicyAssignment(
      mockDb as unknown as Parameters<typeof completePolicyAssignment>[0],
      {
        tenantId: 'tenant-1',
        assignmentId: 'assignment-1',
        actorId: 'user-1',
      },
    )

    expect(result.status).toBe('completed')
    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({ action: 'policy.completed' }),
    )
  })

  it('does not audit stale completions when the update matches no rows', async () => {
    const mockDb = makePolicyStatusDb({ status: 'assigned' }, false)

    await expect(
      completePolicyAssignment(
        mockDb as unknown as Parameters<typeof completePolicyAssignment>[0],
        {
          tenantId: 'tenant-1',
          assignmentId: 'assignment-1',
          actorId: 'user-1',
        },
      ),
    ).rejects.toThrow('Policy assignment changed before completion could be saved')

    expect(mockDb.updateSet).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }))
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('rejects policy assignment completion when the actor is not a tenant member', async () => {
    const current = {
      id: 'assignment-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      status: 'assigned',
    }
    const mockDb: PolicyStatusMockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([current]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        }),
      update: vi.fn(),
      transaction: vi.fn((fn: (tx: PolicyStatusMockDb) => Promise<unknown>) => fn(mockDb)),
    }

    await expect(
      completePolicyAssignment(
        mockDb as unknown as Parameters<typeof completePolicyAssignment>[0],
        {
          tenantId: 'tenant-1',
          assignmentId: 'assignment-1',
          actorId: 'other-user',
        },
      ),
    ).rejects.toThrow('Assignment actor is not a member of this organization')

    expect(mockDb.update).not.toHaveBeenCalled()
    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('reopens a completed policy assignment', async () => {
    const current = {
      id: 'assignment-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      status: 'completed',
    }
    const updated = { ...current, status: 'assigned' }

    const mockDb: PolicyStatusMockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([current]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updated]),
      }),
      transaction: vi.fn((fn: (tx: PolicyStatusMockDb) => Promise<unknown>) => fn(mockDb)),
    }

    const result = await reopenPolicyAssignment(
      mockDb as unknown as Parameters<typeof reopenPolicyAssignment>[0],
      {
        tenantId: 'tenant-1',
        assignmentId: 'assignment-1',
        actorId: 'user-1',
      },
    )

    expect(result.status).toBe('assigned')
    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({ action: 'policy.reopened' }),
    )
  })

  it('does not audit stale reopens when the update matches no rows', async () => {
    const mockDb = makePolicyStatusDb({ status: 'completed' }, false)

    await expect(
      reopenPolicyAssignment(
        mockDb as unknown as Parameters<typeof reopenPolicyAssignment>[0],
        {
          tenantId: 'tenant-1',
          assignmentId: 'assignment-1',
          actorId: 'user-1',
        },
      ),
    ).rejects.toThrow('Policy assignment changed before it could be reopened')

    expect(mockDb.updateSet).toHaveBeenCalledWith({
      status: 'assigned',
      completedAt: null,
      completedBy: null,
    })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('rejects policy assignment reopen when the actor is not a tenant member', async () => {
    const current = {
      id: 'assignment-1',
      tenantId: 'tenant-1',
      locationId: 'location-1',
      status: 'completed',
    }
    const mockDb: PolicyStatusMockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([current]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        }),
      update: vi.fn(),
      transaction: vi.fn((fn: (tx: PolicyStatusMockDb) => Promise<unknown>) => fn(mockDb)),
    }

    await expect(
      reopenPolicyAssignment(
        mockDb as unknown as Parameters<typeof reopenPolicyAssignment>[0],
        {
          tenantId: 'tenant-1',
          assignmentId: 'assignment-1',
          actorId: 'other-user',
        },
      ),
    ).rejects.toThrow('Assignment actor is not a member of this organization')

    expect(mockDb.update).not.toHaveBeenCalled()
    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('listPolicyAssignments', () => {
  it('returns no rows without querying when no locations are visible', async () => {
    const mockDb: PolicyListMockDb = {
      select: vi.fn(),
    }

    const result = await listPolicyAssignments(
      mockDb as unknown as Parameters<typeof listPolicyAssignments>[0],
      {
        tenantId: 'tenant-1',
        locationIds: [],
      },
    )

    expect(result).toEqual([])
    expect(mockDb.select).not.toHaveBeenCalled()
  })

  it('lists visible policy assignments newest first', async () => {
    const rows = [
      {
        id: 'assignment-2',
        tenantId: 'tenant-1',
        policyId: 'policy-1',
        locationId: 'location-2',
        status: 'assigned',
      },
      {
        id: 'assignment-1',
        tenantId: 'tenant-1',
        policyId: 'policy-1',
        locationId: 'location-1',
        status: 'completed',
      },
    ]
    const orderBy = vi.fn().mockResolvedValue(rows)
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    const mockDb: PolicyListMockDb = {
      select: vi.fn().mockReturnValue({ from }),
    }

    const result = await listPolicyAssignments(
      mockDb as unknown as Parameters<typeof listPolicyAssignments>[0],
      {
        tenantId: 'tenant-1',
        locationIds: ['location-1', 'location-2'],
        policyId: 'policy-1',
      },
    )

    expect(result).toEqual(rows)
    expect(where).toHaveBeenCalledTimes(1)
    expect(orderBy).toHaveBeenCalledTimes(1)
  })
})
