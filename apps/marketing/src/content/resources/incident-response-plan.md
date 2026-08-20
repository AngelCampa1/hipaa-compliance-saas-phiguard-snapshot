---
title: "HIPAA Incident Response Plan Template"
headline: "A fill-in-the-blank incident response plan built around §164.308(a)(6) — ready for your Security Officer to complete today"
description: "A fill-in-the-blank incident response plan template built around the §164.308(a)(6) Security Incident Procedures safeguard."
metaDescription: "Free HIPAA incident response plan template built around §164.308(a)(6). Includes breach risk assessment, notification guide, and documentation log."
magnetSlug: "incident-response-plan"
summary: "A fill-in-the-blank incident response plan template built around the §164.308(a)(6) Security Incident Procedures safeguard. Small clinics can use it to document incident response plan template, assign owners, set review dates, capture exceptions, and keep evidence aligned with HIPAA safeguards, minimum necessary expectations, vendor oversight, or patient-rights obligations reflected in the cited source material."
stage: "decision"
sequenceStage: "decision"
bullets:
  - "Identification and containment steps — a sequential response procedure your team can follow during an active incident without compliance training"
  - "Notification timeline guide — plain-English walkthrough of the 60-day OCR notification rule and individual notice requirements"
  - "Breach risk assessment worksheet — the four-factor analysis required to apply the low probability of compromise exception"
  - "Documentation log — captures incident discovery date, involved systems, workforce members notified, and actions taken"
  - "Post-incident review form — documents lessons learned and policy updates to support the §164.308(a)(6)(ii)(B) response and reporting workflow"
faq:
  - q: "Who should own the incident response plan template?"
    a: "The privacy officer, security officer, or practice administrator should own the incident response plan template, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-18"
updatedAt: "2026-04-22"
sources:
  - title: "Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/product"
relatedLearnPath: "/learn/incident-response/four-factor-breach-risk-assessment"
---

## Purpose

The Security Incident Procedures standard at 45 CFR §164.308(a)(6)(i) requires every covered entity to implement policies and procedures to address security incidents. The required implementation specification at §164.308(a)(6)(ii) goes further: the organization must identify and respond to suspected or known security incidents, mitigate harmful effects to the extent practicable, and document security incidents and their outcomes.

Most small practices can describe what they would do if a laptop went missing. Fewer have the decision written down. Fewer still have the decision written down, distributed to the workforce, and tested in a tabletop exercise. The gap between "we would know what to do" and "we have a plan someone can execute at 7:42 a.m. when the EHR is encrypted" is where OCR investigations surface findings.

This plan gives your clinic the structure. It assigns roles, classifies severity, lays out a response playbook, names notification obligations with specific citations, and provides evidence preservation and post-incident review templates. Adapt the sections in brackets to your clinic. Sign it. Distribute it. Test it.

## Scope

This plan covers any security incident involving systems, devices, people, or physical records that create, receive, maintain, or transmit PHI on behalf of [Clinic Name]. It applies to all workforce members, including temporary staff, contractors, and volunteers. It applies to incidents discovered internally and to incidents reported to us by Business Associates.

The plan uses the HIPAA definitions at §164.304 and §164.402. A security incident is the attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations. A breach is the acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of the PHI, subject to the exceptions in the definition and the risk assessment at §164.402.

## Roles and Responsibilities

Five roles own the response. In a small clinic, the same person often wears two hats. Write down who holds each role and who covers them when they are unavailable.

### Incident Response Lead

**Decision authority:** Activates the plan. Declares severity level. Decides when the incident is closed. Owns the incident log and the post-incident review.

**Day-to-day:** Usually the Practice Administrator or the Security Officer. First call after an incident is reported.

### Privacy Officer

**Decision authority:** Breach determination under §164.402. Authorizes individual, media, and HHS notifications. Signs the four-factor risk assessment.

**Day-to-day:** The designated Privacy Officer per §164.530(a)(1). May be the same person as the IR Lead in a five-person clinic. Owns the final language of any breach notification sent to patients.

### Security Officer

**Decision authority:** Technical containment and eradication decisions. Isolation of systems, credential revocation, network segmentation changes. Coordinates with IT Business Associate if one is engaged.

**Day-to-day:** The designated Security Officer per §164.308(a)(2). Owns evidence preservation and forensic coordination.

### Communications Lead

**Decision authority:** All internal and external communications about the incident. Holding statements. Front-desk scripts. Staff talking points.

**Day-to-day:** Usually the Practice Administrator or an owner. Owns the communications tree (see later section) and ensures no workforce member answers questions before the Communications Lead has approved the language.

### Legal Contact

**Decision authority:** Advises on breach determination, notification content, and law enforcement coordination. Approves engagement with cyber insurance carrier.

**Day-to-day:** Outside counsel on retainer or on call. Name, firm, phone, and email recorded in the plan. Engaged on P1 and P2 incidents before external notification.

## Severity Classification

Classify every incident at the moment of declaration. The classification drives the response tempo and the notification obligations.

### P1 — Confirmed Breach

A breach per §164.402 has been confirmed, or the four-factor risk assessment has concluded that the low probability of compromise exception does not apply. Notification obligations under §§164.404, 164.406, 164.408 are engaged.

Examples: Ransomware that has exfiltrated PHI before encryption. A stolen unencrypted laptop known to contain patient records. An email containing a patient list sent to the wrong recipient outside the clinic, confirmed opened. A workforce member who accessed records of a non-patient family member for personal reasons.

### P2 — Suspected Breach

A security incident has occurred, PHI may have been involved, and the four-factor risk assessment has not yet been completed. The clock on the 60-day individual notification rule is running as of the date of discovery.

Examples: A phishing email succeeded against a staff inbox, the inbox contained PHI, and the scope of attacker access is still being determined. A misplaced backup drive whose contents and status are unknown. An EHR audit log anomaly suggesting unauthorized access that has not yet been confirmed.

### P3 — Security Incident, No PHI Impact

A security incident has occurred but PHI is not reasonably believed to have been involved, or the PHI involved was de-identified per §164.514. Internal documentation and remediation are required; external notification is not.

Examples: A failed phishing attempt that did not result in credential compromise. A workstation infected with adware isolated before any PHI access. A guest Wi-Fi misconfiguration discovered and fixed before exploitation.

### P4 — Minor Event

A minor deviation from security policy that is worth logging for pattern tracking but does not constitute a security incident under §164.304.

Examples: A workforce member wrote their password on a sticky note (discovered and corrected). A front-desk workstation left unlocked over lunch (no visitor access). An unescorted vendor technician in the staff area for under a minute.

Keep a log even of P4 events. Trend data on small deviations is the best early warning for larger gaps.

## Detection Sources

Incidents surface through several channels. Each channel has a named procedure for how the report reaches the Incident Response Lead.

- **Automated monitoring alerts.** EHR audit log anomalies, failed-login spikes, endpoint security alerts, cloud security posture alerts, email security alerts. Alerts route to the Security Officer with an SLA of same-business-day triage.
- **Workforce member reports.** Any staff member can and should report a suspected incident. The reporting channel is [phone number] and [email address], staffed by the Security Officer. Reports may be made anonymously.
- **Business Associate notifications.** Per §164.410, a BA must notify the covered entity of a breach affecting unsecured PHI without unreasonable delay and in no case later than 60 days of discovery. BA notifications are treated as P2 or P1 on receipt pending our own assessment.
- **Vendor and partner alerts.** Payer fraud alerts, payment processor alerts, clearinghouse rejections suggesting possible account compromise.
- **Patient reports.** A patient reports receiving records or communications not intended for them, or reports seeing their information in an unexpected place.
- **Law enforcement or regulator notification.** A federal or state law enforcement agency notifies the clinic that it has evidence of compromise.

## The Response Playbook

The playbook has five phases: Identify, Contain, Eradicate, Recover, Document. The phases run roughly in sequence, with documentation running continuously across all five. Actions in each phase are assigned to a named role.

### Identify

**Goal:** Confirm an incident is occurring, determine scope, preserve evidence.

- Incident Response Lead opens the incident log, assigns an Incident ID, records the discovery date and time, the reporting channel, and the initial description.
- Security Officer performs initial scope determination: what systems, what accounts, what data, how long.
- Security Officer preserves evidence before any containment step that might destroy it. Snapshots of affected hosts. Export of relevant logs. Do not reboot, reimage, or delete anything that could be evidence.
- Incident Response Lead assigns a preliminary severity (P1–P4). Severity is revisited after containment when scope is clearer.
- Privacy Officer is notified for any incident preliminarily classed P1 or P2.

### Contain

**Goal:** Stop the bleed. Prevent further unauthorized access.

- Security Officer isolates affected systems. Network segmentation, disconnection from Wi-Fi, disabling of VPN access. Do not shut down if forensic state is needed — isolation is preferred over power-off.
- Security Officer revokes credentials known or suspected compromised. Rotate passwords, revoke API tokens, terminate active sessions, disable accounts pending investigation.
- Incident Response Lead notifies Legal Contact on P1 and P2. Engages cyber insurance carrier if applicable — most policies require prompt notification to preserve coverage.
- Communications Lead prepares a holding statement for the workforce. No staff member communicates with patients, vendors, or external parties about the incident before the holding statement is approved.

### Eradicate

**Goal:** Remove the threat actor's access and the underlying vulnerability.

- Security Officer and IT BA remove malware, close the exploited vulnerability, patch the affected software, rebuild compromised systems from known-clean images.
- Security Officer confirms that the threat actor no longer has access through any secondary channel (lingering sessions, persistence mechanisms, rogue scheduled tasks, additional compromised credentials).
- If the incident involved a workforce member, Incident Response Lead coordinates with HR on interim access restrictions and sanctions process per §164.308(a)(1)(ii)(C).

### Recover

**Goal:** Restore normal operations safely and verify the environment is clean.

- Security Officer restores affected systems from verified-clean backups or rebuilt images. Validates data integrity before returning systems to production.
- Security Officer and Incident Response Lead agree on monitoring uplift for the affected environment for a defined period after recovery.
- Communications Lead notifies internal staff that the incident is in the recovery phase and updates workforce-facing guidance.
- Privacy Officer begins or continues the four-factor risk assessment under §164.402 if PHI was involved. The assessment documents: (1) the nature and extent of the PHI involved, including the types of identifiers and the likelihood of re-identification; (2) the unauthorized person who used the PHI or to whom the disclosure was made; (3) whether the PHI was actually acquired or viewed; (4) the extent to which the risk to the PHI has been mitigated.

### Document

**Goal:** Produce the auditable record §164.308(a)(6)(ii) requires.

- Incident Response Lead maintains the incident log from opening through closure. Every material action, decision, and notification is timestamped and attributed to a named role.
- Privacy Officer files the completed four-factor risk assessment. If the assessment supports a low probability of compromise exception, the reasoning is written out in full. If the assessment does not support the exception, the incident is confirmed as a breach and notification obligations are triggered.
- Incident Response Lead files the closed incident record in the compliance program records for a minimum of six years per §164.530(j).

## Notification Obligations

Once a breach is confirmed under §164.402, notification obligations are defined by statute. Dates are calculated from the date of discovery.

### Affected Individuals — §164.404

Notice to each affected individual without unreasonable delay and in no case later than 60 calendar days after discovery. Written notice by first-class mail (or email if the individual has agreed to electronic notice and the agreement has not been withdrawn). Substitute notice per §164.404(d)(1)(ii) if contact information is insufficient or out of date. Content per §164.404(c): a brief description of what happened, the types of information involved, steps individuals should take to protect themselves, what the covered entity is doing to investigate and mitigate, and contact information.

### HHS Office for Civil Rights — §164.408

Breach affecting 500 or more individuals: notice to the Secretary of HHS contemporaneously with the notice to affected individuals. Breach affecting fewer than 500 individuals: notice to the Secretary annually, not later than 60 days after the end of the calendar year in which the breaches were discovered. Submissions are filed through the HHS breach reporting portal.

### Media — §164.406

Breach affecting more than 500 residents of a state or jurisdiction: notice to prominent media outlets serving that state or jurisdiction without unreasonable delay and in no case later than 60 days after discovery. Content substantially similar to the individual notice.

### Business Associate to Covered Entity — §164.410

If the breach occurred at a Business Associate, the BA must notify the covered entity without unreasonable delay and in no case later than 60 calendar days after discovery. The BA's notification should include, to the extent possible, the identification of each individual whose PHI was involved, and any other information the covered entity is required to include in its own notice to individuals. Your BAA should require faster notice — most contracts specify within a small number of days — so that the covered entity retains time to complete its own notifications within the 60-day regulatory ceiling.

### State Laws

State breach notification laws may impose additional or different obligations — shorter timelines, different content requirements, attorney general notifications, consumer reporting agency notifications. Check the state laws of every jurisdiction where affected individuals reside. Legal Contact coordinates this review on P1 incidents.

## Communication Tree

Order of notification on a confirmed P1 incident:

1. Incident Response Lead → Privacy Officer, Security Officer, clinic owner or senior partner.
2. Incident Response Lead → Legal Contact.
3. Incident Response Lead → Cyber insurance carrier (if applicable).
4. Communications Lead → All workforce members (holding statement).
5. Security Officer → Affected Business Associates (coordination on scope, notification obligations under the BAA).
6. Privacy Officer → Affected individuals (within 60 days; earlier where practicable).
7. Privacy Officer → HHS OCR (per §164.408 thresholds).
8. Communications Lead → Media (per §164.406 thresholds).
9. Privacy Officer → State authorities (per applicable state law).

The tree is sequential for authorization but often parallel in execution. Legal Contact is engaged before any external party is notified.

## Evidence Preservation Checklist

- [ ] Incident ID assigned and timestamp of discovery recorded
- [ ] Initial reporter name and contact recorded
- [ ] Affected systems identified and snapshots taken before containment
- [ ] Relevant log exports preserved (EHR audit logs, authentication logs, email logs, firewall logs, endpoint logs) for the relevant time window plus a buffer on either side
- [ ] Physical evidence (lost device make, model, serial; recovered media; incident location photos where applicable) catalogued
- [ ] Chain of custody log opened for any physical evidence
- [ ] Backups of affected systems identified and protected from overwrite
- [ ] Communications with threat actor (ransom notes, phishing emails, extortion messages) preserved in original format
- [ ] Vendor and BA communications preserved
- [ ] Do not reboot, reimage, or delete anything until preservation is confirmed

## Post-Incident Review Template

Complete within 30 days of incident closure. The review is the artifact that shows §164.308(a)(8) evaluation happening in practice.

- **Incident ID and title.**
- **Date discovered. Date contained. Date closed.**
- **Severity (final classification).**
- **Summary.** Two to four sentences in plain language.
- **Timeline.** Every material event with timestamp and role responsible. Discovery, initial triage, containment steps, eradication steps, recovery steps, notifications.
- **Root cause.** The underlying condition that allowed the incident. Not the proximate symptom ("Jessica clicked a link") but the system condition ("no MFA on the email account, and phishing simulation training had lapsed 11 months ago").
- **Controls that worked.** Detection source fired as designed. Containment step executed cleanly. Backup restored successfully.
- **Controls that failed.** Alert did not fire. Credential revocation took longer than expected. Holding statement template was out of date.
- **Corrective actions.** Each action has an owner, a target date, and a verification method. Controls that failed generate corrective actions; controls that worked are confirmed as part of the program.
- **Policy updates required.** Any change to the incident response plan, related policies, or training curriculum.
- **Lessons for the tabletop curriculum.** Scenarios to add to the next exercise based on what actually surfaced.

Sign the review. File it. Revisit the open corrective actions at every program review until they are closed.

## Tabletop Exercise Schedule

A plan that has never been tested is a plan with unknown defects. Schedule exercises on a standing cadence.

- **Quarterly tabletop for the IR team.** 90-minute walkthrough of a realistic scenario with the Incident Response Lead, Privacy Officer, Security Officer, Communications Lead, and Legal Contact. Scenarios rotate across categories: ransomware, BA breach, insider misuse, lost device, misdirected communication, phishing with email compromise. After-action notes go into the plan's living appendix.
- **Annual full-organization exercise.** Once per year, expand the tabletop to include all workforce members. A half-day or full-day exercise that walks through a scenario end to end, including workforce communications, front-desk response, and workforce-facing talking points. This is the exercise where training gaps surface.
- **New-hire drill.** Every new hire participates in a short scenario-based incident reporting drill within the first 30 days of employment. The drill is logged in the training record.

Exercises are not pass/fail. They surface gaps. The gaps go into the corrective action list, same as a real incident.

## Annual Plan Review

Review and update this plan annually and whenever a material change in operations, technology, or law requires it. Review responsibilities: Incident Response Lead owns the update, Privacy Officer reviews the notification sections, Security Officer reviews the technical sections, Legal Contact reviews the notification obligations and any state-law additions. Signed review page at the front of the document with date and participants.

## What PHIGuard Changes

PHIGuard holds this plan, the incident log, the four-factor risk assessments, and the post-incident reviews as linked records. Incidents open as tracked tasks with owners, timestamps, and audit trail built in. Notification deadlines drive calendar reminders calculated from the date of discovery. Tabletop exercises and new-hire drills are tracked alongside training records. Evidence attaches to the incident record, not to an email thread.

PHIGuard is positioned to keep the plan, incident record, responsible owners, and supporting evidence in one operating system rather than across separate docs and inbox threads.

