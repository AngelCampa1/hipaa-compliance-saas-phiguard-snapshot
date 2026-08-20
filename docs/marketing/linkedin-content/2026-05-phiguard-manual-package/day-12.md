# PHIGuard LinkedIn Manual Package - Day 12

Date: 2026-05-17
Day theme: AI tools, cloud services, subprocessors, and cautious vendor review for PHI-adjacent work

## Post 01

scheduled_at: 2026-05-17 04:05 CST
pillar: HIPAA basics
cta_type: discussion
review_status: approved

needs_review: []

post: |
  The first AI question in a clinic is not "Which tool is best?"

  It is "What are we about to put into it?"

  A prompt can look harmless and still carry PHI. A staff member might remove the patient's name but leave a date of service, diagnosis, medication, location detail, account number, appointment context, or enough surrounding facts to connect the text back to one person.

  That matters because AI use is often informal. A coordinator wants help rewriting a message. A biller wants help explaining a denial. A clinician wants a draft. The work feels administrative, but the details may still be patient-linked.

  A safer clinic habit starts before vendor review:

  Classify the prompt.

  Does it include patient identifiers? Does it include clinical context tied to a person? Does it include a file, screenshot, transcript, spreadsheet, or note that came from patient care?

  If yes, treat the content as PHI until proven otherwise. Do not rely on "I took out the name" as the test.

  Operational takeaway: add one line to your AI policy and training: "Before using any AI tool, decide whether the prompt, upload, transcript, or output contains PHI." That small pause prevents a lot of downstream cleanup.

  What prompt detail do you think staff most often underestimate?

## Post 02

scheduled_at: 2026-05-17 04:59 CST
pillar: BAA/vendor management
cta_type: checklist
review_status: approved

needs_review: []

post: |
  An old BAA does not automatically answer a new AI question.

  This is a common clinic problem: the clinic already has a BAA with an EHR, billing, scheduling, or documentation vendor. Then the vendor adds an AI feature. Staff enable it because the vendor is already approved.

  The missing step is verifying whether the current agreement actually covers that AI processing.

  Before turning on an AI feature that may touch PHI, ask the vendor in writing:

  1. Does the current BAA cover this specific AI feature?
  2. Does the feature transmit PHI to a third-party AI provider?
  3. Who are the AI subprocessors?
  4. Are those subprocessors covered by downstream BAAs?
  5. Is PHI used for model training, fine-tuning, evaluation, or improvement?
  6. How long are prompts, transcripts, outputs, logs, and embeddings retained?
  7. Can the feature be disabled by role or user?

  The goal is not to block useful tools. The goal is to avoid discovering the data path after patient information has already moved through it.

  Operational takeaway: treat every newly enabled AI feature as a vendor-change review, even when the vendor itself is already in your BAA register.

## Post 03

scheduled_at: 2026-05-17 06:18 CST
pillar: Generic tool alternatives/comparisons
cta_type: none
review_status: approved

needs_review: []

post: |
  Consumer AI tools are built for convenience, not clinic governance.

  That does not make them useless. It makes the boundary important.

  A clinic may use non-BAA tools for truly non-PHI work: drafting a generic staff memo, summarizing public guidance, formatting a training outline, or rewriting a policy paragraph that contains no patient information.

  But the moment the task includes patient-adjacent detail, the risk changes. A patient name is obvious. A diagnosis plus appointment date can be enough. A billing question with an account number is enough. A screenshot from the EHR is enough. A transcript, chart note, denial letter, message thread, or spreadsheet can carry PHI even if the staff member thinks of it as "background."

  The clean alternative is not "ban every AI tool forever."

  The clean alternative is an Approved Tools Registry:

  Tool name.
  Vendor.
  BAA status.
  BAA date.
  Permitted uses.
  Prohibited uses.
  Evidence location.

  Then train staff on one practical rule: if the tool is not on the registry, do not use it for work-related patient information.

  Operational takeaway: do not make staff guess which AI tools are safe. Publish the approved list, the allowed use cases, and the examples that are off limits.

## Post 04

scheduled_at: 2026-05-17 07:12 CST
pillar: PHI-safe task management
cta_type: soft_product
review_status: approved

needs_review: []

post: |
  AI review work should not live in a private inbox.

  A cautious clinic review creates a trail:

  Who requested the tool?
  What workflow would use it?
  Would PHI enter prompts, uploads, transcripts, outputs, logs, or embeddings?
  Is a BAA available for the exact tier and feature?
  Which subprocessors may touch PHI?
  What training-data restrictions exist?
  Who approved or rejected the use?
  When should the review happen again?

  If those answers are scattered across emails, attachments, chat messages, and a spreadsheet, the clinic may have done the work but struggle to prove the work.

  PHI-safe task management is different from generic task management because the task itself is part of the compliance record. The title should not expose PHI. The attachments need appropriate handling. The ownership, timestamps, review notes, and decision history should be retained.

  PHIGuard is built for small clinic HIPAA operations with recurring tasks, evidence handling, vendor BAA tracking, and append-only audit history. BAA coverage is included on public plans.

  Operational takeaway: make "AI tool review" a repeatable task template with evidence fields, not a one-off email chain.

## Post 05

scheduled_at: 2026-05-17 08:06 CST
pillar: Workforce training and access control
cta_type: resource_link
review_status: approved

needs_review: []

post: |
  The AI policy your staff can follow is usually shorter than the AI policy your lawyer can write.

  Clinics need both kinds of thinking, but workforce training has to be operational.

  Staff should know:

  Do not enter PHI into any AI tool that is not approved.

  Do not upload patient documents, screenshots, transcripts, billing files, or chart notes unless the tool is approved for that exact use.

  Do not use a personal AI account for patient-related work.

  Do not expand an approved tool beyond its documented permitted uses.

  Report suspected AI-related PHI exposure quickly, without deleting or cleaning up the evidence.

  The access-control piece matters too. Some AI features should be available only to certain roles. If a tool cannot be limited by user or role, that limitation belongs in the review record before approval.

  A policy is not real until staff can repeat the rule under pressure.

  Operational takeaway: turn your AI use policy into a 10-minute onboarding drill. Show three examples and ask staff to decide: approved, prohibited, or ask the Privacy Officer.

## Post 06

scheduled_at: 2026-05-17 09:00 CST
pillar: Risk analysis and audit readiness
cta_type: checklist
review_status: approved

needs_review: []

post: |
  A useful AI tool can still fail a HIPAA vendor review.

  That is not a philosophical problem. It is a risk analysis problem.

  Before PHI goes into an AI tool, the clinic should be able to document the basics:

  BAA availability and scope.
  Pricing tier where the BAA applies.
  Whether inputs are used for model training.
  Whether the no-training commitment is contractual.
  Data residency.
  Security certifications and whether they cover the product being used.
  Subprocessor disclosure.
  Retention and deletion terms.
  Incident notification procedures.

  Some answers should stop PHI use completely. The source checklist names absolute disqualifiers such as no BAA available on the clinic's pricing tier, training on inputs that cannot be contractually waived, and data processed or stored outside the U.S. without contractual restriction.

  The point is to decide before the tool becomes part of daily work. Once staff rely on it, removing it gets politically harder and operationally messier.

  Operational takeaway: score AI tools before pilot use, not after a staff member has built a habit around them.

## Post 07

scheduled_at: 2026-05-17 10:19 CST
pillar: Incident response
cta_type: discussion
review_status: approved

needs_review: []

post: |
  "I pasted it into an AI tool" is not a confession to punish first.

  It is an incident report to preserve.

  If staff fear the response, they may delete the chat, close the tab, rewrite the facts, or wait until the details are fuzzy. That makes the clinic's job harder.

  A better AI incident instruction is plain:

  Stop using the tool.
  Report the event to the Privacy Officer.
  Preserve what was entered, when it happened, and which tool or account was used.
  Do not delete prompts, outputs, files, screenshots, or browser history unless instructed.
  Document whether the tool was approved, whether a BAA existed, and whether the use matched the approved use case.

  The Privacy Officer can then assess whether PHI was involved, whether the vendor relationship was covered, what retention or training terms apply, and whether a breach risk assessment is needed.

  The first staff member does not need to solve all of that. They need to report quickly and keep the facts intact.

  Operational takeaway: add AI-tool misuse to your incident reporting examples. Staff should know it belongs in the same reporting channel as misdirected faxes, lost devices, and unauthorized access.

  How would your clinic want this reported on a busy Tuesday afternoon?

## Post 08

scheduled_at: 2026-05-17 11:13 CST
pillar: BAA/vendor management
cta_type: checklist
review_status: approved

needs_review: []

post: |
  A standard BAA is the floor for an AI vendor, not the finish line.

  The usual HIPAA terms still matter: permitted uses, safeguards, breach reporting, subcontractor flow-down, termination, HHS access, return or destruction of PHI.

  But AI vendors add questions that a normal SaaS BAA may not answer:

  Can PHI be used to train, fine-tune, evaluate, or improve a model?

  Does the vendor send prompts to a foundation model provider?

  If yes, is that provider covered by a downstream BAA and the correct enterprise or BAA-covered endpoint?

  How long are prompts and outputs retained?

  Are outputs that contain PHI treated with the same safeguards as inputs?

  Are embeddings or vector stores in scope?

  Can human reviewers see PHI?

  What happens to prompts, outputs, embeddings, and fine-tuned artifacts at termination?

  The dangerous sentence is "our standard BAA covers the service." Maybe it does. Maybe it does not. For AI use, ask for the specifics in writing.

  Operational takeaway: keep an AI addendum checklist beside your standard BAA checklist. The old terms are necessary, but they do not answer every AI data lifecycle question.

## Post 09

scheduled_at: 2026-05-17 12:07 CST
pillar: HIPAA basics
cta_type: none
review_status: approved

needs_review: []

post: |
  Cloud storage is not HIPAA-safe because the logo is familiar.

  The HIPAA question is more specific:

  Is there a signed BAA?

  Does it cover the exact service, product, tier, and use case?

  Are the services receiving PHI on the eligible or covered list?

  Is the clinic or vendor configuring access, encryption, logs, regions, and retention correctly?

  HHS guidance treats a cloud service provider that stores or processes PHI on behalf of a covered entity as a business associate, even when the provider stores encrypted data and does not view the contents. Storage still counts.

  The common mistake is treating the parent vendor as one big green check. "We use a major cloud provider" is not the same as "the specific storage service handling PHI is covered by a BAA and configured correctly."

  This gets even more important when cloud storage connects to AI features. Files, transcripts, logs, and outputs may move through more than one service.

  Operational takeaway: before PHI goes into cloud storage, record the signed BAA, covered service name, tier, region, access logging, and retention plan. If you cannot name the exact service, the review is not done.

## Post 10

scheduled_at: 2026-05-17 13:01 CST
pillar: Generic tool alternatives/comparisons
cta_type: checklist
review_status: approved

needs_review: []

post: |
  "Runs on legacy cloud provider" is not a HIPAA control.

  Neither is "hosted on Azure."

  Neither is "built on Google Cloud."

  Cloud provider BAAs are important, but they cover the infrastructure layer and only the services in scope. The application running on top still needs its own safeguards, access controls, audit logs, encryption configuration, and BAA with the clinic.

  This is the shared responsibility problem in plain language:

  The cloud provider secures the infrastructure.

  The vendor or clinic secures what it builds and how it configures the service.

  A storage bucket, database, log pipeline, or AI add-on can still be misconfigured. A vendor can still use a service outside the eligible list. A marketplace or third-party add-on can still fall outside the cloud provider's BAA.

  So when a software vendor says, "We run on a major cloud provider," that should begin the review, not end it.

  Ask:

  Do you have a BAA with us?
  Do you have a BAA with your cloud provider?
  Which cloud services process PHI?
  Are those services covered?
  How are access, logs, encryption, and backups configured?

  Operational takeaway: evaluate the vendor application and the cloud layer separately. A strong cloud provider does not automatically make the vendor's workflow safe.

## Post 11

scheduled_at: 2026-05-17 14:20 CST
pillar: PHI-safe task management
cta_type: soft_product
review_status: approved

needs_review: []

post: |
  Subprocessor review is where vendor management becomes a follow-up problem.

  The first vendor signs the BAA. Then that vendor uses cloud hosting, email delivery, support tools, monitoring, analytics, AI services, vector databases, or human review vendors.

  Some of those subprocessors may touch PHI. Some may not. The clinic needs a way to track the distinction.

  A practical subprocessor task should capture:

  The vendor.
  The subprocessor list requested.
  The date received.
  Which subprocessors may handle PHI.
  Whether downstream BAA coverage was confirmed.
  Whether AI services are involved.
  Whether the vendor commits to notifying the clinic when subprocessors change.
  The next review date.

  This is exactly the kind of work that gets lost when vendor management lives in a static spreadsheet. A spreadsheet can hold the list. It does not naturally assign the follow-up, preserve review history, or connect the decision to evidence.

  PHIGuard is designed to support vendor BAA tracking, recurring compliance tasks, evidence handling, and audit history for small clinic operations.

  Operational takeaway: every vendor with PHI access should have a repeatable subprocessor review task, not just a one-time onboarding checkbox.

## Post 12

scheduled_at: 2026-05-17 15:14 CST
pillar: Workforce training and access control
cta_type: discussion
review_status: approved

needs_review: []

post: |
  Role-level AI controls are not a nice-to-have in a clinic.

  They are part of the review.

  Some AI features produce outputs derived from PHI. Some summarize patient records. Some draft messages. Some listen to encounters. Some analyze billing or coding context.

  Not every workforce member should have the same access to those features just because the vendor turned them on globally.

  During review, ask whether the AI feature can be disabled by user, role, department, or location. If the vendor only supports account-level on/off, document that limitation and decide whether the workflow still fits your access-control expectations.

  Then train staff on permitted use by role. "The tool is approved" is too broad. Approved for whom? Approved for what task? Approved with what data? Approved under which account?

  This is where the Approved Tools Registry earns its keep. It should say what a tool may be used for and what it may not be used for.

  Operational takeaway: when approving an AI tool, write the access rule in the same record as the BAA evidence. Do not let enablement drift faster than workforce training.

  Where do role-based AI permissions usually get decided in your clinic: compliance, IT, operations, or vendor defaults?

## Post 13

scheduled_at: 2026-05-17 16:08 CST
pillar: Risk analysis and audit readiness
cta_type: resource_link
review_status: approved

needs_review: []

post: |
  AI review evidence should be boring.

  That is a compliment.

  A reviewer should be able to open the vendor file and see a plain record:

  The tool requested.
  The workflow it supports.
  Whether PHI is expected.
  The BAA or reason a BAA is not required.
  The pricing tier reviewed.
  Training-data policy.
  Subprocessor list.
  Retention and deletion terms.
  Incident notification timeline.
  Approval decision.
  Owner.
  Review date.

  The weak version is a confident Slack message that says, "Vendor says they support healthcare use."

  The stronger version is evidence: signed agreement, dated review notes, vendor answers, and a clear permitted-use decision.

  AI tools evolve quickly. A vendor review from last year may not reflect a new model provider, new logging behavior, new feature, or changed subprocessor list. That is why audit readiness depends on review cadence, not one-time approval.

  Operational takeaway: create a renewal trigger for every approved AI tool. Review the BAA scope, training policy, retention terms, and subprocessors before the old evidence gets stale.

## Post 14

scheduled_at: 2026-05-17 17:02 CST
pillar: Incident response
cta_type: none
review_status: approved

needs_review: []

post: |
  A subprocessor breach can still land on your clinic's desk.

  Your clinic may not have a direct contract with the downstream AI provider, cloud host, support platform, monitoring tool, or storage service. But if that subprocessor handled your patients' PHI through your vendor's product, the incident can still affect your patients and your response timeline.

  That is why subprocessor review is not just procurement paperwork.

  During an incident, you may need to know:

  Which vendor reported the event?
  Which subprocessor was involved?
  Did that subprocessor handle PHI?
  What did the primary vendor's BAA require for notice?
  What logs, forensic details, or containment evidence can the vendor provide?
  Did the subprocessor relationship have downstream BAA coverage?
  What patient population or records may be affected?

  If the subprocessor list has never been requested, the clinic starts the incident with less visibility than it needs.

  Operational takeaway: keep current subprocessor lists in vendor files before an incident. Vendor incident response gets slower when the first task is figuring out who else was in the data path.

## Post 15

scheduled_at: 2026-05-17 18:21 CST
pillar: BAA/vendor management
cta_type: checklist
review_status: approved

needs_review: []

post: |
  The cloud storage checklist gets more important when AI enters the workflow.

  Why?

  Because AI work often creates extra places where PHI can land:

  Uploaded files.
  Temporary transcripts.
  Prompt logs.
  Model outputs.
  Debug logs.
  Embeddings.
  Backups.
  Support tickets.

  Each location needs the same boring questions answered: is it covered by a BAA, is the service in scope, who can access it, how long is it retained, where is it stored, what logs exist, and what happens at termination?

  A vendor's AI feature may sit on top of ordinary cloud storage. The clinic may never see that bucket, container, database, log store, or backup system directly. But the vendor should be able to explain how PHI is protected across the full path.

  Be cautious with any answer that only talks about the primary app and skips storage, logs, subprocessors, or deletion.

  Operational takeaway: ask AI vendors to map where PHI can persist after the response is generated. The answer should cover prompts, outputs, logs, embeddings, backups, and deletion.

