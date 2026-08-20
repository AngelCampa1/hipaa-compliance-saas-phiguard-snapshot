import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { getDb, partners } from '@phiguard/db/server'
import { sendPartnerApplicationEmail } from '@phiguard/email'
import { logger } from '@phiguard/audit'
import { EMAIL_RE } from '../../lib/validation.js'
import { createRateLimitMiddleware } from '../../middleware/rate-limit.js'
import {
  buildMarketingCorsPreflight,
  getMarketingSiteBaseUrl,
  withMarketingCors,
} from '../../lib/marketing-cors.js'

const partnerApplicationRateLimit = createRateLimitMiddleware({
  keyPrefix: 'partners-apply',
  maxTokens: 3,
  refillRate: 3,
  windowMs: 60_000,
})

const MAX_PARTNER_APPLICATION_BODY_BYTES = 12_000

function generateReferralCode(name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${slug}${suffix}`
}

export function handlePartnerApplicationOptions(request: Request): Response {
  return buildMarketingCorsPreflight(request)
}

function buildValidationResponse(error: string, wantsJsonResponse: boolean, siteBaseUrl: string) {
  if (wantsJsonResponse) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/partners?error=invalid-application`, 302)
}

function buildPayloadTooLargeResponse(wantsJsonResponse: boolean, siteBaseUrl: string) {
  if (wantsJsonResponse) {
    return new Response(JSON.stringify({ error: 'Partner application payload too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/partners?error=invalid-application`, 302)
}

async function readBoundedRequestBody(request: Request): Promise<ArrayBuffer | null> {
  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_PARTNER_APPLICATION_BODY_BYTES) {
    return null
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_PARTNER_APPLICATION_BODY_BYTES) {
    return null
  }

  return body
}

function readStringField(body: Record<string, unknown>, field: string) {
  const value = body[field]
  return typeof value === 'string' ? value.trim() : ''
}

function readFormStringField(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

function isUniqueViolation(error: unknown) {
  return Boolean(
    error && typeof error === 'object' && (error as { code?: unknown }).code === '23505',
  )
}

function buildPartnerJsonResponse(partnerId: string, status: number) {
  return new Response(
    JSON.stringify({
      ok: true,
      partnerId,
      id: partnerId,
      leadId: partnerId,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

function normalizePartnerWebsite(website: string): string | null {
  const trimmed = website.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('Website URL must start with https:// or http://')
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Website URL must start with https:// or http://')
  }

  return url.toString()
}

export async function handlePartnerApplication(request: Request): Promise<Response> {
  const siteBaseUrl = getMarketingSiteBaseUrl()
  const cors = (response: Response) => withMarketingCors(response, request, siteBaseUrl)
  const limited = await partnerApplicationRateLimit(request)
  if (limited) return cors(limited)

  const contentType = request.headers.get('content-type') ?? ''
  const accept = request.headers.get('accept') ?? ''
  const wantsJsonResponse =
    contentType.includes('application/json') || accept.includes('application/json')

  let name: string
  let email: string
  let company: string
  let website: string

  try {
    const body = await readBoundedRequestBody(request)
    if (!body) {
      return cors(buildPayloadTooLargeResponse(wantsJsonResponse, siteBaseUrl))
    }

    if (contentType.includes('application/json')) {
      const parsedBody = JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>
      name = readStringField(parsedBody, 'name')
      email = readStringField(parsedBody, 'email').toLowerCase()
      company = readStringField(parsedBody, 'company')
      website = readStringField(parsedBody, 'website')
    } else {
      const formData = await new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body,
      }).formData()
      name = readFormStringField(formData, 'name')
      email = readFormStringField(formData, 'email').toLowerCase()
      company = readFormStringField(formData, 'company')
      website = readFormStringField(formData, 'website')
    }
  } catch {
    return cors(buildValidationResponse('Invalid request body', wantsJsonResponse, siteBaseUrl))
  }

  if (!name || !email || !company) {
    return cors(
      buildValidationResponse(
        'name, email, and company are required',
        wantsJsonResponse,
        siteBaseUrl,
      ),
    )
  }

  if (!EMAIL_RE.test(email)) {
    return cors(buildValidationResponse('Invalid email address', wantsJsonResponse, siteBaseUrl))
  }

  let normalizedWebsite: string | null
  try {
    normalizedWebsite = normalizePartnerWebsite(website)
  } catch (err) {
    return cors(buildValidationResponse((err as Error).message, wantsJsonResponse, siteBaseUrl))
  }

  const db = getDb()

  const [existingPartner] = await db
    .select({ id: partners.id })
    .from(partners)
    .where(eq(partners.email, email))
    .limit(1)

  if (existingPartner) {
    if (!wantsJsonResponse) {
      return cors(Response.redirect(`${siteBaseUrl}/partners?applied=1`, 302))
    }

    return cors(buildPartnerJsonResponse(existingPartner.id, 200))
  }

  // Generate a unique referral code
  let referralCode = generateReferralCode(name)
  let referralCodeLookupAttempts = 0
  while (referralCodeLookupAttempts < 10) {
    const [existing] = await db
      .select({ id: partners.id })
      .from(partners)
      .where(eq(partners.referralCode, referralCode))
      .limit(1)
    if (!existing) break
    referralCode = generateReferralCode(name)
    referralCodeLookupAttempts++
  }

  let partner: { id: string } | null = null
  let insertAttempts = 0
  while (!partner && insertAttempts < 10) {
    try {
      const [insertedPartner] = await db
        .insert(partners)
        .values({
          name,
          email,
          company,
          website: normalizedWebsite,
          referralCode,
          status: 'pending',
        })
        .returning()
      if (!insertedPartner) {
        throw new Error('Partner application could not be saved')
      }
      partner = insertedPartner
      break
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error
      }

      const [racedPartner] = await db
        .select({ id: partners.id })
        .from(partners)
        .where(eq(partners.email, email))
        .limit(1)

      if (racedPartner) {
        if (!wantsJsonResponse) {
          return cors(Response.redirect(`${siteBaseUrl}/partners?applied=1`, 302))
        }

        return cors(buildPartnerJsonResponse(racedPartner.id, 200))
      }

      referralCode = generateReferralCode(name)
      insertAttempts++
    }
  }

  if (!partner) {
    throw new Error('Partner application could not be saved')
  }

  try {
    await sendPartnerApplicationEmail({
      toEmail: email,
      partnerName: name,
      company,
    })
  } catch (err) {
    logger.warn(
      {
        partnerId: partner.id,
        errName: err instanceof Error ? err.name : 'UnknownError',
      },
      'partner application confirmation email failed',
    )
  }

  if (!wantsJsonResponse) {
    return cors(Response.redirect(`${siteBaseUrl}/partners?applied=1`, 302))
  }

  return cors(buildPartnerJsonResponse(partner.id, 201))
}

export const Route = createFileRoute('/api/partners/apply')({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => handlePartnerApplicationOptions(request),
      POST: async ({ request }) => handlePartnerApplication(request),
    },
  },
})
