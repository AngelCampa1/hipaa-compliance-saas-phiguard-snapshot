# Workforce Security Policy

Last updated: 2026-05-20

This policy documents PHIGuard's operational controls for HIPAA workforce security, sanctions, security reminders, and endpoint/workstation use. It uses role titles because named Privacy Officer, Security Officer, and counsel assignments are tracked separately in `docs/hipaa/officers.md` and must be completed with real business approvals.

## Scope

This policy applies to PHIGuard founders, employees, contractors, support operators, and any other workforce member with access to PHIGuard production systems, customer support records, logs, deployment tooling, or administrative systems that may expose ePHI or customer compliance data.

## Workforce Clearance

Before a workforce member receives production access, the Security Officer or delegated administrator must confirm:

1. The person has a business need for the requested role.
2. The requested access level matches the least-privilege role needed for the work.
3. Required confidentiality, security, and HIPAA handling acknowledgements are complete.
4. The person has completed onboarding training for PHI handling, incident reporting, password management, phishing awareness, and approved support channels.
5. Endpoint and workstation requirements in this policy are satisfied.
6. Access is granted through named accounts only. Shared accounts are prohibited.
7. The access grant is logged or otherwise captured in audit evidence.

The onboarding record should include the workforce member, approver, access granted, date granted, and training evidence location.

## Authorization and Supervision

Production access must be reviewed quarterly through the access review process in `docs/hipaa/access-review.md`. Temporary access should include an expiration date or a documented removal task. Any role change that increases access to PHI-adjacent systems requires Security Officer or delegated administrator approval before the change is made.

Support work must follow the minimum necessary standard. Workforce members must not open customer data unless needed to support the customer, investigate an incident, satisfy a compliance obligation, or perform approved operational maintenance.

## Termination Procedures

When a workforce member leaves PHIGuard or no longer needs access, the Security Officer or delegated administrator must:

1. Disable or remove production application access.
2. Revoke identity-provider, repository, deployment, database, object-storage, billing, email, and observability access as applicable.
3. Revoke active sessions and API tokens where supported.
4. Rotate any shared secret that may have been exposed to the departing person.
5. Confirm return or destruction of PHIGuard-managed devices or storage media when applicable.
6. Record offboarding evidence and trigger an out-of-cycle access review if the access was privileged.

Emergency termination should be handled immediately and documented after containment.

## Sanction Policy

PHIGuard applies sanctions for workforce violations involving PHI, credentials, customer data, production systems, or required security procedures. The Security Officer owns investigation coordination and may involve legal/privacy counsel when an event may affect customers or regulatory obligations.

Sanctions are based on severity, intent, recurrence, and potential customer impact:

| Tier | Examples | Required response |
| --- | --- | --- |
| Coaching | Accidental policy miss with no PHI exposure and no repeated pattern | Document coaching, retrain the person, and track completion |
| Written warning | Repeated minor violations, delayed incident reporting, or careless handling of customer data | Written warning, retraining, manager/founder review, and access review |
| Access suspension | Credential sharing, unapproved production access, or risky handling of PHI-adjacent data | Suspend relevant access pending investigation and document corrective actions |
| Termination / contract removal | Intentional misuse, unauthorized disclosure, tampering with audit evidence, or refusal to follow security requirements | Remove access, preserve evidence, and evaluate breach/notification obligations |

Every sanction decision must be documented with the date, reviewer, facts considered, corrective action, and evidence location. Do not record patient PHI in sanction notes unless strictly necessary; link to controlled incident evidence instead.

## Security Reminders

The Security Officer or delegated administrator sends security reminders at least quarterly and after material workflow, vendor, policy, or incident changes. Reminders should cover current risks such as phishing, password hygiene, approved support channels, incident reporting, minimum necessary access, endpoint patching, and handling of customer data.

Evidence of each reminder should include the date, audience, topic, delivery channel, and content or link to the content.

## Endpoint and Workstation Requirements

Workforce members may access PHIGuard production or customer-support systems only from approved devices that meet these requirements:

1. Full-disk encryption is enabled.
2. Operating system and browser security updates are current.
3. Screen lock is enabled with a short idle timeout.
4. Local user authentication is protected with a strong password, biometric unlock, or equivalent control.
5. Malware protection or platform-native endpoint protection is active.
6. Devices are not shared with unauthorized users for PHIGuard work.
7. Customer data and PHI-adjacent exports are not stored locally unless explicitly approved for a time-bounded support or incident task.
8. Lost, stolen, compromised, or unmanaged devices are reported immediately through the incident response process.

Remote work must prevent shoulder-surfing and unauthorized disclosure. Workforce members should avoid customer-data work on public networks unless using approved secure connectivity and must never use public or shared computers for production access.

## Evidence

Evidence for this policy may include onboarding records, training records, access review attestations, offboarding checklists, security reminder archives, endpoint compliance screenshots or attestations, incident records, and audit log exports.

Related documents:

- `docs/hipaa/access-review.md`
- `docs/runbooks/incident-response.md`
- `docs/runbooks/breach-decision-tree.md`
- `docs/hipaa/safeguards-map.md`
