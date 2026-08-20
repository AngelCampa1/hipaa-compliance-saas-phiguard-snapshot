# Breach Notification Decision Tree

**Regulatory basis:** 45 CFR 164.400-164.414, Breach Notification Rule
**Related runbook:** `docs/runbooks/incident-response.md`
**Last updated:** 2026-05-20

---

## Overview

Use this decision tree for any Level 2 or Level 3 incident under `docs/runbooks/incident-response.md`. It guides the Security Officer and incident response team through the mandatory determination of whether a security incident is a reportable HIPAA breach and which notification obligations apply.

Record the discovery date and time immediately. For PHIGuard acting as a Business Associate, the 60-day notification window under 45 CFR 164.410(a)(2) starts at discovery. If PHIGuard has direct Covered Entity obligations for a specific incident, use 45 CFR 164.404(b)(1).

---

## Step 1 - Was PHI Involved?

Use the PHI asset inventory in `docs/hipaa/risk-analysis-register-2026.md` and `docs/hipaa/safeguards-map.md`.

If the incident did not involve a system or record that creates, receives, maintains, or transmits PHI:

- Document the incident.
- Close it under `docs/runbooks/incident-response.md`.
- No HIPAA breach notification is required.

If PHI may have been involved, continue to Step 2.

---

## Step 2 - Was The PHI Secured?

Under the 45 CFR 164.402 safe harbor, a breach is not treated as a breach if the PHI was rendered unusable, unreadable, or indecipherable to unauthorized individuals.

Document all of the following:

1. PHI at rest was encrypted using an HHS-recognized method.
   - PHIGuard's current production controls rely on managed PostgreSQL provider encryption for database records.
   - PHIGuard uses object storage encryption for attachment, audit, evidence, legal, and lead-magnet objects stored in object storage.
2. PHI in transit was encrypted.
   - PHIGuard uses TLS 1.2+ at the application edge for the Worker-hosted app/API and HSTS from app security headers.
   - Database connectivity is through the current managed PostgreSQL provider and the database connection layer path.
3. Encryption secrets, provider administrator access, application sessions, and relevant service tokens were not compromised.
   - Review hosting-provider account audit logs, object storage access evidence, managed PostgreSQL provider logs, database connection layer configuration, application `audit_events`, Sentry/application logs, and vendor logs.

If all three conditions are proven, document the safe-harbor analysis, retain it for six years, and close the incident unless contractual notice still applies.

If any condition is not proven, treat the PHI as unsecured and continue to Step 3.

---

## Step 3 - Was There Impermissible Acquisition, Access, Use, Or Disclosure?

Review evidence from:

- `audit_events`
- application logs and Sentry events with PHI redaction verified
- hosting-provider account audit logs
- object storage object access evidence
- managed PostgreSQL provider audit logs
- vendor logs for any affected integration
- reports from customers, workforce members, or vendors

If there was no impermissible acquisition, access, use, or disclosure, document the analysis and close the incident.

If impermissible acquisition, access, use, or disclosure occurred or cannot be ruled out, continue to Step 4.

---

## Step 4 - Apply The Four-Factor Risk Assessment

HIPAA presumes an impermissible use or disclosure is a breach unless PHIGuard demonstrates a low probability that PHI was compromised. Document these factors:

| Factor                                       | Required Analysis                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nature and extent of PHI involved            | Identify data types, sensitivity, identifiers, object keys, affected tables, and whether clinical or billing context was exposed.                             |
| Unauthorized person who used or received PHI | Identify whether the recipient was a workforce member, vendor under BAA, customer, external attacker, or unknown party.                                       |
| Whether PHI was actually acquired or viewed  | Use logs, audit events, object storage evidence, database-provider logs, and endpoint evidence to determine whether records or objects were accessed.                     |
| Extent of mitigation                         | Document access revocation, token rotation, deletion confirmation from unintended recipients, customer/vendor attestations, and monitoring after containment. |

If the documented analysis shows a low probability of compromise, close as not reportable and retain the analysis for six years.

If compromise is likely, confirmed, or cannot be ruled out, continue to Step 5.

---

## Step 5 - Count Affected Individuals

Count each unique individual whose unsecured PHI was accessed, acquired, used, or disclosed.

Use:

- affected organization and tenant records
- task, comment, attachment, checklist, incident, training, legal, vendor, and audit data
- object storage object keys and metadata
- customer reports and vendor evidence

Document the count as `N`.

---

## Step 6 - Determine Notifications

### All Reportable Breaches

Notify affected individuals without unreasonable delay and no later than 60 days after discovery.

Required notice content:

- brief description of what happened
- types of PHI involved
- steps individuals should take to protect themselves
- steps PHIGuard is taking to investigate, mitigate harm, and prevent recurrence
- contact information for questions

If contact information is insufficient for 10 or more individuals, post a conspicuous website notice for 90 days and provide a toll-free phone number.

### 500 Or More Individuals

Notify HHS within 60 days of discovery through `https://ocrportal.hhs.gov/ocr/breach/wizard.jsf`.

If more than 500 individuals in a single state or jurisdiction are affected, notify prominent media outlets serving that area without unreasonable delay and no later than 60 days after discovery.

### Fewer Than 500 Individuals

Log the breach and submit the annual report to HHS no later than 60 days after the end of the calendar year in which the breach occurred.

### Business Associate Notice

If PHIGuard is acting as a Business Associate, notify each upstream Covered Entity without unreasonable delay and no later than 60 days after discovery. Provide the identity of affected individuals if known, description of PHI involved, and all information required by 45 CFR 164.410(c)(2).

---

## Key Contacts For Notification Coordination

| Role                      | Contact                                                             | Notes                                                         |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| Security Officer          | Angel (`@angel`)                                                    | Sends HHS notification and coordinates all actions            |
| Legal / Privacy Counsel   | External healthcare privacy counsel engaged by the Security Officer | Reviews notification content and coordinates media notice     |
| HHS Breach Portal         | `https://ocrportal.hhs.gov/ocr/breach/wizard.jsf`                   | Large-breach notifications and annual small-breach reports    |
| hosting-provider support        | hosting-provider dashboard support path                                   | hosting-provider account, Worker, object storage, DNS, and database connection layer incidents |
| Database Provider Support | Current managed PostgreSQL provider support path                    | Database access, restore, branch, and credential incidents    |

---

## Definitions

**Discovery date:** The first day on which a breach is known, or would have been known by exercising reasonable diligence, to any person other than the person committing the breach who is a workforce member or agent of PHIGuard.

**Unsecured PHI:** PHI that has not been rendered unusable, unreadable, or indecipherable through encryption or destruction meeting the HHS-specified standard.

**Breach:** The acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of the PHI.

---

## Breach Log

Maintain this log for all breaches, regardless of size. Submit annually to HHS for small breaches with fewer than 500 affected individuals. Retain for six years.

| Breach Date | Discovery Date | N Affected | PHI Type | Root Cause | Notifications Sent                        | HHS Report Date | Status        |
| ----------- | -------------- | ---------- | -------- | ---------- | ----------------------------------------- | --------------- | ------------- |
| [DATE]      | [DATE]         | [N]        | [types]  | [cause]    | Individual: [date]; HHS: [date or annual] | [date]          | [OPEN/CLOSED] |

---

## References

- 45 CFR 164.400, Applicability
- 45 CFR 164.402, Definitions
- 45 CFR 164.404, Notification to Individuals
- 45 CFR 164.406, Notification to the Media
- 45 CFR 164.408, Notification to the Secretary
- 45 CFR 164.410, Notification by a Business Associate
- 45 CFR 164.412, Law Enforcement Delay
- HHS Breach Notification Rule Summary: `https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html`
- HHS Breach Portal: `https://ocrportal.hhs.gov/ocr/breach/wizard.jsf`
- PHIGuard Incident Response Runbook: `docs/runbooks/incident-response.md`
- PHIGuard Risk Analysis Register: `docs/hipaa/risk-analysis-register-2026.md`
- PHIGuard Risk Analysis Template: `docs/hipaa/risk-analysis-template.md`
