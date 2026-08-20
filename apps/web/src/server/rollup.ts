import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb, organizations } from '@phiguard/db/server'
import { getChecklistRollup, getTaskRollup } from '@phiguard/compliance'
import { recordFeatureUsage, requireFeatureForOrg } from '@phiguard/billing'
import { getSessionFn } from '../lib/session.js'
import { assertCommercialProductAccess, resolveActiveLocationAccess } from './access.js'

async function requireRollupAccess() {
  const session = await getSessionFn()
  if (!session?.user?.id || !session.session.activeOrganizationId) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)
  const tenantId = access.organizationId

  const [org] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialEndsAt: organizations.trialEndsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, tenantId))
    .limit(1)

  if (!org) throw new Error('Organization not found')

  requireFeatureForOrg(org, 'multi_location_rollup')
  if (org.planStatus === 'trialing') {
    void recordFeatureUsage(db, tenantId, 'multi_location_rollup').catch(() => {
      // best-effort
    })
  }

  return {
    db,
    tenantId,
    plan: org.plan,
    locationIds: access.canAccessAllLocations ? undefined : access.allowedLocationIds,
  }
}

export const getComplianceRollupFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, tenantId, locationIds } = await requireRollupAccess()
  return getChecklistRollup(db, { tenantId, locationIds })
})

export const getTaskRollupFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, tenantId, locationIds } = await requireRollupAccess()
  return getTaskRollup(db, { tenantId, locationIds })
})

export const getRollupOrgPlanFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSessionFn()
  if (!session?.user?.id || !session.session.activeOrganizationId) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)
  const [org] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialEndsAt: organizations.trialEndsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, access.organizationId))
    .limit(1)

  if (!org) throw new Error('Organization not found')
  return {
    plan: org.plan,
    planStatus: org.planStatus,
    trialEndsAt: org.trialEndsAt instanceof Date ? org.trialEndsAt.toISOString() : org.trialEndsAt,
  }
})
