---
title: "Is GitHub Copilot HIPAA Compliant for Healthcare Developers?"
vendor: "GitHub Copilot"
seoTitle: "Is GitHub Copilot HIPAA Compliant?"
description: "What healthcare IT teams and developers must know about GitHub Copilot's BAA availability through Microsoft enterprise agreements, the risks of hardcoded PHI in code snippets, and how to evaluate Copilot for use on HIPAA-covered codebases."
metaDescription: "Is GitHub Copilot HIPAA compliant? Enterprise agreements with a Microsoft BAA can cover Copilot. Learn the plan requirements, PHI risks, and configuration."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "GitHub Copilot Individual and standard Business plans do not have standalone BAA coverage. GitHub Enterprise customers can access Copilot under Microsoft's enterprise HIPAA program, which includes a BAA. The primary risk for healthcare developers is inadvertently including patient data in code snippets sent to Copilot's AI backend."
keyTakeaways:
  - "GitHub Copilot Individual and standard Business plans do not include BAA coverage for HIPAA."
  - "GitHub Enterprise customers may access Copilot under a Microsoft enterprise agreement that includes a BAA — confirm coverage scope with your enterprise agreement."
  - "The primary PHI risk with Copilot is developers using it to write, debug, or refactor code containing hardcoded patient data or real PHI in test fixtures."
  - "Even with enterprise BAA coverage, developers must follow coding practices that prevent PHI from appearing in prompts, code completion requests, or inline chat queries."
  - "Personal GitHub Copilot accounts used on work codebases are outside any enterprise agreement and should be prohibited on PHI-adjacent repositories."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Microsoft HIPAA Implementation Guidance"
    url: "https://docs.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft"
  - title: "GitHub Enterprise Terms of Service"
    url: "https://docs.github.com/en/site-policy/github-terms/github-corporate-terms-of-service"
    publisher: "GitHub"
  - title: "GitHub Copilot Privacy Statement"
    url: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
    publisher: "GitHub"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does GitHub Copilot Business include a BAA?"
    a: "GitHub Copilot Business, as a standalone subscription without an enterprise agreement, does not include BAA coverage for HIPAA purposes as of the verification date. BAA coverage for Copilot is available through GitHub Enterprise agreements that are part of a broader Microsoft enterprise relationship. Review your current enterprise agreement or contact GitHub/Microsoft enterprise sales to determine what is included."
  - q: "What happens to code snippets sent to GitHub Copilot?"
    a: "GitHub Copilot sends code context — including the active file, open tabs, and IDE context — to GitHub's AI backend to generate completions. For GitHub Copilot Individual and Business accounts, prompt data handling terms differ from enterprise accounts. Enterprise accounts operate under different data retention and use terms. Review the current GitHub Copilot Privacy Statement for your account tier."
  - q: "Can a developer use GitHub Copilot to help debug a function that processes patient records?"
    a: "If the function contains real patient data (even in test fixtures or example values), sharing that code with Copilot's backend may constitute a disclosure of PHI. The safest practice is to use synthetic, obviously fake patient data during development and testing, and to confirm that any enterprise Copilot deployment is covered under a signed BAA before using it on PHI-processing code."
  - q: "We use GitHub Enterprise Cloud — are we automatically covered by a Microsoft BAA for Copilot?"
    a: "Not automatically. BAA coverage depends on the specific terms of your enterprise agreement. Microsoft offers a HIPAA BAA program for qualifying enterprise customers, but it must be reviewed and executed as part of your enterprise agreement process. Contact your Microsoft or GitHub account team to confirm whether your agreement includes BAA coverage and what products are within scope."
---

## Short answer

Conditionally — GitHub Copilot does not include a BAA on its Individual or standard Business plans. For healthcare organizations whose development teams work on HIPAA-covered codebases, BAA coverage for Copilot is available through GitHub Enterprise agreements that are part of a Microsoft enterprise relationship — but this must be confirmed in writing, not assumed. The most significant operational risk is not primarily about which plan tier is used: it is about developers inadvertently including real patient data in code context that is sent to Copilot's AI backend.

## GitHub is a Microsoft subsidiary — understand the enterprise relationship

GitHub was acquired by Microsoft in 2018. GitHub Enterprise is part of Microsoft's enterprise product portfolio, and Microsoft operates a comprehensive HIPAA compliance program for its enterprise customers. This means:

- Microsoft offers a BAA for qualifying enterprise customers across a range of Microsoft products and services
- GitHub Enterprise can be covered under a Microsoft enterprise BAA when negotiated as part of the broader enterprise agreement
- GitHub Copilot for Enterprise is included within GitHub Enterprise and may be in scope under the same enterprise BAA

The critical word in all of these statements is "qualifying." Not every GitHub Enterprise customer is automatically covered under a Microsoft HIPAA BAA. The BAA must be reviewed and explicitly agreed to as part of the enterprise agreement. Organizations should verify with their Microsoft account team which products are in scope under their current agreement.

## Plans and BAA availability

The current plan landscape for GitHub Copilot as of the verification date:

**Plans without BAA coverage:**
- GitHub Copilot Individual — consumer subscription with no enterprise HIPAA terms
- GitHub Copilot Business — organizational subscription, but standard terms do not include BAA coverage without an enterprise agreement

**Plans where BAA coverage may be available:**
- GitHub Copilot Enterprise (part of GitHub Enterprise Cloud) — covered under Microsoft enterprise BAA when part of a qualifying enterprise agreement

For small medical clinics with development teams, the practical question is whether the organization has a qualifying Microsoft enterprise agreement. Many small organizations do not, and obtaining one requires a direct engagement with Microsoft's enterprise sales team. This is not a quick process and may involve minimum commitment requirements.

## The primary PHI risk: code containing patient data

Most commentary on GitHub Copilot and HIPAA focuses on the BAA question. The BAA is necessary but it is not the only risk that healthcare development teams face. The more common and immediate risk is the content of the code context that Copilot sends to its AI backend.

GitHub Copilot generates completions by analyzing the code in the active editor, open files, and surrounding context. This means that if a developer has patient data anywhere in the active codebase — in any of these forms — that data is potentially included in the context sent to Copilot:

### Hardcoded PHI in source code

Patient data should never be hardcoded in production source code. This is a basic security principle independent of AI tools. But legacy codebases sometimes contain placeholder fields that imitate patient names, dates of birth, medical record numbers, or government identifiers from development shortcuts that were never cleaned up. When a developer opens these files with Copilot active, that data becomes part of the code context.

### Real PHI in test fixtures and seed data

Test databases, seed files, and fixture data frequently contain realistic-looking records to support integration testing. If those records contain real patient information — even "anonymized" data that was scraped from real records — and a developer is working in a file that references those fixtures with Copilot active, the data is in scope.

Responsible AI-assisted development requires using synthetic data generated with deterministic seeds (e.g., `@faker-js/faker`) for all test data. This practice protects against multiple risks, including AI tool data exposure.

### Debugging sessions with real data

Developers debugging production issues sometimes copy a problematic record — a specific patient's data that triggered a bug — into a local file for testing. If Copilot is active and the developer asks it to help debug, the real patient data is in the completion request.

### Inline chat queries describing real cases

GitHub Copilot includes an inline chat feature where developers can ask questions in natural language. A developer asking "why is this function failing for a patient with these specific values" and including the actual patient values in the chat query is sending PHI through the chat interface.

## Configuration and best practices for HIPAA-adjacent development

Even with an enterprise BAA in place, development teams working on healthcare applications should implement these practices:

**1. Prohibit real PHI in development environments.** Test databases, fixtures, and seed data must use synthetic patient data. Establish this as a code review requirement and a CI/CD check where possible.

**2. Restrict Copilot to non-PHI areas of the codebase.** Consider whether AI completion tools should be enabled in the modules that directly handle PHI storage and retrieval, as opposed to infrastructure or UI code.

**3. Prohibit personal Copilot accounts on work repositories.** A developer using their individual GitHub Copilot subscription — rather than the organization's enterprise deployment — is outside the BAA coverage even if the organization has an enterprise agreement. Enforce repository access through enterprise accounts only.

**4. Review Copilot policy settings.** GitHub Enterprise Copilot allows administrators to configure whether Copilot can be used with public code matching, whether content exclusions apply, and which repositories Copilot is enabled for. Review these settings with your privacy officer.

**5. Include AI tool use in developer onboarding and security training.** Developers who understand why the practices above matter are more likely to follow them than developers who receive a list of rules without context.

## When a personal Copilot account is used on a work codebase

If a developer uses a personal GitHub Copilot Individual subscription while working on an organization-owned codebase that processes PHI, the data sent to Copilot's backend is not covered under any enterprise BAA. This is a common gap in small healthcare IT organizations where developers use their personal accounts for convenience.

Enforce a policy requiring developers to use organization-issued GitHub accounts with enterprise Copilot access when working on PHI-adjacent repositories. Personal account use on those repositories should be prohibited.

## Verifying your current coverage

To determine whether your GitHub Copilot deployment is covered under a Microsoft HIPAA BAA:

1. Contact your Microsoft or GitHub account team and request a written confirmation of which products are in scope under your enterprise agreement
2. Confirm that your organization has signed the Microsoft HIPAA Business Associate Agreement addendum
3. Confirm that GitHub Copilot Enterprise (not just GitHub Copilot Business) is part of your current subscription
4. Obtain the agreement documents and store them as part of your vendor management records

Do not rely on verbal assurances or general documentation from the Microsoft compliance website. Your specific agreement is what governs. See [how to audit vendor HIPAA claims](/learn/vendor-management/how-to-audit-vendor-hipaa-claims) for a methodology for verifying vendor compliance claims.

## The broader compliance picture

Securing GitHub Copilot for HIPAA-covered development work is one component of a larger compliance program. The covered entity also needs policies governing AI tool use in development processes, training for development staff on data handling obligations, and documentation of how BAA coverage was verified and maintained.
