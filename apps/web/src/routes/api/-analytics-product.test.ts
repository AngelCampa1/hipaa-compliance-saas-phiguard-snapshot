import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POSTHOG_CAPTURE_URL } from '../../lib/product-analytics'
import { handleProductAnalyticsCaptureRequest } from './analytics/product'

const mocks = vi.hoisted(() => ({
  resolveAppSessionFromHeaders: vi.fn(),
  resolveActiveLocationAccess: vi.fn(),
  dbSelect: vi.fn(),
}))

vi.mock('../../lib/session.server', () => ({
  resolveAppSessionFromHeaders: mocks.resolveAppSessionFromHeaders,
}))

vi.mock('../../server/access', () => ({
  resolveActiveLocationAccess: mocks.resolveActiveLocationAccess,
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: () => ({
    select: mocks.dbSelect,
  }),
  organizations: {
    id: 'organizations.id',
    plan: 'organizations.plan',
    planStatus: 'organizations.planStatus',
  },
}))

function createRequest(body: unknown) {
  return new Request('https://app.phiguard.test/api/analytics/product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('product analytics API', () => {
  beforeEach(() => {
    vi.stubEnv('PRODUCT_ANALYTICS_ENABLED', 'true')
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-29T13:30:00.000Z'))
    mocks.resolveAppSessionFromHeaders.mockResolvedValue({
      user: { id: 'server_user_123' },
      session: { activeOrganizationId: 'server_org_123' },
    })
    mocks.resolveActiveLocationAccess.mockResolvedValue({
      userId: 'server_user_123',
      organizationId: 'server_org_123',
      role: 'org_admin',
    })
    mocks.dbSelect.mockReturnValue({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([{ plan: 'clinic', planStatus: 'trialing' }]),
        }),
      }),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    mocks.resolveAppSessionFromHeaders.mockReset()
    mocks.resolveActiveLocationAccess.mockReset()
    mocks.dbSelect.mockReset()
  })

  it('forwards approved analytics payloads to PostHog with server-derived identity', async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'task_created',
        distinct_id: 'user_123',
        timestamp: '2026-04-29T12:00:00.000Z',
        properties: {
          organization_id: 'spoofed_org',
          $groups: { organization: 'spoofed_org', ignored: 'value' },
          route: '/app/tasks/23c7f93d-0620-4b17-a178-a0ec146d9f91',
          priority: 'high',
          task_title: 'Patient follow-up',
        },
      }),
    )

    expect(response.status).toBe(204)
    expect(fetch).toHaveBeenCalledWith(POSTHOG_CAPTURE_URL, expect.anything())

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        api_key: 'phc_test',
        event: 'task_created',
        distinct_id: 'server_user_123',
        timestamp: '2026-04-29T13:30:00.000Z',
      }),
    )
    expect(payload.properties).toEqual({
      route: '/app/tasks/$taskId',
      priority: 'high',
      organization_id: 'server_org_123',
      plan: 'clinic',
      plan_status: 'trialing',
      $groups: { organization: 'server_org_123' },
    })
  })

  it('keeps analytics capture best-effort when PostHog delivery fails', async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.reject(new Error('posthog unavailable')),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'task_created',
        distinct_id: 'user_123',
        properties: {
          route: '/app/tasks',
          priority: 'high',
        },
      }),
    )

    expect(response.status).toBe(204)
    expect(fetch).toHaveBeenCalledWith(POSTHOG_CAPTURE_URL, expect.anything())
  })

  it('groups authenticated analytics under the resolved organization when the session active organization is stale', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue({
      user: { id: 'server_user_123' },
      session: { activeOrganizationId: 'server_org_stale' },
    })
    mocks.resolveActiveLocationAccess.mockResolvedValue({
      userId: 'server_user_123',
      organizationId: 'server_org_123',
      role: 'org_admin',
    })
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'task_created',
        distinct_id: 'user_123',
        properties: {
          organization_id: 'spoofed_org',
          route: '/app/tasks',
        },
      }),
    )

    expect(response.status).toBe(204)
    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.properties).toEqual(
      expect.objectContaining({
        organization_id: 'server_org_123',
        $groups: { organization: 'server_org_123' },
      }),
    )
  })

  it('forwards person profile updates with server-derived user and organization properties', async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: '$set',
        distinct_id: 'spoofed_user',
        properties: {
          $set: {
            organization_id: 'spoofed_org',
            email: 'owner@clinic.test',
            name: 'Clinic Owner',
            role: 'owner with patient Jane',
          },
          $groups: { organization: 'spoofed_org' },
        },
      }),
    )

    expect(response.status).toBe(204)

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        api_key: 'phc_test',
        event: '$set',
        distinct_id: 'server_user_123',
        timestamp: '2026-04-29T13:30:00.000Z',
      }),
    )
    expect(payload.properties).toEqual({
      $set: {
        organization_id: 'server_org_123',
        plan: 'clinic',
        plan_status: 'trialing',
        role: 'org_admin',
      },
      $groups: { organization: 'server_org_123' },
    })
  })

  it('forwards public signup alias handoff with a server-derived authenticated user id', async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: '$create_alias',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          alias: 'spoofed_user',
          email: 'owner@clinic.test',
        },
      }),
    )

    expect(response.status).toBe(204)

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual({
      api_key: 'phc_test',
      event: '$create_alias',
      timestamp: '2026-04-29T13:30:00.000Z',
      properties: {
        distinct_id: 'signup_12345678123442348234123456789abc',
        alias: 'server_user_123',
      },
    })
  })

  it('rejects public signup alias handoff with unsafe anonymous ids', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: '$create_alias',
        distinct_id: 'signup_owner_email',
        properties: {},
      }),
    )

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated capture requests', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'task_created',
        distinct_id: 'user_123',
        properties: {},
      }),
    )

    expect(response.status).toBe(401)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('forwards public-safe signup analytics without an organization session', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'signup_started',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/signup',
          selected_plan: 'clinic',
          source: 'email',
          email: 'owner@clinic.test',
          name: 'Clinic Owner',
          organization_id: 'spoofed_org',
        },
      }),
    )

    expect(response.status).toBe(204)
    expect(fetch).toHaveBeenCalledWith(POSTHOG_CAPTURE_URL, expect.anything())

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        api_key: 'phc_test',
        event: 'signup_started',
        distinct_id: 'signup_12345678123442348234123456789abc',
        timestamp: '2026-04-29T13:30:00.000Z',
      }),
    )
    expect(payload.properties).toEqual({
      route: '/signup',
      selected_plan: 'clinic',
      source: 'email',
    })
  })

  it('forwards public-safe auth funnel analytics without an organization session', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'login_failed',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/login',
          source: 'email',
          reason: 'invalid_credentials',
          email: 'owner@clinic.test',
          password: 'secret',
        },
      }),
    )

    expect(response.status).toBe(204)

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.properties).toEqual({
      route: '/login',
      source: 'email',
      reason: 'invalid_credentials',
    })
  })

  it('keeps public auth funnel analytics anonymous even when a session exists', async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'login_completed',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/login',
          destination_route: '/app/dashboard',
          source: 'email',
          organization_id: 'spoofed_org',
        },
      }),
    )

    expect(response.status).toBe(204)
    expect(mocks.resolveAppSessionFromHeaders).not.toHaveBeenCalled()
    expect(mocks.resolveActiveLocationAccess).not.toHaveBeenCalled()
    expect(mocks.dbSelect).not.toHaveBeenCalled()

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        event: 'login_completed',
        distinct_id: 'signup_12345678123442348234123456789abc',
      }),
    )
    expect(payload.properties).toEqual({
      route: '/login',
      destination_route: '/app/dashboard',
      source: 'email',
    })
  })

  it('forwards public-safe partner analytics with public anonymous ids', async () => {
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'partner_magic_link_request_failed',
        distinct_id: 'public_12345678123442348234123456789abc',
        properties: {
          route: '/partner/login',
          source: 'email',
          status: 'failed',
          reason: 'request_failed',
          email: 'partner@example.com',
          partnerName: 'Jane Partner',
        },
      }),
    )

    expect(response.status).toBe(204)
    expect(mocks.resolveAppSessionFromHeaders).not.toHaveBeenCalled()

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        event: 'partner_magic_link_request_failed',
        distinct_id: 'public_12345678123442348234123456789abc',
      }),
    )
    expect(payload.properties).toEqual({
      route: '/partner/login',
      source: 'email',
      status: 'failed',
      reason: 'request_failed',
    })
  })

  it('drops public signup properties outside the signup-safe enum schema', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(new Response('{}', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'signup_completed',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/app/tasks/patient-record',
          selected_plan: 'Jane Doe clinic',
          source: 'patient has diabetes',
          status: 'succeeded',
        },
      }),
    )

    expect(response.status).toBe(204)

    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload.properties).toEqual({
      status: 'succeeded',
    })
  })

  it('rejects public signup analytics with unsafe distinct ids', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'signup_completed',
        distinct_id: 'owner@clinic.test',
        properties: { source: 'email' },
      }),
    )

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects oversized analytics payloads before auth, DB, or PostHog work', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'signup_started',
        distinct_id: 'signup_12345678123442348234123456789abc',
        properties: {
          route: '/signup',
          source: 'email',
          ignored: 'x'.repeat(9_000),
        },
      }),
    )

    expect(response.status).toBe(413)
    await expect(response.text()).resolves.toBe('Analytics payload too large')
    expect(mocks.resolveAppSessionFromHeaders).not.toHaveBeenCalled()
    expect(mocks.resolveActiveLocationAccess).not.toHaveBeenCalled()
    expect(mocks.dbSelect).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects public signup analytics with slug-like distinct ids', async () => {
    mocks.resolveAppSessionFromHeaders.mockResolvedValue(null)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'signup_completed',
        distinct_id: 'signup_jane_patient',
        properties: { source: 'email' },
      }),
    )

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects unknown product analytics events', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'free_text_note_added',
        distinct_id: 'user_123',
        properties: {},
      }),
    )

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not forward authenticated product events unless explicitly enabled', async () => {
    vi.stubEnv('PRODUCT_ANALYTICS_ENABLED', 'false')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await handleProductAnalyticsCaptureRequest(
      createRequest({
        event: 'task_created',
        distinct_id: 'user_123',
        properties: {},
      }),
    )

    expect(response.status).toBe(204)
    expect(fetch).not.toHaveBeenCalled()
  })
})
