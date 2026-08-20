import process from 'node:process'
import { access, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { safeSpawnSync } from '../../../scripts/safe-spawn.mjs'

process.env.NODE_ENV = 'production'

async function readRootWranglerVars() {
  const wranglerPath = join(process.cwd(), '..', '..', 'wrangler.jsonc')

  try {
    const wranglerConfig = await readFile(wranglerPath, 'utf8')
    return [...wranglerConfig.matchAll(/"(VITE_[A-Z0-9_]+)"\s*:\s*"([^"]*)"/g)]
      .map(([, key, value]) => [key, value])
      .filter(([, value]) => value)
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code === 'ENOENT') {
      return []
    }

    throw error
  }
}

for (const [key, value] of await readRootWranglerVars()) {
  if (!process.env[key]) {
    process.env[key] = value
  }
}

async function removeBuildOutput() {
  const distDir = join(process.cwd(), 'dist')
  const archivedDistDir = join(process.cwd(), `dist-stale-${Date.now()}`)

  try {
    await rename(distDir, archivedDistDir)
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code !== 'ENOENT' && code !== 'EBUSY' && code !== 'EPERM') {
      throw error
    }
    if (code === 'ENOENT') {
      return
    }
    await rm(distDir, { recursive: true, force: true })
    return
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(archivedDistDir, { recursive: true, force: true })
      return
    } catch (error) {
      const isRetryable = error && typeof error === 'object' && 'code' in error && error.code === 'EBUSY'
      if (!isRetryable || attempt === 7) {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
}

await removeBuildOutput()

const viteBuild = safeSpawnSync('pnpm', ['exec', 'vite', 'build'], {
  cwd: process.cwd(),
  stdio: 'inherit',
})
if (viteBuild.error) {
  throw viteBuild.error
}
if (viteBuild.status !== 0) {
  process.exit(viteBuild.status ?? 1)
}

async function resolveClientAssetsDir() {
  const candidates = [
    join(process.cwd(), 'dist', 'client', 'assets'),
    join(process.cwd(), 'dist', 'assets'),
  ]

  for (let attempt = 0; attempt < 50; attempt += 1) {
    for (const candidate of candidates) {
      try {
        await access(candidate)
        return candidate
      } catch {
        // Wait for Vite to finish materializing the build output.
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  throw new Error(
    `Unable to locate the built client assets directory. Checked: ${candidates.join(', ')}`,
  )
}

async function waitForPath(path, attempts = 50, delayMs = 200) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await access(path)
      return
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : null
      if (code !== 'ENOENT' || attempt === attempts - 1) {
        throw error
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}

const serverAssetsDir = join(process.cwd(), 'dist', 'server', 'assets')

const manifestFileNames = (await readdir(serverAssetsDir)).filter((name) =>
  /^_tanstack-start-manifest_.*\.js$/.test(name),
)

if (manifestFileNames.length === 0) {
  throw new Error('Unable to locate the built TanStack Start server manifests in dist/server/assets')
}

const clientEntryPattern = /clientEntry:\s*"\/@id\/virtual:tanstack-start-client-entry"/g
const emittedClientEntryPattern = /clientEntry:\s*"(?<entry>\/assets\/[^"]+\.js)"/

let resolvedClientEntry

async function resolveClientEntry() {
  if (resolvedClientEntry) {
    return resolvedClientEntry
  }

  const clientAssetsDir = await resolveClientAssetsDir()
  const clientAssetEntries = await readdir(clientAssetsDir)
  const clientEntryName = (
    await Promise.all(
      clientAssetEntries
        .filter((name) => name.endsWith('.js'))
        .map(async (name) => {
          const assetPath = join(clientAssetsDir, name)
          const source = await readFile(assetPath, 'utf8')
          const isClientBootstrap =
            source.includes('hydrateRoot(') || source.includes('window.__TSS_START_OPTIONS__')

          if (!isClientBootstrap) {
            return null
          }

          const { size } = await stat(assetPath)
          return { name, size }
        }),
    )
  )
    .filter(Boolean)
    .sort((left, right) => right.size - left.size)[0]?.name

  if (!clientEntryName) {
    throw new Error('Unable to resolve the TanStack Start client entry from the built client assets')
  }

  resolvedClientEntry = `/assets/${clientEntryName}`
  return resolvedClientEntry
}

for (const manifestFileName of manifestFileNames) {
  const manifestPath = join(serverAssetsDir, manifestFileName)
  const manifestSource = await readFile(manifestPath, 'utf8')
  const hasVirtualClientEntry = clientEntryPattern.test(manifestSource)
  const emittedClientEntryMatch = manifestSource.match(emittedClientEntryPattern)

  let manifestOutput = manifestSource

  if (hasVirtualClientEntry) {
    const clientEntry = await resolveClientEntry()
    manifestOutput = manifestSource.replace(
      clientEntryPattern,
      `clientEntry: "${clientEntry}"`,
    )

    if (manifestOutput === manifestSource) {
      throw new Error(
        `TanStack Start manifest ${manifestFileName} still points to the virtual client entry after rewrite`,
      )
    }

    await writeFile(manifestPath, manifestOutput, 'utf8')
  } else if (!emittedClientEntryMatch?.groups?.entry) {
    // TanStack Start >=1.168 no longer emits a top-level `clientEntry` field.
    // The client bootstrap is instead referenced from the root route's
    // `scripts`/`preloads` as a real built asset, so there is no virtual
    // placeholder to rewrite and the manifest is already production-safe.
    // Confirm a real client bootstrap asset resolves before accepting it
    // (resolveClientEntry throws with a clear message if none is found).
    await resolveClientEntry()
  }

  const verifiedManifest = await readFile(manifestPath, 'utf8')
  if (clientEntryPattern.test(verifiedManifest)) {
    throw new Error(
      `TanStack Start manifest ${manifestFileName} still points to the virtual client entry after rewrite`,
    )
  }

  const verifiedClientEntry =
    verifiedManifest.match(emittedClientEntryPattern)?.groups?.entry ?? await resolveClientEntry()
  const verifiedClientEntryPath = join(process.cwd(), 'dist', 'client', verifiedClientEntry.slice(1))
  try {
    await waitForPath(verifiedClientEntryPath, 150, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(
      `[vite-build] Skipping final client-entry existence check for ${verifiedClientEntryPath}: ${message}`,
    )
  }
}

await mkdir(join(process.cwd(), 'dist'), { recursive: true })

const workerEntrySource = `import * as Sentry from '@sentry/cloudflare'
import { getDb, withDbContext } from '@phiguard/db/server'
import { runNightlyExport, logger } from '@phiguard/audit'
import server from './server/server.js'
import { syncRuntimeEnv } from '../src/lib/runtime-env.ts'
import { captureServerException, getSentryServerOptions } from '../src/lib/sentry.ts'
import { isTransientDbError } from '../src/lib/db-errors.ts'

/**
 * Built Worker entrypoint used by Wrangler deploys.
 *
 * The Vite/TanStack build emits the SSR handler into dist/server/server.js and
 * the static assets into dist/client. We wrap that server here so Cloudflare
 * deploys the compiled output while still supporting scheduled jobs.
 */

async function runScheduledJob(cron) {
  if (cron === '0 3 * * *') {
    const bucket = process.env.R2_AUDIT_EXPORTS_BUCKET
    if (!bucket) {
      throw new Error('R2_AUDIT_EXPORTS_BUCKET is not configured')
    }

    await runNightlyExport(getDb(), {
      bucket,
      region: 'auto',
    })
  }
}

const SCHEDULED_DB_MAX_ATTEMPTS = 3
const SCHEDULED_DB_RETRY_DELAYS_MS = [250, 1000]

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runScheduledDbWork(cron) {
  await withDbContext(() => runScheduledJob(cron))
}

async function runScheduledJobWithCapture(cron) {
  for (let attempt = 1; attempt <= SCHEDULED_DB_MAX_ATTEMPTS; attempt += 1) {
    try {
      await runScheduledDbWork(cron)
      return
    } catch (error) {
      const retried = attempt > 1
      const tags = {
        cron,
        attempt: String(attempt),
        maxAttempts: String(SCHEDULED_DB_MAX_ATTEMPTS),
        retried: String(retried),
      }

      if (!isTransientDbError(error) || attempt === SCHEDULED_DB_MAX_ATTEMPTS) {
        captureServerException(error, {
          surface: 'scheduled',
          operation: 'worker.scheduled',
          tags,
        })
        throw error
      }

      logger.safe.warn(
        {
          cron,
          attempt,
          maxAttempts: SCHEDULED_DB_MAX_ATTEMPTS,
          errMessage: error instanceof Error ? error.message : String(error),
        },
        'worker.scheduled: transient db error, retrying with a fresh client',
      )

      await wait(SCHEDULED_DB_RETRY_DELAYS_MS[attempt - 1] ?? SCHEDULED_DB_RETRY_DELAYS_MS.at(-1) ?? 1000)
    }
  }
}

const handler = {
  async fetch(request, env, _ctx) {
    syncRuntimeEnv(env)
    return withDbContext(() => server.fetch(request))
  },
  async scheduled(event, env, _ctx) {
    syncRuntimeEnv(env)
    await runScheduledJobWithCapture(event.cron)
  },
}

export default Sentry.withSentry((env) => getSentryServerOptions(env), handler)
`

await writeFile(join(process.cwd(), 'dist', 'worker.mjs'), workerEntrySource, 'utf8')
