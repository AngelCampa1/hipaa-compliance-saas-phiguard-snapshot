---
title: "HIPAA Compliance for Concierge Medicine and Direct Primary Care Practices"
seoTitle: "HIPAA for Concierge Medicine"
description: "Cash-pay concierge and direct primary care practices often assume HIPAA does not apply because they do not bill insurance. That assumption is usually wrong. This guide explains when concierge practices are covered entities and how to operate compliantly."
metaDescription: "HIPAA compliance guide for concierge medicine and DPC practices: covered-entity status, direct-message PHI, small-staff controls, and a checklist."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Concierge medicine and direct primary care practices commonly believe that not billing insurance keeps them out of HIPAA. The covered-entity test is more nuanced than that, and high-touch patient communication produces more PHI in transit than a typical clinic. This guide walks through the analysis."
keyTakeaways:
  - "A practice becomes a covered entity when it transmits any HIPAA-standard transaction electronically — not just claims."
  - "Use of an NPI, electronic eligibility checks, or any electronic transaction with a covered entity can pull a cash-pay practice in."
  - "Direct messaging, voice memos, and text-based patient communication are PHI when tied to an identifiable patient."
  - "Small staff with mixed roles makes role-based access controls more important, not less."
  - "Concierge practices that genuinely conduct no electronic transactions may not be covered entities, but should still operate to HIPAA standards as a matter of patient trust and state law compliance."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR Parts 160-164 — HIPAA"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA for Professionals — Covered Entities"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "If we do not bill insurance, are we exempt from HIPAA?"
    a: "Not necessarily. The covered-entity test under 45 CFR 160.103 turns on whether the practice transmits any HIPAA-standard transaction electronically. If you check eligibility electronically, submit a single claim for a patient who requests it, or use an NPI in any electronic transaction, you are likely a covered entity for all PHI you hold."
  - q: "Can we use SMS to communicate with patients?"
    a: "Patients can request communication in unsecured channels, and you can honor that request after explaining the risks. But you cannot make unsecured SMS the default for clinical communication, and you cannot transmit PHI to other providers via consumer SMS."
  - q: "Do we need a BAA with our scheduling and payment platform?"
    a: "If the platform stores or processes PHI on your behalf — including appointment notes that identify a patient and a clinical reason — yes. Pure payment processing without clinical context may not require a BAA, but most concierge platforms blend the two."
---

Concierge medicine and direct primary care practices are built around a different financial model than insurance-based primary care, and that model creates a recurring HIPAA misconception: if we do not bill insurance, HIPAA does not apply. The reality is more nuanced, and the practices that get this wrong tend to discover it during a complaint investigation.

This guide is written for practice administrators at concierge medicine practices, direct primary care practices, and hybrid practices that combine cash-pay membership with limited insurance billing.

## Why concierge medicine has unique HIPAA exposure

Three features of concierge and DPC practices change the HIPAA risk profile relative to traditional primary care:

1. The covered-entity question is genuinely ambiguous for some practices, and getting it wrong in either direction creates problems. Assuming HIPAA does not apply when it does is an enforcement risk. Treating yourself as a covered entity when you are not still leaves you subject to state law obligations.
2. The membership model produces high-touch communication: direct messaging, after-hours calls, home visits, and concierge travel coverage. Each channel produces PHI in transit.
3. Practices typically run with small staff, often three to ten people, with overlapping roles. Role-based access controls are easier to skip and harder to defend after the fact.

## Top HIPAA risks for concierge medicine

The risks below repeatedly appear in compliance reviews of cash-pay practices.

- Operating as a covered entity in fact while assuming the practice is exempt, then having no Notice of Privacy Practices, no risk analysis, and no BAAs.
- Direct messaging via consumer apps (iMessage, WhatsApp, Signal personal accounts) without an approved secure messaging platform.
- Voice memos and after-hours notes stored on personal phones without MDM controls.
- Home visit notes captured on personal devices and synced to personal cloud storage.
- Membership platforms that store appointment reasons or clinical notes without a BAA.
- Concierge travel coverage that involves transmitting records to providers in other jurisdictions without authorization.
- Receptionist or office manager roles given full EHR access because the staff is small.
- Family-member members (a common DPC structure) where one member's PHI is discussed with another without authorization.

## Vendor and BAA checklist for concierge medicine

Confirm BAAs for each of the following where they handle PHI:

- EHR or clinical documentation platform.
- Membership and concierge management platform if it stores clinical context.
- Secure messaging platform.
- Telehealth platform.
- Lab vendor and any imaging partner.
- Pharmacy partner for in-house dispensing or e-prescribing services.
- Payment processor if clinical context is attached to charges.
- Email provider (Google Workspace, Microsoft 365) used for clinical communication.
- Cloud storage and document management vendors.
- Bookkeeping or practice management vendor with EHR access.

## State law overlays affecting concierge medicine

Even if a concierge practice is not a HIPAA covered entity, state medical privacy laws still apply. Many states have medical record confidentiality statutes that mirror or exceed HIPAA. Some states regulate direct primary care arrangements specifically and may impose disclosure or recordkeeping requirements. State medical board rules typically require maintenance of complete medical records regardless of HIPAA status. Telehealth-enabled concierge practices that serve patients across state lines pick up the privacy law of each patient state.

The practical consequence: even if you conclude you are not a covered entity, you should generally operate to HIPAA standards because state law and patient expectations will pull you there anyway.

## HIPAA compliance checklist for concierge medicine

1. Conduct and document a covered-entity analysis: list every electronic transaction the practice initiates or receives and identify whether any meet the HIPAA standard transaction definitions.
2. If you are a covered entity, complete a Security Risk Analysis under § 164.308(a)(1) and update it annually.
3. Adopt and post a Notice of Privacy Practices that reflects how the practice actually operates.
4. Sign BAAs with every vendor that stores, processes, or transmits PHI on your behalf.
5. Adopt an approved secure messaging platform and prohibit clinical communication via personal SMS or consumer messaging apps.
6. Configure role-based access in the EHR even with a small staff: clinical, scheduling, billing, and admin roles should not collapse into a single super-user account.
7. Require encryption and MDM on every device used to access PHI, including personal phones if the practice permits BYOD.
8. Document patient communication preferences, including any patient requests to receive communications in unsecured channels.
9. Train every workforce member at hire and at least annually, with documentation of completion.
10. Maintain an incident response runbook that addresses lost devices, accidental disclosure to family-member members, and vendor breach notification.

For broader compliance operations guidance, see [our compliance operations library](/learn/compliance-operations) and [the concierge medicine software page](/hipaa-software/concierge-medicine). To see how PHIGuard supports small concierge and DPC practices with current pricing, see [our HIPAA overview](/hipaa).
