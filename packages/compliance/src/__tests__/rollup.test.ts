import { describe, it, expect, vi } from 'vitest'
import { aggregateByLocation, aggregateTasksByLocation } from '../rollup.js'
import { getChecklistRollup, getTaskRollup } from '../rollup.js'

type ChecklistRollupDb = Parameters<typeof getChecklistRollup>[0]
type TaskRollupDb = Parameters<typeof getTaskRollup>[0]

describe('aggregateByLocation', () => {
  it('rolls checklist item progress per location', () => {
    const rows = [
      { locationId: 'L1', locationName: 'Main', status: 'complete' },
      { locationId: 'L1', locationName: 'Main', status: 'open' },
      { locationId: 'L2', locationName: 'Branch', status: 'complete' },
    ]
    const out = aggregateByLocation(rows)
    expect(out).toEqual([
      { locationId: 'L1', locationName: 'Main', total: 2, complete: 1, pct: 50 },
      { locationId: 'L2', locationName: 'Branch', total: 1, complete: 1, pct: 100 },
    ])
  })

  it('handles empty input', () => {
    expect(aggregateByLocation([])).toEqual([])
  })

  it('rounds pct correctly', () => {
    const rows = [
      { locationId: 'L1', locationName: 'X', status: 'complete' },
      { locationId: 'L1', locationName: 'X', status: 'open' },
      { locationId: 'L1', locationName: 'X', status: 'open' },
    ]
    expect(aggregateByLocation(rows)[0].pct).toBe(33)
  })
})

describe('getChecklistRollup', () => {
  it('queries and aggregates db rows', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { locationId: 'L1', locationName: 'Main', status: 'complete' },
              { locationId: 'L1', locationName: 'Main', status: 'open' },
            ]),
          }),
        }),
      }),
    }
    const result = await getChecklistRollup(mockDb as unknown as ChecklistRollupDb, { tenantId: 'T1' })
    expect(result).toHaveLength(1)
    expect(result[0].pct).toBe(50)
  })

  it('does not query when the caller has no readable locations', async () => {
    const mockDb = {
      select: vi.fn(),
    }

    const result = await getChecklistRollup(mockDb as unknown as ChecklistRollupDb, {
      tenantId: 'T1',
      locationIds: [],
    })

    expect(result).toEqual([])
    expect(mockDb.select).not.toHaveBeenCalled()
  })
})

describe('aggregateTasksByLocation', () => {
  it('aggregates task counts per location', () => {
    const now = new Date()
    const past = new Date(now.getTime() - 86400000) // yesterday

    const rows = [
      { locationId: 'L1', locationName: 'Main', status: 'open', dueAt: past },
      { locationId: 'L1', locationName: 'Main', status: 'open', dueAt: null },
      { locationId: 'L1', locationName: 'Main', status: 'done', dueAt: null },
      { locationId: 'L2', locationName: 'Branch', status: 'done', dueAt: null },
    ]
    const out = aggregateTasksByLocation(rows, now)
    expect(out).toHaveLength(2)

    const l1 = out.find((r) => r.locationId === 'L1')!
    expect(l1.open).toBe(1)    // open, not overdue (dueAt null)
    expect(l1.overdue).toBe(1) // open + past due
    expect(l1.completed).toBe(1)

    const l2 = out.find((r) => r.locationId === 'L2')!
    expect(l2.open).toBe(0)
    expect(l2.overdue).toBe(0)
    expect(l2.completed).toBe(1)
  })

  it('handles empty input', () => {
    expect(aggregateTasksByLocation([], new Date())).toEqual([])
  })
})

describe('getTaskRollup', () => {
  it('queries and aggregates task db rows', async () => {
    const now = new Date()
    const past = new Date(now.getTime() - 86400000)

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { locationId: 'L1', locationName: 'Clinic', status: 'open', dueAt: past },
              { locationId: 'L1', locationName: 'Clinic', status: 'done', dueAt: null },
            ]),
          }),
        }),
      }),
    }

    const result = await getTaskRollup(mockDb as unknown as TaskRollupDb, { tenantId: 'T1' })
    expect(result).toHaveLength(1)
    expect(result[0].locationId).toBe('L1')
    expect(result[0].overdue).toBe(1)
    expect(result[0].completed).toBe(1)
  })

  it('does not query when the caller has no readable locations', async () => {
    const mockDb = {
      select: vi.fn(),
    }

    const result = await getTaskRollup(mockDb as unknown as TaskRollupDb, {
      tenantId: 'T1',
      locationIds: [],
    })

    expect(result).toEqual([])
    expect(mockDb.select).not.toHaveBeenCalled()
  })
})
