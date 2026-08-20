import { beforeEach, describe, expect, it, vi } from 'vitest'
import { seedSoc2Controls } from '../../soc2/seed.js'
import { SOC2_CONTROLS_SEED } from '../../soc2/controls-seed.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SeedSoc2ControlsDb = Parameters<typeof seedSoc2Controls>[0]

function makeDb(opts: {
  /** For each control lookup, which IDs already exist (by controlId). */
  existingControlIds?: Set<string>
  /** Reject the insert call for this controlId */
  insertFailsForControlId?: string
}) {
  const existing = opts.existingControlIds ?? new Set<string>()
  const insertFailsFor = opts.insertFailsForControlId

  let insertCallCount = 0

  const db: SeedSoc2ControlsDb = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        // Return a fake existing row for each call based on insertion order
        // of SOC2_CONTROLS_SEED
        const idx = insertCallCount
        insertCallCount++
        const controlId = SOC2_CONTROLS_SEED[idx]?.controlId ?? ''
        return Promise.resolve(existing.has(controlId) ? [{ id: `seed:${controlId}` }] : [])
      }),
    })),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockImplementation((row: { controlId: string }) => {
        if (insertFailsFor && row.controlId === insertFailsFor) {
          return Promise.reject(new Error(`DB insert failed for control ${row.controlId}`))
        }
        return Promise.resolve(undefined)
      }),
    })),
  } as unknown as SeedSoc2ControlsDb

  return db
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('seedSoc2Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path - inserts all controls when the table is empty and returns correct count', async () => {
    const db = makeDb({ existingControlIds: new Set() })

    const result = await seedSoc2Controls(db)

    expect(result.inserted).toBe(SOC2_CONTROLS_SEED.length)
    expect(db.insert).toHaveBeenCalledTimes(SOC2_CONTROLS_SEED.length)
  })

  it('skips controls that already exist and does not insert duplicates', async () => {
    // Mark the first two controls as already existing
    const firstTwo = new Set<string>([
      SOC2_CONTROLS_SEED[0]!.controlId,
      SOC2_CONTROLS_SEED[1]!.controlId,
    ])
    const db = makeDb({ existingControlIds: firstTwo })

    const result = await seedSoc2Controls(db)

    expect(result.inserted).toBe(SOC2_CONTROLS_SEED.length - 2)
    expect(db.insert).toHaveBeenCalledTimes(SOC2_CONTROLS_SEED.length - 2)
  })

  it('returns inserted: 0 when every control already exists', async () => {
    const allIds = new Set(SOC2_CONTROLS_SEED.map((c) => c.controlId))
    const db = makeDb({ existingControlIds: allIds })

    const result = await seedSoc2Controls(db)

    expect(result.inserted).toBe(0)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('propagates a storage backend error when insert fails', async () => {
    const failingControlId = SOC2_CONTROLS_SEED[2]!.controlId
    const db = makeDb({
      existingControlIds: new Set([
        SOC2_CONTROLS_SEED[0]!.controlId,
        SOC2_CONTROLS_SEED[1]!.controlId,
      ]),
      insertFailsForControlId: failingControlId,
    })

    await expect(seedSoc2Controls(db)).rejects.toThrow(
      `DB insert failed for control ${failingControlId}`,
    )
  })

  it('inserts each control with framework set to SOC2', async () => {
    const db = makeDb({ existingControlIds: new Set() })

    await seedSoc2Controls(db)

    const insertedValues = vi
      .mocked(db.insert as ReturnType<typeof vi.fn>)
      .mock.results.map(
        (r) => (r.value as { values: ReturnType<typeof vi.fn> }).values.mock.calls[0]?.[0],
      )

    for (const row of insertedValues) {
      expect(row).toMatchObject({ framework: 'SOC2' })
    }
  })

  it('inserts each control with tenantId set to null (global controls)', async () => {
    const db = makeDb({ existingControlIds: new Set() })

    await seedSoc2Controls(db)

    const insertedValues = vi
      .mocked(db.insert as ReturnType<typeof vi.fn>)
      .mock.results.map(
        (r) => (r.value as { values: ReturnType<typeof vi.fn> }).values.mock.calls[0]?.[0],
      )

    for (const row of insertedValues) {
      expect(row.tenantId).toBeNull()
    }
  })

  it('does not contain any PHI in inserted rows - controlId, title, description are static seed data', async () => {
    const db = makeDb({ existingControlIds: new Set() })

    await seedSoc2Controls(db)

    const insertedValues = vi
      .mocked(db.insert as ReturnType<typeof vi.fn>)
      .mock.results.map(
        (r) => (r.value as { values: ReturnType<typeof vi.fn> }).values.mock.calls[0]?.[0],
      )

    // Each inserted row must deep-equal the corresponding seed entry merged with
    // the two server-assigned fields (framework, tenantId). Any stray or
    // PHI-derived field would cause toEqual to fail.
    type SeedControlId = (typeof SOC2_CONTROLS_SEED)[number]['controlId']
    const seedByControlId = new Map(SOC2_CONTROLS_SEED.map((c) => [c.controlId, c]))
    for (const row of insertedValues) {
      const seed = seedByControlId.get(row.controlId as SeedControlId)
      expect(seed).toBeDefined()
      expect(row).toEqual({
        framework: 'SOC2',
        controlId: seed!.controlId,
        title: seed!.title,
        description: seed!.description,
        category: seed!.category,
        tenantId: null,
      })
    }
  })
})

// ---------------------------------------------------------------------------
// SOC2_CONTROLS_SEED data integrity
// ---------------------------------------------------------------------------

describe('SOC2_CONTROLS_SEED', () => {
  it('contains at least one entry for each top-level TSC category (CC1-CC9)', () => {
    const categories = new Set(SOC2_CONTROLS_SEED.map((c) => c.category))
    for (let i = 1; i <= 9; i++) {
      expect(categories.has(`CC${i}` as (typeof SOC2_CONTROLS_SEED)[number]['category'])).toBe(true)
    }
  })

  it('has no duplicate controlIds', () => {
    const ids = SOC2_CONTROLS_SEED.map((c) => c.controlId)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('every entry has a non-empty title and description', () => {
    for (const control of SOC2_CONTROLS_SEED) {
      expect(control.title.trim().length).toBeGreaterThan(0)
      expect(control.description.trim().length).toBeGreaterThan(0)
    }
  })
})
