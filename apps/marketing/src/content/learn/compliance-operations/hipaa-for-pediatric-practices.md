---
title: "HIPAA Compliance for Pediatric Practices"
seoTitle: "HIPAA for Pediatric Practices"
description: "Pediatric practices face unusual HIPAA exposure because the patient is a minor and the parent is usually—but not always—the personal representative. This guide explains how to handle those edge cases without breaking the Privacy Rule."
metaDescription: "HIPAA guide for pediatric practices: parent as personal representative, adolescent confidential care, immunization registries, and FERPA crossover."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Pediatric practices manage records for minors whose parents act as personal representatives under 45 CFR 164.502(g), with carve-outs for adolescent confidential care, school-based services that touch FERPA, and immunization registry reporting. This guide walks through the privacy edges that pediatric administrators most often get wrong."
keyTakeaways:
  - "Parents are personal representatives by default, but adolescent confidential care is a documented exception that staff must recognize."
  - "Immunization registry disclosures are permitted under the Privacy Rule but still require minimum-necessary controls and audit trails."
  - "School-based services and forms can pull records into FERPA territory, which changes who controls the disclosure."
  - "Custody and guardianship disputes require a written policy and documented identity verification, not front-desk judgment calls."
  - "Behavioral and ADHD notes sit at the highest sensitivity tier and need stricter access controls than routine pediatric records."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR Parts 160-164 — HIPAA"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA Privacy Rule and the Personal Representative of an Unemancipated Minor"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Are parents always entitled to their child's medical records under HIPAA?"
    a: "Usually, but not always. Under 45 CFR 164.502(g), a parent is the personal representative of a minor unless state law allows the minor to consent to care without parental involvement, a court has restricted access, or the parent has agreed to a confidential relationship between the provider and the minor."
  - q: "Can a pediatric practice send immunization records to a state registry without authorization?"
    a: "Yes, when the disclosure is required or permitted by state law and meets the public health activity exception. The practice still has to apply minimum necessary standards and log the disclosure in its accounting of disclosures."
  - q: "Do school physical forms fall under HIPAA or FERPA?"
    a: "While the form is in the practice's hands it is HIPAA-protected. Once it is sent to the school and placed in the education record, FERPA generally takes over. Practices should obtain a parental authorization for the disclosure and keep a copy."
---

Pediatric practices live in one of the more complicated corners of the HIPAA Privacy Rule. The patient is a minor, the parent is usually—but not always—the personal representative, and the records often need to move between the practice, schools, immunization registries, and behavioral health providers. Each of those handoffs has its own consent rules, and the front-desk team is expected to get them right while the waiting room is full.

## Why pediatric practices have unique HIPAA exposure

The core issue is that pediatric records are about a child but controlled, in most cases, by a parent. 45 CFR 164.502(g) makes a parent, guardian, or other person acting in loco parentis the personal representative of an unemancipated minor for the purposes of HIPAA. That default flips in three situations: when state law allows the minor to consent to a service on their own (contraception, mental health, substance use, sexually transmitted infections in many states), when a court has restricted parental access, and when the provider has agreed to keep certain information confidential between provider and minor.

Pediatric practices also sit at the intersection of HIPAA and FERPA. Records the practice creates are PHI. The same record, once it lands in a school nurse's file, may become an education record subject to FERPA. School-required forms, sports physicals, and IEP-adjacent documentation move across that line constantly.

## Top HIPAA risks for pediatric clinics

- Parents of teenagers requesting full chart access that includes confidential adolescent care notes the provider intended to keep separate.
- Disputed-custody disclosures where the front desk releases records to the wrong parent because no one verified the custody order.
- Behavioral health and ADHD documentation accessible to every clinical user when access should be limited.
- Verbal disclosures in shared exam rooms or open nurse stations, especially for siblings seen in sequence.
- Forms returned to schools, camps, or daycares without a written authorization on file.
- Immunization registry submissions with broader data than the registry actually requires.
- After-visit summaries auto-emailed to a portal account the parent shares with a non-custodial relative.

## Vendor and BAA checklist for pediatric practices

Pediatric practices typically use a pediatric-focused EHR, a patient portal with proxy access, an immunization registry interface, a billing clearinghouse, and a fax or secure messaging service. Each of those is a business associate if it touches PHI. Confirm:

- A signed BAA is on file for the EHR, the portal vendor, the registry interface (where the vendor is not a public health authority), the billing clearinghouse, the e-fax provider, and any cloud backup service.
- Proxy account configuration in the portal supports per-record sensitivity controls, not just all-or-nothing parent access.
- The registry submission tool transmits only the data elements the state registry actually requires.
- Behavioral health note storage supports a separate access role so front-desk and billing staff are excluded by default.
- Any vendor doing developmental screening, telehealth, or remote care has a current BAA and breach notification clause that names the practice.

## State law overlays affecting pediatric practices

State law is where pediatric privacy gets hard. Most states give minors the right to consent to specific services—commonly contraception, pregnancy care, mental health care, and substance use treatment—at ages that vary widely. When a minor consents on their own, the parent is not the personal representative for that episode of care. Practices need a written matrix of which services trigger confidential adolescent care in their state and at what age.

Custody and guardianship rules also vary. Some states allow either parent equal access regardless of custody label; others restrict access to the legal custodian. Court orders can override both. The practice needs a documented policy for how to verify a custody claim before releasing records.

## HIPAA compliance checklist for pediatric clinics

1. Adopt a written policy that maps each minor-consent service in your state to an EHR sensitivity flag.
2. Train front-desk staff to ask, at every records request involving a teen, whether confidential adolescent care is in the chart before releasing.
3. Configure portal proxy access so adolescent records can be partitioned at an age threshold defined in policy.
4. Require a copy of the custody order or guardianship document for any non-routine disclosure to a parent whose status is unclear.
5. Limit immunization registry submissions to the minimum necessary fields and log each submission.
6. Restrict behavioral health and ADHD note access to a clinical role group; exclude billing and front desk by default.
7. Use a written authorization for every school, camp, daycare, or sports-program disclosure, and retain the signed form for six years.
8. Audit portal access logs quarterly for proxy accounts that have been inactive or that show unusual access patterns.
9. Run a tabletop incident response exercise yearly that includes a wrong-parent disclosure scenario.
10. Maintain a current accounting of disclosures for public health and law enforcement releases for the prior six years.

PHIGuard's compliance program is built for clinics like yours. See how the [pediatric practice profile](/practice-types/pediatric-practice) maps to PHIGuard, or compare it to our broader [compliance operations library](/learn/compliance-operations) and the full [HIPAA program overview](/hipaa).
