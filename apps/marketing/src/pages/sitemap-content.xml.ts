import { getCollection, type CollectionEntry } from 'astro:content'
import type { LearnEntry } from '../lib/learn'
import { buildLearnPath } from '../lib/learn'
import { contributorList } from '../lib/contributors'
import { staticIndexablePages } from '../lib/indexable-pages'
import { PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand/identity'
import { serializeUrlSet, type SitemapEntry } from '../lib/sitemap'

const BASE_URL = PHIGUARD_PUBLIC_SITE_ORIGIN
// Fixed date — update manually when a static layout page changes meaningfully.
// Do NOT use new Date() here: it would tell Google every page changed on every deploy.
const STATIC_PAGE_DATE = '2026-05-01'

export async function GET() {
  const [learn, resources, guides, best, hipaaSoftware, cityGuides, stateGuides, alternatives, comparisons, practiceTypes] = await Promise.all([
    getCollection('learn'),
    getCollection('resources'),
    getCollection('guides'),
    getCollection('best'),
    getCollection('hipaa-software'),
    getCollection('city-guides'),
    getCollection('state-guides'),
    getCollection('alternatives'),
    getCollection('comparisons'),
    getCollection('practice-types'),
  ])

  const items: SitemapEntry[] = [
    ...staticIndexablePages.map((path) => ({
      loc: path === '/' ? BASE_URL : `${BASE_URL}${path}`,
      lastmod: STATIC_PAGE_DATE,
    })),
    ...learn.map((entry: LearnEntry) => ({
      loc: `${BASE_URL}${buildLearnPath(entry)}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...resources.map((entry: CollectionEntry<'resources'>) => ({
      loc: `${BASE_URL}/resources/${entry.data.magnetSlug}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...guides.map((entry: CollectionEntry<'guides'>) => ({
      loc: `${BASE_URL}/resources/guides/${entry.id.replace(/\.md$/, '')}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...best.map((entry: CollectionEntry<'best'>) => ({
      loc: `${BASE_URL}/resources/best/${entry.id.replace(/\.md$/, '')}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...hipaaSoftware.map((entry: CollectionEntry<'hipaa-software'>) => ({
      loc: `${BASE_URL}/hipaa-software/${entry.id.replace(/\.md$/, '')}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...cityGuides.map((entry: CollectionEntry<'city-guides'>) => ({
      loc: `${BASE_URL}/locations/hipaa-compliance/${entry.id}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...stateGuides.map((entry: CollectionEntry<'state-guides'>) => ({
      loc: `${BASE_URL}/locations/${entry.data.pageFamily === 'breach-notification' ? 'hipaa-breach-notification' : 'hipaa-compliance-software'}/${entry.data.slug}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...alternatives.map((entry: CollectionEntry<'alternatives'>) => ({
      loc: `${BASE_URL}/alternatives/${entry.id.replace(/\.md$/, '')}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...comparisons.map((entry: CollectionEntry<'comparisons'>) => ({
      loc: `${BASE_URL}/compare/${entry.id.replace(/\.md$/, '')}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...practiceTypes.map((entry: CollectionEntry<'practice-types'>) => ({
      loc: `${BASE_URL}/practice-types/${entry.id.replace(/\.md$/, '')}`,
      lastmod: entry.data.updatedAt.toISOString().slice(0, 10),
    })),
    ...contributorList.map((contributor) => ({
      loc: `${BASE_URL}/contributors/${contributor.slug}`,
      lastmod: STATIC_PAGE_DATE,
    })),
  ]

  const xml = serializeUrlSet(items)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
