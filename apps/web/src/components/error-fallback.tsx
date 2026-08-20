import { useEffect, useState } from 'react'
import * as Sentry from '@sentry/react'
import { logger } from '@phiguard/audit'
import { HeadContent, Link, Scripts } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { formatTrackingId, getReportableErrorMessage, toUserError } from '../lib/error-reporting'
import { trackProductEvent } from '../lib/product-analytics-browser'

const shellClass = 'flex min-h-screen items-center justify-center bg-background p-4'
const cardClass = 'w-full max-w-md rounded-lg border border-border-default bg-surface-0 p-8 text-center shadow-sm'
const primaryButtonClass = 'inline-flex items-center justify-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-text-inverse hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2'
const secondaryButtonClass = 'inline-flex items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2'

/**
 * Full-page error fallback for route-level error boundaries.
 *
 * HIPAA: Never renders the error message or stack trace - the thrown error
 * may contain PHI (patient record data, session context, etc.). The error is
 * forwarded to Sentry (which scrubs PHI via beforeSend hooks) and to the
 * structured logger (which uses logger.safe to strip known-PHI fields).
 */
export function RouteErrorFallback({ error, reset, info }: ErrorComponentProps) {
  const [message, setMessage] = useState(
    'We hit a problem. Try again or go back to the home page.',
  )

  useEffect(() => {
    trackProductEvent('app_error_boundary_viewed', {
      route: typeof window === 'undefined' ? '/app/other' : window.location.pathname,
      category: 'route_error',
      status: 'failed',
      error_type: 'client_error',
    })

    const userError = toUserError(error)
    if (!userError.reportable) {
      setMessage(userError.message)
      return
    }

    const eventId = Sentry.captureException(error, {
      mechanism: { type: 'generic', handled: true },
      data: { componentStack: info?.componentStack ?? 'unknown' },
    })
    setMessage(getReportableErrorMessage(formatTrackingId(eventId)))
    logger.safe.error({ err: error }, 'route error boundary')
  }, [error, info])

  return (
    <div className={shellClass}>
      <div className={cardClass}>
        <h1 className="mb-2 text-xl font-semibold text-text-primary">Something went wrong</h1>
        <p className="mb-6 text-sm text-text-secondary">
          {message}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              trackProductEvent('app_error_retry_clicked', {
                route: typeof window === 'undefined' ? '/app/other' : window.location.pathname,
                category: 'route_error',
                action: 'retry',
              })
              reset()
            }}
            className={primaryButtonClass}
          >
            Try again
          </button>
          <Link
            to="/app/dashboard"
            search={{ locationId: undefined }}
            className={secondaryButtonClass}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Root-level error fallback that includes the full HTML shell.
 *
 * TanStack Router replaces the entire root component (including <html>/<body>)
 * when errorComponent fires on the root route. This component re-provides the
 * HTML shell so the page remains valid and CSS/hydration scripts are present.
 *
 * "Go home" points to "/" rather than "/app/dashboard" because root-level
 * errors may fire on unauthenticated pages - redirecting to the dashboard
 * would cause a redirect loop for unauthenticated users.
 *
 * HIPAA: Same PHI-safe error handling as RouteErrorFallback - no error
 * message or stack trace is rendered; the error is forwarded to Sentry and
 * the structured logger only.
 */
export function RootErrorFallback({ error, reset, info }: ErrorComponentProps) {
  const [message, setMessage] = useState(
    'We hit a problem. Try again or go back to the home page.',
  )

  useEffect(() => {
    trackProductEvent('app_error_boundary_viewed', {
      route: typeof window === 'undefined' ? '/app/other' : window.location.pathname,
      category: 'root_error',
      status: 'failed',
      error_type: 'client_error',
    })

    const userError = toUserError(error)
    if (!userError.reportable) {
      setMessage(userError.message)
      return
    }

    const eventId = Sentry.captureException(error, {
      mechanism: { type: 'generic', handled: true },
      data: { componentStack: info?.componentStack ?? 'unknown' },
    })
    setMessage(getReportableErrorMessage(formatTrackingId(eventId)))
    logger.safe.error({ err: error }, 'root error boundary')
  }, [error, info])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className={shellClass}>
          <div className={cardClass}>
            <h1 className="mb-2 text-xl font-semibold text-text-primary">Something went wrong</h1>
            <p className="mb-6 text-sm text-text-secondary">
              {message}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  trackProductEvent('app_error_retry_clicked', {
                    route: typeof window === 'undefined' ? '/app/other' : window.location.pathname,
                    category: 'root_error',
                    action: 'retry',
                  })
                  reset()
                }}
                className={primaryButtonClass}
              >
                Try again
              </button>
              <Link
                to="/"
                className={secondaryButtonClass}
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

/**
 * Full-page 404 fallback for unmatched routes.
 *
 * A 404 under /app almost always means a signed-in user followed a stale link
 * to a moved/deleted record, so we steer them back to their dashboard rather
 * than dumping them on the public marketing home. The default (SSR / first
 * paint) is "/" so an unauthenticated marketing 404 is correct with no JS and
 * a signed-out visitor never hits a /app link they can't load; the app-context
 * target is resolved on mount from the URL, avoiding a hydration mismatch.
 */
export function NotFoundFallback() {
  const [inAppContext, setInAppContext] = useState(false)

  useEffect(() => {
    setInAppContext(window.location.pathname.startsWith('/app'))
  }, [])

  return (
    <div className={shellClass}>
      <div className={cardClass}>
        <h1 className="mb-2 text-xl font-semibold text-text-primary">Page not found</h1>
        <p className="mb-6 text-sm text-text-secondary">
          This page doesn't exist or may have moved.
        </p>
        {inAppContext ? (
          <Link to="/app/dashboard" search={{ locationId: undefined }} className={primaryButtonClass}>
            Back to dashboard
          </Link>
        ) : (
          <a href="/" className={primaryButtonClass}>
            Go home
          </a>
        )}
      </div>
    </div>
  )
}
