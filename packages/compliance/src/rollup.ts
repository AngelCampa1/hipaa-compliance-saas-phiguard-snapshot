import { and, eq, inArray } from 'drizzle-orm'
import type { DB } from '@phiguard/db'
import { locations } from '@phiguard/db'
import { checklistItems } from './schema/checklist-items.phi.js'
import { tasks } from '@phiguard/db'

// ---------------------------------------------------------------------------
// Checklist rollup
// ---------------------------------------------------------------------------

export interface ChecklistRollupRow {
  locationId: string
  locationName: string
  status: string
}

export interface LocationRollup {
  locationId: string
  locationName: string
  total: number
  complete: number
  pct: number
}

export function aggregateByLocation(rows: ChecklistRollupRow[]): LocationRollup[] {
  const map = new Map<string, LocationRollup>()
  for (const r of rows) {
    const cur = map.get(r.locationId) ?? {
      locationId: r.locationId,
      locationName: r.locationName,
      total: 0,
      complete: 0,
      pct: 0,
    }
    cur.total++
    if (r.status === 'complete') cur.complete++
    map.set(r.locationId, cur)
  }
  return [...map.values()].map((l) => ({
    ...l,
    pct: l.total ? Math.round((l.complete / l.total) * 100) : 0,
  }))
}

export async function getChecklistRollup(
  db: DB,
  { tenantId, locationIds }: { tenantId: string; locationIds?: string[] },
): Promise<LocationRollup[]> {
  if (locationIds?.length === 0) {
    return []
  }

  const rows = await db
    .select({
      locationId: locations.id,
      locationName: locations.name,
      status: checklistItems.status,
    })
    .from(checklistItems)
    .innerJoin(locations, eq(checklistItems.locationId, locations.id))
    .where(
      locationIds
        ? and(eq(checklistItems.tenantId, tenantId), inArray(checklistItems.locationId, locationIds))
        : eq(checklistItems.tenantId, tenantId),
    )

  return aggregateByLocation(rows)
}

// ---------------------------------------------------------------------------
// Task rollup
// ---------------------------------------------------------------------------

export interface TaskRollupRow {
  locationId: string
  locationName: string
  status: string
  dueAt: Date | null
}

export interface LocationTaskRollup {
  locationId: string
  locationName: string
  open: number
  overdue: number
  completed: number
}

export function aggregateTasksByLocation(
  rows: TaskRollupRow[],
  now: Date,
): LocationTaskRollup[] {
  const map = new Map<string, LocationTaskRollup>()

  for (const r of rows) {
    const cur = map.get(r.locationId) ?? {
      locationId: r.locationId,
      locationName: r.locationName,
      open: 0,
      overdue: 0,
      completed: 0,
    }

    if (r.status === 'done') {
      cur.completed++
    } else if (r.dueAt !== null && r.dueAt < now) {
      cur.overdue++
    } else {
      cur.open++
    }

    map.set(r.locationId, cur)
  }

  return [...map.values()]
}

export async function getTaskRollup(
  db: DB,
  { tenantId, locationIds }: { tenantId: string; locationIds?: string[] },
): Promise<LocationTaskRollup[]> {
  if (locationIds?.length === 0) {
    return []
  }

  const rows = await db
    .select({
      locationId: locations.id,
      locationName: locations.name,
      status: tasks.status,
      dueAt: tasks.dueAt,
    })
    .from(tasks)
    .innerJoin(locations, eq(tasks.locationId, locations.id))
    .where(
      locationIds
        ? and(eq(tasks.tenantId, tenantId), inArray(tasks.locationId, locationIds))
        : eq(tasks.tenantId, tenantId),
    )

  return aggregateTasksByLocation(rows, new Date())
}
