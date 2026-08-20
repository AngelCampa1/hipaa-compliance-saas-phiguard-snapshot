---
title: "PHI in Billing and Coding Workflows"
description: "How PHI flows through medical billing and coding at a small clinic, which vendors need BAAs, and the minimum necessary standard for billing staff access to patient records."
metaDescription: "How PHI flows in medical billing and coding workflows. Which vendors need BAAs, minimum necessary access for billing staff, and common PHI exposure patterns."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: phi-workflows
summary: "Medical billing and coding workflows involve extensive PHI - patient demographics, diagnosis codes, procedure codes, service dates, and insurance information. Every vendor in the billing chain (clearinghouses, billing services, coding contractors, payer portals) is a business associate requiring a BAA. Billing staff access to patient records must be limited to the minimum necessary for billing functions - not the full clinical chart."
keyTakeaways:
  - "Every vendor in the medical billing chain is a business associate - clearinghouse, outsourced billing service, coding contractor, and patient payment portal all require BAAs"
  - "Billing data containing patient name, service date, diagnosis code, and procedure code is PHI - not just demographic or administrative data"
  - "Billing staff should have read access to encounter-level codes and demographics, not the full clinical record or problem list narrative"
  - "EHR exports to Excel or billing software that include PHI must be handled as PHI throughout - not treated as administrative files after export"
  - "Patient billing portals that send statements via email or text must use BAA-covered communication platforms"
author: angel-campa
reviewer: phiguard-compliance-research
intent: consideration
relatedResource: hipaa-annual-review-calendar
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.514 - Uses and Disclosures for Treatment, Payment, and Healthcare Operations"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
  - title: "HHS Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
---

Medical billing touches more PHI than most clinic administrators expect. The combination of patient name, diagnosis code, service date, and procedure code is Protected Health Information, and billing transmits this combination to clearinghouses, payers, payment portals, and outsourced coding services throughout the revenue cycle.

## What Counts as PHI in Billing

A claim submitted to a payer contains PHI. The claim includes:
- Patient name, DOB, address, and insurance ID (demographic identifiers)
- Date(s) of service
- Diagnosis codes (ICD-10) - identifies the patient's health condition
- Procedure codes (CPT) - identifies what healthcare was provided
- Treating provider name and NPI
- Amount billed and any prior authorization numbers

The combination of demographic identifiers plus health-related data elements is PHI by definition. The fact that the claim's primary purpose is financial doesn't change what the content is: health information tied to an identifiable individual.

The same PHI appears in:
- Explanation of Benefits (EOB) documents received from payers
- Electronic Remittance Advice (ERA) files
- Denial letters from payers
- Accounts receivable reports
- Patient billing statements
- Collection notices sent to patients or collection agencies

## The Business Associate Chain in Medical Billing

Every third party that receives, processes, or handles billing data on your clinic's behalf is a business associate. Each requires a signed BAA.

**Clearinghouses:** A clearinghouse receives claims from your billing software, converts them to the payer's required format, and submits them electronically. The clearinghouse handles PHI - patient demographics, diagnoses, procedures, service dates - for every claim it processes. A BAA with your clearinghouse is required.

**Outsourced billing services:** Many small clinics use an outside billing company to manage revenue cycle operations. If that company submits claims, posts payments, works denials, or manages accounts receivable, it is handling PHI as a business associate. A BAA is required before any PHI is transmitted to an outsourced billing service.

**Medical coding contractors:** If the clinic uses outside coders to assign ICD-10 and CPT codes to encounters, those coders are reviewing clinical documentation - which is PHI. Coding contractors are business associates requiring BAAs.

**Patient payment portals:** Online bill pay platforms that display patient names, service dates, amounts, and account balances to patients are handling PHI. If a clinic uses a third-party patient payment portal, that vendor requires a BAA. Payment portals that send email or text notifications with account details require that those communications be sent through a BAA-covered channel.

**Collections agencies:** If patient balances are referred to a collection agency, the information transmitted (patient name, date of service, amount owed, potentially diagnosis or service type) constitutes a disclosure of PHI. Collections agencies used for healthcare receivables are business associates.

**Patient financing services:** Third-party patient financing services (payment plans through an outside company) similarly receive PHI and require BAA assessment.

## Minimum Necessary Access for Billing Staff

Billing staff have a legitimate need to access PHI for payment purposes - the payment exception under 45 CFR §164.506(c) permits these uses without patient authorization. But the minimum necessary standard (45 CFR §164.502(b)) applies to billing access just as it applies to clinical access.

A billing specialist processing a claim needs:
- Patient demographics (name, DOB, address, insurance ID)
- Date(s) of service
- Diagnosis codes (ICD-10)
- Procedure codes (CPT)
- Prior authorization numbers (if applicable)
- Provider information

A billing specialist does not need:
- The full clinical note narrative (the provider's SOAP note, clinical reasoning, examination findings)
- The patient's full problem list beyond what's relevant to the codes being processed
- Mental health treatment records (which have additional protection even within a covered entity)
- Substance use disorder treatment records (which have 42 CFR Part 2 protections in most contexts)

Most EHR systems let you give billing staff access to encounter-level billing data - the diagnosis and procedure codes - without opening the full chart. If your EHR can't segregate access at this level, document the limitation and the compensating control (training plus access monitoring) in your minimum necessary decision log.

## EHR Exports and the PHI They Carry

Billing workflows often involve EHR data exports - exporting a list of unbilled encounters, a patient ledger, an accounts receivable report. These exports contain PHI. Once exported, the file is PHI and must be handled accordingly.

Common compliance gaps with EHR exports:

**Exports stored in unsecured locations.** An Excel file of unbilled encounters stored in a shared drive folder without access controls is PHI in an uncontrolled location. EHR export files must be stored with the same controls as other PHI - encrypted, access-controlled, not on local desktops or personal devices.

**Exports emailed without encryption.** A billing manager who emails an accounts receivable report to an outside billing service over unencrypted email makes an unauthorized disclosure of PHI. PHI transmitted by email must use encryption or another appropriate safeguard - SFTP, or a secure file-sharing platform covered by a BAA.

**Exports retained beyond need.** An export file created for a one-time analysis that sits on a shared drive for three years is PHI that persists beyond its operational purpose. Establish a retention standard for export files and dispose of them securely when no longer needed.

## Billing Statements and Patient Communications

When your clinic sends a patient a billing statement, that statement is a communication about healthcare to the patient - which is a permitted use under HIPAA. But the delivery method matters.

**Paper statements mailed to the address on file:** Generally acceptable, with standard precautions (don't include more than the minimum necessary on the envelope, use plain envelopes without clinical context visible through the window).

**Email statements:** Sending billing statements by email raises transmission security questions. If a patient has consented to email communications and understands the risk, email may be permissible, but the email platform should be BAA-covered or the patient's explicit consent to unencrypted email should be documented.

**Text message statements:** Standard SMS is unencrypted. Sending billing information - patient name, amount owed, service date - via text raises the same concerns as unencrypted email. Document the patient's consent to receive billing information this way.

**Patient portal statements:** A HIPAA-covered patient portal is the preferred channel for billing statement delivery. The portal is encrypted, access-controlled, and typically covered under the EHR vendor's BAA.

## Protecting PHI in Denial Management and Collections

Denial management workflows involve reviewing payer denial letters, researching the denial reason, gathering supporting documentation, and submitting appeals. Each step involves PHI - the denial itself contains patient and claim information, and appeals may include clinical documentation.

For denials managed internally: apply the same minimum necessary and access control standards as other billing workflows.

For denials managed by an outsourced billing service: confirm the BAA covers denial management activity.

For balances referred to collections: confirm the collections agency has executed a BAA before any patient account information is transmitted. Provide only the minimum necessary information - patient name, balance, and service type - rather than a full clinical summary.

## What a Compliant Billing Operation Looks Like

A HIPAA-compliant billing operation for a small clinic has:
- BAAs executed with every vendor in the billing chain (clearinghouse, billing software, outsourced billing service if used, patient payment portal, collections agency if used)
- Billing staff access limited to encounter-level billing data - not full clinical chart access
- EHR exports handled as PHI throughout their lifecycle: encrypted storage, controlled access, secure transmission, timely disposal
- Patient billing communications through HIPAA-covered channels (patient portal, encrypted email with consent documentation)
- Vendor review triggered when any vendor in the billing chain is changed or updated

Most small clinics think of billing as administrative work. HIPAA doesn't make that distinction - billing data is PHI, and the vendors who handle it carry the same obligations as any other business associate.
