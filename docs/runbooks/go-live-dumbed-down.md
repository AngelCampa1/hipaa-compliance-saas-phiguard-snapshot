# PHIGuard Go-Live Dumbed Down

This is the short version.

These are the only things I still need from you before I can finish the launch.

## What Is Already Good

I already validated these:

- GitHub repo is correct
- app build works locally
- marketing build works locally
- object storage buckets exist
- the database connection layer exists and is wired to Neon
- application runtime `phiguard-app` is deployed
- application runtime route for `my.phiguard.app` is configured
- application runtime `phiguard-marketing` is the production marketing target

I am intentionally not reusing the old validation marketing projects.

- `phiguard-marketing`, `phiguard-site`, and `phiguard` are legacy Pages projects to delete after runtime custom domains pass smoke checks
- any unexpected `phiguard*` Pages project must be verified before deletion

## What You Need To Do

## 1. Release The Marketing Runtime

From an authenticated machine:

```bash
run the selected marketing release procedure
```

Production deploys use the repo's deployment tooling scripts. Do not create a new Pages project for marketing.

## 2. Add The Marketing runtime Domains

In the runtime `phiguard-marketing`:

1. Go to `Custom domains`
2. Add `phiguard.app`
3. Add `www.phiguard.app`
4. Finish any DNS confirmation hosting provider asks for

If hosting provider says a hostname is already owned by Pages, remove the old Pages custom domain or DNS ownership first, then rerun `run the selected marketing release procedure`.

## 3. Deploy From The Repo

Do not connect repository-hosted builds for PHIGuard production. The authoritative
deploy path is manual wrangler deployment from the repository:

```bash
run the selected deploy command
run the selected marketing release procedure
run the selected release procedure
```

## 4. Add The runtime secrets

These are required before the app can actually run in production.

You can either:

- set them yourself in hosting provider
- or send me the real values and I can set them for you

Required secrets:

- `BETTER_AUTH_SECRET`
- `AUTH_TOKEN_ENCRYPTION_KEY`
- `AUTH_TOKEN_KEY_ID`
- `INTEGRATION_TOKEN_ENCRYPTION_KEY`
- `INTEGRATION_TOKEN_KEY_ID`
- all Stripe secrets printed by `pnpm billing:env-checklist`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `EMAIL_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional but recommended:

- `SENTRY_DSN`
- `VITE_SENTRY_APP_DSN` in `wrangler.jsonc` vars or the deploy build environment

### What To Put For Stripe

Get these from the Stripe dashboard for the live account:

- `STRIPE_SECRET_KEY`
  Put the live secret API key from `Developers -> API keys`.
  It usually starts with `sk_live_`.

- `STRIPE_WEBHOOK_SECRET`
  In Stripe, create a webhook endpoint pointing to:

```text
https://my.phiguard.app/api/webhooks/stripe
```

After creating it, copy the signing secret for that endpoint.
It usually starts with `whsec_`.

- Stripe price env vars printed by `pnpm billing:env-checklist`
  Create one live recurring monthly Stripe Price and one live recurring annual Stripe Price for each public PHIGuard plan, then copy each Stripe Price ID.
  These usually start with `price_`.
  Use `packages/billing/src/plans.ts` as the billing catalog source of truth and confirm the public-facing display on `/pricing`.
  Use `LIMITED_OFFER_PROMOTIONS`, `COMMERCIAL_COPY`, and generated `apps/marketing/public/pricing.txt` for the current public offer, guarantee, and coupon mechanics.

### What To Put For Sentry

Sentry is optional.
The app works without it.

Recommended setup:

Create these 3 Sentry projects:

1. `phiguard-marketing` -> project type `Astro`
2. `phiguard-app-client` -> project type `React`
3. `phiguard-runtime` -> project type `hosting provider`

Why 3 projects is the right structure:

- `phiguard-marketing`
  Public marketing site issues.
  Separate so landing-page noise does not mix with app errors.

- `phiguard-app-client`
  Browser errors inside `my.phiguard.app`.
  This is what your logged-in users experience in the app UI.

- `phiguard-runtime`
  application runtime / server-side errors.
  This is backend logic, API failures, auth issues, billing issues, database failures, and so on.

### Exact setup for the 3-project model

For each project:

1. Log into Sentry.
2. Click `Create Project`.
3. Use these exact project types:
   - `phiguard-marketing` -> `Astro`
   - `phiguard-app-client` -> `React`
   - `phiguard-runtime` -> `hosting provider`
4. Finish creation.
5. Open `Project Settings -> Client Keys (DSN)`.
6. Copy the full DSN.

Then map them like this:

- `SENTRY_DSN`
  Put the DSN from `phiguard-runtime`.

- `VITE_SENTRY_DSN`
  Legacy fallback for the app browser DSN. Prefer `VITE_SENTRY_APP_DSN`.

- `VITE_SENTRY_APP_DSN`
  Put the public browser DSN from `phiguard-app-client`. Set it in root
  `wrangler.jsonc` vars or export it before `run the selected deploy command`; do not set it
  only as a runtime secret because client-side Sentry is baked into the Vite
  browser bundle at build time.

Important current limitation:

- `apps/web` is already wired for Sentry.
- `apps/marketing` is already wired for Sentry.
- `phiguard-marketing` can receive production marketing errors when `PUBLIC_SENTRY_MARKETING_DSN` is configured for the runtime. `PUBLIC_SENTRY_DSN` remains a fallback only.

Fastest shortcut if you want to skip the cleaner split for now:

1. Create only `phiguard-app-client` and `phiguard-runtime`.
2. Put:
   - `SENTRY_DSN` = `phiguard-runtime` DSN
   - `VITE_SENTRY_APP_DSN` = `phiguard-app-client` DSN before the web build

Important Sentry settings for PHIGuard:

- do not enable `Session Replay`
- do not enable user PII collection
- do not add custom user email fields or PHI tags

The code already initializes Sentry with `sendDefaultPii: false` and PHI sanitization, but you should still avoid turning on extra data collection features in the Sentry dashboard.

Why those exact project types:

- `Astro` because `apps/marketing` is an Astro app
- `React` because the authenticated app browser code uses `@sentry/react`
- `hosting provider` because the server/runtime code uses `@sentry/hosting provider`

### Google Sign-In

PHIGuard supports Google sign-in directly.

If you want it live, set:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Get them from a Google OAuth `Web application` client configured like this:

- Authorized JavaScript origin: `https://my.phiguard.app`
- Authorized redirect URI: `https://my.phiguard.app/api/auth/callback/google`

In Google Cloud Console:

1. Open `APIs & Services -> OAuth consent screen`
2. Set up the production consent screen for PHIGuard
3. Add `phiguard.app` as the authorized domain
4. Open `APIs & Services -> Credentials`
5. Create an `OAuth client ID`
6. Choose `Web application`
7. Add the origin and redirect URI above
8. Copy the client ID into `GOOGLE_CLIENT_ID`
9. Copy the client secret into `GOOGLE_CLIENT_SECRET`

After that, test both buttons in production:

- `Continue with Google` on `/signup`
- `Continue with Google` on `/login`

Do not treat the core runtime secrets as configured until
`docs/runbooks/go-live-checklist.md` shows the corresponding auth, Stripe, Resend,
Google, CAPTCHA, attachment scanning, direct upload, and AI-CS blockers
as complete.

## 5. Verify The object storage Paths

After the runtime is connected and secrets are in place, verify:

- attachment uploads succeed in the app
- lead magnet download emails open the application runtime download route
- lead magnet PDFs have already been uploaded to `phiguard-lead-magnets`
- run `pnpm --filter @phiguard/web verify:lead-magnets` against production and do not skip failures

## 6. Tell Me When You're Done

After you finish the steps above, tell me:

```text
done
```

Then I will do the rest:

- production migration
- production seed
- final checks
- tell you if you are actually live

## If You Want The Absolute Shortest Version

Do these 4 things:

1. Deploy marketing with `run the selected marketing release procedure`
2. Add `phiguard.app` and `www.phiguard.app` to runtime `phiguard-marketing`
3. Deploy the app with `run the selected deploy command`
4. Add the real secrets
