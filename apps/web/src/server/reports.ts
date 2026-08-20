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

// ---------------------------------------------------------------------------
// CSV export helpers - aggregated location-level counts only, no PHI fields
// ---------------------------------------------------------------------------

function escapeCsvField(value: string | number): string {
  const str = String(value)
  const safeValue = /^[\s\u0000-\u001f]*[=+\-@]/.test(str) ? `'${str}` : str
  if (safeValue.includes(',') || safeValue.includes('"') || safeValue.includes('\n')) {
    return `"${safeValue.replace(/"/g, '""')}"`
  }
  return safeValue
}

function buildCsvRow(fields: (string | number)[]): string {
  return fields.map(escapeCsvField).join(',')
}

export const exportComplianceRollupFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string> => {
    const { db, tenantId, locationIds } = await requireRollupAccess()
    const rollup = await getChecklistRollup(db, { tenantId, locationIds })

    const header = buildCsvRow(['Location', 'Total Items', 'Completed', 'Progress (%)'])
    const rows = rollup.map((row) =>
      buildCsvRow([row.locationName, row.total, row.complete, row.pct]),
    )

    return [header, ...rows].join('\r\n')
  },
)

export const exportTaskRollupFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string> => {
    const { db, tenantId, locationIds } = await requireRollupAccess()
    const rollup = await getTaskRollup(db, { tenantId, locationIds })

    const header = buildCsvRow(['Location', 'Open', 'Overdue', 'Completed'])
    const rows = rollup.map((row) =>
      buildCsvRow([row.locationName, row.open, row.overdue, row.completed]),
    )

    return [header, ...rows].join('\r\n')
  },
)
