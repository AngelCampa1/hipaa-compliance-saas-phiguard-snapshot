import { customPricingPath, limitedOfferCommercialCopy, marketingPlans, productPillars } from './marketing.js'
import { commercialKnowledgeCopy } from './commercial.js'
import { publicSiteFacts, publicUrls } from './public.js'

function formatUsd(amount: number) {
  return `$${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`
}

function formatOfferSummary(message: string) {
  return message
    .replace(/^Limited offer:\s*Get\s*/i, '')
    .replace(/\.\s*Auto-applied at checkout\.$/, '')
}

export function renderLlmsTxt() {
  return [
    '# PHIGuard',
    '',
    publicSiteFacts.shortDescription,
    '',
    '## What PHIGuard is',
    '',
    ...publicSiteFacts.whatItIs.map((item) => `- ${item}`),
    '',
    '## Best starting pages',
    '',
    `- Product: ${publicUrls.product}`,
    `- Feature pages: ${publicUrls.product}/features`,
    ...productPillars.map(
      (feature) => `- ${feature.shortName}: ${publicUrls.product}/features/${feature.slug}`,
    ),
    `- Pricing: ${publicUrls.pricing}`,
    `- HIPAA overview: ${publicUrls.hipaa}`,
    `- Learn hub: ${publicUrls.learn}`,
    `- PHI fundamentals: ${publicUrls.phiFundamentals}`,
    `- What counts as PHI: ${publicUrls.whatCountsAsPhi}`,
    `- PHI workflows: ${publicUrls.phiWorkflows}`,
    `- PHI vendor guides: ${publicUrls.resourceGuides}`,
    `- Best PHI software pages: ${publicUrls.bestResources}`,
    '',
    '## Commercial decision pages',
    '',
    `- Compare hub: ${publicUrls.compare}`,
    `- PHIGuard vs generic PHI workflow stack: ${publicUrls.genericStackComparison}`,
    `- Best PHI management software: ${publicUrls.bestPhiManagementSoftware}`,
    `- Best software for handling PHI: ${publicUrls.bestSoftwareForHandlingPhi}`,
    '',
    '## Notes',
    '',
    ...publicSiteFacts.notes.map((item) => `- ${item}`),
    '',
  ].join('\n')
}

export function renderPricingTxt() {
  return [
    '# PHIGuard Pricing',
    '',
    'Annual billing is the default public pricing display. Monthly billing remains selectable where shown.',
    '',
    ...marketingPlans.flatMap((plan) => [
      `## ${plan.name}`,
      `- Annual price after limited first-year offer: ${formatUsd(plan.priceAnnualAmount)}/year per clinic (${formatUsd(plan.priceAnnualMonthlyAmount)}/month equivalent, paid upfront annually)`,
      `- Annual list price: ${formatUsd(plan.priceAnnualListAmount)}/year per clinic (${formatUsd(plan.priceAnnualMonthlyListAmount)}/month equivalent, paid upfront annually)`,
      `- Monthly price after limited first-year offer: ${formatUsd(plan.priceMonthlyAmount)}/month per clinic, paid monthly`,
      `- Monthly list price: ${formatUsd(plan.priceMonthlyListAmount)}/month per clinic, paid monthly`,
      `- Best fit: ${plan.fit}`,
      `- Included baseline: ${plan.capabilities.join(', ')}`,
      `- User limit: Up to ${plan.maxMembers} staff`,
      '',
    ]),
    '## Custom path',
    `- ${customPricingPath.summary}`,
    `- ${customPricingPath.detail}`,
    '',
    '## Limited offer',
    `- Offer: ${formatOfferSummary(limitedOfferCommercialCopy.promoBannerMessage)}`,
    '- Annual billing detail: annual subscriptions get the discount once',
    '- Monthly billing detail: monthly subscriptions get it for 12 paid months',
    `- Checkout behavior: ${limitedOfferCommercialCopy.promoAutoApplyLabel}`,
    '- Availability: Limited time offer',
    '',
    '## Guarantee',
    `- ${limitedOfferCommercialCopy.guarantee}`,
    '',
    '## Trial',
    `- Free trial: ${commercialKnowledgeCopy.trialDays} days`,
    '- Credit card required: No',
    '',
    '## Shared pricing notes',
    `- BAA included: Yes - ${commercialKnowledgeCopy.baaIncluded}`,
    `- Pricing model: ${commercialKnowledgeCopy.pricingModel}`,
    `- Canonical pricing page: ${publicUrls.pricing}`,
    '',
  ].join('\n')
}
