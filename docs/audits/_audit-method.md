# Frontend Audit Method (shared by all area auditors)

You are enumerating frontend bugs, missing features, design drift, and broken flows. DO NOT FIX anything. Be exhaustive - completeness beats brevity.

## Truth sources
- Pricing: `packages/billing/src/plans.ts` is canonical. Public plans: Essentials $179/$149 annual-effective, Clinic $229/$189, Group $469/$389. Compliance Ops is a custom path, not a public price card. Promo: Y80OFF.
- BAA: included at every tier (CLAUDE.md). Docuseal integration was just removed (commit f4759ee) - flag any leftover references.
- Brand voice: healthcare-admin language. Banned generic-SaaS words: "workflows", "pipelines", "syncing", "streamline".
- Fabrication rule: no testimonials/user counts/waitlist unless marked `[PLACEHOLDER - DO NOT PUBLISH]`.
- `console.log` is banned in `apps/web` and `packages/` (CLAUDE.md HIPAA section).
- Append-only: `audit_events` UI must not show edit/delete affordances.

## Categories (use these tags)
- **BUG** - broken/incorrect (links, images, forms, JS errors, hydration, wrong data)
- **MISSING** - feature gap (CTA, state, page, route target, primitive, action)
- **INCONSISTENCY** - drift (pricing, nav, header/footer, button styles, tokens)
- **STATES** - missing loading/empty/error/skeleton
- **NAV** - dead link, mislabeled, missing breadcrumb
- **A11Y** - labels, focus, keyboard, contrast, headings, alt
- **SEO** - meta, canonical, JSON-LD, OG, sitemap
- **CONTENT** - banned jargon, fabricated proof, TODO/TBD/PLACEHOLDER shipped, stale references
- **PHI** - risky display, missing guard, unsafe log
- **CRUD** - missing list/create/read/update/delete/archive
- **TABLE** - missing sort/filter/search/pagination/export/bulk
- **FORM** - validation, errors, dirty-warn, success feedback
- **DUPLICATE** - re-implements something in packages/ui or packages/brand
- **DEAD** - exported but unused

## Severity
- **P0** - breaks page, ships wrong info, security/compliance risk
- **P1** - visible defect or missing feature users will hit
- **P2** - polish/consistency

## Output format
Write to the assigned `docs/audits/NN-area.md`:

```
# <Area> Frontend Audit

## Summary
- Total: N (P0: x, P1: y, P2: z)
- Top risk themes: ...

## Findings

### [P0] [BUG] Title
**File(s):** path/to/file.tsx:42
**Issue:** concrete evidence
**Expected:** what it should be
**Fix:** one-line approach

### [P1] [MISSING] ...
```

## Method
- Read shared layouts/components first (affect many pages).
- Grep for: `TODO`, `FIXME`, `XXX`, `TBD`, `PLACEHOLDER`, `Lorem`, `docuseal`, `console.log`, `@ts-ignore`, `any as`, `coming soon`.
- Cross-check internal links against the route list.
- Cross-check pricing strings against `packages/billing/src/plans.ts`.
- Open EVERY in-scope file. Don't skip.

Return when done with a one-line summary and total count.
