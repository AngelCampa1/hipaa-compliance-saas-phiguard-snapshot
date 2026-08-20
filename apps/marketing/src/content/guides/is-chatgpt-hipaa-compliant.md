---
title: "Is ChatGPT HIPAA Compliant for Medical Clinics"
vendor: "ChatGPT / OpenAI"
seoTitle: "Is ChatGPT HIPAA Compliant"
description: "What small clinics must know about ChatGPT's BAA availability, consumer versus enterprise tiers, training data use, and the compliance risk of staff using AI tools with patient information."
metaDescription: "Is ChatGPT HIPAA compliant Learn about OpenAI's enterprise BAA, consumer tier risks, training data policies, and what clinics must do before using AI with PHI."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "ChatGPT / OpenAI requires a plan-and-use review, not a blanket HIPAA label. Small clinics should understand BAA availability, consumer versus enterprise tiers, training data use, and staff risks before using AI tools with patient information. Clinics must verify covered services, admin settings, retention, access controls, integrations, and PHI boundaries before use."
keyTakeaways:
  - "ChatGPT Free, Plus, and Team plans have no BAA available — using them with PHI is a HIPAA violation."
  - "OpenAI offers a BAA through ChatGPT Enterprise and qualifying API enterprise agreements; the clinic must negotiate these agreements directly with OpenAI."
  - "By default, consumer ChatGPT prompts may be used to train OpenAI's models; Enterprise accounts have different data terms."
  - "Even with an Enterprise BAA, the clinic must assess what PHI is being sent, who can see responses, and how outputs are retained."
  - "Staff using personal ChatGPT accounts for work tasks is an active risk at most clinics; addressing it requires a written AI use policy and training."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
sources:
  - title: "OpenAI Healthcare Addendum"
    url: "https://cdn.openai.com/osa/healthcare-addendum.pdf"
    publisher: "OpenAI"
  - title: "ChatGPT Regulated Workspace Features"
    url: "https://cdn.openai.com/osa/chatgpt-regulated-workspace.pdf"
    publisher: "OpenAI"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "HHS HIPAA Privacy Guidance Index"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinic staff member use free ChatGPT to draft a patient letter?"
    a: "Not if the letter contains any PHI. Free ChatGPT has no BAA. Entering patient names, dates of service, diagnoses, or any other PHI into a free ChatGPT prompt is a potential breach."
  - q: "Does OpenAI use my prompts to train its models?"
    a: "For consumer accounts (Free, Plus), prompts may be used for model training unless the user opts out in settings. ChatGPT Enterprise has separate data terms that exclude prompt data from training by default — verify with the current OpenAI Enterprise Privacy documentation."
  - q: "Is the ChatGPT Enterprise BAA sufficient for clinical use?"
    a: "A signed BAA is necessary but not sufficient. The clinic must also conduct a risk assessment, implement a workforce AI use policy, and ensure that only authorized staff access PHI-adjacent AI tools."
  - q: "What about OpenAI's API used in a third-party health app?"
    a: "If a vendor builds a product on OpenAI's API and that product processes PHI, the vendor is a business associate and must provide you with a BAA. OpenAI's API has its own BAA terms — confirm with the application vendor what agreement is in place."
---

## Short answer

ChatGPT is not HIPAA compliant on consumer plans. OpenAI offers a BAA through ChatGPT Enterprise, which changes the data handling terms and provides contractual coverage. Without an Enterprise agreement, any clinic staff member entering PHI into ChatGPT — including through free or Plus accounts — is creating an unprotected disclosure. This is one of the most common unacknowledged compliance risks in small clinic operations today.

## BAA availability

OpenAI provides a HIPAA-eligible Business Associate Agreement through **ChatGPT Enterprise** and through qualifying **API enterprise agreements**. The following plans have no BAA path:

- ChatGPT Free
- ChatGPT Plus
- ChatGPT Team

The Enterprise plan requires direct engagement with OpenAI's sales team. Pricing is not published on OpenAI's website. The BAA covers the ChatGPT Enterprise product and the specific API usage covered under the enterprise agreement; it does not automatically extend to all OpenAI products or to consumer API usage.

## The training data risk on consumer tiers

Consumer ChatGPT accounts (Free and Plus) include a setting that allows users to opt out of model training. However, the default behavior — and the behavior of staff who have not reviewed their account settings — is that prompts may be used. A patient's name, diagnosis, or treatment detail entered into a free ChatGPT session is potentially being processed by OpenAI's systems in ways the clinic cannot audit or retrieve.

ChatGPT Enterprise's data terms are different: OpenAI states that Enterprise prompt data is not used for training by default. Confirm the current terms in OpenAI's Enterprise Privacy documentation before relying on this for compliance purposes.

## What the Enterprise BAA covers and does not cover

Assuming the clinic has executed a ChatGPT Enterprise BAA, the agreement covers the ChatGPT Enterprise service. It does not:

- Cover personal OpenAI accounts staff may use at home or on personal devices
- Cover third-party applications built on the OpenAI API unless those vendors have their own BAA with you
- Eliminate the clinic's responsibility to conduct a workforce training and AI use policy
- Remove the need for a risk assessment of AI use in patient-adjacent workflows

## Staff use of consumer AI is an active risk

The most common real-world compliance problem with ChatGPT at small clinics is not enterprise deployment — it is staff members using their personal or free-tier ChatGPT accounts for work tasks. Drafting patient correspondence, summarizing visit notes, or generating prior authorization letters through a consumer account exposes PHI without any contractual protection.

Addressing this requires:

1. A written workforce policy that prohibits use of non-approved AI tools for any task involving patient information
2. Training at onboarding and annually thereafter
3. A process for approving new AI tools before staff adoption

## What not to enter into ChatGPT even with an Enterprise BAA

Even under a compliant Enterprise deployment, certain practices carry risk:

- Do not enter patient names combined with diagnoses, treatment plans, or test results unless the workflow requires it and access controls are in place
- Do not store ChatGPT outputs containing PHI outside of a HIPAA-covered system
- Do not allow staff to copy ChatGPT-generated text into external systems without verifying those systems are also BAA-covered

## When AI tools require a broader compliance program


For similar analyses of competing AI tools, see [is Claude HIPAA compliant](/resources/guides/is-claude-hipaa-compliant), [is Anthropic HIPAA compliant](/resources/guides/is-anthropic-hipaa-compliant), [is Perplexity HIPAA compliant](/resources/guides/is-perplexity-hipaa-compliant), and [is DeepSeek HIPAA compliant](/resources/guides/is-deepseek-hipaa-compliant).

## Current Source Posture

The source set for this page is OpenAI: ChatGPT Regulated Workspace Features; HHS: HHS Guidance on Business Associates; HHS: HHS HIPAA Privacy Guidance Index. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For ChatGPT / OpenAI, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing ChatGPT / OpenAI into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. ChatGPT Free, Plus, and Team plans have no BAA available — using them with PHI is a HIPAA violation. OpenAI offers a BAA through ChatGPT Enterprise and qualifying API enterprise agreements; the clinic must negotiate these agreements directly with OpenAI. By default, consumer ChatGPT prompts may be used to train OpenAI's models; Enterprise accounts have different data terms. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
