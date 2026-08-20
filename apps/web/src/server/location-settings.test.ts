import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStandardLegalDocuments, hashDocument } from '@phiguard/baa'
import {
  legalAcceptances,
  locationGrants,
  locations,
  memberships,
  organizations,
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

let locationSettingsModulePromise: Promise<typeof import('./location-settings.js')>

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

describe('readLocationSettings entitlement checks', () => {
  it('allows Compliance Ops organizations to create additional locations', async () => {
    const organization = makeOrganization({
      id: 'org-compliance-ops',
      plan: 'compliance_ops',
      planStatus: 'active',
    })
    const organizationId = organization.id
    if (!organizationId) {
      throw new Error('Expected test organization to have an id')
    }
    const db = makeReadLocationSettingsDb([
      [organization],
      [],
      [],
      [],
    ])

    const { readLocationSettings } = await import('./location-settings.js')
    const result = await readLocationSettings(db as unknown as DB, organizationId)

    expect(result.canCreateAdditionalLocations).toBe(true)
  })
})

describeWithTestDB('location settings server functions', () => {
  let testDB: TestDB | undefined

  beforeAll(async () => {
    testDB = await createTestDB()
    locationSettingsModulePromise = import('./location-settings.js')
    await locationSettingsModulePromise
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

  it('returns locations and grants for the active organization', async () => {
    const { organization, adminUser, staffMembership, primaryLocation, secondaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)

    await requireTestDB().db.insert(locationGrants).values({
      tenantId: organization.id,
      membershipId: staffMembership.id,
      locationId: secondaryLocation.id,
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { getLocationSettings } = await locationSettingsModulePromise
    const result = await getLocationSettings()

    expect(result.organization.plan).toBe('group')
    expect(result.locations.map((location: { id: string }) => location.id)).toEqual([
      primaryLocation.id,
      secondaryLocation.id,
    ])
    expect(
      result.members.find((member: { membershipId: string }) => member.membershipId === staffMembership.id),
    ).toMatchObject({
      role: 'location_staff',
      locationIds: [secondaryLocation.id],
    })
  })

  it('loads settings for the resolved organization when the session active organization is stale', async () => {
    const { organization, adminUser, primaryLocation, secondaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)
    const [staleOrganization] = await requireTestDB().db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    await requireTestDB().db.insert(locations).values({
      organizationId: staleOrganization.id,
      name: 'Stale Primary',
      slug: `stale-primary-${staleOrganization.id.slice(0, 8)}`,
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, staleOrganization.id))

    const { getLocationSettings } = await locationSettingsModulePromise
    const result = await getLocationSettings()

    expect(result.organization.id).toBe(organization.id)
    expect(result.locations.map((location) => location.id)).toEqual([
      primaryLocation.id,
      secondaryLocation.id,
    ])
  })

  it('does not expose stored location grants for auditors because they are org-wide read-only', async () => {
    const { organization, adminUser, primaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)
    const [auditorUser] = await requireTestDB().db.insert(users).values(makeUser()).returning()
    const [auditorMembership] = await requireTestDB().db
      .insert(memberships)
      .values(
        makeMembership({
          userId: auditorUser.id,
          tenantId: organization.id,
          role: 'auditor',
        }),
      )
      .returning()

    await requireTestDB().db.insert(locationGrants).values({
      tenantId: organization.id,
      membershipId: auditorMembership.id,
      locationId: primaryLocation.id,
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { getLocationSettings } = await locationSettingsModulePromise
    const result = await getLocationSettings()

    expect(
      result.members.find(
        (member: { membershipId: string }) => member.membershipId === auditorMembership.id,
      ),
    ).toMatchObject({
      role: 'auditor',
      locationIds: [],
    })
  })

  it('does not expose location grants outside the active organization', async () => {
    const { organization, adminUser, staffMembership } =
      await seedLocationAdminScenario(requireTestDB().db)
    const [otherOrganization] = await requireTestDB().db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    const [otherLocation] = await requireTestDB().db
      .insert(locations)
      .values({
        organizationId: otherOrganization.id,
        name: 'Other Primary',
        slug: `other-primary-${otherOrganization.id.slice(0, 8)}`,
      })
      .returning()

    await requireTestDB().db.insert(locationGrants).values({
      tenantId: otherOrganization.id,
      membershipId: staffMembership.id,
      locationId: otherLocation.id,
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { getLocationSettings } = await locationSettingsModulePromise
    const result = await getLocationSettings()

    expect(
      result.members.find((member: { membershipId: string }) => member.membershipId === staffMembership.id),
    ).toMatchObject({
      role: 'location_staff',
      locationIds: [],
    })
  })

  it('rejects creating additional locations outside the Group plan', async () => {
    const { organization, adminUser } = await seedLocationAdminScenario(requireTestDB().db, {
      plan: 'clinic',
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { createLocation } = await locationSettingsModulePromise

    await expect(
      createLocation({
        name: 'Satellite Clinic',
      }),
    ).rejects.toThrow('Multi-location support requires Group or higher')
  })

  it('creates a new location for Group organizations', async () => {
    const { organization, adminUser } = await seedLocationAdminScenario(requireTestDB().db)

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { createLocation } = await locationSettingsModulePromise
    const result = await createLocation({
      name: 'Satellite Clinic',
    })

    expect(result.locations).toHaveLength(3)
    expect(
      result.locations.some((location: { name: string }) => location.name === 'Satellite Clinic'),
    ).toBe(true)
  })

  it('creates a new location for Compliance Ops organizations', async () => {
    const { organization, adminUser } = await seedLocationAdminScenario(requireTestDB().db, {
      plan: 'compliance_ops',
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { createLocation } = await locationSettingsModulePromise
    const result = await createLocation({
      name: 'Satellite Clinic',
    })

    expect(result.canCreateAdditionalLocations).toBe(true)
    expect(result.locations).toHaveLength(3)
    expect(
      result.locations.some((location: { name: string }) => location.name === 'Satellite Clinic'),
    ).toBe(true)
  })

  it('rejects deactivating the primary location', async () => {
    const { organization, adminUser, primaryLocation } = await seedLocationAdminScenario(requireTestDB().db)

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocation } = await locationSettingsModulePromise

    await expect(
      updateLocation({
        locationId: primaryLocation.id,
        status: 'inactive',
      }),
    ).rejects.toThrow('The primary location cannot be deactivated')
  })

  it('rejects deactivating a location when scoped members have no other active grants', async () => {
    const { organization, adminUser, staffMembership, secondaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)

    await requireTestDB().db.insert(locationGrants).values({
      tenantId: organization.id,
      membershipId: staffMembership.id,
      locationId: secondaryLocation.id,
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocation } = await locationSettingsModulePromise

    await expect(
      updateLocation({
        locationId: secondaryLocation.id,
        status: 'inactive',
      }),
    ).rejects.toThrow(
      'Reassign location-scoped members before deactivating their only active location',
    )
  })

  it('does not treat grants to another organization as remaining active access when deactivating', async () => {
    const { organization, adminUser, staffMembership, secondaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)
    const [otherOrganization] = await requireTestDB().db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    const [otherLocation] = await requireTestDB().db
      .insert(locations)
      .values({
        organizationId: otherOrganization.id,
        name: 'Other Primary',
        slug: `other-primary-${otherOrganization.id.slice(0, 8)}`,
      })
      .returning()

    await requireTestDB().db.insert(locationGrants).values([
      {
        tenantId: organization.id,
        membershipId: staffMembership.id,
        locationId: secondaryLocation.id,
      },
      {
        tenantId: organization.id,
        membershipId: staffMembership.id,
        locationId: otherLocation.id,
      },
    ])

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocation } = await locationSettingsModulePromise

    await expect(
      updateLocation({
        locationId: secondaryLocation.id,
        status: 'inactive',
      }),
    ).rejects.toThrow(
      'Reassign location-scoped members before deactivating their only active location',
    )
  })

  it('allows deactivating a location after scoped members have another active grant', async () => {
    const { organization, adminUser, staffMembership, primaryLocation, secondaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)

    await requireTestDB().db.insert(locationGrants).values([
      {
        tenantId: organization.id,
        membershipId: staffMembership.id,
        locationId: primaryLocation.id,
      },
      {
        tenantId: organization.id,
        membershipId: staffMembership.id,
        locationId: secondaryLocation.id,
      },
    ])

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocation } = await locationSettingsModulePromise
    const result = await updateLocation({
      locationId: secondaryLocation.id,
      status: 'inactive',
    })

    expect(
      result.locations.find((location: { id: string }) => location.id === secondaryLocation.id),
    ).toMatchObject({ status: 'inactive' })
  })

  it('replaces grants for location-scoped memberships', async () => {
    const { organization, adminUser, staffMembership, primaryLocation, secondaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)

    await requireTestDB().db.insert(locationGrants).values({
      tenantId: organization.id,
      membershipId: staffMembership.id,
      locationId: primaryLocation.id,
    })

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocationGrants } = await locationSettingsModulePromise
    const result = await updateLocationGrants({
      membershipId: staffMembership.id,
      locationIds: [secondaryLocation.id],
    })

    expect(
      result.members.find((member: { membershipId: string }) => member.membershipId === staffMembership.id)
        ?.locationIds,
    ).toEqual([secondaryLocation.id])
  })

  it('rejects grant updates for organization-wide roles', async () => {
    const { organization, adminMembership, adminUser, primaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocationGrants } = await locationSettingsModulePromise

    await expect(
      updateLocationGrants({
        membershipId: adminMembership.id,
        locationIds: [primaryLocation.id],
      }),
    ).rejects.toThrow('Organization-wide roles do not use location grants')
  })

  it('rejects grant updates for auditors because auditor access is organization-wide', async () => {
    const { organization, adminUser, primaryLocation } =
      await seedLocationAdminScenario(requireTestDB().db)
    const [auditorUser] = await requireTestDB().db.insert(users).values(makeUser()).returning()
    const [auditorMembership] = await requireTestDB().db
      .insert(memberships)
      .values(
        makeMembership({
          userId: auditorUser.id,
          tenantId: organization.id,
          role: 'auditor',
        }),
      )
      .returning()

    getSessionFnMock.mockResolvedValue(makeSession(adminUser.id, organization.id))

    const { updateLocationGrants } = await locationSettingsModulePromise

    await expect(
      updateLocationGrants({
        membershipId: auditorMembership.id,
        locationIds: [primaryLocation.id],
      }),
    ).rejects.toThrow('Organization-wide roles do not use location grants')
  })
})

async function seedLocationAdminScenario(
  db: DB,
  overrides?: { plan?: 'essentials' | 'clinic' | 'group' | 'compliance_ops' },
) {
  const [organization] = await db
    .insert(organizations)
    .values(makeOrganization({ plan: overrides?.plan ?? 'group', planStatus: 'active' }))
    .returning()

  const [adminUser] = await db.insert(users).values(makeUser()).returning()
  const [staffUser] = await db.insert(users).values(makeUser()).returning()
  await seedLegalAcceptances(db, organization.id, adminUser.id)

  const [adminMembership] = await db
    .insert(memberships)
    .values(
      makeMembership({
        userId: adminUser.id,
        tenantId: organization.id,
        role: 'org_admin',
      }),
    )
    .returning()

  const [staffMembership] = await db
    .insert(memberships)
    .values(
      makeMembership({
        userId: staffUser.id,
        tenantId: organization.id,
        role: 'location_staff',
      }),
    )
    .returning()

  const [primaryLocation] = await db
    .insert(locations)
    .values({
      organizationId: organization.id,
      name: 'Primary Clinic',
      slug: `primary-${organization.id.slice(0, 8)}`,
      isPrimary: true,
    })
    .returning()

  const secondaryLocation =
    organization.plan === 'group' || organization.plan === 'compliance_ops'
      ? (
          await db
            .insert(locations)
            .values({
              organizationId: organization.id,
              name: 'Secondary Clinic',
              slug: `secondary-${organization.id.slice(0, 8)}`,
            })
            .returning()
        )[0]
      : null

  return {
    organization,
    adminUser,
    staffUser,
    adminMembership,
    staffMembership,
    primaryLocation,
    secondaryLocation: secondaryLocation ?? primaryLocation,
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

function makeReadLocationSettingsDb(selectResults: unknown[][]) {
  return {
    select: vi.fn(() => {
      const result = selectResults.shift() ?? []

      const query = {
        from: vi.fn(() => query),
        where: vi.fn(() => query),
        limit: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        innerJoin: vi.fn(() => query),
        then: (resolve: (rows: unknown[]) => unknown, reject?: (error: unknown) => unknown) =>
          Promise.resolve(result).then(resolve, reject),
      }

      return query
    }),
  }
}
