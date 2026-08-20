# portfolio/

Retrospective documentation for PHIGuard, a HIPAA-native compliance platform for
small medical clinics that was built, shipped, and shut down. It is written for
someone deciding whether to trust the claims in the root README: an engineer,
a reviewer, a future employer, not for the author who built the thing.

These pages are written **after** the fact and **for a reader**. Every claim is
meant to be checkable against the tree. If a statement here cannot be traced to
a file, it is a bug in the document.

The working documents (plans, audit runs, sprint notes, runbooks, session
handoffs) are in [`../docs/`](../docs/) and stay there. They were written to
myself while building, are dated and open-ended, and are not part of this set.

## The pages

| | | |
| --- | ---: | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 260 lines | System overview, product request path, data model, package graph, deploy topology |
| [DECISIONS.md](./DECISIONS.md) | 169 lines | The eight ADRs, which survived production, and the five decisions that were never written down |
| [ENGINEERING-LOG.md](./ENGINEERING-LOG.md) | 224 lines | Seven defects with root cause and the file carrying the fix |
| [SECURITY.md](./SECURITY.md) | 279 lines | PHI boundary, audit immutability, access control, key handling, and where each safeguard's guarantee stops |
| [TESTING.md](./TESTING.md) | 181 lines | The three kinds of test here, both coverage numbers, and where each is blind |
| [METRICS.md](./METRICS.md) | 110 lines | Every figure in the README with the classification that produced it |
| [SCREENSHOTS.md](./SCREENSHOTS.md) | 330 lines | The capture archive: small, and honest about why |

## The machine-readable files

Three of these pages are generated, not typed, so they cannot drift from the
repository they describe. The scripts that write them all live in `scripts/`
at the repo root.

| File | Length | Written by, regenerated with |
| --- | ---: | --- |
| [metrics.json](./metrics.json) | 430 lines | `portfolio-metrics.mjs`, `pnpm portfolio:metrics` |
| [provenance.json](./provenance.json) | 16 lines | `portfolio-metrics.mjs --record-provenance`, one-time from git |
| [coverage.json](./coverage.json) | 471 lines | `run-coverage.mjs`, `pnpm test:coverage` |
| [screenshots/*/manifest.json](./screenshots/) | see file | the two capture runs, see SCREENSHOTS.md |

```bash
pnpm portfolio:metrics:check       # fails if the README drifted from the tree
pnpm portfolio:screenshots:check   # fails if SCREENSHOTS.md drifted from the manifests
```

`provenance.json` exists because the published repository is a single squashed
commit and cannot recount its own history. It records 876 commits between
2026-04-14 and 2026-08-11, read out of git at export time rather than
reconstructed afterwards.

## If you are only going to read one

[ENGINEERING-LOG.md](./ENGINEERING-LOG.md). It contains the failure that a
skeptical reader would otherwise have to find on their own: an entire screenshot
archive that was wrong for four months while every assertion covering it stayed
green.
