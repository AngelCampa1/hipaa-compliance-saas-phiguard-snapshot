---
title: "Illinois PIPA and HIPAA: What Illinois Clinics Must Know"
seoTitle: "Illinois PIPA vs. HIPAA for Clinics"
description: "Illinois clinics must comply with both HIPAA and the Illinois Personal Information Protection Act (PIPA). PIPA's 45-day breach notification deadline and the Mental Health and Developmental Disabilities Confidentiality Act impose requirements HIPAA alone does not cover."
metaDescription: "Illinois PIPA vs. HIPAA: 45-day breach notification, mental health record protections, and what Illinois clinics must do beyond their HIPAA program."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "Illinois clinics face a layered compliance obligation: HIPAA sets the federal floor, the Illinois Personal Information Protection Act (815 ILCS 530) imposes a 45-day breach notification deadline stricter than HIPAA's 60-day ceiling, and the Mental Health and Developmental Disabilities Confidentiality Act (740 ILCS 110) places significantly tighter restrictions on mental health records than HIPAA requires. Clinics must operate under all three frameworks simultaneously."
keyTakeaways:
  - "PIPA (815 ILCS 530) requires Illinois clinics to notify affected residents of a data breach within 45 days — shorter than HIPAA's 60-day ceiling."
  - "Health insurance information is protected personal information under PIPA, extending breach notification obligations beyond the PHI categories HIPAA addresses."
  - "The Mental Health and Developmental Disabilities Confidentiality Act (740 ILCS 110) restricts mental health record disclosures more tightly than HIPAA — most disclosures require explicit written consent from the patient."
  - "Illinois clinics that collect biometric identifiers (fingerprint, retina scans, voiceprints) for staff or patient access control must comply with the Illinois Biometric Information Privacy Act (740 ILCS 14)."
  - "Illinois has no general private right of action under PIPA, but the Illinois AG may investigate and bring enforcement actions, and violations of BIPA carry a $1,000–$5,000 statutory damages provision per violation."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "Illinois Personal Information Protection Act (815 ILCS 530)"
    url: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2702&ChapterID=67"
    publisher: "Illinois General Assembly"
  - title: "Mental Health and Developmental Disabilities Confidentiality Act (740 ILCS 110)"
    url: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=1584&ChapterID=57"
    publisher: "Illinois General Assembly"
  - title: "Illinois Biometric Information Privacy Act (740 ILCS 14)"
    url: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004&ChapterID=57"
    publisher: "Illinois General Assembly"
  - title: "45 CFR Parts 160 and 164 — HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
faq:
  - q: "How does Illinois PIPA's breach notification deadline compare to HIPAA?"
    a: "HIPAA's Breach Notification Rule (45 CFR § 164.404) requires covered entities to notify affected individuals without unreasonable delay and no later than 60 days after discovering a breach. Illinois PIPA (815 ILCS 530/10), as amended in 2021, requires notification to Illinois residents in the most expedient time possible and without unreasonable delay, but sets a 45-day outer limit. For Illinois clinics, the 45-day PIPA deadline is the governing outer limit for breaches affecting Illinois residents."
  - q: "Does the Mental Health and Developmental Disabilities Confidentiality Act apply to all Illinois healthcare providers?"
    a: "Yes. The MHDDCA (740 ILCS 110) applies to any therapist — defined broadly to include physicians, psychologists, social workers, and any other person who provides mental health or developmental disabilities services — and to records or communications they generate. A general medical clinic that provides any mental health services, including medication management for psychiatric conditions, must comply with the MHDDCA for those records."
  - q: "When does BIPA apply to a medical clinic?"
    a: "BIPA (740 ILCS 14) applies when a clinic collects, captures, purchases, or receives biometric identifiers or biometric information from any person. Common clinical scenarios include fingerprint time-and-attendance systems for staff, retina or fingerprint authentication for EHR login, and patient identity verification using biometrics. If a clinic uses any such system, it must have a written BIPA-compliant policy, obtain written consent from each person whose biometrics are collected, and not sell or disclose biometric data."
  - q: "Does HIPAA's Security Rule satisfy Illinois's information security requirements?"
    a: "Implementing HIPAA's Security Rule (45 CFR §§ 164.302–164.318) addresses many of the security program elements PIPA requires. However, PIPA's breach notification timeline and its coverage of health insurance information as protected personal information are not fully addressed by HIPAA alone. Clinics should treat HIPAA compliance as the floor and ensure their incident response plans incorporate PIPA's 45-day deadline."
---

Your Illinois clinic operates under three distinct legal frameworks simultaneously: HIPAA at the federal level, the Illinois Personal Information Protection Act (PIPA) for breach notification and data security, and the Mental Health and Developmental Disabilities Confidentiality Act (MHDDCA) for mental health records. Each has independent legal force. Satisfying HIPAA does not satisfy Illinois law, and an Illinois violation can occur even when no HIPAA rule has been broken.

## The Illinois Personal Information Protection Act

PIPA, codified at 815 ILCS 530, is Illinois's primary data breach notification statute. It was originally enacted in 2005 and substantially amended in 2021. The law requires any data collector — defined broadly as any entity that, for any purpose, handles, collects, disseminates, or otherwise deals with nonpublic personal information — to notify Illinois residents of a security breach in the most expedient time possible without unreasonable delay, and no later than 45 days after discovery of the breach.

### Protected personal information under PIPA

PIPA defines protected personal information to include combinations of an individual's name with one or more of:

- Social Security number
- Driver's license or state ID number
- Account numbers or financial instrument numbers with security codes
- Medical information — defined as any individually identifiable information regarding an individual's medical history, mental or physical condition, or medical treatment or diagnosis by a healthcare professional
- Health insurance information — including policy numbers, subscriber identification numbers, or any unique identifier used by a health insurer
- Unique biometric data

The inclusion of health insurance information is noteworthy. A breach that exposes an Illinois resident's health plan member ID, even without clinical diagnosis information, triggers PIPA notification obligations. HIPAA's Breach Notification Rule focuses on PHI as defined under 45 CFR § 160.103 — which includes health insurance information — but Illinois clinics should verify that their breach response procedures cover both categories explicitly.

### The 45-day deadline

HIPAA's Breach Notification Rule, at 45 CFR § 164.404(b), sets 60 days from discovery as the ceiling for notification to affected individuals. PIPA sets 45 days for Illinois residents. For an Illinois clinic subject to both, the 45-day PIPA deadline is the binding outer limit for notifying patients who are Illinois residents. In practice, a well-designed incident response procedure should aim to notify affected individuals well before either deadline, but PIPA's 45-day limit means a clinic cannot rely on the full 60-day HIPAA window when the affected individuals are Illinois residents.

### AG notification

PIPA requires notification to the Illinois AG when a breach affects more than 500 Illinois residents, in the most expedient time possible and without unreasonable delay. The AG's office maintains a breach notification portal and uses reports to identify enforcement patterns.

## The Mental Health and Developmental Disabilities Confidentiality Act

The MHDDCA, 740 ILCS 110, predates HIPAA and provides substantially stricter protections for mental health records than HIPAA's Privacy Rule. The Act covers any therapist — a term defined at section 2 to include physicians, psychologists, social workers, licensed professional counselors, and any other person who provides mental health or developmental disabilities services — and applies to all records and communications generated in that therapeutic relationship.

### Disclosure rules under the MHDDCA

Under section 5 of the MHDDCA, records and communications made or received in the provision of mental health or developmental disabilities services are confidential and may not be disclosed except as the Act specifically permits. The permitted disclosures are narrower than HIPAA's Privacy Rule:

- Disclosure requires the written consent of the patient, executed on a form that meets the requirements of section 5 — which specifies the form's content in more detail than HIPAA's § 164.508 authorization requirements
- Disclosure without consent is permitted in a limited number of specified circumstances, including imminent threat to the patient or others (similar to HIPAA's § 164.512(j) threat exception), mandatory reporting under Illinois child abuse laws, and certain judicial proceedings
- The treating-provider exception under HIPAA's TPO provisions does not automatically permit disclosure under the MHDDCA — sharing mental health records between providers for treatment coordination requires patient consent unless a specific MHDDCA exception applies

### Practical impact on clinic operations

If your clinic provides psychiatric medication management, behavioral health counseling, substance use treatment, or any other mental health service, you must maintain separate access controls and disclosure procedures for those records. That means:

- Segregating mental health records within the EHR so that MHDDCA records are not accessible to clinical staff who don't need them for the mental health treatment relationship
- Training front-desk and billing staff that MHDDCA records require an additional authorization step before release — a standard HIPAA authorization is not sufficient
- Documenting MHDDCA-specific release authorizations and retaining those with the record

Clinics that operate integrated primary care and behavioral health services must be especially careful. A patient receiving both primary care and behavioral health services from the same clinic has two categories of records with different disclosure rules. HIPAA permits sharing both for TPO; the MHDDCA does not automatically follow.

## The Illinois Biometric Information Privacy Act

BIPA, 740 ILCS 14, is Illinois's biometric privacy statute, and it has generated significant litigation since its enactment in 2008. BIPA's private right of action — $1,000 for negligent violations and $5,000 for reckless or intentional violations — has produced class action exposure for employers and service providers.

### When BIPA applies to a clinic

BIPA applies when a clinic or any vendor operating on its behalf collects, captures, purchases, receives through trade, or otherwise obtains a "biometric identifier" or "biometric information" from a person. Biometric identifiers include fingerprints, retina scans, iris scans, voiceprints, and hand scans. Biometric information is any information based on a biometric identifier used to identify an individual.

Common clinical scenarios triggering BIPA obligations:

- Fingerprint-based time-and-attendance clocks for clinical staff
- Fingerprint or retina authentication for EHR or controlled substance cabinet access
- Patient identity verification using fingerprint readers at check-in
- Third-party identity verification vendors that use biometric matching

### BIPA compliance requirements

A clinic subject to BIPA must:

1. Develop and publicly disclose a written policy establishing a retention schedule and guidelines for permanently destroying biometric identifiers and biometric information
2. Obtain a written release from each individual before collecting biometric data — including the purpose and length of the collection
3. Not sell, lease, trade, or profit from biometric data
4. Not disclose biometric data without written consent or as required by law
5. Protect biometric data with reasonable care consistent with protection of other confidential information

HIPAA's Security Rule does not satisfy BIPA's written policy, written consent, and retention schedule requirements. A clinic that collects biometric identifiers needs a standalone BIPA compliance program alongside its HIPAA program.

## Integrating Illinois Requirements With Your HIPAA Program

An Illinois clinic's compliance program should address these obligations in a coordinated way:

**Breach response procedures.** Update your incident response plan to set the 45-day PIPA deadline as the governing notification window for Illinois residents. Build in the AG notification trigger at the 500-resident threshold. Use the [HIPAA breach notification templates](/learn/compliance-operations/hipaa-breach-notification-templates) as a starting framework, then layer in PIPA-specific elements.

**Mental health record access controls.** If your clinic provides any mental health or behavioral health services, implement EHR access controls and staff training that treat MHDDCA records as a distinct category with stricter disclosure rules than standard PHI.

**Biometric data audit.** Conduct a physical audit of every system that touches staff or patient biometric identifiers. For each identified system, confirm whether a BIPA-compliant written policy exists and whether written consent was obtained from each affected individual before collection.

**Vendor review.** Any vendor that processes health information about Illinois residents may need contract language addressing PIPA, MHDDCA, and BIPA in addition to a standard HIPAA business associate agreement. See [how small clinics track vendor BAAs](/learn/compliance-operations/how-small-clinics-track-vendor-baas) for a practical framework.
