---
title: "Is Intercom HIPAA Compliant?"
vendor: "Intercom"
description: "What small clinics need to know before using Intercom for patient chat and support - including BAA availability, plan requirements, Fin AI coverage, and the PHI risks in patient-facing messaging workflows."
metaDescription: "Is Intercom HIPAA compliant? Intercom offers a BAA on qualifying plans. Learn when patient chat creates PHI risk and what configuration is required."
publishedAt: 2026-04-26
updatedAt: 2026-04-26
verificationDate: 2026-04-26
summary: "Intercom offers a HIPAA Business Associate Agreement for qualifying customers. Patient-facing chat and messaging workflows routinely contain PHI - patient names, appointment details, and clinical questions arrive in Intercom inboxes without warning. Clinics using Intercom for patient support must confirm BAA coverage, assess whether Fin AI and other AI features are covered, and restrict inbox access to authorized staff."
keyTakeaways:
  - "Intercom offers a HIPAA BAA for qualifying plan customers - verify current eligibility and plan requirements at intercom.com/legal before evaluating."
  - "Patient chat messages about appointments, billing, and clinical questions routinely contain PHI - Intercom must be under a signed BAA before handling this content."
  - "Intercom's Fin AI and other AI-powered features process conversation content - confirm BAA coverage of AI features before enabling them on patient-facing inboxes."
  - "Intercom's conversation inbox gives all assigned agents visibility into conversations - restrict inbox access to minimize minimum-necessary PHI exposure."
  - "Third-party integrations connected to Intercom conversations may access PHI and require separate BAA assessment as potential subprocessors."
author: angel-campa
reviewer: phiguard-compliance-research
relatedResource: hipaa-software-comparison-scorecard
relatedCommercialPath: /pricing
relatedLearnPath: /learn/vendor-management/when-a-vendor-needs-a-baa
sources:
  - title: "Intercom Security and Privacy"
    url: "https://www.intercom.com/legal"
    publisher: "Intercom"
  - title: "HIPAA Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
  - title: "45 CFR § 164.504(e) - Business Associate Contracts"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504"
    publisher: "eCFR"
faq:
  - q: "What Intercom plan is required for HIPAA BAA coverage?"
    a: "Intercom's BAA availability is plan-dependent and updated periodically. Verify current requirements directly at intercom.com/legal or by contacting Intercom's sales team before deploying Intercom in any patient-facing workflow."
  - q: "We only use Intercom for non-patient website chat - do we need a BAA?"
    a: "If website visitors include patients who submit health-related questions or personal information in chat, those messages may contain PHI. Evaluate the actual content of inbound conversations. A chat widget on a clinic's public website that collects patient information is a patient-facing channel subject to HIPAA."
  - q: "Does Intercom's Fin AI chatbot require separate HIPAA assessment?"
    a: "Yes. Fin AI processes conversation content to generate responses. If conversations contain PHI, Fin AI is processing PHI. Confirm that Fin AI is explicitly covered under your Intercom BAA before enabling it on patient-facing channels."
  - q: "Can Intercom be used for telehealth patient intake?"
    a: "If patient intake collects PHI - name, DOB, clinical history, insurance information - the platform handling it must be under a BAA. If Intercom is BAA-covered and properly configured, it may be used. Purpose-built patient intake tools with established HIPAA records may be more appropriate for this use case."
---

Intercom is a customer messaging and support platform used for live chat, automated messaging, and support. Healthcare organizations use it for patient inquiries, appointment questions, and general support. The chat format gets patients typing personal and clinical information immediately. PHI in Intercom is routine, not an edge case.

**Note:** Intercom's plan structure, pricing, and BAA terms are updated periodically. Verify current BAA eligibility and coverage at intercom.com/legal before deploying Intercom in any healthcare context.

## Intercom's HIPAA BAA

Intercom offers a HIPAA Business Associate Agreement for qualifying customers. BAA availability depends on the subscription plan. Customers on plans without BAA access are not covered for PHI processing regardless of how the tool is configured.

Before using Intercom for patient-facing communication:

1. Confirm your account is on a BAA-eligible plan
2. Execute the BAA with Intercom. The standard subscription agreement does not substitute for a signed HIPAA BAA.
3. Confirm which Intercom products and features are covered (Intercom has multiple product lines including Messenger, Inbox, Articles, and the Fin AI agent)
4. Verify data hosting region if your compliance posture requires US-only data storage

## When Intercom Conversations Contain PHI

Patient conversations submitted through an Intercom-powered chat window routinely contain PHI without the patient or the clinic treating it as a formal health information exchange:

| Message type | Typical PHI content |
|---|---|
| Appointment question | Name, appointment date, provider name |
| Billing inquiry | Name, service date, amount, insurance information |
| Clinical question | Name, symptom description, medication question, diagnosis context |
| Records request | Name, DOB, request for specific records |
| Prescription refill | Name, medication, prescribing provider |

Any Intercom inbox that receives patient messages is in a HIPAA-covered workflow. A clinic routing patient chat through Intercom without a signed BAA makes an unauthorized PHI disclosure from the first message received.

## PHI Exposure Risks Beyond the Conversation Transcript

The conversation transcript itself is the most obvious PHI risk, but Intercom surfaces PHI in additional ways:

**User profiles:** Intercom builds contact profiles from conversation data and API-pushed data. Patient profiles - name, email, phone, conversation history - accumulate into a PHI record set within Intercom.

**Notes:** Agents can add internal notes to conversations. If a note references clinical context ("patient mentioned they're on [medication]"), it contains PHI.

**Inbox shared visibility:** By default, any agent with inbox access can see all conversations in that inbox. Without explicit access restrictions, all agents see all patient conversations.

**Reporting:** Intercom's reporting draws on conversation content. Dashboards that expose conversation details surface PHI.

## Fin AI and Other AI Features: Assess Before Enabling

Intercom has built AI deeply into the platform: Fin AI (a chatbot that handles inquiries automatically), AI-powered suggestions, conversation summarization, and routing.

These features process conversation content. If conversations contain PHI:

- **Fin AI** reads patient messages and generates responses. If it processes PHI, the Intercom BAA must explicitly cover Fin AI.
- **AI summaries** condense conversation content into summaries for agents. PHI in conversation transcripts flows into those summaries.
- **AI-suggested responses** generate reply options based on conversation context, drawing on PHI from patient messages.

For each AI feature, confirm:
1. Whether it is explicitly covered under the Intercom HIPAA BAA
2. Whether Intercom uses conversation content for AI model training (and whether opt-out is available)
3. Where AI-processed content is stored and for how long

BAA coverage does not automatically extend to AI features. Verify coverage at implementation time, and again when Intercom releases new AI capabilities.

## Configuration Requirements for HIPAA-Compliant Use

### Inbox Access Controls

Restrict Intercom inbox access to staff with a legitimate operational need to view patient conversations. Intercom's team and permission settings allow inbox access to be limited. Configure these before patient conversations begin flowing:

- Create separate inboxes for patient-facing and non-patient-facing channels
- Assign only authorized clinical and administrative staff to patient-facing inboxes
- Use Intercom's role and permission settings to limit which agents can view, reassign, or export conversation data

### Data Retention Settings

HIPAA's record retention requirements (45 CFR § 164.530(j)) require covered entities to retain required documentation for six years. Patient conversations in Intercom that contain PHI fall under that requirement. Review Intercom's data retention settings to ensure PHI-containing conversations are retained for the required period and disposed of securely after retention obligations are met.

### Third-Party Integrations

Intercom integrates with CRM systems, help desk tools, analytics platforms, and more. Any integration that reads or writes to Intercom conversations may be processing PHI. Review active integrations before deploying Intercom in a patient-facing context. Each may be a subprocessor requiring its own HIPAA assessment.

## Practical Assessment for Small Clinics

Most small medical clinics don't need Intercom. The EHR's patient portal handles appointment requests, prescription inquiries, and secure messaging with access controls and audit logging already in place.

Intercom earns its place when the clinic receives high inquiry volumes the EHR portal can't handle, or when website chat needs to route both patient and non-patient visitors differently.

If Intercom is the right tool: confirm BAA coverage on your specific plan, execute the BAA, configure inbox access controls, assess AI features, review integrations, then go live.
