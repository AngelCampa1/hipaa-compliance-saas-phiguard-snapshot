---
title: "PHI in Referral Management: HIPAA Rules for Outbound and Inbound Referrals"
seoTitle: "PHI in Referral Management Workflows"
description: "Referrals move complete patient summaries between clinics. This guide covers what PHI flows through the referral process, which HIPAA rules apply, and how to manage referral platforms, fax destinations, and minimum necessary in real practice."
metaDescription: "How HIPAA applies to outbound and inbound referrals. PHI in referral packets, fax misrouting, BAA requirements for referral platforms, and minimum necessary."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
intent: "consideration"
summary: "Referrals send demographics, reason for referral, insurance information, and clinical notes from one provider to another. This article explains what PHI moves, the TPO basis for the disclosure, the most common breach pattern (misdirected fax), and how to set up referral platforms and document templates that meet minimum necessary."
keyTakeaways:
  - "PHI flowing through referrals includes patient demographics, contact information, reason for referral, insurance details, relevant clinical notes, and supporting test results."
  - "Provider-to-provider referrals are treatment disclosures under 45 CFR 164.506 and do not require patient authorization, though minimum necessary still applies to non-treatment uses."
  - "The most common gap is misdirected fax to an unconfirmed number, followed by overly broad referral packets that disclose unrelated history."
  - "Referral platforms that store, transmit, or route patient data are business associates and require a signed BAA before use."
  - "Confirm fax destinations on every send, build minimum-necessary referral templates, and require receipt confirmation by the intended provider."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR Part 164 — HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "45 CFR 164.514 — Other requirements relating to uses and disclosures of protected health information"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
faq:
  - q: "Does the minimum necessary standard apply to referrals?"
    a: "The minimum necessary standard does not apply to disclosures to a treating provider for treatment purposes. It does apply to disclosures within the referral platform itself, to administrative staff at the receiving practice, and to any non-treatment use, so most referral workflows still need to be scoped carefully."
  - q: "Is a misdirected fax a reportable breach?"
    a: "Often, yes. If PHI is sent to an unintended recipient who is not a covered entity or business associate, it generally meets the definition of a breach unless a low probability of compromise can be demonstrated through the four-factor risk assessment in the Breach Notification Rule."
  - q: "Do we need a BAA with our referral platform vendor?"
    a: "If the platform stores, routes, or transmits patient data on your behalf, yes. A signed BAA is required before sending live PHI. Confirm subcontractor flow-down to any cloud infrastructure or messaging providers the platform uses."
---

Referral management is one of the highest-risk PHI workflows in a small clinic, mostly because it does not feel risky. Staff have been faxing referrals for decades. The receiving practice is another covered entity. The patient already knows the referral is happening. None of that prevents the routine misdirected fax, the over-broad packet, or the unsigned BAA with the new referral platform.

The risk is concentrated in two failure modes: the destination being wrong, and the contents being too broad. Designing the workflow around those two failure modes is most of the work.

## What PHI flows through referral management

A typical outbound referral packet contains:

- Patient name, date of birth, address, phone number, and email
- Insurance information including payer, member ID, and group number
- Reason for referral, sometimes including specific clinical questions for the consultant
- Relevant history of present illness and pertinent past medical history
- Recent visit notes, lab results, imaging reports, and medication list
- Ordering provider name, NPI, and contact information

Inbound referrals come back with a consult note, sometimes a procedure report, and occasionally a request for additional records. Each direction is PHI in motion. Once the receiving practice loads the packet into their EHR, it becomes PHI at rest in a system the original clinic does not control.

Modern referral platforms add a third layer: the platform itself stores patient data, routing metadata, status updates, and sometimes attached documents. That stored data is PHI at rest in the vendor's environment.

## HIPAA requirements that apply

Several provisions shape referral workflows:

- **45 CFR 164.506** permits disclosures for treatment, payment, and health care operations without patient authorization. A referral to a treating provider is a treatment disclosure.
- **45 CFR 164.502(b)** applies the minimum necessary standard, with an explicit exception for disclosures to a health care provider for treatment. Even with the exception, minimum necessary still applies to administrative staff at the receiving practice and to any storage in a referral platform.
- **45 CFR 164.514(d)** requires reasonable efforts to limit PHI to what is necessary for the purpose, including in routine and recurring disclosures.
- **45 CFR 164.530(c)** requires reasonable safeguards, which is the basis for confirming fax numbers, using cover sheets, and securing referral platform credentials.
- **The Breach Notification Rule (45 CFR 164.400-414)** governs what happens when a referral lands at the wrong number, the wrong fax, or the wrong inbox.

## Common compliance gaps in referral workflows

Four patterns recur:

1. **Misdirected fax.** A staff member transposes digits, an outdated number stays in the address book, or a shared multi-tenant fax line routes the document to the wrong office. A diagnosis-rich packet ends up on a stranger's machine.
2. **Over-broad referral packets.** The EHR's "send to referral" button exports the full chart. The orthopedist receives mental health notes and HIV status that have nothing to do with the knee surgery they were asked about.
3. **Unsigned BAAs with referral platforms.** A clinic adopts a referral platform to manage handoffs, but treats it like email. No BAA, no review of where the data is stored, no understanding of who the platform's subcontractors are.
4. **Missing receipt confirmation.** The clinic sends a referral and assumes it arrived. No one calls to confirm receipt, no one tracks closed-loop status, and a misdirected referral is discovered weeks later when the patient asks why they have not been contacted.

## How to make referral management HIPAA-compliant

1. **Confirm the destination on every outbound send.** For fax, maintain a verified number list and require a callback verification for any new destination. For referral platforms, verify the receiving practice's identity and account before the first send. For email, use only encrypted channels with verified addresses.
2. **Build minimum-necessary referral templates.** Configure the EHR or referral tool so the default export includes the reason for referral, the relevant problem, recent pertinent results, and the medication list, not the entire chart. Make staff opt in to additional sections rather than opt out.
3. **Require closed-loop confirmation.** Every outbound referral should have a receipt confirmation by the intended provider within a defined window (often 48 to 72 hours). If confirmation does not arrive, treat it as a potential misdirected disclosure and investigate.
4. **Sign and verify BAAs with every referral platform.** Treat the platform exactly like any other business associate. See [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). Confirm subcontractor flow-down for storage, messaging, and any analytics processors.
5. **Train staff on the breach response path.** A misdirected fax or referral is a near-certain occurrence over time. Staff need to know that calling a misdirected fax recipient to request destruction is the immediate step, and that the incident must be reported internally for a four-factor risk assessment under the Breach Notification Rule.

## Vendor BAA requirements for referral software

Referral platform contracts should cover:

- Encryption in transit and at rest, with TLS 1.2 or higher and AES-256 at rest as a baseline
- Audit logging of every send, receipt, and access event, with logs retrievable on request
- Subcontractor flow-down for cloud hosting, document conversion, OCR, and notification services
- Identity verification for receiving practices, so a referral is not routed to an account that cannot prove it represents the intended provider
- Clear breach notification timelines and a single accountable contact
- Data return or destruction at termination, with retention controls the clinic can configure
- Restrictions on secondary use of PHI for analytics, model training, or marketing

For platforms that include AI-assisted summarization or routing suggestions, confirm whether patient data is used to train shared models. That is a use that generally requires explicit patient authorization and is not covered by the standard treatment exception.

For broader context on how referrals fit into your overall data flow map, see the [PHI workflows hub](/learn/phi-workflows). [PHIGuard](/hipaa) treats referral vendors, BAAs, and closed-loop confirmation as standing items in the compliance program rather than something the front desk has to remember on its own.
