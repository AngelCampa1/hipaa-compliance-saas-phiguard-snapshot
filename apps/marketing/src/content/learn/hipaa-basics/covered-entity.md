---
title: "Covered Entity: HIPAA Definition for Small Clinics"
seoTitle: "Covered Entity: HIPAA Definition"
description: "The precise HIPAA definition of a covered entity, which types of clinics qualify, the common cash-only misconception, and what direct HIPAA obligations apply."
metaDescription: "A covered entity under HIPAA is a health plan, healthcare clearinghouse, or healthcare provider that transmits health information electronically."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "Covered Entity"
intent: "awareness"
summary: "A covered entity is a health plan, healthcare clearinghouse, or healthcare provider that transmits any health information in electronic form in connection with a HIPAA-covered transaction. 45 CFR § 160.103. All three types have direct HIPAA obligations for protecting PHI."
keyTakeaways:
  - "Three types of covered entities: health plans, healthcare clearinghouses, and healthcare providers that conduct electronic transactions."
  - "A healthcare provider becomes a covered entity by transmitting health information electronically for covered transactions — not merely by providing care."
  - "The common belief that cash-only practices are exempt from HIPAA is largely incorrect."
  - "Covered entity status triggers direct Privacy Rule, Security Rule, and Breach Notification Rule obligations."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 160.103 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "HHS / eCFR"
  - title: "Covered Entity Decision Tool"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html"
    publisher: "CMS"
faq:
  - q: "Is a small family medicine clinic a covered entity under HIPAA?"
    a: "Almost certainly yes. A family medicine clinic that submits insurance claims electronically — including Medicare, Medicaid, or private insurance — is a healthcare provider that conducts covered electronic transactions and is therefore a covered entity. The number of staff or patients does not change this status."
  - q: "Does HIPAA apply to a solo practitioner who only accepts cash?"
    a: "Possibly. A solo practitioner who accepts only cash and never submits electronic claims, eligibility inquiries, or other covered transactions may not be a covered entity. However, if that practitioner uses an EHR that connects to any external system for covered transactions, or if they order labs that require electronic claim submission, the analysis changes. Cash-only practices should conduct a formal covered entity determination rather than assuming they are exempt."
  - q: "If a clinic is not a covered entity, does HIPAA still apply to it?"
    a: "HIPAA does not apply directly to non-covered entities. However, state privacy laws may impose similar or more stringent obligations on healthcare providers that do not qualify as covered entities. Clinics that process health information should review applicable state law regardless of HIPAA status."
---

A covered entity is a health plan, healthcare clearinghouse, or healthcare provider that transmits any health information in electronic form in connection with a HIPAA-covered transaction. 45 CFR § 160.103 defines all three types. Whether your clinic qualifies as a covered entity determines whether HIPAA's Privacy Rule, Security Rule, and Breach Notification Rule apply to you directly — getting this wrong in either direction creates compliance risk.

**Small-clinic example:** A 6-provider family practice submits claims to Medicare electronically. That single act — electronic claim transmission — makes the practice a covered entity with direct obligations under all three rules, regardless of its size.

## The Regulatory Definition

Under 45 CFR § 160.103, a **covered entity** is one of three types of organizations:

1. A **health plan**
2. A **healthcare clearinghouse**
3. A **healthcare provider** who transmits any health information in electronic form in connection with a transaction covered under 45 CFR Part 162

The third category is where most small clinics fall, and it is the most nuanced. Not every healthcare provider is a covered entity — only those that conduct certain electronic transactions.

For detailed definitions of health plans and healthcare clearinghouses as distinct covered entity types, see [health plan](/learn/hipaa-basics/health-plan) and [healthcare clearinghouse](/learn/hipaa-basics/healthcare-clearinghouse).

## Healthcare Providers as Covered Entities

Under HIPAA, a **healthcare provider** is broadly defined to include any provider of services, provider of medical or health services, or any other person or organization that furnishes, bills, or is paid for health care in the normal course of business (45 CFR § 160.103). This encompasses physicians, dentists, chiropractors, physical therapists, psychologists, pharmacies, laboratories, and many other provider types.

Provider status alone does not make your clinic a covered entity. The trigger is the electronic transmission of health information in connection with a covered transaction under 45 CFR Part 162. Covered transactions include:

- **Health care claims** (X12 837 format for medical, dental, and institutional claims)
- **Eligibility inquiries and responses** (X12 270/271)
- **Referral authorization and response** (X12 278)
- **Claims status inquiries** (X12 276/277)
- **Coordination of benefits** (X12 837 with COB information)
- **Health care payment and remittance advice** (X12 835)
- **Premium payments** (X12 820)

If your clinic conducts any of these transactions electronically — including submitting Medicare or Medicaid claims, verifying patient eligibility with an insurer's system, or sending referral authorizations electronically — your clinic is a covered entity.

Your clinic does not need to conduct the electronic transactions directly. Using a billing company, practice management system, or clearinghouse to conduct these transactions on your behalf still makes your clinic a covered entity. The electronic transmission is attributed to the provider regardless of who physically submits it.

## The Three Types of Covered Entities Explained

### Health Plans

Health plans include employer-sponsored group health plans, health insurance issuers, Medicare, Medicaid, HMOs, PPOs, and many other arrangements that provide or pay for medical care. Health plans interact with small clinics primarily as payers — they receive claims, process eligibility requests, and remit payments. Your clinic does not become a health plan by accepting insurance; it interacts with covered entities that are health plans.

For a full discussion, see [health plan](/learn/hipaa-basics/health-plan).

### Healthcare Clearinghouses

A healthcare clearinghouse processes health information between standard and nonstandard formats — for example, converting a practice management system's proprietary claim format into a standard X12 837 transaction. Clearinghouses are covered entities because they receive and process PHI on behalf of other covered entities. See [healthcare clearinghouse](/learn/hipaa-basics/healthcare-clearinghouse).

### Healthcare Providers

The clinic category. As described above, a healthcare provider becomes a covered entity by conducting any HIPAA-covered electronic transaction. A primary care clinic that bills Medicare electronically, a dermatology practice that submits electronic claims to commercial insurers, a behavioral health practice that submits electronic eligibility inquiries — all are covered entities.

## The Cash-Only Misconception

A persistent belief holds that a practice accepting only cash is not a covered entity and therefore does not have to comply with HIPAA. This belief is largely incorrect and can expose your clinic to substantial risk.

**Why the misconception persists.** The literal text of the covered entity definition does require electronic transmission of health information in connection with a covered transaction. A provider that genuinely never transmits any health information electronically for any covered transaction is not a covered entity.

**Why it rarely applies.** In practice, few clinics meet this standard. Consider the situations that pull even a "cash-only" practice into covered entity territory:

- **Laboratory orders.** If your clinic orders labs from an external laboratory and that lab submits claims to Medicare or Medicaid on behalf of the patient, the lab is a covered entity — but your clinic may still be handling PHI that the Privacy Rule protects through other obligations.
- **EHR systems.** Many EHR systems are designed to conduct covered transactions, and your clinic may conduct them without realizing it if the system sends electronic eligibility inquiries automatically.
- **Medicare patients.** A provider who sees Medicare patients and accepts Medicare payment — even through a supplemental billing arrangement — is conducting covered electronic transactions.

**The formal determination.** CMS maintains a Covered Entity Decision Tool that walks providers through the analysis. Any clinic uncertain about its covered entity status should complete that tool before concluding it is not subject to HIPAA. Incorrectly self-exempting from HIPAA — then suffering a breach — carries the same financial and reputational exposure as if the determination had never been made.

## What Covered Entity Status Triggers

Once your clinic is a covered entity, three sets of HIPAA regulations apply directly:

**The Privacy Rule** (45 CFR Parts 160 and 164, Subparts A and E) governs how PHI may be used and disclosed, establishes patient rights, and requires policies and procedures protecting those rights. See [HIPAA Privacy Rule explained](/learn/hipaa-basics/hipaa-privacy-rule-explained).

**The Security Rule** (45 CFR Parts 160 and 164, Subparts A and C) requires administrative, physical, and technical safeguards to protect electronic PHI. See [HIPAA Security Rule explained](/learn/hipaa-basics/hipaa-security-rule-explained).

**The Breach Notification Rule** (45 CFR Part 164, Subpart D) requires notification to individuals and HHS when unsecured PHI is breached.

These obligations apply to every covered entity regardless of size. A 3-person specialty clinic has the same regulatory framework as a 500-bed hospital system. The difference is in the scale of implementation, not the existence of the obligation.

## When a Practice Stops Being a Covered Entity

Covered entity status can technically end if a provider permanently stops conducting covered electronic transactions — for example, by retiring or converting entirely to a direct primary care (DPC) model that never submits electronic claims. The transition requires care:

- PHI already held must still be protected and eventually disposed of according to the retention schedule
- Business associate agreements remain in effect for existing relationships until they expire or are terminated
- Breach notification obligations for breaches that occurred while the practice was a covered entity survive the cessation of covered entity status

In practice, most clinics that reduce or eliminate electronic billing remain covered entities in some capacity because they retain access to PHI created when they were billing electronically.

## Why This Definition Matters for Vendor Contracts

Understanding covered entity status matters beyond your own clinic's compliance. When you share PHI with vendors — billing companies, EHR providers, answering services, cloud storage providers — you need to know whether they are covered entities or business associates. A vendor that is itself a covered entity has independent HIPAA obligations. A vendor that is not a covered entity but handles PHI on your behalf is a business associate who requires a signed Business Associate Agreement.

See [covered entity vs business associate](/learn/hipaa-basics/covered-entity-vs-business-associate) for a practical guide to making that determination.

For a complete framework for managing HIPAA compliance as a covered entity — including risk analysis, policy documentation, and BAA management — see [PHIGuard's HIPAA compliance page](/hipaa). PHIGuard is built for covered entities that lack in-house compliance resources.
