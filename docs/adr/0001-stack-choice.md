# ADR 0001: Stack Choice

**Status:** Accepted

## Decisions

### Hosting

PHIGuard uses Cloudflare as the deployment and runtime surface:

- Worker `phiguard-app` for `apps/web`
- Worker `phiguard-marketing` for `apps/marketing`
- R2 for object storage
- Hyperdrive for production database connectivity

### Database

PostgreSQL remains the system of record. This avoids a premature database rewrite while keeping the runtime aligned with Cloudflare.

### Authentication

better-auth remains the authentication layer with Postgres-backed sessions and encrypted third-party tokens.

## Rationale

- one deployment surface is simpler to operate and document
- repo-managed Wrangler scripts replace separate deployment workflows
- PostgreSQL preserves the existing schema and audit model
