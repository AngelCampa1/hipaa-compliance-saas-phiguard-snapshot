# Final Pre-Deploy Review - `frontend-audit-fix` merged to master

**Range:** `37c5b7e..HEAD` (54 commits, including hardening commit `4373812`)
**Reviewer:** Senior reviewer (final pre-deploy gate)
**Date:** 2026-05-27

---

## Verdict: **APPROVED**

Critical: **0** · Important: **0** · Nits: **3**

All HIPAA guardrails hold. The hardening commit (`4373812`) materially improves robustness of the audit context plumbing, OAuth callback transactional install, upload capability verification, and external-input body bounding across every public API surface. No console.log in production code paths, no PHI logging, no third-party JS injected into PHI routes, and no UPDATE/DELETE attempts against `audit_events`.

---

## Confirmation: prior-review fixes preserved in HEAD

| Commit | Subject | Verified in HEAD |
|---|---|---|
| `36e295d` | Drop title from incidents CSV (PHI risk) | YES - `apps/web/src/routes/app/compliance/incidents/index.tsx:211-232` exports only ID-prefix, severity, category, status, reportedAt. |
| `a64f7ab` | Bulk task mutations scoped by writable locations | YES - `apps/web/src/server/tasks.ts:1119-1221` uses `writableLocationIds(access)` and passes `locationIds` into `bulkUpdateTaskStatus` and `bulkAssignTask`. |
| `6f76d42` | Training CSV admin gate | YES - `apps/web/src/routes/app/compliance/program.training.tsx:562` wraps the Download CSV button in `canAdmin && filteredRecords.length > 0`. |
| `57b94a4` | SUPPORT_EMAIL constant for AI-SDR contact | YES - `apps/marketing/src/worker.ts:8,118` imports `SUPPORT_EMAIL` from `@phiguard/brand` and uses it in the founder-contact excerpt. |

---

## Special: `4373812 fix(compliance): harden audit and compliance flows`

This commit is large (~17.8k insertions across 151 files) but the diff is overwhelmingly:

1. Genuine hardening of public/edge surfaces (the parts reviewed in depth below).
2. Style normalization (double-quotes → single-quotes + semicolon removal) across many components - no behavioral change.
3. Test additions (new `.test.ts` files for s3, session, audit, scan-result, partners, leads, webhook, oauth, calendar-sync, etc.).

### Hardening - accepted

| Area | Change | Verdict |
|---|---|---|
| `apps/web/src/lib/audit.server.ts` + `audit.ts` | Splits server-only `getRequest()` from header-pure `runInAuditContextForHeaders`. Audit-context IP/UA extraction unchanged; testable in isolation. | OK |
| `apps/web/src/lib/s3.ts` | Adds explicit `verifyDirectUploadSignature` helper with timing-safe compare; tightens capability validation (`maxBytes > 0`, structural checks); still rejects expired or malformed tokens. | OK |
| `apps/web/src/lib/upload-keys.ts` (new) | Single source of truth for allowed upload key prefixes (`attachments/<org>/`, `evidence/<org>/{checklist-items,soc2,training-certificates,vendor-baas}/`). Replaces duplicated string checks in `uploads.direct` and `uploads.scan-result`. DRY win. | OK |
| `apps/web/src/routes/api/uploads.direct.tsx` | Streams body with size cap, rejects zero-byte uploads, dedupes via existing scan record, signed capability + content-type + key-prefix all cross-checked. `verifyDirectUploadCapability` is now try-wrapped so a missing secret cannot bubble. Drops the `session.activeOrganizationId === capability.organizationId` check - but `capability.organizationId` is bound to the signed token AND `resolveActiveLocationAccess` already loaded the caller's effective `access.organizationId`, which is what is now used for the key-prefix check. Net auth posture is unchanged. | OK |
| `apps/web/src/routes/api/uploads.scan-result.tsx` | Bounds body to 4 KB; uses `getUploadKeyTarget` to route to the correct write path (eliminates the previous dual-write that could touch the wrong table on key collision). Replay window + HMAC + timing-safe compare retained. | OK |
| `apps/web/src/routes/api/integrations/$provider.callback.tsx` | Adds `installStartedAt` from signed state (with type validation), encryption failure handled separately, install now runs in a transaction with `setWhere coalesce(installStartedAt, updatedAt) <= stateStartedAt` to prevent stale-callback overwrites. Drops the `session.activeOrganizationId === tenantId` check, but `tenantId` is HMAC-signed in state AND `resolveOrganizationAccess(db, { activeOrganizationId: tenantId, userId })` + `isAdmin(role)` re-checks both membership and admin role server-side. Audit event is written inside the same transaction. Net posture: stronger. | OK |
| `apps/web/src/routes/api/marketing/leads.tsx` | Bounds body to 16 KB, handles JSON parse errors, adds rollback of marketing-lead and email-subscription inserts when delivery email fails, isolates sequencer-enrollment errors. Logger calls include only non-PHI fields (`magnetSlug`, `leadId`, sanitized `errMessage`). | OK |
| `apps/web/src/routes/api/marketing/resend-webhook.tsx` | Bounds body to 256 KB, suppression-update + sequencer-unsubscribe split into separate try blocks, only forwards to sequencer when local update actually flipped a row (`subscribed = true` condition + `returning()`). Returns 503 on DB failure, 200 on sequencer failure (Resend retry semantics preserved). | OK |
| `apps/web/src/routes/api/marketing/unsubscribe.tsx` | Bounds + JSON-parse hardening (per diff). | OK |
| `apps/web/src/routes/api/partners.apply.tsx` | Bounds body to 12 KB, retries on unique-violation race for `email`, regenerates referral codes on collision, returns existing partner row on duplicate. | OK |
| `apps/web/src/routes/api/analytics/product.tsx` | Bounds body to 8 KB. Server-mediated PostHog forwarding remains gated by `isApprovedProductAnalyticsEvent` allowlist and property sanitizer. Forward failure now swallowed so analytics outages cannot break app calls. Uses `resolveActiveLocationAccess` instead of raw session field. | OK |
| `apps/web/src/routes/api/webhooks/stripe.ts` | Bounds body to 1 MB before Stripe signature verification. Raw bytes still passed to verifier (signature input unchanged). | OK |
| `apps/web/scripts/run-migrations.ts` | Migration failures now break the loop and `process.exit(1)` instead of being silently logged and skipped. **Hard win for deploy safety.** | OK |
| Migrations 0049/0050/0051 | New `referral_revenue_events` (non-PHI revenue events), new `install_started_at` column on `integration_connections`, dedupe + unique index on `policy_acknowledgements (policy_id, user_id)`. The 0051 DELETE targets only `policy_acknowledgements` (a `*.phi.ts` table), not `audit_events` - guardrail intact. | OK |

### Items intentionally **not** flagged

- `apps/web/src/routes/api/marketing/leads.tsx` calls plain `logger.error` instead of `logger.safe.error`. `packages/audit/src/logger.ts:117-126` defines `logger.safe === logger`, both run redaction. The `.safe` alias is a code-review signal, not a different code path. Marketing-leads logs include `magnetSlug`, `leadId` (UUID), and a sanitized `errMessage` - no email body, no PHI.
- `apps/web/scripts/run-migrations.ts`, `dev-seed.ts`, `prod-seed.ts`, `playwright-*.mjs`, `verify-lead-magnets.ts` use `console.log`. CLAUDE.md exempts `packages/*/scripts/`; the same intent applies here - these are build/CI/dev scripts, never on the request path.
- `referral-revenue-events.ts` schema is not `.phi.ts`. Correct: Stripe invoice IDs + revenue amounts + partner IDs are not PHI.

---

## Per-wave verdict

| Wave | Subject | Verdict |
|---|---|---|
| A | Marketing copy + dead-code cleanup + soft-nav fixes | APPROVED (prior review) |
| B | App shell, primitives, error boundaries, loading/empty states, auth UX | APPROVED (prior review) |
| C | Compliance edit/append/archive flows, tasks bulk + a64f7ab auth fix, audit filters, billing, reports, training admin gate fix | APPROVED (prior + 3 follow-up fixes in HEAD) |
| D | UI consolidation (Input/Textarea/BackLink/RouteErrorFallback/formatDate), Button unification, page-shell breadcrumbs, brand identity centralization, SUPPORT_EMAIL follow-up | APPROVED (prior review + 57b94a4) |
| Hardening (`4373812`) | Audit context refactor, OAuth install transactionality, upload capability tightening, body-size bounding on every public API surface, migration runner hardening | APPROVED |

---

## Critical issues

None.

## Important issues

None.

## Nits

1. **`apps/web/src/routes/api/marketing/leads.tsx`** - prefer `logger.safe.error(...)` over `logger.error(...)` at PHI-adjacent boundaries even when current call sites don't actually log PHI. It costs nothing and signals intent to future reviewers. (Same applies to `resend-webhook.tsx` which already uses `logger.safe.error` - make leads consistent.)
2. **`apps/web/src/routes/api/integrations/$provider.callback.tsx:36-44`** - the `withIntegrationInstallTransaction` helper falls back to non-transactional execution when `db.transaction` is missing. In production, drizzle on Postgres always exposes `transaction`, so the fallback only matters for mock dbs in tests; the comment-free fallback could surprise a reader. Consider an assertion or a comment that the fallback is test-only.
3. **`apps/web/scripts/run-migrations.ts:55`** - leftover `Migrations: applied=... skipped/already-existed=...` log line is fine but the prior `✓` glyph was removed; cosmetic only. Worth noting since CI greps may rely on the exact format.

## HIPAA guardrails

All ten guardrails listed in the review brief verified intact:

1. No `console.*` in `apps/web/src` or `packages/*/src` production paths. (`git grep -nE "console\.(log|warn|error|debug|info)" apps/web/src/ packages/` returns no results outside tests/scripts/e2e.)
2. `logger.safe` / `logger` (which are identical) used; redact applied. No raw email/PHI fields in log shapes inspected.
3. New PHI tables: none added by `4373812`. The new `referral_revenue_events` is non-PHI (revenue/payout). The added `install_started_at` column lives on the existing `integrations.phi.ts` table.
4. No code attempts UPDATE/DELETE against `audit_events` (only the trigger definition and its tests reference such statements). The 0051 migration's DELETE targets `policy_acknowledgements`, not audit events.
5. Authenticated app routes contain no third-party JS. PostHog browser code goes through same-origin `/api/analytics/product` capture path, server-side allowlist + sanitizer.
6. No real PHI in fixtures/e2e. E2e additions use synthetic labels and ARIA selectors only.
7. CSV exports: incidents drops title (fix #1 preserved), training is admin-gated (fix #3 preserved), audit export gains `locationId` propagation but is already admin-gated upstream.
8. Bulk mutation server fns gated by `writableLocationIds` (fix #2 preserved).
9. Brand identity literals consolidated under `@phiguard/brand`; remaining `phiguard.app` strings are in SEO audit raw-data JSON files only.
10. No infrastructure tooling/encryption changes in this commit range.

---

## Recommendation

Deploy. The three nits are optional polish, not blockers.
