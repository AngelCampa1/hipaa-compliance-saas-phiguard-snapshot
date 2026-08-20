import { PHIGUARD_LEGAL_ENTITY, PHIGUARD_NOTICE_ADDRESS_LINES } from '@phiguard/brand/identity'

export const legalTrustSummaries = {
  baa: {
    title: 'Business Associate Agreement',
    summary: 'PHIGuard makes the BAA part of the standard signup, before you use any PHI features.',
    caveat: 'This is a public summary, not legal advice. It does not replace reading the signed agreement.',
  },
  terms: {
    title: 'Terms and legal acceptance',
    summary: 'Signing in and billing may require current Terms and BAA acceptance by someone allowed to act for your clinic.',
    caveat: 'Only accept legal documents if you have the authority to bind the clinic or organization.',
  },
  security: {
    title: 'Security and trust posture',
    summary: 'PHIGuard keeps security claims careful. We describe the controls we have today and do not claim certifications we have not finished.',
    caveat: 'We only claim a milestone once the evidence and review behind it are done.',
  },
} as const

export const legalNotice = {
  entity: PHIGUARD_LEGAL_ENTITY,
  addressLines: PHIGUARD_NOTICE_ADDRESS_LINES,
} as const

export const publicTrustFaqs = [
  {
    question: 'What is a Business Associate Agreement (BAA)?',
    answer:
      'A Business Associate Agreement is a legally required HIPAA contract between your clinic and any vendor that handles Protected Health Information for you. It sets out how the vendor may use PHI and the safeguards it must keep.',
  },
  {
    question: 'Do you sign BAAs on every pricing tier?',
    answer:
      'Yes. PHIGuard includes a signed Business Associate Agreement at every pricing tier. You do not have to negotiate an enterprise contract to get basic legal coverage.',
  },
  {
    question: 'Does PHIGuard create an audit trail for HIPAA compliance?',
    answer:
      'Yes. Every relevant task action is recorded in an immutable audit log, so your clinic has solid evidence for reviews, investigations, and recurring compliance work.',
  },
] as const

export const securityPageCopy = {
  heroHeading: 'Security claims tied back to product behavior.',
  heroSummary:
    'This page gives a plain view of the current security safeguards, with no marketing spin. It covers what controls exist and how they show up in the way the product works.',
  baselineLabel: 'Current public baseline',
  baselineRows: [
    { title: 'Managed encryption at rest', meta: 'Enabled' },
    { title: 'TLS in transit', meta: 'Enforced' },
    { title: 'Append-only audit events', meta: 'Built in' },
    { title: 'BAA available', meta: 'Every plan' },
  ],
  controlHeading: 'A plain summary of the current security posture.',
  controlBody:
    'These descriptions are careful on purpose. They help privacy officers and operations leads see what the product does today. They do not imply finished certifications or promises we have not published.',
  links: [
    {
      href: '/product/features/hipaa-task-management-audit-history',
      eyebrow: 'Product',
      title: 'See the audit-trail workflow',
      body: 'Go straight to the product section on the task and audit layer that buyers usually ask about first.',
    },
    {
      href: '/pricing',
      eyebrow: 'Pricing',
      title: 'Match safeguards to plan fit',
      body: 'The legal and audit baseline is on every plan. Pricing mainly changes how much you can run.',
    },
    {
      href: '/baa',
      eyebrow: 'BAA',
      title: 'Review the agreement',
      body: 'If legal review is the blocker, go straight from this page to the BAA instead of a general contact form.',
    },
  ],
} as const

export const securitySafeguards = [
  {
    title: 'Encryption and transport protections',
    body: 'App traffic runs over HTTPS, and managed infrastructure encrypts stored data at rest.',
  },
  {
    title: 'Access and identity boundaries',
    body: 'The product uses unique user logins and role-based access, so each action ties back to the person who did it.',
  },
  {
    title: 'Append-only audit behavior',
    body: 'Audit events are kept in an append-only record. They are not treated like a feed you can edit.',
  },
  {
    title: 'Marketing and app telemetry separation',
    body: 'Analytics stay on the public site. The signed-in product does not load third-party marketing scripts.',
  },
] as const

export const securityControlRows = [
  {
    area: 'Access control',
    description: 'Role-based access and unique user logins keep clinic actions tied to a person.',
  },
  {
    area: 'Audit controls',
    description: 'Product activity is kept in an append-only audit record, not a feed you can edit.',
  },
  {
    area: 'Transmission security',
    description: 'HTTPS/TLS protects app traffic in transit.',
  },
  {
    area: 'Stored data protection',
    description: 'Managed infrastructure encrypts stored data at rest.',
  },
  {
    area: 'Telemetry boundary',
    description: 'Public-site analytics stay separate from the signed-in app.',
  },
] as const

export const publicSubprocessors = [
  {
    name: 'Managed database provider',
    purpose: 'Managed PostgreSQL database hosting',
    data: 'Application data and audit data stored in PostgreSQL',
    status: 'Database provider',
  },
  {
    name: 'Sentry',
    purpose: 'Application error monitoring and alerting',
    data: 'Sanitized error and request metadata with PHI scrubbing enabled',
    status: 'Operational monitoring',
  },
  {
    name: 'Resend',
    purpose: 'Transactional email and marketing email delivery',
    data: 'Recipient email address and message metadata only; no PHI permitted in email content',
    status: 'Email delivery',
  },
  {
    name: 'Stripe',
    purpose: 'Subscription billing and payment processing',
    data: 'Organization billing metadata and billing contact details only; no PHI permitted',
    status: 'Billing provider',
  },
  {
    name: 'PostHog',
    purpose: 'Marketing-site analytics only',
    data: 'Public-site analytics only; not loaded in the authenticated app',
    status: 'Marketing analytics',
  },
] as const

export const subprocessorsPageCopy = {
  intro:
    'This page lists the third-party services PHIGuard uses to run the platform and the public marketing site.',
  tenantBoundary:
    "Customer integrations such as Google Workspace and Microsoft 365 calendar connections run inside your own account. They are not listed here as PHIGuard subprocessors.",
  changeNotice:
    'PHIGuard updates this list when a subprocessor is added, removed, or changed in a meaningful way.',
} as const
