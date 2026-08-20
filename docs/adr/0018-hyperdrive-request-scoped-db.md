# ADR 0018: Hyperdrive + Per-Request DB Scoping for apps/web

**Status**: Accepted
**Date**: 2026-06-01

## Context

`apps/web` runs on Cloudflare Workers and connects to Neon Postgres through
Cloudflare Hyperdrive. At runtime `apps/web/src/lib/runtime-env.ts` maps the
`env.HYPERDRIVE` binding's connection string (a `*.hyperdrive.local` host) into
`process.env.DATABASE_URL`. The driver stack is `postgres` (postgres-js, TCP) +
`drizzle-orm/postgres-js`, under the `nodejs_compat` flag.

Three runtime files detect the `.hyperdrive.local` host and switch to
per-request behavior:

- `packages/db/src/client.ts`: `getDb()` returns a per-request postgres-js
  client via an `AsyncLocalStorage` store (`withDbContext`), with TLS disabled
  (Hyperdrive terminates locally), `prepare: false`, `fetch_types: false`, and a
  capped pool (`max: 5`). The scoped client is closed when the request settles.
- `packages/auth/src/auth.ts`: `getAuth()` builds a fresh better-auth instance
  per request under Hyperdrive instead of caching `_auth`, so the auth instance
  never carries a DB client across requests.
- `apps/web/src/middleware/rate-limit.ts`: uses a request-scoped store under
  Hyperdrive and derives the client IP from `cf-connecting-ip` first.

On 2026-06-01 a half-finished refactor that **removed** this per-request scoping
(treating it as Hyperdrive-specific cruft) was deployed to production. It took
down the database and auth paths: `/healthz` returned `503 database:error` and
sign-in returned intermittent 500s. `turbo build`, `turbo typecheck`, and
`turbo test` all passed. Only `pnpm smoke:prod` surfaced the breakage. Recovery
was a `wrangler rollback` followed by restoring the three files.

Two motivations for "getting off Hyperdrive" were considered and rejected:

1. **Simplification**: the belief that per-request scoping exists *because of*
   Hyperdrive and could be deleted by leaving it. This is false. Cloudflare
   Workers cannot reuse a TCP-socket-backed client across request boundaries
   (doing so crashes later requests with cross-request I/O errors). Per-request
   scoping is a **Workers + TCP** constraint, independent of Hyperdrive, so it
   must stay regardless of the connection target.

2. **Cost**: the belief that leaving Hyperdrive would save money. Verified
   against vendor docs (June 2026):
   - Hyperdrive is **included at no extra charge** on both Workers Free and Paid
     plans: no per-query, per-GB, or per-connection fee. It both pools origin
     connections and caches read queries (default 60s TTL).
     (https://developers.cloudflare.com/hyperdrive/platform/pricing/)
   - Neon bills primarily on **compute active-time** (CU-hours) and scales the
     compute to zero after ~5 minutes of inactivity; every query resets that
     timer. (https://neon.com/docs/introduction/scale-to-zero,
     https://neon.com/pricing)
   - Removing Hyperdrive removes the edge read cache and edge connection pool, so
     more live queries reach Neon and keep its compute awake longer, which can
     only hold CU-hours flat or **increase** them. There is no Cloudflare saving
     to capture (Hyperdrive was free). Net effect on cost: neutral-to-worse.

A third constraint independently rules out the only "Workers-native" driver that
could remove socket handling: `drizzle-orm/neon-http` has **no interactive
transaction support** (runtime error: `No transactions support in neon-http
driver`). The codebase has ~75 `db.transaction(async (tx) => {...})` call sites,
including the HIPAA-critical transactional audit hook in
`packages/audit/src/helpers.ts` (`auditedWrite` writes the mutation and its audit
event in one transaction: "no PHI write path without an audit trail"). Adopting
neon-http would break all of them.

## Decision

1. **Keep Hyperdrive + per-request DB scoping for `apps/web`.** Do not remove the
   Hyperdrive-aware scoping in `client.ts`, `auth.ts`, or `rate-limit.ts`. It is
   load-bearing for correctness on Workers and is the cheaper option.

2. **Do not adopt `drizzle-orm/neon-http`** while interactive transactions and
   transactional audit hooks exist. Any future move off Hyperdrive must preserve
   interactive transactions (postgres-js TCP or `drizzle-orm/neon-serverless`
   WebSocket) and would still keep per-request scoping. It is not a
   simplification and must be justified by a concrete, documented driver here.

3. **`pnpm smoke:prod` is the runtime gate.** Build/typecheck/unit tests do not
   catch Hyperdrive runtime breakage. Run `pnpm smoke:prod` after every
   `apps/web` production deploy.

4. **Regression guards exist and must stay green.** Tests now fail if the
   per-request scoping is removed:
   - `packages/db/src/client.test.ts`: fresh client per `withDbContext`, client
     closed on settle, Workers client options.
   - `packages/auth/src/__tests__/hyperdrive-scoping.test.ts`: fresh `getAuth()`
     per call under Hyperdrive, cached singleton off it.
   - `apps/web/src/middleware/rate-limit.test.ts`: buckets keyed on
     `cf-connecting-ip` first.

## Consequences

- The per-request scoping in the three files is intentional and protected by
  tests; reviewers should treat its removal as a hard finding unless this ADR is
  superseded.
- Recovery from a bad `apps/web` deploy is `wrangler rollback <prior-version-id>`
  followed by `pnpm smoke:prod`.
- A genuine off-Hyperdrive migration remains possible but requires its own ADR
  with a transaction-preserving driver decision and a cost justification; it is
  not pursued now because it offers no simplification and no cost benefit.
