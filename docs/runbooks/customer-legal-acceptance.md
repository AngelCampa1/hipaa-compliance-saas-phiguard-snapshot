# Customer Legal Acceptance Runbook

Last updated: 2026-05-20

This runbook describes how PHIGuard currently executes its standard Terms of Service and Business Associate Agreement with customers.

## Current Model

PHIGuard uses a native in-app legal acceptance flow.

- There is no third-party signature vendor in the production signing path.
- The customer signs the current standard Terms and current standard BAA together in onboarding.
- The acceptance is treated as the execution event for both agreements.
- Billing remains locked until the current Terms and current BAA are accepted by an authorized organization administrator.

## Contracting Parties

The PHIGuard contracting party is defined in the standard legal document source:

- Legal entity: `PHIGuard`
- PHIGuard signatory: `Angel Campa, Founder`

The customer contracting party is the legal entity name entered during the legal acceptance step.

## Where Signing Happens

The customer signs at `apps/web` onboarding step 2:

- route: `/app/onboarding?step=2`
- UI source: `apps/web/src/routes/app/onboarding.tsx`
- server acceptance logic: `apps/web/src/server/baa.ts`
- persistence and audit logic: `packages/baa/src/service.ts`

## Who Can Sign

Only an organization owner or organization admin may complete the legal acceptance step on behalf of the customer legal entity.

If a non-admin user reaches the step, the UI shows that only an organization administrator can accept the current Terms and BAA.

## Customer Signing Flow

1. The customer creates or enters the clinic or company legal entity name.
2. The authorized signer enters their full name.
3. The authorized signer enters their title.
4. The app displays the current standard Terms and current standard BAA inline.
5. The signer checks both acceptance boxes:
   - acceptance of the Terms on behalf of the customer legal entity
   - acceptance of the BAA with authority to bind the customer legal entity
6. The signer clicks the trial-start button. The displayed trial length comes from `TRIAL_DAYS` in `packages/billing/src/plans.ts`.
7. The server validates that the exact current Terms version and BAA version were accepted, including content hashes, to prevent stale-page acceptance.
8. If validation succeeds, PHIGuard records both legal acceptances and unlocks the billing step.

## What Counts As Execution

Execution occurs when the authorized admin successfully submits the legal acceptance form and the server records acceptance for both `terms` and `baa`.

This is the evidence bundle stored for each acceptance:

- customer legal entity name
- signer name
- signer title
- signer email
- accepted by user id
- acceptance timestamp
- request IP when available
- user agent when available
- full document snapshot for the accepted version
- executed PDF artifact when PDF generation succeeds
- executed artifact hash, size, and mime type when present

The authoritative acceptance store is the `legal_acceptances` table.

## What Happens After Signing

When legal acceptance succeeds, PHIGuard:

- stores a `terms` acceptance row
- stores a `baa` acceptance row
- writes `terms.accepted` and `baa.accepted` audit events
- updates the organization record with `termsAcceptedAt` and `baaSignedAt`
- starts the no-card trial when the selected plan and current legal acceptance are valid
- allows the admin to continue into billing for subscription management and legal document downloads

Billing must not activate unless:

- Terms are accepted
- BAA is accepted
- both accepted versions are still current

## Re-Acceptance Rules

If PHIGuard publishes a new standard Terms or BAA version, previously accepted versions remain on file but are no longer current.

In that state:

- the organization is treated as needing legal re-acceptance
- protected app access is gated back to onboarding legal step
- billing actions stay locked until the current versions are accepted

The current UI copy explicitly tells the customer that a newer standard Terms or BAA must be accepted before protected access resumes.

## How Support Or Ops Verifies Status

To verify whether a customer has completed legal acceptance, check whether:

- the organization has `termsAcceptedAt`
- the organization has `baaSignedAt`
- the latest acceptance rows for both document types match the current standard versions

Current status logic is implemented by `BaaService.getLegalStatus()`.

## How To Provide A Copy To A Customer

Executed copies are stored server-side per acceptance record.

Current state:

- the backend supports retrieval of the latest executed Terms or BAA via `downloadExecutedLegalDocument`
- the billing page exposes self-serve downloads for organization admins when both legal documents are on file
- if a rendered PDF is available, PHIGuard returns that PDF
- if PDF rendering was unavailable at acceptance time, PHIGuard falls back to a text rendering of the executed snapshot and signer metadata

Operational note:

- this retrieval path exists on the server and is surfaced from `/app/billing`
- only organization admins and owners can use the self-serve download controls
- support can still use the server-side executed artifact as the source of truth when assisting a customer

## What This Flow Does Not Cover

This runbook covers only PHIGuard's standard-form agreements.

It does not cover:

- negotiated redlines
- customer paper requiring PHIGuard signature outside the standard in-app flow
- custom order forms
- procurement workflows involving external signature routing

Those cases require a separate legal handling process.
