---
title: "HIPAA Compliance for OB/GYN Practices"
seoTitle: "HIPAA for OB/GYN Practices"
description: "Reproductive health records carry heightened state-law protection that has shifted significantly post-Dobbs. OB/GYN practices need controls that go beyond standard HIPAA for reproductive care, minor confidential services, and partner disclosures."
metaDescription: "HIPAA guide for OB/GYN practices: reproductive health protections post-Dobbs, minor confidential care, partner disclosure, and ultrasound imaging PHI."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "OB/GYN practices manage reproductive health records that now carry heightened state-law protection on top of HIPAA, especially after Dobbs. This guide explains the privacy controls OB/GYN administrators need for reproductive care, minor confidential services, partner disclosures, and imaging."
keyTakeaways:
  - "Reproductive health information has heightened protections under the 2024 HIPAA Privacy Rule final rule and additional state-law layers."
  - "Minor consent for contraception, prenatal care, and STI treatment varies by state and overrides the parent-as-personal-representative default."
  - "Partner disclosure for STI results requires a documented policy that distinguishes permitted public-health disclosures from prohibited ones."
  - "Ultrasound imaging and fetal monitoring data are PHI and need the same access controls as the rest of the chart."
  - "Subpoenas and law-enforcement requests for reproductive-care records require legal review before any disclosure."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR Parts 160-164 — HIPAA"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "45 CFR 164.508 — Uses and Disclosures for which an Authorization is Required"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.508"
    publisher: "eCFR"
faq:
  - q: "Can law enforcement compel an OB/GYN practice to release reproductive-care records?"
    a: "The 2024 HIPAA Privacy Rule final rule limits disclosures of reproductive health information for investigations into lawful reproductive care. Any law-enforcement or subpoena request for reproductive records should be reviewed by counsel before disclosure and an attestation may be required."
  - q: "Do parents have access to a teenager's prenatal or contraceptive records?"
    a: "It depends on state law. Most states allow minors to consent to contraception, prenatal care, and STI treatment without parental involvement, and where the minor consents independently, the parent is not the personal representative for that care under 45 CFR 164.502(g)."
  - q: "Can we share STI results with a patient's partner?"
    a: "Generally not without authorization. Limited exceptions exist for public health authorities and for certain partner-notification programs run under state law, but routine partner disclosure requires a written authorization from the patient."
---

OB/GYN practices sit at the most sensitive end of the privacy spectrum. Reproductive health records, prenatal imaging, sexual health histories, and minor confidential care all live in the same chart, and each category has its own consent and disclosure rules. The privacy environment has also changed materially since Dobbs—both at the federal level through the 2024 HIPAA Privacy Rule final rule on reproductive health and at the state level, where laws now diverge sharply.

## Why OB/GYN practices have unique HIPAA exposure

Reproductive health information was always sensitive, but the legal framework around it is now more demanding than baseline HIPAA. The 2024 final rule on reproductive health information added restrictions on disclosures to law enforcement and for use in investigations into lawful reproductive care, along with an attestation requirement for certain requests. State laws vary widely: some states have layered additional protections on reproductive records; others have created reporting obligations that conflict with the federal direction. OB/GYN administrators have to read both layers.

The clinical content adds its own complexity. Ultrasound imaging and fetal monitoring data are PHI. Genetic screening results are PHI and may also be subject to GINA. STI results carry partner-disclosure questions. Minor patients consenting to contraception or prenatal care override the default parent-as-personal-representative rule. Each of these categories needs an EHR configuration and a written policy.

## Top HIPAA risks for OB/GYN clinics

- Releasing reproductive-care records in response to a subpoena without legal review or the required attestation.
- Parent-portal access that exposes a minor's confidential reproductive care contrary to state law.
- Partner disclosures of STI results made verbally at the front desk without written authorization.
- Ultrasound images stored in a vendor cloud without a current BAA covering imaging.
- Genetic screening results visible to all clinical users when access should be limited.
- After-visit summaries auto-mailed to a home address shared with a partner the patient has not authorized.
- Front-desk verbal confirmations of pregnancy status within earshot of the waiting room.
- Telehealth recordings of reproductive-care visits stored beyond the policy retention window.

## Vendor and BAA checklist for OB/GYN

OB/GYN clinics typically use an OB-specific EHR module, an ultrasound and imaging archive (PACS or a cloud equivalent), a fetal monitoring vendor, a genetic testing lab, a clearinghouse, a patient portal with proxy and minor controls, and often a telehealth platform. Confirm:

- BAA on file with the EHR, PACS or imaging cloud, fetal monitoring vendor, genetic testing lab, clearinghouse, portal, and telehealth provider.
- Imaging vendor BAA covers transmission, storage, and any AI-assisted analysis features.
- Genetic testing lab BAA includes breach-notification timelines that match your incident response plan.
- Portal vendor supports per-record sensitivity flags and a documented minor-confidentiality configuration.
- Any reproductive-health-specific vendor (period tracking integrations, fertility platforms) has a current BAA and an attestation process for law-enforcement requests.

## State law overlays affecting OB/GYN

State law is the dominant privacy variable for OB/GYN practices. Categories to map for your state:

- Minor consent for contraception, prenatal care, STI treatment, and abortion care, including the age threshold for each.
- Reportable conditions, including STIs and HIV, and the data elements the state actually requires.
- Reproductive-care record protections enacted post-Dobbs, including any state-level shield laws.
- Partner-notification programs and whether the practice's role is mandatory, permitted, or prohibited without authorization.
- Subpoena and law-enforcement request handling, including any state-specific attestation requirements layered on the federal rule.

## HIPAA compliance checklist for OB/GYN clinics

1. Adopt a written policy on responding to subpoenas and law-enforcement requests for reproductive-care records that requires legal review before any disclosure.
2. Configure the EHR with a reproductive-health sensitivity flag that controls portal exposure and audit visibility.
3. Map state-by-state minor consent thresholds to EHR settings and train front-desk staff on the matrix.
4. Restrict access to genetic screening results to a defined clinical role group.
5. Require written authorization for any partner disclosure of STI or pregnancy information.
6. Verify imaging and PACS BAAs annually and confirm encryption-at-rest and in-transit configurations.
7. Configure portals so adolescent reproductive-care records are partitioned from parent-proxy view per policy.
8. Train staff to redirect verbal confirmations of pregnancy or reproductive-care status to a private setting.
9. Audit telehealth recordings monthly to confirm they are deleted at the policy retention horizon.
10. Run a tabletop exercise on a law-enforcement subpoena for reproductive-care records at least annually.

PHIGuard's program covers the controls reproductive-care practices need. See the [OB/GYN practice profile](/practice-types/obgyn-practice), the [compliance operations library](/learn/compliance-operations), and the full [HIPAA program overview](/hipaa).
