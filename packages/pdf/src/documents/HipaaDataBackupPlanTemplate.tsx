import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaDataBackupPlanTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Data Backup Plan Template"
      subtitle="A backup plan template with the required elements under 45 CFR 164.308(a)(7)(ii)(A) for protecting and restoring ePHI."
    >
      <Section title="Regulatory requirement">
        <P>
          The HIPAA Security Rule requires covered entities to establish and implement procedures to create
          and maintain retrievable exact copies of ePHI as part of the contingency plan standard at
          §164.308(a)(7)(ii)(A). The data backup plan is a required implementation specification - there is
          no addressable alternative. If ePHI cannot be restored, the backup plan fails its purpose.
        </P>
        <Callout label="The critical gap: restoration testing">
          Most small clinics verify that backups run. Far fewer can confirm the backup is restorable within
          the required window. A backup you have never tested is an assumption, not a safeguard.
        </Callout>
      </Section>

      <Section title="Section 1 - ePHI systems inventory">
        <P>
          List all systems that store, process, or transmit ePHI and are covered by this backup plan.
        </P>
        <Table
          headers={['System', 'ePHI description', 'Backup owner', 'Vendor/location']}
          rows={[
            ['EHR platform', 'Clinical records, notes, orders', '', ''],
            ['Practice management', 'Demographics, billing, scheduling', '', ''],
            ['Email system', 'PHI communications', '', ''],
            ['Network storage / file share', 'Scanned documents, forms', '', ''],
            ['Other: ________________', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 2 - Backup specifications">
        <Table
          headers={['System', 'Backup type', 'Frequency', 'Retention period', 'Encrypted']}
          rows={[
            ['EHR platform', '☐ Full ☐ Incremental', '', '', '☐ Yes ☐ No'],
            ['Practice management', '☐ Full ☐ Incremental', '', '', '☐ Yes ☐ No'],
            ['Email system', '☐ Full ☐ Incremental', '', '', '☐ Yes ☐ No'],
            ['Network storage', '☐ Full ☐ Incremental', '', '', '☐ Yes ☐ No'],
          ]}
        />
        <P>
          Backup destination (select all that apply):
          ☐ On-site secondary storage ☐ Off-site physical location: ____________________
          ☐ Cloud backup: ____________________ ☐ Vendor-managed: ____________________
        </P>
        <P>
          Recovery time objective (RTO): ____________________
          Recovery point objective (RPO): ____________________
        </P>
      </Section>

      <Section title="Section 3 - Backup verification">
        <P>
          Backup completion verification is performed by: ____________________
          Verification method: ____________________
          Verification frequency: ____________________
          Failed backup notification goes to: ____________________
        </P>
        <Bullets
          items={[
            'Backup logs are reviewed at least monthly to confirm all scheduled jobs completed.',
            'Failed backups are treated as security incidents and documented.',
            'Backup media is rotated or refreshed according to vendor retention policies.',
          ]}
        />
      </Section>

      <Section title="Section 4 - Restoration testing">
        <P>
          Restoration tests must be documented. Complete this section after each test.
        </P>
        <Table
          headers={['System tested', 'Test date', 'Data restored (sample)', 'RTO met', 'Tested by', 'Issues found']}
          rows={[
            ['', '', '', '☐ Yes ☐ No', '', ''],
            ['', '', '', '☐ Yes ☐ No', '', ''],
            ['', '', '', '☐ Yes ☐ No', '', ''],
          ]}
        />
        <P>
          Annual restoration test target: ____________________ (month)
          Responsible person: ____________________
        </P>
      </Section>

      <Section title="Section 5 - Offsite and cloud backup security">
        <Bullets
          items={[
            'All ePHI stored at offsite or cloud backup locations must be encrypted at rest using AES-256 or equivalent.',
            'Cloud backup vendors with access to ePHI must have a signed BAA on file.',
            'Access credentials for cloud backup accounts must be stored in the clinic\'s password manager, not in email.',
            'Backup access credentials must be changed when a workforce member with access is terminated.',
          ]}
        />
      </Section>

      <Section title="Section 6 - Responsible parties">
        <Table
          headers={['Responsibility', 'Assigned to', 'Backup contact']}
          rows={[
            ['Daily backup monitoring', '', ''],
            ['Monthly log review', '', ''],
            ['Annual restoration test', '', ''],
            ['Backup failure response', '', ''],
            ['Plan review and update', '', ''],
          ]}
        />
      </Section>

      <Section title="Plan review and revision history">
        <P>
          Effective date: __________________________
          Last tested: __________________________
          Last reviewed: __________________________
          Next review due: __________________________
        </P>
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics schedule backup verification tasks, document test results, and attach evidence
          to the Security Rule review record. If backup verification is handled by an IT vendor with no
          documented evidence at the clinic level, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
