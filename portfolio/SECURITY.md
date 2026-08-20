# The security model

How PHIGuard kept protected health information inside a boundary, what enforced
each part of it, and where the enforcement was a convention rather than a
mechanism. Everything below cites a file. Where a safeguard rests on discipline
instead of code, it says so.

This is a description of a shut-down product.

---

## 1. The PHI boundary is a filename

Any schema module that defines a table storing or referencing protected health
information is named `*.phi.ts`. There are 18 of them across 48 schema modules.

```bash
git ls-files | grep '\.phi\.ts$'
```

Fourteen live in [`packages/db/src/schema/`](../packages/db/src/schema/):
`users`, `tasks`, `task-comments`, `task-attachments`, `task-assignments`,
`incidents` and so on. The rest sit with the domain that owns them:
[`packages/audit/src/schema/audit-events.phi.ts`](../packages/audit/src/schema/audit-events.phi.ts),
and three in [`packages/compliance/src/schema/`](../packages/compliance/src/schema/).

The point of encoding it in the filename rather than a decorator, a comment or a
registry is that it survives tooling. `git ls-files`, a `find`, a GitHub search
and a code-review diff all show it without needing to parse TypeScript. A new
engineer asking "which tables can hold PHI?" gets an answer in one command
instead of a conversation.

**What enforces it.** Two of the three review agents in
[`.claude/agents/`](../.claude/agents/):

- `hipaa-reviewer.md` treats any field from a `*.phi.ts` schema file as PHI for
  its logging check, and requires that every Drizzle `insert`/`update`/`delete`
  against a table defined in one writes an `audit_events` row in the same
  transaction.
- `schema-migration-reviewer.md` fails a migration that adds a `*.phi.ts` table
  without a matching audit hook in `packages/audit/src/`.

**The honest gap.** *There is no test that asserts the convention.* Nothing
enumerates the schema directory and fails when a PHI-bearing table lands in a
plainly-named file. Enforcement is an agent prompt plus `CLAUDE.md` policy plus
code review. The nearest thing to a guard is
[`apps/web/src/__tests__/app-static-contracts.test.ts:1727`](../apps/web/src/__tests__/app-static-contracts.test.ts),
which asserts the HIPAA safeguards document still cites five specific `.phi.ts`
paths: a documentation-drift check, not a naming check.

That is the weakest link in this section and it is worth saying out loud: the
convention that the whole PHI story rests on is the one thing here without an
executable guard.

## 2. The audit trail, and why it is hard to work around

`audit_events` is append-only at the database, not in the application layer.

[`packages/db/drizzle/0002_audit_events.sql`](../packages/db/drizzle/0002_audit_events.sql)
defines `audit_events_block_mutation()`, which unconditionally raises with
SQLSTATE `45000`, and binds it through three triggers:

| Trigger | Fires on |
| --- | --- |
| `audit_events_no_update` | `BEFORE UPDATE ... FOR EACH ROW` |
| `audit_events_no_delete` | `BEFORE DELETE ... FOR EACH ROW` |
| `audit_events_no_truncate` | `BEFORE TRUNCATE`, statement-level |

`INSERT` is untouched. Every other path is closed, including `TRUNCATE`, which is
the one people reach for when `DELETE` fails.

[`packages/db/drizzle/0017_audit_events_tenant_fk.sql`](../packages/db/drizzle/0017_audit_events_tenant_fk.sql)
adds `audit_events_tenant_id_fkey` referencing `organizations(id)` with
`ON DELETE RESTRICT`. Combined with the triggers, a tenant that has ever been
audited cannot be deleted, because the audit rows pinning it cannot be removed
either.

### The write path refuses to be optional

[`packages/audit/src/helpers.ts:18`](../packages/audit/src/helpers.ts):
`auditedWrite(db, mutationFn, eventFactory)` runs the mutation and the audit
insert inside one `db.transaction`. The comment in the file states the intent
better than a paraphrase would: no mutation without a trail, no trail without a
mutation.

[`packages/audit/src/write.ts:84`](../packages/audit/src/write.ts):
`writeAuditEvent` pulls actor, IP and user agent out of an `AsyncLocalStorage`
context rather than accepting them as parameters, so a caller cannot forget to
pass the actor or pass the wrong one. When the insert fails it **rethrows**; the
comment records why, which is that a missing audit trail is itself a compliance
event and swallowing it would be the worst possible outcome.

Payloads are scrubbed on the way in
([`write.ts:37`](../packages/audit/src/write.ts)): a key pattern covering
password, secret, token, apikey, privatekey, credential, authorization, cookie,
sessionid and jwt, plus regex replacement of email addresses and SSNs.

### The guarantee inconveniences its own author

This is the part worth reading the code for.
[`apps/web/scripts/demo-seed.ts:266`](../apps/web/scripts/demo-seed.ts) counts
audit rows for the demo tenant and refuses to reset the workspace if any exist:

> The demo organization already exists and has *N* audit events, which are
> append-only and pin the tenant row in place. Recreate the database first.

The developer running `seed:demo` a second time is told to drop and recreate the
whole database. That is genuinely annoying, and it is the strongest evidence in
the repository that the immutability claim is real. A guarantee that only ever
inconveniences an attacker is a guarantee nobody has tested.

### Coverage is a test, not a paragraph

[`packages/integration/src/audit-coverage.test.ts`](../packages/integration/src/audit-coverage.test.ts)
starts a real `postgres:16-alpine` through testcontainers, replays every `.sql`
migration in order, and drives 10 mutation paths through the application's own
domain functions, `createTask`, `updateTaskStatus`, `assignTask`, `addComment`,
`createAttachment`, `completeItem`, `reopenItem`, `createIncident`,
`transitionIncident`, `acceptLegalDocuments`, asserting each writes its event.

Eleven event types, because accepting legal documents records `terms.accepted`
and `baa.accepted` separately. The incident transition additionally asserts the
before/after diff content, not just the event's existence.

The container harness is at
[`packages/db/src/testing/testcontainers.ts`](../packages/db/src/testing/testcontainers.ts).
It skips the suite when no container runtime is present, except under `CI=true`,
where it throws instead, so a CI run cannot silently pass by skipping the tests
that matter most.

**What this guarantee covers today.** The nightly export to S3 under Object
Lock compliance mode described in [ADR 0002](../docs/adr/0002-hipaa-architecture.md)
went away with the AWS infrastructure it depended on. What remains is the
database-level guarantee above: real, and scoped to this database, with no
offsite immutable copy behind it.

## 3. The PHI-redacting logger

[`packages/audit/src/logger.ts`](../packages/audit/src/logger.ts) wraps pino.
`logger.safe` is a getter that returns the logger itself, an alias whose only
purpose is to make PHI-safety visible at the call site during review. Redaction
is not opt-in: every log method goes through the same wrapper, so `logger.info`
is exactly as redacted as `logger.safe.info`.

Three layers:

1. A set of 31 PHI field names covering the HIPAA-18 identifiers. `name` is
   deliberately excluded as too broad, and the file says so rather than leaving
   the omission to be discovered.
2. A pattern matching `phi` and `patient` as word or case segments, written to
   skip mid-word matches so `sophistication` does not get redacted.
3. String-level scrubbing of emails and SSNs anywhere in a value.

`Error.message` and `.stack` are replaced wholesale, because a stack trace can
carry a PHI-bearing argument. Traversal is non-mutating, converts `Date` to ISO
strings, and guards cycles with a `WeakSet`.

## 4. Access control

Five roles, defined once at
[`packages/auth/src/permissions.ts:1`](../packages/auth/src/permissions.ts):

```ts
export type Role = 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor'
```

The design detail worth stealing: `ROLE_HIERARCHY` is typed
`Record<Exclude<Role, 'auditor'>, number>`. Four roles sit on a numeric ladder
(owner 4, admin 3, manager 2, staff 1). `auditor` is deliberately not on it.

`hasRole()` short-circuits both directions: a requirement of `auditor` demands
exact equality, and a user who *is* an auditor fails every non-auditor
requirement. The auditor role is lateral and read-only, not a seniority
level, and the type system is what stops someone from writing
`role >= 'auditor'` and quietly granting them write access.

There are two enforcement layers:

- A capability matrix wired into better-auth at
  [`packages/auth/src/auth.ts:94`](../packages/auth/src/auth.ts). `auditor` is
  granted exactly `ac: ['read']` and nothing else.
- Predicate functions (`isOwner`, `canManageMembers`, `canAccessSoc2`,
  `canWriteLocations`, …) called inside server functions.

**Routes map to roles by calling predicates, not by a declarative table.** That
is a real weakness: the guard is a line inside each server function, and a new
route with no guard is silently public to every member. The closest thing to a
route→role specification is behavioural rather than structural.
[`apps/web/e2e/rbac-routes.spec.ts`](../apps/web/e2e/rbac-routes.spec.ts) pins
four role/route outcomes in Playwright.

### Tenant isolation

There is **no Postgres row-level security in this repository.** Isolation is
enforced in the application, in three places that all have to hold:

1. **Schema.** `tenantIdCol()` in
   [`packages/db/src/schema/_conventions.ts:11`](../packages/db/src/schema/_conventions.ts)
   gives every tenant-scoped table a non-null `tenant_id` referencing
   `organizations(id)` with `ON DELETE CASCADE`.
2. **Scope resolution.** `resolveOrganizationAccess()` in
   [`packages/db/src/organizations.ts:91`](../packages/db/src/organizations.ts)
   builds a scope: `org_owner`, `org_admin` and `auditor` get organization-wide
   access; everyone else gets an explicit `locationIds` list derived from a
   `location_grants` join filtered on *both* the grant's tenant and the
   location's organization. `getWriteLocationId()` throws
   `Location not found or access denied` for an out-of-scope id.
3. **Every query.** Each read and write carries its own `eq(x.tenantId, …)`.
   R2 object keys are tenant-prefixed too. Attachment keys must match
   `attachments/${tenantId}/${taskId}/`, asserted in both
   [`packages/db/src/tasks/index.ts:62`](../packages/db/src/tasks/index.ts) and
   the server layer.

Application-enforced isolation with no RLS backstop means a single forgotten
`where` clause is a cross-tenant read. Layer 3 is load-bearing and has no
mechanical guarantee behind it. RLS would have been the right answer and was
never implemented.

## 5. Key handling

OAuth and account tokens are encrypted at rest with **AES-256-GCM through
WebCrypto**, a fresh 96-bit random IV per value, in
[`packages/integration/src/token-crypto.ts`](../packages/integration/src/token-crypto.ts).
Keys are imported with `extractable: false`.

Two key slots are configured, one for better-auth account tokens and one for
calendar integration tokens, each with a secret and a separate key *identifier*.
The identifier is stored alongside the ciphertext, and `resolveKeyConfig()`
matches it back to the right secret, which is what makes rotation possible
without a bulk re-encrypt. It throws rather than guessing when the id is
ambiguous.

Secrets are read from the environment. The variable names are
`AUTH_TOKEN_ENCRYPTION_KEY` and `INTEGRATION_TOKEN_ENCRYPTION_KEY`; no value
appears in this repository, and `.env.example` carries placeholders only.

**One honest criticism.** The key is derived by taking a bare `SHA-256` of the
configured secret, not by running it through a KDF such as HKDF or PBKDF2. With
a high-entropy random secret that is adequate; with a human-chosen one it is
weaker than it looks, and it offers no domain separation between the two key
slots beyond the secrets themselves. HKDF with a per-slot info string would have
been the correct call and would have cost about four lines.

## 6. The telemetry boundary

No third-party JavaScript runs on any route that can render PHI. The marketing
plane and the product plane are separate Workers over separate data stores, so
PostHog's browser SDK on the public site physically cannot reach the PHI
database.

Authenticated analytics go through a same-origin `/api/analytics/product` proxy
with an explicit event allowlist, route normalization and a scalar-only property
sanitizer. The allowlist is cross-checked against actual route sources by
[`apps/web/src/__tests__/app-static-contracts.test.ts:147`](../apps/web/src/__tests__/app-static-contracts.test.ts),
which asserts every authenticated app route emits a normalized page view.

**This rule is violated once, by this codebase, on purpose-adjacent grounds.**
[`apps/web/src/components/crm-feedback-widget.tsx`](../apps/web/src/components/crm-feedback-widget.tsx)
injects a vendor loader into every `/app/*` route when `VITE_CRM_WIDGET_KEY` is
set. It is env-gated, passes no user data, and the CSP allowlists exactly one
origin. The rule is still categorical and this still breaks it. It was found
while reviewing this snapshot, not while building.

## 7. Uploads

Task attachments run through an antivirus scanning pipeline before they can be
downloaded. `app-static-contracts.test.ts:1148` asserts the download path is
gated on scan clearance, and the scan callback is authenticated with
`x-phiguard-scan-signature` and `x-phiguard-scan-request-signature` headers,
asserted at `:1231`.

## 8. The pattern across these seven

Every safeguard that survived to the end is encoded in the codebase: in a
trigger, a transaction boundary, a filename convention, or a type. Row-level
security was never implemented, and the offsite audit export went away with
the AWS infrastructure that ran it. Both would have lived outside the code,
and neither survived. That is the one genuinely transferable finding in this
repository.
