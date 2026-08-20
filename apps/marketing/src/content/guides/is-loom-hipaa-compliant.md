---
title: "Is Loom HIPAA Compliant"
vendor: "Loom"
description: "What healthcare organizations and small clinics need to know before using Loom for staff training videos, screen recordings, and internal communication — and when Loom use creates HIPAA risk."
metaDescription: "Is Loom HIPAA compliant Loom's standard plans lack a BAA. Learn when Loom creates HIPAA risk and how to use it safely without PHI."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
verificationDate: 2026-04-26
summary: "Loom (now owned by Atlassian) does not publicly offer a HIPAA BAA on standard plans. Small clinics can use Loom safely for training content that contains no PHI — the key constraint is that video content itself must not include patient names, records, or identifiable clinical information."
keyTakeaways:
  - "Loom's standard and Business plans do not include a HIPAA BAA as of this verification date — contact Loom/Atlassian to confirm Enterprise BAA availability."
  - "If a Loom video contains a patient's name, face, record data, or identifiable clinical information, that video contains PHI and requires a BAA-covered platform."
  - "Loom is commonly used for staff training — training videos that use fictional patient scenarios, software walkthroughs, and non-PHI content are safe uses."
  - "The risk arises when 'training' videos reference real patient scenarios, partial chart screenshots, or identifiable data even if 'blurred.'"
  - "Verify current BAA availability with Atlassian/Loom before using Loom for any content that may contain PHI."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-software-comparison-scorecard
relatedCommercialPath: /pricing
relatedLearnPath: /learn/vendor-management/when-a-vendor-needs-a-baa
sources:
  - title: "Loom Security and Privacy"
    url: "https://www.loom.com/security"
    publisher: "Loom (Atlassian)"
  - title: "Atlassian Trust Center"
    url: "https://www.atlassian.com/trust"
    publisher: "Atlassian"
  - title: "45 CFR § 164.504(e) — Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
faq:
  - q: "Can we use Loom for HIPAA training videos?"
    a: "Yes, if the training videos contain no PHI. A video walkthrough of the clinic's EHR interface using fictional patient data, or a presentation on HIPAA policy, does not create a PHI issue. The problem arises when training videos use real patient records, screenshots from actual charts, or other identifiable content."
  - q: "What if we blur patient names in screenshots used in a Loom video?"
    a: "Blurring alone may not be sufficient de-identification. If the context (diagnosis, date, provider name, visit type) could allow a viewer to re-identify the patient, the information may still be PHI. Use entirely fictional patient data for training content instead of blurring real records."
  - q: "We want to use Loom for telehealth visit recordings — is that acceptable"
    a: "No, without a confirmed BAA. A telehealth visit recording is PHI. A platform without a HIPAA BAA cannot be used to store or transmit telehealth recordings. Use a HIPAA-eligible video conferencing platform with a BAA for telehealth visits."
  - q: "Can we use Loom for internal staff meeting recordings?"
    a: "If the staff meeting involves discussion of specific patient cases with identifiable information, the recording contains PHI. If the meeting is a general operational discussion with no patient-specific information, Loom may be acceptable for non-PHI content."
---

Loom is an asynchronous video messaging tool used for software demos, staff training recordings, and internal communication. The HIPAA question with Loom turns on the content of the videos, not Loom's security posture.

**Note:** Loom was acquired by Atlassian in 2023. BAA availability, if any, is now managed through Atlassian's enterprise agreements. Contact Atlassian directly to confirm current BAA availability before using Loom for any PHI-containing content.

## Loom's HIPAA Posture

As of this verification date, Loom does not publicly advertise a HIPAA Business Associate Agreement on standard or Business plans. Atlassian's enterprise products (Jira, Confluence) have HIPAA coverage available in some configurations. Loom's enterprise BAA posture should be confirmed directly with Atlassian.

Atlassian enterprise agreements are priced for large organizations. Small clinics (3-50 staff) are unlikely to obtain HIPAA coverage through Atlassian enterprise pricing at a reasonable cost. Keep PHI out of Loom entirely.

## When Loom Creates HIPAA Risk

The risk with Loom is content-driven. When a video contains PHI, that file is PHI in a system with no BAA. This applies to:

### Training Videos With Real Patient Data

A training video that shows a real patient's record, even momentarily, to demonstrate how to document a visit or use a billing code is a video containing PHI. The same applies to:

- Screenshots from actual patient charts in EHR walkthroughs
- Audio that mentions real patient names in a clinical context
- Video that shows a patient's face or identifiable features

**The fix:** Use entirely fictional patient data in training videos. Create a clearly labeled test record in your EHR with synthetic identifiers and use only that non-real record for training recordings.

### Clinical Documentation and Review

If providers record a Loom video walking through a patient's case for a colleague's review ("here's [Patient Name]'s chart from today's visit"), that video contains PHI. This pattern sometimes develops when providers want to share clinical context asynchronously.

### Blurred or "Anonymized" Content

Blurring real patient data in a video does not constitute de-identification under HIPAA's safe harbor standard. If the diagnosis, provider name, visit date, and clinical context in the video could allow a viewer familiar with the patient to re-identify them, the information remains PHI.

## Safe Uses of Loom in a Clinic Setting

Loom is useful and HIPAA-compatible for content that contains no PHI:

- **Software and process walkthroughs** using fictional test patient data
- **HIPAA training content** explaining concepts, policies, and procedures without real patient examples
- **Operational updates** (scheduling changes, policy updates) that don't reference specific patients
- **Vendor evaluation demos** showing a product to the team without patient data in the demo environment

Apply this test to any Loom video: does the recording contain information that relates to a specific patient's health, healthcare, or payment for care If yes, use a HIPAA-eligible alternative. If no, Loom is appropriate for that content.

## Alternatives for PHI-Containing Video Needs

For video content that will or may contain PHI:

- **Telehealth visits:** Use a HIPAA-eligible telehealth platform with a BAA (Webex for Healthcare, Zoom for Healthcare with appropriate configuration, Doxy.me, etc.)
- **Clinical case consultation:** Use a HIPAA-eligible secure messaging or video platform
- **Training videos with real clinical content:** Obtain a BAA-covered video hosting platform, or restructure the content to use fictional data

For most small clinics, the clearest rule is: Loom is for non-PHI content only. Any content involving real patient information goes through a BAA-covered system.

## Current Source Posture

The source set for this page is Atlassian: Atlassian Trust Center; eCFR: 45 CFR § 164.504(e) — Business Associate Contracts. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Loom, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Loom into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Loom's standard and Business plans do not include a HIPAA BAA as of this verification date — contact Loom/Atlassian to confirm Enterprise BAA availability. If a Loom video contains a patient's name, face, record data, or identifiable clinical information, that video contains PHI and requires a BAA-covered platform. Loom is commonly used for staff training — training videos that use fictional patient scenarios, software walkthroughs, and non-PHI content are safe uses. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
