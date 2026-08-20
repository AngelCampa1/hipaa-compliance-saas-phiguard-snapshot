---
title: "HIPAA Access Log Template"
headline: "An audit-ready access log structure for tracking who accessed patient records — and when, and why"
description: "Download a HIPAA access log template for small medical clinics. Covers audit control requirements of 45 CFR §164.312(b) and activity review requirements of §164.308(a)(1)(ii)(D). Includes both electronic and manual log formats."
metaDescription: "Free HIPAA access log template. Covers audit controls under 45 CFR §164.312(b) and activity review under §164.308(a)(1)(ii)(D). Download for your clinic."
magnetSlug: "hipaa-access-log-template"
summary: "A HIPAA access log template covering the audit control and information system activity review requirements of 45 CFR §§164.312(b) and 164.308(a)(1)(ii)(D), with both an electronic log structure and a manual paper log for outage or emergency situations."
stage: "awareness"
sequenceStage: "awareness"
bullets:
  - "Electronic log field specification: user ID, timestamp, patient identifier, record type, action, and access justification"
  - "Manual paper log format for use during system outages or when electronic logging is unavailable"
  - "Monthly access review checklist aligned to §164.308(a)(1)(ii)(D)"
  - "Break-glass access procedure and documentation requirements for emergency PHI access"
  - "A log retention schedule and storage policy meeting the six-year documentation requirement"
faq:
  - q: "Does HIPAA require a separate access log, or does the EHR audit trail satisfy the requirement?"
    a: "Most modern EHR systems generate audit logs that can satisfy the audit control requirement of §164.312(b) if properly configured and reviewed. The HIPAA requirement is not for a specific format but for activity recording and periodic review. If your EHR logs access by user, timestamp, and record, and you review those logs regularly, that satisfies the specification. This template helps you document the review process and covers gaps the EHR may not fill."
  - q: "How often must access logs be reviewed?"
    a: "45 CFR §164.308(a)(1)(ii)(D) requires covered entities to regularly review records of information system activity, including audit logs. Most Security Officers conduct monthly reviews for high-risk or high-volume access patterns and annual comprehensive reviews. The review frequency should be documented in your security policy."
  - q: "What is break-glass access?"
    a: "Break-glass access is emergency PHI access by a workforce member who does not normally have authorization for the records accessed — typically when a treating provider needs a patient's records in an emergency and the authorized provider is unavailable. Break-glass access must be logged and reviewed after the fact to confirm it was justified."
  - q: "What if our EHR does not generate audit logs?"
    a: "An EHR system that does not generate any audit logs is not meeting the audit control requirements of 45 CFR §164.312(b). If your current system has no logging capability, the security policy's technical safeguards section should document this as a gap and describe compensating controls. Upgrading to a system with audit logging is the appropriate remediation."
publishedAt: "2026-04-24"
updatedAt: "2026-04-24"
sources:
  - title: "45 CFR §164.312(b) — Technical Safeguards: Audit Controls"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312"
    publisher: "eCFR / HHS"
  - title: "45 CFR §164.308(a)(1)(ii)(D) — Information System Activity Review"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR / HHS"
  - title: "45 CFR §164.316 — Policies and Procedures and Documentation Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.316"
    publisher: "eCFR / HHS"
  - title: "NIST SP 800-92 — Guide to Computer Security Log Management"
    url: "https://csrc.nist.gov/publications/detail/sp/800-92/final"
    publisher: "NIST"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
relatedLearnPath: "/learn/compliance-operations/hipaa-technical-safeguards"
verificationDate: "2026-04-24"
---

## Who Needs This Template

Practice administrators and Security Officers at medical clinics who need to document, review, and retain records of who accessed patient records use a HIPAA access log. The access log is both a security control and a compliance artifact. It deters unauthorized access, enables detection when access violations occur, and provides evidence of your audit program during an OCR investigation.

Most clinics rely on their EHR system's built-in audit logging. This template helps you document the review process — what your Security Officer looks at, how often, and what triggers a follow-up — and fills gaps for systems that do not generate electronic logs.

## What HIPAA Rule It Satisfies

Two provisions of the HIPAA Security Rule address access logging and review:

**45 CFR §164.312(b) — Audit Controls.** Requires covered entities to implement hardware, software, or procedural mechanisms that record and examine activity in information systems that contain or use ePHI. This is a required specification for any information system storing ePHI.

**45 CFR §164.308(a)(1)(ii)(D) — Information System Activity Review.** Requires covered entities to implement procedures to regularly review records of information system activity, including audit logs, access reports, and security incident tracking reports. This is an addressable specification but one that virtually all Security Officers implement.

Together, these specifications require you to generate access logs and to review them on a schedule. Generating logs you never review is a gap OCR has identified in enforcement actions.

## What Is Inside This Template

**Section 1 — Electronic Log Field Specification.** Documents the required fields for a compliant electronic access log:

- Unique user ID (never a shared account name)
- Date and time of access (with time zone)
- Patient record identifier (internal medical record number — not name in the log itself)
- Type of record accessed (clinical note, lab result, imaging, billing record)
- Action taken (view, print, export, modify, delete)
- Workstation or device identifier
- Access justification (for break-glass and cross-coverage access)

**Section 2 — Manual Paper Log.** A paper format for use during EHR outages, when staff access paper records, or during emergency operations. Covers the same fields as the electronic log in a format a front-desk or clinical staff member can complete without a system.

**Section 3 — Monthly Access Review Checklist.** A structured review guide for your Security Officer covering:

- Review of all after-hours access events
- Review of bulk record exports or print jobs
- Review of access by users who are no longer active employees (should be zero)
- Review of break-glass access events with justification confirmation
- Review of any failed access attempts above a defined threshold
- Any access to high-sensitivity records (psychotherapy notes, HIV, substance use) with verification that the accessing user was authorized

**Section 4 — Break-Glass Access Procedure.** Documents the conditions under which emergency access is authorized, the logging requirements, and the post-access review process. Includes a break-glass access report form for the Security Officer to complete after each event.

**Section 5 — Log Retention and Storage Policy.** Documents retention requirements: six years from the date created or last in effect, per 45 CFR §164.316(b)(2)(i) (the Security Rule documentation retention standard, which governs access log policies) and consistent with §164.530(j) for any privacy-related log documentation. The section also covers storage location, access controls on the logs themselves (logs must be tamper-evident and not writable by the workforce members being monitored), and the procedure for producing logs during an OCR investigation or legal hold.

## How to Use This Template

**Step 1.** Confirm that your EHR and other ePHI systems are generating logs with the fields documented in Section 1. If any field is absent, contact your vendor to determine whether it can be enabled.

**Step 2.** Complete the manual paper log format for situations where electronic logging is unavailable. Train the staff member who will complete it during outages.

**Step 3.** Assign the monthly review to your Security Officer. Put it on the calendar with a fixed date each month. Use the Section 3 checklist and file the completed checklist in your compliance program records.

**Step 4.** Document the break-glass access procedure and confirm that all supervisors and on-call providers know the procedure.

**Step 5.** Review log storage and retention. Confirm that access logs are not stored in a location that the workforce members being monitored can delete or modify.

## Who Owns It, Where to Store It, and When to Update It

**Who fills it out:** The Security Officer owns the review process and the review checklist. Individual workforce members complete break-glass access forms immediately after each emergency access event. The EHR administrator configures and maintains the electronic log fields.

**Where to store it:** Access logs must be retained for six years from the date created per §164.316(b)(2)(i). Store completed monthly review checklists in the compliance program records, not in email. Electronic logs must be stored in a location where the workforce members whose access is being logged cannot alter or delete them. Access to the log archive itself should be limited to the Security Officer and designated backup reviewer.

**How often it is reviewed:** Monthly review using the Section 3 checklist is the standard practice for most small clinics. High-volume or high-sensitivity practices (behavioral health, substance use treatment) should consider weekly spot-checks. Annual comprehensive reviews of the full log archive are good practice for identifying slow-developing patterns.

**What triggers a required update to the log structure:** Any new ePHI system added to the environment requires a review of whether that system generates logs with the fields specified in Section 1. A system that cannot produce the required fields must be flagged as a gap in the security policy. Additional triggers: a workforce access violation that the existing log failed to detect; a break-glass procedure that was not properly documented; or updated OCR guidance on audit control requirements.

## Download This Template

Enter your email at [phiguard.app/resources/hipaa-access-log-template](/resources/hipaa-access-log-template) to receive the full template, the monthly review checklist, the break-glass access form, and the log retention policy.


## Related Resources

The access log and audit controls are one component of the technical safeguards required by the HIPAA Security Rule — the [HIPAA security policy template](/resources/hipaa-security-policy-template) covers all three safeguard categories in one document. For a deeper explanation of the technical safeguard specifications, read [HIPAA technical safeguards](/learn/compliance-operations/hipaa-technical-safeguards) in the PHIGuard compliance library. The [HIPAA data backup plan template](/resources/hipaa-data-backup-plan-template) covers the parallel administrative safeguard requirement for data availability.
