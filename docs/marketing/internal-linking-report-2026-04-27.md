# Internal Linking and Resources Megamenu Report

Date: 2026-04-27

## Summary

The core internal-linking work for `apps/marketing` connected public SEO pages through crawlable navigation, hub pages, related-content blocks, footer links, and legacy redirects. The Resources navigation uses a curated megamenu, mobile navigation exposes nested Resources links, and the link checker enforces internal 404, fragment, missing asset, and public orphan-page failures.

This follow-up converted the remaining repo work into durable guardrails:

- repository automation marketing SEO checks for marketing-related pull requests and `master` pushes.
- Scheduled and manually runnable strict external-link audits.
- Lightweight Playwright coverage for desktop and mobile Resources navigation.
- A narrow anti-bot external-link allowlist for hosts that block automated verification.
- Operating policy for future internal-link and megamenu maintenance.

## Follow-Up Implementation

### CI Guardrails

Added `the retired marketing SEO automation` with two jobs:

- `internal-guardrails` runs on marketing-related pull requests and `master` pushes. It installs dependencies, installs Chromium for Playwright, builds marketing, typechecks marketing, runs the internal link check, and runs the Resources navigation rendering tests.
- `strict-external-links` runs on the weekly schedule and on manual dispatch. It builds marketing and runs `pnpm --filter @phiguard/marketing links:check`, which includes strict external-link validation.

The scheduled external check is intentionally separate from PR blocking because external hosts can intermittently abort, rate-limit, or block automated requests.

### Navigation Tests

Added `apps/marketing/playwright.config.ts` and `apps/marketing/e2e/nav.spec.ts`:

- Desktop test: opens the homepage, reveals the Resources megamenu, verifies key crawlable links, and checks the expected crawlable link count.
- Mobile test: opens the mobile menu, verifies nested Resources links, and checks the expected crawlable link count.

The tests avoid layout-class selectors and committed visual baselines so normal copy, spacing, and rendering changes do not create brittle failures.

### Link Checker Policy

Updated `apps/marketing/scripts/link-check.mjs` to classify Box as an anti-bot host after automated verification returned a 403 for live URLs that work manually. The allowlist remains narrow and should only be used for hosts that consistently block automated verification despite working in a browser.

Strict link checks still fail real broken external links for hosts outside the explicit anti-bot allowlist.

### Audit Report

Regenerated `apps/marketing/seo-audit/2026-04-24/broken-links.md` after the Box allowlist update:

- Internal 404s: 0
- Public orphan pages: 0
- Broken fragments: 0
- Missing assets: 0
- Broken externals: 0
- Unverified externals: 2 Box URLs

## Operating Policy

- Run the internal link check before deploying marketing changes that add, remove, or rename pages.
- Run the strict external-link audit for source/citation batches, and treat non-allowlisted broken external links as release blockers.
- Prefer stable primary, vendor, or government sources before adding any host to the anti-bot allowlist.
- Keep the Resources megamenu selective. Favor high-value hubs and conversion-relevant SEO pages; full directories belong on hub pages.
- For new content batches, verify title length, source stability, legacy redirect sync, internal links, and funnel links before deployment.

## Remaining Manual SEO Work

- Monitor scheduled strict-link failures and update unstable external citations or the narrow anti-bot allowlist only when evidence supports it.
- Periodically review curated Resources megamenu links as new high-value SEO pages are published.
- Submit important new URLs and sitemap updates through Search Console when content batches ship.

## Final Review and Release Evidence

Review agent findings were accepted and fixed:

- Removed the `master` branch filter from the marketing SEO workflow so direct pushes to any branch receive the same path-filtered guardrails.
- Reworked the navigation tests to use the main navigation landmark, accessible names, key crawlable link assertions, and expected crawlable link counts instead of layout-class selectors or screenshot byte-size checks.

Pre-deploy verification on April 27, 2026:

- `pnpm install --frozen-lockfile --offline`
- `pnpm --filter @phiguard/marketing build`
- `pnpm --filter @phiguard/marketing typecheck`
- `pnpm --filter @phiguard/marketing links:check:internal`
- `pnpm --filter @phiguard/marketing test:nav`
- `pnpm --filter @phiguard/marketing links:check`
- `pnpm --filter @phiguard/marketing test:seo`

Release evidence:

- Committed to `master` as `1316141` (`chore(marketing): add internal linking guardrails`).
- Pushed `master` to `origin`.
- Deployed marketing with `pnpm deploy:marketing`.
- application runtime: `phiguard-marketing`.
- Deployment version: `d84f1318-327f-4721-b856-aa62f76cfc7d`.
- Live checks returned HTTP 200 for `/`, `/resources`, `/resources/guides`, `/resources/best`, `/compare`, and `/resources/guides/is-box-hipaa-compliant`.
- Live homepage markup includes `#resources-mega-menu`, `/resources/guides`, `/resources/best`, `/compare`, `/glossary`, `Vendor Guides`, `Best Software`, and `Compare & Fit`.
