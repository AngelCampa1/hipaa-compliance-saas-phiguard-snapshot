export type ReportableErrorOptions = {
  status?: number
  fallbackMessage?: string
  randomUUID?: () => string
}

export type UserFacingError = {
  message: string
  reportable: boolean
  trackingId: string | null
}

const EXPECTED_ERROR_MESSAGES = new Set([
  'Unauthorized',
  'Forbidden',
  'Forbidden: admin access required',
  'File type not allowed',
  'File exceeds 25 MB limit',
  'Invalid upload key',
  'Invalid upload capability',
  'Missing upload body',
  'Task not found',
  'Checklist not found',
  'Checklist item not found',
  'Incident not found',
  'Policy not found',
  'Policy assignment not found',
  'Organization not found',
  'Location not found',
  'Member not found',
  'Access review not found',
  'Access review item not found',
  'Integration connection not found',
])

const EXPECTED_ERROR_PATTERNS = [
  /not found/i,
  /forbidden/i,
  /unauthorized/i,
  /feature/i,
  /not available on/i,
  /too many requests/i,
]

export function formatTrackingId(value: string): string {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `err_${normalized.slice(0, 8) || 'unknown'}`
}

export function makeTrackingId(randomUUID?: () => string) {
  const value =
    randomUUID?.() ??
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  return formatTrackingId(value)
}

export function getReportableErrorMessage(trackingId: string) {
  return `Something went wrong. Please try again. If it keeps happening, contact support with error ID ${trackingId}.`
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : typeof error === 'string' ? error : ''
}

function extractExpectedValidationMessage(message: string): string | null {
  if (!message.trim().startsWith('[') && !message.trim().startsWith('{')) {
    return null
  }

  try {
    const parsed = JSON.parse(message) as unknown
    const issues = Array.isArray(parsed) ? parsed : [parsed]

    for (const issue of issues) {
      if (
        issue &&
        typeof issue === 'object' &&
        'message' in issue &&
        typeof issue.message === 'string' &&
        EXPECTED_ERROR_MESSAGES.has(issue.message)
      ) {
        return issue.message
      }
    }
  } catch {
    return null
  }

  return null
}

export function isReportableError(error: unknown, opts: Pick<ReportableErrorOptions, 'status'> = {}) {
  if (opts.status !== undefined) {
    return opts.status >= 500
  }

  const message = getErrorMessage(error)
  if (!message) return true
  if (extractExpectedValidationMessage(message)) return false
  if (EXPECTED_ERROR_MESSAGES.has(message)) return false
  return !EXPECTED_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

export function toUserError(error: unknown, opts: ReportableErrorOptions = {}): UserFacingError {
  const reportable = isReportableError(error, opts)

  if (reportable) {
    const trackingId = makeTrackingId(opts.randomUUID)
    return {
      message: getReportableErrorMessage(trackingId),
      reportable,
      trackingId,
    }
  }

  return {
    message:
      extractExpectedValidationMessage(getErrorMessage(error)) ??
      (getErrorMessage(error) ||
        opts.fallbackMessage ||
        'Please check your input and try again.'),
    reportable,
    trackingId: null,
  }
}
