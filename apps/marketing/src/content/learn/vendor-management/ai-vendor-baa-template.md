---
title: "AI Vendor BAA Template Checklist"
seoTitle: "AI Vendor BAA Checklist for Clinics"
description: "What an AI or ML vendor BAA must cover beyond standard HIPAA terms: training data restrictions, prompt logging, model providers, output handling, and residency."
metaDescription: "AI vendor BAA checklist: training data restrictions, prompt logging, output handling, model providers, residency. Not legal advice."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "vendor-management"
schemaType: "article"
intent: "consideration"
summary: "AI vendor BAAs need every standard HIPAA term plus AI-specific clauses around training data, prompt logging, and downstream model providers. This is a checklist to apply when reviewing one - not legal advice. It helps clinics evaluate vendor promises against BAA terms, PHI access, subcontractors, retention, incident support, and evidence they can actually review."
keyTakeaways:
  - "Standard HIPAA BAA terms in 45 CFR Section  164.504(e) apply unchanged. The AI-specific clauses are additions, not substitutions."
  - "Training data restriction is the headline clause: PHI must not be used to train, fine-tune, or improve any model unless you have authorized it in writing."
  - "Many AI vendors resell access to a foundation model provider. Confirm the foundation model provider has signed a BAA with the vendor and that data does not leak to consumer endpoints."
  - "Prompt and output logging policies determine how long PHI sits in the vendor's logs. Demand a documented retention period."
  - "This is a checklist, not legal advice. Have counsel review any AI vendor BAA before signing."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management"
sources:
  - title: "45 CFR Section  164.504(e) - Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
  - title: "45 CFR Section  164.502(e) - Disclosures to Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "HHS Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can we use a general-purpose AI tool like a consumer chatbot for clinical work?"
    a: "Not without a BAA. Consumer-tier AI tools do not include a BAA, and most providers reserve the right to use prompts to train or improve their models. PHI in those prompts is an unauthorized disclosure."
  - q: "Is a 'no training on customer data' setting enough?"
    a: "It is necessary but not sufficient. You still need a signed BAA, prompt logging controls, breach notification commitments, subprocessor flow-down to any underlying model provider, and the rest of the 45 CFR Section  164.504(e) terms."
  - q: "What about AI features inside our EHR?"
    a: "If the AI feature is delivered by your EHR vendor, the EHR's BAA should cover it - but confirm in writing. If the AI is delivered through a third-party model provider, the EHR's BAA needs to flow down to that provider."
---

AI vendors are some of the newest business associates a clinic will sign, and their BAAs often need more careful review than the typical SaaS BAA. The base HIPAA terms still apply, but several AI-specific risks need explicit treatment.

This article is a checklist to apply when reviewing an AI or ML vendor BAA. It is not legal advice. Have counsel review any AI vendor BAA before signing - these contracts evolve quickly and the wrong clause can put PHI in a foundation model's training set.

## Why this vendor category needs HIPAA review

An AI vendor that processes PHI on your behalf is a business associate. Whether the tool is a clinical documentation assistant, an intake summarizer, a coding helper, or a patient messaging draft tool, if PHI flows through it, the BAA is required under 45 CFR Section  164.502(e).

What is different about AI vendors is the data lifecycle. Traditional SaaS reads PHI, returns a result, and stores logs. AI tools may additionally:

- Send prompts to a foundation model provider (OpenAI, Anthropic, Google, AWS) under the AI vendor's account.
- Retain prompts and outputs for evaluation, debugging, or model improvement.
- Use customer data to fine-tune models, sometimes by default.
- Cache embeddings or vector representations of PHI for retrieval.

Every one of those steps is a potential disclosure of PHI. The BAA needs to address each.

## Required BAA terms for AI vendors

Start with the base terms in 45 CFR Section  164.504(e) - permitted uses, safeguards, breach reporting, subcontractor flow-down, termination, HHS access. Then add the AI-specific clauses below.

**Training and fine-tuning prohibition.** PHI must not be used to train, fine-tune, evaluate, or improve any model - neither the vendor's models nor any third-party model - unless the covered entity authorizes it in writing for a specific purpose.

**Foundation model provider flow-down.** If the vendor accesses a foundation model from another provider, that provider must have a BAA in place, the data must route through the BAA-covered API endpoint (not consumer endpoints), and the flow-down obligations under 45 CFR Section  164.502(e)(1)(ii) must be satisfied.

**Prompt and output logging policy.** The BAA should state how long prompts and outputs are retained, who can access them, whether they are encrypted, and when they are purged.

**Output handling.** AI outputs that include PHI are PHI. The BAA should treat outputs the same as inputs - same retention, same encryption, same access controls.

**Data residency.** Where do prompts and outputs land geographically Where does the foundation model provider process them The BAA should commit to a region.

**Subprocessor disclosure.** Vector databases, embedding services, evaluation tools, observability platforms - any of these may touch PHI and need flow-down BAAs.

## Specific risks for AI vendors

- **Default training on customer data.** Some AI products opt customers into training by default. Read the data processing addendum and confirm the BAA overrides it.
- **Consumer endpoint leakage.** A vendor reselling foundation model access may route some queries through consumer endpoints (which generally use prompts for training) instead of the enterprise BAA-covered endpoints. Confirm in writing that all PHI traffic uses the enterprise endpoint.
- **Long log retention.** A 30-day prompt log is reasonable. A two-year log of every prompt with PHI is a problem.
- **Embeddings and vector stores.** Embeddings derived from PHI are PHI. They cannot be stored in a non-BAA-covered vector database.
- **Human review.** Some vendors use human reviewers to label or grade model outputs. If reviewers see PHI, they are workforce members of a business associate and need to be covered.

## Evaluation checklist

1. Is there a signed BAA covering all 45 CFR Section  164.504(e) terms
2. Does the BAA explicitly prohibit use of PHI for training, fine-tuning, evaluation, or improvement
3. If a foundation model provider is involved, is there a BAA between the AI vendor and that provider, and does traffic route through the BAA-covered API
4. What is the documented retention period for prompts and outputs
5. Are prompts and outputs encrypted at rest and in transit
6. Are embeddings or vector stores in scope of the BAA, and where are they hosted
7. Is data residency committed to (US-only, specific regions)
8. Are subprocessors disclosed (vector databases, observability, evaluation, human reviewers)
9. Is human review of PHI prohibited or controlled, and are reviewers covered as workforce
10. Does the BAA commit to a breach notification timeline
11. Is there a documented termination process for purging prompts, outputs, embeddings, and any fine-tuned models
12. Does the vendor maintain SOC 2 Type II or HITRUST attestation
13. Is there an opt-out mechanism for any model improvement programs, and is opt-out the default

## Common mistakes

- **Trusting the marketing page.** "HIPAA-ready" is not a BAA. Get the contract.
- **Using consumer AI tools for clinical work.** Free chatbots and consumer subscriptions do not come with BAAs and typically reserve training rights.
- **Ignoring the foundation model.** The AI vendor may be diligent, but if it routes prompts through a consumer endpoint, PHI ends up in the foundation provider's training pipeline.
- **Skipping log retention.** A vendor that will not commit to a retention period in writing is not BAA-ready.
- **Assuming embeddings are not PHI.** They are derived from PHI and can re-identify. Treat them as PHI.
- **Not involving counsel.** AI BAAs are evolving. Have a lawyer review.

For broader guidance on when a vendor crosses into business-associate territory, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). The [vendor management hub](/learn/vendor-management) covers the program-level work. [PHIGuard](/hipaa) tracks every AI vendor BAA and renewal alongside the rest of your compliance program.
