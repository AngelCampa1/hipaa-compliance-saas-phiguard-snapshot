---
title: "HIPAA Physical Safeguards: A Small Clinic Checklist"
seoTitle: "HIPAA Physical Safeguards for Small Clinics"
description: "What physical safeguards HIPAA requires under 45 CFR 164.310, which specifications are required versus addressable, and what a defensible physical security posture looks like for a small medical practice."
metaDescription: "HIPAA physical safeguards for small clinics: facility access, workstation use, workstation security, and device controls under 45 CFR 164.310."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "HIPAA physical safeguards govern physical access to the systems and spaces where ePHI is stored or processed. They are defined at 45 CFR 164.310 and cover facility access controls, workstation use policies, workstation security, and device and media controls. Most implementation specifications in this section are addressable, but the required standard itself is mandatory and must be documented regardless of what alternatives a clinic uses."
keyTakeaways:
  - "Physical safeguards apply to workstations, servers, portable devices, and the physical spaces that contain them."
  - "Facility access controls require documented procedures for authorizing and logging physical access to systems containing ePHI."
  - "Workstation use and workstation security policies must cover every workstation that can access ePHI, including remote workstations used by staff working from home."
  - "Device and media controls govern how devices containing ePHI are reused, disposed of, or transferred - and require documented procedures for each scenario."
  - "A small clinic with a single-room office still must document its physical access controls, even if those controls are simple."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 164.310 - Physical Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.310"
    publisher: "eCFR"
  - title: "Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS OCR"
  - title: "NIST SP 800-66 Rev. 2"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
  - title: "Workstation Use Policy for Small Clinics"
    url: "https://phiguard.app/learn/compliance-operations/workstation-use-policy-small-clinic"
    publisher: "PHIGuard"
faq:
  - q: "Do physical safeguards apply to cloud-hosted systems?"
    a: "Physical safeguards apply at every point where ePHI is stored or accessed. For cloud-hosted systems, your cloud provider or SaaS vendor handles physical security for its data centers, which should be addressed in your business associate agreement and vendor due diligence. Your clinic still has physical safeguard obligations for the workstations, devices, and office spaces where staff access that cloud-hosted ePHI."
  - q: "What is a facility access control under HIPAA?"
    a: "Facility access control means the policies and procedures that limit physical access to systems containing ePHI to authorized individuals. For a small clinic, this typically means key or badge access to server rooms or IT closets, visitor sign-in procedures, and documented authorization records for who can enter those spaces."
  - q: "Does a staff member working from home need to comply with physical safeguards?"
    a: "Yes. The workstation use and workstation security standards apply to every workstation that can access ePHI, regardless of location. The clinic's policy should address remote workstations specifically - screen locks, printer use, household members, and physical positioning of the screen in home environments."
  - q: "What does media disposal under HIPAA require?"
    a: "Device and media controls require documented procedures for the disposal of electronic media containing ePHI. This means destroying or rendering unrecoverable ePHI before a device is recycled, donated, or discarded. NIST SP 800-88 provides the technical standard for media sanitization that most compliance programs reference."
---

HIPAA's physical safeguards standard is at 45 CFR 164.310. It governs the physical measures, policies, and procedures the clinic uses to protect electronic systems, equipment, and the facilities that house them from unauthorized physical access, tampering, and theft.

Physical safeguards apply to any location and any device through which ePHI is accessed, stored, or transmitted. That includes server rooms, exam room workstations, front-desk computers, laptops, portable devices, and the home offices of staff who access clinic systems remotely.

## Facility access controls (164.310(a)(1))

The standard is required. All four implementation specifications are addressable.

**Contingency operations (addressable).** Procedures to allow facility access in support of disaster recovery or emergency operations. A small clinic should document who can authorize emergency access to server rooms or IT equipment and under what circumstances.

**Facility security plan (addressable).** Documented policies to safeguard the facility and equipment from unauthorized physical access, tampering, and theft. For most small clinics, this is a brief written policy describing key or badge access, visitor procedures, and how the clinic monitors access to its physical systems.

**Access control and validation procedures (addressable).** Procedures to control and validate a person's access to facilities based on their role, including visitor control and control of access to software programs for testing and revision.

**Maintenance records (addressable).** Documentation of repairs and modifications to the physical components of the facility related to security, such as hardware, walls, doors, and locks.

## Workstation use (164.310(b))

Required. The clinic must implement policies and procedures that specify the proper functions to be performed, the manner in which those functions are to be performed, and the physical attributes of the surroundings of a specific workstation that can access ePHI.

In plain terms, the clinic needs a written policy that says what staff are allowed to do on each workstation type, including rules about personal use, screen positioning, and use in shared spaces. This policy must extend to remote workstations. See [workstation use policy for small clinics](/learn/compliance-operations/workstation-use-policy-small-clinic) for a detailed breakdown.

## Workstation security (164.310(c))

Required. Physical safeguards must be in place for all workstations that access ePHI to restrict access to authorized users only. This standard covers physical positioning (screens not visible to patients or visitors in waiting areas), cable locks for laptops, and screen privacy filters for high-traffic areas.

## Device and media controls (164.310(d))

The standard is required. Implementation specifications vary.

**Disposal (required).** Documented policies and procedures for the final disposition of ePHI and the hardware or electronic media on which it is stored. Every clinic must have a written device disposal procedure.

**Media re-use (required).** Before electronic media is reused for another purpose, ePHI must be removed. This means wiping drives before reuse, not just deleting files.

**Accountability (addressable).** Maintain a record of the movements of hardware and electronic media and of the person responsible.

**Data backup and storage (addressable).** Create a retrievable, exact copy of ePHI before moving equipment that stores ePHI.

## What a practical physical safeguard program looks like

For a clinic with 3-15 staff and no dedicated IT team, a defensible physical safeguard posture typically covers:

1. A written facility access policy - even a one-page document that names who can access the server closet or IT equipment room and how visitors are managed.
2. A workstation use policy that covers both office and remote workstations.
3. A device inventory with disposal and re-use procedures documented.
4. Screen privacy filters on workstations in patient-facing areas.
5. Automatic screen locks on all workstations accessing ePHI.

Physical safeguards connect directly to [HIPAA technical safeguards](/learn/compliance-operations/hipaa-technical-safeguards) and [HIPAA administrative safeguards](/learn/compliance-operations/hipaa-administrative-safeguards). The three categories work together; gaps in physical access controls often create the conditions for technical control failures.
