import { ROUTE_HELP, HELP_TOPICS } from './app.js'
import { commercialKnowledgeCopy, commercialPageCopy } from './commercial.js'
import { emailPublicCopy, partnerProgramCopy, signupTrialEmailSteps } from './email.js'
import {
  legalTrustSummaries,
  publicSubprocessors,
  publicTrustFaqs,
  securityControlRows,
  securitySafeguards,
} from './legal-trust.js'
import { renderLlmsTxt, renderPricingTxt } from './marketing-infra.js'
import {
  comparisonRows,
  comparisonWinnerPositioning,
  productPillars,
  sitePrimaryCta,
  trustClaims,
} from './marketing.js'
import { publicPositioningCopy, publicSiteFacts, publicUrls } from './public.js'
import { SUPPORT_EMAIL, SUPPORT_PHI_WARNING } from './support.js'
import {
  knowledgeDomains,
  publicKnowledgeBundles,
  publicKnowledgeConsumers,
  validateKnowledgeItems,
  type AiKnowledgeDocument,
  type AiKnowledgeItem,
  type KnowledgeBundle,
  type KnowledgeDomain,
  type KnowledgeItem,
} from './schema.js'

export * from './schema.js'
export * from './app.js'
export * from './marketing.js'
export * from './commercial.js'
export * from './support.js'
export * from './legal-trust.js'
export * from './public.js'
export * from './email.js'
export * from './marketing-infra.js'

const reviewedAt = '2026-05-09'

function item(
  input: Omit<KnowledgeItem, 'freshness' | 'safetyLabels' | 'relatedIds'> & {
    safetyLabels?: KnowledgeItem['safetyLabels']
    relatedIds?: string[]
    reviewedAt?: string
    reviewCadence?: KnowledgeItem['freshness']['reviewCadence']
  },
): KnowledgeItem {
  return {
    ...input,
    freshness: {
      reviewedAt: input.reviewedAt ?? reviewedAt,
      reviewCadence: input.reviewCadence ?? 'quarterly',
    },
    safetyLabels: input.safetyLabels ?? ['public-safe', 'no-phi'],
    relatedIds: input.relatedIds ?? [],
  }
}

const marketingKnowledgeItems: KnowledgeItem[] = [
  item({
    id: 'marketing.positioning.core',
    domain: 'marketing',
    title: 'Core product positioning',
    summary:
      'PHIGuard is a HIPAA operations hub for small clinics and growing healthcare organizations.',
    body: [
      'Primary CTA:',
      `${sitePrimaryCta.label} (${sitePrimaryCta.href}).`,
      'Product pillars:',
      ...productPillars.map((pillar) => `${pillar.name}: ${pillar.summary}`),
    ].join('\n'),
    tags: ['positioning', 'product', 'homepage'],
    audience: ['clinic owners', 'practice administrators', 'compliance leads'],
    source: { module: '@phiguard/knowledge/marketing', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr'],
  }),
  item({
    id: 'marketing.trust.claims',
    domain: 'marketing',
    title: 'Public trust claims',
    summary:
      'Reusable public trust claims for BAA coverage, audit history, pricing, and conservative security posture.',
    body: trustClaims.map((claim) => `${claim.title}: ${claim.body}`).join('\n'),
    tags: ['trust', 'baa', 'audit', 'pricing'],
    audience: ['evaluators', 'clinic buyers'],
    source: { module: '@phiguard/knowledge/marketing', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr'],
  }),
  item({
    id: 'marketing.comparison.generic-tools',
    domain: 'marketing',
    title: 'Generic tool comparison',
    summary: comparisonWinnerPositioning.summary,
    body: [
      comparisonWinnerPositioning.headline,
      comparisonWinnerPositioning.caveat,
      ...comparisonRows.map((row) => `${row.requirement}: ${row.phiguard} vs ${row.generic}`),
    ].join('\n'),
    tags: ['comparison', 'alternatives', 'generic-tools'],
    audience: ['clinic buyers', 'marketing'],
    source: { module: '@phiguard/knowledge/marketing', kind: 'canonical', verifiedAt: reviewedAt },
    safetyLabels: ['public-safe', 'no-phi', 'mutable-claim'],
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr'],
  }),
]

const appKnowledgeItems: KnowledgeItem[] = [
  item({
    id: 'app.help.topics',
    domain: 'app',
    title: 'Authenticated help topics',
    summary: 'Help Center topics, categories, steps, and route guidance for app users.',
    body: HELP_TOPICS.map((topic) => `${topic.title}: ${topic.summary}`).join('\n'),
    tags: ['help', 'app', 'guidance'],
    audience: ['authenticated users', 'clinic staff'],
    source: { module: '@phiguard/knowledge/app', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['app-help', 'app-ai-support'],
  }),
  item({
    id: 'app.route.guidance',
    domain: 'app',
    title: 'Route-level contextual help',
    summary: 'Route help panels, warnings, and tooltips shown inside authenticated PHIGuard.',
    body: Object.entries(ROUTE_HELP)
      .filter(([route]) => !route.startsWith('/app/admin') && route !== '/app/soc2')
      .map(([, help]) => `${help.title}: ${help.summary}`)
      .join('\n'),
    tags: ['routes', 'tooltips', 'warnings'],
    audience: ['authenticated users', 'customer support'],
    source: { module: '@phiguard/knowledge/app', kind: 'canonical', verifiedAt: reviewedAt },
    relatedIds: ['app.help.topics'],
    allowedConsumers: ['app-help', 'app-ai-support'],
  }),
]

const commercialKnowledgeItems: KnowledgeItem[] = [
  item({
    id: 'commercial.plans.display',
    domain: 'commercial',
    title: 'Plan display copy',
    summary: 'Public pricing display copy derived from the canonical billing plan source.',
    body: [
      commercialKnowledgeCopy.pricingModel,
      commercialKnowledgeCopy.baaIncluded,
      commercialKnowledgeCopy.trial,
      commercialKnowledgeCopy.trialFeature,
      commercialKnowledgeCopy.promotion,
      commercialKnowledgeCopy.guarantee,
    ].join('\n'),
    tags: ['pricing', 'plans', 'promotion'],
    audience: ['buyers', 'sales', 'support'],
    source: { module: '@phiguard/billing', kind: 'derived', verifiedAt: reviewedAt },
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'app-ai-support'],
  }),
  item({
    id: 'commercial.marketing.page-copy',
    domain: 'commercial',
    title: 'Reusable public pricing and trial copy',
    summary:
      'Canonical marketing page copy for public pricing, trial, no-card, BAA, and audit posture claims.',
    body: [
      commercialPageCopy.hero.headline,
      commercialPageCopy.hero.subheadline,
      commercialPageCopy.pricingTable.body,
      ...commercialPageCopy.pricingPage.faqs.map((faq) => `${faq.question}: ${faq.answer}`),
    ].join('\n'),
    tags: ['pricing', 'trial', 'baa', 'audit', 'marketing-page'],
    audience: ['buyers', 'clinic administrators', 'marketing'],
    source: { module: '@phiguard/knowledge/commercial', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'app-ai-support'],
  }),
]

const supportKnowledgeItems: KnowledgeItem[] = [
  item({
    id: 'support.contact.no-phi',
    domain: 'support',
    title: 'Support contact and no-PHI warning',
    summary: `Use ${SUPPORT_EMAIL} for support handoff and do not send PHI by email.`,
    body: `${SUPPORT_PHI_WARNING}\nContact: ${SUPPORT_EMAIL}`,
    tags: ['support', 'no-phi', 'handoff'],
    audience: ['authenticated users', 'marketing visitors', 'support'],
    source: { module: '@phiguard/knowledge/support', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['app-help', 'app-ai-support', 'marketing-ai-sdr'],
  }),
]

const publicKnowledgeItems: KnowledgeItem[] = [
  item({
    id: 'public.site.facts',
    domain: 'marketing',
    title: 'Public site facts',
    summary: publicSiteFacts.shortDescription,
    body: [
      ...publicSiteFacts.whatItIs,
      ...Object.entries(publicUrls).map(([key, url]) => `${key}: ${url}`),
    ].join('\n'),
    tags: ['public', 'site', 'urls', 'positioning'],
    audience: ['buyers', 'marketing', 'ai crawlers'],
    source: { module: '@phiguard/knowledge/public', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'marketing-infra', 'public-schema'],
  }),
  item({
    id: 'public.signup.positioning',
    domain: 'marketing',
    title: 'Public signup positioning',
    summary: publicPositioningCopy.signupSummary,
    body: [
      publicPositioningCopy.signupEyebrow,
      ...publicPositioningCopy.signupHeadlineLines,
      publicPositioningCopy.signupSummary,
      ...publicPositioningCopy.signupBullets,
    ].join('\n'),
    tags: ['signup', 'positioning', 'trial'],
    audience: ['trial users', 'buyers'],
    source: { module: '@phiguard/knowledge/public', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'public-schema'],
  }),
]

const emailKnowledgeItems: KnowledgeItem[] = [
  item({
    id: 'email.transactional.public-copy',
    domain: 'support',
    title: 'Transactional email public copy',
    summary:
      'Public-safe copy for signup, trial, lead-magnet, unsubscribe, and footer email surfaces.',
    body: [
      emailPublicCopy.signupConfirmation.body,
      `${emailPublicCopy.trialStarted.noCardContinuation} the trial ends.`,
      emailPublicCopy.leadMagnet.productPitch,
      emailPublicCopy.footerReasons.accountCreated,
      emailPublicCopy.footerReasons.trialAccount,
      emailPublicCopy.footerReasons.leadMagnet,
      `${emailPublicCopy.footerReasons.leadMagnetWithTitlePrefix} a PHIGuard resource.`,
      emailPublicCopy.footerReasons.newsletter,
      emailPublicCopy.footerReasons.nurture,
    ].join('\n'),
    tags: ['email', 'transactional', 'support', 'trial'],
    audience: ['trial users', 'resource subscribers'],
    source: { module: '@phiguard/knowledge/email', kind: 'canonical', verifiedAt: reviewedAt },
    allowedConsumers: ['transactional-email', 'marketing-email', 'app-ai-support'],
  }),
  item({
    id: 'email.signup-trial.sequence',
    domain: 'commercial',
    title: 'Signup trial nurture sequence',
    summary: 'Public-safe signup trial nurture subjects, preview text, body copy, and CTA labels.',
    body: signupTrialEmailSteps.map((step) => `${step.subject}: ${step.body}`).join('\n'),
    tags: ['email', 'trial', 'nurture', 'billing'],
    audience: ['trial users'],
    source: { module: '@phiguard/knowledge/email', kind: 'canonical', verifiedAt: reviewedAt },
    safetyLabels: ['public-safe', 'no-phi', 'commercial'],
    allowedConsumers: ['transactional-email', 'marketing-email', 'app-ai-support'],
  }),
  item({
    id: 'email.partner.program',
    domain: 'commercial',
    title: 'Partner program email copy',
    summary: partnerProgramCopy.receivedBody,
    body: [
      partnerProgramCopy.pageTitle,
      partnerProgramCopy.preview,
      partnerProgramCopy.applicationReceivedHeading,
      partnerProgramCopy.receivedHeading,
      `${partnerProgramCopy.greetingPrefix},`,
      partnerProgramCopy.thankYou,
      `${partnerProgramCopy.applicationForPrefix} a PHIGuard partner relationship.`,
      partnerProgramCopy.applicationForSuffix,
      partnerProgramCopy.receivedBody,
      partnerProgramCopy.reviewTiming,
      `${partnerProgramCopy.supportQuestion} the PHIGuard support address.`,
    ].join('\n'),
    tags: ['email', 'partners', 'commercial'],
    audience: ['partners', 'marketing'],
    source: { module: '@phiguard/knowledge/email', kind: 'canonical', verifiedAt: reviewedAt },
    safetyLabels: ['public-safe', 'no-phi', 'commercial'],
    allowedConsumers: ['transactional-email', 'marketing-email', 'marketing-page'],
  }),
]

const legalTrustKnowledgeItems: KnowledgeItem[] = Object.entries(legalTrustSummaries).map(
  ([key, summary]) =>
    item({
      id: `legalTrust.${key}`,
      domain: 'legalTrust',
      title: summary.title,
      summary: summary.summary,
      body: `${summary.summary}\n${summary.caveat}`,
      tags: ['legal', 'trust', key],
      audience: ['buyers', 'clinic admins', 'support'],
      source: {
        module: '@phiguard/knowledge/legal-trust',
        kind: 'summary',
        verifiedAt: reviewedAt,
      },
      safetyLabels: ['public-safe', 'no-phi', 'legal-summary'],
      allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'app-ai-support'],
    }),
)

legalTrustKnowledgeItems.push(
  item({
    id: 'legalTrust.public.faqs',
    domain: 'legalTrust',
    title: 'Public legal and trust FAQs',
    summary: 'Reusable public FAQ answers for BAA coverage and audit-trail claims.',
    body: publicTrustFaqs.map((faq) => `${faq.question}: ${faq.answer}`).join('\n'),
    tags: ['faq', 'baa', 'audit', 'legal'],
    audience: ['buyers', 'clinic administrators'],
    source: {
      module: '@phiguard/knowledge/legal-trust',
      kind: 'canonical',
      verifiedAt: reviewedAt,
    },
    safetyLabels: ['public-safe', 'no-phi', 'legal-summary'],
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr'],
  }),
  item({
    id: 'legalTrust.security.public',
    domain: 'legalTrust',
    title: 'Public security posture',
    summary:
      'Public-safe security page claims for safeguards, telemetry boundaries, audit controls, and encryption posture.',
    body: [
      ...securitySafeguards.map((safeguard) => `${safeguard.title}: ${safeguard.body}`),
      ...securityControlRows.map((row) => `${row.area}: ${row.description}`),
    ].join('\n'),
    tags: ['security', 'trust', 'technical-safeguards'],
    audience: ['buyers', 'privacy officers', 'security reviewers'],
    source: {
      module: '@phiguard/knowledge/legal-trust',
      kind: 'canonical',
      verifiedAt: reviewedAt,
    },
    safetyLabels: ['public-safe', 'no-phi', 'legal-summary'],
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'app-ai-support'],
  }),
  item({
    id: 'legalTrust.subprocessors.public',
    domain: 'legalTrust',
    title: 'Public subprocessor inventory',
    summary:
      'Public inventory of providers and service-provider boundaries disclosed on the subprocessor page.',
    body: publicSubprocessors
      .map((vendor) => `${vendor.name}: ${vendor.purpose}; ${vendor.data}; ${vendor.status}`)
      .join('\n'),
    tags: ['subprocessors', 'vendors', 'trust'],
    audience: ['buyers', 'privacy officers', 'security reviewers'],
    source: {
      module: '@phiguard/knowledge/legal-trust',
      kind: 'canonical',
      verifiedAt: reviewedAt,
    },
    safetyLabels: ['public-safe', 'no-phi', 'mutable-claim'],
    allowedConsumers: ['marketing-page', 'marketing-ai-sdr', 'app-ai-support'],
  }),
)

export const allKnowledgeItems = [
  ...marketingKnowledgeItems,
  ...appKnowledgeItems,
  ...commercialKnowledgeItems,
  ...supportKnowledgeItems,
  ...publicKnowledgeItems,
  ...emailKnowledgeItems,
  ...legalTrustKnowledgeItems,
] as const satisfies readonly KnowledgeItem[]

export { knowledgeDomains, validateKnowledgeItems }

export function getKnowledgeItem(id: string) {
  return allKnowledgeItems.find((candidate) => candidate.id === id)
}

function hasAnyConsumer(item: KnowledgeItem, consumers: readonly string[]) {
  return item.allowedConsumers.some((consumer) => consumers.includes(consumer))
}

function documentDomainFor(items: readonly KnowledgeItem[]) {
  const domains = new Set(items.map((item) => item.domain))
  return domains.size === 1 ? (items[0]?.domain ?? 'mixed') : 'mixed'
}

function isMarketingAiItem(item: KnowledgeItem) {
  return (
    item.allowedConsumers.includes('marketing-ai-sdr') ||
    item.allowedConsumers.includes('marketing-page')
  )
}

function isAppAiItem(item: KnowledgeItem) {
  return (
    item.allowedConsumers.includes('app-ai-support') || item.allowedConsumers.includes('app-help')
  )
}

function toAiKnowledgeItem(item: KnowledgeItem): AiKnowledgeItem {
  return {
    id: item.id,
    domain: item.domain,
    title: item.title,
    summary: item.summary,
    body: item.body,
    tags: item.tags,
    audience: item.audience,
    source: {
      kind: item.source.kind,
      ...(item.source.verifiedAt ? { verifiedAt: item.source.verifiedAt } : {}),
    },
    freshness: item.freshness,
    safetyLabels: item.safetyLabels,
    relatedIds: item.relatedIds,
    consumers: item.allowedConsumers.map((consumer) => publicKnowledgeConsumers[consumer]),
  }
}

export function generateAiKnowledge(domain: KnowledgeDomain | 'all'): AiKnowledgeDocument {
  const items =
    domain === 'all'
      ? [...allKnowledgeItems]
      : domain === 'marketing'
        ? allKnowledgeItems.filter(isMarketingAiItem)
        : domain === 'app'
          ? allKnowledgeItems.filter(isAppAiItem)
          : allKnowledgeItems.filter((candidate) => candidate.domain === domain)

  return {
    generatedAt: 'static',
    domain,
    items: items.map(toAiKnowledgeItem),
  }
}

export function generateKnowledgeBundle(bundle: KnowledgeBundle): AiKnowledgeDocument {
  const sourceItems =
    bundle === 'all'
      ? [...allKnowledgeItems]
      : bundle === 'marketing'
        ? allKnowledgeItems.filter(isMarketingAiItem)
        : bundle === 'app'
          ? allKnowledgeItems.filter(isAppAiItem)
          : bundle === 'public'
            ? allKnowledgeItems.filter((item) =>
                hasAnyConsumer(item, ['marketing-page', 'public-schema', 'marketing-infra']),
              )
            : bundle === 'emails'
              ? allKnowledgeItems.filter((item) =>
                  hasAnyConsumer(item, ['transactional-email', 'marketing-email']),
                )
              : allKnowledgeItems.filter((item) =>
                  item.allowedConsumers.includes('marketing-infra'),
                )

  return {
    generatedAt: 'static',
    domain: bundle === 'all' ? 'all' : documentDomainFor(sourceItems),
    bundle: publicKnowledgeBundles[bundle],
    items: sourceItems.map(toAiKnowledgeItem),
  }
}

export function renderKnowledgeTextArtifact(name: 'llms.txt' | 'pricing.txt') {
  return name === 'llms.txt' ? renderLlmsTxt() : renderPricingTxt()
}
