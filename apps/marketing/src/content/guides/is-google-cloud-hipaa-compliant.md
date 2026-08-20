---
title: "Is Google Cloud HIPAA Compliant for Healthcare Workloads"
vendor: "Google Cloud"
seoTitle: "Is Google Cloud HIPAA Compliant"
description: "What clinics and healthcare IT teams need to know about Google Cloud's HIPAA BAA, covered services, the Google Cloud Healthcare API, and required security configuration for PHI workloads."
metaDescription: "Is Google Cloud HIPAA compliant Learn about the Google Cloud BAA, covered services, Healthcare API, and what clinics must configure before using Google..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Google Cloud requires a plan-and-use review, not a blanket HIPAA label. What clinics and healthcare IT teams need to know about Google Cloud's HIPAA BAA, covered services, the Google Cloud Healthcare API, and required security configuration for PHI workloads. Clinics should verify BAA availability, covered services, admin settings, retention, access controls, integrations, and whether staff can keep PHI out of unsupported workflows before using it with patient information."
keyTakeaways:
  - "Google Cloud offers a HIPAA BAA, signed through the Google Cloud console — not through customer support or negotiation."
  - "Google Cloud and Google Workspace have completely separate BAA paths; each must be individually covered."
  - "Only services on Google's covered service list qualify — standard catalog services not on the list must not process PHI."
  - "The Google Cloud Healthcare API is purpose-built for FHIR, HL7, and DICOM healthcare data workloads."
  - "Clinics must configure encryption, IAM access controls, audit logging, and VPC Service Controls on PHI workloads."
sources:
  - title: "HIPAA Compliance on Google Cloud"
    url: "https://cloud.google.com/security/compliance/hipaa"
    publisher: "Google Cloud"
  - title: "Google Cloud Business Associate Agreement"
    url: "https://cloud.google.com/terms/business-associate-agreement"
    publisher: "Google Cloud"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "How does a clinic sign the Google Cloud BAA?"
    a: "The Google Cloud BAA is accepted through the Google Cloud console under the compliance section. It is self-service — no sales engagement or special negotiation required. You must be a project owner or billing account administrator to accept the agreement."
  - q: "Does the Google Cloud BAA cover Google Workspace?"
    a: "No. Google Cloud (cloud.google.com) and Google Workspace (workspace.google.com) are separate products with separate BAA paths. If your clinic uses both, you need to sign the Google Workspace BAA separately. See the Google Workspace HIPAA documentation for that process."
  - q: "What is the Google Cloud Healthcare API?"
    a: "The Healthcare API is a Google Cloud service specifically designed for healthcare data. It supports FHIR R4, HL7 v2, and DICOM data stores natively. It is covered under the Google Cloud HIPAA BAA and is designed to meet healthcare interoperability and data management requirements."
  - q: "Is BigQuery covered under the Google Cloud HIPAA BAA?"
    a: "BigQuery appears on Google's list of HIPAA-covered services, subject to appropriate configuration. Confirm against the current covered services list in Google Cloud's compliance documentation before using BigQuery for any PHI analytics workloads."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Google Cloud can support HIPAA-compliant workloads. Google offers a self-service BAA accepted through the Cloud console, covering a defined list of qualifying services. Clinics must sign that agreement, keep PHI on covered services only, and configure the required security controls. Google Cloud and Google Workspace have separate BAA paths — using one does not cover the other.

## BAA availability

Google provides a HIPAA BAA through the **Google Cloud console** as a self-service agreement. Unlike some enterprise cloud providers, Google does not require a sales negotiation to access the BAA — any project owner or billing administrator can accept it through the compliance settings in the console.

The BAA applies to the specific Google Cloud services listed on Google's HIPAA covered services page. That list is published and updated by Google. Services not on the list — including many newer AI and machine learning services — are not covered and must not process PHI.

## Google Cloud versus Google Workspace: two separate BAA paths

This is the most common source of confusion for clinic administrators and IT vendors working with Google services.

**Google Cloud** (cloud.google.com) is the infrastructure and developer platform: Compute Engine, Cloud Storage, Cloud SQL, BigQuery, Cloud Run, Google Kubernetes Engine, and the Healthcare API.

**Google Workspace** (workspace.google.com) is the productivity suite: Gmail, Google Drive, Google Docs, Google Meet, Google Calendar, and Google Chat.

These are distinct products with distinct service agreements and distinct BAA coverage. If your clinic uses Google Cloud to host a custom application AND uses Google Workspace for clinical email, you must sign **both** BAAs separately. A signed Google Cloud BAA provides no HIPAA coverage for anything that runs through Gmail or Drive, and vice versa.

## What the clinic must do

Signing the BAA establishes the contractual relationship. HIPAA compliance still requires proper technical and administrative configuration.

**Identity and Access Management**
- Use Google Cloud IAM with least-privilege principles for all accounts and service accounts that touch PHI workloads
- Require multi-factor authentication for all human accounts with access to PHI-containing projects
- Separate PHI workloads into dedicated projects with project-level IAM policies

**Encryption**
- Google Cloud encrypts data at rest by default using AES-256. Confirm this is active on all resources
- For higher-assurance environments, use Customer-Managed Encryption Keys (CMEK) with Cloud KMS
- Enforce HTTPS-only communication with all Cloud Storage buckets and application endpoints
- TLS 1.2 or higher is enforced by default on most Google Cloud services; verify for any custom applications

**Audit logging**
- Enable Cloud Audit Logs — Admin Activity logs, Data Access logs, and System Event logs — on all projects handling PHI
- Route logs to Cloud Logging with an appropriate retention period; HIPAA requires six-year retention for audit records
- Configure log-based alerts for unauthorized access attempts and configuration changes

**Network controls**
- Use VPC Service Controls to create security perimeters around PHI workloads, preventing data exfiltration
- Use Private Google Access to route traffic to Google APIs without traversing the public internet
- Restrict public IP addresses on databases and compute instances handling PHI

## The Google Cloud Healthcare API

For clinics or healthcare IT vendors building systems that natively handle clinical data, Google Cloud's Healthcare API warrants specific attention.

The Healthcare API provides managed data stores for:
- **FHIR R4** — the current healthcare interoperability standard
- **HL7 v2** — the legacy messaging format still widely used in clinical systems
- **DICOM** — the standard for medical imaging data

The Healthcare API is covered under the Google Cloud HIPAA BAA, purpose-built for healthcare data models, and designed to support clinical interoperability requirements. Small clinics building custom integrations with EHR systems or diagnostic devices may find it more suitable than general-purpose databases.

## Which Google Cloud services are covered

Google publishes an explicit list of HIPAA-covered services in its Cloud documentation. The list includes core compute and storage services, databases including Cloud SQL and Firestore, BigQuery for analytics, networking services, and the Healthcare API.

Services NOT on the list must not process PHI. Before integrating any new Google Cloud service into a PHI workload, check the current covered services list. Google updates this list periodically.

## The shared responsibility model

Google is responsible for the physical security of its data centers, the security of the underlying infrastructure, and the security of the platform services. The clinic is responsible for:

- Configuring IAM, network controls, and encryption correctly
- Managing who has access to PHI-containing resources
- Training staff on data handling policies
- Detecting and responding to incidents
- Maintaining the compliance program documentation required by HIPAA

Google's BAA and infrastructure security do not substitute for these operational responsibilities.

## What PHIGuard does alongside Google Cloud
