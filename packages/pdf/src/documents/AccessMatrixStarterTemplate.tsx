import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function AccessMatrixStarterTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Role Access Matrix Starter Template"
      subtitle="A role-by-system access grid with 6 default roles, permission level definitions, minimum necessary justifications, and a quarterly review tracker."
    >
      <Section title="Permission level definitions">
        <Table
          headers={['Code', 'Level', 'Definition']}
          rows={[
            ['N', 'None', 'No access - the role has no legitimate need to access this system or data type'],
            ['R', 'Read-only', 'Can view records but cannot create, modify, or delete'],
            ['RW', 'Read-Write', 'Can create and modify records within their permitted scope'],
            ['A', 'Admin', 'Full access including user management, configuration, and reporting'],
            ['BG', 'Break-glass', 'Emergency access only - triggers an audit log alert and requires documented justification'],
          ]}
        />
      </Section>

      <Section title="Access matrix - EHR">
        <Table
          headers={['Role', 'Demographics', 'Scheduling', 'Clinical Notes', 'Lab Results', 'Medications', 'Billing Codes', 'Audit Logs']}
          rows={[
            ['Front Desk', 'RW', 'RW', 'N', 'N', 'N', 'N', 'N'],
            ['Medical Assistant', 'R', 'R', 'RW (today\'s panel)', 'R', 'R', 'N', 'N'],
            ['Provider', 'R', 'R', 'RW (own panel)', 'RW', 'RW', 'R', 'N'],
            ['Billing Specialist', 'R', 'N', 'N', 'N', 'N', 'RW', 'N'],
            ['Practice Administrator', 'R', 'R', 'N', 'N', 'N', 'R', 'RW'],
            ['IT Support', 'N', 'N', 'N', 'N', 'N', 'N', 'BG'],
          ]}
        />
      </Section>

      <Section title="Access matrix - billing and financial systems">
        <Table
          headers={['Role', 'Patient ledger', 'Insurance claims', 'Payment posting', 'Reporting']}
          rows={[
            ['Front Desk', 'R (copay only)', 'N', 'N', 'N'],
            ['Medical Assistant', 'N', 'N', 'N', 'N'],
            ['Provider', 'N', 'N', 'N', 'R'],
            ['Billing Specialist', 'RW', 'RW', 'RW', 'RW'],
            ['Practice Administrator', 'RW', 'R', 'R', 'RW'],
            ['IT Support', 'N', 'N', 'N', 'N'],
          ]}
        />
      </Section>

      <Section title="Minimum necessary justification by role">
        <Table
          headers={['Role', 'System', 'Justification']}
          rows={[
            [
              'Front Desk',
              'EHR demographics and scheduling',
              'Scheduling and registration require name, contact info, and appointment data. No clinical access required.',
            ],
            [
              'Medical Assistant',
              'EHR clinical chart (today\'s panel)',
              'Treatment role requires full chart access for patients being seen today. Panel restriction is the minimum necessary limit.',
            ],
            [
              'Provider',
              'EHR full chart (own panel)',
              'Treatment requires full clinical record for own patients. Access to other providers\' patients requires documented justification.',
            ],
            [
              'Billing Specialist',
              'EHR encounter codes; billing system full access',
              'Payment processing requires diagnosis and procedure codes. Clinical notes are not required for claim submission.',
            ],
            [
              'Practice Administrator',
              'EHR audit logs; billing system',
              'Operations role requires audit review and billing oversight. Clinical note access excluded - no treatment role.',
            ],
            [
              'IT Support',
              'Break-glass only',
              'IT support has no routine PHI access need. Break-glass access for system issues requires documented justification and auto-logs.',
            ],
          ]}
        />
      </Section>

      <Section title="Access review tracker">
        <Table
          headers={['Review date', 'Reviewer', 'Changes made', 'Next review date']}
          rows={[
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
          ]}
        />
        <Callout label="Access drift">
          Access that was appropriately assigned when a role was created may no longer be minimum
          necessary after a role evolves, a system is added, or staff responsibilities shift.
          Quarterly review catches drift before it becomes a finding.
        </Callout>
      </Section>

      <Section title="Adding a new role">
        <Bullets
          items={[
            'Define the role\'s function and list the specific tasks that require PHI access',
            'Identify the minimum PHI types required for each task',
            'Assign access codes to each system based on minimum necessary - start with the lowest level that allows the function',
            'Document the justification in the Minimum Necessary Decision Log',
            'Add the role to the quarterly review cycle',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard maintains this access matrix as a live compliance record, tracks changes with
          timestamps, and generates a quarterly review task for the Privacy Officer. See
          phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
