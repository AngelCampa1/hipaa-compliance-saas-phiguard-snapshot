import pino from 'pino'

const PHI_KEYS = new Set([
  // Original set
  'email',
  'phone',
  'ssn',
  'dob',
  'firstName',
  'lastName',
  'patientId',
  'notes',
  'address',
  'mrn',
  'dateOfBirth',
  // HIPAA-18 extended identifiers
  'zip',
  'postalCode',
  'birthDate',
  'fax',
  'healthPlanNumber',
  'accountNumber',
  'deviceId',
  'licenseNumber',
  'vehicleId',
  'biometricId',
  'photoUrl',
  'ipAddress',
  'given',
  'family',
  'gender',
  'npi',
  // 'name' intentionally excluded - too broad, collides with Error.name, task names, org names etc.
  // Use firstName/lastName for patient names; patientName is caught by PHI_PATTERN below.
])

// Matches "phi" or "patient" as a distinct segment in camelCase or snake_case:
// start-of-key (^), underscore boundary, or uppercase variant (camelCase boundary).
// Catches: phi, phiData, phi_key, patientName, PatientRecord, isPatient, currentPhi.
// Skips:   sophistication (mid-word lowercase "phi").
const PHI_PATTERN = /(^|_)(phi|patient)|Phi|Patient/

function isPhiKey(key: string): boolean {
  return PHI_KEYS.has(key) || PHI_PATTERN.test(key)
}

/**
 * Recursively redacts PHI keys from an object without mutating the original.
 * Handles circular references by replacing them with '[Circular]'.
 */
export function redact(obj: unknown, seen = new WeakSet()): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj

  if (obj instanceof Date) return obj.toISOString()

  // Handle Error instances - message and stack traces may contain PHI
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: '[REDACTED]',
      stack: '[REDACTED]',
    }
  }

  if (seen.has(obj as object)) return '[Circular]'
  seen.add(obj as object)

  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((item) => redact(item, seen))
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (isPhiKey(key)) {
      result[key] = '[REDACTED]'
    } else if (value !== null && typeof value === 'object') {
      result[key] = redact(value, seen)
    } else {
      result[key] = value
    }
  }
  return result
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g

function redactString(msg: string): string {
  return msg
    .replace(EMAIL_PATTERN, '[REDACTED-EMAIL]')
    .replace(SSN_PATTERN, '[REDACTED-SSN]')
}

const _pino = pino({ level: 'info' })

type LogMethod = {
  (obj: Record<string, unknown>, msg?: string): void
  (msg: string): void
}

function makeLogMethod(pinoMethod: pino.LogFn): LogMethod {
  return function (objOrMsg: Record<string, unknown> | string, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      pinoMethod(redactString(objOrMsg))
    } else {
      pinoMethod(redact(objOrMsg) as Record<string, unknown>, msg ? redactString(msg) : undefined)
    }
  } as LogMethod
}

/**
 * Structured logger with PHI redaction applied to every log call.
 * Always use logger.safe.info(...) (or logger.info - they are identical)
 * to signal intentional PHI-safe logging at code review time.
 */
export const logger = {
  info: makeLogMethod(_pino.info.bind(_pino)),
  warn: makeLogMethod(_pino.warn.bind(_pino)),
  error: makeLogMethod(_pino.error.bind(_pino)),
  debug: makeLogMethod(_pino.debug.bind(_pino)),
  /** Alias for logger - signals PHI-safe intent at call sites. */
  get safe() {
    return this
  },
}
