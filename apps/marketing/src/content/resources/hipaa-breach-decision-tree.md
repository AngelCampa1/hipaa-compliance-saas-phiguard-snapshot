---
title: "HIPAA Breach Notification Decision Tree"
headline: "Know within minutes whether a security incident is a reportable HIPAA breach"
description: "A printable, one-page decision tree that guides your team through the 45 CFR §164.402 breach determination: Was PHI involved Was it unsecured Does an exception apply Who must be notified and when?"
metaDescription: "Free HIPAA breach notification decision tree. Step-by-step guide to determine if a security incident is a reportable breach under 45 CFR §§164.400–414."
magnetSlug: "hipaa-breach-decision-tree"
summary: "Use this breach notification decision tree to help small clinics turn cited HIPAA requirements into dated operating evidence. It gives staff a practical way to record decisions, owners, review dates, exceptions, and follow-up tasks, then tie the completed artifact back to policies, BAAs, risk analysis, patient-rights workflows, or safeguard reviews."
stage: "awareness"
sequenceStage: "awareness"
bullets:
  - "Walks through the §164.402 definition in plain English: not every incident is a breach, and this tree tells you which ones are"
  - "Covers all four notification obligations: individual notice, media notice, HHS Secretary, and business associate-to-covered entity"
  - "Includes the four-factor risk assessment for applying the low probability of compromise exception"
  - "References exact regulatory citations so your Security Officer can defend every decision"
  - "Print it and pin it in your back office — it is designed to be usable during an active incident"
faq:
  - q: "What counts as a HIPAA breach?"
    a: "Under 45 CFR §164.402, a breach is any acquisition, access, use, or disclosure of PHI not permitted under the Privacy Rule that compromises the security or privacy of the information — unless a specific exception applies."
  - q: "What is the 60-day rule?"
    a: "Business associates must notify covered entities within 60 days of discovering a breach. Covered entities must notify affected individuals within 60 days of discovery. The clock starts on the date of discovery, not the date the breach occurred."
  - q: "Can we self-assess using this tree?"
    a: "Yes. This is designed for Security Officers and practice administrators to make the initial determination. For complex incidents, involve legal counsel before making final notification decisions."
  - q: "Is this free?"
    a: "Yes. Enter your email and we will send the full decision tree to your inbox."
  - q: "Why do you need my email?"
    a: "We send the resource directly to your inbox. We will not add you to a marketing list without your consent."
publishedAt: "2026-04-18"
updatedAt: "2026-04-22"
sources:
  - title: "Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/product"
relatedLearnPath: "/learn/incident-response/what-counts-as-a-hipaa-breach"
---

## What This Document Is

A structured tool for the first 48 hours after a potential security incident. The questions below take you from "something happened" to one of three outcomes: no breach, breach requiring notification, or breach falling under a documented exception. Work through the questions in order, write your answers in the margin, and keep the completed sheet in your incident file. The same answers drive the notification letters, the HHS portal entry, and any eventual OCR correspondence.

The regulation behind this flow is the Breach Notification Rule at 45 CFR §§164.400–414. The most important definition is at §164.402: a breach is the acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of the PHI. "Compromise" is the word that does the work, and the four-factor risk assessment is how that word gets applied in practice.

## Question 1 — Was PHI Involved?

PHI is individually identifiable health information held or transmitted by a covered entity or business associate, in any form. The 18 HIPAA identifiers listed at §164.514(b)(2) are the reference point: names, geographic subdivisions smaller than a state, dates linked to an individual, phone numbers, email addresses, medical record numbers, account numbers, biometric identifiers, full-face photographs, and the remaining categories.

If the information at issue contained none of these identifiers, or if any identifiers were fully de-identified under the Safe Harbor or Expert Determination method at §164.514, you do not have a HIPAA breach. Document the basis for that determination and stop.

If the information contained any identifier linked to a health condition, treatment, or payment for care, continue to question 2.

## Question 2 — Was the PHI Unsecured?

Only unsecured PHI triggers breach notification. PHI is secured if it has been rendered unusable, unreadable, or indecipherable to unauthorized persons through the technologies specified in HHS guidance — currently encryption meeting NIST FIPS 140-2 for ePHI at rest and in transit, or destruction meeting NIST SP 800-88 standards for physical media.

A stolen laptop whose hard drive was full-disk encrypted with an active, unshared passphrase is not an unsecured PHI incident. A stolen laptop encrypted with a sticky note holding the passphrase attached to the lid is unsecured, because the encryption key was effectively disclosed alongside the device. Paper records are never encrypted and are therefore always unsecured for the purposes of this test.

If the PHI was secured, document that finding and stop. If not, continue to question 3.

## Question 3 — Does a §164.402 Exception Apply?

The Breach Notification Rule excludes three categories of incident from the breach definition. Work through each.

**Unintentional access by a workforce member acting in good faith.** A nurse opens the wrong patient chart, recognizes the error, closes the chart, and does not share what was seen. The access was inside the nurse's scope of employment, was unintentional, and went no further. Not a breach.

**Inadvertent disclosure between authorized workforce members of the same covered entity.** A physician emails a billing question to a colleague and copies the wrong internal recipient, who is also authorized to see the information. Not a breach.

**Good-faith belief that the unauthorized recipient could not have retained the information.** A staff member briefly flashes a patient sign-in list at the front desk to a patient in line, realizes the error, and takes it back. If you have a reasonable basis to conclude nothing was retained or further disclosed, not a breach.

If any exception applies, document which one, why the facts fit it, and stop. If none applies, continue to question 4.

## Question 4 — Is There a Low Probability of Compromise?

This is the four-factor risk assessment required by §164.402(2). The burden of proof is on the covered entity: the default is that the incident is a breach, and the four factors must collectively support a low probability that PHI was compromised. A single adverse factor often flips the analysis.

**Factor 1 — Nature and extent of the PHI involved.** What types of identifiers, what sensitivity of clinical information, and how many individuals A roster of names and appointment times is different from a roster of names and HIV diagnoses. Diagnosis codes, mental health notes, and substance use records all raise the sensitivity.

**Factor 2 — The unauthorized person who used or received the PHI.** Was the recipient another covered entity bound by HIPAA, an unknown third party, or someone with a clear motive to misuse the data A misdirected fax to another physician's office presents less risk than a misdirected fax to a patient's employer.

**Factor 3 — Whether the PHI was actually acquired or viewed.** For electronic incidents, forensic evidence matters. If an encrypted laptop was recovered with no sign of decryption, or if server logs show no access to the affected files, the factor weighs toward low probability. If logs are missing or inconclusive, assume access.

**Factor 4 — The extent to which the risk has been mitigated.** Did you recover the device, obtain written attestation that the recipient destroyed the PHI, rotate credentials, or apply other controls Mitigation after the fact does not undo the incident but reduces downstream exposure.

If all four factors support a low probability of compromise, document the analysis in detail and treat the incident as a non-breach under §164.402(2). If any factor cuts the other way, proceed to the notification obligations below.

## Worked Examples

### Stolen laptop, full-disk encrypted

A clinic laptop is stolen from a staff member's car. The device had full-disk encryption active, the passphrase was not written down, and the staff member reported the theft within the hour. **Question 1:** Yes, PHI was on the device. **Question 2:** PHI was secured. Stop. No breach notification required. Document the encryption attestation from IT, the police report, and the date of remote wipe if available.

### Misdirected fax to a physician office

A referral fax with a patient's name, DOB, and surgical history is sent to the wrong outbound number. The recipient is another medical office, which calls to report the error and confirms the fax has been shredded. **Question 1:** Yes. **Question 2:** Unsecured (paper). **Question 3:** Good-faith belief the recipient could not retain the information, supported by the destruction confirmation. Document the call log and the written confirmation. No breach.

### Misdirected email to a patient's employer

A scheduling email intended for the patient is sent to the patient's work email, where the employer's IT department routinely monitors inbound traffic. The email contains the patient's name and the name of a behavioral health clinic. **Question 4 analysis:** The recipient has a real potential to misuse sensitive PHI, the email was delivered and likely read, mitigation is limited to a recall request that may or may not have worked. Factor 2 and Factor 3 both weigh against low probability. Treat as a breach. Proceed to notification.

### Ransomware on the file server

An endpoint is encrypted by ransomware and the attacker claims exfiltration. Logs show outbound data transfer during the incident window. OCR guidance treats ransomware as a presumed breach unless the covered entity can demonstrate a low probability of compromise, and evidence of exfiltration usually forecloses that argument. Treat as a breach, engage counsel, and begin the notification workflow.

### Improper access by a workforce member

A medical assistant looks up the record of a neighbor who is not a patient of the assistant's assigned providers. Access logs confirm the views. **Question 3:** The unintentional-access exception does not apply because the access was deliberate and outside the scope of authority. Treat as a breach. Issue sanctions under §164.308(a)(1)(ii)(C) and proceed to notification.

## Notification Obligations

Once you have determined an incident is a breach, three clocks start running. All dates are measured from the date of discovery, which is the first day the incident is known, or by exercising reasonable diligence would have been known, to any member of the workforce other than the person who committed the breach.

### Individual notice — §164.404

Written notice to each affected individual by first-class mail or email (where the individual has agreed to electronic notice), without unreasonable delay and in no case later than 60 calendar days after discovery. Content required by §164.404(c): a brief description of what happened, the types of unsecured PHI involved, steps individuals should take to protect themselves, what the covered entity is doing to investigate and mitigate, and contact information.

If contact information for 10 or more individuals is out of date, substitute notice is required: posting a conspicuous notice on the home page of the covered entity's website for 90 days, or a notice in major print or broadcast media serving the relevant geographic area.

### HHS notice — §164.408

For breaches affecting fewer than 500 individuals, an annual log submitted to HHS within 60 days of the end of the calendar year. For breaches affecting 500 or more individuals, contemporaneous notice to HHS within 60 days of discovery, submitted through the OCR breach portal.

### Media notice — §164.406

Required only for breaches affecting more than 500 residents of a single state or jurisdiction. Notice to prominent media outlets serving that state or jurisdiction, within 60 days of discovery. The content mirrors the individual notice.

### Business associate to covered entity — §164.410

A business associate must notify the covered entity of a breach without unreasonable delay and no later than 60 days after discovery. A well-drafted BAA shortens this window. The notice must include the identification of affected individuals and any other information the covered entity needs to meet its own notification obligations.

## State Law Interaction

Forty-eight states have their own breach notification statutes that can apply in parallel. Several are stricter than HIPAA in timing, content, or scope — for example, some states require notice within 30 days or require notice to the state attorney general regardless of the number of individuals affected. HIPAA does not preempt stricter state laws. Maintain a list of the state breach laws that apply to the jurisdictions where your patients reside, not only the state where your clinic is located. For any breach affecting patients in multiple states, run the analysis against each state's statute separately.

## Incident Documentation Template

For every incident, whether or not it is ultimately determined to be a breach, record the following in a single document and retain it for six years per §164.530(j).

- Date and time of discovery, and how the incident was discovered
- Date and time the incident is believed to have occurred
- Description of what happened, in neutral factual terms
- Systems, locations, and paper records involved
- Number of individuals potentially affected and the types of PHI involved
- Results of Question 1 (PHI involved?)
- Results of Question 2 (Secured or unsecured?)
- Results of Question 3 (Exception analysis, with reasoning)
- Results of Question 4 (Four-factor risk assessment, with reasoning per factor)
- Final determination and its basis
- Notification actions taken and dates
- Mitigation steps and sanctions applied
- Security Officer signature and date

## Where PHIGuard Fits

PHIGuard's Incidents module is positioned to guide the Security Officer through these questions and keep the determination, supporting reasoning, and follow-up work in one operating system. The product framing is intentionally narrower than a generic project tool: less workspace sprawl, more compliance follow-through.
