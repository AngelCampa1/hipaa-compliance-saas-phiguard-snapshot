// Human-readable labels for organization roles. Shared so every surface that
// renders a role (Members, Locations, etc.) speaks the same language instead of
// leaking raw enum values like `org_owner` into the UI.
export const ROLE_LABELS: Record<string, string> = {
  org_owner: 'Owner',
  org_admin: 'Org admin',
  auditor: 'Auditor',
  location_manager: 'Location manager',
  location_staff: 'Location staff',
}

/** Returns the friendly label for a role, falling back to the raw value. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role
}

/**
 * Invite-assignable roles ordered least → most privileged. `location_staff` is
 * the safest (single-location, no management); `org_admin` is the most powerful
 * (members, billing, clinic-wide settings).
 */
export const INVITE_ROLES_LEAST_TO_MOST_PRIVILEGED = [
  'location_staff',
  'location_manager',
  'auditor',
  'org_admin',
] as const

/**
 * Picks the least-privileged role from the set an actor is allowed to invite, so
 * the invite form defaults to the safest option instead of the most powerful one.
 * This matches the least-privilege guidance shown on the Members page ("Start
 * most teammates as Location staff"). Falls back to `location_staff`, then to the
 * first available role, when the set is empty or unrecognized.
 */
export function leastPrivilegedInviteRole(inviteable: readonly string[]): string {
  for (const role of INVITE_ROLES_LEAST_TO_MOST_PRIVILEGED) {
    if (inviteable.includes(role)) return role
  }
  return inviteable[0] ?? 'location_staff'
}
