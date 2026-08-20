---
title: "Is Airtable HIPAA Compliant for Healthcare Workflows?"
vendor: "Airtable"
seoTitle: "Is Airtable HIPAA Compliant?"
description: "A clinic-focused guide to Airtable HIPAA compliance, Enterprise Scale requirements, Health Information Exhibit terms, AI limits, automations, integrations, and PHI governance."
metaDescription: "Is Airtable HIPAA compliant? Airtable supports HIPAA only through Enterprise Scale and a Health Information Exhibit with strict customer controls."
publishedAt: 2026-04-21
updatedAt: 2026-05-21
verificationDate: 2026-05-21
summary: "Airtable can support HIPAA-regulated workflows only for Enterprise Scale customers that execute Airtable's Health Information Exhibit, which includes a Business Associate Addendum for HIPAA customers. Clinics on other plans should not store ePHI or medical information in Airtable, and eligible customers must follow Airtable's limits for automations, records, support, integrations, AI, and patient-portal use."
keyTakeaways:
  - "Airtable's current health information documentation says Enterprise Scale is required for HIPAA or CMIA-covered health information use."
  - "Airtable now points customers to its Health Information Exhibit, which includes a HIPAA Business Associate Addendum."
  - "Airtable AI is not currently available for customers who require a Health Information Exhibit."
  - "Airtable also restricts where ePHI can appear: records and interfaces may be allowed, but email bodies, support tickets, base names, send-record emails, and AI-enabled workspaces are not."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/alternatives/airtable-alternative"
relatedLearnPath: "/learn/phi-workflows/phi-in-spreadsheets"
sources:
  - title: "Health Information Datasheet"
    url: "https://www.airtable.com/company/health-info-datasheet"
    publisher: "Airtable"
  - title: "HIPAA at Airtable"
    url: "https://www.airtable.com/company/hipaa-airtable"
    publisher: "Airtable"
  - title: "Understanding HIPAA at Airtable"
    url: "https://support.airtable.com/v1/docs/understanding-hipaa-at-airtable"
    publisher: "Airtable"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Is Airtable HIPAA compliant?"
    a: "Airtable can support HIPAA-regulated use only for Enterprise Scale customers that execute Airtable's Health Information Exhibit, including its Business Associate Addendum. Other plans should not be treated as PHI-ready."
  - q: "Can a clinic store ePHI in Airtable on a non-Enterprise plan?"
    a: "No. Airtable's Health Information Datasheet says customers are not permitted to store ePHI or medical information if they are not on Enterprise Scale and have not executed the Health Information Exhibit."
  - q: "Can Airtable AI be used with PHI?"
    a: "Airtable's current Health Information Datasheet says Airtable AI is not currently available for customers who require a Health Information Exhibit."
  - q: "What should clinics verify after signing Airtable's health information terms?"
    a: "Verify org units, access controls, SSO, audit logs, automations, outgoing email, integrations, forms, interfaces, exports, support practices, AI settings, and staff rules for where PHI may appear."
---

## Short answer

Airtable is not HIPAA compliant for every account. Airtable's current health information materials say customers that intend to store ePHI or medical information in Airtable must be on the Enterprise Scale plan and execute Airtable's Health Information Exhibit. That exhibit includes Airtable's Business Associate Addendum for customers subject to HIPAA.

If a clinic is using a self-serve Airtable plan or has not completed that process, do not store PHI in Airtable.

## What Airtable currently says

Airtable's Health Information Datasheet is the key source. It says Enterprise Scale customers can execute a Health Information Exhibit to support HIPAA and/or CMIA use. It also says customers that are not on Enterprise Scale and have not executed the exhibit are not permitted to store ePHI or medical information in Airtable.

Airtable's support article describes an admin-led process: contact the account executive, identify which organization units need HIPAA safeguards, complete the paperwork, and have Airtable enable the relevant safeguards internally.

That means HIPAA use is not a simple toggle inside a normal workspace.

## Airtable AI requires special caution

Clinics should treat Airtable AI as out of scope for PHI unless Airtable gives updated written approval. Airtable's current Health Information Datasheet says Airtable AI is not currently available for customers who require a Health Information Exhibit.

That matters because AI features can process field values, prompts, records, summaries, and workspace context. If a base includes patient-linked information, AI access can become PHI processing.

## Where Airtable says ePHI cannot go

Airtable's Health Information Datasheet does more than require Enterprise Scale and the Health Information Exhibit. It also gives customers specific operating limits.

For HIPAA or CMIA-covered use, Airtable says ePHI and medical information must only be stored in records within Airtable bases or interfaces. It says not to include ePHI or medical information in email subject lines or bodies, base access requests, base descriptions, base names, table names, interface names, workspace names, send-record emails, support screenshots, support tickets, calls, emails, Slack messages with Airtable representatives, or workspaces where Airtable AI is enabled.

Airtable also says not to use Airtable as a patient portal at this time.

Those limits are important for clinics because they are exactly where staff tend to put context when they are moving fast. A base named after a patient, an automation email with appointment details, or a support screenshot with a patient row can create a disclosure outside the intended record.

## Why Airtable is hard for small clinics

Airtable is powerful because it is flexible. A clinic can create bases for referrals, intake, prior authorizations, vendor reviews, care coordination, HR, policy review, asset inventories, or incident logs. That same flexibility creates governance work.

PHI can appear in:

- base names
- table names
- record titles
- linked records
- forms
- interfaces
- comments
- attachments
- automations
- outgoing emails
- synced tables
- API integrations
- downloaded CSV files
- support screenshots
- outgoing send-record emails

Airtable can model almost anything. The clinic has to decide, document, and enforce what should not be modeled.

## When Airtable can fit

Airtable can fit a healthcare organization that has Enterprise Scale, the Health Information Exhibit, an admin owner, SSO, audit log review, DLP or monitoring support, integration review, and clear rules for PHI fields.

It may work for structured, high-value workflows where the organization has the staff to govern bases over time. It is less attractive when the clinic wants a quick spreadsheet replacement and does not have a compliance or systems owner.

## Airtable vs PHIGuard

Airtable is a configurable data platform. PHIGuard is a focused HIPAA operations system.

| Job | Airtable fit | PHIGuard fit |
|---|---|---|
| Custom database | Strong for Enterprise Scale customers | Narrower by design |
| PHI workflow governance | Requires careful base design and admin controls | Product workflow is already shaped around HIPAA operations |
| Vendor BAA tracking | Possible as a custom base | Purpose-built compliance workflow |
| Incident follow-up | Possible with custom tables and automations | Incident record, tasks, evidence, and audit history stay connected |
| Training evidence | Possible with custom fields | Program workflow for assignments and completion evidence |
| AI with PHI | Current Airtable materials say not available for Health Information Exhibit customers | Evaluate any AI workflow separately before PHI processing |

Use Airtable when the organization truly needs a custom database and can govern it. Use PHIGuard when the clinic wants fewer design decisions and more built-in operating discipline.

## Clinic approval checklist

Before PHI enters Airtable, document:

- Enterprise Scale plan
- executed Health Information Exhibit
- applicable Business Associate Addendum
- organization units enabled for HIPAA safeguards
- SSO and access review process
- audit log review process
- list of approved bases, tables, and PHI fields
- banned fields and naming rules
- automation and outgoing email review
- API, sync, and integration inventory
- Airtable AI disabled or formally out of scope
- no ePHI in support tickets, screenshots, base names, workspace names, email subjects, or send-record messages
- confirmation Airtable is not being used as a patient portal
- export and retention controls
- staff training on where PHI may appear

If that list feels too heavy, Airtable is probably too flexible for the clinic's PHI workflow.

## Recommendation

Airtable has a real HIPAA path, but it is an Enterprise Scale path with specific health information terms and customer responsibilities. That makes it different from tools with no public HIPAA story, but it does not make it a low-governance option.

For small clinics, the question is whether the organization wants to govern a configurable database or operate a narrower HIPAA workflow. If the need is recurring compliance work, incident follow-up, vendor BAA status, training evidence, and audit history, a focused system is usually easier to defend.
