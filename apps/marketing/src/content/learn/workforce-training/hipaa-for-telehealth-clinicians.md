---
title: "HIPAA for Telehealth Clinicians"
seoTitle: "HIPAA for Telehealth Clinicians: Compliance Guide"
description: "Telehealth clinicians face unique PHI risks — platform BAAs, recording consent, location security, device requirements, and handling technical failures. This guide covers the HIPAA obligations specific to delivering care remotely."
metaDescription: "HIPAA for telehealth clinicians: BAA requirements for video platforms, recording consent, session security, device requirements, and what to do when a."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "workforce-training"
schemaType: "article"
intent: "awareness"
summary: "Telehealth clinicians must ensure their video platform has a signed BAA, conduct sessions from a private location over a secure connection, obtain patient consent before recording, and follow documented protocols for handling technical failures and post-session documentation — under 45 CFR §§ 164.312(a) and 164.312(e)."
keyTakeaways:
  - "A BAA with the telehealth video platform vendor is required before delivering any telehealth session involving PHI — consumer platforms without BAAs are not compliant."
  - "Clinicians and patients both need private locations for telehealth sessions; the clinician cannot control the patient's environment but must document that they informed the patient of the risk."
  - "Recording a telehealth session without patient consent is an unauthorized disclosure of PHI; many states also require two-party consent independent of HIPAA."
  - "When a technical failure interrupts a session with PHI visible on screen, documented session closure and screen-clearing protocols are required."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-new-hire-checklist"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/workforce-training"
sources:
  - title: "45 CFR § 164.312 — Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "HHS — Telehealth and HIPAA"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/telehealth/index.html"
    publisher: "HHS"
  - title: "HHS — Notification of Enforcement Discretion for Telehealth"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/emergency-preparedness/notification-enforcement-discretion-telehealth/index.html"
    publisher: "HHS"
faq:
  - q: "Is a consumer video platform like Zoom or FaceTime HIPAA compliant?"
    a: "The consumer versions of these platforms are not HIPAA compliant. However, Zoom for Healthcare and similar enterprise-tier products offer BAAs and security configurations that satisfy HIPAA requirements. FaceTime and standard consumer Zoom are not compliant because they do not offer BAAs for healthcare use. The distinction is not the platform name — it is whether a BAA is available and whether the security configuration meets the Security Rule requirements."
  - q: "Does the patient need to be in a private location for telehealth?"
    a: "HIPAA does not require the patient to be in a private location. The privacy risk of the patient's environment belongs to the patient, not the covered entity. However, clinicians should inform patients at the start of the session that the call may involve sensitive health information and encourage them to be in a private location. Documenting that this disclosure was made shifts the privacy risk appropriately. Some state telehealth consent laws require this disclosure explicitly."
  - q: "What HIPAA documentation is required for telehealth sessions?"
    a: "Telehealth sessions must be documented in the patient's medical record like any other encounter — SOAP note or equivalent clinical documentation, the date and duration of the visit, the platform used, and any clinical decisions made. Additionally, the patient's consent for telehealth (and for recording, if applicable) should be documented in the chart. The encounter note is PHI and subject to the same retention requirements as in-person visit notes."
  - q: "What is the difference between PHI captured during telehealth and consumer health app data?"
    a: "PHI captured during a telehealth encounter with a covered entity is governed by HIPAA. Consumer health app data — from a fitness tracker, a wellness app, or a consumer telemedicine service that the patient uses independently — is generally not covered by HIPAA because it is not collected by a covered entity or business associate. However, if a patient shares consumer app data with a covered entity during a telehealth encounter and it is incorporated into the medical record, it becomes PHI at that point."
---

Every telehealth session involves PHI transmitted over a network, stored in a system, and potentially recorded — each of which carries specific HIPAA requirements. Your obligations as a telehealth clinician are not relaxed because care is delivered remotely.

**Scenario:** You start a telehealth session for a new patient using the standard Zoom account the practice already had. No BAA exists with Zoom because the practice purchased a consumer Business account, not Zoom for Healthcare. Every session you conduct over that account is an unauthorized disclosure of ePHI to Zoom. The platform transmits PHI during every session — it is a business associate, and 45 CFR § 164.308(b)(1) requires a BAA before the first transmission. The fix is switching to a healthcare-tier account with a BAA before delivering another session.

## Platform Selection and BAA Requirements

Under 45 CFR § 164.308(b)(1), your clinic must execute a BAA with any business associate that creates, receives, maintains, or transmits PHI on its behalf. A telehealth video platform transmits PHI during every session — it is a business associate.

**What a telehealth platform BAA must address:**
- The vendor's obligations to safeguard PHI under the Security Rule
- Permitted uses and disclosures of PHI
- Requirements to report breaches to your clinic
- Provisions for returning or destroying PHI upon contract termination
- Prohibition on using PHI for the vendor's own purposes (advertising, platform improvement without explicit authorization)

**Consumer vs. enterprise platform tiers:** Many common platforms (Zoom, Microsoft Teams, Google Meet) offer healthcare-specific tiers that include BAAs. The consumer tier of the same platform does not. Before using any platform for telehealth, verify: Does the vendor offer a BAA for healthcare use? Is your account configured at the tier that includes the BAA? Are security features (end-to-end encryption, waiting rooms, recording controls) enabled?

The HHS enforcement discretion policy that allowed consumer platforms during the COVID-19 public health emergency has expired. The standard BAA requirement applies.

## Recording Consent Requirements

Recording a telehealth session creates a permanent audio/video PHI record. Before recording:

**Obtain patient consent.** Recording a patient without consent is an unauthorized capture of PHI. Consent should be documented in the patient's chart before the first recorded session, renewed if the scope of recording changes, and specific about what will be recorded and how it will be used — clinical reference, billing review, and training each require separate disclosure.

**Check state law.** Many states require two-party consent for audio or video recording — meaning both parties must affirmatively consent. This is stricter than HIPAA. States including California, Florida, Illinois, and Michigan require two-party consent. Check your state's recording consent law before recording any session.

**Store recordings securely.** A telehealth recording is ePHI and must be: stored in a HIPAA-compliant environment with the same controls as any other ePHI; access-controlled (only authorized clinical staff); audit-logged (who viewed the recording and when); retained per the clinic's medical records retention schedule; and securely deleted when retention expires.

## Location Security: Provider and Patient

### Your Location Requirements

Deliver telehealth from a secure, private location. Under 45 CFR § 164.310(b), your clinic must implement policies on proper workstation use for workstations accessing ePHI.

For telehealth, this means: conduct sessions where household members, colleagues, or bystanders cannot overhear the patient; use a background or physical setup that does not reveal information about other patients (no visible charts or whiteboards on screen); ensure the screen displaying patient information is not visible to anyone behind or beside you; and use headphones when there is ambient noise risk.

**What not to do:** Delivering a telehealth session from a coffee shop, open office, or any public or semi-public space is not compliant — regardless of how secure the connection is. The session itself is a clinical encounter where the patient expects confidentiality.

### Patient Location — What You Can and Cannot Control

You cannot control the patient's environment, and HIPAA does not require you to. Inform patients at the start of the session that the call involves sensitive health information and encourage them to choose a private location. Document that this disclosure was made. If a patient chooses to take the call in a public space and PHI is discussed, the privacy risk rests with their choice — provided you documented the privacy disclosure.

## Device Security Requirements

Under 45 CFR §§ 164.312(a) and 164.310(b), devices you use to deliver telehealth must meet the same security standards as any device accessing ePHI:

- **Encryption at rest**: Device storage must be encrypted
- **Automatic logoff**: Session must terminate after inactivity
- **Unique credentials**: Log in with your individual credentials, not a shared account
- **No personal accounts on clinical devices**: Clinical devices should not be used with personal email, personal cloud storage, or non-approved apps
- **Screen lock**: Device must require authentication to unlock

Personal devices used for telehealth require a formal bring-your-own-device (BYOD) policy with documented security controls. Without a BYOD policy, using a personal phone or laptop for telehealth creates uncontrolled ePHI endpoints.

## Handling Technical Failures Mid-Session

Connection failures, audio dropouts, and platform errors are routine in telehealth. When a failure occurs while PHI is on screen or while a sensitive clinical discussion is in progress, follow your clinic's documented protocol.

**Immediate steps:**

1. Close or minimize any open patient records visible on screen.
2. Lock the screen if the device is in an exposed location.
3. Do not attempt to reconnect to the patient over a non-approved channel (personal phone, personal email) unless the clinic's emergency protocol specifically permits it with patient authorization.
4. Contact the patient through the clinic's approved communication method to reschedule or reconnect.

**Documentation:** Document the session interruption in the patient's chart, including: the time the failure occurred; what portion of the encounter had been completed; how the patient was contacted to reschedule or reconnect; and any clinical information already exchanged that needs to be incorporated into the note.

Your clinic should have a written protocol for connection failures so you can follow it without making real-time judgment calls about whether a non-compliant channel is acceptable in the moment.

## Post-Session Documentation

Complete telehealth encounter documentation the same day as the encounter. It belongs in the EHR with the same completeness and retention requirements as any other clinical note. Key elements: date and time of the session; platform used; whether the session was recorded (and if so, consent documented); clinical note (SOAP or equivalent); patient location disclosure acknowledgment; and any technical issues that affected the session.

Under 45 CFR § 164.524, patients have the right to access telehealth documentation as part of their medical record. Documentation that is incomplete or not filed in the approved system is both a clinical and compliance risk.

## Consumer Health Apps Are Not Covered

The HIPAA Privacy and Security Rules apply to covered entities and their business associates. Many patients use consumer health apps — fitness trackers, wellness platforms, consumer telemedicine apps, medication reminder apps — that are not covered by HIPAA because they are not operated by covered entities or their business associates.

If a patient shares data from a consumer app during your session, that data is not protected by HIPAA until your clinic incorporates it into the medical record. At that point, it becomes PHI. Do not use consumer health apps as clinical data repositories, even if a patient prefers this. Clinical data belongs in the approved EHR.

For PHI communication channel requirements, see [PHI in text messaging](/learn/phi-workflows/phi-in-text-messaging) and [PHI in email](/learn/phi-workflows/phi-in-email). For minimum necessary access principles, see [minimum necessary standard](/learn/hipaa-basics/minimum-necessary-standard).

PHIGuard helps small clinics manage telehealth compliance tasks alongside all other HIPAA obligations — BAA tracking, workforce training, and incident response — at current pricing. Learn more at [PHIGuard HIPAA](/hipaa).
