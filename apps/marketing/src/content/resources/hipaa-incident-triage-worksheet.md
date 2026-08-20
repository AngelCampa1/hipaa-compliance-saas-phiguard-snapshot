---
title: "HIPAA Incident Triage Worksheet"
headline: "A structured intake and triage form for every suspected HIPAA incident — from the first report through breach determination"
description: "A three-part HIPAA incident triage worksheet covering initial facts intake, 4-factor risk assessment, escalation decision tree, and evidence log for small medical clinics."
metaDescription: "Free HIPAA incident triage worksheet for medical clinics. Covers initial intake, 4-factor breach risk assessment, escalation, and evidence documentation."
magnetSlug: "hipaa-incident-triage-worksheet"
summary: "A complete incident triage package: an initial facts intake form, a 4-factor risk assessment table following HHS guidance, an escalation decision tree, and an evidence log template. Gives small clinics a repeatable process for handling suspected incidents from first report through final determination."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Initial incident intake form — who reported it, when, what happened, what PHI was involved, immediate steps taken"
  - "4-factor breach risk assessment table based on 45 CFR § 164.402 — nature of PHI, likelihood of identification, unauthorized recipient, and extent of mitigation"
  - "Escalation decision tree — when to involve legal counsel, when to notify HHS, when to notify affected individuals"
  - "Evidence log template — document every step taken from first report through resolution"
  - "Breach determination memo template — the documented rationale for your final breach/no-breach conclusion"
faq:
  - q: "Who should own the incident triage worksheet?"
    a: "The privacy officer, security officer, or practice administrator should own the incident triage worksheet, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "HHS Guidance on Breach Notification"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.402 — Definition of Breach"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.402"
    publisher: "eCFR"
  - title: "45 CFR § 164.410 — Notification by Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.410"
    publisher: "eCFR"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/incident-response/triage-suspected-hipaa-incidents"
verificationDate: "2026-04-26"
---

## What This Worksheet Is For

When a staff member reports a possible HIPAA incident — a misdirected email, a lost device, unauthorized access to the EHR, a fax sent to the wrong number — the first five minutes of your response set the tone for everything that follows.

A structured triage worksheet captures the right information immediately, while the details are fresh and the evidence is intact. It also creates the audit trail that demonstrates your response was deliberate and compliant, not improvised after the fact.

This worksheet is based on HHS's 4-factor risk assessment framework under 45 CFR § 164.402, which provides the legal standard for determining whether an impermissible use or disclosure of PHI constitutes a reportable breach. A low probability of harm across all four factors means the incident may qualify as a non-breach, but that determination must be documented.

## Part 1: Initial Incident Intake Form

Complete this section as soon as the incident is reported. The goal is to capture facts, not to analyze them yet.

**Intake information:**
- Date and time of report: ____
- Reported by (name, role): ____
- Date and time incident occurred (if known): ____
- How the incident was discovered: ____

**What happened (describe in the reporter's own words):** ____

**PHI involved:**
- Type of PHI (names, diagnoses, dates of service, SSN, financial information, other): ____
- Number of individuals whose PHI may have been affected: ____
- Format of PHI (electronic, paper, verbal): ____

**Recipient of the PHI (if applicable):**
- Name or description of who received or accessed the PHI: ____
- Known relationship to the clinic (vendor with BAA, outside party, unknown): ____

**Immediate containment steps already taken:**
- Was access revoked / credentials changed (Y/N): ____
- Was the misdirected communication recalled or flagged (Y/N): ____
- Was the recipient notified of the error and asked to destroy/return (Y/N): ____
- Was the device wiped or locked (Y/N): ____
- Other steps: ____

**Reported to Security Officer on:** ____

## Part 2: 4-Factor Breach Risk Assessment

Under 45 CFR § 164.402, an impermissible use or disclosure of PHI is presumed to be a breach unless the covered entity demonstrates that there is a low probability that the PHI has been compromised based on a risk assessment of at least four factors. You must assess all four factors. Document your findings for each.

**Factor 1: The nature and extent of the PHI involved, including the types of identifiers and the likelihood of re-identification**

- What identifiers were present in the disclosed PHI (Names, DOBs, addresses, Social Security numbers, account numbers, diagnosis codes, treatment information, etc.)
- Was the PHI limited to demographic information, or did it include clinical or financial detail?
- Could the disclosed information be used to identify an individual if combined with other publicly available data?

Assessment: ____

Probability of harm (Low / Medium / High): ____

**Factor 2: The unauthorized person who used the PHI or to whom the disclosure was made**

- Who was the unauthorized recipient (Unknown third party, a vendor who has a BAA with you, another covered entity, the patient themselves)
- Does the recipient have their own HIPAA obligations that constrain how they could use the information?
- Is the recipient known to your clinic and unlikely to misuse the information?
- Is the recipient unknown or potentially adversarial?

Assessment: ____

Probability of harm (Low / Medium / High): ____

**Factor 3: Whether the PHI was actually acquired or viewed**

- Was there evidence that the PHI was opened, read, or accessed (Email read receipts, login logs, confirmation from the recipient)
- Was the PHI returned or destroyed without evidence of review?
- Was the PHI in a container that was lost, or was the content itself exposed?
- Can you confirm through technical means (e.g., access logs) whether access occurred?

Assessment: ____

Probability of harm (Low / Medium / High): ____

**Factor 4: The extent to which the risk to the PHI has been mitigated**

- Were mitigation steps taken immediately (Recall of communication, device wipe, notification to recipient, re-encryption)
- Did the recipient cooperate and provide attestation that the PHI was not accessed or was destroyed?
- Are there remaining risks that mitigation did not address?

Assessment: ____

Probability of harm (Low / Medium / High): ____

**Overall risk assessment:**

Based on the four-factor assessment above, does the evidence demonstrate a low probability that the PHI has been compromised (This requires low or adequately mitigated findings on all four factors.)

Overall determination: [ ] Low probability of compromise — breach exception may apply [ ] Moderate or high probability of compromise — breach notification required

**Documented by:** ____  **Date:** ____

## Part 3: Escalation Decision Tree

Use this decision tree to determine what happens next after the risk assessment is complete.

**If the incident involves PHI from a Business Associate (they disclosed PHI and reported it to you):**
→ The BA must notify you without unreasonable delay and no later than 60 days after discovery (45 CFR § 164.410)
→ Your notification obligations start from the date the BA reports to you (if you are the covered entity)
→ Request a written incident report and risk assessment from the BA

**If the risk assessment concludes low probability of compromise:**
→ Document the determination in writing (use the breach determination memo template in Part 4)
→ Retain the documentation for six years from the determination date
→ No individual or HHS notification required for this incident
→ Log the incident in the sanctions/incident log as a non-breach security event

**If the risk assessment concludes breach:**
→ Notify affected individuals without unreasonable delay, no later than 60 days after discovery (45 CFR § 164.404)
→ If the breach affects 500 or more individuals in a state, notify prominent media outlets in that state (45 CFR § 164.406)
→ Notify HHS (45 CFR § 164.408):
  - ≥500 individuals: notify HHS immediately (within 60 days)
  - <500 individuals: log in the annual breach report, submit to HHS no later than March 1 of the following year
→ If the breach involves a Business Associate, determine whether the BA will handle notifications or whether you will

**When to involve legal counsel:**
→ If the breach affects 500 or more individuals in any state
→ If the breach involved a criminal act (theft, unauthorized access by a former employee)
→ If media notification may be required
→ If the root cause involves a vendor whose contract terms are in dispute
→ If you are uncertain about the breach determination after completing the 4-factor assessment

## Part 4: Evidence Log Template

Maintain a running log of every action taken from initial report through resolution. This is the document you would hand to OCR or legal counsel if the incident is investigated.

| Date/Time | Action taken | By whom | Notes |
|---|---|---|---|
| [Date] | Incident reported | [Name] | [How reported, what was described] |
| [Date] | Initial intake completed | [Privacy Officer] | [Intake form filed; location] |
| [Date] | Containment steps | [Name] | [Specific steps taken] |
| [Date] | 4-factor assessment completed | [Privacy Officer] | [Summary of findings] |
| [Date] | Breach determination | [Privacy Officer] | [Determination: breach / non-breach] |
| [Date] | Individual notification sent | [Name] | [Method, recipient count, date sent] |
| [Date] | HHS notification filed | [Privacy Officer] | [Date filed, method] |
| [Date] | Incident closed | [Privacy Officer] | [Resolution summary] |

## Breach Determination Memo Template

For non-breach determinations, prepare this memo and retain it in the incident file. For breach determinations, this memo documents the basis for the determination before notifications are sent.

---

**HIPAA Incident — Breach Determination Memorandum**

Date: ____  
Incident reference #: ____  
Privacy Officer: ____  

**Summary of incident:**  
[2-3 sentence description of what happened, when, and what PHI was involved]

**Risk assessment conducted on:** ____

**4-factor findings:**  
Factor 1 (Nature and extent of PHI): [Low/Medium/High] — [Brief rationale]  
Factor 2 (Unauthorized recipient): [Low/Medium/High] — [Brief rationale]  
Factor 3 (PHI accessed or viewed): [Low/Medium/High] — [Brief rationale]  
Factor 4 (Risk mitigation extent): [Low/Medium/High] — [Brief rationale]

**Determination:**  
[ ] Non-breach: Low probability of compromise demonstrated across all four factors. Documentation retained per §164.530(j). No notification required.  
[ ] Breach: Notification required. Notifications to be sent within 60 days of discovery date [date]. HHS notification [included in annual log / filed immediately].

**Supporting documentation retained:**  
- Completed intake form ____  
- Evidence log ____  
- [Other artifacts] ____

**Privacy Officer signature:** ____  **Date:** ____

---

## What PHIGuard Changes

PHIGuard's incident management module captures the intake form, 4-factor assessment, and determination memo in a structured workflow, not in a Word document stored in someone's email drafts. Every step is timestamped. The evidence log is automatic. The determination memo generates from the assessment data and the Privacy Officer's recorded rationale. When OCR asks for your incident records, you export them rather than reconstruct them.
