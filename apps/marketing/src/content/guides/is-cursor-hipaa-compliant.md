---
title: "Is Cursor HIPAA Compliant for Healthcare Developers?"
vendor: "Cursor"
seoTitle: "Is Cursor AI HIPAA Compliant?"
description: "What healthcare IT teams must know about Cursor's BAA availability, Privacy Mode limitations, and how to evaluate the Cursor AI code editor for use on codebases that touch PHI."
metaDescription: "Is Cursor HIPAA compliant? No BAA is publicly available for Cursor as of early 2026. Learn what Privacy Mode covers, the PHI risks, and what alternatives exist."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "Cursor by Anysphere does not publicly offer a BAA as of early 2026. Cursor's Privacy Mode prevents training on user code but is not equivalent to a signed BAA. Healthcare developers working on PHI-adjacent codebases should use enterprise-grade alternatives with explicit BAA coverage, or contact Cursor directly for current enterprise terms."
keyTakeaways:
  - "Cursor does not publicly advertise a BAA for standard or Business plans as of the verification date."
  - "Cursor Privacy Mode disables code training but does not provide HIPAA-compliant data handling commitments or breach notification obligations."
  - "The absence of a BAA means Cursor cannot lawfully receive PHI as a business associate — regardless of Privacy Mode status."
  - "Healthcare developers should contact Cursor's enterprise team directly for current BAA availability, as the product is actively evolving."
  - "Enterprise alternatives with documented BAA coverage include GitHub Copilot Enterprise (via Microsoft enterprise agreement) and AWS CodeWhisperer (via AWS BAA)."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Cursor Privacy Policy"
    url: "https://cursor.com/privacy"
    publisher: "Anysphere Inc."
  - title: "Cursor Terms of Service"
    url: "https://cursor.com/terms-of-service"
    publisher: "Anysphere Inc."
  - title: "Cursor Business Documentation"
    url: "https://cursor.com/pricing"
    publisher: "Anysphere Inc."
  - title: "HHS HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
faq:
  - q: "Does Cursor Privacy Mode make it HIPAA compliant?"
    a: "No. Cursor's Privacy Mode disables the use of your code for model training and limits some data retention behaviors. These are meaningful privacy protections, but they are not the same as a signed Business Associate Agreement. A BAA is a legal contract with specific obligations for breach notification, security safeguards, and compliance accountability. Privacy Mode is a product setting, not a legal commitment to HIPAA requirements."
  - q: "Cursor is very popular with developers — can't we just use it for non-PHI parts of the codebase?"
    a: "In theory, a developer could use Cursor only on code that never processes or references PHI. In practice, this distinction is difficult to maintain reliably, especially in a codebase where PHI-processing modules and non-PHI modules share utilities, configuration files, and database connection code. Without a BAA, the safest policy is to prohibit Cursor on all repositories related to systems that handle PHI."
  - q: "Has Cursor announced any healthcare or enterprise BAA plans?"
    a: "As of the verification date, Cursor has not publicly announced a HIPAA BAA program. Anysphere is a rapidly growing company and its enterprise offerings continue to develop. Contact Cursor's enterprise sales team directly for current information, and document whatever response you receive for your compliance records."
  - q: "What enterprise AI code assistants do have BAA coverage?"
    a: "GitHub Copilot Enterprise (through Microsoft enterprise agreement) and AWS CodeWhisperer Professional (through the AWS BAA program) are two AI code assistants where BAA coverage is available to qualifying enterprise customers. Both require enterprise agreements and direct verification of BAA scope. Review your current agreements and confirm coverage with your account teams."
---

## Short answer

No — Cursor does not publicly offer a Business Associate Agreement for any of its standard plan tiers as of early 2026. Healthcare developers working on applications that process, store, or transmit PHI cannot use Cursor in its current standard form without creating a compliance gap. Cursor's Privacy Mode — while a meaningful product privacy feature — is not a substitute for a signed BAA. Contact Cursor's enterprise team directly for current options and do not deploy Cursor on PHI-adjacent codebases until BAA coverage is confirmed in writing.

## What Cursor is and why it raises HIPAA questions

Cursor is an AI-first code editor built by Anysphere Inc. It combines a code editor interface with deep AI integration: inline completions, multi-file code generation, a conversational coding assistant, and codebase-aware context. Cursor's AI features work by sending code context — the active file, surrounding code, referenced files, and natural language prompts — to AI model backends to generate responses.

For healthcare developers, this creates the same class of problem that exists with all AI coding tools: code context sent to the AI backend may contain PHI if the codebase includes real patient data, and the vendor must be a covered business associate to receive that data lawfully.

Cursor has become popular in development communities because of its capabilities, and many developers use it across personal and work projects without distinguishing between PHI-adjacent and non-PHI work. For healthcare organizations, this habit creates a compliance risk that requires an explicit policy response.

## Privacy Mode: what it covers and what it does not

Cursor offers a Privacy Mode that can be enabled in account settings. According to Cursor's documentation, Privacy Mode:

- Disables use of your code for model training
- Disables storage of code on Cursor's servers beyond what is needed for immediate request processing
- Does not share code with third parties for training purposes

These are meaningful protections, and Privacy Mode is a better operating posture for any developer working on sensitive code. However, Privacy Mode does not constitute HIPAA compliance for several reasons:

**1. Privacy Mode is a product setting, not a legal contract.** A BAA is a legally binding agreement with specific enforceable obligations. Cursor can change, disable, or modify Privacy Mode through a product update. A BAA, once signed, creates contractual obligations that cannot be unilaterally changed.

**2. Privacy Mode does not include breach notification obligations.** Under HIPAA, a business associate must notify the covered entity of a security incident involving PHI within a defined timeframe. Privacy Mode creates no such obligation and Cursor has no mechanism to identify whether PHI was included in a request.

**3. Privacy Mode does not establish security safeguard standards.** The HIPAA Security Rule requires business associates to implement administrative, physical, and technical safeguards appropriate to the risk. A product's internal privacy settings do not constitute a security program commitment.

**4. Privacy Mode does not address subprocessor accountability.** Cursor uses underlying AI models (currently routing to providers including OpenAI and Anthropic) to power its features. A BAA must include provisions for subcontractors who handle PHI. Privacy Mode does not address this chain.

## The model routing question

Cursor routes AI requests to underlying model providers — depending on the feature and settings, this may include models from OpenAI, Anthropic, and other providers. Even if a healthcare organization had a BAA with OpenAI and with Anthropic individually, those BAAs cover the direct API relationship with each provider. They would not cover a situation where Cursor is routing requests to those providers on the organization's behalf without Cursor itself being party to the BAA chain.

A complete HIPAA-compliant AI coding tool deployment requires:
- A BAA with the coding tool itself (Cursor)
- The coding tool's BAA coverage with its underlying model providers
- Confirmation that the full chain of data handling is within scope

Without a BAA with Cursor, this chain cannot be established.

## Who is at risk within a healthcare organization

For most small clinics, the development team is small or relies on external contractors. The risk scenarios vary accordingly:

**In-house developers:** A developer employed by the covered entity who uses Cursor on the clinic's codebase. If Cursor sends any of that code context — which may include configuration referencing real patient data environments, test fixtures, or debugging logs — to Cursor's backend, a disclosure may have occurred.

**External contractors:** A software contractor who uses Cursor on their personal development setup while working on a healthcare client's application. This is outside the covered entity's BAA coverage even if the covered entity has other AI tool agreements in place.

**Healthcare software vendors:** Companies building healthcare applications on behalf of covered entities. If the software vendor's developers use Cursor on PHI-processing code, the vendor needs its own BAA-backed approach.

## Steps for healthcare organizations to take

Until Cursor offers a publicly available enterprise BAA program:

1. **Prohibit Cursor use on repositories that touch PHI-processing systems.** Define this in your developer policy documentation and enforce it through acceptable use policy, not just technical controls.

2. **Assess current use.** Survey your development team to determine whether Cursor is currently in use on any healthcare codebase. If it is, conduct a review of what code context may have been transmitted and assess the breach notification implications.

3. **Contact Cursor directly.** Reach out to Anysphere's enterprise team and ask explicitly about BAA availability for healthcare customers. Document the response. If a BAA becomes available, evaluate it with the same rigor you would apply to any business associate agreement.

4. **Evaluate enterprise alternatives.** GitHub Copilot Enterprise (through Microsoft enterprise BAA) and AWS CodeWhisperer Professional (through the AWS BAA) are the current best-documented options for enterprise AI code assistance with BAA coverage. Both require enterprise agreements and verification.

## What to verify with any AI code assistant vendor

Before deploying any AI coding tool on PHI-adjacent code, verify the following in writing from the vendor:

- Does the vendor offer a BAA for your plan tier?
- Which products and features are in scope under the BAA?
- Which AI model providers does the vendor use to route requests, and are those providers covered under the vendor's BAA?
- What are the data retention terms for code context submitted through the tool?
- Where is code context data processed (geography)?
- What breach notification procedures apply?

See [how to audit vendor HIPAA claims](/learn/vendor-management/how-to-audit-vendor-hipaa-claims) for a complete vendor evaluation methodology, and [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) for the framework on determining business associate status.

## Building a compliant AI development program
