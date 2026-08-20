import { describe, it, expect, vi, beforeEach } from 'vitest'
import { redact } from '../logger.js'

// Re-import logger after potential mocking - we spy on the internal pino instance
// by mocking pino at module level so we can inspect what gets passed through.

const { pinoInfoMock, pinoWarnMock, pinoErrorMock, pinoDebugMock } = vi.hoisted(() => ({
  pinoInfoMock: vi.fn(),
  pinoWarnMock: vi.fn(),
  pinoErrorMock: vi.fn(),
  pinoDebugMock: vi.fn(),
}))

vi.mock('pino', () => {
  return {
    default: vi.fn(() => ({
      info: pinoInfoMock,
      warn: pinoWarnMock,
      error: pinoErrorMock,
      debug: pinoDebugMock,
    })),
  }
})

// Import logger AFTER mocks are in place
const { logger } = await import('../logger.js')

describe('isPhiKey - word-boundary PHI_PATTERN (C6)', () => {
  it('redacts a key named exactly "phi"', () => {
    expect(redact({ phi: 'secret' })).toEqual({ phi: '[REDACTED]' })
  })

  it('redacts "phiData" key via PHI_PATTERN - camelCase segment match', () => {
    // Pattern matches "phi" at start-of-key; catches compound camelCase forms.
    expect(redact({ phiData: 'value' })).toEqual({ phiData: '[REDACTED]' })
  })

  it('does NOT redact "physician" key - starts with "phy" not "phi", no match', () => {
    expect(redact({ physician: 'Dr. Smith' })).toEqual({ physician: 'Dr. Smith' })
  })

  it('does NOT redact "sophistication" key - mid-word "phi" has no boundary', () => {
    expect(redact({ sophistication: 'high' })).toEqual({ sophistication: 'high' })
  })

  it('redacts "phi_key" - underscore boundary match', () => {
    expect(redact({ phi_key: 'value' })).toEqual({ phi_key: '[REDACTED]' })
  })

  it('redacts key exactly equal to "patient"', () => {
    expect(redact({ patient: 'data' })).toEqual({ patient: '[REDACTED]' })
  })

  it('does NOT redact "patientId" key via PHI_PATTERN - but it IS in PHI_KEYS set', () => {
    // 'patientId' is in PHI_KEYS set explicitly, so it's still redacted
    expect(redact({ patientId: '123' })).toEqual({ patientId: '[REDACTED]' })
  })
})

describe('redactString - email and SSN redaction in string messages (C7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redacts email address in string log message', () => {
    logger.safe.info('user user@example.com logged in')
    expect(pinoInfoMock).toHaveBeenCalledWith('user [REDACTED-EMAIL] logged in')
  })

  it('redacts SSN pattern in string log message', () => {
    logger.safe.info('SSN: 123-45-6789')
    expect(pinoInfoMock).toHaveBeenCalledWith('SSN: [REDACTED-SSN]')
  })

  it('redacts email address in the msg argument of object-form log call', () => {
    logger.safe.info({ component: 'auth' }, 'login for user@example.com')
    expect(pinoInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({ component: 'auth' }),
      'login for [REDACTED-EMAIL]',
    )
  })

  it('passes through clean string messages without modification', () => {
    logger.safe.info('task created successfully')
    expect(pinoInfoMock).toHaveBeenCalledWith('task created successfully')
  })

  it('redacts multiple emails in a single message', () => {
    logger.safe.warn('from admin@clinic.com to patient@hospital.org')
    expect(pinoWarnMock).toHaveBeenCalledWith(
      'from [REDACTED-EMAIL] to [REDACTED-EMAIL]',
    )
  })

  it('redacts SSN in msg arg of object-form log call', () => {
    logger.safe.error({ code: 500 }, 'SSN mismatch: 987-65-4321')
    expect(pinoErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ code: 500 }),
      'SSN mismatch: [REDACTED-SSN]',
    )
  })
})
