---
title: "Is Tableau HIPAA Compliant?"
vendor: "Tableau"
description: "What healthcare organizations need to know about Tableau's HIPAA BAA coverage, the difference between Tableau Cloud and Tableau Server for PHI analytics, and the de-identification risk in healthcare datasets."
metaDescription: "Is Tableau HIPAA compliant? Salesforce covers Tableau in its HIPAA BAA for qualifying plans. Learn the deployment differences, RLS requirements, and PHI risks."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
verificationDate: 2026-04-26
summary: "Salesforce includes Tableau in its HIPAA Business Associate Agreement for qualifying commercial customers. Tableau can be used with PHI-containing analytics datasets, but requires deliberate row-level security configuration and careful management of AI features. Small clinics rarely need Tableau - EHR-native reporting typically covers operational needs without the complexity of managing PHI access in a BI platform."
keyTakeaways:
  - "Salesforce includes Tableau in its HIPAA BAA for qualifying commercial licensing - verify current coverage at Salesforce's Trust Center before deployment."
  - "Tableau Cloud (hosted) vs. Tableau Server (self-hosted) have different PHI control responsibilities - self-hosted means the clinic controls the infrastructure security."
  - "Row-level security must be configured in Tableau - access to PHI-containing datasets is not automatically restricted by user role out of the box."
  - "Analytics datasets from EHR systems often contain large amounts of PHI - de-identification that doesn't meet HIPAA's safe harbor standard creates ongoing PHI obligations."
  - "Tableau Pulse, Tableau Copilot, and AI-driven features should be assessed for BAA coverage before enabling them on PHI-containing datasets."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-software-comparison-scorecard
relatedCommercialPath: /pricing
relatedLearnPath: /learn/vendor-management/when-a-vendor-needs-a-baa
sources:
  - title: "Salesforce HIPAA Compliance"
    url: "https://trust.salesforce.com/"
    publisher: "Salesforce"
  - title: "Tableau Trust and Security"
    url: "https://www.tableau.com/trust"
    publisher: "Tableau"
  - title: "45 CFR § 164.514(b) - Safe Harbor De-identification"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.514"
    publisher: "eCFR"
faq:
  - q: "Do I need a Salesforce account to get Tableau HIPAA coverage?"
    a: "Tableau's HIPAA coverage is provided through Salesforce's online services HIPAA BAA. Organizations that purchase Tableau through Salesforce's commercial licensing are covered under Salesforce's HIPAA framework. Verify current coverage terms in your specific Salesforce/Tableau agreement."
  - q: "What is row-level security in Tableau and why does it matter for HIPAA?"
    a: "Row-level security (RLS) restricts which rows of data a specific user can see in a Tableau report or dashboard. Without RLS, any user with access to a workbook sees all patient rows. With RLS, a physician sees only their patient panel; a billing analyst sees only billing-relevant aggregates. RLS must be designed into the workbook at build time - it is not automatic."
  - q: "Can Tableau Desktop be used with PHI without a cloud BAA?"
    a: "Tableau Desktop processes data locally on the workstation. When PHI-containing data is imported into a Desktop workbook, the workstation's security controls govern PHI protection. PHI on an encrypted, access-controlled clinic workstation used only by authorized staff may be acceptable - PHI in a Desktop file on a shared unencrypted machine is not. Cloud infrastructure BAA terms don't apply to local Desktop processing."
  - q: "Our EHR can export patient data to Excel. Can we import that into Tableau for analytics?"
    a: "Yes, if the data is protected as PHI throughout the Tableau workflow - appropriate BAA, row-level security limiting access, audit logging enabled. If the intent is to analyze de-identified data, verify that the EHR export actually meets HIPAA's safe harbor de-identification standard before treating it as de-identified."
---

Tableau is a data visualization and analytics platform owned by Salesforce. Healthcare organizations use it for patient volume, population health, clinical outcomes, and operational dashboards. Small clinics may use it to combine data from multiple systems.

The HIPAA assessment depends on the deployment model (cloud vs. self-hosted), the Salesforce agreement in place, and how PHI-containing datasets are configured.

**Note:** Salesforce's HIPAA BAA coverage and Tableau's product terms are updated periodically. Verify current coverage at Salesforce's Trust Center (salesforce.com/privacy/compliance/gdpr/hipaa) and Tableau's Trust site before connecting PHI data sources.

## Tableau's HIPAA Coverage

Salesforce includes Tableau in its HIPAA Business Associate Agreement for commercial licensing customers. Tableau is covered as part of the broader Salesforce platform services.

**Coverage depends on:**
- Being a commercial Salesforce/Tableau customer (not free trial or developer accounts)
- Using the services in a configuration covered by the BAA (typically Tableau Cloud with US data hosting)
- Having executed the HIPAA BAA with Salesforce

Confirm with your Salesforce account team or in your existing Salesforce Online Services agreement that Tableau is explicitly covered in your HIPAA BAA.

## Cloud vs. Self-Hosted: Different PHI Control Responsibilities

Tableau is available in two primary deployment models:

### Tableau Cloud (Formerly Tableau Online)

Tableau Cloud is hosted in Salesforce's cloud infrastructure. PHI stored in Tableau Cloud datasets is stored in Salesforce's environment, covered under the Salesforce HIPAA BAA. Salesforce's infrastructure security controls apply: encryption, access management, and audit logging.

**PHI controls needed for Tableau Cloud:**
- Row-level security on all PHI-containing workbooks
- Limited workspace access (not organization-wide sharing)
- Confirmation that Tableau Cloud's AI features are covered under BAA terms

### Tableau Server (Self-Hosted)

Tableau Server is installed and operated by the clinic or its IT vendor on clinic-controlled infrastructure. In this model, Salesforce's cloud infrastructure is not involved in storing PHI. The clinic's own servers host the Tableau environment.

**PHI controls needed for Tableau Server:**
- Encryption at rest on the server infrastructure (the clinic's responsibility, not Salesforce's)
- Network security for the server environment (access control, firewall, VPN for remote access)
- Server-level access control (who can access the Tableau Server environment)
- Row-level security on PHI-containing workbooks (same as Cloud)
- Patch management for the server operating system and Tableau Server application

Self-hosted Tableau gives more control over infrastructure and puts more responsibility on the clinic or its IT vendor for the security controls Salesforce handles automatically in the cloud offering.

## Row-Level Security: Required, Not Optional

Whether using Tableau Cloud or Tableau Server, row-level security (RLS) must be implemented on any workbook that contains PHI and is accessible to more than one user.

Without RLS, every user who can view the workbook sees every row of patient data regardless of their clinical or operational role. This violates the minimum necessary standard (45 CFR § 164.502(b)).

Implementing RLS in Tableau:

1. Create a security table that maps user identities to permitted data rows (e.g., physician ID → allowed patient panel IDs)
2. Add a calculated field to the workbook that filters data based on the current user's login
3. Publish the row-level security configuration with the workbook to Tableau Cloud/Server
4. Test with accounts representing different user roles before deploying to production

RLS is implemented at the workbook level in Tableau Desktop and must be re-applied if the workbook is rebuilt. It is not a global server-side setting that applies automatically to all workbooks.

## AI Features: Assess Before Enabling

Tableau's AI features - Tableau Pulse, Tableau Copilot, Einstein Discovery - process dataset content to generate insights. On PHI-containing datasets, you need to confirm these features are covered under your Salesforce BAA, whether Salesforce uses dataset content for model training, and where AI-processed data is stored.

Check this at implementation time. Salesforce's AI coverage under HIPAA changes as new features are released.

## De-identification Risk in Healthcare Analytics

A common pattern: export data from the EHR, remove patient names, and import into Tableau. Removing names is not de-identification under HIPAA.

HIPAA's safe harbor de-identification (45 CFR § 164.514(b)) requires removal of all 18 specified identifiers, including:
- Names
- Geographic subdivisions smaller than a state (including ZIP codes in some cases)
- All dates except year (service dates, admission dates, discharge dates)
- Ages over 89
- Account numbers, certificate/license numbers, phone numbers, email addresses

A dataset with diagnosis codes, ZIP codes, service years, and patient ages may still be PHI. In a small practice, rare diagnoses or small geographic areas allow re-identification even without explicit identifiers.

If a Tableau analytics use case is intended to use de-identified data, verify de-identification before treating the dataset as outside HIPAA's scope.

## Practical Assessment for Small Clinics

Most small clinics don't need Tableau. The EHR's built-in reporting covers appointment metrics, billing summaries, and provider productivity. Tableau earns its place when data must be combined from multiple systems or when EHR reporting can't produce what the practice needs.

If Tableau is the right tool for your clinic's analytics:
1. Confirm BAA coverage in your Salesforce agreement
2. Choose Tableau Cloud for simplicity of infrastructure security
3. Implement row-level security before connecting PHI datasets
4. Assess AI features before enabling
5. Treat all EHR exports as PHI until de-identification is verified
