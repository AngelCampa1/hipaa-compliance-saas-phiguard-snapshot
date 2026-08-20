import { beforeEach, describe, expect, it, vi } from 'vitest'

const { rateLimitMock } = vi.hoisted(() => ({
  rateLimitMock: vi.fn(),
}))

const { loggerWarnMock } = vi.hoisted(() => ({
  loggerWarnMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: vi.fn(() => vi.fn(() => ({}))),
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((column: unknown, value: unknown) => ({ column, value })),
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: vi.fn(),
  partners: {
    id: 'partnerId',
    referralCode: 'referralCode',
    email: 'email',
    company: 'company',
    website: 'website',
  },
}))

vi.mock('@phiguard/email', () => ({
  sendPartnerApplicationEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@phiguard/audit', () => ({
  logger: { warn: loggerWarnMock },
}))

vi.mock('../../middleware/rate-limit.js', () => ({
  createRateLimitMiddleware: vi.fn(() => rateLimitMock),
}))

import { getDb } from '@phiguard/db/server'
import { sendPartnerApplicationEmail } from '@phiguard/email'
import { handlePartnerApplication, handlePartnerApplicationOptions } from './partners.apply.js'

const APP = 'https://my.phiguard.app'
const SITE = 'https://phiguard.app'

function makeDbMock(
  options: {
    existingPartner?: { id: string }
    insertError?: unknown
  } = {},
) {
  const returning = options.insertError
    ? vi.fn().mockRejectedValue(options.insertError)
    : vi.fn().mockResolvedValue([{ id: 'partner-123' }])
  const values = vi.fn().mockReturnValue({ returning })
  const insert = vi.fn().mockReturnValue({ values })
  const limit = vi.fn().mockImplementation(function (this: { _where?: { column?: unknown } }) {
    if (this._where?.column === 'email') {
      return Promise.resolve(options.existingPartner ? [options.existingPartner] : [])
    }
    return Promise.resolve([])
  })
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({
    where: vi.fn((condition: { column?: unknown }) => ({
      _where: condition,
      limit,
    })),
  })
  const select = vi.fn().mockReturnValue({ from })

  return {
    insert,
    select,
    _mocks: {
      values,
      returning,
      where,
      limit,
    },
  }
}

function makeFormRequest(fields: Record<string, string>, headers: Record<string, string> = {}) {
  return new Request(`${APP}/api/partners/apply`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: new URLSearchParams(fields).toString(),
  })
}

function makeJsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${APP}/api/partners/apply`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('handlePartnerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MARKETING_SITE_URL = SITE
    rateLimitMock.mockResolvedValue(null)
  })

  it('returns JSON and CORS headers for enhanced marketing form submissions', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'Advisor@Example.com',
          company: 'Clinic Advisors LLC',
          website: 'https://clinicadvisors.example',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(response.headers.get('vary')).toContain('Origin')
    await expect(response.json()).resolves.toEqual({
      ok: true,
      partnerId: 'partner-123',
      id: 'partner-123',
      leadId: 'partner-123',
    })
    expect(db._mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Clinic Advisor',
        email: 'advisor@example.com',
        company: 'Clinic Advisors LLC',
        website: 'https://clinicadvisors.example/',
        status: 'pending',
      }),
    )
    expect(sendPartnerApplicationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'advisor@example.com',
        partnerName: 'Clinic Advisor',
        company: 'Clinic Advisors LLC',
      }),
    )
  })

  it('redirects non-JavaScript form posts back to the marketing site', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest({
        name: 'Clinic Advisor',
        email: 'advisor@example.com',
        company: 'Clinic Advisors LLC',
      }),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(`${SITE}/partners?applied=1`)
  })

  it('keeps a saved JSON application successful when the confirmation email fails', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)
    vi.mocked(sendPartnerApplicationEmail).mockRejectedValueOnce(
      new Error('email unavailable for advisor@example.com at Clinic Advisors LLC'),
    )

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
          website: 'https://clinicadvisors.example',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      partnerId: 'partner-123',
      id: 'partner-123',
      leadId: 'partner-123',
    })
    expect(db.insert).toHaveBeenCalled()
    expect(loggerWarnMock).toHaveBeenCalledWith(
      {
        partnerId: 'partner-123',
        errName: 'Error',
      },
      'partner application confirmation email failed',
    )
    expect(JSON.stringify(loggerWarnMock.mock.calls)).not.toContain('advisor@example.com')
    expect(JSON.stringify(loggerWarnMock.mock.calls)).not.toContain('Clinic Advisors LLC')
  })

  it('keeps a saved browser application successful when the confirmation email fails', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)
    vi.mocked(sendPartnerApplicationEmail).mockRejectedValueOnce(new Error('email unavailable'))

    const response = await handlePartnerApplication(
      makeFormRequest({
        name: 'Clinic Advisor',
        email: 'advisor@example.com',
        company: 'Clinic Advisors LLC',
      }),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(`${SITE}/partners?applied=1`)
    expect(db.insert).toHaveBeenCalled()
  })

  it('keeps validation errors readable for enhanced forms', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'not-an-email',
          company: 'Clinic Advisors LLC',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('access-control-allow-origin')).toBe(SITE)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid email address',
    })
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('returns a controlled JSON error for malformed JSON applications', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeJsonRequest('{', {
        origin: SITE,
      }),
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('access-control-allow-origin')).toBe(SITE)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid request body',
    })
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })

  it('rejects oversized JSON application bodies before DB writes', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeJsonRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
          ignored: 'x'.repeat(20_000),
        },
        {
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(413)
    expect(response.headers.get('access-control-allow-origin')).toBe(SITE)
    await expect(response.json()).resolves.toEqual({
      error: 'Partner application payload too large',
    })
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })

  it('treats non-string JSON application fields as invalid input instead of throwing', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeJsonRequest(
        {
          name: 'Clinic Advisor',
          email: 123,
          company: 'Clinic Advisors LLC',
        },
        {
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'name, email, and company are required',
    })
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })

  it('rejects non-http partner website URLs before storing them', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
          website: 'javascript:alert(1)',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Website URL must start with https:// or http://',
    })
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('answers partner application preflight requests for allowed marketing origins', () => {
    const response = handlePartnerApplicationOptions(
      new Request(`${APP}/api/partners/apply`, {
        method: 'OPTIONS',
        headers: { origin: SITE },
      }),
    )

    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(response.headers.get('access-control-allow-methods')).toContain('POST')
  })

  it('treats duplicate email submissions as idempotent JSON success', async () => {
    const db = makeDbMock({ existingPartner: { id: 'partner-existing' } })
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
          website: 'https://clinicadvisors.example',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      partnerId: 'partner-existing',
      id: 'partner-existing',
      leadId: 'partner-existing',
    })
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })

  it('treats duplicate email races from the database as idempotent JSON success', async () => {
    const db = makeDbMock({
      existingPartner: { id: 'partner-existing' },
      insertError: Object.assign(new Error('duplicate key'), { code: '23505' }),
    })
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
          website: 'https://clinicadvisors.example',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      partnerId: 'partner-existing',
      id: 'partner-existing',
      leadId: 'partner-existing',
    })
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })

  it('retries referral code insert races instead of failing the application', async () => {
    const uniqueViolation = Object.assign(new Error('duplicate referral code'), { code: '23505' })
    const returning = vi
      .fn()
      .mockRejectedValueOnce(uniqueViolation)
      .mockResolvedValueOnce([{ id: 'partner-retried' }])
    const values = vi.fn().mockReturnValue({ returning })
    const db = {
      insert: vi.fn().mockReturnValue({ values }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn((condition: { column?: unknown }) => ({
            _where: condition,
            limit: vi.fn().mockResolvedValue([]),
          })),
        }),
      }),
    }
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      partnerId: 'partner-retried',
      id: 'partner-retried',
      leadId: 'partner-retried',
    })
    expect(values).toHaveBeenCalledTimes(2)
    expect(sendPartnerApplicationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'advisor@example.com',
      }),
    )
  })

  it('treats duplicate browser form submissions as idempotent success', async () => {
    const db = makeDbMock({ existingPartner: { id: 'partner-existing' } })
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerApplication(
      makeFormRequest({
        name: 'Clinic Advisor',
        email: 'advisor@example.com',
        company: 'Clinic Advisors LLC',
        website: 'https://clinicadvisors.example',
      }),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(`${SITE}/partners?applied=1`)
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })

  it('rate limits public partner application submissions before DB writes', async () => {
    const db = makeDbMock()
    vi.mocked(getDb).mockReturnValue(db as never)
    rateLimitMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const response = await handlePartnerApplication(
      makeFormRequest(
        {
          name: 'Clinic Advisor',
          email: 'advisor@example.com',
          company: 'Clinic Advisors LLC',
        },
        {
          accept: 'application/json',
          origin: SITE,
        },
      ),
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendPartnerApplicationEmail).not.toHaveBeenCalled()
  })
})
