import './polyfills'
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import * as Sentry from '@sentry/react'
import { initSentryClient } from './lib/sentry.client'
import { logger } from '@phiguard/audit'
import type { FallbackRender } from '@sentry/react'

// Initialise Sentry before hydration so errors during hydration are captured.
// initSentryClient is a no-op when no browser Sentry DSN is configured.
initSentryClient()

/**
 * Fallback UI rendered by Sentry.ErrorBoundary when a client-side error is
 * caught during hydration or rendering.
 *
 * Renders the error card inline rather than delegating to RouteErrorFallback
 * to avoid a double Sentry.captureException call: Sentry.ErrorBoundary already
 * calls captureException internally before rendering the fallback, so
 * RouteErrorFallback's useEffect would fire a second, duplicate capture.
 *
 * Uses a plain <a href="/"> anchor rather than TanStack Router's <Link>
 * because this boundary may fire before the router is fully initialised
 * (e.g. during SSR hydration failures).
 */
const sentryFallback: FallbackRender = ({ resetError }) => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <div className="w-full max-w-md rounded-lg border border-border-default bg-surface-0 p-8 text-center shadow-sm">
      <h1 className="mb-2 text-xl font-semibold text-text-primary">Something went wrong</h1>
      <p className="mb-6 text-sm text-text-secondary">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={resetError}
          className="inline-flex items-center justify-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-text-inverse hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border-default px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          Go home
        </a>
      </div>
    </div>
  </div>
)

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <Sentry.ErrorBoundary
        fallback={sentryFallback}
        onError={(error) => logger.safe.error({ err: error }, 'client boundary')}
      >
        <StartClient />
      </Sentry.ErrorBoundary>
    </StrictMode>,
  )
})
