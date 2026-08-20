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
  users,
  vendorBaas,
  vendors as vendorRows,
} from '@phiguard/db'
import { eq } from 'drizzle-orm'
import {
  createVendor,
  getVendorBaaState,
  listExpired,
  listExpiringSoon,
  markVendorInactive,
  reactivateVendor,
  recordBaa,
  updateLatestVendorBaa,
  updateVendor,
  selectLatestBaasByVendor,
} from '../../program/vendors.js'
import { writeAuditEvent } from '@phiguard/audit'
import { createTask } from '@phiguard/db/tasks'

type ListExpiringSoonDb = Parameters<typeof listExpiringSoon>[0]
type ListExpiredDb = Parameters<typeof listExpired>[0]
type CreateVendorDb = Parameters<typeof createVendor>[0]
type RecordBaaDb = Parameters<typeof recordBaa>[0]
type MarkVendorInactiveDb = Parameters<typeof markVendorInactive>[0]
type ReactivateVendorDb = Parameters<typeof reactivateVendor>[0]
type UpdateLatestVendorBaaDb = Parameters<typeof updateLatestVendorBaa>[0]
type UpdateVendorDb = Parameters<typeof updateVendor>[0]

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
}))

vi.mock('@phiguard/db/tasks', () => ({
  createTask: vi.fn().mockResolvedValue({ id: 'task-1' }),
}))

describeWithTestDB('vendor integration actor isolation', () => {
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

  async function seedVendor() {
    const { db } = requireTestDB()
    const tenant = await seedTenant()
    const [vendor] = await db
      .insert(vendorRows)
      .values({
        tenantId: tenant.org.id,
        name: 'Secure Docs',
        dataCategories: ['PHI'],
      })
      .returning()

    return { ...tenant, vendor }
  }

  async function seedVendorBaa() {
    const { db } = requireTestDB()
    const seeded = await seedVendor()
    const [baa] = await db
      .insert(vendorBaas)
      .values({
        vendorId: seeded.vendor.id,
        signedAt: new Date('2026-01-01T00:00:00.000Z'),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@example.com',
        expiresAt: new Date('2027-01-01T00:00:00.000Z'),
      })
      .returning()

    return { ...seeded, baa }
  }

  it('rejects vendor creation when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createVendor(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        name: 'Cross-tenant vendor',
        dataCategories: ['PHI'],
      }),
    ).rejects.toThrow('Vendor actor is not a member of this organization')

    const rows = await db
      .select()
      .from(vendorRows)
      .where(eq(vendorRows.name, 'Cross-tenant vendor'))
    expect(rows).toEqual([])
  })

  it('rejects BAA recording when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedVendor()
    const tenantB = await seedTenant()

    await expect(
      recordBaa(db, {
        vendorId: tenantA.vendor.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        signedAt: new Date('2026-01-01T00:00:00.000Z'),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@example.com',
      }),
    ).rejects.toThrow('Vendor actor is not a member of this organization')

    const rows = await db
      .select()
      .from(vendorBaas)
      .where(eq(vendorBaas.vendorId, tenantA.vendor.id))
    expect(rows).toEqual([])
  })

  it('rejects vendor updates when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedVendor()
    const tenantB = await seedTenant()

    await expect(
      updateVendor(db, {
        vendorId: tenantA.vendor.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        name: 'Updated Secure Docs',
      }),
    ).rejects.toThrow('Vendor actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(vendorRows)
      .where(eq(vendorRows.id, tenantA.vendor.id))
      .limit(1)
    expect(current?.name).toBe('Secure Docs')
  })

  it('rejects latest BAA updates when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedVendorBaa()
    const tenantB = await seedTenant()

    await expect(
      updateLatestVendorBaa(db, {
        vendorId: tenantA.vendor.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        signerName: 'Dr. Jones',
      }),
    ).rejects.toThrow('Vendor actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(vendorBaas)
      .where(eq(vendorBaas.id, tenantA.baa.id))
      .limit(1)
    expect(current?.signerName).toBe('Dr. Smith')
  })
})

describe('vendor BAA business rules', () => {
  it('selects the latest BAA per vendor from already ordered rows', () => {
    const current = {
      id: 'BAA-current',
      vendorId: 'V1',
      signedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const old = {
      id: 'BAA-old',
      vendorId: 'V1',
      signedAt: new Date('2025-01-01T00:00:00.000Z'),
    }
    const otherVendor = {
      id: 'BAA-other',
      vendorId: 'V2',
      signedAt: new Date('2026-01-15T00:00:00.000Z'),
    }

    expect(selectLatestBaasByVendor([current, old, otherVendor])).toEqual([current, otherVendor])
  })

  it('classifies BAA expiry state from a fixed clock', () => {
    const now = new Date('2026-05-20T00:00:00.000Z')

    expect(getVendorBaaState(null, { now })).toBe('missing')
    expect(getVendorBaaState({ expiresAt: null }, { now })).toBe('current')
    expect(getVendorBaaState({ expiresAt: '2026-05-19T00:00:00.000Z' }, { now })).toBe('expired')
    expect(getVendorBaaState({ expiresAt: '2026-06-15T00:00:00.000Z' }, { now })).toBe('expiring')
    expect(getVendorBaaState({ expiresAt: '2026-09-01T00:00:00.000Z' }, { now })).toBe('current')
  })
})

describe('listExpiringSoon', () => {
  it('returns BAAs expiring within the specified number of days for the given tenant', async () => {
    const expiringSoon = [
      {
        id: 'BAA1',
        vendorId: 'V1',
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@clinic.com',
      },
    ]
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(expiringSoon),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(mockSelectChain),
    }

    const result = await listExpiringSoon(mockDb as unknown as ListExpiringSoonDb, {
      tenantId: 'T1',
      withinDays: 60,
    })

    expect(result).toEqual(expiringSoon)
    expect(mockSelectChain.innerJoin).toHaveBeenCalled()
  })

  it('returns empty array when no BAAs are expiring', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(mockSelectChain),
    }

    const result = await listExpiringSoon(mockDb as unknown as ListExpiringSoonDb, {
      tenantId: 'T1',
      withinDays: 30,
    })

    expect(result).toEqual([])
  })

  it('ignores superseded BAA rows when the latest agreement is not expiring soon', async () => {
    const expiringOldAgreement = {
      id: 'BAA-old',
      vendorId: 'V1',
      signedAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    }
    const currentAgreement = {
      id: 'BAA-current',
      vendorId: 'V1',
      signedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([currentAgreement, expiringOldAgreement]),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(mockSelectChain),
    }

    const result = await listExpiringSoon(mockDb as unknown as ListExpiringSoonDb, {
      tenantId: 'T1',
      withinDays: 30,
    })

    expect(result).toEqual([])
  })
})

describe('listExpired', () => {
  it('returns latest BAAs that are already expired for the given tenant', async () => {
    const expiredAgreement = {
      id: 'BAA-expired',
      vendorId: 'V1',
      signedAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    }
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([expiredAgreement]),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(mockSelectChain),
    }

    const result = await listExpired(mockDb as unknown as ListExpiredDb, {
      tenantId: 'T1',
    })

    expect(result).toEqual([expiredAgreement])
    expect(mockSelectChain.innerJoin).toHaveBeenCalled()
  })

  it('ignores older expired BAA rows when the latest agreement is current', async () => {
    const expiredOldAgreement = {
      id: 'BAA-old',
      vendorId: 'V1',
      signedAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2025-12-31T00:00:00.000Z'),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    }
    const currentAgreement = {
      id: 'BAA-current',
      vendorId: 'V1',
      signedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([currentAgreement, expiredOldAgreement]),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(mockSelectChain),
    }

    const result = await listExpired(mockDb as unknown as ListExpiredDb, {
      tenantId: 'T1',
    })

    expect(result).toEqual([])
  })
})

describe('createVendor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a tenant vendor and writes an audit event atomically', async () => {
    const vendor = {
      id: 'V1',
      tenantId: 'T1',
      name: 'Jane Patient Vendor',
      website: 'https://secure.example',
      contactEmail: 'jane.patient@example.com',
      dataCategories: ['PHI', 'Jane Patient billing records'],
      status: 'active',
    }
    const insertValues = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([vendor]),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
      }),
      insert: vi.fn().mockReturnValue({ values: insertValues }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    const result = await createVendor(db as unknown as CreateVendorDb, {
      tenantId: 'T1',
      actorId: 'U1',
      name: 'Jane Patient Vendor',
      website: 'https://secure.example',
      contactEmail: 'jane.patient@example.com',
      dataCategories: ['PHI', 'Jane Patient billing records'],
    })

    expect(result).toBe(vendor)
    expect(insertValues).toHaveBeenCalledWith({
      tenantId: 'T1',
      name: 'Jane Patient Vendor',
      website: 'https://secure.example',
      contactEmail: 'jane.patient@example.com',
      dataCategories: ['PHI', 'Jane Patient billing records'],
    })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        tenantId: 'T1',
        actorId: 'U1',
        action: 'vendor.created',
        resourceType: 'vendor',
        resourceId: 'V1',
        after: expect.objectContaining({
          websiteProvided: true,
          contactEmailProvided: true,
          dataCategoryCount: 2,
          status: 'active',
        }),
      }),
    )
    const auditPayload = JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)
    expect(auditPayload).not.toContain('Jane Patient Vendor')
    expect(auditPayload).not.toContain('jane.patient@example.com')
    expect(auditPayload).not.toContain('Jane Patient billing records')
  })

  it('creates an obtain-BAA task when a task location is provided', async () => {
    const vendor = {
      id: 'V1',
      tenantId: 'T1',
      name: 'Secure Docs',
      website: null,
      contactEmail: null,
      dataCategories: ['PHI'],
      status: 'pending_baa',
    }
    const insertValues = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([vendor]),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'L1' }]),
      }),
      insert: vi.fn().mockReturnValue({ values: insertValues }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await createVendor(db as unknown as CreateVendorDb, {
      tenantId: 'T1',
      actorId: 'U1',
      name: 'Secure Docs',
      dataCategories: ['PHI'],
      baaTaskLocationId: 'L1',
    })

    expect(createTask).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        tenantId: 'T1',
        locationId: 'L1',
        title: 'Obtain BAA for Secure Docs',
        priority: 'high',
        createdBy: 'U1',
      }),
    )
  })

  it('rejects obtain-BAA task locations outside the tenant', async () => {
    const insertValues = vi.fn()
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const locationSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(membershipSelectChain)
        .mockReturnValue(locationSelectChain),
      insert: vi.fn().mockReturnValue({ values: insertValues }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      createVendor(db as unknown as CreateVendorDb, {
        tenantId: 'T1',
        actorId: 'U1',
        name: 'Secure Docs',
        dataCategories: ['PHI'],
        baaTaskLocationId: 'other-tenant-location',
      }),
    ).rejects.toThrow('Task location not found')

    expect(db.insert).not.toHaveBeenCalled()
    expect(createTask).not.toHaveBeenCalled()
  })
})

describe('recordBaa', () => {
  function makeRecordBaaDb(vendorExists: boolean, taskLocationExists = true) {
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    })
    const vendorSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(vendorExists ? [{ id: 'V1', name: 'Secure Docs' }] : []),
    }
    const locationSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(taskLocationExists ? [{ id: 'L1' }] : []),
    }
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(vendorSelectChain)
        .mockReturnValueOnce(membershipSelectChain)
        .mockReturnValue(locationSelectChain),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'BAA1',
              vendorId: 'V1',
              signedAt: new Date(),
              signerName: 'Dr. Smith',
              signerEmail: 'smith@clinic.com',
            },
          ]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: updateSet,
      }),
      updateSet,
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a vendor_baa row and writes audit event', async () => {
    const db = makeRecordBaaDb(true)

    const expiresAt = new Date('2027-01-01T00:00:00.000Z')
    const result = await recordBaa(db as unknown as RecordBaaDb, {
      vendorId: 'V1',
      tenantId: 'T1',
      actorId: 'U1',
      signedAt: new Date(),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      expiresAt,
      documentFileKey: 'evidence/T1/vendor-baas/V1/baa.pdf',
    })

    expect(db.insert).toHaveBeenCalled()
    expect(db.updateSet).toHaveBeenCalledWith({ status: 'active' })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'vendor.baa_recorded',
        resourceId: 'V1',
        after: expect.objectContaining({
          hasEvidence: true,
          expiresAt,
          status: 'active',
        }),
      }),
    )
    expect(vi.mocked(writeAuditEvent).mock.calls.join(' ')).not.toContain(
      'evidence/T1/vendor-baas/V1/baa.pdf',
    )
    expect(result).toBeDefined()
  })

  it('rejects BAA document keys outside the vendor storage prefix', async () => {
    const db = makeRecordBaaDb(true)

    await expect(
      recordBaa(db as unknown as RecordBaaDb, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
        signedAt: new Date(),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@clinic.com',
        documentFileKey: 'evidence/T1/vendor-baas/other-vendor/baa.pdf',
      }),
    ).rejects.toThrow('Invalid vendor BAA document key')

    expect(db.insert).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('creates a BAA renewal review task when an expiration date and location are provided', async () => {
    const db = makeRecordBaaDb(true) as unknown as RecordBaaDb
    const expiresAt = new Date('2027-01-31T00:00:00.000Z')

    await recordBaa(db, {
      vendorId: 'V1',
      tenantId: 'T1',
      actorId: 'U1',
      signedAt: new Date('2026-01-01T00:00:00.000Z'),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      expiresAt,
      renewalTaskLocationId: 'L1',
    })

    expect(createTask).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        tenantId: 'T1',
        locationId: 'L1',
        title: 'Review BAA renewal for Secure Docs',
        priority: 'medium',
        dueAt: new Date('2026-11-02T00:00:00.000Z'),
        createdBy: 'U1',
      }),
    )
  })

  it('does not create a renewal review task for an already-expired BAA', async () => {
    const db = makeRecordBaaDb(true) as unknown as RecordBaaDb

    await recordBaa(db, {
      vendorId: 'V1',
      tenantId: 'T1',
      actorId: 'U1',
      signedAt: new Date('2025-01-01T00:00:00.000Z'),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      expiresAt: new Date('2025-01-31T00:00:00.000Z'),
      renewalTaskLocationId: 'L1',
    })

    expect(createTask).not.toHaveBeenCalled()
  })

  it('rejects renewal task locations outside the tenant before inserting a BAA', async () => {
    const db = makeRecordBaaDb(true, false) as unknown as RecordBaaDb

    await expect(
      recordBaa(db, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
        signedAt: new Date('2026-01-01T00:00:00.000Z'),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@clinic.com',
        expiresAt: new Date('2027-01-31T00:00:00.000Z'),
        renewalTaskLocationId: 'other-tenant-location',
      }),
    ).rejects.toThrow('Task location not found')

    expect(db.insert).not.toHaveBeenCalled()
    expect(createTask).not.toHaveBeenCalled()
  })

  it('throws when vendor does not belong to the tenant', async () => {
    const db = makeRecordBaaDb(false) as unknown as RecordBaaDb

    await expect(
      recordBaa(db, {
        vendorId: 'vendor-other-org',
        tenantId: 'org-a',
        actorId: 'U1',
        signedAt: new Date(),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@clinic.com',
      }),
    ).rejects.toThrow('Vendor not found')

    expect(db.insert).not.toHaveBeenCalled()
  })
})

describe('markVendorInactive', () => {
  function makeMarkVendorInactiveDb(vendorExists: boolean, updateReturns = true) {
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue(updateReturns ? [{ id: 'V1', status: 'inactive' }] : []),
      }),
    }
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(vendorExists ? [{ id: 'V1' }] : []),
    }

    const db = {
      update: vi.fn().mockReturnValue(updateChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      select: vi.fn().mockReturnValue(selectChain),
      transaction: vi.fn(),
      updateSet: updateChain.set,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates vendor status to inactive and writes audit event', async () => {
    const db = makeMarkVendorInactiveDb(true) as unknown as MarkVendorInactiveDb

    await markVendorInactive(db, {
      vendorId: 'V1',
      tenantId: 'T1',
      actorId: 'U1',
    })

    expect(db.update).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'vendor.inactivated',
        resourceId: 'V1',
      }),
    )
  })

  it('throws when the vendor does not belong to the tenant', async () => {
    const db = makeMarkVendorInactiveDb(false) as unknown as MarkVendorInactiveDb

    await expect(
      markVendorInactive(db, { vendorId: 'V1', tenantId: 'T1', actorId: 'U1' }),
    ).rejects.toThrow('Vendor not found')

    expect(db.update).not.toHaveBeenCalled()
  })

  it('does not audit stale inactive updates when the update matches no rows', async () => {
    const db = makeMarkVendorInactiveDb(true, false) as unknown as MarkVendorInactiveDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      markVendorInactive(db, { vendorId: 'V1', tenantId: 'T1', actorId: 'U1' }),
    ).rejects.toThrow('Vendor changed before it could be marked inactive')

    expect(db.updateSet).toHaveBeenCalledWith({ status: 'inactive' })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('reactivateVendor', () => {
  function makeReactivateVendorDb(vendorExists: boolean, updateReturns = true) {
    const vendor = {
      id: 'V1',
      tenantId: 'T1',
      name: 'Secure Docs',
      website: null,
      contactEmail: null,
      dataCategories: ['PHI'],
      status: 'inactive',
    }
    const updateSet = vi.fn((updates) => ({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(updateReturns ? [{ ...vendor, ...updates }] : []),
      }),
    }))
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(vendorExists ? [vendor] : []),
    }

    const db = {
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      select: vi.fn().mockReturnValue(selectChain),
      transaction: vi.fn(),
      updateSet,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reactivates a tenant vendor and writes an audit event', async () => {
    const db = makeReactivateVendorDb(true) as unknown as ReactivateVendorDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await reactivateVendor(db, { vendorId: 'V1', tenantId: 'T1', actorId: 'U1' })

    expect(db.updateSet).toHaveBeenCalledWith({ status: 'pending_baa' })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'vendor.reactivated',
        resourceId: 'V1',
        before: { status: 'inactive' },
        after: { status: 'pending_baa' },
      }),
    )
  })

  it('does not audit stale reactivations when the update matches no rows', async () => {
    const db = makeReactivateVendorDb(true, false) as unknown as ReactivateVendorDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      reactivateVendor(db, { vendorId: 'V1', tenantId: 'T1', actorId: 'U1' }),
    ).rejects.toThrow('Vendor changed before it could be reactivated')

    expect(db.updateSet).toHaveBeenCalledWith({ status: 'pending_baa' })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('updateVendor', () => {
  function makeUpdateVendorDb(vendorExists: boolean, updateReturns = true) {
    const vendor = {
      id: 'V1',
      tenantId: 'T1',
      name: 'Secure Docs',
      website: 'https://secure.example',
      contactEmail: 'security@example.com',
      dataCategories: ['PHI'],
      status: 'active',
    }
    const updateSet = vi.fn((updates) => ({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(updateReturns ? [{ ...vendor, ...updates }] : []),
      }),
    }))
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(vendorExists ? [vendor] : []),
    }

    const db = {
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      select: vi.fn().mockReturnValue(selectChain),
      transaction: vi.fn(),
      updateSet,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects no-op updates before writing vendor audit events', async () => {
    const db = makeUpdateVendorDb(true) as unknown as UpdateVendorDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      updateVendor(db, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('At least one vendor field must be provided')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale vendor updates when the update matches no rows', async () => {
    const db = makeUpdateVendorDb(true, false) as unknown as UpdateVendorDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      updateVendor(db, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
        name: 'Updated Secure Docs',
      }),
    ).rejects.toThrow('Vendor changed before the update could be saved')

    expect(db.updateSet).toHaveBeenCalledWith({ name: 'Updated Secure Docs' })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('summarizes vendor field changes without writing vendor contact details to audit metadata', async () => {
    const db = makeUpdateVendorDb(true) as unknown as UpdateVendorDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await updateVendor(db, {
      vendorId: 'V1',
      tenantId: 'T1',
      actorId: 'U1',
      name: 'Jane Patient Vendor',
      contactEmail: 'jane.patient@example.com',
      dataCategories: ['PHI', 'Jane Patient billing records'],
    })

    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'vendor.updated',
        resourceId: 'V1',
        before: expect.objectContaining({
          websiteProvided: true,
          contactEmailProvided: true,
          dataCategoryCount: 1,
          status: 'active',
        }),
        after: expect.objectContaining({
          nameChanged: true,
          websiteChanged: false,
          contactEmailChanged: true,
          dataCategoriesChanged: true,
          websiteProvided: true,
          contactEmailProvided: true,
          dataCategoryCount: 2,
          status: 'active',
        }),
      }),
    )
    const auditPayload = JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)
    expect(auditPayload).not.toContain('Jane Patient Vendor')
    expect(auditPayload).not.toContain('jane.patient@example.com')
    expect(auditPayload).not.toContain('Jane Patient billing records')
  })
})

describe('updateLatestVendorBaa', () => {
  function makeUpdateLatestVendorBaaDb(baaExists: boolean, updateReturns = true) {
    const baa = {
      id: 'BAA1',
      vendorId: 'V1',
      signedAt: new Date('2026-01-01T00:00:00.000Z'),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
      documentFileKey: 'evidence/T1/vendor-baas/V1/baa.pdf',
    }
    const updateSet = vi.fn((updates) => ({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(updateReturns ? [{ ...baa, ...updates }] : []),
      }),
    }))
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(baaExists ? [{ vendor_baas: baa }] : []),
    }
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }

    const db = {
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      select: vi
        .fn()
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(membershipSelectChain)
        .mockReturnValue(selectChain),
      transaction: vi.fn(),
      updateSet,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects no-op BAA metadata updates before writing audit events', async () => {
    const db = makeUpdateLatestVendorBaaDb(true) as unknown as UpdateLatestVendorBaaDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      updateLatestVendorBaa(db, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('At least one BAA field must be provided')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale BAA metadata updates when the update matches no rows', async () => {
    const db = makeUpdateLatestVendorBaaDb(true, false) as unknown as UpdateLatestVendorBaaDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      updateLatestVendorBaa(db, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
        signerName: 'Dr. Jones',
      }),
    ).rejects.toThrow('BAA changed before the update could be saved')

    expect(db.updateSet).toHaveBeenCalledWith({ signerName: 'Dr. Jones' })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('summarizes BAA signer changes without writing signer details to audit metadata', async () => {
    const db = makeUpdateLatestVendorBaaDb(true) as unknown as UpdateLatestVendorBaaDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await updateLatestVendorBaa(db, {
      vendorId: 'V1',
      tenantId: 'T1',
      actorId: 'U1',
      signerName: 'Jane Patient',
      signerEmail: 'jane.patient@example.com',
    })

    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'vendor.baa_updated',
        resourceId: 'V1',
        before: expect.objectContaining({
          baaId: 'BAA1',
          signedAt: new Date('2026-01-01T00:00:00.000Z'),
          expiresAt: new Date('2027-01-01T00:00:00.000Z'),
        }),
        after: expect.objectContaining({
          baaId: 'BAA1',
          signerNameChanged: true,
          signerEmailChanged: true,
          signedAt: new Date('2026-01-01T00:00:00.000Z'),
          expiresAt: new Date('2027-01-01T00:00:00.000Z'),
        }),
      }),
    )
    const auditPayload = JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)
    expect(auditPayload).not.toContain('Jane Patient')
    expect(auditPayload).not.toContain('jane.patient@example.com')
    expect(auditPayload).not.toContain('Dr. Smith')
    expect(auditPayload).not.toContain('smith@clinic.com')
  })

  it('does not update or audit when a newer BAA becomes latest before the transaction commits', async () => {
    const oldBaa = {
      id: 'BAA-old',
      vendorId: 'V1',
      signedAt: new Date('2026-01-01T00:00:00.000Z'),
      signerName: 'Dr. Smith',
      signerEmail: 'smith@clinic.com',
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
    }
    const newerBaa = {
      ...oldBaa,
      id: 'BAA-newer',
      signedAt: new Date('2026-02-01T00:00:00.000Z'),
    }
    const firstSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ vendor_baas: oldBaa }]),
    }
    const transactionSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ vendor_baas: newerBaa }]),
    }
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const updateSet = vi.fn((updates) => ({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ ...oldBaa, ...updates }]),
      }),
    }))
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(firstSelectChain)
        .mockReturnValueOnce(membershipSelectChain)
        .mockReturnValue(transactionSelectChain),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    await expect(
      updateLatestVendorBaa(db as unknown as UpdateLatestVendorBaaDb, {
        vendorId: 'V1',
        tenantId: 'T1',
        actorId: 'U1',
        signerName: 'Dr. Jones',
      }),
    ).rejects.toThrow('Latest BAA changed before the update could be saved')

    expect(updateSet).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})
