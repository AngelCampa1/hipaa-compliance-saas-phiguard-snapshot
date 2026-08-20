---
title: "EHR Vendor BAA Requirements"
seoTitle: "EHR Vendor BAA Requirements: What to Check"
description: "What an EHR vendor BAA must cover under 45 CFR Section  164.504(e), with EHR-specific concerns: data export, integration partners, patient portals, and termination."
metaDescription: "What an EHR vendor BAA must cover under 45 CFR 164.504(e). EHR-specific gaps: data export, integrations, patient portal, termination."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "vendor-management"
schemaType: "article"
intent: "consideration"
summary: "Your EHR sits at the center of every PHI workflow in the practice. The BAA must cover not just the core record but the patient portal, integration partners, exports, and termination handling. It helps clinics evaluate vendor promises against BAA terms, PHI access, subcontractors, retention, incident support, and evidence they can actually review."
keyTakeaways:
  - "Every BAA must include the six required terms in 45 CFR Section  164.504(e), including subcontractor flow-down and termination obligations."
  - "EHR BAAs commonly fail on integration partners - labs, imaging, e-prescribing, payment processors - that the vendor treats as your problem."
  - "The patient portal is part of the EHR for HIPAA purposes. Confirm portal authentication, message retention, and audit logging are covered."
  - "Data export at termination is the single most contentious clause. Get format, fees, and timing in writing before signing."
  - "Books and records access for HHS is required. Vendors that resist that clause are not BAA-ready."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management"
sources:
  - title: "45 CFR Section  164.504(e) - Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
  - title: "45 CFR Section  164.502(e) - Disclosures to Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "HHS Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does the EHR vendor's standard BAA satisfy HIPAA?"
    a: "Often, yes - large EHR vendors maintain BAAs that meet the 45 CFR Section  164.504(e) requirements. The risk is not the boilerplate. It is whether the BAA actually covers integration partners, the patient portal, and termination data export. Read all of it."
  - q: "Do we need a separate BAA with each integration partner?"
    a: "If the integration partner receives PHI on your behalf and is not a subcontractor of the EHR vendor, yes. If the EHR vendor passes PHI to a subcontractor it manages, the EHR vendor's BAA should flow down. Ask the vendor to identify each partner and which category it falls into."
  - q: "What if the vendor refuses to allow HHS books and records access?"
    a: "That clause is required by 45 CFR Section  164.504(e)(2)(ii)(I). A vendor that refuses it is not offering a compliant BAA. Escalate to their legal team or choose a different vendor."
---

The EHR is the spine of the practice. Charts, scheduling, e-prescribing, billing handoff, patient messaging - most of the PHI in a small clinic flows through it. The BAA you sign with that vendor is the most important business associate contract you will manage.

This article covers what the BAA must include under 45 CFR Section  164.504(e), the EHR-specific clauses that often get skipped, and the gaps that show up in real BAAs.

## Why this vendor category needs HIPAA review

The EHR vendor is unambiguously a business associate. It creates, receives, maintains, and transmits PHI on your behalf - the textbook definition under 45 CFR Section  160.103. The required BAA under 45 CFR Section  164.502(e) is non-negotiable.

What makes the EHR review different from other vendor reviews is scope. The product is not one piece of software. It is usually a bundle: a clinical record, a scheduling module, an e-prescribing connection, a patient portal, an analytics dashboard, an integrated billing component, and a network of integration partners (labs, imaging, payment processors, telehealth, fax). Every one of those touches PHI. Every one needs to be in scope.

## Required BAA terms for an EHR vendor

A BAA that meets 45 CFR Section  164.504(e) must:

1. Establish permitted and required uses and disclosures of PHI by the business associate.
2. Require appropriate safeguards to prevent unauthorized use or disclosure, including compliance with the Security Rule for ePHI.
3. Require reporting of any use or disclosure not provided for in the contract, and any security incidents or breaches.
4. Require subcontractor flow-down: every subcontractor that creates, receives, maintains, or transmits PHI on the business associate's behalf must agree in writing to the same restrictions.
5. Make PHI available to the covered entity for access, amendment, and accounting of disclosures consistent with subparts E and 164.524-528.
6. Make books, records, and practices available to HHS for compliance review.
7. At termination, return or destroy all PHI received from, or created or received on behalf of, the covered entity, where feasible. If not feasible, extend protections to that PHI.

Read each clause against your actual workflow. A BAA that only addresses core EHR records but is silent on the patient portal or on the e-prescribing module leaves PHI uncovered.

## Specific risks for EHR vendors

A few risk patterns repeat across EHR vendor reviews:

- **Integration partners.** Lab interfaces, imaging connectivity, e-prescribing networks, clearinghouse handoffs. The vendor often disclaims these, treating them as your direct relationship even though the connection is configured inside their software.
- **Patient portal coverage.** Portal messaging, document uploads, and appointment requests are PHI. Confirm the BAA covers portal authentication, message retention, and audit log access.
- **Analytics and benchmarking.** Some EHR vendors aggregate de-identified data for benchmarking. Confirm the de-identification method matches 45 CFR Section  164.514(b) - either expert determination or safe harbor - and that re-identification is contractually prohibited.
- **Termination data export.** This is the single most contentious clause. Vendors negotiate hard on format (CCDA vs. proprietary), fees, and timing. Lock it down before signing.
- **Offshore support.** If support engineers in other countries can view PHI for troubleshooting, that needs to be disclosed and controlled.

## Evaluation checklist

1. Does the BAA include all six required terms in 45 CFR Section  164.504(e)
2. Are the EHR core record, scheduling, e-prescribing, patient portal, billing module, and analytics all named in scope
3. Are integration partners identified and categorized (subcontractor of the EHR vs. your direct vendor)
4. Does the BAA name a breach notification timeframe shorter than the 60-day outer limit in 45 CFR Section  164.410
5. Are subcontractor BAAs available for review on request
6. Is there a documented data export process at termination, including format, fees, and timing
7. Are audit logs available to the covered entity, and what is the retention period
8. Does the BAA permit de-identified or aggregated use, and if so, under what de-identification method
9. Is offshore support allowed, and what controls govern it
10. Does the BAA explicitly cover the patient portal and any mobile apps the vendor distributes
11. Is books and records access for HHS preserved
12. Are amendment and accounting-of-disclosures requests supported, and what is the SLA

## Common mistakes

- **Reading only the boilerplate.** Most EHR BAAs are well-drafted on the required terms and weak on the EHR-specific concerns above. Read past page two.
- **Assuming integrations are covered.** Ask, in writing, whether each integration partner is a subcontractor of the EHR vendor or a separate business associate you must contract with directly.
- **Ignoring the portal.** The portal is the patient's direct interface with PHI. Treat it as a first-class part of the EHR scope, not an add-on.
- **Skipping the termination clause.** Practices that change EHR vendors and discover six-figure data export fees almost always failed to negotiate this clause up front.
- **Not tracking the BAA.** Sign it, file it, and put the renewal date on the compliance calendar. See [tracking BAA renewals](/learn/vendor-management/track-baa-renewals) for the cadence.

For the broader question of when a vendor needs a BAA at all, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). For a HIPAA-native compliance program that tracks every vendor BAA in one place, [PHIGuard](/hipaa) is built for small clinics.
