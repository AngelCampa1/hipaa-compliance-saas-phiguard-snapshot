---
title: "HIPAA Offboarding Checklist"
headline: "A same-day checklist for revoking access and protecting PHI when a staff member separates from your clinic"
description: "A structured HIPAA offboarding checklist for medical clinics covering same-day ePHI access revocation, device retrieval, physical access removal, email handling, and final attestation."
metaDescription: "Free HIPAA offboarding checklist for medical clinics. Same-day ePHI access revocation, device retrieval, and final attestation template for staff separations."
magnetSlug: "hipaa-offboarding-checklist"
summary: "A structured HIPAA offboarding checklist for medical clinics covering same-day ePHI access revocation, device retrieval, physical access removal, email handling, and final attestation. Small clinics can use it to document offboarding checklist, assign owners, set review dates, capture exceptions, and keep evidence aligned with HIPAA safeguards, minimum necessary expectations, vendor oversight, or patient-rights obligations reflected in the cited source material."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Same-day system access revocation checklist — every PHI-touching system, in order, with a checkbox"
  - "Physical access section — keys, badges, lock codes, medication room, and records storage"
  - "Device return and wipe tracking — clinic-issued and any personal devices used for clinic PHI"
  - "Email handling guide — preservation, forwarding disable, inbox rule review"
  - "Final attestation template — signed document confirming return of property and ongoing confidentiality obligations"
faq:
  - q: "Who should own the offboarding checklist?"
    a: "The privacy officer, security officer, or practice administrator should own the offboarding checklist, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "45 CFR § 164.308(a)(3)(ii)(C) — Termination Procedures"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
  - title: "HIPAA Security Rule Workforce Security Guidance"
    url: "https://www.ecfr.gov/current/title-45/section-164.308"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/workforce-training/remove-access-terminated-employees"
verificationDate: "2026-04-26"
---

## Offboarding Is a Same-Day Obligation

Under 45 CFR §164.308(a)(3)(ii)(C), covered entities must implement procedures for terminating access to ePHI when employment or a workforce arrangement ends. HHS and OCR enforcement guidance makes clear that "implementing procedures" means acting on the day of separation, not within a week, not at the next quarterly access review.

OCR resolution agreements frequently involve small clinics where a former employee accessed patient records weeks or months after termination using credentials that were never revoked. Access revocation is an administrative process that fails when no one is responsible for doing it immediately.

This checklist structures offboarding as an assigned task with a specific list of systems, a physical access protocol, and a final attestation. It takes approximately 2-3 hours to complete for a staff member with access to typical clinic systems.

## When to Start the Checklist

For voluntary separations where the departure date is known in advance, begin the prep work (preparing the system list, staging device retrieval) the week before the last day. Execute the access revocation itself on the last day of employment.

For involuntary separations and separations for cause, revoke ePHI access before the termination conversation occurs, or simultaneously with it. Do not wait until after the conversation. A terminated employee who retains EHR access for even an hour after a difficult termination conversation creates a significant risk of unauthorized PHI access.

## Section 1: ePHI System Access Revocation

Complete this section first. Work through every system the staff member had access to. Do not skip systems because you're uncertain whether the employee used them. If they had access, revoke it.

**EHR / Clinical System**
- [ ] Deactivate user account (do not delete — retain for audit log purposes)
- [ ] Confirm account is inactive by attempting login (should fail)
- [ ] Screenshot of inactive account status retained: [ ] Y
- Completed by: ____ Time: ____

**Billing System / Practice Management**
- [ ] Deactivate user account
- [ ] Confirm deactivation
- Completed by: ____ Time: ____

**Patient Portal (Admin access)**
- [ ] Remove admin access
- [ ] Confirm removal
- Completed by: ____ Time: ____

**Secure Messaging / Communication Platform**
- [ ] Deactivate account or remove from PHI-accessible channels
- [ ] Archive conversation history per retention policy
- Completed by: ____ Time: ____

**Cloud Storage / Shared Drives**
- [ ] Revoke access to all folders containing PHI
- [ ] Transfer ownership of any PHI files the employee owned or maintained
- [ ] Check shared links the employee created — disable any that expose PHI
- Completed by: ____ Time: ____

**VPN / Remote Access**
- [ ] Revoke VPN credentials or certificate
- [ ] Remove device from authorized device list
- [ ] Confirm VPN login fails with former credentials
- Completed by: ____ Time: ____

**Clinic Email Account**
- [ ] Change email password (or disable login without disabling the mailbox)
- [ ] Disable any automatic forwarding rules to external addresses
- [ ] Review inbox rules for any redirection, deletion, or exfiltration patterns
- [ ] Set an out-of-office message directing senders to the appropriate contact
- [ ] Determine mailbox retention period per your policy — do not delete the mailbox immediately
- Completed by: ____ Time: ____

**Other systems (list each):**
- System: ____  Access revoked: [ ] Y [ ] N  Time: ____
- System: ____  Access revoked: [ ] Y [ ] N  Time: ____
- System: ____  Access revoked: [ ] Y [ ] N  Time: ____

**Shared account credential rotation:**
If any shared accounts exist that the employee knew the password to, rotate those credentials now. Note: shared accounts violate HIPAA's access control requirement (§164.312(a)(2)(i)) and should not exist — but if they do, change the passwords immediately.
- [ ] Shared account(s) identified: ____
- [ ] Credentials rotated: [ ] Y  Date: ____

## Section 2: Physical Access

Physical access to areas where PHI is stored or accessed must be revoked on the same day.

**Keys and key fobs:**
- [ ] Front door / clinic key returned: [ ] Y / [ ] Not applicable
- [ ] Records storage key returned: [ ] Y / [ ] Not applicable
- [ ] Server room / IT closet key returned: [ ] Y / [ ] Not applicable
- [ ] Medication room key returned: [ ] Y / [ ] Not applicable
- [ ] Other: ____ returned: [ ] Y

If keys cannot be retrieved (employee unavailable or refuses return):
- [ ] Rekeying ordered for affected locks
- [ ] Timeline for rekeying: ____

**Access badges and keycards:**
- [ ] Building access badge returned / deactivated: [ ] Y / [ ] N / [ ] Not applicable
- [ ] Parking access removed: [ ] Y / [ ] Not applicable

**Alarm codes / safe combinations:**
- [ ] Alarm code changed: [ ] Y / [ ] Not applicable
- [ ] Safe combination changed (if employee had access): [ ] Y / [ ] Not applicable

## Section 3: Device Return and Data Wipe

**Clinic-issued devices:**
For each device issued to the employee, confirm return and document device disposition.

| Device | Serial number | Returned | Condition | Wipe method | Wipe date | Wipe verified by |
|---|---|---|---|---|---|---|
| Laptop | | [ ] Y [ ] N | | | | |
| Phone | | [ ] Y [ ] N | | | | |
| Tablet | | [ ] Y [ ] N | | | | |
| USB/token | | [ ] Y [ ] N | | | | |
| Other | | [ ] Y [ ] N | | | | |

**Personal devices used for clinic PHI:**
If the employee used a personal device for work — including checking clinic email, accessing the EHR, or receiving PHI via text — obtain signed attestation that all clinic data has been removed.

- [ ] Employee confirms use of personal device for PHI: [ ] Y [ ] N [ ] Unknown
- [ ] Employee attestation obtained: [ ] Y / [ ] Not applicable

If the employee refuses to cooperate with personal device review and you have reason to believe PHI is on the device, consult legal counsel before the situation escalates.

## Section 4: Exit Interview and Final Attestation

**Exit interview (conduct before the employee leaves):**
- [ ] Ongoing confidentiality obligations explained — confidentiality obligations survive employment
- [ ] No PHI may be retained by the employee in any form after separation
- [ ] Reporting channel explained — if the employee later realizes they retained clinic data, here is who to contact: ____
- [ ] Employee given a copy of the clinic's confidentiality/non-disclosure agreement or a reminder of its terms

**Final attestation:**

Have the employee sign the following attestation before leaving the premises. A refusal to sign should be noted in the employee's file.

---

**HIPAA Separation Attestation**

I, ____________________, acknowledge that as of [date], my employment or workforce arrangement with [Clinic Name] has ended. I confirm the following:

1. I have returned all clinic property including keys, access badges, clinic-issued devices, and any physical records or documents.
2. I have not retained copies of any Protected Health Information (PHI) accessed during my employment, in any form — electronic, paper, or otherwise.
3. I have not transmitted any clinic PHI to personal email accounts, personal cloud storage, personal devices, or any external party.
4. I understand that my confidentiality obligations with respect to PHI continue after the end of my employment and are not limited to the period of active employment.
5. I understand that unauthorized retention, use, or disclosure of PHI may result in civil and criminal penalties under HIPAA and applicable state law.
6. If I later discover that I inadvertently retained any clinic data, I will notify [Privacy Officer Name] at [contact information] without delay.

Signature: ____________________  Date: ____________________  
Witnessed by: ____________________

---

**If employee is unavailable to sign** (e.g., involuntary separation where cooperation is not possible): Note the attempt and the circumstances in the offboarding file. The checklist itself is the primary evidence artifact; the attestation is supporting documentation.

## Section 5: Checklist Completion Sign-Off

**All access revoked:** [ ] Yes [ ] Partial (see open items below)
**All devices returned and wiped:** [ ] Yes [ ] Partial
**Physical access revoked:** [ ] Yes [ ] Partial
**Exit interview conducted:** [ ] Yes [ ] No (involuntary / unavailable)
**Final attestation signed:** [ ] Yes [ ] Not obtained (reason: ____)

**Open items requiring follow-up:**

| Item | Owner | Target completion date |
|---|---|---|
| | | |

**Completed by:** ____  **Date and time:** ____  
**Reviewed by (Privacy Officer):** ____  **Date:** ____

**File location for this completed checklist:** ____

## The Delay Pattern That Appears in OCR Investigations

OCR resolution agreements involving small clinics with access revocation failures share a common fact pattern: the separation was known in advance, the clinic had a policy requiring access revocation, and the revocation still didn't happen on the day of separation.

The cause is usually that access revocation had no named owner, no concrete list of systems, and no deadline. It was a shared awareness, not an assignment.

Assigning this checklist to a named owner, completing it before the staff member's last shift ends, and signing off before the employee leaves the building converts policy into practice.

## What PHIGuard Changes

PHIGuard triggers an offboarding task automatically when a workforce member's status is changed in the system. The offboarding checklist becomes a tracked workflow with system-by-system checkboxes, a completion timestamp for each step, and a final sign-off by the Privacy Officer. The completed checklist lives in the workforce member's compliance record. When an access review the following quarter compares active system accounts against the current roster, the prior offboarding record is already there.
