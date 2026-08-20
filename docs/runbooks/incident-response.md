# Incident Response Runbook

Last updated: 2026-05-20

## Purpose

This runbook guides the response to a suspected HIPAA security incident or data breach at PHIGuard. It is intended for the Security Officer, on-call engineer, founders, and legal/privacy counsel.

HIPAA defines a breach as the acquisition, access, use, or disclosure of PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of the PHI (45 CFR 164.402). Not every security incident is a HIPAA breach; the classification steps below determine whether breach notification obligations are triggered.

PHIGuard's current production boundary is the selected application runtime, object storage, the database connection layer, the current managed PostgreSQL provider, and the vendors listed in `docs/hipaa/vendors.md`.

---

## Incident Classification

| Level   | Definition                                                                | Examples                                                                                                    |
| ------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Level 1 | Suspicious activity detected; no confirmed PHI exposure                   | Failed-login spike, unusual Sentry/provider alert, dependency vulnerability disclosed                       |
| Level 2 | Confirmed unauthorized access to PHIGuard systems; PHI exposure unclear   | Compromised employee credentials, unauthorized API access, stolen deploy token, suspicious object storage object access |
| Level 3 | Confirmed PHI breach; HIPAA breach notification obligations are triggered | Unauthorized actor accessed patient-linked records, PHI exfiltrated, PHI disclosed to wrong party           |

When in doubt, classify higher and step down after investigation. Do not delay response while determining classification.

---

## Response Steps

### Immediate: 0-1 Hour

1. Confirm the incident is real.
   - Check Sentry, application logs, hosting-provider account audit logs, database-provider audit logs, object storage access evidence, and recent `audit_events`.
   - Confirm with the reporter and record the first discovery timestamp.

2. Determine the level using the table above.

3. Notify the Security Officer, at least one founder, and the on-call engineer immediately.

4. For Level 2+, revoke affected access immediately after preserving minimum viable evidence.
   - User account compromise: terminate sessions for the affected user through the admin surface or an approved database-provider access path.
   - hosting-provider account or token compromise: revoke the user session or API token in hosting provider; rotate any affected deployment tooling/deploy credentials.
   - object storage bucket token or binding compromise: revoke affected tokens, narrow bucket permissions, and block further writes through application feature flags or Worker configuration where needed.
   - Database credential compromise: rotate the managed PostgreSQL credential, update database connection layer/Worker secrets, and redeploy the affected Worker.
   - Vendor credential compromise: revoke or rotate the vendor token in the vendor console and document vendor support contact activity.

5. For Level 3, start the breach notification clock.
   - Record the exact date and time of discovery. The 60-day HIPAA notification window under 45 CFR 164.404 begins at this moment.
   - Create a dated incident record capturing discovery timestamp, reporter, classification, affected systems, and the privileged/legal status of the record.

6. Preserve evidence before destructive remediation.
   - Export relevant `audit_events` rows for the incident window.
   - Export Sentry issue/event details and application log excerpts with PHI redaction verified.
   - Export hosting-provider account audit events, Worker deployment history, object storage access evidence, and database connection layer configuration history relevant to the incident.
   - Export managed PostgreSQL provider audit logs, backup/restore history, branch history, and connection/user history relevant to the incident.
   - Store incident evidence in a private object storage bucket path such as `incidents/YYYY-MM-DD-incident-id/`.
   - Do not delete, overwrite, or rotate evidence-bearing objects until the Security Officer approves preservation status.

---

### Containment: 1-4 Hours

1. Isolate affected application surfaces.
   - Disable or roll back the affected Worker route or deployment if the incident is application-code related.
   - Disable affected uploads, downloads, webhook callbacks, or scanner dispatch if the incident involves file handling.
   - Use configuration or feature flags to stop high-risk behavior while preserving logs and audit evidence.

2. Isolate affected storage or database paths.
   - object storage bucket incident: block public access, revoke relevant tokens, pause writes if needed, and preserve the affected objects.
   - managed PostgreSQL incident: revoke affected database users or connection strings, rotate credentials, review backups/branches, and restore from a known-clean backup only after evidence is preserved.
   - database connection layer incident: rotate the underlying database credential and update the database connection layer configuration before redeploy.

3. Isolate affected third-party integrations.
   - Stripe, Resend, Sentry, PostHog, Google, Microsoft, or scanner compromise: revoke the affected token or webhook secret, rotate signing secrets, and review vendor-side audit logs.
   - If a vendor could access PHI, review BAA status in `docs/hipaa/vendors.md` and involve Legal / Privacy Counsel immediately.

4. Determine scope.
   - Cross-reference `audit_events`, application logs, Sentry events, provider audit logs, object storage evidence, and database-provider audit logs.
   - Identify affected organizations, users, object keys, records, and time windows.
   - Preserve the first and last timestamps of unauthorized activity.

---

### Notification: Level 3 Only, Within 60 Days Of Discovery

Use `docs/runbooks/breach-decision-tree.md` to determine exactly which notification obligations apply: individual notice, HHS portal filing, media notice, and business-associate chain notification.

HIPAA breach notification requirements under 45 CFR 164.404-164.412:

**Notify affected individuals**

- Written notice by first-class mail, or email if the individual has agreed to electronic notice.
- Required content: description of the breach, types of PHI involved, steps the individual should take, steps PHIGuard is taking, and contact information for questions.
- Deadline: without unreasonable delay, and no later than 60 days after discovery.
- If contact information is insufficient for 10 or more individuals, post a conspicuous notice on PHIGuard's website for 90 days.

**Notify the HHS Secretary**

- More than 500 individuals affected: notify HHS within 60 days of discovery through the OCR filing portal.
- 500 or fewer individuals affected: log the breach and submit the annual report to HHS no later than 60 days after the end of the calendar year in which the breach occurred.

**Notify prominent media outlets when applicable**

- If more than 500 individuals in a single state or jurisdiction are affected, notify prominent media outlets serving that area without unreasonable delay and no later than 60 days after discovery.

**Notification coordination contacts**

- Security Officer: Angel (`@angel`)
- Legal / Privacy Counsel: external healthcare privacy counsel engaged by the Security Officer before Level 3 external notification
- hosting-provider account support: use the hosting-provider dashboard/support path for infrastructure or account incidents.
- Database provider support: use the current managed PostgreSQL provider support path for database incidents.
- Vendor support: use vendor-specific support contacts listed or linked from `docs/hipaa/vendors.md`.

---

### Post-Incident

1. Write a post-mortem.
   - Include timeline, root cause, contributing factors, scope of PHI exposure, containment actions, evidence preserved, and corrective actions.
   - Do not publish or share externally without legal review.

2. Update the risk register.
   - Add or update the risk entry corresponding to the exploited vulnerability.
   - Assign an owner and remediation deadline for each corrective action.

3. Update compliance artifacts.
   - Update `docs/hipaa/safeguards-map.md`, `docs/hipaa/threat-model.md`, `docs/hipaa/risk-analysis-register-2026.md`, or `docs/hipaa/vendors.md` if the incident exposed a control gap.

4. Schedule follow-up review.
   - Within 30 days: verify corrective actions are complete or have owners and dates.
   - Within 90 days: schedule a focused security review of the affected system area.

---

## Key Contacts

| Role                      | Contact                                                             | Notes                                                      |
| ------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| Security Officer          | Angel (`@angel`)                                                    | Primary incident coordinator                               |
| On-call Engineer          | Angel (`@angel`) until a separate rotation is created               | Technical response                                         |
| Legal / Privacy Counsel   | External healthcare privacy counsel engaged by the Security Officer | Required for Level 3 notification                          |
| hosting-provider support        | hosting-provider dashboard support path                                   | Account, Worker, DNS, database connection layer, and object storage incidents         |
| Database Provider Support | Current managed PostgreSQL provider support path                    | Database access, restore, branch, and credential incidents |
| HHS Breach Portal         | `https://ocrportal.hhs.gov/ocr/breach/wizard.jsf`                   | Level 3 notifications                                      |

---

## Reference

- HIPAA Breach Notification Rule: 45 CFR 164.400-414
- HHS OCR Breach Filing Portal: `https://ocrportal.hhs.gov/ocr/breach/wizard.jsf`
- PHIGuard Breach Notification Decision Tree: `docs/runbooks/breach-decision-tree.md`
- PHIGuard HIPAA Safeguards Map: `docs/hipaa/safeguards-map.md`
- PHIGuard Vendor BAA Inventory: `docs/hipaa/vendors.md`
- PHIGuard Risk Analysis Register: `docs/hipaa/risk-analysis-register-2026.md`
- PHIGuard Risk Analysis Template: `docs/hipaa/risk-analysis-template.md`
- PHIGuard Access Review Process: `docs/hipaa/access-review.md`
