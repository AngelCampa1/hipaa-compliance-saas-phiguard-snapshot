import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaContingencyPlanTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Contingency Plan Template"
      subtitle="A contingency plan template covering data backup, disaster recovery, and emergency mode operations under 45 CFR 164.308(a)(7)."
    >
      <Section title="Five required components">
        <P>
          The Security Rule requires covered entities to implement a contingency plan that addresses five
          components. Each must be addressed - either with a full implementation or with a documented
          rationale for using an equivalent alternative for addressable specifications.
        </P>
        <Bullets
          items={[
            'Data Backup Plan (required): Create and maintain retrievable exact copies of ePHI.',
            'Disaster Recovery Plan (required): Restore any loss of data.',
            'Emergency Mode Operations Plan (required): Enable critical business processes while operating in emergency mode.',
            'Testing and Revision Procedures (addressable): Implement procedures for periodic testing and revision of contingency plans.',
            'Applications and Data Criticality Analysis (addressable): Assess the relative criticality of specific applications and data in support of other contingency plan components.',
          ]}
        />
        <Callout label="Testing is not optional">
          OCR investigations consistently find that clinics have backup procedures but never test restoration.
          A backup plan that has never been tested is not a contingency plan - it is a document.
        </Callout>
      </Section>

      <Section title="Component 1: Data backup plan">
        <P>
          ePHI systems covered by this plan:
        </P>
        <Table
          headers={['System/Application', 'ePHI type', 'Backup frequency', 'Backup location', 'Encrypted']}
          rows={[
            ['EHR', 'Clinical records', '', '', ''],
            ['Practice management', 'Billing/scheduling', '', '', ''],
            ['Email server/cloud', 'PHI communications', '', '', ''],
            ['Network file storage', 'Documents, forms', '', '', ''],
          ]}
        />
        <P>
          Backup verification: Backups are verified by: __________________________
          Verification frequency: __________________________
          Restoration time objective (RTO): __________________________
          Recovery point objective (RPO): __________________________
        </P>
      </Section>

      <Section title="Component 2: Disaster recovery plan">
        <P>
          Triggers for activating the disaster recovery plan:
        </P>
        <Bullets
          items={[
            'Complete loss of access to EHR or practice management system for more than ________ hours.',
            'Ransomware, malware, or confirmed breach affecting ePHI systems.',
            'Physical destruction or inaccessibility of the primary facility.',
            'Loss of internet connectivity for more than ________ hours.',
          ]}
        />
        <P>
          Recovery steps:
        </P>
        <Bullets
          items={[
            'Step 1: Notify Security Officer and activate emergency mode operations.',
            'Step 2: Assess scope of data loss or system unavailability.',
            'Step 3: Contact IT support or EHR vendor recovery team at: __________________________',
            'Step 4: Initiate restoration from most recent verified backup.',
            'Step 5: Validate restored data integrity before returning to normal operations.',
            'Step 6: Document the incident, response timeline, and resolution.',
          ]}
        />
      </Section>

      <Section title="Component 3: Emergency mode operations plan">
        <P>
          Critical functions that must continue during system outages:
        </P>
        <Bullets
          items={[
            'Patient identification: Use paper registration and ID verification.',
            'Medication administration: Maintain printed medication lists for active patients.',
            'Lab and diagnostic orders: Use paper order forms; file results manually on return.',
            'Appointment scheduling: Use phone-based scheduling with paper log.',
            'Billing: Defer claims submission; log charges manually for later entry.',
          ]}
        />
        <P>
          Location of paper downtime forms: __________________________
          Downtime duration before activating this plan: __________________________
        </P>
      </Section>

      <Section title="Component 4: Testing and revision schedule">
        <Table
          headers={['Test type', 'Frequency', 'Responsible', 'Last completed', 'Next due']}
          rows={[
            ['Backup restoration test', 'Annual', '', '', ''],
            ['Disaster recovery tabletop', 'Annual', '', '', ''],
            ['Emergency mode operations drill', 'Annual', '', '', ''],
            ['Full plan review and update', 'Annual', '', '', ''],
          ]}
        />
        <P>
          Test documentation is retained at: __________________________
          Minimum retention: 6 years from creation or last effective date.
        </P>
      </Section>

      <Section title="Component 5: Application and data criticality analysis">
        <Table
          headers={['System', 'Criticality', 'Max acceptable downtime', 'PHI contained']}
          rows={[
            ['EHR (clinical records)', 'Critical', '', 'Yes'],
            ['Practice management', 'High', '', 'Yes'],
            ['Email system', 'High', '', 'Yes'],
            ['File storage', 'Medium', '', 'Yes'],
            ['Website/patient portal', 'Low', '', 'Partial'],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics schedule contingency testing tasks, document test results, and attach evidence
          to the Security Rule review record. If contingency planning is a document that has not been tested
          since the initial HIPAA audit, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
