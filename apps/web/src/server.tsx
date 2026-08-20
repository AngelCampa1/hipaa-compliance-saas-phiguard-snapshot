import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createHash } from 'node:crypto'
import { auth } from '@phiguard/auth'
import { logger } from '@phiguard/audit'
import { withDbContext } from '@phiguard/db/server'
import { getReportableErrorMessage, makeTrackingId } from './lib/error-reporting'
import { captureServerException, initSentryServer } from './lib/sentry'
import { applySecurityHeaders } from './middleware/security-headers'
import { createRateLimitMiddleware } from './middleware/rate-limit'
import {
  getLoginLockoutState,
  recordFailedLoginForIdentifier,
  resetLoginLockoutForIdentifier,
} from './server/auth-lockout'

// Initialise Sentry at process start - must run before any request handling.
// initSentryServer is a no-op when SENTRY_DSN is not set.
initSentryServer(process.env.SENTRY_API_DSN ?? process.env.SENTRY_DSN)

// Rate limit middleware instances
const authRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth',
  maxTokens: 10,
  refillRate: 10,
  windowMs: 60_000,
})
const apiRateLimit = createRateLimitMiddleware({
  keyPrefix: 'api',
  maxTokens: 100,
  refillRate: 100,
  windowMs: 60_000,
})

const baseHandler = createStartHandler(defaultStreamHandler)

async function prepareAuthRequest(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return request
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  const shouldBufferBody =
    contentType.includes('application/json') ||
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('text/plain')

  if (!shouldBufferBody) {
    return request
  }

  const body = await request.clone().text()

  return new Request(request.url, {
    method: request.method,
    headers: new Headers(request.headers),
    body,
  })
}

async function rejectMalformedAuthJsonBody(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }

  const body = await request.clone().text()
  try {
    JSON.parse(body)
    return null
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

function safeCaptureException(
  error: unknown,
  context?: Parameters<typeof captureServerException>[1],
) {
  try {
    captureServerException(error, context)
  } catch {
    // Never let telemetry failures turn a handled request error into a worker crash.
  }
}

function safeLogError(payload: Record<string, unknown>, message: string) {
  try {
    logger.safe.error(payload, message)
  } catch {
    // Logging must not break the request path.
  }
}

async function safeApplySecurityHeaders(response: Response) {
  try {
    return await applySecurityHeaders(response)
  } catch {
    return response
  }
}

function shouldNoindexPath(path: string) {
  const matchesPath = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`)

  return (
    path === '/login' ||
    path === '/signup' ||
    path === '/signup/check-email' ||
    path === '/forgot-password' ||
    matchesPath('/partner') ||
    matchesPath('/app') ||
    matchesPath('/api') ||
    matchesPath('/accept-invite')
  )
}

function isEmergencyReadOnlyModeEnabled() {
  const value = process.env.PHIGUARD_READ_ONLY_MODE?.toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

function isReadOnlyMethod(method: string) {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
}

function makeReadOnlyModeResponse() {
  return new Response('PHIGuard is temporarily in read-only mode.', {
    status: 503,
    headers: {
      'Retry-After': '300',
    },
  })
}

function isEmailSignInPath(path: string, method: string) {
  return method === 'POST' && path === '/api/auth/sign-in/email'
}

function isBlockedDirectOrganizationMutation(path: string, method: string) {
  return (
    path.startsWith('/api/auth/organization/') &&
    !isReadOnlyMethod(method)
  )
}

async function readEmailSignInIdentifier(request: Request) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  const body = await request.clone().text()

  if (!body) {
    return null
  }

  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(body) as { email?: unknown }
      return typeof parsed.email === 'string' ? parsed.email : null
    } catch {
      return null
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const parsed = new URLSearchParams(body)
    return parsed.get('email')
  }

  return null
}

function makeAccountLockoutResponse(retryAfterSeconds: number) {
  return new Response(JSON.stringify({ error: 'Too many sign-in attempts. Try again later.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfterSeconds),
    },
  })
}

async function applyResponseHeaders(response: Response, path: string) {
  const secured = await safeApplySecurityHeaders(response)

  if (!shouldNoindexPath(path)) {
    return secured
  }

  try {
    secured.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return secured
  } catch {
    const headers = new Headers(secured.headers)
    headers.set('X-Robots-Tag', 'noindex, nofollow')

    try {
      return new Response(secured.body, {
        status: secured.status,
        statusText: secured.statusText,
        headers,
      })
    } catch {
      // Some runtime responses can expose immutable headers and illegal body
      // access. In that rare case, keep the original response rather than
      // crashing the Worker while adding a best-effort robots header.
      return secured
    }
  }
}

async function handleRequestImpl(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname

  if (isEmergencyReadOnlyModeEnabled() && !isReadOnlyMethod(request.method)) {
    return await applyResponseHeaders(makeReadOnlyModeResponse(), path)
  }

  // Apply stricter rate limiting to authentication routes
  if (path === '/login' || path === '/signup' || path.startsWith('/api/auth/')) {
    const limited = await authRateLimit(request)
    if (limited) return await applyResponseHeaders(limited, path)
  }

  // Apply standard rate limiting to API routes (auth routes already handled above)
  else if (path.startsWith('/api/')) {
    const limited = await apiRateLimit(request)
    if (limited) return await applyResponseHeaders(limited, path)
  }

  if (path.startsWith('/api/auth/')) {
    if (isBlockedDirectOrganizationMutation(path, request.method)) {
      return await applyResponseHeaders(
        new Response('Use PHIGuard organization management endpoints', { status: 403 }),
        path,
      )
    }

    try {
      const authRequest = await prepareAuthRequest(request)
      const malformedJsonResponse = await rejectMalformedAuthJsonBody(authRequest)
      if (malformedJsonResponse) {
        return await applyResponseHeaders(malformedJsonResponse, path)
      }

      const emailSignInIdentifier = isEmailSignInPath(path, request.method)
        ? await readEmailSignInIdentifier(authRequest)
        : null

      if (emailSignInIdentifier) {
        const lockout = await getLoginLockoutState(emailSignInIdentifier)
        if (lockout.locked) {
          return await applyResponseHeaders(
            makeAccountLockoutResponse(lockout.retryAfterSeconds),
            path,
          )
        }
      }

      const response = await auth.handler(authRequest)

      if (emailSignInIdentifier) {
        if (response.ok) {
          await resetLoginLockoutForIdentifier(emailSignInIdentifier)
        } else if (response.status >= 400 && response.status < 500) {
          await recordFailedLoginForIdentifier(emailSignInIdentifier)
        }
      }

      if (response.status >= 500) {
        safeCaptureException(new Error('Auth handler returned an error response'), {
          surface: 'auth',
          route: path,
          operation: 'auth.handler',
          status: response.status,
        })
        safeLogError(
          {
            path,
            status: response.status,
          },
          'auth handler returned an error response',
        )
      }

      return await applyResponseHeaders(response, path)
    } catch (err) {
      const trackingId = makeTrackingId()
      safeCaptureException(err, {
        surface: 'auth',
        route: path,
        operation: 'auth.handler',
        trackingId,
      })
      safeLogError(
        {
          name: err instanceof Error ? err.name : 'UnknownError',
          stackHash:
            err instanceof Error && err.stack
              ? createHash('sha1').update(err.stack).digest('hex').slice(0, 12)
              : 'no-stack',
          path,
          trackingId,
        },
        'auth handler threw',
      )
      return await applyResponseHeaders(
        new Response(getReportableErrorMessage(trackingId), { status: 500 }),
        path,
      )
    }
  }

  // Run the TanStack Start handler - wrapped in a safety net so any unhandled
  // rejection produces a clean 500 rather than crashing the process.
  let response: Response
  try {
    response = await baseHandler(request)
  } catch (err) {
    const trackingId = makeTrackingId()
    safeCaptureException(err, {
      surface: path.startsWith('/api/') ? 'api' : 'app',
      route: path,
      operation: 'tanstack.handler',
      trackingId,
    })
    safeLogError(
      {
        name: err instanceof Error ? err.name : 'UnknownError',
        stackHash:
          err instanceof Error && err.stack
            ? createHash('sha1').update(err.stack).digest('hex').slice(0, 12)
            : 'no-stack',
        path: new URL(request.url).pathname,
        trackingId,
      },
      'server handler error',
    )
    return await applyResponseHeaders(
      new Response(getReportableErrorMessage(trackingId), { status: 500 }),
      path,
    )
  }

  // Apply security headers to every response
  return await applyResponseHeaders(response, path)
}

function handleRequest(request: Request): Promise<Response> {
  return withDbContext(() => handleRequestImpl(request))
}

export default {
  fetch: handleRequest,
}
