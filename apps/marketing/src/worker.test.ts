import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const captureExceptionMock = vi.hoisted(() => vi.fn())

vi.mock('@sentry/cloudflare', () => ({
  withSentry: vi.fn((_options, handler) => handler),
  captureException: captureExceptionMock,
  withScope: vi.fn((callback: (scope: {
    setTag: (key: string, value: string) => void
    setExtras: (value: Record<string, unknown>) => void
  }) => void) => {
    callback({
      setTag: vi.fn(),
      setExtras: vi.fn(),
    })
  }),
}))

async function importWorker() {
  vi.resetModules()
  const mod = await import('./worker')
  return mod.default as {
    fetch(request: Request, env: {
      ASSETS: { fetch: (request: Request) => Promise<Response> }
      PUBLIC_APP_ENV?: string
      PUBLIC_SENTRY_MARKETING_DSN?: string
      PUBLIC_SENTRY_DSN?: string
      AI_SDR_CONTEXT_SECRET?: string
      AI_SDR_CLIENT_ASSERTION_SECRET?: string
      AI_SDR_WORKER_URL?: string
    }): Promise<Response>
  }
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

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function signedAiSdrHeaders(path: string, secret: string, productId = 'phiguard') {
  const timestamp = new Date().toISOString()
  const nonce = 'phiguard-ai-sdr-nonce'
  const bodyHash = await sha256Hex(stableJson({ productId }))
  const payload = `${timestamp}.${nonce}.GET.${path}.${bodyHash}`
  return {
    'X-Ventora-Timestamp': timestamp,
    'X-Ventora-Nonce': nonce,
    'X-Ventora-Signature': await hmacHex(payload, secret),
  }
}

describe('marketing worker sentry reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns signed AI-SDR context with current limited offer pricing', async () => {
    const worker = await importWorker()
    const secret = 'test-ai-sdr-secret'
    const path = '/api/ai-sdr/product-context?productId=phiguard'
    const response = await worker.fetch(new Request(`https://phiguard.app${path}`, {
      headers: await signedAiSdrHeaders(path, secret),
    }), {
      ASSETS: { fetch: vi.fn() },
      AI_SDR_CONTEXT_SECRET: secret,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, max-age=300')
    expect(response.headers.get('X-Ventora-Signature')).toMatch(/^[a-f0-9]{64}$/)
    const body = await response.json() as {
      productId: string
      plans: Array<{
        id: string
        price: string
        monthlyPrice: string
        annualPrice: string
        discount: string
        defaultCadence: string
        trialDays: number
        ctaUrl: string
        ctaUrls: {
          annual: string
          monthly: string
        }
      }>
    }
    expect(body.productId).toBe('phiguard')
    expect(body.plans[0]).toMatchObject({
      id: 'essentials',
      price: '$30/month equivalent, $358/year paid upfront annually',
      monthlyPrice: '$36/mo',
      annualPrice: '$30/month equivalent, $358/year paid upfront annually',
      discount: 'Limited time offer: 80% off the first year. Auto-applied at checkout.',
      defaultCadence: 'year',
      trialDays: 30,
      ctaUrl: 'https://my.phiguard.app/signup',
      ctaUrls: {
        annual: 'https://my.phiguard.app/signup',
        monthly: 'https://my.phiguard.app/signup',
      },
    })
  }, 15000)

  it('captures unexpected asset fetch failures and returns a generic 500', async () => {
    const worker = await importWorker()
    const error = new Error('asset runtime failed')

    const response = await worker.fetch(new Request('https://phiguard.app/'), {
      ASSETS: {
        fetch: vi.fn().mockRejectedValue(error),
      },
      PUBLIC_APP_ENV: 'production',
    })

    expect(response.status).toBe(500)
    expect(await response.text()).toMatch(/error ID err_/)
    expect(captureExceptionMock).toHaveBeenCalledWith(error)
  }, 15000)

  it('captures asset 5xx responses without reporting expected 4xx responses', async () => {
    const worker = await importWorker()
    const assetFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response('origin failed', { status: 503 }))

    expect(
      await worker.fetch(new Request('https://phiguard.app/missing'), {
        ASSETS: { fetch: assetFetch },
      }),
    ).toHaveProperty('status', 404)
    expect(captureExceptionMock).not.toHaveBeenCalled()

    const response = await worker.fetch(new Request('https://phiguard.app/failed'), {
      ASSETS: { fetch: assetFetch },
    })

    expect(response.status).toBe(503)
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error))
  })

  it('redirects the unpublished draft notice page to the privacy page', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://phiguard.app/notice-of-privacy-practices'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/privacy')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects the trailing-slash draft notice page to the privacy page', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://phiguard.app/notice-of-privacy-practices/'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/privacy')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('uses permanent preserve-method redirects for non-GET draft notice requests', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://phiguard.app/notice-of-privacy-practices', {
        method: 'POST',
      }),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/privacy')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects www requests to the canonical host', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://www.phiguard.app/pricing?utm_source=test'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/pricing?utm_source=test')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects http requests to https', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(new Request('http://phiguard.app/learn'), {
      ASSETS: { fetch: assetFetch },
    })

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/learn')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects http www requests directly to the canonical origin', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(new Request('http://www.phiguard.app/resources/'), {
      ASSETS: { fetch: assetFetch },
    })

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/resources')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects https www trailing-slash requests directly to the canonical URL', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://www.phiguard.app/learn/hipaa-basics/what-is-phi/?utm_source=test'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe(
      'https://phiguard.app/learn/hipaa-basics/what-is-phi?utm_source=test',
    )
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects canonical-host trailing-slash requests to the no-slash URL', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(new Request('https://phiguard.app/resources/tools/'), {
      ASSETS: { fetch: assetFetch },
    })

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/resources/tools')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('does not strip the root slash', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn().mockResolvedValue(new Response('home'))

    const response = await worker.fetch(new Request('https://phiguard.app/'), {
      ASSETS: { fetch: assetFetch },
    })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('home')
    expect(assetFetch).toHaveBeenCalledOnce()
  })

  it('normalizes unsubscribe asset responses to one no-referrer policy', async () => {
    const worker = await importWorker()
    const assetFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('unsubscribe', {
          headers: {
            'Referrer-Policy': 'strict-origin-when-cross-origin, no-referrer',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response('unsubscribe nested', {
          headers: {
            'Referrer-Policy': 'strict-origin-when-cross-origin, no-referrer',
          },
        }),
      )

    const response = await worker.fetch(
      new Request('https://phiguard.app/unsubscribe?token=test-token'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('unsubscribe')
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')

    const nestedResponse = await worker.fetch(
      new Request('https://phiguard.app/unsubscribe/index.html?token=test-token'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(nestedResponse.status).toBe(200)
    expect(await nestedResponse.text()).toBe('unsubscribe nested')
    expect(nestedResponse.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(assetFetch).toHaveBeenCalledTimes(2)
  })

  it('returns sentry config JSON for GET /sentry-config.json', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/sentry-config.json'),
      {
        ASSETS: { fetch: vi.fn() },
        PUBLIC_SENTRY_MARKETING_DSN: 'https://sentry.dsn/123',
        PUBLIC_APP_ENV: 'production',
      },
    )

    expect(response.status).toBe(200)
    const body = await response.json() as { dsn: string; environment: string }
    expect(body.dsn).toBe('https://sentry.dsn/123')
    expect(body.environment).toBe('production')
  })

  it('returns 405 for non-GET /sentry-config.json', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/sentry-config.json', { method: 'POST' }),
      {
        ASSETS: { fetch: vi.fn() },
      },
    )

    expect(response.status).toBe(405)
  })

  it('uses permanent preserve-method redirects for non-GET canonicalization requests', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('http://www.phiguard.app/resources/tools/', { method: 'POST' }),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/resources/tools')
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects trailing-slash legacy paths directly to their canonical destination', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://phiguard.app/resources/guides/what-is-phi/'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe(
      'https://phiguard.app/learn/hipaa-basics/what-is-phi',
    )
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects http www legacy paths directly to their canonical destination', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('http://www.phiguard.app/resources/guides/what-is-phi/?utm_source=test'),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe(
      'https://phiguard.app/learn/hipaa-basics/what-is-phi?utm_source=test',
    )
    expect(assetFetch).not.toHaveBeenCalled()
  })

  it('redirects HEAD draft notice requests without changing method semantics', async () => {
    const worker = await importWorker()
    const assetFetch = vi.fn()

    const response = await worker.fetch(
      new Request('https://phiguard.app/notice-of-privacy-practices/', { method: 'HEAD' }),
      {
        ASSETS: { fetch: assetFetch },
      },
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('Location')).toBe('https://phiguard.app/privacy')
    expect(assetFetch).not.toHaveBeenCalled()
  })
})

describe('marketing worker ai-sdr bff', () => {
  const AI_SDR_WORKER_URL = 'https://ai-sdr-worker.example.workers.dev'
  const AI_SDR_CLIENT_ASSERTION_SECRET = 'test-bff-assertion-secret'
  const ALLOWED_ORIGIN = 'https://phiguard.app'
  const SESSION_BODY = { productId: 'phiguard', metadata: { surface: 'marketing-site' } }

  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('proxies POST /v1/sessions with correct upstream URL, headers, and valid signature', async () => {
    const worker = await importWorker()
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sessionId: 'sid123' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()

    const [upstreamUrl, upstreamInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(upstreamUrl).toBe(`${AI_SDR_WORKER_URL}/v1/sessions`)

    const upstreamHeaders = upstreamInit.headers as Record<string, string>
    expect(upstreamHeaders['Origin']).toBe(ALLOWED_ORIGIN)

    const ts = upstreamHeaders['X-Ventora-Timestamp']
    const nonce = upstreamHeaders['X-Ventora-Nonce']
    const sig = upstreamHeaders['X-Ventora-Signature']

    expect(sig).toMatch(/^[0-9a-f]{64}$/)

    // Recompute the expected signature
    const bodyHash = await sha256Hex(stableJson(SESSION_BODY))
    const expectedPayload = `${ts}.${nonce}.POST./v1/sessions.${bodyHash}`
    const expectedSig = await hmacHex(expectedPayload, AI_SDR_CLIENT_ASSERTION_SECRET)
    expect(sig).toBe(expectedSig)
  })

  it('signs the body with UTF-16 code-unit key ordering, matching the upstream verifier', async () => {
    // Independent reference: canonical JSON using the native Object.keys().sort()
    // ordering that the upstream worker uses (NOT locale-aware). Keys are chosen so
    // code-unit order ('Surface' < 'surface', 'a-b' < 'aB') differs from localeCompare.
    const canonicalCodeUnit = (value: unknown): string => {
      if (Array.isArray(value)) return `[${value.map(canonicalCodeUnit).join(',')}]`
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>
        return `{${Object.keys(record)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${canonicalCodeUnit(record[key])}`)
          .join(',')}}`
      }
      return JSON.stringify(value)
    }
    const localeOrdered = (value: unknown): string => {
      if (Array.isArray(value)) return `[${value.map(localeOrdered).join(',')}]`
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>
        return `{${Object.keys(record)
          .sort((left, right) => left.localeCompare(right))
          .map((key) => `${JSON.stringify(key)}:${localeOrdered(record[key])}`)
          .join(',')}}`
      }
      return JSON.stringify(value)
    }
    const body = { metadata: { Surface: 'a', surface: 'b', 'a-b': 'c', aB: 'd' }, productId: 'phiguard' }
    // Guard: the chosen keys actually distinguish the two orderings, so this test
    // would fail if the BFF ever reverted to locale-aware sorting.
    expect(canonicalCodeUnit(body)).not.toBe(localeOrdered(body))

    const worker = await importWorker()
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sessionId: 'sid' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify(body),
      }),
      { ASSETS: { fetch: vi.fn() }, AI_SDR_WORKER_URL, AI_SDR_CLIENT_ASSERTION_SECRET },
    )

    const upstreamHeaders = (fetchMock.mock.calls[0] as [string, RequestInit])[1]
      .headers as Record<string, string>
    const ts = upstreamHeaders['X-Ventora-Timestamp']
    const nonce = upstreamHeaders['X-Ventora-Nonce']
    const expectedSig = await hmacHex(
      `${ts}.${nonce}.POST./v1/sessions.${await sha256Hex(canonicalCodeUnit(body))}`,
      AI_SDR_CLIENT_ASSERTION_SECRET,
    )
    expect(upstreamHeaders['X-Ventora-Signature']).toBe(expectedSig)
  })

  it('streams SSE response for the chat path with correct headers', async () => {
    const worker = await importWorker()
    const sseBody = 'data: {"delta":"hello"}\n\n'
    fetchMock.mockResolvedValue(new Response(sseBody, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    }))

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN, 'Accept': 'text/event-stream' },
        body: JSON.stringify({ sessionId: 'sid123', message: 'hello' }),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.text()).toBe(sseBody)
  })

  it('returns 405 for non-POST requests', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'GET',
        headers: { 'Origin': ALLOWED_ORIGIN },
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(405)
    const body = await response.json() as { error: string }
    expect(body.error).toBe('method_not_allowed')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 403 for disallowed origin', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'https://evil.example.com' },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 403 for missing origin header', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 503 when AI_SDR_WORKER_URL is missing', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 503 when AI_SDR_CLIENT_ASSERTION_SECRET is missing', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
      },
    )

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 400 for non-JSON body', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'Origin': ALLOWED_ORIGIN },
        body: 'not json',
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 400 for JSON array body (non-object)', async () => {
    const worker = await importWorker()

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify([1, 2, 3]),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 502 when upstream fetch throws a network error', async () => {
    const worker = await importWorker()
    fetchMock.mockRejectedValue(new TypeError('network error'))

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(502)
    const body = await response.json() as { error: string }
    expect(body.error).toBe('AI assistant upstream failed')
  })

  it('forwards POST /v1/handoff to the handoff upstream path', async () => {
    const worker = await importWorker()
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ sessionId: 'sid123' }),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    const [upstreamUrl] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(upstreamUrl).toBe(`${AI_SDR_WORKER_URL}/v1/handoff`)
  })

  it('accepts requests from the www phiguard origin', async () => {
    const worker = await importWorker()
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sessionId: 'sid-www' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    const response = await worker.fetch(
      new Request('https://phiguard.app/api/ai-sdr/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'https://www.phiguard.app' },
        body: JSON.stringify(SESSION_BODY),
      }),
      {
        ASSETS: { fetch: vi.fn() },
        AI_SDR_WORKER_URL,
        AI_SDR_CLIENT_ASSERTION_SECRET,
      },
    )

    expect(response.status).toBe(200)
    const [, upstreamInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const upstreamHeaders = upstreamInit.headers as Record<string, string>
    expect(upstreamHeaders['Origin']).toBe('https://www.phiguard.app')
  })
})

describe('marketing deploy configuration', () => {
  const appRoot = path.resolve(__dirname, '..')

  it('publishes a production CSP that allows the app origin for requests and forms', () => {
    const headers = fs.readFileSync(path.join(appRoot, 'public', '_headers'), 'utf8')
    const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? ''

    expect(csp).toMatch(/connect-src [^;]*https:\/\/my\.phiguard\.app/)
    expect(csp).toContain("form-action 'self' https://my.phiguard.app")
  })

  it('deploy build injects required public vars from wrangler config', () => {
    const wrangler = fs.readFileSync(path.join(appRoot, 'wrangler.jsonc'), 'utf8')
    const buildScript = fs.readFileSync(path.join(appRoot, 'scripts', 'build-for-deploy.mjs'), 'utf8')

    expect(wrangler).toMatch(/"PUBLIC_POSTHOG_KEY"\s*:/)
    expect(wrangler).toMatch(/"PUBLIC_APP_URL"\s*:\s*"https:\/\/my\.phiguard\.app"/)
    expect(buildScript).toContain("'PUBLIC_POSTHOG_KEY'")
    expect(buildScript).toContain("'PUBLIC_APP_URL'")
    expect(wrangler).toMatch(/"PUBLIC_CAPTCHA_SITE_KEY"\s*:/)
    expect(buildScript).toContain("'PUBLIC_CAPTCHA_SITE_KEY'")
    expect(buildScript).toContain('wrangler.jsonc vars')
  })
})
