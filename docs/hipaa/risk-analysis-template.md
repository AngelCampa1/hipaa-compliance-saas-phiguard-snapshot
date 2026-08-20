# Risk Analysis Template

**Standard:** NIST SP 800-66 Rev 2, Implementing the HIPAA Security Rule, Section 2.2
**Regulatory basis:** 45 CFR 164.308(a)(1)(ii)(A), Risk Analysis
**Complementary guidance:** HHS Risk Analysis Guidance, https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html

Last updated: 2026-05-20
Status: TEMPLATE - complete before go-live; review annually and after any material change

---

## 1. Purpose And Scope

This risk analysis identifies and documents potential threats and vulnerabilities to the confidentiality, integrity, and availability of electronic Protected Health Information (ePHI) maintained by PHIGuard. It must be completed before PHIGuard processes live PHI in production.

The analysis follows the NIST/HHS risk-analysis workflow:

1. Identify the scope.
2. Gather data on systems that create, receive, maintain, or transmit ePHI.
3. Identify and document potential threats.
4. Identify and document potential vulnerabilities.
5. Assess current security measures.
6. Determine likelihood.
7. Determine impact.
8. Determine risk level.
9. Finalize documentation.

### 1.1 Production Scope

This analysis covers PHIGuard's current hosting provider + managed PostgreSQL deployment path:

- `apps/web` hosted on the selected application runtime.
- `apps/marketing` hosted on the selected application runtime.
- Managed PostgreSQL accessed through the database connection layer.
- object storage buckets for attachments, audit/evidence exports, lead magnets, and legal artifacts.
- Worker secrets, custom domains, DNS, object storage bindings, database connection layer bindings, and deploy credentials.
- Attachment malware scanner, which must be self-hosted inside PHIGuard-controlled infrastructure or covered by a signed BAA before live PHI processing.
- Administrative access paths for hosting provider, the database provider, source control, deploy workflows, and break-glass access.
- Workforce endpoints used to administer PHIGuard.
- Third-party services with possible PHI exposure, as listed in `docs/hipaa/vendors.md`.

### 1.2 Authorizing Official

[SECURITY OFFICER - assign before go-live]

### 1.3 Analysis Date

[DATE - complete before go-live]

### 1.4 Next Scheduled Review

[DATE - one year from completion date, or earlier if a material change occurs]

---

## 2. PHI Asset Inventory

The following tables contain or reference PHI or PHI-adjacent operational evidence. Cross-reference `docs/hipaa/safeguards-map.md` when adding or changing PHI-touching schemas.

| Table / area                   | Schema File                                             | PHI / PII Fields Or Rationale                      | Audit / Evidence Hook                  |
| ------------------------------ | ------------------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| Better Auth credentials        | `packages/db/src/schema/auth.phi.ts`                    | user identity, accounts, sessions, tokens          | auth/session controls                  |
| `users`                        | `packages/db/src/schema/users.phi.ts`                   | email, name                                        | user/account events                    |
| `organizations`                | `packages/db/src/schema/organizations.ts`               | organization identifiers                           | organization events                    |
| `memberships`                  | `packages/db/src/schema/memberships.ts`                 | user/org/role links                                | role-change audit events               |
| `organization_invitations`     | `packages/db/src/schema/organization-invitations.phi.ts` | invitee email, role, organization link             | invite events                          |
| `tasks`                        | `packages/db/src/schema/tasks.phi.ts`                   | title, description, assignee/location context      | task audit events                      |
| `task_assignments`             | `packages/db/src/schema/task-assignments.phi.ts`        | user-task links                                    | assignment audit events                |
| `task_comments`                | `packages/db/src/schema/task-comments.phi.ts`           | comment body                                       | comment audit events                   |
| `task_attachments`             | `packages/db/src/schema/task-attachments.phi.ts`        | object key, content type, task link                | upload and scan audit events           |
| `integration_sync_records`     | `packages/db/src/schema/integrations.phi.ts`            | external calendar event IDs linked to task IDs     | integration sync records               |
| `legal_acceptances`            | `packages/db/src/schema/legal-acceptances.phi.ts`       | signer identity and executed document evidence     | legal acceptance audit events          |
| `policy_acknowledgements`      | `packages/db/src/schema/policy-acknowledgements.phi.ts` | user-policy acknowledgement evidence               | policy acknowledgement evidence        |
| `training_records`             | `packages/db/src/schema/training-records.phi.ts`        | user training status, certificate object key       | training evidence                      |
| `vendor_baas`                  | `packages/db/src/schema/vendor-baas.phi.ts`             | signer and evidence metadata                       | vendor BAA evidence                    |
| `checklists`                   | `packages/compliance/src/schema/checklists.ts`          | tenant compliance checklist metadata               | checklist audit events                 |
| `checklist_items`              | `packages/compliance/src/schema/checklist-items.phi.ts` | item text, notes, evidence references              | checklist item audit events            |
| `incidents`                    | `packages/compliance/src/schema/incidents.phi.ts`       | incident description and handling metadata         | incident audit events                  |
| `audit_events`                 | `packages/audit/src/schema/audit-events.phi.ts`         | before/after JSON may include PHI fields           | append-only evidence store             |
| object storage attachment/evidence objects | object storage                                          | uploaded files may contain PHI                     | object keys referenced from DB records |

Maintenance rule: adding a new PHI-touching table requires `.phi.ts` naming when PHI is stored or referenced, an entry here and in `docs/hipaa/safeguards-map.md`, audit/evidence coverage, and security review.

---

## 3. Threat Catalog

| Threat ID | Threat                                | Threat Source                           | Description |
| --------- | ------------------------------------- | --------------------------------------- | ----------- |
| T-01      | Unauthorized Access - External        | External adversary                      | An attacker gains unauthorized access through exploitation, credential theft, or brute force. |
| T-02      | Unauthorized Access - Privileged      | Privileged insider or compromised admin | A hosting provider, database-provider, repository, deploy, or database administrator account accesses ePHI outside its authorized role. |
| T-03      | Malware Infection                     | External adversary; supply chain        | Malicious code is introduced into the application, dependency chain, attachment scanner, or developer endpoint. |
| T-04      | Ransomware / Data Destruction         | External adversary                      | An adversary encrypts or destroys managed PostgreSQL, object storage, or deployment data. |
| T-05      | Insider Threat - Malicious            | Malicious employee or contractor        | A workforce member intentionally accesses, copies, or discloses ePHI for personal gain, retaliation, or sale. |
| T-06      | Insider Threat - Accidental           | Untrained or inattentive employee       | A workforce member inadvertently discloses ePHI or exports it to an unsecured location. |
| T-07      | Accidental Disclosure - Application   | Software defect                         | A bug discloses ePHI to an unauthorized user or logs it to a non-PHI-safe sink. |
| T-08      | Availability Failure - Infrastructure | Provider failure                        | the selected application runtime/object storage, database connection layer, DNS, or managed PostgreSQL downtime affects access to ePHI. |
| T-09      | Availability Failure - Application    | Software defect; configuration error    | App errors, bad deploys, or failed migrations cause service unavailability. |
| T-10      | Supply Chain Attack                   | External adversary via third party      | A compromised dependency or service introduces malicious code or exfiltrates data. |
| T-11      | Physical Theft / Loss                 | Physical adversary; accident            | A workforce endpoint with cached or exported PHI is lost or stolen. |
| T-12      | Interception in Transit               | External adversary; network attack      | An adversary intercepts traffic between users, Workers, database, storage, or scanner endpoints. |

---

## 4. Vulnerability Catalog

| Vuln ID | Vulnerability                             | Category                   | Affected Assets |
| ------- | ----------------------------------------- | -------------------------- | --------------- |
| V-01    | Unpatched dependencies                    | Technical - software       | app packages, Worker dependencies, scanner, developer endpoints |
| V-02    | Misconfigured access controls             | Technical - access control | hosting provider/API tokens, better-auth RBAC, database roles |
| V-03    | Weak or reused passwords                  | Technical - authentication | workforce, hosting provider, database-provider, repository, deploy accounts |
| V-04    | PHI in logs                               | Technical - logging        | Worker logs, Sentry, application logs |
| V-05    | Insecure transmission                     | Technical - network        | HTTP endpoints, custom domains, callback endpoints |
| V-06    | Insufficient session management           | Technical - authentication | web sessions, legal/billing gates, admin routes |
| V-07    | Overly permissive infrastructure access   | Technical - access control | hosting provider tokens, Worker bindings/secrets, database roles, deploy processes |
| V-08    | Lack of MFA on privileged accounts        | Technical - authentication | hosting provider, database-provider, repository/deploy, break-glass accounts |
| V-09    | Insufficient monitoring and alerting      | Operational                | Sentry alerts, application logs, audit log review |
| V-10    | Unverified third-party BAAs               | Administrative             | vendors and scanner boundary in `docs/hipaa/vendors.md` |
| V-11    | Developer access to production data       | Administrative - process   | database console/access paths; no approval gate |
| V-12    | Untested backup recovery                  | Operational                | managed PostgreSQL restore; object storage object recovery |

---

## 5. Likelihood And Impact Matrix

Likelihood: Low, Medium, High.
Impact: Low, Medium, High.

|                        | Impact: Low | Impact: Medium | Impact: High  |
| ---------------------- | ----------- | -------------- | ------------- |
| Likelihood: High       | Medium      | High           | Critical      |
| Likelihood: Medium     | Low         | Medium         | High          |
| Likelihood: Low        | Low         | Low            | Medium        |

Critical risks require immediate action before production go-live. High risks must be remediated before go-live or within 30 days. Medium risks require a 90-day remediation plan or documented interim mitigation. Low risks may be accepted with documentation.

---

## 6. Risk Register

Complete this table during the risk analysis. Add one row per plausible threat-vulnerability pairing.

| Risk ID | Threat                     | Vulnerability                      | Likelihood | Impact  | Risk Level | Current Controls | Residual Risk | Mitigation Action | Owner | Target Date | Status |
| ------- | -------------------------- | ---------------------------------- | ---------- | ------- | ---------- | ---------------- | ------------- | ----------------- | ----- | ----------- | ------ |
| R-01    | T-01 External Access       | V-01 Unpatched dependencies        | [L/M/H]    | [L/M/H] | [level]    | dependency review; lockfile; release checks | [level] | [action] | [owner] | [date] | OPEN |
| R-02    | T-01 External Access       | V-02 Misconfigured access controls | [L/M/H]    | [L/M/H] | [level]    | org-scoped RBAC; server-side enforcement | [level] | [action] | [owner] | [date] | OPEN |
| R-03    | T-03 Malware               | V-01 Unpatched dependencies        | [L/M/H]    | [L/M/H] | [level]    | dependency review; attachment malware scanning | [level] | [action] | [owner] | [date] | OPEN |
| R-04    | T-04 Ransomware            | V-07 Overly permissive infrastructure access | [L/M/H] | [L/M/H] | [level] | managed PostgreSQL backups; object storage; restricted Worker bindings | [level] | [action] | [owner] | [date] | OPEN |
| R-05    | T-05 Malicious Insider     | V-11 Developer production access   | [L/M/H]    | [L/M/H] | [level]    | append-only audit events; approval process required | [level] | [action] | [owner] | [date] | OPEN |
| R-06    | T-06 Accidental Disclosure | V-04 PHI in logs                   | [L/M/H]    | [L/M/H] | [level]    | `logger.safe()`; Sentry scrubbers | [level] | [action] | [owner] | [date] | OPEN |
| R-07    | T-07 App Disclosure        | V-02 Misconfigured RBAC            | [L/M/H]    | [L/M/H] | [level]    | authorization tests; org-scoped queries | [level] | [action] | [owner] | [date] | OPEN |
| R-08    | T-08 Infra Availability    | V-12 Untested backup recovery      | [L/M/H]    | [L/M/H] | [level]    | managed PostgreSQL backups; object storage object storage; DR runbook | [level] | [action] | [owner] | [date] | OPEN |
| R-09    | T-10 Supply Chain          | V-01 Unpatched dependencies        | [L/M/H]    | [L/M/H] | [level]    | dependency review; lockfile; release checks | [level] | [action] | [owner] | [date] | OPEN |
| R-10    | T-12 Interception          | V-05 Insecure transmission         | [L/M/H]    | [L/M/H] | [level]    | TLS at the application edge; HSTS header | [level] | [action] | [owner] | [date] | OPEN |
| R-11    | T-02 Privileged Access     | V-08 No MFA on privileged accounts | [L/M/H]    | [L/M/H] | [level]    | break-glass access planned; provider logs | [level] | [action] | [owner] | [date] | OPEN |
| R-12    | T-06 Accidental Disclosure | V-10 Unverified BAAs               | [L/M/H]    | [L/M/H] | [level]    | vendor BAA inventory | [level] | [action] | [owner] | [date] | OPEN |

---

## 7. Mitigation Tracker

| Mitigation ID | Risk IDs Addressed | Description | Owner | Target Date | Status | Evidence |
| ------------- | ------------------ | ----------- | ----- | ----------- | ------ | -------- |
| M-01 | R-01, R-03, R-09 | Review dependency updates and require release checks before deploy | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-02 | R-02, R-07 | Complete server-side authorization audit and edge-case tests for PHI routes | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-03 | R-04 | Confirm managed PostgreSQL backups, object storage access restrictions, and Worker binding permissions | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-04 | R-05, R-11 | Implement break-glass access with MFA and alerting | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-05 | R-06 | Audit logging paths and enforce PHI-safe logging | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-06 | R-08, R-12 | Execute managed PostgreSQL restore drill and object storage object recovery check | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-07 | R-10 | Verify Worker custom domains enforce HTTPS and app HSTS/security headers | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-08 | R-12 | Confirm BAAs or PHI exclusions for vendors and the attachment scanner boundary | Legal / Founders | [date] | [OPEN/IN PROGRESS/COMPLETE] | [signed BAA or exclusion note] |
| M-09 | R-11 | Enforce MFA on privileged hosting provider, database-provider, repository, and deploy accounts | Engineering | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |
| M-10 | R-05 | Define and document approval gate for developer access to production data | Security Officer | [date] | [OPEN/IN PROGRESS/COMPLETE] | [link] |

---

## 8. Review Cadence

Review and update this analysis:

1. Annually.
2. Within 30 days of a material change, including a new PHI-touching table/module, a new service that could access ePHI, a significant infrastructure change, a confirmed or suspected Level 2+ security incident, workforce structure changes, or regulatory changes.
3. Retain each completed version for six years from creation or last effective date, whichever is later.

---

## References

- NIST SP 800-66 Rev 2, Implementing the HIPAA Security Rule
- NIST SP 800-30 Rev 1, Guide for Conducting Risk Assessments
- HHS Risk Analysis Guidance
- 45 CFR 164.308(a)(1), Security Management Process
- 45 CFR 164.308(a)(1)(ii)(A), Risk Analysis
- 45 CFR 164.308(a)(1)(ii)(B), Risk Management
- `docs/hipaa/safeguards-map.md`
- `docs/runbooks/incident-response.md`
- `docs/hipaa/vendors.md`
