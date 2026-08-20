import { createServerFn } from '@tanstack/react-start'
import type { Session, User } from '@phiguard/auth'

type RawSession = {
  session: Session
  user: User
}

export type AppSession = Omit<RawSession, 'session'> & {
  organization?: {
    plan?: string | null
    planStatus?: string | null
    trialEndsAt?: string | null
    role?: string | null
  }
  session: RawSession['session'] & {
    activeOrganizationId?: string | null
  }
}

export function toAppSession(
  session: RawSession | null,
): AppSession | null {
  return session as AppSession | null
}

export const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { resolveAppSessionFromRequest } = await import('./session.server')
  return resolveAppSessionFromRequest()
})
