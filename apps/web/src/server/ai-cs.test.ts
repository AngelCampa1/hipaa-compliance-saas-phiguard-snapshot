import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as crypto from 'node:crypto'

const mocks = vi.hoisted(() => ({
  resolveAppSessionFromHeaders: vi.fn(),
  getDb: vi.fn(),
  resolveActiveLocationAccess: vi.fn(),
  assertCommercialProductAccess: vi.fn(),
  dbInsert: vi.fn(),
  dbInsertValues: vi.fn(),
  dbInsertReturning: vi.fn(),
  dbTransaction: vi.fn(),
  writeAuditEvent: vi.fn(),
  sendAiCsEscalationNotification: vi.fn(),
  captureServerException: vi.fn(),
  // Rate limit no-ops: return null = not limited
  rateLimitMiddleware: vi.fn((): Promise<Response | null> => Promise.resolve(null)),
  identifierRateLimitMiddleware: vi.fn((): Promise<Response | null> => Promise.resolve(null)),
}))

vi.mock('../lib/session.server.js', () => ({
  resolveAppSessionFromHeaders: mocks.resolveAppSessionFromHeaders,
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: mocks.getDb,
  aiCsEscalations: { name: 'ai_cs_escalations', id: 'ai_cs_escalations.id' },
}))

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: mocks.writeAuditEvent,
}))

vi.mock('@phiguard/email', () => ({
  sendAiCsEscalationNotification: mocks.sendAiCsEscalationNotification,
}))

vi.mock('../lib/sentry.js', () => ({
  captureServerException: mocks.captureServerException,
}))

vi.mock('./access.js', () => ({
  resolveActiveLocationAccess: mocks.resolveActiveLocationAccess,
  assertCommercialProductAccess: mocks.assertCommercialProductAccess,
}))

vi.mock('../middleware/rate-limit.js', () => ({
  createRateLimitMiddleware: () => mocks.rateLimitMiddleware,
  createIdentifierRateLimitMiddleware: () => mocks.identifierRateLimitMiddleware,
}))

function createRequest(path: string, body: unknown) {
  return new Request(`https://my.phiguard.app${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://my.phiguard.app',
    },
    body: JSON.stringify(body),
  })
}

function createRawRequest(path: string, body: string) {
  return new Request(`https://my.phiguard.app${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://my.phiguard.app',
    },
    body,
  })
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function expectedAiCsSignature(input: {
  body: Record<string, unknown>
  path: string
  timestamp: string
  nonce: string
}) {
  const bodyHash = crypto.createHash('sha256').update(stableJson(input.body)).digest('hex')
  return crypto
    .createHmac('sha256', 'a-valid-client-assertion-secret')
    .update(`${input.timestamp}.${input.nonce}.POST.${input.path}.${bodyHash}`)
    .digest('hex')
}

describe('AI-CS product proxy', () => {
  beforeEach(() => {
    vi.stubEnv('AI_CS_CLIENT_ASSERTION_SECRET', 'a-valid-client-assertion-secret')
    vi.stubEnv('AI_CS_WORKER_ORIGIN', 'https://ai-cs.phiguard.app')
    vi.stubEnv('AI_CS_FREE_TEXT_ENABLED', 'true')
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{"sessionId":"sess_1"}', { status: 200 }))),
    )
    mocks.resolveAppSessionFromHeaders.mockResolvedValue({
      user: { id: 'user_123' },
      session: { activeOrganizationId: 'org_123' },
    })
    mocks.dbInsertReturning.mockResolvedValue([{ id: 'esc_row_1' }])
    mocks.dbInsertValues.mockReturnValue({ returning: mocks.dbInsertReturning })
    mocks.dbInsert.mockReturnValue({ values: mocks.dbInsertValues })
    // The escalation insert + audit write run inside a single transaction; the
    // tx handle exposes the same insert mock so shape assertions still hold.
    mocks.dbTransaction.mockImplementation(
      (cb: (tx: { insert: typeof mocks.dbInsert }) => unknown) =>
        cb({ insert: mocks.dbInsert }),
    )
    mocks.writeAuditEvent.mockResolvedValue(undefined)
    // id: 'db' preserved so existing assertions on the getDb() return value hold
    mocks.getDb.mockReturnValue({
      id: 'db',
      insert: mocks.dbInsert,
      transaction: mocks.dbTransaction,
    })
    mocks.sendAiCsEscalationNotification.mockResolvedValue(undefined)
    mocks.captureServerException.mockImplementation(() => undefined)
    mocks.resolveActiveLocationAccess.mockResolvedValue({
      userId: 'user_123',
      organizationId: 'org_123',
      commercial: { planStatus: 'active' },
    })
    mocks.assertCommercialProductAccess.mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    mocks.resolveAppSessionFromHeaders.mockReset()
    mocks.getDb.mockReset()
    mocks.dbInsert.mockReset()
    mocks.dbInsertValues.mockReset()
    mocks.dbInsertReturning.mockReset()
    mocks.dbTransaction.mockReset()
    mocks.writeAuditEvent.mockReset()
    mocks.sendAiCsEscalationNotification.mockReset()
    mocks.captureServerException.mockReset()
    mocks.resolveActiveLocationAccess.mockReset()
    mocks.assertCommercialProductAccess.mockReset()
  })

  it('rejects unauthenticated requests before calling the worker', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
      'sessions',
    )

    expect(response.status).toBe(401)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects commercially locked organizations before calling the worker', async () => {
    mocks.assertCommercialProductAccess.mockImplementation(() => {
      throw new Error('Billing action required before accessing PHIGuard.')
    })
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
      'sessions',
    )

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Billing action required before accessing PHIGuard.')
    expect(mocks.resolveActiveLocationAccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'db' }),
      {
        user: { id: 'user_123' },
        session: { activeOrganizationId: 'org_123' },
      },
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('creates sessions with server-derived PHIGuard identity and signed worker headers', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', {
        appId: 'evil',
        userId: 'attacker',
        currentPath: '/app/tasks',
      }),
      'sessions',
    )

    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalledWith(
      'https://ai-cs.phiguard.app/v1/sessions',
      expect.objectContaining({ method: 'POST' }),
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    expect(JSON.parse(init.body as string)).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      currentPath: '/app/tasks',
      metadata: { organizationId: 'org_123' },
    })

    const headers = new Headers(init.headers)
    expect(headers.get('X-Ventora-Timestamp')).toBeTruthy()
    expect(headers.get('X-Ventora-Nonce')).toBeTruthy()
    expect(headers.get('X-Ventora-Signature')).toMatch(/^[a-f0-9]{64}$/)
    expect(headers.get('Authorization')).toBeNull()
  })

  it('uses the resolved organization when the session active organization is stale', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue({
      user: { id: 'user_123' },
      session: { activeOrganizationId: 'org_stale' },
    })
    mocks.resolveActiveLocationAccess.mockResolvedValue({
      userId: 'user_123',
      organizationId: 'org_123',
      commercial: { planStatus: 'active' },
    })
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
      'sessions',
    )

    expect(response.status).toBe(200)
    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    expect(JSON.parse(init.body as string)).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      currentPath: '/app/dashboard',
      metadata: { organizationId: 'org_123' },
    })
  })

  it('signs the same session payload that is sent when optional currentPath is absent', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(createRequest('/api/ai-cs/sessions', {}), 'sessions')

    expect(response.status).toBe(200)
    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')

    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      metadata: { organizationId: 'org_123' },
    })

    const headers = new Headers(init.headers)
    const timestamp = headers.get('X-Ventora-Timestamp')
    const nonce = headers.get('X-Ventora-Nonce')
    if (!timestamp || !nonce) throw new Error('Expected signed worker headers')

    expect(headers.get('X-Ventora-Signature')).toBe(
      expectedAiCsSignature({
        body,
        path: '/v1/sessions',
        timestamp,
        nonce,
      }),
    )
  })

  it('forwards chat payloads with server-derived app, user, and organization identity', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/chat', {
        sessionId: 'sess_1',
        message: 'How do I find audit exports?',
        appId: 'evil',
        userId: 'attacker',
        currentPath: '/app/audit',
      }),
      'chat',
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    expect(JSON.parse(init.body as string)).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      sessionId: 'sess_1',
      message: 'How do I find audit exports?',
      currentPath: '/app/audit',
      metadata: { organizationId: 'org_123' },
    })
  })

  it('forwards escalation payloads with server-derived app, user, and organization identity', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/escalations', {
        sessionId: 'sess_1',
        reason: 'Need help with an audit export',
        appId: 'evil',
        userId: 'attacker',
        metadata: { organizationId: 'attacker_org' },
        currentPath: '/app/audit',
      }),
      'escalations',
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    expect(JSON.parse(init.body as string)).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      sessionId: 'sess_1',
      reason: 'Need help with an audit export',
      currentPath: '/app/audit',
      metadata: { organizationId: 'org_123' },
    })
  })

  it('rejects chat requests without a session id or message before proxying', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/chat', {
        sessionId: 'sess_1',
        currentPath: '/app/audit',
      }),
      'chat',
    )

    expect(response.status).toBe(400)
    await expect(response.text()).resolves.toBe('Invalid AI-CS payload')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects oversized AI-CS messages before proxying', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/chat', {
        sessionId: 'sess_1',
        message: 'x'.repeat(4001),
        currentPath: '/app/audit',
      }),
      'chat',
    )

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects oversized raw request bodies before proxying ignored fields', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRawRequest(
        '/api/ai-cs/sessions',
        JSON.stringify({
          currentPath: '/app/dashboard',
          ignored: 'x'.repeat(20_000),
        }),
      ),
      'sessions',
    )

    expect(response.status).toBe(413)
    await expect(response.text()).resolves.toBe('AI-CS payload too large')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects oversized currentPath before proxying', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', {
        currentPath: `/app/${'x'.repeat(600)}`,
      }),
      'sessions',
    )

    expect(response.status).toBe(400)
    await expect(response.text()).resolves.toBe('Invalid AI-CS payload')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('treats primitive JSON payloads as empty objects for session creation', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRawRequest('/api/ai-cs/sessions', '"not-an-object"'),
      'sessions',
    )

    expect(response.status).toBe(200)
    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    expect(JSON.parse(init.body as string)).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      metadata: { organizationId: 'org_123' },
    })
  })

  it('rejects escalation requests without a session id before proxying', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/escalations', {}),
      'escalations',
    )

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fails closed when the client assertion secret is not configured', async () => {
    vi.stubEnv('AI_CS_CLIENT_ASSERTION_SECRET', '')
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/escalations', {
        sessionId: 'sess_1',
        reason: 'needs human support',
      }),
      'escalations',
    )

    expect(response.status).toBe(503)
    await expect(response.text()).resolves.toBe('AI-CS is not configured')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fails closed when AI-CS free text is not explicitly enabled', async () => {
    vi.stubEnv('AI_CS_FREE_TEXT_ENABLED', '')
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/chat', {
        sessionId: 'sess_1',
        message: 'How do I find audit exports?',
      }),
      'chat',
    )

    expect(response.status).toBe(503)
    await expect(response.text()).resolves.toBe('AI-CS is not configured')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fails closed when the worker origin is not configured', async () => {
    vi.stubEnv('AI_CS_WORKER_ORIGIN', '')
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', { currentPath: '/app/tasks' }),
      'sessions',
    )

    expect(response.status).toBe(503)
    await expect(response.text()).resolves.toBe('AI-CS is not configured')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('strips upstream cookie headers from worker responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response('{"sessionId":"sess_1"}', {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': 'session=attacker; Path=/; HttpOnly',
            },
          }),
        ),
      ),
    )
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
      'sessions',
    )

    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(response.headers.get('Set-Cookie')).toBeNull()
  })

  it('returns a controlled upstream error when the AI-CS worker request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('worker unavailable'))))
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/chat', {
        sessionId: 'sess_1',
        message: 'How do I find audit exports?',
        currentPath: '/app/audit',
      }),
      'chat',
    )

    expect(response.status).toBe(502)
    await expect(response.text()).resolves.toBe('AI-CS worker request failed')
  })

  it('rate limits authenticated AI-CS proxy requests before calling the worker', async () => {
    // Simulate the rate limiter allowing 30 requests then blocking the 31st.
    const rateLimitResponse = new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
    let callCount = 0
    mocks.rateLimitMiddleware.mockImplementation((): Promise<Response | null> => {
      callCount += 1
      return Promise.resolve(callCount > 30 ? rateLimitResponse : null)
    })

    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    let response = new Response(null, { status: 500 })
    for (let index = 0; index < 31; index += 1) {
      response = await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
        'sessions',
      )
    }

    expect(response.status).toBe(429)
    await expect(response.json()).resolves.toEqual({ error: 'Too many requests' })
    expect(fetch).toHaveBeenCalledTimes(30)
  })

  it('forwards the inbound Origin header to the worker', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
      'sessions',
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    const headers = new Headers(init.headers)
    expect(headers.get('Origin')).toBe('https://my.phiguard.app')
  })

  it('falls back to AI_CS_APP_ORIGIN env var when inbound request has no Origin', async () => {
    vi.stubEnv('AI_CS_APP_ORIGIN', 'https://app.phiguard.example')
    const requestWithoutOrigin = new Request('https://my.phiguard.app/api/ai-cs/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPath: '/app/dashboard' }),
    })
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(requestWithoutOrigin, 'sessions')

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    const headers = new Headers(init.headers)
    expect(headers.get('Origin')).toBe('https://app.phiguard.example')
  })

  it('falls back to APP_URL env var when AI_CS_APP_ORIGIN is not set and inbound request has no Origin', async () => {
    vi.stubEnv('APP_URL', 'https://my.phiguard.app')
    const requestWithoutOrigin = new Request('https://my.phiguard.app/api/ai-cs/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPath: '/app/dashboard' }),
    })
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(requestWithoutOrigin, 'sessions')

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    const headers = new Headers(init.headers)
    expect(headers.get('Origin')).toBe('https://my.phiguard.app')
  })

  it('forwards escalation without reason and omits reason key from worker body', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/escalations', {
        sessionId: 'sess_1',
        appId: 'evil',
        userId: 'attacker',
      }),
      'escalations',
    )

    expect(response.status).toBe(200)
    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      sessionId: 'sess_1',
      metadata: { organizationId: 'org_123' },
    })
    expect(Object.prototype.hasOwnProperty.call(body, 'reason')).toBe(false)
  })

  it('forwards escalation with a valid reason and includes reason in worker body', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/escalations', {
        sessionId: 'sess_1',
        reason: 'Need a human to help',
      }),
      'escalations',
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    expect(JSON.parse(init.body as string)).toEqual({
      appId: 'phiguard',
      userId: 'user_123',
      sessionId: 'sess_1',
      reason: 'Need a human to help',
      metadata: { organizationId: 'org_123' },
    })
  })

  it('rejects escalation with present-but-empty reason before proxying', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/escalations', {
        sessionId: 'sess_1',
        reason: '',
      }),
      'escalations',
    )

    expect(response.status).toBe(400)
    await expect(response.text()).resolves.toBe('Invalid AI-CS payload')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects requests with invalid JSON body before proxying', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRawRequest('/api/ai-cs/sessions', '{not valid json'),
      'sessions',
    )

    expect(response.status).toBe(400)
    await expect(response.text()).resolves.toBe('Invalid JSON payload')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('omits Origin header when inbound request has no Origin and no fallback env var is set', async () => {
    const requestWithoutOrigin = new Request('https://my.phiguard.app/api/ai-cs/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    await handleAiCsProxyRequest(requestWithoutOrigin, 'sessions')

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')
    const headers = new Headers(init.headers)
    expect(headers.get('Origin')).toBeNull()
  })

  it('does not include Origin in the signature payload (signature covers only timestamp.nonce.METHOD.path.bodyHash)', async () => {
    const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

    const response = await handleAiCsProxyRequest(
      createRequest('/api/ai-cs/sessions', {}),
      'sessions',
    )

    expect(response.status).toBe(200)
    const [, init] = vi.mocked(fetch).mock.calls[0]!
    if (!init) throw new Error('Expected fetch init')

    const body = JSON.parse(init.body as string) as Record<string, unknown>
    const headers = new Headers(init.headers)
    const timestamp = headers.get('X-Ventora-Timestamp')
    const nonce = headers.get('X-Ventora-Nonce')
    if (!timestamp || !nonce) throw new Error('Expected signed worker headers')

    expect(headers.get('X-Ventora-Signature')).toBe(
      expectedAiCsSignature({
        body,
        path: '/v1/sessions',
        timestamp,
        nonce,
      }),
    )
  })

  describe('escalation durability', () => {
    // Use a dedicated user id to avoid exhausting the per-user rate limit
    // bucket shared across all tests in this module (limit: 30/min).
    const ESC_USER = 'user_esc_durability'
    const ESC_ORG = 'org_esc_durability'

    beforeEach(() => {
      mocks.resolveAppSessionFromHeaders.mockResolvedValue({
        user: { id: ESC_USER },
        session: { activeOrganizationId: ESC_ORG },
      })
      mocks.resolveActiveLocationAccess.mockResolvedValue({
        userId: ESC_USER,
        organizationId: ESC_ORG,
        commercial: { planStatus: 'active' },
      })
    })

    it('inserts a row with the right shape before forwarding to the worker', async () => {
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      const response = await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_1',
          reason: 'Need help with an export',
          message: 'Please help me',
          contact: 'user@example.com',
          currentPath: '/app/audit',
        }),
        'escalations',
      )

      expect(response.status).toBe(200)
      expect(mocks.dbInsert).toHaveBeenCalledOnce()
      expect(mocks.dbInsertValues).toHaveBeenCalledOnce()
      expect(mocks.dbInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: ESC_ORG,
          userId: ESC_USER,
          sessionId: 'sess_esc_1',
          appId: 'phiguard',
          reason: 'Need help with an export',
          message: 'Please help me',
          contact: 'user@example.com',
          currentPath: '/app/audit',
        }),
      )
    })

    it('writes a PHI-table audit event in the same transaction with no free-text PHI', async () => {
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_audit',
          reason: 'Need help with an export',
          message: 'Please help me',
          contact: 'user@example.com',
          currentPath: '/app/audit',
        }),
        'escalations',
      )

      // Insert + audit write are wrapped in one transaction.
      expect(mocks.dbTransaction).toHaveBeenCalledOnce()
      expect(mocks.writeAuditEvent).toHaveBeenCalledOnce()

      const [txArg, event] = mocks.writeAuditEvent.mock.calls[0] as [
        unknown,
        {
          tenantId: string
          actorId: string
          action: string
          resourceType: string
          resourceId: string
          after: Record<string, unknown>
        },
      ]
      // Audit write must use the transaction handle, not a fresh connection.
      expect(txArg).toEqual(expect.objectContaining({ insert: mocks.dbInsert }))
      expect(event).toEqual(
        expect.objectContaining({
          tenantId: ESC_ORG,
          actorId: ESC_USER,
          action: 'ai_cs.escalation.created',
          resourceType: 'ai_cs_escalation',
          resourceId: 'esc_row_1',
        }),
      )
      expect(event.after).toEqual({
        appId: 'phiguard',
        sessionId: 'sess_esc_audit',
        hasReason: true,
        hasMessage: true,
        hasContact: true,
      })
      // The audit payload must never carry the free-text reason/message/contact.
      const serialized = JSON.stringify(event)
      expect(serialized).not.toContain('Please help me')
      expect(serialized).not.toContain('user@example.com')
      expect(serialized).not.toContain('Need help with an export')
    })

    it('sends the escalation email before forwarding to the worker', async () => {
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_2',
          reason: 'Needs a human',
          message: 'I need help',
          contact: 'contact@example.com',
          currentPath: '/app/tasks',
        }),
        'escalations',
      )

      expect(mocks.sendAiCsEscalationNotification).toHaveBeenCalledOnce()
      expect(mocks.sendAiCsEscalationNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'phiguard',
          organizationId: ESC_ORG,
          userId: ESC_USER,
          sessionId: 'sess_esc_2',
          reason: 'Needs a human',
          message: 'I need help',
          contact: 'contact@example.com',
          currentPath: '/app/tasks',
        }),
      )
      expect(fetch).toHaveBeenCalledOnce()
    })

    it('still forwards to the worker and returns a response when the DB insert throws', async () => {
      mocks.dbInsertReturning.mockRejectedValueOnce(new Error('db connection failed'))
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      const response = await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_3',
          reason: 'db will fail',
        }),
        'escalations',
      )

      expect(response.status).toBe(200)
      expect(mocks.captureServerException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ operation: 'ai-cs-escalation-persist' }),
      )
      expect(mocks.sendAiCsEscalationNotification).toHaveBeenCalledOnce()
      expect(fetch).toHaveBeenCalledOnce()
    })

    it('still forwards to the worker and returns a response when the mailer throws', async () => {
      mocks.sendAiCsEscalationNotification.mockRejectedValueOnce(new Error('resend unavailable'))
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      const response = await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_4',
          reason: 'email will fail',
        }),
        'escalations',
      )

      expect(response.status).toBe(200)
      expect(mocks.captureServerException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ operation: 'ai-cs-escalation-email' }),
      )
      expect(fetch).toHaveBeenCalledOnce()
    })

    it('still forwards when both DB insert and mailer throw', async () => {
      mocks.dbInsertReturning.mockRejectedValueOnce(new Error('db failed'))
      mocks.sendAiCsEscalationNotification.mockRejectedValueOnce(new Error('email failed'))
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      const response = await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_5',
          reason: 'both fail',
        }),
        'escalations',
      )

      expect(response.status).toBe(200)
      expect(mocks.captureServerException).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenCalledOnce()
    })

    it('does not insert a row or send email for sessions requests', async () => {
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/sessions', { currentPath: '/app/dashboard' }),
        'sessions',
      )

      expect(mocks.dbInsert).not.toHaveBeenCalled()
      expect(mocks.sendAiCsEscalationNotification).not.toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledOnce()
    })

    it('does not insert a row or send email for chat requests', async () => {
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/chat', {
          sessionId: 'sess_1',
          message: 'How do I find audit exports?',
        }),
        'chat',
      )

      expect(mocks.dbInsert).not.toHaveBeenCalled()
      expect(mocks.sendAiCsEscalationNotification).not.toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledOnce()
    })

    it('worker body for escalation does not include message or contact fields', async () => {
      const { handleAiCsProxyRequest } = await import('./ai-cs-proxy.server.js')

      await handleAiCsProxyRequest(
        createRequest('/api/ai-cs/escalations', {
          sessionId: 'sess_esc_6',
          reason: 'Need help',
          message: 'Some message',
          contact: 'user@example.com',
        }),
        'escalations',
      )

      const [, init] = vi.mocked(fetch).mock.calls[0]!
      if (!init) throw new Error('Expected fetch init')
      const body = JSON.parse(init.body as string) as Record<string, unknown>
      expect(Object.prototype.hasOwnProperty.call(body, 'message')).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(body, 'contact')).toBe(false)
      expect(body).toEqual({
        appId: 'phiguard',
        userId: ESC_USER,
        sessionId: 'sess_esc_6',
        reason: 'Need help',
        metadata: { organizationId: ESC_ORG },
      })
    })
  })
})
