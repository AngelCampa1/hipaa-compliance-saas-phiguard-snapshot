---
title: "Reviewing Subprocessors in Your Vendor Agreements"
description: "How subprocessors in vendor agreements create HIPAA risk, what to look for in vendor contracts and BAAs, and how to assess whether a vendor's subprocessor chain creates gaps in your compliance program."
metaDescription: "How vendor subprocessors create HIPAA risk. What to look for in BAAs, how to assess subprocessor chains, and when to require subprocessor disclosure."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: vendor-management
summary: "Every vendor your clinic uses may rely on subprocessors — third parties who help the vendor deliver their service. When those subprocessors handle your PHI, they are downstream business associates whose security practices affect your compliance program. Reviewing subprocessors in vendor agreements means understanding who else touches your data, whether appropriate BAAs exist between the vendor and those subprocessors, and what your rights are if a subprocessor causes a breach."
keyTakeaways:
  - "A subprocessor is a vendor that your vendor uses to deliver their service — if they process your PHI, they are a downstream business associate under HIPAA"
  - "Your BAA with the primary vendor should require them to execute BAAs with all subprocessors who handle your PHI — check whether this requirement is in your current BAAs"
  - "Subprocessors are often not disclosed proactively — request the vendor's current subprocessor list as part of BAA renewal reviews"
  - "AI services (OpenAI, Google Cloud AI, AWS Bedrock) are increasingly used as subprocessors by SaaS vendors — their BAA status and training data policies require explicit assessment"
  - "If a subprocessor causes a breach, the primary vendor's BAA obligation to notify you still applies — but recovery may be more complex if the subprocessor agreement was inadequate"
author: angel-campa
reviewer: phiguard-compliance-research
intent: consideration
relatedResource: vendor-renewal-review-checklist
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.308(b)(2) — Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
  - title: "HHS Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.504(e)(2)(ii)(D) — BA Contract Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
---

When you sign a BAA with your EHR vendor, you're holding that vendor accountable for how they handle your PHI. But your EHR vendor doesn't operate alone. They use cloud hosting providers, email delivery services, customer support tools, data analytics platforms, and increasingly AI services. Each of those may receive or process your patients' data. These are subprocessors.

Subprocessors create a compliance chain problem. Your BAA with the primary vendor requires them to handle PHI appropriately — but if they use subprocessors without adequate agreements of their own, there are gaps in the chain where PHI protection is unclear or absent.

## What a Subprocessor Is

A **subprocessor** is a third party that a vendor uses to help deliver their service. In the context of a healthcare software vendor, subprocessors might include:

- **Cloud hosting providers:** AWS, Google Cloud, or Microsoft Azure hosting the vendor's application and database
- **Email delivery services:** Mailgun, SendGrid, or Postmark sending system-generated emails that may contain PHI (appointment reminders, notification emails)
- **Customer support platforms:** Intercom, Zendesk, or Freshdesk used by the vendor's support team — if support tickets reference specific patient scenarios, these platforms may see PHI
- **Analytics and observability tools:** DataDog, Mixpanel, or Sentry monitoring the vendor's application — if error logs contain patient data, these tools may process PHI
- **AI services:** OpenAI, Anthropic, Google, or AWS AI services powering AI features within the vendor's product

Under HIPAA, if a subprocessor processes your PHI on behalf of the primary vendor, the primary vendor must have a BAA with that subprocessor (45 CFR §164.308(b)(2)). The primary vendor is responsible for ensuring their subprocessors handle PHI in accordance with HIPAA requirements.

Your clinic has no direct contractual relationship with the subprocessor. If the primary vendor's subprocessor causes a breach, you're the one with affected patients to notify.

## What Your BAA Should Say About Subprocessors

A well-written BAA between your clinic and a vendor should include provisions that address subprocessors. Review your current BAAs for these provisions:

**Required: obligation to execute downstream BAAs.** Under 45 CFR §164.308(b)(2) and 45 CFR §164.504(e)(2)(ii)(D), the BAA between a covered entity and a business associate must require the BA to "ensure that any agents, including subcontractors, that create, receive, maintain, or transmit protected health information on behalf of the business associate agree to the same restrictions and conditions that apply to the business associate."

If your BAA does not include this obligation, the vendor has no contractual requirement to have BAAs with their subprocessors. This is a gap.

**Preferred: subprocessor disclosure and notification of changes.** Some BAAs, particularly better-drafted enterprise agreements, require the vendor to disclose their current list of subprocessors and to notify the covered entity of material changes. If a vendor adds a new subprocessor (especially an AI service) after the original BAA is signed, you want to know about it.

**Preferred: right to object.** Some BAAs give the covered entity a right to object to new subprocessors within a defined window. Small clinics rarely exercise this right, but its presence demonstrates that the vendor treats subprocessor changes as material events.

## Requesting Subprocessor Lists

Most vendors do not proactively disclose their subprocessors. Requesting the list is a deliberate step you must take during vendor evaluation or BAA renewal.

**During initial vendor evaluation:** Ask directly: "Do you have a published list of subprocessors who may handle PHI?" and "Are all subprocessors who handle PHI covered by BAAs?" Vendors with mature HIPAA programs have this documentation ready. Vendors who can't answer — or who become defensive about the question — likely don't have adequate subprocessor management in place.

**During BAA renewal review:** One item in your renewal checklist should be: "Has the vendor changed their subprocessors since the original BAA was signed?" Ask for an updated subprocessor list and compare it to the prior version.

Some vendors publish their subprocessor lists under "Security" or "Trust" pages. Others require a direct request. If a vendor refuses to disclose their subprocessors at all, that's a significant signal about their compliance posture.

## The AI Subprocessor Problem

In 2024 and 2025, the most significant new subprocessor risk for healthcare software vendors is AI services. A vendor's SaaS application may now send PHI to:

- **OpenAI or Azure OpenAI** for GPT-powered features
- **Google Gemini** for AI-powered analysis
- **AWS Bedrock** for AI model inference
- **Anthropic Claude API** for AI assistance features

Whether these AI services are covered under BAAs between the vendor and the AI provider depends on:
- Which AI service is being used
- Whether the vendor is using the AI service under a BAA-eligible enterprise agreement (not the consumer API)
- Whether the PHI being processed by the AI feature is in scope of the AI provider's BAA

A vendor with a BAA in place may be routing your PHI to an AI service under a consumer API agreement with no BAA at all. The BAA between you and the primary vendor doesn't extend to their uncontracted subprocessors.

Ask vendors with AI features specifically:
1. Which AI provider(s) does the AI feature use?
2. Does the vendor have a BAA with that AI provider for this use?
3. Is PHI from patient records sent to the AI provider's servers, or is inference done locally?
4. Does the AI provider use customer data for model training? Is there an opt-out?

If the vendor can't answer these questions, don't enable the AI feature on PHI-containing data until they can.

## Assessing Subprocessor Risk

When reviewing a vendor's subprocessors, assess each subprocessor against three questions:

**1. Do they handle your PHI?** Not all subprocessors handle PHI. The cloud hosting provider for the vendor's general website may not handle the same data as the vendor's production database. Focus on subprocessors who are in the data path for patient records.

**2. Does the primary vendor have a BAA with them?** This is the question you're asking when you request the subprocessor list with BAA confirmation. If the vendor can't confirm BAA coverage for a specific subprocessor that handles PHI, you have a gap.

**3. What is the subprocessor's own security posture?** For high-risk subprocessors (cloud hosting of production data, AI services with access to clinical records), ask about the subprocessor's own certifications: SOC 2 Type II, HITRUST, or equivalent. The vendor's BAA with the subprocessor is only as effective as the subprocessor's actual security practices.

## When Subprocessors Change

Vendor products evolve. A vendor who used no AI subprocessors in 2022 may use multiple AI services today. A vendor who migrated from AWS to Google Cloud changed their primary infrastructure subprocessor.

The best contractual protection is a subprocessor change notification requirement in your BAA. If your BAA requires the vendor to notify you of material subprocessor changes — with time to object — you have a mechanism to stay current.

If your BAA doesn't include this, add it to your next renewal negotiation. At minimum, add subprocessor review to your annual BAA renewal checklist and ask for the updated list at every renewal. Don't wait until you suspect something has changed.

## What PHIGuard Changes

PHIGuard's vendor management module includes a subprocessor tracking section for each vendor record. The BAA renewal review checklist prompts reviewers to request and assess the current subprocessor list. When a vendor announces new AI features or subprocessor changes, the clinic can create a vendor review task and keep the subprocessor assessment history on the vendor record, so the next reviewer can see what was assessed at each prior renewal.
