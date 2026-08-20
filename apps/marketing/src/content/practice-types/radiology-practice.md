---
title: "PHIGuard for Radiology Practices"
practiceType: "Radiology"
description: "HIPAA compliance management for radiology practices managing DICOM/PACS vendor BAAs, remote reading access controls, secure report delivery, and imaging record retention."
metaDescription: "PHIGuard helps radiology practices track PACS vendor BAAs, document access controls, manage incident response, and meet imaging record retention requirements."
publishedAt: 2026-04-26
updatedAt: 2026-05-02
summary: "Radiology practices and independent imaging centers hold some of the most sensitive and voluminous PHI in healthcare. Diagnostic images linked to patient identifiers, interpreted reports, and remote reading access create compliance obligations that go beyond a standard HIPAA policy binder. PHIGuard provides structured compliance management built for this technical and regulatory environment."
sources:
  - title: "HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html"
    publisher: "HHS Office for Civil Rights"
  - title: "45 CFR Part 164 — Security and Privacy"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164"
    publisher: "eCFR"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/risk-analysis/asset-inventory-for-small-clinics"
verificationDate: 2026-04-26
faq:
  - q: "Does our PACS vendor need a signed BAA?"
    a: "Yes. If your picture archiving and communication system vendor stores, accesses, or transmits diagnostic images and associated patient data on your behalf, they are a business associate under HIPAA. A signed BAA is required before that relationship begins. This applies to cloud-based PACS, on-premises PACS with a vendor-managed maintenance contract, and any teleradiology reading service that accesses your image archive remotely."
  - q: "How do we manage HIPAA compliance when radiologists read from home or remote locations?"
    a: "Remote reading workstations are endpoints that access PHI. The Security Rule requires that you have documented controls for remote access — including authentication requirements, encryption for data in transit, auto-logoff settings, and a policy governing approved devices and network configurations. Your compliance program should document these controls and your workforce training should address them explicitly."
  - q: "Are radiology reports PHI?"
    a: "Yes. A radiology report that contains clinical findings linked to a patient's identity is protected health information. This includes both the report itself and the diagnostic images it interprets. Transmission of reports to referring providers must occur through secure channels, and your report delivery workflow — whether through a portal, encrypted email, or fax — should be documented in your security policies."
  - q: "How long must we retain imaging records?"
    a: "HIPAA requires covered entities to retain records for six years from the date of creation or last effective date. Many states impose longer retention periods for diagnostic imaging records specifically — some require retention for the life of the patient for minors. Your practice should identify the applicable state retention schedule and document it in your compliance program. The schedule should be reviewed when your practice expands into new states."
---

## The Compliance Landscape for Radiology Practices and Imaging Centers

Diagnostic imaging is a PHI-intensive discipline. Every study your practice produces — CT, MRI, X-ray, ultrasound, nuclear medicine — is a file that contains clinical findings, patient identifiers, and in the case of radiographic images, a visual record linked directly to an individual. That combination makes imaging data among the most sensitive categories of PHI in healthcare, and it makes the systems that store and transmit it among the highest-risk assets a covered entity can operate.

Independent radiology groups and outpatient imaging centers may operate as covered entities in their own right, or as business associates of referring physician practices and hospitals, depending on the structure of their relationships. In either case, the Security Rule applies to the electronic PHI they create, receive, maintain, and transmit — and the scope of that obligation is substantial.

The compliance environment for radiology is also technically complex in ways that generic compliance frameworks underestimate. DICOM files are large, structurally specific, and require specialized systems to store and transmit. PACS platforms are core infrastructure, often managed by third-party vendors who are business associates under HIPAA. Teleradiology creates endpoint and network security obligations that extend beyond your physical walls. Record retention rules for imaging studies often extend well beyond HIPAA's six-year minimum under state law.

## Specific HIPAA Challenges for Radiology Practices

**DICOM files and PACS vendors.** Your picture archiving and communication system is the primary repository for your practice's most sensitive PHI. The vendor who provides, maintains, or hosts that system is a business associate under HIPAA. Every version of your BAA with that vendor must be documented, and you must know exactly what the current agreement covers: data at rest, data in transit, breach notification obligations, subcontractor provisions. If your PACS vendor uses cloud infrastructure or outsources any component of their service, their subcontractors become relevant to your compliance program.

**Remote radiologist access.** Teleradiology and remote reading have become standard practice. Radiologists access diagnostic images from home workstations, regional reading centers, or while traveling. Each of those access points is an endpoint that touches PHI. The Security Rule requires documented technical safeguards for remote access — authentication controls, encrypted transmission, session management, and auto-logoff. Your practice needs a documented remote access policy and evidence that staff have been trained on it.

**Secure report delivery to referring providers.** Radiology reports contain clinical interpretations linked to patient identifiers. Delivering those reports to referring physicians, urgent care centers, or emergency departments must occur through channels that meet the Security Rule's transmission security requirements. Fax — the historical default — carries its own risks. Portal-based delivery, encrypted email, and HL7 feeds each have implementation and documentation requirements. Your current report delivery workflow should be reviewed against the Security Rule and documented in your policies.

**Access controls for reading workstations.** The Security Rule requires documented access management — procedures for provisioning access when a radiologist joins your group, modifying access when roles change, and terminating access when someone leaves. In practices without a dedicated IT department, these procedures often exist informally if at all. That is a compliance gap.

**Incident response for unauthorized image archive access.** An imaging archive breach — whether through a compromised credential, a misconfigured PACS, or a ransomware event — affects not just the number of patients impacted but the sensitivity of the data exposed. Diagnostic images can reveal highly sensitive clinical conditions. Your incident response plan should account for the specific breach notification and investigation requirements that apply when imaging data is involved, and your staff should know their roles in that response.

**Record retention for imaging.** HIPAA's six-year retention requirement is a floor, not a ceiling. Many states impose longer retention periods for diagnostic imaging records, and some require retention for the life of the patient for records generated during minority. For practices operating across state lines or serving patients from multiple states, the applicable schedule is not always straightforward. Your compliance program should document the schedule you follow, the basis for it, and when that schedule was last reviewed.

## How PHIGuard Addresses These Challenges

PHIGuard is designed for small and independent specialty practices where the person responsible for HIPAA compliance is also managing day-to-day administrative operations. No dedicated compliance officer or in-house IT team required.

**BAA register with vendor-level tracking.** PHIGuard gives you a structured register for every business associate agreement your practice has on file — your PACS vendor, teleradiology partners, referring provider portal vendors, report delivery services, and any other third party that accesses your PHI. For each vendor, you record the agreement date, version, scope, expiration, and key contact. PHIGuard alerts you when agreements approach expiration and flags relationships where no signed BAA is on file. When you evaluate a new vendor, a PHIGuard task ensures the BAA is in place before PHI flows.

**Compliance task management and documentation.** PHIGuard structures your compliance calendar: annual risk analysis, security policy reviews, access control audits, workforce training cycles, BAA reviews, and retention schedule reviews. Each task is assigned to an owner with a due date and tracked through completion. Overdue items are flagged. If HHS or a state agency asks for evidence of your compliance program, you have a documented record — not a binder assembled under pressure.

**Asset inventory integration.** Your compliance program should begin with a documented inventory of the systems and devices that create, store, or transmit PHI. PHIGuard supports this by giving you a structured place to document your PHI asset inventory — PACS systems, reading workstations, report delivery systems, and remote access infrastructure — and to link compliance tasks to specific assets. When a PACS vendor releases a security update or when a reading workstation configuration changes, the relevant compliance tasks are traceable to that asset.

**Staff training tracking.** Assign training tasks by role — separate tracks for reading radiologists, front desk staff, and billing personnel. Remote reading staff need training that specifically addresses endpoint security, VPN policies, and approved device configurations. PHIGuard lets you assign role-specific training tasks and track completion with an immutable audit record.

**Incident logging and response tracking.** When a potential security incident occurs — an unauthorized access attempt, a lost or stolen device with image data, a PACS misconfiguration — PHIGuard's incident log helps you document the event, track the investigation steps, record the outcome, and log the corrective actions taken. That documentation is required under the Security Rule's incident response provisions and is essential if the incident meets the threshold for breach notification.

**Policy documentation with version control.** Upload your security and privacy policies to PHIGuard. When policies are updated to reflect a new remote access procedure or a revised retention schedule, the update is timestamped and the prior version is preserved. Staff acknowledgment of updated policies is tracked as individual tasks.

An independent radiology practice managing its HIPAA compliance through email threads and paper binders carries real risk. The technical complexity of imaging infrastructure — PACS vendors, remote reading endpoints, DICOM de-identification — raises that risk above most other practice settings. [Start a free trial at phiguard.app](/pricing) or take our [HIPAA compliance self-assessment](/resources/hipaa-compliance-self-assessment) to benchmark your current program.

For guidance on building a PHI asset inventory that covers your PACS, reading workstations, and report delivery systems, see: [Asset Inventory for Small Clinics](/learn/risk-analysis/asset-inventory-for-small-clinics).
