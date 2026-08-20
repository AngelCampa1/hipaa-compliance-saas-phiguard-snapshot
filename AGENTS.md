# Repository Guidelines

## Before Starting Work

Run `git pull` before beginning any task. This repository is developed across multiple computers and your local copy may be behind.

## LinkedIn/Postiz Review Gate

Before creating, uploading, or scheduling LinkedIn posts through Postiz, run `node scripts/linkedin-post-review-gate.mjs docs/marketing` or `node scripts/schedule-postiz-linkedin.mjs` from the repo root. Do not publish posts that contain internal production labels such as "new lead magnet", image suggestions/descriptions without an actual attached image, TODO/TBD placeholders, generic AI phrasing, or claims that were not checked against repo source material.

## Project Structure & Module Organization

`phiguard` is a `pnpm` + Turborepo monorepo. Product code lives in `apps/web` (TanStack Start, Vitest, Playwright) and the public site lives in `apps/marketing` (Astro). Shared domain packages live under `packages/`, especially `db`, `auth`, `audit`, `compliance`, `billing`, `email`, and `ui`. Infrastructure code is in `infra/terraform`, while architecture and operational docs live in `docs/adr`, `docs/hipaa`, and `docs/runbooks`.

Keep tests close to the code they exercise: package tests usually sit beside source as `*.test.ts` or in `src/__tests__/`, and end-to-end tests live in `apps/web/e2e/*.spec.ts`.

## Build, Test, and Development Commands

- `pnpm install`: install workspace dependencies.
- `docker compose up -d`: start local services used by development.
- `pnpm dev`: run the full workspace through Turbo.
- `pnpm build`: build all apps and packages.
- `pnpm lint`: run ESLint across the workspace.
- `pnpm typecheck`: run TypeScript checks across the workspace.
- `pnpm test`: run unit tests across the workspace.
- `pnpm --filter @phiguard/web test:e2e`: run Playwright tests for the app.
- `pnpm --filter @phiguard/db db:generate`: generate Drizzle migrations.

## Coding Style & Naming Conventions

Use TypeScript with 2-space indentation, single quotes, trailing commas, and no semicolons; Prettier is configured in `packages/config/prettier.js`. ESLint rules come from `packages/config/eslint.js`; `console.log` is disallowed, and unused variables must be prefixed with `_` if intentional.

Use PascalCase for React components, camelCase for functions and variables, and kebab-case or framework-default naming for route/content files. Any database schema file that stores or references PHI must use the `*.phi.ts` suffix.

Keep changes DRY. Before introducing a new utility, component, validator, or query path, check whether the repository already has the same behavior in `apps/` or `packages/`. Prefer extending shared code over copy-paste variants.
Keep modules focused and boundaries clean. Avoid mixing UI rendering, validation, persistence, and domain logic in the same file when a clearer split is available.
Reuse shared auth, audit, validation, logging, and DB helpers instead of creating parallel local abstractions. Prefer explicit behavior over hidden side effects.
Use clear, domain-specific names and fail fast on invalid input, especially in auth, billing, webhook, and compliance paths.

## Testing Guidelines

Vitest is the default unit test runner; Playwright covers browser flows in `apps/web`. Follow existing naming: `*.test.ts` for unit logic and `*.spec.ts` for e2e. For regulated packages such as `packages/db`, `packages/auth`, `packages/audit`, and `packages/compliance`, keep a strict red-green-refactor workflow and avoid merging untested logic.

Production E2E sweeps and production migration commands use ignored local env only. Reuse or create `PROD_E2E_EMAIL`, `PROD_E2E_PASSWORD`, `PROD_E2E_ORG`, `PROD_E2E_BASE_URL`, and `DATABASE_URL` in the root `.env.local`; never commit their values.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit style, for example `feat(billing): ...` and `fix(observability): ...`. Keep commit subjects imperative and scoped where useful. PRs should include a short summary, linked issue or workstream, test evidence (`pnpm test`, targeted package tests, or Playwright output), and screenshots when UI or marketing pages change.

## Worktree, Review, and Deploy Rules

Work directly on `master` for small, quick fixes. Use a git worktree under `.worktrees/<branch-name>` for larger feature work, risky refactors, or anything that benefits from isolation.

Before worktree work is merged back to `master`, spin up a review agent against all changes in that worktree. Fix every accepted issue, rerun the relevant checks, merge into `master`, remove the worktree, then deploy the touched production surfaces.

Deploy through Wrangler scripts only. `apps/web` includes both the SaaS UI and API routes, so API changes deploy with `pnpm deploy:web` or `pnpm deploy:api`. Marketing changes deploy with `pnpm deploy:marketing` to the Cloudflare Worker `phiguard-marketing`. Use `pnpm deploy:touched` after a merge or commit to deploy surfaces changed since `HEAD~1`, or pass `-- --since=<ref>` for a specific base. Use `pnpm deploy:all` when shared changes need a full push.

Keep PHIGuard production frontend hosting on Workers only: `phiguard-app` for `my.phiguard.app` and `phiguard-marketing` for `phiguard.app` plus `www.phiguard.app`. Delete allowlisted legacy PHIGuard Pages projects with `pnpm cf:pages:cleanup:phiguard -- --confirm` only after the Worker custom domains are live and smoke-tested. The cleanup script may delete `phiguard-marketing`, `phiguard-site`, and `phiguard`; it must fail closed for any other `phiguard*` Pages project until ownership is verified.

During review, explicitly check for DRY violations, repeated business logic, duplicated validation, and missed opportunities to reuse established patterns. Treat unnecessary duplication as a real review issue.
Also flag weak naming, mixed responsibilities, hidden side effects, inconsistent error handling, and missing regression or edge-case tests.

## Security & Compliance Notes

Never commit real PHI, never log PHI, and do not introduce third-party scripts into authenticated `apps/web` routes. Keep audit data append-only, preserve encryption-related Terraform settings, and flag any new PHI-processing dependency before merging.

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