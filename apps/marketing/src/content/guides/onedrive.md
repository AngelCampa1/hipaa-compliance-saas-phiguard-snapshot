---
title: "Can Healthcare Teams Use OneDrive for PHI?"
vendor: "OneDrive"
seoTitle: "OneDrive for PHI"
description: "What healthcare teams should verify before using OneDrive for PHI, including Microsoft's BAA terms, in-scope services, sharing controls, sync behavior, and workflow limits."
metaDescription: "Can healthcare teams use OneDrive for PHI? OneDrive for Business is in Microsoft's HIPAA scope, but clinics still need a BAA, controls, and review."
publishedAt: 2026-04-22
updatedAt: 2026-05-21
verificationDate: 2026-05-21
summary: "OneDrive for Business can support PHI only inside a properly governed Microsoft environment with Microsoft's BAA in place. The main risk is not basic storage; it is personal file spaces, external links, sync clients, downloaded copies, comments, filenames, and downstream sharing that can turn a controlled document into uncontrolled PHI distribution."
keyTakeaways:
  - "Microsoft lists OneDrive for Business among in-scope cloud services for its HIPAA and HITECH offering."
  - "Microsoft says its BAA covers in-scope Microsoft services, but a BAA does not make the customer's workflow compliant by itself."
  - "OneDrive is strongest as a managed file layer for individual work files, not as the long-term system of record for repeatable PHI workflows."
  - "Review external sharing, link settings, sync clients, mobile access, retention, downloads, and downstream apps before PHI enters OneDrive."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "vendor-baa-tracker"
relatedCommercialPath: "/resources/best/best-hipaa-compliant-document-sharing-tools"
relatedLearnPath: "/learn/phi-workflows/phi-in-email"
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
  - q: "Can OneDrive for Business be used for PHI?"
    a: "OneDrive for Business can be part of a HIPAA-regulated Microsoft environment when the organization has Microsoft's BAA and uses in-scope services with appropriate safeguards. Personal OneDrive accounts and unmanaged consumer file sharing should not be treated as PHI-ready."
  - q: "Does Microsoft's BAA make every OneDrive workflow compliant?"
    a: "No. The BAA is only the contract baseline. The healthcare organization still has to configure access, external sharing, retention, device controls, audit review, training, and downstream app restrictions for the actual workflow."
  - q: "What is the biggest OneDrive PHI risk?"
    a: "The most common risk is file sprawl: broad sharing links, copied files, local sync folders, unmanaged downloads, PHI in filenames, and staff using personal file spaces as workflow queues."
  - q: "Is OneDrive a good system of record for PHI workflows?"
    a: "Usually no. OneDrive can store files, but repeatable PHI work usually needs ownership, status, retention, evidence, audit history, and clear handoffs that a personal file space does not provide by itself."
---

## Short answer

OneDrive for Business can support PHI only when it is used inside the right Microsoft commercial environment, covered by Microsoft's HIPAA Business Associate Agreement, and configured for the specific workflow. Microsoft lists OneDrive for Business among the in-scope cloud services for its HIPAA and HITECH offering. Microsoft also says covered entity and business associate customers can enter a BAA that covers in-scope Microsoft services.

That is a qualified yes, not a blanket approval. HHS frames a business associate relationship around a vendor that creates, receives, maintains, or transmits PHI for a covered entity or business associate. HHS also says cloud service providers that maintain ePHI generally need a BAA, even when the data is encrypted and the provider cannot view the content. For OneDrive, the BAA answers only one part of the review. The clinic still has to show that its actual OneDrive use is controlled.

The practical question is not "Can OneDrive store a file?" It is "Can the clinic prove who could access the PHI, why they needed it, where the file moved, how long it remained, and whether the sharing pattern matched policy?"

## What to verify before PHI enters OneDrive

Start with the contract and service scope:

1. Confirm the organization is using a Microsoft business environment covered by the applicable Microsoft agreements.
2. Confirm Microsoft's BAA applies to the tenant and to OneDrive for Business.
3. Confirm the workflow does not rely on consumer OneDrive, personal Microsoft accounts, or unmanaged external storage.
4. Confirm any connected app that receives, scans, backs up, exports, or transforms the file has its own HIPAA review and BAA status.

Then review the operating controls:

- default link type and expiration settings
- external sharing policy by domain and guest type
- access review cadence for folders containing PHI
- mobile, offline, sync, and download restrictions
- DLP or sensitivity labels where the Microsoft tenant supports them
- audit log availability and retention
- retention, deletion, legal hold, and eDiscovery rules
- naming rules that avoid patient identifiers in file titles when possible
- staff training on when OneDrive is allowed and when a more controlled workflow is required

These controls matter because OneDrive is often used by individuals before IT has designed a formal document library. A staff member may save an intake file to a personal work folder, share it with a colleague, sync it locally, then attach it to an email or move it into another application. Each step can be permitted or risky depending on configuration and purpose.

## Where OneDrive fits

OneDrive is best for individual work files that need business-managed storage, device controls, and limited collaboration before the file moves into a more durable location. It can be reasonable for draft policy updates, temporary working copies, limited internal review, or a staff member's controlled workspace when the tenant is governed.

It is weaker as the primary location for recurring patient workflows. If intake packets, referral documents, billing support files, complaints, or incident materials live in individual OneDrive folders, the organization may lose visibility into ownership and retention. A folder can hold documents, but it does not prove that the right person reviewed them, that a follow-up task closed, or that stale access was removed.

## Common failure patterns

The highest-risk OneDrive patterns are usually ordinary staff behavior:

- PHI in filenames, folder names, comments, or preview text
- "Anyone with the link" sharing
- long-lived external guest access
- synced copies on unmanaged laptops
- downloaded files that remain outside retention rules
- staff moving documents from OneDrive into email, chat, spreadsheets, or automation tools
- old personal work folders that become unofficial patient queues
- backups or security tools that copy files into another vendor environment without review

These are not reasons to reject OneDrive automatically. They are reasons to define its role narrowly and monitor it. If a workflow needs assignment, status, escalation, audit history, or evidence packaging, OneDrive should be the file layer rather than the workflow system.

## Approval checklist

Approve OneDrive for PHI only after the clinic can show:

- Microsoft BAA coverage for the tenant and OneDrive for Business
- documented OneDrive use cases that may contain PHI
- prohibited uses, including consumer accounts and unmanaged personal devices
- external sharing rules and guest access review
- sensitivity labels, DLP, retention, or equivalent controls where available
- local sync, offline access, and mobile policies
- downstream app inventory for files exported from OneDrive
- staff training and sanctions for unsafe sharing
- periodic access review for PHI folders
- incident response steps for mis-shared files

If those items are incomplete, keep OneDrive limited to non-PHI files until the gaps are closed.

## Recommendation

Use OneDrive for Business as a controlled individual file workspace inside a broader Microsoft compliance program. Do not let it become the invisible patient workflow layer. For repeatable PHI operations, move the work into a system that tracks owner, status, due date, decision, evidence, and audit history, while using OneDrive or SharePoint only where managed document storage is the right fit.

## Related pages

Use [PHI in Email](/learn/phi-workflows/phi-in-email) for one common file-sharing channel, [Best HIPAA-Compliant Document Sharing Tools](/resources/best/best-hipaa-compliant-document-sharing-tools), and the [vendor BAA tracker](/resources/vendor-baa-tracker) if OneDrive is one piece of a Microsoft-heavy workflow.
