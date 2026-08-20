import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PUBLIC_PLAN_IDS } from '@phiguard/billing/plans'

/**
 * organizations server function tests.
 *
 * Focuses on the RBAC membership check added to switchActiveOrganizationFn.
 */

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const {
  andMock,
  authApiGetSessionMock,
  authApiSetActiveOrganizationMock,
  eqMock,
  getDbMock,
  loggerMock,
  membershipsTable,
  resolveOrganizationAccessMock,
  writeAuditEventMock,
} = vi.hoisted(() => {
  const membershipsTable = {
    id: 'memberships.id',
    userId: 'memberships.userId',
    tenantId: 'memberships.tenantId',
    role: 'memberships.role',
  }

  return {
    andMock: vi.fn((...args: unknown[]) => ({ _and: args })),
    authApiGetSessionMock: vi.fn(),
    authApiSetActiveOrganizationMock: vi.fn(),
    eqMock: vi.fn((col: unknown, val: unknown) => ({ _eq: [col, val] })),
    getDbMock: vi.fn(),
    loggerMock: { safe: { warn: vi.fn(), info: vi.fn() } },
    membershipsTable,
    resolveOrganizationAccessMock: vi.fn(),
    writeAuditEventMock: vi.fn(),
  }
})

// ---------------------------------------------------------------------------
// Module mocks - must come before any imports from the module under test
// ---------------------------------------------------------------------------

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((handler: (input: { data?: unknown }) => unknown) => {
      return (input: { data?: unknown } = {}) => handler(input)
    }),
  })),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getRequest: vi.fn().mockReturnValue({ headers: new Headers() }),
}))

vi.mock('drizzle-orm', () => ({
  and: andMock,
  asc: vi.fn(),
  count: vi.fn(),
  desc: vi.fn(),
  eq: eqMock,
  inArray: vi.fn(),
}))

vi.mock('@phiguard/audit', () => ({
  logger: loggerMock,
  writeAuditEvent: writeAuditEventMock,
}))

vi.mock('@phiguard/baa', () => ({
  BaaService: vi.fn(() => ({
    getLegalStatus: vi.fn().mockResolvedValue({
      terms: { acceptedAt: null, isCurrent: false },
      baa: { acceptedAt: null, isCurrent: false },
    }),
  })),
}))

vi.mock('@phiguard/billing', () => ({
  PLANS: {},
  PUBLIC_PLAN_IDS,
  isTrialAllAccess: vi.fn().mockReturnValue(false),
}))

vi.mock('@phiguard/auth', () => ({
  resolveOrganizationAccess: resolveOrganizationAccessMock,
  canManageMembers: vi.fn().mockReturnValue(true),
  canManageMemberRole: vi.fn().mockReturnValue(true),
  canInviteMemberRole: vi.fn().mockReturnValue(true),
  canAssignMemberRole: vi.fn().mockReturnValue(true),
  auth: {
    api: {
      getSession: authApiGetSessionMock,
      setActiveOrganization: authApiSetActiveOrganizationMock,
    },
  },
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  memberships: membershipsTable,
  organizations: {
    id: 'organizations.id',
    plan: 'organizations.plan',
    planStatus: 'organizations.planStatus',
    trialEndsAt: 'organizations.trialEndsAt',
    baaSignedAt: 'organizations.baaSignedAt',
    termsAcceptedAt: 'organizations.termsAcceptedAt',
  },
  locations: {},
  locationGrants: {},
  organizationInvitations: {},
  sessions: {},
  partners: {},
  referrals: {},
}))

vi.mock('../location-utils.js', () => ({
  buildUniqueLocationSlug: vi.fn(),
}))

vi.mock('../access.js', () => ({
  assertCommercialProductAccess: vi.fn(),
  canManageOrganization: vi.fn().mockReturnValue(true),
  resolveActiveLocationAccess: vi.fn(),
}))

import { switchActiveOrganizationFn } from '../organizations.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A minimal better-auth session object that satisfies the fields organizations.ts reads. */
function makeAuthSession(activeOrganizationId: string | null = 'org-1') {
  return {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      emailVerified: true,
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: 'session-1',
      userId: 'user-1',
      activeOrganizationId,
      token: 'tok',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 3_600_000),
      ipAddress: null,
      userAgent: null,
    },
  }
}

function makeDb(membershipRows: unknown[] = [{ id: 'membership-1' }]) {
  const limit = vi.fn().mockResolvedValue(membershipRows)
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })
  return { select }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  authApiGetSessionMock.mockResolvedValue(makeAuthSession('org-1'))
  authApiSetActiveOrganizationMock.mockResolvedValue({ organizationId: 'org-target' })
})

describe('switchActiveOrganizationFn - RBAC membership check', () => {
  it('allows the switch when the caller is an active member of the target org', async () => {
    const db = makeDb([{ id: 'membership-1' }])
    getDbMock.mockReturnValue(db)

    await expect(
      switchActiveOrganizationFn({
        data: { organizationId: '00000000-0000-4000-8000-000000000002' },
      }),
    ).resolves.toEqual({ organizationId: 'org-target' })

    expect(authApiSetActiveOrganizationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { organizationId: '00000000-0000-4000-8000-000000000002' },
      }),
    )
  })

  it('throws a 403-equivalent error when the caller is NOT a member of the target org', async () => {
    const db = makeDb([]) // empty → not a member
    getDbMock.mockReturnValue(db)

    await expect(
      switchActiveOrganizationFn({
        data: { organizationId: '00000000-0000-4000-8000-000000000099' },
      }),
    ).rejects.toThrow('You do not have access to this organization')

    expect(authApiSetActiveOrganizationMock).not.toHaveBeenCalled()
  })

  it('logs a safe warning containing userId but not organizationId when membership check fails', async () => {
    const db = makeDb([])
    getDbMock.mockReturnValue(db)

    await expect(
      switchActiveOrganizationFn({
        data: { organizationId: '00000000-0000-4000-8000-000000000099' },
      }),
    ).rejects.toThrow()

    expect(loggerMock.safe.warn).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
      expect.stringContaining('not a member'),
    )

    // Confirm the log payload does not include organizationId (no cross-tenant leak)
    const [payload] = loggerMock.safe.warn.mock.calls[0] as [Record<string, unknown>]
    expect(payload).not.toHaveProperty('organizationId')
  })
})
