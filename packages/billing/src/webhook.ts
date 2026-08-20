import Stripe from 'stripe'
import { getStripe } from './stripe.js'
import {
  getMaxMembersForPlan,
  getPlanIdFromStripePriceId,
  getPromotionalMonthlyPriceDisplay,
  PLANS,
  toStoredPlanId,
} from './plans.js'
import type { BillingCadence } from './plans.js'
import type { DB } from '@phiguard/db'
import {
  organizations,
  referrals,
  referralRevenueEvents,
  processedStripeEvents,
} from '@phiguard/db'
import { writeAuditEvent } from '@phiguard/audit'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { sendTrialEndingSoonEmail, sendTrialStartedEmail } from '@phiguard/email'
import { hasSavedPaymentMethod } from './customers.js'
import { captureBillingAnalyticsEvent, type BillingAnalyticsEvent } from './analytics.js'
import { BaaService } from '@phiguard/baa'

async function getOrganizationSnapshot(db: DB, orgId: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1)

  return organization ?? null
}

async function updateOrganizationOrThrow(
  db: DB,
  orgId: string,
  values: Partial<typeof organizations.$inferInsert>,
  options: { currentStripeSubscriptionId?: string | null } = {},
) {
  const where =
    'currentStripeSubscriptionId' in options
      ? and(
          eq(organizations.id, orgId),
          options.currentStripeSubscriptionId
            ? eq(organizations.stripeSubscriptionId, options.currentStripeSubscriptionId)
            : isNull(organizations.stripeSubscriptionId),
        )
      : eq(organizations.id, orgId)

  const [updatedOrganization] = await db
    .update(organizations)
    .set(values)
    .where(where)
    .returning({ id: organizations.id })

  if (!updatedOrganization) {
    throw new Error('Organization not found')
  }
}

async function hasCurrentLegalAcceptance(
  db: DB,
  orgId: string,
  organization: Awaited<ReturnType<typeof getOrganizationSnapshot>>,
) {
  if (!organization?.baaSignedAt || !organization?.termsAcceptedAt) {
    return false
  }

  const legalStatus = await new BaaService().getLegalStatus({ orgId }, db)
  return Boolean(
    legalStatus.terms.acceptedAt &&
      legalStatus.baa.acceptedAt &&
      legalStatus.terms.isCurrent &&
      legalStatus.baa.isCurrent,
  )
}

async function withBillingMutationTransaction(db: DB, fn: (tx: DB) => Promise<void>) {
  const transactionalDb = db as DB & {
    transaction?: (fn: (tx: DB) => Promise<void>) => Promise<void>
  }

  if (typeof transactionalDb.transaction === 'function') {
    await transactionalDb.transaction(fn)
    return
  }

  await fn(db)
}

function fromUnixTimestamp(value: number | null | undefined): Date | null {
  return typeof value === 'number' ? new Date(value * 1000) : null
}

function getWebhookOrgId(object: {
  metadata?: { orgId?: string } | null
  subscription_details?: { metadata?: { orgId?: string } | null } | null
}) {
  return object.metadata?.orgId ?? object.subscription_details?.metadata?.orgId
}

function getWebhookPlanId(object: {
  metadata?: { plan?: string } | null
  subscription_details?: { metadata?: { plan?: string } | null } | null
}) {
  return object.metadata?.plan ?? object.subscription_details?.metadata?.plan
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  if (typeof invoice.subscription === 'string') {
    return invoice.subscription
  }

  return invoice.subscription?.id ?? null
}

function getCheckoutCustomerId(session: Stripe.Checkout.Session) {
  if (typeof session.customer === 'string') {
    return session.customer
  }

  return session.customer?.id ?? null
}

function getInvoicePaidAt(invoice: Stripe.Invoice) {
  const paidAtSeconds = invoice.status_transitions?.paid_at ?? invoice.created
  return paidAtSeconds ? new Date(paidAtSeconds * 1000) : new Date()
}

function getPlanDetails(planId: string | undefined) {
  const resolvedPlanId =
    planId && planId in PLANS ? (planId as keyof typeof PLANS) : toStoredPlanId(planId)

  return PLANS[resolvedPlanId]
}

function getWebhookBillingCadence(object: {
  metadata?: { billingCadence?: string } | null
  subscription_details?: {
    metadata?: { billingCadence?: string } | null
  } | null
}): BillingCadence {
  const cadence =
    object.metadata?.billingCadence ?? object.subscription_details?.metadata?.billingCadence
  return cadence === 'monthly' ? 'monthly' : 'annual'
}

function getEmailPriceMonthly(
  planDetails: ReturnType<typeof getPlanDetails>,
  billingCadence: BillingCadence,
  subscription?: Stripe.Subscription | null,
) {
  if (subscription && !hasLimitedOfferDiscount(subscription)) {
    return {
      amount: planDetails.priceMonthly,
      note: undefined,
    }
  }

  // Quote the limited offer price the customer actually pays when Stripe shows
  // a discount, or when older webhook fixtures omit discount fields entirely.
  return {
    ...getPromotionalMonthlyPriceDisplay(planDetails.id, billingCadence),
  }
}

function hasLimitedOfferDiscount(subscription: Stripe.Subscription) {
  const candidate = subscription as Stripe.Subscription & {
    discount?: { coupon?: { id?: string | null } | null } | null
    discounts?: Array<string | { coupon?: { id?: string | null } | null }> | null
  }

  if (Object.prototype.hasOwnProperty.call(candidate, 'discounts')) {
    return Array.isArray(candidate.discounts) && candidate.discounts.length > 0
  }

  if (Object.prototype.hasOwnProperty.call(candidate, 'discount')) {
    return Boolean(candidate.discount)
  }

  return true
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items?.data?.find((item) => item.price?.id)?.price?.id ?? null
}

function hasCheckoutActivationChanged(
  before: Awaited<ReturnType<typeof getOrganizationSnapshot>>,
  next: {
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    plan: string
    planStatus: 'trialing' | 'active'
    maxMembers: number
    billingPriceMonthlyCents: number
    trialStartedAt: Date | null
    trialEndsAt: Date | null
  },
) {
  return (
    !before ||
    before.stripeCustomerId !== next.stripeCustomerId ||
    before.stripeSubscriptionId !== next.stripeSubscriptionId ||
    before.plan !== next.plan ||
    before.planStatus !== next.planStatus ||
    before.maxMembers !== next.maxMembers ||
    before.billingPriceMonthlyCents !== next.billingPriceMonthlyCents ||
    before.trialStartedAt?.getTime() !== next.trialStartedAt?.getTime() ||
    before.trialEndsAt?.getTime() !== next.trialEndsAt?.getTime()
  )
}

function hasCancellationChanged(
  before: Awaited<ReturnType<typeof getOrganizationSnapshot>>,
  next: {
    plan: string
    planStatus: 'canceled'
    maxMembers: number
    billingPriceMonthlyCents: number | null
    stripeSubscriptionId: string | null
  },
) {
  return (
    !before ||
    before.plan !== next.plan ||
    before.planStatus !== next.planStatus ||
    before.maxMembers !== next.maxMembers ||
    before.billingPriceMonthlyCents !== next.billingPriceMonthlyCents ||
    before.stripeSubscriptionId !== next.stripeSubscriptionId
  )
}

function hasSubscriptionUpdateChanged(
  before: Awaited<ReturnType<typeof getOrganizationSnapshot>>,
  next: {
    plan: string
    planStatus: 'trialing' | 'active' | 'paused' | 'past_due' | 'canceled'
    maxMembers: number
    billingPriceMonthlyCents: number
    trialStartedAt: Date | null
    trialEndsAt: Date | null
  },
) {
  return (
    !before ||
    before.plan !== next.plan ||
    before.planStatus !== next.planStatus ||
    before.maxMembers !== next.maxMembers ||
    before.billingPriceMonthlyCents !== next.billingPriceMonthlyCents ||
    before.trialStartedAt?.getTime() !== next.trialStartedAt?.getTime() ||
    before.trialEndsAt?.getTime() !== next.trialEndsAt?.getTime()
  )
}

function getBillingUrl() {
  return `${process.env.APP_URL ?? 'http://localhost:3000'}/app/billing`
}

async function captureStripeBillingAnalytics(
  eventName: BillingAnalyticsEvent,
  properties: Record<string, unknown>,
) {
  try {
    await captureBillingAnalyticsEvent(eventName, properties)
  } catch {
    // Analytics is best-effort; webhook persistence and audit state remain authoritative.
  }
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'trialing' | 'active' | 'paused' | 'past_due' | 'canceled' {
  switch (status) {
    case 'trialing':
      return 'trialing'
    case 'active':
      return 'active'
    case 'paused':
      return 'paused'
    case 'canceled':
      return 'canceled'
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'past_due'
    default:
      return 'past_due'
  }
}

export async function handleStripeWebhook(body: string, signature: string, db: DB) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not set')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch {
    throw new Error('Invalid Stripe signature')
  }

  try {
    await db.insert(processedStripeEvents).values({ id: event.id })
  } catch (err) {
    if ((err as { code?: string }).code === '23505') return
    throw err
  }

  const orgId = getWebhookOrgId(
    event.data.object as {
      metadata?: { orgId?: string } | null
      subscription_details?: { metadata?: { orgId?: string } | null } | null
    },
  )
  if (!orgId) return

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const planId = getWebhookPlanId(session)
        const billingCadence = getWebhookBillingCadence(session)
        const normalizedPlan = toStoredPlanId(planId)
        const before = await getOrganizationSnapshot(db, orgId)
        if (!before) {
          break
        }

        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

        if (
          before?.stripeSubscriptionId &&
          subscriptionId &&
          before.stripeSubscriptionId !== subscriptionId
        ) {
          break
        }

        if (!(await hasCurrentLegalAcceptance(db, orgId, before))) {
          const customerId = getCheckoutCustomerId(session)
          if (
            (customerId || subscriptionId) &&
            (before?.stripeCustomerId !== customerId ||
              before?.stripeSubscriptionId !== (subscriptionId ?? null))
          ) {
            await updateOrganizationOrThrow(
              db,
              orgId,
              {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId ?? null,
              },
              {
                currentStripeSubscriptionId: before.stripeSubscriptionId ?? null,
              },
            )
          }

          await writeAuditEvent(db, {
            tenantId: orgId,
            actorId: 'stripe-webhook',
            action: 'billing.subscription.activation_blocked',
            resourceType: 'organization',
            resourceId: orgId,
            before,
            after: {
              reason: 'missing_legal_acceptance',
              attemptedPlan: normalizedPlan,
            },
          })
          break
        }

        const subscription = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : null
        const trialStartedAt = fromUnixTimestamp(subscription?.trial_start)
        const trialEndsAt = fromUnixTimestamp(subscription?.trial_end)
        const planDetails = getPlanDetails(planId)
        const customerId = getCheckoutCustomerId(session)
        const nextState = {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId ?? null,
          plan: normalizedPlan,
          planStatus: trialEndsAt ? ('trialing' as const) : ('active' as const),
          maxMembers: getMaxMembersForPlan(planId),
          billingPriceMonthlyCents: planDetails.priceMonthly * 100,
          trialStartedAt,
          trialEndsAt,
        }

        if (!hasCheckoutActivationChanged(before, nextState)) {
          break
        }

        await withBillingMutationTransaction(db, async (tx) => {
          await updateOrganizationOrThrow(tx, orgId, nextState, {
            currentStripeSubscriptionId: before.stripeSubscriptionId ?? null,
          })

          await writeAuditEvent(tx, {
            tenantId: orgId,
            actorId: 'stripe-webhook',
            action: 'billing.subscription.started',
            resourceType: 'organization',
            resourceId: orgId,
            before,
            after: nextState,
          })
        })

        await captureStripeBillingAnalytics('checkout_completed', {
          organization_id: orgId,
          plan: nextState.plan,
          plan_status: nextState.planStatus,
          billing_cadence: billingCadence,
          amount_cents: nextState.billingPriceMonthlyCents,
          currency: 'usd',
        })
        await captureStripeBillingAnalytics('trial_started', {
          organization_id: orgId,
          plan: nextState.plan,
          plan_status: nextState.planStatus,
          billing_cadence: billingCadence,
          amount_cents: nextState.billingPriceMonthlyCents,
          currency: 'usd',
        })

        if (session.customer_details?.email && trialEndsAt) {
          try {
            const emailPrice = getEmailPriceMonthly(planDetails, billingCadence, subscription)
            await sendTrialStartedEmail({
              toEmail: session.customer_details.email,
              planName: planDetails.name,
              priceMonthly: emailPrice.amount,
              priceMonthlyNote: emailPrice.note,
              trialStartedAt: trialStartedAt ?? new Date(),
              trialEndsAt,
              billingUrl: getBillingUrl(),
            })
          } catch {
            // Best-effort notification. Billing state and audit are already persisted.
          }
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const before = await getOrganizationSnapshot(db, orgId)
        if (before?.stripeSubscriptionId !== sub.id) {
          break
        }

        const pricePlanId = getPlanIdFromStripePriceId(getSubscriptionPriceId(sub))
        const planId = pricePlanId ?? getWebhookPlanId(sub) ?? before.plan
        const planDetails = getPlanDetails(planId)
        const planStatus = mapStripeSubscriptionStatus(sub.status)

        if (
          (planStatus === 'trialing' || planStatus === 'active') &&
          !(await hasCurrentLegalAcceptance(db, orgId, before))
        ) {
          await writeAuditEvent(db, {
            tenantId: orgId,
            actorId: 'stripe-webhook',
            action: 'billing.subscription.activation_blocked',
            resourceType: 'organization',
            resourceId: orgId,
            before,
            after: {
              reason: 'missing_legal_acceptance',
              attemptedPlan: toStoredPlanId(planId),
            },
          })
          break
        }

        const nextState = {
          plan: toStoredPlanId(planId),
          planStatus,
          maxMembers: planDetails.maxMembers,
          billingPriceMonthlyCents: planDetails.priceMonthly * 100,
          trialStartedAt: fromUnixTimestamp(sub.trial_start),
          trialEndsAt: fromUnixTimestamp(sub.trial_end),
        }

        if (!hasSubscriptionUpdateChanged(before, nextState)) {
          break
        }

        await withBillingMutationTransaction(db, async (tx) => {
          await updateOrganizationOrThrow(tx, orgId, nextState, {
            currentStripeSubscriptionId: sub.id,
          })
          await writeAuditEvent(tx, {
            tenantId: orgId,
            actorId: 'stripe-webhook',
            action: 'billing.subscription.updated',
            resourceType: 'organization',
            resourceId: orgId,
            before,
            after: nextState,
          })
        })
        await captureStripeBillingAnalytics('subscription_updated', {
          organization_id: orgId,
          plan: nextState.plan,
          plan_status: nextState.planStatus,
          amount_cents: nextState.billingPriceMonthlyCents,
          currency: 'usd',
        })
        if (nextState.planStatus === 'active' && before.planStatus !== 'active') {
          await captureStripeBillingAnalytics('subscription_started', {
            organization_id: orgId,
            plan: nextState.plan,
            plan_status: nextState.planStatus,
            amount_cents: nextState.billingPriceMonthlyCents,
            currency: 'usd',
          })
        }
        if (nextState.planStatus === 'past_due') {
          await captureStripeBillingAnalytics('subscription_past_due', {
            organization_id: orgId,
            plan: nextState.plan,
            plan_status: nextState.planStatus,
            amount_cents: nextState.billingPriceMonthlyCents,
            currency: 'usd',
          })
        }
        break
      }
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        const before = await getOrganizationSnapshot(db, orgId)
        if (before?.stripeSubscriptionId !== sub.id) {
          break
        }

        const customer =
          typeof sub.customer === 'string'
            ? await stripe.customers.retrieve(sub.customer)
            : sub.customer

        if (!customer || customer.deleted || !customer.email) {
          break
        }

        const trialEndsAt = fromUnixTimestamp(sub.trial_end)
        if (!trialEndsAt) {
          break
        }

        const planDetails = getPlanDetails(getWebhookPlanId(sub))
        const billingCadence = getWebhookBillingCadence(sub)
        const emailPrice = getEmailPriceMonthly(planDetails, billingCadence, sub)
        await sendTrialEndingSoonEmail({
          toEmail: customer.email,
          billingUrl: getBillingUrl(),
          planName: planDetails.name,
          priceMonthly: emailPrice.amount,
          priceMonthlyNote: emailPrice.note,
          trialEndsAt,
          hasPaymentMethodOnFile:
            typeof sub.customer === 'string' ? await hasSavedPaymentMethod(sub.customer) : false,
        })
        break
      }
      case 'invoice.payment_failed': {
        const before = await getOrganizationSnapshot(db, orgId)
        const invoice = event.data.object as Stripe.Invoice
        const invoiceSubscriptionId = getInvoiceSubscriptionId(invoice)

        if (!invoiceSubscriptionId || before?.stripeSubscriptionId !== invoiceSubscriptionId) {
          break
        }

        if (before?.planStatus === 'past_due') {
          break
        }
        await withBillingMutationTransaction(db, async (tx) => {
          await updateOrganizationOrThrow(
            tx,
            orgId,
            { planStatus: 'past_due' },
            {
              currentStripeSubscriptionId: invoiceSubscriptionId,
            },
          )
          await writeAuditEvent(tx, {
            tenantId: orgId,
            actorId: 'stripe-webhook',
            action: 'billing.payment.failed',
            resourceType: 'organization',
            resourceId: orgId,
            before,
            after: { planStatus: 'past_due' },
          })
        })
        await captureStripeBillingAnalytics('payment_failed', {
          organization_id: orgId,
          plan: before.plan,
          plan_status: 'past_due',
          amount_cents: invoice.amount_due,
          currency: invoice.currency,
        })
        break
      }
      case 'customer.subscription.deleted': {
        const before = await getOrganizationSnapshot(db, orgId)
        const sub = event.data.object as Stripe.Subscription

        if (before?.stripeSubscriptionId !== sub.id) {
          break
        }

        const nextState = {
          plan: 'essentials' as const,
          planStatus: 'canceled' as const,
          maxMembers: getMaxMembersForPlan('essentials'),
          billingPriceMonthlyCents: null,
          stripeSubscriptionId: null,
        }

        if (!hasCancellationChanged(before, nextState)) {
          break
        }
        await withBillingMutationTransaction(db, async (tx) => {
          await updateOrganizationOrThrow(tx, orgId, nextState, {
            currentStripeSubscriptionId: sub.id,
          })
          await writeAuditEvent(tx, {
            tenantId: orgId,
            actorId: 'stripe-webhook',
            action: 'billing.subscription.canceled',
            resourceType: 'organization',
            resourceId: orgId,
            before,
            after: nextState,
          })
        })
        await captureStripeBillingAnalytics('subscription_cancelled', {
          organization_id: orgId,
          plan: nextState.plan,
          plan_status: nextState.planStatus,
          currency: 'usd',
        })
        break
      }
      case 'invoice.paid': {
        const before = await getOrganizationSnapshot(db, orgId)
        const invoice = event.data.object as Stripe.Invoice
        const invoiceSubscriptionId = getInvoiceSubscriptionId(invoice)
        const invoiceId = invoice.id
        const amountCents = invoice.amount_paid

        if (
          !invoiceId ||
          !invoiceSubscriptionId ||
          before?.stripeSubscriptionId !== invoiceSubscriptionId
        ) {
          break
        }

        if (amountCents <= 0) break

        const [referral] = await db
          .select()
          .from(referrals)
          .where(eq(referrals.organizationId, orgId))
          .limit(1)

        if (!referral) break

        await withBillingMutationTransaction(db, async (tx) => {
          const insertedRevenue = await tx
            .insert(referralRevenueEvents)
            .values({
              referralId: referral.id,
              partnerId: referral.partnerId,
              organizationId: referral.organizationId,
              stripeInvoiceId: invoiceId,
              amountCents,
              paidAt: getInvoicePaidAt(invoice),
            })
            .onConflictDoNothing()
            .returning({ id: referralRevenueEvents.id })

          if (insertedRevenue.length === 0) return

          await tx
            .update(referrals)
            .set({
              lifetimeValueCents: sql`${referrals.lifetimeValueCents} + ${amountCents}`,
              firstPaidAt: referral.firstPaidAt ?? getInvoicePaidAt(invoice),
            })
            .where(eq(referrals.id, referral.id))
        })
        break
      }
    }
  } catch (err) {
    await db.delete(processedStripeEvents).where(eq(processedStripeEvents.id, event.id))
    throw err
  }
}
