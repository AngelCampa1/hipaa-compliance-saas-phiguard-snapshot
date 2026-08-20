---
title: "HIPAA Safeguards: Administrative, Physical, and Technical"
seoTitle: "HIPAA Safeguards Explained"
description: "The three categories of HIPAA safeguards required under the Security Rule, with specific examples for each, and the distinction between required and addressable specifications."
metaDescription: "HIPAA safeguards are the administrative, physical, and technical protections for ePHI required by 45 CFR Part 164, Subpart C. Learn what each category requires."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "HIPAA Safeguards"
intent: "awareness"
summary: "HIPAA safeguards are the administrative, physical, and technical protections that covered entities must implement to protect electronic PHI under the Security Rule (45 CFR Part 164, Subpart C). Each category contains both required implementation specifications (mandatory) and addressable specifications (implement as specified, use an equivalent alternative, or document why neither is reasonable)."
keyTakeaways:
  - "Three categories: administrative safeguards (policies and procedures), physical safeguards (facility and device controls), and technical safeguards (system-level protections)."
  - "Implementation specifications are either 'required' (no flexibility) or 'addressable' (flexibility in how, not whether, to protect ePHI)."
  - "The Security Rule applies to ePHI only — paper PHI is covered by the Privacy Rule, not the Security Rule safeguard requirements."
  - "Safeguard compliance requires a documented risk analysis as the foundation — implementing safeguards without a risk analysis is itself a compliance failure."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-risk-analysis-template"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR Part 164, Subpart C — Security Standards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C"
    publisher: "HHS / eCFR"
  - title: "HIPAA Security Rule — Summary"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
faq:
  - q: "Do HIPAA safeguards apply to paper records or only to electronic systems?"
    a: "The Security Rule safeguards — administrative, physical, and technical — apply specifically to electronic PHI (ePHI). Paper PHI is governed by the Privacy Rule, which requires reasonable safeguards but does not specify the three-tier framework. For paper records, the Privacy Rule's general requirement to implement reasonable safeguards applies, but the specific Security Rule implementation specifications do not."
  - q: "What is the difference between a required and an addressable implementation specification?"
    a: "Required specifications must be implemented exactly as specified — there is no alternative. Addressable specifications allow the covered entity to (1) implement the specification as described, (2) implement an equivalent alternative that accomplishes the same purpose, or (3) document why neither approach is reasonable and appropriate for the organization. Addressable does not mean optional — it means the covered entity has some flexibility in how it protects ePHI, not whether it does."
  - q: "A small clinic uses a cloud-based EHR. Which safeguards apply to the EHR vendor?"
    a: "All three categories of safeguards apply to the EHR vendor as a business associate. The vendor must implement administrative safeguards (Security Rule policies for their own workforce and systems), physical safeguards (protection of their data centers and hardware), and technical safeguards (access controls, audit logs, transmission security). The clinic should confirm these safeguards through the BAA and any available security documentation like SOC 2 reports."
---

HIPAA safeguards are the administrative, physical, and technical protections required under the Security Rule (45 CFR Part 164, Subpart C) to protect electronic PHI. The Security Rule organizes these protections into three categories, each containing both required and addressable implementation specifications. Understanding all three — and the required/addressable distinction — is the foundation of an effective Security Rule compliance program.

The Security Rule applies to **electronic PHI (ePHI)** specifically. That means PHI created, stored, transmitted, or received in electronic form. Paper records are covered by the Privacy Rule's general reasonable safeguards requirement, not by the specific three-tier safeguard framework described here.

For a foundational understanding of PHI and ePHI, see [what is PHI](/learn/hipaa-basics/what-is-phi).

## Required vs. Addressable Specifications

**Required** implementation specifications are mandatory. The regulation specifies what must be done, and there is no alternative. Your clinic cannot document its way out of a required specification.

**Addressable** implementation specifications provide flexibility. For each addressable specification, your clinic must:

1. **Assess whether the specification is reasonable and appropriate** given the nature of the organization, its size, and its technical capabilities.
2. **If reasonable and appropriate, implement it** as specified.
3. **If not reasonable and appropriate in that specific form, implement an equivalent alternative** that accomplishes the same purpose.
4. **If neither is reasonable and appropriate, document why** in writing and implement other appropriate measures.

"Addressable" does not mean "optional." It means your clinic has some flexibility in how it protects ePHI — specifically, which protective measure to use when multiple options might reasonably address the same risk. Covered entities cannot simply decline addressable specifications without a documented rationale.

## Administrative Safeguards — 45 CFR § 164.308

Administrative safeguards are the **policies, procedures, and processes** that manage the selection, development, implementation, and maintenance of security measures to protect ePHI, and manage the conduct of the workforce in relation to ePHI protection.

### Security Management Process (Required)

Your clinic must implement policies and procedures to prevent, detect, contain, and correct security violations. This standard contains four required implementation specifications:

- **Risk analysis (Required):** Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to ePHI. See the [HIPAA risk analysis worksheet](/resources/hipaa-risk-analysis-template).
- **Risk management (Required):** Implement security measures sufficient to reduce risks to a reasonable and appropriate level.
- **Sanction policy (Required):** Apply appropriate sanctions against workforce members who fail to comply with security policies.
- **Information system activity review (Required):** Regularly review records of information system activity — audit logs, access reports, security incident tracking reports.

### Assigned Security Responsibility (Required)

Identify the security official responsible for developing and implementing Security Rule policies and procedures. See [HIPAA Security Officer](/learn/hipaa-basics/hipaa-security-officer).

### Workforce Security (Addressable)

Implement policies and procedures to ensure that all workforce members have appropriate access to ePHI and to prevent unauthorized access. Implementation specifications include:

- **Authorization and/or supervision (Addressable):** Procedures for authorizing and supervising workforce members.
- **Workforce clearance (Addressable):** Procedures to determine whether workforce access to ePHI is appropriate.
- **Termination procedures (Addressable):** Procedures for terminating access when a workforce member leaves.

### Information Access Management (Required and Addressable)

Implement policies and procedures for authorizing access to ePHI:

- **Isolating healthcare clearinghouse functions (Required):** If a covered entity is a healthcare clearinghouse that is also a component of a larger organization, implement policies that protect ePHI from unauthorized access by the larger organization.
- **Access authorization (Addressable):** Policies for granting access to workstations, transactions, programs, or processes.
- **Access establishment and modification (Addressable):** Policies for granting, changing, and removing ePHI access.

### Security Awareness and Training (Addressable)

Implement a security awareness and training program for all workforce members. Specifications include:

- **Security reminders (Addressable):** Periodic security update notices.
- **Protection from malicious software (Addressable):** Training on detecting, reporting, and guarding against malicious software.
- **Log-in monitoring (Addressable):** Procedures for monitoring log-in attempts and reporting discrepancies.
- **Password management (Addressable):** Procedures for creating, changing, and safeguarding passwords.

### Security Incident Procedures (Required)

Implement policies and procedures to address security incidents:

- **Response and reporting (Required):** Identify, respond to, mitigate, and document security incidents and their outcomes.

### Contingency Plan (Required and Addressable)

Establish policies and procedures for responding to emergencies that damage ePHI systems:

- **Data backup plan (Required):** Create and maintain exact retrievable copies of ePHI.
- **Disaster recovery plan (Required):** Procedures for restoring data lost from damage.
- **Emergency mode operation plan (Required):** Procedures for continuing business operations during an emergency.
- **Testing and revision (Addressable):** Procedures for periodic testing and revision of contingency plans.
- **Applications and data criticality analysis (Addressable):** Assess the relative criticality of specific applications and data.

### Evaluation (Required)

Perform a periodic technical and non-technical evaluation of the extent to which security policies and procedures meet HIPAA Security Rule requirements.

### Business Associate Contracts (Required)

Obtain satisfactory assurances that business associates will appropriately safeguard ePHI. See [business associate agreement explained](/learn/hipaa-basics/business-associate-agreement-explained).

## Physical Safeguards — 45 CFR § 164.310

Physical safeguards are **facility access and use policies** protecting information systems and related equipment and buildings from unauthorized intrusion and natural or environmental hazards.

### Facility Access Controls (Addressable)

Implement policies and procedures to limit physical access to electronic information systems while ensuring authorized access. Specifications include:

- **Contingency operations (Addressable):** Procedures allowing facility access during emergency operations.
- **Facility security plan (Addressable):** Policies to safeguard the facility and equipment from unauthorized physical access, tampering, and theft.
- **Access control and validation procedures (Addressable):** Procedures for controlling and validating access to facilities based on role or function.
- **Maintenance records (Addressable):** Documentation of repairs and modifications to the physical components of a facility.

**Practical examples for small clinics:** badge access or key control for server rooms, locked storage for portable devices, visitor sign-in procedures, and alarm systems for after-hours intrusion detection.

### Workstation Use (Required)

Implement policies and procedures specifying proper functions for workstations that access ePHI and the manner in which they are performed. This includes physically positioning monitors to prevent inadvertent viewing by unauthorized persons (clean-screen practices in patient-facing areas).

### Workstation Security (Required)

Implement physical safeguards for workstations that access ePHI to restrict access to authorized users. This includes screen privacy filters, locked workstations when unattended, and physical location security.

### Device and Media Controls (Required and Addressable)

Govern receipt and removal of hardware and electronic media that contain ePHI:

- **Disposal (Required):** Final disposition of ePHI and/or the hardware or media on which it is stored (secure wiping, degaussing, or physical destruction).
- **Media re-use (Required):** Removal of ePHI from media before media is available for reuse.
- **Accountability (Addressable):** Record of movements of hardware and media.
- **Data backup and storage (Addressable):** Create a retrievable, exact copy of ePHI before moving equipment.

## Technical Safeguards — 45 CFR § 164.312

Technical safeguards are the **technology and the policies and procedures governing its use** that protect ePHI and control access to it.

### Access Control (Required and Addressable)

Implement technical policies and procedures that allow only authorized persons to access ePHI:

- **Unique user identification (Required):** Assign a unique name and/or number for identifying and tracking user identity.
- **Emergency access procedure (Required):** Procedures for obtaining necessary ePHI during an emergency.
- **Automatic logoff (Addressable):** Implement automatic logoff of sessions after inactivity.
- **Encryption and decryption (Addressable):** Implement mechanisms to encrypt and decrypt ePHI.

### Audit Controls (Required)

Implement hardware, software, and procedural mechanisms that record and examine activity in information systems that contain or use ePHI. This includes system access logs, application-level audit trails, and regular review of those logs for anomalous activity.

### Integrity Controls (Addressable)

Implement policies and procedures to protect ePHI from improper alteration or destruction:

- **Mechanism to authenticate ePHI (Addressable):** Implement electronic mechanisms to corroborate that ePHI has not been altered or destroyed in an unauthorized manner.

### Transmission Security (Required and Addressable)

Implement technical security measures to guard against unauthorized access to ePHI transmitted over an electronic communications network:

- **Integrity controls (Addressable):** Mechanisms to ensure ePHI is not improperly modified without detection during transmission.
- **Encryption (Addressable):** Mechanisms to encrypt ePHI in transit. Although encryption in transmission is addressable, HHS has consistently indicated that covered entities should encrypt ePHI in transit unless they have a documented and reasonable alternative. In practice, TLS for web traffic and email encryption are expected baseline controls.

## Safeguards Are Not Implemented in Isolation

HIPAA does not specify a checklist of technology products. The Security Rule is technology-neutral, requiring covered entities to implement safeguards that are "reasonable and appropriate" given the specific risks identified in the risk analysis. This means:

- Your clinic must first conduct a risk analysis to identify where ePHI is and what threatens it
- Safeguards are then selected and implemented to address the identified risks
- The adequacy of safeguards is assessed against the specific risk environment, not a universal standard

A cloud-based EHR with multi-factor authentication and automated audit logs addresses specific risks differently than an on-premises server room. Both can be compliant or non-compliant depending on how well the safeguards match the identified risk profile.

PHIGuard helps small clinics maintain a documented risk analysis, track safeguard implementation, and monitor compliance across all three safeguard categories. See [PHIGuard's HIPAA compliance platform](/hipaa) for details.
