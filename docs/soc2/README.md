# SOC 2 Type I Preparation - Control Mapping

This document maps each seeded SOC 2 TSC control to its implementation location and the audit actions used as evidence.

## Controls

| Control ID | Category | Title | Implementation File | Audit Actions |
|---|---|---|---|---|
| CC1.1 | CC1 - Control Environment | Control Environment - COSO Principle 1 | `packages/auth/src/permissions.ts`, `packages/db/src/schema/memberships.ts` | `organization.created`, `user.role_changed` |
| CC2.1 | CC2 - Communication & Information | Internal Communication | `packages/compliance/src/program/policies.ts`, `packages/db/src/schema/policies.ts` | `organization.updated`, `policy.published`, `policy.acknowledged` |
| CC3.1 | CC3 - Risk Assessment | Specifies Objectives | `packages/compliance/src/program/risk.ts`, `packages/db/src/schema/risk-assessments.ts` | `risk_assessment.created`, `risk_assessment.updated`, `risk_item.created` |
| CC4.1 | CC4 - Monitoring Activities | Conducts Ongoing Evaluations | `packages/compliance/src/soc2/bundle-export.ts`, `packages/audit/` | `risk_assessment.reviewed`, `audit_log.exported`, `soc2.bundle_exported` |
| CC5.1 | CC5 - Control Activities | Selects and Develops Control Activities | `packages/compliance/src/program/policies.ts`, `packages/compliance/src/program/training.ts` | `policy.published`, `training.assigned`, `membership.created`, `membership.revoked` |
| CC6.1 | CC6 - Logical & Physical Access | Logical and Physical Access - Access Restrictions | `packages/auth/src/permissions.ts`, `packages/db/src/schema/memberships.ts`, `apps/web/src/server/soc2.ts` | `user.created`, `user.role_changed`, `membership.created`, `membership.revoked` |
| CC6.2 | CC6 - Logical & Physical Access | Logical and Physical Access - User Registration | `packages/db/src/schema/memberships.ts`, `packages/compliance/src/soc2/access-review.ts` | `membership.created`, `user.created` |
| CC7.2 | CC7 - System Operations | System Operations - Monitoring for Anomalies | `packages/audit/`, `apps/web/src/routes/app/audit/` | Any audit event (count > 0 confirms monitoring is active) |
| CC8.1 | CC8 - Change Management | Manages Changes to Infrastructure | `package.json`, `scripts/deploy-touched.mjs`, `wrangler.jsonc`, `packages/db/src/schema/integrations.phi.ts` | `organization.updated`, `integration.installed`, `integration.revoked` |
| CC9.1 | CC9 - Risk Mitigation | Identifies and Manages Business Disruption Risks | `packages/compliance/src/incidents.ts`, `packages/db/src/schema/` | `incident.created`, `incident.resolved`, `incident.closed` |

## Architecture

### Schema Files

| File | Purpose |
|---|---|
| `packages/db/src/schema/soc2-controls.ts` | SOC 2 controls catalog (non-PHI) |
| `packages/db/src/schema/soc2-evidence.ts` | Evidence items collected per control (non-PHI) |
| `packages/db/src/schema/access-reviews.ts` | Quarterly access review records (non-PHI) |

### Domain Logic

| File | Exports |
|---|---|
| `packages/compliance/src/soc2/controls.ts` | `listControls(db, { tenantId? })` |
| `packages/compliance/src/soc2/controls-seed.ts` | `SOC2_CONTROLS_SEED` - 10 representative controls |
| `packages/compliance/src/soc2/evidence.ts` | `collectAuditEvidence`, `CONTROL_AUDIT_MAP` |
| `packages/compliance/src/soc2/bundle-export.ts` | `exportEvidenceBundle` - JSON bundle export to private audit evidence storage |
| `packages/compliance/src/soc2/access-review.ts` | `openAccessReview`, `recordDecision`, `closeAccessReview` |

### Server Functions

`apps/web/src/server/soc2.ts`:
- `listControlsFn` - controls with evidence counts
- `listEvidenceFn({ controlId? })` - evidence rows for tenant
- `exportEvidenceBundleFn({ from, to })` - export bundle, emits `soc2.bundle_exported` audit event
- `listAccessReviewsFn` - all reviews for tenant
- `listAccessReviewItemsFn({ reviewId })` - items with membership info
- `openAccessReviewFn({ periodStart, periodEnd })` - opens review + items
- `recordDecisionFn({ reviewId, itemId, decision, notes? })` - records decision, revokes membership if needed
- `closeAccessReviewFn({ reviewId })` - closes if all items decided

### Routes

| Route | Path | Description |
|---|---|---|
| `soc2.index.tsx` | `/app/soc2/` | Dashboard with control/evidence summary |
| `soc2.controls.tsx` | `/app/soc2/controls` | Controls table with evidence count badges |
| `soc2.evidence.tsx` | `/app/soc2/evidence` | Evidence list + Export Bundle button |
| `soc2.access-reviews.tsx` | `/app/soc2/access-reviews` | Reviews list + Open Review (admin only) |
| `soc2.access-reviews.$reviewId.tsx` | `/app/soc2/access-reviews/:reviewId` | Member review grid with decision buttons |
| `soc2.auditor.tsx` | `/app/soc2/auditor` | Read-only view for auditor role |

### Feature Gate

All SOC 2 routes require the `soc2_evidence` feature key. See the billing catalog in `packages/billing/src/plans.ts` and the public pricing page for current plan availability and pricing.

Access is gated server-side via `requireSoc2Access()` in `apps/web/src/server/soc2.ts`, which calls:
1. `requireFeatureForOrg(org, 'soc2_evidence')`
2. `canAccessSoc2(access.role)` - allows `org_owner`, `org_admin`, and `auditor` roles

### Auditor Role

The `auditor` role is defined in `packages/auth/src/permissions.ts`. It is outside the normal role hierarchy (level 0) and has read-only access to SOC 2 pages. It cannot perform any write operations.

The `auditor` role is already part of the `memberships.role` enum in `packages/db/src/schema/memberships.ts` and is added by the existing `packages/db/drizzle/0010_auditor_role.sql` migration. To assign auditor access, update the membership's `role` field to `auditor` through the normal membership administration path or an approved operational data change.
