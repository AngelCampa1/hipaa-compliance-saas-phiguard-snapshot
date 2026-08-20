---
title: "PHI in Prescription Management: HIPAA Rules for E-Prescribing and Pharmacy Data"
seoTitle: "PHI in Prescription Management Workflows"
description: "E-prescribing routes patient and medication data through Surescripts, pharmacies, and patient-facing apps. This guide explains what PHI flows through prescription management, which HIPAA rules apply, and how EPCS, family access, and pharmacy benefit data add complexity."
metaDescription: "How HIPAA applies to e-prescribing, EPCS, and pharmacy data flows. PHI exposure, Surescripts BAA, and minimum necessary in prescription workflows."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
intent: "consideration"
summary: "Prescription management sends patient and drug data to pharmacies through Surescripts, pulls back fill history and refill requests, and increasingly surfaces medication information in patient and family-facing apps. This article maps the data flows, the TPO basis, the EPCS layer for controlled substances, and the BAA and minimum-necessary considerations that often get missed."
keyTakeaways:
  - "PHI flowing through prescriptions includes patient name, DOB, address, drug, dosage, sig, indication, allergies, and pharmacy benefit data."
  - "E-prescribing is a treatment and payment activity under 45 CFR 164.506, and Surescripts and the EHR's e-Rx module operate as business associates."
  - "EPCS for controlled substances adds DEA identity-proofing and two-factor requirements that go beyond HIPAA but interact with audit and access policies."
  - "Pharmacy fill history and refill requests flowing back into the EHR are PHI and need the same encryption, audit, and access controls as outbound prescriptions."
  - "Patient-facing prescription apps with proxy or family access raise minimum-necessary questions that should be addressed in policy, not left to default settings."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR Part 164 — HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA for Professionals — Permitted Uses and Disclosures"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Is Surescripts a business associate?"
    a: "Surescripts processes electronic prescription transactions on behalf of providers and pharmacies, which generally makes it a business associate to the prescriber. The EHR vendor typically has the BAA in place with Surescripts on behalf of its provider customers, but clinics should confirm rather than assume."
  - q: "Do EPCS rules replace HIPAA for controlled substances?"
    a: "No. EPCS rules from the DEA add identity proofing, two-factor authentication, and audit requirements for controlled substance prescribing. HIPAA Privacy and Security Rules still apply on top of EPCS. Both must be satisfied."
  - q: "Can a patient's family member see their prescriptions in a patient-facing app?"
    a: "Only with proper authorization or proxy setup. For adults, a written authorization or a documented personal representative relationship is generally required. For minors, state law and the clinic's policy on adolescent confidentiality drive what is appropriate. The default access settings in most patient apps are not a substitute for a documented policy."
---

Prescription management is one of the most automated workflows in a clinic and one of the most quietly complex from a compliance standpoint. A single e-prescription touches the EHR, the e-Rx module, Surescripts, the pharmacy's dispensing system, the patient's insurer through pharmacy benefit checks, and increasingly the patient's own phone through a portal or pharmacy app. Each hop is a disclosure that needs to be supported by a permitted purpose, a BAA where applicable, and reasonable safeguards.

For controlled substances, EPCS adds identity-proofing and two-factor requirements from the DEA that interact with HIPAA but do not replace it. Both regimes apply.

## What PHI flows through prescription management

Outbound prescriptions carry:

- Patient name, date of birth, address, phone number
- Drug name, strength, dosage form, sig, quantity, refills
- Indication or diagnosis when the prescriber chooses to include it
- Allergy and adverse reaction information
- Prescriber name, NPI, and DEA number where applicable
- Pharmacy identifier and routing information

Pharmacy benefit checks send the patient's identity and the proposed drug to the pharmacy benefit manager and return formulary status, prior authorization requirements, and patient cost. That round trip is PHI.

Pharmacy data flows back as well. Fill history, refill requests, dispensing notifications, and drug utilization review alerts come back into the EHR. Patient-facing apps then surface that data to patients, and sometimes to authorized proxies or family members.

EPCS adds an authentication and audit layer on top of the prescription itself. The substance of the prescription is the same; the controls around who can sign it are stricter.

## HIPAA requirements that apply

Several provisions govern prescription workflows:

- **45 CFR 164.506** permits disclosures for treatment, payment, and health care operations. E-prescribing to a pharmacy is a treatment disclosure; benefit checks are payment.
- **45 CFR 164.502(b)** imposes minimum necessary, with the treatment exception applying provider-to-pharmacy. The exception does not extend to all administrative uses or to patient-facing surfaces with proxy access.
- **45 CFR 164.308 and 164.312** require access controls, audit logging, and authentication safeguards. EPCS layers DEA-specific authentication on top of the HIPAA baseline.
- **45 CFR 164.524** governs the patient's right to access their own information, which is the legal basis for patient-facing prescription apps and informs how proxy access should be designed.
- **45 CFR 164.502(g)** addresses personal representatives and their access rights.

The DEA EPCS rule (21 CFR 1311) is separate from HIPAA but operates in parallel. Identity proofing, two-factor authentication for controlled substance signing, and tamper-evident audit logs are all required.

## Common compliance gaps in prescription workflows

Four patterns are common:

1. **Unconfirmed BAAs with the e-Rx network.** Surescripts is typically covered through the EHR vendor's contracts, but clinics rarely verify the chain. If the EHR vendor changes networks or routing partners, the BAA chain may not be refreshed.
2. **Default patient-app access for proxies.** Patient portals often allow proxy access for spouses, parents, or caregivers with minimal verification. Adolescent records, sensitive medications, and behavioral health prescriptions can become visible to a parent after the patient turns 18 unless the access is reviewed.
3. **Audit logging that is not actually reviewed.** EPCS and HIPAA both require audit trails. Many practices have the logs but never look at them, which means anomalous prescribing or access patterns are not detected until a complaint surfaces.
4. **Excess clinical context in the indication field.** Prescribers occasionally include detailed clinical context in the prescription note that is more than the pharmacy needs and that travels through systems that the prescriber does not control.

## How to make prescription management HIPAA-compliant

1. **Verify the BAA chain for e-prescribing.** Confirm that the EHR vendor has a BAA in place that covers Surescripts and any subcontracted networks. Ask for the chain in writing as part of vendor onboarding and at contract renewal.
2. **Configure EPCS with the full DEA control set.** Identity proofing through an approved credential service provider, two-factor authentication for every controlled substance signing, and tamper-evident audit logs that the practice can review and export.
3. **Review and tighten patient-app proxy access.** Define a clear policy for adult proxy access, adolescent transitions, and revocation. Configure the portal to require explicit, documented authorization rather than self-service proxy invitations for sensitive record types.
4. **Audit prescription access logs on a defined cadence.** Quarterly is a reasonable baseline for a small clinic. Look for prescribing under credentials of providers who are out of office, after-hours access from unfamiliar locations, and bulk record views that do not match a clinical purpose.
5. **Train prescribers on the indication and note fields.** The free-text fields in an e-Rx travel further than most prescribers expect. Limit clinical detail to what the pharmacy needs to dispense safely, and route richer clinical context through the chart, not the prescription.

## Vendor BAA requirements for prescription software

For e-Rx modules, EPCS providers, and patient-facing prescription apps, the BAA and product configuration should cover:

- Encryption in transit (TLS 1.2 or higher) and at rest (AES-256 baseline)
- Audit logging of all access, signing, and dispensing events, with retention that meets HIPAA and DEA requirements
- Subcontractor flow-down for routing networks, identity proofing services, and any analytics or AI components
- Identity proofing and two-factor authentication that meet DEA EPCS requirements for controlled substances
- Configurable proxy access controls in patient apps, with documented authorization workflows
- Breach notification timelines and a single accountable contact
- Data return or destruction at termination, with retention controls the clinic can configure
- Restrictions on secondary use of prescription data for analytics, benchmarking, or model training

For platforms that surface medication adherence analytics or refill reminders, confirm the legal basis for any patient communication. Refill reminders are generally permitted under treatment, but adherence marketing on behalf of a manufacturer requires different authorization.

For broader context on how prescriptions fit into your overall data flow map, see the [PHI workflows hub](/learn/phi-workflows). To learn how to evaluate the BAA chain, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). [PHIGuard](/hipaa) treats prescription vendors, EPCS controls, and proxy access policies as part of the standing compliance program rather than separate, easily forgotten checklists.
