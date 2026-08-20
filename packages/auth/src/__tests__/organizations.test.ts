import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import { locationGrants, locations, memberships, organizations, users } from '@phiguard/db'
import { listUserOrganizations, resolveOrganizationAccess } from '../organizations.js'

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('organization access integration', () => {
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

describe('resolveOrganizationAccess', () => {
  it('requires onboarding when the user has no organization memberships', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()

    await expect(
      resolveOrganizationAccess(db, {
        activeOrganizationId: null,
        userId: user.id,
      }),
    ).resolves.toEqual({ status: 'needs-onboarding' })
  })

  it('keeps the current active organization when it belongs to the user', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: org.id,
        role: 'org_owner',
      }),
    )

    await expect(
      resolveOrganizationAccess(db, {
        activeOrganizationId: org.id,
        userId: user.id,
      }),
    ).resolves.toEqual({
      status: 'ready',
      activeOrganizationId: org.id,
      scope: {
        organizationId: org.id,
        role: 'org_owner',
        accessLevel: 'organization',
        locationIds: [],
      },
    })
  })

  it('falls back to the earliest organization membership when the session has no active org', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [firstOrg] = await db.insert(organizations).values(makeOrganization()).returning()
    const [secondOrg] = await db.insert(organizations).values(makeOrganization()).returning()

    await db.insert(memberships).values([
      makeMembership({
        userId: user.id,
        tenantId: firstOrg.id,
        role: 'org_admin',
      }),
      makeMembership({
        userId: user.id,
        tenantId: secondOrg.id,
        role: 'location_staff',
      }),
    ])

    await expect(
      resolveOrganizationAccess(db, {
        activeOrganizationId: null,
        userId: user.id,
      }),
    ).resolves.toEqual({
      status: 'switch-required',
      activeOrganizationId: firstOrg.id,
      scope: {
        organizationId: firstOrg.id,
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })
  })

  it('returns org-wide access for org roles', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()
    const [locationA] = await db.insert(locations).values({
      organizationId: org.id,
      name: 'Main clinic',
      slug: 'main-clinic',
      isPrimary: true,
    }).returning()
    const [locationB] = await db.insert(locations).values({
      organizationId: org.id,
      name: 'North clinic',
      slug: 'north-clinic',
    }).returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: org.id,
        role: 'org_admin',
      }),
    )

    await expect(
      resolveOrganizationAccess(db, {
        activeOrganizationId: org.id,
        userId: user.id,
      }),
    ).resolves.toEqual({
      status: 'ready',
      activeOrganizationId: org.id,
      scope: {
        organizationId: org.id,
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [locationA.id, locationB.id],
      },
    })
  })

  it('treats auditor as an organization-scoped read-only role', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()
    const [locationA] = await db.insert(locations).values({
      organizationId: org.id,
      name: 'Main clinic',
      slug: 'main-clinic',
      isPrimary: true,
    }).returning()
    const [locationB] = await db.insert(locations).values({
      organizationId: org.id,
      name: 'North clinic',
      slug: 'north-clinic',
    }).returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: org.id,
        role: 'auditor',
      }),
    )

    await expect(
      resolveOrganizationAccess(db, {
        activeOrganizationId: org.id,
        userId: user.id,
      }),
    ).resolves.toEqual({
      status: 'ready',
      activeOrganizationId: org.id,
      scope: {
        organizationId: org.id,
        role: 'auditor',
        accessLevel: 'organization',
        locationIds: [locationA.id, locationB.id],
      },
    })
  })

  it('returns granted locations for location-scoped roles', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()
    await db.insert(locations).values({
      organizationId: org.id,
      name: 'Main clinic',
      slug: 'main-clinic',
      isPrimary: true,
    }).returning()
    const [locationB] = await db.insert(locations).values({
      organizationId: org.id,
      name: 'North clinic',
      slug: 'north-clinic',
    }).returning()

    const [membership] = await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: org.id,
        role: 'location_manager',
      }),
    ).returning()

    await db.insert(locationGrants).values({
      tenantId: org.id,
      membershipId: membership.id,
      locationId: locationB.id,
    })

    await expect(
      resolveOrganizationAccess(db, {
        activeOrganizationId: org.id,
        userId: user.id,
      }),
    ).resolves.toEqual({
      status: 'ready',
      activeOrganizationId: org.id,
      scope: {
        organizationId: org.id,
        role: 'location_manager',
        accessLevel: 'location',
        locationIds: [locationB.id],
      },
    })
  })
})

describe('listUserOrganizations', () => {
  it('returns accepted organizations for the current user with membership roles', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()

    await db.insert(memberships).values(
      makeMembership({
        userId: user.id,
        tenantId: org.id,
        role: 'org_admin',
      }),
    )

    await expect(listUserOrganizations(db, user.id)).resolves.toEqual([
      expect.objectContaining({
        organizationId: org.id,
        organizationName: org.name,
        organizationSlug: org.slug,
        role: 'org_admin',
      }),
    ])
  })
})
})
