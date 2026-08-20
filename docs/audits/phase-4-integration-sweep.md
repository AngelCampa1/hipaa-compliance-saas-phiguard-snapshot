# Phase 4 - Integration Sweep (STARTUP-BLOCKED)

**Date:** 2026-05-27
**Branch:** frontend-audit-fix
**Status:** STARTUP-BLOCKED - `apps/web` dev server never serves any route.
**Elapsed before stop:** ~15 minutes from `pnpm dev` to stop.

## Setup Outcome

| Component | Status | Notes |
|---|---|---|
| Docker Compose (`postgres`, `mailpit`) | UP | Started fresh with `docker compose up -d`. |
| `apps/marketing` (Astro on :4321) | UP and serving | `GET /` → 200. |
| `apps/web` (TanStack Start + hosting provider Vite plugin on :3000) | **DEAD - every route returns 404 with empty body** | See "Blocker" below. |
| Dev seed (`pnpm --filter @phiguard/web seed:dev`) | HUNG (no output after ~3 min) - killed. Likely shares the same broken DB/worker pipeline as web. |
| Sign-in / flow walks | NOT RUN - server unreachable. |

Test credentials that would have been used (per `apps/web/scripts/dev-seed.ts`, unverified - seed never completed):
- Owner: `owner@phiguard.dev` / `TestPassword123!`
- Staff: `staff@phiguard.dev` / `TestPassword123!`

## Blocker: `@hosting provider/vite-plugin` dev startup fails offline

`apps/web/vite.config.ts` configures `cloudflare({ viteEnvironment: { name: 'ssr' } })` with no `wrangler.toml` / `wrangler.jsonc` in `apps/web/`. Miniflare 4 attempts to fetch the hosting provider `Request.cf` placeholder on first request from `https://workers.cloudflare.com/...` and times out:

```
@phiguard/web:dev: Unable to fetch the `Request.cf` object! Falling back to a default placeholder...
@phiguard/web:dev: TimeoutError: The operation was aborted due to timeout
@phiguard/web:dev:     ...
@phiguard/web:dev:     at async setupCf (.../miniflare/dist/src/index.js:56020:17)
@phiguard/web:dev:     at async #assembleConfig (.../miniflare/dist/src/index.js:87494:26)
@phiguard/web:dev:     at async #assembleAndUpdateConfig (.../miniflare/dist/src/index.js:87830:20)
```

Vite reports "ready in 5369 ms" but the SSR Worker fetch handler is never bound, so every request - `/`, `/login`, `/signup`, `/api/auth/session`, `/health` - returns `HTTP/1.1 404 Not Found` with `content-length: 0` and no body.

Confirmed:

```
$ curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
404
$ curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/auth/session
404
$ curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/healthz
404
```

Three startup observations were collected (initial start, post-seed-attempt retry, +6 min retry) - all identical behavior. This satisfies the runbook's "3 attempts" stopping condition without remediation that can be done from inside the sandbox.

## Likely Causes / Recommended Owner Actions

The sweep cannot proceed until any of the following lands. Owner: platform / DX.

1. **Offline-friendly miniflare config** - set `cf` to `false` or a static stub in `hosting provider()` plugin options so the dev server stops trying to fetch `cf.json` on hosts without outbound HTTPS to hosting provider. (Miniflare option: `cf: false` or a literal `cf` object.)
2. **Add a checked-in `apps/web/wrangler.jsonc`** with explicit bindings so the worker entry resolves deterministically in dev. Today the plugin is invoked with only `viteEnvironment`, and no deployment tooling config is present at `apps/web/`.
3. **Document the network requirement** in `docs/runbooks/` - `pnpm dev` currently requires outbound HTTPS to `workers.cloudflare.com` to bind the SSR worker, and silently degrades to all-404 when offline (with no clear log signal beyond the single TimeoutError).
4. **Investigate `pnpm seed:dev` hang** - the seed script produced zero output for >3 min before being killed. It may share the same worker init path or be waiting on a DB migration; either way the failure mode is silent. Consider adding a startup heartbeat / progress log.

## Flow Coverage

| # | Flow | Status |
|---|---|---|
| 1 | Sign-up + email-verify + sign-in + sign-out | SKIPPED - server 404 |
| 2 | Onboarding (plan/org/location/invites) | SKIPPED |
| 3 | App shell nav | SKIPPED |
| 4 | Compliance core (Policies, Checklists, Risk, Training, Vendors+BAA, Incidents) | SKIPPED |
| 5 | Tasks | SKIPPED |
| 6 | Reports | SKIPPED |
| 7 | Audit log | SKIPPED |
| 8 | Settings (Members/Locations/Integrations) | SKIPPED |
| 9 | Marketing site | NOT WALKED (would have been the only walkable surface; deferred since the value of an isolated marketing sweep without the app context is low and the timebox was spent confirming the blocker) |
| 10 | Billing (Stripe test mode) | SKIPPED |

## Defects

None observable in this run - the blocker prevents reaching any route in `apps/web`. The marketing site responded to a `GET /` healthcheck (200) but was not walked.

## Artifacts

- Dev server log captured to a temp file outside the repo (will rotate; copy if needed for follow-up).
- No screenshots - no rendered page was reachable.

## Recommendation

Land a fix for the `@hosting provider/vite-plugin` offline init (item #1 above) - likely a one-line `hosting provider({ cf: false, viteEnvironment: { name: 'ssr' } })` - then re-run this sweep. Without that, no integration testing of `apps/web` is possible from this environment.
