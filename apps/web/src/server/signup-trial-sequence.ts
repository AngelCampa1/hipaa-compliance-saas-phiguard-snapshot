import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { PHIGUARD_APP_ORIGIN, PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand'
import { emailSubscriptions, getMarketingDb, marketingLeads } from '@phiguard/marketing-db/server'
import {
  createIdentifierRateLimitMiddleware,
  createRateLimitMiddleware,
} from '../middleware/rate-limit.js'
import { EMAIL_RE } from '../lib/validation.js'
import { enrollSequencerSequence } from './sequencer.js'

const SIGNUP_TRIAL_SOURCE = 'signup-trial'

const resendSignupConfirmationRateLimit = createRateLimitMiddleware({
  keyPrefix: 'signup-confirmation-resend',
  maxTokens: 3,
  refillRate: 3,
  windowMs: 60_000,
})

const enrollSignupTrialRateLimit = createRateLimitMiddleware({
  keyPrefix: 'signup-trial-enroll',
  maxTokens: 5,
  refillRate: 3,
  windowMs: 60_000,
})

const enrollSignupTrialEmailRateLimit = createIdentifierRateLimitMiddleware({
  keyPrefix: 'signup-trial-enroll-email',
  maxTokens: 1,
  refillRate: 1,
  windowMs: 600_000,
})

function getAppUrl() {
  return process.env.APP_URL ?? PHIGUARD_APP_ORIGIN
}

function getMarketingSiteUrl() {
  return process.env.MARKETING_SITE_URL ?? PHIGUARD_PUBLIC_SITE_ORIGIN
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getFirstName(name: string | null | undefined) {
  const trimmed = name?.trim()
  if (!trimmed) return undefined
  return trimmed.split(/\s+/)[0]
}

function cap(value: string | undefined, max: number) {
  return value?.slice(0, max)
}

function buildSignupUrls(email: string, unsubscribeToken: string | null) {
  const appUrl = getAppUrl().replace(/\/+$/, '')
  const marketingSiteUrl = getMarketingSiteUrl().replace(/\/+$/, '')

  return {
    appUrl: `${appUrl}/app/onboarding`,
    resendUrl: `${appUrl}/signup/check-email?email=${encodeURIComponent(email)}`,
    unsubscribeUrl: unsubscribeToken
      ? `${marketingSiteUrl}/unsubscribe?token=${unsubscribeToken}`
      : `${marketingSiteUrl}/unsubscribe`,
  }
}

async function ensureSignupTrialSubscription(email: string) {
  const db = getMarketingDb()
  const unsubscribeToken = crypto.randomUUID()

  const inserted = await db
    .insert(emailSubscriptions)
    .values({
      email,
      subscribed: true,
      unsubscribeToken,
      source: SIGNUP_TRIAL_SOURCE,
    })
    .onConflictDoNothing()
    .returning()

  if (inserted.length > 0) {
    return inserted[0]
  }

  const [existing] = await db
    .select()
    .from(emailSubscriptions)
    .where(eq(emailSubscriptions.email, email))
    .limit(1)

  return existing ?? null
}

async function findSignupTrialLead(email: string) {
  const db = getMarketingDb()
  const [lead] = await db
    .select()
    .from(marketingLeads)
    .where(and(eq(marketingLeads.email, email), eq(marketingLeads.magnetSlug, SIGNUP_TRIAL_SOURCE)))
    .limit(1)

  return lead ?? null
}

async function ensureSignupTrialLead(input: { email: string; sourcePagePath?: string }) {
  const db = getMarketingDb()

  const inserted = await db
    .insert(marketingLeads)
    .values({
      email: input.email,
      magnetSlug: SIGNUP_TRIAL_SOURCE,
      sourcePagePath: cap(input.sourcePagePath, 500),
      ctaContext: 'signup',
    })
    .onConflictDoNothing()
    .returning()

  if (inserted.length > 0) {
    return {
      lead: inserted[0],
      isNewLead: true,
    }
  }

  return {
    lead: await findSignupTrialLead(input.email),
    isNewLead: false,
  }
}

async function enrollSignupTrialSequencerFlows(email: string, leadId: string, name?: string) {
  const db = getMarketingDb()
  await enrollSequencerSequence({
    email,
    sequenceSlug: 'phiguard-fulfillment-welcome',
    externalId: `${leadId}:fulfillment-welcome`,
    metadata: { leadId, signupName: name ?? null },
  })
  await enrollSequencerSequence({
    email,
    sequenceSlug: 'phiguard-nurture-value-1',
    externalId: `${leadId}:nurture-value-1`,
    metadata: { leadId, signupName: name ?? null },
  })
  await db
    .update(marketingLeads)
    .set({ consentMarketingAt: new Date().toISOString() })
    .where(and(eq(marketingLeads.email, email), eq(marketingLeads.magnetSlug, SIGNUP_TRIAL_SOURCE)))
}

export async function enrollSignupTrialSequence(input: {
  email: string
  name?: string
  sourcePagePath?: string
}): Promise<void> {
  const email = normalizeEmail(input.email)
  if (!email || !EMAIL_RE.test(email)) {
    return
  }

  const subscription = await ensureSignupTrialSubscription(email)
  const { lead, isNewLead } = await ensureSignupTrialLead({
    email,
    sourcePagePath: input.sourcePagePath,
  })

  const shouldEnrollSequencer =
    subscription?.subscribed !== false && lead && (isNewLead || !lead.consentMarketingAt)

  if (shouldEnrollSequencer) {
    await enrollSignupTrialSequencerFlows(email, lead.id, input.name)
  }

  if (!isNewLead) {
    return
  }

  const urls = buildSignupUrls(email, subscription?.unsubscribeToken ?? null)
  const { sendSignupConfirmationEmail } = await import('@phiguard/email')
  await sendSignupConfirmationEmail({
    toEmail: email,
    firstName: getFirstName(input.name),
    appUrl: urls.appUrl,
    resendUrl: urls.resendUrl,
    unsubscribeUrl: urls.unsubscribeUrl,
  })
}

export async function enrollSignupTrialSequenceForRequest(input: {
  email: string
  name?: string
  sourcePagePath?: string
  request: Request
  sessionEmail?: string | null
}): Promise<{ ok: true }> {
  const limited = await enrollSignupTrialRateLimit(input.request)
  if (limited) {
    return { ok: true }
  }

  const email = normalizeEmail(input.email)
  if (!input.sessionEmail || normalizeEmail(input.sessionEmail) !== email) {
    return { ok: true }
  }

  const emailLimited = await enrollSignupTrialEmailRateLimit(email)
  if (emailLimited) {
    return { ok: true }
  }

  await enrollSignupTrialSequence(input)
  return { ok: true }
}

export async function resendSignupConfirmationImpl(input: {
  email: string
  request: Request
  sessionEmail?: string | null
}): Promise<{ ok: true }> {
  const limited = await resendSignupConfirmationRateLimit(input.request)
  if (limited) {
    return { ok: true }
  }

  const email = normalizeEmail(input.email)
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: true }
  }

  if (!input.sessionEmail || normalizeEmail(input.sessionEmail) !== email) {
    return { ok: true }
  }

  const subscription = await ensureSignupTrialSubscription(email)
  const existingLead = await findSignupTrialLead(email)

  if (existingLead && subscription?.subscribed !== false) {
    const urls = buildSignupUrls(email, subscription?.unsubscribeToken ?? null)
    const { sendSignupConfirmationEmail } = await import('@phiguard/email')
    await sendSignupConfirmationEmail({
      toEmail: email,
      appUrl: urls.appUrl,
      resendUrl: urls.resendUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
    })
  }

  return { ok: true }
}

export const enrollSignupTrialSequenceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const input = data as {
      email?: string
      name?: string
      sourcePagePath?: string
    }
    return {
      email: String(input.email ?? ''),
      name: input.name ? String(input.name) : undefined,
      sourcePagePath: input.sourcePagePath ? String(input.sourcePagePath) : undefined,
    }
  })
  .handler(async ({ data }) => {
    const request = getRequest()
    const { resolveAppSessionFromRequest } = await import('../lib/session.server.js')
    const session = await resolveAppSessionFromRequest()

    return enrollSignupTrialSequenceForRequest({
      ...data,
      request,
      sessionEmail: session?.user?.email ?? null,
    })
  })

export const resendSignupConfirmationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const input = data as { email?: string }
    return { email: String(input.email ?? '') }
  })
  .handler(async ({ data }) => {
    const { resolveAppSessionFromRequest } = await import('../lib/session.server.js')
    const session = await resolveAppSessionFromRequest()

    return resendSignupConfirmationImpl({
      email: data.email,
      request: getRequest(),
      sessionEmail: session?.user?.email ?? null,
    })
  })
