# Goal: PHIGuard snapshot ready for public release

> Take this snapshot to the standard where it can be flipped public without a second
> thought. Every claim checkable from the tree, every link resolving, every image worth
> showing, and a root-level `portfolio/` directory a reviewer finds in the first five
> seconds.
>
> The product is shut down. The honesty about that is the asset and must not be softened
> into marketing language. An engineering artifact, not a pitch.
>
> **This ledger is committed and public-bound.** It records structural and editorial work
> only. It does not describe the export's preparation.

## Method

1. Diff the export against the private source at directory and blob level. Confirm nothing
   was dropped and identify any drift.
2. Verify every claim in the README against the tree. Numbers come from
   `scripts/portfolio-metrics.mjs`, never typed by hand.
3. **Open every image.** Not the filename, not the manifest entry: the pixels. Hash the
   set to find duplicates.
4. Promote `portfolio/` to the repository root; keep working documents in `docs/`.
5. Re-run `pnpm portfolio:metrics:check` and `pnpm portfolio:screenshots:check` after every
   change. Both must exit 0.

## Severity

`P0` = broken or blocking · `P1` = looks bad or misleads a reader · `P2` = polish

---

## Cycle log

### Cycle 1 (2026-08-13): Structure

- Promoted `docs/portfolio/` to a root-level `portfolio/`. Repointed the five scripts and
  `.gitattributes` entries that hardcoded the old path; regenerated both generated
  documents and confirmed the drift checks still pass.
- Added `portfolio/README.md`, `DECISIONS.md`, `ENGINEERING-LOG.md`, `SECURITY.md`,
  `TESTING.md`. Existing `ARCHITECTURE.md`, `METRICS.md` and `SCREENSHOTS.md` kept.
- **ADRs stay in `docs/adr/`.** They are primary sources written at the time and moving
  them would break links across the tree. `DECISIONS.md` is the retrospective layer over
  them: what each decided, and whether it survived production. It also names the five
  decisions that shaped the codebase and never got a record.
- Added `LICENSE` (source-available, all rights reserved) matching the README's own claim,
  and `pnpm portfolio:screenshots` / `:check`.
- README restructured to surface `portfolio/` three ways: a first-class row in the
  repository-layout table, a `## Documentation` table with one row per document, and inline
  `→` callouts in each section that has a deeper write-up.

### Cycle 2 (2026-08-13): Images

Every tracked PNG opened and hashed. This cycle produced P0-01 through P0-03 below and
rewrote the README's entire hero.

### Cycle 3 (2026-08-13): Captions

Two independent reviews of the finished snapshot. The hero caption written in cycle 2 was
checked against the code it described and did not survive. This cycle produced P0-04, and
reversed the cycle-2 decision to leave misdescribed filenames in `docs/qa/` untouched.

### Cycle 4 (2026-08-18): Portfolio-standard alignment

Brought the repo in line with the portfolio-wide house style (`PORTFOLIO-STANDARD.md`,
which lives outside this repo).

- `README.md` restructured to the required heading set and order: added `## Contents`,
  `## If you read one thing`, `## What it did`, `## Screenshots`, `## Built with AI
  agents`; renamed `## Honest limitations` → `## Known gaps`, `## Repository layout` →
  `## Repository map`, `## Licence` → `## License`; folded the standalone `## Contact`
  section into a new `## Who built this`. Status and byline/license blockquotes converted
  to `> [!IMPORTANT]` / `> [!NOTE]` alert syntax. `## Documentation` cut to two sentences
  and two links so the file-by-file table lives only in `portfolio/README.md`.
- `portfolio/README.md` kept as-is structurally (it already matched the required
  three-part format: audience paragraph, per-file table, "what is not here" paragraph,
  optional "read this one first" pointer) with one line added stating who the pages are
  for.
- `portfolio/SCREENSHOTS.md` restructured from sequential full-width `####` sections to
  an HTML `<table>` grid, two columns wide, full alt text preserved on every image. This
  required editing the generator (`scripts/build-screenshot-index.mjs`, `renderShots` →
  `renderGrid`) rather than hand-editing the output, since the file is machine-written and
  checked by `pnpm portfolio:screenshots:check`. Regenerated; check passes; all 50 images
  still resolve.
- Three untagged code fences tagged (`text` for plain output, `bash` for a shell command):
  `portfolio/ENGINEERING-LOG.md:41`, `docs/adr/0002-hipaa-architecture.md:23,49,137`.
- Editing the generator script changed its own line count, which moved two headline
  numbers (`Hand-written code lines`, `Automation scripts`). Re-ran
  `scripts/portfolio-metrics.mjs`, synced the two figures in `README.md`, and confirmed
  `pnpm portfolio:metrics:check` passes clean.
- `docs/adr/` promotion (task item: surface the ADRs or promote the strongest into
  `portfolio/DECISIONS.md`): **already done** as of Cycle 1. `DECISIONS.md` covers all
  eight ADRs with an outcome per record, and both `README.md` and `portfolio/README.md`
  link it. No further change made.
- **Flagged, not resolved:** the README hero was the audit-log screenshot going into this
  cycle. `docs/getting-badges/assets.md` says not to publish that exact image to
  third-party directories without redaction (dev-workspace identifiers, a raw user-agent
  string, not PHI), and separately notes the snapshot's own hero use was reviewed and
  kept anyway. That second note reads as the settled answer, but it was written in the
  same editorial pass as the choice it's defending, so this cycle did not treat it as
  independent confirmation. The hero was swapped to the compliance-checklist screenshot,
  which has nothing to weigh either way. The audit-log image was not deleted. It is still
  in `portfolio/screenshots/qa/` and in the `## Screenshots` grid, with the same caption.
  See "Open for the owner" below.

---

## Findings registry

### P0-01 (FIXED): the product screenshot archive did not show the product

`apps/web/e2e/portfolio-screenshots.spec.ts` rejected a captured screen only on an HTTP
status of 400 or above. TanStack Router redirects on the client, so a route the signed-in
account could not reach still resolved 200 and was written to disk under the *requested*
screen's filename.

The committed archive was the result: 43 product PNGs, 12 distinct renderings. 38 were the
onboarding "choose a plan" gate wearing another screen's name, including all four images
the README used as its hero strip, captioned dashboard, audit trail, SOC 2 controls and
compliance programme. The only difference between the "distinct" renderings was the user's
name in the sidebar.

The tell sat in the manifest for four months: 26 consecutive entries with identical byte
counts. Every assertion in the spec was green the whole time, because the spec asserted a
file was written, was non-empty, and did not error: never that it showed the screen it
claimed to.

Fixed: the spec now compares the landed pathname against the requested one and throws. The
38 files were deleted rather than relabelled. Seven genuine captures remain.

### P0-02 (FIXED): four filenames, one image, and the image is a plan gate

`docs/qa/screenshots/compliance-program-dashboard.png`,
`compliance-program-dashboard-working.png`, `compliance-program-working.png` and
`compliance-program-after-reseed.png` are one identical image. It shows a plan gate reading
"This feature requires a higher plan. Feature: compliance_addon."

Two of those filenames assert `working` about a screen on which nothing is working.

Originally fixed by exclusion: none was embedded anywhere, and the files were left in
`docs/qa/` on the reading that a dated QA directory is evidence and editing it would be
falsifying evidence. **That reading was overturned in cycle 3** (see P0-04). A filename is
not evidence of anything; it is an assertion by whoever typed it, and four assertions
pointing at one image cannot all be true. The three redundant copies were deleted and the
surviving file renamed `compliance-program-plan-gate.png`, which is what the pixels show.
Nothing that only existed in those bytes was lost: they were identical.

### P0-03 (FIXED): the marketing site's product shot was the empty state

`docs/qa/screenshots/02-dashboard.png` is byte-identical to
`apps/marketing/src/assets/product-dashboard.png`. That asset is the product screenshot the
marketing site shipped, and it shows a workspace with 0 open tasks, 0 open incidents, 0
completed checklists.

Fixed by exclusion: not embedded in any portfolio document. The marketing source is left as
it shipped, because the snapshot records what was built rather than what should have been.

**Root cause, shared by all three.** A filename is a claim made by whoever typed it. It is
not a description of the pixels, and nothing in this repository ever checked one against
the other. That mistake happened twice independently here: once in an automated capture
pipeline that trusted its own route list, and once in a hand-run QA session that trusted
its own naming. Both survived for months because reading a filename is cheaper than opening
a file, and every reviewer took the cheaper option, including the tooling.

### P0-04 (FIXED): the README's flagship engineering claim was false

The caption under the hero image, written in cycle 2, said the Actor column showed UUIDs
because attribution is a foreign key and rendering a name would mean joining a `*.phi.ts`
table into a screen an external auditor can read. Both halves are false, and each is
checkable in about a minute:

- `actor_id` is a plain `text` column (`packages/audit/src/schema/audit-events.phi.ts`,
  `packages/db/drizzle/0002_audit_events.sql`). No migration adds a foreign key to it. The
  only referential integrity on `audit_events` is `tenant_id → organizations`, added in
  `0017_audit_events_tenant_fk.sql`.
- The join is shipped, not avoided. `apps/web/src/server/audit.ts` batch-resolves actor ids
  against the `users` table (`users.phi.ts`) and returns `actorName`;
  `apps/web/src/routes/app/audit/index.tsx` renders it and falls back to the raw id.
  `AUDIT_LOG_ACCESS_ROLES` is `org_owner`, `org_admin`, `auditor`: the auditor role reads
  the resolved names.
- The repository already said so. `docs/qa/prod-readiness-findings.md` records **P2-008
  (FIXED)**: "Actor ID column showed raw UUID. Fix: audit query joined `users` table; UI
  renders actor name."

The screenshot does show UUIDs. It shows them incidentally: it is a capture from the
2026-04-19 sweep, timestamped that morning, of the defect P2-008 describes, taken before
the fix landed. The caption promoted an artifact of capture order into a design principle.

Rewritten to describe what the code does. The honest version is the more interesting note:
a name-resolution join into a PHI-adjacent table was added for auditor usability and it
reaches the auditor role, while the attribution it resolves has no referential integrity
behind it. That is a real tension between two HIPAA instincts: make the audit trail
readable, keep PHI-adjacent joins narrow, and the repository's own QA log is where it got
decided, by a usability finding, without anyone writing down the trade.

The same correction was applied to the two other places that repeated it: the entry for this
image in `portfolio/screenshots/qa/manifest.json`, which now says the capture predates the
fix, and P1-01 below, which had recorded the caption's reading as fact.

**This is the third time in this repository that something asserted about an image or its
caption turned out not to match reality.** P0-01 was a capture pipeline trusting its route
list. P0-02 was a QA session trusting its own filenames. P0-04 is a caption written by
someone who looked at the pixels, formed a plausible explanation for them, and did not open
the schema. The first two were mechanical; this one was reasoning, which is worse, because
it was persuasive enough to be made the flagship bullet and to survive one review. The
control that would have caught all three is the same: for any claim about an image, name
the file that makes it true and open that file.

### P1-01 (FIXED): the README hero showed no compliance product

After P0-01, the surviving captures were four unauthenticated screens plus billing and the
onboarding gate. Honest, but it left a HIPAA compliance platform with a README showing no
compliance features.

Four genuine, populated captures were recovered from `docs/qa/screenshots/`: the audit log
with real events, an Access Review checklist cited to 45 CFR §164.308, the checklist
rollout screen, and a task with its activity trail. All four were opened and verified
before use, and confirmed to contain no re-identifiable person. Promoted to
`portfolio/screenshots/qa/` under a separate manifest, because merging them into the app
manifest would imply a provenance they do not have: they are hand-picked and not
reproducible by re-running a script.

The audit log is now the hero. Its caption, written in this cycle, read the UUIDs in the
Actor column as a deliberate PHI boundary. It is not one. See P0-04.

### P1-02 (FIXED): generated documentation described an archive that no longer existed

`scripts/build-screenshot-index.mjs` emitted a paragraph asserting that the audit trail
visible in the captures had been genuinely produced by the seeded actions. After P0-01 no
capture showed an audit trail at all.

The generator now renders the manifest's own note about what is missing, and marks the
seeded-workspace counts as a description of the seed rather than of the captures.

### P1-03 (FIXED): filenames in `docs/qa/` asserting actions the pixels do not show

Three more, found by hashing the directory and then opening each file:

- `compliance-checklist-after-reload.png` and `compliance-checklist-item-checked.png` are
  byte-identical. One image, two filenames naming two different user actions. The image
  shows an Access Review checklist at 1 of 3 complete with the first item ticked and struck
  through, which is what `item-checked` says and all that can be read off it. The
  `after-reload` copy was deleted.
- `compliance-program-error.png` is the Program route with the Program nav item selected
  and an empty content area. No error message, no error state, nothing but chrome. Renamed
  `compliance-program-blank-content.png`, which is what is on screen. Why it was blank is
  not recoverable from the image.
- `compliance-checklists-list-bottom.png` was byte-identical to
  `docs/qa/screenshots/compliance-checklists-list.png`, the file promoted to
  `portfolio/screenshots/qa/compliance-checklists-list.png` in cycle 2. The pixels show the
  *top* of the checklist rollout screen: page heading, assign-template form, and the head
  of the completion-by-location table, with the scroll thumb at the top. Whatever `-bottom`
  was meant to record, it is not the framing in the file. Deleted; the identical bytes
  survive under the promoted name, and that framing is the right one for the portfolio:
  it is the whole feature in one screen.

None of these was embedded in a portfolio document, so no caption changed. The counts in
`portfolio/ENGINEERING-LOG.md` were updated to match the directory as it now stands: 32
files, 30 unique. `docs/getting-badges/assets.md` (a launch-directory asset plan that never
ran) listed the plan gate twice as "Compliance program dashboard" and as a Product Hunt
gallery image, and pointed at three files that cycle 2 had already moved. Paths corrected,
and the plan gate marked as not usable as a product shot.

### P2-01 (SUPERSEDED BY P0-04): duplicate images in `docs/qa/`

Of the 37 files then in that directory, 31 were unique: 4 duplicate groups covering 6
redundant files. Left as written, on the argument that an "after reload" capture which is
byte-identical to the one before it is how a QA session proves persistence.

That argument does not hold. Identical bytes cannot distinguish a genuine re-capture from
a copied file, so the pair proves nothing it is credited with, and the reader has only the
filename's word for which action produced it. Reversed in P0-04. Two duplicate pairs remain
(`02-dashboard.png` / `02b-dashboard-scroll.png`, `06-dashboard-after-login.png` /
`06b-dashboard-scroll.png`); their names describe a viewport position rather than a state
change, and they were left alone.

### Cycle 5 (2026-08-18): Screenshot pipeline and two text defects

A fresh review after Cycle 4 graded the repo B+ and found numbers, links, headings and mermaid
diagrams essentially airtight. This cycle covers what it did find: the screenshot capture
pipeline (a cookie-consent banner baked into marketing captures, and a desktop grid pairing
pages of wildly different lengths), two small wording defects, and one disclosure gap.

- **P1: cookie-consent banner baked into marketing captures.** `apps/marketing`'s fixed
  bottom banner ("We use analytics to improve phiguard.app...") was caught mid-page by
  `capture-portfolio-screenshots.mjs`'s full-page `page.screenshot()`, because the banner is
  `position: fixed` and the capture ran before it was dismissed. Opened every PNG in
  `portfolio/screenshots/marketing/` (not just the seven the review confirmed) and found the
  same overlay in effectively every desktop capture: the banner only renders when
  `PUBLIC_POSTHOG_KEY` is set, and it was set for the original capture run.
  **Fixed at the root rather than patched per image:** re-ran `apps/marketing/scripts/capture-portfolio-screenshots.mjs`
  against a build with no `PUBLIC_POSTHOG_KEY` configured (the repo's own checked-in
  `.env.example` default) so the banner block never enters the DOM. All 39 marketing PNGs and
  the marketing `manifest.json` were regenerated. Every previously affected page (`trust.png`,
  `hipaa.png`, `product.png`, `pricing.png`, `subprocessors.png`, `baa.png`, `404.png`, plus
  `home.png`, `features-index.png`, `security.png` and others not in the original seven) opened
  and confirmed clean. Page heights are within ~150px of the prior capture, confirming the fix
  removed only the overlay, not content.
- **P1: desktop screenshot grid paired wildly mismatched heights.** `resources-index.png`
  (33,702px) sat beside `compare-index.png` (19,243px); `subprocessors.png` (2,011px) sat
  beside another multi-thousand-pixel page. Root cause was the capture script's full-page
  screenshot having no height ceiling, combined with `build-screenshot-index.mjs` rendering
  the grid in raw manifest order. Fixed in the capture script:
  `capture-portfolio-screenshots.mjs` now crops any capture past 9,000px (`MAX_CAPTURE_HEIGHT`,
  roughly ten desktop viewport-heights) to that height before palette optimization. This
  brought the tallest page in the archive down from 33,702px to 9,000px. Fixed in the index
  generator: `build-screenshot-index.mjs` now reads each PNG's real pixel height straight out
  of its IHDR chunk (no new dependency: root `scripts/` had no image library and this avoided
  adding one) and sorts the marketing desktop and mobile grids tallest-first, so the 2-column
  table pairs neighbours in height rather than neighbours in capture order. `valign="top"` was
  already present on every populated cell from Cycle 4's grid rewrite. Re-ran both capture and
  index scripts; `pnpm portfolio:screenshots:check` passes.
- **P1: `portfolio/README.md`'s machine-readable-files table overflowed at 375px.** The
  3-column table's third column (`Regenerate`) was pushed off-screen and the unbroken code span
  `scripts/portfolio-metrics.mjs` truncated, while the root README's own tables wrap cleanly
  because they never put a long unbroken path in a `<code>` span this narrow. Collapsed to two
  columns (`File`, `Written by, regenerated with`) and dropped the `scripts/` prefix from every
  code span (stated once in the prose above the table instead), shortening the longest
  unbroken token from 30 characters to 21.
- **P1: `portfolio/SECURITY.md`:275 read "object storage under Object Lock."** Object Lock is
  an S3 feature name, not a generic one, and the same fact is named plainly as S3 in
  `portfolio/DECISIONS.md`:87 and throughout `docs/adr/0002-hipaa-architecture.md`; Cloudflare
  R2 is also named plainly elsewhere in the same `SECURITY.md`. Restored "S3." Swept
  `ARCHITECTURE.md`, `DECISIONS.md`, `ENGINEERING-LOG.md`, `TESTING.md`, `METRICS.md`,
  `SCREENSHOTS.md`, `portfolio/README.md` and the root `README.md` for the same pattern
  (a proper noun replaced with a generic term that reads oddly). Found no second instance.
- **P2: synthetic seed account not disclosed at the point of contact.** `billing.png` and
  `onboarding-choose-plan.png` (plus its `.mobile.png` twin) show a faker-seeded name and org
  in the sidebar. `SCREENSHOTS.md` already discloses the seed above its grid, but the root
  README's `## Screenshots` section and the per-image captions did not. Added
  "(synthetic seed account)" to the `billing.png` alt text and caption in `README.md`, and to
  the three affected captions in `portfolio/screenshots/app/manifest.json` (which
  `build-screenshot-index.mjs` renders into `SCREENSHOTS.md`, so both surfaces stay in sync
  from one edit).
- **Numbers re-synced.** Editing `capture-portfolio-screenshots.mjs` and
  `build-screenshot-index.mjs` changed their own line counts, which moved the same two
  headline figures Cycle 4 hit for the same reason (`Hand-written code lines`, `Automation
  scripts`). Re-ran `scripts/portfolio-metrics.mjs`, synced `README.md`, and confirmed
  `pnpm portfolio:metrics:check` and `pnpm portfolio:screenshots:check` both pass clean.
  Every file `portfolio/README.md` indexes re-verified against `wc -l`: `ARCHITECTURE.md` 260,
  `DECISIONS.md` 169, `ENGINEERING-LOG.md` 224, `SECURITY.md` 284, `TESTING.md` 183, all in
  the 120 to 450 line band `PORTFOLIO-STANDARD.md` sets. `METRICS.md` (110) and `SCREENSHOTS.md`
  (328) are explicitly length-exempt in that same spec. `portfolio/README.md` itself is 56
  lines, under 120 but allowed where the content is specific and real, which this is. Every
  relative link, `#anchor` and image reference across `README.md` and all eight
  `portfolio/*.md` files checked programmatically: 192 references, 0 broken.

---

## Open for the owner

- **Confirm the hero swap in Cycle 4, or revert it.** The audit-log screenshot is no
  longer the README hero (see Cycle 4). `docs/getting-badges/assets.md` carries two
  readings of whether that image was ever meant to be published this way, and both were
  written by the same process that made the original choice. Worth a second, independent
  look rather than trusting either note on its own.
- **Re-capture the automated archive.** The dashboard, incident register, SOC 2 screens,
  policy library, risk register, reports and every mobile viewport have no verified image.
  This needs Docker, a seeded account pushed past onboarding, and a fresh run of the
  capture spec, which now fails loudly instead of writing the wrong screen.
- **Decide on the support mailbox** that appears in tracked source and in one marketing
  screenshot. It is the product's own address on a domain that is lapsing, so it is not a
  disclosure, but it carries a personal name, and whether that belongs in a public
  repository is the owner's call, not this track's.

### Cycle 6 (2026-08-18): Six-column `Workspaces` table (standard §3.3)

`portfolio/METRICS.md`'s `## Workspaces` table had six columns (Package, Files, Source lines,
Test lines, Test files, Test cases) against the standard's five-column maximum. `Test files` and
`Test cases` combined into one `Test files / cases` column (`99 / 1,065` per row), the same
paired-numeric-cell pattern grantpipe's `Functions / Branches` column already uses, dropping the
table to five columns without losing a figure: all 18 rows (17 packages plus `@phiguard/config`,
which the first edit pass missed and a re-read caught) re-checked cell by cell against the
pre-edit table. No other table in `portfolio/METRICS.md` or the root `README.md` exceeds five
columns. `portfolio/README.md`'s index length for `METRICS.md` was already 110 lines before and
after this edit (row/column reshaping, no line-count change), so no index update was needed.
Every relative link, `#anchor` and image reference in `README.md` and `portfolio/METRICS.md`
re-checked programmatically; zero broken. No secret literal found.

### Cycle 7 (2026-08-18): Corpus-wide index length column was missing entirely

- The cross-repo standard fixed `portfolio/README.md`'s index table column order as link,
  length, summary. This repo's two tables under `## The pages` and
  `## The machine-readable files` had no length column at all.
- Added a `Length` column (second position) to both tables, verified against `wc -l`/actual
  line counts: `ARCHITECTURE.md` 260, `DECISIONS.md` 169, `ENGINEERING-LOG.md` 224,
  `SECURITY.md` 284, `TESTING.md` 183, `METRICS.md` 110, `SCREENSHOTS.md` 330 lines; and
  `metrics.json` 430, `provenance.json` 16, `coverage.json` 471 lines. The
  `screenshots/*/manifest.json` row covers three separate manifest files, so it declines a
  number and uses `see file` rather than one that would rot.
- Recomputed every length cell against `wc -l` after the edit: all rows match exactly.
- Ran a relative-link and `#anchor` resolution sweep over `README.md` and every
  `portfolio/*.md` file: all resolve, nothing else touched this cycle.
