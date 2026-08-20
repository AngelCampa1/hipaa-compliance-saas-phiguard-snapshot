---
title: "HIPAA Compliance for Cardiology Practices"
seoTitle: "HIPAA for Cardiology Practices"
description: "Cardiology generates continuous PHI streams from ECGs, echocardiograms, and implantable monitors. This guide covers the specialty-specific exposures and BAA considerations small cardiology clinics must address."
metaDescription: "HIPAA compliance guide for cardiology practices: ECG and echo imaging, remote monitoring BAAs, and specialty risks."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "consideration"
summary: "Cardiology practices handle PHI types most general guides ignore: imaging studies, continuous device telemetry, and pharma rep interactions. This article maps the specialty's unique exposures to HIPAA Privacy and Security Rule obligations and gives administrators a usable checklist. It helps clinics turn HIPAA requirements into assigned owners, recurring reviews, dated evidence, and practical controls that can be explained during an OCR inquiry."
keyTakeaways:
  - "ECG, echocardiogram, and Holter recordings are PHI and must be protected end-to-end, including waveform exports."
  - "Remote cardiac monitoring vendors are business associates and require a signed BAA before any device data flows."
  - "Some states classify cardiac genetic testing results under heightened protections that overlay HIPAA."
  - "Pharma representatives reviewing patient drug histories in the practice is a common, under-controlled disclosure path."
  - "Inventory every device, monitoring portal, and EHR module that touches patient data, then confirm a BAA covers each."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations"
sources:
  - title: "45 CFR Parts 160-164 - HIPAA"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "HIPAA for Professionals"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "U.S. Department of Health and Human Services"
faq:
  - q: "Are ECG waveforms considered PHI?"
    a: "Yes. ECG, echocardiogram, and any cardiac waveform recording tied to an identifiable patient is protected health information under HIPAA and must be stored, transmitted, and disclosed under the Privacy and Security Rules."
  - q: "Do remote cardiac monitoring vendors need a BAA?"
    a: "Yes. Any vendor that receives, stores, or transmits patient device data on behalf of the practice is a business associate and must sign a BAA before data flows."
  - q: "Can a pharma rep review a patient's medication list during a visit?"
    a: "Not without authorization or a permitted-use basis under the Privacy Rule. Practices should restrict rep access to de-identified or aggregate data and document any patient-specific disclosure."
---

## Why cardiology has unique HIPAA exposure

Cardiology clinics generate, receive, and transmit far more continuous patient data than most outpatient specialties. A single patient encounter can produce a 12-lead ECG, a stress test recording, an echocardiogram study, and follow-on telemetry from a Holter monitor or implantable loop recorder that streams for weeks. Each of those artifacts is protected health information when tied to an identifiable patient, and each travels through devices, vendor portals, and EHR modules that small practices rarely audit end-to-end.

Cardiology also has a heavier vendor footprint than primary care. Device manufacturers operate cloud portals, remote monitoring services act as long-running business associates, and reading services may transmit studies offsite for over-read. Pharma representatives are a frequent on-site presence, and their interest in patient drug histories creates a disclosure path that practice administrators often overlook in their risk analysis.

## Top HIPAA risks for cardiology clinics

**1. Imaging and waveform exports.** Cardiologists routinely export ECG strips and echo clips into emails, referral letters, or shared drives. Each export is a transmission of PHI and must use encrypted channels. Burning a study to an unencrypted USB or CD for a patient referral is a recurring weak point.

**2. Remote monitoring portals without BAAs.** Many practices onboard pacemaker or loop recorder monitoring without confirming the manufacturer's cloud service is covered by a BAA. The device vendor and the monitoring service are sometimes separate legal entities, and both need agreements.

**3. Pharma rep interactions.** Reps asking to "see how a patient is doing on the new statin" is a request for PHI. If the practice cannot show authorization or a permitted use, the disclosure is impermissible.

**4. Shared reading workstations.** Echo and stress lab workstations are often left logged in across techs and physicians. Without per-user authentication and audit logging, the practice cannot reconstruct who viewed which study.

## Vendor and BAA checklist for cardiology

Before any vendor touches patient data, confirm a signed BAA is in place for:

- The cardiology-specific EHR or module (for example, a cardiovascular information system layered on a general EHR)
- ECG management and storage systems
- Echocardiography image archives and PACS
- Holter, event monitor, and mobile cardiac telemetry vendors
- Implantable device remote monitoring portals (pacemakers, ICDs, loop recorders)
- Stress test and nuclear cardiology software vendors
- Over-read or tele-cardiology reading services
- Billing clearinghouses and revenue cycle vendors
- Secure messaging and patient portal vendors

If a vendor refuses to sign a BAA, that vendor cannot receive PHI. There is no workaround.

## State law overlays affecting cardiology

HIPAA sets a federal floor; state law often layers on top. Cardiac genetic testing results, which are increasingly common in inherited arrhythmia and cardiomyopathy workups, fall under state genetic privacy statutes in several jurisdictions and may require separate authorization. A handful of states also impose heightened protections on records related to substance use that intersect with cardiac care, particularly in addiction medicine and cardiology overlap. Confirm with counsel whether your state imposes additional consent or disclosure obligations on these data types.

## HIPAA compliance checklist for cardiology practices

1. Inventory every device, portal, and software vendor that creates, receives, stores, or transmits cardiac PHI.
2. Confirm a signed BAA is on file for each vendor on that inventory, including device manufacturer cloud services.
3. Require per-user authentication on all reading workstations and disable shared accounts.
4. Encrypt all ECG and imaging exports in transit and at rest, and replace USB or CD transfers with secure portals.
5. Document a written policy for pharma rep interactions that prohibits patient-specific disclosures without authorization.
6. Configure audit logging on the EHR, PACS, and monitoring portals, and review logs at a defined cadence.
7. Train clinical staff on minimum necessary disclosure for referrals, over-reads, and family inquiries.
8. Establish a retention schedule for waveform recordings and imaging studies aligned with state and payer requirements.
9. Run an annual risk analysis that explicitly covers remote monitoring data flows.
10. Maintain an incident response runbook that includes device vendor breach notification timelines.

For broader context on building a compliance program, see the [compliance operations hub](/learn/compliance-operations). If you administer a cardiology practice and want a HIPAA-native task and audit platform built for clinics your size, [PHIGuard](/hipaa) is purpose-built for the work.
