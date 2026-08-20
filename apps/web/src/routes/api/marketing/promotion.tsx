import { createFileRoute } from '@tanstack/react-router'
import { LIMITED_OFFER_PROMOTIONS, PUBLIC_LIMITED_OFFER } from '@phiguard/billing/plans'
import { resolvePromotionPhaseState } from '@phiguard/billing/promotion-phase'
import { captureServerException } from '../../../lib/sentry.js'

type PublicPhaseInfo = {
  id: string
  percentOff: number
  redeemed: number
  cap: number
  status: 'active' | 'completed' | 'upcoming'
}

type PublicPromotionResponse = {
  activePhase: string | null
  activePercentOff: number | null
  activeOffers: string[]
  phases: PublicPhaseInfo[]
  totalRedeemed: number
  totalCap: number
  degraded: boolean
}

function buildPublicOfferPhase(input: {
  phases: Array<{ percentOff: number; redeemed: number; cap: number; status: 'active' | 'completed' | 'upcoming' }>
}): PublicPhaseInfo {
  const totalRedeemed = input.phases.reduce((sum, phase) => sum + phase.redeemed, 0)
  const totalCap = input.phases.reduce((sum, phase) => sum + phase.cap, 0)
  const hasActiveCapacity = input.phases.some((phase) => phase.status === 'active')
  const hasUpcomingCapacity = input.phases.some((phase) => phase.status === 'upcoming')
  const status = hasActiveCapacity
    ? 'active'
    : hasUpcomingCapacity
      ? 'upcoming'
      : 'completed'

  return {
    id: PUBLIC_LIMITED_OFFER.id,
    percentOff: input.phases[0]?.percentOff ?? PUBLIC_LIMITED_OFFER.percentOff,
    redeemed: totalRedeemed,
    cap: totalCap,
    status,
  }
}

async function getPromotionResponse(): Promise<Response> {
  let body: PublicPromotionResponse

  try {
    const state = await resolvePromotionPhaseState()
    const publicOffer = buildPublicOfferPhase({ phases: state.phases })
    const isActive = publicOffer.status === 'active'

    body = {
      activePhase: isActive ? PUBLIC_LIMITED_OFFER.id : null,
      activePercentOff: isActive ? publicOffer.percentOff : null,
      activeOffers: isActive ? [PUBLIC_LIMITED_OFFER.id] : [],
      phases: [publicOffer],
      totalRedeemed: state.totalRedeemed,
      totalCap: state.totalCap,
      degraded: state.degraded,
    }
  } catch (error) {
    captureServerException(error, {
      surface: 'api',
      route: '/api/marketing/promotion',
      operation: 'promotion.resolve',
      status: 500,
      tags: { method: 'GET' },
    })
    body = {
      activePhase: null,
      activePercentOff: null,
      activeOffers: [],
      phases: [buildPublicOfferPhase({
        phases: LIMITED_OFFER_PROMOTIONS.map((p) => ({
          percentOff: p.percentOff,
          redeemed: 0,
          cap: p.redemptionCap,
          status: 'upcoming' as const,
        })),
      })],
      totalRedeemed: 0,
      totalCap: LIMITED_OFFER_PROMOTIONS.reduce((sum, p) => sum + p.redemptionCap, 0),
      degraded: true,
    }
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Vary': 'Accept',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export const Route = createFileRoute('/api/marketing/promotion')({
  server: {
    handlers: {
      GET: async () => {
        return getPromotionResponse()
      },
    },
  },
})
