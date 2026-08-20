#!/usr/bin/env node
/**
 * Builds `portfolio/SCREENSHOTS.md` from the two capture manifests.
 *
 *   node scripts/build-screenshot-index.mjs
 *   node scripts/build-screenshot-index.mjs --check   # exit 1 if stale
 *
 * The manifests are written by the capture runs themselves
 * (`apps/web/e2e/portfolio-screenshots.spec.ts` and
 * `apps/marketing/scripts/capture-portfolio-screenshots.mjs`), so the index
 * cannot drift from the archive: regenerate it and the two agree by
 * construction. Same reason `scripts/portfolio-metrics.mjs` exists — nothing
 * describing this repository should be typed by hand.
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const portfolioDir = join(repoRoot, 'portfolio')
const outPath = join(portfolioDir, 'SCREENSHOTS.md')

const APP_MANIFEST = join(portfolioDir, 'screenshots', 'app', 'manifest.json')
const MARKETING_MANIFEST = join(portfolioDir, 'screenshots', 'marketing', 'manifest.json')
// Hand-picked captures from a manual QA session rather than a capture run. Kept
// in its own manifest so the index never implies they came out of the spec.
const QA_MANIFEST = join(portfolioDir, 'screenshots', 'qa', 'manifest.json')

/** Human-facing section titles, in the order they should appear. */
const ROLE_SECTIONS = [
  ['org_owner', 'desktop', 'Practice administrator (`org_owner`)', 'Full access. This is what the clinic administrator who owns the compliance programme sees.'],
  ['org_owner', 'mobile', 'Mobile (375px)', 'The same account at a phone viewport, which is where a lot of clinic staff actually work.'],
  ['auditor', 'desktop', 'External auditor (`auditor`)', 'A read-only role scoped to evidence and the audit trail. Note what is missing compared with the administrator views.'],
  ['location_staff', 'desktop', 'Location staff (`location_staff`)', 'Scoped to a single location. Compliance programme administration is not reachable.'],
  ['anonymous', 'desktop', 'Unauthenticated', 'Public product surfaces.'],
]

function readManifest(path) {
  if (!existsSync(path)) {
    throw new Error(
      `Missing ${path}.\nRun the capture first — see portfolio/SCREENSHOTS.md regeneration notes.`,
    )
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

// Screenshot sets render as an HTML <table> grid — GitHub markdown has no
// native grid — two columns wide, with the full caption kept as both the
// <img> alt text and the visible text under the image. The grid is
// presentational; nothing about it is a reason to shorten the caption.
const GRID_COLUMNS = 2

/**
 * Reads the pixel height straight out of a PNG's IHDR chunk (bytes 16–19,
 * big-endian, right after the fixed 8-byte signature and the 4-byte length +
 * "IHDR" tag). No image library needed for four bytes, and it keeps this
 * script dependency-free like the rest of `scripts/`. The manifests only
 * record byte size, and byte size does not track page length closely enough
 * to pair on — a text-heavy short page can outweigh a sparse tall one.
 */
function heightOf(dir, file) {
  const fd = readFileSync(join(portfolioDir, 'screenshots', dir, file))
  return fd.readUInt32BE(20)
}

/**
 * Sorts shots tallest-first so the 2-column grid pairs adjacent heights
 * instead of whatever order the capture happened to run in. A table row is
 * only as short as its tallest cell, so pairing a 2,000px page next to a
 * 30,000px one leaves the short column mostly blank; sorting first means
 * neighbours in the final grid are also neighbours in height.
 */
function orderByHeight(shots, dir) {
  return shots
    .map((shot) => ({ shot, height: heightOf(dir, shot.file) }))
    .sort((a, b) => b.height - a.height)
    .map((entry) => entry.shot)
}

function renderGrid(shots, dir) {
  const cell = (shot) =>
    `<td width="50%" valign="top">\n`
    + `<img src="./screenshots/${dir}/${shot.file}" alt="${shot.caption.replace(/"/g, '&quot;')}" width="100%"><br>\n`
    + `<sub><code>${shot.path}</code><br>${shot.caption}</sub>\n`
    + `</td>`

  const rows = []
  for (let i = 0; i < shots.length; i += GRID_COLUMNS) {
    const chunk = shots.slice(i, i + GRID_COLUMNS)
    while (chunk.length < GRID_COLUMNS) chunk.push(null)
    rows.push(`<tr>\n${chunk.map((shot) => (shot ? cell(shot) : '<td width="50%"></td>')).join('\n')}\n</tr>`)
  }

  return `<table>\n${rows.join('\n')}\n</table>\n`
}

function build() {
  const app = readManifest(APP_MANIFEST)
  const marketing = readManifest(MARKETING_MANIFEST)
  const qa = readManifest(QA_MANIFEST)

  const appBytes = app.shots.reduce((sum, shot) => sum + shot.bytes, 0)
  const marketingBytes = marketing.shots.reduce((sum, shot) => sum + shot.bytes, 0)
  const qaBytes = qa.shots.reduce((sum, shot) => sum + shot.bytes, 0)

  const lines = []
  lines.push('# Screenshot archive')
  lines.push('')
  lines.push('<!-- Generated by scripts/build-screenshot-index.mjs. Do not edit by hand. -->')
  lines.push('')
  lines.push(
    `${app.shots.length + qa.shots.length} product screens and ${marketing.shots.length} marketing `
      + `pages (${mb(appBytes + marketingBytes + qaBytes)} total), all captured from a local run of `
      + 'the real application, not mockups, and not a staging environment with hand-placed data. '
      + `${app.shots.length + marketing.shots.length} came out of the automated capture runs; `
      + `${qa.shots.length} were taken by hand during a QA sweep and are listed separately below.`,
  )
  lines.push('')
  lines.push(
    'The product screens are populated by `apps/web/scripts/demo-seed.ts`, a deterministic '
      + '`@faker-js/faker` seed built through the application\'s own domain functions rather than direct '
      + 'row inserts.',
  )
  lines.push('')

  if (app.note) {
    lines.push(`> **Read this before judging the product by this archive.** ${app.note}`)
    lines.push('')
  }

  if (app.organization) {
    lines.push(`Seeded workspace: **${app.organization}**`)
    lines.push('')
    if (app.counts) {
      const counts = Object.entries(app.counts)
        .map(([key, value]) => `${value} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        .join(' · ')
      lines.push(`> ${counts}`)
      lines.push('')
      lines.push(
        'That is what the seed builds. It is **not** a description of what these captures show. '
          + 'The screens that would have shown it are the ones the redirect bug destroyed.',
      )
      lines.push('')
    }
  }

  lines.push('**No real patient data appears anywhere in this archive.** The seed is synthetic by')
  lines.push('construction and the repository forbids committing PHI to fixtures.')
  lines.push('')
  lines.push('## Regenerating')
  lines.push('')
  lines.push('```bash')
  lines.push('pnpm --filter @phiguard/web exec playwright test portfolio-screenshots --project=chromium')
  lines.push('cd apps/marketing && node scripts/capture-portfolio-screenshots.mjs')
  lines.push('node scripts/build-screenshot-index.mjs')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Product application')
  lines.push('')
  lines.push('### The compliance product, from the manual QA sweep')
  lines.push('')
  lines.push(
    'These are the only verified captures of the compliance features in a populated state. '
      + `They were taken by hand on ${qa.generatedBy.replace(/^manual QA session, /, '')
        .replace(/ —.*$/, '')} against a local dev clinic, not by the capture spec, so they cannot `
      + 'be reproduced by re-running a script. Each entry records the filename it had in the QA '
      + 'session. The organization shown is `' + qa.organization + '`, a development workspace.',
  )
  lines.push('')
  lines.push(renderGrid(qa.shots, 'qa'))

  for (const [role, viewport, title, blurb] of ROLE_SECTIONS) {
    const shots = app.shots.filter((shot) => shot.role === role && shot.viewport === viewport)
    if (shots.length === 0) continue
    lines.push(`### ${title}`)
    lines.push('')
    lines.push(blurb)
    lines.push('')
    lines.push(renderGrid(shots, 'app'))
  }

  const covered = new Set(ROLE_SECTIONS.map(([role, viewport]) => `${role}:${viewport}`))
  const leftovers = app.shots.filter((shot) => !covered.has(`${shot.role}:${shot.viewport}`))
  if (leftovers.length > 0) {
    lines.push('### Other')
    lines.push('')
    lines.push(renderGrid(leftovers, 'app'))
  }

  lines.push('---')
  lines.push('')
  lines.push('## Marketing site')
  lines.push('')
  lines.push(
    'The site built hundreds of routes out of 11 programmatic content collections (see '
      + '[METRICS.md](./METRICS.md) for the breakdown). Capturing all of them would be bulk rather '
      + 'than breadth, so this is every hand-authored page plus one representative entry per '
      + 'collection, resolved against the routes the build actually emitted.',
  )
  lines.push('')

  const mobile = orderByHeight(
    marketing.shots.filter((shot) => shot.viewport === 'mobile'),
    'marketing',
  )
  const desktop = orderByHeight(
    marketing.shots.filter((shot) => shot.viewport !== 'mobile'),
    'marketing',
  )

  lines.push('### Desktop (1440px)')
  lines.push('')
  lines.push(
    'Sorted tallest-first so the grid pairs pages of similar length. The site '
      + 'itself is linked from the caption under each image, not from this order.',
  )
  lines.push('')
  lines.push(renderGrid(desktop, 'marketing'))

  if (mobile.length > 0) {
    lines.push('### Mobile (375px)')
    lines.push('')
    lines.push(renderGrid(mobile, 'marketing'))
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

const content = build()

if (process.argv.includes('--check')) {
  // Compare content, not line endings — a Windows clone with core.autocrlf=true
  // checks this file out as CRLF while it is always rendered here as LF.
  const current = existsSync(outPath) ? readFileSync(outPath, 'utf8').replace(/\r\n/g, '\n') : ''
  if (current !== content) {
    console.error('portfolio/SCREENSHOTS.md is stale. Run: node scripts/build-screenshot-index.mjs')
    process.exit(1)
  }
  console.log('portfolio/SCREENSHOTS.md is up to date.')
} else {
  writeFileSync(outPath, content)
  console.log(`Wrote ${outPath}`)
}
