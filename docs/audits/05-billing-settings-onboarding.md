# Billing / Settings / Onboarding / Partners Admin - Frontend Audit

Scope: `apps/web/src/routes/app/billing.tsx`, `onboarding.tsx`, `settings.members.tsx`, `settings.locations.tsx`, `settings.integrations.tsx`, `admin.partners.tsx`, plus supporting helpers (`lib/billing-catalog.tsx`, `lib/phase-two-flow.ts`, `lib/plan-features.ts`, `lib/onboarding-legal.ts`, `components/feature-gate.tsx`).

## Summary
- Total: 38 (P0: 4, P1: 19, P2: 15)
- Top risk themes:
  - Plan-display drift between billing-page card and confirm-block (no max-members count rendered, missing plan annual amount, no per-feature copy from canonical truth source).
  - Onboarding has no in-UI plan picker - it relies entirely on `?plan=` querystring; the user can finish onboarding and start a trial with no plan recorded.
  - Numerous loading/empty/error states missing (members list, locations list, location-grants list, partners loader, integrations).
  - Banned generic-SaaS jargon ("workflows", "workflow") shipped in `FeatureGate` upgrade prompt and `setup integrations` callouts.
  - Last-admin-removal protection is not enforced in the members UI - only org_owner is guarded; an org_admin can demote/remove the only remaining org_admin (leaving no admin) if the server allows it; no client warning either way.
  - Invoices / payment-history surface does not exist anywhere in `apps/web`; everything is delegated to Stripe Portal with no fallback or summary.
  - Coupon / `Y80OFF` promo is auto-applied silently but never reflected in `billing.tsx` confirm copy (no badge on confirm-block, no promo line in legal-acceptance status, no display of `getPromotionDisplayCopy` outside the cards).
  - `admin.partners.tsx` loader collapses any non-500 error into "Access Denied", masking real errors.
  - `window.location.reload()` is used after partner approve/mark-paid, throwing away local state.
  - Active-connection badge in integrations is hardcoded `bg-success-100` even when `connection.status !== 'active'`.

---

## Findings

### [P0] [BUG] Onboarding can finish with no plan recorded when `?plan=` is absent
**File(s):** `apps/web/src/routes/app/onboarding.tsx:220-223`
**Issue:** `selectPlanFn` is only invoked when `search.plan` is set; `startTrialFn` is then called unconditionally. A user who navigates directly to `/app/onboarding` (e.g. invited admin, magic-link land, manual URL) accepts legal docs and a trial starts with no plan on file. The billing page then renders "Current plan: No active plan" and the trial banner says "No active plan is on file yet."
**Expected:** Either require plan selection in onboarding UI before trial start, or default to `essentials`, or block the submit CTA until a plan is chosen.
**Fix:** Render a plan picker inside `onboarding.tsx` (re-use `PUBLIC_PLAN_IDS` + `formatPlanPrice`) or fall back to `'essentials'` when `search.plan` is absent.

### [P0] [BUG] Partners admin loader treats *any* non-reportable error as "Access Denied"
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:32-44`
**Issue:** The catch arm checks `!isReportableError(err)` which is true for validation/expected errors of *any* shape (e.g. `tenant_required`, "session expired", network), not just authz failures. The user is silently shown an "Access Denied" panel for unrelated errors and the real cause is suppressed.
**Expected:** Match specifically on a 403/access-denied signal before rendering the access-denied panel; surface other errors with a retry path.
**Fix:** Branch on a discriminator (e.g. error code `partners.admin_only`) rather than `isReportableError`.

### [P0] [BUG] `window.location.reload()` after partner approve / mark-paid
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:115, 140`
**Issue:** After successful `adminMarkPayoutPaidFn` and `adminApprovePartnerFn` the page is hard-reloaded, throwing away the `runResult` success Alert (it never renders to the user because it's set then immediately discarded by reload), discarding any other pending input in `payoutReferences`, and breaking the back/forward stack.
**Expected:** Refetch loader data (`router.invalidate()` / `Route.useNavigate`) and keep banners.
**Fix:** Replace `window.location.reload()` with TanStack Router invalidation.

### [P0] [CONTENT] Banned jargon "workflows / workflow" in shipped UI
**File(s):** `apps/web/src/components/feature-gate.tsx:21,23,24,36`, `packages/knowledge/src/app.ts:529,925`
**Issue:** CLAUDE.md and the audit method ban "workflows" in PHIGuard marketing/voice. `FeatureGate` upgrade prompt says: "calendar integrations and connected workflows", "SOC 2 evidence and access review workflows", "this level of workflow complexity". The shared `appPublicGuidanceCopy` references "PHI-related workflows" and "access review workflows".
**Expected:** Replace with healthcare-admin language ("tasks", "compliance program", "audit-ready records", "evidence review").
**Fix:** Rewrite copy without "workflow"/"workflows".

---

### [P1] [BUG] Plan-display mismatch - confirm-block omits annual list total but card shows it
**File(s):** `apps/web/src/routes/app/billing.tsx:535-538`
**Issue:** Confirm-block sentence: "{name} at {price} (effective monthly per clinic, list price {list}, {detail.toLowerCase()})". The `detail` field already embeds the list price and annual total, so the sentence duplicated the list price and lowercased the promo code.
**Expected:** Render once, preserve coupon code casing.
**Fix:** Drop the duplicate `listPrice` or remove the embedded list price from `detail`; do not `.toLowerCase()` strings that contain the promo code.

### [P1] [BUG] Promo code rendered lowercase in confirm sentence
**File(s):** `apps/web/src/routes/app/billing.tsx:537`
**Issue:** `formatPlanPrice(...).detail.toLowerCase()` lowercases the promo code returned from `getPromotionDisplayCopy` (`Y80OFF`).
**Expected:** Preserve promo casing.
**Fix:** Use the raw `detail` string or sentence-case only the first letter.

### [P1] [BUG] Confirm-block uses `effectiveMonthlyAmount` even for monthly cadence
**File(s):** `apps/web/src/routes/app/billing.tsx:70, 264, 535`, `apps/web/src/lib/billing-catalog.tsx:35-52`
**Issue:** `formatPlanPrice(..., 'monthly')` returns `discountedEffectiveMonthlyLabel` as `price`, which for monthly equals the monthly amount. The card labels it `"per month"`, but the SummaryMetric label flips between "Annual price" and "Monthly price" while the value comes from the same field. With promo applied this is fine, but the "list price" line on monthly cards renders the current monthly list price line-through and the discounted monthly price - visually correct, but `detail` reads as a monthly promo detail. (Note: `listPrice` field is `listEffectiveMonthlyLabel` not `listTotal`; for monthly cadence `listEffectiveMonthlyLabel === listTotalLabel`, so OK - but for annual it uses the annual effective monthly amount while the upper card shows that effective monthly amount line-through. That's confusing because the user has *not* committed to annual yet.)
**Expected:** Distinct labels for "annual effective monthly" vs "monthly".
**Fix:** Add explicit "billed annually" / "billed monthly" badges; never label two different numbers identically.

### [P1] [MISSING] Onboarding shows no plan picker; relies on querystring only
**File(s):** `apps/web/src/routes/app/onboarding.tsx` (entire file)
**Issue:** The sidebar/main body only contains legal-acceptance copy. The `searchSchema` accepts `plan`, but the page never offers the user a chance to pick one in-app. If the marketing-site CTA is updated without preserving `?plan=` (or if a user opens onboarding from a stale link), there is no UI to select.
**Expected:** Plan picker inline, mirroring the billing page card grid; remember the selection on resume.
**Fix:** Add a plan-picker step or default selection before "Accept and start 30-day trial".

### [P1] [MISSING] Onboarding has no "resume" affordance / progress indicator
**File(s):** `apps/web/src/routes/app/onboarding.tsx`, `apps/web/src/lib/phase-two-flow.ts`
**Issue:** `phase-two-flow.ts` defines `resolveInitialOnboardingStep` (1..5) and `getMaxAllowedOnboardingStep`, but `onboarding.tsx` never reads or sets `?step=`, has no stepper, and the side-aside labels say "Last step / Accept the BAA". A user who has accepted legal but bounced before trial-start (e.g. network failure between `acceptLegalDocumentsFn` and `startTrialFn`) sees the green "Ready" panel only - they don't know which step they're on or what remains.
**Expected:** Visible step indicator, deep-link resume support (`?step=N`), and clear next-step guidance after partial completion.

### [P1] [STATES] Members page: no loading state, no empty state
**File(s):** `apps/web/src/routes/app/settings.members.tsx:188-211, 289-333`
**Issue:** During initial fetch (`membersState === null`), the page renders the layout with `Active members 0`, `Pending invites 0`, header text "Manage who can access this workspace", and the active-members list is silently empty. No skeleton, no spinner. If `getMembersAndInvitationsFn` throws, the error Alert appears but the rest of the panels still render zeros. No empty-state copy when `members` array is genuinely empty (only `No pending invitations.` text exists for the invitations panel).
**Expected:** Loading skeleton + dedicated empty-state for active members.

### [P1] [STATES] Locations page: no loading state, no error boundary for the locations list
**File(s):** `apps/web/src/routes/app/settings.locations.tsx:191-227`
**Issue:** Same pattern as members. `state === null` shows "0" metrics, an empty directory, and an empty grants list. Errors set the alert above the create form, but the body panels render as if empty. The "Add location" placeholder is `"Satellite Clinic"` even when the create field is disabled (no-plan case) - confusing.
**Expected:** Skeletons; explicit empty-states distinct from loading; alternative placeholder when disabled.

### [P1] [STATES] Integrations page: loading state renders header only, not the FeatureGate
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:206-216`
**Issue:** While `isLoadingIntegrations`, only "Loading integrations..." renders. After resolution, if `orgContext` is missing the page renders an `Alert` of type danger reading the error message or "Select an organization before managing integrations." - this swallows real errors as if they were an org-selection issue.
**Expected:** Distinguish org-not-selected vs load-error states.

### [P1] [STATES] Partners admin: no loading state, no skeleton, no empty Action column
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:154-275`
**Issue:** Loader returns synchronously, but the partners table renders `-` for actions on every non-pending row and the payouts table renders `-` for the reference cell on non-pending rows. No empty-state for the partners table itself other than a single-line "No partners yet." There's no filter/search/sort/pagination on either table (TABLE category).

### [P1] [TABLE] Partners + payouts tables: no sort/filter/search/pagination/export
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:191-400`
**Issue:** Both tables are raw `<Table>` renders. With even 30 partner rows, the admin needs to filter by status (pending vs active vs inactive), sort by LTV/referrals, and search by email/code.

### [P1] [FORM] Members invite form: email field has no validation feedback
**File(s):** `apps/web/src/routes/app/settings.members.tsx:225-258`
**Issue:** The email `<input type="email">` relies on the browser's default validation and `email.trim()` truthiness. There is no inline error for invalid emails, no aria-invalid wiring, no `required`, no error message rendered next to the input. Duplicate-invite or already-member errors come back as raw `(e as Error).message`.
**Expected:** Inline validation + aria-invalid + clear errors.

### [P1] [FORM] Members invite role select: blank-organization race
**File(s):** `apps/web/src/routes/app/settings.members.tsx:80-83`
**Issue:** When `inviteableRoles` is empty (still loading or no permission), `setRole(inviteableRoles[0] ?? FALLBACK_INVITE_ROLE)` runs once; if `inviteableRoles` updates later the effect only fires when current `role` is not in the list, but the initial state is `FALLBACK_INVITE_ROLE = 'location_staff'`. If a permission set excludes `location_staff` but includes other roles, the dropdown briefly contains a value not in `inviteableRoles`.
**Expected:** Compute initial role from server response before render.

### [P1] [BUG] Members: last-admin (and last-owner) protection not enforced in UI
**File(s):** `apps/web/src/routes/app/settings.members.tsx:306-329`
**Issue:** The UI guards only `isOwner` (`org_owner`). An `org_admin` can be demoted/removed via the row controls with no client-side check or warning even if they are the only admin left and the owner is offline. The server may reject, but the UX delegates entirely to error messages.
**Expected:** Client-side check using member counts per role; disable remove/demote with tooltip "This is the last admin."

### [P1] [BUG] Members "Cancel" button overloads the word "cancel"
**File(s):** `apps/web/src/routes/app/settings.members.tsx:370-376`
**Issue:** Cancel-invite button label is `Cancel`; the dialog's cancel-action label is the default `Cancel`. Confusing inside a modal where both buttons read "Cancel".
**Expected:** Use `Cancel invitation` as button label or rename the dialog cancel to `Keep invitation`.

### [P1] [BUG] Locations: 0-grants check uses client-side guard only
**File(s):** `apps/web/src/routes/app/settings.locations.tsx:153-157`
**Issue:** "Location-scoped members must keep at least one location grant" is enforced only in the client; toggling rapidly or via keyboard could still race. Also, the user gets the error inside the create-location Alert area (top of page), not adjacent to the failing checkbox row, which is far below the viewport for large org grids.
**Expected:** Inline error near the row; server-side enforcement (likely exists but the UX is poor).

### [P1] [BUG] Locations: `slug` is read-only label only - no rename impact shown
**File(s):** `apps/web/src/routes/app/settings.locations.tsx:274`
**Issue:** The slug is displayed as `Slug: {slug}` but renaming a location may or may not regenerate the slug. No explanation; users will assume rename changes slug and may build URLs against it.
**Expected:** Tooltip clarifying that slug is immutable, or surface the new slug post-save.

### [P1] [BUG] Integrations: active-connection badge always uses success color
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:373-375`
**Issue:** `<span className="rounded-full bg-success-100 ... text-success-800">{connection.status}</span>` - if a connection is `error`, `revoked`, or `expired`, the chip remains green.
**Expected:** Color by status (warning for expired, danger for error/revoked).

### [P1] [MISSING] Integrations: no token-expiry / refresh-failure state
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:362-403`
**Issue:** Only `status`, `accountEmail`, `createdAt` are surfaced. No "last refreshed", "expires in N days", "needs re-auth", or last-sync-error messaging. Connections that silently fail will look healthy.

### [P1] [MISSING] Billing: no in-app invoice / receipt list
**File(s):** `apps/web/src/routes/app/billing.tsx` (entire), `apps/web/src/server/billing.ts` (no listing fn)
**Issue:** Every invoice/receipt action is delegated to Stripe Portal. No in-app history of charges, no invoice download link, no upcoming-invoice preview, no proration preview when changing plan.
**Expected:** At minimum, list last N invoices with a download link via Stripe API, or a "Recent payments" panel.

### [P1] [MISSING] Billing: no in-app dunning state surfaced beyond a single line
**File(s):** `apps/web/src/routes/app/billing.tsx:371-388`
**Issue:** `past_due` shows one generic banner. No retry schedule, no last-failed-attempt timestamp, no "we will retry on …" copy, no email-resend trigger. CLAUDE.md and audit method call out dunning as in-scope.

### [P1] [MISSING] Billing: no payment-method display
**File(s):** `apps/web/src/routes/app/billing.tsx:289-388`
**Issue:** Active panel says "Billing is live …" but never shows last-4 of the card on file, brand, or expiry. Even the "Trial active" branch doesn't show whether a card is queued.
**Expected:** Surface last-4 brand exp once `hasPaymentMethodOnFile` is true.

### [P1] [MISSING] Billing: confirm block omits BAA-included reassurance and plan member cap
**File(s):** `apps/web/src/routes/app/billing.tsx:531-570`
**Issue:** The cards show plan-features (via `PLAN_FEATURES` from marketing knowledge) but the confirm block at the bottom only re-renders `(PLAN_FEATURES[selectedPlan] ?? []).join(', ')`. It does not echo "BAA included at every tier" - a key marketing promise per CLAUDE.md - and does not echo the staff cap (`PLANS[selectedPlan].maxMembers`).

### [P1] [CONTENT] Billing past-due / paused copy doesn't link to Stripe Portal
**File(s):** `apps/web/src/routes/app/billing.tsx:323-388`
**Issue:** The "Add payment method" button calls `handleManageBilling` which calls `createPortalSessionFn`. If `canManageBilling` is false (read-only viewer), the button is hidden entirely with no "ask your admin" copy. The org just sees red banners with no recourse.

### [P1] [BUG] Billing: `nextAction` calc never returns "Continue to Stripe" for `selection_required + legal accepted`
**File(s):** `apps/web/src/routes/app/billing.tsx:108-122`
**Issue:** The waterfall handles `needsLegalAcceptance`, `requiresPlanSelection`, `requiresTrialStart`, `isPreCheckout`, `isPaused`, `isPastDue`, `isActive`, `isCanceled`, then defaults to `'Choose a plan'`. For a trialing user *with* a payment method on file, the value is `'Manage billing when needed'` - accurate but ignores upcoming renewal date.

### [P1] [STATES] Billing: legal-acceptance status section has no skeleton when `org.legalCurrent` is still loading
**File(s):** `apps/web/src/routes/app/billing.tsx:580-616`
**Issue:** Because the page uses a loader, server data is present on first paint; however the dates use `formatDate(...)` without null-checks - `org.termsAcceptedAt` and `org.baaSignedAt` may be null in mismatched states (one accepted, one not) and the section's first branch (`org.legalCurrent`) won't be hit, but the second branch reads both dates without showing them. Acceptable, but the two non-current paths could clarify which document is missing.

### [P1] [A11Y] Billing plan cards are interactive `<div>`s with no role/keyboard
**File(s):** `apps/web/src/routes/app/billing.tsx:477-485`
**Issue:** `<div onClick={() => setSelectedPlan(planId)} className="cursor-pointer …">` - no `role="button"`, no `tabIndex={0}`, no Enter/Space handler. Keyboard users cannot select a plan via the card.
**Expected:** Use `<button>` or add role/tabIndex/onKeyDown.

### [P1] [A11Y] Members "Open invite link" anchor opens in same tab without warning
**File(s):** `apps/web/src/routes/app/settings.members.tsx:352-357`
**Issue:** Navigating away from the members page loses unsaved state in the role select dropdowns. Consider `target="_blank"` (with `rel="noopener"`) and an icon hint.

### [P1] [A11Y] Locations: name `<input>` rows have no `<label>`
**File(s):** `apps/web/src/routes/app/settings.locations.tsx:204-219, 234-244`
**Issue:** Both the create input and the edit-name inputs lack associated labels (`<label>` or `aria-label`). Screen-reader users get "edit text" with no context.

### [P1] [A11Y] Members "Active members" list role-change `<select>` has aria-label only
**File(s):** `apps/web/src/routes/app/settings.members.tsx:307-320`
**Issue:** `aria-label={`Change role for ${displayName}`}` is good, but submitting on change (no confirm) makes it easy to misclick. Consider a confirm modal for role downgrades.

### [P1] [BUG] Onboarding "Continue to dashboard" button reuses `handleAcceptAndStart`
**File(s):** `apps/web/src/routes/app/onboarding.tsx:262-268`
**Issue:** When `legalStatus === 'accepted'` the Ready panel calls `handleAcceptAndStart` again. That function re-runs `bootstrapOrganizationFn` (skipped - orgName already set), the legal block (skipped - `legalStatus === 'accepted'`), then `selectPlanFn` *only if* `search.plan` is set, then `startTrialFn`. If trial is already started, `startTrialFn` returns existing trial dates without error (per server code path) - OK - but the button text "Continue to dashboard" misrepresents that an action runs.
**Expected:** Plain navigation when already accepted+trialing.

### [P1] [BUG] Onboarding: `legalStatus === 'accepted'` redirect race
**File(s):** `apps/web/src/routes/app/onboarding.tsx:95-100`
**Issue:** If `org.planStatus === 'trialing' || 'active'` the page navigates to dashboard immediately - but a user who is `legalStatus === 'accepted'` and `planStatus === 'trial_pending'` lands on the green panel and must click the button. There is no auto-resume for the trial-pending case despite the flow being ready.

### [P1] [NAV] No `eyebrow` on settings/onboarding/partners pages; billing has one
**File(s):** `settings.members.tsx:187`, `settings.locations.tsx:186`, `settings.integrations.tsx:200`, `admin.partners.tsx:156`
**Issue:** `billing.tsx` uses `eyebrow={appPublicGuidanceCopy.billing.title}`; the four others omit it. Inconsistent with the established pattern.

---

### [P2] [INCONSISTENCY] Mix of `<Button>` and raw `<button className="rounded-full …">`
**File(s):** `apps/web/src/routes/app/billing.tsx:336-342, 359-366, 379-386, 420-425`, `settings.members.tsx:321-328, 362-376`, `settings.locations.tsx:249-271`, `settings.integrations.tsx:387-394`
**Issue:** Some CTAs use the shared `Button` primitive, others hand-roll Tailwind utilities. Drift in radius (`rounded-full` vs `rounded-md`), padding, focus-ring.

### [P2] [INCONSISTENCY] `formatCurrency` is reimplemented locally in admin.partners
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:49-51`
**Issue:** `formatUsd` / `formatRoundedUpUsd` already exist in `@phiguard/billing/plans` for dollar values. The partner amounts are cents, so it's not 1:1, but a shared cents-to-usd helper should live in `packages/billing` or `packages/ui`.

### [P2] [DUPLICATE] `formatPlanPrice` and `getPlanPriceDisplay` in billing-catalog overlap
**File(s):** `apps/web/src/lib/billing-catalog.tsx:13-54`
**Issue:** Both functions wrap `getPlanPromotionPriceDisplay` and return slightly different shapes. `getPlanPriceDisplay` is unused in the audited surfaces - check for DEAD.

### [P2] [CONTENT] Onboarding sidebar says "Last step" even on first visit
**File(s):** `apps/web/src/routes/app/onboarding.tsx:283-291`, `packages/knowledge/src/app.ts:61-62`
**Issue:** A first-time user with no prior steps sees "Last step / Accept the BAA. Start the trial." This may confuse - there is no "previous step" the user completed in-app.

### [P2] [CONTENT] Promo banner missing on billing page even though `getActivePromotion()` exists
**File(s):** `apps/web/src/routes/app/billing.tsx:429-437`
**Issue:** `CommercialOfferNote` is only rendered inside the "no active plan" branch. Trialing / paused / past-due users never see the limited-offer note.

### [P2] [CONTENT] Billing: legal status dates don't match between body and confirmation
**File(s):** `apps/web/src/routes/app/billing.tsx:583-589`
**Issue:** `formatDate(org.termsAcceptedAt, { dateStyle: 'long' })` will render "Invalid Date" or empty if the value is null. The branch already guards with `org.legalCurrent`, but the second branch checks `org.baaSignedAt && org.termsAcceptedAt` which excludes the partial-acceptance case; the third branch is reached if neither is set, but if exactly one is set the user sees the partial branch's copy with no detail of which side is missing.

### [P2] [STATES] Billing: skeleton for `org.usedFeatures`
**File(s):** `apps/web/src/routes/app/billing.tsx:466-516`
**Issue:** While `org.usedFeatures` is server-loaded, the per-card "Covers all features you used" / "Missing N" chip only renders when `usedFeatures.length > 0`. A trialing user with zero usage sees no signal - fine - but the absence is silent.

### [P2] [STATES] Integrations: "no connections yet" empty state is missing
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:358-404`
**Issue:** Empty state hides the entire "Active connections" panel rather than rendering one with copy: "No clinic-approved accounts connected yet."

### [P2] [STATES] Partners: payouts empty state copy mentions "Run Payouts" (capitalized) but button label is "Run payouts"
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:160-163, 280-282`
**Issue:** Casing mismatch.

### [P2] [A11Y] Members: ROLE_LABELS dictionary has lowercase keys; if server returns an unknown role, the badge shows raw snake_case
**File(s):** `apps/web/src/routes/app/settings.members.tsx:30-36, 302-304`
**Issue:** Fallback is `member.role` raw string. Make explicit "Unknown role" copy.

### [P2] [A11Y] Locations: status chip shows `Primary` for primary locations regardless of actual status
**File(s):** `apps/web/src/routes/app/settings.locations.tsx:246-248`
**Issue:** `{location.isPrimary ? 'Primary' : location.status}` - a primary location that's inactive will still read "Primary"; users can't see status.

### [P2] [BUG] Integrations: callback search-params are read on mount but never cleared
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:135-154`
**Issue:** `?status=connected` stays in the URL after the notice fires; on subsequent reload/back the notice fires again and `loadData()` is re-invoked, which can race with the initial `loadData()`.
**Expected:** Strip the query after consumption with `router.navigate({ search: { ... } })`.

### [P2] [BUG] Integrations: `INTEGRATION_CALLBACK_ERROR_MESSAGES.token_exchange` only fires for `reason=token_exchange`, but the API route also redirects with other reasons (e.g. `tenant_resolution_failed`) which fall through to "Integration connection failed. Please try again."
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:39-46`, `apps/web/src/routes/api/integrations/$provider.callback.tsx:60-200`
**Issue:** Generic fallback masks the specific failure reason.

### [P2] [BUG] Billing: `selectedPlan` defaults to `minimumPlanForUsage` which can be lower than current plan
**File(s):** `apps/web/src/routes/app/billing.tsx:45-51`
**Issue:** If the user has used no advanced features yet, `minimumPlanForUsage = 'essentials'` regardless of which plan they're on. For users mid-trial on `clinic`, the picker pre-selects `essentials`. The current plan ought to be the default selection.

### [P2] [BUG] Admin partners: "Mark Paid" button uses `bg-success-600` Tailwind hardcoded instead of `Button` variant
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:382-391`
**Issue:** Bypasses design tokens.

### [P2] [BUG] Members section header counts use array `.length`, ignoring pagination - fine today but no pagination exists
**File(s):** `apps/web/src/routes/app/settings.members.tsx:178-181, 289, 337`
**Issue:** TABLE category. No pagination on members or invitations; a 100-member org will scroll forever.

### [P2] [CONTENT] Integrations callout uses "best-effort calendar-based task scheduling" - borderline jargon for healthcare admins
**File(s):** `apps/web/src/routes/app/settings.integrations.tsx:249-253`
**Issue:** Consider "due-date reminders in your clinic calendar". Already says generic due-date reminders in the compliance dialog - be consistent.

### [P2] [BUG] Partners table renders `p.website` as link without basic URL validation
**File(s):** `apps/web/src/routes/app/admin.partners.tsx:218-231`
**Issue:** `<a href={p.website}>` without checking scheme; if a partner submits `javascript:…`, the anchor is dangerous. `rel="noopener noreferrer"` is set but href is not sanitized.
**Expected:** Validate `http(s)://` prefix client- or server-side; this is a system-admin surface but still.

### [P2] [DEAD] `getPlanPriceDisplay` in `lib/billing-catalog.tsx` appears unused inside `apps/web/src/routes/app/`
**File(s):** `apps/web/src/lib/billing-catalog.tsx:13-27`
**Issue:** Only `formatPlanPrice` and `CommercialOfferNote` are imported in the audited files. Verify with broader grep before removal.

### [P2] [STATES] Onboarding: `documentsLoadError` and `!canManageLegal` notice can stack visually with `error`
**File(s):** `apps/web/src/routes/app/onboarding.tsx:555-570`
**Issue:** Up to three red banners can render simultaneously. Consolidate.

---

End of audit. 38 findings; do not fix.
