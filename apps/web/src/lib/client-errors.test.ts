import { describe, expect, it, vi, beforeEach } from 'vitest'

const captureExceptionMock = vi.hoisted(() => vi.fn(() => 'event-id'))

vi.mock('@sentry/react', () => ({
  captureException: captureExceptionMock,
  withScope: vi.fn((callback: (scope: {
    setTag: (key: string, value: string) => void
    setExtras: (extras: Record<string, unknown>) => void
  }) => void) => {
    callback({
      setTag: vi.fn(),
      setExtras: vi.fn(),
    })
  }),
}))

import { getClientErrorMessage } from './client-errors'

describe('getClientErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captures unexpected handled client errors and returns an error id message', () => {
    const message = getClientErrorMessage(new Error('database failed for user@example.com'), {
      route: '/app/tasks',
      operation: 'task.create',
      randomUUID: () => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    })

    expect(message).toContain('error ID err_aaaaaaaa')
    expect(message).not.toContain('user@example.com')
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error))
  })

  it('does not capture expected failures', () => {
    const message = getClientErrorMessage(new Error('File type not allowed'), {
      route: '/app/tasks',
      operation: 'task.upload',
      fallbackMessage: 'Upload failed.',
    })

    expect(message).toBe('File type not allowed')
    expect(captureExceptionMock).not.toHaveBeenCalled()
  })

  it('does not suppress unexpected bugs just because they contain validation-like words', () => {
    const message = getClientErrorMessage(new Error('Database invariant must be present'), {
      route: '/app/tasks',
      operation: 'task.create',
      randomUUID: () => 'cccccccc-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    })

    expect(message).toContain('error ID err_cccccccc')
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error))
  })
})
