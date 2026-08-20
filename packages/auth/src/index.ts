export { hashCredentialPassword, verifyCredentialPassword } from './password.js'
export {
  hasRole,
  isOwner,
  isAdmin,
  isStaff,
  canManageMembers,
  canManageOrganizationMembers,
  canInviteMemberRole,
  canAssignMemberRole,
  canManageMemberRole,
  canAccessSoc2,
} from './permissions.js'
export {
  listUserOrganizations,
  resolveOrganizationAccess,
  type ListUserOrganization,
  type OrganizationAccess,
} from './organizations.js'
export type { Role } from './permissions.js'
export type { Auth } from './auth.js'
export type { Session, User } from 'better-auth'
export { createSessionBootstrapCookie } from './session-bootstrap.js'
export { resolveSessionFromHeaders, type ResolvedServerSession } from './server-session.js'
export { requireSecret } from './lib/secrets.js'
import { resolveSessionFromHeaders } from './server-session.js'
import type { Auth } from './auth.js'

async function loadAuthModule() {
  return import('./auth.js')
}

const lazyApi = new Proxy({} as Auth['api'], {
  get(_target, property) {
    return async (...args: unknown[]) => {
      const { getAuth } = await loadAuthModule()
      const auth = getAuth()
      const value = Reflect.get(auth.api as object, property)

      if (typeof value !== 'function') {
        throw new Error(`auth.api.${String(property)} is not available`)
      }

      return Reflect.apply(value, auth.api, args)
    }
  },
})

export const auth: Pick<Auth, 'handler' | 'api'> = {
  handler(request) {
    return loadAuthModule().then(({ getAuth }) => getAuth().handler(request))
  },
  api: lazyApi,
}

/**
 * Get the current session from a Request object.
 * Thin wrapper around auth.api.getSession for use in server-side code.
 */
export async function getSession(request: Request) {
  return resolveSessionFromHeaders(request.headers)
}
