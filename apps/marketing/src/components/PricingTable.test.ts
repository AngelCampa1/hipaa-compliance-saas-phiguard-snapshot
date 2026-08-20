import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(fileURLToPath(new URL('./PricingTable.astro', import.meta.url)), 'utf8')

describe('PricingTable billing toggle analytics', () => {
  it('keeps pricing CTA numeric analytics fields in sync with the selected billing period', () => {
    expect(source).toContain('data-ph-pricing-annual-price={plan.priceAnnualAmount}')
    expect(source).toContain('data-ph-pricing-annual-list-price={plan.priceAnnualListAmount}')
    expect(source).toContain('data-ph-pricing-monthly-price={plan.priceMonthlyAmount}')
    expect(source).toContain('data-ph-pricing-monthly-list-price={plan.priceMonthlyListAmount}')
    expect(source).toContain('data-ph-pricing-${period}-price')
    expect(source).toContain("a.setAttribute('data-ph-pricing-price', price)")
    expect(source).toContain("a.setAttribute('data-ph-pricing-list-price', listPrice)")
  })

  it('tracks pricing billing period changes as conversion intent', () => {
    expect(source).toContain("track?.('pricing_billing_toggled'")
    expect(source).toContain("billing_period: period")
    expect(source).toContain("location: 'pricing-toggle'")
  })

  it('keeps pricing CTA metadata available for centralized signup attribution', () => {
    expect(source).toContain('data-ph-pricing-cta={plan.name}')
    expect(source).toContain('data-ph-pricing-billing="annual"')
    expect(source).toContain('data-ph-pricing-promo={plan.promoBadge}')
    expect(source).not.toContain('function appendSignupAttribution')
    expect(source).not.toContain('phiguard_analytics_first_touch')
  })
})
