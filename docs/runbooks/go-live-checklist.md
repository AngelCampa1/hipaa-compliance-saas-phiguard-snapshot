# PHIGuard hosting provider Go-Live Checklist

This is the production checklist for the hosting provider + Neon deployment path.

Legend:

- `[ ]` pending
- `[x]` done
- `BLOCKER` launch blocker

## Infrastructure

- [x] object storage bucket `phiguard-attachments` exists
- [x] object storage bucket `phiguard-audit-exports` exists
- [x] object storage bucket `phiguard-lead-magnets` exists
- [x] database connection layer config `phiguard-database connection layer` exists
- [x] database connection layer id is bound in [wrangler.jsonc](../../wrangler.jsonc)
- [x] runtime config includes custom domain route for `my.phiguard.app`
- [x] object storage attachments CORS is set from [cloudflare-r2-attachments-cors.json](./cloudflare-r2-attachments-cors.json)
- [x] Audit export retention lock was created on `phiguard-audit-exports`

## Repo And Deploy Wiring

- [x] `origin` points to `https://github.com/AngelCampa1/hipaa-compliance-saas-phiguard-snapshot.git`
- [x] legacy deploy workflow was removed
- [x] web deploy script uses the repo-root deployment tooling config
- [x] manual app deploy command exists: `run the selected deploy command`
- [x] manual marketing deploy command targets runtime `phiguard-marketing`
- [x] touched-surface deploy command exists: `run the selected release procedure`
- [x] marketing runtime `phiguard-marketing` exists
- [x] runtime `phiguard-app` exists and has a successful manual deploy
- [ ] BLOCKER: delete allowlisted legacy Pages projects `phiguard-marketing`, `phiguard-site`, and `phiguard` after runtime custom domains pass smoke checks
- [ ] BLOCKER: repeat marketing runtime deployment after setting `PUBLIC_CAPTCHA_SITE_KEY`

## Important hosting provider Constraints

- [x] documented that the old Pages project `phiguard-site` was Direct Upload
- [x] documented that the old validation Pages project `phiguard` exists but should not be reused
- [x] documented that production deploys use deployment tooling direct upload scripts
- [x] documented that `phiguard-marketing` is now a runtime, not a Pages project

## Database

- [x] Neon production connection string was provided
- [x] database connection layer was created from the Neon connection string
- [ ] BLOCKER: confirm the Neon database/branch is the intended production target
- [ ] BLOCKER: run production migrations
- [ ] BLOCKER: reconcile migration metadata with the live schema after migrations. If `drizzle-kit migrate` reports success but a smoke check still fails with a missing column or table, compare `packages/db/drizzle/meta/_journal.json` and the production migration metadata table against the actual schema, then apply only the missing idempotent SQL from the already-reviewed migration file.
- [ ] BLOCKER: run production seed
- [ ] BLOCKER: verify the deployed runtime can read/write via database connection layer

## runtime secrets And Runtime Config

- [x] static vars are present in [wrangler.jsonc](../../wrangler.jsonc)
- [ ] BLOCKER: set `AI_CS_WORKER_ORIGIN` to the PHIGuard AI-CS upstream origin
- [ ] BLOCKER: set `BETTER_AUTH_SECRET`
- [ ] BLOCKER: set `AUTH_TOKEN_ENCRYPTION_KEY`
- [ ] BLOCKER: set `AUTH_TOKEN_KEY_ID`
- [ ] BLOCKER: set `INTEGRATION_TOKEN_ENCRYPTION_KEY`
- [ ] BLOCKER: set `INTEGRATION_TOKEN_KEY_ID`
- [ ] BLOCKER: set every required Stripe secret printed by `pnpm billing:env-checklist`
- [ ] compatibility: set every legacy Stripe price secret printed by `pnpm billing:env-checklist`
- [ ] BLOCKER: set `RESEND_API_KEY`
- [ ] BLOCKER: set `RESEND_WEBHOOK_SECRET`
- [ ] BLOCKER: set `EMAIL_FROM`
- [ ] BLOCKER: set `PUBLIC_CAPTCHA_SITE_KEY` for the marketing runtime build
- [ ] BLOCKER: set `CAPTCHA_SECRET_KEY`
- [ ] BLOCKER: set `TURNSTILE_SECRET_KEY`
- [ ] BLOCKER: set `ATTACHMENT_SCAN_REQUEST_URL`
- [ ] BLOCKER: set `ATTACHMENT_SCAN_REQUEST_SECRET`
- [ ] BLOCKER: set `ATTACHMENT_SCAN_WEBHOOK_SECRET`
- [ ] BLOCKER: set `DIRECT_UPLOAD_SECRET`
- [ ] BLOCKER: set `GOOGLE_CLIENT_ID`
- [ ] BLOCKER: set `GOOGLE_CLIENT_SECRET`
- [ ] BLOCKER if calendar integrations are enabled: set `GOOGLE_OAUTH_CLIENT_ID`
- [ ] BLOCKER if calendar integrations are enabled: set `GOOGLE_OAUTH_CLIENT_SECRET`
- [ ] BLOCKER if calendar integrations are enabled: set `GOOGLE_OAUTH_REDIRECT_URI`
- [ ] BLOCKER if calendar integrations are enabled: set `MICROSOFT_OAUTH_CLIENT_ID`
- [ ] BLOCKER if calendar integrations are enabled: set `MICROSOFT_OAUTH_CLIENT_SECRET`
- [ ] BLOCKER if calendar integrations are enabled: set `MICROSOFT_OAUTH_REDIRECT_URI`
- [ ] BLOCKER: set `AI_CS_CLIENT_ASSERTION_SECRET`
- [ ] optional: set `SENTRY_DSN`
- [ ] optional: set browser Sentry DSN as `VITE_SENTRY_APP_DSN` in `wrangler.jsonc` vars or the deploy build environment
- [ ] optional: set `PUBLIC_SENTRY_MARKETING_DSN`
- [ ] optional: set `PUBLIC_APP_ENV`
- [ ] BLOCKER before enabling marketing AI-SDR widget: set `AI_SDR_CONTEXT_SECRET` on `phiguard-marketing`
- [ ] BLOCKER before enabling marketing AI-SDR widget: set `AI_SDR_CLIENT_ASSERTION_SECRET` on `phiguard-marketing`
- [ ] optional source maps: set `SENTRY_AUTH_TOKEN`
- [ ] optional source maps: set `SENTRY_ORG`
- [ ] optional source maps: set `SENTRY_RELEASE`
- [ ] optional emergency: set `PHIGUARD_READ_ONLY_MODE=true` during managed PostgreSQL failover or destructive incident containment

## Attachment Upload And Scan Verification

- [x] documented that task uploads prefer the runtime-owned `/api/uploads/direct` path and the `ATTACHMENTS_BUCKET` binding
- [ ] fallback/tooling: set `OBJECT_STORAGE_ENDPOINT`
- [ ] fallback/tooling: set `OBJECT_STORAGE_ACCESS_KEY_ID`
- [ ] fallback/tooling: set `OBJECT_STORAGE_SECRET_ACCESS_KEY`
- [x] automated regression: scanner callback signatures are verified by `pnpm --filter @phiguard/web test -- src/routes/api/-uploads.scan-result.test.ts`
- [x] automated regression: infected attachments stay blocked from download by `pnpm --filter @phiguard/web test -- src/server/tasks.test.ts`
- [ ] BLOCKER: verify attachment upload dispatches a malware scan request in production
- [ ] BLOCKER: verify scanner callback signs `/api/uploads/scan-result` with `ATTACHMENT_SCAN_WEBHOOK_SECRET`
- [ ] BLOCKER: verify a clean production test attachment transitions to `clean` and becomes downloadable
- [ ] BLOCKER: verify a production infected scanner result leaves the attachment blocked from download
- [ ] BLOCKER: run `pnpm --filter @phiguard/pdf build:local` and review rendered lead-magnet PDFs for production quality
- [ ] BLOCKER: run `pnpm --filter @phiguard/pdf build:pdfs` to upload or verify every lead-magnet PDF in `phiguard-lead-magnets`
- [ ] BLOCKER: run `pnpm --filter @phiguard/web seed:prod` for production compliance checklist templates and SOC 2 controls
- [ ] BLOCKER: verify external Sequencer definitions `phiguard-fulfillment-welcome`, `phiguard-nurture-value-1`, and `phiguard-lead-magnet-nurture` are configured before lead-magnet launch (the exit-intent lead-magnet flow enrolls into `phiguard-lead-magnet-nurture`; enrollment is non-blocking, so a missing definition silently drops leads from nurture without breaking magnet delivery)
- [ ] BLOCKER: run `pnpm --filter @phiguard/web verify:lead-magnets` against production URLs and object storage credentials (`MARKETING_SITE_URL`, `APP_URL`, `LEAD_MAGNETS_BUCKET`, and object storage access credentials/bindings)
- [ ] BLOCKER: verify lead magnet delivery works in production from capture through email download link

## Domains And DNS

- [ ] BLOCKER: attach `phiguard.app` to runtime `phiguard-marketing` as a custom domain
- [ ] BLOCKER: attach `www.phiguard.app` to runtime `phiguard-marketing` as a custom domain
- [ ] Confirm hosting provider has no PHIGuard Pages projects after cleanup
- [x] `my.phiguard.app` route is configured on the runtime
- [ ] BLOCKER: verify all three domains serve valid HTTPS

## Verification

- [x] `pnpm --filter @phiguard/web build` passes locally
- [x] `wrangler deploy --dry-run --config wrangler.jsonc` passes
- [x] first manual runtime deploy succeeds
- [ ] first marketing deployment succeeds with `PUBLIC_CAPTCHA_SITE_KEY` configured
- [x] `pnpm smoke:prod` verifies the auth session cookie Max-Age is no longer than 900 seconds
- [ ] `pnpm smoke:prod` passes, including `/healthz` and authenticated `/app/billing` with `PROD_E2E_EMAIL`, `PROD_E2E_PASSWORD`, and `PROD_E2E_BASE_URL`
- [ ] signup flow works
- [ ] login flow works
- [ ] Stripe checkout works
- [ ] Stripe webhook works
- [ ] Resend webhook works

## Non-Technical Launch Items

- [ ] legal review completed for privacy, terms, BAA, and notice pages
- [x] officers and operational placeholders are filled in docs
- [x] HIPAA risk analysis register is completed
- [ ] production support email and mailing address are finalized

## Launch Gate

Do not call the product live until every `BLOCKER` item above is complete.
