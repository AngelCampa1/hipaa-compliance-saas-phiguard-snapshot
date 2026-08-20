import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectLegacyPaths, readCommittedLegacyPaths, sortLegacyPaths } from './legacy-paths.mjs'

const siteBaseUrl = 'https://phiguard.app'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const distRoot = path.join(projectRoot, 'dist')
const contentRoot = path.join(projectRoot, 'src', 'content')
const requiredRootFiles = ['llms.txt', 'pricing.txt']
const requiredSitemaps = ['sitemap-content.xml', 'sitemap-root-files.xml']

const errors = []

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function fail(message) {
  errors.push(message)
}

function toSitePathFromHtml(filePath) {
  const rel = path.relative(distRoot, filePath).replaceAll('\\', '/')
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`
  if (rel.endsWith('.html')) return `/${rel.slice(0, -'.html'.length)}`
  return `/${rel}`
}

function toHtmlPath(sitePath) {
  if (sitePath === '/') return path.join(distRoot, 'index.html')
  const trimmed = sitePath.replace(/^\/+/, '')
  return path.join(distRoot, trimmed, 'index.html')
}

function collectHtmlFiles(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath, output)
      continue
    }
    if (entry.name.endsWith('.html')) {
      output.push(fullPath)
    }
  }
  return output
}

function getTagContent(html, regex) {
  return html.match(regex)?.[1] ?? ''
}

function collectMarkdownFiles(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, output)
      continue
    }
    if (entry.name.endsWith('.md')) {
      output.push(fullPath)
    }
  }
  return output
}

function collectContentFiles(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectContentFiles(fullPath, output)
      continue
    }
    if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
      output.push(fullPath)
    }
  }
  return output
}

function getFrontmatterScalar(raw, field) {
  return raw.match(new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1]?.trim() ?? ''
}

function getContentScalar(filePath, raw, field) {
  if (filePath.endsWith('.json')) {
    try {
      return JSON.parse(raw)[field] ?? ''
    } catch {
      return ''
    }
  }
  return getFrontmatterScalar(raw, field)
}

function assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, collection, toSitePath) {
  const dir = path.join(contentRoot, collection)
  for (const filePath of collectContentFiles(dir)) {
    const raw = read(filePath)
    const updatedAt = getContentScalar(filePath, raw, 'updatedAt')
    if (!updatedAt) {
      fail(`${path.relative(projectRoot, filePath)}: missing updatedAt for sitemap lastmod check`)
      continue
    }

    const sitePath = toSitePath(filePath, raw)
    const sitemapLastmod = sitemapEntries.get(`${siteBaseUrl}${sitePath}`)
    if (sitemapLastmod !== updatedAt) {
      fail(`${sitePath}: sitemap lastmod ${sitemapLastmod ?? 'missing'} does not match updatedAt ${updatedAt}`)
    }
  }
}

function assertSharedChrome(sitePath, html) {
  const mainCount = (html.match(/<main\b/gi) ?? []).length
  const footerCount = (html.match(/<footer\b/gi) ?? []).length

  if (mainCount !== 1) fail(`${sitePath}: expected exactly one <main>, found ${mainCount}`)
  if (footerCount < 1) fail(`${sitePath}: missing shared footer shell`)
  if (!html.includes('Skip to main content')) fail(`${sitePath}: missing skip link`)
  if (!html.includes('aria-label="Main navigation"')) fail(`${sitePath}: missing shared main navigation`)
}

function assertSingleTopLevelHeading(collectionDir) {
  const dir = path.join(contentRoot, collectionDir)
  const stack = [dir]

  while (stack.length > 0) {
    const currentDir = stack.pop()
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      if (!entry.name.endsWith('.md')) {
        continue
      }

      const raw = read(fullPath)
      const body = raw.replace(/^---[\s\S]*?---\s*/, '')
      const firstContentLine = body
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0)

      if (firstContentLine?.startsWith('# ')) {
        fail(
          `Source guard failed for ${path.relative(projectRoot, fullPath)}: markdown body starts with a top-level H1.`,
        )
      }
    }
  }
}

function assertHeaderBlock(fileName, requiredHeaders) {
  const headersPath = path.join(distRoot, '_headers')
  if (!fs.existsSync(headersPath)) {
    fail('Missing _headers in build output')
    return
  }

  const headers = read(headersPath)
  const block = headers.match(new RegExp(`^/${fileName}\\r?\\n((?:  .+\\r?\\n?)+)`, 'm'))?.[1] ?? ''
  if (!block) {
    fail(`/${fileName}: missing explicit _headers block`)
    return
  }

  for (const header of requiredHeaders) {
    if (!block.includes(header)) {
      fail(`/${fileName}: missing _headers directive "${header}"`)
    }
  }
}

function assertSitemapIndexReferencesExistingFiles() {
  const sitemapIndexPath = path.join(distRoot, 'sitemap-index.xml')
  if (!fs.existsSync(sitemapIndexPath)) {
    fail('Missing sitemap-index.xml')
    return
  }

  const sitemapIndexXml = read(sitemapIndexPath)
  for (const fileName of requiredSitemaps) {
    const loc = `${siteBaseUrl}/${fileName}`
    if (!sitemapIndexXml.includes(`<loc>${loc}</loc>`)) {
      fail(`sitemap-index.xml missing sitemap reference: ${loc}`)
      continue
    }

    if (!fs.existsSync(path.join(distRoot, fileName))) {
      fail(`sitemap-index.xml references missing file: ${fileName}`)
    }
  }
}

function assertSitemapXmlAliasMatchesIndex() {
  const sitemapXmlPath = path.join(distRoot, 'sitemap.xml')
  const sitemapIndexPath = path.join(distRoot, 'sitemap-index.xml')
  if (!fs.existsSync(sitemapXmlPath)) {
    fail('Missing sitemap.xml alias')
    return
  }
  if (!fs.existsSync(sitemapIndexPath)) {
    return
  }

  const sitemapXml = read(sitemapXmlPath)
  const sitemapIndexXml = read(sitemapIndexPath)
  if (sitemapXml !== sitemapIndexXml) {
    fail('sitemap.xml does not match sitemap-index.xml')
  }
}

function assertRootFilesAreSitemapDiscoverable() {
  const sitemapXml = requiredSitemaps
    .map((fileName) => {
      const filePath = path.join(distRoot, fileName)
      return fs.existsSync(filePath) ? read(filePath) : ''
    })
    .join('\n')

  for (const fileName of requiredRootFiles) {
    const loc = `${siteBaseUrl}/${fileName}`
    if (!sitemapXml.includes(`<loc>${loc}</loc>`)) {
      fail(`/${fileName}: root AI-readable file missing from sitemap output`)
    }
  }
}

for (const fileName of requiredRootFiles) {
  const builtPath = path.join(distRoot, fileName)
  if (!fs.existsSync(builtPath)) {
    fail(`Missing required AI-readable root file in build: ${fileName}`)
  }
}

assertHeaderBlock('llms.txt', [
  'Cache-Control: public, max-age=86400',
  'Content-Type: text/plain; charset=utf-8',
])
assertHeaderBlock('pricing.txt', [
  'Cache-Control: public, max-age=86400',
  'Content-Type: text/plain; charset=utf-8',
])
assertSitemapIndexReferencesExistingFiles()
assertSitemapXmlAliasMatchesIndex()
assertRootFilesAreSitemapDiscoverable()

const sitemapXml = read(path.join(distRoot, 'sitemap-content.xml'))
const sitemapEntries = new Map(
  [...sitemapXml.matchAll(/<url><loc>(.*?)<\/loc><lastmod>(.*?)<\/lastmod><\/url>/g)]
    .map(([, loc, lastmod]) => [loc, lastmod]),
)
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'resources', (_filePath, raw) => {
  const magnetSlug = getFrontmatterScalar(raw, 'magnetSlug')
  return `/resources/${magnetSlug}`
})
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'learn', (filePath) => {
  const relativeId = path.relative(path.join(contentRoot, 'learn'), filePath).replaceAll('\\', '/')
  return `/learn/${relativeId.replace(/\.md$/, '').replace(/\/index$/, '')}`
})
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'guides', (filePath) => (
  `/resources/guides/${path.basename(filePath, '.md')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'best', (filePath) => (
  `/resources/best/${path.basename(filePath, '.md')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'hipaa-software', (filePath) => (
  `/hipaa-software/${path.basename(filePath, '.md')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'alternatives', (filePath) => (
  `/alternatives/${path.basename(filePath, '.md')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'comparisons', (filePath) => (
  `/compare/${path.basename(filePath, '.md')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'practice-types', (filePath) => (
  `/practice-types/${path.basename(filePath, '.md')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'city-guides', (filePath) => (
  `/locations/hipaa-compliance/${path.basename(filePath, '.json')}`
))
assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'state-guides', (_filePath, raw) => {
  const data = JSON.parse(raw)
  const prefix = data.pageFamily === 'breach-notification' ? 'hipaa-breach-notification' : 'hipaa-compliance-software'
  return `/locations/${prefix}/${data.slug}`
})
const sitemapPaths = new Set(
  [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => {
    const withoutBase = loc.replace(siteBaseUrl, '')
    return withoutBase === '' ? '/' : withoutBase
  }),
)

const indexablePages = []
const titleUsage = new Map()
for (const htmlPath of collectHtmlFiles(distRoot)) {
  const html = read(htmlPath)
  const sitePath = toSitePathFromHtml(htmlPath)
  assertSharedChrome(sitePath, html)
  const robots = getTagContent(html, /<meta name="robots" content="([^"]*)"/i)
  const isIndexable = !/noindex/i.test(robots)
  if (!isIndexable) {
    continue
  }

  const title = getTagContent(html, /<title>(.*?)<\/title>/i)
  const description = getTagContent(html, /<meta name="description" content="([^"]*)"/i)
  const canonical = getTagContent(html, /<link rel="canonical" href="([^"]*)"/i)
  const h1Count = (html.match(/<h1\b/gi) ?? []).length

  indexablePages.push(sitePath)

  if (!title) fail(`${sitePath}: missing <title>`)
  else {
    const pagesForTitle = titleUsage.get(title) ?? []
    pagesForTitle.push(sitePath)
    titleUsage.set(title, pagesForTitle)
  }
  if (!description) fail(`${sitePath}: missing meta description`)
  if (!canonical) fail(`${sitePath}: missing canonical URL`)
  else {
    const expectedCanonical = `${siteBaseUrl}${sitePath === '/' ? '/' : sitePath}`
    if (canonical !== expectedCanonical) {
      fail(`${sitePath}: canonical ${canonical} does not exactly match ${expectedCanonical}`)
    }
  }
  if (!/<meta property="og:title" content="[^"]+"/i.test(html)) fail(`${sitePath}: missing og:title`)
  if (!/<meta property="og:description" content="[^"]+"/i.test(html)) fail(`${sitePath}: missing og:description`)
  if (!/<meta property="og:image" content="[^"]+"/i.test(html)) fail(`${sitePath}: missing og:image`)
  if (!/<meta name="twitter:card" content="[^"]+"/i.test(html)) fail(`${sitePath}: missing twitter:card`)
  if (h1Count !== 1) fail(`${sitePath}: expected exactly one <h1>, found ${h1Count}`)
  if (title.length > 60) fail(`${sitePath}: title too long (${title.length})`)
  if (description.length > 160) fail(`${sitePath}: meta description too long (${description.length})`)
  if (!sitemapPaths.has(sitePath)) fail(`${sitePath}: indexable page missing from sitemap-content.xml`)

  // Brand delimiter consistency — titles with a brand segment must use " | ", not " - " or " — ".
  if (title.includes('PHIGuard')) {
    if (/\s[-–—]\s/.test(title)) {
      fail(`${sitePath}: title uses non-pipe brand delimiter (use " | "): ${title}`)
    }
  }

  // JSON-LD: require at least one valid application/ld+json block per indexable page.
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  if (jsonLdMatches.length === 0) {
    fail(`${sitePath}: no JSON-LD structured data blocks found`)
  } else {
    const parsedSchemas = []
    for (const [, body] of jsonLdMatches) {
      try {
        parsedSchemas.push(JSON.parse(body))
      } catch (error) {
        fail(`${sitePath}: JSON-LD block is not valid JSON (${error.message})`)
      }
    }
    const hasType = (type) =>
      parsedSchemas.some((schema) => {
        const entries = Array.isArray(schema) ? schema : [schema]
        return entries.some((entry) => entry && entry['@type'] === type)
      })
    const learnContentTypes = ['Article', 'BlogPosting', 'DefinedTerm', 'CollectionPage', 'HowTo']
    const isLearnPage = sitePath.startsWith('/learn/') && sitePath !== '/learn/'
    const isHomepage = sitePath === '/'
    if (isLearnPage && !learnContentTypes.some(hasType)) {
      fail(`${sitePath}: learn page missing one of ${learnContentTypes.join('/')} schema`)
    }
    if (isHomepage && !hasType('SoftwareApplication')) {
      fail(`${sitePath}: homepage missing SoftwareApplication schema`)
    }
    if (!isHomepage && !hasType('BreadcrumbList')) {
      fail(`${sitePath}: non-root indexable page missing BreadcrumbList schema`)
    }
  }
}

for (const [title, pages] of titleUsage.entries()) {
  if (pages.length > 1) {
    fail(`Duplicate <title> "${title}" used by: ${pages.join(', ')}`)
  }
}

for (const sitemapPath of sitemapPaths) {
  const htmlPath = toHtmlPath(sitemapPath)
  if (!fs.existsSync(htmlPath)) {
    fail(`${sitemapPath}: sitemap entry points to a missing built page`)
    continue
  }

  const html = read(htmlPath)
  const robots = getTagContent(html, /<meta name="robots" content="([^"]*)"/i)
  if (/noindex/i.test(robots)) {
    fail(`${sitemapPath}: noindex page should not appear in sitemap-content.xml`)
  }
}

const generatedLegacyPaths = sortLegacyPaths(collectLegacyPaths())
const committedLegacyPaths = sortLegacyPaths(readCommittedLegacyPaths())

if (JSON.stringify(generatedLegacyPaths) !== JSON.stringify(committedLegacyPaths)) {
  fail('src/data/legacy-paths.json is out of sync with content metadata. Run `pnpm legacy:sync`.')
}

const legacyPaths = committedLegacyPaths
for (const [legacyPath, targetPath] of Object.entries(legacyPaths)) {
  if (legacyPath === targetPath) {
    fail(`Legacy redirect self-target detected: ${legacyPath} -> ${targetPath}`)
  }
}

for (const targetPath of new Set(Object.values(legacyPaths))) {
  if (path.extname(targetPath)) {
    const assetPath = path.join(distRoot, targetPath.replace(/^\/+/, ''))
    if (!fs.existsSync(assetPath)) {
      fail(`Legacy redirect asset target missing from build: ${targetPath}`)
    }
    continue
  }

  const htmlPath = toHtmlPath(targetPath)
  if (!fs.existsSync(htmlPath)) {
    fail(`Legacy redirect target missing from build: ${targetPath}`)
    continue
  }

  const html = read(htmlPath)
  const canonical = getTagContent(html, /<link rel="canonical" href="([^"]*)"/i)
  const expectedCanonical = `${siteBaseUrl}${targetPath === '/' ? '/' : targetPath}`
  if (canonical !== expectedCanonical) {
    fail(`Legacy redirect target ${targetPath} has canonical ${canonical}, expected ${expectedCanonical}`)
  }
}

assertSingleTopLevelHeading('alternatives')
assertSingleTopLevelHeading('practice-types')
assertSingleTopLevelHeading('guides')
assertSingleTopLevelHeading('best')
assertSingleTopLevelHeading('hipaa-software')

if (errors.length > 0) {
  console.error('SEO smoke check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`SEO smoke check passed for ${indexablePages.length} indexable pages.`)
