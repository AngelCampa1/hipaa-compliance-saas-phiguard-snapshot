import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaBillingComplianceChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA Medical Billing Compliance Checklist"
      subtitle="Audit the PHI flows your billing operation creates"
    >
      <Section title="TPO and the payment exception">
        <P>
          Treatment, payment, and operations disclosures do not require patient authorization under
          § 164.506. Billing falls inside the payment branch. The exception is broad but does not turn
          off minimum necessary, does not eliminate BAA obligations, and does not authorize disclosures
          to entities outside payment, treatment, or operations.
        </P>
        <Callout label="TPO boundary">
          Disclosures outside TPO require a § 164.508 authorization. Marketing disclosures and most
          research disclosures are not payment activity.
        </Callout>
      </Section>

      <Section title="BAA inventory for the billing supply chain">
        <Table
          headers={['Vendor type', 'BAA required', 'Common gap']}
          rows={[
            ['Clearinghouse', 'Yes', 'Stale BAA after platform migration'],
            ['Billing service', 'Yes', 'Subcontractor list not maintained'],
            ['Coding service', 'Yes', 'Offshore subcontractor not disclosed'],
            ['Statement printer/mailer', 'Yes', 'Treated as a vendor, not a BA'],
            ['Payment portal', 'Yes', 'Tokenization assumed to remove PHI'],
            ['Denial management vendor', 'Yes', 'Bolt-on tool added without BAA'],
            ['RCM platform', 'Yes', 'Old RCM still has live PHI access'],
          ]}
        />
      </Section>

      <Section title="Minimum necessary in coding">
        <P>
          Coders need access to encounter notes, relevant history, and order sets, not the full
          longitudinal chart by default. Configure role-based access in the EHR so coding role permissions
          match the task.
        </P>
      </Section>

      <Section title="Claim attachments">
        <P>
          Send only what the payer requires. Attaching the full chart when a single operative note was
          requested is the most common over-disclosure pattern in claim submissions and a clear
          minimum-necessary failure under § 164.502(b).
        </P>
      </Section>

      <Section title="Patient statement design">
        <Bullets
          items={[
            'Envelope: no clinical detail visible through the address window',
            'Line items describe service, not clinical condition',
            'No diagnosis narrative on patient-facing invoices',
            'Portal logins protected with multi-factor where balances reference specific encounters',
            'Email reminders use account references, not CPT or diagnosis text',
          ]}
        />
      </Section>

      <Section title="Insurance verification">
        <P>
          Eligibility checks pull PHI back into your system. Confirm the verification tool runs under a
          BAA, that staff do not paste eligibility responses into general email or chat, and that cached
          verification data follows your retention schedule.
        </P>
      </Section>

      <Section title="Denial management">
        <P>
          Denial workflows concentrate PHI in spreadsheets and shared queues. Confirm access controls
          match minimum necessary, that work queues live inside a covered system rather than personal
          Excel, and that vendor-side denial management sits under a BAA.
        </P>
      </Section>

      <Section title="Offshore billing operations">
        <P>
          Offshore billing is permitted under HIPAA but introduces risk-analysis obligations: where the
          data sits, how it transits, what controls the vendor enforces, and how breach notification
          operates across jurisdictions. Document offshore flows explicitly in your § 164.308(a)(1) risk
          analysis.
        </P>
      </Section>

      <Section title="Common gaps to fix this quarter">
        <Bullets
          items={[
            'Diagnosis narrative printed on patient invoices',
            'Statement vendor with an expired BAA',
            'Coders with full chart access by default',
            'Eligibility responses pasted into email or chat',
            'Denial spreadsheets on a shared drive without access controls',
            'Clearinghouse migration not reflected in the BAA inventory',
            'TIN/NPI mismatch validation absent before claim submission',
          ]}
        />
      </Section>
    </PdfLayout>
  )
}
