---
title: "HIPAA Business Continuity Planning"
description: "What the HIPAA Security Rule actually requires for contingency planning, and how small clinics can build a defensible business continuity plan without enterprise IT resources."
metaDescription: "HIPAA contingency planning guide for small clinics: required safeguards, backup plans, emergency mode operations, testing, and evidence."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: compliance-operations
schemaType: article
intent: consideration
summary: "Most small clinics either have no written contingency plan or have a plan that covers the EHR and nothing else. The HIPAA Security Rule's contingency planning standard under 45 CFR Section  164. 308(a)(7) requires five distinct components - including a data backup plan, disaster recovery plan, and emergency mode operation plan - and requires periodic testing."
keyTakeaways:
  - "The HIPAA contingency plan requirement has five distinct components: data backup plan, disaster recovery plan, emergency mode operation plan, testing and revision procedures, and applications and data criticality analysis."
  - "Emergency mode means your clinic must be able to continue protecting PHI even when normal systems are unavailable - not just restore data after the fact."
  - "Most small clinics back up their EHR but have never tested restoration - the backup is not a recovery plan until someone has verified it actually works."
  - "Paper records are PHI and must be addressed in the contingency plan - a plan that covers digital systems but ignores paper records in a filing cabinet is incomplete."
  - "HIPAA requires periodic testing and revision of the contingency plan; clinics that have never tested their plan are not in compliance with the testing and revision requirement."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: "hipaa-evidence-binder-checklist"
relatedCommercialPath: "/security"
sources:
  - title: "45 CFR Section  164.308(a)(7) - Contingency Plan"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "U.S. Government Publishing Office"
  - title: "HIPAA Security Rule Guidance - Contingency Planning"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "U.S. Department of Health and Human Services"
  - title: "NIST SP 800-66 Rev. 2 - Implementing the HIPAA Security Rule: A Cybersecurity Resource Guide"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "National Institute of Standards and Technology"
faq:
  - q: "Does HIPAA require us to have a written contingency plan?"
    a: "Yes. Under 45 CFR Section  164.308(a)(7), covered entities must implement a contingency plan as an addressable implementation specification. 'Addressable' does not mean optional - it means you must either implement the specification or document why it is not reasonable and appropriate for your circumstances, and implement an equivalent measure. For virtually all clinics with any digital PHI, a written contingency plan is required."
  - q: "How often must we test our contingency plan?"
    a: "The regulation requires 'periodic' testing and revision under 45 CFR Section  164.308(a)(7)(ii)(D), but does not specify a frequency. HHS guidance and NIST SP 800-66 recommend at least annual testing. The practical standard is: document your testing frequency, conduct tests on that schedule, and update the plan after each test."
  - q: "What counts as testing the contingency plan?"
    a: "Testing can range from a tabletop exercise - walking through the plan with key staff to identify gaps - to a live drill restoring from backup to a test environment. At minimum, you should verify annually that your backups can actually be restored and that the person responsible for executing the plan knows what to do."
---

Contingency planning is the compliance requirement most consistently deferred at small clinics. Other priorities are more visible, and a disaster seems unlikely on any given day. The HIPAA Security Rule does not allow deferral. When an incident occurs - ransomware, a flooded server room, a fire in the records storage area - the clinic faces two simultaneous problems: the operational emergency and the compliance gap.

## What the Regulation Actually Requires

Under 45 CFR Section  164.308(a)(7), covered entities must implement a contingency plan that addresses five specific components. The regulation lists each as a required or addressable implementation specification:

| Component | Status | What It Requires |
|---|---|---|
| Data backup plan | Required | Procedures to create and maintain retrievable exact copies of electronic PHI |
| Disaster recovery plan | Required | Procedures to restore lost data |
| Emergency mode operation plan | Required | Procedures to enable continuation of critical business processes for protection of ePHI while operating in emergency mode |
| Testing and revision procedures | Addressable | Procedures for periodic testing and revision of the contingency plan |
| Applications and data criticality analysis | Addressable | Assessment of relative criticality of applications and data in support of the other contingency plan components |

"Required" means the specification must be implemented. "Addressable" means the clinic must assess whether implementation is reasonable and appropriate for its circumstances. For virtually all clinics with any electronic PHI, both addressable specifications are appropriate and must be implemented.

Most small clinic contingency plans, when they exist, cover only the data backup plan. The other four components are frequently absent.

## Breaking Down Each Component

### Data Backup Plan

The data backup plan must establish procedures to create and maintain retrievable exact copies of electronic PHI. A backup that has never been tested for restoration is not a backup - it is an assumption.

**What to document:**
- What data is being backed up (EHR data, scheduling data, billing records, employee training records, scanned documents)
- How frequently backups occur (daily, hourly, or continuous replication)
- Where backups are stored (on-site, off-site, cloud)
- Who is responsible for verifying that backups completed successfully
- Retention period - how long backup copies are kept

A common gap is backup coverage. Clinics often back up their EHR database but not their scheduling or billing systems. If those systems contain PHI - and most do - they must be included in the backup plan.

### Disaster Recovery Plan

The disaster recovery plan covers what happens after a data loss event. The data backup plan says how copies are made; the disaster recovery plan says how those copies get restored and who does it.

**Two concepts to define in plain terms:**

**Recovery Point Objective (RPO):** How much data can the clinic afford to lose If your EHR backs up daily at midnight and ransomware strikes at 4 PM the following day, you could lose up to 16 hours of patient data. The RPO is the maximum tolerable data loss, expressed in time. Define it explicitly - for example, "we cannot lose more than four hours of appointment and clinical documentation data."

**Recovery Time Objective (RTO):** How long can the clinic operate without the EHR before it becomes a patient safety problem For most clinics, more than 24 hours is untenable. The RTO is the maximum time to restore operations - define it: "we must restore EHR access within 24 hours of an incident."

Once you define your RPO and RTO, you can evaluate whether your current setup can actually meet them. Many clinics discover that a daily backup schedule and a restore process that takes 48 hours cannot meet the objectives they would find acceptable in practice.

### Emergency Mode Operation Plan

Emergency mode is the most frequently misunderstood component. It is not the recovery phase - it is the period during which the clinic must continue to function while normal systems are unavailable. The question is how to continue caring for patients and protecting their PHI while the EHR is down, the network is offline, or the building is inaccessible.

**Emergency mode procedures must address:**

- Who makes the call to activate emergency mode, and what the activation criteria are
- How patients are checked in and care is documented without EHR access (paper downtime procedures)
- How PHI contained in paper records is secured during an evacuation
- Who is authorized to access backup copies of records during emergency mode
- How downtime documentation is entered into the EHR once systems are restored

A clinic that has moved to electronic records still generates paper during downtime procedures. Those paper records are PHI and must be secured, tracked, and integrated back into the patient record.

### Physical Safeguards in Continuity

Paper records require specific planning. If your clinic stores paper records in a filing room that is at ground level in a flood zone, or in a basement without fire suppression, your contingency plan must address what happens to those records in the relevant scenarios.

**Minimum questions the plan must answer for paper records:**
- Where are paper records stored, and what environmental risks apply to that location
- Who is responsible for securing paper records during an evacuation
- What is the recovery procedure if paper records are damaged or destroyed
- Are critical paper records (vaccination records, signed authorizations, NPP acknowledgments) retained in any secondary format

A common gap: clinics that completed a digital records migration still have years of paper records in storage. Those records are covered by the contingency plan requirement.

### Testing and Revision Procedures

The regulation requires periodic testing of the contingency plan and revision based on testing results. Most small clinics have never run a test.

**What testing looks like in practice:**

A **tabletop exercise** is the minimum viable test. Walk through a simulated scenario - "it is 8 AM Monday and no one can log into the EHR" - with the administrator, Privacy Officer, and whoever handles IT or vendor management, following the contingency plan step by step. The goal is to find gaps: missing contact numbers, unclear decision points, steps that assume resources or access that may not be available.

A **restoration test** goes further: an actual restore from backup to a test environment, verifying that the restored data is intact and complete. This should happen at least annually. If your backup vendor offers restoration testing as part of their service, use it.

After each test, document what was tested, what gaps were found, and what changes were made to the plan. The revision is part of the compliance record.

### Applications and Data Criticality Analysis

Before the other components can be prioritized effectively, the clinic must assess which applications and data are most critical to patient care and regulatory compliance. This analysis drives the prioritization of recovery efforts.

**A simple criticality framework for small clinics:**

| Priority | System/Data | Rationale |
|---|---|---|
| Critical | EHR (active patient records) | Patient safety; PHI access; billing |
| Critical | Scheduling system | Patient access; appointment data |
| High | Billing/claims system | Revenue cycle; may contain PHI |
| High | Employee training records | Compliance documentation |
| Medium | Email system | Communication; may contain PHI in transit |
| Medium | Paper records (storage) | Backup for EHR records; legal requirements |
| Standard | Administrative files | Operational but not patient-safety critical |

The criticality analysis determines which systems get restored first, and what the corresponding RPO and RTO targets are for each.

## The Most Common Contingency Planning Gaps

After reviewing the regulatory requirements, most small clinics can identify their gaps quickly. The most common ones:

**Gap 1: No designated person to execute the plan.** The plan exists in a document, but no one has been told they are responsible for activating it. When an incident occurs, staff do not know who makes decisions.

**Gap 2: Backups exist but restoration has never been tested.** The vendor takes nightly backups. No one has ever attempted a restore. The backup is assumed to work.

**Gap 3: The plan covers the EHR but not other systems.** Scheduling, billing, and document management systems are left out of the backup and recovery scope, even though they contain PHI.

**Gap 4: No downtime procedures.** The plan says "restore from backup" but does not address how the clinic operates in the hours or days before restoration is complete.

**Gap 5: Paper records are not addressed.** The plan treats the problem as entirely digital and ignores paper records stored on-site.

**Gap 6: The plan has never been tested or updated.** The document was created during an initial compliance project and has not been reviewed since, even as systems and staff have changed.

## Building a Minimal Viable Contingency Plan

If your clinic has no written plan, start with these four actions:

1. **List every system that stores or processes PHI** - EHR, scheduling, billing, document storage, email. Note where data is backed up and how frequently.

2. **Define your RPO and RTO** for each critical system. Be honest: "how long can we actually go without the EHR before we have a patient safety problem"

3. **Write your emergency mode procedures** - the paper downtime protocol, the staff contact list, and the activation criteria. One page is sufficient for a small clinic.

4. **Schedule a restoration test** with your backup vendor or IT support. Verify that you can actually recover data from your most recent backup.

Document each step. The written plan, the restoration test result, and any revisions made after testing are the evidence that satisfies the contingency planning requirement. A plan that exists only as institutional memory does not.
