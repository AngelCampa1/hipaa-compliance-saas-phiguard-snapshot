import type { CollectionEntry } from 'astro:content'
import { contributorSlugs } from './contributors'

export const pillarMeta = {
  'hipaa-basics': {
    title: 'HIPAA Basics',
    shortTitle: 'HIPAA basics',
    description: 'Core definitions, rules, and operating concepts small clinics need before they can evaluate vendors or workflows.',
    href: '/learn/hipaa-basics',
    relatedResource: 'hipaa-new-hire-checklist',
    relatedCommercialPath: '/product/features/hipaa-task-management-audit-history',
    commercialLabel: 'HIPAA task and audit layer',
  },
  'phi-fundamentals': {
    title: 'PHI Fundamentals',
    shortTitle: 'PHI fundamentals',
    description: 'Core PHI and ePHI definitions, identifiers, edge cases, and data-classification concepts healthcare teams need before tool selection.',
    href: '/learn/phi-fundamentals',
    relatedResource: 'hipaa-compliance-self-assessment',
    relatedCommercialPath: '/hipaa',
    commercialLabel: 'PHI handling overview',
  },
  'phi-workflows': {
    title: 'PHI Workflows',
    shortTitle: 'PHI workflows',
    description: 'How PHI shows up in email, texting, spreadsheets, AI tools, intake forms, voicemail, and day-to-day coordination workflows.',
    href: '/learn/phi-workflows',
    relatedResource: 'vendor-baa-tracker',
    relatedCommercialPath: '/product/features/hipaa-task-management-audit-history',
    commercialLabel: 'PHI workflow product view',
  },
  'phi-tools-vendors': {
    title: 'PHI Tools and Vendors',
    shortTitle: 'PHI tools',
    description: 'How healthcare teams should evaluate general-purpose tools, BAAs, plan gating, and vendor controls before placing PHI-bearing workflows there.',
    href: '/learn/phi-tools-vendors',
    relatedResource: 'hipaa-pm-tool-comparison-guide',
    relatedCommercialPath: '/resources/guides',
    commercialLabel: 'PHI vendor guide library',
  },
  'risk-analysis': {
    title: 'Risk Analysis',
    shortTitle: 'Risk analysis',
    description: 'How small clinics run an annual HIPAA risk analysis, document findings, and turn them into an operating program.',
    href: '/learn/risk-analysis',
    relatedResource: 'hipaa-risk-analysis-template',
    relatedCommercialPath: '/resources/hipaa-risk-analysis-template',
    commercialLabel: 'Risk analysis template',
  },
  'incident-response': {
    title: 'Incident Response',
    shortTitle: 'Incident response',
    description: 'How to determine whether an incident is a reportable breach, document the analysis, and meet notification obligations.',
    href: '/learn/incident-response',
    relatedResource: 'incident-response-plan',
    relatedCommercialPath: '/product/features/hipaa-incident-response-history',
    commercialLabel: 'Incident workflow in product',
  },
  'vendor-management': {
    title: 'Vendor Management',
    shortTitle: 'Vendor management',
    description: 'BAAs, vendor due diligence, and the controls small clinics need when third parties touch PHI.',
    href: '/learn/vendor-management',
    relatedResource: 'vendor-baa-tracker',
    relatedCommercialPath: '/product/features/hipaa-policies-training-risk-vendor-baas',
    commercialLabel: 'Vendor and compliance program workflow',
  },
  'workforce-training': {
    title: 'Workforce Training',
    shortTitle: 'Workforce training',
    description: 'Training, onboarding, access reviews, and offboarding processes that make a clinic compliance program defensible.',
    href: '/learn/workforce-training',
    relatedResource: 'hipaa-new-hire-checklist',
    relatedCommercialPath: '/product/features/hipaa-policies-training-risk-vendor-baas',
    commercialLabel: 'Training and policy workflows',
  },
  'compliance-operations': {
    title: 'Compliance Operations',
    shortTitle: 'Compliance ops',
    description: 'Audit trails, access controls, policy acknowledgements, evidence handling, and vendor workflows for clinics that need defensible follow-through.',
    href: '/learn/compliance-operations',
    relatedResource: 'vendor-baa-tracker',
    relatedCommercialPath: '/product/features/hipaa-policies-training-risk-vendor-baas',
    commercialLabel: 'Operational compliance workflow',
  },
} as const

export type LearnEntry = CollectionEntry<'learn'>
export type LearnPillar = keyof typeof pillarMeta

const staticCommercialPaths = new Set([
  '/',
  '/baa',
  '/compare',
  '/hipaa',
  '/product',
  '/pricing',
  '/resources',
  '/security',
  '/trust',
])

const commercialPathPrefixes = ['/alternatives/', '/compare/', '/practice-types/', '/product/features/', '/resources/']

export function buildLearnPath(entry: Pick<LearnEntry, 'id'>): string {
  return buildLearnPathFromId(entry.id)
}

export function buildLearnPathFromId(id: string): string {
  const withoutExt = id.replace(/\.md$/, '')
  const normalized = withoutExt.replace(/\/index$/, '')
  return `/learn/${normalized}`
}

export function getPillarMeta(pillar: LearnPillar) {
  return pillarMeta[pillar]
}

export function isLearnHub(entry: LearnEntry): boolean {
  return entry.data.kind === 'hub'
}

export function isLearnArticle(entry: LearnEntry): boolean {
  return entry.data.kind === 'article'
}

export function getPillarArticles(entries: LearnEntry[], pillar: LearnPillar): LearnEntry[] {
  return entries
    .filter((entry) => entry.data.pillar === pillar && isLearnArticle(entry))
    .sort((a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime())
}

export function formatIntentLabel(intent: LearnEntry['data']['intent']): string {
  if (intent === 'awareness') return 'Awareness'
  if (intent === 'consideration') return 'Consideration'
  return 'Decision'
}

function isValidCommercialPath(path: string): boolean {
  const normalizedPath = path.split('#')[0]

  return staticCommercialPaths.has(normalizedPath) || commercialPathPrefixes.some((prefix) => normalizedPath.startsWith(prefix))
}

export function assertLearnIntegrity(
  entries: LearnEntry[],
  resources: CollectionEntry<'resources'>[],
) {
  const resourceSlugs = new Set(resources.map((resource) => resource.data.magnetSlug))

  for (const [pillar, meta] of Object.entries(pillarMeta) as [LearnPillar, (typeof pillarMeta)[LearnPillar]][]) {
    if (!resourceSlugs.has(meta.relatedResource)) {
      throw new Error(`Unknown relatedResource "${meta.relatedResource}" configured for pillar "${pillar}"`)
    }

    if (!isValidCommercialPath(meta.relatedCommercialPath)) {
      throw new Error(
        `Invalid relatedCommercialPath "${meta.relatedCommercialPath}" configured for pillar "${pillar}"`,
      )
    }
  }

  for (const entry of entries) {
    if (!contributorSlugs.has(entry.data.author)) {
      throw new Error(`Unknown author "${entry.data.author}" referenced by learn entry "${entry.id}"`)
    }

    if (!contributorSlugs.has(entry.data.reviewer)) {
      throw new Error(`Unknown reviewer "${entry.data.reviewer}" referenced by learn entry "${entry.id}"`)
    }

    if (entry.data.relatedResource && !resourceSlugs.has(entry.data.relatedResource)) {
      throw new Error(`Unknown relatedResource "${entry.data.relatedResource}" referenced by learn entry "${entry.id}"`)
    }

    if (entry.data.relatedCommercialPath && !isValidCommercialPath(entry.data.relatedCommercialPath)) {
      throw new Error(
        `Invalid relatedCommercialPath "${entry.data.relatedCommercialPath}" referenced by learn entry "${entry.id}"`,
      )
    }

    if (entry.data.schemaType === 'defined-term' && !entry.data.term) {
      throw new Error(`Learn entry "${entry.id}" declares schemaType "defined-term" but has no term`)
    }

    if (entry.data.schemaType === 'how-to' && (!entry.data.howToSteps || entry.data.howToSteps.length === 0)) {
      throw new Error(`Learn entry "${entry.id}" declares schemaType "how-to" but has no howToSteps`)
    }
  }
}
