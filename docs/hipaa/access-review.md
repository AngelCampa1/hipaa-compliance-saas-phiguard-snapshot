# Quarterly Access Review Process

**Regulatory basis:** 45 CFR 164.308(a)(4)(ii)(C), Access Establishment and Modification
**Reviewer:** Security Officer - Angel (`@angel`)
**Frequency:** Quarterly, every 90 days; also triggered by workforce termination, role transfer, or a Level 2+ security incident
**Evidence retention:** Six years per 45 CFR 164.530(j)(2)

Last updated: 2026-05-20

---

## Purpose

This procedure verifies that access to PHIGuard ePHI is limited to workforce members and service accounts that currently need it. The review covers application roles, production infrastructure administration, object storage access, managed database access, deploy permissions, and break-glass paths.

The current production boundary is the selected application runtime, object storage, the database connection layer, and the current managed PostgreSQL provider documented in `docs/hipaa/vendors.md`.

---

## Review Scope

### Application Access

Application access means all rows in `memberships` (`packages/db/src/schema/memberships.ts`). The review must confirm each user still belongs to the organization and has the least-privilege role needed for their current job function.

All owner, admin, and staff users can reach organization PHI through the authenticated application, so every active membership is in scope.

### hosting-provider account Access

hosting-provider account access includes:

- Users in the PHIGuard hosting-provider account.
- API tokens that can deploy Workers, manage custom domains, read Worker logs, access object storage, manage database connection layer, or manage DNS.
- wrangler deploy credentials used by CI or local deploy scripts.
- Break-glass accounts or tokens with elevated hosting provider permissions.

### object storage Evidence Bucket Access

object storage evidence bucket access includes:

- `ATTACHMENTS_BUCKET`
- `AUDIT_EXPORTS_BUCKET`
- `LEAD_MAGNETS_BUCKET`
- Any bucket or API token that can read, write, list, delete, or change lifecycle/retention settings for PHI-bearing or compliance-evidence objects.

### Database-Provider Access

database-provider access includes:

- Users in the current managed PostgreSQL provider account.
- Console roles that can view, export, restore, branch, reset, or delete production data.
- Connection strings, database roles, database connection layer configuration, migration credentials, and break-glass database access.

### Source, Deploy, And Vendor Access

Also review:

- Repository administrators, deploy keys, repository secrets, and CI variables.
- Sentry organization users and tokens.
- Resend, Stripe, PostHog, and scanner accounts or tokens listed in `docs/hipaa/vendors.md`.
- Any service account that can create, receive, maintain, or transmit PHI.

---

## Procedure

### Step 1 - Export Application Audit Evidence

1. Sign in to `https://my.phiguard.app` with an owner or Security Officer account.
2. Navigate to the audit log surface at `/app/audit`.
3. Export the last 90 days of audit events as `audit-log-YYYY-QN.csv`.
4. Store the export in the private object storage evidence bucket under `access-reviews/YYYY-QN/audit-log-YYYY-QN.csv`.

If the in-app export is unavailable, use the approved production database access path and record the reason in the attestation.

### Step 2 - Review Active Application Memberships

Run the membership review query through the approved database-provider console or approved read-only production database role:

```sql
SELECT
  m.id,
  m.org_id,
  o.name AS org_name,
  m.user_id,
  u.name AS user_name,
  u.email,
  m.role,
  m.created_at,
  m.updated_at,
  MAX(ae.created_at) AS last_audit_event
FROM memberships m
JOIN organizations o ON o.id = m.org_id
JOIN users u ON u.id = m.user_id
LEFT JOIN audit_events ae ON ae.actor_id = m.user_id AND ae.org_id = m.org_id
  AND ae.created_at >= NOW() - INTERVAL '90 days'
GROUP BY m.id, o.name, u.name, u.email
ORDER BY org_name, role, last_audit_event NULLS FIRST;
```

For each membership row, verify:

| Check                                                      | Action If Failed                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| User still belongs to the organization                     | Remove the membership immediately through the admin UI or an approved audited database change. |
| Role matches current job function                          | Downgrade through the admin UI and document the change in the attestation.                     |
| User has activity or approved need within the last 90 days | Flag for review; remove or suspend if no approved business need exists.                        |
| Every organization has at least one active owner           | Escalate to Founders and assign a new owner before removing the inactive one.                  |

### Step 3 - Review hosting-provider account Access

Open the hosting-provider dashboard for the PHIGuard account and review:

- Account members and roles.
- API tokens and token scopes.
- Worker deploy permissions for `phiguard-app` and `phiguard-marketing`.
- object storage permissions and bucket access.
- database connection layer configuration access.
- DNS and custom-domain permissions.
- Audit logs for privileged changes during the review period.

For each hosting provider user or token, verify:

| Check                                                  | Action If Failed                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| User or token has a current owner and business purpose | Remove it or assign an accountable owner immediately.            |
| Permissions are least privilege                        | Reduce scope and record the change.                              |
| MFA is enabled for human administrators                | Block privileged access until MFA is configured.                 |
| Token is not stale or unused                           | Rotate or revoke stale tokens.                                   |
| Break-glass access is documented and monitored         | Disable undocumented break-glass access and investigate any use. |

### Step 4 - Review object storage Evidence Bucket Access

In the hosting-provider dashboard, review the object storage buckets and related API tokens:

- Confirm no bucket is public unless explicitly intended for non-PHI assets.
- Confirm `ATTACHMENTS_BUCKET` and `AUDIT_EXPORTS_BUCKET` are private.
- Confirm write/delete permissions are limited to the Worker binding or approved operational tokens.
- Confirm any object-retention or recovery controls used for audit/evidence exports are configured and documented.
- Confirm lifecycle settings cannot remove records before the required evidence-retention period.

Record the result as `object storage-access-review-YYYY-QN.md` or an equivalent screenshot/evidence bundle in the object storage evidence path.

### Step 5 - Review Database-Provider Access

Open the managed PostgreSQL provider console and review:

- Account users and roles.
- Production project/database access.
- Database branches or backups that may contain PHI.
- Connection strings and shared credentials.
- database connection layer connection configuration.
- Restore, export, branch, and deletion permissions.
- Audit logs for privileged database actions during the review period.

For each database user, role, or token, verify:

| Check                                                                    | Action If Failed                                           |
| ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Access belongs to an active workforce member or approved service account | Remove or disable immediately.                             |
| Access is read-only unless write/admin rights are required               | Reduce privileges and record the reason for any exception. |
| Shared credentials have an owner and rotation date                       | Rotate if owner or date is missing.                        |
| Backups and branches are covered by the same PHI access controls         | Lock down or delete unauthorized copies.                   |
| Provider BAA/SOC evidence is current                                     | Escalate to Legal or Founders before live PHI processing.  |

### Step 6 - Review Source, Deploy, And Vendor Access

Review repository administrators, CI variables, deploy credentials, and vendor consoles listed in `docs/hipaa/vendors.md`.

At minimum, verify:

- Repository admins and deploy operators are active team members.
- CI/deploy secrets have owners and rotation dates.
- Sentry access is limited to people with a current support/security need.
- Resend, Stripe, PostHog, and scanner accounts match the vendor boundary documented in `docs/hipaa/vendors.md`.
- No authenticated app route includes unauthorized third-party scripts.

### Step 7 - Complete The Attestation

After completing Steps 1-6, the Security Officer must complete and sign this attestation:

```text
Quarter:             [Q1 / Q2 / Q3 / Q4] [YYYY]
Review date:         [DATE]
Reviewer:            Security Officer - Angel (`@angel`)
Audit log period:    [Start date] through [End date]

Application memberships reviewed:      [ ] Yes
Stale memberships removed/suspended:   [ ] Yes  [ ] None found
hosting-provider account access reviewed:    [ ] Yes
hosting provider API tokens reviewed:        [ ] Yes
object storage evidence bucket access reviewed:    [ ] Yes
Database-provider access reviewed:     [ ] Yes
Repository/deploy access reviewed:     [ ] Yes
Vendor admin access reviewed:          [ ] Yes
Break-glass paths reviewed:            [ ] Yes

Findings:
[Describe findings, actions taken, exceptions granted, and due dates]

I attest that the access review described above was completed in accordance with
PHIGuard's quarterly access review process (docs/hipaa/access-review.md) and
45 CFR 164.308(a)(4)(ii)(C).

Signature: _________________________
Date:      _________________________
```

### Step 8 - Store Evidence Artifacts

Store review evidence in the private object storage evidence bucket under `access-reviews/YYYY-QN/`:

| Artifact                                 | File Name                                                  |
| ---------------------------------------- | ---------------------------------------------------------- |
| Audit log CSV export                     | `audit-log-YYYY-QN.csv`                                    |
| Membership query results                 | `memberships-YYYY-QN.csv`                                  |
| hosting provider access review evidence        | `hosting provider-access-YYYY-QN.md` or screenshot bundle        |
| object storage access review evidence                | `object storage-access-review-YYYY-QN.md` or screenshot bundle         |
| Database-provider access review evidence | `database-provider-access-YYYY-QN.md` or screenshot bundle |
| Repository and deploy access evidence    | `repo-deploy-access-YYYY-QN.md`                            |
| Vendor admin access evidence             | `vendor-admin-access-YYYY-QN.md`                           |
| Signed attestation PDF                   | `attestation-YYYY-QN.pdf`                                  |

The evidence bucket must remain private and access-controlled. Evidence retention must satisfy the six-year HIPAA documentation retention requirement.

---

## Roles And Responsibilities

| Role                                | Responsibility                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| Security Officer - Angel (`@angel`) | Owns the review, signs the attestation, and escalates findings.                                   |
| Engineering Lead                    | Provides approved database/provider access, resolves technical findings, and rotates credentials. |
| Founders                            | Resolve escalated business-access findings and approve exceptional access.                        |
| Legal / Privacy Counsel             | Reviews vendor BAA or PHI-boundary findings.                                                      |

---

## Out-Of-Cycle Triggered Reviews

The following events require an immediate out-of-cycle review:

- Workforce termination or resignation: remove or suspend application, hosting provider, repository, deploy, database-provider, and vendor access within 24 hours.
- Role transfer: within 5 business days, verify application role and infrastructure permissions match the new job function.
- Suspected security incident: per `docs/runbooks/incident-response.md`, Level 2 or Level 3 incidents trigger a review of all access active during the incident window.
- New PHI-processing vendor or scanner deployment: review vendor access, BAA status, and data boundary before live PHI processing.

---

## References

- 45 CFR 164.308(a)(3), Workforce Security
- 45 CFR 164.308(a)(4)(ii)(C), Access Establishment and Modification
- PHIGuard `memberships` table schema: `packages/db/src/schema/memberships.ts`
- PHIGuard Audit Log export: `/app/audit`
- PHIGuard Vendor BAA Inventory: `docs/hipaa/vendors.md`
- PHIGuard Incident Response Runbook: `docs/runbooks/incident-response.md`
- PHIGuard HIPAA Safeguards Map: `docs/hipaa/safeguards-map.md`
