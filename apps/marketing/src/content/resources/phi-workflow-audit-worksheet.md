---
title: "PHI Workflow Audit Worksheet"
headline: "Map where PHI actually flows in your clinic — and identify which workflows need safeguards you haven't implemented"
description: "A structured 5-workflow PHI audit worksheet for small medical clinics, identifying the systems involved, PHI fields transmitted, who has access, current safeguards, and gaps requiring remediation."
metaDescription: "Free PHI workflow audit worksheet for small clinics. Map PHI flows across 5 workflows, identify access gaps, and document safeguards for your risk analysis."
magnetSlug: "phi-workflow-audit-worksheet"
summary: "A structured audit grid for mapping PHI workflows at a small clinic — who handles PHI, in which systems, what fields are transmitted, who has access, what safeguards exist, and what gaps remain. Designed to feed directly into a HIPAA risk analysis and vendor management review."
stage: "awareness"
sequenceStage: "awareness"
bullets:
  - "5-workflow audit grid: name each workflow, identify systems involved, list PHI fields, document who has access, note current safeguards, and flag gaps"
  - "Pre-populated with the highest-volume PHI workflows in a typical small clinic: scheduling, clinical documentation, billing, patient communication, and referrals"
  - "Shared-inbox and spreadsheet detection section — the two patterns most clinics find during a first audit"
  - "Gap-to-task conversion: how to turn audit findings into assigned compliance tasks"
  - "Risk analysis linkage: how this worksheet feeds into your annual HIPAA Security Rule risk analysis"
faq:
  - q: "Who should own the phi workflow audit worksheet?"
    a: "The privacy officer, security officer, or practice administrator should own the phi workflow audit worksheet, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "HHS Risk Analysis Guidance"
    url: "https://www.ecfr.gov/current/title-45/section-164.308"
    publisher: "HHS"
  - title: "45 CFR § 164.308(a)(1) — Security Management Process"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/phi-workflows/handle-shared-inboxes-phi"
verificationDate: "2026-04-26"
---

## Why PHI Audits Catch What Risk Analyses Miss

A HIPAA risk analysis identifies threats and vulnerabilities to your ePHI systems. A PHI workflow audit answers a more basic question: where does PHI actually go in your clinic on a typical Tuesday?

Most small clinics find PHI in places they hadn't included in their security assessment when they conduct a first workflow audit. The most common discoveries:

- A shared Gmail or general inbox that patient appointment requests go to, where multiple staff members have access and no access controls are in place
- An Excel spreadsheet on a shared drive that was created "just for tracking" a few years ago and now contains 400 rows of patient names, DOBs, and service dates
- A text message chain where providers send clinical photos or patient information for quick care coordination
- A fax inbox that receives incoming referrals and lab results but isn't included in anyone's system access review
- A scheduling system that sends automated reminder texts containing patient names and appointment details through a non-BAA-covered communication platform

Use this worksheet to map PHI across your highest-volume workflows before completing a risk analysis, selecting new software, or reviewing vendor agreements.

## How to Use This Worksheet

Start with the five pre-populated workflow rows. For each workflow, answer the six columns as accurately as possible — not as you wish the workflow worked, but as it actually operates today.

Then add any additional workflows specific to your clinic in the blank rows.

The "Gaps / Findings" column matters most. Note anything that concerns you during the audit: an unencrypted transmission, an unclear access situation, a system that might lack a BAA, or a manual process that creates unnecessary PHI exposure.

After completing the audit, convert each finding into a task with an owner and a deadline using the gap-to-task section at the end.

## The PHI Workflow Audit Grid

**Column key:**
- **Workflow name:** A plain-language name for the workflow ("patient scheduling," "lab result delivery")
- **Systems involved:** Every system, platform, application, or medium that PHI passes through in this workflow
- **PHI fields transmitted:** What categories of PHI are involved (name, DOB, diagnosis, medication, SSN, insurance)
- **Who has access:** Roles or named individuals with access to PHI in this workflow
- **Current safeguards:** Encryption, access controls, BAA coverage, audit logging, or other protections in place
- **Gaps / Findings:** Anything missing, unclear, or concerning about this workflow

---

### Workflow 1: Patient Scheduling and Appointment Management

| Column | Your clinic's current state |
|---|---|
| Systems involved | EHR scheduling module Online scheduling platform Phone with paper scheduling log |
| PHI fields | Patient name, phone number, DOB, provider name, reason for visit, insurance ID |
| Who has access | Front desk staff All staff who log into the EHR External scheduling vendor |
| Current safeguards | Is the scheduling system encrypted Does it have a BAA Is access login-specific per user |
| Gaps / Findings | |

**Common findings in this workflow:**
- A third-party online scheduling widget embedded in the website that collects patient name, contact, and reason for visit without a BAA in place
- Appointment reminder texts or emails sent through a platform without a BAA
- Paper scheduling log that is left visible at the front desk

---

### Workflow 2: Clinical Documentation and Chart Access

| Column | Your clinic's current state |
|---|---|
| Systems involved | EHR, dictation software, voice transcription service, mobile documentation apps |
| PHI fields | Full patient record: demographics, diagnosis codes, clinical notes, medication lists, lab results, imaging reports |
| Who has access | All clinical staff All EHR users Any vendor with EHR integration |
| Current safeguards | EHR access controls (role-based) Audit logging active BAAs with all EHR integrations MFA on EHR login |
| Gaps / Findings | |

**Common findings in this workflow:**
- Dictation or voice transcription services used without a BAA assessment
- Mobile documentation apps on personal phones without mobile device management (MDM)
- "View all patients" access granted to staff who only need access to their assigned patient panel
- EHR integrations added without BAA review (lab result feeds, e-prescribing connections, imaging integrations)

---

### Workflow 3: Billing and Insurance Processing

| Column | Your clinic's current state |
|---|---|
| Systems involved | Billing software, clearinghouse, payer portals, ERA/EOB delivery system |
| PHI fields | Patient name, DOB, insurance ID, diagnosis codes, procedure codes, service dates, payment amounts |
| Who has access | Billing staff Practice administrator Outsourced billing service |
| Current safeguards | BAA with billing software vendor BAA with clearinghouse Outsourced billing covered under BA agreement |
| Gaps / Findings | |

**Common findings in this workflow:**
- Outsourced billing service operating without a signed BAA
- Patient billing statements emailed through a non-BAA-covered email platform
- ERA/EOB files received and stored on an unencrypted shared drive
- Billing staff have access to full clinical records rather than minimum necessary billing data

---

### Workflow 4: Patient Communication (Appointment Reminders, Portal Messages, Secure Email)

| Column | Your clinic's current state |
|---|---|
| Systems involved | Patient portal, secure messaging platform, email system, text messaging service, phone system |
| PHI fields | Patient name, appointment details, clinical instructions, test results, account information |
| Who has access | Front desk for outbound messages Clinical staff for portal responses All staff who check the general inbox |
| Current safeguards | Is the email platform HIPAA-covered with a BAA Is the patient portal encrypted Is the text messaging platform BAA-covered |
| Gaps / Findings | |

**Common findings in this workflow:**
- A shared general inbox (e.g., info@clinic.com) receiving patient questions with PHI, accessible to all staff with no access controls
- Patient messages replied to from a personal email account by a provider
- Text messages with appointment details and clinical instructions sent through the clinic's unprotected business phone line
- No documented policy on which communication channels staff are authorized to use for patient communication

---

### Workflow 5: Referral Coordination and Care Team Communication

| Column | Your clinic's current state |
|---|---|
| Systems involved | Fax machine, secure messaging, referral management platform, direct messaging via EHR |
| PHI fields | Patient demographics, reason for referral, clinical summary, insurance information, diagnostic results |
| Who has access | Referral coordinator Clinical staff Receiving provider's office |
| Current safeguards | Is fax used (PHI in transit concern.) Is referral platform BAA-covered Are outgoing referrals logged |
| Gaps / Findings | |

**Common findings in this workflow:**
- Referrals sent by fax to numbers that aren't verified before sending
- No log of outgoing referrals — if a fax goes to the wrong number, you can't reconstruct what happened
- Referral information shared via unprotected email or text
- No policy on how to handle a misdirected referral when it's discovered

---

### Additional Workflows (add as needed)

| Workflow name | Systems involved | PHI fields | Who has access | Current safeguards | Gaps / Findings |
|---|---|---|---|---|---|
| Lab result delivery | | | | | |
| Medical records release | | | | | |
| Clinical photography | | | | | |
| Telehealth sessions | | | | | |
| Other: ____ | | | | | |

---

## Shared-Inbox and Spreadsheet Detection

These two PHI patterns appear in the majority of first-time clinic workflow audits. Check explicitly for each:

**Shared inboxes:**
- Does your clinic have a general email address (info@, contact@, admin@) that receives patient messages?
- Who has access to that inbox?
- What platform is it on Does that platform have a BAA with your clinic?
- Is access to the inbox shared login (everyone uses the same password) or individual login (each person has their own access)?

**PHI in spreadsheets:**
- Are there any spreadsheets on shared drives, desktops, or in email that contain patient names, DOBs, or clinical information?
- Who created them What were they originally created for?
- Are they still actively used, or are they stale data that was never cleaned up?
- Where are they stored Is that storage encrypted and access-controlled?

If you answer "yes" to any of these questions, add those workflows to the audit grid and complete the six columns.

## Gap-to-Task Conversion

For each finding in the audit grid, create one task:

| Finding | Workflow | Risk level | Owner | Corrective action | Target date |
|---|---|---|---|---|---|
| | | [ ] High [ ] Medium [ ] Low | | | |
| | | [ ] High [ ] Medium [ ] Low | | | |
| | | [ ] High [ ] Medium [ ] Low | | | |

**Risk level guidance:**
- **High:** PHI is transmitted or stored without encryption, without a BAA, or accessible to unauthorized parties
- **Medium:** PHI access is broader than minimum necessary, controls are incomplete, or safeguards exist but aren't documented
- **Low:** Process gap that creates audit documentation risk but doesn't expose PHI to unauthorized access

## How This Feeds Into Your Risk Analysis

The HIPAA Security Rule's risk analysis requirement (45 CFR §164.308(a)(1)(ii)(A)) requires an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI held by the covered entity.

The workflow audit identifies where ePHI flows. The risk analysis assesses the threats to that ePHI and the probability and impact of those threats. The workflow audit is the input; the risk analysis is the output.

A risk analysis conducted without first mapping PHI workflows misses the informal and manual workflows — the shared inbox, the Excel spreadsheet, the text message chain — because those don't appear in the formal system inventory. The audit makes them visible.

## What PHIGuard Changes

PHIGuard's workflow documentation feature captures PHI workflow records directly in the compliance platform, not in a worksheet that lives in a folder. Audit findings convert directly to tasks. Risk levels are tracked and updated as remediation progresses. The completed workflow audit becomes a document in your compliance record rather than an artifact that gets lost between annual reviews.
