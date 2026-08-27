# Engineering log

Defects worth reading about, with the root cause and the file that carries the
fix. Not a changelog. Every entry here is checkable against the tree.

The ordering is by how much each one taught, not by date.

---

## 1. An entire screenshot archive that passed every assertion and was wrong

**Found:** while preparing this snapshot for publication, not during development.
**Fix:** [`apps/web/e2e/portfolio-screenshots.spec.ts`](../apps/web/e2e/portfolio-screenshots.spec.ts)

The Playwright capture spec walked a list of product routes, signed in as a
seeded account, and wrote a PNG per route. It rejected a screen only on an HTTP
status of 400 or above.

TanStack Router redirects on the client. A route the signed-in account could not
reach still resolved 200: the server returned a perfectly good document, and the
router then moved the user somewhere else before the screenshot was taken. The
capture wrote that somewhere-else under the requested screen's filename.

The committed archive was the result: 43 product PNGs, 12 distinct renderings, and
every authenticated one was the onboarding "choose a plan" gate. The four images
the README used as its hero strip, labelled dashboard, audit trail, evidence
controls, compliance programme, were four copies of the same onboarding screen.
The only thing separating the "distinct" renderings was the user's name in the
sidebar.

The tell was visible in the manifest all along and nobody looked: 26 consecutive
entries with `"bytes": 80175`.

```bash
# what should have been run at any point in four months
md5sum portfolio/screenshots/app/*.png | awk '{print $1}' | sort | uniq -c | sort -rn
```

The fix compares the landed pathname against the requested one and throws:

```text
redirected to /app/dashboard: the account cannot reach this screen
```

**Why it matters more than a broken test.** Every assertion in that spec was green
for the life of the project. The spec asserted that a file was produced, that it
was non-empty, and that the response was not an error. All three were true. None
of them was the property anyone cared about, which was *is this a picture of the
thing it says it is*. A green suite that checks the wrong invariant is worse than
no suite, because it converts an unexamined assumption into documented fact.

**Current state, stated plainly.** The 38 mislabelled files were deleted rather
than relabelled. Seven of the automated captures survive: four signed-out screens,
the billing page, and the onboarding gate correctly named this time.

Four more came from an unexpected place. A manual QA sweep on 2026-04-19 had left
hand-taken screenshots in `docs/qa/screenshots/`, which nothing referenced and
which the capture pipeline knew nothing about. Four of them are genuine, populated
captures of the compliance product: the audit log with real events, an Access
Review checklist cited to 45 CFR §164.308, the checklist rollout screen, and a
task with its activity trail. They were promoted to
[`portfolio/screenshots/qa/`](./screenshots/qa/) under their own manifest, because
merging them into the app manifest would have implied a provenance they do not
have: they are hand-picked and cannot be reproduced by re-running anything.

Two things about that directory are worth recording, because they are the same
failure in miniature. Hashing it turned up four filenames pointing at one image:
`compliance-program-dashboard.png`, `compliance-program-dashboard-working.png`,
`compliance-program-working.png` and `compliance-program-after-reseed.png`, and
that image is a *paywall gate* reading "This feature requires a higher plan.
Feature: compliance_addon." Two of the four assert `working` about a screen
showing a feature that is gated. Three more named states the pixels do not show:
an "after reload" capture byte-identical to the "item checked" one beside it, an
"error" capture with no error on it, and a "list bottom" capture framed on the top
of the page.

Separately, `02-dashboard.png` is byte-identical to
`apps/marketing/src/assets/product-dashboard.png`, meaning the product shot the
marketing site shipped is the same empty-state dashboard, showing 0 open tasks and
0 open incidents.

The first instinct was to leave all of it alone, on the grounds that a dated QA
directory is evidence and editing evidence is falsification. That was wrong. A
filename is not evidence; it is an assertion, and four assertions pointing at one
image cannot all be true. The redundant copies were deleted and the survivors
renamed to what is on screen: 32 files, 30 unique, and the two remaining
duplicates are `-scroll` pairs that name a viewport position rather than a state
change. The marketing asset was left as it shipped, because the snapshot records
what was built. The point is that the same mistake shows up in two independent
places in this repository: a filename was trusted as a description of an image,
twice, for months.

Re-capturing the routes that still have no image needs Docker, a seeded account
pushed past onboarding, and a fresh run, none of which happened before shutdown.
The gap is recorded in
[`portfolio/screenshots/app/manifest.json`](./screenshots/app/manifest.json)
rather than papered over.

## 2. The metrics script contradicted the guarantee it was helping to make

**Fix:** [`scripts/portfolio-metrics.mjs`](../scripts/portfolio-metrics.mjs)

[`packages/knowledge/src/static-contracts.test.ts:250`](../packages/knowledge/src/static-contracts.test.ts)
asserts that three strings (the dissolved corporation's name, the founder's full
legal name, and the registered-agent street address) appear nowhere in the
published source. The needles are stored base64 so the guard does not itself
republish the strings it exists to exclude, and it decodes them at runtime so the
guard file is scanned like every other file.

The metrics script carried the old GitHub organisation name as a plaintext map key
in its author-alias table, used once to merge two git identities into one
contributor. It was the last plaintext occurrence in the tree. Encoded to match
the convention the guard already established.

The general shape: a scrubbing rule that a build script is exempt from is not a
rule. The guard's design, scan yourself, encode your own needles, is the part
worth stealing.

## 3. Concurrent branches minting the same migration number

**Record:** [ADR 0017](../docs/adr/0017-migration-numbering-discipline.md)

At its worst: 27 migration files, 19 registered journal entries, and colliding
prefixes (`0003b`, `0003c`, more than one `0008`). Two branches would each
generate "the next" migration, both would be right locally, and the merge would
produce a database that applied in a different order than either developer had
tested.

Resolution: `packages/db/drizzle/meta/_journal.json` owns the order through its
`idx` field. Filenames are decoration. An index is never reused.

The tree ends at 62 `.sql` files against 62 journal entries with no gaps.

ADR 0017 is the most useful record in the set, and the reason is that it was
written after the mistake rather than before it. A migration-numbering convention
written in advance reads like bureaucracy; the same convention written the day
after a bad merge reads like a scar, and people follow scars.

## 4. Per-request database scoping removed as if it were boilerplate

**Record:** [ADR 0018](../docs/adr/0018-hyperdrive-request-scoped-db.md)
**Guarded by:** [`packages/db/src/client.test.ts`](../packages/db/src/client.test.ts),
[`packages/auth/src/__tests__/hyperdrive-scoping.test.ts`](../packages/auth/src/__tests__/hyperdrive-scoping.test.ts),
[`apps/web/src/middleware/rate-limit.test.ts`](../apps/web/src/middleware/rate-limit.test.ts)

A production deploy removed the per-request construction of the database client
and the auth instance, on the reading that it was Hyperdrive-specific
boilerplate. It is not Hyperdrive-specific. A Worker isolate shares module scope
across every request it serves, and a socket-backed client cached there outlives
the request that made it.

On a single-tenant app that is a connection bug. On a multi-tenant PHI database it
is a tenant-isolation bug, and the audit trail would faithfully record the wrong
actor.

The obvious fix, switching to `drizzle-orm/neon-http`, which has no sockets and
therefore no problem, was rejected because it has no interactive transactions,
and the codebase leans on `transaction()` at roughly 75 call sites including the
audit hooks. The constraint that looked removable was load-bearing.

Three regression tests now hold it in place, which is the difference between a
decision and a document.

## 5. `drizzle-kit migrate` swallowing the Postgres error

**Fix:** [`scripts/reset-local-db.mjs`](../scripts/reset-local-db.mjs)

When a migration statement failed, drizzle-kit reported that migration failed and
discarded the underlying Postgres error. The developer was left with a database in
an unknown partial state and no indication of which file or which statement did
it. Diagnosing it meant bisecting migrations by hand.

The replacement applies the SQL directly and names the file that failed. It is the
documented path in the root README precisely because the tool-provided one wasted
enough hours to be worth routing around.

## 6. `wrangler dev` rewriting the inbound Origin, and better-auth rejecting it

**Fix:** [`scripts/dev-local.sh`](../scripts/dev-local.sh)

The production `wrangler.jsonc` declares a custom-domain route. Under `wrangler
dev`, that declaration makes wrangler rewrite the inbound `Origin` header to
`http://my.phiguard.app`. better-auth's trusted-origin list contains only the
`https://` form, so every authenticated local request failed CSRF validation, on
a config file nobody had touched, for a reason nothing logged.

`dev-local.sh` generates a routeless copy of the config before starting the real
`workerd` runtime. Running the actual runtime rather than `vite dev` is the point:
this class of bug is invisible under a dev server that does not reproduce the
edge.

## 7. A guardrail the codebase breaks, written down rather than quietly fixed

**Offender:** [`apps/web/src/components/crm-feedback-widget.tsx`](../apps/web/src/components/crm-feedback-widget.tsx)

`CLAUDE.md` states categorically that no third-party JavaScript may run on a route
behind auth. The CRM feedback widget injects a vendor loader script into every
`/app/*` route when `VITE_CRM_WIDGET_KEY` is set.

The mitigations are real: it is environment-gated, it passes no user data, and the
CSP allowlists exactly one origin for it. The rule is still categorical and this
still breaks it.

It is listed here and in [SECURITY.md](./SECURITY.md), for the same reason the
screenshot failure is: found by a review of this snapshot rather than during
development. Writing the rules down where a reviewer can check them against
the code is what surfaced it. That is an argument for the practice, not
against it.

---

## The pattern across all seven

Five of these seven were invisible to a green test suite, and four were found by
someone reading the repository against its own stated rules rather than by running
it. The suites that caught things were the static-contract ones, the suites that
read source files off disk and assert structural properties, not the runtime
tests.

That is the transferable claim in this repository, and it is the one thing here
worth more than the code: **write the invariant down somewhere executable, in a
form that scans the tree rather than exercising it.** A runtime test proves the
code does what the test says. A contract test proves the code is still shaped the
way you believed it was, which is the assumption that actually rots.
