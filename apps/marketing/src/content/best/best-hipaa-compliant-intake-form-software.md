---
title: "Best HIPAA-Compliant Intake Form Software"
category: "Intake forms"
seoTitle: "Best HIPAA Intake Forms"
description: "A comparison of intake form platforms clinics evaluate for patient forms under a BAA: Jotform HIPAA, Formstack Healthcare, HIPAAtizer, Typeform with BAA setup, and Google Forms under Workspace."
metaDescription: "Best HIPAA-compliant intake form software. Compare Jotform, Formstack, HIPAAtizer, Typeform, and Google Forms under a BAA."
publishedAt: 2026-04-24
updatedAt: 2026-05-08
verificationDate: 2026-05-08
summary: "Patient intake forms collect PHI on the first interaction. The form vendor needs a signed BAA, encryption at rest, access controls, and a safe downstream handoff. Current vendor documentation now gives Typeform a BAA setup path for medical forms and lists Google Forms as included functionality under the Google Workspace HIPAA BAA, but both require careful plan and configuration review before PHI collection."
keyTakeaways:
  - "Jotform HIPAA, Formstack Healthcare, HIPAAtizer, Typeform with BAA setup, and Google Forms under Workspace can all enter the shortlist, but only with the right BAA and configuration."
  - "A signed BAA is the starting line, not the full workflow; notifications, exports, integrations, and retention still need review."
  - "EHR handoff matters because form responses otherwise become a second PHI silo to audit and delete."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/compare"
relatedLearnPath: "/learn/phi-workflows/phi-in-scheduling-and-intake-forms"
sources:
  - title: "Jotform HIPAA"
    url: "https://www.jotform.com/hipaa/"
    publisher: "Jotform"
  - title: "Formstack Healthcare"
    url: "https://www.formstack.com/industries/healthcare"
    publisher: "Formstack"
  - title: "HIPAAtizer"
    url: "https://hipaatizer.com/"
    publisher: "HIPAAtizer"
  - title: "Medical Survey: Build HIPAA-Friendly Patient Surveys"
    url: "https://www.typeform.com/guides/medical-survey"
    publisher: "Typeform"
  - title: "Google Workspace HIPAA Included Functionality"
    url: "https://workspace.google.com/terms/2015/1/hipaa_functionality/"
    publisher: "Google Workspace"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS Office for Civil Rights"
faq:
  - q: "Can we use Google Forms for patient intake?"
    a: "Potentially, but only under a paid Google Workspace environment with the HIPAA Business Associate Addendum accepted and controls configured. Google now lists Google Forms under Google Drive included functionality; consumer Google Forms is still not appropriate for PHI."
  - q: "Is Typeform HIPAA-compliant?"
    a: "Typeform now publishes a medical-form path that requires setting up a Business Associate Agreement before collecting medical information. Clinics should confirm the plan, BAA status, storage region, integrations, and AI settings before using Typeform for PHI."
  - q: "Do we need an EHR integration for intake forms?"
    a: "Not strictly. But without a handoff, form data lives in the form vendor and must be manually rekeyed. That creates a second PHI silo to audit and duplicates work."
---

## Intake is the first PHI moment, not a minor form

The patient intake form usually collects name, date of birth, insurance information, reason for visit, and often symptoms or clinical history. That is PHI from the first keystroke. A form vendor that processes or stores it is a business associate and needs a signed BAA. Consumer accounts, unmanaged workspaces, and marketing-form setups do not qualify just because the same vendor has a healthcare path.

## BAA-covered platforms to shortlist

**Jotform HIPAA.** Jotform's HIPAA-friendly plans include a BAA and configuration settings that route data only through HIPAA-qualifying infrastructure. Broad template library. Works for clinics that want flexible forms without a custom build.

**Formstack Healthcare.** Healthcare-oriented form builder with a BAA on qualifying plans. Stronger workflow and integration features than the consumer end of the market. Used by clinics that want forms plus routing plus approvals under one vendor.

**HIPAAtizer.** Smaller vendor, purpose-built for HIPAA intake forms. Leans toward independent and small-group practices. BAA is part of the product by default.

**Typeform with BAA setup.** Typeform now markets HIPAA-friendly medical forms and says clinics must set up a BAA before building medical forms. Treat it as a healthcare/enterprise configuration decision, not a default feature of a casual form account.

**Google Forms under Workspace.** Google now lists Google Forms as included functionality under the applicable Google Workspace HIPAA Business Associate Addendum. That does not make a personal Google account or unmanaged form compliant. The clinic still needs a paid Workspace account, accepted BAA, identity controls, sharing controls, retention settings, and a downstream process that does not forward PHI to uncovered tools.

## The platforms clinics should still keep separate from intake

Do not collect PHI through consumer or marketing accounts just because the same vendor has a healthcare path. A public lead-generation form, newsletter signup, or event registration form should stay separated from patient intake. The compliance posture changes the moment the form collects symptoms, diagnoses, insurance details, visit reasons, patient status, or a relationship with a specific clinic.

## The comparison that actually matters

| Vendor | BAA posture | Encryption at rest | EHR handoff | Pricing model |
|---|---|---|---|---|
| Jotform HIPAA | Included on HIPAA plans | Yes | Via integrations/API | Per-user or per-form |
| Formstack Healthcare | Included on qualifying plans | Yes | Native and API | Per-user |
| HIPAAtizer | Included on paid plans | Yes | API | Per-form or per-seat |
| Typeform with BAA setup | BAA setup required before medical forms | Verify plan and configuration | Integrations require separate review | Enterprise/healthcare path |
| Google Forms under Workspace | Included functionality under Google Workspace BAA | Covered through Google Drive controls | Manual or app-based handoff | Workspace subscription |

Specific prices change; verify with the vendor and confirm the plan includes the BAA before purchase.

## What to check before you sign

- The BAA is on the plan you are buying, not only the enterprise tier.
- Encryption at rest is on the form submissions, not only the transport layer.
- Form data has a documented retention policy and a deletion path.
- Integration to your EHR or intake system does not route PHI through an uncovered intermediary like a generic automation platform without a BAA.
- Notifications do not include PHI in email, SMS, Slack, or other uncovered destinations.
- Your marketing site forms (resource downloads, contact forms) are on a separate platform from your patient intake forms so that PHI and non-PHI flows are not blurred.

## What intake forms do not cover

The form vendor captures data. The rest of the compliance program remains your responsibility: policy library, workforce training, incident log, BAA register, and access reviews. For the operating layer see [PHIGuard pricing](/pricing) or the full [HIPAA software comparison](/compare). For the BAA rules behind all of this, see [HIPAA basics](/learn/hipaa-basics/what-is-phi). Clinics also shopping for patient messaging should read our [best HIPAA-compliant secure messaging](/resources/best/best-hipaa-compliant-secure-messaging) roundup.

Intake is the moment where a patient's trust gets tested. Do not run it through a tool that cannot sign a BAA.

## Source Posture and Buying Criteria

Best HIPAA-Compliant Intake Form Software should be evaluated with a conservative source posture: prefer official vendor documentation for BAA availability, HHS or eCFR pages for HIPAA obligations, and the clinic's own contract files for final proof. The source set for this page is Google Workspace: Google Workspace HIPAA Included Functionality; HHS Office for Civil Rights: Business Associates. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. Do not treat marketplace badges, sales copy, or generic security language as proof that a specific plan can receive PHI.

For small clinics, the best option is usually the product that reduces coordination burden while preserving evidence. Jotform HIPAA, Formstack Healthcare, HIPAAtizer, Typeform with BAA setup, and Google Forms under Workspace can all enter the shortlist, but only with the right BAA and configuration. A signed BAA is the starting line, not the full workflow; notifications, exports, integrations, and retention still need review. EHR handoff matters because form responses otherwise become a second PHI silo to audit and delete. Buyers should compare how each tool handles ownership, reminders, user access, audit history, exports, and offboarding rather than ranking products only by feature count.

A practical decision record should name the chosen tool, the approved PHI workflows, the signed BAA location, the owner for admin settings, and the review cadence. If a product is useful but not covered for PHI, document the permitted non-PHI use cases and train staff not to put patient names, appointment details, diagnoses, payment notes, or attachments into that system.
