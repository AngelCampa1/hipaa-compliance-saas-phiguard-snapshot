import { describe, it, expect } from 'vitest'
import { redact, logger } from '../logger.js'

describe('redact() - PHI field stripping', () => {
  it('redacts email field', () => {
    expect(redact({ email: 'test@example.com' })).toEqual({ email: '[REDACTED]' })
  })

  it('redacts firstName and lastName', () => {
    expect(redact({ firstName: 'Jane', lastName: 'Doe' })).toEqual({
      firstName: '[REDACTED]',
      lastName: '[REDACTED]',
    })
  })

  it('redacts patientId', () => {
    expect(redact({ patientId: '123' })).toEqual({ patientId: '[REDACTED]' })
  })

  it('redacts mrn', () => {
    expect(redact({ mrn: 'MRN001' })).toEqual({ mrn: '[REDACTED]' })
  })

  it('redacts nested email but preserves safe values', () => {
    expect(redact({ nested: { email: 'a@b.c', safe: 'value' } })).toEqual({
      nested: { email: '[REDACTED]', safe: 'value' },
    })
  })

  it('redacts ssn inside arrays', () => {
    expect(redact({ arr: [{ ssn: '123-45-6789' }, { safe: 'ok' }] })).toEqual({
      arr: [{ ssn: '[REDACTED]' }, { safe: 'ok' }],
    })
  })

  it('preserves safe keys untouched', () => {
    expect(redact({ safeKey: 'value' })).toEqual({ safeKey: 'value' })
  })

  it('redacts key exactly equal to "phi" (standalone word boundary match)', () => {
    expect(redact({ phi: 'secret' })).toEqual({ phi: '[REDACTED]' })
  })

  it('redacts key exactly equal to "patient" (standalone word boundary match)', () => {
    expect(redact({ patient: 'data' })).toEqual({ patient: '[REDACTED]' })
  })

  it('redacts "phiData" via PHI_PATTERN - matches "phi" at start of camelCase segment', () => {
    expect(redact({ phiData: 'sensitive' })).toEqual({ phiData: '[REDACTED]' })
  })

  it('redacts "patientRecord" via PHI_PATTERN - matches "patient" at start of camelCase segment', () => {
    expect(redact({ patientRecord: 'sensitive' })).toEqual({ patientRecord: '[REDACTED]' })
  })

  it('does not throw when called with null', () => {
    expect(() => redact(null)).not.toThrow()
    expect(redact(null)).toBeNull()
  })

  it('does not throw when called with undefined', () => {
    expect(() => redact(undefined)).not.toThrow()
    expect(redact(undefined)).toBeUndefined()
  })

  it('returns primitives as-is', () => {
    expect(redact(42)).toBe(42)
    expect(redact('hello')).toBe('hello')
    expect(redact(true)).toBe(true)
  })

  it('does not mutate the original object', () => {
    const original = { email: 'test@example.com', task: 'Follow up' }
    redact(original)
    expect(original.email).toBe('test@example.com')
    expect(original.task).toBe('Follow up')
  })

  it('handles circular references without throwing', () => {
    const a: Record<string, unknown> = { safe: 'value' }
    a.self = a
    expect(() => redact(a)).not.toThrow()
    expect((redact(a) as Record<string, unknown>).safe).toBe('value')
    expect((redact(a) as Record<string, unknown>).self).toBe('[Circular]')
  })

  it('does not redact "name" key (too broad - use firstName/lastName for PHI)', () => {
    expect(redact({ name: 'Clinic ABC' })).toEqual({ name: 'Clinic ABC' })
  })

  it('redacts all exact PHI keys: phone, ssn, dob, notes, address, dateOfBirth', () => {
    const input = {
      phone: '555-1234',
      ssn: '123-45-6789',
      dob: '1980-01-01',
      notes: 'some clinical note',
      address: '123 Main St',
      dateOfBirth: '1980-01-01',
    }
    const result = redact(input) as Record<string, unknown>
    for (const key of Object.keys(input)) {
      expect(result[key]).toBe('[REDACTED]')
    }
  })

  it('redacts HIPAA-18 extended PHI keys: zip, postalCode, birthDate, fax, given, family, gender', () => {
    const input = {
      zip: '90210',
      postalCode: '90210',
      birthDate: '1990-06-15',
      fax: '555-9876',
      given: 'Jane',
      family: 'Doe',
      gender: 'F',
    }
    const result = redact(input) as Record<string, unknown>
    for (const key of Object.keys(input)) {
      expect(result[key]).toBe('[REDACTED]')
    }
  })

  it('redacts Error instances - message and stack may contain PHI', () => {
    const err = new Error('patient email: foo@bar.com')
    const result = redact(err) as Record<string, unknown>
    expect(result).toEqual({
      name: 'Error',
      message: '[REDACTED]',
      stack: '[REDACTED]',
    })
  })
})

describe('logger.safe - is an alias for logger', () => {
  it('logger.safe is the same object as logger', () => {
    expect(logger.safe).toBe(logger)
  })

  it('logger has expected methods', () => {
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('does not throw when called with null', () => {
    expect(() => logger.safe.info(null as unknown as Record<string, unknown>)).not.toThrow()
  })

  it('does not throw when called with a string message', () => {
    expect(() => logger.safe.info('some message')).not.toThrow()
  })
})
