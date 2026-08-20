# Production E2E Bug Report - 2026-05-07

## Summary

Production was tested against `https://phiguard.app` and `https://my.phiguard.app` with the root `.env.local` production E2E account. The sweep captured 123 screenshots in `output/playwright/prod-e2e-2026-05-07/screenshots/` across public marketing pages, authenticated app routes, desktop/mobile viewports, and focused functional flows.

One confirmed production bug was found and fixed during the pass: `/app/billing` returned HTTP 500 because production schema was missing additive objects from the existing `0040_feature_usage_and_interested_plan.sql` migration.

## Confirmed Bugs

### P0 - Billing Page Returned 500 In Production

- **Status:** Fixed and verified in production
- **URL:** `https://my.phiguard.app/app/billing`
- **Impact:** Authenticated users could not view billing, trial status, legal acceptance state, plan selection, or Stripe actions.
- **Evidence before fix:**
  - Screenshot: `output/playwright/prod-e2e-2026-05-07/screenshots/auth-billing-desktop.png`
  - Debug screenshot: `output/playwright/prod-e2e-2026-05-07/screenshots/billing-debug.png`
  - Log: `output/playwright/prod-e2e-2026-05-07/logs/billing-debug.json`
  - Browser result: HTTP 500, `h1` was `Something went wrong`
- **Root cause:** Production DB schema was missing `organizations.interested_plan` and the `feature_usage` table, while deployed code selected `organizations.interestedPlan` in `apps/web/src/server/billing.ts`.
- **Fix applied:** Applied the existing idempotent SQL from `packages/db/drizzle/0040_feature_usage_and_interested_plan.sql` directly to the production database after `drizzle-kit migrate` reported success but did not repair the schema because migration metadata already marked the migration applied.
- **Evidence after fix:**
  - Schema check showed `interested_plan` present and `feature_usage` exists.
  - Retest log: `output/playwright/prod-e2e-2026-05-07/logs/billing-debug-fixed.txt`
  - Retest result: HTTP 200, `h1` was `Manage billing, trial access, and plan details`

## Coverage Notes

- **Marketing desktop/mobile:** Homepage, product, pricing, security, HIPAA, compare, BAA, trust, resources hubs, representative resource pages, alternatives, city/practice/state hubs, glossary, legal pages, unsubscribe, and 404.
- **Authenticated app desktop/mobile:** Dashboard, tasks, task creation page, compliance dashboard, checklists, policies, program modules, incidents, audit, audit export, reports, billing, settings, SOC 2, and help.
- **Functional mutations in E2E tenant:** Created production QA task and incident records with non-PHI titles. Verified task status persisted across reload and incident detail rendered the created incident heading.
- **External side effects skipped:** Real payment checkout, destructive hosting provider actions, non-test invitations, and real document signing were not executed.

## Verification Evidence

- `node scripts/prod-smoke.mjs`: passed all smoke checks.
- `pnpm --filter @phiguard/db migrate`: reported migrations applied successfully, but schema remained out of sync.
- Direct production schema repair using existing `0040` SQL: succeeded.
- Billing retest: HTTP 200 with expected billing heading.
- Functional retest: `taskStatusAfterReload` was `in_progress`; incident heading matched the newly created incident.

## Follow-Up

- Add an operational runbook note for reconciling Drizzle migration metadata with actual production schema when `drizzle-kit migrate` reports success but expected columns are absent.
- Consider adding a production smoke check for `/app/billing` using the existing E2E account so future schema drift blocks deploy verification immediately.
