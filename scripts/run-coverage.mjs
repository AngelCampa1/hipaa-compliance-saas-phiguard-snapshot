#!/usr/bin/env node
/**
 * Runs vitest with v8 coverage across every workspace that has tests, then
 * aggregates the per-package summaries into portfolio/coverage.json.
 *
 *   node scripts/run-coverage.mjs                  # every package
 *   node scripts/run-coverage.mjs @phiguard/db     # one or more packages
 *
 * Coverage is deliberately measured per package rather than repo-wide: the
 * workspaces run on two different vitest majors (2.1.9 and 3.2.4) and several
 * need their own environment setup, so a single merged run would either drop
 * packages or misreport them.
 *
 * Packages that fail or time out are recorded with the reason instead of being
 * silently dropped from the average.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(repoRoot, 'portfolio', 'coverage.json')

/**
 * `skip` marks packages that genuinely have no tests to measure, so that the
 * report distinguishes "nothing to cover" from "failed to measure".
 */
const PACKAGES = [
  { name: '@phiguard/web', dir: 'apps/web', timeoutMs: 30 * 60_000 },
  { name: '@phiguard/marketing', dir: 'apps/marketing' },
  { name: '@phiguard/audit', dir: 'packages/audit' },
  { name: '@phiguard/auth', dir: 'packages/auth' },
  { name: '@phiguard/baa', dir: 'packages/baa' },
  { name: '@phiguard/billing', dir: 'packages/billing' },
  { name: '@phiguard/brand', dir: 'packages/brand', skip: 'no test files' },
  { name: '@phiguard/compliance', dir: 'packages/compliance', timeoutMs: 20 * 60_000 },
  { name: '@phiguard/config', dir: 'packages/config', skip: 'config presets only, no source' },
  { name: '@phiguard/db', dir: 'packages/db', timeoutMs: 20 * 60_000 },
  { name: '@phiguard/email', dir: 'packages/email' },
  { name: '@phiguard/integration', dir: 'packages/integration', timeoutMs: 20 * 60_000 },
  { name: '@phiguard/knowledge', dir: 'packages/knowledge' },
  { name: '@phiguard/lead-magnets', dir: 'packages/lead-magnets' },
  { name: '@phiguard/marketing-db', dir: 'packages/marketing-db' },
  { name: '@phiguard/pdf', dir: 'packages/pdf' },
  { name: '@phiguard/ui', dir: 'packages/ui' },
]

const COVERAGE_ARGS = [
  'run',
  '--coverage',
  '--coverage.provider=v8',
  '--coverage.reporter=json-summary',
  '--coverage.reporter=text-summary',
  '--coverage.include=src/**',
  '--coverage.exclude=**/*.test.*',
  '--coverage.exclude=**/*.spec.*',
  '--coverage.exclude=**/__tests__/**',
  '--coverage.exclude=**/__fixtures__/**',
  '--coverage.exclude=**/*.d.ts',
  '--coverage.exclude=**/*.gen.*',
]

const DEFAULT_TIMEOUT_MS = 10 * 60_000

const requested = process.argv.slice(2)
const selected = requested.length > 0
  ? PACKAGES.filter((pkg) => requested.includes(pkg.name) || requested.includes(pkg.dir))
  : PACKAGES

if (selected.length === 0) {
  console.error(`No matching packages. Known: ${PACKAGES.map((p) => p.name).join(', ')}`)
  process.exit(1)
}

function attempt(pkg) {
  const cwd = join(repoRoot, pkg.dir)
  const summaryPath = join(cwd, 'coverage', 'coverage-summary.json')

  // Remove any stale summary so a crashed run can't be read as a success.
  rmSync(summaryPath, { force: true })

  const result = spawnSync('pnpm', ['exec', 'vitest', ...COVERAGE_ARGS], {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: pkg.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  })

  if (!existsSync(summaryPath)) {
    const reason = result.error?.message
      ?? (result.signal ? `killed by ${result.signal} (timeout)` : `vitest exited ${result.status}`)
    return { status: 'failed', reason, exitCode: result.status ?? null }
  }

  const { total } = JSON.parse(readFileSync(summaryPath, 'utf8'))

  return {
    status: result.status === 0 ? 'ok' : 'tests-failed',
    exitCode: result.status ?? null,
    ...countTests(`${result.stdout ?? ''}${result.stderr ?? ''}`),
    statements: total.statements,
    branches: total.branches,
    functions: total.functions,
    lines: total.lines,
  }
}

/**
 * Several suites gate their Postgres-backed tests on a container runtime being
 * available (`hasContainerRuntime()`), and vitest exits 0 when those are
 * skipped. Without this, a run on a machine with Docker stopped reports a much
 * lower number with no indication that anything was missing — which is exactly
 * how a published coverage figure becomes a lie. Record the skip count so the
 * report says what it actually measured.
 */
function countTests(output) {
  // vitest omits segments that are zero, so "N passed" is absent when every
  // test in a run failed and "N skipped" is absent when none were. Parse the
  // segments independently rather than assuming a fixed shape.
  const line = output.match(/Tests\s+((?:\d+ \w+(?:\s*\|\s*)?)+)/)
  if (!line) return {}

  const segment = (label) => {
    const found = line[1].match(new RegExp(`(\\d+) ${label}`))
    return found ? Number(found[1]) : 0
  }

  return {
    testsPassed: segment('passed'),
    testsFailed: segment('failed'),
    testsSkipped: segment('skipped'),
  }
}

/**
 * Several packages share one Postgres instance and recreate their schema on
 * setup, so back-to-back runs can collide. One retry clears that; a package
 * that fails twice is reported as failed rather than dropped.
 */
function runPackage(pkg) {
  const first = attempt(pkg)
  if (first.status !== 'failed') return first

  const second = attempt(pkg)
  return second.status === 'failed' ? second : { ...second, retried: true }
}

/**
 * A subset run re-measures only what was asked for and keeps the rest of the
 * previous report. Without this, `run-coverage.mjs @phiguard/db` would drop
 * every other package from the file and publish an aggregate computed from one
 * package, which is worse than not re-running at all. Each entry carries its own
 * `measuredAt` so a mixed-date report says so on its face.
 */
const previous = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')).packages ?? {} : {}
const results = requested.length > 0 ? { ...previous } : {}
const today = new Date().toISOString().slice(0, 10)

for (const pkg of selected) {
  if (pkg.skip) {
    results[pkg.name] = { status: 'skipped', reason: pkg.skip, measuredAt: today }
    console.log(`- ${pkg.name}: skipped (${pkg.skip})`)
    continue
  }

  process.stdout.write(`- ${pkg.name}: running... `)
  const result = { ...runPackage(pkg), measuredAt: today }
  results[pkg.name] = result

  if (result.status === 'failed') {
    console.log(`FAILED (${result.reason})`)
    continue
  }

  const notes = []
  if (result.status === 'tests-failed') notes.push('tests failing')
  if (result.testsSkipped > 0) notes.push(`${result.testsSkipped} tests skipped`)
  const suffix = notes.length > 0 ? ` [${notes.join(', ')}]` : ''
  console.log(`${result.statements.pct}% statements${suffix}`)
}

const emptyTotals = () => ({ statements: [0, 0], branches: [0, 0], functions: [0, 0], lines: [0, 0] })

const totals = emptyTotals()
// Second cut over packages/* only. The repo's testing policy (CLAUDE.md) is to
// test logic and server functions but not markup rendering, so the two apps and
// the presentational component library are expected to score low. Reporting the
// shared-package figure alongside the overall one makes that visible instead of
// hiding it inside one blended number.
const sharedTotals = emptyTotals()

// Aggregates are derived from the merged results rather than accumulated during
// the loop, so a subset run still totals every package in the report.
for (const [name, result] of Object.entries(results)) {
  // A package whose suite went red still emits a coverage summary. Counting it
  // toward the headline figure would let a broken suite prop up the number, so
  // only clean runs contribute — the per-package entry still records what
  // happened.
  if (result.status !== 'ok') continue
  const dir = PACKAGES.find((pkg) => pkg.name === name)?.dir ?? ''
  const isSharedDomainPackage = dir.startsWith('packages/') && name !== '@phiguard/ui'

  for (const metric of ['statements', 'branches', 'functions', 'lines']) {
    totals[metric][0] += result[metric].covered
    totals[metric][1] += result[metric].total
    if (!isSharedDomainPackage) continue
    sharedTotals[metric][0] += result[metric].covered
    sharedTotals[metric][1] += result[metric].total
  }
}

const pct = ([covered, total]) => (total === 0 ? 0 : Number(((covered / total) * 100).toFixed(2)))

const summarize = (bucket) => ({
  statements: pct(bucket.statements),
  branches: pct(bucket.branches),
  functions: pct(bucket.functions),
  lines: pct(bucket.lines),
  coveredStatements: bucket.statements[0],
  totalStatements: bucket.statements[1],
})

const report = {
  generatedBy: 'scripts/run-coverage.mjs',
  generatedAt: new Date().toISOString().slice(0, 10),
  provider: 'v8',
  note:
    'Aggregates sum covered/total across cleanly measured packages rather than averaging '
    + 'percentages. Anything not status "ok" — skipped, failed, or measured with a red suite — '
    + 'contributes nothing. Each package carries the date it was measured; a subset re-run '
    + 'leaves the others at their earlier date rather than restating them.',
  aggregate: summarize(totals),
  sharedPackagesAggregate: {
    ...summarize(sharedTotals),
    scope: 'packages/* excluding @phiguard/ui — the domain, data, auth, billing and compliance layer',
  },
  packages: results,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)

console.log('')
console.log(
  `Aggregate:        ${report.aggregate.statements}% statements, `
  + `${report.aggregate.branches}% branches, ${report.aggregate.functions}% functions `
  + `(${totals.statements[0]}/${totals.statements[1]} statements)`,
)
console.log(
  `Shared packages:  ${report.sharedPackagesAggregate.statements}% statements, `
  + `${report.sharedPackagesAggregate.branches}% branches, `
  + `${report.sharedPackagesAggregate.functions}% functions `
  + `(${sharedTotals.statements[0]}/${sharedTotals.statements[1]} statements)`,
)
console.log(`Wrote ${outPath}`)

const failed = Object.entries(results).filter(([, r]) => r.status === 'failed')
if (failed.length > 0) {
  console.log('')
  console.log('Could not measure:')
  for (const [name, r] of failed) console.log(`  - ${name}: ${r.reason}`)
}

const partial = Object.entries(results).filter(([, r]) => r.testsSkipped > 0)
if (partial.length > 0) {
  console.log('')
  console.log('Measured with tests skipped — these numbers understate real coverage:')
  for (const [name, r] of partial) {
    console.log(`  - ${name}: ${r.testsSkipped} of ${r.testsPassed + r.testsSkipped} skipped`)
  }
  console.log('  Start Docker (container-gated integration suites) and re-run.')
}
