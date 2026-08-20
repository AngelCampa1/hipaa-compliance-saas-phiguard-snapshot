---
title: "Washington My Health MY Data Act vs. HIPAA"
seoTitle: "Washington My Health MY Data Act vs. HIPAA"
description: "How Washington's My Health MY Data Act differs from HIPAA in entity scope, consumer rights, consent requirements, and enforcement — and what Washington clinics must do beyond their existing HIPAA program."
metaDescription: "Washington My Health MY Data Act vs. HIPAA: key differences in scope, consent, and enforcement for Washington clinics. Learn what extra steps HIPAA alone."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "Washington's My Health MY Data Act (MHMD Act) applies to any entity that collects consumer health data from Washington residents — reaching far beyond HIPAA-covered entities to include wellness apps, fitness platforms, and employers. Washington clinics that are already HIPAA-covered must also meet MHMD Act requirements for any health data they collect outside covered healthcare transactions, and must honor consumer rights to access, correct, and delete that data."
keyTakeaways:
  - "The MHMD Act applies broadly to any entity that collects consumer health data from Washington residents — not just HIPAA-covered entities — so non-covered entities like wellness apps and fitness trackers must comply."
  - "Washington clinics subject to HIPAA remain exempt for data processed in their capacity as a covered entity, but face MHMD Act obligations for health data collected outside covered transactions."
  - "The MHMD Act requires affirmative consent before collecting or sharing most categories of consumer health data, going further than HIPAA's Notice of Privacy Practices model."
  - "Consumers have a right to delete their health data under the MHMD Act — a right HIPAA does not provide — and clinics must honor deletion requests within defined timeframes."
  - "The MHMD Act creates a private right of action through the Washington Consumer Protection Act, exposing non-compliant entities to civil litigation in addition to AG enforcement."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "Washington My Health MY Data Act — Revised Code of Washington Chapter 19.373"
    url: "https://app.leg.wa.gov/RCW/default.aspx?cite=19.373"
    publisher: "Washington State Legislature"
  - title: "HHS Summary of the HIPAA Privacy Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html"
    publisher: "U.S. Department of Health and Human Services"
  - title: "45 CFR Parts 160 and 164"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
faq:
  - q: "Does the MHMD Act apply to Washington clinics that are already HIPAA-covered?"
    a: "Yes and no. HIPAA-covered entities are exempt from the MHMD Act for health data they process in their capacity as a covered entity — for example, clinical records created during a patient encounter. However, if the same clinic collects health data outside a covered transaction (through a wellness portal, scheduling app, or employee health program), that data may fall under the MHMD Act. The exemption tracks the data's purpose, not the entity's status."
  - q: "What is 'consumer health data' under the MHMD Act?"
    a: "The MHMD Act defines consumer health data broadly to include any personal information that is linked or reasonably linkable to a consumer and that a regulated entity uses to identify a consumer's physical or mental health status. This explicitly includes reproductive or sexual health data, gender-affirming care information, and data derived from non-health sources (such as location data inferring a clinic visit). The definition is broader than HIPAA's PHI."
  - q: "What consent is required before collecting consumer health data?"
    a: "The MHMD Act requires affirmative consent — a clear, voluntary, opt-in act by the consumer — before collecting consumer health data. Sharing consumer health data with third parties requires a separate, specific authorization. Unlike HIPAA's treatment-payment-operations exception, the MHMD Act does not include a blanket carve-out allowing collection or sharing without consent for most non-treatment purposes."
  - q: "What is the right to delete under the MHMD Act?"
    a: "Under RCW 19.373.040, consumers may request deletion of their consumer health data. Regulated entities must comply within 30 days of receiving a verified request, unless an exception applies (such as legal retention obligations). HIPAA does not include a comparable right to deletion — the HIPAA right of access allows patients to inspect and copy their records but not to compel deletion."
---

Washington's My Health MY Data Act (MHMD Act), enacted as Chapter 19.373 of the Revised Code of Washington, took effect March 31, 2024 for regulated entities and June 30, 2024 for small businesses. The law targets sensitive health data collected by entities outside HIPAA's scope — fitness trackers, fertility apps, menstrual cycle trackers, and employer wellness platforms — but its text is broad enough to affect Washington medical clinics for data they collect beyond their core clinical operations.

## Who the MHMD Act Regulates

HIPAA regulates covered entities — healthcare providers, health plans, and healthcare clearinghouses — along with their business associates. The MHMD Act takes a different approach. Under RCW 19.373.010, a "regulated entity" is any legal entity that (1) conducts business in Washington or produces products or services targeted to consumers in Washington, (2) alone or jointly determines the purpose and means of collecting, processing, sharing, or selling consumer health data, and (3) is not a government agency. The law also covers "small businesses" at a lower threshold, though with a delayed effective date.

The MHMD Act exempts HIPAA-covered entities and their business associates only for PHI collected, used, or disclosed in compliance with HIPAA. A Washington clinic with a complete HIPAA compliance program is not exempt across the board — the exemption tracks each discrete dataset and how it was collected, not the entity's general status.

Many clinics run hybrid data environments: a clinical EHR fully under HIPAA, alongside a patient-facing wellness portal, an online scheduling tool from a non-covered vendor, and an employer occupational health service. Data collected through those touchpoints may not qualify for the HIPAA exemption, making the clinic subject to MHMD Act obligations for those data streams.

## Consumer Health Data: A Broader Definition Than PHI

HIPAA protects protected health information, defined as individually identifiable information relating to health condition, the provision of care, or payment for care. The MHMD Act defines "consumer health data" as personal information that is linked or reasonably linkable to a consumer and that a regulated entity uses to identify the consumer's physical or mental health status. The statutory definition at RCW 19.373.010 expressly includes:

- Individual health conditions, treatment, diseases, or diagnoses
- Social, psychological, behavioral, and medical interventions
- Surgeries, use of medication, and other medical procedures
- Bodily functions, vital signs, and symptoms
- Reproductive or sexual health
- Gender-affirming care
- Genetic data
- Precise geolocation data when used or reasonably usable to infer a health condition or care-seeking behavior (for example, repeated location pings to an oncology clinic)
- Data derived from non-health sources that can be used to infer health status

This definition captures data that HIPAA may not reach — including location data from a smartphone inferred to show clinic visits, and reproductive health data from apps that have no treatment relationship with the consumer.

## Consent Requirements

The MHMD Act's consent framework is more demanding than HIPAA's Notice of Privacy Practices model. Under RCW 19.373.030, regulated entities must obtain affirmative consent from consumers before:

- Collecting or sharing consumer health data beyond what is necessary to provide the service the consumer explicitly requested
- Selling consumer health data

Affirmative consent means an active opt-in — a clear, specific, informed, and voluntary indication of the consumer's agreement. Pre-checked boxes and bundled consents do not satisfy this standard.

HIPAA uses a different model. For treatment, payment, and healthcare operations (TPO), HIPAA does not require individual authorization — a Notice of Privacy Practices and the opportunity to agree or object is sufficient. The MHMD Act does not contain a comparable TPO carve-out for non-HIPAA-exempt data. Your clinic cannot rely on its existing Notice of Privacy Practices to satisfy the MHMD Act consent requirement for data captured outside covered transactions.

## Consumer Rights Under the MHMD Act

The MHMD Act grants Washington consumers several rights regarding their consumer health data that HIPAA does not provide:

**Right of access.** Consumers may request and receive a copy of their consumer health data held by a regulated entity. Under RCW 19.373.040, entities must respond within 45 days, with one possible 45-day extension.

**Right to deletion.** Under RCW 19.373.040, consumers may request deletion of all consumer health data the regulated entity has collected. The entity must comply within 30 days of verifying the request, unless legal retention requirements apply. HIPAA has no equivalent deletion right — the HIPAA Privacy Rule gives patients the right to access records and to request amendment, but not compelled deletion.

**Right to withdraw consent.** Consumers may withdraw consent to collect or share consumer health data at any time. Regulated entities must stop collecting and sharing that data after receiving a withdrawal request.

**Right not to be subject to geofencing.** The MHMD Act prohibits regulated entities from using geofencing technology within 2,000 feet of any healthcare facility for the purpose of identifying, tracking, or targeting consumers seeking health care.

## Prohibited Practices

Beyond the consent and individual-rights framework, the MHMD Act prohibits several practices outright across Chapter 19.373:

- Collecting, using, or sharing consumer health data for any purpose not disclosed in the entity's consumer health data privacy policy (RCW 19.373.020 and RCW 19.373.030)
- Selling consumer health data without a valid written authorization meeting the requirements of RCW 19.373.070
- Operating a geofence within 2,000 feet of any in-person health care service for the purpose of identifying, tracking, or targeting consumers seeking health care, or collecting consumer health data from them (RCW 19.373.080)
- Failing to implement reasonable administrative, technical, and physical data security practices to protect consumer health data (RCW 19.373.050)

These prohibitions operate independently of consent — even with a consumer's authorization, a regulated entity cannot use health data in discriminatory ways.

## Enforcement and Private Right of Action

HIPAA enforcement rests exclusively with the federal Office for Civil Rights (OCR) and the Department of Justice. Patients cannot sue directly under HIPAA.

The MHMD Act uses the Washington Consumer Protection Act (CPA), RCW 19.86, as its enforcement vehicle (RCW 19.373.090). The Attorney General of Washington may bring enforcement actions for violations. Critically, violations of the MHMD Act constitute per se violations of the CPA, which means affected consumers may bring private civil actions for actual damages, costs, and attorney's fees. This private right of action significantly raises the compliance stakes for Washington-based regulated entities.

## What Washington Clinics Must Do

If your Washington clinic has a functioning HIPAA compliance program, take these steps to address MHMD Act obligations:

**Step 1: Map non-HIPAA health data flows.** Identify every touchpoint where the clinic collects health-related information that is not processed as PHI under a covered transaction. Patient portals, scheduling tools, wellness programs, occupational health services, and third-party patient engagement platforms are common candidates.

**Step 2: Assess whether MHMD Act applies.** For each identified data stream, determine whether the data constitutes "consumer health data" under RCW 19.373.010 and whether the HIPAA exemption applies. Document the analysis.

**Step 3: Implement consent mechanisms.** For data streams subject to the MHMD Act, implement affirmative opt-in consent that meets the statutory standard — specific, informed, voluntary, and granular by purpose.

**Step 4: Establish deletion and access procedures.** Create a verified request intake process for consumer rights requests. Add response deadlines — 45 days for access, 30 days for deletion — to your compliance calendar.

**Step 5: Update vendor agreements.** Confirm that vendors receiving consumer health data under the MHMD Act definition have contractual restrictions on use, sale, and retention. Review whether those vendors also need HIPAA business associate agreements.

**Step 6: Audit geofencing and location data practices.** If the clinic or any of its vendors uses location-based services, audit those for MHMD Act compliance.

## Interaction With the HIPAA Audit Log Requirements

Your audit trail must cover non-HIPAA data streams as well as PHI. The [HIPAA audit log requirements](/learn/compliance-operations/hipaa-audit-log-requirements-small-clinics) under 45 CFR § 164.312(b) apply to electronic PHI in your EHR. The MHMD Act does not specify a parallel audit log requirement, but you must keep records of consumer consent, access requests, and deletion responses to demonstrate compliance and defend against CPA claims.

See also: [how small clinics track vendor BAAs](/learn/compliance-operations/how-small-clinics-track-vendor-baas) — the vendor management discipline that BAA tracking requires translates directly to identifying which vendors may be receiving consumer health data subject to MHMD Act restrictions.

## A Note on Breach Notification

The MHMD Act does not contain a standalone breach notification provision. Washington's general data breach notification law, RCW 19.255.010, requires notice to affected residents in the most expedient time possible and without unreasonable delay. For medical information specifically, Washington HB 1155 (enacted 2019) requires notification within 30 days of discovering that a breach of medical information has occurred. Washington clinics that suffer a breach involving both PHI and consumer health data must comply with HIPAA's 60-day ceiling (as a ceiling, not a target), the 30-day Washington medical information breach deadline, and any AG notification obligations.
