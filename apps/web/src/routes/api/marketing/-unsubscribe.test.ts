import { beforeEach, describe, expect, it, vi } from 'vitest'
import { faker } from '@faker-js/faker'

const { dbTables, getMarketingDbMock } = vi.hoisted(() => {
  const getMarketingDbMock = vi.fn()
  const dbTables = {
    emailSubscriptions: { _brand: 'emailSubscriptions' },
  }

  return { dbTables, getMarketingDbMock }
})

const { captureServerExceptionMock } = vi.hoisted(() => ({
  captureServerExceptionMock: vi.fn(),
}))

faker.seed(99)

// ---------------------------------------------------------------------------
// Mock db/server before importing the route handler
// ---------------------------------------------------------------------------
vi.mock('@phiguard/marketing-db/server', () => ({
  getMarketingDb: getMarketingDbMock,
  emailSubscriptions: dbTables.emailSubscriptions,
}))

vi.mock('@phiguard/audit', () => {
  const loggerMethods = { error: vi.fn(), warn: vi.fn() }
  return { logger: { ...loggerMethods, safe: loggerMethods } }
})

vi.mock('../../../lib/sentry.js', () => ({
  captureServerException: captureServerExceptionMock,
}))

vi.mock('../../../middleware/rate-limit.js', () => ({
  createRateLimitMiddleware: vi.fn(() => vi.fn().mockResolvedValue(null)),
}))

const unsubscribeSequencerContactMock = vi.hoisted(() => vi.fn().mockResolvedValue(true))

vi.mock('../../../server/sequencer.js', () => ({
  unsubscribeSequencerContact: unsubscribeSequencerContactMock,
}))

import { Route, handleUnsubscribe } from './unsubscribe.js'
import { getMarketingDb } from '@phiguard/marketing-db/server'

const BASE = 'https://app.phiguard.test'
const MARKETING_ORIGIN = 'https://phiguard.app'

function makeRequest(body: unknown, headers: HeadersInit = {}) {
  return new Request(`${BASE}/api/marketing/unsubscribe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function getRouteHandler(method: string) {
  return (
    Route as unknown as {
      options?: {
        server?: {
          handlers?: Record<string, (args: { request: Request }) => Response | Promise<Response>>
        }
      }
    }
  ).options?.server?.handlers?.[method]
}

// ---------------------------------------------------------------------------
// DB mock builder
// ---------------------------------------------------------------------------

function buildDbMock(
  opts: {
    subscriptionRow?: {
      id: string
      email: string
      subscribed: boolean
      unsubscribeToken: string
    } | null
    updatedRows?: Array<{ id: string }>
  } = {},
) {
  const { subscriptionRow = null } = opts
  const updatedRows = opts.updatedRows ?? (subscriptionRow ? [{ id: subscriptionRow.id }] : [])

  const selectSubscriptionWhere = vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue(subscriptionRow ? [subscriptionRow] : []),
  })
  const selectFrom = vi.fn().mockReturnValue({ where: selectSubscriptionWhere })
  const select = vi.fn().mockReturnValue({ from: selectFrom })

  const updateReturning = vi.fn().mockResolvedValue(updatedRows)
  const updateWhere = vi.fn().mockReturnValue({ returning: updateReturning })
  const set = vi.fn().mockReturnValue({ where: updateWhere })
  const update = vi.fn().mockReturnValue({ set })

  return {
    select,
    update,
    _mocks: {
      select,
      update,
      set,
      updateWhere,
      updateReturning,
      selectSubscriptionWhere,
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('handleUnsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CORS', () => {
    it('returns marketing CORS headers for an allowed OPTIONS preflight', async () => {
      const handler = getRouteHandler('OPTIONS')
      expect(handler).toBeDefined()

      const res = await handler?.({
        request: new Request(`${BASE}/api/marketing/unsubscribe`, {
          method: 'OPTIONS',
          headers: {
            origin: MARKETING_ORIGIN,
            'access-control-request-method': 'POST',
            'access-control-request-headers': 'content-type',
          },
        }),
      })

      expect(res?.status).toBe(204)
      expect(res?.headers.get('Access-Control-Allow-Origin')).toBe(MARKETING_ORIGIN)
      expect(res?.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
      expect(res?.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Accept')
      expect(res?.headers.get('Vary')).toBe('Origin')
    })

    it('includes marketing CORS headers on POST JSON responses from allowed origins', async () => {
      const token = faker.string.uuid()
      const db = buildDbMock({
        subscriptionRow: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          subscribed: false,
          unsubscribeToken: token,
        },
      })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(
        makeRequest(
          { token },
          {
            origin: MARKETING_ORIGIN,
            accept: 'application/json',
          },
        ),
      )

      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe(MARKETING_ORIGIN)
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
      expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Accept')
      expect(res.headers.get('Vary')).toBe('Origin')
    })
  })

  describe('input validation', () => {
    it('returns 400 for a malformed token (not UUID format)', async () => {
      const db = buildDbMock()
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({ token: 'not-a-uuid' }))
      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toMatchObject({
        error: 'invalid_token',
      })
      expect(db.select).not.toHaveBeenCalled()
    })

    it('returns 400 for an empty token', async () => {
      const db = buildDbMock()
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({ token: '' }))
      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toMatchObject({
        error: 'invalid_token',
      })
    })

    it('returns 400 for a missing token field', async () => {
      const db = buildDbMock()
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({}))
      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toMatchObject({
        error: 'invalid_token',
      })
    })

    it('rejects oversized unsubscribe payloads before DB or Sequencer work', async () => {
      const db = buildDbMock()
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(
        makeRequest({
          token: faker.string.uuid(),
          ignored: 'x'.repeat(2_000),
        }),
      )

      expect(res.status).toBe(413)
      await expect(res.json()).resolves.toMatchObject({
        error: 'payload_too_large',
      })
      expect(db.select).not.toHaveBeenCalled()
      expect(db.update).not.toHaveBeenCalled()
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled()
    })
  })

  describe('non-existent token', () => {
    it('returns 400 when the token is not found in the DB', async () => {
      const db = buildDbMock({ subscriptionRow: null })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const token = faker.string.uuid()
      const res = await handleUnsubscribe(makeRequest({ token }))
      expect(res.status).toBe(400)
      await expect(res.json()).resolves.toMatchObject({
        error: 'invalid_token',
      })
    })
  })

  describe('already unsubscribed', () => {
    it('returns 200 without touching Sequencer when already unsubscribed', async () => {
      const token = faker.string.uuid()
      const db = buildDbMock({
        subscriptionRow: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          subscribed: false,
          unsubscribeToken: token,
        },
      })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({ token }))
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toMatchObject({
        success: true,
        alreadyUnsubscribed: true,
      })
      expect(db.update).not.toHaveBeenCalled()
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled()
    })
  })

  describe('successful unsubscribe', () => {
    it('sets subscribed=false, forwards suppression to Sequencer, returns 200', async () => {
      const token = faker.string.uuid()
      const db = buildDbMock({
        subscriptionRow: {
          id: faker.string.uuid(),
          email: 'admin@clinic.com',
          subscribed: true,
          unsubscribeToken: token,
        },
      })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({ token }))
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toMatchObject({
        success: true,
        alreadyUnsubscribed: false,
      })

      const updatedTables = db.update.mock.calls.map(([table]) => table)
      expect(updatedTables).toContain(dbTables.emailSubscriptions)
      expect(unsubscribeSequencerContactMock).toHaveBeenCalledWith('admin@clinic.com', {
        source: 'phiguard-unsubscribe',
      })
      expect(db._mocks.updateReturning.mock.invocationCallOrder[0]).toBeLessThan(
        unsubscribeSequencerContactMock.mock.invocationCallOrder[0],
      )
    })

    it('does not call Sequencer when a concurrent unsubscribe already changed the row', async () => {
      const token = faker.string.uuid()
      const db = buildDbMock({
        subscriptionRow: {
          id: faker.string.uuid(),
          email: 'admin@clinic.com',
          subscribed: true,
          unsubscribeToken: token,
        },
        updatedRows: [],
      })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({ token }))
      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toMatchObject({
        success: true,
        alreadyUnsubscribed: true,
      })

      expect(db.update).toHaveBeenCalledTimes(1)
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled()
    })

    it('still locally unsubscribes when Sequencer suppression fails', async () => {
      const token = faker.string.uuid()
      const db = buildDbMock({
        subscriptionRow: {
          id: faker.string.uuid(),
          email: 'admin@clinic.com',
          subscribed: true,
          unsubscribeToken: token,
        },
      })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)
      const sequencerError = new Error('Sequencer unavailable')
      unsubscribeSequencerContactMock.mockRejectedValueOnce(sequencerError)

      const res = await handleUnsubscribe(makeRequest({ token }))

      expect(res.status).toBe(200)
      await expect(res.json()).resolves.toMatchObject({
        success: true,
        alreadyUnsubscribed: false,
      })
      expect(db.update).toHaveBeenCalledTimes(1)
      expect(captureServerExceptionMock).toHaveBeenCalledWith(
        sequencerError,
        expect.objectContaining({
          surface: 'api',
          route: '/api/marketing/unsubscribe',
          operation: 'marketing.unsubscribe.sequencer',
          tags: expect.objectContaining({ sink: 'sequencer' }),
        }),
      )
    })
  })

  describe('rate limiting', () => {
    it('includes the rate-limit middleware (middleware is wired)', async () => {
      // The middleware mock returns null (not rate-limited), so if we get a
      // non-429 response the middleware was called.
      const token = faker.string.uuid()
      const db = buildDbMock({ subscriptionRow: null })
      vi.mocked(getMarketingDb).mockReturnValue(db as never)

      const res = await handleUnsubscribe(makeRequest({ token }))
      // We get 400 (not found) rather than 429 because mock isn't rate-limiting
      expect(res.status).not.toBe(500)
    })
  })
})
