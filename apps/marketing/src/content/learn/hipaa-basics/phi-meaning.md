---
title: "PHI Meaning: What PHI Stands For"
seoTitle: "PHI Meaning: What PHI Stands For"
description: "A concise definition of PHI, what the acronym stands for, and how the term is used in US healthcare compliance."
metaDescription: "PHI stands for Protected Health Information. Learn the precise legal meaning, what qualifies, and why it matters under HIPAA."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "PHI"
intent: "awareness"
summary: "PHI stands for Protected Health Information. Under HIPAA, it is any information that identifies an individual and relates to their health, treatment, or payment for care. PHI is regulated by the HIPAA Privacy Rule and Security Rule, and mishandling it can trigger federal enforcement action."
keyTakeaways:
  - "PHI stands for Protected Health Information."
  - "Information qualifies as PHI when it links an individual to health, treatment, or payment context."
  - "Electronic PHI (ePHI) carries additional technical safeguard requirements under the HIPAA Security Rule."
  - "PHI is not limited to the medical record — it can appear in tasks, spreadsheets, emails, and scheduling tools."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Summary of the HIPAA Privacy Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html"
    publisher: "HHS"
  - title: "45 CFR Part 164 — Security and Privacy"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164"
    publisher: "eCFR"
faq:
  - q: "What does PHI stand for?"
    a: "PHI stands for Protected Health Information. It is the legal term used in HIPAA for patient-identifiable data tied to health, care, or payment."
  - q: "Is all patient data PHI?"
    a: "Not automatically. Data becomes PHI when it combines an identifier — name, date of birth, account number, and others — with health or payment context. Fully de-identified data is no longer PHI."
  - q: "What is the difference between PHI and ePHI?"
    a: "ePHI is electronic PHI — the same information stored or transmitted in electronic form. ePHI is subject to the HIPAA Security Rule in addition to the Privacy Rule."
---

**PHI** stands for **Protected Health Information**. It is the central term in US healthcare privacy law: any information that identifies an individual and relates to their past, present, or future health, care, or payment for care.

## Legal definition

The HIPAA Privacy Rule defines PHI as individually identifiable health information that is created, received, maintained, or transmitted by a covered entity or business associate. The key test is whether the information could reasonably identify the person and whether it involves health, treatment, or payment.

The PHI definition is found at 45 CFR § 160.103. The de-identification standard — the process for removing all identifiers so that data no longer qualifies as PHI — is at 45 CFR § 164.514. A covered entity includes health plans, healthcare clearinghouses, and most healthcare providers.

## What qualifies as PHI

PHI is not a single data type. It is a combination:

- An identifier — name, address, date of birth, phone number, Social Security number, medical record number, account number, IP address, and 12 others listed under the HIPAA de-identification standard
- A health or payment context — diagnosis, treatment notes, billing records, appointment history

Remove all identifiers and the remaining data is de-identified and falls outside PHI protections. Keep even one identifier alongside health context and the entire record is PHI.

## Where PHI appears outside the chart

Healthcare teams most commonly think of PHI as living in the EHR or the paper chart. In practice, PHI shows up in many other places:

- Task descriptions and assignment notes
- Scheduling and intake forms
- Prior authorization tracking spreadsheets
- Emails to vendors or insurers
- Voicemail recordings
- PDF attachments shared via cloud storage

Each of those locations creates a compliance obligation if the system handling the data does not meet HIPAA requirements.

## ePHI: the electronic subset

When PHI is stored or transmitted electronically, it is called ePHI. The HIPAA Security Rule — 45 CFR Part 164, Subpart C — adds technical, physical, and administrative safeguard requirements specifically for ePHI. These include access controls, audit logs, encryption in transit, and device management.

Any software system that touches patient data needs to be evaluated as a potential ePHI system, not just clinical tools. Project management software, cloud drives, and email platforms are common examples of non-clinical tools that can hold ePHI.

## Why the meaning matters for small clinics

For a practice administrator, understanding the PHI definition is the starting point for two decisions: which tools need a Business Associate Agreement (BAA), and which staff need HIPAA training on a given system.

If a tool could ever receive patient-linked information — even incidentally — it likely processes PHI. A BAA must be in place before that tool is used in those situations. For more on how to screen tools, see [When a Vendor Needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa).

For a practical look at where PHI shows up in clinic operations, see [What Counts as PHI in a Small Clinic](/learn/hipaa-basics/what-is-phi). For the full list of data fields that make information identifiable, see [18 HIPAA Identifiers](/learn/phi-fundamentals/18-hipaa-identifiers).

PHIGuard is built around the PHI definition: every task, comment, and audit log in the platform is treated as a potential PHI surface, with access controls and a BAA details available during plan review at every [pricing tier](/pricing).
