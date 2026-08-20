---
title: "HIPAA Administrative Safeguards: What Clinics Must Do"
seoTitle: "HIPAA Administrative Safeguards for Small Clinics"
description: "The eight standards of HIPAA administrative safeguards under 45 CFR 164.308, which are required versus addressable, and what small medical practices need to document and implement."
metaDescription: "HIPAA administrative safeguards explained: the eight standards under 45 CFR 164.308, required vs. addressable specs, and what small clinics must have in place."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "compliance-operations"
schemaType: "article"
intent: "awareness"
summary: "Administrative safeguards are the policies, procedures, and management decisions that protect ePHI and govern how the clinic trains and manages its workforce around security. They are the largest category in the HIPAA Security Rule, covering eight standards across 45 CFR 164.308. A small clinic cannot satisfy the Security Rule by installing technical controls alone - the administrative framework is what gives those controls meaning."
keyTakeaways:
  - "Administrative safeguards are the largest of the three Security Rule categories and include eight distinct standards."
  - "A Security Officer designation and a documented risk analysis are both required - not addressable."
  - "Security awareness and training is a required standard under §164.308(a)(5); its implementation specifications - security reminders, protection from malicious software, log-in monitoring, and password management - are addressable but virtually all clinics should implement them."
  - "The sanctions policy standard requires a documented, consistently applied consequence structure for security violations."
  - "Contingency planning is its own standard within administrative safeguards and must cover data backup, disaster recovery, and emergency mode operations."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-compliance-self-assessment"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 164.308 - Administrative Safeguards"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS OCR"
  - title: "NIST SP 800-66 Rev. 2"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
faq:
  - q: "Does a small clinic need a full-time Security Officer?"
    a: "No. HIPAA requires that responsibility for developing and implementing security policies be assigned to a specific individual, but that person can hold other roles in the clinic. In a practice with three to ten staff, the office manager or practice administrator typically acts as Security Officer. The requirement is that someone is formally designated and that the designation is documented."
  - q: "How often does the risk analysis need to be updated?"
    a: "HIPAA requires an ongoing risk analysis - not a one-time event. HHS guidance states that the risk analysis must be reviewed and updated in response to environmental or operational changes that affect ePHI. Most clinics conduct a formal review at least annually and update it when they add new systems, hire new staff with system access, change vendors, or experience a security incident."
  - q: "What is the contingency plan standard under administrative safeguards?"
    a: "The contingency plan standard at 45 CFR 164.308(a)(7) requires documented procedures for responding to emergencies that damage systems containing ePHI. It has five implementation specifications: data backup plan (required), disaster recovery plan (required), emergency mode operation plan (required), testing and revision procedures (addressable), and applications and data criticality analysis (addressable)."
  - q: "What happens if a clinic has no workforce training on HIPAA security?"
    a: "Absent training documentation, OCR treats workforce knowledge gaps as the clinic's responsibility. In enforcement actions, OCR regularly cites missing or inadequate workforce training as an independent finding. Training does not have to be elaborate, but it must be documented - who attended, when, and what was covered."
---

Administrative safeguards are the organizational and policy backbone of the HIPAA Security Rule. They sit at 45 CFR 164.308 and govern how the clinic manages its security program, trains its staff, and responds when things go wrong.

The three Security Rule categories - administrative, physical, and technical - are interdependent. Technical controls ([hipaa-technical-safeguards](/learn/compliance-operations/hipaa-technical-safeguards)) and physical measures ([hipaa-physical-safeguards](/learn/compliance-operations/hipaa-physical-safeguards)) operate within the framework that administrative safeguards establish.

## The eight standards

### Security management process (164.308(a)(1))

This standard has four implementation specifications, all of which are required under § 164.308(a)(1): risk analysis, risk management, sanction policy, and information system activity review. All four must be implemented - none is addressable.

The risk analysis is the foundation of the entire Security Rule compliance program. It must identify reasonably anticipated threats to ePHI, assess the probability and impact of those threats, and document the current controls in place. The risk management specification requires implementing security measures to reduce the risks identified in the analysis to a reasonable and appropriate level.

### Assigned security responsibility (164.308(a)(2))

Required. The clinic must designate a Security Officer responsible for developing and implementing security policies and procedures. This person must be identified by name or role in clinic documentation.

### Workforce security (164.308(a)(3))

Required standard, addressable specifications. The clinic must implement policies and procedures to ensure that all members of its workforce have appropriate access to ePHI, and to prevent unauthorized access. Implementation specifications address authorization, supervision, and workforce clearance procedures. The practical minimum is a documented process for granting and revoking system access when staff are hired or separated.

### Information access management (164.308(a)(4))

Required standard. Includes isolating healthcare clearinghouse functions from other components of the organization (required), and access authorization and modification procedures (addressable). For most small clinics, this standard means having a documented method for approving access to systems containing ePHI and for promptly removing access when it is no longer needed.

### Security awareness and training (164.308(a)(5))

Required standard, all addressable implementation specifications. The specifications cover security reminders, protection from malicious software, log-in monitoring, and password management. All four are addressable, meaning the clinic must implement them or document equivalent alternatives. Most clinics should implement all four. Training that is documented is defensible; training that happened informally is not.

### Security incident procedures (164.308(a)(6))

Required. The clinic must implement policies and procedures to address security incidents - including a process for identifying, responding to, mitigating, and documenting security incidents and their outcomes.

### Contingency plan (164.308(a)(7))

Required standard with five implementation specifications. Three are required: data backup plan, disaster recovery plan, and emergency mode operation plan. Two are addressable: testing and revision procedures, and applications and data criticality analysis. The contingency plan is often where small clinics have the biggest gap - particularly the disaster recovery and emergency mode plans, which require more thought than the data backup plan alone.

For more on what clinics should document and keep: [HIPAA contingency planning](/learn/compliance-operations/hipaa-contingency-planning).

### Evaluation (164.308(a)(8))

Required. The clinic must perform periodic technical and non-technical evaluations of its security measures in response to environmental or operational changes affecting ePHI. This is the standard that requires the annual review most compliance frameworks recommend. Changes that should trigger an evaluation include: new EHR systems, new PHI-bearing software, office moves, changes in vendor relationships, or a security incident.

## What to do first

If your clinic does not have a documented risk analysis or a named Security Officer, those are the two required items with no acceptable alternative. Start there.

After those two, a workforce training log and a documented access provisioning and deprovisioning process cover the specifications OCR most commonly cites in small-provider enforcement actions.
