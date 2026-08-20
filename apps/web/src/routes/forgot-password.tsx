import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@phiguard/auth/client'
import { Button, Input } from '@phiguard/ui'
import { BrandHeader } from '../components/brand-header'
import { trackPublicAuthEvent } from '../lib/product-analytics-browser'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: window.location.origin + '/login',
      })
      trackPublicAuthEvent('password_reset_requested', {
        route: '/forgot-password',
        destination_route: '/login',
        source: 'email',
        status: 'succeeded',
      })
      setSubmittedEmail(email)
      setSubmitted(true)
    } catch {
      trackPublicAuthEvent('password_reset_request_failed', {
        route: '/forgot-password',
        destination_route: '/login',
        source: 'email',
        status: 'failed',
        reason: 'request_failed',
      })
      // Always show success to prevent email enumeration.
      setSubmittedEmail(email)
      setSubmitted(true)
    } finally {
      setIsPending(false)
    }
  }

  async function handleResend() {
    if (isResending) return
    setIsResending(true)

    try {
      const resetInput: Parameters<typeof authClient.requestPasswordReset>[0] = {
        ['email']: submittedEmail,
        redirectTo: window.location.origin + '/login',
      }
      await authClient.requestPasswordReset(resetInput)
      trackPublicAuthEvent('password_reset_resent', {
        route: '/forgot-password',
        destination_route: '/login',
        source: 'email',
        status: 'succeeded',
      })
    } catch {
      trackPublicAuthEvent('password_reset_resend_failed', {
        route: '/forgot-password',
        destination_route: '/login',
        source: 'email',
        status: 'failed',
        reason: 'request_failed',
      })
      // Always succeed silently to prevent email enumeration.
    } finally {
      setIsResending(false)
    }
  }

  function handleUseDifferentEmail() {
    trackPublicAuthEvent('password_reset_email_changed', {
      route: '/forgot-password',
      source: 'email',
    })
    setSubmitted(false)
    setEmail('')
    setSubmittedEmail('')
  }

  return (
    <main id="main" className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
      <BrandHeader />
      <div className="w-full max-w-md rounded-xl bg-surface-0 p-3 shadow-sm border border-border-default sm:p-8">
        <h1 className="mb-2 text-2xl font-semibold text-text-primary">Reset your password</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Enter your email and we will send you a reset link.
        </p>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-success-200 bg-success-50 p-4 text-sm text-success-700">
              Check your email for a reset link.
              {submittedEmail ? (
                <span className="block mt-1 font-medium">{submittedEmail}</span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              className="w-full min-h-11"
            >
              {isResending ? 'Sending...' : 'Resend reset link'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleUseDifferentEmail}
              className="w-full min-h-11"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-h-11"
            >
              {isPending ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="mt-4 text-sm text-text-secondary">
          <Link
            to="/login"
            onClick={() =>
              trackPublicAuthEvent('login_link_clicked', {
                route: '/forgot-password',
                destination_route: '/login',
                source: 'email',
              })
            }
            className="inline-flex min-h-11 items-center text-brand-600 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
