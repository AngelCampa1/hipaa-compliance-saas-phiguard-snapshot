---
title: "HIPAA Tabletop Exercise Script"
headline: "Three realistic HIPAA incident scenarios your team can run in 90 minutes — with a facilitator guide and after-action template"
description: "A facilitated tabletop exercise script for small medical clinics covering three HIPAA incident scenarios: lost device, misdirected fax, and unauthorized EHR access — with participant roles, discussion questions, and an after-action review template."
metaDescription: "Free HIPAA tabletop exercise script for small clinics. Three realistic incident scenarios, facilitator guide, participant roles, and after-action template."
magnetSlug: "tabletop-exercise-script"
summary: "A complete 90-minute HIPAA tabletop exercise for small clinic teams. Three scenario scripts — lost staff device, fax sent to wrong number, unauthorized EHR access — with facilitator prompts, discussion questions by role, and an after-action review template that turns findings into compliance tasks."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Three scenario scripts: lost clinic device, misdirected fax with patient data, unauthorized EHR access by a former employee"
  - "Facilitator guide — how to run the exercise, timing by section, and how to handle participants who 'know the right answer'"
  - "Participant role assignments — who plays the Privacy Officer, the clinical staff, the front desk, and the administrator"
  - "Discussion questions for each scenario — surface the real gaps in your team's response capability"
  - "After-action template — convert exercise findings into assigned compliance tasks with owners and deadlines"
faq:
  - q: "Who should own the tabletop exercise script?"
    a: "The privacy officer, security officer, or practice administrator should own the tabletop exercise script, with input from the staff who perform the workflow. For PHIGuard customers, the same owner can attach the completed resource to the related compliance task so review history stays visible."
  - q: "How often should we review this resource?"
    a: "Review it at least annually and whenever the underlying workflow, vendor, system, location, or workforce role changes. HIPAA expects policies and safeguards to reflect actual operations, so stale templates are weaker evidence than dated, reviewed records."
  - q: "Does completing this replace legal advice or a full HIPAA risk analysis?"
    a: "No. It is an operational artifact that supports documentation, training, vendor oversight, or safeguard review. Keep it tied to your risk analysis, policies, BAAs, and incident records, and ask counsel to review unusual state-law or contractual questions."
publishedAt: "2026-04-26"
updatedAt: "2026-04-26"
sources:
  - title: "HHS Incident Response Guidance"
    url: "https://www.ecfr.gov/current/title-45/section-164.308"
    publisher: "HHS"
  - title: "45 CFR § 164.308(a)(6) — Security Incident Procedures"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-A/section-164.308"
    publisher: "eCFR"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/pricing"
relatedLearnPath: "/learn/incident-response/triage-suspected-hipaa-incidents"
verificationDate: "2026-04-26"
---

## Why Tabletop Exercises Reveal What Checklists Miss

A HIPAA incident response policy tells your team what to do in theory. A tabletop exercise reveals whether they can do it under the mild pressure of a realistic scenario, before a real incident happens.

The gaps that tabletops surface:
- Staff don't know who the Privacy Officer is or how to reach them after hours
- The incident reporting channel exists in the policy, but staff haven't internalized it
- The 4-factor breach risk assessment is documented somewhere, but no one in the room knows what it is
- The "notify affected individuals within 60 days" rule is known, but the notification process — who drafts it, who approves it, how it gets sent — hasn't been worked out
- PHI access revocation from specific systems takes longer than expected once the scenario makes it concrete

Block 90 minutes. The Privacy Officer or practice administrator runs it. No outside facilitators needed. The only prep required is reading through this script once before the session.

## Facilitator Guide

**Who should attend:** The full team — providers, medical assistants, front desk, billing, and administration. If your clinic is small enough that everyone fits in a break room, run it with everyone. If not, run it with at least one representative from each role.

**Facilitator's job:** Ask the scenario questions and listen to the answers. Resist providing the "right answer" immediately — let the team work through their uncertainty. The discomfort of realizing "I don't know who I'd call" is the signal the exercise is designed to surface.

**When participants say "we'd look it up":** Ask them to look it up now. If they can't find the answer in the room, that's a finding.

**The right-answer trap:** Some staff members — usually the Privacy Officer — will know the textbook answer to every question. Redirect with "that's right, but does everyone else at the table know that And could you execute it at 7pm on a Friday when you're not here?" The exercise measures the team's collective response capability, not one person's knowledge.

**Timing:** Each scenario takes approximately 20-25 minutes. Use the final 15-20 minutes for the after-action discussion.

---

## Scenario 1: The Lost Device

**Setting:** It's Tuesday afternoon. A medical assistant, Alex, is covering the afternoon shift and usually carries a clinic-issued iPad to do rooming documentation. At 3:30 PM, Alex realizes they can't find the iPad. The last time they remember having it was in Exam Room 3 around noon. The iPad is not encrypted. The home screen is password-protected but the password is "1234." The device had patient chart data from today's 14 patient encounters saved in a local cache by the EHR app.

**Read this aloud to start the exercise:**

> "Alex comes to you at 3:30 PM and says: 'I can't find the clinic iPad. I had it in Exam Room 3 this morning but it's not there and I checked the break room, the supply closet, and my car. What do we do?'"

**Discussion questions — work through these in sequence:**

1. Who does Alex report this to first Is that person available right now What's their phone number (Have someone actually look up the number — do they have it?)

2. What's the first thing you do in the next 15 minutes (Expected range of answers: check with the cleaning crew, check lost and found, call patients who were in that exam room, file a police report if theft is suspected, try to remotely wipe the device)

3. Can you remotely wipe this device Who would do that, and how long would it take (Surface the answer: if no MDM is in place, the answer is no — this is a finding)

4. The device hasn't been found after 2 hours. At what point do you treat this as a HIPAA security incident Does that determination change if you find out it was definitely stolen vs. lost?

5. If this is a breach — 14 patients' data was potentially accessed by an unauthorized person — what happens next Who drafts the notification letters When do they go out Who approves them?

6. The incident was caused in part because the device wasn't encrypted. Who is responsible for ensuring clinic devices are encrypted When was the last time someone verified encryption on all clinic devices?

**Findings to flag (common answers that reveal gaps):**
- Staff don't know how to initiate a remote wipe — and the clinic has no MDM
- The device password policy is not enforced (1234 wouldn't pass a reasonable password policy)
- No one in the room knows who drafts breach notification letters
- The 60-day notification clock isn't known

---

## Scenario 2: The Misdirected Fax

**Setting:** It's Friday morning. The front desk receives a call from a dental office that is not affiliated with your clinic. The caller says: "Hi, we received a fax this morning that looks like it was meant for someone else. It has patient records on it — names, diagnoses, medication lists — and a cover sheet addressed to Dr. Chen at your clinic. We didn't request these records. What should we do?"

**Read this aloud:**

> "The front desk picks up and immediately transfers the call to you. It's the dental office across town. They received a fax with 15 patients' records on it — your records. The cover sheet was addressed to you, but the fax number they received it at is not yours. They have the records in hand."

**Discussion questions:**

1. What do you tell the dental office right now, in this phone call (Document the call, ask them to retain but not review further, get a contact name and number)

2. Is this a breach, or is there a way to argue it's not Walk through the 4-factor test. (Factor 2 is potentially favorable — the dental office is a covered entity with its own HIPAA obligations. But this is not automatic — you still need to document the risk assessment)

3. How did this fax go to the wrong number Who will figure that out, and how (Surface the process: pull the sent-fax log, identify which staff member sent it, review the fax number used)

4. What if the dental office tells you they've already reviewed the records — one of their staff read through them because they weren't sure what they'd received Does that change your breach determination?

5. What are your obligations to the 15 patients whose records were disclosed Even for a technical fax error?

6. What policy or process change would prevent this from happening again Does that change need to be written down anywhere?

**Findings to flag:**
- No sent-fax log maintained — you can't reconstruct what happened without it
- No written fax cover sheet policy (double-check fax numbers, use fax cover sheets with confidentiality notices)
- Team doesn't know the 4-factor risk assessment framework

---

## Scenario 3: Unauthorized EHR Access

**Setting:** Monday morning. You're reviewing the EHR's access audit log as part of a routine check and you notice something: a login to the EHR from Saturday afternoon, 4:30 PM. The login is under the credentials of Jordan, a medical assistant who was terminated two weeks ago. Jordan's termination was involuntary — there was a performance dispute. The login accessed 8 patient charts, including two charts for patients Jordan had never treated. The session lasted 22 minutes and included a data export action on one chart.

**Read this aloud:**

> "You're looking at the access log and you see Jordan's credentials used Saturday afternoon — two weeks after Jordan was terminated. The login accessed 8 patient charts. One of those charts has an export logged. Jordan's credentials were supposed to be revoked on the day of termination. What happened and what do you do?"

**Discussion questions:**

1. How did Jordan's credentials still work two weeks after termination Is there an offboarding checklist that was supposed to include credential revocation Was it completed Where is it?

2. Was this access discovered because you were reviewing audit logs, or did you stumble on it How often do you review the EHR access log If the answer is "we don't have a regular schedule for that," that's a finding.

3. What's the immediate first step (Revoke the credentials right now — in the room, during the exercise — have someone pull up the EHR admin console and show how it would be done. If no one knows how, that's a finding)

4. This is a security incident. Is it a breach Work through the 4-factor assessment:
   - What PHI was accessed (Charts, including one with an export)
   - Was Jordan authorized to access these 8 patients (Former employee — no)
   - Did the data get acquired/viewed (Export action on one chart strongly suggests yes)
   - Was there any mitigation (Not much — access persisted for weeks)

5. The affected patients need to be notified if this is a breach. Who are they Can you identify them from the audit log (If the EHR audit log doesn't include patient IDs for each chart accessed, this is a findings — you may not be able to identify affected individuals without manual investigation)

6. What obligation do you have to preserve evidence Can anyone at the clinic preserve the audit log data before it rotates off Who would you call if you needed to preserve evidence and weren't sure how?

**Findings to flag:**
- EHR access not revoked on day of termination — no offboarding checklist in use
- Audit logs reviewed infrequently or not at all — unauthorized access took two weeks to discover
- No clear process for preserving audit log evidence in an investigation

---

## After-Action Review Template

Run this section immediately after the three scenarios while the exercise is fresh. Do not wait until next week.

**General debrief questions:**

1. What surprised you most during this exercise?
2. Which scenario revealed the most significant gap in your team's response capability?
3. What would have gone right if one of these incidents had happened for real?
4. What would have gone wrong?

**Findings log:**

For each gap identified during the exercise, complete one row:

| Finding | Root cause | Owner | Corrective action | Target date |
|---|---|---|---|---|
| EHR credentials not revoked on termination | No offboarding checklist | Privacy Officer | Create and implement offboarding checklist | [2 weeks from today] |
| | | | | |
| | | | | |
| | | | | |

**Exercise documentation:**

Date of exercise: ____  
Facilitator: ____  
Participants: ____  
Scenarios completed: [ ] 1 [ ] 2 [ ] 3  
Total time: ____

**After-action filed in compliance records by:** ____  **Date:** ____

The findings log becomes a task list. Assign each item an owner and a target completion date before the exercise ends. Schedule a 30-day check-in to confirm corrective actions were implemented.

## What PHIGuard Changes

PHIGuard converts the after-action findings log into tracked compliance tasks: assigned, dated, and monitored to completion. The tabletop exercise becomes a documented artifact in your compliance record with the date, participants, and linked corrective actions. When OCR asks for evidence of your security awareness program, the tabletop exercise is evidence — but only if it's documented.
