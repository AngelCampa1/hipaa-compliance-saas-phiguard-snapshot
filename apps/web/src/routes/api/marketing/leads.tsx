import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { getMarketingDb, marketingLeads, emailSubscriptions } from '@phiguard/marketing-db/server'
import {
  isLeadCaptureCtaContext,
  isLeadCaptureSlug,
  isLeadMagnetSlug,
  NEWSLETTER_SLUG,
} from '@phiguard/lead-magnets'
import { sendLeadMagnetDeliveryEmail } from '@phiguard/email'
import { logger } from '@phiguard/audit'
import {
  createIdentifierRateLimitMiddleware,
  createRateLimitMiddleware,
} from '../../../middleware/rate-limit.js'
import { createD1RateLimitStore } from '../../../middleware/d1-rate-limit-store.js'
import { EMAIL_RE, LEAD_MAGNET_TITLES } from '../../../lib/validation.js'
import { getLeadMagnetsBucketName } from '@phiguard/audit'
import { buildLeadMagnetDownloadUrl } from '../../../lib/s3.js'
import { verifyCaptcha } from '../../../lib/captcha.js'
import { captureServerException } from '../../../lib/sentry.js'
import {
  buildMarketingCorsPreflight,
  getMarketingSiteBaseUrl,
  withMarketingCors,
} from '../../../lib/marketing-cors.js'
import { enrollSequencerSequence } from '../../../server/sequencer.js'

const SLUG_RE = /^[a-z0-9-]{1,100}$/
const EMAIL_VALUE_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const MAX_LEAD_CAPTURE_BODY_BYTES = 16 * 1024

// Marketing-form throttling lives on Cloudflare D1 (not Neon): the bucket store
// is the same database as the leads it protects, so abuse checks never wake the
// product-app Postgres.
const leadsRateLimitStore = createD1RateLimitStore()

const leadsRateLimit = createRateLimitMiddleware(
  {
    keyPrefix: 'leads',
    maxTokens: 5,
    refillRate: 3,
    windowMs: 60_000,
  },
  leadsRateLimitStore,
)

// Per-victim throttle keyed on the normalized email, so one address can't be
// bombed even when the abuse rotates source IPs. Burst of 3, then refill only
// 1 token per 10 min so a sustained attack on a single address is capped low.
const leadsEmailRateLimit = createIdentifierRateLimitMiddleware(
  {
    keyPrefix: 'leads-email',
    maxTokens: 3,
    refillRate: 1,
    windowMs: 600_000,
  },
  leadsRateLimitStore,
)

// Hidden field humans never fill. A non-empty value means a bot autofilled the
// form, so we drop the submission while returning a success-shaped response.
const HONEYPOT_FIELD = 'company_website'

export function handleLeadCaptureOptions(request: Request): Response {
  return buildMarketingCorsPreflight(request)
}

function buildUnknownResourceResponse(siteBaseUrl: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'Unknown resource' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/resources`, 302)
}

function buildInvalidRequestResponse(siteBaseUrl: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/resources`, 302)
}

function buildPayloadTooLargeResponse(siteBaseUrl: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/resources?error=payload-too-large`, 302)
}

function buildInvalidEmailResponse(siteBaseUrl: string, magnetSlug: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'Valid email is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/resources/${magnetSlug}?error=invalid-email`, 302)
}

function buildInvalidContextResponse(siteBaseUrl: string, magnetSlug: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'Unknown CTA context' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/resources/${magnetSlug}`, 302)
}

function buildDeliveryFailedResponse(fallbackUrl: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'delivery_failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const redirectUrl = new URL(fallbackUrl)
  redirectUrl.searchParams.set('error', 'delivery-failed')
  return Response.redirect(redirectUrl.toString(), 302)
}

function buildVerificationFailedResponse(siteBaseUrl: string, magnetSlug: string, isJson: boolean) {
  if (isJson) {
    return new Response(JSON.stringify({ error: 'verification_failed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(`${siteBaseUrl}/resources/${magnetSlug}?error=verification`, 302)
}

function buildLeadSuccessResponse(
  siteBaseUrl: string,
  magnetSlug: string,
  isJson: boolean,
  leadId?: string | null,
) {
  if (isJson) {
    return new Response(JSON.stringify(leadId ? { ok: true, leadId, id: leadId } : { ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.redirect(
    `${siteBaseUrl}/resources/thank-you?slug=${encodeURIComponent(magnetSlug)}`,
    302,
  )
}

function toCaptureSafeError(error: unknown) {
  return new Error(error instanceof Error ? error.message : String(error))
}

function readStringField(body: Record<string, unknown>, field: string) {
  const value = body[field]
  return typeof value === 'string' ? value.trim() : ''
}

function readFormStringField(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

function toSafeReferrerHost(referrer: string | undefined) {
  if (!referrer) return undefined

  try {
    const host = new URL(referrer).host
    return host && !EMAIL_VALUE_RE.test(host) ? host : undefined
  } catch {
    const trimmed = referrer.trim()
    if (!trimmed || trimmed.includes('/') || EMAIL_VALUE_RE.test(trimmed)) return undefined
    return trimmed
  }
}

async function readBoundedLeadCaptureBody(request: Request) {
  const contentLength = request.headers.get('content-length')
  const parsedContentLength = contentLength ? Number(contentLength) : null
  if (
    parsedContentLength !== null &&
    Number.isFinite(parsedContentLength) &&
    parsedContentLength > MAX_LEAD_CAPTURE_BODY_BYTES
  ) {
    return null
  }

  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_LEAD_CAPTURE_BODY_BYTES) {
    return null
  }

  return body
}

async function rollbackFailedLeadDelivery(
  db: ReturnType<typeof getMarketingDb>,
  input: {
    leadId: string | null
    insertedSubscriptionId: string | null
    magnetSlug: string
  },
) {
  try {
    if (input.leadId) {
      await db.delete(marketingLeads).where(eq(marketingLeads.id, input.leadId))
    }

    if (input.insertedSubscriptionId) {
      await db
        .delete(emailSubscriptions)
        .where(eq(emailSubscriptions.id, input.insertedSubscriptionId))
    }
  } catch (err) {
    captureServerException(toCaptureSafeError(err), {
      surface: 'api',
      route: '/api/marketing/leads',
      operation: 'lead-magnet.delivery-rollback',
      tags: { magnetSlug: input.magnetSlug },
    })
    logger.safe.error(
      {
        magnetSlug: input.magnetSlug,
        errMessage: err instanceof Error ? err.message : String(err),
      },
      'lead magnet delivery rollback failed',
    )
  }
}

async function findLeadId(
  db: ReturnType<typeof getMarketingDb>,
  email: string,
  magnetSlug: string,
) {
  const leadRows = await db
    .select({ id: marketingLeads.id })
    .from(marketingLeads)
    .where(and(eq(marketingLeads.email, email), eq(marketingLeads.magnetSlug, magnetSlug)))
    .limit(1)

  return leadRows[0]?.id ?? null
}

export async function handleLeadCapture(request: Request): Promise<Response> {
  const siteBaseUrl = getMarketingSiteBaseUrl()
  const cors = (response: Response) => withMarketingCors(response, request, siteBaseUrl)
  const limited = await leadsRateLimit(request)
  if (limited) return cors(limited)

  const contentType = request.headers.get('content-type') ?? ''
  const accept = request.headers.get('accept') ?? ''
  const isJsonRequestBody = contentType.includes('application/json')
  const wantsJsonResponse = isJsonRequestBody || accept.includes('application/json')

  let email: string
  let magnetSlug: string
  let utmSource: string | undefined
  let utmMedium: string | undefined
  let utmCampaign: string | undefined
  let utmContent: string | undefined
  let utmTerm: string | undefined
  let referrer: string | undefined
  let sourcePagePath: string | undefined
  let landingPagePath: string | undefined
  let initialReferrerHost: string | undefined
  let initialUtmSource: string | undefined
  let initialUtmMedium: string | undefined
  let initialUtmCampaign: string | undefined
  let initialUtmContent: string | undefined
  let initialUtmTerm: string | undefined
  let ctaContext: string | undefined
  let honeypot: string | undefined
  let captchaToken: string | undefined

  const rawBody = await readBoundedLeadCaptureBody(request)
  if (rawBody === null) {
    return cors(buildPayloadTooLargeResponse(siteBaseUrl, wantsJsonResponse))
  }

  try {
    if (isJsonRequestBody) {
      const body = JSON.parse(new TextDecoder().decode(rawBody)) as Record<string, unknown>
      email = readStringField(body, 'email').toLowerCase()
      magnetSlug = readStringField(body, 'magnetSlug')
      utmSource = readStringField(body, 'utm_source') || undefined
      utmMedium = readStringField(body, 'utm_medium') || undefined
      utmCampaign = readStringField(body, 'utm_campaign') || undefined
      utmContent = readStringField(body, 'utm_content') || undefined
      utmTerm = readStringField(body, 'utm_term') || undefined
      referrer = readStringField(body, 'referrer') || undefined
      sourcePagePath = readStringField(body, 'source_page_path') || undefined
      landingPagePath = readStringField(body, 'landing_page_path') || undefined
      initialReferrerHost = readStringField(body, 'initial_referrer_host') || undefined
      initialUtmSource = readStringField(body, 'initial_utm_source') || undefined
      initialUtmMedium = readStringField(body, 'initial_utm_medium') || undefined
      initialUtmCampaign = readStringField(body, 'initial_utm_campaign') || undefined
      initialUtmContent = readStringField(body, 'initial_utm_content') || undefined
      initialUtmTerm = readStringField(body, 'initial_utm_term') || undefined
      ctaContext = readStringField(body, 'cta_context') || undefined
      honeypot = readStringField(body, HONEYPOT_FIELD) || undefined
      captchaToken = readStringField(body, 'captcha-response') || undefined
    } else {
      const formData = await new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: rawBody,
      }).formData()
      email = readFormStringField(formData, 'email').toLowerCase()
      magnetSlug = readFormStringField(formData, 'magnetSlug')
      utmSource = readFormStringField(formData, 'utm_source') || undefined
      utmMedium = readFormStringField(formData, 'utm_medium') || undefined
      utmCampaign = readFormStringField(formData, 'utm_campaign') || undefined
      utmContent = readFormStringField(formData, 'utm_content') || undefined
      utmTerm = readFormStringField(formData, 'utm_term') || undefined
      referrer = readFormStringField(formData, 'referrer') || undefined
      sourcePagePath = readFormStringField(formData, 'source_page_path') || undefined
      landingPagePath = readFormStringField(formData, 'landing_page_path') || undefined
      initialReferrerHost = readFormStringField(formData, 'initial_referrer_host') || undefined
      initialUtmSource = readFormStringField(formData, 'initial_utm_source') || undefined
      initialUtmMedium = readFormStringField(formData, 'initial_utm_medium') || undefined
      initialUtmCampaign = readFormStringField(formData, 'initial_utm_campaign') || undefined
      initialUtmContent = readFormStringField(formData, 'initial_utm_content') || undefined
      initialUtmTerm = readFormStringField(formData, 'initial_utm_term') || undefined
      ctaContext = readFormStringField(formData, 'cta_context') || undefined
      honeypot = readFormStringField(formData, HONEYPOT_FIELD) || undefined
      captchaToken = readFormStringField(formData, 'captcha-response') || undefined
    }
  } catch {
    return cors(buildInvalidRequestResponse(siteBaseUrl, wantsJsonResponse))
  }

  if (!SLUG_RE.test(magnetSlug) || !isLeadCaptureSlug(magnetSlug)) {
    return cors(buildUnknownResourceResponse(siteBaseUrl, wantsJsonResponse))
  }

  const magnetTitle = LEAD_MAGNET_TITLES[magnetSlug]
  if (!magnetTitle) {
    return cors(buildUnknownResourceResponse(siteBaseUrl, wantsJsonResponse))
  }

  if (!email || !EMAIL_RE.test(email)) {
    return cors(buildInvalidEmailResponse(siteBaseUrl, magnetSlug, wantsJsonResponse))
  }

  if (ctaContext && !isLeadCaptureCtaContext(ctaContext)) {
    return cors(buildInvalidContextResponse(siteBaseUrl, magnetSlug, wantsJsonResponse))
  }

  // Honeypot: a filled hidden field means a bot. Return a success-shaped
  // response so detection isn't revealed, but write nothing and send nothing.
  if (honeypot) {
    return cors(buildLeadSuccessResponse(siteBaseUrl, magnetSlug, wantsJsonResponse))
  }

  const captcha = await verifyCaptcha(
    captchaToken,
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
  )
  if (!captcha.success) {
    return cors(buildVerificationFailedResponse(siteBaseUrl, magnetSlug, wantsJsonResponse))
  }

  const emailLimited = await leadsEmailRateLimit(email)
  if (emailLimited) return cors(emailLimited)

  const db = getMarketingDb()
  const cap = (s: string | undefined, max = 2000) => s?.slice(0, max)
  const now = new Date().toISOString()

  const insertedLeads = await db
    .insert(marketingLeads)
    .values({
      email,
      magnetSlug,
      utmSource: cap(utmSource),
      utmMedium: cap(utmMedium),
      utmCampaign: cap(utmCampaign),
      utmContent: cap(utmContent),
      utmTerm: cap(utmTerm),
      referrer: cap(toSafeReferrerHost(referrer), 255),
      sourcePagePath: cap(sourcePagePath, 500),
      landingPagePath: cap(landingPagePath, 500),
      initialReferrerHost: cap(initialReferrerHost, 255),
      initialUtmSource: cap(initialUtmSource),
      initialUtmMedium: cap(initialUtmMedium),
      initialUtmCampaign: cap(initialUtmCampaign),
      initialUtmContent: cap(initialUtmContent),
      initialUtmTerm: cap(initialUtmTerm),
      ctaContext: ctaContext ? cap(ctaContext, 120) : undefined,
    })
    .onConflictDoNothing()
    .returning()

  // A duplicate (email, magnetSlug) submission produces no new row. The user
  // already received this magnet, so skip re-sending and re-enrolling - this is
  // what previously let the endpoint be used as an email-bombing relay - while
  // still returning the normal success response.
  const isNewLead = insertedLeads.length > 0

  if (!isNewLead) {
    if (!wantsJsonResponse) {
      return cors(buildLeadSuccessResponse(siteBaseUrl, magnetSlug, wantsJsonResponse))
    }

    const leadId = await findLeadId(db, email, magnetSlug)
    return cors(buildLeadSuccessResponse(siteBaseUrl, magnetSlug, wantsJsonResponse, leadId))
  }

  const insertedLeadId = insertedLeads[0]?.id ?? null

  const unsubscribeToken = crypto.randomUUID()
  const subscriptionSource = magnetSlug === NEWSLETTER_SLUG ? 'newsletter' : 'lead-magnet'

  const inserted = await db
    .insert(emailSubscriptions)
    .values({
      email,
      subscribed: true,
      unsubscribeToken,
      source: subscriptionSource,
    })
    .onConflictDoNothing()
    .returning()

  let resolvedToken: string | null = null
  let resolvedSubscribed = true
  let insertedSubscriptionId: string | null = null

  if (inserted.length > 0) {
    insertedSubscriptionId = inserted[0].id
    resolvedToken = inserted[0].unsubscribeToken
    resolvedSubscribed = inserted[0].subscribed
  } else {
    const existing = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.email, email))
      .limit(1)
    if (existing.length > 0) {
      resolvedToken = existing[0].unsubscribeToken
      resolvedSubscribed = existing[0].subscribed
    }
  }

  const unsubscribeUrl = resolvedToken
    ? `${siteBaseUrl}/unsubscribe?token=${resolvedToken}`
    : `${siteBaseUrl}/unsubscribe`

  const fallbackUrl =
    magnetSlug === NEWSLETTER_SLUG
      ? `${siteBaseUrl}/resources`
      : `${siteBaseUrl}/resources/${magnetSlug}`
  let downloadUrl = fallbackUrl
  let isPdf = false

  if (isLeadMagnetSlug(magnetSlug) && getLeadMagnetsBucketName()) {
    try {
      downloadUrl = buildLeadMagnetDownloadUrl(magnetSlug)
      isPdf = true
    } catch (err) {
      captureServerException(err, {
        surface: 'api',
        route: '/api/marketing/leads',
        operation: 'lead-magnet.download-url',
        tags: { magnetSlug },
      })
      logger.safe.warn(
        {
          magnetSlug,
          errMessage: err instanceof Error ? err.message : String(err),
        },
        'lead magnet download URL build failed - falling back to resource page URL',
      )
    }
  }

  let delivered = false

  try {
    await sendLeadMagnetDeliveryEmail({
      toEmail: email,
      magnetTitle,
      magnetSlug,
      siteBaseUrl,
      unsubscribeUrl,
      downloadUrl,
      isPdf,
    })
    delivered = true
  } catch (err) {
    const safeError = toCaptureSafeError(err)
    captureServerException(safeError, {
      surface: 'api',
      route: '/api/marketing/leads',
      operation: 'lead-magnet.delivery-email',
      tags: { magnetSlug },
    })
    logger.safe.error(
      {
        magnetSlug,
        errMessage: safeError.message,
      },
      'lead magnet email delivery failed',
    )
  }

  if (!delivered) {
    await rollbackFailedLeadDelivery(db, {
      leadId: insertedLeadId,
      insertedSubscriptionId,
      magnetSlug,
    })
    return cors(buildDeliveryFailedResponse(fallbackUrl, wantsJsonResponse))
  }

  if (delivered && resolvedSubscribed && isLeadMagnetSlug(magnetSlug)) {
    const leadId = insertedLeadId ?? (await findLeadId(db, email, magnetSlug))

    if (leadId) {
      try {
        await enrollSequencerSequence({
          email,
          sequenceSlug: 'phiguard-lead-magnet-nurture',
          externalId: `${leadId}:${magnetSlug}`,
          metadata: {
            leadId,
            magnetSlug,
            sourcePagePath: sourcePagePath ?? null,
            landingPagePath: landingPagePath ?? null,
            ctaContext: ctaContext ?? null,
          },
        })
        await db
          .update(marketingLeads)
          .set({ consentMarketingAt: now })
          .where(eq(marketingLeads.id, leadId))
      } catch (err) {
        const safeError = toCaptureSafeError(err)
        captureServerException(safeError, {
          surface: 'api',
          route: '/api/marketing/leads',
          operation: 'lead-magnet.sequencer-enroll',
          tags: { magnetSlug },
        })
        logger.safe.error(
          {
            magnetSlug,
            leadId,
            errMessage: safeError.message,
          },
          'lead magnet sequencer enrollment failed',
        )
      }
    }
  }

  const leadId = wantsJsonResponse
    ? (insertedLeadId ?? (await findLeadId(db, email, magnetSlug)))
    : null

  return cors(buildLeadSuccessResponse(siteBaseUrl, magnetSlug, wantsJsonResponse, leadId))
}

export const Route = createFileRoute('/api/marketing/leads')({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => handleLeadCaptureOptions(request),
      POST: async ({ request }) => handleLeadCapture(request),
    },
  },
})
