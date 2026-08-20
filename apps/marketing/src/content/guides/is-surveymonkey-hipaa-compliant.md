---
title: "Is SurveyMonkey HIPAA Compliant for Patient Surveys?"
vendor: "SurveyMonkey"
seoTitle: "Is SurveyMonkey HIPAA Compliant?"
description: "What medical clinics need to know about SurveyMonkey's HIPAA compliance — which plan includes the BAA, which plans do not, and what steps must be completed before conducting patient surveys that collect PHI."
metaDescription: "Is SurveyMonkey HIPAA compliant? Only Enterprise plan includes a BAA. Standard, Advantage, and Premier have no HIPAA coverage. Learn what patient survey..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "SurveyMonkey offers HIPAA compliance only on its Enterprise plan, with a signed BAA. Standard, Advantage, and Premier plans have no HIPAA coverage available. Any patient satisfaction survey, outcomes measurement instrument, or health questionnaire that collects protected health information requires the Enterprise plan with a BAA executed before the first response is collected. Using lower-tier plans for patient surveys that collect health information is a compliance violation."
keyTakeaways:
  - "SurveyMonkey's Enterprise plan includes access to a BAA — all other plans (Standard, Advantage, Premier) do not."
  - "The BAA must be signed before any patient survey that collects PHI goes live — retroactive coverage is not available."
  - "Patient satisfaction surveys, outcomes questionnaires, and symptom tracking surveys are PHI-bearing if they identify respondents and collect health information."
  - "Anonymous patient surveys that collect no identifying information alongside health data may fall outside PHI requirements — confirm with your compliance advisor."
  - "Clinics evaluating survey tools for patient research or quality improvement programs must include BAA availability as a selection criterion."
sources:
  - title: "HIPAA Compliance"
    url: "https://help.surveymonkey.com/en/surveymonkey/billing/hipaa/"
    publisher: "SurveyMonkey"
  - title: "Privacy Notice"
    url: "https://www.surveymonkey.com/mp/legal/privacy/"
    publisher: "SurveyMonkey"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can a clinic use a standard SurveyMonkey plan for patient satisfaction surveys?"
    a: "Only if the survey collects no PHI. If patient satisfaction surveys include the patient's name, date of service, provider name, and any health-related response content, that combination is PHI. Standard plans have no BAA available. Use Enterprise or use a different tool with a BAA."
  - q: "Are post-visit patient surveys automatically PHI?"
    a: "Not automatically — it depends on the data collected. An anonymous survey with no name, no date, and no identifying context is lower risk. A survey sent to a named patient asking about specific treatment experiences, outcomes, or health status creates PHI when responses can be linked back to the individual. Confirm your survey design with a compliance advisor."
  - q: "Does SurveyMonkey's Enterprise plan automatically activate HIPAA compliance?"
    a: "No. Enterprise plan access gives you the ability to sign a BAA with SurveyMonkey. The BAA must be executed before collecting PHI. Upgrading to Enterprise without completing the BAA process does not create HIPAA coverage."
  - q: "What survey tools offer HIPAA BAAs at lower price points than SurveyMonkey Enterprise?"
    a: "Several healthcare-specific or HIPAA-focused form and survey tools offer BAAs at smaller scale. Evaluate tools such as Jotform HIPAA forms, REDCap (research-focused, often available through academic institutions), and EHR-native survey features. Evaluate each vendor's current terms and BAA scope before deploying."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Is SurveyMonkey HIPAA compliant for patient surveys? Only on the Enterprise plan with a signed BAA. Standard, Advantage, and Premier plans offer no HIPAA coverage. Patient satisfaction surveys, outcomes measurement tools, and health questionnaires that collect identifiable health information require the Enterprise plan with the BAA executed before the first response comes in. Lower-tier plans used for PHI-bearing patient surveys create an unprotected disclosure.

## SurveyMonkey's HIPAA plan structure

SurveyMonkey publishes its HIPAA compliance information in its billing and compliance documentation. The plan-level structure is clear:

| Plan | BAA available |
|---|---|
| Free | No |
| Standard | No |
| Advantage | No |
| Premier | No |
| Enterprise | Yes |

Enterprise is SurveyMonkey's organization-level plan. Pricing is negotiated and not published on SurveyMonkey's public pricing page. The BAA must be executed through SurveyMonkey's compliance team as part of the Enterprise agreement process.

This creates a significant cost threshold for clinics that want to use SurveyMonkey for patient surveys. A small clinic that needs to send quarterly patient satisfaction surveys faces an enterprise pricing conversation for what may be a modest survey volume.

## What constitutes PHI in the patient survey context

Not all patient surveys automatically involve PHI. The determination depends on what information the survey collects and whether it can be linked to an individual.

**PHI when surveys include:**
- Patient name or patient ID combined with any health-related response
- Email address or other contact information combined with health data (because these identifiers link responses to individuals)
- Date of service combined with provider name and a health-related rating or comment
- Any combination of identifiers + health information as defined under the HIPAA Privacy Rule's 18 identifiers

**Lower risk (but still evaluate carefully):**
- Fully anonymous surveys where responses cannot be linked to any individual — no pre-population of names, no email tracking, no response metadata linking back to patient records
- General satisfaction surveys about non-clinical aspects of the visit (parking, wait time, front desk courtesy) that include no health information

"Lower risk" is not "no risk." Confirm your survey design with your compliance advisor before concluding that anonymous surveys are entirely outside HIPAA scope for your specific use case.

## What the clinic must do before deploying patient surveys

If you determine that your patient surveys will collect PHI and you choose SurveyMonkey as your tool:

1. **Upgrade to Enterprise.** No lower tier provides a path to HIPAA compliance.
2. **Execute the BAA.** Work with SurveyMonkey's team to complete the BAA before any survey goes live. Keep signed documentation.
3. **Review the survey design.** Confirm each question, each pre-populated field, and each response collection setting with your compliance review process. Identify which data fields constitute PHI.
4. **Establish data handling procedures.** Define who has access to survey results, how results are stored after collection, and how long they are retained.
5. **Connect survey data storage to covered systems.** If survey results are imported into a practice management or EHR system, that system must also have a BAA.

## Alternatives to SurveyMonkey Enterprise for smaller clinics

SurveyMonkey Enterprise pricing is designed for organizations, not individual clinics. Smaller practices that need HIPAA-covered patient surveys have options:

**EHR-native patient surveys:** Many EHR platforms include patient questionnaire and survey features covered under the EHR's existing BAA. If your EHR supports it, this is often the most cost-effective path.

**Healthcare-specific form tools:** Jotform offers a HIPAA plan at lower price points than SurveyMonkey Enterprise. REDCap is a research-focused data capture tool widely available through academic and hospital research programs.

**Post-visit check-in via secure patient messaging:** For simple satisfaction feedback, a structured follow-up message through a secure patient messaging system (covered by the EHR's BAA) can replace a survey tool entirely.

## Quality improvement programs and HIPAA

Patient satisfaction measurement, CAHPS surveys, and outcomes tracking are valuable for clinical quality improvement. HIPAA does not prohibit these activities. The requirement is that any platform used to collect identifiable patient health information for these purposes has a BAA in place.

Small clinics often run informal quality improvement surveys using convenience tools — a quick Google Form, a SurveyMonkey free tier link in a post-visit message, a simple email reply. These informal approaches create PHI exposure when responses include identifiable health information, even at small scale. OCR does not distinguish between a 500-patient survey program and a 5-patient informal check-in when evaluating whether a BAA was required.

## Compliance operations for patient survey programs

Managing the compliance requirements for a patient survey program — BAA tracking, data retention policies, access control documentation — is part of a broader HIPAA compliance program. The decision to run patient surveys should be documented in a risk assessment that addresses tool selection, data handling, and retention.
