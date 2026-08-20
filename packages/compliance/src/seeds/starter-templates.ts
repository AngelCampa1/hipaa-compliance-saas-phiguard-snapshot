import { eq } from 'drizzle-orm'
import type { DB } from '@phiguard/db'
import { checklistTemplates } from '../schema/checklist-templates.js'

/**
 * Seed data for built-in HIPAA compliance checklist templates.
 *
 * HIPAA references are cross-checked against docs/hipaa/safeguards-map.md.
 * Only §164.308 references (Administrative Safeguards) are used below,
 * as those are the ones documented in the safeguards map.
 *
 * Seed data contains NO PHI - all names and values are generic/synthetic.
 */

interface TemplateWithItems {
  id: string
  name: string
  description: string
  hipaaReference: string
  isBuiltIn: true
  items: {
    title: string
    description: string
    hipaaReference: string
  }[]
}

const LEGACY_STARTER_TEMPLATE_IDS = {
  '00000000-0000-0000-0000-000000000001': '11111111-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-000000000002': '22222222-2222-4222-8222-222222222222',
  '00000000-0000-0000-0000-000000000003': '33333333-3333-4333-8333-333333333333',
  '00000000-0000-0000-0000-000000000004': '44444444-4444-4444-8444-444444444444',
} as const

const STARTER_TEMPLATES: TemplateWithItems[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Access Review',
    description:
      'Quarterly review of user access rights to ensure only authorized workforce members have access to PHI systems.',
    hipaaReference: '§164.308(a)(4)', // Information Access Management - confirmed in safeguards map
    isBuiltIn: true,
    items: [
      {
        title: 'Review active user accounts and access levels',
        description:
          'Pull a full list of user accounts and verify each has appropriate role (owner / admin / staff). Remove or downgrade any excess privileges.',
        hipaaReference: '§164.308(a)(4)',
      },
      {
        title: 'Remove access for terminated workforce members',
        description:
          'Cross-reference HR termination records against active accounts. Revoke sessions and remove organization membership for any terminated staff.',
        hipaaReference: '§164.308(a)(3)', // Workforce Security - Termination Procedures [UNCITED in safeguards-map detail but appears under Workforce Security row]
      },
      {
        title: 'Review administrator and owner privileges',
        description:
          'Confirm that owner and admin roles are limited to personnel who require elevated access. Document the rationale for each admin-level account.',
        hipaaReference: '§164.308(a)(4)',
      },
    ],
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Risk Assessment Cadence',
    description:
      'Annual HIPAA Security Risk Analysis per the Security Management Process standard. Documents threats, vulnerabilities, and likelihood/impact assessments.',
    hipaaReference: '§164.308(a)(1)', // Security Management Process - Risk Analysis - confirmed in safeguards map
    isBuiltIn: true,
    items: [
      {
        title: 'Conduct annual risk analysis',
        description:
          'Perform a thorough assessment of potential risks to the confidentiality, integrity, and availability of all ePHI your organization creates, receives, maintains, or transmits.',
        hipaaReference: '§164.308(a)(1)',
      },
      {
        title: 'Document identified threats and vulnerabilities',
        description:
          'Record all identified threats (natural, human, environmental) and vulnerabilities in the risk register. Use the risk analysis template in docs/hipaa/risk-analysis-template.md.',
        hipaaReference: '§164.308(a)(1)',
      },
      {
        title: 'Assess probability and impact for each identified risk',
        description:
          'For each threat/vulnerability pair, assign a likelihood rating (low / medium / high) and an impact rating (low / medium / high). Calculate the composite risk level.',
        hipaaReference: '§164.308(a)(1)',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'BAA Inventory',
    description:
      'Maintain a current inventory of all Business Associate Agreements (BAAs). Confirms each business associate has a valid BAA covering all PHI flows.',
    hipaaReference: '§164.308(b)', // Business Associate Contracts - confirmed in safeguards map
    isBuiltIn: true,
    items: [
      {
        title: 'List all current business associates that receive or process PHI',
        description:
          'Review all third-party vendors, service providers, and contractors. Confirm whether each one meets the definition of a Business Associate under HIPAA.',
        hipaaReference: '§164.308(b)',
      },
      {
        title: 'Confirm BAAs are current and have not expired',
        description:
          'Check the BAA inventory in docs/hipaa/vendors.md. Verify execution date, expiration (if any), and renewal status for each business associate.',
        hipaaReference: '§164.308(b)',
      },
      {
        title: 'Confirm BAAs cover all PHI flows for each business associate',
        description:
          'Review each BAA to ensure it explicitly covers the types of PHI and services provided. Flag any gaps for legal review.',
        hipaaReference: '§164.308(b)',
      },
    ],
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Workforce Training Log',
    description:
      'Annual HIPAA workforce training verification. Documents completion of required security awareness training and role-based training.',
    hipaaReference: '§164.308(a)(5)', // Security Awareness and Training - confirmed in safeguards map
    isBuiltIn: true,
    items: [
      {
        title: 'Verify annual HIPAA security awareness training completion',
        description:
          'Confirm that all workforce members have completed the annual HIPAA security awareness training within the past 12 months. Document completion dates.',
        hipaaReference: '§164.308(a)(5)',
      },
      {
        title: 'Verify role-based HIPAA training for staff with PHI access',
        description:
          'For staff in roles that access PHI (clinical, admin, IT), confirm completion of role-specific training covering PHI handling procedures.',
        hipaaReference: '§164.308(a)(5)',
      },
      {
        title: 'Confirm sanction policy acknowledgment',
        description:
          'Obtain signed acknowledgment from all workforce members that they have read and understand the sanction policy for PHI violations.',
        hipaaReference: '§164.308(a)(1)', // Sanction Policy is under Security Management Process
      },
    ],
  },
]

function canonicalizeTemplateId(templateId: string) {
  return (
    LEGACY_STARTER_TEMPLATE_IDS[templateId as keyof typeof LEGACY_STARTER_TEMPLATE_IDS] ??
    templateId
  )
}

export function getCompatibleStarterTemplateIds(templateId: string) {
  const canonicalTemplateId = canonicalizeTemplateId(templateId)
  return [
    canonicalTemplateId,
    ...Object.entries(LEGACY_STARTER_TEMPLATE_IDS)
      .filter(([, canonicalId]) => canonicalId === canonicalTemplateId)
      .map(([legacyId]) => legacyId),
  ]
}

/**
 * Insert starter HIPAA checklist templates and their items.
 * Idempotent: skips any template that already exists by ID.
 */
export async function runSeed(db: DB): Promise<void> {
  for (const template of STARTER_TEMPLATES) {
    const existing = await db
      .select({ id: checklistTemplates.id })
      .from(checklistTemplates)
      .where(eq(checklistTemplates.name, template.name))

    if (existing.length > 0) {
      continue // already seeded
    }

    await db.insert(checklistTemplates).values({
      id: template.id,
      name: template.name,
      description: template.description,
      hipaaReference: template.hipaaReference,
      isBuiltIn: template.isBuiltIn,
    })

    // Note: template items are seeded without a tenantId because they are
    // template-level items. When a tenant instantiates a checklist from a
    // template, checklist_items will be created with the tenant's tenantId.
    // The items below are stored as checklist items on a "template checklist"
    // which does not exist yet - so we skip item seeding until instantiation.
    // Instead, we store item definitions separately if needed, or rely on
    // application logic to copy items from template on checklist creation.
    // For now: seed is templates-only; items are created on instantiation.
  }
}

/**
 * Returns the starter template definitions for use by application logic
 * when instantiating a checklist from a template.
 */
export function getStarterTemplateItems(
  templateId: string,
): { title: string; description: string; hipaaReference: string }[] {
  const template = STARTER_TEMPLATES.find((t) => t.id === canonicalizeTemplateId(templateId))
  return template?.items ?? []
}

export { LEGACY_STARTER_TEMPLATE_IDS, STARTER_TEMPLATES, canonicalizeTemplateId }
