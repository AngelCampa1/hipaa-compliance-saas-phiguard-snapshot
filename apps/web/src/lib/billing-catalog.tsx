import {
  COMMERCIAL_COPY,
  PUBLIC_PLAN_IDS,
  getPlanPromotionPriceDisplay,
  getActivePromotion,
  getPromotionDisplayCopy,
  type BillingCadence,
  type PublicPlanId,
} from '@phiguard/billing/plans'

export { PUBLIC_PLAN_IDS }


export function formatPlanPrice(planId: PublicPlanId, cadence: BillingCadence = 'annual') {
  const price = getPlanPromotionPriceDisplay(planId, cadence)
  const promoCopy = getPromotionDisplayCopy(price.promotion)

  if (cadence === 'annual') {
    return {
      price: price.discountedEffectiveMonthlyLabel,
      listPrice: price.listEffectiveMonthlyLabel,
      cadenceLabel: 'effective monthly',
      detail: promoCopy
        ? `Paid upfront annually (${price.discountedTotalLabel}/year) with the limited first-year offer.`
        : `${price.listTotalLabel} paid upfront annually.`,
      badgeLabel: promoCopy?.badgeLabel,
    }
  }

  return {
    price: price.discountedEffectiveMonthlyLabel,
    listPrice: price.listEffectiveMonthlyLabel,
    cadenceLabel: 'per month',
    detail: promoCopy
      ? 'Paid monthly with the limited first-year offer.'
      : 'Billed monthly.',
    badgeLabel: promoCopy?.badgeLabel,
  }
}

export function CommercialOfferNote({
  billingCadence = 'annual',
  className = '',
}: {
  billingCadence?: BillingCadence
  className?: string
}) {
  const promotion = getActivePromotion(billingCadence)

  if (!promotion) {
    return null
  }

  return (
    <p className={`text-sm leading-6 text-text-secondary ${className}`}>
      {getPromotionDisplayCopy(promotion)?.checkoutNote} {COMMERCIAL_COPY.moneyBackGuarantee}.
    </p>
  )
}
