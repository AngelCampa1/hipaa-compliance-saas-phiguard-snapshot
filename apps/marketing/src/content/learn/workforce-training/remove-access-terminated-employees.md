---
title: "Remove Access for Terminated Employees"
description: "Delayed access removal after termination is a top HIPAA Security Rule finding. This guide covers what access to remove, how fast, and how to document the off-boarding for your audit trail."
metaDescription: "Remove EHR and system access for terminated employees: HIPAA requirements, off-boarding checklist, timelines, and audit trail documentation for small clinics."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: workforce-training
schemaType: article
intent: consideration
summary: "The HIPAA Security Rule requires workforce clearance procedures that include timely access removal when employment ends. The operational failure is not misunderstanding the requirement — it is not having a defined process to execute it. This guide covers what to revoke, how fast, and how to create the evidence trail."
keyTakeaways:
  - "45 CFR § 164.308(a)(3)(ii)(B) requires workforce clearance procedures, including timely access removal at termination."
  - "For involuntary terminations, access should be removed the same day — before or concurrent with the termination conversation."
  - "EHR credentials are the obvious item; email forwarding rules, shared passwords, and physical access are frequently missed."
  - "A signed, dated off-boarding checklist is the compliance evidence that access was removed and when."
  - "The clinic must identify, in advance, who has admin credentials to each system — the answer cannot be the departing employee."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: "hipaa-offboarding-checklist"
relatedCommercialPath: "/pricing"
sources:
  - title: "45 CFR § 164.308(a)(3) — Workforce Security"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "Electronic Code of Federal Regulations"
  - title: "OCR Enforcement and Resolution Agreements"
    url: "https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/agreements/index.html"
    publisher: "HHS Office for Civil Rights"
  - title: "NIST SP 800-66 Rev. 2 — Implementing HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "National Institute of Standards and Technology"
  - title: "HIPAA Security Rule Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS Office for Civil Rights"
faq:
  - q: "How quickly does HIPAA require access to be removed after termination?"
    a: "The regulation does not specify a number of hours or days. It requires that workforce clearance procedures be 'implemented.' HHS guidance and industry standard treat same-day removal for involuntary terminations as the baseline. For voluntary separations with advance notice, access should be removed no later than the final day of employment."
  - q: "What if we use shared logins on some systems?"
    a: "Shared credentials create two problems at termination: you cannot remove the departing employee's access without disrupting other users, and you cannot be certain the employee does not retain the credentials after departure. Shared logins are a separate Security Rule violation. The immediate step at termination is to change the shared password; the longer-term fix is eliminating shared credentials."
  - q: "Does a terminated employee's personal device need to be addressed?"
    a: "Yes, if the device was used to access clinic systems or PHI. Mobile device management (MDM) policies should include remote wipe capability for clinic-connected devices. If a personal device was used without MDM enrollment, assess whether any PHI was stored on it and treat it as a potential breach risk."
  - q: "Who is responsible for executing access removal?"
    a: "The clinic must designate a person — typically the practice administrator or IT administrator — who has admin credentials to every system that stores PHI. That person is responsible for executing access removal at termination. If no one currently holds admin credentials to a system, that is an access control gap to address before the next termination."
---

A former employee with active EHR credentials is not a theoretical risk. The HHS Office for Civil Rights has resolved enforcement actions involving former workforce members who accessed patient records after their employment ended — in some cases, records of patients they had never treated.

The HIPAA Security Rule requires workforce clearance procedures. It does not provide an operational playbook. That gap is where clinics fail.

## What the HIPAA Security Rule Requires

Under 45 CFR § 164.308(a)(3)(ii)(B), covered entities must implement a workforce clearance procedure. This procedure must ensure that each workforce member's access to ePHI is appropriate — and that access is revoked when it is no longer appropriate. Employment termination is the most unambiguous trigger for revocation.

The Security Rule does not specify a timeline. HHS guidance and enforcement activity establish same-day removal as the expected baseline for involuntary terminations. For voluntary separations with advance notice, access should be removed no later than the final working day. Delays beyond that, even by a few days, create a window of unauthorized access that, if exploited, constitutes a breach.

## Why This Matters Beyond the Checklist

A workforce member whose employment has ended is no longer authorized to access PHI. Any access after that point is unauthorized.

People who leave, particularly under difficult circumstances, sometimes access records out of curiosity, to gather information relevant to a dispute, or in retaliation. Intent does not change the clinic's obligation. The covered entity is responsible for preventing unauthorized access regardless of why it happened.

OCR enforcement actions have included penalties against covered entities where former employees accessed records after termination and the clinic could not demonstrate it had a systematic process for removing access promptly.

## What Access Needs to Be Removed

EHR credentials are the obvious item to revoke. The commonly missed items are what produce compliance gaps.

### Electronic Access

| System | What to Remove | Commonly Missed |
|--------|---------------|-----------------|
| EHR / Practice Management | Disable user account | Shared admin accounts the employee knew; any session tokens |
| Email | Disable account | Forwarding rules the employee may have set up to a personal address before departure |
| Scheduling System | Disable user account | If separate from EHR |
| Billing System | Disable user account | If separate from EHR |
| Microsoft 365 / Google Workspace | Disable account, revoke active sessions | Shared drives the employee had access to; calendar data |
| Fax / eFax Platform | Remove user | Often overlooked entirely |
| Telehealth Platform | Disable account | If the clinic uses a third-party telehealth system |
| Patient Portal Administration | Remove admin access | If applicable |
| Cloud Storage (Dropbox, SharePoint, etc.) | Remove user | Shared folders with PHI |
| VPN / Remote Access | Revoke credentials | — |

### Email Forwarding Rules

This item deserves specific attention. An employee who knows they are leaving — or who suspects termination — may configure a forwarding rule in their clinic email account that redirects incoming messages to a personal address. When the account is disabled, the forwarding rule may persist in the system configuration, continuing to route messages after the account appears to be locked. When disabling an email account, verify that no active forwarding rules are in place before closing it.

### Shared Passwords

Many small clinics use shared credentials on systems where the vendor does not support individual user accounts — certain fax platforms, some older practice management systems, shared printers with scan-to-email capability. When a workforce member who knew a shared password departs, the password should be changed as part of the off-boarding process. Document the change and communicate the new credential to remaining authorized users through a secure channel.

### Physical Access

| Access Type | Action Required |
|-------------|----------------|
| Building keys | Collect on or before final day |
| Key fobs / access cards | Deactivate in access control system |
| Alarm codes | Change code; communicate new code to remaining authorized staff |
| Safe combinations | Change if the departing employee had access |
| Parking access cards | Collect if applicable |

Physical access removal is often handled separately from IT access removal — and in some clinics, it falls through the cracks entirely because no one person is responsible for coordinating both. The off-boarding checklist should include both categories, and completion of both should be verified by a single responsible party.

## Timeline Standards

| Termination Type | Access Removal Timeline |
|-----------------|------------------------|
| Involuntary (immediate effect) | Same day — ideally before or concurrent with the termination conversation |
| Involuntary (with notice period) | Same day the decision is made, even if the employee works through a transition |
| Voluntary with advance notice | No later than end of final working day |
| Resignation without notice | Same day |
| End of contract / locum engagement | On or before the last scheduled day |

For involuntary terminations, allowing the employee to "finish the day" or "wrap up open items" before revoking access is not consistent with the Security Rule or with risk management practice. Revoke access at the time of the termination conversation. If the employee has open items that need to be handed off, a remaining team member should handle those handoffs, not the departing employee with live credentials.

## The Off-Boarding Checklist as a Compliance Tool

The off-boarding checklist is the compliance evidence that access was removed, who removed it, and when. Without a completed, dated checklist, the clinic cannot demonstrate to an auditor or investigator that it followed its own procedures.

The checklist should capture:

- Workforce member name and role
- Last day of employment
- Termination type (voluntary / involuntary)
- For each system: system name, access type, date removed, removed by
- Physical access items collected or deactivated (with dates)
- Confirmation that shared passwords were changed
- Confirmation that email forwarding rules were reviewed and cleared
- Signature of the person completing the off-boarding
- Date the checklist was completed

Store completed off-boarding checklists with the workforce member's personnel file. Retain for at least six years consistent with HIPAA record retention requirements.

## The Pre-Condition: Who Has Admin Access to Each System

The off-boarding procedure cannot be executed if no one currently employed has admin credentials to the systems that need to be updated.

This creates the most dangerous delays. A clinic uses an EHR where the original admin account was set up by the implementation vendor or by the departing employee. When that person leaves, no one else has credentials to disable the account.

The clinic needs to identify, for every system that stores or transmits PHI:

- Who currently holds admin credentials
- What account is used to provision and deprovision users
- What to do if the primary admin is unavailable

This information should be documented and maintained in a location that does not depend on any single individual's knowledge. If the only person who knows the admin credentials to a system is a workforce member who could terminate, that is a risk that should be resolved before the next termination event.

## Edge Case: The Departing Employee Is the Only Admin

This situation is more common in small clinics than it should be. The provider or practice manager who set up the EHR is the only person with admin credentials. When they leave, no one can disable their account because no one else can access the admin console.

If this situation is discovered during an off-boarding, the immediate step is to contact the system vendor and initiate an emergency account recovery process. Document the situation, the date it was discovered, the steps taken to recover admin access, and when the departing employee's account was ultimately disabled.

The longer-term fix is ensuring that every system has at least two people with admin credentials, and that one of them is a role-based account rather than a user account tied to a specific person.

## Connecting Off-Boarding to the Audit Log

When access is removed from systems that maintain audit logs, verify that the access removal is reflected in the log. For EHR systems, this typically means confirming that the user account shows as inactive and that no activity is recorded under that account after the termination date.

If your compliance program includes periodic audit log review, add a check for activity by recently terminated user accounts. Any activity by a disabled account after its termination date is an incident requiring assessment.

PHIGuard tracks access assignment and off-boarding task completion in an append-only audit log, so the evidence trail is created automatically rather than dependent on manual documentation. See [pricing](/pricing) for plan details.
