import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const contentRoot = path.join(projectRoot, 'src', 'content')
const reportPath = path.join(projectRoot, 'seo-audit', 'ai-citation-quality-report.md')
const jsonReportPath = path.join(projectRoot, 'seo-audit', 'ai-citation-quality-report.json')
const shouldWriteReport = process.argv.includes('--write-report')
const shouldWriteJson = process.argv.includes('--write-json')
const shouldWriteFullReport = process.argv.includes('--full-report')
const canonicalPricingDetails =
  'PHIGuard uses clinic-level pricing with annual billing shown by default, no seat-based fees, and BAA details available during plan review. See current PHIGuard pricing for plan names, monthly list prices, annual totals, and launch details.'

const AI_TARGETED_COLLECTIONS = new Set([
  'alternatives',
  'best',
  'comparisons',
  'guides',
  'hipaa-software',
  'practice-types',
  'resources',
  'city-guides',
  'state-guides',
])
const COMMERCIAL_COLLECTIONS = new Set([
  'alternatives',
  'best',
  'comparisons',
  'guides',
  'hipaa-software',
  'practice-types',
  'resources',
])
const LOCAL_COLLECTIONS = new Set(['city-guides', 'state-guides'])
const OFFICIAL_SOURCE_RE = /\b(hhs|ocr|ecfr|federal register|code of federal regulations|ftc|cms|cdc|state|attorney general|department of health|office of civil rights)\b/i

const warnings = []
const pages = []

function resolveCanonicalContentCopy(value) {
  return String(value ?? '').replace(/\{\{PHIGUARD_PRICING_DETAILS\}\}/g, canonicalPricingDetails)
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

function wordCount(value) {
  return String(value ?? '').match(/\b[\w'-]+\b/g)?.length ?? 0
}

function stripFrontmatter(raw) {
  return raw.replace(/^---[\s\S]*?---\s*/, '')
}

function readFrontmatter(raw) {
  return raw.match(/^---\s*([\s\S]*?)\s*---/)?.[1] ?? ''
}

function scalar(frontmatter, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return frontmatter.match(new RegExp(`^${escaped}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1]?.trim() ?? ''
}

function countYamlItems(frontmatter, field, itemKey) {
  const section = frontmatter.match(new RegExp(`^${field}:\\s*\\n([\\s\\S]*?)(?=^[a-zA-Z][\\w-]*:|(?![\\s\\S]))`, 'm'))?.[1] ?? ''
  return [...section.matchAll(new RegExp(`^\\s*-\\s*${itemKey}:`, 'gm'))].length
}

function extractYamlValues(frontmatter, field, itemKey) {
  const section = frontmatter.match(new RegExp(`^${field}:\\s*\\n([\\s\\S]*?)(?=^[a-zA-Z][\\w-]*:|(?![\\s\\S]))`, 'm'))?.[1] ?? ''
  return [...section.matchAll(new RegExp(`^(?:\\s*-\\s*|\\s+)${itemKey}:\\s*"?([^"\\n]+)"?`, 'gm'))].map(([, value]) => value.trim())
}

function markdownData(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const frontmatter = readFrontmatter(raw)
  return {
    body: stripFrontmatter(raw),
    faqCount: countYamlItems(frontmatter, 'faq', 'q'),
    sourceCount: countYamlItems(frontmatter, 'sources', 'title'),
    sourcePublishers: extractYamlValues(frontmatter, 'sources', 'publisher'),
    sourceTitles: extractYamlValues(frontmatter, 'sources', 'title'),
    summary: scalar(frontmatter, 'summary'),
    updatedAt: scalar(frontmatter, 'updatedAt'),
    verificationDate: scalar(frontmatter, 'verificationDate'),
    author: scalar(frontmatter, 'author'),
    reviewer: scalar(frontmatter, 'reviewer'),
  }
}

function jsonData(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const structuredText = [
    data.summary,
    data.directAnswer,
    data.cityContext,
    data.stateContext,
    data.stateOverlay,
    ...(data.keyTakeaways ?? []),
    ...(data.localOperationalNotes ?? []),
    ...(data.localRiskMap ?? []),
    ...(data.operatingPriorities ?? []),
    ...(data.evidenceCadence ?? []),
    ...(data.softwareBuyingCriteria ?? []),
    ...(data.operationalGuidance ?? []),
    ...(data.stateSpecificNotes ?? []),
    ...(data.practicalChecklist ?? []),
    ...(data.checklist ?? []),
    ...(data.faq ?? []).flatMap((item) => [item.q, item.a]),
  ].filter(Boolean).map(resolveCanonicalContentCopy).join('\n')

  return {
    body: structuredText,
    faqCount: Array.isArray(data.faq) ? data.faq.length : 0,
    sourceCount: Array.isArray(data.sources) ? data.sources.length : 0,
    sourcePublishers: (data.sources ?? []).map((source) => source.publisher).filter(Boolean),
    sourceTitles: (data.sources ?? []).map((source) => source.title).filter(Boolean),
    summary: resolveCanonicalContentCopy(data.summary ?? data.directAnswer ?? ''),
    updatedAt: data.updatedAt ?? '',
    verificationDate: data.verificationDate ?? '',
    author: data.author ?? '',
    reviewer: data.reviewer ?? '',
  }
}

function routeFor(collection, filePath, data) {
  const slug = path.basename(filePath, path.extname(filePath))
  const rel = path.relative(path.join(contentRoot, collection), filePath).replaceAll('\\', '/').replace(/\.(md|json)$/, '')

  if (collection === 'learn') return `/learn/${rel.replace(/\/index$/, '')}`
  if (collection === 'resources') {
    const raw = fs.readFileSync(filePath, 'utf8')
    const magnetSlug = scalar(readFrontmatter(raw), 'magnetSlug')
    return `/resources/${magnetSlug || slug}`
  }
  if (collection === 'guides') return `/resources/guides/${slug}`
  if (collection === 'best') return `/resources/best/${slug}`
  if (collection === 'comparisons') return `/compare/${slug}`
  if (collection === 'city-guides') return `/locations/hipaa-compliance/${slug}`
  if (collection === 'state-guides') {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const prefix = parsed.pageFamily === 'breach-notification' ? 'hipaa-breach-notification' : 'hipaa-compliance-software'
    return `/locations/${prefix}/${parsed.slug}`
  }
  return `/${collection}/${slug}`
}

function addWarning(page, issue, priority, detail) {
  warnings.push({ ...page, issue, priority, detail })
}

function normalizeForPattern(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\bphiguard\b/g, '{brand}')
    .replace(/\b[a-z]+,\s+[a-z]{2}\b/g, '{city-state}')
    .replace(/\b(california|texas|new york|florida|illinois|pennsylvania|ohio|georgia|north carolina|michigan)\b/g, '{state}')
    .replace(/\b(asana|clickup|monday|notion|jira|trello|slack|google|microsoft|zoom|hubspot)\b/g, '{vendor}')
    .replace(/[^a-z0-9{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shingleSet(value) {
  const words = normalizeForPattern(value).split(' ').filter((word) => word.length > 3)
  const shingles = new Set()
  for (let i = 0; i <= words.length - 4; i += 1) {
    shingles.add(words.slice(i, i + 4).join(' '))
  }
  return shingles
}

function jaccard(a, b) {
  const aSet = a instanceof Set ? a : shingleSet(a)
  const bSet = b instanceof Set ? b : shingleSet(b)
  const union = new Set([...aSet, ...bSet]).size
  if (union === 0) return 0
  return [...aSet].filter((item) => bSet.has(item)).length / union
}

for (const collection of fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)) {
  for (const filePath of collectContentFiles(path.join(contentRoot, collection))) {
    const data = filePath.endsWith('.json') ? jsonData(filePath) : markdownData(filePath)
    const page = {
      collection,
      route: routeFor(collection, filePath, data),
      file: path.relative(projectRoot, filePath).replaceAll('\\', '/'),
    }
    const bodyWords = wordCount(data.body)
    const summaryWords = wordCount(data.summary)
    const minWords = LOCAL_COLLECTIONS.has(collection) ? 900 : COMMERCIAL_COLLECTIONS.has(collection) ? 700 : 500
    const isHub = page.route.endsWith('/index') || page.route === '/learn/'
    const sourceText = [...data.sourcePublishers, ...data.sourceTitles].join(' ')

    pages.push({
      ...page,
      bodyWords,
      summaryWords,
      faqCount: data.faqCount,
      sourceCount: data.sourceCount,
      shingles: shingleSet(data.body),
      summary: data.summary,
    })

    if (!isHub && bodyWords < minWords) {
      addWarning(page, 'thin-page', bodyWords < minWords * 0.7 ? 1 : 2, `${bodyWords} words; target ${minWords}+`)
    }
    if (AI_TARGETED_COLLECTIONS.has(collection) && data.faqCount < 3) {
      addWarning(page, 'missing-or-short-faq', data.faqCount === 0 ? 1 : 2, `${data.faqCount} FAQ items; target 3+`)
    }
    if (data.sourceCount === 0) {
      addWarning(page, 'missing-sources', 1, 'No sources found')
    } else if (!OFFICIAL_SOURCE_RE.test(sourceText)) {
      addWarning(page, 'weak-source-signal', 2, 'No obvious official/legal source publisher or title')
    }
    if (!data.updatedAt) addWarning(page, 'missing-freshness-signal', 1, 'Missing updatedAt')
    if (['guides', 'best', 'alternatives', 'comparisons', 'city-guides', 'state-guides'].includes(collection) && !data.verificationDate) {
      addWarning(page, 'missing-verification-date', 2, 'Decision/compliance page lacks verificationDate')
    }
    if (!data.author || !data.reviewer) addWarning(page, 'missing-trust-metadata', 1, 'Missing author or reviewer')
    if (summaryWords > 0 && (summaryWords < 40 || summaryWords > 70)) {
      addWarning(page, 'summary-length', 3, `${summaryWords} words; target 40-70`)
    }
  }
}

for (let i = 0; i < pages.length; i += 1) {
  for (let j = i + 1; j < pages.length; j += 1) {
    if (pages[i].collection !== pages[j].collection) continue
    if (pages[i].shingles.size < 12 || pages[j].shingles.size < 12) continue
    const similarity = jaccard(pages[i].shingles, pages[j].shingles)
    if (similarity >= 0.82) {
      addWarning(pages[i], 'repeated-generated-copy-pattern', 2, `${similarity.toFixed(2)} similarity with ${pages[j].route}`)
    }
  }
}

warnings.sort((a, b) => a.priority - b.priority || a.collection.localeCompare(b.collection) || a.route.localeCompare(b.route))

const byIssue = new Map()
for (const warning of warnings) {
  byIssue.set(warning.issue, (byIssue.get(warning.issue) ?? 0) + 1)
}

const report = [
  '# AI Citation Quality Report',
  '',
  `Generated: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Thresholds',
  '',
  '- Commercial/editorial non-hub pages: 700+ words or equivalent structured content.',
  '- Local generated pages: 900+ words or equivalent structured content.',
  '- AI-targeted page families: 3+ natural-language FAQ items.',
  '- Summary answer blocks: roughly 40-70 words.',
  '',
  '## Issue Counts',
  '',
  ...([...(byIssue.entries())].length ? [...byIssue.entries()].map(([issue, count]) => `- ${issue}: ${count}`) : ['- None']),
  '',
  '## Priority Queue',
  '',
  ...((shouldWriteFullReport ? warnings : warnings.slice(0, 80)).length
    ? (shouldWriteFullReport ? warnings : warnings.slice(0, 80)).map((warning) => (
      `- P${warning.priority} ${warning.issue}: ${warning.route} (${warning.file}) - ${warning.detail}`
    ))
    : ['- No issues reported.']),
  '',
]

console.log(`AI citation quality audit reported ${warnings.length} issues across ${pages.length} pages.`)
console.log('')
const renderedReport = `${report.join('\n').trimEnd()}\n`

console.log(renderedReport)

if (shouldWriteReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, renderedReport)
  console.log(`Report written to ${path.relative(projectRoot, reportPath).replaceAll('\\', '/')}.`)
}

if (shouldWriteJson) {
  fs.mkdirSync(path.dirname(jsonReportPath), { recursive: true })
  const serializablePages = pages.map(({ shingles, ...page }) => ({
    ...page,
    shingles: [...shingles],
    shingleCount: shingles.size,
  }))
  fs.writeFileSync(jsonReportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), issueCounts: Object.fromEntries(byIssue), pages: serializablePages, warnings }, null, 2)}\n`)
  console.log(`JSON report written to ${path.relative(projectRoot, jsonReportPath).replaceAll('\\', '/')}.`)
}
