import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./stripe.js', () => ({
  getStripe: vi.fn(),
}))

import { getStripe } from './stripe.js'
import { createCheckoutSession } from './checkout.js'
import { clearPromotionPhaseCache } from './promotion-phase.js'

const mockCreate = vi.fn().mockResolvedValue({
  id: 'cs_test',
  url: 'https://checkout.stripe.com/test',
})

const mockRetrieveCoupon = vi.fn()

const mockStripe = {
  checkout: {
    sessions: {
      create: mockCreate,
    },
  },
  coupons: {
    retrieve: mockRetrieveCoupon,
  },
}

function makeCoupon(timesRedeemed: number) {
  return { times_redeemed: timesRedeemed }
}

beforeEach(() => {
  vi.clearAllMocks()
  clearPromotionPhaseCache()
  vi.mocked(getStripe).mockReturnValue(mockStripe as never)
  process.env.STRIPE_PRICE_ESSENTIALS_ANNUAL = 'price_test_essentials_annual'
  process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY = 'price_test_essentials_monthly'
  process.env.STRIPE_PRICE_ESSENTIALS = 'price_test_essentials_legacy'
  process.env.STRIPE_PRICE_CLINIC_ANNUAL = 'price_test_clinic_annual'
  process.env.STRIPE_PRICE_CLINIC_MONTHLY = 'price_test_clinic_monthly'
  process.env.STRIPE_PRICE_CLINIC = 'price_test_clinic_legacy'
  process.env.STRIPE_PRICE_GROUP_ANNUAL = 'price_test_group_annual'
  process.env.STRIPE_PRICE_GROUP_MONTHLY = 'price_test_group_monthly'
  process.env.STRIPE_PRICE_GROUP = 'price_test_group_legacy'
  process.env.STRIPE_M80OFF_COUPON_ID = 'coupon_m80off'
  process.env.STRIPE_Y80OFF_COUPON_ID = 'coupon_y80off'
  // Default: limited offer coupons have capacity.
  mockRetrieveCoupon.mockImplementation((id: string) => {
    if (id === 'coupon_m80off') return Promise.resolve(makeCoupon(0))
    if (id === 'coupon_y80off') return Promise.resolve(makeCoupon(0))
    return Promise.resolve(makeCoupon(0))
  })
})

describe('createCheckoutSession - HIPAA no-PHI guarantee', () => {
  it('sends only orgId and plan in session metadata with trial-preserving checkout fields when requested', async () => {
    const trialEndAt = new Date('2026-05-16T12:00:00.000Z')
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'essentials',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      customerEmail: 'admin@clinic.com',
      trialEndAt,
    })

    expect(mockCreate).toHaveBeenCalled()
    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.metadata).toEqual({ orgId: 'org-123', plan: 'essentials', billingCadence: 'annual' })
    expect(callArgs.metadata).not.toHaveProperty('email')
    expect(callArgs.metadata).not.toHaveProperty('name')
    expect(callArgs.metadata).not.toHaveProperty('dob')
    expect(callArgs.metadata).not.toHaveProperty('ssn')
    expect(callArgs.metadata).not.toHaveProperty('phone')

    expect(callArgs.subscription_data.metadata).toEqual({ orgId: 'org-123', plan: 'essentials', billingCadence: 'annual' })
    expect(callArgs.subscription_data.trial_end).toBe(Math.floor(trialEndAt.getTime() / 1000))
    expect(callArgs.subscription_data.trial_settings).toEqual({
      end_behavior: {
        missing_payment_method: 'pause',
      },
    })
  })

  it('omits trial checkout fields for standard billing checkout', async () => {
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
    })

    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.subscription_data.trial_end).toBeUndefined()
    expect(callArgs.subscription_data.trial_settings).toBeUndefined()
  })

  it('defaults checkout to annual pricing and auto-applies the yearly limited offer', async () => {
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      now: new Date('2026-05-02T00:00:00.000Z'),
    })

    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.line_items).toEqual([{ price: 'price_test_clinic_annual', quantity: 1 }])
    expect(callArgs.discounts).toEqual([{ coupon: 'coupon_y80off' }])
    expect(callArgs.metadata).toEqual({ orgId: 'org-123', plan: 'clinic', billingCadence: 'annual' })
  })

  it('throws when the active limited offer coupon env var is not configured', async () => {
    // Delete ALL coupon IDs so resolvePromotionPhaseState throws and the fallback
    // to the annual offer still finds the coupon ID missing in checkout.
    delete process.env.STRIPE_M80OFF_COUPON_ID
    delete process.env.STRIPE_Y80OFF_COUPON_ID

    await expect(
      createCheckoutSession({
        orgId: 'org-123',
        planId: 'clinic',
        successUrl: 'https://app.phiguard.app/success',
        cancelUrl: 'https://app.phiguard.app/cancel',
        now: new Date('2026-05-02T00:00:00.000Z'),
      }),
    ).rejects.toThrow('Stripe Coupon ID not configured for promotion Y80OFF')

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('uses monthly pricing when requested', async () => {
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      billingCadence: 'monthly',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      now: new Date('2026-06-01T00:00:00.000Z'),
    })

    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.line_items).toEqual([{ price: 'price_test_clinic_monthly', quantity: 1 }])
    expect(callArgs.discounts).toEqual([{ coupon: 'coupon_m80off' }])
  })

  it('starts monthly M80OFF billing without a trial so the 12 discounted months are paid months', async () => {
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      billingCadence: 'monthly',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      trialEndAt: new Date('2026-06-30T00:00:00.000Z'),
    })

    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.discounts).toEqual([{ coupon: 'coupon_m80off' }])
    expect(callArgs.subscription_data.trial_end).toBeUndefined()
    expect(callArgs.subscription_data.trial_settings).toBeUndefined()
  })

  it('falls back to legacy public plan price env vars for monthly checkout', async () => {
    delete process.env.STRIPE_PRICE_CLINIC_MONTHLY

    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      billingCadence: 'monthly',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      now: new Date('2026-06-01T00:00:00.000Z'),
    })

    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.line_items).toEqual([{ price: 'price_test_clinic_legacy', quantity: 1 }])
    expect(callArgs.metadata).toEqual({ orgId: 'org-123', plan: 'clinic', billingCadence: 'monthly' })
  })

  it('reuses the existing Stripe customer for repeat checkout flows', async () => {
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      customerId: 'cus_existing',
      customerEmail: 'admin@clinic.com',
    })

    const callArgs = mockCreate.mock.calls[0][0]

    expect(callArgs.customer).toBe('cus_existing')
    expect(callArgs.customer_email).toBeUndefined()
  })

  it('throws if the Stripe price env var is not configured', async () => {
    delete process.env.STRIPE_PRICE_ESSENTIALS_ANNUAL
    await expect(
      createCheckoutSession({ orgId: 'org-123', planId: 'essentials', successUrl: 'x', cancelUrl: 'y' }),
    ).rejects.toThrow('not configured')
  })

  it('refuses to create a duplicate checkout session when the org already has a current subscription', async () => {
    await expect(
      createCheckoutSession({
        orgId: 'org-123',
        planId: 'clinic',
        successUrl: 'https://app.phiguard.app/success',
        cancelUrl: 'https://app.phiguard.app/cancel',
        currentSubscriptionId: 'sub_existing',
      }),
    ).rejects.toThrow('already has a current subscription')

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('uses a deterministic Stripe idempotency key for identical checkout requests', async () => {
    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      customerEmail: 'admin@clinic.com',
      trialEndAt: new Date('2026-05-16T12:00:00.000Z'),
    })

    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      customerEmail: 'admin@clinic.com',
      trialEndAt: new Date('2026-05-16T12:00:00.000Z'),
    })

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        idempotencyKey: expect.any(String),
      }),
    )
    expect(mockCreate.mock.calls[0][1]).toEqual(mockCreate.mock.calls[1][1])
  })

  it('keeps Stripe idempotency keys stable because the limited offer has no public expiry', async () => {
    const checkoutInput = {
      orgId: 'org-123',
      planId: 'clinic' as const,
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
      customerEmail: 'admin@clinic.com',
    }

    await createCheckoutSession({
      ...checkoutInput,
      now: new Date('2026-05-02T00:00:00.000Z'),
    })

    await createCheckoutSession({
      ...checkoutInput,
      now: new Date('2026-06-01T00:00:00.000Z'),
    })

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate.mock.calls[0][1].idempotencyKey).toBe(mockCreate.mock.calls[1][1].idempotencyKey)
  })

  it('does not use another cadence coupon when the monthly coupon is exhausted', async () => {
    mockRetrieveCoupon.mockImplementation((id: string) => {
      if (id === 'coupon_m80off') return Promise.resolve(makeCoupon(100))
      if (id === 'coupon_y80off') return Promise.resolve(makeCoupon(0))
      return Promise.resolve(makeCoupon(0))
    })

    await createCheckoutSession({
      orgId: 'org-123',
      planId: 'clinic',
      billingCadence: 'monthly',
      successUrl: 'https://app.phiguard.app/success',
      cancelUrl: 'https://app.phiguard.app/cancel',
    })

    const callArgs = mockCreate.mock.calls[0][0]
    expect(callArgs.discounts).toBeUndefined()
  })
})
