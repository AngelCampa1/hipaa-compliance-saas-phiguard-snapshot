import { afterEach, describe, it, expect, vi } from 'vitest'
import { applySecurityHeaders } from './security-headers'

function makeResponse(status = 200, body = 'OK') {
  return new Response(body, { status })
}

describe('applySecurityHeaders', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('sets Content-Security-Policy', async () => {
    const res = await applySecurityHeaders(makeResponse())
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy()
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("form-action 'self'")
  })

  it('CSP does not allow third-party scripts or unsafe-eval', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).not.toContain('unsafe-eval')
    expect(csp).not.toContain('unsafe-hashes')
    expect(csp).not.toContain('widgets.example.com')
    expect(csp).toContain("script-src 'self'")
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'")
    // No wildcard script source
    expect(csp).not.toMatch(/script-src.*\*/)
  })

  it('allows inline scripts outside production for local hydration', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
  })

  it('sets Strict-Transport-Security with 2-year max-age and preload', async () => {
    const res = await applySecurityHeaders(makeResponse())
    const hsts = res.headers.get('Strict-Transport-Security')!
    expect(hsts).toContain('max-age=63072000')
    expect(hsts).toContain('includeSubDomains')
    expect(hsts).toContain('preload')
  })

  it('sets X-Frame-Options to DENY', async () => {
    const res = await applySecurityHeaders(makeResponse())
    expect(res.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('sets X-Content-Type-Options to nosniff', async () => {
    const res = await applySecurityHeaders(makeResponse())
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('sets Referrer-Policy to strict-origin-when-cross-origin', async () => {
    const res = await applySecurityHeaders(makeResponse())
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })

  it('sets Permissions-Policy disabling sensitive APIs', async () => {
    const res = await applySecurityHeaders(makeResponse())
    const pp = res.headers.get('Permissions-Policy')!
    expect(pp).toContain('camera=()')
    expect(pp).toContain('microphone=()')
    expect(pp).toContain('geolocation=()')
    expect(pp).toContain('payment=()')
  })

  it('preserves original response status and body', async () => {
    const res = await applySecurityHeaders(new Response('hello', { status: 201 }))
    expect(res.status).toBe(201)
    expect(await res.text()).toBe('hello')
  })

  it('adds Sentry ingest origins to connect-src when SENTRY_DSN is set', async () => {
    vi.stubEnv('SENTRY_DSN', 'https://abc123@o123.ingest.sentry.io/456')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('https://*.ingest.sentry.io')
    expect(csp).toContain('https://*.ingest.us.sentry.io')
  })

  it('adds Sentry ingest origins to connect-src when the browser Sentry DSN is set', async () => {
    vi.stubEnv('SENTRY_DSN', '')
    vi.stubEnv('VITE_SENTRY_APP_DSN', 'https://abc123@o123.ingest.sentry.io/456')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('https://*.ingest.sentry.io')
    expect(csp).toContain('https://*.ingest.us.sentry.io')
  })

  it('does not add Sentry origins to connect-src when SENTRY_DSN is not set', async () => {
    vi.stubEnv('SENTRY_DSN', '')
    vi.stubEnv('VITE_SENTRY_APP_DSN', '')
    vi.stubEnv('VITE_SENTRY_DSN', '')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).not.toContain('sentry.io')
  })

  it('keeps the object storage origin when mock uploads are mis-set outside Playwright', async () => {
    vi.stubEnv('OBJECT_STORAGE_PUBLIC_ORIGIN', 'https://uploads.example')
    vi.stubEnv('ENABLE_MOCK_UPLOADS', 'true')
    vi.stubEnv('PLAYWRIGHT', '')

    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!

    expect(csp).toContain('https://uploads.example')
  })

  it('keeps PostHog ingest origins out of connect-src when app analytics is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).not.toContain('https://us.i.posthog.com')
  })

  it('allows the CRM loader origin in script-src', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toContain('https://crm.example.com')
    expect(csp).toMatch(/script-src[^;]*https:\/\/crm\.example\.com/)
  })

  it('allows the CRM loader origin in connect-src', async () => {
    const res = await applySecurityHeaders(makeResponse())
    const csp = res.headers.get('Content-Security-Policy')!
    expect(csp).toMatch(/connect-src[^;]*https:\/\/crm\.example\.com/)
  })

  it('preserves existing response headers not overridden by security headers', async () => {
    const original = new Response('ok', {
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await applySecurityHeaders(original)
    expect(res.headers.get('Content-Type')).toBe('application/json')
  })

  it('adds a nonce to the CSP and script tags for HTML bootstrap scripts in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const res = await applySecurityHeaders(
      new Response('<html><body><script>window.__BOOT__=true</script></body></html>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    )

    const csp = res.headers.get('Content-Security-Policy')!
    const body = await res.text()
    expect(csp).toContain("script-src 'self'")
    expect(csp).toMatch(/script-src 'self'[^;]*'nonce-[^']+'/)
    expect(csp).toContain("'strict-dynamic'")
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/)
    expect(body).toMatch(/<script nonce="[^"]+">window\.__BOOT__=true<\/script>/)
  })

  it('adds the same nonce to inline and module scripts in HTML responses', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const res = await applySecurityHeaders(
      new Response(
        '<html><body><script>window.__BOOT__=true</script><script type="module" src="/assets/app.js"></script></body></html>',
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      ),
    )

    const csp = res.headers.get('Content-Security-Policy')!
    const body = await res.text()
    const nonceMatch = csp.match(/'nonce-([^']+)'/)

    expect(nonceMatch?.[1]).toBeTruthy()
    expect(body).toContain(`<script nonce="${nonceMatch![1]}">window.__BOOT__=true</script>`)
    expect(body).toContain(
      `<script nonce="${nonceMatch![1]}" type="module" src="/assets/app.js"></script>`,
    )
  })

  it('injects script nonces without buffering streamed HTML responses', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const streamedHtml = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('<html><body><scr'))
        controller.enqueue(
          new TextEncoder().encode('ipt>window.__BOOT__=true</script></body></html>'),
        )
        controller.close()
      },
    })

    const res = await applySecurityHeaders(
      new Response(streamedHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    )

    const csp = res.headers.get('Content-Security-Policy')!
    const body = await res.text()

    expect(csp).toMatch(/script-src 'self'[^;]*'nonce-[^']+'/)
    expect(body).toMatch(/<script nonce="[^"]+">window\.__BOOT__=true<\/script>/)
  })

  it('injects script nonces when streamed chunks split across the script opening tag', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const streamedHtml = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of [
          '<html><body><',
          'scr',
          'ipt type="module">',
          'import("/assets/index.js")</script>',
          '</body></html>',
        ]) {
          controller.enqueue(new TextEncoder().encode(chunk))
        }
        controller.close()
      },
    })

    const res = await applySecurityHeaders(
      new Response(streamedHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    )

    const csp = res.headers.get('Content-Security-Policy')!
    const body = await res.text()
    const nonceMatch = csp.match(/'nonce-([^']+)'/)

    expect(nonceMatch?.[1]).toBeTruthy()
    expect(body).toContain(
      `<script nonce="${nonceMatch![1]}" type="module">import("/assets/index.js")</script>`,
    )
  })
})
