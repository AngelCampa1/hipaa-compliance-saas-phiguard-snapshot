# Phase 2 Exit Evidence

Last updated: 2026-04-17

This document is the Phase 2 launch-readiness index. It ties each roadmap exit criterion to the code, infrastructure, tests, and runbooks already present in the repository, and it identifies the manual evidence that still has to be collected outside the repo before production launch.

Primary milestone reference: `docs/roadmap.md`

## Exit Criteria

Per `docs/roadmap.md`, Phase 2 is complete when:

1. A prospect can sign up, sign the BAA, pay, and onboard without human intervention.
2. The first incident response drill completes in under one hour.
3. Sentry/application alerts and production smoke checks fire correctly on test events without PHI in payloads.

## Track F: Billing and BAA Flow

### Implemented controls

- Customer legal agreement acceptance:
  - `packages/baa/src/service.ts`
  - `apps/web/src/server/baa.ts`
- Stripe checkout and portal lifecycle:
  - `packages/billing/src/checkout.ts`
  - `packages/billing/src/portal.ts`
  - `packages/billing/src/webhook.ts`
  - `apps/web/src/server/billing.ts`
  - `apps/web/src/routes/api/webhooks/stripe.ts`
- Onboarding and billing gating:
  - `apps/web/src/routes/app/onboarding.tsx`
  - `apps/web/src/routes/app/billing.tsx`
  - `apps/web/src/lib/phase-two-flow.ts`

### Verified behavior

- Checkout is blocked until current Terms and BAA are accepted.
- Checkout success returns the user to onboarding at the post-billing step.
- Ready sessions can resume onboarding after successful checkout instead of being redirected to the dashboard.
- Invite completion advances onboarding to the final start-compliance step.
- Billing and onboarding now describe the same rule: current legal acceptance first, paid activation second.
- Stripe webhook activation is blocked and audited when a checkout completes before current legal acceptance exists on the organization record.

### Automated evidence

- `packages/baa/src/service.test.ts`
- `packages/integration/src/audit-coverage.test.ts`
- `apps/web/src/routes/api/webhooks/-stripe.test.ts`
- `apps/web/src/server/billing.test.ts`
- `apps/web/src/lib/phase-two-flow.test.ts`
- `packages/billing/src/webhook.test.ts`

### Manual evidence still required before production

- Signed clinic BAA test PDF stored in the legal document vault.
- Successful Stripe test-mode subscription activation for each supported plan.
- Successful Stripe customer-portal round-trip for failed-payment recovery.

## Track G: Observability and Hardening

### Implemented controls

- PHI-safe Sentry initialization:
  - `apps/web/src/lib/sentry.client.ts`
  - `apps/web/src/lib/sentry.ts`
  - `apps/web/src/lib/sentry-sanitize.ts`
- Security headers:
  - `apps/web/src/middleware/security-headers.ts`
  - `apps/web/src/server.tsx`
- Structured audit/logging utilities:
  - `packages/audit/src/logger.ts`
  - `packages/audit/src/write.ts`
- Production smoke checks:
  - `scripts/prod-smoke.mjs`
  - `package.json`
- Dependency vulnerability scanning:
  - Manual `pnpm audit` release gate; CI and OSV workflow evidence is not yet present.

### Verified behavior

- `sendDefaultPii` is disabled for both browser and server Sentry initialization.
- `beforeSend` and `beforeSendTransaction` sanitize error and transaction payloads before transmission.
- Session replay is disabled by omission of replay integrations.
- The authenticated app enforces CSP, HSTS, frame protection, MIME sniffing protection, referrer policy, and permissions policy.
- Failed sign-in rejections emit a PHI-safe `"Failed login"` application log line through `apps/web/src/server/auth-log.ts`, suitable for Sentry/application log alerting without PHI.
- The production smoke script verifies the app health endpoint before authenticated flows.
- `pnpm audit` is a manual release gate today. CI and OSV scanning must be added after the current audit findings are resolved so the workflow can run green.

### Automated evidence

- `apps/web/src/lib/sentry.test.ts`
- `apps/web/src/middleware/security-headers.test.ts`
- `apps/web/src/server/auth-log.test.ts`

### Manual evidence still required before production

- Capture one test Sentry event from a non-production environment and archive the sanitized payload screenshot.
- Trigger one non-PHI application alert path in a non-production environment and archive the notification evidence.
- Review hosting provider, object storage, and database-provider audit evidence after a synthetic access/logging test.

## Track H: HIPAA Program Artifacts

### Implemented artifacts

- Vendor BAA inventory:
  - `docs/hipaa/vendors.md`
- Safeguards mapping:
  - `docs/hipaa/safeguards-map.md`
- Threat model:
  - `docs/hipaa/threat-model.md`
- Customer-facing BAA template:
  - `docs/hipaa/baa-template.md`
- Risk analysis template:
  - `docs/hipaa/risk-analysis-template.md`
- Completed 2026 risk analysis register:
  - `docs/hipaa/risk-analysis-register-2026.md`
- Incident response runbook:
  - `docs/runbooks/incident-response.md`
- Breach decision tree:
  - `docs/runbooks/breach-decision-tree.md`
- Access review process:
  - `docs/hipaa/access-review.md`
- Key rotation runbook:
  - `docs/runbooks/key-rotation.md`

### Manual evidence still required before production

- Security Officer assigned by name.
- Legal/privacy counsel assigned by name.
- Completed incident-response drill with start and end timestamps proving completion in under one hour.
- Current infrastructure/vendor BAA acceptance evidence archived according to `docs/hipaa/vendors.md`.
- Stripe and Resend legal-review outcome archived.

## Verification Snapshot

Repository verification completed during implementation:

- `pnpm --filter @phiguard/baa test -- src/service.test.ts`
- `pnpm --filter @phiguard/integration test -- src/audit-coverage.test.ts`
- `pnpm --filter @phiguard/integration typecheck`
- `pnpm --filter @phiguard/web test -- src/lib/sentry.test.ts src/routes/api/webhooks/-stripe.test.ts src/server/baa.test.ts src/server/billing.test.ts src/server/auth-log.test.ts src/lib/phase-two-flow.test.ts`
- `pnpm --filter @phiguard/billing test -- src/webhook.test.ts`
- `pnpm --filter @phiguard/web typecheck`

Known repo-wide verification status:

- Fresh repo-wide release gates still need to be run after the current cleanup work settles. Recent targeted `@phiguard/web` typecheck runs passed during cleanup.
