---
title: "HIPAA Software for Radiation Oncology Practices"
practiceType: "Radiation Oncology Practices"
description: "HIPAA compliance for radiation oncology practices — covering treatment planning systems, imaging archives, multi-disciplinary team coordination, and highly sensitive diagnosis data."
metaDescription: "HIPAA software for radiation oncology practices. Treatment planning systems, imaging PHI, MDT coordination, and compliance program fit."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Radiation oncology handles the most sensitive categories of PHI — cancer diagnosis and prognosis — alongside highly specialized clinical systems: treatment planning software, simulation imaging, and dose calculation archives. Each system carries independent HIPAA obligations that must be addressed in the practice's compliance program."
sources:
  - title: "Security Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html"
    publisher: "HHS"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Is radiation treatment planning data PHI?"
    a: "Yes. Treatment planning data includes patient identity, anatomical imaging, tumor localization, dose prescription, and beam parameters — all linked to the patient's cancer diagnosis. Treatment planning system (TPS) vendors whose software stores or processes this data are business associates requiring BAAs."
  - q: "Do radiation oncology practices need separate BAAs for imaging systems?"
    a: "Yes. Radiation oncology relies on simulation CT imaging, potentially MR simulation, and on-board imaging during treatment. Image archives (PACS) and image management systems that store this imaging data linked to patient identity are subject to HIPAA. PACS vendors require BAAs."
  - q: "How should a radiation oncology practice handle multi-site coordination?"
    a: "Multi-site practices where patients receive treatment planning at one location and treatment delivery at another must ensure that PHI transmitted between sites — treatment plans, imaging data, dose records — travels through HIPAA-covered channels. Direct imaging transfer via DICOM must occur over encrypted, authenticated connections."
  - q: "What special HIPAA considerations apply to cancer diagnosis data?"
    a: "Cancer diagnosis and prognosis data is not a separately protected category under federal HIPAA, but it is among the most sensitive PHI categories. Some state laws provide additional protections for cancer registry data. Beyond legal requirements, the sensitivity of this information makes access controls and minimum necessary PHI principles especially important."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

## What makes radiation oncology practices different for HIPAA

Radiation oncology manages PHI that is sensitive on two dimensions: the clinical content (cancer diagnosis, prognosis, treatment response) and the technical complexity of the systems that store it.

A radiation oncology practice operates systems that most other outpatient specialties never encounter: treatment planning systems (TPS) like Varian Eclipse, Elekta Monaco, or RayStation that store radiation dose calculations and beam configurations; CT simulation systems that generate imaging data for treatment planning; DICOM-based image archives; and record-and-verify systems that document each fraction of treatment delivered.

Each of these specialized systems stores PHI and may be operated or maintained by a vendor. Each vendor relationship requires a HIPAA assessment. For practices that have deployed these systems without systematic BAA review — which is common in settings where clinical system procurement is led by radiation physicists rather than compliance-focused administrators — the BAA inventory is often incomplete.

## Key compliance challenges

**Treatment planning system BAA.** The TPS is the central clinical data repository for radiation oncology. It stores patient demographics, imaging data, tumor contours, dose prescriptions, beam configurations, and treatment plan approvals. The TPS vendor maintains, supports, and in some cases hosts the software — creating a business associate relationship. Request a BAA from your TPS vendor and confirm it covers the full scope of data the vendor system accesses.

**PACS and image archive BAA.** Simulation CT images, MR simulation images, and portal imaging data during treatment are stored in DICOM format in an image archive or PACS. The PACS vendor — or the PACS hosting provider if the system is cloud-hosted — is a business associate. Practices using cloud-based PACS solutions should confirm BAA coverage from the hosting infrastructure provider as well.

**Multi-disciplinary team communication.** Radiation oncology is inherently multi-disciplinary. Treatment decisions involve collaboration with medical oncologists, surgical oncologists, pathologists, and radiologists. Tumor board presentations include patient imaging, pathology, and treatment planning data. Each communication channel used for that collaboration — secure messaging, video conferencing, shared clinical platforms — must be evaluated for HIPAA compliance.

**Multi-site data transfer.** Radiation oncology groups often operate across multiple clinical sites — a planning facility and one or more treatment vault locations. When treatment plans, imaging data, and dose prescriptions are transferred between sites, that transfer must occur over encrypted, authenticated channels. Unencrypted DICOM transfer over an open network is a PHI security failure.

**Physicist and dosimetrist access controls.** Radiation physicists and dosimetrists have the broadest access to treatment planning data in the practice. Access control policies must address physicist access to patient treatment plans, dose calculation data, and quality assurance records. Physicist workstations connected to clinical networks require the same endpoint security as clinical staff workstations.

**Treatment record retention.** Radiation oncology treatment records — particularly records of the doses delivered to each patient — have long retention requirements driven by both HIPAA and state medical record laws. Some states require permanent retention of radiation treatment records. Confirm your TPS and record-and-verify system data retention policies meet your applicable legal requirements.

## What a compliance program looks like for a radiation oncology practice

**Clinical system BAA audit.** Build a complete list of every clinical system vendor: TPS vendor, PACS vendor, record-and-verify system vendor, CT simulation service contractor, image management platform, and any cloud hosting providers for these systems. Request BAAs from each. This process often uncovers informal vendor relationships that have not been formally assessed.

**Multi-disciplinary communication assessment.** Audit the channels used for tumor board, multidisciplinary treatment conferences, and specialist-to-specialist communication. Confirm that each channel is covered under a BAA.

**Network security for DICOM transfer.** Review the network architecture for DICOM data transfer between sites and between clinical systems. Unencrypted DICOM is a common gap in radiation oncology environments — not because practices are careless, but because clinical system procurement has historically prioritized clinical functionality over network security.

**Physicist workstation security.** Physicist workstations are typically high-performance computing systems with elevated network access. Confirm that endpoint security controls — encryption, MFA, access logging — are applied consistently to physicist workstations as well as clinical staff workstations.

**Staff training for clinical and physics staff.** Radiation therapists, dosimetrists, and physicists access highly sensitive PHI and often have not received clinical-staff-level HIPAA training. Include all staff who access clinical systems — not just front-desk and administrative staff — in the annual training program.

## Where PHIGuard fits

PHIGuard manages the compliance coordination layer for a radiation oncology practice — not the TPS, not the PACS, but the program that ensures those systems are appropriately covered in your compliance documentation.

For a radiation oncology group dealing with multi-site operations, multiple specialized clinical system vendors, and complex multi-disciplinary care coordination, PHIGuard centralizes the compliance task management: vendor BAA tracking with review dates, annual risk analysis assignment, staff training completion documentation, and incident response workflows.

When a new cloud imaging solution is evaluated or a new PACS hosting vendor is contracted, PHIGuard is where the BAA assessment task is created, assigned to the right person, and tracked to completion.
