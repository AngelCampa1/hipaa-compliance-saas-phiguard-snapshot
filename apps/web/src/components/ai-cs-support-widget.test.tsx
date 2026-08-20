/**
 * Static contract tests for AiCsSupportWidget.
 *
 * The project's vitest environment is 'node' with no DOM available, so these
 * tests verify correctness by inspecting source text - the same approach used
 * in crm-feedback-widget.test.ts and src/__tests__/app-static-contracts.test.ts.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAiCsAnalyticsFetch,
  trackAiCsWidgetError,
  trackAiCsWidgetEvent,
} from './ai-cs-support-widget'
import { trackProductEvent } from '../lib/product-analytics-browser'

vi.mock('../lib/product-analytics-browser', () => ({
  trackProductEvent: vi.fn(),
}))

const root = resolve(__dirname, '..')
const widgetSrc = readFileSync(resolve(__dirname, 'ai-cs-support-widget.tsx'), 'utf8')
const appSrc = readFileSync(resolve(root, 'routes/app.tsx'), 'utf8')

describe('AiCsSupportWidget source contracts', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockClear()
  })

  it('component file exists', () => {
    expect(existsSync(resolve(__dirname, 'ai-cs-support-widget.tsx'))).toBe(true)
  })

  it('renders the shared @ventora/ai-cs React widget', () => {
    expect(widgetSrc).toContain("from '@ventora/ai-cs/react'")
    expect(widgetSrc).toContain('AiCsWidget')
    expect(widgetSrc).toContain('<AiCsWidget')
  })

  it('uses the phiguard app id', () => {
    expect(widgetSrc).toContain("const APP_ID = 'phiguard'")
    expect(widgetSrc).toContain('appId: APP_ID')
  })

  it('uses the phiguard brand preset', () => {
    expect(widgetSrc).toContain("const BRAND = { id: 'phiguard' }")
    expect(widgetSrc).toContain('brand={BRAND}')
  })

  it('talks to the same-origin BFF at /api/ai-cs with cookie credentials', () => {
    expect(widgetSrc).toContain("baseUrl: '/api/ai-cs'")
    expect(widgetSrc).toContain("credentials: 'include'")
  })

  it('never holds the HMAC secret (no signRequest/clientAssertion in the browser)', () => {
    expect(widgetSrc).not.toContain('signRequest')
    expect(widgetSrc).not.toContain('clientAssertion')
  })

  it('keeps the HIPAA "do not include patient information" reminder via copy override', () => {
    expect(widgetSrc).toContain('copy={COPY}')
    expect(widgetSrc).toContain('No patient information, please.')
  })

  it('renders nothing until a user id is available', () => {
    expect(widgetSrc).toContain('!userId')
    expect(widgetSrc).toContain('return null')
  })

  it('defers the third-party widget to the client (mount guard) so it never runs in the worker SSR pass', () => {
    expect(widgetSrc).toContain('useState(false)')
    expect(widgetSrc).toContain('useEffect(() => setMounted(true), [])')
    expect(widgetSrc).toContain('!mounted')
  })

  it('forwards the current path into the session', () => {
    expect(widgetSrc).toContain('currentPath')
  })

  it('bridges shared widget lifecycle events into product analytics without message text', () => {
    expect(widgetSrc).toContain('trackProductEvent')
    expect(widgetSrc).toContain('handleWidgetEvent')
    expect(widgetSrc).toContain('onEvent={handleWidgetEvent}')
    expect(widgetSrc).toContain('onError={trackAiCsWidgetError}')
    expect(widgetSrc).toContain("'app_support_session_started'")
    expect(widgetSrc).toContain("'app_support_message_sent'")
    expect(widgetSrc).toContain("'app_support_response_received'")
    expect(widgetSrc).toContain("'app_support_escalated'")
    expect(widgetSrc).not.toContain('event.data.content')
    expect(widgetSrc).not.toContain('event.data.message')
  })

  it('tracks AI-CS chat and escalation POSTs without reading request bodies', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 202 }))
    const analyticsFetch = createAiCsAnalyticsFetch('/app/help', fetchImpl)

    await analyticsFetch('/api/ai-cs/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user_123' }),
    })
    await analyticsFetch('/api/ai-cs/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'patient text must stay private' }),
    })
    await analyticsFetch('/api/ai-cs/v1/escalations', {
      method: 'POST',
      body: JSON.stringify({ message: 'private escalation detail' }),
    })

    expect(trackProductEvent).toHaveBeenCalledWith('app_support_session_started', {
      route: '/app/help',
      support_channel: 'ai_cs',
    })
    expect(trackProductEvent).toHaveBeenCalledWith('app_support_message_sent', {
      route: '/app/help',
      support_channel: 'ai_cs',
    })
    expect(trackProductEvent).toHaveBeenCalledWith('app_support_escalated', {
      route: '/app/help',
      support_channel: 'ai_cs',
    })
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain('patient text')
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain(
      'private escalation',
    )
  })

  it('does not count failed AI-CS POSTs as completed support actions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    const analyticsFetch = createAiCsAnalyticsFetch('/app/help', fetchImpl)

    await analyticsFetch('/api/ai-cs/v1/chat', { method: 'POST' })
    await analyticsFetch('/api/ai-cs/v1/escalations', { method: 'POST' })

    expect(trackProductEvent).not.toHaveBeenCalledWith(
      'app_support_message_sent',
      expect.anything(),
    )
    expect(trackProductEvent).not.toHaveBeenCalledWith('app_support_escalated', expect.anything())
  })

  it('tracks AI-CS SSE lifecycle events with coarse properties only', () => {
    trackAiCsWidgetEvent(
      {
        event: 'session.created',
        data: { sessionId: 'session_123' },
      },
      '/app/dashboard',
    )
    trackAiCsWidgetEvent(
      {
        event: 'message.done',
        data: { messageId: 'message_123' },
      },
      '/app/dashboard',
    )

    expect(trackProductEvent).toHaveBeenCalledWith('app_support_session_started', {
      route: '/app/dashboard',
      support_channel: 'ai_cs',
    })
    expect(trackProductEvent).toHaveBeenCalledWith('app_support_response_received', {
      route: '/app/dashboard',
      support_channel: 'ai_cs',
    })
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain('session_123')
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain('message_123')
  })

  it('tracks AI-CS visible errors without forwarding raw error text', () => {
    trackAiCsWidgetError(new Error('Request failed for patient@example.com'), '/app/help')

    expect(trackProductEvent).toHaveBeenCalledWith('app_support_error_shown', {
      route: '/app/help',
      support_channel: 'ai_cs',
      error_type: 'widget_error',
    })
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain(
      'patient@example.com',
    )
  })

  it('maps AI-CS SSE error codes to coarse analytics categories', () => {
    trackAiCsWidgetEvent(
      {
        event: 'error',
        data: {
          code: 'patient_specific_upstream_failure_123',
          message: 'Failed for patient@example.com',
        },
      },
      '/app/help',
    )

    expect(trackProductEvent).toHaveBeenCalledWith('app_support_error_shown', {
      route: '/app/help',
      support_channel: 'ai_cs',
      error_type: 'upstream_error',
    })
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain('patient')
  })

  it('memoizes api and session config across renders', () => {
    expect(widgetSrc).toContain('useMemo')
  })

  it('is imported and mounted in the authenticated app shell with userId + currentPath', () => {
    expect(appSrc).toContain("from '../components/ai-cs-support-widget'")
    expect(appSrc).toContain('<AiCsSupportWidget')
    expect(appSrc).toContain('userId={navState?.session?.user?.id}')
    expect(appSrc).toContain('currentPath={pathname}')
  })

  it('is gated behind aiCsConfigured and hidden on onboarding', () => {
    expect(appSrc).toMatch(/aiCsConfigured && !isOnboardingRoute && \(/)
  })

  it('no longer references the removed custom AiCsSupport component', () => {
    expect(appSrc).not.toContain("from '../components/ai-cs-support'")
    expect(existsSync(resolve(__dirname, 'ai-cs-support.tsx'))).toBe(false)
  })
})

describe('AI-CS v1 proxy routes', () => {
  const routesRoot = resolve(root, 'routes/api/ai-cs/v1')

  for (const name of ['sessions', 'chat', 'escalations']) {
    it(`exposes the ${name} v1 route forwarding to the BFF proxy`, () => {
      const file = resolve(routesRoot, `${name}.tsx`)
      expect(existsSync(file)).toBe(true)
      const src = readFileSync(file, 'utf8')
      expect(src).toContain(`createFileRoute('/api/ai-cs/v1/${name}')`)
      expect(src).toContain(`handleAiCsProxyRequest(request, '${name}')`)
    })
  }

  it('removed the legacy non-versioned routes', () => {
    const legacyRoot = resolve(root, 'routes/api/ai-cs')
    expect(existsSync(resolve(legacyRoot, 'sessions.tsx'))).toBe(false)
    expect(existsSync(resolve(legacyRoot, 'chat.tsx'))).toBe(false)
    expect(existsSync(resolve(legacyRoot, 'escalations.tsx'))).toBe(false)
  })
})
