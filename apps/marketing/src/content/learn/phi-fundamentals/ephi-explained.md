---
title: "ePHI Explained: Technical Safeguards Mapped"
seoTitle: "ePHI Explained: Safeguards for Clinics"
description: "A deeper guide to ePHI, how it differs from PHI, and how the HIPAA Security Rule's technical safeguards apply to the systems small clinics actually use."
metaDescription: "ePHI is electronic protected health information governed by the HIPAA Security Rule. Learn the technical safeguards, what they require, and how to apply them."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-fundamentals"
schemaType: "article"
intent: "awareness"
summary: "ePHI is any protected health information created, received, maintained, or transmitted in electronic form. It is subject to the HIPAA Security Rule in addition to the Privacy Rule, which requires covered entities to implement technical, physical, and administrative safeguards. This guide maps the four categories of technical safeguards to the systems small clinics commonly operate."
keyTakeaways:
  - "ePHI is PHI in electronic form and is governed by both the HIPAA Privacy Rule and Security Rule."
  - "The Security Rule requires four categories of technical safeguards: access control, audit controls, integrity, and transmission security."
  - "Encryption is an addressable — not required — implementation specification, but failure to encrypt demands documented justification."
  - "Non-clinical tools such as task managers, cloud drives, and email platforms become ePHI systems when they handle patient-linked data."
  - "Audit logs must capture who accessed ePHI, when, and what action was taken — and must not be modifiable."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
  - title: "45 CFR Part 164 Subpart C — Security Standards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C"
    publisher: "eCFR"
  - title: "NIST SP 800-66r2 — Implementing HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "What is the difference between PHI and ePHI?"
    a: "PHI is protected health information in any form — paper, verbal, or electronic. ePHI is the electronic subset. The HIPAA Security Rule applies only to ePHI; the Privacy Rule applies to all PHI."
  - q: "Is encryption required for ePHI?"
    a: "Encryption is an addressable implementation specification under the Security Rule, not a required one. That means if a covered entity decides not to encrypt, it must document a reasonable justification. In practice, OCR treats lack of encryption as a significant risk factor in breach investigations."
  - q: "Does a cloud storage folder containing patient records count as ePHI?"
    a: "Yes. Any electronic system that stores patient-identifiable data with health context maintains ePHI. The system must meet Security Rule safeguard requirements, and the vendor must sign a BAA."
  - q: "What technical safeguards are required?"
    a: "The Security Rule at 45 CFR § 164.312 requires access control, audit controls, integrity controls, and transmission security. Each category has a mix of required and addressable implementation specifications."
---

**ePHI** — electronic protected health information — is any PHI that is created, received, maintained, or transmitted in electronic form. The definition is broad by design: it covers data in EHRs, in cloud storage, in email, in task management tools, in mobile devices, and in any system that touches patient-linked information electronically.

While an introductory definition of ePHI is covered in [What Is ePHI](/learn/phi-fundamentals/what-is-ephi), this guide goes deeper: mapping the HIPAA Security Rule's technical safeguard requirements to the systems a small clinic actually operates.

## What the Security Rule requires

The HIPAA Security Rule at 45 CFR Part 164, Subpart C, requires covered entities and business associates to implement safeguards across three domains: administrative, physical, and technical. The technical safeguards — at 45 CFR § 164.312 — have four categories.

### 1. Access control (§ 164.312(a))

Access control requires that only authorized persons can access ePHI. Implementation specifications include:

- **Unique user identification (required)** — every user must have a unique identifier, not a shared login
- **Emergency access procedure (required)** — a documented process for accessing ePHI during a system failure
- **Automatic logoff (addressable)** — sessions that terminate after inactivity
- **Encryption and decryption (addressable)** — tools to encrypt and decrypt ePHI when stored

In practical clinic terms: shared passwords are a Security Rule violation. Role-based accounts with individual credentials are the baseline. Tools that do not support unique user identification should not be used for ePHI.

### 2. Audit controls (§ 164.312(b))

The Security Rule requires hardware, software, and procedural mechanisms to record and examine access to ePHI. There is one implementation specification, and it is required.

What a valid audit log must capture:

- Who accessed the system
- What action was taken (view, create, modify, delete)
- When the action occurred
- What record or data was affected

Audit logs must be retained and protected from modification. A log that can be altered by an administrator after the fact does not satisfy § 164.312(b). This is a common gap in general-purpose task and project management tools — they may log logins but not content access.

See [HIPAA Audit Log Requirements for Small Clinics](/learn/compliance-operations/hipaa-audit-log-requirements-small-clinics) for documentation and retention specifics.

### 3. Integrity controls (§ 164.312(c))

Integrity controls protect ePHI from improper alteration or destruction. The authentication implementation specification is addressable — the covered entity must implement electronic mechanisms to confirm data has not been altered in transit or storage.

In practical terms, integrity controls cover:

- Checksums or hashes that detect file tampering
- Version control on clinical documents
- Detecting man-in-the-middle modification during transmission

Vendors that offer SFTP transfers with checksum verification, or applications with cryptographic signing of records, address this specification.

### 4. Transmission security (§ 164.312(e))

ePHI transmitted across open networks must be protected. The encryption implementation specification is addressable, but the guard against unauthorized access during transmission is required.

The practical implication: sending unencrypted ePHI by email over the open internet is a Security Rule violation unless the covered entity has documented a reasonable alternative safeguard. TLS encryption during transmission (HTTPS, SMTPS, FTPS) addresses this specification. Unencrypted FTP, plain HTTP, and standard SMS do not.

## Required vs. addressable: what the distinction means

The Security Rule divides implementation specifications into "required" and "addressable." Required specifications must be implemented as stated. Addressable specifications must be either:

1. Implemented as stated, or
2. Implemented with an equivalent alternative, or
3. Not implemented — but only if the specification is not reasonable and appropriate, and that conclusion is documented in writing

"Addressable" does not mean optional. OCR breach investigations treat undocumented decisions not to encrypt as evidence of inadequate safeguards. NIST SP 800-66r2 recommends implementing encryption in most circumstances and treating the rare exception as the genuine edge case it is.

## Which non-clinical tools become ePHI systems

Healthcare teams commonly undercount ePHI systems because attention concentrates on the EHR. Any tool that receives patient-linked data — even incidentally — is an ePHI system and must meet Security Rule requirements.

Common non-clinical ePHI systems:

| Tool type | How ePHI enters |
|-----------|----------------|
| Task / project management | Patient names or identifiers in task titles, comments, attachments |
| Cloud storage | Scanned records, authorization forms, lab results |
| Email | Prior auth requests, patient inquiries, referral coordination |
| Scheduling software | Patient name + appointment context |
| Fax-to-email services | Incoming clinical documents |
| VoIP / messaging | Clinical coordination messages with patient context |

Each of these requires a BAA with the vendor, meets access control and audit log standards, and applies transmission security when sending data. For a broader look at workflow-level ePHI exposure, see [PHI in Email](/learn/phi-workflows/phi-in-email) and [PHI in AI Tools](/learn/phi-workflows/phi-in-ai-tools).

## Putting it together for a small clinic

A small clinic implementing the technical safeguards should work through each system category:

1. Enumerate every system that could receive patient-linked data
2. Confirm each has a signed BAA
3. Verify unique user identification and role-based access
4. Confirm audit logs capture content-level access, not just logins
5. Confirm transmission is encrypted (TLS at minimum)
6. Document any addressable specification where an alternative approach is taken

This process is part of the risk analysis required at 45 CFR § 164.308(a)(1). For the full compliance program picture, visit [/hipaa](/hipaa).
