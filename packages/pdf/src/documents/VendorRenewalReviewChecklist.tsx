import { Bullets, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function VendorRenewalReviewChecklistDocument() {
  return (
    <PdfLayout
      title="Vendor BAA Renewal Review Checklist"
      subtitle="A structured review workflow for vendor BAA renewals - covering BAA terms, subprocessors, AI features, security posture, and renewal decisions."
    >
      <Section title="When to start the renewal review">
        <Bullets
          items={[
            'Start 90 days before the BAA expiration date to allow time for renegotiation if needed',
            'Start immediately if the vendor announces a material change (acquisition, new AI features, new subprocessors)',
            'Run this checklist at minimum annually even if the BAA has no formal expiration date',
          ]}
        />
      </Section>

      <Section title="Section 1: Vendor identification and current BAA status">
        <Table
          headers={['Field', 'Details']}
          rows={[
            ['Vendor name', ''],
            ['Service provided', ''],
            ['PHI types the vendor handles', ''],
            ['Current BAA expiration date', ''],
            ['BAA signed by', ''],
            ['Date of last review', ''],
          ]}
        />
      </Section>

      <Section title="Section 2: BAA terms review">
        <Table
          headers={['Requirement', 'Present in current BAA? (Y/N/Partial)', 'Action needed']}
          rows={[
            ['Permitted uses and disclosures of PHI defined', '', ''],
            ['Obligation to execute downstream BAAs with subprocessors', '', ''],
            ['Breach notification timeline (60 days or shorter)', '', ''],
            ['Return or destruction of PHI at contract termination', '', ''],
            ["Right to audit or inspect vendor's practices", '', ''],
            ['Subprocessor disclosure and change notification', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 3: Material changes since last review">
        <Table
          headers={['Change type', 'Did this occur? (Y/N)', 'Details if yes']}
          rows={[
            ['Vendor acquisition or merger', '', ''],
            ['New AI features added to the product', '', ''],
            ['New subprocessors added (especially AI service providers)', '', ''],
            ['Data center / infrastructure migration', '', ''],
            ["Changes to the vendor's security certifications (SOC 2, HITRUST)", '', ''],
            ['Security incidents reported by the vendor', '', ''],
            ["Changes to the vendor's privacy policy or DPA", '', ''],
          ]}
        />
      </Section>

      <Section title="Section 4: AI subprocessor assessment">
        <Table
          headers={['Question', 'Answer']}
          rows={[
            ['Does the vendor use AI features that process PHI?', ''],
            ['Which AI provider(s) does the vendor use?', ''],
            ["Does the vendor have a BAA with the AI provider?", ''],
            ["Is PHI sent to the AI provider's servers, or is inference done locally?", ''],
            ["Does the AI provider use customer data for model training? Is there an opt-out?", ''],
          ]}
        />
      </Section>

      <Section title="Section 5: Security posture review">
        <Table
          headers={['Item', 'Status']}
          rows={[
            ['Current SOC 2 Type II report available?', 'Y / N / Date of last report:'],
            ['HITRUST certification or equivalent?', 'Y / N'],
            ["Vendor's incident history in past 12 months?", 'No incidents / Incidents noted:'],
            ['Encryption at rest and in transit confirmed?', 'Y / N'],
          ]}
        />
      </Section>

      <Section title="Section 6: Renewal decision">
        <Table
          headers={['Decision', 'Criteria']}
          rows={[
            [
              'Renew as-is',
              'BAA terms intact, no material changes, security posture confirmed, subprocessors covered',
            ],
            [
              'Renew with revised terms',
              'Material changes found, BAA terms need updating, AI subprocessor gaps identified',
            ],
            [
              'Put on review hold',
              'Cannot get answers to AI or subprocessor questions - do not renew until resolved',
            ],
            [
              'Terminate',
              'Vendor cannot provide BAA, refuses to disclose subprocessors, or security posture unacceptable',
            ],
          ]}
        />
      </Section>

      <Section title="Renewal decision">
        <Table
          headers={['Field', 'Detail']}
          rows={[
            ['Decision', 'Renew / Revise / Hold / Terminate'],
            ['Rationale', ''],
            ['Required actions before renewal', ''],
            ['New BAA expiration date', ''],
            ['Reviewed by', ''],
            ['Review date', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks vendor renewal dates and generates a review task 90 days before each
          expiration. The completed checklist is stored in the vendor record alongside the signed
          BAA. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
