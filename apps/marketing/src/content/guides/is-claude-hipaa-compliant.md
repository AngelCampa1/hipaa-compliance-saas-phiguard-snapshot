---
title: "Is Claude HIPAA Compliant for Medical Clinics?"
vendor: "Claude / Anthropic"
seoTitle: "Is Claude HIPAA Compliant?"
description: "What small clinics must know about Claude's BAA availability, enterprise versus consumer tier differences, data training policies, and the shared responsibility model when using Anthropic's AI for clinical or administrative work."
metaDescription: "Is Claude HIPAA compliant? Learn which Anthropic plans include a BAA, what enterprise data terms cover, and what clinics must do before using Claude with PHI."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "Claude's consumer plans — claude.ai Free and Pro — have no BAA available and cannot be used with PHI. Anthropic offers a BAA for enterprise API customers and Claude.ai Team/Enterprise plan subscribers. Even with a signed BAA, the covered entity remains responsible for access controls, prompt design, and output handling."
keyTakeaways:
  - "Claude.ai Free and Pro accounts have no BAA — using them with patient information is a HIPAA violation."
  - "Anthropic offers a BAA for qualifying enterprise Claude API customers and Claude.ai Enterprise plan subscribers."
  - "Enterprise customers' data is not used to train Anthropic models by default — confirm current terms with Anthropic before relying on this for compliance decisions."
  - "A BAA with Anthropic covers the API service layer; the covered entity remains responsible for what PHI is sent, how outputs are stored, and workforce access controls."
  - "Staff using personal claude.ai accounts for work tasks involving patient data is a real-world risk that requires a written AI use policy."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Anthropic Privacy Policy"
    url: "https://www.anthropic.com/privacy"
    publisher: "Anthropic"
  - title: "Claude.ai Terms of Service"
    url: "https://www.anthropic.com/legal/consumer-terms"
    publisher: "Anthropic"
  - title: "Anthropic Usage Policies"
    url: "https://www.anthropic.com/legal/aup"
    publisher: "Anthropic"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinic staff member use claude.ai Pro to draft a patient follow-up letter?"
    a: "Not if the letter contains PHI. Claude.ai Pro has no BAA. Including patient names, dates of service, diagnoses, or any other identifiable health information in a Pro account prompt is an unprotected disclosure. The staff member would need to be on a Claude.ai Enterprise plan with a signed BAA in place."
  - q: "Does Anthropic use my Claude prompts to train its AI models?"
    a: "For consumer accounts, Anthropic's privacy policy allows use of conversation data to improve services. Enterprise API customers operate under different data terms — Anthropic states that enterprise customers' data is not used to train models. Verify the current terms in Anthropic's enterprise documentation before relying on this for compliance purposes, as terms can change."
  - q: "Is a Claude Enterprise BAA sufficient for clinical use?"
    a: "A signed BAA is a necessary starting point but not the complete picture. The covered entity must also conduct a risk assessment of the specific use case, implement a workforce AI use policy, restrict access to authorized staff, and determine how Claude outputs containing PHI will be stored or disposed of."
  - q: "We are building a patient-facing tool using the Claude API. Do we need a BAA?"
    a: "Yes. If your application sends PHI to Anthropic's API servers — for example, patient symptoms, clinical notes, or demographic data — Anthropic is acting as a business associate. You must execute a BAA with Anthropic before the application goes live. Contact Anthropic's enterprise team to initiate this process."
---

## Short answer

Conditionally — Claude is not HIPAA compliant on consumer plans, but Anthropic offers a BAA for enterprise API customers and for organizations on qualifying Claude.ai Team or Enterprise plans. Without an enterprise agreement, any staff member entering patient information into claude.ai — regardless of the account tier — is creating an unprotected disclosure under HIPAA. With a signed enterprise BAA, compliant use is possible, but the covered entity remains responsible for controlling what PHI flows into and out of the service.

## BAA availability by plan tier

Anthropic's BAA availability as of the verification date noted in this article is as follows:

**Plans with no BAA available:**
- Claude.ai Free
- Claude.ai Pro

**Plans where a BAA may be available:**
- Claude.ai Team (BAA availability — verify directly with Anthropic; terms have been in development)
- Claude.ai Enterprise (BAA available through enterprise agreement)
- Claude API under a qualifying enterprise agreement

Consumer plans are explicitly excluded from HIPAA coverage because they operate under standard consumer terms that do not include the data handling commitments required of a business associate under 45 CFR Part 164. The Enterprise plan and qualifying API agreements include the data processing terms, security commitments, and breach notification procedures required for a BAA.

If you are unsure whether your current Anthropic agreement includes a BAA, assume it does not. Contact Anthropic's enterprise sales team directly and obtain confirmation in writing before any PHI-adjacent use proceeds.

## What "Claude is HIPAA compliant" actually means — and does not mean

The phrase "Claude is HIPAA compliant" is misleading if applied without qualification. HIPAA does not have a certification program — no vendor is "HIPAA certified" in any official regulatory sense. What HIPAA requires is that covered entities execute BAAs with business associates who handle PHI, and that those business associates implement appropriate safeguards.

For Claude specifically, this means:

1. Anthropic can serve as a business associate under a qualifying enterprise agreement.
2. The BAA defines Anthropic's obligations for data handling, breach notification, and security safeguards at the API level.
3. The covered entity remains responsible for everything outside that API boundary: access provisioning, prompt engineering that limits PHI exposure, output handling, and workforce training.

A signed Anthropic BAA does not make every conceivable use of Claude compliant. It creates a contractual framework within which compliant use is possible — but only if the covered entity implements the operational controls required on its side.

## Training data and data use policies for enterprise customers

Consumer AI tools prompted the concern about AI training data in healthcare broadly, and the same question applies to Claude. Anthropic's approach, as stated in its enterprise documentation, is that enterprise customers' conversation data is not used for model training. This is a meaningful distinction from consumer account terms.

However, two points of caution apply:

- **Verify the current terms.** Data use policies for AI providers are active areas of development and revision. The terms that applied when this article was verified may differ from the terms in effect when you are reading it. Pull the current Anthropic Enterprise Privacy documentation and review it before making compliance decisions.
- **Opt-out versus opt-in.** For consumer accounts, the default behavior may allow data use unless the user has taken explicit steps to opt out. Do not assume staff members have reviewed or adjusted their personal account settings.

## The staff consumer-account risk

The most common real-world HIPAA risk with Claude at small clinics is not enterprise deployment — it is individual staff members using personal claude.ai Free or Pro accounts for work tasks. Common scenarios that create exposure:

- A medical assistant drafting patient discharge instructions and asking Claude to make them easier to read, pasting in the patient's name and diagnosis.
- A billing coordinator asking Claude to help write a prior authorization letter for a specific patient procedure.
- A front desk staff member using Claude to draft a response to a patient portal message containing clinical details.

None of these use cases are inherently unreasonable as tasks — but all of them involve PHI, and all of them, if conducted through a consumer Claude account, are unprotected disclosures. The fact that the staff member is only "using AI to help write" something does not change the analysis. If identifiable health information reaches Anthropic's servers outside of a BAA, it is a disclosure.

Addressing this requires:

1. A written workforce AI use policy that lists approved tools, prohibited tools, and the process for requesting approval of new tools
2. Onboarding training and annual refresher training on the policy
3. A designated person or process for reviewing AI tool requests before staff adoption
4. Incident reporting procedures for when the policy is violated

See the [HIPAA AI use policy template](/resources/hipaa-ai-use-policy-template) for a starting framework.

## Using Claude for clinical versus administrative tasks

Healthcare organizations considering Claude tend to fall into two categories: those evaluating it for administrative tasks (drafting correspondence, summarizing policies, writing training materials) and those evaluating it for clinical-adjacent tasks (summarizing clinical notes, assisting with documentation, supporting prior authorization processes).

Both categories may involve PHI. A prior authorization letter for a specific patient contains PHI. A summary of a patient's visit notes is PHI. Even administrative tasks like drafting a communication about a specific patient's appointment involve PHI.

The relevant question is not whether a task is "clinical" or "administrative" — it is whether identifiable patient information will be included in the prompt or will be necessary to generate a useful output. If the answer is yes, a BAA is required before the tool is used.

## Building on the Claude API for healthcare applications

If your organization is a developer or a health tech vendor building an application on the Claude API — a clinical documentation assistant, a patient communication tool, a coding and billing suggestion engine — the BAA obligation is direct and non-negotiable. Your application is transmitting PHI to Anthropic's infrastructure. Anthropic is your business associate.

Steps required before going live with a PHI-bearing Claude API application:

1. Execute a BAA with Anthropic through the enterprise agreement process
2. Conduct a security risk assessment of the application, including the data sent to and received from the Claude API
3. Implement access controls limiting which staff or users can trigger PHI-bearing API calls
4. Define data retention and disposal procedures for API outputs
5. Confirm with Anthropic what subprocessors they use and whether those subprocessors are covered under your BAA

See [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) for the full framework on evaluating business associate relationships.

## What to confirm with Anthropic before signing

Before executing a BAA with Anthropic, covered entities should confirm:

- **Scope of coverage:** Which products and API services are covered under the BAA
- **Subprocessors:** What third-party infrastructure providers Anthropic uses and whether those are disclosed and covered
- **Breach notification timeline:** The timeframe within which Anthropic will notify the covered entity of a security incident
- **Data retention:** How long API inputs and outputs are retained, and what the deletion procedures are
- **Geographic data processing:** Where Claude API requests are processed and stored

These terms should be reviewed by the covered entity's privacy officer or legal counsel, not treated as standard boilerplate.

## The compliance program layer

Obtaining a BAA with Anthropic for an enterprise Claude deployment is one piece of a larger compliance picture. The covered entity still needs the operational infrastructure to manage AI tools responsibly: tracking which tools are approved, maintaining documentation of the BAA, training staff, and handling incidents when PHI is mishandled.
