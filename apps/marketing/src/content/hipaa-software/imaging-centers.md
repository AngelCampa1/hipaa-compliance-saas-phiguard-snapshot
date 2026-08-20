---
title: "HIPAA Software for Imaging Centers"
audience: "Imaging center administrators and compliance managers at independent radiology and diagnostic imaging facilities"
seoTitle: "HIPAA Software for Imaging Centers"
description: "Imaging centers hold some of the most sensitive PHI in healthcare - DICOM images tied to patient identifiers, interpreted reports, and remote radiologist access. This guide covers the compliance program that matches that exposure."
metaDescription: "HIPAA software for imaging centers. DICOM PHI controls, cloud PACS BAA management, remote radiologist access reviews, and patient record request handling."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
summary: "Imaging centers manage a class of PHI that is uniquely sensitive and unusually persistent - a diagnostic image retains patient-identifying information for decades and cannot be de-identified without compromising its clinical value. The compliance program must account for the full lifecycle of that data."
keyTakeaways:
  - "DICOM files contain patient identifiers embedded in the file header - they are PHI and must be treated as such throughout their lifecycle."
  - "Cloud PACS vendors are business associates and require a signed BAA before any image is uploaded."
  - "Remote radiologists accessing images from outside the facility create access control and audit logging obligations."
  - "Workstation security for high-resolution imaging systems requires specific physical and technical safeguard documentation."
  - "Patient record requests for imaging studies are a common and legally time-sensitive obligation."
sources:
  - title: "45 CFR 164.312 - Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "45 CFR 164.310 - Physical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.310"
    publisher: "eCFR"
  - title: "HHS Right of Access Guidance"
    url: "https://www.ecfr.gov/current/title-45/section-164.524"
    publisher: "HHS"
  - title: "HHS Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/risk-analysis/asset-inventory-for-small-clinics"
verificationDate: 2026-04-26
faq:
  - q: "Are DICOM files PHI?"
    a: "Yes. DICOM files contain patient identifiers embedded in the file header - name, date of birth, patient ID, and other fields are part of the DICOM standard. A DICOM image cannot be treated as anonymous data without a formal de-identification process that removes those header fields. Until that process is applied and verified, every DICOM file is PHI."
  - q: "Does a cloud PACS vendor need a BAA?"
    a: "Yes. A cloud PACS vendor stores and processes ePHI on behalf of the imaging center, which makes it a business associate under HIPAA. A signed BAA must be in place before any patient image is uploaded to the cloud system."
  - q: "How should we handle a radiologist who reads from a home office?"
    a: "Remote reading creates access control and audit logging obligations. The radiologist's home workstation should be documented in the device inventory, encryption should be verified, and VPN or secure access protocol should be confirmed. Access to the PACS should be logged and periodically reviewed."
  - q: "What is the timeline for responding to a patient's request for their imaging records?"
    a: "Under the HIPAA Right of Access Rule, covered entities must respond to a patient's request for access to their designated record set within 30 days of receipt, with one possible 30-day extension if the records are not on-site. OCR has actively enforced this requirement and has levied civil monetary penalties against providers who failed to respond within the regulatory timeframe."
---

## Imaging centers hold PHI that does not expire

A radiology report from five years ago is still PHI. The DICOM image that accompanies it is still PHI. The referring provider communication attached to that study is still PHI. Diagnostic imaging creates records that patients, providers, and insurers may request for years after the original encounter, and those records remain fully subject to HIPAA throughout their retention period.

That persistence makes imaging center compliance distinct. The compliance program is not managing a transient encounter. It is managing an archive that grows every day and must be protected indefinitely. The infrastructure that holds that archive - the RIS, the PACS, the cloud storage tier, the workstations where radiologists read - is the compliance surface.

## DICOM files and the PHI they carry

DICOM is the standard file format for medical imaging. It was designed to carry clinical images and the metadata needed to use them clinically. That metadata includes patient name, date of birth, patient ID, referring physician, and study date, all embedded in the file header.

A DICOM file cannot be treated as a non-PHI asset. A folder of DICOM files on an unencrypted workstation is a folder of PHI. A batch of DICOM files transferred to a cloud storage bucket without a BAA in place is an impermissible disclosure. A DICOM file emailed in response to a patient request through a non-secure channel may be a breach.

The practical implications for the compliance program:

- The PACS and any system that stores DICOM files must be included in the security risk analysis
- Data transfer to or from the PACS must occur over encrypted channels
- Storage at rest must be encrypted, including backup and archive copies
- Any de-identification of DICOM files for research or secondary use requires documented application of the Safe Harbor or Expert Determination method under 45 CFR 164.514

DICOM de-identification requires systematic processing of the header fields, not just removing the patient's name from the filename. Imaging centers that contribute to research data sets without a formal de-identification protocol expose themselves to HIPAA liability in the research pipeline.

## BAAs for cloud PACS and vendor relationships

The shift to cloud PACS has simplified infrastructure and reduced hardware overhead for independent imaging centers. It has also concentrated PHI in a third-party environment that the imaging center does not physically control. That concentration requires a BAA.

A cloud PACS vendor that stores, processes, or transmits diagnostic images containing patient identifiers is a business associate. The BAA must be executed before any PHI is uploaded. Many cloud PACS vendors provide a standard BAA; the imaging center's obligation is to execute it, retain a copy, and include the relationship in the BAA register with the agreement's effective date and any renewal terms.

The BAA register for a typical imaging center should also include:

- **Radiology information system (RIS) vendor** - the RIS manages scheduling, orders, and result reports, all of which contain PHI
- **Referring practice EHR or HIE connections** - any interface that sends orders in or results out is a PHI exchange that requires a BAA
- **Teleradiology or remote reading services** - if a radiologist reads under contract from a teleradiology service, that service may be a business associate
- **IT support and managed service providers** - if the MSP has access to systems containing PHI, a BAA is required
- **Cloud backup providers** - if backup includes PACS data or RIS data, the backup vendor needs a BAA

The BAA register is an active document, not a signed-and-filed artifact. Include expiration and renewal tracking. A lapsed BAA means PHI is being shared without a current agreement - full stop.

## Access controls for remote radiologists

Independent imaging centers routinely work with radiologists who read remotely, from a home office, a hospital workstation, or a teleradiology platform. Remote reading is operationally efficient and an access control challenge.

The Security Rule's technical safeguards at 45 CFR 164.312 require access controls that allow only authorized users to access ePHI, as well as audit controls that record and examine activity in systems containing ePHI. For a remote radiologist, this means:

- A unique user credential for PACS access that belongs to that individual - no shared logins
- A documented authorization process confirming that reading access was granted before the first login
- Transmission security: the connection between the remote workstation and the PACS must be encrypted (VPN or equivalent)
- A device in the inventory: the workstation used for remote reading should be documented, and encryption of that workstation should be confirmed

Access reviews for remote readers should happen when reading arrangements change and at least annually. A radiologist who ended their contract six months ago and still has active PACS credentials is a Security Rule finding.

## Workstation and physical safeguard requirements

Diagnostic imaging workstations are specialized equipment. High-resolution monitors for reading CT, MRI, or mammography studies often fall outside standard endpoint management programs. That gap creates compliance risk.

The Physical Safeguard requirements at 45 CFR 164.310 cover workstation use, workstation security, and device and media controls. For imaging centers:

- **Workstation use policies** should specify who may use reading stations, for what purpose, and what access controls are applied when the workstation is unattended (screen lock, session timeout)
- **Device inventory** should include reading stations, PACS servers, and any portable media used for image transfer (CD/DVD, USB)
- **Physical access controls** should address who can enter the reading room and whether non-authorized personnel (including referring provider staff who come on-site) have access to reading workstations

CD and DVD image distribution is increasingly uncommon but still present in some markets. If the center distributes images on portable media, the media handling policy should address labeling, tracking, and what happens when a disc is returned or unreturned.

## Incident response for unauthorized access to images

Unauthorized access to imaging records requires the same documented response as any other PHI incident. A PACS access log that shows a former employee's credentials were used after termination, a result transmitted to the wrong referring practice, or a portable media disc reported lost - each requires a formal incident record.

The incident record should capture:

- When the incident was discovered and by whom
- What PHI may have been accessed or disclosed (including the study or studies involved)
- The risk assessment under 45 CFR 164.402, documenting the four-factor analysis
- The notification determination and any required notifications to patients or HHS

Imaging centers have an additional consideration in the risk assessment: diagnostic images often carry far more clinical information than a simple lab result. An unauthorized viewer of a mammography study or a psychiatric imaging referral has access to sensitive clinical details beyond just the patient's name and date of birth. The risk assessment should account for the nature of the study, not only the categories of identifiers present.

## Patient record requests for imaging studies

Patients have a right to access their designated record set under 45 CFR 164.524, and imaging studies are part of that record set. OCR has actively enforced this right, including against providers who failed to respond within the 30-day regulatory window or who charged unreasonable fees.

For an imaging center, the practical complexity of fulfilling an imaging record request varies:

- Digital studies can typically be provided on portable media or through a patient portal
- Older studies may require retrieval from long-term archive storage
- Some patients request the images; others request the radiologist's report; some request both
- Insurers or attorneys may request studies on behalf of patients under a valid authorization

The compliance program should include a documented procedure for record requests covering intake, response timeline tracking, format options, and fee policy. Tracking open requests with the 30-day deadline visible is a compliance control. Requests that fall out of the tracking process and exceed the statutory window become enforcement exposure.

## Building the compliant imaging center compliance record

Five core components of an imaging center compliance program:

- **Risk analysis** covering the PACS, RIS, workstations, remote access, and physical safeguards - updated when systems or infrastructure change
- **BAA register** covering cloud PACS, RIS vendor, referring practice connections, teleradiology services, and any other business associate relationship
- **Access control documentation** covering user provisioning, remote access procedures, and periodic access reviews
- **Incident log** with procedures for unauthorized access, mis-delivered results, and lost portable media
- **Patient access request tracker** with deadline visibility and outcome documentation


For a structured approach to building the asset and system inventory that underlies the risk analysis, see [asset inventory for small clinics](/learn/risk-analysis/asset-inventory-for-small-clinics). To evaluate your current posture, request the [HIPAA compliance self-assessment](/resources/hipaa-compliance-self-assessment). For pricing, see the [plans page](/pricing).

Imaging centers affiliated with or referring to hospital-based radiology groups may also benefit from reviewing the [group practices guide](/hipaa-software/group-practices) for considerations that apply to shared BAA and policy structures across related entities.
