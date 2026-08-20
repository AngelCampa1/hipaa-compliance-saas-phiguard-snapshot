import { PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand/identity'
import { serializeUrlSet } from '../lib/sitemap'

const BASE_URL = PHIGUARD_PUBLIC_SITE_ORIGIN
// Fixed date for root AI-readable files. Update when llms.txt or pricing.txt changes meaningfully.
const ROOT_FILE_DATE = '2026-05-01'

const rootFiles = ['llms.txt', 'pricing.txt'] as const

export function GET() {
  const xml = serializeUrlSet(rootFiles.map((fileName) => ({
    loc: `${BASE_URL}/${fileName}`,
    lastmod: ROOT_FILE_DATE,
  })))

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
