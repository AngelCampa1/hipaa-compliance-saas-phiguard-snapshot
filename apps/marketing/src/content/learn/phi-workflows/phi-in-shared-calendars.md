---
title: "PHI in Shared Calendars"
seoTitle: "PHI in Shared Calendars: Titles, Attendees, Risk"
description: "How Google and Outlook shared calendars turn event titles and attendees into PHI, and the settings that keep a small clinic out of trouble."
metaDescription: "PHI in shared calendars: why event titles, attendee lists, and third-party integrations expose patient information and how to lock it down."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "A calendar event titled 'Maria R. - colonoscopy 2pm' is PHI. Shared calendars, cross-workspace invites, and scheduling integrations push that PHI into attendee inboxes, third-party tools, and personal devices without the practice realizing it. It helps teams map where PHI appears in ordinary workflows, limit unnecessary exposure, and document the safeguards used around messages, files, devices, and vendors."
keyTakeaways:
  - "Event titles, locations, descriptions, and attendee lists can each independently constitute PHI."
  - "Shared calendars broadcast every event to everyone with access, including staff who do not need to know the patient context."
  - "Third-party scheduling, video, and productivity integrations often push calendar data into tools without a BAA."
  - "The fix is procedural, not technical. Generic titles, restricted sharing, and disciplined integration review solve 80 percent of the risk."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 164.502(b) - Minimum Necessary"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "Microsoft 365 HIPAA BAA Overview"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft"
faq:
  - q: "Is a patient's name in a calendar event PHI?"
    a: "Yes if it is combined with any health or treatment context. A title like 'John S. follow-up' in a clinic calendar meets that bar."
  - q: "Are Google Workspace and Microsoft 365 calendars covered by a BAA?"
    a: "Both vendors will sign a BAA that covers core services including Calendar when the account is eligible and configured correctly. The BAA does not cover third-party integrations plugged into the calendar."
  - q: "Can we just put initials instead of names?"
    a: "Initials plus date and location can still identify a patient. The stronger habit is to strip patient-specific titles entirely and link the event to a secure record that holds the detail."
---

Shared calendars are an underrated PHI surface. Staff treat them as operational metadata, but an event title, a location, an attendee list, and a description can each independently constitute PHI. Scale that across a clinic and the calendar becomes one of the easiest places for an outsider to reconstruct patient context.

## What makes a calendar event PHI

Under [45 CFR 160.103](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103), any individually identifiable health information held by a covered entity is PHI. A calendar event held by the practice qualifies if it ties a person to health or treatment context. Examples that commonly appear in clinic calendars:

- "Maria R. - colonoscopy 2pm"
- "J. Smith pre-op consult"
- "(555) 123-4567 lab review"
- A patient email address as an attendee
- A room location that corresponds to a specific clinical service (e.g., "Oncology Exam 3")

Each is PHI. For the umbrella definition, see [What Does PHI Stand For](/learn/phi-fundamentals/what-does-phi-stand-for) and [ePHI vs PHI](/learn/phi-fundamentals/ephi-vs-phi-differences).

## How PHI leaks through calendars

### Over-broad sharing

A clinic's default share setting often shows full event details to every internal user. A receptionist, a billing contractor, and an IT vendor may all see the same event title. That is a minimum-necessary problem under [45 CFR 164.502(b)](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502).

### Cross-workspace invites

When a provider invites a patient or an outside specialist, the event leaves the practice's Workspace or Microsoft 365 tenant. Recipients see the title, location, description, and attendee list. If that external domain is a personal Gmail or a non-BAA organization, PHI just left the building.

### Personal device sync

Staff sync work calendars to personal phones. The calendar database on the device is subject to the phone's security posture, not the clinic's. A lost or unencrypted phone then becomes a [mobile device incident](/learn/phi-workflows/phi-in-mobile-devices-byod).

### Third-party integrations

Scheduling tools, CRMs, video conferencing apps, and productivity add-ons request calendar scopes. They read titles, attendees, and descriptions. Each integration is a new business associate question. Without a BAA, it should not read calendar events that contain PHI. The same pattern shows up in [PHI in CRM Records](/learn/phi-workflows/phi-in-crm-records).

### Calendar notifications

Pop-up notifications show full titles on lock screens. "Maria R. - colonoscopy 2pm" announces itself to anyone within view. Notifications are one of the most common low-effort disclosures in a practice.

## Platform specifics

Google Workspace and Microsoft 365 will sign a BAA on eligible business and enterprise plans. Google documents covered services in its HIPAA Implementation Guide. Microsoft publishes its position in the [HIPAA BAA overview](https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech). Both BAAs cover the core calendar service. Neither covers the third-party add-ons a staff member might install.

Consumer-grade Gmail and Outlook.com accounts are not covered by a BAA under any configuration. If a clinic is running on a personal account, PHI does not belong in that calendar.

## The policy that actually works

Technical controls help but the fix is mostly procedural. A small clinic can reduce calendar PHI risk sharply with four rules.

1. **Generic titles by default.** Event titles should not include patient names, diagnoses, procedures, or contact information. Use a patient-neutral label ("Follow-up visit", "Procedure - Rm 3") and link to the secure record for detail.
2. **Restricted sharing.** Move from "see all details" to "see free/busy only" for anyone who does not clinically need event context.
3. **Integration review.** Inventory every third-party app with calendar access. Remove the ones without a BAA or a legitimate workflow reason.
4. **Notification hygiene.** Disable content previews on lock screens for work calendars. This is a device policy that pairs with [BYOD controls](/learn/phi-workflows/phi-in-mobile-devices-byod).

## Where to put the real patient context

If the calendar title is just a label, the detail has to live somewhere. That is where a clinic task system belongs: patient-linked, access-controlled, with an audit log of who viewed or edited the record. A calendar marks the time. The workflow sits elsewhere.

See [/hipaa](/hipaa) for how PHIGuard centralizes that work with BAA details available during plan review and current pricing. For the email-adjacent version of the same leak pattern, see [PHI in Email](/learn/phi-workflows/phi-in-email).
