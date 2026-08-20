import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CommercialOfferNote, formatPlanPrice } from './billing-catalog.js'

describe('billing catalog display helpers', () => {
  it('shows limited offer annual and monthly prices with list-price context', () => {
    expect(formatPlanPrice('essentials', 'annual')).toEqual({
      price: '$30',
      listPrice: '$149',
      cadenceLabel: 'effective monthly',
      detail: 'Paid upfront annually ($358/year) with the limited first-year offer.',
      badgeLabel: '80% off the first year',
    })

    expect(formatPlanPrice('clinic', 'monthly')).toEqual({
      price: '$46',
      listPrice: '$229',
      cadenceLabel: 'per month',
      detail: 'Paid monthly with the limited first-year offer.',
      badgeLabel: '80% off the first year',
    })
  })

  it('renders cadence-specific limited offer notes', () => {
    expect(renderToStaticMarkup(<CommercialOfferNote billingCadence="monthly" />)).toContain(
      'The 80% off the first year offer is auto-applied. Monthly billing gets it for 12 paid months. 30-day money-back guarantee.',
    )
    expect(renderToStaticMarkup(<CommercialOfferNote billingCadence="annual" />)).toContain(
      'The 80% off the first year offer is auto-applied. Annual billing gets it once. 30-day money-back guarantee.',
    )
  })
})
