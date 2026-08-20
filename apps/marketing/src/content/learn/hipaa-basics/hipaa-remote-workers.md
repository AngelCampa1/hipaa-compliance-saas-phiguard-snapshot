---
title: "HIPAA for Remote Workers"
description: "HIPAA's Privacy and Security Rule obligations apply to workforce members regardless of where they work. This article covers what remote work means for PHI protection and what small clinics must require of staff working from home."
metaDescription: "HIPAA and remote workers: what covered entities must require when billing, coding, or admin staff handle PHI from home. Policies, devices, and access controls."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: hipaa-basics
schemaType: article
intent: awareness
summary: "HIPAA's obligations follow PHI wherever it goes — including into a workforce member's home. Remote billing, coding, and care coordination staff who handle PHI at home must operate under the same access controls, physical safeguards, and security requirements as on-site staff."
keyTakeaways:
  - "HIPAA's covered entity is responsible for PHI handled by its workforce regardless of whether that workforce is on-site or remote."
  - "Home workstations used to access PHI must meet the same encryption, access control, and session management standards as clinic workstations."
  - "Personal devices used for clinic work (BYOD) require at minimum: MFA, session timeout, device encryption, and an acceptable use policy."
  - "PHI must not be saved to personal drives, personal cloud storage, or personal email — even temporarily."
  - "A written remote work policy is required — ad-hoc remote work arrangements without a policy are a compliance gap under the Security Rule."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: phi-workflow-audit-worksheet
relatedCommercialPath: /pricing
sources:
  - title: "HIPAA Security Rule — 45 CFR § 164.308(a)(3) Workforce Security"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "HIPAA Security Rule — 45 CFR § 164.310 Physical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.310"
    publisher: "eCFR"
  - title: "NIST SP 800-66 Rev. 2 — Implementing the HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "Does HIPAA allow remote work?"
    a: "Yes. HIPAA does not prohibit remote work. The covered entity must extend its security controls to remote work environments — it cannot simply say remote work is fine without addressing how PHI is protected outside the clinic."
  - q: "Is a home Wi-Fi network acceptable for accessing PHI systems?"
    a: "A home network can be acceptable if it meets reasonable security standards: password-protected with WPA2 or WPA3 encryption, not a shared public or hotel network. Many covered entities require remote workers to use a VPN when accessing clinic systems over any network outside the clinic's own infrastructure."
  - q: "Can a remote employee use their personal laptop for work?"
    a: "This is a BYOD (bring your own device) situation that requires a specific policy. Personal devices accessing PHI must meet the clinic's security requirements — device encryption, MFA, session timeout, and separation of personal and work data. Many small clinics find it simpler to provide clinic-owned devices than to manage BYOD compliance."
---

Remote billing, coding, care coordination, and administrative work is now common in small clinic operations. Staff who handle PHI at home are subject to HIPAA regardless of location. This article covers what clinics must address when workforce members work with PHI outside the clinic's physical walls.

## PHI Follows the Workforce Member

The HIPAA Security Rule applies to electronic PHI regardless of where it is stored or transmitted. A billing coordinator who downloads an explanation of benefits to a laptop at home has brought PHI into a home environment. The clinic is still responsible for protecting it.

The Security Rule's workforce security provisions (45 CFR § 164.308(a)(3)) require covered entities to verify that workforce members accessing PHI are authorized and that their access is managed appropriately. That requirement applies equally to in-office and remote staff.

## What the Clinic Must Require of Remote Workers

### Device Standards

**Clinic-owned devices.** The most straightforward approach: provide remote workers with clinic-issued laptops or tablets that are configured to clinic security standards before the employee takes them home. These devices should have:

- Full-disk encryption (BitLocker on Windows, FileVault on Mac)
- Endpoint detection and response (EDR) software
- Enforced screen lock after inactivity
- Remote-wipe capability (so the device can be wiped if lost or stolen)
- VPN client for accessing clinic network resources

**Personal devices (BYOD).** If the clinic allows personal devices, the policy must define minimum requirements:

| Requirement | Why |
|---|---|
| Device encryption | PHI stored on an unencrypted device is an unprotected asset |
| Multi-factor authentication | Password alone is insufficient for PHI access |
| Session timeout | Unattended sessions risk unauthorized access |
| No PHI in personal storage | Personal cloud drives and local personal folders are not controlled by the clinic |
| Work profile separation | Work apps and data should be separated from personal apps |

Many small clinics find that managing BYOD compliance creates enough overhead that issuing clinic-owned devices is simpler.

### Physical Safeguards at Home

HIPAA's physical safeguards (45 CFR § 164.310) apply to clinic facilities, but the Security Rule's "workstation use" standard (45 CFR § 164.310(b)) requires covered entities to define appropriate workstation use for all workstations used to access ePHI. For remote workers, the clinic's workstation use policy must address home environments specifically.

Practical requirements for home work environments:

- **Private workspace for PHI-related calls.** A billing coordinator discussing a patient account should not be on speakerphone in a shared living space.
- **Screen positioning.** Monitor should not be visible to others who are not authorized to view PHI (family members, roommates, household guests).
- **No paper PHI at home.** If the clinic's workflow requires printing, that practice should be reviewed. PHI printed at home is in an uncontrolled environment. If printing is necessary, the printed material must be shredded before disposal.
- **Cleared desk at end of session.** PHI documents should not be left on a home desk overnight or when the employee is away from the workspace.

### Technical Access Controls

Remote access to clinic systems should not be treated differently from on-site access. Requirements:

- **Unique credentials.** Each remote worker must have their own login credentials. Shared credentials are not acceptable.
- **VPN or secure remote access.** Direct internet access to clinic systems without a VPN or equivalent secure tunnel is a risk that most clinics should address.
- **Session timeout.** Remote sessions should lock after a period of inactivity, the same as on-site workstations.
- **No PHI in personal cloud storage.** OneDrive, Google Drive, Dropbox, and similar personal cloud services should not be used to store or transfer PHI. This includes temporary workarounds ("I'll just upload it to share with the biller").

## The Common PHI Risks in Remote Work

**Remote billing staff saving PHI locally.** Billing coordinators who download EOBs, claim reports, or patient ledgers to their local desktop create PHI outside the clinic's controlled systems. This is especially risky on personal devices.

**Care coordinators using personal email for speed.** When the remote work setup is slow, staff may use a personal email account to send themselves a file or communicate with a patient. Personal email is not under BAA and is not an acceptable channel for PHI.

**Appointment and reminder calls from personal phones on speakerphone.** Staff making patient calls from personal phones in shared home spaces may inadvertently disclose PHI to household members.

**Unmanaged termination of remote access.** When a remote worker leaves, their access must be revoked with the same urgency as on-site access. VPN credentials, email login, and EHR access frequently get missed in off-boarding when the employee never physically returned a badge or key — out of sight, out of mind.

## The Policy Requirement

Remote work arrangements require a written policy. An informal understanding that "people can work from home" does not satisfy the Security Rule — even if everyone follows reasonable practices day to day.

A remote work policy for a clinical environment should address:

- Who is eligible to work remotely and for which tasks
- Device requirements (clinic-owned vs. BYOD; minimum requirements for each)
- Physical environment standards for home workspaces
- Technical access requirements (VPN, MFA, session timeout)
- Prohibited practices (personal email for PHI, personal cloud storage, printing PHI at home without authorization)
- Off-boarding: what happens to remote access when the employee leaves

This policy should be part of the clinic's HIPAA security policies and distributed to all remote-eligible workforce members, with a signed acknowledgment.

## Where to Start

For a small clinic establishing remote work compliance for the first time, the sequence is:

1. Inventory which roles currently work remotely and what PHI they handle
2. Assess device situation: clinic-owned or personal devices?
3. Draft or adopt a remote work policy that addresses device, physical, and technical requirements
4. Confirm remote access is controlled (VPN or secure remote access, not direct internet access to PHI systems)
5. Add remote access to the off-boarding checklist. Revoke it alongside on-site access.

Remote work compliance is not a separate HIPAA program. It is the same access controls, policies, and training applied wherever the workforce handles PHI.
