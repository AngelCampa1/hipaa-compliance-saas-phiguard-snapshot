import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, inArray, isNull, sql } from 'drizzle-orm'
import { getDb, memberships, organizations, tasks } from '@phiguard/db/server'
import { checklists, incidents } from '@phiguard/compliance'
import { getSessionFn } from '../lib/session.js'
import {
  assertCommercialProductAccess,
  getReadLocationIds,
  resolveActiveLocationAccess,
} from './access.js'

export type ActionItem = {
  severity: 'urgent' | 'warning' | 'normal'
  title: string
  detail: string
  href: string
  cta: string
}

function buildActionItems(counts: {
  incidents: { open: number }
  checklists: { active: number }
  tasks: { open: number }
}): ActionItem[] {
  const items: ActionItem[] = []

  if (counts.incidents.open > 0) {
    const n = counts.incidents.open
    items.push({
      severity: 'urgent',
      title: `${n} open incident${n !== 1 ? 's' : ''} need${n === 1 ? 's' : ''} attention`,
      detail: 'Open incidents must be documented and resolved promptly under HIPAA requirements.',
      href: '/app/compliance/incidents',
      cta: 'View incidents',
    })
  }

  if (counts.checklists.active > 0) {
    const n = counts.checklists.active
    items.push({
      severity: 'warning',
      title: `${n} compliance checklist${n !== 1 ? 's' : ''} in progress`,
      detail: 'Continue your HIPAA safeguard work to build your audit trail.',
      href: '/app/compliance/checklists',
      cta: 'Continue checklists',
    })
  }

  if (counts.tasks.open > 0) {
    const n = counts.tasks.open
    items.push({
      severity: 'normal',
      title: `${n} open task${n !== 1 ? 's' : ''}`,
      detail: 'Follow-up work waiting to be completed.',
      href: '/app/tasks',
      cta: 'View tasks',
    })
  }

  return items
}

const DashboardSummaryInput = {
  locationId: undefined as string | undefined,
}

async function requireDashboardAccess() {
  const session = await getSessionFn()

  if (!session?.user?.id || !session.session.activeOrganizationId) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)

  return { db, access }
}

async function getLocationSummary(
  db: ReturnType<typeof getDb>,
  organizationId: string,
  locationIds: string[],
) {
  if (locationIds.length === 0) {
    return {
      tasks: { total: 0, open: 0 },
      incidents: { total: 0, open: 0 },
      checklists: { total: 0, active: 0, completed: 0 },
    }
  }

  const taskConditions = [eq(tasks.tenantId, organizationId)]
  const incidentConditions = [eq(incidents.tenantId, organizationId)]
  const checklistConditions = [eq(checklists.tenantId, organizationId)]

  taskConditions.push(inArray(tasks.locationId, locationIds))
  taskConditions.push(isNull(tasks.archivedAt))
  incidentConditions.push(inArray(incidents.locationId, locationIds))
  checklistConditions.push(inArray(checklists.locationId, locationIds))

  const [taskSummary] = await db
    .select({
      total: count(),
      open: sql<number>`count(*) filter (where ${tasks.status} <> 'done')`,
    })
    .from(tasks)
    .where(and(...taskConditions))

  const [incidentSummary] = await db
    .select({
      total: count(),
      open: sql<number>`count(*) filter (where ${incidents.status} <> 'closed')`,
    })
    .from(incidents)
    .where(and(...incidentConditions))

  const [checklistSummary] = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where ${checklists.status} = 'active')`,
      completed: sql<number>`count(*) filter (where ${checklists.status} = 'completed')`,
    })
    .from(checklists)
    .where(and(...checklistConditions))

  return {
    tasks: {
      total: Number(taskSummary.total ?? 0),
      open: Number(taskSummary.open ?? 0),
    },
    incidents: {
      total: Number(incidentSummary.total ?? 0),
      open: Number(incidentSummary.open ?? 0),
    },
    checklists: {
      total: Number(checklistSummary.total ?? 0),
      active: Number(checklistSummary.active ?? 0),
      completed: Number(checklistSummary.completed ?? 0),
    },
  }
}

export async function getDashboardSummary(input?: { locationId?: string }) {
  const { db, access } = await requireDashboardAccess()
  const locationIds = getReadLocationIds(access, input?.locationId)

  const [organization, memberSummary, scopedSummary, locationBreakdown] = await Promise.all([
    db
      .select({
        id: organizations.id,
        name: organizations.name,
        plan: organizations.plan,
        planStatus: organizations.planStatus,
        termsAcceptedAt: organizations.termsAcceptedAt,
        baaSignedAt: organizations.baaSignedAt,
        maxMembers: organizations.maxMembers,
      })
      .from(organizations)
      .where(eq(organizations.id, access.organizationId))
      .limit(1),
    db
      .select({
        total: count(),
      })
      .from(memberships)
      .where(eq(memberships.tenantId, access.organizationId)),
    getLocationSummary(db, access.organizationId, locationIds),
    Promise.all(
      access.locations.map(async (location) => {
        const summary = await getLocationSummary(db, access.organizationId, [location.id])

        return {
          locationId: location.id,
          locationName: location.name,
          tasksOpen: summary.tasks.open,
          tasksTotal: summary.tasks.total,
          incidentsOpen: summary.incidents.open,
          incidentsTotal: summary.incidents.total,
          checklistsActive: summary.checklists.active,
          checklistsCompleted: summary.checklists.completed,
          checklistsTotal: summary.checklists.total,
        }
      }),
    ),
  ])

  return {
    organization: organization[0] ?? null,
    members: {
      total: Number(memberSummary[0]?.total ?? 0),
    },
    tasks: scopedSummary.tasks,
    incidents: scopedSummary.incidents,
    checklists: scopedSummary.checklists,
    actionItems: buildActionItems(scopedSummary),
    scope: {
      locations: access.locations.map((location) => ({
        id: location.id,
        name: location.name,
      })),
      defaultLocationId: access.defaultLocationId,
      canAccessAllLocations: access.canAccessAllLocations,
      selectedLocationId: input?.locationId,
    },
    locationBreakdown: access.canAccessAllLocations && !input?.locationId ? locationBreakdown : [],
  }
}

export const getDashboardSummaryFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== 'object') {
      return DashboardSummaryInput
    }

    return {
      locationId:
        'locationId' in (data as Record<string, unknown>) &&
        typeof (data as Record<string, unknown>).locationId === 'string'
          ? ((data as Record<string, unknown>).locationId as string)
          : undefined,
    }
  })
  .handler(async ({ data }) => getDashboardSummary(data))
