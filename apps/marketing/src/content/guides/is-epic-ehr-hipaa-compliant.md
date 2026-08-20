---
title: "Is Epic EHR HIPAA Compliant? What Clinics Must Know"
vendor: "Epic Systems"
seoTitle: "Is Epic EHR HIPAA Compliant?"
description: "Epic is designed for healthcare compliance and executes BAAs with covered entities, but HIPAA compliance with Epic is a shared responsibility. Learn what Epic covers, where the covered entity's obligations begin, and the most common Epic configuration mistakes that create PHI exposure."
metaDescription: "Is Epic EHR HIPAA compliant? Epic signs BAAs and is ONC-certified, but covered entities remain responsible for access controls, audit monitoring, and."
publishedAt: 2026-04-29
updatedAt: 2026-04-29
verificationDate: 2026-04-29
summary: "Epic Systems executes BAAs with covered entities and is ONC-certified for information blocking compliance. Epic provides a compliant platform, but the covered entity is responsible for configuration, user access management, audit log review, and workforce training. Common configuration gaps — not the Epic platform itself — account for most HIPAA exposure at Epic-using organizations."
keyTakeaways:
  - "Epic executes BAAs with covered entities as part of standard customer agreements."
  - "Epic is ONC-certified and designed from the ground up for healthcare compliance — it is not a retrofitted general-purpose tool."
  - "HIPAA compliance with Epic is a shared responsibility: Epic provides the compliant platform; the covered entity is responsible for configuration, access provisioning, and audit oversight."
  - "Common Epic configuration mistakes that create PHI exposure include overly broad user access roles, failure to review audit logs, and improperly configured patient portal sharing."
  - "Accessing Epic from unsecured devices or networks is the covered entity's responsibility, not Epic's."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/vendor-management/when-a-vendor-needs-a-baa"
sources:
  - title: "Epic HIPAA Compliance Overview"
    url: "https://www.epic.com/epic/post/hipaa"
    publisher: "Epic Systems"
  - title: "ONC Health IT Certification Program"
    url: "https://www.healthit.gov/topic/certification-ehrs/certification-health-it"
    publisher: "ONC / HHS"
  - title: "HHS HIPAA Guidance for Covered Entities"
    url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html"
    publisher: "HHS"
  - title: "HHS Information Blocking Rule"
    url: "https://www.healthit.gov/topic/information-blocking"
    publisher: "ONC / HHS"
faq:
  - q: "Does Epic sign a BAA with every customer?"
    a: "Epic executes BAAs with covered entities as part of its standard customer agreement process. The specific terms are part of the enterprise contract negotiation. Review the BAA terms your organization has executed with Epic to understand the scope and confirm it is up to date with your current deployment."
  - q: "Is Epic ONC-certified?"
    a: "Yes. Epic is certified under the ONC Health IT Certification Program for its EHR modules. ONC certification confirms that the certified modules meet specific technical standards, including data exchange and patient access requirements. ONC certification and HIPAA compliance are related but distinct — certification confirms technical standards, while HIPAA compliance involves the full set of operational safeguards and policies."
  - q: "We had a data incident at our Epic-using clinic. Is that Epic's fault?"
    a: "Most Epic-related security incidents at covered entities involve configuration or operational failures, not defects in Epic's platform. Common causes: staff credentials shared between users, workstations that were not locked when unattended, overly broad access roles that allowed staff to view records outside their scope of care, and failure to disable access promptly when staff left the organization. These are covered entity responsibilities."
  - q: "What should we be reviewing in Epic audit logs?"
    a: "Epic generates detailed audit logs of user access to patient records. Covered entities should regularly review these logs for access outside normal care relationships, high-volume record access by individual users, access to records of VIP or high-profile patients, and access after hours or from unusual locations. Epic provides report tools for this purpose — review your current configuration with your Epic analyst to ensure these reports are being run and reviewed."
---

## Short answer

Yes — Epic is a HIPAA-compliant platform in the sense that it is designed for healthcare use, executes BAAs with covered entities, and provides the technical capabilities required to support a compliant operation. However, "Epic is HIPAA compliant" needs qualification: Epic provides the compliant platform; the covered entity is responsible for how that platform is configured and operated. The most common sources of HIPAA exposure at Epic-using organizations are not Epic platform defects — they are configuration choices and operational practices that are entirely within the covered entity's control.

## Epic's BAA and design-for-healthcare posture

Epic Systems is one of the most widely deployed EHR vendors in U.S. healthcare, with significant presence in large health systems and academic medical centers. Unlike general-purpose software tools retrofitted with compliance features, Epic is designed from the ground up for the healthcare regulatory environment.

Key compliance-relevant facts about Epic:

- **BAA execution:** Epic executes BAAs with covered entities as part of standard customer agreements. The BAA defines Epic's obligations as a business associate — including security safeguards, breach notification requirements, and data handling restrictions.

- **ONC certification:** Epic is certified under ONC's Health IT Certification Program. Certified modules meet specific technical standards for interoperability, patient access, and data exchange. ONC certification is required for EHRs used by providers who participate in federal incentive programs.

- **Information blocking compliance:** Epic is designed to support the ONC Information Blocking Rule requirements, which require that certified health IT developers not engage in practices that prevent or interfere with the access, exchange, or use of electronic health information.

- **Security architecture:** Epic's technical architecture includes encryption at rest and in transit, role-based access controls, audit logging, and session management features appropriate for PHI-handling systems.

None of this means that a clinic using Epic is automatically HIPAA compliant. It means Epic provides the right foundation.

## The shared responsibility model: what the covered entity owns

When a clinic signs a contract with Epic and deploys the EHR, compliance responsibility is divided. Epic owns the platform security, the availability of the BAA, and the technical implementation of the features it provides. The covered entity owns the configuration and operation of those features for its specific clinical environment.

The covered entity's responsibilities include:

### Access provisioning and role management

Epic's role-based access control system allows administrators to define precisely which records each user can access, based on their job function, patient care relationship, and organizational unit. This is one of the most powerful compliance features in Epic — and one of the most commonly misconfigured.

Common access control mistakes:
- Assigning broad "all access" roles to staff who only need access to a subset of records
- Failing to revoke access promptly when staff leave or change roles
- Sharing login credentials between staff members (strictly prohibited under HIPAA's individual accountability requirements)
- Not reviewing access roles when job functions change

### Audit log monitoring

Epic maintains detailed audit logs of every user action: which records were accessed, when, from where, and by whom. These logs are a critical compliance tool — but they are only valuable if someone is reviewing them.

Covered entities should establish a regular schedule for audit log review and document that reviews are occurring. Epic provides standard reports for this purpose, including:
- User access reports by patient
- Access outside care relationship reports
- High-volume access reports
- After-hours access reports

Failure to review audit logs is both a compliance gap and a practical risk: snooping employees, credential theft, and insider threats often appear first in audit log data.

### Patient portal configuration

Epic's MyChart patient portal allows patients to access their own health records, communicate with providers, and receive test results. Misconfigured patient portal settings are a common source of unintended disclosure.

Areas to review:
- Which test results are automatically released versus held for provider review before patient access
- Whether the portal is sending result notifications to email addresses that are not regularly monitored
- Proxy access settings — who has been granted proxy access to view a patient's records, and whether those grants are current

### Device and network security

Epic is accessed through browsers, mobile applications, and dedicated workstations. The security of those devices and the networks they connect through is the covered entity's responsibility.

Epic cannot enforce:
- Automatic screen locks on workstations left unattended
- Encryption on laptops used to access the Epic web interface
- VPN use when staff connect to Epic from outside the clinic network
- Mobile device management on personal phones used to access Haiku or Canto

These controls are the covered entity's administrative and technical safeguard obligations under the HIPAA Security Rule.

### Workforce training

Epic provides HIPAA-compliant functionality, but it cannot train the clinic's workforce on appropriate PHI handling, minimum necessary access principles, or how to report a security incident. That training is the covered entity's responsibility and must be documented.

## Configuration gaps that create real-world exposure

These are the most common Epic-related HIPAA gaps encountered in covered entity operations:

**1. Overly broad access roles inherited from go-live.** Many organizations implement broad access roles during the initial deployment timeline pressure, planning to refine them post-go-live. The refinement never happens, and five years later the same broad roles remain.

**2. Former employees with active credentials.** Staff offboarding processes that fail to promptly disable Epic access are a recurring finding in HIPAA audits. Access should be disabled on the last day of employment, not days or weeks later.

**3. Audit log reports configured but never reviewed.** Epic audit reports require someone to run and review them. If the reports are configured but no one has the assigned responsibility to review them on a schedule, they provide no protective value.

**4. Break-the-glass access not reviewed.** Epic's "break-the-glass" feature allows users to override access restrictions to view records outside their normal scope, for emergencies. Every break-the-glass access should be reviewed by a supervisor. If no review process is in place, this feature is a compliance gap.

**5. Improperly configured external interfaces.** Epic connects to labs, imaging, pharmacies, and other external systems. Interface configuration errors can result in data being sent to the wrong destination or received from unauthorized sources.

## Reviewing your Epic BAA

Organizations should periodically review the BAA they have executed with Epic to confirm:

- The agreement is current and covers your active product modules
- The entity named in the BAA matches the current organizational structure (mergers, acquisitions, or practice changes may require updates)
- The breach notification timeline in the BAA meets HIPAA's requirements
- The subprocessor disclosure in the BAA reflects Epic's current infrastructure

See [how to audit vendor HIPAA claims](/learn/vendor-management/how-to-audit-vendor-hipaa-claims) for a methodology for reviewing vendor agreements.

## Epic compliance is not a substitute for a compliance program

Using Epic does not mean the covered entity has a compliance program. A compliance program requires policies, workforce training, risk assessments, incident response procedures, and documentation — none of which Epic provides as part of its EHR deployment.
