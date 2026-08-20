---
title: "Multi-Location HIPAA Rollout Guide"
description: "A step-by-step guide for small clinic groups expanding to two or more locations, covering shared vs. site-specific compliance elements and evidence aggregation."
metaDescription: "Scale HIPAA compliance across 2-5 clinic locations. Learn what's shared, what's site-specific, and how to structure your evidence across sites."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: compliance-operations
schemaType: article
intent: consideration
summary: "When a clinic group expands to a second or third location, most compliance programs built for one office fail silently. Policies exist but haven't been distributed to the new site, BAAs haven't been checked against which vendors operate there, and training records live in the main office while the satellite runs without documentation."
keyTakeaways:
  - "HIPAA Security Rule administrative safeguards apply to all workforce members at all locations - there is no single-site exception for covered entities with multiple offices."
  - "Business associate agreements cover the covered entity as a whole; verify that every vendor operating at a satellite location is already covered under your existing BAAs before the site opens."
  - "Training records, physical safeguard assessments, and device inventories must be maintained at the site level - shared policies are not a substitute for site-specific evidence."
  - "Designate a local compliance lead at each satellite location; the centralized Privacy Officer cannot serve as the sole compliance contact for geographically distributed staff."
  - "One of the most common multi-location failures is a satellite site inheriting vendor relationships from the main office without verifying whether those subprocessors are covered in the BAA."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: "multi-location-compliance-rollout-plan"
relatedCommercialPath: "/pricing"
sources:
  - title: "45 CFR Section  164.308 - Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "U.S. Government Publishing Office"
  - title: "Covered Entity Guidance - HHS"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html"
    publisher: "U.S. Department of Health and Human Services"
  - title: "NIST SP 800-66 Rev. 2 - Implementing the HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "National Institute of Standards and Technology"
faq:
  - q: "Does each clinic location need its own Privacy Officer?"
    a: "No. A single Privacy Officer can cover multiple locations within the same covered entity. However, each location should have a designated local compliance lead - typically a site manager or senior staff member - who can serve as the Privacy Officer's on-site contact, distribute policies, coordinate training, and escalate incidents promptly."
  - q: "Do we need separate business associate agreements for each location?"
    a: "Not if your vendors are already contracted at the covered-entity level. A BAA with a vendor covers all locations that are part of the same covered entity. The critical step is verifying that the vendor actually serves the satellite location and that no subprocessors at that site are outside your existing BAA coverage."
  - q: "What is the biggest compliance risk when opening a second clinic location?"
    a: "Delayed or incomplete access provisioning and deprovisioning. New staff at a satellite location often receive access permissions that were set up ad hoc rather than through a formal provisioning process. When those staff members leave, their access may not be tracked in the central system. Build one access management process for all locations before the site opens."
---

Expanding from one clinic location to two or more is a compliance inflection point that catches many practice groups off guard. The first location's compliance program - usually built over years - was designed around one office, one set of staff, and one set of vendor relationships. When a satellite location opens, that program does not automatically extend. Policies need to be distributed, training needs to happen on-site, device inventories need to be created, and physical safeguard assessments need to cover the new space.

## What the HIPAA Security Rule Requires Across All Locations

Under 45 CFR Section  164.308, covered entities must implement administrative safeguards that protect PHI across the entire organization. The regulation does not contain an exception for satellite locations, smaller offices, or newer sites. Every location where workforce members access, use, or disclose PHI is subject to the full set of requirements.

This means:
- Workforce security (Section  164.308(a)(3)): Access controls and termination procedures apply to staff at every location.
- Information access management (Section  164.308(a)(4)): Each site must be able to demonstrate that access to PHI is authorized and appropriate for each person at that site.
- Security awareness and training (Section  164.308(a)(5)): Training is required for all workforce members, including staff at locations opened after the original training program was designed.
- Contingency planning (Section  164.308(a)(7)): Your backup and disaster recovery plan must account for PHI stored or processed at each site.
- Evaluation (Section  164.308(a)(8)): Security evaluations must cover changes in the environment - opening a new location is exactly such a change.

The common gap is assuming that because policies exist at the main office, they are in effect at the satellite. They are not. Policies are in effect only where the workforce at that location has received and acknowledged them.

## Shared vs. Site-Specific Compliance Elements

Understanding which compliance elements can be managed centrally and which require site-level work is the foundation of a scalable multi-location program.

### What Can Be Shared Across All Locations

**Policies and procedures:** A single set of HIPAA Privacy and Security policies, maintained and updated by the central Privacy Officer, covers the entire covered entity. You do not need a separate policy document for each location. What you do need is documentation that each location's workforce received, reviewed, and acknowledged the current policies.

**Business associate agreements:** BAAs are contracts between the covered entity (your practice group) and a business associate. They cover the covered entity as a whole, regardless of how many locations exist. No separate BAA per site is required. Verify that the BAA's scope covers the processing that happens at each location.

**Privacy Officer designation:** One Privacy Officer can serve the entire covered entity. Their contact information appears on the NPP for all locations.

**Sanction policy:** One sanction policy applies to all workforce members across all sites.

### What Must Be Maintained at the Site Level

| Element | Why It Must Be Site-Specific |
|---|---|
| Training records | Training must be completed by each workforce member at their site; a training record from the main office does not cover a staff member hired at the satellite |
| NPP acknowledgments | Each patient receives and acknowledges the NPP at the location where they receive services |
| Physical safeguard assessment | Each facility has different physical access controls, workstation placement, and media handling practices |
| Device inventory | Devices at the satellite location may differ from main office devices; each site's inventory must be documented |
| Access provisioning records | Access granted to staff at the satellite must be documented separately from main office access |
| Incident log | Incidents occurring at a specific site must be logged and traceable to that location |
| Workforce roster | The current, active workforce at each site - for training tracking and access management |

## Designating Compliance Leadership at Each Location

The central Privacy Officer owns the overall compliance program but cannot be the day-to-day compliance contact at a location they do not work in. For each satellite, designate a local compliance lead. This does not need to be a dedicated compliance role - it is the site manager or a senior clinical or administrative staff member.

The local compliance lead's responsibilities:
- Serve as the first point of contact for patient privacy complaints and questions at that site
- Coordinate training completion tracking for all staff at the site
- Maintain the site-level evidence file (training records, NPP acknowledgments, physical assessment)
- Escalate incidents immediately to the central Privacy Officer
- Ensure new staff at the site complete onboarding compliance training before accessing PHI

Document the designation in writing - name, effective date, and scope of role - in the site's compliance record.

## BAA Review for Satellite Locations

Before a new location begins operating, conduct a BAA inventory check focused on that site. The question is not just "do we have a BAA with vendor X" but "does vendor X actually process PHI at the satellite location, and are any of vendor X's subprocessors at that site covered by the BAA"

**Common failure pattern:** A clinic group's main office uses an EHR, a billing service, and a transcription vendor, all covered under existing BAAs. The satellite location opens and begins using the same EHR and billing service. However, the satellite's on-site device management is handled by a local IT company that was never formally evaluated as a business associate. The local IT company has physical and logical access to devices that store PHI. No BAA exists.

**BAA rollout checklist for a new location:**

1. List every vendor that will have access to PHI at the satellite location - including vendors providing IT support, copier maintenance (if the copier stores images), cleaning services with access to records rooms, and any clinical or billing subcontractors.
2. For each vendor, verify whether an existing BAA covers that vendor's activities at the new site.
3. For any vendor not covered, either execute a new BAA before the site opens, or replace the vendor with one already under a BAA.
4. Note in your BAA inventory which locations each BAA covers.

## Building the Rollout Checklist

A multi-location rollout is not complete until evidence exists for each phase at the new site. The following sequence is ordered to prevent PHI access before access controls and training are in place.

### Phase 1: Before Staff Access PHI at the New Location

- [ ] Policies distributed to all site staff (with acknowledgment signed by each person)
- [ ] Privacy Officer contact information posted at the site
- [ ] Local compliance lead designated in writing
- [ ] BAA inventory completed for the new site - all vendors verified or new BAAs executed
- [ ] Access provisioning process confirmed - who authorizes access at this site, and to which systems

### Phase 2: At or Before First Day of Operations

- [ ] All workforce members with PHI access have completed HIPAA training (with attestations on file at the site level)
- [ ] Physical safeguard assessment completed for the new facility
- [ ] Device inventory created for all devices at the site that will access or store PHI
- [ ] NPP posted in a prominent location in the patient reception area
- [ ] Incident escalation path confirmed - local compliance lead knows how and when to contact the central Privacy Officer

### Phase 3: Within 90 Days of Opening

- [ ] First review of training completion - any staff hired after opening must be in the training tracking system
- [ ] First spot check of NPP acknowledgment files - are acknowledgments being obtained at first patient service
- [ ] Access provisioning audit - verify that the access list at the new site matches current staff roster
- [ ] Review of any incidents logged at the site since opening

## Aggregating Evidence Across Sites

One operational challenge of a multi-location program is maintaining visibility across all sites. Without a centralized view, the Privacy Officer depends on site managers to surface gaps - and gaps rarely surface themselves.

A consistent evidence structure across all locations fixes this. When each site maintains compliance records in the same format - the same training log template, incident log fields, and device inventory structure - the Privacy Officer can review all sites against the same standard without reconstructing the picture at each audit cycle.

**What a centralized compliance record should capture per site:**
- Site name and address
- Local compliance lead (name, effective date of designation)
- Current workforce roster with training completion dates
- BAA inventory filtered to that site's vendors
- Physical safeguard assessment with last review date
- Device inventory with last audit date
- Open incidents and their status

Quarterly, the Privacy Officer should review each site's record to confirm that training is current for all staff, that no access has been provisioned for departed employees, and that any incidents have been resolved and documented.

## The most frequently missed step

The most commonly missed step in a multi-location rollout is the BAA subprocessor check. Practice groups assume a vendor BAA with the main office covers everything that vendor does everywhere. That assumption breaks when the satellite uses a locally contracted IT support company, a different cleaning service, or a different courier for physical records. Each of those vendor relationships requires evaluation before the location begins handling PHI.

The second most commonly missed step is establishing a device inventory at the satellite from day one. Devices accumulate quickly, and without an inventory started at opening, reconstructing which devices held PHI and what happened to them becomes difficult under audit pressure.

Both are planning-stage tasks. Address them before the site opens - doing so after the fact takes far longer.
