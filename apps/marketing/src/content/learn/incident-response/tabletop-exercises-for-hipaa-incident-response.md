---
title: "Tabletop Exercises for HIPAA Incident Response"
seoTitle: "HIPAA Tabletop Exercises"
description: "How to run a ransomware tabletop at a small clinic: roles, injects, timing, and what to document to satisfy 45 CFR 164.308(a)(6)."
metaDescription: "HIPAA tabletop exercises for small clinics: ransomware scenario, roles, injects, timing, and documentation under §164.308(a)(6)."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "incident-response"
schemaType: "how-to"
howToSteps:
  - name: "Pick a realistic scenario"
    text: "Choose a scenario the clinic is actually likely to face. Ransomware on the front-desk PC is the default for most small clinics."
  - name: "Assign roles"
    text: "Name the Incident Commander, Scribe, Clinical Lead, and External Comms owner. For a small clinic, one person may hold two roles, but the roles still get named."
  - name: "Prepare injects"
    text: "Write three to five timed events that reveal new information: the first ransom note, a patient calling about a scheduling problem, a reporter asking for comment."
  - name: "Run the exercise in ninety minutes"
    text: "Open the scenario, deliver injects at planned intervals, let the team respond, and interrupt only to keep the timeline moving."
  - name: "Document decisions in real time"
    text: "The Scribe captures every decision, every assumption, and every moment the team paused because no one knew the answer. These gaps are the real output."
  - name: "Hold a hot wash"
    text: "Thirty-minute debrief immediately after. Capture what worked, what did not, and what needs to change in the incident response plan."
  - name: "File the evidence"
    text: "Save the scenario, inject list, participant list, scribe notes, and hot-wash outcomes in the compliance evidence folder with the exercise date."
intent: "awareness"
summary: "45 CFR 164.308(a)(6) requires security incident procedures. A tabletop exercise is the cheapest way for a small clinic to prove those procedures work before a real incident tests them. A ninety-minute ransomware scenario with four roles and a scribe is enough to satisfy the rule and expose the actual gaps."
keyTakeaways:
  - "45 CFR 164.308(a)(6) requires security incident procedures, and unexercised procedures do not count as maintained."
  - "A ransomware tabletop is the highest-signal scenario for small clinics in 2026."
  - "The scribe notes are the compliance artifact. Decisions and gaps matter more than the playbook."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 164.308(a)(6) - Security Incident Procedures"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308#p-164.308(a)(6)"
    publisher: "eCFR"
  - title: "NIST SP 800-61 Rev. 2 - Computer Security Incident Handling Guide"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r2/final"
    publisher: "NIST"
  - title: "HHS Ransomware and HIPAA Fact Sheet"
    url: "https://www.hhs.gov/sites/default/files/RansomwareFactSheet.pdf"
    publisher: "HHS"
faq:
  - q: "How often should we run a tabletop?"
    a: "At least once per year. Clinics with higher-risk profiles or recent near-misses should run two. Tie the exercise into the annual review so the evidence is generated on a predictable cadence."
  - q: "Do we need an external facilitator?"
    a: "Not for the first few. An internal Incident Commander and Scribe can run a credible exercise. External facilitation adds value once the team has matured past the basics."
  - q: "Does a tabletop satisfy the contingency plan testing requirement?"
    a: "It satisfies part of it. A tabletop tests decision-making. A backup restore test is still needed to prove the data side. Most small clinics do both annually."
  - q: "What if the tabletop exposes that our plan is wrong?"
    a: "That is the point. The scribe notes feed the next revision. An exercise that finds nothing is usually an exercise that was not hard enough."
---

45 CFR 164.308(a)(6) requires covered entities to implement policies and procedures to address security incidents. What it does not say, and what matters for a small clinic, is that unexercised procedures do not count as maintained. A tabletop is the cheapest way to test the procedures before a real attack does.

A working tabletop takes ninety minutes, four roles, and a scribe. Everything else is detail.

## Why ransomware

Ransomware is the scenario every small clinic should exercise first. HHS has published a dedicated fact sheet covering ransomware under HIPAA, and the incident patterns against small practices have been consistent for years: encrypted workstations, locked EHRs, ransom notes, and an immediate operational crisis.

A ransomware tabletop also touches every other safeguard. The backup plan gets tested. The emergency mode operation plan from the [contingency planning guide](/learn/compliance-operations/hipaa-contingency-planning) gets exercised. The breach notification decision tree gets walked. The BAA inventory from the [asset inventory guide](/learn/risk-analysis/asset-inventory-for-small-clinics) comes into play when the team has to notify the EHR vendor.

## The four roles

A small-clinic tabletop needs four named roles. One person can hold two of them, but every role should be filled.

- Incident Commander. Owns the response, makes the calls, and decides when to escalate. Usually the practice administrator or Security Officer.
- Scribe. Captures every decision, every assumption, every pause. The scribe is the most valuable role in the exercise because the notes become the evidence.
- Clinical Lead. Represents patient care. Answers the question of how the scenario affects scheduled patients, active exams, and medication orders.
- External Comms. Handles the hypothetical calls to vendors, law enforcement, cyber insurance, and the media. For small clinics, this role practices saying no comment to reporters and yes to the insurance breach hotline.

## A working ransomware scenario

A usable scenario reads like this. At 8:15 AM on a Tuesday, the front desk PC displays a ransom note demanding payment in Bitcoin. The EHR is unreachable from that workstation. Three patients are already in the waiting room. The first provider has a full schedule starting at 9:00 AM.

From that opening, the facilitator delivers injects to pressure the team.

- Inject at minute 15: a second workstation shows the same ransom note.
- Inject at minute 30: the EHR vendor's status page reports no issues, so the attack is clearly local.
- Inject at minute 45: a patient calls asking why their appointment confirmation did not go through.
- Inject at minute 60: a local reporter calls the front desk asking whether the clinic was hit by ransomware.
- Inject at minute 75: the cyber insurance carrier is on the line and wants a preliminary incident report.

The team works through each inject. The scribe captures every decision.

## What the scribe should capture

Five things belong in the scribe notes.

- The timeline of events and decisions, with timestamps.
- Every assumption the team made when they did not have information.
- Every point where the team paused because no one knew the answer.
- The external parties contacted and why.
- The breach-notification analysis the team performed, referencing 45 CFR 164.400-414.

The pauses are the most important. They are where the incident response plan has gaps. The [HIPAA annual review checklist](/learn/compliance-operations/hipaa-annual-review-checklist) is where those gaps become backlog items.

## The hot wash

Immediately after the exercise, spend thirty minutes on the debrief. Three questions structure it. What worked. What did not. What changes in the plan, the training, or the tooling would have changed the outcome. Write the answers down before people leave the room.

Specific common findings in small-clinic ransomware tabletops: the backup restore point is older than the team assumed, no one knows the cyber insurance incident hotline number, and the EHR vendor's after-hours support path is undocumented. Each of those becomes a follow-up task.

## Connecting to the rest of the program

The tabletop is not a standalone event. It feeds the [contingency plan](/learn/compliance-operations/hipaa-contingency-planning) revision, validates the [asset inventory](/learn/risk-analysis/asset-inventory-for-small-clinics), and stress-tests the [workstation use policy](/learn/compliance-operations/workstation-use-policy-small-clinic) when the team discusses how the ransomware entered in the first place. Platforms such as [PHIGuard](/hipaa) keep the tabletop date, scribe notes, and resulting task list attached to the incident response control so the evidence is always retrievable.

## What to do next

Pick a date in the next sixty days. Block ninety minutes. Assign the four roles and one scribe. Use the scenario above as a starting point. The first tabletop is always the hardest and also the most informative.
