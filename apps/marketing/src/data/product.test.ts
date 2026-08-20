import { describe, expect, it } from 'vitest'
import { limitedOfferCommercialCopy, marketingPlans } from './product'

describe('marketing product pricing adapter', () => {
  it('exposes centralized limited offer copy without a public end date', () => {
    expect(limitedOfferCommercialCopy).toMatchObject({
      promoCode: 'Y80OFF',
      monthlyPromoCode: 'M80OFF',
      yearlyPromoCode: 'Y80OFF',
      promoPercentOffLabel: '80%',
      promoAppliesTo: 'once',
      promoBadge: '80% off the first year',
      promoOfferLabel: 'Limited time offer',
      promoAutoApplyLabel: 'Auto-applied at checkout',
      promoBannerMessage: 'Limited time offer: 80% off the first year. Auto-applied at checkout.',
    })
    expect(limitedOfferCommercialCopy).not.toHaveProperty('promoExpiresAt')
    expect(limitedOfferCommercialCopy).not.toHaveProperty('promoExpiresLabel')
  })

  it('contains the plan IDs relied upon by hipaa.astro named lookups', () => {
    const ids = marketingPlans.map((p) => p.id)
    expect(ids).toContain('clinic')
    expect(ids).toContain('group')
  })

  it('exposes promoted and list prices for annual and monthly displays', () => {
    expect(marketingPlans.find((plan) => plan.id === 'essentials')).toMatchObject({
      priceAnnualMonthly: '$30',
      priceAnnualMonthlyList: '$149',
      priceAnnualMonthlyAmount: 30,
      priceAnnualMonthlyListAmount: 149,
      priceAnnual: '$358',
      priceAnnualList: '$1788',
      priceAnnualAmount: 358,
      priceAnnualListAmount: 1788,
      priceMonthly: '$36',
      priceMonthlyList: '$179',
      priceMonthlyAmount: 36,
      priceMonthlyListAmount: 179,
      promoBadge: '80% off the first year',
    })
  })
})
