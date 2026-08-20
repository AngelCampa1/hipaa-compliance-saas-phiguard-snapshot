---
title: "Is Microsoft Azure HIPAA Compliant?"
vendor: "Microsoft Azure"
seoTitle: "Is Microsoft Azure HIPAA Compliant?"
description: "What small clinics and healthcare IT teams must know about Azure's BAA coverage, which services qualify, and the security controls required for HIPAA-eligible cloud workloads."
metaDescription: "Is Microsoft Azure HIPAA compliant? Learn about Azure's BAA, covered services, required configuration, and what clinics must do before building PHI..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Azure can be HIPAA compliant, but compliance is not automatic. Microsoft provides a BAA through the Microsoft Products and Services Agreement and Online Services Terms, covering a defined list of qualifying Azure services. Clinics and their IT vendors must execute the BAA, restrict PHI workloads to covered services only, and configure the required security controls — encryption, logging, and network isolation. Azure's HIPAA coverage is separate from Microsoft 365's BAA path."
keyTakeaways:
  - "Azure can support HIPAA-compliant workloads — but only with the BAA executed and PHI restricted to qualifying services."
  - "Microsoft includes a BAA in the Online Services Terms; the clinic or its IT vendor must accept it through the Microsoft agreement portal."
  - "The Azure HIPAA BAA is separate from Microsoft 365's BAA — using one does not cover the other."
  - "Clinics must configure encryption at rest, encryption in transit, audit logging, and network controls on every PHI workload."
  - "Azure Policy and Microsoft Defender for Cloud can help audit compliance posture, but they do not replace a clinic-level risk assessment."
sources:
  - title: "HIPAA/HITECH Act compliance on Azure"
    url: "https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-hipaa-us"
    publisher: "Microsoft Learn"
  - title: "HIPAA/HITECH Act — Microsoft Trust Center"
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-hipaa-hitech"
    publisher: "Microsoft Trust Center"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Does Microsoft automatically sign a BAA when a clinic subscribes to Azure?"
    a: "No. The BAA is part of Microsoft's Online Services Terms, which means it applies when you accept those terms through the Microsoft agreement — but you must confirm that the agreement covering your subscription includes the HIPAA-specific language. Many Azure subscriptions go through resellers or CSP partners; confirm with your agreement holder that the OST BAA is in place."
  - q: "Which Azure services are covered under the HIPAA BAA?"
    a: "Microsoft publishes a list of qualifying services in the Azure compliance documentation. The list is extensive but not unlimited — services in preview or certain specialized offerings may not qualify. Review the current list on Microsoft Learn before building any PHI workload."
  - q: "Is Azure the same as Microsoft 365 for HIPAA purposes?"
    a: "No. Azure and Microsoft 365 have separate service agreements and separate BAA paths. A Microsoft 365 BAA does not extend HIPAA coverage to Azure workloads, and vice versa. Clinics using both must confirm that each is covered under the relevant agreement."
  - q: "Does a HIPAA-compliant Azure configuration guarantee we won't have a breach?"
    a: "No. BAA coverage and proper configuration reduce risk, but they do not eliminate it. Clinics still need access controls, workforce training, incident response procedures, and a compliance program covering the full HIPAA Security Rule requirements."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Microsoft Azure can be HIPAA compliant, but that compliance is not automatic. Microsoft provides a HIPAA Business Associate Agreement through its Online Services Terms, covering a defined set of qualifying Azure services. The clinic or its IT vendor must accept that agreement, restrict all PHI workloads to covered services, and implement the required security controls. Azure left in a default configuration is not HIPAA-ready — it requires deliberate setup.

## BAA availability

Microsoft includes a HIPAA BAA within the **Online Services Terms (OST)**, which governs Azure and other Microsoft cloud services. This means the BAA is part of the agreement you accept when subscribing to Azure, rather than a separately negotiated document.

Key facts about the Azure BAA:

- The BAA is in the OST and applies to qualifying services enumerated in Microsoft's compliance documentation
- If your Azure subscription runs through a Cloud Solution Provider (CSP) or Microsoft partner, confirm that the OST applies to your specific agreement
- The BAA covers Azure services in the designated scope — it does not extend to non-qualifying services, preview features, or third-party marketplace products

Microsoft publishes a regularly updated list of HIPAA-covered Azure services on Microsoft Learn. Check that list before building any PHI workload.

## Azure versus Microsoft 365: a critical distinction

Azure is Microsoft's Infrastructure-as-a-Service and Platform-as-a-Service layer. It is the cloud environment where you deploy virtual machines, databases, storage accounts, containers, and custom applications.

Microsoft 365 (Exchange, Teams, SharePoint, OneDrive) has a **separate BAA path** through the Microsoft Products and Services Agreement. A BAA covering Microsoft 365 does not extend HIPAA coverage to Azure workloads. A BAA covering Azure does not extend HIPAA coverage to Microsoft 365 services.

Clinics that use both Azure for application hosting and Microsoft 365 for communication must ensure each service is independently covered.

## What the clinic must do

Executing the BAA is step one. The clinic or its hosting vendor must also implement the security controls required by the HIPAA Security Rule:

**Encryption**
- Enable encryption at rest on all Azure Storage accounts, Azure SQL Databases, and Cosmos DB instances that hold PHI
- Encryption at rest is enabled by default on most modern Azure services, but confirm it is active and that keys are managed appropriately (Azure Key Vault is standard)
- Enforce HTTPS-only access on all storage endpoints and application services
- TLS 1.2 or higher is required for data in transit

**Access control**
- Use Azure Active Directory (now Entra ID) with role-based access control to restrict who can access PHI workloads
- Require multi-factor authentication for all accounts with access to PHI-containing resources
- Follow least-privilege principles — staff and service accounts should have only the permissions required for their function

**Audit logging**
- Enable Azure Monitor and Azure Activity Logs on all subscriptions that host PHI workloads
- Route diagnostic logs to a Log Analytics workspace with an appropriate retention period (HIPAA requires audit log retention for at least six years)
- Set up alerts for unusual access patterns, failed authentication attempts, and configuration changes

**Network isolation**
- Place PHI workloads in Virtual Networks with appropriate subnet segmentation
- Use Network Security Groups and Azure Firewall to restrict inbound and outbound traffic
- Disable public endpoint access on databases and storage unless required; use private endpoints instead

## HIPAA-eligible services versus general Azure services

Not every Azure service in the catalog is covered under the HIPAA BAA. Services in preview, certain AI and cognitive services, and third-party marketplace offerings may not qualify. Before deploying any new Azure service that will touch PHI, verify it appears on the current qualified services list.

This is an operational practice, not a one-time check. As your Azure environment grows, new services get added. Each one that touches PHI must be assessed before deployment.

## The shared responsibility model

Microsoft's HIPAA compliance covers its infrastructure — the physical data centers, the hypervisor layer, and the platform services. The clinic and its IT team are responsible for everything above that line:

- How PHI is stored and who can access it
- How applications authenticate users
- How data is backed up and how backups are protected
- How incidents are detected, contained, and reported

Microsoft provides the compliant infrastructure. The clinic provides the compliant application and operational practices. Neither side can substitute for the other.

## Azure Policy and Defender for Cloud

Microsoft offers tools that help clinics assess their compliance posture against the HIPAA baseline:

- **Azure Policy** includes built-in HIPAA/HITRUST policy sets that scan your resources and flag non-compliant configurations
- **Microsoft Defender for Cloud** (formerly Azure Security Center) provides a Regulatory Compliance dashboard that maps your Azure environment against HIPAA controls

These tools do not replace a formal risk assessment or a compliance program. They identify configuration gaps. Closing those gaps still requires human judgment about the clinic's specific risk environment.

## What PHIGuard does alongside Azure
