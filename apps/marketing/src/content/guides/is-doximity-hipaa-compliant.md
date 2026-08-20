---
title: "Is Doximity HIPAA Compliant for Medical Clinics"
vendor: "Doximity"
seoTitle: "Is Doximity HIPAA Compliant"
description: "Doximity is built specifically for healthcare professionals and offers a Business Associate Agreement. Its secure messaging, fax, and telehealth features are designed with HIPAA controls, but covered entities still carry specific configuration and policy responsibilities."
metaDescription: "Is Doximity HIPAA compliant Yes — Doximity offers a BAA and is purpose-built for healthcare. Learn what clinics still need to configure and govern."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "Doximity is purpose-built for healthcare professionals and offers a Business Associate Agreement. Its core features — secure messaging between clinicians, digital fax, and telehealth — are designed to meet HIPAA technical safeguard requirements. Covered entities using Doximity still carry responsibility for governing access, training staff, and ensuring that Doximity use is integrated into their broader compliance program."
keyTakeaways:
  - "Doximity is a healthcare-native platform and offers a BAA to covered entities and their business associates."
  - "Doximity's secure messaging, fax, and dialer features are designed to meet HIPAA transmission-security requirements."
  - "Access to Doximity requires verified clinician credentials, which limits the user population but does not replace the clinic's own access-control policies."
  - "Doximity is a clinical communication tool, not a compliance management system — clinics still need a separate program for risk analysis, training records, and incident response."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Doximity Security and Privacy"
    url: "https://www.doximity.com/about/security"
    publisher: "Doximity"
  - title: "Doximity Terms of Service for Healthcare Organizations"
    url: "https://www.doximity.com/terms-of-service"
    publisher: "Doximity"
  - title: "Business Associate Contracts — HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
faq:
  - q: "Can any clinic staff member use Doximity, or only physicians?"
    a: "Doximity's core network requires verified clinical credentials for full access, typically for licensed clinicians. Some Doximity organization features allow broader staff access with different permission levels. Confirm the specific access model with Doximity based on your clinic's staff roles."
  - q: "Does Doximity's telehealth feature require additional HIPAA configuration?"
    a: "Doximity Dialer and its telehealth features are designed for HIPAA compliance within the platform. Covered entities should confirm the BAA is executed and review Doximity's current documentation for any organization-level settings that need to be enabled."
  - q: "Is fax through Doximity a HIPAA-compliant alternative to a physical fax machine?"
    a: "Doximity's digital fax service is designed for HIPAA-compliant transmission under the BAA. The clinic must confirm the receiving end is an appropriate authorized recipient. Transmission security is Doximity's responsibility under the BAA; the authorization decision is the clinic's."
  - q: "Does using Doximity satisfy the HIPAA requirement for a compliance program?"
    a: "No. Doximity handles secure clinical communication. A full HIPAA compliance program also requires a risk analysis, access control policies, workforce training, a sanctions policy, incident response procedures, and documentation — none of which Doximity provides."
---

## Verdict: Yes — purpose-built with a BAA

Doximity is one of a small number of clinical communication tools designed from the ground up for healthcare professionals. It offers a Business Associate Agreement and is built to meet HIPAA transmission-security requirements for clinical messaging, fax, and telehealth.

This is a different starting point from most software categories covered in these guides. The question for Doximity is not whether a BAA exists — it does — but whether the clinic has it executed and whether Doximity use fits within a functioning compliance program.

## BAA availability

Doximity provides a BAA for covered entities and business associates. The BAA is a standard part of organizational onboarding. Clinics should ensure the BAA is executed under the appropriate organizational account, not simply through an individual clinician's profile.

## What Doximity covers

**Secure messaging.** Doximity's encrypted messaging between verified clinicians is designed to meet the HIPAA Security Rule's transmission-security standard. Messages are not transmitted via standard SMS or email infrastructure.

**Digital fax.** Doximity Fax provides digital fax that routes through secure infrastructure. The clinic's staff can send and receive PHI by fax through the platform under the BAA.

**Doximity Dialer.** Doximity's Dialer feature allows clinicians to call patients from a clinic or mobile phone while displaying the clinic's phone number — protecting the clinician's personal number and keeping the call record on the clinical side. Dialer is designed for HIPAA-compliant telehealth under the BAA.

## Getting started: BAA execution and organizational setup

Doximity's BAA availability does not mean the BAA is automatically in place. Covered entities must:

1. **Create an organizational account.** Individual clinician accounts are not sufficient for covered-entity compliance. The clinic must establish a Doximity organizational account that can be governed under the BAA.
2. **Execute the BAA.** Contact Doximity's healthcare organization team to execute the BAA for the organizational account. Keep a signed copy in the clinic's vendor records.
3. **Provision staff access through the organizational account.** Staff with access to Doximity organization features should be provisioned through the organizational account, not through personal clinician profiles, to ensure access is revocable at the organizational level.
4. **Set a deprovisioning procedure.** Document how the clinic will remove access when staff leave, including a specific person responsible for executing deprovisioning in Doximity when an employee departs.

## Access control considerations

Doximity's verification requirement — that users must be licensed clinicians — provides a meaningful baseline for access control within the clinical messaging network. However:

- The clinic's broader workforce may include non-clinician staff (front desk, billing, administration) who may have access to certain Doximity organization features
- Staff turnover requires prompt deprovisioning of Doximity access at the organizational account level
- Shared devices at a clinic workstation require a policy to ensure Doximity sessions are not left accessible to unauthorized users

## Doximity Dialer: HIPAA-compliant patient calls

Doximity Dialer allows a clinician to call a patient from a mobile device while displaying the clinic's main phone number rather than the clinician's personal number. This is designed specifically for HIPAA-compliant telehealth under the BAA. The call record stays on the clinical side, and the patient's callback destination is the clinic's published line.

This is a meaningful compliance advantage over using a personal cell phone, where the call record exists only on the clinician's personal device and the patient may call back on a non-clinical line. Clinics using Doximity Dialer should confirm that call logs are accessible through the organizational account and reviewed as part of the clinic's audit routine.

## What Doximity does not replace

Doximity handles secure clinical communication. It does not provide:

- a risk analysis under 45 CFR § 164.308(a)(1)
- workforce training records and attestations
- incident response tracking and documentation
- written policies and procedures


For comparison with communication tools that do not have a BAA, see [Is WhatsApp HIPAA compliant](/resources/guides/is-whatsapp-hipaa-compliant) and [Is FaceTime HIPAA compliant](/resources/guides/is-facetime-hipaa-compliant). For the broader vendor evaluation framework, see [PHI tools and vendor management](/learn/phi-tools-vendors).

## Current Source Posture

The source set for this page is HHS: Business Associate Contracts — HHS Guidance. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Doximity, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Doximity into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Doximity is a healthcare-native platform and offers a BAA to covered entities and their business associates. Doximity's secure messaging, fax, and dialer features are designed to meet HIPAA transmission-security requirements. Access to Doximity requires verified clinician credentials, which limits the user population but does not replace the clinic's own access-control policies. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
