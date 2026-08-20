---
title: "HIPAA Compliance for Dermatology Practices"
seoTitle: "HIPAA for Dermatology Practices"
description: "Dermatology practices generate clinical photographs that carry high re-identification risk, plus pathology and Mohs surgery records that travel between sites. This guide covers the specialty-specific exposures and BAA considerations."
metaDescription: "HIPAA compliance for dermatology practices: clinical photography, pathology BAAs, Mohs records, and a specialty checklist."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Dermatology is one of the most photo-heavy specialties in medicine, and clinical photographs of faces and skin are uniquely re-identifiable. This guide maps photo, pathology, and tele-derm exposures to HIPAA obligations and gives administrators a checklist they can act on."
keyTakeaways:
  - "Clinical photography in dermatology is PHI with high re-identification risk and must be stored under the Security Rule."
  - "Pathology labs receiving biopsy specimens with identifiers are business associates and require a BAA."
  - "Tele-dermatology platforms, including store-and-forward services, must be covered by a BAA before any image flows."
  - "Personal phones used to capture lesion photographs are a recurring and under-controlled exposure."
  - "Photo retention, access, and deletion policies must be written, trained, and audited."
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
  - q: "Is a clinical photograph of a skin lesion PHI?"
    a: "Yes, when it can be linked to an identifiable patient, including through facial features, distinctive marks, or association with the patient's record."
  - q: "Can clinicians use personal phones to photograph lesions?"
    a: "Only under a written policy with a HIPAA-compliant capture app, encrypted storage, and a BAA with the app vendor. Default camera roll capture does not meet the standard."
  - q: "Does a pathology lab need a BAA?"
    a: "Yes. A pathology lab that receives biopsy specimens with patient identifiers is a business associate and must sign a BAA before specimens are transmitted."
---

## Why dermatology has unique HIPAA exposure

Dermatology relies on visual evidence more than almost any other specialty. Clinical photographs document baseline lesions, track change over time, justify medical necessity for insurers, and support tele-dermatology over-reads. Photographs of faces, scalps, and distinctive skin findings carry a high re-identification risk that abstract record fields do not. Even a cropped image of a patch of skin can be tied to a person when the patient's record is the obvious key.

Dermatology also has a heavy pathology footprint. Biopsies leave the practice on a near-daily basis, accompanied by patient identifiers, and the resulting pathology reports travel back through fax, portal, or interface. Mohs micrographic surgery generates serial pathology in a single session and creates record flows that span the surgical suite, the in-office or external lab, and the EHR.

## Top HIPAA risks for dermatology clinics

**1. Personal phone photography.** Clinicians capture lesion photographs on personal devices, where images may sync to consumer cloud backups, ad-supported photo apps, or family-shared albums. Without a HIPAA-compliant capture app and a BAA with the vendor, this is impermissible disclosure waiting to happen.

**2. Tele-dermatology vendors without BAAs.** Store-and-forward platforms and live video tele-derm services receive identifiable images. A BAA must be in place before any patient image is uploaded.

**3. Pathology transmission gaps.** Biopsy requisitions sent via unencrypted fax or shared printer trays expose patient identifiers. Mohs intra-operative pathology adds intra-suite specimen handling that must follow the same standards.

**4. Photo retention drift.** Practices accumulate years of clinical photographs without a written retention or deletion schedule, expanding the breach surface every year.

## Vendor and BAA checklist for dermatology

Confirm a signed BAA is on file before PHI flows to:

- Dermatology-focused EHR or general EHR with derm modules
- Clinical photography capture and storage platforms
- Tele-dermatology and store-and-forward platforms
- Pathology labs receiving biopsies
- Dermatopathology over-read services
- Mohs lab software, when separate from the EHR
- Patient portal and secure messaging vendors
- Cloud backup and managed IT vendors
- Marketing platforms only when no PHI flows; if before-and-after photos are used in marketing, separate authorization is required

## State law overlays affecting dermatology

HIPAA sets the floor. State law may impose stricter rules where dermatology intersects with sensitive categories: HIV-related findings, sexually transmitted infections that present dermatologically, and minors' records. Several states require explicit, separate authorization to use clinical photographs for marketing, education, or research, beyond what the Privacy Rule requires. Confirm with counsel which categories trigger heightened consent in your state and align your photo-use authorizations to match.

## HIPAA compliance checklist for dermatology practices

1. Inventory every system that captures, stores, or transmits clinical photographs.
2. Replace personal-device photography with a HIPAA-compliant capture app covered by a BAA.
3. Confirm a signed BAA is on file for each pathology lab, tele-derm vendor, and EHR.
4. Encrypt photo storage at rest and require encrypted transmission to over-read services.
5. Establish a written retention and deletion schedule for clinical photographs.
6. Require separate, specific authorization before any patient photograph is used for marketing or education.
7. Configure role-based access so only treating clinicians and authorized staff view photographs.
8. Train staff on minimum necessary disclosure for tele-derm, referrals, and family inquiries.
9. Run an annual risk analysis that explicitly covers photo and pathology data flows.
10. Maintain an incident response runbook that includes vendor breach notification timelines.

For broader context, see the [compliance operations hub](/learn/compliance-operations). If you administer a dermatology practice and need a HIPAA-native task, BAA, and audit platform built for clinics your size, [PHIGuard](/hipaa) is purpose-built for the work.
