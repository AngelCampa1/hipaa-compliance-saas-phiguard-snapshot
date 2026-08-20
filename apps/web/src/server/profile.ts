import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { writeAuditEvent } from '@phiguard/audit'
import { auth } from '@phiguard/auth'
import { toAppSession } from '../lib/session.js'
import { runInAuditContext } from '../lib/audit.server.js'

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const UpdateDisplayNameInput = z.object({
  name: z.string().trim().min(1, 'Display name is required').max(120),
})

export const UpdateEmailInput = z.object({
  newEmail: z.string().trim().email('Enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
})

export const UpdatePasswordInput = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be under 128 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const DeleteAccountInput = z.object({
  password: z.string().optional(),
  confirmation: z.literal('DELETE', {
    error: 'Type DELETE to confirm account deletion',
  }),
})

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function requireAuthenticatedUser() {
  const request = getRequest()
  const { resolveSessionFromHeaders } = await import('@phiguard/auth')
  const resolved = await resolveSessionFromHeaders(request.headers)
  const session = toAppSession(resolved)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  return { request, session }
}

async function loadProfileDb() {
  return import('@phiguard/db/server')
}

// ---------------------------------------------------------------------------
// updateDisplayNameFn
// ---------------------------------------------------------------------------

export const updateDisplayNameFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateDisplayNameInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session } = await requireAuthenticatedUser()

    return runInAuditContext(session.user.id, async () => {
      const { getDb } = await loadProfileDb()
      const db = getDb()

      await auth.api.updateUser({
        headers: request.headers,
        body: { name: data.name },
      })

      await db.transaction(async (tx) => {
        await writeAuditEvent(tx, {
          tenantId: session.session.activeOrganizationId ?? session.user.id,
          actorId: session.user.id,
          action: 'user.profile_updated',
          resourceType: 'organization_member',
          resourceId: session.user.id,
          after: { fieldsChanged: ['name'] },
        })
      })
    })
  })

// ---------------------------------------------------------------------------
// updateEmailFn
// ---------------------------------------------------------------------------

export const updateEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateEmailInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session } = await requireAuthenticatedUser()

    return runInAuditContext(session.user.id, async () => {
      const { getDb } = await loadProfileDb()
      const db = getDb()

      await auth.api.changeEmail({
        headers: request.headers,
        body: {
          newEmail: data.newEmail,
        },
      })

      await db.transaction(async (tx) => {
        await writeAuditEvent(tx, {
          tenantId: session.session.activeOrganizationId ?? session.user.id,
          actorId: session.user.id,
          action: 'user.profile_updated',
          resourceType: 'organization_member',
          resourceId: session.user.id,
          after: { fieldsChanged: ['email'] },
        })
      })
    })
  })

// ---------------------------------------------------------------------------
// updatePasswordFn
// ---------------------------------------------------------------------------

export const updatePasswordFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdatePasswordInput.parse(data))
  .handler(async ({ data }) => {
    const { request, session } = await requireAuthenticatedUser()

    return runInAuditContext(session.user.id, async () => {
      const { getDb } = await loadProfileDb()
      const db = getDb()

      await auth.api.changePassword({
        headers: request.headers,
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          revokeOtherSessions: false,
        },
      })

      await db.transaction(async (tx) => {
        await writeAuditEvent(tx, {
          tenantId: session.session.activeOrganizationId ?? session.user.id,
          actorId: session.user.id,
          action: 'user.profile_updated',
          resourceType: 'organization_member',
          resourceId: session.user.id,
          // Deliberately records only that the password field changed, never the value.
          after: { fieldsChanged: ['password'] },
        })
      })
    })
  })

// ---------------------------------------------------------------------------
// deleteAccountFn
// ---------------------------------------------------------------------------

export const deleteAccountFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => DeleteAccountInput.parse(data))
  .handler(async ({ data }) => {
    const { request } = await requireAuthenticatedUser()
    const password = data.password ?? ''

    await auth.api.deleteUser({
      headers: request.headers,
      body: password.length > 0 ? { password } : {},
    })
  })
