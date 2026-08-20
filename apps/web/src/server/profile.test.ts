import { beforeEach, describe, expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import type { AppSession } from '../lib/session.js'

const {
  getRequestMock,
  getDbMock,
  resolveSessionFromHeadersMock,
  updateUserMock,
  changeEmailMock,
  changePasswordMock,
  deleteUserMock,
  writeAuditEventMock,
  runInAuditContextMock,
} = vi.hoisted(() => ({
  getRequestMock: vi.fn(),
  getDbMock: vi.fn(),
  resolveSessionFromHeadersMock: vi.fn(),
  updateUserMock: vi.fn().mockResolvedValue(undefined),
  changeEmailMock: vi.fn().mockResolvedValue(undefined),
  changePasswordMock: vi.fn().mockResolvedValue(undefined),
  deleteUserMock: vi.fn().mockResolvedValue(undefined),
  writeAuditEventMock: vi.fn().mockResolvedValue(undefined),
  runInAuditContextMock: vi.fn(async (_actorId: string, fn: () => Promise<unknown>) => fn()),
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

vi.mock('@phiguard/auth', () => ({
  auth: {
    api: {
      updateUser: updateUserMock,
      changeEmail: changeEmailMock,
      changePassword: changePasswordMock,
      deleteUser: deleteUserMock,
    },
  },
  resolveSessionFromHeaders: resolveSessionFromHeadersMock,
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

vi.mock('../lib/audit.server.js', () => ({
  runInAuditContext: runInAuditContextMock,
}))

import {
  updateDisplayNameFn,
  updateEmailFn,
  updatePasswordFn,
  deleteAccountFn,
  UpdateDisplayNameInput,
  UpdateEmailInput,
  UpdatePasswordInput,
  DeleteAccountInput,
} from './profile.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSession(userId: string, orgId: string | null = 'org-1'): AppSession {
  return {
    user: {
      id: userId,
      email: faker.internet.email(),
      name: faker.person.fullName(),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: 'session-id',
      token: 'session-token',
      userId,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      activeOrganizationId: orgId,
    },
  } as AppSession
}

function makeDb() {
  const db: {
    transaction: ReturnType<typeof vi.fn>
  } = {
    transaction: vi.fn((cb: (tx: unknown) => Promise<unknown>) => cb(db)),
  }
  return db
}

function makeHeaders() {
  return new Headers({ 'x-forwarded-for': '127.0.0.1' })
}

// ---------------------------------------------------------------------------
// updateDisplayNameFn
// ---------------------------------------------------------------------------

describe('updateDisplayNameFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    runInAuditContextMock.mockImplementation(async (_actorId: string, fn: () => Promise<unknown>) => fn())
    writeAuditEventMock.mockResolvedValue(undefined)
    updateUserMock.mockResolvedValue(undefined)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1'))
    getRequestMock.mockReturnValue({ headers: makeHeaders() })
    getDbMock.mockReturnValue(makeDb())
  })

  it('throws when unauthenticated (no session)', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue(null)

    await expect(
      updateDisplayNameFn({ data: { name: 'Alice' } }),
    ).rejects.toThrow('Unauthorized')

    expect(updateUserMock).not.toHaveBeenCalled()
  })

  it('rejects an empty display name (schema)', () => {
    expect(() => UpdateDisplayNameInput.parse({ name: '' })).toThrow()
  })

  it('rejects a display name longer than 120 characters (schema)', () => {
    expect(() => UpdateDisplayNameInput.parse({ name: 'a'.repeat(121) })).toThrow()
  })

  it('calls auth.api.updateUser and writes audit event on happy path', async () => {
    const db = makeDb()
    getDbMock.mockReturnValue(db)

    await updateDisplayNameFn({ data: { name: 'Alice' } })

    expect(updateUserMock).toHaveBeenCalledOnce()
    expect(updateUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ body: { name: 'Alice' } }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledOnce()
  })

  it('wraps audit write in a transaction', async () => {
    const db = makeDb()
    getDbMock.mockReturnValue(db)

    await updateDisplayNameFn({ data: { name: 'Alice' } })

    expect(db.transaction).toHaveBeenCalledOnce()
  })

  it('audit payload records fieldsChanged: [name] and excludes PHI values', async () => {
    await updateDisplayNameFn({ data: { name: 'Alice' } })

    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'user.profile_updated',
        resourceType: 'organization_member',
        actorId: 'user-1',
        after: { fieldsChanged: ['name'] },
      }),
    )

    // Confirm the after payload is exactly the fieldsChanged marker with no PHI values.
    const auditPayload = writeAuditEventMock.mock.calls[0][1]
    expect(auditPayload.after).toEqual({ fieldsChanged: ['name'] })
  })
})

// ---------------------------------------------------------------------------
// updateEmailFn
// ---------------------------------------------------------------------------

describe('updateEmailFn', () => {
  const validInput = {
    newEmail: faker.internet.email(),
    currentPassword: faker.internet.password({ length: 12 }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    runInAuditContextMock.mockImplementation(async (_actorId: string, fn: () => Promise<unknown>) => fn())
    writeAuditEventMock.mockResolvedValue(undefined)
    changeEmailMock.mockResolvedValue(undefined)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1'))
    getRequestMock.mockReturnValue({ headers: makeHeaders() })
    getDbMock.mockReturnValue(makeDb())
  })

  it('throws when unauthenticated (no session)', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue(null)

    await expect(
      updateEmailFn({ data: validInput }),
    ).rejects.toThrow('Unauthorized')

    expect(changeEmailMock).not.toHaveBeenCalled()
  })

  it('rejects an invalid email format (schema)', () => {
    expect(() => UpdateEmailInput.parse({ ...validInput, newEmail: 'not-an-email' })).toThrow()
  })

  it('rejects missing currentPassword (schema)', () => {
    expect(() =>
      UpdateEmailInput.parse({ newEmail: faker.internet.email(), currentPassword: '' }),
    ).toThrow()
  })

  it('calls auth.api.changeEmail and writes audit event on happy path', async () => {
    await updateEmailFn({ data: validInput })

    expect(changeEmailMock).toHaveBeenCalledOnce()
    expect(changeEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ body: { newEmail: validInput.newEmail } }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledOnce()
  })

  it('audit payload records fieldsChanged: [email] and does NOT include the new email value', async () => {
    await updateEmailFn({ data: validInput })

    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'user.profile_updated',
        resourceType: 'organization_member',
        actorId: 'user-1',
        after: { fieldsChanged: ['email'] },
      }),
    )

    // The after payload must not embed the actual new email address.
    const auditPayload = writeAuditEventMock.mock.calls[0][1]
    expect(auditPayload.after).toEqual({ fieldsChanged: ['email'] })
    expect(JSON.stringify(auditPayload.after)).not.toContain(validInput.newEmail)
  })
})

// ---------------------------------------------------------------------------
// updatePasswordFn
// ---------------------------------------------------------------------------

describe('updatePasswordFn', () => {
  const validInput = {
    currentPassword: faker.internet.password({ length: 12 }),
    newPassword: faker.internet.password({ length: 12 }),
    confirmPassword: '',
  }
  // keep confirmPassword in sync after construction
  const syncedInput = { ...validInput, confirmPassword: validInput.newPassword }

  beforeEach(() => {
    vi.clearAllMocks()
    runInAuditContextMock.mockImplementation(async (_actorId: string, fn: () => Promise<unknown>) => fn())
    writeAuditEventMock.mockResolvedValue(undefined)
    changePasswordMock.mockResolvedValue(undefined)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1'))
    getRequestMock.mockReturnValue({ headers: makeHeaders() })
    getDbMock.mockReturnValue(makeDb())
  })

  it('throws when unauthenticated (no session)', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue(null)

    await expect(
      updatePasswordFn({ data: syncedInput }),
    ).rejects.toThrow('Unauthorized')

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  it('rejects a newPassword shorter than 8 characters (schema)', () => {
    expect(() =>
      UpdatePasswordInput.parse({ currentPassword: 'oldpass1', newPassword: 'short', confirmPassword: 'short' }),
    ).toThrow()
  })

  it('rejects when newPassword and confirmPassword do not match (schema)', () => {
    expect(() =>
      UpdatePasswordInput.parse({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'different9',
      }),
    ).toThrow()
  })

  it('calls auth.api.changePassword and writes audit event on happy path', async () => {
    await updatePasswordFn({ data: syncedInput })

    expect(changePasswordMock).toHaveBeenCalledOnce()
    expect(changePasswordMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          currentPassword: syncedInput.currentPassword,
          newPassword: syncedInput.newPassword,
          revokeOtherSessions: false,
        }),
      }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledOnce()
  })

  it('audit payload records fieldsChanged: [password] and does NOT include any password value', async () => {
    await updatePasswordFn({ data: syncedInput })

    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'user.profile_updated',
        resourceType: 'organization_member',
        actorId: 'user-1',
        after: { fieldsChanged: ['password'] },
      }),
    )

    // The after payload must be ONLY the fieldsChanged marker - no password values.
    const auditPayload = writeAuditEventMock.mock.calls[0][1]
    expect(auditPayload.after).toEqual({ fieldsChanged: ['password'] })
    const serialized = JSON.stringify(auditPayload.after)
    expect(serialized).not.toContain(syncedInput.currentPassword)
    expect(serialized).not.toContain(syncedInput.newPassword)
  })
})

// ---------------------------------------------------------------------------
// deleteAccountFn
// ---------------------------------------------------------------------------

describe('deleteAccountFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteUserMock.mockResolvedValue(undefined)
    resolveSessionFromHeadersMock.mockResolvedValue(makeSession('user-1'))
    getRequestMock.mockReturnValue({ headers: makeHeaders() })
  })

  it('throws when unauthenticated (no session)', async () => {
    resolveSessionFromHeadersMock.mockResolvedValue(null)

    await expect(
      deleteAccountFn({ data: { confirmation: 'DELETE' } }),
    ).rejects.toThrow('Unauthorized')

    expect(deleteUserMock).not.toHaveBeenCalled()
  })

  it('requires exact DELETE confirmation (schema)', () => {
    expect(() => DeleteAccountInput.parse({ confirmation: 'delete' })).toThrow()
  })

  it('passes the password verbatim to Better Auth deleteUser', async () => {
    await deleteAccountFn({
      data: {
        password: ' password with spaces ',
        confirmation: 'DELETE',
      },
    })

    expect(deleteUserMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { password: ' password with spaces ' },
    })
  })

  it('allows fresh-session deletion without a password', async () => {
    await deleteAccountFn({ data: { confirmation: 'DELETE' } })

    expect(deleteUserMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: {},
    })
  })
})
