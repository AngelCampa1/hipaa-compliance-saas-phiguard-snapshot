---
title: "How to Triage Suspected HIPAA Incidents"
description: "When a staff member reports a suspected incident, the clinic's first 24 hours determine whether it becomes a reportable breach. This guide covers the triage workflow, the four-factor assessment, and what to document before anything else."
metaDescription: "How small clinics should triage suspected HIPAA incidents in the first 24 hours, using the four-factor breach risk assessment."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: incident-response
schemaType: article
intent: consideration
summary: "The first 24 hours after a suspected incident are the most consequential. Clinics that contain, document, and apply the four-factor assessment immediately protect both their patients and their legal position. Clinics that delay or assume trade their best evidence for their worst outcome."
keyTakeaways:
  - "Under the Omnibus Rule, a PHI security incident is presumed to be a breach unless the clinic can demonstrate low probability of compromise using the four-factor analysis."
  - "The 60-day breach notification clock starts at discovery, not at the conclusion of the investigation — early documentation protects the clinic's timeline."
  - "Triage is not the same as the final breach determination: triage preserves evidence and applies preliminary facts to the four-factor test so the Privacy Officer can make an informed call."
  - "Even events determined not to be breaches must be documented in the clinic's incident log."
  - "Containment is a triage action, not an excuse to destroy evidence — retrieve the fax, revoke the credential, but do not delete the records."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-incident-triage-worksheet
relatedCommercialPath: /security
sources:
  - title: "Breach Notification Rule"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
  - title: "Breach Notification Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/guidance/index.html"
    publisher: "HHS"
  - title: "45 CFR Parts 160 and 164 — Breach Notification Rule (§ 164.400–414)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D"
    publisher: "eCFR"
  - title: "HIPAA Omnibus Rule — Final Rule (2013)"
    url: "https://www.federalregister.gov/documents/2013/01/25/2013-01073/modifications-to-the-hipaa-privacy-security-enforcement-and-breach-notification-rules"
    publisher: "Federal Register"
faq:
  - q: "What is the difference between a security incident and a breach under HIPAA?"
    a: "A security incident is any attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations. A breach is a specific subset: an impermissible acquisition, access, use, or disclosure of unsecured PHI that is not covered by one of the three exceptions under 45 CFR § 164.402. Every breach is a security incident, but not every security incident rises to a breach."
  - q: "When does the 60-day breach notification clock start?"
    a: "The clock starts from the date the covered entity discovered the incident — or the date the covered entity would have discovered it through reasonable diligence. It does not start when the investigation is complete or when the Privacy Officer is satisfied with the facts."
  - q: "Does a misdirected fax always have to be reported as a breach?"
    a: "Not automatically. A misdirected fax triggers the four-factor analysis. If the PHI was retrieved before it could reasonably have been viewed, and there is documented evidence of retrieval, the clinic may be able to demonstrate low probability of compromise. The analysis must be documented either way."
---

When a front-desk coordinator reports that she sent a referral summary to the wrong fax number, or a billing manager notices a former employee's credentials still have system access, or a nurse realizes she emailed the wrong patient's lab results, the next hour matters more than almost anything that follows.

Most clinics know HIPAA requires breach notification. Fewer know that the obligation is triggered not by the event itself but by the clinic's failure to demonstrate, through documented analysis, that the event did not compromise PHI. The triage process is where that demonstration begins.

## The presumption the clinic must overcome

Since the Omnibus Rule took effect in September 2013, the Breach Notification Rule has operated on a presumption of breach. Under 45 CFR § 164.402, any impermissible acquisition, access, use, or disclosure of unsecured PHI is presumed to be a breach requiring notification, unless the covered entity can demonstrate a low probability that the PHI has been compromised based on a four-factor risk assessment.

The clinic does not wait to confirm harm. It must produce a documented analysis showing why this particular event, given these specific facts, presents a low probability of compromise. Without that analysis, the presumption stands and notification is required.

## The four-factor breach risk assessment

The four factors come from the Breach Notification Rule itself and from HHS guidance interpreting the Omnibus Rule. Every factor should be addressed with facts specific to the incident — not with generic comfort language that says something like "unlikely to cause patient harm."

**Factor 1: The nature and extent of the PHI involved, including the types of identifiers and the likelihood of re-identification.**

What was actually exposed? A document with a full name, date of birth, diagnosis, and insurance number creates a different risk profile than one with only a first name and appointment date. The analysis should list the specific data elements involved, note whether they include direct identifiers such as name, MRN, SSN, or diagnosis, and address whether the combination of data elements creates a re-identification risk even if no single element is highly sensitive.

**Factor 2: Who used the PHI or to whom the PHI was disclosed.**

The identity and role of the recipient matter. PHI sent to another covered entity in the healthcare context, even the wrong one, carries a lower risk profile than PHI sent to an unknown number or a commercial entity. If the recipient is known, document who they are. If the recipient is unknown, document what is known about the receiving system, business, or individual and what inference can reasonably be drawn about their relationship to patient data.

**Factor 3: Whether the PHI was actually acquired or viewed.**

Was there evidence that the PHI was opened, read, or retained? A fax confirmed as received and then retrieved from the receiving machine before being opened is a different situation from a fax confirmed received with no confirmation of retrieval. For electronic access events, log evidence showing whether a file was opened or downloaded is directly relevant here. For paper documents, retrieval confirmation and chain-of-custody notes are the equivalent.

**Factor 4: The extent to which the risk to the PHI has been mitigated.**

What has the clinic actually done to reduce the probability of harm? Retrieval of a document is strong mitigation evidence — if it can be confirmed. A verbal agreement from the receiving party that they will destroy the document is weaker mitigation, and the analysis should reflect that. Credential revocation within minutes of discovery is strong mitigation for an unauthorized access event. Credential revocation after the account was active for 48 hours is weaker. Document the specific actions taken, the timing of those actions, and the evidence that they were effective.

## The triage workflow: first 24 hours

Triage is not the final breach determination. It is the structured set of immediate actions that preserves evidence, contains active exposure, and generates the preliminary facts the Privacy Officer needs to begin the four-factor analysis. The determination follows triage.

### Step 1: Document the report as received

The moment the incident is reported, write it down. Who reported it, at what time, in what form, and exactly what they described. Do not paraphrase and do not wait until you understand the full picture. The initial report is evidence and it may be the only contemporaneous account the clinic has of how the event came to attention. The 60-day notification clock starts at discovery, and discovery is defined as the date the covered entity knew or should have known of the incident. A time-stamped incident report entry is how the clinic proves when it learned what it learned.

### Step 2: Contain the active exposure

If the incident is still ongoing — a former employee's credentials are still active, a fax line is still transmitting, an email forwarding rule is still running — containment comes before analysis. Revoke the access. Retrieve the document if it can be retrieved. Stop the transmission if it has not yet arrived. Containment is a triage action, not an evidence-destruction action. The incident record should note what was done and when, but containment is not a justification for deleting system logs, shredding documents, or otherwise removing evidence. Contain and preserve, not contain and erase.

### Step 3: Apply the four-factor test to the available facts

With the initial report documented and active exposure stopped, the triage team — typically the Privacy Officer and the direct supervisor of the person involved in the incident — works through all four factors using the facts currently available. This is a preliminary analysis, not a final one. The analysis will likely need to be updated as more information surfaces, but the preliminary version should be documented with whatever is known at the time of triage.

For each factor, note the evidence used, what evidence is missing and how the clinic will try to obtain it, and the preliminary conclusion. The goal is a structured document, not a narrative written to reach a predetermined answer.

### Step 4: Escalate to the Privacy Officer for the breach determination

The triage team's role is fact-gathering and preliminary analysis. The breach determination itself — the formal conclusion about whether this event meets the definition of a breach and whether it can be demonstrated to present a low probability of compromise — belongs to the Privacy Officer. The triage output is the input to that determination.

If the Privacy Officer was involved in the triage (which is recommended for any event with significant complexity), the determination can happen quickly. If the Privacy Officer is learning about the event for the first time at escalation, the triage documentation gives them the facts they need to begin.

### Step 5: Preserve evidence

Throughout triage, the clinic should be preserving rather than cleaning up. That means:

- Do not delete system logs, access logs, or email headers.
- Do not destroy fax cover sheets, misdirected documents, or copies of documents sent in error.
- Do not reformat or reprovision a device that may have been involved until an image or forensic copy exists.
- Document the current state of every system and record touched by the incident.

The investigation that follows triage depends on this preservation. OCR investigations depend on it even more.

## Who should conduct the triage

The Privacy Officer should lead or be directly notified of every suspected HIPAA incident regardless of apparent severity. The direct supervisor of the staff member involved should participate to provide context about the normal procedure, the deviation, and the likely sequence of events. In a clinic without a dedicated compliance officer, the practice administrator or the owner-physician designated as the Privacy Officer carries this role.

The person involved in the incident should not conduct the triage. That person is a witness and a source of facts, not a decision-maker on whether their action created a breach risk.

## What "mitigation" actually means under the four-factor test

Factor 4 is most frequently misapplied. Mitigation under the four-factor test does not mean the clinic felt better about the situation. It means the clinic can point to a specific action that reduced the probability that the PHI was compromised.

Retrieval is the clearest example. If the clinic sent a document to the wrong fax number and then confirmed — in writing, with the recipient acknowledging destruction or return — that the document was retrieved and not retained, that is strong mitigation evidence. If the clinic called the number and got no answer, that is documented mitigation effort, but not confirmed mitigation. The analysis should say that plainly.

"We think it's fine" is not a four-factor analysis. The analysis must be based on what the clinic knows, documented with what the clinic did to find out, and honest about the gaps.

## What to document regardless of the determination

Whether the event is determined to be a breach or determined not to be a breach, the incident must be logged in the clinic's incident records and retained for six years under 45 CFR § 164.530(j). The log should include:

- The date the incident was discovered.
- A description of what occurred.
- The individuals or records involved (without unnecessary PHI detail in the log itself).
- The four-factor analysis with supporting evidence.
- The breach determination and the reasoning for it.
- Any containment or mitigation actions taken.
- The name of the person who made the determination and the date.

Clinics that maintain this documentation consistently — for every event, not just confirmed breaches — are in a stronger position if OCR reviews their incident handling. A complete log shows the clinic applies consistent standards and does not suppress events because they are inconvenient to report.

## The notification timeline starts at discovery

The 60-day clock for notifying affected individuals under 45 CFR § 164.404 runs from discovery, not from the completion of the four-factor analysis or the formal breach determination. Clinics that spend weeks completing their investigation before beginning the notification process frequently find themselves in a compressed window when notification is ultimately required.

Begin preparing the notification infrastructure — identifying affected individuals, confirming contact information, drafting notice language — while the four-factor analysis is still in progress. If the analysis demonstrates low probability of compromise, the materials are not used. If the event is a reportable breach, the preparation work shortens the time from determination to notification.

The incident record should include a field for the discovery date and a separate field tracking the notification deadline, even before the breach determination is made. Running out the 60-day clock because the clinic confused discovery with the end of its investigation is an avoidable failure.

## Related resources

For the full four-factor framework, see [The Four-Factor Breach Risk Assessment](/learn/incident-response/four-factor-breach-risk-assessment). For the notification timeline obligations after a determination, see [HIPAA Breach Notification Timelines](/learn/incident-response/hipaa-breach-notification-timelines). For the incident triage worksheet, see the [HIPAA Incident Triage Worksheet](/resources/hipaa-incident-triage-worksheet). For how PHIGuard supports incident documentation and breach assessment within a structured compliance program, see [Security](/security).
