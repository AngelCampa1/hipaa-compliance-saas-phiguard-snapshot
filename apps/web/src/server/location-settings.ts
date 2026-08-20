import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, asc, desc, eq, inArray, ne } from 'drizzle-orm'
import {
  getDb,
  locationGrants,
  locations,
  memberships,
  organizations,
  users,
  type DB,
} from '@phiguard/db/server'
import { writeAuditEvent } from '@phiguard/audit'
import { hasFeatureForOrg } from '@phiguard/billing'
import { PLANS, getMinimumPlanForFeatures } from '@phiguard/billing/plans'
import { getSessionFn } from '../lib/session.js'
import { assertCommercialProductAccess, canManageOrganization, resolveActiveLocationAccess } from './access.js'
import { buildUniqueLocationSlug } from './location-utils.js'

const CreateLocationInput = z.object({
  name: z.string().trim().min(1).max(120),
})

const UpdateLocationInput = z.object({
  locationId: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

const UpdateLocationGrantsInput = z.object({
  membershipId: z.string().uuid(),
  locationIds: z.array(z.string().uuid()).min(1),
})

type OrganizationRole = 'org_owner' | 'org_admin'
const ORG_WIDE_LOCATION_ROLES = new Set(['org_owner', 'org_admin', 'auditor'])
const LOCATION_SCOPED_LOCATION_ROLES = ['location_manager', 'location_staff'] as const
const MULTI_LOCATION_MINIMUM_PLAN_NAME = PLANS[getMinimumPlanForFeatures(['multi_location_rollup'])].name

export async function requireLocationAdmin() {
  const session = await getSessionFn()
  if (!session) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)
  if (!canManageOrganization(access)) {
    throw new Error('Only organization administrators can manage locations')
  }

  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, access.organizationId))
    .limit(1)

  if (!organization) {
    throw new Error('Organization not found')
  }

  return {
    db,
    session,
    access: access as typeof access & {
      role: OrganizationRole
      canAccessAllLocations: true
    },
    organization,
  }
}

export async function readLocationSettings(db: DB, organizationId: string) {
  const [organization, locationRows, memberRows, grantRows] = await Promise.all([
    db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1),
    db
      .select()
      .from(locations)
      .where(eq(locations.organizationId, organizationId))
      .orderBy(desc(locations.isPrimary), asc(locations.createdAt), asc(locations.name)),
    db
      .select({
        membershipId: memberships.id,
        role: memberships.role,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.tenantId, organizationId))
      .orderBy(asc(users.name), asc(users.email)),
    db
      .select({
        membershipId: locationGrants.membershipId,
        locationId: locationGrants.locationId,
      })
      .from(locationGrants)
      .innerJoin(memberships, eq(memberships.id, locationGrants.membershipId))
      .innerJoin(locations, eq(locations.id, locationGrants.locationId))
      .where(
        and(
          eq(locationGrants.tenantId, organizationId),
          eq(memberships.tenantId, organizationId),
          eq(locations.organizationId, organizationId),
        ),
      ),
  ])

  const org = organization[0]

  if (!org) {
    throw new Error('Organization not found')
  }

  const grantMap = new Map<string, string[]>()
  for (const grant of grantRows) {
    const current = grantMap.get(grant.membershipId) ?? []
    current.push(grant.locationId)
    grantMap.set(grant.membershipId, current)
  }

  return {
    organization: {
      id: org.id,
      name: org.name,
      plan: org.plan,
      planStatus: org.planStatus,
      maxMembers: org.maxMembers,
    },
    locations: locationRows,
    members: memberRows.map((member) => ({
      membershipId: member.membershipId,
      userId: member.userId,
      name: member.userName || member.userEmail,
      email: member.userEmail,
      role: member.role,
      locationIds: ORG_WIDE_LOCATION_ROLES.has(member.role)
        ? []
        : grantMap.get(member.membershipId) ?? [],
    })),
    canCreateAdditionalLocations: hasFeatureForOrg(org, 'multi_location_rollup'),
  }
}

export async function getLocationSettings() {
  const { db, organization } = await requireLocationAdmin()
  return readLocationSettings(db, organization.id)
}

export async function createLocation(input: z.infer<typeof CreateLocationInput>) {
  const { db, session, organization } = await requireLocationAdmin()

  if (!hasFeatureForOrg(organization, 'multi_location_rollup')) {
    throw new Error(`Multi-location support requires ${MULTI_LOCATION_MINIMUM_PLAN_NAME} or higher`)
  }

  const slug = await buildUniqueLocationSlug(db, organization.id, input.name)

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(locations)
      .values({
        organizationId: organization.id,
        name: input.name,
        slug,
      })
      .returning({ id: locations.id, name: locations.name, slug: locations.slug, status: locations.status })

    await writeAuditEvent(tx, {
      tenantId: organization.id,
      actorId: session.user.id,
      action: 'organization.location.created',
      resourceType: 'location',
      resourceId: inserted.id,
      before: null,
      after: { name: inserted.name, slug: inserted.slug, status: inserted.status },
    })
  })

  return readLocationSettings(db, organization.id)
}

export async function updateLocation(input: z.infer<typeof UpdateLocationInput>) {
  const { db, session, organization } = await requireLocationAdmin()

  const [current] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, input.locationId),
        eq(locations.organizationId, organization.id),
      ),
    )
    .limit(1)

  if (!current) {
    throw new Error('Location not found')
  }

  if (input.status === 'inactive' && current.isPrimary) {
    throw new Error('The primary location cannot be deactivated')
  }

  if (input.status === 'inactive' && current.status === 'active') {
    const affectedGrants = await db
      .select({ membershipId: locationGrants.membershipId })
      .from(locationGrants)
      .innerJoin(memberships, eq(memberships.id, locationGrants.membershipId))
      .where(
        and(
          eq(locationGrants.tenantId, organization.id),
          eq(locationGrants.locationId, current.id),
          eq(memberships.tenantId, organization.id),
          inArray(memberships.role, LOCATION_SCOPED_LOCATION_ROLES),
        ),
      )

    const affectedMemberIds = [...new Set(affectedGrants.map((grant) => grant.membershipId))]
    if (affectedMemberIds.length > 0) {
      const remainingActiveGrants = await db
        .select({ membershipId: locationGrants.membershipId })
        .from(locationGrants)
        .innerJoin(locations, eq(locations.id, locationGrants.locationId))
        .where(
          and(
            eq(locationGrants.tenantId, organization.id),
            inArray(locationGrants.membershipId, affectedMemberIds),
            ne(locationGrants.locationId, current.id),
            eq(locations.organizationId, organization.id),
            eq(locations.status, 'active'),
          ),
        )

      const membersWithRemainingActiveGrant = new Set(
        remainingActiveGrants.map((grant) => grant.membershipId),
      )
      if (affectedMemberIds.some((membershipId) => !membersWithRemainingActiveGrant.has(membershipId))) {
        throw new Error(
          'Reassign location-scoped members before deactivating their only active location',
        )
      }
    }
  }

  const nextName = input.name?.trim()
  const slug =
    nextName && nextName !== current.name
      ? await buildUniqueLocationSlug(db, organization.id, nextName, current.id)
      : current.slug

  const nextStatus = input.status ?? current.status

  await db.transaction(async (tx) => {
    await tx
      .update(locations)
      .set({
        name: nextName ?? current.name,
        slug,
        status: nextStatus,
      })
      .where(eq(locations.id, current.id))

    await writeAuditEvent(tx, {
      tenantId: organization.id,
      actorId: session.user.id,
      action: 'organization.location.updated',
      resourceType: 'location',
      resourceId: current.id,
      before: { name: current.name, slug: current.slug, status: current.status },
      after: { name: nextName ?? current.name, slug, status: nextStatus },
    })
  })

  return readLocationSettings(db, organization.id)
}

export async function updateLocationGrants(input: z.infer<typeof UpdateLocationGrantsInput>) {
  const { db, session, organization } = await requireLocationAdmin()

  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.id, input.membershipId),
        eq(memberships.tenantId, organization.id),
      ),
    )
    .limit(1)

  if (!membership) {
    throw new Error('Member not found')
  }

  if (ORG_WIDE_LOCATION_ROLES.has(membership.role)) {
    throw new Error('Organization-wide roles do not use location grants')
  }

  const availableLocations = await db
    .select({ id: locations.id })
    .from(locations)
    .where(
      and(
        eq(locations.organizationId, organization.id),
        eq(locations.status, 'active'),
        inArray(locations.id, input.locationIds),
      ),
    )

  if (availableLocations.length !== input.locationIds.length) {
    throw new Error('One or more locations are invalid for this organization')
  }

  await db.transaction(async (tx) => {
    const previousGrants = await tx
      .select({ locationId: locationGrants.locationId })
      .from(locationGrants)
      .where(
        and(
          eq(locationGrants.tenantId, organization.id),
          eq(locationGrants.membershipId, membership.id),
        ),
      )

    await tx
      .delete(locationGrants)
      .where(
        and(
          eq(locationGrants.tenantId, organization.id),
          eq(locationGrants.membershipId, membership.id),
        ),
      )
    await tx.insert(locationGrants).values(
      input.locationIds.map((locationId) => ({
        tenantId: organization.id,
        membershipId: membership.id,
        locationId,
      })),
    )

    await writeAuditEvent(tx, {
      tenantId: organization.id,
      actorId: session.user.id,
      action: 'organization.location.grants_updated',
      resourceType: 'location',
      resourceId: membership.id,
      before: { membershipId: membership.id, locationIds: previousGrants.map((g) => g.locationId) },
      after: { membershipId: membership.id, locationIds: input.locationIds },
    })
  })

  return readLocationSettings(db, organization.id)
}

export const getLocationSettingsFn = createServerFn({ method: 'GET' }).handler(async () =>
  getLocationSettings(),
)

export const createLocationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CreateLocationInput.parse(data))
  .handler(async ({ data }) => createLocation(data))

export const updateLocationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateLocationInput.parse(data))
  .handler(async ({ data }) => updateLocation(data))

export const updateLocationGrantsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateLocationGrantsInput.parse(data))
  .handler(async ({ data }) => updateLocationGrants(data))
