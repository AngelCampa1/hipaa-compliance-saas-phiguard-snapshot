# Decisions, and what became of them

The eight records in [`docs/adr/`](../docs/adr/) were written while the product was
being built. This page is written after it was shut down, and its job is the one
the ADRs cannot do for themselves: say which decisions survived contact with
production and which did not.

Read the ADRs for the reasoning. Read this for the outcome.

The numbering is sparse: 0001, 0002, 0009, 0010, 0011, 0016, 0017, 0018. The gaps
are decisions that were made without being written down. That is a real gap and
not a filing accident.

---

## The short version

| ADR | Decision | Held up? |
| --- | --- | --- |
| [0001](../docs/adr/0001-stack-choice.md) | Cloudflare Workers + Postgres + better-auth | Yes |
| [0002](../docs/adr/0002-hipaa-architecture.md) | HIPAA safeguards: KMS, append-only audit, `.phi.ts` | Application half yes, AWS half no |
| [0009](../docs/adr/0009-partner-portal-privacy.md) | Partners see no clinic names and no exact revenue | Yes |
| [0010](../docs/adr/0010-alb-waf-provisioning.md) | Provision ALB/WAF through one Terraform module | Obsolete: the ALB is gone |
| [0011](../docs/adr/0011-ecs-task-def-lifecycle-ignore.md) | Terraform provisions ECS, the pipeline owns revisions | Obsolete: ECS is gone |
| [0016](../docs/adr/0016-marketing-email-architecture.md) | Build the nurture sequencer in-house | Schema yes, runner no |
| [0017](../docs/adr/0017-migration-numbering-discipline.md) | The journal, not the filename, is migration order | Yes |
| [0018](../docs/adr/0018-hyperdrive-request-scoped-db.md) | Per-request DB construction on Workers | Yes, and it is the one to read |

---

## 0018: per-request database scoping

**Read this one first.** It is the only ADR here written in the aftermath of a
production incident, and it is the most useful thing in the set.

A Worker isolate serves many requests and shares module scope across all of them.
A database client cached at module scope therefore outlives the request that made
it. A production deploy removed the per-request construction on the reasonable-
sounding theory that it was Hyperdrive boilerplate. It was not. It is a
consequence of Workers plus TCP: a socket-backed client cannot legally cross a
request boundary, and on a multi-tenant PHI database the failure mode is not a
dropped connection but one tenant's context leaking into another's query.

The ADR also refuses the obvious escape hatch. `drizzle-orm/neon-http` would make
the problem disappear by removing sockets, and it was rejected because it has no
interactive transactions, and this codebase leans on `transaction()` at roughly
75 call sites, including the audit hooks that make the HIPAA claims true.

What makes it credible is that the fix is pinned down by tests rather than by the
document:

- [`packages/db/src/client.test.ts`](../packages/db/src/client.test.ts)
- [`packages/auth/src/__tests__/hyperdrive-scoping.test.ts`](../packages/auth/src/__tests__/hyperdrive-scoping.test.ts)
- [`apps/web/src/middleware/rate-limit.test.ts`](../apps/web/src/middleware/rate-limit.test.ts)

The same request scope carries the acting user, which is why `auditedWrite()` can
attribute a write without threading an actor parameter through every call site.

## 0017: migration numbering

Unglamorous and worth reading anyway, because it is a plain record of a
coordination failure rather than a design.

Concurrent branches kept minting the same Drizzle migration number. The state that
prompted the ADR was 27 migration files against 19 registered journal entries,
with colliding prefixes (`0003b`, `0003c`, more than one `0008`). The resolution
is that [`packages/db/drizzle/meta/_journal.json`](../packages/db/drizzle/meta/_journal.json)
is the source of truth for order via its `idx` field, filenames are decoration,
and an index is never reused even when two branches collide.

It holds in the final tree: 62 `.sql` files, 62 journal entries, no gaps.

```bash
ls packages/db/drizzle/*.sql | wc -l
node -e "console.log(require('./packages/db/drizzle/meta/_journal.json').entries.length)"
```

The reason it is the most useful record in the set is exactly that it was written
after the mistake. Nobody writes this one in advance.

## 0002: the HIPAA architecture, half of which is fiction now

This is the record that most needs its outcome stated, because a reader could
otherwise take it as a description of what shipped.

It carries its own historical banner. The AWS half (2-AZ VPC, per-environment
KMS, nightly audit export to S3 under Object Lock compliance mode) was superseded
by Cloudflare Workers in May 2026. `infra/terraform/modules/alb` does not exist in
this tree. Seven of the twelve Terraform module sources it references are absent.

The application half is not fiction and is still load-bearing:

- `.phi.ts` as a filename convention. 18 of 48 schema modules carry it, so "which
  tables can hold PHI?" is `git ls-files | grep '\.phi\.ts$'` rather than a code
  review.
- `audit_events` append-only behind a Postgres trigger.
- `logger.safe()` stripping known-PHI fields before anything reaches a log sink.
- No third-party JavaScript behind auth. [SECURITY.md](./SECURITY.md) records
  the one place the codebase violates this rule, written down rather than
  quietly fixed.

The split matters: the safeguards that survived are the ones encoded in the
codebase, and the ones that evaporated are the ones that lived only in
infrastructure. That is not a coincidence and it is the most transferable lesson
in this repository.

## 0010 and 0011: the AWS era

Both are correct records of infrastructure that no longer existed by the end.

0010 settles where the ALB/WAF association is provisioned so that two Terraform
paths stop fighting over it. 0011 sets `ignore_changes = [task_definition,
desired_count]` on the ECS service so `terraform apply` stops rolling back
whatever the deploy pipeline last shipped, a genuinely common Terraform-versus-CD
ownership problem, well diagnosed.

They are kept because deleting them would make the ADR set look tidier than the
project was. Deployment at the end was Wrangler, not ECS.

## 0016: the nurture sequencer

Decision: build the drip sequencer in-house on the database (`nurture_sequences`,
`nurture_steps`, `nurture_enrollments`, `nurture_sends`, `email_subscriptions`)
rather than pay a third-party tool that would also need a BAA and would put
marketing contact data outside the audit boundary.

The reasoning stands. The runner does not: EventBridge plus ECS Fargate went away
with the rest of the AWS path. The schema survived.

## 0009: partner portal privacy

Partners referring clinics see a referral count, a status, and lifetime value
rounded to the nearest $100. Clinic names are replaced with sequential
identifiers ordered by signup.

The threat is specific rather than generic: an MSP partner often serves the
competitors of the clinic it referred, and exact name plus exact revenue is
competitive intelligence about a third party who never agreed to share it. This
is not a HIPAA requirement. It was a decision to treat a customer's business data
with the same instinct as their patient data, and it is the one product decision
here that had a cost: the partner dashboard is measurably less useful for it.

## 0001: stack choice

Cloudflare for the deployment surface, PostgreSQL as the system of record,
better-auth for identity. Chosen so that Postgres could keep the relational audit
model rather than bending it into a document store.

It held for the life of the project, which for a stack choice is the only
interesting thing that can be said about it.

---

## Decisions made without a paper trail

Five things that shaped the codebase and never got an ADR:

- The five-role RBAC model.
- The decision to render compliance documents as React-PDF templates sharing
  design tokens with the web app, rather than generating HTML and printing it.
- `@phiguard/knowledge` as a single typed source of product facts, with a drift
  checker in `pnpm test`.
- The same-origin analytics proxy that lets the marketing site run PostHog while
  the product plane cannot.
- The bespoke design-system linter wired in as a build gate.

Each of those is a decision with a real alternative that was rejected, and each is
reconstructable now only by reading the code. That is the actual cost of sparse
ADR numbering, stated plainly.
