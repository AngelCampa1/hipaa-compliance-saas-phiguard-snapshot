import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSessionFnMock, getDbMock, resolveOrganizationAccessMock } = vi.hoisted(() => ({
  getSessionFnMock: vi.fn(),
  getDbMock: vi.fn(),
  resolveOrganizationAccessMock: vi.fn(),
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    handler: vi.fn((handler: () => unknown) => handler),
  })),
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  organizations: {
    id: 'organizationId',
    plan: 'plan',
    planStatus: 'planStatus',
    trialEndsAt: 'trialEndsAt',
  },
  resolveOrganizationAccess: resolveOrganizationAccessMock,
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))

describe('organization feature context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: ['location-1'],
      },
    })
    getDbMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                plan: 'group',
                planStatus: 'trialing',
                trialEndsAt: new Date('2026-06-01T00:00:00.000Z'),
              },
            ]),
          }),
        }),
      }),
    })
  })

  it('loads feature context from resolved access when the session org is stale', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-stale' },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'switch-required',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: ['location-1'],
      },
    })

    const { getOrgFeatureContext } = await import('./feature-context.js')

    await expect(getOrgFeatureContext()).resolves.toEqual({
      plan: 'group',
      planStatus: 'trialing',
      trialEndsAt: '2026-06-01T00:00:00.000Z',
    })
    expect(resolveOrganizationAccessMock).toHaveBeenCalledWith(expect.anything(), {
      activeOrganizationId: 'org-stale',
      userId: 'user-1',
    })
  })

  it('fails closed when the user has no organization memberships', async () => {
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'needs-onboarding',
    })

    const { getOrgFeatureContext } = await import('./feature-context.js')

    await expect(getOrgFeatureContext()).rejects.toThrow('No active organization')
  })
})
