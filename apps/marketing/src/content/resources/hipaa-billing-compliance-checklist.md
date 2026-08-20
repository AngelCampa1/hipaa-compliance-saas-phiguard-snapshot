---
title: "HIPAA Medical Billing Compliance Checklist"
headline: "Close the HIPAA gaps your billing operation creates without you noticing"
description: "A billing-specific HIPAA compliance checklist covering TPO, BAAs, minimum necessary, statement design, and offshore billing considerations."
metaDescription: "HIPAA medical billing compliance checklist. TPO disclosures, BAAs, minimum necessary, patient statements, denial workflows, offshore billing rules."
magnetSlug: "hipaa-billing-compliance-checklist"
summary: "A billing-specific HIPAA compliance checklist covering TPO, BAAs, minimum necessary, statement design, and offshore billing considerations. It gives small clinics confirm TPO disclosures are within the payment exception in § 164.506, inventory billing-related business associates and BAA dates, and a practical way to document owners, review dates, exceptions, and follow-up evidence for medical billing compliance checklist without inventing a separate compliance workflow."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Confirm TPO disclosures are within the payment exception in § 164.506"
  - "Inventory billing-related business associates and BAA dates"
  - "Apply minimum necessary to coding and claim attachments"
  - "Audit patient statement envelopes and portal access controls"
  - "Document offshore billing operations against your risk analysis"
  - "Common billing-related compliance gaps to fix this quarter"
faq:
  - q: "Is this free?"
    a: "Yes. Enter your email and we will send the full resource to your inbox."
  - q: "Do we need a BAA with our clearinghouse?"
    a: "Yes. A clearinghouse handles PHI on your behalf and is a business associate under § 160.103. The BAA must be executed before any PHI is exchanged."
  - q: "Can we put a diagnosis on a patient invoice?"
    a: "Only the minimum necessary to communicate the charge. Most practices include CPT and amount but exclude clinical diagnosis context. Including narrative diagnosis on a patient-facing invoice is a frequent minimum-necessary failure."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
sources:
  - title: "45 CFR § 164.508 — Uses and disclosures requiring authorization"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.508"
    publisher: "Electronic Code of Federal Regulations"
  - title: "45 CFR Part 162 — Administrative Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-162"
    publisher: "Electronic Code of Federal Regulations"
  - title: "HIPAA for Professionals"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "U.S. Department of Health and Human Services"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedLearnPath: "/learn/operations"
relatedCommercialPath: "/hipaa"
---

Billing is where HIPAA quietly breaks for most small clinics. The clinical side has a privacy officer and a training program. The billing side has a clearinghouse, two coders, an aging report, and a stack of patient statements going out by paper. Each one of those touchpoints is a PHI flow, and each one needs to sit cleanly inside HIPAA's payment exception, your BAAs, and your minimum-necessary policy.

This checklist is the audit your billing operation should pass.

## TPO and the payment exception

Treatment, payment, and operations disclosures do not require patient authorization under § 164.506. Billing falls inside the payment branch. The exception is broad but it does not turn off minimum necessary, it does not eliminate the need for BAAs with your billing vendors, and it does not authorize disclosures to entities that are not part of payment, treatment, or operations.

## BAAs for the billing supply chain

Every entity that handles PHI on your behalf in the billing flow needs a BAA: clearinghouse, billing service, coding service, statement printer and mailer, payment portal vendor, denial-management vendor, and any RCM platform. Maintain a single inventory with vendor, BAA effective date, BAA renewal date, and the data flow involved. If you cannot produce that inventory in five minutes, you have a finding.

## Minimum necessary in coding

Coders only need access to the chart sections necessary to code the encounter. Full longitudinal access for routine coding is a minimum-necessary problem under § 164.502(b). Configure role-based EHR access so coders see the encounter, the relevant history, and the order set, not the entire patient record.

## Claim attachments

When attaching documentation to claims, send what the payer requires and no more. Sending an entire chart when a single operative note was requested is the most common over-disclosure pattern in claim submissions.

## Patient statement design

Patient statements are PHI by definition. Audit envelope contents (no clinical detail visible through the window), portal access controls (multi-factor where the portal handles balances tied to specific encounters), and email reminders (no diagnosis, no CPT narrative, just account references). The line item on a statement should describe a service, not a clinical condition.

## Insurance verification handling

Eligibility checks pull PHI back into your system. Confirm the verification tool runs under a BAA, that staff do not paste eligibility responses into general email or chat, and that any cached verification data follows your retention schedule.

## Denial management

Denials concentrate PHI in spreadsheets and shared queues. Confirm access controls match minimum necessary, that the work queue is inside a covered system (not exported to personal Excel), and that vendor-side denial management sits under a BAA.

## Offshore billing operations

Offshore billing is permitted under HIPAA but introduces risk-analysis obligations: where the data sits, how it transits, what controls the vendor enforces, and how breach notification operates across jurisdictions. Document the offshore flow in your § 164.308(a)(1) risk analysis with explicit treatment.

## Common gaps to fix this quarter

Diagnosis narrative on patient invoices. Statement vendor with a stale BAA. Coders with full chart access by default. Eligibility responses pasted into email. Denial spreadsheets on a shared drive without access controls. A clearinghouse migration without an updated BAA. Pick three and fix them this quarter.

## How to use this resource in a live HIPAA program

Use the Medical Billing Compliance checklist as a working control record, not as a document that gets filed once and forgotten. Start by naming the owner, the affected workflow, the systems or vendors involved, and the date the review was performed. Then walk through each line with the staff who actually handle the work. HIPAA documentation is strongest when it reflects real operations: who touches PHI, where ePHI is created or transmitted, what access is necessary for the role, and what evidence proves the safeguard is operating.

For this resource, the practical evidence usually includes Confirm TPO disclosures are within the payment exception in § 164.506; Inventory billing-related business associates and BAA dates; Apply minimum necessary to coding and claim attachments; Audit patient statement envelopes and portal access controls. Keep those items with screenshots, vendor records, policy acknowledgements, training logs, or access-review notes when they support the answer. If a line cannot be completed, record the exception, assign an owner, and set a due date instead of leaving the item blank.

## Evidence to keep with the completed resource

Save the final version with the review date, reviewer name, and any follow-up tasks. If the resource supports an administrative safeguard, connect it to your risk analysis and policy review history. If it supports a technical or physical safeguard, keep the configuration evidence or walk-through notes that show what was checked. If it supports a patient-rights or disclosure workflow, keep the request log, response dates, and any correspondence that explains the decision.

PHIGuard positions this kind of artifact as part of day-to-day compliance operations: a task, an owner, evidence, and a repeatable review cadence. The goal is not to create more paperwork. The goal is to make the clinic able to show, with dated records, how it applied HIPAA requirements to the workflow in front of it.

## Review cadence

Review this resource at least once a year and sooner after a material change. Material changes include a new EHR, billing platform, AI tool, telehealth workflow, location, vendor, role, state-law overlay, or incident pattern. During the review, confirm that the source policy still matches current operations, that the listed owner still has authority to make changes, and that unresolved exceptions have not aged into accepted risk without leadership approval.
