---
title: "Business Associate: HIPAA Definition for Small Clinics"
seoTitle: "Business Associate: HIPAA Definition"
description: "The precise HIPAA definition of a business associate, common examples, the BAA requirement, post-HITECH direct liability, and subcontractor obligations."
metaDescription: "A business associate under HIPAA performs services for a covered entity that involve PHI. 45 CFR § 160.103. Learn who qualifies and what a BAA requires."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "Business Associate"
intent: "awareness"
summary: "A business associate is a person or entity that creates, receives, maintains, or transmits PHI on behalf of a covered entity while performing services for that covered entity. 45 CFR § 160.103. Business associates must sign a Business Associate Agreement and, since HITECH, are directly liable under HIPAA."
keyTakeaways:
  - "A business associate relationship exists whenever a vendor or contractor handles PHI on behalf of a covered entity — regardless of whether a BAA has been signed."
  - "Covered entities must have a signed BAA with every business associate before sharing PHI with them."
  - "Since the 2013 Omnibus Rule, business associates face direct HIPAA liability — not just contractual liability through a BAA."
  - "Business associates who use subcontractors that handle PHI must obtain BAAs from those subcontractors as well."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR § 160.103 — Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "HHS / eCFR"
  - title: "Business Associate Contracts"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
faq:
  - q: "Is our cloud storage provider a business associate?"
    a: "Yes, if the cloud storage provider stores or has access to PHI on behalf of your clinic. A provider that merely stores encrypted data without the ability to decrypt it may argue it is not a business associate, but HHS guidance indicates that maintaining PHI — even without viewing it — can create a business associate relationship. Obtain a BAA from any cloud storage provider that holds patient records."
  - q: "Our billing company handles claims for us. Do we need a BAA?"
    a: "Yes. Billing companies are a classic example of a business associate. They receive PHI to process claims on your behalf. A BAA is required before sharing PHI with them. Operating without a BAA with a billing company is one of the most common HIPAA violations identified in OCR investigations."
  - q: "Does a cleaning crew that enters exam rooms need a BAA?"
    a: "Generally no. Janitorial staff who may incidentally see a patient name on a whiteboard are not business associates. They do not create, receive, maintain, or transmit PHI on behalf of the covered entity. However, if the cleaning service is given access to filing cabinets or records storage as part of their duties, the analysis may change."
---

A business associate is a person or entity that creates, receives, maintains, or transmits PHI on behalf of a covered entity while performing services for that covered entity. 45 CFR § 160.103 defines the term. Every clinic — every practice, health plan, and clearinghouse subject to HIPAA — operates with outside parties who handle PHI: billing companies, EHR vendors, transcription services, cloud platforms. Understanding the business associate definition is the foundation of managing those relationships correctly.

**Small-clinic example:** A 4-provider internal medicine practice uses a third-party billing service to submit Medicare claims. The billing service receives patient names, diagnosis codes, and service dates for every encounter billed. That billing service is a business associate, and a signed BAA must be in place before your clinic shares a single claim with them.

## The Regulatory Definition

Under 45 CFR § 160.103, a **business associate** is a person or entity that:

**(1) On behalf of a covered entity or organized healthcare arrangement, performs or assists in the performance of a function or activity involving the use or disclosure of individually identifiable health information**, including claims processing, data analysis, utilization review, quality assurance, billing, benefit management, practice management, or repricing; or

**(2) Provides, other than in the capacity of a member of the covered entity's workforce, legal, actuarial, accounting, consulting, data aggregation, management, administrative, accreditation, or financial services** to or for a covered entity, where the provision of the service involves the disclosure of individually identifiable health information.

The two-part definition captures both functional activities (processing claims, managing PHI) and professional services where PHI is disclosed as part of the engagement (legal counsel reviewing records, accountants auditing billing).

The central concept is "on behalf of." A vendor becomes a business associate when it handles PHI in service of the covered entity's operations — not when it independently holds health information for its own purposes.

## Common Business Associates in Small Clinic Operations

For a 3-to-50 person medical clinic, business associates include:

**EHR and practice management software vendors.** Any software vendor whose product stores or processes patient records on your behalf. This includes cloud-based EHR systems, patient portal platforms, and scheduling systems that contain appointment notes. Most major EHR vendors offer standard BAAs; some include them in their service agreements, others require a separate request.

**Medical billing companies and revenue cycle management services.** Entities that submit claims, follow up on denials, and post payments on your behalf have access to PHI for every patient encounter billed. A BAA is required before any PHI is shared.

**Transcription services.** Companies that convert physician dictations into written notes receive audio recordings and produce documents containing detailed PHI. They are business associates.

**Medical records copy services.** Companies that fulfill records requests on behalf of your clinic handle PHI and are business associates.

**Answering services.** A telephone answering service that takes patient messages — including the reason for the call, symptoms, or medication questions — receives PHI and is a business associate.

**Cloud storage providers.** File-sharing platforms, backup systems, or document management tools that store patient records or communications containing PHI are business associates if they can access the data.

**IT support firms.** An IT company with access to your systems — including the ability to log into workstations, servers, or cloud applications that contain PHI — is a business associate.

**Lawyers and accountants.** When legal counsel reviews patient records in the course of providing legal advice, or when an accounting firm audits billing records that include PHI, those professionals become business associates. This does not apply to legal or financial advice that involves no disclosure of individually identifiable health information.

**Business consultants.** A consultant hired to improve clinic efficiency who, as part of that work, reviews operational data tied to patient visits handles PHI and is a business associate.

Vendors that do not handle PHI — office supply companies, building maintenance firms, equipment repair services that never access patient records — are not business associates and do not require BAAs.

## The Business Associate Agreement Requirement

Under 45 CFR § 164.308(b)(1) and § 164.502(e), your clinic must obtain satisfactory assurance, in the form of a written contract or other written arrangement, that the business associate will safeguard PHI appropriately. This written contract is the Business Associate Agreement (BAA).

A BAA must include specific provisions required by 45 CFR § 164.504(e)(2):

- The business associate will use or disclose PHI only as permitted or required by the BAA or as required by law
- The business associate will use appropriate safeguards to protect PHI
- The business associate will report breaches of unsecured PHI to the covered entity
- The business associate will ensure that any subcontractors that create, receive, maintain, or transmit PHI agree to the same restrictions
- The business associate will make PHI available for the individual's right of access
- The business associate will make its internal practices available to HHS for compliance purposes
- At termination of the BAA, the business associate will return or destroy all PHI

For a detailed breakdown of BAA requirements and sample provisions, see [business associate agreement explained](/learn/hipaa-basics/business-associate-agreement-explained).

**The absence of a BAA does not eliminate the business associate relationship.** If a vendor handles PHI on your behalf without a BAA, your clinic has violated 45 CFR § 164.308(b)(1). OCR has assessed civil monetary penalties in cases where covered entities shared PHI with vendors under oral agreements or without any agreement at all.

## Post-HITECH Direct Liability for Business Associates

Before the HITECH Act (2009) and the 2013 Omnibus Rule, business associates were liable for HIPAA violations only through the contractual mechanism of the BAA. The covered entity was directly liable to OCR; the business associate was only liable to the covered entity under contract.

The 2013 Omnibus Rule changed this fundamentally. Under 45 CFR § 164.502(e)(1)(i) as modified by HITECH, business associates are **directly liable** to OCR for violations of certain HIPAA requirements. Specifically, business associates are directly subject to:

- The Security Rule (all safeguard requirements for ePHI)
- Limitations on uses and disclosures of PHI
- The requirement to provide access to PHI for individuals
- The Breach Notification Rule (reporting to the covered entity within 60 days of discovering a breach)
- The prohibition on sale of PHI

OCR can investigate and penalize business associates directly — without proceeding through the covered entity. Business associates can face civil monetary penalties under 45 CFR 160.404, with statutory annual caps that reach $1,500,000 per identical violation in the highest tier (2024-adjusted approximately $2,134,831 under 45 CFR 102.3).

This changes the risk calculus of vendor selection for your clinic. Your billing company or EHR vendor faces the same potential regulatory exposure you do. A vendor with a mature compliance program is a lower-risk partner.

## Subcontractor Business Associates

Under 45 CFR § 164.502(e)(1)(ii), a business associate that uses subcontractors to help perform its services must ensure those subcontractors protect PHI to the same standard. The business associate must obtain a BAA from each subcontractor that creates, receives, maintains, or transmits PHI.

This creates a chain of BAAs. If your clinic's billing company uses an offshore coding firm, the billing company must have a BAA with the coding firm. If that coding firm uses a cloud storage provider, the coding firm must have a BAA with the storage provider. Your clinic is not required to have a direct relationship with sub-subcontractors, but your BAA with the primary business associate should require the business associate to manage its subcontractor chain.

When reviewing BAAs with vendors, confirm the vendor has a mechanism for managing subcontractor BAAs. A vendor that cannot describe its subcontractor PHI handling practices is a compliance risk.

## Identifying Business Associates Before They Become a Problem

Many HIPAA violations in small clinics arise not from intentional misconduct but from relationships that drifted into PHI handling without anyone recognizing the business associate obligation. A vendor is added for one purpose — say, a scheduling tool — and staff begin using it to communicate patient-identifiable information because it is convenient.

A practical approach for your clinic:

1. **Inventory every vendor and service provider** who has any contact with your systems, records, or communications.
2. **For each vendor, determine whether they handle PHI** in any form as part of their services.
3. **For each vendor that handles PHI, confirm a BAA exists** and is current.
4. **For new vendors, make the BAA a condition of engagement** before any PHI is shared.
5. **Review the vendor list annually** to catch relationships that have changed in scope.

PHIGuard helps covered entities manage the full vendor relationship lifecycle — from initial BAA execution through annual review — as part of its HIPAA compliance platform. Learn more at [PHIGuard's HIPAA page](/hipaa).
