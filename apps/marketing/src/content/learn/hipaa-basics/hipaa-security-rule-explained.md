---
title: "HIPAA Security Rule Explained for Small Clinics"
seoTitle: "HIPAA Security Rule Explained for Clinics"
description: "A plain-language guide to the HIPAA Security Rule: the three safeguard families, the required-versus-addressable distinction, and the risk analysis requirement every small clinic must meet."
metaDescription: "HIPAA Security Rule explained: administrative, physical, and technical safeguards, required vs. addressable, and the risk analysis at 164.308."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "hipaa-basics"
schemaType: "article"
intent: "awareness"
summary: "The HIPAA Security Rule sets federal standards for protecting electronic PHI. It requires covered entities and business associates to implement administrative, physical, and technical safeguards, to distinguish required from addressable specifications, and to perform and document a risk analysis. It helps clinics turn HIPAA requirements into assigned owners, recurring reviews, dated evidence, and practical controls that can be explained during an OCR inquiry."
keyTakeaways:
  - "The Security Rule is codified at 45 CFR Part 164, Subpart C and applies to electronic PHI."
  - "Safeguards are grouped into three families: administrative, physical, and technical."
  - "Each implementation specification is either required or addressable; addressable is not optional."
  - "A documented risk analysis under 164.308(a)(1)(ii)(A) is the foundation of the rest of the rule."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-risk-analysis-template"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Summary of the HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
  - title: "45 CFR Part 164 Subpart C"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C"
    publisher: "eCFR"
  - title: "Guidance on Risk Analysis"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html"
    publisher: "HHS"
  - title: "NIST SP 800-66 Revision 2"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "Does the Security Rule apply to paper records?"
    a: "No. The Security Rule applies to electronic PHI. Paper records are governed by the Privacy Rule."
  - q: "Is addressable the same as optional?"
    a: "No. An addressable specification must be implemented as written, implemented in an equivalent way, or documented in writing as not reasonable and appropriate, with the reasoning and any alternative measure."
  - q: "How often must a risk analysis be done?"
    a: "HHS expects risk analysis to be ongoing, not one-and-done. A clinic should refresh it at least annually and after any significant change in systems, workforce, or vendors."
  - q: "Do small clinics really need all three safeguard categories?"
    a: "Yes. The Security Rule allows scaling implementation to the size, complexity, and resources of the organization, but every covered entity must meet all three categories of safeguards."
---

The HIPAA Security Rule is the piece of HIPAA that tells clinics how to protect electronic PHI. It lives at 45 CFR Part 164, Subpart C. Compliance has been required for most covered entities since April 20, 2005, and HITECH extended the rule to business associates in 2010.

## What the rule covers

The Security Rule applies to any PHI that a covered entity or business associate creates, receives, maintains, or transmits in electronic form. That includes the EHR, email, cloud storage, practice-management software, backups, imaging systems, and any operational tool that touches patient data.

It does not apply to paper records. Paper PHI is governed by the [HIPAA Privacy Rule](/learn/hipaa-basics/hipaa-privacy-rule-explained).

## The three safeguard families

The rule organizes its requirements into three categories. Every covered entity must meet all three.

### Administrative safeguards (164.308)

These are the policies and processes that drive your security program. They include workforce security, information access management, security awareness and training, contingency planning, and the risk analysis and risk management obligations.

### Physical safeguards (164.310)

These govern facility access, workstation use and security, and device and media controls. Examples include badge access to a server closet, screen-privacy considerations in a shared front-office area, and how old laptops are wiped before disposal.

### Technical safeguards (164.312)

These cover the technical controls that protect ePHI inside information systems: access control, audit controls, integrity, authentication, and transmission security. Unique user IDs, audit logs, encryption, and TLS in transit are examples.

## Required versus addressable

Every implementation specification inside the rule is labeled either *required* or *addressable*. Required specifications must be implemented as written. Addressable specifications are not optional, but they allow more flexibility. For each addressable spec, a clinic must either:

- implement it as stated, or
- implement an equivalent alternative measure, or
- document in writing that the specification is not reasonable and appropriate for the organization and explain what, if anything, is in place instead

Skipping an addressable spec with no analysis is the compliance failure OCR flags most often.

## The risk analysis requirement

Section 164.308(a)(1)(ii)(A) requires an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI. This is the foundation of every other Security Rule obligation. A good risk analysis:

- inventories where ePHI lives
- identifies realistic threats and vulnerabilities for each location
- rates likelihood and impact
- feeds into a risk management plan that tracks remediation

NIST SP 800-66 Revision 2 offers a healthcare-focused walkthrough that is reasonable for small clinics to follow. A risk analysis is not a one-time project; HHS expects it to be updated at least annually and after any significant environmental or operational change.

## Scaling to a small clinic

The rule is explicitly flexible. A 12-person clinic does not have to buy an enterprise SIEM to meet the audit controls standard. But it does have to demonstrate that every required specification is implemented and that every addressable specification has been analyzed and either adopted, substituted, or consciously documented away.

Practical anchors for a small clinic:

- written information-security policies, reviewed annually
- role-based access tied to workforce roles and offboarding
- documented workforce training (see [workforce training](/learn/hipaa-basics/hipaa-compliance-training-for-small-clinics))
- encrypted laptops, phones, and backups
- a signed Business Associate Agreement with every vendor that touches ePHI
- contingency plans for data backup, disaster recovery, and emergency-mode operations
- a current risk analysis and risk management log

## Where operational tools come in

The EHR is rarely the only ePHI system in a clinic. Task systems, messaging tools, intake forms, and scheduling tools routinely hold patient names tied to clinical context. Those tools have to meet Security Rule requirements too, which is why BAAs, access controls, and audit trails matter everywhere PHI lives. PHIGuard is built for that operational surface at a clinic-flat price; details at [/hipaa](/hipaa).

## Common compliance gaps

- no written, current risk analysis
- no documentation for addressable specifications that were not implemented
- shared logins for clinical or billing systems
- no audit log review cadence
- missing BAAs with operational vendors
