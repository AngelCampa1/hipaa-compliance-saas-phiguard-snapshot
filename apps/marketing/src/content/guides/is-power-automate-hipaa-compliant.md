---
title: "Is Microsoft Power Automate HIPAA Compliant"
vendor: "Microsoft Power Automate"
seoTitle: "Is Power Automate HIPAA Compliant"
description: "What clinics need to know about Power Automate's HIPAA BAA coverage, which connectors are HIPAA-eligible, and how to safely automate clinical workflows without creating PHI exposure."
metaDescription: "Is Power Automate HIPAA compliant Microsoft covers Power Automate under its Online Services Terms BAA — but only when using HIPAA-covered connectors. Learn..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Microsoft Power Automate requires a plan-and-use review, not a blanket HIPAA label. What clinics need to know about Power Automate's HIPAA BAA coverage, which connectors are HIPAA-eligible, and how to safely automate clinical workflows without creating PHI exposure. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out of unsupported workflows before using it with patient information. Power."
keyTakeaways:
  - "Power Automate is covered under Microsoft's Online Services Terms BAA — it is HIPAA-eligible as a platform."
  - "HIPAA coverage depends entirely on the connectors used in each flow. A single non-covered connector in a PHI flow creates exposure."
  - "First-party Microsoft connectors (SharePoint, Outlook, Teams, Dataverse) are generally covered; third-party and premium connectors require individual assessment."
  - "Clinics must inventory all Power Automate flows that touch PHI and document the HIPAA status of each connector used."
  - "Power Automate's default sharing settings may expose flows and their logic to unintended users — restrict access appropriately."
sources:
  - title: "Compliance and data privacy in Power Platform"
    url: "https://learn.microsoft.com/en-us/power-platform/admin/wp-compliance-data-privacy"
    publisher: "Microsoft Learn"
  - title: "HIPAA/HITECH Act — Microsoft Trust Center"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft Trust Center"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does the Microsoft 365 BAA cover Power Automate?"
    a: "Power Automate is covered under the Microsoft Online Services Terms BAA, which is accepted through your Microsoft agreement. If your clinic has a qualifying Microsoft 365 or Azure enterprise agreement that incorporates the OST, Power Automate should fall within its scope. Confirm with your Microsoft account representative which products are explicitly named in your agreement."
  - q: "What happens if a flow uses a non-covered connector to send PHI?"
    a: "If a Power Automate flow sends PHI to a service that is not covered by a signed BAA, that is an unprotected disclosure of PHI — a potential HIPAA breach. The Microsoft BAA covers the Power Automate platform, not the third-party systems it connects to. Each external service in a flow is a separate BAA question."
  - q: "Can we use the Salesforce connector for a PHI flow in Power Automate?"
    a: "Only if you have a signed BAA with Salesforce and your Salesforce configuration is HIPAA-eligible. The fact that Power Automate is BAA-covered does not extend coverage to Salesforce or any other third-party connector. Both ends of the connection need BAA coverage."
  - q: "Are Power Apps and Power BI covered under the same BAA as Power Automate?"
    a: "Microsoft Power Platform products (Power Apps, Power Automate, Power BI, Dataverse) are generally covered under the Online Services Terms, but confirm the specific coverage with your Microsoft agreement. Do not assume all Power Platform products are uniformly covered."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Power Automate is HIPAA-eligible. Microsoft covers it under the Online Services Terms BAA, the same agreement that covers qualifying Azure and Microsoft 365 services. The compliance question does not end there. A Power Automate flow is a chain of connected services — and the flow is only as HIPAA-compliant as the weakest connector in the chain. Clinics must audit every connector in every PHI-handling flow before the automation goes live.

## BAA availability

Microsoft includes Power Automate in the scope of its **Online Services Terms (OST) BAA**. This is the same agreement that covers qualifying Azure services and Microsoft 365 products. If your clinic has a qualifying Microsoft agreement that incorporates the OST, Power Automate should be covered.

Confirm this with your Microsoft account representative or through the Microsoft Product Terms documentation. The specific products covered under the OST are enumerated in Microsoft's compliance documentation, and the list can change as products are added or restructured.

Power Automate is part of the **Microsoft Power Platform**, which also includes Power Apps, Power BI, and Dataverse. Coverage for each product should be verified individually.

## The connector problem

This is the central HIPAA compliance challenge with Power Automate: **the platform is covered, but the connectors may not be.**

Power Automate works by connecting to external services through connectors. When a flow handles PHI, every service that receives, processes, or stores that data becomes a downstream processor. If that downstream service is not covered by a BAA with the clinic, PHI is being sent to an uncovered third party.

**First-party Microsoft connectors** — SharePoint, Exchange Online, Outlook, Teams, Dataverse, and other Microsoft 365 and Azure services — are generally covered under the same OST BAA that covers Power Automate. Verify each one against the covered services list.

**Third-party connectors** — Salesforce, Slack, Dropbox, DocuSign, Google services, and the hundreds of other services available in the Power Automate connector library — are NOT covered by Microsoft's BAA. Each is a separate vendor relationship requiring its own BAA assessment.

**Premium and custom connectors** — connectors marked as premium in Power Automate often connect to specialized external services. These carry the same third-party BAA requirement.

## How to audit PHI flows

Clinical operations teams using Power Automate for any automation that touches patient data need a documented connector audit:

1. **Inventory all flows.** Identify every active flow in your Power Automate environment.
2. **Flag PHI flows.** Determine which flows receive, send, or transform any data that includes patient identifiers, health conditions, appointment information, or other PHI fields.
3. **List every connector in each PHI flow.** For every trigger, action, and condition in a PHI flow, identify the external service it connects to.
4. **Assess BAA status for each connector's service.** For each external service: is there a signed BAA between the clinic and that vendor Is the service HIPAA-eligible at all
5. **Remediate non-covered connectors.** For any connector connecting to a non-BAA-covered service, either obtain the BAA, reconfigure the flow to avoid sending PHI to that service, or retire the flow.

Document this audit. It is part of the risk assessment documentation HIPAA requires.

## Access controls on flows

Power Automate's collaboration features can create unintended access risks. By default, flows can be shared with colleagues, and shared flows include access to the connection credentials embedded in them. In a clinical context:

- Restrict shared ownership of PHI flows to authorized staff only
- Use service accounts with scoped credentials for flows that access PHI-containing systems
- Review the Power Platform admin center for any flows that have been shared outside intended teams
- Apply Data Loss Prevention (DLP) policies in the Power Platform admin center to restrict which connectors can be used in the clinical environment

## Automation use cases clinics should evaluate carefully

**Appointment confirmation and recall.** Flows that pull patient appointment data from an EHR and send confirmation messages via email or SMS involve PHI. Every system in that chain must be covered.

**Insurance verification.** Flows that query payer systems with patient identifiers and write results back to a scheduling system handle PHI at every step. Assess each connector.

**Clinical task assignment.** Flows that create tasks based on clinical triggers — a new lab result, a pending referral — and route them to staff may carry PHI in the trigger payload.

**Document routing.** Flows that move patient documents between systems (form submissions, clinical records, consent forms) carry PHI in the document itself.

For each of these use cases, the automation logic itself may be sound. The compliance question is whether every external system involved has a BAA in place.

## What PHIGuard handles alongside Power Automate
