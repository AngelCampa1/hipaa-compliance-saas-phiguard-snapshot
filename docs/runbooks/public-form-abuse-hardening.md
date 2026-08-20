# Public Form Abuse Hardening Playbook

Last updated: 2026-05-19

## Purpose

A portable, app-agnostic guide for hardening any **unauthenticated public form
that triggers an email send** (lead-magnet delivery, newsletter signup, "contact
us", waitlist, password-reset request, invite, etc.) against being abused as an
**email-bombing relay** or spam amplifier.

It is written so it can be lifted into any project. The defenses are described in
stack-neutral terms first, with a "PHIGuard reference implementation" at the end
showing exactly how each one was wired here (Cloudflare Workers + TanStack Start +
Astro + Resend + Neon Postgres). Adapt the mechanism, keep the principle.

---

## The incident this came from (case study)

The marketing lead-capture endpoint `POST /api/marketing/leads` was abused starting
**2026-05-18**. A script submitted **other people's real email addresses** on a
roughly hourly cadence, each posting the same downloadable assets seconds apart with
randomized tracking fields. The server emailed each victim a download link they never
requested. Risk: sender-reputation damage (Resend), spam complaints, and being
blocklisted — which would have taken down _all_ transactional email.

Two independent defects made it possible. **Either one alone was exploitable.**

---

## The two defect classes (look for both in every app)

### Defect 1 — Unconditional side effect on a deduplicated write

The lead row insert was idempotent (`INSERT ... ON CONFLICT DO NOTHING`), but the
**email send ran unconditionally afterward**, regardless of whether a new row was
actually written. So resubmitting the same `(email, asset)` pair re-sent the email
every time with no new database row and no idempotency check.

> **The trap:** an idempotent _write_ gives a false sense of safety. The _side
> effect_ (email, webhook, SMS, charge) is what costs money and reputation, and it
> was not gated on the write actually being new.

**Fix principle:** make the row insert _report_ whether it created a new row, and
gate **every** side effect (email send, downstream enrollment, analytics event,
external webhook) on that boolean. A duplicate submission must return the same
success-shaped response to the client but perform **no** side effects.

### Defect 2 — No real bot protection

The only defense was an IP-keyed token bucket, and it:

- returned a single shared key (`'unknown'`) unless a "trust the proxy" flag was set,
  so it was effectively global or trivially evaded by rotating IPs;
- had **no** CAPTCHA, **no** honeypot, and **no** per-identity (per-email) limit.

**Fix principle:** defense in depth. No single control is sufficient. Layer cheap
controls (honeypot, per-email throttle) under a strong one (CAPTCHA), and **fail
closed** when a control can't run.

---

## The hardening layers (apply all five)

Apply these in this request order so the cheapest checks reject first and nothing
hits the database or the mailer until the request has earned it.

### 1. Fix the unconditional side effect (always do this first)

- Insert with conflict handling **and** have it return the affected rows
  (`ON CONFLICT DO NOTHING ... RETURNING`, `INSERT IGNORE` + `rowCount`, upsert with
  `xmax = 0` test, etc.).
- Derive `isNew = insertedRows.length > 0`.
- Gate **all** side effects on `isNew`. On a duplicate, return the normal success
  response but send/enroll/charge **nothing**.
- Watch for "different asset, same person" cases: key the dedup on the natural
  business key (e.g. `(email, asset_slug)`), not just `email`, so a returning user
  requesting a _genuinely new_ thing still gets it.

### 2. Honeypot field (cheap, catches dumb bots)

- Add a hidden text input (e.g. `name="company_website"`) that real users never see
  or fill: off-screen via CSS, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden`.
- Server-side: if it's non-empty, return a **success-shaped** response and do
  nothing. **Do not reveal detection** — no error, no different status code, no
  timing tell. Place this check early, after body parse, before any DB write.

### 3. CAPTCHA / proof-of-humanity (the strong control)

- Use a managed challenge (Cloudflare Turnstile, hCaptcha, reCAPTCHA, etc.). The
  widget injects a token field into the form; the server verifies the token against
  the provider's siteverify endpoint with a **secret key**.
- **Fail closed:** treat network errors, parse errors, and non-OK responses as
  verification _failure_, not success.
- **Bypass only outside production:** allow a bypass when the secret is unset in
  local development or tests. If the secret is unset in **production**, fail closed
  and log a loud one-time warning so a misconfiguration cannot silently degrade you
  back to the vulnerable posture.
- On failure: reject **before any DB write or send** (`403` for JSON, redirect with
  an `?error=verification` state for native form posts).
- **No-JS caveat:** managed challenges require JavaScript, so no-JS native form
  posts stop succeeding. Usually acceptable given active abuse — confirm per app.

### 4. Per-identity throttle (defeats IP rotation)

- A per-IP limit is necessary but insufficient — attackers rotate IPs. Add a limiter
  **keyed on the normalized email/identity** (e.g. ~3 tokens / 10 min, refill 1).
  This caps how often any single address can be targeted even from many IPs.
- Apply it after the email is parsed/validated, before the DB write.

### 5. Fix the IP-limiter keying

- An IP limiter that can't see the real client IP is decorative. Behind a proxy/CDN,
  set the "trusted proxy" flag and key on the forwarded client-IP header
  (`cf-connecting-ip`, `x-forwarded-for` leftmost, etc.) — but **only** when you
  actually sit behind that proxy, or anyone can spoof the header.

---

## What we deliberately did NOT do (and why)

- **No double opt-in.** It adds a click for every legitimate user. The layers above
  stop the abuse without taxing real conversions. Reconsider only if abuse persists.
- **No retroactive data cleanup.** Existing bot rows / victim addresses were left as
  is; this was a forward-looking code fix. (Your call per app — cleanup is separate
  from prevention.)

---

## Verification checklist (run after deploy)

1. Submit the form in a real browser → challenge solves → **exactly one** email.
2. Resubmit the same identity+asset → success UI, **no** second email (check the
   mailer dashboard).
3. `curl` the endpoint with **no** challenge token → `403` / redirect, **no** email.
4. `curl` with the honeypot field populated → success-shaped response, **no** email.
5. Hammer one email past the per-email limit → `429`.
6. Confirm the abuse signature stopped: re-query the leads/submissions store after
   ~a day and watch mailer bounce/complaint rates.

---

## Generic pre-deploy checklist (per app)

- [ ] Side effect gated on a real "is this new?" signal from the write.
- [ ] Duplicate path returns success-shaped response with zero side effects.
- [ ] Honeypot field on the form + server-side silent reject.
- [ ] CAPTCHA widget on the form; server verifies; **fails closed**.
- [ ] Production secret set out-of-band (never committed); fail closed and warn if unset.
- [ ] Per-identity (email) throttle in front of the write.
- [ ] IP limiter keys on the real client IP (trusted-proxy flag correct).
- [ ] All new reject paths preserve CORS headers and **never log PHI/PII**.
- [ ] Tests cover: honeypot, missing/failed token, duplicate, per-email 429, and
      the happy path (one send on a genuinely new submission).

---

## PHIGuard reference implementation (2026-05-19)

How each layer maps to this codebase, for copy-paste reference:

| Layer              | Where                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Side-effect gate   | `apps/web/src/routes/api/marketing/leads.tsx` — insert uses `.onConflictDoNothing().returning()`; `isNewLead = inserted.length > 0` gates both the delivery email and sequencer enrollment.                                                                                                                                                                                      |
| Honeypot           | Hidden `company_website` field in `LeadCapturePanel.astro` + `NewsletterSignup.astro`; server returns success-shaped no-op when filled.                                                                                                                                                                                                                                          |
| CAPTCHA            | `apps/web/src/lib/turnstile.ts` (`verifyTurnstile`, fail-closed, bypass outside production when `TURNSTILE_SECRET_KEY` is unset, fail-closed with one-time warning when unset in production); widget in `apps/marketing/src/components/TurnstileWidget.astro`. Verified before any DB write; `403`/`302 ?error=verification` on failure.                                         |
| Per-email throttle | `createIdentifierRateLimitMiddleware` in `apps/web/src/middleware/rate-limit.ts` — prefix `leads-email`, 3 tokens / 10 min, refill 1, keyed on normalized email.                                                                                                                                                                                                                 |
| IP-limiter keying  | `TRUSTED_PROXY=true` worker var → IP bucket keys on `cf-connecting-ip`.                                                                                                                                                                                                                                                                                                          |
| Secret plumbing    | `TURNSTILE_SECRET_KEY` set via `wrangler secret put` (never committed); added to `STRING_BINDING_KEYS` in `runtime-env.ts` so the Worker secret reaches `process.env`. `PUBLIC_TURNSTILE_SITE_KEY` is public and baked into marketing HTML at build time; the marketing deploy build fails if the public site key is missing so production forms do not ship without the widget. |
| Tests              | `apps/web/src/routes/api/marketing/-leads.test.ts` — honeypot, missing/failed token, duplicate, per-email 429, happy-path-sends-once, CORS-preserved.                                                                                                                                                                                                                            |

Stack-specific notes for porting:

- **Not on Cloudflare?** Swap Turnstile for hCaptcha/reCAPTCHA; swap
  `cf-connecting-ip` for your CDN's client-IP header; swap the Worker-secret plumbing
  for your platform's secret store (env from a vault, etc.).
- **Not Postgres/Drizzle?** Any "insert-and-report-new-row" primitive works
  (`INSERT ... RETURNING`, `INSERT IGNORE` + affected-rows, upsert + `xmax`).
- **Not Resend?** The principle is identical for any transactional mailer — protect
  sender reputation by never sending on duplicate/unverified/honeypotted requests.
