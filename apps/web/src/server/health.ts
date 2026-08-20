import { sql } from 'drizzle-orm'
import { getDb } from '@phiguard/db/server'

export interface HealthcheckResult {
  ok: boolean
  checks: {
    database: 'ok' | 'error'
  }
  timestamp: string
}

export interface LivenessResult {
  ok: boolean
  timestamp: string
}

/**
 * Liveness: confirms the worker is up and serving without touching any
 * backing service. Deliberately issues NO database query so monitors and
 * crawlers hitting `/healthz` / `/health` cannot wake Neon (every Hyperdrive
 * connection attempt against a suspended Neon compute keeps it billing).
 * Use `/readyz` when you actually need to verify database reachability.
 */
export function buildLivenessResponse(): Response {
  return Response.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
    } satisfies LivenessResult,
    { status: 200 },
  )
}

export async function runHealthcheck(): Promise<HealthcheckResult> {
  const db = getDb()
  await db.execute(sql`select 1`)

  return {
    ok: true,
    checks: {
      database: 'ok',
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Readiness: runs `select 1` against the database. This wakes Neon on a cold
 * compute, so it must only be hit deliberately (smoke checks, low-frequency
 * readiness probes) — never on a continuous liveness schedule.
 */
export async function buildReadinessResponse(): Promise<Response> {
  try {
    const result = await runHealthcheck()
    return Response.json(result, { status: 200 })
  } catch {
    return Response.json(
      {
        ok: false,
        checks: {
          database: 'error',
        },
        timestamp: new Date().toISOString(),
      } satisfies HealthcheckResult,
      { status: 503 },
    )
  }
}
