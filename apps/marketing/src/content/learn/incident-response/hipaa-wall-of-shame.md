---
title: "The HIPAA Wall of Shame: What the HHS Breach Portal Shows"
seoTitle: "HIPAA Wall of Shame Explained"
description: "The HHS OCR breach portal lists every HIPAA breach affecting 500 or more individuals. This article explains what the wall of shame shows, how to read it, and how to use breach data to prioritize your own security controls."
metaDescription: "HIPAA wall of shame explained: what the HHS OCR breach portal shows, how breach type categories work, and how to use public breach data to reduce your..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: incident-response
intent: awareness
schemaType: article
summary: "The HHS OCR breach notification portal — known informally as the HIPAA wall of shame — publicly lists every reported breach affecting 500 or more individuals. Understanding what the portal shows, how to read breach type categories, and what enforcement patterns look like helps small clinics prioritize their own security investments."
keyTakeaways:
  - "The HHS OCR breach portal lists all reported breaches affecting 500 or more individuals. It is publicly searchable and updated regularly."
  - "Breach types in the portal include hacking/IT incidents, unauthorized access or disclosure, theft, loss, and improper disposal. Hacking dominates recent years."
  - "Breaches affecting fewer than 500 individuals are reported annually to HHS but are not listed publicly on the portal."
  - "The breach portal is a practical risk prioritization tool — it shows which breach types and attack vectors are most common in practices similar to yours."
sources:
  - title: "HHS OCR Breach Portal"
    url: "https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf"
    publisher: "HHS"
  - title: "Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
faq:
  - q: "What is the HIPAA wall of shame?"
    a: "The HIPAA wall of shame is an informal name for the HHS Office for Civil Rights breach notification portal. It publicly lists every reported HIPAA breach affecting 500 or more individuals, including the covered entity's name, the number of individuals affected, the type of breach, and the location of breached information."
  - q: "Does the portal list small breaches affecting fewer than 500 people?"
    a: "No. Breaches affecting fewer than 500 individuals must be reported to HHS annually but are not listed on the public portal. Only large breaches (500 or more individuals) appear on the searchable portal."
  - q: "How long do breaches stay on the portal?"
    a: "HHS maintains an archive of breaches under investigation and breaches that have been resolved. Both categories are searchable on the portal. Resolved breaches remain visible in the archive."
  - q: "Can a clinic's appearance on the wall of shame trigger an OCR investigation?"
    a: "Yes. Reporting a breach affecting 500 or more individuals triggers an OCR investigation of the covered entity. The portal listing and the investigation are concurrent processes."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

The HHS Office for Civil Rights maintains a public database of HIPAA breaches. Within the compliance community it has a blunt nickname: the wall of shame. Any covered entity that experiences a breach affecting 500 or more individuals ends up there — name, breach date, number of patients affected, breach type, and location of the information involved. The list is publicly searchable and regularly updated.

Understanding what the portal shows — and how to read it — gives small clinics a practical tool for understanding real breach patterns and prioritizing their own security investments.

## What the Breach Notification Rule requires

The Breach Notification Rule at 45 CFR Part 164, Subpart D, requires covered entities to notify affected individuals, HHS, and in some cases the media when a breach of unsecured PHI occurs. A breach is an impermissible acquisition, access, use, or disclosure of PHI that compromises its security or privacy — unless the covered entity can demonstrate through a four-factor risk assessment that there is a low probability the PHI was compromised.

The reporting timeline depends on the number of individuals affected:

- **500 or more individuals in a state or jurisdiction:** The covered entity must notify HHS and local media within 60 days of discovering the breach. These breaches are posted to the public portal.
- **Fewer than 500 individuals:** The covered entity must notify HHS within 60 days after the end of the calendar year in which the breaches were discovered. These are not listed publicly.
- **All breaches:** Affected individuals must be notified within 60 days of discovery, regardless of breach size.

The public portal — formally called the HHS Breach Portal at ocrportal.hhs.gov — is the output of the large-breach reporting process.

## How to use the breach portal

The portal is searchable at ocrportal.hhs.gov/ocr/breach/breach_report.jsf. The main search interface lets you filter by:

- **State** — narrow to breaches reported by covered entities in your state
- **Type of covered entity** — healthcare provider, health plan, or healthcare clearinghouse
- **Individuals affected** — filter by breach size
- **Date range** — filter by submission date

Each listing shows:

- Name of the covered entity
- State
- Covered entity type
- Number of individuals affected
- Breach submission date
- Type of breach (see below)
- Location of breached information
- Business associate present (yes/no)
- Web description (a short summary of the breach, sometimes added during investigation)

The portal maintains two views: **cases under investigation** (current breaches) and **cases currently reviewed or closed** (archived breaches). Both are searchable.

## The breach type categories

The portal classifies each breach into one or more type categories. Understanding these categories is essential for using the data to inform your own risk posture.

### Hacking/IT incident

This category covers unauthorized access to systems by external threat actors — ransomware, phishing-triggered network compromises, email account takeovers, and exploitation of software vulnerabilities. It includes attacks by both outside actors and malicious insiders using technical methods.

Hacking/IT incidents have become the dominant breach type by volume of individuals affected. Large ransomware attacks on hospitals and health systems affect millions of patients and skew the total numbers dramatically. For small clinics, the most common hacking vectors are:

- Phishing emails that capture staff credentials and allow access to email or EHR systems
- Ransomware delivered via phishing or exposed remote desktop connections
- Exploitation of unpatched software vulnerabilities

### Unauthorized access/disclosure

This category covers situations where PHI was accessed or disclosed without authorization — without a technical attack. Examples include:

- Staff accessing records of patients they are not treating (snooping)
- PHI mailed or faxed to the wrong recipient
- PHI included in documents visible to unauthorized parties
- Misconfigured systems that exposed PHI to unauthorized users

For small clinics, this is the most operationally underappreciated category. Employee curiosity about high-profile patients, ex-partner records, or family members' records generates real breach events.

### Theft

Theft covers situations where physical media or devices containing PHI are stolen — laptops, portable hard drives, USB drives, paper records, smartphones. Theft of unencrypted laptops was the dominant breach type in the early years of the portal.

Encryption essentially eliminates theft as a reportable breach category for electronic PHI. A stolen, encrypted laptop does not meet the definition of a breach if the encryption key is not compromised. This is one of the clearest return-on-investment arguments for full-disk encryption on all clinic devices.

### Loss

Loss is similar to theft but covers situations where devices or records go missing without confirmed theft. A laptop left on a plane, a portable drive that cannot be located, or paper records that were not received by the intended recipient all fall here.

The practical controls are identical to theft prevention: encryption for electronic devices, minimal physical PHI outside secure areas, and documented device inventory.

### Improper disposal

Improper disposal covers PHI that was discarded without proper destruction — paper records placed in regular trash, hard drives sold or donated without wiping, or other situations where PHI becomes accessible through disposal channels.

This category has declined significantly as covered entities have adopted document shredding services and media sanitization practices. It still appears for clinics that close without a proper records disposition plan.

## What enforcement patterns show

Breaches that appear on the portal trigger OCR investigations. OCR may close the investigation with no findings, issue a corrective action plan, or impose civil money penalties.

Several patterns are consistent across enforcement actions:

**Missing or inadequate risk analysis.** OCR consistently cites failure to conduct a thorough risk analysis as a root cause finding across all breach types. Covered entities that cannot demonstrate they identified and addressed the risk vector that led to the breach face heightened scrutiny.

**Missing or inadequate access controls.** Unauthorized access breaches often reveal that access controls were too permissive — staff had access to PHI they did not need, or ex-employees retained system access after termination.

**Missing encryption.** Theft and loss breaches involving unencrypted devices consistently lead to enforcement findings. Covered entities that implement full-disk encryption on portable devices largely eliminate this breach category and the associated enforcement exposure.

**Missing or expired BAAs.** Breaches involving business associates often expose missing BAAs or BAAs that lacked required elements.

**Delayed reporting.** OCR enforces the 60-day notification deadline seriously. Breaches reported outside the deadline face separate findings independent of the underlying breach.

## Using the portal for risk prioritization

The breach portal is more than a list of other organizations' failures. It is a dataset that shows which threats are actually materializing across organizations similar to yours.

**Search by state.** Breaches in your state involving similar-sized healthcare providers show you which threat actors and breach vectors are active in your region. Ransomware groups often target geographic clusters.

**Search by covered entity type.** Healthcare providers (the category most small clinics fall into) show different breach patterns than health plans. Filter to your category for the most relevant benchmarking.

**Look at business associate involvement.** When "business associate present: Yes" appears, the breach involved a vendor who had PHI access. These cases illustrate the downstream consequences of inadequate BAA management and vendor security oversight.

**Look at information location.** The portal records where the breached PHI was located — email, network server, laptop, paper records, portable electronic device. This field directly maps to the safeguards your risk analysis should address.

**Use trends over time.** The shift from theft (2010s) to hacking (2020s) as the dominant breach type reflects threat evolution. Security investments that made sense a decade ago may not address current threat patterns. The portal provides the empirical basis for updating your threat model.

## The investigation that follows a large breach

When a covered entity reports a breach affecting 500 or more individuals, OCR opens an investigation. The investigation is not optional and is not contingent on whether the covered entity appears negligent. It is a standard consequence of the reporting obligation.

OCR investigations examine:

- The covered entity's risk analysis and risk management program
- Policies and procedures related to the breach type
- Workforce training records
- BAA documentation for any involved business associates
- The breach response process — containment, investigation, notification timeline

The investigation may close with a determination of no HIPAA violation, a corrective action plan requiring specific compliance improvements, or a resolution agreement with monetary settlement. OCR makes resolution agreements and civil money penalty decisions publicly available on the HHS enforcement website.

The practical implication for small clinics: appearing on the wall of shame is not just a reputational event. It initiates a structured regulatory process that will examine every aspect of your compliance program. The best preparation for that process is having a defensible compliance program before a breach occurs.
