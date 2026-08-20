import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { and, asc, desc, eq, isNull, lt, sql } from 'drizzle-orm'
import {
  getDb,
  partnerMagicLinkTokens,
  partners,
  partnerPayouts,
  partnerUsers,
  referrals,
  referralRevenueEvents,
} from '@phiguard/db/server'
import { computePayouts, MIN_PARTNER_PAYOUT_CENTS } from '@phiguard/billing'
import { PHIGUARD_APP_ORIGIN } from '@phiguard/brand/identity'
import { sendPartnerMagicLinkEmail } from '@phiguard/email'
import { writeAuditEvent } from '@phiguard/audit'
import { getSessionFn } from '../lib/session.js'
import {
  createIdentifierRateLimitMiddleware,
  createRateLimitMiddleware,
} from '../middleware/rate-limit.js'
import crypto from 'node:crypto'

// ---- Magic link token signing ----

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000 // 15 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function getPartnerTokenSecret(): string {
  const secret = process.env.PARTNER_TOKEN_SECRET
  if (secret) {
    return secret
  }

  if (isDev) {
    return 'dev-partner-token-secret'
  }

  throw new Error('PARTNER_TOKEN_SECRET must be set in non-development environments')
}

function signToken(partnerUserId: string, ttlMs: number = MAGIC_LINK_TTL_MS): string {
  const tokenSecret = getPartnerTokenSecret()
  const expires = Date.now() + ttlMs
  const nonce = crypto.randomBytes(16).toString('base64url')
  const payload = `${partnerUserId}:${expires}:${nonce}`
  const sig = crypto.createHmac('sha256', tokenSecret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function verifyToken(token: string): { partnerUserId: string } | null {
  const tokenSecret = getPartnerTokenSecret()
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 3 && parts.length !== 4) return null
    const [partnerUserId, expiresStr] = parts
    const sig = parts.at(-1)
    if (!sig) return null
    const payload = parts.slice(0, -1).join(':')
    const expected = crypto.createHmac('sha256', tokenSecret).update(payload).digest('hex')
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null
    if (Date.now() > Number(expiresStr)) return null
    return { partnerUserId }
  } catch {
    return null
  }
}

const PARTNER_SESSION_COOKIE = 'pg_partner_session'

function getPartnerSessionFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(/pg_partner_session=([^;\s]+)/)
  return match?.[1] ?? null
}

const PLATFORM_ADMIN_EMAILS = new Set(
  (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
)
const PLATFORM_AUDIT_TENANT_ID = '00000000-0000-4000-8000-000000000000'

async function requireAdminSession() {
  const session = await getSessionFn()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  const email = (session.user.email ?? '').toLowerCase()
  if (!PLATFORM_ADMIN_EMAILS.has(email)) {
    throw new Error('Forbidden')
  }
  const db = getDb()
  return { session, db }
}

type PartnerLookupDb = Pick<ReturnType<typeof getDb>, 'select'>

async function getActivePartnerById(
  db: PartnerLookupDb,
  partnerId: string,
): Promise<typeof partners.$inferSelect | null> {
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1)
  if (!partner || partner.status !== 'active') {
    return null
  }
  return partner
}

// ---- Schema for inputs ----

const RequestMagicLinkInput = z.object({
  email: z.string().trim().email(),
})

const partnerMagicLinkRateLimit = createRateLimitMiddleware({
  keyPrefix: 'partner-magic-link',
  maxTokens: 5,
  refillRate: 3,
  windowMs: 60_000,
})

const partnerMagicLinkEmailRateLimit = createIdentifierRateLimitMiddleware({
  keyPrefix: 'partner-magic-link-email',
  maxTokens: 1,
  refillRate: 1,
  windowMs: 600_000,
})

const VerifyMagicLinkInput = z.object({
  token: z.string().min(1),
})

const RunPayoutsInput = z
  .object({
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
  })
  .refine((data) => new Date(data.periodStart) < new Date(data.periodEnd), {
    message: 'Payout period end must be after period start',
    path: ['periodEnd'],
  })

const MarkPayoutPaidInput = z.object({
  payoutId: z.string().uuid(),
  externalReference: z
    .string()
    .trim()
    .min(1, 'External reference is required')
    .max(120)
    .regex(/^[A-Za-z0-9._:/# -]+$/, 'External reference contains unsupported characters'),
})

const ApprovePartnerInput = z.object({
  partnerId: z.string().uuid(),
})

// ---- Server functions ----

export const requestPartnerMagicLinkFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => RequestMagicLinkInput.parse(data))
  .handler(async ({ data }) => {
    const limited = await partnerMagicLinkRateLimit(getRequest())
    if (limited) return { ok: true }

    const email = data.email.toLowerCase()
    const emailLimited = await partnerMagicLinkEmailRateLimit(email)
    if (emailLimited) return { ok: true }

    const db = getDb()
    const [partnerUser] = await db
      .select()
      .from(partnerUsers)
      .where(eq(partnerUsers.email, email))
      .limit(1)

    // Always return success to prevent email enumeration
    if (!partnerUser) return { ok: true }

    const partner = await getActivePartnerById(db, partnerUser.partnerId)
    if (!partner) return { ok: true }

    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS)
    const token = signToken(partnerUser.id, MAGIC_LINK_TTL_MS)
    await db.insert(partnerMagicLinkTokens).values({
      partnerUserId: partnerUser.id,
      tokenHash: hashToken(token),
      expiresAt,
    })
    const magicLinkUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/partner/verify?token=${token}`

    try {
      await sendPartnerMagicLinkEmail({
        toEmail: data.email,
        magicLinkUrl,
      })
    } catch {
      return { ok: true }
    }

    return { ok: true }
  })

export const verifyPartnerMagicLinkFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => VerifyMagicLinkInput.parse(data))
  .handler(async ({ data }) => {
    const verified = verifyToken(data.token)
    if (!verified) {
      throw new Error('Invalid or expired magic link')
    }

    const db = getDb()
    const tokenHash = hashToken(data.token)
    const partnerUser = await db.transaction(async (tx) => {
      const [tokenRecord] = await tx
        .select()
        .from(partnerMagicLinkTokens)
        .where(eq(partnerMagicLinkTokens.tokenHash, tokenHash))
        .limit(1)

      if (
        !tokenRecord ||
        tokenRecord.partnerUserId !== verified.partnerUserId ||
        tokenRecord.usedAt ||
        tokenRecord.expiresAt <= new Date()
      ) {
        throw new Error('Invalid or expired magic link')
      }

      const [user] = await tx
        .select()
        .from(partnerUsers)
        .where(eq(partnerUsers.id, verified.partnerUserId))
        .limit(1)

      if (!user) {
        return null
      }

      const partner = await getActivePartnerById(tx, user.partnerId)
      if (!partner) {
        throw new Error('Partner account is not active')
      }

      const [updatedToken] = await tx
        .update(partnerMagicLinkTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(partnerMagicLinkTokens.tokenHash, tokenHash),
            isNull(partnerMagicLinkTokens.usedAt),
          ),
        )
        .returning({ id: partnerMagicLinkTokens.id })

      if (!updatedToken) {
        throw new Error('Invalid or expired magic link')
      }

      return user
    })

    if (!partnerUser) {
      throw new Error('Partner account not found')
    }

    // Issue a session token (long-lived, 30 days)
    const sessionToken = signToken(partnerUser.id, SESSION_TTL_MS)

    const attrs = [
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${30 * 24 * 60 * 60}`,
      'Path=/',
      ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
    ]
    return {
      sessionCookie: `${PARTNER_SESSION_COOKIE}=${sessionToken}; ${attrs.join('; ')}`,
      partnerId: partnerUser.partnerId,
    }
  })

export const getPartnerDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const sessionToken = getPartnerSessionFromRequest(request)
  if (!sessionToken) throw new Error('Unauthorized')

  const verified = verifyToken(sessionToken)
  if (!verified) throw new Error('Unauthorized')

  const db = getDb()
  const [partnerUser] = await db
    .select()
    .from(partnerUsers)
    .where(eq(partnerUsers.id, verified.partnerUserId))
    .limit(1)

  if (!partnerUser) throw new Error('Unauthorized')

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, partnerUser.partnerId))
    .limit(1)

  if (!partner || partner.status !== 'active') throw new Error('Unauthorized')

  // Get referrals ordered by signup date for sequential numbering
  const partnerReferrals = await db
    .select({
      id: referrals.id,
      organizationId: referrals.organizationId,
      signedUpAt: referrals.signedUpAt,
      firstPaidAt: referrals.firstPaidAt,
      lifetimeValueCents: referrals.lifetimeValueCents,
    })
    .from(referrals)
    .where(eq(referrals.partnerId, partner.id))
    .orderBy(asc(referrals.signedUpAt))

  // Privacy: replace clinic names with sequential identifiers, round LTV to nearest $100
  const anonymizedReferrals = partnerReferrals.map((r, idx) => ({
    label: `Clinic #${idx + 1}`,
    status: r.firstPaidAt ? 'paying' : 'signed-up',
    ltvRoundedCents: Math.round(r.lifetimeValueCents / 10000) * 10000, // round to nearest $100, stored as cents for formatCurrency
    signedUpAt: r.signedUpAt,
  }))

  // Get payout history
  const payoutHistory = await db
    .select()
    .from(partnerPayouts)
    .where(eq(partnerPayouts.partnerId, partner.id))
    .orderBy(desc(partnerPayouts.periodStart))

  // Derive origin server-side to avoid typeof window hydration mismatch on the client.
  const origin =
    process.env.APP_URL ?? (request.url ? new URL(request.url).origin : PHIGUARD_APP_ORIGIN)

  return {
    partner: {
      name: partner.name,
      referralCode: partner.referralCode,
      commissionPct: partner.commissionPct,
    },
    referralUrl: `${origin}/partner/${partner.referralCode}`,
    referrals: anonymizedReferrals,
    payouts: payoutHistory,
  }
})

export const adminListPartnersFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession()
  const db = getDb()

  const allPartners = await db.select().from(partners).orderBy(asc(partners.name))

  const partnerData = await Promise.all(
    allPartners.map(async (p) => {
      const partnerReferrals = await db
        .select({
          lifetimeValueCents: referrals.lifetimeValueCents,
        })
        .from(referrals)
        .where(eq(referrals.partnerId, p.id))

      const totalLtvCents = partnerReferrals.reduce((sum, r) => sum + r.lifetimeValueCents, 0)

      return {
        ...p,
        totalReferrals: partnerReferrals.length,
        totalLtvCents,
      }
    }),
  )

  return { partners: partnerData }
})

export const adminListPayoutsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdminSession()
  const db = getDb()

  const allPayouts = await db
    .select({
      id: partnerPayouts.id,
      partnerId: partnerPayouts.partnerId,
      partnerName: partners.name,
      periodStart: partnerPayouts.periodStart,
      periodEnd: partnerPayouts.periodEnd,
      amountCents: partnerPayouts.amountCents,
      status: partnerPayouts.status,
      externalReference: partnerPayouts.externalReference,
      paidAt: partnerPayouts.paidAt,
      createdAt: partnerPayouts.createdAt,
    })
    .from(partnerPayouts)
    .innerJoin(partners, eq(partnerPayouts.partnerId, partners.id))
    .orderBy(desc(partnerPayouts.createdAt))

  return { payouts: allPayouts }
})

export const adminApprovePartnerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ApprovePartnerInput.parse(data))
  .handler(async ({ data }) => {
    const { session, db } = await requireAdminSession()

    const result = await db.transaction(async (tx) => {
      const [partner] = await tx
        .select()
        .from(partners)
        .where(eq(partners.id, data.partnerId))
        .limit(1)

      if (!partner) {
        throw new Error('Partner not found')
      }

      if (partner.status !== 'pending') {
        throw new Error(`Partner is already ${partner.status}`)
      }

      const [partnerUser] = await tx
        .insert(partnerUsers)
        .values({
          partnerId: partner.id,
          email: partner.email.toLowerCase(),
        })
        .returning()

      const [updatedPartner] = await tx
        .update(partners)
        .set({ status: 'active' })
        .where(and(eq(partners.id, partner.id), eq(partners.status, 'pending')))
        .returning()

      if (!updatedPartner) {
        throw new Error('Partner could not be approved')
      }

      const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS)
      const token = signToken(partnerUser.id, MAGIC_LINK_TTL_MS)
      await tx.insert(partnerMagicLinkTokens).values({
        partnerUserId: partnerUser.id,
        tokenHash: hashToken(token),
        expiresAt,
      })

      await writeAuditEvent(tx, {
        tenantId: PLATFORM_AUDIT_TENANT_ID,
        actorId: session.user.id,
        action: 'partner.approved',
        resourceType: 'partner',
        resourceId: partner.id,
        before: { status: partner.status },
        after: { status: 'active', partnerUserId: partnerUser.id },
      })

      return {
        partner,
        partnerUser,
        token,
      }
    })

    const magicLinkUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/partner/verify?token=${result.token}`
    try {
      await sendPartnerMagicLinkEmail({
        toEmail: result.partner.email,
        magicLinkUrl,
      })
      return {
        ok: true,
        partnerUserId: result.partnerUser.id,
        emailSent: true,
      }
    } catch {
      return {
        ok: true,
        partnerUserId: result.partnerUser.id,
        emailSent: false,
      }
    }
  })

export const adminRunPayoutsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => RunPayoutsInput.parse(data))
  .handler(async ({ data: rawData }) => {
    const data = RunPayoutsInput.parse(rawData)
    const { session, db } = await requireAdminSession()
    const periodStart = new Date(data.periodStart)
    const periodEnd = new Date(data.periodEnd)

    // Single query: get all active partners + their unpaid referral revenue in one shot
    const partnerRevenueData = await db
      .select({
        partnerId: partners.id,
        commissionPct: partners.commissionPct,
        referralId: referrals.id,
        revenueEventId: referralRevenueEvents.id,
        amountCents: referralRevenueEvents.amountCents,
      })
      .from(partners)
      .innerJoin(referrals, eq(referrals.partnerId, partners.id))
      .innerJoin(referralRevenueEvents, eq(referralRevenueEvents.referralId, referrals.id))
      .where(
        and(
          eq(partners.status, 'active'),
          isNull(referralRevenueEvents.payoutId),
          lt(referralRevenueEvents.paidAt, periodEnd),
        ),
      )

    // Aggregate per partner
    const partnerMap = new Map<
      string,
      {
        commissionPct: number
        newRevenueCents: number
        revenueEvents: Array<{ id: string; referralId: string; amountCents: number }>
      }
    >()

    for (const row of partnerRevenueData) {
      if (row.amountCents <= 0) continue

      const entry = partnerMap.get(row.partnerId) ?? {
        commissionPct: row.commissionPct,
        newRevenueCents: 0,
        revenueEvents: [],
      }
      entry.newRevenueCents += row.amountCents
      entry.revenueEvents.push({
        id: row.revenueEventId,
        referralId: row.referralId,
        amountCents: row.amountCents,
      })
      partnerMap.set(row.partnerId, entry)
    }

    const referralDataArray = Array.from(partnerMap.entries()).map(([partnerId, v]) => ({
      partnerId,
      commissionPct: v.commissionPct,
      newRevenueCents: v.newRevenueCents,
    }))

    const payoutSummaries = computePayouts(referralDataArray)

    let payoutsCreated = 0
    await db.transaction(async (tx) => {
      for (const summary of payoutSummaries) {
        const partnerRevenue = partnerMap.get(summary.partnerId)
        if (!partnerRevenue) continue

        const [payout] = await tx
          .insert(partnerPayouts)
          .values({
            partnerId: summary.partnerId,
            periodStart,
            periodEnd,
            amountCents: 0,
            status: 'pending',
          })
          .returning({ id: partnerPayouts.id })

        if (!payout) continue

        const allocatedReferralRevenueCents = new Map<string, number>()
        const allocatedEventIds: string[] = []
        let allocatedRevenueCents = 0
        for (const event of partnerRevenue.revenueEvents) {
          const [allocatedEvent] = await tx
            .update(referralRevenueEvents)
            .set({ payoutId: payout.id, payoutAllocatedAt: new Date() })
            .where(
              and(eq(referralRevenueEvents.id, event.id), isNull(referralRevenueEvents.payoutId)),
            )
            .returning({
              id: referralRevenueEvents.id,
              referralId: referralRevenueEvents.referralId,
              amountCents: referralRevenueEvents.amountCents,
            })

          if (!allocatedEvent) continue

          allocatedEventIds.push(allocatedEvent.id)
          allocatedRevenueCents += allocatedEvent.amountCents
          allocatedReferralRevenueCents.set(
            allocatedEvent.referralId,
            (allocatedReferralRevenueCents.get(allocatedEvent.referralId) ?? 0) +
              allocatedEvent.amountCents,
          )
        }

        const allocatedPayoutCents = Math.floor(
          allocatedRevenueCents * (partnerRevenue.commissionPct / 100),
        )
        if (allocatedPayoutCents < MIN_PARTNER_PAYOUT_CENTS) {
          for (const eventId of allocatedEventIds) {
            await tx
              .update(referralRevenueEvents)
              .set({ payoutId: null, payoutAllocatedAt: null })
              .where(eq(referralRevenueEvents.id, eventId))
          }
          await tx.delete(partnerPayouts).where(eq(partnerPayouts.id, payout.id))
          continue
        }

        const allocatedReferralPayoutCents = allocateReferralPayoutCents(
          allocatedReferralRevenueCents,
          partnerRevenue.commissionPct,
          allocatedPayoutCents,
        )

        await tx
          .update(partnerPayouts)
          .set({ amountCents: allocatedPayoutCents })
          .where(eq(partnerPayouts.id, payout.id))

        for (const [referralId, payoutCents] of allocatedReferralPayoutCents.entries()) {
          await tx
            .update(referrals)
            .set({
              totalPaidOutCents: sql`${referrals.totalPaidOutCents} + ${payoutCents}`,
            })
            .where(eq(referrals.id, referralId))
        }
        payoutsCreated += 1
      }

      await writeAuditEvent(tx, {
        tenantId: PLATFORM_AUDIT_TENANT_ID,
        actorId: session.user.id,
        action: 'partner.payout_run',
        resourceType: 'partner_payout',
        resourceId: 'batch',
        after: {
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          payoutCount: payoutsCreated,
        },
      })
    })

    return { payoutsCreated }
  })

function allocateReferralPayoutCents(
  referralRevenueCents: Map<string, number>,
  commissionPct: number,
  allocatedPayoutCents: number,
): Map<string, number> {
  const allocations = Array.from(referralRevenueCents.entries()).map(([referralId, revenueCents]) => {
    const product = revenueCents * commissionPct
    return {
      referralId,
      payoutCents: Math.floor(product / 100),
      remainder: product % 100,
    }
  })

  let remainingCents =
    allocatedPayoutCents - allocations.reduce((sum, allocation) => sum + allocation.payoutCents, 0)
  const byRemainder = [...allocations].sort(
    (a, b) => b.remainder - a.remainder || a.referralId.localeCompare(b.referralId),
  )
  for (const allocation of byRemainder) {
    if (remainingCents <= 0) break
    allocation.payoutCents += 1
    remainingCents -= 1
  }

  return new Map(allocations.map((allocation) => [allocation.referralId, allocation.payoutCents]))
}

export const adminMarkPayoutPaidFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => MarkPayoutPaidInput.parse(data))
  .handler(async ({ data: rawData }) => {
    const data = MarkPayoutPaidInput.parse(rawData)
    const { session, db } = await requireAdminSession()
    await db.transaction(async (tx) => {
      const [payout] = await tx
        .select()
        .from(partnerPayouts)
        .where(eq(partnerPayouts.id, data.payoutId))
        .limit(1)

      if (!payout) {
        throw new Error('Payout not found')
      }

      if (payout.status !== 'pending') {
        throw new Error(`Payout is already ${payout.status}`)
      }

      const paidAt = new Date()
      const [updated] = await tx
        .update(partnerPayouts)
        .set({
          status: 'paid',
          externalReference: data.externalReference,
          paidAt,
        })
        .where(and(eq(partnerPayouts.id, data.payoutId), eq(partnerPayouts.status, 'pending')))
        .returning()

      if (!updated) {
        throw new Error('Payout could not be marked paid')
      }

      await writeAuditEvent(tx, {
        tenantId: PLATFORM_AUDIT_TENANT_ID,
        actorId: session.user.id,
        action: 'partner.payout_marked_paid',
        resourceType: 'partner_payout',
        resourceId: data.payoutId,
        before: {
          status: payout.status,
          externalReference: payout.externalReference,
          paidAt: payout.paidAt,
        },
        after: {
          status: 'paid',
          externalReference: data.externalReference,
          paidAt: paidAt.toISOString(),
        },
      })
    })
    return { ok: true }
  })
