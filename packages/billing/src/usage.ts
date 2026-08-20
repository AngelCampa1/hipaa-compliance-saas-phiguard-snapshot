import { eq, sql } from 'drizzle-orm'
import { featureUsage, type DB } from '@phiguard/db'
import { PLANS, type FeatureKey } from './plans.js'

const ALL_FEATURE_KEYS = new Set<string>(PLANS.compliance_ops.features)

export async function recordFeatureUsage(
  db: DB,
  organizationId: string,
  featureKey: FeatureKey,
): Promise<void> {
  await db
    .insert(featureUsage)
    .values({ organizationId, featureKey })
    .onConflictDoUpdate({
      target: [featureUsage.organizationId, featureUsage.featureKey],
      set: {
        lastUsedAt: sql`now()`,
        useCount: sql`${featureUsage.useCount} + 1`,
      },
    })
}

export async function getUsedFeatures(
  db: DB,
  organizationId: string,
): Promise<FeatureKey[]> {
  const rows = await db
    .select({ featureKey: featureUsage.featureKey })
    .from(featureUsage)
    .where(eq(featureUsage.organizationId, organizationId))
  return rows
    .map((row) => row.featureKey)
    .filter((key): key is FeatureKey => ALL_FEATURE_KEYS.has(key))
}
