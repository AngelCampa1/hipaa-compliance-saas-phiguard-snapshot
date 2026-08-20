import { useEffect, useMemo, useState } from 'react'
import { AiCsWidget, type AiCsWidgetProps } from '@ventora/ai-cs/react'
import { trackProductEvent } from '../lib/product-analytics-browser'

const APP_ID = 'phiguard'
const BRAND = { id: 'phiguard' } as const

// PHIGuard is a HIPAA product: the support surface must keep telling users not
// to paste patient information. These strings reuse the wording the previous
// in-house widget shipped, carried over verbatim onto the shared widget.
const COPY = {
  title: 'PHIGuard support',
  subtitle: 'No patient information, please.',
  launcher: 'Ask PHIGuard',
  placeholder: 'No patient information, please.',
  empty: 'Ask about tasks, compliance steps, or how to find something.',
} as const

type AiCsSupportWidgetProps = {
  userId: string | undefined
  currentPath: string
}

export function trackAiCsWidgetEvent(
  event: Parameters<NonNullable<AiCsWidgetProps['onEvent']>>[0],
  route = currentRoute(),
) {
  if (event.event === 'session.created') {
    trackProductEvent('app_support_session_started', {
      route,
      support_channel: 'ai_cs',
    })
    return
  }

  if (event.event === 'message.done') {
    trackProductEvent('app_support_response_received', {
      route,
      support_channel: 'ai_cs',
    })
    return
  }

  if (event.event === 'error') {
    trackProductEvent('app_support_error_shown', {
      route,
      support_channel: 'ai_cs',
      error_type: getAiCsErrorType(event.data.code),
    })
  }
}

function handleWidgetEvent(event: Parameters<NonNullable<AiCsWidgetProps['onEvent']>>[0]) {
  trackAiCsWidgetEvent(event)
}

export function trackAiCsWidgetError(_error: Error, route = currentRoute()) {
  trackProductEvent('app_support_error_shown', {
    route,
    support_channel: 'ai_cs',
    error_type: 'widget_error',
  })
}

export function createAiCsAnalyticsFetch(route: string, fetchImpl: typeof fetch = fetch) {
  return (async (input, init) => {
    const pathname = getRequestPathname(input)
    const response = await fetchImpl(input, init)

    if (!response.ok) return response

    if (pathname.endsWith('/v1/sessions')) {
      trackProductEvent('app_support_session_started', {
        route,
        support_channel: 'ai_cs',
      })
    } else if (pathname.endsWith('/v1/chat')) {
      trackProductEvent('app_support_message_sent', {
        route,
        support_channel: 'ai_cs',
      })
    } else if (pathname.endsWith('/v1/escalations')) {
      trackProductEvent('app_support_escalated', {
        route,
        support_channel: 'ai_cs',
      })
    }

    return response
  }) satisfies typeof fetch
}

function currentRoute() {
  if (typeof window === 'undefined') return '/app/other'
  return window.location.pathname
}

function getRequestPathname(input: RequestInfo | URL) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url
  return new URL(url, 'http://localhost').pathname
}

function getAiCsErrorType(code: string | undefined) {
  if (!code) return 'widget_error'
  if (code === 'rate_limited') return 'rate_limited'
  if (code === 'session_expired') return 'session_expired'
  if (code === 'network_error') return 'network_error'
  if (code.includes('upstream')) return 'upstream_error'
  return 'widget_error'
}

export function AiCsSupportWidget({ userId, currentPath }: AiCsSupportWidgetProps) {
  // Render the shared widget on the client only. @ventora/ai-cs resolves its own
  // React internals, whose hook dispatcher is null under the worker's SSR pass —
  // mounting it during SSR throws an "Invalid hook call" that fails the streamed
  // Suspense boundary (surfacing React #419 in the console). The support launcher
  // is a floating, post-auth affordance with no SSR/SEO need, so deferring it to
  // after mount keeps the server render clean without changing behavior.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const supportFetch = useMemo(() => createAiCsAnalyticsFetch(currentPath), [currentPath])
  const api = useMemo(
    () => ({ baseUrl: '/api/ai-cs', credentials: 'include', fetch: supportFetch }) as const,
    [supportFetch],
  )
  const session = useMemo(
    () => ({ appId: APP_ID, userId: userId ?? '', currentPath }),
    [userId, currentPath],
  )

  if (!mounted || !userId) {
    return null
  }

  return (
    <AiCsWidget
      api={api}
      session={session}
      brand={BRAND}
      copy={COPY}
      onEvent={handleWidgetEvent}
      onError={trackAiCsWidgetError}
    />
  )
}
