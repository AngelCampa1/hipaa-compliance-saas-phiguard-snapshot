---
title: "Virginia CDPA vs. HIPAA: Key Differences for Virginia Clinics"
seoTitle: "Virginia CDPA vs HIPAA: Key Differences"
description: "Detailed comparison of the Virginia Consumer Data Protection Act (§ 59.1-575) and HIPAA — entity scope, consumer rights, sensitive data categories, data protection assessments, opt-out rights, and AG enforcement for Virginia clinics."
metaDescription: "Virginia CDPA (§ 59.1-575) vs HIPAA: entity scope, consumer rights, sensitive data, data protection assessments. Key differences for Virginia clinics."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
legacyPaths:
  - "/learn/compliance-operations/virginia-cdpa-vs-hipaa"
  - "/guides/virginia-cdpa-vs-hipaa"
  - "/resources/guides/virginia-cdpa-vs-hipaa"
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "The Virginia CDPA (Code of Va. § 59.1-575) and HIPAA operate in parallel. HIPAA-covered PHI is largely exempt from the CDPA, but health data collected outside the clinical treatment relationship — from wellness apps, scheduling tools, or consumer digital services — may be subject to CDPA requirements including sensitive data consent, consumer rights, and data protection assessments."
keyTakeaways:
  - "The Virginia CDPA exempts HIPAA-covered PHI — core clinical patient records at a covered entity clinic are outside the CDPA's scope."
  - "CDPA covers health diagnoses and mental health treatment information as sensitive personal data — processing requires consumer consent when CDPA applies."
  - "Consumer rights under the CDPA (access, correction, deletion, portability, opt-out) apply to health data outside the HIPAA exemption — such as data from consumer-facing apps."
  - "Data protection assessments are required under the CDPA for processing sensitive data, including health diagnoses, outside the HIPAA-covered framework."
  - "Virginia AG has exclusive enforcement authority — no private right of action — with penalties up to $7,500 per willful violation and a 30-day cure period."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "Virginia Consumer Data Protection Act (Code of Va. § 59.1-575 et seq.)"
    url: "https://law.lis.virginia.gov/vacode/title59.1/chapter53/"
    publisher: "Virginia General Assembly"
  - title: "Virginia AG CDPA Guidance"
    url: "https://www.oag.state.va.us/consumer-protection/"
    publisher: "Virginia Office of the Attorney General"
  - title: "45 CFR Parts 160 and 164 — HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
faq:
  - q: "Does the Virginia CDPA apply to a clinic's HIPAA patient records?"
    a: "No. Code of Va. § 59.1-578(A)(2) exempts HIPAA-covered entities from CDPA obligations to the extent the personal data is PHI governed by HIPAA. Clinical patient records at a covered entity are outside the CDPA's scope. The CDPA applies to health data the clinic collects outside the HIPAA-covered treatment relationship — from wellness apps, consumer-facing tools, or individuals who are not the clinic's patients."
  - q: "What are data protection assessments under the Virginia CDPA?"
    a: "Code of Va. § 59.1-580 requires controllers to conduct and document data protection assessments for processing activities presenting heightened risk, including processing sensitive personal data such as health diagnoses and mental health treatment information. If a Virginia clinic processes health data subject to the CDPA, it must document a risk assessment for those specific processing activities before beginning."
  - q: "What is the penalty structure under the Virginia CDPA?"
    a: "The Virginia AG may impose civil penalties of up to $7,500 per willful violation under the CDPA. There is no private right of action — only the AG can bring a CDPA enforcement action. Before filing suit, the AG must give the business a 30-day period to cure the alleged violation, if curable."
---

The Virginia Consumer Data Protection Act (CDPA, effective January 1, 2023) adds a new compliance layer for Virginia clinics. Most core clinical operations are covered by HIPAA and exempt from the CDPA, but digital health tools and consumer-facing services that fall outside HIPAA's scope bring CDPA obligations into play — and the exemption boundary is not always obvious.

This article provides a detailed comparison of the CDPA and HIPAA across the dimensions most relevant to clinical operations: entity scope, data subject rights, sensitive data categories, data protection assessments, opt-out rights, and enforcement.

## Entity Scope

### HIPAA coverage

HIPAA's Privacy and Security Rules apply to covered entities — health plans, healthcare clearinghouses, and healthcare providers who transmit health information electronically in connection with HIPAA-covered transactions. Business associates of covered entities have direct liability under HITECH.

### Virginia CDPA coverage

The CDPA applies to any entity that conducts business in Virginia or produces products or services targeted to Virginia residents, and that during a calendar year either:

- Controls or processes the personal data of at least 100,000 Virginia consumers; or
- Controls or processes the personal data of at least 25,000 Virginia consumers and derives over 50% of gross revenue from the sale of personal data.

The CDPA uses a different threshold structure than HIPAA. A small clinic that treats fewer than 100,000 patients per year may not meet the CDPA's processing threshold for its clinical records at all — and even if it does, the HIPAA exemption removes clinical PHI from CDPA scope.

The practical CDPA exposure for Virginia clinics is in digital health tools, consumer-facing services, and non-patient data collection that falls outside the HIPAA-covered framework.

## The HIPAA Exemption

Code of Va. § 59.1-578(A)(2) exempts from the CDPA:

- HIPAA-covered entities to the extent they are collecting, creating, maintaining, using, or disclosing personal data in compliance with HIPAA;
- Business associates of covered entities for data handled under HIPAA BAAs;
- Protected health information as defined under HIPAA maintained by covered entities and business associates.

This exemption is specific to PHI and the covered entity's HIPAA-governed activities. It does not shield all data a clinic touches. Areas where the CDPA may apply despite the clinic being a HIPAA-covered entity:

**Consumer wellness programs.** A clinic operating a consumer wellness app or health coaching service for individuals outside the formal patient relationship is collecting data outside HIPAA's scope. That data is not PHI under HIPAA and is not protected by the HIPAA exemption.

**Pre-patient data collection.** Scheduling tools, symptom checkers, or consumer health portals that collect health information before a formal treatment relationship begins may be collecting data that is not yet PHI under HIPAA. That data may be subject to CDPA requirements.

**Website analytics.** Marketing or analytics tools on a clinic's public website that associate browsing behavior with health conditions — for example, a visitor to a specific specialty care page — may be collecting health data outside the HIPAA framework.

**Non-covered entity activities.** If a clinic also operates a business line that does not involve healthcare — a fitness center, spa, or other consumer service — health data collected there is outside the HIPAA exemption.

## Definition of Sensitive Data

### HIPAA's PHI definition

HIPAA protects individually identifiable health information — information relating to a person's physical or mental health condition, the provision of health care, or payment for health care, when it identifies or could identify the person. PHI includes a broad range of clinical data from diagnosis codes to appointment dates when linked to an individual.

### CDPA's sensitive personal data definition

The CDPA defines sensitive personal data to include:

- Personal data revealing racial or ethnic origin, religious beliefs, **mental or physical health diagnosis**, sexual orientation, or citizenship/immigration status;
- **Genetic and biometric data** processed for uniquely identifying an individual;
- Personal data of a known child;
- Precise geolocation data.

Health diagnoses and mental health treatment information are expressly identified as sensitive data under the CDPA. Processing sensitive data requires obtaining the consumer's affirmative opt-in consent.

The CDPA's sensitive data definition and HIPAA's PHI definition are not coextensive. There is substantial overlap — health diagnoses are both PHI and CDPA sensitive data. But the CDPA's sensitive data concept operates differently: it triggers consent requirements rather than defining the universe of protected information.

## Consumer Rights Under the CDPA

### HIPAA patient rights

HIPAA gives patients specific rights: the right to access their PHI (45 CFR § 164.524), the right to request amendments (45 CFR § 164.526), the right to an accounting of disclosures (45 CFR § 164.528), and the right to request restrictions on certain uses and disclosures (45 CFR § 164.522). HIPAA does not give patients a general right to delete their records — providers are not required to delete clinical records because the patient requests it.

### CDPA consumer rights

For personal data subject to the CDPA (i.e., health data outside the HIPAA exemption), Virginia consumers have the right to:

**Access.** Confirm whether the controller is processing their personal data and receive a copy of it. The controller must respond within 45 days, extendable by another 45 days with notice.

**Correction.** Correct inaccuracies in personal data. The controller must correct inaccurate data upon request.

**Deletion.** Request deletion of personal data the consumer provided or that was collected about the consumer. The controller must honor deletion requests for personal data not subject to a retention obligation.

**Portability.** Obtain a portable copy of personal data the consumer previously provided, in a commonly used and technically feasible format.

**Opt-out.** Opt out of targeted advertising, sale of personal data, and profiling for decisions that produce legal or significant effects.

For sensitive data — including health diagnoses — the CDPA requires affirmative opt-in consent rather than just opt-out rights. A clinic collecting health diagnosis information outside the HIPAA framework must obtain consent before beginning collection, not merely offer an opt-out after the fact.

### How CDPA rights differ from HIPAA rights

The CDPA's deletion right has no equivalent in HIPAA. The portability right is broader than HIPAA's access right (HIPAA does not require portability in a specific machine-readable format in all cases). The opt-in consent requirement for sensitive data is more protective than HIPAA's authorization requirements for many uses.

The practical difference is that CDPA consumer rights are designed for a data economy context — they assume individuals are consumers interacting with controllers on commercial terms. HIPAA rights are designed for a patient-provider relationship. When health data is collected in a consumer context outside the treatment relationship, the CDPA's rights framework may be more appropriate than HIPAA's patient rights provisions.

## Data Protection Assessments

### HIPAA risk analysis

HIPAA's Security Rule at 45 CFR § 164.308(a)(1) requires covered entities to conduct and document a risk analysis identifying threats and vulnerabilities to electronic PHI, assess the likelihood and impact of those risks, and implement measures to manage them. This is an ongoing obligation — the risk analysis must be reviewed and updated periodically.

### CDPA data protection assessments

Code of Va. § 59.1-580 requires controllers to conduct and document a data protection assessment before processing activities that present heightened risk, including:

- Processing sensitive personal data (health diagnoses, mental health treatment, genetic data, and other categories);
- Targeted advertising or profiling using personal data;
- Sale of personal data.

A CDPA data protection assessment is a prospective document created before the processing activity begins. It must identify and evaluate the benefits of the processing, the risks to consumers, and the safeguards in place to address those risks. The assessment must be available to the AG upon request.

A HIPAA risk analysis is broader in scope (covering all electronic PHI security risks) and ongoing in nature. A CDPA data protection assessment is narrower (specific processing activities) but prospective and required before processing begins.

Virginia clinics that process health data outside the HIPAA framework — and that meet the CDPA's thresholds — must create and document CDPA data protection assessments for those processing activities.

## Opt-Out Rights

### HIPAA and authorization

HIPAA requires patient authorization for most uses and disclosures of PHI beyond treatment, payment, and healthcare operations. Certain uses — like marketing and research — require specific authorization. HIPAA does not give patients a general opt-out right from all processing of their PHI.

### CDPA opt-out and opt-in rights

For personal data subject to the CDPA:

- Consumers may opt out of targeted advertising, sale of their data, and profiling.
- For sensitive data (health diagnoses, mental health treatment), the controller must obtain affirmative opt-in consent before processing — there is no opt-out without prior opt-in.

The practical implication for Virginia clinics: any digital tool that collects health diagnosis information from Virginia consumers outside the HIPAA framework must obtain affirmative consent before collecting, not simply provide an opt-out link.

## Enforcement: Virginia AG

The Virginia AG has exclusive authority to enforce the CDPA under Code of Va. § 59.1-584. There is no private right of action — Virginia consumers cannot sue controllers directly for CDPA violations.

The AG may seek:

- Injunctive relief requiring the controller to comply;
- Civil penalties up to $7,500 per willful violation.

Before initiating a civil action, the AG must notify the controller and provide 30 days to cure the alleged violation (if curable). Cure means actually correcting the violation, not just committing to do so in the future.

AG enforcement is separate from and concurrent with OCR enforcement. A Virginia clinic can face both CDPA enforcement by the AG and HIPAA enforcement by OCR for related conduct — the two enforcement tracks proceed independently.

## Practical Guidance for Virginia Clinics

**Audit your digital health tools.** Identify every digital service that collects health information from Virginia individuals: scheduling tools, patient portals, wellness apps, website chat functions, and marketing analytics. Classify each as either (a) within the HIPAA-covered treatment relationship and CDPA-exempt, or (b) outside HIPAA's scope and potentially subject to the CDPA.

**Implement consent mechanisms for sensitive data.** For any digital tool collecting health diagnoses or mental health treatment information from Virginia consumers outside the HIPAA framework, implement affirmative opt-in consent before collection. Document the consent mechanism and the consent records.

**Conduct data protection assessments.** For each processing activity involving sensitive health data outside the HIPAA framework, create and document a CDPA data protection assessment before beginning or continuing the processing activity.

**Build a consumer rights response capability.** Implement a mechanism for Virginia consumers to exercise CDPA access, correction, deletion, portability, and opt-out rights for any data subject to the CDPA. Respond within 45 days.

**Use the HIPAA risk analysis as a foundation.** The [HIPAA risk analysis worksheet](/resources/hipaa-risk-analysis-template) covers the PHI-related risks. Add a section for CDPA-specific risks: health data outside HIPAA, consumer consent records, and data protection assessment documentation.

See [HIPAA administrative safeguards](/learn/compliance-operations/hipaa-administrative-safeguards) for the federal baseline that supports overall compliance and see [how small clinics track vendor BAAs](/learn/compliance-operations/how-small-clinics-track-vendor-baas) for managing the vendor side of both HIPAA and CDPA obligations.

PHIGuard helps Virginia clinics manage HIPAA compliance, policy documentation, and vendor BAA tracking — with current plan and BAA details available during plan review. Visit [PHIGuard HIPAA](/hipaa) or review [pricing](/pricing).
