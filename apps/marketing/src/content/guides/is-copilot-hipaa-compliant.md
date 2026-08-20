---
title: "Is Microsoft Copilot HIPAA Compliant for Medical Clinics"
vendor: "Microsoft Copilot"
seoTitle: "Is Microsoft Copilot HIPAA Compliant"
description: "Microsoft 365 Copilot can be covered under a BAA for enterprise customers with the right configuration. Consumer Copilot and Copilot in Bing are not HIPAA compliant. The distinction between product variants matters significantly for clinics."
metaDescription: "Is Microsoft Copilot HIPAA compliant M365 Copilot on qualifying enterprise plans can qualify. Consumer Copilot does not. What clinics must verify."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "Microsoft Copilot requires a plan-and-use review, not a blanket HIPAA label. Microsoft 365 Copilot can be covered under a BAA for enterprise customers with the right configuration, while consumer Copilot and Copilot in Bing are not HIPAA compliant. Clinics should verify covered services, admin settings, retention, access controls, integrations, and PHI boundaries before use."
keyTakeaways:
  - "Microsoft 365 Copilot can be in scope under Microsoft's BAA for qualifying M365 enterprise plans when configured correctly."
  - "Consumer Copilot — including Copilot in Bing and the free Copilot app — has no BAA and is not suitable for PHI."
  - "Microsoft must be configured to disable using customer data for model training before PHI is submitted to any Copilot feature."
  - "Even in a covered M365 environment, staff must be trained on which Copilot interactions are permitted and which create PHI exposure."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Microsoft HIPAA Compliance Offering"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft"
  - title: "Microsoft 365 Copilot Data Privacy"
    url: "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy"
    publisher: "Microsoft"
  - title: "Business Associate Contracts — HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
faq:
  - q: "Is Copilot in Microsoft Teams HIPAA compliant?"
    a: "Copilot in Teams is part of Microsoft 365 Copilot. If the organization has a qualifying M365 enterprise plan with an executed Microsoft BAA and correct compliance configuration, Copilot in Teams may be covered. Organizations on consumer or lower-tier plans are not covered."
  - q: "What is the difference between Microsoft 365 Copilot and Copilot in Bing?"
    a: "Microsoft 365 Copilot is an enterprise product integrated into the M365 productivity suite. Copilot in Bing is a consumer-facing AI assistant with no healthcare contractual protections. Do not submit PHI to Bing-based or consumer Copilot surfaces under any circumstances."
  - q: "Does Microsoft's BAA cover Copilot's ability to read documents and emails?"
    a: "Microsoft 365 Copilot's features — including reading emails, meeting transcripts, and documents from M365 apps — can be in scope under the BAA for qualifying enterprise plans. The key requirement is that the M365 tenant is configured for HIPAA compliance and the BAA is active."
  - q: "What if a staff member uses their personal Microsoft account for Copilot?"
    a: "Personal Microsoft accounts are consumer accounts and are not covered under any enterprise BAA. A staff member using personal-account Copilot to process work-related PHI creates an unauthorized disclosure. Clinics need a policy prohibiting PHI use on consumer AI tools."
---

## Verdict: Conditional for M365 Enterprise; No for consumer products

Microsoft Copilot is not a single product — it is a brand applied to several AI experiences with very different compliance profiles. Getting the answer right requires knowing which Copilot the clinic is using.

Microsoft 365 Copilot, the enterprise product integrated into M365 apps, can be in scope under Microsoft's BAA for healthcare organizations on qualifying enterprise plans. The free Copilot in Bing, Copilot.microsoft.com in its consumer mode, and the standalone Copilot app are consumer products with no healthcare BAA coverage.

## Consumer Copilot: a hard no

The free or consumer-tier Copilot experiences — accessed through Bing, Windows, or a personal Microsoft account — operate under consumer terms of service. Microsoft does not offer a BAA for these products. Submitting any patient information through a consumer Copilot surface is a HIPAA violation regardless of intent.

## GitHub Copilot: not a PHI tool

GitHub Copilot is a separate Microsoft product designed for software development assistance. It is not intended for clinical or administrative use and has no healthcare BAA pathway for PHI. Clinic staff should not use GitHub Copilot to process patient data. This guide does not address GitHub Copilot further because it operates in a code context, not a healthcare workflow context.

## Microsoft 365 Copilot in an enterprise environment

Microsoft 365 Copilot is the AI layer that integrates with Word, Excel, Outlook, Teams, and other M365 apps. For organizations on qualifying enterprise M365 plans with an active Microsoft healthcare BAA, Microsoft 365 Copilot can be in scope.

Microsoft's compliance documentation confirms that for covered healthcare customers, Microsoft 365 services — including certain Copilot features — are covered under the Microsoft Online Services Terms and the associated BAA. Clinics must:

1. Confirm they are on an eligible M365 enterprise plan (typically E3 or E5, or equivalent with Copilot add-on)
2. Have an executed Business Associate Agreement with Microsoft
3. Ensure the tenant is configured to prevent data from being used for model training

## AI training, data use, and PHI coverage

Three questions a clinic must answer before any staff member uses a Copilot feature:

**(a) Is AI training on your data on by default**
For consumer Copilot (Copilot in Bing, the free Copilot app, personal Microsoft accounts), Microsoft's consumer terms permit use of interactions to improve AI services — and there is no BAA path to make this acceptable for PHI. For enterprise M365 commercial tenants, Microsoft's terms commit that customer data is not used to train foundation AI models. This is a default protection for commercial accounts that distinguishes them from consumer accounts.

**(b) How to confirm and verify it**
In the Microsoft 365 Admin Center, confirm that the tenant is a commercial enterprise account (not a consumer or education tenant). Review the Microsoft Online Services Data Protection Addendum, which documents the no-training commitment for commercial data. If the organization has customized data-processing settings, confirm through Microsoft's compliance portal that AI model training is not enabled. Unlike some vendors, Microsoft does not require a separate admin toggle for the training-off protection in standard commercial M365 — but hybrid or mixed-mode tenants should verify their specific configuration.

**(c) Are prompts containing PHI covered by the BAA**
Prompts submitted through Microsoft 365 Copilot in Word, Excel, Outlook, Teams, and other covered M365 services are within the scope of the Microsoft healthcare BAA for organizations on qualifying enterprise plans with an active BAA. Prompts submitted through consumer Copilot surfaces — including Bing, the personal Copilot app, or copilot.microsoft.com accessed with a personal Microsoft account — are not covered, even if the user's device is otherwise managed by the organization.

## What staff must understand

Even in a compliant M365 environment with Copilot in scope:

- Staff cannot paste patient records into a Copilot prompt and assume the output is subject to the same access controls as the source record
- Copilot-generated summaries stored in M365 apps become ePHI and carry the same access requirements
- Consumer Copilot on personal devices — including personal Windows laptops — is not covered and must be addressed in policy

## Parallel AI tool guidance

The Microsoft Copilot question parallels the Google Gemini question for Workspace customers. Both are enterprise AI tools with BAA availability in specific configurations and consumer versions that are off-limits. See [Is Google Gemini HIPAA compliant](/resources/guides/is-gemini-hipaa-compliant) for the Gemini side of this comparison.
