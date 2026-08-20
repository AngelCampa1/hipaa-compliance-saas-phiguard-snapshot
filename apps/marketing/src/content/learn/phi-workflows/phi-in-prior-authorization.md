---
title: "PHI in Prior Authorization: HIPAA Compliance for Clinic Staff"
seoTitle: "PHI in Prior Authorization"
description: "Prior authorization involves submitting PHI to payers. This guide covers HIPAA transaction standards, minimum necessary submissions, PA denial handling, storage, and verbal payer discussions."
metaDescription: "HIPAA for prior authorization: covered transaction standards under 45 CFR § 162.1302, minimum necessary PHI in PA submissions, denial storage, payer verbal."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Prior authorization submissions are covered HIPAA transactions under 45 CFR § 162.1302. Clinics must apply the minimum necessary standard when submitting clinical information to payers, handle PA denials as PHI, store PA correspondence in the EHR, and avoid tracking PA status in non-secure systems or discussing case details beyond what payer representatives need."
keyTakeaways:
  - "Prior authorization is a covered HIPAA transaction under 45 CFR § 162.1302 — transaction standard requirements apply to electronic PA submissions."
  - "Minimum necessary applies: clinics should submit only the clinical information required to support the specific authorization request, not the patient's full chart."
  - "PA denials contain PHI about the treatment attempted and must be stored in the EHR, not in personal files, shared drives, or unprotected spreadsheets."
  - "Verbal discussions with payer representatives during PA calls are subject to minimum necessary — discuss only what the payer needs to review the request."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR § 162.1302 — Referral Certification and Authorization Transaction Standard"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-162/subpart-N/section-162.1302"
    publisher: "eCFR"
  - title: "45 CFR § 164.502 — Uses and Disclosures of PHI"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "45 CFR § 164.514 — Minimum Necessary Standard"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
faq:
  - q: "Is prior authorization a HIPAA covered transaction?"
    a: "Yes. The referral certification and authorization transaction — which includes prior authorization for treatment — is one of the standard transactions covered under HIPAA's Administrative Simplification provisions at 45 CFR § 162.1302. When a covered entity conducts this transaction electronically with a health plan, both parties must comply with the standard transaction format. This is separate from the Privacy Rule minimum necessary obligations, which also apply."
  - q: "How much clinical information should be included in a PA submission?"
    a: "Only the minimum necessary to support the specific authorization request. Under 45 CFR § 164.514(d), the minimum necessary standard requires limiting disclosures to what is needed for the specific purpose. For a PA for an MRI to evaluate knee pain, the relevant clinical information is the clinical presentation, relevant examination findings, and any prior conservative treatment attempted. Submitting the patient's complete medical history or unrelated diagnoses exceeds what is minimally necessary."
  - q: "Does a payer need a BAA to receive PA submissions?"
    a: "No. Health plan payers receive PA submissions as part of a payment-purpose transaction — covered entities may disclose PHI to health plans for payment purposes without a BAA. Under 45 CFR § 164.502(a)(1)(ii), disclosures for payment do not require authorization or a BAA. The minimum necessary standard still applies to what is disclosed."
  - q: "Can staff track PA status in a personal spreadsheet or sticky note?"
    a: "No. PA tracking materials that contain patient identifiers and treatment information are PHI. They must be maintained in approved, access-controlled systems — the EHR, the clinic's practice management system, or a HIPAA-compliant task management tool. Personal spreadsheets stored on local drives, personal cloud accounts, or paper notes are not compliant PA tracking methods."
---

When a billing coordinator calls a payer to request prior authorization for an MRI, she discloses the patient's name, diagnosis, and treatment history to a payer representative — PHI transmitted verbally, subject to the minimum necessary standard and your clinic's verbal safeguard requirements. Prior authorization is one of the most PHI-intensive administrative processes in a small clinic. Every PA submission involves sending the patient's diagnosis, treatment history, clinical notes, and medication information to a health plan — often via fax, phone, or electronic portal — and waiting for a coverage determination.

Understanding the HIPAA compliance requirements for PA processes helps clinic staff manage them in a way that protects patient information at every step.

## Prior Authorization as a Covered HIPAA Transaction

Under HIPAA's Administrative Simplification provisions, certain electronic transactions between covered entities and health plans must comply with standard formats. The referral certification and authorization transaction is one of these covered transactions, governed by 45 CFR § 162.1302.

When a clinic submits an electronic prior authorization request to a health plan, the transaction must use the ASC X12 278 Health Care Services Review standard if conducted electronically. Both parties must comply with the transaction standard.

**Practical implications for small clinics:**

Most small clinics conduct PA through three channels: phone calls with payer representatives, online payer portals, and occasionally fax. The ASC X12 278 standard applies when the transaction is conducted electronically through an exchange. Phone-based PA does not trigger the transaction standard, but does trigger all other HIPAA obligations — minimum necessary, verbal PHI safeguards, and documentation requirements.

If your EHR or billing system has electronic PA capabilities, confirm that it uses the standard transaction format when submitting to payers that require it.

## Minimum Necessary Standard in PA Submissions

The most important day-to-day HIPAA obligation in the PA process is the minimum necessary standard. Under 45 CFR § 164.514(d), when a covered entity requests or discloses PHI for a specific purpose, the disclosure must be limited to the minimum necessary to accomplish that purpose.

**What this means for PA submissions:**

For a PA request, the purpose is to obtain coverage determination for a specific treatment or medication. The minimum necessary information is what that specific payer requires to evaluate that specific request.

**Minimum necessary examples by PA type:**

| PA Type | Minimum Necessary Information |
|---|---|
| Imaging (MRI, CT) | Clinical presentation, physical exam findings, relevant diagnosis, conservative treatment attempted |
| Specialty medication | Current diagnosis, treatment history relevant to the medication, clinical justification |
| Specialist referral | Reason for referral, relevant clinical history related to the referral condition |
| Surgical procedure | Diagnosis, conservative treatment history, clinical urgency |

**What exceeds minimum necessary:**

- Submitting the patient's complete psychiatric history to support a cardiology PA
- Including unrelated diagnoses and medications not pertinent to the requested treatment
- Sending the full clinical note when only the relevant sections are needed to support the request
- Attaching multi-year chart summaries when the current episode of care is sufficient

Before submitting a PA request, the staff member preparing it should review the submission and confirm that no PHI beyond what the payer requires has been included.

## Verbal PA Discussions with Payer Representatives

PA by phone is a routine part of small clinic operations. These conversations involve verbal disclosure of PHI to the payer — and the minimum necessary standard applies.

When calling a payer to submit or discuss a PA:

1. **Verify the payer representative's identity**: Confirm you are speaking with the health plan's authorization department before disclosing patient information.
2. **Share only what the representative requests**: If the representative asks for the patient's diagnosis and treatment history, provide that. Do not preemptively volunteer additional clinical details.
3. **Avoid clinical analysis beyond the request**: Discussing the patient's full clinical status, other diagnoses, or family history exceeds what is minimally necessary for the PA review.
4. **Conduct the call privately**: PA calls involve PHI. Take them in a location where the conversation cannot be overheard by other patients or unauthorized staff.

Document the call outcome in the patient's chart or PA tracking system — the date, the payer representative name (if available), the PA request number, and the decision or pending status.

## PA Denials as PHI

When a PA is denied, the denial communication from the payer contains PHI: the patient's name, the requested treatment, and the reason for denial. PA denial letters and correspondence must be treated as PHI from the moment they are received.

**What this means operationally:**

- PA denial letters received by fax should be picked up immediately and filed in the patient's record — not left in the fax queue.
- Electronic denial notifications should be routed to the EHR or practice management system, not to a general inbox accessible by all staff.
- PA denials should not be tracked in personal spreadsheets, sticky notes, or unprotected shared documents.
- When a denial is received, review it through the approved system only.

## Storing PA Correspondence in the EHR

All PA correspondence — submission confirmations, authorization numbers, denial letters, appeal submissions, and appeal outcomes — should be documented in the patient's EHR record. This serves both compliance and clinical purposes:

**HIPAA compliance**: PA records are part of the patient's PHI. Storing them in the EHR ensures they are protected by the same access controls, audit logging, and retention schedule as the rest of the patient's record.

**Clinical continuity**: When a patient changes providers or a prior authorization is questioned later, the complete PA history in the EHR provides the documentation trail needed to support the treatment decisions made.

**Billing support**: PA authorization numbers and denial reasoning support billing accuracy and appeals. Filing these in the EHR or the connected practice management system ensures billing staff can access them without creating separate unprotected files.

## Tracking PA Status Without Exposing PHI

PA tracking is an operational necessity — clinics need to know which requests are pending, approved, denied, or appealed. Tracking systems that contain patient identifiers and treatment information are PHI-bearing and must be managed accordingly.

**Compliant PA tracking approaches:**

- **EHR-based tracking**: Most EHR systems have built-in PA tracking functions that are access-controlled and audit-logged.
- **Practice management system tracking**: PA status modules in practice management systems operate within the clinic's security infrastructure.
- **HIPAA-compliant task management tools**: Compliance-focused task management platforms that have signed BAAs with the clinic can be used for PA process management.

**Non-compliant approaches to avoid:**

- Shared spreadsheets in unprotected cloud storage (Google Sheets, Dropbox, personal OneDrive)
- Whiteboards in staff areas listing patient names and PA status
- Paper tracking sheets not stored in a secure location
- Personal email threads tracking PA correspondence

The access control standard at 45 CFR § 164.312(a)(1) requires that only authorized persons access ePHI. An unprotected shared spreadsheet with patient names and PA status violates this requirement.

## Who Can Access PA Records

PA records contain both administrative and clinical PHI. Access should be role-based:

- **Treating providers**: Full access, including clinical documentation submitted and denial reasoning.
- **Billing and PA staff**: Access to authorization status, denial letters, and the clinical documentation that was submitted.
- **Front desk administrative staff**: Typically limited access — they may need to know whether an authorization is in place for an upcoming appointment, but do not need access to the clinical documentation in the PA file.

For a comprehensive view of PHI workflow compliance, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet). For minimum necessary standard principles, see [minimum necessary standard](/learn/hipaa-basics/minimum-necessary-standard).

PHIGuard gives small clinics a compliance task management system to track PA workflow reviews, document minimum necessary policies, and manage PHI access controls — with current pricing. Learn more at [PHIGuard HIPAA](/hipaa).
