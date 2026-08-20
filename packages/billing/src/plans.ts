export type PublicPlanId = 'essentials' | 'clinic' | 'group'
export type CustomPlanId = 'compliance_ops'
export type PlanId = PublicPlanId | CustomPlanId
export type StoredPlanId = PlanId
export type BillingCadence = 'monthly' | 'annual'

export type FeatureKey =
  | 'tasks' | 'compliance_starter' | 'audit_log'
  | 'integrations_basic' | 'multi_location_rollup'
  | 'compliance_addon' | 'soc2_evidence' | 'partner_portal'

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number   // in dollars, retained for compatibility
  prices: Record<BillingCadence, PlanPrice>
  maxMembers: number
  stripePriceEnvKey: string  // legacy monthly env var, retained for compatibility
  stripePriceEnvKeys: Record<BillingCadence, string>
  features: FeatureKey[]
}

export interface PlanPrice {
  amount: number
  effectiveMonthlyAmount: number
}

export type PromotionId = 'M80OFF' | 'Y80OFF'

export interface Promotion {
  id: PromotionId
  name: string
  code: PromotionId
  percentOff: number
  appliesTo: 'first_year' | 'once'
  billingCadence: BillingCadence
  autoApplyAtCheckout: boolean
  expiresAt?: string
  stripeCouponEnvKey: string
  redemptionCap: number
}

const ESSENTIALS_FEATURES: FeatureKey[] = ['tasks', 'compliance_starter', 'audit_log']
const CLINIC_FEATURES: FeatureKey[] = ['tasks', 'compliance_starter', 'audit_log', 'integrations_basic']
const GROUP_FEATURES: FeatureKey[] = ['tasks', 'compliance_starter', 'audit_log', 'integrations_basic', 'multi_location_rollup', 'compliance_addon', 'soc2_evidence', 'partner_portal']
const COMPLIANCE_OPS_FEATURES: FeatureKey[] = GROUP_FEATURES

export const BILLING_CADENCES: BillingCadence[] = ['monthly', 'annual']
export const DEFAULT_BILLING_CADENCE: BillingCadence = 'annual'
export const PUBLIC_PLAN_IDS = ['essentials', 'clinic', 'group'] as const satisfies readonly PublicPlanId[]
export const CUSTOM_PLAN_IDS = ['compliance_ops'] as const satisfies readonly CustomPlanId[]
export const TRIAL_DAYS = 30

const PLAN_STRIPE_TOKENS: Record<PlanId, string> = {
  essentials: 'ESSENTIALS',
  clinic: 'CLINIC',
  group: 'GROUP',
  compliance_ops: 'COMPLIANCE_OPS',
}

function price(monthly: number, annual: number, annualEffectiveMonthly: number): Record<BillingCadence, PlanPrice> {
  return {
    monthly: { amount: monthly, effectiveMonthlyAmount: monthly },
    annual: { amount: annual, effectiveMonthlyAmount: annualEffectiveMonthly },
  }
}

function stripePriceEnvKeys(planId: PlanId): Record<BillingCadence, string> {
  const token = PLAN_STRIPE_TOKENS[planId]

  return {
    monthly: `STRIPE_PRICE_${token}_MONTHLY`,
    annual: `STRIPE_PRICE_${token}_ANNUAL`,
  }
}

function plan(input: {
  id: PlanId
  name: string
  monthly: number
  annual: number
  annualEffectiveMonthly: number
  maxMembers: number
  features: FeatureKey[]
}): Plan {
  return {
    id: input.id,
    name: input.name,
    priceMonthly: input.monthly,
    prices: price(input.monthly, input.annual, input.annualEffectiveMonthly),
    maxMembers: input.maxMembers,
    stripePriceEnvKey: `STRIPE_PRICE_${PLAN_STRIPE_TOKENS[input.id]}`,
    stripePriceEnvKeys: stripePriceEnvKeys(input.id),
    features: input.features,
  }
}

export const PLANS: Record<PlanId, Plan> = {
  essentials: plan({ id: 'essentials', name: 'Essentials', monthly: 179, annual: 1788, annualEffectiveMonthly: 149, maxMembers: 10, features: ESSENTIALS_FEATURES }),
  clinic: plan({ id: 'clinic', name: 'Clinic', monthly: 229, annual: 2268, annualEffectiveMonthly: 189, maxMembers: 30, features: CLINIC_FEATURES }),
  group: plan({ id: 'group', name: 'Group', monthly: 469, annual: 4668, annualEffectiveMonthly: 389, maxMembers: 100, features: GROUP_FEATURES }),
  compliance_ops: plan({ id: 'compliance_ops', name: 'Compliance Ops', monthly: 1679, annual: 16788, annualEffectiveMonthly: 1399, maxMembers: 100, features: COMPLIANCE_OPS_FEATURES }),
}

export const PROMOTIONS: Record<PromotionId, Promotion> = {
  M80OFF: {
    id: 'M80OFF',
    name: '80% OFF - Monthly',
    code: 'M80OFF',
    percentOff: 80,
    appliesTo: 'first_year',
    billingCadence: 'monthly',
    autoApplyAtCheckout: true,
    stripeCouponEnvKey: 'STRIPE_M80OFF_COUPON_ID',
    redemptionCap: 100,
  },
  Y80OFF: {
    id: 'Y80OFF',
    name: '80% OFF - Yearly',
    code: 'Y80OFF',
    percentOff: 80,
    appliesTo: 'once',
    billingCadence: 'annual',
    autoApplyAtCheckout: true,
    stripeCouponEnvKey: 'STRIPE_Y80OFF_COUPON_ID',
    redemptionCap: 200,
  },
}

export const LIMITED_OFFER_PROMOTIONS: Promotion[] = [PROMOTIONS.M80OFF, PROMOTIONS.Y80OFF]
const publicLimitedOfferSource = LIMITED_OFFER_PROMOTIONS[0]
if (!publicLimitedOfferSource) {
  throw new Error('Expected at least one public limited offer promotion')
}
export const PUBLIC_LIMITED_OFFER = {
  id: 'FIRST_YEAR_80_OFF',
  percentOff: publicLimitedOfferSource.percentOff,
} as const

export const COMMERCIAL_COPY = {
  moneyBackGuarantee: '30-day money-back guarantee',
}

export function toStoredPlanId(planId: string | undefined): StoredPlanId {
  if (planId === 'clinic' || planId === 'group' || planId === 'compliance_ops') {
    return planId
  }

  return 'essentials'
}

export function getStripePriceEnvKey(planId: PublicPlanId, cadence: BillingCadence = DEFAULT_BILLING_CADENCE): string {
  return PLANS[planId].stripePriceEnvKeys[cadence]
}

export function getActivePromotion(
  cadence: BillingCadence = DEFAULT_BILLING_CADENCE,
  now: Date = new Date(),
): Promotion | null {
  const promotion = LIMITED_OFFER_PROMOTIONS.find((p) => p.billingCadence === cadence) ?? null
  if (promotion && (!promotion.expiresAt || now.getTime() <= new Date(promotion.expiresAt).getTime())) {
    return promotion
  }

  return null
}

export function formatUsd(amount: number): string {
  return `$${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`
}

export function formatRoundedUpUsd(amount: number): string {
  return `$${Math.ceil(amount)}`
}

function discountAmount(amount: number, promotion: Promotion): number {
  return amount * (100 - promotion.percentOff) / 100
}

function getPromotionAppliesToLabel(promotion: Promotion): string {
  if (promotion.appliesTo === 'once') return 'once'

  return '12 months'
}

export function getPromotionDisplayCopy(promotion: Promotion | null = getActivePromotion()) {
  if (!promotion) return null

  const percentOffLabel = `${promotion.percentOff}%`
  const appliesToLabel = getPromotionAppliesToLabel(promotion)
  const autoApplyLabel = promotion.autoApplyAtCheckout ? 'Auto-applied at checkout' : 'Use at checkout'
  const subscriptionLabel = promotion.appliesTo === 'once'
    ? `${percentOffLabel} off once`
    : `${percentOffLabel} off for ${appliesToLabel}`
  const billingDetail = promotion.appliesTo === 'once'
    ? 'Annual billing gets it once.'
    : 'Monthly billing gets it for 12 paid months.'

  return {
    code: promotion.id,
    percentOffLabel,
    appliesToLabel,
    badgeLabel: `${percentOffLabel} off the first year`,
    offerLabel: 'Limited time offer',
    autoApplyLabel,
    bannerMessage: `Limited time offer: 80% off the first year. ${autoApplyLabel}.`,
    checkoutNote: `The 80% off the first year offer is auto-applied. ${billingDetail}`,
    termsNote: `${promotion.id} is auto-applied for ${subscriptionLabel}.`,
  }
}

export function getPlanPromotionPriceDisplay(
  planId: PlanId,
  cadence: BillingCadence = DEFAULT_BILLING_CADENCE,
  promotion: Promotion | null = getActivePromotion(cadence),
) {
  const plan = PLANS[planId]
  const price = plan.prices[cadence]
  const activePromotion = promotion
  const discount = activePromotion ? (amount: number) => discountAmount(amount, activePromotion) : (amount: number) => amount
  const listEffectiveMonthly = price.effectiveMonthlyAmount
  const listTotal = price.amount
  const discountedEffectiveMonthly = discount(listEffectiveMonthly)
  const discountedTotal = discount(listTotal)

  return {
    cadence,
    promotion: activePromotion,
    listEffectiveMonthly,
    discountedEffectiveMonthly,
    listTotal,
    discountedTotal,
    listEffectiveMonthlyLabel: formatUsd(listEffectiveMonthly),
    discountedEffectiveMonthlyLabel: formatRoundedUpUsd(discountedEffectiveMonthly),
    listTotalLabel: formatUsd(listTotal),
    discountedTotalLabel: formatRoundedUpUsd(discountedTotal),
  }
}

/**
 * Whole-dollar monthly price to quote in customer-facing surfaces (e.g. emails),
 * with the active limited offer applied. Rounds up to match the marketing
 * price labels (formatRoundedUpUsd). Falls back to the list price when no
 * promotion is active.
 */
export function getPromotionalMonthlyPrice(
  planId: PlanId,
  cadence: BillingCadence = DEFAULT_BILLING_CADENCE,
  promotion: Promotion | null = getActivePromotion(cadence),
): number {
  return Math.ceil(getPlanPromotionPriceDisplay(planId, cadence, promotion).discountedEffectiveMonthly)
}

export function getPromotionalMonthlyPriceDisplay(
  planId: PlanId,
  cadence: BillingCadence = DEFAULT_BILLING_CADENCE,
  promotion: Promotion | null = getActivePromotion(cadence),
): { amount: number; note?: string } {
  return {
    amount: getPromotionalMonthlyPrice(planId, cadence, promotion),
    note: promotion
      ? cadence === 'annual'
        ? 'equivalent for the first year, paid annually'
        : 'for the first year'
      : undefined,
  }
}

export function getMaxMembersForPlan(planId: string | undefined) {
  const normalizedPlanId =
    planId && planId in PLANS ? (planId as PlanId) : toStoredPlanId(planId)

  return PLANS[normalizedPlanId].maxMembers
}

export function getPlanIdFromStripePriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null

  const matchedPlan = Object.values(PLANS).find((plan) => (
    process.env[plan.stripePriceEnvKey] === priceId
    || BILLING_CADENCES.some((cadence) => process.env[plan.stripePriceEnvKeys[cadence]] === priceId)
  ))
  return matchedPlan?.id ?? null
}

export const PLAN_TIER_ORDER = [...PUBLIC_PLAN_IDS, ...CUSTOM_PLAN_IDS] as const satisfies readonly PlanId[]

export function isPublicPlanId(planId: string | undefined): planId is PublicPlanId {
  return Boolean(planId && (PUBLIC_PLAN_IDS as readonly string[]).includes(planId))
}

export function isPlanAtLeast(candidate: PlanId, minimum: PlanId): boolean {
  return PLAN_TIER_ORDER.indexOf(candidate) >= PLAN_TIER_ORDER.indexOf(minimum)
}

export function getMinimumPlanForFeatures(features: readonly FeatureKey[]): PlanId {
  const knownFeatures = features.filter((feature): feature is FeatureKey =>
    PLANS.compliance_ops.features.includes(feature),
  )
  if (knownFeatures.length === 0) return 'essentials'

  for (const planId of PLAN_TIER_ORDER) {
    const plan = PLANS[planId]
    if (knownFeatures.every((feature) => plan.features.includes(feature))) {
      return planId
    }
  }

  return 'compliance_ops'
}
