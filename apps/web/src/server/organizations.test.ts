import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getRequestMock,
  getDbMock,
  resolveSessionFromHeadersMock,
  createOrganizationMock,
  createInvitationMock,
  cancelInvitationMock,
  setActiveOrganizationMock,
  listOrganizationsMock,
  getFullOrganizationMock,
  listInvitationsMock,
  acceptInvitationMock,
  removeMemberMock,
  updateMemberRoleMock,
  resolveOrganizationAccessMock,
  canManageMembersMock,
  canInviteMemberRoleMock,
  canAssignMemberRoleMock,
  canManageMemberRoleMock,
  baaGetLegalStatusMock,
  writeAuditEventMock,
} = vi.hoisted(() => ({
  getRequestMock: vi.fn(),
  getDbMock: vi.fn(() => ({})),
  resolveSessionFromHeadersMock: vi.fn(),
  createOrganizationMock: vi.fn(),
  createInvitationMock: vi.fn(),
  cancelInvitationMock: vi.fn(),
  setActiveOrganizationMock: vi.fn(),
  listOrganizationsMock: vi.fn(),
  getFullOrganizationMock: vi.fn(),
  listInvitationsMock: vi.fn(),
  acceptInvitationMock: vi.fn(),
  removeMemberMock: vi.fn(),
  updateMemberRoleMock: vi.fn(),
  resolveOrganizationAccessMock: vi.fn(),
  canManageMembersMock: vi.fn(),
  canInviteMemberRoleMock: vi.fn(),
  canAssignMemberRoleMock: vi.fn(),
  canManageMemberRoleMock: vi.fn(),
  baaGetLegalStatusMock: vi.fn(),
  writeAuditEventMock: vi.fn(async () => undefined),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getRequest: getRequestMock,
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((fn) => fn),
  })),
}))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: writeAuditEventMock,
}))

vi.mock('@phiguard/baa', () => ({
  BaaService: vi.fn(() => ({
    getLegalStatus: baaGetLegalStatusMock,
  })),
}))

vi.mock('@phiguard/auth', () => ({
  auth: {
    api: {
      createOrganization: createOrganizationMock,
      createInvitation: createInvitationMock,
      cancelInvitation: cancelInvitationMock,
      setActiveOrganization: setActiveOrganizationMock,
      listOrganizations: listOrganizationsMock,
      getFullOrganization: getFullOrganizationMock,
      listInvitations: listInvitationsMock,
      acceptInvitation: acceptInvitationMock,
      removeMember: removeMemberMock,
      updateMemberRole: updateMemberRoleMock,
      getSession: resolveSessionFromHeadersMock,
    },
  },
  resolveSessionFromHeaders: resolveSessionFromHeadersMock,
  resolveOrganizationAccess: resolveOrganizationAccessMock,
  canManageMembers: canManageMembersMock,
  canInviteMemberRole: canInviteMemberRoleMock,
  canAssignMemberRole: canAssignMemberRoleMock,
  canManageMemberRole: canManageMemberRoleMock,
}))

import {
  bootstrapOrganizationFn,
  acceptOrganizationInvitationFn,
  cancelInvitationFn,
  ensurePrimaryLocationForOrganization,
  filterPendingInvitations,
  getMembersAndInvitationsFn,
  inviteOrganizationMemberFn,
  removeMemberFn,
  resendInvitationFn,
  updateMemberRoleFn,
} from './organizations.js'

describe('organization bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canManageMembersMock.mockImplementation(
      (role: string) => role === 'org_owner' || role === 'org_admin' || role === 'location_manager',
    )
    canInviteMemberRoleMock.mockImplementation(
      (actorRole: string, targetRole: string) =>
        actorRole === 'org_owner' ||
        actorRole === 'org_admin' ||
        (actorRole === 'location_manager' && targetRole === 'location_staff'),
    )
    canAssignMemberRoleMock.mockImplementation(
      (actorRole: string, targetRole: string) =>
        actorRole === 'org_owner' ||
        actorRole === 'org_admin' ||
        (actorRole === 'location_manager' && targetRole === 'location_staff'),
    )
    canManageMemberRoleMock.mockImplementation(
      (actorRole: string, targetRole: string) =>
        actorRole === 'org_owner' ||
        actorRole === 'org_admin' ||
        (actorRole === 'location_manager' && targetRole === 'location_staff'),
    )
    writeAuditEventMock.mockResolvedValue(undefined)
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
    })
    removeMemberMock.mockResolvedValue(undefined)
    updateMemberRoleMock.mockResolvedValue(undefined)
    cancelInvitationMock.mockResolvedValue(undefined)
    createInvitationMock.mockResolvedValue({ id: 'invite-1' })
    getRequestMock.mockReturnValue({
      headers: new Headers({
        cookie: 'session=abc',
      }),
    })
  })

  it('creates a primary location for a newly bootstrapped organization', async () => {
    const db = makeBootstrapDb()

    await ensurePrimaryLocationForOrganization({
      db: db as never,
      organizationId: 'org-1',
      locationName: 'Riverside Family Practice',
    })

    expect(db.insert).toHaveBeenCalledOnce()
    expect(db.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        name: 'Riverside Family Practice',
        isPrimary: true,
        slug: 'riverside-family-practice',
      }),
    )
  })

  it('reuses the existing primary location when one is already present', async () => {
    const db = makeBootstrapDb([{ id: 'existing-primary-location' }])

    const locationId = await ensurePrimaryLocationForOrganization({
      db: db as never,
      organizationId: 'org-1',
      locationName: 'Riverside Family Practice',
    })

    expect(locationId).toBe('existing-primary-location')
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('loads members and invitations for the fallback organization when the session has no active org', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: null,
      },
      user: {
        id: 'user-1',
        email: 'owner@example.com',
      },
    })
    resolveOrganizationAccessMock
      // resolveOrganizationSession() - no active org, discovers fallback
      .mockResolvedValueOnce({
        status: 'switch-required',
        activeOrganizationId: 'org-fallback',
        scope: {
          organizationId: 'org-fallback',
          role: 'org_admin',
          accessLevel: 'organization',
          locationIds: [],
        },
      })
      // getMembersAndInvitationsFn() - session now has activeOrganizationId, resolves ready
      .mockResolvedValueOnce({
        status: 'ready',
        activeOrganizationId: 'org-fallback',
        scope: {
          organizationId: 'org-fallback',
          role: 'org_admin',
          accessLevel: 'organization',
          locationIds: [],
        },
      })
    getFullOrganizationMock.mockResolvedValue({
      id: 'org-fallback',
      name: 'Fallback Clinic',
    })
    listInvitationsMock.mockResolvedValue([{ id: 'invite-1' }])

    await getMembersAndInvitationsFn()

    expect(getFullOrganizationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      query: {
        organizationId: 'org-fallback',
      },
    })
    expect(listInvitationsMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      query: {
        organizationId: 'org-fallback',
      },
    })
  })

  it('loads members and invitations for the resolved organization when the session active org is stale', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-stale',
      },
      user: {
        id: 'user-1',
        email: 'owner@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValueOnce({
      status: 'switch-required',
      activeOrganizationId: 'org-resolved',
      scope: {
        organizationId: 'org-resolved',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })
    getFullOrganizationMock.mockResolvedValue({
      id: 'org-resolved',
      name: 'Resolved Clinic',
    })
    listInvitationsMock.mockResolvedValue([{ id: 'invite-1' }])

    await getMembersAndInvitationsFn()

    expect(setActiveOrganizationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        organizationId: 'org-resolved',
      },
    })
    expect(getFullOrganizationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      query: {
        organizationId: 'org-resolved',
      },
    })
    expect(listInvitationsMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      query: {
        organizationId: 'org-resolved',
      },
    })
  })

  it('does not expose pending invitations to read-only roles', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'auditor@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'auditor',
        accessLevel: 'organization',
        locationIds: [],
      },
    })
    getFullOrganizationMock.mockResolvedValue({ id: 'org-1', name: 'Clinic' })

    await getMembersAndInvitationsFn()

    expect(listInvitationsMock).not.toHaveBeenCalled()
  })

  it('returns role capabilities that match location manager server permissions', async () => {
    getDbMock.mockReturnValue(
      makeMembersPageDb({
        organization: {
          planStatus: 'trialing',
          trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
          trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
        },
        locationGrants: [{ membershipId: 'member-staff', locationId: 'location-1' }],
      }),
    )
    mockReadyAccess('location_manager')
    getFullOrganizationMock.mockResolvedValue({
      id: 'org-1',
      name: 'Clinic',
      members: [
        {
          id: 'member-admin',
          role: 'org_admin',
          user: { name: 'Admin', email: 'admin@example.com' },
        },
        {
          id: 'member-staff',
          role: 'location_staff',
          user: { name: 'Staff', email: 'staff@example.com' },
        },
        {
          id: 'member-other-staff',
          role: 'location_staff',
          user: { name: 'Other Staff', email: 'other-staff@example.com' },
        },
      ],
    })
    listInvitationsMock.mockResolvedValue([
      {
        id: 'invite-admin',
        role: 'org_admin',
        status: 'pending',
        email: 'admin2@example.com',
      },
      {
        id: 'invite-staff',
        role: 'location_staff',
        status: 'pending',
        email: 'staff2@example.com',
      },
    ])

    const result = await getMembersAndInvitationsFn()

    expect(result.inviteableRoles).toEqual(['location_staff'])
    expect(result.assignableRoles).toEqual(['location_staff'])
    expect(result.manageableRoles).toEqual(['location_staff'])
    expect(result.organization?.members).toEqual([
      expect.objectContaining({ id: 'member-admin', canManage: false }),
      expect.objectContaining({ id: 'member-staff', canManage: true }),
      expect.objectContaining({ id: 'member-other-staff', canManage: false }),
    ])
  })

  it('marks role-manageable members actionable for organization administrators', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    mockReadyAccess('org_admin')
    getFullOrganizationMock.mockResolvedValue({
      id: 'org-1',
      name: 'Clinic',
      members: [
        {
          id: 'member-admin',
          role: 'org_admin',
          user: { name: 'Admin', email: 'admin@example.com' },
        },
        {
          id: 'member-staff',
          role: 'location_staff',
          user: { name: 'Staff', email: 'staff@example.com' },
        },
      ],
    })
    listInvitationsMock.mockResolvedValue([
      {
        id: 'invite-admin',
        role: 'org_admin',
        status: 'pending',
        email: 'admin2@example.com',
      },
      {
        id: 'invite-staff',
        role: 'location_staff',
        status: 'pending',
        email: 'staff2@example.com',
      },
    ])

    const result = await getMembersAndInvitationsFn()

    expect(result.organization?.members).toEqual([
      expect.objectContaining({ id: 'member-admin', canManage: true }),
      expect.objectContaining({ id: 'member-staff', canManage: true }),
    ])
  })

  it('only keeps pending invitations for the members page', () => {
    expect(
      filterPendingInvitations([
        { id: 'invite-pending', status: 'pending' },
        { id: 'invite-canceled', status: 'canceled' },
      ]),
    ).toEqual([{ id: 'invite-pending', status: 'pending' }])
  })

  it('rejects member and invitation reads before the selected trial is started', async () => {
    getDbMock.mockReturnValue(makeCommercialStateDb({ planStatus: 'trial_pending' }))
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(getMembersAndInvitationsFn()).rejects.toThrow(
      'Start the trial before accessing PHIGuard.',
    )
    expect(getFullOrganizationMock).not.toHaveBeenCalled()
    expect(listInvitationsMock).not.toHaveBeenCalled()
  })

  it('rejects member and invitation reads when Terms or BAA acceptance is not current', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
    })
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(getMembersAndInvitationsFn()).rejects.toThrow(
      'You need to accept the Terms and BAA before using PHIGuard.',
    )
    expect(getFullOrganizationMock).not.toHaveBeenCalled()
    expect(listInvitationsMock).not.toHaveBeenCalled()
  })

  it('creates invitations against the fallback organization when the session has no active org', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: null,
      },
      user: {
        id: 'user-1',
        email: 'owner@example.com',
      },
    })
    resolveOrganizationAccessMock
      .mockResolvedValueOnce({
        status: 'switch-required',
        activeOrganizationId: 'org-fallback',
        scope: {
          organizationId: 'org-fallback',
          role: 'org_admin',
          accessLevel: 'organization',
          locationIds: [],
        },
      })
      .mockResolvedValueOnce({
        status: 'ready',
        activeOrganizationId: 'org-fallback',
        scope: {
          organizationId: 'org-fallback',
          role: 'org_admin',
          accessLevel: 'organization',
          locationIds: [],
        },
      })
    createInvitationMock.mockResolvedValue({ id: 'invite-1' })

    await inviteOrganizationMemberFn({
      data: {
        email: 'auditor@example.com',
        role: 'auditor',
      },
    })

    expect(createInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        email: 'auditor@example.com',
        role: 'auditor',
        organizationId: 'org-fallback',
      },
    })
  })

  it('rejects invitation creation before the selected trial is started', async () => {
    getDbMock.mockReturnValue(makeCommercialStateDb({ planStatus: 'trial_pending' }))
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Start the trial before accessing PHIGuard.')
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects invitation creation when Terms or BAA acceptance is not current', async () => {
    getDbMock.mockReturnValue(
      makeCommercialStateDb({
        planStatus: 'trialing',
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
    })
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('You need to accept the Terms and BAA before using PHIGuard.')
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects invitation creation for roles that cannot manage members', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'auditor@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'auditor',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Only managers and administrators can manage members')
  })

  it.each(['org_admin', 'auditor', 'location_manager'] as const)(
    'rejects location manager invitations for %s',
    async (role) => {
      getDbMock.mockReturnValue(makeCommercialStateDb({ planStatus: 'trialing' }))
      resolveSessionFromHeadersMock.mockResolvedValue({
        session: {
          id: 'sess-1',
          userId: 'user-1',
          activeOrganizationId: 'org-1',
        },
        user: {
          id: 'user-1',
          email: 'manager@example.com',
        },
      })
      resolveOrganizationAccessMock.mockResolvedValue({
        status: 'ready',
        activeOrganizationId: 'org-1',
        scope: {
          organizationId: 'org-1',
          role: 'location_manager',
          accessLevel: 'location',
          locationIds: ['location-1'],
        },
      })

      await expect(
        inviteOrganizationMemberFn({
          data: {
            email: 'member@example.com',
            role,
          },
        }),
      ).rejects.toThrow('Only organization administrators can manage privileged member roles')
      expect(createInvitationMock).not.toHaveBeenCalled()
    },
  )

  it('allows location managers to invite location staff', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 1,
        pendingInvitations: 1,
        locationRows: [{ id: 'location-2' }],
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'manager@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'location_manager',
        accessLevel: 'location',
        locationIds: ['location-2'],
      },
    })

    await inviteOrganizationMemberFn({
      data: {
        email: 'staff@example.com',
        role: 'location_staff',
      },
    })

    expect(createInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        email: 'staff@example.com',
        role: 'location_staff',
        organizationId: 'org-1',
        teamId: 'location-2',
      },
    })
  })

  it('allows organization administrators to invite location staff to a selected non-primary location', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 1,
        pendingInvitations: 1,
        locationRows: [{ id: 'location-2' }],
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'admin@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: ['location-1', 'location-2'],
      },
    })

    await inviteOrganizationMemberFn({
      data: {
        email: 'staff@example.com',
        role: 'location_staff',
        locationId: '22222222-2222-4222-8222-222222222222',
      },
    })

    expect(createInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        email: 'staff@example.com',
        role: 'location_staff',
        organizationId: 'org-1',
        teamId: 'location-2',
      },
    })
  })

  it('rejects organization administrator location-scoped invitations without an explicit location', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 1,
        pendingInvitations: 1,
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'admin@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: ['location-1', 'location-2'],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Location is required for location-scoped member invitations')

    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects manager invitations to locations outside their scope', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 1,
        pendingInvitations: 1,
      }),
    )
    resolveSessionFromHeadersMock.mockResolvedValue({
      session: {
        id: 'sess-1',
        userId: 'user-1',
        activeOrganizationId: 'org-1',
      },
      user: {
        id: 'user-1',
        email: 'manager@example.com',
      },
    })
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'location_manager',
        accessLevel: 'location',
        locationIds: ['location-1'],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
          locationId: '22222222-2222-4222-8222-222222222222',
        },
      }),
    ).rejects.toThrow('Location is outside your location scope')

    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('blocks invitation creation when active and pending members reach maxMembers', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 2,
        activeMembers: 1,
        pendingInvitations: 1,
      }),
    )
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Member limit reached for this plan')
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('allows inviting beyond the stored plan cap while the trial is active', async () => {
    // No plan picked yet (selection_required-style trial): stored cap is the
    // default 10, but an active trial grants full access, so inviting an 11th
    // member must not be blocked by the plan cap.
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 10,
        pendingInvitations: 0,
        plan: null,
        capacityPlanStatus: 'trialing',
        capacityTrialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
        locationRows: [{ id: 'location-1' }],
      }),
    )
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
          locationId: '11111111-1111-4111-8111-111111111111',
        },
      }),
    ).resolves.toBeDefined()
    expect(createInvitationMock).toHaveBeenCalled()
  })

  it('still blocks invites past the highest plan cap during a trial', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 100,
        pendingInvitations: 0,
        plan: null,
        capacityPlanStatus: 'trialing',
        capacityTrialEndsAt: new Date('2099-05-16T12:00:00.000Z'),
      }),
    )
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Member limit reached for this plan')
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('falls back to the stored plan cap once the trial has expired', async () => {
    // Trial status but the trial window has passed: full-access capacity must
    // no longer apply, so the stored cap (10) binds again.
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 10,
        pendingInvitations: 0,
        plan: null,
        capacityPlanStatus: 'trialing',
        capacityTrialEndsAt: new Date('2020-01-01T00:00:00.000Z'),
      }),
    )
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
    resolveOrganizationAccessMock.mockResolvedValue({
      status: 'ready',
      activeOrganizationId: 'org-1',
      scope: {
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        locationIds: [],
      },
    })

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'staff@example.com',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Member limit reached for this plan')
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('cancels the created invitation when the audit write fails after invite creation', async () => {
    getDbMock.mockReturnValue(
      makeCapacityDb({
        maxMembers: 10,
        activeMembers: 1,
        pendingInvitations: 1,
      }),
    )
    mockReadyAccess('org_admin')
    createInvitationMock.mockResolvedValue({ id: 'invite-1' })
    writeAuditEventMock.mockRejectedValueOnce(new Error('audit write failed'))

    await expect(
      inviteOrganizationMemberFn({
        data: {
          email: 'auditor@example.com',
          role: 'auditor',
        },
      }),
    ).rejects.toThrow('audit write failed')

    expect(createInvitationMock).toHaveBeenCalledTimes(1)
    expect(cancelInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { invitationId: 'invite-1' },
    })
  })

  it('rejects location manager canceling privileged invitations', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('auditor'))
    mockReadyAccess('location_manager')

    await expect(
      cancelInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('Only organization administrators can manage privileged member roles')
    expect(cancelInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects canceling invitations when Terms or BAA acceptance is not current', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff'))
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
    })
    mockReadyAccess('org_admin')

    await expect(
      cancelInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('You need to accept the Terms and BAA before using PHIGuard.')
    expect(cancelInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects canceling non-pending invitations before mutating auth state', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff', null, 'accepted'))
    mockReadyAccess('org_admin')

    await expect(
      cancelInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('Only pending invitations can be canceled')

    expect(cancelInvitationMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('restores a pending invitation when cancel audit fails after auth cancellation', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff', 'location-2'))
    mockReadyAccess('org_admin')
    writeAuditEventMock.mockRejectedValueOnce(new Error('audit write failed'))

    await expect(
      cancelInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('audit write failed')

    expect(cancelInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { invitationId: 'invite-1' },
    })
    expect(createInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        email: 'member@example.com',
        role: 'location_staff',
        organizationId: 'org-1',
        teamId: 'location-2',
      },
    })
  })

  it('rejects location manager resending privileged invitations', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_manager'))
    mockReadyAccess('location_manager')

    await expect(
      resendInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('Only organization administrators can manage privileged member roles')
    expect(cancelInvitationMock).not.toHaveBeenCalled()
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('allows resending an existing staff invitation without preflight capacity blocking', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff', 'location-2'))
    mockReadyAccess('location_manager')

    await resendInvitationFn({
      data: {
        invitationId: 'invite-1',
      },
    })

    expect(cancelInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { invitationId: 'invite-1' },
    })
    expect(createInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        email: 'member@example.com',
        role: 'location_staff',
        organizationId: 'org-1',
        teamId: 'location-2',
      },
    })
  })

  it('rejects resending non-pending invitations before mutating auth state', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff', 'location-2', 'accepted'))
    mockReadyAccess('location_manager')

    await expect(
      resendInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('Only pending invitations can be resent')

    expect(cancelInvitationMock).not.toHaveBeenCalled()
    expect(createInvitationMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('restores a pending invitation when resend replacement creation fails after cancellation', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff', 'location-2'))
    mockReadyAccess('location_manager')
    createInvitationMock.mockRejectedValueOnce(new Error('replacement failed'))

    await expect(
      resendInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('replacement failed')

    expect(cancelInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { invitationId: 'invite-1' },
    })
    expect(createInvitationMock).toHaveBeenCalledTimes(2)
    expect(createInvitationMock).toHaveBeenNthCalledWith(2, {
      headers: expect.any(Headers),
      body: {
        email: 'member@example.com',
        role: 'location_staff',
        organizationId: 'org-1',
        teamId: 'location-2',
      },
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('restores the original invitation when resend audit fails after replacement creation', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff', 'location-2'))
    mockReadyAccess('location_manager')
    createInvitationMock.mockResolvedValueOnce({ id: 'invite-replacement' })
    writeAuditEventMock.mockRejectedValueOnce(new Error('audit write failed'))

    await expect(
      resendInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('audit write failed')

    expect(cancelInvitationMock).toHaveBeenCalledTimes(2)
    expect(cancelInvitationMock).toHaveBeenNthCalledWith(1, {
      headers: expect.any(Headers),
      body: { invitationId: 'invite-1' },
    })
    expect(cancelInvitationMock).toHaveBeenNthCalledWith(2, {
      headers: expect.any(Headers),
      body: { invitationId: 'invite-replacement' },
    })
    expect(createInvitationMock).toHaveBeenCalledTimes(2)
    expect(createInvitationMock).toHaveBeenNthCalledWith(2, {
      headers: expect.any(Headers),
      body: {
        email: 'member@example.com',
        role: 'location_staff',
        organizationId: 'org-1',
        teamId: 'location-2',
      },
    })
  })

  it('rejects resending invitations when Terms or BAA acceptance is not current', async () => {
    getDbMock.mockReturnValue(makeInvitationRoleDb('location_staff'))
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
    })
    mockReadyAccess('org_admin')

    await expect(
      resendInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('You need to accept the Terms and BAA before using PHIGuard.')
    expect(cancelInvitationMock).not.toHaveBeenCalled()
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects location manager updating privileged member roles', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('org_admin'))
    mockReadyAccess('location_manager')

    await expect(
      updateMemberRoleFn({
        data: {
          memberId: 'member-1',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Only organization administrators can manage privileged member roles')
    expect(updateMemberRoleMock).not.toHaveBeenCalled()
  })

  it('rejects location manager promoting staff to privileged roles', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('location_staff'))
    mockReadyAccess('location_manager')

    await expect(
      updateMemberRoleFn({
        data: {
          memberId: 'member-1',
          role: 'org_admin',
        },
      }),
    ).rejects.toThrow('Only organization administrators can manage privileged member roles')
    expect(updateMemberRoleMock).not.toHaveBeenCalled()
  })

  it('rejects member role updates when Terms or BAA acceptance is not current', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('location_staff'))
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
    })
    mockReadyAccess('org_admin')

    await expect(
      updateMemberRoleFn({
        data: {
          memberId: 'member-1',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('You need to accept the Terms and BAA before using PHIGuard.')
    expect(updateMemberRoleMock).not.toHaveBeenCalled()
  })

  it('pre-provisions an active location grant when assigning a location-scoped role', async () => {
    const db = makeMemberRoleGrantProvisionDb({
      role: 'org_admin',
      existingGrantRows: [],
      defaultLocationRows: [{ id: 'location-primary' }],
    })
    getDbMock.mockReturnValue(db)
    mockReadyAccess('org_admin')

    await updateMemberRoleFn({
      data: {
        memberId: 'member-1',
        role: 'location_staff',
      },
    })

    expect(db.insertValues).toHaveBeenCalledWith({
      tenantId: 'org-1',
      membershipId: 'member-1',
      locationId: 'location-primary',
    })
    expect(updateMemberRoleMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        memberId: 'member-1',
        role: 'location_staff',
        organizationId: 'org-1',
      },
    })
  })

  it('rejects location-scoped role assignments when the organization has no active locations', async () => {
    const db = makeMemberRoleGrantProvisionDb({
      role: 'org_admin',
      existingGrantRows: [],
      defaultLocationRows: [],
    })
    getDbMock.mockReturnValue(db)
    mockReadyAccess('org_admin')

    await expect(
      updateMemberRoleFn({
        data: {
          memberId: 'member-1',
          role: 'location_manager',
        },
      }),
    ).rejects.toThrow('Location-scoped roles require at least one active location')

    expect(db.insert).not.toHaveBeenCalled()
    expect(updateMemberRoleMock).not.toHaveBeenCalled()
  })

  it('rolls back member role changes and newly provisioned grants when audit logging fails', async () => {
    const db = makeMemberRoleGrantProvisionDb({
      role: 'org_admin',
      existingGrantRows: [],
      defaultLocationRows: [{ id: 'location-primary' }],
    })
    getDbMock.mockReturnValue(db)
    mockReadyAccess('org_admin')
    writeAuditEventMock.mockRejectedValueOnce(new Error('audit failed'))

    await expect(
      updateMemberRoleFn({
        data: {
          memberId: 'member-1',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('audit failed')

    expect(updateMemberRoleMock).toHaveBeenNthCalledWith(1, {
      headers: expect.any(Headers),
      body: {
        memberId: 'member-1',
        role: 'location_staff',
        organizationId: 'org-1',
      },
    })
    expect(updateMemberRoleMock).toHaveBeenNthCalledWith(2, {
      headers: expect.any(Headers),
      body: {
        memberId: 'member-1',
        role: 'org_admin',
        organizationId: 'org-1',
      },
    })
    expect(db.delete).toHaveBeenCalled()
    expect(db.deleteWhere).toHaveBeenCalled()
  })

  it('rejects location manager removing privileged members', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('auditor'))
    mockReadyAccess('location_manager')

    await expect(
      removeMemberFn({
        data: {
          memberId: 'member-1',
        },
      }),
    ).rejects.toThrow('Only organization administrators can manage privileged member roles')
    expect(removeMemberMock).not.toHaveBeenCalled()
  })

  it('rejects member removal when Terms or BAA acceptance is not current', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('location_staff'))
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
    })
    mockReadyAccess('org_admin')

    await expect(
      removeMemberFn({
        data: {
          memberId: 'member-1',
        },
      }),
    ).rejects.toThrow('You need to accept the Terms and BAA before using PHIGuard.')
    expect(removeMemberMock).not.toHaveBeenCalled()
  })

  it('rejects direct owner role changes from organization administrators', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('org_owner'))
    mockReadyAccess('org_admin')

    await expect(
      updateMemberRoleFn({
        data: {
          memberId: 'member-1',
          role: 'location_staff',
        },
      }),
    ).rejects.toThrow('Organization owners cannot be managed from member settings')
    expect(updateMemberRoleMock).not.toHaveBeenCalled()
  })

  it('rejects direct owner removal from organization administrators', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('org_owner'))
    mockReadyAccess('org_admin')

    await expect(
      removeMemberFn({
        data: {
          memberId: 'member-1',
        },
      }),
    ).rejects.toThrow('Organization owners cannot be managed from member settings')
    expect(removeMemberMock).not.toHaveBeenCalled()
  })

  it('rejects location managers managing staff outside their granted locations', async () => {
    getDbMock.mockReturnValue(makeMemberRoleDb('location_staff', ['location-2']))
    mockReadyAccess('location_manager')

    await expect(
      removeMemberFn({
        data: {
          memberId: 'member-1',
        },
      }),
    ).rejects.toThrow('Member is outside your location scope')
    expect(removeMemberMock).not.toHaveBeenCalled()
  })

  it('removes members in the same transaction that writes the audit event', async () => {
    const db = makeMemberRemovalDb('location_staff')
    getDbMock.mockReturnValue(db)
    mockReadyAccess('org_admin')

    await removeMemberFn({
      data: {
        memberId: 'member-1',
      },
    })

    expect(removeMemberMock).not.toHaveBeenCalled()
    expect(db.delete).not.toHaveBeenCalled()
    expect(db.transaction).toHaveBeenCalledOnce()
    expect(db.txDelete).toHaveBeenCalledOnce()
    expect(db.txDeleteWhere).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'member.removed',
        resourceType: 'organization_member',
        resourceId: 'member-1',
        before: { role: 'location_staff' },
      }),
    )
  })

  it('does not audit member removal when the transactional delete is stale', async () => {
    const db = makeMemberRemovalDb('location_staff', [])
    getDbMock.mockReturnValue(db)
    mockReadyAccess('org_admin')

    await expect(
      removeMemberFn({
        data: {
          memberId: 'member-1',
        },
      }),
    ).rejects.toThrow('Member not found')

    expect(removeMemberMock).not.toHaveBeenCalled()
    expect(db.transaction).toHaveBeenCalledOnce()
    expect(db.txDeleteReturning).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rolls back member removal when audit logging fails', async () => {
    const db = makeMemberRemovalDb('location_staff')
    getDbMock.mockReturnValue(db)
    mockReadyAccess('org_admin')
    writeAuditEventMock.mockRejectedValueOnce(new Error('audit failed'))

    await expect(
      removeMemberFn({
        data: {
          memberId: 'member-1',
        },
      }),
    ).rejects.toThrow('audit failed')

    expect(removeMemberMock).not.toHaveBeenCalled()
    expect(db.delete).not.toHaveBeenCalled()
    expect(db.transaction).toHaveBeenCalledOnce()
    expect(db.txDeleteWhere).toHaveBeenCalledOnce()
  })

  it('keeps bootstrap org creation inside the transaction that provisions ownership and the primary location', async () => {
    const db = makeBootstrapLifecycleDb()
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'owner@example.com'))

    await bootstrapOrganizationFn({
      data: {
        clinicName: 'Riverside Family Practice',
        inviteEmail: '',
      },
    })

    expect(db.insert).not.toHaveBeenCalled()
    expect(db.transaction).toHaveBeenCalledOnce()
    expect(db.txInsert).toHaveBeenCalledTimes(3)
    expect(db.orgInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Riverside Family Practice',
        slug: 'riverside-family-practice',
        planStatus: 'trial_pending',
      }),
    )
    expect(db.txUpdate).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'org.created',
        resourceType: 'organization',
        resourceId: 'org-1',
      }),
    )
  })

  it('applies the selected onboarding plan when bootstrapping the organization', async () => {
    const db = makeBootstrapLifecycleDb()
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'owner@example.com'))

    await bootstrapOrganizationFn({
      data: {
        clinicName: 'Riverside Family Practice',
        inviteEmail: '',
        interestedPlan: 'group',
      },
    })

    expect(db.orgInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Riverside Family Practice',
        slug: 'riverside-family-practice',
        plan: 'group',
        interestedPlan: 'group',
        planStatus: 'trial_pending',
        maxMembers: 100,
        billingPriceMonthlyCents: 46900,
        planSelectedAt: expect.any(Date),
      }),
    )
  })

  it('does not create invitations during bootstrap before legal onboarding is complete', async () => {
    const db = makeBootstrapLifecycleDb()
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'owner@example.com'))

    const result = await bootstrapOrganizationFn({
      data: {
        clinicName: 'Riverside Family Practice',
        inviteEmail: 'admin@example.com',
      },
    })

    expect(result.invitation).toBeNull()
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('rolls back the accepted membership if local provisioning fails after invitation acceptance', async () => {
    const db = makeAcceptanceRollbackDb()
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'member@example.com'))
    acceptInvitationMock.mockResolvedValue({ id: 'accepted-invite' })
    removeMemberMock.mockResolvedValue(undefined)
    writeAuditEventMock.mockRejectedValueOnce(new Error('audit failed'))

    await expect(
      acceptOrganizationInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('audit failed')

    expect(acceptInvitationMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        invitationId: 'invite-1',
      },
    })
    expect(removeMemberMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {
        memberIdOrEmail: 'member@example.com',
        organizationId: 'org-1',
      },
    })
    expect(db.updateSet).toHaveBeenCalledWith({ status: 'pending' })
  })

  it('rejects accepting invitations before the invited email is verified', async () => {
    const db = makeAcceptanceRollbackDb()
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(
      makeSession('user-1', 'member@example.com', false),
    )

    await expect(
      acceptOrganizationInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('Verify the invited email address before accepting this invitation')

    expect(acceptInvitationMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects accepting invitations from a different signed-in email', async () => {
    const db = makeAcceptanceRollbackDb()
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'attacker@example.com'))

    await expect(
      acceptOrganizationInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('Sign in with the invited email address before accepting this invitation')

    expect(acceptInvitationMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects accepting invitations when Terms or BAA acceptance is not current', async () => {
    const db = makeAcceptanceRollbackDb()
    getDbMock.mockReturnValue(db as never)
    baaGetLegalStatusMock.mockResolvedValue({
      terms: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: false,
      },
      baa: {
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        isCurrent: true,
      },
    })
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'member@example.com'))

    await expect(
      acceptOrganizationInvitationFn({
        data: {
          invitationId: 'invite-1',
        },
      }),
    ).rejects.toThrow('You need to accept the Terms and BAA before using PHIGuard.')

    expect(acceptInvitationMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('grants accepted location staff invitations to the location captured on the invitation', async () => {
    const db = makeInvitationAcceptanceDb({
      invitation: {
        id: 'invite-1',
        organizationId: 'org-1',
        role: 'location_staff',
        email: 'member@example.com',
        teamId: 'location-2',
      },
      membership: { id: 'member-1' },
      location: { id: 'location-2' },
    })
    getDbMock.mockReturnValue(db as never)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1', 'member@example.com'))
    acceptInvitationMock.mockResolvedValue({ id: 'accepted-invite' })

    await acceptOrganizationInvitationFn({
      data: {
        invitationId: 'invite-1',
      },
    })

    expect(db.txInsertValues).toHaveBeenCalledWith({
      tenantId: 'org-1',
      membershipId: 'member-1',
      locationId: 'location-2',
    })
  })
})

function makeBootstrapDb(primaryLocationRows: Array<{ id: string }> = []) {
  const locationSlugLookup = vi.fn().mockResolvedValue([])
  const primaryLocationLookup = vi.fn().mockResolvedValue(primaryLocationRows)

  const selectLimit = vi
    .fn()
    .mockImplementationOnce(primaryLocationLookup)
    .mockImplementation(locationSlugLookup)
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  const insertReturning = vi.fn().mockResolvedValue([{ id: 'loc-1' }])
  const insertValues = vi.fn().mockReturnValue({
    returning: insertReturning,
  })
  const insert = vi.fn().mockReturnValue({
    values: insertValues,
  })
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteFn = vi.fn().mockReturnValue({
    where: deleteWhere,
  })

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    insert,
    insertValues,
    delete: deleteFn,
    deleteWhere,
  }
}

function makeBootstrapLifecycleDb() {
  type MockTransaction = {
    select: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }

  const selectLimit = vi.fn().mockResolvedValue([])
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })

  const orgInsertReturning = vi.fn().mockResolvedValue([
    {
      id: 'org-1',
      name: 'Riverside Family Practice',
      slug: 'riverside-family-practice',
    },
  ])
  const orgInsertValues = vi.fn().mockReturnValue({
    returning: orgInsertReturning,
  })

  const membershipInsertOnConflict = vi.fn().mockResolvedValue(undefined)
  const membershipInsertValues = vi.fn().mockReturnValue({
    onConflictDoNothing: membershipInsertOnConflict,
  })

  const locationInsertReturning = vi.fn().mockResolvedValue([{ id: 'loc-1' }])
  const locationInsertValues = vi.fn().mockReturnValue({
    returning: locationInsertReturning,
  })

  const txInsert = vi
    .fn()
    .mockImplementationOnce(() => ({ values: orgInsertValues }))
    .mockImplementationOnce(() => ({ values: membershipInsertValues }))
    .mockImplementationOnce(() => ({ values: locationInsertValues }))

  const txUpdateWhere = vi.fn().mockResolvedValue(undefined)
  const txUpdateSet = vi.fn().mockReturnValue({
    where: txUpdateWhere,
  })
  const txUpdate = vi.fn().mockReturnValue({
    set: txUpdateSet,
  })

  const tx: MockTransaction = {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    insert: txInsert,
    update: txUpdate,
  }

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    insert: vi.fn(() => {
      throw new Error('bootstrap should use the transaction, not the base db')
    }),
    transaction: vi.fn(async (callback: (currentTx: MockTransaction) => Promise<unknown>) =>
      callback(tx),
    ),
    tx,
    txInsert,
    txUpdate,
    orgInsertValues,
  }
}

function makeAcceptanceRollbackDb() {
  type MockTransaction = {
    select: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }

  const invitation = {
    id: 'invite-1',
    organizationId: 'org-1',
    role: 'location_staff',
    email: 'member@example.com',
  }

  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const rows = [
    [invitation],
    [
      {
        plan: 'clinic',
        planStatus: 'active',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        baaSignedAt: legalAcceptedAt,
        termsAcceptedAt: legalAcceptedAt,
      },
    ],
  ]

  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })

  const tx: MockTransaction = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  }
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  })
  const update = vi.fn().mockReturnValue({
    set: updateSet,
  })

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    insert: vi.fn(),
    update,
    updateSet,
    transaction: vi.fn(async (callback: (currentTx: MockTransaction) => Promise<unknown>) =>
      callback(tx),
    ),
    tx,
  }
}

function makeInvitationAcceptanceDb(input: {
  invitation: {
    id: string
    organizationId: string
    role: 'location_manager' | 'location_staff'
    email: string
    teamId?: string | null
  }
  membership: { id: string }
  location: { id: string }
}) {
  type MockTransaction = {
    select: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }

  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const rows = [
    [input.invitation],
    [
      {
        plan: 'clinic',
        planStatus: 'active',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        baaSignedAt: legalAcceptedAt,
        termsAcceptedAt: legalAcceptedAt,
      },
    ],
  ]

  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })

  const txSelectLimit = vi
    .fn()
    .mockResolvedValueOnce([input.membership])
    .mockResolvedValueOnce([input.location])
  const txSelectWhere = vi.fn().mockReturnValue({
    limit: txSelectLimit,
  })
  const txSelectFrom = vi.fn().mockReturnValue({
    where: txSelectWhere,
  })
  const txInsertOnConflictDoNothing = vi.fn().mockResolvedValue(undefined)
  const txInsertValues = vi.fn().mockReturnValue({
    onConflictDoNothing: txInsertOnConflictDoNothing,
  })
  const tx: MockTransaction = {
    select: vi.fn().mockReturnValue({
      from: txSelectFrom,
    }),
    insert: vi.fn().mockReturnValue({
      values: txInsertValues,
    }),
    update: vi.fn(),
  }

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    transaction: vi.fn(async (callback: (currentTx: MockTransaction) => Promise<unknown>) =>
      callback(tx),
    ),
    tx,
    txInsertValues,
  }
}

function makeCommercialStateDb(
  org: Partial<{
    plan: 'essentials' | 'clinic' | 'group'
    planStatus:
      | 'selection_required'
      | 'trial_pending'
      | 'trialing'
      | 'active'
      | 'paused'
      | 'past_due'
      | 'canceled'
    trialStartedAt: Date | null
    trialEndsAt: Date | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    baaSignedAt: Date | null
    termsAcceptedAt: Date | null
  }> = {},
) {
  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')

  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              plan: org.plan ?? 'clinic',
              planStatus: org.planStatus ?? 'trialing',
              trialStartedAt: org.trialStartedAt ?? null,
              trialEndsAt: org.trialEndsAt ?? null,
              stripeCustomerId: org.stripeCustomerId ?? null,
              stripeSubscriptionId: org.stripeSubscriptionId ?? null,
              baaSignedAt: org.baaSignedAt ?? legalAcceptedAt,
              termsAcceptedAt: org.termsAcceptedAt ?? legalAcceptedAt,
            },
          ]),
        }),
      }),
    }),
  }
}

function makeMembersPageDb(input: {
  organization?: Parameters<typeof makeCommercialStateDb>[0]
  locationGrants?: Array<{ membershipId: string; locationId: string }>
}) {
  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const org = input.organization ?? {}
  const rows = [
    [
      {
        plan: org.plan ?? 'clinic',
        planStatus: org.planStatus ?? 'trialing',
        trialStartedAt: org.trialStartedAt ?? null,
        trialEndsAt: org.trialEndsAt ?? null,
        stripeCustomerId: org.stripeCustomerId ?? null,
        stripeSubscriptionId: org.stripeSubscriptionId ?? null,
        baaSignedAt: org.baaSignedAt ?? legalAcceptedAt,
        termsAcceptedAt: org.termsAcceptedAt ?? legalAcceptedAt,
      },
    ],
    input.locationGrants ?? [],
  ]
  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
  }
}

function makeCapacityDb(input: {
  maxMembers: number
  activeMembers: number
  pendingInvitations: number
  locationRows?: Array<{ id: string }>
  plan?: 'essentials' | 'clinic' | 'group' | null
  capacityPlanStatus?:
    | 'selection_required'
    | 'trial_pending'
    | 'trialing'
    | 'active'
    | 'paused'
    | 'past_due'
    | 'canceled'
  capacityTrialEndsAt?: Date | null
  planStatus?:
    | 'selection_required'
    | 'trial_pending'
    | 'trialing'
    | 'active'
    | 'paused'
    | 'past_due'
    | 'canceled'
}) {
  const rows = [
    [
      {
        plan: input.plan ?? 'clinic',
        planStatus: input.planStatus ?? 'trialing',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
        termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      },
    ],
    [
      {
        maxMembers: input.maxMembers,
        plan: input.plan ?? null,
        planStatus: input.capacityPlanStatus ?? 'active',
        trialEndsAt: input.capacityTrialEndsAt ?? null,
      },
    ],
    [{ count: input.activeMembers }],
    [{ count: input.pendingInvitations }],
    input.locationRows ?? [],
  ]
  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
  }
}

function makeInvitationRoleDb(
  role: 'org_admin' | 'auditor' | 'location_manager' | 'location_staff',
  teamId?: string | null,
  status: 'pending' | 'accepted' | 'rejected' | 'canceled' = 'pending',
) {
  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const rows = [
    [
      {
        id: 'invite-1',
        role,
        email: 'member@example.com',
        teamId,
        status,
      },
    ],
    [
      {
        plan: 'clinic',
        planStatus: 'trialing',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        baaSignedAt: legalAcceptedAt,
        termsAcceptedAt: legalAcceptedAt,
      },
    ],
  ]
  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
  }
}

function makeMemberRoleDb(
  role: 'org_owner' | 'org_admin' | 'auditor' | 'location_manager' | 'location_staff',
  locationIds: string[] = [],
) {
  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const rows = [
    [
      {
        id: 'member-1',
        role,
      },
    ],
    ...(locationIds.length ? [locationIds.map((locationId) => ({ locationId }))] : []),
    [
      {
        plan: 'clinic',
        planStatus: 'trialing',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        baaSignedAt: legalAcceptedAt,
        termsAcceptedAt: legalAcceptedAt,
      },
    ],
  ]
  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
  }
}

function makeMemberRemovalDb(
  role: 'org_owner' | 'org_admin' | 'auditor' | 'location_manager' | 'location_staff',
  deletedRows: Array<{ id: string }> = [{ id: 'member-1' }],
) {
  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const rows = [
    [
      {
        id: 'member-1',
        role,
      },
    ],
    [
      {
        plan: 'clinic',
        planStatus: 'trialing',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        baaSignedAt: legalAcceptedAt,
        termsAcceptedAt: legalAcceptedAt,
      },
    ],
  ]
  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectFrom = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  const txDeleteWhere = vi.fn().mockResolvedValue(undefined)
  const txDeleteReturning = vi.fn().mockResolvedValue(deletedRows)
  const txDelete = vi.fn().mockReturnValue({
    where: vi.fn((...args: unknown[]) => {
      txDeleteWhere(...args)
      return { returning: txDeleteReturning }
    }),
  })
  const tx = {
    delete: txDelete,
  }

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    delete: vi.fn(() => {
      throw new Error('member removal should use the transaction, not the base db')
    }),
    transaction: vi.fn(async (callback: (currentTx: typeof tx) => Promise<unknown>) =>
      callback(tx),
    ),
    tx,
    txDelete,
    txDeleteWhere,
    txDeleteReturning,
  }
}

function makeMemberRoleGrantProvisionDb(input: {
  role: 'org_owner' | 'org_admin' | 'auditor' | 'location_manager' | 'location_staff'
  existingGrantRows: Array<{ locationId: string }>
  defaultLocationRows: Array<{ id: string }>
}) {
  const legalAcceptedAt = new Date('2026-04-16T12:00:00.000Z')
  const rows = [
    [
      {
        id: 'member-1',
        role: input.role,
      },
    ],
    [
      {
        plan: 'clinic',
        planStatus: 'trialing',
        trialStartedAt: null,
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        baaSignedAt: legalAcceptedAt,
        termsAcceptedAt: legalAcceptedAt,
      },
    ],
    input.existingGrantRows,
    input.defaultLocationRows,
  ]
  const selectLimit = vi.fn().mockImplementation(() => Promise.resolve(rows.shift() ?? []))
  const selectOrderBy = vi.fn().mockReturnValue({
    limit: selectLimit,
  })
  const selectWhere = vi.fn().mockReturnValue({
    limit: selectLimit,
    orderBy: selectOrderBy,
  })
  const selectInnerJoin = vi.fn().mockReturnValue({
    where: selectWhere,
  })
  const selectFrom = vi.fn().mockReturnValue({
    innerJoin: selectInnerJoin,
    where: selectWhere,
  })
  const insertOnConflictDoNothing = vi.fn().mockResolvedValue(undefined)
  const insertValues = vi.fn().mockReturnValue({
    onConflictDoNothing: insertOnConflictDoNothing,
  })
  const insert = vi.fn().mockReturnValue({
    values: insertValues,
  })
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteFn = vi.fn().mockReturnValue({
    where: deleteWhere,
  })

  return {
    select: vi.fn().mockReturnValue({
      from: selectFrom,
    }),
    insert,
    insertValues,
    delete: deleteFn,
    deleteWhere,
  }
}

function mockReadyAccess(
  role: 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor',
) {
  resolveSessionFromHeadersMock.mockResolvedValue({
    session: {
      id: 'sess-1',
      userId: 'user-1',
      activeOrganizationId: 'org-1',
    },
    user: {
      id: 'user-1',
      email: 'manager@example.com',
    },
  })
  resolveOrganizationAccessMock.mockResolvedValue({
    status: 'ready',
    activeOrganizationId: 'org-1',
    scope: {
      organizationId: 'org-1',
      role,
      accessLevel:
        role === 'location_manager' || role === 'location_staff' ? 'location' : 'organization',
      locationIds: role === 'location_manager' || role === 'location_staff' ? ['location-1'] : [],
    },
  })
}

function makeSession(userId: string, email: string, emailVerified = true) {
  return {
    session: {
      id: 'sess-1',
      userId,
      activeOrganizationId: 'org-1',
    },
    user: {
      id: userId,
      email,
      emailVerified,
    },
  }
}
