---
title: "Is Zoom HIPAA Compliant for Small Clinics"
vendor: "Zoom"
seoTitle: "Is Zoom HIPAA Compliant"
description: "A plain-English guide for practice administrators on Zoom's BAA posture, which plans qualify, and the configuration work clinics still own."
metaDescription: "Is Zoom HIPAA compliant Guide for clinics on Zoom for Healthcare, BAA scope, recording storage, and chat/PMI risks."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "Zoom requires a plan-and-use review, not a blanket HIPAA label. A plain-English guide for practice administrators on Zoom's BAA posture, which plans qualify, and the configuration work clinics still own. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out of unsupported workflows before using it with patient information. A BAA is only available on Zoom's healthcare-oriented plans."
keyTakeaways:
  - "A BAA is only available on Zoom's healthcare-oriented plans. Free, Pro, and consumer tiers do not qualify for PHI use."
  - "The BAA typically covers meetings and specific features; not every Zoom surface is in scope by default."
  - "Recording storage, chat transcripts, Personal Meeting IDs, and waiting room settings are clinic-owned configuration risks."
  - "Verify the current BAA scope with Zoom at time of purchase, since product packaging changes over time."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/compare"
sources:
  - title: "Zoom for Healthcare"
    url: "https://www.zoom.com/en/industry/healthcare/"
    publisher: "Zoom"
  - title: "Zoom HIPAA Compliance Guide"
    url: "https://support.zoom.com/hc/en/articleid=zm_kb&sysparm_article=KB0061713"
    publisher: "Zoom"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Is the free Zoom plan HIPAA compliant?"
    a: "No. Zoom does not sign a BAA for free or consumer plans. A covered entity using free Zoom for patient visits is operating without the contractual coverage HIPAA requires."
  - q: "Does the BAA cover Zoom Chat and Zoom Phone?"
    a: "Coverage depends on the specific plan and add-ons purchased. Confirm the current scope directly with Zoom sales in writing before routing PHI through chat or phone."
  - q: "Where should a clinic store Zoom recordings that contain PHI?"
    a: "Only in a storage destination that is itself covered by a BAA, with encryption at rest and access limited to a documented set of staff. Local laptop storage is usually a bad idea."
  - q: "Do we still need our own configuration work if Zoom signs a BAA?"
    a: "Yes. The BAA is the legal floor. Waiting rooms, meeting passcodes, cloud recording access, and retention settings are all clinic responsibilities."
---

## The short answer

Zoom can be used for HIPAA-covered activity, but only on a healthcare-oriented plan with a signed Business Associate Agreement. Free, Pro, and personal tiers do not qualify. Even on a covered plan, the clinic still owns meeting configuration, recording storage, and retention decisions. Treat Zoom as one contracted vendor among many, not as a turnkey compliance solution.

## What Zoom's BAA actually covers

Zoom markets a healthcare-specific offering and will execute a BAA for qualifying customers. The BAA scopes the product features Zoom agrees to treat as covered services. In practice that usually includes Zoom Meetings and related telehealth-facing features. It does not automatically extend to every Zoom product surface. If a clinic plans to use Zoom Phone, Zoom Chat, Whiteboard, AI Companion features, or third-party marketplace apps for PHI-adjacent work, each of those must be confirmed in writing.

Zoom updates packaging frequently. A plan that included a BAA two years ago may have different terms today. Read [When a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) before signing anything, and verify the current BAA scope with Zoom's sales team at time of purchase.

## Plan requirements

At a minimum, a clinic should:

- Buy Zoom through the healthcare offering, not self-serve upgrade from a free account.
- Request and countersign the BAA before the first PHI-bearing meeting.
- Confirm in writing which products and features the BAA covers.
- Document the Zoom contract in the clinic's vendor inventory.

If a salesperson tells you "Zoom is HIPAA compliant" without producing a BAA, that is not a yes. HIPAA compliance is a contractual and operational posture, not a checkbox on a feature sheet.

## Real-world configuration caveats

A signed BAA does not fix any of the following. These are the settings that actually cause problems during an audit or a complaint.

**Personal Meeting IDs (PMI).** Reusing a PMI for patient visits means the same link can be reshared, joined by the wrong person, or screenshot and reposted. Use per-meeting IDs with passcodes for patient-facing calls.

**Waiting rooms and authentication.** Waiting rooms should be on by default for any meeting where PHI might be discussed. Authentication options should match the clinic's access policy.

**Recording storage.** Cloud recordings live in Zoom's storage under the BAA's scope. Local recordings saved to a clinician laptop usually do not live inside any BAA'd environment, and they are hard to retrieve, audit, or destroy on schedule. Pick one path and enforce it.

**Chat transcripts.** In-meeting and persistent chat can become a PHI surface fast. Messages like "patient DOB is…" end up stored, exported, and forwarded. Decide whether chat is in scope for clinical work or explicitly off-limits, and train staff to match.

**Third-party integrations.** Marketplace apps, transcription bots, and AI note-takers often sit outside the Zoom BAA. If a bot joins a visit, that bot's vendor needs its own BAA or the bot should be blocked.

## When Zoom is the wrong tool

Zoom is a telehealth and meeting product. It is not a compliance program, a task tracker, or an incident log. If the problem is "our clinic needs a system of record for compliance work, training attestations, vendor BAAs, and corrective actions," Zoom does not solve that. Pair Zoom for visits with a dedicated compliance operating system. See [PHI in scheduling and intake forms](/learn/phi-workflows/phi-in-scheduling-and-intake-forms) for adjacent risks, and the [PHIGuard comparison](/compare) for how clinics structure the rest of their stack.

## Bottom line

Zoom is HIPAA-compatible on the right plan, with the right paperwork, and with disciplined configuration. Free Zoom is never an option for PHI. The BAA is necessary and insufficient; the clinic still owns the settings, storage, and staff behavior that determine whether Zoom use is actually safe.

For an adjacent vendor evaluation, see [Is Typeform HIPAA compliant](/resources/guides/is-typeform-hipaa-compliant).

## Current Source Posture

The source set for this page is Zoom: Zoom HIPAA Compliance Guide; HHS: Business Associates Guidance. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Zoom, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Zoom into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. A BAA is only available on Zoom's healthcare-oriented plans. Free, Pro, and consumer tiers do not qualify for PHI use. The BAA typically covers meetings and specific features; not every Zoom surface is in scope by default. Recording storage, chat transcripts, Personal Meeting IDs, and waiting room settings are clinic-owned configuration risks. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
