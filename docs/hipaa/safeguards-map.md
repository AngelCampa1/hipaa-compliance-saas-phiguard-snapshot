# HIPAA Security Rule Safeguards Map

Last updated: 2026-05-20

This document maps the HIPAA Security Rule requirements (45 CFR Part 164, Subpart C) to PHIGuard's implemented and planned controls. It is the authoritative reference for compliance reviewers and security auditors.

**Status key:**

- `IMPLEMENTED` - control is in place and verified
- `PLANNED` - control is designed and on the roadmap; not yet in production
- `N/A` - requirement does not apply to PHIGuard's operating model, with rationale provided

---

## Administrative Safeguards (§164.308)

| Requirement                      | Standard                                       | PHIGuard Control                                                                                                                                                                                                                                  | Status      |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Security Management Process      | Risk Analysis                                  | Current completed analysis in `docs/hipaa/risk-analysis-register-2026.md`; reusable worksheet retained in `docs/hipaa/risk-analysis-template.md` for annual and material-change reviews (45 CFR §164.308(a)(1)(ii)(A))                            | IMPLEMENTED |
| Security Management Process      | Risk Management                                | Risk register and mitigation tracker in `docs/hipaa/risk-analysis-register-2026.md`; annual review cadence documented in the register                                                                                                             | IMPLEMENTED |
| Security Management Process      | Sanction Policy                                | Sanction policy in `docs/hipaa/workforce-security.md`; sanctions require documented facts, corrective action, and evidence location                                                                                                               | IMPLEMENTED |
| Security Management Process      | Information System Activity Review             | Sentry, application logs, provider logs, and hosting provider/database-provider alerts; incident review workflow in `docs/runbooks/incident-response.md`                                                                                                | IMPLEMENTED |
| Assigned Security Responsibility | Security Officer                               | Security Officer assigned in `docs/hipaa/officers.md`; Angel (`@angel`) owns security controls, incident coordination, access reviews, restore drills, and vendor security review                                                                 | IMPLEMENTED |
| Workforce Security               | Authorization and/or Supervision               | RBAC via better-auth (owner / admin / staff roles); quarterly access review per `docs/hipaa/access-review.md` (45 CFR §164.308(a)(4)(ii)(C))                                                                                                      | IMPLEMENTED |
| Workforce Security               | Workforce Clearance Procedure                  | Workforce clearance checklist in `docs/hipaa/workforce-security.md`; requires least-privilege approval, training evidence, endpoint readiness, and named accounts only                                                                            | IMPLEMENTED |
| Workforce Security               | Termination Procedures                         | Offboarding: revoke sessions, downgrade role, org removal; out-of-cycle access review triggered per `docs/hipaa/access-review.md`                                                                                                                 | IMPLEMENTED |
| Information Access Management    | Isolating Healthcare Clearinghouse Functions   | N/A - PHIGuard is not a clearinghouse                                                                                                                                                                                                             | N/A         |
| Information Access Management    | Access Authorization                           | Org-scoped access; role-based permissions enforced server-side                                                                                                                                                                                    | IMPLEMENTED |
| Information Access Management    | Access Establishment and Modification          | Role changes logged in `audit_events`; effective immediately                                                                                                                                                                                      | IMPLEMENTED |
| Security Awareness and Training  | Security Reminders                             | Quarterly security reminders plus change-triggered reminders documented in `docs/hipaa/workforce-security.md`                                                                                                                                     | IMPLEMENTED |
| Security Awareness and Training  | Protection from Malicious Software             | Manual dependency review plus `pnpm audit` before release                                                                                                                                                                                         | IMPLEMENTED |
| Security Awareness and Training  | Log-in Monitoring                              | Failed login attempts emit PHI-safe application log events; app-layer and edge rate limits reduce brute-force attempts; repeated email failures trigger hashed identifier account lockout; alerting must be configured before live PHI processing | IMPLEMENTED |
| Security Awareness and Training  | Password Management                            | better-auth enforces minimum password complexity; new credential passwords use WebCrypto PBKDF2-SHA-256 password hashing in `packages/auth/src/password.ts`; legacy scrypt hashes remain verifiable during migration                              | IMPLEMENTED |
| Security Incident Procedures     | Response and Reporting                         | `docs/runbooks/incident-response.md` for response steps and `docs/runbooks/breach-decision-tree.md` for breach classification and notification obligations                                                                                        | IMPLEMENTED |
| Contingency Plan                 | Data Backup Plan                               | Managed PostgreSQL backups plus documented restore workflow; object storage stores attachment and evidence objects through Worker bindings                                                                                                         | IMPLEMENTED |
| Contingency Plan                 | Disaster Recovery Plan                         | Managed PostgreSQL restore procedure plus the selected application runtime/deployment tooling redeploy path                                                                                                                                                               | IMPLEMENTED |
| Contingency Plan                 | Emergency Mode Operation Plan                  | Emergency read-only mode is implemented with `PHIGUARD_READ_ONLY_MODE`; the Worker blocks mutating requests with a 503 response while allowing read requests during managed PostgreSQL failover                                                   | IMPLEMENTED |
| Contingency Plan                 | Testing and Revision Procedure                 | Annual DR test (post-launch)                                                                                                                                                                                                                      | PLANNED     |
| Contingency Plan                 | Applications and Data Criticality Analysis     | PHI state is in managed PostgreSQL and private object storage buckets; production region/provider dependency analysis required before live PHI processing                                                                                                     | PLANNED     |
| Evaluation                       | Periodic Technical and Nontechnical Evaluation | Annual third-party penetration test (post-launch)                                                                                                                                                                                                 | PLANNED     |
| Business Associate Contracts     | Written Contract or Other Arrangement          | BAA inventory in `docs/hipaa/vendors.md`                                                                                                                                                                                                          | IMPLEMENTED |

---

## Physical Safeguards (§164.310)

| Requirement               | Standard                                 | PHIGuard Control                                                                                                                                                    | Status      |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Facility Access Controls  | Contingency Operations                   | hosting provider and managed Postgres provider data center procedures; no PHIGuard on-premises hardware                                                                   | IMPLEMENTED |
| Facility Access Controls  | Facility Security Plan                   | hosting provider and managed Postgres provider physical security controls and third-party assurance reports                                                               | IMPLEMENTED |
| Facility Access Controls  | Access Control and Validation Procedures | Infrastructure providers handle physical access; PHIGuard has no facility access path                                                                               | IMPLEMENTED |
| Facility Access Controls  | Maintenance Records                      | Infrastructure providers handle hardware maintenance; no PHIGuard-managed hardware                                                                                  | N/A         |
| Workstation Use           | -                                        | Endpoint and workstation requirements in `docs/hipaa/workforce-security.md`, including disk encryption, patching, screen lock, local auth, and local-storage limits | IMPLEMENTED |
| Workstation Security      | -                                        | Remote-work safeguards and lost/stolen/compromised device reporting in `docs/hipaa/workforce-security.md`                                                           | IMPLEMENTED |
| Device and Media Controls | Disposal                                 | Infrastructure providers handle hardware disposal; no on-premises media containing PHI                                                                              | IMPLEMENTED |
| Device and Media Controls | Media Re-Use                             | N/A - no on-premises media                                                                                                                                          | N/A         |
| Device and Media Controls | Accountability                           | N/A - no on-premises media                                                                                                                                          | N/A         |
| Device and Media Controls | Data Backup and Storage                  | Managed Postgres backups; object storage object storage for uploaded evidence and attachments                                                                        | IMPLEMENTED |

---

## Technical Safeguards (§164.312)

| Requirement                     | Standard                   | PHIGuard Control                                                                                                                                                                                                                                                                                             | Status      |
| ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| Access Control                  | Unique User Identification | better-auth; UUID per user; no shared accounts                                                                                                                                                                                                                                                               | IMPLEMENTED |
| Access Control                  | Emergency Access Procedure | Break-glass hosting provider/database-provider access path must be documented with MFA and audit evidence before additional operators receive PHI access                                                                                                                                                           | PLANNED     |
| Access Control                  | Automatic Logoff           | better-auth server-side session expiry is configured for a 15-minute idle window (`expiresIn = 900`, `updateAge = 300`); browser session cache also expires after 15 minutes (`packages/auth/src/auth.ts`)                                                                                                   | IMPLEMENTED |
| Access Control                  | Encryption and Decryption  | Managed Postgres encryption at rest, object storage storage encryption, and TLS 1.2+ in transit                                                                                                                                                                                                               | IMPLEMENTED |
| Audit Controls                  | -                          | Append-only `audit_events` table; Postgres trigger enforces immutability; BAA and billing lifecycle mutations emit audit events from `packages/baa` and `packages/billing`; audit viewer at `/app/audit` for Security Officer review; long-term export retention remains part of production evidence capture | IMPLEMENTED |
| Integrity                       | Authentication Mechanism   | HMAC session tokens via better-auth; tokens not stored in plaintext                                                                                                                                                                                                                                          | IMPLEMENTED |
| Integrity                       | Transmission Integrity     | TLS 1.2+ at the application edge; HTTPS-only; no plaintext transport of PHI                                                                                                                                                                                                                                       | IMPLEMENTED |
| Person or Entity Authentication | -                          | Password + session-based auth via better-auth; MFA remains deferred beyond Phase 2                                                                                                                                                                                                                           | IMPLEMENTED |
| Transmission Security           | Encryption in Transit      | TLS 1.2+ enforced for the application runtime-hosted app/API; app-layer HSTS and other security headers enforced in `apps/web/src/middleware/security-headers.ts`                                                                                                                                              | IMPLEMENTED |

---

## PHI-Touching Tables

The following database tables contain or reference PHI. All schema files storing or referencing PHI should use the `.phi.ts` naming convention described in ADR 0002.

| Table / area                   | Schema File                                              | PHI Fields / reason for inclusion                         |
| ------------------------------ | -------------------------------------------------------- | --------------------------------------------------------- |
| Better Auth credential/session | `packages/db/src/schema/auth.phi.ts`                     | user identity, account/session links, verification tokens |
| `users`                        | `packages/db/src/schema/users.phi.ts`                    | name, email                                               |
| `organizations`                | `packages/db/src/schema/organizations.ts`                | org name, contact                                         |
| `memberships`                  | `packages/db/src/schema/memberships.ts`                  | links user to org                                         |
| `organization_invitations`     | `packages/db/src/schema/organization-invitations.phi.ts` | invitee email, role, organization link                    |
| `tasks`                        | `packages/db/src/schema/tasks.phi.ts`                    | title, description, assignee                              |
| `task_assignments`             | `packages/db/src/schema/task-assignments.phi.ts`         | user-task assignment links                                |
| `task_comments`                | `packages/db/src/schema/task-comments.phi.ts`            | comment body                                              |
| `task_attachments`             | `packages/db/src/schema/task-attachments.phi.ts`         | filename/object key                                       |
| `integration_sync_records`     | `packages/db/src/schema/integrations.phi.ts`             | external calendar event IDs linked to task IDs            |
| `legal_acceptances`            | `packages/db/src/schema/legal-acceptances.phi.ts`        | signer identity and executed legal document evidence      |
| `policy_acknowledgements`      | `packages/db/src/schema/policy-acknowledgements.phi.ts`  | user-policy acknowledgement evidence                      |
| `training_records`             | `packages/db/src/schema/training-records.phi.ts`         | user training status and certificate object key           |
| `vendor_baas`                  | `packages/db/src/schema/vendor-baas.phi.ts`              | vendor BAA signer and evidence metadata                   |
| `checklists`                   | `packages/compliance/src/schema/checklists.ts`           | checklist metadata tied to tenant operations              |
| `checklist_items`              | `packages/compliance/src/schema/checklist-items.phi.ts`  | item text, notes                                          |
| `incidents`                    | `packages/compliance/src/schema/incidents.phi.ts`        | incident description and handling metadata                |
| `audit_events`                 | `packages/audit/src/schema/audit-events.phi.ts`          | before/after JSON may contain PHI fields                  |

This table is authoritative. Adding a new PHI-touching table requires:

1. A schema file using the `.phi.ts` naming convention when PHI is stored or referenced.
2. A row added here.
3. Review in the next security cycle.

---

## Open Items

| Item                                                                          | Owner                          | Target                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| Document hosting provider and database-provider break-glass access path             | Engineering                    | Before additional PHI operators                                                 |
| Reconfirm Resend remains PHI-free or complete BAA review before scope changes | Engineering + Legal            | Before sending PHI through email; see `docs/hipaa/vendors.md`                   |
| Complete Stripe legal review and BAA decision                                 | Engineering + Legal            | Before go-live - see `docs/hipaa/vendors.md`                                    |
| Capture Phase 2 exit evidence (billing/BAA path, alert tests, incident drill) | Engineering + Security Officer | Before production launch - see `docs/hipaa/phase-2-evidence.md`                 |
| Schedule first annual penetration test                                        | Security Officer               | 90 days post-launch                                                             |
