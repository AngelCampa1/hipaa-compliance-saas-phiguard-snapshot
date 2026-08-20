---
title: "How to Handle Shared Inboxes That Contain PHI"
description: "Shared email inboxes create HIPAA risk that most small clinics underestimate. Multiple staff sharing a single credential has no audit trail and violates the Security Rule's unique user identification requirement."
metaDescription: "HIPAA risks of shared email inboxes in clinics, including the unique user ID requirement, access control, and safer operating models."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: phi-workflows
schemaType: article
intent: consideration
summary: "Most small clinics operate at least one shared inbox where PHI flows constantly. The HIPAA compliance risk is not that email itself is prohibited - it is that shared credential access produces no audit trail, departing staff retain access longer than anyone realizes, and the PHI accumulates in a location with no retention governance."
keyTakeaways:
  - "The Security Rule's unique user identification requirement means each person accessing a shared inbox must have their own login credential - multiple people sharing one password does not satisfy HIPAA."
  - "PHI in email is subject to the 6-year HIPAA retention requirement, which most shared inboxes have no mechanism to enforce."
  - "Departing staff frequently retain access to shared inboxes through stale provisioning or active forwarding rules - this is an ongoing access control failure, not a one-time offboarding oversight."
  - "Clinical PHI should route through a designated clinical inbox with individual credentials, separate from the general info@ address."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: phi-workflow-audit-worksheet
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.312(a) - Access Control"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR"
  - title: "45 CFR § 164.530(j) - Documentation and Retention"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.530"
    publisher: "eCFR"
  - title: "HIPAA Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS"
  - title: "HHS Guidance on Electronic Communications"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/index.html"
    publisher: "HHS"
faq:
  - q: "Is a shared email inbox always a HIPAA violation?"
    a: "Not necessarily - but multiple people logging into a shared inbox with the same password does violate the unique user identification requirement. The inbox itself may be permissible if each person accesses it through their own individual credential, which is how Microsoft 365 shared mailboxes and delegated Google Workspace access work when configured correctly."
  - q: "How long does the clinic have to retain PHI received in a shared inbox?"
    a: "HIPAA requires covered entities to retain PHI for six years from the date of its creation or the date it was last in effect, whichever is later. Email is not exempt. Most shared inboxes have no retention policy applied, which means PHI accumulates indefinitely or gets deleted arbitrarily."
  - q: "What should happen to a shared inbox when a staff member leaves?"
    a: "Their individual access should be removed immediately. Any forwarding rules they set up should be audited. If they were the de facto manager of the inbox, a replacement access owner should be identified. Offboarding procedures should explicitly cover shared inbox access, not just individual account termination."
---

Almost every small clinic has at least one of these: an inbox at info@, referrals@, scheduling@, or billing@ that several staff access throughout the day. Patients email appointment questions. Outside providers send referral documents. Insurance carriers reply to prior authorization requests. PHI flows through these addresses constantly, and the clinic often treats the inbox as a utility rather than as a PHI handling surface with specific compliance obligations.

The problem is not that shared inboxes exist. It is how they are typically operated.

## What the Security Rule actually requires

The HIPAA Security Rule, at 45 CFR § 164.312(a)(2)(i), requires covered entities to assign a unique name and number for identifying and tracking user identity. This is the unique user identification requirement, and it applies to any electronic information system that handles ePHI - including email.

If three billing staff log into the same inbox using the same username and password, none of their activity can be distinguished in an audit. The log shows the credential, not the person. If a breach investigation asks who accessed that billing inbox on a specific date and what they viewed, the clinic has no answer. The shared credential makes the audit trail impossible by design.

A shared inbox can be used. The access model has to change. The correct pattern - used in properly configured Microsoft 365 shared mailboxes and in Google Workspace with delegated access - is one where the inbox itself is a shared resource but each person who accesses it does so through their own individual authentication. That produces a usable audit trail: this person opened these messages at these times.

Many small clinics have not configured their shared inboxes this way. If the practice's email setup involves staff sharing a login, that is the first thing to fix before addressing anything else about how the inbox is managed.

## Why departing staff are the persistent risk

When a clinical assistant or billing coordinator leaves the clinic, the offboarding checklist typically covers disabling their individual email account. It frequently does not cover auditing or removing their access to every shared inbox they touched.

The result is two failure modes that are both common and hard to detect after the fact.

The first is stale provisioning. The departing employee's individual credentials, if still active for any period after their last day, may retain delegate access to one or more shared inboxes. Depending on how the email system is configured, this access may outlast the individual account termination if shared mailbox access was granted separately.

The second is forwarding rules. A staff member who wants to continue receiving certain messages after leaving can set up a forwarding rule from the shared inbox to a personal or external email address. Without an audit of the inbox's forwarding rules at offboarding, that rule can run indefinitely. PHI continues to reach an address the clinic cannot control, and the clinic does not know it is happening.

Both failures are access control failures under 45 CFR § 164.312(a) and potential breach events depending on how long the unauthorized access ran and what PHI was involved. Offboarding procedures should include a step to audit every shared inbox the departing employee accessed, verify that their individual access has been removed, and confirm that no forwarding rules were added under their account or during their tenure.

## Retention: the silent problem

HIPAA's documentation and retention requirements under 45 CFR § 164.530(j) require covered entities to retain PHI for six years from the date of its creation or the date it was last in effect, whichever is later. Email is not exempt from this requirement.

Most shared inboxes have no retention policy applied. PHI sent to billing@ in connection with a claim from four years ago may still be sitting in that inbox, may have been arbitrarily deleted when someone cleaned up the mailbox, or may have been auto-purged by a platform default that no one ever reviewed. None of these outcomes align with the retention requirement.

Apply a formal retention policy to each shared inbox that receives PHI. Cloud-based email platforms support this at the organizational or mailbox level. Set the retention period to at least six years, document the policy in the clinic's HIPAA compliance program, and designate an access owner responsible for confirming the policy remains active.

## Content governance: what belongs in a shared inbox and what does not

Most shared inboxes receive a mix of PHI and non-PHI correspondence because the address is listed publicly and patients, vendors, and visitors use it for any purpose. The governance question is not how to eliminate PHI from the inbox - that is not realistic - but how to handle it appropriately when it arrives.

The clinic should establish and document the following:

**What is permitted to arrive:** General administrative inquiries, appointment requests, and operational correspondence that may include PHI. Documents containing significant clinical detail - complete referral summaries, lab results, records requests - should be routed to a designated clinical or records inbox with more controlled access, not to a general info@ address.

**What should be sent outbound from a shared inbox:** Very little PHI should leave a shared inbox. The general info@ address is not the right return path for clinical content. If a patient or provider needs a response that includes PHI, that response should originate from an address with appropriate access controls and logging, or from a secure messaging alternative.

**Patient-initiated email:** If a patient emails the shared inbox about their care, any response that includes their PHI requires the patient's prior written authorization acknowledging the risks of unencrypted email, unless the practice is using an encrypted email platform that satisfies the Security Rule's transmission security requirements under 45 CFR § 164.312(e)(1). Most general shared inboxes are not encrypted at the application layer. TLS transport encryption does not make unencrypted email safe for PHI - a misconception that appears frequently in small practice settings.

**Referral documents:** Referral summaries, clinical notes, and other provider-to-provider clinical correspondence should go to a designated inbox accessed only by the clinical staff who need them. Routing them to info@ or scheduling@ widens the access set unnecessarily and makes it harder to apply appropriate retention and access controls.

## The recommended operating model for small clinics

A small clinic with 3 to 50 staff can operate a compliant shared inbox model without large-organization IT infrastructure. The structure that satisfies the Security Rule is as follows.

A general administrative inbox - info@, contact@, or a similar address - handles non-clinical correspondence. It may receive PHI incidentally (patients rarely self-classify their own messages), but it is not the intended channel for clinical documents. Access is through individual credentials. The access list is reviewed quarterly or whenever staffing changes.

A designated clinical or records inbox - records@, referrals@, clinical@, or a similar address - handles provider-to-provider clinical correspondence, incoming referral documents, and records requests. Access is limited to the staff who process clinical records. It is accessed through individual credentials. The access list is reviewed at the same cadence as staffing changes. Retention is explicitly set to six years.

A billing inbox - billing@, ar@, or similar - handles insurance correspondence and payment-related PHI. Access is limited to billing staff. Reviewed at staffing changes.

Each inbox has an access owner - a named person responsible for the access list, the retention settings, and the offboarding review. This does not require a full-time compliance role. It requires that someone has been told this is theirs to manage.

## Reviewing historical access in existing inboxes

If your current shared inboxes have been operated without individual credentials, without access lists, and without retention policies, the corrective work follows a practical sequence.

Start with provisioning. Confirm that every current staff member accesses shared inboxes through their own individual login, not through a shared password. Work with the email platform administrator to reconfigure access if needed.

Audit forwarding rules. Review every shared inbox for any forwarding rules currently active. Remove any that route to personal or external addresses without a documented business reason.

Document the access history. Create a record of who currently has access to each shared inbox. This baseline is the starting point for future access reviews.

Apply retention settings. Set the retention period in the email platform to at least six years for each inbox that regularly receives clinical PHI. Document the setting and the date it was applied.

Designate access owners. Assign a named person as the access owner for each shared inbox. Give them a written description of their responsibilities: maintaining the access list, conducting offboarding reviews, and confirming retention settings.

Review the access list at the next staffing change and document that you did.

## Related pages

For how PHI moves through email generally, see [PHI in Email](/learn/phi-workflows/phi-in-email). For the referral coordination risks that often feed shared inboxes, see [PHI in Referral Coordination](/learn/phi-workflows/phi-in-referral-coordination). For how PHIGuard supports access control, audit trails, and task-level accountability across a compliance program, see [Pricing](/pricing).
