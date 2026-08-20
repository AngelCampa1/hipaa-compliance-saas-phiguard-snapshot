---
title: "Is Microsoft 365 HIPAA Compliant"
vendor: "Microsoft 365"
seoTitle: "Is Microsoft 365 HIPAA Compliant"
description: "What medical clinics must know about Microsoft 365 HIPAA compliance — including how to execute the BAA through the Microsoft Products and Services Agreement, which features must be configured, and why the BAA alone is not sufficient."
metaDescription: "Is Microsoft 365 HIPAA compliant It can be, but not out of the box. Learn how to execute the M365 BAA and which compliance features clinics must configure..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Microsoft 365 requires a plan-and-use review, not a blanket HIPAA label. What medical clinics must know about Microsoft 365 HIPAA compliance — including how to execute the BAA through the Microsoft Products and Services Agreement, which features must be configured, and why the BAA alone is not sufficient. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out."
keyTakeaways:
  - "Microsoft 365 CAN be made HIPAA compliant with proper BAA execution and configuration — but is not compliant by default."
  - "The BAA is executed through the Microsoft Products and Services Agreement (MPSA) or accepted in the M365 admin center."
  - "Required configurations include audit logging, DLP policies, retention policies, MFA, and restrictions on external sharing."
  - "Microsoft Teams, SharePoint, OneDrive, and Exchange are among the M365 services covered under the BAA with proper setup."
  - "HIPAA compliance is the clinic's responsibility — Microsoft's BAA establishes their obligations but does not configure your environment for you."
sources:
  - title: "HIPAA/HITECH Act"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft Trust Center"
  - title: "HIPAA Overview"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft Learn"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does every Microsoft 365 plan include the HIPAA BAA?"
    a: "Microsoft offers the BAA to customers through the MPSA; it applies to Microsoft 365 commercial plans. The BAA is not automatically signed — you must accept it through the admin portal or through a direct agreement. Review Microsoft's current Trust Center documentation for the specific plans and process, as these details can change."
  - q: "Is Microsoft Teams HIPAA compliant for provider communications?"
    a: "Teams can be HIPAA compliant when used under an executed M365 BAA with proper configuration — including audit logging enabled, external access restrictions in place, and MFA required. Teams used without these configurations, or with the BAA not executed, is not a covered environment for PHI communication."
  - q: "Can clinic staff share patient documents through OneDrive?"
    a: "Under a properly executed BAA and configured M365 environment, OneDrive can be used for PHI-containing documents. External sharing must be restricted. Files must not be shared publicly or with non-covered individuals. Guest access and link-sharing settings require careful review."
  - q: "Does using Microsoft 365 with a BAA replace the need for a HIPAA compliance program?"
    a: "No. The BAA covers Microsoft's obligations as a business associate. Your clinic still needs a documented risk assessment, workforce training records, written policies, an incident response plan, and all other HIPAA administrative and physical safeguard requirements."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Is Microsoft 365 HIPAA compliant It can be — but it is not compliant out of the box. Microsoft offers a Business Associate Agreement for M365 commercial plans, and many M365 services are covered under it. Clinics must actively execute the BAA and then configure a set of security and compliance features before PHI workflows can safely run in M365. A signed BAA with unconfigured defaults is not a compliant environment.

## How to execute the Microsoft 365 BAA

Microsoft provides the BAA through the Microsoft Products and Services Agreement (MPSA). For most small clinic customers, the process runs through the Microsoft 365 admin center:

1. Sign in to the Microsoft 365 admin center (admin.microsoft.com).
2. Navigate to **Settings > Org settings > Security & privacy**.
3. Locate the Business Associate Agreement section and review and accept the terms.
4. Retain documentation of when the BAA was accepted.

Some larger organizations or those purchasing through Microsoft volume licensing channels may execute the BAA through a direct MPSA agreement. Confirm the process with your Microsoft account representative or reseller if you are not on a standard commercial plan.

The BAA must be executed before any PHI enters M365 workflows. It is not retroactive.

## What must be configured after the BAA

Executing the BAA changes Microsoft's contractual obligations. It does not configure your M365 environment for HIPAA compliance. After the BAA is in place, clinics must address each of these:

**Audit logging:**
Enable audit logging in the Microsoft Purview compliance portal. Audit logs record user activity across M365 services and are required for HIPAA Security Rule compliance. Audit logs must be retained for a minimum period (HHS guidance suggests six years for HIPAA records generally; confirm with your compliance program's retention policy).

**Multi-factor authentication (MFA):**
MFA must be required for all accounts that access PHI-bearing systems. Enable MFA through Microsoft Entra (formerly Azure AD). Conditional access policies can enforce MFA requirements.

**Data Loss Prevention (DLP) policies:**
Configure DLP policies in Microsoft Purview to detect and block sharing of PHI-type content — Social Security numbers, medical record numbers, and other sensitive data patterns. M365 includes built-in sensitive information types that cover many HIPAA-relevant data categories.

**Retention policies:**
Implement retention policies appropriate for healthcare records. PHI must be retained for required periods and then securely deleted — not simply abandoned in archived mailboxes or old SharePoint sites.

**External sharing restrictions:**
Review and restrict external sharing in SharePoint and OneDrive. By default, some M365 configurations allow files to be shared publicly via link. PHI must not be accessible via open sharing links or to unauthenticated users.

**Email encryption:**
Enable Office Message Encryption (OME) or equivalent for emails containing PHI sent outside the organization. Plain email is not an appropriate channel for PHI without encryption controls.

## Which M365 services are covered under the BAA

Under a properly executed BAA, these M365 services can be used for PHI workflows when configured appropriately:

- Exchange Online (email)
- Microsoft Teams (messaging, meetings)
- SharePoint Online (document storage)
- OneDrive for Business (file sync and storage)
- Microsoft Purview (compliance tools, including DLP and audit)

Services that fall outside M365's core productivity suite — particularly third-party apps added through the Teams app store or external integrations — are not automatically covered by the M365 BAA. Each additional tool requires its own evaluation.

## What the BAA does not do

Clinics that execute the M365 BAA and then treat their compliance obligation as fulfilled are exposed. The BAA covers Microsoft's obligations. The clinic's obligations under the HIPAA Security Rule, Privacy Rule, and Breach Notification Rule remain entirely the clinic's responsibility:

- Conducting and documenting a risk assessment
- Creating and maintaining written HIPAA policies
- Training workforce members and documenting that training
- Implementing physical safeguards (workstation security, device policies)
- Maintaining an incident response and breach notification plan

None of these are addressed by the M365 BAA. Many clinics use M365 as their primary productivity environment and assume that the vendor relationship covers their compliance program. It does not.

## Compliance operations alongside M365

Managing the M365 compliance configuration — keeping DLP policies current, reviewing audit logs, enforcing MFA across new accounts — is ongoing administrative work. That technical configuration layer is separate from the operational compliance program work: risk assessments, training documentation, incident tracking, and policy management.
