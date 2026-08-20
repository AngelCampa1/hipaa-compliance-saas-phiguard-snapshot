---
title: "PHI in Patient Satisfaction Surveys: HIPAA Rules and Vendor BAAs"
seoTitle: "PHI in Patient Satisfaction Surveys: HIPAA Guide"
description: "Patient satisfaction surveys carry more PHI than most administrators realize, including names, contact details, and care dates. This guide covers the HIPAA rules, the TPO exception, and which survey vendors can sign a BAA."
metaDescription: "How PHI flows through patient satisfaction surveys, the HIPAA TPO exception that applies, and BAA requirements for survey vendors."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
intent: "consideration"
summary: "Patient satisfaction surveys touch contact information, encounter data, and sometimes free-text PHI in responses. The TPO exception generally permits surveys without authorization, but the survey vendor still needs a BAA. Many generic survey tools cannot provide one. It helps teams map where PHI appears in ordinary workflows, limit unnecessary exposure, and document the safeguards used around messages, files, devices, and vendors."
keyTakeaways:
  - "PHI in surveys includes patient name, contact information, date of service, provider identity, and any free-text health information patients write in responses."
  - "Patient satisfaction surveys generally fall under health care operations under 45 CFR 164.501 and do not require patient authorization."
  - "Generic survey tools such as SurveyMonkey, Typeform, and Google Forms typically do not offer BAAs in their standard plans, which makes them noncompliant for PHI."
  - "Healthcare-focused survey vendors such as Press Ganey and NRC Health offer BAAs and are designed to handle PHI."
  - "Verify that the BAA covers contact-list ingestion, response storage, free-text fields, and any analytics or benchmarking the vendor performs."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR Part 164 - HIPAA Privacy and Security Rules"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA Privacy Rule Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Do we need patient authorization to send a satisfaction survey?"
    a: "Generally no. Quality assessment and improvement activities, including satisfaction surveys, fall within health care operations as defined in 45 CFR 164.501. PHI may be used and disclosed for operations without authorization under 45 CFR 164.506. Marketing rules under 45 CFR 164.508(a)(3) are different and may apply if the survey is paid for by a third party promoting a product or service."
  - q: "Is the patient's name on a survey contact list really PHI?"
    a: "Yes. A list of names with the inference that each person received care at your clinic on a specific date is PHI under 45 CFR 160.103. The list itself is identifiable health information."
  - q: "What if patients write health details in the free-text response?"
    a: "Free-text responses become PHI when they contain identifiable health information, which they often do. The survey platform that stores those responses must be a business associate with a signed BAA."
---

Patient satisfaction surveys look administratively light, so they are often handled with whatever tool was already in the office. That tool is sometimes the right one, and sometimes it is a generic form builder with no BAA on file. Either way, the data flowing through it is PHI.

This guide covers what is in a survey, the HIPAA rules that apply, the gaps that show up at audit, and what to look for in the vendor agreement.

## What PHI flows through patient satisfaction surveys

A standard satisfaction survey carries more identifiers than most administrators expect:

- **Patient identifiers** - name, email, phone number, sometimes member ID.
- **Encounter context** - date of service, location, provider name, sometimes the visit type or department.
- **Response content** - Likert ratings, NPS scores, and free-text comments. Comments routinely contain PHI: the patient mentions a diagnosis, a medication, a symptom, or a family member's condition.
- **Routing metadata** - which provider, department, or service line the response is associated with.

The contact list is PHI on its own. The response set is PHI when responses are linked to identifiers, and the free-text comments are PHI even when they are not, because patients reveal identifiable health details in their own words.

## HIPAA requirements that apply

- **Health care operations** - 45 CFR 164.501 includes quality assessment and improvement activities within the definition of health care operations. Patient satisfaction measurement falls inside this definition.
- **Permitted use without authorization** - Under 45 CFR 164.506, PHI may be used and disclosed for treatment, payment, and operations without separate authorization.
- **Business associate** - A survey vendor that creates, receives, maintains, or transmits PHI on behalf of the covered entity is a business associate under 45 CFR 160.103. A BAA is required under 45 CFR 164.504(e).
- **Marketing exclusion** - If a third party pays the practice to send a survey that promotes a product or service, the marketing rules under 45 CFR 164.508(a)(3) apply and authorization may be required. Standard internal quality surveys are not marketing.
- **Minimum necessary** - Under 45 CFR 164.502(b), only the identifiers needed to send and analyze the survey should be sent to the vendor.
- **Security Rule safeguards** - Encryption, access controls, and audit logging at the vendor under 45 CFR 164.308 and 164.312.

## Common compliance gaps in patient satisfaction surveys

**1. Generic survey tools with no BAA.** SurveyMonkey, Typeform, Google Forms, and Microsoft Forms in their standard tiers do not offer BAAs and are not appropriate for PHI. SurveyMonkey offers a HIPAA-enabled enterprise plan; the standard plan does not qualify. Microsoft Forms in a covered Microsoft 365 tenant may be covered, but the default consumer version is not.

**2. Sending more identifiers than necessary.** Practices often upload the full demographic export when the vendor only needs name, email, and visit date. Trim the list to minimum necessary before upload.

**3. Free-text comments treated as non-PHI.** Comment boxes are the highest-density PHI in the entire survey. They need the same encryption and access controls as the contact list.

**4. Internal sharing without controls.** Survey results get forwarded to managers, providers, and ownership in unencrypted email or shared spreadsheets. Reports that include identifiable comments are PHI and need the same protections as any other clinical export.

## How to make patient satisfaction surveys HIPAA-compliant

1. **Pick a survey vendor that offers a BAA.** Healthcare-focused platforms such as Press Ganey and NRC Health are designed for this and will sign one. SurveyMonkey's HIPAA-enabled plan and an enterprise Microsoft Forms tenant under a Microsoft BAA can also work. Consumer-tier Google Forms, Typeform, and standard SurveyMonkey cannot.
2. **Sign the BAA before any data is uploaded.** No exceptions for pilot or trial use.
3. **Send the minimum identifier set.** Name, email or phone, visit date, provider. Drop date of birth, address, and clinical fields unless the survey logic actually requires them.
4. **Lock down internal distribution.** Reports stay inside the EHR, the survey platform, or an encrypted shared drive with role-based access. No unencrypted email forwards of comment-level data.
5. **Honor patient rights.** Survey responses become part of the operations record. Patients may request access under 45 CFR 164.524 and amendment under 45 CFR 164.526. Train staff to route those requests.

## Vendor BAA requirements for patient satisfaction survey software

The BAA should specifically address:

- **Scope of PHI** - contact lists, response data, free-text comments, metadata, and any identifiers used for routing or benchmarking.
- **Permitted uses** - limited to providing the survey service to the covered entity. No use of identifiable PHI for the vendor's own marketing, sale to third parties, or product development outside contracted services.
- **Benchmarking and aggregate reporting** - many healthcare survey vendors produce industry benchmarks. Confirm in writing whether benchmarks use de-identified data under 45 CFR 164.514 and how the de-identification is performed.
- **Subcontractors** - email senders, SMS providers, hosting, analytics. Each requires a downstream BAA under 45 CFR 164.308(b).
- **Security controls** - encryption in transit and at rest, MFA, access logging, incident response.
- **Breach notification** - defined window, support for the practice's notification obligations under 45 CFR 164.404.
- **Termination** - return or destruction of PHI, including responses and contact lists, with written attestation.

For deeper guidance on when an outside vendor crosses into business associate territory, see [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa). The [PHI workflows hub](/learn/phi-workflows) covers the rest of the data flows that touch your practice.

When you want vendor BAAs, survey-vendor risk reviews, and minimum-necessary policies tracked in one compliance system, [PHIGuard](/hipaa) is built for clinics with 3 to 50 staff and publishes BAA details on the pricing page.
