import { randomBytes } from 'node:crypto'
import { getObjectStoragePublicOrigin } from '@phiguard/audit'
import { isMockUploadsEnabled } from '../lib/s3'

/**
 * Security headers middleware for TanStack Start.
 *
 * TanStack Start uses the Web standard Request/Response API (not Hono),
 * so headers are applied by creating a new Response with a merged Headers
 * object rather than through a Hono middleware chain.
 *
 * HIPAA note: The strict CSP blocks all third-party JavaScript and external
 * connections from the authenticated app, preventing data exfiltration of PHI
 * via injected scripts or unauthorised network requests.
 */

// The CRM widget loader origin. Derived once so script-src and
// connect-src stay in sync - never hard-code the origin in two places.
const CRM_LOADER_ORIGIN = 'https://crm.example.com'

function buildContentSecurityPolicy(scriptNonce?: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  // The CRM widget script tag is injected at runtime via useEffect, so it
  // cannot carry the per-request nonce. Adding the loader origin to script-src
  // explicitly allows it even under strict-dynamic.
  const scriptSrc = isProduction
    ? `script-src 'self' ${CRM_LOADER_ORIGIN}${scriptNonce ? ` 'nonce-${scriptNonce}' 'strict-dynamic'` : ''}`
    : "script-src 'self' 'unsafe-inline'"

  const sentryConnectSrc =
    process.env.SENTRY_DSN || process.env.VITE_SENTRY_APP_DSN || process.env.VITE_SENTRY_DSN
    ? ' https://*.ingest.sentry.io https://*.ingest.us.sentry.io'
    : ''

  const objectStorageOrigin = getObjectStoragePublicOrigin()
  const storageConnectSrc =
    objectStorageOrigin && !isMockUploadsEnabled() ? ` ${objectStorageOrigin}` : ''
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${CRM_LOADER_ORIGIN}${sentryConnectSrc}${storageConnectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function buildSecurityHeaders(scriptNonce?: string): Record<string, string> {
  return {
    'Content-Security-Policy': buildContentSecurityPolicy(scriptNonce),
    // 2-year HSTS with subdomain coverage and preload eligibility
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  }
}

function createScriptNonce() {
  return randomBytes(16).toString('base64url')
}

function addScriptNonce(html: string, nonce: string) {
  return html.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`)
}

function getSafeNonceInjectionLength(html: string) {
  const lowerHtml = html.toLowerCase()
  const lastScriptStart = lowerHtml.lastIndexOf('<script')

  if (lastScriptStart >= 0 && lowerHtml.indexOf('>', lastScriptStart) === -1) {
    return lastScriptStart
  }

  const partialScriptPrefixStart = Math.max(0, html.length - '<script'.length + 1)
  const partialScriptTail = lowerHtml.slice(partialScriptPrefixStart)
  const partialTagOffset = partialScriptTail.lastIndexOf('<')
  const lastTagStart = partialTagOffset >= 0 ? partialScriptPrefixStart + partialTagOffset : -1

  if (lastTagStart >= 0 && '<script'.startsWith(lowerHtml.slice(lastTagStart))) {
    return lastTagStart
  }

  return html.length
}

function addScriptNonceStream(body: ReadableStream<Uint8Array>, nonce: string) {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let carry = ''

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        const html = carry + decoder.decode(chunk, { stream: true })
        const safeLength = getSafeNonceInjectionLength(html)
        const safeChunk = html.slice(0, safeLength)
        carry = html.slice(safeLength)

        if (safeChunk) {
          controller.enqueue(encoder.encode(addScriptNonce(safeChunk, nonce)))
        }
      },
      flush(controller) {
        const tail = carry + decoder.decode()
        if (tail) {
          controller.enqueue(encoder.encode(addScriptNonce(tail, nonce)))
        }
      },
    }),
  )
}

/**
 * Applies security headers to a Response by returning a new Response that
 * merges the existing headers with the security header set.
 */
export async function applySecurityHeaders(response: Response): Promise<Response> {
  const contentType = response.headers.get('Content-Type') ?? ''
  const isHtmlResponse = contentType.includes('text/html')
  const isProduction = process.env.NODE_ENV === 'production'
  const scriptNonce = isHtmlResponse && isProduction ? createScriptNonce() : undefined
  const body =
    isHtmlResponse && scriptNonce && response.body
      ? addScriptNonceStream(response.body, scriptNonce)
      : response.body
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(buildSecurityHeaders(scriptNonce))) {
    headers.set(name, value)
  }
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
