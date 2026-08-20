---
title: "When HIPAA Applies to Subcontractors"
description: "The 2013 HIPAA Omnibus Rule extended direct HIPAA liability to subcontractors of business associates. This article explains what that means for small clinics reviewing their vendor relationships."
metaDescription: "HIPAA and subcontractors: the Omnibus Rule made subcontractors of business associates directly liable under HIPAA. What this means for clinics and vendors."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: hipaa-basics
schemaType: defined-term
term: "HIPAA subcontractor"
intent: awareness
summary: "Since 2013, subcontractors who handle PHI on behalf of a business associate are directly subject to HIPAA. Clinics don't need direct BAAs with subcontractors, but must ensure their vendors are managing subprocessors under HIPAA - especially for AI tools and cloud services."
keyTakeaways:
  - "The 2013 Omnibus Rule made HIPAA directly applicable to subcontractors who create, receive, maintain, or transmit PHI on behalf of a business associate."
  - "A subcontractor (called a 'business associate' of the business associate) must sign a BAA with the upstream business associate - not directly with the covered entity."
  - "Clinics should ask their vendors whether all PHI-handling subprocessors are covered under HIPAA-compliant subcontractor agreements."
  - "AI tools plugged into existing software are often subcontractors - if an EHR vendor adds an AI dictation feature from a third party, that third party is a subcontractor with direct HIPAA obligations."
  - "Since 2013, OCR can pursue enforcement directly against a subcontractor for HIPAA violations, not only against the covered entity or primary business associate."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: vendor-renewal-review-checklist
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 160.103 - Definition of Business Associate (post-Omnibus)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "eCFR"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "HIPAA Omnibus Rule Final Rule (2013)"
    url: "https://www.federalregister.gov/documents/2013/01/25/2013-01073/modifications-to-the-hipaa-privacy-security-enforcement-and-breach-notification-rules"
    publisher: "Federal Register"
faq:
  - q: "Does our clinic need a BAA with every subcontractor our vendors use?"
    a: "No. The clinic's BAA is with the direct business associate (e.g., your billing company). That billing company must maintain BAAs with its own subcontractors. You don't need a direct BAA with the billing company's cloud platform - but you should ask whether that BAA exists."
  - q: "Who is responsible if a subcontractor causes a breach?"
    a: "Since the Omnibus Rule, OCR can pursue enforcement against the subcontractor directly. The subcontractor is liable for its own HIPAA violations. The covered entity may also face scrutiny if it failed to ensure its business associate had appropriate subprocessor controls in place."
  - q: "How do we know if our EHR vendor's subcontractors are covered under HIPAA?"
    a: "Ask your EHR vendor to confirm in writing that all subprocessors handling PHI are under HIPAA-compliant Business Associate Agreements. Reputable EHR vendors publish their subprocessor list or can provide it on request."
---

Before 2013, HIPAA's business associate rules ran only between covered entities and their direct vendors. The clinic signed a BAA with each vendor, and that was the full chain.

The 2013 Omnibus Rule extended HIPAA's direct applicability to subcontractors - the vendors that business associates rely on to do their work.

## What Changed in 2013

The HIPAA Omnibus Rule, effective September 2013, revised the definition of "business associate" in 45 CFR § 160.103 to include subcontractors. Under the current rule:

A **business associate** includes a person who creates, receives, maintains, or transmits protected health information for a function or activity regulated by HIPAA on behalf of a covered entity **or on behalf of another business associate**.

The italicized addition is the change. A subcontractor who handles PHI for a billing company (which is itself a business associate of a clinic) is itself a business associate. It is directly subject to HIPAA's Security Rule, required to sign a BAA with the billing company, and subject to OCR enforcement.

## The Practical Chain of Obligation

The compliance chain now runs like this:

**Covered entity (the clinic)** → signs a BAA with → **Business associate (billing company)** → must sign a BAA with → **Subcontractor (the cloud billing platform the billing company uses)**

The clinic is not required to have a direct BAA with the subcontractor. But:

1. The billing company is required to have a BAA with the cloud platform.
2. The subcontractor (cloud platform) is directly subject to HIPAA and must implement required security controls independently.
3. OCR can investigate and penalize the subcontractor directly for violations.

The clinic's responsibility is to make sure its vendor - the billing company - is managing its own subprocessors appropriately. That is exactly why vendor review questionnaires ask "Do you have BAAs with all your subprocessors?"

## AI Tools as Subcontractors

The subcontractor issue is most pressing right now because AI features are being embedded in software clinics already use. When an EHR vendor adds an AI-powered documentation assistant from a third-party provider, the chain looks like this:

**Your clinic** uses → **your EHR vendor** (business associate) which integrates → **an AI documentation company** (subcontractor, also a business associate)

The AI documentation company is handling PHI when it processes dictation recordings or generates clinical note drafts. It is a subcontractor of the EHR vendor. It has direct HIPAA obligations. The EHR vendor must have a BAA with the AI company.

The clinic should ask: "For any AI features added to your platform, do you have BAAs with all AI providers who may access patient data?"

If the EHR vendor cannot answer that question clearly, treat it as a compliance flag and document that you asked.

## What Subcontractors Are Required to Do

Under HIPAA since 2013, a subcontractor that qualifies as a business associate must:

- Implement the HIPAA Security Rule's administrative, physical, and technical safeguards
- Sign a BAA with the business associate that engaged them
- Report security incidents and breaches to the upstream business associate (who must then report to the covered entity)
- Be subject to the same HIPAA enforcement as covered entities and primary business associates

The Omnibus Rule closed the argument that a subcontractor can walk away from HIPAA obligations because it has no direct relationship with a covered entity.

## What Clinics Should Do

Small clinics don't need to audit every tier of their vendors' supply chains. The practical steps are:

**1. In your vendor BAA review questionnaire, ask:** "Do you maintain BAAs with all subprocessors that handle PHI? Can you identify your primary PHI-handling subprocessors?"

**2. When a vendor adds new AI features:** Ask explicitly whether the AI feature provider is covered under a BAA with the vendor. If not, PHI should not flow through the AI feature until a BAA is in place.

**3. When evaluating a new vendor:** Check whether the vendor's published privacy documentation or trust center identifies its subprocessors. This is now standard practice for well-run software vendors.

**4. Include subprocessor provisions in your BAA template:** Your BAA with business associates should require them to maintain appropriate BAAs with their own subcontractors and notify you if they add new subprocessors who will handle PHI.

The goal is to make sure the vendors you rely on are managing their own downstream PHI obligations. Tracing every byte of PHI through every tier of the technology stack is not the expectation - asking direct questions and getting answers in writing is.
