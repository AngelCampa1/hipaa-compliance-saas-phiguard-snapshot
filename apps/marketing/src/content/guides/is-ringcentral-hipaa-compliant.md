---
title: "Is RingCentral HIPAA Compliant for Medical Clinics"
vendor: "RingCentral"
seoTitle: "Is RingCentral HIPAA Compliant"
description: "RingCentral offers a BAA for paying covered-entity customers, but clinics still need to confirm covered services, product scope, and PHI handling controls."
metaDescription: "Is RingCentral HIPAA compliant BAA available for paying covered entities. Learn covered services and configuration steps."
publishedAt: 2026-04-24
updatedAt: 2026-05-08
verificationDate: 2026-05-08
summary: "RingCentral can support HIPAA-compliant communication for medical clinics when the clinic is a paying covered-entity customer with an executed Business Associate Agreement and uses services covered by that BAA. RingCentral's current HIPAA document names RingCentral Fax, RingEX, RingCX, the RingCentral App, and several AI/contact-center products as covered services, while warning that legal and technical details can change."
keyTakeaways:
  - "RingCentral makes a BAA available for paying covered-entity customers that use RingCentral services to process PHI."
  - "The current covered-service list includes RingCentral Fax, RingEX, RingCX, the RingCentral App, and specified AI/contact-center products."
  - "Third-party channels, third-party products, and integrations may have separate terms or exclusions, so clinics must verify scope before use."
  - "A signed BAA and covered service are only the baseline; access controls, retention, staff training, and risk analysis remain clinic responsibilities."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "RingCentral and HIPAA"
    url: "https://assets.ringcentral.com/legal/rc-ringcentral-hipaa.pdf"
    publisher: "RingCentral"
  - title: "Business Associate Contracts - HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
  - title: "HIPAA Security Rule - Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR / HHS"
faq:
  - q: "Does RingCentral's standard plan automatically include HIPAA compliance?"
    a: "No. The clinic must be a paying covered-entity customer, execute the Business Associate Agreement, and confirm that the services and features it plans to use are covered before routing PHI."
  - q: "Are RingCentral AI features covered by the BAA?"
    a: "Some RingCentral AI and contact-center products are listed in RingCentral's current HIPAA covered-service footnote, but clinics should verify the exact product names, third-party terms, and configuration requirements in their agreement before using AI with PHI."
  - q: "Can a clinic use RingCentral for faxing PHI?"
    a: "RingCentral Fax is listed as a service covered by the RingCentral BAA, but the clinic must still confirm the fax destination is authorized and maintain access, retention, and audit controls."
  - q: "Is RingCentral HIPAA compliance the same as having a full compliance program?"
    a: "No. RingCentral provides communication infrastructure under a BAA for covered services. A clinic still needs policies, workforce training, a risk analysis, incident response procedures, and documentation of its compliance program."
---

## Verdict: Yes with conditions

RingCentral can support HIPAA-compliant communication for clinics when the clinic has an executed BAA and uses RingCentral services covered by that BAA. Compliance is not automatic at signup, and it does not extend to every third-party channel, integration, add-on, or workflow without review.

## BAA availability and how to get it

RingCentral's current HIPAA document says it makes a BAA available for paying covered-entity customers that use RingCentral services to create, collect, transmit, or maintain PHI. The clinic should execute the BAA before any PHI is routed through the account.

Using RingCentral without an executed BAA, even for a voicemail or message that mentions a patient, creates a compliance gap that cannot be fixed retroactively.

## What the current covered-service list includes

RingCentral's current HIPAA document says the BAA covers PHI processed by specified RingCentral services for paying covered-entity customers. The listed services include RingCentral Fax, RingEX, RingCX, the RingCentral App, RingCentral Contact Center, and named AI/contact-center products.

That list matters because clinics should not assume every feature, integration, channel, or third-party product is covered. Ask RingCentral to confirm in writing whether the exact product, add-on, channel, and AI feature you plan to use is inside the BAA scope.

RingCentral also notes that HIPAA information in the document can change and is general awareness, not legal advice. Treat the document as a starting point for vendor due diligence, then preserve the executed BAA and product-scope confirmation in your evidence file.

## Features that require ongoing attention

Even with a BAA in place, some features demand careful operational management:

**SMS and messaging.** Text messages through the RingCentral app may be covered under the BAA, but the destination phone number and recipient device are outside the clinic's control. Limit PHI in SMS to what is necessary and confirm the recipient can receive it securely.

**Voicemail.** Voicemails can contain PHI spoken by callers. Access to voicemail boxes must be controlled, reviewed, and removed promptly when staff leave.

**Team messaging.** Internal messages through RingCentral collaboration features need retention controls, role-based access, and workforce training so staff do not overshare PHI.

**Call recordings.** Recorded calls that capture PHI must be stored with the same controls as other ePHI and purged on a documented retention schedule.

**AI and summaries.** If your account uses RingCentral AI features, confirm the exact product is covered by your BAA and that staff understand what call, message, or transcript content may be processed.

## Step-by-step: enabling HIPAA compliance in RingCentral

For clinics that confirm the plan is eligible, the setup sequence is:

1. **Contact RingCentral's healthcare or account team.** Request the Business Associate Agreement directly. Do not proceed before the BAA is signed and dated.
2. **Confirm covered services.** Compare your purchased products and planned workflows against the BAA and RingCentral's current covered-service list.
3. **Audit active features.** Review which services, add-ons, AI features, channels, and integrations are active. Confirm which are covered, which are excluded, and which require separate terms.
4. **Configure access and retention.** Establish who can access calls, messages, faxes, voicemails, recordings, and transcripts, then set a documented retention and deletion schedule.
5. **Train staff.** Ensure staff know which communication channels can include PHI, which should stay PHI-free, and how to report accidental disclosures.
6. **Document the configuration.** Retain the executed BAA, product-scope confirmation, settings screenshots, and staff training record as part of the clinic's compliance file.

## The compliance gap a BAA cannot close

A signed BAA and covered service establish the contractual baseline. They do not substitute for:

- a written risk analysis under 45 CFR 164.308(a)(1)
- documented access control policies
- workforce training on PHI handling in communication tools
- an incident response plan


For a broader look at clinical communication tools, compare our guides to [Is WhatsApp HIPAA compliant](/resources/guides/is-whatsapp-hipaa-compliant) and [Is FaceTime HIPAA compliant](/resources/guides/is-facetime-hipaa-compliant), or review the [vendor management framework](/learn/phi-tools-vendors) for evaluating any communication tool.

## Current Source Posture

The source set for this page is HHS: Business Associate Contracts - HHS Guidance; eCFR / HHS: HIPAA Security Rule - Technical Safeguards. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For RingCentral, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing RingCentral into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. RingCentral makes a BAA available for paying covered-entity customers that use RingCentral services to process PHI. The current covered-service list includes RingCentral Fax, RingEX, RingCX, the RingCentral App, and specified AI/contact-center products. Third-party channels, third-party products, and integrations may have separate terms or exclusions, so clinics must verify scope before use. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
