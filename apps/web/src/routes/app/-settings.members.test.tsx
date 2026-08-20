import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: unknown) => ({
    ...(typeof config === 'object' && config ? config : {}),
  }),
}))

vi.mock('../../server/organizations', () => ({
  getMembersAndInvitationsFn: vi.fn(),
  inviteOrganizationMemberFn: vi.fn(),
  cancelInvitationFn: vi.fn(),
  resendInvitationFn: vi.fn(),
  updateMemberRoleFn: vi.fn(),
  removeMemberFn: vi.fn(),
  InviteMemberInput: {
    shape: {
      email: {
        safeParse: vi.fn(() => ({ success: true })),
      },
    },
  },
}))

vi.mock('../../lib/product-analytics-browser.js', () => ({
  trackProductEvent: vi.fn(),
}))

vi.mock('../../components/help-guidance', () => ({
  ConfirmActionDialog: () => null,
  ContextualHelpPanel: () => null,
  InlineHelpLabel: ({ label }: { label: string }) => <label>{label}</label>,
}))

import { MemberRow, InvitationRow } from './settings.members'

// Minimal fixture types matching OrganizationMember shape from getMembersAndInvitationsFn
type FixtureMember = {
  id: string
  role: string
  canManage: boolean
  user: { id: string; name: string; email: string; image: string | null; createdAt: Date }
  organizationId: string
  createdAt: Date
  teamId: string | null
}

type FixtureInvitation = {
  id: string
  email: string
  role: string
  status: string
  organizationId: string
  inviterId: string
  expiresAt: Date | null
  teamId: string | null
}

const noop = () => undefined

const baseDate = new Date('2024-01-01')

function makeAuditorMember(overrides: Partial<FixtureMember> = {}): FixtureMember {
  return {
    id: 'member-1',
    role: 'auditor',
    canManage: true,
    organizationId: 'org-1',
    createdAt: baseDate,
    teamId: null,
    user: {
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      image: null,
      createdAt: baseDate,
    },
    ...overrides,
  }
}

function makePendingInvitation(overrides: Partial<FixtureInvitation> = {}): FixtureInvitation {
  return {
    id: 'invite-1',
    email: 'invitee@example.com',
    role: 'auditor',
    status: 'pending',
    organizationId: 'org-1',
    inviterId: 'user-1',
    expiresAt: null,
    teamId: null,
    ...overrides,
  }
}

describe('MemberRow', () => {
  it('renders rounded-full on role select (active, non-last-admin)', () => {
    const member = makeAuditorMember()
    const html = renderToString(
      <MemberRow
        member={member as never}
        displayName="Jane Doe"
        isOwner={false}
        canManage={true}
        isLastOrgAdmin={false}
        canManageMembers={true}
        assignableRoles={['org_admin', 'auditor', 'location_manager', 'location_staff']}
        actionInFlight={null}
        handleRoleSelectChange={noop}
        confirmRemoveMember={noop}
      />,
    )

    // role select must include rounded-full
    expect(html).toMatch(/class="[^"]*rounded-full[^"]*"[^>]*>[\s\S]*?<option/)

    // Remove button must include rounded-full
    const removeButtonMatch = html.match(/class="([^"]*)"[^>]*>\s*Remove\s*<\/button>/)
    expect(removeButtonMatch).not.toBeNull()
    expect(removeButtonMatch![1]).toContain('rounded-full')
  })

  it('does not contain bare rounded class token on role select or Remove button', () => {
    const member = makeAuditorMember()
    const html = renderToString(
      <MemberRow
        member={member as never}
        displayName="Jane Doe"
        isOwner={false}
        canManage={true}
        isLastOrgAdmin={false}
        canManageMembers={true}
        assignableRoles={['org_admin', 'auditor', 'location_manager', 'location_staff']}
        actionInFlight={null}
        handleRoleSelectChange={noop}
        confirmRemoveMember={noop}
      />,
    )

    // Extract all class attribute values from select and button[Remove] elements
    // and assert none of them have a bare 'rounded' that is not rounded-full/rounded-lg etc.
    const selectClassMatch = html.match(/<select[^>]*class="([^"]*)"/)
    expect(selectClassMatch).not.toBeNull()
    const selectClasses = selectClassMatch![1].split(' ')
    expect(selectClasses).toContain('rounded-full')
    expect(selectClasses).not.toContain('rounded')

    const removeButtonMatch = html.match(/class="([^"]*)"[^>]*>\s*Remove\s*<\/button>/)
    expect(removeButtonMatch).not.toBeNull()
    const removeClasses = removeButtonMatch![1].split(' ')
    expect(removeClasses).toContain('rounded-full')
    expect(removeClasses).not.toContain('rounded')
  })

  it('renders the auditor option as selected when member role is auditor (controlled select)', () => {
    const member = makeAuditorMember({ role: 'auditor' })
    const html = renderToString(
      <MemberRow
        member={member as never}
        displayName="Jane Doe"
        isOwner={false}
        canManage={true}
        isLastOrgAdmin={false}
        canManageMembers={true}
        assignableRoles={['org_admin', 'auditor', 'location_manager', 'location_staff']}
        actionInFlight={null}
        handleRoleSelectChange={noop}
        confirmRemoveMember={noop}
      />,
    )

    // With a controlled <select value="auditor">, React SSR emits selected="" on the matching option
    expect(html).toMatch(/<option[^>]*value="auditor"[^>]*selected=""/)
  })
})

describe('InvitationRow', () => {
  it('renders rounded-full on Resend and Cancel invitation buttons', () => {
    const invitation = makePendingInvitation()
    const html = renderToString(
      <InvitationRow
        invitation={invitation as never}
        canManageMembers={true}
        canManageThisInvitation={true}
        actionInFlight={null}
        handleResendInvite={noop}
        confirmCancelInvite={noop}
      />,
    )

    // Extract button class attributes
    const buttonClassMatches = [...html.matchAll(/class="([^"]*)"[^>]*>\s*(Resend|Cancel invitation)\s*<\/button>/g)]
    expect(buttonClassMatches.length).toBe(2)

    for (const match of buttonClassMatches) {
      const classes = match[1].split(' ')
      expect(classes).toContain('rounded-full')
      expect(classes).not.toContain('rounded')
    }
  })
})
