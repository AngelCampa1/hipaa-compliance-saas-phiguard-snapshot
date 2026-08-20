import { defineCollection, z } from 'astro:content'

const authorFields = {
  author: z.string(),
  reviewer: z.string(),
}

const sourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string().optional(),
})

const faqSchema = z.array(z.object({ q: z.string(), a: z.string() })).optional()
const howToStepSchema = z.object({
  name: z.string(),
  text: z.string(),
})
const verificationDateField = {
  verificationDate: z.coerce.date().optional(),
}

const commercialEditorialFields = {
  seoTitle: z.string().max(60).optional(),
  description: z.string(),
  metaDescription: z.string().max(160),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()).min(3).max(5),
  sources: z.array(sourceSchema).min(1),
  faq: faqSchema,
  relatedResource: z.string().optional(),
  relatedCommercialPath: z.string().optional(),
  relatedLearnPath: z.string().optional(),
  legacyPaths: z.array(z.string()).optional(),
  ...authorFields,
  ...verificationDateField,
}

const learn = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(60).optional(),
    description: z.string(),
    metaDescription: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    kind: z.enum(['hub', 'article']),
    pillar: z.enum([
      'hipaa-basics',
      'phi-fundamentals',
      'phi-workflows',
      'phi-tools-vendors',
      'risk-analysis',
      'incident-response',
      'vendor-management',
      'workforce-training',
      'compliance-operations',
    ]),
    schemaType: z.enum(['article', 'defined-term', 'how-to']).optional(),
    term: z.string().optional(),
    howToSteps: z.array(howToStepSchema).optional(),
    intent: z.enum(['awareness', 'consideration', 'decision']),
    summary: z.string(),
    keyTakeaways: z.array(z.string()).min(3).max(5),
    ...authorFields,
    relatedResource: z.string().optional(),
    relatedCommercialPath: z.string().optional(),
    legacyPaths: z.array(z.string()).optional(),
    sources: z.array(sourceSchema).min(1),
    faq: faqSchema,
  }),
})

const alternatives = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    competitor: z.string(),
    slug: z.string().optional(),
    seoTitle: z.string().max(60).optional(),
    description: z.string(),
    legacyPaths: z.array(z.string()).optional(),
    metaDescription: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    summary: z.string(),
    sources: z.array(sourceSchema).min(1),
    faq: faqSchema,
    relatedResource: z.string().optional(),
    relatedCommercialPath: z.string().optional(),
    relatedLearnPath: z.string().optional(),
    ...authorFields,
    ...verificationDateField,
  }),
})

const comparisons = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(60).optional(),
    description: z.string(),
    legacyPaths: z.array(z.string()).optional(),
    metaDescription: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    summary: z.string(),
    sources: z.array(sourceSchema).min(1),
    faq: faqSchema,
    competitors: z.array(z.string()).optional(),
    relatedResource: z.string().optional(),
    relatedCommercialPath: z.string().optional(),
    relatedLearnPath: z.string().optional(),
    ...authorFields,
    ...verificationDateField,
  }),
})

const practiceTypesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    practiceType: z.string(),
    seoTitle: z.string().max(60).optional(),
    description: z.string(),
    legacyPaths: z.array(z.string()).optional(),
    metaDescription: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    summary: z.string(),
    sources: z.array(sourceSchema).min(1),
    faq: faqSchema,
    relatedResource: z.string().optional(),
    relatedCommercialPath: z.string().optional(),
    relatedLearnPath: z.string().optional(),
    ...authorFields,
    ...verificationDateField,
  }),
})

const personasCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    persona: z.string(),
    role: z.string(),
    seoTitle: z.string().max(60).optional(),
    description: z.string(),
    legacyPaths: z.array(z.string()).optional(),
    metaDescription: z.string().max(160),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    summary: z.string(),
    keyTakeaways: z.array(z.string()).min(3).max(5),
    sources: z.array(sourceSchema).min(1),
    faq: faqSchema,
    relatedResource: z.string().optional(),
    relatedCommercialPath: z.string().optional(),
    relatedLearnPath: z.string().optional(),
    ...authorFields,
    ...verificationDateField,
  }),
})

const resources = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(60).optional(),
    headline: z.string(),
    description: z.string(),
    metaDescription: z.string().max(160),
    magnetSlug: z.string(),
    summary: z.string(),
    legacyPaths: z.array(z.string()).optional(),
    stage: z.enum(['awareness', 'consideration', 'decision']),
    sequenceStage: z.enum(['awareness', 'consideration', 'decision']),
    bullets: z.array(z.string()).min(3).max(6),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    sources: z.array(sourceSchema).min(1),
    relatedCommercialPath: z.string().optional(),
    relatedLearnPath: z.string().optional(),
    ...authorFields,
    ...verificationDateField,
  }),
})

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    vendor: z.string().optional(),
    ...commercialEditorialFields,
    verificationDate: z.coerce.date(),
  }),
})

const best = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    rankedItems: z.array(z.object({
      name: z.string(),
      description: z.string(),
      url: z.string().optional(),
    })).optional(),
    ...commercialEditorialFields,
    verificationDate: z.coerce.date(),
  }),
})

const hipaaSoftware = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    audience: z.string(),
    ...commercialEditorialFields,
  }),
})

const cityGuides = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(60),
    description: z.string(),
    metaDescription: z.string().max(160),
    city: z.string(),
    state: z.string(),
    stateAbbreviation: z.string(),
    primaryKeyword: z.string(),
    intent: z.enum(['consideration', 'decision']),
    summary: z.string(),
    keyTakeaways: z.array(z.string()).min(3).max(5),
    cityContext: z.string(),
    localOperationalNotes: z.array(z.string()).min(3).max(5),
    localRiskMap: z.array(z.string()).min(3).max(5),
    stateOverlay: z.string(),
    operatingPriorities: z.array(z.string()).min(3).max(6),
    evidenceCadence: z.array(z.string()).min(3).max(6),
    softwareBuyingCriteria: z.array(z.string()).min(3).max(5),
    checklist: z.array(z.string()).min(5).max(8),
    sources: z.array(sourceSchema).min(3),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(5),
    relatedLearnPath: z.string(),
    relatedResource: z.string(),
    nearbyCitySlugs: z.array(z.string()).min(0).max(6),
    selectionEvidence: z.object({
      model: z.string(),
      keywordSet: z.array(z.string()).min(4).max(6),
      priorityTier: z.string(),
      validationNote: z.string(),
    }),
    author: z.string(),
    reviewer: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    verificationDate: z.coerce.date(),
    selectionNote: z.string(),
  }),
})

const stateGuides = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(60),
    description: z.string(),
    metaDescription: z.string().max(160),
    summary: z.string(),
    slug: z.string(),
    state: z.string(),
    stateAbbreviation: z.string(),
    pageFamily: z.enum(['compliance-software', 'breach-notification']),
    primaryKeyword: z.string(),
    intent: z.enum(['consideration', 'decision', 'operational-research']),
    directAnswer: z.string(),
    stateContext: z.string(),
    operationalGuidance: z.array(z.string()).min(3).max(6),
    stateSpecificNotes: z.array(z.string()).min(3).max(5),
    keyTakeaways: z.array(z.string()).min(3).max(5),
    practicalChecklist: z.array(z.string()).min(5).max(8),
    sources: z.array(sourceSchema).min(3),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(5),
    internalLinks: z.array(z.object({
      href: z.string(),
      label: z.string(),
      description: z.string().optional(),
    })).min(6),
    relatedStateSlug: z.string().optional(),
    relatedCitySlugs: z.array(z.string()).min(0).max(4),
    author: z.string(),
    reviewer: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    verificationDate: z.coerce.date(),
  }),
})

export const collections = {
  learn,
  alternatives,
  comparisons,
  'practice-types': practiceTypesCollection,
  personas: personasCollection,
  resources,
  guides,
  best,
  'hipaa-software': hipaaSoftware,
  'city-guides': cityGuides,
  'state-guides': stateGuides,
}
