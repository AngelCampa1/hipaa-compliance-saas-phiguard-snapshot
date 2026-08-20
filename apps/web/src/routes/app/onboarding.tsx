import { PLANS, TRIAL_DAYS, type PublicPlanId } from '@phiguard/billing/plans'
import { commercialKnowledgeCopy } from '@phiguard/knowledge/commercial'
import { Alert, Button, InputPrimitive } from '@phiguard/ui'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, ShieldCheck } from 'lucide-react'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { CommercialOfferNote, PUBLIC_PLAN_IDS, formatPlanPrice } from '../../lib/billing-catalog.js'
import { getClientErrorMessage } from '../../lib/client-errors.js'
import { formatDate } from '../../lib/dates.js'
import { appPublicGuidanceCopy } from '../../lib/help-content.js'
import {
  validateOnboardingLegalStep,
  type OnboardingLegalField,
  type OnboardingLegalValidationResult,
} from '../../lib/onboarding-legal.js'
import { resolveInitialOnboardingStep } from '../../lib/phase-two-flow.js'
import { PLAN_FEATURES } from '../../lib/plan-features.js'
import { trackProductEvent, trackPublicSignupEvent } from '../../lib/product-analytics-browser.js'
import { acceptLegalDocumentsFn, getLegalStatusFn, recordEarlyLegalAcceptanceFn } from '../../server/baa.js'
import { getOrgBillingFn, selectPlanFn, startTrialFn } from '../../server/billing.js'
import { bootstrapOrganizationFn } from '../../server/organizations'

const searchSchema = z.object({
  plan: z.enum(PUBLIC_PLAN_IDS).optional(),
  signup: z.enum(['google']).optional(),
  landing_path: z.string().optional(),
  first_touch_id: z.string().optional(),
  initial_referrer_host: z.string().optional(),
  initial_utm_source: z.string().optional(),
  initial_utm_medium: z.string().optional(),
  initial_utm_campaign: z.string().optional(),
  initial_utm_content: z.string().optional(),
  initial_utm_term: z.string().optional(),
  cta_location: z.string().optional(),
  pricing_plan: z.enum(PUBLIC_PLAN_IDS).optional(),
  step: z.coerce.number().optional(),
})

const SIGNUP_ATTRIBUTION_KEYS = [
  'landing_path',
  'first_touch_id',
  'initial_referrer_host',
  'initial_utm_source',
  'initial_utm_medium',
  'initial_utm_campaign',
  'initial_utm_content',
  'initial_utm_term',
  'cta_location',
  'pricing_plan',
] as const

export const Route = createFileRoute('/app/onboarding')({
  validateSearch: searchSchema,
  component: OnboardingPage,
})

type LegalStatus = 'loading' | 'none' | 'accepted'

interface LegalDocument {
  type: 'terms' | 'baa'
  title: string
  version: string
  contentHash: string
  effectiveDate: string
  sections: Array<{
    heading: string
    paragraphs: string[]
    bullets?: string[]
  }>
}

const STEP_LABELS: Record<number, string> = {
  1: 'Workspace setup',
  2: 'Choose a plan',
  3: 'Legal acceptance',
  4: 'Start trial',
  5: 'Review access',
}

const TOTAL_STEPS = 5

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mt-6 flex items-center gap-1">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep
        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                isCompleted
                  ? 'bg-brand-700 text-text-inverse'
                  : isCurrent
                    ? 'border-2 border-brand-700 bg-surface-0 text-brand-700'
                    : 'bg-surface-200 text-text-muted'
              }`}
              aria-label={`Step ${step}: ${STEP_LABELS[step]}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            >
              {isCompleted ? <Check className="h-3 w-3" /> : step}
            </div>
            {step < TOTAL_STEPS && (
              <div className={`h-0.5 w-6 ${isCompleted ? 'bg-brand-700' : 'bg-surface-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function OnboardingPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const signupAttribution = useMemo(
    () =>
      Object.fromEntries(
        SIGNUP_ATTRIBUTION_KEYS.map((key) => [key, search[key]]).filter(([, value]) => value),
      ),
    [
      search.landing_path,
      search.first_touch_id,
      search.initial_referrer_host,
      search.initial_utm_source,
      search.initial_utm_medium,
      search.initial_utm_campaign,
      search.initial_utm_content,
      search.initial_utm_term,
      search.cta_location,
      search.pricing_plan,
    ],
  )

  const initialStep = resolveInitialOnboardingStep({ step: search.step })

  const [currentStep, setCurrentStep] = useState(initialStep)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const [clinicName, setClinicName] = useState('')
  const [customerEntityName, setCustomerEntityName] = useState('')
  const [signerName, setSignerName] = useState('')
  const [signerTitle, setSignerTitle] = useState('')
  const [legalStatus, setLegalStatus] = useState<LegalStatus>('loading')
  const [canManageLegal, setCanManageLegal] = useState(false)
  const [requiresReacceptance, setRequiresReacceptance] = useState(false)
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [documentsLoadError, setDocumentsLoadError] = useState<string | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptBaa, setAcceptBaa] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<OnboardingLegalValidationResult | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PublicPlanId>(search.plan ?? 'essentials')
  const [planStatus, setPlanStatus] = useState<string | null>(null)
  const validationSummaryRef = useRef<HTMLDivElement | null>(null)
  const clinicNameRef = useRef<HTMLInputElement | null>(null)
  const customerEntityNameRef = useRef<HTMLInputElement | null>(null)
  const signerNameRef = useRef<HTMLInputElement | null>(null)
  const signerTitleRef = useRef<HTMLInputElement | null>(null)
  const acceptTermsRef = useRef<HTMLInputElement | null>(null)
  const acceptBaaRef = useRef<HTMLInputElement | null>(null)
  const recordedSignupCompletionRef = useRef(false)

  useEffect(() => {
    if (recordedSignupCompletionRef.current || search.signup !== 'google') return
    recordedSignupCompletionRef.current = true
    trackPublicSignupEvent('signup_completed', {
      route: '/signup',
      selected_plan: search.plan,
      source: 'google',
      status: 'succeeded',
      ...signupAttribution,
    })
  }, [search.plan, search.signup, signupAttribution])

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Fetch legal status first so we can gate the trialing/active redirect on
      // legal acceptance. Trialing orgs must still accept legal terms before
      // accessing the dashboard.
      let legalFullyAccepted = false
      try {
        const result = await getLegalStatusFn()
        if (cancelled) return
        setDocuments(result.documents)
        setDocumentsLoadError(null)
        setCanManageLegal(result.canManageLegal)
        setRequiresReacceptance(result.requiresReacceptance)
        setLegalStatus(result.fullyAccepted ? 'accepted' : 'none')
        legalFullyAccepted = result.fullyAccepted
        // Resume mid-flow: legal accepted but trial not yet started
        if (result.fullyAccepted) {
          setCurrentStep((prev) => Math.max(prev, 4))
        }
      } catch {
        if (cancelled) return
        setDocuments([])
        setDocumentsLoadError(
          'We could not load the current Terms and BAA. Please refresh and try again before accepting.',
        )
        trackProductEvent('onboarding_documents_load_failed', {
          route: '/app/onboarding',
          operation: 'legal.documents.load',
          error_type: 'load_failed',
        })
        setLegalStatus('none')
        setCanManageLegal(false)
      }

      try {
        const org = await getOrgBillingFn()
        if (cancelled) return
        setOrganizationName(org.name)
        setClinicName((prev) => prev || org.name)
        setCustomerEntityName((prev) => prev || org.name)
        setPlanStatus(org.planStatus)
        // Only redirect to dashboard when legal has been accepted - trialing and
        // active orgs that haven't accepted legal must complete the legal step first.
        if (legalFullyAccepted && (org.planStatus === 'trialing' || org.planStatus === 'active')) {
          await navigate({ to: '/app/dashboard', search: { locationId: undefined } })
          return
        }
        // Auto-resume: trial_pending means legal is done - skip to the finalization step
        if (org.planStatus === 'trial_pending') {
          setCurrentStep(4)
        }
      } catch {
        // No org yet - will be bootstrapped on submit.
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  function focusInvalidField(field: OnboardingLegalField | null) {
    const refs: Record<OnboardingLegalField, RefObject<HTMLInputElement | null>> = {
      clinicName: clinicNameRef,
      customerEntityName: customerEntityNameRef,
      signerName: signerNameRef,
      signerTitle: signerTitleRef,
      acceptTerms: acceptTermsRef,
      acceptBaa: acceptBaaRef,
    }

    if (!field) {
      validationSummaryRef.current?.focus()
      return
    }

    refs[field].current?.focus()
  }

  async function handleAcceptAndStart() {
    if (isAccepting || isFinalizing) return
    setError(null)

    if (legalStatus !== 'accepted') {
      const result = validateOnboardingLegalStep({
        hasOrganization: Boolean(organizationName),
        clinicName,
        customerEntityName,
        signerName,
        signerTitle,
        acceptTerms,
        acceptBaa,
        requiresLegalAcceptance: true,
      })
      setValidation(result)

      if (!result.isValid) {
        trackProductEvent('onboarding_validation_failed', {
          route: '/app/onboarding',
          count: result.missingItems.length,
          step: 3,
        })
        window.requestAnimationFrame(() => focusInvalidField(result.firstInvalidField))
        return
      }
    }

    setIsAccepting(true)
    setIsFinalizing(false)

    try {
      let orgName = organizationName
      if (!orgName) {
        const resolvedClinicName = clinicName.trim() || customerEntityName.trim()
        const result = await bootstrapOrganizationFn({
          data: {
            clinicName: resolvedClinicName,
            inviteEmail: '',
            interestedPlan: selectedPlan,
          },
        })
        orgName = result.organization.name
        setOrganizationName(orgName)
        trackProductEvent('plan_selected', {
          route: '/app/onboarding',
          plan: selectedPlan,
        })
      }

      if (legalStatus !== 'accepted') {
        if (!acceptTerms || !acceptBaa) {
          setError('You must check both acceptance boxes before continuing.')
          return
        }
        await acceptLegalDocumentsFn({
          data: {
            customerEntityName: customerEntityName.trim(),
            signerName: signerName.trim(),
            signerTitle: signerTitle.trim(),
            expectedTermsVersion:
              documents.find((document) => document.type === 'terms')?.version ?? '',
            expectedTermsHash:
              documents.find((document) => document.type === 'terms')?.contentHash ?? '',
            expectedBaaVersion:
              documents.find((document) => document.type === 'baa')?.version ?? '',
            expectedBaaHash:
              documents.find((document) => document.type === 'baa')?.contentHash ?? '',
            acceptTerms,
            acceptBaa,
          },
        })
        trackProductEvent('legal_terms_accepted', { route: '/app/onboarding' })
        trackProductEvent('baa_signed', { route: '/app/onboarding' })
        setLegalStatus('accepted')
      }

      setIsFinalizing(true)
      await selectPlanFn({ data: { planId: selectedPlan } })
      await startTrialFn()
      trackProductEvent('trial_started', {
        route: '/app/onboarding',
        plan: selectedPlan,
      })
      trackProductEvent('activation_completed', {
        route: '/app/onboarding',
        activation_type: 'trial_started',
        plan: selectedPlan,
      })

      await navigate({ to: '/app/dashboard', search: { locationId: undefined } })
    } catch (e) {
      trackProductEvent('onboarding_action_failed', {
        route: '/app/onboarding',
        operation: 'accept-and-start',
        error_type: 'client_error',
      })
      setError(
        getClientErrorMessage(e, { route: '/app/onboarding', operation: 'accept-and-start' }),
      )
    } finally {
      setIsAccepting(false)
      setIsFinalizing(false)
    }
  }

  const submitDisabled =
    isAccepting ||
    isFinalizing ||
    legalStatus === 'loading' ||
    Boolean(documentsLoadError) ||
    documents.length === 0 ||
    !canManageLegal
  const fieldErrors = validation?.fieldErrors ?? {}

  // Consolidated error banner list
  const bannerErrors: string[] = []
  if (documentsLoadError) bannerErrors.push(documentsLoadError)
  if (!documentsLoadError && !canManageLegal && organizationName) {
    bannerErrors.push(
      'Only an organization administrator can accept the Terms and BAA on behalf of this clinic. Ask an org owner or org admin to complete this step.',
    )
  }
  if (error) bannerErrors.push(error)

  const stepLabel = STEP_LABELS[currentStep] ?? `Step ${currentStep}`

  // When legal is already accepted and this is not a trial_pending resume, show
  // an action button that records the early-legal-acceptance audit event before
  // navigating to the dashboard.
  if (legalStatus === 'accepted' && planStatus !== 'trial_pending') {
    return (
      <div className="onboarding-bg min-h-screen px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-success-200 bg-success-50 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-caps text-success-700">
            {appPublicGuidanceCopy.onboardingTrial.readyLabel}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-success-900">
            {appPublicGuidanceCopy.onboardingTrial.readyHeading}
          </h2>
          <p className="mt-2 text-sm leading-6 text-success-800">
            {appPublicGuidanceCopy.onboardingTrial.readyBody}
          </p>
          {/* Button records early-legal-acceptance audit event then navigates */}
          <button
            type="button"
            className="mt-5 inline-flex items-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 disabled:opacity-60"
            disabled={isAccepting}
            onClick={async () => {
              if (isAccepting) return
              setIsAccepting(true)
              setError(null)
              try {
                await recordEarlyLegalAcceptanceFn()
                trackProductEvent('onboarding_continue_clicked', {
                  route: '/app/onboarding',
                  destination_route: '/app/dashboard',
                  status: 'legal_accepted',
                })
                await navigate({ to: '/app/dashboard', search: { locationId: undefined } })
              } catch (e) {
                trackProductEvent('onboarding_action_failed', {
                  route: '/app/onboarding',
                  operation: 'early-legal-accept',
                  error_type: 'client_error',
                })
                setError(
                  getClientErrorMessage(e, {
                    route: '/app/onboarding',
                    operation: 'early-legal-accept',
                  }),
                )
              } finally {
                setIsAccepting(false)
              }
            }}
          >
            {isAccepting ? 'Continuing...' : 'Continue to dashboard'}
          </button>
          {error && (
            <p className="mt-4 text-sm text-danger-700" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding-bg min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-80">
          <div className="rounded-xl border border-border-default bg-surface-0 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              Step {currentStep} of {TOTAL_STEPS}: {stepLabel}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
              {appPublicGuidanceCopy.onboardingTrial.lastStepHeading}
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              {appPublicGuidanceCopy.onboardingTrial.legalAcceptanceBody}
            </p>

            <StepIndicator currentStep={currentStep} />

            <div className="mt-6 rounded-xl bg-surface-900 p-5 text-text-inverse">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-caps text-brand-200">
                <ShieldCheck className="h-4 w-4" />
                {appPublicGuidanceCopy.onboardingTrial.includesHeading}
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-surface-300">
                {appPublicGuidanceCopy.onboardingTrial.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {/* Plan picker */}
          <div className="rounded-xl border border-border-default bg-surface-0 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              Step 2: Choose a plan
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
              Choose the plan that fits your clinic
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {commercialKnowledgeCopy.baaIncluded} {commercialKnowledgeCopy.pricingModel}.
            </p>
            <CommercialOfferNote className="mt-2" />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {PUBLIC_PLAN_IDS.map((planId) => {
                const plan = PLANS[planId]
                const features = PLAN_FEATURES[planId] ?? []
                const isSelected = selectedPlan === planId
                const pricing = formatPlanPrice(planId, 'annual')

                return (
                  <button
                    key={planId}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(planId)
                      setCurrentStep((prev) => Math.max(prev, 2))
                      trackProductEvent('onboarding_plan_selected', {
                        route: '/app/onboarding',
                        selected_plan: planId,
                      })
                    }}
                    aria-pressed={isSelected}
                    className={`cursor-pointer rounded-full border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-1 ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50 shadow-md'
                        : 'border-border-default bg-surface-0 hover:border-brand-400 hover:bg-brand-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-text-primary">{plan.name}</h3>
                      {isSelected && (
                        <span className="rounded-full bg-brand-700 p-0.5 text-text-inverse">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-success-700">
                      {pricing.badgeLabel}
                    </p>
                    <p className="text-lg font-semibold tracking-tight text-text-primary">
                      {pricing.price}
                    </p>
                    <p className="text-xs text-text-muted">{pricing.cadenceLabel} per clinic</p>
                    <ul className="mt-3 space-y-1">
                      {features.slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-1.5 text-xs text-text-secondary"
                        >
                          <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-brand-700" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>

            {selectedPlan === 'essentials' && !search.plan && (
              <p className="mt-3 text-xs text-text-secondary">
                Your trial will start on Essentials. You can switch plans anytime in Billing.
              </p>
            )}
          </div>

          {/* Legal acceptance */}
          <div className="rounded-xl border border-border-default bg-surface-0 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              {appPublicGuidanceCopy.onboardingTrial.legalGateLabel}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
              {requiresReacceptance
                ? appPublicGuidanceCopy.onboardingTrial.legalGateHeading
                : appPublicGuidanceCopy.onboardingTrial.acceptBothCta}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
              {requiresReacceptance
                ? 'PHIGuard updated its Terms or BAA. You need to accept the new version before protected access resumes.'
                : 'This is the only step you need to complete. Sign once and your clinic is ready to use PHIGuard.'}
            </p>

            <fieldset disabled={isFinalizing} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="clinicName"
                  className="block text-sm font-semibold text-text-primary"
                >
                  Clinic name
                </label>
                <InputPrimitive
                  ref={clinicNameRef}
                  id="clinicName"
                  type="text"
                  value={clinicName}
                  onChange={(event) => {
                    setClinicName(event.target.value)
                    setValidation(null)
                  }}
                  placeholder="Riverside Family Practice"
                  disabled={Boolean(organizationName)}
                  error={Boolean(fieldErrors.clinicName)}
                  aria-describedby={fieldErrors.clinicName ? 'clinicName-error' : undefined}
                  className="mt-2 rounded-2xl px-4 py-3"
                />
                {fieldErrors.clinicName && (
                  <p id="clinicName-error" className="mt-1 text-xs text-danger-700">
                    {fieldErrors.clinicName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="customerEntityName"
                  className="block text-sm font-semibold text-text-primary"
                >
                  Customer legal entity name
                </label>
                <InputPrimitive
                  ref={customerEntityNameRef}
                  id="customerEntityName"
                  type="text"
                  value={customerEntityName}
                  onChange={(event) => {
                    setCustomerEntityName(event.target.value)
                    setValidation(null)
                  }}
                  placeholder="Riverside Family Practice, PLLC"
                  disabled={!canManageLegal}
                  error={Boolean(fieldErrors.customerEntityName)}
                  aria-describedby={
                    fieldErrors.customerEntityName ? 'customerEntityName-error' : undefined
                  }
                  className="mt-2 rounded-2xl px-4 py-3"
                />
                {fieldErrors.customerEntityName && (
                  <p id="customerEntityName-error" className="mt-1 text-xs text-danger-700">
                    {fieldErrors.customerEntityName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="signerName"
                  className="block text-sm font-semibold text-text-primary"
                >
                  Signer full name
                </label>
                <InputPrimitive
                  ref={signerNameRef}
                  id="signerName"
                  type="text"
                  value={signerName}
                  onChange={(event) => {
                    setSignerName(event.target.value)
                    setValidation(null)
                  }}
                  placeholder="Jane Smith"
                  disabled={!canManageLegal}
                  error={Boolean(fieldErrors.signerName)}
                  aria-describedby={fieldErrors.signerName ? 'signerName-error' : undefined}
                  className="mt-2 rounded-2xl px-4 py-3"
                />
                {fieldErrors.signerName && (
                  <p id="signerName-error" className="mt-1 text-xs text-danger-700">
                    {fieldErrors.signerName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="signerTitle"
                  className="block text-sm font-semibold text-text-primary"
                >
                  Signer title
                </label>
                <InputPrimitive
                  ref={signerTitleRef}
                  id="signerTitle"
                  type="text"
                  value={signerTitle}
                  onChange={(event) => {
                    setSignerTitle(event.target.value)
                    setValidation(null)
                  }}
                  placeholder="Practice Administrator"
                  disabled={!canManageLegal}
                  error={Boolean(fieldErrors.signerTitle)}
                  aria-describedby={fieldErrors.signerTitle ? 'signerTitle-error' : undefined}
                  className="mt-2 rounded-2xl px-4 py-3"
                />
                {fieldErrors.signerTitle && (
                  <p id="signerTitle-error" className="mt-1 text-xs text-danger-700">
                    {fieldErrors.signerTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {documents.map((document) => (
                <div
                  key={document.type}
                  className="rounded-xl border border-border-default bg-background-subtle p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-text-primary">{document.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">
                        Version {document.version} | Effective{' '}
                        {formatDate(document.effectiveDate, { dateStyle: 'long' })}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
                      {document.type === 'terms' ? 'Terms' : 'BAA'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {document.sections.map((section) => (
                      <div key={section.heading}>
                        <p className="text-sm font-semibold text-text-primary">{section.heading}</p>
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="mt-2 text-sm leading-6 text-text-secondary">
                            {paragraph}
                          </p>
                        ))}
                        {section.bullets && (
                          <ul className="mt-2 space-y-2">
                            {section.bullets.map((bullet) => (
                              <li key={bullet} className="text-sm leading-6 text-text-secondary">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 rounded-xl border border-border-default bg-surface-0 p-5">
              <label className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                <input
                  ref={acceptTermsRef}
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => {
                    setAcceptTerms(event.target.checked)
                    setValidation(null)
                  }}
                  disabled={!canManageLegal}
                  aria-invalid={fieldErrors.acceptTerms ? true : undefined}
                  aria-describedby={fieldErrors.acceptTerms ? 'acceptTerms-error' : undefined}
                  className="mt-1 h-4 w-4 rounded border-border-default text-brand-700 focus:ring-brand-700"
                />
                <span>
                  I accept the PHIGuard Terms of Service on behalf of the customer legal entity
                  above.
                </span>
              </label>
              {fieldErrors.acceptTerms && (
                <p id="acceptTerms-error" className="pl-7 text-xs text-danger-700">
                  {fieldErrors.acceptTerms}
                </p>
              )}
              <label className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                <input
                  ref={acceptBaaRef}
                  id="acceptBaa"
                  type="checkbox"
                  checked={acceptBaa}
                  onChange={(event) => {
                    setAcceptBaa(event.target.checked)
                    setValidation(null)
                  }}
                  disabled={!canManageLegal}
                  aria-invalid={fieldErrors.acceptBaa ? true : undefined}
                  aria-describedby={fieldErrors.acceptBaa ? 'acceptBaa-error' : undefined}
                  className="mt-1 h-4 w-4 rounded border-border-default text-brand-700 focus:ring-brand-700"
                />
                <span>
                  I accept the PHIGuard Business Associate Agreement and represent that I have
                  authority to bind the customer legal entity above.
                </span>
              </label>
              {fieldErrors.acceptBaa && (
                <p id="acceptBaa-error" className="pl-7 text-xs text-danger-700">
                  {fieldErrors.acceptBaa}
                </p>
              )}
            </div>
            </fieldset>

            {validation && !validation.isValid && (
              <div
                ref={validationSummaryRef}
                tabIndex={-1}
                role="alert"
                className="mt-4 rounded-2xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700"
              >
                <p className="font-semibold">
                  {appPublicGuidanceCopy.onboardingTrial.incompleteHeading}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {validation.missingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {bannerErrors.length > 0 && (
              <Alert
                tone={documentsLoadError || error ? 'danger' : 'warning'}
                title={bannerErrors.length > 1 ? 'Action required before continuing' : undefined}
                className="mt-4"
              >
                {bannerErrors.length === 1 ? (
                  bannerErrors[0]
                ) : (
                  <ul className="list-disc space-y-1 pl-4">
                    {bannerErrors.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}

            <Button
              size="lg"
              className="mt-6"
              onClick={handleAcceptAndStart}
              disabled={submitDisabled}
            >
              {isFinalizing
                ? 'Starting your trial...'
                : isAccepting
                  ? 'Recording acceptance...'
                  : `Accept and start ${TRIAL_DAYS}-day trial`}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
