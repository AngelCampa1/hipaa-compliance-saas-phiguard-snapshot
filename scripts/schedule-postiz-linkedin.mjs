#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { assertLinkedInPostsReviewed } from './linkedin-post-review-gate.mjs'
import { safeSpawnSync } from './safe-spawn.mjs'

const defaults = {
  apiBaseUrl: 'https://api.postiz.com/public/v1',
  csvPath:
    'docs/marketing/linkedin-content/2026-05-phiguard-manual-package/phiguard-linkedin-2026-05-06-to-2026-05-26.csv',
  integrationId: 'cmorqw6rt041hqi0yh876hjku',
  platformType: 'linkedin-page',
  statePath:
    'docs/marketing/linkedin-content/2026-05-phiguard-manual-package/postiz-linkedin-schedule-state.json',
  timezoneOffsetMinutes: -360,
  transport: 'cli',
}

const args = parseArgs(process.argv.slice(2))
const execute = Boolean(args.execute)
const statusOnly = Boolean(args.status)
const resetFailed = Boolean(args['reset-failed'])
const resetSkipped = Boolean(args['reset-skipped'])
const syncExisting = Boolean(args['sync-existing'])
const confirmPast = Boolean(args['allow-past'])
const csvPath = resolve(String(args.csv || defaults.csvPath))
const statePath = resolve(String(args.state || defaults.statePath))
const apiBaseUrl = String(args['api-base-url'] || process.env.POSTIZ_API_BASE_URL || defaults.apiBaseUrl).replace(/\/$/, '')
const integrationId = String(args.integration || defaults.integrationId)
const platformType = String(args.platform || defaults.platformType)
const transport = String(args.transport || defaults.transport)
const timezoneOffsetMinutes = Number(args['timezone-offset-minutes'] ?? defaults.timezoneOffsetMinutes)
const maxPosts = args.max ? Number(args.max) : Infinity
const startRow = args['start-row'] ? Number(args['start-row']) : 1
const onlyDate = args.date ? String(args.date) : ''
const delayMs = Number(args['delay-ms'] ?? (execute ? 125000 : 0))
const maxRetries = Number(args.retries ?? 5)
const apiKey = String(args['api-key'] || process.env.POSTIZ_API_KEY || '')

let stopping = false
process.on('SIGINT', () => {
  stopping = true
  console.log('\nReceived SIGINT. Finishing current request, saving state, then stopping.')
})
process.on('SIGTERM', () => {
  stopping = true
  console.log('\nReceived SIGTERM. Finishing current request, saving state, then stopping.')
})

if (args.help) {
  printHelp()
  process.exit(0)
}

if (!['cli', 'api'].includes(transport)) {
  throw new Error(`Unsupported --transport: ${transport}. Use "cli" or "api".`)
}

if (process.platform === 'win32' && transport === 'cli' && (execute || syncExisting)) {
  throw new Error('Postiz CLI transport is disabled on Windows for live operations. Use --transport api.')
}

if (transport === 'api' && (execute || syncExisting) && !apiKey) {
  throw new Error('POSTIZ_API_KEY is required when using --execute or --sync-existing.')
}

const rows = loadRows(csvPath)
assertLinkedInPostsReviewed(
  rows.map((row) => ({
    id: row.schedule_key,
    content: row.post_text,
    attachments: [],
    source: row.source_url_or_repo_path,
  })),
)
const state = loadState(statePath)

if (statusOnly && !resetFailed && !resetSkipped && !syncExisting) {
  printStatus(rows, state)
  process.exit(0)
}

if (resetFailed || resetSkipped) {
  for (const item of Object.values(state.posts)) {
    if (resetFailed && item.status === 'failed') item.status = 'pending'
    if (resetSkipped && item.status === 'skipped') item.status = 'pending'
  }
  saveState(statePath, state)
}

const selected = rows.filter((row) => {
  if (row.row_number < startRow) return false
  if (onlyDate && row.date !== onlyDate) return false
  return true
})

for (const row of rows) {
  if (!state.posts[row.schedule_key]) {
    state.posts[row.schedule_key] = {
      status: 'pending',
      row_number: row.row_number,
      date: row.date,
      suggested_time_cst: row.suggested_time_cst,
      post_number: row.post_number,
      content_hash: row.content_hash,
      attempts: 0,
    }
  }
}

saveState(statePath, state)

if (syncExisting) {
  const matched = await syncExistingScheduledPosts(rows, state, {
    apiKey,
    apiBaseUrl,
    timezoneOffsetMinutes,
    transport,
  })
  saveState(statePath, state)
  console.log(`Synced ${matched} existing Postiz posts into local state.`)
}

if (statusOnly) {
  printStatus(rows, state)
  process.exit(0)
}

if (!execute) {
  console.log('Dry run only. Add --execute to create scheduled Postiz posts.')
}

let processed = 0
let scheduledThisRun = 0
let skippedThisRun = 0
let failedThisRun = 0

for (const row of selected) {
  if (processed >= maxPosts || stopping) break

  const entry = state.posts[row.schedule_key]
  if (entry.status === 'scheduled') continue

  processed += 1

  if (row.review_status !== 'approved') {
    entry.status = 'skipped'
    entry.reason = `review_status is ${row.review_status}`
    entry.updated_at = new Date().toISOString()
    skippedThisRun += 1
    saveState(statePath, state)
    continue
  }

  if (row.post_text.length >= 3000) {
    entry.status = 'skipped'
    entry.reason = `post_text is ${row.post_text.length} characters`
    entry.updated_at = new Date().toISOString()
    skippedThisRun += 1
    saveState(statePath, state)
    continue
  }

  const scheduledAt = cstToUtcIso(row.date, row.suggested_time_cst, timezoneOffsetMinutes)
  if (!confirmPast && new Date(scheduledAt).getTime() <= Date.now()) {
    entry.status = 'skipped'
    entry.reason = `scheduled time is in the past: ${scheduledAt}`
    entry.updated_at = new Date().toISOString()
    skippedThisRun += 1
    saveState(statePath, state)
    continue
  }

  const payload = buildPayload(row, scheduledAt)
  entry.last_payload_preview = {
    date: payload.date,
    integration_id: integrationId,
    platform_type: platformType,
    content_hash: row.content_hash,
  }

  if (!execute) {
    console.log(`[dry-run] ${row.schedule_key} -> ${scheduledAt} (${row.post_text.length} chars)`)
    continue
  }

  entry.attempts = (entry.attempts || 0) + 1
  entry.updated_at = new Date().toISOString()
  saveState(statePath, state)

  try {
    const result = await createPostWithRetry(payload, {
      apiKey,
      apiBaseUrl,
      maxRetries,
      row,
      transport,
    })

    entry.status = 'scheduled'
    entry.postiz_response = result
    entry.scheduled_at_utc = scheduledAt
    entry.updated_at = new Date().toISOString()
    scheduledThisRun += 1
    saveState(statePath, state)

    console.log(
      `[scheduled] ${row.schedule_key} -> ${scheduledAt} (${scheduledThisRun} scheduled this run)`,
    )
  } catch (error) {
    entry.status = 'failed'
    entry.error = error.message
    entry.updated_at = new Date().toISOString()
    failedThisRun += 1
    saveState(statePath, state)
    console.error(`[failed] ${row.schedule_key}: ${error.message}`)
  }

  if (delayMs > 0 && processed < maxPosts && !stopping) {
    await sleep(delayMs)
  }
}

printStatus(rows, state)
console.log(
  `Run summary: processed=${processed}, scheduled=${scheduledThisRun}, skipped=${skippedThisRun}, failed=${failedThisRun}`,
)

if (failedThisRun > 0) {
  process.exitCode = 1
}

function parseArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--') continue
    if (!arg.startsWith('--')) continue
    const trimmed = arg.slice(2)
    const [key, inlineValue] = trimmed.split('=', 2)
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue
      continue
    }

    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      parsed[key] = next
      i += 1
      continue
    }

    parsed[key] = true
  }

  return parsed
}

function loadRows(filePath) {
  const raw = readFileSync(filePath, 'utf8')
  const parsed = parseCsv(raw)
  const header = parsed.shift()
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))
  const required = [
    'date',
    'suggested_time_cst',
    'post_number',
    'pillar',
    'source_url_or_repo_path',
    'post_text',
    'cta_type',
    'review_status',
    'notes',
  ]

  for (const column of required) {
    if (!(column in index)) throw new Error(`Missing CSV column: ${column}`)
  }

  return parsed
    .filter((row) => row.some(Boolean))
    .map((row, idx) => {
      const record = Object.fromEntries(required.map((column) => [column, row[index[column]] || '']))
      const postNumber = Number(record.post_number)
      const contentHash = sha256(record.post_text)
      const scheduleKey = `${record.date}-${String(postNumber).padStart(2, '0')}-${contentHash.slice(0, 12)}`

      return {
        ...record,
        post_number: postNumber,
        row_number: idx + 1,
        content_hash: contentHash,
        schedule_key: scheduleKey,
      }
    })
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function loadState(filePath) {
  if (!existsSync(filePath)) {
    return {
      version: 1,
      created_at: new Date().toISOString(),
      posts: {},
    }
  }

  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function saveState(filePath, state) {
  mkdirSync(dirname(filePath), { recursive: true })
  const next = {
    ...state,
    updated_at: new Date().toISOString(),
  }
  const tmp = `${filePath}.tmp`
  writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`)
  renameSync(tmp, filePath)
  Object.assign(state, next)
}

function cstToUtcIso(date, time, offsetMinutes) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Invalid date: ${date}`)
  if (!/^\d{2}:\d{2}$/.test(time)) throw new Error(`Invalid time: ${time}`)

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60 * 1000

  return new Date(utcMs).toISOString()
}

function buildPayload(row, scheduledAt) {
  return {
    type: 'schedule',
    date: scheduledAt,
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: {
          id: integrationId,
        },
        value: [
          {
            content: row.post_text,
            image: [],
          },
        ],
        settings: {
          __type: platformType,
        },
      },
    ],
  }
}

async function createPostWithRetry(payload, options) {
  let lastError

  for (let attempt = 1; attempt <= options.maxRetries; attempt += 1) {
    const result =
      options.transport === 'cli'
        ? createPostWithCli(payload, options.row)
        : await createPostWithApi(payload, options)

    if (result.ok) return result.body

    const retryable = result.retryable
    lastError = new Error(result.message)

    if (!retryable || attempt === options.maxRetries) break

    const backoffMs =
      result.retryAfterSeconds > 0
        ? result.retryAfterSeconds * 1000
        : Math.min(60000, 2000 * 2 ** (attempt - 1))
    console.log(`[retry] waiting ${Math.round(backoffMs / 1000)}s before attempt ${attempt + 1}`)
    await sleep(backoffMs)
  }

  throw lastError
}

async function createPostWithApi(payload, options) {
  const response = await fetch(`${options.apiBaseUrl}/posts`, {
    method: 'POST',
    headers: {
      Authorization: options.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const bodyText = await response.text()
  const body = parseJsonMaybe(bodyText)

  if (response.ok) return { ok: true, body }

  return {
    ok: false,
    retryAfterSeconds: Number(response.headers.get('retry-after') || 0),
    retryable: response.status === 429 || response.status >= 500,
    message: `Postiz returned ${response.status}${bodyText ? `: ${bodyText.slice(0, 500)}` : ''}`,
  }
}

function createPostWithCli(payload, row) {
  const result = runCommand([
    'postiz',
    'posts:create',
    '--content',
    row.post_text,
    '--date',
    payload.date,
    '--integrations',
    integrationId,
    '--type',
    'schedule',
  ])
  const output = `${result.stdout || ''}${result.stderr || ''}`

  if (result.status === 0) {
    return {
      ok: true,
      body: {
        transport: 'cli',
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      },
    }
  }

  return {
    ok: false,
    retryAfterSeconds: retryAfterFromText(output),
    retryable: /rate|429|timeout|temporar|ECONNRESET|ETIMEDOUT|5\d\d/i.test(output),
    message: `postiz CLI failed with exit ${result.status}: ${output.slice(0, 1000)}`,
  }
}

async function syncExistingScheduledPosts(rows, state, options) {
  if (rows.length === 0) return 0

  const dates = rows
    .map((row) => cstToUtcIso(row.date, row.suggested_time_cst, options.timezoneOffsetMinutes))
    .map((date) => new Date(date).getTime())
  const startDate = new Date(Math.min(...dates) - 24 * 60 * 60 * 1000).toISOString()
  const endDate = new Date(Math.max(...dates) + 24 * 60 * 60 * 1000).toISOString()
  const body =
    options.transport === 'cli'
      ? listExistingPostsWithCli(startDate, endDate)
      : await listExistingPostsWithApi(startDate, endDate, options)

  const existing = new Map()
  for (const post of body?.posts || []) {
    if (post.integration?.id !== integrationId) continue
    const minute = minuteKey(post.publishDate)
    const hash = sha256(post.content || '')
    existing.set(`${minute}:${hash}`, post)
  }

  let matched = 0
  for (const row of rows) {
    const scheduledAt = cstToUtcIso(row.date, row.suggested_time_cst, options.timezoneOffsetMinutes)
    const existingPost = existing.get(`${minuteKey(scheduledAt)}:${row.content_hash}`)
    if (!existingPost) continue

    const entry = state.posts[row.schedule_key]
    entry.status = 'scheduled'
    entry.scheduled_at_utc = scheduledAt
    entry.postiz_existing = {
      id: existingPost.id,
      publishDate: existingPost.publishDate,
      state: existingPost.state,
      releaseURL: existingPost.releaseURL,
    }
    entry.updated_at = new Date().toISOString()
    matched += 1
  }

  return matched
}

async function listExistingPostsWithApi(startDate, endDate, options) {
  const url = new URL(`${options.apiBaseUrl}/posts`)
  url.searchParams.set('startDate', startDate)
  url.searchParams.set('endDate', endDate)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: options.apiKey,
    },
  })
  const bodyText = await response.text()
  const body = parseJsonMaybe(bodyText)

  if (!response.ok) {
    throw new Error(
      `Could not list existing Postiz posts: ${response.status}${bodyText ? `: ${bodyText.slice(0, 500)}` : ''}`,
    )
  }

  return body
}

function listExistingPostsWithCli(startDate, endDate) {
  const result = runCommand([
    'postiz',
    'posts:list',
    '--startDate',
    startDate,
    '--endDate',
    endDate,
  ])
  const output = `${result.stdout || ''}${result.stderr || ''}`

  if (result.status !== 0) {
    throw new Error(`Could not list existing Postiz posts through CLI: ${output.slice(0, 1000)}`)
  }

  return parseJsonFromCliOutput(output)
}

function runCommand(command) {
  return safeSpawnSync(command[0], command.slice(1), {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
  })
}

function parseJsonFromCliOutput(output) {
  const start = output.indexOf('{')
  const end = output.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Could not find JSON in CLI output: ${output.slice(0, 1000)}`)
  }

  return JSON.parse(output.slice(start, end + 1))
}

function retryAfterFromText(output) {
  const match = output.match(/retry(?:-|\s*)after[^0-9]*(\d+)/i)
  return match ? Number(match[1]) : 0
}

function parseJsonMaybe(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function minuteKey(value) {
  const date = new Date(value)
  date.setSeconds(0, 0)
  return date.toISOString()
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function printStatus(rows, state) {
  const counts = {
    total: rows.length,
    pending: 0,
    scheduled: 0,
    failed: 0,
    skipped: 0,
  }

  for (const row of rows) {
    const status = state.posts[row.schedule_key]?.status || 'pending'
    counts[status] = (counts[status] || 0) + 1
  }

  console.log(
    `Status: total=${counts.total}, scheduled=${counts.scheduled}, pending=${counts.pending}, failed=${counts.failed}, skipped=${counts.skipped}`,
  )
  console.log(`State: ${statePath}`)
}

function printHelp() {
  console.log(`Schedule PHIGuard LinkedIn posts through the authenticated Postiz CLI by default.
On Windows, live scheduling requires --transport api.

Safe dry run:
  pnpm postiz:linkedin:schedule

Live scheduling:
  pnpm postiz:linkedin:schedule -- --execute

Check progress:
  pnpm postiz:linkedin:schedule -- --status

Useful options:
  --max 5                    Process at most 5 pending posts
  --date 2026-05-10          Process only one content date
  --start-row 120            Start at CSV row 120
  --delay-ms 125000          Delay between API calls; default live delay respects Postiz 30/hour limit
  --allow-past               Allow scheduling dates that are earlier than the current clock
  --reset-failed             Move failed entries back to pending
  --reset-skipped            Move skipped entries back to pending
  --sync-existing            Query Postiz and mark exact content/date matches as scheduled
  --transport cli|api        Use authenticated Postiz CLI or public API; default: cli
  --csv path/to/file.csv     Use a different CSV
  --state path/to/state.json Use a different state file
  --integration id           Override the LinkedIn Page integration id
  --api-base-url url         Override Postiz API base URL for self-hosted installs
`)
}
