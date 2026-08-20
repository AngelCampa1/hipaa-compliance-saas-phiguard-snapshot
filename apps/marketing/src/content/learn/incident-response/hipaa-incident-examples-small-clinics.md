---
title: "HIPAA Incident Examples for Small Clinics"
description: "Concrete examples of HIPAA security incidents organized by type - unauthorized access, improper disclosure, device incidents, and internal access violations - with guidance on which require breach triage."
metaDescription: "HIPAA incident examples for small clinics: unauthorized access, misdirected fax, lost devices, improper internal access - what each is and what to do."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: incident-response
schemaType: article
intent: awareness
summary: "Staff at small clinics often don't recognize HIPAA incidents when they occur. Concrete examples - organized by incident type - make it easier to identify situations that require documentation and triage, even when they don't ultimately rise to a reportable breach. It helps clinic leaders decide what facts to collect, how to document breach reasoning, and when HIPAA notification duties may require escalation."
keyTakeaways:
  - "A HIPAA security incident is any attempted or successful unauthorized access, use, disclosure, modification, or destruction of PHI - broader than a reportable breach."
  - "Every breach is a security incident, but not every security incident is a reportable breach - the four-factor risk assessment determines whether notification is required."
  - "All security incidents must be documented, even those that don't meet the breach threshold - the incident log is a required compliance record."
  - "The discovery date starts the 60-day breach notification clock - the incident must be documented when discovered, not when investigation is complete."
  - "The most common small-clinic incidents are misdirected communications (fax, email, voicemail), unauthorized internal access (curiosity-driven record access), and device losses."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-incident-triage-worksheet
relatedCommercialPath: /security
sources:
  - title: "HIPAA Security Rule - 45 CFR Section  164.304 Definitions (Security Incident)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.304"
    publisher: "eCFR"
  - title: "HIPAA Breach Notification Rule - 45 CFR Section  164.400-414"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D"
    publisher: "eCFR"
  - title: "HHS Breach Notification Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
faq:
  - q: "Does every incident need to be reported to OCR?"
    a: "No. Only breaches - as defined by the HIPAA Breach Notification Rule - require OCR notification. An incident that is investigated and determined (through the four-factor risk assessment) not to present a significant probability of PHI being compromised is documented internally but not reported to OCR."
  - q: "What is the four-factor risk assessment?"
    a: "The Breach Notification Rule requires covered entities to assess four factors when determining whether an incident is a breach: (1) the nature and extent of the PHI involved, (2) who accessed or could have accessed the PHI, (3) whether the PHI was actually acquired or viewed, and (4) the extent to which risk has been mitigated. Low probability of compromise across all four factors allows the covered entity to treat the incident as not a breach."
  - q: "Do near-misses need to be documented?"
    a: "Yes. Attempted unauthorized access - even if it was unsuccessful - is a security incident under 45 CFR Section  164.304 and must be documented. Near-misses often reveal vulnerabilities that need addressing."
  - q: "What should the incident log contain?"
    a: "Date the incident was discovered, nature of the incident, what PHI was involved, who was involved (role, not necessarily name), steps taken to investigate and contain, four-factor analysis outcome, final determination (breach or not), and any notification actions taken."
---

Clinic staff often don't know what counts as a HIPAA incident until they're in the middle of one. Uncertainty about whether to report, document, or escalate leads to incidents that get quietly buried. When those incidents surface later - during an OCR investigation or lawsuit - the clinic faces exposure for both the original event and the failure to document it.

The examples below are organized by incident type, with guidance on how each should be handled.

## Definitions: Security Incident vs. Breach

A **security incident** under HIPAA (45 CFR Section  164.304) is any attempted or successful unauthorized access, use, disclosure, modification, or destruction of information, or interference with information system operations.

A **breach** (45 CFR Section  164.402) is a specific type of security incident: the acquisition, access, use, or disclosure of PHI in a way not permitted by the Privacy Rule that presents a significant risk of financial, reputational, or other harm to the affected individual.

Every breach is a security incident. Not every security incident is a breach. The distinction determines notification obligations - but both require documentation regardless of outcome.

## Unauthorized Access Incidents

**Scenario 1: Former employee with active credentials**
A staff member who left the clinic three weeks ago logs into the scheduling system using credentials that were never deactivated. The login is visible in the audit log.

*Breach assessment:* High-probability breach. The former employee accessed the system without authorization. What they viewed depends on what the audit log shows. This incident requires full triage, likely individual notification, and an OCR report if PHI was compromised.

*What went wrong:* Access credentials were not revoked on the employee's last day. This is the most common Security Rule failure under 45 CFR Section  164.308(a)(3).

---

**Scenario 2: Staff member accessing their own records**
A medical assistant who is also a patient at the clinic uses their EHR access to review their own chart, including labs they weren't directly involved in treating.

*Breach assessment:* Unauthorized access. The staff member's job authorization does not cover accessing their own records for personal purposes. The four-factor analysis asks whether this created risk of harm to the individual - in most cases, self-access without disclosure to others presents low external harm risk. The incident still needs to be documented and addressed with a sanction.

---

**Scenario 3: EHR login from an unexpected location**
An audit log review shows that a provider's login credentials were used to access the EHR from an IP address in another country at 3 a.m. The provider confirms they did not log in at that time.

*Breach assessment:* Potential account compromise - credential theft or shared credentials. Immediate incident response is required: disable the credential, issue a new one, assess what was accessed, apply the four-factor analysis. Treat as high probability of breach until the evidence shows otherwise.

## Improper Disclosure Incidents

**Scenario 4: Misdirected fax**
A referral coordinator sends a clinical summary to the wrong fax number, one digit off from the intended specialist's office. The error is discovered the same day.

*Breach assessment:* PHI was disclosed to an unauthorized recipient. The four-factor analysis turns on: was the document actually received If the wrong number goes to a business fax machine with no reason to believe it was received in bad faith, OCR guidance treats this as potentially low-probability-of-compromise. If the fax went to a residential number or a competitor, the analysis changes. Document the incident, attempt to retrieve the document or have it destroyed, and complete the four-factor assessment before closing it.

---

**Scenario 5: Appointment reminder left on a family member's phone**
A staff member calls the patient's cell phone to confirm a psychiatry appointment. A family member answers and the staff member says the patient's name and the appointment date and clinic name before realizing the family member answered.

*Breach assessment:* PHI was disclosed to an unauthorized person. The family member received the patient's name, appointment date, and clinic name. Run a four-factor analysis. The nature of the information - a mental health appointment at a named clinic - is particularly sensitive, and whether the family member was authorized to receive any health information about the patient is the central question.

---

**Scenario 6: Staff member discussing patient in waiting room**
A nurse uses a patient's name and mentions their diagnosis while talking to another nurse near the waiting room, where the conversation is overheard by a waiting patient.

*Breach assessment:* HIPAA permits incidental disclosures that are a by-product of otherwise permitted uses, provided the covered entity applied reasonable safeguards. Whether this qualifies as incidental depends on whether the clinic had policies and physical barriers to minimize hallway conversations near waiting areas. If the conversation went beyond what those safeguards would reasonably prevent, it may warrant a sanction regardless of breach status. Document it, address it with the staff involved, and assess whether the physical layout creates a recurring risk.

## Device and Equipment Incidents

**Scenario 7: Laptop stolen from a car**
A billing coordinator's clinic-issued laptop is stolen from their car. The laptop contained exported billing reports with patient names, DOBs, and claim information.

*Breach assessment:* Encryption status is the determining factor. If the laptop had full-disk encryption, the theft is a security incident but likely not a breach - a thief who cannot read the data creates no meaningful PHI exposure. If the laptop was unencrypted, this is a breach affecting every patient whose data was on the device. Confirm encryption status before concluding the assessment.

---

**Scenario 8: USB drive lost at a coffee shop**
A provider uses a USB drive to transfer files between the office and home. The drive contains patient reports exported from the EHR. The drive is lost.

*Breach assessment:* Unless the USB drive was encrypted, this is a breach. PHI on an unencrypted portable drive in an unknown location is accessible to whoever picked it up. Even if no one accessed it, the clinic cannot confirm that - and the inability to confirm creates the breach presumption under the Breach Notification Rule.

## Improper Internal Access

**Scenario 9: Staff member sharing login credentials**
Two billing staff members share a single login credential for the EHR billing module because the second staff member's account wasn't set up before she started. This arrangement has been in place for two months.

*Breach assessment:* The audit log for the shared credential cannot distinguish between the two users. Any access attributed to that credential during the two-month period is effectively unattributable, creating a two-month audit gap. This is a Security Rule violation for unique user identification (45 CFR Section  164.312(a)(2)(i)). Whether specific access events during that period constitute breaches requires reviewing what the credential accessed. The shared credential must be deactivated immediately - not when the second account is set up, now.

---

**Scenario 10: Contractor accesses clinical notes they don't need**
A billing contractor reviews full clinical notes to look up procedure codes. The contractor's access level permits this, but the minimum necessary standard suggests billing personnel should not need full clinical notes for coding purposes.

*Breach assessment:* If the contractor's access was improperly configured, this is an access control issue requiring remediation. If notes were accessed but not disclosed externally, the breach risk is likely low. Still, review the access pattern, correct the access level, and document both. This also triggers a minimum necessary standard review - billing personnel should not need full clinical notes to look up procedure codes.

## The Documentation Requirement

All of these incidents, whether or not they constitute reportable breaches, must be documented in the clinic's incident log. The log entry should capture:

- Date and time the incident was discovered
- Who reported it and how
- Description of what occurred
- PHI involved (type and approximate number of individuals)
- Actions taken (containment, investigation steps)
- Four-factor analysis outcome
- Final determination (breach, not a breach, inconclusive)
- Notification actions taken (if applicable)

The incident log is required compliance documentation under the Privacy and Security Rules and must be retained for six years. A well-maintained log showing zero reportable breaches demonstrates a functioning incident response program. A clinic with no incident log has no documented history - and OCR treats that absence as a compliance gap regardless of whether incidents actually occurred.
