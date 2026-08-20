---
title: "Ransomware and HIPAA: When a Cyberattack Is Also a Breach"
seoTitle: "Ransomware as a HIPAA Breach"
description: "OCR's 2016 ransomware guidance established that a ransomware attack presumptively constitutes a HIPAA breach. Paying the ransom and restoring data does not end the matter. This article explains the four-factor test, notification obligations, and what small clinics must do after an attack."
metaDescription: "Ransomware and HIPAA breach: OCR's 2016 guidance says ransomware is presumptively a breach. Learn the four-factor test, notification timeline, and..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: incident-response
intent: awareness
schemaType: article
summary: "Most small clinics assume a ransomware attack is an IT problem that ends when the data is restored. Under OCR's 2016 guidance, it is also a HIPAA breach unless the covered entity can demonstrate through a four-factor risk assessment that PHI was not compromised. The compliance obligation runs independently of whether the ransom was paid."
keyTakeaways:
  - "OCR's 2016 ransomware guidance holds that ransomware infection presumptively constitutes a breach under the Breach Notification Rule."
  - "The presumption can be rebutted only by a documented four-factor risk assessment showing low probability of PHI compromise."
  - "Paying the ransom and restoring data does not eliminate the breach — the four-factor assessment must be completed regardless."
  - "If the assessment cannot rebut the presumption, notification obligations apply: individual notice within 60 days, OCR report for 500+ individuals."
  - "Prevention priorities for small clinics — backups, patching, MFA, and incident response planning — reduce both attack success and breach consequence."
sources:
  - title: "HIPAA Ransomware Guidance Fact Sheet"
    url: "https://www.hhs.gov/sites/default/files/RansomwareFactSheet.pdf"
    publisher: "HHS"
  - title: "45 CFR §164.402 — Definitions (Breach)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.402"
    publisher: "eCFR"
faq:
  - q: "Is a ransomware attack always a HIPAA breach?"
    a: "Under OCR's 2016 guidance, ransomware infection is presumptively a breach. The covered entity can rebut the presumption by demonstrating, through a documented four-factor risk assessment, that there is a low probability that PHI was compromised. If the assessment cannot establish that low probability, the breach notification obligations apply."
  - q: "What is the four-factor risk assessment for ransomware?"
    a: "The four factors are: (1) the nature and extent of PHI involved, including the types of identifiers and the likelihood of re-identification; (2) the unauthorized person who used or accessed the PHI; (3) whether PHI was actually acquired or viewed; and (4) the extent to which the risk to PHI has been mitigated. All four factors must be evaluated and documented."
  - q: "Does paying the ransom satisfy HIPAA breach notification requirements?"
    a: "No. Payment of the ransom does not eliminate the breach or the notification obligation. If the four-factor assessment cannot rebut the presumption that PHI was compromised, notification must occur even if all data was restored by paying the ransom. The attacker's access to the data — even if not confirmed to have been exploited — is the basis for the presumption."
  - q: "What is the notification deadline for a ransomware breach?"
    a: "If the breach affects 500 or more individuals in a state, the covered entity must notify affected individuals without unreasonable delay and no later than 60 calendar days after discovering the breach, and must notify OCR contemporaneously. For breaches affecting fewer than 500 individuals, OCR must be notified on an annual basis. Media notice in the affected state is required for 500+ individual breaches."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

When ransomware locks up a clinic's files, the immediate response is IT-focused: contain the spread, assess what was encrypted, determine whether a backup exists, and decide whether to pay the ransom or restore from backup. That response is necessary.

It is not sufficient.

In July 2016, the HHS Office for Civil Rights published specific guidance on ransomware and HIPAA. The central holding is one that most small clinics have not internalized: the presence of ransomware on systems that contain ePHI is presumptively a breach under the HIPAA Breach Notification Rule. The covered entity must complete a formal breach risk assessment. If that assessment cannot establish a low probability that PHI was compromised, notification obligations apply — regardless of whether data was actually exfiltrated, regardless of whether the ransom was paid, and regardless of whether all data was ultimately restored.

## The Legal Framework: What Constitutes a Breach

Under 45 CFR §164.402, a "breach" is the acquisition, access, use, or disclosure of PHI in a manner not permitted under the Privacy Rule that compromises the security or privacy of the PHI.

Ransomware involves the unauthorized access of ePHI-bearing systems by a threat actor. That unauthorized access satisfies the acquisition or access element of the breach definition. Whether PHI was actually exfiltrated to the attacker's servers is a separate question — and one that is often impossible to answer with certainty following a ransomware incident.

OCR's 2016 guidance recognized this uncertainty and reached the obvious conclusion: because covered entities usually cannot demonstrate that ransomware did not compromise PHI, the default should be that it did. The covered entity must prove the negative through documented analysis — not assume the affirmative.

The guidance also clarified that ransomware can introduce PHI compromise risk through multiple pathways: the encryption process itself may involve the threat actor's code reading and processing PHI, the attacker may have exfiltrated data before deploying the ransomware (double-extortion attacks, which have become more common), or persistent access may have given the attacker the ability to view or copy data before the encryption became visible.

## The Four-Factor Risk Assessment

To rebut the presumption that a ransomware attack constitutes a breach, a covered entity must conduct and document a risk assessment applying the four-factor analysis established in the Breach Notification Rule at 45 CFR §164.402.

**Factor 1: The nature and extent of the PHI involved, including the types of identifiers and likelihood of re-identification.**

What data was in scope? If the encrypted systems contained limited PHI — appointment scheduling data without clinical details — the potential harm from compromise is lower. If the systems contained full medical records including diagnoses, medication histories, and Social Security numbers, the potential harm is high and the risk assessment outcome is less likely to support a finding of low probability of compromise.

**Factor 2: The unauthorized person who used the PHI or to whom the disclosure was made.**

Can you identify who the attacker was, or the type of attacker? In most ransomware incidents, the identity of the attacker is unknown. An unknown attacker is generally presumed to have been motivated by financial gain and to have had the capability to access PHI on the compromised system. An unknown threat actor does not support a low-probability finding unless other evidence limits the plausibility of access.

**Factor 3: Whether the PHI was actually acquired or viewed.**

This is the factor where forensic evidence is most relevant. If your security monitoring and log analysis can demonstrate that the attacker's activity was limited to deploying encryption software and that there is no evidence of data being copied or transmitted outbound, this factor could support a low-probability finding. In practice, this requires forensic analysis of network traffic logs, endpoint detection data, and access logs — capabilities that many small clinics do not have internally.

Without forensic evidence, this factor cannot be resolved in the covered entity's favor based on assumption.

**Factor 4: The extent to which the risk to the PHI has been mitigated.**

Has the attacker's access been terminated? Have affected systems been remediated? Has the breach point been closed? Restoration of operations addresses the ongoing risk but does not retroactively eliminate the period of access.

All four factors must be documented. A cursory or undocumented analysis does not satisfy the requirement. If OCR investigates and requests the breach risk assessment, a vague description of what happened and a statement that "no data was taken" without supporting evidence is insufficient.

## What Must Happen After an Attack

**Step 1: Treat it as a security incident under 45 CFR §164.308(a)(6).** Every ransomware infection is a security incident — an event that involves the unauthorized access of ePHI. Your incident response procedure should be activated immediately. Document the timeline from discovery forward.

**Step 2: Conduct the four-factor breach risk assessment.** Begin this assessment in parallel with IT remediation. The 60-day notification clock runs from the date of discovery, not the date of remediation. Delaying the risk assessment while waiting for IT recovery is a documentation error that creates notification deadline risk.

**Step 3: Determine the outcome of the assessment.** Can you affirmatively document a low probability that PHI was compromised? If yes — supported by forensic evidence across all four factors — document the conclusion and retain the analysis. No notification is required if the assessment is complete, well-documented, and supportable.

If no — if the assessment cannot establish low probability — proceed to Step 4.

**Step 4: Implement breach notification.** Notification obligations under 45 CFR §164.404–§164.408:

- **Individual notice**: sent without unreasonable delay, no later than 60 calendar days after discovery, to each individual whose PHI was involved. Must be sent by first-class mail (or email if the individual has agreed to electronic notice). Must describe the breach, what PHI was involved, what the covered entity is doing, what individuals can do to protect themselves, and who to contact.

- **OCR notice**: for breaches affecting 500 or more individuals in a single state or jurisdiction, OCR must be notified contemporaneously with individual notice, no later than 60 days after discovery. For breaches affecting fewer than 500 individuals, OCR notification is submitted annually through the OCR reporting portal.

- **Media notice**: for breaches affecting 500 or more individuals in a state, the covered entity must notify prominent media outlets in that state, in addition to individual and OCR notice.

Paying the ransom does not affect these obligations. If the ransom is paid and all data is restored but the four-factor assessment cannot rebut the presumption, notification must occur.

## The Double-Extortion Problem

Ransomware attacks have evolved. Modern ransomware operations frequently exfiltrate data before deploying the encryption payload. The attacker threatens to publish the stolen data if the ransom is not paid — hence "double extortion."

When a clinic is attacked by a double-extortion operator and the attacker posts on a ransomware disclosure site that they hold clinic data, the question of whether PHI was actually acquired is no longer hypothetical. The attacker has demonstrated acquisition. The four-factor assessment cannot produce a low-probability finding when the data is demonstrably in the attacker's hands.

In these cases, individual notification is required. The existence of the stolen data on a criminal site does not eliminate the covered entity's notification obligation — affected individuals deserve to know that their information is exposed.

## Prevention Priorities for Small Clinics

The breach risk assessment requirement makes prevention a compliance argument, not just a security argument. An attack that succeeds means a risk assessment. A risk assessment that cannot rebut the presumption means notifications. Notifications mean documented breaches in your OCR file.

For small clinics with limited IT resources, the highest-return prevention measures:

**Immutable, air-gapped backups.** A backup that ransomware cannot encrypt is the single most valuable recovery tool. Test backup restoration regularly — an untested backup is an assumption, not a safeguard.

**Multi-factor authentication on all remote access.** Credential theft through phishing is the most common ransomware entry point. MFA on VPNs, remote desktop connections, and cloud platforms raises the cost of credential-based attacks significantly.

**Patch management with a defined cycle.** Known vulnerabilities — particularly in remote access software and email platforms — are exploited in the majority of healthcare ransomware incidents. Patches available for months before an attack are not a circumstance the risk assessment can explain away favorably.

**Network segmentation.** Systems holding ePHI should not be reachable from general workstations without controls. Segmentation limits ransomware spread if a single device is compromised.

**Documented incident response procedure.** The 60-day notification clock and the four-factor assessment both require rapid, organized action. A team that has reviewed and practiced the procedure before an incident runs the assessment correctly under pressure. A team encountering it for the first time after an attack makes errors under pressure.

A ransomware attack affecting a small clinic is a hard event. Facing it without a completed risk assessment, without backup capability, and without a notification plan makes it significantly harder.
