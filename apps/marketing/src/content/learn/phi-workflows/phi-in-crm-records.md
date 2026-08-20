---
title: "PHI in CRM Records"
seoTitle: "PHI in CRM Records: HubSpot, Salesforce, Risk"
description: "How PHI ends up in CRM records, what HubSpot and Salesforce BAAs actually cover, and the marketing automations that create breach risk."
metaDescription: "PHI in CRM records: HubSpot and Salesforce BAA scope, lead forms that capture conditions, note fields, and marketing automations."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "phi-workflows"
schemaType: "article"
intent: "awareness"
summary: "CRMs are built to capture everything about a contact. In a clinic, that bias turns the CRM into a PHI magnet. Lead forms, free-text notes, and marketing automations routinely capture condition and treatment context without a matching BAA. It helps teams map where PHI appears in ordinary workflows, limit unnecessary exposure, and document the safeguards used around messages, files, devices, and vendors."
keyTakeaways:
  - "A CRM contact record that includes condition, treatment, appointment, or payer detail is PHI."
  - "HubSpot and Salesforce have narrow HIPAA postures. HubSpot does not sign BAAs on most plans. Salesforce Health Cloud with a BAA is a defined configuration, not a default."
  - "Lead forms, free-text note fields, and marketing automation triggers are the most common PHI entry points."
  - "Marketing, intake, and clinical coordination need separate systems with clear boundaries or the CRM accumulates PHI no one inventories."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "45 CFR 160.103 - Definitions"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103"
    publisher: "eCFR"
faq:
  - q: "Is HubSpot HIPAA compliant?"
    a: "HubSpot's published position is that its products are not designed for PHI and it does not sign BAAs on most plans. Practices should keep PHI out of HubSpot unless they have a current written agreement to the contrary."
  - q: "Can Salesforce be used for PHI?"
    a: "Salesforce will sign a BAA for eligible configurations, commonly on Health Cloud with specific settings. The default Sales Cloud or Marketing Cloud configuration without a BAA is not appropriate for PHI."
  - q: "Is a patient's name and appointment date in a CRM note PHI?"
    a: "Yes. A name combined with appointment, condition, or payer context in a clinic CRM meets the definition of PHI."
---

CRMs are built on a single principle: capture everything about a contact and make it searchable. That instinct serves sales teams well. In a clinic, it turns the CRM into a running diary of protected health information that often lives outside any compliance inventory.

## When a CRM record becomes PHI

Under [45 CFR 160.103](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-160/subpart-A/section-160.103), PHI is individually identifiable health information held by a covered entity or business associate. A CRM contact is PHI the moment any of the following appears on the record:

- Condition, symptom, or diagnosis mention
- Appointment history with the practice
- Referral source tied to a clinical specialty
- Insurance or payer detail
- Treatment preferences or medication lists
- Any free-text note describing patient context

For a broader walkthrough, see [What Does PHI Stand For](/learn/phi-fundamentals/what-does-phi-stand-for).

## Vendor positions worth reading carefully

### HubSpot

HubSpot's public guidance states that its products are not designed for PHI, and on most plans it will not sign a BAA. The HubSpot and HIPAA documentation is explicit. Practical consequence for a clinic: lead capture forms, ticketing, sequences, and workflows in a standard HubSpot instance must not collect or reference PHI. If marketing forms are asking about conditions, symptoms, or insurance, the form is the problem, not the platform.

### Salesforce

Salesforce signs a BAA for eligible configurations, typically Health Cloud with specific security and org settings. The Salesforce HIPAA page describes the scope. A default Sales Cloud or Marketing Cloud tenant without a signed BAA is not a permitted home for PHI. Health Cloud with a BAA is a defined setup that requires deliberate configuration and ongoing governance.

### Other CRMs

Pipedrive, Zoho, Copper, and similar tools generally do not offer BAAs. If a clinic uses one of these for marketing and the same instance also touches patient identifiers, that is a compliance gap the sales team did not intend to create.

## Where PHI actually enters the CRM

Three entry points account for most of the risk.

### Lead and intake forms

Marketing teams ask for more than they should. A landing page with fields like "What condition are you managing" or "Current medication" collects PHI the moment a real person fills it out. That submission flows into the CRM as a contact record and a form attachment. If the CRM is not a permitted business associate, the practice already has an issue before any follow-up happens.

Safer pattern: marketing forms collect name, email, and a broad interest category. Anything clinical happens on a separate intake in a system with a BAA.

### Free-text note fields

A front-desk staffer adds "Patient called about back pain flare-up, rescheduling to next week" to the CRM contact. That note is PHI. Free-text fields are the single biggest leakage vector because they are invisible to schema-level governance. Lists and exports pull those notes into reports and third-party integrations.

### Marketing automation triggers

Automations that branch based on form responses, tags, or list membership frequently encode clinical context. Automated outreach triggered by a "diabetes" tag is marketing automation that uses PHI. Even if the tag is never displayed, the system is processing protected information.

## Integration sprawl

CRMs are hubs. They sync with email marketing tools, form builders, chatbots, analytics, and ad platforms. Each integration either needs a BAA or must not touch PHI. Analytics tags and pixels are a special case. Marketing-side analytics should never fire on a page that collects or displays patient information. This is adjacent to the [PHI in email](/learn/phi-workflows/phi-in-email) problem of forwarding threads without realizing who is on the chain.

## Keeping marketing and clinical work separate

A clean architecture for a small clinic usually looks like this:

- A marketing CRM that contains only non-PHI contact and interest data.
- A separate clinical system of record (EHR, intake platform) that holds PHI, with a BAA.
- A dedicated task and coordination layer with a BAA that ties operational work back to the patient record without duplicating identifiers into the marketing CRM.

The dedicated coordination layer is where PHIGuard fits. A clinic-flat price, BAA details available during plan review, and audit logs mean the team has a proper home for patient-tied work rather than leaking it into whichever CRM is closest. See [/hipaa](/hipaa) and compare to the [Slack DM pattern](/learn/phi-workflows/phi-in-slack-dms), which tends to carry the same drift.

## A short audit to run this week

- Open the CRM and export a sample of contact notes. Scan for clinical language.
- Review every form connected to the CRM. Remove condition, symptom, and medication questions.
- List every integration with write or read access. Confirm BAA status for each.
- Check whether marketing automations branch on clinical attributes. Move those rules out.

Most practices close the majority of their CRM PHI exposure in a few hours of deliberate cleanup. The harder part is keeping the marketing team from reintroducing it next quarter, which is why a written policy and a monthly review matter.
