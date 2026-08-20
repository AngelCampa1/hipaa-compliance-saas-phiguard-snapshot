---
title: "PHI in Imaging Workflows"
description: "DICOM files, PACS systems, and radiology sharing create PHI exposure points that most small clinics don't anticipate. Here's where imaging PHI risks concentrate and what the regulations require."
metaDescription: "DICOM files embed patient identifiers. Learn where imaging PHI risks concentrate for small clinics and what HIPAA requires for in-house imaging."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Imaging workflows — from ordering a study to sharing results with consultants — involve PHI in formats that behave differently than EHR notes. DICOM files embed patient identifiers directly in the file, PACS vendors and radiology groups are business associates, and legacy imaging workstations are a persistent vulnerability that many small clinics have not addressed."
keyTakeaways:
  - "Every DICOM file contains embedded patient identifiers — sending the image file means sending PHI, regardless of the recipient's intent."
  - "Any radiology group that interprets your images and returns a report is a business associate and requires a signed BAA."
  - "PACS software, cloud DICOM archives, and imaging workstation vendors are all business associates."
  - "Imaging workstations running end-of-life operating systems (Windows XP, Windows 7) connected to your network are an active Security Rule violation."
  - "Patients have the right to receive copies of their imaging records; the physical handoff — CD, USB, or portal download — must be logged."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/pricing"
sources:
  - title: "45 CFR § 164.502(b) — Minimum Necessary"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "Electronic Code of Federal Regulations"
  - title: "45 CFR § 164.312(a) — Access Control (Technical Safeguards)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "Electronic Code of Federal Regulations"
  - title: "HHS Guidance on Electronic Protected Health Information"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "U.S. Department of Health and Human Services"
  - title: "DICOM Standard — Digital Imaging and Communications in Medicine"
    url: "https://www.dicomstandard.org/current"
    publisher: "NEMA / DICOM Standards Committee"
faq:
  - q: "Is burning a DICOM study to a CD for a patient considered a HIPAA-compliant disclosure?"
    a: "Yes, providing imaging records to a patient on CD or USB is a permitted disclosure under the right of access. However, the clinic should document the handoff — what study, to whom, and when — because the physical exchange is not automatically logged the way an electronic portal download would be."
  - q: "Does the radiology group that reads our X-rays need to sign a BAA?"
    a: "Yes. If the radiology group receives your DICOM files, interprets them, and returns a report, they are performing a service for your clinic that involves access to PHI. That makes them a business associate under 45 CFR § 164.502(e). A signed BAA is required before they receive any images."
  - q: "What makes a shared network drive an imaging PHI risk?"
    a: "A shared network drive without access controls allows any staff member with network access to open DICOM files, regardless of whether their role requires it. The minimum necessary standard (45 CFR § 164.502(b)) requires limiting access to PHI to those who need it for their job function."
---

In-house imaging — X-ray, ultrasound, ECG, and point-of-care diagnostics — gives small clinics a real clinical advantage. Patients do not have to drive across town. Results come back the same day. Many clinics acquire imaging equipment without fully accounting for the HIPAA surface it introduces. The imaging workflow touches PHI in formats that behave differently than an EHR note, and the risks concentrate in places that are easy to overlook until something goes wrong.

## What a DICOM File Actually Contains

DICOM (Digital Imaging and Communications in Medicine) is the standard format for medical images. Every X-ray, ultrasound, MRI, and CT scan produced by a modern imaging device is a DICOM file. A DICOM file is not just an image — it is a structured data container.

Embedded in the DICOM header alongside pixel data are fields that typically include:

| DICOM Header Field | Example Content |
|--------------------|-----------------|
| Patient Name | Last name, first name |
| Patient ID | Medical record number |
| Date of Birth | Full date |
| Study Date | Date of the imaging encounter |
| Referring Physician | Provider name |
| Institution Name | Your clinic's name |
| Accession Number | Study identifier |

Sending a DICOM file — by email, USB, CD, or any other method — is sending PHI. The intended recipient may only care about the anatomical image, but the file they receive contains enough identifying information to constitute protected health information under 45 CFR § 164.501. The transmission must be treated accordingly.

## The Five Imaging PHI Risks Small Clinics Most Often Underestimate

### 1. DICOM Files on Shared Network Drives Without Access Controls

The path of least resistance for a small clinic that acquires imaging equipment is to configure the device to save files to a network share that existing staff can already reach. This creates a PHI access problem immediately.

Under 45 CFR § 164.312(a), covered entities must implement technical policies and procedures that allow access to ePHI only to authorized persons. A shared network drive with no folder-level permissions — one that any front-desk staff member, billing coordinator, or visiting technician can browse — fails this requirement. Imaging files should be stored in a location that requires role-specific credentials to access.

### 2. Images Burned to CD or USB for Patients Without a Log

Providing patients with copies of their imaging records is a right under 45 CFR § 164.524. Handing them a CD or USB with their DICOM study is an acceptable fulfillment of that right. The gap most clinics have is documentation.

When a patient downloads their records through a patient portal, the action is typically logged automatically. When a staff member burns a disc and hands it across the counter, nothing is logged unless the clinic has a manual process for it. The clinic should record which study was provided, in what format, to whom, and on what date. A compliance review or OCR inquiry will ask for exactly this documentation.

### 3. Images Shared by Email Because the PACS Has No Patient Portal

Many small-clinic PACS installations are entry-level systems that lack built-in patient portal functionality. When a patient calls and asks for their X-rays, staff often export the DICOM and attach it to an email.

Standard email is not a HIPAA-compliant transmission channel for PHI unless the patient has specifically requested it and acknowledged the risks in writing (45 CFR § 164.522). That is a patient-preference exception, not a general permission to email DICOM files. For routine image-sharing with patients or other providers, the clinic needs a secure method: an encrypted file transfer, a patient portal, a HIPAA-compliant cloud link, or a secure direct messaging system.

### 4. Images Sent to External Radiologists Without a BAA

If your clinic does not have an in-house radiologist and sends DICOM studies to an external radiology group for interpretation, that radiology group is a business associate. They receive your patients' PHI, process it, and return a report. Under 45 CFR § 164.502(e), no PHI may be disclosed to a business associate without a signed Business Associate Agreement.

This applies to:

- Teleradiology services
- Hospital radiology departments that read community clinic studies
- Independent radiologist groups under a professional services contract

The BAA must be in place before the first image is transmitted. If your clinic has been sending studies to a radiology group without a BAA, that gap needs to be remediated — prospectively with a signed agreement, and documented in your risk management records.

### 5. Legacy Imaging Workstations Running End-of-Life Operating Systems

This risk gets deferred longest because fixing it requires capital expenditure. Many small clinics have imaging workstations — often bundled with the original hardware purchase — that still run Windows XP or Windows 7. Microsoft ended extended support for Windows XP in 2014 and for Windows 7 in 2020. These systems no longer receive security patches.

A network-connected workstation running an end-of-life OS with access to DICOM files is an active vulnerability. The Security Rule (45 CFR § 164.306) requires covered entities to protect against reasonably anticipated threats to ePHI. An unpatched system handling patient imaging data does not meet that standard. Options include isolating the workstation from the network entirely (which may break PACS integration), replacing the hardware, or migrating to a cloud-based PACS.

## Business Associate Obligations in Imaging

The BAA question in imaging is broader than just the radiology group. Consider every vendor or service in the imaging chain:

| Vendor or Service | Business Associate? | BAA Required? |
|-------------------|--------------------|-|
| Radiology group interpreting your studies | Yes | Yes |
| PACS software vendor (if hosted) | Yes | Yes |
| Cloud DICOM archive provider | Yes | Yes |
| On-premise PACS with no cloud component | Depends on contract | Confirm with counsel |
| CD/DVD manufacturer (no PHI access) | No | No |

"Hosted" means the vendor's infrastructure stores or processes your DICOM data. If your PACS is cloud-hosted or if the vendor has remote access to your system for support, they are a business associate.

## In-House Imaging Access Controls

For clinics that operate their own imaging equipment and PACS, the Security Rule requires specific technical safeguards:

**User-specific credentials.** Every staff member who accesses the PACS must have their own login. Shared credentials ("we all use the imaging login") are not compliant. Individual credentials make it possible to produce an audit log that answers who accessed which study and when.

**Audit logging.** The PACS should log access events. Under 45 CFR § 164.312(b), covered entities must implement hardware, software, and procedural mechanisms that record and examine activity in systems that contain ePHI. If your current PACS cannot produce access logs, that is a Security Rule gap.

**Role-based access.** Not every staff member needs access to every patient's imaging history. A billing coordinator who needs to confirm that a study occurred for a claim does not need to open and view the DICOM images. Configure access so that staff see what their role requires — not everything the system contains.

## The Minimum Necessary Standard in Imaging

When sharing imaging studies with consultants or referring providers, the minimum necessary standard (45 CFR § 164.502(b)) applies. If a patient is being referred to a cardiologist for a cardiac evaluation, send the cardiac studies relevant to that referral — not the patient's complete five-year imaging history.

This is a practical protection for the patient and a compliance discipline for the clinic. It limits the volume of PHI in transit, reduces the consequence of a misdirected transmission, and demonstrates that the clinic is applying judgment to disclosures rather than treating bulk transfer as the default.

## Practical Steps for Small Clinic Imaging Programs

A realistic self-audit for a small clinic with in-house imaging should cover these questions:

1. Where are DICOM files stored, and who can access that location? Are permissions applied at the folder or share level?
2. Does the PACS have user-specific logins and access logging enabled?
3. Is there a signed BAA with the radiology group, teleradiology service, and PACS vendor?
4. Are any imaging workstations running operating systems past their end-of-life date? Are they network-connected?
5. Is there a documented process for providing patients with copies of imaging records, including a log of each handoff?
6. Is there a written process for sharing studies with consultants that addresses the minimum necessary standard?

None of these controls require enterprise-grade infrastructure. They require deliberate configuration and documented procedures — the same discipline that applies to every other part of the clinic's PHI program.

Imaging PHI lives in file formats and systems that behave differently than the EHR. Access control, audit logging, BAAs, and the minimum necessary standard must be applied to the imaging environment deliberately, not assumed to carry over from the EHR setup.
