---
title: "PHI in Cloud Storage"
description: "When using Box, Dropbox, or OneDrive for clinical or administrative files creates HIPAA risk, which plans offer BAAs, and how to structure cloud storage for PHI compliance."
metaDescription: "When does cloud storage create HIPAA risk Box, Dropbox, and OneDrive BAA availability, PHI risk patterns, and compliant cloud storage for small clinics."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: phi-workflows
summary: "Personal cloud storage platforms - Box, Dropbox, and OneDrive - are widely used by clinic staff for file sharing and document management. Each platform's HIPAA BAA availability depends on the plan tier. Standard consumer and small-business plans typically do not include a BAA, making them non-compliant for PHI storage."
keyTakeaways:
  - "Consumer and standard business plans for Dropbox, Box, and OneDrive typically do not include a HIPAA BAA - verify current plan requirements before using any plan for PHI"
  - "Dropbox Business Plus and above, Box Business Plus and above, and Microsoft 365 with a Business or Enterprise plan (covered by Microsoft's Online Services BAA) may qualify for BAA coverage - confirm current terms directly with each vendor"
  - "Staff syncing work files to personal Dropbox or Google Drive accounts is an unauthorized PHI disclosure - even for files that seem administrative"
  - "Shared link features in cloud storage platforms allow files to be accessed without login - a shared link to a PHI-containing file is a potential unauthorized disclosure"
  - "The safest approach for small clinics: use EHR-native document management where available, and limit cloud storage for PHI to platforms where a BAA is executed and access is controlled"
author: angel-campa
reviewer: phiguard-compliance-research
intent: consideration
relatedResource: phi-workflow-audit-worksheet
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR Section  164.308(b) - Business Associates"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
  - title: "HHS Cloud Computing Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html"
    publisher: "HHS"
---

Dropbox, Box, and OneDrive are in use at most clinics - and in many of them, PHI ends up in those platforms without anyone having deliberately decided the platform is appropriate for it.

The PHI risk in cloud storage is routine: a billing coordinator saves an accounts receivable export to their Dropbox folder. A provider uploads patient intake forms to Box for easy access from home. An office manager creates a shared OneDrive folder for patient referral documents. In each case, PHI has entered a cloud storage platform, and whether that platform has a BAA with the clinic may never have been asked.

## Which Plans Offer BAA Coverage

None of these platforms offer a BAA on consumer or standard small-business plans. BAA availability is generally tied to business-tier or enterprise-tier plans.

**Box:** Box offers HIPAA compliance features and BAA availability on Business Plus, Enterprise, and Enterprise Plus plans. Standard Business and lower plans do not include a BAA. Verify current plan requirements and execute a BAA with Box before using it for PHI.

**Dropbox:** Dropbox offers a Business Associate Agreement on Dropbox Business Plus and above. Standard Dropbox Business and lower plans do not include a BAA. Verify current requirements at Dropbox's legal documentation.

**OneDrive (Microsoft 365):** OneDrive is part of Microsoft 365. Microsoft offers a HIPAA BAA as part of its Online Services Terms that covers Microsoft 365 Business Basic, Business Standard, Business Premium, and enterprise plans. Personal Microsoft 365 (formerly Office 365 Home) plans are not covered. The BAA must be explicitly accepted - it does not apply automatically to Microsoft 365 subscriptions. Verify current terms at Microsoft's Trust Center.

**Google Drive:** Google Workspace (Business Starter, Business Standard, Business Plus, and Enterprise plans) is covered under Google's HIPAA BAA when the BAA is executed. Consumer Google accounts - Gmail, personal Google Drive - are not covered.

The pattern is consistent across all three platforms: the business or enterprise tier has BAA coverage; the personal or consumer tier doesn't. For small clinics, the question is whether your specific plan qualifies - and whether you've actually executed the BAA, not just accepted a terms of service.

## How PHI Gets Into Cloud Storage Without Anyone Noticing

### Staff Syncing Work Files to Personal Accounts

The most common PHI-in-cloud-storage pattern: a staff member uses Dropbox or Google Drive for personal use and installs the desktop sync client. When they save a work file to the desktop - an accounts receivable spreadsheet, a scanned insurance card, an EHR export - it syncs automatically to their personal account.

The staff member may not think of this as a PHI transmission - they're just saving a work file to their computer. The sync client routes it to their personal Dropbox, in an account they control personally, with no BAA, no access controls, and no connection to the clinic's compliance program. That is an unauthorized PHI disclosure.

Preventing it requires:
- A written BYOD and personal cloud storage policy that explicitly prohibits syncing work files to personal accounts
- Staff training on what "work files" includes - any file that contains patient information, even files that look primarily administrative
- A clinic-provided cloud storage solution with a BAA as the authorized alternative

### Shared Links to PHI-Containing Files

Dropbox, Box, OneDrive, and Google Drive all offer shared link features - a URL that allows anyone with the link to access a file without logging in. These links are designed for convenient sharing with external parties.

If a staff member creates a shared link to a PHI-containing file, that link is a potential unauthorized disclosure. Anyone who receives or obtains the URL can access the file without authentication, for as long as the link remains active.

Shared link settings should be reviewed and restricted in any cloud storage platform used for PHI:
- Require login to access shared files (disable "anyone with the link" access)
- Set expiration dates on any shared links
- Audit active shared links periodically

### The Personal Account Confusion

Staff who use the same cloud storage platform for both personal and work files may have confusion about which account they're saving to. A nurse who uses Google Drive for personal photos and for sharing clinic documents from home may save a patient document to their personal Google Drive account rather than the clinic's Google Workspace account - because the personal account was signed in.

For clinics that use a business cloud storage platform with a BAA, staff should be set up with clinic accounts, not personal accounts. Access to the clinic's shared storage should require authentication with clinic credentials.

## The Right Structure for Compliant Cloud Storage

For small clinics that need cloud storage for PHI-containing files:

**Option 1: EHR-native document management.** If your EHR has a document management feature - the ability to attach files, forms, and documents to patient records - use it for all PHI-containing files. The EHR vendor's BAA covers document storage within the EHR platform.

**Option 2: Business-tier cloud storage with a BAA.** If staff need a shared cloud folder for PHI-containing files (referral documents, intake forms, authorization forms), use a business-tier plan from a platform with a BAA. Execute the BAA before use. Configure access controls to limit who can see PHI-containing folders.

**Option 3: Separate the PHI files from non-PHI files.** If the clinic uses a cloud platform for some functions and isn't ready to execute a BAA, ensure that PHI-containing files never go into that platform. Maintain strict separation between administrative files (meeting notes, marketing documents, vendor invoices - no PHI) and clinical/billing files (PHI).

## Common Scenarios and How to Handle Them

**Scenario: We use Dropbox to share referral documents with specialists.**
Referral documents typically contain PHI - patient demographics, diagnosis, reason for referral. If Dropbox is being used for this, confirm the Dropbox plan is BAA-eligible, execute the BAA, and verify that sharing settings require authenticated access rather than open links.

**Scenario: A front desk employee saves scanned insurance cards to a OneDrive folder.**
Insurance cards contain patient name and insurance ID number - PHI. Confirm the clinic's Microsoft 365 plan is a business tier covered by the Microsoft Online Services BAA, and that the BAA has been accepted. If the employee is saving to a personal OneDrive account, that's an unauthorized disclosure.

**Scenario: The practice administrator uses Google Drive for tracking practice management documents - some of which mention patients.**
Determine which documents mention patients and contain PHI. If Google Drive is a personal account, PHI should not be in it. If the clinic has a Google Workspace (business) account with a BAA executed, ensure that PHI files are in the clinic's account, not the administrator's personal account.

**Scenario: Staff are sharing X-ray images via Dropbox for quick specialist review.**
Imaging files (X-rays, MRI images) are PHI. They should be transmitted through a BAA-covered platform - ideally a medical imaging sharing platform with an established HIPAA record, or a BAA-covered cloud storage platform. Consumer Dropbox is not appropriate for this use.

## The Audit Question

The PHI workflow audit question for cloud storage:

*"Are there any files containing patient names, dates of service, diagnosis codes, insurance information, or clinical information stored in a cloud platform that the clinic has not executed a BAA with"*

For most small clinics, the honest answer to this question requires some investigation. Check with billing staff, front desk, providers, and administrators. Ask what cloud storage platforms they use and what files they've saved there.

You can't manage what you haven't found. The audit question above is the starting point.
