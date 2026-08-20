---
title: "Is Google Workspace HIPAA Compliant for Medical Clinics"
vendor: "Google Workspace"
seoTitle: "Is Google Workspace HIPAA Compliant"
description: "What small clinics need to know about Google Workspace's HIPAA BAA, covered services, required admin configuration, and the features Google excludes from BAA scope."
metaDescription: "Is Google Workspace HIPAA compliant Guide to Google's BAA, covered services, admin setup steps, and what clinics must verify before placing PHI there."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
verificationDate: 2026-04-24
legacyPaths:
  - "/resources/guides/is-google-forms-hipaa-compliant"
summary: "Google Workspace can be configured for HIPAA-covered use after the clinic admin accepts the HIPAA Business Associate Amendment in the Admin Console. Google's BAA covers a defined set of Workspace services — Gmail, Drive, Docs, Sheets, Calendar, Meet, and others — but explicitly excludes certain AI features, Marketplace add-ons, and other Google products. The clinic is responsible for knowing which services are in scope and configuring each appropriately."
keyTakeaways:
  - "Google Workspace BAA must be accepted by an admin in the Google Admin Console — it is not automatic on any paid plan."
  - "Covered services include Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, and Forms, among others — confirm the current list in Google's HIPAA implementation guide."
  - "Google Workspace Marketplace add-ons are not covered by Google's BAA; each third-party add-on requires its own assessment."
  - "Certain AI features integrated into Workspace (including some Gemini features) may fall outside BAA coverage — verify before enabling."
  - "Admin controls for sharing, access, audit logging, and device management must be applied before PHI enters the Workspace environment."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Google Workspace HIPAA Implementation Guide"
    url: "https://knowledge.workspace.google.com/admin/compliance/hipaa-compliance-with-google-workspace-and-cloud-identityhl=en"
    publisher: "Google"
  - title: "Google Cloud Business Associate Agreement"
    url: "https://cloud.google.com/terms/baa"
    publisher: "Google"
  - title: "HHS Summary of the HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
faq:
  - q: "Does every Google Workspace plan qualify for HIPAA BAA coverage?"
    a: "Google allows BAA acceptance across paid Workspace plans. The BAA must be explicitly accepted by an admin. Review Google's current HIPAA implementation guide to confirm which services are covered on each plan tier."
  - q: "Are Google Workspace Marketplace apps covered by the Google BAA?"
    a: "No. Third-party apps installed through Google Workspace Marketplace are not covered by Google's BAA. Each app requires its own HIPAA assessment and, if it processes PHI, a separate BAA with that vendor."
  - q: "Can a clinic use Google Workspace for patient record storage?"
    a: "Google Workspace Drive can store documents under BAA coverage, but it is a general file-storage and document creation platform. It does not provide patient-record-level access control, purpose-based audit trails, or clinical workflow structure."
  - q: "How does a Google Workspace admin accept the HIPAA BAA?"
    a: "Log in to the Google Admin Console as a super administrator. Navigate to Account > Account Settings > Legal. Locate the HIPAA Business Associate Amendment and accept it. This must be done before any PHI enters the environment."
---

## Short answer

Google Workspace can be configured for HIPAA-covered use, but it requires the admin to explicitly accept the HIPAA Business Associate Amendment and apply a set of admin controls. Google's BAA covers specific services within Workspace. It does not cover every Google product, every Workspace feature, or any third-party app the clinic installs. The default configuration of Google Workspace is not HIPAA-safe.

## How to accept the Google Workspace BAA

1. Sign in to the Google Admin Console using a super administrator account.
2. Navigate to **Account > Account Settings > Legal**.
3. Find the HIPAA Business Associate Amendment and accept it.
4. Record the date of acceptance and the admin who accepted it as part of the clinic's vendor management documentation.

This step must be completed before any PHI is created, stored, or transmitted through any covered Workspace service.

## What is covered

Google's HIPAA implementation guide identifies the core Workspace services covered under the BAA. At the time of writing, these have included:

- Gmail (Exchange of email using Google's servers)
- Google Drive (file storage and collaboration)
- Google Docs, Sheets, Slides
- Google Forms
- Google Calendar
- Google Meet
- Google Chat (in covered configurations)
- Google Sites (in certain configurations)
- Google Vault (for archiving and e-discovery)

Verify the current list against Google's published HIPAA implementation guide, as coverage can change when new features are added or when Google updates its service terms.

## What is not covered

Google explicitly excludes certain products and features from BAA coverage. These have included:

- **Google Workspace Marketplace add-ons.** Any third-party app installed from the Marketplace accesses Workspace data outside Google's BAA scope. A separate assessment and BAA with the add-on vendor is required.
- **Certain Gemini AI features.** AI-generated content features integrated into Docs, Gmail, and other Workspace apps may fall outside the BAA if they rely on AI processing that Google has not included in covered services. Verify against current Google guidance before enabling AI features in a PHI-adjacent environment.
- **Personal Google accounts.** Staff who sign in with personal @gmail.com accounts rather than their Workspace accounts are not covered.
- **Google Consumer products.** Google Photos, personal Drive, and other consumer Google services are not covered.

## Required admin configuration

Accepting the BAA is the first step. The clinic's admin must also apply controls across the Workspace environment:

- **Restrict external sharing in Drive.** Prevent files from being shared outside the organization without explicit control. Disable link-sharing that allows unauthenticated access.
- **Configure organizational units.** Apply different sharing and access policies to groups that handle PHI versus administrative staff with no PHI exposure.
- **Enable audit and investigation tools.** Google Workspace includes Admin Reports and Audit logs. Configure these to retain activity logs for the period required by the clinic's retention policy.
- **Enforce 2-Step Verification.** All accounts with PHI access must require multi-factor authentication.
- **Review Google Meet recording settings.** Recordings must save to organization-controlled Drive locations with appropriate access restrictions.
- **Audit and control Calendar sharing.** Patient appointment information in Calendar titles or descriptions may constitute PHI.

## The product fit question

Google Workspace is a general-purpose productivity suite. It handles email, documents, calendar, and video — all useful in a clinic. What it does not handle is the structure a HIPAA compliance program requires: task accountability tied to specific staff, policy attestation records, incident tracking, risk assessment documentation, and training completion logs.

## Current Source Posture

The source set for this page is Google: Google Cloud Business Associate Agreement; HHS: HHS Summary of the HIPAA Security Rule. Treat those pages as starting points, then confirm plan names, BAA eligibility, and support commitments in the current contract before relying on the tool for PHI. For Google Workspace, the safe answer depends on the exact service, account tier, administrative settings, and signed paperwork in place on the date the clinic starts using the product. A public compliance page is useful evidence, but it does not replace the clinic's own BAA file, configuration notes, retention policy, and access review.

## What Clinics Should Verify

Before allowing Google Workspace into a workflow that may contain PHI, document the covered services, excluded features, user roles, default sharing behavior, logging, deletion options, and integration paths. If the vendor separates products under similar branding, record the exact SKU or plan name. If AI, transcription, messaging, storage, or automation features are involved, confirm whether those features are covered by the same BAA or require separate controls.

## Operational Controls to Keep

A clinic should keep a short decision record showing why the tool is allowed, what PHI is permitted, who owns administration, and how staff are trained to use it. Google Workspace BAA must be accepted by an admin in the Google Admin Console — it is not automatic on any paid plan. Covered services include Gmail, Drive, Docs, Sheets, Slides, Calendar, Meet, and Forms, among others — confirm the current list in Google's HIPAA implementation guide. Google Workspace Marketplace add-ons are not covered by Google's BAA; each third-party add-on requires its own assessment. Revisit that record when the vendor changes product names, adds AI features, changes subprocessors, or moves HIPAA support to a different tier.

## Practical Decision Record

For audit readiness, store the signed BAA, contract or order form, security review notes, screenshots of relevant admin settings, and a list of workflows approved for the product. Keep prohibited uses explicit. If staff need the tool only for non-PHI work, say that clearly in policy and training so convenience does not turn into an undocumented PHI channel.
