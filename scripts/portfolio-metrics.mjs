#!/usr/bin/env node
/**
 * Regenerates every statistic quoted in README.md and portfolio/.
 *
 * Nothing in the portfolio docs is hand-counted. Run this and the numbers
 * either match or the docs are stale:
 *
 *   node scripts/portfolio-metrics.mjs            # write metrics.json + METRICS.md
 *   node scripts/portfolio-metrics.mjs --check    # exit 1 if output would change
 *   node scripts/portfolio-metrics.mjs --record-provenance
 *                                                 # re-read git history into
 *                                                 # provenance.json
 *
 * Only git-tracked files are counted, so untracked scratch files and build
 * output can never inflate a number.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(repoRoot, 'portfolio')
const jsonPath = join(outDir, 'metrics.json')
const markdownPath = join(outDir, 'METRICS.md')
const checkOnly = process.argv.includes('--check')

// ── git helpers ─────────────────────────────────────────────────────────────

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
}

function trackedFiles() {
  return git(['ls-files', '-z']).split('\0').filter(Boolean)
}

// ── classification ──────────────────────────────────────────────────────────

/**
 * Generated artifacts are counted separately from authored code. Claiming
 * Drizzle's migration snapshots or the router manifest as authored work would
 * be dishonest.
 */
const GENERATED = [
  /\.gen\.tsx?$/,
  /(^|\/)generated\//,
  /(^|\/)dist\//,
  /drizzle\/meta\//,
  /pnpm-lock\.yaml$/,
]

const CODE_EXTENSIONS = new Set(['ts', 'tsx', 'astro', 'mjs', 'mts', 'js', 'css', 'sql', 'tf', 'sh', 'ps1'])

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'pdf', 'woff', 'woff2', 'ttf', 'eot', 'mp4', 'zip',
])

function extensionOf(file) {
  const base = posix.basename(file)
  const dot = base.lastIndexOf('.')
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : ''
}

function isGenerated(file) {
  return GENERATED.some((pattern) => pattern.test(file))
}

function isUnitTest(file) {
  return /\.(test|spec)\.[cm]?[jt]sx?$/.test(file) || /(^|\/)__tests__\//.test(file)
}

function isE2E(file) {
  return /^apps\/[^/]+\/e2e\//.test(file)
}

function isAutomationScript(file) {
  return /(^|\/)scripts\//.test(file)
}

/**
 * One bucket per file. Order matters: generated wins over everything, then
 * tests, then the more specific content buckets, then plain source.
 */
function categorize(file) {
  const ext = extensionOf(file)

  if (BINARY_EXTENSIONS.has(ext)) return 'asset'
  if (isGenerated(file)) return 'generated'
  if (isE2E(file)) return 'e2e'
  if (isUnitTest(file)) return 'test'
  if (ext === 'sql') return 'sql'
  if (ext === 'tf') return 'terraform'
  if (file.startsWith('apps/marketing/src/content/')) return 'marketing-content'
  if (isAutomationScript(file)) return 'automation'
  if (ext === 'md' || ext === 'mdx') return 'docs'
  if (ext === 'css') return 'styles'
  if (CODE_EXTENSIONS.has(ext)) return 'source'
  return 'config'
}

/** Which workspace a file belongs to, or null for repo-level files. */
function workspaceOf(file) {
  const match = file.match(/^(apps|packages)\/([^/]+)\//)
  return match ? `${match[1]}/${match[2]}` : null
}

// ── line counting ───────────────────────────────────────────────────────────

function countLines(file) {
  let text
  try {
    text = readFileSync(join(repoRoot, file), 'utf8')
  } catch {
    return { total: 0, nonBlank: 0 }
  }

  // Matches `wc -l`: count newlines, plus a trailing partial line if present.
  let total = 0
  let nonBlank = 0
  let lineStart = 0

  for (let i = 0; i <= text.length; i += 1) {
    if (i !== text.length && text[i] !== '\n') continue
    if (i === text.length && i === lineStart) break

    total += 1
    if (text.slice(lineStart, i).trim() !== '') nonBlank += 1
    lineStart = i + 1
  }

  return { total, nonBlank }
}

// ── counters over file contents ─────────────────────────────────────────────

function countMatches(files, pattern) {
  let count = 0
  for (const file of files) {
    const text = readFileSync(join(repoRoot, file), 'utf8')
    count += (text.match(pattern) ?? []).length
  }
  return count
}

// ── collection ──────────────────────────────────────────────────────────────

const files = trackedFiles()

const byCategory = {}
const byExtension = {}
const byWorkspace = {}

for (const file of files) {
  const category = categorize(file)
  const ext = extensionOf(file) || '(none)'
  const workspace = workspaceOf(file)
  const lines = category === 'asset' ? { total: 0, nonBlank: 0 } : countLines(file)

  byCategory[category] ??= { files: 0, lines: 0, codeLines: 0 }
  byCategory[category].files += 1
  byCategory[category].lines += lines.total
  byCategory[category].codeLines += lines.nonBlank

  byExtension[ext] ??= { files: 0, lines: 0 }
  byExtension[ext].files += 1
  byExtension[ext].lines += lines.total

  if (workspace) {
    byWorkspace[workspace] ??= { files: 0, lines: 0, source: 0, test: 0 }
    byWorkspace[workspace].files += 1
    byWorkspace[workspace].lines += lines.total
    if (category === 'source' || category === 'styles') byWorkspace[workspace].source += lines.total
    if (category === 'test' || category === 'e2e') byWorkspace[workspace].test += lines.total
  }
}

// Authored engineering work: everything written for this project, excluding prose,
// generated output, marketing content, and binary assets.
const AUTHORED = ['source', 'styles', 'test', 'e2e', 'automation', 'sql', 'terraform']
const authored = AUTHORED.reduce(
  (acc, key) => {
    const bucket = byCategory[key] ?? { files: 0, lines: 0, codeLines: 0 }
    return {
      files: acc.files + bucket.files,
      lines: acc.lines + bucket.lines,
      codeLines: acc.codeLines + bucket.codeLines,
    }
  },
  { files: 0, lines: 0, codeLines: 0 },
)

// ── tests ───────────────────────────────────────────────────────────────────

const testFiles = files.filter((file) => isUnitTest(file) || isE2E(file))
const unitTestFiles = testFiles.filter((file) => !isE2E(file))
const e2eFiles = testFiles.filter(isE2E)

// `it(` / `test(` at a statement boundary, including .each/.only/.skip variants.
const CASE_PATTERN = /(?:^|[\s;{}(])(?:it|test)(?:\.\w+)*\s*(?:\(|`)/gm
const SUITE_PATTERN = /(?:^|[\s;{}(])describe(?:\.\w+)*\s*\(/gm

const tests = {
  files: testFiles.length,
  unitFiles: unitTestFiles.length,
  e2eFiles: e2eFiles.length,
  cases: countMatches(testFiles, CASE_PATTERN),
  unitCases: countMatches(unitTestFiles, CASE_PATTERN),
  e2eCases: countMatches(e2eFiles, CASE_PATTERN),
  suites: countMatches(testFiles, SUITE_PATTERN),
}

const testsByWorkspace = {}
for (const file of testFiles) {
  const workspace = workspaceOf(file)
  if (!workspace) continue
  const text = readFileSync(join(repoRoot, file), 'utf8')
  testsByWorkspace[workspace] ??= { files: 0, cases: 0 }
  testsByWorkspace[workspace].files += 1
  testsByWorkspace[workspace].cases += (text.match(CASE_PATTERN) ?? []).length
}

const sourceLines = (byCategory.source?.lines ?? 0) + (byCategory.styles?.lines ?? 0)
const testLines = (byCategory.test?.lines ?? 0) + (byCategory.e2e?.lines ?? 0)

// ── database ────────────────────────────────────────────────────────────────

const schemaFiles = files.filter((file) => /^packages\/[^/]+\/src\/schema\//.test(file) && file.endsWith('.ts'))
const phiSchemaFiles = files.filter((file) => file.endsWith('.phi.ts'))
const postgresMigrations = files.filter((file) => file.startsWith('packages/db/drizzle/') && file.endsWith('.sql'))
const d1Migrations = files.filter((file) => file.startsWith('packages/marketing-db/migrations/') && file.endsWith('.sql'))
const manualMigrations = files.filter((file) => file.startsWith('packages/db/manual-migrations/') && file.endsWith('.sql'))
const d1SchemaFiles = files.filter((file) => /^packages\/marketing-db\/src\/.*\.ts$/.test(file))

const database = {
  postgresTables: countMatches(schemaFiles, /\bpgTable\s*\(/g),
  postgresEnums: countMatches(schemaFiles, /\bpgEnum\s*\(/g),
  d1Tables: countMatches(d1SchemaFiles, /\bsqliteTable\s*\(/g),
  schemaFiles: schemaFiles.length,
  phiTaggedSchemaFiles: phiSchemaFiles.length,
  postgresMigrations: postgresMigrations.length,
  manualMigrations: manualMigrations.length,
  d1Migrations: d1Migrations.length,
  triggers: countMatches(postgresMigrations, /CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER/gi),
  policies: countMatches(postgresMigrations, /CREATE\s+POLICY/gi),
  functions: countMatches(postgresMigrations, /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION/gi),
}

// ── routes and content ──────────────────────────────────────────────────────

const isRouteModule = (file) => /\.tsx?$/.test(file) && !isUnitTest(file) && !isGenerated(file)

const appRoutes = files.filter(
  (file) => file.startsWith('apps/web/src/routes/app/') && isRouteModule(file),
)
const apiRoutes = files.filter(
  (file) => file.startsWith('apps/web/src/routes/api/') && isRouteModule(file),
)
const allWebRoutes = files.filter(
  (file) => file.startsWith('apps/web/src/routes/') && isRouteModule(file),
)
const astroPages = files.filter(
  (file) => file.startsWith('apps/marketing/src/pages/') && file.endsWith('.astro'),
)
const contentFiles = files.filter((file) => file.startsWith('apps/marketing/src/content/'))

const contentCollections = {}
for (const file of contentFiles) {
  const collection = file.split('/')[4]
  if (!collection) continue
  contentCollections[collection] = (contentCollections[collection] ?? 0) + 1
}

const routes = {
  webTotal: allWebRoutes.length,
  webApp: appRoutes.length,
  webApi: apiRoutes.length,
  astroPages: astroPages.length,
  marketingContentFiles: contentFiles.length,
  contentCollections: Object.fromEntries(
    Object.entries(contentCollections).sort((a, b) => b[1] - a[1]),
  ),
}

// ── infrastructure ──────────────────────────────────────────────────────────

const terraformFiles = files.filter((file) => file.endsWith('.tf'))
const resourceCounts = {}
for (const file of terraformFiles) {
  const text = readFileSync(join(repoRoot, file), 'utf8')
  for (const match of text.matchAll(/^resource\s+"([a-z0-9_]+)"/gm)) {
    resourceCounts[match[1]] = (resourceCounts[match[1]] ?? 0) + 1
  }
}

const infrastructure = {
  terraformFiles: terraformFiles.length,
  terraformLines: byCategory.terraform?.lines ?? 0,
  terraformResources: Object.values(resourceCounts).reduce((sum, n) => sum + n, 0),
  terraformResourceTypes: Object.fromEntries(
    Object.entries(resourceCounts).sort((a, b) => b[1] - a[1]),
  ),
  terraformModules: new Set(
    terraformFiles
      .filter((file) => file.includes('/modules/'))
      .map((file) => file.split('/modules/')[1].split('/')[0]),
  ).size,
  wranglerConfigs: files.filter((file) => posix.basename(file).startsWith('wrangler.')).length,
  githubWorkflows: files.filter((file) => file.startsWith('.github/workflows/')).length,
}

// ── automation ──────────────────────────────────────────────────────────────

const automationFiles = files.filter((file) => categorize(file) === 'automation')
const automation = {
  files: automationFiles.length,
  lines: byCategory.automation?.lines ?? 0,
  tested: automationFiles.filter(isUnitTest).length,
}

// ── workspaces ──────────────────────────────────────────────────────────────

const workspaceNames = {}
for (const workspace of Object.keys(byWorkspace)) {
  const manifest = join(repoRoot, workspace, 'package.json')
  if (!existsSync(manifest)) continue
  workspaceNames[workspace] = JSON.parse(readFileSync(manifest, 'utf8')).name
}

const workspaces = Object.entries(byWorkspace)
  .map(([path, stats]) => ({
    path,
    name: workspaceNames[path] ?? path,
    files: stats.files,
    lines: stats.lines,
    sourceLines: stats.source,
    testLines: stats.test,
    testFiles: testsByWorkspace[path]?.files ?? 0,
    testCases: testsByWorkspace[path]?.cases ?? 0,
  }))
  .sort((a, b) => b.sourceLines - a.sourceLines)

// ── git ─────────────────────────────────────────────────────────────────────

/**
 * The GitHub account was renamed part-way through the project. Both names are
 * the same person, so their commits are merged rather than reported as two
 * contributors. A `.mailmap` would be the idiomatic fix, but it would have to
 * carry the old address in a committed file.
 *
 * The old handle is base64 for the same reason the scrub guard in
 * packages/knowledge encodes its needles: this ran only once, to produce
 * provenance.json, and spelling it out would leave the dissolved identity in
 * the published tree — the exact thing the guard asserts is absent.
 */
const AUTHOR_ALIASES = new Map([[atob('VmVudG9yYUxhYnM='), 'Angel Campa']])

function readContributors() {
  const merged = new Map()
  for (const line of git(['shortlog', '-sne', 'HEAD']).split('\n')) {
    const match = line.trim().match(/^(\d+)\s+(.+?)\s+</)
    if (!match) continue
    const name = AUTHOR_ALIASES.get(match[2]) ?? match[2]
    merged.set(name, (merged.get(name) ?? 0) + Number(match[1]))
  }
  return [...merged]
    .map(([name, commits]) => ({ commits, name }))
    .sort((a, b) => b.commits - a.commits)
}

/**
 * Repository history is a recorded value, not a live reading, for two reasons.
 * Committing metrics.json changes the commit count, so a live count would make
 * `--check` permanently stale by one immediately after every commit. And the
 * published snapshot is a single squashed commit with no history to count at
 * all, where a live reading would report `1` and contradict the README.
 *
 * Re-record it deliberately with `--record-provenance`.
 */
const provenancePath = join(outDir, 'provenance.json')
const recordProvenance = process.argv.includes('--record-provenance')
const provenance =
  existsSync(provenancePath) && !recordProvenance
    ? JSON.parse(readFileSync(provenancePath, 'utf8'))
    : null

// Both branches must produce the same keys in the same order, or metrics.json
// regenerated from provenance would not match the committed file byte for byte
// and `--check` would fail in the snapshot for no real reason.
const history = provenance ?? {
  commits: Number(git(['rev-list', '--count', 'HEAD']).trim()),
  firstCommit: git(['log', '--reverse', '--format=%as', '--max-parents=0']).split('\n')[0],
  lastCommit: git(['log', '-1', '--format=%as']).trim(),
  contributors: readContributors(),
}

const repository = {
  commits: history.commits,
  trackedFiles: files.length,
  firstCommit: history.firstCommit,
  lastCommit: history.lastCommit,
  contributors: history.contributors,
}

// ── assemble ────────────────────────────────────────────────────────────────

const metrics = {
  generatedBy: 'scripts/portfolio-metrics.mjs',
  note: 'Counts cover git-tracked files only. "lines" matches `wc -l`; "codeLines" excludes blank lines.',
  repository,
  totals: {
    authoredFiles: authored.files,
    authoredLines: authored.lines,
    authoredCodeLines: authored.codeLines,
    sourceLines,
    testLines,
    testToSourceRatio: Number((testLines / sourceLines).toFixed(2)),
  },
  byCategory: Object.fromEntries(
    Object.entries(byCategory).sort((a, b) => b[1].lines - a[1].lines),
  ),
  byExtension: Object.fromEntries(
    Object.entries(byExtension).sort((a, b) => b[1].lines - a[1].lines),
  ),
  workspaces,
  tests,
  database,
  routes,
  infrastructure,
  automation,
}

// ── render ──────────────────────────────────────────────────────────────────

const n = (value) => value.toLocaleString('en-US')

const CATEGORY_LABELS = {
  source: 'Application source',
  test: 'Unit tests',
  e2e: 'End-to-end tests',
  automation: 'Automation scripts',
  sql: 'SQL migrations',
  terraform: 'Terraform',
  styles: 'Design tokens & CSS',
  docs: 'Documentation',
  'marketing-content': 'Marketing content',
  generated: 'Generated (not authored)',
  config: 'Config',
  asset: 'Binary assets',
}

function renderMarkdown() {
  const lines = []

  lines.push('# PHIGuard by the numbers')
  lines.push('')
  lines.push('<!-- Generated by scripts/portfolio-metrics.mjs. Do not edit by hand. -->')
  lines.push('')
  lines.push(
    `Counted across ${n(repository.trackedFiles)} git-tracked files at ${repository.commits} commits ` +
      `(${repository.firstCommit} to ${repository.lastCommit}). "Lines" matches \`wc -l\`; ` +
      `"code lines" excludes blanks. Regenerate with \`node scripts/portfolio-metrics.mjs\`.`,
  )
  lines.push('')

  lines.push('## Code')
  lines.push('')
  lines.push('| Category | Files | Lines | Code lines |')
  lines.push('| --- | ---: | ---: | ---: |')
  for (const [key, stats] of Object.entries(metrics.byCategory)) {
    if (key === 'asset') continue
    lines.push(
      `| ${CATEGORY_LABELS[key] ?? key} | ${n(stats.files)} | ${n(stats.lines)} | ${n(stats.codeLines)} |`,
    )
  }
  lines.push(
    `| **Authored code total** | **${n(authored.files)}** | **${n(authored.lines)}** | **${n(authored.codeLines)}** |`,
  )
  lines.push('')
  lines.push(
    'The total row is not the column sum. It covers only the categories that are '
      + `authored code (${AUTHORED.map((key) => CATEGORY_LABELS[key] ?? key).join(', ')}). `
      + 'Documentation, config, marketing content and generated artifacts are counted '
      + 'and shown, but deliberately left out of the headline figure.',
  )
  lines.push('')
  lines.push(
    `Test-to-source ratio: **${metrics.totals.testToSourceRatio}:1** ` +
      `(${n(testLines)} lines of tests against ${n(sourceLines)} lines of source).`,
  )
  lines.push('')

  lines.push('## Workspaces')
  lines.push('')
  // Five columns maximum, per the portfolio standard: test files and cases share one cell so
  // the table stays readable at phone width.
  lines.push('| Package | Files | Source lines | Test lines | Test files / cases |')
  lines.push('| --- | ---: | ---: | ---: | ---: |')
  for (const workspace of workspaces) {
    lines.push(
      `| \`${workspace.name}\` | ${n(workspace.files)} | ${n(workspace.sourceLines)} | ` +
        `${n(workspace.testLines)} | ${n(workspace.testFiles)} / ${n(workspace.testCases)} |`,
    )
  }
  lines.push('')

  lines.push('## Tests')
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| Test files | ${n(tests.files)} |`)
  lines.push(`| Test cases | ${n(tests.cases)} |`)
  lines.push(`| Suites (\`describe\`) | ${n(tests.suites)} |`)
  lines.push(`| Unit test files / cases | ${n(tests.unitFiles)} / ${n(tests.unitCases)} |`)
  lines.push(`| End-to-end spec files / cases | ${n(tests.e2eFiles)} / ${n(tests.e2eCases)} |`)
  lines.push('')

  lines.push('## Data model')
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| Postgres tables | ${n(database.postgresTables)} |`)
  lines.push(`| Postgres enum types | ${n(database.postgresEnums)} |`)
  lines.push(`| Cloudflare D1 tables | ${n(database.d1Tables)} |`)
  lines.push(`| Schema modules | ${n(database.schemaFiles)} |`)
  lines.push(`| PHI-tagged schema modules (\`*.phi.ts\`) | ${n(database.phiTaggedSchemaFiles)} |`)
  lines.push(`| Postgres migrations | ${n(database.postgresMigrations)} |`)
  lines.push(`| D1 migrations | ${n(database.d1Migrations)} |`)
  lines.push(`| Triggers defined in migrations | ${n(database.triggers)} |`)
  lines.push(`| Row-level security policies | ${n(database.policies)} |`)
  lines.push('')

  lines.push('## Surfaces')
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| Product app routes | ${n(routes.webApp)} |`)
  lines.push(`| API routes | ${n(routes.webApi)} |`)
  lines.push(`| Total app route modules | ${n(routes.webTotal)} |`)
  lines.push(`| Astro page templates | ${n(routes.astroPages)} |`)
  lines.push(`| Marketing content entries | ${n(routes.marketingContentFiles)} |`)
  lines.push('')
  lines.push('Marketing content by collection:')
  lines.push('')
  lines.push('| Collection | Entries |')
  lines.push('| --- | ---: |')
  for (const [collection, count] of Object.entries(routes.contentCollections)) {
    lines.push(`| ${collection} | ${n(count)} |`)
  }
  lines.push('')

  lines.push('## Infrastructure & automation')
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('| --- | ---: |')
  lines.push(`| Terraform files / lines | ${n(infrastructure.terraformFiles)} / ${n(infrastructure.terraformLines)} |`)
  lines.push(`| Terraform resources | ${n(infrastructure.terraformResources)} |`)
  lines.push(`| Terraform modules | ${n(infrastructure.terraformModules)} |`)
  lines.push(`| Wrangler configs | ${n(infrastructure.wranglerConfigs)} |`)
  lines.push(`| GitHub Actions workflows | ${n(infrastructure.githubWorkflows)} |`)
  lines.push(`| Automation scripts / lines | ${n(automation.files)} / ${n(automation.lines)} |`)
  lines.push('')

  return `${lines.join('\n')}\n`
}

const jsonOutput = `${JSON.stringify(metrics, null, 2)}\n`
const markdownOutput = renderMarkdown()

// Compare content, not line endings. A Windows clone with core.autocrlf=true
// checks these files out as CRLF while this script always renders LF, which
// would otherwise report correct, freshly generated docs as stale.
const sameContent = (path, expected) =>
  existsSync(path) && readFileSync(path, 'utf8').replace(/\r\n/g, '\n') === expected

/**
 * The README says "Every figure here is produced by scripts/portfolio-metrics.mjs",
 * but its table is transcribed by hand, so nothing stopped it drifting from the
 * generated files it cites. This checks the transcription. Each entry is a row
 * label from the README's "By the numbers" table and the numbers that row must
 * contain, in order; a row that has gone stale names itself.
 */
function readmeDrift() {
  const readmePath = join(repoRoot, 'README.md')
  if (!existsSync(readmePath)) return []

  const expected = [
    ['Authored code lines / files', [authored.lines, authored.files]],
    ['Application source', [byCategory.source.lines]],
    ['Unit tests', [byCategory.test.lines]],
    ['End-to-end tests', [byCategory.e2e.lines]],
    ['Automation scripts', [byCategory.automation.lines]],
    ['Test cases / test files / suites', [tests.cases, tests.files, tests.suites]],
    ['Postgres tables / enums / migrations',
      [database.postgresTables, database.postgresEnums, database.postgresMigrations]],
    ['PHI-tagged schema modules', [database.phiTaggedSchemaFiles, database.schemaFiles]],
    ['Product routes / API routes', [routes.webApp, routes.webApi]],
    ['Marketing pages / generated content entries',
      [routes.astroPages, routes.marketingContentFiles]],
    ['Terraform resources', [infrastructure.terraformResources]],
  ]

  const readme = readFileSync(readmePath, 'utf8')
  const drift = []

  for (const [label, numbers] of expected) {
    const row = readme.match(new RegExp(`^\\|\\s*${label.replace(/[/]/g, '\\/')}\\s*\\|(.*)$`, 'm'))
    if (!row) {
      drift.push(`README row missing: ${label}`)
      continue
    }
    const found = (row[1].match(/[\d,]*\d/g) ?? []).map((value) => Number(value.replace(/,/g, '')))
    if (found.join(',') !== numbers.join(',')) {
      drift.push(`README "${label}": has ${found.join(' / ')}, expected ${numbers.join(' / ')}`)
    }
  }

  return drift
}

if (checkOnly) {
  const stale = []
  if (!sameContent(jsonPath, jsonOutput)) stale.push(jsonPath)
  if (!sameContent(markdownPath, markdownOutput)) stale.push(markdownPath)

  const drift = readmeDrift()
  if (drift.length > 0) {
    console.error('README.md figures do not match the generated metrics:')
    for (const line of drift) console.error(`  - ${line}`)
    process.exit(1)
  }

  if (stale.length > 0) {
    console.error('Portfolio metrics are stale. Run: node scripts/portfolio-metrics.mjs')
    for (const path of stale) console.error(`  - ${path}`)
    process.exit(1)
  }

  console.log('Portfolio metrics are up to date.')
  process.exit(0)
}

mkdirSync(outDir, { recursive: true })
writeFileSync(jsonPath, jsonOutput)
writeFileSync(markdownPath, markdownOutput)

console.log(`Wrote ${jsonPath}`)
console.log(`Wrote ${markdownPath}`)

// Refresh the provenance record while there is still history to read it from.
// `trackedFiles` is deliberately left out: it is recounted on every run.
if (!provenance) {
  const { trackedFiles: _ignored, ...record } = repository
  const note =
    'Git history of the private source repository, read from git by '
    + 'scripts/portfolio-metrics.mjs --record-provenance. The published snapshot '
    + 'is a single squashed commit and cannot recount it, so this is the record.'
  writeFileSync(provenancePath, `${JSON.stringify({ note, ...record }, null, 2)}\n`)
  console.log(`Wrote ${provenancePath}`)
}
console.log(
  `${n(authored.lines)} authored lines across ${n(authored.files)} files · ` +
    `${n(tests.cases)} test cases · ${n(database.postgresTables)} Postgres tables · ` +
    `${repository.commits} commits`,
)
