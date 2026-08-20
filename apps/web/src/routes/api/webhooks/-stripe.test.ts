import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleStripeWebhookRequest } from './stripe.js'

const { captureServerExceptionMock } = vi.hoisted(() => ({
  captureServerExceptionMock: vi.fn(),
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: vi.fn(),
}))

vi.mock('@phiguard/billing', () => ({
  handleStripeWebhook: vi.fn(),
}))

vi.mock('../../../lib/sentry.js', () => ({
  captureServerException: captureServerExceptionMock,
}))

vi.mock('@phiguard/audit', () => ({
  logger: {
    safe: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    },
  },
}))

import { handleStripeWebhook } from '@phiguard/billing'
import { getDb } from '@phiguard/db/server'
import { logger } from '@phiguard/audit'

describe('handleStripeWebhookRequest', () => {
  const db = { tag: 'db' }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDb).mockReturnValue(db as never)
  })

  it('forwards the raw body and stripe signature to the billing webhook handler', async () => {
    const body = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' })
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=test-signature',
      },
      body,
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(handleStripeWebhook).toHaveBeenCalledWith(body, 't=123,v1=test-signature', db)
  })

  it('uses an empty string when the stripe signature header is missing', async () => {
    const body = JSON.stringify({ id: 'evt_123', type: 'invoice.payment_failed' })
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      body,
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(200)
    expect(handleStripeWebhook).toHaveBeenCalledWith(body, '', db)
  })

  // Status code matrix: signature failure → 400 (Stripe must not retry)
  it('returns 400 for signature verification failures without capturing to Sentry', async () => {
    vi.mocked(handleStripeWebhook).mockRejectedValueOnce(new Error('Invalid Stripe signature'))
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'bad-signature',
      },
      body: JSON.stringify({ id: 'evt_bad' }),
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'invalid_signature' })
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })

  it('rejects oversized webhook bodies before DB or handler access', async () => {
    const oversizedBody = 'x'.repeat(1024 * 1024 + 1)
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=test-signature',
      },
      body: oversizedBody,
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({ error: 'payload_too_large' })
    expect(getDb).not.toHaveBeenCalled()
    expect(handleStripeWebhook).not.toHaveBeenCalled()
  })

  it('rejects oversized webhook bodies from content-length before reading the body', async () => {
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=test-signature',
        'content-length': `${1024 * 1024 + 1}`,
      },
      body: 'small',
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({ error: 'payload_too_large' })
    expect(getDb).not.toHaveBeenCalled()
    expect(handleStripeWebhook).not.toHaveBeenCalled()
  })

  // Status code matrix: DB / transient error → 500 (Stripe retries with exponential backoff)
  it('returns 500 and captures to Sentry for DB errors so Stripe retries', async () => {
    const processingError = new Error('database unavailable')
    vi.mocked(handleStripeWebhook).mockRejectedValueOnce(processingError)
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=test-signature',
      },
      body: JSON.stringify({ id: 'evt_processing' }),
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'internal_error' })
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      processingError,
      expect.objectContaining({
        surface: 'api',
        route: '/api/webhooks/stripe',
        operation: 'stripe.webhook.process',
      }),
    )
    expect(logger.safe.error).toHaveBeenCalled()
  })

  // Status code matrix: unknown event type → 200 (acknowledge, no-op; Stripe need not retry)
  it('returns 200 for unknown event types so Stripe does not retry them', async () => {
    // handleStripeWebhook resolves normally for unrecognised events (switch has no default throw)
    vi.mocked(handleStripeWebhook).mockResolvedValueOnce(undefined)
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=test-signature',
      },
      body: JSON.stringify({ id: 'evt_unknown', type: 'payment_intent.processing' }),
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })

  // Status code matrix: idempotency replay → 200 (already processed; Stripe need not retry)
  it('returns 200 for idempotency replays (event already processed by billing handler)', async () => {
    // handleStripeWebhook handles the 23505 unique-violation internally and returns undefined
    vi.mocked(handleStripeWebhook).mockResolvedValueOnce(undefined)
    const request = new Request('https://app.phiguard.test/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=replay-signature',
      },
      body: JSON.stringify({ id: 'evt_already_seen', type: 'invoice.paid' }),
    })

    const response = await handleStripeWebhookRequest(request)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ received: true })
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })
})
