---
title: "HIPAA Telehealth Vendor Selection Guide"
seoTitle: "HIPAA Telehealth Vendor Selection Guide"
description: "Selection criteria for telehealth platforms: BAA, encryption, recording controls, waiting rooms, identity verification, EHR integration, and multi-state licensing."
metaDescription: "Pick a HIPAA telehealth vendor: BAA, encryption, recording, waiting room, identity verification, EHR integration, multi-state issues."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "vendor-management"
schemaType: "article"
intent: "consideration"
summary: "Telehealth vendor selection is a HIPAA review plus a clinical workflow review plus a state-licensing review. This article covers each layer and the BAA terms that matter most. It helps clinics evaluate vendor promises against BAA terms, PHI access, subcontractors, retention, incident support, and evidence they can actually review."
keyTakeaways:
  - "Telehealth vendors are business associates. The OCR enforcement discretion that applied during the COVID-19 public health emergency has expired - a signed BAA is required."
  - "Encryption in transit must cover both signaling and media. End-to-end encryption is preferred where it is compatible with recording requirements."
  - "Recording controls determine whether a session can be recorded, by whom, where the recording is stored, and how long it is retained."
  - "Patient identity verification at session start is a workflow requirement, not just a feature. Confirm the vendor supports it."
  - "EHR integration changes the BAA scope: confirm whether the integration is direct or through a subprocessor and whether flow-down is in place."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management"
sources:
  - title: "HHS Telehealth and HIPAA"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/telehealth/index.html"
    publisher: "HHS"
  - title: "45 CFR Section  164.502(e) - Disclosures to Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "45 CFR Section  164.504(e) - Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
faq:
  - q: "Can we still use consumer videoconferencing for telehealth?"
    a: "No. The OCR Notification of Enforcement Discretion that allowed consumer products during the COVID-19 public health emergency expired. A signed BAA with a HIPAA-compliant telehealth vendor is required."
  - q: "Does the BAA need to cover recordings?"
    a: "Yes if the platform records sessions. Recordings are PHI. The BAA should address storage, encryption, retention, access controls, and deletion."
  - q: "Are there state-specific telehealth requirements beyond HIPAA?"
    a: "Often. State licensure laws govern where you can practice. Some states have additional consent or recording rules. HIPAA is the federal floor; states can require more."
---

Telehealth went from a niche service line to a daily workflow during the COVID-19 public health emergency. The temporary OCR enforcement discretion that allowed consumer videoconferencing tools is gone. Today, telehealth vendor selection is a HIPAA review.

This article walks the practice administrator through what to look for: the BAA, the encryption posture, the recording controls, the workflow features, and the multi-state licensing implications.

## Why this vendor category needs HIPAA review

A telehealth platform creates, receives, maintains, and transmits PHI on behalf of the practice. Audio, video, chat messages, file uploads, and recordings are all PHI. Under 45 CFR Section  160.103, the vendor is a business associate, and a BAA is required under 45 CFR Section  164.502(e).

Telehealth is also where a few clinical workflow risks compound:

- A consumer or non-BAA platform is easy to grab when a session goes wrong.
- Recordings, where used, can sit on a vendor's storage indefinitely if retention is not configured.
- Patient identity verification is harder over video than in person, and a missed step is an unauthorized disclosure.
- Multi-state telehealth implicates licensure laws beyond HIPAA.

## Required BAA terms for telehealth vendors

Standard 45 CFR Section  164.504(e) terms apply: permitted uses, safeguards, breach reporting, subcontractor flow-down, return or destruction at termination, HHS access.

For telehealth specifically, the BAA should also address:

- **Media handling.** Audio and video streams, including buffering and transit nodes.
- **Recording storage.** Where recordings are stored, what encryption applies, and what retention period is configured.
- **Chat and file transfer.** In-session chat and any file uploads are PHI.
- **Subprocessor flow-down.** Telehealth vendors often use third-party media servers, transcription services, or analytics. Each subprocessor handling PHI needs flow-down.
- **Geographic routing.** Where the media servers are located, and whether traffic ever leaves the US.

## Specific risks for telehealth vendors

- **Consumer-tier fallback.** Staff use consumer videoconferencing "just this once" when the BAA-covered tool fails. That is an unauthorized disclosure.
- **Recording sprawl.** A practice records every session for clinical reference, never configures retention, and sits on years of unencrypted recordings on the vendor's storage.
- **Waiting room misuse.** A waiting room feature without proper isolation can let one patient see another patient's name on entry.
- **Identity verification skipped.** A new patient joins without ID verification, and the clinician proceeds. If the person on the call is not the patient, that is an unauthorized disclosure.
- **EHR integration mismatch.** The telehealth platform integrates with the EHR via a third-party connector. The connector vendor needs a BAA, and the EHR vendor's BAA may or may not flow down to it.
- **Multi-state licensure.** A clinician licensed in one state treats a patient physically located in another. HIPAA does not police licensure, but state law does, and a HIPAA-compliant tool does not solve that.

## Evaluation checklist

1. Is there a signed BAA covering audio, video, chat, file transfer, and recordings
2. Is encryption in transit enabled for both signaling and media (DTLS-SRTP for media, TLS 1.2+ for signaling)
3. Is end-to-end encryption available, and is it compatible with recording requirements
4. Are recordings encrypted at rest, and what retention period is configurable
5. Who can access recordings, and is access logged
6. Is a waiting room feature available, with proper isolation between patients
7. Does the platform support patient identity verification at session start
8. Is MFA available for clinician accounts, and can it be enforced
9. Are detailed audit logs available (sessions, recording access, exports)
10. Is EHR integration direct or through a third-party connector, and is flow-down documented for any connector
11. Are subprocessors (media servers, transcription, analytics) disclosed and flowed down
12. Is geographic routing committed to a region, and are media servers documented
13. Does the vendor maintain SOC 2 Type II or HITRUST attestation
14. Are mobile apps in scope of the BAA, including any analytics SDKs they include
15. What is the documented breach notification timeline

## Common mistakes

- **Falling back to consumer tools.** When the telehealth platform fails, staff sometimes pivot to consumer video. Have a documented backup that is also BAA-covered.
- **Not configuring recording retention.** Default retention is often "forever." Set a clinical retention policy and configure the platform to enforce it.
- **Skipping identity verification.** A documented identity verification step at session start protects against unauthorized disclosure and improves clinical safety.
- **Forgetting connector vendors.** EHR-telehealth integrations frequently route through a third-party connector. Confirm the connector has a BAA and is flowed down.
- **Conflating HIPAA with licensure.** A BAA-covered telehealth platform does not authorize you to practice across state lines. Track licensure separately.
- **Not training staff.** A compliant tool used incompetently is a breach risk. Train clinicians on waiting rooms, identity verification, and recording controls.

For the broader question of when a vendor needs a BAA, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). The [vendor management hub](/learn/vendor-management) covers the rest of the program. [PHIGuard](/hipaa) is a HIPAA-native task system built for small clinics that need to track every telehealth, EHR, and billing BAA in one place.
