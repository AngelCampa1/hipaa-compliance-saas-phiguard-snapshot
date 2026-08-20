---
title: "Risk Analysis Frequency and Triggers"
description: "HIPAA requires ongoing risk analysis — not a one-time assessment. This article explains what triggers a risk analysis review, the difference between a full refresh and a risk register update, and what the documentation must contain."
metaDescription: "HIPAA risk analysis frequency: how often small clinics need to redo or update their risk analysis and what operational changes trigger a required review."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: risk-analysis
schemaType: article
intent: awareness
summary: "HIPAA's Security Rule does not specify how often a risk analysis must be repeated, but it must be reviewed and updated to reflect changes in the operating environment. Annual review plus event-triggered updates is the standard practice. The most common gap: a risk analysis done once at startup and never revisited."
keyTakeaways:
  - "The HIPAA Security Rule (45 CFR § 164.308(a)(1)) requires an 'accurate and thorough' risk analysis — not a one-time assessment but an ongoing evaluation."
  - "A risk analysis must be updated when the clinic's operating environment materially changes: new systems, new vendors, new locations, organizational changes, or security incidents."
  - "Annual review is the baseline — even without a triggering event, the risk register and analysis should be refreshed annually."
  - "The difference between a full risk analysis and a risk register review: a full analysis covers all ePHI systems comprehensively; a register review checks whether identified risks changed and whether new risks emerged."
  - "The absence of a current risk analysis is the most consistently cited finding in OCR enforcement actions — it appears in nearly every resolution agreement."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-evidence-binder-checklist
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.308(a)(1) — Risk Analysis and Risk Management"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "HHS Guidance on Risk Analysis"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html"
    publisher: "HHS"
  - title: "NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments"
    url: "https://csrc.nist.gov/publications/detail/sp/800-30/rev-1/final"
    publisher: "NIST"
  - title: "NIST SP 800-66 Rev. 2 — Implementing the HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "Does HIPAA specify how often the risk analysis must be repeated?"
    a: "No. HIPAA requires an 'accurate and thorough' risk analysis that reflects the actual state of the covered entity's ePHI environment. This means it must be updated when the environment changes. OCR and NIST guidance treat annual review as a baseline minimum, with more frequent updates when triggered by specific changes."
  - q: "If we just added a new EHR, do we need to redo the entire risk analysis?"
    a: "You need to add the new EHR to the risk analysis. Whether this requires a full redo or an update depends on how comprehensively the original analysis was structured. A well-structured risk analysis built as a living document can be updated section-by-section when new systems are added."
  - q: "Our risk analysis is three years old and we haven't added any major systems. Is it still valid?"
    a: "Possibly not. Even without major new systems, the threat landscape changes, vendor security postures evolve, and staff roles may have shifted. A three-year-old analysis should be reviewed to confirm its assessments still reflect current reality. A fresh review — not necessarily a complete redo — is warranted."
  - q: "What is a risk register?"
    a: "A risk register is a structured record of identified risks: what the risk is, what threat and vulnerability it combines, the likelihood and impact rating, the current control status, and the remediation plan and timeline. It is a living document derived from the risk analysis that tracks progress on risk management over time."
---

Small clinics often complete an initial HIPAA risk analysis and consider the obligation satisfied. It is not. The HIPAA Security Rule requires covered entities to maintain an accurate and thorough assessment of potential risks and vulnerabilities to the confidentiality, integrity, and availability of their electronic PHI. "Accurate and thorough" means current. A risk analysis from four years ago describing a different technology environment does not describe today's environment — it describes a clinic that no longer exists.

## What the Regulation Actually Says

45 CFR § 164.308(a)(1)(ii)(A) requires covered entities to:

> "Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information held by the covered entity."

The regulation does not specify a frequency, but HHS guidance treats the requirement as ongoing — it must reflect the current state of the covered entity's ePHI systems, not a snapshot from implementation day.

## When a Review Is Required: Specific Triggers

Certain events require the risk analysis to be reviewed and updated:

### New PHI-Containing Systems

Any time the clinic adds or significantly upgrades a system that stores, processes, or transmits ePHI, that system must be incorporated into the risk analysis. Adding a new EHR module, switching scheduling platforms, or deploying a patient portal all require risk analysis updates.

**AI tools** require immediate attention: if an EHR vendor adds an AI dictation or coding feature, that feature processes ePHI through a new mechanism. The risk profile of that AI component — third-party data handling, model training practices, subprocessor BAAs — must be assessed before the feature goes live.

### New Vendors With PHI Access

A new business associate relationship brings a new PHI exposure surface. The vendor's security posture, data handling practices, subprocessors, and breach history are risk factors. The risk analysis should reflect the addition of significant new vendor relationships.

### Physical Location Changes

Moving to a new office, opening a satellite location, or adding a remote work program all change the physical and network environment in which ePHI is stored and accessed. Physical safeguards at the new location must be assessed; network security at the new location must be evaluated.

### Security Incidents

When a security incident occurs, it reveals a specific gap in the clinic's control environment. A misdirected fax points to a fax governance problem. A credential compromise points to an access control weakness. A successful phishing attack points to a training gap. Each incident should trigger an update to the risk analysis addressing the vulnerability it exposed.

### Significant Organizational Changes

A new practice owner, a change in the Privacy Officer role, an acquisition, or a major workforce restructuring may change who is responsible for compliance, what systems the clinic uses, and how PHI flows through operations.

### Regulatory Changes

Major changes in HIPAA regulations, HHS guidance, or state law may change what the covered entity is required to implement. The risk analysis should be reviewed when regulatory requirements change.

## Annual Review as the Baseline

Even without a triggering event, the risk analysis should be reviewed at minimum annually. An annual review asks: Is the ePHI system inventory current? Do the identified threats still reflect what the clinic actually faces? Have any vulnerability assessments changed? Has the risk management plan been implemented as written?

An annual review does not have to be a complete redo. It is a check of the existing analysis to confirm currency and update what has changed.

## Full Risk Analysis vs. Risk Register Review

Understanding the difference helps clinics manage the ongoing obligation efficiently:

### Full Risk Analysis

A full risk analysis is comprehensive. It:

1. Inventories all ePHI: what it is, where it lives, who has access
2. Identifies threats, both internal (workforce errors, insider threats) and external (ransomware, vendor breaches, natural disasters)
3. Identifies current vulnerabilities: weaknesses in controls that a threat could exploit
4. Assesses likelihood and impact of each threat/vulnerability combination
5. Prioritizes risks for remediation
6. Produces a written risk management plan

A full analysis is appropriate for:
- Initial compliance program setup
- After a significant incident that revealed broad control gaps
- After major technology changes affecting the entire ePHI environment
- When the previous analysis is several years old and substantially outdated

### Risk Register Review

A risk register review starts from an existing, current risk analysis and asks:

- Have any identified risks changed in likelihood or impact?
- Have remediation actions been implemented as planned?
- Are there new risks that weren't present at the last analysis?
- Do the previously identified risks still represent the most significant current exposures?

A risk register review is faster and is appropriate for:
- Annual review when no major changes have occurred
- Post-incident review when a specific control gap was identified
- Quarterly review of remediation plan progress

## What the Documentation Must Contain

Whether performing a full analysis or a register review, the documentation must be written and must include:

| Component | Required |
|---|---|
| Scope: what ePHI systems are covered | Yes |
| Identified threats (specific, not generic) | Yes |
| Identified vulnerabilities for each threat | Yes |
| Likelihood and impact ratings | Yes |
| Risk priority determination | Yes |
| Current control assessment | Yes |
| Risk management plan with owner and timeline | Yes |
| Date of analysis and reviewer identification | Yes |

Vague documentation ("we evaluated our systems and found no major risks") is not an adequate risk analysis. OCR's guidance, reinforced by NIST SP 800-30, requires specificity: named threats, named vulnerabilities, specific likelihood and impact ratings, and a concrete management plan with assigned owners and timelines.

## The Most Common Gap

The most frequently cited risk analysis failure in small clinics is not a flawed analysis. It is the absence of any analysis at all.

Clinics that opened years ago and never completed a documented risk analysis — or that completed one during EHR implementation and never touched it again — are operating without a valid risk analysis. This gap appears in OCR resolution agreements with striking consistency.

If the clinic has not done a risk analysis recently: complete a documented analysis now, build a risk register from it, assign owners and timelines to each management action, and set an annual review date. An outdated analysis that gets updated is far more defensible than no analysis at all.
