---
title: "Is the OpenAI API HIPAA Compliant"
vendor: "OpenAI (API)"
seoTitle: "Is OpenAI API HIPAA Compliant"
description: "What developers and healthcare organizations need to know about using the OpenAI API with PHI — including which accounts qualify for a BAA, what the Healthcare Addendum covers, and how this differs from ChatGPT consumer products."
metaDescription: "Is OpenAI API HIPAA compliant Standard API accounts lack a BAA; enterprise customers need the Healthcare Addendum before PHI use."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "OpenAI (API) requires a plan-and-use review, not a blanket HIPAA label. What developers and healthcare organizations need to know about using the OpenAI API with PHI — including which accounts qualify for a BAA, what the Healthcare Addendum covers, and how this differs from ChatGPT consumer products. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out of."
keyTakeaways:
  - "Standard OpenAI API accounts (pay-as-you-go) have no BAA available — using them to process PHI violates HIPAA."
  - "Enterprise API customers can access OpenAI's Healthcare Addendum, which serves as the BAA for covered entities."
  - "The Healthcare Addendum must be negotiated through OpenAI's enterprise sales team — it is not available self-serve."
  - "The Addendum covers the OpenAI API services; it does not automatically extend to ChatGPT consumer or Team products."
  - "If you use a third-party application built on OpenAI's API that handles PHI, that application vendor must provide you with a BAA — not OpenAI directly."
sources:
  - title: "Security and Privacy at OpenAI"
    url: "https://openai.com/security/"
    publisher: "OpenAI"
  - title: "OpenAI Healthcare Addendum"
    url: "https://cdn.openai.com/osa/healthcare-addendum.pdf"
    publisher: "OpenAI"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can I use the standard OpenAI API to build a healthcare app that processes patient data?"
    a: "Not without an enterprise agreement and executed Healthcare Addendum. Standard pay-as-you-go API accounts have no BAA available. Processing PHI through those accounts is a HIPAA violation regardless of how the application is architected."
  - q: "How is this different from is-chatgpt-hipaa-compliant.md?"
    a: "This guide covers the OpenAI API — the programmatic interface that developers use to build applications. ChatGPT is OpenAI's end-user product. They have separate BAA paths. An enterprise ChatGPT agreement does not cover API usage for custom application development, and vice versa."
  - q: "If my EHR vendor uses OpenAI's API under the hood, do I need to get the Healthcare Addendum myself"
    a: "No. Your EHR vendor is the business associate. They must have their own BAA arrangement with OpenAI for API usage that involves PHI. You need a BAA with your EHR vendor — not directly with OpenAI."
  - q: "Does the OpenAI Healthcare Addendum mean OpenAI is HIPAA-certified?"
    a: "There is no HIPAA certification body — HIPAA compliance is a legal obligation, not a certification. The Healthcare Addendum is a contractual agreement that establishes OpenAI's obligations as a business associate for qualifying enterprise API customers. It does not make OpenAI 'certified.'"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Is OpenAI API HIPAA compliant For standard accounts, no. OpenAI does not offer a BAA to pay-as-you-go API customers. Developers building PHI-handling healthcare applications on the OpenAI API need an enterprise agreement with OpenAI's Healthcare Addendum before any patient data touches the API. This guide is specifically about the OpenAI API — not the ChatGPT product.

## This guide vs. the ChatGPT guide

OpenAI has two distinct product surfaces that carry separate compliance implications:

**The OpenAI API** — used by developers to build applications. A startup building a clinical documentation tool, a health system creating an AI-assisted prior authorization workflow, or a clinic using custom AI scripting all use the API. The BAA path here is the **Healthcare Addendum**, available only to enterprise API customers.

**ChatGPT** — OpenAI's end-user product used directly through a browser or app. Clinic staff using ChatGPT to draft patient letters or summarize visit notes are using this surface. The BAA path here is **ChatGPT Enterprise**, which is a separate agreement.

These agreements are not interchangeable. An enterprise ChatGPT agreement does not cover API usage for custom development. An API Healthcare Addendum does not cover staff using ChatGPT consumer products.

## BAA availability for the OpenAI API

| Account type | BAA available |
|---|---|
| Pay-as-you-go API | No |
| API via standard subscription | No |
| Enterprise API with Healthcare Addendum | Yes |

The Healthcare Addendum is available only through direct engagement with OpenAI's enterprise sales team. There is no self-serve path. Pricing for enterprise API access is negotiated, not published.

Once executed, the Healthcare Addendum establishes OpenAI as a business associate for the specific API services covered in the agreement. It sets out OpenAI's obligations regarding how PHI is handled, retained, and protected within their systems.

## What the Healthcare Addendum covers

The Healthcare Addendum is a contractual document — the specific terms evolve, so covered entities should read the current version before signing. As of OpenAI's published Healthcare Addendum, the agreement covers:

- OpenAI API services used by the enterprise customer
- How OpenAI handles data submitted through API calls
- OpenAI's breach notification obligations to the covered entity
- Data retention and deletion terms

What it does not cover:

- Consumer OpenAI products (ChatGPT Free, Plus, Team)
- Third-party applications built on OpenAI's API that you use as a customer (those vendors must provide their own BAA)
- Your clinic's or organization's downstream PHI handling obligations
- Model training use of submitted data — review the current enterprise data terms for the specific controls applicable to your agreement

## What developers must do before processing PHI

If you are building a healthcare application on the OpenAI API that will process patient information, the compliance checklist looks like this:

1. **Negotiate an enterprise agreement** with OpenAI that includes the Healthcare Addendum. This is not a quick online process — budget time for legal review and contract negotiation.
2. **Execute the Healthcare Addendum** before any PHI enters the API. There is no retroactive coverage.
3. **Conduct a risk assessment** that includes the AI processing component. Document what PHI types are submitted, how they're used, what outputs are generated, and how outputs are stored.
4. **Design your application with minimum necessary PHI.** Do not submit full patient records when only a diagnosis code is needed for the task. The HIPAA minimum necessary standard applies to what you send through the API.
5. **Establish access controls** within your application so that only authorized users can trigger API calls that involve PHI.
6. **Create an audit log** for API calls that touch PHI. Know who submitted what, when, and what was returned.

## The third-party application scenario

Many clinics will not use the OpenAI API directly. They will use a product — a documentation tool, a prior auth assistant, a patient communication platform — that is built on the OpenAI API behind the scenes.

In that scenario, the vendor of that product is your business associate, not OpenAI. You need a BAA with the vendor. The vendor must have its own arrangement with OpenAI. You do not need to independently obtain an OpenAI Healthcare Addendum.

Ask your software vendors directly: "Does your product use OpenAI's API If so, do you have a BAA or Healthcare Addendum with OpenAI covering our PHI" If they cannot answer that question clearly, treat that as a compliance risk.

## Data training considerations

OpenAI's standard API terms have evolved regarding training data use. Enterprise customers with Healthcare Addendum agreements have different data handling terms than standard API customers. The specific provisions — whether PHI submitted through the API is used to train models — should be reviewed in the current Healthcare Addendum text and any applicable enterprise data processing addendum.

Do not assume that enterprise status automatically means PHI is excluded from all training processes. Read the current terms before relying on them for compliance decisions.

## Compliance operations for AI-using clinics

Whether your clinic builds on the OpenAI API, uses vendor products that run on it, or simply has staff using AI tools for administrative work, the compliance program requirements are consistent: documented risk assessment, written policy, workforce training records, and a process for tracking which tools are approved for PHI-adjacent use.
