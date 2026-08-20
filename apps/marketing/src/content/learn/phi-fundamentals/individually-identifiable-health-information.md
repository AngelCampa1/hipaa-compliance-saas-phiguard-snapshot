---
title: "Individually Identifiable Health Information: HIPAA Definition"
seoTitle: "Individually Identifiable Health Info"
description: "The HIPAA definition of individually identifiable health information (IIHI), how it relates to PHI, the 18 identifiers, and why the distinction matters beyond HIPAA."
metaDescription: "Individually identifiable health information (IIHI) is the parent category of PHI under HIPAA. 45 CFR § 160.103. Learn the definition and how IIHI and PHI."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-fundamentals"
schemaType: "defined-term"
term: "Individually Identifiable Health Information"
intent: "awareness"
summary: "Individually identifiable health information (IIHI) is health information that identifies or could reasonably be used to identify an individual. 45 CFR § 160.103. IIHI is the broader parent category; PHI is IIHI that is created, received, transmitted, or maintained by a covered entity or business associate. IIHI held by non-covered entities may still be subject to state law."
keyTakeaways:
  - "IIHI is broader than PHI — all PHI is IIHI, but not all IIHI is PHI."
  - "IIHI becomes PHI when it is created, received, transmitted, or maintained by a HIPAA-covered entity or business associate."
  - "The 18 Safe Harbor identifiers define the categories of information that must be removed to de-identify PHI."
  - "State laws may protect IIHI held by non-covered entities, meaning HIPAA exemption does not equal freedom from all privacy obligation."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 160.103 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "HHS / eCFR"
  - title: "Guidance Regarding Methods for De-identification of PHI"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
    publisher: "HHS"
faq:
  - q: "A wellness app collects health data from users. Is that data IIHI or PHI?"
    a: "The health data collected by a wellness app is IIHI — it is health information about identifiable individuals. Whether it is PHI depends on whether the app is operated by or on behalf of a HIPAA covered entity or business associate. Most consumer wellness apps are not operated by covered entities, so their data is IIHI that is not PHI under HIPAA. However, some state laws (including California's CCPA and health-specific state laws) may still apply."
  - q: "What is the practical difference between knowing something is IIHI vs. PHI?"
    a: "For HIPAA purposes, the distinction determines which regulatory framework applies. IIHI held by a covered entity is PHI — and the full Privacy Rule, Security Rule, and Breach Notification Rule apply. IIHI held by a non-covered entity is outside HIPAA's scope, though state law may still impose obligations. For a covered entity, the IIHI/PHI distinction rarely matters in practice because the entity's health information is PHI by definition."
  - q: "If we de-identify PHI, does it remain IIHI?"
    a: "Under the HIPAA de-identification standards (45 CFR § 164.514(a)), de-identified health information is health information from which all 18 identifying elements have been removed and from which there is no reasonable basis to believe the information can be used to re-identify an individual. De-identified information is no longer IIHI under HIPAA because it no longer meets the identifiability standard. It is therefore not PHI and is not subject to HIPAA Privacy Rule requirements."
---

Individually identifiable health information (IIHI) is the broader parent category of protected health information under HIPAA — defined in 45 CFR § 160.103 as health information that identifies or could reasonably be used to identify a specific individual. All PHI is IIHI, but not all IIHI is PHI. The determining factor is who holds the information: IIHI becomes PHI when a HIPAA-covered entity or business associate creates, receives, transmits, or maintains it.

**Small-clinic example:** A patient's blood pressure readings stored in your EHR are PHI — your clinic is a covered entity and you hold the information. The same patient's blood pressure readings logged in a consumer health app are IIHI but not PHI, because the app developer is not a covered entity. HIPAA does not govern the app developer's handling of that data, though California and other state laws may.

## The Regulatory Definition

Under 45 CFR § 160.103, **individually identifiable health information** is:

> "Information that is a subset of health information, including demographic information collected from an individual, and: (1) Is created or received by a health care provider, health plan, employer, or health care clearinghouse; and (2) Relates to the past, present, or future physical or mental health or condition of an individual; the provision of health care to an individual; or the past, present, or future payment for the provision of health care to an individual; and (i) That identifies the individual; or (ii) With respect to which there is a reasonable basis to believe the information can be used to identify the individual."

The key elements: the information must relate to a person's health condition, healthcare received, or payment for healthcare; it must identify or be reasonably traceable to a specific person; and it must have been created or received by a healthcare provider, health plan, employer, or clearinghouse.

Note that the definition includes information received by **employers** — not just healthcare entities. This is significant for understanding what IIHI exists outside the traditional clinical context.

## IIHI as the Parent Category of PHI

IIHI and PHI have a parent-child relationship. All PHI is IIHI, but not all IIHI is PHI.

**PHI** (45 CFR § 160.103) is individually identifiable health information that is transmitted by electronic media, maintained in electronic media, or transmitted or maintained in any other form or medium — **and** that is held or transmitted by a **covered entity** or its **business associate**.

The critical limiting factor is the covered entity requirement. IIHI becomes PHI when a covered entity or business associate holds it. IIHI held by entities that are not covered entities — a direct-to-consumer health app, an employer's human resources department (with an exception for group health plan functions), a school nurse — is IIHI but not PHI under HIPAA.

This means:
- A hospital's patient records are PHI — the hospital is a covered entity
- A consumer fitness app's health data is IIHI — the app is not a covered entity in most cases
- A self-insured employer's health records for employees fall in a complex middle ground — the health plan function is a covered entity, but the employer's general HR records are not

For the complete definition of what constitutes PHI and how the 18 Safe Harbor identifiers work in practice, see [what is PHI](/learn/hipaa-basics/what-is-phi) and [18 HIPAA identifiers](/learn/phi-fundamentals/18-hipaa-identifiers).

## The Identifiability Standard

IIHI includes information that either directly identifies an individual **or** for which there is a "reasonable basis to believe" it can be used to identify the individual. This extends beyond direct-identification tests.

Information that does not name a patient can still be IIHI if it is reasonably traceable to a specific person. A combination of ZIP code, date of birth, and sex can identify a large percentage of individuals in a database — this has been demonstrated empirically in re-identification research. A description of a highly unusual medical condition at a small specialty clinic can make it possible to identify the patient even without a name. Photographs showing a patient's face or distinctive physical features are identifying.

The "reasonable basis to believe" standard means your clinic cannot assume information is non-identifying simply because a name has been removed. The full de-identification analysis — through either the expert determination method or the safe harbor method — is required before treating health information as non-IIHI.

## When IIHI Is Not PHI: The Non-Covered Entity Situation

The gap between IIHI and PHI is operationally significant in several contexts.

**Consumer health technology.** Wearable devices, health apps, and direct-to-consumer health testing services collect large amounts of IIHI that is not PHI because those companies are not covered entities. HIPAA does not govern that data. State consumer privacy laws — including California's CCPA and health-specific state laws — may apply, but the HIPAA framework does not.

**Employer wellness programs.** Employers running wellness programs may collect health information about employees. When that information does not flow through the group health plan (a covered entity), it may not be PHI — the employer as employer is not a covered entity. However, employers who use the information for employment decisions face risk under disability discrimination law (ADA), not just privacy law.

**School health records.** School nurse records for K-12 students are governed by FERPA (the Family Educational Rights and Privacy Act), not HIPAA, even though they contain health information. They are IIHI but not PHI under HIPAA.

**Research data.** Research databases that have been properly de-identified under HIPAA's safe harbor or expert determination methods no longer contain IIHI because the identifiability requirement has been satisfied. Coded datasets where the code could be used to re-identify individuals retain IIHI status.

## The 18-Identifier Safe Harbor

HIPAA's de-identification safe harbor (45 CFR § 164.514(b)) specifies 18 categories of identifiers that must be removed from health information before it can be treated as de-identified — and therefore no longer IIHI or PHI.

The 18 identifiers are the categories HIPAA has determined create a reasonable basis for identification when combined with health information. They include:

- Names
- Geographic data smaller than state (including ZIP codes)
- Dates directly related to an individual (except year)
- Phone numbers
- Fax numbers
- Email addresses
- Social security numbers
- Medical record numbers
- Health plan beneficiary numbers
- Account numbers
- Certificate/license numbers
- Vehicle identifiers and serial numbers
- Device identifiers and serial numbers
- Web URLs
- IP addresses
- Biometric identifiers
- Full-face photographs and comparable images
- Any other unique identifying number, characteristic, or code

For the complete definition and analysis of each identifier, see [18 HIPAA identifiers](/learn/phi-fundamentals/18-hipaa-identifiers).

## State Law Protection of IIHI Beyond HIPAA

IIHI held by a non-covered entity is outside HIPAA's scope but is not without legal protection. State laws increasingly govern health information privacy for entities that are not HIPAA-covered.

California's Confidentiality of Medical Information Act (CMIA) applies to entities that create, maintain, preserve, store, abandon, destroy, or dispose of medical information — including non-covered entities. It creates a cause of action for individuals whose medical information is negligently released. The California Consumer Privacy Act (CCPA) applies to health information collected by businesses that meet CCPA threshold requirements, regardless of HIPAA status.

Many other states have enacted or are enacting health information-specific statutes that extend protections to IIHI beyond the covered entity population. The legislative trend is toward broader coverage.

For covered entities — which hold PHI by definition — this state law complexity adds a compliance layer beyond HIPAA. The HIPAA preemption framework (see [HIPAA preemption](/learn/hipaa-basics/hipaa-preemption)) governs how those state laws interact with your clinic's HIPAA obligations.

PHIGuard's compliance platform supports PHI data classification and helps small clinics maintain HIPAA compliance across their operations. See [PHIGuard's HIPAA page](/hipaa).
