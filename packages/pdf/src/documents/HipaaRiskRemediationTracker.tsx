import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaRiskRemediationTrackerDocument() {
  return (
    <PdfLayout
      title="HIPAA Risk Remediation Tracker"
      subtitle="A structured tracker for converting risk analysis findings into prioritized, assigned, and documented remediation tasks."
    >
      <Section title="How to use this tracker">
        <P>
          Transfer each finding from your HIPAA risk analysis into one row of the tracker. Assign an owner, set a due
          date, and record the risk level. Update the status column as work progresses. Attach evidence of completion
          (policy document, screenshot, vendor confirmation) to each row before marking a finding closed.
        </P>
        <P>
          Under 45 CFR §164.308(a)(1)(ii)(B), covered entities must implement security measures sufficient to reduce
          risks identified in the risk analysis to a reasonable and appropriate level. The tracker is the operational
          record of that implementation.
        </P>
      </Section>

      <Section title="Risk level legend">
        <Table
          headers={['Level', 'Definition', 'Remediation Timeline']}
          rows={[
            ['Critical', 'Direct ePHI exposure; likely or confirmed unauthorized access', 'Immediate - within 5 business days'],
            ['High', 'Control gap creating significant likelihood of ePHI compromise if exploited', 'Within 30 days'],
            ['Medium', 'Control gap with moderate likelihood or limited PHI scope', 'Within 90 days'],
            ['Low', 'Minor gap; limited likelihood or impact; may accept with documented rationale', 'Within 180 days or accepted risk'],
          ]}
        />
      </Section>

      <Callout label="Accepted risk - what it means">
        A risk level of Low may be documented as "Accepted Risk" when the cost of remediation is disproportionate to
        the likelihood and impact, and the Privacy Officer documents the rationale. Accepted risk is not the same as
        ignored risk - it must be a deliberate, written decision reviewed at the next annual assessment.
      </Callout>

      <Section title="Status key">
        <Bullets
          items={[
            'Open - finding identified, owner assigned, work not yet started',
            'In Progress - remediation actions underway, not yet complete',
            'Complete - remediation action implemented and evidence attached',
            'Accepted Risk - documented decision to accept the risk rather than remediate; rationale on file',
          ]}
        />
      </Section>

      <Section title="Remediation tracker">
        <Table
          headers={['Finding ID', 'Risk Area', 'Description', 'Risk Level', 'Remediation Action', 'Owner', 'Due Date', 'Status', 'Evidence']}
          rows={[
            ['RA-001', '[e.g., Access Controls]', '[e.g., Shared EHR login credentials for front desk]', 'High', '[e.g., Create individual accounts for each user]', '', '', 'Open', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Summary by risk level">
        <Table
          headers={['Risk Level', 'Total Findings', 'Open', 'In Progress', 'Complete', 'Accepted Risk']}
          rows={[
            ['Critical', '', '', '', '', ''],
            ['High', '', '', '', '', ''],
            ['Medium', '', '', '', '', ''],
            ['Low', '', '', '', '', ''],
            ['Total', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Tracker review log">
        <Table
          headers={['Review Date', 'Reviewer', 'Summary of Changes', 'Next Review Date']}
          rows={[
            ['', '', '', ''],
            ['', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard converts risk analysis findings into assigned tasks with due dates, tracks completion, and attaches
          evidence to each finding record - building the remediation trail that auditors and OCR investigators request.
          See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
