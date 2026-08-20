# PHIGuard Frontend Triage Plan

Consolidated fix plan derived from audits 01-06. Bundles below have **disjoint write scope** so they can be executed in parallel within each wave. Dependencies between waves are explicit. Cross-references use the form `[NN §"Section Title"]`.

**Source audits:**
- `01-marketing.md` (47 findings)
- `02-shell-auth.md` (38 findings)
- `03-compliance.md` (56 findings)
- `04-dashboard-tasks-reports.md` (38 findings)
- `05-billing-settings-onboarding.md` (38 findings)
- `06-shared-ui-design-system.md` (38 findings)

**Bundle totals:** Wave A: 8 · Wave B: 9 · Wave C: 10 · Wave D: 6 · **Total: 33 bundles**

---

## WAVE A - Critical fixes & cross-cutting cleanup

Run in parallel. All P0s, fabrication risk, hard-nav, dead code, and brand-voice sweep.

### A1 - Banned-jargon sweep: marketing pages
**Files (DISJOINT):**
- `apps/marketing/src/pages/learn/index.astro`
- `apps/marketing/src/pages/hipaa.astro`
- `apps/marketing/src/pages/trust.astro`
- `apps/marketing/src/pages/compare.astro`
- `apps/marketing/src/pages/alternatives/index.astro`
- `apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro`
- `apps/marketing/src/pages/locations/hipaa-breach-notification/[slug].astro`
- `apps/marketing/src/pages/locations/hipaa-compliance-software/[slug].astro`
- `apps/marketing/src/pages/practice-types/index.astro`
- `apps/marketing/src/pages/practice-types/[slug].astro`
- `apps/marketing/src/pages/resources/[slug].astro`
- `apps/marketing/src/lib/internal-links.ts`

**Findings:** [01 §"Page title and meta use banned jargon"], [01 §"workflow/workflows jargon across product/marketing pages"], [01 §"Banned jargon in nav resources mega menu"]

**Guidance:** Replace every occurrence of "workflow(s)" with healthcare-admin language: "operations", "procedures", "recurring tasks", "evidence cadence", "operating layer". Update `<title>`, meta descriptions, visible headings, body prose, and the `noticeOfPrivacyPractices` constant context. Update `internal-links.ts` resources-mega-menu label "PHI Workflows" → "PHI procedures". After substitution, run the `stop-slop` then `humanizer` skills per CLAUDE.md.

**Verify:** `rg -i "workflow" apps/marketing/src/pages apps/marketing/src/lib/internal-links.ts` returns zero matches. Visual spot-check on `/learn`, `/hipaa`, `/compare`, `/practice-types`.

---

### A2 - Banned-jargon sweep: app shell & shared knowledge
**Files (DISJOINT from A1):**
- `apps/web/src/components/feature-gate.tsx`
- `apps/web/src/components/ai-cs-support.tsx`
- `apps/web/src/routes/app/tasks.$taskId.tsx` (string "Current workflow state" only - coordinate with C4)
- `apps/marketing/src/components/RelatedContent.astro`
- `packages/knowledge/src/app.ts` (lines ~529, 925 - "PHI-related workflows", "access review workflows")

**Findings:** [02 §"AI-CS warm-up message says workflow"], [02 §"Feature-gate fallback copy uses workflows"], [04 §"Current workflow state copy violates banned-jargon"], [04 §"FeatureGate upgrade prompt uses banned workflow(s) three times"], [05 §"Banned jargon workflows / workflow in shipped UI"], [06 §"Banned word workflow appears in shipped UI copy"]

**Guidance:** In `feature-gate.tsx` rewrite labels: "calendar integrations and connected workflows" → "calendar integrations and connected actions"; "access review workflows" → "access review programs"; "workflow complexity" → "compliance program complexity". In `ai-cs-support.tsx` warm-up message swap "workflow" → "tasks, compliance work". In `RelatedContent.astro` default heading "More HIPAA software and workflow guides" → "More HIPAA software and operations guides". In `tasks.$taskId.tsx` SummaryMetric detail "Current workflow state" → "Current task state". In `packages/knowledge/src/app.ts` rewrite the two strings using "PHI-related procedures" and "access review programs".

**Verify:** `rg -i "workflow" apps/web/src packages/knowledge/src apps/marketing/src/components/RelatedContent.astro` returns zero matches.

---

### A3 - Dead code & legacy artifact removal
**Files (DISJOINT):**
- `apps/web/src/routes/mock-docuseal/` (recursive delete)
- `apps/marketing/src/components/NewsletterSignup.astro` (delete OR mount intentionally - pick delete)
- `apps/marketing/src/layouts/LegalLayout.astro` (remove `.draft-notice` CSS rule)
- `packages/ui/src/components/stat-card.tsx` + entry in `packages/ui/src/index.ts`
- `apps/web/src/routes/app/tasks.tsx` (remove `buildSearchParams` helper - becomes dead with A6)

**Findings:** [02 §"mock-docuseal/api directory remains"], [01 §"NewsletterSignup component is unreferenced"], [01 §".draft-notice style defined but never used"], [06 §"StatCard exported but unused"], [06 §"mock-docuseal empty directories"], [04 §"buildSearchParams helper is dead-ish"]

**Guidance:** `git rm -r apps/web/src/routes/mock-docuseal/`. Delete `NewsletterSignup.astro` (no production callers; only test refs - remove tests too). Strip the unused `.draft-notice` CSS block from `LegalLayout.astro`. Remove `stat-card.tsx` and its export from `packages/ui/src/index.ts`. Remove `buildSearchParams` from `tasks.tsx` (depends on A6 hard-nav fix landing first within the same wave - sequence A6 → A3 if same agent).

**Verify:** `rg -i "docuseal" apps/web/src packages/` returns only the immutable migration `packages/db/drizzle/0007_baa_envelopes.sql`. `rg "StatCard|NewsletterSignup|draft-notice|buildSearchParams" apps/ packages/` returns no live references.

---

### A4 - JSON-LD author fabrication + dead internal link
**Files (DISJOINT):**
- `apps/marketing/src/lib/seo.ts`
- `apps/marketing/src/lib/internal-links.ts` (only the `noticeOfPrivacyPractices` export and its callers - coordinated with A1's nav-label change; A1 only edits the resources mega menu label)
- `apps/marketing/src/pages/contributors/[slug].astro`

**Findings:** [01 §"JSON-LD author fabrication default in seo.ts"], [01 §"Dead internal link /notice-of-privacy-practices"], [01 §"contributors/[slug] labels every sameAs URL as LinkedIn"]

**Guidance:** In `seo.ts buildArticleSchema` remove the "Angel Campa" + LinkedIn `sameAs` default. Make `authorName`/`authorUrl` required OR default to an `Organization` author block (`PHIGuard Editorial`). In `internal-links.ts` either delete `noticeOfPrivacyPractices` (audit callers first; remove all if no page is shipped) or scaffold the page; prefer removal since no page exists. In `contributors/[slug].astro` derive label from URL hostname (`new URL(href).hostname`): map `linkedin.com`→LinkedIn, `twitter.com|x.com`→X, `github.com`→GitHub, `orcid.org`→ORCID, else hostname.

**Note:** A1 touches `internal-links.ts` for the mega-menu LABEL only (string change). A4 touches the `noticeOfPrivacyPractices` export. Coordinate by having A1 land first; A4 then edits in same file without conflict.

**Verify:** `rg "Angel Campa|angelcampa1" apps/marketing/src` returns zero hits outside contributor JSON. `rg "notice-of-privacy-practices" apps/marketing/src` returns zero.

---

### A5 - product.astro repeated-bullet bug
**Files (DISJOINT):** `apps/marketing/src/pages/product.astro`

**Findings:** [01 §"product.astro repeats pillar.detail under every bullet"]

**Guidance:** Inside the `pillar.bullets.map(...)` block, remove the duplicate `<p>{pillar.detail}</p>` rendered per-bullet. Render `pillar.detail` ONCE above the bullet list (preferred), or extend the data model so each bullet carries its own description (heavier change - defer).

**Verify:** Visit `/product`; each bullet shows a unique label only; the pillar description appears once.

---

### A6 - Hard-navigation → router navigation (app routes)
**Files (DISJOINT):**
- `apps/web/src/routes/app/tasks.tsx` (location-scope `<select>` handler only - A3 removes `buildSearchParams` after this lands)
- `apps/web/src/routes/app/tasks.new.tsx`
- `apps/web/src/routes/app/help.tsx`
- `apps/web/src/routes/app/compliance/checklists.index.tsx` (filter select `window.location.assign`)
- `apps/web/src/routes/app/compliance/policies/index.tsx` (filter select `window.location.assign`)

**Findings:** [04 §"Tasks list mutates URL with window.location.assign"], [04 §"tasks.new.tsx posts then hard-navigates"], [04 §"Help page small-screen category select uses window.location.href"], [03 §"Per-location filter selects use window.location.assign"]

**Guidance:** Replace every `window.location.assign(...)` / `window.location.href = ...` with `useNavigate()` + `navigate({ to, search, params })`. For `tasks.new.tsx` after successful create, call `navigate({ to: '/app/tasks/$taskId', params: { taskId }, search: { locationId } })` then `router.invalidate()` to refresh the list cache. For `help.tsx` mobile category select, sync to `Route.useSearch()`. Pattern reference: dashboard location switcher at `dashboard.tsx:155-164`.

**Verify:** `rg "window\.location\.(assign|href\s*=)" apps/web/src/routes` returns zero matches (excluding intentional sign-out flows). Manual: change tasks location filter, observe no full reload.

---

### A7 - `window.location.reload()` → `router.invalidate()` sweep (compliance/SOC2/partners)
**Files (DISJOINT from A6):**
- `apps/web/src/routes/app/compliance/checklists.index.tsx` (line ~123 reload - distinct from A6 filter-select)
- `apps/web/src/routes/app/compliance/policies/index.tsx` (lines ~127, 152 reloads)
- `apps/web/src/routes/app/compliance/program.policies.tsx`
- `apps/web/src/routes/app/compliance/program.policies.$policyId.tsx`
- `apps/web/src/routes/app/compliance/program.risk.tsx`
- `apps/web/src/routes/app/compliance/program.training.tsx`
- `apps/web/src/routes/app/compliance/program.vendors.tsx`
- `apps/web/src/routes/app/soc2.access-reviews.index.tsx`
- `apps/web/src/routes/app/soc2.access-reviews.$reviewId.tsx`
- `apps/web/src/routes/app/admin.partners.tsx`

**Findings:** [03 §"window.location.reload() discards transient state across all mutations"], [03 §"Access review detail: closing handler reloads, losing the success notice"], [05 §"window.location.reload() after partner approve / mark-paid"]

**Note:** A6 and A7 both touch `compliance/checklists.index.tsx` and `compliance/policies/index.tsx`. **Sequence A6 first, then A7** (or merge into one bundle if same agent). Treat as serial within same agent.

**Guidance:** Replace every `window.location.reload()` after mutations with `await router.invalidate()` (TanStack Start). Reference pattern at `soc2.evidence.tsx:175,268`. Preserve `setNotice(...)` success banners - they now remain visible after invalidate. Snapshot any state variables read in toast text BEFORE the `await` (see `soc2.access-reviews.$reviewId.tsx:73`).

**Verify:** `rg "window\.location\.reload" apps/web/src` returns zero. Run a mutation in each affected route; confirm success notice persists.

---

### A8 - SOC2 evidence manual-key footgun
**Files (DISJOINT):** `apps/web/src/routes/app/soc2.evidence.tsx`

**Findings:** [03 §"Soc2 evidence Record uploaded evidence key accepts arbitrary user input"]

**Guidance:** Delete the `fileKey` text input and its helper paragraph (lines ~400-415). The presigned upload above it already populates the key automatically. Require all manual evidence to go through the upload path. Remove any now-unused state / server-fn argument shaping. Leaves the BAA helper text (sep. finding in Wave component cleanup pass - coordinate by not touching the "your organization's SOC 2 evidence prefix" copy here).

**Verify:** `/app/soc2/evidence` renders no free-text fileKey input; manual evidence flow still works via upload.

---

## WAVE B - States, primitives, navigation integrity

Run in parallel after Wave A. Adds missing nav links, primitives, error/loading/empty states, error boundaries.

### B1 - Add missing primitives to `@phiguard/ui`
**Files (DISJOINT):** `packages/ui/src/components/` (new files), `packages/ui/src/index.ts`, `packages/ui/package.json`

**New components to scaffold (via shadcn CLI under brand theme):**
- `select.tsx` (Radix Select)
- `checkbox.tsx`
- `dropdown-menu.tsx`
- `tooltip.tsx`
- `alert-dialog.tsx`
- `skeleton.tsx`
- `spinner.tsx`
- `status-panel.tsx` (loading | empty | error variants composing Card + Button)

**Findings:** [06 §"No Select primitive"], [06 §"No Checkbox primitive"], [06 §"No RadioGroup, Switch, DropdownMenu, Popover, Tooltip, Toast, AlertDialog, Accordion, Separator, Sheet, Avatar, ScrollArea primitives"], [06 §"No shared Skeleton/Spinner primitive"], [06 §"EmptyState is the only shared empty-state - no error/empty/loading triad"]

**Guidance:** Scaffold each via shadcn under `packages/ui/src/components/`, theme to brand tokens, export from `index.ts`. Also fix `packages/ui/package.json` exports map to add `"./web-theme.css"`. Defer RadioGroup, Switch, Popover, Toast, Accordion, Separator, Sheet, Avatar, ScrollArea unless time permits - listed primitives unblock all Wave C/D consumers.

**Verify:** `pnpm --filter @phiguard/ui build && pnpm --filter @phiguard/ui test`. Confirm export `@phiguard/ui/web-theme.css` resolves.

---

### B2 - Consolidate Dialog primitive & migrate hand-rolled modals
**Files (DISJOINT - depends on B1 NOT, can run parallel since uses existing `Dialog`):**
- `packages/ui/src/components/dialog.tsx` (fix z-index tokens, define enter/exit keyframes)
- `apps/web/src/components/help-guidance.tsx` (HelpDrawer, ConfirmActionDialog)
- `apps/web/src/components/new-task-modal.tsx`

**Findings:** [06 §"Four hand-rolled Dialog/Modal implementations bypass @phiguard/ui Dialog"], [06 §"Dialog exported but unused"], [06 §"Four hand-rolled focus traps risk drift"], [06 §"Dialog references animations that aren't defined"], [06 §"Z-index numbers hand-picked in Dialog"], [02 §"useModalKeyboard focus-trap logic exists in both help-guidance and new-task-modal"]

**Guidance:** In `dialog.tsx`: replace `z-[300]`/`z-[400]` with `z-[var(--phig-z-overlay)]` / `z-[var(--phig-z-modal)]`; add `@keyframes enter`/`exit` in `web-theme.css` (coordinate w/ Wave global cleanup pass). Migrate the three modals to `Dialog`, `DialogContent`, `DialogOverlay`. Remove local `getFocusableElements`/`useModalKeyboard` duplicates. Apply same migration to mobile-nav focus trap in `app.tsx` (B3).

**Verify:** Open each modal, confirm focus traps, ESC closes, return-focus works. `rg "getFocusableElements" apps/web/src` returns zero.

---

### B3 - Shell nav additions: Admin, Compliance Overview, Incidents, SOC2 sub-nav
**Files (DISJOINT):**
- `apps/web/src/routes/app.tsx` (Sidebar block, mobile-nav focus-trap aria wiring, single sign-out unification, org-switcher breakpoint, skip-link, mobile-nav `id`/`tabIndex`)

**Findings:** [02 §"/app/admin/partners is fully implemented but completely hidden"], [02 §"/app/compliance (index) has no sidebar link"], [02 §"/app/compliance/incidents has no sidebar link"], [02 §"SOC 2 sub-pages collapse to a single nav entry"], [02 §"Two visually-identical Sign out buttons"], [02 §"Mobile-nav focus-trap will crash if mobile nav opens before nav data loads"], [02 §"Mobile menu button does not move focus when nav opens"], [02 §"AppLayout header has no role=banner and main no skip-link target"], [02 §"Sidebar uses fixed md:w-60 - mid-width unbalanced"], [02 §"Org switcher silently shows empty options while loading"]

**Guidance:** Add conditional `<NavSection label="Admin">` gated on system-admin role with `Admin → Partners` link. Add `<NavLink to="/app/compliance">Overview</NavLink>` and `<NavLink to="/app/compliance/incidents" icon={AlertTriangle}>Incidents</NavLink>` in Compliance section. Add sub-nav reveal pattern under SOC 2 when `pathname.startsWith('/app/soc2')` mirroring `complianceOpen`. Replace dual sign-out with a single account menu (avatar → Profile / Org settings / Sign out) using new `DropdownMenu` primitive (B1). Skip-link at top: `<a className="sr-only focus:not-sr-only" href="#main">Skip to main content</a>`. Add `id="main"` on `<main>`, `role="banner"` on header, `id="mobile-nav"` + `tabIndex={-1}` on dialog, `aria-expanded` / `aria-controls` on hamburger. Drop `lg:` to `md:` for sidebar + org switcher visibility. Add `<option disabled>Loading…</option>` in org switcher while `navState === null`.

**Verify:** Tab from page top reaches "Skip to main content". Admin partners visible only for system-admins. Resize 900-1100px: sidebar + org switcher present. Mobile nav opens, focus moves inside, ESC closes.

---

### B4 - Auth flows: SPA navigation + brand header + error states
**Files (DISJOINT from B3):**
- `apps/web/src/routes/login.tsx`
- `apps/web/src/routes/signup.tsx`
- `apps/web/src/routes/signup.check-email.tsx`
- `apps/web/src/routes/forgot-password.tsx`
- `apps/web/src/routes/accept-invite.$invitationId.tsx`
- `apps/web/src/components/brand-header.tsx`
- `apps/web/src/routes/__root.tsx` (wrap `<Outlet />` in `<main>` landmark)
- `apps/web/src/routes/partner.dashboard.tsx`

**Findings:** [02 §"Auth pages use raw <a href> instead of <Link>"], [02 §"login.tsx uses window.location.href = redirectPath"], [02 §"Brand header in authed-adjacent pages links to public marketing site"], [02 §"Login Google OAuth fails silently when result.data?.url is missing"], [02 §"forgot-password never re-enables submit after success"], [02 §"accept-invite shows no loading/error state if getSessionFn throws"], [02 §"accept-invite does not validate signed-in email matches"], [02 §"partner.dashboard.tsx uses typeof window at render - hydration mismatch"], [02 §"Partner dashboard has no error state"], [02 §"__root.tsx Outlet renders inside <body> with no <main> landmark"]

**Guidance:** Replace all internal `<a href="/...">` with TanStack `<Link to="/...">`. Reserve `<a>` for external + `mailto:`. In `login.tsx`/`signup.tsx`: replace `window.location.href = redirectPath` with `navigate({ to: redirectPath })` after org-switch; when Google OAuth returns no `url`, surface error inline instead of looping. In `brand-header.tsx`: `<Link to="/">` not `https://phiguard.app`. In `accept-invite`: try/catch `getSessionFn`; add `getInvitationPreviewFn(invitationId)` server-fn to load invited email; display "Invited as foo@clinic.com" before action. In `forgot-password`: add "Resend" / "Use a different email" action. In `__root.tsx`: wrap `<Outlet />` in `<main id="main">`. In `partner.dashboard.tsx`: compute `referralUrl` in `getPartnerDashboardFn` server-side from request origin, render directly (kills hydration mismatch); wrap loader try/catch with partner-specific error card.

**Verify:** No full reloads between auth pages. `accept-invite` shows invited email pre-acceptance. Partner dashboard's `<code>` block shows full URL on first paint, no flicker.

---

### B5 - Error boundaries on app data routes
**Files (DISJOINT):**
- `apps/web/src/components/compliance-error-boundary.tsx` (NEW - shared)
- `apps/web/src/routes/app/dashboard.tsx`
- `apps/web/src/routes/app/compliance/index.tsx`
- `apps/web/src/routes/app/compliance/program.index.tsx`
- `apps/web/src/routes/app/soc2.index.tsx`
- `apps/web/src/routes/app/reports.index.tsx`
- `apps/web/src/routes/app/reports.compliance.tsx`
- `apps/web/src/routes/app/reports.tasks.tsx`
- `apps/web/src/routes/app/tasks.tsx`

**Findings:** [03 §"Loaders throw on non-FeatureGate errors with no error boundary"], [04 §"Dashboard has no error/loading state for beforeLoad failure"], [04 §"Reports pages have no loading state"], [04 §"Tasks list has no loading skeleton"]

**Guidance:** Create `ComplianceErrorBoundary` using new `StatusPanel` (B1, variant=error) with "Try again" button calling `router.invalidate()` and "Back to dashboard" link. Add `errorComponent: ComplianceErrorBoundary` and `pendingComponent` (Skeleton list) + `pendingMs: 200` to each route. Make sure existing `FeatureGateError` catch logic in loaders still rethrows recognized errors so that gates render normally.

**Verify:** Kill DB connection, navigate to each route, confirm branded error panel with retry - not framework default fallback.

---

### B6 - Loading + empty states: members / locations / integrations / partners
**Files (DISJOINT from B5):**
- `apps/web/src/routes/app/settings.members.tsx`
- `apps/web/src/routes/app/settings.locations.tsx`
- `apps/web/src/routes/app/settings.integrations.tsx`
- `apps/web/src/routes/app/admin.partners.tsx`

**Findings:** [05 §"Members page: no loading state, no empty state"], [05 §"Locations page: no loading state, no error boundary"], [05 §"Integrations page: loading state renders header only"], [05 §"Integrations: no token-expiry / refresh-failure state"], [05 §"Partners admin: no loading state, no skeleton"], [05 §"Integrations: no connections yet empty state"]

**Guidance:** Wrap initial-fetch sections in `Skeleton` (B1) while `state === null`. Add explicit empty-state copy using `EmptyState`/`StatusPanel` distinct from loading. In integrations: distinguish "org not selected" from "load error"; add "last refreshed" + "needs re-auth" surfaces if connection metadata supports it. Strip integrations callback `?status=` query after consumption via `router.navigate({ search: { ... } })`. Replace integrations active-connection green badge with status-mapped variant (warning for `expired`, danger for `error`/`revoked`).

**Verify:** Throttle network to slow-3g; reload each page; see skeletons → content. Empty org renders explicit empty-state copy.

---

### B7 - Audit log: initial load + UUID validation + states
**Files (DISJOINT):**
- `apps/web/src/routes/app/audit/index.tsx`
- `apps/web/src/routes/app/audit/export.tsx`

**Findings:** [03 §"Audit page: no initial load"], [03 §"Audit page: actorId, resourceId UUID validation missing"], [03 §"Audit page summary metrics computed from in-memory loaded events only"]

**Guidance:** Auto-fetch most-recent 50 events on mount via `useEffect`; show `Skeleton` (B1) while pending. Add UUID regex (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) validation with inline `aria-invalid` hint for `actorId`/`resourceId`. Clarify metric label to "Events loaded (N of approx M)" where M is server-reported total if available; otherwise label "Events on this page". (Filter additions deferred to C9.)

**Verify:** First visit shows recent events with skeleton swap. Typing "abc" into UUID input shows inline error.

---

### B8 - SOC2 evidence state cleanup + Soc2 controls cross-nav
**Files (DISJOINT from A8):** `apps/web/src/routes/app/soc2.evidence.tsx`

**Findings:** [03 §"Soc2 evidence: download error doesn't reset when user retries"], [03 §"Soc2 evidence Bundle ready alert never auto-dismisses"], [03 §"Soc2 evidence: Back to SOC 2 link, but no link to specific control"]

**Note:** A8 also touches this file - sequence A8 → B8 if same agent.

**Guidance:** Clear `downloadError` when any other action runs (mutation, refresh). Show expiry countdown / timestamp on "Bundle ready" alert; auto-dismiss after 15 min. When route has `?controlId=...` in search, add "Back to controls" link in addition to "Back to SOC 2".

**Verify:** Trigger download failure, then action; error clears. Open evidence with controlId query; both back-links present.

---

### B9 - Marketing fetch states: PromoBanner + LaunchPhaseProgress
**Files (DISJOINT):**
- `apps/marketing/src/components/PromoBanner.astro` (loading + error states ONLY - token fixes in Wave color-token pass)
- `apps/marketing/src/components/LaunchPhaseProgress.astro` (loading + error + env-derived origin)
- `apps/marketing/src/pages/unsubscribe.astro` (branch on 4xx vs 5xx for proper error copy)

**Findings:** [01 §"PromoBanner / launch progress lack loading + error states"], [01 §"LaunchPhaseProgress hardcodes production API URL"], [01 §"Unsubscribe page only handles loading/success/expired"]

**Guidance:** Add skeleton shimmer while promotion fetch in flight; visible (quiet) fallback message on error. In `LaunchPhaseProgress.astro` replace `https://my.phiguard.app/api/marketing/promotion` literal with `import.meta.env.PUBLIC_APP_URL` / `PHIGUARD_APP_ORIGIN` consistent with `unsubscribe.astro`. In `unsubscribe.astro` branch on `res.status`: 4xx → "Link expired or invalid"; 5xx/network → "Transient error - try again" with retry button.

**Verify:** Set bad PUBLIC_APP_URL: promo banner shows error state, not blank. Unsubscribe with 500: shows retry; with 410: shows expired.

---

## WAVE C - Feature completeness

Depends on Wave B (Dialog, Skeleton, StatusPanel, Select, Checkbox, AlertDialog).

### C1 - Compliance CRUD: Policies (versioning, archive)
**Files (DISJOINT):**
- `apps/web/src/routes/app/compliance/program.policies.tsx`
- `apps/web/src/routes/app/compliance/program.policies.$policyId.tsx`
- `apps/web/src/server/compliance/policies.ts` (or equivalent server fns)

**Findings:** [03 §"Policies cannot be edited after publish, archived, or version-bumped"], [03 §"Policy markdown body has no preview, no syntax help"], [03 §"Policy draft/published/archived badge variants disagree"], [03 §"No dirty-warn on long-form editors" (policies portion)]

**Depends on:** B2 (Dialog for "New version" confirmation).

**Guidance:** Add server fns `createPolicyVersionFn(policyId)` (forks new draft from current body) and `archivePolicyFn(policyId)`. Add UI buttons "Create new version" and "Archive" on published-policy detail page. Add real markdown preview tab (use `react-markdown` or rename label to "Body" plainly). Standardize status badge map across both files (`draft: warning, published: success, archived: default`). Add beforeunload dirty-warn guard on long-form editor.

**Verify:** Publish a policy; "Create new version" produces editable draft; "Archive" sets status archived and renders correct badge.

---

### C2 - Compliance CRUD: Vendors, Training, Risk, Checklists, Incidents
**Files (DISJOINT from C1):**
- `apps/web/src/routes/app/compliance/program.vendors.tsx` (edit, reactivate, BAA history, BAA date validation)
- `apps/web/src/routes/app/compliance/program.training.tsx` (unassign, reassign, edit due date, reactivate, reopen completion)
- `apps/web/src/routes/app/compliance/program.risk.tsx` (reopen/rename/delete assessments, edit-as-drawer, score preview, clear-owner sentinel, confirm dialogs)
- `apps/web/src/routes/app/compliance/checklists.index.tsx` (archive, rename, delete)
- `apps/web/src/routes/app/compliance/checklists.$checklistId.tsx`
- `apps/web/src/routes/app/compliance/incidents/$incidentId.tsx` (edit fields + append-only notes)
- `apps/web/src/routes/app/compliance/incidents/index.tsx`
- `apps/web/src/routes/app/compliance/incidents/new.tsx` (single-location auto-bind, dirty warn, PHI guard)
- `apps/web/src/server/compliance/*` server fns as needed

**Findings:** [03 §"Vendors cannot be edited after creation"], [03 §"Vendor BAA history cannot be viewed or edited"], [03 §"Training: no unassign / reassign / due-date edit"], [03 §"Incidents cannot be edited"], [03 §"Checklists cannot be archived, renamed, or deleted"], [03 §"Risk assessments cannot be reopened, renamed, or deleted"], [03 §"Risk items: ownerId reset"], [03 §"Risk item edit form is inline-expanded inside a table cell"], [03 §"Risk item form doesn't preview computed score"], [03 §"Incident new form: location select"], [03 §"Vendor add: website not validated"], [03 §"BAA expiresAt: no validation"], [03 §"Vendor Mark inactive has no confirm dialog"], [03 §"Course Deactivate has no confirm dialog"], [03 §"Delete risk item button has no confirm"], [03 §"Risk page: notice is never set"], [03 §"No dirty-warn on long-form editors" (risk, incident)], [03 §"Incident summary textarea has no client guard against names/MRNs"]

**Depends on:** B1 (AlertDialog for confirms; Dialog/Sheet for risk-edit drawer; Select for filters).

**Guidance:** Add edit forms / drawers backed by new server fns. Vendors: edit name/website/contactEmail/dataCategories + reactivate; expose BAA history list + edit metadata of latest active. Training: cancel/reassign/edit due date + reactivate course + reopen completion. Risk: assessment reopen/rename/delete; move per-item edit into Dialog/Sheet (B1) showing live `score = likelihood * impact` with band label; add "Unassigned" sentinel distinct from "no change". Checklists: archive/rename/delete actions on detail. Incidents: edit descriptive fields with audit-trail entries; add `incident_updates` append-only notes list. For incidents/new: when `scope.locations.length === 1`, auto-bind `locationId = scope.locations[0].id` and display "Reporting for: {Name}". Add PHI shape detector (`detectPhiShape(text)`: SSN regex `\d{3}-?\d{2}-?\d{4}`, MRN tokens, DOB shapes); gate submit on explicit acknowledgement checkbox. Use AlertDialog for all destructive single-clicks (vendor inactive, course deactivate, risk delete, "Send to review"). Wire `beforeunload` + TanStack router `useBlocker` for unsaved long-form editors. Add success `notice` state in risk page. Validate BAA `expiresAt > signedAt`; warn when `expiresAt` missing. Normalize website URL (lowercase, prefix `https://`).

**Verify:** Each CRUD path round-trips; destructive actions surface confirm; risk score preview updates live; PHI guard blocks submit when SSN pattern present.

---

### C3 - Tasks list/detail: sort, pagination, bulk, filters, edits, delete
**Files (DISJOINT from C2):**
- `apps/web/src/routes/app/tasks.tsx`
- `apps/web/src/routes/app/tasks.$taskId.tsx`
- `apps/web/src/server/tasks.ts` (or equivalent - `listTasksFn`, new `updateTaskFn`, `archiveTaskFn`)
- `apps/web/src/lib/task-display.ts` (NEW - extract shared helpers)

**Findings:** [04 §"Tasks list has no pagination, no server-side filter, no sort"], [04 §"Tasks list has no bulk actions"], [04 §"Tasks list cards have no priority sort"], [04 §"Tasks list location filter hidden on single-location orgs"], [04 §"Task detail has no edit affordance for title, description, priority"], [04 §"Task detail has no delete/archive"], [04 §"Task detail Back to tasks loses status filter"], [04 §"Task detail attachment list shows raw sizeBytes"], [04 §"Task detail Refresh scan status only renders when attachments exist"], [04 §"Task detail status select triggers async update on every change with no confirmation"], [04 §"Task detail due-date Clear button does not submit"], [04 §"Task detail badge groups duplicate STATUS/PRIORITY"], [04 §"Task detail attachment list does not differentiate ready vs infected"], [04 §"getDueState helper is reimplemented in tasks.tsx and tasks.$taskId.tsx"]

**Depends on:** B1 (Checkbox for bulk, AlertDialog for done-confirm + delete, Select).

**Guidance:** Extend `listTasksFn` for server-side `sort`, `page`/`pageSize`, `assigneeId` filter. Add sortable column headers. Default order `(status != done, overdue desc, priority desc, dueAt asc)`. Add row checkboxes + bulk action bar (assign, status change) writing through audit trail. Show active-location pill near header even in single-location scope. Add edit Dialog wired to new `updateTaskFn` (title/description/priority). Add `archiveTaskFn` (soft-delete, hides from default list, preserves audit). Preserve `status`/`locationId` on "Back to tasks". Format attachment size via `humanFileSize()` (add helper to `apps/web/src/lib/format.ts`); map MIME to friendly label. Refresh-scan button always visible after at least one upload attempt; auto-poll pending scans with exponential backoff. Confirm "done" status transitions via AlertDialog (B1). "Clear" button on due-date should submit (or visually indicate dirty). Remove duplicate status/priority badges from meta strip. Inline help per `avStatus` (Pending/Clean/Infected → explanation). Extract `getDueState` to `apps/web/src/lib/task-display.ts`; remove duplicates.

**Verify:** Sort/paginate/bulk-update tasks; edit title; archive; observe filter preserved on back; attachment shows "376 KB" not "384721 bytes".

---

### C4 - Reports: export, sort, drill-down, layout, breadcrumb
**Files (DISJOINT from C3):**
- `apps/web/src/routes/app/reports.tsx`
- `apps/web/src/routes/app/reports.index.tsx`
- `apps/web/src/routes/app/reports.compliance.tsx`
- `apps/web/src/routes/app/reports.tasks.tsx`
- `apps/web/src/server/reports.ts` (export server fns)

**Findings:** [04 §"Reports.compliance.tsx wrapping container max-w-5xl vs full-width"], [04 §"Reports pages have no CSV/PDF export"], [04 §"Reports tables have no sort, no per-location drill-down"], [04 §"Reports index Open tasks tile counts but doesn't link"], [04 §"Reports.tsx is a bare <Outlet />"], [04 §"No breadcrumb on reports sub-pages"]

**Depends on:** B1 (Skeleton already in B5), Wave nav cleanup pass (Breadcrumbs consolidation - can land before or after; here use shared component).

**Guidance:** Make `reports.tsx` a real layout: wraps children in `max-w-5xl mx-auto` container + breadcrumb "Reports > {section}". Standardize sub-page containers. Add sortable columns (location, total/open/overdue/completed). Link location cells to filtered destinations (`/app/tasks?locationId=X&status=open`, `/app/compliance/checklists?locationId=X`). Add CSV + PDF export buttons in PageHeader actions; CSV via server-fn streaming, PDF via `pdf-lib`. Wrap index tiles in `<Link>` to drill destinations.

**Verify:** Export buttons produce valid CSV/PDF; column headers sort; clicking location row navigates to filtered list.

---

### C5 - Dashboard actionability + copy polish
**Files (DISJOINT from C4):**
- `apps/web/src/routes/app/dashboard.tsx`

**Findings:** [04 §"Dashboard summary metrics are not actionable"], [04 §"Dashboard location-breakdown rows are not clickable"], [04 §"Dashboard SummaryMetric for Active checklists warns when active > 0"], [04 §"Dashboard SummaryMetric tone for Active checklists treats active > 0 as warning"], [04 §"Dashboard description uses active workspace"], [04 §"Dashboard org-strip plan label is raw enum values"]

**Guidance:** Wrap each `SummaryMetric` tile in `<Link>` to `/app/tasks?status=open`, `/app/compliance/incidents`, `/app/compliance/checklists`, `/app/settings/members`. Wrap location-row cells in `<Link>` to filtered list views. Show `${active}/${total}` for Active checklists. Use `tone={active > 0 ? "brand" : "neutral"}`. Rewrite "active workspace" -> "your clinic". Format plan label via `PLAN_DISPLAY_NAMES[plan]` (Essentials/Clinic/Group, plus internal custom Compliance Ops) + status map (Trialing/Active/Past Due) - add to `apps/web/src/lib/plan-display.ts`.

**Verify:** Click each tile -> expected route. Plan label renders "Clinic / Trialing", not raw enum.

---

### C6 - Billing: invoices, payment method, dunning, confirm-block polish
**Files (DISJOINT from C5):**
- `apps/web/src/routes/app/billing.tsx`
- `apps/web/src/server/billing.ts` (add `listInvoicesFn`, `getPaymentMethodFn`, `getUpcomingInvoiceFn`)
- `apps/web/src/lib/billing-catalog.tsx` (fix confirm sentence + Y80OFF casing; remove dead `getPlanPriceDisplay`)

**Findings:** [05 §"Plan-display mismatch - confirm-block omits annual list total"], [05 §"Coupon code promo code rendered lowercase"], [05 §"Confirm-block uses effectiveMonthlyAmount even for monthly cadence"], [05 §"Billing: no in-app invoice / receipt list"], [05 §"Billing: no in-app dunning state surfaced beyond a single line"], [05 §"Billing: no payment-method display"], [05 §"Billing: confirm block omits BAA-included reassurance and plan member cap"], [05 §"Billing past-due / paused copy doesn't link to Stripe Portal"], [05 §"Billing: nextAction calc"], [05 §"Billing: legal-acceptance status section has no skeleton"], [05 §"Billing plan cards are interactive divs with no role/keyboard"], [05 §"Promo banner missing on billing page"], [05 §"Mix of Button and raw button (billing)"], [05 §"selectedPlan defaults to minimumPlanForUsage"], [05 §"formatPlanPrice and getPlanPriceDisplay overlap"]

**Depends on:** B1 (Skeleton).

**Guidance:** Add server fns: `listInvoicesFn` (Stripe `invoices.list` for last 12), `getPaymentMethodFn` (last4/brand/exp_month/exp_year), `getUpcomingInvoiceFn`. Render "Recent payments" panel and "Payment method on file" panel with brand+last4+exp. Replace `formatPlanPrice(...).detail.toLowerCase()` - preserve `Y80OFF` casing; sentence-case only first letter. Fix duplicate list-price in confirm sentence. Add explicit "billed annually"/"billed monthly" badges; never label two different numbers identically. Echo "BAA included at every tier" + `maxMembers` cap in confirm block. Show CommercialOfferNote across all plan states (not only "no active plan" branch). Add inline dunning info (next retry attempt, last-failed timestamp, "Resend invoice email" button). Convert plan card `<div onClick>` to `<button type="button">` with proper keyboard handling. Default `selectedPlan` to current plan (fallback to `minimumPlanForUsage`). When `!canManageBilling`, show "Ask an admin to update billing" copy instead of hiding CTA. Remove dead `getPlanPriceDisplay` from `billing-catalog.tsx`.

**Verify:** Stripe sandbox: invoices appear in list with download. Past-due triggers visible retry copy. Tab through plan cards via keyboard; Enter selects.

---

### C7 - Onboarding completeness
**Files (DISJOINT from C6):**
- `apps/web/src/routes/app/onboarding.tsx`
- `apps/web/src/lib/phase-two-flow.ts`

**Findings:** [05 §"Onboarding can finish with no plan recorded"], [05 §"Onboarding shows no plan picker"], [05 §"Onboarding has no resume affordance"], [05 §"Onboarding: Continue to dashboard button reuses handleAcceptAndStart"], [05 §"Onboarding: legalStatus === accepted redirect race"], [05 §"Onboarding sidebar says Last step on first visit"], [05 §"Onboarding: documentsLoadError and !canManageLegal can stack visually"]

**Depends on:** C6 plan-display helpers (or use existing `PUBLIC_PLAN_IDS` + `formatPlanPrice`).

**Guidance:** Add in-page plan picker (reuse `PUBLIC_PLAN_IDS` + `formatPlanPrice`). Block "Accept and start trial" until plan selected (or fall back to `essentials` with a visible note). Wire `?step=` URL search via `resolveInitialOnboardingStep`; render step indicator (1..5). Auto-resume `planStatus === 'trial_pending'` path. Replace "Continue to dashboard" button with plain `<Link>` when `legalStatus === 'accepted'`. Replace "Last step" copy with dynamic step label. Consolidate stacked red banners (single Alert summarizing all errors).

**Verify:** Land on `/app/onboarding` with no `?plan=`; UI requires picking a plan. Refresh mid-flow at step 3 → resumes at step 3.

---

### C8 - Settings: members + locations form polish
**Files (DISJOINT from C7):**
- `apps/web/src/routes/app/settings.members.tsx`
- `apps/web/src/routes/app/settings.locations.tsx`

**Findings:** [05 §"Members invite form: email field has no validation feedback"], [05 §"Members invite role select: blank-organization race"], [05 §"Members: last-admin protection not enforced in UI"], [05 §"Members Cancel button overloads the word cancel"], [05 §"Members: section header counts use array .length, no pagination"], [05 §"Members: ROLE_LABELS dictionary"], [05 §"Members Active members list role-change select"], [05 §"Members Open invite link anchor opens in same tab"], [05 §"Locations: 0-grants check uses client-side guard only"], [05 §"Locations: slug is read-only label only"], [05 §"Locations: name input rows have no label"], [05 §"Locations: status chip shows Primary regardless of actual status"]

**Depends on:** B1 (Checkbox if used; AlertDialog for role downgrade).

**Guidance:** Add email validation (regex + `aria-invalid` + inline error). Compute initial role from server response (no `useState` race). Add client-side last-admin guard: count `org_admin` members; disable remove/demote with tooltip when count === 1. Rename "Cancel" → "Cancel invitation"; rename dialog cancel → "Keep invitation". Inline error near failing grant checkbox row, not top-of-page. Add tooltip on slug clarifying immutability (or surface new slug after rename). Add proper `<label>` to location name inputs (create + edit). Show both: `{location.isPrimary ? 'Primary · ' : ''}{location.status}`. Add AlertDialog (B1) confirm for role downgrade.

**Verify:** Invalid email shows inline error. Last admin cannot demote self. Location row inputs announce label to screen reader.

---

### C9 - Audit log filters + export propagation
**Files (DISJOINT from B7):**
- `apps/web/src/routes/app/audit/index.tsx` (filters only - initial-load fix is in B7)
- `apps/web/src/routes/app/audit/export.tsx` (carry filters)
- `apps/web/src/server/audit.ts` (extend export filters)

**Findings:** [03 §"Audit log: no action filter, no free-text search, no resourceId fuzzy match"], [03 §"Audit export limited to 30-day default, no scoping by actor/resource/action"]

**Depends on:** B1 (Select), B7 (initial load already shipped).

**Note:** Both B7 and C9 edit `audit/index.tsx` - sequence B7 → C9.

**Guidance:** Add `action` enum dropdown (server-supplied), org-scoped actor email autocomplete, resource-type dropdown (server-enum), free-text `summary` search, "Clear filters" button, sort toggle. In export.tsx: read current filters from search/URL and propagate; show "estimated N rows" preview before submit; offer async email delivery when >50k rows; max-range guard.

**Verify:** Filter to a specific action; export carries filter; row count preview matches.

---

### C10 - Compliance / SOC2 tables: filters, search, sort, export
**Files (DISJOINT from C2/C9):**
- `apps/web/src/routes/app/compliance/incidents/index.tsx` (severity/status/category filters, search, export)
- `apps/web/src/routes/app/compliance/program.vendors.tsx` (BAA-state filter, vendor search)
- `apps/web/src/routes/app/compliance/program.training.tsx` (status/course/user filters, export)
- `apps/web/src/routes/app/compliance/program.risk.tsx` (sort by score, filter by owner)
- `apps/web/src/routes/app/soc2.evidence.tsx` (source filter, date range)
- `apps/web/src/routes/app/soc2.controls.tsx` ("missing evidence only" filter, search)
- `apps/web/src/routes/app/soc2.access-reviews.index.tsx` (filter, sort)
- `apps/web/src/routes/app/admin.partners.tsx` (filter/sort/search/pagination for partners + payouts)

**Note:** C2 edits many of the same files for CRUD. **Sequence C2 → C10** when same agent, or split such that C2 owns "mutations + forms" and C10 owns "table headers + filter bar" - both touch JSX but in different sections.

**Findings:** [03 §"Incidents: no severity/status/category filter"], [03 §"Vendors: no filter by BAA state"], [03 §"Training: no filter by status/course/user"], [03 §"Risk items: no filter by score/owner, no sort, no export"], [03 §"SOC 2 evidence: no filter by source"], [03 §"SOC 2 controls: no filter to missing evidence"], [03 §"Access reviews list: no filter, no sort"], [05 §"Partners + payouts tables: no sort/filter/search/pagination/export"]

**Depends on:** B1 (Select), C2 conflicts above.

**Guidance:** Add filter chip bar with Select primitives for each table's primary filter axis (severity, BAA-state, status, source, etc.). Add free-text search input filtering server-side. Add sortable column headers. Add CSV export buttons on tables called out (training, partners). For partners: paginate (page size 25) and add a "Search by code/email" input.

**Verify:** Each table with >0 rows reduces correctly under filter; clear filter restores; export downloads scoped CSV.

---

## WAVE D - Design system & token sweep

Depends on Wave B (primitives) and partially Wave C (no overlapping edits).

### Wave color-token pass - Token-ify marketing pages & components (hex → CSS variables)
**Files (DISJOINT):**
- `apps/marketing/src/pages/hipaa-software/index.astro`
- `apps/marketing/src/pages/locations/hipaa-compliance/index.astro`
- `apps/marketing/src/pages/locations/hipaa-breach-notification/index.astro`
- `apps/marketing/src/pages/locations/hipaa-breach-notification/[slug].astro`
- `apps/marketing/src/pages/locations/hipaa-compliance-software/index.astro`
- `apps/marketing/src/pages/locations/hipaa-compliance-software/[slug].astro`
- `apps/marketing/src/pages/resources/best/index.astro`
- `apps/marketing/src/pages/resources/guides/index.astro`
- `apps/marketing/src/pages/resources/guides/[slug].astro`
- `apps/marketing/src/pages/glossary/index.astro`
- `apps/marketing/src/pages/contributors/index.astro`
- `apps/marketing/src/layouts/LegalLayout.astro`
- `apps/marketing/src/pages/404.astro`
- `apps/marketing/src/pages/500.astro`
- `apps/marketing/src/components/PromoBanner.astro` (token fixes - distinct from B9 state fixes; can land sequenced after B9)
- `apps/marketing/src/components/LaunchPhaseProgress.astro` (token fixes - sequenced after B9)
- `apps/marketing/src/components/RelatedContent.astro`
- `apps/marketing/src/components/StateGuideArticle.astro`
- Remaining files in `apps/marketing/src/components/*.astro` containing raw hex
- `packages/ui/src/web-theme.css` / `packages/ui/src/tokens.css` (add missing tokens: `--phig-color-border-subtle`, semantic warning/notice tokens)
- `packages/ui/src/web-theme.css` (restore palette OR add ESLint `no-restricted-syntax` rule banning `bg-slate-*`/`bg-zinc-*` etc.)

**Findings:** [01 §"Hardcoded hex colors throughout pages instead of tokens"], [01 §"Promo banner fallback color is off-brand blue"], [01 §"404 / 500 pages use Tailwind text-blue-600"], [01 §"LegalLayout admonition contrast"], [01 §"resources/best uses identical color palette duplicated"], [06 §"NewsletterSignup uses blue #2563eb"] (only if NewsletterSignup not yet deleted per A3 - likely N/A), [06 §"PromoBanner blue fallback for teal token"], [06 §"LaunchPhaseProgress references a non-existent token"], [06 §"Marketing layout hard-codes raw hex"], [06 §"Raw-hex sprawl across 15 marketing components"], [06 §"Marketing global.css uses raw rgb() shadows"], [06 §"Tailwind v4 @theme resets non-brand color palettes"]

**Depends on:** B9 (state fixes on PromoBanner/LaunchPhaseProgress must land first).

**Guidance:** Replace every raw `#xxxxxx` and `rgb(...)` with `var(--phig-color-*)`. Add semantic tokens for warning/notice/admonition surfaces if missing. Fix PromoBanner fallback `#1Wave component cleanup passed8` → `#0f766e` (teal). Fix LaunchPhaseProgress `var(--phig-color-brand-400, #60a5fa)` → teal fallback; add `--phig-color-border-subtle` to tokens.css if needed. Swap `text-blue-600` on 404/500 → brand class. Replace raw `rgb(16 32 34 / 0.07)` shadows with `--phig-shadow-*` tokens. Add ESLint `no-restricted-syntax` rule for raw hex in `.astro`/`.css` (allowlist `pdf-tokens.ts`).

**Verify:** `rg "#[0-9a-fA-F]{6}" apps/marketing/src/pages apps/marketing/src/components apps/marketing/src/layouts` returns only files in allowlist (e.g., logo paths). Visual brand teal consistent across all touched pages.

---

### Wave global cleanup pass - Marketing CSS: `global.css` cleanup + reduced-motion + shared layout extract
**Files (DISJOINT from Wave color-token pass):**
- `apps/marketing/src/styles/global.css`

**Findings:** [06 §"Marketing global.css is 1,335 lines - bespoke design system"], [06 §"No prefers-reduced-motion handling in marketing animations"], [06 §"Marketing buttons rely on color contrast that has not been verified"]

**Depends on:** Wave color-token pass (token additions land first if needed).

**Guidance:** Audit `global.css`; replace remaining raw hex/rgb with tokens. Add global `@media (prefers-reduced-motion: reduce)` block disabling non-essential transitions. Run axe on representative pages and tune button-tertiary/utility-button contrast tokens. (Extracting Shell/Section/Hero primitives into `@phiguard/ui` is deferred - too risky for this sweep.) Add the `@keyframes enter`/`exit` keyframes here for B2's Dialog if not already present in `web-theme.css`.

**Verify:** `rg "rgb\(|#[0-9a-fA-F]{6}" apps/marketing/src/styles/global.css` returns zero. Reduced-motion macOS toggle disables marketing animations.

---

### Wave route cleanup pass - Unify button systems
**Files (DISJOINT from Wave global cleanup pass):**
- `apps/marketing/src/components/Button.astro` (NEW - Astro server-component emitting cva classes consistent with `@phiguard/ui` Button)
- `apps/marketing/src/components/CTA.astro` (use Button + swap to primary variant)
- `apps/web/src/routes/app.tsx` (replace bespoke pill + help button with `<Button>` from `@phiguard/ui`; uses new pill variant)
- `apps/web/src/components/ai-cs-support.tsx` (use `<Button>` + `<Textarea>` from `@phiguard/ui`)
- `apps/web/src/routes/app/admin.partners.tsx` ("Mark Paid" raw `bg-success-600` → Button variant)
- `apps/web/src/routes/app/billing.tsx` (replace `rounded-full` hand-rolled buttons with Button variants)
- `apps/web/src/routes/app/settings.members.tsx` (raw buttons → Button)
- `apps/web/src/routes/app/settings.locations.tsx`
- `apps/web/src/routes/app/settings.integrations.tsx`
- `packages/ui/src/components/button.tsx` (add `pill` size variant)

**Findings:** [01 §"CTA primary button renders the secondary style"], [02 §"New task pill button uses brand-700 directly"], [02 §"Help button in header uses raw button"], [05 §"Mix of Button and raw button"], [05 §"Admin partners: Mark Paid button uses bg-success-600 hardcoded"], [06 §"Marketing reimplements buttons as CSS classes"], [06 §"Bespoke buttons styled inline in app shell"]

**Depends on:** Wave color-token pass (tokens), B2 not strictly required.

**Note:** C5 (Dashboard) and C6 (Billing) touch some of the same files. **Sequence C5/C6 → Wave route cleanup pass** when same agent. Wave route cleanup pass keeps changes restricted to button JSX/classes only.

**Guidance:** Add `pill` size variant to `@phiguard/ui` Button. Build `apps/marketing/src/components/Button.astro` emitting same cva-derived class strings (compile-time). Migrate marketing `CTA.astro` to use Button with `variant="primary"` (fixes the "primary renders secondary" bug). Replace hand-rolled `<button bg-brand-700>` in app shell with `<Button variant="primary" size="pill">`. Replace `<button bg-success-600>` (admin.partners "Mark Paid") with `<Button variant="success">` (add variant if needed). Use `<Button>` / `<Textarea>` in `ai-cs-support.tsx`.

**Verify:** `rg 'rounded-full.*bg-brand-700|bg-success-600' apps/web/src` returns zero outside the Button component itself. Visual: marketing primary CTAs distinct from secondary.

---

### Wave component cleanup pass - Consolidate `Input`/`InputPrimitive`, `Textarea`/`TextareaPrimitive`, error fallbacks, BackLink, formatDate
**Files (DISJOINT from Wave route cleanup pass):**
- `packages/ui/src/components/input.tsx` (collapse twins → single component)
- `packages/ui/src/components/textarea.tsx` (collapse twins)
- `apps/web/src/components/error-fallback.tsx` (collapse three shells into one with variant)
- `apps/web/src/components/back-link.tsx` (NEW - extract canonical BackLink; replace ~9 reimplementations)
- All compliance/SOC2 routes consuming the old BackLink (limited to edit of import + JSX swap; coordinate with C2/C10 - sequence after them)
- `apps/web/src/lib/dates.ts` (ensure `formatDate` is canonical; remove local copy in `program.risk.tsx`)
- `packages/ui/src/components/metric.tsx` → rename file `summary-metric.tsx`; update `index.ts`
- `packages/ui/src/components/tabs.tsx` - delete if not adopted, OR wire on settings page tabs (defer adoption; delete for now)
- `apps/web/src/routes/app/soc2.evidence.tsx` (BAA helper text "your organization's SOC 2 evidence prefix" → "files previously uploaded for this organization")
- `apps/web/src/components/feature-gate.tsx` (refactor to compose EmptyState/StatusPanel `locked` variant)

**Findings:** [06 §"Input vs InputPrimitive drift"], [06 §"Textarea vs TextareaPrimitive drift"], [06 §"Three near-identical error fallback shells"], [03 §"BackLink reimplemented across nine files"], [03 §"Back-link styles vary across compliance pages"], [03 §"formatDate defined locally in program.risk.tsx"], [06 §"metric.tsx exports SummaryMetric, not Metric"], [06 §"Tabs exported but unused"], [03 §"BAA evidence helper text leaks storage architecture"], [06 §"feature-gate.tsx reimplements EmptyState pattern"]

**Depends on:** C2/C10 (which edit the same compliance/SOC2 route files for CRUD/tables). Sequence: C2 → C10 → Wave component cleanup pass ensures Wave component cleanup pass only edits import statements and BackLink JSX, no semantic conflicts.

**Guidance:** Merge `Input`/`InputPrimitive`: keep `Input`, accept `variant="unstyled"` for primitive case; update consumers' imports. Same for Textarea. Collapse `error-fallback.tsx` into one component with `variant: 'route'|'root'|'404'`. Extract canonical `<BackLink to label />` to `apps/web/src/components/back-link.tsx`; swap all reimplementations to import it. Remove local `formatDate` in `program.risk.tsx`; import from `lib/dates`. Rename `metric.tsx` → `summary-metric.tsx`; update `index.ts`. Delete `tabs.tsx` and its export (zero consumers). Refactor `feature-gate.tsx` to compose `EmptyState` (or `StatusPanel` with locked variant from B1). Rewrite SOC2 evidence BAA helper: "files previously uploaded for this organization".

**Verify:** `rg "InputPrimitive|TextareaPrimitive" packages/ui apps/web/src` returns zero (or only deprecated re-exports). `rg "BackLink\s*=" apps/web/src/routes` returns at most one definition (the import). No two `formatDate` definitions remain.

---

### Wave nav cleanup pass - Consolidate breadcrumbs + shared layout primitives
**Files (DISJOINT from Wave component cleanup pass):**
- `apps/marketing/src/components/StateGuideArticle.astro` (replace `<nav class="kicker">` with `<Breadcrumbs>`)
- `apps/marketing/src/pages/resources/best/[slug].astro`
- `apps/marketing/src/pages/resources/guides/index.astro` (sequenced after Wave color-token pass - Wave color-token pass only touches color tokens, Wave nav cleanup pass touches nav markup)
- `apps/marketing/src/pages/resources/guides/[slug].astro`
- `apps/marketing/src/pages/trust.astro` (add BreadcrumbList JSON-LD via `buildBreadcrumbSchema`)
- `apps/marketing/src/pages/subprocessors.astro` (add BreadcrumbList JSON-LD)
- `apps/marketing/src/components/Breadcrumbs.astro` (no changes; canonical)
- `apps/marketing/src/components/Nav.astro` (remove `.slice(0, 2)` on mobile resources)
- `apps/marketing/src/components/BrandLogo.astro` (loading="lazy" default, opt-in eager prop)
- `apps/marketing/src/pages/about.astro` (add `rel="noopener noreferrer"` to LinkedIn outbound)
- `apps/marketing/src/components/LeadMagnetForm.astro` (delete - consolidate with LeadCapturePanel)
- `apps/marketing/src/components/LeadCapturePanel.astro` (add variant prop covering former LeadMagnetForm use)
- All callers of LeadMagnetForm - repoint imports to LeadCapturePanel with variant
- `apps/marketing/src/pages/partners.astro` (add `<CAPTCHAWidget>` + honeypot, server-side token check)
- `apps/marketing/src/pages/alternatives/[slug].astro` (move inline `alternativeFaqs` block into `alternatives` content collection frontmatter; update Zod schema)
- `apps/marketing/src/content/config.ts` (extend `alternatives` schema)
- `apps/marketing/src/content/alternatives/*.md` (add `faqs` frontmatter)

**Findings:** [01 §"Three different breadcrumb implementations across pages"], [01 §"Trust/Subprocessors pages missing JSON-LD breadcrumb"], [01 §"Mobile menu silently truncates resources groups via slice(0, 2)"], [01 §"BrandLogo always uses loading=eager"], [01 §"LinkedIn outbound on about.astro lacks rel=noopener"], [01 §"LeadMagnetForm duplicates LeadCapturePanel"], [01 §"partners.astro application form lacks CAPTCHA and honeypot"], [01 §"Hardcoded inline alternativeFaqs block bypasses content collection"]

**Note:** Wave nav cleanup pass touches some `.astro` files also edited by Wave color-token pass (color tokens) and A1 (jargon). **Sequence A1 → Wave color-token pass → Wave nav cleanup pass** when same agent. Each wave's edits target different sections of the file.

**Guidance:** Replace every `<nav class="kicker">` breadcrumb with `<Breadcrumbs>` (which emits schema). Add `<script type="application/ld+json">` BreadcrumbList on trust + subprocessors via `buildBreadcrumbSchema`. Remove `.slice(0, 2)` in mobile resources panel; render all groups OR add "View all resources" affordance. Add `loading` prop to BrandLogo defaulting to `lazy`. Add `target="_blank" rel="noopener noreferrer"` to about.astro LinkedIn anchor. Consolidate LeadMagnetForm → LeadCapturePanel with `variant="magnet"|"panel"`; update callers; delete loser. Add CAPTCHA + honeypot to partners form; require token server-side. Move `alternativeFaqs` data into `alternatives` content collection frontmatter; update `content/config.ts` Zod schema; remove inline map.

**Verify:** `rg "nav class=\"kicker\"" apps/marketing/src` returns zero. Mobile nav shows all resource groups. partners.astro POST without CAPTCHA → server rejects.

---

### Wave legal copy pass - Brand/identity centralization + misc polish
**Files (DISJOINT from Wave nav cleanup pass):**
- `packages/knowledge/src/support.ts` (add `SUPPORT_EMAIL = 'support@phiguard.app'`, `SECURITY_EMAIL = 'security@phiguard.app'`)
- `packages/brand/src/identity.ts` (add `BRAND_NAME`, `MARKETING_DOMAIN`, etc.)
- `packages/brand/src/tokens.ts` (NEW - typed color/spacing/typography constants mirroring `tokens.css`)
- `packages/brand/src/index.ts` (re-export)
- `apps/web/src/components/help-guidance.tsx` (consume SUPPORT_EMAIL; split security link to SECURITY_EMAIL)
- `apps/web/src/routes/app.tsx` (Contact support / Report a security issue links - sequenced after B3)
- `apps/marketing/src/pages/unsubscribe.astro` ("Back to PHIGuard.app" → "Back to PHIGuard"; or sentence-case helper)
- Marketing locations/[slug] + CTA components ("BAA included at every tier" → import constant from `@phiguard/knowledge`)
- `apps/marketing/src/components/LegalLayout.astro` (admonition copy → shared constant; uses tokens from Wave color-token pass)
- `packages/ui/src/pdf-tokens.ts` (add comment explaining pdf-lib constraint)
- `packages/ui/src/web-theme.css` + `packages/ui/src/tokens.css` (document `--spacing` vs `--phig-space-*` choice in README; remove unused system)
- `packages/ui/README.md` (NEW or updated)
- `packages/ui/src/components/phiguard-logo.tsx` (require width/height props)
- `apps/marketing/src/pages/resources/[slug].astro` (refactor inline `<aside>` to shared `resource-sidebar` tokens; add `name="faq"` to `<details>`; align breadcrumb path with URL hierarchy)
- `apps/marketing/src/pages/unsubscribe.astro` (drop OG block OR include default image)
- `apps/marketing/src/pages/sitemap*.xml.ts` (populate `<lastmod>` from frontmatter `updatedAt`)
- `apps/marketing/src/lib/seo.ts` (default `image` fallback in `buildArticleSchema`)
- `apps/marketing/src/pages/alternatives/[slug].astro` + `compare/[slug].astro` (curly-quote normalization; pick one house style)
- `apps/marketing/src/layouts/BaseLayout.astro` (document ventora-ai-sdr script policy in comments)
- `apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro` (refactor sidebar key-value to `<dl>/<dt>/<dd>`)

**Findings:** [02 §"Support email is a personal address, not a shared inbox"], [01 §"Hardcoded BAA included at every tier string drift risk"], [01 §"Pricing claims in body copy are hardcoded strings"], [01 §"Several pages mention PHIGuard.app inconsistently"], [01 §"OG/twitter image not set on unsubscribe.astro"], [01 §"No lastmod in sitemap entries"], [01 §"Article schema missing image field"], [01 §"Curly-quote escaping inconsistency"], [01 §"Stylistic apostrophe shipped"], [01 §"Ad-hoc inline <aside> styling in resources/[slug]"], [01 §"FAQ <details> in resources/[slug] missing name attribute"], [01 §"Resources [slug] breadcrumb"], [01 §"BaseLayout loads ventora-ai-sdr"], [01 §"Sidebar Reviewed and verified card uses paragraphs of <strong>"], [01 §"LegalLayout admonition copy not centralized"], [06 §"pdf-tokens.ts raw hex lacks explanation"], [06 §"--spacing vs --phig-space-* baseline"], [06 §"PhiguardLogo <img> lacks width/height"], [06 §"@phiguard/brand has no design tokens"], [06 §"BrandLogo.astro and PhiguardLogo.tsx are twins"]

**Depends on:** Wave color-token pass (tokens), A1 (jargon sweep), B3 (app shell support links - sequence B3 → Wave legal copy pass for app.tsx edits).

**Guidance:** Add `SUPPORT_EMAIL = 'support@phiguard.app'` and split out `SECURITY_EMAIL = 'security@phiguard.app'`. Add typed tokens object to `@phiguard/brand` mirroring `tokens.css` (consider codegen). Centralize "BAA included at every tier" in `@phiguard/knowledge` as `BAA_PROMISE`; import in all marketing CTAs. Centralize brand name string. Drop OG block on unsubscribe utility page (or set default OG image). Populate `<lastmod>` in sitemap from collection `updatedAt`. Default `image` fallback in `buildArticleSchema`. Pick one curly-quote house style (recommend curly throughout) and sweep alternatives/compare slug pages. Refactor resources/[slug] inline `<aside>` to shared classes; add `name="faq"` to `<details>` for accordion behavior; align breadcrumb path. Document ventora-ai-sdr script as marketing-only per CLAUDE.md. Refactor "Reviewed and verified" card to `<dl>/<dt>/<dd>`. Add comment header to `pdf-tokens.ts` explaining pdf-lib constraint. Document spacing-token choice in `packages/ui/README.md`. Add required width/height props to `PhiguardLogo`. Consolidate `BrandLogo.astro` to consume sizes from `@phiguard/brand` tokens.

**Verify:** `rg "angel\.campa@phiguard" apps/ packages/` returns zero. `rg "BAA included at every tier" apps/marketing/src/pages` returns only constant import sites. Sitemap entries include `<lastmod>`.

---

## Dependency map (at-a-glance)

```
Wave A (all parallel; A6→A3, A6→A7, A8→B8 sequenced within same agent)
   │
   ▼
Wave B
   B1 (primitives)──┬─►  B2 (Dialog migration)
                    ├─►  C2, C3, C6, C7, C8, C9, C10 (need Select/Checkbox/AlertDialog)
                    ├─►  C5 (Skeleton for B5)
                    └─►  Wave component cleanup pass (StatusPanel locked variant)
   B3 (shell nav) ─────► Wave route cleanup pass, Wave legal copy pass edits to app.tsx
   B5 (error boundaries) ──► no downstream
   B7 (audit initial load) ──► C9 (audit filters)
   B9 (PromoBanner/Launch states) ──► Wave color-token pass (token fixes on same files)
   │
   ▼
Wave C
   C2 (compliance CRUD) ─┬─► C10 (compliance/SOC2 table filters)
                         └─► Wave component cleanup pass (BackLink swaps in compliance routes)
   C5, C6 ───────────────► Wave route cleanup pass (button unification in dashboard/billing)
   │
   ▼
Wave D
   Wave color-token pass ──► Wave global cleanup pass (global.css cleanup uses new tokens)
   Wave color-token pass ──► Wave nav cleanup pass (color tokens used in same files Wave nav cleanup pass edits)
   A1 ──► Wave nav cleanup pass (Wave nav cleanup pass edits same .astro files post-jargon-sweep)
```

## Verification baseline (run after each wave)

- `pnpm turbo typecheck lint test` from repo root.
- `pnpm --filter @phiguard/db test`, `--filter @phiguard/auth test`, `--filter @phiguard/audit test`, `--filter @phiguard/compliance test`.
- `rg -n "workflow" apps packages` after A1/A2 - zero hits outside changelog/migrations.
- `rg -n "window\.location\.(reload|assign|href\s*=)" apps/web/src` after A6/A7 - zero hits in route mutation paths.
- Manual smoke: login → dashboard → tasks list → tasks detail → compliance index → audit log → billing → onboarding → settings/members/locations.
