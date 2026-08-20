import { createFileRoute } from '@tanstack/react-router'
import { Webhook } from 'svix'
import { and, eq } from 'drizzle-orm'
import { getMarketingDb, emailSubscriptions } from '@phiguard/marketing-db/server'
import { logger } from '@phiguard/audit'
import { createRateLimitMiddleware } from '../../../middleware/rate-limit.js'
import { captureServerException } from '../../../lib/sentry.js'
import { unsubscribeSequencerContact } from '../../../server/sequencer.js'

interface ResendEventData {
  email_id: string
  to: unknown
  from?: string
}

interface ResendEvent {
  type: string
  data: ResendEventData
}

function normalizeRecipientEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readRecipientEmail(data: ResendEventData | undefined): string {
  const firstRecipient = Array.isArray(data?.to) ? data.to[0] : undefined
  return typeof firstRecipient === 'string' ? normalizeRecipientEmail(firstRecipient) : ''
}

function logResendProcessingError(err: unknown, eventType: string, sink: string) {
  captureServerException(err, {
    surface: 'api',
    route: '/api/marketing/resend-webhook',
    operation: 'resend.webhook.process',
    tags: { eventType, sink },
  })
  logger.safe.error(
    {
      errMessage: err instanceof Error ? err.message : String(err),
      eventType,
      sink,
    },
    'resend-webhook: error processing event',
  )
}

const webhookRateLimit = createRateLimitMiddleware({
  keyPrefix: 'resend-webhook',
  maxTokens: 120,
  refillRate: 120,
  windowMs: 60_000,
})

const MAX_RESEND_WEBHOOK_BODY_BYTES = 256 * 1024

async function readBoundedResendWebhookBody(request: Request) {
  const contentLength = request.headers.get('content-length')
  const parsedContentLength = contentLength ? Number(contentLength) : null
  if (
    parsedContentLength !== null &&
    Number.isFinite(parsedContentLength) &&
    parsedContentLength > MAX_RESEND_WEBHOOK_BODY_BYTES
  ) {
    return null
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_RESEND_WEBHOOK_BODY_BYTES) {
    return null
  }

  return new TextDecoder().decode(body)
}

export async function handleResendWebhook(request: Request): Promise<Response> {
  const limited = await webhookRateLimit(request)
  if (limited) return limited

  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    captureServerException(new Error('RESEND_WEBHOOK_SECRET is not configured'), {
      surface: 'api',
      route: '/api/marketing/resend-webhook',
      operation: 'resend.webhook.configure',
      status: 503,
    })
    logger.safe.error({}, 'resend-webhook: RESEND_WEBHOOK_SECRET not configured')
    return new Response(JSON.stringify({ error: 'webhook_not_configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await readBoundedResendWebhookBody(request)
  if (rawBody === null) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const svixId = request.headers.get('svix-id') ?? ''
  const svixTimestamp = request.headers.get('svix-timestamp') ?? ''
  const svixSignature = request.headers.get('svix-signature') ?? ''

  let event: ResendEvent

  try {
    const wh = new Webhook(secret)
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ResendEvent
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { type, data } = event
  const recipientEmail = readRecipientEmail(data)

  if (!recipientEmail) {
    return new Response(JSON.stringify({ received: true, skipped: 'missing_recipient' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (type === 'email.bounced' || type === 'email.complained') {
    let shouldForwardSuppression = false
    let localSuppressionFailed = false

    try {
      const db = getMarketingDb()
      const updated = await db
        .update(emailSubscriptions)
        .set({ subscribed: false, unsubscribedAt: new Date().toISOString() })
        .where(and(eq(emailSubscriptions.email, recipientEmail), eq(emailSubscriptions.subscribed, true)))
        .returning({ id: emailSubscriptions.id })
      shouldForwardSuppression = updated.length > 0
    } catch (err) {
      localSuppressionFailed = true
      logResendProcessingError(err, type, 'marketing-db')
    }

    if (localSuppressionFailed) {
      return new Response(JSON.stringify({ error: 'processing_failed' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (shouldForwardSuppression) {
      try {
        await unsubscribeSequencerContact(recipientEmail, {
          source: 'resend-webhook',
          eventType: type,
        })
      } catch (err) {
        logResendProcessingError(err, type, 'sequencer')
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const Route = createFileRoute('/api/marketing/resend-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => handleResendWebhook(request),
    },
  },
})
