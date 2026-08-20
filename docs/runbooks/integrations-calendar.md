# Runbook: Calendar Integration (Google Workspace & Microsoft 365)

## Overview

PHIGuard can sync task due dates to clinic staff calendars via Google Calendar (Google Workspace) and Microsoft 365 Calendar. This runbook covers the PHI-handling constraints, customer responsibilities, and operational procedures for these integrations.

## BAA and Compliance Model

Both integrations follow the same compliance model:

- PHIGuard integrates with the **customer's own** Google Workspace or Microsoft 365 tenant via OAuth.
- Google and Microsoft act as Business Associates of the **customer's covered entity**, not of PHIGuard.
- PHIGuard does not need a separate BAA with Google or Microsoft for calendar sync.
- The customer's existing Google Workspace Enterprise or Microsoft 365 agreement with its associated BAA covers this data flow.

This model holds as long as PHIGuard does not transmit PHI to these services. See the constraint below.

## PHI Constraint - Customer Responsibility

**PHIGuard calendar events must not contain PHI.**

This is a product design constraint:

- PHIGuard syncs the task due date using a generic event title: `PHIGuard task due`.
- PHIGuard does not send the task title, description, comments, attachments, assignee names, patient names, MRNs, diagnoses, or clinical context to Google Calendar or Microsoft 365 Calendar.
- The event may include a PHIGuard task UUID in provider-private metadata so PHIGuard can identify its own calendar event without exposing task text.

### Customer obligation

Clinics using calendar sync must:

1. Keep PHI out of connected calendar accounts and calendar event edits.
2. Establish an internal policy covering acceptable task and calendar content.
3. Confirm their Google Workspace or Microsoft 365 agreement includes a BAA covering their use of calendar data.

PHIGuard surfaces this requirement in the integration setup flow with an explicit acknowledgment before OAuth authorization is granted.

## Enabling Calendar Integration for a Tenant

1. The clinic administrator navigates to **Settings > Integrations** in the PHIGuard app.
2. The admin selects Google Calendar or Microsoft 365 Calendar.
3. Before proceeding to OAuth, the admin must acknowledge:
   > "I understand that PHIGuard creates generic due-date reminders in my clinic's calendar and that my clinic's Google Workspace / Microsoft 365 agreement includes a BAA that covers this calendar data."
4. The admin completes the OAuth flow. PHIGuard stores the OAuth tokens in the `integration_connections` table using application-level token encryption, backed by the current Worker encryption-key secrets and managed PostgreSQL provider encryption at rest.
5. Sync begins for newly created tasks with due dates. Due-date edits update mapped provider calendar events, create missing events for active calendar connections, or best-effort delete mapped events when the due date is cleared. When a synced task is marked done, PHIGuard best-effort deletes the mapped provider calendar event and marks the sync record deleted.

## Revoking Access

1. The admin navigates to **Settings > Integrations** and disconnects the calendar integration.
2. PHIGuard deletes the stored OAuth tokens from `integration_connections`.
3. No further sync events are sent. Existing calendar events created by PHIGuard remain in the calendar provider and must be cleaned up manually by the clinic if needed.

## Incident Response

If PHI is discovered in synced calendar events, for example because a clinic user manually edited the provider calendar event:

1. The clinic should immediately revoke PHIGuard's calendar access via the settings page and via the Google/Microsoft admin console.
2. The clinic should delete the affected calendar events from the calendar provider.
3. Assess whether the disclosure constitutes a breach under the HIPAA Breach Notification Rule.
4. If a breach is confirmed, follow `docs/runbooks/incident-response.md`.

## Audit Trail

All OAuth connection and disconnection events are written to the PHIGuard audit log via `writeAuditEvent` with `resourceType: 'integration_connection'`. Individual sync events are not individually audited at the calendar item level - only connection lifecycle events are logged.
