import { PLANS, toStoredPlanId, type StoredPlanId } from './plans.js'

export type CommercialPlanStatus =
  | 'selection_required'
  | 'trial_pending'
  | 'trialing'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'canceled'

export interface CommercialStateInput {
  plan: string | null | undefined
  planStatus: CommercialPlanStatus
  trialStartedAt?: string | Date | null | undefined
  trialEndsAt?: string | Date | null | undefined
  stripeCustomerId?: string | null | undefined
  stripeSubscriptionId?: string | null | undefined
  now?: Date
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

function resolveSelectedPlan(
  plan: string | null | undefined,
  planStatus: CommercialPlanStatus,
): StoredPlanId | null {
  if (planStatus === 'selection_required') {
    return null
  }

  return toStoredPlanId(plan ?? undefined)
}

export function resolveCommercialState(input: CommercialStateInput) {
  const now = input.now ?? new Date()
  const selectedPlan = resolveSelectedPlan(input.plan, input.planStatus)
  const trialEndsAt = toDate(input.trialEndsAt)
  const trialStartedAt = toDate(input.trialStartedAt)
  const hasStripeCustomer = Boolean(input.stripeCustomerId)
  const hasStripeSubscription = Boolean(input.stripeSubscriptionId)
  const isTrialExpired = Boolean(
    input.planStatus === 'trialing'
    && trialEndsAt
    && trialEndsAt.getTime() <= now.getTime(),
  )
  const isExpiredTrialWithoutBilling = Boolean(
    isTrialExpired
    && !hasStripeCustomer
    && !hasStripeSubscription,
  )
  const isHardLocked = Boolean(
    isExpiredTrialWithoutBilling
    || ((input.planStatus === 'paused' || input.planStatus === 'past_due') && !hasStripeSubscription),
  )
  const hasProductAccess = Boolean(
    input.planStatus === 'active'
    || input.planStatus === 'past_due'
    || (input.planStatus === 'trialing' && !isTrialExpired),
  )

  return {
    selectedPlan,
    selectedPlanDetails: selectedPlan ? PLANS[selectedPlan] : null,
    trialStartedAt,
    trialEndsAt,
    hasStripeCustomer,
    hasStripeSubscription,
    isTrialExpired,
    isExpiredTrialWithoutBilling,
    isHardLocked,
    hasProductAccess,
    requiresPlanSelection: input.planStatus === 'selection_required',
    requiresTrialStart: input.planStatus === 'trial_pending',
    canAccessBillingRecovery: true,
  }
}
