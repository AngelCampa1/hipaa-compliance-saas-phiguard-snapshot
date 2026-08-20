---
title: "Healthcare Clearinghouse: HIPAA Definition for Small Clinics"
seoTitle: "Healthcare Clearinghouse: HIPAA Definition"
description: "The HIPAA definition of a healthcare clearinghouse, its role in the claims processing chain, why clearinghouses are covered entities, and what this means for small clinics."
metaDescription: "A healthcare clearinghouse processes health information between standard and nonstandard formats. 45 CFR § 160.103. Learn its role and HIPAA obligations."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "Healthcare Clearinghouse"
intent: "awareness"
summary: "A healthcare clearinghouse is a public or private entity that processes nonstandard health information received from another entity into standard data elements or vice versa. 45 CFR § 160.103. Clearinghouses are covered entities under HIPAA because they receive and process PHI in the course of converting health information formats."
keyTakeaways:
  - "A healthcare clearinghouse translates health information between nonstandard and standard formats (e.g., practice management output to X12 837 claims)."
  - "Clearinghouses are covered entities with direct HIPAA obligations — not merely business associates of the providers they serve."
  - "Most small clinics interact with clearinghouses through their EHR or practice management software without realizing it."
  - "A BAA is required between a covered entity healthcare provider and a clearinghouse used for transaction processing."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 160.103 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "HHS / eCFR"
  - title: "HIPAA Transactions and Code Sets"
    url: "https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa"
    publisher: "CMS"
faq:
  - q: "Is our billing clearinghouse a covered entity or a business associate?"
    a: "A billing clearinghouse is a covered entity in its own right because it meets the HIPAA definition of healthcare clearinghouse. However, a clearinghouse that handles PHI on behalf of your clinic also functions as a business associate, and a BAA is required. Both covered entity status and business associate relationship can apply simultaneously — the covered entity classification describes what the clearinghouse is, while the BA relationship describes its obligations to your clinic specifically."
  - q: "Do we need to sign a BAA with our clearinghouse even though they're a covered entity?"
    a: "Yes. The fact that a clearinghouse is a covered entity does not eliminate the BAA requirement when it handles PHI on your behalf. Under 45 CFR § 164.308(b)(3), when a covered entity uses a healthcare clearinghouse to process transactions, the clearinghouse is also acting as a business associate and the covered entity must have a BAA in place."
  - q: "What happens if a clearinghouse has a data breach that exposes our patients' PHI?"
    a: "The clearinghouse, as a covered entity and business associate, has direct breach notification obligations. The clearinghouse must notify your clinic within 60 days of discovering the breach. Your clinic then has notification obligations to affected patients within 60 days of your own discovery (which in this case is triggered by the clearinghouse's notification to you)."
---

A healthcare clearinghouse is a public or private entity that processes nonstandard health information received from another entity into standard data elements or vice versa. 45 CFR § 160.103 defines the term. Of the three types of covered entities under HIPAA, healthcare clearinghouses are the least visible to small clinic staff — but they process claims on behalf of nearly every practice that bills insurance.

**Small-clinic example:** A 6-provider family medicine practice uses an EHR that automatically routes claims through Change Healthcare before submitting them to payers. The clinic's billing coordinator describes this as "submitting claims through the EHR" — but a clearinghouse is the intermediate party receiving and processing PHI on every claim. If no BAA exists between the clinic and that clearinghouse, every claim transmission is an unauthorized PHI disclosure.

## The Regulatory Definition

Under 45 CFR § 160.103, a **healthcare clearinghouse** is:

> "A public or private entity, including a billing service, repricing company, community health management information system or community health information system, and 'value-added' networks and switches, that does either of the following functions: (1) Processes or facilitates the processing of health information received from another entity in a nonstandard format or containing nonstandard data content into standard data elements or a standard transaction. (2) Receives a standard transaction from another entity and processes or facilitates the processing of health information into nonstandard format or nonstandard data content for the receiving entity."

A clearinghouse sits between providers and payers, translating formats. Healthcare providers generate claim information in their practice management or EHR system's proprietary format. Health plans (payers) require claims in specific standard formats — primarily X12 837 for medical, dental, and institutional claims. A clearinghouse takes the provider's output and converts it into the format the payer requires, then routes the claim.

The process works in reverse too. When a payer sends back an Electronic Remittance Advice (X12 835) or a Claims Status Response (X12 277), the clearinghouse may translate that response into a format the provider's system can process.

## The Claims Processing Chain

To understand where clearinghouses fit, consider the flow of a typical insurance claim from a small clinic:

**Step 1: Claim generation.** After a patient visit, the clinic's EHR or practice management system generates a claim record containing the patient's identifying information, diagnosis codes (ICD-10), procedure codes (CPT or HCPCS), service dates, provider NPI, and facility information.

**Step 2: Clearinghouse transmission.** The practice management system transmits the claim data to a clearinghouse (sometimes via a billing service that uses a clearinghouse). The clearinghouse receives the data in whatever format the provider's system generates.

**Step 3: Format translation.** The clearinghouse translates the claim into the X12 837P (professional), X12 837I (institutional), or X12 837D (dental) format required by the destination payer. It validates the claim for required fields, correct code sets, and payer-specific rules.

**Step 4: Claim submission to payer.** The clearinghouse routes the standardized claim to the appropriate health plan. Many clearinghouses have direct connections to hundreds of payers, which is why providers use them rather than establishing individual connections with each payer.

**Step 5: Acknowledgment and response.** The clearinghouse receives acknowledgments and responses from payers and routes them back to the provider.

Throughout this process, the clearinghouse has accessed, processed, and transmitted PHI — specifically the identifiable patient information embedded in every claim.

## Why Clearinghouses Are Covered Entities

Clearinghouses are classified as covered entities rather than merely business associates because they were central to the original purpose of HIPAA's administrative simplification provisions. HIPAA was designed to standardize electronic healthcare transactions, and clearinghouses are the infrastructure that makes standardization possible. Giving them direct covered entity status — with full Security Rule and Privacy Rule obligations — was a deliberate regulatory choice to ensure that the entities handling the most transaction volume were directly subject to HIPAA enforcement.

Clearinghouses face OCR investigation, civil monetary penalties, and corrective action obligations in the same way that healthcare providers do. A clearinghouse that suffers a data breach affecting thousands of patients from hundreds of provider clients faces direct HIPAA liability, not just contractual liability through the BAA chain.

## The Business Associate Relationship

The fact that a clearinghouse is a covered entity does not eliminate its business associate relationship with the providers it serves. Under 45 CFR § 164.308(b)(3), when a covered entity uses a healthcare clearinghouse to process standard transactions, the clearinghouse is also acting as a business associate. A BAA is required.

This is a case where the same entity carries two distinct HIPAA classifications simultaneously:
- As a **covered entity**, the clearinghouse has direct compliance obligations to OCR.
- As a **business associate** of the healthcare provider clients it serves, it has contractual and regulatory obligations defined by the BAA.

Both operate in parallel. The BAA between the provider and the clearinghouse defines the terms of the business associate relationship — what PHI may be used, how it must be protected, how breaches are reported, and what happens at termination.

For a discussion of what BAAs must contain, see [business associate agreement explained](/learn/hipaa-basics/business-associate-agreement-explained).

## How Small Clinics Interact with Clearinghouses

Many small clinics use clearinghouses without realizing it. EHR systems and practice management software frequently have built-in clearinghouse connections — the claim goes from the EHR directly to the clearinghouse as part of the billing process. Staff may describe this as "submitting claims through the EHR" without recognizing that a clearinghouse is the intermediate party.

Common clearinghouses used by small clinics include Change Healthcare (now part of UnitedHealth Group), Availity, Waystar (formerly Navicure and ZirMed), and Office Ally. These companies process claims for millions of providers.

**For compliance purposes, your clinic should:**

1. **Identify the clearinghouse** used for claim transmission, whether directly or through an EHR integration.
2. **Confirm a BAA is in place.** Most major clearinghouses offer a standard BAA; some include it in their service agreement. If your clearinghouse or billing software provider does not have a BAA with your clinic, one is required before PHI can be shared.
3. **Review the clearinghouse's security documentation** if available — SOC 2 Type II reports are common for major clearinghouses and confirm whether the clearinghouse has maintained security controls over a period of time.
4. **Address the Change Healthcare incident context.** The 2024 Change Healthcare ransomware attack exposed claim data for a significant portion of the U.S. population. Clinics that used Change Healthcare should confirm their status in any affected breach notification process, and should review whether their BAA with Change Healthcare was current and complete.

For a full framework for managing HIPAA compliance in your clinic's billing and payment relationships, see [PHIGuard's HIPAA compliance page](/hipaa).
