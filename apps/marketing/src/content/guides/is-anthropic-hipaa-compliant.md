---
title: "Is Anthropic HIPAA Compliant as a Healthcare Vendor?"
vendor: "Anthropic"
seoTitle: "Is Anthropic HIPAA Compliant as a Vendor?"
description: "What healthcare organizations must know about Anthropic as a business associate — BAA availability for enterprise API customers, what the agreement covers, shared responsibility obligations, and how to evaluate building on the Claude API for PHI use cases."
metaDescription: "Is Anthropic HIPAA compliant? Enterprise API customers can obtain a BAA. Learn what it covers, what your organization remains responsible for, and how to."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "Anthropic offers a BAA for qualifying enterprise API customers building applications that process PHI. Consumer Claude plans have no BAA. Healthcare organizations building on the Claude API for PHI use cases must obtain a signed BAA before going live. The BAA covers Anthropic's API data handling — the covered entity's application security, access controls, and prompt design remain the covered entity's responsibility."
keyTakeaways:
  - "Anthropic offers a BAA for enterprise API customers — this applies to organizations building healthcare applications on the Claude API, not to consumer plan users."
  - "Consumer Claude.ai plans (Free, Pro) have no BAA and cannot be used with PHI."
  - "A BAA with Anthropic covers how Anthropic handles API data — it does not cover the covered entity's application, access controls, or prompt design."
  - "Organizations must confirm what Anthropic's current enterprise terms cover regarding subprocessors, data retention, and breach notification before executing the agreement."
  - "HIPAA does not have a certification program — Anthropic is not 'HIPAA certified' and no AI vendor can legitimately make that claim."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Anthropic Privacy Policy"
    url: "https://www.anthropic.com/privacy"
    publisher: "Anthropic"
  - title: "Anthropic Usage Policies"
    url: "https://www.anthropic.com/legal/aup"
    publisher: "Anthropic"
  - title: "Claude.ai Terms of Service"
    url: "https://www.anthropic.com/legal/consumer-terms"
    publisher: "Anthropic"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does Anthropic offer a HIPAA Business Associate Agreement?"
    a: "Anthropic offers a BAA for qualifying enterprise API customers. Consumer Claude.ai plans (Free and Pro) do not include BAA coverage. To obtain a BAA, organizations must engage with Anthropic's enterprise sales team. The BAA covers the Claude API service under that enterprise agreement."
  - q: "We are building a patient communication tool using the Claude API. Is the Anthropic BAA sufficient?"
    a: "A BAA with Anthropic is a necessary starting point, but it is not sufficient on its own. Your organization also needs to conduct a security risk assessment of the application itself, implement access controls, train workforce members who access the tool, establish PHI handling procedures for API outputs, and confirm that any other vendors in your stack also have appropriate BAAs."
  - q: "What does Anthropic's enterprise data policy mean for PHI sent through the API?"
    a: "Anthropic states that enterprise customers' prompt data is not used for model training. This is a materially different commitment than what applies to consumer accounts. Verify the current terms in Anthropic's enterprise documentation — data policies evolve and the terms in effect when you sign your agreement may differ from earlier public statements."
  - q: "Can I just say my product is 'HIPAA compliant' because I have an Anthropic BAA?"
    a: "No. A BAA with Anthropic addresses one part of your compliance posture: Anthropic's handling of data sent to the Claude API. HIPAA compliance for your application requires the full set of administrative, physical, and technical safeguards — access controls, audit logging, incident response, workforce training, and more. A vendor BAA does not make your application compliant; it makes the vendor relationship compliant."
---

## Short answer

Conditionally — Anthropic can serve as a HIPAA-compliant business associate for organizations that access the Claude API under a qualifying enterprise agreement with a signed BAA. Consumer claude.ai plans have no BAA and cannot be used with PHI under any circumstances. For healthcare organizations building applications on the Claude API — clinical documentation tools, patient communication systems, coding and billing assistants — the BAA with Anthropic addresses Anthropic's data handling responsibilities. Your own application security, access controls, and data governance remain your responsibility throughout.

## The distinction between Anthropic-the-company and Claude-the-product

This guide addresses Anthropic as a vendor — specifically, the compliance posture of engaging Anthropic as a business associate for API-based healthcare applications. This is distinct from the question of whether claude.ai (the consumer product) is HIPAA compliant for end users, which is addressed separately in [is Claude HIPAA compliant](/resources/guides/is-claude-hipaa-compliant).

The vendor question arises when a healthcare organization or a health tech company:

- Is building a custom application on the Claude API that will process patient information
- Is integrating Claude into an internal tool that touches clinical or administrative PHI
- Is evaluating Anthropic as a subprocessor for a healthcare product in development

In these scenarios, Anthropic is not a software tool being used by staff — it is an AI infrastructure provider that will receive PHI as part of the application's operation.

## When Anthropic is a business associate

Under HIPAA, a vendor becomes a business associate when it creates, receives, maintains, or transmits PHI on behalf of a covered entity. When a healthcare application sends API requests to Anthropic containing patient information — a patient's symptoms to summarize, clinical notes to process, demographic data to contextualize — Anthropic is receiving PHI on behalf of the covered entity. This makes Anthropic a business associate, and a BAA is required before the application goes live.

This is not a gray area. It does not matter whether:
- The PHI is a small portion of the overall request
- The application is for internal use rather than patient-facing
- Anthropic's processing is brief and the output does not retain the original PHI
- The organization believes the data is "de-identified" (de-identification under the Safe Harbor or Expert Determination method requires specific procedures — a judgment call is not sufficient)

If PHI is transmitted to Anthropic's API, a BAA is required.

## What the Anthropic enterprise BAA covers

Based on Anthropic's published enterprise documentation, an enterprise API agreement with Anthropic includes:

**Data handling commitments:** How Anthropic processes and handles API request data under the enterprise agreement. Enterprise customers' data is treated differently from consumer account data — including the absence of model training on enterprise prompt data.

**Security safeguards:** Anthropic's organizational security program, which includes encryption of data in transit and at rest, access controls within Anthropic's infrastructure, and security practices appropriate to the sensitivity of data processed.

**Breach notification:** Obligations to notify the covered entity of security incidents involving PHI within a timeframe consistent with HIPAA requirements.

**Subcontractor provisions:** Acknowledgment of the subprocessors Anthropic uses to deliver the API service, which may include cloud infrastructure providers and other technical vendors.

The specific terms in your executed agreement govern — do not rely on publicly available summaries, including this article, as the definitive statement of what an Anthropic enterprise BAA covers.

## What the Anthropic BAA does not cover

A BAA with Anthropic creates a contractual relationship around Anthropic's portion of the data handling chain. It does not cover:

**Your application's security posture.** If your healthcare application has inadequate access controls, logging gaps, or insecure data storage, those are your compliance obligations, not Anthropic's.

**How prompts are constructed.** If your application sends unnecessarily detailed PHI in prompts — patient names, full clinical records — when the use case could be achieved with less sensitive data, that prompt design decision is yours. Anthropic's BAA does not constrain your prompt engineering choices or ensure they are appropriately minimal.

**User access management.** Which staff members can access your Claude-powered application, under what authentication requirements, and with what audit logging is your organization's responsibility.

**Output storage and retention.** If your application stores Claude API responses that contain PHI — in a database, a log file, a document — those stored outputs fall under your covered entity's PHI retention and disposal obligations.

**Staff who access claude.ai directly.** Personal claude.ai accounts used by staff are not covered under an enterprise API BAA. These are separate products requiring separate agreements.

## The shared responsibility model in practice

Healthcare organizations evaluating Anthropic as a vendor sometimes assume that obtaining a BAA transfers primary compliance responsibility to the vendor. This misunderstands how HIPAA's shared responsibility model works.

The BAA creates dual obligations:
- Anthropic must implement appropriate safeguards for PHI at the API service layer and notify you of incidents
- Your organization must implement the full suite of administrative, physical, and technical safeguards required by the Privacy and Security Rules for everything outside the API service boundary

A useful analogy: your EHR vendor's BAA covers the EHR platform. Your clinic is still responsible for who has credentials, what their access levels are, whether workstations lock on timeout, and whether staff have received privacy training. The BAA divides responsibility; it does not consolidate it with the vendor.

## Steps for healthcare organizations building on the Claude API

Before deploying a PHI-processing application built on the Claude API:

1. **Engage Anthropic's enterprise team** and request a BAA as part of the API agreement negotiation
2. **Review the BAA terms** with your privacy officer or legal counsel — pay particular attention to subprocessor disclosure, breach notification timelines, and data retention terms
3. **Conduct a security risk assessment** of your application, covering the full data flow from user input through the API call to output handling
4. **Implement access controls** that limit which users can access the application and log those access events
5. **Design prompts for minimal PHI exposure** — include only the patient information the use case requires, not the full record
6. **Establish output handling procedures** — where API responses are stored, who can access them, and how they are disposed of at end of retention
7. **Train the workforce** that will use or administer the application on its PHI handling requirements
8. **Document the BAA** in your vendor management records alongside the agreement itself

See [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) for the full framework, and [how to audit vendor HIPAA claims](/learn/vendor-management/how-to-audit-vendor-hipaa-claims) for evaluating Anthropic's enterprise documentation against your compliance requirements.

## The no-certification clarification

Healthcare AI vendor marketing materials often describe products as "HIPAA compliant" or, incorrectly, "HIPAA certified." HIPAA has no certification program. No vendor is certified by any government body to be HIPAA compliant. Anthropic cannot be "HIPAA certified," and any vendor that uses that language without qualification is making a misleading claim.

What HIPAA requires is that covered entities and their business associates implement the required safeguards, execute the required agreements, and maintain the required documentation. A BAA with Anthropic is one necessary piece. It is not a compliance certificate.

## Managing vendor relationships in a compliance program

For small clinics building or evaluating Claude-powered tools, the vendor BAA is one entry in a broader vendor management program. The covered entity needs to track all business associate agreements, ensure they are reviewed and renewed appropriately, and document the risk assessment that preceded each agreement.
