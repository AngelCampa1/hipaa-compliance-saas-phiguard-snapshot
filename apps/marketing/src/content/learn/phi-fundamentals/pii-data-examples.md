---
title: "PII Data Examples: What Counts and What Does Not"
seoTitle: "PII Data Examples: What Counts as PII"
description: "Concrete examples of personally identifiable information across healthcare, HR, and administrative contexts, with guidance on when PII becomes PHI."
metaDescription: "PII examples for healthcare teams: names, IDs, biometrics, and combinations that identify individuals. Learn when PII becomes PHI under HIPAA."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-fundamentals"
schemaType: "article"
intent: "awareness"
summary: "Personally identifiable information (PII) covers any data that can identify a specific person. Healthcare teams encounter PII in patient records, HR systems, vendor contacts, and administrative operations. When PII connects to health or payment context, it becomes PHI and HIPAA applies. Understanding which data examples fall into which category helps staff apply the correct controls."
keyTakeaways:
  - "PII includes obvious identifiers like names and SSNs, but also combinations of less-obvious fields that together identify a person."
  - "In healthcare, most patient PII is also PHI because health context is inherent."
  - "Staff PII in HR systems is not PHI - it is governed by employment law and state breach notification rules."
  - "Quasi-identifiers - zip code, birthdate, and sex - are individually weak but can identify a person in combination."
  - "De-identified data is not PII or PHI once all 18 HIPAA identifiers are removed by an approved method."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "NIST Guide to Protecting PII (SP 800-122)"
    url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-122.pdf"
    publisher: "NIST"
  - title: "Methods for De-identification of PHI"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
    publisher: "HHS"
faq:
  - q: "Is a patient's name alone PII?"
    a: "A name is a common identifier, but whether it constitutes PII depends on context. In isolation, a first name may not be enough to identify a specific person. Combined with a birthdate, address, or account number, a name is clearly PII."
  - q: "Is an IP address PII?"
    a: "Under most US frameworks, an IP address can be PII if it is linked to an identifiable individual. HHS has indicated that IP addresses are among the 18 HIPAA identifiers when associated with health information."
  - q: "What is the difference between PII and sensitive PII?"
    a: "NIST SP 800-122 distinguishes between PII and sensitive PII. Sensitive PII - such as Social Security numbers, financial account numbers, and medical records - requires stronger protection because its exposure is more likely to cause harm."
  - q: "Can combining non-PII fields create PII?"
    a: "Yes. This is the linkage or mosaic effect. A zip code alone is not PII. Combined with a birthdate and sex, the combination can narrow an individual to one person in a sparse population."
---

Understanding which data examples qualify as personally identifiable information (PII) helps healthcare teams apply the right controls to the right data. The examples below cover patient, staff, and vendor contexts, with notes on when PII crosses into PHI territory.

## Direct identifiers: clear PII in any context

These data types identify a person on their own with minimal ambiguity:

- Full legal name
- Social Security number (SSN)
- Driver's license number
- Passport number
- Financial account number (bank account, credit card)
- Date of birth combined with name
- Home address
- Personal email address
- Personal phone number
- Biometric data: fingerprints, retinal scan, voice print, facial geometry
- Full-face photograph or image sufficient to identify the person
- Medical record number or health plan beneficiary ID

Any one of these is PII. In a patient context, each is also a HIPAA identifier. When one appears alongside health or payment information, the record becomes PHI.

## Quasi-identifiers: weak alone, strong in combination

Quasi-identifiers do not uniquely identify a person on their own, but combine to create identification risk:

- 5-digit ZIP code
- Birthdate (month and day without year)
- Sex
- Race or ethnicity
- Employer name
- Occupation
- Education level

A classic example from de-identification research: ZIP code, birthdate, and sex, taken together, can identify a large portion of the US population to a single individual. Datasets that seem anonymized because names are removed can still be re-identifiable through quasi-identifier combinations.

## Patient PII examples in a clinic setting

The following appear commonly in clinic operations and are both PII and PHI:

| Data field | PII? | PHI if health context present? |
|------------|------|-------------------------------|
| Patient full name + DOB | Yes | Yes |
| Insurance member ID | Yes | Yes |
| Patient email address | Yes | Yes |
| Patient phone number | Yes | Yes |
| Medical record number | Yes | Yes |
| Appointment date + provider | Yes | Yes |
| Diagnosis code + patient ID | Yes | Yes |
| Lab result + patient name | Yes | Yes |
| Prior authorization reference | Yes | Yes |
| Billing account number | Yes | Yes |

In healthcare, the presence of health context is nearly always implied by the system the data lives in. A scheduling database, a task tracker used for clinical coordination, and an intake form all carry PHI assumptions.

## Staff PII examples: not PHI

Employee data in HR systems is PII, but it is not PHI. HIPAA does not cover employment records. These are governed by employment law, state breach notification statutes, and in some cases federal privacy requirements:

- Employee SSN
- Employee date of birth
- Direct deposit banking information
- Personal contact information in HR records
- Performance reviews
- Health insurance enrollment data (as an HR function, not as a provider)

Clinics often store staff PII in cloud HR tools. A breach of that data is not a HIPAA breach - but it may trigger state breach notification obligations depending on the data involved and the state.

## Vendor and operational PII: lowest risk category

Contact information for vendor representatives - names, business emails, business phone numbers - is generally not PII in the legally significant sense because it identifies a role or organization rather than a private individual. Business contact information does not warrant the same controls as patient or staff PII.

An exception: if a vendor representative is also a patient at your clinic, their record in the EHR is PHI even if they also appear in your vendor contact list.

## When de-identified data is no longer PII

HIPAA recognizes two methods for removing the PHI status from patient data:

1. **Expert determination** - a qualified statistician certifies that the re-identification risk is very small
2. **Safe Harbor** - all 18 HIPAA identifiers are removed, and the covered entity has no actual knowledge that the remaining data can identify the individual

For the 18 identifiers specifically, see [18 HIPAA Identifiers](/learn/phi-fundamentals/18-hipaa-identifiers). For a full comparison of PII and PHI in healthcare contexts, see [PHI vs PII](/learn/phi-fundamentals/phi-vs-pii).

Correctly classifying PII and PHI is the foundation of a functioning access control and vendor management program. For the compliance infrastructure that makes it operational, visit [/hipaa](/hipaa).
