import * as Sentry from '@sentry/node'
import type { NodeOptions } from '@sentry/node'
import { redact } from '@phiguard/audit'
import { sanitizeErrorEvent, sanitizeTransactionEvent } from './sentry-sanitize.js'

export type ServerExceptionContext = {
  surface?: 'api' | 'app' | 'auth' | 'worker' | 'scheduled'
  route?: string
  operation?: string
  status?: number
  trackingId?: string
  tags?: Record<string, string | number | boolean | null | undefined>
  extra?: Record<string, unknown>
}

function getBindingValue(env: Record<string, unknown> | undefined, key: string) {
  const value = env?.[key]
  return typeof value === 'string' && value ? value : undefined
}

export function getSentryServerOptions(env?: Record<string, unknown>): NodeOptions | undefined {
  const dsn =
    getBindingValue(env, 'SENTRY_API_DSN') ??
    getBindingValue(env, 'SENTRY_DSN') ??
    process.env.SENTRY_API_DSN ??
    process.env.SENTRY_DSN

  if (!dsn) return undefined

  const environment =
    getBindingValue(env, 'APP_ENV') ??
    getBindingValue(env, 'VITE_APP_ENV') ??
    process.env.APP_ENV ??
    process.env.VITE_APP_ENV ??
    process.env.NODE_ENV ??
    'development'
  const release = process.env.SENTRY_RELEASE

  return {
    dsn,
    environment,
    release,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend: (event) => sanitizeErrorEvent(event as Parameters<typeof sanitizeErrorEvent>[0]) as typeof event | null,
    beforeSendTransaction: (event) =>
      sanitizeTransactionEvent(event as Parameters<typeof sanitizeTransactionEvent>[0]) as typeof event | null,
    initialScope: {
      tags: {
        surface: 'api',
      },
    },
  }
}

/**
 * Server instrumentation is optional; this remains a no-op so the shared server
 * module can be imported safely in tests.
 */
export function initSentryServer(dsn: string | undefined) {
  void dsn
  void getSentryServerOptions
}

export function captureServerException(error: unknown, context: ServerExceptionContext = {}) {
  try {
    Sentry.withScope((scope) => {
      scope.setTag('surface', context.surface ?? 'api')

      if (context.route) scope.setTag('route', context.route)
      if (context.operation) scope.setTag('operation', context.operation)
      if (context.status) scope.setTag('status', String(context.status))
      if (context.trackingId) scope.setTag('trackingId', context.trackingId)

      for (const [key, value] of Object.entries(context.tags ?? {})) {
        if (value !== undefined && value !== null) {
          scope.setTag(key, String(value))
        }
      }

      if (context.extra) {
        scope.setExtras(redact(context.extra) as Record<string, unknown>)
      }

      Sentry.captureException(error)
    })
  } catch {
    // Observability should never change application control flow.
  }
}
