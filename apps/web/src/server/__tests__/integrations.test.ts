import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Integrations module smoke and access tests.
 *
 * requireSecret is now tested directly in packages/auth/src/__tests__/secrets.test.ts.
 * This file covers integrations-specific concerns only.
 */

const {
  assertCommercialProductAccessMock,
  buildAuthorizeUrlMock,
  canManageOrganizationMock,
  generatePkceMock,
  getDbMock,
  getSessionFnMock,
  integrationConnectionsTable,
  organizationsTable,
  recordFeatureUsageMock,
  requireFeatureForOrgMock,
  resolveActiveLocationAccessMock,
  runInAuditContextMock,
  writeAuditEventMock,
} = vi.hoisted(() => {
  const organizationsTable = {
    id: 'organizations.id',
    plan: 'organizations.plan',
    planStatus: 'organizations.planStatus',
    trialEndsAt: 'organizations.trialEndsAt',
  }
  const integrationConnectionsTable = {
    id: 'integrationConnections.id',
    provider: 'integrationConnections.provider',
    accountEmail: 'integrationConnections.accountEmail',
    status: 'integrationConnections.status',
    createdAt: 'integrationConnections.createdAt',
    locationId: 'integrationConnections.locationId',
    organizationId: 'integrationConnections.organizationId',
  }

  return {
    assertCommercialProductAccessMock: vi.fn(),
    buildAuthorizeUrlMock: vi.fn(),
    canManageOrganizationMock: vi.fn(),
    generatePkceMock: vi.fn(),
    getDbMock: vi.fn(),
    getSessionFnMock: vi.fn(),
    integrationConnectionsTable,
    organizationsTable,
    recordFeatureUsageMock: vi.fn(),
    requireFeatureForOrgMock: vi.fn(),
    resolveActiveLocationAccessMock: vi.fn(),
    runInAuditContextMock: vi.fn(),
    writeAuditEventMock: vi.fn(),
  }
})

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((handler: (input: { data?: unknown }) => unknown) => {
      return (input: { data?: unknown } = {}) => handler(input)
    }),
  })),
}))
vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  organizations: organizationsTable,
  integrationConnections: integrationConnectionsTable,
}))
vi.mock('@phiguard/audit', () => ({ writeAuditEvent: writeAuditEventMock }))
vi.mock('@phiguard/billing', () => ({
  recordFeatureUsage: recordFeatureUsageMock,
  requireFeatureForOrg: requireFeatureForOrgMock,
}))
vi.mock('@phiguard/integration/oauth', () => ({
  generatePkce: generatePkceMock,
  buildAuthorizeUrl: buildAuthorizeUrlMock,
  exchangeCode: vi.fn(),
}))
vi.mock('@phiguard/integration/token-crypto', () => ({ encryptToken: vi.fn() }))
vi.mock('../../lib/session.js', () => ({ getSessionFn: getSessionFnMock }))
vi.mock('../access.js', () => ({
  assertCommercialProductAccess: assertCommercialProductAccessMock,
  canManageOrganization: canManageOrganizationMock,
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}))
vi.mock('../../lib/audit.server.js', () => ({ runInAuditContext: runInAuditContextMock }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(), and: vi.fn() }))
vi.mock('@phiguard/auth', () => ({
  requireSecret: vi.fn((name: string) => {
    const v = process.env[name]
    if (!v || v.length < 16) {
      throw new Error(`Required env var ${name} is missing or too short (min 16 chars)`)
    }
    return v
  }),
}))

import {
  listConnectionsFn,
  requireSecret,
  revokeConnectionFn,
  signState,
  startIntegrationInstallFn,
  verifyState,
} from '../integrations.js'

const ORIGINAL_AUTH_SECRET = process.env.AUTH_SECRET
const ORIGINAL_BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET

beforeEach(() => {
  delete process.env.AUTH_SECRET
  delete process.env.BETTER_AUTH_SECRET
  vi.clearAllMocks()
  getSessionFnMock.mockResolvedValue(makeSession('org-1'))
  getDbMock.mockReturnValue(makeIntegrationsDb())
  assertCommercialProductAccessMock.mockImplementation(() => undefined)
  canManageOrganizationMock.mockReturnValue(true)
  resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
  requireFeatureForOrgMock.mockImplementation(() => undefined)
  recordFeatureUsageMock.mockResolvedValue(undefined)
  generatePkceMock.mockReturnValue({ codeVerifier: 'verifier', codeChallenge: 'challenge' })
  buildAuthorizeUrlMock.mockReturnValue('https://oauth.example/authorize')
  runInAuditContextMock.mockImplementation(async (_userId: string, fn: () => Promise<unknown>) =>
    fn(),
  )
})

afterEach(() => {
  if (typeof ORIGINAL_AUTH_SECRET === 'string') {
    process.env.AUTH_SECRET = ORIGINAL_AUTH_SECRET
  } else {
    delete process.env.AUTH_SECRET
  }

  if (typeof ORIGINAL_BETTER_AUTH_SECRET === 'string') {
    process.env.BETTER_AUTH_SECRET = ORIGINAL_BETTER_AUTH_SECRET
  } else {
    delete process.env.BETTER_AUTH_SECRET
  }
})

describe('integrations re-exports requireSecret from @phiguard/auth', () => {
  it('requireSecret is exported from the integrations module', () => {
    expect(typeof requireSecret).toBe('function')
  })
})

describe('integration state signing', () => {
  it('signs and verifies state with BETTER_AUTH_SECRET by default', () => {
    process.env.BETTER_AUTH_SECRET = 'better-auth-secret-for-integrations'

    const payload = {
      tenantId: 'tenant-123',
      userId: 'user-123',
      provider: 'google',
      codeVerifier: 'pkce-verifier',
      expiresAt: Date.now() + 60_000,
    }

    const token = signState(payload)
    const decodedSegments = token
      .split('.')
      .map((segment) => Buffer.from(segment, 'base64url').toString('utf8'))
      .join('\n')

    expect(verifyState(token)).toMatchObject(payload)
    expect(decodedSegments).not.toContain('tenant-123')
    expect(decodedSegments).not.toContain('user-123')
    expect(decodedSegments).not.toContain('pkce-verifier')
  })

  it('falls back to AUTH_SECRET when BETTER_AUTH_SECRET is unavailable', () => {
    process.env.AUTH_SECRET = 'legacy-auth-secret-for-integrations'

    const payload = {
      tenantId: 'tenant-456',
      userId: 'user-456',
      provider: 'microsoft',
      codeVerifier: 'pkce-verifier',
      expiresAt: Date.now() + 60_000,
    }

    const token = signState(payload)

    expect(verifyState(token)).toMatchObject(payload)
  })

  it('throws when neither BETTER_AUTH_SECRET nor AUTH_SECRET is usable', () => {
    expect(() => signState({ tenantId: 'tenant-789' })).toThrow(
      'Required env var BETTER_AUTH_SECRET or AUTH_SECRET is missing or too short (min 16 chars)',
    )
  })

  it('rejects expired state tokens', () => {
    process.env.BETTER_AUTH_SECRET = 'better-auth-secret-for-integrations'

    const token = signState({
      tenantId: 'tenant-expired',
      userId: 'user-expired',
      provider: 'google',
      codeVerifier: 'pkce-verifier',
      expiresAt: Date.now() - 1,
    })

    expect(() => verifyState(token)).toThrow('State token expired')
  })

  it('rejects state tokens with extra segments', () => {
    process.env.BETTER_AUTH_SECRET = 'better-auth-secret-for-integrations'

    const token = signState({
      tenantId: 'tenant-extra-segment',
      userId: 'user-extra-segment',
      provider: 'google',
      codeVerifier: 'pkce-verifier',
      expiresAt: Date.now() + 60_000,
    })

    expect(() => verifyState(`${token}.extra`)).toThrow('Invalid state token format')
  })
})

describe('integration connection access', () => {
  it('allows non-admin organization members to list active connections as read-only', async () => {
    const db = makeIntegrationsDb()
    getDbMock.mockReturnValue(db)
    canManageOrganizationMock.mockReturnValue(false)
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('auditor'))

    const result = await listConnectionsFn()

    expect(result).toEqual([
      expect.objectContaining({
        id: 'connection-1',
        provider: 'google',
        accountEmail: 'workspace@example.com',
        status: 'active',
      }),
    ])
    expect(assertCommercialProductAccessMock).toHaveBeenCalled()
    expect(requireFeatureForOrgMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'clinic',
        planStatus: 'trialing',
      }),
      'integrations_basic',
    )
    expect(db.update).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('keeps integration install and revoke admin-only', async () => {
    canManageOrganizationMock.mockReturnValue(false)
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('auditor'))

    await expect(
      startIntegrationInstallFn({
        data: { provider: 'google', acknowledgedCalendarCompliance: true },
      }),
    ).rejects.toThrow('Only organization administrators can manage integrations')
    await expect(
      revokeConnectionFn({
        data: { connectionId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Only organization administrators can manage integrations')
  })

  it('requires explicit calendar compliance acknowledgment before starting OAuth', async () => {
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret'

    await expect(startIntegrationInstallFn({ data: { provider: 'google' } })).rejects.toThrow(
      'Calendar compliance acknowledgment is required',
    )

    expect(buildAuthorizeUrlMock).not.toHaveBeenCalled()
  })

  it('starts OAuth after calendar compliance acknowledgment', async () => {
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret'

    const result = await startIntegrationInstallFn({
      data: { provider: 'google', acknowledgedCalendarCompliance: true },
    })

    expect(result).toEqual({ authorizeUrl: 'https://oauth.example/authorize' })
    expect(buildAuthorizeUrlMock).toHaveBeenCalledWith('google', expect.any(String), 'challenge')
    const state = buildAuthorizeUrlMock.mock.calls[0]?.[1] as string
    const payload = verifyState(state)
    expect(payload).toMatchObject({
      tenantId: 'org-1',
      userId: 'user-1',
      provider: 'google',
      codeVerifier: 'verifier',
    })
    expect(typeof payload.startedAt).toBe('number')
    expect(payload.startedAt).toBeLessThanOrEqual(payload.expiresAt as number)
  })

  it('starts OAuth for the resolved organization when the session active organization is stale', async () => {
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret'
    getSessionFnMock.mockResolvedValue(makeSession('org-stale'))
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))

    await startIntegrationInstallFn({
      data: { provider: 'google', acknowledgedCalendarCompliance: true },
    })

    const state = buildAuthorizeUrlMock.mock.calls[0]?.[1] as string
    expect(verifyState(state)).toMatchObject({
      tenantId: 'org-1',
      userId: 'user-1',
      provider: 'google',
    })
  })

  it('scrubs stored OAuth tokens when an integration is revoked', async () => {
    const db = makeIntegrationsDb()
    getDbMock.mockReturnValue(db)

    await revokeConnectionFn({
      data: { connectionId: '11111111-1111-4111-8111-111111111111' },
    })

    expect(db._mocks.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'revoked',
        accessTokenCiphertext: '',
        refreshTokenCiphertext: '',
        scopes: [],
        expiresAt: null,
      }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        action: 'integration.revoked',
        after: expect.objectContaining({
          status: 'revoked',
          tokensDeleted: true,
        }),
      }),
    )
  })

  it('rejects revoke requests for connections that are not active for the organization', async () => {
    const db = makeIntegrationsDb({ connectionRows: [] })
    getDbMock.mockReturnValue(db)

    await expect(
      revokeConnectionFn({
        data: { connectionId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Integration connection not found')

    expect(db.transaction).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rolls back token scrubbing when the guarded revoke update loses the race', async () => {
    const db = makeIntegrationsDb({ updateRows: [] })
    getDbMock.mockReturnValue(db)

    await expect(
      revokeConnectionFn({
        data: { connectionId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Integration connection could not be revoked')

    expect(db.transaction).toHaveBeenCalled()
    expect(db._mocks.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'revoked',
        accessTokenCiphertext: '',
        refreshTokenCiphertext: '',
      }),
    )
    expect(db.committed).toBe(false)
    expect(db.rolledBack).toBe(true)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rolls back token scrubbing when the revoke audit event fails', async () => {
    const auditError = new Error('audit insert failed')
    writeAuditEventMock.mockRejectedValueOnce(auditError)
    const db = makeIntegrationsDb()
    getDbMock.mockReturnValue(db)

    await expect(
      revokeConnectionFn({
        data: { connectionId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow(auditError)

    expect(db.transaction).toHaveBeenCalled()
    expect(db._mocks.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'revoked',
        accessTokenCiphertext: '',
        refreshTokenCiphertext: '',
      }),
    )
    expect(db.committed).toBe(false)
    expect(db.rolledBack).toBe(true)
  })
})

function makeSession(activeOrganizationId: string | null) {
  return {
    user: { id: 'user-1', email: 'user@example.com' },
    session: { activeOrganizationId },
  }
}

function makeAccess(role: 'org_admin' | 'auditor') {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    role,
    commercial: {
      plan: 'clinic',
      planStatus: 'trialing',
      trialEndsAt: null,
    },
  }
}

function makeIntegrationsDb(options?: { connectionRows?: unknown[]; updateRows?: unknown[] }) {
  const orgRows = [
    {
      plan: 'clinic',
      planStatus: 'trialing',
      trialEndsAt: null,
    },
  ]
  const connectionRows = options?.connectionRows ?? [
    {
      id: 'connection-1',
      provider: 'google',
      accountEmail: 'workspace@example.com',
      status: 'active',
      createdAt: new Date('2026-05-01T12:00:00.000Z'),
      locationId: null,
    },
  ]

  const select = vi.fn(() => ({
    from: vi.fn((table: unknown) => ({
      where: vi.fn(() => {
        const rows = table === organizationsTable ? orgRows : connectionRows
        return {
          limit: vi.fn().mockResolvedValue(rows),
          then: (resolve: (value: unknown[]) => unknown, reject: (reason?: unknown) => unknown) =>
            Promise.resolve(rows).then(resolve, reject),
        }
      }),
    })),
  }))
  const updateReturning = vi.fn().mockResolvedValue(options?.updateRows ?? [{ id: 'connection-1' }])
  const updateWhere = vi.fn().mockReturnValue({
    returning: updateReturning,
  })
  const updateSet = vi.fn().mockReturnValue({
    where: updateWhere,
  })
  const update = vi.fn().mockReturnValue({
    set: updateSet,
  })
  const tx = {
    update,
  }
  const db = {
    committed: false,
    rolledBack: false,
    select,
    update,
    tx,
    transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => {
      try {
        const result = await callback(tx)
        db.committed = true
        return result
      } catch (error) {
        db.rolledBack = true
        throw error
      }
    }),
    _mocks: {
      updateSet,
      where: vi.fn().mockResolvedValue(undefined),
      updateWhere,
      updateReturning,
    },
  }

  return db
}
