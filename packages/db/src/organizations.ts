import { and, asc, eq } from 'drizzle-orm'
import { locationGrants } from './schema/location-grants.js'
import { locations } from './schema/locations.js'
import { memberships } from './schema/memberships.js'
import { organizations } from './schema/organizations.js'
import type { DB } from './client.js'

export type MembershipRole =
  | 'org_owner'
  | 'org_admin'
  | 'location_manager'
  | 'location_staff'
  | 'auditor'

export interface OrganizationAccessScope {
  organizationId: string
  role: MembershipRole
  accessLevel: 'organization' | 'location'
  locationIds: string[]
}

export type OrganizationAccess =
  | { status: 'needs-onboarding' }
  | {
      status: 'ready'
      activeOrganizationId: string
      scope: OrganizationAccessScope
    }
  | {
      status: 'switch-required'
      activeOrganizationId: string
      scope: OrganizationAccessScope
    }

export interface ListUserOrganization {
  membershipId: string
  organizationId: string
  organizationName: string
  organizationSlug: string
  role: MembershipRole
}

const ORG_WIDE_ROLES = new Set<MembershipRole>(['org_owner', 'org_admin', 'auditor'])

async function buildScope(
  db: DB,
  organization: ListUserOrganization,
): Promise<OrganizationAccessScope> {
  if (ORG_WIDE_ROLES.has(organization.role)) {
    const rows = await db
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.organizationId, organization.organizationId),
          eq(locations.status, 'active'),
        ),
      )
      .orderBy(asc(locations.createdAt), asc(locations.name))

    return {
      organizationId: organization.organizationId,
      role: organization.role,
      accessLevel: 'organization',
      locationIds: rows.map((row) => row.id),
    }
  }

  const grants = await db
    .select({ locationId: locationGrants.locationId })
    .from(locationGrants)
    .innerJoin(locations, eq(locations.id, locationGrants.locationId))
    .where(
      and(
        eq(locationGrants.tenantId, organization.organizationId),
        eq(locationGrants.membershipId, organization.membershipId),
        eq(locations.organizationId, organization.organizationId),
        eq(locations.status, 'active'),
      ),
    )
    .orderBy(asc(locationGrants.locationId))

  return {
    organizationId: organization.organizationId,
    role: organization.role,
    accessLevel: 'location',
    locationIds: grants.map((grant) => grant.locationId),
  }
}

export async function resolveOrganizationAccess(
  db: DB,
  input: {
    activeOrganizationId: string | null | undefined
    userId: string
  },
): Promise<OrganizationAccess> {
  const userOrganizations = await listUserOrganizations(db, input.userId)

  if (userOrganizations.length === 0) {
    return { status: 'needs-onboarding' }
  }

  if (
    input.activeOrganizationId &&
    userOrganizations.some(
      (organization) => organization.organizationId === input.activeOrganizationId,
    )
  ) {
    const organization = userOrganizations.find(
      (candidate) => candidate.organizationId === input.activeOrganizationId,
    )!

    return {
      status: 'ready',
      activeOrganizationId: input.activeOrganizationId,
      scope: await buildScope(db, organization),
    }
  }

  const [organization] = userOrganizations

  return {
    status: 'switch-required',
    activeOrganizationId: organization.organizationId,
    scope: await buildScope(db, organization),
  }
}

export async function listUserOrganizations(
  db: DB,
  userId: string,
): Promise<ListUserOrganization[]> {
  const rows = await db
    .select({
      membershipId: memberships.id,
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.tenantId))
    .where(and(eq(memberships.userId, userId)))
    .orderBy(asc(organizations.createdAt), asc(organizations.name), asc(memberships.createdAt))

  return rows
}
