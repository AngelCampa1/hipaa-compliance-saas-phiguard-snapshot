import { createFileRoute } from '@tanstack/react-router'
import { logger } from '@phiguard/audit'
import { processUnsubscribe } from '../../../server/unsubscribe.js'
import { createRateLimitMiddleware } from '../../../middleware/rate-limit.js'
import { captureServerException } from '../../../lib/sentry.js'
import {
  buildMarketingCorsPreflight,
  getMarketingSiteBaseUrl,
  withMarketingCors,
} from '../../../lib/marketing-cors.js'

const unsubscribeRateLimit = createRateLimitMiddleware({
  keyPrefix: 'unsubscribe',
  maxTokens: 10,
  refillRate: 5,
  windowMs: 60_000,
})

const MAX_UNSUBSCRIBE_BODY_BYTES = 1_024

export function handleUnsubscribeOptions(request: Request): Response {
  return buildMarketingCorsPreflight(request)
}

async function readBoundedJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_UNSUBSCRIBE_BODY_BYTES) {
    return null
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_UNSUBSCRIBE_BODY_BYTES) {
    return null
  }

  return JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>
}

export async function handleUnsubscribe(request: Request): Promise<Response> {
  const siteBaseUrl = getMarketingSiteBaseUrl()
  const cors = (response: Response) => withMarketingCors(response, request, siteBaseUrl)
  const limited = await unsubscribeRateLimit(request)
  if (limited) return cors(limited)

  let token: string

  try {
    const body = await readBoundedJsonBody(request)
    if (!body) {
      return cors(
        new Response(JSON.stringify({ error: 'payload_too_large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }
    token = typeof body.token === 'string' ? body.token : ''
  } catch {
    return cors(
      new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  let result: Awaited<ReturnType<typeof processUnsubscribe>>
  try {
    result = await processUnsubscribe(token)
  } catch (err) {
    captureServerException(err, {
      surface: 'api',
      route: '/api/marketing/unsubscribe',
      operation: 'marketing.unsubscribe',
      status: 503,
    })
    logger.safe.error(
      { errMessage: err instanceof Error ? err.message : String(err) },
      'marketing unsubscribe failed',
    )
    return cors(
      new Response(JSON.stringify({ error: 'unsubscribe_failed' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  if (!result.success && !result.alreadyUnsubscribed) {
    return cors(
      new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  return cors(
    new Response(
      JSON.stringify({
        success: true,
        alreadyUnsubscribed: result.alreadyUnsubscribed,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  )
}

export const Route = createFileRoute('/api/marketing/unsubscribe')({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => handleUnsubscribeOptions(request),
      POST: async ({ request }) => handleUnsubscribe(request),
    },
  },
})
