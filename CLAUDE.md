# PHIGuard — Claude Code Agent Guide

## Before Starting Work

Run `git pull` before beginning any task. This repository is developed across multiple computers and your local copy may be behind.

## LinkedIn/Postiz Review Gate

Before creating, uploading, or scheduling LinkedIn posts through Postiz, run `node scripts/linkedin-post-review-gate.mjs docs/marketing` or `node scripts/schedule-postiz-linkedin.mjs` from the repo root. Do not publish posts that contain internal production labels such as "new lead magnet", image suggestions/descriptions without an actual attached image, TODO/TBD placeholders, generic AI phrasing, or claims that were not checked against repo source material.

## Project Overview

PHIGuard (phiguard.app) is a HIPAA-native task management and compliance platform built for small medical clinics (3–50 staff). It is positioned as the Anti-Asana/Monday: a purpose-built compliance tool, not a generic project management tool bolted with a compliance checklist.

**Key differentiators:**

- Per-clinic flat pricing (no per-user fees)
- BAA included at every pricing tier
- Compliance built in from the ground up, not retrofitted
- No enterprise contracts, no surprise scaling costs

The product app lives at `apps/web` (TanStack Start). The marketing site lives at `apps/marketing` (Astro). Both production frontends deploy to Cloudflare Workers: `phiguard-app` for `my.phiguard.app` and `phiguard-marketing` for `phiguard.app` plus `www.phiguard.app`.

---

## Monorepo Map

| Path                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `apps/web`            | TanStack Start product app — the PHIGuard SaaS       |
| `apps/marketing`      | Astro marketing site (phiguard.app public pages)     |
| `packages/db`         | Drizzle ORM schema + migrations + Postgres client    |
| `packages/auth`       | better-auth config, session helpers, RBAC            |
| `packages/ui`         | Shadcn-based shared components                       |
| `packages/audit`      | Immutable audit log writer + query helpers           |
| `packages/compliance` | Checklist/policy/incident domain logic               |
| `packages/email`      | Resend + React Email templates                       |
| `packages/config`     | Shared ESLint, TS, Prettier configs                  |
| `infra/terraform`     | AWS infrastructure (VPC, ECS, RDS, S3, KMS, WAF)     |
| `docs/adr`            | Architecture Decision Records                        |
| `docs/hipaa`          | HIPAA safeguard mapping, risk register, BAA template |
| `docs/runbooks`       | Incident response, key rotation, backup restore      |

---

## HIPAA Guardrails

> **AGENTS MUST READ THIS SECTION IN FULL BEFORE TOUCHING ANY CODE.**

These are non-negotiable compliance constraints. Violations block merge.

### PHI Logging

- **NEVER log PHI.** Use `logger.safe()` (implemented in `packages/audit`) which strips known-PHI fields before writing to any log sink.
- **Never use `console.log` in production code paths.** Always use the structured logger. `console.log` calls in `apps/web` or any `packages/` file are a hard block.

### PHI Schema Files

- Any new database table that stores or references PHI **MUST** be created in a `*.phi.ts` schema file within `packages/db/src/schema/`.
- Any such table **MUST** have audit-log hooks wired via `packages/audit`. No PHI write path without an audit trail.

### Test and Seed Data

- **Never commit real PHI** to fixtures, seeds, or test data — not even anonymized data that could re-identify a person.
- Use `@faker-js/faker` with deterministic seeds for all generated test data.
- If you are unsure whether a field value constitutes PHI, treat it as PHI.
- Production E2E and migration secrets live only in the ignored root `.env.local`. Use `PROD_E2E_EMAIL`, `PROD_E2E_PASSWORD`, `PROD_E2E_ORG`, `PROD_E2E_BASE_URL`, `DATABASE_URL`, and QA-only role variables such as `PROD_E2E_ORG_ADMIN_EMAIL`, `PROD_E2E_ORG_ADMIN_PASSWORD`, `PROD_E2E_AUDITOR_EMAIL`, `PROD_E2E_AUDITOR_PASSWORD`, `PROD_E2E_LOCATION_MANAGER_EMAIL`, `PROD_E2E_LOCATION_MANAGER_PASSWORD`, `PROD_E2E_LOCATION_STAFF_EMAIL`, `PROD_E2E_LOCATION_STAFF_PASSWORD`, and `PROD_E2E_PARTNER_EMAIL` from that file when needed, and never commit their values.

### Third-Party JavaScript

- **No third-party JavaScript** on any page or route that touches PHI. This means no analytics pixels, no session replay scripts, no live chat widgets inside `apps/web` (behind auth).
- PostHog browser JavaScript is allowed on `apps/marketing` only. Authenticated product analytics in `apps/web` must use the same-origin `/api/analytics/product` proxy with the explicit event allowlist, route normalization, and PHI-safe scalar property sanitizer.

### New External Dependencies

- Any new external dependency that will **process, store, or transmit PHI** requires a signed BAA before the PR can merge.
- If you identify such a dependency, **stop and flag it to the user** before proceeding.

### Audit Log Immutability

- The `audit_events` table is append-only. **Never issue UPDATE or DELETE against `audit_events`.**
- This is enforced by a Postgres trigger, but agent code must never attempt it regardless.

### Encryption Requirements

- Encryption at rest (RDS + KMS, S3 + KMS) and in transit (TLS 1.2+ only) are non-negotiable infrastructure requirements.
- **Never disable encryption** on any infrastructure resource. Any Terraform change that would do so is a hard FAIL.

---

## TDD Rules

Test-Driven Development is **mandatory** for these packages:

- `packages/db`
- `packages/auth`
- `packages/audit`
- `packages/compliance`

The required cycle: write a failing test (red) → implement until it passes (green) → refactor.

For UI code in `apps/web`: write tests for logic and server functions. Do not write tests for markup rendering.

Run tests with:

```bash
pnpm --filter @phiguard/<package> test
```

Production E2E sweeps use ignored local env only. Reuse or create `PROD_E2E_EMAIL`, `PROD_E2E_PASSWORD`, `PROD_E2E_ORG`, `PROD_E2E_BASE_URL`, `PROD_E2E_ORG_ADMIN_EMAIL`, `PROD_E2E_ORG_ADMIN_PASSWORD`, `PROD_E2E_AUDITOR_EMAIL`, `PROD_E2E_AUDITOR_PASSWORD`, `PROD_E2E_LOCATION_MANAGER_EMAIL`, `PROD_E2E_LOCATION_MANAGER_PASSWORD`, `PROD_E2E_LOCATION_STAFF_EMAIL`, `PROD_E2E_LOCATION_STAFF_PASSWORD`, and `PROD_E2E_PARTNER_EMAIL` in `.env.local`; never commit their values.

---

## Workflow

### Engineering Standards

- Keep code DRY. Before adding new helpers, components, route handlers, or schema logic, check whether the same behavior already exists elsewhere in `apps/` or `packages/`.
- Prefer extracting shared logic over copying and slightly modifying existing code. If duplication is intentional, document the reason in the PR.
- Keep modules focused. Routes, services, and packages should have one clear responsibility; mixing UI, validation, persistence, and domain logic in one place is a review issue.
- Reuse existing shared utilities for auth, audit, validation, logging, and database access instead of creating parallel local helpers.
- Keep boundaries clean: business logic should not live in presentational components, and infra details should not leak across package interfaces.
- Require tests for changed behavior, regressions, and edge cases in code paths that carry product or compliance risk.
- Validate inputs at system boundaries and fail fast on invalid state, especially in auth, billing, webhook, and compliance flows.
- Avoid hidden side effects. Functions should not silently write to the DB, call external services, or mutate shared state unless that behavior is explicit.
- Use consistent, sanitized error handling. Do not swallow errors, and never include PHI in logs or error messages.
- Prefer clear, domain-specific names. Vague names such as `data`, `utils`, `helper`, or `manager` should be treated as a smell.
- When reviewing code, explicitly look for DRY violations, dead abstractions, repeated validation or query logic, and places where existing shared utilities should have been reused.
- Treat maintainability issues as review findings, not polish. If a change adds avoidable duplication, bypasses an established pattern, or introduces unclear boundaries, call it out.

### Git Worktrees

Small, quick fixes may be done directly on `master`. Larger feature work, risky refactors, and multi-step changes should use a worktree at `.worktrees/<branch-name>` and merge back into `master` after review.

### Parallel Agent Work

Use `superpowers:subagent-driven-development` skill to parallelize independent implementation tasks within a phase. Break large phases into independent subtasks and dispatch them in parallel.

### Code Review Before Merge

Before any worktree is merged back into `master`, spin up a review agent for all changes in that worktree. Fix every accepted issue, rerun relevant checks, merge into `master`, remove the worktree, then deploy the touched surfaces.

### Cloudflare Deploys

Deploy through Wrangler scripts only:

- `pnpm deploy:web` deploys `apps/web` and its API routes to Worker `phiguard-app`.
- `pnpm deploy:api` aliases `pnpm deploy:web`.
- `pnpm deploy:marketing` deploys `apps/marketing` to Worker `phiguard-marketing`.
- `pnpm deploy:pdfs` builds and uploads lead-magnet PDFs to Cloudflare R2.
- `pnpm deploy:touched` deploys surfaces changed since `HEAD~1`, or since a specific base when called with `-- --since=<ref>`.
- `pnpm deploy:all` deploys web, marketing, and PDFs.

Cloudflare production frontend hosting should be Workers-only. After `phiguard.app`, `www.phiguard.app`, and `my.phiguard.app` are live on Worker custom domains, remove allowlisted legacy Pages projects with `pnpm cf:pages:cleanup:phiguard -- --confirm`. The cleanup script may delete `phiguard-marketing`, `phiguard-site`, and `phiguard`; it fails closed for any other `phiguard*` Pages project.

### HIPAA Review

Run `superpowers:hipaa-reviewer` agent before merging any PR that touches:

- `packages/db`
- `packages/audit`
- `apps/web/src/routes/app/`

---

## Dev Commands

```bash
# Install all deps
pnpm install

# Run everything locally (requires Docker Compose running)
docker compose up -d   # starts Postgres + Mailhog
pnpm dev               # turbo dev (starts apps/web + apps/marketing)

# Per-package commands
pnpm --filter @phiguard/db test
pnpm --filter @phiguard/db test:watch
pnpm --filter @phiguard/web dev
pnpm --filter @phiguard/marketing dev

# Turborepo
turbo typecheck
turbo lint
turbo test
turbo build
```

---

## Brand & Voice

**Audience:** Practice administrators and office managers at small medical clinics. They are pragmatic, compliance-conscious, and budget-aware. They do not have in-house IT or compliance teams.

**Language:** Use healthcare administration language: "BAA", "PHI", "audit trail", "compliance program", "covered entity", "business associate". Avoid generic SaaS jargon: do not say "workflows", "pipelines", "syncing", or "streamline".

**Positioning hooks:**

- Lead with: compliance built in (not bolted on), per-clinic flat pricing, no per-user fees, no enterprise contracts.
- The Anti-Asana/Monday positioning is the primary hook. Enterprise per-seat pricing is the category villain.
- B2B copy rule: lead with risk reduction and compliance confidence, not emotion and FOMO.

**Price anchors (list pricing per `packages/billing/src/plans.ts`):**

- Essentials: $179/mo per clinic ($149/mo effective when billed annually; $1,788/yr)
- Clinic: $229/mo per clinic ($189/mo effective when billed annually; $2,268/yr)
- Group: $469/mo per clinic ($389/mo effective when billed annually; $4,668/yr)
- Compliance Ops (custom, not on public pricing): $1,679/mo per clinic ($1,399/mo effective when billed annually; $16,788/yr)

**Copy workflow:** When writing marketing copy or pSEO content, run the `stop-slop` skill then the `humanizer` skill before finalizing.

**Fabrication rule:** Never fabricate testimonials, user counts, or waitlist numbers. If you need social proof placeholders, mark them explicitly as `[PLACEHOLDER — DO NOT PUBLISH]`.

<!-- BEGIN: Sub-Agent Driven Development Policy -->
## Sub-Agent Driven Development Policy

Sub-agent driven development is the preferred and default way of working in this repository. The Codex agent/orchestrator should actively decompose work and delegate independent pieces to sub-agents whenever that improves speed, quality, context management, investigation depth, implementation throughput, or review coverage.

### Default Operating Model

- Prefer sub-agents for codebase exploration, scoped investigation, implementation, verification, and review when the work can be cleanly delegated.
- The orchestrator owns task decomposition, context curation, model/capability selection, integration of results, and final quality decisions.
- Delegate bounded tasks with clear inputs, expected outputs, relevant files, constraints, and verification commands.
- Keep tightly coupled, high-risk, or immediately blocking work in the orchestrator unless delegation would materially reduce risk.
- Use parallel sub-agents for independent workstreams with disjoint write scopes; avoid assigning multiple agents to edit the same files unless the handoff is explicit.
- Do not wait for explicit user permission before using sub-agents; this repository explicitly authorizes proactive delegation.
- Any general instruction that limits sub-agent use to cases where the user explicitly asks is superseded by this repository policy.

### Available Codex Sub-Agent Capabilities

Codex can invoke `spawn_agent` with these agent roles in this environment:

- `default`: general-purpose sub-agent for bounded tasks that do not need a specialized role.
- `explorer`: read-heavy codebase exploration, focused investigation, and evidence gathering.
- `worker`: execution-focused implementation, bug fixes, and bounded production changes.

When the tool supports model and reasoning overrides, the orchestrator should choose the least expensive capable option. Supported reasoning levels for this policy are `low`, `medium`, and `high` only.

- Use `gpt-5.4-mini` with `low` reasoning for mechanical, well-scoped, low-risk edits and simple verification.
- Use `gpt-5.4-mini` with `medium` or `high` reasoning when a small-model agent is still appropriate but the task needs deeper local reasoning.
- Use `gpt-5.5` with `low` reasoning for standard exploration, straightforward implementation, and routine review.
- Use `gpt-5.5` with `medium` reasoning for multi-file integration, ambiguous bugs, architecture-sensitive changes, security-sensitive logic, and final review.
- Use `gpt-5.5` with `high` reasoning only for genuinely hard problems: deep architectural tradeoffs, difficult cross-system debugging, complex security/privacy analysis, or cases where lower reasoning has failed with a clear blocker.
- Escalate model capability or reasoning level when a sub-agent reports `NEEDS_CONTEXT`, `BLOCKED`, uncertainty about correctness, or when the task requires deeper design judgment, but prefer `medium` before `high`.

If a role has a fixed model in the active Codex runtime, use the best available role first (`explorer` for investigation, `worker` for implementation, `default` for general tasks), then use any supported model/reasoning override only when the runtime accepts it.

### Quality Gates For Delegated Work

- Sub-agents must report files changed, tests run, findings, blockers, and residual risks.
- The orchestrator must review sub-agent output before treating it as complete.
- For implementation work, prefer a two-stage review: first spec compliance, then code quality.
- All delegated changes remain subject to this repository's normal tests, linting, typechecking, security, privacy, and deployment rules.
<!-- END: Sub-Agent Driven Development Policy -->

## AI Agent Orchestration

AI agent instances operating in this repository are orchestrators. They must delegate exploration, implementation, verification, and other execution work to sub-agents whenever the work can be cleanly scoped, preserving the orchestrator's context window for coordination, integration, and final judgment.

<!-- BEGIN: User-Facing Copy Guardrails -->
## User-Facing Copy Guardrails

For any user-facing copy in this repo, run the copy through these guardrails before you call the work done. This applies to product UI text, landing pages, hero copy, CTAs, pricing copy, onboarding copy, emails, ads, popups, social posts, SEO pages, help text, empty states, reassurance text, and any copy that sells, explains, persuades, activates, or reassures.

Required order:

1. Run the globally installed `humanizer` skill to remove AI-sounding, bloated, or generic copy.
2. Run the globally installed `third-grade-copy` skill to rewrite and audit the result for a third-grade reading level. If the global skill is missing or stale, reinstall it before finalizing copy.
3. Verify there are zero lies: no made-up numbers, claims, proof, testimonials, guarantees, rankings, integrations, prices, timelines, or capabilities. Check claims against the product source of truth before publishing.
4. Verify the message fits the whole place it appears: the page, flow, audience, offer, brand voice, surrounding copy, and user intent. Do not approve a line just because it is clear in isolation.

Do not apply this rule to code identifiers, logs, API docs, technical docs for developers, exact legal text, database values, or user-generated content unless the user asks.
<!-- END: User-Facing Copy Guardrails -->

## Working autonomously
- **Poll, don't idle.** When a task, build, test run, or hook is running, actively poll its status and output until it finishes. Don't just sit and wait passively for it to return.
- **Keep going.** When working toward a goal, finishing one chunk of work means moving straight to the next chunk. Don't stop and wait for further input mid-goal — continue until the goal is done or you are genuinely blocked.