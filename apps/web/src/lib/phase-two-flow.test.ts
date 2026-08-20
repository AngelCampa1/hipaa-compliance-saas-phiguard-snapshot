import { describe, expect, it } from 'vitest'
import {
  canContinueFromLegal,
  getBillingGateState,
  getMaxAllowedOnboardingStep,
  getPostInviteOnboardingStep,
  isBillingRecoveryPath,
  isOnLegalAcceptanceStep,
  requiresLegalReacceptanceRedirect,
  resolveInitialOnboardingStep,
  shouldDeferOnboardingStepGuard,
  shouldRedirectReadyUserFromOnboarding,
} from './phase-two-flow.js'

describe('resolveInitialOnboardingStep', () => {
  it('defaults to the first onboarding step when no search params are provided', () => {
    expect(resolveInitialOnboardingStep({})).toBe(1)
  })

  it('does not skip ahead when checkout success is present without a confirmed step', () => {
    expect(resolveInitialOnboardingStep({ checkout: 'success' })).toBe(1)
  })

  it('clamps explicit step values into the supported onboarding range', () => {
    expect(resolveInitialOnboardingStep({ step: 9 })).toBe(5)
    expect(resolveInitialOnboardingStep({ step: 0 })).toBe(1)
    expect(resolveInitialOnboardingStep({ checkout: 'success', step: 4 })).toBe(4)
  })
})

describe('shouldRedirectReadyUserFromOnboarding', () => {
  it('keeps the user on onboarding when returning from successful checkout', () => {
    expect(
      shouldRedirectReadyUserFromOnboarding({
        pathname: '/app/onboarding',
        search: '?checkout=success&step=4',
      }),
    ).toBe(false)
  })

  it('keeps the user on onboarding when resuming an explicit legal return step', () => {
    expect(
      shouldRedirectReadyUserFromOnboarding({
        pathname: '/app/onboarding',
        search: '?step=2',
      }),
    ).toBe(false)
  })

  it('redirects ready users away from onboarding when no resume signal is present', () => {
    expect(
      shouldRedirectReadyUserFromOnboarding({
        pathname: '/app/onboarding',
        search: '',
      }),
    ).toBe(true)
  })
})

describe('requiresLegalReacceptanceRedirect', () => {
  it('redirects an otherwise-ready user with stale legal acceptance to the legal step', () => {
    expect(
      requiresLegalReacceptanceRedirect({
        legalCurrent: false,
        pathname: '/app/dashboard',
        search: { locationId: undefined },
      }),
    ).toBe(true)
  })

  it('does not redirect when legal acceptance is current', () => {
    expect(
      requiresLegalReacceptanceRedirect({
        legalCurrent: true,
        pathname: '/app/dashboard',
        search: '',
      }),
    ).toBe(false)
  })

  it('does not redirect when legal status is unknown (fresh onboarding)', () => {
    expect(
      requiresLegalReacceptanceRedirect({
        legalCurrent: null,
        pathname: '/app/onboarding',
        search: { step: 1 },
      }),
    ).toBe(false)
  })

  it('does not loop once the user is already on the legal acceptance step', () => {
    expect(
      requiresLegalReacceptanceRedirect({
        legalCurrent: false,
        pathname: '/app/onboarding',
        search: '?step=2',
      }),
    ).toBe(false)
  })

  it('does not fight the hard-lock billing recovery redirect', () => {
    expect(
      requiresLegalReacceptanceRedirect({
        legalCurrent: false,
        pathname: '/app/billing',
        search: '',
      }),
    ).toBe(false)
  })
})

describe('getPostInviteOnboardingStep', () => {
  it('advances to the start-compliance step after invite handling completes', () => {
    expect(getPostInviteOnboardingStep()).toBe(5)
  })
})

describe('canContinueFromLegal', () => {
  it('allows progress only after legal acceptance is complete', () => {
    expect(canContinueFromLegal('accepted')).toBe(true)
    expect(canContinueFromLegal('none')).toBe(false)
  })
})

describe('isOnLegalAcceptanceStep', () => {
  it('recognizes the onboarding legal step from a query string', () => {
    expect(
      isOnLegalAcceptanceStep({
        pathname: '/app/onboarding',
        search: '?step=2',
      }),
    ).toBe(true)
  })

  it('recognizes the onboarding legal step from a parsed search object', () => {
    expect(
      isOnLegalAcceptanceStep({
        pathname: '/app/onboarding',
        search: { step: 2 },
      }),
    ).toBe(true)
  })

  it('rejects non-legal or non-onboarding paths', () => {
    expect(
      isOnLegalAcceptanceStep({
        pathname: '/app/onboarding',
        search: { step: 1 },
      }),
    ).toBe(false)

    expect(
      isOnLegalAcceptanceStep({
        pathname: '/app/dashboard',
        search: { step: 2 },
      }),
    ).toBe(false)
  })
})

describe('getBillingGateState', () => {
  it('requires both terms and BAA acceptance before checkout can start', () => {
    expect(
      getBillingGateState({
        baaSignedAt: null,
        termsAcceptedAt: null,
        planStatus: 'selection_required',
        hasBillingCustomer: false,
        hasBillingSubscription: false,
        hasPaymentMethodOnFile: false,
        trialEndsAt: null,
      }),
    ).toMatchObject({
      checkoutAllowed: false,
      needsLegalAcceptance: true,
      canManageBilling: false,
      isPreCheckoutTrial: true,
      hasStartedTrial: false,
      requiresPlanSelection: true,
    })
  })

  it('enables billing actions once both legal documents are accepted', () => {
    expect(
      getBillingGateState({
        baaSignedAt: '2026-04-16T12:00:00.000Z',
        termsAcceptedAt: '2026-04-16T12:00:00.000Z',
        legalCurrent: true,
        planStatus: 'past_due',
        hasBillingCustomer: true,
        hasBillingSubscription: true,
        hasPaymentMethodOnFile: true,
        trialEndsAt: '2026-05-16T12:00:00.000Z',
      }),
    ).toMatchObject({
        checkoutAllowed: true,
        needsLegalAcceptance: false,
        canManageBilling: true,
        hasPaymentMethodOnFile: true,
        status: 'past_due',
        trialEndsAt: '2026-05-16T12:00:00.000Z',
      })
  })

  it('does not treat canceled subscriptions as pre-checkout trials', () => {
    expect(
      getBillingGateState({
        baaSignedAt: '2026-04-16T12:00:00.000Z',
        termsAcceptedAt: '2026-04-16T12:00:00.000Z',
        legalCurrent: true,
        planStatus: 'canceled',
        hasBillingCustomer: true,
        hasBillingSubscription: false,
        hasPaymentMethodOnFile: false,
        trialEndsAt: null,
      }),
    ).toMatchObject({
      isPreCheckoutTrial: false,
      status: 'canceled',
    })
  })

  it('hard-locks expired unpaid trials with no Stripe state', () => {
    expect(
      getBillingGateState({
        baaSignedAt: '2026-04-16T12:00:00.000Z',
        termsAcceptedAt: '2026-04-16T12:00:00.000Z',
        legalCurrent: true,
        planStatus: 'trialing',
        hasBillingCustomer: false,
        hasBillingSubscription: false,
        hasPaymentMethodOnFile: false,
        trialEndsAt: '2020-05-16T12:00:00.000Z',
      }),
    ).toMatchObject({
      isHardLocked: true,
      isExpiredTrialWithoutBilling: true,
    })
  })
})

describe('getMaxAllowedOnboardingStep', () => {
  it('prevents skipping ahead before org creation, legal acceptance, or checkout', () => {
    expect(
      getMaxAllowedOnboardingStep({
        hasOrganization: false,
        hasSelectedPlan: false,
        legalStatus: 'none',
        hasStartedTrial: false,
      }),
    ).toBe(1)

    expect(
      getMaxAllowedOnboardingStep({
        hasOrganization: true,
        hasSelectedPlan: false,
        legalStatus: 'none',
        hasStartedTrial: false,
      }),
    ).toBe(1)

    expect(
      getMaxAllowedOnboardingStep({
        hasOrganization: true,
        hasSelectedPlan: true,
        legalStatus: 'none',
        hasStartedTrial: false,
      }),
    ).toBe(2)

    expect(
      getMaxAllowedOnboardingStep({
        hasOrganization: true,
        hasSelectedPlan: true,
        legalStatus: 'accepted',
        hasStartedTrial: false,
      }),
    ).toBe(3)

    expect(
      getMaxAllowedOnboardingStep({
        hasOrganization: true,
        hasSelectedPlan: true,
        legalStatus: 'accepted',
        hasStartedTrial: true,
      }),
    ).toBe(5)
  })
})

describe('shouldDeferOnboardingStepGuard', () => {
  it('waits for organization state before demoting a direct legal-step visit', () => {
    expect(
      shouldDeferOnboardingStepGuard({
        currentStep: 2,
        legalStatus: 'loading',
        organizationState: 'loading',
      }),
    ).toBe(true)
  })

  it('waits for organization state before demoting a checkout return step', () => {
    expect(
      shouldDeferOnboardingStepGuard({
        currentStep: 4,
        checkout: 'success',
        legalStatus: 'loading',
        organizationState: 'loading',
      }),
    ).toBe(true)
  })

  it('does not keep deferring once organization state is resolved for the legal step', () => {
    expect(
      shouldDeferOnboardingStepGuard({
        currentStep: 2,
        legalStatus: 'none',
        organizationState: 'ready',
      }),
    ).toBe(false)
  })

  it('still waits on legal status before allowing checkout and later steps', () => {
    expect(
      shouldDeferOnboardingStepGuard({
        currentStep: 3,
        legalStatus: 'loading',
        organizationState: 'ready',
      }),
    ).toBe(true)
  })
})

describe('isBillingRecoveryPath', () => {
  it('allows only the billing route during hard lock', () => {
    expect(isBillingRecoveryPath('/app/billing')).toBe(true)
    expect(isBillingRecoveryPath('/app/dashboard')).toBe(false)
  })
})
