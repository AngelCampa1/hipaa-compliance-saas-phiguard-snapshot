import { describe, it, expect } from 'vitest'
import {
  BILLING_CADENCES,
  COMMERCIAL_COPY,
  DEFAULT_BILLING_CADENCE,
  PROMOTIONS,
  LIMITED_OFFER_PROMOTIONS,
  PLAN_TIER_ORDER,
  PUBLIC_PLAN_IDS,
  TRIAL_DAYS,
  getActivePromotion,
  isPlanAtLeast,
  getPlanPromotionPriceDisplay,
  getPromotionalMonthlyPrice,
  getPromotionalMonthlyPriceDisplay,
  getPromotionDisplayCopy,
  getMinimumPlanForFeatures,
  getStripePriceEnvKey,
  PLANS,
} from './plans.js'

describe('PLANS catalog', () => {
  it('has the plan shape with public names and Compliance Ops retained as custom', () => {
    expect(Object.keys(PLANS)).toEqual([
      'essentials',
      'clinic',
      'group',
      'compliance_ops',
    ])
    expect(PLANS.clinic).toMatchObject({
      id: 'clinic',
      name: 'Clinic',
    })
    expect(PLANS.compliance_ops).toMatchObject({
      id: 'compliance_ops',
      name: 'Compliance Ops',
    })
  })

  it('exports public plan ids and tier order from the billing catalog', () => {
    expect(PUBLIC_PLAN_IDS).toEqual(['essentials', 'clinic', 'group'])
    expect(PLAN_TIER_ORDER).toEqual(['essentials', 'clinic', 'group', 'compliance_ops'])
    expect(isPlanAtLeast('compliance_ops', 'group')).toBe(true)
    expect(isPlanAtLeast('clinic', 'group')).toBe(false)
  })

  it('has monthly pricing compatibility values for public plans', () => {
    expect(PLANS.essentials.priceMonthly).toBe(179)
    expect(PLANS.clinic.priceMonthly).toBe(229)
    expect(PLANS.group.priceMonthly).toBe(469)
    expect(PLANS.compliance_ops.priceMonthly).toBe(1679)
  })

  it('has monthly and annual price records for public plans', () => {
    expect(PLANS.essentials.prices).toEqual({
      monthly: { amount: 179, effectiveMonthlyAmount: 179 },
      annual: { amount: 1788, effectiveMonthlyAmount: 149 },
    })
    expect(PLANS.clinic.prices).toEqual({
      monthly: { amount: 229, effectiveMonthlyAmount: 229 },
      annual: { amount: 2268, effectiveMonthlyAmount: 189 },
    })
    expect(PLANS.group.prices).toEqual({
      monthly: { amount: 469, effectiveMonthlyAmount: 469 },
      annual: { amount: 4668, effectiveMonthlyAmount: 389 },
    })
    expect(PLANS.compliance_ops.prices).toEqual({
      monthly: { amount: 1679, effectiveMonthlyAmount: 1679 },
      annual: { amount: 16788, effectiveMonthlyAmount: 1399 },
    })
  })

  it('defaults billing cadence to annual while keeping monthly available', () => {
    expect(DEFAULT_BILLING_CADENCE).toBe('annual')
    expect(BILLING_CADENCES).toEqual(['monthly', 'annual'])
  })

  it('exposes the shared public trial length', () => {
    expect(TRIAL_DAYS).toBe(30)
  })

  it('uses cadence-specific Stripe price environment variable names', () => {
    expect(getStripePriceEnvKey('essentials', 'monthly')).toBe('STRIPE_PRICE_ESSENTIALS_MONTHLY')
    expect(getStripePriceEnvKey('essentials', 'annual')).toBe('STRIPE_PRICE_ESSENTIALS_ANNUAL')
    expect(getStripePriceEnvKey('clinic', 'monthly')).toBe('STRIPE_PRICE_CLINIC_MONTHLY')
    expect(getStripePriceEnvKey('clinic', 'annual')).toBe('STRIPE_PRICE_CLINIC_ANNUAL')
  })

  it('defines the limited offer promotions by billing cadence without a public expiry', () => {
    expect(PROMOTIONS.M80OFF).toMatchObject({
      id: 'M80OFF',
      name: '80% OFF - Monthly',
      code: 'M80OFF',
      percentOff: 80,
      appliesTo: 'first_year',
      billingCadence: 'monthly',
      autoApplyAtCheckout: true,
      stripeCouponEnvKey: 'STRIPE_M80OFF_COUPON_ID',
      redemptionCap: 100,
    })
    expect(PROMOTIONS.Y80OFF).toMatchObject({
      id: 'Y80OFF',
      name: '80% OFF - Yearly',
      code: 'Y80OFF',
      percentOff: 80,
      appliesTo: 'once',
      billingCadence: 'annual',
      autoApplyAtCheckout: true,
      stripeCouponEnvKey: 'STRIPE_Y80OFF_COUPON_ID',
      redemptionCap: 200,
    })
    expect(PROMOTIONS.M80OFF).not.toHaveProperty('expiresAt')
    expect(PROMOTIONS.Y80OFF).not.toHaveProperty('expiresAt')

    expect(getActivePromotion('monthly', new Date('2026-05-31T23:59:59.000Z'))?.id).toBe('M80OFF')
    expect(getActivePromotion('annual', new Date('2026-06-01T00:00:00.000Z'))?.id).toBe('Y80OFF')
  })

  it('exposes centralized limited offer copy for marketing and app surfaces', () => {
    expect(getPromotionDisplayCopy(PROMOTIONS.M80OFF)).toEqual({
      code: 'M80OFF',
      percentOffLabel: '80%',
      appliesToLabel: '12 months',
      badgeLabel: '80% off the first year',
      offerLabel: 'Limited time offer',
      autoApplyLabel: 'Auto-applied at checkout',
      bannerMessage: 'Limited time offer: 80% off the first year. Auto-applied at checkout.',
      checkoutNote: 'The 80% off the first year offer is auto-applied. Monthly billing gets it for 12 paid months.',
      termsNote: 'M80OFF is auto-applied for 80% off for 12 months.',
    })
    expect(getPromotionDisplayCopy(PROMOTIONS.Y80OFF)).toMatchObject({
      code: 'Y80OFF',
      appliesToLabel: 'once',
      badgeLabel: '80% off the first year',
      checkoutNote: 'The 80% off the first year offer is auto-applied. Annual billing gets it once.',
      termsNote: 'Y80OFF is auto-applied for 80% off once.',
    })
  })

  it('rounds discounted limited offer price displays up to whole dollars', () => {
    expect(getPlanPromotionPriceDisplay('essentials', 'annual')).toMatchObject({
      listEffectiveMonthlyLabel: '$149',
      discountedEffectiveMonthlyLabel: '$30',
      listTotalLabel: '$1788',
      discountedTotalLabel: '$358',
    })

    expect(getPlanPromotionPriceDisplay('clinic', 'monthly')).toMatchObject({
      listEffectiveMonthlyLabel: '$229',
      discountedEffectiveMonthlyLabel: '$46',
      listTotalLabel: '$229',
      discountedTotalLabel: '$46',
    })
  })

  it('quotes the limited offer monthly price rounded up for emails', () => {
    // Annual effective monthly, 80% off, rounded up to whole dollars.
    expect(getPromotionalMonthlyPrice('essentials', 'annual')).toBe(30)
    expect(getPromotionalMonthlyPrice('clinic', 'annual')).toBe(38)
    expect(getPromotionalMonthlyPrice('group', 'annual')).toBe(78)
    expect(getPromotionalMonthlyPrice('compliance_ops', 'annual')).toBe(280)
    // Monthly cadence list prices, 80% off for 12 months, rounded up.
    expect(getPromotionalMonthlyPrice('clinic', 'monthly')).toBe(46)
  })

  it('quotes the limited offer email price with cadence-aware notes', async () => {
    expect(getPromotionalMonthlyPriceDisplay('essentials', 'annual')).toEqual({
      amount: 30,
      note: 'equivalent for the first year, paid annually',
    })
    expect(getPromotionalMonthlyPriceDisplay('clinic', 'monthly')).toEqual({
      amount: 46,
      note: 'for the first year',
    })
  })

  it('falls back to the list monthly price when no promotion is active', () => {
    expect(getPromotionalMonthlyPrice('essentials', 'annual', null)).toBe(149)
    expect(getPromotionalMonthlyPrice('clinic', 'monthly', null)).toBe(229)
  })

  it('limited offer promotions have 2 items with a 300 customer cap', () => {
    expect(LIMITED_OFFER_PROMOTIONS).toHaveLength(2)
    expect(LIMITED_OFFER_PROMOTIONS.map((p) => p.id)).toEqual(['M80OFF', 'Y80OFF'])
    expect(LIMITED_OFFER_PROMOTIONS.reduce((sum, p) => sum + p.redemptionCap, 0)).toBe(300)
  })

  it('exposes shared 30-day money-back guarantee copy', () => {
    expect(COMMERCIAL_COPY.moneyBackGuarantee).toContain('30-day money-back guarantee')
  })
})

describe('getMinimumPlanForFeatures', () => {
  it('returns essentials when no features are required', () => {
    expect(getMinimumPlanForFeatures([])).toBe('essentials')
  })

  it('returns essentials when only essentials-tier features are used', () => {
    expect(getMinimumPlanForFeatures(['tasks', 'audit_log'])).toBe('essentials')
  })

  it('returns clinic when integrations_basic is used', () => {
    expect(getMinimumPlanForFeatures(['tasks', 'integrations_basic'])).toBe('clinic')
  })

  it('returns group when group-tier features are used', () => {
    expect(getMinimumPlanForFeatures(['soc2_evidence'])).toBe('group')
    expect(getMinimumPlanForFeatures(['multi_location_rollup'])).toBe('group')
  })

  it('returns the cheapest plan that covers all requested features', () => {
    expect(
      getMinimumPlanForFeatures(['tasks', 'integrations_basic', 'soc2_evidence']),
    ).toBe('group')
  })

  it('ignores unknown feature keys', () => {
    expect(
      getMinimumPlanForFeatures(['tasks', 'mystery_feature' as never]),
    ).toBe('essentials')
  })
})
