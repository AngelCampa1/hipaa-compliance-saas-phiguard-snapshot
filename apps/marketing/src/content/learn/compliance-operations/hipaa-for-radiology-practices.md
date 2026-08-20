---
title: "HIPAA Compliance for Radiology Practices"
seoTitle: "HIPAA for Radiology"
description: "Radiology practices face HIPAA exposure that general medical clinics rarely encounter: DICOM metadata, PACS access, and teleradiology data flowing across facility boundaries. This guide walks practice administrators through the specific risks and controls that matter."
metaDescription: "HIPAA compliance guide for radiology practices: DICOM PHI, PACS access controls, teleradiology BAAs, AI read tools, and a practical checklist."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Radiology practices handle PHI in forms most compliance checklists ignore - DICOM headers, PACS audit logs, prior-study transfers, and AI-assisted read tools. This guide covers the HIPAA obligations that practice administrators at imaging centers and reading groups need to understand. It helps clinics turn HIPAA requirements into assigned owners, recurring reviews, dated evidence, and practical controls that can be explained during an OCR inquiry."
keyTakeaways:
  - "DICOM image metadata is PHI and must be protected with the same controls as any other identifier."
  - "Teleradiology arrangements require BAAs in both directions when radiologists read for outside facilities."
  - "AI-assisted read tools that process images on behalf of the practice are business associates and need a signed BAA."
  - "PACS access logs are part of your audit trail under Section  164.312(b) and must be retained and reviewable."
  - "Prior-study transfers between facilities are disclosures and must follow the minimum necessary standard."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR Parts 160-164 - HIPAA"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA for Professionals"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Is DICOM metadata considered PHI?"
    a: "Yes. DICOM headers routinely contain patient name, date of birth, medical record number, and study identifiers - all of which are PHI under 45 CFR 160.103. Image pixel data combined with these identifiers is PHI even when the image alone might not be."
  - q: "Do we need a BAA with the hospital we read for?"
    a: "If you are reading studies as an independent radiology group on behalf of a hospital, the relationship is typically governed by a BAA where the hospital is the covered entity and your group is the business associate. Confirm the direction with your counsel based on who originated the patient encounter."
  - q: "Are AI-assisted read tools business associates?"
    a: "If the AI vendor processes PHI on your behalf - including images that contain DICOM identifiers - they are a business associate and a BAA is required before any production use."
---

Radiology practices sit at an awkward seam in the healthcare system. You receive PHI from referring providers, store it in PACS, transmit it to radiologists who may be hundreds of miles away, and increasingly route it through AI tools that flag findings before a human reads the study. Every one of those steps is a HIPAA exposure point that a generic compliance checklist will miss.

This guide is written for practice administrators at imaging centers, hospital-based reading groups, and independent radiology practices. It assumes you are a covered entity or a business associate and focuses on the controls that matter for diagnostic imaging.

## Why radiology has unique HIPAA exposure

Most HIPAA guidance assumes a clinical encounter that produces a chart note. Radiology produces imaging studies - large binary objects with embedded identifiers, transmitted across facility boundaries, often read by radiologists who are not employees of the originating facility. That structure creates four exposure patterns that primary care practices do not face:

1. PHI lives inside file metadata, not just in a database column. DICOM headers carry patient name, MRN, date of birth, accession number, and referring physician.
2. Studies are routinely shared between unrelated covered entities for second opinions and prior comparison.
3. Reading radiologists are often contracted, not employed, which creates a business associate relationship.
4. AI vendors increasingly sit in the read pipeline, processing images before a human sees them.

Each of these requires a deliberate compliance control. None are optional.

## Top HIPAA risks for radiology practices

The risks below are the ones that most consistently show up in OCR enforcement actions and in compliance reviews of imaging practices.

- PACS accounts shared between technologists. A single shared login defeats the audit trail required by Section  164.312(b).
- DICOM studies emailed to referring providers without encryption. SMTP without TLS is not acceptable for PHI in transit.
- Teleradiology contractors reading from home networks without endpoint controls or VPN.
- Prior studies pulled from outside facilities without documenting the disclosure.
- AI-assisted read tools deployed in a pilot before a BAA is signed.
- Marketing or case-study images that have not been fully de-identified per Section  164.514(b). Burned-in pixel annotations and DICOM headers must both be addressed.
- Loss or theft of portable imaging media (CDs, USB) handed to patients without encryption.
- Modality workstations left logged in between exams in a shared room.

## Vendor and BAA checklist for radiology

Every radiology practice should have current BAAs with each of the following vendor categories where they handle PHI:

- PACS and VNA (vendor neutral archive) hosting providers.
- RIS (radiology information system) vendor.
- Teleradiology reading services and individual contracted radiologists.
- Image-sharing networks used to transfer priors between facilities.
- AI-assisted read tools and CAD vendors that process images.
- Cloud storage providers used for backups or DR.
- Transcription services that convert dictated reports to text.
- Patient portal and results-delivery vendors.
- IT managed service providers with access to imaging infrastructure.
- Secure messaging platforms used to communicate with referring providers.

Confirm that each BAA addresses subcontractor flow-down, breach notification timelines, and termination obligations including return or destruction of PHI.

## State law overlays affecting radiology

State law layers on top of HIPAA in ways that matter for imaging practices. Several states require breach notification on shorter timelines than the federal 60-day window. Some states classify imaging records as a distinct category of medical record with its own retention period - often longer than HIPAA's six-year minimum for compliance documentation. Mammography records have their own federal retention requirement under the Mammography Quality Standards Act that is separate from HIPAA.

If your practice reads studies across state lines, you are subject to the patient-state breach notification law, not the radiologist-state law. This matters for teleradiology groups that read nationally.

## HIPAA compliance checklist for radiology

1. Inventory every system that stores or transmits DICOM data, including modalities, PACS, VNA, teleradiology routers, and AI tools.
2. Require unique user accounts on every PACS and modality workstation. Eliminate shared logins.
3. Enable and review PACS access logs at least monthly for unusual access patterns.
4. Sign or refresh BAAs with every reading radiologist not directly employed by the practice.
5. Sign a BAA with every AI-assisted read vendor before any production use, including pilots.
6. Encrypt all DICOM transfers in transit, including image sharing with outside facilities and CDs given to patients.
7. Document every prior-study request from an outside facility as a disclosure, including the requester, purpose, and minimum necessary scope.
8. Establish a de-identification procedure for any image used in marketing, teaching files, or case studies. Address both DICOM headers and burned-in pixel annotations.
9. Train technologists on the difference between treatment disclosures (no authorization needed) and marketing or research uses (authorization required).
10. Maintain an incident response runbook that addresses both PACS outages and suspected unauthorized access events.

For a deeper look at the broader compliance program these controls fit into, see [our compliance operations library](/learn/compliance-operations) and [the radiology practice type page](/practice-types/radiology-practice). To understand how PHIGuard supports HIPAA programs without enterprise pricing, see [our HIPAA overview](/hipaa).
