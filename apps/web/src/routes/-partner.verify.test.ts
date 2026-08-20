import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: vi.fn(() => vi.fn(() => ({}))),
}))

const mocks = vi.hoisted(() => ({
  verifyPartnerMagicLinkFn: vi.fn(),
  capturePublicProductAnalyticsEvent: vi.fn(),
}))

vi.mock('../server/partners', () => ({
  verifyPartnerMagicLinkFn: mocks.verifyPartnerMagicLinkFn,
}))

vi.mock('../lib/product-analytics', () => ({
  capturePublicProductAnalyticsEvent: mocks.capturePublicProductAnalyticsEvent,
}))

import { handlePartnerVerify } from './partner.verify'

describe('handlePartnerVerify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PRODUCT_ANALYTICS_ENABLED', 'true')
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
  })

  it('captures successful magic link verification without forwarding the token', async () => {
    mocks.verifyPartnerMagicLinkFn.mockResolvedValue({
      sessionCookie: 'pg_partner_session=session-token; HttpOnly; Path=/',
    })

    const response = await handlePartnerVerify(
      new Request('https://app.phiguard.test/partner/verify?token=secret-token'),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/partner/dashboard')
    expect(response.headers.get('set-cookie')).toContain('pg_partner_session=session-token')
    expect(mocks.capturePublicProductAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'phc_test',
        eventName: 'partner_magic_link_verified',
        properties: {
          route: '/partner/verify',
          destination_route: '/partner/dashboard',
          category: 'partner_login',
          action: 'magic_link',
          status: 'succeeded',
        },
      }),
    )
    expect(JSON.stringify(mocks.capturePublicProductAnalyticsEvent.mock.calls)).not.toContain(
      'secret-token',
    )
  })

  it('captures failed magic link verification without forwarding the token', async () => {
    mocks.verifyPartnerMagicLinkFn.mockRejectedValue(new Error('invalid'))

    const response = await handlePartnerVerify(
      new Request('https://app.phiguard.test/partner/verify?token=secret-token'),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/partner/login?error=invalid-link')
    expect(mocks.capturePublicProductAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'partner_magic_link_verify_failed',
        properties: {
          route: '/partner/verify',
          destination_route: '/partner/login',
          category: 'partner_login',
          action: 'magic_link',
          status: 'failed',
          reason: 'invalid_link',
        },
      }),
    )
    expect(JSON.stringify(mocks.capturePublicProductAnalyticsEvent.mock.calls)).not.toContain(
      'secret-token',
    )
  })
})
