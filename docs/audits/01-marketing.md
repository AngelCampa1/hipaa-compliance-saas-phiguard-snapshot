# Marketing Frontend Audit

## Summary
- Total: 47 (P0: 4, P1: 22, P2: 21)
- Top risk themes:
  1. Banned jargon ("workflow"/"workflows") shipped pervasively across nav, page titles/meta, body copy, and core product pages - directly violates CLAUDE.md brand-voice rule.
  2. Fabrication risk: `buildArticleSchema` hardcoded author default emits "Angel Campa" + LinkedIn `sameAs` into JSON-LD when callers omit author, bypassing the contributors system.
  3. Design-token drift: hex colors hardcoded across many pages instead of brand tokens; CTA "primary" actually renders the secondary button style.
  4. NAV/UX gaps: dead internal link (`/notice-of-privacy-practices`), mobile menu silently truncates resource groups, inconsistent breadcrumb implementations.
  5. Duplicated lead-capture primitives (LeadMagnetForm vs LeadCapturePanel) and partners form missing CAPTCHA+honeypot parity with other lead forms.
  6. Repeated-content bug on `/product` (every bullet shows the same `pillar.detail`).

## Findings

### [P0] [CONTENT] Page title and meta use banned jargon "Workflows"
**File(s):** apps/marketing/src/pages/learn/index.astro
**Issue:** `<title>` is "Learn PHI and HIPAA Workflows | PHIGuard" and the meta description repeats the term. CLAUDE.md explicitly bans "workflows".
**Expected:** Healthcare-admin language (e.g., "Learn PHI and HIPAA operations" / "compliance practices" / "clinic procedures").
**Fix:** Replace "Workflows" with an admin-domain noun across `seoTitle`, `description`, and any visible heading.

### [P0] [BUG] product.astro repeats `pillar.detail` under every bullet
**File(s):** apps/marketing/src/pages/product.astro:130-135
**Issue:** Inside `{pillar.bullets.map((bullet) => ...)}` each rendered card uses `<h3>{bullet}</h3><p>{pillar.detail}</p>` - every bullet shows the same paragraph copy.
**Expected:** Either render the pillar `detail` once above the bullet list, or pair each bullet with its own description (data model must change).
**Fix:** Pull `<p>{pillar.detail}</p>` out of the `.map`, or introduce `bullet.description` and render that per-card.

### [P0] [CONTENT] JSON-LD author fabrication default in seo.ts
**File(s):** apps/marketing/src/lib/seo.ts (`buildArticleSchema`)
**Issue:** Defaults author to hardcoded `'Angel Campa'` with `sameAs: 'https://www.linkedin.com/in/angelcampa1/'` when callers omit `authorName`. Any future page that schemas an article without explicit author silently attributes it to a real person, including their LinkedIn - fabrication + identity risk.
**Expected:** Required parameter with no default, or a generic "PHIGuard Editorial" `Organization` author. No personal `sameAs` defaults.
**Fix:** Make `authorName`/`authorUrl` required, or default to an `Organization` schema author block.

### [P0] [NAV] Dead internal link `/notice-of-privacy-practices`
**File(s):** apps/marketing/src/lib/internal-links.ts (`noticeOfPrivacyPractices`)
**Issue:** Constant exports `'/notice-of-privacy-practices'` but no page exists under `apps/marketing/src/pages/` matching that route. Any consumer renders a 404 link.
**Expected:** Either ship the page or remove the constant + all callers.
**Fix:** Audit usages; remove the export or create the page.

### [P1] [CONTENT] Banned jargon "workflows" in nav resources mega menu
**File(s):** apps/marketing/src/lib/internal-links.ts
**Issue:** Resources mega menu label "PHI Workflows" uses banned jargon and is rendered in the global header.
**Expected:** "PHI operations" / "PHI procedures" / "Compliance procedures".
**Fix:** Rename label.

### [P1] [CONTENT] "workflow/workflows" jargon across product/marketing pages
**File(s):**
- apps/marketing/src/pages/hipaa.astro (~6+ occurrences in body)
- apps/marketing/src/pages/trust.astro
- apps/marketing/src/pages/compare.astro (multiple)
- apps/marketing/src/pages/alternatives/index.astro
- apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro
- apps/marketing/src/pages/locations/hipaa-breach-notification/[slug].astro
- apps/marketing/src/pages/locations/hipaa-compliance-software/[slug].astro
- apps/marketing/src/pages/practice-types/index.astro and [slug].astro ("PHI workflows")
- apps/marketing/src/pages/resources/[slug].astro
**Issue:** Banned word shipped in customer-facing copy across the entire marketing surface.
**Expected:** Healthcare-admin replacement language ("operating layer", "operations", "procedures", "recurring tasks", "evidence cadence").
**Fix:** Sweep-replace, audit each replacement for fit, re-run stop-slop/humanizer skills per CLAUDE.md.

### [P1] [NAV] Mobile menu silently truncates resources groups via slice(0, 2)
**File(s):** apps/marketing/src/components/Nav.astro
**Issue:** Mobile resources panel `.slice(0, 2)` discards every group beyond the first two. Visitors on mobile cannot see the truncated sections at all (no "more" affordance).
**Expected:** Show all groups, or add an explicit "View all resources" link.
**Fix:** Remove `.slice(0, 2)` or render an explicit affordance.

### [P1] [INCONSISTENCY] CTA primary button renders the secondary style
**File(s):** apps/marketing/src/components/CTA.astro
**Issue:** Primary CTA uses the `button-secondary` class, demoting the visual hierarchy of the dominant CTA across many pages.
**Expected:** Primary CTA uses the primary button token.
**Fix:** Swap to `button-primary` (or whichever token is the primary).

### [P1] [DUPLICATE] LeadMagnetForm duplicates LeadCapturePanel
**File(s):** apps/marketing/src/components/LeadMagnetForm.astro, apps/marketing/src/components/LeadCapturePanel.astro
**Issue:** Two near-identical lead-capture primitives co-exist with overlapping behavior, increasing drift risk (CAPTCHA, validation, success states).
**Expected:** One shared primitive with variants.
**Fix:** Consolidate into a single component with `variant` props; delete the loser.

### [P1] [FORM] partners.astro application form lacks CAPTCHA and honeypot
**File(s):** apps/marketing/src/pages/partners.astro
**Issue:** Other lead forms use CAPTCHA provider and honeypot fields; partners form does not, exposing it to bot abuse and creating inconsistent anti-abuse posture.
**Expected:** Parity with other public lead forms.
**Fix:** Add `<CAPTCHAWidget>` and honeypot field; require token server-side.

### [P1] [CONTENT] Hardcoded inline `alternativeFaqs` block bypasses content collection
**File(s):** apps/marketing/src/pages/alternatives/[slug].astro
**Issue:** Large inline `alternativeFaqs` object hardcodes FAQ data inside the page template instead of frontmatter in the `alternatives` content collection. New entries silently get no FAQ; editorial cannot manage copy without code changes.
**Expected:** FAQ lives in frontmatter for each `alternatives` entry; schema enforced.
**Fix:** Move data into collection frontmatter; update Zod schema; remove the inline map.

### [P1] [A11Y] LinkedIn outbound on about.astro lacks rel="noopener" + target hardening
**File(s):** apps/marketing/src/pages/about.astro
**Issue:** External LinkedIn link missing `rel="noopener noreferrer"` (and target/intent). Security best practice and consistency with other outbound links.
**Expected:** `target="_blank" rel="noopener noreferrer"`.
**Fix:** Add attributes.

### [P1] [BUG] contributors/[slug].astro labels every sameAs URL as "LinkedIn"
**File(s):** apps/marketing/src/pages/contributors/[slug].astro
**Issue:** Render loop labels each `sameAs` link with "LinkedIn" regardless of underlying domain. Twitter/X, GitHub, ORCID, personal sites all mislabeled.
**Expected:** Derive label from URL host (or store label per entry).
**Fix:** Map host → label, or extend contributor data model.

### [P1] [INCONSISTENCY] Three different breadcrumb implementations across pages
**File(s):**
- apps/marketing/src/components/Breadcrumbs.astro (canonical)
- apps/marketing/src/components/StateGuideArticle.astro (uses `<nav class="kicker">`)
- apps/marketing/src/pages/resources/best/[slug].astro (`<nav class="kicker">`)
- apps/marketing/src/pages/resources/guides/index.astro and [slug].astro (`<nav class="kicker">`)
**Issue:** Inconsistent breadcrumb markup (visual drift + duplicate BreadcrumbList JSON-LD risk).
**Expected:** All breadcrumbs use the shared `<Breadcrumbs>` component which also emits the schema.
**Fix:** Replace `<nav class="kicker">` patterns with `<Breadcrumbs>`.

### [P1] [INCONSISTENCY] Hardcoded hex colors throughout pages instead of tokens
**File(s):**
- apps/marketing/src/pages/hipaa-software/index.astro (`#f8fafc #e5e7eb #2563eb #111827 #4b5563`)
- apps/marketing/src/pages/locations/hipaa-compliance/index.astro (`#cbd5e1 #0f172a #111827 #475569 #0f766e`)
- apps/marketing/src/pages/locations/hipaa-breach-notification/{index,[slug]}.astro
- apps/marketing/src/pages/locations/hipaa-compliance-software/{index,[slug]}.astro
- apps/marketing/src/pages/resources/best/index.astro (duplicates hipaa-software palette)
- apps/marketing/src/pages/resources/guides/{index,[slug]}.astro
- apps/marketing/src/pages/glossary/index.astro
- apps/marketing/src/pages/contributors/index.astro
- apps/marketing/src/layouts/LegalLayout.astro (`#374151 #2563eb #fef3c7 #f59e0b #92400e`)
**Issue:** Tokens defined in shared CSS are bypassed; brand palette drift; theme changes require touching many files.
**Expected:** All colors use CSS custom properties / Tailwind tokens.
**Fix:** Replace literals with tokens; add lint rule to prevent regression.

### [P1] [INCONSISTENCY] Promo banner fallback color is off-brand blue
**File(s):** apps/marketing/src/components/PromoBanner.astro
**Issue:** Hardcoded fallback `#1d4ed8` (blue) - brand is teal.
**Expected:** Use brand teal token as fallback.
**Fix:** Replace literal with brand token.

### [P1] [BUG] LaunchPhaseProgress hardcodes production API URL
**File(s):** apps/marketing/src/components/LaunchPhaseProgress.astro
**Issue:** Fetches `https://my.phiguard.app/api/marketing/promotion` literally. Breaks local dev / preview / staging; cannot be swapped via env.
**Expected:** Use `PHIGUARD_APP_ORIGIN` (or `import.meta.env.PUBLIC_APP_URL`) like other components (see `unsubscribe.astro`).
**Fix:** Switch to env-derived origin.

### [P1] [INCONSISTENCY] 404 / 500 pages use Tailwind text-blue-600 (off-brand)
**File(s):** apps/marketing/src/pages/404.astro, apps/marketing/src/pages/500.astro
**Issue:** `text-blue-600` does not match brand teal palette.
**Expected:** Brand color token.
**Fix:** Swap to brand class.

### [P1] [DEAD] NewsletterSignup component is unreferenced in production pages
**File(s):** apps/marketing/src/components/NewsletterSignup.astro
**Issue:** Only test files reference it; not mounted on any production page. Also contains hardcoded hex colors.
**Expected:** Either mount it intentionally or remove.
**Fix:** Delete, or wire into a designated page (e.g., footer/newsletter route).

### [P1] [DEAD] `.draft-notice` style defined but never used
**File(s):** apps/marketing/src/layouts/LegalLayout.astro
**Issue:** CSS class declared but no element instantiates it across the legal pages.
**Expected:** Remove dead CSS or render the intended notice.
**Fix:** Delete the rule or add the matching markup.

### [P1] [STATES] PromoBanner / launch progress lack loading + error states for promotion fetch
**File(s):** apps/marketing/src/components/LaunchPhaseProgress.astro, apps/marketing/src/components/PromoBanner.astro
**Issue:** Client-side fetch swap has no visible loading shimmer or graceful failure messaging beyond silent fallback.
**Expected:** Skeleton/placeholder on load; quiet but visible fallback on error.
**Fix:** Add loading + error UI states.

### [P1] [SEO] Ad-hoc inline `<aside>` styling in resources/[slug] breaks responsive layout
**File(s):** apps/marketing/src/pages/resources/[slug].astro
**Issue:** Mixed inline `style="margin-top:..."` and ad-hoc Tailwind classes inside `<aside>` create inconsistent spacing vs other long-form templates.
**Expected:** Use shared `resource-sidebar` tokens only.
**Fix:** Refactor to shared classes.

### [P1] [A11Y] `BrandLogo` always uses loading="eager"
**File(s):** apps/marketing/src/components/BrandLogo.astro
**Issue:** Hardcoded `loading="eager"`; when the logo appears outside the hero (footer, modal) it forces non-critical eager loads.
**Expected:** Default `lazy`, allow opt-in `eager` via prop for above-the-fold instances.
**Fix:** Add `loading` prop with `lazy` default.

### [P1] [INCONSISTENCY] Hardcoded "BAA included at every tier" string drift risk
**File(s):** Multiple - e.g. apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro:234, several CTA components
**Issue:** Phrase repeated as a string literal in many surfaces. CLAUDE.md treats BAA-at-every-tier as a load-bearing claim; drift between surfaces (e.g., "included" vs "available") would be misleading.
**Expected:** Centralize in `@phiguard/knowledge` or `@phiguard/brand` and import.
**Fix:** Add a constant and replace literals.

### [P1] [CONTENT] Pricing claims in body copy are hardcoded strings rather than derived from plans.ts
**File(s):** Various marketing prose mentions of plan names / "BAA included" / per-clinic pricing not linked to `marketingPlans`
**Issue:** Only headline pricing tables are dynamic; body prose references to plans remain string literals that can drift if `packages/billing/src/plans.ts` changes.
**Expected:** Derive plan names from the billing source where prose references them.
**Fix:** Import plan names from `@phiguard/billing` for body references where feasible.

### [P2] [A11Y] LegalLayout admonition contrast relies on inline `#92400e` on `#fef3c7`
**File(s):** apps/marketing/src/layouts/LegalLayout.astro
**Issue:** Color combination not verified against tokens; risk of WCAG AA drift after theme tweaks.
**Expected:** Use defined alert tokens with documented contrast.
**Fix:** Replace with token-based alert component.

### [P2] [A11Y] Curly-quote escaping inconsistency
**File(s):**
- apps/marketing/src/pages/alternatives/[slug].astro (uses `\'` escapes)
- apps/marketing/src/pages/compare/[slug].astro (raw `'` in RelatedContent description)
**Issue:** Apostrophe handling inconsistent between pages; one uses escaped ASCII, another uses curly punctuation. Cosmetic and i18n-fragile.
**Expected:** Single house style (typographically-correct curly quotes everywhere or ASCII everywhere).
**Fix:** Pick one and sweep.

### [P2] [SEO] OG/twitter image not set on unsubscribe.astro
**File(s):** apps/marketing/src/pages/unsubscribe.astro
**Issue:** Utility page is noindex, but still emits OG tags without `og:image` / `twitter:image`. Either drop the OG block or include default image.
**Expected:** Either remove OG block on noindex utility pages or include default image.
**Fix:** Drop OG tags or include defaults.

### [P2] [CONTENT] Stylistic apostrophe `'` shipped in compare/[slug] RelatedContent
**File(s):** apps/marketing/src/pages/compare/[slug].astro
**Issue:** Mojibake-vulnerable curly quote in JSX string.
**Expected:** HTML entity or escaped.
**Fix:** Replace with `&rsquo;` or ASCII apostrophe.

### [P2] [INCONSISTENCY] resources/best uses identical color palette duplicated from hipaa-software
**File(s):** apps/marketing/src/pages/resources/best/index.astro
**Issue:** Same hex literals copy-pasted across two indexes. DRY violation and drift risk.
**Expected:** Shared CSS module or tokens.
**Fix:** Extract shared styles or use tokens.

### [P2] [SEO] Article schema missing `image` field on some long-form pages
**File(s):** apps/marketing/src/lib/seo.ts (callers in city/state guides)
**Issue:** Several callers don't pass an `image` for `BlogPosting`/`Article` schemas; recommended for rich-results eligibility.
**Expected:** Pass a representative image (e.g., default OG) per page.
**Fix:** Add default image fallback in `buildArticleSchema`.

### [P2] [SEO] No `lastmod` in sitemap entries for content collection routes
**File(s):** apps/marketing/src/pages/sitemap*.xml.ts (verify)
**Issue:** If sitemap omits `lastmod`, search engines re-crawl less efficiently. (Confirm during fix.)
**Expected:** Emit `lastmod` from `updatedAt` frontmatter.
**Fix:** Populate `<lastmod>` from content collection metadata.

### [P2] [CONTENT] `commercialKnowledgeCopy.pricingModel` inserted mid-prose without context guard
**File(s):** apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro:168
**Issue:** Injected sentence might read awkwardly after editorial paragraphs.
**Expected:** Editorial review of the joined sentence.
**Fix:** Confirm phrasing flows; otherwise wrap in a separate paragraph.

### [P2] [A11Y] FAQ `<details>` in resources/[slug] missing `name` attribute (no exclusive group)
**File(s):** apps/marketing/src/pages/resources/[slug].astro
**Issue:** Multiple `<details>` without `name` allow all to be open simultaneously (visual noise). Minor UX choice.
**Expected:** Consider `name="faq"` for accordion-style exclusive open.
**Fix:** Add `name` attribute if accordion behavior desired.

### [P2] [STATES] Lead capture / magnet forms lack visible inline validation errors on blur
**File(s):** apps/marketing/src/components/LeadCapturePanel.astro, LeadMagnetForm.astro
**Issue:** Validation generally surfaces at submit, not on blur. Minor UX polish.
**Expected:** Inline errors on blur for email field.
**Fix:** Add blur handlers.

### [P2] [SEO] `meta name="referrer"` set to `no-referrer` only on unsubscribe; not consistent
**File(s):** apps/marketing/src/pages/unsubscribe.astro
**Issue:** Other utility pages don't set referrer policy. Not necessarily wrong, but worth a site-wide decision.
**Expected:** Documented policy across utility pages.
**Fix:** Standardize referrer policy per page class.

### [P2] [CONTENT] LegalLayout admonition copy not centralized
**File(s):** apps/marketing/src/layouts/LegalLayout.astro
**Issue:** Inline admonition strings will drift across terms/privacy/subprocessors over time.
**Expected:** Shared constant from knowledge package.
**Fix:** Centralize and import.

### [P2] [A11Y] LeadMagnetPopup: confirm focus trap and ESC behavior covered
**File(s):** apps/marketing/src/components/LeadMagnetPopup.astro
**Issue:** Modal pattern present; verify focus trap, initial focus, restore on close, and ESC dismissal.
**Expected:** WAI-ARIA modal pattern fully implemented.
**Fix:** Audit + add `inert` on background, `aria-modal`, focus trap.

### [P2] [INCONSISTENCY] BaseLayout loads ventora-ai-sdr third-party chat widget
**File(s):** apps/marketing/src/layouts/BaseLayout.astro
**Issue:** Allowed on marketing per CLAUDE.md (third-party JS banned only on PHI routes), but adds external script to all marketing pages. Confirm intent and ensure it never loads on auth-bridging pages or anywhere the user could be redirected with PHI in query.
**Expected:** Explicit allow-list / deny-list, documented in CSP and comments.
**Fix:** Document the policy; ensure no PHI-adjacent surfaces include this layout.

### [P2] [SEO] CTA / CTA secondary headings nest H2 inside sections that already provide H2 hierarchy
**File(s):** apps/marketing/src/components/CTA.astro and several callers (e.g., city/state guides)
**Issue:** Multiple H2s in close proximity may dilute outline; minor.
**Expected:** CTA heading levels configurable.
**Fix:** Add `headingLevel` prop.

### [P2] [STATES] Unsubscribe page only handles loading/success/expired; ambiguous network errors funnel into "expired"
**File(s):** apps/marketing/src/pages/unsubscribe.astro:99-104
**Issue:** Any non-2xx (incl. 500) collapses to "expired" copy. Misleading for transient errors.
**Expected:** Distinguish "expired/invalid token" (4xx) from "transient error" (5xx/network).
**Fix:** Branch on `res.status` and render an error state with retry guidance.

### [P2] [SEO] Trust/Subprocessors pages missing JSON-LD breadcrumb
**File(s):** apps/marketing/src/pages/trust.astro, subprocessors.astro
**Issue:** No breadcrumb JSON-LD for these top-level pages.
**Expected:** Emit BreadcrumbList consistent with other pages.
**Fix:** Add via `buildBreadcrumbSchema`.

### [P2] [CONTENT] CTA subheading in city guide hardcodes "with a BAA included at every tier"
**File(s):** apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro:240-241
**Issue:** Same load-bearing phrase repeated; see centralization note above.
**Expected:** Pull from shared constant.
**Fix:** Replace literal.

### [P2] [INCONSISTENCY] Two near-duplicate "Browse all" / "Parent hub" RelatedContent items
**File(s):** apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro, apps/marketing/src/pages/resources/[slug].astro
**Issue:** Pattern duplicated; consider extracting a `<HubReturnCard>` primitive.
**Expected:** Shared component for "Return to hub" tile.
**Fix:** Extract.

### [P2] [A11Y] Sidebar "Reviewed and verified" card uses paragraphs of `<strong>` labels for key-value pairs
**File(s):** apps/marketing/src/pages/locations/hipaa-compliance/[slug].astro:111-118
**Issue:** Screen readers benefit from `<dl>/<dt>/<dd>` semantics for label/value lists.
**Expected:** Description list.
**Fix:** Refactor to `<dl>`.

### [P2] [SEO] Resources `[slug]` breadcrumb includes both "Resources" and "Free Tools" - verify alignment with sitemap and IA
**File(s):** apps/marketing/src/pages/resources/[slug].astro:80-85
**Issue:** Crumb path `Home > Resources > Free Tools > <title>` may differ from URL structure (`/resources/<slug>`), which could confuse breadcrumb consumers.
**Expected:** Crumbs match URL hierarchy or document why they don't.
**Fix:** Align or annotate.

### [P2] [SEO] Several pages mention "PHIGuard.app" in display strings inconsistently vs "PHIGuard"
**File(s):** apps/marketing/src/pages/unsubscribe.astro (button "Back to PHIGuard.app"), elsewhere "PHIGuard"
**Issue:** Brand name rendering drift.
**Expected:** Single brand string from `@phiguard/brand`.
**Fix:** Centralize and import.

### [P2] [STATES] No global skeleton for content-collection list pages
**File(s):** apps/marketing/src/pages/learn/index.astro, glossary/index.astro, alternatives/index.astro, etc.
**Issue:** Pages are SSG so skeletons aren't critical, but missing empty state copy if a collection is empty at build time (would render bare header).
**Expected:** Defensive empty-state copy.
**Fix:** Add a fallback message when arrays are empty.
