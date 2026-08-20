import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaComplaintResponseTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Complaint Response Template"
      subtitle="Complaint intake, acknowledgment letter, investigation documentation, outcome notice, and corrective action tracker - in one package."
    >
      <Callout label="Regulatory basis - 45 CFR §164.530(d)">
        Covered entities must have a process for receiving, documenting, and responding to complaints about their
        privacy practices. Workforce members must know how to direct complaints to the designated Privacy Officer.
        Complaints must not result in retaliation against the complainant.
      </Callout>

      <Section title="Form 1: Complaint intake">
        <Table
          headers={['Field', 'Detail']}
          rows={[
            ['Complaint received date', ''],
            ['Method of receipt (in person / phone / email / mail / portal)', ''],
            ['Complainant name', ''],
            ['Complainant contact information', ''],
            ['Patient name (if different from complainant)', ''],
            ['Summary of alleged privacy issue', ''],
            ['Date of alleged incident (if known)', ''],
            ['Workforce member(s) involved (if identified)', ''],
            ['Complaint assigned to (investigator)', ''],
            ['Date assigned', ''],
            ['Target investigation completion date', ''],
          ]}
        />
      </Section>

      <Section title="Form 2: Patient acknowledgment letter template">
        <P>
          Send to the complainant within 5 business days of receiving the complaint. Adapt the bracketed fields.
        </P>
        <P>
          "Dear [Complainant Name],
        </P>
        <P>
          Thank you for contacting [Clinic Name] regarding a concern about the privacy of your health information. We
          take all privacy concerns seriously and are committed to protecting the information of every patient we serve.
        </P>
        <P>
          We have received your complaint dated [Date] and have opened an internal review. You can expect to hear from
          us regarding the outcome of our review by [Target Date - recommend within 30 days].
        </P>
        <P>
          If you have additional information to share, please contact our Privacy Officer at [Contact Information].
          You also have the right to file a complaint directly with the U.S. Department of Health and Human Services
          Office for Civil Rights at hhs.gov/hipaa/filing-a-complaint.
        </P>
        <P>
          Sincerely, [Privacy Officer Name and Title] [Clinic Name]"
        </P>
      </Section>

      <Section title="Form 3: Investigation documentation">
        <Table
          headers={['Investigation Step', 'Completed (Y/N)', 'Date', 'Notes']}
          rows={[
            ['Acknowledgment letter sent to complainant', '', '', ''],
            ['Relevant records and logs reviewed', '', '', ''],
            ['Workforce member(s) involved interviewed', '', '', ''],
            ['EHR access logs reviewed for relevant dates', '', '', ''],
            ['Applicable policy reviewed', '', '', ''],
            ['Breach risk assessment initiated (if applicable)', '', '', ''],
            ['Investigation findings documented', '', '', ''],
          ]}
        />
        <P>Summary of findings:</P>
        <P>________________________________________________________________________</P>
        <P>________________________________________________________________________</P>
      </Section>

      <Section title="Form 4: Outcome notice template">
        <P>
          Send to the complainant after investigation is complete. Adapt the bracketed fields.
        </P>
        <P>
          "Dear [Complainant Name],
        </P>
        <P>
          We have completed our review of your privacy concern submitted on [Date]. [Select one: We found no evidence
          of a privacy violation in connection with the described incident. / Our review identified an issue with how
          your information was handled, and we have taken corrective steps to address it.]
        </P>
        <P>
          [If corrective action was taken: We have [describe corrective action taken - e.g., retrained involved staff /
          updated our access procedures] to prevent a similar issue from occurring.]
        </P>
        <P>
          You retain the right to file a complaint with the HHS Office for Civil Rights at any time, regardless of
          this response. Thank you for bringing this matter to our attention.
        </P>
        <P>
          Sincerely, [Privacy Officer Name and Title] [Clinic Name]"
        </P>
      </Section>

      <Section title="Form 5: Corrective action tracker">
        <Table
          headers={['Corrective Action Required', 'Owner', 'Due Date', 'Status', 'Completion Date', 'Evidence']}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Complaint file closure">
        <Bullets
          items={[
            'All forms and correspondence retained in complaint file',
            'Corrective actions completed and documented',
            'Complaint file retained for 6 years per 45 CFR §164.530(j)',
            'No retaliation against complainant confirmed and documented',
          ]}
        />
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['File closed by (Privacy Officer)', ''],
            ['Date closed', ''],
            ['File location (document management system path)', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard creates a complaint response task on intake, tracks each investigation step, and retains the
          complete complaint record with 6-year retention reminders. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
