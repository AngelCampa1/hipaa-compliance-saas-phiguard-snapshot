#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import process from 'node:process'

const manifestPath = resolve('docs/posthog-dashboard-manifest.json')
const taxonomyPath = resolve('apps/web/src/lib/product-analytics.ts')
const billingAnalyticsPath = resolve('packages/billing/src/analytics.ts')
const marketingSourceRoot = resolve('apps/marketing/src')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function extractConstStringArray(source, name) {
  const match = source.match(new RegExp(`(?:export\\s+)?const ${name} = \\[([\\s\\S]*?)\\] as const`))
  if (!match) throw new Error(`Missing ${name} in analytics taxonomy`)

  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1])
}

function unique(values) {
  return [...new Set(values)]
}

function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return collectFiles(path)
    return [path]
  })
}

function requireUnique(values, label, errors) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function getApprovedProductEvents() {
  const taxonomy = readFileSync(taxonomyPath, 'utf8')
  return unique([
    ...extractConstStringArray(taxonomy, 'PUBLIC_PRODUCT_ANALYTICS_EVENTS'),
    ...extractConstStringArray(taxonomy, 'APPROVED_PRODUCT_ANALYTICS_EVENTS'),
  ])
}

export function getMarketingAnalyticsEvents() {
  const eventNames = []
  const sourceFiles = collectFiles(marketingSourceRoot).filter(
    (file) =>
      /\.(astro|[cm]?[jt]sx?)$/.test(file) &&
      !/\.(test|spec|d)\.[cm]?[jt]sx?$/.test(file),
  )

  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(
      /(?:track|capture)\??(?:\.\w+)?\??\(\s*['"]([a-z][a-z0-9_]+)['"]/g,
    )) {
      eventNames.push(match[1])
    }
  }

  return unique(eventNames).sort()
}

export function getBillingAnalyticsEvents() {
  const source = readFileSync(billingAnalyticsPath, 'utf8')
  return unique(extractConstStringArray(source, 'BILLING_ANALYTICS_EVENTS'))
}

export function validateManifest(manifest = readJson(manifestPath)) {
  const errors = []

  if (manifest.version !== 1) errors.push('Manifest version must be 1')
  if (!manifest.project?.name) errors.push('Manifest project.name is required')
  if (!Number.isInteger(manifest.project?.id)) errors.push('Manifest project.id is required')
  if (!Array.isArray(manifest.dashboards) || manifest.dashboards.length === 0) {
    errors.push('Manifest must define at least one dashboard')
    return { errors, dashboardCount: 0, eventCount: 0 }
  }

  requireUnique(
    manifest.dashboards.map((dashboard) => dashboard.name),
    'dashboard name',
    errors,
  )

  const manifestEvents = new Set()
  for (const dashboard of manifest.dashboards) {
    if (!dashboard.name) errors.push('Dashboard name is required')
    if (!dashboard.purpose) errors.push(`Dashboard purpose is required: ${dashboard.name}`)
    if (!Array.isArray(dashboard.tiles) || dashboard.tiles.length === 0) {
      errors.push(`Dashboard must define at least one tile: ${dashboard.name}`)
      continue
    }

    requireUnique(
      dashboard.tiles.map((tile) => `${dashboard.name} / ${tile.title}`),
      'dashboard tile',
      errors,
    )

    for (const tile of dashboard.tiles) {
      if (!tile.title) errors.push(`Tile title is required: ${dashboard.name}`)
      if (!['trend', 'funnel'].includes(tile.type)) {
        errors.push(`Unsupported tile type in ${dashboard.name}: ${tile.title}`)
      }
      if (!Array.isArray(tile.events) || tile.events.length === 0) {
        errors.push(`Tile must contain events: ${dashboard.name} / ${tile.title}`)
        continue
      }

      requireUnique(tile.events, `${dashboard.name} / ${tile.title} event`, errors)
      for (const eventName of tile.events) {
        if (typeof eventName !== 'string' || !eventName.trim()) {
          errors.push(`Tile contains an invalid event: ${dashboard.name} / ${tile.title}`)
          continue
        }
        manifestEvents.add(eventName)
      }
    }
  }

  for (const eventName of [
    ...getApprovedProductEvents(),
    ...getMarketingAnalyticsEvents(),
    ...getBillingAnalyticsEvents(),
  ]) {
    if (!manifestEvents.has(eventName)) {
      errors.push(`Analytics event is missing from dashboards: ${eventName}`)
    }
  }

  return {
    errors,
    dashboardCount: manifest.dashboards.length,
    eventCount: manifestEvents.size,
  }
}

async function checkLiveDashboards(manifest) {
  const token = process.env.POSTHOG_PERSONAL_API_KEY
  const host = process.env.POSTHOG_HOST ?? 'https://us.posthog.com'
  const environmentId = process.env.POSTHOG_ENVIRONMENT_ID ?? String(manifest.project.id)

  if (!token) {
    throw new Error('POSTHOG_PERSONAL_API_KEY is required for --live')
  }

  const results = []
  for (const dashboard of manifest.dashboards) {
    if (!dashboard.posthogDashboardId) {
      results.push(`${dashboard.name}: no posthogDashboardId in manifest`)
      continue
    }

    const url = new URL(
      `/api/environments/${environmentId}/dashboards/${dashboard.posthogDashboardId}/`,
      host,
    )
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      results.push(`${dashboard.name}: live check failed with HTTP ${response.status}`)
      continue
    }

    const liveDashboard = await response.json()
    if (liveDashboard.name !== dashboard.name) {
      results.push(
        `${dashboard.name}: live dashboard name mismatch (${liveDashboard.name ?? 'unnamed'})`,
      )
    }
  }

  return results
}

async function main() {
  const manifest = readJson(manifestPath)
  const result = validateManifest(manifest)
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }

  if (process.argv.includes('--live')) {
    const liveErrors = await checkLiveDashboards(manifest)
    if (liveErrors.length > 0) {
      for (const error of liveErrors) console.error(`- ${error}`)
      process.exitCode = 1
      return
    }
  }

  console.log(
    `PostHog dashboard manifest is valid: ${result.dashboardCount} dashboards, ${result.eventCount} events.`,
  )
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main()
}
