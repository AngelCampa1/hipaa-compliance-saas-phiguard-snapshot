---
title: "HIPAA Software for Home Health Agencies"
audience: "Home Health Agencies"
seoTitle: "HIPAA Software for Home Health"
description: "How home health agencies should evaluate HIPAA software for field-worker mobile device controls, visiting-nurse BAAs, OASIS handoffs, and field incident logging."
metaDescription: "HIPAA software for home health agencies. Mobile device controls, visiting-nurse BAAs, OASIS handoffs, and field incident logging."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
summary: "Home Health Agencies needs HIPAA software that matches daily workflow, staff capacity, vendor oversight, incident documentation, training records, and audit evidence. How home health agencies should evaluate HIPAA software for field-worker mobile device controls, visiting-nurse BAAs, OASIS handoffs, and field incident logging. The buying decision should focus on repeatable ownership, conservative PHI handling, source-backed compliance posture, and pricing that fits the practice rather than enterprise administration. Field-worker mobile."
keyTakeaways:
  - "Field-worker mobile devices are the largest PHI exposure surface in a home health agency."
  - "OASIS documentation creates recurring handoff points that must be auditable."
  - "Incident reporting has to work from the field, not only from the office."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/pricing"
sources:
  - title: "HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html"
    publisher: "HHS"
  - title: "45 CFR 164.310 — Physical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.310"
    publisher: "eCFR"
  - title: "OASIS Guidance"
    url: "https://www.cms.gov/medicare/quality/home-health/oasis-user-manuals"
    publisher: "CMS"
faq:
  - q: "What is the biggest HIPAA risk for a home health agency?"
    a: "Lost or stolen mobile devices carrying PHI. Laptops and tablets used in the field are the most common source of breach reports from home health."
  - q: "Does an OASIS assessment count as PHI?"
    a: "Yes. OASIS contains clinical and identifying information and is subject to HIPAA. Handoffs from the field to the office are a privacy and security event."
  - q: "Do we need separate BAAs for each field clinician's device?"
    a: "No. A BAA is with a business associate, not a device. You need BAAs with the software vendors and MDM providers processing ePHI on those devices."
---

## Home health compliance happens in the car, the kitchen, and the driveway

An office-based clinic controls its environment. A home health agency does not. Field clinicians work in patients' homes, document in cars between visits, handle paper OASIS drafts, and sometimes lose a phone between the third and fourth visit of the day. The compliance program has to hold up in those conditions, not only during a quarterly office review.

That changes what matters in HIPAA software. Policy libraries and attestations still count. But the features that actually prevent breaches are the ones that work on a phone, offline, in ten seconds.

## Field-worker mobile devices are the exposure surface

Most home health breaches trace back to a lost laptop, stolen phone, or unencrypted tablet. 45 CFR 164.310 requires physical safeguards, including device and media controls, and 164.312 requires technical safeguards like encryption and access control. Your software should enforce three things at minimum:

- **Device inventory per workforce member.** Every device that touches PHI is listed, owned, and confirmed periodically.
- **Encryption attestation.** A recurring task that confirms each device has disk encryption enabled. Not a one-time checkbox.
- **Lost-device incident flow.** A three-minute path from "I cannot find my phone" to a logged incident with a named responder, because the breach notification clock starts at discovery.

Mobile device management is a separate vendor relationship. The MDM vendor needs a BAA. So does the cloud backup provider. So does the EHR. The BAA register should list them all with expiration dates.

## OASIS handoffs are compliance events

OASIS documentation moves from the field clinician to quality assurance to billing. Each handoff is a PHI event. The risk is not the clinical content; it is the mechanism. Paper drafts in glove compartments, photos of forms texted to the office, and unencrypted email attachments all create findings.

A working handoff model:

- OASIS drafts live in a BAA-covered system from start to finish.
- Paper, if used at all, has a documented destruction step that is logged as a completed task.
- QA review and billing handoff are recorded steps with timestamps and named owners.

This is less about software features and more about whether the compliance program can prove, after the fact, who touched what and when.

## Incident reporting has to work from the field

A clinician who discovers a potential breach at 2pm between visits should not have to wait until 5pm at the office to report it. The software should let them log the incident from the phone, attach a photo if relevant, and hand it off to the compliance lead. From there the standard incident workflow runs: initial assessment, risk analysis per 45 CFR 164.402, notification decisions, and documentation.

The breach notification clock is statutory. Field-friendly reporting is what keeps you on the right side of it.

## What to look for in the software

- Mobile device inventory with periodic encryption attestation.
- BAA register covering EHR, MDM, backup, messaging, and any vendor processing ePHI.
- Recurring training and acceptable-use attestations, signed from the phone.
- Incident capture from field devices with a named responder.
- Policy library including bring-your-own-device, acceptable use, and workstation-in-home policies.
- Current pricing is available on the pricing page, because home health headcount is high and seat-based pricing penalizes growth.

## The defensible home health model

Five artifacts, kept current: workforce roster with device assignments, vendor and BAA register with expirations, field-ready policy library with attestations, incident log, and recurring-task ledger covering encryption checks and access reviews. PHIGuard covers all five under current pricing with BAA details on the pricing page.

For the rules behind the controls, see our [HIPAA basics](/learn/hipaa-basics/what-is-phi). For a program self-check, request the [self-assessment](/resources/hipaa-compliance-self-assessment). Price the move on the [pricing page](/pricing). Agencies that also operate a central office can compare the [multi-location model](/hipaa-software/multi-location-clinics) since the location-scoped role pattern carries over.

## Source Posture and Buying Criteria

HIPAA Software for Home Health Agencies should be selected around the actual operating model of Home Health Agencies, not around a generic HIPAA checklist. The source set for this page is eCFR: 45 CFR 164.310 — Physical Safeguards. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. The clinic should keep the final decision tied to its own risk analysis, vendor inventory, training records, and incident response process.

The strongest software fit is the one that makes recurring compliance work visible and assignable. Field-worker mobile devices are the largest PHI exposure surface in a home health agency. OASIS documentation creates recurring handoff points that must be auditable. Incident reporting has to work from the field, not only from the office. For this audience, that usually means clear task ownership, dated evidence, role-based access, practical reminders, and a way to separate PHI from ordinary internal notes or notifications.

Before rollout, document which workflows are approved, which systems remain the source of truth, who reviews overdue work, and how the practice exports evidence if asked by a payer, partner, attorney, or regulator. If the team also uses an EHR, billing platform, messaging tool, or spreadsheet, decide what stays there and what moves into the HIPAA workflow layer so compliance records do not fragment across systems.
