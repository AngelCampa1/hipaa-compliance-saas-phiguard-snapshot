---
title: "How to Build and Maintain a HIPAA Risk Register"
description: "A practical guide for small clinics on building and maintaining a HIPAA risk register — from identifying risks to prioritizing remediation and documenting the management plan."
metaDescription: "How to build a HIPAA risk register for a small clinic. Risk identification, probability-impact scoring, prioritization, and risk management plan documentation."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: risk-analysis
summary: "A HIPAA risk register is the output of the annual risk analysis — a documented list of identified threats and vulnerabilities with probability and impact scores, prioritization, and assigned remediation tasks. Small clinics that complete a risk analysis without building a corresponding risk register miss the step that turns risk identification into risk management."
keyTakeaways:
  - "The HIPAA Security Rule requires not just risk analysis but risk management — the risk register is the document that connects identified risks to assigned remediation actions"
  - "A risk register entry includes the threat, the vulnerability it exploits, the probability of occurrence, the impact if it occurs, a combined risk score, and the remediation action with an owner and deadline"
  - "Risk registers should be updated annually and whenever a significant environmental change occurs — a new system, new vendor, physical move, or staffing change"
  - "OCR investigators look for evidence that identified risks were not just documented but also managed — a risk analysis with no risk management plan is incomplete compliance"
  - "Small clinic risk registers can be simple — 10-20 entries is typical for a 5-15 staff practice with a standard EHR and billing system"
author: angel-campa
reviewer: phiguard-compliance-research
intent: consideration
relatedResource: hipaa-annual-review-calendar
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.308(a)(1) — Security Management Process"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
  - title: "HHS Risk Analysis Guidance"
    url: "https://www.ecfr.gov/current/title-45/section-164.308"
    publisher: "HHS"
  - title: "NIST SP 800-30 Guide for Conducting Risk Assessments"
    url: "https://csrc.nist.gov/publications/detail/sp/800-30/rev-1/final"
    publisher: "NIST"
---

The HIPAA Security Rule's risk analysis requirement (45 CFR §164.308(a)(1)(ii)(A)) requires covered entities to conduct an accurate and thorough assessment of potential risks and vulnerabilities to their ePHI. The risk management requirement (45 CFR §164.308(a)(1)(ii)(B)) requires implementing security measures sufficient to reduce those risks to a reasonable and appropriate level.

Together, these two requirements create a cycle: identify the risks (analysis), then address them (management). Most small clinics that attempt HIPAA compliance complete the first step, at least partially, and stop there.

The risk register bridges both. It is the output of the risk analysis organized in a format that feeds directly into the risk management plan.

## What a Risk Register Is

A risk register is a structured log of identified risks with:
- What the risk is (the threat and the vulnerability it exploits)
- How likely the risk is to occur (probability)
- How damaging it would be if it occurred (impact)
- A combined priority score
- The remediation action assigned to address the risk
- The owner of the remediation action
- The target completion date
- The status of remediation

The risk register bridges the gap between identifying risks and managing them. A risk analysis that produces a written report with no corresponding action plan is incomplete — and it shows in an OCR investigation.

## The Difference Between Threats, Vulnerabilities, and Risks

Understanding the terminology helps build a more accurate risk register.

**Threat:** A potential event or action that could negatively affect your ePHI. Examples: ransomware attack, unauthorized access by a former employee, accidental disclosure by a staff member, loss of a device containing PHI.

**Vulnerability:** A weakness in your system, processes, or controls that could allow a threat to occur. Examples: weak passwords, missing encryption, no MFA on EHR login, no offboarding checklist, shared login accounts.

**Risk:** The combination of a specific threat and the vulnerability it could exploit. "Ransomware attack (threat) + no encrypted off-site backup (vulnerability) = risk of permanent ePHI data loss from ransomware."

A risk register entry must be specific enough that a remediation action is obvious. "Cybersecurity risk" isn't actionable. "Ransomware via phishing email — no security awareness training, no MFA on EHR login, backup not encrypted or tested" gives you three concrete things to fix.

## Building the Risk Register: Step by Step

### Step 1: Map Your ePHI Systems

List every system that stores, processes, or transmits ePHI. For each system, note:
- What ePHI it contains (demographics, clinical records, billing data, etc.)
- Who has access
- How it's accessed (internal network, cloud, VPN, any device)
- Whether it's hosted by you or by a vendor

This inventory is the scope of your risk analysis. A risk you don't identify because you forgot to include a system is still a risk.

### Step 2: Identify Threats and Vulnerabilities

For each ePHI system, work through three threat categories:

**Technical threats:**
- Unauthorized access (by external attackers or internal staff)
- Malware, ransomware
- System outages and data loss
- Data corruption

**Administrative threats:**
- Staff accessing PHI without authorization or outside their role
- Inappropriate disclosure to a third party
- Lack of training leading to user error
- Vendor data handling failures

**Physical threats:**
- Theft or loss of devices containing ePHI
- Physical access to areas where PHI is stored
- Natural disaster affecting systems or records

For each threat, identify the specific vulnerabilities at your clinic that would allow it to materialize. "Encryption not enabled on clinic laptops" is a vulnerability. "Lack of technical controls" is not actionable.

### Step 3: Score Probability and Impact

Score each risk on two dimensions:

**Probability (likelihood of occurrence):** How likely is this risk to materialize in the next 12 months given your current controls?
- 1: Very unlikely — would require significant unusual circumstances
- 2: Unlikely — possible but not expected without specific triggering events
- 3: Possible — could occur in normal operations
- 4: Likely — has occurred before or occurs commonly in similar organizations
- 5: Almost certain — expected to occur in normal operations

**Impact (severity if it occurs):** How damaging would this risk be if it materialized?
- 1: Minimal — easily corrected, no patient harm, no significant compliance exposure
- 2: Minor — limited impact, correctable with reasonable effort, minor compliance findings
- 3: Moderate — significant impact to operations or patients, requires investigation and remediation, potential breach notification
- 4: Major — significant breach, likely regulatory action, substantial operational impact
- 5: Critical — catastrophic impact, large-scale breach, potential existential threat to the practice

**Combined risk score:** Multiply probability × impact (range: 1-25)

### Step 4: Prioritize

Sort risks by combined score. High-scoring risks (16-25) require immediate remediation planning. Medium risks (9-15) should be addressed within the year. Lower risks (1-8) should be monitored and addressed when resources allow.

### Step 5: Assign Remediation Actions

For each risk, document:
- The specific remediation action (not "improve security" — "enable MFA on EHR login for all user accounts by [date]")
- The owner (named person responsible for completion)
- The target completion date
- How completion will be verified (what's the evidence that the remediation happened)

## Sample Risk Register Entries

The following examples illustrate the format. Adapt these to your clinic's specific systems and circumstances.

| Risk # | Threat | Vulnerability | Probability | Impact | Score | Remediation action | Owner | Target date | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-001 | Ransomware via phishing email | No phishing training; no MFA on EHR | 4 | 4 | 16 | 1) Deliver annual phishing awareness training (Q1); 2) Enable MFA on EHR by [date] | Security Officer | [Q1] | In progress |
| R-002 | Unauthorized access by former employee | No formal offboarding checklist; credential revocation not verified | 3 | 3 | 9 | Implement offboarding checklist with same-day credential revocation verification | Privacy Officer | [30 days] | Not started |
| R-003 | PHI on unencrypted personal devices | Staff use personal phones for clinical communication; no MDM | 3 | 3 | 9 | 1) Update BYOD policy to prohibit clinical PHI on personal devices; 2) Implement MDM or prohibit BYOD | Security Officer | [60 days] | Not started |
| R-004 | Vendor data breach (billing clearinghouse) | BAA in place, but no verification of clearinghouse security posture | 2 | 4 | 8 | Complete vendor security assessment as part of annual BAA renewal | Privacy Officer | [Annual renewal] | Not started |
| R-005 | Physical theft of clinic laptop | Laptop not encrypted; no cable lock | 2 | 3 | 6 | Verify BitLocker/FileVault enabled on all laptops; procure cable locks | Security Officer | [30 days] | Not started |

## Maintaining the Register

The risk register is not a one-time document. It should be:

**Updated annually** as part of the formal risk analysis cycle. New risks discovered during the year are added; remediated risks are closed with a completion date and verification note.

**Updated when significant changes occur** — adding a new EHR module, switching billing vendors, moving to a new physical location, or bringing on a large cohort of new staff. Any of these introduces new threats and vulnerabilities the prior risk analysis didn't cover.

**Reviewed at the quarterly compliance meeting** — a brief review of open items, overdue remediations, and newly identified risks.

## The Risk Register as a Defense Document

When OCR requests documentation of your risk analysis, a well-maintained risk register demonstrates:
- You identified specific risks, not generic categories
- You assessed probability and impact with documented reasoning
- You assigned remediation actions to named owners with deadlines
- Remediations were completed (with completion dates and verification notes)
- You reviewed and updated the register annually and when circumstances changed

OCR expects to see that you identified risks and then managed them. A written report with no management plan only covers half the obligation. The risk register is how you demonstrate both.
