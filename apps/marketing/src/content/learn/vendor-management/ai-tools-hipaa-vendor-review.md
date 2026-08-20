---
title: "AI Tools and HIPAA Vendor Review"
description: "A practical guide for small clinics on the HIPAA questions to ask before deploying AI dictation, ambient documentation, scheduling, or coding tools — and what acceptable answers look like."
metaDescription: "Learn how to evaluate AI tools for HIPAA compliance before deploying them in your clinic — BAA requirements, subprocessor questions, and red flags."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: vendor-management
schemaType: article
intent: consideration
summary: "AI tools create HIPAA obligations that differ materially from traditional software. Many clinics deploy AI features without knowing their existing BAA does not cover AI processing, or that their AI vendor is transmitting PHI through foundation model providers who are not identified in any agreement. This guide covers the questions every clinic should ask before deploying an AI tool."
keyTakeaways:
  - "An existing BAA with a software vendor does not automatically cover AI features added to that product — verify coverage before enabling new AI capabilities."
  - "Many AI tools transmit PHI to third-party foundation model providers who must themselves be named as subprocessors under the vendor's BAA."
  - "Vendor claims that patient data is 'de-identified' before AI processing are only valid if the de-identification meets the HIPAA standard under 45 CFR § 164.514(b) — ask for the method."
  - "AI tools that use PHI to train or fine-tune models — even with consent or 'anonymization' — require explicit written authorization and a BAA that covers that use."
  - "No AI tool is off-limits for HIPAA-covered clinics if the right contractual and technical controls are in place. The goal is informed deployment, not avoidance."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: vendor-renewal-review-checklist
relatedCommercialPath: /pricing
sources:
  - title: "HIPAA and Health Information Technology"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/index.html"
    publisher: "HHS"
  - title: "Guidance on HIPAA and Cloud Computing"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html"
    publisher: "HHS"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.514(b) — De-identification of Protected Health Information"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
faq:
  - q: "Can we use ChatGPT or general-purpose AI tools in a clinic setting?"
    a: "General-purpose AI tools not designed for healthcare — ChatGPT consumer tier, general-purpose writing assistants, general-purpose summarization tools — do not come with BAAs and are not designed for PHI. Do not paste patient information into these tools. If staff are using consumer AI tools for any task that involves patient information, that use is a compliance issue that needs to be addressed."
  - q: "What is the difference between a BAA and an AI vendor's 'HIPAA compliance' page?"
    a: "A compliance page describes the vendor's security practices and intentions. A BAA is a legally binding contract that creates specific obligations. A vendor who has a detailed HIPAA compliance page but will not sign a BAA has not made any enforceable commitment. Both are useful — but only the BAA matters for your covered entity compliance program."
  - q: "Our EHR vendor added an AI feature. Do we need a new BAA?"
    a: "Not necessarily a new BAA, but you need to verify that the existing BAA covers AI processing and names any AI subprocessors the new feature uses. Contact your EHR vendor's compliance team and request written confirmation that the AI feature is covered under your current agreement, including the identity of any third-party AI providers involved."
---

Small medical clinics are adopting AI tools faster than their compliance programs are keeping up. Ambient documentation, AI-assisted prior authorization, scheduling chatbots, and coding assistance are now standard features in major EHR and practice management platforms, and many clinics are enabling them without asking the questions HIPAA requires.

The HIPAA analysis for AI tools is the same as for any other vendor that handles PHI. Does this vendor need a BAA? Does the BAA cover this specific use? But AI tools add a layer of complexity traditional software does not: foundation model providers in the processing chain, the possibility of patient data being used for model training, and the gap between how vendors describe "de-identification" and what the HIPAA standard actually requires.

## Why AI tools are different from traditional software

Traditional practice management software processes PHI within a defined, well-understood technical boundary. The application stores data in a database, presents it in a UI, and performs calculations on it. The data path is bounded and describable.

AI tools operate differently in three ways that matter for HIPAA:

**Third-party model providers in the processing chain.** Many AI tools in the healthcare space do not run their own models. They use foundation model APIs from providers like OpenAI, Google, Anthropic, or Amazon. When a clinic uses an ambient documentation tool that sends audio to a cloud transcription service which then passes the transcript to a third-party language model, the PHI is moving through multiple companies who all may qualify as business associates. The clinic's BAA with the ambient documentation vendor does not automatically extend to those downstream providers. The vendor must have BAAs with each of them, and those subprocessors must be identified.

**Model training using PHI.** AI tools improve through training. The question of whether patient data is used to train or fine-tune models is not always clearly answered in vendor marketing materials. Some vendors use customer data for model improvement while describing the practice in terms that obscure it: "improving the service," "federated learning," or "de-identified analytics." Each of these phrases can be consistent with using your patients' information to make the model better.

**De-identification that does not meet the HIPAA standard.** The HIPAA Privacy Rule defines de-identification through two methods: the Safe Harbor method (removal of 18 specific categories of identifying information) and the Expert Determination method (a qualified expert applying statistical and scientific principles to confirm the data cannot be used to re-identify an individual). Many AI vendors describe data as "anonymized" or "de-identified" using internal standards that do not correspond to either method. Data that does not meet the HIPAA de-identification standard is still PHI, and a BAA is required for any vendor who handles it.

## Seven questions to ask every AI vendor

Before enabling any AI feature that touches PHI — in a new product or as an addition to an existing product — ask these questions in writing and request written answers from someone in the vendor's compliance organization.

### 1. Does your product transmit PHI to a third-party AI provider to generate responses?

This establishes whether there is a subprocessor issue. If the answer is yes, follow up: who is that provider, is that provider covered under your BAA, and can you name them in writing?

**Acceptable answer:** Named third-party AI providers, confirmation that each has a signed BAA with the vendor, and a commitment to notify the clinic when providers change.

**Red flag:** "We use various AI partners" without naming them, or "our AI infrastructure is proprietary" when the technology is clearly based on a major foundation model.

### 2. Does your product use PHI to train, fine-tune, or improve AI models?

This is the model training question. Ask it directly — marketing materials frequently do not address it or use language designed to avoid a direct answer.

**Acceptable answer:** PHI is never used for model training, or a specific, named program exists where customer consent is required and clearly documented before any training use.

**Red flag:** "We may use data to improve our services." That is a yes that does not say yes. Follow up until the answer is unambiguous.

### 3. If patient data is used in any aggregated or de-identified form, what de-identification method is applied?

If the vendor claims to de-identify data before any AI training or analytics use, require them to specify whether they use the HIPAA Safe Harbor method, the Expert Determination method, or their own internal standard.

**Acceptable answer:** HIPAA Safe Harbor (list of 18 identifiers removed, no actual knowledge of residual identification risk) or Expert Determination (qualified statistician or expert has certified the standard is met and can provide documentation).

**Red flag:** "We remove names and dates of birth." Partial removal of identifiers is not de-identification under HIPAA. The Safe Harbor method requires removal of all 18 enumerated categories. If the vendor cannot describe their method against either HIPAA standard, treat the data as PHI.

### 4. Who are your AI infrastructure subprocessors and are they covered under a BAA?

A follow-on to question one. Require a written list of all third parties who may receive PHI through the AI features, and confirm BAA coverage for each.

**Acceptable answer:** Named list, current as of a specified date, with confirmation of BAA coverage, and a notification commitment for additions.

**Red flag:** Refusal to name subprocessors, or a subprocessor list with a blanket statement that "all are covered by appropriate agreements" without naming them.

### 5. What is the vendor's data retention policy for PHI processed through AI features?

AI systems sometimes retain inputs for logging, debugging, or improvement purposes. Understand how long PHI persists in the AI layer of the vendor's infrastructure.

**Acceptable answer:** Retention period specified (e.g., inputs are not retained beyond the session, or retained for X days for quality purposes and then deleted), consistent with the vendor's overall BAA terms on data retention and return/destruction at termination.

**Red flag:** "Data retention is handled per our standard terms" without specifying what those terms are for the AI processing layer specifically. The AI layer may have different retention characteristics than the primary application.

### 6. Can AI-assisted features be disabled for specific users or roles?

This matters for access control. In some clinical environments, certain staff roles should not be using AI-assisted features — either because of scope of practice considerations or because access to AI outputs derived from PHI should be controlled.

**Acceptable answer:** AI features can be disabled at the user or role level through administrative controls.

**Acceptable but imperfect answer:** AI features are enabled or disabled at the account level, not the user level.

**Red flag:** AI features are enabled globally and cannot be limited by user.

### 7. Does your BAA specifically cover AI processing of PHI?

Ask for this explicitly. Do not assume that a BAA signed before the vendor added AI features covers those features. Request written confirmation from the vendor's compliance team that the current agreement covers AI processing, including the specific AI subprocessors involved.

**Acceptable answer:** Written confirmation with reference to the specific agreement or amendment, naming the AI processing use case and subprocessors.

**Red flag:** "Our standard BAA covers all aspects of our service" without specific confirmation that AI processing is included.

## Red flags that should stop a deployment

Some vendor responses or behaviors are grounds to pause deployment entirely until the issue is resolved:

- **Vendor claims to be "HIPAA compliant" but cannot identify its AI subprocessors.** HIPAA compliance is not a certification — there is no certifying body that grants it. A vendor who uses this phrase as a substitute for answering specific questions is avoiding the questions.
- **The vendor's BAA does not mention AI processing and the vendor refuses to provide an amendment.** An unaddressed AI processing use is a BAA gap.
- **The vendor's de-identification description does not match either HIPAA standard.** If the de-identification does not meet the HIPAA standard, the data is PHI and the vendor needs a BAA for all uses of it.
- **The vendor's subprocessor list includes a foundation model provider with no enterprise or healthcare terms.** Consumer-tier AI services typically do not come with BAAs and are not designed to process PHI.
- **The vendor cannot answer the training question directly.** AI vendors who obscure data training practices are a compliance risk.

## What acceptable AI deployment looks like

AI tools have genuine clinical value. Ambient documentation cuts documentation time. AI-assisted coding improves billing accuracy. Scheduling automation reduces the phone volume coordinators handle daily. The goal is informed deployment under the same compliance framework that governs every other vendor relationship.

A clinic that deploys an AI tool compliantly has:

1. A current BAA with the AI tool vendor that explicitly covers AI processing
2. A named list of AI subprocessors in that BAA or attached to it
3. Written confirmation that PHI is not used for model training without explicit authorization
4. Documentation of the de-identification method if aggregated data use is permitted
5. Confirmation that the BAA covers return or destruction of PHI at termination, including data in the AI processing layer
6. A record of the review in the clinic's vendor management file

Repeat this review whenever the vendor adds new AI features, changes its subprocessor list, or announces material changes to its data handling terms. A vendor review from 18 months ago may not reflect what the product does today.

## Existing BAAs and newly added AI features

This is the most common practical scenario in 2026: a clinic has a valid BAA with an EHR, billing, or scheduling vendor, and that vendor has added AI features since the BAA was signed. The clinic is now using those AI features without knowing whether the BAA covers them.

Contact the vendor's compliance team and ask, in writing, whether the current BAA covers AI processing, who the AI subprocessors are, and whether an amendment is needed. Most enterprise healthcare vendors have prepared for this question and will either confirm coverage or provide an amendment quickly. Some may require re-executing the agreement.

Do not assume coverage. The original BAA describes the service at the time it was executed. Additions to the service, particularly additions with different data processing characteristics, may require an updated agreement. The documentation of that verification is part of the compliance record.

For vendor-specific compliance analyses, see: [is Claude HIPAA compliant](/resources/guides/is-claude-hipaa-compliant), [is Anthropic HIPAA compliant](/resources/guides/is-anthropic-hipaa-compliant), [is Perplexity HIPAA compliant](/resources/guides/is-perplexity-hipaa-compliant), [is DeepSeek HIPAA compliant](/resources/guides/is-deepseek-hipaa-compliant), [is GitHub Copilot HIPAA compliant](/resources/guides/is-github-copilot-hipaa-compliant), and [is Cursor HIPAA compliant](/resources/guides/is-cursor-hipaa-compliant). For EHR platforms, see [is Epic HIPAA compliant](/resources/guides/is-epic-ehr-hipaa-compliant), [is athenahealth HIPAA compliant](/resources/guides/is-athenahealth-hipaa-compliant), [is Oracle Health HIPAA compliant](/resources/guides/is-oracle-health-hipaa-compliant), and [is Practice Fusion HIPAA compliant](/resources/guides/is-practice-fusion-hipaa-compliant).
