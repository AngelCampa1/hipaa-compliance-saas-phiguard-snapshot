---
title: "PHI in Lab Results Workflow: HIPAA Compliance for Clinics"
seoTitle: "PHI in Lab Results Workflow"
description: "Lab results contain PHI and flow through multiple systems — ordering, lab portal, EHR, patient portal, and fax. This guide covers access controls, patient notification rights, disclosure rules, and common violations."
metaDescription: "HIPAA for lab results workflows: minimum necessary access, patient right to results, sending results to referring providers, third-party authorization."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Lab results are PHI flowing through multiple systems — ordering interfaces, lab portals, EHR, patient portal, and fax. HIPAA requires minimum necessary access at each step, proper patient notification methods, TPO authorization for referring provider disclosures, and written authorization for third-party requests — with particular attention to misdirected faxes and unsecured result printouts."
keyTakeaways:
  - "Patients have a right of access to their lab results under 45 CFR § 164.524 — results may not be withheld simply because a provider wants to deliver them in person first."
  - "Sending lab results to a referring or consulting provider is a treatment-purpose disclosure that does not require patient authorization under 45 CFR § 164.502."
  - "Misdirected faxes are among the most common lab result HIPAA violations — fax number verification protocols are required."
  - "Sharing lab results with a family member without authorization violates 45 CFR § 164.502 regardless of how close the family relationship is."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR § 164.502 — Uses and Disclosures of PHI"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "45 CFR § 164.524 — Access of Individuals to PHI"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.524"
    publisher: "eCFR"
  - title: "CLIA Final Rule — Direct Patient Access to Test Reports"
    url: "https://www.federalregister.gov/documents/2014/02/06/2014-02280/clia-program-and-hipaa-privacy-rule-laboratory-test-reports"
    publisher: "CMS"
faq:
  - q: "Can a provider withhold lab results from a patient until they can discuss them in an appointment?"
    a: "In most cases, no. Under 45 CFR § 164.524, patients have the right to access their PHI, including lab results. The 2014 CLIA Final Rule also established patients' direct right of access to laboratory test reports. Limited exceptions exist — for example, if a licensed healthcare professional determines that access would endanger the patient's life or safety — but routine withholding of results pending an appointment is not permissible."
  - q: "Does a lab need a BAA with the clinic?"
    a: "Yes. A laboratory that performs tests ordered by the clinic and returns results to the clinic is a business associate — it creates and transmits PHI on behalf of the covered entity. Under 45 CFR § 164.308(b)(1), a BAA is required. Most established reference labs (Quest, LabCorp, and hospital-based labs) offer standard BAA forms. Ensure the BAA is signed before the first order is placed."
  - q: "Is leaving lab result printouts at the front desk a HIPAA violation?"
    a: "It depends on context, but it creates significant risk. Leaving printed lab results in an unsecured area where they could be viewed by other patients, visitors, or unauthorized staff is a failure of the safeguards requirement under 45 CFR § 164.530(c). Results should be handled directly by staff, placed in a file for secure retrieval, or routed through the patient portal — not left on a shared counter."
  - q: "Can the clinic use the patient's preferred communication method to send results?"
    a: "Yes, and they should. Under 45 CFR § 164.522(b), patients can request that the clinic communicate with them at a specific location or by a specific method. If a patient has indicated they prefer to receive results via the patient portal and not by phone, that preference should be honored and documented. Some patients prefer phone calls — that preference should also be honored, with results called to the verified patient phone number only."
---

When a front desk staffer leaves a printed CBC result on the check-in counter for a patient to pick up, that printout — combining the patient's name, date of service, and test result — is PHI sitting in an unsecured area. Lab results are among the most sensitive PHI a small clinic handles, and they travel through more systems than almost any other clinical document: from the ordering interface to the lab portal, to the EHR, to the patient portal, to printed result sheets, and sometimes to referring providers via fax or secure message.

Managing each transition in that process compliantly requires clarity about access, notification, and disclosure obligations.

## The Lab Results PHI Flow in a Small Clinic

A typical lab results process moves through these stages:

1. **Ordering**: Provider orders a test through the EHR or a lab portal. The order contains the patient's name, date of birth, diagnosis code, and the ordered test.
2. **Specimen collection**: A staff member collects the specimen, labeling it with patient identifiers.
3. **Lab transmission**: The specimen and order go to the reference lab, either physically or as an electronic order. The lab receives PHI.
4. **Result receipt**: The lab returns results via a secure interface, fax, or lab portal. The clinic receives the result.
5. **EHR filing**: The result is filed in the patient's chart.
6. **Notification**: The patient is notified of the result — by phone, patient portal message, or secure communication.
7. **Specialist disclosure**: If the result requires consultation, the clinic may send results to a referring or consulting provider.
8. **Patient access**: The patient may request a copy of results.

Each transition is a PHI handling event with specific compliance requirements.

## Access Controls: Who Can View Lab Results

Under 45 CFR § 164.514(d), access to lab results must be limited to staff who need them for their specific job function. In a small clinic:

- **Treating providers** need full access to results for patients they are managing.
- **MAs and clinical staff** need access to results for patients they are involved in caring for, to route critical values or initiate notification processes.
- **Billing staff** need access to the CPT codes and diagnosis codes associated with the tests — not necessarily the full result detail.
- **Front desk staff** generally do not need access to clinical lab results. If they are involved only in printing or routing results, limit their access to that specific function.

Review your EHR's result access configuration and ensure it aligns with the minimum necessary standard. Providing blanket result access to all staff because it is convenient is not compliant.

## Patient Right to Access Lab Results

Under 45 CFR § 164.524, patients have the right to inspect and receive copies of their PHI, including lab results. Additionally, the 2014 CLIA/HIPAA Joint Final Rule confirmed that patients have the right to direct access to laboratory test reports — meaning labs must provide results directly to patients who request them, and covered entities cannot block that access.

**What this means operationally:**

- Providers cannot routinely withhold results until the patient schedules a follow-up appointment.
- When a patient requests their lab results, the clinic must provide them within 30 days (or 60 days with documented extension).
- Saying "the doctor will call you" does not satisfy the right of access — if the patient requests the results in writing, the request is a formal access request.

**Limited exceptions:**

A licensed healthcare professional may determine, in the exercise of professional judgment, that access to specific information would endanger the patient's life or physical safety, or would cause harm to a third party. This is a narrow exception, not a general license to withhold uncomfortable results.

## Notifying Patients of Abnormal Results

Clinics typically have a protocol for routing and communicating abnormal or critical lab results. From a HIPAA perspective:

**Use the patient's preferred communication method.** Under 45 CFR § 164.522(b), patients can designate preferred communication methods. If a patient has requested that clinical communications go to a specific phone number or through the patient portal, follow that preference.

**Verify identity before disclosing results by phone.** Confirm the patient's date of birth and one other identifier before discussing results verbally. Do not leave detailed clinical results in a voicemail unless the patient has authorized receiving PHI in voicemails.

**Document the notification.** Log in the EHR that the patient was notified of results — the date, method, and the result communicated. If the patient could not be reached, document attempts and the actions taken.

**Critical values require escalation.** If a result is flagged as critical by the lab, the clinic's protocol should route it for immediate provider review and patient contact. Documentation of the notification is a HIPAA record.

## Sending Results to Referring Providers

Sharing lab results with another treating provider — a specialist, a consulting physician, or a primary care provider receiving a referral — is a treatment-purpose disclosure under 45 CFR § 164.502(a)(1). Treatment-purpose disclosures do not require patient authorization.

The minimum necessary standard still applies. When sending results to a referring provider:

- Send only the results relevant to the reason for the referral.
- Do not transmit a patient's complete labs history when the referring provider needs only the specific test result that prompted the consultation.
- Use secure transmission channels — encrypted fax with confirmation, EHR interface, or secure direct messaging.

## Sharing Results with Third Parties

Disclosures to anyone outside the treatment relationship — employers, insurers not involved in current treatment, attorneys, or family members not named in an authorization — require a signed patient authorization under 45 CFR § 164.502.

**Common scenarios requiring authorization:**

- An employer requesting confirmation of test results related to a pre-employment physical.
- An insurance company requesting results for a purpose other than processing the current claim.
- A patient's family member asking for results over the phone without the patient present and without a signed authorization.

When a request for results arrives without proper authorization, provide the requestor with the clinic's authorization form and wait for the completed authorization before releasing results.

## Common Violations in Lab Results Workflows

### Misdirected Faxes

Faxing lab results to the wrong number is one of the most common HIPAA violation patterns OCR sees. Preventive measures:

- Verify fax numbers before sending — do not rely on stored numbers that may be outdated.
- Use a fax confirmation cover sheet that requires the recipient to confirm receipt.
- If a fax is sent to the wrong number, contact the recipient immediately to confirm the fax was not reviewed and request that it be destroyed.
- Document the misdirected transmission and the steps taken to remediate it.
- Assess whether the incident meets the breach threshold under 45 CFR § 164.402.

### Leaving Result Printouts at the Front Desk

Printed lab results left on a shared counter, in an unsecured bin, or in a stack at the check-in desk are PHI visible to unauthorized persons. Route results to secure file locations, hand them directly to patients, or deliver via the patient portal — not on a shared surface.

### Sharing Results with Family Members Without Authorization

A patient's family member may call asking for results "on behalf of" the patient. Without a signed authorization, the family member does not have authority to receive the results. Direct the call to the patient.

For related guidance on minimum necessary principles in all PHI workflows, see [minimum necessary standard](/learn/hipaa-basics/minimum-necessary-standard). To assess your full PHI workflow compliance, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet).

PHIGuard gives small clinics a task management system to track lab workflow compliance reviews, document patient notification procedures, and manage PHI access policies — all at current pricing. Learn more at [PHIGuard HIPAA](/hipaa).
