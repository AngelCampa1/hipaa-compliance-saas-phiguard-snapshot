---
title: "Healthcare Provider Under HIPAA: Definition for Small Clinics"
seoTitle: "Healthcare Provider Under HIPAA: Definition"
description: "The HIPAA definition of a healthcare provider, the covered transaction requirement, the cash-only provider situation, and when specialty practices must comply."
metaDescription: "A healthcare provider under HIPAA is any person who furnishes, bills, or is paid for health care. 45 CFR § 160.103. HIPAA applies only when electronic."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "Healthcare Provider"
intent: "awareness"
summary: "Under HIPAA, a healthcare provider is any person or organization that furnishes, bills, or is paid for health care in the normal course of business. 45 CFR § 160.103. However, only healthcare providers that transmit health information electronically in connection with HIPAA-covered transactions become covered entities with direct HIPAA obligations."
keyTakeaways:
  - "The provider definition is broad — it includes physicians, dentists, pharmacies, labs, therapists, and any organization that furnishes or bills for healthcare."
  - "Provider status alone does not create HIPAA obligations — the covered entity trigger is electronic transmission for covered transactions."
  - "A cash-only practice that never conducts any electronic healthcare transaction may not be a covered entity, but this exception is narrower than it appears."
  - "Even non-covered-entity providers may have PHI obligations under state law and under BAAs if they receive PHI from covered entities."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 160.103 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "HHS / eCFR"
  - title: "45 CFR Part 162 — Administrative Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-162"
    publisher: "HHS / eCFR"
faq:
  - q: "Is a physical therapist with a solo practice a covered entity under HIPAA?"
    a: "If the physical therapist submits claims to Medicare, Medicaid, or private insurance electronically — or verifies patient eligibility electronically — then yes, the therapist is a covered entity. If the therapist exclusively accepts direct payment from patients, never submits electronic claims, and never conducts any covered electronic transaction, they may not qualify as a covered entity. In practice, most physical therapists bill insurance and are therefore covered entities."
  - q: "Does HIPAA apply to a mental health counselor who only accepts self-pay clients?"
    a: "Potentially not, if the counselor never conducts HIPAA-covered electronic transactions. A mental health counselor operating a fully cash-based practice with no electronic transaction activity may not meet the covered entity definition. However, state mental health privacy laws — which are often more stringent than HIPAA — apply regardless of HIPAA status. Clinicians in this situation should review their state law, not assume they have no privacy obligations."
  - q: "A physician works at a hospital that is a covered entity. Is the individual physician also a covered entity?"
    a: "A physician employed by a hospital covered entity is generally treated as part of the covered entity's workforce — not a separate covered entity. However, a physician with a separate private practice that also submits electronic claims independently is a covered entity with respect to that private practice, even if they also work for a covered entity employer."
---

Under HIPAA, a healthcare provider is any person or organization that furnishes, bills, or is paid for health care in the normal course of business. 45 CFR § 160.103 defines the term by reference to the Social Security Act's definitions of providers of services and providers of medical or health services, plus a catch-all covering anyone involved in furnishing or billing healthcare. But being a healthcare provider is only the first step — the second, and more operationally significant, question is whether that provider conducts covered electronic transactions, which is the trigger for direct HIPAA coverage.

**Small-clinic example:** A licensed professional counselor operates a solo mental health practice. She sees 20 clients per week. If she submits claims to any health plan electronically — even one claim to one insurer — she is a covered entity with full HIPAA obligations. If she genuinely accepts only self-pay with no electronic transactions, her status requires formal analysis before concluding she is exempt.

## The Regulatory Definition

Under 45 CFR § 160.103, a **healthcare provider** means:

> "A provider of services (as defined in section 1861(u) of the [Social Security Act], 42 U.S.C. 1395x(u)), a provider of medical or health services (as defined in section 1861(s) of the Act, 42 U.S.C. 1395x(s)), and any other person or organization who furnishes, bills, or is paid for health care in the normal course of business."

The catch-all — "any other person or organization who furnishes, bills, or is paid for health care in the normal course of business" — extends the definition to include essentially any entity involved in the provision or billing of healthcare services.

Healthcare providers include, but are not limited to:
- Physicians, physician assistants, and nurse practitioners
- Dentists and oral surgeons
- Mental health therapists, psychologists, and licensed clinical social workers
- Physical, occupational, and speech therapists
- Chiropractors
- Pharmacies
- Clinical laboratories
- Medical imaging centers
- Hospitals and hospital outpatient departments
- Home health agencies
- Ambulatory surgery centers
- Durable medical equipment (DME) suppliers

## The Covered Transaction Requirement

Being a healthcare provider does not automatically make an entity a HIPAA covered entity. A healthcare provider must also transmit any health information in electronic form in connection with a transaction covered under 45 CFR Part 162.

The HIPAA-covered transactions are electronic data interchange standards for specific administrative transactions:

| Transaction | Standard |
|-------------|----------|
| Healthcare claims | X12 837 |
| Eligibility inquiry and response | X12 270/271 |
| Claims status inquiry and response | X12 276/277 |
| Remittance advice | X12 835 |
| Referral authorization | X12 278 |
| Coordination of benefits | X12 837 with COB |
| Premium payment | X12 820 |
| Health plan enrollment | X12 834 |

If a healthcare provider conducts any of these transactions electronically — including using a software system that conducts them automatically or through a clearinghouse — that provider is a covered entity.

The provider does not need to conduct the electronic transaction directly. Using a billing service, clearinghouse, or EHR that routes electronic transactions on the provider's behalf is sufficient. The key is whether the underlying transaction is taking place electronically in connection with the provider's billing or administrative activities.

## The Cash-Only and Direct Primary Care Situation

The most frequently discussed scenario involves providers who do not accept insurance — either because they operate a cash-only practice or because they participate in a direct primary care (DPC) model where patients pay a monthly membership fee and the practice does not bill insurance for most services.

**A truly cash-only practice that never conducts covered electronic transactions may not be a covered entity.** If a provider receives only direct payments from patients, never submits claims to Medicare or Medicaid, never conducts electronic eligibility verification, and never conducts any other covered electronic transaction, that provider may not meet the covered entity definition.

**However, the exceptions are significant:**

- **Laboratory orders.** A physician who does not bill insurance may still order labs from a laboratory that submits Medicare or Medicaid claims for the patient. The physician is not submitting the claim, but the physician may be receiving PHI from the lab that was created in connection with covered transactions.
- **Electronic health records.** Most EHR systems are designed to conduct covered transactions and may do so automatically. A cash-only practice using a standard EHR should confirm whether the system conducts any covered electronic transactions.
- **Hospital privileges.** A physician who practices independently but has hospital privileges may be conducting covered transactions through the hospital's systems.
- **Medicare patients.** A physician who accepts direct payment from Medicare beneficiaries — including as a "non-participating" provider — may be conducting covered transactions if Medicare processes the claim on the patient's behalf.

**DPC practices** that genuinely do not bill third-party payers for most services face a nuanced analysis. A DPC clinic that supplements its model with some insurance billing — for example, billing a patient's health plan for certain high-cost services — is conducting covered transactions and is likely a covered entity.

CMS provides a Covered Entity Decision Tool that walks providers through the covered entity determination. Any practice uncertain about its status should use that tool before concluding it is not subject to HIPAA.

## Hybrid Entities and Provider Components

Some organizations include healthcare provider functions within a larger non-healthcare organization. Under 45 CFR § 164.105, a "hybrid entity" is a single legal entity that is a covered entity and whose business activities include both covered and non-covered functions. For example, a university that operates a student health clinic is a covered entity as to its healthcare provider function, but the non-healthcare portions of the university are not covered entities.

Hybrid entities may designate the healthcare components as the "healthcare components" subject to HIPAA, limiting compliance obligations to those components.

For small clinics, hybrid entity status is uncommon, but it can arise when a clinic is operated as a component of a larger organization such as a university, a large employer health service, or a multi-business organization.

## Implications for Vendor Relationships

Whether a provider is a covered entity determines the structure of certain vendor relationships. A covered entity healthcare provider who uses a vendor to handle PHI must have a Business Associate Agreement with that vendor. If the provider is not a covered entity, the BAA framework does not technically apply under HIPAA — though contract-based protections and state law obligations may still govern.

For covered entity providers, every vendor who touches PHI requires a BAA analysis. See [business associate](/learn/hipaa-basics/business-associate) for the full framework.

For a practical starting point on HIPAA compliance for healthcare providers — whether you've been a covered entity for years or are determining your status for the first time — see [PHIGuard's HIPAA compliance platform](/hipaa).
