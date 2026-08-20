import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStandardLegalDocuments, hashDocument } from '@phiguard/baa'
import { checklists, incidents } from '@phiguard/compliance'
import {
  legalAcceptances,
  locations,
  memberships,
  organizations,
  tasks,
  users,
  type DB,
} from '@phiguard/db'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import type { AppSession } from '../lib/session.js'

const { getSessionFnMock, getDbMock } = vi.hoisted(() => ({
  getSessionFnMock: vi.fn(),
  getDbMock: vi.fn(),
}))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('dashboard summary', () => {
  let testDB: TestDB | undefined

  beforeAll(async () => {
    testDB = await createTestDB()
  }, 120_000)

  afterAll(async () => {
    await testDB?.teardown()
  }, 120_000)

  function requireTestDB(): TestDB {
    if (!testDB) {
      throw new Error('Test database not initialized')
    }

    return testDB
  }

  beforeEach(() => {
    vi.clearAllMocks()
    getDbMock.mockReturnValue(requireTestDB().db)
  })

  it('returns org-wide rollups plus per-location breakdowns', async () => {
    const scenario = await seedDashboardScenario(requireTestDB())
    getSessionFnMock.mockResolvedValue(makeSession(scenario.user.id, scenario.organization.id))

    const { getDashboardSummary } = await import('./dashboard.js')
    const summary = await getDashboardSummary({ locationId: undefined })

    expect(summary.organization).toMatchObject({
      termsAcceptedAt: scenario.organization.termsAcceptedAt,
      baaSignedAt: scenario.organization.baaSignedAt,
    })
    expect(summary.tasks.open).toBe(2)
    expect(summary.incidents.open).toBe(1)
    expect(summary.checklists.active).toBe(1)
    expect(summary.locationBreakdown).toHaveLength(2)
    expect(
      summary.locationBreakdown.find((row) => row.locationId === scenario.secondaryLocation.id),
    ).toMatchObject({
      tasksOpen: 1,
      incidentsOpen: 0,
      checklistsCompleted: 1,
    })
  })

  it('uses the resolved organization when the session active organization is stale', async () => {
    const scenario = await seedDashboardScenario(requireTestDB())
    const [staleOrganization] = await requireTestDB().db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()

    getSessionFnMock.mockResolvedValue(makeSession(scenario.user.id, staleOrganization.id))

    const { getDashboardSummary } = await import('./dashboard.js')
    const summary = await getDashboardSummary({ locationId: undefined })

    expect(summary.organization).toMatchObject({
      id: scenario.organization.id,
    })
    expect(summary.tasks.open).toBe(2)
    expect(summary.scope.locations.map((location) => location.id)).toEqual([
      scenario.primaryLocation.id,
      scenario.secondaryLocation.id,
    ])
  })

  it('narrows the summary to a selected location and hides the rollup table', async () => {
    const scenario = await seedDashboardScenario(requireTestDB())
    getSessionFnMock.mockResolvedValue(makeSession(scenario.user.id, scenario.organization.id))

    const { getDashboardSummary } = await import('./dashboard.js')
    const summary = await getDashboardSummary({
      locationId: scenario.primaryLocation.id,
    })

    expect(summary.tasks.open).toBe(1)
    expect(summary.incidents.open).toBe(1)
    expect(summary.checklists.active).toBe(1)
    expect(summary.locationBreakdown).toEqual([])
    expect(summary.scope.selectedLocationId).toBe(scenario.primaryLocation.id)
  })

  it('includes actionItems derived from scoped counts', async () => {
    const scenario = await seedDashboardScenario(requireTestDB())
    getSessionFnMock.mockResolvedValue(makeSession(scenario.user.id, scenario.organization.id))

    const { getDashboardSummary } = await import('./dashboard.js')
    const summary = await getDashboardSummary({ locationId: undefined })

    expect(summary.actionItems).toBeDefined()
    expect(Array.isArray(summary.actionItems)).toBe(true)
    expect(summary.actionItems.length).toBeGreaterThan(0)

    const urgentItem = summary.actionItems.find((item) => item.severity === 'urgent')
    expect(urgentItem).toBeDefined()
    expect(urgentItem?.href).toBe('/app/compliance/incidents')
    expect(urgentItem?.cta).toBe('View incidents')

    const warningItem = summary.actionItems.find((item) => item.severity === 'warning')
    expect(warningItem).toBeDefined()
    expect(warningItem?.href).toBe('/app/compliance/checklists')
    expect(warningItem?.cta).toBe('Continue checklists')

    const normalItem = summary.actionItems.find((item) => item.severity === 'normal')
    expect(normalItem).toBeDefined()
    expect(normalItem?.href).toBe('/app/tasks')
    expect(normalItem?.cta).toBe('View tasks')
  })

  it('returns zeroed rollups when the organization has no readable locations', async () => {
    const { db } = requireTestDB()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    const [user] = await db.insert(users).values(makeUser()).returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: organization.id,
        role: 'org_admin',
      }),
    )
    await seedLegalAcceptances(db, organization.id, user.id)

    getSessionFnMock.mockResolvedValue(makeSession(user.id, organization.id))

    const { getDashboardSummary } = await import('./dashboard.js')
    const summary = await getDashboardSummary({ locationId: undefined })

    expect(summary.tasks).toEqual({ total: 0, open: 0 })
    expect(summary.incidents).toEqual({ total: 0, open: 0 })
    expect(summary.checklists).toEqual({ total: 0, active: 0, completed: 0 })
    expect(summary.locationBreakdown).toEqual([])
  })
})

async function seedDashboardScenario(testDB: TestDB) {
  const db = testDB.db
  const [organization] = await db
    .insert(organizations)
    .values(
      makeOrganization({
        plan: 'group',
        planStatus: 'active',
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      }),
    )
    .returning()

  const [user] = await db.insert(users).values(makeUser()).returning()
  await seedLegalAcceptances(db, organization.id, user.id)

  await db.insert(memberships).values(
    makeMembership({
      userId: user.id,
      tenantId: organization.id,
      role: 'org_admin',
    }),
  )

  const [primaryLocation] = await db
    .insert(locations)
    .values({
      organizationId: organization.id,
      name: 'Primary Clinic',
      slug: 'primary-clinic',
      isPrimary: true,
    })
    .returning()

  const [secondaryLocation] = await db
    .insert(locations)
    .values({
      organizationId: organization.id,
      name: 'Secondary Clinic',
      slug: 'secondary-clinic',
    })
    .returning()

  await db.insert(tasks).values([
    {
      tenantId: organization.id,
      locationId: primaryLocation.id,
      title: 'Primary open task',
      status: 'open',
      priority: 'medium',
      createdBy: user.id,
    },
    {
      tenantId: organization.id,
      locationId: secondaryLocation.id,
      title: 'Secondary blocked task',
      status: 'blocked',
      priority: 'medium',
      createdBy: user.id,
    },
    {
      tenantId: organization.id,
      locationId: secondaryLocation.id,
      title: 'Secondary completed task',
      status: 'done',
      priority: 'medium',
      createdBy: user.id,
    },
    {
      tenantId: organization.id,
      locationId: primaryLocation.id,
      title: 'Archived open task',
      status: 'open',
      priority: 'medium',
      archivedAt: new Date('2026-01-12T12:00:00.000Z'),
      createdBy: user.id,
    },
  ])

  await db.insert(incidents).values([
    {
      tenantId: organization.id,
      locationId: primaryLocation.id,
      title: 'Primary incident',
      severity: 'high',
      category: 'other',
      status: 'reported',
      discoveredAt: new Date('2026-01-10T12:00:00.000Z'),
    },
    {
      tenantId: organization.id,
      locationId: secondaryLocation.id,
      title: 'Secondary closed incident',
      severity: 'low',
      category: 'other',
      status: 'closed',
      discoveredAt: new Date('2026-01-11T12:00:00.000Z'),
    },
  ])

  await db.insert(checklists).values([
    {
      tenantId: organization.id,
      locationId: primaryLocation.id,
      templateId: null,
      name: 'Primary checklist',
      status: 'active',
    },
    {
      tenantId: organization.id,
      locationId: secondaryLocation.id,
      templateId: null,
      name: 'Secondary checklist',
      status: 'completed',
    },
  ])

  return {
    organization,
    user,
    primaryLocation,
    secondaryLocation,
  }
}

async function seedLegalAcceptances(db: DB, tenantId: string, userId: string) {
  const acceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const documents = getStandardLegalDocuments()

  await db.insert(legalAcceptances).values(
    documents.map((document) => ({
      tenantId,
      documentType: document.type,
      documentVersion: document.version,
      documentTitle: document.title,
      contentHash: hashDocument(document),
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Test User',
      signerTitle: 'Owner',
      signerEmail: 'user@example.com',
      acceptedByUserId: userId,
      acceptedAt,
      snapshot: document,
    })),
  )
}

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
