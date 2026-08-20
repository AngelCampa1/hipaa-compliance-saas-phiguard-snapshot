---
title: "Is Otter.ai HIPAA Compliant for Medical Clinics"
vendor: "Otter.ai"
seoTitle: "Is Otter.ai HIPAA Compliant"
description: "Otter.ai's Business and Enterprise plans offer a BAA, but the company's AI transcription model is trained on user data by default on lower tiers. Clinics considering Otter.ai for clinical meetings or patient calls need to understand which plan provides compliant transcription."
metaDescription: "Is Otter.ai HIPAA compliant BAA available on Business and Enterprise plans with opt-out of AI training. Learn what clinics need before using Otter.ai."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "Otter.ai offers a Business Associate Agreement on its Business and Enterprise plans. Standard and free-tier plans do not include a BAA and are not suitable for clinical use. On qualifying plans, the clinic must also confirm that Otter.ai's AI-improvement data use has been disabled so that transcribed content — which may contain PHI — is not used to train Otter's speech models."
keyTakeaways:
  - "A BAA is available from Otter.ai on Business and Enterprise plans; free and Pro plans do not qualify."
  - "Otter.ai's AI model may use transcription content for training by default on lower tiers — this must be explicitly disabled on HIPAA-covered accounts."
  - "Meeting transcripts that capture patient names, conditions, or treatment discussions constitute PHI and require full BAA coverage."
  - "Clinics using Otter.ai for internal staff meetings must still assess whether PHI is discussed and whether those transcripts are stored and accessed appropriately."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Otter.ai Security and HIPAA"
    url: "https://otter.ai/security"
    publisher: "Otter.ai"
  - title: "Otter.ai Terms of Service"
    url: "https://otter.ai/terms-of-service"
    publisher: "Otter.ai"
  - title: "Business Associate Contracts — HHS Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinic use the free Otter.ai plan to transcribe staff meetings?"
    a: "Not if PHI is discussed. Free-tier Otter.ai has no BAA. Staff meetings at a medical clinic regularly involve patient care discussions, which qualify as PHI. Even a brief mention of a patient name with a clinical context makes that transcript PHI."
  - q: "Does Otter.ai store transcripts in the cloud?"
    a: "Yes. Otter.ai transcripts are stored in Otter's cloud infrastructure. Under a signed BAA on a qualifying plan, this storage is covered. Clinics must confirm retention settings and understand how to delete transcripts at end of retention period."
  - q: "Can a physician use Otter.ai to transcribe patient visits?"
    a: "Only on a Business or Enterprise plan with an executed BAA and AI-training disabled. Recording a patient encounter also requires patient notice or consent depending on state law, independent of HIPAA requirements."
  - q: "What is the risk if a clinic used free Otter.ai before knowing about the BAA requirement?"
    a: "Transcripts created without a BAA constitute unauthorized disclosures of PHI if those transcripts contained patient information. The clinic should consult with its compliance officer and consider whether a breach risk assessment is required under 45 CFR § 164.402."
---

## Verdict: Yes with conditions — Business or Enterprise plan required

Otter.ai offers a Business Associate Agreement, but only on its Business and Enterprise plans. The free and Pro tiers are not suitable for any clinical use where PHI could appear in a transcript.

The second critical requirement — beyond the BAA — is disabling Otter.ai's use of transcription content for AI model improvement. On plans without this restriction, audio and transcript data may be processed for model training, a use outside the permitted scope of a healthcare BAA.

## BAA availability

Otter.ai's security documentation confirms that a BAA is available for Business and Enterprise plan customers. The clinic must request and execute the BAA through Otter's enterprise process before any PHI enters the system.

The plan-tier requirement is strict. A Pro plan subscriber who upgrades to Business mid-year cannot retroactively cover transcripts created before the BAA was executed.

## AI training, data use, and PHI coverage

Three questions a clinic must answer before using Otter.ai for any meeting that could include PHI:

**(a) Is AI training on transcription data on by default**
Yes, on Free and Pro plans. Otter.ai's standard terms permit use of transcription content to improve its AI speech models. This is the default for all lower-tier accounts. On Business and Enterprise plans under a signed BAA, Otter.ai restricts this data use so that transcription content is not used for model training.

**(b) How to disable it**
After executing the BAA on a Business or Enterprise plan, work with Otter.ai's enterprise team to confirm the HIPAA configuration is active on your account. This is not a self-service toggle in the standard web interface — it requires confirmation through Otter's enterprise onboarding process. Once active, the account settings should reflect that data is excluded from AI improvement programs. Document this configuration in the clinic's vendor records.

**(c) Are transcripts containing PHI covered by the BAA**
On a qualifying Business or Enterprise plan with an executed BAA and HIPAA configuration active, transcripts stored in Otter's cloud are covered. On Free or Pro plans, there is no BAA, and transcripts containing PHI are not covered — constituting an unauthorized disclosure. Audio and transcript data on non-BAA plans is outside any healthcare contractual protection.

Clinics should confirm:

1. The BAA has been executed on a Business or Enterprise plan
2. The account has been configured to disable AI-training on transcription data through Otter's enterprise process
3. This configuration is documented in the clinic's compliance records

## When PHI enters a meeting transcript

Clinical meetings that involve PHI are more common than administrators expect. PHI can enter a transcript through:

- Staff discussing a specific patient's care plan or upcoming procedure
- Chart review meetings where patient names and diagnoses are referenced
- Telehealth sessions if Otter.ai is used to transcribe the call
- Multi-disciplinary coordination meetings that reference individual patients

Internal meetings that cover operational topics without patient-specific information carry lower PHI risk, but the safest policy is to treat all clinical meeting transcripts as potentially containing PHI.

## Storage and access controls

Otter.ai stores transcripts in its cloud under the BAA for qualifying plans. Clinics must:

- Restrict transcript access to staff with a legitimate need
- Set retention periods consistent with the clinic's records management policy
- Understand how to export or delete transcripts at end of retention
- Ensure departing staff are promptly removed from transcript access

## Alternatives for clinics that cannot justify the Business plan

For a clinic that needs transcription for a small number of specific use cases, the per-seat economics of Otter.ai Business may not be justified. Some EHR vendors and telehealth platforms offer integrated transcription under their own BAA, which can be simpler to manage than a separate transcription tool with its own compliance configuration.

## Current Source Posture

The source set for this page is HHS: Business Associate Contracts — HHS Guidance. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Otter.ai, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Otter.ai into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. A BAA is available from Otter.ai on Business and Enterprise plans; free and Pro plans do not qualify. Otter.ai's AI model may use transcription content for training by default on lower tiers — this must be explicitly disabled on HIPAA-covered accounts. Meeting transcripts that capture patient names, conditions, or treatment discussions constitute PHI and require full BAA coverage. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
