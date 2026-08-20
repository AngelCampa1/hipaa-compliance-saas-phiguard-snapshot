import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  resolveSessionFromHeadersMock,
  resolveOrganizationAccessMock,
  getDbMock,
  dbSelectMock,
  dbFromMock,
  dbWhereMock,
  dbLimitMock,
} = vi.hoisted(() => ({
  resolveSessionFromHeadersMock: vi.fn(),
  resolveOrganizationAccessMock: vi.fn(),
  getDbMock: vi.fn(),
  dbSelectMock: vi.fn(),
  dbFromMock: vi.fn(),
  dbWhereMock: vi.fn(),
  dbLimitMock: vi.fn(),
}))

vi.mock('@phiguard/auth', () => ({
  resolveSessionFromHeaders: resolveSessionFromHeadersMock,
  resolveOrganizationAccess: resolveOrganizationAccessMock,
}))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

import { resolveAppSessionFromHeaders } from './session.server'

describe('resolveAppSessionFromHeaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    dbLimitMock.mockResolvedValue([{ plan: 'group', planStatus: 'active', trialEndsAt: null }])
    dbWhereMock.mockReturnValue({ limit: dbLimitMock })
    dbFromMock.mockReturnValue({ where: dbWhereMock })
    dbSelectMock.mockReturnValue({ from: dbFromMock })
    getDbMock.mockReturnValue({ select: dbSelectMock })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      scope: {
        role: 'org_owner',
      },
    })
  })

  it('attaches organization plan and role for active organizations', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'owner@example.com',
      },
    })

    const session = await resolveAppSessionFromHeaders(new Headers())

    expect(session?.organization).toEqual({
      plan: 'group',
      planStatus: 'active',
      trialEndsAt: null,
      role: 'org_owner',
    })
    expect(session?.session.activeOrganizationId).toBe('org-1')
  })

  it('clears stale active organizations when the user no longer belongs to any organization', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-stale',
      },
      user: {
        id: 'user-1',
        email: 'former@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({ status: 'needs-onboarding' })

    const session = await resolveAppSessionFromHeaders(new Headers())

    expect(session?.session.activeOrganizationId).toBeNull()
    expect(session?.organization).toEqual({
      plan: null,
      planStatus: null,
      trialEndsAt: null,
      role: null,
    })
    expect(dbSelectMock).not.toHaveBeenCalled()
  })
})
