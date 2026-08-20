---
title: "Is Webex HIPAA Compliant?"
vendor: "Webex"
description: "What healthcare organizations need to know about Webex's HIPAA BAA, Webex for Healthcare, telehealth use, and the configuration required before Webex can be used with PHI."
metaDescription: "Is Webex HIPAA compliant? Cisco offers a HIPAA BAA for Webex. Learn plan requirements, telehealth configuration, and PHI risks in video and messaging."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
verificationDate: 2026-04-26
summary: "Cisco offers a HIPAA Business Associate Agreement for Webex for qualifying healthcare customers. The pandemic-era HHS enforcement discretion for telehealth platforms ended in May 2023 — healthcare organizations using Webex for patient-facing telehealth or clinical communication must now operate under a signed BAA with appropriate configuration. Webex messaging, recordings, and AI features require the same PHI controls as video sessions."
keyTakeaways:
  - "Cisco offers a HIPAA BAA for Webex for qualifying healthcare customers — verify current plan requirements at webex.com/us/en/solutions/healthcare.html before deploying."
  - "HHS enforcement discretion for telehealth platforms expired in May 2023 — using any non-BAA-covered video platform for telehealth is no longer permissible under HIPAA."
  - "Webex messaging and persistent chat may contain PHI if staff or patients exchange clinical information through Webex — this content requires the same BAA coverage as video sessions."
  - "Webex recordings stored in Webex's cloud infrastructure are PHI if they contain patient encounters — confirm recording storage is covered under the BAA and restrict access accordingly."
  - "Webex AI Assistant and other AI features that transcribe or analyze meeting content may process PHI — confirm BAA coverage before enabling these features."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-software-comparison-scorecard
relatedCommercialPath: /pricing
relatedLearnPath: /learn/vendor-management/when-a-vendor-needs-a-baa
sources:
  - title: "Webex Healthcare Compliance"
    url: "https://www.cisco.com/c/en/us/solutions/industries/healthcare.html"
    publisher: "Cisco Webex"
  - title: "HHS Telehealth Policy — End of COVID-19 PHE Flexibilities"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/emergency-preparedness/notification-enforcement-discretion-telehealth/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.504(e) — Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
faq:
  - q: "What happened to the HHS telehealth enforcement discretion?"
    a: "During the COVID-19 Public Health Emergency (PHE), HHS exercised enforcement discretion that allowed covered healthcare providers to use non-HIPAA-compliant video platforms for good-faith telehealth services. The PHE ended in May 2023 and HHS ended the enforcement discretion at the same time. Since May 2023, telehealth providers must use HIPAA-compliant platforms with signed BAAs."
  - q: "We used Webex during COVID without a BAA — do we need one now?"
    a: "Yes. The enforcement discretion that may have covered good-faith telehealth use during the PHE has ended. If you continue using Webex for patient-facing telehealth or clinical communication, a BAA must be in place. Contact Cisco Webex to confirm BAA eligibility and execute the agreement."
  - q: "Does Webex for clinical internal communication require a BAA?"
    a: "If clinical staff use Webex messaging or video to discuss specific patients — sharing lab results, discussing a diagnosis, coordinating care — that communication contains PHI. Yes, a BAA is required. The BAA requirement applies whenever PHI is transmitted through a third-party platform, not only for patient-facing interactions."
  - q: "Can Webex recordings be stored in my organization's own cloud storage instead of Webex's cloud?"
    a: "Webex supports recording directly to a local device in some configurations. If recordings are stored locally on an authorized, encrypted clinic workstation, Webex's cloud infrastructure is not involved in storage — though Webex still processes the recording during the session. Confirm whether local recording is supported in your Webex plan and whether the BAA covers session processing even when recordings are stored locally."
---

Webex is Cisco's unified communications platform: video conferencing, messaging, calling, and collaboration. Healthcare organizations use it for telehealth visits, clinical team communication, and patient outreach.

Cisco has offered BAA coverage for Webex for years. The 2023 end of HHS enforcement discretion changed the stakes: organizations that used Webex without a BAA during the pandemic must now have a signed agreement in place.

**Note:** Cisco's Webex product offerings, BAA terms, and healthcare-specific plans evolve. Verify current BAA eligibility at webex.com or by contacting Cisco's healthcare sales team before relying on any previously confirmed coverage.

## The End of Telehealth Enforcement Discretion

During the COVID-19 Public Health Emergency, HHS issued enforcement discretion guidance allowing covered providers to use non-HIPAA-compliant video platforms for good-faith telehealth without facing penalties. Healthcare organizations needed to stand up telehealth in March 2020 without time for a full compliance review. HHS acknowledged that.

The PHE ended in May 2023. HHS ended the enforcement discretion at the same time. Since then:

- Using any video platform for patient-facing telehealth without a signed BAA is a HIPAA violation
- Good-faith use is no longer a defense
- Any organization still running on non-BAA-covered platforms has an active compliance gap

If your organization used Webex during the PHE without a BAA and has continued since May 2023, execute the BAA now.

## Webex's HIPAA BAA

Cisco offers HIPAA Business Associate Agreement coverage for Webex through its healthcare-focused offerings. BAA availability is associated with specific Webex plans designed for healthcare use. Verify that your specific Webex plan and product configuration is covered before going live.

Steps before using Webex with PHI:

1. Confirm your Webex account is on a BAA-eligible plan (not all Webex plans include BAA eligibility)
2. Execute the BAA with Cisco. The standard service agreement does not substitute.
3. Confirm which Webex products are covered: Webex Meetings, Webex Messaging, Webex Calling, Webex Contact Center may be separate products under the agreement
4. Confirm data hosting region if your compliance posture requires US-only data storage for PHI

## PHI in Webex Communications

### Video Sessions

A Webex telehealth session between a provider and patient is a clinical encounter. The session transcript, screen shares, and clinical content discussed constitute PHI. When Webex records or processes the session, it is processing PHI.

### Webex Messaging (Persistent Chat)

Webex includes persistent team messaging. If clinical staff use it to discuss patient cases — lab results, treatment plans, care coordination — those messages contain PHI.

PHI in Webex messaging creates ongoing retention obligations. Unlike a phone call, message history persists and may be retained indefinitely unless data retention settings are configured.

| Communication type | PHI risk |
|---|---|
| Patient telehealth visit | High: session content is PHI |
| Staff clinical discussion via messaging | High: patient-specific communication is PHI |
| Meeting recordings stored in Webex cloud | High: clinical recordings are PHI |
| Administrative-only staff meetings | Low: generally not PHI |
| Patient appointment reminders via Webex | Depends: name + appointment date = PHI |

### Recordings Stored in Webex Cloud

Webex can record meetings and store recordings in Cisco's cloud infrastructure. If those recordings are clinical encounters or contain patient-specific clinical discussion, the recordings are PHI. Cloud-stored recordings:

- Must be covered under the Webex HIPAA BAA
- Should be access-controlled to limit who can play, download, or share recordings
- Are subject to HIPAA retention requirements: retain for six years, dispose of securely after the retention period

If recordings of clinical encounters are stored in Webex's cloud infrastructure and the BAA does not explicitly cover recording storage, the clinic has an unresolved PHI exposure.

## Webex AI Features

Webex has built AI into the platform: AI Assistant (real-time transcription, summaries, action items), noise removal, meeting highlights, and generative AI features.

When AI Assistant transcribes a patient encounter, confirm it is covered under your Webex BAA, determine whether Webex uses meeting content for model improvement, and understand where transcription data is stored and for how long.

Webex's AI features change quickly. Verify coverage at the time of your evaluation, not at the time of initial BAA execution.

## Configuration for HIPAA-Compliant Use

### Meeting Access Controls

Enable waiting rooms on all patient-facing Webex sessions to control when patients join. Use unique meeting links per patient session rather than a single persistent meeting room link.

### Recording Policy

Establish a written policy on whether patient visits may be recorded. If recording is permitted:
- Obtain patient consent before recording (state consent requirements vary)
- Restrict access to recordings to authorized staff
- Configure Webex recording access controls before sessions begin

### Messaging Data Retention

Configure Webex messaging data retention settings to align with HIPAA retention obligations. PHI in Webex messages must be retained for six years and disposed of securely after that period.

### Staff Access Management

Limit Webex administrative access (the ability to view meeting recordings, download transcripts, and access messaging history across channels) to authorized staff with legitimate operational need.

## The Post-PHE Compliance Assessment

If your organization used Webex during the PHE without a formal BAA and has continued since May 2023, act now:

1. Contact Cisco to confirm BAA eligibility for your current plan
2. Execute the BAA
3. Configure the settings above
4. Document the BAA execution and configuration review in your compliance records

If your plan is not BAA-eligible, move to one that is — or evaluate alternatives. Enforcement discretion ended two years ago. Operating without a BAA is not a defensible position.
