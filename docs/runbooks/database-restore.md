# Runbook: Managed PostgreSQL Restore

**Last updated:** 2026-05-20
**Applies to:** PHIGuard production managed PostgreSQL reached through the database connection layer / Worker database configuration
**Severity:** Critical. Follow `docs/runbooks/incident-response.md` in parallel if data loss, unauthorized access, or PHI exposure may have occurred.

---

## Overview

PHIGuard stores application PHI and audit data in the production managed PostgreSQL database. This runbook replaces the historical database restore procedure. It intentionally avoids legacy legacy cloud provider console, snapshot, container-service, and secret-store steps because production currently runs on the selected application runtime, the database connection layer, object storage, and a managed PostgreSQL provider.

Use this runbook only when the issue requires database rollback or restore. Failed deployments, bad runtime configuration, read-only incidents, or transient provider errors usually require rollback or credential repair rather than a database restore.

## Step 1 - Decide Whether Restore Is Required

Before initiating restore:

1. Open an incident record.
2. Identify the suspected corruption or deletion window.
3. Preserve application audit evidence, Sentry events, Worker deployment history, database-provider logs, and relevant object storage evidence.
4. Confirm whether a forward fix, migration rollback, or feature flag can recover safely without restoring the full database.
5. Get Engineering Lead approval before replacing production database credentials or pointing the Worker at a restored database.

## Step 2 - Select the Restore Point

Use the managed PostgreSQL provider console or CLI to inspect available backups.

Record:

- Restore point timestamp in UTC.
- Backup identifier or provider restore job ID.
- Operator approving the restore.
- Known data-loss window between restore point and incident discovery.
- Whether audit logs after the restore point need to be re-imported or preserved separately.

Choose the latest restore point before the destructive event or corruption window. If the incident involves unauthorized access, consult Legal/Compliance before deleting or overwriting any evidence.

## Step 3 - Restore to a New Database First

Restore to a separate database or branch, not directly over production.

Provider-specific options vary, but the required properties are:

- PostgreSQL version compatible with the current app.
- TLS required for connections.
- Provider-managed encryption at rest enabled.
- Backups enabled with the production retention policy.
- Access limited to the app/runtime and approved operators.

Do not expose the restored database publicly or share credentials in chat, tickets, docs, or shell history.

## Step 4 - Verify the Restored Database

Connect from an approved operator environment using TLS and run read-only checks:

```sql
SELECT COUNT(*) FROM audit_events;
SELECT MAX(created_at) FROM audit_events;
SELECT COUNT(*) FROM organizations;
SELECT COUNT(*) FROM tasks;
```

Also verify:

- Expected schema migration state.
- Recent audit event timestamps align with the selected restore point.
- Critical tenant data is present for affected organizations.
- No provider warning indicates an unencrypted or degraded restore.

If verification fails, stop and choose a different restore point.

## Step 5 - Point the App at the Restored Database

1. Update database connection layer or the Worker database connection secret according to the current production connection model.
2. Apply the selected replacement runtime or operations procedure for the app.\r\n3. Confirm the app health endpoint:

   ```bash
   pnpm smoke:prod
   ```

4. Verify login, dashboard loading, task listing, audit log access, and any affected workflow.
5. Monitor Sentry/application logs for database connection or migration errors.

If the deployment cannot connect, revert the connection string or database connection layer configuration and reopen restore planning.

## Step 6 - Post-Restore Actions

- [ ] Restored database verified before production cutover.
- [ ] Database configuration updated and app runtime refreshed.
- [ ] `pnpm smoke:prod` completed.
- [ ] Affected workflows verified manually.
- [ ] Incident report updated with restore point, data-loss window, and operator approvals.
- [ ] Old compromised/corrupted database access restricted.
- [ ] Database provider backup schedule confirmed.
- [ ] Legal/Compliance reviewed whether patient, regulator, or customer notification is required.

## Contacts

| Role             | Responsibility                                   |
| ---------------- | ------------------------------------------------ |
| On-call engineer | Initial diagnosis and provider restore execution |
| Engineering lead | Restore approval and production cutover approval |
| Legal/Compliance | Breach assessment and notification decisions     |
