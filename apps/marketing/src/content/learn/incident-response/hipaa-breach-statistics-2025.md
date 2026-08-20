---
title: "HIPAA Breach Statistics 2025: Patterns Every Clinic Admin Should Know"
seoTitle: "HIPAA Breach Statistics 2025"
description: "Annual patterns from the HHS OCR breach portal show consistent trends: hacking and ransomware dominate large breaches, business associates carry upstream risk to covered entities, and small practices are not protected by their size."
metaDescription: "HIPAA breach statistics 2025: breach type trends from the OCR portal, what small clinics can learn from large breach patterns, and where prevention..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: incident-response
intent: awareness
schemaType: article
summary: "The HHS OCR breach portal publishes data on breaches affecting 500 or more individuals. Persistent patterns across multiple reporting years reveal where HIPAA breaches occur, how they are caused, and what that means for small clinic risk management. Readers should consult the current portal for updated numbers."
keyTakeaways:
  - "Hacking and IT incidents consistently account for the majority of breached records in the OCR portal data — ransomware is a primary vector."
  - "Business associate incidents frequently affect multiple downstream covered entities, multiplying the impact of a single compromise."
  - "Breaches affecting fewer than 500 individuals are reported annually but not publicly listed — small practices still face OCR scrutiny for small breaches."
  - "Healthcare has led most sectors in reported data breach incidents for more than a decade, making proactive compliance an insurance against a known-high risk."
  - "The breach type distribution tells clinics where prevention resources have the most return: access controls, workforce training, and BA oversight."
sources:
  - title: "HHS OCR Breach Portal"
    url: "https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf"
    publisher: "HHS"
  - title: "Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
faq:
  - q: "Where can I find current HIPAA breach statistics?"
    a: "The HHS OCR Breach Portal at ocrportal.hhs.gov publishes all reported breaches affecting 500 or more individuals. The portal is searchable by entity type, state, breach type, and date range. Aggregate statistics on breach counts and affected individuals are updated regularly. Check the portal directly for current numbers — the article you are reading presents patterns, not live counts."
  - q: "Do small clinics appear on the OCR breach portal?"
    a: "Breaches affecting 500 or more individuals must be reported to OCR within 60 days and are publicly listed. Breaches affecting fewer than 500 individuals must be reported to OCR on an annual basis but are not publicly listed. A small clinic with a breach affecting 200 patients does not appear on the public portal — but OCR still receives the report and can open an investigation."
  - q: "Why does healthcare have so many data breaches compared to other sectors?"
    a: "Healthcare records are highly valuable on criminal markets because they contain a combination of financial identifiers (insurance information, Social Security numbers), personal health information usable for fraud, and contact information. Healthcare organizations also tend to operate older systems with longer patch cycles, creating more attack surface. Regulatory requirements — unlike many other sectors — mandate that breaches be reported, making healthcare data more visible in breach statistics than in industries with weaker reporting requirements."
  - q: "What is the most common cause of HIPAA breaches in small practices?"
    a: "For small practices specifically, unauthorized access by workforce members (snooping), phishing attacks leading to credential theft, and improperly disposed paper or electronic records are frequently cited breach causes. Large-scale ransomware attacks that dominate the headlines for large health systems also affect small practices, often through their smaller IT footprint and less mature security configurations."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

The HHS Office for Civil Rights publishes every reported breach affecting 500 or more individuals on its publicly accessible breach portal. Often called the "Wall of Shame," the portal is updated regularly and contains searchable records going back to 2009.

The number is large and growing. The patterns it reveals have remained consistent for years: hacking and IT incidents drive the largest breaches, business associates create upstream exposure for covered entities, and the scale of incidents affecting healthcare far outpaces what many small clinic operators assume is normal risk for their practice size.

Checking the current portal for live data matters — this article presents structural patterns, not a specific year's count. The patterns, however, are durable enough to inform clinic compliance priorities.

## Hacking and Ransomware: The Dominant Breach Vector

The OCR portal classifies breaches by type. Across recent reporting years, hacking and IT incidents have consistently accounted for the largest share of reported breaches by number of affected individuals — and increasingly by breach count as well.

Ransomware is a primary subcategory. OCR issued specific guidance in 2016 establishing that a ransomware attack presumptively constitutes a breach under the Breach Notification Rule unless the covered entity can demonstrate a low probability of PHI compromise through a four-factor assessment. Most small clinics are not aware of this standard — they assume paying the ransom and restoring data ends the matter. It does not.

The dominance of hacking incidents in the breach data is not an argument for resignation. It is an argument for prioritizing technical controls — multi-factor authentication for all remote access, patching cycles that do not allow critical vulnerabilities to persist, access controls that limit the blast radius of any single credential compromise, and backup configurations that support recovery without paying an extortion demand.

## Business Associate Breaches and Downstream Impact

A significant share of OCR breach reports involve business associates as the breached entity. When a BA is breached, the affected records frequently belong to multiple covered entities — patients of different clinics, hospitals, or practices that all used the same vendor.

This pattern matters for small clinics in two ways.

First, a BA breach puts your patients at risk even when your own systems were not compromised. The vendor managing your billing, your EHR hosting provider, or your medical transcription service may experience a breach that affects your patient population. Your obligation to notify affected patients applies regardless of whether the breach occurred on your systems or your BA's systems — as long as the breached data was PHI you maintained.

Second, your BAA inventory and BA oversight program directly affect your exposure to this category of risk. A BA that you have not evaluated for security posture, that has not demonstrated adequate controls, or that you have not confirmed has appropriate breach notification procedures is a risk factor outside your direct control.

The most common BA-related compliance failures cited in OCR investigations are straightforward: no BAA existed, or the BAA was signed years ago and never updated to reflect current regulatory requirements. Treating your BA inventory as a living document — not a one-time contract exercise — is the operational response to this pattern.

## What the Data Says About Entity Types

The OCR portal categorizes affected entities by type: healthcare providers, health plans, and healthcare clearinghouses. Healthcare providers account for the largest share of breach reports, which reflects both the size of the provider sector and the volume of sensitive information providers handle.

Within healthcare providers, both large health systems and small independent practices appear in the data. Size does not provide insulation. The nature of the attack vector often differs: large health systems face sophisticated network intrusions and ransomware attacks targeting their infrastructure. Small practices more frequently experience credential theft through phishing, insider access violations, and improperly secured devices.

The small-practice breach that does not appear on the public portal — because it affected fewer than 500 individuals — is still reported to OCR and still triggers the same internal response obligations. The Breach Notification Rule's 60-day timeline for large breaches and the annual reporting obligation for small breaches both apply. The absence of a public listing does not mean OCR cannot investigate.

## Unauthorized Access: The Internal Threat

Alongside hacking and IT incidents, unauthorized access by workforce members is a persistently significant breach category. In healthcare specifically, the problem of employees accessing records without a treatment justification — sometimes called snooping — has generated major enforcement actions against large organizations and shows up in small practices as well.

The pattern: a staff member accesses records of a celebrity patient, a family member, a neighbor, or a high-profile community figure without any treatment reason. Sometimes the motivation is curiosity. Sometimes it is sharing information with someone outside the practice. Occasionally it involves identity theft or insurance fraud.

The compliance response is access controls: each user should have system access limited to the patients for whom they have a current treatment, billing, or operational responsibility. Access beyond that baseline should require justification and should be logged. Log review — regular monitoring of audit trails — is what allows access violations to be detected rather than discovered years later through a patient complaint.

45 CFR §164.312(b) requires covered entities to implement hardware, software, and procedural mechanisms that record and examine activity in information systems containing ePHI. That audit trail is not optional. How regularly it is reviewed is a matter of policy — but a policy of never reviewing it is a compliance gap.

## Improper Disposal: A Persistent Small-Practice Breach Cause

Medical records disposed of improperly — documents placed in unsecured recycling or trash, old hard drives sold without wiping, copiers returned to lessors without clearing internal storage — generate a consistent stream of breach reports.

Improper disposal breaches are preventable with straightforward procedures: cross-cut shredding for paper records, confirmed data wiping for electronic media, and a destruction log that documents each disposal event. They are also highly visible — a dumpster containing patient records in view of the public is the kind of incident that generates both press coverage and OCR complaints.

For small clinics with limited staff, paper document handling is often the area where informal practices have replaced formal procedures. Someone cleans out a file cabinet and puts the contents in the recycling bin. An old laptop is donated to a charity without wiping the drive. These incidents follow exactly the pattern the OCR data reflects.

## What Prevention Priorities the Data Suggests

Reading across years of OCR breach data, the recurring pattern is not that HIPAA compliance is impossibly complex. It is that a small set of operational failures — unpatched systems, weak credentials, unsigned BAAs, no audit log review, improper disposal — account for a disproportionate share of incidents.

**Technical controls with the highest return:**
- Multi-factor authentication on all remote access
- Automatic workstation lock after inactivity
- Encrypted storage on all devices holding ePHI
- Backup configurations tested for actual recovery

**Administrative controls with the highest return:**
- A current BAA inventory with all vendors who touch ePHI
- Workforce training with documented completion records
- An access control model that gives each user only what they need
- Regular audit log review with documented findings

**Operational controls with the highest return:**
- A defined incident response procedure reviewed and practiced before an incident occurs
- A documented breach risk assessment process so that when an incident occurs, the team knows what analysis to run

The breach data argues for proactive compliance not as a regulatory checkbox but as mitigation for a risk profile that the data shows is real, recurring, and spread across provider types of every size. Healthcare is the most-breached sector in reported data. Small practices are in that data. Prevention is worth the investment.
