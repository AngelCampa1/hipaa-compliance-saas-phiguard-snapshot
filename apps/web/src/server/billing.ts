import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { sendTrialStartedEmail } from '@phiguard/email'
import { getDb, organizations } from '@phiguard/db/server'
import { isAdmin } from '@phiguard/auth'
import { DEFAULT_BILLING_CADENCE, PLANS, PUBLIC_PLAN_IDS, TRIAL_DAYS, getPromotionalMonthlyPriceDisplay, getUsedFeatures, isPublicPlanId, resolveCommercialState, toStoredPlanId, type BillingCadence, type FeatureKey, type PublicPlanId } from '@phiguard/billing'
import { writeAuditEvent } from '@phiguard/audit'
import { getSessionFn } from '../lib/session.js'
import { resolveActiveLocationAccess } from './access.js'

function getAppUrl(): string {
  return process.env.APP_URL ?? 'http://localhost:3000'
}

function hasBillingAdminAccess(role: string | null | undefined) {
  return Boolean(role && isAdmin(role as Parameters<typeof isAdmin>[0]))
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

async function requireBillingAdminSession() {
  const session = await getSessionFn()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  if (!hasBillingAdminAccess(access.role)) {
    throw new Error('Forbidden: admin access required')
  }

  return { session, tenantId: access.organizationId }
}

async function requireBillingSession() {
  const session = await getSessionFn()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)

  return { session, tenantId: access.organizationId, role: access.role }
}

async function getCurrentLegalAcceptanceState(db: ReturnType<typeof getDb>, orgId: string) {
  const { BaaService } = await import('@phiguard/baa')
  const legalStatus = await new BaaService().getLegalStatus({ orgId }, db)

  return {
    legalStatus,
    legalCurrent: Boolean(
      legalStatus.terms.acceptedAt
      && legalStatus.baa.acceptedAt
      && legalStatus.terms.isCurrent
      && legalStatus.baa.isCurrent,
    ),
  }
}

export const createCheckoutSessionFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    planId: z.enum(PUBLIC_PLAN_IDS).optional(),
    billingCadence: z.enum(['monthly', 'annual']).optional(),
  }))
  .handler(async ({ data }) => {
    return createCheckoutSessionImpl(data)
  })

async function createCheckoutSessionImpl(data: { planId?: PublicPlanId, billingCadence?: BillingCadence }) {
    const { session, tenantId } = await requireBillingAdminSession()
    const { createCheckoutSession } = await import('@phiguard/billing/checkout')

    // Enforce BAA-before-checkout: BAA must be signed before a paid plan can activate
    const db = getDb()
    const [org] = await db
      .select({
        plan: organizations.plan,
        planStatus: organizations.planStatus,
        trialEndsAt: organizations.trialEndsAt,
        baaSignedAt: organizations.baaSignedAt,
        termsAcceptedAt: organizations.termsAcceptedAt,
        stripeCustomerId: organizations.stripeCustomerId,
        stripeSubscriptionId: organizations.stripeSubscriptionId,
      })
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    const { legalCurrent: hasCurrentLegalAcceptance } = await getCurrentLegalAcceptanceState(db, tenantId)

    if (!org?.baaSignedAt || !org?.termsAcceptedAt || !hasCurrentLegalAcceptance) {
      throw new Error('Legal acceptance must be completed before completing checkout. Please complete the Terms and BAA step first.')
    }
    if (org.planStatus === 'selection_required' || org.planStatus === 'trial_pending') {
      throw new Error('Start the trial before collecting billing details. Complete onboarding first.')
    }
    if (org?.stripeSubscriptionId) {
      throw new Error('Organization already has a current subscription. Open the billing portal instead of creating a new checkout session.')
    }

    if (data.planId && !isPublicPlanId(data.planId)) {
      throw new Error('Compliance Ops is available through a custom path. Contact support before checkout.')
    }

    const storedPlanId = toStoredPlanId(org?.plan ?? undefined)
    const selectedPlanId = data.planId ?? (isPublicPlanId(storedPlanId) ? storedPlanId : 'group')
    const billingCadence: BillingCadence = data.billingCadence ?? DEFAULT_BILLING_CADENCE
    const selectedPlan = PLANS[selectedPlanId]

    await db.transaction(async (tx) => {
      const [row] = await tx
        .update(organizations)
        .set({
          plan: selectedPlanId,
          maxMembers: selectedPlan.maxMembers,
          billingPriceMonthlyCents: selectedPlan.priceMonthly * 100,
          planSelectedAt: new Date(),
        })
        .where(and(eq(organizations.id, tenantId), isNull(organizations.stripeSubscriptionId)))
        .returning({ id: organizations.id })

      if (!row) {
        throw new Error('Organization billing state changed before checkout could be created')
      }

      await writeAuditEvent(tx, {
        tenantId,
        actorId: session.user.id,
        action: 'billing.checkout_started',
        resourceType: 'organization',
        resourceId: tenantId,
        before: { plan: org.plan },
        after: { plan: selectedPlanId, maxMembers: selectedPlan.maxMembers },
      })

      return row
    })

    const commercialState = resolveCommercialState({
      plan: selectedPlanId,
      planStatus: org.planStatus,
      trialEndsAt: org.trialEndsAt,
      stripeCustomerId: org.stripeCustomerId,
      stripeSubscriptionId: org.stripeSubscriptionId,
    })

    const checkoutSession = await createCheckoutSession({
      orgId: tenantId,
      planId: selectedPlanId,
      billingCadence,
      successUrl: `${getAppUrl()}/app/billing?checkout=success`,
      cancelUrl: `${getAppUrl()}/app/billing?checkout=cancelled`,
      customerId: org?.stripeCustomerId ?? undefined,
      customerEmail: session.user.email,
      currentSubscriptionId: org?.stripeSubscriptionId ?? null,
      trialEndAt:
        org?.planStatus === 'trialing' && commercialState.trialEndsAt && !commercialState.isTrialExpired
          ? commercialState.trialEndsAt
          : undefined,
    })
    return { url: checkoutSession.url }
}

export const selectPlanFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    planId: z.enum(PUBLIC_PLAN_IDS),
  }))
  .handler(async ({ data }) => {
    if (!isPublicPlanId(data.planId)) {
      throw new Error('Compliance Ops is available through a custom path. Contact support before checkout.')
    }

    const { session, tenantId } = await requireBillingAdminSession()
    const db = getDb()
    const plan = PLANS[data.planId]
    const [org] = await db
      .select({
        id: organizations.id,
        plan: organizations.plan,
        planStatus: organizations.planStatus,
        stripeSubscriptionId: organizations.stripeSubscriptionId,
      })
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    if (!org) {
      throw new Error('Organization not found')
    }

    if (org.stripeSubscriptionId) {
      throw new Error('Use the billing portal to change plans on an active subscription.')
    }

    const updateValues: {
      plan: typeof data.planId
      planSelectedAt: Date
      maxMembers: number
      billingPriceMonthlyCents: number
      planStatus?: 'trial_pending'
    } = {
      plan: data.planId,
      planSelectedAt: new Date(),
      maxMembers: plan.maxMembers,
      billingPriceMonthlyCents: plan.priceMonthly * 100,
    }
    if (org.planStatus === 'selection_required') {
      updateValues.planStatus = 'trial_pending'
    }

    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(organizations)
        .set(updateValues)
        .where(and(eq(organizations.id, tenantId), isNull(organizations.stripeSubscriptionId)))
        .returning({
          id: organizations.id,
          plan: organizations.plan,
          planStatus: organizations.planStatus,
          maxMembers: organizations.maxMembers,
          billingPriceMonthlyCents: organizations.billingPriceMonthlyCents,
        })

      if (!updated) {
        throw new Error('Organization billing state changed before plan selection could be saved')
      }

      await writeAuditEvent(tx, {
        tenantId,
        actorId: session.user.id,
        action: 'billing.plan_selected',
        resourceType: 'organization',
        resourceId: tenantId,
        before: { plan: org.plan, planStatus: org.planStatus },
        after: { plan: updated.plan, planStatus: updated.planStatus, maxMembers: updated.maxMembers },
      })

      return updated
    })
  })

export const startTrialFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const { session, tenantId } = await requireBillingAdminSession()
    const db = getDb()
    const [org] = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        plan: organizations.plan,
        planStatus: organizations.planStatus,
        planSelectedAt: organizations.planSelectedAt,
        trialStartedAt: organizations.trialStartedAt,
        trialEndsAt: organizations.trialEndsAt,
        baaSignedAt: organizations.baaSignedAt,
        termsAcceptedAt: organizations.termsAcceptedAt,
        stripeSubscriptionId: organizations.stripeSubscriptionId,
      })
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    if (!org) throw new Error('Organization not found')

    const { legalCurrent: hasCurrentLegalAcceptance } = await getCurrentLegalAcceptanceState(db, tenantId)

    if (!org.baaSignedAt || !org.termsAcceptedAt || !hasCurrentLegalAcceptance) {
      throw new Error('Legal acceptance must be completed before the trial can start.')
    }

    if (org.stripeSubscriptionId) {
      throw new Error('Billing is already active for this organization.')
    }

    if (org.planStatus === 'trialing' || org.planStatus === 'active') {
      return {
        trialStartedAt: toIsoString(org.trialStartedAt),
        trialEndsAt: toIsoString(org.trialEndsAt),
        planStatus: org.planStatus,
      }
    }

    // A plan is not required to start the trial: trialing orgs get full app
    // access regardless of plan, and they can choose a plan later on the billing
    // page. Allow starting from 'selection_required' (no plan picked) as well as
    // 'trial_pending' (plan pre-selected during onboarding).
    if (org.planStatus !== 'trial_pending' && org.planStatus !== 'selection_required') {
      throw new Error('Trial cannot be started in the current billing state.')
    }

    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    await db.transaction(async (tx) => {
      const [row] = await tx
        .update(organizations)
        .set({
          planStatus: 'trialing',
          trialStartedAt: now,
          trialEndsAt,
        })
        .where(
          and(
            eq(organizations.id, tenantId),
            isNull(organizations.stripeSubscriptionId),
            inArray(organizations.planStatus, ['selection_required', 'trial_pending']),
          ),
        )
        .returning({ id: organizations.id })

      if (!row) {
        throw new Error('Organization billing state changed before the trial could be started')
      }

      await writeAuditEvent(tx, {
        tenantId,
        actorId: session.user.id,
        action: 'billing.trial_started',
        resourceType: 'organization',
        resourceId: tenantId,
        before: { planStatus: org.planStatus },
        after: { planStatus: 'trialing', trialEndsAt: trialEndsAt.toISOString() },
      })

      return row
    })

    // org.plan may be null when the trial is started before a plan is chosen
    // ('selection_required'). Resolve a concrete plan (defaults to essentials)
    // so the email always renders a valid name and price.
    const plan = PLANS[toStoredPlanId(org.plan ?? undefined)]
    const emailPrice = getPromotionalMonthlyPriceDisplay(plan.id, 'annual')

    try {
      await sendTrialStartedEmail({
        toEmail: session.user.email,
        planName: plan.name,
        // Quote the limited offer price (auto-applied at checkout), not list.
        priceMonthly: emailPrice.amount,
        priceMonthlyNote: emailPrice.note,
        trialStartedAt: now,
        trialEndsAt,
        billingUrl: `${getAppUrl()}/app/billing`,
      })
    } catch {
      // Best-effort email only.
    }

    return {
      trialStartedAt: now.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      planStatus: 'trialing' as const,
    }
  })

export const createPortalSessionFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const { tenantId } = await requireBillingAdminSession()
    const { createPortalSession } = await import('@phiguard/billing/portal')

    const db = getDb()
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    if (!org) throw new Error('Organization not found')
    if (!org.stripeCustomerId) throw new Error('No Stripe customer ID on file')

    const portalSession = await createPortalSession(
      org.stripeCustomerId,
      `${getAppUrl()}/app/billing`,
    )
    return { url: portalSession.url }
  })

export async function getOrgBilling() {
  const { tenantId, role } = await requireBillingSession()

  const db = getDb()
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      planSelectedAt: organizations.planSelectedAt,
      interestedPlan: organizations.interestedPlan,
      billingPriceMonthlyCents: organizations.billingPriceMonthlyCents,
      trialStartedAt: organizations.trialStartedAt,
      trialEndsAt: organizations.trialEndsAt,
      stripeCustomerId: organizations.stripeCustomerId,
      stripeSubscriptionId: organizations.stripeSubscriptionId,
      baaSignedAt: organizations.baaSignedAt,
      termsAcceptedAt: organizations.termsAcceptedAt,
      maxMembers: organizations.maxMembers,
    })
    .from(organizations)
    .where(eq(organizations.id, tenantId))
    .limit(1)

  if (!org) throw new Error('Organization not found')
  const { hasSavedPaymentMethod } = await import('@phiguard/billing/customers')
  const { legalStatus, legalCurrent } = await getCurrentLegalAcceptanceState(db, tenantId)
  let hasPaymentMethodOnFile = false
  if (org.stripeCustomerId) {
    try {
      hasPaymentMethodOnFile = await hasSavedPaymentMethod(org.stripeCustomerId)
    } catch {
      hasPaymentMethodOnFile = false
    }
  }

  const usedFeatures = await getUsedFeatures(db, tenantId)

  return formatOrgBilling(org, hasBillingAdminAccess(role), {
    legalCurrent,
    legalStatus,
    hasPaymentMethodOnFile,
    usedFeatures,
  })
}

export function formatOrgBilling(
  org: {
    id: string
    name: string
    plan: string | null
    planStatus: 'selection_required' | 'trial_pending' | 'trialing' | 'active' | 'paused' | 'past_due' | 'canceled'
    planSelectedAt: Date | string | null
    interestedPlan?: string | null
    billingPriceMonthlyCents: number | null
    trialStartedAt: Date | string | null
    trialEndsAt: Date | string | null
    stripeCustomerId: string | null
    stripeSubscriptionId?: string | null
    baaSignedAt: Date | string | null
    termsAcceptedAt: Date | string | null
    maxMembers: number | null
  },
  canManageBilling: boolean,
  legal?: {
    legalCurrent: boolean
    legalStatus: unknown
    hasPaymentMethodOnFile?: boolean
    usedFeatures?: FeatureKey[]
  },
) {
  const {
    stripeCustomerId: _stripeCustomerId,
    stripeSubscriptionId,
    trialStartedAt,
    trialEndsAt,
    planSelectedAt,
    baaSignedAt,
    termsAcceptedAt,
    ...billing
  } = org

  return {
    ...billing,
    interestedPlan: org.interestedPlan ?? null,
    planSelectedAt: toIsoString(planSelectedAt),
    trialStartedAt: toIsoString(trialStartedAt),
    trialEndsAt: toIsoString(trialEndsAt),
    baaSignedAt: toIsoString(baaSignedAt),
    termsAcceptedAt: toIsoString(termsAcceptedAt),
    legalCurrent: legal?.legalCurrent ?? Boolean(baaSignedAt && termsAcceptedAt),
    legalStatus: legal?.legalStatus ?? null,
    hasBillingCustomer: Boolean(_stripeCustomerId),
    hasBillingSubscription: Boolean(stripeSubscriptionId),
    hasPaymentMethodOnFile: legal?.hasPaymentMethodOnFile ?? false,
    usedFeatures: legal?.usedFeatures ?? [],
    canManageBilling,
  }
}

export const getOrgBillingFn = createServerFn({ method: 'GET' })
  .handler(async () => getOrgBilling())

export const listInvoicesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { tenantId } = await requireBillingAdminSession()

    const db = getDb()
    const [org] = await db
      .select({ stripeCustomerId: organizations.stripeCustomerId })
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    if (!org?.stripeCustomerId) return { invoices: [] }

    const { getStripe } = await import('@phiguard/billing/stripe')
    const stripe = getStripe()
    const result = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit: 12,
    })

    return {
      invoices: result.data.map((inv) => ({
        id: inv.id,
        number: inv.number ?? null,
        amountDue: inv.amount_due,
        status: inv.status ?? null,
        hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
        invoicePdf: inv.invoice_pdf ?? null,
        created: inv.created,
      })),
    }
  })

export const getPaymentMethodFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { tenantId } = await requireBillingAdminSession()

    const db = getDb()
    const [org] = await db
      .select({ stripeCustomerId: organizations.stripeCustomerId })
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    if (!org?.stripeCustomerId) return null

    const { getStripe } = await import('@phiguard/billing/stripe')
    const stripe = getStripe()
    const paymentMethods = await stripe.customers.listPaymentMethods(org.stripeCustomerId, {
      type: 'card',
      limit: 1,
    })

    const pm = paymentMethods.data[0]
    if (!pm?.card) return null

    return {
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    }
  })

export const getUpcomingInvoiceFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { tenantId } = await requireBillingAdminSession()

    const db = getDb()
    const [org] = await db
      .select({
        stripeCustomerId: organizations.stripeCustomerId,
        stripeSubscriptionId: organizations.stripeSubscriptionId,
      })
      .from(organizations)
      .where(eq(organizations.id, tenantId))
      .limit(1)

    if (!org?.stripeCustomerId || !org?.stripeSubscriptionId) return null

    try {
      const { getStripe } = await import('@phiguard/billing/stripe')
      const stripe = getStripe()
      const upcoming = await stripe.invoices.retrieveUpcoming({
        customer: org.stripeCustomerId,
        subscription: org.stripeSubscriptionId,
      })
      return {
        amountDue: upcoming.amount_due,
        nextPaymentAttempt: upcoming.next_payment_attempt ?? null,
      }
    } catch {
      return null
    }
  })
