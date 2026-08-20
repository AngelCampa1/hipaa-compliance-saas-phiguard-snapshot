---
title: "HIPAA Compliance for Massachusetts Clinics: Federal and State Requirements"
seoTitle: "HIPAA Compliance for Massachusetts Clinics"
description: "Massachusetts clinics must meet HIPAA plus 201 CMR 17.00 (Written Information Security Plan, encryption), MGL c. 93H (30-day breach notification), and mental health records protections under MGL c. 123. Practical compliance guide."
metaDescription: "Massachusetts clinics face HIPAA plus 201 CMR 17.00 WISP requirement, MGL c. 93H 30-day breach notice, and MGL c. 123 mental health rules."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "Massachusetts clinics must comply with HIPAA and state law that is stricter in several areas: 201 CMR 17.00 requires a Written Information Security Plan and mandatory encryption of portable devices, MGL c. 93H requires breach notification within 30 days, and MGL c. 123 § 36 imposes strict confidentiality rules on mental health records beyond HIPAA."
keyTakeaways:
  - "201 CMR 17.00 requires every business handling personal information of Massachusetts residents to maintain a Written Information Security Plan (WISP) — a specific document HIPAA does not explicitly require."
  - "201 CMR 17.00 mandates encryption of personal information stored on portable devices and transmitted over public networks — aligning with but more explicitly stated than HIPAA's addressable encryption requirements."
  - "MGL c. 93H requires breach notification to affected Massachusetts residents and the AG within 30 days of discovering a breach — stricter than HIPAA's 60-day maximum."
  - "MGL c. 123 § 36 imposes strict confidentiality on mental health records, requiring specific written consent for most disclosures that HIPAA would permit without explicit authorization."
  - "Non-compliance with 201 CMR 17.00 can result in civil enforcement by the Massachusetts AG independent of OCR action."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "201 CMR 17.00 — Standards for the Protection of Personal Information"
    url: "https://www.mass.gov/regulations/201-CMR-1700-standards-for-the-protection-of-personal-information-of-residents-of-the-commonwealth"
    publisher: "Massachusetts Office of Consumer Affairs"
  - title: "Massachusetts General Laws c. 93H — Security Breaches"
    url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXV/Chapter93H"
    publisher: "Massachusetts Legislature"
  - title: "Massachusetts General Laws c. 123 § 36 — Mental Health Records"
    url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXVII/Chapter123/Section36"
    publisher: "Massachusetts Legislature"
  - title: "45 CFR Parts 160 and 164 — HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
faq:
  - q: "What is a Written Information Security Plan and why does Massachusetts require it?"
    a: "A WISP is a formal written document describing the administrative, technical, and physical safeguards a business uses to protect personal information. 201 CMR 17.03 requires every business that owns, licenses, stores, or maintains personal information of Massachusetts residents to maintain a comprehensive WISP. While HIPAA requires covered entities to implement written policies and procedures addressing security safeguards, it does not use the WISP terminology or require a single consolidated document. Massachusetts law is more prescriptive about the form of documentation."
  - q: "Does Massachusetts's encryption requirement go beyond HIPAA?"
    a: "HIPAA's Security Rule lists encryption as an addressable specification, meaning a covered entity can choose not to encrypt if it documents an equivalent alternative measure. 201 CMR 17.04 requires encryption as a specific obligation — not an addressable implementation specification — for personal information stored on portable devices and transmitted over public networks. For Massachusetts clinics, encryption of laptops, tablets, USB drives, and data in transit is mandatory, not optional."
  - q: "What is Massachusetts's breach notification deadline?"
    a: "Under MGL c. 93H § 3, a person or entity that knows or has reason to know that personal information of a Massachusetts resident was acquired or used by an unauthorized person must notify the affected residents and the Massachusetts AG as soon as reasonably possible and without unreasonable delay. Guidance from the Massachusetts AG's office has interpreted this to mean within 30 days of discovery. HIPAA's Breach Notification Rule allows up to 60 days."
---

Massachusetts imposes data security obligations that go beyond HIPAA in concrete, measurable ways. Your clinic must meet the federal HIPAA baseline and then satisfy 201 CMR 17.00's Written Information Security Plan requirement, mandatory encryption for portable devices, and a 30-day breach notification deadline — none of which your HIPAA program covers on its own.

This guide covers the HIPAA foundation every Massachusetts covered entity must maintain, then addresses 201 CMR 17.00's Written Information Security Plan and encryption requirements, the 30-day breach notification obligation under MGL c. 93H, and mental health records confidentiality under MGL c. 123 § 36. For a detailed comparison, see [Massachusetts 201 CMR 17 vs HIPAA](/learn/compliance-operations/massachusetts-data-security-vs-hipaa).

## The HIPAA Baseline for Massachusetts Clinics

Any Massachusetts clinic that transmits health information electronically in connection with HIPAA-covered transactions is a covered entity subject to the Privacy Rule, Security Rule, and Breach Notification Rule. The Security Rule's administrative safeguards at 45 CFR § 164.308 require a risk analysis, risk management program, workforce training, contingency planning, and access management procedures. The Security Rule's technical safeguards at 45 CFR § 164.312 require access controls, audit controls, integrity controls, and transmission security. See [HIPAA administrative safeguards](/learn/compliance-operations/hipaa-administrative-safeguards) for detail.

Every Massachusetts clinic subject to HIPAA also needs Business Associate Agreements with vendors who handle PHI — see [how small clinics track vendor BAAs](/learn/compliance-operations/how-small-clinics-track-vendor-baas) for a practical approach to managing that requirement.

Where Massachusetts law is stricter than HIPAA, the state standard applies. HIPAA's preemption provision at 45 CFR § 160.203 preserves state laws that are more protective of patient rights.

## 201 CMR 17.00: The Written Information Security Plan

Massachusetts adopted 201 CMR 17.00 — Standards for the Protection of Personal Information of Residents of the Commonwealth — effective March 1, 2010. It applies to every person or entity that owns, licenses, stores, or maintains personal information about Massachusetts residents in connection with providing a product or service. Medical clinics handling patient data clearly fall within scope.

### What personal information means under 201 CMR 17.00

The regulation protects personal information — a Massachusetts resident's first name and last name, or first initial and last name, combined with any of the following unencrypted: Social Security number, driver's license or state ID number, financial account numbers, or medical or health insurance information. Health and medical information in a patient record qualifies.

### The WISP requirement: 201 CMR 17.03

Every covered business must "develop, implement, maintain and monitor" a comprehensive Written Information Security Plan. The WISP must be tailored to the size, scope, and type of the business and the information stored. At minimum, the WISP must:

- Identify the employees responsible for maintaining the security program;
- Identify and assess risks to the personal information covered;
- Establish policies and procedures for employee handling of personal information;
- Provide for security monitoring of the program;
- Review and update the plan regularly.

HIPAA requires covered entities to implement written policies and procedures addressing security and privacy. However, HIPAA does not require those policies to be consolidated into a single WISP document with the specific elements 201 CMR 17.03 describes. Massachusetts clinics must create and maintain a WISP as a distinct compliance document — not merely a collection of HIPAA policies.

### What the WISP must address for a typical small clinic

A compliant WISP for a small Massachusetts clinic should include:

**Scope and ownership.** Name the person responsible for information security, even if it is a part-time role at a small practice. Identify what personal information the clinic holds and where it is stored — EHR, billing system, paper records, email.

**Risk assessment.** Describe the process for identifying risks to personal information and how risks are evaluated. This aligns with HIPAA's § 164.308(a)(1) risk analysis but goes further by requiring documentation in the WISP itself.

**Employee management.** Describe the training program, access controls, and what happens when an employee departs. Document disciplinary procedures for security violations.

**Physical security.** Describe controls for paper records, server rooms, and portable devices.

**Technical security.** Describe authentication, access controls, logging, and encryption — matching and extending the HIPAA Security Rule implementation specifications.

**Vendor oversight.** Describe how the clinic manages third-party access to personal information. This overlaps with HIPAA's Business Associate Agreement requirement.

**Incident response.** Describe the procedure for detecting, responding to, and reporting a security incident. This section must be consistent with the breach notification requirements under MGL c. 93H.

### Encryption requirements: 201 CMR 17.04

201 CMR 17.04(6) requires that all transmitted personal information be encrypted. 201 CMR 17.04(5) requires reasonable encryption of personal information stored on portable devices. Unlike HIPAA's Security Rule — which lists encryption as an addressable specification that covered entities may decline to implement if they document an equivalent alternative — the Massachusetts regulation treats encryption as a mandatory control for portable devices and network transmission.

For a small clinic, this means:

- Laptops and tablets used for patient data must be encrypted;
- USB drives and external hard drives holding personal information must be encrypted;
- Email transmission of personal information must be encrypted;
- Data transmitted over public Wi-Fi must be encrypted.

This is not a decision point as it is under HIPAA — it is a legal obligation in Massachusetts. If your clinic opted out of encrypting portable devices by documenting a HIPAA-equivalent alternative, that decision does not satisfy Massachusetts law. Encrypt the devices.

## Massachusetts Breach Notification: MGL c. 93H

MGL c. 93H — Massachusetts's data security breach law — requires any person or entity that knows or has reason to know that personal information of a Massachusetts resident was acquired or used by an unauthorized person, or that the security of personal information was compromised, to notify:

- All affected Massachusetts residents, and
- The Massachusetts Attorney General.

### The 30-day standard

The statute requires notification "as soon as reasonably possible and without unreasonable delay." The Massachusetts AG's office has consistently interpreted this to mean within 30 days of discovery. HIPAA's Breach Notification Rule permits covered entities up to 60 days. For Massachusetts clinics, the 30-day standard governs.

### Notification content

The AG's guidance specifies that breach notifications must include:

- A description of what happened, including the date of the breach and the date of discovery;
- A description of the types of personal information involved;
- Steps taken to protect against further unauthorized access;
- Steps affected individuals can take to protect themselves;
- Contact information for a person or office the individual may contact for more information.

This content overlaps with HIPAA's breach notification content requirements (45 CFR § 164.404(c)) but is not identical. Clinics should maintain a Massachusetts-compliant notification template that satisfies both frameworks. See [HIPAA breach notification templates](/learn/compliance-operations/hipaa-breach-notification-templates) for a baseline to adapt.

### AG notification

The Attorney General notification must be made in writing to the Consumer Protection Division of the Massachusetts AG's office. This is an additional obligation beyond HIPAA's requirement to notify HHS for breaches affecting 500 or more individuals. Massachusetts requires AG notification for any breach of Massachusetts residents' personal information — there is no minimum threshold in the statute.

## Mental Health Records: MGL c. 123 § 36

Massachusetts General Laws c. 123 § 36 governs the confidentiality of records of individuals who receive services for mental illness or substance use disorder from facilities licensed or operated under MGL c. 123. The law applies to records held by DMH-licensed and DMH-operated facilities, and its principles have been interpreted broadly in practice.

### What the statute restricts

Under MGL c. 123 § 36, records of current or former patients are confidential and may not be disclosed without:

- The patient's written consent;
- A court order;
- Statutory exceptions for treatment continuity, public health reporting, or emergency situations.

The statute is more restrictive than HIPAA's general framework for health information. HIPAA permits covered entities to use and disclose PHI for treatment, payment, and healthcare operations without patient authorization. For Massachusetts mental health records governed by c. 123 § 36, many of those disclosures require specific written consent.

### Practical impact for clinics providing mental health services

Clinics that provide mental health treatment — directly or through an integrated behavioral health program — must maintain separate authorization procedures for mental health records. Specifically:

- Billing for mental health services to insurers may require a separate authorization under c. 123 § 36, not just HIPAA-compliant claims submission;
- Sending mental health records to another treating provider may require specific written consent rather than a general treatment-purpose disclosure;
- Disclosures to employers, schools, or agencies not directly involved in treatment are more restricted than for general medical records.

Clinics should consult Massachusetts counsel when implementing policies for mental health records disclosure, particularly where the facility provides both medical and mental health services and records may be integrated in the EHR.

## Four Action Items for Massachusetts Clinics

**1. Draft and adopt a Written Information Security Plan.** If your clinic does not have a standalone WISP document, create one that meets 201 CMR 17.03's requirements. This is a distinct compliance obligation, not satisfied by having a collection of HIPAA security policies. Use the [HIPAA risk analysis worksheet](/resources/hipaa-risk-analysis-template) to inform the risk assessment section.

**2. Verify encryption of all portable devices and transmissions.** Inventory every laptop, tablet, mobile device, and external storage device used for patient or personal data. Confirm encryption is enabled and documented. Confirm that email and other transmission of personal information is encrypted. Correct any gaps — Massachusetts does not accept the HIPAA addressable-specification rationale for not encrypting.

**3. Update your breach response procedure to the 30-day Massachusetts standard.** Review your incident response and breach notification procedure. Replace any reference to HIPAA's 60-day maximum with a 30-day target. Add a step for AG notification for any breach involving Massachusetts residents' personal information, regardless of the number of individuals affected. Adapt a notification template that satisfies both Massachusetts and HIPAA content requirements.

**4. Review mental health records authorization procedures.** If your clinic provides any mental health services, audit the authorization forms and disclosure procedures for mental health records. Confirm they meet MGL c. 123 § 36 requirements, not just HIPAA's general authorization framework. When in doubt, require specific written consent for mental health record disclosures.

## Ongoing Compliance in Massachusetts

Massachusetts's compliance environment is actively enforced. The AG's Data Privacy Division has pursued investigations and enforcement actions against businesses that failed to implement required security measures or provide timely breach notifications. Small medical clinics are not immune from AG attention.

PHIGuard supports Massachusetts clinics with HIPAA compliance management, policy documentation, vendor BAA tracking, and incident response — with current plan and BAA details available during plan review. See [PHIGuard HIPAA](/hipaa) or review [pricing](/pricing).
