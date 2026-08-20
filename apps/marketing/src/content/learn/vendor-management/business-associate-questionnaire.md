---
title: "Business Associate Review Questionnaire"
description: "A step-by-step guide for small clinics on vetting vendor security controls through a structured questionnaire - what to ask, how to evaluate responses, and how to document the review."
metaDescription: "Learn what questions to include in a vendor security questionnaire for HIPAA compliance and how to document business associate reviews."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: vendor-management
schemaType: article
intent: consideration
summary: "Signing a BAA establishes a contractual obligation. A vendor security questionnaire verifies whether the vendor actually has the controls to back it up. Small clinics that skip vendor reviews leave a documented gap in their Security Rule compliance program. It helps clinics evaluate vendor promises against BAA terms, PHI access, subcontractors, retention, incident support, and evidence they can actually review."
keyTakeaways:
  - "The HIPAA Security Rule expects covered entities to obtain reasonable assurance that business associates will protect PHI - a signed BAA alone does not satisfy this expectation."
  - "A vendor questionnaire should cover at minimum: encryption, access controls, audit logging, subprocessors, incident response, third-party assessments, and AI data handling."
  - "Unacceptable answers - encryption gaps, no audit logs, unidentified subprocessors - are grounds to require remediation before continuing the relationship."
  - "Questionnaire responses and your evaluation of them are compliance evidence. Store them with the executed BAA."
  - "SOC 2 Type II and HITRUST reports are acceptable substitutes for a full questionnaire for vendors who maintain current certifications."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: vendor-renewal-review-checklist
relatedCommercialPath: /pricing
sources:
  - title: "Business Associates Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "Guidance on HIPAA and Cloud Computing"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html"
    publisher: "HHS"
  - title: "45 CFR Section  164.308(b) - Business Associate Contracts and Other Arrangements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
faq:
  - q: "Do we have to send a questionnaire to every vendor?"
    a: "Not necessarily. The depth of review should be proportional to the volume and sensitivity of PHI the vendor handles. Major vendors - EHR, billing clearinghouse, cloud storage - warrant a full questionnaire. Lower-volume relationships may be satisfied by reviewing the vendor's published security documentation or requesting a SOC 2 summary. What matters is that the review is documented."
  - q: "What if a vendor refuses to answer our questionnaire?"
    a: "A vendor who refuses to provide any security information is a material risk. You may accept a current SOC 2 Type II or HITRUST certification as a substitute for a direct questionnaire response. If the vendor cannot provide either, that refusal itself is a finding that should inform whether you continue the relationship."
  - q: "How often should we re-send the questionnaire?"
    a: "Annual review is reasonable for most vendor relationships. Re-send sooner if the vendor discloses a security incident, announces an acquisition, or adds AI features that change how PHI is processed."
---

A Business Associate Agreement is a contract. It creates legal obligations, but it does not tell you whether the vendor has the technical and administrative controls to meet those obligations. That is what a vendor security questionnaire is for.

Many small clinics skip this step, either because they do not know it is expected, or because they assume a vendor who agreed to sign a BAA is therefore compliant. The HIPAA Security Rule (45 CFR Section  164.308(b)) requires covered entities to obtain satisfactory assurance that business associates will appropriately safeguard PHI. A signature on a contract does not satisfy that standard on its own.

## Why the Security Rule expects a review

The Security Rule does not prescribe exactly what form a vendor security review must take, but it does require covered entities to take steps proportional to the risk a vendor relationship creates. HHS's business associates guidance makes clear that due diligence before and during a business associate relationship is part of a compliant program.

For OCR auditors and investigators, a documented vendor review is evidence that the clinic took the requirement seriously. For clinics that experience a vendor-caused breach, documented reviews demonstrate a reasonable compliance posture - which can affect penalty outcomes.

## The seven areas every questionnaire should cover

### 1. Encryption

PHI must be protected in transit and at rest. The questionnaire should establish exactly what encryption is in place and at what standard.

Questions to ask:
- Is PHI encrypted at rest What encryption algorithm and key length
- Is PHI encrypted in transit What transport protocol (TLS 1.2+, TLS 1.3)
- Who holds the encryption keys - the vendor, a key management service, or the customer
- Is any PHI stored in a non-encrypted form at any point in the processing chain (for example, in temporary files, logs, or backup archives)

**Acceptable response:** PHI encrypted at rest with AES-256, in transit with TLS 1.2 or 1.3, keys managed by a dedicated key management service, no PHI in non-encrypted buffers.

**Red flag:** "We use industry-standard encryption" without specifics. Require specifics.

### 2. Access controls

PHI access should be limited to personnel who need it to do their job.

Questions to ask:
- Does the vendor use role-based access controls for staff who can access PHI
- How is access provisioned and de-provisioned when staff join or leave
- Does the vendor use multi-factor authentication for access to systems that store or process PHI
- What is the vendor's policy for privileged access (database administrators, DevOps staff who can access raw data)

**Acceptable response:** Role-based access, MFA required, documented on/off-boarding, privileged access reviewed at least quarterly.

**Red flag:** No MFA, shared credentials for PHI-touching systems, or access rights that have not been reviewed since initial setup.

### 3. Audit logging

The vendor should maintain records of who accessed PHI, when, and what they did.

Questions to ask:
- Does the vendor log access to PHI at the application and infrastructure layer
- How long are access logs retained
- Are logs tamper-evident or stored in an immutable format
- Can logs be provided to the clinic in the event of a breach investigation

**Acceptable response:** Logs retained for a minimum of six years (HIPAA documentation retention standard), stored in a tamper-evident or append-only log system, available for incident investigation upon request.

**Red flag:** Logs retained for 30 or 60 days, no log integrity controls, or inability to produce access records for a specific data set in an investigation scenario.

### 4. Subprocessors

A vendor who passes PHI to a subcontractor without equivalent protections in place creates a compliance gap, regardless of what the vendor's own BAA says.

Questions to ask:
- Who are the vendor's subprocessors who may have access to PHI
- Does each of those subprocessors have a BAA with the vendor
- Does the vendor notify customers when they add or change subprocessors

**Acceptable response:** Named subprocessors, confirmed BAA coverage for each, and a notification commitment for changes.

**Red flag:** "We use various third-party providers" without names, or a BAA that does not address subcontractor obligations.

### 5. Incident response and breach notification

The BAA defines the vendor's obligation to notify you of a breach, but the questionnaire should confirm they have the operational capability to detect and report incidents.

Questions to ask:
- Does the vendor have a documented incident response plan
- What is the vendor's internal process for detecting a PHI breach
- What is the vendor's notification timeline to covered entities after a breach is confirmed (Note: HIPAA requires notification "without unreasonable delay," and many vendor BAAs set this at 60 days - but your own notification obligation runs from the point your vendor notifies you.)
- Has the vendor experienced a breach or security incident in the past 24 months If so, what was the nature of the incident and what remediation was performed

**Acceptable response:** Written incident response plan, detection capability (monitoring, SIEM), notification within 15-30 days of discovery, willingness to disclose prior incidents with remediation summary.

**Red flag:** No documented incident response plan, notification timeline exceeding 30 days, refusal to disclose prior incidents.

### 6. Third-party security assessments

Most clinics lack the technical staff to audit a vendor's security controls directly. Third-party certifications substitute for that audit.

Questions to ask:
- Has the vendor had a third-party security assessment in the past 12 months
- Can the vendor share a SOC 2 Type II report summary or bridge letter
- Is the vendor HITRUST certified
- Has the vendor had a penetration test in the past 12 months Can they share a remediation summary

**Acceptable response:** Current SOC 2 Type II (not just Type I), willing to share the report or an executive summary under NDA.

**Red flag:** Only a self-assessment, a SOC 2 Type I (which covers design of controls, not operating effectiveness), or certifications that have lapsed.

### 7. AI and model training

This category is now required for any vendor whose product includes AI-powered features.

Questions to ask:
- Does your product use PHI to train, fine-tune, or improve machine learning models
- Does your product transmit PHI to a third-party AI provider to generate responses or features If so, who
- Is patient data used in any aggregated or de-identified form for model training If so, describe the de-identification method and whether it meets the HIPAA Safe Harbor or Expert Determination standard under 45 CFR Section  164.514(b).
- Can AI-assisted features be disabled for specific users or roles

**Acceptable response:** PHI not used for model training, any third-party AI providers named and covered under the vendor's BAA, de-identification method meets HIPAA standard if aggregated use occurs.

**Red flag:** "We de-identify data before using it for training" without a description of the method. "De-identified" under HIPAA has a specific meaning: either Safe Harbor (removal of 18 enumerated identifiers) or Expert Determination. A vendor who cannot explain their de-identification method may not be meeting the standard.

## Template questionnaire structure

A practical questionnaire does not need to be long. For most vendor relationships, a one-page document covering these seven areas with a 30-day response deadline is sufficient. Use a structured format with explicit yes/no questions followed by an explanation field:

```
1. Is PHI encrypted at rest and in transit (Y/N)
   If yes, describe the method and standard:

2. Is multi-factor authentication required for staff with PHI access (Y/N)
   If no, describe your access control method:

3. Does the vendor retain PHI access logs for a minimum of six years (Y/N)
   If no, describe your log retention policy:

4. List all subprocessors with access to PHI:

5. Does the vendor have a current SOC 2 Type II report or equivalent (Y/N)
   If yes, can you share a summary under NDA

6. Does the vendor use PHI to train or improve AI models (Y/N)
   If yes, describe the de-identification method applied:

7. What is your notification timeline for PHI breaches to covered entities
```

Send the questionnaire by email and request a response in writing from a named individual with authority to speak on compliance matters - not a generic support ticket.

## Evaluating responses

Flag any answer that falls into one of these categories:

- **Encryption gap:** PHI is stored or transmitted without encryption at any point.
- **Access control gap:** No MFA, no role-based access, or no de-provisioning process.
- **Logging gap:** Logs retained for fewer than six years or unavailable for investigation.
- **Unnamed subprocessors:** Vendor cannot identify who handles PHI downstream.
- **Breach notification delay:** Vendor BAA or policy sets notification beyond 30 days after discovery.
- **AI training without adequate de-identification:** Vendor uses PHI or imprecisely de-identified data for model development.
- **No third-party assessment:** Vendor relies on self-assessment only.

For flagged items, request remediation or clarification before finalizing the relationship. Document what was flagged, what the vendor provided in response, and the basis for any acceptance decision.

## When to involve legal counsel

For major vendor relationships - your EHR, your billing clearinghouse, your cloud storage provider, any vendor processing more than a few hundred patients' PHI - have HIPAA legal counsel review both the BAA and the questionnaire responses. This is particularly important when a vendor's questionnaire reveals gaps that require negotiated remediation terms.

For smaller, lower-PHI-volume vendor relationships, the practice administrator can handle the questionnaire review, with legal counsel consulted only when the review surfaces material concerns.

## Storing the documentation

Store each completed questionnaire alongside the executed BAA. Date the review, note who sent the questionnaire, note who at the vendor responded, and note the outcome of the evaluation. This file is compliance evidence - it demonstrates that the clinic performed a documented vendor review, not just signed a contract.

When you re-send a questionnaire at annual review, store the new response alongside prior responses. If a breach investigation follows, showing how a vendor's security posture changed over time is useful context that a single snapshot cannot provide.
