#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const envLocalPath = path.join(repoRoot, '.env.local')
const couponEnvKey = 'STRIPE_LAUNCH50_COUPON_ID'
const expectedPercentOff = 50
const expectedDuration = 'forever'

loadDotEnvLocal()

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const couponId = process.env[couponEnvKey]

if (!stripeSecretKey) {
  fail('STRIPE_SECRET_KEY must be configured in the environment or root .env.local')
}

if (!couponId) {
  fail(`${couponEnvKey} must be configured in the environment or root .env.local`)
}

const response = await fetch(`https://api.stripe.com/v1/coupons/${encodeURIComponent(couponId)}`, {
  headers: {
    Authorization: `Bearer ${stripeSecretKey}`,
  },
})

if (!response.ok) {
  const body = await response.text()
  fail(`Stripe coupon lookup failed with ${response.status}: ${body}`)
}

const coupon = await response.json()
const errors = []

if (coupon.deleted) {
  errors.push(`${couponEnvKey} points to a deleted coupon`)
}

if (coupon.percent_off !== expectedPercentOff) {
  errors.push(`expected percent_off ${expectedPercentOff}, got ${coupon.percent_off ?? 'null'}`)
}

if (coupon.duration !== expectedDuration) {
  errors.push(`expected duration "${expectedDuration}", got "${coupon.duration ?? 'null'}"`)
}

if (errors.length > 0) {
  fail(`LAUNCH50 Stripe coupon verification failed for ${coupon.id}:\n- ${errors.join('\n- ')}`)
}

console.log(`LAUNCH50 Stripe coupon verified: ${coupon.id} is ${expectedPercentOff}% off ${expectedDuration}.`)

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
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
