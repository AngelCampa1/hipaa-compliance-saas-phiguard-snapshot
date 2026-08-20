---
title: "PHI in Remote Patient Monitoring: HIPAA Compliance for Small Clinics"
seoTitle: "PHI in Remote Patient Monitoring"
description: "Remote patient monitoring devices transmit ePHI from patients to clinical teams. This guide covers BAA requirements, encryption, access controls, patient consent, data retention, and device disenrollment obligations."
metaDescription: "HIPAA for remote patient monitoring: BAA with RPM vendors, encryption requirements, access controls, audit logging, patient enrollment consent, data."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Remote patient monitoring (RPM) devices transmit physiological data — blood pressure, glucose, weight, SpO2 — from patients to clinical teams. This data is ePHI when received by a covered entity. HIPAA requires BAAs with RPM platform vendors, encryption in transit and at rest, role-based access for care team members, patient consent, and secure data handling at disenrollment or device return."
keyTakeaways:
  - "An RPM platform that receives and stores patient physiological data on behalf of a covered entity is a business associate requiring a BAA before enrollment begins."
  - "RPM data access should be role-based — only assigned care team members should view a patient's RPM readings."
  - "Documentation of clinical review of RPM data is both a billing requirement for RPM codes and a HIPAA record that must be retained."
  - "When a patient is disenrolled from an RPM program or returns a device, the clinic must confirm that stored PHI on the device is destroyed and removed from the platform."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR § 164.312 — Technical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "45 CFR § 164.308 — Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "CMS RPM Billing Requirements — CPT 99453, 99454, 99457, 99458"
    url: "https://www.cms.gov/medicare/physician-fee-schedule/search/overview"
    publisher: "CMS"
faq:
  - q: "Does the RPM device manufacturer need a BAA?"
    a: "It depends on what the manufacturer does with the data. If the manufacturer's platform receives, stores, and transmits RPM data to the clinic on the clinic's behalf, the manufacturer is a business associate and a BAA is required. If the device transmits data only to the clinic's EHR via a direct interface with no manufacturer cloud involvement, the manufacturer may not require a BAA — but this arrangement should be confirmed. Most RPM platform vendors explicitly offer BAAs as part of their healthcare product tier."
  - q: "Does patient consent for RPM cover all HIPAA requirements?"
    a: "No. Patient consent for RPM enrollment is a clinical and billing requirement — it is not a substitute for HIPAA compliance. Enrolling a patient in RPM means you are creating a PHI data stream that must be protected under the Security Rule, regardless of whether the patient consented to participate. Consent documentation is also PHI and must be retained. HIPAA obligations and RPM consent obligations are parallel, not interchangeable."
  - q: "Are RPM readings documentation that patients can access?"
    a: "Yes. RPM readings received and incorporated into the patient's record are PHI subject to the patient's right of access under 45 CFR § 164.524. The readings are part of the patient's designated record set. If a patient requests access to their RPM data as part of a records request, the clinic must include it."
  - q: "What happens to RPM data when the clinic changes RPM vendors?"
    a: "Before transitioning vendors, confirm with the current vendor how patient data will be handled: whether it can be exported, when it will be deleted from the vendor's systems, and whether the vendor will provide written confirmation of deletion. The BAA with the current vendor governs this process. Data migration or deletion must be completed before the BAA terminates."
---

When a patient with hypertension takes their morning blood pressure using your clinic's RPM device, that reading — transmitted to the vendor platform your care team reviews — is ePHI the moment your covered entity receives it. Remote patient monitoring programs have expanded significantly as CMS introduced specific billing codes (CPT 99453, 99454, 99457, 99458) that reimburse clinicians for device setup, data collection, and clinical review. Small clinics implementing RPM to manage chronic conditions — hypertension, diabetes, heart failure, COPD — are creating a continuous stream of ePHI that requires careful compliance management.

This guide covers the complete HIPAA compliance picture for RPM programs: vendor selection, BAA requirements, access controls, patient enrollment, data retention, and what happens when a patient leaves the program.

## RPM Data Is ePHI When Received by a Covered Entity

Remote patient monitoring devices transmit physiological data — blood pressure readings, blood glucose values, weight measurements, SpO2 levels, ECG rhythms, activity data — to a platform that the clinical team reviews.

This data is ePHI under 45 CFR § 160.103 when:

- It identifies the patient (linked to a name, device ID associated with a patient record, or other identifier)
- It relates to the patient's health or treatment
- It is received by a covered entity or business associate

The data becomes PHI at the moment the covered entity receives it. Prior to receipt — while it is solely in the patient's hands on a consumer-type device — the patient is the controller and HIPAA may not apply. The transition occurs when the covered entity begins receiving and reviewing the data for clinical purposes.

## BAA Requirement for RPM Platform Vendors

Most RPM programs involve a vendor platform that:

- Receives device transmissions
- Stores the physiological readings
- Displays a dashboard for clinical review
- May generate alerts for critical values
- Transmits data summaries to the EHR

This vendor is a business associate under 45 CFR § 160.103 — it creates, receives, maintains, and transmits PHI on behalf of the covered entity. A BAA must be in place before the first patient is enrolled.

**What to look for in an RPM vendor BAA:**

- Permitted uses: data may only be used to provide the RPM service, not for vendor analytics, product improvement, or marketing.
- Encryption requirements: data encrypted in transit (TLS 1.2+) and at rest (AES-256 or equivalent).
- Subcontractor obligations: if the vendor uses subcontractors (alert monitoring services, device logistics companies), the vendor must have BAAs with those subcontractors.
- Breach notification: vendor must notify the covered entity of any breach within 60 days of discovery.
- Return or destruction: upon termination, all PHI must be returned to the clinic or destroyed, with written confirmation.

If a vendor does not offer a BAA, they cannot participate in your RPM program. Proceeding without a BAA is an unauthorized disclosure of every enrolled patient's PHI.

## Encryption Requirements for RPM Data

RPM data in transit and at rest must meet the Security Rule's encryption standards:

**In transit (45 CFR § 164.312(e))**: The transmission from the monitoring device to the vendor platform must be encrypted. Verify that the RPM device uses encrypted transmission protocols — Bluetooth with encryption enabled, or cellular transmission via TLS. Do not assume encryption — confirm it with the vendor.

**At rest (45 CFR § 164.312(a)(2)(iv))**: RPM readings stored on the vendor platform must be encrypted. Confirm this with the vendor and request documentation.

**In EHR (existing protections)**: When RPM readings are transmitted to and stored in the EHR, they fall under the EHR's existing encryption and access control infrastructure. Confirm that the EHR integration with the RPM platform transmits data securely (via a signed interface agreement, ideally covered by the EHR vendor's existing BAA).

## Access Controls for RPM Data

Under 45 CFR § 164.512(a)(1), access to ePHI must be limited to authorized individuals. For RPM programs:

- **Assigned care team members** for each enrolled patient should have access to that patient's RPM dashboard.
- **Clinical staff not involved in the patient's RPM care** should not have access to RPM readings.
- **Billing staff** may need access to the CPT code documentation — the fact of device use and clinical review — but not necessarily the underlying physiological readings.
- **Administrative staff** generally have no RPM access need.

Configure the RPM platform's access controls to reflect these distinctions. Most RPM platforms allow patient-level access assignment — assign each enrolled patient to their care team members only.

## Audit Logging for RPM Data Access

Under 45 CFR § 164.312(b), audit controls must record who accesses ePHI and when. For RPM platforms:

- Confirm that the vendor's platform maintains access logs.
- Verify that logs include who viewed a patient's RPM data, when they viewed it, and any actions taken (alerts dismissed, data exported).
- Establish a periodic log review process — review access logs for RPM data quarterly at minimum.

Access logs are also relevant for billing compliance. RPM billing codes require documented clinical review of data — audit logs can corroborate when and by whom data was reviewed.

## Patient Consent for RPM Enrollment

Before enrolling a patient in an RPM program:

1. **Obtain written RPM enrollment consent** that describes:
   - What data will be collected and how often
   - Who will have access to the data
   - How the data will be used (clinical management, billing)
   - How long the data will be retained
   - The patient's right to withdraw from the program

2. **Document consent in the patient's chart** — the consent form itself is PHI.

3. **Note that RPM consent is separate from HIPAA authorization** — consent to participate in an RPM program is not an authorization under HIPAA's § 164.508. HIPAA authorization would only be required for uses of RPM data beyond treatment, payment, and operations.

4. **Confirm the patient's preferred communication method** for receiving RPM-related updates — alert notifications, data summaries, clinical guidance based on readings.

## RPM Documentation Is Both PHI and a Billing Requirement

CMS requires documentation of clinical review for RPM billing codes:

- **CPT 99457 and 99458** require a minimum of 20 minutes of clinical staff time per month reviewing RPM data, with documented interaction with the patient.
- Documentation of when data was reviewed, by whom, and what clinical decisions resulted from the review is required for billing.

This documentation is PHI. Store it in the patient's EHR, access-control it, and retain it per your records retention schedule. The same documentation that supports billing compliance also demonstrates HIPAA compliance — appropriate clinical review by authorized staff, documented in a secure system.

## Data Retention for RPM Records

RPM readings incorporated into the patient's medical record are subject to the clinic's standard medical records retention schedule. Most state laws require a minimum of 7-10 years for adult patient records.

Raw RPM data held only on the vendor platform — not yet transmitted to the EHR — may have a shorter retention period defined in the BAA. Confirm with the vendor how long raw data is retained and whether this aligns with your clinical needs.

## Device Disenrollment and Return

When a patient concludes an RPM program — by completing a time-limited monitoring period, by withdrawing from the program, or by leaving the practice — the device and associated data must be handled compliantly.

**Device return:**

1. When a patient returns a clinic-owned RPM device, factory-reset the device to clear all stored readings.
2. Document the device return date and the data erasure.
3. If the device cannot be reset, do not reissue it — have it destroyed or returned to the manufacturer for secure disposal.

**Vendor platform data:**

1. When a patient is disenrolled, notify the RPM vendor.
2. Confirm whether the data will remain in the platform (for billing audit purposes) or be removed.
3. Remove active access for the care team members assigned to the patient — they no longer have a clinical basis to access that patient's data.

**Data retention after disenrollment:**

RPM data incorporated into the EHR stays in the EHR under the standard retention schedule. Data held only on the vendor platform should be handled per the BAA's retention and termination provisions.

For a comprehensive review of PHI in your clinic's technology processes, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet). For guidance on how medical device data fits into the HIPAA framework more broadly, see [PHI in medical device data](/learn/phi-workflows/phi-in-medical-device-data).

PHIGuard helps small clinics manage RPM compliance tasks — BAA tracking, access review scheduling, and patient enrollment documentation — at current pricing with BAA details available during plan review. Learn more at [PHIGuard HIPAA](/hipaa).
