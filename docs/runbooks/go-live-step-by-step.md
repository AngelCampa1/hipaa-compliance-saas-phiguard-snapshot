# PHIGuard Go-Live Step-by-Step

This runbook reflects the current production plan:

- app hosting: the selected application runtime
- marketing hosting: the selected application runtime
- database: Neon PostgreSQL through the database connection layer
- deploy model: manual wrangler deploy scripts from `master`
- repo: `https://github.com/AngelCampa1/hipaa-compliance-saas-phiguard-snapshot`

It uses repo-managed wrangler deploy scripts only.

## What Is Already Provisioned

These resources already exist in hosting provider:

- database connection layer config: `phiguard-database connection layer`
- database connection layer id: `<hyperdrive-id>`
- object storage buckets:
  - `phiguard-attachments`
  - `phiguard-audit-exports`
  - `phiguard-lead-magnets`
- App runtime config name in [wrangler.jsonc](../../wrangler.jsonc): `phiguard-app`
- Marketing runtime config name in [apps/marketing/wrangler.jsonc](../../apps/marketing/wrangler.jsonc): `phiguard-marketing`

Important constraint:

- `phiguard-marketing`, `phiguard-site`, and `phiguard` are legacy Pages projects and should be deleted only after runtime custom domains are live.
- Any unexpected `phiguard*` Pages project must be verified before adding it to the cleanup allowlist.
- hosting provider should have no PHIGuard Pages projects after cleanup.

## 1. Current Marketing runtime State

Current production marketing runtime:

- runtime name: `phiguard-marketing`
- domain mode: runtime custom domains
- manual deploy command: `run the selected marketing release procedure`
- production hostnames: `phiguard.app`, `www.phiguard.app`

Cleanup command after deployment tooling authentication:

```bash
pnpm cf:pages:cleanup:phiguard
pnpm cf:pages:list
```

The cleanup command is a dry-run by default. Add `-- --confirm` only after `phiguard.app`, `www.phiguard.app`, and `my.phiguard.app` pass smoke checks on runtimes.

### Custom domains

The marketing runtime config declares these runtime custom domains:

- `phiguard.app`
- `www.phiguard.app`

If hosting provider blocks domain attachment, remove the old Pages custom domain or DNS ownership first, then redeploy `run the selected marketing release procedure`.

## 2. Release the app runtime With deployment tooling

Use this for `apps/web`, API routes under `apps/web/src/routes/api`, and the root [wrangler.jsonc](../../wrangler.jsonc).

### Important name requirement

The runtime name in the dashboard must match the `name` field in the deployment tooling config in the repo root. Right now that name is:

```json
"name": "phiguard-app"
```

### Deploy command

```bash
run the selected deploy command
```

API-only changes use the same runtime deploy:

```bash
pnpm deploy:api
```

After mixed changes, let the repo choose touched surfaces:

```bash
run the selected release procedure
```

By default this compares `HEAD~1...HEAD` and includes staged and unstaged files in the current worktree, which works after a merge to `master` and catches local follow-up edits before deploy. Use `run the selected release procedure -- --since=<ref>` when deploying a larger known range.

### Custom domain

The runtime config already includes a route for:

- `my.phiguard.app`

After the runtime is first deployed successfully:

1. Open `phiguard-app` in hosting provider.
2. Confirm the custom domain `my.phiguard.app` is attached and active.
3. If hosting provider asks you to create or validate DNS records, accept the generated records.

## 3. Add Production runtime secrets

These are not committed and still need to be set in hosting provider as runtime secrets or vars.

The non-secret AI-CS upstream origin is committed in `wrangler.jsonc` as `AI_CS_WORKER_ORIGIN`; confirm it points at the PHIGuard AI-CS upstream before deploying.

### Required for the app to function

Run these from the repo root, one by one:

```bash
wrangler secret put BETTER_AUTH_SECRET --config wrangler.jsonc
wrangler secret put AUTH_TOKEN_ENCRYPTION_KEY --config wrangler.jsonc
wrangler secret put AUTH_TOKEN_KEY_ID --config wrangler.jsonc
wrangler secret put INTEGRATION_TOKEN_ENCRYPTION_KEY --config wrangler.jsonc
wrangler secret put INTEGRATION_TOKEN_KEY_ID --config wrangler.jsonc
wrangler secret put STRIPE_SECRET_KEY --config wrangler.jsonc
wrangler secret put STRIPE_WEBHOOK_SECRET --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_ESSENTIALS --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_CLINIC --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_GROUP --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_COMPLIANCE_OPS --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_ESSENTIALS_MONTHLY --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_ESSENTIALS_ANNUAL --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_CLINIC_MONTHLY --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_CLINIC_ANNUAL --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_GROUP_MONTHLY --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_GROUP_ANNUAL --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_COMPLIANCE_OPS_MONTHLY --config wrangler.jsonc
wrangler secret put STRIPE_PRICE_COMPLIANCE_OPS_ANNUAL --config wrangler.jsonc
wrangler secret put STRIPE_M80OFF_COUPON_ID --config wrangler.jsonc
wrangler secret put STRIPE_Y80OFF_COUPON_ID --config wrangler.jsonc
wrangler secret put RESEND_API_KEY --config wrangler.jsonc
wrangler secret put RESEND_WEBHOOK_SECRET --config wrangler.jsonc
wrangler secret put EMAIL_FROM --config wrangler.jsonc
wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.jsonc
wrangler secret put PARTNER_TOKEN_SECRET --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_ID --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler.jsonc
wrangler secret put ATTACHMENT_SCAN_REQUEST_URL --config wrangler.jsonc
wrangler secret put ATTACHMENT_SCAN_REQUEST_SECRET --config wrangler.jsonc
wrangler secret put ATTACHMENT_SCAN_WEBHOOK_SECRET --config wrangler.jsonc
wrangler secret put DIRECT_UPLOAD_SECRET --config wrangler.jsonc
wrangler secret put AI_CS_CLIENT_ASSERTION_SECRET --config wrangler.jsonc
wrangler secret put SENTRY_DSN --config wrangler.jsonc
```

### Where each Stripe value comes from

- `STRIPE_SECRET_KEY`
  Stripe Dashboard -> `Developers -> API keys` -> live secret key.
  Expected format: `sk_live_...`

- `STRIPE_WEBHOOK_SECRET`
  Stripe Dashboard -> `Developers -> Webhooks`
  Create an endpoint for:

```text
https://my.phiguard.app/api/webhooks/stripe
```

Then copy the endpoint signing secret.
Expected format: `whsec_...`

- `STRIPE_PRICE_ESSENTIALS`
- `STRIPE_PRICE_CLINIC`
- `STRIPE_PRICE_GROUP`
- `STRIPE_PRICE_COMPLIANCE_OPS`
- `STRIPE_PRICE_ESSENTIALS_MONTHLY`
- `STRIPE_PRICE_ESSENTIALS_ANNUAL`
- `STRIPE_PRICE_CLINIC_MONTHLY`
- `STRIPE_PRICE_CLINIC_ANNUAL`
- `STRIPE_PRICE_GROUP_MONTHLY`
- `STRIPE_PRICE_GROUP_ANNUAL`
- `STRIPE_PRICE_COMPLIANCE_OPS_MONTHLY`
- `STRIPE_PRICE_COMPLIANCE_OPS_ANNUAL`
  Stripe Dashboard -> Products / Prices
  Create one live recurring monthly price and one live recurring annual price per public plan, then copy each live Price ID.
  Expected format: `price_...`
  Use `packages/billing/src/plans.ts` as the billing catalog source of truth and confirm the public-facing display on `/pricing`.
  Public plans are Essentials, Clinic Starter, Group, and Compliance Ops. Annual billing is the default public display.
  The legacy non-cadence price env vars are retained for compatibility, but checkout uses the cadence-specific monthly and annual keys.

- `STRIPE_M80OFF_COUPON_ID`
- `STRIPE_Y80OFF_COUPON_ID`
  Stripe Dashboard -> Products / Coupons
  Create live coupons for the limited subscription offer configured in `packages/billing/src/plans.ts`, then copy each coupon ID.
  Y80OFF is auto-applied to annual subscriptions for 80% off once. M80OFF is auto-applied to monthly subscriptions for 80% off for 12 months. Public plans include a 30-day money-back guarantee.

### Where Sentry values come from

Sentry is optional.
The app still runs without it.

Recommended project structure:

1. `phiguard-marketing` -> project type `Astro`
2. `phiguard-app-client` -> project type `React`
3. `phiguard-runtime` -> project type `hosting provider`

Why this structure is better:

- marketing issues stay separate from authenticated app issues
- browser UI errors stay separate from backend/runtime failures
- alerting, ownership, and triage become much cleaner
- one noisy public landing page bug does not bury server incidents

### Exact setup for the 3-project structure

#### Project 1: marketing

1. In Sentry, click `Create Project`.
2. Name it `phiguard-marketing`.
3. Project type: `Astro`.
4. Finish creation.
5. Open `Project Settings -> Client Keys (DSN)`.
6. Copy the DSN.

Current repo status:

- `apps/marketing` is instrumented for Sentry.
- `PUBLIC_SENTRY_MARKETING_DSN` and `PUBLIC_APP_ENV` should be configured as vars or secrets for the `phiguard-marketing` runtime. `PUBLIC_SENTRY_DSN` remains a runtime fallback only.
- This project can receive production marketing errors now.

#### Project 2: authenticated app browser

1. In Sentry, click `Create Project`.
2. Name it `phiguard-app-client`.
3. Project type: `React`.
4. Ignore Sentry's install snippet because PHIGuard is already instrumented.
5. Open `Project Settings -> Client Keys (DSN)`.
6. Copy the DSN.

Set that DSN as `VITE_SENTRY_APP_DSN` in root `wrangler.jsonc` vars, or export
it in the deploy build environment before running `run the selected deploy command`. This is a
public browser DSN and must be available before Vite builds the client bundle.
Do not set it only with `wrangler secret put`; runtime secrets are runtime
bindings and arrive too late for client-side bundling.

#### Project 3: runtime / backend

1. In Sentry, click `Create Project`.
2. Name it `phiguard-runtime`.
3. Project type: `hosting provider`.
4. Ignore Sentry's install snippet because PHIGuard is already instrumented.
5. Open `Project Settings -> Client Keys (DSN)`.
6. Copy the DSN.

Use that DSN for:

```bash
wrangler secret put SENTRY_DSN --config wrangler.jsonc
```

### Final env mapping

Set the two current app env vars like this:

- `SENTRY_DSN` -> DSN from `phiguard-runtime`
- `VITE_SENTRY_APP_DSN` -> public browser DSN from `phiguard-app-client`, supplied in `wrangler.jsonc` vars or the deploy build environment before the web build

### If you want the shortest acceptable version right now

If you do not want to create the marketing project yet:

- create `phiguard-app-client`
- create `phiguard-runtime`
- set:
  - `SENTRY_DSN` = runtime DSN
  - `VITE_SENTRY_APP_DSN` = app client DSN, set before the web build

What each env var means:

- `SENTRY_DSN`
  Used by the runtime/server runtime.

- `VITE_SENTRY_APP_DSN`
  Used by client-side JavaScript.
  This value is public in the browser bundle.

Important dashboard choices for PHIGuard:

- leave `Session Replay` off
- leave extra PII collection off
- do not add custom data capture that could include PHI

Relevant code paths:

- browser init: [apps/web/src/lib/sentry.client.ts](../../apps/web/src/lib/sentry.client.ts)
- server init: [apps/web/src/lib/sentry.ts](../../apps/web/src/lib/sentry.ts)

Why those exact project types:

- `Astro` because `apps/marketing` is an Astro app
- `React` because the authenticated app browser uses `@sentry/react`
- `hosting provider` because the server/runtime uses `@sentry/hosting provider`

Current behavior in code:

- `sendDefaultPii` is already `false`
- PHI sanitization runs before events are sent
- tracing sample rate is `0.1` in production

source map upload is configured for the web and marketing builds through `@sentry/vite-plugin`.
Set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_RELEASE` in the deploy environment when you want uploads to run; local builds skip upload when those values are absent.
The build configs only emit marketing source maps when those upload variables are present, then delete generated `.map` files after Sentry upload so source maps are not shipped with public runtime assets.

### Google sign-in configuration

PHIGuard supports Google sign-in directly through Better Auth.

If you want Google sign-in live, configure:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Create the Google OAuth app with the production PHIGuard auth endpoints:

1. Open Google Cloud Console.
2. Create or select the production Google Cloud project for PHIGuard.
3. Open `APIs & Services -> OAuth consent screen`.
4. Configure the consent screen for the production app.
5. Add the production app domain:
   - `phiguard.app`
6. Add the production authorized domain:
   - `phiguard.app`
7. Open `APIs & Services -> Credentials`.
8. Create an `OAuth client ID`.
9. Choose application type `Web application`.
10. Add this authorized JavaScript origin:

```text
https://my.phiguard.app
```

11. Add this authorized redirect URI:

```text
https://my.phiguard.app/api/auth/callback/google
```

12. Copy the generated client ID into `GOOGLE_CLIENT_ID`.
13. Copy the generated client secret into `GOOGLE_CLIENT_SECRET`.

Why that redirect URI is correct in this codebase:

- auth requests are handled under `/api/auth/*`
- Better Auth's Google OAuth callback route is `/callback/google`

Before launch, test both flows in production:

- sign up with `Continue with Google`
- sign in with `Continue with Google`

### OAuth integrations if you are turning them on now

```bash
wrangler secret put GOOGLE_OAUTH_CLIENT_ID --config wrangler.jsonc
wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET --config wrangler.jsonc
wrangler secret put GOOGLE_OAUTH_REDIRECT_URI --config wrangler.jsonc
wrangler secret put MICROSOFT_OAUTH_CLIENT_ID --config wrangler.jsonc
wrangler secret put MICROSOFT_OAUTH_CLIENT_SECRET --config wrangler.jsonc
wrangler secret put MICROSOFT_OAUTH_REDIRECT_URI --config wrangler.jsonc
wrangler secret put MICROSOFT_TENANT_ID --config wrangler.jsonc
```

## 4. Verify The Database Path

The Neon database is already wired through database connection layer in [wrangler.jsonc](../../wrangler.jsonc).
Lead and nurture marketing data is stored in the hosting provider marketing database database bound as `MARKETING_DATABASE`.

Current production path:

- Neon Postgres
- database connection layer binding: `database connection layer`
- runtime env sync sets `DATABASE_URL` from `env.database connection layer.connectionString`
- hosting provider marketing database binding: `MARKETING_DATABASE`

Before launch:

1. Confirm the Neon branch/database is the real production database.
2. Run non-marketing Neon migrations against production:

```bash
pnpm --filter @phiguard/db migrate
```

3. Apply marketing database migrations before deploying runtime code that reads marketing tables:

```bash
pnpm exec wrangler d1 migrations apply phiguard-db --remote --config wrangler.jsonc
```

4. Confirm Sequencer is configured for lead capture fulfillment and nurture:

```bash
phiguard-fulfillment-welcome
phiguard-nurture-value-1
phiguard-lead-magnet-nurture
```

The legacy marketing marketing database backfill task has been removed; do not use that path for launch.

5. Seed production compliance checklist templates and SOC 2 controls:

```bash
pnpm --filter @phiguard/web seed:prod
```

6. Confirm the runtime can query Neon and marketing database successfully once deployed.
7. Only after marketing database reads and writes are verified live, rehearse and apply the manual Neon cleanup SQL in [0036_drop_marketing_tables_after_d1_cutover.sql](../../packages/db/manual-migrations/0036_drop_marketing_tables_after_d1_cutover.sql) with the Neon plugin.

## 5. Keep The object storage Setup Aligned

Already completed:

- attachments bucket exists
- audit exports bucket exists
- lead magnets bucket exists
- audit exports retention lock exists
- attachments CORS has been configured from [cloudflare-r2-attachments-cors.json](./cloudflare-r2-attachments-cors.json)

Still verify:

1. Lead magnet assets are uploaded to `phiguard-lead-magnets` before launch. This is mandatory, not optional.
2. Attachment uploads succeed through the runtime-owned `/api/uploads/direct` path.
3. Task attachment completion dispatches malware scan requests with `ATTACHMENT_SCAN_REQUEST_URL` and `ATTACHMENT_SCAN_REQUEST_SECRET` configured.
4. The scanner signs callbacks to `/api/uploads/scan-result` with `ATTACHMENT_SCAN_WEBHOOK_SECRET`, and clean test attachments become downloadable.
5. SOC 2 and audit export downloads resolve through runtime routes.
6. Run `pnpm --filter @phiguard/web verify:lead-magnets` against the deployed marketing site and runtime before sign-off.

## 6. Deploy With deployment tooling

Deploy from an authenticated machine after checks pass.

### App

```bash
run the selected deploy command
```

### Marketing

```bash
run the selected marketing release procedure
```

## 7. Point DNS

Use hosting provider DNS for:

- `phiguard.app` -> runtime custom domain
- `www.phiguard.app` -> runtime custom domain
- `my.phiguard.app` -> runtime custom domain

Verify each hostname resolves and serves valid HTTPS.

## 8. Smoke Test Production

Check these after the first successful deploy:

1. `https://phiguard.app`
2. `https://www.phiguard.app`
3. `https://my.phiguard.app/healthz`
4. signup flow
5. login flow
6. Stripe checkout
7. Stripe webhook endpoint
8. Resend webhook endpoint
9. attachment upload flow, including malware scan request, signed scanner callback, and clean-download transition
10. infected attachment scan result stays blocked from download
11. lead magnet delivery flow, including popup capture, thank-you download, and runtime-backed PDF download

## 9. Remaining Technical Gap

The main remaining launch work is operational verification:

- confirm attachment uploads work in production
- confirm attachment malware scan requests and signed callbacks work in production
- confirm lead magnet download emails and thank-you-page downloads resolve through the runtime route
- run `pnpm --filter @phiguard/web verify:lead-magnets` after deploy and treat failures as launch blockers
- confirm SOC 2 bundle downloads work for authenticated admins

## Sources

- the selected application runtime Custom Domains: https://developers.hosting provider.com/runtimes/configuration/routing/custom-domains/
- the database connection layer with Neon: https://developers.hosting provider.com/database connection layer/examples/connect-to-postgres/postgres-database-providers/neon/
