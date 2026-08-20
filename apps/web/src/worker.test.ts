import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { captureServerExceptionMock, getDbMock, runNightlyExportMock, withDbContextMock } =
  vi.hoisted(() => ({
    captureServerExceptionMock: vi.fn(),
    getDbMock: vi.fn(() => ({ db: true })),
    runNightlyExportMock: vi.fn(),
    withDbContextMock: vi.fn((fn: () => unknown) => fn()),
  }))

vi.mock('@sentry/cloudflare', () => ({
  withSentry: vi.fn((_options, handler) => handler),
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  withDbContext: withDbContextMock,
}))

vi.mock('@phiguard/audit', () => ({
  logger: {
    safe: {
      warn: vi.fn(),
    },
  },
  runNightlyExport: runNightlyExportMock,
}))

vi.mock('./lib/runtime-env', () => ({
  syncRuntimeEnv: vi.fn((env: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'string') {
        process.env[key] = value
      }
    }
  }),
}))

vi.mock('./lib/sentry', () => ({
  captureServerException: captureServerExceptionMock,
  getSentryServerOptions: vi.fn(() => ({})),
}))

async function importWorker() {
  const module = await import('./worker')
  return module.default as {
    scheduled(event: { cron: string }, env: Record<string, unknown>, ctx: unknown): Promise<void>
  }
}

function transientDbError() {
  return Object.assign(new Error('connection closed'), { code: 'CONNECTION_CLOSED' })
}

async function runScheduled(handler: Awaited<ReturnType<typeof importWorker>>) {
  const promise = handler.scheduled(
    { cron: '0 3 * * *' },
    {
      SCHEDULED_JOBS_ENABLED: 'true',
      R2_AUDIT_EXPORTS_BUCKET: 'audit-exports',
    },
    {},
  )
  await vi.runAllTimersAsync()
  return promise
}

function startScheduled(handler: Awaited<ReturnType<typeof importWorker>>) {
  return handler.scheduled(
    { cron: '0 3 * * *' },
    {
      SCHEDULED_JOBS_ENABLED: 'true',
      R2_AUDIT_EXPORTS_BUCKET: 'audit-exports',
    },
    {},
  )
}

describe('worker scheduled jobs', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.SCHEDULED_JOBS_ENABLED
    delete process.env.R2_AUDIT_EXPORTS_BUCKET
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retries transient DB errors for scheduled jobs', async () => {
    const handler = await importWorker()
    runNightlyExportMock
      .mockRejectedValueOnce(transientDbError())
      .mockRejectedValueOnce(transientDbError())
      .mockResolvedValueOnce(undefined)

    await runScheduled(handler)

    expect(runNightlyExportMock).toHaveBeenCalledTimes(3)
    expect(withDbContextMock).toHaveBeenCalledTimes(3)
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })

  it('captures transient DB errors only after the final scheduled job attempt', async () => {
    const handler = await importWorker()
    const error = transientDbError()
    runNightlyExportMock.mockRejectedValue(error)

    const promise = startScheduled(handler)
    const assertion = expect(promise).rejects.toBe(error)
    await vi.runAllTimersAsync()
    await assertion

    expect(runNightlyExportMock).toHaveBeenCalledTimes(3)
    expect(captureServerExceptionMock).toHaveBeenCalledTimes(1)
    expect(captureServerExceptionMock).toHaveBeenCalledWith(error, {
      surface: 'scheduled',
      operation: 'worker.scheduled',
      tags: { cron: '0 3 * * *', attempt: '3', maxAttempts: '3', retried: 'true' },
    })
  })

  it('captures non-transient scheduled job errors without retrying', async () => {
    const handler = await importWorker()
    const error = new Error('R2_AUDIT_EXPORTS_BUCKET is not configured')
    runNightlyExportMock.mockRejectedValue(error)

    const promise = startScheduled(handler)
    const assertion = expect(promise).rejects.toBe(error)
    await vi.runAllTimersAsync()
    await assertion

    expect(runNightlyExportMock).toHaveBeenCalledTimes(1)
    expect(captureServerExceptionMock).toHaveBeenCalledTimes(1)
    expect(captureServerExceptionMock).toHaveBeenCalledWith(error, {
      surface: 'scheduled',
      operation: 'worker.scheduled',
      tags: { cron: '0 3 * * *', attempt: '1', maxAttempts: '3', retried: 'false' },
    })
  })

  it('skips scheduled DB work while emergency read-only mode is enabled', async () => {
    const handler = await importWorker()

    await handler.scheduled(
      { cron: '0 3 * * *' },
      {
        SCHEDULED_JOBS_ENABLED: 'true',
        PHIGUARD_READ_ONLY_MODE: 'true',
        R2_AUDIT_EXPORTS_BUCKET: 'audit-exports',
      },
      {},
    )

    expect(withDbContextMock).not.toHaveBeenCalled()
    expect(runNightlyExportMock).not.toHaveBeenCalled()
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })
})
