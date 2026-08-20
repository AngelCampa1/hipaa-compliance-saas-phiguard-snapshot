# PHIGuard LinkedIn Analytics Package

This folder contains the final prepared PHIGuard LinkedIn content package covering 2026-05-27 through 2026-06-14 inclusive.

It includes 285 approved posts, the final scheduler-compatible CSV, the final reviewable Markdown package, analytics evidence, and review notes. Nothing in this package has been scheduled.

## Purpose

Prepare a 19-day PHIGuard LinkedIn run informed by:

- Current repo truth in `apps/marketing/src/content/`, `packages/knowledge/src/`, `packages/billing/src/`, and `packages/brand/src/`.
- The prior manual package at `docs/marketing/linkedin-content/2026-05-phiguard-manual-package/`.
- LinkedIn analytics findings in `analytics/performance-summary.md`.

The final content package must stay honest about PHIGuard's current state: no fake claims, no client or customer proof, no HIPAA-compliant or certified claims, no legal advice, no PHI-like invented details, and no programmatically generated posts.

## Artifact Map

Current artifacts:

- `README.md`: package purpose, date range, artifact map, cadence, validation commands, and scheduling status.
- `editorial-brief.md`: audience, voice, source rules, safety constraints, and analytics-informed direction for this run.
- `strategy.md`: final source-backed and analytics-informed content strategy.
- `review-log.md`: completed review cycles and validation notes.
- `day-review-notes/README.md`: day-level reviewer scope and write boundaries.
- `analytics/performance-summary.md`: performance findings from prior LinkedIn results.
- `analytics/top-posts.csv`: top post performance evidence from the LinkedIn export.
- `analytics/daily-metrics.csv`: daily metrics from the LinkedIn export.
- `day-01.md` through `day-19.md`: manually written and approved daily batches, 15 posts each.
- `phiguard-linkedin-2026-05-27-to-2026-06-14.md`: final reviewable package grouped by day.
- `phiguard-linkedin-2026-05-27-to-2026-06-14.csv`: final operational CSV for later Postiz scheduling.

## Date And Cadence

- Date range: 2026-05-27 through 2026-06-14 inclusive.
- Total days: 19.
- Daily volume: 15 posts per day.
- Total planned posts: 285.
- Time zone column: `suggested_time_cst`.

The CSV schema must remain exactly:

```csv
date,suggested_time_cst,post_number,pillar,source_url_or_repo_path,post_text,cta_type,review_status,notes
```

Suggested daily slots can reuse the prior package style, spread from early morning through evening Central time. Final times should be validated against analytics before drafting or scheduling.

## Later Validation Commands

Use these only after the CSV exists.

Confirm the CSV has the required header and 285 data rows:

```bash
python3 - <<'PY'
import csv
from pathlib import Path

path = Path('docs/marketing/linkedin-content/2026-05-27-to-2026-06-14-phiguard-analytics-package/phiguard-linkedin-2026-05-27-to-2026-06-14.csv')
expected = ['date','suggested_time_cst','post_number','pillar','source_url_or_repo_path','post_text','cta_type','review_status','notes']
rows = list(csv.DictReader(path.open(newline='')))
assert rows, 'CSV has no rows'
assert list(rows[0].keys()) == expected, list(rows[0].keys())
assert len(rows) == 285, len(rows)
print(f'validated {len(rows)} rows')
PY
```

Confirm the date span, 15 posts per day, and valid review statuses:

```bash
python3 - <<'PY'
import csv
from collections import Counter
from pathlib import Path

path = Path('docs/marketing/linkedin-content/2026-05-27-to-2026-06-14-phiguard-analytics-package/phiguard-linkedin-2026-05-27-to-2026-06-14.csv')
rows = list(csv.DictReader(path.open(newline='')))
dates = Counter(row['date'] for row in rows)
assert min(dates) == '2026-05-27', min(dates)
assert max(dates) == '2026-06-14', max(dates)
assert len(dates) == 19, len(dates)
assert set(dates.values()) == {15}, dates
assert {row['review_status'] for row in rows} <= {'approved','needs_review','rejected_rewritten'}
print('validated date coverage, cadence, and review statuses')
PY
```

Run the Postiz scheduler in dry-run/status mode only after final approval:

```bash
pnpm postiz:linkedin:schedule -- --status
pnpm postiz:linkedin:schedule
```

Live scheduling requires explicit approval and the authenticated Postiz CLI:

```bash
pnpm postiz:linkedin:schedule -- --execute
```

## Scheduling Status

Not scheduled. This package currently contains no final CSV and must not be sent to Postiz until all review cycles in `review-log.md` are complete.
