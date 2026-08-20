# SEO Expansion - Progress & Remaining Work

Status as of 2026-04-20. Branch: `worktree-seo-expansion` → merged into `master`.

## Shipped

### Content

- **Alternatives** (11 files, `src/content/alternatives/`): Asana, Monday, Airtable, Basecamp, ClickUp, Jira, Microsoft Planner, Notion, Smartsheet, Todoist, Trello, Wrike.
- **Practice types** (10 files, `src/content/practice-types/`): cardiology, chiropractic, dental, dermatology, mental health, OB/GYN, orthopedics, pediatric, physical therapy, primary care.
- **Comparisons** (5 files, `src/content/comparisons/`): HIPAA software comparison index; PHIGuard vs. Accountable HQ, Asana Enterprise, Healthie, Jotform Health.
- **Guides + best-of resources**: current listicle-style pages live under `/resources/best`; legacy pricing-breakdown URLs redirect into learn content.
- **Lead magnets** (6 files, `src/content/resources/`): BAA template, breach decision tree, new-hire checklist, incident response plan, risk analysis template, vendor BAA tracker.

### Schema

- `src/lib/seo.ts`: added `buildSoftwareApplicationSchema`, `buildArticleSchema`, `buildHowToSchema`, `buildBreadcrumbSchema`. Removed dead `buildProductSchema`.
- Pricing page: three-`Product` blocks replaced with a single `SoftwareApplication` + `offers[]`.
- Alternatives, practice-types, compare templates: now emit `BreadcrumbList` + `Article` schema and per-cluster OG image.

### Components + hub

- `RelatedContent.astro`: cluster-aware "related resources" block, sorted by `publishedAt` desc. Wired into alternatives, practice-types, and compare templates.
- `/resources`: rewritten as multi-cluster hub - lead magnets (cards), alternatives, comparisons, practice-types, guides (list cards), with anchor nav.

### OG images

- `scripts/generate-og-images.mjs` using satori + @resvg/resvg-js.
- 5 cluster PNGs in `public/og/`: default, alternatives, practice-types, comparisons, resources.
- `pnpm --filter @phiguard/marketing gen:og` regenerates.

### Inline contextual links

Added into existing long-form pages:

- `hipaa.astro` → guides/hipaa-task-management, alternatives/asana-alternative, /baa, /pricing.
- `security.astro` → /hipaa, alternatives/asana-alternative, /resources#alternatives, /trust, /resources.
- `trust.astro` → /security, /hipaa, /privacy, /baa, /resources.

### Docs

- `docs/marketing/seo-strategy.md`: keyword clusters, cadence, OG workflow, astro:assets convention.
- `docs/marketing/seo-progress.md` (this file).

## Verified

- `pnpm --filter @phiguard/marketing build` → 49 pages, green.
- Sitemap emits all new pages (content collections are picked up by `@astrojs/sitemap`).
- Content-collection Zod `metaDescription ≤ 160` enforced at build.

## Not done / flagged

1. **Image optimization via `astro:assets`**: pattern documented in `seo-strategy.md` but no
   design assets exist yet for guides/listicles. Revisit when visuals are commissioned; convention
   is `src/assets/<cluster>/<slug>/hero.png` rendered with `<Image />`.
2. **FAQ schema extension**: currently only on `/` and `/pricing`. Plan calls for adding it to the
   top 5 alternatives pages and `/hipaa` (high Q&A density). Straightforward - extract the Q&A list
   into frontmatter and call `buildFAQSchema()` in the `[slug].astro` template.
3. **Best-of routes**: shipped at `/resources/best` and
   `/resources/best/<slug>`. Legacy `/listicles/*` and `/pricing-breakdowns/*`
   URLs redirect into the current learn/resources structure.
4. **Search Console**: sitemap needs resubmission at `https://phiguard.app/sitemap-index.xml`,
   and the 10 new alternatives / 10 practice-type URLs should be submitted for indexing. Manual.
5. **Rich Results Test validation**: run against `/`, `/pricing`, one `/alternatives/<slug>`, one
   `/practice-types/<slug>`, one `/compare/<slug>` to confirm schema parses. Manual.
6. **PageSpeed Insights**: run on 3 new pages; target LCP < 2.5s, CLS < 0.1.
7. **Programmatic cluster #4**: choose the next active cluster from current
   content strategy before creating new routes or collection schemas.
8. **Remote push**: local only. Nothing has been pushed to the origin.

## Review findings still open (nice-to-have)

From the earlier `superpowers:code-reviewer` pass on the initial expansion work, these were
logged as nice-to-haves (not blockers) and are still unaddressed:

- Canonicalize pricing copy against `packages/billing/src/plans.ts` and `apps/marketing/public/pricing.txt` across content files.
- Validate every competitor claim against the vendor's current Trust Center before sending
  new traffic to those pages. The "check current pricing" framing is in place but claims like
  "Enterprise-only BAA" should be spot-checked at publish time.
- Add a `lastUpdated` field to the content collections so `Article.dateModified` is accurate.
