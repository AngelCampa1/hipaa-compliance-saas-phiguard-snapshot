---
title: "PHI in Telehealth Session Recordings"
seoTitle: "PHI in Telehealth Session Recordings: HIPAA Guide"
description: "Telehealth session recordings are ePHI. This guide covers consent requirements, storage obligations, access controls, retention, deletion procedures, third-party transcription BAAs, and state two-party consent laws."
metaDescription: "HIPAA for telehealth session recordings: patient consent requirements, encrypted storage, access controls, retention schedules, third-party transcription."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Telehealth session recordings are ePHI when they identify the patient and relate to their health. HIPAA requires patient consent before recording, encrypted access-controlled storage, retention consistent with medical records schedules, BAAs with transcription services, and compliance with stricter state recording consent laws."
keyTakeaways:
  - "A telehealth session recording is ePHI — it must be stored with the same encryption, access controls, and audit logging as any other clinical record."
  - "Many states require two-party (all-party) consent for recording, which is stricter than HIPAA's authorization framework — state law controls."
  - "Third-party transcription services that process telehealth recordings are business associates and require signed BAAs before any recording is shared."
  - "Patients have the right to access telehealth recordings as part of their medical record under 45 CFR § 164.524 — retention must be managed accordingly."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR § 164.312 — Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "45 CFR § 164.524 — Access of Individuals to PHI"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.524"
    publisher: "eCFR"
  - title: "HHS — Telehealth and HIPAA"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/telehealth/index.html"
    publisher: "HHS"
faq:
  - q: "Is a telehealth recording stored on the video platform provider's servers covered by HIPAA?"
    a: "Yes, if the video platform is a business associate with a signed BAA. The platform stores the recording on behalf of the covered entity — that makes the recording ePHI in the platform's possession. The BAA must address the platform's obligations to protect the recording, including encryption, access controls, audit logging, breach notification, and return or destruction upon contract termination."
  - q: "Does a patient's general telehealth consent cover recording?"
    a: "No. Consent to participate in telehealth is separate from consent to be recorded. The patient must specifically consent to recording, and that consent should describe what will be recorded, how the recording will be used (clinical reference, quality review, billing audit), who will have access, and how long it will be retained. A general telehealth consent form that does not address recording does not authorize recording."
  - q: "Can the clinic use a telehealth recording for training purposes?"
    a: "Only with specific patient authorization for that purpose. Using a recording for training is a use of PHI beyond the original purpose (providing care). Under 45 CFR § 164.502, uses of PHI for purposes other than treatment, payment, or operations require authorization. Training use may qualify as healthcare operations under 45 CFR § 164.501, but only if it involves competency assessment or quality improvement activities — not general staff training using patient encounters as examples."
  - q: "What happens to recordings when the clinic changes telehealth platforms?"
    a: "Recordings stored on the prior platform are ePHI subject to the BAA with that vendor. Before terminating the relationship, confirm with the vendor how recordings will be transferred or destroyed, consistent with the BAA and the clinic's retention schedule. Do not allow recordings to remain on the former platform indefinitely. Document the transition — when recordings were migrated, what was destroyed, and what was retained."
---

When a provider records a telehealth visit, the resulting file is audio-visual ePHI from the moment it is created — it captures patient identity and health information in a form that can be stored, transmitted, and accessed, all of which the HIPAA Security Rule governs. Screenshots captured by screen-recording software running on the same workstation may capture ePHI inadvertently, compounding the risk.

This guide covers consent, storage, access, retention, deletion, third-party transcription, and the state recording consent laws that apply independently of HIPAA.

## When a Telehealth Recording Is ePHI

Under 45 CFR § 160.103, PHI is individually identifiable health information — information that relates to the past, present, or future health of an individual, the provision of healthcare to an individual, or the payment for healthcare, and that identifies or could be used to identify the individual.

A telehealth session recording meets every element of this definition when:

1. It captures audio or video of a patient
2. The session involves discussion of the patient's health condition, treatment, or medications
3. The recording can be linked to the patient's identity

The recording is ePHI from the moment it is created. Treat it with the same protections as any other clinical record.

## Obtaining Patient Consent Before Recording

Recording a telehealth session without patient consent is an unauthorized capture of PHI. Patient consent for recording must be:

**Specific.** A general telehealth participation consent form does not cover recording. Consent must specifically state that the session may be recorded and describe the intended uses.

**Documented.** Record the patient's consent for recording in the patient's chart. If consent is obtained verbally at the start of the session, document the verbal consent in the session note.

**Actionable.** If a patient declines recording, the session proceeds without recording. Recording a session after the patient declines is an unauthorized disclosure.

**Scope-limited.** If the recording will be used for purposes beyond direct clinical reference — quality review, billing audit, training — disclose each purpose and obtain the patient's consent for each use.

## State Recording Consent Laws

Many states have recording consent laws that are stricter than HIPAA. HIPAA preempts state law only when state law is less protective than HIPAA — when state law is more protective, the stricter state law controls.

**All-party (two-party) consent states** require that all parties to a conversation consent to being recorded. As of 2026, states including California, Connecticut, Delaware, Florida, Illinois, Maryland, Massachusetts, Michigan, Montana, Nevada, New Hampshire, Oregon, Pennsylvania, and Washington have all-party consent requirements for audio recording. Requirements vary by state — some apply only to telephone calls, some extend to video, and some have specific exceptions for healthcare.

**Practical steps for your clinic:**

- A clinic in California must obtain explicit verbal or written consent from the patient at the start of every recorded session, every time.
- Failure to obtain two-party consent in a two-party consent state is a state law violation independent of HIPAA.
- If your clinic serves patients across state lines via telehealth, you may be subject to the recording consent laws of the patient's state, not just the clinic's state.

Check your state's specific recording consent statute before implementing session recording as a routine practice. When in doubt, implement all-party consent as a standard — it satisfies both one-party and two-party consent requirements.

## Storage Requirements for Telehealth Recordings

A telehealth recording must be stored in a HIPAA-compliant environment with the following controls:

### Encryption at Rest

Under 45 CFR § 164.312(a)(2)(iv), encryption of ePHI at rest is an addressable implementation specification that should be implemented unless a documented alternative exists. For recordings — which are large binary files that are straightforward to encrypt — there is no reasonable alternative to encryption. Store recordings only in encrypted repositories.

### Access Controls

Under § 164.312(a)(1), access to ePHI must be limited to authorized individuals. For telehealth recordings:

- Limit access to the treating provider and clinical staff directly involved in the patient's care.
- Billing staff may need access to the portion of the recording related to the billed services — not the full session.
- Administrative staff should not have routine access to clinical telehealth recordings.
- Access should be role-based and documented in the clinic's access control policy.

### Audit Logging

Under § 164.312(b), access to ePHI must be logged. The logging system must capture:

- Who accessed the recording and when
- Whether the recording was downloaded, shared, or exported
- Any deletion events

Retain audit logs for recordings consistent with the clinic's general audit log retention policy and review them periodically.

## Retention Requirements

Telehealth recordings are part of the medical record if they document clinical care. Medical records retention requirements vary by state — most states require a minimum of 7-10 years for adult patient records, longer for pediatric records. The clinic's records retention schedule should explicitly address telehealth recordings.

Key considerations:

- If a recording is retained as part of the medical record, the patient has access rights under 45 CFR § 164.524.
- If a recording is retained only for quality review and is not part of the medical record, its retention schedule and access controls may differ — but it is still ePHI and must be protected accordingly.
- Define a retention period, implement deletion procedures, and document when recordings are deleted. Indefinite retention by default is not compliant.

## Deletion Procedures

When a recording reaches the end of its retention period, you must securely delete it — not simply move it to a trash folder or allow it to lapse on a cloud storage platform.

Secure deletion of ePHI means rendering it unrecoverable. For cloud-stored recordings, confirm with the storage platform that the file has been permanently deleted from their systems (including backups), consistent with the BAA terms.

Document deletion events: what was deleted, when, and who authorized the deletion. These records support your retention schedule compliance.

## Third-Party Transcription Services

Many clinics use third-party transcription services to convert telehealth recordings into written notes. A transcription service that receives a recording containing PHI is a business associate under 45 CFR § 164.308(b)(1). A signed BAA must be in place before any recording is shared.

What the BAA with a transcription service must address:

- Permitted uses of the recording (transcription only, not storage or re-use)
- Encryption requirements for the recording in transit and at rest with the vendor
- Subcontractor obligations (if the transcription service uses AI or offshore transcriptionists who access the recording)
- Breach notification obligations
- Return or destruction of the recording after transcription is complete

Ask the transcription vendor specifically whether they use subcontractors or AI tools that process the audio. AI transcription tools that process PHI are themselves business associates or subcontractors of business associates — the chain of BAAs must be complete.

## Platform Selection Considerations

When choosing a telehealth platform with recording capabilities, evaluate:

- Does the vendor offer a healthcare-tier BAA that covers recordings?
- Where are recordings stored — within the platform's own encrypted environment or in a separate cloud storage account?
- Can recording be disabled by default and enabled only when consent is obtained?
- Does the platform log access to recordings?
- What are the retention and deletion controls?

A platform that stores recordings without encryption, or that retains recordings indefinitely with no deletion controls, is not a compliant choice regardless of its other features.

For a comprehensive assessment of your clinic's PHI workflows, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet). For related guidance on PHI in telehealth sessions, see [HIPAA for telehealth clinicians](/learn/workforce-training/hipaa-for-telehealth-clinicians).

PHIGuard helps small clinics manage telehealth compliance tasks — including recording consent documentation, BAA tracking for platform vendors, and access review scheduling — at current pricing. Learn more at [PHIGuard HIPAA](/hipaa).
