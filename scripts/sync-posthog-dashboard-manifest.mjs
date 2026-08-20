#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { validateManifest } from './validate-posthog-dashboard-manifest.mjs'

const manifestPath = resolve('docs/posthog-dashboard-manifest.json')
const DEFAULT_POSTHOG_HOST = 'https://us.posthog.com'
const INSIGHT_NAME_PREFIX = '[PHIGuard IaC]'

function readManifest(path = manifestPath) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function eventSeries(eventName) {
  return {
    kind: 'EventsNode',
    event: eventName,
    name: eventName,
  }
}

export function buildInsightPayload(dashboardId, dashboard, tile) {
  const source =
    tile.type === 'funnel'
      ? {
          kind: 'FunnelsQuery',
          dateRange: { date_from: '-30d' },
          series: tile.events.map(eventSeries),
        }
      : {
          kind: 'TrendsQuery',
          interval: 'day',
          dateRange: { date_from: '-30d' },
          series: tile.events.map(eventSeries),
          trendsFilter: { display: 'ActionsLineGraph' },
        }

  return {
    name: `${INSIGHT_NAME_PREFIX} ${tile.title}`,
    description: `${dashboard.purpose}\n\nEvents: ${tile.events.join(', ')}`,
    dashboards: [dashboardId],
    tags: ['phiguard', 'dashboard-manifest'],
    query: {
      kind: 'InsightVizNode',
      source,
    },
  }
}

export function buildPostHogUrl(host, environmentId, path) {
  return new URL(`/api/environments/${environmentId}${path}`, host)
}

export function buildDashboardSyncOperations(
  manifest,
  {
    host = process.env.POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
    environmentId = process.env.POSTHOG_ENVIRONMENT_ID ?? String(manifest.project.id),
  } = {},
) {
  const operations = []

  for (const dashboard of manifest.dashboards) {
    const dashboardId = dashboard.posthogDashboardId
    if (!dashboardId) continue

    operations.push({
      method: 'PATCH',
      url: buildPostHogUrl(host, environmentId, `/dashboards/${dashboardId}/`).toString(),
      body: {
        name: dashboard.name,
        description: dashboard.purpose,
      },
    })

    for (const tile of dashboard.tiles) {
      const insightPayload = buildInsightPayload(dashboardId, dashboard, tile)
      const listUrl = buildPostHogUrl(host, environmentId, '/insights/')
      listUrl.searchParams.set('dashboards', String(dashboardId))
      listUrl.searchParams.set('limit', '500')

      operations.push({
        method: 'GET',
        url: listUrl.toString(),
        matchInsightName: insightPayload.name,
      })
      operations.push({
        method: 'POST',
        url: buildPostHogUrl(host, environmentId, '/insights/').toString(),
        body: insightPayload,
        matchInsightName: insightPayload.name,
      })
    }
  }

  return operations
}

async function requestJson(operation, token) {
  const response = await fetch(operation.url, {
    method: operation.method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(operation.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: operation.body ? JSON.stringify(operation.body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${operation.method} ${operation.url} failed: HTTP ${response.status} ${text}`)
  }

  if (response.status === 204) return null
  return response.json()
}

function findExistingInsight(response, name) {
  const results = Array.isArray(response?.results) ? response.results : []
  return results.find((insight) => insight?.name === name && Number.isInteger(insight.id))
}

export async function executeDashboardSync(
  manifest,
  {
    token,
    host = process.env.POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
    environmentId = process.env.POSTHOG_ENVIRONMENT_ID ?? String(manifest.project.id),
    log = console.log,
  },
) {
  if (!token) throw new Error('POSTHOG_PERSONAL_API_KEY is required for --execute')

  let created = 0
  let updated = 0

  for (const dashboard of manifest.dashboards) {
    if (!dashboard.posthogDashboardId) continue

    await requestJson(
      {
        method: 'PATCH',
        url: buildPostHogUrl(host, environmentId, `/dashboards/${dashboard.posthogDashboardId}/`),
        body: { name: dashboard.name, description: dashboard.purpose },
      },
      token,
    )
    updated += 1

    for (const tile of dashboard.tiles) {
      const payload = buildInsightPayload(dashboard.posthogDashboardId, dashboard, tile)
      const listUrl = buildPostHogUrl(host, environmentId, '/insights/')
      listUrl.searchParams.set('dashboards', String(dashboard.posthogDashboardId))
      listUrl.searchParams.set('limit', '500')
      const existing = findExistingInsight(
        await requestJson({ method: 'GET', url: listUrl.toString() }, token),
        payload.name,
      )

      if (existing) {
        await requestJson(
          {
            method: 'PATCH',
            url: buildPostHogUrl(host, environmentId, `/insights/${existing.id}/`),
            body: payload,
          },
          token,
        )
        updated += 1
      } else {
        await requestJson(
          {
            method: 'POST',
            url: buildPostHogUrl(host, environmentId, '/insights/'),
            body: payload,
          },
          token,
        )
        created += 1
      }
    }
  }

  log(`PostHog dashboard sync complete: ${updated} updated, ${created} created.`)
  return { updated, created }
}

function printDryRun(manifest) {
  const operations = buildDashboardSyncOperations(manifest)
  console.log(
    `PostHog dashboard sync dry run: ${manifest.dashboards.length} dashboards, ${operations.length} planned API operations.`,
  )
  for (const operation of operations) {
    console.log(`${operation.method} ${operation.url}`)
  }
}

async function main() {
  const manifest = readManifest()
  const result = validateManifest(manifest)
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }

  if (!process.argv.includes('--execute')) {
    printDryRun(manifest)
    return
  }

  await executeDashboardSync(manifest, {
    token: process.env.POSTHOG_PERSONAL_API_KEY,
  })
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main()
}
