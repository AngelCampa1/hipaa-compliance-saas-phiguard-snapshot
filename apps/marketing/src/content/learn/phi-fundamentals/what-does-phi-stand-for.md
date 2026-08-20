---
title: "What Does PHI Stand For?"
seoTitle: "What Does PHI Stand For? (Plain Answer)"
description: "A direct answer to what PHI stands for, what counts as PHI under HIPAA, and what it means for a small clinic day to day."
metaDescription: "PHI stands for Protected Health Information. Plain definition, HIPAA citations, examples, and what it means for small medical practices."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-fundamentals"
schemaType: "defined-term"
term: "Protected Health Information (PHI)"
intent: "awareness"
summary: "PHI stands for Protected Health Information. HIPAA defines it as individually identifiable health information held or transmitted by a covered entity or business associate. The definition lives in 45 CFR 160.103 and shapes almost every compliance decision a clinic makes."
keyTakeaways:
  - "PHI stands for Protected Health Information."
  - "The legal definition lives in 45 CFR 160.103 and includes any individually identifiable health information held or transmitted by a covered entity or business associate."
  - "PHI covers paper, oral, and electronic formats. The electronic subset is ePHI and is governed by the HIPAA Security Rule."
  - "If health information can reasonably identify a patient, treat it as PHI."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 160.103 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103"
    publisher: "eCFR"
  - title: "Summary of the HIPAA Privacy Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html"
    publisher: "HHS"
  - title: "Guidance on De-identification of Protected Health Information"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
    publisher: "HHS"
faq:
  - q: "What does PHI stand for?"
    a: "PHI stands for Protected Health Information. It is the category of health data that HIPAA protects when held or transmitted by a covered entity or business associate."
  - q: "Is a patient name alone considered PHI?"
    a: "A name by itself is not PHI. A name becomes PHI when it is combined with any health, payment, or treatment context that links it to an individual."
  - q: "What is the difference between PHI and ePHI?"
    a: "PHI covers any format including paper and oral conversations. ePHI is the electronic subset and triggers the HIPAA Security Rule in 45 CFR Part 164 Subpart C."
---

## Direct answer

PHI stands for Protected Health Information. Under HIPAA, it means any individually identifiable health information that a covered entity or business associate creates, receives, maintains, or transmits. The legal definition lives in [45 CFR 160.103](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103). It covers paper charts, faxes, emails, billing records, voicemails, and conversations at the front desk.

## What counts as PHI

HIPAA ties PHI to 18 identifier categories. If any of them appear alongside health, treatment, or payment context and the information can reasonably identify a person, it is PHI. The categories include:

- names
- addresses more specific than state
- dates related to an individual (birth, admission, discharge, death)
- phone and fax numbers
- email addresses
- Social Security numbers
- medical record numbers
- health plan beneficiary numbers
- account numbers
- certificate and license numbers
- vehicle identifiers
- device identifiers and serial numbers
- web URLs
- IP addresses
- biometric identifiers
- full-face photos
- any other unique identifying number, code, or characteristic

HHS maintains a longer discussion in its [de-identification guidance](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html). The practical test for a clinic is simpler. If a reasonable person could tie the data back to a specific patient, treat it as PHI.

## Who PHI applies to

PHI rules apply to covered entities and business associates. A covered entity is a health plan, a health care clearinghouse, or a health care provider that transmits health information electronically in connection with HIPAA transactions. A business associate is any vendor that handles PHI on behalf of a covered entity, such as a billing service, IT provider, or task management platform.

A small clinic is almost always a covered entity. Any software vendor it uses that touches PHI is a business associate and must sign a BAA before PHI is shared. For a fuller walkthrough of that relationship, see [Covered Entity vs Business Associate](/learn/hipaa-basics/covered-entity-vs-business-associate).

## PHI versus ePHI

PHI is the umbrella category. ePHI is the electronic subset. ePHI triggers the technical and administrative safeguards of the [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html), including encryption, access controls, and audit logs. Paper and oral PHI still fall under the Privacy Rule, but they are not governed by the Security Rule specifically. For the full distinction, read [ePHI vs PHI: Key Differences](/learn/phi-fundamentals/ephi-vs-phi-differences).

## Why the definition matters for small clinics

Most compliance mistakes at small clinics are not exotic. They come from staff not recognizing that a piece of information is PHI in the first place. A few realistic examples:

- A calendar invite titled "Maria R. — colonoscopy 2pm" sent to a shared team calendar.
- A Slack DM asking a coworker if the Tuesday patient came back for follow-up.
- A photo of a paper intake form taken on a personal phone.

Each of those contains PHI. Each can become a breach under the wrong circumstances. This is why compliance programs focus on how PHI moves through everyday tools, not just EHR access. PHIGuard is built on that premise. See [/hipaa](/hipaa) for how clinic-flat pricing and BAA details available during plan review change the math on vendor sprawl.

## Common misconceptions

**"De-identified data is PHI."** It is not, if it meets the HHS de-identification standard. But most data clinics treat as anonymous still contains identifiers.

**"PHI only lives in the EHR."** PHI lives anywhere patient context exists: email, chat, calendars, task tools, voicemail, paper.

**"Our vendor says they are HIPAA compliant, so we are fine."** A vendor's self-attestation is not a BAA. Without a signed BAA, PHI must not be shared with that vendor. See [PHI in Email](/learn/phi-workflows/phi-in-email) for how this breaks down in practice.

## What to do with this knowledge

Three concrete moves for a small practice:

1. Run an inventory of every tool that could touch PHI and confirm a BAA exists for each.
2. Train staff on what makes a piece of information PHI, not just where PHI is stored.
3. Centralize work that references patients into a system with audit logs and access controls.

The last point is the gap PHIGuard was built to close. Review [/hipaa](/hipaa) for the approach.
