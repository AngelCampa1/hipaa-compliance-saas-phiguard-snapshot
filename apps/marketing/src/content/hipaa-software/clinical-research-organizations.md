---
title: "HIPAA Software for Research Orgs"
audience: "clinical research organizations"
seoTitle: "HIPAA Software for Research Orgs"
description: "Clinical research organizations that access PHI are business associates with direct HIPAA obligations. This guide covers BAA flow-down, audit requirements, and software that fits CRO operations."
metaDescription: "HIPAA software for clinical research organizations. Business associate status, BAA flow-down, audit trail obligations, and published pricing."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
summary: "Clinical research organizations that access protected health information for research purposes operate as business associates of the covered entities they partner with. Direct Security Rule liability, BAA flow-down to sponsors and subcontractors, and audit trail requirements all apply from the first data access."
keyTakeaways:
  - "CROs that access PHI are business associates with direct HIPAA Security Rule obligations."
  - "Research data de-identification must meet the HIPAA Safe Harbor or Expert Determination standard; lesser anonymization does not eliminate PHI status."
  - "BAA flow-down applies to sponsors, subcontractors, and data management vendors who receive PHI."
  - "The audit trail for PHI access in research must be maintained independently and producible on request."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "HIPAA Privacy Rule and Research"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/research/index.html"
    publisher: "HHS"
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "45 CFR 164.314 - Business Associate Contracts and Other Arrangements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.314"
    publisher: "eCFR"
  - title: "45 CFR 164.514(e) - Limited Data Set and Data Use Agreement"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
faq:
  - q: "Is a CRO a covered entity or a business associate under HIPAA?"
    a: "A CRO that accesses PHI on behalf of a covered entity (such as a hospital or clinic site) to conduct research is a business associate. The covered entity is the healthcare provider whose patients' data is accessed. The CRO must sign a BAA with each covered entity site before accessing PHI."
  - q: "Does HIPAA apply to clinical research data at all?"
    a: "Yes, when the research uses PHI. HIPAA permits certain uses of PHI for research with patient authorization, under a waiver granted by an IRB, or when the data meets the de-identification standard. When PHI is accessed under any of these paths, HIPAA compliance obligations apply to everyone in the data chain."
  - q: "What is the HIPAA de-identification standard?"
    a: "HIPAA recognizes two methods: the Safe Harbor method (removing 18 specific identifiers) and the Expert Determination method (statistical verification by a qualified expert). Data that has not been de-identified by one of these methods remains PHI regardless of how it is labeled internally."
  - q: "Who in the CRO is responsible for HIPAA compliance?"
    a: "The CRO must designate a Privacy Officer and a Security Officer. For many CROs, these roles are held by the Regulatory Affairs or Compliance function. The designation must be documented and the individuals must have the authority to implement policies."
---

## Research access to PHI creates immediate compliance obligations

Clinical research organizations that access patient data from covered entity sites are business associates from the first data transfer. The research context does not create a HIPAA exemption; it creates a specific set of permitted uses that must be properly documented and matched to the correct legal pathway.

HIPAA recognizes three primary mechanisms for research access to PHI: (1) individual patient authorization under 45 CFR 164.508; (2) an IRB- or Privacy Board-approved waiver of authorization under 45 CFR 164.512(i)(1)(i), which requires the IRB to find that the research cannot practicably be conducted without the waiver; and (3) use of a limited data set under a data use agreement (DUA) under 45 CFR 164.514(e), which permits access to PHI with certain direct identifiers removed but does not require full de-identification. Each pathway has different documentation requirements that the CRO must be able to produce.

Whether the access is under patient authorization, an IRB-approved waiver, or a limited data set DUA, the CRO's handling of that data is governed by the Security Rule. A data use agreement with a hospital site gives the CRO permission to access the data. It does not replace the BAA requirement or reduce the Security Rule obligations that apply to how the CRO stores, processes, and protects that data in its own environment.

## BAA flow-down across the research chain

Clinical trials involve extended data chains. The sponsor, the CRO, the site, the data management vendor, and the biostatistics team may all touch study data that includes PHI at various points. Each transfer that involves PHI requires a BAA between the parties at that step.

Common flow-down gaps in CRO operations:

- **Sponsors who access PHI as part of monitoring or data review.** If the sponsor receives PHI (not just aggregate data), the sponsor-CRO relationship requires a BAA.
- **EDC and data management vendors.** Electronic data capture platforms that store or process PHI require BAAs from the CRO if the CRO is directing the data relationship.
- **Subcontracted monitors and CRAs.** Contract research associates who access source documents at investigator sites need BAAs if they function as subcontractors of the CRO.
- **Biostatistics or programming vendors.** If analysis datasets contain PHI, these vendors are downstream business associates.

The de-identification analysis matters here. If datasets have been properly de-identified using the Safe Harbor or Expert Determination method, the downstream data transfers may not involve PHI at all. Confirm de-identification status before assuming a BAA is not needed.

## What the audit trail means in research

Research sponsors and regulatory agencies may audit a CRO's data handling practices. The FDA, the IRB, and the covered entity sites you work with all have potential audit rights over different aspects of your operations. The PHI-specific audit record (who accessed what data, when, and for what purpose) needs to be maintained separately from general trial documentation and producible on request.

For internal compliance operations, this means:

- **Access logs.** Every system that stores PHI needs access logging enabled and retained.
- **Policy and procedure records.** Current Security Rule policies with version history and review dates.
- **Workforce training records.** Every staff member with PHI access must have documented HIPAA training.
- **Incident logs.** Any suspected breach or near-miss must be logged with timestamps and resolution documentation.

A spreadsheet is not an audit record. An email thread is not an incident log. The compliance program needs operational infrastructure that generates records as a byproduct of normal work.

## Why current pricing fits CRO operations

CRO teams are multidisciplinary. Regulatory, data management, monitoring, clinical operations, and executive functions all need access to compliance documentation at various points in a trial. The pricing page covers current plan and billing details for multidisciplinary operations teams.

For CROs that manage multiple trial portfolios simultaneously, per-workspace pricing is also predictable. Cost scales with the number of clinic or trial environments, not with the size of the team.

## The competitive case for a documented compliance program

Sponsors evaluate CROs on regulatory track record and compliance posture before selecting them for trials. A CRO that can produce its current Security Rule policies, BAA inventory, staff training records, and incident history on request is a materially lower-risk vendor than one that cannot. That documentation is not overhead; it is a qualification.

For the regulatory framework governing research access to PHI, see [HHS guidance on HIPAA and research](https://www.hhs.gov/hipaa/for-professionals/special-topics/research/index.html). For PHIGuard plans, visit [our HIPAA page](/hipaa) or [review pricing](/pricing).

See also [PHI tools and vendor compliance](/learn/phi-tools-vendors) for how the BA relationship and BAA chain function in multi-party data environments.

Related: [HIPAA software for medical billing companies](/hipaa-software/medical-billing-companies) covers parallel business associate compliance requirements for healthcare data processors.
