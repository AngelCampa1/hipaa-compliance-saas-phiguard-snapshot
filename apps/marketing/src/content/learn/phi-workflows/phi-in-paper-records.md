---
title: "PHI in Paper Records"
description: "Paper PHI — faxes, physical charts, superbills, mail — remains a significant source of HIPAA exposure in small clinics. Here's what the regulations require and where the gaps concentrate."
metaDescription: "Paper PHI in small clinics: fax risks, physical chart controls, mail handling, and disposal requirements under HIPAA's Privacy and Security Rules."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Many small clinics have strong EHR security postures but leave paper PHI exposed. Fax machines, physical charts, intake forms, superbills, and EOBs all contain PHI and require the same Privacy Rule protections as electronic records — including access controls, proper disposal, and reasonable safeguards against incidental disclosure."
keyTakeaways:
  - "The HIPAA Privacy Rule applies to PHI in any medium — paper records carry the same obligations as electronic records."
  - "Misdirected faxes are reportable incidents that require triage, not just a callback to the wrong number."
  - "Physical charts left on counters visible to patients or visitors are a Privacy Rule issue under the reasonable safeguards requirement."
  - "Shredding is required for paper PHI disposal — recycling and standard trash are not compliant."
  - "Shredding vendors who access PHI in the course of their service are business associates and require a signed BAA."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/pricing"
sources:
  - title: "45 CFR § 164.530(c) — Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.530"
    publisher: "Electronic Code of Federal Regulations"
  - title: "45 CFR § 164.310 — Physical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.310"
    publisher: "Electronic Code of Federal Regulations"
  - title: "HHS Guidance on Incidental Uses and Disclosures"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/incidental-uses-and-disclosures/index.html"
    publisher: "U.S. Department of Health and Human Services"
  - title: "HHS Guidance on Disposal of Protected Health Information"
    url: "https://www.ecfr.gov/current/title-45/section-164.530"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Is a faxed document containing PHI subject to HIPAA?"
    a: "Yes. PHI transmitted by fax is protected health information under HIPAA regardless of the medium. The Privacy Rule (45 CFR § 164.530(c)) requires covered entities to have appropriate administrative, technical, and physical safeguards to protect the privacy of PHI in any form, including paper."
  - q: "What should we do when a fax is sent to the wrong number?"
    a: "A misdirected fax containing PHI is a potential breach and must be triaged as an incident. Document what information was transmitted, to what number, and when. Assess whether the recipient is subject to a confidentiality obligation (e.g., another healthcare provider) or is an unintended third party. Depending on the assessment, this may require notification under the Breach Notification Rule (45 CFR § 164.400–414)."
  - q: "Do we need a BAA with our shredding company?"
    a: "Yes, if the shredding vendor collects paper documents containing PHI. They are a business associate under HIPAA because they access PHI in the course of providing their service. A signed BAA is required before they handle any document containing patient information."
---

Strong EHR security gives many small clinics a false sense of completeness about their HIPAA posture. The EHR is locked down, audit-logged, and access-controlled. Meanwhile paper keeps moving through the clinic: intake forms come in from the waiting room, faxes arrive and sit in a tray, charts leave the file room and end up on a counter, superbills travel between clinical and billing staff, and EOBs arrive in the mail.

Paper PHI carries the same HIPAA obligations as electronic PHI. The Privacy Rule (45 CFR § 164.530(c)) requires covered entities to have appropriate administrative, technical, and physical safeguards to protect PHI in any medium, including paper.

## What Still Runs on Paper in Most Small Clinics

Before addressing controls, it helps to map the paper PHI that most small clinics are actually handling. The list is longer than most administrators initially estimate:

| Document Type | PHI Typically Present |
|---------------|----------------------|
| Patient intake forms | Name, DOB, address, insurance, chief complaint |
| Superbills | Name, date of service, diagnosis codes, procedure codes |
| Physical charts (hybrid practices) | Complete clinical history |
| Fax cover sheets | Patient name, referring provider, often clinical detail |
| Lab results from non-EHR labs | Name, DOB, test results |
| Prescription pads | Name, DOB, medication, prescribing provider |
| Explanation of Benefits (EOBs) | Name, dates of service, claim detail |
| Referral letters | Name, clinical summary, receiving provider |
| Insurance cards (photocopies) | Member name, member ID, group number |
| Returned mail | Name, address, and whatever the document contained |

Each of these document types represents a PHI handling point. Every one requires the clinic to apply the same deliberate controls it applies to electronic records: access limits, storage controls, proper disposal, and a process for handling disclosures or incidents.

## Fax-Specific Risks

Fax remains a primary transmission channel in healthcare, particularly for referrals, lab results, and inter-provider communication. Its persistence reflects EHR interoperability gaps: when two providers don't share a care network, fax is still the lowest-friction option. Fax creates specific PHI risks that clinics often handle inconsistently.

### Unmonitored Fax Machines

Incoming faxes sit exposed in the output tray until someone retrieves them. In a busy clinic, that window can be hours. Other staff, vendors, cleaning crews, and patients who wander beyond the waiting room can all see the content of incoming faxes.

The Privacy Rule's reasonable safeguards requirement (45 CFR § 164.530(c)) is the operative standard. An unmonitored fax in a high-traffic area does not meet this standard.

Practical controls include: placing fax machines in staff-only areas, assigning someone to retrieve incoming faxes at regular intervals, and documenting a fax intake procedure.

### Misdirected Faxes

A fax sent to the wrong number is a disclosure of PHI to a person who has no right to receive it. This happens regularly through outdated directories, transposed digits, and auto-dial memory errors. Many clinics treat a misdirected fax as a minor administrative error resolved by calling the recipient and asking them to destroy the document. HIPAA requires more than that.

A misdirected fax must be triaged as a potential breach. The clinic should document what PHI was transmitted, to what number, whether the receiving party is another covered entity or an unrelated third party, and what steps were taken to limit further disclosure. Depending on the triage outcome, the incident may require notification under the Breach Notification Rule (45 CFR §§ 164.400–414).

### Fax Logs and Fax Machine Configuration

Fax machines maintain transmission logs recording the numbers dialed, the time of transmission, and the success or failure of delivery. These logs are part of the clinic's documentation of PHI disclosures and must be retained. Some older fax machines store logs internally with limited capacity and overwrite them without warning. Confirm that your fax machine logs are being preserved.

### The Paper-to-EHR Gap

Many clinics scan incoming faxes into the EHR. This is good practice — it moves the record into the controlled electronic environment. But the physical document still exists after scanning. That paper document contains PHI and must be disposed of correctly. It cannot go into the recycling bin. It cannot go into the standard office trash. It must be shredded.

## Physical Chart Controls

Clinics that maintain physical charts — whether as a primary record system or as part of a hybrid approach — face physical safeguard requirements that are distinct from EHR access controls.

Physical charts should be stored in a locked area accessible only to staff whose role requires access to patient records. This typically means a locked file room or filing cabinets in a secured staff area. Charts should not be stored in open shelving visible to patients, vendors, or general visitors.

The most common physical chart exposure in small clinics is not sophisticated. It is a chart left on a counter, a reception desk, or an exam room doorframe while a staff member steps away. HHS guidance on incidental disclosures acknowledges that some incidental exposure is unavoidable in clinical settings, but requires clinics to apply reasonable safeguards to minimize it. A chart sitting open on a front-desk counter facing the waiting room does not meet that standard.

## Mail: Outbound and Returned

Outbound mail containing PHI — appointment reminders, explanation of benefits, billing statements — must be addressed correctly and sealed. The process deserves a written procedure. Clinics that use address labels generated from EHR exports should verify that the export-to-print process produces correctly matched records, especially after address updates.

Returned mail — pieces that come back undeliverable — still contains PHI. A returned letter with a patient's name, address, clinical detail, or billing information is PHI and must be handled as such. It cannot be dropped in the recycling bin because the original delivery failed. It must be held securely, the patient's address updated in the system, and the physical document disposed of through proper shredding.

## Disposal: Why Recycling Is Not Compliant

HHS guidance on disposal of protected health information is explicit: PHI on paper must be disposed of in a manner that renders it unreadable and unable to be reconstructed. Shredding is the standard method.

Recycling is not compliant. Placing paper PHI in an office recycling bin means the document may be sorted, handled, and reviewed by individuals at a recycling facility. Standard office waste is not compliant either — documents in a trash bin may be accessible before collection and visible during transport.

For clinics that use a shredding service, the vendor must be treated as a business associate. They collect documents containing PHI, and their service involves physical access to that PHI. A signed BAA must be in place before they collect the first document.

For clinics that shred on-site, the shredder should produce cross-cut or micro-cut output. Strip-cut shredders produce pieces that can be reassembled and do not meet the standard for secure PHI destruction.

## The Hybrid Practice Problem

The most difficult paper PHI environment is the hybrid practice — a clinic that has partially transitioned to an EHR but still maintains paper charts for some patient populations or some record types. Hybrid practices have two parallel PHI systems, each with its own access controls, storage requirements, and disposal procedures. Controls that apply to the electronic system do not automatically extend to the paper system.

Common failure modes in hybrid practices:

- Paper charts stored in an unsecured area while the EHR is access-controlled
- Paper documents scanned into the EHR but original documents not shredded
- New patient records created in the EHR while old records exist only in paper charts, with no bridge procedure
- Staff trained on EHR access control but not on physical chart access procedures

The Privacy Rule requires that both systems be covered. A hybrid practice must document procedures for both and train staff on both.

## A Practical Self-Audit for Paper PHI

Small clinics don't need a third-party audit to identify the most common paper PHI gaps. A walk-through of the clinic with these questions covers the major exposure points:

1. Where does the incoming fax sit between arrival and retrieval? Who has access to that area?
2. Is there a documented procedure for handling misdirected faxes as potential breach incidents?
3. Are physical charts stored in a locked area? Are there controls on who can retrieve them?
4. Are paper documents containing PHI — including fax output, intake forms, and superbills — shredded before disposal?
5. Is there a signed BAA with the shredding vendor?
6. Is there a procedure for handling returned mail that contains PHI?
7. For hybrid practices: are controls documented and applied separately to both the paper and electronic systems?

Paper PHI is not a solved problem because the clinic has an EHR. The transmission channels, storage locations, and disposal practices around paper documents each require deliberate attention. A strong electronic posture does not satisfy the Privacy Rule when the paper environment is uncontrolled.
