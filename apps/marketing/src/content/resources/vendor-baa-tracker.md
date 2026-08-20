---
title: "Healthcare Vendor BAA Tracker"
seoTitle: "Business Associate Agreement Tracker"
headline: "Know exactly which vendors have a signed BAA and which ones don't"
description: "A business associate agreement tracker for clinics that need to inventory vendors, document BAA status, record subcontractor review, and prove every PHI-touching service has been evaluated."
metaDescription: "Free business associate agreement tracker for HIPAA. Track BAA status, vendor risk, subcontractors, reviews, and renewal dates."
magnetSlug: "vendor-baa-tracker"
summary: "A BAA tracker is the operating record that shows which vendors touch PHI, which ones have signed business associate agreements, which relationships fit the conduit exception, and when each vendor needs review again. Clinics use it to answer OCR, payer, and internal audit questions without rebuilding the vendor file from email."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Pre-filled with common healthcare vendor categories: EHR, billing, scheduling, transcription, cloud storage, IT support, and more"
  - "BAA status columns for each vendor: Not Requested / Requested / Signed / Expired, so gaps are visible at a glance"
  - "Annual review reminder column with a target date field to keep agreements current"
  - "Risk tier column to classify each vendor as High, Moderate, or Low based on the volume and sensitivity of PHI they access"
  - "Contract date and expiration fields so you can track when agreements need renewal or renegotiation"
faq:
  - q: "What is a BAA tracker?"
    a: "A BAA tracker is a vendor inventory that records whether each PHI-touching vendor is a Business Associate, whether a written agreement has been signed, who reviewed it, and when the relationship needs to be reviewed again."
  - q: "Who should be included in a business associate agreement tracker?"
    a: "Include every vendor that creates, receives, maintains, or transmits PHI for the clinic, plus vendors that were reviewed and found not to touch PHI. Keeping both decisions in the same tracker makes the inventory auditable."
  - q: "How often should a clinic review BAAs?"
    a: "Review active Business Associate Agreements at least annually and whenever a vendor changes its service, adds subcontractors, is acquired, reports an incident, changes data location, or terminates the relationship."
  - q: "Does every healthcare vendor need a BAA?"
    a: "No. A vendor needs a BAA when its service involves PHI on behalf of the covered entity. Vendors that never touch PHI, members of the clinic workforce, and narrow conduit services may not require one, but the reasoning should be documented."
  - q: "Can the conduit exception apply to cloud storage?"
    a: "Usually no. HHS treats the conduit exception as narrow and tied to transient transmission. A vendor that stores PHI, even if it says it does not routinely inspect the content, generally needs a BAA."
publishedAt: "2026-04-18"
updatedAt: "2026-05-21"
sources:
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "Sample Business Associate Agreement Provisions"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/product"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
---

## Why the BAA Inventory Matters

The Business Associate rules at 45 CFR §§164.502(e) and 164.504(e) require a covered entity to obtain satisfactory assurances - in the form of a written Business Associate Agreement - from every person or organization that creates, receives, maintains, or transmits PHI on the covered entity's behalf. The requirement is not conditional on the vendor's size, sophistication, or marketing claims. If they touch your PHI to perform a service for your clinic, they are a Business Associate, and you need a signed BAA before they touch it.

Missing, unsigned, or expired BAAs are a recurring issue in OCR vendor investigations. The pattern is recognizable. A covered entity experiences a breach at a vendor. OCR asks for the executed BAA for that vendor. The clinic cannot produce one, or produces one that is unsigned, or produces a draft that was never countersigned. Liability for the breach then falls back on the covered entity in addition to the Business Associate.

A BAA inventory shows whether the clinic has an executed BAA for each PHI-touching vendor. It lets your practice administrator see which vendors are covered without searching through email and shared drives.

## Who Actually Qualifies as a Business Associate

A Business Associate is a person or entity, other than a member of your workforce, that performs functions or activities on behalf of, or provides services to, a covered entity that involve the use or disclosure of PHI. The statutory examples include claims processing, data analysis, utilization review, quality assurance, billing, practice management, legal, actuarial, accounting, consulting, data aggregation, management, administrative, accreditation, and financial services - when those services involve PHI.

The key test is not the vendor's industry label but whether the relationship requires access to PHI. A marketing agency that writes your website copy and never sees a patient record is not a BA. The same agency running a patient outreach email campaign against your patient list is a BA. The service determines the status, not the vendor.

## The Conduit Exception

§164.504(e)(1)(ii) and HHS commentary carve out a narrow exception for entities that act as mere conduits of PHI - transmitting it without routinely accessing its content. The classic examples are the United States Postal Service, commercial couriers like UPS and FedEx, and internet service providers that move packets without inspecting them.

The conduit exception is narrower than most vendors claim. HHS has been explicit that the exception applies to transmission services, not storage services. A cloud storage provider that holds PHI at rest is not a conduit, even if the provider asserts that it never "accesses" the data. If the vendor has persistent access to the data - whether they actually look at it or not - they are a Business Associate.

Practical rule: if the vendor stores PHI, processes PHI, or could access PHI as part of its normal operations, it is a Business Associate and you need a BAA. If the vendor only moves data from point A to point B without retention or inspection, the conduit exception may apply. When in doubt, treat the vendor as a BA and execute an agreement. The downside of an unnecessary BAA is paperwork. The downside of a missing BAA is a breach finding.

## Vendor Categorization Guide

The tracker categorizes every vendor into one of three buckets. Categorization determines whether the clinic needs a BAA, subcontractor review, or documented no-PHI rationale.

### Business Associate

The vendor creates, receives, maintains, or transmits PHI in performing a service for your clinic. A signed BAA is required before access begins.

Common examples in a small clinic:

- EHR and practice management vendors
- Third-party billing and revenue cycle services
- Transcription and medical scribe services
- Cloud storage used to hold PHI (clinical documents, backup images, scanned records)
- Cloud backup providers holding encrypted PHI
- Telehealth platforms
- Patient engagement and secure messaging platforms
- Faxing services that store fax images in vendor infrastructure
- Appointment reminder services that use name plus appointment details
- Collections agencies that receive patient demographics and balance information
- External IT managed service providers with access to systems containing PHI
- Shredding and document destruction vendors that take custody of PHI
- Legal counsel and accounting firms reviewing PHI for your matter
- Release of information services

### Subcontractor of a Business Associate

A subcontractor is a vendor that a Business Associate uses to perform services that involve PHI. The subcontractor is also a Business Associate under the HITECH amendments, and the BAA chain must run from the covered entity to the direct BA, and from the direct BA to the subcontractor.

You do not sign the subcontractor BAA directly - your BA does - but you should know it exists. Example: your EHR vendor runs on a public cloud. The cloud infrastructure provider is the EHR vendor's subcontractor and must be under a BAA with the EHR vendor. Your due diligence questionnaire should ask every direct BA to name subcontractors who handle your PHI and confirm BAAs are in place with them.

### Conduit Exception

The vendor transmits PHI without retention or routine access. A BAA is not required. Document the basis for exemption in the tracker so the decision is auditable.

Examples:

- The United States Postal Service delivering paper mail
- Commercial couriers (UPS, FedEx, DHL) carrying sealed packages
- Internet service providers that carry encrypted traffic without access to plaintext
- Pure telecommunications carriers for voice calls

If the courier opens the package, if the ISP inspects the payload, if the email provider stores the messages in its infrastructure - the conduit exception is not available and a BAA is required.

## The Tracker Template

The tracker is a single source of truth for vendor coverage. Every row is one vendor. Every column is a question OCR or a payer auditor might ask.

**Columns:**

| Vendor Name | Service Category | PHI Touched? | Category (BA / Subcontractor / Conduit) | BAA Status | BAA Signed Date | Effective Date | Termination Clause | Subcontractors Documented | Last Reviewed | Next Review Due |
|---|---|---|---|---|---|---|---|---|---|---|

**Column notes:**

- **Service Category.** Use the vendor category list in the prior section (EHR, billing, transcription, cloud storage, etc.). Consistency across rows makes summary reporting useful.
- **PHI Touched?** Yes or No. If No, the remaining BAA columns should be N/A. Keep the row anyway - the record that you evaluated the vendor and concluded PHI is not involved is itself evidence.
- **BAA Status.** One of: Not Required (conduit, or PHI not touched), Requested, In Negotiation, Signed, Expired. Avoid freeform text.
- **Termination Clause.** Yes / No / Unknown. The BAA should include a termination clause consistent with §164.504(e)(2)(iii) - return or destruction of PHI, or continued protection if return/destruction is infeasible.
- **Subcontractors Documented.** Yes / No / N/A. You asked the BA to identify subcontractors; the response is on file.
- **Next Review Due.** Default to annual. Set earlier if there is a known change (vendor acquisition, material service change, reported security incident).

## Sample Filled Row

A concrete example of a completed row showing how the columns should be completed:

| Vendor Name | Service Category | PHI Touched? | Category | BAA Status | BAA Signed Date | Effective Date | Termination Clause | Subcontractors Documented | Last Reviewed | Next Review Due |
|---|---|---|---|---|---|---|---|---|---|---|
| Acme Billing Services | Revenue cycle and claim processing | Y | BA | Signed | 2024-03-12 | 2024-04-01 | Y | Y - cloud infrastructure | 2025-03-15 | 2026-03-15 |

## Due Diligence Questionnaire for New Vendors

Before a new Business Associate starts, run the vendor through a short questionnaire. The questionnaire is an artifact; the answers, on letterhead or signed PDF, go into the vendor file alongside the BAA.

**Questions:**

1. Will your service create, receive, maintain, or transmit PHI on behalf of [Clinic Name]? Describe the PHI involved and the purpose.
2. List the safeguards you have implemented consistent with the Security Rule (administrative, physical, technical). If you hold SOC 2 Type II, HITRUST, or equivalent certification, provide the latest report.
3. Do you use any subcontractors who will access PHI in performing this service? Name each and confirm a BAA is in place between you and the subcontractor.
4. Is PHI encrypted at rest? Describe the method (for example, AES-256).
5. Is PHI encrypted in transit? Describe the protocol (for example, TLS 1.2 or higher).
6. In the event of a security incident involving our PHI, within how many days of discovery will you notify us? (Per §164.410, BAs must notify the covered entity without unreasonable delay and in no case later than 60 days.)
7. In what country or countries is our PHI stored and processed?
8. On termination of our agreement, will you return or destroy all PHI? If destruction is infeasible for any portion, describe the portion and the protections you will continue to apply.
9. How often do you conduct a risk analysis, and when was the most recent one completed?
10. Provide a point of contact for privacy and security matters and for breach notification.

A vendor who refuses to answer these questions is telling you they are not ready to be a Business Associate.

## Renewal and Review Cadence

A BAA needs scheduled review. Review cadence:

- **Annual review.** Every row in the tracker reviewed once per calendar year. Confirm the vendor is still active, the service scope is unchanged, and the BAA is still in force.
- **Trigger-based review.** Out of cycle, review the BAA when any of the following occurs: the vendor is acquired or changes legal entity; the vendor materially changes its service or adds new subcontractors; the vendor reports a security incident; the vendor changes its data residency; the vendor's certification lapses.
- **Termination review.** When your clinic ends a vendor relationship, the tracker row moves to a Terminated section with a date. Confirm return or destruction of PHI per the termination clause and document the confirmation.

## Red Flags

Certain patterns in vendor responses should pause onboarding until the issue is resolved. Each of the following is a reason to refuse PHI access until resolved:

- **Vendor refuses to sign a BAA.** The conversation ends there. A vendor unwilling to sign a BAA is not eligible for PHI access.
- **Vendor offers a "click-through" BAA that cannot be modified.** Read it carefully. Some are acceptable; others exclude liability in ways inconsistent with HIPAA. Legal review before accepting.
- **Vendor asserts the conduit exception for a storage or processing service.** Incorrect. Push back with a copy of the HHS commentary and require a BAA.
- **Vendor cannot describe breach notification timing.** A BA that does not know the 60-day rule will not meet it.
- **Vendor lists no subcontractors but the service obviously runs on a public cloud.** The vendor either does not understand its own infrastructure or is hiding subcontractors. Either is a risk.
- **Vendor data residency is undisclosed or offshore without contractual controls.** Offshore processing of PHI is not per se prohibited, but it requires explicit contractual protections and documented risk acceptance. Surprise offshore processing is a finding.
- **Vendor holds no independent security certification and declines to describe its safeguards.** A vendor that handles PHI should be able to describe its program.

## Getting From Nothing to a Complete Inventory

If you are starting with no existing tracker, the fastest path to a defensible inventory is a three-pass sweep. Plan for four to eight hours of administrator time for a small clinic.

**Pass one - financial records.** Export the last 24 months of accounts payable. Every recurring vendor and every meaningful one-time engagement touches your clinic's operations in some form. For each payee, ask a single question: does this service involve our PHI? Most answers are no (utilities, rent, landscaping). The yes answers become the first rows of your tracker.

**Pass two - system inventory.** Walk through every device and system on the premises. Every piece of software on every workstation. Every cloud account the practice pays for, whether through finance or through an individual staff member's corporate card. Every username-and-password saved in a staff member's browser. A surprising share of small-clinic BA gaps are discovered in pass two: the appointment-reminder service a provider signed up for four years ago, the file-sharing link a biller uses with a payer, the scheduling app the front desk adopted without asking.

**Pass three - the workforce interview.** Sit with each staff member for fifteen minutes. "Walk me through what you do in a typical day and name every tool you use." Pass three catches what passes one and two miss - vendors that are free and therefore not in A/P, vendors installed without an administrative login, vendors adopted as personal productivity tools that slowly absorbed clinical workflows.

The combined output from all three passes becomes the tracker baseline. Expect duplicates and conflicts in the first draft. Resolve them, then sign and date the baseline document.

## Two Categories Small Clinics Routinely Miss

Two vendor categories consistently surface in breach investigations because practices did not realize a BAA was required:

**Answering services.** After-hours answering services that take messages from patients - name, date of birth, reason for call, callback number - are Business Associates. The fact that they hand off messages quickly does not remove them from the definition. A signed BAA is required.

**IT vendors supporting unrelated systems.** The managed service provider configuring your Wi-Fi, the phone system vendor updating firmware, the printer service technician replacing a hard drive that may contain cached print jobs - each may have incidental access to systems holding PHI. Evaluate whether they have technical access or physical access to PHI-bearing equipment. If so, execute a BAA. If they do not have access, document the basis for that conclusion.

## What PHIGuard Changes

PHIGuard keeps vendor records, signed BAAs, questionnaires, certifications, expiration dates, and review tasks in one place. New vendors enter through an onboarding task with the due diligence questionnaire attached. BAA status, expiration, and next-review dates drive calendar reminders to the Security Officer. Every document - signed BAA, questionnaire, certification report, termination confirmation - attaches to the vendor record with a timestamp.

That gives the clinic one dated record for ownership, evidence, and follow-up.

