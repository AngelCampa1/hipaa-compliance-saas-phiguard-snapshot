# Production E2E Bug Report - 2026-05-06

**Surfaces tested:** `https://phiguard.app`, `https://www.phiguard.app`, `https://my.phiguard.app`  
**Method:** Manual Playwright CLI session commands, snapshots, console logs, network request inspection, and screenshots.  
**Artifacts:** `output/playwright/prod-e2e-20260506/`  
**Synthetic user:** `prod-e2e-20260506-0133@example.com` (password redacted)  
**Synthetic org:** `PHIGuard Prod E2E Clinic 20260506`  
**Synthetic data prefix:** `PROD-E2E-20260506`

No real PHI was entered. Synthetic task/comment/upload data was intentionally labeled and PHI-free.

## Findings

### P1 - Marketing lead capture fails in production because app API omits CORS headers and redirects enhanced form posts

**Route:** `https://phiguard.app/` lead capture form posting to `https://my.phiguard.app/api/marketing/leads`  
**Viewport:** Desktop  
**Repro steps:**
1. Open `https://phiguard.app/`.
2. Enter `prod-e2e-20260506@example.com` in the free resource form.
3. Submit the form.

**Expected:** The form submission succeeds and shows the inbox-success message.  
**Actual:** The browser blocks the cross-origin API response and the form shows `Couldn't send right now. Please try again.`

**Artifact:** `lead-form-after.txt`, `lead-form-console.txt`, `lead-form-requests.txt`  
**Console/network evidence:**
- `Access to fetch at 'https://my.phiguard.app/api/marketing/leads' from origin 'https://phiguard.app' has been blocked by CORS policy`
- `POST https://my.phiguard.app/api/marketing/leads => [FAILED] net::ERR_FAILED`
- After the initial CORS-header fix, production returned `POST https://my.phiguard.app/api/marketing/leads => [302]` to `https://phiguard.app/resources/thank-you?...`; the browser then blocked the redirected cross-origin response.

**Root cause files:** `apps/web/src/routes/api/marketing/leads.tsx`  
**Root cause:** `handleLeadCapture` returned JSON/error responses without `Access-Control-Allow-Origin`, and the route did not expose an `OPTIONS` handler. Marketing forms submit from `phiguard.app` to the app/API host `my.phiguard.app`, so browser CORS enforcement blocked the response even when the API route was otherwise reachable. The handler also used `Content-Type` alone for both body parsing and response negotiation. Enhanced marketing forms send a form body with `Accept: application/json`, so the API parsed correctly but still returned a redirect instead of the JSON response the browser-side fetch expected.

**Fix status:** Fixed and deployed.  
**Regression coverage:** `apps/web/src/routes/api/marketing/-leads.test.ts` now covers allowed marketing-origin success responses, enhanced form submissions with `Accept: application/json`, validation-error responses, preflight responses, and disallowed-origin responses.

**Local verification:**
- `pnpm --filter @phiguard/web test -- src/routes/api/marketing/-leads.test.ts` passed with 16 tests.
- `pnpm --filter @phiguard/web test` passed with 46 files and 320 tests.
- `pnpm --filter @phiguard/web typecheck` passed.
- `pnpm --filter @phiguard/web lint` passed.
- `pnpm --filter @phiguard/web build` passed with existing Vite/TanStack bundle warnings.
- Review agent reported no blocking issues; a disallowed-origin CORS regression test was added from its security test-gap feedback.
- `pnpm test` passed across the workspace.
- `pnpm lint` passed across the workspace and design-system lint.
- `pnpm typecheck` passed across the workspace.
- `pnpm build` passed across the workspace with existing Vite/TanStack bundle warnings.
- `pnpm --filter @phiguard/web test:e2e` passed with 22 Playwright tests.

**Migration decision:** No migrations were run because the diff only touches the marketing lead API route, its tests, and this QA report. No `packages/db`, `packages/marketing-db`, Drizzle migration, or infrastructure files changed.

**Deployment:** `pnpm deploy:web` completed successfully through Wrangler.

**Production verification:** Passed after deployment. Re-tested `https://phiguard.app/` with `prod-e2e-20260506-afterdeploy2@example.com`; the form displayed `Check your inbox - the resource is on its way.`, the button changed to `Sent`, console output contained zero messages, and the network log showed `POST https://my.phiguard.app/api/marketing/leads => [201]`.

**Verification artifacts:** `resweep2-lead-before.txt`, `resweep2-lead-after.txt`, `resweep2-lead-console.txt`, `resweep2-lead-requests.txt`

## Passing Coverage

### Marketing

- `https://phiguard.app/` loaded with no console errors; desktop and mobile snapshots captured.
- `https://phiguard.app/pricing`, `/product`, `/security`, `/hipaa`, `/baa`, `/trust`, `/privacy`, `/terms`, `/subprocessors`, `/resources`, `/resources/`, `/resources/thank-you`, `/resources/tools`, `/resources/guides`, `/resources/best`, `/learn`, `/glossary`, `/practice-types`, `/hipaa-software`, `/compare`, `/partners`, `/unsubscribe`, `/sitemap-index.xml`, `/404-route-prod-e2e-20260506`, and `/500` loaded in the route sweep.
- Mobile navigation at `390x844` exposed the hamburger menu, all primary links, resource group links, sign-in, and trial CTA.
- Expected 404 route rendered the not-found page. Console showed the expected 404 request for the missing route.

### Auth And Onboarding

- Signup created synthetic user `prod-e2e-20260506-0133@example.com`.
- Check-email page rendered and allowed continuing setup.
- Plan selection worked for Essentials.
- Terms and BAA acceptance worked using synthetic legal entity/signature data.
- No-card trial start worked and advanced to invite/compliance-start steps.
- Dashboard loaded after onboarding with the synthetic org in trialing state.

### App

- Dashboard loaded and showed the synthetic org summary.
- Task creation worked for `PROD-E2E-20260506 task`.
- Task status changed from open to in progress.
- Task comment creation worked for `PROD-E2E-20260506 comment. No PHI.`
- Task attachment upload worked for `prod-e2e-evidence.txt`; the uploaded file appeared in the attachments list.
- Authenticated route smoke loaded: `/app/compliance`, `/app/compliance/checklists`, `/app/compliance/incidents`, `/app/compliance/incidents/new`, `/app/compliance/policies`, `/app/compliance/program`, `/app/audit`, `/app/audit/export`, `/app/reports`, `/app/reports/tasks`, `/app/reports/compliance`, `/app/billing`, `/app/settings/members`, `/app/settings/locations`, `/app/settings/integrations`, `/app/help`, `/app/soc2`, `/app/soc2/evidence`, and `/app/soc2/access-reviews`.
- The authenticated smoke sweep reported zero app console errors. Repeated `cdn-cgi/rum` aborted requests occurred during fast route navigation and were treated as navigation-churn telemetry noise, not app/API failures.

## Cleanup Targets

- User: `prod-e2e-20260506-0133@example.com`
- Organization: `PHIGuard Prod E2E Clinic 20260506`
- Task: `PROD-E2E-20260506 task`
- Comment: `PROD-E2E-20260506 comment. No PHI.`
- Attachment: `1778031787701_prod-e2e-evidence.txt`
- Lead capture: `prod-e2e-20260506@example.com`
- Lead capture verification: `prod-e2e-20260506-afterdeploy2@example.com`

Audit records should remain append-only. Use supported admin cleanup paths for synthetic operational data if needed.
