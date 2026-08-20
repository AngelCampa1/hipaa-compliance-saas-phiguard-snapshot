---
title: "PHI in Genetic Testing Results: Enhanced HIPAA Protections"
seoTitle: "PHI in Genetic Testing Results"
description: "Genetic test results are PHI with additional protections under GINA and state genetic privacy laws. This guide covers HIPAA plus-GINA requirements, storage, access, patient rights, and state law overlays."
metaDescription: "PHI in genetic testing: HIPAA minimum necessary standard, GINA prohibitions on underwriting and employment use, state genetic privacy laws, storage, access."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Genetic test results are PHI subject to HIPAA's minimum necessary standard and additional protections under the Genetic Information Nondiscrimination Act (GINA, Pub. L. 110-233). GINA prohibits health plans from using genetic information for underwriting and employers from using it for employment decisions. State laws in several states are stricter still."
keyTakeaways:
  - "Genetic information is PHI under HIPAA — the minimum necessary standard, access controls, audit logging, and patient access rights all apply."
  - "GINA Title I prohibits health plans from using genetic information for underwriting purposes — disclosure of genetic test results to a health plan for underwriting is prohibited."
  - "GINA Title II prohibits employers from using genetic information for employment decisions — genetic results must not be disclosed to the patient's employer."
  - "State genetic privacy laws in Illinois, California, and several other states impose additional restrictions beyond HIPAA and GINA."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "Genetic Information Nondiscrimination Act (GINA) — Public Law 110-233"
    url: "https://www.eeoc.gov/laws/statutes/gina.cfm"
    publisher: "EEOC"
  - title: "45 CFR § 160.103 — Definition of Genetic Information"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/section-160.103"
    publisher: "eCFR"
  - title: "HHS — GINA and HIPAA"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/genetic-information/index.html"
    publisher: "HHS"
  - title: "Illinois Genetic Information Privacy Act"
    url: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2395"
    publisher: "Illinois General Assembly"
faq:
  - q: "Can a health plan require a patient to share genetic test results as a condition of coverage?"
    a: "No. Under GINA Title I, health plans may not require or request genetic testing as a condition of enrollment or premium eligibility, and may not use genetic information for underwriting purposes. A health plan that conditions coverage or sets premiums based on genetic test results violates GINA. Covered entities should not share genetic testing results with health plans for underwriting purposes even if requested."
  - q: "Do employers have any right to genetic test results from a clinic's records?"
    a: "No. Under GINA Title II, employers may not request, require, or purchase genetic information from employees or applicants. A clinic receiving a request from a patient's employer for genetic test results should refuse and, if appropriate, consult legal counsel. This applies even if the employer is requesting records ostensibly for another purpose — if those records include genetic test results, the employer cannot receive them."
  - q: "Do patients have the right to access their genetic test results?"
    a: "Yes. Genetic test results are PHI and patients have the right of access under 45 CFR § 164.524. The fact that results may include sensitive information about hereditary conditions or family health does not reduce the patient's right of access. Providers who believe a patient may be harmed by receiving certain results should document their clinical judgment and, where permissible, provide results with appropriate counseling — not withhold them."
  - q: "What is the difference between HIPAA's treatment of genetic information and GINA's?"
    a: "HIPAA treats genetic information as PHI subject to standard privacy and security requirements — minimum necessary, access controls, audit logging, and patient rights. GINA adds specific prohibitions on how genetic information may be used: health plans may not use it for underwriting (Title I), and employers may not use it for employment decisions (Title II). HIPAA governs how genetic information is protected; GINA governs how it may not be used."
---

When a patient undergoes hereditary cancer screening, the result file in your EHR is PHI — but it also falls under an additional layer of protection that most small clinic staff have not been trained on. The Genetic Information Nondiscrimination Act (GINA) prohibits specific uses of genetic data that HIPAA alone does not address. A health plan that receives a BRCA result from your clinic for underwriting purposes violates federal law. An employer who receives it from a records release violates federal law. Your clinic's obligation is to ensure neither happens.

This guide covers the HIPAA treatment of genetic test results, GINA's additional prohibitions, state genetic privacy laws, and the practical steps your clinic must take to handle genetic PHI correctly.

## Genetic Information Is PHI Under 45 CFR § 160.103

The HIPAA Privacy Rule's definition of PHI explicitly includes genetic information. Under 45 CFR § 160.103, genetic information is defined as:

> Information about an individual's genetic tests, genetic tests of family members of the individual, the manifestation of a disease or disorder in family members of the individual, or any request for, or receipt of, genetic services, or participation in clinical research which includes genetic services, by the individual or any family member of the individual.

This is a broader definition than most clinic staff expect. Genetic information includes not just a patient's own test results, but also:

- Information about a parent's or sibling's genetic test
- Family history of a hereditary condition (when recorded in a way that relates to the patient's own health)
- The fact that a patient underwent genetic testing, even without the results

All of this is PHI subject to the same minimum necessary standard, access controls, audit logging, and patient rights as any other clinical PHI.

## The Minimum Necessary Standard for Genetic Information

Under 45 CFR § 164.514(d), PHI access and disclosure must be limited to the minimum necessary for the stated purpose. For genetic test results:

**Within the care team**: A primary care provider ordering hereditary cancer screening needs the results to counsel the patient. A specialist involved in the patient's care for the relevant condition may need the results. A billing staff member processing the lab claim does not need the clinical detail of the results — only the CPT and diagnosis codes.

**For specialist referrals**: When referring a patient to a genetic counselor or specialist, share the results and the relevant clinical context. Do not include unrelated genetic information or family history details not relevant to the referral.

**For research or quality improvement purposes**: De-identified genetic data may be used for research consistent with HIPAA's research provisions (45 CFR § 164.512(i)) or de-identification standards (§ 164.514(b)). Identified genetic information requires patient authorization for research use.

## GINA Title I: Health Plan Underwriting Prohibition

The Genetic Information Nondiscrimination Act, Pub. L. 110-233, was enacted in 2008 to address fears that advances in genetic testing would lead to discrimination in health insurance and employment. Title I governs health plans. Title II governs employers.

Under GINA Title I, as implemented in HIPAA regulations at 45 CFR § 164.520(b)(1)(v):

- Health plans **may not use genetic information for underwriting purposes**. This includes setting premiums, determining eligibility for coverage, imposing preexisting condition exclusions, or adjusting coverage terms based on genetic information.
- Health plans **may not require genetic testing** as a condition of enrollment or benefits eligibility.

**What this means for your clinic:**

If a health plan requests genetic test results for underwriting purposes — even as part of a routine records request — do not provide them. If a request is received that appears to be for underwriting purposes, consult the Privacy Officer before responding.

Disclosures to health plans for treatment or payment purposes (processing a claim for a genetic test) are permitted under HIPAA's TPO framework. The prohibition applies specifically to underwriting uses.

## GINA Title II: Employment Prohibitions

GINA Title II, enforced by the EEOC, prohibits employers from:

- Requesting, requiring, or purchasing genetic information about an employee or applicant
- Using genetic information in employment decisions — hiring, firing, promotions, compensation, terms of employment
- Disclosing genetic information about employees except in narrow circumstances

**What this means for your clinic:**

A patient's employer has no legal basis to request genetic test results from the clinic. If an employer submits a records request that would include genetic testing results, you must either exclude the genetic information from the production or contest the request.

This applies even when an employer is requesting records for a purpose that appears legitimate — workers' compensation, a return-to-work evaluation, or an employer-sponsored wellness program. Genetic test results are not subject to disclosure to the employer without explicit patient authorization, and that authorization may be invalid if it was obtained under duress or as a condition of employment.

Small clinics with occupational health relationships need specific policies about excluding genetic information from employer records productions.

## State Genetic Privacy Laws

Several states have enacted genetic privacy laws that impose requirements beyond HIPAA and GINA. These laws vary significantly in scope and must be reviewed for clinics operating in the relevant states.

**Illinois Genetic Information Privacy Act (GIPA)**: One of the most comprehensive state genetic privacy statutes. Requires written informed consent before genetic testing. Prohibits insurers and employers from requiring or soliciting genetic information. Provides a private right of action. Applies to life insurance and disability insurance, which GINA does not cover.

**California Confidentiality of Medical Information Act (CMIA)**: Includes specific protections for genetic information and imposes additional consent requirements for the use of genetic information for insurance purposes.

**Other states with specific genetic privacy provisions**: Florida, Maryland, New York, Texas, and others have enacted varying genetic privacy protections. For clinics serving out-of-state telehealth patients, state-specific analysis is required.

**Practical guidance**: If your clinic orders genetic tests, check whether your state has a genetic privacy law in addition to HIPAA and GINA, and review how it affects your consent, storage, and disclosure practices.

## Storing Genetic Test Results in the EHR

Genetic test results stored in the EHR must be protected with the same controls as any other clinical PHI, plus additional access awareness:

**Access controls**: Configure EHR access so that genetic test results are accessible only to the clinical staff involved in the patient's care for the condition being tested. If your EHR allows sensitivity flagging for genetic results, use it.

**Audit logging**: Access to genetic test results should be logged under § 164.312(b). Given the heightened sensitivity of this information, review audit logs for genetic result access more frequently.

**Segregation from employer-accessible records**: If your clinic has any arrangements where employer access to records is contemplated (occupational health programs, employer-sponsored care), establish a technical or administrative barrier that prevents genetic test results from being included in any production to employers.

## Patient Access to Genetic Test Results

Patients have the right to access their genetic test results as part of their PHI under 45 CFR § 164.524. This right cannot be waived by a provider who is concerned about how the patient will respond to their results.

**Genetic counseling**: Best clinical practice is to provide genetic test results in the context of genetic counseling, particularly for hereditary disease risk results. HIPAA does not require this, but clinical guidelines and patient safety standards generally recommend it. If a clinic's policy is to deliver genetic results only with counseling, that is a clinical process standard — it should not be used to delay or deny access beyond HIPAA's 30-day timeline.

**For minors**: Genetic test results for minors are accessible to parents or legal guardians consistent with the parent-minor rules under 45 CFR § 164.502(g)(3). Some states have specific rules about minors' rights to genetic information related to adult-onset conditions — check state law.

## Sending Genetic Results to Specialists

When a patient is referred to a genetic counselor, oncologist, or other specialist for follow-up on genetic test results, the disclosure is a treatment-purpose disclosure under 45 CFR § 164.502(a)(1)(ii) — authorization is not required. However:

- Apply the minimum necessary standard: share the specific results relevant to the referral, not the patient's complete genetic record.
- Use secure transmission channels: genetic results should be sent via encrypted secure messaging, direct secure fax with confirmation, or EHR-to-EHR transfer — not standard email.
- Document the disclosure in the patient's chart.

For a comprehensive review of your PHI workflow compliance, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet). For an overview of what constitutes PHI, see [what is PHI](/learn/hipaa-basics/what-is-phi).

PHIGuard helps small clinics manage PHI workflow compliance tasks — including access controls for sensitive records, BAA tracking, and audit log review scheduling — at current pricing. Learn more at [PHIGuard HIPAA](/hipaa).
