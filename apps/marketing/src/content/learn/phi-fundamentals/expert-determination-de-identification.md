---
title: "Expert Determination Method for De-Identifying PHI"
seoTitle: "Expert Determination De-Identification"
description: "The HIPAA expert determination method for de-identifying PHI, what qualifications experts need, what 'very small risk' means, documentation requirements, and when to use it over safe harbor."
metaDescription: "Expert determination is a HIPAA-approved de-identification method under 45 CFR § 164.514(b)(1). A qualified expert certifies that re-identification risk is."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-fundamentals"
schemaType: "defined-term"
term: "Expert Determination Method"
intent: "awareness"
summary: "The expert determination method is one of two HIPAA-approved approaches to de-identifying PHI. Under 45 CFR § 164.514(b)(1), a qualified expert applies generally accepted statistical or scientific principles to certify that the risk of re-identifying any individual is very small. The expert must document their analysis and methods."
keyTakeaways:
  - "Expert determination requires a qualified statistical or scientific expert to certify that re-identification risk is 'very small' — there is no bright-line test."
  - "The expert must document their methods and analysis, and that documentation is retained by the covered entity."
  - "Expert determination preserves more data utility than safe harbor because it does not require removing all 18 identifiers — only those that pose re-identification risk."
  - "For complex datasets or research use cases, expert determination typically produces more useful de-identified data than the safe harbor method."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 164.514(b)(1) — Expert Determination Method"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "HHS / eCFR"
  - title: "Guidance Regarding Methods for De-identification of Protected Health Information"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinical data analyst at our clinic perform the expert determination, or does it require an outside statistician?"
    a: "The regulation does not require the expert to be external, but they must have appropriate knowledge and experience in generally accepted statistical and scientific principles for de-identification. An internal analyst with a statistics or biostatistics background who can demonstrate familiarity with privacy-preserving data analysis techniques may qualify. For high-stakes uses like research publications or large data releases, engaging an external expert with a documented track record is the more defensible approach."
  - q: "How does expert determination handle ZIP codes differently than safe harbor?"
    a: "Safe harbor requires removing all geographic data more specific than the three-digit ZIP code prefix (and even three-digit prefixes must be generalized if the prefix has fewer than 20,000 people). Expert determination does not automatically require removing ZIP codes — the expert analyzes the full dataset and may determine that ZIP codes present very small re-identification risk in context, particularly when combined with other suppressed variables. This makes expert determination more flexible for geographic data analysis."
  - q: "We want to share de-identified patient data with a health IT vendor for analytics. Which method is appropriate?"
    a: "Either method can work. If your dataset is straightforward and removing the 18 safe harbor identifiers leaves sufficient utility for the analytics purpose, safe harbor is simpler and does not require expert involvement. If the analytics require preserving geographic granularity, specific date information, or other elements that safe harbor requires removing, expert determination may preserve more analytical value. The choice depends on the data, the purpose, and the resources available."
---

The expert determination method is one of two HIPAA-approved approaches to de-identifying PHI, established in 45 CFR § 164.514(b)(1). De-identification transforms PHI into health data that HIPAA does not protect — because the data no longer identifies, or cannot reasonably be used to identify, specific individuals. Under the expert determination method, a qualified expert applies generally accepted statistical and scientific principles to certify that re-identification risk is very small, then documents that analysis in writing.

**Small-clinic example:** A 5-provider family medicine practice wants to share patient outcome data with a health IT research partner for quality benchmarking. The dataset includes diagnosis codes, dates of service, and ZIP codes. Safe harbor would require removing the ZIP codes and generalizing the dates — which would reduce the benchmarking value. Instead, the clinic engages a biostatistician who analyzes the dataset, applies k-anonymity techniques to the geographic and demographic variables, and certifies in writing that re-identification risk for the anticipated recipient is very small. The clinic retains the expert's documentation. The dataset retains more analytical value than safe harbor would allow.

## The Two HIPAA-Approved Methods

Under 45 CFR § 164.514(a), health information is de-identified — and no longer PHI — if the covered entity demonstrates it cannot be used to identify an individual by either:

1. **Expert determination** (45 CFR § 164.514(b)(1)) — a qualified expert certifies that re-identification risk is very small
2. **Safe harbor** (45 CFR § 164.514(b)(2)) — all 18 specified identifier categories are removed and no actual knowledge remains that the information could identify an individual

For a detailed discussion of the safe harbor method, see [safe harbor de-identification guide](/learn/phi-fundamentals/safe-harbor-de-identification-guide).

## The Expert Determination Standard

Under 45 CFR § 164.514(b)(1), de-identification by expert determination requires a person with appropriate knowledge of and experience with generally accepted statistical and scientific principles and methods who: applies those principles and methods to determine that the risk is very small that the information could be used, alone or in combination with other reasonably available information, by an anticipated recipient to identify an individual; and documents the methods and results of the analysis.

Four elements define this method.

**1. Qualified expert.** The expert must have appropriate knowledge and experience with statistical and scientific de-identification principles. The regulation does not specify a credential — it requires knowledge and experience. Statisticians, biostatisticians, and data scientists with relevant training and demonstrated experience in health data privacy are typical experts.

**2. Generally accepted principles and methods.** The analysis must apply recognized scientific approaches to privacy risk assessment, not ad hoc techniques. Published standards and methodologies — including those developed by the privacy research community and endorsed by HHS — define what "generally accepted" means in this context.

**3. Very small risk.** This is a risk-based standard, not a zero-risk standard. "Very small" is not defined numerically in the regulation — it requires professional judgment calibrated to the sensitivity of the data and the intended use. HHS guidance indicates that "very small" means the risk is negligible to the anticipated recipient, given both the data characteristics and the reasonably available external information the recipient could use for re-identification.

**4. Documentation.** The expert must document the methods used and the results of the analysis. Your clinic retains this documentation. Without it, your clinic cannot demonstrate compliance if the de-identification is ever challenged.

## What "Very Small Risk" Means in Practice

The "very small risk" standard requires the expert to reason like a motivated adversary — what could an intended recipient do with this data, combined with other reasonably available information, to re-identify individuals?

**Data characteristics.** Are there unusual combinations of variables in the dataset that, even without direct identifiers, point to specific individuals? A dataset containing diagnosis codes, ZIP codes, and birth years for a small rural population may be re-identifiable even without names.

**Intended recipients and their capabilities.** A dataset shared with academic researchers who have no access to external health databases presents different re-identification risk than the same dataset shared with a health insurance company that maintains a large claims database. Expert determination requires assessing risk relative to the reasonably expected recipient.

**Available external data.** What other datasets are publicly available or commercially obtainable that could be joined with this de-identified dataset to re-identify individuals? The growing availability of public demographic data, social media profiles, and commercial data brokers expands the scope of reasonably available re-identification resources.

**Statistical disclosure limitation techniques.** The expert may apply techniques — k-anonymity, l-diversity, data suppression, generalization, or statistical noise — to reduce re-identification risk to the very small threshold. The documentation records which techniques were applied and how they affect the risk assessment.

## Expert Qualifications in Practice

HHS has not established a formal certification process for HIPAA de-identification experts. Recognized experts typically have an advanced degree in statistics, biostatistics, mathematics, or computer science; published work or documented experience in health data privacy and de-identification; familiarity with the published literature on statistical disclosure limitation; and experience applying de-identification techniques to health datasets.

The HHS guidance on de-identification specifically cites academic methodological frameworks that define what "generally accepted principles" means. An expert who believes that removing a patient's name is sufficient for de-identification does not meet the standard.

For high-stakes de-identification — large data releases, research publications, data shared with commercial partners — engaging a recognized external expert is the most defensible approach. For internal analytics with limited distribution, an internal expert with appropriate credentials and a documented process may suffice.

## Expert Determination vs. Safe Harbor

| Dimension | Expert Determination | Safe Harbor |
|-----------|---------------------|-------------|
| Data utility | Higher — can preserve variables that pose low re-identification risk | Lower — requires removing all 18 identifier categories |
| Process complexity | Higher — requires expert analysis and documentation | Lower — remove the list, document no residual knowledge |
| Flexibility | High — expert applies judgment to specific dataset | Low — bright-line removal rules |
| Cost | Higher — requires expert engagement | Lower — can be done without specialized expertise |
| Defensibility | Strong if expert is qualified and methods are documented | Strong if 18 identifiers are comprehensively removed |

**When expert determination is preferred:**

- Your dataset needs to preserve specific variables (ZIP codes, dates, age granularity) for analytical purposes
- The data will be used for research where variable granularity affects scientific validity
- Safe harbor's blunt identifier removal would over-redact and destroy the dataset's utility
- Your clinic needs to certify de-identification status with a formal expert opinion for a contractual or regulatory purpose

**When safe harbor is preferred:**

- Your dataset does not require the variables that safe harbor removes
- Your clinic lacks access to a qualified expert
- The use case is simple and 18-identifier removal leaves sufficient utility
- Speed and administrative simplicity are priorities

## Documentation Requirements

The documentation requirement under 45 CFR § 164.514(b)(1)(ii) is not optional. The expert must document the methods and results of the analysis, and your clinic retains this documentation.

Adequate documentation includes: a description of the dataset structure and population; the expert's credentials and qualifications; the analytical methods applied; the re-identification risk assessment including the recipient profile and external data sources considered; the determination that risk is very small; and any residual risk factors and the basis for concluding they do not exceed the very small threshold.

This documentation is your clinic's evidence that de-identification was performed appropriately. Without it, your clinic cannot demonstrate compliance if questioned by OCR, research sponsors, or data recipients.

## Common Mistakes

**Assuming name removal is sufficient.** Removing a patient's name does not de-identify data. Academic studies have demonstrated that combinations of ZIP code, birthdate, and sex can re-identify a high percentage of individuals in a database. Expert determination requires analysis of the full dataset's re-identification risk.

**Relying on internal review without expert qualifications.** A compliance officer concluding "this looks de-identified" is not expert determination. The expert must have the specific qualifications and apply the specific methods the regulation requires.

**Failing to document.** Expert determination without written documentation is not compliant. The expert opinion must be in writing, retained by your clinic, and available for review.

**Treating de-identification as permanent.** A dataset de-identified at one point in time may become re-identifiable as new external data sources emerge or as the dataset is combined with other data. Covered entities that share de-identified data for commercial or research purposes should consider whether mechanisms exist to limit the data's use if re-identification risk increases.

For a complete framework for managing PHI classification, de-identification, and compliance documentation in your clinic, see [PHIGuard's HIPAA compliance platform](/hipaa).
