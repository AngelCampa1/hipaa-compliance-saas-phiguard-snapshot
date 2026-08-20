import { beforeEach, describe, expect, it, vi } from 'vitest'

const { warnMock } = vi.hoisted(() => ({
  warnMock: vi.fn(),
}))

vi.mock('@phiguard/audit', () => ({
  logger: {
    safe: {
      warn: warnMock,
    },
  },
}))

import { recordFailedLoginAttempt } from './auth-log.js'

describe('recordFailedLoginAttempt', () => {
  beforeEach(() => {
    warnMock.mockReset()
  })

  it('writes a PHI-safe failed-login log line for CloudWatch metric filters', async () => {
    await recordFailedLoginAttempt({
      route: '/login',
      reason: 'invalid_credentials',
    })

    expect(warnMock).toHaveBeenCalledWith(
      {
        route: '/login',
        reason: 'invalid_credentials',
      },
      'Failed login',
    )
  })
})
