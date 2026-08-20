---
title: "HIPAA AI Governance Framework for Small Clinics"
headline: "Govern AI tools in your clinic without leaking PHI to consumer chatbots"
description: "A practical AI governance framework for small clinics adopting ambient scribes, scheduling assistants, and AI coding tools under HIPAA."
metaDescription: "HIPAA AI governance framework for small clinics. Risk analysis, BAA vetting, prohibited uses, and approved-tool list for ambient scribes and AI coding."
magnetSlug: "hipaa-ai-governance-framework"
summary: "A practical AI governance framework for small clinics adopting ambient scribes, scheduling assistants, and AI coding tools under HIPAA. It gives small clinics scope definition: which AI tools fall under your governance policy, risk analysis template aligned to 45 CFR § 164.308(a)(1), and a practical way to document owners, review dates, exceptions, and follow-up evidence for ai governance framework without inventing a separate compliance workflow."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Scope definition: which AI tools fall under your governance policy"
  - "Risk analysis template aligned to 45 CFR § 164.308(a)(1)"
  - "BAA vetting checklist for AI vendors (training prohibition, flow-down, residency)"
  - "Prohibited-use list covering consumer ChatGPT, Gemini, and Claude.ai accounts"
  - "Patient awareness language for ambient AI scribe encounters"
  - "Annual AI vendor BAA review schedule and sanction policy"
faq:
  - q: "Is this free?"
    a: "Yes. Enter your email and we will send the full resource to your inbox."
  - q: "Does HIPAA require a separate AI policy?"
    a: "HIPAA does not name AI specifically, but § 164.308(a)(1) requires a risk analysis covering all systems that create, receive, maintain, or transmit ePHI. AI tools that touch PHI fall inside that scope and need governance."
  - q: "Can I use the free version of ChatGPT for clinical notes?"
    a: "No. Consumer AI accounts do not come with a BAA, and free-tier providers typically reserve the right to use inputs for training. Pasting PHI into a consumer chatbot is an impermissible disclosure under § 164.502."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
sources:
  - title: "45 CFR § 164.308 — Administrative safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "Electronic Code of Federal Regulations"
  - title: "45 CFR § 164.502 — Uses and disclosures of protected health information"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "Electronic Code of Federal Regulations"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedLearnPath: "/learn/security"
relatedCommercialPath: "/hipaa"
---

Small clinics are adopting AI faster than their compliance programs can keep up. Ambient scribes record encounters, scheduling assistants triage messages, and coding tools suggest CPT and ICD-10 entries from chart text. Each of these touches PHI, and each one needs to sit inside a written governance framework before it goes live.

This framework is built for practice administrators who do not have an in-house compliance officer. It treats AI tools the same way HIPAA already treats any other system that creates, receives, maintains, or transmits ePHI: risk analysis first, BAA second, controls third, audit fourth.

## What the framework covers

The governance scope is intentionally broad. Any tool that uses a machine learning model and either ingests PHI as input or produces PHI as output is in scope. That includes ambient scribes, AI-assisted coding, AI-assisted prior authorization, AI patient messaging triage, and any "copilot" feature inside your EHR. It does not include deterministic automation that never sees PHI, like a rules-based reminder that only references appointment times.

## Risk analysis for AI tools

A § 164.308(a)(1) risk analysis for AI follows the same structure as for any other system, but adds three AI-specific questions. First, what does the vendor do with prompt input Second, what does the vendor do with model output Third, is any portion of your data used to train, fine-tune, or evaluate models, even in aggregate or de-identified form If the answer to the third question is anything other than a clean no, escalate to legal review before signing.

## BAA vetting checklist

A BAA is necessary but not sufficient for AI vendors. Look for an explicit prohibition on using clinic data to train or improve models. Confirm flow-down to any foundation model provider (OpenAI, Anthropic, Google) sitting underneath the vendor. Confirm data residency, retention windows, and the vendor's process for honoring patient amendment and access requests under § 164.524 and § 164.526.

## Approved-tool list

Maintain a single written list of approved AI tools. Staff are not permitted to use AI tools that are not on the list for any task involving PHI. The list names the tool, the use case, the BAA effective date, and the staff role authorized to use it.

## Prohibited uses

Three uses are categorically prohibited and should be named in your sanctions policy: pasting PHI into consumer ChatGPT, Gemini, or Claude.ai accounts; using personal AI browser extensions on clinic devices; and uploading patient documents to general-purpose AI summarizers that have not signed a BAA.

## Patient awareness for ambient scribes

If you use an ambient AI scribe, patients should be told. A short notice at intake or in the room covers it. This is good practice and aligns with the spirit of the Notice of Privacy Practices, even where it is not a strict legal requirement.

## How to use this resource in a live HIPAA program

Use the AI Governance Framework as a working control record, not as a document that gets filed once and forgotten. Start by naming the owner, the affected workflow, the systems or vendors involved, and the date the review was performed. Then walk through each line with the staff who actually handle the work. HIPAA documentation is strongest when it reflects real operations: who touches PHI, where ePHI is created or transmitted, what access is necessary for the role, and what evidence proves the safeguard is operating.

For this resource, the practical evidence usually includes Scope definition: which AI tools fall under your governance policy; Risk analysis template aligned to 45 CFR § 164.308(a)(1); BAA vetting checklist for AI vendors (training prohibition, flow-down, residency); Prohibited-use list covering consumer ChatGPT, Gemini, and Claude.ai accounts. Keep those items with screenshots, vendor records, policy acknowledgements, training logs, or access-review notes when they support the answer. If a line cannot be completed, record the exception, assign an owner, and set a due date instead of leaving the item blank.

## Evidence to keep with the completed resource

Save the final version with the review date, reviewer name, and any follow-up tasks. If the resource supports an administrative safeguard, connect it to your risk analysis and policy review history. If it supports a technical or physical safeguard, keep the configuration evidence or walk-through notes that show what was checked. If it supports a patient-rights or disclosure workflow, keep the request log, response dates, and any correspondence that explains the decision.

PHIGuard positions this kind of artifact as part of day-to-day compliance operations: a task, an owner, evidence, and a repeatable review cadence. The goal is not to create more paperwork. The goal is to make the clinic able to show, with dated records, how it applied HIPAA requirements to the workflow in front of it.

## Review cadence

Review this resource at least once a year and sooner after a material change. Material changes include a new EHR, billing platform, AI tool, telehealth workflow, location, vendor, role, state-law overlay, or incident pattern. During the review, confirm that the source policy still matches current operations, that the listed owner still has authority to make changes, and that unresolved exceptions have not aged into accepted risk without leadership approval.
