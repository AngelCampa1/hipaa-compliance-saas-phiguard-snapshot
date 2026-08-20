import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { authClient } from '@phiguard/auth/client'
import { PUBLIC_PLAN_IDS } from '@phiguard/billing/plans'
import { commercialPageCopy } from '@phiguard/knowledge/commercial'
import { publicPositioningCopy } from '@phiguard/knowledge/public'
import { Button, Input, PhiguardLogo } from '@phiguard/ui'
import { trackPublicSignupEvent } from '../lib/product-analytics-browser'
import { getSafeRedirectPath } from '../lib/redirect'
import { enrollSignupTrialSequenceFn } from '../server/signup-trial-sequence.js'

export const Route = createFileRoute('/signup')({
  validateSearch: z.object({
    redirect: z.string().optional(),
    plan: z.enum(PUBLIC_PLAN_IDS).optional(),
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
  }),
  component: SignupPage,
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

function passwordStrength(password: string): {
  score: number
  missing: string[]
} {
  const criteria = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ]
  const score = criteria.filter((c) => c.met).length
  const missing = criteria.filter((c) => !c.met).map((c) => c.label)
  return { score, missing }
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_SEGMENT_COLORS = [
  '',
  'bg-danger-500',
  'bg-warning-500',
  'bg-warning-400',
  'bg-success-500',
]

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, missing } = passwordStrength(password)

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              score >= segment ? STRENGTH_SEGMENT_COLORS[score] : 'bg-surface-200'
            }`}
          />
        ))}
      </div>
      {score > 0 && <p className="text-xs text-text-secondary">{STRENGTH_LABELS[score]}</p>}
      {missing.length > 0 && (
        <ul className="space-y-0.5">
          {missing.map((req) => (
            <li key={req} className="text-xs text-text-muted">
              &bull; {req}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SellPanel() {
  return (
    <div className="hidden h-full min-h-screen flex-col justify-between bg-surface-900 p-10 text-text-inverse lg:flex lg:p-14">
      {/* External marketing domain - intentional raw <a> */}
      <a href="https://phiguard.app" className="flex min-h-11 items-center gap-3 no-underline">
        <PhiguardLogo className="h-10" title="PHIGuard" />
      </a>

      <div className="mt-12 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">
          {publicPositioningCopy.signupEyebrow}
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {publicPositioningCopy.signupHeadlineLines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <p className="mt-6 max-w-lg text-base leading-7 text-surface-300">
          {publicPositioningCopy.signupSummary}
        </p>
        <ul className="mt-6 space-y-3 text-sm leading-6 text-surface-200">
          {publicPositioningCopy.signupBullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-300"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-3">
        {publicPositioningCopy.signupStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-surface-700 bg-surface-800 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-brand-200">
              {stat.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-text-inverse">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SignupPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const search = Route.useSearch()
  const { redirect, plan } = search
  const defaultRedirectPath = '/app/onboarding'
  const redirectPath = getSafeRedirectPath(redirect, defaultRedirectPath)
  const signupAttribution = Object.fromEntries(
    SIGNUP_ATTRIBUTION_KEYS.map((key) => [key, search[key]]).filter(([, value]) => value),
  )
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const formDisabled = !isHydrated || isPending

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const { score: pwScore } = passwordStrength(password)
  const passwordMeetsMinimum = pwScore >= 3

  if (pathname !== '/signup') {
    return <Outlet />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isHydrated) {
      return
    }

    if (!passwordMeetsMinimum) {
      setError('Please choose a stronger password before continuing.')
      trackPublicSignupEvent('signup_failed', {
        route: '/signup',
        selected_plan: plan,
        source: 'email',
        status: 'failed',
        reason: 'weak_password',
        ...signupAttribution,
      })
      return
    }

    setError(null)
    setIsPending(true)
    trackPublicSignupEvent('signup_started', {
      route: '/signup',
      selected_plan: plan,
      source: 'email',
      ...signupAttribution,
    })

    const result = await authClient.signUp.email({ name, email, password })

    setIsPending(false)

    if (result.error) {
      setError(result.error.message ?? 'Sign-up failed. Please try again.')
      trackPublicSignupEvent('signup_failed', {
        route: '/signup',
        selected_plan: plan,
        source: 'email',
        status: 'failed',
        reason: 'auth_error',
        ...signupAttribution,
      })
      return
    }

    trackPublicSignupEvent('signup_completed', {
      route: '/signup',
      selected_plan: plan,
      source: 'email',
      status: 'succeeded',
      ...signupAttribution,
    })

    try {
      await enrollSignupTrialSequenceFn({
        data: {
          email,
          name,
          sourcePagePath: '/signup',
        },
      })
    } catch {
      // Email delivery is best-effort and should not block account creation.
    }

    await navigate({
      to: '/signup/check-email',
      search: { email, redirect: redirectPath, ...(plan ? { plan } : {}) },
    })
  }

  async function handleGoogleSignIn() {
    if (!isHydrated) {
      return
    }

    const origin = window.location.origin
    setGoogleError(null)
    setIsGooglePending(true)

    const onboardingParams = new URLSearchParams()
    if (plan) onboardingParams.set('plan', plan)
    const onboardingPath = plan ? `/app/onboarding?${onboardingParams.toString()}` : redirectPath
    const newUserOnboardingParams = new URLSearchParams(onboardingParams)
    newUserOnboardingParams.set('signup', 'google')
    SIGNUP_ATTRIBUTION_KEYS.forEach((key) => {
      const value = search[key]
      if (value) newUserOnboardingParams.set(key, value)
    })
    const newUserOnboardingPath = `/app/onboarding?${newUserOnboardingParams.toString()}`
    const retryParams = new URLSearchParams()
    if (redirect) retryParams.set('redirect', redirectPath)
    if (plan) retryParams.set('plan', plan)
    SIGNUP_ATTRIBUTION_KEYS.forEach((key) => {
      const value = search[key]
      if (value) retryParams.set(key, value)
    })
    const retryPath = `/signup${retryParams.toString() ? `?${retryParams.toString()}` : ''}`

    try {
      trackPublicSignupEvent('signup_started', {
        route: '/signup',
        selected_plan: plan,
        source: 'google',
        ...signupAttribution,
      })

      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${origin}${onboardingPath}`,
        newUserCallbackURL: `${origin}${newUserOnboardingPath}`,
        errorCallbackURL: `${origin}${retryPath}`,
        requestSignUp: true,
      })

      if (result.data?.url) {
        window.location.href = result.data.url
        return
      }

      if (result.error) {
        setGoogleError(result.error.message ?? 'Google sign-up failed. Please try again.')
        trackPublicSignupEvent('signup_failed', {
          route: '/signup',
          selected_plan: plan,
          source: 'google',
          status: 'failed',
          reason: 'google_error',
          ...signupAttribution,
        })
        setIsGooglePending(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await navigate({ to: redirectPath as any })
    } catch (e) {
      setGoogleError((e as Error).message ?? 'Google sign-up failed. Please try again.')
      trackPublicSignupEvent('signup_failed', {
        route: '/signup',
        selected_plan: plan,
        source: 'google',
        status: 'failed',
        reason: 'google_error',
        ...signupAttribution,
      })
      setIsGooglePending(false)
    }
  }

  return (
    <main id="main" className="min-h-screen bg-surface-50">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        <SellPanel />

        <div className="flex items-center justify-center px-4 py-10 lg:px-14">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              Secure account access
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
              Create your PHIGuard account
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {commercialPageCopy.trialNoCard}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                label="Full name"
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formDisabled}
              />

              <Input
                label="Work email"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formDisabled}
              />

              <Input
                label="Password"
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={formDisabled}
              />
              <PasswordStrengthMeter password={password} />

              {error && (
                <p className="text-sm text-danger-700" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={formDisabled || !passwordMeetsMinimum}
                className="w-full min-h-11"
              >
                {isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-text-muted">
              <div className="h-px flex-1 bg-border-default" aria-hidden="true" />
              <span>or</span>
              <div className="h-px flex-1 bg-border-default" aria-hidden="true" />
            </div>

            {googleError && (
              <p className="mt-4 text-sm text-danger-700" role="alert">
                {googleError}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={!isHydrated || isGooglePending}
              className="mt-4 w-full min-h-11"
            >
              {isGooglePending ? 'Redirecting to Google...' : 'Continue with Google'}
            </Button>

            <p className="mt-6 text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                search={redirect ? { redirect: redirectPath } : {}}
                className="inline-flex min-h-11 items-center text-brand-700 hover:underline"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-12 flex items-center justify-between text-2xs font-semibold uppercase tracking-widest text-text-muted">
              <span>Encrypted session</span>
              <span>{commercialPageCopy.pricingTable.baaBadge}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
