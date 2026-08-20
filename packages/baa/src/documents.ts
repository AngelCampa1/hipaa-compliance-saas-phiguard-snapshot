import { createHash } from 'node:crypto'
import {
  PHIGUARD_LEGAL_ENTITY,
  PHIGUARD_NOTICE_ADDRESS_SINGLE_LINE,
} from '@phiguard/brand/identity'

export type LegalDocumentType = 'terms' | 'baa'

export interface LegalDocumentSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LegalDocumentSnapshot {
  type: LegalDocumentType
  title: string
  version: string
  effectiveDate: string
  partyName: string
  noticeAddress: string
  signatoryName: string
  signatoryTitle: string
  sections: LegalDocumentSection[]
}

export const PHIGUARD_LEGAL_PARTY = {
  partyName: PHIGUARD_LEGAL_ENTITY,
  noticeAddress: PHIGUARD_NOTICE_ADDRESS_SINGLE_LINE,
  signatoryName: 'Angel Campa',
  signatoryTitle: 'Founder',
} as const

const TERMS_SECTIONS: LegalDocumentSection[] = [
  {
    heading: 'Acceptance and contracting party',
    paragraphs: [
      'These Terms of Service govern access to and use of the PHIGuard software service. If the signer accepts on behalf of a clinic, practice, or company, the signer represents that they have authority to bind that legal entity.',
      'The customer legal entity identified during signup is the contracting customer under these Terms.',
    ],
  },
  {
    heading: 'Service and customer responsibilities',
    paragraphs: [
      'PHIGuard provides HIPAA-native task management, compliance operations, and related administrative tooling for healthcare organizations.',
      'Customer remains responsible for its own compliance program, workforce conduct, and lawful use of the service. PHIGuard provides software and supporting controls, not legal advice or a guarantee of full regulatory compliance.',
    ],
    bullets: [
      'Each workforce member must use a unique account.',
      'Customer must maintain accurate account and billing information.',
      'Customer may not use the service for unlawful, malicious, or abusive activity.',
    ],
  },
  {
    heading: 'Subscription, billing, and renewal',
    paragraphs: [
      'Subscriptions may be offered on a monthly or annual term, as identified in the applicable checkout or order flow. Subscription fees are billed in advance and renew automatically for successive terms until canceled.',
      'If a trial is offered, customer may begin the trial without a payment method. If billing details are not added before the trial ends, PHIGuard may pause the subscription until billing is completed.',
      'Cancellation may be completed through the billing portal or another clearly provided account-management flow. If customer cancels, service continues through the end of the already-paid period unless expressly stated otherwise in the checkout flow.',
    ],
    bullets: [
      'Charges are prorated when PHIGuard expressly offers a prorated refund or adjustment in the applicable billing event.',
      'Taxes are the customer\'s responsibility except for taxes based on PHIGuard\'s income.',
      'Nonpayment may result in suspension after reasonable notice where legally permitted.',
    ],
  },
  {
    heading: 'Data, confidentiality, and HIPAA',
    paragraphs: [
      'Customer retains ownership of customer data. Customer grants PHIGuard a limited right to host, process, transmit, and otherwise use customer data solely to provide, secure, support, and improve the service as permitted by these Terms and applicable law.',
      'The parties will protect each other\'s confidential information using at least reasonable care. PHI handled by PHIGuard is governed by the Business Associate Agreement executed alongside these Terms.',
    ],
  },
  {
    heading: 'Support, suspension, and termination',
    paragraphs: [
      'PHIGuard will provide commercially reasonable support and administrative assistance during the subscription term, but no uptime or service-level agreement is provided under these Terms.',
      'Either party may terminate for a material breach that remains uncured for 30 days after written notice. PHIGuard may suspend access immediately where necessary to prevent harm, address security threats, or comply with law.',
      'After termination or expiration, PHIGuard will provide the standard post-termination export and deletion handling described in the service and BAA documentation then in effect.',
    ],
  },
  {
    heading: 'Disclaimers, liability, and disputes',
    paragraphs: [
      'The service is provided on an as-is and as-available basis to the maximum extent permitted by law.',
      'Except for excluded liabilities that cannot be limited by law, each party\'s aggregate liability arising out of or related to these Terms will not exceed the fees paid or payable by customer in the 12 months before the event giving rise to the claim.',
      'These Terms are governed by Delaware law, without regard to conflict-of-law rules, and the parties consent to exclusive venue in the state and federal courts located in Delaware.',
    ],
    bullets: [
      'Neither party is liable for indirect, incidental, special, consequential, or punitive damages to the maximum extent permitted by law.',
      'Customer indemnifies PHIGuard for claims arising from customer misuse of the service or breach of these Terms.',
    ],
  },
  {
    heading: 'Notices and updates',
    paragraphs: [
      'Legal notices to PHIGuard must be sent to the notice address and legal email then designated by PHIGuard. Operational notices may be sent electronically to the primary admin email associated with the account.',
      'PHIGuard may update these Terms prospectively by posting a new version and effective date. Continued use after the effective date constitutes acceptance of the updated Terms unless a separate acceptance flow is required.',
    ],
  },
]

const BAA_SECTIONS: LegalDocumentSection[] = [
  {
    heading: 'Parties and scope',
    paragraphs: [
      'This Business Associate Agreement applies when PHIGuard creates, receives, maintains, or transmits Protected Health Information on behalf of the customer legal entity.',
      'This BAA is incorporated into and supplements the governing Terms of Service or other services agreement between the parties. If there is a conflict on PHI handling, this BAA controls.',
    ],
  },
  {
    heading: 'Permitted uses and disclosures',
    paragraphs: [
      'PHIGuard may use and disclose PHI only as necessary to provide the contracted services, as otherwise permitted by this BAA, or as Required by Law.',
      'PHIGuard will not use or disclose PHI in a way that would violate the HIPAA Privacy Rule if done by the covered entity, except as expressly permitted for business associate management and administration under HIPAA.',
    ],
  },
  {
    heading: 'Safeguards and Security Rule compliance',
    paragraphs: [
      'PHIGuard will implement appropriate administrative, physical, and technical safeguards to protect PHI and comply with the Security Rule for ePHI where applicable.',
      'PHIGuard will use reasonable efforts to apply the minimum necessary standard to PHI uses, disclosures, and requests where HIPAA requires it.',
    ],
  },
  {
    heading: 'Reporting and breach notification',
    paragraphs: [
      'PHIGuard will report impermissible uses or disclosures of PHI and Security Incidents of which it becomes aware as required by HIPAA and this BAA.',
      'PHIGuard will notify customer of a Breach of Unsecured PHI without unreasonable delay and no later than the outside deadline required by HIPAA, and will provide information reasonably necessary for the customer to satisfy its notification obligations.',
    ],
  },
  {
    heading: 'Subcontractors and individual rights support',
    paragraphs: [
      'PHIGuard will ensure that any subcontractor that creates, receives, maintains, or transmits PHI on PHIGuard\'s behalf agrees to the same restrictions and conditions that apply to PHIGuard under this BAA.',
      'PHIGuard may update its subcontractor list from time to time and will provide notice of new PHI-handling subcontractors through its standard customer communication channels.',
      'To the extent PHIGuard maintains PHI in a designated record set or otherwise holds information needed for HIPAA individual-rights requests, PHIGuard will support customer access, amendment, and accounting obligations as required by HIPAA.',
    ],
  },
  {
    heading: 'Access to books and records; termination',
    paragraphs: [
      'PHIGuard will make its internal practices, books, and records relating to PHI available to the Secretary of HHS as required by HIPAA for purposes of determining compliance.',
      'Either party may terminate this BAA and the underlying services relationship for material breach if the breach remains uncured for 30 days after notice.',
      'At termination, PHIGuard will support the standard product export and deletion process. Where return or destruction of PHI is infeasible, PHIGuard will continue to protect that PHI and limit further use and disclosure as required by HIPAA.',
    ],
  },
  {
    heading: 'Interpretation and governing law',
    paragraphs: [
      'Terms not otherwise defined in this BAA have the meanings assigned by HIPAA. Any ambiguity will be interpreted to permit compliance with HIPAA.',
      'This BAA is governed by applicable federal HIPAA requirements and, to the extent not preempted, by Delaware law as selected in the governing services agreement.',
    ],
  },
]

const STANDARD_DOCUMENTS: Record<LegalDocumentType, LegalDocumentSnapshot> = {
  terms: {
    type: 'terms',
    title: 'PHIGuard Terms of Service',
    version: '2026-04-22.1',
    effectiveDate: '2026-04-22',
    sections: TERMS_SECTIONS,
    ...PHIGUARD_LEGAL_PARTY,
  },
  baa: {
    type: 'baa',
    title: 'PHIGuard Business Associate Agreement',
    version: '2026-04-21.1',
    effectiveDate: '2026-04-21',
    sections: BAA_SECTIONS,
    ...PHIGUARD_LEGAL_PARTY,
  },
}

export function getStandardLegalDocument(type: LegalDocumentType): LegalDocumentSnapshot {
  return structuredClone(STANDARD_DOCUMENTS[type])
}

export function getStandardLegalDocuments(): LegalDocumentSnapshot[] {
  return [getStandardLegalDocument('terms'), getStandardLegalDocument('baa')]
}

export function serializeDocument(snapshot: LegalDocumentSnapshot): string {
  const sectionText = snapshot.sections
    .map((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []).map((bullet) => `- ${bullet}`),
    ].join('\n'))
    .join('\n\n')

  return [
    snapshot.title,
    `Version: ${snapshot.version}`,
    `Effective Date: ${snapshot.effectiveDate}`,
    `Party: ${snapshot.partyName}`,
    `Notice Address: ${snapshot.noticeAddress}`,
    `PHIGuard Signatory: ${snapshot.signatoryName}, ${snapshot.signatoryTitle}`,
    '',
    sectionText,
  ].join('\n')
}

export function hashDocument(snapshot: LegalDocumentSnapshot): string {
  return createHash('sha256').update(serializeDocument(snapshot)).digest('hex')
}
