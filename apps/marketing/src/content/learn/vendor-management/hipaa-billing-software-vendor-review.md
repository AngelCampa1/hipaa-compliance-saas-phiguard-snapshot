---
title: "HIPAA Billing Software Vendor Review"
seoTitle: "HIPAA Billing Software Vendor Review"
description: "How to review billing software, clearinghouses, and outsourced billers for HIPAA. Covers BAAs, clearinghouse status, offshore operations, and switching billers."
metaDescription: "Review billing vendors for HIPAA: BAAs, clearinghouse status, offshore billers, switching providers. Practical checklist for clinics."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "vendor-management"
schemaType: "article"
intent: "consideration"
summary: "Billing platforms, clearinghouses, and outsourced billers all touch PHI in volume. This article covers the BAA requirements, the clearinghouse-as-covered-entity nuance, and the controls to ask for when offshore operations are involved. It helps clinics evaluate vendor promises against BAA terms, PHI access, subcontractors, retention, incident support, and evidence they can actually review."
keyTakeaways:
  - "Billing data is PHI. Claim files contain diagnosis codes, procedures, dates of service, and identifiers - every safeguard required for clinical PHI applies."
  - "Healthcare clearinghouses are themselves covered entities under 45 CFR Section  160.103, but you still need a BAA when they act on your behalf."
  - "Outsourced billing companies are business associates. Offshore billing operations require explicit disclosure and additional controls."
  - "Switching billers is a high-risk moment: the old vendor must return or destroy PHI, and the new one needs a BAA before any data transfers."
  - "Common gap: practices treat billing as 'just numbers' and skip safeguards that they apply rigorously to clinical records."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management"
sources:
  - title: "45 CFR Section  164.502(e) - Disclosures to Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "45 CFR Section  164.504(e) - Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
  - title: "HHS Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Is a billing claim PHI?"
    a: "Yes. A claim contains identifiers, diagnosis codes, procedure codes, dates of service, and provider information. It is individually identifiable health information transmitted by a covered entity, which meets the PHI definition in 45 CFR Section  160.103."
  - q: "If a clearinghouse is a covered entity, do I still need a BAA?"
    a: "Yes, when the clearinghouse is acting on your behalf to process claims. HHS guidance is explicit that an entity can be both a covered entity and a business associate, and the BAA is required for the business-associate function."
  - q: "Can a billing company use offshore staff?"
    a: "It is permissible if the BAA addresses it. You should require disclosure of which countries staff operate in, what controls protect PHI, whether the data ever leaves the United States, and whether subprocessors are involved. Some state laws and payer contracts add restrictions."
---

Billing is where PHI moves the most. Claims, remittances, eligibility checks, denial appeals, patient statements - all PHI, all flowing through software, clearinghouses, and often a billing service. The vendors involved sit on a high volume of identifiable health information, and the BAA work matters as much here as anywhere.

This article walks through the HIPAA review for billing software vendors, clearinghouses, and outsourced billing companies.

## Why this vendor category needs HIPAA review

A common practice administrator instinct is that billing is "just numbers." It is not. A claim file ties a patient identifier to a diagnosis code, a procedure code, a date of service, and a provider. Under 45 CFR Section  160.103, that is individually identifiable health information transmitted in connection with a healthcare transaction. It is PHI. Every safeguard required for the clinical record applies.

That means the billing software vendor, the clearinghouse, and the outsourced biller are all business associates when they handle PHI on your behalf. A BAA is required under 45 CFR Section  164.502(e) before PHI changes hands.

There is one nuance. Healthcare clearinghouses are themselves covered entities under HIPAA's definitions. But when a clearinghouse processes claims on your behalf, it is also acting as your business associate, and the BAA is still required.

## Required BAA terms for billing vendors

The required terms in 45 CFR Section  164.504(e) all apply: permitted uses, safeguards, breach reporting, subcontractor flow-down, termination handling, and HHS access. For billing specifically, the BAA should also address:

- **Data flow disclosure.** Where claims, remits, and eligibility transactions actually travel - your software, the clearinghouse, the payer, any analytics tooling.
- **Retention.** Billing records often need long retention for audit and payer recoupment. The BAA should clarify how long the vendor holds PHI and on what schedule it is purged.
- **Offshore operations.** If the vendor uses staff outside the US, the BAA should disclose which countries, what controls apply, and whether the data physically leaves the US.
- **Subcontractor flow-down for clearinghouses and payment processors.** A billing platform that hands claims to a clearinghouse and patient statements to a print-and-mail vendor must flow BAA terms to both.

## Specific risks for billing vendors

- **The "we don't see PHI" claim.** A vendor argues that because they only handle billing data, they are not a business associate. Wrong. Billing data is PHI.
- **Clearinghouse confusion.** A clearinghouse is a covered entity, but it is also your business associate when processing your claims. The BAA is required.
- **Offshore subcontractors without disclosure.** A US-based billing company subcontracts coding or AR follow-up to staff in another country. If the BAA does not disclose this and flow down obligations, you have a gap.
- **Switching billers.** When you change billing companies, the prior vendor still holds claims, remits, and patient ledgers. Without a clear return-or-destroy clause, that PHI sits in their system indefinitely.
- **Patient statement vendors.** Print-and-mail vendors handling patient statements are business associates. They are easy to overlook because the practice may never deal with them directly.

## Evaluation checklist

1. Is there a signed BAA with the billing software vendor, dated and current
2. Is there a signed BAA with the clearinghouse
3. If billing is outsourced, is there a signed BAA with the billing company
4. Are subcontractors (offshore staff, statement vendors, dunning services) disclosed and flowed down
5. Are encryption at rest and in transit confirmed for the platform and any sFTP or API connections
6. Does the vendor support MFA for all user accounts
7. Are detailed access logs available for who viewed which patient ledger and when
8. What is the breach notification timeline and what triggers it
9. Does the BAA include a clear data return or destruction clause for termination
10. If offshore operations exist, are countries, controls, and data residency documented
11. Does the vendor maintain a recent SOC 2 Type II or similar attestation
12. For switching: is there a written transition plan including data export format, timing, and destruction certification from the prior vendor

## Common mistakes

- **Treating billing as low-sensitivity.** A claim file is PHI. Apply the same diligence you apply to clinical records.
- **Skipping the clearinghouse BAA.** Easy to assume the EHR or billing platform handles it. Confirm in writing.
- **Ignoring statement vendors.** The print-and-mail company touching patient statements is a business associate. Get the BAA.
- **Not documenting offshore staff.** If you do not know which countries are involved, you cannot evaluate controls.
- **Sloppy biller transitions.** Cutting over to a new biller without a return-or-destroy plan leaves PHI with the prior vendor - and the BAA still binds you to oversee it.
- **Forgetting payment processors.** Card-on-file processing for patient balances often involves PHI in metadata. Verify the processor's HIPAA posture.

For the broader question of when a vendor needs a BAA, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). The [vendor management hub](/learn/vendor-management) collects the rest of the program. PHIGuard's [HIPAA-native task system](/hipaa) tracks every BAA, every renewal, and every transition for small clinics.
