---
title: "HIPAA Access Review Checklist"
headline: "A system-by-system access review checklist to audit who has access to PHI — and remove what shouldn't be there"
description: "A quarterly HIPAA access review checklist for small medical clinics covering ePHI system access grants, excess access identification, termination verification, and access review documentation."
metaDescription: "Free HIPAA access review checklist for medical clinics. System-by-system review template with excess access log, termination check, and documentation guide."
magnetSlug: "hipaa-access-review-checklist"
summary: "A quarterly HIPAA access review checklist for small medical clinics covering ePHI system access grants, excess access identification, termination verification, and access review documentation. Small clinics can use it to document access review checklist, assign owners, set review dates, capture exceptions, and keep evidence aligned with HIPAA safeguards, minimum necessary expectations, vendor oversight, or patient-rights obligations reflected in the cited source material."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "System-by-system access table — list every PHI system and every user's current access level"
  - "Role comparison column — compare actual access to the minimum access the role requires"
  - "Excess access log — document what was found and what was removed, with timestamps"
  - "Termination check — verify no separated staff retain active access in any system"
  - "Signed access review summary — the artifact your Privacy Officer signs to close out each review"
faq:
  - q: "Who should own the access review checklist?"
    a: "The privacy officer, security officer, or practice administrator should own the access review checklist, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "45 CFR § 164.308(a)(3) — Workforce Security"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
  - title: "HIPAA Security Rule Guidance on Access Control"
    url: "https://www.ecfr.gov/current/title-45/section-164.312"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/workforce-training/access-by-role-front-desk-vs-clinical"
verificationDate: "2026-04-26"
---

## Why Access Reviews Are Required — and Often Skipped

Under 45 CFR §164.308(a)(3), covered entities must implement procedures for authorization and supervision of workforce members who work with ePHI, and procedures for terminating access. Under §164.308(a)(1)(ii)(D), covered entities must regularly review records of information system activity.

Together, these requirements create an obligation to periodically verify that access is appropriate, current, and limited to what each role actually needs.

Access reviews get skipped for a predictable reason: they require someone to pull a user list from each system, compare it against the current employee roster, and document what they find. Without a structured format, the task feels open-ended. With a structured checklist, it is a 2-3 hour quarterly exercise that produces a documented artifact.

Access drift — where access accumulates over time without cleanup, creating far more exposure than intended — is one of the most consistent findings in HIPAA breach investigations. The front-desk hire who moved into a billing role still has clinical note export access from the original assignment. The nurse practitioner who left 18 months ago still appears in the active user list. The "view all patients" permission granted temporarily for a coverage period was never revoked.

## Part 1: System Access Table

For each system that stores or processes ePHI, list every active user account. This table becomes the foundation of the review.

### How to pull your user list

For each system:
- Log in with administrator credentials
- Navigate to user management, user list, or active accounts
- Export or screen-capture the list of all active users and their permission levels
- Note the date the export was generated

**EHR / Clinical System**

| Username / User ID | Full name | Current role | Access level granted | Minimum access for role | Excess access (Y/N) |
|---|---|---|---|---|---|
| | | | | | |

**Billing System / Practice Management**

| Username / User ID | Full name | Current role | Access level granted | Minimum access for role | Excess access (Y/N) |
|---|---|---|---|---|---|
| | | | | | |

**Patient Portal (Admin side)**

| Username / User ID | Full name | Current role | Access level granted | Minimum access for role | Excess access (Y/N) |
|---|---|---|---|---|---|
| | | | | | |

**Secure Messaging / Communication Platform**

| Username / User ID | Full name | Current role | Access level granted | Minimum access for role | Excess access (Y/N) |
|---|---|---|---|---|---|
| | | | | | |

**Cloud Storage / Document Management**

| Username / User ID | Full name | Current role | Access level granted | Minimum access for role | Excess access (Y/N) |
|---|---|---|---|---|---|
| | | | | | |

**Other PHI-touching system: ____**

| Username / User ID | Full name | Current role | Access level granted | Minimum access for role | Excess access (Y/N) |
|---|---|---|---|---|---|
| | | | | | |

## Part 2: Termination Verification

This section compares the active user lists from Part 1 against your workforce roster. Every name appearing in a system's active user list should correspond to a current workforce member.

**Current workforce roster (as of review date):**

List all current employees, contractors, locums, and authorized staff members who should have ePHI access as of today. This is your comparison list.

**Termination check:**

For each system's user list from Part 1, compare against the current workforce roster:
- Does every active account belong to a current workforce member?
- Are there accounts for staff who have separated, transferred, or changed roles?
- Are there shared accounts or service accounts that should be reviewed?

| System | Former staff member / unrecognized account | Date access should have been revoked | Access still active | Immediate action |
|---|---|---|---|---|
| | | | | |

If any former staff member's access is still active, revoke it immediately before continuing the review. Document the revocation date and method.

## Part 3: Excess Access Log

For each user where excess access was identified in Part 1, document the specific excess access and the remediation action.

| Staff member | System | Excess access identified | Date identified | Action taken | Date remediated | Verified by |
|---|---|---|---|---|---|---|
| | | | | | | |

**Common excess access patterns to check:**
- Clinical staff with data export permissions they don't need for their role
- Billing staff with access to full clinical notes rather than encounter-level diagnosis/procedure codes
- Front desk staff with access to the full patient chart rather than demographics and scheduling
- Administrative accounts with user management permissions (should be limited to the Privacy Officer or IT administrator)
- Former role access that was never removed when the staff member's role changed
- Temporary coverage access that was never revoked after the coverage period ended

## Part 4: Role Reference Guide

Use this guide when comparing actual access against minimum necessary for each role. Adapt to your clinic's specific systems and job descriptions.

**Front Desk / Scheduling:**
- Minimum necessary: Patient demographics, insurance information, appointment schedule, basic billing status
- Not needed: Full clinical notes, diagnosis history, medication list, audit logs, data export, user management

**Medical Assistant / Clinical Support:**
- Minimum necessary: Patient chart for scheduled appointments (demographics, vitals, visit-specific notes, orders for their scope)
- Not needed: Full historical problem list for all patients, billing administrator functions, user management, bulk export

**Provider / Clinician:**
- Minimum necessary: Full chart access for patients under their care; read access to charts for coverage scenarios
- Not needed: Billing administrator functions, user management (except break-glass access that is logged)

**Billing / Revenue Cycle:**
- Minimum necessary: Patient demographics, insurance information, encounter codes (CPT/ICD), claim status, payment records
- Not needed: Full clinical narrative beyond codeable content, clinical note content, user management

**Practice Administrator / Privacy Officer:**
- Access level: Administrative — but break-glass access to clinical records should be logged and reviewed monthly
- Monitoring: Administrator access to all systems is appropriate, but that access should be audit-logged and reviewed

**Contractors and Locums:**
- Access should be time-limited to the engagement period and immediately revoked at engagement end
- Contractor access should match the minimum necessary for the specific services provided

## Part 5: Signed Access Review Summary

Complete this section when the review is finished. The signed summary is the artifact that closes out the quarterly review.

---

**HIPAA Access Review Summary**

Review quarter: [ ] Q1 (March) [ ] Q2 (June) [ ] Q3 (September) [ ] Q4 (December)

Review date: ____  
Reviewer: ____  
Systems reviewed: ____

**Findings summary:**

Total active accounts reviewed: ____  
Accounts belonging to former staff — identified and revoked: ____  
Accounts with excess access — remediated: ____  
No findings — clean access (Y/N): ____

**Termination check result:** [ ] All former staff access confirmed revoked [ ] Former staff access found and revoked during this review (see excess access log)

**Excess access remediation complete:** [ ] Yes [ ] Partial — remaining items tracked in excess access log

**Open items (access that could not be immediately remediated and requires follow-up):**

| Item | Reason not remediated | Owner | Target date |
|---|---|---|---|
| | | | |

**Reviewer signature:** ____  **Date:** ____  
**Privacy Officer signature:** ____  **Date:** ____

---

## Quarterly vs. Annual Review Cadence

The HIPAA Security Rule does not specify review frequency. It requires "periodic" reviews. Most compliance guidance and OCR investigation patterns support quarterly access reviews for organizations with active workforce turnover, which includes most clinics.

If quarterly reviews are not feasible, semi-annual reviews reduce the window during which former staff retain access or excess access persists undetected.

Annual access reviews create too long a window. If a staff member separates in January and the access review doesn't happen until November, former credentials stay active for up to 10 months. Quarterly reviews limit that window to roughly 90 days — still a meaningful exposure, but substantially better.

## What PHIGuard Changes

PHIGuard's access review module generates the system access table from integrated roster data, flags accounts that don't match current workforce records, and tracks remediation to completion. The signed review summary attaches to the review record automatically. When the next quarterly review is due, PHIGuard creates the task and reminds the owner, eliminating dependence on a manual calendar reminder.
