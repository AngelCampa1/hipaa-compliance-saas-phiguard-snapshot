import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleStripeWebhook } from './webhook.js'

const { baaGetLegalStatusMock } = vi.hoisted(() => ({
  baaGetLegalStatusMock: vi.fn(),
}))

vi.mock('./stripe.js', () => ({
  getStripe: vi.fn(),
}))

vi.mock('./customers.js', () => ({
  hasSavedPaymentMethod: vi.fn(),
}))

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@phiguard/email', () => ({
  sendTrialStartedEmail: vi.fn().mockResolvedValue(undefined),
  sendTrialEndingSoonEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@phiguard/baa', () => ({
  BaaService: vi.fn(() => ({
    getLegalStatus: baaGetLegalStatusMock,
  })),
}))

vi.mock('./analytics.js', () => ({
  captureBillingAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@phiguard/db', () => ({
  organizations: { id: 'id', stripeSubscriptionId: 'stripe_subscription_id' },
  referrals: {
    id: 'id',
    partnerId: 'partner_id',
    organizationId: 'org_id',
    lifetimeValueCents: 'ltv',
    firstPaidAt: 'first_paid_at',
  },
  referralRevenueEvents: {
    id: 'id',
  },
  processedStripeEvents: { id: 'id' },
}))

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...conditions: unknown[]) => ({ conditions })),
  eq: vi.fn((col, val) => ({ col, val })),
  isNull: vi.fn((col) => ({ isNull: col })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    sql: strings.join('?'),
    values,
  })),
}))

import { getStripe } from './stripe.js'
import { writeAuditEvent } from '@phiguard/audit'
import { sendTrialEndingSoonEmail, sendTrialStartedEmail } from '@phiguard/email'
import { hasSavedPaymentMethod } from './customers.js'
import { captureBillingAnalyticsEvent } from './analytics.js'

type MockOrgRow = {
  id: string
  plan: string
  planStatus: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  maxMembers?: number | null
  billingPriceMonthlyCents?: number | null
  baaSignedAt?: Date | null
  termsAcceptedAt?: Date | null
  trialStartedAt?: Date | null
  trialEndsAt?: Date | null
}

const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
    cancel: vi.fn(),
  },
  customers: {
    retrieve: vi.fn(),
  },
}

function makeMockDb(
  orgRow: Partial<MockOrgRow> = {},
  organizationUpdateRows: Array<Record<string, unknown>> = [{ id: 'org-123' }],
) {
  const resolvedOrgRow: MockOrgRow = {
    id: 'org-123',
    plan: 'essentials',
    planStatus: 'trialing',
    baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
    termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
    trialStartedAt: null,
    trialEndsAt: null,
    ...orgRow,
  }

  const updateReturning = vi.fn().mockResolvedValue(organizationUpdateRows)
  const updateWhere = vi.fn().mockReturnValue({
    returning: updateReturning,
  })
  const updateSet = vi.fn().mockReturnValue({
    where: updateWhere,
  })
  const updateChain = {
    set: updateSet,
  }
  const selectLimit = vi.fn().mockResolvedValue([resolvedOrgRow])
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  const selectChain = {
    from: selectFrom,
  }

  const insertValues = vi.fn().mockResolvedValue(undefined)
  const insertChain = { values: insertValues }
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteChain = {
    where: deleteWhere,
  }

  return {
    select: vi.fn().mockReturnValue(selectChain),
    update: vi.fn().mockReturnValue(updateChain),
    insert: vi.fn().mockReturnValue(insertChain),
    delete: vi.fn().mockReturnValue(deleteChain),
    selectChain,
    updateChain,
    insertChain,
    deleteChain,
    updateReturning,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getStripe).mockReturnValue(mockStripe as never)
  vi.mocked(hasSavedPaymentMethod).mockResolvedValue(false)
  baaGetLegalStatusMock.mockResolvedValue({
    terms: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
    baa: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
  })
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  process.env.APP_URL = 'https://app.phiguard.test'
  process.env.STRIPE_PRICE_ESSENTIALS = 'price_test_essentials'
  process.env.STRIPE_PRICE_CLINIC = 'price_test_clinic'
  process.env.STRIPE_PRICE_GROUP = 'price_test_group'
  process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY = 'price_test_essentials_monthly'
  process.env.STRIPE_PRICE_CLINIC_MONTHLY = 'price_test_clinic_monthly'
  process.env.STRIPE_PRICE_GROUP_MONTHLY = 'price_test_group_monthly'
  process.env.STRIPE_PRICE_ESSENTIALS_ANNUAL = 'price_test_essentials_annual'
  process.env.STRIPE_PRICE_CLINIC_ANNUAL = 'price_test_clinic_annual'
  process.env.STRIPE_PRICE_GROUP_ANNUAL = 'price_test_group_annual'
})

describe('handleStripeWebhook', () => {
  it('throws on invalid Stripe signature', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })
    const db = makeMockDb()
    await expect(handleStripeWebhook('body', 'bad-sig', db as never)).rejects.toThrow(
      'Invalid Stripe signature',
    )
  })

  it('ignores events without orgId metadata', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: {} } },
    })
    const db = makeMockDb()
    await handleStripeWebhook('body', 'sig', db as never)
    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('updates org, stores trial dates, and sends the start email on checkout.session.completed', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })

    const db = makeMockDb()
    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        maxMembers: 30,
        plan: 'clinic',
        planStatus: 'trialing',
        billingPriceMonthlyCents: 22900,
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
      }),
    )
    expect(sendTrialStartedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'owner@clinic.test',
        planName: 'Clinic',
        priceMonthly: 38,
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.subscription.started',
      }),
    )
    expect(captureBillingAnalyticsEvent).toHaveBeenCalledWith('checkout_completed', {
      organization_id: 'org-123',
      plan: 'clinic',
      plan_status: 'trialing',
      billing_cadence: 'annual',
      amount_cents: 22900,
      currency: 'usd',
    })
    expect(captureBillingAnalyticsEvent).not.toHaveBeenCalledWith(
      'subscription_started',
      expect.anything(),
    )
  })

  it('persists checkout billing state and audit in the same database transaction', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })

    const db = makeMockDb()
    const tx = makeMockDb()
    const transaction = vi.fn(async (fn: (tx: typeof db) => Promise<void>) => fn(tx))
    const dbWithTransaction = Object.assign(db, { transaction })

    await handleStripeWebhook('body', 'sig', dbWithTransaction as never)

    expect(transaction).toHaveBeenCalledOnce()
    expect(db.update).not.toHaveBeenCalled()
    expect(tx.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'clinic',
        planStatus: 'trialing',
        stripeCustomerId: 'cus_abc',
        stripeSubscriptionId: 'sub_xyz',
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'billing.subscription.started',
      }),
    )
  })

  it('rejects checkout activation when the organization update no longer matches a row', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_stale_org',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })

    const db = makeMockDb({}, [])

    await expect(handleStripeWebhook('body', 'sig', db as never)).rejects.toThrow(
      'Organization not found',
    )

    expect(db.updateReturning).toHaveBeenCalledWith({ id: 'id' })
    expect(writeAuditEvent).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'billing.subscription.started' }),
    )
    expect(captureBillingAnalyticsEvent).not.toHaveBeenCalled()
    expect(db.delete).toHaveBeenCalled()
  })

  it('stores the customer id when checkout.session.completed includes an expanded customer object', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: { id: 'cus_expanded' },
          subscription: { id: 'sub_expanded' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_expanded',
      trial_start: null,
      trial_end: null,
    })

    const db = makeMockDb()

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeCustomerId: 'cus_expanded',
        stripeSubscriptionId: 'sub_expanded',
        plan: 'clinic',
        planStatus: 'active',
      }),
    )
  })

  it('records Stripe identifiers without activating a paid plan when legal acceptance is missing', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'trialing',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      maxMembers: 10,
      billingPriceMonthlyCents: 9900,
      baaSignedAt: null,
      termsAcceptedAt: null,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith({
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_xyz',
    })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.subscription.activation_blocked',
      }),
    )
  })

  it('ignores checkout completion when the metadata organization no longer exists', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-missing', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
        },
      },
    })

    const selectLimit = vi.fn().mockResolvedValue([])
    const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: selectLimit,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not activate the subscription when legal versions roll after checkout started', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })
    baaGetLegalStatusMock.mockResolvedValue({
      terms: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: false },
      baa: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'trialing',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      maxMembers: 10,
      billingPriceMonthlyCents: 9900,
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith({
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_xyz',
    })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.subscription.activation_blocked',
        after: expect.objectContaining({ reason: 'missing_legal_acceptance' }),
      }),
    )
  })

  it('persists group plan limits from checkout metadata', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'group' },
          customer: 'cus_group',
          subscription: 'sub_group',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_group',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })

    const db = makeMockDb()
    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        maxMembers: 100,
        plan: 'group',
        billingPriceMonthlyCents: 46900,
      }),
    )
  })

  it('uses monthly cadence metadata for the checkout trial-start email price', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            orgId: 'org-123',
            plan: 'clinic',
            billingCadence: 'monthly',
          },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })

    const db = makeMockDb()
    await handleStripeWebhook('body', 'sig', db as never)

    expect(sendTrialStartedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        planName: 'Clinic',
        priceMonthly: 46,
      }),
    )
  })

  it('uses list pricing in checkout trial-start email when Stripe shows no discount', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic', billingCadence: 'annual' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
      discounts: [],
    })

    const db = makeMockDb()
    await handleStripeWebhook('body', 'sig', db as never)

    expect(sendTrialStartedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        priceMonthly: 229,
      }),
    )
  })

  it('persists Compliance Ops plan details from checkout metadata', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'compliance_ops' },
          customer: 'cus_compliance_ops',
          subscription: 'sub_compliance_ops',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      trial_start: 1776340800,
      trial_end: null,
    })

    const db = makeMockDb()
    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        maxMembers: 100,
        plan: 'compliance_ops',
        planStatus: 'active',
        billingPriceMonthlyCents: 167900,
      }),
    )
  })

  it('updates planStatus and trial dates on customer.subscription.updated', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'active',
          metadata: { orgId: 'org-123' },
          trial_start: 1776340800,
          trial_end: null,
        },
      },
    })
    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 22900,
      trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
      trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'clinic',
        planStatus: 'active',
        maxMembers: 30,
        billingPriceMonthlyCents: 22900,
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: null,
      }),
    )
    expect(captureBillingAnalyticsEvent).toHaveBeenCalledWith('subscription_started', {
      organization_id: 'org-123',
      plan: 'clinic',
      plan_status: 'active',
      amount_cents: 22900,
      currency: 'usd',
    })
  })

  it('recovers a legally blocked checkout on the next matching subscription update', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_blocked',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          items: {
            data: [{ price: { id: 'price_test_clinic' } }],
          },
          trial_start: null,
          trial_end: null,
        },
      },
    })
    const db = makeMockDb({
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'trialing',
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_blocked',
      billingPriceMonthlyCents: 9900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'clinic',
        planStatus: 'active',
        maxMembers: 30,
        billingPriceMonthlyCents: 22900,
      }),
    )
  })

  it('keeps a matching subscription update blocked while legal acceptance is stale', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_blocked',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          items: {
            data: [{ price: { id: 'price_test_clinic' } }],
          },
          trial_start: null,
          trial_end: null,
        },
      },
    })
    baaGetLegalStatusMock.mockResolvedValue({
      terms: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: false },
      baa: { acceptedAt: new Date('2026-04-16T12:00:00.000Z'), isCurrent: true },
    })
    const db = makeMockDb({
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'trialing',
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_blocked',
      billingPriceMonthlyCents: 9900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.subscription.activation_blocked',
        after: expect.objectContaining({
          reason: 'missing_legal_acceptance',
          attemptedPlan: 'clinic',
        }),
      }),
    )
  })

  it('maps Stripe paused subscriptions to paused billing state', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'paused',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_start: 1776340800,
          trial_end: null,
        },
      },
    })
    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 22900,
      trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
      trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        planStatus: 'paused',
        trialEndsAt: null,
      }),
    )
  })

  it('updates plan details on customer.subscription.updated when the subscription matches the org current subscription', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'group' },
          items: {
            data: [
              {
                price: { id: 'price_test_group' },
              },
            ],
          },
          trial_start: 1776340800,
          trial_end: 1778932800,
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 22900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'group',
        planStatus: 'active',
        maxMembers: 100,
        billingPriceMonthlyCents: 46900,
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
      }),
    )
  })

  it('uses the Stripe subscription item price to resolve plan details before falling back to metadata', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'group' },
          items: {
            data: [
              {
                price: { id: 'price_test_clinic' },
              },
            ],
          },
          trial_start: 1776340800,
          trial_end: null,
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'group',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 9900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'clinic',
        planStatus: 'active',
        maxMembers: 30,
        billingPriceMonthlyCents: 22900,
      }),
    )
  })

  it('uses public Stripe price ids to persist subscription plan details', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          items: {
            data: [
              {
                price: { id: 'price_test_group_annual' },
              },
            ],
          },
          trial_start: null,
          trial_end: null,
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 22900,
      trialStartedAt: null,
      trialEndsAt: null,
    })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'group',
        planStatus: 'active',
        maxMembers: 100,
        billingPriceMonthlyCents: 46900,
      }),
    )
  })

  it('ignores stale customer.subscription.updated events when the subscription does not match the org current subscription', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_stale',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_start: 1776340800,
          trial_end: null,
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 22900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('rejects matching subscription updates when the guarded organization update is stale', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_sub_update_stale_write',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'active',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_start: 1776340800,
          trial_end: null,
        },
      },
    })

    const db = makeMockDb(
      {
        id: 'org-123',
        plan: 'clinic',
        planStatus: 'trialing',
        stripeSubscriptionId: 'sub_live',
        billingPriceMonthlyCents: 22900,
        trialStartedAt: null,
        trialEndsAt: null,
      },
      [],
    )

    await expect(handleStripeWebhook('body', 'sig', db as never)).rejects.toThrow(
      'Organization not found',
    )

    expect(writeAuditEvent).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'billing.subscription.updated' }),
    )
    expect(captureBillingAnalyticsEvent).not.toHaveBeenCalled()
    expect(db.delete).toHaveBeenCalled()
  })

  it('sends a reminder email on customer.subscription.trial_will_end', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.trial_will_end',
      data: {
        object: {
          id: 'sub_trial',
          customer: 'cus_abc',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_end: 1778932800,
        },
      },
    })
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_abc',
      email: 'owner@clinic.test',
      deleted: false,
    })

    const db = makeMockDb({ stripeSubscriptionId: 'sub_trial' })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(sendTrialEndingSoonEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'owner@clinic.test',
        planName: 'Clinic',
        priceMonthly: 38,
        trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
        hasPaymentMethodOnFile: false,
      }),
    )
    expect(db.update).not.toHaveBeenCalled()
  })

  it('uses monthly cadence metadata for the trial-ending reminder email price', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.trial_will_end',
      data: {
        object: {
          id: 'sub_trial',
          customer: 'cus_abc',
          metadata: {
            orgId: 'org-123',
            plan: 'clinic',
            billingCadence: 'monthly',
          },
          trial_end: 1778932800,
        },
      },
    })
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_abc',
      email: 'owner@clinic.test',
      deleted: false,
    })

    const db = makeMockDb({ stripeSubscriptionId: 'sub_trial' })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(sendTrialEndingSoonEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        planName: 'Clinic',
        priceMonthly: 46,
      }),
    )
  })

  it('uses list pricing in trial-ending reminder when Stripe shows no discount', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.trial_will_end',
      data: {
        object: {
          id: 'sub_trial',
          metadata: { orgId: 'org-123', plan: 'clinic', billingCadence: 'annual' },
          customer: 'cus_abc',
          trial_end: 1778932800,
          discounts: [],
        },
      },
    })
    mockStripe.customers.retrieve.mockResolvedValue({ id: 'cus_abc', email: 'owner@clinic.test' })
    const db = makeMockDb({ stripeSubscriptionId: 'sub_trial' })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(sendTrialEndingSoonEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        priceMonthly: 229,
      }),
    )
  })

  it('marks the reminder email as billing-ready when a payment method is already on file', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.trial_will_end',
      data: {
        object: {
          id: 'sub_trial',
          customer: 'cus_abc',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_end: 1778932800,
        },
      },
    })
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_abc',
      email: 'owner@clinic.test',
      deleted: false,
    })
    vi.mocked(hasSavedPaymentMethod).mockResolvedValue(true)

    const db = makeMockDb({ stripeSubscriptionId: 'sub_trial' })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(sendTrialEndingSoonEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'owner@clinic.test',
        hasPaymentMethodOnFile: true,
      }),
    )
  })

  it('ignores stale trial-ending reminders when the subscription is no longer current', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.trial_will_end',
      data: {
        object: {
          id: 'sub_stale',
          customer: 'cus_abc',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_end: 1778932800,
        },
      },
    })

    const db = makeMockDb({ stripeSubscriptionId: 'sub_live' })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(mockStripe.customers.retrieve).not.toHaveBeenCalled()
    expect(sendTrialEndingSoonEmail).not.toHaveBeenCalled()
  })

  it('skips duplicate checkout.session.completed deliveries when billing state is already applied', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_xyz',
      maxMembers: 30,
      billingPriceMonthlyCents: 22900,
      baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
      termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
      trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
    expect(sendTrialStartedEmail).not.toHaveBeenCalled()
    expect(captureBillingAnalyticsEvent).not.toHaveBeenCalled()
  })

  it('skips duplicate customer.subscription.updated deliveries when state is unchanged', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_live',
          status: 'past_due',
          metadata: { orgId: 'org-123', plan: 'clinic' },
          trial_start: null,
          trial_end: null,
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'past_due',
      stripeSubscriptionId: 'sub_live',
      maxMembers: 30,
      billingPriceMonthlyCents: 22900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('maps incomplete subscription states to past_due instead of trialing', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          status: 'incomplete',
          metadata: { orgId: 'org-123' },
          trial_start: null,
          trial_end: null,
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      billingPriceMonthlyCents: 22900,
      trialStartedAt: null,
      trialEndsAt: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        planStatus: 'past_due',
      }),
    )
  })

  it('skips duplicate invoice.payment_failed deliveries when the org is already past_due', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'sub_live',
          subscription_details: { metadata: { orgId: 'org-123' } },
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'past_due',
      stripeSubscriptionId: 'sub_live',
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('ignores stale invoice.payment_failed events when the subscription does not match the org current subscription', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'sub_stale',
          subscription_details: { metadata: { orgId: 'org-123' } },
        },
      },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'trialing',
      stripeSubscriptionId: 'sub_live',
      billingPriceMonthlyCents: 22900,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('skips duplicate customer.subscription.deleted deliveries when the org is already fully revoked', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_live', metadata: { orgId: 'org-123' } } },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'canceled',
      stripeSubscriptionId: null,
      maxMembers: 10,
      billingPriceMonthlyCents: null,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('ignores stale customer.subscription.deleted events when the subscription does not match the org current subscription', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_stale', metadata: { orgId: 'org-123' } } },
    })

    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'active',
      stripeSubscriptionId: 'sub_live',
      maxMembers: 30,
      billingPriceMonthlyCents: 22900,
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('sets planStatus to past_due on invoice.payment_failed', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'sub_live',
          subscription_details: { metadata: { orgId: 'org-123' } },
        },
      },
    })
    const db = makeMockDb({
      stripeSubscriptionId: 'sub_live',
    })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.payment.failed',
        after: expect.objectContaining({ planStatus: 'past_due' }),
      }),
    )
  })

  it('rejects payment-failed updates when the guarded organization update is stale', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_payment_failed_stale_write',
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'sub_live',
          subscription_details: { metadata: { orgId: 'org-123' } },
        },
      },
    })

    const db = makeMockDb(
      {
        id: 'org-123',
        plan: 'clinic',
        planStatus: 'active',
        stripeSubscriptionId: 'sub_live',
      },
      [],
    )

    await expect(handleStripeWebhook('body', 'sig', db as never)).rejects.toThrow(
      'Organization not found',
    )

    expect(writeAuditEvent).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'billing.payment.failed' }),
    )
    expect(captureBillingAnalyticsEvent).not.toHaveBeenCalled()
    expect(db.delete).toHaveBeenCalled()
  })

  it('revokes entitlements on customer.subscription.deleted', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_live', metadata: { orgId: 'org-123' } } },
    })
    const db = makeMockDb({
      id: 'org-123',
      plan: 'clinic',
      planStatus: 'active',
      stripeSubscriptionId: 'sub_live',
      maxMembers: 30,
      billingPriceMonthlyCents: 22900,
    })
    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).toHaveBeenCalled()
    expect(db.updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'essentials',
        planStatus: 'canceled',
        maxMembers: 10,
        billingPriceMonthlyCents: null,
        stripeSubscriptionId: null,
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.subscription.canceled',
        after: expect.objectContaining({
          plan: 'essentials',
          planStatus: 'canceled',
          maxMembers: 10,
          billingPriceMonthlyCents: null,
          stripeSubscriptionId: null,
        }),
      }),
    )
  })

  it('throws when STRIPE_WEBHOOK_SECRET is not set', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    const db = makeMockDb()
    await expect(handleStripeWebhook('body', 'sig', db as never)).rejects.toThrow(
      'STRIPE_WEBHOOK_SECRET not set',
    )
  })

  it('increments lifetimeValueCents on invoice.paid when referral exists', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_123',
          subscription: 'sub_live',
          subscription_details: { metadata: { orgId: 'org-123' } },
          amount_paid: 9900,
          status_transitions: { paid_at: 1777636800 },
        },
      },
    })

    const referralRow = {
      id: 'ref-1',
      partnerId: 'partner-1',
      organizationId: 'org-123',
      lifetimeValueCents: 0,
      firstPaidAt: null,
    }
    const orgRow = {
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'active',
      stripeSubscriptionId: 'sub_live',
    }

    const updateWhere = vi.fn().mockResolvedValue(undefined)
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere })
    const updateChain = { set: updateSet }

    let selectCallCount = 0
    const selectLimit = vi.fn().mockImplementation(() => {
      selectCallCount++
      return Promise.resolve(selectCallCount === 1 ? [orgRow] : [referralRow])
    })
    const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit })
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere })
    const selectChain = { from: selectFrom }

    const revenueReturning = vi.fn().mockResolvedValue([{ id: 'rev-1' }])
    const revenueOnConflictDoNothing = vi.fn().mockReturnValue({ returning: revenueReturning })
    const revenueInsertValues = vi.fn().mockReturnValue({
      onConflictDoNothing: revenueOnConflictDoNothing,
    })
    const processedInsertValues = vi.fn().mockResolvedValue(undefined)
    const insert = vi
      .fn()
      .mockReturnValueOnce({ values: processedInsertValues })
      .mockReturnValueOnce({ values: revenueInsertValues })
    const db = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
      insert,
      selectChain,
      updateChain,
    }

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).toHaveBeenCalled()
    expect(revenueInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        referralId: 'ref-1',
        partnerId: 'partner-1',
        organizationId: 'org-123',
        stripeInvoiceId: 'in_123',
        amountCents: 9900,
        paidAt: new Date('2026-05-01T12:00:00.000Z'),
      }),
    )
    expect(revenueOnConflictDoNothing).toHaveBeenCalled()
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        firstPaidAt: new Date('2026-05-01T12:00:00.000Z'),
      }),
    )
  })

  it('does not double-count LTV when the invoice revenue ledger already exists', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_duplicate',
          subscription: 'sub_live',
          subscription_details: { metadata: { orgId: 'org-123' } },
          amount_paid: 9900,
        },
      },
    })

    const referralRow = {
      id: 'ref-1',
      partnerId: 'partner-1',
      organizationId: 'org-123',
      lifetimeValueCents: 9900,
      firstPaidAt: new Date('2026-05-01T12:00:00.000Z'),
    }
    const orgRow = {
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'active',
      stripeSubscriptionId: 'sub_live',
    }

    let selectCallCount = 0
    const selectLimit = vi.fn().mockImplementation(() => {
      selectCallCount++
      return Promise.resolve(selectCallCount === 1 ? [orgRow] : [referralRow])
    })
    const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit })
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere })
    const selectChain = { from: selectFrom }

    const revenueReturning = vi.fn().mockResolvedValue([])
    const revenueOnConflictDoNothing = vi.fn().mockReturnValue({ returning: revenueReturning })
    const revenueInsertValues = vi.fn().mockReturnValue({
      onConflictDoNothing: revenueOnConflictDoNothing,
    })
    const processedInsertValues = vi.fn().mockResolvedValue(undefined)
    const insert = vi
      .fn()
      .mockReturnValueOnce({ values: processedInsertValues })
      .mockReturnValueOnce({ values: revenueInsertValues })
    const db = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn(),
      insert,
      selectChain,
    }

    await handleStripeWebhook('body', 'sig', db as never)

    expect(revenueOnConflictDoNothing).toHaveBeenCalled()
    expect(db.update).not.toHaveBeenCalled()
  })

  it('ignores stale invoice.paid events when the subscription does not match the org current subscription', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: {
        object: {
          subscription: 'sub_stale',
          subscription_details: { metadata: { orgId: 'org-123' } },
          amount_paid: 9900,
        },
      },
    })

    const db = makeMockDb({
      planStatus: 'active',
      stripeSubscriptionId: 'sub_live',
    })

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
  })

  it('skips processing when event id was already processed', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_duplicate',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
        },
      },
    })

    const db = makeMockDb()
    const dupErr = Object.assign(new Error('duplicate key'), { code: '23505' })
    db.insertChain.values.mockRejectedValueOnce(dupErr)

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('propagates non-duplicate DB errors from the idempotency insert', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_dbfail',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
        },
      },
    })

    const db = makeMockDb()
    const connErr = Object.assign(new Error('connection timeout'), {
      code: '08006',
    })
    db.insertChain.values.mockRejectedValueOnce(connErr)

    await expect(handleStripeWebhook('body', 'sig', db as never)).rejects.toThrow(
      'connection timeout',
    )
    expect(db.update).not.toHaveBeenCalled()
  })

  it('keeps checkout completion retry-safe when the trial-start email send fails', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_email_fail',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { orgId: 'org-123', plan: 'clinic' },
          customer: 'cus_abc',
          subscription: 'sub_xyz',
          customer_details: { email: 'owner@clinic.test' },
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_xyz',
      trial_start: 1776340800,
      trial_end: 1778932800,
    })
    vi.mocked(sendTrialStartedEmail).mockRejectedValueOnce(new Error('smtp down'))

    const db = makeMockDb()

    await expect(handleStripeWebhook('body', 'sig', db as never)).resolves.toBeUndefined()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'billing.subscription.started',
      }),
    )
    expect(db.delete).not.toHaveBeenCalled()
  })

  it('skips LTV update on invoice.paid when no referral exists', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: {
        object: {
          subscription: 'sub_live',
          subscription_details: { metadata: { orgId: 'org-123' } },
          amount_paid: 9900,
        },
      },
    })

    const updateWhere = vi.fn().mockResolvedValue(undefined)
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere })
    const updateChain = { set: updateSet }

    const orgRow = {
      id: 'org-123',
      plan: 'essentials',
      planStatus: 'active',
      stripeSubscriptionId: 'sub_live',
    }
    let selectCallCount = 0
    const selectLimit = vi.fn().mockImplementation(() => {
      selectCallCount++
      return Promise.resolve(selectCallCount === 1 ? [orgRow] : [])
    })
    const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit })
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere })
    const selectChain = { from: selectFrom }

    const db = {
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      selectChain,
      updateChain,
    }

    await handleStripeWebhook('body', 'sig', db as never)

    expect(db.update).not.toHaveBeenCalled()
  })
})
