---
title: "HIPAA Setup for a New Medical Practice: What to Do Before You Open"
seoTitle: "HIPAA Setup for New Medical Practices"
description: "A phased HIPAA setup guide for new medical practices, covering what must happen before you see your first patient: covered entity status, officer designations, risk analysis, BAAs, training, and your Notice of Privacy Practices."
metaDescription: "New medical practice? This HIPAA setup checklist tells you what to do before day one, in your first 30 days, and at your 90-day review."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
intent: "awareness"
summary: "HIPAA compliance obligations begin before a new practice sees its first patient. This article walks practice owners and office managers through three phases of setup — pre-opening, first 30 days, and 90-day review — covering covered entity status, required officer designations, the initial risk analysis, policy development, BAA execution, workforce training, and the Notice of Privacy Practices."
keyTakeaways:
  - "If your practice bills electronically, you are almost certainly a covered entity under HIPAA — this status triggers the full Privacy Rule and Security Rule on day one."
  - "You must designate a Privacy Officer and a Security Officer before handling PHI; in small practices, one person commonly holds both roles."
  - "A formal risk analysis (45 CFR § 164.308(a)(1)) must be completed and documented before you go live — not as an afterthought after the first audit cycle."
  - "Every vendor, contractor, or cloud service that will touch PHI must have a signed BAA before they receive access to patient data."
  - "All workforce members must receive HIPAA training before they handle any PHI (45 CFR § 164.530(b)); verbal training without documentation does not satisfy the requirement."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/hipaa-basics"
sources:
  - title: "45 CFR Parts 160 and 164 — HIPAA Administrative Simplification"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HHS HIPAA for Professionals"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Does my practice need to comply with HIPAA before we see any patients?"
    a: "Yes. HIPAA compliance is not triggered by the first patient visit — it is triggered by your status as a covered entity. If you have signed a contract with an EHR vendor, a billing service, or any other business associate, you need BAAs in place already. Your Privacy Officer designation and initial risk analysis must be completed before PHI is handled, and PHI handling begins the moment you start entering test or onboarding data into any clinical system."
  - q: "Can the same person be both Privacy Officer and Security Officer?"
    a: "Yes. 45 CFR § 164.530(a) requires designation of a Privacy Official and 45 CFR § 164.308(a)(2) requires a Security Official, but there is no prohibition on a single person holding both roles. In solo and small group practices, the practice owner or office manager typically fills both positions. The key requirement is that the person designated actually understands what each role requires — the obligations of the Privacy Officer differ from those of the Security Officer in meaningful ways."
  - q: "What if we have not completed our risk analysis before opening?"
    a: "Opening without a completed risk analysis is a HIPAA Security Rule violation. The risk analysis required under 45 CFR § 164.308(a)(1) is not optional and has no grace period. If you are already seeing patients and have not conducted one, complete it immediately, document the process and findings, and implement a corrective action plan for any identified gaps. Document that corrective action plan as part of your security management process."
  - q: "Which vendors require a BAA?"
    a: "Any vendor, contractor, or service provider that creates, receives, maintains, or transmits PHI on your behalf is a business associate and requires a BAA before they have access to PHI. This includes: your EHR vendor, practice management software, cloud backup services, billing services, transcription services, answering services that handle patient calls, IT support contractors who can access systems containing PHI, and shredding services. Cloud storage services like generic file sharing platforms also require BAAs if you store PHI there."
  - q: "What goes in a Notice of Privacy Practices?"
    a: "Under 45 CFR § 164.520, your NPP must describe: the types of uses and disclosures your practice may make of PHI; your legal duties with respect to PHI; patient rights (access, amendment, accounting of disclosures, restrictions, confidential communications, and the right to complain); and how to contact your Privacy Officer. The NPP must be provided to patients at their first service date and made available on your website if you have one. HHS provides a model NPP that practices can adapt."
---

Starting a medical practice means building a compliance program from the ground up — before the first appointment is scheduled, before the EHR is loaded with patient data, and before the billing system sends its first claim.

HIPAA does not give new practices a ramp-up period. The moment your practice is a covered entity handling protected health information, the full requirements of the Privacy Rule and Security Rule apply. The good news is that the setup tasks are finite and well-defined. The bad news is that most practices learn this late, after they have already created gaps that require remediation.

This guide gives you a phased checklist: what must happen before you open, what to complete in your first 30 days, and what to review at 90 days.

## Why Compliance Starts Before Day One

The threshold question is whether your practice is a covered entity. Under 45 CFR § 160.103, a covered entity includes a healthcare provider that transmits any health information in electronic form in connection with a covered transaction — most commonly, electronic billing for services. If your practice accepts insurance, files claims electronically, or uses an EHR that connects to a clearinghouse, you are a covered entity.

Being a covered entity does not require patients. It requires that you engage in covered transactions. The moment you sign up for an EHR, engage a billing service, or begin entering data into any clinical system, PHI may be created or transmitted. Your compliance program must be in place before that happens.

This is not a technicality. It is the actual legal standard. OCR does not treat "we just opened" as a defense to a Privacy Rule or Security Rule finding.

## Pre-Opening HIPAA Checklist

Work through these items before your practice sees its first patient.

### Confirm Your Covered Entity Status

Review whether your practice meets the definition of a covered entity under 45 CFR § 160.103. If you will bill insurance electronically, transmit any health information electronically in connection with a transaction the Secretary has adopted standards for, or provide health care services, you are almost certainly a covered entity.

Document your covered entity determination in writing. This is the foundation of your compliance program — a written conclusion that explains why the Privacy Rule and Security Rule apply to your practice.

### Designate a Privacy Officer and Security Officer

Under 45 CFR § 164.530(a), you must designate a Privacy Official responsible for developing and implementing HIPAA privacy policies and procedures. Under 45 CFR § 164.308(a)(2), you must designate a Security Official responsible for developing and implementing Security Rule policies and procedures.

In small practices, one person commonly holds both roles. That is acceptable. What matters is that the designation is documented — by name, not by title alone — and that the person in that role understands what is required of them.

If you are a solo practitioner starting a small practice, this role will likely be you until you hire an office manager.

### Conduct Your Initial Risk Analysis

The Security Rule's risk analysis requirement at 45 CFR § 164.308(a)(1)(ii)(A) is the single most commonly cited deficiency in OCR enforcement actions. You must conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI your practice holds.

For a new practice, this means documenting:

- Where ePHI will be created, received, maintained, or transmitted (your EHR, billing system, practice management software, email, cloud storage, fax system)
- What threats and vulnerabilities exist for each of those systems
- The likelihood and impact of each identified risk
- The security measures currently in place to address each risk

This does not require specialized software. A well-documented spreadsheet or risk analysis template is sufficient if the analysis is thorough. HHS provides guidance on conducting an accurate and thorough risk analysis on its website. The output of this analysis drives your security management decisions and must be documented and retained.

### Develop Your Required Policies

A compliant HIPAA program requires written policies and procedures covering both the Privacy Rule and Security Rule. For a new practice, the minimum required policies are:

**Privacy policies:**
- Privacy Policy (overall approach to PHI use and disclosure)
- Notice of Privacy Practices (patient-facing document required under § 164.520)
- Minimum Necessary Policy (how your practice limits PHI to what is needed for each purpose)
- Patient Rights Policy (access, amendment, restrictions, accounting of disclosures, confidential communications)
- Sanction Policy (disciplinary consequences for workforce members who violate HIPAA)
- Complaint Policy (how patients can file complaints with your practice or HHS)

**Security policies:**
- Access Control Policy (who can access which systems and data)
- Workforce Security Policy (background checks, termination procedures, role-based access)
- Device and Media Control Policy (laptops, mobile devices, storage media containing ePHI)
- Audit Controls Policy (what you log and how you review logs)
- Breach Notification Policy (how you identify, contain, and report breaches under § 164.400)
- Incident Response Policy (how you handle security incidents)
- Contingency Plan (backup, disaster recovery, emergency access procedures)

Policy templates designed for small practices are widely available. What matters is that your policies match your actual operations — a policy that describes a process you do not follow is worse than no policy, because it documents a gap.

### Execute BAAs with All Vendors

Before any vendor, contractor, or service provider receives access to PHI, you need a signed Business Associate Agreement (BAA). Under 45 CFR § 164.308(b) and § 164.314(a), this is a Security Rule requirement, and the same requirement appears in the Privacy Rule at § 164.502(e).

Common vendors a new practice needs BAAs with before go-live:
- EHR vendor
- Practice management software vendor (may be bundled with EHR)
- Billing service or clearinghouse
- Cloud backup provider
- IT support company (if they have remote access to clinical systems)
- Transcription services
- Answering services that receive or relay patient information
- Any communication platform used for patient-facing messaging

Many major EHR and practice management vendors have standard BAA forms. Review the form before signing — it should cover the permitted uses of PHI, the vendor's security obligations, and what happens at termination.

Create a BAA inventory: a simple log with each vendor's name, the date the BAA was signed, and where the signed copy is stored.

### Set Up Your Notice of Privacy Practices

The Notice of Privacy Practices (NPP) is the patient-facing document required under 45 CFR § 164.520. You must provide it to each patient at the first service date and make a good-faith effort to get a written acknowledgment that the patient received it.

The NPP must describe:
- How your practice may use and disclose PHI (for treatment, payment, and healthcare operations without authorization; for other purposes only with authorization or under a specific exception)
- Patient rights under HIPAA (to access their records, request amendments, request an accounting of disclosures, request restrictions, and request confidential communications)
- Your legal duties with respect to PHI
- How to contact the Privacy Officer to exercise rights or file complaints

HHS publishes a model NPP that practices can adapt. The NPP must be written in plain language and must be posted in a prominent location at your practice. If you have a website that describes your services, you must post the NPP there as well.

### Configure Your EHR and Practice Management System

Before going live, configure your clinical and administrative systems with appropriate access controls. This means:

- Creating individual user accounts for each workforce member (no shared logins)
- Assigning role-based access so each user can access only the PHI they need to do their job
- Enabling audit logging so the system records who accessed which records and when
- Configuring automatic screen-lock timeouts
- Enabling encryption for data at rest and in transit
- Disabling guest or default accounts

Document your configuration decisions. If an auditor asks why the billing coordinator cannot access clinical notes, you should be able to point to a written access control decision.

### Train All Workforce Members Before They Handle PHI

Under 45 CFR § 164.530(b), you must train workforce members on your privacy policies and procedures at the time of hire, and whenever there are material changes to your policies. Training must occur before the person handles PHI.

For a new practice, this means:
- Conducting initial HIPAA training before your first staff member logs into a clinical system
- Documenting who was trained, the date, the training content covered, and how training was delivered
- Retaining training records for at least six years

Training delivered verbally without documentation does not satisfy the requirement. Each training session needs a record.

## First 30 Days

Once you are seeing patients, your compliance obligations shift from setup to operations. In your first month:

**Patient rights requests:** Establish a process for receiving and responding to patient access requests (§ 164.524), amendment requests (§ 164.526), and requests for an accounting of disclosures (§ 164.528). Patients have 30 calendar days to receive a response to access requests (with one 30-day extension if needed).

**BAA inventory:** Confirm every vendor with PHI access has a signed BAA on file. New vendors you bring on in month one need BAAs before access is granted.

**Incident response familiarity:** Make sure whoever is serving as Privacy/Security Officer knows how to execute your breach notification procedure. A reportable breach discovered in month one needs to be handled correctly, and OCR notification deadlines are strict.

**Sanction documentation:** If any workforce member violates a HIPAA policy — even a minor one — document the incident and the disciplinary response per your Sanction Policy. Incomplete sanction documentation is a common gap in early-stage practices.

**Acknowledgment tracking:** Track which patients have received and acknowledged the NPP. Your EHR may have a field for this; if not, a simple log is sufficient.

## 90-Day Review

At 90 days, step back and assess whether your compliance program is functioning as designed.

**Risk analysis review:** Did any new systems, vendors, or processes emerge in the first 90 days that were not captured in your initial risk analysis? Add them, assess the risks, and document the updated analysis.

**Policy gaps:** Did any real-world situation arise that your policies did not address? Update the relevant policy and re-train affected workforce members.

**Training records audit:** Pull your training records and verify that every current workforce member has a completed training record. If anyone was hired in the first 90 days, verify their training happened before they accessed PHI.

**BAA audit:** Verify that your BAA inventory is complete and current. Check that each BAA is signed by an authorized representative of both parties and that the form covers all current uses of PHI by that vendor.

**NPP distribution:** Verify that every patient seen in the first 90 days received the NPP and that acknowledgments were collected and recorded.

A 90-day review does not need to be a formal event. A half-day of focused review by your Privacy Officer, documented in writing, is sufficient. What matters is that the gaps you find get corrected and that the correction is recorded.

---

HIPAA setup is not a one-time project — it is the foundation of an ongoing compliance program. A practice that builds this foundation correctly before opening avoids the expensive remediation work that comes from discovering gaps under audit pressure.

For practice administrators who want to manage this program without adding compliance staff, [PHIGuard](/hipaa) is built specifically for small clinic compliance programs: BAA tracking, training records, risk analysis documentation, and policy management in one place, at current pricing.

The [HIPAA basics hub](/learn/hipaa-basics) has additional articles on specific topics covered in this guide, including the Privacy Officer role, the Notice of Privacy Practices, and the minimum necessary standard.
