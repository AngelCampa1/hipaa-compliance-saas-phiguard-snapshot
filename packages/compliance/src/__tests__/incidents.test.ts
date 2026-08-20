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
  appendIncidentUpdate,
  transitionIncident,
  createIncident,
  updateIncident,
  listIncidentUpdates,
} from '../incidents.js'
import { incidents } from '../schema/incidents.phi.js'
import { incidentUpdates } from '../schema/incident-updates.phi.js'
import { writeAuditEvent } from '@phiguard/audit'

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
}))

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

function makeMockDb(existingIncident: Record<string, unknown>, returnedIncident: Record<string, unknown>) {
  const selectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([existingIncident]),
  }

  const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([returnedIncident]),
  }

  const insertChain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([returnedIncident]),
  }

  const db: Record<string, unknown> = {
    select: vi.fn().mockReturnValue(selectChain),
    update: vi.fn().mockReturnValue(updateChain),
    insert: vi.fn().mockReturnValue(insertChain),
  }
  // Transaction executes the callback with the same mock db acting as tx
  db.transaction = vi.fn().mockImplementation(async (fn: (t: typeof db) => Promise<unknown>) => fn(db))

  return db
}

const baseIncident = {
  id: 'incident-1',
  tenantId: 'tenant-1',
  locationId: 'location-1',
  title: 'Test Incident',
  summary: null,
  severity: 'low' as const,
  category: 'other' as const,
  status: 'reported' as const,
  discoveredAt: new Date(),
  discoveredBy: null,
  affectedSystems: null,
  reportedAt: new Date(),
  resolvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describeWithTestDB('incident integration tenant and actor isolation', () => {
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

  async function seedIncident(input?: { status?: 'reported' | 'triaging' | 'contained' }) {
    const { db } = requireTestDB()
    const tenant = await seedTenant()
    const [incident] = await db
      .insert(incidents)
      .values({
        tenantId: tenant.org.id,
        locationId: tenant.location.id,
        title: 'Patient portal access issue',
        summary: 'Patient Jane reported unexpected access.',
        severity: 'medium',
        category: 'unauthorized_access',
        status: input?.status ?? 'reported',
        discoveredAt: new Date(),
        reportedAt: new Date(),
      })
      .returning()

    return { ...tenant, incident }
  }

  it('rejects incident creation for a location outside the tenant', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createIncident(db, {
        tenantId: tenantA.org.id,
        locationId: tenantB.location.id,
        title: 'Cross-tenant location incident',
        summary: 'Patient Jane context',
        severity: 'high',
        category: 'lost_device',
        discoveredAt: new Date(),
        actorId: tenantA.user.id,
      }),
    ).rejects.toThrow('Incident location not found')

    const rows = await db
      .select()
      .from(incidents)
      .where(eq(incidents.title, 'Cross-tenant location incident'))
    expect(rows).toEqual([])
  })

  it('rejects incident creation when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createIncident(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Cross-tenant actor incident',
        severity: 'high',
        category: 'lost_device',
        discoveredAt: new Date(),
        actorId: tenantB.user.id,
      }),
    ).rejects.toThrow('Incident actor is not a member of this organization')

    const rows = await db
      .select()
      .from(incidents)
      .where(eq(incidents.title, 'Cross-tenant actor incident'))
    expect(rows).toEqual([])
  })

  it('rejects incident creation when discoveredBy is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createIncident(db, {
        tenantId: tenantA.org.id,
        locationId: tenantA.location.id,
        title: 'Cross-tenant discoverer incident',
        severity: 'medium',
        category: 'unauthorized_access',
        discoveredAt: new Date(),
        discoveredBy: tenantB.user.id,
        actorId: tenantA.user.id,
      }),
    ).rejects.toThrow('Incident discovered user is not a member of this organization')

    const rows = await db
      .select()
      .from(incidents)
      .where(eq(incidents.title, 'Cross-tenant discoverer incident'))
    expect(rows).toEqual([])
  })

  it('rejects incident transitions when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedIncident()
    const tenantB = await seedTenant()

    await expect(
      transitionIncident(db, {
        incidentId: tenantA.incident.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        toStatus: 'triaging',
      }),
    ).rejects.toThrow('Incident actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, tenantA.incident.id))
      .limit(1)
    expect(current?.status).toBe('reported')
  })

  it('rejects incident updates when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedIncident()
    const tenantB = await seedTenant()

    await expect(
      updateIncident(db, {
        incidentId: tenantA.incident.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        severity: 'critical',
      }),
    ).rejects.toThrow('Incident actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, tenantA.incident.id))
      .limit(1)
    expect(current?.severity).toBe('medium')
  })

  it('rejects incident update notes when the author is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedIncident()
    const tenantB = await seedTenant()

    await expect(
      appendIncidentUpdate(db, {
        incidentId: tenantA.incident.id,
        tenantId: tenantA.org.id,
        authorId: tenantB.user.id,
        text: 'Patient Jane note',
      }),
    ).rejects.toThrow('Incident actor is not a member of this organization')

    const rows = await db
      .select()
      .from(incidentUpdates)
      .where(eq(incidentUpdates.incidentId, tenantA.incident.id))
    expect(rows).toEqual([])
  })
})

describe('transitionIncident - valid transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('transitions reported -> triaging', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'reported' },
      { ...baseIncident, status: 'triaging' },
    )

    const result = await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'triaging',
      },
    )

    expect(result.status).toBe('triaging')
  })

  it('transitions triaging -> contained', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'triaging' },
      { ...baseIncident, status: 'contained' },
    )

    const result = await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'contained',
      },
    )

    expect(result.status).toBe('contained')
  })

  it('transitions contained -> resolved', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'contained' },
      { ...baseIncident, status: 'resolved' },
    )

    const result = await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'resolved',
      },
    )

    expect(result.status).toBe('resolved')
  })

  it('transitions resolved -> closed', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'resolved' },
      { ...baseIncident, status: 'closed' },
    )

    const result = await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'closed',
      },
    )

    expect(result.status).toBe('closed')
  })

  it('writes an audit event on valid transition', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'reported' },
      { ...baseIncident, status: 'triaging' },
    )

    await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'triaging',
      },
    )

    expect(writeAuditEvent).toHaveBeenCalledOnce()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'incident.status_changed',
        resourceType: 'incident',
        resourceId: 'incident-1',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        actorId: 'actor-1',
      }),
    )
  })
})

describe('transitionIncident - invalid transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when attempting to skip a step: reported -> resolved', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'reported' },
      { ...baseIncident, status: 'resolved' },
    )

    await expect(
      transitionIncident(
        mockDb as unknown as Parameters<typeof transitionIncident>[0],
        {
          incidentId: 'incident-1',
          tenantId: 'tenant-1',
          actorId: 'actor-1',
          toStatus: 'resolved',
        },
      ),
    ).rejects.toThrow(/invalid transition/i)
  })

  it('throws when attempting to go backwards from closed', async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'closed' },
      { ...baseIncident, status: 'reported' },
    )

    await expect(
      transitionIncident(
        mockDb as unknown as Parameters<typeof transitionIncident>[0],
        {
          incidentId: 'incident-1',
          tenantId: 'tenant-1',
          actorId: 'actor-1',
          toStatus: 'triaging',
        },
      ),
    ).rejects.toThrow(/invalid transition/i)
  })

  it('throws when incident is not found or does not belong to tenant', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }

    const mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn(),
      insert: vi.fn(),
    }

    await expect(
      transitionIncident(
        mockDb as unknown as Parameters<typeof transitionIncident>[0],
        {
          incidentId: 'incident-1',
          tenantId: 'tenant-1',
          actorId: 'actor-1',
          toStatus: 'triaging',
        },
      ),
    ).rejects.toThrow(/not found/i)
  })

  it('does not audit stale concurrent transitions when the status update matches no rows', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ ...baseIncident, status: 'reported' }]),
    }
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    }
    const txDb = {
      update: vi.fn().mockReturnValue(updateChain),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      transaction: vi.fn((fn: (tx: typeof txDb) => Promise<unknown>) => fn(txDb)),
    }

    await expect(
      transitionIncident(
        mockDb as unknown as Parameters<typeof transitionIncident>[0],
        {
          incidentId: 'incident-1',
          tenantId: 'tenant-1',
          actorId: 'actor-1',
          toStatus: 'triaging',
        },
      ),
    ).rejects.toThrow('Incident status changed before the transition could be saved')
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})

describe('transitionIncident - audit action names', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("transitionIncident to 'resolved' writes incident.resolved audit action", async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'contained' },
      { ...baseIncident, status: 'resolved', resolvedAt: new Date() },
    )

    await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'resolved',
      },
    )

    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({ action: 'incident.resolved' }),
    )
  })

  it("transitionIncident to 'closed' writes incident.closed audit action", async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'resolved' },
      { ...baseIncident, status: 'closed', closedAt: new Date() },
    )

    await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'closed',
      },
    )

    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({ action: 'incident.closed' }),
    )
  })

  it("transitionIncident to 'triaging' writes incident.status_changed audit action", async () => {
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'reported' },
      { ...baseIncident, status: 'triaging' },
    )

    await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'triaging',
      },
    )

    expect(writeAuditEvent).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({ action: 'incident.status_changed' }),
    )
  })

  it("transitionIncident to 'closed' sets closedAt on the returned incident", async () => {
    const closedAt = new Date()
    const mockDb = makeMockDb(
      { ...baseIncident, status: 'resolved' },
      { ...baseIncident, status: 'closed', closedAt },
    )

    const result = await transitionIncident(
      mockDb as unknown as Parameters<typeof transitionIncident>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        toStatus: 'closed',
      },
    )

    expect((result as typeof result & { closedAt: Date | null }).closedAt).toBeInstanceOf(Date)
  })
})

describe('createIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an incident and writes an audit event', async () => {
    const newIncident = {
      ...baseIncident,
      title: 'Lost Laptop',
      severity: 'high',
      category: 'lost_device',
    }

    const insertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([newIncident]),
    }
    const locationSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'location-1' }]),
    }
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }

    const txDb = {
      insert: vi.fn().mockReturnValue(insertChain),
      select: vi.fn(),
      update: vi.fn(),
    }
    const mockDb = {
      insert: vi.fn(),
      select: vi
        .fn()
        .mockReturnValueOnce(locationSelectChain)
        .mockReturnValueOnce(membershipSelectChain),
      update: vi.fn(),
      transaction: vi.fn((fn: (tx: typeof txDb) => Promise<unknown>) => fn(txDb)),
    }

    const result = await createIncident(
      mockDb as unknown as Parameters<typeof createIncident>[0],
      {
        tenantId: 'tenant-1',
        locationId: 'location-1',
        title: 'Lost Laptop',
        severity: 'high',
        category: 'lost_device',
        discoveredAt: new Date(),
        actorId: 'actor-1',
      },
    )

    expect(result.title).toBe('Lost Laptop')
    expect(writeAuditEvent).toHaveBeenCalledOnce()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      txDb,
      expect.objectContaining({
        action: 'incident.created',
        resourceType: 'incident',
        tenantId: 'tenant-1',
        locationId: 'location-1',
        actorId: 'actor-1',
      }),
    )
    expect(mockDb.transaction).toHaveBeenCalledOnce()
    expect(mockDb.insert).not.toHaveBeenCalled()
  })
})

describe('appendIncidentUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes an audit event with noteId but without text in the after payload', async () => {
    const noteRecord = {
      id: 'note-1',
      tenantId: 'tenant-1',
      incidentId: 'incident-1',
      authorId: 'author-1',
      text: 'Patient Jane follow-up note - potential PHI',
      createdAt: new Date(),
    }

    const incidentSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'incident-1', locationId: 'location-1' }]),
    }
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const insertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([noteRecord]),
    }
    const txDb = {
      insert: vi.fn().mockReturnValue(insertChain),
    }
    const mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce(incidentSelectChain)
        .mockReturnValueOnce(membershipSelectChain),
      transaction: vi.fn((fn: (tx: typeof txDb) => Promise<unknown>) => fn(txDb)),
    }

    await appendIncidentUpdate(
      mockDb as unknown as Parameters<typeof appendIncidentUpdate>[0],
      {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        authorId: 'author-1',
        text: 'Patient Jane follow-up note - potential PHI',
      },
    )

    expect(writeAuditEvent).toHaveBeenCalledOnce()
    const auditCall = vi.mocked(writeAuditEvent).mock.calls[0]
    const auditPayload = auditCall?.[1] as { after?: Record<string, unknown> }
    // HIPAA regression: text must never appear in the audit after payload
    expect(auditPayload?.after).not.toHaveProperty('text')
    expect(auditPayload?.after).toHaveProperty('noteId', 'note-1')
  })
})

describe('updateIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects no-op incident updates before writing audit events', async () => {
    const mockDb = {
      select: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      updateIncident(mockDb as unknown as Parameters<typeof updateIncident>[0], {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
      }),
    ).rejects.toThrow('At least one incident field must be provided')

    expect(mockDb.select).not.toHaveBeenCalled()
    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale incident updates when the update matches no rows', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([baseIncident]),
    }
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    }
    const txDb = {
      update: vi.fn().mockReturnValue(updateChain),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      transaction: vi.fn((fn: (tx: typeof txDb) => Promise<unknown>) => fn(txDb)),
    }

    await expect(
      updateIncident(mockDb as unknown as Parameters<typeof updateIncident>[0], {
        incidentId: 'incident-1',
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        severity: 'high',
      }),
    ).rejects.toThrow('Incident changed before the update could be saved')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})
describe('listIncidentUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns rows with authorName from joined user name', async () => {
    const tenantCheckChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'incident-1' }]),
    }

    const updatesRow = {
      id: 'update-1',
      tenantId: 'tenant-1',
      incidentId: 'incident-1',
      authorId: 'user-1',
      text: 'PHI note text',
      createdAt: new Date(),
      updatedAt: new Date(),
      authorName: 'Dr. Jane Smith',
    }

    const updatesChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([updatesRow]),
    }

    const mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce(tenantCheckChain)
        .mockReturnValueOnce(updatesChain),
    }

    const result = await listIncidentUpdates(
      mockDb as unknown as Parameters<typeof listIncidentUpdates>[0],
      { incidentId: 'incident-1', tenantId: 'tenant-1' },
    )

    expect(updatesChain.innerJoin).toHaveBeenCalledOnce()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ authorName: 'Dr. Jane Smith' })
  })

  it('returns rows with authorName falling back to email', async () => {
    const tenantCheckChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'incident-1' }]),
    }

    const updatesRow = {
      id: 'update-2',
      tenantId: 'tenant-1',
      incidentId: 'incident-1',
      authorId: 'user-2',
      text: 'PHI note text',
      createdAt: new Date(),
      updatedAt: new Date(),
      authorName: 'staff@clinic.test',
    }

    const updatesChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([updatesRow]),
    }

    const mockDb = {
      select: vi
        .fn()
        .mockReturnValueOnce(tenantCheckChain)
        .mockReturnValueOnce(updatesChain),
    }

    const result = await listIncidentUpdates(
      mockDb as unknown as Parameters<typeof listIncidentUpdates>[0],
      { incidentId: 'incident-1', tenantId: 'tenant-1' },
    )

    expect(updatesChain.innerJoin).toHaveBeenCalledOnce()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ authorName: 'staff@clinic.test' })
  })

  it('throws Incident not found when tenant check returns no rows', async () => {
    const tenantCheckChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }

    const mockDb = {
      select: vi.fn().mockReturnValueOnce(tenantCheckChain),
    }

    await expect(
      listIncidentUpdates(
        mockDb as unknown as Parameters<typeof listIncidentUpdates>[0],
        { incidentId: 'incident-1', tenantId: 'tenant-1' },
      ),
    ).rejects.toThrow('Incident not found')
  })
})
