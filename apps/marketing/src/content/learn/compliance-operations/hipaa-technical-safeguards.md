---
title: "HIPAA Technical Safeguards: What Small Clinics Need"
seoTitle: "HIPAA Technical Safeguards for Small Clinics"
description: "What the HIPAA Security Rule requires under technical safeguards, which standards are required versus addressable, and practical starting points for small medical practices."
metaDescription: "HIPAA technical safeguards explained: access controls, audit controls, integrity controls, and transmission security under 45 CFR 164.312."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "HIPAA technical safeguards are the technology and policy controls a covered entity uses to protect ePHI from unauthorized access, alteration, and interception. They are defined at 45 CFR 164.312 and include access controls, audit controls, integrity controls, and transmission security. Most standards within this section are required; several implementation specifications are addressable, meaning the clinic must implement them or document an equivalent alternative."
keyTakeaways:
  - "Technical safeguards apply to all systems that create, receive, maintain, or transmit ePHI — not just the EHR."
  - "Access control, audit control, integrity, and transmission security are the four core standards under 45 CFR 164.312."
  - "Addressable specifications must be implemented or the clinic must document why an equivalent alternative achieves the same protection."
  - "A risk analysis is required before a clinic can rationally decide which technical controls are proportionate to its actual risk."
  - "Technical safeguards alone do not complete a HIPAA Security Rule compliance program — they work in combination with administrative and physical safeguards."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 164.312 — Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS OCR"
  - title: "NIST SP 800-66 Rev. 2"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "Are technical safeguards the same thing as cybersecurity?"
    a: "They overlap significantly but are not the same concept. HIPAA technical safeguards are a specific regulatory category defined at 45 CFR 164.312. Cybersecurity is a broader discipline. A clinic can satisfy HIPAA's technical safeguard requirements with controls that would look minimal by general cybersecurity standards, but a risk analysis that honestly scores the threats the clinic faces may conclude that stronger controls are warranted."
  - q: "Does every small clinic need to encrypt its data?"
    a: "Encryption of data at rest and in transit are addressable implementation specifications under 45 CFR 164.312. This means encryption is not mandated by the rule's text, but a clinic must implement it unless it documents a reasonable and appropriate alternative. Given current threat levels and the cost of encryption being near zero on most modern systems, most clinics cannot justify skipping it."
  - q: "What counts as an access control under HIPAA?"
    a: "Access controls under 45 CFR 164.312(a) include unique user identification, emergency access procedures, automatic logoff, and encryption and decryption. The first two are required specifications; the latter two are addressable. The practical starting point for most clinics is ensuring that every user has a unique login and that shared credentials are eliminated."
---

HIPAA's technical safeguards standard sits at 45 CFR 164.312. It applies to any electronic protected health information — ePHI — that a covered entity or business associate creates, receives, maintains, or transmits.

The standard does not apply only to the EHR. If the clinic uses a task management tool, intake form software, document repository, or billing platform that touches ePHI, those systems also fall within scope.

## The four standards

### Access controls (164.312(a)(1))

Required: Unique user identification (§164.312(a)(2)(i)) — each user gets their own login credentials. No shared accounts on PHI-bearing systems.

Required: Emergency access procedures (§164.312(a)(2)(ii)) — a documented method for obtaining access to ePHI during an emergency when normal controls are unavailable.

Addressable: Automatic logoff (§164.312(a)(2)(iii)) — workstations should log users out after a period of inactivity. Virtually every clinic should implement this.

Addressable: Encryption and decryption (§164.312(a)(2)(iv)) — the ability to encrypt ePHI at rest and decrypt it when authorized users need access.

### Audit controls (164.312(b))

Required. The covered entity must implement hardware, software, or procedural mechanisms that record and examine activity on systems containing ePHI. This is the foundation of a defensible audit trail. See [HIPAA audit log requirements for small clinics](/learn/compliance-operations/hipaa-audit-log-requirements-small-clinics) for what that looks like in practice.

### Integrity (164.312(c)(1))

Required: Implement policies and procedures to protect ePHI from improper alteration or destruction. This standard — the integrity requirement itself — is required.

Addressable: Mechanism to authenticate ePHI (§164.312(c)(2)) — electronic mechanisms to corroborate that ePHI has not been altered or destroyed in an unauthorized manner. The specific electronic mechanism is addressable: clinics must implement it or document an equivalent alternative. In practice, this means checksums, cryptographic hashing, or file-integrity verification on any system storing ePHI.

### Transmission security (164.312(e))

Required: Implement technical security measures to prevent unauthorized access to ePHI being transmitted over an electronic communications network (§164.312(e)(1)).

Addressable: Integrity controls — security measures to ensure that electronically transmitted ePHI is not improperly modified without detection (§164.312(e)(2)(i)).

Addressable: Encryption of ePHI in transit (§164.312(e)(2)(ii)). For most clinics transmitting ePHI over the public internet, TLS-encrypted connections are the standard approach.

## Required versus addressable

Required specifications must be implemented. No alternative is permitted.

Addressable specifications must also be implemented unless the covered entity documents that: (a) the implementation specification is not reasonable and appropriate given the clinic's environment, and (b) the clinic has implemented an equivalent alternative. The word "addressable" does not mean optional.

In practice, most small clinics should implement all of the addressable specifications above. The cost of TLS and automatic logoff is near zero. A risk analysis that concludes either is disproportionate to risk will be difficult to defend.

## Where technical safeguards connect to everything else

Technical safeguards are one of three Security Rule pillars. Administrative safeguards ([hipaa-administrative-safeguards](/learn/compliance-operations/hipaa-administrative-safeguards)) establish the organizational and training framework. Physical safeguards ([hipaa-physical-safeguards](/learn/compliance-operations/hipaa-physical-safeguards)) govern facility access and workstation use. Technical controls operate within the boundaries those other two pillars define.

A risk analysis under 45 CFR 164.308(a)(1) is what connects all three. Without it, a clinic cannot rationally determine which technical controls are proportionate to its actual threat environment.
