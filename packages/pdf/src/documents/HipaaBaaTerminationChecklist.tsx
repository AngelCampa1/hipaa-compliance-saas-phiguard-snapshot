import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaBaaTerminationChecklistDocument() {
  return (
    <PdfLayout
      title="BAA Termination Checklist"
      subtitle="A step-by-step checklist for ending a business associate relationship compliantly - covering access revocation, PHI return and destruction, and written certification."
    >
      <Section title="Before you give notice">
        <P>
          Review the termination provisions in your existing BAA before notifying the vendor. Confirm the following:
        </P>
        <Bullets
          items={[
            'What notice period is required under the BAA (typically 30-90 days)',
            'Whether the BAA requires PHI return, destruction, or allows retention with continued protections',
            'Who the designated contact for termination communications is at the vendor',
            'Whether the BAA includes a termination-for-cause provision and whether it applies',
          ]}
        />
      </Section>

      <Section title="Section 1: Pre-termination planning">
        <Table
          headers={['Item', 'Completed (Y/N)', 'Notes']}
          rows={[
            ['BAA termination provisions reviewed', '', ''],
            ['Required notice period confirmed', '', ''],
            ['PHI scope under this BAA documented', '', ''],
            ['Replacement vendor identified (if applicable)', '', ''],
            ['Replacement vendor BAA executed before data migration', '', ''],
            ['Staff notified of transition timeline', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 2: Termination notice">
        <P>
          Termination notice should be in writing and should reference the specific BAA being terminated. Include:
        </P>
        <Bullets
          items={[
            'Effective termination date',
            'Reference to the original BAA execution date',
            'Request for confirmation of PHI return or destruction per the BAA provisions',
            'Deadline for the vendor to confirm compliance (recommend 30 days from notice)',
          ]}
        />
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Termination notice sent date', ''],
            ['Method of delivery', ''],
            ['Recipient name and title', ''],
            ['Effective termination date', ''],
            ['Confirmation of receipt obtained', ''],
          ]}
        />
      </Section>

      <Section title="Section 3: System access revocation">
        <Table
          headers={['System / Credential', 'Access Revoked (Y/N)', 'Date Revoked', 'Completed by']}
          rows={[
            ['Vendor portal access', '', '', ''],
            ['API keys or integration credentials', '', '', ''],
            ['SSO or federated identity access', '', '', ''],
            ['Shared service accounts', '', '', ''],
            ['Any clinic system access granted to the vendor', '', '', ''],
          ]}
        />
      </Section>

      <Callout label="45 CFR §164.504(e)(2)(ii)(I) - required termination provision">
        Every BAA must require the business associate to return or destroy all PHI at termination and must not retain
        any copies. If return or destruction is infeasible, the BA must extend the BAA protections to the retained PHI
        and limit further uses and disclosures.
      </Callout>

      <Section title="Section 4: PHI return or destruction request">
        <P>
          Submit a written request to the vendor for PHI return or destruction. The request should specify:
        </P>
        <Bullets
          items={[
            'The specific PHI covered (type, scope, date range)',
            'Whether you are requesting return or destruction (or both, with destruction certification)',
            'The required response deadline',
            'The format of the destruction certification you expect to receive',
          ]}
        />
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['PHI return/destruction request sent', ''],
            ['Date sent', ''],
            ['Method of delivery (email, certified mail, portal)', ''],
            ['Response deadline given to vendor', ''],
          ]}
        />
      </Section>

      <Section title="Section 5: Written certification received">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Destruction or return certification received', 'Y / N'],
            ['Date received', ''],
            ['Certification covers all PHI in scope', 'Y / N - exceptions:'],
            ['Certification signed by authorized vendor representative', 'Y / N'],
            ['Certification filed in vendor compliance record', 'Y / N'],
          ]}
        />
      </Section>

      <Section title="Section 6: Post-termination documentation">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Vendor BAA registry updated (status: terminated)', ''],
            ['Termination date recorded in registry', ''],
            ['Replacement vendor BAA confirmed active', ''],
            ['Termination file retained for 6 years (per §164.316(b))', ''],
            ['Offboarding completed by', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks vendor BAA status including termination date, destruction certification, and 6-year retention
          of the termination record. Each offboarding step is an assigned task with a due date. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
