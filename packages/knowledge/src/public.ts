import {
  PHIGUARD_APP_ORIGIN,
  PHIGUARD_PRODUCT_NAME,
  PHIGUARD_PUBLIC_SITE_ORIGIN,
  PHIGUARD_SIGNUP_URL,
} from '@phiguard/brand/identity'

export const publicSiteFacts = {
  productName: PHIGUARD_PRODUCT_NAME,
  publicOrigin: PHIGUARD_PUBLIC_SITE_ORIGIN,
  appOrigin: PHIGUARD_APP_ORIGIN,
  signupUrl: PHIGUARD_SIGNUP_URL,
  shortDescription:
    'PHIGuard is a HIPAA-native task management and compliance platform for healthcare teams handling PHI.',
  whatItIs: [
    'HIPAA-native task management software for healthcare teams',
    'Built for PHI-bearing coordination, auditability, incidents, evidence, and compliance operations',
    'BAA included on every plan',
  ],
  notes: [
    'PHIGuard is positioned as a HIPAA-native task management and compliance platform for healthcare teams.',
    'Source-backed educational pages include author, reviewer, updated date, and source lists.',
    `Pricing is also available in machine-readable form at ${PHIGUARD_PUBLIC_SITE_ORIGIN}/pricing.txt`,
  ],
} as const

export const publicUrls = {
  product: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/product`,
  pricing: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/pricing`,
  hipaa: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/hipaa`,
  baa: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/baa`,
  learn: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/learn`,
  resources: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/resources`,
  phiFundamentals: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/learn/phi-fundamentals`,
  whatCountsAsPhi: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/learn/hipaa-basics/what-is-phi`,
  phiWorkflows: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/learn/phi-workflows`,
  resourceGuides: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/resources/guides`,
  bestResources: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/resources/best`,
  compare: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/compare`,
  genericStackComparison: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/compare/phiguard-vs-generic-phi-workflow-stack`,
  bestPhiManagementSoftware: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/resources/best/best-phi-management-software`,
  bestSoftwareForHandlingPhi: `${PHIGUARD_PUBLIC_SITE_ORIGIN}/resources/best/best-software-for-handling-phi`,
} as const

export const publicPositioningCopy = {
  signupEyebrow: 'HIPAA-native compliance for small clinics',
  signupHeadlineLines: ['Compliance built in.', 'Per-clinic pricing.', 'BAA included.'],
  signupSummary:
    'You outgrew sticky notes. You never wanted Asana with a HIPAA bolt-on. PHIGuard is the task and compliance system for the gap in between.',
  signupBullets: [
    'Generic project tools skip what covered entities need: PHI handling, an audit trail, a signed BAA. With PHIGuard, you start with all three.',
    'Per-seat pricing punishes growth. PHIGuard charges per clinic, flat. Add staff without the bill creeping up every quarter.',
    'A signed BAA comes with every plan, including Essentials. No enterprise contract, no legal review queue.',
  ],
  signupStats: [
    { label: 'Setup', value: 'Guided' },
    { label: 'Pricing', value: 'Flat per clinic' },
    { label: 'BAA', value: 'Included' },
  ],
  seoDescription:
    'HIPAA-native task management and compliance operations for small clinics, with a BAA, audit trail, and flat per-clinic pricing.',
} as const
