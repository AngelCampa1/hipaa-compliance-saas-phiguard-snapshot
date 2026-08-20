---
title: "HIPAA Incident Classification Tree"
seoTitle: "HIPAA Incident Classification Tool"
headline: "Classify any suspected HIPAA incident in under 5 minutes"
description: "A structured decision tree for classifying security and privacy incidents under HIPAA. Covers the security vs. privacy distinction, PHI involvement, breach vs. impermissible disclosure vs. near-miss, the three breach exceptions, the four-factor risk assessment, and required notification actions with timelines. Designed for front-line staff and Privacy Officers."
metaDescription: "Free HIPAA incident classification decision tree. Security vs. privacy, breach vs. near-miss, the 4-factor test, breach exceptions, and notification timelines."
magnetSlug: "hipaa-incident-classification-decision-tree"
summary: "Use this incident classification tree to help small clinics turn cited HIPAA requirements into dated operating evidence. It gives staff a practical way to record decisions, owners, review dates, exceptions, and follow-up tasks, then tie the completed artifact back to policies, BAAs, risk analysis, patient-rights workflows, or safeguard reviews."
stage: "consideration"
sequenceStage: "consideration"
kind: article
pillar: incident-response
schemaType: how-to
intent: consideration
bullets:
  - "Security vs. privacy incident triage: the first decision node distinguishes between a security incident under the Security Rule and a privacy incident under the Privacy Rule — the response procedures differ and both may apply simultaneously"
  - "PHI involvement determination: structured questions for determining whether PHI was involved in the incident, including the commonly missed categories (scheduling data with identifiers, paper records, voicemail with patient information)"
  - "The three breach exceptions under 45 CFR § 164.402: unintentional workforce acquisition, inadvertent disclosure to authorized workforce, and inability of unauthorized person to retain — explained with practical examples of when each does and does not apply"
  - "The four-factor risk assessment: a structured walkthrough of the four factors HHS requires to support a low probability of compromise finding — nature and extent of PHI, unauthorized person's identity, whether PHI was acquired or viewed, and mitigation extent"
  - "Notification decision output: based on the tree outcome, clear guidance on which notification actions are required (internal only, individual notification, HHS, media) and on what timeline"
faq:
  - q: "What does the four-factor test actually require, and how do we document it?"
    a: "The four-factor test at 45 CFR § 164.402(2) is used to determine whether a presumed breach — meaning an impermissible use or disclosure of unsecured PHI — can be demonstrated to have a low probability that PHI has been compromised. The four factors are: (1) the nature and extent of the PHI involved, including the types of identifiers and the likelihood of re-identification; (2) the unauthorized person who used the PHI or to whom the disclosure was made; (3) whether PHI was actually acquired or viewed, or whether there is a strong likelihood it was not; (4) the extent to which the risk to PHI has been mitigated. The analysis must be documented. If all four factors support a low probability of compromise, breach notification is not required — but you must retain the documentation of the analysis."
  - q: "A staff member reported a near-miss — they almost sent records to the wrong patient. No PHI was actually disclosed. Is there still a compliance action?"
    a: "Yes, but the action is different from a breach response. A near-miss where PHI was not actually disclosed does not trigger breach notification, but it should be: logged in the incident log, investigated to understand how the near-miss occurred, and reviewed for whether a process change is warranted. The Security Rule's security incident procedures requirement at 45 CFR § 164.308(a)(6) covers near-misses — covered entities must identify and respond to suspected or known security incidents, document incidents and their outcomes, and mitigate harmful effects."
  - q: "Who should use this decision tree Only the Privacy Officer, or front-line staff?"
    a: "The decision tree is designed to be used in two ways. Front-line staff should use the first section — the triage questions — to determine whether an event they have observed warrants a report to the Privacy Officer. The Privacy Officer should use the full tree to conduct the formal classification analysis. The tree is not a substitute for the Privacy Officer's judgment; it is a structured framework that ensures all relevant questions are considered and the analysis is documented."
  - q: "Is this free?"
    a: "Yes. Enter your email and we will send the full resource to your inbox."
  - q: "Why do you need my email?"
    a: "We send the resource directly to your inbox. We will not add you to a marketing list without your consent."
publishedAt: "2026-04-29"
updatedAt: "2026-04-29"
sources:
  - title: "45 CFR § 164.402 — Definitions (Breach)"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.402"
    publisher: "eCFR"
  - title: "45 CFR § 164.404 — Notification to Individuals"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.404"
    publisher: "eCFR"
  - title: "Breach Notification Rule Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-incident-classification-decision-tree"
relatedCommercialPath: "/product"
relatedLearnPath: "/learn/incident-response/hipaa-incident-classification-framework"
---

## Why Incident Classification Is the Most Consequential Step in Your Response

When a suspected HIPAA incident occurs, the first 24 to 48 hours determine whether it is managed well or managed badly. Classification is the first step: is this a security incident, a privacy incident, or both Was PHI involved If PHI was involved, was there an impermissible disclosure If there was an impermissible disclosure, was there a breach — or does one of the three exceptions apply If it was a breach, what notification is required, and on what timeline?

Each of these questions has a specific regulatory answer. Getting any of them wrong in either direction — treating a breach as a non-breach and failing to notify, or treating a near-miss as a breach and triggering unnecessary notification — has consequences. Missed notification is an independent HIPAA violation. Unnecessary or premature notification damages patient trust and creates reputational harm that is difficult to reverse.

The decision tree in this downloadable PDF is designed to be used in real time, during an active incident response, when there is pressure to move quickly and the facts are often incomplete. It structures the analysis so that each decision node is addressed in the right order, with the relevant regulatory citation attached, and with space to record the factual basis for each determination. The completed decision tree is itself documentation of the classification analysis.

## What's in the PDF

### The Decision Tree: Node by Node

**Node 1 — Is This a Security Incident or a Privacy Incident?**

A security incident under the Security Rule (45 CFR § 164.304) is "the attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations in an information system." A privacy incident under the Privacy Rule is an impermissible use or disclosure of PHI that violates the Privacy Rule's requirements.

These categories overlap but are not identical. A ransomware attack that disables systems is a security incident even if no PHI is confirmed to have been accessed. A staff member disclosing a patient's diagnosis to a family member without authorization is a privacy incident that may or may not involve a security incident. The node guides the responder to correctly categorize the event — and to recognize when both tracks apply simultaneously — because the response procedures differ.

**Node 2 — Was PHI Involved?**

For security incidents, the question is whether PHI was on the systems affected. For privacy incidents, the question is whether the disclosure involved PHI. This node includes a reference list of commonly missed PHI categories:

- Scheduling data that includes patient name plus appointment date (which implies a medical condition or at least a provider relationship)
- Voicemail from a patient that includes their name, callback number, and condition or medication
- Paper records left in an unsecured location
- Email containing a list of patient names or identifiers without clinical data (still PHI — name plus the fact of being a patient is PHI under the definition at 45 CFR § 160.103)
- A photograph or image that includes a patient's face plus identifiable clinical context

If PHI was not involved, the incident is still worth logging but does not trigger breach notification analysis.

**Node 3 — Was There an Impermissible Use or Disclosure?**

Not every event involving PHI is an impermissible disclosure. This node presents the permitted use and disclosure categories from 45 CFR § 164.502 and asks whether the use or disclosure fits within them. If the disclosure was permitted — for treatment, payment, health care operations, a required disclosure, or another enumerated exception — it is not an impermissible disclosure and notification analysis stops here.

**Node 4 — Does a Breach Exception Apply?**

If the disclosure was impermissible, it is a presumed breach unless one of the three exceptions at 45 CFR § 164.402(1) applies:

- **Exception 1 — Unintentional acquisition by workforce.** A workforce member unintentionally acquires, accesses, or uses PHI in good faith and within the scope of their authority, and the acquisition was not further used or disclosed impermissibly. Example: a nurse opens the wrong chart by clicking the wrong patient in the EHR and closes it immediately upon realizing the error.

- **Exception 2 — Inadvertent disclosure to authorized personnel.** A workforce member inadvertently discloses PHI to another authorized workforce member of the same covered entity or business associate. Example: a message with patient information sent to the wrong care team member within the same clinic.

- **Exception 3 — Inability to retain.** The unauthorized person to whom the disclosure was made would not reasonably have been able to retain the PHI. Example: a fax sent to the wrong number where the recipient immediately confirmed they had shredded the fax without reading it (limited practical application — the decision tree explains when this exception is and is not credible).

The tree presents each exception with a plain-English explanation and practical examples, and notes the common mistake of applying an exception too liberally. If no exception applies, the analysis proceeds to the four-factor test.

**Node 5 — Does the Four-Factor Test Support a Low Probability of Compromise Finding?**

The four-factor test at 45 CFR § 164.402(2) is the primary mechanism for determining that a presumed breach is not a reportable breach. The four factors are:

1. **Nature and extent of PHI involved.** What types of PHI, how many identifiers, what is the sensitivity of the information, and what is the likelihood of re-identification if the PHI disclosed was de-identified?

2. **Identity of the unauthorized person.** Was the unauthorized person identified Is there evidence they used or could use the PHI?

3. **Whether PHI was actually acquired or viewed.** Is there evidence the PHI was actually accessed and read, or is there a strong likelihood it was not (for example, an email received by a system that logs delivery but the recipient account was a defunct email address)?

4. **Extent of mitigation.** Has the risk been mitigated Has the PHI been retrieved Has the unauthorized recipient confirmed destruction?

The tree guides the Privacy Officer through each factor, provides a scoring framework, and explains the documentation requirements. If the four-factor analysis supports low probability of compromise, the event is not a reportable breach — but you must document and retain the analysis.

**Node 6 — Notification Determination**

If the event is classified as a reportable breach, this node maps the notification obligations:

- Individual notification: required, timeline, method (45 CFR § 164.404)
- HHS notification: required, portal submission, timeline — immediate if 500+ individuals, end-of-year log if fewer than 500 (45 CFR § 164.408)
- Media notification: required only if 500 or more residents of a single state or jurisdiction are affected (45 CFR § 164.406)
- Business associate notification to covered entity: required within BAA-defined timeline if the breach was at the business associate level

### Documentation Template

The PDF includes a single-page documentation template that mirrors the decision tree structure. The Privacy Officer completes the template during the classification analysis: records the facts at each decision node, the determination made, and the factual basis for each determination. This completed form is the documentation of the analysis, retained per 45 CFR § 164.530(j).

## Who Should Use This Resource

This decision tree is designed for:

- **Privacy Officers** who must classify incidents formally and document the analysis.
- **Practice Administrators** who are the first responders to a reported incident and need to conduct initial triage.
- **All workforce members** for the triage section — understanding the first two nodes (security vs. privacy, was PHI involved) equips staff to recognize reportable events and escalate appropriately.

## Regulatory Basis

The definition of breach at 45 CFR § 164.402 defines a breach as "the acquisition, access, use, or disclosure of protected health information in a manner not permitted under subpart E of this part which compromises the security or privacy of the protected health information." The three exceptions to the definition of breach and the four-factor risk assessment are both at 45 CFR § 164.402.

HHS's guidance on the Breach Notification Rule provides additional examples and clarifications on applying the four-factor test.

## Related Resources

Once a breach is confirmed, use the [HIPAA breach notification letter template](/resources/hipaa-breach-notification-letter-template) for required individual notifications. For building the incident response process that feeds this decision tree, the [HIPAA compliance self-assessment](/resources/hipaa-compliance-self-assessment) covers security incident procedures under 45 CFR § 164.308(a)(6).

PHIGuard guides Privacy Officers through incident classification in a structured workflow, generates documentation of the four-factor analysis, and tracks notification deadlines automatically. See the [PHIGuard HIPAA page](/hipaa) or [view pricing](/pricing).
