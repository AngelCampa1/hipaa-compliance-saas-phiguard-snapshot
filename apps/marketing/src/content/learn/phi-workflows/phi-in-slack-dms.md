---
title: "PHI in Slack DMs"
seoTitle: "PHI in Slack DMs: Risks and BAA Rules"
description: "Why Slack DMs are the riskiest place for PHI inside a clinic, what the Enterprise Grid BAA covers, and safer alternatives."
metaDescription: "PHI in Slack DMs: Enterprise Grid BAA requirement, how DMs bypass retention, and why channel leakage keeps happening in clinics."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "Slack will sign a BAA only on its Enterprise Grid plan. Even on Grid, direct messages are the weakest surface: they often escape retention policies, avoid channel oversight, and create PHI sprawl that no one can audit. Most clinics should keep PHI out of Slack entirely."
keyTakeaways:
  - "Slack only offers a BAA on Enterprise Grid. Free, Pro, and Business+ plans are not appropriate for PHI."
  - "Direct messages commonly bypass channel-based retention and governance controls, creating an invisible PHI layer."
  - "Channel leakage (patient names in #general, identifiers in watercooler threads) is the most common workforce-level failure."
  - "For coordination around specific patients, a purpose-built task system with audit logs is the correct surface, not a chat DM."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR Part 164 Subpart C - Security Standards for ePHI"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C"
    publisher: "eCFR"
  - title: "HIPAA Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS"
faq:
  - q: "Is Slack HIPAA compliant?"
    a: "Slack can support HIPAA workloads only on Enterprise Grid with a signed BAA and a specific compliance configuration. Other plans are not suitable for PHI."
  - q: "Can I send a patient's name in a Slack DM if we are on Enterprise Grid?"
    a: "Technically the BAA covers it, but DMs commonly bypass channel retention and governance. For anything that references a specific patient, a system with access control and an audit trail is a better surface."
  - q: "What about Slack huddles and voice notes?"
    a: "Live huddles are transient but any recording, transcript, or voice-note attachment becomes ePHI. Confirm those features are in BAA scope and turn them off where not needed."
---

Slack is designed to reduce email. In a clinic, it also becomes the place where PHI quietly proliferates. A coworker pings another with a first name and a diagnosis. A DM thread turns into a running patient update. Weeks later no one can reconstruct who knew what and when. The coordination value is real. The compliance drift is the problem.

## Plan and BAA rules

Slack will sign a BAA only on the Enterprise Grid plan and only with the right compliance configuration. The company documents this on its HIPAA compliance page. Practical consequences:

- Free, Pro, and Business+ Slack workspaces are not appropriate for PHI. No BAA, no PHI.
- An Enterprise Grid workspace without the compliance settings enabled still must not carry PHI until the configuration matches BAA expectations.
- A BAA covers Slack the platform. It does not cover the integrations connected to it. Each marketplace app is a separate vendor-management question, the same pattern described in [PHI in CRM Records](/learn/phi-workflows/phi-in-crm-records).

The practice admin should have a copy of the executed Slack BAA in the vendor file. If the practice is on a lower plan and staff are sending patient context in DMs, that is a breach risk that predates any Slack feature discussion.

## Why DMs are the weak link

Four structural issues make DMs worse than channels for PHI handling.

### DMs bypass the retention policy most admins set

Many clinics configure Slack retention at the channel level because that is where governance is visible. DMs and multi-person DMs commonly fall under a separate policy or a default that is looser than intended. The result is that the messages staff think will disappear in 90 days may sit indefinitely, and the messages admins believe are retained are not indexed anywhere they can audit.

### DMs lack channel oversight

A channel has membership, pinned documentation, and a purpose. A DM thread has two people and momentum. There is no compliance owner for a DM. If a patient's name, MRN, or phone number lands there, no one flags it.

### Search and export are inconsistent

Slack's eDiscovery and export capabilities depend on plan and compliance configuration. In an OCR investigation or a breach review, an admin needs the ability to search across DMs. Without Enterprise Grid compliance exports, that search is limited.

### Attachments and screenshots persist

A coworker screenshots an EHR note and drops it into a DM. That image is ePHI. It is cached on both endpoints and in Slack storage. Removing it from the conversation does not remove it from device caches.

## Channel leakage is the other half

Even teams that avoid DMs leak PHI into general channels. Common patterns:

- Patient first names in a watercooler channel after a tough visit.
- Appointment details in an operations channel ("the 2pm for Dr. K").
- Screenshots of the schedule pasted into a huddle transcript.

None of these conversations belong in Slack. They belong in a system that ties the discussion to a patient record, logs who accessed it, and enforces retention. That is the distinction between a chat tool and an [audit-ready task platform](/hipaa).

## Safer posture for a small clinic

Three practical rules that hold up at 3 to 50 staff.

1. **No patient identifiers in Slack, on any plan.** Use an internal code that maps to the EHR record. If an identifier must cross the tool, move the conversation.
2. **Channel-only for anything that is not truly one-on-one.** This gives at least some governance and pinned context.
3. **Purpose-built home for patient-tied work.** Task assignment, follow-up, incident tracking, and policy acknowledgements belong in a system designed for it. See [PHI Workflows](/learn/phi-workflows) and the product view at [/hipaa](/hipaa).

## Workforce training topics

Short recurring reminders work better than a one-time policy document:

- Do not use DMs to discuss a specific patient.
- Do not paste EHR screenshots anywhere in Slack.
- Do not forward patient emails into Slack channels.
- If a coworker sends you PHI in a DM, move the conversation out and delete the message per policy.

Slack is a useful internal tool. It is not a compliance surface. Treat it that way and the clinic keeps the coordination benefit without the invisible PHI layer. For a parallel failure mode on the calendar side, see [PHI in Shared Calendars](/learn/phi-workflows/phi-in-shared-calendars). For email, see [PHI in Email](/learn/phi-workflows/phi-in-email).
