import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSession } from '../lib/session.js'

const {
  getDbMock,
  getSessionFnMock,
  createCheckoutSessionMock,
  createPortalSessionMock,
  getLegalStatusMock,
  hasSavedPaymentMethodMock,
  resolveActiveLocationAccessMock,
  sendTrialStartedEmailMock,
  getUsedFeaturesMock,
  writeAuditEventMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  createCheckoutSessionMock: vi.fn(),
  createPortalSessionMock: vi.fn(),
  getLegalStatusMock: vi.fn(),
  hasSavedPaymentMethodMock: vi.fn(),
  resolveActiveLocationAccessMock: vi.fn(),
  sendTrialStartedEmailMock: vi.fn(),
  getUsedFeaturesMock: vi.fn().mockResolvedValue([]),
  writeAuditEventMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((fn) => fn),
  })),
}))

vi.mock('@phiguard/billing/checkout', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/billing/checkout')>('@phiguard/billing/checkout')
  return {
    ...actual,
    createCheckoutSession: createCheckoutSessionMock,
  }
})

vi.mock('@phiguard/billing/portal', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/billing/portal')>('@phiguard/billing/portal')
  return {
    ...actual,
    createPortalSession: createPortalSessionMock,
  }
})

vi.mock('@phiguard/billing/customers', () => ({
  hasSavedPaymentMethod: hasSavedPaymentMethodMock,
}))

vi.mock('@phiguard/billing', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/billing')>('@phiguard/billing')
  return {
    ...actual,
    getUsedFeatures: getUsedFeaturesMock,
  }
})

vi.mock('@phiguard/email', () => ({
  sendTrialStartedEmail: sendTrialStartedEmailMock,
}))

vi.mock('@phiguard/baa', () => ({
  BaaService: vi.fn().mockImplementation(() => ({
    getLegalStatus: getLegalStatusMock,
  })),
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('./access.js', () => ({
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}))

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: writeAuditEventMock,
}))

import {
  createCheckoutSessionFn,
  createPortalSessionFn,
  formatOrgBilling,
  getOrgBilling,
  selectPlanFn,
  startTrialFn,
} from './billing.js'

describe('billing server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.APP_URL = 'https://app.phiguard.test'
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1', 'org_admin'))
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org-1', 'org_admin'))
    getLegalStatusMock.mockResolvedValue({
      terms: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
      baa: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
    })
    hasSavedPaymentMethodMock.mockResolvedValue(true)
  })

  it('blocks checkout when the active organization has not completed legal acceptance', async () => {
    getDbMock.mockReturnValue(makeOrgDb({ baaSignedAt: null, termsAcceptedAt: null }))

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'clinic' },
      }),
    ).rejects.toThrow('Legal acceptance must be completed before completing checkout')

    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('sends onboarding return URLs that resume after successful checkout', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        planStatus: 'trialing',
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await createCheckoutSessionFn({
      data: { planId: 'clinic' },
    })

    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
        planId: 'clinic',
        billingCadence: 'annual',
        successUrl: 'https://app.phiguard.test/app/billing?checkout=success',
        cancelUrl: 'https://app.phiguard.test/app/billing?checkout=cancelled',
        customerEmail: 'user@example.com',
        trialEndAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'billing.checkout_started',
        resourceType: 'organization',
        resourceId: 'org-1',
      }),
    )
  })

  it('keeps Compliance Ops out of self-serve checkout selection', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trialing',
    })
    getDbMock.mockReturnValue(db)
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'compliance_ops' as never, billingCadence: 'monthly' },
      }),
    ).rejects.toThrow('Compliance Ops is available through a custom path')

    expect(db.updateSetMock).not.toHaveBeenCalled()
    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('stores the new selected plan list price before returning the checkout url', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trialing',
    })
    getDbMock.mockReturnValue(db)
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await createCheckoutSessionFn({
      data: { planId: 'group' },
    })

    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'group',
        maxMembers: 100,
        billingPriceMonthlyCents: 46900,
      }),
    )
  })

  it('reuses the stored Stripe customer for repeat checkout instead of creating a duplicate customer', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        stripeCustomerId: 'cus_existing',
        stripeSubscriptionId: null,
      }),
    )
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await createCheckoutSessionFn({
      data: { planId: 'clinic' },
    })

    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'cus_existing',
        customerEmail: 'user@example.com',
        trialEndAt: undefined,
      }),
    )
  })

  it('creates checkout for the resolved organization when the session active organization is stale', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-stale', 'org_admin'))
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org-1', 'org_admin'))
    getDbMock.mockReturnValue(
      makeOrgDb({
        planStatus: 'trialing',
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      }),
    )
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await createCheckoutSessionFn({
      data: { planId: 'clinic' },
    })

    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
      }),
    )
  })

  it('falls back to essentials when stored plan data is stale and no checkout plan is supplied', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        plan: 'legacy_plan',
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        planStatus: 'trialing',
      }),
    )
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await createCheckoutSessionFn({
      data: {},
    })

    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'essentials',
      }),
    )
  })

  it('stores the selected plan before returning the checkout url', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trialing',
    })
    getDbMock.mockReturnValue(db)
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await createCheckoutSessionFn({
      data: { planId: 'group' },
    })

    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'group',
        maxMembers: 100,
        billingPriceMonthlyCents: 46900,
      }),
    )
  })

  it('does not create a checkout session when storing the selected plan is stale', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trialing',
    })
    db.updateReturningMock.mockResolvedValueOnce([])
    getDbMock.mockReturnValue(db)
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://stripe.test/session' })

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'group' },
      }),
    ).rejects.toThrow('Organization billing state changed before checkout could be created')

    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('blocks checkout when the org already has a current subscription', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        stripeCustomerId: 'cus_existing',
        stripeSubscriptionId: 'sub_existing',
      }),
    )

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'clinic' },
      }),
    ).rejects.toThrow('already has a current subscription')

    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('blocks checkout before the trial has started', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        planStatus: 'trial_pending',
      }),
    )

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'clinic' },
      }),
    ).rejects.toThrow('Start the trial before collecting billing details')

    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('blocks checkout when the accepted legal version is stale', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      }),
    )
    getLegalStatusMock.mockResolvedValue({
      terms: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: false },
      baa: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
    })

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'clinic' },
      }),
    ).rejects.toThrow('Legal acceptance must be completed before completing checkout')

    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('blocks checkout for non-admin members', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1', 'location_staff'))
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org-1', 'location_staff'))

    await expect(
      createCheckoutSessionFn({
        data: { planId: 'clinic' },
      }),
    ).rejects.toThrow('Forbidden: admin access required')

    expect(resolveActiveLocationAccessMock).toHaveBeenCalled()
    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('blocks portal access for non-admin members', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1', 'location_staff'))
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org-1', 'location_staff'))

    await expect(createPortalSessionFn()).rejects.toThrow('Forbidden: admin access required')

    expect(resolveActiveLocationAccessMock).toHaveBeenCalled()
    expect(createPortalSessionMock).not.toHaveBeenCalled()
  })

  it('creates a portal session for admins with a saved Stripe customer', async () => {
    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        stripeCustomerId: 'cus_123',
      }),
    )
    createPortalSessionMock.mockResolvedValue({ url: 'https://stripe.test/portal' })

    await createPortalSessionFn()

    expect(createPortalSessionMock).toHaveBeenCalledWith('cus_123', 'https://app.phiguard.test/app/billing')
  })

  it('returns safe billing metadata without exposing the Stripe customer ID', () => {
    const result = formatOrgBilling(
      {
        id: 'org-1',
        name: 'Test Org',
        plan: 'essentials',
        planStatus: 'trialing',
        planSelectedAt: new Date('2026-04-01T11:00:00.000Z'),
        billingPriceMonthlyCents: 9900,
        trialStartedAt: new Date('2026-04-01T12:00:00.000Z'),
        trialEndsAt: new Date('2026-05-01T12:00:00.000Z'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        maxMembers: 10,
      },
      true,
    )

    expect(result).toEqual(
      expect.objectContaining({
        id: 'org-1',
        name: 'Test Org',
        plan: 'essentials',
        planStatus: 'trialing',
        hasBillingCustomer: true,
        hasBillingSubscription: true,
        hasPaymentMethodOnFile: false,
        canManageBilling: true,
        planSelectedAt: '2026-04-01T11:00:00.000Z',
        trialStartedAt: '2026-04-01T12:00:00.000Z',
        trialEndsAt: '2026-05-01T12:00:00.000Z',
        baaSignedAt: '2026-04-16T12:00:00.000Z',
        termsAcceptedAt: '2026-04-16T12:00:00.000Z',
      }),
    )
    expect(result).not.toHaveProperty('stripeCustomerId')
  })

  it('falls back to no payment method when Stripe lookup fails', async () => {
    hasSavedPaymentMethodMock.mockRejectedValueOnce(new Error('stripe unavailable'))

    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      }),
    )

    const { getOrgBilling } = await import('./billing.js')
    const result = await getOrgBilling()

    expect(result).toEqual(
      expect.objectContaining({
        hasBillingCustomer: true,
        hasBillingSubscription: true,
        hasPaymentMethodOnFile: false,
      }),
    )
  })

  it('selects a plan and moves the org into trial_pending', async () => {
    const db = makeOrgDb({ planStatus: 'selection_required' })
    getDbMock.mockReturnValue(db)

    await selectPlanFn({
      data: { planId: 'clinic' },
    })

    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'clinic',
        planStatus: 'trial_pending',
        maxMembers: 30,
        billingPriceMonthlyCents: 22900,
      }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'billing.plan_selected',
        resourceType: 'organization',
        resourceId: 'org-1',
      }),
    )
  })

  it('keeps Compliance Ops out of self-serve plan selection', async () => {
    const db = makeOrgDb({ planStatus: 'selection_required' })
    getDbMock.mockReturnValue(db)

    await expect(
      selectPlanFn({
        data: { planId: 'compliance_ops' as never },
      }),
    ).rejects.toThrow('Compliance Ops is available through a custom path')

    expect(db.updateSetMock).not.toHaveBeenCalled()
  })

  it('uses the new annual offer amount in trial-start email', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trial_pending',
      planSelectedAt: new Date('2026-04-16T12:00:00.000Z'),
    })
    getDbMock.mockReturnValue(db)

    await startTrialFn()

    expect(sendTrialStartedEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        planName: 'Essentials',
        priceMonthly: 30,
      }),
    )
  })

  it('allows plan reselection during trial without resetting plan status', async () => {
    const db = makeOrgDb({ planStatus: 'trialing' })
    getDbMock.mockReturnValue(db)

    await selectPlanFn({
      data: { planId: 'group' },
    })

    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ planStatus: 'trial_pending' }),
    )
    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'group',
        maxMembers: 100,
      }),
    )
  })

  it('does not save plan selection when billing state changes before update', async () => {
    const db = makeOrgDb({ planStatus: 'selection_required' })
    db.updateReturningMock.mockResolvedValueOnce([])
    getDbMock.mockReturnValue(db)

    await expect(
      selectPlanFn({
        data: { planId: 'clinic' },
      }),
    ).rejects.toThrow('Organization billing state changed before plan selection could be saved')
  })

  it('starts the trial without creating Stripe state', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trial_pending',
      planSelectedAt: new Date('2026-04-16T12:00:00.000Z'),
    })
    getDbMock.mockReturnValue(db)

    await startTrialFn()

    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        planStatus: 'trialing',
        trialStartedAt: expect.any(Date),
        trialEndsAt: expect.any(Date),
      }),
    )
    expect(sendTrialStartedEmailMock).toHaveBeenCalledOnce()
    expect(sendTrialStartedEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        planName: 'Essentials',
        // Limited offer price (auto-applied at checkout), not the list $149.
        priceMonthly: 30,
      }),
    )
    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'billing.trial_started',
        resourceType: 'organization',
        resourceId: 'org-1',
      }),
    )
  })

  it('starts the trial even when no plan was pre-selected', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trial_pending',
      planSelectedAt: null,
    })
    getDbMock.mockReturnValue(db)

    await startTrialFn()

    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        planStatus: 'trialing',
      }),
    )
  })

  it('starts the trial directly from selection_required so a plan can be chosen later', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'selection_required',
      planSelectedAt: null,
    })
    getDbMock.mockReturnValue(db)

    const result = await startTrialFn()

    expect(result.planStatus).toBe('trialing')
    expect(db.updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        planStatus: 'trialing',
        trialStartedAt: expect.any(Date),
        trialEndsAt: expect.any(Date),
      }),
    )
    expect(createCheckoutSessionMock).not.toHaveBeenCalled()
  })

  it('uses resolved access role when reporting whether billing can be managed', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-stale', 'org_admin'))
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org-1', 'auditor'))
    getDbMock.mockReturnValue(
      makeOrgDb({
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      }),
    )

    const result = await getOrgBilling()

    expect(result).toEqual(
      expect.objectContaining({
        id: 'org-1',
        canManageBilling: false,
      }),
    )
  })

  it('does not send a trial-start email when the trial update is stale', async () => {
    const db = makeOrgDb({
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      planStatus: 'trial_pending',
      planSelectedAt: new Date('2026-04-16T12:00:00.000Z'),
    })
    db.updateReturningMock.mockResolvedValueOnce([])
    getDbMock.mockReturnValue(db)

    await expect(startTrialFn()).rejects.toThrow(
      'Organization billing state changed before the trial could be started',
    )

    expect(sendTrialStartedEmailMock).not.toHaveBeenCalled()
  })
})

function makeOrgDb(org: Partial<{
  baaSignedAt: Date | null
  termsAcceptedAt: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  plan: string | null
  planStatus: 'selection_required' | 'trial_pending' | 'trialing' | 'active' | 'paused' | 'past_due' | 'canceled'
  planSelectedAt: Date | null
  trialEndsAt: Date | null
}>) {
  const updateReturningMock = vi.fn().mockResolvedValue([
    {
      id: 'org-1',
      plan: 'clinic',
      planStatus: 'trial_pending',
      maxMembers: 30,
      billingPriceMonthlyCents: 24900,
    },
  ])
  const updateWhereMock = vi.fn().mockReturnValue({
    returning: updateReturningMock,
  })
  const updateSetMock = vi.fn().mockReturnValue({
    where: updateWhereMock,
  })
  const updateMock = vi.fn().mockReturnValue({
    set: updateSetMock,
  })

  // transaction references db by closure so it must be declared before assignment.
  const db: {
    select: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
    updateSetMock: ReturnType<typeof vi.fn>
    updateReturningMock: ReturnType<typeof vi.fn>
  } = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              baaSignedAt: org.baaSignedAt ?? null,
              termsAcceptedAt: org.termsAcceptedAt ?? null,
              stripeCustomerId: org.stripeCustomerId ?? null,
              stripeSubscriptionId: org.stripeSubscriptionId ?? null,
              id: 'org-1',
              name: 'Test Org',
              plan: org.plan === undefined ? 'essentials' : org.plan,
              planStatus: org.planStatus ?? 'trialing',
              planSelectedAt: org.planSelectedAt === undefined ? new Date('2026-04-01T11:00:00.000Z') : org.planSelectedAt,
              billingPriceMonthlyCents: 9900,
              trialStartedAt: null,
              trialEndsAt: org.trialEndsAt ?? null,
              maxMembers: 10,
            },
          ]),
        }),
      }),
    }),
    update: updateMock,
    // transaction executes the callback immediately, passing this db as the tx.
    // writeAuditEvent is called on the tx handle but is mocked at module level.
    transaction: vi.fn((cb: (tx: unknown) => Promise<unknown>) => cb(db)),
    updateSetMock,
    updateReturningMock,
  }
  return db
}

function makeSession(
  userId: string,
  organizationId: string,
  role: 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor' = 'org_admin',
): AppSession {
  return {
    user: {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: 'session-id',
      token: 'session-token',
      userId,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      activeOrganizationId: organizationId,
    },
    organization: {
      role,
    },
  } as AppSession
}

function makeAccess(
  organizationId: string,
  role: 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor',
) {
  return {
    userId: 'user-1',
    organizationId,
    role,
    commercial: {
      plan: 'clinic',
      planStatus: 'trialing',
      trialEndsAt: null,
    },
  }
}
