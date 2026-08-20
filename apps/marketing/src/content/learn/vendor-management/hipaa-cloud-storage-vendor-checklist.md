---
title: "HIPAA Cloud Storage Vendor Checklist"
seoTitle: "HIPAA Cloud Storage Vendor Checklist"
description: "A practical checklist for vetting AWS, Azure, Google Cloud, Box, and Dropbox before storing PHI. Covers BAA scope, encryption, logging, and subprocessors."
metaDescription: "Vet cloud storage vendors for HIPAA before storing PHI. 14-question checklist covering BAA scope, encryption, logging, and subprocessors."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "vendor-management"
schemaType: "article"
intent: "consideration"
summary: "Cloud storage vendors are not interchangeable from a HIPAA perspective. This checklist walks through the 14 questions a small clinic should ask before placing PHI in AWS, Azure, Google Cloud, Box, or Dropbox. It helps clinics evaluate vendor promises against BAA terms, PHI access, subcontractors, retention, incident support, and evidence they can actually review."
keyTakeaways:
  - "A vendor's marketing page may say 'HIPAA compliant' while the BAA only covers specific services or paid tiers."
  - "Confirm encryption at rest (with KMS or customer-managed keys), TLS 1.2+ in transit, and detailed access logging."
  - "Ask for the vendor's subprocessor list and confirm BAA flow-down to each subcontractor that touches PHI."
  - "Geographic data residency matters for state-law overlays and for restricting where backups land."
  - "Free or consumer tiers (Dropbox Basic, personal Google accounts, Box free) do not include a BAA, regardless of feature parity."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management"
sources:
  - title: "45 CFR Section  164.502(e) - Disclosures to Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "HHS Guidance on HIPAA and Cloud Computing"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html"
    publisher: "HHS"
  - title: "HHS Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Is a cloud provider automatically a business associate if PHI is stored there?"
    a: "Yes. HHS guidance on cloud computing is explicit: a cloud service provider that stores or processes PHI on behalf of a covered entity is a business associate, even if the provider only stores encrypted data and never accesses it. A signed BAA is required."
  - q: "Does the BAA cover every product the cloud vendor sells?"
    a: "No. AWS, Azure, and Google Cloud each publish a list of HIPAA-eligible services. Anything outside that list is excluded from the BAA, even if the parent account is covered. Always confirm the specific service is in scope before sending PHI to it."
  - q: "What about consumer Dropbox or a personal Google Drive?"
    a: "Free and consumer tiers do not include a BAA. PHI placed in those accounts is an unauthorized disclosure. Use the business or enterprise tier that explicitly offers a BAA, and confirm the BAA is signed before migration."
---

Cloud storage looks like a commodity. From a HIPAA standpoint, it is not. Two clinics using the same vendor logo can have very different compliance postures depending on which tier they bought, which service they enabled, and whether the BAA was actually executed.

This is a checklist for practice administrators evaluating cloud storage vendors before any PHI lands there. It does not replace a security risk analysis under 45 CFR Section  164.308(a)(1), but it covers the questions you should be able to answer before that analysis even begins.

## Why this vendor category needs HIPAA review

Cloud storage is one of the most common places PHI ends up: scanned intake forms, exported EHR reports, imaging studies, billing spreadsheets, signed authorizations. Once PHI is in the bucket, the vendor is a business associate under 45 CFR Section  160.103, and your clinic is responsible for the chain of custody.

HHS guidance on cloud computing closed the door on a few common arguments. The provider is a business associate even if the data is encrypted with keys the provider does not hold. The provider is a business associate even if it does not view the contents. Mere storage of PHI on behalf of a covered entity is enough to require a BAA.

That makes vendor selection a compliance decision, not just an IT one.

## Required BAA terms for cloud storage

Per 45 CFR Section  164.504(e), every BAA needs to spell out:

- Permitted and required uses and disclosures of PHI
- Appropriate safeguards to prevent unauthorized use or disclosure
- Reporting of security incidents and breaches
- Subcontractor flow-down: any subcontractor handling PHI must agree in writing to the same restrictions
- Return or destruction of PHI at termination, where feasible
- Books and records access for HHS

For cloud storage specifically, look for explicit language on which services are in scope, on encryption obligations, and on who controls the keys. A BAA that says "Vendor will implement appropriate safeguards" without naming the products is too thin to rely on.

## Specific risks for cloud storage vendors

Three risks recur with cloud storage:

1. **Service scope mismatch.** The BAA covers object storage but the team has started using a new analytics service that is not HIPAA-eligible.
2. **Tier mismatch.** Someone signs up for a free or personal tier "to test something" and PHI gets uploaded before the BAA-eligible tier is provisioned.
3. **Subprocessor sprawl.** The vendor uses a CDN, a search index, or a backup vendor that is not on the published subprocessor list, and PHI flows there without a flow-down BAA.

A 2025 OCR enforcement settlement involved a covered entity that left an unsecured cloud storage bucket exposed to the public internet for over a year. The lesson is not that cloud storage is risky in the abstract - it is that misconfiguration plus weak access logging plus no BAA is a compounding failure.

## Evaluation checklist

Walk through every question before you send PHI to a cloud storage vendor. If you cannot answer "yes" or "documented," do not migrate.

1. Is there a signed BAA in place, dated and countersigned by both parties
2. Does the BAA explicitly name the services we plan to use (for example, S3, Blob Storage, Cloud Storage, Box Enterprise, Dropbox Business Advanced)
3. Is encryption at rest enabled with a documented key management approach (KMS, customer-managed keys, or BYOK)
4. Is TLS 1.2 or higher enforced in transit, with weak ciphers disabled
5. Are detailed access logs available (object reads, writes, deletes, permission changes), and how long are they retained
6. Can we restrict which geographic regions store the data and the backups
7. Is there a published list of subprocessors that may touch PHI, and does the vendor commit to BAA flow-down
8. Does the vendor commit to breach notification within a defined timeframe, and what triggers it
9. Are public-access defaults disabled, and is there guardrail tooling (block public access, sensitive data scanners) we should turn on
10. Are MFA and SSO available, and can we enforce them for all users with PHI access
11. What is the vendor's data residency policy for support engineers - can offshore support staff view our data, and under what controls
12. Does the vendor support immutable backups or object lock for ransomware protection
13. What is the documented process for return or destruction of PHI at termination, and what proof is provided
14. Has the vendor produced a recent SOC 2 Type II or HITRUST report we can review

If you sell or support multi-tenant SaaS yourself, add a fifteenth: confirm the vendor's tenant isolation model.

## Common mistakes

- **Treating "HIPAA compliant" marketing copy as a BAA.** A landing page is not a contract. Ask for the actual BAA, signed.
- **Assuming encryption is automatic.** On most cloud platforms encryption at rest is the default, but key rotation, customer-managed keys, and bucket-level enforcement are not. Check.
- **Skipping the subprocessor list.** If the vendor uses a third-party CDN, image processor, or analytics service that touches PHI, that vendor needs a flow-down BAA. The minimum necessary standard does not stop at your direct vendor.
- **Using consumer tiers.** Personal Google Drive, Dropbox Basic, free Box accounts. None of these come with a BAA. Migrate to a business tier with a signed BAA before PHI moves.
- **Forgetting termination.** When the contract ends, where does the data go A BAA without a clear destruction or return clause leaves PHI in limbo.

For a deeper walk-through of when a vendor crosses into business-associate territory, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). For the broader vendor program, the [vendor management hub](/learn/vendor-management) collects the checklists, BAA templates, and review cadences. If you want a HIPAA-native task system to track all of this in one place, [PHIGuard](/hipaa) is built for it.
