---
title: "HIPAA Compliance for Multi-Provider Group Practices"
seoTitle: "HIPAA Compliance for Group Practices Explained"
description: "How HIPAA applies to group practices that share locations, staff, and records. Covers single-entity status, OHCAs, access control, and multi-location safeguards."
metaDescription: "How HIPAA applies to multi-provider group practices: single covered entity status, OHCAs, access control, training, and multi-location safeguards."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
kind: "article"
pillar: "hipaa-basics"
intent: "awareness"
summary: "Group practices that share staff, systems, and locations are usually a single covered entity under HIPAA. That status changes how policies, BAAs, training, and access control are structured across providers and sites. It helps clinics turn HIPAA requirements into assigned owners, recurring reviews, dated evidence, and practical controls that can be explained during an OCR inquiry."
keyTakeaways:
  - "A group practice with shared staff, systems, and operations is typically one covered entity, not many."
  - "An Organized Health Care Arrangement (OHCA) under 45 CFR 164.506(c)(4) lets legally separate providers operate jointly without BAAs between them."
  - "Minimum necessary still applies inside a group practice. Providers should not browse charts of patients they are not treating."
  - "Training, sanctions, and audit logging must cover every provider, every clinical assistant, and every administrative role."
  - "BAAs are signed at the entity level, and physical safeguards must be enforced at every location the practice operates."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/hipaa-basics"
sources:
  - title: "HIPAA - 45 CFR Part 164"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/parts-160-164"
    publisher: "eCFR"
  - title: "45 CFR Section  164.502"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "HIPAA for Professionals"
    url: "https://www.hhs.gov/hipaa/for-professionals/index.html"
    publisher: "HHS"
faq:
  - q: "Does each provider in a group practice need their own Notice of Privacy Practices?"
    a: "If the group practice operates as a single covered entity, one NPP for the entity is sufficient. If providers are legally separate but participate in an OHCA, they may issue a joint NPP that describes the arrangement."
  - q: "Do providers in the same group practice need BAAs with each other?"
    a: "No. Workforce members of a single covered entity, and participants in a properly structured OHCA, do not need BAAs to share PHI for joint treatment, payment, and operations."
  - q: "Can one provider in the group access another provider's patient charts?"
    a: "Only when access is consistent with the minimum necessary standard for treatment, payment, or operations. Casual browsing of charts for patients you are not involved with is a HIPAA violation, even within the same practice."
---

Group practices sit in a tricky spot under HIPAA. The Privacy Rule was written to apply to a covered entity, but a group practice often looks like several providers wearing one shared business hat. Understanding how the rule treats your structure changes how you write policies, sign BAAs, train staff, and lock down access.

This article walks practice administrators through the four issues that come up most often: whether the group is one covered entity or many, how Organized Health Care Arrangements work, how to apply minimum necessary across providers, and what to do about multi-location safeguards.

## The group practice as a single covered entity

In most cases, a group practice that shares a tax ID, employs its clinicians, runs one EHR, and bills under a common practice name is one covered entity. That has practical consequences. One Notice of Privacy Practices covers the whole group. One Privacy Officer and one Security Officer can serve every site and provider. One set of policies governs every workforce member, whether they are a physician, nurse, billing specialist, or front-desk associate.

This is also true when the group has multiple service lines. A primary care group that adds a small behavioral health team, or a dermatology group that runs an aesthetics service, is still typically one covered entity unless the structure has been deliberately separated for legal or billing reasons. If you are unsure, ask the practice's attorney before assuming.

## Organized Health Care Arrangements (OHCAs)

Some group practices are not structurally a single entity. Independent physicians who share an office, a hospital that hosts many separately incorporated provider groups, or specialists who participate in a joint clinically integrated network can each be their own covered entity while still working together on shared patients.

For these arrangements, 45 CFR 164.506(c)(4) lets the participants operate as an Organized Health Care Arrangement. Under an OHCA, legally separate covered entities can share PHI for the joint operations of the arrangement without signing business associate agreements with each other. The key requirements are that the entities hold themselves out to patients as participating in joint operations and that the arrangement performs joint utilization review, quality assessment, or shared payment activities.

OHCAs reduce paperwork, but they do not erase boundaries. Each participating entity is still individually accountable for safeguards over its own systems and workforce. A joint Notice of Privacy Practices is allowed and often used.

## Access control across providers

The minimum necessary standard does not stop at the practice door. Inside a single covered entity, providers and staff should only access PHI they need for their role and the patients they are involved with. A pediatrician should not browse the chart of an adult patient they are not treating. A medical assistant assigned to one pod should not pull records from a different pod out of curiosity.

In practice this means three things:

- Role-based access in the EHR, with permissions scoped to job function rather than to "everyone in the practice"
- Break-the-glass logging for access to records outside a user's normal scope, with periodic review
- Sanctions for snooping, applied consistently regardless of seniority

OCR has resolved investigations involving employees who accessed records of co-workers, family members, or public figures inside their own organization. The fact that the snooper worked at the practice did not make the access permissible.

## Training and documentation for larger teams

A two-provider practice can train everyone in the same room. A 30-provider group with three locations cannot. Larger groups need a training program with tracked completion, role-specific modules, and a process for onboarding new clinicians without delay. Annual refresher training and ad hoc training after a policy change or incident are both expected.

Documentation matters as much as the training itself. The Privacy Rule and Security Rule both expect you to be able to show, on demand, who was trained, when, and on what content. A spreadsheet works. A learning management system with completion records works better. What does not work is a folder of signed sheets that nobody can find when an investigator asks.

## Multi-location safeguards

Each clinic site needs its own physical safeguards. That includes badge access or keyed entry to clinical areas, screen privacy at front-desk and check-in stations, secure document destruction, and locked storage for any paper records still in use. Workstations in shared exam rooms need automatic screen lock with short timeouts.

Network segmentation between sites is worth considering. If one location is breached, you do not want lateral movement to compromise every other clinic. Practices that run their own network equipment should consult their IT vendor about VLANs, firewall rules, and centralized logging.

BAAs are signed once at the entity level, not at each site. When you onboard a new vendor, the agreement covers every location the entity operates. If the vendor is going to have access to PHI at a specific location only, that scope should still be documented in the BAA or in the underlying service agreement.

## Where to go next

If you are mapping out an end-to-end compliance program for a multi-provider group, our [HIPAA basics hub](/learn/hipaa-basics) collects the rest of the foundational topics. For a step-by-step rollout sequence, see our [HIPAA compliance roadmap for new clinics](/learn/hipaa-basics/hipaa-compliance-roadmap-new-clinics). PHIGuard's [HIPAA compliance platform](/hipaa) is built for small and mid-sized group practices, with current plan and BAA details available during plan review.
