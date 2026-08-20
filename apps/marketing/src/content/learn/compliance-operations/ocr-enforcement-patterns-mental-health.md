---
title: "OCR Enforcement Patterns in Mental Health Practices"
seoTitle: "OCR HIPAA Enforcement: Mental Health"
description: "How the HHS Office for Civil Rights focuses its HIPAA enforcement attention in mental and behavioral health, including patient access rights, BAA failures, breach notification timing, psychotherapy notes, and 42 CFR Part 2 overlap."
metaDescription: "OCR HIPAA enforcement patterns for mental health: access rights, BAAs, breach timing, psychotherapy notes, and 42 CFR Part 2 overlap."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "The HHS Office for Civil Rights enforces HIPAA across all covered entities, but mental and behavioral health practices face a distinct set of recurring issues. This article maps the general OCR focus areas onto the specific risks of mental health practice without naming individual cases or fines."
keyTakeaways:
  - "OCR has publicly identified patient right of access, risk analysis, and BAA failures as recurring themes across enforcement activity."
  - "Mental health practices face additional pressure points: psychotherapy notes, family and caregiver disclosures, and overlap with 42 CFR Part 2 for substance use disorder records."
  - "Breach notification timeliness under 45 CFR 164.404 is a frequent compliance failure; sixty days is the outer bound, not a target."
  - "A complete and current risk analysis remains the single most leveraged compliance artifact in any OCR investigation."
  - "Mental health practices should treat the right of access timeline (thirty days, with one thirty-day extension) as a workflow, not a legal threshold."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "HIPAA Compliance and Enforcement"
    url: "https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/index.html"
    publisher: "U.S. Department of Health and Human Services"
  - title: "HIPAA Privacy Rule and Mental Health"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Are psychotherapy notes covered by HIPAA?"
    a: "Yes. Psychotherapy notes have heightened protections under 45 CFR 164.508(a)(2). They generally require a separate authorization for use and disclosure, distinct from the rest of the medical record."
  - q: "How does 42 CFR Part 2 interact with HIPAA in a mental health practice?"
    a: "If the practice qualifies as a Part 2 program (federally assisted substance use disorder treatment), Part 2 generally imposes stricter consent and redisclosure rules than HIPAA. Recent rulemaking has aligned some terminology with HIPAA, but the stricter rule still applies where they conflict."
  - q: "What is the deadline for breach notification to affected individuals?"
    a: "Under 45 CFR 164.404, individual notice must be provided without unreasonable delay and no later than sixty days after discovery of the breach. HHS must also be notified within sixty days for breaches affecting five hundred or more individuals."
---

## Overview of OCR enforcement focus areas

The HHS Office for Civil Rights enforces the HIPAA Privacy, Security, and Breach Notification Rules. Without naming specific resolution agreements, OCR has been public about the categories of failure it most often resolves: incomplete or stale risk analyses, missing or inadequate business associate agreements, untimely breach notification, and individual right of access denials or delays.

For mental and behavioral health practices, those general patterns layer on top of mental-health-specific compliance pressure: psychotherapy notes, family and caregiver disclosures, minors and parental access, and the overlap with 42 CFR Part 2 for any program treating substance use disorder. A small mental health practice can hit a compliance issue that a comparable internal medicine clinic would never encounter, simply because the underlying records are more sensitive and the disclosure rules are more nuanced.

## Specific requirements and CFR citations

**Right of access — 45 CFR 164.524.** Individuals have the right to inspect and obtain a copy of PHI in a designated record set. Action must be taken within thirty days of the request, with one thirty-day extension permitted with written notice to the individual.

**Psychotherapy notes — 45 CFR 164.508(a)(2).** Defined as notes recorded by a mental health professional documenting or analyzing the contents of conversation during a counseling session, kept separate from the rest of the medical record. They generally require a specific authorization for use and disclosure beyond the originating clinician's own use, supervision, and a small number of enumerated exceptions.

**Disclosures to family and friends — 45 CFR 164.510(b).** Permits disclosure of PHI relevant to the person's involvement in the patient's care, when the patient agrees, does not object, or under emergency conditions.

**Breach notification — 45 CFR 164.400 through 164.414.** Individuals must be notified without unreasonable delay and no later than sixty days after discovery. HHS must be notified within sixty days for breaches affecting five hundred or more individuals, and annually for smaller breaches.

**Risk analysis — 45 CFR 164.308(a)(1)(ii)(A).** Required. An accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic PHI.

**42 CFR Part 2.** Federal regulation governing the confidentiality of substance use disorder records held by federally assisted SUD programs. Generally stricter than HIPAA on consent and redisclosure.

## Common gaps in mental health practices

The recurring pressure points we see in mental and behavioral health:

- Psychotherapy notes commingled with progress notes in the EHR, breaking the "kept separately" requirement.
- Disclosures to a parent of a minor patient handled inconsistently across the practice, with state-law variations not documented.
- Right of access requests routed through the clinician rather than the practice administrator, leading to thirty-day deadlines missed during clinician vacations.
- Breach notification clocks started on the date the Security Officer was notified rather than the date of discovery, which by rule is when any workforce member knew or should have known.
- BAAs in place for the EHR vendor and the billing service but missing for telehealth platforms, transcription services, and cloud-based scheduling.
- Risk analyses that name the EHR but ignore the telehealth platform, the secure messaging app, and the personal devices clinicians use to call patients.
- Practices that meet the Part 2 program definition treating Part 2 records under HIPAA-only rules, missing the stricter consent requirements.

## Numbered checklist for mental health practices

1. Psychotherapy notes are stored separately from the rest of the medical record, in a way the EHR can demonstrate to an auditor.
2. A written policy describes when psychotherapy notes are created, who may access them, and what authorizations are required for disclosure.
3. Right of access requests are logged centrally with date received, deadline, and date fulfilled.
4. Right of access workflow assigns ownership to the practice administrator with clinician backup, not the other way around.
5. Fees for copies follow the OCR guidance and are documented per request.
6. A written disclosure-to-family policy addresses the 164.510(b) standard and any state-law variations.
7. Minors policy addresses parental access in alignment with state law and is reviewed annually.
8. Determination of whether the practice is a 42 CFR Part 2 program is documented in writing.
9. If Part 2 applies, consent forms, segregation of records, and redisclosure language meet the Part 2 standard.
10. Breach notification policy defines discovery as the moment any workforce member knew or should have known.
11. Breach risk assessments use the four-factor framework from 45 CFR 164.402.
12. Individual notification letters are drafted, reviewed, and ready to mail within the sixty-day window, with a target of thirty days.
13. HHS notification submissions are tracked with confirmation numbers and retained.
14. The risk analysis covers every system that handles PHI, including telehealth, secure messaging, transcription, cloud storage, and personal devices used for clinical work.
15. The risk analysis is updated within twelve months and after any material change.
16. The BA inventory includes telehealth platforms, transcription services, AI scribe tools, scheduling services, and any analytics provider with access to PHI.
17. AI-based tools that process PHI have a signed BAA and a documented review of training data use.
18. Workforce training includes a mental-health-specific module on psychotherapy notes, family disclosures, and Part 2 if applicable.
19. Audit log review checks for access to psychotherapy notes by clinicians other than the originator.
20. The Security Officer reviews this checklist annually with clinic leadership and signs the result.

## Documentation requirements

In addition to the standard Security Rule documentation, mental health practices should retain:

- Psychotherapy notes policy and storage configuration
- Right of access log with timestamps
- Family and caregiver disclosure policy with state-law variations
- Minors policy
- Part 2 applicability determination
- Breach risk assessment records
- BAAs covering every PHI-touching vendor including telehealth and AI tools
- Risk analysis explicitly covering mental-health-specific systems
- Workforce training records with the mental health module

Retain for six years from creation or last effective date. For the broader compliance program, see the [administrative safeguards checklist](/learn/compliance-operations/hipaa-administrative-safeguards-checklist) and the [42 CFR Part 2 vs HIPAA comparison](/learn/compliance-operations/42-cfr-part-2-vs-hipaa). If you are evaluating tools that bundle the BAA inventory, breach workflow, and access log review for a mental health practice, the [PHIGuard HIPAA platform](/hipaa) is built around small clinics with exactly this risk profile.
