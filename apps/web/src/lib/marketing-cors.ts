import { PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand'

const DEFAULT_MARKETING_ORIGINS = [
  PHIGUARD_PUBLIC_SITE_ORIGIN,
  PHIGUARD_PUBLIC_SITE_ORIGIN.replace('https://', 'https://www.'),
]

export function getMarketingSiteBaseUrl() {
  return process.env.MARKETING_SITE_URL ?? PHIGUARD_PUBLIC_SITE_ORIGIN
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, '')
}

function appendVary(headers: Headers, value: string) {
  const existing = headers.get('Vary')
  if (!existing) {
    headers.set('Vary', value)
    return
  }

  const values = existing.split(',').map((entry) => entry.trim().toLowerCase())
  if (!values.includes(value.toLowerCase())) {
    headers.set('Vary', `${existing}, ${value}`)
  }
}

function getAllowedMarketingOrigin(request: Request, siteBaseUrl: string) {
  const origin = request.headers.get('origin')
  if (!origin) return null

  const allowedOrigins = new Set([...DEFAULT_MARKETING_ORIGINS, normalizeOrigin(siteBaseUrl)])
  const normalizedOrigin = normalizeOrigin(origin)

  return allowedOrigins.has(normalizedOrigin) ? normalizedOrigin : null
}

export function withMarketingCors(
  response: Response,
  request: Request,
  siteBaseUrl = getMarketingSiteBaseUrl(),
) {
  const allowedOrigin = getAllowedMarketingOrigin(request, siteBaseUrl)
  if (!allowedOrigin) return response

  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', allowedOrigin)
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept')
  appendVary(headers, 'Origin')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function buildMarketingCorsPreflight(request: Request) {
  return withMarketingCors(new Response(null, { status: 204 }), request)
}
