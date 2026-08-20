import { beforeEach, describe, expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'

faker.seed(42)

const { captureServerExceptionMock } = vi.hoisted(() => ({
  captureServerExceptionMock: vi.fn(),
}))

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...clauses: unknown[]) => ({ op: 'and', clauses })),
  eq: vi.fn((column: { _column?: string }, value: unknown) => ({
    op: 'eq',
    column,
    value,
  })),
}))

vi.mock('@phiguard/marketing-db/server', () => ({
  getMarketingDb: vi.fn(),
  marketingLeads: {
    _brand: 'marketingLeads',
    id: { _column: 'id' },
    email: { _column: 'email' },
    magnetSlug: { _column: 'magnetSlug' },
  },
  emailSubscriptions: {
    _brand: 'emailSubscriptions',
    id: { _column: 'id' },
    email: { _column: 'email' },
  },
}))

vi.mock('@phiguard/email', () => ({
  sendLeadMagnetDeliveryEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@phiguard/audit', () => {
  const safe = { error: vi.fn(), warn: vi.fn() }
  // Mirror the real export: `logger.safe === logger` (both go through the same redact path).
  return { logger: { ...safe, safe }, getLeadMagnetsBucketName: vi.fn(() => '') }
})

const emailRateLimitMock = vi.hoisted(() => vi.fn().mockResolvedValue(null))

vi.mock('../../../middleware/rate-limit.js', () => ({
  createRateLimitMiddleware: vi.fn(() => vi.fn().mockResolvedValue(null)),
  createIdentifierRateLimitMiddleware: vi.fn(() => emailRateLimitMock),
}))

const verifyCaptchaMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true, bypassed: true }),
)

vi.mock('../../../lib/captcha.js', () => ({
  verifyCaptcha: verifyCaptchaMock,
}))

vi.mock('../../../lib/sentry.js', () => ({
  captureServerException: captureServerExceptionMock,
}))

const enrollSequencerSequenceMock = vi.hoisted(() => vi.fn().mockResolvedValue(true))

vi.mock('../../../server/sequencer.js', () => ({
  enrollSequencerSequence: enrollSequencerSequenceMock,
}))

import { getMarketingDb } from '@phiguard/marketing-db/server'
import { sendLeadMagnetDeliveryEmail } from '@phiguard/email'
import { handleLeadCapture, handleLeadCaptureOptions } from './leads.js'

const BASE = 'https://app.phiguard.test'
const SITE = 'https://phiguard.app'

function makeFormRequest(fields: Record<string, string>) {
  const body = new URLSearchParams(fields).toString()
  return new Request(`${BASE}/api/marketing/leads`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
}

function makeJsonRequest(body: Record<string, unknown>) {
  return new Request(`${BASE}/api/marketing/leads`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeMarketingFormRequest(fields: Record<string, string>) {
  const body = new URLSearchParams(fields).toString()
  return new Request(`${BASE}/api/marketing/leads`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      origin: SITE,
    },
    body,
  })
}

function makeMarketingJsonRequest(body: Record<string, unknown>) {
  return new Request(`${BASE}/api/marketing/leads`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: SITE,
    },
    body: JSON.stringify(body),
  })
}

function makeMalformedMarketingJsonRequest(body: string) {
  return new Request(`${BASE}/api/marketing/leads`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: SITE,
    },
    body,
  })
}

function buildDbMock(
  overrides: {
    subscriptionRow?: Record<string, unknown> | null
    leadRows?: Array<Record<string, unknown>>
    leadRowsBySlug?: Record<string, Record<string, unknown>>
    /** Rows returned by the marketing_leads insert .returning(). Empty = duplicate (no new lead). */
    leadInsertRows?: Array<Record<string, unknown>>
  } = {},
) {
  const {
    subscriptionRow = {
      id: faker.string.uuid(),
      unsubscribeToken: faker.string.uuid(),
      subscribed: true,
    },
    leadRows = [{ id: faker.string.uuid() }],
    leadRowsBySlug = {},
    leadInsertRows = [{ id: faker.string.uuid() }],
  } = overrides

  const mockSet = vi.fn()
  const mockWhere = vi.fn().mockResolvedValue(undefined)
  mockSet.mockReturnValue({ where: mockWhere })
  const mockReturning = vi.fn().mockResolvedValue(subscriptionRow ? [subscriptionRow] : [])
  const mockOnConflictReturning = vi.fn().mockReturnValue({ returning: mockReturning })
  const mockSubscriptionValues = vi
    .fn()
    .mockReturnValue({ onConflictDoNothing: mockOnConflictReturning })
  const mockLeadReturning = vi.fn().mockResolvedValue(leadInsertRows)
  const mockLeadOnConflict = vi.fn().mockReturnValue({ returning: mockLeadReturning })
  const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockLeadOnConflict })

  const readConditionValue = (condition: unknown, columnName: string): unknown => {
    if (!condition || typeof condition !== 'object') return undefined

    const typedCondition = condition as {
      op?: string
      column?: { _column?: string }
      value?: unknown
      clauses?: unknown[]
    }

    if (typedCondition.op === 'eq' && typedCondition.column?._column === columnName) {
      return typedCondition.value
    }

    if (typedCondition.op === 'and' && Array.isArray(typedCondition.clauses)) {
      for (const clause of typedCondition.clauses) {
        const value = readConditionValue(clause, columnName)
        if (value !== undefined) return value
      }
    }

    return undefined
  }

  const mockSubscriptionWhere = vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue(subscriptionRow ? [subscriptionRow] : []),
  })

  const mockLeadWhere = vi.fn().mockImplementation((condition: unknown) => ({
    limit: vi.fn().mockImplementation(async () => {
      const magnetSlug = readConditionValue(condition, 'magnetSlug')
      if (typeof magnetSlug === 'string' && leadRowsBySlug[magnetSlug]) {
        return [leadRowsBySlug[magnetSlug]]
      }

      return leadRows
    }),
  }))

  const mockFrom = vi.fn().mockImplementation((table: { _brand?: string }) => {
    if (table._brand === 'emailSubscriptions') return { where: mockSubscriptionWhere }
    if (table._brand === 'marketingLeads') return { where: mockLeadWhere }
    return {
      where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
    }
  })
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

  const mockInsert = vi.fn().mockImplementation((table: { _brand?: string }) => {
    if (table._brand === 'emailSubscriptions') return { values: mockSubscriptionValues }
    return { values: mockValues }
  })
  const mockDeleteWhere = vi.fn().mockResolvedValue(undefined)
  const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere })

  return {
    insert: mockInsert,
    select: mockSelect,
    update: vi.fn().mockReturnValue({ set: mockSet }),
    delete: mockDelete,
    _mocks: {
      values: mockValues,
      subscriptionValues: mockSubscriptionValues,
      updateWhere: mockWhere,
      leadWhere: mockLeadWhere,
      deleteWhere: mockDeleteWhere,
    },
  }
}

describe('handleLeadCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MARKETING_SITE_URL = SITE
  })

  it('rejects an unknown slug before using it in a redirect', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    const res = await handleLeadCapture(
      makeFormRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'unknown-slug',
      }),
    )

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`${SITE}/resources`)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('rejects invalid email addresses', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    const res = await handleLeadCapture(
      makeFormRequest({ email: 'bad', magnetSlug: 'baa-template' }),
    )

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`${SITE}/resources/baa-template?error=invalid-email`)
  })

  it('rejects unknown CTA contexts', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    const res = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
        cta_context: 'sidebar-whatever',
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Unknown CTA context' })
  })

  it('allows JSON lead captures from the marketing site origin', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(201)
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(res.headers.get('vary')).toContain('Origin')
  })

  it('returns JSON for enhanced marketing form captures that send an Accept JSON header', async () => {
    const leadId = faker.string.uuid()
    const db = buildDbMock({ leadInsertRows: [{ id: leadId }] })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingFormRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(201)
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    await expect(res.json()).resolves.toEqual({ ok: true, leadId, id: leadId })
  })

  it('returns the lead ID for JSON lead captures', async () => {
    const leadId = faker.string.uuid()
    const db = buildDbMock({ leadInsertRows: [{ id: leadId }] })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ ok: true, leadId, id: leadId })
  })

  it('redirects browser form captures to the thank-you page', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeFormRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`${SITE}/resources/thank-you?slug=baa-template`)
  })

  it('keeps CORS headers on JSON validation errors from the marketing site origin', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
        cta_context: 'sidebar-whatever',
      }),
    )

    expect(res.status).toBe(400)
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
  })

  it('returns a controlled JSON error for malformed JSON lead captures', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(makeMalformedMarketingJsonRequest('{'))

    expect(res.status).toBe(400)
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    await expect(res.json()).resolves.toEqual({ error: 'Invalid request body' })
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
  })

  it('rejects oversized JSON bodies before verification, DB writes, or delivery', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
        referrer: 'https://example.com/'.concat('x'.repeat(16 * 1024)),
      }),
    )

    expect(res.status).toBe(413)
    await expect(res.json()).resolves.toEqual({ error: 'payload_too_large' })
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(verifyCaptchaMock).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('rejects oversized form bodies from content-length before parsing', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    const request = new Request(`${BASE}/api/marketing/leads`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': `${16 * 1024 + 1}`,
        origin: SITE,
      },
      body: new URLSearchParams({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }).toString(),
    })

    const res = await handleLeadCapture(request)

    expect(res.status).toBe(413)
    await expect(res.json()).resolves.toEqual({ error: 'payload_too_large' })
    expect(verifyCaptchaMock).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
  })

  it('treats non-string JSON fields as invalid input instead of throwing', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 123,
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Valid email is required' })
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
  })

  it('answers marketing lead capture preflight requests for allowed origins', async () => {
    const res = handleLeadCaptureOptions(
      new Request(`${BASE}/api/marketing/leads`, {
        method: 'OPTIONS',
        headers: { origin: SITE },
      }),
    )

    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(res.headers.get('access-control-allow-methods')).toContain('POST')
  })

  it('does not allow arbitrary origins for marketing lead captures', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      new Request(`${BASE}/api/marketing/leads`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
          origin: 'https://evil.example',
        },
        body: new URLSearchParams({
          email: 'admin@clinic.com',
          magnetSlug: 'baa-template',
        }).toString(),
      }),
    )

    expect(res.status).toBe(201)
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('writes explicit UTM and CTA fields to marketing_leads', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'hipaa-q1',
        utm_content: 'variant-b',
        utm_term: 'hipaa compliance',
        referrer: 'google.com',
        source_page_path: '/pricing',
        landing_page_path: '/resources/guides/hipaa',
        initial_referrer_host: 'www.linkedin.com',
        initial_utm_source: 'linkedin',
        initial_utm_medium: 'social',
        initial_utm_campaign: 'q2',
        initial_utm_content: 'guide',
        initial_utm_term: 'hipaa',
        cta_context: 'resource-sidebar',
      }),
    )

    expect(db._mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'hipaa-q1',
        utmContent: 'variant-b',
        utmTerm: 'hipaa compliance',
        referrer: 'google.com',
        sourcePagePath: '/pricing',
        landingPagePath: '/resources/guides/hipaa',
        initialReferrerHost: 'www.linkedin.com',
        initialUtmSource: 'linkedin',
        initialUtmMedium: 'social',
        initialUtmCampaign: 'q2',
        initialUtmContent: 'guide',
        initialUtmTerm: 'hipaa',
        ctaContext: 'resource-sidebar',
      }),
    )
  })

  it('strips query strings and email-like values from stored lead referrers', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
        referrer: 'https://example.com/path?email=patient@example.com',
      }),
    )

    expect(db._mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        referrer: 'example.com',
      }),
    )
  })

  it('upserts email subscriptions with the correct source', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({ email: 'admin@clinic.com', magnetSlug: 'newsletter' }),
    )

    expect(db._mocks.subscriptionValues).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'newsletter' }),
    )
  })

  it('enrolls lead-magnet captures in Sequencer after delivery', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(enrollSequencerSequenceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@clinic.com',
        sequenceSlug: 'phiguard-lead-magnet-nurture',
        externalId: expect.stringContaining(':baa-template'),
      }),
    )
  })

  it('keeps lead capture successful when Sequencer enrollment fails after email delivery', async () => {
    const leadId = faker.string.uuid()
    const sequencerError = new Error('Sequencer unavailable')
    const db = buildDbMock({ leadInsertRows: [{ id: leadId }] })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    enrollSequencerSequenceMock.mockRejectedValueOnce(sequencerError)

    const res = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ ok: true, leadId, id: leadId })
    expect(sendLeadMagnetDeliveryEmail).toHaveBeenCalledOnce()
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: sequencerError.message }),
      expect.objectContaining({
        surface: 'api',
        route: '/api/marketing/leads',
        operation: 'lead-magnet.sequencer-enroll',
        tags: { magnetSlug: 'baa-template' },
      }),
    )
  })

  it('does not enroll newsletter captures into a lead-magnet Sequencer flow', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({ email: 'admin@clinic.com', magnetSlug: 'newsletter' }),
    )

    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('uses the lead row for the current magnet when the email signed up for multiple magnets', async () => {
    const currentLead = { id: faker.string.uuid() }
    const wrongLead = { id: faker.string.uuid() }
    const db = buildDbMock({
      leadInsertRows: [{}],
      leadRows: [wrongLead],
      leadRowsBySlug: {
        'baa-template': currentLead,
      },
    })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({
        email: 'multi@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    const consentUpdateCondition = vi.mocked(db._mocks.updateWhere).mock.calls[0][0] as {
      value?: string
    }
    expect(consentUpdateCondition.value).toBe(currentLead.id)
    expect(consentUpdateCondition.value).not.toBe(wrongLead.id)
  })

  it('passes the unsubscribe URL token and normalized email to delivery email', async () => {
    const token = faker.string.uuid()
    const db = buildDbMock({
      subscriptionRow: {
        id: faker.string.uuid(),
        unsubscribeToken: token,
        subscribed: true,
      },
    })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    await handleLeadCapture(
      makeJsonRequest({
        email: 'Admin@Clinic.COM',
        magnetSlug: 'baa-template',
      }),
    )

    expect(sendLeadMagnetDeliveryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'admin@clinic.com',
        unsubscribeUrl: expect.stringContaining(token),
      }),
    )
  })

  it('returns a delivery_failed JSON error when email delivery fails', async () => {
    const deliveryError = new Error('SMTP timeout')
    const leadId = faker.string.uuid()
    const subscriptionId = faker.string.uuid()
    const db = buildDbMock({
      leadInsertRows: [{ id: leadId }],
      subscriptionRow: {
        id: subscriptionId,
        unsubscribeToken: faker.string.uuid(),
        subscribed: true,
      },
    })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    vi.mocked(sendLeadMagnetDeliveryEmail).mockRejectedValueOnce(deliveryError)

    const res = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({ error: 'delivery_failed' })
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: deliveryError.message }),
      expect.objectContaining({
        surface: 'api',
        route: '/api/marketing/leads',
        operation: 'lead-magnet.delivery-email',
      }),
    )
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
    expect(db.delete).toHaveBeenCalledTimes(2)
    expect(db._mocks.deleteWhere).toHaveBeenCalledWith(expect.objectContaining({ value: leadId }))
    expect(db._mocks.deleteWhere).toHaveBeenCalledWith(
      expect.objectContaining({ value: subscriptionId }),
    )
  })

  it('allows a lead capture retry after a delivery failure rollback', async () => {
    const failedLeadId = faker.string.uuid()
    const successfulLeadId = faker.string.uuid()
    const db = buildDbMock({
      leadInsertRows: [{ id: failedLeadId }],
      leadRowsBySlug: {
        'baa-template': { id: successfulLeadId },
      },
    })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    vi.mocked(sendLeadMagnetDeliveryEmail)
      .mockRejectedValueOnce(new Error('SMTP timeout'))
      .mockResolvedValueOnce(undefined)

    const failed = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )
    expect(failed.status).toBe(502)
    expect(db._mocks.deleteWhere).toHaveBeenCalledWith(
      expect.objectContaining({ value: failedLeadId }),
    )

    const nextLeadId = faker.string.uuid()
    const retryDb = buildDbMock({ leadInsertRows: [{ id: nextLeadId }] })
    vi.mocked(getMarketingDb).mockReturnValue(retryDb as never)

    const retry = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(retry.status).toBe(201)
    await expect(retry.json()).resolves.toEqual({ ok: true, leadId: nextLeadId, id: nextLeadId })
    expect(sendLeadMagnetDeliveryEmail).toHaveBeenCalledTimes(2)
  })

  it('redirects browser posts back to the resource with an error when email delivery fails', async () => {
    const deliveryError = new Error('SMTP timeout')
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)
    vi.mocked(sendLeadMagnetDeliveryEmail).mockRejectedValueOnce(deliveryError)

    const res = await handleLeadCapture(
      makeFormRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`${SITE}/resources/baa-template?error=delivery-failed`)
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: deliveryError.message }),
      expect.objectContaining({
        surface: 'api',
        route: '/api/marketing/leads',
        operation: 'lead-magnet.delivery-email',
      }),
    )
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('silently drops honeypot submissions without writing or sending', async () => {
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
        company_website: 'http://spam.example',
      }),
    )

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('returns the per-email throttle response without sending or enrolling', async () => {
    emailRateLimitMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(429)
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('rejects submissions that fail CAPTCHA verification with a 403 and no DB write', async () => {
    verifyCaptchaMock.mockResolvedValueOnce({ success: false, bypassed: false })
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeMarketingJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({ error: 'verification_failed' })
    expect(res.headers.get('access-control-allow-origin')).toBe(SITE)
    expect(db.insert).not.toHaveBeenCalled()
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('redirects browser posts with ?error=verification when CAPTCHA fails', async () => {
    verifyCaptchaMock.mockResolvedValueOnce({ success: false, bypassed: false })
    const db = buildDbMock()
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeFormRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`${SITE}/resources/baa-template?error=verification`)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('does not re-send or re-enroll on a duplicate (email, magnet) submission', async () => {
    const leadId = faker.string.uuid()
    const db = buildDbMock({
      leadInsertRows: [],
      leadRowsBySlug: {
        'baa-template': { id: leadId },
      },
    })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeJsonRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual({ ok: true, leadId, id: leadId })
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })

  it('redirects duplicate browser submissions without re-sending or re-enrolling', async () => {
    const db = buildDbMock({ leadInsertRows: [] })
    vi.mocked(getMarketingDb).mockReturnValue(db as never)

    const res = await handleLeadCapture(
      makeFormRequest({
        email: 'admin@clinic.com',
        magnetSlug: 'baa-template',
      }),
    )

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`${SITE}/resources/thank-you?slug=baa-template`)
    expect(sendLeadMagnetDeliveryEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequenceMock).not.toHaveBeenCalled()
  })
})
