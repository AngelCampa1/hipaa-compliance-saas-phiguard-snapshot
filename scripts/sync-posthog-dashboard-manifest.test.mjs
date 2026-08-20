import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  buildDashboardSyncOperations,
  buildInsightPayload,
  buildPostHogUrl,
  executeDashboardSync,
} from './sync-posthog-dashboard-manifest.mjs'

const scriptPath = 'scripts/sync-posthog-dashboard-manifest.mjs'

const sampleManifest = {
  version: 1,
  project: { name: 'Test', id: 397280 },
  dashboards: [
    {
      name: 'PHIGuard - Test',
      posthogDashboardId: 123,
      purpose: 'Test dashboard.',
      tiles: [
        {
          title: 'App Activity',
          type: 'trend',
          events: ['app_session_started', 'app_page_viewed'],
        },
        {
          title: 'Signup Funnel',
          type: 'funnel',
          events: ['signup_started', 'signup_completed'],
        },
      ],
    },
  ],
}

test('builds dashboard update and insight upsert operations from the manifest', () => {
  const operations = buildDashboardSyncOperations(sampleManifest, {
    host: 'https://us.posthog.com',
    environmentId: '397280',
  })

  assert.equal(operations.length, 5)
  assert.deepEqual(operations.map((operation) => operation.method), [
    'PATCH',
    'GET',
    'POST',
    'GET',
    'POST',
  ])
  assert.match(operations[0].url, /\/api\/environments\/397280\/dashboards\/123\/$/)
  assert.deepEqual(operations[0].body, {
    name: 'PHIGuard - Test',
    description: 'Test dashboard.',
  })
  assert.match(operations[1].url, /\/api\/environments\/397280\/insights\/\?/)
  assert.match(operations[1].url, /dashboards=123/)
  assert.equal(operations[2].body.name, '[PHIGuard IaC] App Activity')
  assert.deepEqual(operations[2].body.dashboards, [123])
})

test('creates trend and funnel insight payloads with explicit event series', () => {
  const trend = buildInsightPayload(123, sampleManifest.dashboards[0], sampleManifest.dashboards[0].tiles[0])
  const funnel = buildInsightPayload(123, sampleManifest.dashboards[0], sampleManifest.dashboards[0].tiles[1])

  assert.equal(trend.query.kind, 'InsightVizNode')
  assert.equal(trend.query.source.kind, 'TrendsQuery')
  assert.deepEqual(
    trend.query.source.series.map((series) => series.event),
    ['app_session_started', 'app_page_viewed'],
  )
  assert.equal(funnel.query.source.kind, 'FunnelsQuery')
  assert.deepEqual(
    funnel.query.source.series.map((series) => series.event),
    ['signup_started', 'signup_completed'],
  )
  assert.match(trend.description, /Test dashboard/)
  assert.match(trend.description, /app_session_started/)
  assert.deepEqual(trend.tags, ['phiguard', 'dashboard-manifest'])
})

test('builds PostHog API URLs without shell interpolation', () => {
  assert.equal(
    buildPostHogUrl('https://us.posthog.com/', '397280', '/dashboards/123/').toString(),
    'https://us.posthog.com/api/environments/397280/dashboards/123/',
  )

  const source = readFileSync(scriptPath, 'utf8')
  assert.doesNotMatch(source, /execSync|execFileSync|spawnSync|shell:/)
})

test('dry-run prints the planned PostHog sync operations', () => {
  const output = execFileSync(process.execPath, [scriptPath, '--dry-run'], { encoding: 'utf8' })

  assert.match(output, /PostHog dashboard sync dry run/)
  assert.match(output, /PATCH .*\/dashboards\/1556997\//)
  assert.match(output, /POST .*\/insights\//)
})

test('execute mode patches existing manifest-managed insights and creates missing ones', async () => {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init })

    if (String(url).includes('/insights/?') && calls.filter((call) => String(call.url).includes('/insights/?')).length === 1) {
      return new Response(
        JSON.stringify({
          results: [{ id: 456, name: '[PHIGuard IaC] App Activity' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (String(url).includes('/insights/?')) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ id: 1 }), {
      status: init.method === 'POST' ? 201 : 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = await executeDashboardSync(sampleManifest, {
      token: 'phx_test',
      host: 'https://us.posthog.com',
      environmentId: '397280',
      log: () => undefined,
    })

    assert.deepEqual(result, { updated: 2, created: 1 })
    assert(calls.some((call) => call.init.method === 'PATCH' && String(call.url).includes('/dashboards/123/')))
    assert(calls.some((call) => call.init.method === 'PATCH' && String(call.url).includes('/insights/456/')))
    assert(calls.some((call) => call.init.method === 'POST' && String(call.url).endsWith('/insights/')))
  } finally {
    globalThis.fetch = originalFetch
  }
})
