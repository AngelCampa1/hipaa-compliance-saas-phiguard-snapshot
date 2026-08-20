---
title: "Is Doxy.me HIPAA Compliant?"
vendor: "Doxy.me"
seoTitle: "Is Doxy.me HIPAA Compliant?"
description: "What medical clinics need to know about Doxy.me's free tier, paid plan BAA availability, and the compliance steps required before using Doxy.me for telehealth with patient PHI."
metaDescription: "Is Doxy.me HIPAA compliant? Free tier has no BAA. Paid plans include a BAA, but clinics must sign it. Learn what your clinic must do before using Doxy.me..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Doxy.me's free tier has no BAA and is not HIPAA-covered. Using it for telehealth with patient health information is a compliance violation. Paid plans — Pro, Clinic, and Enterprise — do offer a BAA, but it does not apply automatically. Clinics must actively sign the BAA with Doxy.me before conducting any telehealth sessions that involve PHI."
keyTakeaways:
  - "Doxy.me's free tier has no BAA available — using it with patient PHI is a HIPAA violation."
  - "Paid plans (Pro, Clinic, Enterprise) offer a BAA, but the clinic must actively sign it before it takes effect."
  - "A signed BAA covers the Doxy.me platform; it does not replace the clinic's own HIPAA policies, risk assessment, or workforce training."
  - "Free-tier use during a trial period still creates compliance exposure if PHI is transmitted."
  - "Clinics switching from a covered EHR's built-in telehealth to Doxy.me must execute a new BAA before going live."
sources:
  - title: "Security at Doxy.me"
    url: "https://doxy.me/en/security/"
    publisher: "Doxy.me"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinic use the free Doxy.me tier for telehealth with patients?"
    a: "No. The free tier has no BAA available. Any telehealth session that involves patient health information — diagnosis, treatment, medication, symptoms — requires a BAA with your telehealth platform. Free Doxy.me does not provide one."
  - q: "Does upgrading to a paid Doxy.me plan automatically activate HIPAA coverage?"
    a: "No. Upgrading gives you access to the BAA, but you must actively sign it. HIPAA coverage is not automatic upon plan upgrade. Complete the BAA process through Doxy.me's account settings or by contacting their team before conducting PHI-bearing sessions."
  - q: "Does the Doxy.me BAA cover recordings of telehealth sessions?"
    a: "Review the current BAA text with your compliance advisor. Session recordings stored in Doxy.me's systems would typically fall under the BAA, but any recordings downloaded and stored in other systems must be protected by a BAA with those systems as well."
  - q: "Is Doxy.me a covered entity or a business associate?"
    a: "Doxy.me is a business associate. Your clinic is the covered entity. You must execute a BAA with Doxy.me before transmitting PHI through their platform."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Is Doxy.me HIPAA compliant? It depends on the plan. The free tier is not HIPAA compliant — no BAA is available, and using it for telehealth with patients creates an unprotected disclosure of PHI. Paid plans do offer a BAA, but clinics must sign it before the first session. The plan upgrade alone does not activate compliance coverage.

## BAA availability by plan

Doxy.me structures its HIPAA coverage by plan tier:

**No BAA available:**
- Free (no cost plan)

**BAA available:**
- Pro
- Clinic
- Enterprise

The BAA is not a passive feature that activates when you pay. Clinics must complete the BAA execution process — either through the Doxy.me account dashboard or by direct agreement with Doxy.me's team — before conducting any telehealth session that involves patient health information.

Doxy.me positions itself as a healthcare-first telehealth platform, and for paid subscribers the BAA process is accessible. The gap is the free tier, which many clinics use during evaluation or for occasional low-volume sessions without recognizing the compliance exposure this creates.

## What the clinic must do

Signing up for a paid Doxy.me plan and executing the BAA is the starting point, not the finish line. HIPAA compliance for telehealth involves several clinic-side obligations that fall outside any vendor agreement:

**Before the first session:**
1. Upgrade to a paid Doxy.me plan (Pro, Clinic, or Enterprise) based on your session volume and feature needs.
2. Execute the BAA through Doxy.me's platform. Keep a copy of the executed agreement in your compliance documentation.
3. Conduct a risk assessment that includes telehealth as a PHI transmission channel. Document the assessment findings.
4. Confirm your internet infrastructure — routers, networks used by providers — does not create additional exposure points.

**Workforce requirements:**
- Train all staff who conduct or support telehealth sessions on permissible use of the platform.
- Include telehealth-specific scenarios in your annual HIPAA training (e.g., what to do if a session is accidentally recorded or if a patient calls from a shared device).
- Document that training occurred and retain records.

**Ongoing:**
- Review Doxy.me's security documentation periodically. BAA terms and platform security features change.
- If you add new providers or new clinic locations, confirm those users are covered under the same BAA arrangement.

## The free-tier compliance trap

Many clinics encounter Doxy.me through a free trial or by using the free plan for a small number of sessions before deciding to upgrade. This creates a specific risk: PHI transmitted during free-tier use has no contractual protection, and the disclosure occurred regardless of whether the clinic later upgrades and signs a BAA.

The BAA is not retroactive. Sessions conducted under the free tier before a BAA was executed are not covered by a BAA signed later. If those sessions transmitted PHI — patient names combined with appointment purposes, symptom discussions, medication reviews — the clinic has a disclosure without a BAA in place.

The practical answer: never use any telehealth platform, Doxy.me or otherwise, for patient sessions until the BAA is executed. Use the free tier only for internal testing with synthetic patient data or staff demo sessions that contain zero real patient information.

## What a BAA does not cover

A signed BAA with Doxy.me governs Doxy.me's obligations to protect PHI on their platform. It does not:

- Cover PHI stored or processed in other systems the clinic uses
- Replace the clinic's Security Rule obligations (access controls, audit logs, encryption of stored data)
- Substitute for a written HIPAA compliance program, workforce training documentation, or risk assessment
- Extend to session recordings stored outside of Doxy.me's systems

Clinics that rely on a vendor BAA as the totality of their HIPAA program are exposed. OCR enforcement actions regularly find violations in areas the BAA does not touch: missing workforce training records, no documented risk assessment, no sanctions policy, no breach response plan.

## Comparing Doxy.me to built-in EHR telehealth

Many EHRs include a telehealth module that is covered under the EHR's existing BAA. Clinics switching from an EHR's built-in telehealth to Doxy.me as a standalone tool must execute a separate BAA with Doxy.me. The EHR's BAA does not extend to Doxy.me.

If your clinic uses multiple telehealth tools — for example, an EHR module for established patients and Doxy.me for walk-in or referral sessions — each platform requires its own BAA.

## Compliance operations beyond the BAA

A telehealth BAA is one document in a compliance program. The clinic's broader responsibilities include tracking which BAAs are in place, when they were signed, and whether they need renewal or update when a vendor changes their terms. Managing that across every software vendor a clinic uses is an administrative task that falls to practice administrators.
