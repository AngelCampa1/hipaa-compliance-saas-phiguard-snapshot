# ADR 0016: Marketing Email Architecture

**Status:** Accepted

> Historical status: This ADR records the former in-house AWS/ECS nurture-runner
> design. It is not the current production marketing email operating model as of
> May 2026. Current lead-magnet fulfillment and nurture delivery run through
> external Sequencer definitions verified by the go-live runbooks, including
> `phiguard-fulfillment-welcome`, `phiguard-nurture-value-1`, and
> `phiguard-lead-magnet-nurture`.

---

## Context

PHIGuard needed to move from single-shot transactional delivery (one email per lead magnet download) to a proper nurture sequence for prospect education and conversion. Resend was already the intended email provider (ADR 0001) but had not been put into active use.

A native drip sequence tool (Customer.io, Loops, ActiveCampaign) was considered. Each adds vendor cost, a dedicated integration surface to maintain, and, critically, requires a BAA evaluation for any system that could conceivably receive PHI. Even if today's templates contain no PHI, adding a managed sequence tool means a third party stores prospect contact data alongside the PHIGuard account; the BAA boundary becomes harder to audit. The compliance overhead is not justified at the current prospect volume.

---

## Decision

A DB-backed cron sequencer, built in-house and delivered via Resend.

**Schema (marketing tables, no PHI):**

| Table | Purpose |
|---|---|
| `nurture_sequences` | Defines a named sequence (e.g., "HIPAA Checklist Download") |
| `nurture_steps` | Each step in a sequence: position, delay in days, template key |
| `nurture_enrollments` | One row per prospect per sequence; tracks current position and status |
| `nurture_sends` | Append-only record of every email dispatched; prevents duplicate sends |
| `email_subscriptions` | Suppression list; `subscribed = false` stops all future sends |

**Execution model:**

EventBridge Scheduler fires an ECS RunTask every 15 minutes. The task runs `node dist/cli/nurture-run.js`, which:
1. Queries `nurture_enrollments` for rows due for their next step using `SELECT ... FOR UPDATE SKIP LOCKED` (prevents duplicate sends if two tasks overlap).
2. Resolves the React Email template for the step.
3. Sends via Resend.
4. Writes a row to `nurture_sends` and advances the enrollment cursor.

**Delivery infrastructure:**

- Resend for SMTP relay and delivery analytics.
- React Email for template authoring (same toolchain as `packages/email`).
- EventBridge Scheduler + ECS Fargate for the runner (see `infra/terraform/modules/nurture-scheduler/`).

---

## Consent Model

Enrollment is implied opt-in: downloading a lead magnet triggers enrollment. Every email in every sequence includes a one-click unsubscribe link. On click, `email_subscriptions.subscribed` is set to `false` for the prospect's email address; the runner skips all rows for unsubscribed addresses on every future run.

CAN-SPAM compliance is maintained via:
- Opt-out honored within one runner cycle (at most 15 minutes after click).
- Physical mailing address in every email footer.
- Accurate `From` name and `Subject` lines: no deceptive headers.
- `email_subscriptions` is the single source of truth; bounces and spam complaints from Resend must flow back via webhook to flip `subscribed = false` before the next run.

---

## PHI Boundary

Marketing email is prospect-only. This boundary is architectural, not just policy:

- No customer data, no clinic operational data, and no patient data may appear in email content.
- Nurture templates receive only three values: `magnetTitle`, `unsubscribeUrl`, and optionally `firstName`.
- This interface contract must be preserved in all future template additions. Any template that requires additional fields must be reviewed for PHI exposure before deployment.
- The `nurture_*` and `email_subscriptions` tables store prospect contact information (name, email), not PHI by definition, as prospects are not patients of any covered entity.

---

## Resend BAA Status

Not required for this scope. Resend processes prospect email addresses only. No PHI is transmitted.

If any future email path includes clinic operational data or patient-identifying information, a Resend BAA evaluation is required and must be completed before that change is deployed. The vendors table (`docs/hipaa/vendors.md`) must be updated and a signed BAA stored in the legal evidence vault before merge.

---

## Consequences

**Positive:**
- No additional vendor cost or BAA negotiation for the current scope.
- Full visibility into enrollment state, send history, and suppression, all in the existing Postgres instance.
- `SKIP LOCKED` makes the runner safely re-entrant; no distributed lock or external queue required.
- Unsubscribe is a single DB write with no third-party dependency.

**Negative / Risks:**
- The nurture runner is a new operational concern. Failed ECS tasks (OOM, timeout, code errors) will delay sends until the next 15-minute cycle. Monitor the ECS task failure metric and alarm on consecutive failures.
- `email_subscriptions` is the single suppression source of truth. Resend bounce and complaint webhooks must be wired to flip `subscribed = false`; if the webhook fails, the runner will continue sending to a bounced address until the next webhook succeeds. Implement webhook retry handling and a dead-letter alarm.
- React Email templates require the same `stop-slop` + `humanizer` review pass as any other marketing copy before being enabled in production. See `docs/marketing/nurture-copy.md` for subject/preview pre-approval status.
