# Exit-Intent Lead Popup — Revival & Tailoring Design

Date: 2026-06-09
Status: Approved (decisions confirmed by user)

## Problem

The exit-intent lead popup "disappeared." Investigation shows the popup component
(`apps/marketing/src/components/LeadMagnetPopup.astro`) still exists, is rendered by
`MarketingLayout.astro`, is deployed live, and carries Turnstile + page-tailored
magnet picking. It does not visibly fire because of a runtime gate.

### Root cause (verified on live phiguard.app via browser)

`open()` in the popup script bails when the cookie-consent banner is visible:

```js
if (isConsentBannerVisible()) return false
```

The cookie banner (`#cookie-banner`, BaseLayout) stays visible until the visitor
clicks Accept/Decline. Most visitors ignore it, so the popup's trigger fires while
the banner is up, `open()` returns `false`, and the popup never shows. Accepting
cookies clears the gate and the popup works — confirming the diagnosis.

## Goals (user-confirmed)

1. Exit-intent popup captures just an email and delivers a page-tailored lead magnet. *(mostly exists)*
2. Captured leads are enrolled into a genuinely helpful nurture sequence — switch to
   `phiguard-lead-magnet-nurture` (7-email). **Never mention the sequence to the visitor.**
3. Turnstile-protected. *(exists)*
4. Lead magnet tailored to the page being viewed — **expand granularity** beyond today's 5 clusters.

## Changes

### 1. Fix the cookie-banner gate (primary bug) — `LeadMagnetPopup.astro`

Replace the permanent bail with **defer-until-dismissed**:

- When a trigger (desktop exit-intent / mobile scroll / second-page) fires while the
  banner is visible, record a `pendingContext` instead of dropping it.
- Listen for the banner being dismissed (cookie accept/decline buttons, or
  `#cookie-banner` becoming hidden) and then open with the pending context.
- Keep the existing per-trigger retry loops as a fallback.
- The popup is first-party, same-origin, no third-party JS — it does not legally
  require cookie consent; the gate exists only to avoid visual stacking over the
  banner, so deferring (not discarding) is correct.

Verify on a local/preview build with Playwright: dismiss banner is NOT required for
desktop exit-intent to eventually fire; popup never stacks on top of the banner.

### 2. Switch enrollment sequence — `apps/web`

- `apps/web/src/server/sequencer.ts`: add `'phiguard-lead-magnet-nurture'` to the
  `SequenceSlug` union.
- `apps/web/src/routes/api/marketing/leads.tsx`: enroll into
  `phiguard-lead-magnet-nurture` (was `phiguard-nurture-value-1`). Pass page +
  magnet metadata in `properties` (e.g. `lead_magnet`, `source_page_path`, utm).
- Enrollment is already wrapped in try/catch and must not block magnet delivery if
  the sequencer rejects (e.g. sequence not yet seeded in prod D1).
- Update `-leads.test.ts` / `sequencer.test.ts` expectations.

### 3. Expand page→magnet tailoring — `packages/lead-magnets/src/index.ts`

Extend `POPUP_PAGE_CLUSTERS`, `getPopupPageCluster()`, and `POPUP_PICKER_BY_CLUSTER`
to cover more page types, each mapped to 3 relevant magnets from the 60-item catalog.
New/refined clusters (illustrative):

- `risk-analysis`, `incident-response`, `workforce-training` (existing)
- `vendor-management` → `/learn/vendor-management`, guides `is-*-hipaa-compliant`,
  `/resources/guides` → vendor-baa-tracker, hipaa-vendor-security-questionnaire, baa-template
- `compliance-operations` → `/learn/compliance-operations` → hipaa-annual-compliance-program-audit, policy-review-calendar, hipaa-evidence-binder-checklist
- `locations` → `/locations/*` → hipaa-state-law-compliance-checklist, hipaa-state-law-overlay-matrix, hipaa-compliance-self-assessment
- `practice-types` → `/practice-types/*`, `/personas/*` → hipaa-compliance-self-assessment, telehealth-compliance-workflow-checklist, hipaa-risk-analysis-template
- `commercial` (pricing/compare/alternatives/hipaa-software/best) → vendor-baa-tracker, hipaa-pm-tool-comparison-guide, hipaa-software-comparison-scorecard
- `training` → `/learn/workforce-training` + training pages → hipaa-new-hire-checklist, hipaa-annual-training-log, hipaa-staff-training-quiz-template
- `general` (fallback) → unchanged

Every path must still resolve to a sensible 3-magnet picker. Update `index.test.ts`.

## Non-goals / guardrails

- Do not mention "sequence", "series", "drip", or "you're subscribed" in any
  visitor-facing copy (popup, thank-you page, delivery email). Audit and confirm.
- Any visitor-facing copy that changes must pass `humanizer` + `third-grade-copy`.
- No third-party JS added to marketing pages. Turnstile stays.
- Marketing deploy is manual wrangler; deploy + live-verify after merge.

## Verification

- Unit: `pnpm --filter @phiguard/lead-magnets test`, web leads/sequencer tests.
- Browser: local/preview marketing build — confirm popup fires on exit-intent without
  needing to dismiss the cookie banner, and never stacks over it; tailored magnet
  matches page; form submits through Turnstile.
- Post-deploy: live smoke on phiguard.app.
