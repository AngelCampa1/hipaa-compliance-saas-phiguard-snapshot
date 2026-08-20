import * as Sentry from '@sentry/cloudflare'
import { getDb, withDbContext } from '@phiguard/db/server'
import { runNightlyExport, logger } from '@phiguard/audit'
import { syncRuntimeEnv } from './lib/runtime-env'
import { captureServerException, getSentryServerOptions } from './lib/sentry'
import { isTransientDbError } from './lib/db-errors'
import type { MarketingD1Database } from '@phiguard/marketing-db/server'

type WorkerEnv = Record<string, unknown> & {
  HYPERDRIVE?: {
    connectionString?: string
  }
  MARKETING_DB?: MarketingD1Database
}

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void
}

type WorkerScheduledEvent = {
  cron: string
}

const SCHEDULED_DB_MAX_ATTEMPTS = 3
const SCHEDULED_DB_RETRY_DELAYS_MS = [250, 1000] as const

async function loadServer() {
  return import('./server')
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runScheduledJob(cron: string) {
  if (cron === '0 3 * * *') {
    const bucket = process.env.R2_AUDIT_EXPORTS_BUCKET
    if (!bucket) {
      throw new Error('R2_AUDIT_EXPORTS_BUCKET is not configured')
    }

    await runNightlyExport(getDb() as unknown as Parameters<typeof runNightlyExport>[0], {
      bucket,
      region: 'auto',
    })
  }
}

async function runScheduledDbWork(cron: string) {
  await withDbContext(() => runScheduledJob(cron))
}

function isEmergencyReadOnlyModeEnabled() {
  const value = process.env.PHIGUARD_READ_ONLY_MODE?.toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

async function runScheduledJobWithCapture(cron: string) {
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

      await wait(
        SCHEDULED_DB_RETRY_DELAYS_MS[attempt - 1] ?? SCHEDULED_DB_RETRY_DELAYS_MS.at(-1) ?? 1000,
      )
    }
  }
}

const handler = {
  async fetch(request: Request, env: WorkerEnv, _ctx: WorkerExecutionContext) {
    syncRuntimeEnv(env)
    const server = await loadServer()
    return withDbContext(() => server.default.fetch(request))
  },
  async scheduled(event: WorkerScheduledEvent, env: WorkerEnv, _ctx: WorkerExecutionContext) {
    syncRuntimeEnv(env)
    if (isEmergencyReadOnlyModeEnabled()) return
    if (process.env.SCHEDULED_JOBS_ENABLED !== 'true') return
    await runScheduledJobWithCapture(event.cron)
  },
}

export default Sentry.withSentry((env: WorkerEnv) => getSentryServerOptions(env), handler)
