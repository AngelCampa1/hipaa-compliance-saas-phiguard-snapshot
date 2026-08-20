import { Bullets, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function PhiWorkflowAuditWorksheetDocument() {
  return (
    <PdfLayout
      title="PHI Workflow Audit Worksheet"
      subtitle="A 5-workflow audit grid for identifying where PHI moves in your clinic, who has access, and where the compliance gaps are."
    >
      <Section title="How to run the audit">
        <Bullets
          items={[
            'Start with your highest-volume workflow - typically scheduling or clinical documentation',
            'Walk the workflow end-to-end with the staff member who runs it daily',
            'Fill in every system that PHI touches, even briefly',
            'Note gaps in the last column - not to assign blame, but to generate a fix list',
          ]}
        />
      </Section>

      <Section title="Workflow 1: Patient scheduling">
        <Table
          headers={['Element', 'Details']}
          rows={[
            ['How patients are scheduled', 'Phone / portal / referral fax / other:'],
            ['Systems that hold PHI in this workflow', ''],
            ['PHI fields involved', 'Name, date of birth, insurance, appointment reason, phone number'],
            ['Who has access', ''],
            ['Current safeguards', ''],
            ['BAA in place for all systems? (Y/N)', ''],
            ['Gaps / findings', ''],
          ]}
        />
      </Section>

      <Section title="Workflow 2: Clinical documentation">
        <Table
          headers={['Element', 'Details']}
          rows={[
            ['How notes are created', 'EHR / paper / dictation / other:'],
            ['Systems that hold PHI in this workflow', ''],
            ['PHI fields involved', 'Full clinical record - all sensitive categories'],
            ['Who has access', ''],
            ['Current safeguards', ''],
            ['BAA in place for all systems?', ''],
            ['Gaps / findings', ''],
          ]}
        />
      </Section>

      <Section title="Workflow 3: Billing and insurance">
        <Table
          headers={['Element', 'Details']}
          rows={[
            ['How claims are submitted', 'In-house / clearinghouse / outsourced billing:'],
            ['Systems that hold PHI in this workflow', ''],
            ['PHI fields involved', 'Name, diagnosis, procedure codes, insurance ID, date of service'],
            ['Who has access', ''],
            ['Current safeguards', ''],
            ['BAA in place for all systems?', ''],
            ['Gaps / findings', ''],
          ]}
        />
      </Section>

      <Section title="Workflow 4: Patient communication">
        <Table
          headers={['Element', 'Details']}
          rows={[
            ['How patients are contacted', 'Phone / secure portal / email / text / other:'],
            ['Systems that hold PHI in this workflow', ''],
            ['PHI fields involved', 'Name, appointment details, clinical reminders, billing notices'],
            ['Who has access', ''],
            ['Current safeguards', ''],
            ['BAA in place for all systems?', ''],
            ['Gaps / findings', ''],
          ]}
        />
      </Section>

      <Section title="Workflow 5: Referral coordination">
        <Table
          headers={['Element', 'Details']}
          rows={[
            ['How referrals are sent/received', 'Fax / portal / phone / mail:'],
            ['Systems that hold PHI in this workflow', ''],
            ['PHI fields involved', 'Full clinical summary, diagnosis, specialist request'],
            ['Who has access', ''],
            ['Current safeguards', ''],
            ['BAA in place for all systems?', ''],
            ['Gaps / findings', ''],
          ]}
        />
      </Section>

      <Section title="Common gaps clinics find">
        <Bullets
          items={[
            'Shared inbox used for patient emails with no BAA covering the email platform',
            'Billing exports saved to a personal Dropbox or Google Drive without a BAA',
            'Referral faxes sent without verifying the recipient fax number against a verified list',
            'Patient texts sent from a personal phone rather than a BAA-covered secure messaging platform',
            'Scheduling platform changed vendors without a new BAA being executed',
          ]}
        />
      </Section>

      <Section title="Gap-to-task conversion">
        <Table
          headers={['Gap found', 'Priority (H/M/L)', 'Owner', 'Due date', 'Resolution']}
          rows={[
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard's PHI workflow tracker records each workflow, its systems, and its compliance
          status - so the audit becomes a living record rather than a one-time exercise. See
          phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
