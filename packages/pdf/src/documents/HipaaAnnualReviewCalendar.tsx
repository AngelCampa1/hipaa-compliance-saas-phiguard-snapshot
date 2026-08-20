import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAnnualReviewCalendarDocument() {
  return (
    <PdfLayout
      title="HIPAA Annual Review Calendar"
      subtitle="A month-by-month compliance task calendar for small clinics - with cadence, owner, and evidence fields for every required activity."
    >
      <Section title="How to use this calendar">
        <P>
          Run January as your planning month: assign an owner to every row, confirm the evidence artifact that will be
          due at completion, and enter this calendar into whatever task system your clinic uses. Update it during the
          year as tasks are completed rather than reconstructing it at year-end. OCR investigations frequently ask
          covered entities to produce evidence of completed reviews - if you cannot show a dated artifact, the review
          did not happen in the eyes of an auditor.
        </P>
      </Section>

      <Section title="Q1 - January through March">
        <Table
          headers={['Task', 'Cadence', 'Owner', 'Evidence Required']}
          rows={[
            ['Annual risk analysis update', 'Annual (January)', 'Privacy Officer', 'Completed risk analysis worksheet'],
            [
              'Submit prior-year breach log to HHS (if <500 affected)',
              'Annual (March 1 deadline)',
              'Privacy Officer',
              'HHS portal submission confirmation',
            ],
            ['Review and renew expiring BAAs', 'Ongoing / Q1 audit', 'Office Manager', 'Renewed BAA on file'],
            [
              'Staff HIPAA training - annual refresh',
              'Annual',
              'Privacy Officer',
              'Training log with signatures',
            ],
            [
              'Review privacy policies and update if needed',
              'Annual',
              'Privacy Officer',
              'Dated policy with review signature',
            ],
          ]}
        />
      </Section>

      <Section title="Q2 - April through June">
        <Table
          headers={['Task', 'Cadence', 'Owner', 'Evidence Required']}
          rows={[
            [
              'Access review - all systems with PHI access',
              'Quarterly or semi-annual',
              'Office Manager',
              'Signed access review summary',
            ],
            [
              'Audit log review - EHR and billing system',
              'Quarterly',
              'Privacy Officer',
              'Review record with anomaly notes',
            ],
            [
              'Vendor BAA status check - flag renewals due in Q3/Q4',
              'Semi-annual',
              'Office Manager',
              'Updated vendor tracker',
            ],
            [
              'NPP distribution review - confirm current version in use',
              'Annual (spring)',
              'Front Desk Supervisor',
              'Distribution log sample',
            ],
          ]}
        />
      </Section>

      <Section title="Q3 - July through September">
        <Table
          headers={['Task', 'Cadence', 'Owner', 'Evidence Required']}
          rows={[
            [
              'Mid-year access review - verify no access drift',
              'Quarterly',
              'Office Manager',
              'Signed access review',
            ],
            [
              'Security training refresh (phishing, workstation)',
              'Annual or as needed',
              'Privacy Officer',
              'Training completion log',
            ],
            [
              'Business continuity plan test or tabletop exercise',
              'Annual',
              'Privacy Officer',
              'After-action report',
            ],
            ['Audit log review - Q3', 'Quarterly', 'Privacy Officer', 'Review record'],
          ]}
        />
      </Section>

      <Section title="Q4 - October through December">
        <Table
          headers={['Task', 'Cadence', 'Owner', 'Evidence Required']}
          rows={[
            [
              'Annual risk analysis - initiate for next cycle',
              'Annual (Q4 prep)',
              'Privacy Officer',
              'Risk register draft',
            ],
            [
              'Year-end BAA audit - confirm all active vendors covered',
              'Annual',
              'Office Manager',
              'Complete BAA inventory',
            ],
            ['Incident log year-end review', 'Annual', 'Privacy Officer', 'Incident log signed and filed'],
            [
              'Plan next year\'s training calendar',
              'Annual (December)',
              'Privacy Officer',
              'Training schedule draft',
            ],
          ]}
        />
      </Section>

      <Section title="Monthly tasks (every month)">
        <Bullets
          items={[
            'Review any incident reports received and document disposition',
            'Confirm new vendors onboarded since last month have signed BAAs',
            'Check for terminated employees - verify same-day access revocation log',
            'Review EHR audit log for anomalous access patterns',
          ]}
        />
      </Section>

      <Callout label="March 1 deadline">
        HHS requires covered entities to submit their annual breach log for all breaches affecting fewer than 500
        individuals by March 1 of the following year. Missed submissions are a compliance finding.
      </Callout>

      <Section title="From PHIGuard">
        <P>
          PHIGuard turns this calendar into a live compliance task board with assigned owners, due-date alerts, and
          evidence attached to each review cycle. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
