import { PLANS } from '@phiguard/billing/plans'
import { commercialKnowledgeCopy } from '@phiguard/knowledge/commercial'
import { Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

const phiguardAnnualPrice = {
  essentials: `$${PLANS.essentials.prices.annual.amount.toLocaleString('en-US')}`,
  clinic: `$${PLANS.clinic.prices.annual.amount.toLocaleString('en-US')}`,
  group: `$${PLANS.group.prices.annual.amount.toLocaleString('en-US')}`,
} as const

export default function HipaaBudgetCalculatorDocument() {
  return (
    <PdfLayout
      title="Small Clinic HIPAA Compliance Budget Planner"
      subtitle="Line-item cost estimates across 7 categories with 5-staff, 10-staff, and 25-staff scenarios."
    >
      <Section title="How to use this planner">
        <P>
          Use the scenario closest to your clinic size as a starting point. Replace estimates with
          actual quotes where available, and add a 10-15% contingency for unplanned compliance
          events. The goal is an honest operating budget, not an optimistic one.
        </P>
      </Section>

      <Section title="Budget categories">
        <Table
          headers={['Category', 'What it covers', 'Annual cost estimate']}
          rows={[
            [
              'HIPAA compliance software',
              'BAA tracking, risk analysis tool, incident log, training records, audit log',
              'See scenario table below',
            ],
            [
              'Workforce training',
              'Annual HIPAA training program - content and delivery',
              '$200-800 depending on staff count and method',
            ],
            [
              'Risk analysis',
              'Annual risk analysis - if completed with external support',
              '$500-2,000 for consultant support; $0 if completed with software tool',
            ],
            [
              'BAA counsel review',
              'Attorney review of non-standard BAAs or new vendor contracts',
              '$300-600 per review (estimate 2-4 per year)',
            ],
            [
              'Breach response reserve',
              'Costs associated with breach notification: counsel, notification letters, credit monitoring',
              '$5,000-15,000 per incident (or cyber insurance premium)',
            ],
            [
              'Training administration time',
              'Staff time to coordinate and complete annual training',
              '2-4 hours per staff member x hourly cost',
            ],
            [
              'Vendor management overhead',
              'Time to review and renew vendor BAAs annually',
              '4-8 hours of administrative time per year',
            ],
          ]}
        />
      </Section>

      <Section title="Scenario 1: 5-staff practice">
        <Table
          headers={['Item', 'Annual Cost']}
          rows={[
            ['HIPAA compliance software (e.g., PHIGuard Essentials annual)', phiguardAnnualPrice.essentials],
            ['Annual workforce training (5 staff)', '$500'],
            ['Annual risk analysis (software-assisted, no consultant)', '$0'],
            ['BAA counsel review (2 non-standard agreements)', '$600'],
            ['Cyber insurance premium (breach reserve alternative)', '$2,400'],
            ['Training administration time (5 staff x 2 hrs x $50/hr)', '$500'],
            ['Vendor management overhead (4 hrs x $50/hr)', '$200'],
            ['TOTAL', '$5,988'],
          ]}
        />
      </Section>

      <Section title="Scenario 2: 10-staff practice">
        <Table
          headers={['Item', 'Annual Cost']}
          rows={[
            ['HIPAA compliance software (e.g., PHIGuard Clinic annual)', phiguardAnnualPrice.clinic],
            ['Annual workforce training (10 staff)', '$1,000'],
            ['Annual risk analysis (software-assisted)', '$0'],
            ['BAA counsel review (3 non-standard agreements)', '$900'],
            ['Cyber insurance premium', '$3,600'],
            ['Training administration time (10 staff x 2 hrs x $50/hr)', '$1,000'],
            ['Vendor management overhead (6 hrs x $50/hr)', '$300'],
            ['TOTAL', '$9,068'],
          ]}
        />
      </Section>

      <Section title="Scenario 3: 25-staff practice">
        <Table
          headers={['Item', 'Annual Cost']}
          rows={[
            ['HIPAA compliance software (e.g., PHIGuard Group annual)', phiguardAnnualPrice.group],
            ['Annual workforce training (25 staff)', '$2,500'],
            ['Annual risk analysis (software-assisted)', '$0'],
            ['BAA counsel review (4 agreements)', '$1,200'],
            ['Cyber insurance premium', '$6,000'],
            ['Training administration time (25 staff x 2 hrs x $50/hr)', '$2,500'],
            ['Vendor management overhead (8 hrs x $50/hr)', '$400'],
            ['TOTAL', '$17,268'],
          ]}
        />
      </Section>

      <Callout label="The hidden cost most clinics miss">
        Breach response is where budgets break. A single breach affecting 50 patients can cost
        $5,000-$15,000 in notification, legal review, and credit monitoring before any OCR penalty.
        Cyber insurance at $2,000-6,000/year is the most common mitigation strategy for small
        practices.
      </Callout>

      <Section title="From PHIGuard">
        <P>
          PHIGuard replaces multiple line items: compliance software, risk analysis tooling,
          incident log, training records, and BAA tracking. {commercialKnowledgeCopy.pricingModel}{' '}
          See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
