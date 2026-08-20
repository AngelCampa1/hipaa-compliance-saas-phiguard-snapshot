---
title: "HIPAA Compliance for California Medical Clinics"
seoTitle: "HIPAA Compliance for California Medical Clinics"
description: "California clinics must comply with HIPAA plus the California CMIA (Civil Code Section 56), the Health & Safety Code Section 1280.15 medical breach notification timeline, a private right of action, and broader scope than HIPAA. This guide covers both frameworks and what California clinics must do."
metaDescription: "HIPAA compliance for California clinics: CMIA context, medical breach notification, mental health privacy, vendor evidence, and action steps."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "California medical clinics face some of the most demanding state health privacy obligations in the country. The California Confidentiality of Medical Information Act (CMIA, Civil Code Section 56 et seq. ) creates a private right of action; California Health & Safety Code Section 1280. 15 imposes a 15-business-day medical breach notification deadline on licensed clinics and health facilities."
keyTakeaways:
  - "California Health & Safety Code Section 1280.15 requires licensed clinics, health facilities, agencies, and hospices to report any unlawful or unauthorized access, use, or disclosure of medical information to CDPH and to the affected patient no later than 15 business days after detection - substantially tighter than HIPAA's 60-day ceiling."
  - "CMIA gives patients a private right of action under Civil Code Section 56.36(b), with $1,000 in nominal damages per negligent violation plus the additional remedies authorized by Section 56.35 - HIPAA has no equivalent."
  - "CMIA covers a broader set of entities than HIPAA, including employers receiving medical information, contractor entities, and non-covered-entity healthcare adjacent businesses."
  - "California's Lanterman-Petris-Short Act (Welfare & Institutions Code Section 5328) restricts mental health records for involuntary detention patients - stricter than HIPAA's psychotherapy note protections."
  - "When a personal-information breach affects more than 500 California residents, Civil Code Section 1798.82(f) requires the entity to submit a sample notice to the California AG."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "California Confidentiality of Medical Information Act - Civil Code Section 56 et seq."
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=56.&lawCode=CIV"
    publisher: "California Legislature"
  - title: "Health & Safety Code Section 1280.15 - Medical Breach Notification"
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=HSC&sectionNum=1280.15"
    publisher: "California Legislature"
  - title: "Civil Code Section 56.36 - CMIA Private Right of Action"
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=56.36&lawCode=CIV"
    publisher: "California Legislature"
  - title: "Civil Code Section 1798.82 - California Breach Notification"
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1798.82&lawCode=CIV"
    publisher: "California Legislature"
  - title: "California Lanterman-Petris-Short Act - Welfare & Institutions Code Section 5328"
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=5328.&lawCode=WIC"
    publisher: "California Legislature"
  - title: "45 CFR Parts 160 and 164 - HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
faq:
  - q: "What is California's 15-business-day medical breach notification requirement?"
    a: "Health & Safety Code Section 1280.15 requires any licensed clinic, health facility, agency, or hospice that suffers an unlawful or unauthorized access, use, or disclosure of a patient's medical information to report the incident to CDPH and to the affected patient no later than 15 business days after detection. This is materially tighter than HIPAA's 60-day ceiling, and it is a state licensing obligation distinct from HIPAA's Breach Notification Rule."
  - q: "What does CMIA's private right of action allow patients to do?"
    a: "Under Civil Code Section 56.36(b), a patient whose medical information was negligently released may bring a civil action for actual damages plus $1,000 in nominal damages for each violation, without having to prove actual harm. Civil Code Section 56.35 additionally authorizes punitive damages (capped at $3,000) and attorney's fees (capped at $1,000) where applicable. A patient can sue the clinic directly without waiting for OCR or the California AG to act."
  - q: "Does CMIA require specific protection for mental health records?"
    a: "Yes. The Lanterman-Petris-Short Act (Welfare & Institutions Code Section 5328) protects records of persons who have received services for mental health conditions. The LPS Act restricts disclosure of these records more broadly than HIPAA's psychotherapy note provisions, requiring patient consent for most disclosures and limiting the treatment-coordination exception. California clinics providing mental health services or treating patients who have received inpatient psychiatric services must implement separate disclosure controls for LPS records."
  - q: "How does the California CMIA interact with CCPA/CPRA?"
    a: "The California Consumer Privacy Act (Civil Code Section 1798.100 et seq.) and its amendment, the California Privacy Rights Act, exempt PHI held by HIPAA-covered entities in their capacity as such. However, health information outside covered transactions may be subject to CPRA. California clinics with wellness programs, direct-to-consumer health services, or other non-covered health data streams should assess CPRA applicability alongside CMIA and HIPAA."
---

California imposes the most demanding state health privacy requirements in the country. A California medical clinic subject to HIPAA must also comply with the California Confidentiality of Medical Information Act (CMIA), the Health & Safety Code Section 1280.15 medical breach notification timeline, the Lanterman-Petris-Short Act for mental health records, and - for non-HIPAA health data - potentially the California Privacy Rights Act. CMIA's private right of action and Section 1280.15's 15-business-day medical breach deadline make California compliance materially higher-stakes than HIPAA compliance alone.

## HIPAA Baseline Requirements

Every California clinic that transmits health information electronically in connection with covered transactions is a HIPAA-covered entity and must maintain:

- A documented risk analysis and risk management program under 45 CFR Section  164.308(a)(1)
- Administrative, physical, and technical safeguards under 45 CFR Sections  164.308-164.316
- Business associate agreements with all business associates handling PHI, per 45 CFR Section  164.502(e)
- A Notice of Privacy Practices provided to patients at first service delivery
- Workforce training on privacy policies under 45 CFR Section  164.530(b)
- Breach notification procedures meeting the Breach Notification Rule at 45 CFR Part 164, Subpart D

These are the floor. In California, the floor is higher in several respects.

## California CMIA: Key Requirements

CMIA, codified at California Civil Code sections 56 through 56.37, predates HIPAA and creates independent obligations. For a comprehensive analysis of how CMIA differs from HIPAA across all dimensions, see [California CMIA vs HIPAA](/learn/compliance-operations/california-cmia-vs-hipaa). This section covers the action items most directly relevant to clinic operations.

### 15-business-day medical breach notification

Health & Safety Code Section 1280.15 requires licensed clinics, health facilities, agencies, and hospices to report any unlawful or unauthorized access, use, or disclosure of medical information to the California Department of Public Health (CDPH) and to the affected patient no later than 15 business days after detection. This is substantially tighter than HIPAA's 60-day ceiling and runs independently of HIPAA's Breach Notification Rule.

When a personal-information breach affects more than 500 California residents, Civil Code Section 1798.82(f) additionally requires the entity to submit a sample copy of the breach notice to the California AG. AG submission is a separate obligation from patient notification and must be tracked independently.

### Private right of action

Civil Code Section 56.36(b) allows patients to bring direct civil actions for unauthorized disclosure of medical information. Damages include $1,000 in nominal damages per negligent release plus actual damages; Section 56.35 separately authorizes punitive damages (capped at $3,000) and attorney's fees (capped at $1,000). There is no requirement for the patient to first file an OCR complaint - a California patient can sue a clinic the day after a breach notification is received.

This private right of action makes California breach notifications consequential in a way that breach notifications in other states are not. Your breach notification to patients is simultaneously a notice to potential plaintiffs. Your documentation of the response - what you did, when, and why - becomes potential litigation evidence the day the notification is sent.

### Employer-scope and contractor obligations

CMIA extends to employers that receive medical information about employees, and to contractor entities that create or maintain medical information on behalf of healthcare providers. California clinics that operate occupational health services, employee health programs, or return-to-work evaluation services face CMIA obligations for those programs that are distinct from their obligations as HIPAA-covered clinical providers.

## Mental Health Records: The Lanterman-Petris-Short Act

Welfare & Institutions Code Section 5328 governs the confidentiality of records for individuals who have received mental health services in California - including both inpatient psychiatric services and outpatient mental health treatment. The LPS Act restricts disclosure of these records more tightly than HIPAA's psychotherapy note provisions at 45 CFR Section  164.508(a)(2).

Under Section 5328, records of persons who have received mental health services may not be disclosed without the individual's written consent except in specifically enumerated circumstances, including:

- Coordinated care for individuals in current mental health treatment, when the receiving provider is directly involved
- Mandatory reporting of danger to an identified third party (Tarasoff duty)
- Court proceedings as specifically authorized
- Certain state agency oversight purposes

The LPS Act's restrictions apply to all mental health records, not just psychotherapy notes as HIPAA defines them. A California clinic that provides psychiatric medication management, behavioral health counseling, or coordinates care for patients with a mental health history must maintain LPS-compliant disclosure controls. Standard HIPAA TPO authorization does not satisfy the LPS Act for California mental health records.

## California AG Enforcement

California medical privacy enforcement involves multiple agencies: OCR at the federal level, the California AG for CMIA and HIPAA enforcement, and the California Department of Public Health for healthcare facility licensing issues. The California AG's office has active enforcement programs and has brought CMIA enforcement actions.

California's enforcement posture means a California clinic faces three potential enforcement pathways for a single PHI breach: OCR civil monetary penalties, California AG enforcement, and private CMIA civil litigation. Documented compliance reduces exposure on all three pathways.

## Five Action Items for California Clinics

**1. Reset your medical breach notification timeline to 15 business days.** Update your incident response plan to treat the Section 1280.15 15-business-day notification requirement as the governing deadline for California medical breaches. Build in the AG submission trigger under Civil Code Section 1798.82(f) for personal-information breaches affecting more than 500 California residents. See the [HIPAA breach notification templates](/learn/compliance-operations/hipaa-breach-notification-templates) as a starting point - modify them to reflect California's deadlines.

**2. Document CMIA training.** Train all workforce members - particularly front desk, medical records, and clinical staff - on CMIA's requirements, including the Section 56.36(b) private right of action and the Section 1280.15 medical breach deadline. Document the training.

**3. Implement LPS Act controls for mental health records.** If your clinic provides mental health services or treats patients with mental health history, implement segregated access controls for LPS records and a mandatory authorization review step for all LPS record disclosures.

**4. Review employer-related health information handling.** If your clinic provides occupational health services, employee physicals, or return-to-work evaluations, assess whether CMIA's employer-related provisions apply to those programs and whether your consent forms and disclosure authorizations satisfy CMIA requirements.

**5. Maintain current risk analysis documentation.** A documented, current risk analysis is the foundation of both HIPAA Security Rule compliance and CMIA compliance. Use the [HIPAA risk analysis worksheet](/resources/hipaa-risk-analysis-template) as a starting framework and ensure the analysis is updated whenever significant operational changes occur.

PHIGuard supports California clinics in maintaining the audit trails, policy documentation, and breach response infrastructure that HIPAA and CMIA require - with current plan details published on the pricing page. With California's private right of action in play, documented compliance is active risk management. See [PHIGuard's HIPAA compliance tools](/hipaa) or review [pricing options](/pricing).
