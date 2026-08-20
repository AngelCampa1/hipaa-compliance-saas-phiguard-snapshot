import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function MinimumNecessaryDecisionLogDocument() {
  return (
    <PdfLayout
      title="HIPAA Minimum Necessary Decision Log"
      subtitle="A log template for documenting PHI access decisions by role - with pre-filled examples for five common clinic roles."
    >
      <Section title="What is the minimum necessary rule">
        <P>
          Under §164.502(b) and §164.514(d), covered entities must make reasonable efforts to limit
          PHI access to the minimum necessary to accomplish the intended purpose. For treatment,
          providers may access full records. For operations and billing, access must be limited to
          what the role specifically requires.
        </P>
      </Section>

      <Section title="How to use this log">
        <Bullets
          items={[
            "Complete a log entry whenever you define or change a role's PHI access level",
            'The log is evidence of deliberate access-control decisions, not just inherited defaults',
            'Review and update entries when a role changes, a new system is added, or an OCR inquiry arrives',
            'Retain for six years per §164.530(j)',
          ]}
        />
      </Section>

      <Section title="Decision log template">
        <Table
          headers={['Field', 'Description']}
          rows={[
            ['Decision date', 'Date the access level was defined or last reviewed'],
            ['Role', 'Job title or role name'],
            ['System', 'EHR, billing platform, cloud storage, etc.'],
            ['PHI types accessible', 'Specific fields or record types - not "full chart" unless justified'],
            ['Purpose of access', 'Treatment / Payment / Operations - and specific task'],
            [
              'Justification',
              "Why this level of access is the minimum necessary for the role's function",
            ],
            ['Approver', 'Privacy Officer or manager who reviewed and approved'],
            ['Review date', 'Next scheduled review - quarterly or semi-annual'],
          ]}
        />
      </Section>

      <Section title="Pre-filled example: Front desk coordinator">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Decision date', '2026-04-26'],
            ['Role', 'Front Desk Coordinator'],
            ['Systems', 'EHR (scheduling module), patient portal admin, billing read-only'],
            [
              'PHI accessible',
              'Name, date of birth, contact information, insurance ID, appointment dates, copay amounts',
            ],
            ['PHI excluded', 'Clinical notes, diagnoses, lab results, medications - no clinical access'],
            ['Purpose', 'Operations - scheduling, registration, copay collection'],
            [
              'Justification',
              'Front desk does not provide or coordinate treatment; clinical data is not required for scheduling or registration functions',
            ],
            ['Approver', 'Privacy Officer'],
            ['Review date', 'Quarterly'],
          ]}
        />
      </Section>

      <Section title="Pre-filled example: Medical assistant">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Role', 'Medical Assistant'],
            ['Systems', "EHR (clinical chart - today's panel only)"],
            [
              'PHI accessible',
              "Full chart for patients on today's schedule - vitals, medications, visit history, notes",
            ],
            ['PHI excluded', "Records outside current panel; billing system access; admin tools"],
            ['Purpose', 'Treatment - assisting provider with clinical preparation and patient rooming'],
            [
              'Justification',
              "Treatment purpose allows full clinical chart for patients being seen; panel restriction limits to current day's patients",
            ],
            ['Approver', 'Privacy Officer'],
          ]}
        />
      </Section>

      <Section title="Pre-filled example: Billing specialist">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Role', 'Billing Specialist'],
            [
              'Systems',
              'Billing software (full read/write), EHR (encounter codes and diagnosis codes only)',
            ],
            [
              'PHI accessible',
              'Name, insurance ID, date of service, procedure codes, diagnosis codes, balance',
            ],
            [
              'PHI excluded',
              'Clinical notes, medications, lab results, anything beyond billing-relevant data',
            ],
            ['Purpose', 'Payment - claim submission, collections, payer follow-up'],
            [
              'Justification',
              'Billing purpose requires financial and coding data; clinical notes and medication details are not required to process or adjudicate claims',
            ],
            ['Approver', 'Privacy Officer'],
          ]}
        />
      </Section>

      <Section title="Blank log entries (for clinic use)">
        <Table
          headers={[
            'Decision date',
            'Role',
            'System',
            'PHI accessible',
            'PHI excluded',
            'Purpose',
            'Justification',
            'Approver',
            'Review date',
          ]}
          rows={[
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Callout label="Default to least privilege">
        When in doubt about whether a role needs access to a specific PHI type, the answer under
        minimum necessary is: start without it. If the role cannot function, document why it needs
        to be added and make it the minimum addition.
      </Callout>

      <Section title="From PHIGuard">
        <P>
          PHIGuard maintains the minimum necessary decision log as part of the access control
          record, with timestamps showing when each role's access was defined and when it was last
          reviewed. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
