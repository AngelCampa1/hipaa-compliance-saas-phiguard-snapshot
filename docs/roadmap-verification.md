# Roadmap Verification Snapshot

Last updated: 2026-05-20

This document reconciles `docs/roadmap.md` against the current repository so implementation status, evidence, and remaining blockers stay in one place.

## Phase 0

| Item                                                                    | Status                                                                           | Evidence                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo, auth, web shell, marketing shell, Docker, HIPAA docs scaffold | Implemented                                                                      | `apps/web`, `apps/marketing`, `packages/*`, `docs/adr`, `docs/hipaa`                                                                                                                                                       |
| Repo-wide lint/typecheck/test green                                     | Verified during current cleanup pass                                             | 2026-05-20 cleanup evidence: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `git diff --check` completed successfully. Re-run the same repo-wide gates after any further cleanup edits before release.              |

## Phase 1

| Workstream                            | Status                                                                                                                                                                          | Evidence                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A - Core tasks domain                 | Implemented, with attachment E2E still weaker than roadmap ideal                                                                                                                | `packages/db/src/tasks`, `apps/web/src/routes/app/tasks*`, `apps/web/e2e/tasks.spec.ts`          |
| B - Audit log + immutability          | Implemented                                                                                                                                                                     | `packages/audit`, `apps/web/src/routes/app/audit`, `packages/audit/src/__tests__/write.test.ts`  |
| C - Compliance checklists + incidents | Implemented                                                                                                                                                                     | `packages/compliance`, `apps/web/src/routes/app/compliance/*`, `apps/web/e2e/compliance.spec.ts` |
| D - Marketing site                    | Implemented, pricing/legal copy now aligned with plan limits                                                                                                                    | `apps/marketing`, updated content under `apps/marketing/src/content`                             |
| E - Production infrastructure         | Implemented through the selected application runtime, object storage, database connection layer/runtime database configuration, and wrangler deploy scripts; historical legacy cloud provider infrastructure tooling remains non-authoritative evidence | `package.json`, `apps/web`, `apps/marketing`, `docs/runbooks/hosting provider-bootstrap.md`            |

## Phase 2

| Workstream                     | Status                                                                                                                                                 | Evidence                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| F - Billing + BAA signing flow | Implemented with onboarding resume and webhook BAA invariant now enforced                                                                              | `apps/web/src/server/billing.ts`, `apps/web/src/routes/app/onboarding.tsx`, `packages/billing/src/webhook.ts`, `docs/hipaa/phase-2-evidence.md` |
| G - Observability + hardening  | Implemented in repo, with PHI-safe failed-login logging and Sentry/application log coverage still requiring final live evidence capture                | `apps/web/src/server/auth-log.ts`, `apps/web/src/lib/sentry.*`, `apps/web/src/middleware/*`, `scripts/prod-smoke.mjs`                           |
| H - HIPAA program artifacts    | Implemented as document set with officers, incident contacts, and the completed 2026 risk-analysis register routed through current HIPAA evidence docs | `docs/hipaa/*`, `docs/runbooks/*`                                                                                                               |

## Phase 3

Phase 3 is no longer just planned work. The repository already contains substantial implementation for several expansion streams:

| Expansion track           | Current repo status                                                   | Primary evidence                                                                                                  |
| ------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Multi-location governance | Implemented                                                           | `apps/web/src/server/location-settings.ts`, `apps/web/src/routes/app/settings.locations.tsx`, reports routes      |
| Integrations              | Implemented                                                           | `apps/web/src/server/integrations.ts`, `apps/web/src/routes/app/settings.integrations.tsx`                        |
| Compliance program add-on | Implemented                                                           | `apps/web/src/server/program.ts`, `apps/web/src/routes/app/compliance/program`, related compliance program routes |
| SSO                       | Implemented                                                           | `apps/web/src/server/sso.ts`, `packages/auth/src/sso/*`, `apps/web/src/routes/app/settings.sso.tsx`               |
| SOC 2 prep                | Implemented, with focused fixes continuing through the cleanup effort | `apps/web/src/routes/app/soc2*`, `apps/web/src/server/soc2.ts`, `docs/soc2`                                       |
| Partner channel tooling   | Implemented                                                           | `apps/web/src/server/partners.ts`, partner routes under `apps/web/src/routes`                                     |

## Remaining blockers that still need follow-up

- Final release gating should re-run repo-wide `pnpm lint`, `pnpm typecheck`, `pnpm test`, `git diff --check`, and applicable Playwright runs after any further cleanup edits settle.
- Manual production evidence is still required for current vendor BAA acceptance, incident drill timing, live Sentry/application alert captures, hosting provider/object storage/database-provider audit evidence, and external counsel readiness.
- Phase 1 E2E has task attachment upload coverage and an opt-in direct-upload harness, but production-like direct-upload sweeps still require healthy local Docker services and configured scan callbacks.
