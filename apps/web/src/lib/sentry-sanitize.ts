import type { Breadcrumb, ErrorEvent, Event, Exception, TransactionEvent } from '@sentry/core'
import { redact } from '@phiguard/audit'

type SanitizableEvent = Event & {
  request?: Event['request']
  user?: Event['user']
}

const PHI_TEXT_PATTERN = /phi|patient|email|ssn|dob|date of birth|medical record|mrn/i
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g
const PHONE_PATTERN = /\b(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g
const DATE_PATTERN = /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g
const PERSON_NAME_PATTERN = /\b[A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){1,2}\b/g

function sanitizeText(value: string): string {
  if (PHI_TEXT_PATTERN.test(value)) return '[REDACTED]'
  return value
    .replace(EMAIL_PATTERN, '[REDACTED-EMAIL]')
    .replace(SSN_PATTERN, '[REDACTED-SSN]')
    .replace(PHONE_PATTERN, '[REDACTED-PHONE]')
    .replace(DATE_PATTERN, '[REDACTED-DATE]')
    .replace(PERSON_NAME_PATTERN, '[REDACTED-NAME]')
}

function sanitizeRequestAndUser<T extends SanitizableEvent>(event: T): T {
  if (event.request?.data) {
    event.request.data = redact(event.request.data) as typeof event.request.data
  }

  if (event.request?.cookies) {
    event.request.cookies = undefined
  }

  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
  }

  return event
}

function sanitizeException(exception: Exception): Exception {
  return {
    ...exception,
    value: typeof exception.value === 'string' ? sanitizeText(exception.value) : exception.value,
    stacktrace: exception.stacktrace
      ? (redact(exception.stacktrace) as Exception['stacktrace'])
      : exception.stacktrace,
  }
}

export function sanitizeErrorEvent(event: ErrorEvent): ErrorEvent | null {
  sanitizeRequestAndUser(event)

  if (typeof event.message === 'string') {
    event.message = sanitizeText(event.message)
  }

  if (event.exception?.values) {
    event.exception.values = event.exception.values.map(sanitizeException)
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = (event.breadcrumbs as Breadcrumb[]).map((breadcrumb: Breadcrumb) => ({
      ...breadcrumb,
      data: breadcrumb.data ? (redact(breadcrumb.data) as Record<string, unknown>) : breadcrumb.data,
      message: typeof breadcrumb.message === 'string'
        ? sanitizeText(breadcrumb.message)
        : breadcrumb.message,
    }))
  }

  return event
}

export function sanitizeTransactionEvent(event: TransactionEvent): TransactionEvent | null {
  return sanitizeRequestAndUser(event)
}
