#!/usr/bin/env node
/**
 * Captures the marketing-site screenshot archive used in the portfolio README.
 *
 *   node scripts/capture-portfolio-screenshots.mjs              # build, preview, capture
 *   node scripts/capture-portfolio-screenshots.mjs --no-build   # reuse existing dist/
 *   node scripts/capture-portfolio-screenshots.mjs --base-url=http://127.0.0.1:4322
 *
 * The site generates roughly 900 pages from 11 content collections. Capturing
 * all of them would be pointless bulk, so this takes every hand-authored page
 * plus one representative entry per collection. Collection samples are resolved
 * against the routes actually present in dist/, so a renamed slug degrades to a
 * sibling page instead of silently producing a 404 screenshot.
 */
import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(appRoot, '..', '..')
const distDir = join(appRoot, 'dist')

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name, fallback) => {
  const match = args.find((arg) => arg.startsWith(`--${name}=`))
  return match ? match.slice(name.length + 3) : fallback
}

const PORT = Number(option('port', '4399'))
const baseUrl = option('base-url', `http://127.0.0.1:${PORT}`)
const outDir = option('out', join(repoRoot, 'portfolio', 'screenshots', 'marketing'))
const shouldBuild = !flag('no-build')
const shouldServe = !args.some((arg) => arg.startsWith('--base-url='))

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 375, height: 812 }

// A handful of index pages (the resource library, the compare index, the
// glossary) run to 20,000-30,000px because the programmatic-SEO collections
// behind them are large. Left uncapped, those pages dominate the
// portfolio/SCREENSHOTS.md desktop grid: a 2-column table pairs whatever is
// next to them, so a 2,000px page ends up beside a 33,000px one and the short
// column is mostly whitespace. Capping the capture to a representative slice
// keeps every page in the archive within an order of magnitude of the rest.
// Ten desktop viewport-heights is enough to show real content past the fold
// without one collection page distorting the whole grid.
const MAX_CAPTURE_HEIGHT = 9000

/**
 * Hand-authored pages. `mobile: true` also captures the 375px viewport — used
 * for the pages where responsive behaviour is worth showing.
 */
const CORE_PAGES = [
  { path: '/', name: 'home', caption: 'Marketing home', mobile: true },
  { path: '/product', name: 'product', caption: 'Product overview' },
  { path: '/product/features', name: 'features-index', caption: 'Feature index' },
  { path: '/pricing', name: 'pricing', caption: 'Per-clinic flat pricing', mobile: true },
  { path: '/security', name: 'security', caption: 'Security posture' },
  { path: '/trust', name: 'trust', caption: 'Trust centre' },
  { path: '/hipaa', name: 'hipaa', caption: 'HIPAA overview' },
  { path: '/baa', name: 'baa', caption: 'Business Associate Agreement' },
  { path: '/subprocessors', name: 'subprocessors', caption: 'Subprocessor register' },
  { path: '/compare', name: 'compare-index', caption: 'Comparison index' },
  { path: '/alternatives', name: 'alternatives-index', caption: 'Alternatives index' },
  { path: '/personas', name: 'personas-index', caption: 'Persona index' },
  { path: '/practice-types', name: 'practice-types-index', caption: 'Practice-type index' },
  { path: '/hipaa-software', name: 'hipaa-software-index', caption: 'HIPAA software index' },
  { path: '/resources', name: 'resources-index', caption: 'Resource library' },
  { path: '/resources/tools', name: 'resources-tools', caption: 'Free tools' },
  { path: '/resources/guides', name: 'guides-index', caption: 'Guide index' },
  { path: '/learn', name: 'learn-index', caption: 'Learn hub' },
  { path: '/glossary', name: 'glossary', caption: 'Compliance glossary' },
  { path: '/about', name: 'about', caption: 'About' },
  { path: '/partners', name: 'partners', caption: 'Partner programme' },
  { path: '/privacy', name: 'privacy', caption: 'Privacy policy' },
  { path: '/terms', name: 'terms', caption: 'Terms of service' },
  { path: '/404', name: '404', caption: 'Not-found page' },
]

/**
 * One representative page per programmatic-SEO collection. `prefix` is the
 * fallback search space when `preferred` no longer exists.
 */
const COLLECTION_SAMPLES = [
  { prefix: '/learn/', preferred: null, name: 'collection-learn', caption: 'Learn article (302 entries)', mobile: true },
  { prefix: '/resources/guides/', preferred: null, name: 'collection-guide', caption: 'Integration guide (91 entries)' },
  { prefix: '/resources/best/', preferred: null, name: 'collection-best', caption: 'Best-of roundup (55 entries)' },
  { prefix: '/compare/', preferred: null, name: 'collection-comparison', caption: 'Competitor comparison (41 entries)' },
  { prefix: '/alternatives/', preferred: null, name: 'collection-alternative', caption: 'Alternative page (41 entries)' },
  { prefix: '/practice-types/', preferred: null, name: 'collection-practice-type', caption: 'Practice-type page (39 entries)' },
  { prefix: '/hipaa-software/', preferred: null, name: 'collection-hipaa-software', caption: 'Vertical software page (32 entries)' },
  { prefix: '/personas/', preferred: null, name: 'collection-persona', caption: 'Persona page (5 entries)' },
  { prefix: '/locations/hipaa-compliance/', preferred: null, name: 'collection-state-guide', caption: 'State compliance guide (100 entries)' },
  { prefix: '/locations/hipaa-compliance-software/', preferred: null, name: 'collection-city-guide', caption: 'City guide (100 entries)' },
  { prefix: '/locations/hipaa-breach-notification/', preferred: null, name: 'collection-breach-guide', caption: 'Breach-notification guide' },
  { prefix: '/resources/', preferred: null, name: 'collection-resource', caption: 'Lead-magnet resource page (63 entries)' },
]

// ── route discovery ─────────────────────────────────────────────────────────

/** Every route dist/ actually emits, derived from the index.html tree. */
function discoverRoutes(dir, prefix = '') {
  const routes = []
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return routes
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      routes.push(...discoverRoutes(join(dir, entry.name), `${prefix}/${entry.name}`))
    } else if (entry.name === 'index.html') {
      // No trailing slash: the deployed Worker uses `drop-trailing-slash`
      // html_handling, and `astro preview` 404s the slashed form outright.
      routes.push(prefix === '' ? '/' : prefix)
    } else if (entry.name.endsWith('.html')) {
      routes.push(`${prefix}/${entry.name.replace(/\.html$/, '')}`)
    }
  }

  return routes
}

/** Depth of a route, used to prefer leaf pages over nested index pages. */
const segments = (route) => route.split('/').filter(Boolean).length

function resolveSample(routes, sample) {
  const candidates = routes
    .filter((route) => route.startsWith(sample.prefix) && route !== sample.prefix)
    .sort()

  if (candidates.length === 0) return null
  if (sample.preferred && candidates.includes(sample.preferred)) return sample.preferred

  // A candidate that is a prefix of another candidate is a sub-index, not an
  // article. Screenshot real content whenever any exists.
  const leaves = candidates.filter(
    (route) => !candidates.some((other) => other !== route && other.startsWith(`${route}/`)),
  )
  const pool = leaves.length > 0 ? leaves : candidates

  // Among leaves, the shallowest is the most representative of the collection.
  const minDepth = Math.min(...pool.map(segments))
  return pool.find((route) => segments(route) === minDepth) ?? pool[0]
}

// ── server ──────────────────────────────────────────────────────────────────

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' })
      if (response.status < 500) return
    } catch {
      // not up yet
    }
    await delay(500)
  }
  throw new Error(`Preview server did not become ready at ${url}`)
}

function startPreview() {
  const child = spawn(
    'pnpm',
    ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(PORT)],
    { cwd: appRoot, stdio: 'ignore', shell: process.platform === 'win32' },
  )
  child.unref()
  return child
}

// ── capture ─────────────────────────────────────────────────────────────────

async function capture(page, url, file) {
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })

  // A null response means the navigation never produced one, so the page still
  // shows whatever was there before. Treating that as status 0 would slip a
  // blank or stale screen into the archive as a success.
  if (!response) {
    return { ok: false, status: 'no response' }
  }

  const status = response.status()

  if (status >= 400) {
    return { ok: false, status }
  }

  // Settle webfonts and any entrance transitions before shooting.
  await page.evaluate(() => document.fonts?.ready)
  await delay(350)

  const buffer = await page.screenshot({ fullPage: true, animations: 'disabled' })

  // Crop the rare very-tall page down to a representative slice — see
  // MAX_CAPTURE_HEIGHT above.
  const { width, height } = await sharp(buffer).metadata()
  const cropped =
    height > MAX_CAPTURE_HEIGHT
      ? await sharp(buffer).extract({ left: 0, top: 0, width, height: MAX_CAPTURE_HEIGHT }).toBuffer()
      : buffer

  // Index pages run to 20,000px tall and weigh several megabytes at 1:1.
  // Capping the palette is what actually shrinks them: a UI screenshot uses far
  // fewer than 128 distinct colours, so this is close to lossless here and
  // roughly halves the file. Downscaling instead makes things *worse* — it
  // interpolates new intermediate colours and defeats palette compression.
  const optimized = await sharp(cropped)
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 80, colours: 128 })
    .toBuffer()

  writeFileSync(file, optimized)
  return { ok: true, status, bytes: optimized.length }
}

async function main() {
  if (shouldBuild) {
    console.log('Building marketing site...')
    execFileSync('pnpm', ['exec', 'astro', 'build'], {
      cwd: appRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, PUBLIC_APP_URL: process.env.PUBLIC_APP_URL ?? 'http://127.0.0.1:3000' },
    })
  }

  const routes = discoverRoutes(distDir)
  console.log(`dist/ contains ${routes.length} routes`)

  let server = null
  if (shouldServe) {
    console.log(`Starting preview on ${baseUrl}...`)
    server = startPreview()
    await waitForServer(baseUrl)
  }

  // Wiped first so a removed page cannot leave an orphan PNG behind. A run that
  // dies partway therefore leaves the archive incomplete and unmanifested; the
  // committed archive is the backup, so recover with
  // `git checkout -- portfolio/screenshots/marketing` and run again.
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const targets = [
    ...CORE_PAGES.map((page) => ({ ...page, kind: 'page' })),
    ...COLLECTION_SAMPLES.map((sample) => {
      const resolved = resolveSample(routes, sample)
      return resolved ? { ...sample, path: resolved, kind: 'collection' } : null
    }).filter(Boolean),
  ]

  const browser = await chromium.launch()
  const manifest = []
  const missing = []

  try {
    for (const viewport of [
      { label: 'desktop', size: DESKTOP, filter: () => true },
      { label: 'mobile', size: MOBILE, filter: (target) => target.mobile === true },
    ]) {
      const context = await browser.newContext({
        viewport: viewport.size,
        deviceScaleFactor: 1,
        isMobile: viewport.label === 'mobile',
        hasTouch: viewport.label === 'mobile',
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()

      for (const target of targets.filter(viewport.filter)) {
        const fileName = `${target.name}${viewport.label === 'mobile' ? '.mobile' : ''}.png`
        const filePath = join(outDir, fileName)
        const url = new URL(target.path, baseUrl).toString()

        const result = await capture(page, url, filePath)

        if (!result.ok) {
          console.log(`  ✗ ${target.path} → HTTP ${result.status}`)
          missing.push({ path: target.path, status: result.status })
          continue
        }

        console.log(`  ✓ ${fileName}  (${target.path}, ${Math.round(result.bytes / 1024)} KB)`)
        manifest.push({
          file: fileName,
          path: target.path,
          caption: target.caption,
          viewport: viewport.label,
          kind: target.kind,
          bytes: result.bytes,
        })
      }

      await context.close()
    }
  } finally {
    await browser.close()
    if (server) server.kill()
  }

  writeFileSync(
    join(outDir, 'manifest.json'),
    `${JSON.stringify({ generatedBy: relative(repoRoot, fileURLToPath(import.meta.url)).replace(/\\/g, '/'), baseUrl, shots: manifest }, null, 2)}\n`,
  )

  const totalBytes = manifest.reduce((sum, shot) => sum + shot.bytes, 0)
  console.log('')
  console.log(`Captured ${manifest.length} screenshots (${(totalBytes / 1024 / 1024).toFixed(1)} MB) → ${outDir}`)

  if (missing.length > 0) {
    console.log('')
    console.log('Unreachable pages:')
    for (const entry of missing) console.log(`  - ${entry.path} (HTTP ${entry.status})`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
