import { safeSpawnSync } from '../../../scripts/safe-spawn.mjs'

const result = safeSpawnSync(
  'playwright',
  ['test', 'e2e/uploads.direct.spec.ts'],
  {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      PLAYWRIGHT_DIRECT_UPLOADS: 'true',
    },
    stdio: 'inherit',
  },
)

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
