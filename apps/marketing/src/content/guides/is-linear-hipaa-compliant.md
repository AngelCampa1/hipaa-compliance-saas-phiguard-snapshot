---
title: "Is Linear HIPAA Compliant for Healthcare Teams?"
vendor: "Linear"
seoTitle: "Is Linear HIPAA Compliant?"
description: "What healthcare teams using Linear for project and issue tracking need to know about HIPAA BAA availability, the risks of clinical operations teams adopting an engineering-focused tool, and safe use boundaries."
metaDescription: "Is Linear HIPAA compliant? Linear does not offer a HIPAA BAA. Learn what this means for clinical operations teams and hybrid tech-clinical workflows with..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
verificationDate: 2026-04-28
summary: "Linear does not offer a HIPAA Business Associate Agreement. Linear is an engineering and product management tool designed for software development teams, not healthcare operations. Clinical operations staff or hybrid tech-clinical teams using Linear for any task that references patient information create HIPAA exposure. General IT and engineering work with no patient data contact is fine; any workflow where task content, comments, or attachments could contain PHI is not."
keyTakeaways:
  - "Linear does not offer a HIPAA BAA. It is not HIPAA-eligible for PHI workloads."
  - "Linear is built for software engineering and product teams — it is not designed for clinical operations."
  - "Hybrid tech-clinical teams that use Linear for cross-functional work create compliance risk if any task touches patient information."
  - "Task titles, issue descriptions, comments, and attachments in Linear must contain zero PHI."
  - "The fix is to keep clinical operations in a HIPAA-covered system and limit Linear to engineering-only workflows."
sources:
  - title: "Privacy Policy"
    url: "https://linear.app/privacy"
    publisher: "Linear"
  - title: "Security"
    url: "https://linear.app/security"
    publisher: "Linear"
  - title: "Business Associates"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
faq:
  - q: "Can a health tech company use Linear for their engineering team?"
    a: "Yes, if the work tracked in Linear has no contact with PHI. Tracking software bugs, feature requests, sprint work, and internal engineering tasks is fine. The risk appears when engineering work intersects with patient data — bug reports that include example patient records, tickets that reference specific patient-reported issues with identifying details, or integration test data containing PHI."
  - q: "Does Linear have any HIPAA compliance plans in development?"
    a: "Linear has not publicly announced a HIPAA compliance program or BAA offering. Check Linear's trust and compliance documentation for the most current status before making any tool decisions."
  - q: "What if we only use Linear for internal engineering tickets with no patient data?"
    a: "That is the appropriate use case for Linear at a healthcare company. Keep patient-adjacent work — clinical operations tasks, compliance tracking, incident management, policy workflows — in a separate, HIPAA-covered system. Engineering-only workflows with no PHI contact are a reasonable boundary."
  - q: "Is using Linear for a clinical product roadmap a HIPAA risk?"
    a: "A product roadmap that describes features without referencing specific patients is generally fine. The risk is if roadmap items, user story descriptions, or meeting notes embedded in Linear contain actual patient feedback, patient identifiers, or case details from real patients."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-pm-tool-comparison-guide"
relatedCommercialPath: "/hipaa"
---

## Short answer

Linear is not HIPAA compliant. Linear does not offer a Business Associate Agreement. This is not a configuration gap — there is no version of Linear that provides the contractual HIPAA coverage a covered entity requires when PHI is involved. Clinical operations work, compliance task management, and any patient-adjacent workflow must not live in Linear.

## BAA availability

Linear does not offer a HIPAA BAA on any plan. Linear's product is designed for software engineering teams: issue tracking, sprint management, engineering project coordination, and product development workflows. Healthcare compliance is not a stated design goal or a documented offering.

There is no enterprise tier, healthcare-specific plan, or compliance add-on from Linear that changes this. As of the verification date of this guide, a clinic cannot execute a HIPAA BAA with Linear.

## Who uses Linear and where the risk enters healthcare organizations

Linear's user base is primarily software product companies and tech startups. Many health tech companies — companies building digital health products, patient engagement platforms, telehealth tools, or clinical decision support software — use Linear for their engineering teams. This is the origin of the compliance question.

At a health tech company, the engineering team operates separately from direct patient care. A ticket tracking a login bug or a feature request for a new dashboard contains no PHI. That engineering use of Linear is fine.

The risk enters when:

**Bug reports include patient-identifying details.** A QA engineer or customer success rep logs a ticket referencing "Patient John D. reported this error while accessing their lab results" — now PHI is in Linear.

**User research artifacts are attached to issues.** A product team attaches a customer interview recording or transcript to a Linear ticket. If the customer is a patient or discusses health information, PHI is in the attachment.

**Clinical operations teams adopt Linear for cross-functional work.** A health tech company's clinical operations staff starts using Linear alongside the engineering team to track compliance tasks, training assignments, or policy updates. If any of those tasks reference patient cases or clinical data, PHI enters Linear.

**Integration testing references real data.** Engineers link to test environments seeded with real patient data in Linear tickets. Even a URL or database identifier that points to real PHI creates an exposure.

## The hybrid team problem

The compliance challenge is most acute at organizations with hybrid tech-clinical teams — where software engineers, product managers, clinical operations staff, and care coordinators share the same toolset. Linear works well for engineering. When clinical operations teams adopt the same tool for convenience, the PHI boundary becomes unclear.

The solution is not to restrict the engineering team's tool choices. The solution is to maintain a clear, enforced boundary:

- Linear (or any non-BAA-covered project management tool) is approved for engineering workflows only
- Clinical operations, compliance management, policy tracking, and any workflow that could touch patient data must run in a HIPAA-covered system
- This boundary must be documented in the clinic's or company's tool approval policy and communicated to all staff

A staff member who is uncertain which tool to use for a given task should default to the HIPAA-covered tool.

## What "zero PHI" means in practice for Linear tasks

For health tech teams that do use Linear for engineering, maintaining the PHI boundary requires practical discipline:

**Task titles.** Issue titles are visible in list views, search results, and integrations. A title that names a patient and references their records puts PHI in a visible location with no access controls appropriate for clinical data.

**Descriptions and comments.** Longer-form content in issue descriptions and comment threads is where PHI most often enters. Engineers and customer success staff should be trained not to include patient names, dates of birth, medical record numbers, diagnoses, or any other PHI in these fields.

**Attachments and links.** Attached files, screen recordings, and linked documents can contain PHI if they originate from a production system or customer interaction.

**Labels and custom fields.** Custom attributes and metadata in Linear are not PHI-safe either. A custom field called "Affected Patient" is a compliance signal that the tool is being misused for clinical data.

## What an appropriate tool boundary looks like

A health tech company or clinic with a Linear deployment should document something like this in its tool approval and data classification policy:

- Linear is approved for: engineering issue tracking, product development tasks, sprint planning, and internal technical project coordination where no PHI is involved
- Linear is NOT approved for: clinical operations tasks, compliance tracking, patient-related incidents, policy management, staff clinical training records, or any task where content might reference a patient

Staff in clinical or hybrid roles should have clear guidance on which system to use for each type of work.

## What PHIGuard provides for clinical operations
