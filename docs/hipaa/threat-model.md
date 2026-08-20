# PHIGuard Threat Model

**Classification:** Internal - Security Sensitive
**Last reviewed:** 2026-05-20
**Next review:** 2027-05-20 (or after any material architecture change)
**Review owner:** Security Officer - Angel (`@angel`)

---

## 1. Scope

This threat model covers PHIGuard's production attack surface as of Phase 2. It is scoped to the paths where PHI is created, stored, transmitted, or accessed.

**In scope:**

- Authentication and session management (`/login`, `/signup`, `/api/auth/*`)
- PHI read/write paths (`/app/tasks`, `/app/compliance/*`, all `createServerFn` RPCs that touch PHI tables)
- Audit log system (`packages/audit`, `audit_events` table, object storage-backed evidence export)
- File attachment upload and download (object storage-backed signed URLs via `apps/web/src/lib/s3.ts`)
- Administrative actions (role changes, org management)

**Out of scope:**

- `apps/marketing` - no PHI; PostHog analytics are scoped to this app only
- hosting provider, managed PostgreSQL, and other vendor infrastructure internals covered by vendor BAA/SOC evidence tracked in `docs/hipaa/vendors.md`

---

## 2. Asset Inventory

The following assets contain or provide access to PHI. Schema file references follow the `.phi.ts` naming convention (ADR 0002).

| Asset                    | Type           | PHI exposure                                                          | Schema / code reference                                                  |
| ------------------------ | -------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `users` table            | Database       | name, email                                                           | `packages/db/src/schema/users.phi.ts`                                    |
| `tasks` table            | Database       | title, description, assignee                                          | `packages/db/src/schema/tasks.phi.ts`                                    |
| `task_comments` table    | Database       | comment body                                                          | `packages/db/src/schema/task-comments.phi.ts`                            |
| `task_attachments` table | Database       | filename, object storage object key                                               | `packages/db/src/schema/task-attachments.phi.ts`                         |
| `checklist_items` table  | Database       | item text, notes                                                      | `packages/compliance/src/schema/checklist-items.phi.ts`                  |
| `incidents` table        | Database       | incident description                                                  | `packages/compliance/src/schema/incidents.phi.ts`                        |
| `audit_events` table     | Database       | before/after JSON may contain PHI fields                              | `packages/audit/src/schema/audit-events.phi.ts`                          |
| object storage attachment bucket     | Object storage | uploaded files may contain PHI                                        | `apps/web/src/lib/s3.ts`                                                 |
| Session tokens           | In transit     | session identity, not PHI, but gateway to PHI                         | `packages/auth`                                                          |
| Application error events | Telemetry      | stripped by `beforeSend` / `beforeSendTransaction`; no PHI in transit | `apps/web/src/lib/sentry.client.ts`, `apps/web/src/lib/sentry.ts` |

---

## 3. STRIDE Threat Categories

| Category               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| Spoofing               | Attacker impersonates a legitimate user or service |
| Tampering              | Attacker modifies data at rest or in transit       |
| Repudiation            | Actor denies performing an action; no audit trail  |
| Information Disclosure | PHI exposed to an unauthorized party               |
| Denial of Service      | System or service made unavailable                 |
| Elevation of Privilege | Attacker gains higher access than authorized       |

---

## 4. Per-Asset Threat Table

### 4.1 Authentication System

| Threat                                         | STRIDE | Likelihood | Impact   | Mitigation in place                                                                                                                                                                                                                                                                                                                                                                                                                           | Residual risk                                                                            |
| ---------------------------------------------- | ------ | ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Brute-force or credential stuffing on `/login` | S      | Medium     | High     | App-layer rate limit: 10 req/min/IP (`apps/web/src/middleware/rate-limit.ts`); repeated email sign-in failures trigger account-level lockout using hashed identifier records in `rate_limit_buckets` (`apps/web/src/server/auth-lockout.ts`); failed sign-in rejections emit a PHI-safe `"Failed login"` application log event via `apps/web/src/server/auth-log.ts`; production monitoring must alert on failed-login spikes before live PHI | No CAPTCHA or MFA in Phase 2                                                             |
| Session token theft (XSS)                      | S, I   | Low        | Critical | CSP blocks inline scripts and third-party JS (`apps/web/src/middleware/security-headers.ts`); `HttpOnly` session cookies via better-auth                                                                                                                                                                                                                                                                                                      | Residual XSS risk from future developer error; mitigated by CSP                          |
| Session fixation / hijacking                   | S      | Low        | High     | HMAC-signed session tokens via better-auth; tokens not stored in plaintext                                                                                                                                                                                                                                                                                                                                                                    | No MFA in Phase 2                                                                        |
| Replay of stolen session                       | S      | Low        | High     | Session expiry enforced server-side with a 15-minute idle window in better-auth (`packages/auth/src/auth.ts`)                                                                                                                                                                                                                                                                                                                                 | No MFA in Phase 2; production smoke tests should verify idle timeout behavior end to end |
| Forged auth requests (CSRF)                    | T      | Low        | Medium   | `SameSite` cookie attribute via better-auth; `form-action 'self'` in CSP                                                                                                                                                                                                                                                                                                                                                                      | Should be verified in penetration test                                                   |

### 4.2 PHI Endpoints (Tasks, Compliance, Audit Viewer)

| Threat                                       | STRIDE | Likelihood | Impact   | Mitigation in place                                                                                                                                         | Residual risk                                                                                |
| -------------------------------------------- | ------ | ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Unauthorized PHI access (missing auth check) | I      | Low        | Critical | All `/app/*` routes require session via `beforeLoad` guard (`apps/web/src/routes/app.tsx`); server functions validate session server-side (`packages/auth`) | Manual review needed at each new server function; no automated coverage check                |
| Cross-org data leakage                       | I      | Low        | Critical | Org-scoped queries enforced in all server functions; `orgId` from session, never from client input                                                          | Requires test coverage; see TDD rules in `AGENTS.md`                                         |
| PHI leakage via error events (Sentry)        | I      | Low        | High     | `beforeSend` strips PHI from all Sentry events using `redact()` from `@phiguard/audit`; `sendDefaultPii: false`; no session replay                          | Stack traces could theoretically include PHI if a developer passes PHI into an Error message |
| PHI in application logs                      | I      | Low        | High     | `no-console` ESLint rule (`packages/config/eslint.js`); structured logger with `redact()` applied to every call (`packages/audit/src/logger.ts`)            | Residual risk if developer uses a non-PHI-aware logger or a new package adds console output  |
| Injection attacks (SQL, path traversal)      | T, I   | Low        | High     | Drizzle ORM parameterized queries; Zod input validation at server function boundaries                                                                       | No automated injection scanning in CI yet                                                    |
| Insecure direct object reference             | I      | Low        | High     | IDs are UUIDs; server enforces org membership before returning records                                                                                      | Requires pen test coverage                                                                   |

### 4.3 Audit Log

| Threat                              | STRIDE | Likelihood | Impact   | Mitigation in place                                                                                                                         | Residual risk                                                                                           |
| ----------------------------------- | ------ | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Audit log deletion or modification  | T, R   | Low        | Critical | Postgres trigger enforces append-only constraint on `audit_events`; agent code never issues UPDATE/DELETE                                   | Provider-level database admin access would bypass the trigger and must be tightly controlled            |
| Audit log exfiltration              | I      | Low        | High     | Audit viewer scoped to authenticated Security Officer role; evidence exports are stored in private object storage buckets behind Worker-mediated access | object storage object immutability and read access controls must be verified before live PHI processing             |
| Log gaps (missing PHI write events) | R      | Medium     | High     | `packages/audit/src/audit-coverage.test.ts` checks that PHI-touching operations emit audit events                                           | Coverage test is only as good as the PHI table list; new tables must be added to the test               |
| Tampering with evidence export      | T      | Low        | High     | object storage evidence exports are not publicly accessible; export access is limited to authorized application and legal/security roles                | object storage object immutability settings and provider access reviews must be verified before live PHI processing |

### 4.4 File Attachments (object storage-Backed Signed URLs)

| Threat                   | STRIDE | Likelihood | Impact   | Mitigation in place                                                                                                                                                                                                                                    | Residual risk                                                                                                                    |
| ------------------------ | ------ | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Signed URL leakage       | I      | Medium     | High     | URLs are short-lived (TTL configured in `apps/web/src/lib/s3.ts`); org membership checked before generating URL                                                                                                                                        | URLs can be forwarded by the recipient; no revocation mechanism                                                                  |
| Unauthorized file upload | T, I   | Low        | High     | Upload URLs scoped to authenticated user and org; object storage bucket has no public access; upload content types are allowlisted in `apps/web/src/lib/s3.ts`, completion dispatches a signed malware scan request, and downloads require a `clean` scan callback | Scanner outage blocks task attachment completion; allowed document/image types still require endpoint protections after download |
| Direct object storage bucket access  | I      | Low        | Critical | object storage bucket has no public access; access is mediated by Worker bindings and short-lived signed URLs                                                                                                                                                      | Misconfigured bucket or Worker binding policy would expose attachments                                                           |

### 4.5 Signed Webhooks And Callbacks

| Threat                                       | STRIDE | Likelihood | Impact | Mitigation in place                                                                                                                                                                     | Residual risk                                                                                                                     |
| -------------------------------------------- | ------ | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Stripe webhook endpoint spoofing             | S      | Low        | High   | Stripe webhook signatures are verified in `packages/billing/src/webhook.ts`                                                                                                             | Any new webhook provider must match this verification standard before enablement                                                  |
| Attachment scan callback spoofing            | S, T   | Low        | High   | Scan callbacks require `x-phiguard-scan-signature`; scan requests use `x-phiguard-scan-request-signature`; callbacks are scoped to organization and object key                          | Scanner secret rotation and operational hosting boundary must be documented before live PHI processing                            |
| PHI in webhook payload                       | I      | Low        | Medium | Current Stripe webhook metadata is limited to org-level identifiers and plan metadata                                                                                                   | Future webhook payload schemas must be reviewed before go-live; any third-party webhook receiver handling PHI requires BAA review |

---

## 5. Mitigations In Place

The following controls are implemented as of Phase 2. References are to specific files.

| Control                           | Implementation                                                                                                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate limiting (app layer)         | `apps/web/src/middleware/rate-limit.ts` - 10 req/min/IP on auth routes, 100 req/min/IP on API routes                                                                                                      |
| Edge abuse controls               | the application edge controls and app middleware must enforce abuse protection for authenticated and API routes before live PHI processing                                                                     |
| Security headers                  | `apps/web/src/middleware/security-headers.ts` - CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy                                                                   |
| PHI redaction in logs             | `packages/audit/src/logger.ts` - `redact()` applied to every structured log call                                                                                                                          |
| PHI redaction in telemetry        | `apps/web/src/lib/sentry.client.ts` and `apps/web/src/lib/sentry.ts` - `beforeSend` strips PHI; `beforeSendTransaction` sanitizes performance payloads; `sendDefaultPii: false`; no session replay |
| Append-only audit log             | `packages/audit/src/schema/audit-events.phi.ts` + Postgres trigger                                                                                                                                        |
| Audit/evidence export             | Private object storage-backed export path with Worker-mediated access; object immutability settings must be verified before live PHI processing                                                                       |
| RBAC                              | `packages/auth` - owner / admin / staff roles; org-scoped queries                                                                                                                                         |
| Encryption at rest                | Managed PostgreSQL provider encryption plus object storage encryption                                                                                                                                      |
| Encryption in transit             | TLS 1.2+ at the application edge; HSTS header applied by security headers middleware                                                                                                                           |
| Monitoring and alerts             | Sentry, application logs, provider logs, and hosting provider/database-provider alerts for errors, latency, failed logins, storage, and availability                                                            |
| Dependency vulnerability scanning | Manual release gate currently runs `pnpm audit`; `repository automation` and OSV scanning are not yet present, and current audit findings must be resolved before this can be promoted to CI evidence. |

---

## 6. Residual Risks

The following risks are not fully mitigated as of Phase 2. They correspond to PLANNED rows in `docs/hipaa/safeguards-map.md`.

| Risk                                                                                        | Tracking reference                                      | Target                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| No MFA for end users                                                                        | safeguards-map.md - Person or Entity Authentication     | Phase 3                                  |
| Future webhook integrations ship without parity on signature verification or payload review | This document - Section 4.5                             | Before enabling any new webhook provider |
| Attachment scanner hosting and secret rotation need operational evidence                    | `docs/hipaa/vendors.md` and this document - Section 4.5 | Before live PHI processing               |
| Backup Security Officer not yet assigned for multi-person operations                        | officers.md - Backup escalation                         | Before adding additional PHI operators   |
| No annual penetration test yet scheduled                                                    | safeguards-map.md - Evaluation                          | 90 days post-launch                      |

---

## 7. Review Cadence

This document must be reviewed:

1. Annually, at the same time as the HIPAA security risk analysis (`docs/hipaa/risk-analysis-register-2026.md` or the successor dated register).
2. After any material architecture change, including a new data store, PHI-processing third-party service, authentication method, or data export path.
3. After any security incident, updating the relevant threat table rows with lessons learned.

Review sign-off must be recorded in `docs/hipaa/access-review.md` or a dedicated threat model review log.
