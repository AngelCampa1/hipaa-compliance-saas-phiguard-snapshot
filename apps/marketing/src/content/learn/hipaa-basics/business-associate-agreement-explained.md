---
title: "What Is a Business Associate Agreement Under HIPAA?"
seoTitle: "Business Associate Agreement (BAA) Explained"
description: "A business associate agreement (BAA) is the HIPAA contract that extends compliance obligations to vendors who handle PHI on your clinic's behalf. This article explains what a BAA must contain, when you need one, and what happens if you operate without one."
metaDescription: "Business associate agreement (BAA) explained: what it is, when HIPAA requires it, required contract elements under 45 CFR §164.504(e), and OCR penalty risk."
publishedAt: 2026-04-28
updatedAt: 2026-05-21
kind: article
pillar: hipaa-basics
intent: awareness
schemaType: defined-term
term: "Business Associate Agreement"
summary: "A business associate agreement is the legal contract HIPAA requires between a covered entity and any vendor who handles PHI on its behalf. Without an executed BAA, both parties face OCR enforcement exposure. This article explains what a BAA is, what it must contain, and how to track executed agreements."
keyTakeaways:
  - "A business associate is any vendor or service provider that creates, receives, maintains, or transmits PHI on a covered entity's behalf - the definition is functional, not contractual."
  - "A BAA is required before sharing PHI with a business associate. Sharing PHI before executing one can violate HIPAA and create enforcement risk."
  - "45 CFR §164.504(e) specifies the required elements a BAA must contain. A vendor's standard contract or DPA is not automatically a HIPAA-compliant BAA."
  - "Tracking executed BAAs is itself a compliance requirement - clinics should maintain a BAA registry with vendor name, PHI scope, execution date, and renewal schedule."
sources:
  - title: "45 CFR §164.504"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "What is a business associate agreement?"
    a: "A business associate agreement (BAA) is a HIPAA-required contract between a covered entity and a vendor (business associate) who handles PHI on the covered entity's behalf. It specifies permitted uses of PHI, security obligations, breach notification requirements, and PHI return or destruction at contract termination."
  - q: "Do all vendors need a BAA?"
    a: "Only vendors who create, receive, maintain, or transmit PHI on your behalf. Vendors with no PHI access - a janitorial service, an office supply company - do not need a BAA. The trigger is PHI access, not the type of vendor."
  - q: "What happens if we operate without a signed BAA?"
    a: "Operating without a required BAA is a HIPAA violation. OCR has issued civil money penalties to covered entities for missing BAAs. The covered entity and the business associate both face exposure."
  - q: "Is a vendor's data processing agreement (DPA) the same as a BAA?"
    a: "Not automatically. A DPA may satisfy GDPR requirements but lack the specific elements HIPAA requires under 45 CFR §164.504(e). Review any DPA against the required BAA elements before relying on it for HIPAA compliance."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedResource: "baa-template"
---

Every vendor that touches your patients' health information creates a HIPAA obligation. The mechanism for managing that obligation is the **business associate agreement** - a required contract that extends HIPAA duties to the vendor and documents exactly how PHI may be used.

Clinics that skip BAAs - or sign agreements that do not meet HIPAA's required elements - are operating with unmanaged compliance exposure. This article explains what a business associate agreement is, when you need one, what it must contain, and how to maintain a BAA registry when vendor relationships change.

## What is a business associate?

HIPAA defines "business associate" at 45 CFR §160.103. The definition is functional: a business associate is a person or entity that performs functions or activities on behalf of, or provides certain services to, a covered entity that involve creating, receiving, maintaining, or transmitting PHI.

The key phrase is "on behalf of." A vendor becomes a business associate based on what they do with PHI, not based on the contract you signed with them. Common business associates for small clinics include:

- **EHR and practice management software vendors** - create and maintain patient records
- **Medical billing companies** - receive and process PHI to submit claims
- **Health information exchange organizations** - transmit PHI between providers
- **Cloud storage and backup services** - maintain encrypted PHI
- **Transcription services** - receive and process clinical dictation containing PHI
- **Document shredding companies** - handle physical PHI at end of life
- **IT managed service providers** - may access systems containing PHI during support
- **Law firms and accountants** - when engaged to provide services involving PHI

Vendors with no PHI access - a janitorial service, an office furniture supplier - are not business associates and do not require a BAA.

One important distinction: a vendor that provides services to your patients directly, rather than on your behalf, is a **healthcare provider**, not a business associate. Labs that treat your patients directly are providers, not business associates.

## When is a BAA required?

A BAA must be in place **before** PHI is shared with a business associate. This means the BAA cannot be an afterthought or a document you execute after the vendor has already been working with your data.

The requirement applies to:

- Written agreements with business associates who will have PHI access
- Subcontractors of business associates who will in turn access PHI (the 2013 Omnibus Rule extended BAA obligations to subcontractors)

The covered entity is responsible for obtaining the BAA. If a vendor refuses to sign a HIPAA-compliant BAA - or claims one is not necessary - that vendor is not an appropriate choice for services involving PHI.

## What a BAA must contain

45 CFR §164.504(e) specifies the required elements of a BAA. A compliant BAA must:

**Establish permitted and required uses and disclosures.** The agreement must specify what the business associate may do with PHI. Permitted uses must not be broader than what HIPAA allows. The BAA may not authorize the business associate to use PHI in ways that would violate HIPAA if done by the covered entity itself.

**Require appropriate safeguards.** The business associate must implement appropriate safeguards to prevent unauthorized use or disclosure of PHI - consistent with the Security Rule requirements for ePHI.

**Require reporting of breaches and impermissible disclosures.** The business associate must report to the covered entity any use or disclosure of PHI not provided for in the agreement, any security incident it becomes aware of, and any breach of unsecured PHI within the timeframes specified in the Breach Notification Rule.

**Require subcontractor BAAs.** If the business associate uses subcontractors who will access PHI, the business associate must ensure those subcontractors are bound by the same restrictions and conditions through their own BAA.

**Provide for patient rights access.** At the covered entity's direction, the business associate must make PHI available for inspection and copying so that covered entities can honor patient access requests.

**Require return or destruction of PHI at termination.** When the contract ends, the business associate must return or destroy all PHI. If return or destruction is not feasible, the business associate must extend the protections of the BAA to any retained PHI.

**Authorize termination for breach.** The covered entity must be authorized to terminate the agreement if the business associate violates a material term of the BAA.

A vendor's standard contract, GDPR data processing agreement, or terms of service is not automatically a HIPAA-compliant BAA. Review any agreement against the required elements at 45 CFR §164.504(e) before treating it as your BAA. Many enterprise SaaS vendors now offer standalone BAA addenda - request that document specifically.

For a template that covers the required elements, see the [HIPAA BAA template](/resources/baa-template). If you already have agreements scattered across email, use the [BAA tracker](/resources/vendor-baa-tracker) to build a single registry before the next vendor review.

## What happens without a signed BAA

Operating without a required BAA is a HIPAA violation. OCR has found covered entities liable for missing BAAs in numerous enforcement actions, including cases where the absence of a BAA was identified during breach investigations.

Penalty exposure depends on the culpability tier established at 45 CFR §160.404:

- **Did not know** - $141 to $71,162 per violation
- **Reasonable cause** - $1,424 to $71,162 per violation
- **Willful neglect, corrected** - $14,232 to $71,162 per violation
- **Willful neglect, not corrected** - $71,162 to $2,134,831 per violation (with a calendar-year cap per identical violation; 2024 inflation-adjusted figures per 45 CFR 102.3)

OCR has treated missing BAAs as willful neglect in cases where covered entities were aware they should have had agreements in place. Beyond direct penalties, a missing BAA makes it harder to prove vendor oversight during an OCR investigation.

Business associates also face direct liability under the Omnibus Rule. A vendor who handles PHI without a BAA is not just a problem for the covered entity - the vendor itself may face enforcement action.

## How to track executed BAAs

Maintaining a BAA is not a one-time event. Covered entities should maintain a **BAA registry** that records:

- Vendor name and primary contact
- Description of PHI the vendor accesses (type and scope)
- BAA execution date
- BAA expiration or renewal date (if applicable)
- Location of the signed agreement (document management system path or physical location)
- Notes on subcontractor BAA requirements

Review the registry at least annually. Vendor relationships change - a vendor that did not previously access PHI may begin doing so after a service expansion. Offboarding a vendor requires confirming they have returned or destroyed PHI per the termination provisions of the BAA.

The [business associate agreement tracker](/resources/vendor-baa-tracker) gives small clinics the columns to record execution date, BAA status, subcontractor review, next review date, and termination follow-up.

When onboarding new vendors, add BAA execution to the procurement checklist before any PHI is shared. Do not allow PHI access to begin based on a verbal assurance that the BAA will follow.

## Negotiating and reviewing BAAs

The BAA's required elements set a floor, not a ceiling. Covered entities should review BAAs for practical protections beyond the minimum:

- **Breach notification timing** - HIPAA permits up to 60 days, but faster notice is operationally preferable. Consider negotiating shorter windows (5-10 business days) for breach discovery reporting.
- **Audit rights** - the right to inspect or audit the business associate's security practices
- **Subcontractor list disclosure** - the right to receive a list of subcontractors with PHI access
- **Data location restrictions** - limits on storing PHI outside the US or in specific jurisdictions

For more on negotiating BAAs with software vendors, see [how to negotiate a BAA with a vendor](/learn/vendor-management/how-to-negotiate-a-baa) and [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa).

## How clinics should handle BAAs

A BAA is not a compliance checkbox. It is the legal mechanism that governs how your vendors handle your patients' information. An unsigned BAA, a BAA that lacks required elements, or a BAA that has not been reviewed since the vendor expanded their service scope are all unresolved compliance gaps.

Build BAA execution into your vendor onboarding process. Maintain a registry. Review agreements when vendor relationships change. And do not assume that because a vendor is well-known or HIPAA-branded, their standard agreement covers everything HIPAA requires.
