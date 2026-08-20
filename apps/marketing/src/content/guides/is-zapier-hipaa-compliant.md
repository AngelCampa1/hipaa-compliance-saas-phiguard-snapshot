---
title: "Is Zapier HIPAA Compliant for Medical Clinics"
vendor: "Zapier"
seoTitle: "Is Zapier HIPAA Compliant"
description: "Zapier's current HIPAA guidance says it is not HIPAA compliant and does not sign a BAA. Clinics should not route PHI through Zaps."
metaDescription: "Is Zapier HIPAA compliant No. Zapier says it does not sign a BAA, so clinics should not route PHI through Zaps."
publishedAt: 2026-04-24
updatedAt: 2026-05-08
verificationDate: 2026-05-08
summary: "Zapier should not be used for workflows that store, send, or automate PHI. Zapier's own HIPAA guidance says the product is not HIPAA compliant and that Zapier does not sign a Business Associate Agreement. Clinics can still use Zapier for healthcare-adjacent operations that avoid PHI, but patient intake, billing, care coordination, and other PHI workflows need a BAA-covered alternative."
keyTakeaways:
  - "Zapier's current public guidance says Zapier is not HIPAA compliant and does not sign a BAA."
  - "Clinics should not route PHI through Zaps, even if every connected app has its own BAA."
  - "Zapier can still support non-PHI healthcare operations such as event outreach, internal triage, and administrative handoffs."
  - "If a workflow touches patient intake, billing, care coordination, or clinical data, use a BAA-covered system instead of automation middleware."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Is Zapier HIPAA compliant"
    url: "https://zapier.com/blog/is-zapier-hipaa-compliant/"
    publisher: "Zapier"
  - title: "Business Associate Contracts - HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
  - title: "HIPAA Security Rule - Administrative Safeguards (45 CFR 164.308)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR / HHS"
faq:
  - q: "Does Zapier's free or Professional plan support HIPAA use?"
    a: "No. Zapier's current HIPAA guidance says Zapier is not HIPAA compliant and does not sign a BAA, so clinics should not use any Zapier plan to automate PHI."
  - q: "Can I use Zapier if the connected apps are HIPAA compliant?"
    a: "Not for PHI. Each connected application may still need its own BAA, but Zapier itself would also be processing the PHI in the automation chain. Without a Zapier BAA, the workflow is not appropriate for PHI."
  - q: "Can Zapier automation replace a HIPAA compliance system?"
    a: "No. Zapier is general-purpose automation middleware. It does not provide the compliance tracking, incident management, or audit-trail features that a clinic compliance program requires."
  - q: "What types of PHI automations pose the most risk?"
    a: "Patient intake routing, billing follow-up, appointment reminders with patient identifiers, clinical task handoffs, and support tickets that mention patient care are all high-risk because the Zap payload may contain PHI."
---

## Verdict: No for PHI

Zapier should not be used to store, send, or automate PHI. Zapier's own HIPAA guidance says the product is not HIPAA compliant and that Zapier does not sign a Business Associate Agreement.

That makes the practical answer simple: do not put patient names, appointment details, diagnoses, insurance information, billing context, portal messages, or clinical notes into a Zap.

## What Zapier can still do in healthcare

Zapier can still be useful for healthcare-adjacent work that does not involve PHI. Examples include:

- webinar or event follow-up for non-patient prospects
- internal task creation from non-clinical contact forms
- vendor onboarding checklists that do not include patient data
- marketing operations where no patient status or treatment relationship is disclosed

The boundary is PHI. Once the payload identifies a patient, describes care, references a visit, includes insurance or billing details, or reveals that someone is seeking care from a specific clinic, the workflow needs a BAA-covered stack.

## The chain problem

Zapier connects applications. If an automation handles PHI, every node in the chain needs to be evaluated as a business associate relationship. A Zap that moves data from an EHR to a spreadsheet to a notification system creates multiple vendor questions:

- the EHR or source system
- Zapier as the automation middleware
- the spreadsheet or destination tool
- the notification platform or messaging channel

Even if the EHR, spreadsheet vendor, and notification platform each have BAAs, the middleware still processes the payload. Zapier's current no-BAA posture means the chain breaks at Zapier.

## Common workflows to move off Zapier

The most common clinic automations that should not run through Zapier are:

- patient intake form submission to spreadsheet or CRM
- EHR event to Slack, Teams, email, or SMS notification
- appointment or referral follow-up that includes patient identifiers
- billing task creation using payer, balance, or claim data
- support ticket routing for patient portal or treatment questions

These workflows are not just "admin." They can reveal a patient's relationship with a provider, appointment status, treatment context, payment history, or other regulated information.

## How to audit existing Zaps for PHI

If your clinic already uses Zapier, review it as a data-flow inventory rather than a tool preference exercise:

1. **Export the active Zap list.** Include owner, trigger app, action apps, and whether the Zap is currently enabled.
2. **Read the payload fields.** Look for names, dates of birth, appointment data, medical record numbers, insurance details, clinical notes, billing status, portal message content, and free-text fields.
3. **Classify each Zap.** Mark it PHI, possible PHI, or non-PHI. Treat possible PHI as PHI until reviewed.
4. **Disable PHI Zaps.** Move those workflows into BAA-covered systems or redesign them so no PHI passes through Zapier.
5. **Document the cleanup.** Keep the review date, disabled workflow list, and replacement plan in your compliance evidence file.

Most clinics discover they are using Zapier to compensate for gaps in their core tools. The better path is to reduce the number of PHI handoffs rather than add middleware that expands the vendor chain.

For a broader workflow-risk lens, including how automation chains fail when one vendor lacks a BAA, use [Can healthcare teams use Zapier for PHI](/resources/guides/zapier).


For context on evaluating other automation and integration tools, see [Is HubSpot HIPAA compliant](/resources/guides/is-hubspot-hipaa-compliant) or the [vendor management under HIPAA](/learn/phi-tools-vendors) framework.

## Current Source Posture

The source set for this page is HHS: Business Associate Contracts - HHS Guidance; eCFR / HHS: HIPAA Security Rule - Administrative Safeguards (45 CFR 164.308). Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Zapier, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Zapier into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Zapier's current public guidance says Zapier is not HIPAA compliant and does not sign a BAA. Clinics should not route PHI through Zaps, even if every connected app has its own BAA. Zapier can still support non-PHI healthcare operations such as event outreach, internal triage, and administrative handoffs. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
