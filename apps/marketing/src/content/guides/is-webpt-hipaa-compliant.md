---
title: "Is WebPT HIPAA Compliant for Medical Clinics"
vendor: "WebPT"
seoTitle: "Is WebPT HIPAA Compliant"
description: "WebPT is an EHR built specifically for outpatient PT, OT, and SLP practices. It includes a BAA with customer accounts and is designed around HIPAA-aware workflows, but staff-side practices and adjacent tools determine whether real-world use stays compliant."
metaDescription: "Is WebPT HIPAA compliant Yes — BAA details available during plan review for customers, with HIPAA-aware EHR workflows for therapy practices."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "WebPT is a HIPAA-appropriate EHR for therapy practices, with a BAA details available during plan review for customers. Confirm BAA scope for adjacent products like WebPT Reach and verify that any non-WebPT communication channels you use alongside it are also HIPAA-appropriate."
keyTakeaways:
  - "BAA availability: WebPT includes a BAA with customer accounts."
  - "Key limitation: Confirm BAA scope explicitly covers add-on products such as WebPT Reach and any third-party integrations."
  - "Shared responsibility: Clinics must manage user access, password practices, device security, and patient communication channels."
  - "Common mistake: Pairing WebPT with non-HIPAA-compliant email or SMS tools for patient messaging."
  - "Bottom line: HIPAA-appropriate for PT, OT, and SLP practices when staff workflows and adjacent tools are also compliant."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "WebPT"
    url: "https://www.webpt.com"
    publisher: "WebPT"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does WebPT sign a BAA?"
    a: "Yes. WebPT provides a BAA to its customers as part of standard onboarding. Confirm the BAA explicitly covers any add-on products you use, such as WebPT Reach."
  - q: "Can we use regular email or SMS for patient messages alongside WebPT?"
    a: "Only if those channels are themselves HIPAA-appropriate and covered by a BAA with the email or SMS provider. Standard Gmail, Outlook personal accounts, and standard SMS are typically not."
  - q: "Are WebPT integrations automatically covered by the BAA?"
    a: "No. Each integrated vendor is responsible for its own BAA with you. Verify any billing, scheduling, or analytics integration before it touches PHI."
---

## Short answer

Yes. WebPT is purpose-built for outpatient physical therapy, occupational therapy, and speech-language pathology practices. It includes a business associate agreement with customer accounts and its core workflows — documentation, scheduling, billing handoff, patient records — are designed with HIPAA in mind. Whether your clinic stays compliant in practice depends on how your staff uses it and what other tools you bolt on around it.

## BAA availability by plan tier

WebPT signs BAAs with customers as part of standard onboarding. Unlike enterprise platforms where the BAA is a separate sales negotiation, therapy-specific EHRs typically include it because the entire customer base is covered entities or business associates by definition.

What to verify when you sign:

- The BAA names the entities accurately on both sides.
- Any add-on products you have licensed — for example, WebPT Reach for patient engagement, or analytics modules — are explicitly covered.
- Integrated billing or clearinghouse partners have their own BAAs in place where they touch PHI.

Verify current terms with WebPT.

## What WebPT's BAA does and does not cover

The BAA covers WebPT's role as a business associate for the platform and contracted modules. WebPT is responsible for the security of its hosted environment, data encryption, and the controls it provides to administrators.

What it does not cover:

- Adjacent tools your clinic uses outside of WebPT — email, texting apps, generic file storage, scheduling links — unless each one has its own BAA.
- Staff behavior, including weak passwords, shared logins, or screens left visible in waiting areas.
- Personal devices used to access WebPT without device-level controls.
- Exports of patient data into spreadsheets or PDFs that then sit in unprotected locations.

Verify current terms with WebPT.

## Shared responsibility: what the clinic must do

WebPT handles the platform side; the clinic handles the workflow side.

- Provision unique user accounts for every staff member. No shared logins.
- Enforce strong passwords and multi-factor authentication where supported.
- Set role-based access so front desk, therapists, and billing each see only what they need.
- Train staff on documentation discipline — what belongs in the chart, what does not, and how to handle corrections.
- Manage device security: locked screens, encrypted laptops, no PHI on personal phones outside of approved apps.
- Use only HIPAA-appropriate channels for patient communication. If you text appointment reminders or send forms, the channel needs its own BAA.
- Keep your risk analysis and policies current; document WebPT in your vendor inventory.

## Common mistakes clinics make with WebPT

- Sending patient questions or chart snippets through personal email or standard SMS because it is faster.
- Using a free scheduling link tool that captures appointment context (a form of PHI) without a BAA.
- Exporting patient lists to spreadsheets and emailing them to billing partners.
- Relying on shared front-desk logins instead of unique accounts.
- Assuming a BAA with WebPT covers an integrated third-party product. It does not.

## Bottom line for small clinics

For PT, OT, and SLP practices, WebPT is a HIPAA-appropriate EHR choice with BAA details available during plan review. The compliance question is rarely the EHR itself — it is the surrounding stack: how your staff communicates with patients, what tools live around the EHR, and whether your policies and training match what the platform expects of you.

PHIGuard handles the surrounding work — task management, compliance tracking, vendor inventory, audit trails — so your EHR is one piece of a coherent compliance program rather than the only piece. See [PHIGuard's HIPAA-ready platform](/hipaa).

## FAQ

**Does WebPT sign a BAA**
Yes, as part of standard customer onboarding. Confirm coverage of add-on modules.

**Can we use regular email or SMS for patient messages alongside WebPT**
Only if those channels are HIPAA-appropriate and covered by their own BAAs.

**Are WebPT integrations automatically covered by the BAA**
No. Each integrated vendor needs its own BAA with your clinic.

## Current Source Posture

The source set for this page is HHS: HHS Guidance on Business Associates. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For WebPT, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing WebPT into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. BAA availability: WebPT includes a BAA with customer accounts. Key limitation: Confirm BAA scope explicitly covers add-on products such as WebPT Reach and any third-party integrations. Shared responsibility: Clinics must manage user access, password practices, device security, and patient communication channels. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
