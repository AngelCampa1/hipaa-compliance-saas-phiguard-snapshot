import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const contentRoot = path.join(projectRoot, 'src', 'content')
const legacyPathsPath = path.join(projectRoot, 'src', 'data', 'legacy-paths.json')
const manualRedirects = {
  '/sitemap-0.xml': '/sitemap-content.xml',
  '/compare/alternatives': '/compare',
  '/compare/alternatives/': '/compare',
  '/compare/alternatives/asana': '/alternatives/asana-alternative',
  '/compare/alternatives/asana/': '/alternatives/asana-alternative',
  '/compare/alternatives/asana-hipaa-clinics': '/alternatives/asana-alternative',
  '/compare/alternatives/asana-hipaa-clinics/': '/alternatives/asana-alternative',
  '/compare/alternatives/trello': '/alternatives/trello-alternative',
  '/compare/alternatives/trello/': '/alternatives/trello-alternative',
  '/compare/alternatives/wrike': '/alternatives/wrike-alternative',
  '/compare/alternatives/wrike/': '/alternatives/wrike-alternative',
  '/compare/pricing': '/pricing',
  '/compare/pricing/': '/pricing',
  '/compare/pricing/asana-enterprise-hipaa-pricing': '/alternatives/asana-alternative',
  '/compare/pricing/asana-enterprise-hipaa-pricing/': '/alternatives/asana-alternative',
  '/compare/pricing/monday-enterprise-hipaa-minimum-seats': '/alternatives/monday-alternative',
  '/compare/pricing/monday-enterprise-hipaa-minimum-seats/': '/alternatives/monday-alternative',
  '/compare/versus/asana-vs-dock-health': '/compare',
  '/compare/versus/asana-vs-dock-health/': '/compare',
  '/compare/versus/asana-vs-monday-hipaa-compliance': '/compare',
  '/compare/versus/asana-vs-monday-hipaa-compliance/': '/compare',
  '/compare/versus/dock-health-vs-asana': '/compare',
  '/compare/versus/dock-health-vs-asana/': '/compare',
  '/compare/versus/dock-health-vs-clickup': '/compare',
  '/compare/versus/dock-health-vs-clickup/': '/compare',
  '/compare/versus/dock-health-vs-monday': '/compare',
  '/compare/versus/dock-health-vs-monday/': '/compare',
  '/compare/versus/dock-health-vs-notion': '/compare',
  '/compare/versus/dock-health-vs-notion/': '/compare',
  '/contributors/phiguard-editorial-team': '/contributors/angel-campa',
  '/contributors/phiguard-editorial-team/': '/contributors/angel-campa',
  '/contributors/phiguard-product-team': '/contributors/angel-campa',
  '/contributors/phiguard-product-team/': '/contributors/angel-campa',
  '/free/baa-vendor-tracking-template': '/resources/vendor-baa-tracker',
  '/free/baa-vendor-tracking-template/': '/resources/vendor-baa-tracker',
  '/free/hipaa-enforcement-penalty-tracker': '/learn/compliance-operations/ocr-enforcement-patterns-small-providers',
  '/free/hipaa-enforcement-penalty-tracker/': '/learn/compliance-operations/ocr-enforcement-patterns-small-providers',
  '/free/hipaa-risk-assessment-template': '/resources/hipaa-risk-analysis-template',
  '/free/hipaa-risk-assessment-template/': '/resources/hipaa-risk-analysis-template',
  '/free/hipaa-starter-checklist': '/resources/hipaa-compliance-self-assessment',
  '/free/hipaa-starter-checklist/': '/resources/hipaa-compliance-self-assessment',
  '/hipaa-software/behavioral-health': '/hipaa-software/behavioral-health-practices',
  '/hipaa-software/behavioral-health/': '/hipaa-software/behavioral-health-practices',
  '/hipaa-software/chiropractic-offices': '/practice-types/chiropractic-practice',
  '/hipaa-software/chiropractic-offices/': '/practice-types/chiropractic-practice',
  '/hipaa-software/physical-therapy-clinics': '/practice-types/physical-therapy-practice',
  '/hipaa-software/physical-therapy-clinics/': '/practice-types/physical-therapy-practice',
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function walkMarkdownFiles(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, output)
      continue
    }

    if (entry.name.endsWith('.md')) {
      output.push(fullPath)
    }
  }

  return output
}

function extractFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/)
  return match?.[1] ?? ''
}

function parseScalar(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))
  return match?.[1]?.trim()
}

function parseStringList(frontmatter, field) {
  const lines = frontmatter.split('\n')
  const index = lines.findIndex((line) => line.trim() === `${field}:`)
  if (index === -1) return []

  const values = []
  for (let lineIndex = index + 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]
    if (!line.startsWith('  - ')) break
    values.push(line.replace(/^  - /, '').trim().replace(/^"|"$/g, ''))
  }

  return values
}

function withTrailingSlashVariants(paths) {
  const expanded = new Set()
  for (const sitePath of paths) {
    if (!sitePath || sitePath === '/') continue
    const normalized = sitePath.startsWith('/') ? sitePath : `/${sitePath}`
    expanded.add(normalized)
    expanded.add(normalized.endsWith('/') ? normalized.slice(0, -1) : `${normalized}/`)
  }
  return expanded
}

function normalizeSitePath(sitePath) {
  if (!sitePath) return ''
  if (sitePath === '/') return '/'
  const normalized = sitePath.startsWith('/') ? sitePath : `/${sitePath}`
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
}

function slugFromFilename(filePath) {
  return path.basename(filePath, path.extname(filePath))
}

function buildLearnPath(filePath) {
  const rel = path.relative(path.join(contentRoot, 'learn'), filePath).replaceAll('\\', '/')
  const withoutExt = rel.replace(/\.md$/, '')
  const normalized = withoutExt.replace(/\/index$/, '')
  return `/learn/${normalized}`
}

function collectCollectionRedirects(collection) {
  const collectionDir = path.join(contentRoot, collection)
  if (!fs.existsSync(collectionDir)) return {}

  const redirects = {}
  const files = walkMarkdownFiles(collectionDir)

  for (const filePath of files) {
    const raw = read(filePath)
    const frontmatter = extractFrontmatter(raw)
    const explicitPaths = parseStringList(frontmatter, 'legacyPaths')
    const explicitSet = withTrailingSlashVariants(explicitPaths)
    const basename = slugFromFilename(filePath)

    if (collection === 'resources') {
      const magnetSlug = parseScalar(frontmatter, 'magnetSlug') ?? slugFromFilename(filePath)
      const targetPath = `/resources/${magnetSlug}`
      const derivedSet = withTrailingSlashVariants([
        `/free/${magnetSlug}`,
        `/resources/free/${magnetSlug}`,
      ])

      for (const legacyPath of new Set([...explicitSet, ...derivedSet])) {
        if (normalizeSitePath(legacyPath) === normalizeSitePath(targetPath)) continue
        redirects[legacyPath] = targetPath
      }
      continue
    }

    if (collection === 'learn') {
      const targetPath = buildLearnPath(filePath)
      const basename = targetPath.split('/').pop()
      const derivedSet = withTrailingSlashVariants(
        basename ? [`/guides/${basename}`, `/resources/guides/${basename}`] : [],
      )

      for (const legacyPath of new Set([...explicitSet, ...derivedSet])) {
        if (normalizeSitePath(legacyPath) === normalizeSitePath(targetPath)) continue
        redirects[legacyPath] = targetPath
      }
      continue
    }

    if (collection === 'guides' || collection === 'best' || collection === 'hipaa-software') {
      const targetPath = collection === 'guides'
        ? `/resources/guides/${basename}`
        : collection === 'best'
          ? `/resources/best/${basename}`
          : `/hipaa-software/${basename}`

      for (const legacyPath of explicitSet) {
        if (normalizeSitePath(legacyPath) === normalizeSitePath(targetPath)) continue
        redirects[legacyPath] = targetPath
      }
      continue
    }

    const configuredSlug = parseScalar(frontmatter, 'slug')
    const targetSlug = configuredSlug ?? basename

    let targetPath = ''
    if (collection === 'alternatives') targetPath = `/alternatives/${targetSlug}`
    if (collection === 'comparisons') targetPath = `/compare/${targetSlug}`
    if (collection === 'practice-types') targetPath = `/practice-types/${targetSlug}`

    for (const legacyPath of explicitSet) {
      if (normalizeSitePath(legacyPath) === normalizeSitePath(targetPath)) continue
      redirects[legacyPath] = targetPath
    }
  }

  return redirects
}

export function collectLegacyPaths() {
  return {
    ...manualRedirects,
    ...collectCollectionRedirects('learn'),
    ...collectCollectionRedirects('resources'),
    ...collectCollectionRedirects('guides'),
    ...collectCollectionRedirects('best'),
    ...collectCollectionRedirects('hipaa-software'),
    ...collectCollectionRedirects('alternatives'),
    ...collectCollectionRedirects('comparisons'),
    ...collectCollectionRedirects('practice-types'),
  }
}

export function sortLegacyPaths(redirects) {
  return Object.fromEntries(
    Object.entries(redirects).sort(([left], [right]) => left.localeCompare(right))
  )
}

export function readCommittedLegacyPaths() {
  return JSON.parse(read(legacyPathsPath))
}

export { legacyPathsPath }
