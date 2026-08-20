---
title: "Safe Harbor De-Identification for Small Clinics"
description: "How HIPAA's safe harbor de-identification standard works, what all 18 identifiers are, and why partial de-identification is not the same as de-identification."
metaDescription: "How HIPAA safe harbor de-identification works for small clinics. All 18 identifiers, partial de-identification mistakes, and when data is truly outside HIPAA."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: phi-fundamentals
summary: "HIPAA's safe harbor de-identification standard requires removal or generalization of all 18 specified identifiers from health information. Removing only names while retaining dates, ZIP codes, or age data is not de-identification — the resulting dataset may still constitute PHI. Small clinics using patient data for analytics, research, or quality improvement must meet the full safe harbor standard before treating data as outside HIPAA's scope."
keyTakeaways:
  - "HIPAA's safe harbor standard (45 CFR § 164.514(b)) requires removal or generalization of all 18 identifiers — removing only names is not de-identification"
  - "Dates (except year), ZIP codes smaller than 5-digit level, and ages over 89 are among the 18 identifiers — clinical datasets routinely contain all of them"
  - "A dataset from a small practice where rare diagnoses or small geographic areas allow re-identification remains PHI even with names removed"
  - "De-identified data is outside HIPAA's scope and does not require a BAA — but only if de-identification actually meets the safe harbor standard"
  - "The expert determination method (the alternative to safe harbor) requires a statistical expert to certify that re-identification risk is very small — this is not a DIY process"
author: angel-campa
reviewer: phiguard-compliance-research
intent: consideration
relatedResource: phi-workflow-audit-worksheet
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.514 — Other Requirements Relating to Uses and Disclosures"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
  - title: "HHS De-identification Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
    publisher: "HHS"
---

De-identification is one of the most misunderstood concepts in HIPAA compliance for small clinics. Properly de-identified information is no longer PHI, no longer subject to HIPAA, and doesn't require a BAA when shared with third parties for analytics, research, or quality improvement.

"Properly de-identified" has a specific legal meaning under HIPAA. The informal approach most small clinics take — removing patient names and assuming the rest is fine — doesn't meet the standard.

## Why De-identification Matters for Small Clinics

Small clinics may want to use de-identified data for:
- Population health analytics without running the data through HIPAA's use and disclosure framework
- Quality improvement reporting to a consultant or analytics platform
- Sharing data with a billing analytics service without executing a BAA
- Exporting data to an analytics tool (Tableau, Power BI) without first assessing whether that tool requires a BAA

None of these uses are prohibited — but they're only permissible outside HIPAA's framework if the data is actually de-identified. Sharing data you believe is de-identified but that still contains HIPAA identifiers is an unauthorized disclosure of PHI.

## HIPAA's Two De-identification Methods

HIPAA provides two methods for de-identifying health information (45 CFR §164.514(b)):

**Method 1: Safe Harbor.** Remove or generalize all 18 specified identifiers listed in the regulation. The covered entity must also have no actual knowledge that the remaining information could be used to identify an individual.

**Method 2: Expert Determination.** A qualified statistical or scientific expert applies generally accepted statistical and scientific principles and determines that the risk of identifying an individual is very small. The expert's methodology and analysis are documented.

The safe harbor method is what most covered entities use because it doesn't require a statistical expert. It requires that all 18 identifiers are addressed — not just the obvious ones.

## The 18 Identifiers Under the Safe Harbor Standard

Under 45 CFR §164.514(b)(2)(i), the following 18 categories of information must be removed (or, in some cases, generalized) from the dataset:

1. **Names** — patient names, names of relatives, names of employers
2. **Geographic subdivisions smaller than a state** — including street addresses, cities, counties, and ZIP codes. The exception: first 3 digits of ZIP codes may be retained if the geographic area they represent contains more than 20,000 people (if the area contains fewer than 20,000 people, even the 3-digit ZIP must be removed)
3. **Dates (except year)** — all dates directly related to an individual: dates of service, admission dates, discharge dates, birth dates, death dates
4. **Phone numbers**
5. **Fax numbers**
6. **Email addresses**
7. **Social Security numbers**
8. **Medical record numbers**
9. **Health plan beneficiary numbers**
10. **Account numbers**
11. **Certificate and license numbers**
12. **Vehicle identifiers and serial numbers** — including license plate numbers
13. **Device identifiers and serial numbers**
14. **Web URLs**
15. **IP addresses**
16. **Biometric identifiers** — fingerprints, retinal scans, voiceprints
17. **Full-face photographs and comparable images**
18. **Any other unique identifying number, characteristic, or code** — a catch-all for identifiers not specifically listed above

**And:** Ages over 89 must be aggregated into a single category of "age 90 or older."

## What Clinical Datasets Typically Still Contain After Name Removal

A typical EHR export for a 12-month patient cohort might contain:

| Data element | PHI under HIPAA safe harbor? |
|---|---|
| Patient first and last name | Yes — Identifier #1 |
| Date of birth | Yes — Identifier #3 (dates) |
| City of residence | Yes — Identifier #2 (geographic subdivision smaller than state) |
| ZIP code (full 5-digit) | Yes — Identifier #2 |
| Date of service | Yes — Identifier #3 (dates) |
| Date of diagnosis | Yes — Identifier #3 |
| Phone number | Yes — Identifier #4 |
| Email address | Yes — Identifier #6 |
| Medical record number | Yes — Identifier #8 |
| Insurance account number | Yes — Identifier #10 |
| Age (if over 89) | Yes — must be aggregated |

After removing patient names, 10 other identifiers remain. The dataset is still PHI.

## The Small-Practice Re-identification Problem

The safe harbor standard includes a second requirement beyond removing the 18 identifiers: the covered entity must have no actual knowledge that the remaining information could be used, alone or in combination with other information, to identify an individual.

This requirement is genuinely harder for small practices. A solo practice or small group serving a rural area may have so few patients with a particular rare diagnosis that the combination of diagnosis + year + partial geography is enough to re-identify an individual.

Example: A rural practice has 1,200 patients. Three of them have ALS. A dataset showing year of service, 3-digit ZIP code, age range, and ALS diagnosis — with names removed — may still be enough for anyone familiar with the community to identify those three people.

The safe harbor standard requires that after removing all 18 identifiers, the covered entity has no actual knowledge that re-identification is possible. For small practices with rare-diagnosis patients, this bar may not be reachable without the expert determination method. There's no easy workaround here.

## Common Partial De-identification Mistakes

**Removing names but keeping dates of service.** Service dates are identifier #3 — required to be removed. A dataset with names removed but service dates intact is not de-identified.

**Using "anonymized" ID numbers created from patient data.** If the substitute identifier is a hash of the patient's name, date of birth, or another identifier, the resulting ID may be re-linkable to the original patient — violating identifier #18 (any other unique identifying code). Substitute IDs should be random and not derived from PHI.

**Retaining 5-digit ZIP codes from a small practice's geographic area.** If the practice serves a community where a 5-digit ZIP code represents fewer than 20,000 people, even the first 3 digits may need to be removed.

**Treating a partial export as de-identified because it doesn't contain SSNs or medical record numbers.** The absence of a few identifiers doesn't mean the safe harbor standard is met. All 18 must be addressed.

**De-identifying one dataset but sharing a companion dataset that allows re-linkage.** If you share an "anonymized" clinical dataset and a "separate" administrative dataset that together allow re-identification through a shared record number or date combination, neither dataset is effectively de-identified.

## When De-identification Is and Isn't the Right Approach

**De-identification works well for:**
- Large patient populations where individual re-identification from the remaining data is genuinely unlikely
- Datasets used for broad population-level analysis where individual patient identity is irrelevant to the analysis
- Data contributed to research repositories or registries where the aggregation further reduces re-identification risk

**De-identification is harder or impossible for:**
- Small practices with rare-diagnosis patient populations
- Datasets where service dates are analytically necessary (de-identifying dates significantly reduces the value of temporal analysis)
- Geographic analysis where ZIP-code-level data is the unit of analysis

For most quality improvement and analytics work at small clinics, the better path than attempting de-identification is using a BAA-covered analytics platform and treating the data as PHI. The HIPAA Treatment, Payment, and Healthcare Operations exceptions permit significant analytical use of PHI internally without patient authorization — and BAA coverage for analytics vendors is increasingly standard.

De-identification is worth pursuing when the use case genuinely requires data to be outside HIPAA's framework. Pursuing it to avoid executing a BAA isn't worth the effort — especially when the resulting data often doesn't actually meet the safe harbor standard after a close look.
