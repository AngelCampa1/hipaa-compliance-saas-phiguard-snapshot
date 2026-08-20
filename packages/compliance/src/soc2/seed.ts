import { and, eq, isNull } from 'drizzle-orm'
import type { DB } from '@phiguard/db'
import { soc2Controls } from '@phiguard/db'
import { SOC2_CONTROLS_SEED } from './controls-seed.js'

export async function seedSoc2Controls(db: DB): Promise<{ inserted: number }> {
  let inserted = 0

  for (const control of SOC2_CONTROLS_SEED) {
    const [existing] = await db
      .select({ id: soc2Controls.id })
      .from(soc2Controls)
      .where(
        and(
          eq(soc2Controls.framework, 'SOC2'),
          eq(soc2Controls.controlId, control.controlId),
          isNull(soc2Controls.tenantId),
        ),
      )
      .limit(1)

    if (existing) continue

    await db.insert(soc2Controls).values({
      framework: 'SOC2',
      controlId: control.controlId,
      title: control.title,
      description: control.description,
      category: control.category,
      tenantId: null,
    })
    inserted++
  }

  return { inserted }
}
