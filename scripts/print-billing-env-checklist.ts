#!/usr/bin/env tsx
import { BILLING_CADENCES, LIMITED_OFFER_PROMOTIONS, PLANS, PUBLIC_PLAN_IDS } from '../packages/billing/src/plans.js'

const args = new Set(process.argv.slice(2))
const asWranglerSecrets = args.has('--format=wrangler-secrets')
const configIndex = process.argv.indexOf('--config')
const configPath = configIndex >= 0 ? process.argv[configIndex + 1] : 'wrangler.jsonc'

const stripePriceEnvKeys = PUBLIC_PLAN_IDS.flatMap((planId) =>
  BILLING_CADENCES.map((cadence) => PLANS[planId].stripePriceEnvKeys[cadence]),
)
const legacyPriceEnvKeys = PUBLIC_PLAN_IDS.map((planId) => PLANS[planId].stripePriceEnvKey)
const stripeCouponEnvKeys = LIMITED_OFFER_PROMOTIONS.map((promotion) => promotion.stripeCouponEnvKey)

const envKeys = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  ...stripePriceEnvKeys,
  ...stripeCouponEnvKeys,
]

const compatibilityEnvKeys = legacyPriceEnvKeys

for (const key of envKeys) {
  printLine(key, true)
}

for (const key of compatibilityEnvKeys) {
  printLine(key, false)
}

function printLine(key: string, required: boolean) {
  if (asWranglerSecrets) {
    console.log(`wrangler secret put ${key} --config ${configPath}`)
    return
  }

  const prefix = required ? '[ ] BLOCKER: set' : '[ ] compatibility: set legacy'
  console.log(`${prefix} \`${key}\``)
}
