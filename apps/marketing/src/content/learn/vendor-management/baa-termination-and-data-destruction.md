---
title: "Ending a Vendor Relationship: BAA Termination and PHI Destruction"
seoTitle: "BAA Termination and PHI Destruction"
description: "When a BAA ends, the covered entity must ensure PHI is returned or destroyed. This guide covers what the BAA must say, how to request destruction, what documentation to get, and what to do when a vendor cannot comply."
metaDescription: "Switching vendors without confirming PHI destruction is a common HIPAA gap. Learn what 45 CFR §164.504(e)(2) requires and how to run a clean vendor offboarding."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: vendor-management
intent: awareness
schemaType: article
summary: "HIPAA vendor offboarding requires more than canceling a subscription. The covered entity must obtain written confirmation that PHI has been returned or destroyed. This article explains the legal requirements, practical steps, and what to do when a departing vendor cannot or will not confirm destruction."
keyTakeaways:
  - "45 CFR §164.504(e)(2)(ii)(I) requires PHI to be returned or destroyed when a BAA terminates."
  - "Written certification of destruction is the minimum acceptable documentation — verbal confirmation is not enough."
  - "Start the offboarding process before the contract ends, not after. Data held post-termination is an ongoing compliance risk."
  - "The 'feasibility exception' allows retention when destruction is not feasible, but the BA must confirm this in writing and extend BAA protections indefinitely."
  - "Subcontractors of the departing vendor hold PHI too — your offboarding must account for them."
sources:
  - title: "45 CFR §164.504 — Uses and Disclosures: Organizational Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "What does 'return or destroy' mean in practice for cloud-hosted PHI?"
    a: "For cloud-hosted data, destruction means cryptographic erasure (key destruction) or secure overwrite of all storage media holding the data, including backups. The vendor should provide written confirmation that these steps were taken. Simply deleting records from a user interface is not sufficient."
  - q: "What if the old vendor says they are legally required to retain the data?"
    a: "Some vendors — particularly billing services — have data retention obligations under state law or payer contracts. In those cases, the feasibility exception at 45 CFR §164.504(e)(2)(ii)(I) applies: the BA must inform you in writing, specify what PHI it is retaining, and agree to extend BAA protections to that retained data indefinitely."
  - q: "Can we terminate a BAA immediately if a vendor has a breach?"
    a: "Yes. 45 CFR §164.504(e)(2)(iii) permits the covered entity to terminate the BAA if it learns that the BA has violated a material term. Termination for cause should be documented carefully, particularly if litigation is a possibility."
  - q: "Does the offboarding obligation extend to the vendor's subcontractors?"
    a: "Yes. If the departing vendor used subcontractors who held PHI, your BAA should have required the vendor to ensure those subcontractors also return or destroy PHI upon termination. You should request written confirmation that the vendor has completed that flow-down obligation."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

Switching a billing service, retiring an old EHR, or ending a contract with a transcription vendor all trigger the same HIPAA obligation: the clinic must ensure that PHI held by the departing vendor is either returned or destroyed.

Most clinics cancel the subscription and move on. That is a compliance gap.

The requirement sits at 45 CFR §164.504(e)(2)(ii)(I): upon termination of a business associate agreement, the business associate must return or destroy all PHI received from or created on behalf of the covered entity, if feasible. If return or destruction is not feasible, the BA must extend the protections of the agreement to the PHI it retains and limit further use or disclosure to those purposes that make return or destruction infeasible.

This article covers what that obligation means in practice, how to run a vendor offboarding that satisfies it, and what to do when a vendor cannot or will not comply.

## What the BAA must say about termination and PHI

Before a vendor offboarding situation arises, the BAA itself should contain specific language addressing termination. A well-drafted BAA will specify:

- That upon termination, the BA will return or destroy all PHI within a defined period (commonly 30 to 60 days after the termination date)
- The method by which destruction will be certified (written confirmation, deletion certificate, or equivalent documentation)
- What happens to PHI held by the BA's subcontractors upon termination
- The feasibility exception language — what the BA will do and document if full destruction is not possible

If your existing BAA with a vendor contains vague termination language — or no termination-and-destruction clause at all — that gap needs to be addressed at renewal time, not when you are already in the middle of switching vendors.

## When to start the offboarding process

Start before the contract ends, not after.

Once a contract terminates, the covered entity's leverage over the departing vendor drops substantially. Pending destruction requests become customer service tickets rather than contractual obligations. Vendors that are about to lose a customer have less operational incentive to prioritize your data destruction request.

The right sequence:

1. Give written notice of termination according to the contract's notice requirements.
2. Within the same communication, or immediately after, send a formal written request for return or destruction of all PHI.
3. Specify a deadline. Use the timeline in the BAA; if the BAA is silent, 30 days is reasonable.
4. Request written confirmation of completion before you consider the obligation resolved.

Do not assume that deleting your account or canceling billing ends your exposure. The PHI may remain on the vendor's servers until their own data retention schedule runs — which could be months or years.

## How to request return or destruction

Send the request in writing to a named contact — not a support ticket queue. Email to the vendor's account executive plus their privacy officer (if you have a contact) creates a documented record. Include:

- A reference to the BAA and its termination date
- A statement of the PHI categories held by the vendor (patient records, claims data, appointment information — whatever applies to this vendor's services)
- The specific request: return all PHI to the covered entity, or confirm secure destruction
- Your preferred method for delivery of the destruction certificate
- A response deadline

Keep copies of all correspondence. If litigation ever arises from a post-termination breach, this documentation is your evidence that the covered entity met its obligations.

## What documentation to require

Verbal confirmation is not sufficient. Get it in writing.

A destruction certificate should state:

- The date destruction was completed
- The method used (secure overwrite, cryptographic erasure, physical destruction of media)
- The categories of PHI destroyed
- The name and title of the individual certifying destruction on behalf of the vendor
- A statement that destruction applies to all copies, including backups

Some vendors have standard forms for this; others will need to produce a letter on company letterhead. Either is acceptable as long as it contains the elements above and is signed by someone with authority.

Retain the destruction certificate indefinitely. HHS investigation of a covered entity can occur years after an event, and the destruction certificate is evidence of good-faith compliance.

## The feasibility exception

45 CFR §164.504(e)(2)(ii)(I) recognizes that full destruction is not always feasible. Common situations where this applies:

- Billing vendors who are required to retain claim records under state law or payer agreements
- EHR vendors whose data retention architecture makes selective destruction technically complex
- Vendors who have already archived data to immutable storage as part of their own compliance obligations

If a vendor invokes the feasibility exception, they must:

1. Tell you in writing what PHI they are retaining and why destruction is not feasible
2. Agree in writing to extend BAA protections to the retained data indefinitely
3. Agree that they will use the retained PHI only for the purposes that make destruction infeasible — not for their own analytics, product development, or any other purpose

A vendor that simply says "we can't delete that" without providing the written feasibility explanation and the extended-protection commitment has not satisfied the requirement. Push back.

## Handling subcontractors of the departing vendor

When a vendor processes PHI, it typically uses subcontractors — cloud infrastructure providers, data backup services, transcription sub-vendors. Each of those subcontractors is itself a business associate under HIPAA. Your BAA with the departing vendor should have required them to impose equivalent obligations on their subcontractors, including the obligation to return or destroy PHI upon termination.

Ask the departing vendor directly:

- Which subcontractors hold PHI on your behalf?
- Have you notified them of the termination and requested return or destruction?
- Will you provide written confirmation that their destruction obligations have been completed?

If the vendor cannot answer these questions, you have a visibility problem that predates the offboarding. Document your inquiry and the vendor's response.

## Vendor offboarding checklist

Use this sequence when ending any BAA-covered vendor relationship:

- [ ] Review the BAA termination clause before issuing notice — understand your contractual timelines
- [ ] Send written termination notice per the contract's notice requirements
- [ ] Simultaneously send a written PHI return/destruction request with a specific deadline
- [ ] Request the vendor identify all subcontractors holding PHI and confirm their obligations
- [ ] Confirm data migration or export is complete before destruction begins (you need the data before it is gone)
- [ ] Receive written destruction certificate specifying method, date, and scope
- [ ] If feasibility exception is invoked, obtain written explanation and extended-protection commitment
- [ ] Retain all correspondence and the destruction certificate in your compliance files
- [ ] Verify access to the vendor's system has been revoked for all clinic staff
- [ ] Update your vendor inventory to mark the relationship as terminated with documentation on file

## The cost of skipping this step

Clinics that switch vendors without completing the offboarding often discover the gap only when something goes wrong — a breach at the old vendor months after termination, a patient complaint about data held somewhere unexpected, or an HHS audit that surfaces the absence of destruction documentation.

At that point, the covered entity faces two problems: the potential breach itself, and the compliance failure of not having confirmed destruction. Both are addressable. Neither is easy. The offboarding process described here is far less work than the alternative.
