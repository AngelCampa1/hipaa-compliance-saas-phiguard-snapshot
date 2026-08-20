/**
 * Server entry-point safety-net tests.
 *
 * Strategy: mock @tanstack/react-start/server so we can control whether
 * baseHandler (created by createStartHandler) resolves or throws. All other
 * side-effect modules (auth, Sentry, rate-limit, security-headers) are also
 * mocked so the test file stays self-contained and doesn't require a running
 * database or Sentry DSN.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@phiguard/auth'

const mockBaseHandler = vi.fn()
vi.mock('@tanstack/react-start/server', () => ({
  createStartHandler: () => mockBaseHandler,
  defaultStreamHandler: {},
}))

vi.mock('@phiguard/auth', () => ({
  auth: {
    handler: vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
  },
}))

const mockCaptureException = vi.fn()
const mockLogError = vi.fn()

vi.mock('@phiguard/audit', () => ({
  logger: {
    safe: { error: mockLogError },
    error: mockLogError,
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

const mockWithDbContext = vi.fn((fn: () => unknown) => fn())
vi.mock('@phiguard/db/server', () => ({
  withDbContext: mockWithDbContext,
}))

vi.mock('./lib/sentry', () => ({
  initSentryServer: vi.fn(),
  captureServerException: mockCaptureException,
}))

const mockApplySecurityHeaders = vi.fn((response: Response) => response)
vi.mock('./middleware/security-headers', () => ({
  applySecurityHeaders: mockApplySecurityHeaders,
}))

const mockRateLimitMiddleware = vi.fn().mockResolvedValue(null)
vi.mock('./middleware/rate-limit', () => ({
  createRateLimitMiddleware: () => mockRateLimitMiddleware,
}))

const mockGetLoginLockoutState = vi.fn()
const mockRecordFailedLoginForIdentifier = vi.fn()
const mockResetLoginLockoutForIdentifier = vi.fn()

vi.mock('./server/auth-lockout', () => ({
  getLoginLockoutState: mockGetLoginLockoutState,
  recordFailedLoginForIdentifier: mockRecordFailedLoginForIdentifier,
  resetLoginLockoutForIdentifier: mockResetLoginLockoutForIdentifier,
}))

async function importFetch() {
  vi.resetModules()
  const mod = await import('./server')
  return (mod.default as { fetch: (request: Request) => Promise<Response> }).fetch
}

function makeRequest(path = '/app/dashboard') {
  return new Request(`http://localhost${path}`)
}

describe('server handler safety net', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRateLimitMiddleware.mockResolvedValue(null)
    mockGetLoginLockoutState.mockResolvedValue({ locked: false, retryAfterSeconds: 0 })
    delete process.env.PHIGUARD_READ_ONLY_MODE
  })

  it('returns the baseHandler response on success', async () => {
    mockBaseHandler.mockResolvedValue(new Response(null, { status: 200 }))
    const fetch = await importFetch()
    const res = await fetch(makeRequest())
    expect(res.status).toBe(200)
  })

  it('returns 500 when baseHandler throws', async () => {
    mockBaseHandler.mockRejectedValue(new Error('boom'))
    const fetch = await importFetch()
    const res = await fetch(makeRequest())
    expect(res.status).toBe(500)
  })

  it('calls logger.safe.error when baseHandler throws', async () => {
    const boom = new Error('boom')
    mockBaseHandler.mockRejectedValue(boom)
    const fetch = await importFetch()
    await fetch(makeRequest('/app/tasks'))
    expect(mockLogError).toHaveBeenCalledOnce()
    const [obj, msg] = mockLogError.mock.calls[0]
    expect(obj).toMatchObject({ name: 'Error', path: '/app/tasks' })
    expect(obj).toHaveProperty('stackHash')
    expect(typeof obj.stackHash).toBe('string')
    expect(obj.stackHash).toHaveLength(12)
    expect(msg).toBe('server handler error')
  })

  it('calls captureServerException when baseHandler throws', async () => {
    const boom = new Error('sentry check')
    mockBaseHandler.mockRejectedValue(boom)
    const fetch = await importFetch()
    await fetch(makeRequest('/api/audit/export'))
    expect(mockCaptureException).toHaveBeenCalledWith(
      boom,
      expect.objectContaining({
        surface: 'api',
        route: '/api/audit/export',
        operation: 'tanstack.handler',
      }),
    )
  })

  it('500 response body contains a support error id and no error details', async () => {
    mockBaseHandler.mockRejectedValue(new Error('secret internal state'))
    const fetch = await importFetch()
    const res = await fetch(makeRequest())
    const body = await res.text()
    expect(body).toMatch(/^Something went wrong\. Please try again\./)
    expect(body).toMatch(/error ID err_[a-z0-9]{8}/)
    expect(body).not.toContain('secret internal state')
  })

  it('applies security headers on error response', async () => {
    mockBaseHandler.mockRejectedValue(new Error('boom'))
    const fetch = await importFetch()
    await fetch(makeRequest())
    expect(mockApplySecurityHeaders).toHaveBeenCalledOnce()
  })

  it('applies security headers on success response', async () => {
    mockBaseHandler.mockResolvedValue(new Response(null, { status: 200 }))
    const fetch = await importFetch()
    await fetch(makeRequest())
    expect(mockApplySecurityHeaders).toHaveBeenCalledOnce()
  })

  it.each([
    '/app/dashboard',
    '/api/audit/export',
    '/api/auth/session',
    '/partner/dashboard',
    '/partner/referral-code',
    '/partner/verify',
    '/accept-invite/inv_123',
    '/signup/check-email',
    '/login',
    '/forgot-password',
  ])('marks private and utility route %s as noindex nofollow', async (path) => {
    mockBaseHandler.mockResolvedValue(new Response(null, { status: 200 }))
    const fetch = await importFetch()
    const res = await fetch(makeRequest(path))

    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })

  it('does not read response bodies while marking private routes noindex', async () => {
    const response = new Response('ok', { status: 200 })
    Object.defineProperty(response, 'body', {
      get() {
        throw new TypeError('Illegal invocation')
      },
    })
    mockBaseHandler.mockResolvedValue(response)

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/marketing/leads'))

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })

  it('still marks private routes noindex when security header application cannot read the body', async () => {
    const response = new Response('ok', { status: 200 })
    Object.defineProperty(response, 'body', {
      get() {
        throw new TypeError('Illegal invocation')
      },
    })
    mockApplySecurityHeaders.mockImplementationOnce((res: Response) => {
      void res.body
      return res
    })
    mockBaseHandler.mockResolvedValue(response)

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/marketing/leads'))

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
  })

  it('rebuilds private responses to preserve noindex when headers are immutable', async () => {
    const response = new Response('ok', { status: 200 })
    vi.spyOn(response.headers, 'set').mockImplementation(() => {
      throw new TypeError('immutable headers')
    })
    mockBaseHandler.mockResolvedValue(response)

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/marketing/leads'))

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    await expect(res.text()).resolves.toBe('ok')
  })

  it('does not mark the app-domain public index page as a ranking target override', async () => {
    mockBaseHandler.mockResolvedValue(new Response(null, { status: 200 }))
    const fetch = await importFetch()
    const res = await fetch(makeRequest('/'))

    expect(res.headers.has('X-Robots-Tag')).toBe(false)
  })

  it('marks private rate-limit responses as noindex nofollow', async () => {
    mockRateLimitMiddleware.mockResolvedValueOnce(
      new Response('too many requests', { status: 429 }),
    )

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/audit/export'))

    expect(res.status).toBe(429)
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(mockBaseHandler).not.toHaveBeenCalled()
    expect(mockApplySecurityHeaders).toHaveBeenCalledOnce()
  })

  it('blocks mutating app requests when emergency read-only mode is enabled', async () => {
    process.env.PHIGUARD_READ_ONLY_MODE = 'true'
    mockBaseHandler.mockResolvedValue(new Response(null, { status: 200 }))

    const fetch = await importFetch()
    const res = await fetch(
      new Request('http://localhost/app/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'blocked' }),
      }),
    )

    expect(res.status).toBe(503)
    expect(await res.text()).toBe('PHIGuard is temporarily in read-only mode.')
    expect(res.headers.get('Retry-After')).toBe('300')
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(mockBaseHandler).not.toHaveBeenCalled()
  })

  it('allows read requests when emergency read-only mode is enabled', async () => {
    process.env.PHIGUARD_READ_ONLY_MODE = 'true'
    mockBaseHandler.mockResolvedValue(new Response('dashboard', { status: 200 }))

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/app/dashboard'))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('dashboard')
    expect(mockBaseHandler).toHaveBeenCalledOnce()
  })

  it('logs auth handler 5xx responses without reading or persisting response bodies', async () => {
    vi.mocked(auth.handler).mockResolvedValueOnce(
      new Response('sensitive auth payload', { status: 503 }),
    )

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/auth/session'))

    expect(res.status).toBe(503)
    expect(mockLogError).toHaveBeenCalledWith(
      {
        path: '/api/auth/session',
        status: 503,
      },
      'auth handler returned an error response',
    )
    expect(mockLogError).not.toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.anything(),
      }),
      expect.anything(),
    )
    expect(mockLogError.mock.calls.join(' ')).not.toContain('sensitive auth payload')
  })

  it('captures auth handler 5xx responses without response body details', async () => {
    vi.mocked(auth.handler).mockResolvedValueOnce(
      new Response('sensitive auth payload', { status: 503 }),
    )

    const fetch = await importFetch()
    await fetch(makeRequest('/api/auth/session'))

    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        surface: 'auth',
        route: '/api/auth/session',
        operation: 'auth.handler',
        status: 503,
      }),
    )
    expect(mockCaptureException.mock.calls.join(' ')).not.toContain('sensitive auth payload')
  })

  it('buffers auth POST bodies before handing the request to Better Auth', async () => {
    let receivedBody = ''
    let receivedRequest: Request | null = null
    const originalRequest = new Request('http://localhost/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    vi.mocked(auth.handler).mockImplementationOnce(async (request: Request) => {
      receivedRequest = request
      receivedBody = await request.text()
      return new Response(null, { status: 200 })
    })

    const fetch = await importFetch()
    const res = await fetch(originalRequest)

    expect(res.status).toBe(200)
    expect(receivedBody).toBe(JSON.stringify({ email: 'test@example.com' }))
    expect(receivedRequest).not.toBe(originalRequest)
  })

  it('returns 400 for malformed JSON auth requests without capturing a server error', async () => {
    const fetch = await importFetch()
    const res = await fetch(
      new Request('http://localhost/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: "{ email: 'owner@example.com' }",
      }),
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON request body' })
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(auth.handler).not.toHaveBeenCalled()
    expect(mockCaptureException).not.toHaveBeenCalled()
    expect(mockLogError).not.toHaveBeenCalled()
    expect(mockGetLoginLockoutState).not.toHaveBeenCalled()
  })

  it('returns 400 for empty JSON auth requests without calling Better Auth', async () => {
    const fetch = await importFetch()
    const res = await fetch(
      new Request('http://localhost/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '',
      }),
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON request body' })
    expect(auth.handler).not.toHaveBeenCalled()
    expect(mockCaptureException).not.toHaveBeenCalled()
    expect(mockLogError).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON on non-sign-in auth endpoints', async () => {
    const fetch = await importFetch()
    const res = await fetch(
      new Request('http://localhost/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: "{ email: 'owner@example.com' }",
      }),
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON request body' })
    expect(auth.handler).not.toHaveBeenCalled()
    expect(mockCaptureException).not.toHaveBeenCalled()
    expect(mockLogError).not.toHaveBeenCalled()
  })

  it.each([
    '/api/auth/organization/invite-member',
    '/api/auth/organization/update-member-role',
    '/api/auth/organization/remove-member',
    '/api/auth/organization/cancel-invitation',
  ])('blocks direct Better Auth organization mutation endpoint %s', async (path) => {
    const fetch = await importFetch()
    const res = await fetch(
      new Request(`http://localhost${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'org_admin' }),
      }),
    )

    expect(res.status).toBe(403)
    expect(await res.text()).toBe('Use PHIGuard organization management endpoints')
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(auth.handler).not.toHaveBeenCalled()
  })

  it('allows direct Better Auth non-organization auth endpoints', async () => {
    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/auth/session'))

    expect(res.status).toBe(200)
    expect(auth.handler).toHaveBeenCalledOnce()
  })

  it('blocks account sign-in attempts while the normalized identifier is locked', async () => {
    mockGetLoginLockoutState.mockResolvedValueOnce({ locked: true, retryAfterSeconds: 300 })

    const fetch = await importFetch()
    const res = await fetch(
      new Request('http://localhost/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'Owner@Example.com', password: 'wrong' }),
      }),
    )

    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('300')
    expect(await res.json()).toEqual({
      error: 'Too many sign-in attempts. Try again later.',
    })
    expect(mockGetLoginLockoutState).toHaveBeenCalledWith('Owner@Example.com')
    expect(auth.handler).not.toHaveBeenCalled()
  })

  it('records failed account sign-in attempts without logging the email', async () => {
    vi.mocked(auth.handler).mockResolvedValueOnce(new Response(null, { status: 401 }))

    const fetch = await importFetch()
    const res = await fetch(
      new Request('http://localhost/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'owner@example.com', password: 'wrong' }),
      }),
    )

    expect(res.status).toBe(401)
    expect(mockRecordFailedLoginForIdentifier).toHaveBeenCalledWith('owner@example.com')
    expect(mockLogError.mock.calls.join(' ')).not.toContain('owner@example.com')
  })

  it('resets account sign-in failures after a successful sign-in', async () => {
    vi.mocked(auth.handler).mockResolvedValueOnce(new Response(null, { status: 200 }))

    const fetch = await importFetch()
    await fetch(
      new Request('http://localhost/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'owner@example.com', password: 'correct' }),
      }),
    )

    expect(mockResetLoginLockoutForIdentifier).toHaveBeenCalledWith('owner@example.com')
  })

  it('does not log raw auth error messages', async () => {
    vi.mocked(auth.handler).mockRejectedValueOnce(new Error('user test@example.com failed signup'))

    const fetch = await importFetch()
    const res = await fetch(makeRequest('/api/auth/sign-up/email'))

    expect(res.status).toBe(500)
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Error',
        path: '/api/auth/sign-up/email',
      }),
      'auth handler threw',
    )
    expect(JSON.stringify(mockLogError.mock.calls)).not.toContain('user test@example.com failed signup')
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        surface: 'auth',
        route: '/api/auth/sign-up/email',
        operation: 'auth.handler',
      }),
    )
  })
})
