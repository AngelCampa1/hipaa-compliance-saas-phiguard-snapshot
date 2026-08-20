import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../stripe.js', () => ({
  getStripe: vi.fn(),
}))

import { getStripe } from '../stripe.js'
import { resolvePromotionPhaseState, clearPromotionPhaseCache } from '../promotion-phase.js'

const mockRetrieveCoupon = vi.fn()

const mockStripe = {
  coupons: {
    retrieve: mockRetrieveCoupon,
  },
}

function makeCoupon(timesRedeemed: number) {
  return { times_redeemed: timesRedeemed }
}

beforeEach(() => {
  vi.clearAllMocks()
  clearPromotionPhaseCache()
  vi.mocked(getStripe).mockReturnValue(mockStripe as never)
  process.env.STRIPE_M80OFF_COUPON_ID = 'coupon_m80off'
  process.env.STRIPE_Y80OFF_COUPON_ID = 'coupon_y80off'
})

describe('resolvePromotionPhaseState', () => {
  it('reports both limited offer coupons with capacity', async () => {
    mockRetrieveCoupon.mockImplementation((id: string) => {
      if (id === 'coupon_m80off') return Promise.resolve(makeCoupon(50))
      if (id === 'coupon_y80off') return Promise.resolve(makeCoupon(120))
      return Promise.resolve(makeCoupon(0))
    })

    const state = await resolvePromotionPhaseState()

    expect(state.active?.id).toBe('M80OFF')
    expect(state.degraded).toBe(false)
    expect(state.phases).toEqual([
      expect.objectContaining({ id: 'M80OFF', percentOff: 80, redeemed: 50, cap: 100, status: 'active' }),
      expect.objectContaining({ id: 'Y80OFF', percentOff: 80, redeemed: 120, cap: 200, status: 'active' }),
    ])
    expect(state.totalRedeemed).toBe(170)
    expect(state.totalCap).toBe(300)
  })

  it('marks an exhausted limited offer coupon completed without advancing to another cadence', async () => {
    mockRetrieveCoupon.mockImplementation((id: string) => {
      if (id === 'coupon_m80off') return Promise.resolve(makeCoupon(100))
      if (id === 'coupon_y80off') return Promise.resolve(makeCoupon(25))
      return Promise.resolve(makeCoupon(0))
    })

    const state = await resolvePromotionPhaseState()

    expect(state.degraded).toBe(false)
    expect(state.phases).toEqual([
      expect.objectContaining({ id: 'M80OFF', redeemed: 100, cap: 100, status: 'completed' }),
      expect.objectContaining({ id: 'Y80OFF', redeemed: 25, cap: 200, status: 'active' }),
    ])
  })

  it('caps redeemed counts at configured phase limits for public progress', async () => {
    mockRetrieveCoupon.mockImplementation((id: string) => {
      if (id === 'coupon_m80off') return Promise.resolve(makeCoupon(130))
      if (id === 'coupon_y80off') return Promise.resolve(makeCoupon(275))
      return Promise.resolve(makeCoupon(0))
    })

    const state = await resolvePromotionPhaseState()

    expect(state.active).toBeNull()
    expect(state.degraded).toBe(true)
    expect(state.phases).toEqual([
      expect.objectContaining({ id: 'M80OFF', redeemed: 100, cap: 100, status: 'completed' }),
      expect.objectContaining({ id: 'Y80OFF', redeemed: 200, cap: 200, status: 'completed' }),
    ])
    expect(state.totalRedeemed).toBe(300)
    expect(state.totalCap).toBe(300)
  })

  it('throws with the env key name when a coupon env var is missing', async () => {
    delete process.env.STRIPE_Y80OFF_COUPON_ID

    await expect(resolvePromotionPhaseState()).rejects.toThrow('STRIPE_Y80OFF_COUPON_ID')
  })
})
