---
title: "HIPAA Breach: Definition and the Presumption Rule"
seoTitle: "HIPAA Breach: Definition and the Presumption Rule"
description: "The precise HIPAA definition of a breach, the presumption of breach, the four-factor risk assessment, the three statutory exceptions, and operational examples for small clinics."
metaDescription: "A HIPAA breach is an impermissible use or disclosure of PHI that is presumed to compromise its security. 45 CFR § 164.402."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "HIPAA Breach"
intent: "awareness"
summary: "A HIPAA breach is the acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of PHI. 45 CFR § 164.402. Any impermissible use or disclosure is presumed to be a breach unless the covered entity demonstrates a low probability of compromise through a four-factor risk assessment."
keyTakeaways:
  - "Any impermissible use or disclosure of PHI is presumed to be a breach — the covered entity bears the burden of rebutting that presumption."
  - "To rebut the presumption, the covered entity must conduct a four-factor risk assessment showing low probability that PHI was compromised."
  - "Three narrow exceptions exist: unintentional workforce access, inadvertent disclosure between authorized persons, and unauthorized person unable to retain PHI."
  - "Breach notification to individuals must occur within 60 days of discovery; breaches affecting 500+ individuals require media notification."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 164.402 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.402"
    publisher: "HHS / eCFR"
  - title: "Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
faq:
  - q: "A staff member accidentally faxed lab results to the wrong physician's office. Is this a breach?"
    a: "Probably yes. The fax is an impermissible disclosure that is presumed a breach. To avoid breach notification obligations, the clinic would need to conduct a four-factor risk assessment showing a low probability that the PHI was compromised — for example, if the receiving fax machine is in a secure medical setting and the incorrect recipient confirmed the fax was destroyed unread. If the risk assessment does not support a low probability finding, notification is required."
  - q: "A laptop containing patient records was stolen from a physician's car. Is this a breach?"
    a: "Yes, unless the ePHI on the laptop was encrypted to NIST standards. Unsecured ePHI on a stolen laptop is a breach requiring notification. If the laptop's hard drive was encrypted and the encryption key was not compromised, HHS considers the PHI 'secured' and breach notification obligations do not apply. This is why encryption of portable devices is one of the most important Security Rule safeguards."
  - q: "How long does the clinic have to notify patients after discovering a breach?"
    a: "Covered entities must notify affected individuals within 60 calendar days of discovering the breach (45 CFR § 164.404(b)). For breaches affecting 500 or more individuals, the covered entity must also notify the HHS Secretary and prominent media outlets serving the affected area within 60 days. For breaches affecting fewer than 500 individuals, HHS notification occurs via the HHS website on an annual basis."
---

A HIPAA breach is the acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of that PHI. 45 CFR § 164.402 provides the precise regulatory definition. "Breach" is used loosely in healthcare settings to mean anything from a cyber attack to a misaddressed envelope — under HIPAA, it has a specific meaning that determines when your clinic must notify patients, report to HHS, and potentially notify the media.

**Small-clinic example:** A billing specialist at a 5-provider family medicine practice accidentally emails a patient's explanation of benefits to the wrong patient. That misdirected email is an impermissible disclosure. The presumption of breach applies immediately — your clinic must conduct a documented four-factor risk assessment before concluding no notification is required.

## The Regulatory Definition

45 CFR § 164.402 defines **breach** as:

> "the acquisition, access, use, or disclosure of protected health information in a manner not permitted under subpart E of this part which compromises the security or privacy of the protected health information."

Two elements must be present: (1) an impermissible acquisition, access, use, or disclosure, and (2) that impermissible act must compromise the security or privacy of the PHI.

For a baseline understanding of what qualifies as PHI and therefore falls within this definition, see [what is PHI](/learn/hipaa-basics/what-is-phi) and the [18 HIPAA identifiers](/learn/phi-fundamentals/18-hipaa-identifiers).

## The Presumption of Breach

The most operationally important aspect of the HIPAA breach definition is the presumption rule, clarified in the 2013 Omnibus Rule. Under 45 CFR § 164.402(2):

> "An acquisition, access, use, or disclosure of protected health information in a manner not permitted under subpart E is presumed to be a breach unless the covered entity or business associate, as applicable, demonstrates that there is a low probability that the protected health information has been compromised."

The analysis starts from breach and works backward. If there has been an impermissible use or disclosure of PHI, your clinic cannot simply assume that no harm was done and move on. You must affirmatively demonstrate — through a documented risk assessment — that the probability of compromise is low.

If you cannot make that demonstration, the incident is a breach requiring notification.

## The Four-Factor Risk Assessment

To rebut the presumption of breach, your clinic must conduct a risk assessment that considers at minimum these four factors (45 CFR § 164.402(2)(i)-(iv)):

### Factor 1: Nature and Extent of the PHI Involved

What types of PHI were involved in the incident, and how sensitive is that information? A disclosure that included only a patient's name and appointment date presents a different risk profile than a disclosure that included HIV status, psychiatric records, or financial information.

Also relevant: the likelihood that the PHI could be used for identity theft or financial fraud. Disclosures that include Social Security numbers, dates of birth, financial account numbers, or similar data carry higher risk.

### Factor 2: Who Accessed or Used the PHI

Was the unauthorized person someone in a position where they might misuse the information? A disclosure to another covered entity's clinician is different from a disclosure to a stranger on the street. A disclosure to someone who has signed a confidentiality agreement is different from a disclosure to someone who has previously threatened to misuse patient records.

This factor considers both the identity of the recipient (to the extent known) and their likely purpose in having received the information.

### Factor 3: Whether the PHI Was Actually Acquired or Viewed

Was there an opportunity for the unauthorized person to actually acquire or view the PHI, or did an event occur that could have resulted in access without evidence that access actually occurred? A letter addressed to the wrong patient that was returned unopened presents different risk than a letter that was opened by the unintended recipient.

For electronic incidents, this factor considers whether audit logs show that files were accessed, downloaded, or copied — or whether the evidence shows the exposure existed without confirmed access.

### Factor 4: Whether the Risk Has Been Mitigated

Have steps been taken that meaningfully reduce the risk that the PHI will be misused? A common example is a business associate who receives an impermissible disclosure, promptly notifies the covered entity, and provides written confirmation that the PHI was destroyed without further disclosure. That mitigation meaningfully reduces the probability of compromise.

### Documenting the Assessment

The four-factor assessment must be documented. A covered entity that concludes an incident is not a reportable breach because the risk assessment shows low probability of compromise should have written documentation of that assessment. The documentation protects your clinic if OCR ever questions the determination.

HHS has made clear that the four-factor assessment must be applied in every case and cannot be reduced to a standardized blanket determination for categories of incidents. Each incident requires individualized assessment.

## Three Exceptions to the Breach Definition

Even before the risk assessment, three narrow exceptions in 45 CFR § 164.402(1) remove certain incidents from the definition of breach entirely:

### Exception 1: Unintentional Workforce Acquisition

An unintentional acquisition, access, or use of PHI by a workforce member acting under the authority of a covered entity, if such acquisition, access, or use was made in good faith and within the scope of authority, and does not result in further use or disclosure.

**Clinical example:** A medical assistant at a 10-person clinic accidentally opens a patient record for a patient with a similar name while looking for another patient's record. She realizes the error immediately, closes the record, and does not use or disclose the information. This qualifies for the exception.

**What does not qualify:** If the workforce member used the accessed information — even without malicious intent — the exception does not apply. If the workforce member was outside the scope of their authority (accessing records for patients not in their care), the exception may not apply.

### Exception 2: Inadvertent Disclosure Between Authorized Persons

An inadvertent disclosure by a person authorized to access PHI at a covered entity to another person authorized to access PHI at the same covered entity or an organized healthcare arrangement, if the PHI is not further used or disclosed.

**Clinical example:** A physician sends a patient summary in an internal email to the wrong clinician at the same clinic. The other clinician is also authorized to access PHI. She notifies the sender and deletes the email without further disclosure.

**Key limitation:** Both people must be authorized to access PHI. This exception does not apply to inadvertent disclosure to administrative staff who are not authorized to access clinical records, or to disclosure to staff at a different organization.

### Exception 3: Unauthorized Recipient Could Not Retain Information

A disclosure where the covered entity has a good faith belief that the unauthorized person to whom the disclosure was made could not reasonably have retained the information.

**Clinical example:** A nurse begins reading aloud a patient's name and medication from a chart in the corridor, then realizes immediately that a visitor is present and stops. The visitor could not reasonably have retained more than a first name from the brief exposure.

This exception is narrow and requires a genuine good-faith belief. If a fax containing four pages of medical records was transmitted to the wrong number, it is not plausible that the recipient "could not have retained" that information.

## Operational Examples for Small Clinics

**Misdirected email.** A staff member sends a patient's lab results to the wrong patient's email address. This is an impermissible disclosure. The presumption of breach applies. Unless the four-factor assessment shows low probability of compromise (for example, if the email was recalled before being opened and the unintended recipient confirmed they did not read it), notification is required.

**Lost paper records.** A physical therapy clinic loses a patient intake form containing name, date of birth, diagnosis, and insurance information. An impermissible disclosure is presumed. If the form is found in a locked storage room and there is no evidence anyone outside the authorized workforce accessed it, the risk assessment may support a low-probability finding. If the form was lost outside the facility, the analysis is harder.

**Ransomware attack.** Ransomware that encrypts ePHI is treated as a breach because the malicious actor who deployed the ransomware acquired access to the ePHI. OCR guidance from 2019 confirmed that ransomware attacks are presumed breaches unless the covered entity can demonstrate that ePHI was not actually accessed by the attacker. Most ransomware attacks will require breach notification.

**Snooping employee.** A front desk staff member accesses the EHR records of a public figure out of curiosity — outside the scope of their job duties. This is a prohibited access by a workforce member. The three exceptions do not apply. The four-factor assessment applies. Depending on what was accessed and whether it was shared, notification may be required. The workforce member must also be sanctioned.

For detailed case studies of how breach analysis plays out in practice, see [HIPAA violations examples](/learn/hipaa-basics/hipaa-violations-examples-and-penalties).

## Breach Notification Obligations

When an incident is determined to be a reportable breach, notification obligations under 45 CFR § 164.404 require:

- **Individual notification** within 60 days of discovering the breach (first-class mail or email if individual has agreed to electronic notices)
- **HHS notification** within 60 days of discovery for breaches affecting 500 or more individuals in a state; annual notification to HHS for breaches affecting fewer than 500 individuals
- **Media notification** for breaches affecting 500 or more individuals in a single state or jurisdiction within 60 days

The notification must include specific elements: a brief description of the breach, the types of PHI involved, steps individuals should take to protect themselves, a brief description of the covered entity's investigation and mitigation efforts, and contact information for the covered entity.

Maintaining a breach response procedure that your Privacy and Security Officers can execute quickly is essential. PHIGuard supports breach tracking, risk assessment documentation, and notification workflow management as part of its compliance platform. See [PHIGuard's HIPAA page](/hipaa).
