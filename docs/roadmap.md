# PHIGuard - Build Roadmap

> Current production hosting is the selected application runtime only: `phiguard-app` for `my.phiguard.app` and `phiguard-marketing` for `phiguard.app` plus `www.phiguard.app`. Historical legacy cloud provider/Fargate and CloudFront/object storage assumptions are non-authoritative and should not be used for new operational work.

## Product

PHIGuard is a HIPAA-native task management + compliance platform for small medical clinics (3-50 staff). Positioned as the anti-Asana/Monday alternative: per-clinic flat pricing, BAA-backed onboarding, audit-ready from day one.

Validation cleared (>10% email conversion + discovery calls). This is the full product build.

## Pricing

Public pricing, plan names, billing cadence defaults, promotions, trial length, and money-back guarantee copy use the centralized billing catalog in `packages/billing/src/plans.ts`, with generated `apps/marketing/public/pricing.txt` and the pricing page as public outputs.

## MVP Slice

Tasks + compliance checklists bundled. Ships together - operational wedge + visible compliance on day one.

## Non-goals for v1

- SSO / SCIM / SIEM export
- Multi-site governance (Phase 3)
- Native mobile apps (responsive web only)

---

## Phase 0 - Foundations ✅ COMPLETE

Sequential setup that gates all downstream work.

**What shipped:**

- pnpm + Turbo monorepo with all app and package scaffolds
- CLAUDE.md with HIPAA guardrails + `.claude/` agent config (hipaa-reviewer, schema-migration-reviewer, infrastructure tooling-reviewer)
- `packages/db` - Drizzle + Postgres, users/organizations/memberships schema, first migration
- `packages/auth` - better-auth 1.6.x, Drizzle adapter, RBAC helpers (owner/admin/staff)
- `apps/web` - TanStack Start v1.167+, auth-gated `/app`, login/signup wired to better-auth, dashboard, task, audit, compliance, billing, SOC 2, partner, and settings surfaces
- `apps/marketing` - Astro 5 public site with homepage, pricing, trust/legal pages, resources, comparisons, and programmatic SEO collections
- Docker Compose (Postgres 16 + Mailpit), `.env.example`, README quickstart
- Local release checks (`pnpm lint`, `pnpm typecheck`, `pnpm test`) before wrangler deploys
- ADRs (stack choices, HIPAA architecture), safeguards map, vendor BAA table, incident response runbook

**Exit criteria met:**

- `docker compose up -d && pnpm dev` runs the full stack locally
- `pnpm turbo typecheck lint` is green
- 31 unit tests passing (9 db schema, 22 auth RBAC)

---

## Phase 1 - MVP Build

All 5 workstreams run in parallel in separate git worktrees after Phase 0.

> **DB coordination note:** Workstreams A, B, C all touch `packages/db`. Land shared schema migrations via a short "schema broker" session each morning before parallel work begins, or coordinate PR order explicitly.

### Workstream A - Core tasks domain

**Scope:**

- `packages/db`: `workspaces`, `tasks`, `task_attachments`, `task_assignments`, `task_comments` tables - all with `tenant_id` + audit hooks
- `apps/web` routes: `/app/tasks` (list + filters), `/app/tasks/new`, `/app/tasks/$id` (detail, comments, attachments, history)
- Worker-owned direct uploads to object storage, provider-managed encryption, and signed malware scan callbacks
- All writes go through `packages/audit` hooks
- TDD: domain logic in `packages/db/src/tasks/*.test.ts`

**Exit criteria:** Playwright e2e - create task, upload attachment, assign, complete, see audit trail entry.

---

### Workstream B - Audit log + immutability

**Scope:**

- `packages/audit`: append-only `audit_events` table (tenant_id, actor_id, action, resource_type, resource_id, before/after JSONB, ip, ua, ts)
- Postgres row-level trigger blocking UPDATE/DELETE on `audit_events`
- Audit export evidence stored in object storage with retention handled through documented operational controls per HIPAA §164.316
- Audit viewer UI at `/app/audit` (filter by user/resource/date, CSV export)
- TDD: every write path has a test asserting an audit event was written

**Exit criteria:** Unit test asserts `audit_events` row exists for every mutation path. Manual `UPDATE`/`DELETE` attempt fails with trigger error.

---

### Workstream C - Compliance checklists + incidents

**Scope:**

- `packages/compliance`: `checklist_templates`, `checklists`, `checklist_items`, `policies`, `incidents` tables
- Seed data: starter HIPAA checklists (access review, risk assessment cadence, BAA inventory, workforce training log) - content cross-referenced against HHS §164.308, no fabricated citations
- Routes: `/app/compliance` (dashboard), `/app/compliance/checklists/$id`, `/app/compliance/incidents`, `/app/compliance/policies`
- Incident intake: PHI-safe structured fields (no free-text that invites PHI), warning copy
- TDD: checklist completion math, incident state machine

**Exit criteria:** Playwright e2e - complete a checklist, file an incident, view both in audit log.

---

### Workstream D - Marketing site

**Scope:**

- Full `apps/marketing` build replacing the Phase 0 shell
- Pages: `/`, `/pricing`, `/security`, `/hipaa`, `/compare`, `/trust`, legal pages, resource hubs, and generated content routes
- Content collections: alternatives, comparisons, learn guides, `resources/best`, resources, and practice-type pages. Legacy `pricing-breakdowns` and `listicles` URLs redirect into the current learn/resources structure.
- **Critical**: real Privacy Policy, Terms of Service, and BAA pages (downloadable PDFs) - the validation site had broken links flagged by research
- PostHog analytics wired for marketing and authenticated product analytics enabled through the same-origin PHI-safe proxy, explicit event allowlist, route normalization, and scalar property sanitizer.
- All copy: `stop-slop` → `humanizer` workflow
- Use `marketing-skills:seo-audit`, `marketing-skills:schema-markup`, `marketing-skills:site-architecture`

**Exit criteria:** Lighthouse ≥95 on `/`, `/pricing`, `/security`. All legal links resolve to real pages.

---

### Workstream E - Production infrastructure

**Scope:**

- the selected application runtime for app/API and marketing hosting, object storage buckets for attachment/audit/evidence objects, database connection layer/runtime database configuration for managed PostgreSQL, and deployment tooling scripts for deployment
- Secrets managed as Worker secrets or provider-side credentials; no hardcoded production secrets
- wrangler deploy scripts for the selected application runtime and object storage assets
- `apps/marketing` deployed to the application runtime `phiguard-marketing`
- Maintain current infrastructure/vendor BAA evidence in `docs/hipaa/vendors.md`

**Exit criteria:** hosting provider app deployed with deployment tooling scripts. `my.phiguard.app` serves over TLS. Production database restore path tested once.

---

### Phase 1 exit criteria

An invited user at a clinic can: create a workspace → create tasks → upload an attachment → complete a compliance checklist → log an incident → see every action in the audit log. App runs on the application runtime `phiguard-app` at `my.phiguard.app` with signed BAA. Marketing site live at `phiguard.app` with real legal pages.

---

## Phase 2 - Trust, Billing, Launch Readiness

3 workstreams run in parallel after Phase 1.

### Workstream F - Billing + BAA signing flow

- Stripe integration (BAA document in vendors.md; no PHI to Stripe - org metadata only)
- Per-clinic flat pricing with the current public limited offer applied from the centralized billing catalog
- Native BAA and Terms acceptance during onboarding; paid plan cannot activate without current legal acceptance
- Billing portal, invoice history, dunning (failed payment recovery)

---

### Workstream G - Observability + hardening

- Sentry SDK in `apps/web` (`beforeSend` scrubs PHI from payloads; see `sentry:sentry-sdk-setup`)
- Structured logging via pino with PHI-stripping serializer
- Sentry/application monitoring, production smoke checks, hosting provider/object storage/database-provider evidence, and failed-login spike review
- Rate limiting at WAF + app layer
- CSP, HSTS, security headers
- Pen test prep: threat model doc, `npm audit` / `osv-scanner` in CI

---

### Workstream H - HIPAA program artifacts

- `docs/hipaa/safeguards-map.md` fully populated (all §164.308/310/312 rows)
- Risk analysis template (SP 800-66 Rev 2 aligned)
- Incident response runbook with breach notification decision tree
- Access review process doc + encryption key rotation runbook
- `docs/hipaa/baa-template.md` - customer-facing BAA aligned to HHS sample provisions

---

### Phase 2 exit criteria

A prospect can: sign up → sign BAA → pay → onboard - without human intervention. First incident response drill completes in <1 hour. Sentry/application alerts fire correctly on test events (without PHI in payloads).

Evidence index: `docs/hipaa/phase-2-evidence.md`

---

## Phase 3 - Expansion Tracks

Several Phase 3 expansion tracks are already implemented in the repository. Current status is reconciled in `docs/roadmap-verification.md`; this section preserves the original expansion categories and should not be read as future-only work.

- **Multi-location governance** - Group tier features, location settings, and cross-site reporting
- **Integrations** - Google Workspace and Microsoft 365 OAuth, calendar connection management, and sync records
- **Compliance program add-on** - policies, training logs, risk assessment tracker, and vendor/BAA inventory
- **SSO** - implemented settings and server paths; future work is operational hardening and customer-specific provider setup
- **SOC 2 Type I prep** - controls, evidence collection, access reviews, auditor role, and evidence bundles
- **Partner channel tooling** - referral tracking for MSPs and compliance consultants

---

## Parallelization map

```
Phase 0 ✅ (sequential)
    │
    ├── Phase 1
    │     ├── A: Tasks              ─┐
    │     ├── B: Audit log           │  5 parallel worktrees
    │     ├── C: Compliance          │
    │     ├── D: Marketing           │
    │     └── E: Production infra   ─┘
    │
    └── Phase 2
          ├── F: Billing + BAA      ─┐
          ├── G: Observability       │  3 parallel worktrees
          └── H: HIPAA artifacts    ─┘
```
