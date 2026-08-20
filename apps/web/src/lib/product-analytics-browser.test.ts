import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_ANALYTICS_CAPTURE_PATH } from './product-analytics'
import {
  initProductAnalytics,
  trackPublicAuthEvent,
  trackPublicPartnerEvent,
  trackPublicSignupEvent,
} from './product-analytics-browser'

function stubBrowser(options: { existingId?: string; randomId?: string } = {}) {
  const storage = new Map<string, string>()
  if (options.existingId) {
    storage.set('phiguard_signup_analytics_id', options.existingId)
    storage.set('phiguard_public_analytics_id', options.existingId)
  }

  vi.stubGlobal('window', {
    crypto: {
      randomUUID: vi.fn(() => options.randomId ?? '12345678-1234-4234-8234-123456789abc'),
    },
    localStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    },
  })
}

describe('product analytics browser helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('identifies the current user and organization when initialized', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser()

    initProductAnalytics({
      distinctId: 'user_123',
      organization: {
        id: 'org_123',
        plan: 'clinic',
        planStatus: 'trialing',
        memberCount: 4,
        locationCount: 1,
      },
    })

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    const events = fetch.mock.calls.map(([, init]) => JSON.parse(init.body as string).event)

    expect(events).toEqual(['$set', '$groupidentify'])
  })

  it('aliases an existing public signup journey to the authenticated user on initialization', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'signup_12345678123442348234123456789abc' })

    initProductAnalytics({
      distinctId: 'user_123',
      organization: {
        id: 'org_123',
        plan: 'clinic',
        planStatus: 'trialing',
        memberCount: 4,
        locationCount: 1,
      },
    })

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
    const payloads = fetch.mock.calls.map(([, init]) => JSON.parse(init.body as string))

    expect(payloads.map((payload) => payload.event)).toEqual([
      '$create_alias',
      '$set',
      '$groupidentify',
    ])
    expect(payloads[0]).toEqual(
      expect.objectContaining({
        event: '$create_alias',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {},
      }),
    )
  })

  it('captures public signup events with a reusable signup distinct id', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'signup_12345678123442348234123456789abc' })

    trackPublicSignupEvent('signup_started', {
      route: '/signup',
      selected_plan: 'clinic',
      source: 'email',
    })

    expect(fetch).toHaveBeenCalledWith(
      PRODUCT_ANALYTICS_CAPTURE_PATH,
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
      }),
    )
    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        api_key: 'phc_test',
        event: 'signup_started',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/signup',
          selected_plan: 'clinic',
          source: 'email',
        },
      }),
    )
  })

  it('sanitizes public signup properties before sending them from the browser', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'signup_existing_123' })

    trackPublicSignupEvent('signup_completed', {
      route: '/signup?invite=abc123',
      selected_plan: 'clinic',
      source: 'email',
      status: 'succeeded',
      email: 'patient@example.com',
      name: 'Jane Patient',
      organization_id: 'org-1',
      notes: 'Contains sensitive free text',
    })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.properties).toEqual({
      route: '/signup',
      selected_plan: 'clinic',
      source: 'email',
      status: 'succeeded',
    })
  })

  it('preserves safe marketing attribution on public signup events', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'signup_existing_123' })

    trackPublicSignupEvent('signup_started', {
      route: '/signup',
      selected_plan: 'clinic',
      source: 'email',
      landing_path: '/resources/guides/hipaa',
      initial_referrer_host: 'www.linkedin.com',
      initial_utm_source: 'linkedin',
      initial_utm_medium: 'social',
      initial_utm_campaign: 'q2',
      initial_utm_content: 'guide',
      initial_utm_term: 'hipaa',
      first_touch_id: 'ft_lwm6mj4w_ab12cd34',
      cta_location: 'pricing-card',
      pricing_plan: 'clinic',
      unsafe_attribution: 'owner@clinic.test',
    })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.properties).toEqual({
      route: '/signup',
      selected_plan: 'clinic',
      source: 'email',
      landing_path: '/resources/guides/hipaa',
      initial_referrer_host: 'www.linkedin.com',
      initial_utm_source: 'linkedin',
      initial_utm_medium: 'social',
      initial_utm_campaign: 'q2',
      initial_utm_content: 'guide',
      initial_utm_term: 'hipaa',
      first_touch_id: 'ft_lwm6mj4w_ab12cd34',
      cta_location: 'pricing-card',
      pricing_plan: 'clinic',
    })
  })

  it('replaces unsafe stored public signup distinct ids before sending them', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({
      existingId: 'signup_patient@example.com',
      randomId: '12345678-1234-4234-8234-123456789abc',
    })

    trackPublicSignupEvent('signup_started', { route: '/signup' })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.distinct_id).toBe('signup_12345678123442348234123456789abc')
  })

  it('replaces slug-like stored public signup distinct ids before sending them', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({
      existingId: 'signup_jane_patient',
      randomId: '12345678-1234-4234-8234-123456789abc',
    })

    trackPublicSignupEvent('signup_started', { route: '/signup' })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.distinct_id).toBe('signup_12345678123442348234123456789abc')
  })

  it('does not capture signup events without a PostHog key', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    stubBrowser()

    trackPublicSignupEvent('signup_started', { route: '/signup' })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('captures public auth funnel events with the reusable anonymous distinct id', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'signup_12345678123442348234123456789abc' })

    trackPublicAuthEvent('login_failed', {
      route: '/login',
      source: 'email',
      reason: 'invalid_credentials',
      email: 'owner@clinic.test',
    })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        event: 'login_failed',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/login',
          source: 'email',
          reason: 'invalid_credentials',
        },
      }),
    )
  })

  it('captures public partner events with a reusable public distinct id', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'public_12345678123442348234123456789abc' })

    trackPublicPartnerEvent('partner_magic_link_requested', {
      route: '/partner/login',
      source: 'email',
      status: 'attempted',
      email: 'partner@example.com',
    })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        event: 'partner_magic_link_requested',
        distinct_id: 'public_12345678123442348234123456789abc',
        properties: {
          route: '/partner/login',
          source: 'email',
          status: 'attempted',
        },
      }),
    )
  })

  it('preserves safe public partner retry actions', () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    )
    vi.stubGlobal('fetch', fetch)
    stubBrowser({ existingId: 'public_12345678123442348234123456789abc' })

    trackPublicPartnerEvent('partner_dashboard_retry_clicked', {
      route: '/partner/dashboard',
      category: 'partner_dashboard',
      action: 'retry',
      unsafe_action: 'partner@example.com',
    })

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.properties).toEqual({
      route: '/partner/dashboard',
      category: 'partner_dashboard',
      action: 'retry',
    })
  })
})
