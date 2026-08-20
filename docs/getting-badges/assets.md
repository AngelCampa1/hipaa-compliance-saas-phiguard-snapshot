# Assets

All paths are relative to the repository root.

## Ready Assets

Logo mark:

```text
apps/marketing/public/logo-mark.png
512x512
Use for SaaSHub, AlternativeTo, G2, BetaList, and Product Hunt thumbnail if accepted.
```

Logo mark SVG:

```text
apps/marketing/public/logo-mark.svg
Use when a platform prefers SVG.
```

Horizontal logo:

```text
apps/marketing/public/logo-horizontal.png
910x200
Use for platforms that ask for a wide logo.
```

Horizontal logo SVG:

```text
apps/marketing/public/logo-horizontal.svg
Use when a platform prefers SVG.
```

Public app icon:

```text
apps/marketing/public/apple-touch-icon.png
180x180
Use only if a platform rejects the larger logo mark.
```

Hero product screenshot:

```text
apps/marketing/src/assets/product-dashboard.png
1536x774
```

Dashboard screenshot:

```text
docs/qa/screenshots/02-dashboard.png
1536x774
```

Tasks list:

```text
docs/qa/screenshots/07-tasks-list.png
1536x774
```

Task detail:

```text
docs/qa/screenshots/08-task-detail.png
1536x774
```

Compliance checklist detail:

```text
portfolio/screenshots/qa/compliance-checklist-detail.png
1536x774
Moved here from docs/qa/screenshots/ when the portfolio snapshot was prepared.
```

Compliance program — plan gate, not a dashboard:

```text
docs/qa/screenshots/compliance-program-plan-gate.png
1536x774
Not usable as a product shot. This screen is the upgrade prompt "This feature requires a higher plan", not the compliance programme. It was listed below as a gallery image under the filename compliance-program-dashboard-working.png; that name was wrong about the pixels and has been corrected.
```

Audit log search source:

```text
portfolio/screenshots/qa/audit-log.png
1536x774
Moved and renamed from docs/qa/screenshots/audit-log-search-results.png when the portfolio snapshot was prepared.
Do not upload publicly until a redacted/demo-safe version is generated. The current screenshot can expose internal identifiers and user-agent metadata.
```

## Recommended Upload Set By Platform

SaaSHub:

- `apps/marketing/public/logo-mark.png`
- `apps/marketing/src/assets/product-dashboard.png`
- `docs/qa/screenshots/07-tasks-list.png`
- `docs/qa/screenshots/08-task-detail.png`

AlternativeTo:

- `apps/marketing/public/logo-mark.png`
- `apps/marketing/src/assets/product-dashboard.png`
- `docs/qa/screenshots/02-dashboard.png`
- `docs/qa/screenshots/07-tasks-list.png`
- `docs/qa/screenshots/08-task-detail.png`
- `portfolio/screenshots/qa/compliance-checklist-detail.png`

Product Hunt:

- Thumbnail candidate: `apps/marketing/public/logo-mark.png`
- Gallery source images:
  - `apps/marketing/src/assets/product-dashboard.png`
  - `docs/qa/screenshots/07-tasks-list.png`
  - `docs/qa/screenshots/08-task-detail.png`
  - `portfolio/screenshots/qa/compliance-checklist-detail.png`

G2:

- `apps/marketing/public/logo-mark.png`
- `apps/marketing/public/logo-horizontal.png`
- `apps/marketing/src/assets/product-dashboard.png`
- `docs/qa/screenshots/02-dashboard.png`
- `docs/qa/screenshots/07-tasks-list.png`
- `docs/qa/screenshots/08-task-detail.png`
- `portfolio/screenshots/qa/compliance-checklist-detail.png`

BetaList:

- `apps/marketing/public/logo-mark.png`
- `apps/marketing/src/assets/product-dashboard.png`
- `docs/qa/screenshots/07-tasks-list.png`
- `docs/qa/screenshots/08-task-detail.png`

## Missing Before A Polished Product Hunt Launch

Product Hunt gallery:

```text
Need 2 or more final images at 1270x760.
Recommended: 5 images.
Current source screenshots are 1536x774 and should be placed into purpose-built 1270x760 launch cards.
```

Recommended Product Hunt gallery sequence:

1. `PHIGuard: HIPAA operations for small clinics`
   - Use dashboard screenshot.
   - Message: tasks, evidence, incidents, and audit history in one place.
2. `Know what is due and who owns it`
   - Use tasks list screenshot.
   - Message: recurring HIPAA work with owners and due dates.
3. `Keep evidence tied to the work`
   - Use task detail or checklist screenshot.
   - Message: attachments and proof stay with the task.
4. `Track incidents without ad hoc spreadsheets`
   - Use incident or audit-related screenshot if available.
   - Message: incident records stay visible and reviewable.
5. `Preserve audit history`
   - Use a newly generated redacted/demo-safe audit log screenshot.
   - Message: action history stays connected to clinic operations.

Product Hunt video:

```text
Optional but recommended.
Need a public YouTube demo if using video.
Suggested length: 60 to 90 seconds.
Suggested story: scattered HIPAA work, PHIGuard workflow, tasks/evidence/incidents/audit history, BAA and flat pricing, ask for feedback.
```

## Asset Safety Notes

- Review screenshots for real PHI before upload. Do not upload any screenshot containing real patient names, patient data, clinic secrets, real employee personal data, or production credentials.
- Prefer seeded or demo screenshots.
- If any screenshot is not clearly demo-safe, regenerate it before submission.
- Do not upload `portfolio/screenshots/qa/audit-log.png` (formerly `docs/qa/screenshots/audit-log-search-results.png`) to a third-party directory until it has been redacted or regenerated with safe demo metadata. It carries dev-workspace identifiers and user-agent strings, not PHI. That caution was written for marketing uploads; the snapshot separately decided to publish this image as the README hero after checking it for re-identifiable data.
- Do not add fake customer logos or review badges.
