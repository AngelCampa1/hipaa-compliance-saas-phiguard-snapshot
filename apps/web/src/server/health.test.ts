import { beforeEach, describe, expect, it, vi } from 'vitest'

const getDbMock = vi.fn()

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
}))

describe('buildLivenessResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 without touching the database', async () => {
    const { buildLivenessResponse } = await import('./health.js')
    const response = buildLivenessResponse()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({ ok: true })
    expect(typeof body.timestamp).toBe('string')
    // Liveness must never wake Neon: getDb is never called.
    expect(getDbMock).not.toHaveBeenCalled()
  })
})

describe('buildReadinessResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 when the database check succeeds', async () => {
    getDbMock.mockReturnValue({
      execute: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    })

    const { buildReadinessResponse } = await import('./health.js')
    const response = await buildReadinessResponse()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      ok: true,
      checks: { database: 'ok' },
    })
    expect(getDbMock).toHaveBeenCalledOnce()
  })

  it('returns 503 when the database check fails', async () => {
    getDbMock.mockReturnValue({
      execute: vi.fn().mockRejectedValue(new Error('db down')),
    })

    const { buildReadinessResponse } = await import('./health.js')
    const response = await buildReadinessResponse()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toMatchObject({
      ok: false,
      checks: { database: 'error' },
    })
  })
})
