---
title: "Is HubSpot HIPAA Compliant for Medical Clinics"
vendor: "HubSpot"
seoTitle: "Is HubSpot HIPAA Compliant"
description: "HubSpot offers a BAA for customers on Enterprise plans with the HIPAA compliance add-on enabled. Clinics using lower tiers or the default configuration cannot store PHI in HubSpot legally."
metaDescription: "Is HubSpot HIPAA compliant BAA available on Enterprise with add-on. Learn which HubSpot plans support PHI and what configuration is required."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "HubSpot can support HIPAA-compliant use cases, but only on Enterprise plans with a specific HIPAA compliance add-on enabled. Without that add-on and a signed BAA, HubSpot is not suitable for storing or processing PHI. Most small clinics will find the Enterprise tier pricing exceeds the value of using a general CRM for patient-adjacent data."
keyTakeaways:
  - "HubSpot's BAA is available only on Enterprise plans that include the HIPAA compliance add-on — not on Starter or Professional."
  - "Enabling HIPAA mode in HubSpot restricts certain features, including some AI tools and third-party integrations."
  - "Marketing emails, forms, and contact records in HubSpot that capture PHI require the full Enterprise add-on configuration."
  - "Small clinics typically face a significant cost gap between HubSpot Enterprise and purpose-built HIPAA compliance tools."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "HubSpot HIPAA Compliance Documentation"
    url: "https://www.hubspot.com/security"
    publisher: "HubSpot"
  - title: "Business Associate Contracts — HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
  - title: "HIPAA Privacy Rule — 45 CFR Part 164"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164"
    publisher: "eCFR / HHS"
faq:
  - q: "Does HubSpot's Professional CRM plan support PHI?"
    a: "No. The BAA and HIPAA compliance features in HubSpot are restricted to Enterprise plans with the HIPAA compliance add-on. Professional plan customers cannot store or process PHI in HubSpot under a valid BAA."
  - q: "Which HubSpot features are turned off in HIPAA mode?"
    a: "HubSpot's HIPAA configuration disables features where data would be processed outside the BAA scope, including certain AI content generation tools, some marketing automation features, and third-party integrations that are not separately covered. Consult HubSpot's current HIPAA documentation for the full list."
  - q: "Can a clinic use HubSpot forms on its website to collect patient information?"
    a: "Only if the clinic is on an Enterprise plan with the HIPAA add-on and the BAA is active. A standard HubSpot form that captures a patient's name, condition, or inquiry about treatment is collecting PHI and requires all of these protections."
  - q: "What is HubSpot's audit logging capability for PHI?"
    a: "HubSpot provides activity logging at the account level. Clinics should confirm with HubSpot that this logging meets the audit control requirements under 45 CFR § 164.312(b) for the specific data objects containing PHI."
---

## Verdict: Yes with conditions — Enterprise with add-on only

HubSpot supports HIPAA-compliant use, but the path is narrow. A signed BAA is available only on HubSpot Enterprise plans that have the HIPAA compliance add-on enabled. Standard plans at any lower tier are not covered.

For most small clinics, this creates a practical problem: HubSpot Enterprise is priced for mid-market and large organizations, not for a three-to-fifty-staff medical practice that needs a CRM.

## BAA availability and tier requirements

HubSpot's knowledge base documents that HIPAA compliance support, including BAA execution, is part of the Enterprise plan with the add-on. This applies across HubSpot's product hubs — Marketing Hub, Sales Hub, Service Hub, and CMS Hub — at the Enterprise tier only. The separate HIPAA compliance add-on agreement must also be executed; the Enterprise plan alone is not sufficient.

A clinic on HubSpot Starter or Professional — across any hub — that stores patient intake data, contact forms mentioning health conditions, or appointment-related communications in HubSpot is out of compliance. Marketing Hub Starter, Sales Hub Starter, and Sales Hub Professional are all explicitly excluded. The PHI is in a system without a BAA.

## What HIPAA mode restricts

When the HIPAA compliance add-on is enabled, HubSpot restricts features that process data outside the BAA's scope:

- Certain AI tools, including AI-generated email content and AI chatbots, are limited or disabled
- Some third-party integrations must be individually evaluated for BAA status
- Data processing for marketing analytics may be restricted

The specific list changes with product updates. Verify the current restrictions directly with HubSpot's compliance documentation when setting up the configuration.

## The PHI-in-CRM risk for clinics

Even with a BAA and HIPAA mode, using a general-purpose CRM for patient-adjacent data requires ongoing governance. Common risk points in a HubSpot-based clinical workflow include:

- **Contact properties.** Custom properties added to contact records can accumulate PHI if staff use free-text fields without training.
- **Email threads.** HubSpot's email-logging feature attaches email content to contact records. PHI-containing emails from patients or referral sources can land in records without deliberate action.
- **Form submissions.** Patient inquiry forms on a clinic website that feed into HubSpot must be scoped to avoid collecting PHI unless the full HIPAA configuration is active.
- **Third-party integrations.** Any integration that pulls PHI from an EHR or billing system into HubSpot is a separate data flow requiring its own BAA assessment.

## Enabling HIPAA mode in HubSpot: what's involved

For clinics on an eligible Enterprise plan, the configuration process involves more than a settings toggle:

1. **Execute the Enterprise BAA.** Contact HubSpot's sales or account team to execute the BAA as part of the Enterprise agreement. This is not available through the standard web signup flow.
2. **Enable the HIPAA compliance add-on.** The add-on must be separately activated. This restricts certain AI features, third-party data shares, and marketing analytics that would otherwise process contact data outside the BAA's scope.
3. **Audit active integrations.** Each HubSpot integration that pulls or pushes data containing PHI must be individually evaluated. Any third-party app that receives PHI through a HubSpot integration is a separate business associate and requires its own BAA.
4. **Configure contact property access.** Restrict access to contact records that may contain PHI to only staff with a legitimate need. HubSpot's role-based permissions should be used to enforce this.
5. **Train staff on free-text fields.** Free-text properties in HubSpot contact records are a common source of unintended PHI accumulation. Staff must be trained not to enter clinical details into general-purpose contact fields.

## What small clinics usually discover

HubSpot makes sense for a clinic's external marketing: tracking leads, running educational email, managing non-patient contacts. The moment the contact record touches patient information — even an inquiry about a specific condition — it becomes a PHI question.

Small clinics that need patient-adjacent tracking and compliance documentation in one place typically find that purpose-built HIPAA tools cost less than HubSpot Enterprise and require less customization to stay safe.

## Current Source Posture

The source set for this page is HHS: Business Associate Contracts — HHS Guidance; eCFR / HHS: HIPAA Privacy Rule — 45 CFR Part 164. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For HubSpot, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing HubSpot into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. HubSpot's BAA is available only on Enterprise plans that include the HIPAA compliance add-on — not on Starter or Professional. Enabling HIPAA mode in HubSpot restricts certain features, including some AI tools and third-party integrations. Marketing emails, forms, and contact records in HubSpot that capture PHI require the full Enterprise add-on configuration. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
