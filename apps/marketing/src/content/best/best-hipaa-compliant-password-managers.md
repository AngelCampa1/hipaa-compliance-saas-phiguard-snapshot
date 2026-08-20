---
title: "Best HIPAA-Compliant Password Managers for Clinics"
category: "Password managers"
seoTitle: "Best HIPAA Password Managers"
description: "A comparison of password managers clinics evaluate under a BAA: 1Password Business, Bitwarden Teams, Keeper Enterprise, and LastPass Business."
metaDescription: "Best HIPAA-compliant password managers. Compare 1Password, Bitwarden, Keeper, and LastPass on BAA availability, SSO, audit log, and pricing model."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
summary: "Password managers should be evaluated by BAA availability, workflow fit, audit evidence, pricing clarity, and small-team usability. A comparison of password managers clinics evaluate under a BAA: 1Password Business, Bitwarden Teams, Keeper Enterprise, and LastPass Business. The strongest options help clinics document risk analysis, policies, training, vendor BAAs, incidents, and recurring follow-up without turning compliance into a custom project-management build. Password managers protect access credentials to PHI systems."
keyTakeaways:
  - "Password managers protect access credentials to PHI systems and belong inside the HIPAA control set."
  - "Vendor positions on a HIPAA BAA differ; confirm before you assume coverage."
  - "SSO and access audit matter more than the UX for individual users."
  - "LastPass had a significant data breach in 2022 — confirm current posture before renewing."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/compare"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "1Password Business"
    url: "https://support.1password.com/hipaa/"
    publisher: "1Password"
  - title: "LastPass HIPAA"
    url: "https://support.lastpass.com/s/document-itemlanguage=en_US&bundleId=lastpass&topicId=LastPass/hipaa-compliance.html"
    publisher: "LastPass"
  - title: "45 CFR 164.308(a)(5) — Security Awareness"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "LastPass Security Incident 2022 — Notice"
    url: "https://blog.lastpass.com/posts/2022/12/notice-of-recent-security-incident"
    publisher: "LastPass"
faq:
  - q: "Does a password manager need a BAA?"
    a: "Yes, if the vendor could incidentally access PHI, which several acknowledge they could through stored notes or attachments. Treat them as business associates and sign the BAA."
  - q: "Is a personal password manager enough?"
    a: "No. Clinics need a team plan with centralized admin, access audit, and the ability to offboard accounts when a workforce member leaves. Personal plans cannot offboard."
  - q: "What is the biggest risk we are trying to reduce?"
    a: "Shared passwords and sticky notes. Both are common in clinics and both fail 45 CFR 164.312(a) access-control requirements."
---

## A password manager is table stakes, not optional

45 CFR 164.312(a) requires technical access control on systems that handle ePHI. In practice, that means unique credentials per workforce member, rotation on offboarding, and audit of who accesses what. A shared login for the EHR or the practice-management system fails this on day one. A password manager is how small clinics actually meet the requirement without an IT team.

Password managers do not store PHI directly. They store credentials that open systems containing PHI, along with occasional secure notes and attachments. The vendor's HIPAA posture and BAA availability still matter.

## The four vendors clinics actually evaluate

**1Password Business.** 1Password provides a HIPAA guidance page and will enter a BAA with customers on qualifying business plans. Strong admin controls, recovery model, and SSO. Widely used in small-to-mid clinics.

**Bitwarden Teams and Enterprise.** Bitwarden states they will sign a BAA with customers on paid plans and provides HIPAA-oriented guidance. Open-source core, self-host option for clinics with strict data-residency preferences. Often cheaper per seat.

**Keeper Enterprise.** Keeper offers HIPAA-compliant configurations and a BAA on qualifying plans. Strong audit log and role-based access. Popular in larger organizations with compliance programs already in place.

**LastPass Business.** LastPass offers HIPAA support and a BAA on qualifying plans. In 2022, LastPass disclosed a data breach in which encrypted password vaults were exfiltrated along with customer account metadata. Many clinics evaluated alternatives following the breach. Clinics already on LastPass should verify current encryption and incident response posture before renewing.

## The comparison that actually matters

| Vendor | BAA | SSO | Access audit | Offboarding | Pricing model |
|---|---|---|---|---|---|
| 1Password Business | On qualifying plans | Yes | Yes | Per-user deprovision | Per-user |
| Bitwarden Teams/Enterprise | On paid plans | Enterprise plan | Yes | Per-user deprovision | Per-user |
| Keeper Enterprise | On qualifying plans | Yes | Yes | Per-user deprovision | Per-user |
| LastPass Business | On qualifying plans | Yes | Yes | Per-user deprovision | Per-user |

All four use per-seat pricing. That is standard for the category and, in this specific case, defensible: every workforce member with access to PHI systems needs their own vault.

## What to check before you sign

- The BAA is available on the plan you are buying, not only the top-tier enterprise plan.
- SSO is included at the tier you can actually afford; some vendors gate SSO to higher tiers, which fragments access control.
- The access audit log is queryable and retained long enough to support a breach investigation.
- Offboarding actually revokes access to shared vaults, not just the user's personal vault.
- Emergency recovery does not rely on a single person who could leave the clinic.

## Policy is where clinics win or lose

Deploying a password manager without a policy is half the job. The workforce policy should specify:

- No credentials for PHI systems outside the password manager.
- No shared logins for EHR, billing, or patient-communication platforms.
- Offboarding procedure when a workforce member leaves, with a recurring task to verify.
- MFA requirement for the password manager account itself and for any system storing PHI.

These policies belong in the same policy library and attestation system as the rest of your HIPAA program.

## What the password manager does not cover

Credentials are one control. The compliance program still needs policy, training, BAA register, incident log, and access reviews. For that operating layer see [PHIGuard pricing](/pricing) or the full [HIPAA software comparison](/compare). For the access-control rules, see [HIPAA basics](/learn/hipaa-basics/what-is-phi). Clinics also hardening their video and messaging stack should see our [best HIPAA-compliant video conferencing](/resources/best/best-hipaa-compliant-video-conferencing) roundup.

If your practice still has a shared Post-it under the front-desk monitor, the first fix is not a vendor. It is a policy and the tool to enforce it.

## Source Posture and Buying Criteria

Best HIPAA-Compliant Password Managers for Clinics should be evaluated with a conservative source posture: prefer official vendor documentation for BAA availability, HHS or eCFR pages for HIPAA obligations, and the clinic's own contract files for final proof. The source set for this page is eCFR: 45 CFR 164.308(a)(5) — Security Awareness. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. Do not treat marketplace badges, sales copy, or generic security language as proof that a specific plan can receive PHI.

For small clinics, the best option is usually the product that reduces coordination burden while preserving evidence. Password managers protect access credentials to PHI systems and belong inside the HIPAA control set. Vendor positions on a HIPAA BAA differ; confirm before you assume coverage. SSO and access audit matter more than the UX for individual users. Buyers should compare how each tool handles ownership, reminders, user access, audit history, exports, and offboarding rather than ranking products only by feature count.

A practical decision record should name the chosen tool, the approved PHI workflows, the signed BAA location, the owner for admin settings, and the review cadence. If a product is useful but not covered for PHI, document the permitted non-PHI use cases and train staff not to put patient names, appointment details, diagnoses, payment notes, or attachments into that system.
