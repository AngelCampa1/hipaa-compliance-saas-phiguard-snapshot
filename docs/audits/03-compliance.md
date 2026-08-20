# Compliance / Audit / SOC 2 Frontend Audit

## Summary
- Total: 56 (P0: 4, P1: 32, P2: 20)
- Top risk themes:
  - **Stale-state corruption via `window.location.reload()`** - used pervasively (compliance/checklists, policies, program.policies, program.risk, program.training, program.vendors, soc2.access-reviews, etc.) after every mutation. Loses scroll position, form drafts, route search params, success notices, and turns success toasts into invisible flashes. Replace with `router.invalidate()`.
  - **CRUD gaps** - Policies cannot be edited after publish, training records cannot be unassigned, vendors cannot be edited, incidents cannot be edited or reassigned, checklists cannot be archived/deleted from UI, risk assessments cannot be reopened/renamed.
  - **Table affordances missing** - no search/filter/sort/pagination/export on Incidents, Vendors, Training, Risk, SOC2 Controls, Access Reviews, or Evidence tables. Audit page lacks `action` filter and free-text search.
  - **Route confusion** - `/app/compliance/policies` (per-location rollouts) and `/app/compliance/program/policies` (policy catalog) are two surfaces that both call themselves "Policies" with overlapping concepts. No breadcrumb explains the difference.
  - **Form quality** - no dirty-warn / unsaved-changes guard on any of the long-form editors (program.policies create, program.policies $policyId edit, risk item edit, incident new). All textareas allow PHI entry without runtime safeguards beyond a one-line warning.
  - **Loading/error states** - many loaders throw on non-FeatureGate errors with no error boundary; loaders synchronously block the route with no skeleton state shown.

## Findings

### [P0] [BUG] `window.location.reload()` discards transient state across all mutations
**File(s):**
- `apps/web/src/routes/app/compliance/checklists.index.tsx:123`
- `apps/web/src/routes/app/compliance/policies/index.tsx:127,152`
- `apps/web/src/routes/app/compliance/program.policies.tsx:106,121`
- `apps/web/src/routes/app/compliance/program.policies.$policyId.tsx:79`
- `apps/web/src/routes/app/compliance/program.risk.tsx:120,157,170,211,228`
- `apps/web/src/routes/app/compliance/program.training.tsx:163,177,203,246`
- `apps/web/src/routes/app/compliance/program.vendors.tsx:147,170,247`
- `apps/web/src/routes/app/soc2.access-reviews.index.tsx:58`
- `apps/web/src/routes/app/soc2.access-reviews.$reviewId.tsx:76,89`

**Issue:** Every successful mutation calls `window.location.reload()`. This (a) immediately hides the `notice`/`setNotice(...)` success message that was just set, (b) drops the active `?locationId=` search param when the route hasn't synced it (policies/checklists rely on `window.location.assign` for that), (c) breaks `useRouter().invalidate()` semantics already wired in soc2.evidence.tsx (inconsistent pattern), and (d) loses scroll position so users on long pages (Risk, Training tables) lose context after acting on a single row.

**Expected:** Use `router.invalidate()` (TanStack Start pattern already used at `soc2.evidence.tsx:175,268`). Keep the local `notice` visible.

**Fix:** Replace `window.location.reload()` with `await router.invalidate()` and rely on loader rehydration.

---

### [P0] [PHI] Incident summary textarea has no client guard against names/MRNs beyond a banner
**File(s):** `apps/web/src/routes/app/compliance/incidents/new.tsx:243-260`

**Issue:** Only protection from PHI in the freeform `summary` field is the static "Do not include PHI" Alert. The textarea accepts any text up to 2000 chars and is then sent to the server. Practice admins under stress regularly include patient names ("Jane Doe, DOB 1/4/1970…") despite the warning. No regex sanity check, no on-blur warning when a common PHI shape is detected (SSN, MRN-like ID, common name + DOB pattern).

**Expected:** Surface a blocking inline error/preview before submit if obvious PHI shapes are detected (SSN regex, 10-digit DOB, "MRN" token), and require explicit "I've reviewed" checkbox before submit.

**Fix:** Add client-side `detectPhiShape(text)` helper (regex set) and gate submit behind explicit acknowledgement.

---

### [P0] [BUG] Soc2 evidence "Record uploaded evidence key" accepts arbitrary user input
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:400-415`

**Issue:** The form lets users paste any storage key path (placeholder `evidence/org-id/soc2/q2-access-review.pdf`) and submit it via `recordManualEvidenceFn`. Even if the server validates the prefix, this is an attack-surface footgun - an authenticated SOC2 admin could enumerate or claim keys outside their tenant prefix and the UI exposes the prefix shape. Helper text even tells the user how it's constructed.

**Expected:** Remove the manual key field entirely. The presigned upload above it already records the key automatically.

**Fix:** Delete the `fileKey` input + its helper paragraph; require the file upload path for all manual evidence.

---

### [P0] [STATES] Loaders throw on non-FeatureGate errors with no error boundary
**File(s):** Every compliance/soc2 route's `loader`. Examples: `compliance/index.tsx:7-15`, `compliance/program.index.tsx:9-17`, `audit/index.tsx` (no loader, fine), `soc2.index.tsx:9-16`.

**Issue:** Loaders catch only `FeatureGateError`. Any DB error (connection drop, KMS timeout), schema-validation error, or auth-scope mismatch rethrows and bubbles to the nearest router error boundary. There is no `errorComponent` on these routes, so the user gets the default unstyled error fallback with no recovery action ("Try again" / "Return to dashboard").

**Expected:** Every route exports an `errorComponent` that renders a compliance-themed retry UI and logs to product analytics.

**Fix:** Add `errorComponent: ComplianceErrorBoundary` factored once into a shared component.

---

### [P1] [DUPLICATE] Two distinct "Policies" surfaces with overlapping naming
**File(s):**
- `apps/web/src/routes/app/compliance/policies/index.tsx` - per-location policy *rollout* tracking, lists `policies` and `policyAssignments`.
- `apps/web/src/routes/app/compliance/program.policies.tsx` - *catalog* of organization policies with draft/publish lifecycle.

**Issue:** Both render `PageHeader title="Policies"`. The dashboard at `compliance/index.tsx:117` sends "View all" → `/app/compliance/policies`. The empty-state in the per-location view (`compliance/policies/index.tsx:241`) tells the user to "Go to Program → Policies" to actually create one. There is no breadcrumb path, no clear naming distinction in the UI. The data models also overlap: `listPoliciesFn` (legacy) vs `listProgramPoliciesFn` (program addon). This is a significant IA bug.

**Expected:** Either (a) merge the two surfaces, or (b) rename them explicitly ("Policy rollout by location" vs "Policy catalog & publishing") and add explicit cross-links + breadcrumbs.

**Fix:** Pick canonical naming; have one route redirect to the other or absorb its functionality.

---

### [P1] [CRUD] Policies cannot be edited after publish, archived, or version-bumped
**File(s):** `apps/web/src/routes/app/compliance/program.policies.$policyId.tsx:48`

**Issue:** `canEditDraft = canAdmin && policy.status === 'draft'`. Once published, there is no UI to (a) create a new version, (b) archive the policy, (c) republish with a new effective date. The `STATUS_LABELS` map at `program.policies.tsx:37` includes `archived` but no UI surfaces archive. Compliance teams routinely need to retire stale policies and publish v2 - the current model forces deleting via SQL.

**Expected:** Add "Create new version" (forks a draft seeded with current body) and "Archive policy" actions on the published-policy detail page.

**Fix:** Add server fns + UI buttons.

---

### [P1] [CRUD] Vendors cannot be edited after creation
**File(s):** `apps/web/src/routes/app/compliance/program.vendors.tsx:480-595`

**Issue:** Only actions on a vendor row are "Record BAA metadata" and "Mark inactive". Vendor `name`, `website`, `contactEmail`, `dataCategories` are immutable from the UI. Common case: vendor changes contact email or you initially missed a data category. There is also no "Reactivate" affordance for an inactive vendor.

**Expected:** Edit form per vendor row + reactivate action.

---

### [P1] [CRUD] Vendor BAA history cannot be viewed or edited
**File(s):** `apps/web/src/routes/app/compliance/program.vendors.tsx:521-563`

**Issue:** Only `latestBaa` is shown. If a BAA was recorded with wrong `signedAt`/`expiresAt` (common mistake), there is no edit path. Historical BAAs (renewals over the years) are inaccessible from the UI, which defeats the audit trail value.

**Expected:** Expand vendor row to show all BAAs; allow editing metadata of the latest active one.

---

### [P1] [CRUD] Training: no unassign / reassign / due-date edit / certificate replacement
**File(s):** `apps/web/src/routes/app/compliance/program.training.tsx`

**Issue:** Once a training record is assigned, the only action is "Mark complete" or "Download certificate". No way to:
- Cancel an assignment created in error
- Reassign to a different user
- Change due date
- Replace a certificate that was uploaded against the wrong record
- Reopen an erroneously completed training
- Reactivate a deactivated course (line 171-183 is one-way)

**Expected:** Add edit + cancel actions on row, reopen on completed rows, reactivate on courses.

---

### [P1] [CRUD] Incidents cannot be edited
**File(s):** `apps/web/src/routes/app/compliance/incidents/$incidentId.tsx`

**Issue:** Once filed, an incident cannot be edited (title, summary, severity, category, discovered date, affected systems) from the UI. Only status transitions. Real-world incident response involves clarifying the story as investigation progresses; the only path here is to file a new incident. There is also no "add comment / update note" affordance - a single immutable summary with no follow-up notes is too thin for HIPAA breach response documentation.

**Expected:** Allow editing the descriptive fields (with audit trail of changes); add an append-only `incident_updates` notes list.

---

### [P1] [CRUD] Checklists cannot be archived, renamed, or deleted from UI
**File(s):** `apps/web/src/routes/app/compliance/checklists.index.tsx`, `checklists.$checklistId.tsx`

**Issue:** `STATUS_LABELS` includes `archived` (line 39-43) but no action triggers it. There's no rename, no delete, no archive button. Once a starter template is assigned at the wrong location, the checklist sits there forever.

**Expected:** Archive action on detail page; rename action; allow deleting an empty/erroneous checklist.

---

### [P1] [CRUD] Risk assessments cannot be reopened, renamed, or deleted
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:332-365`

**Issue:** Status transitions are one-way (`open → in_review → closed`). Cannot reopen a closed assessment, cannot rename, cannot delete a mistakenly-created one. Risk items are also not editable once the assessment is closed (line 687) - but assessments need to be reopened to record continued mitigation work after audit findings.

**Expected:** Reopen, rename, delete actions on the assessment header.

---

### [P1] [CRUD] Risk items: ownerId reset emits null but UI never shows "Clear owner"
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:206`

**Issue:** `ownerId: editItemForm.ownerId || null` - server accepts clearing, but the select has no "Unassigned" sentinel that's distinct from "no change". Both render the same way. Edit form is also a giant inline expansion that pushes the entire table down (lines 523-676) - terrible UX for long lists.

**Expected:** Move edit to a modal or right-side drawer; expose Clear owner explicitly.

---

### [P1] [TABLE] Audit log: no `action` filter, no free-text search, no resourceId fuzzy match
**File(s):** `apps/web/src/routes/app/audit/index.tsx:48-95`

**Issue:** Filters are `actorId`, `resourceType`, `resourceId`, `dateFrom`, `dateTo`. Missing:
- `action` filter (huge gap - auditors filter by `incident.transition` or `policy.publish` constantly)
- Org-scoped actor *picker* (currently you must paste a UUID; there's no email/name lookup)
- Free-text search across summary
- Resource-type dropdown of known types (free-text invites typos)
- Sort controls - only chronological reverse
- Bulk select / multi-row actions (e.g., export only the selected rows)

**Expected:** Add action picker (enum dropdown), actor email autocomplete, resource-type dropdown sourced from server, and a "Clear filters" button.

---

### [P1] [TABLE] Audit export limited to 30-day default, no scoping by actor/resource/action
**File(s):** `apps/web/src/routes/app/audit/export.tsx:20-46`

**Issue:** Export is date-range only. Filters from the main audit page are NOT propagated. Auditors who searched/found relevant rows must re-discover the criteria for the export. Also: no max-range guard (could DOS), no record-count preview before exporting, no async/email-when-ready fallback for large exports, no warning that CSV may exceed browser blob limits.

**Expected:** Carry forward query filters to the export form; show "estimated N rows" preview; offer async email delivery for >50k rows.

---

### [P1] [STATES] Audit page: no initial load - user must click Search to see anything
**File(s):** `apps/web/src/routes/app/audit/index.tsx:111-269`

**Issue:** The page mounts empty. `events.length === 0` only shows after `loaded` is true (line 196). Until then there is no skeleton, no "Most recent 50 events" default. This is unhelpful - auditors generally want "show me what just happened" by default.

**Expected:** Auto-fetch most-recent page on mount; show skeleton during initial load.

---

### [P1] [BUG] Audit page: `actorId`, `resourceId` UUID validation missing
**File(s):** `apps/web/src/routes/app/audit/index.tsx:128-160`

**Issue:** Inputs accept any string. Typo "abc" returns "no events" with no hint that the input was malformed. Same for `resourceId`.

**Expected:** Client-side UUID format validation with inline hint.

---

### [P1] [TABLE] Incidents: no severity/status/category filter, no search, no export
**File(s):** `apps/web/src/routes/app/compliance/incidents/index.tsx:90-146`

**Issue:** Single flat table. No filter chips for severity (critical/high), no status filter (open vs closed), no category filter, no location filter, no date range, no export, no sort. For an organization with >50 incidents this is unusable.

---

### [P1] [TABLE] Vendors: no filter by BAA state, no search, no sort
**File(s):** `apps/web/src/routes/app/compliance/program.vendors.tsx:468-599`

**Issue:** No way to filter to "Show me expiring BAAs" despite that being the SummaryMetric the page leads with. No vendor name search.

---

### [P1] [TABLE] Training: no filter by status/course/user, no search, no export
**File(s):** `apps/web/src/routes/app/compliance/program.training.tsx:544-640`

**Issue:** Same as above - page leads with "Overdue" metric, has no way to filter table to those rows.

---

### [P1] [TABLE] Risk items: no filter by score/owner, no sort, no export
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:495-712`

**Issue:** Multi-assessment layout means filters per-assessment are awkward, but for the "30 risk items in one assessment" case there's no sort by score or filter by owner.

---

### [P1] [TABLE] SOC 2 evidence: no filter by source, no date range, no sort
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:496-549`

**Issue:** Single flat table. No filter by source (audit-log-derived vs manual upload), no collected-at date range.

---

### [P1] [TABLE] SOC 2 controls: no filter to "missing evidence only", no search
**File(s):** `apps/web/src/routes/app/soc2.controls.tsx:69-102`

**Issue:** Page leads with "Missing evidence" metric but no way to filter the table to those rows.

---

### [P1] [TABLE] Access reviews list: no filter, no sort
**File(s):** `apps/web/src/routes/app/soc2.access-reviews.index.tsx:115-150`

---

### [P1] [STATES] Compliance dashboard: empty-state copy mentions "Program → Policies" but link goes to legacy `/app/compliance/policies`
**File(s):** `apps/web/src/routes/app/compliance/index.tsx:124,134`

**Issue:** Empty state for Policies says "Create your first policy in Program → Policies" but the only link on the panel ("View all", and policy names if any exist) navigates to `/app/compliance/policies` - the rollout view, not the catalog. New users will be stuck.

**Expected:** Link the empty-state CTA to `/app/compliance/program/policies`.

---

### [P1] [FORM] No dirty-warn on long-form editors
**File(s):**
- `apps/web/src/routes/app/compliance/program.policies.tsx:178-246` (create policy)
- `apps/web/src/routes/app/compliance/program.policies.$policyId.tsx:166-234` (edit draft)
- `apps/web/src/routes/app/compliance/program.risk.tsx:367-492` (add risk item)
- `apps/web/src/routes/app/compliance/incidents/new.tsx:130-282`

**Issue:** Multi-paragraph markdown body editors lose all input on accidental nav-away or back-button. No `beforeunload` guard, no router navigation guard.

---

### [P1] [FORM] Policy markdown body has no preview, no syntax help
**File(s):** `apps/web/src/routes/app/compliance/program.policies.tsx:214-224`, `program.policies.$policyId.tsx:202-212`

**Issue:** It's labeled "Body *" with no hint that markdown is the expected format. The MarkdownViewer at `policies/index.tsx:49-55` is actually just a `<pre>` - markdown isn't rendered anywhere. Either render it or stop calling it markdown.

**Fix:** Call it "Body" plainly OR add a real markdown renderer with preview tab.

---

### [P1] [BUG] `MarkdownViewer` in policies/index.tsx pretends to render markdown but is just `<pre>`
**File(s):** `apps/web/src/routes/app/compliance/policies/index.tsx:49-55`

**Issue:** Component name is misleading - pre-formatted text won't render `**bold**`, `# headings`, or lists as markdown. If admins authored richly formatted policies expecting them to render, they will display as raw asterisks/pounds in front of staff.

**Expected:** Either rename to `PolicyBodyPlaintextViewer` or wire up `react-markdown`.

---

### [P1] [FORM] Risk item edit form is inline-expanded inside a table cell
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:523-676`

**Issue:** Massive nested form pushes the rest of the table down and out of view; on small screens the form is squished into one column. Two editable items at once causes scrolling chaos.

**Expected:** Modal or drawer instead.

---

### [P1] [FORM] Risk item form doesn't preview computed score
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:367-492`

**Issue:** Users pick `likelihood` (1-5) and `impact` (1-5) but never see the resulting risk score until after save. Helpful preview: "Score = 12 (high)" updating live.

---

### [P1] [FORM] Incident new form: location select required only when `scope.locations.length > 1` but uses `defaultLocationId ?? ''` initially - single-location orgs implicitly drop locationId
**File(s):** `apps/web/src/routes/app/compliance/incidents/new.tsx:64,135`

**Issue:** For single-location orgs the select is hidden. The state default `locationId = scope.defaultLocationId ?? ''` may resolve to empty string when there's no default location set; the submit handler at line 88 sends `locationId || undefined`. If a single-location org has no `defaultLocationId`, the incident is filed without a location and the user has no idea.

**Expected:** When `scope.locations.length === 1`, force `locationId = scope.locations[0].id` and show a "Reporting for: {Name}" line.

---

### [P1] [FORM] Vendor add: website not validated; data category enum is hard-coded
**File(s):** `apps/web/src/routes/app/compliance/program.vendors.tsx:62-68,335-340`

**Issue:** `VENDOR_DATA_CATEGORY_OPTIONS` is a constant array client-side. Server schema likely has its own enum - drift risk. Also website is `type="url"` so the browser validates, but no preview/normalization (`http://` prefix stripping, lowercase).

---

### [P1] [FORM] BAA expiresAt: no validation that it's after signedAt; no warning when missing
**File(s):** `apps/web/src/routes/app/compliance/program.vendors.tsx:382-454`

**Issue:** User can record a BAA with `signedAt = 2024-01-01` and `expiresAt = 2020-01-01` - no client check. Also, the SummaryMetric "Expiring BAAs" is "Next 60 days" but a BAA with no `expiresAt` shows as `Expires Not set` (line 528) - there's no visible warning that it should have an expiration for proper renewal tracking.

---

### [P1] [FORM] Access review decisions: notes required for revoke/change-role only - no UI hint until button disabled
**File(s):** `apps/web/src/routes/app/soc2.access-reviews.$reviewId.tsx:269-289`

**Issue:** Buttons for Revoke and Change Role are disabled when `!noteText.trim()`, but there is no visible label explaining "Add reviewer notes to enable Revoke/Change". User clicks repeatedly trying to figure out why it's grayed out.

**Expected:** Surface "Notes required for Revoke/Change Role" inline.

---

### [P1] [A11Y] Many `<select>` elements lack visible focus styling beyond default
**File(s):** Most form selects in compliance/* and soc2/* (e.g., `checklists.index.tsx:181`, `risk.tsx:399`, `incidents/new.tsx:50`)

**Issue:** Plain `<select>` with `border border-border-default rounded` does not have brand focus rings consistent with `InputPrimitive`.

---

### [P1] [A11Y] Checklist wizard answer buttons use emoji/symbol-only labels
**File(s):** `apps/web/src/routes/app/compliance/checklists.$checklistId.tsx:250,263,276`

**Issue:** "✓ Yes, it's set up", "✗ Not yet", "? Not sure" rely on prefix glyphs that screen readers may announce inconsistently. The check/x/question prefixes carry meaning.

---

### [P1] [A11Y] Incident detail Badge uses raw status string, no aria-label
**File(s):** `apps/web/src/routes/app/compliance/incidents/$incidentId.tsx:98`

**Issue:** `<Badge>{incident.status}</Badge>` shows e.g. `triaging` with no human label and no `aria-label` describing what it is.

---

### [P1] [A11Y] Risk page Badge mashes score and status with no separator
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:679-681`

**Issue:** `{item.score} {item.status}` renders as "12 high" - screen readers will run them together; sighted users may also misread.

---

### [P1] [BUG] Compliance dashboard: incidents count uses `Promise.all` with `listIncidentsFn({ data: {} })` - empty body but the fn requires a data wrapper
**File(s):** `apps/web/src/routes/app/compliance/index.tsx:10,12`

**Issue:** Pattern is consistent but verbose. Not a bug per se, but `listPoliciesFn()` (line 11) takes no arg while `listIncidentsFn({data:{}})` (line 10) and `listPolicyAssignmentsFn({data:{}})` (line 12) require empty objects. Inconsistent server-fn signature.

---

### [P1] [STATES] Soc2 evidence: download error doesn't reset when user retries
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:72,186-198`

**Issue:** `downloadError` set on failure but cleared only when next download starts. If a user navigates within the page or attempts other actions, the stale download error stays visible above the table.

---

### [P1] [STATES] Soc2 evidence "Bundle ready" success alert never auto-dismisses; downloads are presigned and may expire silently
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:468-482`

**Issue:** The "Download evidence bundle" link from a previous export persists indefinitely. If user clicks it 1 hour later the presigned URL will 403. No expiry indicator.

**Expected:** Show countdown or expiry timestamp; auto-dismiss alert after N minutes.

---

### [P1] [BUG] Access review detail: closing handler reloads, losing the success notice
**File(s):** `apps/web/src/routes/app/soc2.access-reviews.$reviewId.tsx:84-95`

**Issue:** `setNotice('Review closed.')` immediately before `window.location.reload()`. The notice is never seen.

---

### [P1] [BUG] Access review decision: notice references `ROLE_LABELS[targetRoles[itemId]]` before state has flushed
**File(s):** `apps/web/src/routes/app/soc2.access-reviews.$reviewId.tsx:73`

**Issue:** Reads from `targetRoles[itemId]` after submit. If user changed dropdown between click and async resolution, the notice would be inconsistent with the submitted decision. Snapshot the value before the await.

---

### [P1] [NAV] Audit log has no entry from any sidebar or breadcrumb context shown in these files
**File(s):** `apps/web/src/routes/app/audit/index.tsx:111`

**Issue:** Page has no back-link breadcrumb, no parent context. (App-level sidebar may handle nav but no in-page wayfinding exists.)

---

### [P1] [NAV] Soc2 evidence: "Back to SOC 2" link, but no link to the specific control when filtered
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:554-562`

**Issue:** When the page is filtered by `?controlId=CC6.1`, the only nav back is to `/app/soc2` - not to `/app/soc2/controls` where the user came from.

---

### [P1] [INCONSISTENCY] Back-link styles vary across compliance pages
**File(s):**
- `compliance/checklists.index.tsx:134` → `<Link>← Compliance</Link>` (no class for muted)
- `compliance/checklists.$checklistId.tsx:472-480` → `<Link><ArrowLeft /> Checklists</Link>` with hover styles
- `compliance/incidents/index.tsx:57` → text-muted hover-primary
- `compliance/program.index.tsx:163-168` → `BackLink` factored function
- `soc2.evidence.tsx:554-562` → `BackLink` factored function

**Issue:** Each page reinvents the back-link with subtly different markup and styling. Should use a shared `<Breadcrumb>` or `<BackLink>` from `packages/ui`.

---

### [P1] [INCONSISTENCY] Policy "draft/published/archived" badge variants disagree across pages
**File(s):**
- `program.policies.tsx:43-48` - `draft: warning, published: success, archived: default`
- `program.policies.$policyId.tsx:103` - only two-state ternary `published ? 'success' : 'warning'` - archived status would render as warning, which is wrong.

---

### [P1] [INCONSISTENCY] Status capitalization inconsistent
**File(s):**
- `compliance/incidents/$incidentId.tsx:98` - Badge shows raw lowercase `triaging`
- `compliance/incidents/index.tsx:134` - Uses `STATUS_LABELS` map for Title Case
- `compliance/policies/index.tsx:372` - Shows `assignment.status` raw (e.g. `assigned`, `completed`)
- `program.risk.tsx:328` - `assessment.status.replace('_',' ')` raw, e.g. "in review"

**Issue:** No shared status label/badge component; each page does its own thing.

---

### [P1] [CONTENT] Banned-word check: "syncing"/"workflows"/"pipelines" not present in audited files (clean), but "streamline" check confirms - clean.
**File(s):** N/A (grep returned no matches)

**Note:** All audited files pass the brand-voice banned-word check.

---

### [P2] [CONTENT] "Mark contained / Mark resolved / Close incident" copy is fine but inconsistent with the status badges
**File(s):** `apps/web/src/routes/app/compliance/incidents/$incidentId.tsx:25-30`

**Issue:** Button labels are verbs ("Mark contained") but the status badge above shows raw `contained` - slight cognitive load.

---

### [P2] [STATES] Many panels render an Alert immediately above the form ("Read-only access") but it competes for attention with success notices
**File(s):** `compliance/incidents/$incidentId.tsx:102`, `compliance/incidents/new.tsx:125`, `compliance/policies/index.tsx:185-196`

---

### [P2] [STATES] SummaryMetric `tone="brand"` used inconsistently
**File(s):** Across the audit area. e.g., `compliance/index.tsx:51` "Active checklists" uses brand; same metric concept in `checklists.index.tsx:159` also brand - but `program.risk.tsx:265` "Risk items" uses brand for count, while `program.training.tsx:311` "Completed" uses brand. Pattern: brand = "primary count", but inconsistent.

---

### [P2] [INCONSISTENCY] Soc2 controls page uses `Link to="/app/soc2/evidence" search={{ controlId }}` but the manual evidence form sets `selected.controlId` as a hidden input - duplicates a state path
**File(s):** `soc2.controls.tsx:84`, `soc2.evidence.tsx:354-359`

---

### [P2] [INCONSISTENCY] Soc2 evidence page uses raw `<label>`+`<input>` markup, but other pages use `Label` + `InputPrimitive`
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:347-432`

**Issue:** Drifts from the shared design system. Class strings duplicate token usage.

---

### [P2] [DUPLICATE] `formatDate` defined locally in `program.risk.tsx:727` rather than imported from `lib/dates`
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:727-734`

**Issue:** All other files import `formatDate` from `../../../lib/dates`. This local copy will drift.

---

### [P2] [DUPLICATE] `BackLink` reimplemented in `program.policies.tsx`, `program.policies.$policyId.tsx`, `program.risk.tsx`, `program.training.tsx`, `program.vendors.tsx`, `soc2.controls.tsx`, `soc2.auditor.tsx`, `soc2.evidence.tsx`, `soc2.access-reviews.index.tsx`

**Issue:** Same factory function copy-pasted ~9 times. Extract to `packages/ui` or `components/back-link.tsx`.

---

### [P2] [DUPLICATE] `STATUS_LABELS` / `STATUS_BADGE` maps for incidents/policies/training duplicated across files
**File(s):** Each route declares its own constants. Consider centralizing in `packages/compliance`.

---

### [P2] [A11Y] Markdown body panel uses `max-h-150` (custom utility) - verify scroll has visible focus indicator
**File(s):** `compliance/program.policies.$policyId.tsx:241`, `compliance/policies/index.tsx:51`

---

### [P2] [STATES] Risk page: `notice` is never set (only `error`); successful operations give no feedback beyond the page reload
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx`

---

### [P2] [STATES] Risk page: "Send to review" button has no confirmation; immediate state change
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:343-351`

---

### [P2] [STATES] Vendor "Mark inactive" has no confirm dialog
**File(s):** `apps/web/src/routes/app/compliance/program.vendors.tsx:580-591`

**Issue:** Destructive-ish action with one click and no confirm.

---

### [P2] [STATES] Course "Deactivate" has no confirm dialog
**File(s):** `apps/web/src/routes/app/compliance/program.training.tsx:426-437`

---

### [P2] [STATES] Delete risk item button has no confirm
**File(s):** `apps/web/src/routes/app/compliance/program.risk.tsx:697-705`

**Issue:** Single-click delete with no `confirm()` or modal.

---

### [P2] [A11Y] Policies page assignment table: "Reopen"/"Mark complete" toggle button has no aria-pressed state
**File(s):** `apps/web/src/routes/app/compliance/policies/index.tsx:382-405`

---

### [P2] [CONTENT] Soc2 auditor page does NOT use `CATEGORY_LABELS` while soc2.controls.tsx does
**File(s):** `soc2.auditor.tsx:80` vs `soc2.controls.tsx:88`

**Issue:** Auditor view shows raw `CC6` instead of "Logical & Physical Access". Inconsistent.

---

### [P2] [SEO/HEAD] No `<title>` or document.title management visible on these routes
**File(s):** All. (May be handled at root layout, but the audit area where compliance officers spend time arguably benefits from "Audit log - PHIGuard" titles for browser-tab navigation across many tabs.)

---

### [P2] [STATES] Audit page summary metrics computed from in-memory loaded events only
**File(s):** `apps/web/src/routes/app/audit/index.tsx:206-210`

**Issue:** "Events loaded", "Actors", "Resources" reflect only the loaded page(s), not the actual query result set. The labels are honest ("Events loaded") but the "Unique actor IDs" metric will mislead users who think it's the full count.

---

### [P2] [DEAD] `EvidenceScanStatus` formatting helpers duplicated across checklists and training
**File(s):** `compliance/checklists.$checklistId.tsx:32-41`, `compliance/program.training.tsx:55-64`

**Issue:** `isCertificateDownloadable`/`isEvidenceDownloadable` and `certificateStatusLabel`/`evidenceStatusLabel` are near-identical. Extract a shared `useScanStatus` helper.

---

### [P2] [BUG] Soc2 controls Link search prop typing
**File(s):** `apps/web/src/routes/app/soc2.controls.tsx:84`

**Issue:** `search={{ controlId: ctrl.controlId }}` - relies on the evidence route's `validateSearch` schema accepting unknown props in the link's generic - no runtime bug, but TanStack `search` typing may flag.

---

### [P2] [STATES] Per-location filter selects use `window.location.assign` rather than `router.navigate`
**File(s):** `compliance/checklists.index.tsx:175-181`, `compliance/policies/index.tsx:202-209`

**Issue:** Full-page navigation to apply a filter - loses any in-progress form state. Should use `router.navigate({ search })`.

---

### [P2] [CONTENT] BAA evidence helper text mentions "your organization's SOC 2 evidence prefix"
**File(s):** `apps/web/src/routes/app/soc2.evidence.tsx:411-415`

**Issue:** Leaks internal storage architecture to end users. Plain-English copy would say "files previously uploaded for this organization" without exposing prefixes.

---

## Notes (not findings)

- No `docuseal`, `console.log`, `TODO`, `FIXME`, `PLACEHOLDER`, or banned marketing jargon found in the audited files.
- `packages/compliance/src` was scanned only at the file-tree level (program/, soc2/) - no UI lives there, and no PHI-display surface is exposed. Findings above focus on the frontend per the assignment.
- `audit_events` UI correctly shows no edit/delete affordances - append-only invariant respected at the UI layer.
- The wizard mode in `checklists.$checklistId.tsx` is well-designed and a high-quality surface; most findings target tables, mutation flows, and forms elsewhere.
