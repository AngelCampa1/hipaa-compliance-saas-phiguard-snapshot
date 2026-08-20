import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb, organizations, resolveOrganizationAccess } from '@phiguard/db/server'
import type { CommercialPlanStatus, OrgFeatureContext } from '@phiguard/billing'
import { getSessionFn } from '../lib/session.js'

export type SerializedOrgFeatureContext = {
  plan: string | null
  planStatus: CommercialPlanStatus | null
  trialEndsAt: string | null
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

export async function getOrgFeatureContext(): Promise<SerializedOrgFeatureContext> {
  const session = await getSessionFn()
  if (!session?.user?.id) throw new Error('No active organization')

  const db = getDb()
  const access = await resolveOrganizationAccess(db, {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  })
  if (access.status === 'needs-onboarding') {
    throw new Error('No active organization')
  }
  const tenantId = access.activeOrganizationId

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

  return {
    plan: org.plan,
    planStatus: org.planStatus,
    trialEndsAt: toIsoString(org.trialEndsAt),
  }
}

export const getOrgFeatureContextFn = createServerFn({ method: 'GET' }).handler(async () =>
  getOrgFeatureContext(),
)

export type FeatureGateFallback = {
  gatedOrg: OrgFeatureContext
}
