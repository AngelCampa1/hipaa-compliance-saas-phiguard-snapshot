# Dashboard, Tasks, Reports & Help Frontend Audit

## Summary
- Total: 38 (P0: 1, P1: 19, P2: 18)
- Top risk themes:
  1. Hard navigations via `window.location.assign` / `window.location.href` in Tasks list and Help page break SPA state, defeat the router's loaders/cache, and cause full-page reloads.
  2. Dashboard widgets (SummaryMetrics, location-breakdown rows, Team-members tile) are presentational only - no drill-down affordances on any of the headline KPIs.
  3. Tasks list is missing core table affordances (sort, pagination, bulk action, server-side search) and gracefully degrades to "open" filter only for unknown statuses without surfacing why.
  4. Reports are read-only with no export/CSV/print paths, no comparison-window control, no sorting, and no in-page link back to source records.
  5. Several copy/jargon violations against the brand voice ("workflow", "follow-up work", etc.) and HIPAA-warning text inside `feature-gate` that the user will see on plan-locked report screens.

## Findings

### [P0] [BUG] Tasks list mutates URL with `window.location.assign`, wiping router context
**File(s):** apps/web/src/routes/app/tasks.tsx:243-249
**Issue:** The location-scope `<select>` triggers `window.location.assign("/app/tasks?...")` instead of `navigate()` / `<Link>`. This forces a full document reload on every scope change, throws away `Route.useRouteContext()` (which already pre-loaded `tasks` + `scope`), and breaks back-button history. The status-tab nav directly above uses `<Link to="/app/tasks" search={...}>` correctly - this code path is inconsistent and avoidable.
**Expected:** Use `useNavigate()` + `navigate({ to: "/app/tasks", search: { status, locationId: next } })` so the route loader re-runs without a full reload.
**Fix:** Replace the `<select onChange>` with router navigation, matching the dashboard location switcher pattern (`dashboard.tsx:155-164`).

### [P1] [BUG] tasks.new.tsx posts then hard-navigates with `window.location.assign`
**File(s):** apps/web/src/routes/app/tasks.new.tsx:72-81
**Issue:** After create, the page builds a `new URL(...)` and `window.location.assign(...)` to the detail page. This reloads the SPA, discards toast/transition state, and forces another auth round-trip. There is no router invalidation either, so a user returning to `/app/tasks` may see stale list data.
**Expected:** `navigate({ to: "/app/tasks/$taskId", params: { taskId }, search: { locationId } })` and invalidate the `/app/tasks` route.
**Fix:** Switch to router navigation + `router.invalidate()` (or rely on TanStack Router's automatic invalidation).

### [P1] [BUG] Help page small-screen category select uses `window.location.href`
**File(s):** apps/web/src/routes/app/help.tsx:104-108
**Issue:** Mobile category selector does `window.location.href = "/app/help?..."` instead of router navigation. Causes a full reload and a flash of the empty help shell.
**Fix:** Use `useNavigate()` and update `Route.useSearch()`.

### [P1] [MISSING] Dashboard summary metrics are not actionable
**File(s):** apps/web/src/routes/app/dashboard.tsx:182-208
**Issue:** "Open tasks", "Open incidents", "Active checklists", and "Team members" are rendered as `SummaryMetric` panels with no `href`. The user cannot click the headline number to drill into the underlying list. Action items below partially cover Tasks/Incidents/Checklists, but only when counts are non-zero, and "Team members" never gets a link.
**Expected:** Each metric tile links to the relevant route (`/app/tasks?status=open`, `/app/compliance/incidents`, `/app/compliance/checklists`, `/app/settings/members`).
**Fix:** Wrap `SummaryMetric` in `<Link>` or add an `href` prop on the primitive.

### [P1] [MISSING] Dashboard location-breakdown rows are not clickable
**File(s):** apps/web/src/routes/app/dashboard.tsx:236-256
**Issue:** Each row shows tasks/incidents/checklists counts per location but has no per-cell or per-row link. Users have to manually switch the location selector to filter the dashboard, then jump from there.
**Expected:** Either the location-name cell links to `/app/dashboard?locationId=<id>`, or each count cell links to the filtered list view (e.g. `/app/tasks?locationId=<id>&status=open`).
**Fix:** Wrap location name and count cells in `<Link>` with the appropriate `search` params.

### [P1] [STATES] Dashboard has no error/loading state for `beforeLoad` failure
**File(s):** apps/web/src/routes/app/dashboard.tsx:25-33
**Issue:** `beforeLoad` calls `getDashboardSummaryFn` which can throw (`Unauthorized`, network error, RDS hiccup). There is no `errorComponent` / `pendingComponent`, so the user gets the framework's default error fallback with no recovery path. Other routes in the app define explicit `errorComponent`s.
**Expected:** Add an `errorComponent` that renders a recoverable panel (e.g. "Unable to load dashboard. Refresh to try again.") and ideally a `pendingComponent`/`pendingMs` for slow loads.

### [P1] [STATES] Tasks list has no loading skeleton on first render
**File(s):** apps/web/src/routes/app/tasks.tsx:33-50
**Issue:** Tasks load in `beforeLoad`; while the data loads, the previous route stays on screen with no progress indicator. After search/filter changes, the list snaps without optimistic update.
**Fix:** Add `pendingComponent` with a skeleton list, and visual feedback when the location filter is in-flight.

### [P1] [TABLE] Tasks list has no pagination, no server-side filter, no sort
**File(s):** apps/web/src/routes/app/tasks.tsx:80-103, 290-366
**Issue:** Search is client-side only (`filteredTasks` filters the in-memory array). `listTasksFn` returns all tasks for the org/location at once. Clinics with hundreds of tasks will see slow renders and a giant payload, with no way to sort by due date / priority / created date / assignee.
**Expected:** Server-side pagination + sort controls + at minimum sort by due date and priority. The status tab nav covers status filtering, but there is no assignee filter (the `listTasksFn` schema accepts one - UI never exposes it).
**Fix:** Add sort header controls, paginated query, assignee filter dropdown, and either debounce client-search or push to server.

### [P1] [TABLE] Tasks list has no bulk actions
**File(s):** apps/web/src/routes/app/tasks.tsx:290-366
**Issue:** No way to bulk-assign, bulk-complete, or bulk-mark blocked. Each item must be opened individually. Administrators of multi-location clinics will hit this on day one.
**Expected:** Row checkboxes + a bulk-action bar (assign, status change). Status change must continue to write through the audit trail.

### [P1] [MISSING] Tasks list cards have no priority sort/visual ordering by urgency
**File(s):** apps/web/src/routes/app/tasks.tsx:95-103
**Issue:** Default order is whatever the server returns (`listTasksFn`). Urgent and overdue items are not floated to the top. The "Next action" alert recommends opening "the oldest due task" but the UI does not visually order or flag the oldest.
**Fix:** Default sort by `(status != done, overdue desc, priority desc, dueAt asc)` server-side.

### [P1] [BUG] Tasks list location filter is hidden on single-location orgs even when scope.locations exists
**File(s):** apps/web/src/routes/app/tasks.tsx:233
**Issue:** Filter renders only when `scope.locations.length > 1`. If a non-admin has access to exactly one location, the filter is hidden - fine - but there is no visual indicator of which location is being filtered. Page-header describes "Compliance tasks scoped to {activeLocationName}" only when one location is active.
**Fix:** Show the active-location pill near the page header even in single-location scope, so the user knows the filter is implicit.

### [P1] [MISSING] Task detail has no edit affordance for title, description, priority
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:557-565
**Issue:** Only status, due-date, assignee, comments, and attachments are editable post-creation. Title, description, and priority are read-only once the task is created. There is no way to fix a typo or change priority after creation. There is no delete/archive either (`CRUD: missing update + delete`).
**Expected:** Inline edit (or modal) for title/description/priority. Soft-delete or archive action.
**Fix:** Add an edit dialog wired to a `updateTaskFn` (does not exist today - would need a server-fn pair).

### [P1] [CRUD] Task detail has no delete/archive
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx
**Issue:** No way to remove a mistakenly created task. Forces users to set status=done as a workaround which contaminates "completed" reporting.
**Expected:** Soft-archive that hides from default list but preserves the audit trail. Hard-delete must remain blocked by the append-only audit constraint.

### [P1] [BUG] Task detail "Back to tasks" loses status filter
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:418-425
**Issue:** Back link goes to `/app/tasks` with `status: undefined, locationId: undefined`, so a user who was filtering on "Blocked" loses the filter on return. The list page reads `locationId` from search; user is yanked to "All locations".
**Fix:** Preserve `status` and `locationId` (read from `Route.useSearch()`, which already validates `locationId`).

### [P1] [STATES] Task detail attachment list shows raw `sizeBytes` and content-type
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:825-827
**Issue:** Rendered as `{a.contentType} / {a.sizeBytes} bytes` - e.g. `application/pdf / 384721 bytes`. Healthcare-admin users won't parse the byte count or MIME string. No formatted size ("376 KB") and no human-readable type ("PDF").
**Fix:** Format size with `humanFileSize()` and map MIME -> friendly label.

### [P1] [BUG] Task detail "Refresh scan status" only renders when attachments exist; no manual trigger for new uploads
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:790-801
**Issue:** Refresh button is conditional. Right after upload, the new attachment is appended to local state with `avStatus: 'pending'` (assumed); user must wait without any indication of when scan completes - no polling, no websocket, no auto-refresh. The Refresh button only appears once at least one attachment is in the list, which is fine, but there is no polling either.
**Fix:** Auto-poll attachment status on pending scans (with backoff) or surface a "scanning… we will email you" message.

### [P1] [FORM] Task detail status `<select>` triggers async update on every change with no confirmation
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:573-585
**Issue:** Changing status fires `handleStatusChange` immediately. There is no confirm step for "done" (which writes audit + a `task_completed` event). Misclick = irreversible audit event. Also: if the request fails the select stays on the new value visually because `task.status` only updates after the resolve, but the failed value is briefly shown to the user via the controlled `<select>`'s `value={task.status}` - looks fine but on a slow connection the select snaps back which is confusing.
**Fix:** Either confirm "done" transitions, or add an optimistic-UI pattern with rollback toast.

### [P1] [FORM] Task detail due-date `Clear` button does not submit
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:606-615
**Issue:** "Clear due date" sets local state to `""` but does not call `handleDueAtUpdate`. The user has to click "Save due date" after clicking "Clear" - non-obvious because nothing visually indicates the form is dirty.
**Fix:** Either call the update directly when "Clear" is clicked, or add a "Unsaved changes" indicator on the form.

### [P1] [A11Y] Task detail badge groups duplicate STATUS/PRIORITY across header and meta strip
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:437-468
**Issue:** Status + priority badges render twice: once in `PageHeader actions` (lines 437-446) and again in the meta strip immediately below (lines 449-468). Screen readers will read the same status/priority twice. Visually noisy.
**Fix:** Remove the duplicate in the meta strip.

### [P1] [CONTENT] "Current workflow state" copy violates the banned-jargon rule
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:480
**Issue:** `detail` for the Status SummaryMetric reads "Current workflow state". `workflow` is on the banned-words list in CLAUDE.md.
**Fix:** Replace with "Current task state" or "Where this task is now".

### [P1] [CONTENT] FeatureGate upgrade prompt uses banned "workflow(s)" three times
**File(s):** apps/web/src/components/feature-gate.tsx:21, 24, 36
**Issue:** Feature labels and body copy say "calendar integrations and connected workflows", "access review workflows", and "workflow complexity". This component renders on `/app/reports/*` for plans that don't include `multi_location_rollup`. It will be the upgrade-funnel surface for many users. Three jargon violations on the same screen.
**Fix:** Rewrite labels in HIPAA admin language ("calendar integrations and connected actions", "access review programs", "the level of compliance program complexity").

### [P1] [INCONSISTENCY] Reports.compliance.tsx wrapping container is `max-w-5xl mx-auto`, Reports.tasks.tsx is full-width
**File(s):** apps/web/src/routes/app/reports.compliance.tsx:32 vs apps/web/src/routes/app/reports.tasks.tsx:26
**Issue:** Compliance rollup page is centered in a 5xl container; Tasks rollup page is full-width with no max-width. They are sibling pages reached from the same Reports index and should match.
**Fix:** Pick one. The index page (`reports.index.tsx:39`) uses `max-w-5xl mx-auto` so tasks should follow.

### [P1] [MISSING] Reports pages have no CSV/PDF export
**File(s):** apps/web/src/routes/app/reports.compliance.tsx, apps/web/src/routes/app/reports.tasks.tsx, apps/web/src/routes/app/reports.index.tsx
**Issue:** No download, no print-friendly view, no "Send to auditor" / "Schedule weekly email" action. The audit-export route exists at `/app/audit/export` but Reports doesn't link to it. Admins will want to hand a PDF or CSV to a covered-entity reviewer.
**Fix:** Add Export CSV and Export PDF buttons in PageHeader actions. Reuse the audit-export pattern.

### [P1] [TABLE] Reports tables have no sort, no per-location drill-down
**File(s):** apps/web/src/routes/app/reports.compliance.tsx:46-88, apps/web/src/routes/app/reports.tasks.tsx:40-76
**Issue:** Columns (Location, Total/Open/Overdue/Completed) are not sortable. Location-name cells are not clickable - users cannot jump from "Site X has 12 overdue tasks" to the filtered task list. The compliance rollup `pct` column has color coding but no sort, so a clinic with many locations cannot quickly find the worst performer.
**Fix:** Sortable headers + link Location cells to `/app/tasks?locationId=<id>&status=open` (tasks rollup) and `/app/compliance/checklists?locationId=<id>` (compliance rollup).

### [P1] [MISSING] Reports index "Open tasks" tile counts all open tasks but doesn't link
**File(s):** apps/web/src/routes/app/reports.index.tsx:36, 48
**Issue:** Same drill-down problem as the dashboard - `SummaryMetric` is presentational. Also the value is `openTasks` (sum across locations) with `detail="Across all locations"`, but the location-scoped user (sub-admin without `multi_location_rollup`) hits the FeatureGate; for the org-admin reading this, no link to the filtered list.
**Fix:** Link the three index tiles to drill-down destinations.

### [P1] [STATES] Reports pages have no loading state
**File(s):** apps/web/src/routes/app/reports.index.tsx:14-25, apps/web/src/routes/app/reports.compliance.tsx:15-21, apps/web/src/routes/app/reports.tasks.tsx:9-15
**Issue:** Loaders do parallel DB queries with no `pendingComponent`. On a cold worker or busy DB, the previous route stays on screen during navigation.
**Fix:** Add skeleton placeholders.

### [P1] [MISSING] Help page: search has no result count, no "did you mean", no recent searches
**File(s):** apps/web/src/routes/app/help.tsx:46-49, 157-164
**Issue:** Search filters `visibleTopics` silently. No "{N} results" tally, no empty-result CTA other than a generic "try a simpler word" panel. No URL persistence on `q` either - typing into the input does not update the URL, so a user cannot bookmark or share a search.
**Fix:** Sync `query` <-> `search.q` via navigate, surface result count, and surface "Email support" as the fallback when zero results.

### [P1] [A11Y] Help page popular-guides Link uses `topic.category` which may differ from the visible category nav
**File(s):** apps/web/src/routes/app/help.tsx:173-184
**Issue:** Selects only three hard-coded topic ids. If a topic id changes or is removed in `packages/knowledge/src/app.ts`, this section silently empties (filter returns []) with no fallback render - section appears as a near-empty box.
**Fix:** Either assert these ids at build time or render a fallback when none match.

### [P2] [NAV] Reports.tsx is a bare `<Outlet />` with no fallback
**File(s):** apps/web/src/routes/app/reports.tsx:1-5
**Issue:** Layout route renders only `<Outlet />`. There is no breadcrumb, no shared header, no "Reports" wrapper. The Tasks rollup and Compliance rollup pages are visually different (one max-w-5xl centered, one full-width) because there's no shared layout to hold them together.
**Fix:** Add a thin layout (breadcrumb "Reports > Compliance progress") and a consistent container.

### [P2] [NAV] No breadcrumb on reports sub-pages or task detail
**File(s):** apps/web/src/routes/app/reports.compliance.tsx, reports.tasks.tsx, tasks.$taskId.tsx
**Issue:** Task detail has a "Back to tasks" link but no breadcrumb trail. Reports sub-pages have no back link at all - user reaches them via the index but has only browser back to escape.
**Fix:** Add `<Breadcrumb>` from `@phiguard/ui` (or matching) on detail/sub-pages.

### [P2] [INCONSISTENCY] Dashboard SummaryMetric for "Active checklists" warns when active > 0 but completed/total context isn't shown
**File(s):** apps/web/src/routes/app/dashboard.tsx:194-199
**Issue:** Detail reads `${completed} completed` but never shows total. A user with 1 active and 0 completed sees just "0 completed" with no idea how many checklists they should expect.
**Fix:** Use `${active}/${total}` style consistent with other tiles.

### [P2] [INCONSISTENCY] Dashboard SummaryMetric tone for "Active checklists" treats active > 0 as warning
**File(s):** apps/web/src/routes/app/dashboard.tsx:198
**Issue:** Active checklists is positive (work is being done). Painting it warning-yellow is misleading; it should be brand or neutral. Compare to `Open tasks` which is `brand` when > 0.
**Fix:** Use `tone={active > 0 ? "brand" : "neutral"}`.

### [P2] [CONTENT] Dashboard description uses "Operational and compliance work" - fine - but "work across your active workspace" is generic SaaS phrasing
**File(s):** apps/web/src/routes/app/dashboard.tsx:124
**Issue:** "active workspace" is generic. Healthcare-admin audience expects "clinic", "location", or "organization".
**Fix:** "Operational and compliance work across your clinic."

### [P2] [CONTENT] Tasks page header description says "Compliance tasks scoped to ..." but tasks include non-compliance follow-up
**File(s):** apps/web/src/routes/app/tasks.tsx:118-119
**Issue:** Description overclaims. The `noPhiTaskWarning` and ContextualHelpPanel describe tasks as "clinic follow-up list", which is the right framing. The header description should match.
**Fix:** "Clinic follow-up tasks scoped to {location}."

### [P2] [CONTENT] tasks.new.tsx submit button shows "Creating..." with ASCII dots; rest of app uses ellipsis or "Adding…" inconsistently
**File(s):** apps/web/src/routes/app/tasks.new.tsx:276 vs apps/web/src/components/new-task-modal.tsx:298
**Issue:** `Creating...` (three dots) vs `Adding…` (Unicode ellipsis). Pick one across the create surface.

### [P2] [CONTENT] tasks.new.tsx "Use urgent only for real risk or deadlines" duplicates `taskPriorityHelp` content
**File(s):** apps/web/src/routes/app/tasks.new.tsx:144-153
**Issue:** Detail text on the Priority `SummaryMetric` hard-codes guidance that is also present in the InlineHelpLabel tooltip a few lines below - risks drift.
**Fix:** Read both from `appPublicGuidanceCopy` so they stay in sync.

### [P2] [A11Y] tasks.$taskId.tsx required asterisk for "title" in tasks.new is sibling text, not part of the label
**File(s):** apps/web/src/routes/app/tasks.new.tsx:211-213
**Issue:** `<span aria-hidden="...">*</span>` sits outside the label content, so the input does not announce "required". The input has `required` attribute but screen readers do not pair the asterisk with the field. Same pattern repeats in new-task-modal.tsx:217.
**Fix:** Include the asterisk inside the label (e.g. `aria-required="true"` on input + visible asterisk inside label).

### [P2] [A11Y] Tasks list status nav lacks `role="tablist"`
**File(s):** apps/web/src/routes/app/tasks.tsx:192-215
**Issue:** Tabs are visually tab-styled (border-bottom indicator + `aria-current="page"`) but use `<nav>` + `<Link>`. Screen-reader users do not get tab semantics. Either commit to tablist or use a plain nav and drop the visual tab affordance.
**Fix:** Add `role="tablist"` + `role="tab"` semantics, or rebrand as filter buttons.

### [P2] [A11Y] Help page hides desktop nav with `hidden sm:flex` while showing only the mobile select - keyboard users on a narrow viewport cannot tab to the desktop nav at all
**File(s):** apps/web/src/routes/app/help.tsx:117
**Issue:** Standard responsive pattern, but the mobile select then immediately reloads the page via `window.location.href`, blowing away focus. Combined with the [P1] hard-nav above, mobile keyboard users have a poor flow.

### [P2] [STATES] Task detail attachment list does not differentiate "ready to download" vs "infected/blocked"
**File(s):** apps/web/src/routes/app/tasks.$taskId.tsx:807-846
**Issue:** Infected attachments show a "Blocked" badge but no explanation copy ("This file was flagged by virus scan; contact support to review"). Pending attachments show the badge but no expected-time hint.
**Fix:** Inline help text per `avStatus` value, plus link to the help-center topic if one exists.

### [P2] [INCONSISTENCY] Dashboard org-strip plan label is `${plan} / ${planStatus}` raw enum values
**File(s):** apps/web/src/routes/app/dashboard.tsx:133-134
**Issue:** Displays raw values like `clinic / trialing`. Not localized or humanized. Marketing copy uses "Clinic".
**Fix:** Format via a helper that maps to display names (Essentials, Clinic, Group, Compliance Ops) and status labels (Trialing, Active, Past Due).

### [P2] [STATES] FirstRunBanner steps 2 & 3 are visually disabled but the user has no idea why they unlock
**File(s):** packages/knowledge/src/app.ts:108-134, apps/web/src/components/help-guidance.tsx:651-684
**Issue:** "Invite a teammate" and "Review your Privacy Policy" render with 60% opacity and `aria-disabled`. No tooltip, no "Available after step 1" badge. A new admin sees grayed-out steps with no explanation.
**Fix:** Add a "Locked - finish step 1 first" subtitle, or make them clickable links that simply happen later.

### [P2] [DUPLICATE] `getDueState` helper is reimplemented in tasks.tsx and tasks.$taskId.tsx
**File(s):** apps/web/src/routes/app/tasks.tsx:62-74, apps/web/src/routes/app/tasks.$taskId.tsx:135-147
**Issue:** Two identical functions. CLAUDE.md "Engineering Standards" explicitly calls out DRY. Should live in `apps/web/src/lib/task-display.ts` next to `STATUS_BADGE` / `PRIORITY_BADGE`.
**Fix:** Extract.

### [P2] [DUPLICATE] `buildSearchParams` helper in tasks.tsx is dead-ish - only used inside the hard-nav handler that itself should be replaced
**File(s):** apps/web/src/routes/app/tasks.tsx:371-384
**Issue:** Once the location filter is moved to router navigation (see P0 above), this helper becomes dead code.
**Fix:** Remove with that change.

### [P2] [SEO/META] None of the in-app routes set `<title>` / meta - fine for an authed app, but the browser tab on `/app/dashboard` and `/app/tasks` shows the root layout title
**File(s):** apps/web/src/routes/app/dashboard.tsx, tasks.tsx, reports.*.tsx, help.tsx
**Issue:** Switching between dashboard and tasks shows the same browser-tab title. Admins with many tabs cannot tell them apart.
**Fix:** Use `<head>` per route or the router `head` option to set distinct titles.

### [P2] [CONTENT] Help support callout always shows "Need a person to help?" with email-only path - no phone, no in-app chat, no link to /app/help search
**File(s):** apps/web/src/components/help-guidance.tsx:102-126
**Issue:** Single-channel support. PHIGuard positions itself as a hands-on partner - email-only feels thin.
**Fix:** Add chat or phone path if available; otherwise call this out intentionally ("Email-only support; replies within X business hours") so expectations are set.

---

Audit complete. 38 findings across Dashboard, Tasks list/detail/new, Reports index/compliance/tasks, and Help - one P0 (hard navigation in tasks list), 19 P1, 18 P2.
