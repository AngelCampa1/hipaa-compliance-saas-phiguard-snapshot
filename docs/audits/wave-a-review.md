# Wave A Review - frontend-audit-fix

Reviewer: code-review agent
Branch: `frontend-audit-fix` @ `e8b4b88`
Scope: Wave A bundles A1-A8 per `docs/audits/00-fix-plan.md`

Build sanity:
- `pnpm --filter @phiguard/web typecheck` - PASS
- `pnpm --filter @phiguard/marketing build` - PASS (897 pages)
- `pnpm --filter @phiguard/marketing test` - **FAIL** (4 of 68 tests fail, all due to deleted `NewsletterSignup.astro` being referenced in tests reintroduced by A1+A4 commit after A3 had removed them)

Regression sweeps:
- `rg -i "docuseal" apps packages` (excl. migration) - clean ✅
- `rg "window.location.(reload|assign|href\s*=)" apps/web/src/routes` - only intentional download/auth/billing/integrations remain; A6/A7 in-scope files clean ✅
- `rg "workflow" ` in A1/A2 in-scope files - clean ✅ (one acceptable URL-slug remnant `phi-workflows/index` in nav href, visible label is "PHI Procedures")
- `rg "StatCard|buildSearchParams|draft-notice" apps packages` - gone ✅
- `rg "NewsletterSignup" apps` - 4 stale references in `static-contracts.test.ts` ❌

---

## A1 - Banned-jargon sweep: marketing pages (commit a03ac9e)

**Spec**: ✅ Mostly compliant
- All 11 listed pages and `internal-links.ts` rewritten; "workflow"/"workflows" replaced with "operations", "procedures", "operating model", "audit", etc.
- Mega-menu label "PHI Workflows" → "PHI Procedures" applied. The href value `learnPage('phi-workflows/index')` is unchanged - acceptable since this is a slug path (matches a content directory) not user-visible copy.
- Test guard added for absent fabrication ("does not promise no spam…", "keeps Angel Campa…" rewrites).

**Quality**: ✅ Idiomatic. Rewrites read naturally; consistent vocabulary (procedures / operations / operating model). No grammar regressions spotted.

**Issues**:
- Spec required running `stop-slop` + `humanizer` skills after substitution per CLAUDE.md. No evidence either was invoked; the prose looks clean but no signal in commit message.

**Action items**:
- None blocking. Optional: run `stop-slop` + `humanizer` over the touched marketing prose before final merge.

---

## A2 - Banned-jargon sweep: app shell & shared knowledge (commit 2f8b8a0)

**Spec**: ✅ Fully compliant
- `feature-gate.tsx`: integrations label, soc2_evidence label, and "workflow complexity" → "compliance program complexity" all swapped.
- `ai-cs-support.tsx`: warm-up message rewritten.
- `RelatedContent.astro`: default heading rewritten.
- `tasks.$taskId.tsx`: "Current workflow state" → "Current task state".
- `packages/knowledge/src/app.ts`: both lines 529 and 925 rewritten; bonus rewrites at ~16, 631, 882 also touched up (consistent with sweep intent).

**Quality**: ✅ Clean string-only swaps. No code logic affected.

**Issues**: None.

**Action items**: None.

---

## A3 - Dead code & legacy artifact removal (commit 2c7fed5)

**Spec**: ✅ Locally compliant - but ❌ effectively broken after A1+A4 landed on top
- `mock-docuseal/`: confirmed already removed by prior commit `f4759ee`; commit message correctly notes "were never git-tracked".
- `NewsletterSignup.astro`: deleted, **and** four test blocks in `static-contracts.test.ts` that referenced it were removed in A3.
- `.draft-notice` CSS block: removed from `LegalLayout.astro`.
- `stat-card.tsx`: file was already removed in a prior commit (acknowledged in commit message); A3 cleaned the dangling export line in `packages/ui/src/index.ts`.
- `buildSearchParams` removal correctly deferred to A6 commit (which did remove them).

**Quality**: ✅ Clean deletions, sensible commit message documenting overlap with A6/A7.

**Issues** (REGRESSION):
- The later commit `a03ac9e` (A1+A4) re-added the four NewsletterSignup test blocks that A3 had removed. Current HEAD has the test file referencing a deleted source file. Running `pnpm --filter @phiguard/marketing test` produces 4 ENOENT failures in `static-contracts.test.ts`:
  - line 113 (newsletter localhost guard)
  - line 262 (no-spam copy guard)
  - line 271 (newsletter attribution + a11y)
  - line 287 (newsletter delivery-failure copy)
- Net effect: A3's test cleanup was clobbered by A1+A4. This is a merge/ordering bug, not a spec deficiency in A3 itself.

**Action items**:
- **BLOCKING**: Re-remove the four `NewsletterSignup.astro` references in `apps/marketing/src/lib/static-contracts.test.ts` (lines ~113, ~261-282, ~287-292). Restore the simpler `leadPanel`-only assertions that A3 originally wrote.

---

## A4 - JSON-LD author fabrication + dead internal link (commit a03ac9e)

**Spec**: ✅ Fully compliant
- `seo.ts buildArticleSchema`: removed default "Angel Campa" Person author + LinkedIn `sameAs`. Now: if `authorName` provided → Person, else → Organization (`legalNotice.entity` / `BASE_URL`). Matches the "default to Organization" guidance.
- `internal-links.ts`: `noticeOfPrivacyPractices` export removed. Worker still 301-redirects `/notice-of-privacy-practices` → `/privacy`, and legacy redirects file references the URL - fine, the export removal only drops the dead nav reference.
- `contributors/[slug].astro`: hostname-based label map implemented (`linkedin.com`→LinkedIn, `twitter.com|x.com`→X, `github.com`→GitHub, `orcid.org`→ORCID, else hostname).
- Test added (`articleSchema.author.name).not.toBe('Angel Campa')`) guards the fix.

**Quality**: ✅ Clean. The `new URL(href).hostname.replace(/^www\./, '')` normalization is correct. Author schema branch is type-safe (no spread of undefined into Person/Organization).

**Issues**:
- `apps/marketing/src/lib/contributors.ts` still contains `name: 'Angel Campa'` + LinkedIn `sameAs` - this is intentional (it's the real contributor record, not a fabricated default), so not a finding. Worth flagging only because the verification grep `rg "Angel Campa|angelcampa1" apps/marketing/src` is not zero. The verifier should treat `lib/contributors.ts` and `pages/about.astro` (the founder's own bio) as allowlisted.

**Action items**: None blocking.

---

## A5 - product.astro repeated-bullet bug (commit 1112150)

**Spec**: ✅ Fully compliant
- `pillar.detail` now renders once above the bullet list; per-bullet duplicate `<p>{pillar.detail}</p>` removed.

**Quality**: ✅ Minimal, surgical change. Preserves existing CSS classes (`detail-grid`, `detail-card`). Wrapping `<div>` around the `<p>` + `<div class="detail-grid">` is acceptable layout grouping.

**Issues**: None.

**Action items**: None.

---

## A6 - Hard-navigation → router navigation (commit 2d3e7fa)

**Spec**: ✅ Fully compliant
- `tasks.tsx`: location-scope `<select>` handler uses `navigate({ to: '/app/tasks', search: { status, locationId } })`.
- `tasks.new.tsx`: post-create flow uses `router.invalidate()` then `navigate({ to: '/app/tasks/$taskId', params, search })`. Matches the pattern reference in the plan.
- `help.tsx`: mobile category select uses `useNavigate`. Note: explicitly sets `topic: undefined, q: undefined` - preserves prior behavior (the original code only kept the category param).
- `compliance/checklists.index.tsx` filter select: migrated.
- `compliance/policies/index.tsx` filter select: migrated.
- `buildSearchParams` helpers removed from `tasks.tsx`, `checklists.index.tsx`, `policies/index.tsx` (delivers the A3-deferred cleanup).

**Quality**: ✅ Idiomatic TanStack Start usage. `void navigate(...)` used to discard the promise where appropriate. `await router.invalidate()` + `await navigate(...)` in `tasks.new.tsx` correctly sequenced.

**Issues**: None.

**Action items**: None.

---

## A7 - `window.location.reload()` → `router.invalidate()` sweep (commit 2d3e7fa, shared with A6)

**Spec**: ✅ Fully compliant
- Every listed file (`checklists.index.tsx`, `policies/index.tsx`, `program.policies.tsx`, `program.policies.$policyId.tsx`, `program.risk.tsx`, `program.training.tsx`, `program.vendors.tsx`, `soc2.access-reviews.index.tsx`, `soc2.access-reviews.$reviewId.tsx`, `admin.partners.tsx`) replaces `window.location.reload()` with `await router.invalidate()`.
- Snapshot-before-invalidate pattern correctly applied where notice text depends on mutation result:
  - `admin.partners.tsx` `approve` handler: `const resultText = ...; setRunResult(resultText); await router.invalidate()`.
  - `soc2.access-reviews.$reviewId.tsx` `submitDecision`: `const noticeText = ...; setNotice(noticeText); await router.invalidate()`.
- Repo-wide `rg "window.location.reload" apps/web/src` returns zero matches. ✅

**Quality**: ✅ Consistent pattern across all 10 files. No bare `void router.invalidate()` where notice would be lost.

**Issues**: None.

**Action items**: None.

---

## A8 - SOC2 evidence manual-key footgun (commit 5038c67)

**Spec**: ✅ Fully compliant
- `fileKey` text input and its helper paragraph removed (the `<div className="md:col-span-2">` block lines ~394-414 deleted).
- `fileKeyValue` variable removed.
- Initial `evidenceFileKey` value changed from `fileKeyValue` to `""`.
- Error message simplified to "Upload an evidence file to record evidence."

**Quality**: ✅ Clean removal. No now-dead state or props left.

**Issues**:
- Plan note said "Leaves the BAA helper text (sep. finding in D4 - coordinate by not touching the 'your organization's SOC 2 evidence prefix' copy here)". That copy was inside the deleted helper paragraph - logically inseparable from the removed input. Removing it is the correct action; the plan note is somewhat self-contradictory. No remediation needed.

**Action items**: None.

---

## Decision: NEEDS_FIXES

Blocking issues before merging Wave A to master:

1. **A3/A1+A4 test regression**: `apps/marketing/src/lib/static-contracts.test.ts` references the deleted `NewsletterSignup.astro` file in four locations (lines ~113, ~261-269, ~270-283, ~287-292). The A1+A4 commit (a03ac9e) re-introduced test blocks that the earlier A3 commit (2c7fed5) had explicitly removed. Marketing test suite fails 4/68. Re-remove those blocks (or restore the simpler `leadPanel`-only assertions A3 wrote) before merging.

Non-blocking observations:

- A1: confirm `stop-slop` + `humanizer` were run over rewritten marketing prose (CLAUDE.md requirement); commit message has no signal.
- A4: `lib/contributors.ts` and `pages/about.astro` legitimately contain "Angel Campa" - verification grep is noisy but not actionable.

Everything else in Wave A is implementation-correct and ready to ship. Typecheck and marketing build both pass.
