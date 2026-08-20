import { createFileRoute } from '@tanstack/react-router'
import { handleStripeWebhook } from '@phiguard/billing'
import { getDb } from '@phiguard/db/server'
import { logger } from '@phiguard/audit'
import { captureServerException } from '../../../lib/sentry.js'

const MAX_STRIPE_WEBHOOK_BODY_BYTES = 1024 * 1024

async function readBoundedStripeWebhookBody(request: Request) {
  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_STRIPE_WEBHOOK_BODY_BYTES) {
    return null
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_STRIPE_WEBHOOK_BODY_BYTES) {
    return null
  }

  return new TextDecoder().decode(body)
}

export async function handleStripeWebhookRequest(request: Request) {
  const signature = request.headers.get('stripe-signature') ?? ''
  const body = await readBoundedStripeWebhookBody(request)

  if (body === null) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const db = getDb()
    await handleStripeWebhook(body, signature, db)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    // Signature failure: the secret is wrong or the payload was tampered.
    // Stripe must not retry - return 400 so it treats this as a permanent failure.
    if (message === 'Invalid Stripe signature') {
      return new Response(JSON.stringify({ error: 'invalid_signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // All other failures (DB errors, downstream service failures, unhandled
    // exceptions inside the event handler) are transient from Stripe's
    // perspective. Return 500 so Stripe retries with exponential backoff.
    captureServerException(error, {
      surface: 'api',
      route: '/api/webhooks/stripe',
      operation: 'stripe.webhook.process',
    })
    logger.safe.error({ err: error }, 'stripe webhook handler error - will retry')

    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => handleStripeWebhookRequest(request),
    },
  },
})
