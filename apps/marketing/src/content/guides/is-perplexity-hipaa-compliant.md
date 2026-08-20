---
title: "Is Perplexity AI HIPAA Compliant for Healthcare?"
vendor: "Perplexity AI"
seoTitle: "Is Perplexity AI HIPAA Compliant?"
description: "What small clinics must know about Perplexity AI's lack of BAA coverage, why AI search tools are high-risk PHI vectors, and what a compliant policy looks like for healthcare staff who use search assistants."
metaDescription: "Is Perplexity AI HIPAA compliant? No BAA is available for Perplexity Pro or consumer plans. Learn why AI search tools are PHI risks and what to do instead."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "Perplexity AI does not offer a BAA for any current plan tier, including Perplexity Pro, as of early 2026. Covered entities should prohibit staff from using Perplexity for any search or query that involves patient information. AI search tools are a high-risk PHI vector because staff may naturally include patient context in queries without recognizing it as a disclosure."
keyTakeaways:
  - "Perplexity AI has no BAA available for any plan tier as of the verification date — it cannot be used with PHI."
  - "Perplexity Pro does not include HIPAA support or enterprise data handling commitments."
  - "AI search tools are a high-risk PHI vector: staff commonly include patient names, conditions, or identifiers in queries to get relevant results."
  - "Covered entities need a written AI use policy that explicitly addresses search assistants, not just text generation tools."
  - "Even searching for clinical information without patient context creates habits that make accidental PHI inclusion more likely."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Perplexity AI Privacy Policy"
    url: "https://www.perplexity.ai/privacy"
    publisher: "Perplexity AI"
  - title: "Perplexity AI Terms of Service"
    url: "https://www.perplexity.ai/terms"
    publisher: "Perplexity AI"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "HHS Summary of the HIPAA Privacy Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html"
    publisher: "HHS"
faq:
  - q: "Does Perplexity Pro include HIPAA coverage?"
    a: "No. As of the verification date, Perplexity Pro does not include a BAA or HIPAA-specific data handling terms. Upgrading to Pro does not create a HIPAA-compliant arrangement."
  - q: "What if a staff member uses Perplexity only to look up drug interactions or clinical guidelines, without entering any patient information?"
    a: "That specific use may not involve PHI if the query contains no identifiable patient information. However, the risk is that the same staff member — accustomed to using Perplexity — will later include patient context in a query without realizing it crosses a compliance line. A clear policy that addresses Perplexity by name reduces ambiguity."
  - q: "Is there an enterprise version of Perplexity with HIPAA support?"
    a: "As of the verification date, Perplexity does not offer an enterprise plan with a BAA or HIPAA compliance documentation. Check Perplexity's enterprise page and contact their sales team directly for current options, as product offerings evolve."
  - q: "What AI search tools can healthcare staff use?"
    a: "The safest approach is to restrict AI tool use to products with signed BAAs and documented enterprise data terms. For AI-assisted search that involves clinical information, evaluate tools purpose-built for healthcare search with explicit HIPAA coverage. For general internet research without PHI, the risk is lower, but a written policy should define the boundary."
---

## Short answer

No — Perplexity AI is not HIPAA compliant. As of early 2026, Perplexity does not offer a Business Associate Agreement for any plan tier — not for the free plan, not for Perplexity Pro, and not through any published enterprise channel. A covered entity whose staff uses Perplexity to search queries that include patient information has no contractual protection and no mechanism to ensure Perplexity handles that data in accordance with HIPAA's requirements. This is not a configuration issue or a matter of which plan tier the organization uses — it is a structural gap in what Perplexity offers as a product.

## Why Perplexity has no path to HIPAA compliance at this time

HIPAA compliance for a vendor requires more than a privacy policy and reasonable security practices. A business associate must execute a written BAA with the covered entity, and that BAA must include specific commitments: appropriate safeguards for PHI, breach notification obligations, restrictions on use and disclosure, and subcontractor flow-down provisions.

Perplexity does not publish BAA terms and does not describe a HIPAA compliance program in its publicly available documentation as of the verification date. Its privacy policy and terms of service are written for consumer and business users generally, not for healthcare organizations operating under HIPAA's legal framework. Without a BAA, Perplexity cannot lawfully receive PHI from a covered entity.

This may change. AI product development timelines move quickly, and enterprise healthcare offerings are a competitive segment. Review Perplexity's current documentation and contact their enterprise team directly before making a final determination — but default to prohibition until a BAA is in hand.

## Why AI search tools are a high-risk PHI vector

Healthcare organizations often think about AI compliance risk in terms of text generation tools — an assistant drafting a letter, summarizing notes, or writing a policy. AI search tools like Perplexity create a different and arguably more serious risk: staff members including patient context in search queries as a matter of efficiency.

Consider these real-world patterns:

- A nurse practitioner searching "metformin dose adjustment for 68-year-old patient with stage 3 CKD and [specific creatinine value]" to get a clinically relevant answer
- A billing coordinator searching "ICD-10 code for patient with [specific diagnosis] and comorbidity [secondary condition]" to improve coding accuracy
- A front desk staff member searching "how to explain [specific procedure] to a patient who has [specific condition]" while drafting a pre-visit communication

In each case, the staff member is not intentionally disclosing PHI. They are trying to get a more accurate or relevant answer. But if any combination of those search terms constitutes PHI — which it does when a diagnosis is combined with other identifiers or when the query is part of a process related to a specific patient — the disclosure has occurred.

This pattern is difficult to prevent through individual staff judgment because the value of including patient context is immediate and obvious, while the compliance risk is abstract. The only reliable prevention is a clear policy, reinforced by training, that addresses AI search tools specifically.

## The distinction between AI search and traditional internet search

Some practice administrators assume that using an AI search tool is equivalent to using Google — and that the same informal norms apply. This assumption is incorrect in two important ways.

First, Google Search does not receive queries in a context where the user is authenticated to a session. Perplexity does. When a user is logged into Perplexity, their search history, query content, and usage patterns are associated with their account and subject to Perplexity's data retention and use terms.

Second, AI search tools use large language models that process and generate responses based on the full query content. The data is not simply logged as a string of text — it is processed in ways that are more complex than a traditional search index query. The nature of that processing, and how Perplexity retains or uses query data for model improvement, is not disclosed in terms that provide HIPAA-compliant assurances.

The absence of a BAA is the operative fact here. But the technical reality reinforces why the absence of a BAA matters.

## What a compliant AI search policy looks like

Covered entities should address AI search tools explicitly in their workforce AI use policies. A policy that addresses ChatGPT but does not mention Perplexity, or that addresses "AI assistants" but not "AI search tools," leaves a gap that staff will fill based on personal judgment.

An effective policy should:

1. List approved AI tools by name and describe the approved use cases for each
2. List explicitly prohibited tools, including Perplexity, and explain why (no BAA coverage)
3. Define what information may never be included in any AI tool query, regardless of the tool — patient names, dates of birth, MRN numbers, diagnoses, treatment details, or any combination that could identify a patient
4. Address personal device use — staff using Perplexity on a personal phone during a break while discussing a patient issue
5. Require training at onboarding and annually thereafter
6. Define the incident reporting process for violations

See the [HIPAA AI use policy template](/resources/hipaa-ai-use-policy-template) for a complete policy framework, and [PHI in AI tools](/learn/phi-workflows/phi-in-ai-tools) for a deeper analysis of how PHI enters AI tool processes.

## Alternatives for clinical information search

If staff are using Perplexity to find clinical information — drug interactions, coding guidance, treatment protocols — the appropriate path is not to find a BAA-covered version of the same tool, but to identify the right resource for the specific clinical question.

For drug interactions and prescribing guidance: clinical decision support resources embedded within the clinic's EHR, or dedicated tools like Epocrates or Micromedex that are purpose-built for clinical use and have appropriate data handling terms.

For coding and billing guidance: coding tools built for healthcare billing with appropriate data terms.

For general clinical reference: UpToDate, DynaMed, or similar resources that are designed for the clinical process.

None of these require inputting patient-specific information to return relevant clinical guidance — the reference is looked up by the clinical question, not the patient's specifics.

## Organizational risk if a violation occurs

If a staff member uses Perplexity to search a query containing PHI and HHS investigates a complaint or breach, the covered entity faces exposure on two fronts:

1. The disclosure itself — an impermissible disclosure of PHI to a third party without a BAA
2. The absence of a safeguard — a workforce that was not trained and did not have a policy that would have prevented the disclosure

The second exposure is often more consequential in a corrective action plan. OCR enforcement historically focuses on whether the covered entity had appropriate administrative safeguards and whether workforce training was current. An absence of an AI use policy that addresses tools like Perplexity is a gap that OCR can point to as evidence of systemic compliance failure.

## Building the compliance program layer

Identifying that Perplexity cannot be used with PHI is a compliance decision that needs to be embedded in a larger program. The covered entity needs a way to communicate the policy to staff, track that training has been completed, record incidents when the policy is violated, and demonstrate due diligence to regulators.
