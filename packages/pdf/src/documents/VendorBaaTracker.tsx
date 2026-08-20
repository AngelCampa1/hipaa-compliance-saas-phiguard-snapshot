import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function VendorBaaTrackerDocument() {
  return (
    <PdfLayout
      title="Vendor BAA Tracker"
      subtitle="The template, categorization guide, and due-diligence questionnaire to keep every business associate accounted for."
    >
      <Section title="Who counts as a business associate">
        <P>
          A business associate is any person or entity that creates, receives, maintains, or transmits PHI on behalf of
          a covered entity in connection with a function or activity regulated by HIPAA. The defining question is not
          "does this vendor handle sensitive data" - it is "does this vendor handle PHI on our behalf as part of what
          we pay them to do." Under §160.103, business associates include claims processors, billing companies, cloud
          storage providers, EHR vendors, transcription services, shredding companies that handle PHI-containing
          documents, and many IT contractors.
        </P>
        <P>
          A subcontractor that creates, receives, maintains, or transmits PHI on behalf of a business associate is
          itself a business associate. The BAA must flow down. This was the major change in the 2013 Omnibus Rule.
        </P>
        <Callout label="Conduit exception">
          The conduit exception is narrow. It covers entities that transport PHI but do not access it - postal
          services, private couriers, and internet service providers that merely route packets. Cloud storage, email
          hosts, and EHR platforms do not qualify, even if encryption is end-to-end.
        </Callout>
      </Section>

      <Section title="The tracker template">
        <P>
          Maintain this tracker in a single place. Every row is a vendor. Every column is a compliance question your
          privacy officer needs to answer on demand.
        </P>
        <Table
          headers={['Vendor', 'Service', 'PHI?', 'BAA status', 'Signed', 'Effective', 'Termination', 'Subs doc\'d', 'Last review', 'Renewal']}
          rows={[
            ['', '', '', 'Signed / Pending / N/A', '', '', '', 'Yes / No', '', ''],
          ]}
        />
        <P>Columns explained:</P>
        <Bullets
          items={[
            'Vendor name - legal entity, not a product brand.',
            'Service category - EHR, billing, IT, shredding, cloud storage, transcription, answering service, etc.',
            'PHI touched - a one-line description of what the vendor sees.',
            'BAA status - Signed, Pending, or N/A (with reason if N/A).',
            'Signed date - when the current BAA was executed.',
            'Effective date - when PHI access under the current BAA began.',
            'Termination clause - summary of return/destruction terms and notice periods.',
            'Subcontractors documented - Yes if the vendor has provided a current list; No otherwise.',
            'Last reviewed - the most recent internal review date.',
            'Renewal reminder - target date for the next review or renewal.',
          ]}
        />
      </Section>

      <Section title="Vendor categorization guide">
        <Subsection title="Business associate - BAA required">
          <Bullets
            items={[
              'EHR vendor - full chart access.',
              'Billing service - claims and demographics.',
              'Cloud storage (e.g., AWS, Azure, Google Cloud) where PHI is stored.',
              'Transcription or scribe services.',
              'Answering service that takes patient messages.',
              'IT contractor with administrative access to systems containing PHI.',
              'Shredding company that handles PHI-containing paper.',
            ]}
          />
        </Subsection>
        <Subsection title="Subcontractor - BAA required between BA and sub">
          <Bullets
            items={[
              'Cloud infrastructure used by your EHR vendor.',
              'Sub-processors used by your billing service for printing and mailing.',
              'Offshore coding vendors used by your billing service.',
            ]}
          />
          <P>
            You do not sign a BAA directly with a subcontractor. Your BAA with the business associate requires them to
            sign BAAs down the chain. You may, and should, request confirmation that flow-down is in place.
          </P>
        </Subsection>
        <Subsection title="Conduit exception - no BAA required">
          <Bullets
            items={[
              'U.S. Postal Service and private couriers for paper mail.',
              'Internet service providers routing encrypted traffic.',
              'Telephone carriers carrying voice calls.',
            ]}
          />
        </Subsection>
      </Section>

      <Section title="Due-diligence questionnaire">
        <P>
          Send this to every vendor before executing a BAA. Retain responses alongside the signed agreement. A vendor
          that cannot answer these questions in writing is not a vendor you should be sending PHI to.
        </P>
        <Bullets
          items={[
            'Describe the administrative, physical, and technical safeguards you apply to PHI in scope of our relationship.',
            'List all subcontractors that will access PHI. Confirm each has signed a BAA with you.',
            'Confirm PHI is encrypted at rest and in transit. Specify the encryption standard (e.g., AES-256, TLS 1.2+).',
            'State your breach notification commitment to us, with a specific timeline in hours or days.',
            'Identify the data residency - the country or countries where PHI is stored or processed.',
            'Describe your incident response plan and how often it is tested.',
            'Provide your most recent third-party security attestation (SOC 2 Type II, HITRUST, or equivalent) or explain why one does not exist.',
            'Describe how PHI is returned or destroyed at termination.',
          ]}
        />
      </Section>

      <Section title="Sample filled-out row">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Vendor', 'Athena Health, Inc.'],
            ['Service category', 'EHR'],
            ['PHI touched', 'Full chart - demographics, clinical, billing'],
            ['BAA status', 'Signed'],
            ['Signed date', '2024-03-15'],
            ['Effective date', '2024-04-01'],
            ['Termination clause', '30-day PHI return or destruction on termination'],
            ['Subcontractors documented', 'Yes - list received 2026-Q1'],
            ['Last reviewed', '2026-Q1'],
            ['Renewal reminder', '2027-03-01'],
          ]}
        />
      </Section>

      <Section title="Renewal cadence recommendation">
        <Bullets
          items={[
            'Annual review for every BA with PHI access, even if the BAA has no expiration.',
            'Trigger-based review when the vendor announces an acquisition, a breach, a product line change, or a material change to subcontractors.',
            'Re-paper any BAA signed before 2013 to reflect the Omnibus Rule\'s subcontractor flow-down and breach notification requirements.',
            'Document the review, even if no changes result. "We reviewed and no changes were needed" is a valid outcome and must be logged.',
          ]}
        />
      </Section>

      <Section title="Common tracker mistakes">
        <Bullets
          items={[
            'Listing the product name instead of the legal entity. BAAs are between entities, not brands.',
            'Marking "BAA signed" without a date - an undated BAA is a BAA you cannot defend.',
            'Forgetting digital fax, online scheduling, and patient-communication vendors. They see PHI too.',
            'Not tracking subcontractor disclosure - you have no right to surprise subs handling your patients\' PHI.',
            'Letting the tracker live in one person\'s email instead of a shared, access-controlled system.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard keeps this tracker live, ties every vendor to the PHI they touch, and surfaces renewals before they
          lapse. If vendor BAAs live in a spreadsheet only one person can find, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
