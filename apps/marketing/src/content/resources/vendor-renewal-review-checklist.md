---
title: "Vendor BAA Renewal Review Checklist"
headline: "A structured review checklist to run before renewing any business associate agreement — so you don't just sign a BAA, you re-assess the relationship"
description: "A HIPAA vendor BAA renewal review checklist for small medical clinics covering BAA expiry, subprocessor changes, AI feature updates, security posture, incident history, and the decision to renew, revise, or terminate."
metaDescription: "Free HIPAA vendor BAA renewal checklist for small clinics. Covers subprocessor changes, AI feature coverage, security posture, incident history, and renewal."
magnetSlug: "vendor-renewal-review-checklist"
summary: "A structured intake checklist for BAA renewals that goes beyond signature collection — reviewing whether the vendor's security posture, subprocessor relationships, and AI features have changed in ways that affect your compliance program. Includes a renewal decision matrix (renew / renew with revised terms / terminate) and a one-page vendor assessment summary."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Vendor renewal intake checklist: BAA expiry, subprocessor changes, AI-use updates, security posture, and incident history"
  - "AI feature assessment section — what to ask when a vendor has added AI capabilities since the original BAA was signed"
  - "Renewal decision matrix: renew as-is, renew with revised terms, or terminate the relationship"
  - "One-page vendor assessment summary for filing in your compliance record"
  - "90-day advance timeline guide — when to start each step of the renewal process"
faq:
  - q: "Who should own the vendor baa renewal review checklist?"
    a: "The privacy officer, security officer, or practice administrator should own the vendor baa renewal review checklist, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "45 CFR § 164.308(b) — Business Associate Contracts and Other Arrangements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
  - title: "HHS Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/vendor-management/track-baa-renewals"
verificationDate: "2026-04-26"
---

## Why BAA Renewal Is Not the Same As BAA Signing

When a covered entity first signs a BAA with a vendor, the BAA reflects the vendor's security posture and product capabilities at that point in time. By the time the BAA comes up for renewal, usually 1-3 years later, the vendor may have:

- Added AI features that process the content of your PHI (common with EHR add-ons, support platforms, and productivity tools)
- Changed their subprocessor list, routing your data through new third parties you haven't assessed
- Had a breach or security incident they were required to notify you of (or should have)
- Changed their data hosting configuration in ways that affect your compliance requirements
- Updated their BAA terms in ways that shift liability or limit their obligations

BAA renewal that consists only of signing the updated agreement, without reviewing these changes, is a missed assessment opportunity. This checklist structures the renewal conversation as a deliberate re-assessment rather than an administrative signature.

## The 90-Day Renewal Timeline

Start the renewal process 90 days before BAA expiration — not at expiration.

**90 days out:**
- Pull the current BAA from your vendor inventory
- Identify the BAA expiration date
- Initiate the vendor review using this checklist
- Request updated BAA terms from the vendor if the agreement is set to automatically renew with updated terms

**60 days out:**
- Complete the checklist review
- Request responses to open questions from the vendor
- If the vendor has changed terms materially, initiate legal review

**30 days out:**
- Finalize the renewal decision (renew / renew with revisions / terminate)
- If terminating, identify a replacement vendor and initiate BAA with the replacement
- If renewing with revisions, complete BAA negotiation

**At expiration:**
- Execute the renewed BAA
- Update your vendor inventory with the new execution date and next renewal date
- File the renewed BAA in your compliance records

## Section 1: Vendor Identification and Current BAA Status

| Field | Information |
|---|---|
| Vendor name | |
| Primary contact name and email | |
| What services does this vendor provide | |
| What PHI does this vendor access or process | |
| Current BAA execution date | |
| Current BAA expiration date | |
| Is this a manual renewal or auto-renewal | |
| If auto-renewal: what are the updated terms Have you reviewed them | |

## Section 2: Has Anything Material Changed Since the Original BAA?

Work through each category. For any "Yes" answer, document the specific change and assess its compliance impact.

### Product and Feature Changes

- [ ] Has the vendor added new features or products since the last BAA execution?
- [ ] If yes, do any new features process PHI in ways not covered by the current BAA (Examples: AI assistants, analytics modules, integrations with new third-party services)
- [ ] Are all current features used by your clinic explicitly covered under the BAA terms?

Notes: ____

### AI Feature Assessment

AI features in SaaS products change faster than BAA renewal cycles. If the vendor has added AI since the last BAA:

- [ ] What AI features does the vendor now offer that interact with your data?
- [ ] Are these AI features explicitly covered by the vendor's HIPAA BAA (Ask the vendor directly — do not assume coverage)
- [ ] Does the vendor use customer data (including your PHI) to train or improve AI models Is there an opt-out?
- [ ] Where is AI-processed data stored and for how long?
- [ ] Does the vendor subcontract AI processing to a third-party AI provider (e.g., OpenAI, Anthropic, Google) Is that subprocessor covered by a BAA?

Notes: ____

### Subprocessor Changes

- [ ] Has the vendor changed their subprocessors since the original BAA (Subprocessors are the vendors your vendor uses to deliver their service — cloud hosting, AI services, email delivery, analytics)
- [ ] Request the vendor's current subprocessor list if they have not provided it
- [ ] Are new subprocessors covered by BAAs between the vendor and the subprocessor?
- [ ] Has any significant change occurred in the vendor's cloud hosting or data center (e.g., moved from one cloud provider to another)?

Notes: ____

### Security Posture

- [ ] Has the vendor experienced any security incidents, breaches, or unauthorized disclosures involving your data since the original BAA?
- [ ] Were any notifications from the vendor received Were they responded to?
- [ ] Has the vendor undergone a security certification or audit since the original BAA (SOC 2 Type II, HITRUST, ISO 27001, or similar)
- [ ] If a new certification is available, does it cover the services used by your clinic?
- [ ] Are there any known or publicized security vulnerabilities with this vendor's products?

Notes: ____

### Business Changes

- [ ] Has the vendor been acquired or merged with another company since the original BAA?
- [ ] If yes, does the new parent entity honor the existing BAA, or does a new BAA need to be executed with the acquiring entity?
- [ ] Has the vendor changed their legal entity, business name, or ownership structure in a way that may affect the BAA?

Notes: ____

## Section 3: Operational Review

Beyond compliance formalities, assess whether the vendor relationship is working operationally.

- [ ] Have there been any service disruptions or data access issues affecting your clinic in the past contract period?
- [ ] Have there been any support or response-time issues that affected your operations?
- [ ] Does the vendor's current pricing model still make sense relative to what you use?
- [ ] Are there new vendors that provide equivalent services with better BAA terms or pricing?

Notes: ____

## Section 4: Renewal Decision Matrix

Based on the checklist review, make one of three decisions:

**[ ] RENEW AS-IS:** The vendor's BAA terms and security posture are unchanged and adequate. AI features are covered (or not used). No material changes found. Execute the renewal.

**[ ] RENEW WITH REVISED TERMS:** Material changes were found (AI features, subprocessors, business changes) that require updated BAA terms before renewal. Document the required revisions and negotiate them before executing.

Specific revisions required:
1. ____
2. ____
3. ____

**[ ] TERMINATE:** The vendor cannot provide adequate BAA coverage, has had a material security failure, is unable to meet your compliance requirements, or is being replaced by a better alternative.

If terminating: vendor replacement plan: ____  
Transition timeline: ____

## Section 5: Vendor Assessment Summary

Complete this section and file it in your vendor compliance record alongside the renewed BAA.

---

**Vendor BAA Renewal Assessment Summary**

Vendor: ____  
Assessment date: ____  
Reviewer: ____  

**Material changes identified:** [ ] Yes (see notes above) [ ] None

**AI feature coverage confirmed:** [ ] Yes [ ] No — addressed in revised terms [ ] N/A (no AI features in use)

**Subprocessor review completed:** [ ] Yes [ ] Not applicable

**Security posture review completed:** [ ] Yes

**Renewal decision:** [ ] Renew as-is [ ] Renew with revised terms [ ] Terminate

**New BAA execution date:** ____  
**Next renewal review date:** ____

**Filed in compliance record by:** ____  **Date:** ____

---

## Building Your Renewal Calendar

For each business associate in your vendor inventory, note the BAA expiration date and set a 90-day advance reminder. A vendor inventory with 10 business associates should have 10 entries on your compliance calendar, one per vendor, staggered by actual renewal dates.

Vendors whose BAAs have no explicit expiration date should be reviewed annually. "Indefinite" BAAs do not self-update when the vendor's product or security practices change.

## What PHIGuard Changes

PHIGuard's vendor management module tracks BAA expiration dates and triggers a review task 90 days before each expiration. The renewal checklist becomes a structured form within the vendor record, not a separate document. Completed assessments attach to the vendor record and create an audit trail of how your clinic evaluated each vendor over time. When a vendor is later found to have had a breach, you can demonstrate that you assessed their security posture at the last renewal and that the information available at that time was adequate.
