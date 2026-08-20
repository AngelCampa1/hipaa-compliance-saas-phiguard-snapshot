---
title: "Is Microsoft Teams HIPAA Compliant for Medical Clinics"
vendor: "Microsoft Teams"
seoTitle: "Is Microsoft Teams HIPAA Compliant"
description: "What small clinics need to know about Teams' HIPAA BAA coverage, required admin configuration, guest access risks, and whether Teams for Healthcare is a distinct offering."
metaDescription: "Is Microsoft Teams HIPAA compliant Learn about Teams' BAA coverage, admin setup requirements, guest access risks, and the Teams for Healthcare tier."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "Microsoft Teams is covered under Microsoft's HIPAA BAA terms through the Online Services Data Protection Addendum for qualifying Microsoft 365 plans. However, the clinic must configure Teams-specific admin controls — including guest access policies, chat retention, and meeting recording settings — before Teams can be used safely for PHI-adjacent communication. Microsoft also offers Teams for Healthcare with virtual appointment and care coordination features."
keyTakeaways:
  - "Teams is covered under Microsoft's BAA for qualifying Microsoft 365 plans — no separate contract is needed, but the DPA must apply."
  - "Guest access in Teams must be audited; external guests who receive PHI in a chat or meeting are a compliance concern if they are not covered by appropriate agreements."
  - "Meeting recordings in Teams are stored in SharePoint or OneDrive; those storage locations must also be under BAA-covered controls."
  - "Microsoft Teams (free) and Teams personal accounts are not covered under the enterprise BAA."
  - "Teams for Healthcare adds clinical features including care plan coordination and virtual visits, but the standard compliance configuration steps still apply."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Microsoft HIPAA Overview"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft"
  - title: "Teams for Healthcare Overview"
    url: "https://learn.microsoft.com/en-us/microsoftteams/expand-teams-across-your-org/healthcare/teams-in-hc"
    publisher: "Microsoft"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Is Microsoft Teams covered by the same BAA as Outlook and Exchange?"
    a: "Yes. Teams is listed as a covered service under Microsoft's Online Services Data Protection Addendum along with Exchange Online, SharePoint Online, and other Microsoft 365 services. Confirm current coverage against Microsoft's published DPA."
  - q: "Can a clinic use Teams to conduct telehealth visits with patients?"
    a: "Teams can support telehealth visits under a properly configured BAA-covered account. Teams for Healthcare adds virtual appointment features. The clinic is also responsible for state telehealth consent requirements, which are separate from HIPAA."
  - q: "What happens to Teams recordings under HIPAA?"
    a: "Teams meeting recordings are stored in SharePoint or OneDrive. Both must be under BAA-covered controls with appropriate access restrictions. The clinic must configure retention policies and access controls for recording storage."
  - q: "Do external guests in a Teams meeting need a BAA?"
    a: "If a guest receives PHI during a Teams meeting or in a Teams channel, the clinic should assess whether that party is acting as a business associate. Referring providers and billing companies that receive PHI may need their own BAA with the clinic."
---

## Short answer

Microsoft Teams is covered under Microsoft's HIPAA BAA for qualifying Microsoft 365 plans. The BAA is accepted through Microsoft's Online Services Data Protection Addendum rather than a separate agreement. Teams personal accounts and the free version of Teams are not covered. The clinic must configure Teams admin settings for guest access, retention, and recording before using it for PHI-adjacent communication.

## BAA coverage

Teams coverage flows from Microsoft's Data Protection Addendum, which is incorporated into qualifying Microsoft 365 subscriptions. Teams is listed alongside Exchange Online, SharePoint Online, and OneDrive as covered services. To confirm coverage:

1. Review the current Microsoft Online Services Data Protection Addendum (available at aka.ms/DPA).
2. Verify that the clinic's specific Microsoft 365 plan includes Teams as a covered online service.
3. Confirm that the admin has accepted the current version of the DPA through the Microsoft 365 Admin Center.

## Teams for Healthcare

Microsoft offers Teams for Healthcare as a feature set within Microsoft 365 for enterprise and eligible healthcare-focused plans. It includes:

- Virtual appointments with queue management and wait room functionality
- Care plan templates and care coordination features within Teams channels
- Integration with Electronic Health Records (EHR) systems from select vendors

Teams for Healthcare does not change the HIPAA BAA status — it is still covered under the same DPA — but it adds functionality relevant to clinical workflows. Small clinics on standard Microsoft 365 plans do not automatically access Teams for Healthcare features.

## Required admin configuration

BAA coverage does not make Teams safe by default. The admin must:

- **Review guest access settings.** Limit which external parties can be added to Teams channels and meetings. Any guest who receives PHI is potentially a business associate.
- **Configure meeting recording policies.** Decide which users can record meetings, where recordings are stored, and how long they are retained. Recordings containing PHI must be stored in a BAA-covered location with access controls.
- **Enable audit logging.** Teams activity logs must be retained for HIPAA access log requirements.
- **Apply retention policies.** Chat messages and channel content containing PHI must follow the clinic's document retention schedule.
- **Restrict third-party app installs.** Teams allows a wide marketplace of third-party apps. Any app that accesses PHI-adjacent data must have its own BAA with the clinic.

## Known risks and limitations

Even with a compliant configuration:

- Teams chat is informal and easy to misuse. Staff may share patient names, appointment details, or clinical questions in chat threads out of habit. Access controls limit who can see a channel, but they do not prevent staff from misidentifying recipients or including unnecessary detail.
- Teams notifications on mobile devices may display PHI in preview text if the device is not managed.
- External meeting participants who are patients do not have their own covered accounts. The BAA covers the service side; the patient experience is the clinic's responsibility.

## What to keep out of Teams even with a BAA

- Do not post patient-identifiable information in public-facing Team channels or channels with broad membership
- Do not use Teams to share records with parties who have not been assessed for business associate status
- Do not store recordings in personal OneDrive locations outside organizational controls

## When Teams alone is not enough

## Current Source Posture

The source set for this page is Microsoft: Teams for Healthcare Overview; HHS: HHS Guidance on Business Associates. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Microsoft Teams, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Microsoft Teams into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Teams is covered under Microsoft's BAA for qualifying Microsoft 365 plans — no separate contract is needed, but the DPA must apply. Guest access in Teams must be audited; external guests who receive PHI in a chat or meeting are a compliance concern if they are not covered by appropriate agreements. Meeting recordings in Teams are stored in SharePoint or OneDrive; those storage locations must also be under BAA-covered controls. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
