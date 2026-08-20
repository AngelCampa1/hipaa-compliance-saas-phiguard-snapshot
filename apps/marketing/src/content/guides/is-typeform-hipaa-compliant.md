---
title: "Is Typeform HIPAA Compliant for Small Clinics?"
vendor: "Typeform"
seoTitle: "Is Typeform HIPAA Compliant?"
description: "A direct answer for clinics considering Typeform for intake or screening forms, including BAA setup, plan scope, and safer workflow checks."
metaDescription: "Is Typeform HIPAA compliant? Typeform now publishes a BAA setup path for medical forms. Learn what clinics must verify first."
publishedAt: 2026-04-24
updatedAt: 2026-05-08
verificationDate: 2026-05-08
summary: "Typeform now publishes a HIPAA-friendly medical forms path and says clinics must set up a Business Associate Agreement before building medical forms. That is a meaningful change from treating Typeform as a non-HIPAA form builder, but it does not make every Typeform account or integration safe for PHI. Clinics must confirm the plan, BAA, storage, AI, notification, and integration scope in writing before collecting patient information."
keyTakeaways:
  - "Typeform now publishes a healthcare/medical-form path that requires setting up a BAA before collecting medical information."
  - "Do not use a casual Typeform workspace, consumer setup, or unverified integration chain for PHI."
  - "Names, contact details, symptoms, visit reasons, insurance fields, and a person's relationship with a clinic can all create PHI in a form."
  - "Verify current BAA availability, feature scope, data storage, AI settings, and integrations directly with Typeform before purchase or go-live."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/compare"
sources:
  - title: "Medical Survey: Build HIPAA-Friendly Patient Surveys"
    url: "https://www.typeform.com/guides/medical-survey"
    publisher: "Typeform"
  - title: "Built for teams who take data security seriously"
    url: "https://www.typeform.com/admin-security"
    publisher: "Typeform"
  - title: "Jotform HIPAA"
    url: "https://www.jotform.com/hipaa/"
    publisher: "Jotform"
  - title: "Formstack Healthcare"
    url: "https://www.formstack.com/industries/healthcare"
    publisher: "Formstack"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinic use Typeform for patient intake?"
    a: "Potentially, but only after setting up a BAA with Typeform and confirming the account, features, integrations, notifications, and data retention controls are appropriate for PHI."
  - q: "Can we just avoid asking for obvious PHI in a Typeform and call it safe?"
    a: "No. Names combined with contact details and the fact that someone is a patient of a specific clinic can already be PHI. The form vendor becomes a business associate when it handles that data on behalf of a covered entity."
  - q: "Are embedded Typeforms on our website any different?"
    a: "No. The embed still submits answers into Typeform's infrastructure. Embedding does not change who processes the data, whether the BAA is in place, or whether integrations are covered."
  - q: "Which alternatives do small clinics usually compare?"
    a: "Jotform's HIPAA offering, Formstack Healthcare, HIPAAtizer, and Google Forms under a properly configured Google Workspace BAA are common comparisons. Confirm plan, pricing, and BAA scope directly before purchase."
---

## The short answer

Typeform can enter the HIPAA intake shortlist now, but only through a verified healthcare setup with a signed BAA. Typeform's medical survey guidance says a BAA must be set up before building medical forms, and its security page now markets HIPAA support for sensitive health and personal data.

That does not mean any Typeform workspace is automatically safe for PHI. A clinic must verify the exact plan, BAA status, storage location, AI settings, integrations, notification behavior, and retention settings before collecting patient intake, screening, or scheduling data.

## What changed in Typeform's public posture

The important change is that Typeform now publicly describes a medical-form use case and directs healthcare users to set up a BAA before collecting medical information. That shifts the answer from "do not use Typeform for PHI" to "use only if the healthcare BAA and configuration are in place."

For a clinic, the evidence file should include:

- the executed BAA
- the Typeform account or workspace covered by that BAA
- the form names or workflows approved for PHI
- any integrations enabled on those forms
- notification and export settings
- retention and deletion settings

If any of those pieces are missing, hold the form out of production until the vendor posture is clear.

## Why "we only ask for a name and email" is not a safe workaround

A common misread is that a form is only a PHI surface when it asks for obvious clinical details. That is not how HIPAA works. When a form is used by a covered entity to collect information about someone's relationship to the practice, the combination of identity plus the fact of treatment can be protected. See [PHI in scheduling and intake forms](/learn/phi-workflows/phi-in-scheduling-and-intake-forms) for a fuller walk-through.

## Plan and feature requirements

Before a Typeform intake form goes live, confirm:

1. **BAA execution.** The BAA is signed and names the correct clinic account.
2. **Form scope.** The specific forms collecting PHI are covered by the account and BAA.
3. **Integrations.** Connected tools such as Google Drive, CRMs, calendars, email platforms, Zapier, or webhooks are either BAA-covered or excluded from PHI forms.
4. **Notifications.** Email or SMS notifications do not include patient answers or PHI.
5. **AI settings.** Any Typeform AI features are reviewed for PHI handling and disabled if they are not covered.
6. **Retention.** The clinic can export, delete, and document submission retention.

## Real-world setup caveats

**Embeds do not change anything.** An iframe or script embed on a clinic website still submits answers into Typeform's infrastructure. The BAA and account configuration still determine whether the workflow is appropriate.

**Third-party JavaScript on intake pages.** Clinic intake pages and patient portals should avoid third-party analytics, pixels, and session replay scripts. OCR has been explicit about tracking technologies on patient-facing pages. Build intake on a toolchain that is HIPAA-aware all the way down.

**Historical submissions.** If the clinic collected PHI through Typeform before a BAA was in place, document the scope, preserve the review, migrate the workflow, and involve counsel or compliance leadership to determine whether notification obligations are triggered.

## Recommended comparisons

For a small clinic, Typeform should be compared against other BAA-covered intake paths:

- **Jotform HIPAA.** Healthcare-specific plan tier, published HIPAA product page, and BAA availability on qualifying plans.
- **Formstack Healthcare.** Healthcare-focused product line with HIPAA-aligned features and BAA availability.
- **HIPAAtizer.** Purpose-built HIPAA form product for smaller practices.
- **Google Forms under Workspace.** Possible under a paid Google Workspace account with the HIPAA Business Associate Addendum accepted and controls configured.

These are named as real public options, not as endorsements of a specific feature set. Confirm plan, pricing, BAA language, and in-scope features directly with each vendor at time of purchase. See [When a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) for how to run that conversation.

## When form software is the wrong layer

Forms are an input channel. They are not a compliance program. A HIPAA-ready intake form still needs a downstream home: an EHR, a patient record, or a compliance operating system that logs who saw what and when. The form vendor decision is a small piece of a broader stack. The [PHIGuard comparison](/compare) covers the rest.

## Bottom line

Typeform may be usable for PHI only after the clinic sets up a BAA and verifies the full workflow. Do not use an unverified Typeform workspace for patient intake. Sign the BAA before go-live, review the connected systems, and document the decision in the clinic's vendor inventory.

For an adjacent forms comparison, see [Best HIPAA-compliant intake form software](/resources/best/best-hipaa-compliant-intake-form-software).
