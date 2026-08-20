# Wave B Combined Review

## Decision
APPROVED with minor follow-ups (no blocking issues)

Wave B can proceed to Wave C. The two `[Important]` items below should be addressed in a small follow-up commit on the same branch (or rolled into the first Wave C bundle that touches the affected files).

## Spec compliance per bundle

### B1 - Primitives (`1f3c2c8`)
- ✅ All 8 primitives scaffolded under `packages/ui/src/components/`: select, checkbox, dropdown-menu, tooltip, alert-dialog, skeleton, spinner, status-panel.
- ✅ Each primitive follows the existing dialog.tsx pattern: `React.forwardRef`, `displayName`, `cn()` helper, CSS-var `z-[var(--phig-z-*)]` tokens.
- ✅ `dialog.tsx` z-classes migrated from `z-[300]/z-[400]` to `z-[var(--phig-z-overlay)]/z-[var(--phig-z-modal)]`.
- ✅ `@keyframes phig-enter` / `phig-exit` added to `packages/ui/src/web-theme.css`.
- ✅ `./web-theme.css` export added to `packages/ui/package.json` exports map.
- ✅ All Radix peer deps added (`@radix-ui/react-{select,checkbox,dropdown-menu,tooltip,alert-dialog}`, `lucide-react`).
- ✅ All new primitives exported from `packages/ui/src/index.ts`.
- ⚠️ The dialog/dropdown/select/alert-dialog markup uses Tailwind `animate-in`/`fade-in-0`/`zoom-in-95` utilities (provided by `tailwindcss-animate`), but the package is not declared as a dependency anywhere, and the new `phig-enter`/`phig-exit` keyframes added to `web-theme.css` are not referenced from any class. Animations will degrade silently. See `[Important] #1` below.

### B2 - Dialog migration (`c760205`)
- ✅ `help-guidance.tsx` HelpDrawer + ConfirmActionDialog migrated to `Dialog`/`DialogContent`/`DialogHeader`/`DialogFooter` from `@phiguard/ui`.
- ✅ `new-task-modal.tsx` migrated to `Dialog`/`DialogContent`.
- ✅ Duplicate `getFocusableElements` / `useModalKeyboard` removed (`rg getFocusableElements apps/web/src` returns zero).
- ✅ No remaining hand-rolled `fixed inset-0` overlay-modal pattern in `apps/web/src` outside of the deliberately-kept mobile-nav dialog in `app.tsx` (which uses its own focus-trap because the nav must keep aria-modal semantics without being a Radix Dialog - acceptable trade-off, per Wave B comments in the file).

### B3 - Shell nav (`9f3669c`) + followup (`83081fe`)
- ✅ Admin nav section gated on `navState?.isSystemAdmin` with `Admin → Partners` link.
- ✅ Compliance "Overview" link added at `/app/compliance`.
- ✅ "Incidents" link with `AlertTriangle` icon added under Compliance.
- ✅ SOC 2 sub-nav reveal added (`soc2Open = pathname.startsWith('/app/soc2')`) mirroring `complianceOpen`.
- ✅ Sub-nav exposes Overview / Controls / Evidence / Auditor / Access Reviews.
- ✅ Mobile-nav `id="mobile-nav"`, `tabIndex={-1}`, `role="dialog"`, `aria-modal="true"` all present.
- ✅ Hamburger button has `aria-expanded` + `aria-controls="mobile-nav"`.
- ✅ Skip-link `<a className="sr-only focus:not-sr-only" href="#main">` at top of layout.
- ✅ Header has `role="banner"`.
- ✅ Mobile-nav focus-trap guards against `mobileNavRef.current === null` (no crash if nav opens before data loads).
- ✅ Mobile menu button receives return-focus on close via `useEffect` cleanup.
- ✅ Org switcher renders `<option disabled>Loading…</option>` while `navState === null`.
- ✅ Sidebar + org-switcher visibility breakpoints dropped from `lg:` to `md:`.
- ✅ Followup (`83081fe`) unifies sign-out under shared `DropdownMenu` anchored to the user avatar in the sidebar footer - single sign-out affordance only (no duplicate header sign-out button). Uses `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` from B1.

### B4 - Auth flows (`0913201`)
- ✅ All internal auth-page `<a href>` replaced with TanStack `<Link>` (login, signup, signup.check-email, forgot-password, accept-invite, brand-header).
- ✅ `login.tsx` / `signup.tsx`: post-org-switch hard-nav replaced with `await navigate({ to: redirectPath })`. The remaining `window.location.href = result.data.url` calls are for the external Google OAuth redirect - correct usage.
- ✅ Google OAuth error path: when `result.error` is set, surfaces `setGoogleError(...)` inline instead of looping.
- ✅ `forgot-password.tsx`: success state now renders "Resend" / "Use a different email" buttons that re-enable submit.
- ✅ `brand-header.tsx`: `<Link to="/">` replaces external `https://phiguard.app` href.
- ✅ `accept-invite.$invitationId.tsx`: `beforeLoad` uses `Promise.allSettled` so a thrown `getSessionFn` no longer crashes the route; new `getInvitationPreviewFn` server-fn loads `invitedEmail` + `expired`; UI displays "Invited as …" and warns + disables accept when signed-in email mismatches or invite is expired.
- ✅ `partner.dashboard.tsx`: `referralUrl` is computed server-side in `getPartnerDashboardFn` from `APP_URL`/request origin (no more `typeof window` at render). `PartnerDashboardError` error component added.
- ✅ `__root.tsx`: `<Outlet />` wrapped in `<main id="main">`. **However**, see `[Important] #2` - this collides with the existing `<main id="main">` already inside `apps/web/src/routes/app.tsx`.

### B5 - Error boundaries (`7f65681`)
- ✅ Shared component created at `apps/web/src/components/compliance-error-boundary.tsx` (exported as `AppRouteErrorBoundary` - file path matches spec; name divergence is fine since callers import explicitly).
- ✅ Uses `StatusPanel` variant=error with `router.invalidate()` retry and a `<Link>` "Back to dashboard" fallback.
- ✅ Explicit HIPAA comment confirming the raw `error.message` is not rendered.
- ✅ `errorComponent: AppRouteErrorBoundary` wired on all 8 spec'd routes: `dashboard`, `compliance/index`, `compliance/program.index`, `soc2.index`, `reports.index`, `reports.compliance`, `reports.tasks`, `tasks`.
- ⚠️ Spec also asked for `pendingComponent: <SkeletonList />` + `pendingMs: 200` on each route. Not implemented in this bundle - none of the eight routes gained a `pendingComponent`. See `[Polish] #1`.

### B6 - Loading/empty/error for settings + admin (`032c30a`)
- ✅ Members / Locations / Integrations / Admin Partners all import `Skeleton` and `StatusPanel` from `@phiguard/ui` (B1 primitives - no duplication).
- ✅ Skeleton rows render during initial fetch on all four routes.
- ✅ `StatusPanel` variant=empty distinguished from variant=error on each route.
- ✅ Integrations distinguishes "no org selected" (Alert tone=warning) from "load failed" (StatusPanel error with retry).
- ✅ Admin Partners route gets `pendingComponent` (`PartnersLoadingSkeleton`) + `errorComponent` per spec.
- ⚠️ Spec called for status-mapped variant for non-active integration connections (warning for `expired`, danger for `error`/`revoked`). Implementation collapses all non-active states to a single `bg-danger-100/text-danger-800` badge - partial implementation. See `[Polish] #2`.
- ⚠️ Spec also called for stripping the integrations callback `?status=` query after consumption - not addressed here. See `[Polish] #3`.

### B7 - Audit log (`e4c53a4`)
- ✅ Auto-fetch on mount via `useEffect` with default last-7-days window - no user action required for initial render.
- ✅ `Skeleton` rows (`SKELETON_ROW_COUNT = 8`) shown while initial fetch is in flight.
- ✅ Empty state uses `StatusPanel` variant=empty.
- ✅ Error state uses `StatusPanel` variant=error with retry callback.
- ✅ UUID regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` validates `actorId` and `resourceId` with `aria-invalid` + `role="alert"` inline error messages.
- ✅ Submit blocked when UUID inputs are malformed.
- ✅ `SummaryMetric label="Events on this page"` (honest scope).
- ✅ **Append-only HIPAA constraint preserved**: no edit/delete affordances on rows. Explicit comments at file header (line 10) and inside the table row block (line 332) confirm `audit_events` is append-only. Same note added to `export.tsx`.

### B8 - SOC2 evidence polish (`a1e6773`)
- ✅ `downloadError` cleared on every other action (mutation, collect, export, new download).
- ✅ "Bundle ready" alert shows expiry timestamp.
- ✅ Auto-dismiss after 15 min via `setTimeout` with cleanup on unmount.
- ✅ When `?controlId=` is present in route search, "Back to control {controlId}" link rendered alongside "Back to SOC 2".

### B9 - Marketing fetch states (`43b2474`)
- ✅ `PromoBanner.astro` - skeleton shimmer during fetch; quiet visible fallback on error via `data-promo-state` CSS toggling.
- ✅ `LaunchPhaseProgress.astro` - hardcoded `https://my.phiguard.app/api/marketing/promotion` replaced with `import.meta.env.PUBLIC_APP_URL ?? PHIGUARD_APP_ORIGIN`. Loading + error states added.
- ✅ `unsubscribe.astro` - branches on `res.status`: 4xx → "Link expired or invalid", 5xx/network → "Transient error - try again" with retry button.

## Cross-cutting checks

- ✅ **Banned jargon**: `git diff master..HEAD` additions contain no `workflow`/`pipeline`/`streamline`/`syncing`.
- ✅ **No `console.*`** in additions to `apps/web` or `packages/`.
- ✅ **No casual error copy** (`oops`, `oh no`, `something went wrong`) in additions.
- ✅ **No Docuseal references** reintroduced anywhere in the diff.
- ✅ **No hand-rolled modal pattern** reintroduced - Dialog primitive is now consistently used.
- ✅ **SPA navigation in B4** uses TanStack `<Link>` and `useNavigate()`. Remaining `window.location.href`/`assign` calls in the diff are all for external destinations (Stripe Portal, Google OAuth, presigned-URL downloads) - correct.
- ✅ **Audit log append-only** - B7 has no edit/delete affordances on rows; explicit HIPAA comments.
- ✅ **B1 DropdownMenu adopted** by B3-followup for single sign-out - primitives are not orphaned.
- ✅ **No duplication of B1 primitives** in downstream consumers - B6 imports `Skeleton`/`StatusPanel` from `@phiguard/ui` rather than rolling their own.
- ✅ **B6/B7 error UI does not leak PHI** - generic copy ("There was a problem retrieving …", "Unable to load this page"); raw `error.message` not echoed.

## Code quality issues

### [Important] #1 - Radix-state animation classes require `tailwindcss-animate`, which isn't installed
**Files:** `packages/ui/src/components/{dialog,dropdown-menu,select,alert-dialog,tooltip}.tsx`
**Problem:** Every overlay primitive uses `data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 …` utilities. These are not built into Tailwind core - they come from `tailwindcss-animate` (or Tailwind v4's `@plugin "tailwindcss-animate"`). No such dependency exists in `packages/ui/package.json` or `apps/web/package.json`, and I could not find a `@plugin` directive registering it. The classes will be emitted but produce no animation.
**Also:** The `@keyframes phig-enter` / `phig-exit` added to `web-theme.css` (per B1 commit message) are not referenced from any class in the codebase - they're dead at the moment.
**Fix:** Either (a) add `tailwindcss-animate` and register it in the Tailwind config so the data-state utilities resolve, or (b) wire the existing `phig-enter`/`phig-exit` keyframes into the dialog/dropdown classes directly (`data-[state=open]:animate-[phig-enter_150ms_ease-out]` etc.) and add an analogous keyframe for fade/dropdown. The components are functional either way (Radix handles open/close state without animation), so this is not blocking, but it should be resolved before Wave C consumers rely on visible motion.

### [Important] #2 - Duplicate `<main id="main">` landmark on `/app/*` routes
**Files:** `apps/web/src/routes/__root.tsx:45` and `apps/web/src/routes/app.tsx:708`
**Problem:** B4 wrapped the root `<Outlet />` in `<main id="main">`. B3 already added `<main id="main" className="flex-1 overflow-auto p-6 md:p-8">` inside `AppLayout`. On every `/app/*` page the DOM now contains two nested `<main>` elements with the same `id="main"`. That's an a11y violation (one main landmark per page), and the duplicate `id` is an HTML validation error. The skip-link `href="#main"` will target whichever element appears first in document order (the root one), which jumps the user past the sidebar but *not* into the actual app content area B3 intended.
**Fix:** Either drop the root `<main>` and let each route own its own landmark (preferred - auth pages and partner pages can add their own `<main>` near `BrandHeader`), or drop the inner `<main>` in `app.tsx` and rely on the root wrapper (then move the `flex-1 overflow-auto p-6 md:p-8` classes to a wrapper `<div>` inside `app.tsx`).

### [Polish] #1 - `pendingComponent` + `pendingMs` not added in B5
Spec called for each of the eight routes to also gain `pendingComponent: <SkeletonList />` + `pendingMs: 200`. Only `errorComponent` was wired. Loading states still fall back to the framework default. Address in Wave C polish or a B5 follow-up.

### [Polish] #2 - Integration connection badge collapses all non-active states to "danger"
**File:** `apps/web/src/routes/app/settings.integrations.tsx:397-400`
Spec asked for warning tone for `expired` and danger tone only for `error`/`revoked`. Implementation uses a single danger fallback. Map `connection.status` explicitly:
```ts
const tone = connection.status === 'active' ? 'success'
  : connection.status === 'expired' ? 'warning'
  : 'danger'
```

### [Polish] #3 - Integrations callback `?status=` query not stripped after consumption (spec B6)
After the OAuth callback writes a status into search, the query lingers in the URL and would re-trigger the banner on refresh. Add `router.navigate({ to: '/app/settings/integrations', search: {} })` once the status banner has rendered.

### [Polish] #4 - `StatusPanel` action with `href` uses raw `<a>` instead of router `<Link>`
**File:** `packages/ui/src/components/status-panel.tsx:82`
This is intentional and correct - `@phiguard/ui` is framework-agnostic and cannot depend on TanStack Router. Callers that need SPA navigation should use the `onClick` form with `navigate({...})` (as B5's `AppRouteErrorBoundary` already does for retry, and the "Back to dashboard" link is rendered as a separate `<Link>` outside the panel). No action required - flagged here only so future Wave C bundles don't surface it as a finding.

### [Polish] #5 - `RefreshCw` icon double-rendered for error variant when action is a link
**File:** `packages/ui/src/components/status-panel.tsx:83,93`
The `RefreshCw` icon renders inside both the `href`-Button branch and the `onClick`-Button branch. Cosmetic - could be hoisted out. Non-blocking.

## Test/typecheck status
- **web typecheck:** ✅ clean (`tsc --noEmit` exits 0).
- **marketing typecheck:** ✅ 91 files, 0 errors, 0 warnings, 0 hints.
- **web tests:** 656 passed / 1 failed (61 files: 60 pass, 1 fail). The single failure is the known pre-existing time-dependent flake: `src/server/program.test.ts > program training records > returns assignment options for administrators with training records` (`dueStatus: "not_started"` expected, got `"due_soon"`) - ignored per spec.

## Recommendation
**Proceed to Wave C.**

The two `[Important]` items are real but neither blocks Wave C functionality:
- `#1` (`tailwindcss-animate` missing) only affects motion - components are functional and accessible without animation. Address in a follow-up that wires the keyframes B1 already added, or installs the plugin.
- `#2` (duplicate `<main>` on `/app/*`) is an a11y/HTML-validity bug that should be fixed before any external a11y audit, but does not break navigation or the skip-link's basic function. Fix by dropping the inner `<main>` in `app.tsx` and moving its layout classes to a wrapping `<div>`, OR dropping the outer wrapper in `__root.tsx` and letting auth/partner pages own their own landmarks.

The four `[Polish]` items can be folded into Wave C bundles that already touch those files (C6 already touches integrations, future polish bundle for routes).
