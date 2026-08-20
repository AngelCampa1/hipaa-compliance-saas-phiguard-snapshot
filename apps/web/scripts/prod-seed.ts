/**
 * Idempotent production seed.
 *
 * Seeds only shared launch data required for a clean production environment:
 * - built-in compliance checklist templates
 * - global SOC 2 controls
 *
 * This script must never create users, orgs, sample tasks, or synthetic PHI.
 *
 * Run: pnpm --filter @phiguard/web seed:prod
 */
import { getDb } from '@phiguard/db/server'
import { runSeed, seedSoc2Controls } from '@phiguard/compliance'

async function main() {
  const db = getDb()

  await runSeed(db)
  const soc2 = await seedSoc2Controls(db)

  console.log(
    JSON.stringify(
      {
        ok: true,
        checklistTemplates: 'seeded',
        soc2Controls: soc2,
      },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error('Prod seed failed:', err)
  process.exit(1)
})
