---
title: "Workforce HIPAA Security Awareness Checks"
description: "Training completion is not the same as security awareness. A structured security awareness check confirms your workforce is actually operating securely — and creates the evidence to prove it."
metaDescription: "Run a HIPAA security awareness check for small clinics: phishing, device inventory, password practices, physical security, and disposal."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: compliance-operations
schemaType: article
intent: consideration
summary: "HIPAA requires ongoing security awareness and training under 45 CFR § 164.308(a)(5). A security awareness check goes beyond verifying that staff completed a training module — it reviews whether the workforce is actually operating securely across six practical areas: phishing recognition, device accountability, password practices, physical security, disposal, and incident reporting."
keyTakeaways:
  - "Completing a training module satisfies the training record requirement but does not confirm that workforce members can apply what they learned."
  - "A structured security awareness check reviews six operational areas: phishing, device inventory, password practices, physical security, disposal, and reporting."
  - "The check itself must be documented — the record of the review is what creates compliance evidence, not the act of having done it."
  - "Gaps identified during a check feed directly into the risk register and become agenda items for the next training cycle."
  - "Quarterly checks are appropriate for most small clinics; the cadence should be documented in the security awareness policy."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: "phi-workflow-audit-worksheet"
relatedCommercialPath: "/pricing"
sources:
  - title: "45 CFR § 164.308(a)(5) — Security Awareness and Training"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308#p-164.308(a)(5)"
    publisher: "eCFR"
  - title: "NIST SP 800-66 Rev. 2 — Implementing the HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
  - title: "HHS Security Awareness and Training Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS Office for Civil Rights"
faq:
  - q: "Is a security awareness check the same as the annual security training?"
    a: "No. Annual security training is a formal educational activity — a module, a presentation, or a structured session that teaches workforce members about threats and policies. A security awareness check is an operational review that confirms whether the workforce is applying that training in day-to-day practice. Both are required under 45 CFR § 164.308(a)(5)."
  - q: "How long does a security awareness check take?"
    a: "For a clinic of 5–20 staff, a thorough awareness check can be completed in 60–90 minutes by the Privacy Officer or practice administrator. Most of the review involves checking records, observing the physical environment, and asking a handful of direct questions — it does not require interviewing every workforce member individually."
  - q: "Do we need to document the awareness check even if we found no issues?"
    a: "Yes. 'No gaps identified' is a compliance record. The documentation shows that the review happened, what was examined, and what the findings were. A check with no documented findings is indistinguishable from a check that was never done."
  - q: "What do we do with gaps we cannot fix immediately?"
    a: "Log the gap in the risk register with an assessed severity, an assigned owner, and a target resolution date. Document the interim controls in place while the gap is being addressed. Unresolved gaps with no risk register entry are a compliance finding; gaps with a documented mitigation plan and timeline are manageable."
---

Every small clinic with a HIPAA compliance program has training completion records: an LMS log or signed acknowledgment forms showing that workforce members completed the annual security training.

What those records do not show is whether the workforce member who completed the phishing module last November can spot a phishing email today — or whether shared passwords are still circulating, all clinic devices are accounted for, and PHI is being disposed of properly.

A security awareness check fills that gap. It is a periodic operational review, separate from training, that confirms the workforce is applying what they have learned in the environments where PHI lives.

## Training completion versus security awareness

Security training transfers knowledge. Training completion records document that the education happened.

Security awareness confirms the workforce is actually operating securely. A security awareness check examines what is happening on workstations, in hallways, in break rooms, and at the shred bin.

45 CFR § 164.308(a)(5) requires covered entities to implement security awareness and training programs for all workforce members, including periodic security updates. NIST SP 800-66 Rev. 2 frames this as an ongoing activity, not an annual event. A structured quarterly check is a defensible way to meet that requirement at a small clinic.

## The six areas of a security awareness check

A complete check examines six operational areas. Each area has specific questions to ask, records to review, or conditions to observe. The Privacy Officer or practice administrator completes a written checklist and retains it with the evidence binder.

### 1. Phishing awareness

Phishing is a common entry point for health data breaches. The check should confirm the workforce has received recent reminders about phishing tactics and that any suspected attempts have been reported.

Questions to answer:

- Has the clinic distributed a phishing reminder or alert within the past 90 days?
- Has any workforce member reported a suspected phishing email since the last check? What was the response?
- Is there a documented process for reporting suspicious emails, and do all workforce members know where to report?
- Have any workforce members clicked unknown links or attachments? Was this discovered and investigated?

If the clinic uses a managed IT or email security service, request a summary of phishing attempts blocked during the period.

### 2. Device accountability

Every device that accesses PHI — whether it stores records locally or only connects to cloud systems — is within scope for the HIPAA Security Rule's device and media controls. The check should confirm the device inventory is current and all devices are accounted for.

| Device Type | Minimum Check |
|---|---|
| Clinic workstations (desktops) | Confirm inventory is current; verify automatic screen lock is enabled |
| Laptops used for clinic work | Confirm location; verify full-disk encryption is enabled |
| Tablets used for patient intake or clinical documentation | Confirm inventory; confirm passcode or biometric lock is required |
| Staff personal phones with work email | Confirm whether any are enrolled in MDM; review BYOD policy coverage |
| Portable storage (USB drives) | Confirm clinic policy permits or prohibits; check for any unapproved use |

For each device category, note whether any devices were lost, stolen, or decommissioned since the last check. Lost or stolen devices require a documented response under 45 CFR § 164.310(d) whether or not PHI was confirmed on the device.

### 3. Password practices

Shared passwords are one of the most common HIPAA security failures in small clinics. They make access attribution impossible: if three staff share a login, the audit trail cannot identify which person accessed a record. Shared credentials also mean a terminated employee's access cannot be revoked without disrupting the others who use the same login.

The awareness check should confirm:

- Are any shared user accounts or passwords in use for PHI systems (EHR, billing, email)?
- When did staff last change passwords for PHI-containing systems?
- Are any default vendor credentials still active on clinic equipment?
- Is multi-factor authentication enabled for remote access to PHI systems? NIST SP 800-66 Rev. 2 identifies it as a relevant control, and it has appeared in OCR settlement agreements.

Shared passwords found during the check require a risk register entry and a remediation plan.

### 4. Physical security

Physical safeguards under the Security Rule (45 CFR § 164.310) cover workstation placement and physical access controls. Small clinics are unlikely to have badge readers and server cages, but the physical walk-through reliably surfaces straightforward gaps.

Walk through the clinic and check:

- Are workstation monitors positioned so PHI on the screen is not visible to patients?
- Are unattended workstations locked — automatically or by policy?
- Are paper records with PHI (superbills, routing slips, insurance cards) secured when not in active use?
- Who holds keys or access codes to areas where PHI is processed, and when was that list last reviewed?
- Are visitor access procedures followed — is an unaccompanied vendor ever left in an area where PHI is accessible?

Physical security gaps are cheap to correct. Document the finding and the corrective action in the check record.

### 5. Disposal practices

Improper disposal of PHI — paper or electronic — has resulted in OCR enforcement actions and civil monetary penalties. The check should confirm disposal practices match the clinic's written policy.

For paper PHI:

- Are shred bins available at every location where paper PHI is generated?
- Is the shred bin vendor a business associate with a signed BAA?
- Are workforce members using shred bins rather than general waste?

For electronic PHI:

- Does the decommissioning procedure for any device include verified data sanitization before disposal or transfer?
- Are old devices sitting in a storage closet without a documented sanitization status?

A paper routing slip in an unlocked trash bin is a low-severity finding — but still a finding. Document it, correct it, and put it on the next training agenda.

### 6. Incident reporting awareness

The check closes with a brief confirmation that workforce members know how to report incidents. The common failure is not indifference — it is uncertainty about what rises to the level of a reportable event, or not knowing who to report it to.

Verify:

- Is there an accessible reference explaining what to report (lost devices, suspected phishing, inadvertent disclosures, out-of-scope record access)?
- Do workforce members know the Privacy Officer's name and contact information?
- Has the reporting process been discussed at a team meeting or training in the past six months?
- Have any incidents been mentioned informally that were never formally reported? If so, open an investigation.

A check conversation sometimes surfaces a near-miss that was handled informally and never documented. Capturing those is one of the most useful things the check does.

## Documenting the check

Each check produces a written record identifying the date, the person who conducted the review, a brief finding for each of the six areas, any gaps with an assessed severity (low, medium, high), risk register entries opened, and corrective actions with target dates.

Retain the check record with the evidence binder. OCR audit requests for evidence of ongoing security management are answered directly by these records — they are the proof that security awareness is an active, recurring practice and not just an annual training checkbox.

## What to do with gaps

Each gap identified gets a risk register entry, an owner, and a target date — not a note in a checklist.

Minor gaps (a monitor that needs repositioning, a missed shred bin) can be corrected immediately. Document the finding and the correction.

Moderate gaps (shared passwords in active use, an unlocated device) require a formal response plan. Log them in the risk register with an assessed risk level and a remediation owner. Review at the next quarterly compliance meeting.

Significant gaps — unauthorized access discovered, a confirmed lost device with no encryption, evidence of improper PHI disclosure — trigger the incident response process immediately.

The findings from each check also feed the next training cycle. A pattern of staff unable to describe the phishing reporting process is a training gap. Put it on the training agenda with a completion date.

## Setting the cadence

Quarterly is the right cadence for most small clinics. It aligns with the quarterly compliance meeting, meaning gaps get reviewed in a consistent forum, and ensures no more than 90 days pass between checks.

Document the cadence in the security awareness policy rather than leaving it as informal practice. A documented quarterly process with consistent execution is more defensible than a check that happens whenever someone remembers to run it.
