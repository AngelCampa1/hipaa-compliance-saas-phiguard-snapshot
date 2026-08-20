export type InternalLink = {
  label: string
  href: string
  description?: string
  eyebrow?: string
}

export type InternalLinkGroup = {
  title: string
  href?: string
  description?: string
  links: InternalLink[]
}

const trimMarkdownExtension = (id: string) => id.replace(/\.(md|mdx)$/, '')

export const internalPath = {
  home: '/',
  product: '/product',
  pricing: '/pricing',
  security: '/security',
  hipaa: '/hipaa',
  compare: '/compare',
  resources: '/resources',
  resourceTools: '/resources/tools',
  learn: '/learn',
  guides: '/resources/guides',
  best: '/resources/best',
  practiceTypes: '/practice-types',
  hipaaSoftware: '/hipaa-software',
  locations: '/locations/hipaa-compliance',
  stateComplianceSoftware: '/locations/hipaa-compliance-software',
  stateBreachNotification: '/locations/hipaa-breach-notification',
  glossary: '/glossary',
  contributors: '/contributors',
  partners: '/partners',
  about: '/about',
  trust: '/trust',
  baa: '/baa',
  privacy: '/privacy',
  terms: '/terms',
  subprocessors: '/subprocessors',
  noticeOfPrivacyPractices: '/notice-of-privacy-practices',
  alternative: (id: string) => `/alternatives/${trimMarkdownExtension(id)}`,
  comparison: (id: string) => `/compare/${trimMarkdownExtension(id)}`,
  guide: (id: string) => `/resources/guides/${trimMarkdownExtension(id)}`,
  bestPage: (id: string) => `/resources/best/${trimMarkdownExtension(id)}`,
  resource: (slug: string) => `/resources/${slug}`,
  practiceType: (id: string) => `/practice-types/${trimMarkdownExtension(id)}`,
  hipaaSoftwarePage: (id: string) => `/hipaa-software/${trimMarkdownExtension(id)}`,
  cityGuide: (id: string) => `/locations/hipaa-compliance/${trimMarkdownExtension(id)}`,
  stateComplianceSoftwarePage: (id: string) => `/locations/hipaa-compliance-software/${trimMarkdownExtension(id)}`,
  stateBreachNotificationPage: (id: string) => `/locations/hipaa-breach-notification/${trimMarkdownExtension(id)}`,
  learnPage: (id: string) => `/learn/${trimMarkdownExtension(id).replace(/\/index$/, '')}`,
} as const

export const utilityPagePaths = new Set(['/404', '/500', '/resources/thank-you', '/unsubscribe'])

export const primaryNavLinks: InternalLink[] = [
  { label: 'Product', href: internalPath.product },
  { label: 'Pricing', href: internalPath.pricing },
  { label: 'Security', href: internalPath.security },
  { label: 'HIPAA', href: internalPath.hipaa },
  { label: 'Compare', href: internalPath.compare },
  { label: 'Resources', href: internalPath.resources },
  { label: 'About', href: internalPath.about },
]

export const resourcesMegaMenuGroups: InternalLinkGroup[] = [
  {
    title: 'Learn',
    href: internalPath.learn,
    description: 'Plain-language PHI and HIPAA education.',
    links: [
      {
        label: 'Learning center',
        href: internalPath.learn,
        description: 'All educational hubs and explainers.',
      },
      {
        label: 'HIPAA Basics',
        href: internalPath.learnPage('hipaa-basics/index'),
        description: 'Definitions, rules, and core operating concepts.',
      },
      {
        label: 'PHI Fundamentals',
        href: internalPath.learnPage('phi-fundamentals/index'),
        description: 'Identifiers, edge cases, and data classification.',
      },
      {
        label: 'PHI Workflows',
        href: internalPath.learnPage('phi-workflows/index'),
        description: 'Email, texting, AI, intake, and daily workflows.',
      },
    ],
  },
  {
    title: 'Free Tools',
    href: internalPath.resourceTools,
    description: 'Downloadable templates and worksheets.',
    links: [
      {
        label: 'Resource library',
        href: internalPath.resources,
        description: 'Master hub for all resource clusters.',
      },
      {
        label: 'All free tools',
        href: internalPath.resourceTools,
        description: 'Templates, logs, checklists, and worksheets.',
      },
    ],
  },
  {
    title: 'Vendor Guides',
    href: internalPath.guides,
    description: 'HIPAA readiness by common software tool.',
    links: [
      {
        label: 'All vendor guides',
        href: internalPath.guides,
        description: 'Review BAA posture and plan gating.',
      },
      {
        label: 'PHI Tools and Vendors',
        href: internalPath.learnPage('phi-tools-vendors/index'),
        description: 'Educational hub for vendor evaluation.',
      },
    ],
  },
  {
    title: 'Best Software',
    href: internalPath.best,
    description: 'Shortlists for active software evaluation.',
    links: [
      {
        label: 'All best-of pages',
        href: internalPath.best,
        description: 'Browse commercial shortlist pages.',
      },
      {
        label: 'HIPAA software by use case',
        href: internalPath.hipaaSoftware,
        description: 'Clinic-type and workflow software pages.',
      },
      {
        label: 'HIPAA compliance by city',
        href: internalPath.locations,
        description: 'Clinic operations guides grouped by city and state.',
      },
      {
        label: 'HIPAA software by state',
        href: internalPath.stateComplianceSoftware,
        description: 'State-focused software evaluation pages for clinics.',
      },
    ],
  },
  {
    title: 'Compare & Fit',
    href: internalPath.compare,
    description: 'Move from research to buying decisions.',
    links: [
      {
        label: 'Compare hub',
        href: internalPath.compare,
        description: 'Alternatives, direct comparisons, and fit pages.',
      },
      {
        label: 'Alternatives',
        href: '/alternatives',
        description: 'Named replacement paths for generic tools.',
      },
      {
        label: 'HIPAA software by use case',
        href: internalPath.hipaaSoftware,
        description: 'Browse by clinic type and workflow.',
      },
      {
        label: 'HIPAA software by practice',
        href: internalPath.practiceTypes,
        description: 'Find specialty-specific workflow guidance.',
      },
      {
        label: 'Glossary',
        href: internalPath.glossary,
        description: 'Parse PHI and HIPAA terms quickly.',
      },
      {
        label: 'Breach notification by state',
        href: internalPath.stateBreachNotification,
        description: 'State-focused incident and notice workflow pages.',
      },
      {
        label: 'Contributors',
        href: internalPath.contributors,
        description: 'Review editorial authors and reviewers.',
      },
    ],
  },
]

export const footerLinkGroups: InternalLinkGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Product', href: internalPath.product },
      { label: 'Pricing', href: internalPath.pricing },
      { label: 'Security', href: internalPath.security },
      { label: 'HIPAA', href: internalPath.hipaa },
      { label: 'Compare', href: internalPath.compare },
      { label: 'Trust & Status', href: internalPath.trust },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resource Library', href: internalPath.resources },
      { label: 'Learning Center', href: internalPath.learn },
      { label: 'Vendor Guides', href: internalPath.guides },
      { label: 'Best HIPAA Software', href: internalPath.best },
      { label: 'Practice Types', href: internalPath.practiceTypes },
      { label: 'City Guides', href: internalPath.locations },
      { label: 'State Software Guides', href: internalPath.stateComplianceSoftware },
      { label: 'State Breach Guides', href: internalPath.stateBreachNotification },
      { label: 'Glossary', href: internalPath.glossary },
      { label: 'Contributors', href: internalPath.contributors },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: internalPath.about },
      { label: 'Partners', href: internalPath.partners },
      { label: 'Trust Center', href: internalPath.trust },
      { label: 'Security', href: internalPath.security },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: internalPath.privacy },
      { label: 'Terms of Service', href: internalPath.terms },
      { label: 'Business Associate Agreement', href: internalPath.baa },
      { label: 'Subprocessors', href: internalPath.subprocessors },
    ],
  },
]
