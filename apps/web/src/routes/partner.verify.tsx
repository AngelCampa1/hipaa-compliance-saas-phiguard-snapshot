import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { capturePublicProductAnalyticsEvent } from '../lib/product-analytics'
import { verifyPartnerMagicLinkFn } from '../server/partners'

const searchSchema = z.object({
  token: z.string(),
})

function generatePublicAnalyticsDistinctId() {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return `public_${uuid.replace(/-/g, '')}`
  return `public_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

async function capturePartnerVerifyEvent(input: {
  eventName: 'partner_magic_link_verified' | 'partner_magic_link_verify_failed'
  destinationRoute: '/partner/dashboard' | '/partner/login'
  status: 'succeeded' | 'failed'
  reason?: 'invalid_link'
}) {
  if (process.env.PRODUCT_ANALYTICS_ENABLED !== 'true') return

  await capturePublicProductAnalyticsEvent({
    apiKey: process.env.VITE_POSTHOG_KEY,
    eventName: input.eventName,
    distinctId: generatePublicAnalyticsDistinctId(),
    properties: {
      route: '/partner/verify',
      destination_route: input.destinationRoute,
      category: 'partner_login',
      action: 'magic_link',
      status: input.status,
      reason: input.reason,
    },
  })
}

export async function handlePartnerVerify(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token') ?? ''

  try {
    const result = await verifyPartnerMagicLinkFn({ data: { token } })
    const headers = new Headers()
    headers.set('Set-Cookie', result.sessionCookie)
    headers.set('Location', '/partner/dashboard')
    await capturePartnerVerifyEvent({
      eventName: 'partner_magic_link_verified',
      destinationRoute: '/partner/dashboard',
      status: 'succeeded',
    })
    return new Response(null, { status: 302, headers })
  } catch {
    const headers = new Headers()
    headers.set('Location', '/partner/login?error=invalid-link')
    await capturePartnerVerifyEvent({
      eventName: 'partner_magic_link_verify_failed',
      destinationRoute: '/partner/login',
      status: 'failed',
      reason: 'invalid_link',
    })
    return new Response(null, { status: 302, headers })
  }
}

export const Route = createFileRoute('/partner/verify')({
  validateSearch: searchSchema,
  server: {
    handlers: {
      GET: ({ request }) => handlePartnerVerify(request),
    },
  },
  component: () => null,
})
