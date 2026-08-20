---
title: "Can Healthcare Teams Use SharePoint for PHI?"
vendor: "SharePoint"
seoTitle: "SharePoint for PHI"
description: "What healthcare teams should verify before using SharePoint for PHI, including Microsoft's BAA terms, in-scope services, permissions, retention, and document governance."
metaDescription: "Can healthcare teams use SharePoint for PHI? SharePoint Online is in Microsoft's HIPAA scope, but clinics still need a BAA and governance."
publishedAt: 2026-04-22
updatedAt: 2026-05-21
verificationDate: 2026-05-21
summary: "SharePoint Online can support PHI inside a properly governed Microsoft environment with Microsoft's BAA in place. The hard part is document governance: site ownership, permissions, external sharing, retention, labels, audit visibility, and whether SharePoint is being used as a file layer or an unmanaged patient workflow system."
keyTakeaways:
  - "Microsoft lists SharePoint Online among in-scope cloud services for its HIPAA and HITECH offering."
  - "Microsoft's BAA is necessary for PHI use, but site design, permissions, retention, and sharing controls remain customer responsibilities."
  - "SharePoint is usually a better governed document layer than personal file storage, but it still is not a complete PHI workflow system."
  - "Clinics should review each site, library, guest, integration, and retention policy before patient data enters SharePoint."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "vendor-baa-tracker"
relatedCommercialPath: "/resources/best/best-hipaa-compliant-document-sharing-tools"
relatedLearnPath: "/learn/phi-workflows/phi-in-fax"
sources:
  - title: "HIPAA & HITECH Act - Microsoft Compliance"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft"
  - title: "Microsoft HIPAA Business Associate Agreement"
    url: "https://servicetrust.microsoft.com/ViewPage/HIPAABAA"
    publisher: "Microsoft"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "Business Associates FAQs"
    url: "https://www.hhs.gov/hipaa/for-professionals/faq/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can SharePoint Online be used for PHI?"
    a: "SharePoint Online can be part of a HIPAA-regulated Microsoft environment when the organization has Microsoft's BAA, uses in-scope services, and configures the sites and libraries for the actual PHI workflow."
  - q: "Does SharePoint make document sharing HIPAA compliant automatically?"
    a: "No. SharePoint provides a governed document platform, but the covered entity still has to manage permissions, guest access, retention, audit review, training, incident response, and downstream apps."
  - q: "What is the biggest SharePoint PHI risk?"
    a: "The most common risk is permission sprawl: too many site owners, inherited access that no longer matches need-to-know, external guests, old document libraries, and links that outlive the workflow."
  - q: "Is SharePoint better than OneDrive for PHI workflows?"
    a: "Often, yes, for shared document libraries and team-owned records. SharePoint is still only a document layer, so workflows that require status, assignment, evidence review, or escalation need additional governance."
---

## Short answer

SharePoint Online can support PHI when it is used in a Microsoft environment covered by Microsoft's HIPAA Business Associate Agreement and configured for the specific healthcare use case. Microsoft lists SharePoint Online among the in-scope cloud services for its HIPAA and HITECH offering, and Microsoft says its BAA covers in-scope Microsoft services for covered entity and business associate customers.

That still leaves a large customer responsibility. HHS requires covered entities to obtain satisfactory written assurances from business associates that handle PHI on their behalf. HHS also says a cloud service provider that creates, receives, maintains, or transmits ePHI for a covered entity or business associate generally needs a BAA. The contract is only the first gate. The clinic must also operate SharePoint in a way that protects confidentiality, integrity, and availability.

For most healthcare teams, SharePoint is not risky because it lacks document features. It is risky because document libraries grow faster than governance. A site that begins as a policy folder can become a referral queue, incident file store, billing exception tracker, or shared patient document repository without a clear owner.

## What to verify before PHI enters SharePoint

Before approving SharePoint for PHI, verify the baseline:

1. The tenant is covered by Microsoft's BAA.
2. SharePoint Online is the service being used, not an unmanaged consumer file location.
3. The site or library has a named business owner and technical owner.
4. The workflow has a documented purpose, retention rule, and access model.
5. Any app, connector, backup tool, migration tool, or automation that touches SharePoint content has been reviewed separately.

Then review the configuration:

- site-level and library-level permissions
- whether inheritance is appropriate or too broad
- external guest access and domain restrictions
- default sharing link type, expiration, and download behavior
- sensitivity labels, DLP, or equivalent Microsoft Purview controls where available
- retention labels, deletion rules, legal hold, and eDiscovery expectations
- audit log availability and review cadence
- owner review for stale sites and stale guests
- rules for PHI in filenames, metadata, comments, and previews
- process for responding to a mis-shared file

SharePoint can be a strong file layer when those controls are explicit. Without them, it becomes a large shared drive with more ways to disclose information.

## Where SharePoint fits

SharePoint is a better fit than personal storage for shared clinical operations documents, signed vendor documents, policy libraries, training evidence, scanned forms, internal templates, and structured document repositories. It can give a team a central place to store and govern files when the Microsoft tenant is properly configured.

It is less effective when the document is only one part of a broader process. Referral review, complaint handling, incident response, vendor remediation, billing exception follow-up, and risk analysis all involve decisions, owners, due dates, and evidence. A SharePoint folder may hold the attachments, but it does not automatically prove the workflow happened correctly.

That distinction matters in an audit. A reviewer may need to see not only the file, but also who reviewed it, what decision was made, what task followed, when the issue closed, and whether access was appropriate throughout the process.

## Common failure patterns

Healthcare teams should watch for these SharePoint patterns:

- large "all staff" document libraries containing patient-specific files
- inherited permissions that include teams with no current need-to-know
- unmanaged external guests from vendors, contractors, or former partners
- public or organization-wide links used for convenience
- patient identifiers in filenames, column metadata, or comments
- Teams channels creating SharePoint sites that no one reviews
- Power Automate, backup, search, or reporting tools moving files into another system
- old sites retained indefinitely because no owner will approve cleanup

These problems are operational, not theoretical. SharePoint can be configured well, but clinics need a review habit that keeps the configuration aligned with the actual use case.

## Approval checklist

Approve a SharePoint PHI site only when the clinic can show:

- Microsoft BAA coverage for SharePoint Online
- named owner for each PHI site or library
- documented permitted content and prohibited content
- least-privilege access design
- external sharing restrictions and guest review
- retention and deletion policy
- audit log review process
- downstream app and automation inventory
- staff training for file naming, sharing, and downloads
- incident response process for accidental disclosure
- periodic review of inactive sites and stale access

If a site cannot pass this checklist, keep PHI out of it or redesign the workflow before migration.

## Recommendation

Use SharePoint as a governed document layer, not as an accidental workflow system. It can be appropriate for PHI when Microsoft's BAA is in place and the site is designed with permissions, retention, labels, auditability, and owner review. When the work requires status tracking, assignments, escalations, or audit-ready evidence, pair SharePoint with a purpose-built workflow system instead of relying on folders alone.

## Related pages

Use [PHI in Fax](/learn/phi-workflows/phi-in-fax), [Best HIPAA-Compliant Document Sharing Tools](/resources/best/best-hipaa-compliant-document-sharing-tools), and the [vendor BAA tracker](/resources/vendor-baa-tracker) if SharePoint is the file layer behind intake, fax, or document-heavy operations.
