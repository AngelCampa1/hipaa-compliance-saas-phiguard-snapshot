import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PUBLIC_LIMITED_OFFER } from '@phiguard/billing/plans'

const { resolvePromotionPhaseStateMock, captureServerExceptionMock } = vi.hoisted(() => ({
  resolvePromotionPhaseStateMock: vi.fn(),
  captureServerExceptionMock: vi.fn(),
}))

vi.mock('@phiguard/billing/promotion-phase', () => ({
  resolvePromotionPhaseState: resolvePromotionPhaseStateMock,
}))

vi.mock('../../../lib/sentry.js', () => ({
  captureServerException: captureServerExceptionMock,
}))

type PromotionHandlers = {
  GET: () => Promise<Response>
}

async function getHandlers() {
  const { Route } = await import('./promotion.js')
  return Route.options.server?.handlers as unknown as PromotionHandlers
}

const KNOWN_STATE = {
  active: {
    id: 'M80OFF',
    percentOff: 80,
    appliesTo: 'first_year' as const,
    billingCadence: 'monthly' as const,
    autoApplyAtCheckout: true,
    stripeCouponEnvKey: 'STRIPE_M80OFF_COUPON_ID',
    redemptionCap: 100,
  },
  phases: [
    { id: 'M80OFF', percentOff: 80, redeemed: 42, cap: 100, status: 'active' as const },
    { id: 'Y80OFF', percentOff: 80, redeemed: 75, cap: 200, status: 'active' as const },
  ],
  totalRedeemed: 117,
  totalCap: 300,
  degraded: false,
}

describe('promotion API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('successful response', () => {
    it('returns 200 with correct JSON body shape', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue(KNOWN_STATE)

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.status).toBe(200)

      const body = await response.json() as Record<string, unknown>
      expect(body).toEqual({
        activePhase: PUBLIC_LIMITED_OFFER.id,
        activePercentOff: PUBLIC_LIMITED_OFFER.percentOff,
        activeOffers: [PUBLIC_LIMITED_OFFER.id],
        phases: [
          { id: PUBLIC_LIMITED_OFFER.id, percentOff: PUBLIC_LIMITED_OFFER.percentOff, redeemed: 117, cap: 300, status: 'active' },
        ],
        totalRedeemed: 117,
        totalCap: 300,
        degraded: false,
      })
    })

    it('does not expose stripeCouponEnvKey in the response', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue(KNOWN_STATE)

      const handlers = await getHandlers()
      const response = await handlers.GET()
      const body = await response.json() as Record<string, unknown>
      const json = JSON.stringify(body)

      expect(json).not.toContain('stripeCouponEnvKey')
      expect(json).not.toContain('STRIPE_M80OFF_COUPON_ID')
      expect(json).not.toContain('STRIPE_Y80OFF_COUPON_ID')
      expect(json).not.toContain('M80OFF')
      expect(json).not.toContain('Y80OFF')
    })

    it('sets Cache-Control header', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue(KNOWN_STATE)

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60, stale-while-revalidate=300')
    })

    it('sets Access-Control-Allow-Origin: * header', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue(KNOWN_STATE)

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('sets Content-Type: application/json header', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue(KNOWN_STATE)

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('sets Vary: Accept header', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue(KNOWN_STATE)

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.headers.get('Vary')).toBe('Accept')
    })

    it('returns null active fields when all limited offers are exhausted', async () => {
      resolvePromotionPhaseStateMock.mockResolvedValue({
        ...KNOWN_STATE,
        active: null,
        phases: KNOWN_STATE.phases.map((phase) => ({ ...phase, redeemed: phase.cap, status: 'completed' as const })),
        totalRedeemed: 300,
        degraded: true,
      })

      const handlers = await getHandlers()
      const response = await handlers.GET()
      const body = await response.json() as Record<string, unknown>

      expect(body).toMatchObject({
        activePhase: null,
        activePercentOff: null,
        activeOffers: [],
        phases: [
          { id: PUBLIC_LIMITED_OFFER.id, percentOff: PUBLIC_LIMITED_OFFER.percentOff, redeemed: 300, cap: 300, status: 'completed' },
        ],
        totalRedeemed: 300,
        degraded: true,
      })
    })
  })

  describe('fallback response when resolvePromotionPhaseState throws', () => {
    it('returns 200 with limited offer fallback and degraded: true', async () => {
      resolvePromotionPhaseStateMock.mockRejectedValue(new Error('Stripe unavailable'))

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.status).toBe(200)

      const body = await response.json() as Record<string, unknown>
      expect(body).toMatchObject({
        activePhase: null,
        activePercentOff: null,
        activeOffers: [],
        totalRedeemed: 0,
        degraded: true,
      })
    })

    it('fallback phases have totalCap matching sum of all redemptionCaps', async () => {
      resolvePromotionPhaseStateMock.mockRejectedValue(new Error('Stripe unavailable'))

      const handlers = await getHandlers()
      const response = await handlers.GET()
      const body = await response.json() as Record<string, unknown>

      expect(body.totalCap).toBe(300)
    })

    it('fallback offers do not claim active status without verified Stripe capacity', async () => {
      resolvePromotionPhaseStateMock.mockRejectedValue(new Error('Stripe unavailable'))

      const handlers = await getHandlers()
      const response = await handlers.GET()
      const body = await response.json() as { phases: Array<{ id: string; status: string }> }

      expect(body.phases).toEqual([
        { id: PUBLIC_LIMITED_OFFER.id, percentOff: PUBLIC_LIMITED_OFFER.percentOff, redeemed: 0, cap: 300, status: 'upcoming' },
      ])
      expect(body.phases.every((p) => p.status === 'upcoming')).toBe(true)
    })

    it('calls captureServerException with correct context', async () => {
      const error = new Error('Stripe unavailable')
      resolvePromotionPhaseStateMock.mockRejectedValue(error)

      const handlers = await getHandlers()
      await handlers.GET()

      expect(captureServerExceptionMock).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          surface: 'api',
          route: '/api/marketing/promotion',
          operation: 'promotion.resolve',
          status: 500,
        }),
      )
    })

    it('still sets Access-Control-Allow-Origin: * in fallback', async () => {
      resolvePromotionPhaseStateMock.mockRejectedValue(new Error('Stripe unavailable'))

      const handlers = await getHandlers()
      const response = await handlers.GET()

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })
})
