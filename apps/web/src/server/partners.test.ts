import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { partnerMagicLinkTokens, partners, partnerUsers } from '@phiguard/db/server'
import { computePayouts } from '@phiguard/billing'
import type { AppSession } from '../lib/session.js'

const {
  getDbMock,
  getRequestMock,
  getSessionFnMock,
  writeAuditEventMock,
  sendPartnerMagicLinkEmailMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getRequestMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  writeAuditEventMock: vi.fn(async () => undefined),
  sendPartnerMagicLinkEmailMock: vi.fn(async () => undefined),
}))

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((fn) => fn),
  })),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getRequest: getRequestMock,
}))

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: writeAuditEventMock,
}))

vi.mock('@phiguard/email', () => ({
  sendPartnerMagicLinkEmail: sendPartnerMagicLinkEmailMock,
}))

vi.mock('@phiguard/billing', () => ({
  computePayouts: vi.fn(),
  MIN_PARTNER_PAYOUT_CENTS: 5_000,
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

let partnersModulePromise: Promise<typeof import('./partners.js')>
const PLATFORM_AUDIT_TENANT_ID = '00000000-0000-4000-8000-000000000000'

describe('partner token secret configuration', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalPartnerTokenSecret = process.env.PARTNER_TOKEN_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.NODE_ENV = 'production'
    delete process.env.PARTNER_TOKEN_SECRET
    getRequestMock.mockReturnValue(new Request('https://my.phiguard.test/partner/login'))
  })

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }

    if (originalPartnerTokenSecret === undefined) {
      delete process.env.PARTNER_TOKEN_SECRET
    } else {
      process.env.PARTNER_TOKEN_SECRET = originalPartnerTokenSecret
    }

    vi.resetModules()
  })

  it('imports in production without a partner token secret for admin-only paths', async () => {
    await expect(import('./partners.js')).resolves.toHaveProperty('adminListPartnersFn')
  })

  it('fails partner magic link signing when the production token secret is missing', async () => {
    const db = makePartnerUserLookupDb({
      id: 'partner-user-id',
      partnerId: 'partner-id',
      email: 'partner@example.com',
    })
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn } = await import('./partners.js')

    await expect(
      requestPartnerMagicLinkFn({
        data: { email: 'partner@example.com' },
      }),
    ).rejects.toThrow('PARTNER_TOKEN_SECRET must be set in non-development environments')
    expect(sendPartnerMagicLinkEmailMock).not.toHaveBeenCalled()
  })
})

describe('partner payout admin actions', () => {
  beforeAll(async () => {
    process.env.PLATFORM_ADMIN_EMAILS = 'admin@example.com'
    partnersModulePromise = import('./partners.js')
    await partnersModulePromise
  })

  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue(makeAdminSession())
  })

  it('marks a pending payout as paid and writes an audit event', async () => {
    const payoutId = '11111111-1111-4111-8111-111111111111'
    const externalReference = 'stripe-po_123'
    const db = makePartnerPayoutDb({
      id: payoutId,
      status: 'pending',
      externalReference: null,
      paidAt: null,
    })
    getDbMock.mockReturnValue(db)

    const { adminMarkPayoutPaidFn } = await partnersModulePromise

    await adminMarkPayoutPaidFn({
      data: { payoutId, externalReference },
    })

    expect(db.tx.select).toHaveBeenCalledTimes(1)
    expect(db.tx.update).toHaveBeenCalledTimes(1)
    expect(db.tx.updateSet).toHaveBeenCalledWith({
      status: 'paid',
      externalReference,
      paidAt: expect.any(Date),
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        tenantId: PLATFORM_AUDIT_TENANT_ID,
        actorId: 'admin-user',
        action: 'partner.payout_marked_paid',
        resourceType: 'partner_payout',
        resourceId: payoutId,
        before: { status: 'pending', externalReference: null, paidAt: null },
        after: {
          status: 'paid',
          externalReference,
          paidAt: expect.any(String),
        },
      }),
    )
  })

  it('requires an external payment reference before marking a payout paid', async () => {
    const payoutId = '11111111-1111-4111-8111-111111111111'
    const db = makePartnerPayoutDb({
      id: payoutId,
      status: 'pending',
      externalReference: null,
      paidAt: null,
    })
    getDbMock.mockReturnValue(db)

    const { adminMarkPayoutPaidFn } = await partnersModulePromise

    await expect(
      adminMarkPayoutPaidFn({
        data: { payoutId },
      }),
    ).rejects.toThrow()

    expect(db.transaction).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it.each([
    ['blank', '   '],
    ['unsupported characters', 'stripe-po_<script>'],
    ['over 120 characters', 'x'.repeat(121)],
  ] as const)('rejects %s external payment references', async (_caseName, externalReference) => {
    const payoutId = '11111111-1111-4111-8111-111111111111'
    const db = makePartnerPayoutDb({
      id: payoutId,
      status: 'pending',
      externalReference: null,
      paidAt: null,
    })
    getDbMock.mockReturnValue(db)

    const { adminMarkPayoutPaidFn } = await partnersModulePromise

    await expect(
      adminMarkPayoutPaidFn({
        data: { payoutId, externalReference },
      }),
    ).rejects.toThrow()

    expect(db.transaction).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects missing payout ids without auditing', async () => {
    const payoutId = '22222222-2222-4222-8222-222222222222'
    const db = makePartnerPayoutDb(null)
    getDbMock.mockReturnValue(db)

    const { adminMarkPayoutPaidFn } = await partnersModulePromise

    await expect(
      adminMarkPayoutPaidFn({
        data: { payoutId, externalReference: 'stripe-po_missing' },
      }),
    ).rejects.toThrow('Payout not found')

    expect(db.tx.update).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it.each([
    ['paid', 'Payout is already paid'],
    ['cancelled', 'Payout is already cancelled'],
  ] as const)('rejects %s payouts without changing state', async (status, message) => {
    const payoutId = '33333333-3333-4333-8333-333333333333'
    const db = makePartnerPayoutDb({
      id: payoutId,
      status,
      externalReference: status === 'paid' ? 'stripe-po_paid' : null,
      paidAt: status === 'paid' ? new Date('2026-05-01T12:00:00.000Z') : null,
    })
    getDbMock.mockReturnValue(db)

    const { adminMarkPayoutPaidFn } = await partnersModulePromise

    await expect(
      adminMarkPayoutPaidFn({
        data: { payoutId, externalReference: 'stripe-po_456' },
      }),
    ).rejects.toThrow(message)

    expect(db.tx.update).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('does not create payout records when computed balances are below the payout minimum', async () => {
    vi.mocked(computePayouts).mockReturnValueOnce([])
    const db = makeRunPayoutsDb([
      {
        partnerId: 'partner-low-balance',
        commissionPct: 20,
        referralId: 'referral-low-balance',
        revenueEventId: 'revenue-low-balance',
        amountCents: 24_900,
      },
    ])
    getDbMock.mockReturnValue(db)

    const { adminRunPayoutsFn } = await partnersModulePromise

    await adminRunPayoutsFn({
      data: {
        periodStart: '2026-05-01T00:00:00.000Z',
        periodEnd: '2026-05-31T23:59:59.000Z',
      },
    })

    expect(computePayouts).toHaveBeenCalledWith([
      {
        partnerId: 'partner-low-balance',
        commissionPct: 20,
        newRevenueCents: 24_900,
      },
    ])
    expect(db.tx.insert).not.toHaveBeenCalled()
    expect(db.tx.update).not.toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        action: 'partner.payout_run',
        after: expect.objectContaining({ payoutCount: 0 }),
      }),
    )
  })

  it('carries prior unallocated revenue into the next payout run', async () => {
    vi.mocked(computePayouts).mockReturnValueOnce([
      {
        partnerId: 'partner-active',
        amountCents: 5_200,
      },
    ])
    const db = makeRunPayoutsDb([
      {
        partnerId: 'partner-active',
        commissionPct: 20,
        referralId: 'referral-held',
        revenueEventId: 'revenue-held-april',
        amountCents: 24_000,
      },
      {
        partnerId: 'partner-active',
        commissionPct: 20,
        referralId: 'referral-held',
        revenueEventId: 'revenue-current-may',
        amountCents: 2_000,
      },
    ])
    getDbMock.mockReturnValue(db)

    const { adminRunPayoutsFn } = await partnersModulePromise

    await adminRunPayoutsFn({
      data: {
        periodStart: '2026-05-01T00:00:00.000Z',
        periodEnd: '2026-06-01T00:00:00.000Z',
      },
    })

    expect(computePayouts).toHaveBeenCalledWith([
      {
        partnerId: 'partner-active',
        commissionPct: 20,
        newRevenueCents: 26_000,
      },
    ])
    expect(db.tx.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerId: 'partner-active',
        amountCents: 0,
      }),
    )
    expect(db.tx.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 5_200,
      }),
    )
  })

  it('selects unpaid payout revenue through the period end so held balances are not stranded', () => {
    const source = readFileSync(fileURLToPath(new URL('./partners.ts', import.meta.url)), 'utf8')

    expect(source).toContain('lt(referralRevenueEvents.paidAt, periodEnd)')
    expect(source).not.toContain('gte(referralRevenueEvents.paidAt, periodStart)')
  })

  it('allocates only unallocated referral revenue in the requested payout period', async () => {
    vi.mocked(computePayouts).mockReturnValueOnce([
      {
        partnerId: 'partner-active',
        amountCents: 5_000,
      },
    ])
    const db = makeRunPayoutsDb([
      {
        partnerId: 'partner-active',
        commissionPct: 20,
        referralId: 'referral-in-period',
        revenueEventId: 'revenue-in-period',
        amountCents: 25_000,
      },
    ])
    getDbMock.mockReturnValue(db)

    const { adminRunPayoutsFn } = await partnersModulePromise

    await adminRunPayoutsFn({
      data: {
        periodStart: '2026-05-01T00:00:00.000Z',
        periodEnd: '2026-06-01T00:00:00.000Z',
      },
    })

    expect(computePayouts).toHaveBeenCalledWith([
      {
        partnerId: 'partner-active',
        commissionPct: 20,
        newRevenueCents: 25_000,
      },
    ])
    expect(db.tx.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerId: 'partner-active',
        amountCents: 0,
      }),
    )
    expect(db.tx.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        payoutId: 'payout-1',
        payoutAllocatedAt: expect.any(Date),
      }),
    )
    expect(db.tx.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        amountCents: 5_000,
      }),
    )
    expect(db.tx.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPaidOutCents: expect.any(Object),
      }),
    )
  })

  it('increments referral paid-out totals by commission payout cents, not gross revenue', async () => {
    vi.mocked(computePayouts).mockReturnValueOnce([
      {
        partnerId: 'partner-active',
        amountCents: 5_000,
      },
    ])
    const db = makeRunPayoutsDb([
      {
        partnerId: 'partner-active',
        commissionPct: 20,
        referralId: 'referral-in-period',
        revenueEventId: 'revenue-in-period',
        amountCents: 25_000,
      },
    ])
    getDbMock.mockReturnValue(db)

    const { adminRunPayoutsFn } = await partnersModulePromise

    await adminRunPayoutsFn({
      data: {
        periodStart: '2026-05-01T00:00:00.000Z',
        periodEnd: '2026-06-01T00:00:00.000Z',
      },
    })

    const referralUpdate = db.tx.updateSet.mock.calls.find(([value]) =>
      Boolean(
        value &&
          typeof value === 'object' &&
          'totalPaidOutCents' in (value as Record<string, unknown>),
      ),
    )?.[0] as { totalPaidOutCents?: unknown } | undefined

    expect(extractSqlParameterValues(referralUpdate?.totalPaidOutCents)).toContain(5_000)
    expect(extractSqlParameterValues(referralUpdate?.totalPaidOutCents)).not.toContain(25_000)
  })

  it('does not create a payout when selected revenue was concurrently allocated', async () => {
    vi.mocked(computePayouts).mockReturnValueOnce([
      {
        partnerId: 'partner-active',
        amountCents: 5_000,
      },
    ])
    const db = makeRunPayoutsDb(
      [
        {
          partnerId: 'partner-active',
          commissionPct: 20,
          referralId: 'referral-raced',
          revenueEventId: 'revenue-raced',
          amountCents: 25_000,
        },
      ],
      { allocatedEvents: [] },
    )
    getDbMock.mockReturnValue(db)

    const { adminRunPayoutsFn } = await partnersModulePromise

    await expect(
      adminRunPayoutsFn({
        data: {
          periodStart: '2026-05-01T00:00:00.000Z',
          periodEnd: '2026-06-01T00:00:00.000Z',
        },
      }),
    ).resolves.toEqual({ payoutsCreated: 0 })

    expect(db.tx.delete).toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        action: 'partner.payout_run',
        after: expect.objectContaining({ payoutCount: 0 }),
      }),
    )
  })

  it('rejects payout runs when the period end is not after the period start', async () => {
    const db = makeRunPayoutsDb([])
    getDbMock.mockReturnValue(db)

    const { adminRunPayoutsFn } = await partnersModulePromise

    await expect(
      adminRunPayoutsFn({
        data: {
          periodStart: '2026-05-31T23:59:59.000Z',
          periodEnd: '2026-05-01T00:00:00.000Z',
        },
      }),
    ).rejects.toThrow('Payout period end must be after period start')

    expect(db.select).not.toHaveBeenCalled()
    expect(db.transaction).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('approves a pending partner, creates a partner user, sends a magic link, and audits', async () => {
    const partnerId = '11111111-1111-4111-8111-111111111111'
    const db = makePartnerApprovalDb({
      partner: {
        id: partnerId,
        name: 'Clinic Advisor',
        email: 'partner@example.com',
        status: 'pending',
      },
    })
    getDbMock.mockReturnValue(db)

    const { adminApprovePartnerFn } = await partnersModulePromise

    await adminApprovePartnerFn({ data: { partnerId } })

    expect(db.tx.insertPartnerUserValues).toHaveBeenCalledWith({
      partnerId,
      email: 'partner@example.com',
    })
    expect(db.tx.updatePartnerSet).toHaveBeenCalledWith({ status: 'active' })
    expect(db.tx.insertMagicLinkValues).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerUserId: 'partner-user-id',
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      }),
    )
    expect(sendPartnerMagicLinkEmailMock).toHaveBeenCalledWith({
      toEmail: 'partner@example.com',
      magicLinkUrl: expect.stringContaining('/partner/verify?token='),
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        tenantId: PLATFORM_AUDIT_TENANT_ID,
        actorId: 'admin-user',
        action: 'partner.approved',
        resourceType: 'partner',
        resourceId: partnerId,
        before: { status: 'pending' },
        after: { status: 'active', partnerUserId: 'partner-user-id' },
      }),
    )
  })

  it('keeps approved partner state when the approval email fails', async () => {
    const partnerId = '55555555-5555-4555-8555-555555555555'
    const db = makePartnerApprovalDb({
      partner: {
        id: partnerId,
        name: 'Clinic Advisor',
        email: 'partner@example.com',
        status: 'pending',
      },
    })
    getDbMock.mockReturnValue(db)
    sendPartnerMagicLinkEmailMock.mockRejectedValueOnce(new Error('Email unavailable'))

    const { adminApprovePartnerFn } = await partnersModulePromise

    await expect(adminApprovePartnerFn({ data: { partnerId } })).resolves.toEqual({
      ok: true,
      partnerUserId: 'partner-user-id',
      emailSent: false,
    })

    expect(db.tx.updatePartnerSet).toHaveBeenCalledWith({ status: 'active' })
    expect(db.tx.insertMagicLinkValues).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerUserId: 'partner-user-id',
      }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      db.tx,
      expect.objectContaining({
        tenantId: PLATFORM_AUDIT_TENANT_ID,
        action: 'partner.approved',
        resourceId: partnerId,
      }),
    )
  })

  it('normalizes partner user email when approving a pending partner', async () => {
    const partnerId = '66666666-6666-4666-8666-666666666666'
    const db = makePartnerApprovalDb({
      partner: {
        id: partnerId,
        name: 'Clinic Advisor',
        email: 'Partner@Example.com',
        status: 'pending',
      },
    })
    getDbMock.mockReturnValue(db)

    const { adminApprovePartnerFn } = await partnersModulePromise

    await adminApprovePartnerFn({ data: { partnerId } })

    expect(db.tx.insertPartnerUserValues).toHaveBeenCalledWith({
      partnerId,
      email: 'partner@example.com',
    })
  })

  it('rejects approval for non-pending partners without creating a user', async () => {
    const partnerId = '22222222-2222-4222-8222-222222222222'
    const db = makePartnerApprovalDb({
      partner: {
        id: partnerId,
        name: 'Clinic Advisor',
        email: 'partner@example.com',
        status: 'active',
      },
    })
    getDbMock.mockReturnValue(db)

    const { adminApprovePartnerFn } = await partnersModulePromise

    await expect(adminApprovePartnerFn({ data: { partnerId } })).rejects.toThrow(
      'Partner is already active',
    )

    expect(db.tx.insert).not.toHaveBeenCalled()
    expect(db.tx.update).not.toHaveBeenCalled()
    expect(sendPartnerMagicLinkEmailMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects missing partners without creating login state', async () => {
    const partnerId = '33333333-3333-4333-8333-333333333333'
    const db = makePartnerApprovalDb({ partner: null })
    getDbMock.mockReturnValue(db)

    const { adminApprovePartnerFn } = await partnersModulePromise

    await expect(adminApprovePartnerFn({ data: { partnerId } })).rejects.toThrow(
      'Partner not found',
    )

    expect(db.tx.insert).not.toHaveBeenCalled()
    expect(db.tx.update).not.toHaveBeenCalled()
    expect(sendPartnerMagicLinkEmailMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects approval when the guarded status update loses the race', async () => {
    const partnerId = '44444444-4444-4444-8444-444444444444'
    const db = makePartnerApprovalDb({
      partner: {
        id: partnerId,
        name: 'Clinic Advisor',
        email: 'partner@example.com',
        status: 'pending',
      },
      updateResult: [],
    })
    getDbMock.mockReturnValue(db)

    const { adminApprovePartnerFn } = await partnersModulePromise

    await expect(adminApprovePartnerFn({ data: { partnerId } })).rejects.toThrow(
      'Partner could not be approved',
    )

    expect(sendPartnerMagicLinkEmailMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })
})

describe('partner magic links', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalPartnerTokenSecret = process.env.PARTNER_TOKEN_SECRET
  const originalAppUrl = process.env.APP_URL

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.NODE_ENV = 'test'
    process.env.PARTNER_TOKEN_SECRET = 'test-partner-token-secret'
    process.env.APP_URL = 'https://my.phiguard.test'
    getRequestMock.mockReturnValue(new Request('https://my.phiguard.test/partner/login'))
  })

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }

    if (originalPartnerTokenSecret === undefined) {
      delete process.env.PARTNER_TOKEN_SECRET
    } else {
      process.env.PARTNER_TOKEN_SECRET = originalPartnerTokenSecret
    }

    if (originalAppUrl === undefined) {
      delete process.env.APP_URL
    } else {
      process.env.APP_URL = originalAppUrl
    }

    vi.useRealTimers()
    vi.resetModules()
  })

  it('stores only a hash for requested magic links', async () => {
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn } = await import('./partners.js')

    await requestPartnerMagicLinkFn({ data: { email: 'Partner@Example.com' } })

    expect(db.tokens).toHaveLength(1)
    expect(db.tokens[0]?.tokenHash).toMatch(/^[a-f0-9]{64}$/)
    expect(sendPartnerMagicLinkEmailMock).toHaveBeenCalledWith({
      toEmail: 'Partner@Example.com',
      magicLinkUrl: expect.stringContaining('/partner/verify?token='),
    })
    const magicLinkUrl = getSentMagicLinkUrl()
    const rawToken = new URL(magicLinkUrl).searchParams.get('token')
    expect(db.tokens[0]?.tokenHash).not.toBe(rawToken)
  })

  it('does not leak active partner existence when magic link email delivery fails', async () => {
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)
    sendPartnerMagicLinkEmailMock.mockRejectedValueOnce(new Error('email unavailable'))

    const { requestPartnerMagicLinkFn } = await import('./partners.js')

    await expect(
      requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } }),
    ).resolves.toEqual({ ok: true })

    expect(db.tokens).toHaveLength(1)
    expect(sendPartnerMagicLinkEmailMock).toHaveBeenCalledWith({
      toEmail: 'partner@example.com',
      magicLinkUrl: expect.stringContaining('/partner/verify?token='),
    })
  })

  it('suppresses rapid duplicate magic link requests for the same email', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-06T12:00:00.000Z'))
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn } = await import('./partners.js')

    await requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } })
    await requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } })

    expect(db.tokens).toHaveLength(1)
    expect(sendPartnerMagicLinkEmailMock).toHaveBeenCalledTimes(1)
  })

  it('allows a valid magic link once and rejects reuse', async () => {
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn, verifyPartnerMagicLinkFn } = await import('./partners.js')

    await requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } })
    const magicLinkUrl = getSentMagicLinkUrl()
    const token = new URL(magicLinkUrl).searchParams.get('token') ?? ''

    await expect(verifyPartnerMagicLinkFn({ data: { token } })).resolves.not.toThrow()
    await expect(verifyPartnerMagicLinkFn({ data: { token } })).rejects.toThrow(
      'Invalid or expired magic link',
    )
  })

  it('does not send new magic links for inactive partners', async () => {
    const db = makePartnerMagicLinkDb({ partnerStatus: 'inactive' })
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn } = await import('./partners.js')

    await expect(
      requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } }),
    ).resolves.toEqual({ ok: true })

    expect(db.tokens).toHaveLength(0)
    expect(sendPartnerMagicLinkEmailMock).not.toHaveBeenCalled()
  })

  it('rejects redemption when a partner becomes inactive', async () => {
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn, verifyPartnerMagicLinkFn } = await import('./partners.js')

    await requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } })
    const token = new URL(getSentMagicLinkUrl()).searchParams.get('token') ?? ''
    db.partner.status = 'inactive'

    await expect(verifyPartnerMagicLinkFn({ data: { token } })).rejects.toThrow(
      'Partner account is not active',
    )
  })

  it('rejects dashboard access when a partner becomes inactive', async () => {
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn, verifyPartnerMagicLinkFn, getPartnerDashboardFn } =
      await import('./partners.js')

    await requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } })
    const token = new URL(getSentMagicLinkUrl()).searchParams.get('token') ?? ''
    const verified = await verifyPartnerMagicLinkFn({ data: { token } })
    db.partner.status = 'inactive'
    getRequestMock.mockReturnValue(
      new Request('https://my.phiguard.test/partner/dashboard', {
        headers: { cookie: verified.sessionCookie },
      }),
    )

    await expect(getPartnerDashboardFn()).rejects.toThrow('Unauthorized')
  })

  it('rejects missing, malformed, tampered, and expired magic links', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-06T12:00:00.000Z'))
    const db = makePartnerMagicLinkDb()
    getDbMock.mockReturnValue(db)

    const { requestPartnerMagicLinkFn, verifyPartnerMagicLinkFn } = await import('./partners.js')

    await expect(verifyPartnerMagicLinkFn({ data: { token: '' } })).rejects.toThrow()
    await expect(verifyPartnerMagicLinkFn({ data: { token: 'not-a-token' } })).rejects.toThrow(
      'Invalid or expired magic link',
    )

    await requestPartnerMagicLinkFn({ data: { email: 'partner@example.com' } })
    const magicLinkUrl = getSentMagicLinkUrl()
    const token = new URL(magicLinkUrl).searchParams.get('token') ?? ''
    const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`

    await expect(verifyPartnerMagicLinkFn({ data: { token: tampered } })).rejects.toThrow(
      'Invalid or expired magic link',
    )

    vi.setSystemTime(new Date('2026-05-06T12:16:00.000Z'))
    await expect(verifyPartnerMagicLinkFn({ data: { token } })).rejects.toThrow(
      'Invalid or expired magic link',
    )
  })
})

function makePartnerPayoutDb(
  payout: {
    id: string
    status: 'pending' | 'paid' | 'cancelled'
    externalReference: string | null
    paidAt: Date | null
  } | null,
) {
  const selectLimit = vi.fn().mockResolvedValue(payout ? [payout] : [])
  const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit })
  const selectFrom = vi.fn().mockReturnValue({ where: selectWhere })
  const select = vi.fn().mockReturnValue({ from: selectFrom })

  const returning = vi.fn().mockResolvedValue(payout ? [{ ...payout, status: 'paid' }] : [])
  const updateWhere = vi.fn().mockReturnValue({ returning })
  const updateSet = vi.fn().mockReturnValue({ where: updateWhere })
  const update = vi.fn().mockReturnValue({ set: updateSet })

  type PartnerTx = {
    select: typeof select
    update: typeof update
    updateSet: typeof updateSet
  }

  const tx: PartnerTx = {
    select,
    update,
    updateSet,
  }

  return {
    transaction: vi.fn(async (callback: (tx: PartnerTx) => Promise<unknown>) => callback(tx)),
    tx,
  }
}

function makeRunPayoutsDb(
  partnerRevenueRows: Array<{
    partnerId: string
    commissionPct: number
    referralId: string
    revenueEventId: string
    amountCents: number
  }>,
  options?: {
    allocatedEvents?: Array<{ id?: string; referralId: string; amountCents: number }>
  },
) {
  const select = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(partnerRevenueRows),
        }),
      }),
    }),
  })
  const insertReturning = vi.fn().mockResolvedValue([{ id: 'payout-1' }])
  const insertValues = vi.fn().mockReturnValue({ returning: insertReturning })
  const allocatedEvents =
    options?.allocatedEvents ??
    partnerRevenueRows.map((row) => ({
      id: row.revenueEventId,
      referralId: row.referralId,
      amountCents: row.amountCents,
    }))
  const updateReturning = vi.fn(async () => {
    const event = allocatedEvents.shift()
    return event ? [event] : []
  })
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: updateReturning,
    }),
  })
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteFn = vi.fn().mockReturnValue({
    where: deleteWhere,
  })
  const tx = {
    insert: vi.fn().mockReturnValue({ values: insertValues }),
    update: vi.fn().mockReturnValue({
      set: updateSet,
    }),
    delete: deleteFn,
    insertValues,
    updateSet,
  }

  return {
    select,
    transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) =>
      callback(tx),
    ),
    tx,
  }
}

function makePartnerApprovalDb(input: {
  partner: {
    id: string
    name: string
    email: string
    status: 'pending' | 'active' | 'inactive'
  } | null
  updateResult?: unknown[]
}) {
  const select = vi.fn().mockReturnValue({
    from: vi.fn((table: unknown) => ({
      where: vi.fn(() => ({
        limit: vi.fn(async () => {
          if (table === partners) return input.partner ? [input.partner] : []
          return []
        }),
      })),
    })),
  })

  const updatePartnerSet = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue(
          input.updateResult ??
            (input.partner?.status === 'pending' ? [{ ...input.partner, status: 'active' }] : []),
        ),
    }),
  })
  const update = vi.fn((table: unknown) => {
    if (table === partners) {
      return { set: updatePartnerSet }
    }
    return { set: vi.fn() }
  })

  const insertPartnerUserValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([
      {
        id: 'partner-user-id',
        partnerId: input.partner?.id,
        email: input.partner?.email,
      },
    ]),
  })
  const insertMagicLinkValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn((table: unknown) => {
    if (table === partnerUsers) {
      return { values: insertPartnerUserValues }
    }
    if (table === partnerMagicLinkTokens) {
      return { values: insertMagicLinkValues }
    }
    return { values: vi.fn().mockResolvedValue(undefined) }
  })

  const tx = {
    select,
    update,
    insert,
    insertPartnerUserValues,
    insertMagicLinkValues,
    updatePartnerSet,
  }

  type PartnerApprovalTx = typeof tx

  return {
    transaction: vi.fn(async (callback: (transaction: PartnerApprovalTx) => Promise<unknown>) =>
      callback(tx),
    ),
    tx,
  }
}

function makePartnerUserLookupDb(
  partnerUser: {
    id: string
    partnerId: string
    email: string
  } | null,
) {
  const from = vi.fn((table: unknown) => ({
    where: vi.fn(() => ({
      limit: vi.fn().mockResolvedValue(
        table === partnerUsers
          ? partnerUser
            ? [partnerUser]
            : []
          : table === partners && partnerUser
            ? [{ id: partnerUser.partnerId, status: 'active' }]
            : [],
      ),
    })),
  }))
  const select = vi.fn().mockReturnValue({ from })

  return { select }
}

function getSentMagicLinkUrl() {
  const calls = sendPartnerMagicLinkEmailMock.mock.calls as unknown as Array<
    [{ magicLinkUrl?: string }]
  >
  const payload = calls.at(-1)?.[0] as { magicLinkUrl?: string } | undefined

  if (!payload?.magicLinkUrl) {
    throw new Error('Expected partner magic link email to be sent')
  }

  return payload.magicLinkUrl
}

function extractSqlParameterValues(value: unknown): unknown[] {
  const chunks = (value as { queryChunks?: unknown[] } | null | undefined)?.queryChunks
  if (!Array.isArray(chunks)) return []

  const values: unknown[] = []
  const seen = new Set<unknown>()
  const visit = (chunk: unknown) => {
    if (typeof chunk === 'number') {
      values.push(chunk)
      return
    }

    if (!chunk || typeof chunk !== 'object' || seen.has(chunk)) {
      return
    }
    seen.add(chunk)

    if ('value' in chunk) {
      const paramValue = (chunk as { value: unknown }).value
      if (typeof paramValue === 'number') {
        values.push(paramValue)
      }
    }

    const nestedChunks = (chunk as { queryChunks?: unknown[] }).queryChunks
    if (Array.isArray(nestedChunks)) {
      nestedChunks.forEach(visit)
    }
  }

  chunks.forEach(visit)
  return values
}

function makePartnerMagicLinkDb(input?: { partnerStatus?: 'pending' | 'active' | 'inactive' }) {
  const partnerUser = {
    id: 'partner-user-id',
    partnerId: 'partner-id',
    email: 'partner@example.com',
  }
  const partner = {
    id: 'partner-id',
    name: 'Clinic Advisor',
    email: 'partner@example.com',
    referralCode: 'clinic-advisor',
    commissionPct: 20,
    status: input?.partnerStatus ?? 'active',
  }
  const tokens: Array<{
    partnerUserId: string
    tokenHash: string
    expiresAt: Date
    usedAt: Date | null
  }> = []
  const extractTokenHash = (condition: unknown): string | null => {
    const seen = new Set<unknown>()
    const visit = (value: unknown): string | null => {
      if (!value || typeof value !== 'object' || seen.has(value)) {
        return null
      }

      seen.add(value)
      const maybeValue = (value as { value?: unknown }).value
      if (typeof maybeValue === 'string' && /^[a-f0-9]{64}$/.test(maybeValue)) {
        return maybeValue
      }

      const chunks = (value as { queryChunks?: unknown }).queryChunks
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          const tokenHash = visit(chunk)
          if (tokenHash) return tokenHash
        }
      }

      return null
    }

    return visit(condition)
  }

  const select = vi.fn().mockReturnValue({
    from: vi.fn((table: unknown) => ({
      where: vi.fn((condition: unknown) => ({
        limit: vi.fn(async () => {
          if (table === partnerUsers) {
            return [partnerUser]
          }
          if (table === partners) {
            return [partner]
          }
          if (table === partnerMagicLinkTokens) {
            const tokenHash = extractTokenHash(condition)
            const token = tokens.find(
              (row) =>
                row.tokenHash === tokenHash && row.usedAt === null && row.expiresAt > new Date(),
            )
            return token ? [token] : []
          }
          return []
        }),
      })),
    })),
  })

  const insert = vi.fn((table: unknown) => ({
    values: vi.fn((value: { partnerUserId: string; tokenHash: string; expiresAt: Date }) => {
      if (table === partnerMagicLinkTokens) {
        tokens.push({ ...value, usedAt: null })
      }
      return Promise.resolve()
    }),
  }))

  const update = vi.fn((table: unknown) => ({
    set: vi.fn((value: { usedAt?: Date }) => ({
      where: vi.fn((condition: unknown) => ({
        returning: vi.fn(async () => {
          if (table === partnerMagicLinkTokens) {
            const tokenHash = extractTokenHash(condition)
            const token = tokens.find(
              (row) =>
                row.tokenHash === tokenHash && row.usedAt === null && row.expiresAt > new Date(),
            )
            if (token) {
              token.usedAt = value.usedAt ?? new Date()
              return [{ id: 'token-id' }]
            }
          }
          return []
        }),
      })),
    })),
  }))

  return {
    select,
    insert,
    update,
    transaction: vi.fn(
      async (
        callback: (tx: { select: typeof select; update: typeof update }) => Promise<unknown>,
      ) => callback({ select, update }),
    ),
    tokens,
    partner,
  }
}

function makeAdminSession(): AppSession {
  return {
    user: {
      id: 'admin-user',
      email: 'admin@example.com',
      name: 'Admin User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: 'session-id',
      token: 'session-token',
      userId: 'admin-user',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      activeOrganizationId: null,
    },
  } as AppSession
}
