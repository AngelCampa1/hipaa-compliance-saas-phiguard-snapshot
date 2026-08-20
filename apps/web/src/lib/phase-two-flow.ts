import { resolveCommercialState } from '@phiguard/billing'

export type OnboardingLegalStatus = 'loading' | 'none' | 'accepted'
export type BillingPlanStatus =
  | 'selection_required'
  | 'trial_pending'
  | 'trialing'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'canceled'
export type OnboardingOrganizationState = 'idle' | 'loading' | 'ready' | 'missing'

export function isBillingRecoveryPath(pathname: string) {
  return pathname === '/app/billing'
}

export function resolveInitialOnboardingStep(search: {
  step?: number
  checkout?: string
}): number {
  const step = search.step ?? 1
  return Math.min(Math.max(step, 1), 5)
}

export function shouldRedirectReadyUserFromOnboarding(input: {
  pathname: string
  search: string | Record<string, unknown> | undefined
}): boolean {
  if (input.pathname !== '/app/onboarding') {
    return false
  }

  if (typeof input.search === 'string') {
    const params = new URLSearchParams(input.search)
    return params.get('checkout') !== 'success' && params.get('step') == null
  }

  return input.search?.checkout !== 'success' && input.search?.step == null
}

export function isOnLegalAcceptanceStep(input: {
  pathname: string
  search: string | Record<string, unknown> | undefined
}): boolean {
  if (input.pathname !== '/app/onboarding') {
    return false
  }

  if (typeof input.search === 'string') {
    const params = new URLSearchParams(input.search)
    return params.get('step') === '2'
  }

  return input.search?.step === 2 || input.search?.step === '2'
}

/**
 * A "ready" org (plan chosen, trial/billing active) can still have stale legal
 * acceptance — most commonly after a Terms or BAA version bump that flips
 * `legalCurrent` to false for already-onboarded customers. Without this check
 * such users pass the /app layout guard, reach product routes, and dead-end on
 * a generic "couldn't load your clinic data" error thrown by the commercial
 * access gate. This routes them to the onboarding legal step to re-accept
 * instead, while avoiding a redirect loop once they are already on that step.
 */
export function requiresLegalReacceptanceRedirect(input: {
  legalCurrent: boolean | null | undefined
  pathname: string
  search: string | Record<string, unknown> | undefined
}): boolean {
  if (input.legalCurrent !== false) {
    return false
  }

  if (isBillingRecoveryPath(input.pathname)) {
    return false
  }

  if (isOnLegalAcceptanceStep({ pathname: input.pathname, search: input.search })) {
    return false
  }

  return true
}

export function getPostInviteOnboardingStep(): number {
  return 5
}

export function canContinueFromLegal(status: OnboardingLegalStatus): boolean {
  return status === 'accepted'
}

export function getMaxAllowedOnboardingStep(input: {
  hasOrganization: boolean
  hasSelectedPlan?: boolean
  legalStatus: OnboardingLegalStatus
  hasStartedTrial: boolean
}): number {
  if (!input.hasOrganization) {
    return 1
  }

  if (!input.hasSelectedPlan) {
    return 1
  }

  if (input.legalStatus !== 'accepted') {
    return 2
  }

  if (!input.hasStartedTrial) {
    return 3
  }

  return 5
}

export function shouldDeferOnboardingStepGuard(input: {
  currentStep: number
  checkout?: string
  legalStatus: OnboardingLegalStatus
  organizationState: OnboardingOrganizationState
}) {
  if (
    input.organizationState === 'loading'
    && (input.currentStep > 1 || input.checkout === 'success')
  ) {
    return true
  }

  if (input.legalStatus === 'loading' && input.currentStep > 2) {
    return true
  }

  return false
}

export function getBillingGateState(input: {
  baaSignedAt: string | Date | null | undefined
  termsAcceptedAt: string | Date | null | undefined
  legalCurrent?: boolean | null | undefined
  planStatus: BillingPlanStatus
  hasBillingCustomer: boolean
  hasBillingSubscription: boolean
  hasPaymentMethodOnFile: boolean
  trialEndsAt?: string | Date | null | undefined
  plan?: string | null | undefined
}) {
  const needsLegalAcceptance = input.legalCurrent == null
    ? (!input.baaSignedAt || !input.termsAcceptedAt)
    : !input.legalCurrent
  const commercial = resolveCommercialState({
    plan: input.plan,
    planStatus: input.planStatus,
    trialEndsAt: input.trialEndsAt,
    stripeCustomerId: input.hasBillingCustomer ? 'customer' : null,
    stripeSubscriptionId: input.hasBillingSubscription ? 'subscription' : null,
  })

  return {
    status: input.planStatus,
    needsLegalAcceptance,
    hasStartedTrial: input.planStatus === 'trialing' || input.planStatus === 'active',
    isPreCheckoutTrial: input.planStatus === 'selection_required' || input.planStatus === 'trial_pending',
    isPausedTrial: input.planStatus === 'paused',
    hasPaymentMethodOnFile: input.hasPaymentMethodOnFile,
    trialEndsAt: input.trialEndsAt ?? null,
    checkoutAllowed: !needsLegalAcceptance,
    canManageBilling: input.hasBillingCustomer,
    requiresPlanSelection: commercial.requiresPlanSelection,
    requiresTrialStart: commercial.requiresTrialStart,
    isHardLocked: commercial.isHardLocked,
    isExpiredTrialWithoutBilling: commercial.isExpiredTrialWithoutBilling,
  }
}
