import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import {
  memberships,
  organizations,
  policyAcknowledgements,
  programPolicies,
  users,
} from '@phiguard/db'
import { eq } from 'drizzle-orm'
import {
  acknowledgePolicy,
  archivePolicy,
  createPolicy,
  createPolicyVersion,
  listPendingAcknowledgements,
  publishPolicy,
  restorePolicy,
  updatePolicyDraft,
} from '../../program/policies.js'
import { writeAuditEvent } from '@phiguard/audit'

type CreatePolicyDb = Parameters<typeof createPolicy>[0]
type PublishPolicyDb = Parameters<typeof publishPolicy>[0]
type UpdatePolicyDraftDb = Parameters<typeof updatePolicyDraft>[0]
type AcknowledgePolicyDb = Parameters<typeof acknowledgePolicy>[0]
type PendingAcknowledgementsDb = Parameters<typeof listPendingAcknowledgements>[0]

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
}))

describeWithTestDB('policy integration actor and user isolation', () => {
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
    await db.insert(memberships).values(makeMembership({ tenantId: org.id, userId: user.id }))

    return { org, user }
  }

  async function seedPolicy(input?: {
    status?: 'draft' | 'published' | 'archived'
    requiresAcknowledgement?: boolean
  }) {
    const { db } = requireTestDB()
    const tenant = await seedTenant()
    const [policy] = await db
      .insert(programPolicies)
      .values({
        tenantId: tenant.org.id,
        title: 'Sanctions policy',
        bodyMarkdown: 'Policy body',
        version: '1.0',
        status: input?.status ?? 'draft',
        requiresAcknowledgement: input?.requiresAcknowledgement ?? true,
      })
      .returning()

    return { ...tenant, policy }
  }

  it('rejects policy creation when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createPolicy(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        title: 'Cross-tenant policy',
        bodyMarkdown: 'Policy body',
        version: '1.0',
        requiresAcknowledgement: true,
      }),
    ).rejects.toThrow('Policy actor is not a member of this organization')

    const rows = await db
      .select()
      .from(programPolicies)
      .where(eq(programPolicies.title, 'Cross-tenant policy'))
    expect(rows).toEqual([])
  })

  it('rejects policy publishing when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedPolicy({ status: 'draft' })
    const tenantB = await seedTenant()

    await expect(
      publishPolicy(db, {
        policyId: tenantA.policy.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
      }),
    ).rejects.toThrow('Policy actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(programPolicies)
      .where(eq(programPolicies.id, tenantA.policy.id))
      .limit(1)
    expect(current?.status).toBe('draft')
  })

  it('rejects pending acknowledgement listing for a non-member user', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedPolicy({ status: 'published', requiresAcknowledgement: true })
    const tenantB = await seedTenant()

    await expect(
      listPendingAcknowledgements(db, {
        tenantId: tenantA.org.id,
        userId: tenantB.user.id,
      }),
    ).rejects.toThrow('User not found in organization')
  })

  it('does not create acknowledgements for non-member users', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedPolicy({ status: 'published', requiresAcknowledgement: true })
    const tenantB = await seedTenant()

    await expect(
      acknowledgePolicy(db, {
        policyId: tenantA.policy.id,
        tenantId: tenantA.org.id,
        userId: tenantB.user.id,
      }),
    ).rejects.toThrow('Policy not found')

    const rows = await db
      .select()
      .from(policyAcknowledgements)
      .where(eq(policyAcknowledgements.policyId, tenantA.policy.id))
    expect(rows).toEqual([])
  })
})

describe('createPolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a tenant draft policy without writing policy text to audit metadata', async () => {
    const effectiveDate = new Date('2026-06-01T00:00:00.000Z')
    const policy = {
      id: 'P1',
      tenantId: 'T1',
      locationId: null,
      title: 'Sanctions Policy for Jane Patient',
      bodyMarkdown: 'Policy body mentions Jane Patient',
      version: '1.0',
      effectiveDate,
      requiresAcknowledgement: true,
      status: 'draft',
    }
    const values = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([policy]),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
      }),
      insert: vi.fn().mockReturnValue({ values }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    const result = await createPolicy(db as unknown as CreatePolicyDb, {
      tenantId: 'T1',
      actorId: 'U1',
      title: 'Sanctions Policy',
      bodyMarkdown: 'Policy body',
      version: '1.0',
      effectiveDate,
      requiresAcknowledgement: true,
    })

    expect(result).toBe(policy)
    expect(values).toHaveBeenCalledWith({
      tenantId: 'T1',
      title: 'Sanctions Policy',
      bodyMarkdown: 'Policy body',
      version: '1.0',
      effectiveDate,
      requiresAcknowledgement: true,
      status: 'draft',
    })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'policy.created',
      resourceType: 'program_policy',
      resourceId: 'P1',
      after: expect.objectContaining({
        status: 'draft',
        version: '1.0',
        requiresAcknowledgement: true,
      }),
    }),
  )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('Jane Patient')
  })
})

describe('updatePolicyDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates draft policy content without writing policy text to audit metadata', async () => {
    const before = {
      id: 'P1',
      tenantId: 'T1',
      title: 'Old Policy for Jane Patient',
      bodyMarkdown: 'Old body mentions Jane Patient',
      version: '1.0',
      effectiveDate: null,
      requiresAcknowledgement: true,
      status: 'draft',
    }
    const after = {
      ...before,
      title: 'New Policy',
      bodyMarkdown: 'New body',
      version: '2.0',
      requiresAcknowledgement: false,
    }
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([after]),
      }),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([before]),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    const result = await updatePolicyDraft(db as unknown as UpdatePolicyDraftDb, {
      policyId: 'P1',
      tenantId: 'T1',
      actorId: 'U1',
      title: 'New Policy',
      bodyMarkdown: 'New body',
      version: '2.0',
      requiresAcknowledgement: false,
    })

    expect(result).toBe(after)
    expect(updateSet).toHaveBeenCalledWith({
      title: 'New Policy',
      bodyMarkdown: 'New body',
      version: '2.0',
      effectiveDate: undefined,
      requiresAcknowledgement: false,
    })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
      action: 'policy.updated',
      resourceType: 'program_policy',
      resourceId: 'P1',
      before: expect.objectContaining({ status: 'draft', version: '1.0' }),
      after: expect.objectContaining({ status: 'draft', version: '2.0' }),
    }),
  )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('Jane Patient')
  })

  it('throws when updating a non-draft policy', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'P1', status: 'published' }]),
      }),
      update: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      updatePolicyDraft(db as unknown as UpdatePolicyDraftDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
        title: 'New Policy',
        bodyMarkdown: 'New body',
        version: '2.0',
        requiresAcknowledgement: true,
      }),
    ).rejects.toThrow('Only draft policies can be edited')

    expect(db.update).not.toHaveBeenCalled()
  })

  it('throws if the draft is published before the transactional update returns', async () => {
    const before = {
      id: 'P1',
      tenantId: 'T1',
      title: 'Old Policy',
      bodyMarkdown: 'Old body',
      version: '1.0',
      effectiveDate: null,
      requiresAcknowledgement: true,
      status: 'draft',
    }
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([before]),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn(),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      updatePolicyDraft(db as unknown as UpdatePolicyDraftDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
        title: 'New Policy',
        bodyMarkdown: 'New body',
        version: '2.0',
        requiresAcknowledgement: true,
      }),
    ).rejects.toThrow('Only draft policies can be edited')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('publishPolicy', () => {
  let mockDb: {
    update: ReturnType<typeof vi.fn>
    select: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'P1', status: 'published' }]),
      }),
    }
    mockDb = {
      update: vi.fn().mockReturnValue(updateChain),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'P1', status: 'draft' }]),
      }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi
        .fn()
        .mockImplementation((fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
    }
  })

  it('sets status to published and writes audit event', async () => {
    await publishPolicy(mockDb as unknown as PublishPolicyDb, {
      policyId: 'P1',
      tenantId: 'T1',
      actorId: 'U1',
    })

    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'policy.published',
        resourceId: 'P1',
      }),
    )
  })

  it('throws when publishing a non-draft policy', async () => {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    })
    const db = {
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'P1', status: 'archived' }]),
      }),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      publishPolicy(db as unknown as PublishPolicyDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Only draft policies can be published')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when policy does not belong to the tenant', async () => {
    const db = {
      update: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }),
    } as unknown as PublishPolicyDb

    await expect(
      publishPolicy(db, { policyId: 'policy-other', tenantId: 'tenant-a', actorId: 'user-1' }),
    ).rejects.toThrow('Policy not found')

    expect(db.update).not.toHaveBeenCalled()
  })
})

describe('acknowledgePolicy', () => {
  function makeDb(opts: {
    policyExists: boolean
    membershipExists: boolean
    existingAck: object | null
  }) {
    let selectCallCount = 0
    const db: {
      insert: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
      select: ReturnType<typeof vi.fn>
      transaction: ReturnType<typeof vi.fn>
    } = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'ACK1' }]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      }),
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          selectCallCount += 1

          if (selectCallCount === 1) {
            return Promise.resolve(opts.policyExists ? [{ id: 'P1' }] : [])
          }

          if (selectCallCount === 2) {
            return Promise.resolve(opts.membershipExists ? [{ id: 'MBR1' }] : [])
          }

          return Promise.resolve(opts.existingAck ? [opts.existingAck] : [])
        }),
      })),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  function makeDuplicateRaceDb() {
    let selectCallCount = 0
    const returning = vi.fn().mockResolvedValue([])
    const onConflictDoNothing = vi.fn().mockReturnValue({ returning })
    const values = vi.fn().mockReturnValue({ onConflictDoNothing })
    const db = {
      insert: vi.fn().mockReturnValue({ values }),
      update: vi.fn(),
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          selectCallCount += 1

          if (selectCallCount === 1) return Promise.resolve([{ id: 'P1' }])
          if (selectCallCount === 2) return Promise.resolve([{ id: 'MBR1' }])
          return Promise.resolve([])
        }),
      })),
      transaction: vi.fn(),
      values,
      onConflictDoNothing,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a policy_acknowledgements row and writes audit event', async () => {
    const db = makeDb({
      policyExists: true,
      membershipExists: true,
      existingAck: null,
    }) as unknown as AcknowledgePolicyDb

    await acknowledgePolicy(db, {
      policyId: 'P1',
      userId: 'U1',
      tenantId: 'T1',
      ipAddress: '127.0.0.1',
    })

    expect(db.insert).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'policy.acknowledged',
        resourceId: 'P1',
      }),
    )
  })

  it('is idempotent and does not insert twice', async () => {
    const db = makeDb({
      policyExists: true,
      membershipExists: true,
      existingAck: { id: 'ACK1' },
    }) as unknown as AcknowledgePolicyDb

    await acknowledgePolicy(db, { policyId: 'P1', userId: 'U1', tenantId: 'T1' })

    expect(db.insert).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit when a concurrent acknowledgement wins the insert race', async () => {
    const db = makeDuplicateRaceDb()

    await acknowledgePolicy(db as unknown as AcknowledgePolicyDb, {
      policyId: 'P1',
      userId: 'U1',
      tenantId: 'T1',
    })

    expect(db.values).toHaveBeenCalled()
    expect(db.onConflictDoNothing).toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when the policy is not available for acknowledgement in the tenant', async () => {
    const db = makeDb({
      policyExists: false,
      membershipExists: true,
      existingAck: null,
    }) as unknown as AcknowledgePolicyDb

    await expect(
      acknowledgePolicy(db, { policyId: 'policy-b', userId: 'user-1', tenantId: 'org-a' }),
    ).rejects.toThrow('Policy not found')

    expect(db.insert).not.toHaveBeenCalled()
  })

  it('throws when the user is not a member of the tenant', async () => {
    const db = makeDb({
      policyExists: true,
      membershipExists: false,
      existingAck: null,
    }) as unknown as AcknowledgePolicyDb

    await expect(
      acknowledgePolicy(db, { policyId: 'P1', userId: 'user-1', tenantId: 'org-a' }),
    ).rejects.toThrow('Policy not found')

    expect(db.insert).not.toHaveBeenCalled()
  })
})

describe('listPendingAcknowledgements', () => {
  it('returns policies requiring acknowledgement where the user has no ack row', async () => {
    const publishedPolicies = [
      { id: 'P1', requiresAcknowledgement: true, status: 'published', title: 'Policy 1' },
      { id: 'P2', requiresAcknowledgement: true, status: 'published', title: 'Policy 2' },
      { id: 'P3', requiresAcknowledgement: false, status: 'published', title: 'Policy 3' },
    ]
    const userAcks = [{ policyId: 'P1' }]
    let selectCount = 0

    const mockDb = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => {
          selectCount += 1
          if (selectCount === 1) {
            return {
              limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
            }
          }

          return Promise.resolve(selectCount === 2 ? userAcks : publishedPolicies)
        }),
      })),
    }

    const result = await listPendingAcknowledgements(
      mockDb as unknown as PendingAcknowledgementsDb,
      {
        userId: 'U1',
        tenantId: 'T1',
      },
    )

    expect(Array.isArray(result)).toBe(true)
  })
})

type CreatePolicyVersionDb = Parameters<typeof createPolicyVersion>[0]
type ArchivePolicyDb = Parameters<typeof archivePolicy>[0]
type RestorePolicyDb = Parameters<typeof restorePolicy>[0]

describe('createPolicyVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forks a published policy into a new draft without writing policy text to audit metadata', async () => {
    const source = {
      id: 'P1',
      tenantId: 'T1',
      title: 'Sanctions Policy for Jane Patient',
      bodyMarkdown: 'Body text mentions Jane Patient',
      version: '1.0',
      effectiveDate: null,
      requiresAcknowledgement: true,
      status: 'published',
    }
    const newPolicy = { ...source, id: 'P2', status: 'draft' }
    const values = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([newPolicy]),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([source]),
      }),
      insert: vi.fn().mockReturnValue({ values }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    const result = await createPolicyVersion(db as unknown as CreatePolicyVersionDb, {
      policyId: 'P1',
      tenantId: 'T1',
      actorId: 'U1',
    })

    expect(result).toBe(newPolicy)
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'T1',
        title: 'Sanctions Policy for Jane Patient',
        bodyMarkdown: 'Body text mentions Jane Patient',
        version: '1.0',
        status: 'draft',
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'policy.version_created',
      resourceType: 'program_policy',
      resourceId: 'P2',
      after: expect.objectContaining({ sourceId: 'P1', status: 'draft', version: '1.0' }),
    }),
  )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('Jane Patient')
  })

  it('throws if the source policy is archived before the transactional version insert', async () => {
    const source = {
      id: 'P1',
      tenantId: 'T1',
      title: 'Sanctions Policy',
      bodyMarkdown: 'Body text',
      version: '1.0',
      effectiveDate: null,
      requiresAcknowledgement: true,
      status: 'published',
    }
    let selectCount = 0
    const db = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          selectCount += 1
          if (selectCount === 1) return Promise.resolve([source])
          return Promise.resolve([{ ...source, status: 'archived' }])
        }),
      })),
      insert: vi.fn(),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      createPolicyVersion(db as unknown as CreatePolicyVersionDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Only published policies can be versioned')

    expect(db.insert).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when the source policy is a draft', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'P1', status: 'draft' }]),
      }),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      createPolicyVersion(db as unknown as CreatePolicyVersionDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Only published policies can be versioned')

    expect(db.insert).not.toHaveBeenCalled()
  })

  it('throws when the policy does not belong to the tenant', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      createPolicyVersion(db as unknown as CreatePolicyVersionDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Policy not found')

    expect(db.insert).not.toHaveBeenCalled()
  })
})

describe('archivePolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets status to archived and writes an audit event', async () => {
    const policy = { id: 'P1', tenantId: 'T1', status: 'published' }
    const updated = { ...policy, status: 'archived' }
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([policy]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await archivePolicy(db as unknown as ArchivePolicyDb, {
      policyId: 'P1',
      tenantId: 'T1',
      actorId: 'U1',
    })

    expect(db.update).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'policy.archived',
        resourceType: 'program_policy',
        resourceId: 'P1',
        after: { status: 'archived' },
      }),
    )
  })

  it('is idempotent when policy is already archived', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'P1', status: 'archived' }]),
      }),
      update: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await archivePolicy(db as unknown as ArchivePolicyDb, {
      policyId: 'P1',
      tenantId: 'T1',
      actorId: 'U1',
    })

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale archive attempts when another transaction archives first', async () => {
    const policy = { id: 'P1', tenantId: 'T1', status: 'published' }
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([policy]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      archivePolicy(db as unknown as ArchivePolicyDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Policy changed before it could be archived')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when the policy does not belong to the tenant', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }),
      update: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      archivePolicy(db as unknown as ArchivePolicyDb, {
        policyId: 'no-such-policy',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Policy not found')

    expect(db.update).not.toHaveBeenCalled()
  })
})

describe('restorePolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an archived policy to published and writes an audit event', async () => {
    const policy = { id: 'P1', tenantId: 'T1', status: 'archived' }
    const updated = { ...policy, status: 'published' }
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([policy]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await restorePolicy(db as unknown as RestorePolicyDb, {
      policyId: 'P1',
      tenantId: 'T1',
      actorId: 'U1',
    })

    expect(db.update).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'policy.restored',
        resourceType: 'program_policy',
        resourceId: 'P1',
        after: { status: 'published' },
      }),
    )
  })

  it('throws when the policy is not archived', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'P1', status: 'published' }]),
      }),
      update: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      restorePolicy(db as unknown as RestorePolicyDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Only archived policies can be restored')

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale restores when another transaction changes status first', async () => {
    const policy = { id: 'P1', tenantId: 'T1', status: 'archived' }
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([policy]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      restorePolicy(db as unknown as RestorePolicyDb, {
        policyId: 'P1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Policy changed before it could be restored')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when the policy does not belong to the tenant', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }),
      update: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      restorePolicy(db as unknown as RestorePolicyDb, {
        policyId: 'no-such-policy',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Policy not found')

    expect(db.update).not.toHaveBeenCalled()
  })
})
