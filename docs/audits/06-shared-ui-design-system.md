# Shared UI / Design System Frontend Audit

## Summary
- Total: 38 (P0: 1, P1: 19, P2: 18)
- Top risk themes:
  1. Two parallel button systems: marketing uses bespoke `.button-primary`/`.button-secondary` CSS classes in `apps/marketing/src/styles/global.css`, app uses `@phiguard/ui` Button + ad-hoc Tailwind. No single source of truth.
  2. Massive raw-hex / raw-rgb drift across marketing components (91 occurrences in 15 files). Some use blue (`#2563eb`, `#1d4ed8`) for what should be brand teal CTAs - actively off-brand.
  3. Hand-rolled dialogs and focus traps in app (4 distinct implementations) duplicate the unused `Dialog` Radix wrapper in `@phiguard/ui`.
  4. shadcn coverage is a small fraction of what the app actually needs. Missing primitives: Select, Checkbox, RadioGroup, Switch, DropdownMenu, Popover, Tooltip, Toast, AlertDialog, Accordion, Separator, Sheet, Avatar, ScrollArea. Native `<select>` is used in `app.tsx` for org switching.
  5. Two pairs of near-duplicate primitive variants in `@phiguard/ui` itself: `Input`/`InputPrimitive` and `Textarea`/`TextareaPrimitive` with subtle focus/border-class drift.
  6. Banned brand-voice word "workflow"/"workflows" still ships in three locations.
  7. Empty `mock-docuseal` route directories left over from removed integration (commit f4759ee).
  8. `@phiguard/ui` package.json export map omits `web-theme.css`; consumers reach for it via deep `../../../../packages/ui/src/web-theme.css` relative imports.

## Findings

### [P0] [CONTENT] Banned word "workflow" appears in shipped UI copy
**File(s):** apps/web/src/components/feature-gate.tsx, apps/web/src/components/ai-cs-support.tsx, apps/marketing/src/components/RelatedContent.astro
**Issue:** Brand voice policy (CLAUDE.md) bans "workflow" / "workflows". Found in feature label/copy in `feature-gate.tsx`, customer-support copy in `ai-cs-support.tsx`, and the default heading "More HIPAA software and workflow guides" in `RelatedContent.astro`.
**Expected:** Replace with healthcare-admin language ("task assignments", "compliance program", "operations", "playbook").
**Fix:** Substitute the offending phrases at each call site; add lint rule (banned-words) to prevent regression.

### [P1] [DUPLICATE] Four hand-rolled Dialog/Modal implementations bypass `@phiguard/ui` Dialog
**File(s):** apps/web/src/components/help-guidance.tsx (HelpDrawer, ConfirmActionDialog), apps/web/src/components/new-task-modal.tsx, plus inline modal patterns elsewhere
**Issue:** Each reimplements overlay, focus trap, ESC handling, and z-index stacking. `getFocusableElements` is duplicated. The exported `Dialog` (Radix-wrapped) in `packages/ui/src/components/dialog.tsx` has zero consumers.
**Expected:** Either route every modal through `@phiguard/ui` Dialog, or delete Dialog if not desired and document one canonical approach.
**Fix:** Migrate the four modals to `Dialog`/`DialogContent`/`DialogOverlay`; remove local focus-trap helpers.

### [P1] [DUPLICATE] `BrandLogo.astro` and `PhiguardLogo.tsx` are twins
**File(s):** apps/marketing/src/components/BrandLogo.astro, packages/ui/src/components/phiguard-logo.tsx
**Issue:** Same asset wrapping logic in two languages. Marketing has its own copy because the React component cannot be used in Astro directly, but the asset path + sizing logic is duplicated.
**Expected:** Single source of `/logo-*.png` paths + sizing constants in `@phiguard/brand`; both components consume that.
**Fix:** Extract logo asset map + size variants into `@phiguard/brand`; have both wrappers import from it.

### [P1] [DUPLICATE] Three near-identical error fallback shells
**File(s):** apps/web/src/components/error-fallback.tsx
**Issue:** `RouteErrorFallback`, `RootErrorFallback`, and `NotFoundFallback` each define their own `cardClass`/`primaryButtonClass`/`secondaryButtonClass` string constants and repeat the same card+button shell.
**Expected:** One `ErrorFallback` primitive built on Card + Button from `@phiguard/ui` with variant prop.
**Fix:** Collapse into one component; the three exports become thin wrappers passing variant.

### [P1] [DUPLICATE] Marketing reimplements buttons as CSS classes instead of using `@phiguard/ui` Button
**File(s):** apps/marketing/src/styles/global.css (`.button-primary`, `.button-secondary`, `.button-tertiary`, `.utility-button`), used across most marketing pages
**Issue:** Two parallel button systems - Tailwind/cva (`Button` in @phiguard/ui) vs bespoke marketing CSS classes. Visual parity is enforced by eye, not code. Hover/focus states already diverge between marketing and app.
**Expected:** Marketing imports a server-rendered Button equivalent or shares CSS variables + a single utility class generated from the same source.
**Fix:** Either create an Astro `<Button>` component that emits the same cva-generated classes, or codify a single CSS class layer in `@phiguard/ui` that both apps consume.

### [P1] [DUPLICATE] Bespoke buttons styled inline in app shell instead of Button component
**File(s):** apps/web/src/routes/app.tsx, apps/web/src/components/ai-cs-support.tsx
**Issue:** `app.tsx` top shell uses hand-rolled `bg-brand-700` styled buttons; `ai-cs-support.tsx` builds Button and Textarea inline.
**Expected:** Use `Button` and `Textarea` from `@phiguard/ui` everywhere.
**Fix:** Replace bespoke buttons with `<Button variant=...>`.

### [P1] [MISSING] No `Select` primitive - native `<select>` used in app shell
**File(s):** packages/ui/src/index.ts, apps/web/src/routes/app.tsx (org switcher), apps/web/src/components/new-task-modal.tsx
**Issue:** Native `<select>` cannot be styled cross-browser to brand. Org switcher uses native select.
**Expected:** Radix Select primitive wrapped in `@phiguard/ui`.
**Fix:** Add `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`; migrate org switcher and new-task-modal.

### [P1] [MISSING] No `Checkbox` primitive
**File(s):** packages/ui/src/index.ts
**Issue:** No checkbox in shared kit. Any usage in the app must be hand-rolled or native.
**Expected:** Radix Checkbox with brand-styled indicator.
**Fix:** Add `Checkbox` to `@phiguard/ui`.

### [P1] [MISSING] No `RadioGroup`, `Switch`, `DropdownMenu`, `Popover`, `Tooltip`, `Toast`, `AlertDialog`, `Accordion`, `Separator`, `Sheet`, `Avatar`, `ScrollArea` primitives
**File(s):** packages/ui/src/index.ts
**Issue:** shadcn coverage is `Button, Label, Input, Textarea, Card, Badge, Table, Tabs, Dialog, EmptyState, StatCard, Page, Alert, Metric, PhiguardLogo` only. A B2B SaaS UI of this scope needs at least the additional primitives above; without them every consumer hand-rolls (e.g. focus traps, dropdowns, toasts).
**Expected:** Add the missing shadcn primitives behind the brand theme.
**Fix:** Scaffold each via shadcn CLI into `packages/ui/src/components/` and export.

### [P1] [INCONSISTENCY] `Input` vs `InputPrimitive` drift inside the kit
**File(s):** packages/ui/src/components/input.tsx
**Issue:** Two components in one file. `Input` uses `border-strong` + `focus-visible`; `InputPrimitive` (used by new-task-modal) uses slightly different border tokens (`border-border-danger` vs `border-danger-600`).
**Expected:** One `Input` API; primitive variant exposed via prop (e.g. `variant="unstyled"`).
**Fix:** Merge to a single component; deprecate the other export.

### [P1] [INCONSISTENCY] `Textarea` vs `TextareaPrimitive` drift inside the kit
**File(s):** packages/ui/src/components/textarea.tsx
**Issue:** `Textarea` uses `focus-visible:` and `border-border-strong`; `TextareaPrimitive` uses `focus:` and `border-border-default`. Focus visuals differ by import.
**Expected:** Single Textarea, focus-visible everywhere.
**Fix:** Collapse to one component.

### [P1] [INCONSISTENCY] NewsletterSignup uses blue `#2563eb`, not brand teal
**File(s):** apps/marketing/src/components/NewsletterSignup.astro
**Issue:** Primary CTA color is hard-coded to `#2563eb` / `#1d4ed8`. Brand primary is teal `#0f766e`. Visible mismatch against rest of marketing site.
**Expected:** `var(--phig-color-brand-600)` for primary background and hover state.
**Fix:** Replace raw hex with token references; remove raw-hex fallbacks.

### [P1] [INCONSISTENCY] PromoBanner blue fallback for teal token
**File(s):** apps/marketing/src/components/PromoBanner.astro
**Issue:** Uses `var(--phig-color-brand-600, #1d4ed8)` - the fallback is blue but the token resolves to teal. If the token ever fails to load, the banner flips brand color.
**Expected:** Fallback should be `#0f766e` (teal) to match the token.
**Fix:** Correct the fallback; also replace magic `max-width: 1200px` with container token.

### [P1] [INCONSISTENCY] LaunchPhaseProgress references a non-existent token and uses blue fallback for brand-400
**File(s):** apps/marketing/src/components/LaunchPhaseProgress.astro
**Issue:** Uses `--phig-color-border-subtle` (not defined in tokens.css) and `var(--phig-color-brand-400, #60a5fa)` - fallback is blue, brand-400 is teal-tinted.
**Expected:** Use a defined token (`--phig-color-border-default`/`--phig-color-border-subtle` must be added if needed); fallback must match the token family.
**Fix:** Add the missing token or switch to an existing one; correct the fallback hex.

### [P1] [INCONSISTENCY] Marketing layout hard-codes raw hex
**File(s):** apps/marketing/src/layouts/LegalLayout.astro
**Issue:** Raw `#374151`, `#2563eb`, `#fef3c7`, `#f59e0b`, `#92400e`. Legal pages drift from token palette.
**Expected:** Token references only.
**Fix:** Replace each hex with the closest `--phig-color-*` token; add semantic tokens for warning/notice surfaces if missing.

### [P1] [INCONSISTENCY] Raw-hex sprawl across 15 marketing components
**File(s):** apps/marketing/src/components/*.astro (91 raw-hex occurrences total)
**Issue:** Background/border/text colors set with raw hex bypass the token system, making palette changes a hunt.
**Expected:** Every color in marketing components flows through `--phig-color-*`.
**Fix:** Scrub raw hex; expose semantic tokens (surface, surface-muted, border-subtle, text-muted, etc.) if missing.

### [P1] [INCONSISTENCY] Marketing `global.css` uses raw `rgb()` shadows
**File(s):** apps/marketing/src/styles/global.css
**Issue:** Shadows like `rgb(16 32 34 / 0.07)` are written inline instead of using `--phig-shadow-*` tokens.
**Expected:** Reference shadow tokens.
**Fix:** Replace each raw `rgb(...)` shadow with a token; add shadow tokens for any missing elevation level.

### [P1] [INCONSISTENCY] `@phiguard/ui` package.json omits `web-theme.css` from exports
**File(s):** packages/ui/package.json, apps/web/src/styles/globals.css, apps/marketing/src/styles/global.css
**Issue:** Consumers import the theme via deep relative paths (`../../../../packages/ui/src/web-theme.css`) because the export map only lists `.`, `./pdf-tokens`, `./tokens.css`.
**Expected:** Add `./web-theme.css` to the exports map; consumers use `@phiguard/ui/web-theme.css`.
**Fix:** Add export entry; update both globals.

### [P1] [INCONSISTENCY] `metric.tsx` exports `SummaryMetric`, not `Metric` - filename misleading
**File(s):** packages/ui/src/components/metric.tsx
**Issue:** File implies a `Metric` primitive but only `SummaryMetric` is exported (used in 31 places).
**Expected:** Either rename file `summary-metric.tsx` or add a `Metric` primitive.
**Fix:** Rename to match the export; update index.ts.

### [P1] [DEAD] `StatCard` exported but unused
**File(s):** packages/ui/src/components/stat-card.tsx, packages/ui/src/index.ts
**Issue:** Zero consumers in `apps/`.
**Expected:** Remove or document intended use.
**Fix:** Delete the file and its export.

### [P1] [DEAD] `Tabs` exported but unused
**File(s):** packages/ui/src/components/tabs.tsx, packages/ui/src/index.ts
**Issue:** Zero consumers in `apps/`.
**Expected:** Remove or wire a real consumer.
**Fix:** Delete or use it (settings page tabs would be a candidate).

### [P1] [DEAD] `Dialog` exported but unused
**File(s):** packages/ui/src/components/dialog.tsx, packages/ui/src/index.ts
**Issue:** Zero consumers - all dialogs in the app are hand-rolled.
**Expected:** Use it (preferred) or delete.
**Fix:** Migrate the four hand-rolled modals to Dialog; keep the export.

### [P1] [DEAD] `apps/web/src/routes/mock-docuseal/` and `mock-docuseal/api/` are empty
**File(s):** apps/web/src/routes/mock-docuseal/, apps/web/src/routes/mock-docuseal/api/
**Issue:** Leftover empty directories from docuseal removal (commit f4759ee).
**Expected:** Removed entirely; no dangling routes.
**Fix:** `git rm -r` the directories.

### [P1] [A11Y] Four hand-rolled focus traps risk drift
**File(s):** apps/web/src/components/help-guidance.tsx, apps/web/src/components/new-task-modal.tsx
**Issue:** Each modal duplicates `getFocusableElements` plus its own keyboard handlers. Inconsistent focus order, ESC handling, and return-focus behavior between them.
**Expected:** One Dialog primitive (Radix) handling all of the above.
**Fix:** See [P1] Dialog consolidation above.

### [P2] [INCONSISTENCY] Dialog references animations that aren't defined
**File(s):** packages/ui/src/components/dialog.tsx
**Issue:** Uses `data-[state=open]:animate-in` Tailwind utility class but no keyframes (`@keyframes enter`/`exit`) defined in tokens or theme.
**Expected:** Either add the tailwindcss-animate-equivalent keyframes in `tokens.css`/`web-theme.css`, or remove the unused animation classes.
**Fix:** Add keyframes in the theme layer.

### [P2] [INCONSISTENCY] Non-standard Tailwind class `max-h-152`
**File(s):** apps/web/src/components/ai-cs-support.tsx
**Issue:** `max-h-152` is not a default Tailwind size and there's no spacing token registered for `152` (spacing scale stops at 16 per tokens.css). Likely renders as no-op.
**Expected:** Use a defined max-height token (`max-h-96`, etc.) or extend the scale.
**Fix:** Replace with a valid utility.

### [P2] [INCONSISTENCY] `pdf-tokens.ts` raw hex lacks explanation
**File(s):** packages/ui/src/pdf-tokens.ts
**Issue:** Raw hex is required by `pdf-lib` (cannot consume CSS variables), but no comment documents why this file bypasses the token system.
**Expected:** Comment explaining the pdf-lib constraint and pointing to the CSS token names these mirror.
**Fix:** Add a header comment; keep values in sync with `tokens.css`.

### [P2] [INCONSISTENCY] Tailwind v4 `@theme` resets non-brand color palettes
**File(s):** packages/ui/src/web-theme.css
**Issue:** Resets `slate`, `zinc`, etc. to initial. Any contributor using `bg-slate-100` will silently get no color. No lint rule enforces brand-only utilities.
**Expected:** Either keep the reset and document it prominently with an ESLint rule banning the disabled palettes, or restore the palettes.
**Fix:** Add a `no-restricted-syntax` lint rule covering disabled Tailwind color utilities; document in `packages/ui/README.md`.

### [P2] [STATES] No shared Skeleton/Spinner primitive
**File(s):** packages/ui/src/index.ts
**Issue:** No `Skeleton`, `Spinner`, or `LoadingDots` primitive; loading states are improvised per-page.
**Expected:** Provide one Skeleton (block + circle variants) and one Spinner.
**Fix:** Add to `@phiguard/ui`.

### [P2] [STATES] EmptyState is the only shared empty-state - no error/empty/loading triad
**File(s):** packages/ui/src/components/empty-state.tsx
**Issue:** EmptyState exists but there's no companion `ErrorState`/`LoadingState`. The three error-fallback variants in `apps/web/src/components/error-fallback.tsx` could be consolidated into a shared `ErrorState`.
**Expected:** A `StatusPanel` primitive with variants: `loading | empty | error`.
**Fix:** Add `StatusPanel` (or three siblings) in `@phiguard/ui`.

### [P2] [A11Y] `<select>` org switcher lacks visible label
**File(s):** apps/web/src/routes/app.tsx
**Issue:** Native select for org switching has no associated `<label>` - only contextual placement.
**Expected:** `aria-label` or visible label.
**Fix:** Add `aria-label="Switch organization"`.

### [P2] [A11Y] Marketing buttons rely on color contrast that has not been verified
**File(s):** apps/marketing/src/styles/global.css (`.button-tertiary`, `.utility-button`)
**Issue:** Ghost/tertiary buttons use muted text on light backgrounds; no automated contrast check.
**Expected:** Verified WCAG AA contrast for body text on all surfaces.
**Fix:** Run axe on representative marketing pages; adjust token values.

### [P2] [INCONSISTENCY] Marketing `global.css` is 1,335 lines - bespoke design system in CSS
**File(s):** apps/marketing/src/styles/global.css
**Issue:** Hero, shell, section, table, FAQ, assurance panel, preview panel, kicker styles all defined as bespoke classes. None of this lives in `@phiguard/brand` or `@phiguard/ui`, so app cannot reuse marketing visuals and vice versa.
**Expected:** Shared layout primitives (Shell, Section, Hero, AssurancePanel) in `@phiguard/ui` or `@phiguard/brand`.
**Fix:** Extract the highest-value patterns (Shell, Section header, KPI panel) into shared primitives.

### [P2] [INCONSISTENCY] `@phiguard/brand` has no design tokens, only identity strings
**File(s):** packages/brand/src/index.ts, packages/brand/src/identity.ts
**Issue:** `@phiguard/brand` exports support email and copy constants but not brand color/typography tokens. Tokens live in `@phiguard/ui/tokens.css`. Marketing imports brand strings but cannot import brand colors as JS values for inline use.
**Expected:** `@phiguard/brand` exposes a typed `tokens` object mirroring `tokens.css`.
**Fix:** Add `packages/brand/src/tokens.ts` with typed color/spacing/typography constants; codegen from `tokens.css` to prevent drift.

### [P2] [DUPLICATE] `feature-gate.tsx` reimplements EmptyState pattern
**File(s):** apps/web/src/components/feature-gate.tsx
**Issue:** Renders a card with icon + heading + body + CTA - same structure as `EmptyState`.
**Expected:** Compose EmptyState (or extend it with a `locked` variant).
**Fix:** Refactor to use EmptyState.

### [P2] [A11Y] No `prefers-reduced-motion` handling in marketing animations
**File(s):** apps/marketing/src/styles/global.css
**Issue:** Transitions/animations defined without `@media (prefers-reduced-motion: reduce)` overrides.
**Expected:** Reduced-motion overrides for any non-essential animation.
**Fix:** Add a global reduced-motion block disabling marketing transitions.

### [P2] [INCONSISTENCY] Z-index numbers hand-picked in Dialog (`z-[300]`/`z-[400]`)
**File(s):** packages/ui/src/components/dialog.tsx
**Issue:** Magic z-index values bypass the `--phig-z-*` tokens defined in `tokens.css`.
**Expected:** Use `z-[var(--phig-z-overlay)]` / `z-[var(--phig-z-modal)]`.
**Fix:** Replace literals with tokens.

### [P2] [SEO] PhiguardLogo `<img>` lacks width/height attributes in some call sites
**File(s):** packages/ui/src/components/phiguard-logo.tsx
**Issue:** Without explicit width/height, layout shifts on logo load.
**Expected:** Always pass intrinsic width/height.
**Fix:** Require width/height in the component props.

### [P2] [INCONSISTENCY] `--spacing: 0.25rem` baseline declared but spacing scale `1-16` enumerated separately
**File(s):** packages/ui/src/web-theme.css, packages/ui/src/tokens.css
**Issue:** Tailwind v4 derives spacing from `--spacing`, but `tokens.css` also enumerates `--phig-space-1` through `--phig-space-16`. Two systems coexist; consumers don't know which to use.
**Expected:** Pick one - either rely on Tailwind's generated `p-4`/`gap-6` utilities driven by `--spacing`, or use named tokens. Document the choice.
**Fix:** Document in `packages/ui/README.md`; remove the unused system.

## Top 10 Consolidation Plan

1. **Add Select, Checkbox, RadioGroup, Switch, DropdownMenu, Popover, Tooltip, Toast, AlertDialog primitives to `@phiguard/ui`.** Highest leverage - every future feature needs these. Without them the app continues to hand-roll, which is where most A11Y/consistency drift originates. Scaffold via shadcn CLI; export from `index.ts`.

2. **Migrate the four hand-rolled modals to the existing `Dialog` primitive.** `HelpDrawer`, `ConfirmActionDialog`, `NewTaskModal`, and any inline modal pattern. Removes duplicated focus traps, fixes A11Y inconsistency, and gives `Dialog` its first consumers (vs being dead code).

3. **Scrub raw hex from marketing components and fix the blue-vs-teal brand mismatches.** Start with `NewsletterSignup.astro` (primary CTA color), `PromoBanner.astro` (fallback), `LaunchPhaseProgress.astro` (missing token + fallback), `LegalLayout.astro`. Goal: zero raw hex in `apps/marketing/src/components/` and `apps/marketing/src/layouts/`.

4. **Unify the two button systems.** Either expose an Astro `<Button>` that emits the same cva classes as `@phiguard/ui/Button`, or codify a single utility-class layer both consume. Eliminates ongoing visual drift between marketing and app.

5. **Collapse `Input`/`InputPrimitive` and `Textarea`/`TextareaPrimitive` into single components.** Resolve focus/border drift; expose any needed variants via props, not via separate exports.

6. **Consolidate `error-fallback.tsx` into one component built on Card + Button.** Three repeated shells become one with a `variant` prop.

7. **Replace banned word "workflow"/"workflows" in `feature-gate.tsx`, `ai-cs-support.tsx`, `RelatedContent.astro`** and add an ESLint `no-restricted-syntax` rule for the banned-words list.

8. **Delete dead exports** (`StatCard`, `Tabs` if not adopted) and the empty `apps/web/src/routes/mock-docuseal/` and `mock-docuseal/api/` directories. Quick wins that shrink the surface to audit.

9. **Fix `@phiguard/ui` package.json exports** to expose `./web-theme.css`; update both globals to use the package alias instead of deep relative imports.

10. **Add a typed `tokens` export to `@phiguard/brand`** generated from `tokens.css`. Unlocks server-rendered Astro inline styles using brand values without raw hex; enables a future shared layout primitives package.
