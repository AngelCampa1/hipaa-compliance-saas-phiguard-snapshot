---
title: "PHI in Referral Coordination"
description: "Referral coordination is one of the highest-volume PHI exchange points in a small clinic. Misdirected faxes, wrong portals, and coordinator workarounds are common. Here is how to reduce the risk without slowing down the process."
metaDescription: "HIPAA risks in referral coordination: misdirected faxes, minimum necessary PHI, and safer referral workflow patterns for small clinics."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
kind: article
pillar: phi-workflows
schemaType: article
intent: awareness
summary: "Referral coordination combines high PHI volume, time pressure, and frequent communication with external parties - a combination that produces more incidents than most clinics track. The minimum necessary standard, verified destination practices, and logged outbound communications are the three controls that reduce risk without adding friction to the referral process."
keyTakeaways:
  - "Treatment disclosures for referrals are permitted without patient authorization, but the minimum necessary standard still applies - send what the specialist needs, not the entire chart."
  - "A misdirected fax or portal message is an incident that requires triage using the four-factor breach risk assessment, not an informal correction and move on."
  - "Maintaining a current, verified referral directory is a preventive control, not an administrative formality - outdated fax numbers are the most common source of referral misdirection."
  - "Referral coordinators using personal email because the clinic system is slow is a workforce behavior risk that requires both a policy response and a usable alternative."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: phi-workflow-audit-worksheet
relatedCommercialPath: /pricing
sources:
  - title: "45 CFR § 164.506 - Uses and Disclosures for Treatment"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.506"
    publisher: "eCFR"
  - title: "45 CFR § 164.502(b) - Minimum Necessary Standard"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502"
    publisher: "eCFR"
  - title: "HHS Minimum Necessary Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html"
    publisher: "HHS"
  - title: "HIPAA Privacy Rule - Uses and Disclosures"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
    publisher: "HHS"
faq:
  - q: "Does HIPAA require patient authorization to send a referral?"
    a: "No. Disclosures for treatment purposes are permitted without patient authorization under 45 CFR § 164.506. However, the minimum necessary standard still applies: the clinic should send what the receiving provider needs for the referral purpose, not the entire patient record."
  - q: "What happens when a fax goes to the wrong provider?"
    a: "It is a security incident that requires documentation and a four-factor breach risk assessment under the Breach Notification Rule. If the clinic cannot demonstrate a low probability of PHI compromise, notification may be required. The incorrect assumption is that retrieving the fax resolves the matter without documentation."
  - q: "Is fax still acceptable for referrals under HIPAA?"
    a: "Yes, traditional fax - including digital fax services - can be used for referrals. The controls are accurate destination verification, cover sheets with confidentiality notices, and a current referral directory. The compliance problem is not the medium; it is the process around it."
---

Referral coordination moves more PHI in a day than most other clinic functions combined. A single orthopedic referral may involve faxing a clinical summary, contacting the specialist's scheduling team, sending imaging records, and following up on authorization from the insurance carrier - each step involving a different recipient and a different transmission method. Multiply this by the number of referrals a clinic generates in a week and the exposure adds up quickly.

The Privacy Rule explicitly permits treatment disclosures without patient authorization. That is a reason to build referral workflows that handle PHI reliably, not an excuse to assume information will reach the right place.

## What HIPAA permits - and what it still requires

Under 45 CFR § 164.506, a covered entity may use or disclose PHI for treatment purposes without obtaining patient authorization. A referral to a specialist is treatment. Sending a clinical summary to support that referral is a treatment disclosure. The patient's prior written authorization is not required.

This permissibility does not suspend the minimum necessary standard. Under 45 CFR § 164.502(b), a covered entity that makes a disclosure - even a permitted one - must make reasonable efforts to limit the disclosure to the minimum amount of PHI necessary to accomplish the intended purpose. HHS has published guidance on the minimum necessary requirement that addresses this directly.

In referral practice, the clinic should ask: what does this specialist actually need to evaluate and treat this patient for this referral reason? An orthopedic surgeon receiving a referral for a knee injury needs relevant musculoskeletal history, imaging, current medications, and primary complaint, not mental health history, gynecological records, or substance use documentation unless there is a documented clinical reason those are relevant.

Sending the entire chart because it is faster than reviewing scope is not a minimum necessary analysis. Over-disclosure exposes patients whose sensitive history is shared without clinical justification, and exposes the clinic if a complaint or investigation follows.

HHS acknowledges that providers have reasonable latitude in determining what is necessary for treatment. A referral coordinator who sends complete records including psychiatric hospitalization history to a podiatric specialist, without any documented clinical rationale, is not applying minimum necessary.

## The five most common referral PHI risks

Understanding where referral PHI risks actually materialize helps clinics target their controls rather than implementing broad policies that do not match the actual failure modes.

**Misdirected fax.** A staff member sends a referral packet to the wrong fax number - a transposed digit, an outdated entry in the referral directory, or a fax number that was reassigned to a different practice. The document arrives at an unintended recipient. This is the single most common referral-related incident in small practices that rely on fax-based coordination. It triggers the four-factor breach risk assessment. If the document cannot be confirmed as retrieved and unread, notification may be required.

**Wrong patient portal or secure messaging.** As clinics move toward electronic health information exchange, referrals may go through practice portals, direct secure messaging, or electronic fax platforms. These systems can also produce wrong-recipient events - the referral coordinator selects the wrong provider from a dropdown, the portal routes the message to an outdated address, or a secure message is sent to a patient portal message box that belongs to a different patient with a similar name. The transmission method is more controlled than a paper fax but the human error risk is the same.

**Verbal clinical summaries to unmonitored voicemail.** A referral coordinator calls the specialist's office to provide a verbal clinical summary and reaches an unmonitored voicemail system. The message, which may include the patient's name, date of birth, diagnosis, and reason for referral, sits on a shared voicemail that multiple staff at the receiving practice access. The caller has no control over who listens or how the information is stored after receipt. This is a low-recognition risk that produces real exposure.

**Coordinator using personal email.** When the clinic's electronic referral system is slow, requires multiple steps, or is frequently unavailable, coordinators look for faster alternatives. Personal email is the most common workaround. A clinical summary emailed from a coordinator's personal Gmail account to a specialist's office email is a HIPAA violation regardless of the coordinator's intent or the recipient's trustworthiness. The personal account has no BAA, no retention controls, and no audit trail. The clinic cannot demonstrate the transmission was secure or that it was destroyed appropriately.

Policy alone will not stop this. The clinic needs to understand why coordinators are using workarounds and fix the operational friction.

**Referral documentation in a shared fax inbox.** When inbound referral documents from other practices arrive at a shared fax inbox - a general fax number that multiple staff access - the access control problem described for shared email inboxes applies equally here. No per-user audit trail, stale access for departed staff, and no retention policy. For clinics receiving significant referral volume, the incoming referral inbox is as much a compliance concern as the outgoing referral process.

## Building a safer referral workflow

The goal is to add reliability, not friction. A referral coordinator who can send a packet to the correct destination with confidence, log the transmission, and know who is responsible for following up has a better day than one who sends things informally and hopes they arrive.

**Verify the destination before transmitting.** For fax-based referrals, this means confirming the fax number against the current referral directory before every send, not relying on memory or a number recently dialed. For portal-based referrals, it means confirming the provider selection before submitting. One confirmation step before transmission prevents the most common referral incident type.

**Maintain a current, verified referral directory.** The referral directory should be treated as a controlled document with a designated owner and a review cadence. Fax numbers, portal addresses, and contact names change. A directory that was accurate eighteen months ago may now route referrals to practices that have moved, merged, or changed fax providers. The clinic should establish who owns the directory, how often it is reviewed, and how corrections are submitted when a transmission fails or a callback reveals an error.

**Use a cover sheet with a confidentiality notice and no visible PHI.** Any faxed referral - whether on physical paper or through a digital fax platform - should use a standard cover sheet that includes the sender's name and contact, the intended recipient, the number of pages, and a confidentiality notice. The cover sheet should not include the patient's name, date of birth, or diagnosis. Those are in the attached document. A cover sheet visible from outside an envelope or in a fax machine output tray should not expose PHI to incidental viewing.

**Log outbound referral communications in the patient record.** Every outbound referral transmission - fax, secure message, portal, or verbal - should generate a log entry in the patient record. Who sent it, to whom, by what method, at what date and time, and what document or information was transmitted. This log serves two purposes: it supports continuity of care if a follow-up is needed, and it provides the factual record required for a breach investigation if the transmission is later challenged.

**Have a process for high-priority receipt confirmation.** For referrals where timely receipt by the specialist matters clinically - urgent consultations, pre-operative clearances, complex cases with narrow scheduling windows - the clinic should have a standard process for confirming that the referral was received. A callback to the receiving office, a portal read receipt, or a return message from the specialist's scheduling team all constitute receipt confirmation. Document it in the patient record.

**Provide a usable system and enforce the policy.** If coordinators are using personal email because the clinic's referral system is slow, the fix is making the compliant option fast enough to use under time pressure. Electronic referral management or a structured secure messaging setup can be faster than personal email once staff are trained on it. The policy against personal email must be paired with an alternative that does not require extra steps to use.

## When a referral goes wrong

A misdirected fax, a message to the wrong patient portal, or a disclosed clinical summary that reaches the wrong provider is an incident. It should be handled through the clinic's incident triage process, not informally resolved by the coordinator who made the error and never logged.

The initial steps are the same as any PHI incident: document the event immediately, contain the active exposure if possible (call the recipient, request return or destruction of the document, note the time and response), and escalate to the Privacy Officer for the four-factor breach risk assessment.

The coordinator should not self-assess whether the incident is a breach. They should report it immediately. Whether notification is ultimately required depends on the facts - who received the document, whether it can be confirmed as unread, and what mitigation occurred - not on the coordinator's discomfort with reporting it.

A clinic that consistently logs and triages referral incidents - even those that do not require notification - builds an incident record that demonstrates an active compliance program. A clinic that handles these events informally accumulates unacknowledged risk instead.

## Related pages

For the triage workflow after a referral incident, see [How to Triage Suspected HIPAA Incidents](/learn/incident-response/triage-suspected-hipaa-incidents). For the fax-specific controls beyond referral coordination, see [PHI in Fax](/learn/phi-workflows/phi-in-fax). For the shared inbox risks that referral faxes often land in, see [How to Handle Shared Inboxes That Contain PHI](/learn/phi-workflows/handle-shared-inboxes-phi). For the PHIGuard compliance and task management platform, see [Pricing](/pricing).
