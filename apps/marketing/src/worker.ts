import * as Sentry from '@sentry/cloudflare'
import {
  PHIGUARD_APP_ORIGIN,
  PHIGUARD_MARKETING_HOST,
  PHIGUARD_MARKETING_WWW_HOST,
  PHIGUARD_PUBLIC_SITE_ORIGIN,
  PHIGUARD_PUBLIC_SITE_WWW_ORIGIN,
} from '@phiguard/brand/identity'
import { SUPPORT_EMAIL } from '@phiguard/brand'
import { generateAiKnowledge } from '@phiguard/knowledge'
import { commercialKnowledgeCopy } from '@phiguard/knowledge/commercial'
import { limitedOfferCommercialCopy, marketingPlans } from '@phiguard/knowledge/marketing'
import { legacyRedirects } from './generated/legacy-redirects'

interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>
}

interface Env {
  ASSETS: Fetcher
  PUBLIC_SENTRY_MARKETING_DSN?: string
  PUBLIC_SENTRY_DSN?: string
  PUBLIC_APP_ENV?: string
  AI_SDR_CONTEXT_SECRET?: string
  AI_SDR_CLIENT_ASSERTION_SECRET?: string
  AI_SDR_WORKER_URL?: string
}

const AI_SDR_PRODUCT_ID = 'phiguard'
const AI_SDR_MAX_SKEW_MS = 5 * 60 * 1000
const AI_SDR_ALLOWED_ORIGINS: readonly string[] = [
  PHIGUARD_PUBLIC_SITE_ORIGIN,
  PHIGUARD_PUBLIC_SITE_WWW_ORIGIN,
] as const

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    // Sort by UTF-16 code units to match the upstream verifier's
    // Object.keys().sort() ordering exactly (NOT locale-aware ordering),
    // so the signed body hash agrees byte-for-byte for any key shape.
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
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
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let result = 0
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return result === 0
}

async function buildAiSdrPayload(input: {
  timestamp: string
  nonce: string
  method: string
  path: string
  body: Record<string, unknown>
}): Promise<string> {
  const bodyHash = await sha256Hex(stableJson(input.body))
  return `${input.timestamp}.${input.nonce}.${input.method.toUpperCase()}.${input.path}.${bodyHash}`
}

async function verifyAiSdrSignature(input: {
  payload: string
  signature: string
  secret: string
  timestamp: string
}): Promise<boolean> {
  if (!/^[0-9a-f]{64}$/.test(input.signature)) return false
  const parsedTimestamp = Date.parse(input.timestamp)
  if (!Number.isFinite(parsedTimestamp)) return false
  if (Math.abs(Date.now() - parsedTimestamp) > AI_SDR_MAX_SKEW_MS) return false
  return timingSafeEqual(await hmacHex(input.payload, input.secret), input.signature)
}

function buildAiSdrContext() {
  const items = generateAiKnowledge('marketing').items
  return {
    productId: AI_SDR_PRODUCT_ID,
    name: 'PHIGuard',
    description: 'HIPAA operations hub for small medical clinics and growing healthcare organizations.',
    sources: [
      ...items.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        url: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/`,
        excerpt: item.summary,
      })),
      {
        id: 'founder-contact',
        title: 'Founder contact',
        url: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/about`,
        excerpt: `Founder sales contact: ${SUPPORT_EMAIL}.`,
      },
    ],
    plans: marketingPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: `${plan.priceAnnualMonthly}/month equivalent, ${plan.priceAnnual}/year paid upfront annually`,
      monthlyPrice: `${plan.priceMonthly}/mo`,
      annualPrice: `${plan.priceAnnualMonthly}/month equivalent, ${plan.priceAnnual}/year paid upfront annually`,
      discount: limitedOfferCommercialCopy.promoBannerMessage,
      defaultCadence: 'year',
      trialDays: commercialKnowledgeCopy.trialDays,
      ctaUrl: `${PHIGUARD_APP_ORIGIN}/signup`,
      ctaUrls: {
        annual: `${PHIGUARD_APP_ORIGIN}/signup`,
        monthly: `${PHIGUARD_APP_ORIGIN}/signup`,
      },
      features: [
        commercialKnowledgeCopy.trialFeature,
        commercialKnowledgeCopy.baaIncluded,
        `${plan.maxMembers} members included`,
        ...plan.capabilities.slice(0, 2),
      ],
    })),
  }
}

async function handleAiSdrProductContext(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const productId = url.searchParams.get('productId') ?? url.searchParams.get('product_id')
  if (productId !== AI_SDR_PRODUCT_ID) return json({ error: 'Unknown product' }, 404)
  const secret = env.AI_SDR_CONTEXT_SECRET?.trim()
  if (!secret) return json({ error: 'Product context unavailable' }, 503)
  const timestamp = request.headers.get('X-Ventora-Timestamp')
  const nonce = request.headers.get('X-Ventora-Nonce')
  const signature = request.headers.get('X-Ventora-Signature')
  if (!timestamp || !nonce || !signature) return json({ error: 'Missing signature' }, 401)
  const path = `${url.pathname}${url.search}`
  const requestPayload = await buildAiSdrPayload({
    timestamp,
    nonce,
    method: 'GET',
    path,
    body: { productId },
  })
  const valid = await verifyAiSdrSignature({ payload: requestPayload, signature, secret, timestamp })
  if (!valid) return json({ error: 'Invalid signature' }, 401)
  const body = buildAiSdrContext()
  const responseTimestamp = new Date().toISOString()
  const responseNonce = crypto.randomUUID().replaceAll('-', '')
  const responsePayload = await buildAiSdrPayload({
    timestamp: responseTimestamp,
    nonce: responseNonce,
    method: 'GET',
    path,
    body,
  })
  const response = json(body)
  response.headers.set('Cache-Control', 'private, max-age=300')
  response.headers.set('X-Ventora-Timestamp', responseTimestamp)
  response.headers.set('X-Ventora-Nonce', responseNonce)
  response.headers.set('X-Ventora-Signature', await hmacHex(responsePayload, secret))
  return response
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function handleAiSdrProxy(
  request: Request,
  env: Env,
  workerPath: '/v1/sessions' | '/v1/chat' | '/v1/handoff',
): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const origin = request.headers.get('Origin') ?? ''
  if (!AI_SDR_ALLOWED_ORIGINS.includes(origin)) return json({ error: 'forbidden' }, 403)

  const baseUrl = env.AI_SDR_WORKER_URL?.trim()
  const secret = env.AI_SDR_CLIENT_ASSERTION_SECRET?.trim()
  if (!baseUrl || !baseUrl.startsWith('https://') || !secret) {
    return json({ error: 'AI assistant unavailable' }, 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }
  if (!isRecord(body)) return json({ error: 'invalid_body' }, 400)

  const timestamp = new Date().toISOString()
  const nonce = crypto.randomUUID().replaceAll('-', '')
  const payload = await buildAiSdrPayload({ timestamp, nonce, method: 'POST', path: workerPath, body })
  const signature = await hmacHex(payload, secret)

  const upstreamUrl = `${baseUrl.replace(/\/+$/, '')}${workerPath}`
  const acceptHeader = request.headers.get('Accept') ?? (workerPath === '/v1/chat' ? 'text/event-stream' : 'application/json')

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': origin,
        'Accept': acceptHeader,
        'X-Ventora-Timestamp': timestamp,
        'X-Ventora-Nonce': nonce,
        'X-Ventora-Signature': signature,
      },
      body: JSON.stringify(body),
    })
  } catch {
    return json({ error: 'AI assistant upstream failed' }, 502)
  }

  const responseHeaders = new Headers()
  responseHeaders.set('Cache-Control', 'no-store')
  const contentType = upstream.headers.get('Content-Type')
  if (contentType) responseHeaders.set('Content-Type', contentType)
  const retryAfter = upstream.headers.get('Retry-After')
  if (retryAfter) responseHeaders.set('Retry-After', retryAfter)

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}

function captureMarketingWorkerException(error: unknown, context: {
  route: string
  operation: string
  status?: number
}) {
  const trackingId = makeTrackingId()
  try {
    Sentry.withScope((scope) => {
      scope.setTag('surface', 'marketing-worker')
      scope.setTag('route', context.route)
      scope.setTag('operation', context.operation)
      scope.setTag('trackingId', trackingId)
      if (context.status) scope.setTag('status', String(context.status))
      Sentry.captureException(error)
    })
  } catch {
    // Observability should never affect the public site.
  }
  return trackingId
}

function formatTrackingId(value: string): string {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `err_${normalized.slice(0, 8) || 'unknown'}`
}

function makeTrackingId() {
  const value =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  return formatTrackingId(value)
}

function getReportableErrorMessage(trackingId: string) {
  return `Something went wrong. Please try again. If it keeps happening, contact support with error ID ${trackingId}.`
}

function permanentRedirectStatus(request: Request): 301 | 308 {
  return request.method === 'GET' || request.method === 'HEAD' ? 301 : 308
}

function canonicalizePublicUrl(url: URL): URL {
  const target = new URL(url)
  if (target.hostname === PHIGUARD_MARKETING_WWW_HOST) {
    target.hostname = PHIGUARD_MARKETING_HOST
  }
  if (target.protocol === 'http:') {
    target.protocol = 'https:'
  }
  if (target.pathname !== '/') {
    target.pathname = target.pathname.replace(/\/+$/, '')
  }
  return target
}

function canonicalOriginRedirect(request: Request, url: URL): Response | null {
  const target = canonicalizePublicUrl(url)
  if (target.href === url.href) {
    return null
  }

  return Response.redirect(target.href, permanentRedirectStatus(request))
}

function legacyPathRedirect(request: Request, url: URL): Response | null {
  const targetPath = legacyRedirects[url.pathname as keyof typeof legacyRedirects]
  if (!targetPath) {
    return null
  }

  const target = canonicalizePublicUrl(new URL(targetPath, url))
  if (!target.search) {
    target.search = url.search
  }
  return Response.redirect(target.href, permanentRedirectStatus(request))
}

function isUnsubscribePath(pathname: string): boolean {
  return pathname === '/unsubscribe' || pathname.startsWith('/unsubscribe/')
}

function hardenAssetResponse(response: Response, url: URL): Response {
  if (!isUnsubscribePath(url.pathname)) {
    return response
  }

  const hardened = new Response(response.body, response)
  hardened.headers.set('Referrer-Policy', 'no-referrer')
  return hardened
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (
      url.pathname === '/notice-of-privacy-practices' ||
      url.pathname === '/notice-of-privacy-practices/'
    ) {
      const target = canonicalizePublicUrl(new URL('/privacy', url))
      return Response.redirect(target.href, permanentRedirectStatus(request))
    }

    const legacyRedirect = legacyPathRedirect(request, url)
    if (legacyRedirect) return legacyRedirect

    const redirect = canonicalOriginRedirect(request, url)
    if (redirect) return redirect

    if (url.pathname === '/sentry-config.json') {
      if (request.method !== 'GET') {
        return json({ error: 'method_not_allowed' }, 405)
      }
      return json({
        dsn: env.PUBLIC_SENTRY_MARKETING_DSN ?? env.PUBLIC_SENTRY_DSN ?? null,
        environment: env.PUBLIC_APP_ENV ?? 'production',
      })
    }

    if (request.method === 'GET' && url.pathname === '/api/ai-sdr/product-context') {
      return handleAiSdrProductContext(request, env)
    }

    if (url.pathname === '/api/ai-sdr/v1/sessions') {
      return handleAiSdrProxy(request, env, '/v1/sessions')
    }

    if (url.pathname === '/api/ai-sdr/v1/chat') {
      return handleAiSdrProxy(request, env, '/v1/chat')
    }

    if (url.pathname === '/api/ai-sdr/v1/handoff') {
      return handleAiSdrProxy(request, env, '/v1/handoff')
    }

    try {
      const response = await env.ASSETS.fetch(request)
      if (response.status >= 500) {
        captureMarketingWorkerException(
          new Error(`Marketing asset fetch returned ${response.status}`),
          {
            route: url.pathname,
            operation: 'assets.fetch',
            status: response.status,
          },
        )
      }
      return hardenAssetResponse(response, url)
    } catch (error) {
      const trackingId = captureMarketingWorkerException(error, {
        route: url.pathname,
        operation: 'assets.fetch',
        status: 500,
      })
      return new Response(getReportableErrorMessage(trackingId), { status: 500 })
    }
  },
}

export default Sentry.withSentry((env: Env) => ({
  dsn: env.PUBLIC_SENTRY_MARKETING_DSN ?? env.PUBLIC_SENTRY_DSN,
  environment: env.PUBLIC_APP_ENV ?? 'production',
  sendDefaultPii: false,
  tracesSampleRate: env.PUBLIC_APP_ENV === 'production' ? 0.05 : 1.0,
  initialScope: {
    tags: {
      surface: 'marketing-worker',
    },
  },
}), handler)
