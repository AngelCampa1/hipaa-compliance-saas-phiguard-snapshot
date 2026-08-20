import { getStripe } from './stripe.js'
import {
  DEFAULT_BILLING_CADENCE,
  PLANS,
  getActivePromotion,
  getStripePriceEnvKey,
  type BillingCadence,
  type PublicPlanId,
} from './plans.js'
import { resolvePromotionPhaseState } from './promotion-phase.js'

function hashCheckoutPayload(value: string) {
  let hash = 2166136261

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

function buildCheckoutIdempotencyKey(opts: {
  orgId: string
  planId: PublicPlanId
  billingCadence?: BillingCadence
  successUrl: string
  cancelUrl: string
  customerId?: string
  customerEmail?: string
  trialEndAt?: Date
  promotionId?: string | null
  promotionCouponId?: string | null
}) {
  const payload = JSON.stringify({
    orgId: opts.orgId,
    planId: opts.planId,
    billingCadence: opts.billingCadence ?? DEFAULT_BILLING_CADENCE,
    promotionId: opts.promotionId ?? null,
    promotionCouponId: opts.promotionCouponId ?? null,
    successUrl: opts.successUrl,
    cancelUrl: opts.cancelUrl,
    customerId: opts.customerId ?? null,
    customerEmail: opts.customerEmail ?? null,
    trialEndAt: opts.trialEndAt?.toISOString() ?? null,
  })

  return `checkout_${hashCheckoutPayload(payload)}`
}

function getCheckoutPrice(planId: PublicPlanId, billingCadence: BillingCadence): {
  priceId: string | undefined
  billingCadence: BillingCadence
} {
  const priceEnvKey = getStripePriceEnvKey(planId, billingCadence)
  const cadencePriceId = process.env[priceEnvKey]
  if (cadencePriceId) {
    return { priceId: cadencePriceId, billingCadence }
  }

  if (billingCadence !== 'monthly') {
    return { priceId: undefined, billingCadence }
  }

  return { priceId: process.env[PLANS[planId].stripePriceEnvKey], billingCadence }
}

export async function createCheckoutSession(opts: {
  orgId: string
  planId: PublicPlanId
  billingCadence?: BillingCadence
  successUrl: string
  cancelUrl: string
  customerId?: string
  customerEmail?: string  // used to pre-fill Stripe's form; NOT stored in our DB from Stripe response
  currentSubscriptionId?: string | null
  trialEndAt?: Date
  now?: Date
}) {
  if (opts.currentSubscriptionId) {
    throw new Error('Organization already has a current subscription. Use the billing portal instead of creating a duplicate checkout session.')
  }

  const stripe = getStripe()
  const requestedBillingCadence = opts.billingCadence ?? DEFAULT_BILLING_CADENCE
  const { priceId, billingCadence } = getCheckoutPrice(opts.planId, requestedBillingCadence)
  if (!priceId) throw new Error(`Stripe Price ID not configured for plan ${opts.planId}`)
  const configuredPromotion = getActivePromotion(billingCadence)
  const activePromotion = await resolvePromotionPhaseState()
    .then((state) => {
      if (!configuredPromotion) return null
      const publicState = state.phases.find((phase) => phase.id === configuredPromotion.id)
      return publicState?.status === 'active' ? configuredPromotion : null
    })
    .catch(() => configuredPromotion)
  let couponId: string | undefined
  if (activePromotion?.autoApplyAtCheckout) {
    couponId = process.env[activePromotion.stripeCouponEnvKey]
    if (!couponId) {
      throw new Error(`Stripe Coupon ID not configured for promotion ${activePromotion.id}`)
    }
  }
  const trialEndAt =
    activePromotion?.id === 'M80OFF'
      ? undefined
      : opts.trialEndAt

  // HIPAA: only org metadata in Stripe. Never send PHI.
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    discounts: couponId ? [{ coupon: couponId }] : undefined,
    metadata: { orgId: opts.orgId, plan: opts.planId, billingCadence },  // org metadata only
    customer: opts.customerId,
    customer_email: opts.customerId ? undefined : opts.customerEmail,  // Only prefill email for first-time checkout
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    subscription_data: {
      metadata: { orgId: opts.orgId, plan: opts.planId, billingCadence },
      trial_end: trialEndAt
        ? Math.floor(trialEndAt.getTime() / 1000)
        : undefined,
      trial_settings: trialEndAt
        ? {
            end_behavior: {
              missing_payment_method: 'pause',
            },
          }
        : undefined,
    },
  }, {
    idempotencyKey: buildCheckoutIdempotencyKey({
      ...opts,
      trialEndAt,
      promotionId: activePromotion?.id ?? null,
      promotionCouponId: couponId ?? null,
    }),
  })
  return session
}
