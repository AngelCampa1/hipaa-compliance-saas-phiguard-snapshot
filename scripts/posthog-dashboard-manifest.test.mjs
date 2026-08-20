import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  getBillingAnalyticsEvents,
  getMarketingAnalyticsEvents,
  validateManifest,
} from './validate-posthog-dashboard-manifest.mjs'

const scriptPath = 'scripts/validate-posthog-dashboard-manifest.mjs'

test('PostHog dashboard manifest validator checks the checked-in manifest', () => {
  const output = execFileSync(process.execPath, [scriptPath], { encoding: 'utf8' })

  assert.match(output, /PostHog dashboard manifest is valid/)
  assert.match(output, /dashboards/)
  assert.match(output, /events/)
})

test('PostHog dashboard manifest validator enforces taxonomy coverage without shelling out', () => {
  const source = readFileSync(scriptPath, 'utf8')

  assert.match(source, /APPROVED_PRODUCT_ANALYTICS_EVENTS/)
  assert.match(source, /PUBLIC_PRODUCT_ANALYTICS_EVENTS/)
  assert.doesNotMatch(source, /execSync|execFileSync|spawnSync|shell:/)
})

test('PostHog dashboard manifest covers marketing journey events from production sources', () => {
  const events = getMarketingAnalyticsEvents()
  assert(events.includes('mailto_clicked'))
  assert(events.includes('nav_link_clicked'))
  assert(events.includes('footer_link_clicked'))
  assert(events.includes('resource_link_clicked'))
  assert(events.includes('routing_card_clicked'))
  assert(events.includes('outbound_link_clicked'))
  assert(events.includes('analytics_consent_updated'))
  assert(events.includes('assistant_opened'))

  const manifest = JSON.parse(readFileSync('docs/posthog-dashboard-manifest.json', 'utf8'))
  const result = validateManifest(manifest)
  assert.deepEqual(result.errors, [])
})

test('PostHog dashboard manifest covers billing analytics events from production sources', () => {
  const events = getBillingAnalyticsEvents()
  assert.deepEqual(events, [
    'checkout_started',
    'checkout_completed',
    'trial_started',
    'subscription_started',
    'payment_failed',
    'subscription_past_due',
    'subscription_cancelled',
    'subscription_updated',
  ])

  const manifest = JSON.parse(readFileSync('docs/posthog-dashboard-manifest.json', 'utf8'))
  const result = validateManifest(manifest)
  assert.deepEqual(result.errors, [])
})

test('PostHog dashboard manifest covers product identity system events', () => {
  const manifest = JSON.parse(readFileSync('docs/posthog-dashboard-manifest.json', 'utf8'))
  const manifestEvents = new Set(
    manifest.dashboards.flatMap((dashboard) => dashboard.tiles.flatMap((tile) => tile.events)),
  )

  assert(manifestEvents.has('$set'))
  assert(manifestEvents.has('$groupidentify'))
  assert(manifestEvents.has('$create_alias'))
})
