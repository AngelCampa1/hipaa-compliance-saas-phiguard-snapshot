---
title: "PHI in Revenue Cycle Management: HIPAA Rules for Billing and Claims"
seoTitle: "PHI in Revenue Cycle Management: HIPAA Guide"
description: "Revenue cycle management touches demographics, diagnoses, procedures, and remittance data across multiple business associates. This guide explains the HIPAA rules and the BAA controls clinics most often miss."
metaDescription: "How PHI flows through revenue cycle management, HIPAA rules for billing companies and clearinghouses, and BAA requirements for RCM vendors."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
intent: "consideration"
summary: "Revenue cycle management exposes PHI to coders, billing companies, clearinghouses, and payers. Each link in that chain has HIPAA obligations and most require a BAA. This guide covers the data flow, the rules, and the contracts you need. It helps teams map where PHI appears in ordinary workflows, limit unnecessary exposure, and document the safeguards used around messages, files, devices, and vendors."
keyTakeaways:
  - "RCM PHI includes demographics, dates of service, ICD-10, CPT, claim files, ERA/EFT remittance, and denial documentation."
  - "Billing companies, outside coders, and RCM service providers are business associates under 45 CFR 160.103 and require a BAA."
  - "Clearinghouses are themselves covered entities under 45 CFR 160.103 but still require a BAA when they perform additional services beyond standard transactions."
  - "Offshore RCM providers are subject to HIPAA for any PHI of U.S. covered entities and must sign a U.S.-enforceable BAA."
  - "The most common gap is denial management: outside staff get full chart access without minimum-necessary controls or audit trails."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR Part 164 - HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "Business Associate Contracts - HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Is a clearinghouse a business associate or a covered entity?"
    a: "Health care clearinghouses are listed as covered entities under 45 CFR 160.103. When a clearinghouse provides services to another covered entity that involve PHI beyond the standard transaction translation, it acts as a business associate for those services and a BAA is required. Most clearinghouse contracts include both roles."
  - q: "Do offshore billing companies have to comply with HIPAA?"
    a: "Yes. HIPAA applies to PHI of U.S. covered entities regardless of where the business associate operates. Offshore billing companies must sign a BAA that is enforceable under U.S. law and must implement Privacy and Security Rule safeguards. State laws may impose additional restrictions on offshore handling."
  - q: "Can our biller post EOBs in a shared inbox?"
    a: "Only with access controls. Remittance documents are PHI. A shared inbox without per-user access controls and audit logging is a minimum-necessary problem under 45 CFR 164.502(b) and a Security Rule access-control problem under 45 CFR 164.312(a)."
---

Revenue cycle management is the longest PHI chain in most small practices. Charge capture, coding, claim submission, clearinghouse routing, payer adjudication, remittance posting, denial follow-up, and patient billing each touch identifiable health data, and most of those steps are performed by outside vendors. Each link is a HIPAA exposure point.

This guide covers the PHI flowing through revenue cycle management, the rules that govern it, and the gaps that turn into audit findings.

## What PHI flows through revenue cycle management

A typical claim carries:

- **Demographics** - name, address, date of birth, member ID, employer in some cases.
- **Dates of service** - including admission and discharge dates.
- **Diagnoses** - ICD-10 codes, sometimes with narrative descriptions.
- **Procedures** - CPT and HCPCS codes, modifiers, units, NDC numbers for drugs.
- **Provider identifiers** - NPI, taxonomy, place of service.
- **Claim and remittance data** - 837 claim files, 835 ERA files, EFT trace numbers, EOBs.
- **Denial documentation** - payer letters, medical records attached to appeals, peer-to-peer notes.

Denial management is the part that surprises practice administrators. To work a denial, an outside biller often needs the full clinical note, imaging report, or medication list. That is direct chart access by a non-employee. Without controls, it is a minimum-necessary violation and an audit-trail gap at the same time.

## HIPAA requirements that apply

Revenue cycle management is governed by the same Privacy and Security Rules as any other PHI flow:

- **Permitted use for payment** - Disclosure of PHI for payment activities is permitted without authorization under 45 CFR 164.506(c)(1) and 164.506(c)(3). That includes claim submission, coverage verification, and collections.
- **Business associate status** - Billing companies, RCM service providers, outside coders, denial-management firms, and revenue analytics vendors are business associates under 45 CFR 160.103 and require BAAs under 45 CFR 164.504(e).
- **Clearinghouse role** - Clearinghouses are covered entities under 45 CFR 160.103 and also act as business associates when they provide services beyond standard transaction translation. A BAA is required for the business associate functions.
- **Minimum necessary** - Under 45 CFR 164.502(b) and 164.514(d), each request for PHI in the RCM chain must be limited to the minimum necessary for the payment purpose.
- **Security Rule safeguards** - Access controls, audit logging, encryption, and risk analysis under 45 CFR 164.308 and 164.312.
- **Patient access and accounting** - Patients have access rights under 45 CFR 164.524 and may request an accounting of certain disclosures under 45 CFR 164.528.

## Common compliance gaps in revenue cycle management

**1. Outside coders with full EHR access.** External coders are routinely given the same EHR role as in-house staff. That is convenient but exceeds minimum necessary for most coding work. The fix is a coder-specific role with read-only access to the documents required for code assignment and an audit trail that records every chart they open.

**2. Denial management without role boundaries.** Denial workers need clinical content to appeal, but they rarely need ongoing access to the entire patient record. Time-bounded access tied to the specific denial is the minimum-necessary control and is rarely implemented.

**3. ERA and EFT files in unsecured email or shared drives.** 835 remittance files contain PHI. Posting them to a generic shared inbox or unencrypted SFTP without access controls is a Security Rule problem.

**4. Offshore RCM with no enforceable BAA.** Some offshore vendors operate under a parent-company BAA that is silent on offshore handling, or under a BAA that is governed by foreign law. The BAA must be enforceable in U.S. courts and must explicitly cover the offshore site.

## How to make revenue cycle management HIPAA-compliant

1. **Inventory every vendor in the RCM chain.** Billing service, coders, clearinghouse, denial-management firm, statement vendor, collections agency, analytics provider. For each, confirm a current signed BAA and the specific PHI categories they touch.
2. **Restrict access by role.** Coders see what coders need. Denial workers see what they need for the specific case. Statement vendors see demographics and balance, not full charts. Configure the EHR roles to match.
3. **Turn on audit logging for outside users.** Every external account that touches PHI must be logged with user, patient, document, and timestamp. Review the logs at least quarterly.
4. **Encrypt every transport.** SFTP with strong authentication for batch files, TLS 1.2+ for web portals, no plain email for claim attachments or appeal documents.
5. **Confirm offshore controls in writing.** If any RCM work is performed outside the U.S., the BAA must name the offshore entity, the country, and the safeguards. Verify that the parent and the offshore subsidiary are both bound.

## Vendor BAA requirements for RCM software

Before signing or renewing an RCM BAA, confirm:

- **Scope** - claim files, remittance files, EOBs, clinical attachments for appeals, patient demographics, payment data.
- **Subcontractors** - clearinghouses used, offshore subsidiaries, analytics platforms, statement printers. Downstream BAAs required under 45 CFR 164.308(b).
- **Permitted uses** - limited to RCM services for the covered entity. No use of PHI for the vendor's own analytics, benchmarking against other customers, or sale to third parties.
- **Security controls** - encryption at rest and in transit, MFA for all accounts, access logging, vulnerability management, incident response timelines.
- **Audit rights** - the right to review the vendor's controls, SOC 2 reports, and access logs on reasonable notice.
- **Breach notification** - defined maximum window, with the supporting investigation cooperation that lets the covered entity meet the 45 CFR 164.404 timeline.
- **Termination** - return or destruction of all PHI, including backups and analytics datasets, with written attestation.

For a broader framework on which vendors qualify, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). For neighboring PHI flows in the same practice, the [PHI workflows hub](/learn/phi-workflows) covers the rest of the map.

To centralize vendor BAAs, RCM access logs, and minimum-necessary policies in one compliance system built for clinics, [PHIGuard](/hipaa) gives you a published plan details and a BAA details available during plan review in every tier.
