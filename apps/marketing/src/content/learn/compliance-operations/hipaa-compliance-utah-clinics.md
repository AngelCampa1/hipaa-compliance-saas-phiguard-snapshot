---
title: "HIPAA Compliance for Utah Medical Clinics"
seoTitle: "HIPAA Compliance for Utah Clinics"
description: "Utah clinics must comply with HIPAA plus the Utah Code Ann. Section 13-44-202 breach notification requirement within 30 days, the Utah Health Data Authority Act governing health data reporting, and the Utah Behavioral Health Integration Act for mental health and substance use records. The Utah Consumer Privacy Act applies to larger businesses but provides important context for small clinic data practices."
metaDescription: "HIPAA compliance for Utah clinics: breach notification, behavioral health records, UCPA context, vendor evidence, and practical action steps."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Utah medical clinics must meet HIPAA requirements and Utah's 30-day breach notification deadline under Utah Code Ann. Section 13-44-202 - half of HIPAA's 60-day window. The Utah Behavioral Health Integration Act imposes specific record-handling requirements for mental health and substance use records that go beyond HIPAA's psychotherapy note protections."
keyTakeaways:
  - "Utah Code Ann. Section 13-44-202 requires breach notification to affected Utah residents within 30 days of discovering a breach - half the time HIPAA's Breach Notification Rule allows."
  - "Utah AG enforces breach notification violations; non-compliance with Section 13-44-202 can result in civil penalties under the Utah Consumer Sales Practices Act."
  - "Behavioral health and integrated care clinics must follow Utah Behavioral Health Integration Act requirements for mental health and substance use records - stricter than HIPAA's psychotherapy note provisions."
  - "The Utah Consumer Privacy Act (UCPA, Utah Code Section 13-61-101 et seq.) does not apply to most small clinics due to $25M annual revenue thresholds, but establishes expectations for health data handling that may influence AG enforcement posture."
  - "Utah clinics must maintain a documented security program and update incident response plans to reflect the 30-day notification deadline under Section 13-44-202."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "Utah Protection of Personal Information Act - Utah Code Ann. Section 13-44-101 et seq."
    url: "https://le.utah.gov/xcode/Title13/Chapter44/13-44.html"
    publisher: "Utah State Legislature"
  - title: "Utah Consumer Privacy Act - Utah Code Section 13-61-101 et seq."
    url: "https://le.utah.gov/xcode/Title13/Chapter61/13-61.html"
    publisher: "Utah State Legislature"
  - title: "Utah Health Data Authority Act - Utah Code Section 26B-8-101 et seq."
    url: "https://le.utah.gov/xcode/Title26B/Chapter8/26B-8.html"
    publisher: "Utah State Legislature"
  - title: "45 CFR Parts 160 and 164 - HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
faq:
  - q: "What is Utah's breach notification deadline for medical clinics?"
    a: "Under Utah Code Ann. Section 13-44-202, any person who owns, licenses, or maintains computerized data that includes personal information - which includes medical information - must notify each affected Utah resident in the most expedient time possible and without unreasonable delay, but no later than 30 calendar days after the person determines that a breach of security occurred. This is tighter than HIPAA's Breach Notification Rule, which allows up to 60 days from discovery. Utah clinics must treat the 30-day deadline as the governing standard for notification to Utah residents. The Utah AG must be notified when a breach affects 500 or more Utah residents."
  - q: "Does the Utah Consumer Privacy Act apply to small medical clinics?"
    a: "The Utah Consumer Privacy Act (UCPA, Utah Code Section 13-61-101 et seq.) applies to businesses that conduct business in Utah or produce products or services targeted to Utah residents AND meet at least one threshold: annual revenues exceeding $25 million, OR controlling or processing personal data of 100,000 or more Utah consumers annually, OR deriving more than 50% of gross revenue from the sale of personal data and processing data of 25,000 or more consumers. Most small medical clinics (3-50 staff) will not meet these thresholds. The UCPA also exempts data governed by HIPAA when handled by HIPAA-covered entities. However, health data collected outside of HIPAA-covered transactions - such as data from non-clinical apps, wellness programs, or patient portal data that falls outside covered transactions - may be subject to UCPA scrutiny as Utah's enforcement matures."
  - q: "What does the Utah Behavioral Health Integration Act require for mental health records?"
    a: "The Utah Behavioral Health Integration Act addresses the handling of mental health and substance use disorder records in integrated care settings - where a clinic provides or coordinates both physical and behavioral health services. The Act establishes consent-based requirements for sharing behavioral health records with other treating providers and restricts re-disclosure of behavioral health information beyond the treating care team. These requirements supplement HIPAA's psychotherapy note protections (45 CFR Section 164.508(a)(2)) and may require clinics operating integrated care programs to implement separate authorization workflows for behavioral health records even within the treating team."
---

Utah medical clinics face a deceptively simple-looking compliance environment: HIPAA at the federal level, with two key Utah-specific additions. The first is a 30-day breach notification deadline under Utah Code Ann. Section 13-44-202 - half of HIPAA's 60-day window. The second is behavioral health record handling requirements under the Utah Behavioral Health Integration Act that apply to clinics providing or coordinating mental health or substance use treatment. The Utah Consumer Privacy Act is largely outside the scope of small clinic operations but provides useful context.

## Short Answer

Utah clinics must comply with HIPAA and Utah's Protection of Personal Information Act, which sets a 30-day breach notification deadline for affected Utah residents. Behavioral health and integrated care clinics face additional record-handling requirements under the Utah Behavioral Health Integration Act. The Utah Consumer Privacy Act does not apply to most small clinics due to revenue and data-volume thresholds, but clinics should understand the landscape. The Utah AG enforces breach notification violations.

## Utah Health Privacy Law Overview

**Utah Protection of Personal Information Act (Utah Code Ann. Section 13-44-101 et seq.)** establishes Utah's data security and breach notification requirements. The Act defines personal information broadly to include medical information and health insurance information. It requires businesses that maintain personal information about Utah residents to implement reasonable security procedures and to provide timely breach notification. Healthcare providers are subject to the Act as data collectors.

**Utah Consumer Privacy Act (UCPA, Utah Code Section 13-61-101 et seq.)** is Utah's comprehensive consumer privacy law, effective December 31, 2023. The UCPA establishes consumer rights over personal data, including health data, but applies only to businesses meeting specific size thresholds. For businesses that fall within UCPA scope, health data is a category of sensitive data subject to heightened requirements. The UCPA expressly exempts data governed by HIPAA when handled by HIPAA-covered entities in their covered-entity capacity.

**Utah Health Data Authority Act (Utah Code Section 26B-8-101 et seq.)** governs Utah's statewide health data reporting infrastructure and the collection and use of health data by the Utah Health Data Committee. The Act affects how clinics report encounter and claims data to the state health data system. Clinics required to submit data to Utah's all-payer claims database have obligations under this Act beyond their HIPAA compliance program.

**Utah Behavioral Health Integration Act** addresses mental health and substance use records in integrated care environments. As Utah has expanded Medicaid and encouraged physical-behavioral health integration, this Act governs how behavioral health records are shared, disclosed, and used in integrated care arrangements.

## Key Differences: Utah Law vs. HIPAA

| Requirement | HIPAA Standard | Utah Standard |
|---|---|---|
| Breach notification to individuals | Within 60 days of discovery | Within 30 days of discovery (Utah Code Section 13-44-202) |
| AG/regulator notification | OCR within 60 days (breaches of 500+) | Utah AG notification for breaches of 500+ Utah residents |
| Behavioral health records | Psychotherapy notes require specific authorization | Behavioral Health Integration Act adds consent requirements for integrated care settings |
| UCPA scope | N/A | Does not apply to most small clinics; PHI under HIPAA is exempt |
| Private right of action | None | None under Section 13-44 - AG enforcement is primary mechanism |
| Encrypted data safe harbor | Breach of encrypted data still requires investigation | Encrypted breached data may not trigger notification under Section 13-44-202 if key was not compromised |

The encrypted data safe harbor in Utah law is the same incentive structure as Nevada: if the breached data was encrypted and the encryption key was not compromised, the notification obligation may not be triggered. This creates a direct legal incentive to encrypt all PHI at rest and in transit.

## AG Enforcement in Utah

The Utah Attorney General enforces the Protection of Personal Information Act. The AG has authority to investigate data security failures and breach notification violations. Enforcement can result in civil penalties under the Utah Consumer Sales Practices Act, which the AG uses as the enforcement vehicle for data security violations.

Key enforcement features:

- **30-day deadline is firm:** The statute's "most expedient time possible" language means the AG can scrutinize a delay even within the 30-day window if the facts of the breach would have allowed faster notification.
- **Security program requirement:** The Act requires "reasonable security procedures" appropriate to the size and nature of the business and the personal information involved. Clinics without documented security programs face additional exposure in any AG investigation.
- **500-resident AG notification threshold:** Breaches affecting fewer than 500 Utah residents still require individual notification but may not require AG notification. Breaches of 500+ Utah residents require AG notification within the same 30-day window.
- **No private right of action:** Enforcement is AG-driven. Individual patients cannot sue under Utah Code Section 13-44 directly, though civil claims under other legal theories remain possible.

## 5 Action Items for Utah Clinics

**1. Reset your breach notification timeline to 30 days.** Update your incident response plan to treat 30 calendar days from breach discovery as the notification deadline for Utah residents. If your current plan is built around HIPAA's 60-day framework, revise it. Map your investigation, scope assessment, and notification drafting milestones against the 30-day window. Build in time for legal review of the notification content before sending.

**2. Assess your behavioral health record handling.** If your clinic provides mental health services, substance use treatment, or participates in integrated care arrangements, evaluate whether the Utah Behavioral Health Integration Act affects your record-sharing practices. The Act's consent requirements for behavioral health records in integrated settings go beyond HIPAA's psychotherapy note provisions. Implement separate authorization workflows if needed and train staff who handle behavioral health records on the distinction between standard HIPAA TPO disclosures and the Act's requirements.

**3. Implement and document full encryption for PHI.** Utah's encrypted data safe harbor reduces notification obligation risk when encrypted data is breached and the key was not compromised. Ensure your EHR system, backups, mobile devices, and any portable media use full encryption. Document the encryption implementation as part of your security program. The HIPAA Security Rule makes encryption an addressable specification - Utah law provides a concrete risk-reduction reason to treat it as required.

**4. Add Utah AG notification to your breach response checklist.** When a breach involves 500 or more Utah residents, AG notification is required within the 30-day window. Include AG notification as a step in your incident response checklist, alongside OCR notification. Locate the AG's Consumer Protection Division breach notification process before a breach occurs - navigating a new regulatory notification process under time pressure increases error risk.

**5. Document your security program before you need it.** A written security program - covering risk analysis, administrative safeguards, technical safeguards, and workforce training - is required under both HIPAA and Utah's reasonable security standard. The [HIPAA compliance self-assessment](/resources/hipaa-compliance-self-assessment) provides a structured starting point. The [HIPAA Privacy Rule overview](/learn/hipaa-basics/hipaa-privacy-rule-explained) covers the federal foundation. Update your risk analysis annually and whenever you change vendors, add systems, or expand services. Regulators evaluate your security program documentation when investigating any breach.

PHIGuard supports Utah clinics in maintaining the audit trails, policy documentation, and incident response infrastructure that HIPAA and Utah Code Section 13-44 require - at current plan and BAA details available during plan review. See [PHIGuard's HIPAA compliance tools](/hipaa) or browse the [compliance operations hub](/learn/compliance-operations) for related guidance.

## Frequently Asked Questions
