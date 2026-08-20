#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LIMITED_OFFER_PROMOTIONS, type Promotion } from '../packages/billing/src/plans.js'

interface ExpectedCoupon {
  envKey: string
  code: string
  name: string
  percentOff: number
  duration: 'once' | 'repeating'
  durationInMonths?: number
  maxRedemptions: number
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const envLocalPath = path.join(repoRoot, '.env.local')

const expectedCoupons = LIMITED_OFFER_PROMOTIONS.map(toExpectedCoupon)

loadDotEnvLocal()

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  fail('STRIPE_SECRET_KEY must be configured in the environment or root .env.local')
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})

async function main() {
  for (const expected of expectedCoupons) {
    const couponId = process.env[expected.envKey]
    if (!couponId) {
      fail(`${expected.envKey} must be configured in the environment or root .env.local`)
    }

    const coupon = await retrieveCoupon(couponId)
    const errors = validateCoupon(coupon, expected)
    const promotionCodes = await retrievePromotionCodes(expected.code, coupon.id)

    if (promotionCodes.length === 0) {
      errors.push(`expected an active Stripe promotion code "${expected.code}" attached to coupon ${coupon.id}`)
    }

    if (errors.length > 0) {
      fail(`${expected.code} Stripe coupon verification failed for ${coupon.id}:\n- ${errors.join('\n- ')}`)
    }

    const months = expected.durationInMonths ? ` for ${expected.durationInMonths} months` : ''
    console.log(`${expected.code} Stripe coupon verified: ${coupon.id} is ${expected.percentOff}% off ${expected.duration}${months}.`)
  }
}

function toExpectedCoupon(promotion: Promotion): ExpectedCoupon {
  return {
    envKey: promotion.stripeCouponEnvKey,
    code: promotion.code,
    name: promotion.name,
    percentOff: promotion.percentOff,
    duration: promotion.appliesTo === 'once' ? 'once' : 'repeating',
    durationInMonths: promotion.appliesTo === 'first_year' ? 12 : undefined,
    maxRedemptions: promotion.redemptionCap,
  }
}

async function retrieveCoupon(couponId: string) {
  const response = await fetch(`https://api.stripe.com/v1/coupons/${encodeURIComponent(couponId)}`, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    fail(`Stripe coupon lookup failed with ${response.status}: ${body}`)
  }

  return response.json()
}

async function retrievePromotionCodes(code: string, couponId: string) {
  const params = new URLSearchParams({
    code,
    coupon: couponId,
    active: 'true',
    limit: '1',
  })
  const response = await fetch(`https://api.stripe.com/v1/promotion_codes?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    fail(`Stripe promotion code lookup failed with ${response.status}: ${body}`)
  }

  const result = await response.json()
  return Array.isArray(result.data) ? result.data : []
}

function validateCoupon(coupon: Record<string, unknown>, expected: ExpectedCoupon) {
  const errors: string[] = []

  if (coupon.id !== expected.code) {
    errors.push(`expected coupon id "${expected.code}", got "${coupon.id ?? 'null'}"`)
  }

  if (coupon.deleted) {
    errors.push(`${expected.envKey} points to a deleted coupon`)
  }

  if (coupon.valid !== true) {
    errors.push(`expected coupon valid=true, got ${coupon.valid ?? 'null'}`)
  }

  if (
    typeof coupon.times_redeemed === 'number'
    && coupon.times_redeemed >= expected.maxRedemptions
  ) {
    errors.push(`coupon is exhausted: ${coupon.times_redeemed}/${expected.maxRedemptions} redemptions used`)
  }

  if (coupon.percent_off !== expected.percentOff) {
    errors.push(`expected percent_off ${expected.percentOff}, got ${coupon.percent_off ?? 'null'}`)
  }

  if (coupon.name !== expected.name) {
    errors.push(`expected name "${expected.name}", got "${coupon.name ?? 'null'}"`)
  }

  if (coupon.max_redemptions !== expected.maxRedemptions) {
    errors.push(`expected max_redemptions ${expected.maxRedemptions}, got ${coupon.max_redemptions ?? 'null'}`)
  }

  if (coupon.duration !== expected.duration) {
    errors.push(`expected duration "${expected.duration}", got "${coupon.duration ?? 'null'}"`)
  }

  if (
    expected.durationInMonths !== undefined
    && coupon.duration_in_months !== expected.durationInMonths
  ) {
    errors.push(`expected duration_in_months ${expected.durationInMonths}, got ${coupon.duration_in_months ?? 'null'}`)
  }

  return errors
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

function unwrapEnvValue(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}
