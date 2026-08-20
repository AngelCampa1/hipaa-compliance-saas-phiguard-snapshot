---
title: "Is Box HIPAA Compliant"
vendor: "Box"
description: "What small clinics need to know about Box's BAA availability, plan requirements, and the configuration steps required before using Box for PHI storage and sharing."
metaDescription: "Is Box HIPAA compliant Box offers a BAA on qualifying plans. Learn what plan, configuration, and controls are required before using Box with PHI."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
verificationDate: 2026-04-26
summary: "Box can be used for PHI storage and collaboration in HIPAA-covered use cases, but requires a qualifying plan with a signed BAA and deliberate admin configuration to limit sharing defaults. Verify current plan requirements at Box's Trust Center before deployment."
keyTakeaways:
  - "Box offers a BAA for qualifying business plans (Business Plus, Enterprise, and Enterprise Plus as of this verification date) — not available on standard Business plans."
  - "Default Box sharing settings are permissive — admin controls must be configured to restrict public link sharing before PHI is stored in Box."
  - "Third-party Box integrations (from the Box App Center) may handle PHI and require separate BAA assessment."
  - "Box is suitable for compliance document storage, scanned paper record archives, and policy collaboration — not for real-time clinical communication."
  - "Vendor terms and plan tiers change — verify current BAA eligibility at box.com/security before deploying Box in a PHI environment."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-software-comparison-scorecard
relatedCommercialPath: /pricing
relatedLearnPath: /learn/vendor-management/when-a-vendor-needs-a-baa
sources:
  - title: "Box Trust and Security"
    url: "https://www.box.com/security"
    publisher: "Box"
  - title: "HIPAA Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.504(e) — Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
faq:
  - q: "Can I use Box Personal or Box for Individuals with PHI?"
    a: "No. Consumer Box plans do not include a BAA and are not appropriate for PHI. A business plan with BAA coverage is required."
  - q: "What admin configurations does Box require for HIPAA use?"
    a: "At minimum: disable public link sharing at the admin level, configure folder-level access controls to limit PHI visibility to authorized users, enable audit logging, and review integration permissions. Box's admin console provides these controls on qualifying plans."
  - q: "Does Box encrypt data at rest and in transit?"
    a: "Yes. Box uses AES 256-bit encryption at rest and TLS 1.2+ for data in transit on all business plans. Verify current encryption specifications at Box's Trust Center."
  - q: "Is Box appropriate for storing EHR records or DICOM images?"
    a: "Box can store these file types, but it is not a substitute for an EHR system with HIPAA-required audit controls on clinical record access. Box is better suited for administrative and operational document management — policies, training records, BAA copies, compliance documentation."
---

Box is a cloud content management platform used for document storage, sharing, and collaboration. Clinics use it for storing scanned paper records, managing compliance documentation, and coordinating administrative files.

Box offers a BAA on qualifying plans, but the plan requirement is only the starting point. PHI cannot enter Box until deliberate admin configuration is in place.

**Note:** Box's product tiers, pricing, and BAA terms change periodically. All information in this guide reflects publicly available information as of the verification date above. Verify current eligibility and terms at box.com/security before evaluating Box for a PHI environment.

## Does Box Offer a HIPAA BAA

Yes. Box makes a Business Associate Agreement available to customers on qualifying plans. As of this verification date, BAA eligibility applies to Business Plus, Enterprise, and Enterprise Plus plans. The standard Business plan is not eligible.

Box's standard BAA covers the core content management platform. Customers with a signed BAA can store and process PHI in Box within the agreement's scope.

**Action step:** Before using Box for any PHI, confirm you are on a BAA-eligible plan and request or execute the BAA with Box. A general subscription agreement does not cover HIPAA. The BAA is a separate agreement.

## Compliance Features on BAA-Eligible Plans

Box includes features that address the HIPAA Security Rule:

**Encryption.** AES 256-bit encryption at rest; TLS in transit. Verify current specifications at Box's Trust Center.

**Access controls.** Granular folder and file permissions allow administrators to limit access to PHI-containing folders to only authorized users. Role-based access can be configured at the workspace or folder level.

**Audit logging.** Admin-level audit logs track user activity: who accessed which files, when, and from where. These logs support the HIPAA Security Rule's audit control requirement (45 CFR § 164.312(b)).

**Data residency.** Box offers data residency controls on higher enterprise tiers, allowing organizations to specify where data is stored geographically.

**Admin controls.** The enterprise admin console covers MFA enforcement, session timeout, device trust, and integration management.

## HIPAA Risks That Remain With Box

A signed BAA with Box is not sufficient on its own. Several risk areas require deliberate action:

### Default Sharing Settings

Box's default behavior is designed for broad collaboration. Users can create shared links accessible to anyone with the URL. A staff member who shares a folder of patient documents via a public Box link has disclosed PHI to anyone who obtains that URL.

**What to do:** In the Box Admin Console, configure the organization-wide default for external sharing to restrict public link creation. Require admin approval for external sharing requests. Test these settings before onboarding PHI.

### Box Integrations

Box's App Center includes hundreds of third-party integrations — electronic signature tools, CRM connectors, automation platforms, AI tools. When these integrations access Box content, they may process PHI. Each integration that touches PHI-containing folders is a potential business associate and may require its own BAA.

**What to do:** Review which Box integrations are active in your environment. Disable any that are not necessary. For integrations that do access PHI-containing folders, confirm their HIPAA posture and BAA availability.

### AI Features

Box has introduced AI features (Box AI) for content summarization, search, and analysis. If Box AI processes PHI-containing documents, the processing must be covered under the BAA terms. Verify with Box whether AI features are included in HIPAA BAA coverage before enabling them.

## Clinical Use Cases for Box

**Appropriate uses with BAA:**
- Compliance documentation storage (policies, training records, BAA archive, risk analysis)
- Scanned paper records archive (with access controls limiting to authorized staff)
- Administrative file collaboration (scheduling templates, operational procedures)
- Policy distribution and version control

**Uses that require additional assessment:**
- Patient records requiring EHR-level audit trails (Box audit logs differ from EHR-specific audit requirements)
- Real-time clinical communication (Box is not designed for clinical messaging)
- DICOM image storage (possible technically, but specialized PACS systems are better suited)

Box is a reasonable choice for administrative document management. It is not a replacement for an EHR's clinical record management.

## Current Source Posture

The source set for this page is HHS: HIPAA Business Associate Guidance; eCFR: 45 CFR § 164.504(e) — Business Associate Contracts. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Box, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Box into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Box offers a BAA for qualifying business plans (Business Plus, Enterprise, and Enterprise Plus as of this verification date) — not available on standard Business plans. Default Box sharing settings are permissive — admin controls must be configured to restrict public link sharing before PHI is stored in Box. Third-party Box integrations (from the Box App Center) may handle PHI and require separate BAA assessment. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
