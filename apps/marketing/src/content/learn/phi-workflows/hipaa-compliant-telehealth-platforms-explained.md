---
title: "HIPAA Compliant Telehealth Platforms: Evaluation Guide"
seoTitle: "HIPAA Compliant Telehealth Platforms Explained"
description: "What makes a telehealth platform HIPAA compliant, which technical requirements apply, and how small clinics should evaluate vendors."
metaDescription: "HIPAA compliant telehealth platforms need a BAA, encrypted video, access controls, and audit logs. Learn how to evaluate vendors for clinical use."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "consideration"
summary: "Telehealth platforms that carry live audio and video with patients are ePHI systems when the sessions involve clinical information. They must meet HIPAA Security Rule requirements — BAA, encrypted transmission, access controls, and audit logging — and must not route session data through unauthorized subprocessors. This guide covers evaluation criteria for small clinics choosing a telehealth vendor."
keyTakeaways:
  - "Any telehealth platform used for clinical sessions involving patient health information must sign a BAA."
  - "Video and audio encryption in transit is the primary technical requirement — consumer video calling does not meet the standard."
  - "Session recordings, chat transcripts, and waiting room data all carry PHI risk and must be handled accordingly."
  - "The HHS Notification of Enforcement Discretion that permitted consumer platforms during the COVID-19 emergency ended on August 9, 2023, following a 90-day transition after the public health emergency expired."
  - "BAA availability at the clinic's pricing tier — not just in enterprise plans — is the first evaluation filter."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Telehealth and HIPAA — HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/telehealth/index.html"
    publisher: "HHS"
  - title: "HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.312(e) — Transmission Security"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
faq:
  - q: "Does FaceTime count as HIPAA compliant telehealth?"
    a: "No. Apple does not offer a BAA for FaceTime. During the COVID-19 public health emergency, HHS exercised enforcement discretion permitting some consumer platforms. That enforcement discretion ended on August 9, 2023, following the 90-day transition period after the PHE expired. FaceTime cannot be used compliantly for telehealth today."
  - q: "Is Zoom HIPAA compliant for telehealth?"
    a: "Zoom for Healthcare is a separate offering that includes a BAA. The standard Zoom consumer plan does not include a BAA and should not be used for clinical telehealth sessions."
  - q: "Are telehealth session recordings PHI?"
    a: "Yes, if the recording captures a clinical interaction that includes identifiable patient health information. Recordings must be stored in a system covered by a BAA, with appropriate access controls and retention management."
  - q: "What happened to the COVID-era telehealth HIPAA flexibility?"
    a: "HHS issued a Notification of Enforcement Discretion during the COVID-19 public health emergency that permitted the use of non-BAA-covered consumer platforms for telehealth. That discretion formally ended on August 9, 2023, following a 90-day transition period after the public health emergency expired on May 11, 2023. All telehealth platforms used for clinical sessions now require a BAA."
---

Telehealth platforms carry the full weight of HIPAA compliance obligations when they are used for clinical sessions. The audio and video of a patient consultation is PHI. The chat transcript is PHI. The session metadata — patient name, appointment time, provider — is PHI. Any platform that processes this data is a business associate and must have a signed BAA.

This guide covers what those obligations require and how to evaluate telehealth vendors for a small clinic.

## What changed after the COVID-19 public health emergency

During the COVID-19 emergency, HHS issued enforcement discretion guidance permitting covered entities to use widely available consumer video platforms — including some without BAAs — for telehealth. The public health emergency expired on May 11, 2023. HHS provided a 90-day transition period, and the enforcement discretion formally ended on August 9, 2023.

Since August 9, 2023, the full Security Rule applies to telehealth sessions. Consumer video calling applications that do not offer a BAA cannot be used compliantly for clinical telehealth.

## Security Rule requirements for telehealth platforms

The HIPAA Security Rule at 45 CFR Part 164, Subpart C, applies to ePHI — which includes real-time audio and video streams when they carry patient health information.

**Transmission security (§ 164.312(e))** — video and audio must be encrypted in transit. End-to-end encryption (E2EE) is the strongest form; TLS-encrypted streams that are encrypted at the transport layer but potentially decrypted at the provider's server is a weaker but common alternative. The Security Rule does not mandate E2EE, but the addressable encryption specification requires a documented decision if a weaker approach is used.

**Access controls (§ 164.312(a))** — waiting rooms must be controlled so that only the intended patient joins the session. Providers must have unique login credentials. Patient links should not be reusable without a new authorization from the provider.

**Audit controls (§ 164.312(b))** — the platform should log session activity: who joined, when, what was recorded, and whether any files were shared or chat messages were sent.

**Integrity (§ 164.312(c))** — session recordings, if made, should be protected from unauthorized modification. This applies to storage of the recording after the session ends.

## Evaluation criteria for telehealth vendors

### BAA availability and scope
Is the BAA offered at a plan tier the clinic can use? What does the BAA cover — only the video session itself, or also session recordings, chat transcripts, and patient data stored in the platform's scheduling tools?

Some platforms offer an EHR integration or an internal scheduling system that holds patient records. If the clinic uses those features, the BAA must cover them.

### Video encryption
Does the platform use end-to-end encryption, or TLS-in-transit only? For most clinical telehealth, TLS-in-transit with a signed BAA satisfies the Security Rule. Platforms that decrypt and re-encrypt at the server (common in cloud video) should be evaluated to confirm the BAA covers the server-side handling.

### Waiting room controls
Uncontrolled waiting rooms where patients can join a session before the provider admits them — or where multiple patients can inadvertently see each other — are an access control failure. The platform should support per-session unique patient links and provider-controlled admission.

### Session recording handling
If the clinic uses session recording:
- Where are recordings stored?
- Who can access them?
- Is there a retention and deletion policy?
- Is storage covered under the BAA?

Recordings stored in a personal cloud drive or emailed to the provider's personal account are outside BAA coverage and create a breach risk.

### Subprocessor transparency
Cloud telehealth platforms route video through content delivery networks and cloud storage services. The BAA should enumerate or cover these subprocessors. A BAA that covers only the named vendor but not their infrastructure providers leaves gaps.

## Common gaps in telehealth compliance

| Gap | Risk |
|-----|------|
| No BAA offered at clinic's plan tier | Direct Security Rule violation |
| Consumer video app without BAA | Impermissible disclosure of PHI |
| Shared provider login for multiple staff | Access control violation |
| Uncontrolled waiting room links | Unauthorized access exposure |
| Recordings stored outside BAA coverage | Breach risk, audit gap |
| Chat transcripts not covered by BAA | PHI disclosure gap |

## Practical starting point

Before deploying a telehealth platform for clinical use:

1. Confirm the vendor offers a BAA at your plan level
2. Execute the BAA before the first session
3. Review what the BAA covers — video, recordings, chat, scheduling, and storage
4. Configure unique provider credentials
5. Enable waiting room controls
6. Establish a recording policy if the platform supports recording
7. Add the vendor to your BAA tracking list

For the broader vendor selection framework, see [When a Vendor Needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). For how telehealth fits into the overall digital communication landscape for clinics, see [PHI in Zoom Meetings](/learn/phi-workflows/phi-in-zoom-meetings).

PHIGuard includes BAA tracking and vendor compliance documentation as part of every plan. For plan details, visit [/hipaa](/hipaa).
