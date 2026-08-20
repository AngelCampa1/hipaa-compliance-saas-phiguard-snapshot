const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>'
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'

export type SitemapEntry = {
  loc: string
  lastmod: string
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function serializeSitemapIndex(entries: SitemapEntry[]): string {
  return XML_DECLARATION +
    `<sitemapindex xmlns="${SITEMAP_NAMESPACE}">` +
    entries
      .map((entry) => (
        `<sitemap><loc>${escapeXml(entry.loc)}</loc><lastmod>${escapeXml(entry.lastmod)}</lastmod></sitemap>`
      ))
      .join('') +
    '</sitemapindex>'
}

export function serializeUrlSet(entries: SitemapEntry[]): string {
  return XML_DECLARATION +
    `<urlset xmlns="${SITEMAP_NAMESPACE}">` +
    entries
      .map((entry) => (
        `<url><loc>${escapeXml(entry.loc)}</loc><lastmod>${escapeXml(entry.lastmod)}</lastmod></url>`
      ))
      .join('') +
    '</urlset>'
}
