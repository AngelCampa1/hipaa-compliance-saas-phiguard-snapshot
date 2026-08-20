#!/usr/bin/env node
// Broken-link audit for the built marketing site.
// - Walks dist/ to build a set of valid paths & asset files.
// - Parses every <a href>, <link href>, <script src>, <img src> from HTML.
// - Validates internal targets (path + #fragment) strictly.
// - Fails when public HTML pages have no inbound internal <a> links.
// - Reports external links without editing source (HEAD-checked, cached).
// Exits non-zero if any broken link, orphan page, fragment, or missing asset is found.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveReportPath } from './link-check-report-path.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const distRoot = path.join(projectRoot, 'dist')
const auditDir = path.join(projectRoot, 'seo-audit', '2026-04-24')
const cachePath = path.join(projectRoot, 'seo-audit', 'link-check-cache.json')

const args = new Set(process.argv.slice(2))
const INTERNAL_ONLY = args.has('--internal-only')
const NO_CACHE = args.has('--no-cache')
const reportPath = resolveReportPath(auditDir, INTERNAL_ONLY)

const SITE_HOST = 'phiguard.app'
const ORPHAN_EXEMPT_PATHS = new Set([
  '/',
  '/404',
  '/500',
  '/resources/thank-you',
  '/unsubscribe',
])
const UNVERIFIED_HOSTS = new Set([
  'ag.ny.gov',
  'linkedin.com',
  'www.linkedin.com',
  'x.com',
  'twitter.com',
  'www.twitter.com',
  'facebook.com',
  'www.facebook.com',
  'box.com',
  'www.box.com',
  'code.wvlegislature.gov',
  'codes.findlaw.com',
  'codes.ohio.gov',
  'hhs.iowa.gov',
  'law.justia.com',
  'leg.colorado.gov',
  'openai.com',
  'www.azmd.gov',
  'www.canva.com',
  'www.cga.ct.gov',
  'www.ilga.gov',
  'www.jotform.com',
  'www.ksrevisor.org',
  'www.leg.state.nv.us',
  'www.legis.state.pa.us',
  'www.legislature.mi.gov',
  'www.oag.state.va.us',
  'www.ncleg.gov',
  'www.nmlegis.gov',
  'www.nysenate.gov',
  'www.oregonlegislature.gov',
  'www.perplexity.ai',
  'www.tn.gov',
])
const UNVERIFIED_URLS = new Set([
  'https://www.8x8.com/products/hipaa-compliant-phone-system',
  'https://ag.ks.gov/',
  'https://ago.vermont.gov/',
  'https://www.bamboohr.com/privacy-policy/',
  'https://www.bamboohr.com/security/',
  'https://cdphe.colorado.gov/',
  'https://dhss.delaware.gov/dhss/',
  'https://drata.com/',
  'https://dojmt.gov/',
  'https://health.ri.gov/',
  'https://health.wyo.gov/',
  'https://msdh.ms.gov/',
  'https://odh.ohio.gov/',
  'https://riag.ri.gov/',
  'https://www.constantcontact.com/legal',
  'https://www.constantcontact.com/legal/privacy-statement',
  'https://support.simplepractice.com/hc/en-us/articles/360000141503',
  'https://www.ag.ky.gov/',
  'https://www.cdph.ca.gov/',
  'https://www.chfs.ky.gov/',
  'https://www.health.ny.gov/',
  'https://www.marylandattorneygeneral.gov/',
  'https://www.njoag.gov/',
  'https://www.vonage.com/legal/',
  'https://www.vonage.com/security/',
])

const knownBinaryExts = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.mp4',
  '.webm',
  '.zip',
])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function toSitePath(filePath) {
  const rel = path.relative(distRoot, filePath).replaceAll('\\', '/')
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length)
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -'.html'.length)
  return '/' + rel
}

function normalizePath(p) {
  if (!p) return '/'
  if (p === '/') return '/'
  return p.replace(/\/+$/, '')
}

function collectValidPaths() {
  const htmlPaths = new Set()
  const assetPaths = new Set()
  const pageFragments = new Map() // normalized path -> Set of ids

  for (const file of walk(distRoot)) {
    const site = toSitePath(file)
    if (file.endsWith('.html')) {
      const norm = normalizePath(site)
      htmlPaths.add(norm)
      const html = fs.readFileSync(file, 'utf8')
      const ids = new Set()
      for (const m of html.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(m[1])
      for (const m of html.matchAll(/\bname=["']([^"']+)["']/g)) ids.add(m[1])
      pageFragments.set(norm, ids)
    } else {
      assetPaths.add(site)
    }
  }
  return { htmlPaths, assetPaths, pageFragments }
}

function extractAttrs(html, tag, attr) {
  const re = new RegExp(`<${tag}\\b[^>]*?\\b${attr}=["']([^"']+)["']`, 'gi')
  const results = []
  for (const m of html.matchAll(re)) results.push(m[1])
  return results
}

function classifyHref(href, pagePath) {
  if (!href) return null
  const trimmed = href.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('#')) return { kind: 'self-fragment', fragment: trimmed.slice(1) }
  if (/^(mailto:|tel:|javascript:|data:)/i.test(trimmed)) return null
  try {
    const base = `https://${SITE_HOST}${pagePath === '/' ? '' : pagePath}/`
    const u = new URL(trimmed, base)
    const isInternal = u.host === SITE_HOST || u.host === '' || u.host === `www.${SITE_HOST}`
    return {
      kind: isInternal ? 'internal' : 'external',
      url: u,
      pathname: u.pathname,
      fragment: u.hash.slice(1),
    }
  } catch {
    return { kind: 'invalid', raw: trimmed }
  }
}

function loadCache() {
  if (NO_CACHE) return {}
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  if (NO_CACHE) return
  fs.mkdirSync(path.dirname(cachePath), { recursive: true })
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
}

async function checkExternal(url, cache) {
  const key = url.toString()
  const now = Date.now()
  const host = url.host.toLowerCase()
  if (UNVERIFIED_HOSTS.has(host) || UNVERIFIED_URLS.has(key)) {
    const entry = { ok: true, unverified: true, status: 0, ts: now }
    cache[key] = entry
    return entry
  }
  const cached = cache[key]
  const ttl = 7 * 24 * 60 * 60 * 1000 // 7 days
  if (cached && now - cached.ts < ttl) return cached
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    let res
    try {
      res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'PHIGuardLinkCheck/1.0' },
      })
      if (res.status === 405 || res.status === 403 || res.status === 404) {
        res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'user-agent': 'PHIGuardLinkCheck/1.0' },
        })
      }
    } catch (_) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'PHIGuardLinkCheck/1.0' },
      })
    }
    const entry = { ok: res.status < 400, status: res.status, ts: now }
    cache[key] = entry
    return entry
  } catch (err) {
    const error = String(err?.message || err)
    if (error.toLowerCase().includes('aborted')) {
      const entry = { ok: true, unverified: true, status: 0, error, ts: now }
      cache[key] = entry
      return entry
    }
    const entry = { ok: false, status: 0, error: String(err.message || err), ts: now }
    cache[key] = entry
    return entry
  } finally {
    clearTimeout(timer)
  }
}

async function pool(items, workerCount, worker) {
  const queue = items.slice()
  let active = 0
  let idx = 0
  return new Promise((resolve) => {
    const next = () => {
      if (idx >= items.length && active === 0) return resolve()
      while (active < workerCount && queue.length > 0) {
        const item = queue.shift()
        const i = idx++
        active++
        Promise.resolve(worker(item, i)).finally(() => {
          active--
          next()
        })
      }
    }
    next()
  })
}

function readLegacyRedirectsMap() {
  // The marketing site uses sync-legacy-paths.mjs; there is no public/_redirects yet.
  // If added, parse basic "from to [status]" lines.
  const p = path.join(projectRoot, 'public', '_redirects')
  if (!fs.existsSync(p)) return new Map()
  const map = new Map()
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const s = line.trim()
    if (!s || s.startsWith('#')) continue
    const [from, to] = s.split(/\s+/)
    if (from && to) map.set(normalizePath(from), to)
  }
  return map
}

async function main() {
  if (!fs.existsSync(distRoot)) {
    console.error('dist/ not found — run `pnpm build` first.')
    process.exit(2)
  }

  const { htmlPaths, assetPaths, pageFragments } = collectValidPaths()
  const redirects = readLegacyRedirectsMap()

  const internalBroken = []
  const brokenFragments = []
  const missingAssets = []
  const externals = new Map() // url -> [{source}]
  const invalidHrefs = []
  const inboundLinks = new Map([...htmlPaths].map((p) => [p, new Set()]))

  for (const file of walk(distRoot)) {
    if (!file.endsWith('.html')) continue
    const pagePath = normalizePath(toSitePath(file))
    const html = fs.readFileSync(file, 'utf8')
    const refs = []
    for (const href of extractAttrs(html, 'a', 'href')) refs.push({ href, kind: 'a' })
    for (const href of extractAttrs(html, 'link', 'href')) refs.push({ href, kind: 'link' })
    for (const src of extractAttrs(html, 'script', 'src')) refs.push({ href: src, kind: 'script' })
    for (const src of extractAttrs(html, 'img', 'src')) refs.push({ href: src, kind: 'img' })

    for (const { href, kind } of refs) {
      const info = classifyHref(href, pagePath)
      if (!info) continue
      if (info.kind === 'invalid') {
        invalidHrefs.push({ source: pagePath, href: info.raw })
        continue
      }
      if (info.kind === 'self-fragment') {
        const ids = pageFragments.get(pagePath) ?? new Set()
        if (!ids.has(info.fragment)) {
          brokenFragments.push({ source: pagePath, href: '#' + info.fragment, reason: 'self fragment not found' })
        }
        continue
      }
      if (info.kind === 'external') {
        const key = info.url.toString().split('#')[0]
        if (!externals.has(key)) externals.set(key, [])
        externals.get(key).push({ source: pagePath, originalHref: href })
        continue
      }
      // internal
      const target = normalizePath(info.pathname)
      const isAssetLike = path.extname(target) !== '' && knownBinaryExts.has(path.extname(target).toLowerCase())
      if (kind === 'img' || kind === 'script' || isAssetLike || target.startsWith('/_astro/')) {
        if (!assetPaths.has(target) && !htmlPaths.has(target)) {
          missingAssets.push({ source: pagePath, href, target })
        }
        continue
      }
      // html-ish internal link
      if (!htmlPaths.has(target)) {
        if (redirects.has(target)) continue
        // also allow .html-less matches where target === asset file (rare)
        if (assetPaths.has(target)) continue
        internalBroken.push({ source: pagePath, href, target })
        continue
      }
      if (info.fragment) {
        const ids = pageFragments.get(target) ?? new Set()
        if (!ids.has(info.fragment)) {
          brokenFragments.push({ source: pagePath, href, target, fragment: info.fragment })
        }
      }
      if (kind === 'a' && target !== pagePath && htmlPaths.has(target)) {
        inboundLinks.get(target)?.add(pagePath)
      }
    }
  }

  const orphanPages = [...inboundLinks.entries()]
    .filter(([pagePath, sources]) => !ORPHAN_EXEMPT_PATHS.has(pagePath) && sources.size === 0)
    .map(([pagePath]) => pagePath)
    .sort()

  // External check
  let externalResults = new Map()
  if (!INTERNAL_ONLY && externals.size > 0) {
    const cache = loadCache()
    const urls = [...externals.keys()]
    console.log(`Checking ${urls.length} external URLs...`)
    await pool(urls, 10, async (u) => {
      try {
        const entry = await checkExternal(new URL(u), cache)
        externalResults.set(u, entry)
      } catch (e) {
        externalResults.set(u, { ok: false, status: 0, error: String(e) })
      }
    })
    saveCache(cache)
  }

  // Suggest nearest slug for internal 404s
  const allValid = [...htmlPaths]
  function suggest(target) {
    if (!target) return null
    let best = null
    let bestScore = Infinity
    for (const v of allValid) {
      const d = levenshtein(target, v)
      if (d < bestScore) {
        bestScore = d
        best = v
      }
    }
    if (bestScore > Math.max(6, Math.floor(target.length / 3))) return null
    return best
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length
    if (m === 0) return n
    if (n === 0) return m
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      }
    }
    return dp[m][n]
  }

  // Report
  fs.mkdirSync(auditDir, { recursive: true })
  const lines = []
  lines.push('# Broken links — phiguard.app')
  lines.push('')
  lines.push(`Generated ${new Date().toISOString()}`)
  lines.push('')
  lines.push(`Pages scanned: ${htmlPaths.size}`)
  lines.push(`Internal 404s: ${internalBroken.length}`)
  lines.push(`Public orphan pages: ${orphanPages.length}`)
  lines.push(`Broken fragments: ${brokenFragments.length}`)
  lines.push(`Missing assets: ${missingAssets.length}`)
  const brokenExt = [...externalResults.entries()].filter(([, v]) => !v.ok)
  const unverifiedExt = [...externalResults.entries()].filter(([, v]) => v.unverified)
  lines.push(`Broken externals: ${brokenExt.length}`)
  lines.push(`Unverified externals: ${unverifiedExt.length}`)
  lines.push('')

  lines.push('## Internal 404s')
  if (internalBroken.length === 0) lines.push('_none_')
  else {
    // Group by target so fixes cluster
    const byTarget = new Map()
    for (const b of internalBroken) {
      const k = b.target
      if (!byTarget.has(k)) byTarget.set(k, [])
      byTarget.get(k).push(b)
    }
    const sorted = [...byTarget.entries()].sort((a, b) => b[1].length - a[1].length)
    for (const [target, arr] of sorted) {
      const s = suggest(target)
      lines.push('')
      lines.push(`### \`${target}\`  (×${arr.length})`)
      if (s) lines.push(`Suggested: \`${s}\``)
      lines.push('Sources:')
      for (const b of arr.slice(0, 20)) lines.push(`- ${b.source}  (href=\`${b.href}\`)`)
      if (arr.length > 20) lines.push(`- …and ${arr.length - 20} more`)
    }
  }

  lines.push('')
  lines.push('## Public orphan pages')
  if (orphanPages.length === 0) lines.push('_none_')
  else {
    lines.push('These built HTML pages have no inbound internal `<a>` links from another built page.')
    for (const pagePath of orphanPages) lines.push(`- ${pagePath}`)
  }

  lines.push('')
  lines.push('## Broken fragments')
  if (brokenFragments.length === 0) lines.push('_none_')
  else {
    for (const b of brokenFragments) {
      lines.push(`- ${b.source} → \`${b.href}\` (target=${b.target ?? b.source}, fragment=${b.fragment ?? ''})`)
    }
  }

  lines.push('')
  lines.push('## Missing assets')
  if (missingAssets.length === 0) lines.push('_none_')
  else {
    const uniq = new Map()
    for (const m of missingAssets) {
      if (!uniq.has(m.target)) uniq.set(m.target, [])
      uniq.get(m.target).push(m.source)
    }
    for (const [t, sources] of uniq) {
      lines.push(`- \`${t}\`  (×${sources.length}) e.g. ${sources[0]}`)
    }
  }

  if (!INTERNAL_ONLY) {
    lines.push('')
    lines.push('## Broken external links')
    if (brokenExt.length === 0) lines.push('_none_')
    else {
      for (const [u, r] of brokenExt) {
        const sources = externals.get(u).map((s) => s.source)
        const uniqSrc = [...new Set(sources)]
        lines.push(`- ${u}  — ${r.status || 'err'} ${r.error ?? ''}`)
        for (const s of uniqSrc.slice(0, 5)) lines.push(`  - from ${s}`)
        if (uniqSrc.length > 5) lines.push(`  - …and ${uniqSrc.length - 5} more`)
      }
    }
    lines.push('')
    lines.push('## Unverified external links (anti-bot hosts)')
    if (unverifiedExt.length === 0) lines.push('_none_')
    else for (const [u] of unverifiedExt) lines.push(`- ${u}`)
  }

  lines.push('')
  lines.push('## Invalid hrefs')
  if (invalidHrefs.length === 0) lines.push('_none_')
  else for (const i of invalidHrefs.slice(0, 50)) lines.push(`- ${i.source} → \`${i.href}\``)

  fs.writeFileSync(reportPath, lines.join('\n'))

  const hardFail = internalBroken.length
    + orphanPages.length
    + brokenFragments.length
    + missingAssets.length
    + (INTERNAL_ONLY ? 0 : brokenExt.length)
  console.log(`Report: ${path.relative(projectRoot, reportPath)}`)
  console.log(`Internal 404s: ${internalBroken.length}`)
  console.log(`Public orphan pages: ${orphanPages.length}`)
  console.log(`Broken fragments: ${brokenFragments.length}`)
  console.log(`Missing assets: ${missingAssets.length}`)
  if (!INTERNAL_ONLY) {
    console.log(`Broken externals: ${brokenExt.length}`)
    console.log(`Unverified externals: ${unverifiedExt.length}`)
  }
  process.exit(hardFail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
