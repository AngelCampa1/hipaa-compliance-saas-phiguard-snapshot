---
title: "How to Track Expiring BAAs and Vendor Renewals"
description: "A practical guide for small clinics on building a BAA tracker, knowing what triggers a renewal, and keeping vendor agreements current as AI tools and acquisitions change the landscape."
metaDescription: "Learn how to track expiring BAAs and vendor renewals for HIPAA compliance. Includes what triggers a review and how to build a tracker."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: vendor-management
schemaType: article
intent: consideration
summary: "A BAA is not a one-time document. Vendors get acquired, add AI subprocessors, and revise their security posture — all of which can invalidate an existing agreement. Small clinics need a simple, recurring system to track BAA status and trigger reviews before problems appear."
keyTakeaways:
  - "A valid BAA must contain six specific elements under 45 CFR § 164.504(e) — missing any one of them creates a compliance gap."
  - "Vendor acquisitions, new AI features, and subprocessor changes are the most common triggers for a BAA review that clinics overlook."
  - "Many BAAs are evergreen and have no printed expiration date, but they still require periodic review — at minimum annually."
  - "A spreadsheet-based BAA tracker with seven core fields is sufficient for most clinics with fewer than 25 vendor relationships."
  - "When a vendor refuses to sign a BAA, document the analysis showing PHI is not transmitted — do not simply move on without a record."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: vendor-renewal-review-checklist
relatedCommercialPath: /pricing
sources:
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "Sample Business Associate Agreement Provisions"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.504(e) — Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
faq:
  - q: "Do BAAs expire?"
    a: "Most vendor BAAs are written as evergreen agreements that remain in effect until the underlying service contract ends or either party terminates. However, some BAAs include explicit review dates or sunset clauses. Even without an expiration date, the underlying agreement should be reviewed at least annually, and whenever a triggering event occurs such as a vendor acquisition or new AI feature."
  - q: "What happens if a vendor gets acquired and we have an existing BAA?"
    a: "The acquiring company typically assumes the BAA obligations, but the security posture, subprocessors, and data handling practices of the new parent company may differ materially from the original vendor. You should request a new or amended BAA from the acquiring entity and verify that its terms still meet your requirements."
  - q: "Can a cleaning company require a BAA?"
    a: "Yes, if the cleaning company accesses areas where paper records containing PHI are stored and has the opportunity to access those records, they may qualify as a business associate. The test is whether they could access PHI in the course of delivering services — not whether they are expected to look at it."
---

Most small clinics can name the vendors they signed a BAA with when they first opened. Far fewer can name every vendor whose BAA is still current, covers the services actually in use today, and has been reviewed since the vendor changed ownership, added AI features, or revised its subprocessor list.

BAA management is not a one-time project. It requires a system, not just a folder of signed PDFs.

## What a valid BAA must contain

Under 45 CFR § 164.504(e), a Business Associate Agreement must include six required elements. If any of these are missing, the agreement does not satisfy the HIPAA contract requirement even if both parties signed it.

| Required element | What it means in practice |
|---|---|
| Permitted uses and disclosures | The BAA must specify what the business associate is allowed to do with PHI. A blanket authorization is not sufficient. |
| Prohibition on unauthorized use | The business associate must agree not to use or disclose PHI in ways not permitted by the agreement or required by law. |
| Appropriate safeguards | The business associate must implement administrative, physical, and technical safeguards to protect PHI. |
| Reporting obligation | The business associate must report breaches and Security Rule violations to the covered entity. |
| Subcontractor obligations | The business associate must require its own subcontractors who handle PHI to agree to the same restrictions. |
| Return or destruction at termination | When the agreement ends, the business associate must return or destroy PHI — or document why it cannot do so and agree to maintain protections indefinitely. |

Review each existing BAA against this list. Many older BAAs — particularly ones signed before the 2013 Omnibus Rule — are missing the subcontractor obligations element or the breach reporting requirement.

## Why BAA management is an ongoing task

A signed BAA does not stay current on its own. Several common business events can render an existing agreement inadequate without any notice to the clinic.

**Vendor acquisition.** When a software company is acquired, the new parent company is a different legal entity. The BAA you signed with the original company may no longer bind the acquirer. Request a new agreement.

**New subprocessors.** Cloud-based software vendors routinely add infrastructure providers, analytics platforms, and support tools. Each new subprocessor that could access PHI should itself be covered under a BAA with your vendor. Without a notification requirement in your vendor's BAA, you will not know when the subprocessor chain changes.

**AI processing features.** Many EHR vendors, scheduling platforms, and billing tools have added AI-powered features — ambient documentation, claim scrubbing, patient communication assistants — that process PHI through foundation model providers. The original BAA almost certainly does not address AI processing. A new agreement or amendment is required.

**Security incidents at the vendor.** A vendor disclosure of a data breach or security event is a prompt to review the relationship, verify they have met their breach notification obligations to you, and assess whether the vendor's controls still meet your requirements.

**Changes in your service scope.** If your clinic expands to a new location, adds a service line, or starts using a vendor for a materially different purpose, the permitted use description in the existing BAA may no longer be accurate.

## Triggering events that require a BAA review

Not every update requires a new BAA — sometimes a written amendment or documented review is sufficient. The following events should trigger an active review:

- Vendor announces acquisition or merger
- Vendor adds an AI feature to a product you use for PHI-related tasks
- Vendor discloses a security incident or sends a breach notification
- Vendor sends updated terms of service that affect data handling
- Your BAA has an explicit expiration or renewal date approaching
- More than 12 months have passed since the last documented review
- Your clinic begins using the vendor for a new category of service

## How to build a BAA tracker

A spreadsheet is sufficient for most clinics. The goal is to have a single, maintained record of every vendor relationship that involves PHI, with enough information to act on it quickly when a review is triggered.

**Minimum fields for each record:**

| Field | Notes |
|---|---|
| Vendor name | Legal entity name, not product name |
| Service description | What the vendor does for the clinic |
| BAA execution date | Date the agreement was signed |
| Expiration date | "Evergreen" if no printed end date |
| Last review date | Date you last confirmed the BAA is current |
| Next review due | Set to 12 months from last review, or earlier if a triggering event is likely |
| Known subprocessors | List any subprocessors identified in the vendor's BAA or subprocessor disclosure |
| Current version | Version number or document date if the vendor uses versioning |
| Owner | Staff member responsible for this vendor relationship |

Add a column for notes that captures the reason for any mid-cycle review — for example, "reviewed 2026-02-15 after vendor announced AI feature addition; requested amended BAA."

**Clinics to prioritize first:**

Start with vendors who handle the highest volume of PHI or who have the most complex subprocessor chains: your EHR vendor, billing clearinghouse, cloud storage provider, and any transcription or ambient documentation service. Next: scheduling platforms, answering services, and clinical communication tools. Review paper-PHI-adjacent vendors — document shredding, cleaning companies with records room access, staffing agencies who place employees in clinical areas — last.

## When a vendor won't sign a BAA

Some vendors, particularly large consumer platforms not designed for healthcare, will decline to sign a BAA. The correct response depends on whether PHI actually flows to that vendor.

**If PHI does flow to that vendor:** You cannot use that vendor for that purpose. Document the situation, terminate the use of that vendor for PHI-related tasks, and find an alternative that will sign a BAA. Do not continue using a vendor for PHI tasks without a BAA simply because the vendor is otherwise convenient.

**If PHI does not flow to that vendor:** Document the analysis. Confirm in writing — email is sufficient — that no PHI is transmitted to or accessible by that vendor in the ordinary course of using the service. Keep that documentation with your BAA records. If the use case changes later, revisit the question.

## Connecting BAA review to the annual compliance calendar

BAA review should not live on a separate to-do list. Anchor it to the annual compliance review that most clinics are already conducting for risk assessment, policy review, and workforce training.

A practical annual calendar entry looks like this:

- **Q1:** Pull the BAA tracker. Confirm all vendor relationships are still active. Flag any vendors not reviewed in the past 12 months.
- **Q1:** Send a short written inquiry to each flagged vendor asking for confirmation that their agreement terms, subprocessor list, and security posture are unchanged.
- **Q2:** Process responses. Update the tracker. Escalate any vendors who report material changes to the person who manages vendor contracting.
- **Q4:** Review the tracker for upcoming expiration dates in the following calendar year. Begin renewal conversations 60 to 90 days in advance.

In addition to this annual cycle, assign a staff member, typically the practice administrator or privacy officer, responsibility for monitoring vendor communications for acquisition announcements, product update emails announcing new AI features, and security disclosures. These mid-cycle triggers are the ones most clinics miss.

## The AI vendor gap

Added AI features are currently the most common source of BAA gaps in small clinic vendor programs. A clinic may have an executed BAA with an EHR vendor signed in 2021. That agreement says nothing about ambient documentation, AI-assisted coding, or prior authorization chatbots — all features the same vendor may have added in 2024 or 2025.

Before using any AI-powered feature in a vendor's product, confirm in writing that:

1. The AI feature is covered under the existing BAA, including any subprocessors the AI feature uses.
2. The vendor does not use PHI to train or fine-tune AI models without explicit authorization.
3. The BAA specifies how the vendor handles PHI data retention within the AI processing context.

If the vendor cannot answer these questions or the existing BAA does not address them, request a written amendment before enabling the feature.

A maintained BAA tracker with clear review dates and a defined mid-cycle review process is how a clinic demonstrates, to itself and to auditors, that business associate management is an active practice rather than a box checked at setup.
