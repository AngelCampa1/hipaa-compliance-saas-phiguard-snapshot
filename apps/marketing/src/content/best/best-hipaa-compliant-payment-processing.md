---
title: "Best HIPAA Compliant Payment Processing for Medical Clinics"
seoTitle: "HIPAA Payment Processing Tools"
category: "HIPAA Compliant Payment Processing"
description: "PCI-DSS compliance is not the same as HIPAA compliance. This review covers payment processors that offer BAAs for healthcare and those that do not."
metaDescription: "HIPAA compliant payment processing for medical clinics. PCI-DSS vs HIPAA explained. Which processors offer BAAs and which do not."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "HIPAA Compliant Payment Processing should be evaluated by BAA availability, workflow fit, audit evidence, pricing clarity, and small-team usability. PCI-DSS compliance is not the same as HIPAA compliance. This review covers payment processors that offer BAAs for healthcare and those that do not. The strongest options help clinics document risk analysis, policies, training, vendor BAAs, incidents, and recurring follow-up without turning compliance into a custom project-management build. PCI-DSS."
keyTakeaways:
  - "PCI-DSS compliance addresses cardholder data security — it does not address PHI. Healthcare practices need both."
  - "A payment processor becomes a business associate when their systems link payment data to patient identity or health conditions."
  - "Square and Stripe do not offer BAAs — clinics using them for patient payments carry unmitigated HIPAA risk."
  - "Healthcare-specific payment processors like Instamed and Patientco are built around both PCI-DSS and HIPAA requirements."
  - "Confirm that your payment processor's BAA covers the specific integration point — some cover the processor but not the portal or reporting tool."
rankedItems:
  - name: "Instamed"
    description: "BAA available. Healthcare-specific payment platform covering patient billing, insurance payments, and ERA processing."
  - name: "Patientco"
    description: "BAA details available during plan review. Purpose-built for patient payment collection with financial assistance integration."
  - name: "Rectangle Health"
    description: "BAA available. Healthcare-focused payment platform with PMS integration and payment plan support."
  - name: "Square"
    description: "No BAA available. Not appropriate for healthcare payment workflows that link payments to patient identity or conditions."
  - name: "Stripe"
    description: "No BAA available. PCI-DSS certified but HIPAA coverage is not offered. Flagged explicitly for healthcare practices."
sources:
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "PCI DSS"
    url: "https://www.pcisecuritystandards.org/"
    publisher: "PCI Security Standards Council"
faq:
  - q: "Is PCI-DSS compliance enough for a medical practice accepting patient payments?"
    a: "No. PCI-DSS governs cardholder data security. HIPAA governs PHI. When a payment is linked to a patient's name, diagnosis, or treatment, it becomes PHI. A PCI-DSS certified processor that has not signed a BAA does not provide HIPAA coverage."
  - q: "Can we use Square or Stripe for patient payments?"
    a: "Neither Square nor Stripe offers BAAs. For payments that link cardholder data to patient health information, using Square or Stripe creates an unmitigated HIPAA risk. Healthcare-specific processors or processors that offer BAAs are required for those transaction types."
  - q: "When does a payment processor become a business associate?"
    a: "When their systems receive, store, or transmit PHI on your behalf. A payment that includes a patient name, a diagnosis code, a procedure code, or any data that could identify an individual's health status creates a business associate relationship."
  - q: "Does the BAA need to cover the payment portal separately from the processor?"
    a: "Yes. If the payment portal (where patients log in to pay bills) is operated by a different vendor than the payment processor, each may require a separate BAA. Review the vendor architecture carefully."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

## The critical distinction: PCI-DSS is not HIPAA

This is the most common misconception in healthcare payment compliance. PCI-DSS (Payment Card Industry Data Security Standard) requires merchants to protect cardholder data — card numbers, CVVs, expiration dates. HIPAA requires covered entities to protect protected health information — patient names, diagnoses, treatment records, and any data that identifies an individual in connection with their health status.

When a patient pays their copay at a medical clinic, the transaction likely contains both: cardholder data (governed by PCI-DSS) and PHI (the patient's name linked to a clinical visit). A payment processor that handles this transaction is therefore a business associate under HIPAA, and a signed BAA is required.

A payment processor that is PCI-DSS compliant — even at the highest certification level — does not automatically hold a BAA with your practice. These are separate legal and compliance frameworks with separate requirements.

## Our picks

### Instamed

BAA status: available.

Instamed is a healthcare-specific payment network covering patient payments, insurance payments, and electronic remittance advice (ERA) processing. Because it operates exclusively in healthcare, Instamed's architecture is built around both PCI-DSS and HIPAA requirements from the ground up.

The platform covers multiple payment scenarios: point-of-service copay collection, patient statement payments, recurring payment plans, and insurance claim payment processing. For practices that want a single payment vendor across both patient-facing and payer-facing transactions, Instamed consolidates that under one BAA.

Integration with practice management systems varies — confirm compatibility with your existing PMS before contracting.

Pricing is volume-based and requires a direct quote. Instamed is typically positioned for practices processing meaningful monthly payment volume rather than very small practices.

Clinic fit: independent practices and small groups handling both patient payments and insurance payment posting who want a healthcare-native payment vendor.

### Patientco

BAA status: included.

Patientco focuses specifically on patient-facing payment collection. Features include online bill pay, payment plans, financial assistance program integration, and patient payment communications. The platform is designed to reduce the administrative burden of chasing patient balances.

The BAA is included — not negotiated as an add-on. For a small practice managing its own patient AR, Patientco's financial assistance integration is a notable feature that helps practices reduce bad debt while maintaining documentation of assistance decisions.

Pricing is per-transaction or per-practice depending on volume. Request the healthcare pricing structure during the sales conversation.

Clinic fit: practices with meaningful patient AR volumes and self-pay or underinsured patient populations who need payment plan and financial assistance tools.

### Rectangle Health

BAA status: available.

Rectangle Health is a healthcare-focused payment platform covering point-of-service payments, online bill pay, and payment plan management. The platform integrates with a wide range of practice management systems, which reduces the configuration burden for small clinics.

The BAA is available and covers the Rectangle Health payment platform including the patient-facing portal. Confirm during contracting that the integration with your specific PMS is covered under the BAA scope.

Features include contactless and card-present payments, online payment processing, automated payment plans, and patient financing. The breadth of payment modalities makes Rectangle Health suitable for clinics that want a single payment vendor for in-office and online collection.

Pricing is per-transaction. Rectangle Health offers healthcare-specific pricing through direct negotiation.

Clinic fit: small clinics that need PMS integration and coverage across in-office and online payment channels under one BAA.

### Square — no BAA available

Square does not offer BAAs for healthcare customers. The company explicitly states that it does not enter into BAAs and that its products are not designed for PHI handling.

For a medical clinic, this means Square cannot be used for patient payment workflows where the transaction is linked to the patient's identity and health status. That includes any point-of-sale system tied to a patient check-in process, any payment linked to a procedure or diagnosis code, and any reporting that connects payment data to clinical records.

Some practices use Square for incidental retail sales — supplements, medical equipment — where no PHI is involved. That narrow use case may be defensible if the transaction is truly disconnected from patient health data. Consult your compliance officer before making that determination.

### Stripe — no BAA available

Stripe is a widely used payment infrastructure platform that is PCI-DSS certified across its offerings. Stripe does not offer BAAs for healthcare customers and does not position itself as a HIPAA-compliant payment processor.

For healthcare practices that build custom billing or payment portals, Stripe is a common technical choice — and a compliance risk if the implementation involves PHI. Practices using Stripe for patient payment collection are operating without a BAA in a context that almost certainly creates a business associate relationship.

This is not a fringe risk. If your patient billing portal is built on Stripe, the transaction data that flows through Stripe — including patient identifiers linked to payment events — is PHI without a BAA in place.

Practices currently using Stripe for patient payments should consult legal counsel and evaluate a migration to a BAA-capable processor.

## How to evaluate payment processors for HIPAA compliance

**Confirm BAA availability first.** Before evaluating features, pricing, or integrations, ask whether the vendor offers a BAA. If the answer is no, stop the evaluation for clinical use cases.

**Map the data flow.** Identify every point where patient identity data and payment data intersect. Each system in that data flow that is operated by an external vendor may require its own BAA.

**Review the PMS integration scope.** If your payment processor integrates with your practice management system, confirm that the integration itself is covered under the BAA — not just the payment processor's own infrastructure.

**Assess reporting and analytics features.** Payment reporting that includes patient names, procedure codes, or diagnosis codes generates PHI in the reporting environment. Confirm that reporting tools are covered under the BAA.

**Document both PCI-DSS and BAA compliance in your risk analysis.** Your risk analysis should note both the PCI-DSS certification level of your payment processor and the BAA status. They are separate documentation requirements.

## PHIGuard as your compliance operations layer

PHIGuard tracks your payment processor BAA in your vendor inventory, assigns annual review tasks to the appropriate staff member, and helps your practice maintain documentation of your vendor risk assessments.

When you add a new payment integration — or when a vendor changes their BAA terms — PHIGuard is where that update gets recorded and assigned for review.
