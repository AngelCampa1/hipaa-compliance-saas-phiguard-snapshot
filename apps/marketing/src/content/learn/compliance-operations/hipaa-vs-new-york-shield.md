---
title: "HIPAA vs the New York SHIELD Act"
description: "New York clinics are subject to both HIPAA and the NY SHIELD Act. This article explains how the two frameworks differ on breach notification, data security requirements, and what NY clinics must do when the state law is stricter."
metaDescription: "HIPAA vs NY SHIELD Act: what New York clinics need to know about breach notification timelines, state-specific obligations, and how the two laws interact."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: compliance-operations
schemaType: article
intent: awareness
summary: "New York clinics covered by HIPAA are also subject to the NY SHIELD Act, which extends data security and breach notification obligations beyond HIPAA's scope. The stricter requirement controls — and for NY clinics, that often means SHIELD Act breach notification requirements govern."
keyTakeaways:
  - "The NY SHIELD Act (NY Gen. Bus. Law § 899-bb) applies to any business that handles private information about New York residents — including healthcare providers already covered by HIPAA."
  - "SHIELD Act's breach definition and notification requirements may be triggered by incidents that don't meet HIPAA's four-factor breach test."
  - "SHIELD Act requires notification to the NY Attorney General's office for breaches affecting 500 or more New York residents — a HIPAA obligation that OCR handles separately."
  - "Healthcare providers in New York must run breach incidents through both HIPAA and SHIELD Act analyses to determine which notification obligations apply."
  - "The SHIELD Act's 'reasonable security' standard is less prescriptive than HIPAA's Security Rule — but healthcare providers using HIPAA's framework generally satisfy the SHIELD Act security standard."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-evidence-binder-checklist
relatedCommercialPath: /pricing
sources:
  - title: "NY SHIELD Act — NY General Business Law § 899-bb"
    url: "https://www.nysenate.gov/legislation/laws/GBS/899-BB"
    publisher: "NY State Senate"
  - title: "HIPAA Breach Notification Rule — 45 CFR § 164.400-414"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D"
    publisher: "eCFR"
  - title: "NY Attorney General — Data Security"
    url: "https://www.nysenate.gov/legislation/laws/GBS/899-BB"
    publisher: "NY Attorney General"
faq:
  - q: "If we comply with HIPAA, do we automatically comply with the NY SHIELD Act?"
    a: "Not necessarily. HIPAA compliance addresses most of SHIELD Act's security requirements, but the breach notification obligations differ. A HIPAA-compliant clinic must still run breach incidents through the SHIELD Act analysis to determine if NY-specific notification obligations apply."
  - q: "Does the NY SHIELD Act apply to our clinic if we are headquartered outside New York but treat NY patients?"
    a: "Yes. The SHIELD Act applies to any business that owns, licenses, or maintains private information about New York residents — regardless of where the business is located. A clinic in New Jersey that treats NY patients and holds their health records is subject to the SHIELD Act."
  - q: "What is 'private information' under the NY SHIELD Act?"
    a: "The SHIELD Act defines private information as certain data element combinations that can identify a person and create risk if disclosed — including name plus financial account information, biometric data, health information, and more. Healthcare PHI generally qualifies."
---

New York healthcare providers operate under two overlapping compliance frameworks: HIPAA (federal) and the New York SHIELD Act (state). An incident that does not trigger HIPAA's federal notification obligations may still trigger SHIELD Act obligations — and the timelines are different.

## What the NY SHIELD Act Is

The Stop Hacks and Improve Electronic Data Security Act (SHIELD Act), signed into law in 2019, expanded New York's data breach notification law and added affirmative data security requirements. The law has two parts:

**Expanded breach notification:** The SHIELD Act amended New York's breach notification law (NY General Business Law § 899-aa) to broaden the definition of a breach, expand the types of data covered, and add notification requirements beyond what the original law required.

**Reasonable security standard:** The SHIELD Act added NY General Business Law § 899-bb, which requires businesses that own, license, or maintain private information of New York residents to implement reasonable safeguards to protect it.

## Who the SHIELD Act Covers

Unlike HIPAA, which applies specifically to covered entities in the healthcare industry, the SHIELD Act applies broadly: any person or business that owns, licenses, or maintains private information about New York residents is subject to its breach notification and security requirements.

This means:
- Healthcare providers covered by HIPAA are also subject to the SHIELD Act
- Healthcare providers NOT covered by HIPAA (some wellness businesses, non-covered health-adjacent services) are still subject to the SHIELD Act if they hold private information about NY residents
- Out-of-state businesses that maintain records of NY residents are subject to the SHIELD Act

## Key Differences: Breach Notification

### HIPAA Breach Notification

HIPAA requires covered entities to notify affected individuals, OCR, and (for large breaches) media when a breach of unsecured PHI occurs. Under HIPAA, a "breach" is defined using the four-factor risk assessment. An incident is not a reportable breach if the covered entity can demonstrate low probability that PHI was compromised.

**HIPAA notification timeline:** Individual notice within 60 days of discovering the breach. OCR notice: within 60 days for breaches affecting 500 or more individuals in a state; annually by March 1 for smaller breaches.

### NY SHIELD Act Breach Notification

The SHIELD Act uses a different breach definition and triggers:

**Definition of breach under SHIELD Act:** Unauthorized access to private information that compromises the security, confidentiality, or integrity of the information. The SHIELD Act does not use HIPAA's four-factor risk assessment. Its threshold is broader — an incident that passes HIPAA's low-probability-of-compromise test may still constitute a breach under NY's definition.

**Notification under SHIELD Act:** When a breach occurs:
- **Affected individuals** must be notified "in the most expedient time possible and without unreasonable delay." NY's standard is among the fastest in the country, shorter than HIPAA's 60-day window.
- **NY Attorney General's office** must be notified for breaches affecting 500+ NY residents. This is a direct obligation to the state AG, separate from HIPAA's OCR notification.
- **Three major credit reporting agencies** must be notified if the breach affects 5,000 or more NY residents
- **State-specific agencies** (NYDFS for financial entities, NY Department of Health for health information) may have additional notification requirements

### The Practical Interaction

| Scenario | HIPAA Requires | SHIELD Act Requires |
|---|---|---|
| Breach of ePHI affecting 200 NY patients | Individual notice + annual OCR report | Individual notice (expeditiously) + AG notice |
| Incident involving health data not meeting HIPAA's four-factor test | No notification required | May still require notification under SHIELD Act |
| Breach affecting 1,000 NY residents | Individual + OCR + media notice | Individual + AG notice |

A NY clinic that runs a breach incident through HIPAA's analysis and concludes "not reportable" must still run the same incident through the SHIELD Act analysis. Stopping at the HIPAA conclusion is the compliance gap.

## Security Requirements: How They Interact

The SHIELD Act requires businesses to implement "reasonable safeguards" to protect private information. For small businesses, the law provides a simplified standard: reasonable security based on the size and complexity of the business. Larger organizations must meet more comprehensive requirements.

The SHIELD Act includes a compliance safe harbor: a covered entity under HIPAA that maintains a security program consistent with those regulations is "deemed to be in compliance" with the SHIELD Act's reasonable security standard (§ 899-bb(2)(c)). NY clinics running a functional HIPAA Security Rule program — risk analysis, written policies, workforce training, access controls — satisfy the SHIELD Act's security standard automatically.

The breach notification obligations are not covered by that safe harbor. HIPAA compliance does not eliminate NY's distinct notification requirements.

## What NY Clinics Should Do

1. **Apply both frameworks to breach incidents.** When a security incident occurs, run it through HIPAA's four-factor breach assessment and NY's SHIELD Act breach definition separately.

2. **Build SHIELD Act notification into the incident response plan.** The incident response procedure should include: if the incident triggers SHIELD Act obligations, notify the NY AG's office and individuals on NY's timeline (typically shorter than HIPAA's 60-day window).

3. **Maintain HIPAA-level security.** The HIPAA Security Rule program satisfies the SHIELD Act's security standard. No separate security program is required.

4. **Consult NY-specific legal guidance for multi-state incidents.** A breach affecting patients from multiple states may trigger different state notification requirements for each state. NY's is among the most demanding.

5. **Know the NY AG's reporting portal.** The NY AG's office has a breach notification reporting mechanism. Know where it is before you need it.

NY clinics can manage HIPAA and SHIELD Act compliance within a single program. The critical piece is breach response: the procedure must explicitly account for both frameworks' notification obligations, including the NY AG notification step that HIPAA does not require.

For New York-specific operational guidance, see [HIPAA compliance for New York clinics](/learn/compliance-operations/hipaa-compliance-new-york-clinics) and [state AG HIPAA enforcement: New York](/learn/compliance-operations/state-ag-hipaa-enforcement-new-york). Practices operating across multiple states should review the [HIPAA multi-state practice compliance guide](/learn/compliance-operations/hipaa-multi-state-practice-compliance-guide).
