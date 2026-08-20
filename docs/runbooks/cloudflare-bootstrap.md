# Runbook: Cloudflare Production Bootstrap

**Last updated:** 2026-05-20
**Applies to:** PHIGuard production Cloudflare Workers, R2, Hyperdrive, DNS, and Worker secrets

---

## Overview

PHIGuard production hosting is Cloudflare Workers only:

- `phiguard-app` serves `my.phiguard.app`.
- `phiguard-marketing` serves `phiguard.app` and `www.phiguard.app`.
- R2 stores attachments, audit exports, evidence, lead magnets, and legal documents.
- Hyperdrive / Worker database configuration connects the app Worker to the managed PostgreSQL provider.

The historical AWS Terraform bootstrap procedure is no longer the production path. Keep any AWS Terraform state as historical infrastructure evidence only unless a future architecture decision explicitly reactivates it.

## Prerequisites

- Cloudflare account access with permission to manage Workers, R2, DNS, custom domains, Hyperdrive, and Worker secrets.
- Managed PostgreSQL production database created by the database provider.
- `wrangler` installed through the repository dev dependencies.
- `.env.local` or local secret source available for production-only smoke credentials.
- No real PHI in local fixtures or command output.

## Step 1 - Create or Confirm R2 Buckets

Confirm these buckets exist:

- `phiguard-attachments`
- `phiguard-audit-exports`
- `phiguard-lead-magnets`

Apply attachment CORS from `docs/runbooks/cloudflare-r2-attachments-cors.json` if it has not already been applied.

## Step 2 - Configure Worker Database Connectivity

Configure Hyperdrive or the current Worker database connection model so the app runtime receives `DATABASE_URL` through the Worker environment. `apps/web/src/lib/runtime-env.ts` maps Hyperdrive connection strings into `process.env.DATABASE_URL` at runtime.

Verify:

- TLS is required by the database provider.
- The database credential is least-privilege for the application.
- Backup and restore settings are enabled with production retention.
- The credential is not committed to the repo or stored in docs.

## Step 3 - Set App Worker Secrets

Confirm the non-secret app Worker vars in `wrangler.jsonc` before deployment, including `AI_CS_WORKER_ORIGIN` for the AI-CS upstream Worker.

From the repo root, set required secrets with the app Worker config:

```bash
wrangler secret put BETTER_AUTH_SECRET --config wrangler.jsonc
wrangler secret put AUTH_TOKEN_ENCRYPTION_KEY --config wrangler.jsonc
wrangler secret put AUTH_TOKEN_KEY_ID --config wrangler.jsonc
wrangler secret put INTEGRATION_TOKEN_ENCRYPTION_KEY --config wrangler.jsonc
wrangler secret put INTEGRATION_TOKEN_KEY_ID --config wrangler.jsonc
wrangler secret put STRIPE_SECRET_KEY --config wrangler.jsonc
wrangler secret put STRIPE_WEBHOOK_SECRET --config wrangler.jsonc
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
wrangler secret put GOOGLE_CLIENT_ID --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler.jsonc
wrangler secret put PARTNER_TOKEN_SECRET --config wrangler.jsonc
wrangler secret put DIRECT_UPLOAD_SECRET --config wrangler.jsonc
wrangler secret put ATTACHMENT_SCAN_REQUEST_URL --config wrangler.jsonc
wrangler secret put ATTACHMENT_SCAN_REQUEST_SECRET --config wrangler.jsonc
wrangler secret put ATTACHMENT_SCAN_WEBHOOK_SECRET --config wrangler.jsonc
wrangler secret put AI_CS_CLIENT_ASSERTION_SECRET --config wrangler.jsonc
```

If source-map upload is enabled for production builds, set these deploy-environment variables in the environment that runs `pnpm deploy:web` and `pnpm deploy:marketing`:

```bash
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_RELEASE=...
```

Set Google/Microsoft OAuth secrets only if calendar integrations are enabled for production.

For the marketing Worker, set `PUBLIC_TURNSTILE_SITE_KEY` in `apps/marketing/wrangler.jsonc`
or in the deploy environment before `pnpm deploy:marketing`. Keep
`PUBLIC_SENTRY_MARKETING_DSN` and `PUBLIC_APP_ENV` in marketing Worker vars when marketing
runtime error reporting is enabled.

Set the marketing AI-SDR product-context secret and the BFF client assertion HMAC key on the
marketing Worker before enabling the public assistant widget:

```bash
cd apps/marketing
wrangler secret put AI_SDR_CONTEXT_SECRET --config wrangler.jsonc
wrangler secret put AI_SDR_CLIENT_ASSERTION_SECRET --config wrangler.jsonc
```

`AI_SDR_WORKER_URL` is a plain var (not a secret) set to
`https://ai-sdr-worker.<your-subdomain>.workers.dev` in `wrangler.jsonc` vars or
the deploy environment.

## Step 4 - Deploy Workers

```bash
pnpm deploy:web
pnpm deploy:marketing
```

Use `pnpm deploy:touched` after commits when only touched surfaces need deployment.

## Step 5 - Verify Production

Run:

```bash
pnpm smoke:prod
```

Then verify:

- `https://my.phiguard.app/healthz` responds.
- `https://phiguard.app` and `https://www.phiguard.app` serve the marketing Worker.
- App login, billing, task list, uploads, and audit log load for a test organization.
- R2 upload/download flows use Worker-owned `/api/uploads/direct` and signed download paths.
- Sentry receives non-PHI test events if a deployment check is required.

## Step 6 - Legacy Pages Cleanup

After Worker custom domains are live and smoke-tested, remove allowlisted legacy Pages projects only through the guarded cleanup script:

```bash
pnpm cf:pages:cleanup:phiguard -- --confirm
```

The cleanup script must fail closed for any unverified `phiguard*` Pages project.

## Teardown Warning

Production teardown for a PHI-handling environment requires incident/change approval. Before deleting Workers, buckets, Hyperdrive config, or database resources:

1. Export and preserve required audit evidence.
2. Confirm legal retention requirements.
3. Disable new writes.
4. Preserve R2 objects and database backups according to retention policy.
5. Document the approval and evidence location.
