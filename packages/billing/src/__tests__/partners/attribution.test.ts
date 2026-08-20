import { describe, it, expect } from 'vitest'
import { computePayouts, MIN_PARTNER_PAYOUT_CENTS } from '../../partners/attribution.js'

describe('computePayouts', () => {
  it('computes payout per partner based on commission pct', () => {
    const referrals = [
      { partnerId: 'P1', commissionPct: 20, newRevenueCents: 9900 },
      { partnerId: 'P1', commissionPct: 20, newRevenueCents: 24900 },
      { partnerId: 'P2', commissionPct: 15, newRevenueCents: 49900 },
    ]
    const result = computePayouts(referrals)
    expect(result).toHaveLength(2)
    const p1 = result.find((p) => p.partnerId === 'P1')!
    expect(p1.amountCents).toBe(Math.floor((9900 + 24900) * 0.2))
    const p2 = result.find((p) => p.partnerId === 'P2')!
    expect(p2.amountCents).toBe(Math.floor(49900 * 0.15))
  })
  it('returns empty for no referrals', () => {
    expect(computePayouts([])).toEqual([])
  })

  it('withholds payout summaries below the partner payout minimum', () => {
    expect(
      computePayouts([{ partnerId: 'P1', commissionPct: 20, newRevenueCents: 24_900 }]),
    ).toEqual([])
  })

  it('includes payout summaries at the partner payout minimum', () => {
    expect(
      computePayouts([{ partnerId: 'P1', commissionPct: 20, newRevenueCents: 25_000 }]),
    ).toEqual([{ partnerId: 'P1', amountCents: MIN_PARTNER_PAYOUT_CENTS }])
  })
})
