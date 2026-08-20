# Production E2E Bug Report - 2026-05-07

Production targets:

- App: `https://my.phiguard.app`
- Marketing: `https://phiguard.app`

Artifacts: `output/playwright/prod-e2e-2026-05-07/`

## Summary

Production smoke checks passed. Desktop/mobile marketing route sweeps passed for the homepage, pricing, product, security, trust, BAA, terms, privacy, resources, partners, location index, unsubscribe, and 404 pages. Authenticated owner route sweeps passed for dashboard, tasks, compliance, SOC 2, reports, audit, settings, and billing. The non-admin partner payout page correctly denied access.

Role-specific QA credentials for org admin, auditor, location manager, location staff, and partner accounts were not present in `.env.local`, so accepted-account RBAC and valid partner token flows were limited. QA data mutations were restricted to the existing production E2E organization and newly created QA-only invites/uploads.

## Bug 1: Invalid Attachment Type Shows Raw Validation Payload

- Severity: P2
- Status: Fixed in current codebase
- URL: `https://my.phiguard.app/app/tasks/4dd555ea-be80-40c0-99f0-d1535736f629`
- Account/role: production E2E owner
- Evidence: `output/playwright/prod-e2e-2026-05-07/app-task-upload-invalid-type.txt`

Reproduction:

1. Sign in with the production E2E owner account.
2. Open an existing QA task.
3. Click `Upload attachment`.
4. Select `qa-invalid.exe`.

Expected result: The UI shows a concise, safe message such as `File type not allowed`.

Actual result: The page showed a raw structured validation payload:

`[ { "code": "custom", "path": [ "contentType" ], "message": "File type not allowed" } ]`

Root cause: The task detail upload handler displayed `err.message` directly, and shared client error handling did not extract known safe messages from structured validation payloads.

Fix summary:

- `apps/web/src/lib/error-reporting.ts` now extracts known safe validation messages from structured payloads.
- `apps/web/src/routes/app/tasks.$taskId.tsx` now routes upload failures through `getClientErrorMessage`.
- Regression coverage added in `apps/web/src/lib/error-reporting.test.ts`.

Verification:

- `pnpm --filter @phiguard/web test -- src/server/organizations.test.ts src/lib/error-reporting.test.ts src/lib/client-errors.test.ts`

## Bug 2: Canceled Invites Appear Under Pending Invitations

- Severity: P2
- Status: Fixed in current codebase
- URL: `https://my.phiguard.app/app/settings/members`
- Account/role: production E2E owner
- Evidence:
  - `output/playwright/prod-e2e-2026-05-07/app-members-after-resend.txt`
  - `output/playwright/prod-e2e-2026-05-07/app-members-cancel-confirm.txt`

Reproduction:

1. Sign in with the production E2E owner account.
2. Open Members.
3. Invite `prod-e2e-invite-20260507-094619@example.com` as Auditor.
4. Click `Resend`.

Expected result: The Pending invitations section lists only active pending invitations.

Actual result: The section titled `Pending invitations (1)` showed both the canceled original invite and the newly pending invite.

Root cause: Better Auth returns historical invitation rows, and `getMembersAndInvitationsFn` passed them directly to the members page while only the count filtered to `pending`.

Fix summary:

- `apps/web/src/server/organizations.ts` now filters invitations to pending before returning member page state.
- Regression coverage added in `apps/web/src/server/organizations.test.ts`.

Verification:

- `pnpm --filter @phiguard/web test -- src/server/organizations.test.ts src/lib/error-reporting.test.ts src/lib/client-errors.test.ts`

## Bug 3: Invalid Partner Magic Link Has No Visible Error

- Severity: P3
- Status: Fixed in current codebase
- URL: `https://my.phiguard.app/partner/verify?token=invalid-prod-e2e-2026-05-07`
- Account/role: unauthenticated partner flow
- Evidence:
  - `output/playwright/prod-e2e-2026-05-07/partner-login-snapshot.txt`
  - `output/playwright/prod-e2e-2026-05-07/partner-invalid-token.txt`

Reproduction:

1. Open `/partner/verify?token=invalid-prod-e2e-2026-05-07`.
2. Observe redirect to `/partner/login?error=invalid-link`.

Expected result: The partner login page explains that the sign-in link is invalid or expired.

Actual result: The partner login page showed the normal form with no visible error.

Root cause: `/partner/login` did not parse or render the `error=invalid-link` query parameter used by `/partner/verify`.

Fix summary:

- `apps/web/src/routes/partner.login.tsx` now validates the `error` search param and displays a safe invalid-link message.
- Regression coverage added in `apps/web/src/routes/-partner.login.test.ts`.

Verification:

- `pnpm --filter @phiguard/web test -- src/routes/-partner.login.test.ts src/server/partners.test.ts`

## Coverage Completed

- Smoke: production smoke script passed.
- Marketing: desktop and mobile browser sweep completed for key public pages with screenshots.
- Auth: login, logout redirect behavior, and unauthenticated protected-route redirect verified.
- App owner routes: dashboard, tasks, compliance, SOC 2, reports, audit, settings, billing, and admin partner access denial checked.
- Audit export: CSV downloaded, had expected headers, and contained QA organization data.
- Attachments: allowed text upload persisted after reload; invalid executable upload was rejected.
- Invites: create, resend, and cancel confirmation UI exercised on QA-created invitation.
- Partner: partner login page and invalid token behavior checked.

## Coverage Blocked Or Limited

- Accepted-account RBAC for org admin, auditor, location manager, and location staff was blocked by missing role credential env vars.
- Valid partner magic-link dashboard session was blocked by missing partner credential/token retrieval path.
- Admin partner payout mutation testing was blocked by lack of QA-only admin access and payout fixtures in the available credentials.
- Fresh legal onboarding was not completed because creating new production credentials without an email capture path would leave unmanaged accounts.
- Full multi-location restricted-role scoping was limited to owner-visible route checks because accepted restricted-role accounts were not available.

## Follow-Up Attachment Persistence Pass

Production was retested against `https://my.phiguard.app` with the root `.env.local` production E2E account using `PROD_E2E_EMAIL`, `PROD_E2E_PASSWORD`, `PROD_E2E_ORG`, `PROD_E2E_BASE_URL`, and `DATABASE_URL` variable names only. No real PHI was entered.

The previous billing schema drift bug remains fixed in production. This follow-up pass found and fixed one additional production bug: task attachments uploaded successfully but disappeared after page reload because persisted attachments were never loaded into the task detail page.

Artifacts are under `output/playwright/prod-e2e-2026-05-07/`.

### P1 - Uploaded Task Attachments Disappeared After Reload

- **Status:** Fixed, deployed, and verified in production
- **URL:** `https://my.phiguard.app/app/tasks/4dd555ea-be80-40c0-99f0-d1535736f629`
- **Role/account:** Production E2E org owner account
- **Viewport:** Desktop browser session through `playwright-cli`
- **Expected:** After uploading an allowed attachment to a QA-created task, reload should still show the persisted attachment row with filename, content type, and size.
- **Actual before fix:** Upload completion succeeded and the attachment row appeared immediately, but after reload the Attachments section returned to `No attachments yet.`
- **Severity:** P1. Evidence persistence is a compliance-facing workflow; the object and DB row existed, but the UI hid the persisted record after reload.
- **PHI/compliance impact:** No real PHI used in testing. The bug affects evidence/attachment visibility for compliance records.
- **Root cause:** `apps/web/src/routes/app/tasks.$taskId.tsx` initialized `attachments` as empty client state and only appended newly uploaded attachments. There was no DB read helper or server function to load persisted task attachments on task detail route load.
- **Fix:** Added `listTaskAttachments` in `packages/db/src/tasks/index.ts`, exposed it via `listTaskAttachmentsFn` in `apps/web/src/server/tasks.ts`, and hydrated task detail attachments from `beforeLoad`.
- **Regression tests:**
  - `packages/db/src/tasks/tasks.test.ts`: verifies tenant-scoped persisted attachment reads.
  - `apps/web/src/server/tasks.test.ts`: verifies the web server function loads attachments for the scoped task.
- **Verification evidence:**
  - Before fix: upload row `1778163438582_qa-attachment.txt text/plain / 34 bytes` disappeared after reload.
  - After deploy: the same attachment remained visible after reload.
  - Route log: `output/playwright/prod-e2e-2026-05-07/logs/route-sweep-cli.txt`

### P0 - Billing Page Returned 500 In Production

- **Status:** Previously fixed and still verified in this pass
- **URL:** `https://my.phiguard.app/app/billing`
- **Previous root cause:** Production DB schema was missing additive objects from `0040_feature_usage_and_interested_plan.sql`.
- **Current evidence:** `/app/billing` renders `Manage billing, trial access, and plan details` in the route sweep log.

### Follow-Up Coverage Notes

- **Login/session:** Existing production E2E credentials succeeded; no replacement account was created.
- **Task flow:** Created a QA task with synthetic title/description, uploaded `qa-attachment.txt`, verified upload completion, reproduced reload persistence bug, deployed fix, and verified persistence after reload.
- **Authenticated route sweep:** Billing, members, locations, integrations, compliance dashboard, checklists, program, incidents, audit, audit export, reports, SOC 2, admin partner, and partner routes were navigated with CLI snapshots/screenshots. The long loop timed out near the end, but logged coverage through `/app/audit/export`; earlier direct navigation covered the task detail fix.
- **Billing:** Billing page rendered plan and legal acceptance UI. No live Stripe payment was completed.
- **Destructive flows:** No non-QA records were modified or deleted. No legacy static hosting cleanup or infrastructure destructive action was run.

### Follow-Up Gaps

- Full multi-role invite acceptance/RBAC testing for org admin, auditor, location manager, and location staff was not completed.
- Forgot-password reset token retrieval/change-password flow was not completed.
- Partner valid magic-link click-through was not completed; invalid/unauthorized partner routes were partially navigated.
- Admin partner payout mutations were not run.
- Attachment download/open was later wired through `downloadTaskAttachmentFn`; clean attachments now render a `Download attachment` action, while pending, skipped, or infected files remain blocked.

### Follow-Up Verification Commands

- `git pull --ff-only`: already up to date
- `npx --version`: `10.9.2`
- `pnpm install`: laid down dependencies; native optional `cpu-features` build reported a compiler detection failure, but workspace commands used for this fix ran successfully
- `pnpm --filter @phiguard/db test -- src/tasks/tasks.test.ts`: passed
- `pnpm --filter @phiguard/web test -- src/server/tasks.test.ts`: passed
- `pnpm --filter @phiguard/web typecheck`: passed
- `pnpm --filter @phiguard/web test`: passed
- `pnpm --filter @phiguard/web lint`: passed
- `pnpm deploy:web`: passed and deployed the web/API Worker
- Production retest with `playwright-cli`: passed for attachment reload persistence
