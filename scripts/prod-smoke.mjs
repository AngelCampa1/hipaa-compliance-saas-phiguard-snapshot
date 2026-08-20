import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const envLocalPath = path.join(repoRoot, '.env.local')

loadDotEnvLocal()

const marketingBaseUrl = process.env.PROD_E2E_MARKETING_URL ?? 'https://phiguard.app'
const appBaseUrl = process.env.PROD_E2E_BASE_URL ?? 'https://my.phiguard.app'
const appEmail = process.env.PROD_E2E_EMAIL
const appPassword = process.env.PROD_E2E_PASSWORD

const checks = [
  [
    'app healthz responds',
    async () => {
      // Liveness only — /healthz is intentionally DB-free so monitors don't
      // wake Neon. Database reachability is asserted by the /readyz check below.
      const response = await fetch(`${appBaseUrl}/healthz`)
      expectOk(response, `${appBaseUrl}/healthz`)
      const body = await response.json()
      if (body?.ok !== true) {
        throw new Error(`Healthz returned an unhealthy payload: ${JSON.stringify(body)}`)
      }
    },
  ],
  [
    'app readyz reports database health',
    async () => {
      const response = await fetch(`${appBaseUrl}/readyz`)
      expectOk(response, `${appBaseUrl}/readyz`)
      const body = await response.json()
      if (body?.ok !== true || body?.checks?.database !== 'ok') {
        throw new Error(`Readyz returned an unhealthy payload: ${JSON.stringify(body)}`)
      }
    },
  ],
  [
    'privacy redirect without slash',
    () =>
      expectRedirect(
        `${marketingBaseUrl}/notice-of-privacy-practices`,
        `${marketingBaseUrl}/privacy`,
      ),
  ],
  [
    'privacy redirect with slash',
    () =>
      expectRedirect(
        `${marketingBaseUrl}/notice-of-privacy-practices/`,
        `${marketingBaseUrl}/privacy`,
      ),
  ],
  [
    'homepage CSP allows app origin',
    async () => {
      const response = await fetch(marketingBaseUrl, { redirect: 'manual' })
      expectOk(response, marketingBaseUrl)
      const csp = response.headers.get('content-security-policy') ?? ''
      if (!directiveAllows(csp, 'connect-src', appBaseUrl)) {
        throw new Error(`Homepage CSP does not include ${appBaseUrl} in connect-src`)
      }
      if (!directiveAllows(csp, 'form-action', appBaseUrl)) {
        throw new Error(`Homepage CSP does not include ${appBaseUrl} in form-action`)
      }
    },
  ],
  [
    'app login renders',
    async () => {
      const response = await fetch(`${appBaseUrl}/login`)
      expectOk(response, `${appBaseUrl}/login`)
      const html = await response.text()
      if (!/<h1[^>]*>[\s\S]*(sign in|log in|phiguard)/i.test(html)) {
        throw new Error('Login page did not render an expected h1')
      }
    },
  ],
  [
    'app session cookie uses 15-minute max age',
    async () => {
      let cookie

      try {
        const signIn = await signInToAppWithCookies()
        cookie = signIn.cookie
        expectSessionCookieMaxAge(signIn.setCookies)
      } finally {
        if (cookie) {
          await signOutOfApp(cookie)
        }
      }
    },
  ],
  [
    'app billing renders for the production E2E account',
    async () => {
      let cookie

      try {
        cookie = await signInToApp()
        const response = await fetch(`${appBaseUrl}/app/billing`, {
          headers: { cookie },
        })
        expectOk(response, `${appBaseUrl}/app/billing`)

        const html = await response.text()
        if (!/<h1[^>]*>[\s\S]*manage billing, trial access, and plan details/i.test(html)) {
          throw new Error('Billing page did not render the expected h1')
        }
      } finally {
        if (cookie) {
          await signOutOfApp(cookie)
        }
      }
    },
  ],
  [
    'unsubscribe heading structure',
    async () => {
      const response = await fetch(`${marketingBaseUrl}/unsubscribe`)
      expectOk(response, `${marketingBaseUrl}/unsubscribe`)
      const html = await response.text()
      const h1Count = (html.match(/<h1\b/gi) ?? []).length
      if (h1Count !== 1) {
        throw new Error(`Expected exactly one unsubscribe h1, found ${h1Count}`)
      }
      if (!/<h1[^>]*>[\s\S]*unsubscribe/i.test(html)) {
        throw new Error('Unsubscribe h1 was not found')
      }
    },
  ],
]

let failures = 0
for (const [name, check] of checks) {
  try {
    await check()
    console.log(`ok - ${name}`)
  } catch (error) {
    failures += 1
    console.error(`not ok - ${name}`)
    console.error(error instanceof Error ? error.message : error)
  }
}

if (failures > 0) {
  process.exit(1)
}

async function expectRedirect(url, expectedLocation) {
  const response = await fetch(url, { redirect: 'manual' })
  if (response.status !== 301 && response.status !== 308) {
    throw new Error(`${url} returned ${response.status}, expected redirect`)
  }
  const location = response.headers.get('location')
  if (location !== expectedLocation) {
    throw new Error(`${url} redirected to ${location}, expected ${expectedLocation}`)
  }
}

async function signInToApp() {
  const signIn = await signInToAppWithCookies()
  return signIn.cookie
}

async function signInToAppWithCookies() {
  if (!appEmail || !appPassword) {
    throw new Error('PROD_E2E_EMAIL and PROD_E2E_PASSWORD are required for app authenticated smoke')
  }

  const response = await fetch(`${appBaseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: appBaseUrl,
    },
    body: JSON.stringify({
      email: appEmail,
      password: appPassword,
    }),
  })
  expectOk(response, `${appBaseUrl}/api/auth/sign-in/email`)

  const setCookies = getSetCookies(response.headers)
  if (setCookies.length === 0) {
    throw new Error('Sign-in response did not set a session cookie')
  }

  return {
    cookie: setCookies.map((cookie) => cookie.split(';')[0]).join('; '),
    setCookies,
  }
}

async function signOutOfApp(cookie) {
  const response = await fetch(`${appBaseUrl}/api/auth/sign-out`, {
    method: 'POST',
    headers: {
      cookie,
      'content-type': 'application/json',
      origin: appBaseUrl,
    },
    body: JSON.stringify({}),
  })
  expectOk(response, `${appBaseUrl}/api/auth/sign-out`)
}

function getSetCookies(headers) {
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie()
  }

  const cookie = headers.get('set-cookie')
  return cookie ? [cookie] : []
}

function expectSessionCookieMaxAge(setCookies) {
  const sessionCookie = setCookies.find((cookie) =>
    /(^|;\s*)(?:__Secure-)?better-auth\.session_token=/i.test(cookie),
  )

  if (!sessionCookie) {
    throw new Error('Sign-in response did not include better-auth.session_token')
  }

  const maxAgeMatch = sessionCookie.match(/;\s*max-age=(\d+)(?:;|$)/i)
  if (!maxAgeMatch) {
    throw new Error('Session cookie did not include Max-Age')
  }

  const maxAgeSeconds = Number(maxAgeMatch[1])
  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds <= 0) {
    throw new Error(`Session cookie Max-Age was invalid: ${maxAgeMatch[1]}`)
  }

  if (maxAgeSeconds > 900) {
    throw new Error(`Session cookie Max-Age was ${maxAgeSeconds}s, expected at most 900s`)
  }
}

function loadDotEnvLocal() {
  if (!fs.existsSync(envLocalPath)) return

  const source = fs.readFileSync(envLocalPath, 'utf8')
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue

    process.env[key] = unwrapEnvValue(rawValue.trim())
  }
}

function unwrapEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function expectOk(response, url) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${url} returned ${response.status}`)
  }
}

function directiveAllows(csp, directiveName, expectedSource) {
  const directive = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${directiveName} `))

  if (!directive) {
    return false
  }

  return directive.split(/\s+/).slice(1).includes(expectedSource)
}
