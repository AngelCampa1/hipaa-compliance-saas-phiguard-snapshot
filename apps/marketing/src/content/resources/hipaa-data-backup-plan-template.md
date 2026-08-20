---
title: "HIPAA Data Backup Plan Template"
headline: "A written data backup plan that satisfies the HIPAA Security Rule required specification — with a weekly verification log your team can actually use"
description: "Download a HIPAA data backup plan template for small medical clinics. Covers the required specification of 45 CFR §164.308(a)(7)(ii)(A) including backup frequency, retention, restoration testing, and offsite storage."
metaDescription: "Free HIPAA data backup plan template. Covers 45 CFR §164.308(a)(7)(ii)(A): backup frequency, retention, and restoration testing. Download for your clinic."
magnetSlug: "hipaa-data-backup-plan-template"
summary: "Use this data backup plan template to help small clinics turn cited HIPAA requirements into dated operating evidence. It gives staff a practical way to record decisions, owners, review dates, exceptions, and follow-up tasks, then tie the completed artifact back to policies, BAAs, risk analysis, patient-rights workflows, or safeguard reviews."
stage: "awareness"
sequenceStage: "awareness"
bullets:
  - "Covers the required specification of 45 CFR §164.308(a)(7)(ii)(A) — exact retrievable copies of ePHI"
  - "Backup inventory worksheet: every system holding ePHI listed with backup method and owner"
  - "Weekly verification log proving backups complete successfully and that restoration works"
  - "Offsite and cloud backup requirements with encryption confirmation fields"
  - "A gap analysis checklist comparing your current backup practices to the required specification"
faq:
  - q: "Is a data backup plan required or addressable under HIPAA?"
    a: "Required. 45 CFR §164.308(a)(7)(ii)(A) — creating and maintaining retrievable exact copies of ePHI — is a required implementation specification. It is not addressable and cannot be substituted with an alternative measure."
  - q: "Does the backup plan need to cover all data, or only PHI?"
    a: "The HIPAA requirement specifically applies to ePHI. However, a backup plan that covers only ePHI in isolation often leads to gaps — especially when ePHI is commingled with other data in EHR databases or file servers. Most compliance programs back up entire systems and note which elements contain ePHI."
  - q: "Is a backup to the same physical location sufficient?"
    a: "No. A backup stored only in the same physical location as the primary system provides no protection against physical disasters — fire, flood, or theft. HIPAA's contingency planning requirements contemplate that backups must be recoverable even when the primary facility is unavailable. Off-site or cloud-based backup is the standard approach."
  - q: "How often must we test that backups can be restored?"
    a: "45 CFR §164.308(a)(7) does not specify a restoration test frequency for the data backup plan itself, but the testing and revision procedures specification (§164.308(a)(7)(ii)(D)) requires periodic testing of the full contingency plan, which includes backup restoration. Most organizations test restoration at least annually. Weekly verification that backups complete is the minimum."
publishedAt: "2026-04-24"
updatedAt: "2026-04-24"
sources:
  - title: "45 CFR §164.308(a)(7) — Contingency Plan Implementation Specifications"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR / HHS"
  - title: "NIST SP 800-66r2 — Implementing the HIPAA Security Rule: Contingency Planning"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations/hipaa-administrative-safeguards"
verificationDate: "2026-04-24"
---

## Who Needs This Template

Every medical clinic with electronic patient records needs a written, tested data backup plan. If your clinic's backup process is "the EHR vendor handles it" with no written documentation, no confirmation of what is backed up, and no record of restoration testing, you are out of compliance with a required HIPAA Security Rule specification.

The data backup plan does not require expensive infrastructure. It requires documentation of what you are backing up, how, how often, where the backup goes, and evidence that it works. This template gives you the structure to produce that documentation.

## What HIPAA Rule It Satisfies

45 CFR §164.308(a)(7)(ii)(A) requires covered entities to establish and implement procedures to create and maintain retrievable exact copies of ePHI. This is one of the few required (not addressable) implementation specifications in the Security Rule. There is no alternative measure available — the plan must exist and be documented.

This specification sits within the broader contingency plan requirement of §164.308(a)(7). The [HIPAA contingency plan template](/resources/hipaa-contingency-plan-template) covers all five contingency plan components; this template focuses on the data backup plan component in greater depth.

NIST SP 800-66r2 identifies data backup plan documentation as one of the most frequently deficient areas in small healthcare organization security reviews.

## What Is Inside This Template

**Section 1 — ePHI System Inventory.** A table listing every system that creates, receives, maintains, or transmits ePHI. For each system, the template documents: system name and vendor, data types stored, backup method (automated, manual, vendor-managed), backup owner, backup frequency, retention period, storage location, and encryption status.

A typical small clinic inventory includes:
- EHR system (vendor-managed cloud backup, confirm frequency and retention in writing)
- Local workstations (if any store ePHI locally — this should be minimized)
- Network-attached storage or shared drives
- Email system (if PHI is transmitted via email)
- Billing system (if separate from EHR)
- Document management and scanning systems

**Section 2 — Backup Configuration Requirements.** Documents the minimum required backup frequency (most practices: daily), retention period (minimum recommended: 90 days for operational backups, 6 years for records retention), encryption requirements (AES-256 or equivalent at rest and in transit), and offsite or cloud storage confirmation.

**Section 3 — Weekly Backup Verification Log.** A simple log completed by the designated backup owner each week confirming: that the previous backup completed without errors, that a spot-restoration test of a sample file succeeded, and any exceptions and corrective actions taken.

**Section 4 — Annual Restoration Test Record.** Documents the full restoration test: date, systems tested, staff involved, time to restore, data integrity check results, and any gaps identified.

**Section 5 — Vendor Backup Confirmation.** A template for requesting written confirmation from your EHR and infrastructure vendors: backup frequency, retention period, restoration SLA, encryption specification, and whether the backup copy is geographically separated from the primary data. File the vendor's response alongside this document.

**Section 6 — Gap Analysis Checklist.** A comparison of your current backup practice against the requirements above, identifying gaps and action items.

## How to Fill It Out

**Step 1.** Complete the ePHI system inventory. Start with your EHR and add every other system that touches patient data. Be thorough — backup gaps at a less-obvious system (e.g., the scheduling system) have caused data loss incidents.

**Step 2.** Contact each vendor with more than a single system to obtain written backup confirmation. Do not rely on verbal assurances or a general "cloud backup" claim in a sales brochure.

**Step 3.** Identify the designated backup owner — the staff member or contractor responsible for weekly verification. Assign an alternate.

**Step 4.** Confirm encryption is applied at rest and in transit for all backup destinations. Document the encryption specification.

**Step 5.** Run a restoration test from backup within 30 days of completing the plan. File the test record.

**Step 6.** Set a recurring calendar item for weekly verification and annual restoration testing.

## Who Owns It, Where to Store It, and When to Update It

**Who fills it out:** The Security Officer, with direct input from whoever administers your backup infrastructure — an internal IT role, a managed services provider, or your EHR vendor's technical support team. Every section that references a vendor configuration requires written confirmation from that vendor, not just internal assumptions.

**Where to store it:** The written backup plan must be retained for six years from creation or last effective date per 45 CFR §164.316(b)(2)(i). Store the current version in your compliance program records and ensure your Security Officer can access it during an emergency without depending on the systems being backed up.

**How often it is reviewed:** At minimum annually, aligned with the contingency plan testing cycle. The weekly backup verification log is operational — it does not replace the annual policy review.

**What triggers a required update:** Any change to the ePHI system inventory requires updating the plan. Specific triggers: adding or replacing an EHR, billing system, or document management platform; a change in backup vendor; a change in cloud storage provider; a backup failure or data loss event; a change in the designated backup owner; or a restoration test that reveals a gap in recovery capability. Treat any backup failure discovered during the weekly verification check as a trigger for an immediate review and corrective action, documented in the verification log.

## Download This Template

Enter your email at [phiguard.app/resources/hipaa-data-backup-plan-template](/resources/hipaa-data-backup-plan-template) to receive the full template, verification log, vendor confirmation request letter, and the annual test record form.


## Related Resources

The data backup plan is a component of your broader [HIPAA contingency plan](/resources/hipaa-contingency-plan-template), which also covers disaster recovery and emergency mode operations. The [HIPAA security policy template](/resources/hipaa-security-policy-template) is the parent document that references backup and contingency planning alongside all other Security Rule safeguards. For the administrative safeguards framework this plan lives within, read [HIPAA administrative safeguards](/learn/compliance-operations/hipaa-administrative-safeguards) in the PHIGuard compliance library.
