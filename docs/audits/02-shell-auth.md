# Shell + Auth Frontend Audit

## Summary
- Total: 38 (P0: 3, P1: 18, P2: 17)
- Top risk themes:
  - Sidebar/topbar drift: hidden admin route, missing compliance/incidents nav, no breadcrumbs, no active-page indicator on Reports/Settings group headers.
  - Auth pages mix client-side `<a href="/...">` anchors with the TanStack `<Link>` component, causing full page reloads, lost state, and inconsistent prefetch/active behavior.
  - Hydration/SSR risk: `partner.dashboard.tsx` reads `window.location.origin` during render; `app.tsx` flips `document.body.dataset.appHydrated` from `__root.tsx` only after mount but the body element is rendered server-side with the opposite value (intentional flicker hook, but still a hydration content mismatch under React 19 strict checks).
  - Legacy `mock-docuseal/` route directory remains after Docuseal removal (commit f4759ee) - empty but still scanned by router generation.
  - Support email is a personal handle (`&lt;personal-handle&gt;@phiguard.app`), not a shared `support@` inbox; appears in every authed shell + help drawer + AI-CS panel + feedback CTA.
  - Brand header in auth pages hard-links to `https://phiguard.app` (cross-origin full reload) regardless of whether the user came from product app.
  - `/api/ai-cs/*` endpoints are called from a deep-render component without checking auth state on the client, leading to console errors on the login screen race condition.

## Findings

### [P0] [NAV] `/app/admin/partners` is fully implemented but completely hidden from the sidebar
**File(s):** apps/web/src/routes/app.tsx:257-330, apps/web/src/routes/app/admin.partners.tsx:1-360
**Issue:** The admin partners page (approve partners, run payouts, mark paid) has a route + loader + UI + access-denied gate, but there is no link in any `NavSection`. Discovery requires knowing the URL.
**Expected:** Either render an Admin section in the sidebar gated on `navState.session.user.role === 'admin'`, or add a top-bar admin menu, or remove the page if intentionally hidden.
**Fix:** Add a conditional `NavSection label="Admin"` block in `Sidebar` with an `Admin → Partners` link, surfaced only when the session user has system-admin scope.

### [P0] [BUG] `partner.dashboard.tsx` uses `typeof window` at render - hydration mismatch
**File(s):** apps/web/src/routes/partner.dashboard.tsx:42
**Issue:** `{typeof window !== 'undefined' ? window.location.origin : ''}/partner/{partner.referralCode}` renders an empty origin on SSR and the real origin on client. React 19 will warn (text content mismatch) and the referral-link `<code>` block flashes from `/partner/CODE` to `https://my.phiguard.app/partner/CODE` after hydration. The partner can copy the broken value before hydration completes.
**Expected:** Either render the link in a `useEffect` after mount, render it server-side using a `request.url`/env-derived origin, or store the referral origin in the loader payload.
**Fix:** Compute the referral URL in `getPartnerDashboardFn` server-side using the request origin, return it as `partner.referralUrl`, and render it directly.

### [P0] [DEAD] `apps/web/src/routes/mock-docuseal/api/` directory remains after Docuseal removal
**File(s):** apps/web/src/routes/mock-docuseal/, apps/web/src/routes/mock-docuseal/api/
**Issue:** Commit f4759ee removed the Docuseal integration. The two empty directories remain. They are still walked by TanStack Start's file-router build step. The audit method explicitly flags leftover `docuseal` references. (No source files remain in `apps/web` or `packages/`; the only remaining mention is `packages/db/drizzle/0007_baa_envelopes.sql:15` which is an immutable migration and acceptable.)
**Expected:** Both directories deleted.
**Fix:** Remove `apps/web/src/routes/mock-docuseal/` recursively.

### [P1] [NAV] `/app/compliance` (index) has no sidebar link
**File(s):** apps/web/src/routes/app/compliance/index.tsx:5, apps/web/src/routes/app.tsx:277-300
**Issue:** A `ComplianceDashboard` exists at `/app/compliance` summarizing checklists, incidents, policies, and policy assignments. The sidebar lists Checklists, Policies, Program, SOC 2 - but no "Overview" link to the index, so the dashboard is unreachable from primary nav.
**Expected:** Either link "Overview" → `/app/compliance`, or delete the index route if the section landing was abandoned.
**Fix:** Add `<NavLink to="/app/compliance">Overview</NavLink>` at the top of the Compliance section.

### [P1] [NAV] `/app/compliance/incidents` has no sidebar link
**File(s):** apps/web/src/routes/app/compliance/incidents/index.tsx, apps/web/src/routes/app.tsx:277-300
**Issue:** Incidents list (`index.tsx`), incident detail (`$incidentId.tsx`), and new-incident form (`new.tsx`) exist, but no nav entry under Compliance.
**Expected:** Incidents is core HIPAA work - must be reachable from sidebar.
**Fix:** Add `<NavLink to="/app/compliance/incidents" icon={AlertTriangle}>Incidents</NavLink>` in the Compliance section.

### [P1] [NAV] Reports sub-pages (`/app/reports/compliance`, `/app/reports/tasks`) have no sidebar entries
**File(s):** apps/web/src/routes/app/reports.compliance.tsx, apps/web/src/routes/app/reports.tasks.tsx, apps/web/src/routes/app.tsx:302-312
**Issue:** Sidebar only links the Reports index. The two report detail pages are reachable only via internal links inside the Reports index.
**Expected:** Surface as nested links under "Reports" in the Insights group, or document as drill-downs only.
**Fix:** Decide whether they are first-class nav items; if yes, nest under Reports.

### [P1] [NAV] SOC 2 sub-pages (`auditor`, `access-reviews`, `controls`, `evidence`) collapse to a single nav entry
**File(s):** apps/web/src/routes/app/soc2.*.tsx (5 files), apps/web/src/routes/app.tsx:297-299
**Issue:** Five distinct SOC 2 pages but only one nav link to `/app/soc2`. Users have no quick switch between Evidence and Controls without going through the index.
**Expected:** Either second-level nav under SOC 2 when active, or in-page tabs at the index that mirror nav.
**Fix:** Sub-nav reveal pattern in the sidebar when `pathname.startsWith('/app/soc2')`, matching what the Compliance Program section already does implicitly via `complianceOpen`.

### [P1] [BUG] Auth pages use raw `<a href>` instead of `<Link>` causing full reloads
**File(s):**
- apps/web/src/routes/login.tsx:142, 165-170
- apps/web/src/routes/signup.tsx:78, 348-354
- apps/web/src/routes/signup.check-email.tsx:94-96
- apps/web/src/routes/forgot-password.tsx:71-73
- apps/web/src/components/brand-header.tsx:6
**Issue:** "Forgot password?", "Sign up", "Sign in", "Continue setup", "Back to sign in", brand logo all use `<a href="/...">`. Each click triggers a full document reload, drops all in-memory state (typed email/password, error banners), and re-runs SSR.
**Expected:** Use `<Link to="/...">` for internal navigation between auth routes; reserve `<a>` for external (`https://phiguard.app`) and `mailto:` links.
**Fix:** Replace internal `<a href>` with TanStack `Link` components; keep external URLs as anchors.

### [P1] [BUG] `login.tsx` uses `window.location.href = redirectPath` instead of router navigation
**File(s):** apps/web/src/routes/login.tsx:77, 91-92, 101-105
**Issue:** After successful sign-in the code forces a full page reload to the redirect path. The same pattern is in `signup.tsx:208`. This works but loses session-warm state, doubles the cold-render cost, and bypasses TanStack's redirect-after-login `beforeLoad` re-evaluation. Comment on line 73 hints this is intentional ("Let the authenticated app shell finish org hydration on redirect.") - but a `navigate({to, search})` call after the org switch would solve the org-hydration concern without the reload.
**Expected:** `navigate({ to: redirectPath })` after org-switch step; rely on the `/app` route's `beforeLoad` to re-evaluate access.
**Fix:** Replace `window.location.href = redirectPath` with router `navigate()`.

### [P1] [BUG] Brand header in authed-adjacent pages links to public marketing site, not in-app home
**File(s):** apps/web/src/components/brand-header.tsx:6, apps/web/src/routes/signup.tsx:78
**Issue:** `BrandHeader` and the signup sell panel both hard-link the logo to `https://phiguard.app`. On login/signup/forgot-password/accept-invite this triggers a cross-origin navigation away from `my.phiguard.app`, which is jarring and breaks the "back to sign-in" flow. The landing route at `/` exists in this same app and would be the natural target.
**Expected:** Logo links to `/` (or `/login` for auth-only shells) so the user stays on `my.phiguard.app`.
**Fix:** Change `<a href="https://phiguard.app">` to `<Link to="/">` in `brand-header.tsx`; for the signup sell panel decide between marketing site (intentional) or `/`.

### [P1] [CONTENT] Support email is a personal address, not a shared inbox
**File(s):** packages/knowledge/src/support.ts (referenced in apps/web/src/components/help-guidance.tsx:108-113, apps/web/src/routes/app.tsx:341-352, apps/web/src/components/help-guidance.tsx:451-459)
**Issue:** `SUPPORT_EMAIL` resolves to `&lt;personal-handle&gt;@phiguard.app`. It appears in the sidebar footer (Contact support, Report a security issue), the help drawer, the help-article support callout, and the feedback CTA. A personal address creates single-point-of-failure if the user is OOO and is unusual for a HIPAA-compliance B2B SaaS.
**Expected:** Shared address such as `support@phiguard.app` (or `security@phiguard.app` for the security-issue link specifically).
**Fix:** Update `SUPPORT_EMAIL` to `support@phiguard.app` and split the "Report a security issue" link to point at a separate `SECURITY_EMAIL` (`security@phiguard.app`).

### [P1] [BUG] Two visually-identical "Sign out" buttons in the shell on desktop
**File(s):** apps/web/src/routes/app.tsx:332-340 (sidebar), apps/web/src/routes/app.tsx:618-625 (topbar)
**Issue:** Desktop renders Sign out in both the sidebar footer and the header right side. They each call `handleSignOut` but neither indicates the other's existence; the aria-labels were even patched to add `(sidebar)` / `(header)` suffixes which is a smell that two affordances exist where one suffices.
**Expected:** One sign-out affordance, ideally inside an account/avatar menu near the org switcher.
**Fix:** Replace both with a single account menu (avatar → Profile, Org settings, Sign out).

### [P1] [STATES] Sidebar org name shows literal `...` when nav state is loading
**File(s):** apps/web/src/routes/app.tsx:220-222
**Issue:** `{navState?.activeOrganization?.name ?? '...'}` renders the literal string `...`. There is no skeleton/spinner; users see ellipsis as if a system fault truncated the name.
**Expected:** Skeleton placeholder bar, or hide the line until navState resolves.
**Fix:** Render a `<span className="inline-block h-3 w-24 animate-pulse rounded bg-surface-100" />` while `navState === null`.

### [P1] [STATES] Org switcher silently shows empty options while loading and is the only orgswitch on lg+
**File(s):** apps/web/src/routes/app.tsx:605-617
**Issue:** The desktop `<select id="org-switcher">` is `hidden lg:block` - but it is the *only* way to switch orgs on lg+ screens (md..lg has neither sidebar select nor topbar select, leaving multi-org users stranded on medium widths). Also while `navState` is null the select disables but renders nothing inside; on a slow load it looks broken.
**Expected:** Show the org switcher at md+, with a loading state (`<option disabled>Loading…</option>`).
**Fix:** Drop the `hidden ... lg:block` breakpoint to `md:block`; add a loading `<option>` when no orgs yet.

### [P1] [A11Y] Mobile-nav focus-trap will crash if mobile nav opens before nav data loads
**File(s):** apps/web/src/routes/app.tsx:486-499
**Issue:** Focus is moved to the first focusable element via `querySelector(...).focus()`. If `mobileNavRef.current` is null (nav opens before sidebar mounts) the optional-chain silently no-ops and focus is never moved into the dialog - keyboard users open the menu and lose focus context.
**Expected:** Fallback `mobileNavRef.current?.focus()` on the dialog container itself when no focusable child exists, and `tabIndex={-1}` on the dialog.
**Fix:** Mobile nav `<div role="dialog">` already has no `tabIndex` - add `tabIndex={-1}` and call `mobileNavRef.current?.focus()` if no child is focusable.

### [P1] [A11Y] `__root.tsx` Outlet renders inside `<body>` with no `<main>` landmark on auth pages
**File(s):** apps/web/src/routes/__root.tsx:39-49
**Issue:** The root component wraps `<Outlet />` directly in `<body>`. Login/signup/forgot-password/accept-invite/partner.* each render their own top-level `<div>`, so the page has no `<main>` landmark for screen readers. Only `/app` adds `<main className="flex-1 overflow-auto ...">`.
**Expected:** Every page should have exactly one `<main>` landmark.
**Fix:** Wrap `<Outlet />` in `<main>` at the root, or add `<main>` to each auth page shell.

### [P1] [A11Y] Mobile menu button does not move focus when nav opens and closes
**File(s):** apps/web/src/routes/app.tsx:570-579, 486-499
**Issue:** The hamburger button doesn't get `aria-expanded` toggled and doesn't have `aria-controls` pointing to the nav dialog id. The dialog itself has no `id` attribute.
**Expected:** `aria-expanded={isMobileNavOpen}` on the menu button; `aria-controls="mobile-nav"` plus `id="mobile-nav"` on the dialog.
**Fix:** Add the aria wiring.

### [P1] [FORM] Login Google OAuth fails silently when `result.data?.url` is missing and `redirectPath` is the unauthenticated route
**File(s):** apps/web/src/routes/login.tsx:100-105
**Issue:** When OAuth init returns no `url`, the code still does `window.location.href = redirectPath`, which is `/app/dashboard`. The `/app` `beforeLoad` then redirects back to `/login` with the same redirect, looping. Same shape in `signup.tsx:246-251`.
**Expected:** When the OAuth provider failed to return a URL, surface an error and stay on the page.
**Fix:** Replace the fallthrough `window.location.href = redirectPath` with `setGoogleError('Google sign-in did not return a redirect URL.')`.

### [P1] [BUG] `signup.check-email` "Continue setup" anchor strips invitation `redirect` outside `/app/onboarding`
**File(s):** apps/web/src/routes/signup.check-email.tsx:21-38
**Issue:** `getSignupCheckEmailContinuePath` only attaches `plan` when the redirect path is `/app/onboarding`. If the user signed up from an invitation flow (`/accept-invite/INVITE_ID`), the redirect path is `/accept-invite/INVITE_ID` - the plan query is dropped, but more importantly there's no signal that the invite is the next step (the button just says "Continue setup" and lands on the invite acceptance screen which now demands sign-in again, since email verification may not yet be complete).
**Expected:** Inform the user that verifying email is required before invitation acceptance, or send them to the invitation page only after email verification.
**Fix:** Detect invitation flows and route through a verify-email-first state.

### [P1] [STATES] `forgot-password` never re-enables submit after success, no rate-limit messaging
**File(s):** apps/web/src/routes/forgot-password.tsx:42-46
**Issue:** Once submitted, the form is replaced by a success message. No way to resend, no cooldown messaging, no link to support. Users who mistype their email cannot re-submit without a hard refresh.
**Expected:** Allow re-submission, or include a "Try a different email" reset link.
**Fix:** Add a "Resend" or "Use a different email" action below the success card.

### [P1] [STATES] `accept-invite` shows no loading/error state if `getSessionFn` itself throws
**File(s):** apps/web/src/routes/accept-invite.$invitationId.tsx:9-17
**Issue:** `beforeLoad` runs `getSessionFn()` with no try/catch. If the session endpoint 500s, the route falls back to the root error boundary, replacing the entire app shell with a generic error - the invitation link looks broken to the recipient.
**Expected:** Show a dedicated invitation-error fallback that still lets the user sign in.
**Fix:** Wrap `getSessionFn()` in a try/catch returning `{ session: null, invitationId, sessionError: true }`, and render an inline error in `AcceptInvitePage`.

### [P1] [BUG] `accept-invite` does not validate that the signed-in email matches the invited email
**File(s):** apps/web/src/routes/accept-invite.$invitationId.tsx:27-44
**Issue:** When the user clicks "Accept invitation," the page calls `acceptOrganizationInvitationFn` and trusts the server. The UI says "Finish signing in with the invited email address," but if the current session is for a different email, the only feedback is whatever `acceptOrganizationInvitationFn` throws as text. There is no client-side check or pre-display of the invited email address.
**Expected:** Loader should fetch the invitation (which email it was sent to) and either prefill or display "Invited as foo@clinic.com" so the user sees the mismatch before clicking.
**Fix:** Add `getInvitationPreviewFn(invitationId)` to load the invited email and compare to the session email.

### [P1] [STATES] Partner dashboard has no error state for `getPartnerDashboardFn` non-401 failures
**File(s):** apps/web/src/routes/partner.dashboard.tsx:6-17
**Issue:** The loader only redirects on `Unauthorized`. Any other thrown error (DB outage, network) escapes to the root error boundary. Partner-portal users see the generic "Something went wrong" screen with no link back to `/partner/login`.
**Expected:** Catch and render a partner-specific error card with a "Try again" button.

### [P2] [BUG] `accept-invite` "Sign in" link drops invitation-redirect when invitee is logged out and the invitee email already has a draft account
**File(s):** apps/web/src/routes/accept-invite.$invitationId.tsx:73-80
**Issue:** When the user clicks "Create an account" but already has one with that email, the signup form will fail with a generic error and they have to type the invitation URL again because the signup form has no awareness it is mid-invitation.
**Expected:** Signup component reads `redirect` and shows a "You already have an account - sign in instead" link when error matches "user exists."

### [P2] [CONTENT] Landing page (`index.tsx`) lifts marketing copy into the product app, drifting from `apps/marketing`
**File(s):** apps/web/src/routes/index.tsx:7-41
**Issue:** Hardcoded `landingCopy` block duplicates positioning text. The marketing site (`apps/marketing`) is the source of truth for public copy. Any change requires editing two places, and the copy may drift (e.g., it does not mention the BAA-at-every-tier hook or the limited offer). It also uses generic-SaaS terms PHIGuard CLAUDE.md bans - "stale documents," "operations hub" is borderline, "system" is fine.
**Expected:** Pull copy from `@phiguard/knowledge/public` (already used by `signup.tsx`) or have `/` redirect to `https://phiguard.app` if the marketing site is canonical for unauthenticated visitors on `my.phiguard.app`.
**Fix:** Either redirect `/` → `/login` on `my.phiguard.app`, or consume shared knowledge module.

### [P2] [SEO] Root sets `noindex,nofollow` globally - landing `/` route is also noindexed
**File(s):** apps/web/src/routes/__root.tsx:20
**Issue:** Intentional because product subdomain shouldn't be indexed, but the landing page at `apps/web/src/routes/index.tsx` looks marketing-shaped. If anyone links to `my.phiguard.app`, the page is rendered but invisible to crawlers. Combined with the prior finding it suggests `/` should not exist on the product subdomain at all.
**Expected:** Remove the landing route entirely from the product app and let `/` redirect to `/login`.

### [P2] [INCONSISTENCY] Sidebar uses fixed `md:w-60`; topbar children use `lg:flex-none` - mid-width breakpoints look unbalanced
**File(s):** apps/web/src/routes/app.tsx:537, 583, 605-617
**Issue:** Three different breakpoints (`md`, `lg`, `xl`) govern sidebar visibility, org switcher visibility, and switcher max-width. At ~900-1100px the layout has a sidebar but no header-side org switcher and no mobile menu button - multi-org users cannot switch orgs.
**Fix:** Standardize on `md` for sidebar + org switcher visibility.

### [P2] [INCONSISTENCY] "New task" pill button uses brand-700 directly instead of the shared `Button` variant
**File(s):** apps/web/src/routes/app.tsx:594-601
**Issue:** The header CTA is a raw `<button>` with hand-rolled `bg-brand-700` classes. Login/signup/etc. use `Button` from `@phiguard/ui`. The pill shape (rounded-full) is unique to this CTA; everywhere else uses the rectangular Button. Mild visual drift.
**Expected:** Use `Button size="sm"` with an icon prop, or add a `pill` variant to `@phiguard/ui` Button.

### [P2] [INCONSISTENCY] Help button in header uses raw `<button>` with brand-50/200 not the shared Button
**File(s):** apps/web/src/routes/app.tsx:585-593
**Issue:** Same as above - visual style is a one-off, doesn't reuse `Button` variants.

### [P2] [DUPLICATE] `useModalKeyboard` focus-trap logic exists in both `help-guidance.tsx` and `new-task-modal.tsx`
**File(s):** apps/web/src/components/help-guidance.tsx:259-320, apps/web/src/components/new-task-modal.tsx:71-112, apps/web/src/routes/app.tsx:486-533
**Issue:** Three near-identical implementations of "find focusable, trap tab, restore focus on close." `help-guidance` exports a hook; the other two reimplement inline.
**Expected:** Promote `useModalKeyboard` to `@phiguard/ui` and reuse in `NewTaskModal` and the `AppLayout` mobile nav.

### [P2] [A11Y] `AiCsSupport` floating button uses `fixed bottom-4 right-4 z-30` and overlaps "New task" + sign-out flows on small viewports
**File(s):** apps/web/src/components/ai-cs-support.tsx:170-180, 184
**Issue:** The 30-z floating button sits over content with no offset for safe-area on iOS, and overlaps the bottom of forms (e.g., the sign-out button area on lg-down).
**Expected:** `bottom: max(1rem, env(safe-area-inset-bottom))` and a higher offset when modals open.

### [P2] [A11Y] `AiCsSupport` panel does not trap focus and has no `role="dialog"`
**File(s):** apps/web/src/components/ai-cs-support.tsx:182-256
**Issue:** Opening the panel does not move focus into it, ESC does not close it, and Tab can leave the panel back into the underlying page. Uses `<section aria-label>` not `role="dialog"`.
**Expected:** Use the shared focus-trap hook (see DUPLICATE finding) and add `role="dialog" aria-modal="true"`.

### [P2] [STATES] `AiCsSupport` chat does not show pending/loading bubble while waiting for response
**File(s):** apps/web/src/components/ai-cs-support.tsx:110-148, 202-221
**Issue:** When `isWorking`, the user sees their message immediately but no "Thinking…" placeholder. Long requests look hung.
**Expected:** Add a pending assistant bubble with a 3-dot indicator.

### [P2] [BUG] `AiCsSupport` is mounted unconditionally inside the `/app` shell - loads on the onboarding route despite `isOnboardingRoute` check
**File(s):** apps/web/src/routes/app.tsx:646
**Issue:** Comment says `{aiCsConfigured && !isOnboardingRoute && <AiCsSupport ... />}` - this correctly hides it on onboarding. But there is no gate by user role or by feature flag, so it appears on every other route including `/app/billing` and `/app/audit`, where chat-style support is unusual for a HIPAA app. Confirm intent.

### [P2] [CONTENT] Help drawer uses casual phrasing "Best next step" and "Help and feedback" - fine, but the AI-CS warm-up message says "Ask about PHIGuard workflow, compliance tasks…"
**File(s):** apps/web/src/components/ai-cs-support.tsx:75
**Issue:** Uses banned word "workflow" per CLAUDE.md brand-voice rules ("Avoid generic SaaS jargon: do not say 'workflows', 'pipelines', 'syncing', 'streamline'").
**Fix:** Replace with "Ask about PHIGuard tasks, compliance work, or where to find something."

### [P2] [CONTENT] Feature-gate fallback copy uses "workflows" and "workflow complexity"
**File(s):** apps/web/src/components/feature-gate.tsx:20-37
**Issue:** Three uses of "workflow" / "workflows" in `integrations_basic` label and in the upsell paragraph. Banned by CLAUDE.md.
**Fix:** Rewrite without "workflow." e.g., "calendar integrations and connected systems," "level of operational complexity."

### [P2] [CONTENT] Partner dashboard table is read-only but has no empty-state CTA
**File(s):** apps/web/src/routes/partner.dashboard.tsx:50-93
**Issue:** Empty referrals shows "No referrals yet. Share your referral link to get started." - but no copy-link button next to the referral URL above, and the URL block has no copy affordance at all (just a `<code>` block).
**Expected:** Add a "Copy link" button next to the `<code>` element.

### [P2] [A11Y] `AppLayout` `header` has no `role="banner"` and `main` no skip-link target
**File(s):** apps/web/src/routes/app.tsx:570, 629
**Issue:** No "Skip to main content" link at the top of the shell. Screen reader users tab through the entire sidebar before reaching content.
**Expected:** Add a visually-hidden skip-link at the very top of `AppLayout` jumping to `#main`, and `id="main"` on the `<main>` element.

### [P2] [INCONSISTENCY] Partner dashboard uses `text-text-secondary` plus `mb-`/`mt-` Tailwind margins while the rest of the app uses `space-y-` flow
**File(s):** apps/web/src/routes/partner.dashboard.tsx:26-138
**Issue:** Visual drift from `/app/*` pages (which use shared `PageHeader`, `Panel`, `Table` primitives from `@phiguard/ui`). Partner dashboard re-implements `<table>` styling and panel cards inline.
**Fix:** Migrate to `Panel`, `PanelHeader`, `Table`, `TableShell` from `@phiguard/ui`.

### [P2] [INCONSISTENCY] Partner login uses `bg-surface-0` cards while signup uses `bg-surface-900` sell-panel + `bg-surface-50` form area
**File(s):** apps/web/src/routes/partner.login.tsx:46-97
**Issue:** Partner login is a plain centered card with no marketing or differentiation. Not necessarily wrong, but feels like a different product. Consider whether partner portal deserves its own brand treatment.

### [P2] [DEAD] `validateSignupCheckEmailSearch` is exported but not consumed externally
**File(s):** apps/web/src/routes/signup.check-email.tsx:17-19
**Issue:** Exported alongside `getSignupCheckEmailContinuePath` but TanStack passes the validator inline via `validateSearch:`. Likely test-only export - fine, but mark intent if so.

### [P2] [BUG] `app.tsx` re-fetches navigation after every org switch with no optimistic UI; switcher is briefly disabled and the page navigates to dashboard before the new org name appears in the sidebar
**File(s):** apps/web/src/routes/app.tsx:444-462
**Issue:** Order is: switch → refresh nav → setNavState → navigate. There is no spinner during refresh. Users see the dashboard reload with the old org name until `navState` updates a tick later.
**Expected:** Show a `isSwitching` overlay or optimistically update the org name from the option label.

### [P2] [PHI] AI-CS panel and help drawer both rely on user discipline ("Do not include patient information"); there is no client-side keyword strip
**File(s):** apps/web/src/components/ai-cs-support.tsx:189-227, apps/web/src/components/help-guidance.tsx:459
**Issue:** PHI policy is enforced only by a warning label. If a clinic staffer types "Patient John Smith DOB 1970…" the message is posted as-is. Not a hard violation (logger.safe is on the server), but worth a client-side warning when patterns like SSN/DOB are detected.
**Expected:** Lightweight regex check that warns before submit if an SSN-like or `DOB`/`MRN` token appears.
