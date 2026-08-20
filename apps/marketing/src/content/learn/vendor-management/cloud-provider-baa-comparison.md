---
title: "AWS vs Azure vs Google Cloud: HIPAA BAA Comparison for Small Clinics"
seoTitle: "AWS vs Azure vs Google Cloud HIPAA BAA"
description: "All three major cloud providers offer HIPAA BAAs, but coverage differs by service. This comparison explains how to sign, what is eligible, what is excluded, and what small clinics need to know about shared responsibility."
metaDescription: "AWS HIPAA, Azure HIPAA, and Google Cloud HIPAA BAA comparison for small clinics: how to sign, eligible services, exclusions, and shared responsibility..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: vendor-management
intent: consideration
schemaType: article
summary: "AWS, Azure, and Google Cloud each offer HIPAA BAAs, but the signing process, eligible service lists, and excluded services differ across all three. Small clinics typically interact with these platforms indirectly — through a vendor whose product runs on cloud infrastructure — but understanding the BAA landscape helps evaluate vendors and confirm that the full PHI chain is covered."
keyTakeaways:
  - "All three major cloud providers offer HIPAA BAAs, but each covers only a defined list of eligible services."
  - "Signing processes differ: AWS uses AWS Artifact, Azure uses the admin portal under the MPSA/OST, Google Cloud uses the console."
  - "The shared responsibility model means the cloud provider secures the infrastructure; the vendor or clinic secures the application and data configuration."
  - "Services not on the eligible list — even from a provider with a BAA — cannot be used to process PHI."
  - "Small clinics who do not manage their own cloud infrastructure should confirm their vendor's cloud provider and whether a BAA is in place."
sources:
  - title: "AWS HIPAA Eligible Services Reference"
    url: "https://aws.amazon.com/compliance/hipaa-eligible-services-reference/"
    publisher: "AWS"
  - title: "Azure HIPAA/HITECH Overview"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft Learn"
  - title: "Google Cloud HIPAA Implementation Guide"
    url: "https://cloud.google.com/security/compliance/hipaa"
    publisher: "Google Cloud"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS Office for Civil Rights"
faq:
  - q: "Does a cloud provider's HIPAA BAA cover the vendor application running on top of it?"
    a: "No. The cloud BAA covers the infrastructure layer. The vendor application is a separate layer with its own compliance obligations. The vendor must have its own BAA with the clinic and must configure its application according to HIPAA requirements, regardless of what cloud it runs on."
  - q: "If a vendor runs on AWS, does that mean the vendor is HIPAA-compliant?"
    a: "Not automatically. It means the infrastructure layer may have a BAA in place. The vendor still needs to correctly configure security controls, limit access, encrypt data, maintain audit logs, and sign a BAA with covered entities it serves. Running on AWS does not transfer HIPAA compliance to the vendor."
  - q: "Can a small clinic sign a cloud provider BAA directly?"
    a: "Yes. If a clinic manages its own cloud infrastructure — hosting an application, running a database — it should sign the cloud provider's BAA. Most clinics that use SaaS products do not need to sign cloud provider BAAs themselves; their vendor handles that layer."
  - q: "What happens if a vendor uses a cloud service that is not on the HIPAA-eligible list?"
    a: "Using a non-eligible service to store or process PHI creates a compliance gap. The cloud BAA does not cover that service, meaning PHI processed there has no contractual HIPAA protection at the infrastructure level. This is a material risk factor when evaluating vendors."
  - q: "How do I find out which cloud provider a vendor uses?"
    a: "Ask directly as part of your vendor evaluation process. Request the vendor's security questionnaire or trust page, which typically identifies cloud infrastructure providers and confirms whether BAAs are in place. Many vendors publish this on a dedicated security or compliance page."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

When a clinic evaluates software vendors, the vendor's underlying cloud infrastructure matters for HIPAA compliance. Most SaaS products in healthcare run on one of three platforms: Amazon Web Services (AWS), Microsoft Azure, or Google Cloud. Each offers a HIPAA business associate agreement, but coverage is not identical across all three — and the BAA at the infrastructure layer is only part of the compliance picture.

This guide explains the key differences in signing process, eligible services, and what is excluded on each platform. It also addresses the shared responsibility model that most clinics misunderstand, and provides practical guidance for clinics who do not manage their own cloud infrastructure.

## AWS HIPAA

### Signing the BAA

AWS provides its BAA through AWS Artifact, a compliance document portal available to all AWS account holders. Signing requires logging into the AWS Management Console, navigating to AWS Artifact, and accepting the AWS Business Associate Addendum. The process is self-service — no sales contact or negotiation is required for standard AWS customers. The BAA is a standard form; terms are not negotiable for accounts without enterprise agreements.

### Eligible services

AWS maintains a public list of HIPAA-eligible services at the AWS HIPAA Eligible Services Reference page. As of publication, more than 150 services are on the eligible list. These include core compute and storage services (EC2, S3, RDS), container services (ECS, EKS), database services (DynamoDB, Aurora), and many managed services including Lambda, SageMaker, and CloudWatch.

### What is excluded

Services not on the eligible list cannot be used to store, process, or transmit PHI under the BAA — even if the account has a signed BAA. AWS makes this explicit: the BAA applies only to the services listed as HIPAA-eligible. A developer who stores PHI in an AWS service that is not on the eligible list has created a compliance gap regardless of whether the account has signed the BAA.

The eligible list changes as AWS adds services. Covered entities and their vendors should confirm they are checking the current list, not a cached or printed version.

## Azure HIPAA

### Signing the BAA

Microsoft covers HIPAA compliance under its Online Services Terms (OST) and Data Processing Agreement (DPA). Customers who purchase Azure services under the Microsoft Products and Services Agreement (MPSA) can accept the BAA through the Microsoft admin portal. For enterprise customers, the BAA is typically included in the volume licensing agreement. Unlike AWS, there is no single self-service portal specifically labeled "BAA acceptance" — the agreement is embedded in the licensing framework.

### Eligible services

Microsoft publishes a list of Azure services that are in scope for HIPAA compliance. The scope list is available through the Microsoft Service Trust Portal and includes foundational services (Azure Virtual Machines, Azure Blob Storage, Azure SQL Database, Azure Active Directory) and managed services including Azure Kubernetes Service, Azure Monitor, and Azure Key Vault.

### What is excluded

Not all Azure services are in scope for HIPAA. Preview services and certain developer tools are typically excluded. Microsoft's guidance specifies that customers are responsible for confirming that the specific services they use are covered under the BAA before processing PHI.

Azure Marketplace third-party solutions — software from vendors published in the Azure Marketplace — are not covered by Microsoft's BAA. Each marketplace vendor is responsible for its own HIPAA compliance and BAA.

## Google Cloud HIPAA

### Signing the BAA

Google Cloud offers a HIPAA BAA through the Google Cloud console. Customers navigate to the HIPAA Implementation Guide page to access the BAA, which is accepted through the console. Google Workspace (formerly G Suite) follows a separate path — the Workspace HIPAA BAA is accepted through the Google Workspace Admin console and covers a different, narrower set of services. Clinics that use both Google Cloud infrastructure and Google Workspace must ensure BAAs are in place under both agreements if both touch PHI.

### Eligible services

Google Cloud publishes a list of HIPAA-covered services. Core infrastructure (Compute Engine, Cloud Storage, BigQuery, Cloud SQL, Kubernetes Engine) and several managed services are on the covered list. The covered services list is available on the Google Cloud HIPAA implementation page.

### What is excluded

Services outside the covered list cannot be used for PHI. Google's documentation explicitly notes that customers must verify service eligibility before use. Consumer Google products — Google Drive, Gmail personal accounts, Google Analytics in its standard form — are not covered by the Google Cloud HIPAA BAA and must not be used for PHI even if the clinic has signed the Cloud BAA.

## Service comparison at a glance

| Factor | AWS | Azure | Google Cloud |
|---|---|---|---|
| BAA signing method | AWS Artifact (self-service) | Admin portal / licensing agreement | Cloud console |
| Eligible service count | 150+ | Large, varies by region | Moderate, well-documented |
| Eligible service list | aws.amazon.com/compliance/hipaa-eligible-services-reference | Microsoft Service Trust Portal | cloud.google.com/security/compliance/hipaa |
| Negotiable terms | No (standard; enterprise may differ) | Via enterprise licensing | No (standard) |
| Marketplace third-party tools | Not covered | Not covered | Not covered |
| Consumer products excluded | Yes | Yes (M365 personal) | Yes (Google consumer products) |

## The shared responsibility model

All three cloud providers operate under a shared responsibility model. Understanding it prevents a common misconception: that signing a cloud BAA makes PHI on that platform "HIPAA-compliant."

The cloud provider is responsible for the security of the infrastructure — the physical data centers, the network fabric, the hypervisor layer, and the managed services. This is the provider's side of the model.

The customer — or the vendor whose application runs on the platform — is responsible for everything built on top of that infrastructure: application security, access controls, encryption configuration, audit logging, identity and access management, and proper use of the platform's security features.

A covered entity or vendor that stores PHI in an S3 bucket configured for public access has violated HIPAA even though AWS has signed a BAA. The BAA covers the S3 infrastructure; the bucket configuration is the customer's responsibility. HHS enforcement actions have resulted from exactly this type of misconfiguration.

## What this means for small clinics

Most small clinics do not manage their own cloud infrastructure. They buy SaaS products — EHR systems, billing platforms, scheduling tools — that run on top of cloud infrastructure managed by the vendor.

For those clinics, the practical questions are:

**Does your vendor have a BAA with you?** The clinic-to-vendor BAA is the most important document. Without it, no amount of cloud-level compliance helps.

**Does the vendor have a BAA with their cloud provider?** This is part of the vendor's security posture. Ask for confirmation as part of vendor due diligence. A vendor running a healthcare product on AWS without a signed AWS BAA has a material compliance gap.

**Is the vendor using HIPAA-eligible services?** A vendor whose product stores PHI in services not on the eligible list has a compliance gap at the infrastructure layer — even if they have signed the cloud provider's BAA. Ask vendors to confirm which specific services their product uses and whether those services are on the eligible list.

**For clinics managing their own cloud environments:** If your clinic directly operates cloud infrastructure — running a database, storing files, operating any service that processes PHI — sign the BAA with your cloud provider before any PHI touches that environment. Confirm the specific services you use are on the eligible list. Review that list when adding new services.

Cloud infrastructure BAAs are a necessary condition for HIPAA compliance in cloud environments. They are not sufficient on their own. The configuration of services, the security of applications, and the vendor contracts covering each layer all matter equally.
