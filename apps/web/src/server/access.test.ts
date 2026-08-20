import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  locationGrants,
  locations,
  memberships,
  organizations,
  users,
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
import {
  canManageOrganization,
  canWriteLocations,
  getReadLocationIds,
  getWriteLocationId,
  resolveActiveLocationAccess,
} from './access.js'

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('location access resolution', () => {
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

  it('returns all organization locations for org-wide roles', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

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

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(access.allowedLocationIds).toEqual([primaryLocation.id, secondaryLocation.id])
    expect(access.defaultLocationId).toBe(primaryLocation.id)
    expect(access.canAccessAllLocations).toBe(true)
  })

  it('excludes inactive locations from org-wide access scopes', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: organization.id,
        role: 'org_admin',
      }),
    )

    const [activeLocation] = await db
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: 'Primary Clinic',
        slug: 'primary-clinic-inactive-test',
        isPrimary: true,
      })
      .returning()

    const [inactiveLocation] = await db
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: 'Closed Clinic',
        slug: 'closed-clinic',
        status: 'inactive',
      })
      .returning()

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(access.allowedLocationIds).toEqual([activeLocation.id])
    expect(access.allowedLocationIds).not.toContain(inactiveLocation.id)
  })

  it('falls back to the user membership organization when the session active organization is stale', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [staleOrganization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: organization.id,
        role: 'org_admin',
      }),
    )

    const [location] = await db
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: 'Primary Clinic',
        slug: 'primary-clinic-stale-session',
        isPrimary: true,
      })
      .returning()

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, staleOrganization.id),
    )

    expect(access.organizationId).toBe(organization.id)
    expect(access.allowedLocationIds).toEqual([location.id])
    expect(access.defaultLocationId).toBe(location.id)
  })

  it('returns only granted locations for location-scoped roles', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    const [membership] = await db
      .insert(memberships)
      .values(
        makeMembership({
          userId: user.id,
          tenantId: organization.id,
          role: 'location_manager',
        }),
      )
      .returning()

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

    await db.insert(locationGrants).values({
      tenantId: organization.id,
      membershipId: membership.id,
      locationId: secondaryLocation.id,
    })

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(access.allowedLocationIds).toEqual([secondaryLocation.id])
    expect(access.defaultLocationId).toBe(secondaryLocation.id)
    expect(access.canAccessAllLocations).toBe(false)
    expect(access.locations).toHaveLength(1)
    expect(access.locations[0]?.id).toBe(secondaryLocation.id)
    expect(access.locations[0]?.id).not.toBe(primaryLocation.id)
  })

  it('excludes inactive granted locations from location-scoped access', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    const [membership] = await db
      .insert(memberships)
      .values(
        makeMembership({
          userId: user.id,
          tenantId: organization.id,
          role: 'location_staff',
        }),
      )
      .returning()

    const [activeLocation] = await db
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: 'Active Clinic',
        slug: 'active-clinic-grant',
      })
      .returning()

    const [inactiveLocation] = await db
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: 'Closed Clinic',
        slug: 'closed-clinic-grant',
        status: 'inactive',
      })
      .returning()

    await db.insert(locationGrants).values([
      {
        tenantId: organization.id,
        membershipId: membership.id,
        locationId: activeLocation.id,
      },
      {
        tenantId: organization.id,
        membershipId: membership.id,
        locationId: inactiveLocation.id,
      },
    ])

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(access.allowedLocationIds).toEqual([activeLocation.id])
    expect(access.allowedLocationIds).not.toContain(inactiveLocation.id)
  })

  it('filters reads to the selected location when it is allowed', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: organization.id,
        role: 'org_owner',
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

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(getReadLocationIds(access, secondaryLocation.id)).toEqual([secondaryLocation.id])
    expect(getReadLocationIds(access)).toEqual([primaryLocation.id, secondaryLocation.id])
  })

  it('rejects read filters for locations outside the caller scope', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    const [membership] = await db
      .insert(memberships)
      .values(
        makeMembership({
          userId: user.id,
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

    await db.insert(locationGrants).values({
      tenantId: organization.id,
      membershipId: membership.id,
      locationId: primaryLocation.id,
    })

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(() => getReadLocationIds(access, secondaryLocation.id)).toThrow(
      'Location not found or access denied',
    )
  })

  it('requires an explicit write location when the caller can access multiple locations', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

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

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(() => getWriteLocationId(access)).toThrow('Location is required')
    expect(getWriteLocationId(access, primaryLocation.id)).toBe(primaryLocation.id)
    expect(getWriteLocationId(access, secondaryLocation.id)).toBe(secondaryLocation.id)
  })

  it('treats auditors as read-only for organization management and writes', async () => {
    const db = requireTestDB().db
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [organization] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group' }))
      .returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: organization.id,
        role: 'auditor',
      }),
    )

    const [location] = await db
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: 'Primary Clinic',
        slug: 'primary-clinic',
        isPrimary: true,
      })
      .returning()

    const access = await resolveActiveLocationAccess(
      db,
      makeSession(user.id, organization.id),
    )

    expect(canManageOrganization(access)).toBe(false)
    expect(canWriteLocations(access)).toBe(false)
    expect(() => getWriteLocationId(access, location.id)).toThrow(
      'Location not found or access denied',
    )
  })
})

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
