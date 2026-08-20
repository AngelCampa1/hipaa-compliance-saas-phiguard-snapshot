import fs from 'node:fs'
import path from 'node:path'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { LEAD_MAGNETS, LEAD_MAGNET_TITLES } from '@phiguard/lead-magnets'
import { LEAD_MAGNET_MANIFEST, type LeadMagnetEntry } from './manifest.js'

const repoRoot = path.resolve(import.meta.dirname, '../../..')
const marketingDir = path.join(repoRoot, 'apps', 'marketing', 'src')
const resourcesDir = path.join(repoRoot, 'apps', 'marketing', 'src', 'content', 'resources')
const pdfDocumentsDir = path.join(repoRoot, 'packages', 'pdf', 'src', 'documents')
const RESOURCE_ROUTE_EXCLUSIONS = new Set(['best', 'free', 'guides', 'thank-you', 'tools'])
const PLACEHOLDER_COPY_RE = /\b(TODO|FIXME|lorem|placeholder|REPLACE_ME|coming soon|TBD|dummy|sample text)\b|\[insert/iu

function extractMagnetSlug(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const match = raw.match(/^magnetSlug:\s*"([^"\n]+)"/m)
  return match?.[1] ?? null
}

function collectResourceMagnetSlugs() {
  return new Set(
    fs
      .readdirSync(resourcesDir)
      .filter((entry) => entry.endsWith('.md'))
      .map((entry) => extractMagnetSlug(path.join(resourcesDir, entry)))
      .filter((slug): slug is string => Boolean(slug)),
  )
}

function collectFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return collectFiles(entryPath)
    }

    if (!entry.isFile() || !/\.(astro|md|mdx|ts|tsx)$/.test(entry.name)) {
      return []
    }

    return [entryPath]
  })
}

function extractPromotedLeadMagnetSlugs(raw: string) {
  const slugs = new Set<string>()

  for (const match of raw.matchAll(/relatedResource:\s*["']?([a-z0-9][a-z0-9-]+)["']?(?=[\s,}\]]|$)/g)) {
    slugs.add(match[1])
  }

  for (const match of raw.matchAll(/magnetSlug=["']([^"'\n]+)["']/g)) {
    if (match[1] !== 'newsletter') {
      slugs.add(match[1])
    }
  }

  for (const propMatch of raw.matchAll(/magnetSlug=\{([^}]+)\}/gs)) {
    for (const slugMatch of propMatch[1].matchAll(/["']([a-z0-9][a-z0-9-]+)["']/g)) {
      if (slugMatch[1] !== 'newsletter') {
        slugs.add(slugMatch[1])
      }
    }
  }

  for (const match of raw.matchAll(/\/resources\/([a-z0-9-]+)(?=[/#?)"'`\s])/g)) {
    const previousChar = match.index === 0 ? '' : raw[match.index - 1]
    if (/[A-Za-z0-9.]/.test(previousChar)) {
      continue
    }

    const slug = match[1]
    if (!RESOURCE_ROUTE_EXCLUSIONS.has(slug)) {
      slugs.add(slug)
    }
  }

  return slugs
}

function collectPromotedLeadMagnetSlugs() {
  const slugs = new Set<string>()

  for (const filePath of collectFiles(marketingDir)) {
    const raw = fs.readFileSync(filePath, 'utf8')
    for (const slug of extractPromotedLeadMagnetSlugs(raw)) {
      slugs.add(slug)
    }
  }

  return slugs
}

function renderManifestDocument(entry: LeadMagnetEntry) {
  const documentComponent = entry.render()
  const layoutElement = (documentComponent.type as (props: unknown) => ReactElement)(documentComponent.props)

  return (layoutElement.type as (props: unknown) => ReactElement<Record<string, unknown>>)(
    layoutElement.props,
  )
}

describe('lead magnet consistency', () => {
  it('keeps public lead magnet slugs aligned across marketing, API, and PDF manifest', () => {
    const marketingSlugs = collectResourceMagnetSlugs()
    const apiSlugs = new Set(Object.keys(LEAD_MAGNET_TITLES).filter((slug) => slug !== 'newsletter'))
    const configSlugs = new Set(LEAD_MAGNETS.map((magnet) => magnet.slug))
    const manifestSlugs = new Set(LEAD_MAGNET_MANIFEST.map((entry) => entry.slug))

    expect(apiSlugs).toEqual(marketingSlugs)
    expect(configSlugs).toEqual(marketingSlugs)
    expect(manifestSlugs).toEqual(marketingSlugs)
  })

  it('only promotes canonical lead magnets from marketing pages and components', () => {
    const promotedSlugs = collectPromotedLeadMagnetSlugs()
    const configSlugs = new Set(LEAD_MAGNETS.map((magnet) => magnet.slug))

    for (const slug of promotedSlugs) {
      expect(configSlugs, `Promoted lead magnet "${slug}" must exist in LEAD_MAGNETS`).toContain(slug)
    }
  })

  it('detects promoted slugs in unquoted frontmatter, TS objects, and expression props', () => {
    const promotedSlugs = extractPromotedLeadMagnetSlugs(`
---
relatedResource: hipaa-risk-analysis-template
---
const cta = { relatedResource: 'hipaa-new-hire-checklist', title: 'Onboarding' }
<LeadCapturePanel magnetSlug={entry.data.relatedResource ?? 'vendor-baa-tracker'} />
<LeadCapturePanel magnetSlug="newsletter" />
`)

    expect(promotedSlugs).toEqual(
      new Set(['hipaa-risk-analysis-template', 'hipaa-new-hire-checklist', 'vendor-baa-tracker']),
    )
  })

  it('keeps every canonical lead magnet backed by a concrete storage PDF key', () => {
    const storageKeys = new Set<string>()

    for (const magnet of LEAD_MAGNETS) {
      expect(magnet.storageKey).toMatch(/^lead-magnets\/.+\.pdf$/)
      expect(storageKeys, `storage key "${magnet.storageKey}" must be unique`).not.toContain(magnet.storageKey)
      storageKeys.add(magnet.storageKey)
    }
  })

  it('renders lead magnet PDFs with reusable resource metadata', () => {
    for (const entry of LEAD_MAGNET_MANIFEST) {
      const magnet = LEAD_MAGNETS.find((candidate) => candidate.slug === entry.slug)
      const doc = renderManifestDocument(entry)

      expect(magnet, `Lead magnet "${entry.slug}" must exist in shared metadata`).toBeDefined()
      expect(doc.props.author).toBe('PHIGuard')
      expect(doc.props.subject).toBe(magnet?.inlineCopy.body)
      expect(doc.props.keywords).toBe(`${magnet?.title}, HIPAA, compliance, clinic resource`)
      expect(doc.props.language).toBe('en-US')
      expect(entry.metadata.canonicalResourceUrl).toBe(`https://phiguard.app/resources/${entry.slug}`)
    }
  })

  it('keeps shipped PDF resources free of obvious placeholder copy', () => {
    for (const filePath of collectFiles(pdfDocumentsDir)) {
      const raw = fs.readFileSync(filePath, 'utf8')
      expect(raw, `${path.relative(repoRoot, filePath)} contains placeholder copy`).not.toMatch(PLACEHOLDER_COPY_RE)
    }
  })
})
