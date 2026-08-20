import * as Sentry from '@sentry/react'
import { toUserError } from './error-reporting'

export type ClientErrorContext = {
  route: string
  operation: string
  status?: number
  fallbackMessage?: string
  randomUUID?: () => string
  extra?: Record<string, unknown>
}

export function getClientErrorMessage(error: unknown, context: ClientErrorContext) {
  const userError = toUserError(error, {
    status: context.status,
    fallbackMessage: context.fallbackMessage,
    randomUUID: context.randomUUID,
  })

  if (userError.reportable) {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('surface', 'app')
        scope.setTag('route', context.route)
        scope.setTag('operation', context.operation)
        scope.setTag('trackingId', userError.trackingId ?? 'unknown')
        if (context.status) scope.setTag('status', String(context.status))
        if (context.extra) scope.setExtras(context.extra)
        Sentry.captureException(error)
      })
    } catch {
      // Error reporting should never make a handled UI error worse.
    }
  }

  return userError.message
}
