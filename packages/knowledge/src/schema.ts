export const knowledgeDomains = ['marketing', 'app', 'commercial', 'support', 'legalTrust'] as const
export const knowledgeConsumers = [
  'marketing-page',
  'app-help',
  'marketing-ai-sdr',
  'app-ai-support',
  'marketing-infra',
  'public-schema',
  'transactional-email',
  'marketing-email',
  'lead-magnet',
  'public-pdf',
] as const
export const knowledgeSafetyLabels = ['public-safe', 'no-phi', 'legal-summary', 'commercial', 'mutable-claim'] as const
export const freshnessCadences = ['monthly', 'quarterly', 'semiannual', 'annual', 'event-driven'] as const
export const knowledgeBundles = ['marketing', 'app', 'public', 'emails', 'marketing-infra', 'all'] as const
export const knowledgeDocumentDomains = [...knowledgeDomains, 'mixed', 'all'] as const

export type KnowledgeDomain = (typeof knowledgeDomains)[number]
export type KnowledgeConsumer = (typeof knowledgeConsumers)[number]
export type KnowledgeSafetyLabel = (typeof knowledgeSafetyLabels)[number]
export type FreshnessCadence = (typeof freshnessCadences)[number]
export type KnowledgeBundle = (typeof knowledgeBundles)[number]
export type KnowledgeDocumentDomain = (typeof knowledgeDocumentDomains)[number]

export type KnowledgeItem = {
  id: string
  domain: KnowledgeDomain
  title: string
  summary: string
  body: string
  tags: string[]
  audience: string[]
  source: {
    module: string
    kind: 'canonical' | 'derived' | 'summary'
    verifiedAt?: string
  }
  freshness: {
    reviewedAt: string
    reviewCadence: FreshnessCadence
  }
  safetyLabels: KnowledgeSafetyLabel[]
  relatedIds: string[]
  allowedConsumers: KnowledgeConsumer[]
}

export const publicKnowledgeConsumers = {
  'marketing-page': 'marketing',
  'app-help': 'authenticated-help',
  'marketing-ai-sdr': 'marketing-assistant',
  'app-ai-support': 'authenticated-support',
  'marketing-infra': 'public-marketing-artifacts',
  'public-schema': 'public-schema',
  'transactional-email': 'transactional-email',
  'marketing-email': 'marketing-email',
  'lead-magnet': 'lead-magnet',
  'public-pdf': 'public-pdf',
} as const satisfies Record<KnowledgeConsumer, string>

export const publicKnowledgeBundles = {
  marketing: 'marketing',
  app: 'authenticated-app',
  public: 'public',
  emails: 'emails',
  'marketing-infra': 'public-marketing-artifacts',
  all: 'all',
} as const satisfies Record<KnowledgeBundle, string>

export type PublicKnowledgeConsumer = (typeof publicKnowledgeConsumers)[KnowledgeConsumer]

export type AiKnowledgeItem = Omit<KnowledgeItem, 'source' | 'allowedConsumers'> & {
  source: {
    kind: KnowledgeItem['source']['kind']
    verifiedAt?: string
  }
  consumers: PublicKnowledgeConsumer[]
}

export type AiKnowledgeDocument = {
  generatedAt: 'static'
  domain: KnowledgeDocumentDomain
  bundle?: string
  items: AiKnowledgeItem[]
}

export function validateKnowledgeItems(items: readonly KnowledgeItem[]) {
  const errors: string[] = []
  const ids = new Set<string>()

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`${item.id}: duplicate id`)
    ids.add(item.id)

    if (!knowledgeDomains.includes(item.domain)) errors.push(`${item.id}: unknown domain`)
    if (item.allowedConsumers.length === 0) errors.push(`${item.id}: missing allowed consumers`)
    if (!item.safetyLabels.includes('public-safe')) errors.push(`${item.id}: missing public-safe label`)
    if (!freshnessCadences.includes(item.freshness.reviewCadence)) errors.push(`${item.id}: unknown review cadence`)
    if (item.title.trim().length === 0) errors.push(`${item.id}: missing title`)
    if (item.summary.trim().length === 0) errors.push(`${item.id}: missing summary`)
    if (item.body.trim().length === 0) errors.push(`${item.id}: missing body`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.freshness.reviewedAt)) errors.push(`${item.id}: invalid reviewedAt`)
    if (item.source.verifiedAt && !/^\d{4}-\d{2}-\d{2}$/.test(item.source.verifiedAt)) {
      errors.push(`${item.id}: invalid verifiedAt`)
    }

    for (const consumer of item.allowedConsumers) {
      if (!knowledgeConsumers.includes(consumer)) errors.push(`${item.id}: unknown consumer ${consumer}`)
    }
  }

  for (const item of items) {
    for (const relatedId of item.relatedIds) {
      if (!ids.has(relatedId)) errors.push(`${item.id}: missing related item ${relatedId}`)
    }
  }

  return errors
}
