import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  getMembersAndInvitationsFn,
  inviteOrganizationMemberFn,
  cancelInvitationFn,
  resendInvitationFn,
  updateMemberRoleFn,
  removeMemberFn,
  InviteMemberInput,
} from '../../server/organizations'
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  PageHeader,
  Panel,
  PanelHeader,
  Skeleton,
  StatusPanel,
  SummaryMetric,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@phiguard/ui'
import {
  ConfirmActionDialog,
  ContextualHelpPanel,
  InlineHelpLabel,
} from '../../components/help-guidance'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'
import { ROLE_LABELS, leastPrivilegedInviteRole } from '../../lib/roles.js'

type MembersState = Awaited<ReturnType<typeof getMembersAndInvitationsFn>>
type OrganizationMember = NonNullable<MembersState['organization']>['members'][number]
type OrganizationInvitation = MembersState['invitations'][number]
type PendingMemberAction =
  | { type: 'cancel-invite'; invitationId: string; email: string }
  | { type: 'remove-member'; memberId: string; memberName: string }
type MemberAssignableRole = 'org_admin' | 'auditor' | 'location_manager' | 'location_staff'

/** Role key for the last-admin guard. */
const ADMIN_ROLE = 'org_admin'

/**
 * Roles lower than org_admin - used to detect when an admin→lower downgrade
 * needs an AlertDialog confirmation before applying.
 */
const LOWER_THAN_ADMIN_ROLES: readonly MemberAssignableRole[] = [
  'auditor',
  'location_manager',
  'location_staff',
]


export const Route = createFileRoute('/app/settings/members')({
  component: MembersSettingsPage,
})

type MemberRowProps = {
  member: OrganizationMember
  displayName: string
  isOwner: boolean
  canManage: boolean
  isLastOrgAdmin: boolean
  canManageMembers: boolean
  assignableRoles: MemberAssignableRole[]
  actionInFlight: string | null
  handleRoleSelectChange: (member: OrganizationMember, newRole: string) => void
  confirmRemoveMember: (memberId: string, memberName: string) => void
}

export function MemberRow({
  member,
  displayName,
  isOwner,
  canManage,
  isLastOrgAdmin,
  canManageMembers,
  assignableRoles,
  actionInFlight,
  handleRoleSelectChange,
  confirmRemoveMember,
}: MemberRowProps) {
  return (
    <div className="rounded-lg border border-border-muted px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-text-primary truncate">{displayName}</p>
          <p className="text-sm text-text-muted truncate">{member.user.email}</p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          {ROLE_LABELS[member.role] ?? 'Unknown role'}
        </span>
      </div>
      {canManageMembers && !isOwner && canManage && (
        <div className="mt-2 flex items-center gap-2">
          {isLastOrgAdmin ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <select
                    value={member.role}
                    aria-label={`Change role for ${displayName}`}
                    disabled
                    className="rounded-full border border-border-strong bg-surface-0 px-2 py-1 text-xs text-text-secondary opacity-50 cursor-not-allowed"
                  >
                    {assignableRoles.map((assignableRole) => (
                      <option key={assignableRole} value={assignableRole}>
                        {ROLE_LABELS[assignableRole] ?? assignableRole}
                      </option>
                    ))}
                  </select>
                </span>
              </TooltipTrigger>
              <TooltipContent>Cannot remove the last admin</TooltipContent>
            </Tooltip>
          ) : (
            <select
              value={member.role}
              aria-label={`Change role for ${displayName}`}
              disabled={actionInFlight === member.id}
              onChange={(e) => handleRoleSelectChange(member, e.target.value)}
              className="rounded-full border border-border-strong bg-surface-0 px-2 py-1 text-xs text-text-secondary disabled:opacity-50"
            >
              {assignableRoles.map((assignableRole) => (
                <option key={assignableRole} value={assignableRole}>
                  {ROLE_LABELS[assignableRole] ?? assignableRole}
                </option>
              ))}
            </select>
          )}
          {isLastOrgAdmin ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <button
                    disabled
                    aria-label={`Remove ${displayName} - cannot remove the last admin`}
                    className="rounded-full border border-danger-200 bg-danger-50 px-2 py-1 text-xs text-danger-600 opacity-50 cursor-not-allowed"
                  >
                    Remove
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Cannot remove the last admin</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => confirmRemoveMember(member.id, displayName)}
              disabled={actionInFlight === member.id}
              className="rounded-full border border-danger-200 bg-danger-50 px-2 py-1 text-xs text-danger-600 hover:bg-danger-100 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

type InvitationRowProps = {
  invitation: OrganizationInvitation
  canManageMembers: boolean
  canManageThisInvitation: boolean
  actionInFlight: string | null
  handleResendInvite: (invitationId: string) => void
  confirmCancelInvite: (invitationId: string, email: string) => void
}

export function InvitationRow({
  invitation,
  canManageMembers,
  canManageThisInvitation,
  actionInFlight,
  handleResendInvite,
  confirmCancelInvite,
}: InvitationRowProps) {
  return (
    <div className="rounded-lg border border-border-muted px-4 py-3">
      <p className="font-medium text-text-primary">{invitation.email}</p>
      <p className="mt-1 text-sm text-text-muted">
        {`${ROLE_LABELS[invitation.role] ?? invitation.role} - ${invitation.status}`}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Open in same tab - admin should not lose page context. */}
        <a
          href={`/accept-invite/${invitation.id}`}
          className="text-sm text-text-link hover:underline"
          onClick={() =>
            trackProductEvent('invitation_link_opened', {
              route: '/app/settings/members',
              action: 'open_invite_link',
              role: invitation.role,
            })
          }
        >
          Open invite link
        </a>
        {canManageMembers && invitation.status === 'pending' && canManageThisInvitation && (
          <>
            <button
              onClick={() => handleResendInvite(invitation.id)}
              disabled={actionInFlight === invitation.id}
              className="rounded-full border border-border-strong bg-surface-0 px-2 py-1 text-xs text-text-secondary hover:bg-background-subtle disabled:opacity-50"
            >
              Resend
            </button>
            <button
              onClick={() => confirmCancelInvite(invitation.id, invitation.email)}
              disabled={actionInFlight === invitation.id}
              className="rounded-full border border-danger-200 bg-danger-50 px-2 py-1 text-xs text-danger-600 hover:bg-danger-100 disabled:opacity-50"
            >
              Cancel invitation
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const FALLBACK_INVITE_ROLE: MemberAssignableRole = 'location_staff'

function isMemberAssignableRole(role: string): role is MemberAssignableRole {
  return (
    role === 'org_admin' ||
    role === 'auditor' ||
    role === 'location_manager' ||
    role === 'location_staff'
  )
}

function MembersSettingsPage() {
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [role, setRole] = useState<MemberAssignableRole>(FALLBACK_INVITE_ROLE)
  const [membersState, setMembersState] = useState<MembersState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingMemberAction | null>(null)
  /**
   * Role-downgrade confirm state: holds memberId + new role while we wait for
   * the user to confirm an admin → lower-role change.
   */
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    memberId: string
    memberName: string
    currentRole: string
    newRole: MemberAssignableRole
  } | null>(null)

  const loadMembers = async () => {
    setError(null)
    try {
      const result = await getMembersAndInvitationsFn()
      setMembersState(result)
    } catch (loadError) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'members.load',
        error_type: 'client_error',
      })
      setError(loadError instanceof Error ? loadError.message : 'Failed to load members.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMembers()
  }, [])

  const handleMembersRetry = () => {
    trackProductEvent('member_settings_retry_clicked', {
      route: '/app/settings/members',
      category: 'members',
      action: 'retry',
    })
    setIsLoading(true)
    void loadMembers()
  }

  const inviteableRoles = membersState?.inviteableRoles ?? []
  const assignableRoles = membersState?.assignableRoles ?? []
  const manageableRoles = membersState?.manageableRoles ?? []
  const canManageMemberRole = (memberRole: string) =>
    isMemberAssignableRole(memberRole) && manageableRoles.includes(memberRole)
  const canInviteMembers = (membersState?.canManageMembers ?? false) && inviteableRoles.length > 0

  /**
   * Initialise the invite role from the server response rather than a
   * client-side default, avoiding the blank-organisation race.
   * A ref gates first-init so subsequent renders don't override the user's
   * manual selection unless the role is no longer in the allowed list.
   */
  const roleInitialisedRef = useRef(false)
  useEffect(() => {
    if (!inviteableRoles.length) return
    // Default to the least-privileged role the actor can invite (and re-clamp to
    // it if the current selection drops out of the allowed set), so the invite
    // form never starts on the most-powerful role — matching the page's own
    // least-privilege guidance.
    const safeDefault = leastPrivilegedInviteRole(inviteableRoles) as MemberAssignableRole
    if (!roleInitialisedRef.current) {
      roleInitialisedRef.current = true
      setRole(safeDefault)
      return
    }
    if (!inviteableRoles.includes(role)) {
      setRole(safeDefault)
    }
  }, [inviteableRoles, role])

  // last-admin guard: count current org_admin members
  const adminMemberCount =
    membersState?.organization?.members?.filter(
      (m: OrganizationMember) => m.role === ADMIN_ROLE,
    ).length ?? 0
  const isLastAdmin = adminMemberCount === 1

  // email validation derived state - delegate to the server-side zod schema
  // so client and server share a single source of truth for email format rules.
  const emailError =
    emailTouched && email.trim() && !InviteMemberInput.shape.email.safeParse(email.trim()).success
      ? 'Enter a valid email address.'
      : null
  const emailInvalid = emailError !== null
  const submitDisabled = isInviting || !email.trim() || emailInvalid

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    setEmailTouched(true)
    if (!InviteMemberInput.shape.email.safeParse(email.trim()).success) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'members.invite',
        reason: 'validation_failed',
        role,
      })
      return
    }
    setError(null)
    setNotice(null)
    setIsInviting(true)

    try {
      await inviteOrganizationMemberFn({
        data: {
          email,
          role,
        },
      })
      setEmail('')
      setEmailTouched(false)
      setNotice('Invitation sent.')
      trackProductEvent('member_invited', {
        route: '/app/settings/members',
        role,
      })
      await loadMembers()
    } catch (e) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'members.invite',
        error_type: 'client_error',
        role,
      })
      setError((e as Error).message)
    } finally {
      setIsInviting(false)
    }
  }

  const confirmCancelInvite = (invitationId: string, inviteEmail: string) => {
    setPendingAction({ type: 'cancel-invite', invitationId, email: inviteEmail })
  }

  const handleCancelInvite = async (invitationId: string) => {
    setError(null)
    setActionInFlight(invitationId)
    try {
      await cancelInvitationFn({ data: { invitationId } })
      setNotice('Invitation canceled.')
      trackProductEvent('invitation_cancelled', {
        route: '/app/settings/members',
      })
      await loadMembers()
    } catch (e) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'invitations.cancel',
        error_type: 'client_error',
      })
      setError((e as Error).message)
    } finally {
      setActionInFlight(null)
    }
  }

  const handleResendInvite = async (invitationId: string) => {
    setError(null)
    setActionInFlight(invitationId)
    try {
      await resendInvitationFn({ data: { invitationId } })
      setNotice('Invitation resent.')
      trackProductEvent('invitation_resent', {
        route: '/app/settings/members',
      })
      await loadMembers()
    } catch (e) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'invitations.resend',
        error_type: 'client_error',
      })
      setError((e as Error).message)
    } finally {
      setActionInFlight(null)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setError(null)
    setActionInFlight(memberId)
    try {
      await updateMemberRoleFn({
        data: {
          memberId,
          role: newRole as MemberAssignableRole,
        },
      })
      setNotice('Role updated.')
      trackProductEvent('member_role_changed', {
        route: '/app/settings/members',
        target_role: newRole,
      })
      await loadMembers()
    } catch (e) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'members.role_change',
        error_type: 'client_error',
        target_role: newRole,
      })
      setError((e as Error).message)
    } finally {
      setActionInFlight(null)
    }
  }

  const confirmRemoveMember = (memberId: string, memberName: string) => {
    setPendingAction({ type: 'remove-member', memberId, memberName })
    trackProductEvent('member_remove_dialog_opened', {
      route: '/app/settings/members',
      action: 'remove_member',
    })
  }

  const handleRemoveMember = async (memberId: string) => {
    setError(null)
    setActionInFlight(memberId)
    try {
      await removeMemberFn({ data: { memberId } })
      setNotice('Member removed.')
      trackProductEvent('member_removed', {
        route: '/app/settings/members',
      })
      await loadMembers()
    } catch (e) {
      trackProductEvent('member_action_failed', {
        route: '/app/settings/members',
        operation: 'members.remove',
        error_type: 'client_error',
      })
      setError((e as Error).message)
    } finally {
      setActionInFlight(null)
    }
  }

  /** Intercepts role-change selects; opens confirm dialog for admin downgrades. */
  const handleRoleSelectChange = (member: OrganizationMember, newRoleRaw: string) => {
    if (newRoleRaw === member.role) return // no-op: same role selected
    const newRole = newRoleRaw as MemberAssignableRole
    const isDowngrade = member.role === ADMIN_ROLE && LOWER_THAN_ADMIN_ROLES.includes(newRole)
    if (isDowngrade) {
      const displayName = member.user.name || member.user.email
      trackProductEvent('member_role_change_dialog_opened', {
        route: '/app/settings/members',
        previous_role: member.role,
        target_role: newRole,
      })
      setPendingRoleChange({
        memberId: member.id,
        memberName: displayName,
        currentRole: member.role,
        newRole,
      })
      return
    }
    void handleRoleChange(member.id, newRole)
  }

  const canManageMembers = membersState?.canManageMembers ?? false
  // Section header counts are total-on-page; no server-side pagination yet.
  const activeMemberCount = membersState?.organization?.members?.length ?? 0
  const pendingInvitationCount =
    membersState?.invitations?.filter((invitation) => invitation.status === 'pending').length ?? 0
  const pendingActionId =
    pendingAction?.type === 'cancel-invite' ? pendingAction.invitationId : pendingAction?.memberId

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Panel>
          <PageHeader
            className="mb-5"
            title="Members"
            description={`Manage who can access ${membersState?.organization?.name ?? 'this workspace'}.`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Counts are total-on-page; no server-side pagination is available yet. */}
            <SummaryMetric
              label="Active members"
              value={activeMemberCount}
              detail="Current workspace access"
              tone="brand"
            />
            <SummaryMetric
              label="Pending invites"
              value={pendingInvitationCount}
              detail="Awaiting acceptance"
            />
            <SummaryMetric
              label="Management"
              value={canManageMembers ? 'Enabled' : 'Read only'}
              detail="Based on your role"
              tone={canManageMembers ? 'success' : 'neutral'}
            />
          </div>

          <ContextualHelpPanel
            className="mt-5"
            title="Invite people carefully"
            description="Start most teammates as Location staff. Use Org admin only for people who should help manage members, billing, and clinic-wide settings."
            topicId="invite-members"
          />

          {canInviteMembers ? (
            <form
              onSubmit={handleInvite}
              className="mt-6 flex flex-col gap-3 md:flex-row md:items-end"
            >
              <div className="flex-1">
                <label htmlFor="member-email" className="sr-only">
                  Teammate email address
                </label>
                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="teammate@clinic.com"
                  aria-invalid={emailInvalid || undefined}
                  aria-describedby={emailInvalid ? 'member-email-error' : undefined}
                  className="w-full rounded-md border border-border-strong px-3 py-2 text-sm aria-[invalid=true]:border-danger-400"
                />
                {emailError && (
                  <p id="member-email-error" role="alert" className="mt-1 text-xs text-danger-600">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="md:w-56">
                <InlineHelpLabel
                  htmlFor="member-role"
                  label="Role"
                  help="Start with the least powerful role. Use Org admin only for people who should manage members, billing, and clinic-wide settings."
                />
                <select
                  id="member-role"
                  value={role}
                  aria-label="Role"
                  onChange={(event) => setRole(event.target.value as MemberAssignableRole)}
                  className="mt-1.5 w-full rounded-md border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-secondary"
                >
                  {inviteableRoles.map((inviteRole) => (
                    <option key={inviteRole} value={inviteRole}>
                      {ROLE_LABELS[inviteRole] ?? inviteRole}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={submitDisabled}>
                {isInviting ? 'Sending invitation...' : 'Send invitation'}
              </Button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-text-muted">
              Only managers and administrators can invite members or manage pending invitations.
            </p>
          )}

          {error && !isLoading && (
            <Alert tone="danger" className="mt-3" role="alert">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={handleMembersRetry}
                  className="font-medium underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            </Alert>
          )}

          {notice && (
            <Alert tone="success" className="mt-3">
              {notice}
            </Alert>
          )}
        </Panel>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel>
            {/* Count is total-on-page; no server-side pagination yet. */}
            <PanelHeader title={`Active members (${activeMemberCount})`} />
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : error && !membersState ? (
                <StatusPanel
                  variant="error"
                  title="Could not load members"
                  description="There was a problem retrieving clinic members. Check your connection and try again."
                  action={{ label: 'Try again', onClick: handleMembersRetry }}
                />
              ) : membersState?.organization?.members?.length === 0 ? (
                <StatusPanel
                  variant="empty"
                  title="No active members yet"
                  description="Invite your first clinic staff member using the form above. Each person will receive an email invitation to join this PHIGuard workspace."
                />
              ) : (
                membersState?.organization?.members?.map((member: OrganizationMember) => {
                  const isOwner = member.role === 'org_owner'
                  const displayName = member.user.name || member.user.email
                  const canManageThisMember = member.canManage === true
                  const isLastOrgAdmin = isLastAdmin && member.role === ADMIN_ROLE
                  return (
                    <MemberRow
                      key={member.id}
                      member={member}
                      displayName={displayName}
                      isOwner={isOwner}
                      canManage={canManageThisMember}
                      isLastOrgAdmin={isLastOrgAdmin}
                      canManageMembers={canManageMembers}
                      assignableRoles={assignableRoles}
                      actionInFlight={actionInFlight}
                      handleRoleSelectChange={handleRoleSelectChange}
                      confirmRemoveMember={confirmRemoveMember}
                    />
                  )
                })
              )}
            </div>
          </Panel>

          <Panel>
            {/* Count is total-on-page; no server-side pagination yet. */}
            <PanelHeader title={`Pending invitations (${pendingInvitationCount})`} />
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : membersState?.invitations?.length ? (
                membersState.invitations.map((invitation: OrganizationInvitation) => {
                  const canManageThisInvitation = canManageMemberRole(invitation.role)
                  return (
                    <InvitationRow
                      key={invitation.id}
                      invitation={invitation}
                      canManageMembers={canManageMembers}
                      canManageThisInvitation={canManageThisInvitation}
                      actionInFlight={actionInFlight}
                      handleResendInvite={handleResendInvite}
                      confirmCancelInvite={confirmCancelInvite}
                    />
                  )
                })
              ) : (
                <p className="text-sm text-text-muted">No pending invitations.</p>
              )}
            </div>
          </Panel>
        </section>

        {/* Cancel-invite / Remove-member confirmation */}
        <ConfirmActionDialog
          isOpen={pendingAction !== null}
          title={
            pendingAction?.type === 'cancel-invite'
              ? 'Cancel this invitation?'
              : 'Remove this member?'
          }
          description={
            pendingAction?.type === 'cancel-invite'
              ? `This stops ${pendingAction.email} from using this invitation link. You can send a new invitation later.`
              : pendingAction?.type === 'remove-member'
                ? `${pendingAction.memberName} will lose access to this PHIGuard workspace. Existing audit history will stay on file.`
                : ''
          }
          confirmLabel={
            pendingAction?.type === 'cancel-invite' ? 'Cancel invitation' : 'Remove member'
          }
          cancelLabel={
            pendingAction?.type === 'cancel-invite' ? 'Keep invitation' : 'Keep it as is'
          }
          isWorking={pendingActionId ? actionInFlight === pendingActionId : false}
          onCancel={() => {
            if (pendingAction?.type === 'remove-member') {
              trackProductEvent('member_remove_cancelled', {
                route: '/app/settings/members',
                action: 'remove_member',
              })
            }
            setPendingAction(null)
          }}
          onConfirm={() => {
            if (!pendingAction) return
            if (pendingAction.type === 'cancel-invite') {
              void handleCancelInvite(pendingAction.invitationId).then(() =>
                setPendingAction(null),
              )
              return
            }
            void handleRemoveMember(pendingAction.memberId).then(() => setPendingAction(null))
          }}
        />

        {/* Role-downgrade confirmation (admin → lower role) */}
        <AlertDialog
          open={pendingRoleChange !== null}
          onOpenChange={(open) => {
            if (!open) setPendingRoleChange(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Downgrade this admin?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingRoleChange
                  ? `${pendingRoleChange.memberName} will lose admin-level access and be changed to ${ROLE_LABELS[pendingRoleChange.newRole] ?? pendingRoleChange.newRole}. This cannot be undone without manually reassigning the role.`
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  if (pendingRoleChange) {
                    trackProductEvent('member_role_change_cancelled', {
                      route: '/app/settings/members',
                      previous_role: pendingRoleChange.currentRole,
                      target_role: pendingRoleChange.newRole,
                    })
                  }
                  setPendingRoleChange(null)
                }}
              >
                Keep as admin
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!pendingRoleChange) return
                  void handleRoleChange(
                    pendingRoleChange.memberId,
                    pendingRoleChange.newRole,
                  ).then(() => setPendingRoleChange(null))
                }}
              >
                Confirm downgrade
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
