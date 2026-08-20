export const CONSENT_STORAGE_KEY = 'ph_consent'
const FIRST_TOUCH_STORAGE_KEY = 'phiguard_analytics_first_touch'
const LANDING_REGISTERED_STORAGE_KEY = 'phiguard_analytics_landing_registered'

const EMAIL_PROPERTY_PATTERN = /email/i
const EMAIL_VALUE_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

type AnalyticsProperties = Record<string, unknown>
type FirstTouchContext = {
  landing_path?: string
  first_landing_path?: string
  first_touch_id?: string
  first_touch_captured_at?: string
  initial_referrer_host?: string
} & Partial<Record<`initial_${(typeof UTM_KEYS)[number]}`, string>>

type PostHogLike = {
  capture?: (eventName: string, properties?: AnalyticsProperties) => void
  init?: (token: string, config?: AnalyticsProperties) => void
  identify?: (distinctId: string, properties?: AnalyticsProperties) => void
  register?: (properties: AnalyticsProperties) => void
  register_once?: (properties: AnalyticsProperties) => void
  opt_in_capturing?: () => void
  opt_out_capturing?: () => void
  [key: string]: unknown
}

export type LeadIdentity = {
  email: string
  leadId?: string
}

export type MarketingAnalytics = {
  track: (eventName: string, properties?: AnalyticsProperties) => void
  identifyLead: (identity: LeadIdentity) => void
  registerPageContext: () => void
  trackClick: (element: Element, fallbackLocation?: string) => void
}

type MarketingAnalyticsOptions = {
  posthog: PostHogLike
  storage: Pick<Storage, 'getItem' | 'setItem'>
  sessionStorage: Pick<Storage, 'getItem' | 'setItem'>
  location: URL
  referrer: string
  title: string
}

declare global {
  interface Window {
    __PHIGUARD_MARKETING_ANALYTICS_CONFIG__?: {
      posthogKey?: string
    }
    phiguardAnalytics?: MarketingAnalytics
    posthog?: PostHogLike
  }
}

export function sanitizeAnalyticsProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (EMAIL_PROPERTY_PATTERN.test(key)) return false
      if (typeof value === 'string' && EMAIL_VALUE_PATTERN.test(value)) return false
      return value !== undefined && value !== null && value !== ''
    }),
  )
}

export function getPageCategory(pathname: string) {
  if (pathname === '/') return 'home'
  if (pathname === '/pricing') return 'pricing'
  if (pathname === '/product') return 'product'
  if (pathname.startsWith('/product/features/')) return 'product_feature'
  if (pathname === '/security' || pathname === '/trust') return 'trust'
  if (pathname === '/hipaa') return 'hipaa'
  if (pathname === '/baa' || pathname === '/privacy' || pathname === '/terms' || pathname === '/subprocessors') return 'legal'
  if (pathname === '/about') return 'company'
  if (pathname === '/partners') return 'partners'
  if (
    pathname === '/compare'
    || pathname.startsWith('/compare/')
    || pathname.startsWith('/alternatives/')
    || pathname.startsWith('/practice-types/')
    || pathname.startsWith('/personas/')
  ) {
    return 'comparison'
  }
  if (pathname === '/locations' || pathname.startsWith('/locations/')) return 'location'
  if (pathname === '/resources' || pathname.startsWith('/resources/')) return 'resource'
  if (pathname === '/learn' || pathname.startsWith('/learn/')) return 'learn'
  if (pathname === '/glossary' || pathname.startsWith('/glossary/')) return 'glossary'
  if (pathname.startsWith('/hipaa-software/')) return 'hipaa_software'
  if (pathname.startsWith('/contributors/')) return 'contributors'
  return 'other'
}

export function createMarketingAnalytics(options: MarketingAnalyticsOptions): MarketingAnalytics {
  const hasConsent = () => options.storage.getItem(CONSENT_STORAGE_KEY) === 'accepted'
  let hasTrackedPageView = false

  preserveFirstTouch(options)

  const getContext = () => {
    const campaign = Object.fromEntries(
      UTM_KEYS.map((key) => [key, options.location.searchParams.get(key) ?? undefined]),
    )
    const referrerHost = getReferrerHost(options.referrer)

    return sanitizeAnalyticsProperties({
      ...campaign,
      ...getFirstTouchEventContext(options),
      page_title: options.title,
      page_path: options.location.pathname,
      page_category: getPageCategory(options.location.pathname),
      referrer_host: referrerHost,
    })
  }

  const track = (eventName: string, properties: AnalyticsProperties = {}) => {
    if (!hasConsent()) return

    options.posthog.capture?.(eventName, {
      ...getContext(),
      ...sanitizeAnalyticsProperties(properties),
    })
  }

  const identifyLead = ({ email, leadId }: LeadIdentity) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !hasConsent()) return

    const safeLeadId = leadId?.trim()
    if (!safeLeadId) return

    options.posthog.identify?.(safeLeadId)
  }

  const registerPageContext = () => {
    if (!hasConsent()) return

    const context = getContext()
    options.posthog.register?.(context)
    if (!hasTrackedPageView) {
      options.posthog.capture?.('marketing_page_viewed', context)
      hasTrackedPageView = true
    }

    if (options.sessionStorage.getItem(LANDING_REGISTERED_STORAGE_KEY) === 'true') return

    options.posthog.register_once?.(getFirstTouchRegistration(options))
    options.sessionStorage.setItem(LANDING_REGISTERED_STORAGE_KEY, 'true')
  }

  const trackClick = (element: Element, fallbackLocation = 'unknown') => {
    if (!(element instanceof HTMLElement)) return

    const anchor = element instanceof HTMLAnchorElement ? element : element.closest('a')
    const href = anchor?.getAttribute('href') ?? undefined
    const linkText = getElementLabel(element)
    const location = element.getAttribute('data-ph-location') ?? fallbackLocation

    if (element.hasAttribute('data-ph-resource-download')) {
      track('resource_download_clicked', {
        location,
        magnet_slug: element.getAttribute('data-ph-resource-download'),
      })
      return
    }

    if (element.hasAttribute('data-ph-resource-resend')) {
      track('resource_resend_clicked', {
        location,
        magnet_slug: element.getAttribute('data-ph-resource-resend'),
      })
      return
    }

    if (element.hasAttribute('data-ph-post-capture-trial-cta')) {
      track('post_capture_trial_cta_clicked', {
        location,
        magnet_slug: element.getAttribute('data-ph-post-capture-trial-cta'),
      })
      return
    }

    if (element.hasAttribute('data-ph-toc-link')) {
      track('toc_link_clicked', {
        location,
        heading_id: element.getAttribute('data-ph-toc-link'),
      })
      return
    }

    if (element.hasAttribute('data-ph-source-link')) {
      track('source_link_clicked', {
        location,
        source_index: Number(element.getAttribute('data-ph-source-link') ?? 0),
        destination_host: getDestinationHost(href, options.location),
      })
      return
    }

    if (element.hasAttribute('data-ph-pricing-cta')) {
      track('pricing_cta_clicked', {
        plan_name: element.getAttribute('data-ph-pricing-cta'),
        plan_price: Number(element.getAttribute('data-ph-pricing-price') ?? 0),
        plan_list_price: Number(element.getAttribute('data-ph-pricing-list-price') ?? 0),
        billing_period: element.getAttribute('data-ph-pricing-billing'),
        promo_badge: element.getAttribute('data-ph-pricing-promo'),
        destination_url: href,
        location,
      })
      return
    }

    if (element.hasAttribute('data-ph-cta')) {
      track('cta_clicked', {
        button_text: element.getAttribute('data-ph-cta') ?? linkText,
        location,
        destination_url: href,
      })
      return
    }

    if (href?.startsWith('mailto:')) {
      track('mailto_clicked', { location })
      return
    }

    if (element.hasAttribute('data-ph-nav-link')) {
      track('nav_link_clicked', { location, link_text: linkText, destination_url: href })
      return
    }

    if (element.hasAttribute('data-ph-footer-link')) {
      track('footer_link_clicked', { location, link_text: linkText, destination_url: href })
      return
    }

    if (element.hasAttribute('data-ph-resource-link')) {
      track('resource_link_clicked', { location, link_text: linkText, destination_url: href })
      return
    }

    if (element.hasAttribute('data-ph-routing-card') || element.classList.contains('link-card')) {
      track('routing_card_clicked', { location, link_text: linkText, destination_url: href })
      return
    }

    if (element.classList.contains('resource-card')) {
      track('resource_link_clicked', { location, link_text: linkText, destination_url: href })
      return
    }

    const internalDestination = getInternalDestination(href, options.location)
    if (anchor && internalDestination && isContentPage(options.location.pathname)) {
      track('internal_content_link_clicked', {
        location,
        destination_path: internalDestination.pathname,
        destination_category: getPageCategory(internalDestination.pathname),
      })
      return
    }

    if (
      element.classList.contains('button-primary')
      || element.classList.contains('button-secondary')
      || element.classList.contains('button-tertiary')
    ) {
      track('cta_clicked', {
        button_text: linkText,
        location,
        destination_url: href,
      })
      return
    }

    if (anchor && isExternalHref(href)) {
      track('outbound_link_clicked', {
        location,
        link_text: linkText,
        destination_host: getDestinationHost(href),
      })
    }
  }

  return {
    identifyLead,
    registerPageContext,
    track,
    trackClick,
  }
}

export function initMarketingAnalytics() {
  const posthogKey = window.__PHIGUARD_MARKETING_ANALYTICS_CONFIG__?.posthogKey
  if (!posthogKey) return

  installPostHogStub()

  const analytics = createMarketingAnalytics({
    posthog: window.posthog ?? {},
    storage: window.localStorage,
    sessionStorage: window.sessionStorage,
    location: new URL(window.location.href),
    referrer: document.referrer,
    title: document.title,
  })

  window.phiguardAnalytics = analytics

  const initPostHog = () => {
    window.posthog?.init?.(posthogKey, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      autocapture: false,
      mask_all_text: true,
      disable_session_recording: true,
      opt_out_capturing_by_default: true,
    })
    if (window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted') {
      window.posthog?.opt_in_capturing?.()
    } else {
      window.posthog?.opt_out_capturing?.()
    }
    analytics.registerPageContext()
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initPostHog, { timeout: 3000 })
  } else {
    globalThis.setTimeout(initPostHog, 1500)
  }

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const trackedElement = target.closest(
      '[data-ph-cta], [data-ph-pricing-cta], [data-ph-nav-link], [data-ph-footer-link], [data-ph-resource-link], [data-ph-resource-download], [data-ph-resource-resend], [data-ph-post-capture-trial-cta], [data-ph-toc-link], [data-ph-source-link], [data-ph-routing-card], a.link-card, a.resource-card, a.button-primary, a.button-secondary, a.button-tertiary, a[href^="/"], a[href^="mailto:"], a[href^="http"]',
    )
    if (!trackedElement) return

    analytics.trackClick(trackedElement)
  })
}

function preserveFirstTouch(options: MarketingAnalyticsOptions) {
  if (options.storage.getItem(FIRST_TOUCH_STORAGE_KEY)) return

  try {
    const sessionFirstTouch = options.sessionStorage.getItem(FIRST_TOUCH_STORAGE_KEY)
    const firstTouch = sessionFirstTouch ?? JSON.stringify(buildFirstTouch(options))
    options.storage.setItem(FIRST_TOUCH_STORAGE_KEY, firstTouch)
    options.sessionStorage.setItem(FIRST_TOUCH_STORAGE_KEY, firstTouch)
  } catch {
    // Browser storage can be unavailable in strict privacy modes.
  }
}

function getFirstTouch(options: MarketingAnalyticsOptions) {
  const stored =
    options.storage.getItem(FIRST_TOUCH_STORAGE_KEY)
    ?? options.sessionStorage.getItem(FIRST_TOUCH_STORAGE_KEY)
  if (!stored) return buildFirstTouch(options)

  try {
    const parsed = JSON.parse(stored) as AnalyticsProperties
    return sanitizeAnalyticsProperties(parsed) as FirstTouchContext
  } catch {
    return buildFirstTouch(options)
  }
}

function getFirstTouchRegistration(options: MarketingAnalyticsOptions) {
  return sanitizeAnalyticsProperties({
    ...getFirstTouch(options),
    first_touch_age_days: getFirstTouchAgeDays(options),
  })
}

function getFirstTouchEventContext(options: MarketingAnalyticsOptions) {
  const firstTouch = getFirstTouch(options)

  return sanitizeAnalyticsProperties({
    first_touch_id: firstTouch.first_touch_id,
    first_landing_path: firstTouch.first_landing_path ?? firstTouch.landing_path,
    first_touch_age_days: getFirstTouchAgeDays(options),
  })
}

function getFirstTouchAgeDays(options: MarketingAnalyticsOptions) {
  const capturedAt = getFirstTouch(options).first_touch_captured_at
  if (!capturedAt) return undefined

  const capturedTime = new Date(capturedAt).getTime()
  if (!Number.isFinite(capturedTime)) return undefined

  return Math.max(0, Math.floor((Date.now() - capturedTime) / 86400000))
}

function buildFirstTouch(options: MarketingAnalyticsOptions): FirstTouchContext {
  return sanitizeAnalyticsProperties({
    first_touch_id: createFirstTouchId(),
    landing_path: options.location.pathname,
    first_landing_path: options.location.pathname,
    first_touch_captured_at: new Date().toISOString(),
    initial_referrer_host: getReferrerHost(options.referrer),
    ...Object.fromEntries(
      UTM_KEYS.map((key) => [`initial_${key}`, options.location.searchParams.get(key) ?? undefined]),
    ),
  }) as FirstTouchContext
}

function createFirstTouchId() {
  return `ft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function isContentPage(pathname: string) {
  return ['resource', 'learn', 'glossary', 'comparison', 'location', 'hipaa_software'].includes(
    getPageCategory(pathname),
  )
}

function getInternalDestination(href: string | undefined, currentLocation: URL) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:')) return undefined

  try {
    const destination = new URL(href, currentLocation.href)
    if (destination.host !== currentLocation.host) return undefined

    return destination
  } catch {
    return undefined
  }
}

function getElementLabel(element: Element) {
  return (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80)
}

function getReferrerHost(referrer: string) {
  if (!referrer) return undefined
  try {
    return new URL(referrer).host
  } catch {
    return undefined
  }
}

function getDestinationHost(href: string | undefined, currentLocation = new URL(window.location.href)) {
  if (!href) return undefined
  try {
    return new URL(href, currentLocation.href).host
  } catch {
    return undefined
  }
}

function isExternalHref(href: string | undefined) {
  if (!href) return false
  try {
    const destination = new URL(href, window.location.href)
    return destination.host !== window.location.host
  } catch {
    return false
  }
}

function installPostHogStub() {
  if (window.posthog?.capture) return

  const posthog = (Array.isArray(window.posthog) ? window.posthog : []) as unknown[] & PostHogLike & {
    __SV?: number
    _i?: unknown[]
  }
  const queuedMethods = [
    'capture',
    'identify',
    'register',
    'register_once',
    'opt_in_capturing',
    'opt_out_capturing',
  ]

  queuedMethods.forEach((method) => {
    posthog[method] = (...args: unknown[]) => {
      posthog.push([method, ...args])
    }
  })

  posthog.init = (token: string, config: AnalyticsProperties = {}) => {
    const apiHost = String(config.api_host ?? 'https://us.i.posthog.com')
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.crossOrigin = 'anonymous'
    script.async = true
    script.src = `${apiHost.replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.js`
    document.head.appendChild(script)

    posthog._i = posthog._i ?? []
    posthog._i.push([token, config, 'posthog'])
  }

  posthog.__SV = 1
  window.posthog = posthog
}
