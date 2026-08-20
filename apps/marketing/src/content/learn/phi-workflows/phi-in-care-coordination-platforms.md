---
title: "PHI in Care Coordination Platforms: HIPAA Compliance Guide"
seoTitle: "PHI in Care Coordination Platforms: HIPAA Guide"
description: "Care coordination platforms that handle PHI require BAAs. This guide covers how to evaluate a platform's HIPAA readiness, what BAAs must cover, minimum necessary data sharing, and what happens to PHI when you cancel."
metaDescription: "HIPAA compliance for care coordination platforms: BAA requirements under 45 CFR §§ 164.308(b) and 164.502(e), minimum necessary data sharing, vendor."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Care coordination platforms that manage transitions of care, care team communications, and case management workflows become business associates when they handle PHI. Covered entities must execute BAAs under 45 CFR §§ 164.308(b) and 164.502(e), apply minimum necessary data sharing, and confirm PHI handling at contract termination."
keyTakeaways:
  - "Any care coordination platform that receives, stores, or transmits PHI on behalf of the clinic is a business associate requiring a BAA under 45 CFR § 164.308(b)(1)."
  - "A BAA must be in place before PHI is first entered into a care coordination platform — not at contract renewal."
  - "Minimum necessary applies across the care team — each care team member should see only the patient information relevant to their role in the care plan."
  - "When a care coordination platform contract ends, the BAA must address how PHI is returned or destroyed — this should be confirmed before canceling."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR § 164.308 — Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "45 CFR § 164.502 — Uses and Disclosures of PHI"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "HHS — Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does every care coordination platform need a BAA?"
    a: "Any platform that handles PHI on behalf of the covered entity needs a BAA. Under 45 CFR § 164.308(b)(1), covered entities must enter into BAAs with business associates before PHI is transmitted. A care coordination platform that receives patient names, diagnoses, care plans, or any other PHI is a business associate. A platform that is used only for internal task management with no patient identifiers may not require a BAA — but that distinction requires careful evaluation."
  - q: "What tier or plan includes HIPAA support for care coordination platforms?"
    a: "This varies by vendor. Many platforms offer HIPAA compliance features — including BAAs and security configurations — at a specific paid tier, with lower tiers explicitly excluding HIPAA compliance. The practice manager must verify which tier includes the BAA and what security features are enabled at that tier before subscribing. Using a care coordination tool at a non-HIPAA tier is a compliance risk regardless of what the clinic intends."
  - q: "Can a community health worker use a care coordination platform to manage PHI?"
    a: "Community health workers who are workforce members of the covered entity can use approved, BAA-backed platforms to coordinate care. Community health workers who are employed by an external organization — a community health center, a nonprofit, or a public health agency — create a more complex arrangement. If they are viewing or managing the clinic's patient PHI on a shared platform, the BAA must cover their organization's access, or they must be added to the clinic's workforce through a formal arrangement."
  - q: "What happens to PHI in a care coordination platform when we cancel the subscription?"
    a: "Under a properly structured BAA, the vendor must return or destroy all PHI when the business associate relationship ends. Before canceling a care coordination platform, confirm with the vendor how this will be handled: whether data can be exported in a usable format, when data will be deleted, and whether the vendor will provide written confirmation of deletion. Canceling without addressing PHI creates an ongoing compliance risk — the former vendor still has your patient data without an active BAA."
---

When a community health worker logs a patient's care plan into a coordination platform on your clinic's behalf, that platform is receiving PHI — and a BAA is required before the first record is entered. Care coordination platforms occupy a growing place in small clinic operations, and when these platforms handle PHI, they become business associates with significant HIPAA implications.

This guide covers how to evaluate a care coordination platform's HIPAA readiness, what a BAA must contain for these vendors, minimum necessary data sharing across care teams, and how to handle PHI at the end of a vendor relationship.

## When a Care Coordination Platform Is a Business Associate

Under 45 CFR § 164.502(e)(1), covered entities may disclose PHI to business associates provided they obtain satisfactory assurance that the business associate will use appropriate safeguards to protect the PHI. Those assurances must be in writing — that is the BAA.

A care coordination platform is a business associate when it:

- Stores patient records, care plans, or care notes on behalf of the covered entity
- Transmits PHI between care team members
- Receives patient identifiers and clinical information for care management purposes
- Provides care team communication tools that reference patient cases by name or identifier

**Common care coordination platform categories that may require BAAs:**

| Platform Type | PHI Exposure |
|---|---|
| Care management systems | Patient care plans, diagnoses, social determinants |
| Health information exchanges (HIEs) | Clinical records shared between providers |
| Community health worker tools | Patient contact, social needs, care coordination notes |
| Case management platforms | Patient demographics, clinical history, service authorizations |
| Care transition communication tools | Patient identity, care plan, discharging institution |

## Evaluating a Platform's HIPAA Readiness

Before adopting a care coordination platform that will handle PHI, ask the vendor the following:

**1. Does the vendor offer a BAA?**

Some vendors offer BAAs only at specific plan tiers. Confirm:
- Which tier includes the BAA
- What security configurations are included at that tier (encryption, access controls, audit logging)
- Whether the BAA covers subcontractors and third-party integrations the vendor uses

**2. How is data encrypted?**

Confirm that PHI is encrypted at rest (in the vendor's storage) and in transit (when transmitted between users or integrated systems). Ask for the encryption standards used (AES-256 for at-rest encryption and TLS 1.2+ for in-transit are acceptable minimums).

**3. What access controls exist?**

Evaluate whether the platform allows role-based access controls — so that community health workers see only the patients they are assigned to, and clinical care managers see only the information relevant to their function.

**4. What audit logging is available?**

The vendor should maintain logs of who accessed patient records and when. Ask whether audit log data is accessible to the covered entity for compliance review.

**5. What is the subcontractor and integration chain?**

Care coordination platforms often integrate with other tools — EHRs, messaging platforms, analytics tools. Confirm that the vendor has BAAs in place with their subcontractors that access PHI, consistent with 45 CFR § 164.308(b)(2).

## What a BAA Must Cover for a Care Coordination Vendor

Under 45 CFR § 164.308(b)(3) and § 164.504(e), a BAA with a care coordination platform must include:

- **Permitted uses**: The vendor may use PHI only for the purposes specified in the BAA — providing the care coordination service. They may not use patient data for product improvement, marketing, or analytics without explicit authorization.
- **Safeguard obligations**: The vendor must implement appropriate safeguards consistent with the Security Rule.
- **Subcontractor requirements**: The vendor must ensure that subcontractors with PHI access have equivalent protections.
- **Breach reporting**: The vendor must report breaches affecting the clinic's PHI within 60 days of discovery.
- **Return or destruction**: Upon termination, the vendor must return or destroy all PHI unless retention is required by law.
- **Access rights**: The covered entity must be able to audit the vendor's compliance with the BAA.

A BAA that does not include all of these elements is incomplete. Review vendor-provided BAA templates and negotiate any deficiencies before signing.

## Minimum Necessary Data Sharing Across the Care Team

Care coordination platforms are designed to share information across a care team — which may include clinical providers, community health workers, social workers, care managers, and administrative coordinators. The minimum necessary standard under 45 CFR § 164.514(d) applies to this data sharing.

**Practical minimum necessary rules for care coordination:**

- **Community health workers** should have access to the patient's contact information, care plan goals, and social needs assessment — not their full clinical record.
- **Social workers** coordinating social determinants of health interventions should see what is relevant to the social needs they are addressing — not diagnoses or medications unrelated to their role.
- **Care managers** overseeing transitions of care should see the transition plan, relevant diagnoses, and follow-up requirements — not necessarily the patient's full clinical history.
- **Clinical providers** involved in the care plan should have full access to clinical information.

Configure the platform's role-based access controls to enforce these distinctions. When configuring a care coordination platform, map each role type to an appropriate access level and document the configuration.

## Sharing PHI Across Organization Boundaries

Some care coordination involves sharing PHI across organizational boundaries — a clinic coordinating with a hospital, a community health center, or a social services agency. These cross-organizational disclosures require careful authorization analysis:

**Treatment-purpose disclosures** (sharing clinical information with another provider involved in the patient's care) are authorized under 45 CFR § 164.502(a)(1)(ii) without patient authorization.

**Non-clinical care coordination** (sharing with social services agencies, housing programs, or community organizations) may require patient authorization if the sharing cannot be characterized as treatment, payment, or healthcare operations.

When in doubt, obtain patient authorization before sharing PHI outside the clinical care relationship through a care coordination platform.

## PHI at Contract Termination

Ending a care coordination platform subscription without addressing PHI is one of the most common compliance oversights in small clinic technology management.

**Before canceling a care coordination platform:**

1. **Export patient data**: Download all patient records, care plans, and care coordination notes in a usable format before the cancellation takes effect. Store this data in a compliant, encrypted environment.
2. **Confirm BAA obligations**: Review the BAA's termination provisions. The vendor should commit to destroying or returning all PHI within a specified timeframe.
3. **Request written confirmation**: Ask the vendor to confirm in writing when the PHI has been deleted from their systems, including backups.
4. **Document the process**: Record the cancellation date, the data export, and the vendor's confirmation of PHI deletion.

PHI that remains with a former care coordination vendor after the BAA has ended is unprotected — there is no longer a valid agreement governing its use. This creates ongoing compliance risk.

For a complete assessment of your clinic's PHI technology processes, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet). For the minimum necessary standard that applies across all PHI sharing, see [minimum necessary standard](/learn/hipaa-basics/minimum-necessary-standard).

PHIGuard operates under BAA details available during plan review and provides small clinics with a HIPAA-native task management platform to coordinate compliance activities without the confusion of multi-tier BAA eligibility. Learn more at [PHIGuard HIPAA](/hipaa).
