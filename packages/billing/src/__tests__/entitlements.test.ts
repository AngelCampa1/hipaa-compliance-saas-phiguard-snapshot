import { describe, expect, it } from 'vitest'
import { resolveCommercialState } from '../entitlements.js'

describe('resolveCommercialState', () => {
  it('requires plan selection for newly created organizations', () => {
    expect(
      resolveCommercialState({
        plan: 'essentials',
        planStatus: 'selection_required',
      }),
    ).toMatchObject({
      requiresPlanSelection: true,
      selectedPlan: null,
      hasProductAccess: false,
    })
  })

  it('treats trial_pending orgs as selected but not yet active', () => {
    expect(
      resolveCommercialState({
        plan: 'clinic',
        planStatus: 'trial_pending',
      }),
    ).toMatchObject({
      requiresTrialStart: true,
      selectedPlan: 'clinic',
      hasProductAccess: false,
    })
  })

  it('hard-locks expired unpaid trials with no Stripe state', () => {
    expect(
      resolveCommercialState({
        plan: 'clinic',
        planStatus: 'trialing',
        trialEndsAt: '2026-05-01T12:00:00.000Z',
        now: new Date('2026-05-02T00:00:00.000Z'),
      }),
    ).toMatchObject({
      isExpiredTrialWithoutBilling: true,
      isHardLocked: true,
      hasProductAccess: false,
    })
  })

  it('keeps paid subscriptions available even when past_due', () => {
    expect(
      resolveCommercialState({
        plan: 'group',
        planStatus: 'past_due',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      }),
    ).toMatchObject({
      isHardLocked: false,
      hasProductAccess: true,
    })
  })

  it('resolves Compliance Ops as a selected commercial plan', () => {
    expect(
      resolveCommercialState({
        plan: 'compliance_ops',
        planStatus: 'active',
      }),
    ).toMatchObject({
      selectedPlan: 'compliance_ops',
      selectedPlanDetails: {
        id: 'compliance_ops',
        name: 'Compliance Ops',
      },
      hasProductAccess: true,
    })
  })
})
