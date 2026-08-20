import * as Sentry from '@sentry/react'
import type { ErrorEvent } from '@sentry/core'
import { sanitizeErrorEvent, sanitizeTransactionEvent } from './sentry-sanitize.js'

/**
 * Strips PHI from a Sentry ErrorEvent before transmission.
 * Exported for use in unit tests so the sanitization logic stays testable
 * without requiring a real Sentry DSN.
 */
export function stripPhiFromEvent(event: ErrorEvent): ErrorEvent | null {
  return sanitizeErrorEvent(event)
}

/**
 * Initialise Sentry on the client side.
 * HIPAA: sendDefaultPii is false. No session replay. All PHI is stripped
 * from errors and transactions before transmission.
 */
export function initSentryClient() {
  const dsn = import.meta.env.VITE_SENTRY_APP_DSN ?? import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? 'development',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    sendDefaultPii: false,
    initialScope: {
      tags: {
        surface: 'app',
      },
    },
    beforeSend: stripPhiFromEvent,
    beforeSendTransaction: sanitizeTransactionEvent,
  })
}
