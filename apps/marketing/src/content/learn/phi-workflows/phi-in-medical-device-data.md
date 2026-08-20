---
title: "PHI in Medical Device Data: What Small Clinics Must Know"
seoTitle: "PHI in Medical Device Data"
description: "Connected medical devices may transmit PHI to manufacturer clouds, EHRs, or patient apps. This guide covers BAA requirements, device inventory, decommissioning, and the clinical vs. consumer device distinction."
metaDescription: "HIPAA for medical device data: BAA requirements when devices transmit PHI to vendors, device inventory obligations, decommissioning procedures, and."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Connected medical devices that transmit patient data to EHR systems, manufacturer clouds, or clinical platforms create ePHI obligations. Small clinics must assess whether device manufacturers need BAAs, maintain device PHI inventories, secure data before decommissioning, and distinguish between devices used in clinical care and consumer wearables patients use independently."
keyTakeaways:
  - "If a medical device transmits data to the manufacturer's cloud or a third-party platform, the receiving party may be a business associate requiring a BAA under 45 CFR § 164.308(b)(1)."
  - "Device inventory is a HIPAA obligation — clinics must track which devices store or transmit ePHI and their security status."
  - "Decommissioning a connected device requires securely wiping or destroying stored patient data before disposal, consistent with 45 CFR § 164.310(d)."
  - "Consumer wearables patients use independently are generally not covered by HIPAA — but the data becomes PHI once a covered entity incorporates it into the medical record."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/phi-workflows"
sources:
  - title: "45 CFR § 164.310 — Physical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.310"
    publisher: "eCFR"
  - title: "45 CFR § 164.308 — Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "HHS — Health App Use Scenarios and HIPAA"
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/index.html"
    publisher: "HHS"
faq:
  - q: "Does a clinic need a BAA with the manufacturer of every connected medical device?"
    a: "Not necessarily. A BAA is required when the device manufacturer creates, receives, maintains, or transmits PHI on behalf of the covered entity. If the device transmits data only to the clinic's own EHR (with the clinic controlling the data), no manufacturer BAA is required. But if the device sends data to a manufacturer-operated cloud platform that the clinic then accesses for clinical purposes, the manufacturer is acting as a business associate and a BAA is required."
  - q: "What should a clinic do with a device that stored patient data before it is disposed of?"
    a: "Before disposing of any device that stored ePHI, the clinic must ensure the data is irretrievably destroyed. Under 45 CFR § 164.310(d)(2)(i), the covered entity must implement policies and procedures to address the final disposition of ePHI. For connected devices, this means either physical destruction of the storage component, cryptographic erasure if the device supports it, or manufacturer-confirmed factory reset that eliminates all stored patient data. Document the disposal date and method."
  - q: "Does HIPAA apply to data from a patient's personal fitness tracker?"
    a: "Generally, no — not while it remains on the tracker or the manufacturer's consumer app. Consumer wearable devices are used by the patient independently and are not operated by a covered entity or business associate. The data becomes PHI subject to HIPAA when a covered entity receives and incorporates it into the patient's medical record. At that point, the same PHI obligations apply as any other clinical data."
  - q: "What if a patient's implanted device sends data directly to the manufacturer without clinic involvement?"
    a: "This scenario requires careful analysis. If the device manufacturer receives implant performance data and shares it with the patient's clinic as part of the clinical workflow, the manufacturer may be a business associate. If the manufacturer receives data and uses it only for device monitoring and patient safety purposes under their own regulatory obligations (FDA reporting, for example), the HIPAA analysis is different. Consult with legal counsel for implanted device data arrangements."
---

When a Bluetooth-enabled blood pressure cuff transmits a reading to a manufacturer cloud dashboard that your clinic reviews, that transmission creates a business associate relationship — and a BAA obligation — that most small clinics have not addressed. Connected medical devices have become routine fixtures in clinic environments, from pulse oximeters and ECG monitors to infusion pumps and networked glucose analyzers. Each device may generate, store, or transmit patient data that qualifies as PHI when it identifies the patient and relates to their clinical care.

This guide walks through the key questions: when a BAA is needed, what to inventory, how to handle decommissioning, and where consumer devices fit.

## Which Device Data Is PHI?

Under 45 CFR § 160.103, PHI is individually identifiable health information that relates to health, treatment, or payment and identifies or could identify the individual. Medical device data that meets this definition includes:

- **Blood pressure readings** taken on a device associated with a named patient and stored in that device's memory or transmitted to the EHR.
- **ECG strips** generated by a clinic ECG monitor and stored in the patient's chart.
- **Glucose readings** from a clinic-owned meter linked to a patient identifier.
- **Pulse oximetry data** recorded in the EHR from a connected monitor.
- **Infusion pump logs** tied to a specific patient encounter.

The key connection is between the data and a patient identifier. A blood pressure reading with no patient association is not PHI. The same reading associated with a patient's name or medical record number is PHI.

## When Does a Device Manufacturer Need a BAA?

This is the central compliance question for small clinics with connected devices. Under 45 CFR § 164.308(b)(1), a BAA is required when a business associate creates, receives, maintains, or transmits PHI on behalf of the covered entity.

### Scenario 1: Device Sends Data to Clinic's Own EHR

If a device connects to the clinic's EHR via interface and the data flows directly into the EHR under the clinic's control, the manufacturer may not be acting as a business associate if they do not have access to the PHI. Evaluate whether the interface vendor (not just the device manufacturer) has PHI access.

### Scenario 2: Device Sends Data to Manufacturer's Cloud, Then to Clinic

If the device transmits data to a manufacturer-operated cloud platform and the clinic accesses that platform to review clinical data, the manufacturer is receiving and storing PHI on the clinic's behalf. This is a business associate relationship. A BAA is required.

**Examples where this commonly applies:**
- Remote cardiac monitoring services where device data goes to a monitoring center before reaching the clinic
- Networked infusion pump management platforms
- Connected glucose monitoring systems with cloud dashboards
- Remote blood pressure monitoring programs

### Scenario 3: Device Sends Data Directly to the Patient App

If the device transmits data to the patient's own consumer application and the patient independently decides to share that data with the clinic, the manufacturer is not a business associate of the clinic. The HIPAA obligation attaches when the clinic receives and incorporates the data.

## Device Inventory as a HIPAA Obligation

Under 45 CFR § 164.310(d)(1), covered entities must maintain policies and procedures governing the receipt and removal of hardware and electronic media containing ePHI. This creates an inventory obligation: if you do not know which devices store or transmit ePHI, you cannot maintain compliant policies for their receipt, use, and disposal.

**A device inventory for HIPAA purposes should capture:**

| Field | Example |
|---|---|
| Device name/model | Omron BP monitor, Model X-10 |
| Serial number | SN-123456 |
| Device type | Clinic-owned / Patient-provided |
| Storage capability | Local memory (patient readings) |
| Transmission capability | Bluetooth to EHR, Wi-Fi to manufacturer cloud |
| Manufacturer cloud involved? | Yes — CardioCare Platform |
| BAA status | BAA signed 2025-03-01 |
| Assigned location | Exam Room 2 |
| Disposal status | Active |

Review this inventory annually and update it whenever a new connected device is introduced to the clinic.

## Encryption of Data at Rest on Devices

Under 45 CFR § 164.312(a)(2)(iv), encryption of ePHI at rest is an addressable implementation specification. For medical devices that store patient data locally, your clinic should:

1. Determine whether the device encrypts stored data.
2. If not, assess whether the stored data constitutes PHI and whether the risk is acceptable.
3. Document the assessment.
4. If the risk is not acceptable and the device cannot be encrypted, limit local storage by configuring the device to transmit rather than retain.

Device manufacturers increasingly offer encrypted storage as standard. If a device does not, treat this as a procurement consideration — future device purchases should require encrypted storage for devices that handle identifiable patient data.

## Decommissioning Connected Devices

When a device reaches end of life, is replaced, or leaves the clinic's possession, the ePHI it stored must be addressed. Under 45 CFR § 164.310(d)(2)(i), covered entities must implement policies and procedures for the final disposition of ePHI on hardware and electronic media.

**Steps for decommissioning a connected medical device:**

1. **Identify stored data**: Determine what patient data (if any) is stored on the device.
2. **Wipe or destroy**: Perform a factory reset that eliminates all patient data, or — if the device cannot be reset — arrange for physical destruction of the storage component.
3. **Remove from manufacturer cloud**: If the device transmitted data to a manufacturer cloud platform, contact the manufacturer to confirm removal of the clinic's patient data from that platform per the BAA terms.
4. **Document the disposal**: Record the device serial number, the disposal date, the method of data destruction, and who performed it.

A decommissioned device that still contains identifiable patient readings — in device memory, on a removable storage card, or in a manufacturer cloud associated with the device — is an open compliance risk.

## Clinical Devices vs. Consumer Wearables: Where HIPAA Applies

### Devices Used in Clinical Settings

Any connected device that your clinic uses to capture, store, or transmit patient data in the course of providing care is within the HIPAA perimeter. Your clinic owns the compliance obligation for this data.

### Consumer Wearables Patients Use Independently

Patients who use consumer wearables — Apple Watch, Fitbit, continuous glucose monitors linked to consumer apps — are not using a covered entity's system. The data generated on these devices and stored in the manufacturer's consumer app is generally not PHI under HIPAA because it is not held by a covered entity or their business associate.

**When consumer data becomes PHI:**

When a patient shares data from a consumer wearable with their clinic provider — uploads it to the patient portal, shows it to a provider who incorporates it into the clinical note, or sends it via a covered communication channel — and the covered entity incorporates it into the patient's medical record, it becomes PHI at that moment.

Your clinic should have a policy for how to handle patient-submitted consumer device data:
- Which data is clinically relevant and should be incorporated into the record
- How it should be documented and stored
- Whether the patient's consumer app vendor needs a BAA (typically no, because they are not acting on behalf of the clinic)

For a comprehensive review of your clinic's PHI workflows, use the [PHI workflow audit worksheet](/resources/phi-workflow-audit-worksheet). For the minimum necessary standard as it applies to data access, see [minimum necessary standard](/learn/hipaa-basics/minimum-necessary-standard).

PHIGuard helps small clinics track device inventories, BAA registers, and decommissioning tasks alongside all other compliance obligations — with current pricing. Learn more at [PHIGuard HIPAA](/hipaa).
