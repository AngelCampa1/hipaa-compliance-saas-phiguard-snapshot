import * as Sentry from '@sentry/browser'

type BrowserSentryEvent = {
  message?: string
  exception?: {
    values?: Array<{
      value?: string
      stacktrace?: unknown
    }>
  }
  request?: {
    data?: unknown
    cookies?: unknown
  }
  user?: {
    email?: string | null
    ip_address?: string | null
    [key: string]: unknown
  }
  breadcrumbs?: Array<{
    message?: string
    data?: Record<string, unknown>
    [key: string]: unknown
  }>
  [key: string]: unknown
}

const PHI_KEY_PATTERN = /email|phone|ssn|dob|dateOfBirth|birthDate|patient|phi|mrn|firstName|lastName|address|zip|postalCode|healthPlanNumber|accountNumber|deviceId|licenseNumber|biometricId|photoUrl|ipAddress/i
const PHI_TEXT_PATTERN = /phi|patient|email|ssn|dob|date of birth|medical record|mrn/i
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g
const PHONE_PATTERN = /\b(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g
const DATE_PATTERN = /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g
const PERSON_NAME_PATTERN = /\b[A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){1,2}\b/g

function sanitizeText(value: string) {
  if (PHI_TEXT_PATTERN.test(value)) return '[REDACTED]'
  return value
    .replace(EMAIL_PATTERN, '[REDACTED-EMAIL]')
    .replace(SSN_PATTERN, '[REDACTED-SSN]')
    .replace(PHONE_PATTERN, '[REDACTED-PHONE]')
    .replace(DATE_PATTERN, '[REDACTED-DATE]')
    .replace(PERSON_NAME_PATTERN, '[REDACTED-NAME]')
}

function sanitizeValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? sanitizeText(value) : value
  }

  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (value instanceof Error) {
    return {
      name: value.name,
      message: '[REDACTED]',
      stack: '[REDACTED]',
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen))
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      PHI_KEY_PATTERN.test(key) ? '[REDACTED]' : sanitizeValue(item, seen),
    ]),
  )
}

function sanitizeEvent<T extends BrowserSentryEvent>(event: T): T {
  if (typeof event.message === 'string') {
    event.message = sanitizeText(event.message)
  }

  if (event.request) {
    if (event.request.data) {
      event.request.data = sanitizeValue(event.request.data)
    }
    event.request.cookies = undefined
  }

  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
  }

  if (event.exception?.values) {
    event.exception.values = event.exception.values.map((exception) => ({
      ...exception,
      value: typeof exception.value === 'string'
        ? sanitizeText(exception.value)
        : exception.value,
      stacktrace: sanitizeValue(exception.stacktrace),
    }))
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      message: typeof breadcrumb.message === 'string'
        ? sanitizeText(breadcrumb.message)
        : breadcrumb.message,
      data: breadcrumb.data
        ? sanitizeValue(breadcrumb.data) as Record<string, unknown>
        : breadcrumb.data,
    }))
  }

  return event
}

type RuntimeSentryConfig = {
  dsn?: string | null
  environment?: string | null
}

const staticDsn = import.meta.env.PUBLIC_SENTRY_MARKETING_DSN ?? import.meta.env.PUBLIC_SENTRY_DSN

async function loadRuntimeSentryConfig(): Promise<RuntimeSentryConfig> {
  if (staticDsn) {
    return {
      dsn: staticDsn,
      environment: import.meta.env.PUBLIC_APP_ENV ?? import.meta.env.MODE,
    }
  }

  if (typeof fetch !== 'function') return {}

  try {
    const response = await fetch('/sentry-config.json', {
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!response.ok) return {}
    return await response.json() as RuntimeSentryConfig
  } catch {
    return {}
  }
}

void loadRuntimeSentryConfig().then((config) => {
  const dsn = typeof config.dsn === 'string' && config.dsn ? config.dsn : undefined
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: config.environment ?? import.meta.env.PUBLIC_APP_ENV ?? import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.05 : 1.0,
    sendDefaultPii: false,
    initialScope: {
      tags: {
        surface: 'marketing',
      },
    },
    beforeSend(event) {
      return sanitizeEvent(event as unknown as BrowserSentryEvent) as unknown as typeof event
    },
    beforeSendTransaction(event) {
      return sanitizeEvent(event as unknown as BrowserSentryEvent) as unknown as typeof event
    },
  })
})
