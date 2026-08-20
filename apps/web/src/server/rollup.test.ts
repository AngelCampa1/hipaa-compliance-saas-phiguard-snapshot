import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getChecklistRollupMock,
  getTaskRollupMock,
  getSessionFnMock,
  getDbMock,
  resolveActiveLocationAccessMock,
  requireFeatureForOrgMock,
  recordFeatureUsageMock,
  assertCommercialProductAccessMock,
} = vi.hoisted(() => ({
  getChecklistRollupMock: vi.fn(),
  getTaskRollupMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  getDbMock: vi.fn(),
  resolveActiveLocationAccessMock: vi.fn(),
  requireFeatureForOrgMock: vi.fn(),
  recordFeatureUsageMock: vi.fn().mockResolvedValue(undefined),
  assertCommercialProductAccessMock: vi.fn(),
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    handler: vi.fn((handler: () => unknown) => handler),
  })),
}))

vi.mock('@phiguard/compliance', () => ({
  getChecklistRollup: getChecklistRollupMock,
  getTaskRollup: getTaskRollupMock,
}))

vi.mock('@phiguard/billing', () => ({
  recordFeatureUsage: recordFeatureUsageMock,
  requireFeatureForOrg: requireFeatureForOrgMock,
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  organizations: {
    id: 'organizationId',
    plan: 'plan',
    planStatus: 'planStatus',
    trialEndsAt: 'trialEndsAt',
  },
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('./access.js', () => ({
  assertCommercialProductAccess: assertCommercialProductAccessMock,
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))

describe('rollup server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    getDbMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                plan: 'group',
                planStatus: 'active',
                trialEndsAt: null,
              },
            ]),
          }),
        }),
      }),
    })
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      allowedLocationIds: ['location-1'],
      canAccessAllLocations: true,
      commercial: {
        plan: 'group',
        planStatus: 'active',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    })
    requireFeatureForOrgMock.mockImplementation(() => undefined)
  })

  it('uses resolved access organization for compliance rollups when the session org is stale', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-stale' },
    })
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      allowedLocationIds: ['location-1'],
      canAccessAllLocations: true,
      commercial: null,
    })
    getChecklistRollupMock.mockResolvedValue([])

    const { getComplianceRollupFn } = await import('./rollup.js')

    await getComplianceRollupFn()

    expect(getChecklistRollupMock).toHaveBeenCalledWith(expect.anything(), {
      tenantId: 'org-1',
      locationIds: undefined,
    })
  })

  it('passes readable location scope to task rollups for location-limited users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'location_staff',
      allowedLocationIds: ['location-1'],
      canAccessAllLocations: false,
      commercial: null,
    })
    getTaskRollupMock.mockResolvedValue([])

    const { getTaskRollupFn } = await import('./rollup.js')

    await getTaskRollupFn()

    expect(getTaskRollupMock).toHaveBeenCalledWith(expect.anything(), {
      tenantId: 'org-1',
      locationIds: ['location-1'],
    })
  })

  it('uses resolved access organization when loading rollup plan context', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-stale' },
    })
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      allowedLocationIds: ['location-1'],
      canAccessAllLocations: true,
      commercial: null,
    })

    const { getRollupOrgPlanFn } = await import('./rollup.js')

    await expect(getRollupOrgPlanFn()).resolves.toMatchObject({
      plan: 'group',
      planStatus: 'active',
      trialEndsAt: null,
    })
    expect(resolveActiveLocationAccessMock).toHaveBeenCalled()
    expect(assertCommercialProductAccessMock).toHaveBeenCalled()
  })
})
