import { PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand/identity'
import { serializeSitemapIndex } from '../lib/sitemap'

const BASE_URL = PHIGUARD_PUBLIC_SITE_ORIGIN
// Update this when the sitemap structure changes (e.g., new collection added).
const SITEMAP_INDEX_DATE = '2026-05-12'

export function GET() {
  const xml = serializeSitemapIndex([
    { loc: `${BASE_URL}/sitemap-content.xml`, lastmod: SITEMAP_INDEX_DATE },
    { loc: `${BASE_URL}/sitemap-root-files.xml`, lastmod: SITEMAP_INDEX_DATE },
  ])

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
