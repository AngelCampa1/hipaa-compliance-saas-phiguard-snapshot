---
title: "PII Meaning and Examples"
seoTitle: "PII Meaning: Examples and Definition"
description: "A plain-language definition of PII, how it differs from PHI, and why the distinction matters for healthcare teams."
metaDescription: "PII stands for Personally Identifiable Information. Learn the definition, how it overlaps with PHI, and what healthcare teams need to know."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "hipaa-basics"
schemaType: "defined-term"
term: "PII"
intent: "awareness"
summary: "PII stands for Personally Identifiable Information - any data that can identify a specific individual. In healthcare, PII and PHI overlap significantly, but PHI is the stricter category governed by HIPAA. Understanding both terms helps clinic staff correctly classify data and apply the right protections."
keyTakeaways:
  - "PII stands for Personally Identifiable Information - any data point that identifies a specific person."
  - "PHI is a subset of PII that adds health, treatment, or payment context and is regulated by HIPAA."
  - "In healthcare, most PII about a patient is also PHI and must be treated accordingly."
  - "Some PII - such as employee contact information - is not PHI and falls under different laws."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "Summary of the HIPAA Privacy Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html"
    publisher: "HHS"
  - title: "NIST Guide to Protecting PII (SP 800-122)"
    url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-122.pdf"
    publisher: "NIST"
faq:
  - q: "What does PII stand for?"
    a: "PII stands for Personally Identifiable Information. It is a general term for any data that can identify a specific individual, used across government, privacy law, and technology contexts."
  - q: "Is PII the same as PHI?"
    a: "No. PII is a broader category. PHI is PII that also involves health, treatment, or payment for care, and is regulated by HIPAA. All PHI is PII, but not all PII is PHI."
  - q: "Which law governs PII in healthcare?"
    a: "HIPAA governs PHI - the health-related subset of PII. General PII that is not tied to health may fall under state breach notification laws, FTC rules, or sector-specific regulations depending on context."
---

**PII** stands for **Personally Identifiable Information**. It refers to any data point or combination of data points that can be used to identify a specific individual. The term is used across government, privacy law, and technology - most prominently in the NIST Special Publication 800-122 framework and in state privacy regulations.

## What counts as PII

Common PII examples include:

- Full name
- Date of birth
- Home or email address
- Phone number
- Social Security number
- Passport or driver's license number
- IP address
- Biometric data (fingerprints, facial images)
- Device identifiers

Any one of these, or a combination of less-obvious fields that together identify a person, qualifies as PII. Context matters: a first name alone is usually not PII, but a first name plus a birthdate plus an employer can be.

## How PII and PHI relate

In healthcare, PII and PHI overlap substantially. The table below shows the relationship:

| Category | Identifies a person | Involves health/payment | Governed by |
|----------|--------------------|-----------------------|-------------|
| PII (general) | Yes | Not required | State law, FTC, sector rules |
| PHI | Yes | Yes | HIPAA Privacy + Security Rules |
| ePHI | Yes | Yes (electronic) | HIPAA Security Rule |

PHI is the stricter, narrower category. When patient PII appears alongside a diagnosis, appointment, or billing record, the entire record becomes PHI and HIPAA applies.

## PII that is not PHI in a clinic setting

Not everything in a clinic's systems is PHI. Examples of PII that may fall outside HIPAA:

- Staff names, addresses, and Social Security numbers in HR records (covered by employment law, not HIPAA)
- Vendor contact information
- A patient's name in a generic marketing list not tied to care or payment

Even when data does not meet the PHI definition, it may still require protection under state breach notification laws. Clinics in California, for example, face obligations under the California Consumer Privacy Act for certain PII.

## Why the distinction matters for healthcare teams

Healthcare staff often encounter the term PII in security training, vendor documentation, and state regulations. The safest operating rule: if the PII relates to a patient's health or billing, treat it as PHI and apply HIPAA controls.

For the full breakdown of what makes information identifiable, see [18 HIPAA Identifiers](/learn/phi-fundamentals/18-hipaa-identifiers). For a direct comparison of PHI and PII in workflow terms, see [PHI vs PII](/learn/phi-fundamentals/phi-vs-pii).

PHIGuard applies PHI-level controls to all patient-linked data in the platform. BAA details are published on the [pricing page](/pricing), regardless of whether the data would be technically classified as PII or PHI.


## Clinic operating guidance

Treat PII Meaning and Examples as an operational control, not only as a reference topic. A small clinic should name the person who owns the workflow, list the systems where PHI or compliance evidence may appear, and decide what must be recorded when the issue comes up. That record can be simple, but it should show the date, the people involved, the systems checked, and the reason the clinic chose its next step.

Start with the HIPAA rule that is closest to the work. Privacy Rule topics usually require the clinic to ask whether the use or disclosure is permitted, limited to the minimum necessary where that standard applies, and consistent with patient rights. Security Rule topics usually require an inventory of systems, access controls, audit activity, and risk management follow-up. Breach topics require a fact-based review of what happened, who received the information, whether PHI was actually viewed or acquired, and what mitigation changed the risk.

## Evidence to keep

For PII Meaning and Examples, the evidence should be practical enough for a manager to maintain. Keep the policy or checklist version that was in effect, the staff or vendor responsible for the work, and the dated notes showing what was reviewed. If the issue involves policy ownership or recurring review, preserve the screenshots, logs, tickets, messages, or vendor records that explain the decision. If it involves staff follow-up or audit evidence, record who approved the action and when the follow-up should be checked again.

Use the page topic as the operating standard: define the owner, the affected systems, the review trigger, and the evidence the clinic will keep. Those points should be reflected in the clinic's actual records. A page that says the clinic reviews access quarterly is weaker than a review log showing the user list, exceptions, removals, and owner sign-off. A policy that says vendors are reviewed is weaker than a vendor file with the BAA status, PHI use case, renewal date, and incident contact.

## Review cadence

Review PII Meaning and Examples when the clinic changes software, adds a location, changes staffing, receives a patient complaint, identifies a suspected incident, or updates a vendor relationship. Annual review is useful, but it is not enough when the workflow changes sooner. The clinic should also connect this topic to training so front desk, billing, clinical, and management staff understand the examples they are most likely to see.

The goal is not to create a large binder. The goal is to leave enough evidence that another reviewer can understand what the clinic knew, what rule or source it relied on, what action it took, and what still needs follow-up. That is the level of documentation that makes HIPAA work repeatable in a small clinic instead of dependent on memory.
