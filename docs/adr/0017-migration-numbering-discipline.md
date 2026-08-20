# ADR 0017: Drizzle Migration Numbering Discipline

**Status**: Accepted
**Date**: 2026-04-18

## Context

The `packages/db/drizzle/` directory contains 27 SQL migration files, but the `meta/_journal.json` tracking file only listed 19 entries (idx 0-18). Seven files created after the initial scaffolding were never registered in the journal. Additionally, several files share the same numeric prefix due to simultaneous development across multiple feature branches:

- `0003_tasks.sql`, `0003b_task_assignments_tenant_id.sql`, `0003c_timestamps_tz.sql`
- `0008_compliance_program.sql`, `0008_integration_connections.sql`, `0008_partners.sql`, `0008_sso_and_scim.sql`
- `0016_location_grants_tenant_id.sql`, `0016_nurture_and_subscriptions.sql`

The Drizzle journal `idx` field is the authoritative ordering mechanism - not the filename prefix. The colliding filenames are confusing but non-destructive as long as all files are registered in the journal with unique, sequential `idx` values.

## Decision

1. **Journal is the source of truth.** All migration files must be registered in `meta/_journal.json` with a unique `idx` before they can be applied. The `idx` sequence must be monotonically increasing with no gaps.

2. **Filename prefix = next available `idx`.** New migrations must be created with `drizzle-kit generate` or manually using the next sequential number. The number must not be reused even if two branches create migrations simultaneously; the second branch must rebase and renumber.

3. **No manual filename collisions.** The `0003b` / `0003c` / four-`0008` pattern is a historical artifact and must not be repeated. If two branches both need new migrations and conflict on the number, one branch rebases and takes the higher number.

4. **Missing registrations corrected.** As part of this ADR, all seven previously unregistered files (idx 19-25, tags `0014_organization_invitation_id_default` through `0019_referrals_unique_partner_org`) have been added to `_journal.json` in filesystem lexicographic order within each numeric group.

5. **Going forward**, use `drizzle-kit generate --name=<description>` which auto-assigns the next idx. Never handwrite a new entry in `_journal.json` without also having the corresponding `.sql` file.

## Consequences

- `drizzle-kit migrate` will now correctly detect and apply the seven previously invisible migrations on databases that have not yet run them.
- Databases that already applied those migrations manually (via psql) will see the migrations appear as "already applied" once the journal checksums are verified.
- Development environments must run `pnpm --filter @phiguard/db migrate` to pick up the newly registered migrations.
