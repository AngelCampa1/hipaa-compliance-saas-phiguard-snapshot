import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@phiguard/ui'
import { PHIGUARD_APP_ORIGIN } from '@phiguard/brand/identity'
import { PUBLIC_PLAN_IDS } from '@phiguard/billing/plans'
import { BrandHeader } from '../components/brand-header'
import { trackPublicSignupEvent } from '../lib/product-analytics-browser'
import { getSafeRedirectPath } from '../lib/redirect'
import { resendSignupConfirmationFn } from '../server/signup-trial-sequence.js'

const signupCheckEmailSearchSchema = z.object({
  email: z.string().optional(),
  redirect: z.string().optional(),
  plan: z.enum(PUBLIC_PLAN_IDS).optional(),
})

type SignupCheckEmailSearch = z.infer<typeof signupCheckEmailSearchSchema>

export function validateSignupCheckEmailSearch(search: unknown) {
  return signupCheckEmailSearchSchema.parse(search)
}

export function getSignupCheckEmailContinuePath({
  redirect,
  plan,
}: Pick<SignupCheckEmailSearch, 'redirect' | 'plan'>) {
  const redirectPath = getSafeRedirectPath(redirect, '/app/onboarding')

  if (!plan) {
    return redirectPath
  }

  const continueUrl = new URL(redirectPath, PHIGUARD_APP_ORIGIN)
  if (continueUrl.pathname !== '/app/onboarding') {
    return redirectPath
  }

  continueUrl.searchParams.set('plan', plan)
  return `${continueUrl.pathname}${continueUrl.search}${continueUrl.hash}`
}

export const Route = createFileRoute('/signup/check-email')({
  validateSearch: validateSignupCheckEmailSearch,
  component: SignupCheckEmailPage,
})

function SignupCheckEmailPage() {
  const search = Route.useSearch()
  const { email } = search
  const redirectPath = getSignupCheckEmailContinuePath(search)
  const [status, setStatus] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  async function handleResend() {
    if (!email || isResending) {
      return
    }

    setIsResending(true)
    setStatus(null)

    try {
      await resendSignupConfirmationFn({ data: { email } })
      trackPublicSignupEvent('signup_confirmation_resent', {
        route: '/signup/check-email',
        selected_plan: search.plan,
        source: 'email',
      })
      setStatus(
        'If that email is connected to a PHIGuard signup, another confirmation is on the way.',
      )
    } catch {
      trackPublicSignupEvent('signup_confirmation_resend_failed', {
        route: '/signup/check-email',
        selected_plan: search.plan,
        source: 'email',
        status: 'failed',
      })
      setStatus(
        'If that email is connected to a PHIGuard signup, another confirmation is on the way.',
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main id="main" className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
      <BrandHeader />
      <div className="w-full max-w-md rounded-xl bg-surface-0 p-8 shadow-sm border border-border-default">
        <h1 className="mb-3 text-2xl font-semibold text-text-primary">Check your email</h1>
        <p className="text-sm leading-6 text-text-secondary">
          We sent a confirmation email with your setup link. You can continue now and confirm your
          email later.
        </p>
        {email ? (
          <p className="mt-4 rounded-lg border border-border-muted bg-surface-50 px-3 py-2 text-sm text-text-secondary">
            Sent to {email}
          </p>
        ) : null}
        {status ? (
          <p className="mt-4 text-sm text-success-700" role="status">
            {status}
          </p>
        ) : null}
        <div className="mt-6 space-y-3">
          <Button asChild className="w-full min-h-11">
            <Link
              to={redirectPath as '/'}
              onClick={() =>
                trackPublicSignupEvent('signup_continue_clicked', {
                  route: '/signup/check-email',
                  selected_plan: search.plan,
                  destination_route: redirectPath,
                })
              }
            >
              Continue setup
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-11"
            onClick={handleResend}
            disabled={!email || isResending}
          >
            {isResending ? 'Sending...' : 'Resend confirmation'}
          </Button>
        </div>
      </div>
    </main>
  )
}
