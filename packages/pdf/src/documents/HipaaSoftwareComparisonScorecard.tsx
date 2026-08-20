import { commercialKnowledgeCopy } from '@phiguard/knowledge/commercial'
import { Bullets, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaSoftwareComparisonScorecardDocument() {
  return (
    <PdfLayout
      title="HIPAA Software Comparison Scorecard"
      subtitle="A weighted scoring matrix for evaluating HIPAA compliance software - with 7 dimensions, weight guidance, and red flag indicators."
    >
      <Section title="How to use this scorecard">
        <P>
          Fill in up to 5 tool names across the columns. Score each dimension from 1 to 5 using the
          scoring guide below, then multiply each score by the dimension weight to get a weighted
          score. Total the weighted scores at the bottom to compare tools side by side. Before
          making a final decision, work through the red flag checklist - any red flag is a reason
          to pause regardless of the weighted total.
        </P>
      </Section>

      <Section title="Scoring dimensions">
        <Table
          headers={['Dimension', 'Weight', 'Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Tool 5']}
          rows={[
            ['BAA availability (included at your plan tier)', '20%', '', '', '', '', ''],
            ['Pricing model (per-clinic flat vs per-seat)', '20%', '', '', '', '', ''],
            ['Audit logging (who did what and when)', '15%', '', '', '', '', ''],
            ['Incident tracking (log, 4-factor, determination)', '15%', '', '', '', '', ''],
            ['Vendor and BAA management', '10%', '', '', '', '', ''],
            ['Training management (records, completion tracking)', '10%', '', '', '', '', ''],
            ['Support and onboarding for small practices', '10%', '', '', '', '', ''],
            ['WEIGHTED TOTAL', '100%', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Scoring guide">
        <Table
          headers={['Score', 'What it means']}
          rows={[
            ['5', 'Fully meets the requirement; designed for it; evidence available'],
            ['4', 'Mostly meets the requirement; minor gaps or workarounds needed'],
            ['3', 'Partially meets; significant configuration or workarounds required'],
            ['2', 'Limited capability; requires significant external tooling to close the gap'],
            ['1', 'Does not meet the requirement; feature missing or requires enterprise upgrade'],
          ]}
        />
      </Section>

      <Section title="Red flag checklist">
        <Bullets
          items={[
            'BAA requires enterprise plan or separate negotiation - your tier does not include it automatically',
            'Per-seat pricing that scales your compliance cost as you hire',
            'AI features with no disclosed BAA coverage for PHI processing',
            'Audit logs require an add-on or export to be readable',
            'Incident tracking requires building a custom workflow in a generic tool',
            'Vendor management requires a separate spreadsheet because the tool has no BAA tracker',
            'No clear answer from the sales team on which subprocessors handle PHI',
          ]}
        />
      </Section>

      <Section title="PHIGuard reference scores">
        <Table
          headers={['Dimension', 'Score', 'Notes']}
          rows={[
            ['BAA availability', '5', commercialKnowledgeCopy.baaIncluded],
            ['Pricing model', '5', 'Per-clinic flat pricing - no per-seat fees'],
            ['Audit logging', '5', 'Immutable audit log built in - records all PHI access events'],
            ['Incident tracking', '5', '4-factor assessment workflow, classification, determination memo built in'],
            ['Vendor and BAA management', '5', 'BAA tracker with renewal alerts and subprocessor fields'],
            ['Training management', '5', 'Training log with role-based tracking and completion records'],
            ['Support and onboarding', '5', 'Built for small practices - no enterprise implementation required'],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard is built for small clinics that need a BAA-ready compliance program without
          per-seat pricing, implementation fees, or enterprise contracts.{' '}
          {commercialKnowledgeCopy.baaIncluded} See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
