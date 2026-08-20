# Wave C Review - frontend-audit-fix

**Range reviewed:** `4060eff..HEAD` (24 commits)
**Baseline:** master @ `37c5b7e`
**Reviewer:** automated code-quality + spec-compliance pass

---

## Summary verdict

**APPROVED_WITH_FIXES**

No HIPAA log-or-third-party-script violations and the new PHI table (`incident_updates`) is correctly placed in a `*.phi.ts` file with full audit hooks and a redacted note body. Audit_events remains append-only. However there are two real issues that must be addressed before merge:

1. A **PHI-leaking client-side CSV export** on the incidents list page that exports the raw incident `title` (CRITICAL - Wave C10 incidents).
2. An **authorization gap** in the new task bulk-action server functions that lets a location-staff user mutate tasks in sibling locations within their tenant (CRITICAL - Wave C3).

Everything else is APPROVED with the smaller items listed in the Important/Nit sections.

---

## Critical issues

### C-1. Incidents CSV export leaks the incident title (potential PHI)

- File: `apps/web/src/routes/app/compliance/incidents/index.tsx` lines ~183-202 (commit `d00067d`)
- The `handleExportCsv` builds rows including `i.title`. The comment immediately above the helper claims "no PHI fields, only non-identifying aggregated columns", but the title field is treated as PHI everywhere else in this wave: `updateIncident` in `packages/compliance/src/incidents.ts` explicitly omits `title` and `summary` from the audit event (see HIPAA note in commit `6f251fe`). Office staff routinely put patient initials, room numbers, MRNs, or visit context into incident titles.
- Fix: Either (a) drop `Title` from the CSV columns and replace with the incident's short ID / reportedAt, or (b) move the export server-side behind an admin role check and add the same scope guards already used for the audit export. Reports CSVs in C4 are an aggregated-counts-only template - match that pattern.

### C-2. Bulk task mutations bypass per-location authorization

- File: `apps/web/src/server/tasks.ts` - `bulkUpdateStatusFn`, `bulkAssignFn` (commit `980032e`)
- Both server fns gate only on `canWriteLocations(access)`, which in `apps/web/src/server/access.ts:45` is just `access.role !== 'auditor'`. They then forward the user-supplied `taskIds` straight to `bulkUpdateTaskStatus` / `bulkAssignTask` in `packages/db/src/tasks/index.ts`, which scope by `tenantId` only - not by location.
- Result: a `location_staff` (or `location_manager`) user can call the bulk endpoint with arbitrary UUIDs for tasks attached to locations they have no access to, and Drizzle will happily update them. Every other task fn in this file (`requireScopedTask` path) enforces per-task location scope; the bulk variants are the outlier.
- Fix: Inside both bulk server fns, fetch `tasks.locationId` for the requested IDs, intersect with `getWriteLocationIds(access)` (or equivalent helper that respects `canAccessAllLocations`), and either reject the request or silently drop the unauthorized IDs and return a count of accepted vs rejected. Add a regression test under `apps/web/src/server/tasks.test.ts`.

---

## Important issues

### I-1. Training CSV download is not admin-gated

- File: `apps/web/src/routes/app/compliance/program.training.tsx:560-564`
- The Download CSV button renders whenever `filteredRecords.length > 0`, regardless of `canAdmin`. The CSV includes workforce names and emails (not PHI under HIPAA, but still PII the rest of the page admin-gates with `canAdmin ? … : null`). Wrap the Download CSV button in the same `canAdmin` check, matching the pattern used by Assign / Add Course.

### I-2. Audit "search" filter only matches the action column

- File: `apps/web/src/server/audit.ts` - `buildAuditFilterConditions`, commit `d7b5fae`
- The free-text `search` input on the audit log is wired to `ilike(auditEvents.action, ...)`. The UI label and the export's "search" copy imply a broader match. This is either underdocumented or under-implemented. Recommend either expanding to `OR ilike(resourceType,…) OR ilike(resourceId,…)`, or relabel the input to "Filter by action" so callers do not assume it searches actor / resource fields.

### I-3. Audit actorEmail filter is not tenant-scoped at the users join

- File: `apps/web/src/server/audit.ts` - `buildAuditFilterConditions`, the `else if (filters.actorEmail)` branch
- The users lookup runs without filtering by tenant membership. The resulting audit row query is tenant-scoped, so cross-tenant audit rows cannot leak, but the helper does mean a tenant admin can probe whether an email exists anywhere in the system based on response timing (no rows returned vs. `FALSE` short-circuit vs. populated `inArray`). Low severity, but easy to harden: scope the users select to memberships of `access.organizationId`.

### I-4. Three near-identical auth blocks in billing server fns

- File: `apps/web/src/server/billing.ts` - `listInvoicesFn`, `getPaymentMethodFn`, `getUpcomingInvoiceFn` (commit `7088550`)
- Each repeats the same `getSessionFn() → tenantId → hasBillingAdminAccess` block plus the Stripe customer lookup. Extract a small `requireBillingAdminCustomer()` helper similar to the existing `requireAuditAccess` pattern. Reduces drift risk if Stripe key loading or admin-role logic changes.

### I-5. Link search-prop noise will multiply

- The hotfix `b83955b` papers over TanStack Router's typed-Link by spreading explicit `undefined` defaults for every search field at every callsite (six fields per incident link, seven per task link, etc.). This is now sprinkled across `dashboard.tsx`, `compliance/index.tsx`, `compliance/incidents/$incidentId.tsx`, `compliance/incidents/new.tsx`, `soc2.access-reviews.$reviewId.tsx`, `soc2.evidence.tsx`, `soc2.index.tsx`. Any future search-param change in those routes requires touching every callsite again.
- Recommend a tiny per-route helper (`incidentsListSearch()`, `tasksListSearch()`) co-located with the route file, exporting the default `{ severity: undefined, … }` object. Then Links call `search={incidentsListSearch()}` and the search-param surface lives in one place.

### I-6. Estimate count logs tenant data via `logger.safe.info`

- `apps/web/src/server/audit.ts` `estimateAuditCountFn` calls `logger.safe.info({ count, tenantId }, 'estimateAuditCountFn: estimated audit event count')`. The `safe` logger strips PHI keys, but the message log is fired on every export-preview keystroke (via the export page's `useEffect` + `refreshEstimate`). High-cardinality, low-signal log noise - recommend either demote to `debug` or drop entirely.

---

## Nits

### N-1. Bare Links to validateSearch routes that may still typecheck

- `soc2.index.tsx:106` and `soc2.evidence.tsx:455` still link to `/app/soc2/evidence` with no `search` prop. The schema fields are all `.optional()` so TS accepts it, but it inconsistent with the b83955b hotfix elsewhere. Either complete the pattern or document why these are exempt.

### N-2. C10 admin-list polish files are large

- `tasks.tsx`, `tasks.$taskId.tsx` (1253 lines after edit), `program.risk.tsx`, `program.training.tsx`, `program.vendors.tsx`, `settings.members.tsx` (700 lines), `settings.locations.tsx` (519 lines) are getting unwieldy with embedded sort/filter/dialog logic. Not a blocker, but the filter+sort+search bar pattern is now copied across at least eight files - extracting a `useListSearchParams<TSortKey>` hook or a `<ListFilterBar />` component would pay off in Wave D.

### N-3. `PRIORITY_ORDER` / `IS_NOT_DONE` / `IS_OVERDUE` SQL fragments use raw column names

- `packages/db/src/tasks/index.ts` introduces `sql\`CASE priority …\`` using lowercase `priority`, `status`, `due_at`. Works because the table column names happen to match, but Drizzle's `sql\`\`` template should reference the column objects (`${tasks.priority}` etc.) so refactors don't silently break sort order. Same for `status != 'done'`.

### N-4. Sort-icon arrows are decorative but not consistent

- The arrows `↑↓↕` in reports/audit/compliance lists vary across files (some inline `<span>`, some via a `<SortIcon>` component, some directly in headers). Once the shared `<ListFilterBar />` extraction happens, fold the sort-icon into a single component.

### N-5. `listIncidentUpdates` performs a redundant tenant check

- `packages/compliance/src/incidents.ts` first SELECTs the incident to confirm it exists for the tenant, then queries `incident_updates` filtered by both `incidentId` and `tenantId`. The second tenant filter is redundant given the first, but it's defensive and cheap; leaving it is fine - flagging only because if you want to micro-optimize you can drop one round trip.

---

## Per-bundle verdict

| Bundle | Verdict | Notes |
|---|---|---|
| **C1 - compliance/policies** (`aa53d22`) | APPROVED | Audit hooks present, 6 unit tests added, dirty-warn implemented cleanly. |
| **C2 - compliance/* (vendor/training/risk/checklist/incident edit + lifecycle, incident_updates)** (`0341b1b`, `9e87acb`, `ec0742e`, `cb2602b`, `6f251fe`, `3f8f5fe`) | APPROVED | New PHI table correctly placed in `*.phi.ts`, free-form note text excluded from audit log, all mutations tenant-scoped + audited. Migration cleanly authored. |
| **C3 - tasks** (`980032e`, `bb3eafb`) | **BLOCKED on C-2** | Single fn fixes (update/archive) are correctly scoped via `requireScopedTask`. The two bulk fns skip per-task location scoping - critical. |
| **C4 - reports** (`9daf7dc`) | APPROVED | CSV exports are aggregated counts only, never include incident/task PHI. |
| **C5 - dashboard** (`4060eff`) | APPROVED | Plan-display helper extracted, clickable tiles work. |
| **C6 - billing** (`7088550`) | APPROVED with I-4 cleanup | Stripe fns are tenant + billing-admin gated. Three identical auth preambles should be extracted. |
| **C7 - onboarding** (`436f8ee`) | APPROVED | No HIPAA surface. |
| **C8 - settings (members + locations)** (`320d0b1`) | APPROVED | Last-admin guard, email validation, a11y attributes all good. |
| **C9 - audit** (`d7b5fae`) | APPROVED with I-2/I-3/I-6 | Filters propagate to export. Append-only invariant preserved. `search` field naming misleading and actorEmail lookup is global - both easy fixes. |
| **C10 - admin-list polish** (`d00067d`, `b4bfee4`, `0b2797d`, `f46dba4`, `fb9a3ae`, `f5b9215`, `fbc2748`, `cd3dc2c`, `b83955b`) | **BLOCKED on C-1** | Incidents CSV exports `title` which can carry PHI. Other lists are clean. Link hotfix has uncovered pattern noise (I-5). |

---

## Recommended path to green

1. Fix C-1 by removing `title` from the incidents CSV (or moving the export server-side behind admin gating with the same PHI-strip semantics the reports CSVs use).
2. Fix C-2 by adding per-location authorization in `bulkUpdateStatusFn` and `bulkAssignFn`, plus regression tests in `tasks.test.ts`.
3. Address I-1 (admin-gate training CSV button) - one-line change.
4. Re-run `pnpm --filter @phiguard/db test` and `pnpm --filter @phiguard/compliance test`; spot-run typecheck on `apps/web`.

I-2 through I-6 and the nits can ship in a follow-up Wave C polish commit.
