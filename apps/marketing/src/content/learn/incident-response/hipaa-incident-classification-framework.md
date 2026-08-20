---
title: "How to Classify HIPAA Incidents"
description: "A practical classification framework for HIPAA incidents at small clinics — distinguishing near-misses, security events, and reportable breaches, and understanding what each classification requires."
metaDescription: "HIPAA incident classification framework for small clinics. How to distinguish near-misses, security events, and reportable breaches — and what each requires."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: incident-response
summary: "Not every HIPAA incident is a reportable breach. Covered entities must classify incidents into three categories — near-misses, security events, and breaches — because each category triggers different obligations. The 4-factor breach risk assessment is the tool for distinguishing security events from breaches. All three categories should be logged, but only breaches trigger notification obligations."
keyTakeaways:
  - "A near-miss is an event that could have resulted in unauthorized PHI access but did not — no PHI was actually compromised; no breach assessment required but logging recommended"
  - "A security event is an impermissible use or disclosure of PHI that requires a 4-factor breach risk assessment to determine whether it constitutes a breach"
  - "A breach is an impermissible use or disclosure of PHI for which the 4-factor risk assessment did not demonstrate low probability of compromise — triggers individual notification within 60 days"
  - "All three categories should appear in your incident log — the log demonstrates your program is actively monitoring, not just responding to confirmed breaches"
  - "The documentation of a non-breach determination is as important as the notification documentation for a breach — undocumented non-breach determinations are vulnerable in OCR investigations"
author: angel-campa
reviewer: phiguard-compliance-research
intent: consideration
relatedResource: hipaa-incident-triage-worksheet
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.402 — Definition of Breach"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.402"
    publisher: "eCFR"
  - title: "HHS Breach Notification Rule Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/guidance/index.html"
    publisher: "HHS"
  - title: "NIST SP 800-61 Computer Security Incident Handling Guide"
    url: "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final"
    publisher: "NIST"
---

When a staff member reports a potential HIPAA incident — a fax sent to the wrong number, a lost device, an email with a patient attachment going to the wrong recipient — the first question is what kind of incident it is.

The answer determines what happens next. Covered entities must distinguish between near-misses, security events, and reportable breaches because each category carries different obligations. Getting the classification wrong creates its own compliance exposure: treating a breach as a non-breach without documentation, or logging an event and stopping there when a full breach determination is required.

## The Three Incident Categories

### Category 1: Near-Miss

A near-miss is an event that created the conditions for unauthorized PHI access but did not result in any actual disclosure or access to PHI.

Examples of near-misses:
- A staff member started to enter the wrong fax number and caught the error before sending
- A laptop containing PHI was left in an unlocked car overnight but was found the next morning before anyone accessed it (and the laptop was encrypted)
- A phishing email containing a malicious link was received and deleted without anyone clicking it
- A patient waiting room has a visible exam room schedule that could be read by other patients — the risk is identified and the schedule is moved

In a near-miss, no PHI was actually compromised. The 4-factor breach risk assessment isn't triggered because there was no impermissible use or disclosure.

**What near-misses require:** Logging. A near-miss log entry shows that your monitoring and reporting system is working — staff noticed the potential issue and brought it forward. Near-miss patterns also help identify recurring vulnerabilities before they turn into actual incidents.

Near-misses don't require individual notification or HHS reporting, and they don't trigger the 4-factor assessment. They should appear in your incident log with a clear notation: "Near-miss — no PHI accessed or disclosed."

### Category 2: Security Event (Non-Breach)

A security event is an impermissible use or disclosure of PHI that occurred — but for which the 4-factor risk assessment demonstrates a low probability that the PHI has been compromised.

An impermissible use or disclosure of unsecured PHI is presumed to be a breach unless the covered entity can demonstrate low probability of compromise through the documented 4-factor assessment. When the assessment demonstrates low probability, the event is a security event, not a breach, and breach notification is not required.

Examples that might be classified as security events after 4-factor assessment:
- A fax containing patient names and appointment dates was sent to another covered entity (a physician's office) that received it in error, confirmed they did not review the clinical content, and returned or destroyed the fax under documented attestation
- An email with a single patient's demographic information was sent to the wrong recipient within the same organization (wrong department, no unauthorized disclosure outside the covered entity)
- A staff member accidentally accessed the wrong patient's chart for approximately 30 seconds before realizing the error, immediately closed the chart, and the clinic's audit log confirms no actions were taken on the record

**What security events require:** The 4-factor risk assessment must be completed and documented. The non-breach determination must be written down. The event must appear in the incident log with the assessment date, findings, and determination. All documentation must be retained for six years.

An undocumented non-breach determination is not a defensible one. If OCR investigates and asks why a specific event was treated as a non-breach, "we decided it wasn't a big deal" isn't an answer. The 4-factor assessment documentation is the answer.

### Category 3: Breach

A breach is an impermissible use or disclosure of unsecured PHI for which the 4-factor risk assessment does not demonstrate a low probability that the PHI has been compromised.

Examples that are typically classified as breaches:
- A laptop without encryption containing patient records was stolen from a provider's car
- A staff member emailed a patient's full clinical record to the wrong patient
- A former employee accessed EHR records using their old credentials after termination
- A mailing containing explanation of benefits information was sent to the wrong address and not recovered
- A business associate reports a data breach affecting patient records they held on your behalf

**What breaches require:**
- Individual notification to each affected patient within 60 days of discovery
- HHS notification: immediately (within 60 days) for breaches affecting 500 or more individuals; annual log (due March 1 of the following year) for breaches affecting fewer than 500 individuals
- Media notification for breaches affecting 500 or more individuals in a single state
- Documentation of the breach, the determination, and all notification activities retained for six years

## The 4-Factor Assessment: Applied

The 4-factor risk assessment is required for every security event to determine whether it is a breach. The four factors under 45 CFR §164.402 are:

| Factor | What you're assessing |
|---|---|
| Nature and extent of the PHI | What types of data were involved? The more sensitive and complete the PHI, the higher the risk |
| The unauthorized recipient | Who received the PHI? A random member of the public creates higher risk than another covered entity with their own HIPAA obligations |
| Whether the PHI was acquired or viewed | Is there evidence the PHI was accessed? Or was it contained in a sealed envelope that was returned intact? |
| Extent of risk mitigation | Were steps taken to reduce the risk? Did the unauthorized recipient cooperate and provide attestation? |

For the event to be classified as a non-breach, all four factors must support a low probability of compromise. A single factor supporting high probability can make the overall determination a breach, even if the other factors are favorable.

**The documentation standard:** For each factor, write a brief narrative of your findings. One paragraph per factor covering what you assessed, what information was available, and what conclusion you reached. The overall determination, breach or non-breach, follows from the four-factor analysis.

## The Incident Log: What to Include for Each Category

Every incident — near-miss, security event, and breach — should appear in the incident log. The log should be a running record throughout the year, not a year-end reconstruction.

For each incident entry, include:
- Date of incident (when it occurred)
- Date reported (when it was reported to the Privacy Officer)
- Brief description of what happened
- Category: Near-miss / Security Event / Breach
- PHI involved (types, number of individuals)
- 4-factor assessment completed: Y/N (not required for near-misses)
- Determination: Near-miss / Non-breach (security event) / Breach
- Notifications sent: Y/N (for breaches)
- Documentation location (where the full incident file is stored)

The incident log is the summary. The incident file — containing the intake form, 4-factor assessment, determination memo, and notification records — is the detailed record. Both must be retained for six years.

## Common Classification Errors

**Treating every incident as a near-miss without documentation.** Small practices sometimes avoid logging events as security events because they don't want to "make it official." An undocumented event that surfaces later in an OCR investigation — from a complainant or an audit — looks like a concealed incident, not a reasonable non-breach determination.

**Completing the 4-factor assessment in your head without writing it down.** The Privacy Officer may mentally walk through the four factors and conclude it's not a breach. That mental exercise has no evidentiary value. The written assessment is the compliance artifact.

**Not running the 4-factor assessment at all.** "It was probably fine" is not a risk assessment. Every impermissible use or disclosure of unsecured PHI is presumed to be a breach. The burden is on the covered entity to demonstrate otherwise through the documented 4-factor analysis.

**Categorizing a breach as a security event to avoid notification.** OCR investigations sometimes find that covered entities made non-breach determinations without adequate documentation, or that the documented rationale doesn't hold up. The documentation for any non-breach determination must be rigorous enough to withstand scrutiny.

## What PHIGuard Changes

PHIGuard's incident management module guides the Privacy Officer through the classification decision at intake — distinguishing near-miss from security event and prompting the 4-factor assessment for any event involving PHI. The assessment is completed in a structured form, not in a Word document. The classification is logged with a timestamp. The incident file is maintained in the compliance record. The incident log for the year is a filterable, exportable record — not a spreadsheet that someone updates manually.
