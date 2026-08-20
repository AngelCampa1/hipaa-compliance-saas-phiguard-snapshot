---
title: "Is Confluence HIPAA Compliant?"
vendor: "Confluence (Atlassian)"
seoTitle: "Is Confluence HIPAA Compliant?"
description: "What clinical teams need to know about Confluence HIPAA BAA availability, eligible Atlassian plans, app tagging, AI deactivation, Marketplace apps, and PHI entry limits."
metaDescription: "Is Confluence HIPAA compliant? Atlassian can sign BAAs for eligible Standard, Premium, and Enterprise plans. Learn the setup limits before adding PHI."
publishedAt: 2026-04-28
updatedAt: 2026-05-21
verificationDate: 2026-05-21
summary: "Confluence can support HIPAA-governed use on eligible Atlassian Cloud Standard, Premium, and Enterprise plans when the organization signs Atlassian's BAA, tags the app for HIPAA, deactivates AI as required, follows the implementation guide, and controls third-party apps and restricted fields. Free and trial plans are not eligible."
keyTakeaways:
  - "Atlassian says it can sign BAAs for Standard, Premium, and Enterprise plans for Confluence, Jira, and Jira Service Management."
  - "Free and trial plans are not eligible for Atlassian's HIPAA BAA workflow."
  - "A BAA is only one step; the customer must tag apps, disable AI for the organization, follow the implementation guide, and manage third-party apps separately."
  - "Confluence is a documentation platform, so clinics still need a workflow for policy acknowledgements, training, incidents, vendor BAAs, and audit evidence."
sources:
  - title: "Understand HIPAA compliance for Atlassian apps"
    url: "https://support.atlassian.com/organization-administration/docs/understand-hipaa-compliance-for-atlassian-products/"
    publisher: "Atlassian"
  - title: "The HIPAA Implementation Guide"
    url: "https://support.atlassian.com/organization-administration/docs/the-hipaa-implementation-guide/"
    publisher: "Atlassian"
  - title: "Sign a Business Associate Agreement (BAA)"
    url: "https://support.atlassian.com/organization-administration/docs/sign-a-business-associate-agreement-baa/"
    publisher: "Atlassian"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can Confluence Standard be HIPAA compliant?"
    a: "Atlassian's current support documentation says it can sign BAAs for Standard, Premium, and Enterprise plans for Confluence, Jira, and Jira Service Management. The organization still has to sign the BAA, tag apps for HIPAA, disable AI as required, and follow the implementation guide."
  - q: "Does Confluence Premium include a BAA?"
    a: "Premium is eligible for Atlassian's BAA workflow, but the BAA is not automatic. The organization admin must complete the BAA process and configure HIPAA handling before PHI is uploaded."
  - q: "Can PHI go in Confluence page titles or space names?"
    a: "Clinics should be careful. Atlassian's HIPAA implementation guidance restricts where PHI can be entered, including Confluence-related fields such as space names and keys. Staff need clear rules before using Confluence for patient-adjacent content."
  - q: "Does Atlassian's BAA cover Marketplace apps?"
    a: "No, not automatically. Atlassian says customers are responsible for identifying and configuring third-party apps and obtaining any required BAAs for those apps."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/how-to-audit-vendor-hipaa-claims"
---

## Short answer

Confluence can support HIPAA-governed use, but only under specific conditions. Atlassian currently says it can sign Business Associate Agreements for Standard, Premium, and Enterprise plans for Confluence, Jira, and Jira Service Management. Free and trial plans are not eligible.

That is different from older guidance that treated Confluence Cloud HIPAA support as limited to the top cloud plan. If your clinic made a decision based on that older rule, re-check the current Atlassian documentation and your actual plan.

The practical answer is still conditional: Confluence is not HIPAA-ready just because the product name appears in Atlassian's HIPAA materials. The clinic must complete the BAA process, tag apps for HIPAA, deactivate AI for the organization as required, follow Atlassian's implementation guide, and separately evaluate Marketplace apps, integrations, and other third-party services.

## What Atlassian currently says

Atlassian's HIPAA documentation says the HIPAA workflow applies to eligible Atlassian Cloud Standard, Premium, and Enterprise plans for Confluence, Jira, and Jira Service Management. It also says Free and trial plans are not eligible.

Atlassian frames HIPAA compliance as shared responsibility. The vendor can provide eligible products, a BAA path, and configuration guidance. The customer still has to decide where PHI may be entered, configure the organization, train users, control third-party apps, and avoid unsupported fields or features.

For a clinic, that means the safe question is not "Do we use Confluence?" It is "Is this exact Confluence site configured and governed for the exact PHI workflow we plan to run?"

## What a compliant Confluence setup requires

Before uploading PHI or patient-adjacent documentation to Confluence, verify each item below.

| Requirement | Why it matters |
|---|---|
| Eligible plan | Standard, Premium, or Enterprise can be eligible; Free and trial plans are not |
| Signed BAA | HIPAA requires a contract before a business associate handles PHI |
| HIPAA app tagging | Only the relevant apps configured for HIPAA should hold PHI |
| AI deactivation | Atlassian's HIPAA implementation guide requires AI deactivation for apps in the organization |
| Restricted fields | Staff need rules for page titles, space names, keys, configuration names, and other areas where PHI should not be entered |
| Marketplace apps | Third-party apps are not automatically covered by Atlassian's BAA |
| Permission model | Spaces, pages, attachments, external users, and administrators need least-privilege access |
| Review process | The clinic should periodically review users, content, exports, and apps that may touch PHI |

If the clinic cannot prove these controls, do not put PHI in Confluence.

## Where PHI typically enters Confluence

Confluence feels like a safe place because it is "just documentation." That is exactly why PHI slips into it.

Common exposure patterns include:

- clinical SOPs with real patient scenarios
- incident reviews that name a patient or describe a unique patient situation
- care coordination notes or huddle notes
- training materials built from real cases
- screenshots from an EHR or billing system
- meeting notes that include patient names, dates, diagnoses, or appointment details
- vendor review pages that attach files containing patient data

The clinic should train staff that PHI can appear in titles, comments, attachments, embedded previews, and examples, not only in obvious patient records.

## Confluence Data Center is different

Confluence Data Center is self-managed infrastructure. If a clinic runs Data Center on its own servers or private cloud, Atlassian's cloud BAA workflow is not the same compliance model. The clinic has to evaluate its hosting provider, IT vendor, backup system, access controls, audit logging, and disaster recovery process separately.

Data Center may give more control, but it also moves more responsibility onto the clinic and its vendors. Do not assume self-hosting is automatically safer.

## Confluence vs PHIGuard

Confluence is strongest as a knowledge base. It can store policies, procedures, internal documentation, and non-PHI operational knowledge. If the organization already uses Atlassian and has completed the HIPAA setup, Confluence may be part of the documentation layer.

PHIGuard solves a different problem: running the compliance work around the documents.

| Job | Confluence fit | PHIGuard fit |
|---|---|---|
| Store policy text | Strong | Good when tied to operations |
| Track policy acknowledgements | Requires custom workflow or add-on | Built for assigned acknowledgements and evidence |
| Vendor BAA registry | Possible as pages and tables | Native workflow fit |
| Incident response | Possible as templates and pages | Incident record, tasks, evidence, and audit history stay connected |
| Training follow-up | Requires manual process or integration | Training assignments and completion evidence fit the compliance workflow |
| Risk remediation | Possible as pages or tasks elsewhere | Owners, due dates, evidence, and follow-up stay visible |

Use Confluence for documentation if it is properly configured and governed. Use PHIGuard when the clinic needs owners, due dates, audit history, and evidence around the HIPAA work.

## Recommendation

Do not rely on old claims that limit Confluence HIPAA support to the top cloud plan. Atlassian's current documentation says Standard, Premium, and Enterprise plans can be eligible for BAAs covering Confluence.

Also do not treat a BAA as the whole answer. A clinic using Confluence for PHI must manage app tagging, AI settings, third-party apps, restricted fields, permissions, staff training, and periodic review.

For policy acknowledgements, incident records, vendor BAAs, training evidence, and risk remediation, compare PHIGuard as the workflow system. Start with the [vendor HIPAA claim audit guide](/learn/vendor-management/how-to-audit-vendor-hipaa-claims), [business associate agreement explainer](/learn/hipaa-basics/business-associate-agreement-explained), [policy review calendar](/resources/policy-review-calendar), and [HIPAA PM tool comparison guide](/resources/hipaa-pm-tool-comparison-guide).
