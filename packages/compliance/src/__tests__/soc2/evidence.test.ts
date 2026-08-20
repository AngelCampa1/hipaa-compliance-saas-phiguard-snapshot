import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, describe, it, expect, vi, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import { memberships, organizations, soc2Evidence, users } from '@phiguard/db'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import {
  collectAuditEvidence,
  CONTROL_AUDIT_MAP,
  recordManualEvidence,
} from '../../soc2/evidence.js'

type CollectAuditEvidenceDb = Parameters<typeof collectAuditEvidence>[0]
type RecordManualEvidenceDb = Parameters<typeof recordManualEvidence>[0]
const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
  // Provide a minimal auditEvents stub so drizzle column helpers don't throw
  auditEvents: {
    tenantId: { table: { _: {} }, column: 'tenant_id' },
    action: { table: { _: {} }, column: 'action' },
    createdAt: { table: { _: {} }, column: 'created_at' },
  },
}))

describe('collectAuditEvidence', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: '5' }]),
    }

    const insertChain = {
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: 'evidence-id-1', tenantId: 'tenant-1', controlId: 'CC6.1' }]),
      }),
    }

    mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      insert: vi.fn().mockReturnValue(insertChain),
    }
  })

  it('queries audit_events and inserts evidence row with correct metadata', async () => {
    const from = new Date('2026-01-01T00:00:00Z')
    const to = new Date('2026-03-31T23:59:59Z')

    const result = await collectAuditEvidence(mockDb as unknown as CollectAuditEvidenceDb, {
      tenantId: 'tenant-1',
      controlId: 'CC6.1',
      actionFilters: ['user.created', 'user.role_changed'],
      from,
      to,
    })

    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.insert).toHaveBeenCalled()

    const insertValues = mockDb.insert.mock.results[0].value.values
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        controlId: 'CC6.1',
        source: 'audit_log',
        metadata: expect.objectContaining({
          actions: ['user.created', 'user.role_changed'],
        }),
      }),
    )

    expect(result).toMatchObject({ evidenceId: 'evidence-id-1' })
    expect(typeof result.count).toBe('number')
  })

  it('returns evidenceId from the inserted row', async () => {
    const result = await collectAuditEvidence(mockDb as unknown as CollectAuditEvidenceDb, {
      tenantId: 'tenant-1',
      controlId: 'CC7.2',
      actionFilters: [],
      from: new Date('2026-01-01'),
      to: new Date('2026-03-31'),
    })

    expect(result.evidenceId).toBe('evidence-id-1')
  })

  it('rejects audit evidence windows that end before they start', async () => {
    await expect(
      collectAuditEvidence(mockDb as unknown as CollectAuditEvidenceDb, {
        tenantId: 'tenant-1',
        controlId: 'CC6.1',
        actionFilters: ['user.created'],
        from: new Date('2026-04-01T00:00:00Z'),
        to: new Date('2026-03-31T23:59:59Z'),
      }),
    ).rejects.toThrow('Audit evidence window end must be on or after window start')

    expect(mockDb.select).not.toHaveBeenCalled()
    expect(mockDb.insert).not.toHaveBeenCalled()
  })
})

describe('recordManualEvidence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a manual evidence row and writes an audit event', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 'manual-evidence-1' }])
    const values = vi.fn().mockReturnValue({ returning })
    const controlQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'ctrl-1' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(controlQuery),
      insert: vi.fn().mockReturnValue({ values }),
    }
    const mockDb = {
      transaction: vi.fn((fn: (transaction: typeof tx) => Promise<unknown>) => fn(tx)),
    }

    const result = await recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      controlId: ' CC6.1 ',
      fileKey: ' evidence/tenant-1/soc2/access-review.pdf ',
      summary: ' Q2 access review evidence ',
    })

    expect(result).toEqual({ evidenceId: 'manual-evidence-1' })
    expect(tx.select).toHaveBeenCalled()
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        controlId: 'CC6.1',
        source: 'manual_upload',
        fileKey: 'evidence/tenant-1/soc2/access-review.pdf',
        queryRef: 'Q2 access review evidence',
        metadata: { summary: 'Q2 access review evidence' },
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'soc2.evidence_recorded',
        resourceType: 'soc2_evidence',
        resourceId: 'manual-evidence-1',
        after: expect.not.objectContaining({
          fileKey: 'evidence/tenant-1/soc2/access-review.pdf',
        }),
      }),
    )
  })

  it('requires a file key and summary', async () => {
    const mockDb = {
      transaction: vi.fn(),
    }

    await expect(
      recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        controlId: 'CC6.1',
        fileKey: '',
        summary: 'Q2 access review evidence',
      }),
    ).rejects.toThrow('Evidence file key is required')

    await expect(
      recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        controlId: 'CC6.1',
        fileKey: 'evidence/tenant-1/soc2/access-review.pdf',
        summary: '',
      }),
    ).rejects.toThrow('Evidence summary is required')

    expect(mockDb.transaction).not.toHaveBeenCalled()
  })

  it('rejects manual evidence for unknown controls', async () => {
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const controlQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    let selectCount = 0
    const tx = {
      select: vi.fn().mockImplementation(() => {
        selectCount += 1
        return selectCount === 1 ? membershipQuery : controlQuery
      }),
      insert: vi.fn(),
    }
    const mockDb = {
      transaction: vi.fn((fn: (transaction: typeof tx) => Promise<unknown>) => fn(tx)),
    }

    await expect(
      recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        controlId: 'CC99.9',
        fileKey: 'evidence/tenant-1/soc2/access-review.pdf',
        summary: 'Q2 access review evidence',
      }),
    ).rejects.toThrow('SOC 2 control not found')

    expect(tx.select).toHaveBeenCalled()
    expect(tx.insert).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('accepts manual evidence for bundled controls when control rows are not seeded', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 'manual-evidence-1' }])
    const values = vi.fn().mockReturnValue({ returning })
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const controlQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    let selectCount = 0
    const tx = {
      select: vi.fn().mockImplementation(() => {
        selectCount += 1
        return selectCount === 1 ? membershipQuery : controlQuery
      }),
      insert: vi.fn().mockReturnValue({ values }),
    }
    const mockDb = {
      transaction: vi.fn((fn: (transaction: typeof tx) => Promise<unknown>) => fn(tx)),
    }

    await expect(
      recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        controlId: 'CC6.1',
        fileKey: 'evidence/tenant-1/soc2/access-review.pdf',
        summary: 'Q2 access review evidence',
      }),
    ).resolves.toEqual({ evidenceId: 'manual-evidence-1' })

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        controlId: 'CC6.1',
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalled()
  })

  it('scopes manual evidence control lookup to global or active-tenant controls', async () => {
    const source = readFileSync(resolve(__dirname, '../../soc2/evidence.ts'), 'utf8')

    expect(source).toContain('eq(soc2Controls.controlId, controlId)')
    expect(source).toContain(
      'or(isNull(soc2Controls.tenantId), eq(soc2Controls.tenantId, opts.tenantId))',
    )
  })

  it('requires manual evidence keys to be scoped to the active tenant SOC 2 prefix', async () => {
    const mockDb = {
      transaction: vi.fn(),
    }

    await expect(
      recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        controlId: 'CC6.1',
        fileKey: 'evidence/tenant-2/soc2/access-review.pdf',
        summary: 'Q2 access review evidence',
      }),
    ).rejects.toThrow('Evidence file key must start with evidence/tenant-1/soc2/')

    await expect(
      recordManualEvidence(mockDb as unknown as RecordManualEvidenceDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        controlId: 'CC6.1',
        fileKey: 'uploads/access-review.pdf',
        summary: 'Q2 access review evidence',
      }),
    ).rejects.toThrow('Evidence file key must start with evidence/tenant-1/soc2/')

    expect(mockDb.transaction).not.toHaveBeenCalled()
  })
})

describeWithTestDB('recordManualEvidence integration actor isolation', () => {
  let testDB: TestDB | undefined

  beforeAll(async () => {
    testDB = await createTestDB()
  }, 120_000)

  afterAll(async () => {
    await testDB?.teardown()
  })

  function requireTestDB(): TestDB {
    if (!testDB) {
      throw new Error('Test database was not initialized')
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

  it('rejects manual evidence uploads from actors outside the tenant', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      recordManualEvidence(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        controlId: 'CC6.1',
        fileKey: `evidence/${tenantA.org.id}/soc2/access-review.pdf`,
        summary: 'Q2 access review evidence',
      }),
    ).rejects.toThrow('SOC 2 actor is not a member of this organization')

    const rows = await db
      .select()
      .from(soc2Evidence)
      .where(eq(soc2Evidence.tenantId, tenantA.org.id))
    expect(rows).toEqual([])
    expect(writeAuditEvent).not.toHaveBeenCalled()
  }, 120_000)
})

describe('CONTROL_AUDIT_MAP', () => {
  it('maps CC6.1 to access-related audit actions', () => {
    const actions = CONTROL_AUDIT_MAP['CC6.1']
    expect(actions).toBeDefined()
    expect(Array.isArray(actions)).toBe(true)
    expect(actions.length).toBeGreaterThan(0)
    expect(actions).toContain('invitation.accepted')
    expect(actions).toContain('member.removed')
    expect(actions).toContain('member.role_updated')
    expect(actions).toContain('membership.role_changed')
    expect(actions).toContain('membership.revoked')
    expect(actions).not.toContain('membership.created')
    expect(actions).not.toContain('user.created')
    expect(actions).not.toContain('user.role_changed')
  })

  it('uses audit action names emitted by organization and membership server flows', () => {
    expect(CONTROL_AUDIT_MAP['CC1.1']).toEqual(
      expect.arrayContaining(['org.created', 'member.role_updated', 'membership.role_changed']),
    )
    expect(CONTROL_AUDIT_MAP['CC7.2']).toEqual(
      expect.arrayContaining(['org.created', 'invitation.accepted']),
    )
    expect(CONTROL_AUDIT_MAP['CC1.1']).not.toContain('organization.created')
    expect(CONTROL_AUDIT_MAP['CC7.2']).not.toContain('organization.created')
  })

  it('does not map controls to stale access actions that are not emitted', () => {
    const mappedActions = Object.values(CONTROL_AUDIT_MAP).flat()

    expect(mappedActions).not.toContain('membership.created')
    expect(mappedActions).not.toContain('user.created')
  })

  it('maps CC3.1 to risk assessment and risk item lifecycle audit actions', () => {
    const actions = CONTROL_AUDIT_MAP['CC3.1']
    expect(actions).toEqual(
      expect.arrayContaining([
        'risk_assessment.created',
        'risk_assessment.updated',
        'risk_assessment.reviewed',
        'risk_item.created',
        'risk_item.updated',
        'risk_item.deleted',
      ]),
    )
  })

  it('maps CC8.1 to the integration lifecycle audit actions emitted by the app', () => {
    const actions = CONTROL_AUDIT_MAP['CC8.1']

    expect(actions).toEqual(
      expect.arrayContaining(['integration.installed', 'integration.revoked']),
    )
    expect(actions).not.toEqual(
      expect.arrayContaining(['integration.connected', 'integration.disconnected']),
    )
  })

  it('contains entries for all seeded controls', () => {
    const expectedControls = [
      'CC1.1',
      'CC2.1',
      'CC3.1',
      'CC4.1',
      'CC5.1',
      'CC6.1',
      'CC6.2',
      'CC7.2',
      'CC8.1',
      'CC9.1',
    ]
    for (const controlId of expectedControls) {
      expect(CONTROL_AUDIT_MAP[controlId], `Missing map entry for ${controlId}`).toBeDefined()
    }
  })
})
