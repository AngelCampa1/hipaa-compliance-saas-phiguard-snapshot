---
title: "HIPAA Compliance for Optometry Practices"
seoTitle: "HIPAA for Optometry Practices"
description: "Optometry practices run two parallel insurance systems—medical and vision—that produce two parallel PHI flows. Add retinal imaging, dispensary orders, and pediatric vision screening, and the compliance picture is more complex than most ODs realize."
metaDescription: "HIPAA guide for optometry practices: medical vs vision insurance, retinal imaging, dispensary orders with refraction data, and pediatric screening."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Optometry practices manage dual insurance flows (medical and vision plans like VSP and EyeMed), retinal imaging, and dispensary orders that include refraction PHI. This guide explains how those pieces map to HIPAA and where the typical optometry stack creates exposure."
keyTakeaways:
  - "Vision plans (VSP, EyeMed, Davis Vision) are payers and require BAAs and minimum-necessary controls just like medical payers."
  - "Retinal imaging and OCT scans are PHI and the imaging system needs the same audit and access controls as the EHR."
  - "Dispensary orders that include refraction data are PHI even when sent to an outside lab."
  - "Pediatric vision screening intersects with school-record rules and FERPA when results are shared with schools."
  - "Patient education content from frame and contact-lens vendors should not include PHI; verify vendor BAAs only when PHI is actually shared."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR Parts 160-164 — HIPAA"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA for Professionals"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Are vision plans like VSP and EyeMed considered HIPAA payers?"
    a: "Yes. They are health plans under HIPAA, and the transactions you exchange with them—eligibility, claims, remittance—are covered transactions. A BAA is generally not needed with the plan itself (a plan-to-provider relationship is not a business associate relationship), but any clearinghouse or intermediary is a business associate."
  - q: "Is a refraction or eyeglass prescription PHI?"
    a: "Yes when it is held by the practice and tied to an identified patient. Sending the prescription to an outside lab to fill an order is a permitted disclosure for treatment, but it should still follow minimum-necessary principles."
  - q: "Do we need a BAA with our retinal imaging vendor?"
    a: "If the vendor stores, transmits, or remotely supports the imaging data, yes. Many modern OCT and fundus camera systems include cloud features that route PHI to the vendor, which triggers the BAA requirement."
---

Optometry practices look administratively simple from the outside—exam, refraction, glasses or contacts, follow-up—but the back office runs two parallel insurance systems and a small imaging operation. That combination puts optometry squarely inside HIPAA, with a few wrinkles that medical-only practices do not deal with.

## Why optometry has unique HIPAA exposure

Three structural features make optometry distinctive under HIPAA. First, the practice typically bills both medical insurance (for medical eye care: dry eye, glaucoma, diabetic retinopathy) and vision plans (VSP, EyeMed, Davis Vision, Spectera) for routine refractive care. Each side has its own clearinghouse, eligibility flow, and claim format, which doubles the surfaces where PHI can leak. Second, retinal imaging—OCT, fundus photography, visual field testing—is now standard in most practices, and those imaging systems generate PHI that needs the same protection as the EHR. Third, the dispensary side of the practice creates lab orders that include refraction data and patient identifiers, which is PHI even though it feels like a retail transaction.

## Top HIPAA risks for optometry clinics

- Vision-plan eligibility checks routed through an intermediary with no BAA on file.
- Retinal imaging stored in a vendor cloud without confirmed encryption or audit logging.
- Dispensary lab orders sent to outside labs by email or fax with more PHI than the lab needs.
- Frame and contact-lens vendor portals that staff log into using patient identifiers when a non-PHI account would suffice.
- Pediatric vision screening reports sent to schools without a signed authorization.
- Open optical floor with patient charts visible on dispensing-station screens.
- Patient communication via personal staff cell phones for contact-lens follow-up.
- Old retinal images retained beyond policy retention because no one owns the imaging system's purge schedule.

## Vendor and BAA checklist for optometry

The typical optometry stack includes an optometry-specific EHR (RevolutionEHR, Crystal PM, Eyefinity, Compulink, OfficeMate), an imaging system (OCT, fundus, visual field), a vision-plan clearinghouse, a medical clearinghouse, a contact-lens ordering platform, a frame inventory and ordering system, a recall and reminder service, and often an online intake tool. Confirm:

- Signed BAA with the EHR vendor and any embedded modules (imaging integration, recall, telehealth).
- Signed BAA with the imaging system vendor where any cloud or remote support is in scope.
- Signed BAA with both the medical and vision-plan clearinghouses or any intermediary that routes claims and eligibility.
- Signed BAA with the contact-lens ordering platform if it stores patient identifiers tied to prescriptions.
- Signed BAA with the recall and reminder service, with documented patient consent for SMS or email contact.
- Signed BAA with online intake form vendors; reject low-cost form tools that will not sign a BAA.
- Frame inventory and lab-order systems reviewed: if a system processes patient identifiers tied to a prescription, it is a business associate.

## State law overlays affecting optometry

State law adds requirements in three areas optometry touches frequently. Prescription-release rules (the federal Eyeglass Rule and Contact Lens Rule, plus state analogs) require the practice to release prescriptions to patients on request, which has implications for how the practice verifies the requester. Pediatric vision screening programs, especially school-mandated ones, generate disclosures to schools that move the record toward FERPA territory once it lands in the school's hands. Records retention timelines vary by state and often differ for adult versus pediatric patients.

## HIPAA compliance checklist for optometry clinics

1. Verify a current BAA for the EHR, imaging system, both clearinghouses (medical and vision), recall service, and intake vendor.
2. Configure the imaging system with unique user logins and audit-log review at a defined cadence.
3. Position dispensing-station screens so PHI is not visible to other patients on the optical floor.
4. Adopt a written process for releasing eyeglass and contact-lens prescriptions that includes identity verification.
5. Limit dispensary lab orders to the minimum necessary identifiers and confirm the lab transmission method is encrypted.
6. Require a signed authorization before sending pediatric vision screening results to a school.
7. Set a retention schedule for retinal images consistent with state law and the practice's policy, and assign an owner for the purge schedule.
8. Audit vision-plan eligibility logs monthly to confirm only minimum-necessary fields are pulled.
9. Disable shared logins to the EHR and to the contact-lens ordering platform.
10. Run a yearly office walkthrough that includes the optical floor, the dispensing area, and the imaging room.

PHIGuard is built for clinics that run dual-payer flows and on-site imaging. See the [optometry practice profile](/practice-types/optometry-practice), our [compliance operations library](/learn/compliance-operations), and the full [HIPAA program overview](/hipaa).
