---
title: "ePHI vs PHI: Key Differences Explained"
seoTitle: "ePHI vs PHI: Key Differences (HIPAA)"
description: "The practical differences between PHI and ePHI, which HIPAA rules apply to each, and why small clinics should care about the distinction."
metaDescription: "ePHI vs PHI explained: PHI covers paper, oral, and electronic health info; ePHI is the electronic subset governed by the HIPAA Security Rule."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-fundamentals"
schemaType: "article"
intent: "awareness"
summary: "PHI is any individually identifiable health information held or transmitted by a covered entity or business associate. ePHI is the electronic subset. The Privacy Rule covers all PHI; the Security Rule applies specifically to ePHI. It helps staff recognize when information becomes PHI, where identifiers create risk, and how Privacy Rule definitions affect everyday handling decisions."
keyTakeaways:
  - "PHI includes paper, oral, and electronic health information. ePHI is the electronic subset only."
  - "The HIPAA Privacy Rule (45 CFR Part 164 Subpart E) applies to all PHI."
  - "The HIPAA Security Rule (45 CFR Part 164 Subpart C) applies specifically to ePHI and requires administrative, physical, and technical safeguards."
  - "Clinics are accountable for both. Most modern risk lives on the ePHI side because that is where volume and blast radius live."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 160.103 - Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103"
    publisher: "eCFR"
  - title: "45 CFR Part 164 Subpart C - Security Standards for the Protection of Electronic Protected Health Information"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C"
    publisher: "eCFR"
  - title: "Summary of the HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
faq:
  - q: "Is ePHI the same as PHI?"
    a: "No. ePHI is a subset of PHI. PHI covers paper, oral, and electronic formats. ePHI is only the electronic portion."
  - q: "Does the HIPAA Security Rule apply to paper records?"
    a: "No. The Security Rule applies only to ePHI. Paper records are still covered by the Privacy Rule and require reasonable safeguards."
  - q: "Does a voicemail containing patient information count as ePHI?"
    a: "Yes. A voicemail stored in a digital system is electronic and counts as ePHI. A live phone call in progress is oral PHI, not ePHI."
---

HIPAA terminology can feel redundant until a breach turns on a word. PHI and ePHI are not interchangeable. The difference determines which rules apply, which safeguards you owe, and where audit scrutiny tends to land.

## The short version

PHI is Protected Health Information. It is defined in [45 CFR 160.103](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103) as any individually identifiable health information held or transmitted by a covered entity or business associate, regardless of format.

ePHI is the electronic subset. It is PHI that is created, received, stored, or transmitted in electronic form.

| Category | Format | Primary rule | Example |
| --- | --- | --- | --- |
| PHI (non-electronic) | Paper, oral | Privacy Rule | A paper intake form; a hallway conversation about a patient |
| ePHI | Electronic | Privacy Rule + Security Rule | An email, an EHR entry, a digital x-ray, a voicemail stored as a file |

For a plain-English walkthrough of the parent term, see [What Does PHI Stand For](/learn/phi-fundamentals/what-does-phi-stand-for).

## Which HIPAA rules apply

The Privacy Rule (45 CFR Part 164 Subpart E) governs uses and disclosures of all PHI. It applies whether information sits in a chart, on a sticky note, or in a cloud storage bucket.

The Security Rule ([45 CFR Part 164 Subpart C](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C)) applies only to ePHI. It requires three categories of safeguards:

- **Administrative safeguards** such as workforce training, access management, and contingency plans.
- **Physical safeguards** such as facility access controls and workstation security.
- **Technical safeguards** such as access controls, audit controls, integrity controls, transmission security, and encryption.

The Breach Notification Rule applies to both PHI and ePHI. A lost paper chart and a misdirected email can both be reportable.

## Real examples

A few scenarios clarify where the line sits.

**Paper PHI (Privacy Rule only).** A printed superbill left on a counter. It is PHI. Lose it and you may have a breach. The Security Rule is not the governing standard.

**Oral PHI (Privacy Rule only).** A front-desk conversation where a patient's diagnosis is audible in the waiting room. The "minimum necessary" standard and reasonable safeguards apply. The Security Rule does not.

**ePHI (Privacy Rule plus Security Rule).** A patient's lab result attached to an email, a chat message referencing a visit, a calendar event titled with a patient name and procedure. Each is ePHI and triggers Security Rule obligations including access control and audit logging. See [PHI in Email](/learn/phi-workflows/phi-in-email) and [PHI in Shared Calendars](/learn/phi-workflows/phi-in-shared-calendars) for common failure modes.

**Voicemail nuance.** A voicemail left on a digital phone system is ePHI. The same content as a live phone call is oral PHI.

## Why the distinction matters for small clinics

Three practical reasons.

1. **Technical safeguards are enforceable.** The Security Rule requires specific controls for ePHI: unique user IDs, automatic logoff, emergency access, audit controls, and transmission security. These are the items OCR reviews during an investigation.

2. **Volume lives in ePHI.** A paper chart holds one patient's record. An unsecured cloud drive can hold thousands. Blast radius on the electronic side is larger, which is why most enforcement actions and breach reports involve ePHI.

3. **Vendor risk is ePHI risk.** Every SaaS tool that touches patient information is handling ePHI. Each needs a BAA and must support the Security Rule's technical safeguards. A vendor that cannot meet those standards should not hold ePHI.

## Where teams get confused

A few recurring traps worth flagging:

- **"We only use paper, so Security Rule does not apply."** True only if the practice also does not email, fax digitally, or store any electronic claims. Most clinics have ePHI the moment they bill a payer electronically.
- **"Encryption is optional."** Encryption is an addressable specification under the Security Rule, not a free pass. If encryption is not implemented, the practice must document why and use an equivalent safeguard. The [HHS Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html) explains the addressable versus required distinction.
- **"Business associates are covered by their own BAA, so we do not need controls."** The covered entity remains accountable. A BAA is necessary, not sufficient.

## Next steps

If a clinic is unsure where its ePHI lives, a tool inventory is the first move. Every application that stores, transmits, or processes patient information needs to be on that list, with a BAA status and a mapped Security Rule safeguard. PHIGuard was built to keep that inventory and the work tied to patient context in one auditable place. See [/hipaa](/hipaa) and compare against the risks described in [PHI in CRM Records](/learn/phi-workflows/phi-in-crm-records).
