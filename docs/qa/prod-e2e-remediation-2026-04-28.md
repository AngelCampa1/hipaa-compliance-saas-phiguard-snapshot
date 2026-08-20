# PHIGuard Production E2E Remediation Plan

**Date:** 2026-04-28
**Surface:** `https://my.phiguard.app` only
**Tooling:** `playwright-cli` via `npx --package @playwright/cli playwright-cli`
**Artifacts:** `output/playwright/prod-e2e-20260428/`
**Synthetic account:** `prod-e2e-20260428-0838@example.com` / password redacted
**Synthetic org:** `PHIGuard Prod E2E Clinic 20260428-0838`

## Summary

Production signup, legal acceptance, no-card trial start, login/logout, task creation, checklist assignment, incident creation, audit/report navigation, billing, and most plan-gated pages loaded successfully. The main production blockers are object-storage upload credentials and an uncaught SOC 2 feature gate on the access-review route.

Synthetic data created:

- Task: `PROD-E2E-20260428 task`
- Comment: `PROD-E2E-20260428 comment. No PHI.`
- Checklist: `Access Review`
- Incident: `PROD-E2E-20260428 incident`
- Invite: `prod-e2e-invite-20260428@example.com`

## Findings

### P1 - Production uploads fail with `Credential is missing`

**Routes:** `/app/tasks/:taskId`, `/app/compliance/checklists/:checklistId`
**Artifacts:** `bug-task-upload-credential-missing.png`, `bug-checklist-evidence-credential-missing.png`

**Repro:**

1. Sign in as the synthetic account.
2. Open the synthetic task and click `Upload attachment`.
3. Upload `prod-e2e-evidence.txt`.
4. Repeat from a checklist item via `Attach evidence file`.

**Actual:** UI shows `Credential is missing`; no attachment/evidence row is created.
**Expected:** Production object storage/object-storage upload succeeds and persists an attachment/evidence record.

**Likely cause:** `apps/web/src/lib/object storage.ts` signs uploads with `getObjectStorageClient()`. In production, `ATTACHMENTS_BUCKET_BUCKET` is configured, but the object-storage credential env vars used by `packages/audit/src/object-storage.ts` (`OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_ACCESS_KEY_ID`, `OBJECT_STORAGE_SECRET_ACCESS_KEY`) appear missing or unavailable to the Worker runtime.

**Remediation:**

- Confirm production Worker secrets include `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_ACCESS_KEY_ID`, and `OBJECT_STORAGE_SECRET_ACCESS_KEY`, or replace presigned uploads with a Worker-mediated upload endpoint that uses the `ATTACHMENTS_BUCKET` binding directly.
- Add a production health check or admin diagnostic for attachment presign readiness.
- Add an e2e case against production-like Worker config that covers task attachment and checklist evidence upload without mock uploads.

### P1 - `/app/soc2/access-reviews` returns 500 on Essentials

**Route:** `/app/soc2/access-reviews`
**Artifact:** `bug-soc2-access-reviews-500.png`

**Repro:**

1. Use an Essentials org.
2. Navigate directly to `/app/soc2/access-reviews`.

**Actual:** Route renders `Something went wrong`; console shows `Feature "soc2_evidence" not available on plan "essentials"` and the route response is 500.
**Expected:** A clean feature-gate/upgrade state, consistent with `/app/soc2`, `/app/soc2/controls`, `/app/soc2/evidence`, and `/app/soc2/auditor`.

**Likely cause:** `apps/web/src/routes/app/soc2.access-reviews.index.tsx` calls `listAccessReviewsFn()` directly in the loader. `FeatureGateError` from `apps/web/src/server/soc2.ts` is not caught for this route, unlike the other SOC 2 routes.

**Remediation:**

- Catch `FeatureGateError` in the access-review index loader and render the same `FeatureGate` fallback used by other SOC 2 pages.
- Add a regression test for Essentials/Clinic orgs visiting `/app/soc2/access-reviews`.
- Verify direct URL and sidebar/link navigation both render the gated state.

### P2 - Several authenticated pages lack a visible `h1`

**Routes observed:** `/app/dashboard`, gated `/app/settings/integrations`, gated Compliance Program routes, gated SOC 2 routes
**Artifacts:** `app-dashboard.png`, `app-settings-integrations.png`, program/SOC2 route screenshots

**Actual:** Some pages expose only side-panel labels or feature-gate text; no visible page-level `h1` is present.
**Expected:** Every authenticated route has one visible `h1`, including feature-gated fallback states.

**Remediation:**

- Add a true `h1` to the dashboard main content.
- Keep route-level headings outside `FeatureGate` wrappers, or make the fallback render a route-appropriate `h1`.
- Add an accessibility smoke test asserting one visible `h1` for the authenticated route matrix.

### P2 - Mobile header action layout is cramped

**Route:** `/app/dashboard` at `390x844`
**Artifact:** `mobile-dashboard.png`

**Actual:** The `+ New task` control wraps into a tall pill in the header and competes with the help button and organization control; the organization selector is partially pushed off the visible header area.
**Expected:** Mobile header actions should remain scannable and not crowd the top bar.

**Remediation:**

- Collapse `+ New task` to an icon-only button with tooltip/accessible label on mobile.
- Hide or move the organization selector into the mobile navigation drawer when only one org is available.
- Add mobile screenshot checks for dashboard, task detail, checklist detail, and settings.

### P2 - Closed mobile navigation is exposed in the accessibility snapshot

**Route:** `/app/dashboard` at `390x844`
**Artifact:** `mobile-dashboard.png`

**Actual:** The accessibility snapshot includes a `dialog` containing the full mobile navigation even when no drawer is visible.
**Expected:** Closed drawer content should be hidden from the accessibility tree until opened.

**Remediation:**

- Ensure the mobile drawer uses `hidden`, `aria-hidden`, or unmounting while closed.
- Give icon-only drawer controls explicit accessible names.
- Add a Playwright accessibility snapshot assertion for closed and open mobile nav states.

### P3 - Onboarding step 2 has stale legal-gate copy after acceptance

**Route:** `/app/onboarding?step=2&plan=essentials`
**Artifact:** `bug-onboarding-stale-legal-copy.png`

**Actual:** Main content says `Terms and BAA accepted and on file`, but the side summary still says trial access cannot begin until the Terms/BAA are accepted.
**Expected:** The summary should update after legal acceptance, e.g. `Legal documents accepted. Continue to trial start.`

**Remediation:**

- Derive the side-summary message from the accepted legal state.
- Add a regression test for returning to step 2 after legal acceptance.

## Passing Coverage

- Signup, plan selection, legal acceptance, no-card trial start, invite step, and returning to onboarding.
- Logout and login with the created production account.
- Task create, status update, comment add, and persistence after reload.
- Checklist assignment and item completion.
- Incident create and `reported -> triaging` transition.
- Audit, audit export page load, reports, billing, members, locations, help, and plan-gated integrations page load.
- No horizontal document overflow found in the desktop route sweep; dashboard had no document-level horizontal overflow at `390x844`.

## Cleanup

Remove or archive the synthetic production org and account after remediation verification:

- User: `prod-e2e-20260428-0838@example.com`
- Organization: `PHIGuard Prod E2E Clinic 20260428-0838`
- Invite: `prod-e2e-invite-20260428@example.com`
- Prefix: `PROD-E2E-20260428`

Do not delete audit records directly; use supported admin/org cleanup tooling or leave the org clearly labeled as synthetic test data.

## Implementation Status

**Code fixes implemented locally:** 2026-04-28

- Uploads now prefer the hosting provider `ATTACHMENTS_BUCKET` binding via same-origin direct uploads, with direct upload signing retained as a fallback.
- Direct upload keys are scoped to the active organization and validate upload content type and known content length.
- `/app/soc2/access-reviews` now renders the SOC 2 feature gate for non-SOC2 plans instead of returning a 500.
- Dashboard, gated SOC 2, gated Compliance Program, and gated Integrations routes now expose visible page-level `h1` headings.
- Closed mobile navigation is unmounted from the DOM, and the mobile header task action is icon-only on small screens.
- Onboarding step 2 side-summary copy now changes once legal acceptance is complete.

**Local verification passed:**

- `pnpm --filter @phiguard/web test`
- `pnpm --filter @phiguard/web typecheck`
- `pnpm --filter @phiguard/web lint`
- `pnpm --filter @phiguard/web test:e2e`
- `pnpm --filter @phiguard/web build`

**Production deploy status:** deployed. After refreshing Wrangler OAuth credentials, `pnpm deploy:web` completed successfully.

**Production re-sweep passed:** 2026-04-28

Command:

- `node output/playwright/prod-e2e-20260428/run-resweep.cjs`

Checks passed against `https://my.phiguard.app`:

- Task attachment upload.
- Compliance checklist evidence upload.
- `/app/soc2/access-reviews` Essentials feature-gate rendering.
- Visible route-level `h1` headings for dashboard, integrations, SOC 2, and Compliance Program routes.
- Closed mobile navigation absent from the accessibility tree, icon-only mobile task action, and no mobile document overflow.
- Onboarding step 2 accepted-legal summary copy.

Re-sweep artifacts:

- `output/playwright/prod-e2e-20260428/resweep-state.json`
- `output/playwright/prod-e2e-20260428/run-resweep.cjs`
- `output/playwright/prod-e2e-20260428/resweep-task-upload.png`
- `output/playwright/prod-e2e-20260428/resweep-checklist-upload.png`
- `output/playwright/prod-e2e-20260428/resweep-mobile-dashboard.png`
- `output/playwright/prod-e2e-20260428/resweep-onboarding-legal.png`
