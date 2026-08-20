import { getRequest } from '@tanstack/react-start/server'
import { resolveOrganizationAccess, resolveSessionFromHeaders } from '@phiguard/auth'
import { eq } from 'drizzle-orm'
import { getDb, organizations } from '@phiguard/db/server'
import { toAppSession } from './session'

async function attachActiveOrganizationContext(
  session: NonNullable<ReturnType<typeof toAppSession>>,
  activeOrganizationId: string,
) {
  const db = getDb()
  const access = await resolveOrganizationAccess(db, {
    activeOrganizationId,
    userId: session.user.id,
  })

  if (access.status === 'switch-required') {
    return attachActiveOrganizationContext(session, access.activeOrganizationId)
  }

  if (access.status !== 'ready') {
    return {
      ...session,
      organization: {
        plan: null,
        planStatus: null,
        trialEndsAt: null,
        role: null,
      },
      session: {
        ...session.session,
        activeOrganizationId: null,
      },
    }
  }

  const [organization] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialEndsAt: organizations.trialEndsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, activeOrganizationId))
    .limit(1)

  return {
    ...session,
    organization: {
      plan: organization?.plan ?? null,
      planStatus: organization?.planStatus ?? null,
      trialEndsAt:
        organization?.trialEndsAt instanceof Date
          ? organization.trialEndsAt.toISOString()
          : organization?.trialEndsAt ?? null,
      role: access.scope.role,
    },
    session: {
      ...session.session,
      activeOrganizationId,
    },
  }
}

async function applyResponseCookies(setCookieHeaders: string[] | undefined) {
  if (!setCookieHeaders?.length) {
    return
  }

  const { setResponseHeader } = await import('@tanstack/react-start/server')
  setResponseHeader('set-cookie', setCookieHeaders)
}

export async function resolveAppSessionFromHeaders(headers: Headers) {
  const resolvedSession = await resolveSessionFromHeaders(headers)
  await applyResponseCookies(resolvedSession?.setCookieHeaders)

  const session = toAppSession(resolvedSession)
  if (!session?.session || !session.user) {
    return null
  }

  if (session.session.activeOrganizationId) {
    return attachActiveOrganizationContext(session, session.session.activeOrganizationId)
  }

  const access = await resolveOrganizationAccess(getDb(), {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  })

  if (access.status !== 'switch-required') {
    return session
  }

  return attachActiveOrganizationContext(session, access.activeOrganizationId)
}

export async function resolveAppSessionFromRequest() {
  const request = getRequest()
  return resolveAppSessionFromHeaders(request.headers)
}
