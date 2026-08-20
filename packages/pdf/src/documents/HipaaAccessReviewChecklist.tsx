import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAccessReviewChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA Access Review Checklist"
      subtitle="A system-by-system access review template for clinics - with reviewer fields, excess access documentation, and a termination verification section."
    >
      <Section title="How often to run access reviews">
        <Bullets
          items={[
            'Quarterly: recommended for clinics with 10+ staff or frequent role changes',
            'Semi-annual: appropriate for stable small practices (3-9 staff) with low turnover',
            'Triggered: always run after any staff termination, role change, or system migration',
          ]}
        />
      </Section>

      <Section title="EHR access review">
        <Table
          headers={['Staff Member', 'Role', 'Current Access Level', 'Access Appropriate? (Y/N/Reduce)', 'Action Required']}
          rows={[
            ['', 'Front Desk', 'Demographics + scheduling', '', ''],
            ['', 'Medical Assistant', 'Full chart - today\'s panel', '', ''],
            ['', 'Provider', 'Full chart - own panel', '', ''],
            ['', 'Billing Specialist', 'Encounter codes and diagnosis only', '', ''],
            ['', 'Practice Administrator', 'Audit logs - no clinical notes', '', ''],
          ]}
        />
      </Section>

      <Section title="Billing system access review">
        <Table
          headers={['Staff Member', 'Role', 'Current Access Level', 'Access Appropriate? (Y/N/Reduce)', 'Action Required']}
          rows={[
            ['', 'Front Desk', 'Read-only copay lookup', '', ''],
            ['', 'Billing Specialist', 'Full read/write', '', ''],
            ['', 'Practice Administrator', 'Full read/write + reporting', '', ''],
            ['', 'Provider', 'None (standard)', '', ''],
          ]}
        />
      </Section>

      <Section title="Cloud storage and shared drives">
        <Table
          headers={['Platform', 'Folder/Location', 'Who Has Access', 'PHI Present? (Y/N)', 'BAA in Place? (Y/N)', 'Action']}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Excess access log">
        <P>
          Document any access found during the review that exceeds what the role requires. This is the corrective
          action record.
        </P>
        <Table
          headers={['Staff Member', 'System', 'Excess Access Found', 'Action Taken', 'Date Corrected']}
          rows={[
            ['', '', '', '', ''],
            ['', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Termination verification">
        <Bullets
          items={[
            'Verify all staff terminations since last review had same-day access revocation documented',
            'Confirm no terminated employee credentials remain active in any system',
            'Check shared accounts for any accounts not tied to a current employee',
          ]}
        />
      </Section>

      <Callout label="Minimum necessary reminder">
        Under §164.502(b), workforce members should have access only to the PHI reasonably necessary to perform their
        job. Access that grew by convenience or was never revisited after a role change is a compliance gap.
      </Callout>

      <Section title="Review sign-off">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Review date', ''],
            ['Reviewer name and role', ''],
            ['Systems reviewed', ''],
            ['Excess access findings', ''],
            ['Corrective actions taken', ''],
            ['Next review date', ''],
            ['Reviewer signature', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks access review history by system and staff member, creates a task for each review cycle, and
          keeps corrective action records attached to the review. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
