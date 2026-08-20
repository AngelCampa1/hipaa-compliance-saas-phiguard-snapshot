---
title: "HIPAA Contingency Plan Template"
headline: "A written HIPAA contingency plan covering data backup, disaster recovery, and emergency operations — ready for your Security Officer to complete"
description: "Download a HIPAA contingency plan template for small medical clinics. Covers all five required components of 45 CFR §164.308(a)(7): data backup, disaster recovery, emergency mode operations, testing, and applications criticality analysis."
metaDescription: "Free HIPAA contingency plan template. Covers all five 45 CFR §164.308(a)(7) components: data backup, disaster recovery, and emergency mode. Download."
magnetSlug: "hipaa-contingency-plan-template"
summary: "Use this contingency plan template to help small clinics turn cited HIPAA requirements into dated operating evidence. It gives staff a practical way to record decisions, owners, review dates, exceptions, and follow-up tasks, then tie the completed artifact back to policies, BAAs, risk analysis, patient-rights workflows, or safeguard reviews."
stage: "awareness"
sequenceStage: "awareness"
bullets:
  - "All five §164.308(a)(7) components: data backup plan, disaster recovery plan, emergency mode operations plan, testing and revision procedures, and applications and data criticality analysis"
  - "A criticality analysis worksheet to identify which systems must be recovered first"
  - "Backup verification checklist with weekly and monthly confirmation steps"
  - "Emergency mode operations procedures for maintaining PHI protection when primary systems are unavailable"
  - "An annual test and revision log to document that the plan is current and has been exercised"
faq:
  - q: "Is a HIPAA contingency plan the same as a disaster recovery plan?"
    a: "The contingency plan required by 45 CFR §164.308(a)(7) is broader than a typical IT disaster recovery plan. It includes data backup, disaster recovery, and emergency mode operations — how you continue to protect PHI and operate your clinic when systems are unavailable — as well as testing and criticality analysis."
  - q: "How often does the contingency plan need to be tested?"
    a: "45 CFR §164.308(a)(7)(ii)(D) requires testing and revision procedures as an addressable specification. Most Security Officers conduct at least an annual test, including a tabletop exercise and a verification of backup restoration. Document the test date, participants, and findings."
  - q: "What counts as emergency mode operations under HIPAA?"
    a: "Emergency mode operations refers to maintaining essential access to PHI and continuing required security protections during a system outage, natural disaster, or other emergency. Your plan must specify which staff have emergency access, which PHI systems are critical, and what manual procedures replace automated controls during the outage."
  - q: "What happens to the contingency plan if we change EHR vendors?"
    a: "Any change to the systems holding ePHI — a new EHR, a cloud migration, a backup vendor change — requires a review and update of the contingency plan. The applications and data criticality analysis and the data backup plan sections will need to be revised to reflect the new environment."
publishedAt: "2026-04-24"
updatedAt: "2026-04-24"
sources:
  - title: "45 CFR §164.308(a)(7) — Contingency Plan"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR / HHS"
  - title: "NIST SP 800-66r2 — Implementing the HIPAA Security Rule: Contingency Planning"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
  - title: "Contingency Planning Guide for Federal Information Systems (NIST SP 800-34r1)"
    url: "https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final"
    publisher: "NIST"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations/hipaa-administrative-safeguards"
verificationDate: "2026-04-24"
---

## Who Needs This Template

Every covered entity must have a written contingency plan as part of its HIPAA Security Rule compliance program. For a small medical clinic, this means every practice with electronic health records, a billing system, or any other system storing ePHI. The plan does not need to be lengthy — but it must exist, be current, and be testable.

OCR enforcement actions following ransomware attacks and data loss events at small clinics frequently cite the absence of a tested contingency plan. When your EHR goes down — whether due to a ransomware attack, a hardware failure, or a natural disaster — an untested plan is often as harmful as no plan.

## What HIPAA Rule It Satisfies

45 CFR §164.308(a)(7) requires covered entities to establish and implement policies and procedures for responding to emergency situations that could damage systems holding ePHI. The rule specifies five components: a data backup plan, a disaster recovery plan, an emergency mode operation plan, testing and revision procedures, and an applications and data criticality analysis.

The data backup plan (§164.308(a)(7)(ii)(A)) is a required specification. The remaining four are addressable — meaning every covered entity must implement them or document an equivalent alternative. Addressable does not mean optional.

NIST Special Publication 800-66r2 provides detailed implementation guidance aligned to the Security Rule.

## What Is Inside This Template

**Section 1 — Applications and Data Criticality Analysis.** A worksheet identifying every system that accesses, stores, or transmits ePHI, ranked by recovery priority. Required inputs: system name, data type, recovery time objective (how quickly it must be restored), recovery point objective (how much data loss is tolerable), and backup method.

For a typical small clinic, the criticality ranking looks like:

- Tier 1 (restore within 4 hours): EHR, scheduling system, active patient records
- Tier 2 (restore within 24 hours): Billing system, payer portal access
- Tier 3 (restore within 72 hours): Historical records archive, analytics tools

**Section 2 — Data Backup Plan.** Documents: what is backed up, how often, where backups are stored, how they are protected in transit and at rest, and how restoration is tested. Required specification.

The template includes a weekly backup verification log — a simple check that the previous backup completed successfully and that a test restoration of a sample file succeeded.

**Section 3 — Disaster Recovery Plan.** Step-by-step procedures for restoring ePHI systems following a disruptive event. Includes: recovery team roles and contact information, recovery sequence aligned to the criticality analysis, vendor contact information for EHR and infrastructure providers, and estimated recovery timelines.

**Section 4 — Emergency Mode Operations Plan.** Procedures for maintaining essential operations and required security protections when primary systems are unavailable. Covers: who has emergency access to ePHI, how authentication is handled during outages, manual procedures replacing automated controls (e.g., paper logs replacing electronic audit trails), and patient care continuity.

**Section 5 — Testing and Revision Procedures.** Annual test schedule, tabletop exercise format, and a post-test revision log. Documents the date tested, participants, scenario used, findings, and corrective actions taken.

## How to Fill It Out

**Step 1.** Complete the criticality analysis first. You cannot write a meaningful recovery plan without knowing which systems matter most.

**Step 2.** Confirm your current backup configuration against the data backup plan template. If your EHR vendor manages backups, get written confirmation of their backup frequency, retention period, and restoration process. Add this to your BAA review.

**Step 3.** Identify your recovery team. Name specific individuals (not just roles), confirm their contact information is current, and assign alternates.

**Step 4.** Set a test date within 90 days of completing the plan. A tabletop exercise — walking through the plan narrative with your recovery team — counts as a test. A live restoration test is better.

**Step 5.** Review and update annually, or after any significant change to the systems covered.

## Who Owns It, Where to Store It, and When to Update It

**Who fills it out:** The Security Officer completes the plan with input from your IT support, EHR vendor, and any backup or infrastructure provider. The criticality analysis section requires clinical and administrative input to rank which systems matter most to patient care continuity.

**Where to store it:** The written contingency plan must be retained for six years from the date of creation or last effective date, per 45 CFR §164.316(b)(2)(i). Keep the current version in a location accessible to the recovery team during an emergency — not only on the system that may be down. A printed copy in a secure physical location and a copy in an offline or separate-cloud-account storage are both good practices.

**How often it is reviewed:** At least annually, and after every test exercise. Document each review and test in the revision log.

**What triggers a required update:** Under §164.308(a)(7)(ii)(D), the testing and revision procedures are addressable and require updating the plan based on test findings. Beyond test results, specific triggers include: a new EHR or backup vendor; a change in facility location or infrastructure; any actual emergency or near-miss incident; a change in the recovery team roster; or an OCR enforcement action or NIST guidance update that identifies a gap in small-clinic contingency planning.

## Download This Template

Enter your email at [phiguard.app/resources/hipaa-contingency-plan-template](/resources/hipaa-contingency-plan-template) to receive the full contingency plan template, the criticality analysis worksheet, the backup verification log, and the annual test record.


## Related Resources

The contingency plan references your backup infrastructure — the [HIPAA data backup plan template](/resources/hipaa-data-backup-plan-template) provides a more detailed standalone backup policy. The [HIPAA security policy template](/resources/hipaa-security-policy-template) is the parent document that references your contingency plan alongside all other Security Rule safeguards. For the administrative safeguards context this plan lives within, read [HIPAA administrative safeguards](/learn/compliance-operations/hipaa-administrative-safeguards) in the PHIGuard compliance library.
