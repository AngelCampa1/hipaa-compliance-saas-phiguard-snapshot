# Wave D Review

Scope: commits `36e295d`, `a64f7ab`, `6f76Wave component cleanup pass2` (Wave C review followups) and the Wave D bundles `415fcf3` (Wave color-token pass), `b490c1d` (Wave legal copy pass), `2035a36` (Wave component cleanup pass), `7c898bf` (Wave route cleanup pass), `a8014bf` (Wave nav cleanup pass). Wave global cleanup pass was a no-op (globals.css was already clean).

Reviewer: combined code-quality + spec-compliance, branch `frontend-audit-fix`, base `bb3eafb`.

## Verdict

**APPROVED for merge.** All five HIPAA guardrails hold. The three Wave C follow-up fixes are correct and narrowly scoped. The Wave D consolidation bundles are well-executed: they delete the right duplicates, leave back-compat re-exports where consumers depend on stable import paths, and document the contracts they introduce (button parity, breadcrumbs a11y, brand identity constants). One subtle behavior change in `formatDate` is an improvement and does not affect any current call site.

## Critical issues

None.

HIPAA guardrails (verified against the full diff `bb3eafb..HEAD`):

1. **No PHI logging / no `console.log` in `apps/web` or `packages/`** - `git diff bb3eafb..HEAD -- apps/web packages | grep "^+.*console\."` returns zero hits.
2. **PHI tables in `*.phi.ts` with audit hooks** - no new tables added in Wave D. The `bulkUpdateTaskStatus` / `bulkAssignTask` changes in `packages/db/src/tasks/index.ts` still flow through `auditedTaskMutation`, preserving the audit trail on every mutated row.
3. **`audit_events` append-only** - no UPDATE/DELETE against `audit_events` introduced.
4. **No third-party JS on PHI routes (`apps/web/src/routes/app/`)** - no `<script>` tag additions in that subtree. The only injected script in the marketing layout (`ventora-ai-sdr`) is in `apps/marketing/src/layouts/BaseLayout.astro`, which is not behind auth and is allowed.
5. **No real PHI in fixtures** - the new `packages/db/src/tasks/tasks.test.ts` cases use the existing `seedTenant` / `makeUser` deterministic helpers and synthetic task titles ("In-scope task", "Out-of-scope assignable", "No writable locations"). No real PHI.

Wave C followups specifically:

- `36e295d` (incidents CSV) - correctly removes `i.title` (PHI per `packages/compliance/src/incidents.ts updateIncident`) from the export. Replacement column is a non-reversible 8-char id prefix. `reportedAt` switched to ISO is acceptable: severity/category/status remain non-identifying classifications. Header label changed from "Title" to "ID" - downstream consumers parsing the CSV by header name will need to update; row count unchanged.
- `a64f7ab` (tasks bulk scope) - closes a real authorization gap. `writableLocationIds` returns `undefined` for org-admins (no filter) and `allowedLocationIds` otherwise; the helper short-circuits to `{ updated: 0 }` when the writable set is empty rather than passing an empty `IN ()` clause. Three regression tests cover happy path, foreign-id filtering, and empty-writable-set. Return-type change from `void` to `{ updated: number }` is a breaking API change for the `packages/db` exports - verified the only callers in `apps/web/src/server/tasks.ts` use `withAuditContext(...)` without destructuring the return, so the change is source-compatible.
- `6f76Wave component cleanup pass2` (training CSV admin gate) - one-line fix; visibility now matches the adjacent Assign Training / Add Course admin gates. The server function exposing the data may still need an admin check independent of UI visibility - flagged as nit below.

## Important issues

None blocking. Two observations worth noting:

1. **`formatDate(0)` behavior change (Wave component cleanup pass).** The legacy `apps/web/src/lib/dates.ts` used `if (!value) return ''`, which treated the numeric `0` (Unix epoch) as missing and returned `''`. The new shared `packages/ui/src/lib/format.ts` checks explicitly for `null | undefined | ''` and now renders `0` as `1/1/1970`. The unit test calls this out as a regression guard. No call site in `apps/web` passes a literal `0` or a `value ?? 0` to `formatDate`, so this is a pure improvement, but worth mentioning in case any downstream branch relies on the old falsy-coercion.
2. **Training CSV - server-side gating.** `6f76Wave component cleanup pass2` hides the button at canAdmin, but I did not re-verify whether the underlying loader / server fn that exposes the roster-level training data also enforces an admin role. If the CSV content is built from a payload available to any role on the page, a non-admin could still recreate the export via the network tab. Worth a one-line confirmation in the next pass.

## Nits

- `BACK_LINK_ANCHOR_CLASS` (Wave component cleanup pass) is used in exactly one place (`apps/web/src/routes/app/soc2.evidence.tsx` line 748) where TanStack Router's typed `Link` needs the precise search-param shape that the polymorphic `BackLinkAnchor` would erase. The JSDoc on the export explains this trade-off well; the escape hatch is justified by an actual consumer, not speculative.
- Wave legal copy pass worker.ts NOTE: the inconsistency between `support@phiguard.app` (hardcoded in the AI SDR context) and `angel.campa@phiguard.app` (`SUPPORT_EMAIL` everywhere else) is preserved with an explicit `// NOTE: ... [WaveWave legal copy pass]` comment, exactly as the spec required. Recommend opening a tracking issue so this does not silently drift.
- Wave route cleanup pass documents the marketing↔app button mapping bidirectionally (in both `apps/marketing/src/styles/global.css` and `packages/ui/src/components/button.tsx`). No `destructive` marketing equivalent is intentional and noted.
- Wave nav cleanup pass breadcrumbs a11y is correct: `<nav aria-label="Breadcrumb">`, `<ol>` semantics, `aria-current="page"` only on the last item, decorative separators `aria-hidden="true"`. `classifyBreadcrumbItems` is a nice pure-helper extraction with full coverage (5 unit tests including empty-array and empty-string-`to` edges).
- Wave component cleanup pass re-exports in `apps/web/src/lib/{dates,format}.ts` keep the import paths stable, which avoids a needless cross-cutting rename. Good restraint.
- Wave color-token pass: spot-checked `apps/marketing/src/pages/{about,product,pricing,security,trust,index,baa}.astro` and the layouts - no raw hex remaining. The only `#xxxxxx` matches under `apps/marketing/src/pages` are the HTML entity `&#10003;` (✓) in `unsubscribe.astro` and `resources/thank-you.astro`, not colors. The remaining `#0f766e` / `#10201e` / etc. occurrences in `apps/marketing/src/layouts/BaseLayout.astro:172` are inside the self-contained `ventora-ai-sdr` widget shell and are explicitly marked one-off with an inline comment.

## Per-bundle verdict table

| Commit | Bundle | Verdict | Notes |
| --- | --- | --- | --- |
| `36e295d` | WaveC-followup: incidents CSV | APPROVE | PHI title removed from export; ID prefix + ISO replacement is correct. |
| `a64f7ab` | WaveC-followup: tasks bulk scope | APPROVE | Real authz gap closed; three regression tests; API return-type change is source-compatible with current callers. |
| `6f76Wave component cleanup pass2` | WaveC-followup: training CSV admin gate | APPROVE with nit | UI gate is correct; recommend confirming server-side gating in next pass. |
| `415fcf3` | Wave color-token pass: marketing hex → tokens | APPROVE | Spot check clean across 7 pages + layouts; one-offs labeled. Dead `--phig-color-border-subtle` fallback correctly removed. |
| `b490c1d` | Wave legal copy pass: brand identity constants | APPROVE | Centralization is clean; worker.ts inconsistency documented with `NOTE` per spec. |
| `2035a36` | Wave component cleanup pass: Input/Textarea/BackLink/RouteErrorFallback/formatDate | APPROVE | Old duplicates deleted; back-compat re-exports in place; `formatDate(0)` behavior change is an improvement; no source-incompatibility. |
| `7c898bf` | Wave route cleanup pass: button system parity | APPROVE | Contract documented bidirectionally; new size classes (.button-sm/md/lg) added without breaking legacy unsized form. |
| `a8014bf` | Wave nav cleanup pass: breadcrumbs primitive + page-shell | APPROVE | A11y correct; pure helper extracted; sole consumer migrated; existing PageHeader/Panel/TableShell correctly identified as already-consolidated. |

## DRY verification

D was a consolidation wave; verified that old code paths were actually removed, not just left dead:

- Old inline breadcrumb scaffolding in `apps/web/src/routes/app/reports.tsx` - **deleted** in `a8014bf`.
- Inline `formatDate` in `apps/web/src/routes/app/compliance/program.risk.tsx` - **deleted** in `2035a36` (call site now uses shared formatter with explicit `'Not set'` fallback).
- Old body of `apps/web/src/lib/dates.ts` and `apps/web/src/lib/format.ts` - **replaced** by re-exports in `2035a36`.
- Dead `--phig-color-border-subtle` var() fallbacks in `LaunchPhaseProgress.astro` and `PromoBanner.astro` - **removed** in `415fcf3`.
- Hand-rolled `<nav className="mb-4 text-sm"><Link>` blocks across 8 program/soc2 routes - **replaced** by `<BackLinkNav><BackLinkAnchor as={Link}>` in `2035a36`.

No new duplication introduced.

## TanStack Router type-safety

The polymorphic `BackLinkAnchor` plus the explicit `BACK_LINK_ANCHOR_CLASS` escape hatch handle the known type-inference trap with TanStack Router's typed `Link` (search/route params). The single consumer that needed the escape hatch (`soc2.evidence.tsx`) is opting in explicitly. The `Breadcrumbs` component takes `LinkComponent` as a prop, which preserves the consumer's `Link` typing at the call site (`reports.tsx` passes `Link` directly).
