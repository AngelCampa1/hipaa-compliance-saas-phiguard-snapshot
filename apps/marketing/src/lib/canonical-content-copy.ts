import { commercialKnowledgeCopy } from '@phiguard/knowledge/commercial'

export const canonicalContentTokens = {
  pricingDetails:
    `${commercialKnowledgeCopy.pricingModel} ${commercialKnowledgeCopy.baaIncluded} ` +
    'See current PHIGuard pricing for plan names, monthly list prices, annual totals, and launch details.',
} as const

export function resolveCanonicalContentCopy(value: string): string {
  return value.replace(/\{\{PHIGUARD_PRICING_DETAILS\}\}/g, canonicalContentTokens.pricingDetails)
}
