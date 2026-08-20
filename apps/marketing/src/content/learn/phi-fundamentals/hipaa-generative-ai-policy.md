---
title: "Building a HIPAA-Compliant AI Use Policy for Your Clinic"
seoTitle: "HIPAA AI Use Policy for Clinics"
description: "Every clinic that allows staff to use AI tools needs a written AI use policy. This is an operational guide to building one — covering approved tools, prohibited inputs, BAA requirements, staff attestation, and how to vet new AI tools before they reach PHI."
metaDescription: "How to build a HIPAA-compliant AI use policy for your clinic: approved tools, BAA requirements, prohibited inputs, staff training, and OCR's guidance on AI."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: phi-fundamentals
intent: awareness
schemaType: article
summary: "A written AI use policy is required under HIPAA's workforce training and risk management requirements when your clinic allows staff to use AI tools. This guide covers the eight components every clinic AI policy needs, how to vet new AI tools for BAA availability, and how to document staff attestation."
keyTakeaways:
  - "HIPAA's risk management requirement (45 CFR §164.308(a)(1)) requires documented policies for any system that creates, stores, or transmits ePHI — AI tools that touch PHI are in scope."
  - "A written AI use policy is the mechanism for documenting which tools are approved, what inputs are permitted, and how violations are handled."
  - "Using ChatGPT, Claude, Gemini, or any AI tool that transmits PHI to a vendor without a signed BAA is a HIPAA violation."
  - "A BAA alone is insufficient — confirm the vendor's data training opt-out status, data retention settings, and subprocessor list."
  - "Staff attestation of the AI use policy is a separate training documentation requirement from the policy itself."
sources:
  - title: "Security Rule Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS"
  - title: "HHS Guidance on Artificial Intelligence in Healthcare"
    url: "https://www.hhs.gov/about/news/2024/03/18/hhs-issue-final-rule-strengthen-privacy-protections-protect-access-reproductive-health-care.html"
    publisher: "HHS"
faq:
  - q: "Is ChatGPT HIPAA compliant?"
    a: "OpenAI offers a Healthcare API version with a BAA available for qualifying enterprise customers. The standard consumer ChatGPT product does not include a BAA and should not be used with any PHI. Whether the enterprise version satisfies your HIPAA obligations depends on your configuration, data input controls, and the specific BAA terms. A BAA does not make a tool compliant by itself — your usage of the tool must also comply."
  - q: "What happens if a staff member puts PHI into an AI tool that does not have a BAA?"
    a: "The transmission of PHI to a vendor without a BAA is a HIPAA violation — specifically, an impermissible disclosure under 45 CFR §164.502. Depending on the volume of PHI involved and the sensitivity of the information, the incident may require breach risk assessment and potentially individual notification. Workforce members who cause the violation are subject to sanctions under your workforce policy."
  - q: "Do I need to update my HIPAA risk analysis to cover AI tools?"
    a: "Yes. Any new system that creates, receives, maintains, or transmits ePHI is in scope for the risk analysis required under 45 CFR §164.308(a)(1)(ii)(A). When you add approved AI tools to your environment, your risk analysis should be updated to reflect the new attack surface and the new data flows."
  - q: "Can AI tools be used for administrative tasks without a BAA?"
    a: "Yes, for tasks that genuinely do not involve PHI. Using an AI tool to draft a general office communication that contains no patient information does not require a BAA. The risk is that staff often do not distinguish clearly between tasks that involve PHI and those that do not — which is why the AI use policy needs to specify permitted uses explicitly."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

The question most clinic administrators are asking is "Is [tool name] HIPAA compliant?" That is the wrong question to start with.

The right question is: does your clinic have a written policy that tells staff which AI tools are approved, what patient information may or may not be put into those tools, what to do if someone uses an unapproved tool, and how the policy is reviewed and updated?

Without a written policy, even the most HIPAA-capable AI tool creates compliance exposure. Staff will use what is accessible to them. Without clear written guidance, they have no reliable way to know when a productivity tool crosses into a regulated data flow.

A HIPAA-compliant AI use policy is not a vendor evaluation document. It is a workforce management document — one that satisfies HIPAA's training and documentation requirements and that creates an auditable record of how your clinic has addressed AI-related risk.

## Why a Written AI Use Policy Is a HIPAA Requirement

HIPAA does not have a specific regulation called the "AI policy requirement." The obligation comes from existing requirements:

**45 CFR §164.308(a)(1) — Security Management Process.** Covered entities must implement policies and procedures to prevent, detect, contain, and correct security violations. Any system that handles ePHI — including AI tools — is in scope for this requirement.

**45 CFR §164.308(a)(5) — Security Awareness and Training.** Covered entities must implement training programs for all workforce members. AI use is a category of risk that workforce members need guidance on. Training without a written policy to reference is not meaningful compliance.

**45 CFR §164.316 — Policies and Procedures.** Covered entities must implement policies and procedures to comply with the Security Rule standards. An AI tool that transmits ePHI to a third-party vendor creates a new data flow. Policies and procedures must address that flow.

**45 CFR §164.308(b) — Business Associate Contracts.** Any vendor that creates, receives, maintains, or transmits ePHI on your behalf is a business associate. A signed BAA must exist before PHI flows to that vendor. An AI tool that processes patient data is subject to this requirement.

When HHS published its 2024 guidance on AI and healthcare, it reinforced that HIPAA's existing framework applies to AI systems that handle PHI — there is no AI exception, and there is no grace period for tools already in use.

## The Eight Components of a Clinic AI Use Policy

**1. Approved AI tools list.** Name every AI tool staff are permitted to use in clinical or administrative workflows. For each tool, state: the tool name, the vendor, whether a BAA is in place (and where to find it), the permitted uses, and the data categories that may be inputted. Include the review date for each tool's approval.

A tool not on this list is not approved. The policy should be explicit that using unapproved AI tools with any patient-identifiable information is a reportable policy violation.

**2. Prohibited inputs.** State clearly what may NOT be put into any AI tool, even an approved one. At minimum:

- Patient names, dates of birth, medical record numbers, or any direct identifiers
- Clinical notes, diagnoses, or treatment plans identifying a specific patient
- Insurance information, billing records, or claims data
- Any information that, combined with other available data, could identify a patient

When a BAA is in place with an approved tool, permitted inputs for clinical workflows must be described specifically. Blanket permission is not appropriate.

**3. Permitted use cases.** Describe what staff may use AI tools for. Examples of uses that may be appropriate without PHI input: drafting general administrative communications, generating template documents, summarizing non-patient-specific policy questions, researching coding guidance using hypothetical scenarios. Permitted clinical uses (if any) should be named specifically with reference to the applicable BAA.

**4. BAA documentation.** Maintain a current list of all AI vendors with whom a BAA has been executed. Include the execution date, the BAA version, and the contact at the vendor for compliance questions. The policy should specify that PHI may not flow to any AI vendor absent a current, signed BAA.

**5. AI tool vetting process.** Describe how your clinic evaluates new AI tools before approving them. The minimum vetting checklist:

- Is the vendor willing to sign a BAA? If not, the tool cannot be approved for any PHI workflow.
- Does the vendor use customer data to train its models? What is the opt-out mechanism?
- What is the vendor's data retention policy? How long does it store inputs and outputs?
- Who are the vendor's subprocessors? Does the BAA cover subprocessors?
- Has the vendor's security posture been evaluated (SOC 2 report, penetration test results, or equivalent)?

**6. Incident reporting.** Describe what workforce members must do if they believe PHI was entered into an unapproved AI tool or was improperly disclosed through an approved AI tool. Route these reports to the privacy or security officer. Treat them as potential security incidents under 45 CFR §164.308(a)(6).

**7. Annual review cycle.** AI tools and vendors change rapidly. The approved tools list and BAA inventory must be reviewed at least annually — and more frequently when new tools are adopted or vendors update their terms. Name who owns the review and the review timeline.

**8. Staff attestation.** Every workforce member who uses AI tools in clinical or administrative workflows must sign an attestation confirming they have read and understood the AI use policy. This attestation is training documentation under 45 CFR §164.530(b). Retain it for six years.

## How to Vet a New AI Tool

When a staff member or vendor proposes a new AI tool, use this process before allowing any clinical or administrative use:

**Step 1: Determine whether PHI will be involved.** Would any workflow using this tool require entering, referencing, or generating patient-identifiable information? If no, a BAA is not required, though the policy should still govern usage. If yes, proceed to step 2.

**Step 2: Request the BAA.** Contact the vendor and ask for a copy of their Business Associate Agreement. A vendor that is marketing to healthcare should have this document ready. If they do not know what a BAA is, or if they decline, the tool cannot be used in any PHI workflow.

**Step 3: Review the BAA terms.** The BAA must contain the elements required under 45 CFR §164.308(b)(3): permitted uses and disclosures, required safeguards, subcontractor requirements, breach notification obligations, and return or destruction of PHI at termination. Do not accept a BAA that excludes subcontractors from its obligations.

**Step 4: Review data training and retention policies.** Check the vendor's privacy policy, data processing addendum, and enterprise terms for:
- Whether inputs are used to train or improve the AI model (and whether you can opt out)
- How long inputs and outputs are retained
- Whether human reviewers can access your submitted data for quality purposes

**Step 5: Confirm configuration.** Many AI platforms require specific settings — organization-level policies, data residency configurations, or enterprise settings — to be active before PHI may be submitted. Confirm that the BAA's permitted configuration matches what is technically enabled in your account.

**Step 6: Document the approval.** Add the tool to your approved tools list with the date of BAA execution, the permitted uses, the reviewer's name, and the next review date. Update your risk analysis to reflect the new data flow.

## Documenting the Policy and Getting Staff Attestation

The policy document itself must be retained under 45 CFR §164.316(b)(2) for six years from creation or last effective date.

Staff attestation should be collected at:
- Initial policy publication (for all current staff)
- Onboarding for new hires
- Each annual policy review (for all staff)
- Any material update to the approved tools list or permitted uses

An attestation is a signed statement confirming the employee has read, understood, and will comply with the policy. Electronic signature systems, LMS completion records that include policy acknowledgment, and paper signature sheets all satisfy this requirement. Retain attestation records alongside training documentation.

The practical result: when OCR requests training documentation, or when an AI-related incident requires investigation, you have a clear record showing that every workforce member was informed of the rules, when they were informed, and what they attested to.
