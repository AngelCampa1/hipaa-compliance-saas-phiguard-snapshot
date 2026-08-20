---
title: "HIPAA Technical Safeguards Checklist for Small Clinics"
seoTitle: "HIPAA Technical Safeguards Checklist"
description: "A practical checklist of HIPAA technical safeguards under 45 CFR 164.312. Covers access controls, audit controls, integrity, authentication, and transmission security for small clinics."
metaDescription: "HIPAA technical safeguards checklist. 45 CFR 164.312 controls including access, audit logs, integrity, authentication, and transmission security."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "The HIPAA Security Rule's technical safeguards govern how systems control access, log activity, authenticate users, and protect PHI in transit. This article translates 45 CFR 164.312 into a 24-item checklist for small clinics. It helps clinics turn HIPAA requirements into assigned owners, recurring reviews, dated evidence, and practical controls that can be explained during an OCR inquiry."
keyTakeaways:
  - "Technical safeguards under 45 CFR 164.312 cover five standards: access control, audit controls, integrity, person or entity authentication, and transmission security."
  - "Unique user identification is required, not addressable. Shared logins are a hard non-compliance finding."
  - "Audit controls require both the technical capability to record activity and a documented review cadence."
  - "Encryption is addressable, but a clinic that decides not to encrypt PHI at rest or in transit must document a defensible alternative."
  - "Automatic logoff is addressable; for a small clinic with shared workstations, a fifteen-minute timeout is the usual safe baseline."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR 164.312 - Technical safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "Electronic Code of Federal Regulations"
  - title: "HIPAA Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Is encryption required by HIPAA?"
    a: "Encryption of PHI at rest and in transit is an addressable specification under 45 CFR 164.312. A covered entity may decline to encrypt only if it documents an equivalent alternative. In practice, encryption is the only defensible answer because unencrypted PHI lost in a breach is not eligible for the safe harbor under the breach notification rule."
  - q: "How long should HIPAA audit logs be retained?"
    a: "The Security Rule does not set a specific retention period for audit log content, but Security Rule documentation must be retained for six years. Most clinics retain technical audit logs for at least six years to align with the documentation rule and to support breach investigations."
  - q: "Does HIPAA require multi-factor authentication?"
    a: "MFA is not named in the regulation. The authentication standard requires verifying that a person seeking access is the one claimed. After the 2024 NPRM and continued OCR guidance on phishing-driven breaches, MFA is the de facto expectation for any remote access to PHI."
---

## What the technical safeguards standard actually requires

Technical safeguards are the controls a clinic builds into its software, networks, and devices. They sit in 45 CFR 164.312 and answer four questions: who is allowed to see this PHI, what did they do with it, how do we know it has not been altered, and how do we keep it safe when it leaves our walls.

The five standards are:

- Access control (164.312(a))
- Audit controls (164.312(b))
- Integrity (164.312(c))
- Person or entity authentication (164.312(d))
- Transmission security (164.312(e))

Where the physical safeguards reward a walkthrough, the technical safeguards reward a configuration review. An auditor who knows what to ask for can identify most technical gaps in a one-hour screen share.

## Specific requirements and CFR citations

**Access control - 164.312(a)(1).** Required specifications: unique user identification and emergency access procedure. Addressable specifications: automatic logoff and encryption and decryption.

**Audit controls - 164.312(b).** Required: implement hardware, software, or procedural mechanisms that record and examine activity in information systems that contain or use PHI. The standard contains no implementation specifications, which means it is required as written.

**Integrity - 164.312(c)(1).** Addressable specification: mechanism to authenticate electronic PHI. The covered entity must protect PHI from improper alteration or destruction.

**Person or entity authentication - 164.312(d).** Required as written. Verify that a person or entity seeking access to PHI is the one claimed.

**Transmission security - 164.312(e)(1).** Addressable specifications: integrity controls and encryption. The covered entity must guard against unauthorized access to PHI transmitted over an electronic communications network.

## Common gaps in small clinics

The technical-safeguard failure patterns are different from the physical ones. The most common findings:

- A shared front-desk login used by three or four people throughout the day.
- An EHR with audit log capability that nobody has reviewed since installation.
- Email containing PHI sent over an unencrypted connection to a personal Gmail account "just this once."
- Backups stored on a USB drive in a desk drawer with no encryption.
- A terminated employee whose login was disabled in the EHR but still works in the billing portal three months later.
- Remote access to the practice management system without MFA.
- No documented procedure for emergency access when the Security Officer is unreachable.

## Numbered checklist

Run this checklist when onboarding a new system, after any major configuration change, and at least annually as part of the security evaluation under 45 CFR 164.308(a)(8).

1. Every user with access to PHI has a unique user identifier. No shared accounts exist.
2. Service accounts and break-glass accounts are documented, named, and access-restricted.
3. A written emergency access procedure exists and names the personnel authorized to invoke it.
4. Automatic logoff is enabled on every system that displays PHI, with a timeout of fifteen minutes or less.
5. Encryption at rest is enabled on every database, server, laptop, and removable drive that holds PHI, or a written exception with a defensible alternative is on file.
6. Encryption in transit (TLS 1.2 or higher) is enforced on every web application, API, and email gateway that handles PHI.
7. Audit logging is enabled in every system that creates, receives, maintains, or transmits PHI.
8. Audit logs capture user identity, timestamp, action, and the record affected.
9. Audit logs are retained for at least six years and protected from modification.
10. A documented review cadence exists for audit logs (at minimum monthly for high-risk systems).
11. Anomalous-access alerting is configured for the EHR or equivalent (after-hours access, bulk export, access to a record outside the user's panel).
12. Integrity controls protect PHI from improper alteration. For databases this is typically transactional integrity plus audit log immutability.
13. Backups are tested at least quarterly with a documented restore exercise.
14. Backup data is encrypted and stored in a location separate from production.
15. All workforce members authenticate with a unique password meeting documented complexity rules.
16. MFA is required for remote access to any system that holds PHI.
17. MFA is required for any administrative account, regardless of network location.
18. Password reset procedures verify identity before issuing a new credential.
19. Termination triggers an account-disable workflow that removes access from every system within twenty-four hours.
20. Quarterly access reviews verify that every active user still requires the access they hold.
21. Email containing PHI is sent only through an encrypted channel (TLS-enforced or portal-based).
22. File transfers containing PHI use SFTP, HTTPS, or an equivalent encrypted protocol.
23. Inbound and outbound transmissions are logged sufficiently to support a breach investigation.
24. The Security Officer reviews this checklist annually and signs the result.

## Documentation requirements

For technical safeguards specifically, plan to retain:

- Access control policy with the unique-ID rule, emergency access procedure, and timeout settings.
- Audit log policy including review cadence and retention period.
- Encryption standard listing approved algorithms and key management practices.
- Authentication policy including password rules and MFA requirements.
- Transmission security policy covering email, file transfer, and portal use.
- Quarterly access review records and audit log review records.

All retention is six years from creation or last effective date. Logs that contain PHI must be protected with the same controls as the underlying systems and must never be exported into ad hoc spreadsheets.

For the human-process side of the same controls, see the [administrative safeguards checklist](/learn/compliance-operations/hipaa-administrative-safeguards-checklist) and our [workforce access controls article](/learn/compliance-operations/hipaa-workforce-access-controls). If you want a platform that ships these controls and the audit trail wired together, the [PHIGuard HIPAA product](/hipaa) is purpose-built for small clinics.
