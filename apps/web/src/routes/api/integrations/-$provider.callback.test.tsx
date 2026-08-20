import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  baaGetLegalStatusMock,
  getSessionFnMock,
  mockOnConflictDoUpdate,
  mockInsert,
  makeDb,
  createProductAnalyticsMock,
  captureMock,
} = vi.hoisted(() => {
  const baaGetLegalStatusMock = vi.fn()
  const getSessionFnMock = vi.fn()
  const mockReturning = vi.fn().mockResolvedValue([{ id: 'connection-123' }])
  const mockOnConflictDoUpdate = vi.fn().mockReturnValue({ returning: mockReturning })
  const mockValues = vi.fn().mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
  const makeDb = (organization = { plan: 'clinic', planStatus: 'active' }) => ({
    insert: mockInsert,
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            plan: organization.plan,
            planStatus: organization.planStatus,
            trialStartedAt: null,
            trialEndsAt: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          }]),
        }),
      }),
    }),
  })
  return {
    baaGetLegalStatusMock,
    getSessionFnMock,
    mockOnConflictDoUpdate,
    mockInsert,
    makeDb,
    createProductAnalyticsMock: vi.fn(),
    captureMock: vi.fn(),
  }
})

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: vi.fn(() => vi.fn(() => ({}))),
}))
vi.mock('@phiguard/db/server', () => ({
  getDb: vi.fn(),
  organizations: {
    id: 'organizationId',
    plan: 'plan',
    planStatus: 'planStatus',
    trialStartedAt: 'trialStartedAt',
    trialEndsAt: 'trialEndsAt',
    stripeCustomerId: 'stripeCustomerId',
    stripeSubscriptionId: 'stripeSubscriptionId',
  },
  integrationConnections: {
    organizationId: 'organizationId',
    provider: 'provider',
    status: 'status',
    installStartedAt: 'installStartedAt',
    updatedAt: 'updatedAt',
    id: 'id',
  },
}))
vi.mock('@phiguard/audit', () => ({ writeAuditEvent: vi.fn() }))
vi.mock('@phiguard/auth', () => ({
  isAdmin: vi.fn(() => true),
  resolveOrganizationAccess: vi.fn(),
}))
vi.mock('@phiguard/baa', () => ({
  BaaService: vi.fn(() => ({
    getLegalStatus: baaGetLegalStatusMock,
  })),
}))
vi.mock('@phiguard/integration/oauth', () => ({
  exchangeCode: vi.fn(),
}))
vi.mock('@phiguard/integration/token-crypto', () => ({
  encryptToken: vi.fn(),
}))
vi.mock('../../../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))
vi.mock('../../../lib/product-analytics.js', () => ({
  createProductAnalytics: createProductAnalyticsMock,
  captureServerProductAnalyticsEvent: (input: {
    userId: string
    organizationId: string
    eventName: string
    properties?: Record<string, unknown>
  }) => {
    createProductAnalyticsMock({
      distinctId: input.userId,
      organization: { id: input.organizationId },
    })
    void captureMock(input.eventName, input.properties)
  },
}))
vi.mock('../../../server/integrations.js', () => ({
  verifyState: vi.fn(),
}))
vi.mock('drizzle-orm', () => ({
  and: vi.fn(),
  eq: vi.fn(),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    sql: strings.reduce(
      (acc, segment, index) =>
        `${acc}${segment}${index < values.length ? String(values[index]) : ''}`,
      '',
    ),
  })),
}))

import { handleIntegrationCallback } from './$provider.callback.js'
import { getDb } from '@phiguard/db/server'
import { exchangeCode } from '@phiguard/integration/oauth'
import { encryptToken } from '@phiguard/integration/token-crypto'
import { resolveOrganizationAccess } from '@phiguard/auth'
import { verifyState } from '../../../server/integrations.js'
import { writeAuditEvent } from '@phiguard/audit'

describe('handleIntegrationCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.INTEGRATION_TOKEN_KEY_ID = 'integration-key-id-123'
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-123' },
      session: { activeOrganizationId: 'tenant-123' },
    })
    baaGetLegalStatusMock.mockResolvedValue({
      terms: { acceptedAt: new Date('2026-05-01T00:00:00.000Z'), isCurrent: true },
      baa: { acceptedAt: new Date('2026-05-01T00:00:00.000Z'), isCurrent: true },
    })
    captureMock.mockResolvedValue(undefined)
    createProductAnalyticsMock.mockReturnValue({
      capture: captureMock,
      identifyOrganization: vi.fn(),
    })
    vi.mocked(verifyState).mockReturnValue({
      tenantId: 'tenant-123',
      userId: 'user-123',
      codeVerifier: 'code-verifier',
      provider: 'google',
      startedAt: Date.parse('2026-05-01T11:59:00.000Z'),
    })
    vi.mocked(resolveOrganizationAccess).mockResolvedValue({
      status: 'ready',
      scope: { role: 'org_admin' },
    } as never)
  })

  it('upserts the active org/provider connection instead of creating duplicates', async () => {
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockResolvedValue({
      ciphertext: 'ciphertext',
      encryptedDataKey: 'key',
      iv: 'iv',
    } as never)
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=connected')
    expect(createProductAnalyticsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: 'user-123',
        organization: { id: 'tenant-123' },
      }),
    )
    expect(captureMock).toHaveBeenCalledWith('integration_callback_completed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'connected',
    })
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        target: ['organizationId', 'provider'],
        set: expect.objectContaining({
          accountEmail: 'admin@example.com',
          status: 'active',
          installStartedAt: new Date('2026-05-01T11:59:00.000Z'),
          installedByUserId: 'user-123',
        }),
      }),
    )
  })

  it('accepts callbacks for the signed tenant when the current session active organization is stale', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-123' },
      session: { activeOrganizationId: 'tenant-stale' },
    })
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockResolvedValue({
      ciphertext: 'ciphertext',
      encryptedDataKey: 'key',
      iv: 'iv',
    } as never)
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=connected')
    expect(captureMock).toHaveBeenCalledWith('integration_callback_completed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'connected',
    })
    expect(resolveOrganizationAccess).toHaveBeenCalledWith(expect.anything(), {
      activeOrganizationId: 'tenant-123',
      userId: 'user-123',
    })
    expect(mockInsert).toHaveBeenCalled()
  })

  it('does not wait for slow analytics before redirecting successful callbacks', async () => {
    captureMock.mockReturnValue(new Promise(() => undefined))
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockResolvedValue({
      ciphertext: 'ciphertext',
      encryptedDataKey: 'key',
      iv: 'iv',
    } as never)
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=connected')
    expect(captureMock).toHaveBeenCalledWith('integration_callback_completed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'connected',
    })
  })

  it('rejects Essentials organizations before token exchange', async () => {
    vi.mocked(getDb).mockReturnValue(makeDb({ plan: 'essentials', planStatus: 'active' }) as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=error&reason=plan_required')
    expect(exchangeCode).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it.each(['trial_pending', 'canceled'] as const)(
    'rejects %s organizations before token exchange',
    async (planStatus) => {
      vi.mocked(getDb).mockReturnValue(makeDb({ plan: 'clinic', planStatus }) as never)

      const response = await handleIntegrationCallback(
        new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
        'google',
      )

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('/app/settings/integrations?status=error&reason=plan_required')
      expect(exchangeCode).not.toHaveBeenCalled()
      expect(mockInsert).not.toHaveBeenCalled()
    },
  )

  it('rejects callbacks whose active session does not match the signed OAuth state', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'victim-user' },
      session: { activeOrganizationId: 'victim-tenant' },
    })
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=victim-code&state=attacker-state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=error&reason=access_denied')
    expect(resolveOrganizationAccess).not.toHaveBeenCalled()
    expect(exchangeCode).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
    expect(captureMock).toHaveBeenCalledWith('integration_callback_failed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'failed',
      reason: 'access_denied',
    })
  })

  it('rejects callbacks before token exchange when token encryption is not configured', async () => {
    delete process.env.INTEGRATION_TOKEN_KEY_ID
    delete process.env.INTEGRATION_KMS_KEY_ID

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      '/app/settings/integrations?status=error&reason=encryption_not_configured',
    )
    expect(getDb).not.toHaveBeenCalled()
    expect(resolveOrganizationAccess).not.toHaveBeenCalled()
    expect(exchangeCode).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('rejects callbacks when legal acceptance is no longer current before token exchange', async () => {
    baaGetLegalStatusMock.mockResolvedValue({
      terms: { acceptedAt: new Date('2026-05-01T00:00:00.000Z'), isCurrent: false },
      baa: { acceptedAt: new Date('2026-05-01T00:00:00.000Z'), isCurrent: true },
    })
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=error&reason=plan_required')
    expect(exchangeCode).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('rejects callbacks without writing a connection when token encryption fails', async () => {
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockRejectedValueOnce(new Error('kms unavailable'))
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      '/app/settings/integrations?status=error&reason=encryption_failed',
    )
    expect(exchangeCode).toHaveBeenCalledWith('google', 'auth-code', 'code-verifier')
    expect(mockInsert).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
    expect(captureMock).toHaveBeenCalledWith('integration_callback_failed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'failed',
      reason: 'encryption_failed',
    })
  })

  it('captures token exchange failures without account or token details', async () => {
    vi.mocked(exchangeCode).mockRejectedValueOnce(new Error('oauth provider unavailable'))
    vi.mocked(getDb).mockReturnValue(makeDb() as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      '/app/settings/integrations?status=error&reason=token_exchange',
    )
    expect(captureMock).toHaveBeenCalledWith('integration_callback_failed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'failed',
      reason: 'token_exchange',
    })
    const [, properties] = captureMock.mock.calls[0]!
    expect(JSON.stringify(properties)).not.toContain('admin@example.com')
    expect(JSON.stringify(properties)).not.toContain('auth-code')
    expect(JSON.stringify(properties)).not.toContain('state-token')
  })

  it('rolls back the connection when the install audit event fails', async () => {
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockResolvedValue({
      ciphertext: 'ciphertext',
      encryptedDataKey: 'key',
      iv: 'iv',
    } as never)
    vi.mocked(writeAuditEvent).mockRejectedValueOnce(new Error('audit write failed'))

    let committed = false
    const txReturning = vi.fn().mockResolvedValue([{ id: 'connection-rollback' }])
    const txOnConflictDoUpdate = vi.fn().mockReturnValue({ returning: txReturning })
    const txValues = vi.fn().mockReturnValue({ onConflictDoUpdate: txOnConflictDoUpdate })
    const tx = {
      insert: vi.fn().mockReturnValue({ values: txValues }),
    }
    const db = {
      ...makeDb(),
      transaction: vi.fn(async (callback: (tx: typeof db) => Promise<void>) => {
        await callback(tx as never)
        committed = true
      }),
    }
    vi.mocked(getDb).mockReturnValue(db as never)

    await expect(
      handleIntegrationCallback(
        new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
        'google',
      ),
    ).rejects.toThrow('audit write failed')

    expect(db.transaction).toHaveBeenCalled()
    expect(tx.insert).toHaveBeenCalled()
    expect(committed).toBe(false)
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'integration.installed',
        resourceId: 'connection-rollback',
      }),
    )
  })

  it('rejects stale callbacks that lose the active connection update race', async () => {
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'older-access-token',
      refreshToken: 'older-refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockResolvedValue({
      ciphertext: 'ciphertext',
      encryptedDataKey: 'key',
      iv: 'iv',
    } as never)

    const txReturning = vi.fn().mockResolvedValue([])
    const txOnConflictDoUpdate = vi.fn().mockReturnValue({ returning: txReturning })
    const txValues = vi.fn().mockReturnValue({ onConflictDoUpdate: txOnConflictDoUpdate })
    const tx = {
      insert: vi.fn().mockReturnValue({ values: txValues }),
    }
    const db = {
      ...makeDb(),
      transaction: vi.fn(async (callback: (tx: typeof db) => Promise<void>) => {
        await callback(tx as never)
      }),
    }
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      '/app/settings/integrations?status=error&reason=stale_state',
    )
    expect(captureMock).toHaveBeenCalledWith('integration_callback_failed', {
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'failed',
      reason: 'stale_state',
    })
    expect(txOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        setWhere: expect.objectContaining({
          sql: expect.stringContaining('installStartedAt'),
        }),
      }),
    )
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('allows a newer callback after an older attempt completes first', async () => {
    vi.mocked(exchangeCode).mockResolvedValue({
      accessToken: 'newer-access-token',
      refreshToken: 'newer-refresh-token',
      expiresAt: new Date('2026-05-01T12:00:00Z'),
      scopes: ['openid', 'email'],
      accountEmail: 'admin@example.com',
    } as never)
    vi.mocked(encryptToken).mockResolvedValue({
      ciphertext: 'ciphertext',
      encryptedDataKey: 'key',
      iv: 'iv',
    } as never)
    vi.mocked(verifyState).mockReturnValue({
      tenantId: 'tenant-123',
      userId: 'user-123',
      codeVerifier: 'newer-code-verifier',
      provider: 'google',
      startedAt: Date.parse('2026-05-01T12:01:00.000Z'),
    })

    let conflictConfig: { setWhere?: { sql?: string }; set?: { installStartedAt?: Date } } = {}
    const txReturning = vi.fn().mockResolvedValue([{ id: 'connection-newer' }])
    const txOnConflictDoUpdate = vi.fn((config) => {
      conflictConfig = config
      return { returning: txReturning }
    })
    const txValues = vi.fn().mockReturnValue({ onConflictDoUpdate: txOnConflictDoUpdate })
    const tx = {
      insert: vi.fn().mockReturnValue({ values: txValues }),
    }
    const db = {
      ...makeDb(),
      transaction: vi.fn(async (callback: (tx: typeof db) => Promise<void>) => {
        await callback(tx as never)
      }),
    }
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handleIntegrationCallback(
      new Request('https://app.phiguard.test/api/integrations/google/callback?code=auth-code&state=state-token'),
      'google',
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/app/settings/integrations?status=connected')
    expect(conflictConfig.setWhere?.sql).toContain('installStartedAt')
    expect(conflictConfig.setWhere?.sql).toContain('updatedAt')
    expect(conflictConfig.set?.installStartedAt).toEqual(new Date('2026-05-01T12:01:00.000Z'))
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        resourceId: 'connection-newer',
      }),
    )
  })
})
