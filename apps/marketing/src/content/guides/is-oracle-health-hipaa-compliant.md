---
title: "Is Oracle Health (Cerner) HIPAA Compliant?"
vendor: "Oracle Health / Cerner"
seoTitle: "Is Oracle Health (Cerner) HIPAA Compliant?"
description: "What covered entities must know about Oracle Health's BAA, the post-merger transition from Cerner, covered entity responsibilities for configuration and access controls, and how to verify your agreement is current under the Oracle Health entity."
metaDescription: "Is Oracle Health (formerly Cerner) HIPAA compliant? BAAs are available, but covered entities must verify agreements were updated post-merger and review."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "Oracle Health (formerly Cerner, acquired by Oracle in 2022) executes BAAs with covered entities and provides extensive compliance features for healthcare organizations. HIPAA compliance is shared: Oracle Health provides the platform; the covered entity is responsible for access configuration, audit monitoring, and workforce obligations. Organizations with pre-merger Cerner contracts should confirm their BAA has been reviewed under the Oracle Health entity."
keyTakeaways:
  - "Oracle Health executes BAAs with covered entities as part of standard client agreements."
  - "Oracle as a parent company also has a HIPAA compliance program for Oracle Cloud Infrastructure that may be relevant for organizations using Oracle Health cloud services."
  - "Post-merger transition: covered entities with pre-2022 Cerner contracts should confirm their BAA has been reviewed under the Oracle Health entity structure."
  - "Covered entity responsibilities — access controls, audit log review, user provisioning, incident response — remain with the healthcare organization, not Oracle Health."
  - "Oracle Health's post-merger roadmap involves transitioning Cerner customers to Oracle's cloud infrastructure; review the compliance implications of any infrastructure migrations."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Oracle Health Privacy and Compliance"
    url: "https://www.oracle.com/health/"
    publisher: "Oracle Health"
  - title: "Oracle HIPAA Compliance"
    url: "https://www.oracle.com/cloud/"
    publisher: "Oracle"
  - title: "HHS Guidance on Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "ONC Health IT Certification Program"
    url: "https://www.healthit.gov/topic/certification-ehrs/certification-health-it"
    publisher: "ONC / HHS"
faq:
  - q: "Is my pre-2022 Cerner BAA still valid after the Oracle acquisition?"
    a: "Legal counsel should advise on the specific enforceability of your existing agreement under the post-acquisition entity structure. As a practical compliance measure, organizations with pre-merger Cerner contracts should proactively engage Oracle Health to review and update their BAA to reflect the current contracting entity. An outdated BAA that names an entity that no longer exists in the same legal form creates uncertainty."
  - q: "Does Oracle Health's ONC certification still apply post-merger?"
    a: "ONC certification is product-based. Cerner's products (now Oracle Health products) maintain their ONC certification through Oracle Health's ongoing certification activities. Review the current ONC CHPL listings for the specific Oracle Health products you use to confirm current certification status."
  - q: "Oracle is migrating Cerner systems to Oracle Cloud Infrastructure — are there HIPAA implications?"
    a: "Any infrastructure migration involving PHI should be reviewed for compliance implications before it occurs. If Oracle Health is migrating your data to Oracle Cloud Infrastructure, confirm that the new infrastructure is covered under your BAA, that the migration itself meets Security Rule requirements, and that you receive appropriate notification of the migration under your agreement terms."
  - q: "What is Oracle Cloud Infrastructure's HIPAA posture?"
    a: "Oracle Cloud Infrastructure (OCI) participates in Oracle's enterprise HIPAA compliance program. Qualifying enterprise customers can access a BAA for OCI services. Oracle publishes its HIPAA compliance documentation at oracle.com/cloud/compliance/hipaa. If your Oracle Health deployment involves OCI infrastructure, confirm with Oracle that your enterprise agreement covers both the Oracle Health application layer and the OCI infrastructure layer."
---

## Short answer

Yes — Oracle Health executes BAAs with covered entities and provides an EHR platform designed for the healthcare regulatory environment. Oracle Health is a defensible choice for healthcare organizations from a compliance foundation standpoint. Two critical qualifications apply: (1) the covered entity remains responsible for configuration, access management, and operations — Oracle Health provides the platform, not the compliance program; and (2) organizations with pre-merger Cerner contracts should actively verify whether their BAA has been reviewed and updated to reflect the Oracle Health entity structure.

## The 2022 Oracle acquisition and what it means for compliance

Oracle completed its acquisition of Cerner Corporation in June 2022 and rebranded the healthcare division as Oracle Health. This transition has several compliance-relevant dimensions:

**Corporate entity changes:** The legal entity executing contracts and BAAs with healthcare clients changed as part of the acquisition. Organizations that executed their BAA with "Cerner Corporation" are in a relationship that has changed at the corporate level. While the platform and services continue to operate, the contractual entity is different.

**Oracle's broader compliance program:** Oracle is a large enterprise technology company with a well-developed compliance program, including a dedicated HIPAA compliance track for Oracle Cloud Infrastructure and its enterprise products. This represents additional organizational compliance infrastructure compared to the standalone Cerner entity.

**Infrastructure migration:** Oracle has announced plans to migrate Cerner's existing on-premises and hosted infrastructure to Oracle Cloud Infrastructure over time. This migration, as it affects individual customers, creates compliance review obligations for those customers.

**Product roadmap:** Oracle Health's product roadmap involves integrating Oracle's AI and cloud technologies into the Cerner clinical suite. As these integrations roll out, covered entities should review the compliance implications of new AI-assisted features before enabling them.

## What Oracle Health provides as a BAA-covered vendor

Oracle Health's platform provides the technical compliance foundation covered entities need:

**BAA execution:** Oracle Health executes BAAs with covered entities as part of standard client agreements. For the reasons noted above, organizations with older Cerner-era agreements should confirm their current BAA status.

**Comprehensive audit logging:** Cerner/Oracle Health systems maintain detailed audit trails of user interactions with patient records — access events, modification events, and query activity. These logs are a critical HIPAA compliance tool.

**Role-based access controls:** The Oracle Health platform supports granular access role configuration, allowing covered entities to implement minimum necessary access across clinical and administrative users.

**Encrypted data handling:** Data is encrypted at rest and in transit within Oracle Health's managed environments.

**ONC certification:** Oracle Health's clinical products maintain ONC certification for applicable modules. Certification status can be verified through the ONC's CHPL (Certified Health IT Product List) for specific product versions.

**Oracle Cloud Infrastructure compliance program:** For organizations using Oracle Health cloud-hosted services, Oracle's OCI compliance program includes HIPAA coverage under qualifying enterprise agreements, providing a layered compliance structure.

## Covered entity responsibilities that Oracle Health cannot substitute for

Every point made about shared responsibility with Epic applies equally to Oracle Health. The covered entity must own:

### Access provisioning and termination

Every staff member who accesses Oracle Health should have an individual account with access permissions matched to their job function. Account creation, role assignment, and especially account termination are the covered entity's responsibility. The most consistent finding in HIPAA enforcement actions related to EHR systems is stale accounts — former employees or contractors with active credentials.

Establish a formal process for EHR account termination that is tied directly to HR offboarding. Document, test, and audit this process regularly.

### Audit log review

Oracle Health generates logs; the covered entity reviews them. Set a formal schedule for running and reviewing the standard access reports. At minimum:
- Monthly review of unusual access patterns (high-volume access, after-hours access, access to records outside the user's care relationship)
- Review of any flagged access events (if your deployment supports automated anomaly detection)
- Annual review of the overall access log review process itself

Document these reviews. If OCR investigates and you cannot demonstrate that audit logs were being reviewed, the absence of review is itself a finding.

### Workforce training

Oracle Health does not train your staff. Your practice must deliver HIPAA privacy and security training at onboarding and annually thereafter. Training should specifically address:
- Minimum necessary access in the EHR context
- How to report potential privacy incidents
- Password and credential security requirements
- Proper use of remote access capabilities

### Incident response integration

When a potential PHI incident is identified — unauthorized access to records, a staff member accessing records outside their care relationship, a lost device with EHR access — the covered entity must have a documented incident response process that includes Oracle Health where applicable. Know how to contact Oracle Health's incident response team, what information they need, and what their commitment is for response and support.

## The post-merger BAA review: a practical checklist

For organizations with pre-2022 Cerner contracts, a targeted review of the BAA is a reasonable precaution. Items to verify:

1. **Is the contracting entity in your BAA Oracle Health (or the appropriate Oracle entity), or does it still reference Cerner Corporation?** Engage Oracle Health's account team to confirm the current contracting entity and whether an agreement update is needed.

2. **Do the products listed in your BAA reflect your current deployment?** Product names, versions, and feature sets may have changed since your original agreement. Confirm that your BAA covers the modules you are actively using.

3. **Are subprocessors disclosed and current?** Oracle's infrastructure and subprocessor landscape may have changed post-merger. Request the current subprocessor disclosure from Oracle Health.

4. **Is the breach notification timeline specified and compliant?** Confirm the timeline and notification mechanism for security incidents under the current agreement.

5. **Are termination and data return terms current?** Understand what happens to your data if you end the Oracle Health relationship, in both format and timeline.

See [how to audit vendor HIPAA claims](/learn/vendor-management/how-to-audit-vendor-hipaa-claims) for a systematic approach to this review, and [when a vendor needs a BAA](/learn/vendor-management/when-a-vendor-needs-a-baa) for the foundational framework.

## Oracle Health AI features: a forward-looking compliance note

Oracle has publicly committed to integrating AI capabilities into Oracle Health's clinical suite, applying Oracle's broader AI infrastructure. As these features are deployed to your environment — AI-assisted documentation, clinical decision support, patient communication tools — each new AI-assisted feature that processes PHI warrants a compliance review before activation.

Questions to ask for each new AI feature:
- Is this feature covered under the existing Oracle Health BAA, or does it involve a new subprocessor?
- Does enabling this feature change how PHI is processed or transmitted?
- Does the feature generate outputs that contain PHI, and where are those outputs stored?

Document these assessments as features are introduced. Do not assume that because Oracle Health has a BAA, every new feature Oracle introduces is automatically compliant for your specific environment.

## Managing the Oracle Health relationship in your compliance program
