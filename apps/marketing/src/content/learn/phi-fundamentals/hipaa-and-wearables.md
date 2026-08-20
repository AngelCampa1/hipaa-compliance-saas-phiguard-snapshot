---
title: "HIPAA and Wearable Devices: When Fitbit and Apple Watch Data Is PHI"
seoTitle: "HIPAA and Wearable Devices Explained"
description: "Consumer wearables are not covered entities. But when a clinic receives wearable data and incorporates it into patient care, that data becomes PHI. Remote patient monitoring creates new compliance obligations that many small clinics have not addressed."
metaDescription: "HIPAA and wearable devices: when Fitbit, Apple Watch, and Garmin data becomes PHI, what BAA obligations arise, and how FTC rules cover gaps HIPAA doesn't."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: phi-fundamentals
intent: awareness
schemaType: article
summary: "Wearable health devices generate health data, but consumer wearable vendors are not covered entities and are not subject to HIPAA on their own. HIPAA applies when a covered entity receives and uses that data for treatment. When that threshold is crossed, normal PHI obligations apply — including the requirement for a BAA with any vendor transmitting the data to the clinic."
keyTakeaways:
  - "Consumer wearable vendors (Apple, Fitbit, Garmin, Oura) are not HIPAA covered entities. Their devices do not generate PHI solely by collecting data."
  - "When a covered entity receives wearable data and uses it in a patient's care, the data becomes PHI at the moment of incorporation into a care relationship."
  - "Any vendor transmitting wearable data to a clinic's systems must have a signed BAA if it is creating, receiving, maintaining, or transmitting PHI on the clinic's behalf."
  - "The FTC Health Breach Notification Rule applies to personal health record vendors — including some wearable platforms — even when HIPAA does not."
  - "Remote patient monitoring programs need a documented data flow showing where wearable data goes, who handles it, and what BAAs are in place."
sources:
  - title: "HIPAA Privacy Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
    publisher: "HHS"
  - title: "FTC Health Breach Notification Rule FAQs"
    url: "https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business"
    publisher: "FTC"
faq:
  - q: "Is my patient's Apple Watch data PHI?"
    a: "Not inherently. Apple Watch data created and stored by a patient in their personal Apple Health account is under the patient's control — Apple is not acting as a covered entity or business associate in that context. The data becomes PHI when your clinic receives it, incorporates it into the patient's care record, and uses it in connection with treatment. At that point, HIPAA obligations attach."
  - q: "Do I need a BAA with Apple, Fitbit, or Garmin?"
    a: "Only if those vendors are transmitting data directly to your clinic's systems in a way that makes them a business associate. If a patient manually exports and emails you a Garmin activity summary, the vendor is not acting as a BA. If you have a formal remote patient monitoring integration where the vendor's platform pushes data to your EHR, the vendor is likely a BA and a BAA is required."
  - q: "What is the FTC Health Breach Notification Rule and when does it apply?"
    a: "The FTC's Health Breach Notification Rule applies to personal health record vendors and their service providers — businesses that are not HIPAA-covered entities but that handle identifiable health information. If a wearable platform stores health data and is breached, it may be required to notify affected users and the FTC under this rule even though HIPAA does not apply to it."
  - q: "What compliance steps are needed for a remote patient monitoring program?"
    a: "Document the data flow: which device, which platform, how data moves to your clinic, which staff access it, and where it is stored. Identify every vendor in the chain. Determine BA status for each. Obtain BAAs from qualifying vendors. Incorporate RPM data into your existing minimum necessary access controls and audit trail."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

Fitbit, Apple Watch, Garmin, and Oura are not covered entities. They are consumer electronics companies. They do not transmit your patients' health data to you as part of a covered health care transaction. On their own, they are outside the boundaries of HIPAA.

That changes the moment your clinic steps in.

When a clinic receives wearable data from a patient and incorporates it into that patient's care — uses it to adjust a medication, reviews it during a visit, stores it in the EHR — the data enters your covered entity's custody. At that point, HIPAA's full framework applies. The data is PHI. The people and systems handling it are subject to the minimum necessary standard, access controls, audit logging, and breach notification requirements.

Remote patient monitoring has made this more than a theoretical concern. Clinics running RPM programs are receiving continuous streams of patient biometric data. The compliance obligations attached to that data often have not kept pace with the clinical workflows that produce it.

## When Wearable Data Becomes PHI

PHI is defined as individually identifiable health information that is created, received, maintained, or transmitted by a covered entity or business associate. The definition has two prongs that both must be met: the information must be individually identifiable AND it must be in the hands of a covered entity or business associate.

A patient wearing an Apple Watch and having Apple store their heart rate, sleep, and activity data in their personal Health app has not yet triggered HIPAA. The data is theirs, stored on a consumer platform, controlled by them. Apple is not their physician's business associate.

The moment the patient shares that data with your clinic — exports it, sends it through an RPM platform that forwards it to your EHR, or brings a printed summary to an appointment — the situation changes:

- If the data is reviewed and noted in the medical record, it has been "received" by a covered entity and is now PHI.
- If it informs a clinical decision — a change in treatment, a follow-up test order — the connection to health care provision is explicit.
- If it is stored in your EHR alongside the patient's other health records, it is PHI maintained by a covered entity.

The transition is not always a formal act. A physician who pulls up a patient's wearable data from a shared portal during a visit and enters an observation in the EHR has turned that data into PHI without any special intent.

## Vendor Obligations: When a BAA Is Required

The BAA requirement applies to business associates — entities that create, receive, maintain, or transmit PHI on behalf of a covered entity. A wearable platform becomes a business associate when it:

- Transmits patient wearable data directly to the clinic's EHR or clinical systems
- Stores wearable data in a platform that the clinic accesses as part of clinical care
- Processes wearable data and generates clinical reports that the clinic uses in treatment decisions

In these configurations, the wearable platform vendor is performing a function that involves PHI on the clinic's behalf. A BAA is required before that data flow may legally operate.

Major clinical RPM vendors understand this and offer standard BAAs. The problem arises with consumer wearable integrations that were not designed for clinical use — informal connections between consumer health apps and clinical portals that no one formally evaluated for BA status.

The practice test: does the vendor have access to data that would identify a patient AND relate to their health or health care, AND is that access happening in service of the clinic's operations? If yes, the vendor is a BA and a BAA is required.

If a consumer wearable vendor does not offer a BAA, the clinic cannot use that vendor as part of a clinical care workflow without creating a HIPAA violation. That is a practical limit on which RPM integrations are permissible.

## The FTC Health Breach Notification Rule: Where HIPAA Does Not Reach

HIPAA's jurisdiction ends at covered entities and their business associates. Consumer wearable vendors, operating purely as consumer businesses, are outside HIPAA's reach.

The FTC fills part of that gap through its Health Breach Notification Rule, which applies to vendors of personal health records (PHR vendors) — businesses that maintain health records for individuals outside of HIPAA's covered entity framework — and to their service providers.

If a wearable platform qualifies as a PHR vendor under the FTC rule, it must:

- Notify affected consumers within 60 days of discovering a breach of unsecured identifiable health information
- Notify the FTC no later than when consumer notification is sent
- For breaches affecting 500 or more consumers in a state, notify prominent media outlets in that state

The FTC has updated and enforced this rule with increased rigor in recent years. Companies that collect health data and experience breaches — including some fitness app operators — have faced FTC action even where HIPAA did not apply.

For your clinic, the practical implication: if you recommend a wearable platform to patients for RPM purposes, the vendor's own compliance with the FTC rule is a factor in your vendor vetting process. A vendor that cannot articulate its breach notification obligations under either HIPAA or FTC rules is a risk.

## Remote Patient Monitoring: A Compliance Checklist

RPM programs that use wearable data need a documented compliance structure. The minimum:

**Data flow documentation.** Identify each data element collected by the wearable device, the path it travels (device → vendor platform → clinic EHR, for example), every system and vendor it passes through, and who at the clinic can access it.

**BA identification.** For each vendor in the data flow, determine whether they meet the BA definition. Any vendor that stores, processes, or transmits PHI on your behalf is a BA.

**BAA execution.** Obtain signed BAAs from all qualifying vendors before activating the integration. Document the BAA in your vendor management records.

**Minimum necessary access.** RPM data should be accessible only to clinical staff with a treatment relationship to the patient. Apply the same role-based access controls you apply to EHR data.

**Audit logging.** Confirm that your EHR logs access to RPM data the same way it logs access to other PHI. Access to wearable data without a treatment justification is a potential privacy violation.

**Patient authorization.** Determine whether your RPM enrollment process adequately informs patients about how their wearable data will be used, who will have access, and how it will be stored. While HIPAA does not require patient authorization for uses within treatment, patient transparency reduces complaint risk.

**Incident response integration.** A breach of RPM data — unauthorized access to the wearable integration, a vendor-side exposure — triggers your breach response procedures the same as any other PHI breach. Confirm your incident response plan addresses data received from external platforms.

The growth of remote patient monitoring is genuine and clinically useful. The compliance infrastructure for it at small clinics has often not grown at the same pace. Addressing the data flow documentation, the BAA inventory, and the access controls before an incident occurs is the right sequence.
