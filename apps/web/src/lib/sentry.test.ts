import { describe, it, expect } from 'vitest'
import { stripPhiFromEvent } from './sentry.client'
import { sanitizeTransactionEvent } from './sentry-sanitize'
import type { ErrorEvent, TransactionEvent } from '@sentry/core'

// ---------------------------------------------------------------------------
// Unit tests for the Sentry beforeSend PHI-redaction logic.
// stripPhiFromEvent is exported from sentry.client.ts for testability.
// ---------------------------------------------------------------------------

/** Helper to construct an ErrorEvent for tests without specifying `type: undefined` everywhere. */
function makeEvent(partial: Partial<ErrorEvent>): ErrorEvent {
  return partial as unknown as ErrorEvent
}

function makeTransactionEvent(partial: Partial<TransactionEvent>): TransactionEvent {
  return partial as unknown as TransactionEvent
}

describe('stripPhiFromEvent', () => {
  it('redacts top-level messages that look like PHI', () => {
    const event = makeEvent({ message: 'patient email lookup failed' })
    const result = stripPhiFromEvent(event)!
    expect(result.message).toBe('[REDACTED]')
  })

  it('redacts standalone identifiers in top-level messages', () => {
    const event = makeEvent({
      message: 'Signup failed for jane@example.com, John Smith, 555-123-4567, 2026-04-23, 123-45-6789',
    })
    const result = stripPhiFromEvent(event)!

    expect(result.message).toBe(
      'Signup failed for [REDACTED-EMAIL], [REDACTED-NAME], [REDACTED-PHONE], [REDACTED-DATE], [REDACTED-SSN]',
    )
  })

  it('redacts exception values and stacktrace fields that may contain PHI', () => {
    const event = makeEvent({
      exception: {
        values: [
          {
            type: 'Error',
            value: 'patient jane@example.com failed',
            stacktrace: {
              frames: [
                {
                  function: 'loadPatientRecord',
                  vars: {
                    email: 'jane@example.com',
                    action: 'load',
                  },
                },
              ],
            },
          },
        ],
      },
    })

    const result = stripPhiFromEvent(event)!
    const exception = result.exception!.values![0]
    const stacktrace = exception.stacktrace as {
      frames: Array<{ vars: Record<string, unknown> }>
    }

    expect(exception.value).toBe('[REDACTED]')
    expect(stacktrace.frames[0].vars.email).toBe('[REDACTED]')
    expect(stacktrace.frames[0].vars.action).toBe('load')
  })

  it('redacts standalone identifiers in exception values', () => {
    const event = makeEvent({
      exception: {
        values: [
          {
            type: 'Error',
            value: 'user jane@example.com failed signup',
          },
        ],
      },
    })

    const result = stripPhiFromEvent(event)!
    expect(result.exception!.values![0].value).toBe('user [REDACTED-EMAIL] failed signup')
  })

  describe('request.data', () => {
    it('strips PHI keys from request.data', () => {
      const event = makeEvent({
        request: {
          data: {
            userId: 'abc123',
            email: 'patient@example.com',
            firstName: 'Jane',
            notes: 'Patient has hypertension',
            action: 'create_task',
          },
        },
      })
      const result = stripPhiFromEvent(event)!
      const data = result.request!.data as Record<string, unknown>
      expect(data.email).toBe('[REDACTED]')
      expect(data.firstName).toBe('[REDACTED]')
      expect(data.notes).toBe('[REDACTED]')
      // Non-PHI fields preserved
      expect(data.userId).toBe('abc123')
      expect(data.action).toBe('create_task')
    })

    it('handles nested PHI in request.data', () => {
      const event = makeEvent({
        request: {
          data: {
            patient: {
              mrn: '12345',
              task: 'follow-up',
            },
          },
        },
      })
      const result = stripPhiFromEvent(event)!
      const data = result.request!.data as Record<string, unknown>
      // 'patient' key matches PHI_PATTERN, gets redacted
      expect(data.patient).toBe('[REDACTED]')
    })

    it('handles event without request.data gracefully', () => {
      const event = makeEvent({ request: {} })
      expect(() => stripPhiFromEvent(event)).not.toThrow()
    })
  })

  describe('request.cookies', () => {
    it('clears all cookies', () => {
      const event = makeEvent({
        request: {
          cookies: { session: 'abc123', __cf_bm: 'xyz' },
        },
      })
      const result = stripPhiFromEvent(event)!
      expect(result.request!.cookies).toBeUndefined()
    })
  })

  describe('user context', () => {
    it('deletes user.email and user.ip_address', () => {
      const event = makeEvent({
        user: { id: 'user_123', email: 'doctor@clinic.com', ip_address: '1.2.3.4' },
      })
      const result = stripPhiFromEvent(event)!
      expect(result.user!.email).toBeUndefined()
      expect(result.user!.ip_address).toBeUndefined()
      // Non-PHI user field preserved
      expect(result.user!.id).toBe('user_123')
    })

    it('handles event without user field gracefully', () => {
      const event = makeEvent({ message: 'test error', level: 'error' })
      const result = stripPhiFromEvent(event)
      expect(result).toMatchObject({ message: 'test error', level: 'error' })
    })
  })

  describe('breadcrumbs', () => {
    it('redacts PHI keys from breadcrumb data', () => {
      const event = makeEvent({
        breadcrumbs: [
          {
            type: 'http',
            data: { url: '/api/tasks', email: 'user@clinic.com', status: 200 },
            message: 'HTTP request',
          },
        ],
      })
      const result = stripPhiFromEvent(event)!
      const breadcrumbs = result.breadcrumbs as Array<{ data: Record<string, unknown>; message: string }>
      expect(breadcrumbs[0].data.email).toBe('[REDACTED]')
      expect(breadcrumbs[0].data.url).toBe('/api/tasks')
      expect(breadcrumbs[0].data.status).toBe(200)
    })

    it('redacts breadcrumb messages containing PHI keyword "patient"', () => {
      const event = makeEvent({
        breadcrumbs: [{ message: 'patient record accessed', data: {} }],
      })
      const result = stripPhiFromEvent(event)!
      const breadcrumbs = result.breadcrumbs as Array<{ message: string }>
      expect(breadcrumbs[0].message).toBe('[REDACTED]')
    })

    it('redacts breadcrumb messages containing "email" keyword', () => {
      const event = makeEvent({
        breadcrumbs: [{ message: 'user email updated', data: {} }],
      })
      const result = stripPhiFromEvent(event)!
      const breadcrumbs = result.breadcrumbs as Array<{ message: string }>
      expect(breadcrumbs[0].message).toBe('[REDACTED]')
    })

    it('preserves breadcrumb messages that do not contain PHI keywords', () => {
      const event = makeEvent({
        breadcrumbs: [{ message: 'task created successfully', data: {} }],
      })
      const result = stripPhiFromEvent(event)!
      const breadcrumbs = result.breadcrumbs as Array<{ message: string }>
      expect(breadcrumbs[0].message).toBe('task created successfully')
    })

    it('handles breadcrumbs with undefined data gracefully', () => {
      const event = makeEvent({
        breadcrumbs: [{ message: 'some event' }],
      })
      const result = stripPhiFromEvent(event)!
      const breadcrumbs = result.breadcrumbs as Array<{ data: unknown }>
      expect(breadcrumbs[0].data).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('returns the event when request.data is absent', () => {
      const event = makeEvent({ level: 'error', message: 'something broke' })
      const result = stripPhiFromEvent(event)
      expect(result).toMatchObject({ level: 'error', message: 'something broke' })
    })

    it('does not crash on completely empty event', () => {
      expect(() => stripPhiFromEvent({} as unknown as ErrorEvent)).not.toThrow()
    })
  })
})

describe('sanitizeTransactionEvent', () => {
  it('redacts PHI from request data and clears cookies', () => {
    const event = makeTransactionEvent({
      request: {
        data: {
          action: 'load-dashboard',
          patientName: 'Jane Doe',
          email: 'patient@example.com',
        },
        cookies: {
          session: 'secret',
        },
      },
    })

    const result = sanitizeTransactionEvent(event)!
    const data = result.request!.data as Record<string, unknown>

    expect(data.action).toBe('load-dashboard')
    expect(data.patientName).toBe('[REDACTED]')
    expect(data.email).toBe('[REDACTED]')
    expect(result.request!.cookies).toBeUndefined()
  })

  it('removes sensitive user fields from transaction events', () => {
    const event = makeTransactionEvent({
      user: {
        id: 'user_123',
        email: 'doctor@clinic.com',
        ip_address: '1.2.3.4',
      },
    })

    const result = sanitizeTransactionEvent(event)!

    expect(result.user!.id).toBe('user_123')
    expect(result.user!.email).toBeUndefined()
    expect(result.user!.ip_address).toBeUndefined()
  })
})
