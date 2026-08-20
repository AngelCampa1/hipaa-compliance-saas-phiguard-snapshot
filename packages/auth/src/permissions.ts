export type Role = 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor'

// Order: owner > admin > manager > staff
// auditor is a lateral read-only SOC 2 role - explicitly outside the management
// hierarchy. It must never be compared numerically against other roles.
const ROLE_HIERARCHY: Record<Exclude<Role, 'auditor'>, number> = {
  org_owner: 4,
  org_admin: 3,
  location_manager: 2,
  location_staff: 1,
}

/** Returns true if the role meets or exceeds the required role */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  // auditor is a lateral read-only role outside the management hierarchy.
  // It must be checked with exact equality, never via numeric rank.
  if (requiredRole === 'auditor') {
    return userRole === 'auditor'
  }
  if (userRole === 'auditor') {
    return false
  }
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/** Returns true if the user is an owner */
export function isOwner(role: Role): boolean {
  return role === 'org_owner'
}

/** Returns true if the user is an admin or higher */
export function isAdmin(role: Role): boolean {
  return hasRole(role, 'org_admin')
}

/** Returns true if the user is staff or higher (i.e., any valid member) */
export function isStaff(role: Role): boolean {
  return hasRole(role, 'location_staff')
}

/** Returns true if the user can manage members (add/remove/change roles) */
export function canManageMembers(role: Role): boolean {
  return hasRole(role, 'location_manager')
}

/** Returns true if the user is an organization-wide administrator. */
export function canManageOrganizationMembers(role: Role): boolean {
  return role === 'org_owner' || role === 'org_admin'
}

/** Returns true if the acting role can invite the target role. */
export function canInviteMemberRole(actorRole: Role, targetRole: Role): boolean {
  if (canManageOrganizationMembers(actorRole)) {
    return targetRole !== 'org_owner'
  }

  return actorRole === 'location_manager' && targetRole === 'location_staff'
}

/** Returns true if the acting role can assign the target role to an existing member. */
export function canAssignMemberRole(actorRole: Role, targetRole: Role): boolean {
  if (canManageOrganizationMembers(actorRole)) {
    return targetRole !== 'org_owner'
  }

  return actorRole === 'location_manager' && targetRole === 'location_staff'
}

/** Returns true if the acting role can manage an existing member with the target role. */
export function canManageMemberRole(actorRole: Role, targetRole: Role): boolean {
  if (canManageOrganizationMembers(actorRole)) {
    return true
  }

  return actorRole === 'location_manager' && targetRole === 'location_staff'
}

/**
 * Returns true if the role is allowed to access SOC 2 pages.
 * Auditor, admin, and owner can access SOC 2. Staff and location_staff cannot.
 */
export function canAccessSoc2(role: Role): boolean {
  return role === 'auditor' || role === 'org_admin' || role === 'org_owner'
}
