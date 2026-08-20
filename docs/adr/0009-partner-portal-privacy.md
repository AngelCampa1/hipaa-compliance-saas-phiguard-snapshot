# ADR 0009 - Partner Portal: No Clinic Identifiers or Exact Revenue

## Status: Accepted

## Context

PHIGuard's partner program allows MSPs and referral partners to earn commission by referring small medical clinics. Partners need enough information to track the status of their referrals and confirm that commissions are accruing correctly.

However, MSP partners may also serve competitor clinics or operate in overlapping markets. Exposing clinic names together with revenue figures creates competitive intelligence risk: a partner could infer a clinic's budget, growth rate, or vendor spend.

## Decision

Partners see referral count, status, and lifetime value rounded to the nearest $100. Clinic names are replaced with sequential identifiers ("Clinic #1", "Clinic #2") ordered by signup date.

Exact LTV figures and clinic names are only visible to PHIGuard staff in the admin payout view.

## Rationale

- Clinic names + exact LTV together could reveal competitive intelligence about clinic size or spending to MSP partners who also serve competitor clinics.
- Rounded LTV (nearest $100) is sufficient for partners to verify that commissions are accumulating without exposing precise revenue data.
- Sequential identifiers preserve referral tracking transparency without leaking clinic identity.
- This approach avoids any potential PHI exposure: clinic names are not PHI, but combining them with billing data creates indirect disclosure risk.

## Consequences

- Partners cannot audit exact LTV figures; they receive approximate values.
- If a partner disputes a commission calculation, PHIGuard staff must resolve the discrepancy using the admin view.
- The privacy model must be documented in the partner agreement.
