# Production E2E Bug Report - Full Sweep - 2026-05-06

## Scope

- Targets: `https://phiguard.app` and `https://my.phiguard.app`
- Account: synthetic `PROD_E2E_*` credentials stored only in ignored `.env.local`
- Data entered: synthetic operational text only; no real PHI and no PHI-like patient identifiers
- Artifact directory: `output/playwright/prod-e2e-20260506-full-sweep/`

## Coverage Summary

- Marketing desktop: home, pricing, product, security, HIPAA, BAA, trust, privacy, terms, subprocessors, resources, resources/tools, learn, glossary, partners, unsubscribe, 404, sitemap
- Marketing mobile: home, pricing, product, security, resources, learn, unsubscribe at `390x844`
- Auth/onboarding: signup, check-email continuation, plan selection, Terms + BAA acceptance, no-card trial start, invite step, login, forgot password
- App core: dashboard, tasks list/new/detail, status, assignee, comments, attachment upload, compliance overview, checklists, policies, incidents create/detail/status, audit/export, reports, billing, settings, integrations, help
- Gated/admin: compliance program pages, SOC 2 pages, admin partners, partner portal login/dashboard redirect
- Security/compliance: checked app route script requests, console output, failed requests, and synthetic data boundaries

## Findings

### P2 - Onboarding legal side panel kept stale blocking copy after acceptance

- Status: fixed, deployed, and production-verified.
- Repro:
  1. Create a synthetic production account.
  2. Continue through plan selection.
  3. Accept the current Terms and BAA.
  4. Observe the accepted legal state and the checkout side panel on the same screen.
- Expected: the side panel confirms legal acceptance and says trial access can begin.
- Actual: the main legal card says "Terms and BAA accepted and on file", while the side panel still says trial access cannot begin until acceptance.
- Artifact: `output/playwright/prod-e2e-20260506-full-sweep/legal-accepted-copy-mismatch.png`
- Root-cause candidate: onboarding side-panel copy was static and did not derive from `canContinueFromLegal(legalStatus)`.
- Fix status: code uses `legalCheckoutPanelText` based on `canContinueFromLegal(legalStatus)` and has a static regression in `apps/web/src/__tests__/app-static-contracts.test.ts`.
- Production verification: `output/playwright/prod-e2e-20260506-full-sweep/post-deploy-legal-panel-fixed.png` and `post-deploy-results.json`.

### P3 - Retired draft notice URL returned terminal stale content

- Status: fixed, deployed, and production-verified.
- Repro:
  1. Open `https://phiguard.app/notice-of-privacy-practices`.
  2. Open `https://phiguard.app/notice-of-privacy-practices/`.
- Expected: both legacy draft URLs permanently redirect to the active privacy page.
- Actual: the unpublished draft notice URL previously returned a terminal stale response instead of sending users and crawlers to the current privacy page.
- Fix status: the marketing worker now redirects both slash and non-slash variants to `/privacy`, preserving non-GET methods with `308`.
- Production verification: `curl -I` returned `301` with `Location: https://phiguard.app/privacy` for both slash and non-slash URLs after deploy.

## Non-Issues / Notes

- Marketing 404 returned a branded 404 page with HTTP 404 as expected.
- Marketing sitemap returned HTTP 200 and XML text; no heading is expected.
- Marketing PostHog scripts appeared only on `phiguard.app`, which matches the documented analytics boundary.
- Authenticated `my.phiguard.app` app routes did not load third-party scripts outside first-party app assets and allowlisted hosting provider telemetry.
- Repeated `cdn-cgi/rum?` request aborts were observed during navigation and treated as expected hosting provider browser telemetry noise.
- One app server function request was aborted during navigation away from settings; the destination rendered cleanly and no user-facing error appeared.
- No horizontal overflow was detected in the automated desktop or `390x844` mobile route pass.
- Gated compliance/SOC 2 pages rendered clean access/upgrade surfaces instead of 500s. Admin partner access rendered "Access Denied"; partner dashboard redirected to partner login.
- Post-deploy Sentry check found no unresolved production issues for `phiguard-app-client` or `phiguard-marketing` in the queried window. `phiguard-worker` still has older unresolved issues last seen April 26-27, 2026 with zero events in the current 24h stats; these were not introduced by this sweep.

## Verification Artifacts

- Route sweep JSON: `output/playwright/prod-e2e-20260506-full-sweep/runner-results.json`
- App flow JSON: `output/playwright/prod-e2e-20260506-full-sweep/app-flow-results.json`
- Post-deploy verification JSON: `output/playwright/prod-e2e-20260506-full-sweep/post-deploy-results.json`
- Representative screenshots:
  - `signup-check-email.png`
  - `select-plan.png`
  - `legal-acceptance.png`
  - `trial-start.png`
  - `runner-marketing-home-mobile.png`
  - `runner-app-app-dashboard-desktop.png`
  - `flow-task-detail-created.png`
  - `flow-task-status-updated.png`
  - `flow-task-assigned.png`
  - `flow-task-comment-added.png`
  - `flow-task-attachment-added.png`
  - `flow-incident-detail-created.png`
  - `flow-incident-status-updated.png`
  - `post-deploy-legal-panel-fixed.png`
  - `post-deploy-unsubscribe-heading.png`
  - `post-deploy-notice-redirect.png`

## Cleanup

- Synthetic account and audit records remain in production unless a supported admin cleanup path is added. Audit records are append-only.
- Synthetic task, comment, attachment, and incident records remain attached to the production E2E organization.
