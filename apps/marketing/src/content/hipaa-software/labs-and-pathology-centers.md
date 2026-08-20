---
title: "HIPAA Software for Labs and Pathology Centers"
audience: "Lab directors, compliance officers, and operations managers at independent labs and pathology centers"
seoTitle: "HIPAA Software for Labs and Pathology Centers"
description: "Independent labs and pathology centers handle PHI from the moment a specimen is labeled. This guide covers audit logging, BAA obligations, mis-delivery response, and training for lab staff."
metaDescription: "HIPAA software for labs and pathology centers. Audit logging, BAA management, mis-delivery response, and minimum-necessary training for lab technicians."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
summary: "PHI enters a lab the moment a specimen label is printed. From that point, every result, every access, and every disclosure is a HIPAA event. Independent labs need a compliance program that matches the density of PHI moving through their operations each day."
keyTakeaways:
  - "PHI exists in the lab from the moment a specimen is associated with a patient identifier - not only when results are released."
  - "Requisition forms, result reports, and LIS access logs are all PHI and must be handled under documented policies."
  - "BAAs are required with ordering providers, reference labs, and any EMR or LIS vendor that stores or transmits PHI."
  - "Result mis-delivery is a breach candidate. Incident response procedures must cover it explicitly."
  - "Minimum necessary access applies to lab technicians - not every tech needs access to every patient result."
sources:
  - title: "45 CFR 164.308 - Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "45 CFR 164.312 - Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "HHS Guidance on the Minimum Necessary Standard"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html"
    publisher: "HHS"
  - title: "HHS Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/phi-fundamentals/ephi-explained"
verificationDate: 2026-04-26
faq:
  - q: "Does a specimen label count as PHI?"
    a: "Yes. A specimen label that links a biological sample to a patient's name, date of birth, or medical record number contains protected health information. It is subject to HIPAA's Privacy and Security Rules from the moment it is printed."
  - q: "Who does an independent lab need a BAA with?"
    a: "At minimum: ordering providers or their practices, any reference lab that receives specimens with PHI, the laboratory information system (LIS) vendor, and any EMR or patient portal vendor that receives result data. Courier services that transport specimens should also be evaluated."
  - q: "Is sending results to the wrong provider a reportable breach?"
    a: "It may be. Under 45 CFR 164.402, an impermissible disclosure is presumed to be a breach unless the covered entity or business associate can demonstrate a low probability that PHI was compromised using a four-factor risk assessment. Mis-delivered results require documented evaluation - not a phone call to retrieve the fax."
  - q: "Do lab technicians need to complete HIPAA training?"
    a: "Yes. Lab technicians are workforce members under HIPAA. Training must cover the minimum necessary standard, what constitutes PHI in the lab setting, and what to do when a potential disclosure occurs."
---

## PHI enters the lab before any result is produced

In most healthcare settings, PHI flows in at registration or encounter. In a laboratory, it arrives with the specimen. The requisition form carries the patient's name, date of birth, ordering provider, and clinical indication. The sample tube has a label. The laboratory information system logs the accession the moment the sample is scanned. PHI is present before the first analysis runs.

Independent labs and pathology centers that treat HIPAA compliance as a downstream function - something that applies only when results go out - are already behind. The chain of custody for PHI starts at receipt and does not end until the result is delivered, the record is retained through the required period, and any authorized disclosure is documented.

## What HIPAA requires in a lab setting

The Privacy and Security Rules apply to independent labs as either covered entities (if they are health care providers that transmit health information electronically in connection with HIPAA transactions) or as business associates of ordering providers. The practical compliance obligations are similar in either case.

**Administrative safeguards at 45 CFR 164.308** require a security officer, documented risk analysis, workforce training, access management policies, and incident response procedures. These are required implementation specifications with addressable and required designations, not optional program elements.

**Technical safeguards at 45 CFR 164.312** require access controls, audit controls, integrity mechanisms, and transmission security. For a lab, this maps to: who can log in to the LIS, what system logs capture about their access, whether result transmissions are encrypted, and how the lab detects and responds to unauthorized access.

**The minimum necessary standard** under 45 CFR 164.502(b) requires that PHI disclosures be limited to the amount reasonably necessary to accomplish the purpose. For lab staff, this means access controls on the LIS that match role to need. A technician processing hematology samples does not need access to the full oncology result archive.

## BAAs in a lab environment

An independent lab typically sits in the middle of a PHI chain. Specimens come in from ordering providers. Results go out to providers, EMR systems, or patient portals. Reference labs receive specimens that require specialized analysis. Each relationship that involves PHI needs a BAA.

The BAA inventory for a typical independent lab should include:

- **Ordering providers and their practices**, if the lab has an ongoing relationship rather than treating each order as a one-time disclosure
- **Reference labs** that receive specimens or result data
- **The LIS vendor** - laboratory information systems process PHI as a core function and require a BAA
- **EMR and patient portal vendors** that receive result feeds
- **Any cloud storage or backup provider** that holds LIS data or result archives

Courier relationships require evaluation. If a courier transports specimens with patient-identifying information on the packaging or paperwork, that relationship should be assessed for BAA requirements under 45 CFR 164.502(e).

Tracking this manually - in a spreadsheet or a filing system - creates risk. BAA expiration dates are easy to miss when buried in a folder. An active register with expiration tracking and renewal reminders is a compliance control, not an administrative convenience.

## Audit logging: who accessed which result

The Security Rule requires audit controls that record and examine activity in systems that contain or use ePHI. For a lab, the primary system is the LIS, and the primary audit question after an incident is: who accessed the result, when, and from where.

Audit logging in the LIS is not the same as a compliance audit trail. The LIS log captures technical activity. The compliance audit trail captures the decisions around that activity: who reviewed an access anomaly, what they determined, and how the matter was resolved. These are two different records, and both matter.

A compliance program for an independent lab needs:

- A designated person responsible for reviewing LIS access logs periodically
- A documented procedure for what happens when an anomaly is found
- Incident records that show the review, the determination, and any corrective action
- Annual review of access controls to ensure roles match current workforce assignments

The access review is not a one-time task. Workforce changes, new hires, role changes, terminations, each require an access update documented in the compliance record.

## Result mis-delivery and the breach notification obligation

Lab results reach the wrong recipient more often than most labs formally document. A fax to the wrong number, an electronic result routed to a provider who left the practice, a printed report picked up by the wrong person at the front desk - each is a potential breach under the Breach Notification Rule at 45 CFR 164.400.

Under 45 CFR 164.402, an impermissible disclosure is presumed to be a reportable breach unless the covered entity can demonstrate a low probability of compromise using a four-factor risk assessment. The four factors are: the nature and extent of the PHI involved, who received it and whether they could retain it, whether the PHI was actually viewed, and the extent to which risk has been mitigated.

A verbal confirmation that the fax was deleted does not complete this analysis. You need to document it. The lab needs a procedure for:

- Logging the incident immediately on discovery
- Conducting and recording the four-factor risk assessment
- Determining whether notification to the patient and HHS is required
- Closing the incident with documentation of the outcome

Labs that lack a formal incident response procedure for mis-deliveries are missing the most common PHI disclosure event in laboratory operations.

## Training for lab technicians on minimum necessary access

Lab technicians handle biological samples and run instruments. HIPAA training programs tend to center on front-office staff and clinical providers, leaving technicians out. That is a compliance problem.

Every person who accesses the LIS, handles a requisition form, reads a result, or sends a report to a provider is interacting with PHI and is a workforce member subject to HIPAA training requirements. Training for lab staff should address:

- What constitutes PHI in the lab context (not just "patient records" - specimen labels, requisition forms, and result printouts are all PHI)
- The minimum necessary standard and what it means for LIS access
- Reporting obligations when a potential incident is discovered - including that technicians are expected to report, not investigate
- Secure communication for result transmission and what tools are and are not approved

Training records for each workforce member - with completion dates and version tracking - are part of the administrative safeguard documentation that survives an OCR audit.

## Building a compliant lab compliance program

The core compliance artifacts for an independent lab or pathology center:

- **Risk analysis** covering the LIS, result transmission systems, specimen handling, and physical safeguards
- **BAA register** tracking every vendor relationship where PHI flows, with expiration dates
- **Workforce training records** including lab technicians, front desk, couriers, and management
- **Access control documentation** with role-based LIS access and periodic access reviews
- **Incident log** with a formal procedure for mis-deliveries, unauthorized access, and any other PHI disclosure event


For a plain-language explanation of what constitutes ePHI and why it matters for technical safeguard planning, see [ePHI explained](/learn/phi-fundamentals/ephi-explained). To assess your current compliance posture, request the [HIPAA compliance self-assessment](/resources/hipaa-compliance-self-assessment). For pricing details, see the [plans page](/pricing).

Labs affiliated with or operating inside hospital systems should review the [group practices guide](/hipaa-software/group-practices) for considerations that apply when multiple entities share a compliance infrastructure.
