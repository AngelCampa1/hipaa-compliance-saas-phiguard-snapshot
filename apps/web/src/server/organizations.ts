import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'
import type { DB } from '@phiguard/db'
import { logger, writeAuditEvent } from '@phiguard/audit'
import { BaaService } from '@phiguard/baa'
import { PLANS, PUBLIC_PLAN_IDS, isTrialAllAccess } from '@phiguard/billing'
import type { Role } from '@phiguard/auth'
import type { AppSession } from '../lib/session'
import { toAppSession } from '../lib/session'
import { assertCommercialProductAccess } from './access.js'
import { buildUniqueLocationSlug } from './location-utils.js'

// Highest member capacity across all plans. Used as the trial member cap so a
// trialing org with full access (and possibly no plan yet) is not blocked by a
// stored plan cap before they choose a plan.
const MAX_TRIAL_MEMBERS = Math.max(...Object.values(PLANS).map((plan) => plan.maxMembers))

const BootstrapOrganizationInput = z.object({
  clinicName: z.string().trim().min(1).max(120),
  inviteEmail: z.string().trim().email().optional().or(z.literal('')),
  interestedPlan: z.enum(PUBLIC_PLAN_IDS).optional(),
})

const SwitchOrganizationInput = z.object({
  organizationId: z.string().uuid(),
})

export const InviteMemberInput = z.object({
  email: z.string().trim().email(),
  role: z
    .enum(['org_admin', 'auditor', 'location_manager', 'location_staff'])
    .default('location_staff'),
  locationId: z.string().uuid().optional(),
})

// Invitation ids are Postgres `uuid` columns, so validate the shape here. A
// malformed id (e.g. a hand-edited accept-invite URL) is rejected before it
// reaches the DB, where a uuid cast would otherwise throw a raw "Failed query:
// select … from organization_invitations …" error straight to the client.
const AcceptInvitationInput = z.object({
  invitationId: z.string().uuid(),
})

const CancelInvitationInput = z.object({
  invitationId: z.string().uuid(),
})

const ResendInvitationInput = z.object({
  invitationId: z.string().uuid(),
})

const UpdateMemberRoleInput = z.object({
  memberId: z.string().min(1),
  role: z.enum(['org_admin', 'auditor', 'location_manager', 'location_staff']),
})

const RemoveMemberInput = z.object({
  memberId: z.string().min(1),
})

const MANAGEABLE_MEMBER_ROLES = [
  'org_admin',
  'auditor',
  'location_manager',
  'location_staff',
] as const
type ManageableMemberRole = (typeof MANAGEABLE_MEMBER_ROLES)[number]
const LOCATION_SCOPED_MEMBER_ROLES = new Set(['location_manager', 'location_staff'])

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

export type AppSessionAccess =
  | { status: 'unauthenticated' }
  | {
      status: 'needs-onboarding'
      session: AppSession
    }
  | {
      status: 'ready'
      session: AppSession
      activeOrganizationId: string
      commercial: {
        plan: string | null
        planStatus:
          | 'selection_required'
          | 'trial_pending'
          | 'trialing'
          | 'active'
          | 'paused'
          | 'past_due'
          | 'canceled'
        trialStartedAt: Date | null
        trialEndsAt: Date | null
        stripeCustomerId: string | null
        stripeSubscriptionId: string | null
        baaSignedAt: Date | null
        termsAcceptedAt: Date | null
      } | null
    }

type MemberListMember = {
  id: string
  role: string
}

export function filterPendingInvitations<T extends { status?: string | null }>(
  invitations: T[],
): T[] {
  return invitations.filter((invitation) => invitation.status === 'pending')
}

async function loadOrganizationsDb() {
  return import('@phiguard/db/server')
}

async function loadOrganizationAuth() {
  return import('@phiguard/auth')
}

async function requireOrganizationAccess() {
  const { request, session } = await requireSession()
  const { auth, resolveOrganizationAccess } = await loadOrganizationAuth()
  const { getDb } = await loadOrganizationsDb()
  const access = await resolveOrganizationAccess(getDb(), {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  })

  if (access.status === 'needs-onboarding') {
    throw new Error('No active organization')
  }

  if (access.status === 'switch-required') {
    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId: access.activeOrganizationId,
      },
    })
  }

  return {
    request,
    session,
    access,
  }
}

async function requireMemberManagementAccess() {
  const { canManageMembers } = await loadOrganizationAuth()
  const { request, session, access } = await requireOrganizationAccess()

  if (!canManageMembers(access.scope.role)) {
    throw new Error('Only managers and administrators can manage members')
  }

  return {
    request,
    session,
    organizationId: access.activeOrganizationId,
    role: access.scope.role,
    scope: access.scope,
  }
}

async function assertLocationScopedMemberManagement(input: {
  db: DB
  organizationId: string
  actorScope: {
    accessLevel: 'organization' | 'location'
    locationIds: string[]
  }
  memberId: string
  memberRole: string
}) {
  if (input.actorScope.accessLevel === 'organization') {
    return
  }

  if (input.memberRole !== 'location_staff') {
    return
  }

  if (input.actorScope.locationIds.length === 0) {
    throw new Error('Member is outside your location scope')
  }

  const { locationGrants } = await loadOrganizationsDb()
  const targetGrants = await input.db
    .select({ locationId: locationGrants.locationId })
    .from(locationGrants)
    .where(
      and(
        eq(locationGrants.tenantId, input.organizationId),
        eq(locationGrants.membershipId, input.memberId),
      ),
    )
    .limit(100)

  const actorLocationIds = new Set(input.actorScope.locationIds)
  if (!targetGrants.some((grant) => actorLocationIds.has(grant.locationId))) {
    throw new Error('Member is outside your location scope')
  }
}

async function ensureLocationGrantForLocationScopedRole(input: {
  db: DB
  organizationId: string
  memberId: string
  targetRole: ManageableMemberRole
}): Promise<{ createdLocationGrantId: string | null }> {
  if (!LOCATION_SCOPED_MEMBER_ROLES.has(input.targetRole)) {
    return { createdLocationGrantId: null }
  }

  const { locationGrants, locations } = await loadOrganizationsDb()
  const existingGrant = await input.db
    .select({ locationId: locationGrants.locationId })
    .from(locationGrants)
    .innerJoin(locations, eq(locations.id, locationGrants.locationId))
    .where(
      and(
        eq(locationGrants.tenantId, input.organizationId),
        eq(locationGrants.membershipId, input.memberId),
        eq(locations.status, 'active'),
      ),
    )
    .limit(1)

  if (existingGrant.length > 0) {
    return { createdLocationGrantId: null }
  }

  const [defaultLocation] = await input.db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.organizationId, input.organizationId), eq(locations.status, 'active')))
    .orderBy(desc(locations.isPrimary), asc(locations.createdAt), asc(locations.name))
    .limit(1)

  if (!defaultLocation) {
    throw new Error('Location-scoped roles require at least one active location')
  }

  await input.db
    .insert(locationGrants)
    .values({
      tenantId: input.organizationId,
      membershipId: input.memberId,
      locationId: defaultLocation.id,
    })
    .onConflictDoNothing()

  return { createdLocationGrantId: defaultLocation.id }
}

async function deleteProvisionedLocationGrant(input: {
  db: DB
  organizationId: string
  memberId: string
  locationId: string | null
}) {
  if (!input.locationId) {
    return
  }

  const { locationGrants } = await loadOrganizationsDb()
  await input.db
    .delete(locationGrants)
    .where(
      and(
        eq(locationGrants.tenantId, input.organizationId),
        eq(locationGrants.membershipId, input.memberId),
        eq(locationGrants.locationId, input.locationId),
      ),
    )
}

async function resolveInvitationLocationId(input: {
  db: DB
  organizationId: string
  targetRole: 'org_admin' | 'auditor' | 'location_manager' | 'location_staff'
  requestedLocationId?: string
  actorRole: Role
  actorScope: {
    accessLevel: 'organization' | 'location'
    locationIds: string[]
  }
}) {
  if (input.targetRole !== 'location_manager' && input.targetRole !== 'location_staff') {
    return undefined
  }

  const locationId =
    input.requestedLocationId ??
    (input.actorRole === 'location_manager' && input.actorScope.locationIds.length === 1
      ? input.actorScope.locationIds[0]
      : undefined)

  if (!locationId) {
    throw new Error('Location is required for location-scoped member invitations')
  }

  if (
    input.actorScope.accessLevel === 'location' &&
    !input.actorScope.locationIds.includes(locationId)
  ) {
    throw new Error('Location is outside your location scope')
  }

  const { locations } = await loadOrganizationsDb()
  const [location] = await input.db
    .select({ id: locations.id })
    .from(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.organizationId, input.organizationId),
        eq(locations.status, 'active'),
      ),
    )
    .limit(1)

  if (!location) {
    throw new Error('Invitation location not found')
  }

  return location.id
}

async function resolveManageableMemberIds(input: {
  db: DB
  organizationId: string
  actorRole: Role
  actorScope: {
    accessLevel: 'organization' | 'location'
    locationIds: string[]
  }
  members: MemberListMember[]
  canManage: boolean
  canManageMemberRole: (actorRole: Role, targetRole: Role) => boolean
}) {
  const roleManageableMembers = input.members.filter(
    (member) =>
      member.role !== 'org_owner' &&
      input.canManage &&
      canMemberRoleBeManaged(input.actorRole, member.role, input.canManageMemberRole),
  )

  if (input.actorScope.accessLevel === 'organization') {
    return new Set(roleManageableMembers.map((member) => member.id))
  }

  const locationScopedMembers = roleManageableMembers.filter(
    (member) => member.role === 'location_staff',
  )

  if (!locationScopedMembers.length || input.actorScope.locationIds.length === 0) {
    return new Set<string>()
  }

  const { locationGrants } = await loadOrganizationsDb()
  const targetGrants = await input.db
    .select({
      membershipId: locationGrants.membershipId,
      locationId: locationGrants.locationId,
    })
    .from(locationGrants)
    .where(
      and(
        eq(locationGrants.tenantId, input.organizationId),
        inArray(
          locationGrants.membershipId,
          locationScopedMembers.map((member) => member.id),
        ),
      ),
    )
    .limit(500)

  const actorLocationIds = new Set(input.actorScope.locationIds)
  return new Set(
    targetGrants
      .filter((grant) => actorLocationIds.has(grant.locationId))
      .map((grant) => grant.membershipId),
  )
}

function canMemberRoleBeManaged(
  actorRole: Role,
  targetRole: string,
  canManageMemberRole: (actorRole: Role, targetRole: Role) => boolean,
) {
  return (
    (targetRole === 'org_admin' ||
      targetRole === 'auditor' ||
      targetRole === 'location_manager' ||
      targetRole === 'location_staff') &&
    canManageMemberRole(actorRole, targetRole)
  )
}

async function assertMemberCapacity(organizationId: string) {
  const { getDb, memberships, organizationInvitations, organizations } = await loadOrganizationsDb()
  const db = getDb()
  const [organization] = await db
    .select({
      maxMembers: organizations.maxMembers,
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialEndsAt: organizations.trialEndsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!organization) {
    throw new Error('Organization not found')
  }

  // During an active trial the org has full app access and may not have picked a
  // plan yet, so the plan-derived member cap should not bind. Use the highest
  // plan capacity until the trial converts to a paid plan.
  const effectiveMaxMembers = isTrialAllAccess({
    plan: organization.plan,
    planStatus: organization.planStatus,
    trialEndsAt: organization.trialEndsAt,
  })
    ? Math.max(organization.maxMembers, MAX_TRIAL_MEMBERS)
    : organization.maxMembers

  const [activeMembers] = await db
    .select({ count: count() })
    .from(memberships)
    .where(eq(memberships.tenantId, organizationId))
    .limit(1)

  const [pendingInvitations] = await db
    .select({ count: count() })
    .from(organizationInvitations)
    .where(
      and(
        eq(organizationInvitations.organizationId, organizationId),
        eq(organizationInvitations.status, 'pending'),
      ),
    )
    .limit(1)

  if ((activeMembers?.count ?? 0) + (pendingInvitations?.count ?? 0) >= effectiveMaxMembers) {
    throw new Error('Member limit reached for this plan')
  }
}

function toSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

async function generateOrganizationSlug(clinicName: string) {
  const { getDb, organizations } = await loadOrganizationsDb()
  const db = getDb()
  const base = toSlugPart(clinicName) || 'clinic'

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${Math.random().toString(36).slice(2, 7)}`
    const candidate = `${base}${suffix}`.slice(0, 52)
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, candidate))
      .limit(1)

    if (!existing) {
      return candidate
    }
  }

  throw new Error('Unable to generate a unique organization slug')
}

export async function ensurePrimaryLocationForOrganization(input: {
  db: DB
  organizationId: string
  locationName: string
}) {
  const { locations } = await loadOrganizationsDb()
  const [existingPrimaryLocation] = await input.db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.organizationId, input.organizationId), eq(locations.isPrimary, true)))
    .limit(1)

  if (existingPrimaryLocation) {
    return existingPrimaryLocation.id
  }

  const slug = await buildUniqueLocationSlug(input.db, input.organizationId, input.locationName)

  const [primaryLocation] = await input.db
    .insert(locations)
    .values({
      organizationId: input.organizationId,
      name: input.locationName,
      slug,
      isPrimary: true,
    })
    .returning({ id: locations.id })

  if (!primaryLocation) {
    throw new Error('Failed to create primary location: insert returned no row')
  }

  return primaryLocation.id
}

async function requireSession() {
  const request = getRequest()
  const session = await resolveOrganizationSession(request.headers)

  if (!session?.session || !session.user) {
    throw new Error('Unauthorized')
  }

  return {
    request,
    session,
  }
}

export const ensureAppSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const session = await resolveOrganizationSession(request.headers)

  if (!session?.session || !session.user) {
    return { status: 'unauthenticated' } satisfies AppSessionAccess
  }

  const { getDb } = await loadOrganizationsDb()
  const { auth, resolveOrganizationAccess } = await loadOrganizationAuth()
  const access = await resolveOrganizationAccess(getDb(), {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  })

  if (access.status === 'needs-onboarding') {
    return {
      status: 'needs-onboarding',
      session,
    } satisfies AppSessionAccess
  }

  if (access.status === 'switch-required') {
    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId: access.activeOrganizationId,
      },
    })

    const commercial = await getOrganizationCommercialState(access.activeOrganizationId)

    return {
      status: 'ready',
      session: {
        ...session,
        session: {
          ...session.session,
          activeOrganizationId: access.activeOrganizationId,
        },
      },
      activeOrganizationId: access.activeOrganizationId,
      commercial,
    } satisfies AppSessionAccess
  }

  const commercial = await getOrganizationCommercialState(access.activeOrganizationId)

  return {
    status: 'ready',
    session,
    activeOrganizationId: access.activeOrganizationId,
    commercial,
  } satisfies AppSessionAccess
})

async function resolveOrganizationSession(headers: Headers) {
  const { auth, resolveOrganizationAccess } = await loadOrganizationAuth()
  const session = toAppSession(await auth.api.getSession({ headers }))
  if (!session?.session || !session.user) {
    return null
  }

  if (session.session.activeOrganizationId) {
    return session
  }

  const access = await resolveOrganizationAccess((await loadOrganizationsDb()).getDb(), {
    activeOrganizationId: undefined,
    userId: session.user.id,
  })

  if (access.status === 'ready' || access.status === 'switch-required') {
    return {
      ...session,
      session: {
        ...session.session,
        activeOrganizationId: access.activeOrganizationId,
      },
    } satisfies AppSession
  }

  return session
}

async function getOrganizationCommercialState(organizationId: string) {
  const { getDb, organizations } = await loadOrganizationsDb()
  const db = getDb()
  const [organization] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialStartedAt: organizations.trialStartedAt,
      trialEndsAt: organizations.trialEndsAt,
      stripeCustomerId: organizations.stripeCustomerId,
      stripeSubscriptionId: organizations.stripeSubscriptionId,
      baaSignedAt: organizations.baaSignedAt,
      termsAcceptedAt: organizations.termsAcceptedAt,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!organization) {
    return null
  }

  const legalStatus = await new BaaService().getLegalStatus({ orgId: organizationId }, db)
  const legalCurrent = Boolean(
    legalStatus.terms.acceptedAt &&
    legalStatus.baa.acceptedAt &&
    legalStatus.terms.isCurrent &&
    legalStatus.baa.isCurrent,
  )

  return {
    ...organization,
    legalCurrent,
  }
}

async function assertOrganizationProductAccess(organizationId: string) {
  const commercial = await getOrganizationCommercialState(organizationId)
  assertCommercialProductAccess({ commercial })
}

export const getOrganizationNavigationFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { request, session } = await requireSession()
  const { getDb, locations, memberships, organizations } = await loadOrganizationsDb()
  const { auth, resolveOrganizationAccess } = await loadOrganizationAuth()
  const db = getDb()
  const access = await resolveOrganizationAccess(db, {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  })
  const organizationList = await auth.api.listOrganizations({
    headers: request.headers,
  })

  const activeOrganization =
    access.status === 'ready'
      ? await auth.api.getFullOrganization({
          headers: request.headers,
          query: {
            organizationId: access.activeOrganizationId,
          },
        })
      : null

  const accessibleLocations =
    access.status === 'ready' && access.scope.locationIds.length
      ? await db
          .select({
            id: locations.id,
            name: locations.name,
            status: locations.status,
            isPrimary: locations.isPrimary,
          })
          .from(locations)
          .where(
            and(
              eq(locations.organizationId, access.activeOrganizationId),
              inArray(locations.id, access.scope.locationIds),
            ),
          )
          .orderBy(desc(locations.isPrimary), asc(locations.createdAt), asc(locations.name))
      : []

  const [commercialOrganization] =
    access.status === 'ready'
      ? await db
          .select({
            plan: organizations.plan,
            planStatus: organizations.planStatus,
          })
          .from(organizations)
          .where(eq(organizations.id, access.activeOrganizationId))
          .limit(1)
      : []

  const [memberSummary] =
    access.status === 'ready'
      ? await db
          .select({ count: count() })
          .from(memberships)
          .where(eq(memberships.tenantId, access.activeOrganizationId))
      : []

  const platformAdminEmails = new Set(
    (process.env.PLATFORM_ADMIN_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
  const isSystemAdmin = platformAdminEmails.has((session.user.email ?? '').toLowerCase())

  return {
    session,
    organizations: organizationList,
    activeOrganization,
    locationAccess: access.status === 'ready' ? access.scope : null,
    accessibleLocations,
    isSystemAdmin,
    analyticsContext:
      access.status === 'ready'
        ? {
            distinctId: session.user.id,
            organization: {
              id: access.activeOrganizationId,
              plan: commercialOrganization?.plan ?? null,
              planStatus: commercialOrganization?.planStatus ?? null,
              memberCount: memberSummary?.count ?? 0,
              locationCount: accessibleLocations.length,
            },
          }
        : null,
  }
})

export const bootstrapOrganizationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => BootstrapOrganizationInput.parse(data))
  .handler(async ({ data }) => {
    type BootstrappedOrganization = {
      id: string
      name: string
      slug: string
    }

    const { request, session } = await requireSession()
    const { getDb, memberships, organizations, partners, referrals, sessions } =
      await loadOrganizationsDb()
    const db = getDb()
    const slug = await generateOrganizationSlug(data.clinicName)

    let organization: BootstrappedOrganization | null = null

    await db.transaction(async (tx) => {
      const selectedPlan = data.interestedPlan ? PLANS[data.interestedPlan] : null
      const [createdOrganization] = await tx
        .insert(organizations)
        .values({
          name: data.clinicName,
          slug,
          planStatus: 'trial_pending',
          interestedPlan: data.interestedPlan ?? null,
          ...(selectedPlan
            ? {
                plan: selectedPlan.id,
                maxMembers: selectedPlan.maxMembers,
                billingPriceMonthlyCents: selectedPlan.priceMonthly * 100,
                planSelectedAt: new Date(),
              }
            : {}),
        })
        .returning({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        })

      if (!createdOrganization) {
        throw new Error('Failed to create organization')
      }

      organization = createdOrganization as BootstrappedOrganization

      await tx
        .insert(memberships)
        .values({
          userId: session.user.id,
          tenantId: createdOrganization.id,
          role: 'org_owner',
        })
        .onConflictDoNothing()

      await tx
        .update(sessions)
        .set({ activeOrganizationId: createdOrganization.id })
        .where(eq(sessions.id, session.session.id))

      await ensurePrimaryLocationForOrganization({
        // tx satisfies DB's query interface at runtime; cast required due to Drizzle's
        // PgTransaction not extending PostgresJsDatabase in the TypeScript type hierarchy
        db: tx as unknown as DB,
        organizationId: createdOrganization.id,
        locationName: data.clinicName,
      })

      await writeAuditEvent(tx, {
        tenantId: createdOrganization.id,
        actorId: session.user.id,
        action: 'org.created',
        resourceType: 'organization',
        resourceId: createdOrganization.id,
      })

      const { parseReferralCodeFromCookies } = await import('@phiguard/billing')
      const refCode = parseReferralCodeFromCookies(request.headers.get('cookie'))
      if (refCode) {
        const [partner] = await tx
          .select()
          .from(partners)
          .where(eq(partners.referralCode, refCode))
          .limit(1)
        if (partner && partner.status === 'active') {
          await tx
            .insert(referrals)
            .values({
              partnerId: partner.id,
              organizationId: createdOrganization.id,
              signedUpAt: new Date(),
            })
            .onConflictDoNothing()
        }
      }
    })

    if (!organization) {
      throw new Error('Failed to create organization')
    }
    const createdOrganization: BootstrappedOrganization = organization

    return {
      organization: createdOrganization,
      invitation: null,
    }
  })

export const switchActiveOrganizationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => SwitchOrganizationInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session } = await requireSession()
    const { auth } = await loadOrganizationAuth()
    const { getDb, memberships } = await loadOrganizationsDb()
    const db = getDb()

    // Verify the caller is an active member of the target organization before
    // switching the session. Without this check any authenticated user could
    // switch into an arbitrary org by guessing a UUID.
    const [membership] = await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, session.user.id),
          eq(memberships.tenantId, data.organizationId),
        ),
      )
      .limit(1)

    if (!membership) {
      logger.safe.warn(
        { userId: session.user.id },
        'switchActiveOrganizationFn: caller is not a member of the target organization',
      )
      throw new Error('You do not have access to this organization')
    }

    return auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId: data.organizationId,
      },
    })
  })

export const getMembersAndInvitationsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { auth, canAssignMemberRole, canInviteMemberRole, canManageMemberRole, canManageMembers } =
    await loadOrganizationAuth()
  const { getDb } = await loadOrganizationsDb()
  const { request, access } = await requireOrganizationAccess()
  const organizationId = access.activeOrganizationId
  const actorRole = access.scope.role
  const canManage = canManageMembers(actorRole)
  const db = getDb()

  await assertOrganizationProductAccess(organizationId)

  const [organization, invitations] = await Promise.all([
    auth.api.getFullOrganization({
      headers: request.headers,
      query: {
        organizationId,
      },
    }),
    canManage
      ? auth.api.listInvitations({
          headers: request.headers,
          query: {
            organizationId,
          },
        })
      : Promise.resolve([]),
  ])
  const members = (organization?.members ?? []).map((member) => ({
    id: member.id,
    role: member.role,
  }))
  const manageableMemberIds = await resolveManageableMemberIds({
    db,
    organizationId,
    actorRole,
    actorScope: access.scope,
    members,
    canManage,
    canManageMemberRole,
  })
  const organizationWithMemberFlags = organization
    ? {
        ...organization,
        members: (organization.members ?? []).map((member) => ({
          ...member,
          canManage: manageableMemberIds.has(member.id),
        })),
      }
    : organization

  return {
    organization: organizationWithMemberFlags,
    invitations: filterPendingInvitations(invitations),
    canAdmin: access.scope.role === 'org_owner' || access.scope.role === 'org_admin',
    canManageMembers: canManage,
    inviteableRoles: MANAGEABLE_MEMBER_ROLES.filter((targetRole) =>
      canInviteMemberRole(actorRole, targetRole),
    ),
    assignableRoles: MANAGEABLE_MEMBER_ROLES.filter((targetRole) =>
      canAssignMemberRole(actorRole, targetRole),
    ),
    manageableRoles: MANAGEABLE_MEMBER_ROLES.filter((targetRole) =>
      canManageMemberRole(actorRole, targetRole),
    ),
  }
})

export const inviteOrganizationMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => InviteMemberInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session, organizationId, role, scope } = await requireMemberManagementAccess()
    const { auth, canInviteMemberRole } = await loadOrganizationAuth()

    await assertOrganizationProductAccess(organizationId)
    if (!canInviteMemberRole(role, data.role)) {
      throw new Error('Only organization administrators can manage privileged member roles')
    }
    await assertMemberCapacity(organizationId)
    const { getDb } = await loadOrganizationsDb()
    const teamId = await resolveInvitationLocationId({
      db: getDb(),
      organizationId,
      targetRole: data.role,
      requestedLocationId: data.locationId,
      actorRole: role,
      actorScope: scope,
    })

    const invitation = await auth.api.createInvitation({
      headers: request.headers,
      body: {
        email: data.email,
        role: data.role,
        organizationId,
        ...(teamId ? { teamId } : {}),
      },
    })

    try {
      await writeAuditEvent(getDb(), {
        tenantId: organizationId,
        actorId: session.user.id,
        action: 'organization.member_invited',
        resourceType: 'organization_invitation',
        resourceId: invitation.id,
        after: { role: data.role },
      })
    } catch (error) {
      try {
        await auth.api.cancelInvitation({
          headers: request.headers,
          body: { invitationId: invitation.id },
        })
      } catch {
        // Preserve the audit failure for callers; cancellation is best-effort
        // because the invitation was already created.
      }
      throw error
    }

    return invitation
  })

export const acceptOrganizationInvitationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => AcceptInvitationInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session } = await requireSession()
    const { auth } = await loadOrganizationAuth()

    const { getDb, locationGrants, locations, memberships, organizationInvitations } =
      await loadOrganizationsDb()
    const db = getDb()

    const [invitation] = await db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.id, data.invitationId))
      .limit(1)

    if (!invitation) {
      throw new Error(`Invitation ${data.invitationId} not found`)
    }

    if (normalizeEmail(session.user.email) !== normalizeEmail(invitation.email)) {
      throw new Error('Sign in with the invited email address before accepting this invitation')
    }

    if (!session.user.emailVerified) {
      throw new Error('Verify the invited email address before accepting this invitation')
    }

    await assertOrganizationProductAccess(invitation.organizationId)

    const accepted = await auth.api.acceptInvitation({
      headers: request.headers,
      body: {
        invitationId: data.invitationId,
      },
    })

    try {
      await db.transaction(async (tx) => {
        await writeAuditEvent(tx, {
          tenantId: invitation.organizationId,
          actorId: session.user.id,
          action: 'invitation.accepted',
          resourceType: 'organization_invitation',
          resourceId: data.invitationId,
        })

        if (invitation.role === 'location_manager' || invitation.role === 'location_staff') {
          const [membership] = await tx
            .select()
            .from(memberships)
            .where(
              and(
                eq(memberships.userId, session.user.id),
                eq(memberships.tenantId, invitation.organizationId),
              ),
            )
            .limit(1)

          const [targetLocation] = await tx
            .select()
            .from(locations)
            .where(
              invitation.teamId
                ? and(
                    eq(locations.organizationId, invitation.organizationId),
                    eq(locations.id, invitation.teamId),
                    eq(locations.status, 'active'),
                  )
                : and(
                    eq(locations.organizationId, invitation.organizationId),
                    eq(locations.isPrimary, true),
                    eq(locations.status, 'active'),
                  ),
            )
            .limit(1)

          if (membership && targetLocation) {
            await tx
              .insert(locationGrants)
              .values({
                tenantId: invitation.organizationId,
                membershipId: membership.id,
                locationId: targetLocation.id,
              })
              .onConflictDoNothing()
          } else if (membership) {
            throw new Error('Invitation location not found')
          }
        }
      })
    } catch (error) {
      await auth.api.removeMember({
        headers: request.headers,
        body: {
          memberIdOrEmail: session.user.email,
          organizationId: invitation.organizationId,
        },
      })

      await db
        .update(organizationInvitations)
        .set({ status: 'pending' })
        .where(
          and(
            eq(organizationInvitations.id, data.invitationId),
            eq(organizationInvitations.organizationId, invitation.organizationId),
          ),
        )

      throw error
    }

    return accepted
  })

export const cancelInvitationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CancelInvitationInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session, organizationId, role } = await requireMemberManagementAccess()
    const { auth, canManageMemberRole } = await loadOrganizationAuth()
    const { getDb, organizationInvitations } = await loadOrganizationsDb()
    const db = getDb()
    const [invitation] = await db
      .select({
        id: organizationInvitations.id,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
        status: organizationInvitations.status,
        teamId: organizationInvitations.teamId,
      })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.id, data.invitationId),
          eq(organizationInvitations.organizationId, organizationId),
        ),
      )
      .limit(1)

    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') {
      throw new Error('Only pending invitations can be canceled')
    }
    if (!canManageMemberRole(role, invitation.role)) {
      throw new Error('Only organization administrators can manage privileged member roles')
    }
    await assertOrganizationProductAccess(organizationId)

    await auth.api.cancelInvitation({
      headers: request.headers,
      body: { invitationId: data.invitationId },
    })

    try {
      await writeAuditEvent(db, {
        tenantId: organizationId,
        actorId: session.user.id,
        action: 'invitation.canceled',
        resourceType: 'organization_invitation',
        resourceId: data.invitationId,
      })
    } catch (error) {
      try {
        await auth.api.createInvitation({
          headers: request.headers,
          body: {
            email: invitation.email,
            role: invitation.role as
              | 'org_admin'
              | 'auditor'
              | 'location_manager'
              | 'location_staff',
            organizationId,
            ...(invitation.teamId ? { teamId: invitation.teamId } : {}),
          },
        })
      } catch {
        // Preserve the audit failure for callers; restoration is best-effort
        // because the original invitation is already canceled.
      }
      throw error
    }
  })

export const resendInvitationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ResendInvitationInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session, organizationId, role } = await requireMemberManagementAccess()
    const { auth, canManageMemberRole } = await loadOrganizationAuth()

    const { getDb, organizationInvitations } = await loadOrganizationsDb()
    const db = getDb()

    const [invitation] = await db
      .select()
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.id, data.invitationId),
          eq(organizationInvitations.organizationId, organizationId),
        ),
      )
      .limit(1)

    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') {
      throw new Error('Only pending invitations can be resent')
    }
    if (!canManageMemberRole(role, invitation.role)) {
      throw new Error('Only organization administrators can manage privileged member roles')
    }
    await assertOrganizationProductAccess(organizationId)

    const invitationBody = {
      email: invitation.email,
      role: invitation.role as 'org_admin' | 'auditor' | 'location_manager' | 'location_staff',
      organizationId,
      ...(invitation.teamId ? { teamId: invitation.teamId } : {}),
    }

    let originalInvitationCanceled = false
    let newInvitation: Awaited<ReturnType<typeof auth.api.createInvitation>>
    try {
      await auth.api.cancelInvitation({
        headers: request.headers,
        body: { invitationId: data.invitationId },
      })
      originalInvitationCanceled = true

      newInvitation = await auth.api.createInvitation({
        headers: request.headers,
        body: invitationBody,
      })
    } catch (error) {
      if (originalInvitationCanceled) {
        try {
          await auth.api.createInvitation({
            headers: request.headers,
            body: invitationBody,
          })
        } catch {
          // Preserve the original replacement failure for callers; the restore
          // attempt is best-effort because the invite is already canceled.
        }
      }
      throw error
    }

    try {
      await writeAuditEvent(db, {
        tenantId: organizationId,
        actorId: session.user.id,
        action: 'invitation.resent',
        resourceType: 'organization_invitation',
        resourceId: data.invitationId,
      })
    } catch (error) {
      const replacementInvitationId = (newInvitation as { id?: unknown } | null)?.id
      try {
        if (typeof replacementInvitationId === 'string') {
          await auth.api.cancelInvitation({
            headers: request.headers,
            body: { invitationId: replacementInvitationId },
          })
        }
        await auth.api.createInvitation({
          headers: request.headers,
          body: invitationBody,
        })
      } catch {
        // Preserve the audit failure for callers; restoration is best-effort
        // because the original invitation was already replaced.
      }
      throw error
    }

    return newInvitation
  })

export const updateMemberRoleFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateMemberRoleInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session, organizationId, role, scope } = await requireMemberManagementAccess()
    const { auth, canAssignMemberRole, canManageMemberRole } = await loadOrganizationAuth()

    const { getDb, memberships } = await loadOrganizationsDb()
    const db = getDb()
    const [member] = await db
      .select({ id: memberships.id, role: memberships.role })
      .from(memberships)
      .where(and(eq(memberships.id, data.memberId), eq(memberships.tenantId, organizationId)))
      .limit(1)

    if (!member) throw new Error('Member not found')
    if (member.role === 'org_owner') {
      throw new Error('Organization owners cannot be managed from member settings')
    }
    if (!canManageMemberRole(role, member.role) || !canAssignMemberRole(role, data.role)) {
      throw new Error('Only organization administrators can manage privileged member roles')
    }
    await assertLocationScopedMemberManagement({
      db,
      organizationId,
      actorScope: scope,
      memberId: member.id,
      memberRole: member.role,
    })
    await assertOrganizationProductAccess(organizationId)
    const provisionedGrant = await ensureLocationGrantForLocationScopedRole({
      db,
      organizationId,
      memberId: member.id,
      targetRole: data.role,
    })

    let authRoleUpdated = false
    try {
      await auth.api.updateMemberRole({
        headers: request.headers,
        body: {
          memberId: data.memberId,
          role: data.role,
          organizationId,
        },
      })
      authRoleUpdated = true

      await writeAuditEvent(db, {
        tenantId: organizationId,
        actorId: session.user.id,
        action: 'member.role_updated',
        resourceType: 'organization_member',
        resourceId: data.memberId,
        after: { role: data.role },
      })
    } catch (error) {
      if (authRoleUpdated) {
        await auth.api.updateMemberRole({
          headers: request.headers,
          body: {
            memberId: data.memberId,
            role: member.role as ManageableMemberRole,
            organizationId,
          },
        })
      }

      await deleteProvisionedLocationGrant({
        db,
        organizationId,
        memberId: member.id,
        locationId: provisionedGrant.createdLocationGrantId,
      })
      throw error
    }
  })

export const removeMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => RemoveMemberInput.parse(data))
  .handler(async ({ data }) => {
    const { session, organizationId, role, scope } = await requireMemberManagementAccess()
    const { canManageMemberRole } = await loadOrganizationAuth()

    const { getDb, memberships } = await loadOrganizationsDb()
    const db = getDb()
    const [member] = await db
      .select({ id: memberships.id, role: memberships.role })
      .from(memberships)
      .where(and(eq(memberships.id, data.memberId), eq(memberships.tenantId, organizationId)))
      .limit(1)

    if (!member) throw new Error('Member not found')
    if (member.role === 'org_owner') {
      throw new Error('Organization owners cannot be managed from member settings')
    }
    if (!canManageMemberRole(role, member.role)) {
      throw new Error('Only organization administrators can manage privileged member roles')
    }
    await assertLocationScopedMemberManagement({
      db,
      organizationId,
      actorScope: scope,
      memberId: member.id,
      memberRole: member.role,
    })
    await assertOrganizationProductAccess(organizationId)

    await db.transaction(async (tx) => {
      const [removedMember] = await tx
        .delete(memberships)
        .where(and(eq(memberships.id, data.memberId), eq(memberships.tenantId, organizationId)))
        .returning({ id: memberships.id })

      if (!removedMember) {
        throw new Error('Member not found')
      }

      await writeAuditEvent(tx, {
        tenantId: organizationId,
        actorId: session.user.id,
        action: 'member.removed',
        resourceType: 'organization_member',
        resourceId: data.memberId,
        before: { role: member.role },
      })
    })
  })

const GetInvitationPreviewInput = z.object({
  invitationId: z.string().uuid(),
})

/**
 * Public-ish server fn: returns the invited email for a given invitation so the
 * accept-invite page can display "Invited as foo@clinic.com" before the user
 * takes any action. Does NOT require an active session - the invitation ID is
 * already unguessable.
 */
export const getInvitationPreviewFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => GetInvitationPreviewInput.parse(data))
  .handler(async ({ data }) => {
    const { getDb, organizationInvitations } = await loadOrganizationsDb()
    const db = getDb()

    const [invitation] = await db
      .select({
        email: organizationInvitations.email,
        status: organizationInvitations.status,
        expiresAt: organizationInvitations.expiresAt,
      })
      .from(organizationInvitations)
      .where(eq(organizationInvitations.id, data.invitationId))
      .limit(1)

    if (!invitation) {
      return { invitedEmail: null, expired: false }
    }

    const expired = invitation.expiresAt <= new Date() || invitation.status !== 'pending'
    return { invitedEmail: invitation.email, expired }
  })
