# Mobile-First Conventions — apps/marketing

## Mobile-first ordering rule

Base CSS (no media query) targets mobile. Use responsive prefixes for larger
viewports. In Tailwind classes: `md:` and `lg:` layers override; never write
desktop-only base styles that you then undo at small sizes.

```
/* good */
.my-grid { grid-template-columns: 1fr; }
@media (min-width: 768px) { .my-grid { grid-template-columns: repeat(3, 1fr); } }

/* bad — requires an override at mobile */
.my-grid { grid-template-columns: repeat(3, 1fr); }
```

## Breakpoint reference (Tailwind defaults — confirmed against @tailwindcss/vite v4)

| Prefix | Min-width |
|--------|-----------|
| sm     | 640 px    |
| md     | 768 px    |
| lg     | 1024 px   |
| xl     | 1280 px   |
| 2xl    | 1536 px   |

## Standard test viewports

Playwright mobile project uses these three widths. Fix mobile bugs at 320 first.

| Label   | Width | Height |
|---------|-------|--------|
| small   | 320   | 700    |
| medium  | 375   | 812    |
| large   | 414   | 896    |

## 44×44 touch target rule (WCAG 2.5.5 / 2.5.8)

Every tappable element — links, buttons, submit inputs, role=button — must have
a bounding rect of at least 44×44 px. Use `.touch-target` on elements whose
visible size is smaller than 44×44 (e.g. icon-only close buttons).

```html
<button class="touch-target" aria-label="Close dialog">
  <svg …/>
</button>
```

## Utility classes (defined in src/styles/global.css)

### `.table-scroll`

Wraps a `<table>` to enable horizontal scrolling without breaking page layout.
Includes a right-edge gradient mask to hint that more content exists. Use this
instead of setting `min-width` on a table directly.

```html
<div class="table-scroll">
  <table>…</table>
</div>
```

### `.touch-target`

`display:inline-flex; align-items:center; justify-content:center;
min-block-size:44px; min-inline-size:44px` — guarantees WCAG minimum tap area
using CSS logical properties.

### `.form-field`

`inline-size:100%; max-inline-size:28rem; min-inline-size:0` — fluid input
width. Full-width on mobile, capped at a comfortable max on desktop. Never use
fixed `min-width` in px on form inputs; it overflows 320 px phones.

### `.safe-top` / `.safe-bottom`

Adds `env(safe-area-inset-top/bottom)` padding for notched phones. Apply to
fixed/sticky chrome: nav, cookie banner, popups. Requires `viewport-fit=cover`
in the viewport meta tag (already set in `BaseLayout.astro`).

```html
<div class="site-sticky-header safe-top">…</div>
<div class="cookie-banner safe-bottom">…</div>
```

## Playwright mobile project

Run mobile tests:

```bash
pnpm --filter @phiguard/marketing test:mobile
```

Spec files live in `e2e/mobile/`. Helpers are in `e2e/_helpers/mobile.ts`:
- `waitForReady(page)` — awaits `document.fonts.ready` before assertions
- `noHorizontalScroll(page)` — asserts `scrollWidth <= innerWidth + 1`
- `touchTargets(page)` — returns violation strings for elements below 44×44

If a page is not yet fixed, mark the test `test.fixme()` with a comment
pointing to the wave that owns the fix. Do not skip permanently.
