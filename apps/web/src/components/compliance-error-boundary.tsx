import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { StatusPanel } from '@phiguard/ui'
import { trackProductEvent } from '../lib/product-analytics-browser'
import { isReportableError } from '../lib/error-reporting'

/**
 * Route-level error boundary for app data routes (dashboard, compliance, reports, tasks).
 *
 * Distinguishes two failure shapes so the user never lands on a dead-end:
 *  - Expected errors (a missing/deleted record, or one the user can't access):
 *    a calm "we couldn't find that" panel with NO Retry — retrying a not-found
 *    or forbidden resource can never succeed, so offering it would loop the user.
 *  - Genuine infra failures (5xx, network): the original "this page didn't load"
 *    panel with a Retry that calls router.invalidate().
 *
 * HIPAA: The raw error message is NEVER rendered. The thrown message is used
 * only to classify the failure (via isReportableError); all displayed copy is
 * static, so no PHI that may appear in an error message can leak to the page.
 */
export function AppRouteErrorBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const reportable = isReportableError(error)
  const message = error instanceof Error ? error.message : ''
  const notFound = !reportable && /not found/i.test(message)
  const errorType = reportable ? 'load_failed' : notFound ? 'not_found' : 'expected'

  useEffect(() => {
    trackProductEvent('app_error_boundary_viewed', {
      route: typeof window === 'undefined' ? '/app/other' : window.location.pathname,
      category: 'route_error',
      status: 'failed',
      error_type: errorType,
    })
  }, [errorType])

  const backLink = (
    <div className="mt-4 text-center text-sm">
      <Link
        to="/app/dashboard"
        search={{ locationId: undefined }}
        className="text-text-link underline-offset-4 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  )

  // Expected error — retrying cannot resolve a missing or inaccessible record.
  if (!reportable) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <StatusPanel
          variant="empty"
          title={notFound ? "We couldn't find that" : "This isn't available"}
          description={
            notFound
              ? 'It may have been deleted, or the link may be out of date. Go back and open it from the list.'
              : 'You may not have access to this, or it is no longer available. Go back to the dashboard to continue.'
          }
        />
        {backLink}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <StatusPanel
        variant="error"
        title="This page didn't load"
        description="We couldn't load your clinic data. Select Retry or go back to the dashboard."
        action={{
          label: 'Retry',
          onClick: () => {
            trackProductEvent('app_error_retry_clicked', {
              route: typeof window === 'undefined' ? '/app/other' : window.location.pathname,
              category: 'route_error',
              action: 'retry',
            })
            void router.invalidate()
          },
        }}
      />
      {backLink}
    </div>
  )
}
