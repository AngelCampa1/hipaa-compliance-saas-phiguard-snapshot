---
title: "HIPAA for Practice Managers: Operational Responsibilities"
seoTitle: "HIPAA for Practice Managers"
description: "Practice managers are the operational owners of HIPAA compliance in small clinics. This guide covers BAA registers, training documentation, access management, risk analysis, privacy complaints, and vendor oversight."
metaDescription: "HIPAA for practice managers: BAA registers, annual training, access provisioning, risk analysis coordination, privacy complaints, and NPP currency under 45."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "workforce-training"
schemaType: "article"
intent: "awareness"
summary: "Practice managers oversee the operational execution of HIPAA compliance — maintaining the BAA register, coordinating training documentation, managing access provisioning and offboarding, updating the NPP, coordinating risk analysis, and handling patient privacy complaints — under 45 CFR §§ 164.308 and 164.530."
keyTakeaways:
  - "The BAA register is the practice manager's core HIPAA document — every vendor that touches PHI must have a signed BAA on file before service begins."
  - "Annual training documentation must be centralized and complete; incomplete records are a standalone OCR finding even without a breach."
  - "Access provisioning and offboarding are the practice manager's highest-risk operational task — terminated employees must lose PHI system access the same day."
  - "Practice managers who also serve as Privacy Officers carry the additional responsibility of responding to patient privacy complaints within 60 days."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-new-hire-checklist"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/workforce-training"
sources:
  - title: "45 CFR § 164.308 — Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.308"
    publisher: "eCFR"
  - title: "45 CFR § 164.530 — Administrative Requirements (Privacy Rule)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.530"
    publisher: "eCFR"
  - title: "OCR — How to File a Health Information Privacy Complaint"
    url: "https://www.hhs.gov/hipaa/filing-a-complaint/index.html"
    publisher: "HHS"
faq:
  - q: "Does every vendor a clinic uses need a BAA?"
    a: "Not every vendor — only those that create, receive, maintain, or transmit PHI on the clinic's behalf. Under 45 CFR § 164.308(b)(1), covered entities must enter into BAAs with business associates. Vendors that provide purely administrative services with no PHI access (cleaning services, office supply companies) do not need BAAs. Vendors that access PHI — billing services, EHR platforms, cloud storage providers, transcription services — do."
  - q: "How long must training documentation be retained?"
    a: "Under 45 CFR § 164.530(j), documentation must be retained for six years from the date of creation or the date it was last in effect, whichever is later. For training records, this means keeping completion logs for six years even after an employee departs, and keeping policy documents for six years after they are superseded."
  - q: "What happens if an employee is terminated and IT is not notified the same day?"
    a: "An employee whose access is not revoked on termination day retains the ability to access PHI-bearing systems. If that access is used, it constitutes an unauthorized disclosure under 45 CFR § 164.502. OCR has cited delayed access revocation in enforcement actions as a failure of administrative safeguards under 45 CFR § 164.308(a)(3). The practice manager's offboarding protocol should include same-day access revocation as a mandatory step."
  - q: "Can a practice manager handle privacy complaints without a separate Privacy Officer?"
    a: "Yes. In small clinics, the practice manager frequently serves as the Privacy Officer. Under 45 CFR § 164.530(a), a covered entity must designate a Privacy Officer responsible for developing and implementing privacy policies. That role can be held by the practice manager, but the responsibilities are formal — including responding to patient complaints within 60 days, maintaining a complaint log, and coordinating with OCR if an investigation is opened."
---

You carry HIPAA compliance responsibilities that are operational in nature, broad in scope, and often not explicitly documented in your job description. The Privacy Rule and Security Rule assign specific functions to covered entities — and in a clinic without a dedicated compliance department, those functions land on you.

**Scenario:** A former billing coordinator was terminated on a Friday afternoon. Monday morning, your IT support vendor calls to say the former employee logged into the EHR portal over the weekend using their credentials, which were never revoked. You now have a potential unauthorized access event requiring breach analysis under 45 CFR § 164.402. The termination-day access revocation that did not happen may be cited as an administrative safeguards failure under 45 CFR § 164.308(a)(3) in any investigation that follows. This scenario is avoidable with a written offboarding checklist that includes same-day access revocation as a mandatory step.

## Maintaining the BAA Register

The business associate agreement register is the foundational HIPAA document for your clinic. A BAA is required before any vendor, contractor, or service provider creates, receives, maintains, or transmits PHI on your clinic's behalf — under 45 CFR § 164.308(b)(1).

**What belongs in the BAA register:**
- EHR platform and any add-on modules
- Medical billing service or billing software
- Cloud storage and file sharing platforms used for clinical files
- Transcription services
- IT support providers with access to systems containing PHI
- Lab interface and patient portal vendors
- Scheduling platforms
- Secure messaging or communication tools
- Telehealth platforms
- Shredding and document destruction services

**What the register should capture for each BAA:**

| Field | Example |
|---|---|
| Vendor name | Acme Transcription LLC |
| Service category | Transcription |
| PHI types accessed | Audio recordings, clinical notes |
| BAA execution date | 2025-01-15 |
| BAA expiration / renewal | Evergreen / review annually |
| Signatory on file | Executive role owner |
| Status | Active |

**Common mistakes:** Starting a new vendor service before the BAA is signed — the obligation attaches before the first PHI transmission, not at contract renewal. Failing to update the register when staff start using new tools that access patient data. Keeping BAAs in individual email inboxes rather than a centralized register — OCR investigations request BAAs within days, and a scattered register will not meet that timeline.

## Coordinating Annual Training Documentation

Under 45 CFR § 164.530(b), your clinic must train all workforce members on privacy and security policies at hire and when policies materially change. In practice, this means an annual training cycle for the entire workforce.

Your training-coordination responsibilities:

1. **Schedule the annual training window.** Establish a consistent window each year (for example, the first 30 days of Q1) and communicate it to all staff in advance.

2. **Maintain the training roster.** Every workforce member — clinical staff, administrative staff, part-time employees, contractors with PHI access — must be included. The roster should capture each person's training completion date, method, and attestation.

3. **Track completions and follow up.** Incomplete training is a compliance gap. When an employee does not complete training within the window, follow up and document both the gap and the remediation.

4. **Document mid-year policy changes.** When your clinic updates a privacy or security policy, coordinate a targeted training notice, distribute it to affected staff, collect attestations, and file the documentation separately from the annual cycle records.

5. **Retain records for six years.** Under 45 CFR § 164.530(j), all training documentation must be retained for six years.

Incomplete training records are a standalone OCR finding. You do not need a breach to be cited for failing to document training — the absence of records is sufficient.

For a detailed breakdown of what OCR expects in training records, see [annual HIPAA training requirements](/learn/workforce-training/annual-hipaa-training-requirements).

## Managing Access Provisioning and Offboarding

Access management is the highest-risk operational task in small clinics. Under 45 CFR § 164.308(a)(3), your clinic must implement workforce clearance procedures — determining what access each role requires and ensuring it is appropriate to job function.

**At hire:** Determine what systems the new employee needs based on their role. Do not provide blanket EHR access — a front desk receptionist does not need the same access as a clinical provider. Document the access level assigned and the basis for it. Complete HIPAA training before granting access to PHI-bearing systems.

For role-based access guidance, see [access by role: front desk vs clinical](/learn/workforce-training/access-by-role-front-desk-vs-clinical).

**At role change:** When an employee changes roles, review and update their access within the same pay period. Remove access that no longer applies to the new role. Document the change and the basis for the new access profile.

**At termination:** Revoke access to all PHI-bearing systems on the day of termination — not the next business day. This includes EHR, billing platform, email, cloud storage, shared drives, and any other system containing patient data. Collect clinic-issued devices and change any shared passwords the employee knew. Document the offboarding steps with timestamps.

Delayed access revocation is a documented enforcement risk. OCR has cited it as a standalone administrative safeguards failure in settlements involving former employees accessing records after separation.

## Ensuring the NPP Is Current

Under 45 CFR § 164.520, the Notice of Privacy Practices must accurately describe your clinic's current privacy practices. Your responsibilities:

- Review the NPP annually to confirm it reflects current policies.
- Update the NPP when your clinic's PHI uses or disclosures change materially.
- Distribute the revised NPP to new patients at first service.
- Post the current NPP at the facility and on the website.
- Document the date of each NPP revision.

A clinic that distributes an outdated NPP describing practices it no longer follows — or that fails to disclose practices it has added — is in violation of § 164.520. This is a common finding in OCR investigations that begin with a patient complaint about an unexpected disclosure.

## Coordinating Risk Analysis Updates

Under 45 CFR § 164.308(a)(1), your clinic must conduct a risk analysis to identify reasonably anticipated threats to the confidentiality, integrity, and availability of ePHI. You typically coordinate this process, even if an external consultant conducts the analysis.

**When risk analysis must be updated:** annually as a standard cycle; when a significant operational change occurs (new EHR, new vendor with PHI access, new practice location, significant technology change); after a security incident or breach; and when OCR guidance or enforcement actions reveal a gap the current analysis did not address.

Your role is not to personally conduct a technical risk assessment — it is to ensure the process is completed, documented, and acted upon. Risk analysis findings that are not addressed become evidence of neglect in an investigation.

## Handling Patient Privacy Complaints

Under 45 CFR § 164.530(d), your clinic must have a process for individuals to make complaints concerning privacy policies, and must designate a contact person for receiving complaints. In small clinics, you frequently serve as that contact.

Your responsibilities: document every complaint (date received, nature of the complaint, who made it, and what was alleged); investigate to determine what happened and whether a policy was violated; respond within 60 days; maintain the complaint log for six years under § 164.530(j); and never retaliate — under § 164.530(g), covered entities cannot intimidate, threaten, or retaliate against individuals who file complaints.

If a complaint indicates a potential breach — unauthorized disclosure of PHI — escalate to breach notification procedures under 45 CFR § 164.404.

## Vendor HIPAA Compliance Oversight

Signing a BAA is a beginning, not an end. Your ongoing vendor compliance responsibilities include:

- **Annual BAA review:** Verify that active BAAs are current and cover all PHI-related services the vendor provides.
- **Verifying vendor security posture:** When renewing contracts or onboarding new vendors, ask for SOC 2 Type II reports, HIPAA attestations, or equivalent documentation.
- **Managing subcontractors:** If a business associate uses a subcontractor that accesses PHI, a BAA must also exist between the BA and subcontractor. Confirm this in vendor onboarding.
- **Offboarding vendors:** When a vendor relationship ends, confirm that all PHI held by the vendor has been returned or destroyed per the BAA terms.

## Devices, Encryption, and Access Cycles

Operational HIPAA requirements that touch physical infrastructure are often overlooked:

- **Device encryption:** All laptops, tablets, and mobile devices used to access PHI must be encrypted. This is a Security Rule requirement under 45 CFR § 164.312(a)(2)(iv). Maintain an inventory of devices and confirm encryption status annually.
- **Workstation use policy:** Under § 164.310(b), your clinic must implement policies on proper workstation use. Screens should lock after a period of inactivity. Workstations should not be left logged in and unattended in accessible areas.
- **Access review cycles:** Beyond provisioning and offboarding, conduct access reviews — checking that current access levels still match current roles — at least annually.

PHIGuard gives practice managers a centralized compliance platform to manage BAA registers, track training completion, log access reviews, and document privacy complaints — at current pricing with BAA details available during plan review. Learn more at [PHIGuard HIPAA](/hipaa).
