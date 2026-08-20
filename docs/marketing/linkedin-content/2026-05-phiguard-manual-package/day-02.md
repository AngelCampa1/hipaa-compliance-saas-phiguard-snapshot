# PHIGuard LinkedIn Company Posts - Day 02

## Post 01

date: 2026-05-07
suggested_time_cst: 04:25
post_number: 01
pillar: HIPAA basics
source_url_or_repo_path: apps/marketing/src/content/learn/hipaa-basics/what-is-phi.md
cta_type: discussion
review_status: approved
quality_notes: Opens the day with the core practical definition of PHI and applies it to ordinary clinic task titles without giving legal advice.
post_text: |
  A task title can become PHI before anyone opens the task.

  That is the part many clinic teams miss.

  PHI is not limited to a chart note, lab result, scanned form, or billing file. In everyday operations, it appears when an identifier is connected to health, treatment, or payment context.

  A task title like "Call patient about appointment" may be generic.

  A task title that names a patient and mentions biopsy results does something different. It identifies a person and reveals care context. That title may then appear in a dashboard, email notification, mobile preview, calendar sync, or exported task list.

  The risk was not created by a dramatic failure. It was created by ordinary work moving too quickly through a tool that treats clinic context like generic project context.

  A practical operating rule for small clinics:

  If staff can identify the patient and infer health, treatment, or payment information from the workflow item, handle the item as PHI.

  That rule helps front desk, billing, clinical support, and administrators make faster decisions without debating every edge case after the information has already spread.

  The question is not "Is this in the EHR?"

  The better question is "Could this operational record identify a patient and say something about their care?"

  Where does PHI most often show up outside the chart in your clinic: task titles, comments, spreadsheets, email, voicemail, or vendor support threads?

## Post 02

date: 2026-05-07
suggested_time_cst: 05:19
post_number: 02
pillar: PHI-safe task management
source_url_or_repo_path: apps/marketing/src/content/learn/phi-workflows/phi-in-task-comments-and-notifications.md
cta_type: checklist
review_status: approved
quality_notes: Focuses on comment and notification behavior, with a concise operational checklist clinics can use immediately.
post_text: |
  Task comments are where PHI gets verbose.

  Titles are short. Assignments are usually structured. But comments invite staff to explain the whole situation:

  "Patient called again."
  "Authorization denied."
  "Needs follow-up after results."
  "Please call before procedure."

  Add a name, date, diagnosis, payer issue, or treatment detail, and the comment may now carry PHI. Then the task system may push that comment into an email, a mobile preview, a Slack-style notification, or a daily digest.

  That is why comments and notifications are often riskier than the task list itself.

  A better review checklist:

  1. Does the comment include more patient detail than the assignee needs?
  2. Will the full comment appear in email or mobile previews?
  3. Are people watching the task who do not need patient-linked context?
  4. Is the sensitive detail stored in a controlled record, or scattered through updates?
  5. Can the clinic later show who saw, changed, or completed the work?

  Training matters, but tool behavior matters too. Staff are more likely to follow the minimum necessary standard when the system makes concise updates and deliberate access the normal path.

  The goal is not silent tasks. The goal is tasks that coordinate work without casually redistributing patient context.

## Post 03

date: 2026-05-07
suggested_time_cst: 06:13
post_number: 03
pillar: BAA/vendor management
source_url_or_repo_path: apps/marketing/src/content/learn/vendor-management/when-a-vendor-needs-a-baa.md
cta_type: checklist
review_status: approved
quality_notes: Reframes BAA review around function and workflow, especially operational metadata and everyday tools.
post_text: |
  The BAA question should happen before the pilot, not after the spreadsheet is full.

  Small clinics often ask, "Is this a healthcare tool?"

  The better question is, "Will this vendor create, receive, maintain, or transmit PHI for us while providing the service?"

  That shift matters because many PHI workflows do not look clinical at first.

  A task tool may hold patient-linked follow-up.
  A spreadsheet app may track prior authorization status.
  A support desk may receive screenshots with patient names.
  A transcription tool may process voicemail or visit context.
  An AI tool may receive prompts copied from operational notes.

  The vendor category is less important than the actual workflow.

  A practical vendor intake check:

  - What patient-linked data will enter the tool?
  - Is the vendor handling that data on the clinic's behalf?
  - Is a BAA required before use?
  - Which exact services, features, or workspaces are covered?
  - Who owns renewal, review, and proof of execution?

  A BAA alone does not make a messy workflow safe. But when PHI is involved, skipping the BAA question creates a weak foundation before the operational risk even begins.

  Treat vendor review as part of workflow design, not procurement paperwork.

## Post 04

date: 2026-05-07
suggested_time_cst: 07:07
post_number: 04
pillar: Risk analysis and audit readiness
source_url_or_repo_path: apps/marketing/src/content/learn/compliance-operations/hipaa-evidence-retention-audit-readiness.md
cta_type: discussion
review_status: approved
quality_notes: Connects the day theme to evidence retrieval, making audit readiness concrete for office managers.
post_text: |
  Many clinics do the compliance work and still cannot prove it calmly.

  The training happened. The vendor was reviewed. The access issue was fixed. The incident was triaged. The policy was updated.

  But the evidence lives in an inbox, a spreadsheet, a shared drive, an old employee's desktop folder, and one manager's memory.

  That is not only inconvenient. It weakens audit readiness.

  HIPAA documentation retention is often discussed as a legal requirement, but in day-to-day clinic operations it is a retrieval problem. Can the clinic find the record that shows what happened, who owned it, when it was completed, and what evidence supported the decision?

  The strongest habit is simple:

  Keep evidence attached to the work it proves.

  If an access review is completed, keep the approval and completion note with the access review record.

  If a vendor BAA is signed, keep the agreement and next review date with the vendor record.

  If an incident is investigated, keep the timeline, four-factor assessment, and mitigation evidence with the incident record.

  A folder can store documents. It usually cannot explain the operational story.

  Audit readiness improves fastest when the clinic stops separating the task from the proof.

  If someone asked for one compliance record this week, which one would take your team the longest to assemble?

## Post 05

date: 2026-05-07
suggested_time_cst: 08:01
post_number: 05
pillar: Workforce training and access control
source_url_or_repo_path: apps/marketing/src/content/learn/workforce-training/access-by-role-front-desk-vs-clinical.md
cta_type: resource_link
review_status: approved
quality_notes: Applies minimum necessary to access by role and highlights the everyday shortcut of copied permissions.
post_text: |
  "Just copy her permissions" is one of the most expensive shortcuts in a small clinic.

  It is fast during onboarding. It feels harmless. It gets the new staff member working.

  It can also turn one person's broad access into the default for the next ten hires.

  The HIPAA minimum necessary standard applies to workforce access. Front desk, clinical support, billing, providers, and practice administrators do not all need the same view of PHI.

  Common access drift looks like this:

  - front desk staff can open full clinical notes they do not need for scheduling
  - billing staff can browse records beyond claim support
  - temporary coverage access never gets removed
  - implementation super-user roles become permanent roles
  - shared credentials make later review impossible

  The fix starts with a role access matrix.

  For each role, document which systems they use, what access level is authorized, who approved it, and when it was last reviewed. New hire access should come from the matrix, not from the nearest similar employee.

  The matrix does not need to be complicated. It needs to be current, reviewed, and connected to actual job duties.

  Access control is not only an IT setting. It is a workforce training issue, a minimum necessary issue, and an audit evidence issue.

  A good first step: pull one user access report and ask whether each permission still matches the person's job today.

## Post 06

date: 2026-05-07
suggested_time_cst: 08:55
post_number: 06
pillar: Incident response
source_url_or_repo_path: apps/marketing/src/content/learn/incident-response/hipaa-incident-examples-small-clinics.md
cta_type: checklist
review_status: approved
quality_notes: Uses everyday communication examples without invented patient specifics and reinforces that incidents require documentation even if not breaches.
post_text: |
  A misdirected email is not automatically a reportable breach.

  It is also not something to quietly delete and forget.

  That middle space is where small clinics need a real incident workflow.

  Everyday examples that deserve documentation and triage:

  - an email with patient context sent to the wrong recipient
  - a voicemail that included more detail than intended
  - a spreadsheet shared with a broader group than necessary
  - a former employee account still active after departure
  - a staff member using access for a purpose outside their role
  - a vendor support thread that included patient-linked screenshots

  Not every incident becomes a breach. But every suspected incident needs enough documentation for the Privacy Officer to understand what happened and apply the right analysis.

  A practical first record should capture:

  - date and time discovered
  - who reported it
  - what happened
  - what PHI may have been involved
  - who may have received or accessed it
  - immediate containment steps
  - who owns the next decision

  The worst incident record is the one reconstructed weeks later from memory.

  Train staff to report early. Then make the reporting process calm enough that they actually use it.

## Post 07

date: 2026-05-07
suggested_time_cst: 10:14
post_number: 07
pillar: Generic tool alternatives/comparisons
source_url_or_repo_path: apps/marketing/src/content/guides/google-sheets.md
cta_type: resource_link
review_status: approved
quality_notes: Balanced comparison that avoids blanket claims and frames Sheets risk around copy drift, sharing, and ownership.
post_text: |
  The problem with a clinic spreadsheet usually is not the formula.

  It is the operating model around the spreadsheet.

  Google Sheets can be part of a healthcare workflow only when the clinic has the right Google Workspace HIPAA posture, including the relevant BAA coverage and configuration. But even when the contract question is handled, the workflow question remains.

  Spreadsheets create practical risk through:

  - duplicate copies
  - too many editors
  - patient details added to convenience columns
  - exports with unclear retention
  - broad sharing that outlives the original need
  - no clean owner for recurring follow-up

  A referral tracker, prior authorization list, intake queue, or manual follow-up sheet can start as a temporary aid and quietly become the clinic's accidental PHI database.

  The move is not "ban spreadsheets."

  The move is to recognize the threshold.

  When a spreadsheet repeatedly carries patient identifiers plus care or billing context, and the clinic needs ownership, due dates, auditability, retention, or handoffs, it is no longer just a sheet. It is an operating record.

  At that point, another tab usually makes the problem harder to prove later.

  Review the workflow, the BAA status, the sharing model, and the evidence path before the sheet becomes the system everyone depends on.

## Post 08

date: 2026-05-07
suggested_time_cst: 11:08
post_number: 08
pillar: HIPAA basics
source_url_or_repo_path: apps/marketing/src/content/learn/hipaa-basics/minimum-necessary-standard.md
cta_type: checklist
review_status: approved
quality_notes: Gives a practical minimum necessary framing for notifications, exports, comments, and shared views.
post_text: |
  Minimum necessary is a workflow design rule.

  It is not just a policy sentence in the HIPAA binder.

  In daily clinic work, minimum necessary shows up in small design choices:

  - what appears in a notification preview
  - who can open a patient-linked task
  - whether a spreadsheet tab is shared with everyone or only the people who need it
  - how much detail staff put in comments
  - whether exports include fields that are not needed for the job

  The standard does not mean zero disclosure. Clinics have to use and share information to do the work.

  The question is whether the use, access, or disclosure is broader than the task reasonably requires.

  A useful review prompt:

  "What is the smallest amount of patient-linked information this person needs to complete this step?"

  Then ask the follow-up:

  "Does our tool expose more than that by default?"

  That second question is where many small clinics find the real issue. The staff member may only need a reminder to call back, but the notification includes the full patient context. The billing reviewer may only need claim information, but the shared view includes clinical notes. The manager may only need status, but the spreadsheet contains every detail.

  Minimum necessary becomes practical when permissions, comments, notifications, and exports all respect the actual job.

## Post 09

date: 2026-05-07
suggested_time_cst: 12:02
post_number: 09
pillar: PHI-safe task management
source_url_or_repo_path: apps/marketing/src/content/learn/compliance-operations/how-to-operationalize-hipaa-tasks-without-spreadsheets.md
cta_type: soft_product
review_status: approved
quality_notes: Product-adjacent but restrained; contrasts spreadsheet inventories with operating records and uses allowed PHIGuard positioning.
post_text: |
  A spreadsheet can list HIPAA work. It is weaker at running HIPAA work.

  That difference becomes obvious when a clinic asks:

  Who owns this item?
  When is it due again?
  Where is the evidence?
  Who changed the status?
  What happened while the owner was out?
  Which open items are overdue?

  Many small clinics run compliance through a pattern that looks reasonable from far away:

  One spreadsheet for training.
  One for vendor BAAs.
  One for incidents.
  One for access review.
  One for policy acknowledgements.

  Then the real workflow happens in email, hallway reminders, chat messages, and a manager's memory.

  The safer operating record has a few non-negotiables:

  - assigned owner
  - due date
  - status history
  - evidence attached to the task
  - recurring review where appropriate
  - controlled visibility when PHI may appear

  PHIGuard is built around that kind of clinic compliance work: recurring HIPAA tasks, incident tracking, evidence handling, and append-only audit history, with a BAA details from PHIGuard source material.

  The goal is not to make clinic teams love task software.

  The goal is to make compliance work less dependent on memory, side files, and fragile handoffs.

## Post 10

date: 2026-05-07
suggested_time_cst: 12:56
post_number: 10
pillar: BAA/vendor management
source_url_or_repo_path: apps/marketing/src/content/learn/compliance-operations/how-small-clinics-track-vendor-baas.md
cta_type: checklist
review_status: approved
quality_notes: Turns vendor BAA tracking into a live operational record rather than a static contract list.
post_text: |
  A BAA tracker that only says "signed" is too thin.

  It may help you find a contract. It will not help you manage vendor risk.

  A clinic's vendor record should answer operational questions:

  - what service does this vendor provide?
  - does the vendor create, receive, maintain, or transmit PHI?
  - is a BAA required?
  - has the agreement been requested, signed, declined, or escalated?
  - where is the executed agreement stored?
  - when was the relationship last reviewed?
  - when is the next review due?
  - who owns follow-up?
  - are there subcontractor or scope questions?

  That last point matters. A tool may start with no PHI and later expand into a patient-linked workflow. A vendor may add a new feature. A clinic may start uploading screenshots, exports, or notes that change the PHI analysis.

  Vendor oversight gets weaker when the BAA list is rebuilt once a year from inbox searches.

  It gets stronger when the vendor inventory is a live operating record with owners, dates, decisions, and supporting documents.

  Preserve "not required" decisions too. A dated note explaining why a vendor does not need a BAA can prevent the same debate every quarter.

  The contract matters. The operating record is what keeps the contract from becoming forgotten paperwork.

## Post 11

date: 2026-05-07
suggested_time_cst: 14:15
post_number: 11
pillar: Workforce training and access control
source_url_or_repo_path: apps/marketing/src/content/learn/workforce-training/remove-access-terminated-employees.md
cta_type: checklist
review_status: approved
quality_notes: Focuses on offboarding as a high-risk handoff and includes concrete access categories without overclaiming deadlines as legal advice.
post_text: |
  Offboarding is a clinic handoff with PHI risk attached.

  When someone leaves, the obvious step is disabling the EHR account. The missed steps are often elsewhere.

  Email.
  Forwarding rules.
  Shared drives.
  Scheduling tools.
  Billing systems.
  eFax platforms.
  Telehealth accounts.
  Remote access.
  Shared passwords.
  Building keys and alarm codes.

  A terminated employee should not retain access to systems that store or transmit PHI. The operational failure is rarely that clinics disagree with this. The failure is that no one owns a complete, timed process.

  A useful offboarding record includes:

  - workforce member name and role
  - last day
  - termination type
  - each system reviewed
  - access removed date and time
  - person who removed access
  - shared passwords changed
  - email forwarding checked
  - physical access collected or disabled
  - final sign-off

  The record matters because it proves execution. "We usually remove access right away" is not the same as showing who removed which access and when.

  Also check the precondition: does your clinic know who has admin credentials for every system that contains PHI?

  If the only person who can remove access is the person leaving, the offboarding problem has already started.

## Post 12

date: 2026-05-07
suggested_time_cst: 15:09
post_number: 12
pillar: Incident response
source_url_or_repo_path: apps/marketing/src/content/learn/incident-response/triage-suspected-hipaa-incidents.md
cta_type: resource_link
review_status: approved
quality_notes: Explains first-24-hour incident triage and preserves evidence without turning into legal advice.
post_text: |
  The first hour after a suspected HIPAA incident should be boring.

  Not casual. Not panicked. Boring in the best operational sense: documented, contained, assigned, preserved.

  When a staff member reports that PHI may have gone to the wrong person or appeared in the wrong system, the clinic should not start by debating whether it is "really a breach."

  Start with triage.

  Document the report as received:

  - who reported it
  - when it was discovered
  - what they observed
  - what system or channel was involved
  - what type of PHI may be involved

  Contain active exposure:

  - revoke credentials
  - stop a transmission if possible
  - retrieve a document if appropriate
  - remove inappropriate sharing

  Preserve evidence:

  - do not delete logs
  - do not destroy emails, fax covers, or source files
  - do not erase the trail to make the situation look cleaner

  Then the Privacy Officer can apply the four-factor assessment with facts instead of folklore.

  Incident response is not only about major breaches. It is about giving small events enough structure that the clinic can make a defensible determination and learn from the pattern.

  The incident record should outlast the adrenaline.

## Post 13

date: 2026-05-07
suggested_time_cst: 16:03
post_number: 13
pillar: Generic tool alternatives/comparisons
source_url_or_repo_path: apps/marketing/src/content/alternatives/airtable-alternative.md
cta_type: soft_product
review_status: approved
quality_notes: Uses repo-sourced Airtable comparison carefully and frames the issue as fit, BAA scope, and auditability.
post_text: |
  Flexible databases are tempting in clinic operations because they can model almost anything.

  That is also the problem.

  A team can build a vendor tracker, incident log, prior authorization queue, onboarding checklist, referral database, or policy review table in a tool like Airtable. The shape looks useful quickly.

  But once those bases contain PHI or patient-adjacent compliance work, the clinic has to solve more than layout.

  It has to solve:

  - BAA eligibility and scope
  - which workspaces or bases are covered
  - who can see patient-linked fields
  - whether notification behavior exposes details
  - how changes are audited
  - how evidence is retained
  - whether pricing and administration fit a small clinic

  PHIGuard's Airtable comparison makes the core point: Airtable can be useful for non-clinical operational data. The harder fit is patient-adjacent compliance operations that need BAA coverage, audit history, PHI-aware task handling, and clinic-specific workflows.

  The decision is not "generic tools are bad."

  The decision is "which records are safe to keep generic?"

  For clinic compliance work that must later be assigned, reviewed, retained, and explained, flexibility is not enough. The operating record needs guardrails.

## Post 14

date: 2026-05-07
suggested_time_cst: 16:57
post_number: 14
pillar: Risk analysis and audit readiness
source_url_or_repo_path: apps/marketing/src/content/learn/hipaa-basics/what-is-an-audit-trail-under-hipaa.md
cta_type: discussion
review_status: approved
quality_notes: Distinguishes system audit logs from operational compliance records, tying the distinction to everyday records.
post_text: |
  An EHR audit log is not the same thing as a compliance program audit trail.

  A clinic needs both.

  System-level audit controls show activity in systems that contain electronic PHI: logins, record access, modifications, exports, prints, failed login attempts, and privileged changes.

  The operational compliance record shows the clinic actually ran the program: training completion, policy acknowledgements, risk analysis work, incident records, vendor BAAs, access reviews, sanctions, and evidence of follow-up.

  The EHR may handle the first category well.

  It will not automatically prove that the clinic trained staff, reviewed access, tracked vendor BAAs, documented incidents, or completed risk follow-up tasks.

  This is why everyday clinic records matter.

  A spreadsheet that can be quietly edited after the fact is weak evidence. A task completed with no history is weak evidence. A policy acknowledgement stored only in one person's inbox is weak evidence.

  Audit-quality records should show:

  - who did the work
  - when it happened
  - what changed
  - what evidence was attached
  - whether later edits are visible
  - who had access to the record

  If your clinic had to respond to a document request, would your records tell the story clearly, or would your team have to reconstruct the story from scattered tools?

## Post 15

date: 2026-05-07
suggested_time_cst: 18:16
post_number: 15
pillar: PHI-safe task management
source_url_or_repo_path: apps/marketing/src/content/learn/phi-workflows/phi-in-email.md
cta_type: soft_product
review_status: approved
quality_notes: Ends the day by connecting email to safer compliance operating records and uses PHIGuard positioning without implying compliance guarantees.
post_text: |
  Email is often the first place a PHI workflow becomes uncontrolled.

  Not because staff are careless.

  Because email is where work goes when the real system has no place for it.

  A patient-linked follow-up starts as one message. Then someone forwards it. A vendor is copied. A subject line gets specific. An attachment stays in the thread. A manager replies with next steps. The inbox becomes the record.

  Email can be used with safeguards, but it is a poor long-term home for rich patient-linked workflow.

  A safer pattern:

  - keep email coordination narrow
  - avoid patient detail in subject lines
  - limit recipients
  - move the actual work into a controlled operating record
  - keep ownership, dates, evidence, and status together
  - preserve an audit history of what happened

  That handoff is the real change: from generic communication to governed work.

  PHIGuard is built for the clinic compliance operations that often spill into email: recurring HIPAA tasks, PHI-aware task handling, incident work, vendor BAA tracking, training records, and evidence handling. Public plans include BAA coverage, and the product is designed around append-only audit history instead of inbox archaeology.

  The inbox can tell you that people talked about the work.

  A safer operating record should show that the work was owned, completed, retained, and reviewable.
