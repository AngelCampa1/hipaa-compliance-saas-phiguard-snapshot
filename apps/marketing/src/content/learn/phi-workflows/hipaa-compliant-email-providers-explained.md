---
title: "HIPAA Compliant Email Providers: What to Look For"
seoTitle: "HIPAA Compliant Email Providers Explained"
description: "What makes an email provider HIPAA compliant, which providers offer BAAs, and how to evaluate options for a small medical clinic."
metaDescription: "HIPAA compliant email requires a BAA, encryption, and audit logging. Learn what to look for and how major email providers stack up for clinics."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "consideration"
summary: "Email that carries PHI is subject to HIPAA's Privacy and Security Rules. A compliant email provider must sign a Business Associate Agreement, support encryption in transit and at rest, and provide audit logging. Most major consumer email platforms offer BAAs only on paid or enterprise plans, which affects how small clinics evaluate their options."
keyTakeaways:
  - "Any email system that transmits or stores PHI on behalf of a covered entity must have a signed BAA."
  - "Encryption in transit (TLS) and at rest are the two core technical requirements for email carrying PHI."
  - "Consumer-grade email accounts — even from established providers — typically do not offer BAAs without upgrading to a paid plan."
  - "End-to-end encryption and message expiration are worth evaluating but are not mandated by the Security Rule."
  - "A signed BAA alone does not make an email system compliant — the clinic's use practices must also match the provider's security configuration."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Summary of the HIPAA Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html"
    publisher: "HHS"
  - title: "Guidance on HIPAA and Cloud Computing"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.312(e) — Transmission Security"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
faq:
  - q: "Can clinics use Gmail for HIPAA compliant email?"
    a: "Google Workspace (formerly G Suite) offers a BAA as part of paid plans. A free @gmail.com account does not come with a BAA and cannot be used for PHI. With the right Workspace plan and configuration, Gmail can be used compliantly."
  - q: "Does TLS encryption satisfy HIPAA's transmission security requirement?"
    a: "TLS in transit addresses the transmission security implementation specification at 45 CFR § 164.312(e). However, TLS only protects the message during transmission — not after delivery. At-rest encryption is a separate consideration."
  - q: "What is the minimum a HIPAA compliant email provider must offer?"
    a: "A signed BAA, TLS encryption in transit, encryption at rest, and audit logging are the baseline requirements. Some providers add end-to-end encryption or message recall, which can reduce risk further."
  - q: "Is a secure patient portal the same as HIPAA compliant email?"
    a: "No. Secure patient portals use encrypted web sessions for communication. They are not email in the traditional sense and are often a safer alternative for clinical communication with patients."
---

Email is one of the highest-risk channels for PHI exposure in a small clinic. It is also one of the most necessary. Prior authorizations, referral coordination, lab result notifications, and billing inquiries all move through email in most practices.

A HIPAA compliant email provider is not a specific product category — it is any email provider that meets the Privacy and Security Rule requirements when the clinic configures and uses it correctly.

## The BAA requirement

The first and most important criterion: the email provider must sign a Business Associate Agreement (BAA) before the clinic uses that service to send, receive, or store PHI.

Email providers that process email on your behalf are business associates under HIPAA. The BAA establishes the legal framework for how they handle PHI, what safeguards they maintain, and what they must do in the event of a breach.

Most consumer email accounts do not include a BAA. Even well-known providers with strong security track records are not compliant without that signed agreement. The BAA tier or plan level varies by provider.

## What the Security Rule requires for email

The HIPAA Security Rule at 45 CFR § 164.312(e) requires transmission security for ePHI sent across open networks. The implementation specifications are:

- **Encryption in transit (addressable)** — TLS encryption during transmission. This is the baseline for all major email providers operating over SMTP.
- **Integrity controls (required)** — mechanisms to ensure ePHI has not been improperly modified during transmission

At-rest encryption — protecting stored messages on the server — is addressed under the access control and integrity requirements. Most enterprise email platforms provide at-rest encryption, but it should be confirmed before assuming.

## Provider evaluation criteria

When evaluating an email provider for clinical use, work through this list:

### 1. BAA availability and cost
Which plan tier includes the BAA? An enterprise-only BAA prices many small clinics out of compliance with that provider.

### 2. Encryption in transit
TLS is the standard. Confirm the provider enforces TLS for outbound and inbound connections. Opportunistic TLS — which falls back to unencrypted transmission if the recipient does not support TLS — is less reliable than enforced TLS.

### 3. Encryption at rest
Confirm that stored messages are encrypted at the server level. This matters if the provider is breached.

### 4. Audit logging
Does the provider log access to mailboxes — including by administrators? Security Rule audit requirements apply to ePHI at rest, which includes stored email.

### 5. Admin access controls
Can you enforce multi-factor authentication, restrict admin access, and manage off-boarding? Email accounts of departed staff that remain active are a routine compliance gap.

### 6. Data residency and subprocessors
Does the provider process email through subcontractors? If so, are those subcontractors covered under the BAA? Cloud email providers often route messages through regional data centers, and the BAA should cover those downstream processors.

## Comparison of major providers' BAA approach

| Provider | BAA available? | Plan required |
|----------|---------------|---------------|
| Google Workspace | Yes | Paid Workspace plan |
| Microsoft 365 | Yes | Business or Enterprise plan |
| Paubox | Yes | Core offering (healthcare-focused) |
| Free Gmail / Outlook.com | No | N/A — no BAA offered |

This table reflects general product positioning as of publication. Confirm current terms with each vendor before signing a BAA. ProtonMail does not offer a standard BAA for covered entities and should not be used for PHI without explicit legal guidance confirming compliance eligibility.

## What a BAA does not fix

A signed BAA does not make every email use compliant. The clinic's own practices must match:

- Staff should not put unnecessary PHI in email subject lines — subject lines may not be encrypted in transit
- Auto-forwarding to personal accounts routes PHI outside the BAA coverage
- Sending PHI to a patient's consumer email address (without patient consent and acknowledgement) may still constitute a disclosure under the Privacy Rule
- Reply-all threads can expand PHI distribution beyond intended recipients

The minimum necessary standard also applies. Only the information required for the communication purpose should be included. For the broader context of PHI in email workflows, see [PHI in Email](/learn/phi-workflows/phi-in-email).

## Alternatives worth considering

For clinical team communication, secure messaging platforms designed for healthcare are an alternative to standard email. They offer persistent message audit logs, automatic expiration, and BAA coverage without the configuration overhead of enterprise email. For patient-facing communication, a secure patient portal is generally preferable to email.

For how vendor selection and BAA management fits into a full compliance program, see [When a Vendor Needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) and the PHIGuard compliance overview at [/hipaa](/hipaa).
