import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getRequestMock, withAuditContextMock } = vi.hoisted(() => ({
  getRequestMock: vi.fn(),
  withAuditContextMock: vi.fn(),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getRequest: getRequestMock,
}))

vi.mock('@phiguard/audit', () => ({
  withAuditContext: withAuditContextMock,
}))

import { runInAuditContextForHeaders } from './audit.js'
import { runInAuditContext } from './audit.server.js'

describe('runInAuditContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    withAuditContextMock.mockImplementation(async (_ctx: unknown, fn: () => Promise<unknown>) => fn())
  })

  it('uses the first forwarded IP when present', async () => {
    getRequestMock.mockReturnValue(new Request('https://app.phiguard.test', {
      headers: {
        'x-forwarded-for': '198.51.100.4, 10.0.0.1',
        'user-agent': 'Vitest',
      },
    }))

    await runInAuditContext('user-1', async () => 'ok')

    expect(withAuditContextMock).toHaveBeenCalledWith(
      {
        actorId: 'user-1',
        ip: '198.51.100.4',
        userAgent: 'Vitest',
      },
      expect.any(Function),
    )
  })

  it('falls back to the first valid forwarded ip when proxy headers are absent', async () => {
    getRequestMock.mockReturnValue(new Request('https://app.phiguard.test', {
      headers: {
        'x-forwarded-for': 'not-an-ip, 203.0.113.9, 10.0.0.1',
      },
    }))

    await runInAuditContext('user-1', async () => 'ok')

    expect(withAuditContextMock).toHaveBeenCalledWith(
      {
        actorId: 'user-1',
        ip: '203.0.113.9',
        userAgent: undefined,
      },
      expect.any(Function),
    )
  })

  it('can populate audit context from explicit API route headers', async () => {
    await runInAuditContextForHeaders(
      'user-1',
      new Headers({
        'x-forwarded-for': '198.51.100.8',
        'user-agent': 'ApiRouteTest',
      }),
      async () => 'ok',
    )

    expect(withAuditContextMock).toHaveBeenCalledWith(
      {
        actorId: 'user-1',
        ip: '198.51.100.8',
        userAgent: 'ApiRouteTest',
      },
      expect.any(Function),
    )
  })
})
