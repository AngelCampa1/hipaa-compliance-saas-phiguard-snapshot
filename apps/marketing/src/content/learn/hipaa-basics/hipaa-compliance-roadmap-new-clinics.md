---
title: "HIPAA Roadmap for New Clinics"
description: "A concrete 90-day HIPAA compliance roadmap for a new medical clinic or a practice establishing a formal compliance program for the first time. Covers officer designation, policies, training, BAAs, and risk analysis."
metaDescription: "New clinic HIPAA roadmap: what to build in the first 90 days. Privacy Officer, BAAs, policies, training, and risk analysis - in order of priority."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: hipaa-basics
schemaType: article
intent: awareness
summary: "A new covered entity needs four things to establish a functional HIPAA compliance program: a designated Privacy Officer, written policies, executed BAAs with all business associates, and a documented risk analysis. This 90-day roadmap sequences those priorities. It helps clinics turn HIPAA requirements into assigned owners, recurring reviews, dated evidence, and practical controls that can be explained during an OCR inquiry."
keyTakeaways:
  - "The first step is designation - name a Privacy Officer (required by 45 CFR Section  164.530(a)) and a Security Officer (required by 45 CFR Section  164.308(a)(2)) before anything else."
  - "BAAs must be in place before any vendor accesses PHI - not after go-live."
  - "HIPAA training for all workforce members must be completed before staff handle PHI - not during onboarding, before."
  - "The risk analysis (45 CFR Section  164.308(a)(1)) is the foundational compliance document - everything else in the security program flows from what the risk analysis identifies."
  - "The most expensive compliance mistake is skipping documentation - running a functional program without written evidence of it."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-evidence-binder-checklist
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR Section  164.530 - Administrative Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.530"
    publisher: "eCFR"
  - title: "HIPAA Security Rule - 45 CFR Section  164.308"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "Guidance on Risk Analysis"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html"
    publisher: "HHS"
  - title: "NIST SP 800-66 Rev. 2 - Implementing the HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "When does HIPAA apply to a new clinic?"
    a: "HIPAA applies to a covered entity from the time it begins creating, receiving, maintaining, or transmitting PHI. There is no grace period for new providers. The obligation to comply begins with operations, not after some initial period."
  - q: "Do we need a HIPAA attorney to set up our compliance program?"
    a: "Not necessarily. Many small clinics build their initial compliance programs using published HHS guidance, commercially available policy templates, and compliance software without outside counsel. Legal review is advisable for BAA templates and when incidents occur. The core documentation - policies, training, BAA inventory, risk analysis - can be built by the Privacy Officer without an attorney."
  - q: "What is the most common mistake new clinics make?"
    a: "Going live on an EHR or patient-facing system before executing BAAs with the vendors. A clinic that begins seeing patients on Day 1 using an EHR they haven't signed a BAA with has a compliance violation from the first day of operations."
  - q: "How often does the risk analysis need to be repeated?"
    a: "HIPAA does not specify a frequency, but the risk analysis must be reviewed and updated to reflect changes in the operating environment - new systems, new vendors, new locations, organizational changes, or security incidents. An annual review is standard practice."
---

A medical clinic that has never had a formal HIPAA compliance program - whether because it just opened, was recently acquired, or has operated without one - needs four things in place before it can claim compliance: designated officers, written policies, executed agreements, and a documented risk analysis. This 90-day roadmap sequences those priorities.

## Before Day 1: Understand What You Are

A covered entity under HIPAA is a healthcare provider that transmits health information in electronic form in connection with certain HIPAA-covered transactions. This includes virtually all medical clinics that bill insurance, use electronic health records, or exchange referrals electronically. If you treat patients and use any electronic system involving their health information, you are almost certainly a covered entity.

## Week 1: Designate Officers and Take Inventory

### Designate a Privacy Officer and Security Officer

Every covered entity must designate a Privacy Officer (45 CFR Section  164.530(a)), an individual responsible for developing and implementing privacy policies and procedures. Every covered entity must also designate a Security Officer (45 CFR Section  164.308(a)(2)), an individual responsible for the security policies and procedures.

In small clinics, one person often holds both roles. That is fine. Make the designation formal: put it in writing, name the person, and confirm they understand what each role requires.

### Inventory PHI Systems and Vendors

Before you can protect PHI, you need to know where it lives. Spend Week 1 identifying:

- Every software system that stores or processes patient information (EHR, scheduling, billing, patient portal, answering service platform)
- Every external vendor or service provider who receives or could receive PHI (labs, referral services, billing companies, cloud backup, cleaning services that handle paper records)
- Every category of PHI the clinic creates or receives (demographics, clinical notes, billing records, lab results, imaging)

This inventory becomes the input for the risk analysis.

## Weeks 2-4: Agreements and Policies

### Execute BAAs Before Any Vendor Touches PHI

HIPAA requires a signed Business Associate Agreement (BAA) with every vendor who handles PHI before that vendor accesses PHI. There is no grace period.

Common vendors that require BAAs before go-live:
- EHR vendor
- Medical billing company or clearinghouse
- Cloud backup service storing any PHI
- Scheduling software with patient name and appointment data
- Answering service that takes patient messages
- Email provider (if used for patient communication)
- Lab or imaging referral portals

Do not let vendors tell you a BAA isn't needed because "they don't store clinical data." If the vendor processes patient names in a healthcare context, ask the BAA question explicitly and get the answer in writing.

### Adopt Written HIPAA Policies

The Privacy Rule and Security Rule each require written policies covering specific areas. New clinics can start with commercially available policy templates and adapt them to their actual operations. Drafting policies from scratch is not required.

Required policy areas include:

**Privacy Rule:**
- Privacy policy (how PHI is used and disclosed)
- Notice of Privacy Practices (patient-facing document)
- Patient rights procedures (right of access, right to amend, right to restrict)
- Minimum necessary policy
- Workforce sanction policy
- Complaint procedures

**Security Rule:**
- Access control policy (who can access what systems)
- Workforce security and clearance procedures
- Workstation use policy
- Device and media disposal policy
- Emergency access procedure
- Incident response procedure

Adopted policies must be reviewed, approved, and distributed to the workforce before operations begin.

## Month 2: Training and Technical Safeguards

### Complete Initial HIPAA Training

All workforce members must receive HIPAA training appropriate to their job responsibilities (45 CFR Section  164.530(b)) and must complete this training before handling PHI.

A new employee who accesses the EHR before completing training is a compliance gap from day one.

Training must be documented. Maintain a training log that records each employee's name, role, the training content covered, and the completion date with a signature or attestation.

### Configure Access Controls

Every PHI system should be configured with:

- Unique user credentials for every workforce member (no shared logins)
- Role-based access limiting each user to the PHI necessary for their job
- Automatic session timeout after a defined period of inactivity
- Audit logging enabled (confirm with each vendor that logging is active)
- Multi-factor authentication where supported

These configurations take time to implement and should be completed before staff begin regular operations.

## Month 3: Risk Analysis and Documentation Structure

### Complete a Documented Risk Analysis

The risk analysis (45 CFR Section  164.308(a)(1)(ii)(A)) is the Security Rule's foundational compliance document. Its absence appears in nearly every OCR enforcement resolution.

A HIPAA risk analysis must:

1. Identify all ePHI systems and the PHI they contain
2. Identify realistic threats to the confidentiality, integrity, and availability of that ePHI (ransomware, employee error, device theft, natural disaster, vendor breach)
3. Identify vulnerabilities in current controls that could be exploited by those threats
4. Assess the likelihood and potential impact of each threat/vulnerability pair
5. Prioritize risks for remediation
6. Produce a written risk management plan describing how identified risks will be addressed

This document must be written. A mental checklist does not satisfy the requirement.

### Establish the Evidence Binder

Before the end of Month 3, organize the clinic's compliance documentation into a structure that can be retrieved quickly:

| Section | Contents |
|---|---|
| Officers | Privacy Officer and Security Officer designations (written, dated) |
| Policies | All current privacy and security policies with version dates |
| Notice of Privacy Practices | Current version plus distribution records |
| BAAs | Executed BAA for each business associate, organized by vendor |
| Training Records | Log of all workforce training completions |
| Risk Analysis | Most recent risk analysis and risk management plan |
| Incidents | Log of all security incidents and their disposition |
| Access Reviews | Records of periodic access control reviews |

This does not need to be sophisticated. A well-organized shared folder with clear naming conventions and access limited to the Privacy Officer is sufficient for a new clinic.

## Common Mistakes in the First 90 Days

**Going live before BAAs are signed.** The most common compliance failure for new clinics. Vendor selection, contract negotiation, and BAA execution should happen before operations begin. Not after patients are already in the system.

**Using templates without adaptation.** Commercially available policy templates are a valid starting point. They must be reviewed to confirm they match the clinic's actual operations. A policy that describes procedures the clinic doesn't follow puts OCR in the position of comparing your written program against your real one - that gap is a finding on its own.

**Training one person and considering it done.** HIPAA training applies to every workforce member who handles PHI - front desk staff, medical assistants, billing staff, providers. A clinic where only the Privacy Officer has formal training on record has an untrained workforce under HIPAA.

**Skipping the risk analysis.** The risk analysis is due from the beginning of operations. Its absence is the finding that appears in almost every enforcement case.

**No documentation of anything.** A clinic can run a genuinely careful operation and still face findings if it has no written evidence. When OCR asks for training records, policy version history, or BAA copies, the inability to produce them creates findings regardless of what the clinic actually did day to day.

The first 90 days are the foundation. Designated officers, written policies, executed BAAs, documented risk analysis - get those four in place and the program has something real to build on.
