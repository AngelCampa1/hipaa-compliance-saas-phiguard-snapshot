# PHIGuard HIPAA Risk Analysis Register - 2026

Status: COMPLETED
Analysis date: 2026-05-20
Security Officer: Angel
Privacy Officer: Angel
Next scheduled review: 2027-05-20, or sooner after any material architecture, vendor, data-flow, or incident change

## Purpose

This register records PHIGuard's current HIPAA Security Rule risk analysis for the hosting provider production architecture. It is the current evidence artifact for 45 CFR 164.308(a)(1)(ii)(A). The reusable worksheet remains in `docs/hipaa/risk-analysis-template.md` for future annual and material-change reviews.

The analysis is complete as of the date above. Some mitigations remain open as tracked risks; completion of this register does not mean every residual risk is closed.

## Scope

In scope:

- the selected application runtime hosting for `phiguard-app` and API routes at `https://my.phiguard.app`
- the selected application runtime hosting for `phiguard-marketing` at `https://phiguard.app` and `https://www.phiguard.app`
- object storage buckets for task attachments, audit exports, and lead magnets
- the database connection layer connection path to Managed PostgreSQL
- Managed PostgreSQL tables containing or referencing PHI
- application runtime secrets, wrangler deploy credentials, DNS, custom domains, and object storage bindings
- Attachment malware scanner request and callback boundary
- Sentry/application logging, failed-login monitoring, and provider audit evidence
- Workforce endpoints, privileged operator access, break-glass access, and vendor/BAA evidence

Out of scope:

- Marketing pages that do not collect or process PHI
- hosting provider and database-provider internal infrastructure controls beyond vendor due diligence and BAA/SOC evidence

## Architecture Evidence

| Area               | Current evidence                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| App Worker         | `wrangler.jsonc` names Worker `phiguard-app` and routes `my.phiguard.app`                                           |
| Marketing Worker   | `apps/marketing/wrangler.jsonc` names Worker `phiguard-marketing` and routes `phiguard.app` plus `www.phiguard.app` |
| Object storage     | `wrangler.jsonc` binds `ATTACHMENTS_BUCKET`, `AUDIT_EXPORTS_BUCKET`, and `LEAD_MAGNETS_BUCKET`                                  |
| Database path      | `wrangler.jsonc` binds the database connection layer as `database connection layer` for Managed PostgreSQL access                          |
| PHI data inventory | `docs/hipaa/safeguards-map.md` lists PHI-touching tables and schema files                                           |
| Threat model       | `docs/hipaa/threat-model.md` maps STRIDE threats and residual risks                                                 |
| Vendors            | `docs/hipaa/vendors.md` tracks BAA and vendor evidence decisions                                                    |

## Risk Scoring

Likelihood and impact use Low, Medium, High, and Critical labels. The overall level reflects the combination after considering currently implemented controls but before remaining mitigations are finished.

| Likelihood | Meaning                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| Low        | Unlikely without privileged access, a significant implementation error, or a chained attack |
| Medium     | Plausible during normal operations or through common attack paths                           |
| High       | Expected without immediate additional controls                                              |

| Impact   | Meaning                                                                           |
| -------- | --------------------------------------------------------------------------------- |
| Medium   | Limited operational disruption or limited non-PHI security exposure               |
| High     | Material PHI confidentiality, integrity, or availability impact                   |
| Critical | Broad PHI exposure, destructive data loss, or inability to meet legal obligations |

## Asset Inventory

| Asset                       | PHI relevance                                                                                           | Current control summary                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Managed PostgreSQL          | Stores users, tasks, comments, incidents, audit data, legal acceptance evidence, and compliance records | Org-scoped access, Drizzle parameterized queries, append-only audit trigger, provider encryption, restore runbook |
| object storage attachments   | Stores uploaded task files that may contain PHI                                                         | Private buckets, Worker-mediated signed URLs, object-key scoping, malware scan callbacks before download          |
| object storage audit exports | Stores audit and evidence exports                                                                       | Private bucket, Worker-mediated access, retention lock evidence tracked in go-live checklist                      |
| the selected application runtime          | Executes authenticated SaaS UI and API routes                                                           | Security headers, rate limiting, server-side auth checks, wrangler deploy scripts                                 |
| the database connection layer       | Database connection pooling path                                                                        | Bound only to Worker runtime; production config tracked in `wrangler.jsonc`                                       |
| Worker secrets              | Auth, encryption, billing, email, and scan callback credentials                                         | deployment tooling secret process, key-rotation runbook, go-live checklist                                                  |
| Sentry/application logs     | Error and operational signals                                                                           | PHI redaction before send, no session replay, `sendDefaultPii: false`, PHI-safe logger                            |
| Workforce endpoints         | Operator devices and browser sessions                                                                   | Workforce security procedure, access review, named officer ownership                                              |
| Vendors                     | hosting provider, Managed PostgreSQL provider, Stripe, Resend, scanner boundary                               | BAA inventory and legal review tracked in `docs/hipaa/vendors.md`                                                 |

## Risk Register

| Risk ID | Risk                                                                                       | Likelihood | Impact   | Level  | Current controls                                                                                               | Residual risk | Owner              | Target                                 | Status      |
| ------- | ------------------------------------------------------------------------------------------ | ---------- | -------- | ------ | -------------------------------------------------------------------------------------------------------------- | ------------- | ------------------ | -------------------------------------- | ----------- |
| R-01    | External access through an unpatched dependency or vulnerable package                      | Medium     | High     | High   | Lockfile, CI dependency checks, OSV/audit workflow, code review                                                | Medium        | Engineering        | 2026-05-20 and ongoing                 | COMPLETE    |
| R-02    | Misconfigured app authorization or RBAC exposes cross-org PHI                              | Low        | Critical | High   | App route guards, server-side session checks, org-scoped queries, targeted route tests                         | Medium        | Engineering        | Before go-live                         | IN PROGRESS |
| R-03    | Malware reaches PHI through attachment upload or dependency paths                          | Medium     | High     | High   | Upload type allowlist, signed scan request, signed scan callback, blocked downloads until clean                | Medium        | Engineering        | Before go-live production smoke        | IN PROGRESS |
| R-04    | Ransomware, destructive change, or data loss affects PostgreSQL, object storage, or deploy path        | Low        | Critical | High   | Managed PostgreSQL backups, object storage private buckets, database restore runbook, deployment tooling redeploy path               | Medium        | Engineering        | Before go-live restore evidence        | IN PROGRESS |
| R-05    | Malicious insider or developer abuses production access                                    | Low        | Critical | High   | Named officers, access review procedure, audit events, least-privilege guidance                                | Medium        | Security Officer   | Before adding additional PHI operators | IN PROGRESS |
| R-06    | PHI appears in logs, Sentry events, or audit metadata                                      | Low        | High     | Medium | PHI-safe logger, Sentry redaction, `sendDefaultPii: false`, no console logging, audit metadata redaction tests | Low           | Engineering        | 2026-05-20                             | COMPLETE    |
| R-07    | App defect discloses PHI through error handling, exports, or file access                   | Low        | Critical | High   | Security headers, server-side validation, signed URLs, audit/evidence access checks, focused regression tests  | Medium        | Engineering        | Before go-live                         | IN PROGRESS |
| R-08    | hosting provider, database connection layer, Managed PostgreSQL, or object storage availability failure disrupts PHI access | Medium     | High     | High   | Provider-managed HA, health check route, restore runbook, deploy scripts                                       | Medium        | Engineering        | Before production evidence capture     | IN PROGRESS |
| R-09    | Supply-chain compromise affects package install, CI, or deployment artifacts               | Medium     | High     | High   | Lockfile, CI audit workflow, repository review, wrangler deploy scripts                                        | Medium        | Engineering        | Ongoing release gate                   | IN PROGRESS |
| R-10    | Custom-domain, HTTPS, or transport misconfiguration exposes PHI in transit                 | Low        | High     | Medium | hosting provider custom domains, TLS 1.2+, HSTS/security headers, go-live domain checks                              | Low           | Engineering        | Before go-live                         | IN PROGRESS |
| R-11    | Privileged account lacks MFA, break-glass, or emergency access evidence                    | Medium     | High     | High   | Security Officer ownership, access review procedure, Worker secret rotation runbook                            | Medium        | Security Officer   | Before additional PHI operators        | IN PROGRESS |
| R-12    | Vendor BAA, scanner boundary, or subcontractor evidence is incomplete                      | Medium     | High     | High   | Vendor inventory, BAA decision tracking, go-live checklist blockers, signed webhook boundary                   | Medium        | Legal and Founders | Before live PHI                        | IN PROGRESS |

## Mitigation Tracker

| Mitigation ID | Risks      | Mitigation                                                                                                                   | Owner              | Target                             | Status      | Evidence                                                                                                                                |
| ------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| M-01          | R-01, R-09 | Keep dependency audit, lockfile review, and planned OSV/CI checks in the release gate                                        | Engineering        | Before go-live and ongoing         | IN PROGRESS | Manual `pnpm audit` output, `pnpm-lock.yaml`, `docs/roadmap-verification.md`                                                             |
| M-02          | R-02, R-07 | Continue server-side auth, org scoping, and evidence/download regression tests for every PHI route                           | Engineering        | Before go-live                     | IN PROGRESS | `apps/web/src/server`, `apps/web/src/routes/app`, `apps/web/src/__tests__/app-static-contracts.test.ts`                                 |
| M-03a         | R-03       | Automated scanner request, callback signature, and infected-download regressions are implemented locally                     | Engineering        | 2026-05-20                         | COMPLETE    | `apps/web/src/lib/attachment-scan.test.ts`, `apps/web/src/routes/api/-uploads.scan-result.test.ts`, `apps/web/src/server/tasks.test.ts` |
| M-03b         | R-03       | Production scanner dispatch, callback, clean sample, and infected sample smoke evidence remains required                     | Engineering        | Before go-live                     | IN PROGRESS | `docs/runbooks/go-live-checklist.md`                                                                                                    |
| M-04          | R-04, R-08 | Complete production database restore and object storage recovery evidence capture                                                        | Engineering        | Before go-live                     | IN PROGRESS | `docs/runbooks/database-restore.md`, `docs/runbooks/go-live-checklist.md`                                                               |
| M-05          | R-05, R-11 | Document break-glass path, MFA evidence, and privileged access review before additional PHI operators                        | Security Officer   | Before additional PHI operators    | IN PROGRESS | `docs/hipaa/access-review.md`, `docs/hipaa/officers.md`, `docs/runbooks/key-rotation.md`                                                |
| M-06          | R-06       | Maintain PHI-safe logger and Sentry redaction tests; archive a sanitized alert capture before launch                         | Engineering        | 2026-05-20 and pre-launch evidence | COMPLETE    | `packages/audit/src/logger.ts`, `apps/web/src/lib/sentry.*`, `docs/hipaa/phase-2-evidence.md`                                           |
| M-07          | R-10       | Complete custom-domain, HTTPS, HSTS, and production smoke verification                                                       | Engineering        | Before go-live                     | IN PROGRESS | `wrangler.jsonc`, `apps/marketing/wrangler.jsonc`, `docs/runbooks/go-live-checklist.md`                                                 |
| M-08          | R-12       | Finish BAA/vendor legal evidence for hosting provider, Managed PostgreSQL provider, Stripe, Resend, and scanner boundary           | Legal and Founders | Before live PHI                    | IN PROGRESS | `docs/hipaa/vendors.md`, `docs/runbooks/go-live-checklist.md`                                                                           |

## Accepted Residual Risks

| Risk                                                                      | Acceptance rationale                                                                                                                                                                                   | Review trigger                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| No end-user MFA in Phase 2                                                | Product launch can proceed only for the defined initial operating model with strong password policy, session expiry, rate limiting, and limited operator access. MFA remains a Phase 3 hardening item. | Before broader customer rollout or when adding higher-risk customer environments |
| No annual penetration test completed before first launch evidence capture | The penetration test is scheduled as a post-launch annual evaluation item. Focused route tests, static contracts, and manual smoke checks remain required before live PHI.                             | 90 days post-launch or before enterprise customer onboarding                     |
| Provider-managed infrastructure internals                                 | PHIGuard relies on hosting provider and Managed PostgreSQL provider controls for physical security, hardware disposal, and infrastructure encryption.                                                        | Vendor change, BAA/SOC evidence change, or material infrastructure incident      |

## Review And Sign-Off

Security Officer review complete: Angel, 2026-05-20

Privacy Officer review complete: Angel, 2026-05-20

Open mitigations remain tracked in this register, `docs/hipaa/safeguards-map.md`, `docs/hipaa/vendors.md`, and `docs/runbooks/go-live-checklist.md`. The next review must update this file or create a new dated register and retarget the safeguards map.
