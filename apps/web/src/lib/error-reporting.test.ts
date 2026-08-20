import { describe, expect, it, vi } from 'vitest'
import {
  getReportableErrorMessage,
  isReportableError,
  makeTrackingId,
  toUserError,
} from './error-reporting'

describe('error reporting policy', () => {
  it('reports unexpected errors and 5xx statuses only', () => {
    expect(isReportableError(new Error('boom'))).toBe(true)
    expect(isReportableError(new Error('bad request'), { status: 400 })).toBe(false)
    expect(isReportableError(new Error('server failed'), { status: 503 })).toBe(true)
    expect(isReportableError(new Error('Forbidden'))).toBe(false)
    expect(isReportableError(new Error('Feature unavailable on this plan'))).toBe(false)
    expect(isReportableError(new Error('Database invariant must be present'))).toBe(true)
    expect(isReportableError(new Error('Invalid token format while decrypting OAuth callback'))).toBe(true)
  })

  it('creates stable support messages with tracking ids for reportable failures', () => {
    const id = makeTrackingId(() => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee')

    expect(id).toBe('err_aaaaaaaa')
    expect(getReportableErrorMessage(id)).toContain('error ID err_aaaaaaaa')
  })

  it('does not expose unexpected error messages to users', () => {
    const randomUUID = vi.fn(() => 'bbbbbbbb-1111-4222-8333-cccccccccccc')
    const userError = toUserError(new Error('patient jane@example.com failed'), {
      randomUUID,
    })

    expect(userError.reportable).toBe(true)
    expect(userError.trackingId).toBe('err_bbbbbbbb')
    expect(userError.message).toContain('error ID err_bbbbbbbb')
    expect(userError.message).not.toContain('jane@example.com')
  })

  it('returns known safe messages without tracking ids for expected failures', () => {
    const userError = toUserError(new Error('File type not allowed'), {
      status: 400,
      fallbackMessage: 'Upload failed.',
    })

    expect(userError).toEqual({
      message: 'File type not allowed',
      reportable: false,
      trackingId: null,
    })
  })

  it('extracts known safe messages from structured validation payloads', () => {
    const userError = toUserError(
      new Error(
        '[ { "code": "custom", "path": [ "contentType" ], "message": "File type not allowed" } ]',
      ),
      {
        fallbackMessage: 'Upload failed.',
      },
    )

    expect(userError).toEqual({
      message: 'File type not allowed',
      reportable: false,
      trackingId: null,
    })
  })

  it('returns safe expected route-boundary messages without tracking ids', () => {
    const userError = toUserError(new Error('Unauthorized'))

    expect(userError).toEqual({
      message: 'Unauthorized',
      reportable: false,
      trackingId: null,
    })
  })
})
