import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import type { DB, Location } from '@phiguard/db'
import { resolveCommercialState, type CommercialPlanStatus } from '@phiguard/billing'
import type { AppSession } from '../lib/session.js'
import { LEGAL_ONBOARDING_REQUIRED_MESSAGE } from '../lib/legal-gate.js'

export interface ActiveLocationAccess {
  userId: string
  organizationId: string
  role: 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor'
  accessLevel: 'organization' | 'location'
  allowedLocationIds: string[]
  locations: Location[]
  defaultLocationId: string | null
  canAccessAllLocations: boolean
  commercial?: {
    plan: string | null
    planStatus: CommercialPlanStatus
    trialStartedAt: Date | null
    trialEndsAt: Date | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    baaSignedAt?: Date | null
    termsAcceptedAt?: Date | null
    legalCurrent?: boolean
  } | null
}

async function resolveLegalCurrent(db: DB, organizationId: string) {
  const { BaaService } = await import('@phiguard/baa')
  const legalStatus = await new BaaService().getLegalStatus({ orgId: organizationId }, db)

  return Boolean(
    legalStatus.terms.acceptedAt
    && legalStatus.baa.acceptedAt
    && legalStatus.terms.isCurrent
    && legalStatus.baa.isCurrent,
  )
}

export function canManageOrganization(access: ActiveLocationAccess): boolean {
  return access.role === 'org_owner' || access.role === 'org_admin'
}

export function canWriteLocations(access: ActiveLocationAccess): boolean {
  return access.role !== 'auditor'
}

export async function resolveActiveLocationAccess(
  db: DB,
  session: AppSession | null,
): Promise<ActiveLocationAccess> {
  const { locations, organizations, resolveOrganizationAccess } = await import('@phiguard/db')

  if (!session?.user?.id || !session.session.activeOrganizationId) {
    throw new Error('Unauthorized')
  }

  const access = await resolveOrganizationAccess(db, {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  })

  if (access.status === 'needs-onboarding') {
    throw new Error('No active organization')
  }

  const locationRows = access.scope.locationIds.length
    ? await db
        .select()
        .from(locations)
        .where(
          and(
            eq(locations.organizationId, access.activeOrganizationId),
            inArray(locations.id, access.scope.locationIds),
          ),
        )
        .orderBy(desc(locations.isPrimary), asc(locations.createdAt), asc(locations.name))
    : []
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
    .where(eq(organizations.id, access.activeOrganizationId))
    .limit(1)

  const defaultLocationId = locationRows[0]?.id ?? null
  const legalCurrent = organization
    ? await resolveLegalCurrent(db, access.activeOrganizationId)
    : false

  return {
    userId: session.user.id,
    organizationId: access.activeOrganizationId,
    role: access.scope.role,
    accessLevel: access.scope.accessLevel,
    allowedLocationIds: locationRows.map((location) => location.id),
    locations: locationRows,
    defaultLocationId,
    canAccessAllLocations: access.scope.accessLevel === 'organization',
    commercial: organization
      ? {
          plan: organization.plan,
          planStatus: organization.planStatus,
          trialStartedAt: organization.trialStartedAt,
          trialEndsAt: organization.trialEndsAt,
          stripeCustomerId: organization.stripeCustomerId,
          stripeSubscriptionId: organization.stripeSubscriptionId,
          baaSignedAt: organization.baaSignedAt,
          termsAcceptedAt: organization.termsAcceptedAt,
          legalCurrent,
        }
      : null,
  }
}

export function assertCommercialProductAccess(access: Pick<ActiveLocationAccess, 'commercial'>) {
  if (!access.commercial) {
    return
  }

  const commercialState = resolveCommercialState(access.commercial)

  if (commercialState.requiresPlanSelection) {
    throw new Error('Choose a plan before accessing PHIGuard.')
  }

  if (commercialState.requiresTrialStart) {
    if (!access.commercial.baaSignedAt || !access.commercial.termsAcceptedAt) {
      throw new Error(LEGAL_ONBOARDING_REQUIRED_MESSAGE)
    }

    throw new Error('Start the trial before accessing PHIGuard.')
  }

  if (commercialState.isHardLocked || !commercialState.hasProductAccess) {
    throw new Error('Billing action required before accessing PHIGuard.')
  }

  if (access.commercial.legalCurrent === false) {
    throw new Error(LEGAL_ONBOARDING_REQUIRED_MESSAGE)
  }
}

export function getReadLocationIds(
  access: ActiveLocationAccess,
  requestedLocationId?: string,
): string[] {
  if (!requestedLocationId) {
    return access.allowedLocationIds
  }

  if (!access.allowedLocationIds.includes(requestedLocationId)) {
    throw new Error('Location not found or access denied')
  }

  return [requestedLocationId]
}

export function getWriteLocationId(
  access: ActiveLocationAccess,
  requestedLocationId?: string,
): string {
  if (!canWriteLocations(access)) {
    throw new Error('Location not found or access denied')
  }

  if (requestedLocationId) {
    if (!access.allowedLocationIds.includes(requestedLocationId)) {
      throw new Error('Location not found or access denied')
    }

    return requestedLocationId
  }

  if (access.allowedLocationIds.length === 1) {
    return access.allowedLocationIds[0]!
  }

  throw new Error('Location is required')
}
