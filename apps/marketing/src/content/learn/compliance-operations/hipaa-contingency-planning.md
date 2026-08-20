---
title: "HIPAA Contingency Planning for Small Clinics"
seoTitle: "HIPAA Contingency Planning"
description: "How 45 CFR 164.308(a)(7) applies to small clinics: backups, disaster recovery, emergency mode, testing, and applications and data criticality analysis."
metaDescription: "HIPAA contingency planning for small clinics: backups, disaster recovery, emergency mode operations, testing, and criticality analysis."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "The Security Rule requires a contingency plan that keeps PHI available and the clinic operating through disruptions. For small clinics, the plan is the combination of a tested backup, a short disaster recovery playbook, emergency mode procedures, and a criticality analysis that ranks systems by patient-care impact."
keyTakeaways:
  - "45 CFR 164.308(a)(7) names five components: data backup, disaster recovery, emergency mode, testing, and criticality analysis."
  - "An untested contingency plan is not considered maintained. At least one test per year is the working minimum."
  - "Emergency mode procedures are the manual workflow that keeps care going when the EHR is down."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 164.308(a)(7) - Contingency Plan"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308#p-164.308(a)(7)"
    publisher: "eCFR"
  - title: "NIST SP 800-34 Rev. 1 - Contingency Planning Guide for Federal Information Systems"
    url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final"
    publisher: "NIST"
  - title: "NIST SP 800-66 Rev. 2"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "How often does HIPAA require backup testing?"
    a: "The rule requires testing and revision but does not set a frequency. NIST SP 800-34 and common practice point to at least once per year, with restore-to-a-scratch-environment tests preferred over simple log checks."
  - q: "Is cloud backup enough by itself?"
    a: "Cloud backup is a component, not a plan. The clinic also needs documented recovery steps, defined roles, an emergency-mode procedure, and evidence the whole thing has been tested."
  - q: "What counts as emergency mode operations?"
    a: "The manual workflow that keeps patient care going when the EHR or network is unavailable. It usually includes paper encounter forms, a downtime medication list, and a plan to reconcile data back into the EHR once systems return."
---

Ransomware, fiber cuts, flooded server rooms, and cloud provider outages all produce the same small-clinic question: how do we keep caring for patients while the EHR is down. 45 CFR 164.308(a)(7) names the answer - a written, tested contingency plan - but leaves the specifics to the covered entity.

For a clinic of three to fifty staff, a usable plan fits in a single document with five sections that match the rule.

## The five required components

The Security Rule calls out five implementation specifications under the Contingency Plan standard.

- Data backup plan. A procedure for creating and maintaining retrievable exact copies of ePHI.
- Disaster recovery plan. Procedures to restore any loss of data.
- Emergency mode operation plan. Procedures to continue critical business processes that protect ePHI security during an emergency.
- Testing and revision procedures. Periodic testing and updates of the plan.
- Applications and data criticality analysis. An assessment of the relative criticality of specific applications and data.

The first three are required, the last two are addressable, but in practice a small clinic should treat all five as required. Skipping the criticality analysis is the fastest way to build a plan that prioritizes the wrong systems.

## Data backup plan

Backups should cover every system that holds ePHI, not just the EHR. That includes imaging, dictation, secure messaging archives, the task-management system, and any local file server. Each system needs a documented backup frequency, retention window, storage location, and encryption state.

For cloud-hosted systems, the vendor handles the mechanics, but the clinic still owns the documentation. The BAA should confirm encryption at rest and in transit, and the clinic should verify the vendor's stated recovery point objective matches the clinic's tolerance for data loss. See the [HIPAA audit log requirements guide](/learn/compliance-operations/hipaa-audit-log-requirements-small-clinics) for how backup events should appear in logs.

## Disaster recovery plan

The disaster recovery plan is the step-by-step for restoring data and systems. It names the people who execute the steps, the order of restoration, and the dependencies between systems. A recovery plan that assumes one IT person will handle everything breaks the moment that person is unreachable.

Two working targets anchor the plan. The recovery time objective is how long the clinic can tolerate a system being down. The recovery point objective is how much data loss the clinic can tolerate. Both come from the criticality analysis, not from a template.

## Emergency mode operation plan

Emergency mode is the manual workflow that runs when systems are unavailable. For a clinic, it usually covers downtime encounter forms, a paper medication list for active patients, a procedure for verifying allergies and problem lists without the EHR, and a reconciliation step for loading the paper records back in once systems are restored.

Emergency mode also covers security. PHI written on paper during downtime is still PHI. It needs the same workstation use and clean-desk controls, covered in the [workstation use policy guide](/learn/compliance-operations/workstation-use-policy-small-clinic).

## Testing and revision

An untested plan is not considered maintained. NIST SP 800-34 Rev. 1 describes a testing continuum that ranges from tabletop exercises to full restore tests. For small clinics the practical minimum is one test per year, documented with date, participants, scenario, findings, and remediation actions.

The [tabletop exercises guide](/learn/incident-response/tabletop-exercises-for-hipaa-incident-response) covers a ransomware scenario that doubles as a contingency-plan test. A backup restore to a scratch environment adds the data-side proof.

## Applications and data criticality analysis

The criticality analysis ranks systems by impact on patient care and clinic operations. The EHR is almost always top-tier. The scheduling system is usually tier one as well because it gates the whole day. Payroll, marketing, and internal file-sharing typically fall to tier two or three.

The ranking drives the recovery order and the recovery time objectives. Without it, the disaster recovery plan is a list with no priorities, which is the same as no plan at all.

## Where this intersects with the rest of the program

The contingency plan is reviewed in the [annual review checklist](/learn/compliance-operations/hipaa-annual-review-checklist), tested via tabletops and restore drills, and referenced during any incident that triggers emergency mode. Platforms such as [PHIGuard](/hipaa) attach each of the five components to a recurring task and a test evidence record so the plan stays current and the paper trail is always ready.

## What to do next

Open the current contingency plan. Check whether all five components are present and whether the last test has a dated artifact in the evidence folder. If either is missing, schedule a two-hour working session this quarter to close the gap before it becomes a finding.
