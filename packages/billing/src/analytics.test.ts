import { afterEach, describe, expect, it, vi } from 'vitest'
import { captureBillingAnalyticsEvent } from './analytics.js'

describe('billing analytics', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('sends only approved billing properties to PostHog', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve({ ok: true, status: 200 } as Response),
    )
    vi.stubGlobal('fetch', fetch)

    await captureBillingAnalyticsEvent('checkout_completed', {
      organization_id: 'org_123',
      plan: 'clinic',
      plan_status: 'trialing',
      billing_cadence: 'annual',
      amount_cents: 226800,
      currency: 'usd',
      stripe_customer_id: 'cus_secret',
      customer_email: 'owner@clinic.test',
      invoice_url: 'https://billing.stripe.test/invoice',
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://us.i.posthog.com/capture/',
      expect.objectContaining({ method: 'POST' }),
    )
    const payload = JSON.parse(fetch.mock.calls[0]![1]!.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        api_key: 'phc_test',
        event: 'checkout_completed',
        distinct_id: 'org_123',
      }),
    )
    expect(payload.properties).toEqual({
      organization_id: 'org_123',
      plan: 'clinic',
      plan_status: 'trialing',
      billing_cadence: 'annual',
      amount_cents: 226800,
      currency: 'usd',
      $groups: { organization: 'org_123' },
    })
  })

  it('is a no-op when the PostHog key or organization id is missing', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await captureBillingAnalyticsEvent('payment_failed', {
      organization_id: 'org_123',
      plan: 'clinic',
    })

    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    await captureBillingAnalyticsEvent('payment_failed', {
      plan: 'clinic',
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('allows standardized revenue lifecycle events for dashboard health checks', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() =>
      Promise.resolve({ ok: true, status: 200 } as Response),
    )
    vi.stubGlobal('fetch', fetch)

    await captureBillingAnalyticsEvent('checkout_started', {
      organization_id: 'org_123',
      plan: 'clinic',
    })
    await captureBillingAnalyticsEvent('trial_started', {
      organization_id: 'org_123',
      plan: 'clinic',
    })
    await captureBillingAnalyticsEvent('subscription_started', {
      organization_id: 'org_123',
      plan: 'clinic',
    })

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(JSON.parse(fetch.mock.calls[0]![1]!.body as string).event).toBe('checkout_started')
    expect(JSON.parse(fetch.mock.calls[1]![1]!.body as string).event).toBe('trial_started')
    expect(JSON.parse(fetch.mock.calls[2]![1]!.body as string).event).toBe('subscription_started')
  })

  it('does not use unsafe organization ids as PostHog identifiers', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await captureBillingAnalyticsEvent('checkout_completed', {
      organization_id: 'owner@clinic.test',
      plan: 'clinic',
      plan_status: 'trialing',
    })

    await captureBillingAnalyticsEvent('checkout_completed', {
      organization_id: 'cus_secret',
      plan: 'clinic',
      plan_status: 'trialing',
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects billing analytics events outside the approved allowlist', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await expect(
      captureBillingAnalyticsEvent('invoice_url_shared' as never, {
        organization_id: 'org_123',
      }),
    ).rejects.toThrow('Unsupported billing analytics event')
    expect(fetch).not.toHaveBeenCalled()
  })
})
