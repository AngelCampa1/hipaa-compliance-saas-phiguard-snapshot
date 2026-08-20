import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { locationGrants } from './schema/location-grants.js'
import { locations } from './schema/locations.js'
import { memberships } from './schema/memberships.js'
import { organizations } from './schema/organizations.js'
import { users } from './schema/users.phi.js'
import { resolveOrganizationAccess } from './organizations.js'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from './testing/index.js'

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('organization access resolution', () => {
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

  it('ignores location grants outside the resolved organization', async () => {
    const { db } = requireTestDB()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()
    const [otherOrg] = await db.insert(organizations).values(makeOrganization()).returning()
    const [membership] = await db
      .insert(memberships)
      .values(
        makeMembership({
          userId: user.id,
          tenantId: org.id,
          role: 'location_staff',
        }),
      )
      .returning()
    const [location] = await db
      .insert(locations)
      .values({
        organizationId: org.id,
        name: 'Primary',
        slug: 'primary',
      })
      .returning()
    const [otherLocation] = await db
      .insert(locations)
      .values({
        organizationId: otherOrg.id,
        name: 'Other Primary',
        slug: 'primary',
      })
      .returning()

    await db.insert(locationGrants).values([
      {
        tenantId: org.id,
        membershipId: membership.id,
        locationId: location.id,
      },
      {
        tenantId: otherOrg.id,
        membershipId: membership.id,
        locationId: otherLocation.id,
      },
    ])

    const access = await resolveOrganizationAccess(db, {
      activeOrganizationId: org.id,
      userId: user.id,
    })

    if (access.status !== 'ready') {
      throw new Error(`Expected ready access, received ${access.status}`)
    }

    expect(access.scope.locationIds).toEqual([location.id])
  })
})
