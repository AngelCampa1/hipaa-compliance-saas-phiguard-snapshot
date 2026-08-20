import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button, Input } from '@phiguard/ui'
import { BrandHeader } from '../components/brand-header'
import { trackPublicPartnerEvent } from '../lib/product-analytics-browser'
import { requestPartnerMagicLinkFn } from '../server/partners'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/partner/login')({
  validateSearch: searchSchema,
  component: PartnerLoginPage,
})

export function getPartnerLoginError(error: string | undefined) {
  if (error === 'invalid-link') {
    return 'That partner sign-in link is invalid or expired. Request a new link to continue.'
  }

  return null
}

function PartnerLoginPage() {
  const { error: errorCode } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(getPartnerLoginError(errorCode))

  useEffect(() => {
    if (errorCode === 'invalid-link') {
      trackPublicPartnerEvent('partner_login_error_viewed', {
        route: '/partner/login',
        category: 'partner_login',
        status: 'failed',
        reason: 'invalid_link',
      })
    }
  }, [errorCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    trackPublicPartnerEvent('partner_magic_link_requested', {
      route: '/partner/login',
      category: 'partner_login',
      action: 'magic_link',
      source: 'email',
      status: 'attempted',
    })
    try {
      await requestPartnerMagicLinkFn({ data: { email } })
      setSubmitted(true)
      trackPublicPartnerEvent('partner_magic_link_check_email_viewed', {
        route: '/partner/login',
        category: 'partner_login',
        action: 'magic_link',
        source: 'email',
        status: 'succeeded',
      })
    } catch (err) {
      trackPublicPartnerEvent('partner_magic_link_request_failed', {
        route: '/partner/login',
        category: 'partner_login',
        action: 'magic_link',
        source: 'email',
        status: 'failed',
        reason: 'request_failed',
      })
      setError((err as Error).message)
    } finally {
      setIsPending(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
        <BrandHeader />
        <div className="w-full max-w-md p-8 bg-surface-0 rounded-xl shadow-sm border border-border-default text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Check your email</h1>
          <p className="text-sm text-text-secondary">
            If {email} is registered as a partner, you will receive a sign-in link shortly.
            The link expires in 15 minutes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main id="main" className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
      <BrandHeader />
      <div className="w-full max-w-md p-8 bg-surface-0 rounded-xl shadow-sm border border-border-default">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Partner Portal</h1>
        <p className="text-sm text-text-secondary mb-6">
          Enter your email address to receive a sign-in link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p className="text-sm text-danger-700" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Sending link...' : 'Send sign-in link'}
          </Button>
        </form>
      </div>
    </main>
  )
}
