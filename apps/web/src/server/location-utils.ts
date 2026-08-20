import { and, eq } from 'drizzle-orm'
import type { DB } from '@phiguard/db'

function toSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export async function buildUniqueLocationSlug(
  db: DB,
  organizationId: string,
  name: string,
  excludeLocationId?: string,
) {
  const { locations } = await import('@phiguard/db')
  const base = toSlugPart(name) || 'location'

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    const [existing] = await db
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.organizationId, organizationId),
          eq(locations.slug, candidate),
        ),
      )
      .limit(1)

    if (!existing || existing.id === excludeLocationId) {
      return candidate
    }
  }

  throw new Error('Unable to generate a unique location slug')
}
