# Testing

What is tested, what is not, how the numbers were produced, and where the suite
was blind. The last section is the one worth reading.

```bash
pnpm test              # all workspaces
pnpm test:coverage     # v8 coverage per package → portfolio/coverage.json
```

**2,109 test cases across 182 files and 331 suites.** 1,942 unit cases, 167
end-to-end. Test-to-source ratio 0.66 : 1. Every one of those figures comes from
[`scripts/portfolio-metrics.mjs`](../scripts/portfolio-metrics.mjs) counting
`git ls-files` output; `pnpm portfolio:metrics:check` fails if the README drifts
from the tree.

---

## The three kinds of test here

### 1. Domain tests, against a real database

The packages that carry compliance risk (`db`, `auth`, `audit`, `compliance`)
were built test-first, and `CLAUDE.md` makes that mandatory rather than
aspirational.

All of it ran locally. One GitHub Actions workflow exists, and it covers
marketing link-checking and navigation rendering; unit tests, typecheck and
lint ran on the author's machine rather than a hosted runner.

Where a test needs a database it gets a real one.
[`packages/db/src/testing/testcontainers.ts`](../packages/db/src/testing/testcontainers.ts)
starts `postgres:16-alpine`, replays every `.sql` migration in journal order, and
hands back a connection. Not an in-memory shim, not a mock: the triggers, the
foreign keys and the `ON DELETE RESTRICT` behaviour are all exercised as they
exist in production.

This matters most for
[`packages/integration/src/audit-coverage.test.ts`](../packages/integration/src/audit-coverage.test.ts),
which drives 10 mutation paths through the application's own domain functions and
asserts each writes its audit event. 11 event types in all. A mock database
would have made that test meaningless, because what it is really testing is the
append-only trigger and the transaction boundary.

There is no Postgres row-level security in this repository, so tenant
isolation is per-query rather than database-enforced: a new query that
forgets its `where` clause fails no test. [SECURITY.md](./SECURITY.md) has
the full account.

**The skip behaviour is the interesting part.** Container-backed suites skip
themselves when no container runtime is available, which is correct for a laptop
without Docker running and dangerous everywhere else. So the harness throws
instead of skipping when `CI=true`. A CI run cannot pass by quietly skipping the
tests that carry the compliance claims.

`scripts/run-coverage.mjs` applies the same principle to the numbers: a package
whose status is anything other than `ok`, skipped, failed, or measured with a
red suite, contributes **nothing** to the aggregate rather than contributing a
zero or being silently averaged out.

### 2. Static-contract suites

Three suites read source files off disk with `node:fs` and assert structural
properties of the repository itself. Together they carry 1,082 `expect()` calls
across 127 test cases.

| Suite | Size | What it guards |
| --- | --- | --- |
| [`apps/web/src/__tests__/app-static-contracts.test.ts`](../apps/web/src/__tests__/app-static-contracts.test.ts) | 82 cases, 843 assertions | Product-plane invariants |
| [`apps/marketing/src/lib/static-contracts.test.ts`](../apps/marketing/src/lib/static-contracts.test.ts) | 37 cases, 231 assertions | Marketing content and CSP |
| [`packages/knowledge/src/static-contracts.test.ts`](../packages/knowledge/src/static-contracts.test.ts) | 8 cases, 8 assertions | Whole-tree literal scans |

Concrete examples, so this is not an abstraction:

- Every authenticated app route emits a normalized page view, cross-checked
  against the analytics event allowlist (`app-static-contracts:147`).
- Task attachments cannot be downloaded until the malware scan has cleared
  (`:1148`), and the scan callback carries both signature headers (`:1231`).
- The HIPAA safeguards document still cites the five `.phi.ts` schema paths it
  claims to (`:1727`), a documentation-drift guard rather than a naming check.
  The `.phi.ts` convention itself, the naming rule the whole PHI boundary
  rests on, has no test of its own: it is enforced by review agents and
  `CLAUDE.md` policy, not by anything executable. [SECURITY.md](./SECURITY.md)
  has the full account.
- The production app API and Cloudflare analytics are allowed by the marketing
  CSP, and nothing else is (`marketing:187`).
- Draft legal documents are not shipped from public assets (`marketing:226`).
- Public copy does not overstate the product as a recurring task scheduler
  (`marketing:457`).
- The support email literal appears in the knowledge package and nowhere else
  (`knowledge:41`).
- The dissolved corporate identity appears nowhere in published source
  (`knowledge:250`).

The `knowledge` suite has eight assertions and is the most powerful of the three,
because each one aggregates over the entire tree: it enumerates files with
`git ls-files` plus `git ls-files --others --exclude-standard`, checks them all,
and holds an explicit allowlist of files permitted to contain each literal.

These are the suites that actually caught things. See
[ENGINEERING-LOG.md](./ENGINEERING-LOG.md): the defects that survived for months
were structural, and runtime tests are the wrong instrument for structural drift.

### 3. End-to-end

29 Playwright files, 167 cases. The one worth naming is
[`apps/web/e2e/rbac-routes.spec.ts`](../apps/web/e2e/rbac-routes.spec.ts), which
pins four role/route outcomes: an auditor can read the SOC 2 controls-and-evidence
module but is blocked from creating a new task; `location_staff` cannot reach
`/app/settings/locations`; a `location_manager` sees only `location_staff` in
the member-role selector.

That file is as close as this codebase gets to a declarative route→role
specification, which is a criticism of the access-control design as much as a
description of the test. A server function with no permission guard is
silently accessible to every member, and only these four Playwright cases
would notice, and only for the four routes they cover. See
[SECURITY.md](./SECURITY.md).

---

## Coverage

Measured with v8 on 2026-08-11 and written to
[`coverage.json`](./coverage.json).

| Package | Line coverage | | Package | Line coverage |
| --- | ---: | --- | --- | ---: |
| `pdf` | 97.8% | | `integration` | 91.8% |
| `baa` | 96.2% | | `billing` | 91.5% |
| `knowledge` | 95.8% | | `auth` | 82.0% |
| `audit` | 95.7% | | `email` | 82.3% |
| `lead-magnets` | 94.7% | | `marketing-db` | 73.3% |
| `compliance` | 94.0% | | `web` | 36.1% |
| `db` | 92.9% | | `marketing` | 17.5% |
| | | | `ui` | 4.9% |

**Two numbers, both real:**

- **48.9%** across everything measured: 34,313 of 70,226 statements.
- **94.2%** across `packages/*` excluding `ui` (the domain, data, auth, billing
  and compliance layer): 19,425 of 20,626 statements.

The aggregate sums covered and total statements rather than averaging
percentages, so a tiny well-covered package cannot flatter the total.

The gap between the two numbers is `web` (36.1%), `marketing` (17.5%) and `ui`
(4.9%), and it is deliberate. The contributor guide says: *"For UI code in
`apps/web`: write tests for logic and server functions. Do not write tests for
markup rendering."* Server functions, domain logic and data access are tested.
React components rendering markup are not.

Both numbers are here because quoting only the 94.2% is how coverage sections
stop being worth reading, and quoting only the 48.9% would misrepresent where the
risk actually lives.

`brand` and `config` are excluded rather than counted as zeroes: one is a
constants file, the other is shared ESLint and TypeScript presets. Counting them
as 0% would be as dishonest as omitting `ui`.

Coverage was instrumented while preparing this snapshot, not maintained
throughout development. These numbers measure what the tests happened to
cover, not a target anyone was holding a line on while building.

---

## The gap that mattered most

The screenshot capture spec asserted that a file was written, that it was
non-empty, and that the HTTP response was not an error. All three assertions
passed for four months. None of them was the property that mattered, *is this a
picture of the screen it claims to be*, and the archive it produced was 38
mislabelled copies of one onboarding page, including all four images the README
used as its hero.

It is written up as [entry 1 of the engineering log](./ENGINEERING-LOG.md), and it
belongs in this document too, because it is the clearest available demonstration
of the failure mode this whole page is about: **a green suite is evidence that
the assertions you wrote are true, and nothing more.** The interesting question
is never how many tests there are. It is which invariants nobody thought to
write down.
