---
title: "HIPAA BAA Required Elements: What Must Be in Every Business Associate Agreement"
seoTitle: "HIPAA BAA Required Elements"
description: "A plain-language walkthrough of every required provision under 45 CFR §164.504(e)(2), with guidance on optional clauses, common gaps, and how to evaluate a vendor-generated BAA before signing."
metaDescription: "45 CFR §164.504(e)(2) defines what every HIPAA BAA must include. This guide walks through each required element, common gaps, and what to check before signing."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: vendor-management
intent: awareness
schemaType: article
summary: "Every HIPAA business associate agreement must include eight core provisions defined at 45 CFR §164.504(e)(2). Missing even one can make the agreement unenforceable and expose the covered entity to direct liability. This article explains each required element in plain language and covers what to review before counter-signing a vendor-generated BAA."
keyTakeaways:
  - "45 CFR §164.504(e)(2) defines eight required provisions every HIPAA BAA must contain."
  - "A vendor terms-of-service page does not substitute for a signed BAA — even if it mentions HIPAA."
  - "The flow-down requirement means your BA must impose the same obligations on its subcontractors."
  - "Missing required elements can make a BAA unenforceable and leave the covered entity exposed."
  - "Common optional provisions — indemnification, shorter breach notification windows — should be negotiated before signing."
sources:
  - title: "45 CFR §164.504 — Uses and Disclosures: Organizational Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does a vendor's privacy policy count as a BAA?"
    a: "No. A privacy policy is a unilateral statement about how a vendor handles data. A BAA is a bilateral, signed contract that imposes specific HIPAA obligations on the business associate. Referencing HIPAA in a privacy policy does not create a BAA."
  - q: "What happens if we use a vendor without a BAA in place?"
    a: "Using a business associate without a signed BAA is itself a HIPAA violation by the covered entity. It can result in civil monetary penalties from HHS Office for Civil Rights regardless of whether a breach occurs."
  - q: "Can a vendor refuse to sign a BAA?"
    a: "Yes, and that refusal should be treated as a disqualifying factor if the vendor will handle PHI. The covered entity cannot legally share PHI with a BA that has not agreed to the required contractual obligations."
  - q: "Is there a standard government-issued BAA template?"
    a: "HHS does not publish a mandatory form. It publishes model contract language in guidance. Many healthcare law firms and compliance vendors publish templates based on that guidance, but any BAA must be reviewed against your specific use case."
  - q: "How often should existing BAAs be reviewed?"
    a: "At minimum, review BAAs when a vendor changes its services, when the HIPAA rules change, and at each contract renewal. The 2013 Omnibus Rule imposed new requirements; any BAA signed before 2013 that has not been updated is likely non-compliant."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

Every clinic that shares patient information with an outside vendor must have a signed business associate agreement in place before that sharing occurs. That requirement comes directly from the HIPAA Privacy Rule. But the rule does more than require a signature — it specifies exactly what the agreement must say.

The governing regulation is 45 CFR §164.504(e)(2). The 2013 Omnibus Rule updated those requirements substantially. Any clinic relying on a BAA signed before September 2013 should treat that agreement as potentially deficient until it has been reviewed against the current rule.

This article walks through each required element, explains what it means in practice, and identifies what to look for when a vendor sends you their own BAA to sign.

## What a business associate agreement must contain under 45 CFR §164.504(e)(2)

The Privacy Rule identifies eight required provisions. Every signed BAA must address all of them.

### 1. Permitted uses and disclosures of PHI

The BAA must state specifically what the business associate is permitted to do with the PHI it receives. Generic language such as "the BA may use PHI as necessary to perform services" is insufficient. The agreement should tie permitted uses to the specific service being provided — billing, cloud hosting, transcription, coding — and should list any secondary uses the BA is permitted to make, such as using de-identified data for service improvement.

If a vendor's BAA contains broad, open-ended use language, ask them to narrow it. Overly broad permissions create compliance exposure even when no breach occurs.

### 2. Prohibition on use or disclosure not permitted by the agreement

The BAA must state that the BA will not use or disclose PHI in any way not authorized by the agreement or required by law. This provision is the contractual backstop that makes the permitted-use clause meaningful. Without it, the permitted-use language is advisory rather than binding.

### 3. Required safeguards

The BA must agree to implement appropriate safeguards to prevent unauthorized use or disclosure of PHI. For electronic PHI, the agreement must specifically require the BA to comply with the HIPAA Security Rule (45 CFR Part 164, Subpart C). This means the BA agrees to conduct its own risk analysis, maintain policies, implement technical controls, and train staff — not just accept your policies.

Many vendor-generated BAAs contain vague safeguard language without referencing the Security Rule directly. That gap matters: if the BA later has a breach caused by inadequate technical controls, the absence of a Security Rule commitment in the BAA complicates your enforcement options.

### 4. Incident reporting requirements

The BA must agree to report to the covered entity any use or disclosure of PHI not permitted by the agreement — including security incidents and breaches. Under the Breach Notification Rule (45 CFR §164.410), a BA must notify the covered entity without unreasonable delay and no later than 60 days after discovering a breach.

This is an area where optional provisions matter. The statutory maximum is 60 days, but many covered entities negotiate shorter windows — 10 to 30 days — in the BAA itself. The 60-day clock runs to the covered entity's notification of HHS and affected individuals, so a BA that waits 58 days to report leaves the clinic almost no time to meet its own obligations.

### 5. Subcontractor obligations (the flow-down requirement)

If the business associate uses subcontractors who will access PHI, those subcontractors are themselves business associates. The original BA must enter into a BAA with each such subcontractor that imposes the same obligations the BA accepted from the covered entity. This is the flow-down requirement.

In practical terms: if your billing vendor outsources claim adjudication to another company, that company must be covered by its own BAA with your billing vendor. Your BAA with the billing vendor must require that arrangement. If it does not, the obligation chain is broken.

Ask your vendors to confirm in writing which subcontractors access PHI and whether BAAs are in place with each.

### 6. Access for HHS inspection

The BA must make its internal practices, books, and records related to PHI available to HHS for purposes of determining the covered entity's compliance with HIPAA. This provision exists so that HHS can audit the BA's handling of PHI as part of investigating a covered entity. A BA that refuses to include this provision cannot be used to handle PHI.

### 7. Return or destruction of PHI on termination

At termination of the BAA, the BA must return or destroy all PHI received from or created on behalf of the covered entity. If return or destruction is not feasible, the BA must extend the protections of the agreement indefinitely to any PHI it retains.

This provision is frequently vague in vendor-generated BAAs. Ensure the agreement specifies: what "destruction" means (certificate required?), what timeline applies after termination, and what the BA will do if its own retention obligations conflict with destruction. The termination and destruction topic is substantial enough to warrant its own review process — covered in detail in the companion article on BAA termination and PHI destruction.

### 8. Individual rights support

The BA must agree to make PHI available so the covered entity can fulfill individuals' rights under HIPAA: the right of access (45 CFR §164.524), the right to amendment (45 CFR §164.526), and the right to an accounting of disclosures (45 CFR §164.528). If the BA holds PHI that a patient has requested to access or amend, the BA must facilitate that process.

This provision is often overlooked in small-clinic vendor relationships. When a billing vendor maintains claim records that a patient wants to review, the BA must cooperate with that request — not redirect the patient back to the clinic empty-handed.

## What makes a BAA unenforceable

A BAA fails on two grounds: missing required elements and deficient execution.

Missing required elements are the more common problem. A vendor that sends a one-paragraph "HIPAA addendum" attached to a software licensing agreement has almost certainly omitted several of the eight required provisions. Review the document against the checklist above before signing.

Deficient execution means the agreement was never properly signed. A BAA buried in a vendor's click-through terms of service — where acceptance is implied by using the product — does not satisfy the HIPAA requirement. The agreement must be a separately identified document with signatures from authorized representatives of both parties. An email confirmation or a checkbox acknowledgment does not suffice.

A vendor whose "BAA" is a link to a PDF with no signature line is not actually offering a BAA. Push back and ask for a properly executed document.

## Optional provisions worth negotiating

Two provisions appear frequently in well-drafted BAAs but are not required by 45 CFR §164.504(e)(2):

**Indemnification.** Many covered entities request indemnification language requiring the BA to cover costs (legal fees, OCR penalties, breach notification expenses) arising from the BA's failure to meet its obligations. Vendors often resist strong indemnification clauses. The practical position: push for it with vendors handling large PHI volumes; accept a mutual indemnification approach when the vendor has meaningful negotiating leverage.

**Shorter breach notification windows.** As discussed above, 60 days is the statutory maximum, not the target. A 10- or 15-day notification requirement gives the covered entity adequate time to assess the breach, engage counsel, notify HHS, and send individual notifications — all of which have their own deadlines.

## What to review before counter-signing a vendor BAA

When a vendor sends their form BAA, work through this sequence before signing:

1. Confirm the document is a standalone, signable agreement — not terms of service with a HIPAA section buried in it.
2. Map each of the eight required elements to specific language in the document. If any element is absent, request a revised draft.
3. Check the subcontractor language. Does it require the BA to impose obligations on its subcontractors? Does it require the BA to notify you when subcontractors change?
4. Check the breach notification window. Is it 60 days, or shorter? Negotiate down if possible.
5. Check the termination and destruction provision. Is it specific about method, timeline, and certification?
6. Confirm who signs for each party and that the signatories have authority to bind their organizations.

A BAA is not a formality. It is the legal foundation for every PHI transfer to that vendor. Treat it accordingly.
