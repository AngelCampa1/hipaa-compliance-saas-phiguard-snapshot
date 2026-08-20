import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const contentRoot = path.join(projectRoot, 'src', 'content')
const staticCommercialPaths = new Set([
  '/',
  '/baa',
  '/compare',
  '/hipaa',
  '/product',
  '/pricing',
  '/resources',
  '/security',
  '/trust',
])
const commercialPathPrefixes = ['/alternatives/', '/compare/', '/hipaa-software/', '/practice-types/', '/resources/']
commercialPathPrefixes.push('/locations/hipaa-compliance/')
commercialPathPrefixes.push('/locations/hipaa-compliance-software/')
commercialPathPrefixes.push('/locations/hipaa-breach-notification/')

const errors = []

function fail(message) {
  errors.push(message)
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

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    fail(`${path.relative(projectRoot, filePath)}: invalid JSON (${error.message})`)
    return {}
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function readFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const match = raw.match(/^---\s*([\s\S]*?)\s*---/)
  if (!match) {
    fail(`${path.relative(projectRoot, filePath)}: missing frontmatter block`)
    return ''
  }
  return match[1]
}

function hasField(frontmatter, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped}:`, 'm').test(frontmatter)
}

function assertFields(filePath, requiredFields) {
  if (filePath.endsWith('.json')) {
    const data = readJson(filePath)
    for (const field of requiredFields) {
      if (!(field in data)) {
        fail(`${path.relative(projectRoot, filePath)}: missing required field "${field}"`)
      }
    }
    return
  }

  const frontmatter = readFrontmatter(filePath)
  for (const field of requiredFields) {
    if (!hasField(frontmatter, field)) {
      fail(`${path.relative(projectRoot, filePath)}: missing required frontmatter field "${field}"`)
    }
  }
}

function getFieldValue(frontmatter, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = frontmatter.match(new RegExp(`^${escaped}:\\s*["']?([^"'\\n]+)["']?`, 'm'))
  return match?.[1]?.trim()
}

function normalizeAuditValue(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function getMarkdownBody(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return raw.replace(/^---\s*[\s\S]*?\s*---/, '').trim()
}

function getMarkdownRoute(filePath) {
  const collection = path.basename(path.dirname(filePath))
  const slug = path.basename(filePath, '.md')
  if (collection === 'comparisons') return `/compare/${slug}`
  return `/${collection}/${slug}`
}

function recordUniqueValue(index, value, rel, field) {
  const normalized = normalizeAuditValue(value)
  if (!normalized) return

  const firstRel = index.get(normalized)
  if (firstRel) {
    fail(`${rel}: duplicate ${field} also used by ${firstRel}`)
    return
  }

  index.set(normalized, rel)
}

function isValidCommercialPath(pathValue) {
  const normalized = pathValue.split('#')[0]
  return staticCommercialPaths.has(normalized) || commercialPathPrefixes.some((prefix) => normalized.startsWith(prefix))
}

function assertLinkedPaths(filePath) {
  if (filePath.endsWith('.json')) {
    const data = readJson(filePath)
    const relatedCommercialPath = data.relatedCommercialPath
    const relatedLearnPath = data.relatedLearnPath

    if (relatedCommercialPath && !isValidCommercialPath(relatedCommercialPath)) {
      fail(`${path.relative(projectRoot, filePath)}: invalid relatedCommercialPath "${relatedCommercialPath}"`)
    }

    if (relatedLearnPath && !relatedLearnPath.startsWith('/learn/')) {
      fail(`${path.relative(projectRoot, filePath)}: invalid relatedLearnPath "${relatedLearnPath}"`)
    }
    return
  }

  const frontmatter = readFrontmatter(filePath)
  const relatedCommercialPath = getFieldValue(frontmatter, 'relatedCommercialPath')
  const relatedLearnPath = getFieldValue(frontmatter, 'relatedLearnPath')

  if (relatedCommercialPath && !isValidCommercialPath(relatedCommercialPath)) {
    fail(`${path.relative(projectRoot, filePath)}: invalid relatedCommercialPath "${relatedCommercialPath}"`)
  }

  if (relatedLearnPath && !relatedLearnPath.startsWith('/learn/')) {
    fail(`${path.relative(projectRoot, filePath)}: invalid relatedLearnPath "${relatedLearnPath}"`)
  }
}

const checks = [
  {
    dir: 'learn',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer'],
  },
  {
    dir: 'guides',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath', 'verificationDate'],
  },
  {
    dir: 'best',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath', 'verificationDate'],
  },
  {
    dir: 'hipaa-software',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath'],
  },
  {
    dir: 'city-guides',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'verificationDate', 'summary', 'sources', 'author', 'reviewer', 'city', 'state', 'stateAbbreviation', 'primaryKeyword', 'relatedLearnPath', 'relatedResource', 'nearbyCitySlugs', 'localOperationalNotes', 'selectionEvidence'],
  },
  {
    dir: 'state-guides',
    fields: ['title', 'seoTitle', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'verificationDate', 'summary', 'sources', 'author', 'reviewer', 'state', 'stateAbbreviation', 'pageFamily', 'primaryKeyword', 'intent', 'keyTakeaways', 'stateSpecificNotes', 'practicalChecklist', 'internalLinks', 'relatedCitySlugs'],
  },
  {
    dir: 'alternatives',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath', 'verificationDate'],
  },
  {
    dir: 'comparisons',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath', 'verificationDate'],
  },
  {
    dir: 'practice-types',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath'],
  },
  {
    dir: 'resources',
    fields: ['title', 'description', 'metaDescription', 'publishedAt', 'updatedAt', 'summary', 'sources', 'author', 'reviewer', 'relatedCommercialPath'],
  },
]

for (const check of checks) {
  const dirPath = path.join(contentRoot, check.dir)
  for (const filePath of collectContentFiles(dirPath)) {
    assertFields(filePath, check.fields)
    assertLinkedPaths(filePath)
  }
}

for (const filePath of collectMarkdownFiles(path.join(contentRoot, 'guides'))) {
  assertFields(filePath, ['author', 'reviewer', 'sources', 'updatedAt', 'verificationDate'])
}

const markdownFiles = collectMarkdownFiles(contentRoot)
const seoTitleIndex = new Map()
const metaDescriptionIndex = new Map()

for (const filePath of markdownFiles) {
  const rel = path.relative(projectRoot, filePath)
  const frontmatter = readFrontmatter(filePath)
  const seoTitle = getFieldValue(frontmatter, 'seoTitle')
  const metaDescription = getFieldValue(frontmatter, 'metaDescription')
  const frontmatterSlug = getFieldValue(frontmatter, 'slug')

  recordUniqueValue(seoTitleIndex, seoTitle, rel, 'seoTitle')
  recordUniqueValue(metaDescriptionIndex, metaDescription, rel, 'metaDescription')

  if (frontmatterSlug) {
    const expectedSlug = path.basename(filePath, '.md')
    if (frontmatterSlug !== expectedSlug) {
      fail(`${rel}: frontmatter slug "${frontmatterSlug}" does not match filename slug "${expectedSlug}"`)
    }
  }
}

const riskyCommercialPairs = [
  [
    'alternatives/notion-alternative.md',
    'alternatives/notion-alternative-healthcare.md',
  ],
  [
    'comparisons/hipaa-compliance-software-comparison.md',
    'comparisons/hipaa-compliance-software-comparison-2026.md',
  ],
]

for (const [leftRelative, rightRelative] of riskyCommercialPairs) {
  const leftPath = path.join(contentRoot, leftRelative)
  const rightPath = path.join(contentRoot, rightRelative)
  if (!fs.existsSync(leftPath) || !fs.existsSync(rightPath)) continue

  const leftRel = path.relative(projectRoot, leftPath)
  const rightRel = path.relative(projectRoot, rightPath)
  const leftFrontmatter = readFrontmatter(leftPath)
  const rightFrontmatter = readFrontmatter(rightPath)
  const leftTitle = getFieldValue(leftFrontmatter, 'title')
  const rightTitle = getFieldValue(rightFrontmatter, 'title')
  const leftSeoTitle = getFieldValue(leftFrontmatter, 'seoTitle')
  const rightSeoTitle = getFieldValue(rightFrontmatter, 'seoTitle')
  const leftDescription = getFieldValue(leftFrontmatter, 'description')
  const rightDescription = getFieldValue(rightFrontmatter, 'description')
  const leftMetaDescription = getFieldValue(leftFrontmatter, 'metaDescription')
  const rightMetaDescription = getFieldValue(rightFrontmatter, 'metaDescription')
  const leftBody = getMarkdownBody(leftPath)
  const rightBody = getMarkdownBody(rightPath)
  const leftRoute = getMarkdownRoute(leftPath)
  const rightRoute = getMarkdownRoute(rightPath)

  if (normalizeAuditValue(leftTitle) === normalizeAuditValue(rightTitle)) {
    fail(`${leftRel} and ${rightRel}: risky commercial pages must not share the same title`)
  }
  if (normalizeAuditValue(leftSeoTitle) === normalizeAuditValue(rightSeoTitle)) {
    fail(`${leftRel} and ${rightRel}: risky commercial pages must not share the same seoTitle`)
  }
  if (normalizeAuditValue(leftDescription) === normalizeAuditValue(rightDescription)) {
    fail(`${leftRel} and ${rightRel}: risky commercial pages must not share the same description`)
  }
  if (normalizeAuditValue(leftMetaDescription) === normalizeAuditValue(rightMetaDescription)) {
    fail(`${leftRel} and ${rightRel}: risky commercial pages must not share the same metaDescription`)
  }
  if (!leftBody.includes(rightRoute)) {
    fail(`${leftRel}: risky commercial overlap must link to ${rightRoute} to clarify intent`)
  }
  if (!rightBody.includes(leftRoute)) {
    fail(`${rightRel}: risky commercial overlap must link to ${leftRoute} to clarify intent`)
  }
  if (jaccardSimilarity(leftBody, rightBody) > 0.5) {
    fail(`${leftRel} and ${rightRel}: risky commercial pages are too similar after intent split`)
  }
}

function normalizeCityGuideText(value, data) {
  return String(value ?? '')
    .replaceAll(data.city, '{city}')
    .replaceAll(data.state, '{state}')
    .replaceAll(data.stateAbbreviation, '{stateAbbreviation}')
    .replace(/\bPHIGuard\b/g, '{brand}')
    .replace(/\s+/g, ' ')
    .trim()
}

function shingleSet(value) {
  const words = value
    .toLowerCase()
    .replace(/[^a-z0-9{}]+/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)
  const shingles = new Set()
  for (let i = 0; i <= words.length - 3; i += 1) {
    shingles.add(words.slice(i, i + 3).join(' '))
  }
  return shingles
}

function jaccardSimilarity(a, b) {
  const aShingles = shingleSet(a)
  const bShingles = shingleSet(b)
  const intersection = [...aShingles].filter((shingle) => bShingles.has(shingle)).length
  const union = new Set([...aShingles, ...bShingles]).size
  return union === 0 ? 0 : intersection / union
}

const cityGuideDir = path.join(contentRoot, 'city-guides')
const cityGuideFiles = collectContentFiles(cityGuideDir).filter((filePath) => filePath.endsWith('.json'))
if (cityGuideFiles.length !== 100) {
  fail(`city-guides: expected exactly 100 generated guides, found ${cityGuideFiles.length}`)
}

const cityGuideSlugs = new Set(cityGuideFiles.map((filePath) => path.basename(filePath, '.json')))
const cityGuideContentSignatures = new Map()
const cityGuideUniquenessSignatures = []
for (const filePath of cityGuideFiles) {
  const data = readJson(filePath)
  const rel = path.relative(projectRoot, filePath)
  const expectedSlug = `${slugify(data.city ?? '')}-${String(data.stateAbbreviation ?? '').toLowerCase()}`
  const actualSlug = path.basename(filePath, '.json')

  if (actualSlug !== expectedSlug) {
    fail(`${rel}: slug "${actualSlug}" does not match city/state "${expectedSlug}"`)
  }

  if (!Array.isArray(data.sources) || data.sources.length < 5) {
    fail(`${rel}: expected federal sources plus at least one state source`)
  } else {
    const hasStateSource = data.sources.some((source) => source.publisher && !String(source.publisher).match(/HHS|Electronic Code/i))
    if (!hasStateSource) {
      fail(`${rel}: missing state-specific source`)
    }
  }

  if (!Array.isArray(data.localOperationalNotes) || data.localOperationalNotes.length < 3) {
    fail(`${rel}: expected at least three city-specific localOperationalNotes`)
  } else if (!data.localOperationalNotes.every((note) => String(note).includes(data.city))) {
    fail(`${rel}: each localOperationalNotes entry must name the city`)
  }

  if (!data.selectionEvidence || typeof data.selectionEvidence !== 'object') {
    fail(`${rel}: missing selectionEvidence object`)
  } else {
    if (!Array.isArray(data.selectionEvidence.keywordSet) || data.selectionEvidence.keywordSet.length < 4) {
      fail(`${rel}: selectionEvidence.keywordSet must include city-modified HIPAA query targets`)
    }
    if (!data.selectionEvidence.priorityTier) {
      fail(`${rel}: selectionEvidence.priorityTier is required`)
    }
  }

  if (!Array.isArray(data.nearbyCitySlugs)) {
    fail(`${rel}: nearbyCitySlugs must be an array`)
  } else {
    for (const slug of data.nearbyCitySlugs) {
      if (!cityGuideSlugs.has(slug)) {
        fail(`${rel}: nearby city slug "${slug}" does not resolve to a city guide`)
      }
    }
  }

  const signature = [
    data.summary,
    data.stateOverlay,
    ...(data.localOperationalNotes ?? []),
    ...(data.operatingPriorities ?? []),
    ...(data.checklist ?? []),
    ...(data.faq ?? []).map((item) => item.a),
  ].map((value) => normalizeCityGuideText(value, data)).join('\n')
  const matchingFiles = cityGuideContentSignatures.get(signature) ?? []
  matchingFiles.push(rel)
  cityGuideContentSignatures.set(signature, matchingFiles)

  const uniquenessSignature = [
    data.cityContext,
    ...(data.localOperationalNotes ?? []),
    data.selectionEvidence?.validationNote,
  ].map((value) => normalizeCityGuideText(value, data)).join('\n')
  cityGuideUniquenessSignatures.push({ signature: uniquenessSignature, file: rel })
}

const stateGuideDir = path.join(contentRoot, 'state-guides')
const stateGuideFiles = collectContentFiles(stateGuideDir).filter((filePath) => filePath.endsWith('.json'))
if (stateGuideFiles.length !== 100) {
  fail(`state-guides: expected exactly 100 generated guides, found ${stateGuideFiles.length}`)
}

const stateFamilyCounts = new Map()
const statePrimaryKeywords = new Map()
const stateGuideSlugs = new Set()
const stateGuideUrls = []
const resourcePaths = new Set(collectContentFiles(path.join(contentRoot, 'resources'))
  .filter((filePath) => filePath.endsWith('.md'))
  .map((filePath) => {
    const frontmatter = readFrontmatter(filePath)
    const magnetSlug = getFieldValue(frontmatter, 'magnetSlug')
    return magnetSlug ? `/resources/${magnetSlug}` : null
  })
  .filter(Boolean))
const learnPaths = new Set(collectContentFiles(path.join(contentRoot, 'learn'))
  .filter((filePath) => filePath.endsWith('.md'))
  .map((filePath) => {
    const relativePath = path.relative(path.join(contentRoot, 'learn'), filePath).replaceAll('\\', '/')
    return `/learn/${relativePath.replace(/\.md$/, '').replace(/\/index$/, '')}`
  }))
const validStaticGeneratedLinks = new Set([...staticCommercialPaths, '/baa', '/security'])

function isResolvableStateGuideInternalLink(href) {
  const normalized = String(href ?? '').split('#')[0]
  if (validStaticGeneratedLinks.has(normalized)) return true
  if (resourcePaths.has(normalized)) return true
  if (learnPaths.has(normalized)) return true
  if (normalized.startsWith('/locations/hipaa-compliance/')) {
    return cityGuideSlugs.has(normalized.replace('/locations/hipaa-compliance/', ''))
  }
  if (normalized.startsWith('/locations/hipaa-compliance-software/')) {
    return stateGuideSlugs.has(`compliance-software:${normalized.replace('/locations/hipaa-compliance-software/', '')}`)
  }
  if (normalized.startsWith('/locations/hipaa-breach-notification/')) {
    return stateGuideSlugs.has(`breach-notification:${normalized.replace('/locations/hipaa-breach-notification/', '')}`)
  }
  return false
}

for (const filePath of stateGuideFiles) {
  const data = readJson(filePath)
  const rel = path.relative(projectRoot, filePath)
  const expectedSlug = slugify(data.state ?? '')
  const actualSlug = data.slug
  const family = data.pageFamily

  if (actualSlug !== expectedSlug) {
    fail(`${rel}: slug "${actualSlug}" does not match state "${expectedSlug}"`)
  }

  if (!['compliance-software', 'breach-notification'].includes(family)) {
    fail(`${rel}: invalid pageFamily "${family}"`)
  }

  const familyKey = `${data.state}:${family}`
  stateFamilyCounts.set(familyKey, (stateFamilyCounts.get(familyKey) ?? 0) + 1)
  stateGuideSlugs.add(`${family}:${actualSlug}`)
  stateGuideUrls.push(`https://phiguard.app/locations/${family === 'breach-notification' ? 'hipaa-breach-notification' : 'hipaa-compliance-software'}/${actualSlug}`)

  if (statePrimaryKeywords.has(data.primaryKeyword)) {
    fail(`${rel}: duplicate primaryKeyword also used by ${statePrimaryKeywords.get(data.primaryKeyword)}`)
  }
  statePrimaryKeywords.set(data.primaryKeyword, rel)
}

for (const filePath of stateGuideFiles) {
  const data = readJson(filePath)
  const rel = path.relative(projectRoot, filePath)

  if (!Array.isArray(data.sources) || data.sources.length < 3) {
    fail(`${rel}: expected at least three sources`)
  } else {
    for (const source of data.sources) {
      try {
        new URL(source.url)
      } catch {
        fail(`${rel}: invalid source URL "${source.url}"`)
      }
    }
    const hasStateSource = data.sources.some((source) => source.publisher && !String(source.publisher).match(/HHS|Electronic Code/i))
    if (!hasStateSource) {
      fail(`${rel}: missing state-specific source`)
    }
  }

  if (!Array.isArray(data.practicalChecklist) || data.practicalChecklist.length < 5 || data.practicalChecklist.length > 8) {
    fail(`${rel}: practicalChecklist must include 5-8 items`)
  }
  if (!Array.isArray(data.stateSpecificNotes) || data.stateSpecificNotes.length < 3 || data.stateSpecificNotes.length > 5) {
    fail(`${rel}: stateSpecificNotes must include 3-5 items`)
  }
  if (!Array.isArray(data.faq) || data.faq.length < 3 || data.faq.length > 5) {
    fail(`${rel}: faq must include 3-5 items`)
  }
  if (!Array.isArray(data.internalLinks) || data.internalLinks.length < 6) {
    fail(`${rel}: internalLinks must include at least six links`)
  } else {
    for (const link of data.internalLinks) {
      if (!String(link.href ?? '').startsWith('/')) {
        fail(`${rel}: internal link must be root-relative: "${link.href}"`)
      } else if (!isResolvableStateGuideInternalLink(link.href)) {
        fail(`${rel}: internal link does not resolve to a known generated/static path: "${link.href}"`)
      }
    }
  }
  if (!Array.isArray(data.relatedCitySlugs)) {
    fail(`${rel}: relatedCitySlugs must be an array`)
  } else {
    for (const slug of data.relatedCitySlugs) {
      if (!cityGuideSlugs.has(slug)) {
        fail(`${rel}: related city slug "${slug}" does not resolve to a city guide`)
      }
    }
  }
}

const statesInGuides = new Set(stateGuideFiles.map((filePath) => readJson(filePath).state))
for (const state of statesInGuides) {
  for (const family of ['compliance-software', 'breach-notification']) {
    const count = stateFamilyCounts.get(`${state}:${family}`) ?? 0
    if (count !== 1) {
      fail(`state-guides: expected exactly one ${family} page for ${state}, found ${count}`)
    }
  }
}

const manifestPath = path.resolve(projectRoot, '..', '..', 'state-guide-urls.txt')
if (!fs.existsSync(manifestPath)) {
  fail('state-guide-urls.txt: missing generated URL manifest')
} else {
  const manifestUrls = fs.readFileSync(manifestPath, 'utf8').trim().split(/\r?\n/).filter(Boolean)
  const expectedUrls = [...stateGuideUrls].sort()
  if (JSON.stringify(manifestUrls) !== JSON.stringify(expectedUrls)) {
    fail('state-guide-urls.txt: manifest does not exactly match generated state guide routes')
  }
}

for (const matchingFiles of cityGuideContentSignatures.values()) {
  if (matchingFiles.length > 1) {
    fail(`city-guides: duplicated generated content signature in ${matchingFiles.join(', ')}`)
  }
}

for (let i = 0; i < cityGuideUniquenessSignatures.length; i += 1) {
  for (let j = i + 1; j < cityGuideUniquenessSignatures.length; j += 1) {
    const similarity = jaccardSimilarity(
      cityGuideUniquenessSignatures[i].signature,
      cityGuideUniquenessSignatures[j].signature,
    )
    if (similarity > 0.86) {
      fail(
        `city-guides: near-duplicate city-specific content (${similarity.toFixed(2)} similarity) in ${cityGuideUniquenessSignatures[i].file} and ${cityGuideUniquenessSignatures[j].file}`,
      )
    }
  }
}

if (errors.length > 0) {
  console.error('Content funnel check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Content funnel check passed.')
