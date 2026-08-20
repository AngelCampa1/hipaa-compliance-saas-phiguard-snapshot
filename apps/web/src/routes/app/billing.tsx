import { PLANS, type BillingCadence, type PublicPlanId } from '@phiguard/billing/plans'
import { getMinimumPlanForFeatures, isPlanAtLeast, type FeatureKey } from '@phiguard/billing'
import { commercialKnowledgeCopy } from '@phiguard/knowledge/commercial'
import { Alert, Badge, Button, PageHeader, Panel, Skeleton, SummaryMetric } from '@phiguard/ui'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, Check, CreditCard, Download, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { triggerBrowserDownload } from '../../lib/download.js'
import { formatDate } from '../../lib/dates.js'
import { getClientErrorMessage } from '../../lib/client-errors.js'
import { PLAN_FEATURES } from '../../lib/plan-features.js'
import { CommercialOfferNote, PUBLIC_PLAN_IDS, formatPlanPrice } from '../../lib/billing-catalog.js'
import { getBillingGateState } from '../../lib/phase-two-flow.js'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'
import {
  createCheckoutSessionFn,
  createPortalSessionFn,
  getOrgBillingFn,
  getPaymentMethodFn,
  getUpcomingInvoiceFn,
  listInvoicesFn,
} from '../../server/billing.js'
import { downloadExecutedLegalDocumentFn } from '../../server/baa.js'
import { ContextualHelpPanel } from '../../components/help-guidance'
import { appPublicGuidanceCopy } from '../../lib/help-content.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'

function formatAmountDue(amountCents: number): string {
  return `${(amountCents / 100).toFixed(2)}`
}

function formatUnixDate(ts: number): string {
  return formatDate(new Date(ts * 1000).toISOString(), { dateStyle: 'medium' })
}

function invoiceStatusLabel(status: string | null): string {
  switch (status) {
    case 'paid': return 'Paid'
    case 'open': return 'Open'
    case 'draft': return 'Draft'
    case 'void': return 'Void'
    case 'uncollectible': return 'Uncollectible'
    default: return status ?? 'Unknown'
  }
}

function invoiceStatusBadgeVariant(status: string | null): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'paid': return 'success'
    case 'open': return 'warning'
    case 'void':
    case 'uncollectible': return 'danger'
    default: return 'default'
  }
}

type InvoiceItem = {
  id: string
  number: string | null
  amountDue: number
  status: string | null
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  created: number
}
type PaymentMethodInfo = { brand: string; last4: string; expMonth: number; expYear: number }
type UpcomingInvoiceInfo = { amountDue: number; nextPaymentAttempt: number | null }

function BillingLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Panel>
        <div className="space-y-4 p-6">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Panel>
    </div>
  )
}

export const Route = createFileRoute('/app/billing')({
  loader: () => getOrgBillingFn(),
  pendingComponent: BillingLoadingSkeleton,
  component: BillingPage,
  errorComponent: AppRouteErrorBoundary,
})

function BillingPage() {
  const org = Route.useLoaderData()
  const canManageBilling = org.canManageBilling
  const usedFeatures = useMemo<FeatureKey[]>(
    () => (org.usedFeatures ?? []) as FeatureKey[],
    [org.usedFeatures],
  )
  const minimumPlanForUsage = useMemo<PublicPlanId>(
    () => getMinimumPlanForFeatures(usedFeatures) as PublicPlanId,
    [usedFeatures],
  )
  const initialPlan: PublicPlanId =
    (org.plan as PublicPlanId | null) ??
    (org.interestedPlan as PublicPlanId | null) ??
    minimumPlanForUsage
  const currentPlan = org.plan as PublicPlanId | null
  const currentPlanName = currentPlan ? PLANS[currentPlan].name : 'No active plan'
  const [selectedPlan, setSelectedPlan] = useState<PublicPlanId>(initialPlan)
  const [billingCadence, setBillingCadence] = useState<BillingCadence>('annual')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null)
  const [downloadingLegalDocument, setDownloadingLegalDocument] = useState<'terms' | 'baa' | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<InvoiceItem[] | null>(null)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInfo | null | undefined>(undefined)
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false)
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceInfo | null | undefined>(undefined)
  const billingGate = getBillingGateState({
    plan: org.plan,
    baaSignedAt: org.baaSignedAt,
    termsAcceptedAt: org.termsAcceptedAt,
    legalCurrent: org.legalCurrent,
    planStatus: org.planStatus,
    hasBillingCustomer: org.hasBillingCustomer,
    hasBillingSubscription: org.hasBillingSubscription,
    hasPaymentMethodOnFile: org.hasPaymentMethodOnFile,
    trialEndsAt: org.trialEndsAt,
  })
  const displayedPriceMonthly = formatPlanPrice(selectedPlan, billingCadence).price

  const missingFeaturesForSelected = useMemo(
    () => usedFeatures.filter((feature) => !PLANS[selectedPlan].features.includes(feature)),
    [selectedPlan, usedFeatures],
  )
  const downgradeWarning = useMemo(
    () =>
      missingFeaturesForSelected.length > 0
        ? {
            headline: `Heads-up: ${PLANS[selectedPlan].name} does not include features you have already used.`,
            body: `Your team used ${missingFeaturesForSelected
              .map((feature) => feature.replaceAll('_', ' '))
              .join(', ')} during the trial. These are part of ${
              PLANS[minimumPlanForUsage].name
            } (${formatPlanPrice(minimumPlanForUsage, billingCadence).price} ${formatPlanPrice(minimumPlanForUsage, billingCadence).cadenceLabel}). If you continue with ${PLANS[selectedPlan].name}, those areas will lock when the trial ends.`,
          }
        : null,
    [missingFeaturesForSelected, selectedPlan, minimumPlanForUsage, billingCadence],
  )

  useEffect(() => {
    if (downgradeWarning) {
      trackProductEvent('downgrade_warning_shown', {
        route: '/app/billing',
        selected_plan: selectedPlan,
        minimum_plan: minimumPlanForUsage,
        count: missingFeaturesForSelected.length,
      })
    }
  }, [missingFeaturesForSelected])

  const isTrialing = billingGate.status === 'trialing'
  const isActive = billingGate.status === 'active'
  const isPaused = billingGate.status === 'paused'
  const isPastDue = billingGate.status === 'past_due'
  const isCanceled = billingGate.status === 'canceled'
  const isPreCheckout = billingGate.isPreCheckoutTrial
  const nextAction = billingGate.needsLegalAcceptance
    ? 'Return to legal acceptance'
    : billingGate.requiresPlanSelection
      ? 'Choose a plan'
      : billingGate.requiresTrialStart || isPreCheckout
        ? 'Continue onboarding'
        : isPaused
          ? 'Add payment method'
          : isPastDue
            ? 'Update payment method'
            : isActive
              ? 'Manage billing when needed'
              : isCanceled
                ? 'Reactivate from a plan'
                : 'Choose a plan'

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get('checkout')
    if (checkout === 'success') {
      trackProductEvent('checkout_returned', {
        route: '/app/billing',
        plan: org.plan,
        plan_status: org.planStatus,
        has_payment_method: org.hasPaymentMethodOnFile,
        status: 'succeeded',
      })
    }
    if (checkout === 'cancelled') {
      trackProductEvent('checkout_cancelled', {
        route: '/app/billing',
        plan: org.plan,
        plan_status: org.planStatus,
      })
    }
  }, [org.hasPaymentMethodOnFile, org.plan, org.planStatus])

  useEffect(() => {
    if (org.planStatus === 'past_due') {
      trackProductEvent('subscription_past_due', {
        route: '/app/billing',
        plan: org.plan,
        plan_status: org.planStatus,
      })
    }
    if (org.planStatus === 'canceled') {
      trackProductEvent('subscription_cancelled', {
        route: '/app/billing',
        plan: org.plan,
        plan_status: org.planStatus,
      })
    }
  }, [org.plan, org.planStatus])


  useEffect(() => {
    if (!canManageBilling) return
    setInvoicesLoading(true)
    listInvoicesFn()
      .then((res) => { setInvoices(res.invoices) })
      .catch(() => { setInvoices([]) })
      .finally(() => { setInvoicesLoading(false) })
    setPaymentMethodLoading(true)
    getPaymentMethodFn()
      .then((pm) => { setPaymentMethod(pm) })
      .catch(() => { setPaymentMethod(null) })
      .finally(() => { setPaymentMethodLoading(false) })
    if (org.hasBillingSubscription) {
      getUpcomingInvoiceFn()
        .then((inv) => { setUpcomingInvoice(inv) })
        .catch(() => { setUpcomingInvoice(null) })
    } else {
      setUpcomingInvoice(null)
    }
  }, [canManageBilling, org.hasBillingSubscription])

    async function handleSubscribe(planId: PublicPlanId, cadence: BillingCadence) {
    if (!canManageBilling) {
      setError('Only organization administrators can manage billing.')
      trackProductEvent('billing_action_failed', {
        route: '/app/billing',
        operation: 'billing.checkout',
        reason: 'access_denied',
      })
      return
    }

    if (isPreCheckout) {
      trackProductEvent('billing_action_failed', {
        route: '/app/billing',
        destination_route: '/app/onboarding',
        operation: 'billing.checkout',
        reason: 'onboarding_required',
      })
      window.location.href = '/app/onboarding'
      return
    }

    setSelectedPlan(planId)
    setCheckoutPlan(planId)
    setError(null)
    setIsRedirecting(true)
    trackProductEvent('checkout_started', {
      plan: planId,
      billing_cadence: cadence,
      route: '/app/billing',
      has_payment_method: org.hasPaymentMethodOnFile,
    })
    try {
      const result = await createCheckoutSessionFn({ data: { planId, billingCadence: cadence } })
      if (result.url) {
        window.location.href = result.url
      }
    } catch (e) {
      trackProductEvent('billing_action_failed', {
        route: '/app/billing',
        operation: 'billing.checkout',
        error_type: 'client_error',
      })
      setError(getClientErrorMessage(e, {
        route: '/app/billing',
        operation: 'billing.checkout',
        fallbackMessage: 'Failed to start checkout. Please try again.',
      }))
      setIsRedirecting(false)
      setCheckoutPlan(null)
    }
  }

  async function handleManageBilling() {
    if (!canManageBilling) {
      setError('Only organization administrators can manage billing.')
      trackProductEvent('billing_action_failed', {
        route: '/app/billing',
        operation: 'billing.portal',
        reason: 'access_denied',
      })
      return
    }

    setError(null)
    setIsRedirecting(true)
    trackProductEvent('billing_portal_opened', {
      route: '/app/billing',
      plan: org.plan,
      plan_status: org.planStatus,
      has_payment_method: org.hasPaymentMethodOnFile,
    })
    try {
      const result = await createPortalSessionFn()
      if (result.url) {
        window.location.href = result.url
      }
    } catch (e) {
      trackProductEvent('billing_action_failed', {
        route: '/app/billing',
        operation: 'billing.portal',
        error_type: 'client_error',
      })
      setError(getClientErrorMessage(e, {
        route: '/app/billing',
        operation: 'billing.portal',
        fallbackMessage: 'Failed to open billing portal. Please try again.',
      }))
      setIsRedirecting(false)
    }
  }

  async function handleLegalDocumentDownload(documentType: 'terms' | 'baa') {
    setDownloadingLegalDocument(documentType)
    setError(null)
    try {
      const document = await downloadExecutedLegalDocumentFn({
        data: { documentType },
      })
      const byteCharacters = window.atob(document.contentBase64)
      const byteNumbers = Array.from(byteCharacters, (character) => character.charCodeAt(0))
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: document.mimeType })
      triggerBrowserDownload({ blob, filename: document.filename })
      trackProductEvent('billing_legal_document_downloaded', {
        route: '/app/billing',
        document_type: documentType,
      })
    } catch (e) {
      trackProductEvent('billing_legal_document_download_failed', {
        route: '/app/billing',
        document_type: documentType,
        operation: `legal.${documentType}.download`,
        error_type: 'client_error',
      })
      setError(
        getClientErrorMessage(e, {
          route: '/app/billing',
          operation: `legal.${documentType}.download`,
          fallbackMessage: 'Failed to download the executed legal document.',
        }),
      )
    } finally {
      setDownloadingLegalDocument(null)
    }
  }

  const confirmPricing = formatPlanPrice(selectedPlan, billingCadence)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow={appPublicGuidanceCopy.billing.title}
        title="Manage billing, trial access, and plan details"
        description={appPublicGuidanceCopy.billing.description}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric label={appPublicGuidanceCopy.billing.currentPlan} value={currentPlanName} detail={org.planStatus ?? 'Setup pending'} tone="brand" />
        {/* `displayedPriceMonthly` is the effective *monthly* figure even for annual
            billing, so the label must say "effective monthly" — labelling it "Annual
            price" reads as if $X were the yearly total. The /year amount lives in detail. */}
        <SummaryMetric
          label={billingCadence === 'annual' ? 'Effective monthly' : appPublicGuidanceCopy.billing.monthlyPrice}
          value={displayedPriceMonthly}
          detail={`${formatPlanPrice(selectedPlan, billingCadence).badgeLabel}. ${formatPlanPrice(selectedPlan, billingCadence).detail}`}
        />
        <SummaryMetric label={appPublicGuidanceCopy.billing.nextAction} value={nextAction} detail={appPublicGuidanceCopy.billing.recommendedStep} tone={isPastDue || isPaused ? 'warning' : 'neutral'} />
      </div>
      <Panel>

        <ContextualHelpPanel
          className="mt-6"
          title="Check your billing status before taking action"
          description="Look at the status box below. If you still need to accept the Terms and BAA, finish onboarding before going to Stripe."
          topicId="billing-help"
        />
        <CommercialOfferNote billingCadence={billingCadence} className="mt-4" />

        {(billingGate.requiresPlanSelection || billingGate.requiresTrialStart) && (
          <Alert tone="info" className="mt-6" title={appPublicGuidanceCopy.billing.trialNotStarted}>
            <p className="text-xs font-semibold uppercase tracking-caps text-brand-700">{appPublicGuidanceCopy.billing.trialNotStarted}</p>
            <p className="mt-2 text-xl font-semibold text-text-primary">{appPublicGuidanceCopy.billing.trialNotStartedBody}</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Accept the Terms and BAA, then your trial activates with every feature available.
            </p>
            <Button asChild className="mt-4">
              <a href="/app/onboarding">Continue onboarding</a>
            </Button>
          </Alert>
        )}

        {isTrialing && (
          <div className="mt-6 rounded-xl border border-border-default bg-surface-900 p-6 text-text-inverse shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-caps text-brand-200">{appPublicGuidanceCopy.billing.trialActive}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {billingGate.hasPaymentMethodOnFile
                    ? `Billing is ready for ${formatDate(billingGate.trialEndsAt, { dateStyle: 'long' })}.`
                    : billingGate.isExpiredTrialWithoutBilling
                      ? 'The trial ended without billing details on file.'
                      : `No credit card on file yet. Add billing details by ${formatDate(billingGate.trialEndsAt, { dateStyle: 'long' })}.`}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-surface-300">
                  {currentPlan ? `You are on the ${currentPlanName} plan.` : 'No active plan is on file yet.'}
                  {billingGate.hasPaymentMethodOnFile
                    ? ` Paid service will continue at ${displayedPriceMonthly} effective monthly unless you cancel before the trial end date.`
                    : ` Add billing details before the trial ends to continue at ${displayedPriceMonthly} effective monthly without interruption.`}
                </p>
              </div>
              {canManageBilling ? (
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={isRedirecting}
                  className="bg-surface-0 text-text-primary hover:bg-surface-50"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage billing
                </Button>
              ) : (
                <Alert tone="info" className="mt-2 text-sm">
                  Ask an administrator to update billing details.
                </Alert>
              )}
            </div>
          </div>
        )}

        {isPaused && (
          <div className="mt-6 rounded-xl border border-warning-300 bg-warning-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-caps text-warning-800">Trial paused</p>
            <p className="mt-2 text-xl font-semibold text-warning-900">
              The trial ended without billing details on file.
            </p>
            <p className="mt-1 text-sm leading-6 text-warning-900">
              {currentPlan
                ? `Add a payment method in Stripe to resume paid service on the ${currentPlanName} plan.`
                : 'Add a payment method in Stripe to resume paid service.'}
            </p>
            {canManageBilling ? (
              <button
                type="button"
                onClick={handleManageBilling}
                disabled={isRedirecting}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-warning-800 px-5 py-3 text-sm font-semibold text-warning-50 transition hover:bg-warning-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add payment method
              </button>
            ) : (
              <Alert tone="info" className="mt-4 text-sm">
                Ask an administrator to add a payment method to resume service.
              </Alert>
            )}
          </div>
        )}

        {isActive && (
          <div className="mt-6 rounded-xl border border-success-200 bg-success-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-caps text-success-700">Active subscription</p>
                <p className="mt-2 text-xl font-semibold text-success-900">
                  {currentPlanName} is active for {org.name}.
                </p>
                <p className="mt-1 text-sm leading-6 text-success-900">
                  Billing is live with room for up to {org.maxMembers} staff members.
                </p>
              </div>
              {canManageBilling ? (
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={isRedirecting}
                  className="inline-flex items-center justify-center rounded-full border border-success-300 px-5 py-3 text-sm font-semibold text-success-800 transition hover:bg-success-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Manage billing
                </button>
              ) : (
                <Alert tone="info" className="mt-2 text-sm">
                  Ask an administrator to manage billing settings.
                </Alert>
              )}
            </div>
          </div>
        )}

        {isPastDue && (
          <div className="mt-6 rounded-xl border border-warning-300 bg-warning-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-caps text-warning-800">Past due</p>
            <p className="mt-2 text-xl font-semibold text-warning-900">Your payment method needs attention.</p>
            <p className="mt-1 text-sm leading-6 text-warning-900">
              Update the card in Stripe to restore full billing health and keep access uninterrupted.
            </p>
            <div className="mt-4 rounded-lg border border-warning-200 bg-white p-4 space-y-2">
              {upcomingInvoice?.nextPaymentAttempt ? (
                <p className="text-sm text-warning-900">
                  <span className="font-semibold">Next retry:</span>{' '}
                  {formatUnixDate(upcomingInvoice.nextPaymentAttempt)} for{' '}
                  {formatAmountDue(upcomingInvoice.amountDue)}.
                </p>
              ) : (
                <p className="text-sm text-warning-900">Update your payment method to schedule the next retry.</p>
              )}
              {canManageBilling && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleManageBilling}
                    disabled={isRedirecting}
                    className="mt-1 inline-flex items-center justify-center rounded-full bg-warning-800 px-5 py-2 text-sm font-semibold text-warning-50 transition hover:bg-warning-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Update payment method
                  </button>
                  <button
                    type="button"
                    onClick={handleManageBilling}
                    disabled={isRedirecting}
                    className="mt-1 inline-flex items-center gap-1 rounded-full border border-warning-400 px-4 py-2 text-sm font-semibold text-warning-800 transition hover:bg-warning-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open Stripe portal
                  </button>
                </div>
              )}
              {!canManageBilling && (
                <Alert tone="info" className="mt-2 text-sm">
                  Ask an administrator to update billing and resolve this past-due balance.
                </Alert>
              )}
            </div>
          </div>
        )}

        {isCanceled && (
          <div className="mt-6 rounded-xl border border-danger-200 bg-danger-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-caps text-danger-700">Canceled</p>
            <p className="mt-2 text-xl font-semibold text-danger-900">This subscription is no longer active.</p>
            <p className="mt-1 text-sm leading-6 text-danger-900">
              Choose a plan below to reactivate billing and return to a live PHIGuard subscription.
            </p>
          </div>
        )}

        {isPreCheckout && (
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-caps text-brand-700">Trial not started</p>
            <p className="mt-2 text-xl font-semibold text-text-primary">The organization exists, but the trial has not started yet.</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Finish onboarding to accept the Terms and BAA and start the no-card trial flow.
            </p>
            <Button asChild className="mt-4">
              <a href="/app/onboarding">Return to onboarding</a>
            </Button>
          </div>
        )}

        {billingGate.needsLegalAcceptance && (
          <div className="mt-6 rounded-xl border border-warning-300 bg-warning-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-caps text-warning-800">Legal acceptance required</p>
            <p className="mt-2 text-lg font-semibold text-warning-900">Billing stays locked until the Terms and BAA are accepted.</p>
            <p className="mt-1 text-sm leading-6 text-warning-900">
              Return to onboarding and complete the legal acceptance step before attempting Stripe checkout.
            </p>
            <a
              href="/app/onboarding"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-warning-400 px-5 py-3 text-sm font-semibold text-warning-900 transition hover:bg-warning-100"
            >
              Return to legal acceptance
            </a>
          </div>
        )}

        {!isActive && !isTrialing && !isPaused && !isPastDue && !isCanceled && !isPreCheckout && (
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-caps text-brand-700">{appPublicGuidanceCopy.billing.choosePlan}</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {appPublicGuidanceCopy.billing.planPickerBody}
            </p>
          </div>
        )}

        {(!isActive && !isPaused && !isPreCheckout) && (
          <>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-text-primary">
                {isTrialing ? 'Pick your plan to keep these features after the trial' : 'Pick a plan'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {appPublicGuidanceCopy.billing.planPickerTrialBody}
              </p>
            </div>
            <div
              aria-label="Billing cadence"
              className="mt-4 flex w-full max-w-sm rounded-full border border-border-default bg-surface-0 p-1"
            >
              {(['annual', 'monthly'] as const).map((cadence) => (
                <button
                  key={cadence}
                  type="button"
                  aria-pressed={billingCadence === cadence}
                  onClick={() => {
                    setBillingCadence(cadence)
                    trackProductEvent('billing_cadence_changed', {
                      route: '/app/billing',
                      billing_cadence: cadence,
                      selected_plan: selectedPlan,
                    })
                  }}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    billingCadence === cadence
                      ? 'bg-brand-700 text-text-inverse'
                      : 'text-text-secondary hover:bg-brand-50'
                  }`}
                >
                  {cadence}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              {PUBLIC_PLAN_IDS.map((planId) => {
                const plan = PLANS[planId]
                const features = PLAN_FEATURES[planId] ?? []
                const isSelected = selectedPlan === planId
                const pricing = formatPlanPrice(planId, billingCadence)
                const coversAllUsed = isPlanAtLeast(planId, minimumPlanForUsage)
                const missingForCard = usedFeatures.filter(
                  (feature) => !PLANS[planId].features.includes(feature),
                )

                return (
                  <button
                    key={planId}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedPlan(planId)
                      trackProductEvent('billing_plan_selected', {
                        route: '/app/billing',
                        selected_plan: planId,
                        billing_cadence: billingCadence,
                        minimum_plan: minimumPlanForUsage,
                        count: missingForCard.length,
                      })
                    }}
                    className={`cursor-pointer rounded-full border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50 shadow-lg'
                        : 'border-border-default bg-surface-0 hover:border-brand-400 hover:bg-brand-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-success-700">{pricing.badgeLabel}</p>
                        <p className="text-sm font-semibold text-text-muted line-through">{pricing.listPrice}</p>
                        <p className="text-2xl font-semibold tracking-tight text-text-primary">
                          {pricing.price}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">{pricing.cadenceLabel} per clinic</p>
                    <p className="mt-1 text-xs text-text-muted">{pricing.detail}</p>

                    {usedFeatures.length > 0 && (
                      <p
                        className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          coversAllUsed
                            ? 'bg-success-100 text-success-700'
                            : 'bg-warning-100 text-warning-800'
                        }`}
                        title={
                          coversAllUsed
                            ? 'Covers every feature your team has used during the trial'
                            : `Missing: ${missingForCard.map((f) => f.replaceAll('_', ' ')).join(', ')}`
                        }
                      >
                        {coversAllUsed
                          ? 'Covers all features you used'
                          : `Missing ${missingForCard.length} feature${missingForCard.length === 1 ? '' : 's'} you used`}
                      </p>
                    )}

                    <ul className="mt-4 space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-700" />
                          {feature.replaceAll('_', ' ')}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>

            {selectedPlan && (
              <div className="mt-6 rounded-xl border border-border-default bg-background-subtle p-5">
                <p className="text-xs font-semibold uppercase tracking-caps text-brand-700">Confirm your plan</p>
                <h3 className="mt-2 text-xl font-semibold text-text-primary">
                  {PLANS[selectedPlan].name} at {confirmPricing.price}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="default">
                    {billingCadence === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  </Badge>
                  {confirmPricing.badgeLabel && (
                    <Badge variant="success">{confirmPricing.badgeLabel}</Badge>
                  )}
                  <span className="text-sm text-text-muted">{confirmPricing.detail}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="success">{commercialKnowledgeCopy.baaIncluded}</Badge>
                  <Badge variant="default">Up to {PLANS[selectedPlan].maxMembers} staff members</Badge>
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  Includes: {(PLAN_FEATURES[selectedPlan] ?? []).join(', ')}.
                </p>

                {downgradeWarning && (
                  <div className="mt-4 rounded-lg border border-warning-300 bg-warning-50 p-4">
                    <div className="flex items-start gap-2 text-warning-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                      <div>
                        <p className="text-sm font-semibold">{downgradeWarning.headline}</p>
                        <p className="mt-1 text-sm leading-6">{downgradeWarning.body}</p>
                      </div>
                    </div>
                  </div>
                )}

                {canManageBilling ? (
                  <Button
                    className="mt-5"
                    onClick={() => handleSubscribe(selectedPlan, billingCadence)}
                    disabled={isRedirecting || !billingGate.checkoutAllowed}
                  >
                    {billingGate.needsLegalAcceptance
                      ? 'Accept legal docs to continue'
                      : isRedirecting && checkoutPlan === selectedPlan
                        ? 'Redirecting to Stripe...'
                        : isTrialing
                          ? 'Continue to Stripe checkout'
                          : 'Start free trial'}
                  </Button>
                ) : (
                  <Alert tone="info" className="mt-5">
                    Ask an administrator to update billing and select a plan.
                  </Alert>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <p className="mt-5 text-sm text-danger-700" role="alert">
            {error}
          </p>
        )}

        {canManageBilling && (
          <div className="mt-8 rounded-xl border border-border-default bg-background-subtle p-5">
            <h2 className="text-lg font-semibold text-text-primary">Payment method on file</h2>
            {paymentMethodLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : paymentMethod ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary capitalize">
                    {paymentMethod.brand} ending in {paymentMethod.last4}
                  </p>
                  <p className="text-xs text-text-muted">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={isRedirecting}
                  className="inline-flex items-center gap-1 rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  Update payment method
                </button>
              </div>
            ) : paymentMethod === null ? (
              <p className="mt-2 text-sm text-text-secondary">
                No payment method on file. Add one in Stripe to activate paid service.
              </p>
            ) : null}
          </div>
        )}

        {canManageBilling && (
          <div className="mt-6 rounded-xl border border-border-default bg-background-subtle p-5">
            <h2 className="text-lg font-semibold text-text-primary">Recent payments</h2>
            {invoicesLoading ? (
              <div className="mt-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : invoices && invoices.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-default text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      <th className="pb-2 pr-4">Invoice</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2 pr-4 font-mono text-xs text-text-muted">{inv.number ?? inv.id.slice(-8)}</td>
                        <td className="py-2 pr-4 text-text-secondary">{formatUnixDate(inv.created)}</td>
                        <td className="py-2 pr-4 font-semibold text-text-primary">{formatAmountDue(inv.amountDue)}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={invoiceStatusBadgeVariant(inv.status)}>
                            {invoiceStatusLabel(inv.status)}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {inv.invoicePdf ? (
                            <a
                              href={inv.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={'Download invoice ' + (inv.number ?? inv.id)}
                              className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                              onClick={() =>
                                trackProductEvent('billing_invoice_opened', {
                                  route: '/app/billing',
                                  export_format: 'pdf',
                                  status: inv.status ?? 'unknown',
                                })
                              }
                            >
                              <Download className="h-3 w-3" />
                              PDF
                            </a>
                          ) : inv.hostedInvoiceUrl ? (
                            <a
                              href={inv.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                              onClick={() =>
                                trackProductEvent('billing_invoice_opened', {
                                  route: '/app/billing',
                                  export_format: 'hosted_invoice',
                                  status: inv.status ?? 'unknown',
                                })
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : invoices !== null ? (
              <p className="mt-2 text-sm text-text-secondary">
                No payment history on file yet. Invoices appear here once billing is active.
              </p>
            ) : null}
          </div>
        )}

                <div className="mt-10 rounded-xl border border-border-default bg-background-subtle p-5">
          <h2 className="text-lg font-semibold text-text-primary">Legal acceptance status</h2>
          {org.legalCurrent ? (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Terms accepted on {formatDate(org.termsAcceptedAt, { dateStyle: 'long' })} and BAA accepted on{' '}
              {formatDate(org.baaSignedAt, { dateStyle: 'long' })}. Billing is allowed because the legal agreements are already on file.
            </p>
          ) : org.baaSignedAt && org.termsAcceptedAt ? (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Executed legal documents are on file, but the current Terms and BAA version still need to be accepted before new billing actions can proceed.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Terms acceptance and a signed BAA are required before a trial or paid plan can activate. Complete that step in onboarding first.
            </p>
          )}
          {canManageBilling && org.baaSignedAt && org.termsAcceptedAt && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleLegalDocumentDownload('terms')}
                disabled={downloadingLegalDocument !== null}
              >
                {downloadingLegalDocument === 'terms' ? 'Preparing...' : 'Download Terms'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleLegalDocumentDownload('baa')}
                disabled={downloadingLegalDocument !== null}
              >
                {downloadingLegalDocument === 'baa' ? 'Preparing...' : 'Download BAA'}
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
