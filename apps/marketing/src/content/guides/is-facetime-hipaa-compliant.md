---
title: "Is FaceTime HIPAA Compliant for Medical Clinics"
vendor: "FaceTime / Apple"
seoTitle: "Is FaceTime HIPAA Compliant"
description: "Apple does not sign Business Associate Agreements for FaceTime. Clinics considering FaceTime for telehealth or care coordination need to understand the compliance gap before any patient call."
metaDescription: "Is FaceTime HIPAA compliant Apple does not sign BAAs for FaceTime. Learn the compliance gap and what clinics need for HIPAA-safe video calls."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "FaceTime / Apple requires a plan-and-use review, not a blanket HIPAA label. Apple does not sign Business Associate Agreements for FaceTime. Clinics considering FaceTime for telehealth or care coordination need to understand the compliance gap before any patient call. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out of unsupported workflows before using it with patient information."
keyTakeaways:
  - "Apple does not sign BAAs for FaceTime, which blocks its use for PHI under the HIPAA Security Rule."
  - "The HHS enforcement discretion notice that briefly permitted non-BAA video tools during the COVID-19 public health emergency ended in May 2023."
  - "FaceTime lacks audit logging, user access controls, and the administrative controls HIPAA requires for a business associate."
  - "Clinics that need HIPAA-compliant video must use a purpose-built telehealth or communications platform with a signed BAA."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "OCR Notification of Enforcement Discretion for Telehealth — Expiration"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/emergency-preparedness/notification-enforcement-discretion-telehealth/index.html"
    publisher: "HHS OCR"
  - title: "Business Associate Contracts — HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
  - title: "HIPAA Security Rule — Technical Safeguards (45 CFR § 164.312)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR / HHS"
faq:
  - q: "Did the COVID-19 public health emergency make FaceTime temporarily HIPAA compliant?"
    a: "HHS issued enforcement discretion that reduced the risk of penalty for certain non-BAA video platforms during the declared emergency. That discretion expired when the public health emergency ended in May 2023. FaceTime calls involving PHI after that date carry the same compliance requirements as before the pandemic."
  - q: "Can a clinic use FaceTime if the patient consents?"
    a: "Patient consent does not create a BAA or make a platform HIPAA compliant. Consent may address certain Privacy Rule considerations, but it does not resolve the Security Rule's technical and administrative safeguard requirements."
  - q: "What does Apple say about FaceTime and HIPAA?"
    a: "Apple's public documentation does not position FaceTime as a HIPAA-compliant tool and does not offer a BAA for the service. Apple does not provide healthcare-specific contractual protections for FaceTime."
  - q: "What video platform should a clinic use instead?"
    a: "Use a telehealth or video platform that executes a BAA with the clinic, provides access controls, and maintains session-level audit logs. Several vendors specialize specifically in clinical video communication."
---

## Verdict: No

FaceTime is not HIPAA compliant. Apple does not sign Business Associate Agreements for FaceTime. That single fact disqualifies it for any clinical use that involves PHI, regardless of how the call is framed or what information is discussed.

## The COVID-era exception is over

During the COVID-19 public health emergency, HHS OCR issued a notice of enforcement discretion allowing covered entities to use certain consumer-grade video platforms — including FaceTime — for good-faith telehealth without facing OCR penalty. That discretion expired in May 2023 when the public health emergency ended.

Clinics that continued using FaceTime for patient care after May 2023 without a BAA are out of compliance. There is no current enforcement discretion that covers FaceTime use.

## What the Security Rule requires from a video tool

Under 45 CFR § 164.312, covered entities must implement technical safeguards that include:

- **Access control.** Unique user identification and mechanisms to limit access to ePHI.
- **Audit controls.** Hardware, software, or procedural mechanisms that record and examine activity in systems containing ePHI.
- **Transmission security.** Technical measures to guard against unauthorized access to ePHI transmitted over networks.
- **Integrity controls.** Measures to confirm ePHI is not improperly altered or destroyed.

FaceTime provides encryption in transit — handling the transmission-security component — but it does not expose audit logs to covered entities, does not provide access control infrastructure, and cannot be administered to meet the HIPAA administrative safeguard requirements at 45 CFR § 164.308.

## Apple's position

Apple's public documentation and terms of service do not include BAA provisions for FaceTime or position the service as a healthcare-compliant tool.

Apple does execute Business Associate Agreements for some enterprise Apple products. FaceTime is not among them.

## What to use for clinic video calls

HIPAA-compliant video requires a vendor that:

1. Executes a signed BAA with the clinic
2. Provides audit logs accessible to the covered entity
3. Offers access controls by role
4. Documents security measures in writing


## The risk of relying on the COVID exception

A clinic that adopted FaceTime during the COVID-19 public health emergency and did not remove it from clinical workflows after May 2023 is now operating without a covered tool. The enforcement discretion was published as a temporary measure, with HHS explicitly noting it would expire. Its expiration was publicly announced and does not constitute a gray area.

If a clinic used FaceTime for patient encounters after May 11, 2023, it should assess whether those encounters constitute reportable breaches under 45 CFR § 164.402. A breach risk assessment should document the likelihood that PHI was accessed by unauthorized persons, considering the nature of FaceTime's encryption and Apple's data practices.

## Checklist for replacing FaceTime in a clinical workflow

When evaluating a compliant video replacement, confirm the following before routing patient calls through the platform:

1. **BAA.** Request and execute the BAA before the first patient call. Keep a signed copy in the clinic's vendor records.
2. **Session audit logs.** The platform must log call participants, start and end times, and session identifiers. Confirm these logs are accessible to the clinic.
3. **Access controls.** Confirm that only authorized staff can initiate or join clinical video sessions. Role-based restrictions should prevent unauthorized access.
4. **Waiting room or equivalent.** The platform should allow clinical staff to control when a patient enters a session to prevent unauthorized joiners.
5. **Data residency.** Confirm where session data and any recordings are stored, and that the storage location is covered under the BAA.

## What to use instead of FaceTime

Clinics that need HIPAA-compliant video for patient telehealth or care coordination must use a purpose-built platform that signs a BAA, provides session-level audit logs, and offers access controls by role. See [best HIPAA-compliant secure messaging](/resources/best/best-hipaa-compliant-secure-messaging) for evaluated communication alternatives, and review [HIPAA-compliant telehealth platforms](/learn/phi-workflows) for vendor evaluation criteria.

## Current Source Posture

The source set for this page is HHS: Business Associate Contracts — HHS Guidance; eCFR / HHS: HIPAA Security Rule — Technical Safeguards (45 CFR § 164.312). Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For FaceTime / Apple, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing FaceTime / Apple into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Apple does not sign BAAs for FaceTime, which blocks its use for PHI under the HIPAA Security Rule. The HHS enforcement discretion notice that briefly permitted non-BAA video tools during the COVID-19 public health emergency ended in May 2023. FaceTime lacks audit logging, user access controls, and the administrative controls HIPAA requires for a business associate. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
