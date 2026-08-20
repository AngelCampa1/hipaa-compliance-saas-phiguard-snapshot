# Runbook: Secrets and Key Rotation

**Last updated:** 2026-05-20
**Applies to:** PHIGuard production on the selected application runtime, object storage, database connection layer, and the managed PostgreSQL provider
**Related runbooks:** `docs/runbooks/incident-response.md`, `docs/runbooks/database-restore.md`, `docs/runbooks/go-live-step-by-step.md`

---

## Overview

PHIGuard production no longer uses the historical the previous managed-cloud operating model operating model. Current production secrets are stored as application runtime secrets or provider-side credentials. PHI at rest is protected by managed PostgreSQL provider encryption, object storage encryption, application-level token encryption for OAuth credentials, and vendor-managed encryption for Stripe, Resend, Sentry, Google, and Microsoft.

Use this runbook for planned rotation and emergency rotation after suspected compromise. If the rotation is incident-driven, run `docs/runbooks/incident-response.md` in parallel and preserve relevant audit evidence before changing credentials.

## Rotation Inventory

| Credential or key                                                     | Cadence                                                 | Rotation owner     | Where it is updated                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| Managed PostgreSQL credential                                         | 90 days or after any suspected database secret exposure | Engineering lead   | Database provider dashboard plus the database connection layer / Worker secret configuration |
| `BETTER_AUTH_SECRET`                                                  | 180 days or incident-driven                             | Engineering lead   | `wrangler secret put BETTER_AUTH_SECRET --config wrangler.jsonc`                     |
| `AUTH_TOKEN_ENCRYPTION_KEY` and `AUTH_TOKEN_KEY_ID`                   | 180 days or incident-driven                             | Engineering lead   | Worker secrets and application key-id rollout                                        |
| `INTEGRATION_TOKEN_ENCRYPTION_KEY` and `INTEGRATION_TOKEN_KEY_ID`     | 180 days or incident-driven                             | Engineering lead   | Worker secrets and application key-id rollout                                        |
| `DIRECT_UPLOAD_SECRET`                                                | 180 days or incident-driven                             | Engineering lead   | Worker secret                                                                        |
| `ATTACHMENT_SCAN_REQUEST_SECRET` and `ATTACHMENT_SCAN_WEBHOOK_SECRET` | 180 days or incident-driven                             | Engineering lead   | Worker/scanner secret stores                                                         |
| object storage API tokens used by local tooling or CI                             | 180 days or incident-driven                             | Engineering lead   | hosting-provider dashboard/API token console plus CI secret store                          |
| Stripe secret and webhook secrets                                     | 180 days or incident-driven                             | Billing owner      | Stripe dashboard plus Worker secrets                                                 |
| Resend API and webhook secrets                                        | 180 days or incident-driven                             | Engineering lead   | Resend dashboard plus Worker secrets                                                 |
| Google/Microsoft OAuth client secrets                                 | 180 days or incident-driven                             | Integrations owner | Provider console plus Worker secrets                                                 |
| Sentry DSNs/tokens                                                    | 180 days or incident-driven                             | Engineering lead   | Sentry plus Worker/marketing vars                                                    |

## Standard Worker Secret Rotation

1. Create the new credential in the upstream provider.
2. Keep the old credential active during rollout if the provider supports overlapping credentials.
3. From `apps/web`, update the Worker secret:

   ```bash
   wrangler secret put SECRET_NAME --config wrangler.jsonc
   ```

4. Deploy the app Worker:

   ```bash
   pnpm deploy:web
   ```

5. Verify `https://my.phiguard.app/healthz` and the affected product flow.
6. Revoke the old credential in the provider after the new value is confirmed live.
7. Record the rotation in the log at the end of this file.

For marketing Worker secrets or vars, use the `apps/marketing/wrangler.jsonc` config and deploy with `pnpm deploy:marketing`.

## Managed PostgreSQL Credential Rotation

1. In the database provider, create or rotate the production database credential.
2. Update database connection layer or the Worker database secret according to the current connection model documented in `docs/runbooks/go-live-step-by-step.md`.
3. Deploy the app Worker with `pnpm deploy:web`.
4. Run a smoke check:

   ```bash
   pnpm smoke:prod
   ```

5. Confirm no database connection errors appear in Sentry/application logs.
6. Revoke the old database credential once the app is confirmed healthy.

If rotation causes write failures, do not retry schema migrations blindly. Restore the previous credential if available, open an incident, and follow `docs/runbooks/database-restore.md` only if data corruption or data loss is confirmed.

## Application Token Encryption Key Rotation

OAuth tokens and auth tokens use application-level encryption keys with key IDs. Rotate these keys as a two-phase rollout:

1. Add the new key value as the relevant Worker secret.
2. Update the matching key-id secret to the new key ID.
3. Deploy with `pnpm deploy:web`.
4. Confirm new OAuth connections and auth-token operations succeed.
5. Keep the previous key available until all existing encrypted records have been migrated or expired.
6. After migration/expiry is verified, remove the retired key from the Worker secret set.

Do not delete the old key while existing records can still require it for decryption.

## object storage Token Rotation

object storage bucket bindings used by the Worker do not require application-held access keys. Rotate only the API tokens used by local tooling, CI, or verification scripts.

1. Create a new hosting provider API token scoped only to the required object storage bucket actions.
2. Update the CI/local secret store entries such as `OBJECT_STORAGE_ACCESS_KEY_ID`, `OBJECT_STORAGE_SECRET_ACCESS_KEY`, and `OBJECT_STORAGE_ENDPOINT` if that tool uses object-storage credentials.
3. Run the relevant verifier, for example:

   ```bash
   pnpm --filter @phiguard/web verify:lead-magnets
   ```

4. Revoke the previous token in hosting provider.
5. Confirm Worker uploads/downloads still use the Worker-owned object storage binding paths.

## Provider-Specific Rotation Notes

### Stripe

1. Create a new live secret key in Stripe.
2. Update `STRIPE_SECRET_KEY` with `wrangler secret put`.
3. Rotate webhook signing secrets and update `STRIPE_WEBHOOK_SECRET`.
4. Deploy with `pnpm deploy:web`.
5. Send a Stripe webhook test and confirm it is accepted.
6. Revoke the old key and webhook secret.

### Google and Microsoft Calendar OAuth

1. Create a new OAuth client secret in the provider console.
2. Update the matching Worker secret (`GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_CLIENT_SECRET`, or `MICROSOFT_OAUTH_CLIENT_SECRET` depending on the active integration config).
3. Deploy with `pnpm deploy:web`.
4. Confirm a new OAuth connection can be created and disconnected.
5. Revoke the old client secret in the provider console.

## Incident-Driven Rotation Checklist

- [ ] Incident record opened and evidence preservation started.
- [ ] Affected credential identified with blast radius.
- [ ] New credential created with least privilege.
- [ ] Worker secret or provider config updated.
- [ ] `pnpm deploy:web` or `pnpm deploy:marketing` completed.
- [ ] Health check and affected workflow verified.
- [ ] Old credential revoked.
- [ ] Provider audit logs reviewed for unauthorized use.
- [ ] Rotation date, operator, and evidence location recorded below.

## Rotation Log

Update this table each time a rotation is completed.

| Credential                     | Last rotated                   | Rotated by       | Next due                     | Evidence location         |
| ------------------------------ | ------------------------------ | ---------------- | ---------------------------- | ------------------------- |
| Managed PostgreSQL credential  | Pending live rotation evidence | Engineering lead | 90 days after live rotation  | Incident/change record    |
| Worker auth/encryption secrets | Pending live rotation evidence | Engineering lead | 180 days after live rotation | Incident/change record    |
| object storage tooling tokens              | Pending live rotation evidence | Engineering lead | 180 days after live rotation | hosting provider audit evidence |
| Stripe secrets                 | Pending live rotation evidence | Billing owner    | 180 days after live rotation | Stripe audit evidence     |
| Resend secrets                 | Pending live rotation evidence | Engineering lead | 180 days after live rotation | Resend audit evidence     |

## References

- application runtime secret management: `docs/runbooks/go-live-step-by-step.md`
- Current incident response boundary: `docs/runbooks/incident-response.md`
- Database recovery: `docs/runbooks/database-restore.md`
- HIPAA encryption references: 45 CFR 164.312(a)(2)(iv) and 45 CFR 164.312(e)(2)(ii)
