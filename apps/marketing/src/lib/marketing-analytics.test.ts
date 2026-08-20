import { describe, expect, it, vi } from 'vitest'
import { SUPPORT_EMAIL } from '@phiguard/knowledge/support'
import {
  CONSENT_STORAGE_KEY,
  createMarketingAnalytics,
  getPageCategory,
  sanitizeAnalyticsProperties,
} from './marketing-analytics'

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
  }
}

describe('marketing analytics helpers', () => {
  it('removes email-like fields from ordinary event properties', () => {
    expect(
      sanitizeAnalyticsProperties({
        button_text: 'Start free trial',
        email: 'admin@clinic.test',
        email_address: 'owner@clinic.test',
        userEmail: 'ops@clinic.test',
        link_text: `Security concerns? ${SUPPORT_EMAIL}`,
      }),
    ).toEqual({ button_text: 'Start free trial' })
  })

  it('identifies leads without sending submitted email to PostHog', () => {
    const posthog = {
      capture: vi.fn(),
      identify: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/pricing?utm_source=google'),
      referrer: 'https://example.com/guide',
      title: 'Pricing | PHIGuard',
    })

    analytics.track('lead_captured', {
      email: 'admin@clinic.test',
      magnet_slug: 'hipaa-compliance-self-assessment',
    })
    analytics.identifyLead({ email: ' Admin@Clinic.Test ', leadId: 'lead_123' })

    expect(posthog.capture).toHaveBeenCalledWith(
      'lead_captured',
      expect.not.objectContaining({ email: expect.anything() }),
    )
    expect(posthog.identify).toHaveBeenCalledWith('lead_123')
  })

  it('does not identify submitted email without accepted consent', () => {
    const posthog = {
      identify: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'declined' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/resources'),
      referrer: '',
      title: 'Resources | PHIGuard',
    })

    analytics.identifyLead({ email: 'admin@clinic.test' })

    expect(posthog.identify).not.toHaveBeenCalled()
  })

  it('does not use email as a fallback PostHog distinct id', () => {
    const posthog = {
      identify: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/resources'),
      referrer: '',
      title: 'Resources | PHIGuard',
    })

    analytics.identifyLead({ email: 'admin@clinic.test' })

    expect(posthog.identify).not.toHaveBeenCalled()
  })

  it('does not capture or register context without accepted consent', () => {
    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'declined' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/product?utm_source=linkedin'),
      referrer: 'https://example.com/ref',
      title: 'Product | PHIGuard',
    })

    analytics.track('cta_clicked', { button_text: 'Start free trial' })
    analytics.registerPageContext()

    expect(posthog.capture).not.toHaveBeenCalled()
    expect(posthog.register).not.toHaveBeenCalled()
    expect(posthog.register_once).not.toHaveBeenCalled()
  })

  it('derives stable page categories from marketing paths', () => {
    expect(getPageCategory('/pricing')).toBe('pricing')
    expect(getPageCategory('/product/features/hipaa-task-management-audit-history')).toBe(
      'product_feature',
    )
    expect(getPageCategory('/compare/generic')).toBe('comparison')
    expect(getPageCategory('/locations/austin')).toBe('location')
    expect(getPageCategory('/resources/guides/hipaa')).toBe('resource')
    expect(getPageCategory('/resources/best/best-hipaa-compliance-software')).toBe('resource')
    expect(getPageCategory('/learn/hipaa-basics/phi')).toBe('learn')
    expect(getPageCategory('/glossary/business-associate')).toBe('glossary')
    expect(getPageCategory('/privacy')).toBe('legal')
    expect(getPageCategory('/terms')).toBe('legal')
    expect(getPageCategory('/subprocessors')).toBe('legal')
    expect(getPageCategory('/about')).toBe('company')
  })

  it('preserves durable first-touch attribution before consent and registers it after consent', () => {
    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const storage = createStorage()
    const sessionStorage = createStorage()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'))
    const landingAnalytics = createMarketingAnalytics({
      posthog,
      storage,
      sessionStorage,
      location: new URL(
        'https://phiguard.app/resources/guides/hipaa?utm_source=linkedin&utm_medium=social&utm_campaign=q2&utm_content=guide&utm_term=hipaa',
      ),
      referrer: 'https://www.linkedin.com/feed',
      title: 'HIPAA Guide | PHIGuard',
    })

    landingAnalytics.registerPageContext()

    expect(posthog.register).not.toHaveBeenCalled()
    expect(posthog.register_once).not.toHaveBeenCalled()

    vi.setSystemTime(new Date('2026-05-03T12:00:00.000Z'))

    const acceptedAnalytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage,
      location: new URL('https://phiguard.app/pricing'),
      referrer: '',
      title: 'Pricing | PHIGuard',
    })

    acceptedAnalytics.registerPageContext()

    expect(posthog.register_once).toHaveBeenCalledWith(
      expect.objectContaining({
        landing_path: '/resources/guides/hipaa',
        first_landing_path: '/resources/guides/hipaa',
        first_touch_age_days: 2,
        initial_referrer_host: 'www.linkedin.com',
        initial_utm_source: 'linkedin',
        initial_utm_medium: 'social',
        initial_utm_campaign: 'q2',
        initial_utm_content: 'guide',
        initial_utm_term: 'hipaa',
      }),
    )
    expect(storage.setItem).toHaveBeenCalledWith(
      'phiguard_analytics_first_touch',
      expect.stringContaining('"first_landing_path":"/resources/guides/hipaa"'),
    )
    vi.useRealTimers()
  })

  it('captures one sanitized manual marketing pageview after consent', () => {
    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/pricing?utm_source=admin@clinic.test&utm_campaign=q2'),
      referrer: '',
      title: 'Pricing | PHIGuard',
    })

    analytics.registerPageContext()
    analytics.registerPageContext()

    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith(
      'marketing_page_viewed',
      expect.objectContaining({
        page_path: '/pricing',
        page_category: 'pricing',
        utm_campaign: 'q2',
      }),
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'marketing_page_viewed',
      expect.not.objectContaining({
        utm_source: expect.anything(),
      }),
    )
  })

  it('captures numeric pricing CTA amounts from card data attributes', () => {
    class TestElement {
      textContent = 'Start free trial'
      private attributes = new Map<string, string>()

      getAttribute(name: string) {
        return this.attributes.get(name) ?? null
      }

      setAttribute(name: string, value: string) {
        this.attributes.set(name, value)
      }

      hasAttribute(name: string) {
        return this.attributes.has(name)
      }

      closest() {
        return this
      }
    }

    class TestAnchorElement extends TestElement {}

    vi.stubGlobal('HTMLElement', TestElement)
    vi.stubGlobal('HTMLAnchorElement', TestAnchorElement)

    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/pricing'),
      referrer: '',
      title: 'Pricing | PHIGuard',
    })
    const anchor = new TestAnchorElement()
    anchor.setAttribute('href', 'https://my.phiguard.app/signup?plan=essentials')
    anchor.setAttribute('data-ph-pricing-cta', 'Essentials')
    anchor.setAttribute('data-ph-pricing-price', '358')
    anchor.setAttribute('data-ph-pricing-list-price', '1788')
    anchor.setAttribute('data-ph-pricing-billing', 'annual')
    anchor.setAttribute('data-ph-pricing-promo', '80% off first year')

    analytics.trackClick(anchor as unknown as Element, 'pricing')

    expect(posthog.capture).toHaveBeenCalledWith(
      'pricing_cta_clicked',
      expect.objectContaining({
        plan_name: 'Essentials',
        plan_price: 358,
        plan_list_price: 1788,
        billing_period: 'annual',
        promo_badge: '80% off first year',
        location: 'pricing',
      }),
    )
  })

  it('captures internal content journeys without link text or query strings', () => {
    class TestElement {
      textContent = 'Read related article'
      private attributes = new Map<string, string>()
      classList = { contains: () => false }

      getAttribute(name: string) {
        return this.attributes.get(name) ?? null
      }

      setAttribute(name: string, value: string) {
        this.attributes.set(name, value)
      }

      hasAttribute(name: string) {
        return this.attributes.has(name)
      }

      closest() {
        return this
      }
    }

    class TestAnchorElement extends TestElement {}

    vi.stubGlobal('HTMLElement', TestElement)
    vi.stubGlobal('HTMLAnchorElement', TestAnchorElement)

    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/resources/guides/hipaa'),
      referrer: '',
      title: 'HIPAA Guide | PHIGuard',
    })
    const anchor = new TestAnchorElement()
    anchor.setAttribute('href', '/learn/hipaa-basics/phi?utm_source=private#section')

    analytics.trackClick(anchor as unknown as Element, 'article_body')

    expect(posthog.capture).toHaveBeenCalledWith(
      'internal_content_link_clicked',
      expect.objectContaining({
        location: 'article_body',
        destination_path: '/learn/hipaa-basics/phi',
        destination_category: 'learn',
      }),
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'internal_content_link_clicked',
      expect.not.objectContaining({
        link_text: expect.anything(),
        destination_url: expect.anything(),
      }),
    )
  })

  it('captures content micro-engagement links with safe metadata', () => {
    class TestElement {
      textContent = 'Jump to section'
      private attributes = new Map<string, string>()
      classList = { contains: () => false }

      getAttribute(name: string) {
        return this.attributes.get(name) ?? null
      }

      setAttribute(name: string, value: string) {
        this.attributes.set(name, value)
      }

      hasAttribute(name: string) {
        return this.attributes.has(name)
      }

      closest() {
        return this
      }
    }

    class TestAnchorElement extends TestElement {}

    vi.stubGlobal('HTMLElement', TestElement)
    vi.stubGlobal('HTMLAnchorElement', TestAnchorElement)

    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/learn/hipaa-basics/phi'),
      referrer: '',
      title: 'PHI Guide | PHIGuard',
    })

    const tocLink = new TestAnchorElement()
    tocLink.setAttribute('href', '#minimum-necessary')
    tocLink.setAttribute('data-ph-toc-link', 'minimum-necessary')
    analytics.trackClick(tocLink as unknown as Element, 'toc')

    const sourceLink = new TestAnchorElement()
    sourceLink.setAttribute('href', 'https://www.hhs.gov/hipaa/example?private=value')
    sourceLink.setAttribute('data-ph-source-link', '1')
    analytics.trackClick(sourceLink as unknown as Element, 'sources')

    expect(posthog.capture).toHaveBeenCalledWith(
      'toc_link_clicked',
      expect.objectContaining({
        location: 'toc',
        heading_id: 'minimum-necessary',
      }),
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'source_link_clicked',
      expect.objectContaining({
        location: 'sources',
        destination_host: 'www.hhs.gov',
        source_index: 1,
      }),
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'source_link_clicked',
      expect.not.objectContaining({
        destination_url: expect.anything(),
        link_text: expect.anything(),
        source_key: expect.anything(),
      }),
    )
  })

  it('captures resource thank-you actions without download URLs', () => {
    class TestElement {
      textContent = 'Download now'
      private attributes = new Map<string, string>()
      classList = { contains: () => false }

      getAttribute(name: string) {
        return this.attributes.get(name) ?? null
      }

      setAttribute(name: string, value: string) {
        this.attributes.set(name, value)
      }

      hasAttribute(name: string) {
        return this.attributes.has(name)
      }

      closest() {
        return this
      }
    }

    class TestAnchorElement extends TestElement {}

    vi.stubGlobal('HTMLElement', TestElement)
    vi.stubGlobal('HTMLAnchorElement', TestAnchorElement)

    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/resources/thank-you?slug=baa-template'),
      referrer: '',
      title: 'Resource ready | PHIGuard',
    })

    const download = new TestAnchorElement()
    download.setAttribute('href', 'https://my.phiguard.app/api/marketing/lead-magnets/baa-template')
    download.setAttribute('data-ph-resource-download', 'baa-template')
    analytics.trackClick(download as unknown as Element, 'resource_thank_you')

    const resend = new TestAnchorElement()
    resend.setAttribute('href', '/resources/baa-template')
    resend.setAttribute('data-ph-resource-resend', 'baa-template')
    analytics.trackClick(resend as unknown as Element, 'resource_thank_you')

    expect(posthog.capture).toHaveBeenCalledWith(
      'resource_download_clicked',
      expect.objectContaining({
        location: 'resource_thank_you',
        magnet_slug: 'baa-template',
      }),
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'resource_resend_clicked',
      expect.objectContaining({
        location: 'resource_thank_you',
        magnet_slug: 'baa-template',
      }),
    )
    expect(posthog.capture).toHaveBeenCalledWith(
      'resource_download_clicked',
      expect.not.objectContaining({
        destination_url: expect.anything(),
      }),
    )
  })

  it('captures numeric pricing CTA amounts from card data attributes', () => {
    class TestElement {
      textContent = 'Start free trial'
      private attributes = new Map<string, string>()

      getAttribute(name: string) {
        return this.attributes.get(name) ?? null
      }

      setAttribute(name: string, value: string) {
        this.attributes.set(name, value)
      }

      hasAttribute(name: string) {
        return this.attributes.has(name)
      }

      closest() {
        return this
      }
    }

    class TestAnchorElement extends TestElement {}

    vi.stubGlobal('HTMLElement', TestElement)
    vi.stubGlobal('HTMLAnchorElement', TestAnchorElement)

    const posthog = {
      capture: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
    }
    const analytics = createMarketingAnalytics({
      posthog,
      storage: createStorage({ [CONSENT_STORAGE_KEY]: 'accepted' }),
      sessionStorage: createStorage(),
      location: new URL('https://phiguard.app/pricing'),
      referrer: '',
      title: 'Pricing | PHIGuard',
    })
    const anchor = new TestAnchorElement()
    anchor.setAttribute('href', 'https://my.phiguard.app/signup?plan=essentials')
    anchor.setAttribute('data-ph-pricing-cta', 'Essentials')
    anchor.setAttribute('data-ph-pricing-price', '774')

    analytics.trackClick(anchor as unknown as Element, 'pricing')

    expect(posthog.capture).toHaveBeenCalledWith(
      'pricing_cta_clicked',
      expect.objectContaining({
        plan_name: 'Essentials',
        plan_price: 774,
        location: 'pricing',
      }),
    )
  })
})
