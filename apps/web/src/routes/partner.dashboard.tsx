import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, formatCents } from '@phiguard/ui'
import { formatDate } from '../lib/dates.js'
import { trackPublicPartnerEvent } from '../lib/product-analytics-browser'
import { getPartnerDashboardFn } from '../server/partners'

export const Route = createFileRoute('/partner/dashboard')({
  loader: async () => {
    try {
      return await getPartnerDashboardFn()
    } catch (err) {
      if ((err as Error).message === 'Unauthorized') {
        throw redirect({ to: '/partner/login' })
      }
      throw err
    }
  },
  errorComponent: PartnerDashboardError,
  component: PartnerDashboardPage,
})

function PartnerDashboardError({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'

  useEffect(() => {
    trackPublicPartnerEvent('partner_dashboard_error_viewed', {
      route: '/partner/dashboard',
      category: 'partner_dashboard',
      status: 'failed',
      reason: 'request_failed',
    })
  }, [])

  return (
    <main id="main" className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-6">
          <h2 className="text-lg font-medium text-danger-800 mb-2">Partner portal unavailable</h2>
          <p className="text-sm text-danger-700">{message}</p>
          <a
            href="/partner/dashboard"
            onClick={() =>
              trackPublicPartnerEvent('partner_dashboard_retry_clicked', {
                route: '/partner/dashboard',
                category: 'partner_dashboard',
                action: 'retry',
              })
            }
            className="mt-4 inline-block text-sm text-danger-700 underline hover:text-danger-900"
          >
            Try again
          </a>
        </div>
      </div>
    </main>
  )
}

function PartnerDashboardPage() {
  const { partner, referralUrl, referrals, payouts } = Route.useLoaderData()
  const emptyTrackedRef = useRef(false)
  const [copied, setCopied] = useState(false)
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current)
    }
  }, [])

  async function handleCopyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      if (copyResetRef.current) clearTimeout(copyResetRef.current)
      copyResetRef.current = setTimeout(() => setCopied(false), 2000)
      trackPublicPartnerEvent('partner_referral_link_copied', {
        route: '/partner/dashboard',
        category: 'partner_dashboard',
        action: 'copy_referral_link',
      })
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The link stays
      // fully visible and selectable, so the partner can still copy it manually.
      setCopied(false)
    }
  }

  useEffect(() => {
    trackPublicPartnerEvent('partner_dashboard_viewed', {
      route: '/partner/dashboard',
      category: 'partner_dashboard',
      status: 'succeeded',
      count: referrals.length,
    })
  }, [referrals.length])

  useEffect(() => {
    if (emptyTrackedRef.current) return
    if (referrals.length > 0 && payouts.length > 0) return
    emptyTrackedRef.current = true

    if (referrals.length === 0) {
      trackPublicPartnerEvent('partner_dashboard_empty_state_viewed', {
        route: '/partner/dashboard',
        category: 'referrals',
        status: 'empty',
      })
    }

    if (payouts.length === 0) {
      trackPublicPartnerEvent('partner_dashboard_empty_state_viewed', {
        route: '/partner/dashboard',
        category: 'partner_dashboard',
        status: 'empty',
      })
    }
  }, [payouts.length, referrals.length])

  return (
    <main id="main" className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary">Partner Portal</h1>
          <p className="text-sm text-text-secondary mt-1">Welcome, {partner.name}</p>
        </div>

        <div className="bg-surface-0 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-text-primary mb-2">Your referral link</h2>
          <p className="text-sm text-text-secondary mb-3">
            Share this link with small medical clinics. When they sign up and subscribe, you earn{' '}
            <strong>{partner.commissionPct}% commission</strong> monthly.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all px-3 py-2 bg-surface-100 rounded-md text-sm font-mono">
              {referralUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyReferralLink}
              aria-label="Copy referral link"
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-success-600" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy link
                </>
              )}
            </Button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied ? 'Referral link copied to clipboard' : ''}
          </p>
        </div>

        <div className="bg-surface-0 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            Referred clinics ({referrals.length})
          </h2>
          {referrals.length === 0 ? (
            <p className="text-sm text-text-muted">
              No referrals yet. Share your referral link to get started.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b">
                  <th className="pb-2 font-medium">Clinic</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Lifetime value</th>
                  <th className="pb-2 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 font-medium text-text-primary">{r.label}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'paying'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-surface-100 text-text-secondary'
                        }`}
                      >
                        {r.status === 'paying' ? 'Paying' : 'Signed up'}
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary">~{formatCents(r.ltvRoundedCents, 0)}</td>
                    <td className="py-3 text-text-muted">
                      {formatDate(r.signedUpAt, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-surface-0 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Payout history</h2>
          {payouts.length === 0 ? (
            <p className="text-sm text-text-muted">No payouts yet. Payouts are processed monthly.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b">
                  <th className="pb-2 font-medium">Period</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 text-text-secondary">
                      {formatDate(p.periodStart, { month: 'short', year: 'numeric' })}
                      {' - '}
                      {formatDate(p.periodEnd, { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 font-medium text-text-primary">
                      {formatCents(p.amountCents)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'paid'
                            ? 'bg-success-100 text-success-800'
                            : p.status === 'cancelled'
                              ? 'bg-danger-100 text-danger-800'
                              : 'bg-warning-100 text-warning-800'
                        }`}
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
