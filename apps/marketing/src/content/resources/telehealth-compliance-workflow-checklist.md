---
title: "Telehealth Compliance Workflow Checklist"
headline: "A session-by-session and quarterly checklist for running HIPAA-compliant telehealth at your clinic"
description: "A HIPAA telehealth compliance checklist for small medical clinics covering pre-session platform verification, patient consent, recording policy, cross-state issues, device requirements, incident reporting, and quarterly review."
metaDescription: "Free HIPAA telehealth compliance checklist for small clinics. Pre-session setup, platform BAA verification, consent, recording policy, and quarterly review."
magnetSlug: "telehealth-compliance-workflow-checklist"
summary: "A HIPAA telehealth compliance checklist for small medical clinics covering pre-session platform verification, patient consent, recording policy, cross-state issues, device requirements, incident reporting, and quarterly review. Small clinics can use it to document telehealth compliance workflow checklist, assign owners, set review dates, capture exceptions, and keep evidence aligned with HIPAA safeguards, minimum necessary expectations, vendor oversight, or patient-rights obligations reflected in the cited source material."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Pre-session setup checklist — BAA confirmation, device encryption, private environment, patient identity verification"
  - "Platform BAA status section — the post-PHE requirement to verify coverage before every new platform or feature"
  - "Patient consent and recording policy documentation — what to document and how to store consent records"
  - "Multi-state telehealth section — when different state privacy laws apply to the same session"
  - "Quarterly telehealth program review — what to audit every three months to maintain compliance"
faq:
  - q: "Who should own the telehealth compliance workflow checklist?"
    a: "The privacy officer, security officer, or practice administrator should own the telehealth compliance workflow checklist, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "HHS Telehealth Policy — End of COVID-19 PHE Flexibilities"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/emergency-preparedness/notification-enforcement-discretion-telehealth/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.312(e) — Transmission Security"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.312"
    publisher: "eCFR"
  - title: "FTC Health Breach Notification Rule"
    url: "https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule"
    publisher: "FTC"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
verificationDate: "2026-04-26"
---

## Post-PHE Telehealth Compliance Requirements

The COVID-19 Public Health Emergency enforcement discretion that allowed covered healthcare providers to use any available video platform for good-faith telehealth ended in May 2023. Since that date, telehealth operated by covered entities must comply with HIPAA's Privacy and Security Rules in full, including the requirement for a signed BAA with any video platform that processes PHI during sessions.

The post-PHE environment differs from the pre-2020 environment in two ways:

First, many clinics established telehealth programs during the PHE using platforms such as FaceTime, consumer Zoom, and Skype that are not HIPAA-compliant and may not offer BAAs. Those clinics needed to migrate to BAA-covered platforms or execute BAAs with their current platforms by May 2023. If the migration hasn't happened, it is overdue.

Second, telehealth platforms have expanded rapidly. Many platforms now offer AI transcription, session summaries, automated clinical notes, and EHR integrations. Each new feature must be assessed for BAA coverage before enabling.

This checklist addresses both the session-level operational requirements and the program-level quarterly review.

## Section 1: Platform BAA Verification

Complete this section once per platform and update it when the platform adds new features.

**Primary telehealth platform:**
- Platform name: ____
- Is there a signed BAA with this platform [ ] Yes — BAA execution date: ____ [ ] No — STOP: do not use this platform for telehealth until a BAA is in place
- Does the BAA cover the specific features your clinic uses (video, recording, chat, transcription): [ ] Confirmed [ ] Not verified — need to check
- Does the BAA cover AI features (transcription, session summary, clinical note generation) [ ] Confirmed [ ] Not covered — AI features must be disabled [ ] Not applicable (AI features not used)
- Data hosting region: [ ] US only [ ] Multi-region — assess whether this is acceptable under your compliance posture

**Secondary platforms or backup platforms:**
- If you have a backup platform for technical issues, assess it for BAA coverage independently

**When to re-verify:**
- When the platform announces new features, especially AI features
- When the platform changes its terms of service
- At each annual BAA renewal review

## Section 2: Pre-Session Checklist (Complete Before Each Session)

### Provider Environment

- [ ] Using a BAA-covered device (clinic-issued) or a personally-owned device with MDM and clinic security policies applied
- [ ] Session conducted in a private location — door closed, no bystanders within earshot
- [ ] Screen not visible to unauthorized persons (face away from windows or shared spaces)
- [ ] Headset used where possible — reduces ambient audio exposure
- [ ] Other browser tabs and applications closed — reduces screen share risk

### Device and Connection

- [ ] Device is encrypted (clinic-issued: confirmed at last device audit; personal device: MDM confirmed)
- [ ] Using a secure network — clinic network or a secured VPN connection (not an unsecured public Wi-Fi)
- [ ] Browser and telehealth application software is updated
- [ ] Session link is session-specific, not a persistent room link shared with multiple patients

### Patient Identity Verification

- [ ] Patient identity verified at the start of the session: confirm name, DOB, and primary reason for visit before discussing clinical content
- [ ] Document verification in the visit note
- [ ] If clinical staff are involved in the session (MA, nurse), confirm they are authorized and document their presence

## Section 3: Patient Consent Documentation

HIPAA requires that patients receive information about how their PHI will be used. Many states also require explicit informed consent for telehealth services — separate from standard HIPAA authorization.

**Consent process:**
- [ ] Does your clinic have a written telehealth consent form?
- [ ] Is telehealth consent obtained before the first telehealth session — not during it?
- [ ] Does the consent form cover: how the session is conducted, what platform is used, any recording policy, any limitations on telehealth services, and the patient's right to choose in-person care?
- [ ] Is signed consent documented in the patient's record?

**State-specific consent requirements:**
Some states (California, New York, and others) have telehealth-specific informed consent requirements that may be more stringent than HIPAA's general notice requirements. If your clinic serves patients in multiple states via telehealth, verify the consent requirement for each state.

| State | Telehealth-specific consent required | Form used | Notes |
|---|---|---|---|
| [Your state] | | | |
| [Other state if multi-state] | | | |

## Section 4: Recording Policy

If your telehealth sessions are recorded, the recording policy must address:

**Recording authorization:**
- [ ] Patient consent for recording is obtained before the session begins — not assumed or embedded in general terms
- [ ] Recording consent is documented in the patient's record
- [ ] State law on consent to record is verified — some states require all-party consent

**Recording storage:**
- [ ] Recordings are stored in a BAA-covered storage environment — not in the telehealth platform's default cloud storage unless that storage is explicitly covered by the BAA
- [ ] Access to recordings is restricted to authorized clinical and administrative staff
- [ ] Recordings are retained per your clinic's records retention policy and disposed of securely after the retention period

**If recordings are not used:**
- [ ] Recording is disabled in the telehealth platform settings
- [ ] Staff are instructed not to record sessions on personal devices

## Section 5: Cross-State Telehealth Issues

If your clinic provides telehealth to patients located in a different state than your clinic:

**Licensure:** Telehealth is regulated by state medical boards. Before providing telehealth to patients in another state, confirm that the treating provider holds an active license in the patient's state, or that the state's licensure exceptions apply. This is a medical licensure issue, not a HIPAA issue, but it is an important prerequisite for cross-state telehealth.

**Privacy law overlay:** The patient's state privacy law may impose stricter requirements than federal HIPAA. For example, California's CMIA may apply to sessions with California-based patients. Review the state-law overlay matrix for states where you provide telehealth to determine whether additional obligations apply.

**Breach notification:** If a breach involves patients in multiple states, the notification obligations of each state may apply. The strictest applicable standard governs timing.

**States where telehealth is provided:**

| State | Provider licensed | Additional consent requirements | State privacy law stricter than HIPAA |
|---|---|---|---|
| | | | |
| | | | |

## Section 6: Incident Reporting for Telehealth

Telehealth-specific incidents that must be reported through your incident response process:

- Session link accessed by an unauthorized third party (patient shared the link)
- PHI visible on screen during a session beyond the treating clinical team
- Session recorded without patient consent
- Recording accessed by an unauthorized party
- Session conducted on a platform not covered by a BAA
- Patient identity not verified and session proceeded — possible wrong-patient disclosure

Any of these events should be reported to the Privacy Officer using your standard incident intake process. The incident triage worksheet determines whether a breach determination is needed.

## Section 7: Quarterly Telehealth Program Review

Every quarter, complete this review of your clinic's telehealth compliance program.

**Platform review:**
- [ ] Confirm the BAA with the primary telehealth platform is current and has not expired
- [ ] Check whether the platform has added any new features since last review — assess for BAA coverage
- [ ] Review any platform security announcements or breach notifications

**Volume and incident review:**
- [ ] How many telehealth sessions were conducted this quarter?
- [ ] Were any telehealth-related incidents reported If yes, review triage outcomes.
- [ ] Any patient complaints or concerns related to telehealth privacy?

**Staff training check:**
- [ ] Were any new staff added who will conduct telehealth sessions Have they been trained on the telehealth checklist and platform?
- [ ] Any staff training refresher needed based on incidents or observations?

**Consent records:**
- [ ] Are telehealth consent forms current for all active telehealth patients?
- [ ] Were any sessions conducted without documented consent?

**Recording audit:**
- [ ] If recording is in use, are recordings stored in the correct (BAA-covered) location?
- [ ] Are recordings access-controlled appropriately?
- [ ] Any recordings scheduled for disposal per retention policy?

**Quarterly review completed by:** ____  **Date:** ____

## What PHIGuard Changes

PHIGuard keeps telehealth compliance work in one operating record: platform BAA status, assigned review tasks, and incident reports from telehealth sessions all logged in one place. When a telehealth platform announces new AI features, the clinic can open a vendor review item and attach the BAA reassessment evidence to that record. The quarterly review becomes a tracked checklist rather than a calendar reminder that gets rescheduled.
