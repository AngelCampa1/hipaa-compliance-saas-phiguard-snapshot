import * as crypto from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => {
  const dbInsertReturning = vi.fn()
  const dbInsertOnConflict = vi.fn(() => ({ returning: dbInsertReturning }))
  const dbInsertValues = vi.fn(() => ({ onConflictDoNothing: dbInsertOnConflict }))
  const dbInsert = vi.fn(() => ({ values: dbInsertValues }))
  const getDb = vi.fn(() => ({ insert: dbInsert }))

  return {
    getDb,
    dbInsert,
    dbInsertValues,
    dbInsertOnConflict,
    dbInsertReturning,
  }
})

vi.mock('@phiguard/db/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@phiguard/db/server')>()
  return {
    ...actual,
    getDb: mocks.getDb,
    aiCsNonces: actual.aiCsNonces,
  }
})

// ---------------------------------------------------------------------------
// Subject under test (imported AFTER mocks are registered)
// ---------------------------------------------------------------------------

import { buildPhiguardAppContext, consumeNonce, handleAiCsContextRequest } from './ai-cs-context.server.js'
import { hmacHex, sha256Hex, stableJson } from './ai-cs-proxy.server.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_SECRET = 'test-secret-32-chars-minimum-ok!'
const APP_BASE = 'https://my.phiguard.app'

function buildCanonicalPayload(opts: {
  timestamp: string
  nonce: string
  method: string
  path: string
  body: Record<string, unknown>
}): string {
  const bodyHash = sha256Hex(stableJson(opts.body))
  return `${opts.timestamp}.${opts.nonce}.${opts.method.toUpperCase()}.${opts.path}.${bodyHash}`
}

function signedGetRequest(opts: {
  appId?: string
  userId?: string
  secret?: string
  timestamp?: string
  nonce?: string
  signature?: string
  extraQuery?: string
}): Request {
  const appId = opts.appId ?? 'phiguard'
  const userId = opts.userId ?? 'user-123'
  const secret = opts.secret ?? TEST_SECRET
  const timestamp = opts.timestamp ?? new Date().toISOString()
  const nonce = opts.nonce ?? crypto.randomUUID().replaceAll('-', '')
  const path = `/api/ai-cs/context?appId=${appId}&userId=${userId}${opts.extraQuery ?? ''}`
  const body = { appId, userId }
  const payload = buildCanonicalPayload({ timestamp, nonce, method: 'GET', path, body })
  const signature = opts.signature ?? hmacHex(payload, secret)

  return new Request(`${APP_BASE}${path}`, {
    method: 'GET',
    headers: {
      'X-Ventora-Timestamp': timestamp,
      'X-Ventora-Nonce': nonce,
      'X-Ventora-Signature': signature,
    },
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('handleAiCsContextRequest', () => {
  const originalSecret = process.env.AI_CS_CONTEXT_SECRET

  beforeEach(() => {
    process.env.AI_CS_CONTEXT_SECRET = TEST_SECRET
    // Default: nonce insert succeeds (first use)
    mocks.dbInsertReturning.mockResolvedValue([{ nonce: 'some-nonce', expiresAt: new Date() }])
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.AI_CS_CONTEXT_SECRET
    } else {
      process.env.AI_CS_CONTEXT_SECRET = originalSecret
    }
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // 503 — unconfigured secret
  // -------------------------------------------------------------------------

  describe('when AI_CS_CONTEXT_SECRET is not set', () => {
    it('returns 503', async () => {
      delete process.env.AI_CS_CONTEXT_SECRET
      const req = signedGetRequest({})
      const res = await handleAiCsContextRequest(req)
      expect(res.status).toBe(503)
      const json = await res.json() as { error: string }
      expect(json.error).toBe('App context unavailable')
    })
  })

  // -------------------------------------------------------------------------
  // 400 — missing / invalid params
  // -------------------------------------------------------------------------

  it('returns 400 when appId is missing', async () => {
    const timestamp = new Date().toISOString()
    const nonce = 'testnonce'
    const path = '/api/ai-cs/context?userId=user-123'
    const payload = buildCanonicalPayload({ timestamp, nonce, method: 'GET', path, body: { appId: '', userId: 'user-123' } })
    const sig = hmacHex(payload, TEST_SECRET)
    const req = new Request(`${APP_BASE}${path}`, {
      method: 'GET',
      headers: { 'X-Ventora-Timestamp': timestamp, 'X-Ventora-Nonce': nonce, 'X-Ventora-Signature': sig },
    })
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when userId is missing', async () => {
    const timestamp = new Date().toISOString()
    const nonce = 'testnonce2'
    const path = '/api/ai-cs/context?appId=phiguard'
    const payload = buildCanonicalPayload({ timestamp, nonce, method: 'GET', path, body: { appId: 'phiguard', userId: '' } })
    const sig = hmacHex(payload, TEST_SECRET)
    const req = new Request(`${APP_BASE}${path}`, {
      method: 'GET',
      headers: { 'X-Ventora-Timestamp': timestamp, 'X-Ventora-Nonce': nonce, 'X-Ventora-Signature': sig },
    })
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when appId is not phiguard', async () => {
    const req = signedGetRequest({ appId: 'other-app' })
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(400)
    const json = await res.json() as { error: string }
    expect(json.error).toBe('Unknown app')
  })

  // -------------------------------------------------------------------------
  // 401 — missing / bad signature
  // -------------------------------------------------------------------------

  it('returns 401 when HMAC headers are missing', async () => {
    const req = new Request(`${APP_BASE}/api/ai-cs/context?appId=phiguard&userId=user-123`, {
      method: 'GET',
    })
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when signature is wrong', async () => {
    const req = signedGetRequest({ signature: 'a'.repeat(64) })
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when timestamp is expired (outside skew window)', async () => {
    const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const req = signedGetRequest({ timestamp: oldTimestamp })
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 on replayed nonce (second consume returns empty array)', async () => {
    mocks.dbInsertReturning.mockResolvedValue([])
    const req = signedGetRequest({})
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(401)
    const json = await res.json() as { error: string }
    expect(json.error).toBe('Invalid signature')
  })

  // -------------------------------------------------------------------------
  // 503 — DB failure fails closed
  // -------------------------------------------------------------------------

  it('returns 503 when nonce DB insert throws', async () => {
    mocks.dbInsertReturning.mockRejectedValue(new Error('DB connection error'))
    const req = signedGetRequest({})
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(503)
  })

  // -------------------------------------------------------------------------
  // 200 — happy path
  // -------------------------------------------------------------------------

  it('returns 200 with well-formed AiCsAppContext and signed response headers', async () => {
    const req = signedGetRequest({})
    const res = await handleAiCsContextRequest(req)
    expect(res.status).toBe(200)

    // Cache-Control
    expect(res.headers.get('Cache-Control')).toBe('private, max-age=300')

    // Response signing headers present
    const resTimestamp = res.headers.get('X-Ventora-Timestamp')
    const resNonce = res.headers.get('X-Ventora-Nonce')
    const resSig = res.headers.get('X-Ventora-Signature')
    expect(resTimestamp).toBeTruthy()
    expect(resNonce).toBeTruthy()
    expect(resSig).toMatch(/^[a-f0-9]{64}$/)

    // Verify response signature
    const body = await res.json() as AiCsAppContext
    const url = new URL(req.url)
    const path = `${url.pathname}${url.search}`
    const expectedPayload = buildCanonicalPayload({
      timestamp: resTimestamp!,
      nonce: resNonce!,
      method: 'GET',
      path,
      body: body as unknown as Record<string, unknown>,
    })
    expect(resSig).toBe(hmacHex(expectedPayload, TEST_SECRET))

    // Body shape
    expect(body.assistantId).toBe('ai-cs')
    expect(body.appId).toBe('phiguard')
    expect(body.appName).toBe('PHIGuard')
    expect(body.authenticatedOnly).toBe(true)
    expect(typeof body.description).toBe('string')
    expect(body.description!.length).toBeGreaterThan(0)

    // Non-empty sources
    expect(Array.isArray(body.sources)).toBe(true)
    expect(body.sources!.length).toBeGreaterThan(0)
    const source = body.sources![0]!
    expect(typeof source.id).toBe('string')
    expect(typeof source.title).toBe('string')
    expect(typeof source.url).toBe('string')

    // Navigation
    expect(Array.isArray(body.navigation)).toBe(true)
    expect(body.navigation!.length).toBeGreaterThan(0)

    // Workflow
    expect(Array.isArray(body.workflow)).toBe(true)
    expect(body.workflow!.length).toBeGreaterThan(0)
    const step = body.workflow![0]!
    expect(typeof step.id).toBe('string')
    expect(typeof step.label).toBe('string')
    expect(step.status).toBe('next')
  })
})

// ---------------------------------------------------------------------------
// consumeNonce unit tests
// ---------------------------------------------------------------------------

describe('consumeNonce', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when insert succeeds (first use)', async () => {
    mocks.dbInsertReturning.mockResolvedValue([{ nonce: 'abc', expiresAt: new Date() }])
    const result = await consumeNonce('abc', new Date().toISOString())
    expect(result).toBe(true)
  })

  it('returns false when insert returns empty (replay)', async () => {
    mocks.dbInsertReturning.mockResolvedValue([])
    const result = await consumeNonce('abc', new Date().toISOString())
    expect(result).toBe(false)
  })

  it('throws when DB insert rejects', async () => {
    mocks.dbInsertReturning.mockRejectedValue(new Error('DB error'))
    await expect(consumeNonce('abc', new Date().toISOString())).rejects.toThrow('DB error')
  })
})

// ---------------------------------------------------------------------------
// buildPhiguardAppContext unit test
// ---------------------------------------------------------------------------

describe('buildPhiguardAppContext', () => {
  it('returns a context with correct shape and phiguard-accurate content', () => {
    const ctx = buildPhiguardAppContext()
    expect(ctx.assistantId).toBe('ai-cs')
    expect(ctx.appId).toBe('phiguard')
    expect(ctx.appName).toBe('PHIGuard')
    expect(ctx.authenticatedOnly).toBe(true)
    expect(ctx.sources!.length).toBeGreaterThan(0)
    expect(ctx.sources!.length).toBeLessThanOrEqual(8)
    expect(ctx.navigation!.length).toBeGreaterThan(0)
    expect(ctx.navigation!.length).toBeLessThanOrEqual(12)
    expect(ctx.workflow!.length).toBeGreaterThan(0)
    // All sources should reference my.phiguard.app
    for (const src of ctx.sources!) {
      expect(src.url).toContain('my.phiguard.app')
    }
    // No PHI-bearing content
    expect(ctx.description).toContain('PHIGuard')
  })
})

// Re-export for TS type usage only
type AiCsAppContext = Awaited<ReturnType<typeof buildPhiguardAppContext>>
