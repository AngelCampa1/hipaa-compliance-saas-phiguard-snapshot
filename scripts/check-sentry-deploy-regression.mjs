const requiredEnv = ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG']
const missing = requiredEnv.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(`Missing required Sentry environment variable(s): ${missing.join(', ')}`)
  console.error('Set SENTRY_AUTH_TOKEN and SENTRY_ORG. Optionally set SENTRY_PROJECTS.')
  process.exit(1)
}

const since = parseSince(process.argv)
const org = process.env.SENTRY_ORG
const projects = (process.env.SENTRY_PROJECTS ?? 'phiguard-app-client,phiguard-marketing,phiguard-worker')
  .split(',')
  .map((project) => project.trim())
  .filter(Boolean)

if (!since) {
  console.error('Usage: pnpm sentry:deploy-check -- --since=<timestamp-or-iso>')
  process.exit(1)
}

let failures = 0
for (const project of projects) {
  const issues = await fetchProjectIssues({ org, project, since })
  if (issues.length > 0) {
    failures += 1
    console.error(`not ok - ${project}: ${issues.length} unresolved production issue(s) since ${since.toISOString()}`)
    for (const issue of issues.slice(0, 10)) {
      console.error(`  ${issue.shortId ?? issue.id}: ${issue.title ?? issue.culprit ?? 'Untitled issue'}`)
    }
    continue
  }

  console.log(`ok - ${project}`)
}

if (failures > 0) {
  process.exit(1)
}

function parseSince(argv) {
  const raw = argv.find((arg) => arg.startsWith('--since='))?.slice('--since='.length)
  if (!raw) return null

  const asNumber = Number(raw)
  const date = Number.isFinite(asNumber) && raw.trim() !== ''
    ? new Date(asNumber)
    : new Date(raw)

  return Number.isNaN(date.getTime()) ? null : date
}

async function fetchProjectIssues({ org, project, since }) {
  const search = new URLSearchParams({
    environment: 'production',
    query: `is:unresolved firstSeen:>=${since.toISOString()}`,
    statsPeriod: '14d',
  })
  const url = `https://sentry.io/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/issues/?${search.toString()}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Sentry request failed for ${project}: ${response.status} ${body}`)
  }

  return response.json()
}
