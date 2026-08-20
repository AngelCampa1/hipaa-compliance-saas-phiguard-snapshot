# PHIGuard LinkedIn Manual Package

This folder is the working package for the subagent-driven rebuild.

Artifacts expected at completion:

- `day-01.md` through `day-21.md`: one manually written daily batch, 15 posts each.
- `phiguard-linkedin-2026-05-06-to-2026-05-26.md`: final reviewable package grouped by day.
- `phiguard-linkedin-2026-05-06-to-2026-05-26.csv`: final operational CSV.
- `review-log.md`: strategy/factual and humanizer review notes.

This folder does not auto-schedule anything. To schedule the approved CSV through
Postiz, use the guarded repository script:

```bash
pnpm postiz:linkedin:schedule
```

That command is a dry run. Live scheduling uses the authenticated Postiz CLI
and requires `--execute`:

```bash
pnpm postiz:linkedin:schedule -- --execute
```

If you have already scheduled some rows and want the script to reconcile exact
matches from Postiz before continuing, add `--sync-existing`:

```bash
pnpm postiz:linkedin:schedule -- --sync-existing --status
pnpm postiz:linkedin:schedule -- --sync-existing --execute
```

The scheduler writes resumable progress to
`postiz-linkedin-schedule-state.json`. Check progress with:

```bash
pnpm postiz:linkedin:schedule -- --status
```

The script targets the PHIGuard LinkedIn Page integration
`cmorqw6rt041hqi0yh876hjku` and uses Postiz's `linkedin-page` provider type.
