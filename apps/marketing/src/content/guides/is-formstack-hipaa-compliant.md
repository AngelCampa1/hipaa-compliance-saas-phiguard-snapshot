---
title: "Is Formstack HIPAA Compliant for Patient Data Collection?"
vendor: "Formstack"
seoTitle: "Is Formstack HIPAA Compliant?"
description: "What clinics need to know about Formstack's HIPAA BAA availability, which plan qualifies, and how to use Formstack for patient intake, consent forms, and clinical data collection in a compliant way."
metaDescription: "Is Formstack HIPAA compliant? Yes — on the Workspace plan with a signed BAA. Learn how clinics can use Formstack for patient intake and consent forms legally."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Formstack is one of the stronger HIPAA-compliant form options for clinics. Formstack offers a BAA on its Workspace plan and is specifically designed for healthcare intake, consent forms, and patient data collection. Audit logging, access controls, and data encryption are built into the platform. Clinics must use the Workspace plan — not lower tiers — and must execute the BAA before collecting any PHI through Formstack forms."
keyTakeaways:
  - "Formstack offers a HIPAA BAA on its Workspace plan — one of the more clinic-friendly form tools for compliant data collection."
  - "Lower Formstack plans (Starter, Teams) do not include a BAA and must not be used for PHI collection."
  - "Formstack Workspace includes encryption at rest and in transit, access controls, and audit logging required for HIPAA compliance."
  - "The BAA must be executed before any patient data is collected through Formstack — the plan alone is not sufficient."
  - "Formstack is designed specifically for healthcare forms including intake, consent, insurance verification, and clinical assessments."
sources:
  - title: "HIPAA Compliant Forms"
    url: "https://www.formstack.com/features/hipaa-compliant-forms"
    publisher: "Formstack"
  - title: "Privacy Policy"
    url: "https://www.formstack.com/legal/website-privacy-policy"
    publisher: "Formstack"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can a small clinic use Formstack for patient intake without signing a BAA?"
    a: "No. If the form collects PHI — patient names, dates of birth, health conditions, insurance information, or any other identifiers combined with health data — a signed BAA is required regardless of the plan. The Workspace plan enables BAA execution; the lower plans do not. Using any form without a BAA to collect PHI is a HIPAA violation."
  - q: "What types of forms can clinics build with Formstack for healthcare?"
    a: "Patient intake forms, medical history questionnaires, consent and authorization forms, appointment request forms, insurance verification forms, clinical assessment tools, patient satisfaction surveys, and HIPAA authorization forms. Formstack's healthcare-specific templates support many of these use cases."
  - q: "Does Formstack integrate with EHR systems?"
    a: "Formstack offers integrations with various healthcare and business systems, but specific EHR integrations vary. When connecting Formstack to an EHR or other system that holds PHI, ensure that the integration path also maintains HIPAA compliance — the receiving system must also be covered."
  - q: "Is Formstack Documents (formerly WebMerge) also HIPAA compliant?"
    a: "Formstack's product suite includes several tools beyond the core forms platform. Confirm with Formstack which products are covered under the Workspace plan BAA. Do not assume all Formstack products under the same account are automatically HIPAA-covered."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Yes — Formstack can be HIPAA compliant. Formstack is one of the more capable and thoughtfully designed options for clinics that need to collect patient data through digital forms. The platform offers a BAA on its Workspace plan, includes the required security features, and is specifically built with healthcare use cases in mind. The clinic must be on the Workspace plan and must execute the BAA before collecting any PHI.

## BAA availability

Formstack offers a HIPAA BAA through its **Workspace plan**. This is a direct, documented offering — not a special negotiation or an enterprise-only arrangement that requires a large contract.

Lower Formstack plans — including Starter and Teams — do not include a BAA and are not HIPAA-eligible for PHI collection. Before deploying any form that will collect patient health information, confirm that your account is on the Workspace plan and that the BAA has been signed.

To execute the BAA, work with Formstack's support or sales team. The BAA terms are part of Formstack's healthcare compliance offering.

## Why form tools are a HIPAA compliance priority for clinics

Digital forms have largely replaced paper intake processes at most clinics. Patients complete health history questionnaires, consent forms, insurance verification, and medical history updates online before appointments. Every one of those form submissions contains PHI.

The form tool is the point where patient data first enters your digital environment. If the tool does not have a BAA, that first collection point is unprotected. A breach at the form submission level is both a regulatory and a reputational problem.

Clinics often underestimate form tool risk because forms feel like a simple website feature. They are not — they are a data intake mechanism for some of the most sensitive information your clinic handles.

## What Formstack Workspace includes

The Workspace plan provides the compliance infrastructure that HIPAA requires:

**Encryption.** Formstack encrypts data at rest and in transit using current encryption standards. Form submissions containing PHI are protected in storage.

**Access controls.** Workspace administrators can manage user roles and permissions to restrict who can view, edit, and export form submissions. Minimum necessary access principles can be applied at the user level.

**Audit logging.** Formstack maintains logs of access and activity on form submissions, which supports the audit trail requirements under the HIPAA Security Rule.

**Data residency.** Formstack stores data in the United States. Confirm with Formstack the current data residency options for your account.

**Healthcare-specific features.** Formstack has built-in features for healthcare forms: HIPAA consent checkboxes, e-signature support, conditional logic for clinical assessments, and form templates designed for healthcare intake.

## Compliant form-building practices

A BAA and the right plan are necessary but not sufficient. The forms themselves must be designed to minimize PHI collection risk:

**Collect only what you need.** HIPAA's minimum necessary standard applies to PHI collection, not just PHI access. Build forms that collect the information required for the clinical purpose, not every field that might be convenient.

**Restrict submission access.** Configure form submission viewing permissions so that only the staff members who need to see responses can access them. Formstack's access controls make this possible — use them.

**Set submission retention policies.** Do not accumulate patient form submissions indefinitely. Establish a documented retention period for form data and remove submissions that are no longer needed for their original clinical purpose.

**Avoid embedding forms on non-secure pages.** If your clinic website has a Formstack intake form, ensure that the embedding page also meets basic security standards. PHI submitted through a form on an HTTP (not HTTPS) page has additional exposure at the point of transmission.

**Test with synthetic data.** When building and testing new forms, use synthetic patient data — not real patient information. Development and staging environments should never contain real PHI.

## Formstack for specific healthcare form types

**Patient intake.** Formstack is well-suited for pre-visit intake packets. Demographics, health history, current medications, insurance information, and primary care relationships can all be captured through structured Formstack forms.

**Consent and authorization.** Clinical consent forms require a signature and a timestamp. Formstack's e-signature integration supports this use case. Ensure your consent form language meets your state's requirements and your clinic's legal review.

**Insurance verification.** Collecting insurance carrier, member ID, and subscriber information through Formstack before appointments is a common use case. Ensure the data is exported into your practice management system promptly and that raw form submissions are not retained longer than necessary.

**Clinical assessments.** Standardized assessments — depression screening, functional status questionnaires, pain scales — can be delivered through Formstack with conditional logic and scored automatically. Ensure assessment results are routed to the appropriate clinical staff.

**Satisfaction surveys.** Post-visit surveys that ask about the care experience without soliciting health information are generally lower risk. If the survey asks patients to describe their health concerns or treatment outcomes, it may collect PHI.

## What PHIGuard adds alongside Formstack
