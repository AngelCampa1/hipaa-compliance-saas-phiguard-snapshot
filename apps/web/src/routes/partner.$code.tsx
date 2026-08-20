import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { getDb, partners } from '@phiguard/db/server'
import { buildReferralCookieHeader } from '@phiguard/billing'
import { capturePublicProductAnalyticsEvent } from '../lib/product-analytics'

function generatePublicAnalyticsDistinctId() {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return `public_${uuid.replace(/-/g, '')}`
  return `public_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
}

export async function handlePartnerReferral(code: string): Promise<Response> {
  const headers = new Headers()
  headers.set('Location', '/signup')

  const db = getDb()
  const [partner] = await db
    .select({ referralCode: partners.referralCode })
    .from(partners)
    .where(and(eq(partners.referralCode, code), eq(partners.status, 'active')))
    .limit(1)

  if (partner) {
    headers.set('Set-Cookie', buildReferralCookieHeader(partner.referralCode))
  }

  if (process.env.PRODUCT_ANALYTICS_ENABLED === 'true') {
    await capturePublicProductAnalyticsEvent({
      apiKey: process.env.VITE_POSTHOG_KEY,
      eventName: 'partner_referral_opened',
      distinctId: generatePublicAnalyticsDistinctId(),
      properties: {
        route: `/partner/${code}`,
        destination_route: '/signup',
        category: 'referrals',
        action: 'referral_redirect',
        status: partner ? 'succeeded' : 'failed',
      },
    })
  }

  return new Response(null, { status: 302, headers })
}

export const Route = createFileRoute('/partner/$code')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        return handlePartnerReferral(params.code)
      },
    },
  },
  component: () => null,
})
