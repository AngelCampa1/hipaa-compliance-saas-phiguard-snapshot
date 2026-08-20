import { isNull, or, eq } from 'drizzle-orm'
import { soc2Controls, type DB, type Soc2Control } from '@phiguard/db'
import { SOC2_CONTROLS_SEED } from './controls-seed.js'

export type { Soc2Control }

function buildSeedControlRows(): Soc2Control[] {
  const now = new Date(0)
  return SOC2_CONTROLS_SEED.map((control) => ({
    id: `seed:${control.controlId}`,
    framework: 'SOC2' as const,
    controlId: control.controlId,
    title: control.title,
    description: control.description,
    category: control.category,
    tenantId: null,
    createdAt: now,
    updatedAt: now,
  }))
}

export async function listControls(
  db: Pick<DB, 'select'>,
  opts: { tenantId?: string },
): Promise<Soc2Control[]> {
  const condition = opts.tenantId
    ? or(isNull(soc2Controls.tenantId), eq(soc2Controls.tenantId, opts.tenantId))
    : isNull(soc2Controls.tenantId)

  const rows = await db.select().from(soc2Controls).where(condition)
  const seedRows = buildSeedControlRows()
  const existingControlIds = new Set(rows.map((row) => row.controlId))
  const missingSeedRows = seedRows.filter((row) => !existingControlIds.has(row.controlId))

  return [...rows, ...missingSeedRows]
}
