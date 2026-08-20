import { faker } from '@faker-js/faker'
import type { NewOrganization } from '../schema/organizations.js'
import type { NewUser } from '../schema/users.phi.js'
import type { NewMembership } from '../schema/memberships.js'

faker.seed(42)

export function makeOrganization(overrides?: Partial<NewOrganization>): NewOrganization {
  const name = faker.company.name()

  return {
    name,
    slug: `${faker.helpers.slugify(name).toLowerCase()}-${faker.string.uuid()}`,
    ...overrides,
  }
}

export function makeUser(overrides?: Partial<NewUser>): NewUser {
  return {
    email: faker.internet.email(),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    ...overrides,
  }
}

export function makeMembership(
  overrides: Partial<NewMembership> & { userId: string; tenantId: string },
): NewMembership {
  return {
    role: 'location_staff',
    ...overrides,
  }
}
