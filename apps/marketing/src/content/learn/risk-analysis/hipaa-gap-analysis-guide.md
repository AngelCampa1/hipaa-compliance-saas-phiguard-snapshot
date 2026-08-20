---
title: "How to Conduct a HIPAA Gap Analysis for Your Practice"
seoTitle: "HIPAA Gap Analysis Guide"
description: "A HIPAA gap analysis compares your current controls against the required and addressable specifications in 45 CFR §§164.308–164.316. This step-by-step guide walks small clinics through scoping, assessment, and remediation planning."
metaDescription: "How to conduct a HIPAA gap analysis for small clinics: scope PHI systems, review administrative and technical safeguards, document findings, and prioritize..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: risk-analysis
intent: awareness
schemaType: how-to
howToSteps:
  - name: "Scope the assessment"
    text: "Define which systems, workflows, locations, and workforce roles touch PHI. A written scope statement prevents both scope creep and missed coverage areas."
  - name: "Review administrative safeguards"
    text: "Audit your policies, training records, BAA inventory, and workforce access designations against 45 CFR §164.308. Note each required specification that is absent or undocumented."
  - name: "Review technical safeguards"
    text: "Assess access controls, audit logging, automatic logoff, encryption in transit and at rest, and transmission security against 45 CFR §164.312. Check each workstation and application."
  - name: "Review physical safeguards"
    text: "Assess facility access controls, workstation use policies, device and media controls against 45 CFR §164.310. Include remote work locations."
  - name: "Document findings against specifications"
    text: "For each Security Rule specification, record your current state, what is missing, and the gap level. Use NIST SP 800-66r2 as the specification reference."
  - name: "Prioritize remediation and assign owners"
    text: "Sort findings by risk level and assign an owner and due date to each. Document the remediation plan — the gap analysis and its follow-through are both required records under 45 CFR §164.316."
summary: "A HIPAA gap analysis identifies which required and addressable safeguards are absent or incomplete at your practice. It is distinct from a risk analysis — a gap analysis maps your controls against regulatory specifications, while a risk analysis assesses threats and vulnerabilities. NIST SP 800-66r2 is the authoritative implementation guide for both."
keyTakeaways:
  - "A gap analysis maps current controls against 45 CFR §§164.308–164.316 — it answers 'what is missing,' not 'what could go wrong.'"
  - "Start by scoping which systems, workflows, and locations touch PHI — scope creep in either direction undermines the assessment."
  - "Administrative safeguards (policies, training, BAAs) are as frequently deficient as technical controls in small-clinic audits."
  - "NIST SP 800-66r2 provides a specification-by-specification implementation guide aligned to the Security Rule."
  - "Gap findings must be prioritized by risk and remediated with documented timelines — the gap analysis document itself is a required record."
sources:
  - title: "NIST SP 800-66r2 — Implementing the HIPAA Security Rule"
    url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-66r2.pdf"
    publisher: "NIST"
  - title: "45 CFR Part 164 Subpart C — Security Standards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C"
    publisher: "eCFR"
  - title: "Security Rule Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS"
faq:
  - q: "What is the difference between a HIPAA gap analysis and a HIPAA risk analysis?"
    a: "A gap analysis compares your current controls against what the Security Rule specifications require. It answers: which safeguards are absent or incomplete? A risk analysis, required under 45 CFR §164.308(a)(1)(ii)(A), assesses threats to and vulnerabilities in your ePHI. The two assessments complement each other — a gap analysis often reveals areas that need deeper risk analysis."
  - q: "How often should a small clinic conduct a HIPAA gap analysis?"
    a: "There is no regulatory frequency requirement for a gap analysis specifically. Most compliance programs run a gap analysis annually or whenever a significant operational change occurs — a new EHR, a new location, a major workflow change. OCR expects the analysis to be current and to reflect your actual operating environment."
  - q: "Does a gap analysis satisfy the HIPAA risk analysis requirement?"
    a: "No. A gap analysis and a risk analysis are different documents serving different regulatory purposes. 45 CFR §164.308(a)(1)(ii)(A) requires an accurate and thorough assessment of potential risks and vulnerabilities to ePHI. A gap analysis does not assess threat probability or impact — it maps controls. You need both."
  - q: "Can a small clinic conduct its own gap analysis or does it need a consultant?"
    a: "A small clinic can conduct its own gap analysis using NIST SP 800-66r2 as the implementation guide. The process is methodical rather than technically complex. Using a consultant adds expertise and provides defensible documentation if OCR questions the assessment, but self-conducted gap analyses are accepted when they are thorough and well-documented."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

A HIPAA gap analysis is a structured comparison: what the Security Rule specifications require versus what your practice actually has in place. When the comparison reveals a mismatch — a required policy that does not exist, an access control that has not been configured, a business associate agreement that was never signed — that mismatch is the gap.

The gap analysis does not assess how likely a threat is to materialize or how severe the damage would be. That is the job of a risk analysis under 45 CFR §164.308(a)(1)(ii)(A). The gap analysis asks a narrower question: are the required and addressable safeguards present and functional?

For small clinics, a gap analysis is often the most practical starting point before a full risk analysis because it surfaces the straightforward deficiencies that are easiest to remediate — and easiest for OCR to cite when they are missing.

## Step 1: Scope the Assessment

Before reviewing any controls, define what is inside the assessment boundary.

**Identify systems that create, receive, maintain, or transmit ePHI.** This list should be exhaustive. Common inclusions for small clinics:

- Electronic health record (EHR) system
- Practice management and billing software
- Secure messaging and patient communication platforms
- Email systems when used for patient communication
- Cloud storage and file sharing services
- Fax-over-IP services
- Remote access tools and VPN configurations
- Workstations, laptops, tablets, and mobile devices used by staff
- Medical devices with network connectivity

**Identify physical locations where PHI is accessible.** This includes the primary clinic, any satellite locations, and remote work environments where staff access clinical systems.

**Identify workforce roles that access PHI.** Clinicians, front desk staff, billing staff, and any contractors or vendors with system access belong in scope.

Document your scope before beginning the assessment. If OCR requests the gap analysis, an undocumented scope creates ambiguity about whether deficiencies were considered or simply overlooked.

## Step 2: Review Administrative Safeguards (45 CFR §164.308)

Administrative safeguards are the policies, procedures, and workforce management practices that govern how PHI is handled. They are also the area where small clinics most commonly have documented gaps.

Work through each specification:

**Security Management Process (§164.308(a)(1))** — Required. Does the practice have a documented risk analysis? A risk management plan? Sanction policies for policy violations? Information system activity review procedures?

**Assigned Security Responsibility (§164.308(a)(2))** — Required. Is there a designated security official? Is that designation documented in writing?

**Workforce Security (§164.308(a)(3))** — Addressable. Are workforce access authorizations documented? Is there a process to terminate access when an employee leaves?

**Information Access Management (§164.308(a)(4))** — Required for covered entities. Does the practice restrict EHR access to authorized users based on minimum necessary access? Is there a documented authorization and access establishment process?

**Security Awareness and Training (§164.308(a)(5))** — Addressable. Does a training program exist? Are malicious software protections addressed? Are log-in monitoring procedures documented?

**Security Incident Procedures (§164.308(a)(6))** — Required. Is there a written incident response procedure? Does it define what constitutes a security incident? Does it address reporting timelines?

**Contingency Plan (§164.308(a)(7))** — Required. Does the practice have a data backup plan? A disaster recovery plan? An emergency mode operation plan? Have these been tested?

**Evaluation (§164.308(a)(8))** — Required. Does the practice conduct periodic technical and non-technical evaluations of security controls? Is this evaluation documented?

**Business Associate Contracts (§164.308(b))** — Required. Is there a complete and current BAA inventory? Does a signed BAA exist for every vendor with access to ePHI?

For each specification, document: present (with evidence), partially present (with specific gaps), or absent.

## Step 3: Review Physical Safeguards (45 CFR §164.310)

Physical safeguards govern access to the physical spaces and devices where ePHI is stored or processed.

**Facility Access Controls (§164.310(a))** — Addressable. Are contingency operations procedures documented? Is there a facility security plan? Are access controls and validation procedures defined?

**Workstation Use (§164.310(b))** — Required. Are workstation use policies documented? Do they specify the physical surroundings where workstations can be used (relevant for home office use)?

**Workstation Security (§164.310(c))** — Required. Are workstations physically protected from unauthorized access? Are public-facing workstations positioned to prevent visual access to patient information?

**Device and Media Controls (§164.310(d))** — Required. Is there a documented process for disposing of hardware that stores ePHI? Are media reuse procedures documented? Is there a record of hardware moves?

Small clinics frequently find gaps in workstation disposal and device media controls — laptops that are donated or recycled without confirmed data destruction, and no documentation trail.

## Step 4: Review Technical Safeguards (45 CFR §164.312)

Technical safeguards are the technology controls that protect ePHI in transit and at rest.

**Access Control (§164.312(a))** — Required. Does each user have a unique identifier? Is there an emergency access procedure? Are systems configured to auto-logoff after inactivity? Is encryption or equivalent alternative control in place?

**Audit Controls (§164.312(b))** — Required. Does the EHR and supporting infrastructure generate audit logs? Are those logs reviewed? Are they retained?

**Integrity Controls (§164.312(c))** — Addressable. Are controls in place to verify that ePHI has not been altered in transit or at rest?

**Person or Entity Authentication (§164.312(d))** — Required. Does the practice verify that users are who they claim to be before granting system access? Is multi-factor authentication in place for remote access?

**Transmission Security (§164.312(e))** — Addressable. Is ePHI transmitted only over encrypted connections? Are email transmissions containing PHI encrypted in transit?

## Step 5: Review Organizational Requirements (45 CFR §§164.314–164.316)

**Business Associate Contracts (§164.314(a))** — Required. Cross-reference the BAA inventory from the administrative safeguard review. Confirm that each BAA meets the required content elements and has been executed by both parties.

**Policies and Procedures (§164.316(a))** — Required. Are written policies and procedures in place for each of the safeguard standards above? Are they accessible to the workforce?

**Documentation (§164.316(b))** — Required. Are policies retained for six years? Are records of actions, activities, and assessments retained and accessible?

## Step 6: Document Findings and Prioritize Remediation

Organize your findings into a gap register. For each gap, record:

- The regulatory specification it relates to (cite the specific section)
- A description of the current state
- A description of the required state
- A risk priority rating (high, medium, low — based on likelihood and potential harm if the gap remains)
- An assigned owner responsible for remediation
- A target remediation date

Prioritize required specifications over addressable ones when resources are constrained. Within required specifications, prioritize gaps that create direct exposure — missing BAAs, absent incident response procedures, and no documented risk analysis are high-priority regardless of clinic size.

NIST SP 800-66r2 provides detailed implementation guidance for each Security Rule specification and includes assessment questions that map directly to the gap analysis process. Use it as your specification-by-specification checklist.

## What to Do With the Gap Analysis Document

The gap analysis document is itself a required record under §164.316(b). Retain it for six years. Update it when a significant operational change occurs or when an annual review cycle is completed.

The gap register becomes the input to your risk management plan under §164.308(a)(1)(ii)(B). Remediation is not optional — documenting a gap without addressing it is still a violation. OCR does not penalize clinics for having found gaps; it penalizes clinics for not addressing them.

Review gap status quarterly until all high-priority items are closed. Record the closure date and the control that was implemented.
