import { Bullets, Callout, P, PdfLayout, Section } from '../layout/PdfLayout.js'

export default function HipaaNewPracticeStartupChecklist() {
  return (
    <PdfLayout
      title="HIPAA New Practice Startup Checklist"
      subtitle="A phased 60-item checklist for new covered entities, from pre-opening through 90 days"
    >
      <Section title="How to use this checklist">
        <P>
          The items are grouped by phase so they match how a clinic actually opens. Pre-opening items must be
          finished before the first patient encounter. The 30, 60, and 90-day items build out the rest of the
          program after the doors open. The Privacy Officer owns the list. The Security Officer signs off on
          safeguards items. In a small clinic, one person often holds both roles, which is permitted under 45
          CFR 164.530(a).
        </P>
        <Callout label="Documentation rule">
          If it is not written down, dated, and signed, it does not exist for an auditor. Build the evidence
          binder as you go.
        </Callout>
      </Section>

      <Section title="Pre-opening (before first patient)">
        <Bullets
          items={[
            'Confirm covered entity status (provider that transmits PHI electronically for HIPAA-covered transactions).',
            'Designate a Privacy Officer in writing per 45 CFR 164.530(a).',
            'Designate a Security Officer in writing per 45 CFR 164.308(a)(2).',
            'Draft Notice of Privacy Practices (NPP) meeting 45 CFR 164.520 elements.',
            'Sign a BAA with the EHR vendor before any PHI is loaded.',
            'Sign BAAs with billing, clearinghouse, fax, phone, IT, and cloud storage vendors.',
            'Conduct an initial documented risk analysis under 45 CFR 164.308(a)(1)(ii)(A).',
            'Adopt baseline written policies: Privacy, Security, Breach Notification.',
            'Configure EHR access controls with unique user IDs per 45 CFR 164.312(a)(2)(i).',
            'Enable audit logging in the EHR and any system holding PHI.',
            'Set up encryption at rest and in transit for all PHI-handling systems.',
            'Lock physical PHI storage areas; document key and badge holders.',
            'Post the NPP in the waiting area and on the website.',
          ]}
        />
      </Section>

      <Section title="First 30 days">
        <Bullets
          items={[
            'Deliver and document workforce training under 45 CFR 164.530(b).',
            'Capture a signed training acknowledgement for every workforce member.',
            'Distribute NPP to patients at first encounter and document acknowledgement.',
            'Adopt and circulate a written sanction policy for policy violations.',
            'Stand up a complaint procedure with a named Privacy Officer contact.',
            'Inventory every vendor with PHI access; confirm a signed BAA on file.',
            'Document workstation use policy and automatic logoff settings.',
            'Implement a clean-desk policy for areas where PHI is visible.',
            'Confirm fax, voicemail, and email confidentiality language is in place.',
            'Verify the EHR audit log is reviewable and assign a reviewer cadence.',
            'Set patient access request procedure under 45 CFR 164.524.',
            'Set amendment request procedure under 45 CFR 164.526.',
            'Set accounting of disclosures procedure under 45 CFR 164.528.',
          ]}
        />
      </Section>

      <Section title="60-day review">
        <Bullets
          items={[
            'Write incident response and breach notification plan covering 45 CFR 164.400-414.',
            'Conduct an access review - confirm minimum necessary access by role.',
            'Audit training records: who completed what, on what date.',
            'Document a contingency plan: data backup, disaster recovery, emergency mode.',
            'Test a backup restore and document the result.',
            'Review BAAs for completeness; add any vendors discovered in week-by-week operations.',
            'Confirm physical safeguards: locks, alarm, visitor sign-in, server room access.',
            'Review PHI disposal procedures and stand up a destruction log.',
            'Document mobile device policy and inventory devices that touch PHI.',
            'Run a tabletop walk-through of the breach notification flow with key staff.',
          ]}
        />
      </Section>

      <Section title="90-day review">
        <Bullets
          items={[
            'Finalize full risk analysis documentation including remediation plan.',
            'Organize the evidence binder so any item can be produced in under five minutes.',
            'Set the annual review calendar: NPP, risk analysis, training, BAA renewals, contingency test.',
            'Run a tabletop incident response exercise with the full team and document outcomes.',
            'Review the audit log program: who reviews, how often, what gets escalated.',
            'Confirm patient rights procedures (access, amendment, accounting) have been exercised at least once.',
            'Refresh the vendor BAA tracker and add renewal dates to the compliance calendar.',
            'Document a periodic technical evaluation per 45 CFR 164.308(a)(8).',
            'Conduct a workforce sanction policy review with no open issues outstanding.',
            'Sign the 90-day program attestation and file it in the evidence binder.',
          ]}
        />
      </Section>

      <Section title="What done looks like at day 90">
        <P>
          A defensible HIPAA program for a new covered entity at the 90-day mark has: written and signed
          designations, a documented risk analysis with remediation, a complete BAA tracker, training records
          for every workforce member, an incident response plan that has been walked through, and an evidence
          binder organized by safeguard. Not perfect - those do not exist - but defensible against a
          complaint-driven OCR inquiry.
        </P>
      </Section>
    </PdfLayout>
  )
}
