import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaPatientRecordsRequestLogDocument() {
  return (
    <PdfLayout
      title="HIPAA Patient Records Request Log"
      subtitle="Track every § 164.524 access request with the fields OCR expects"
    >
      <Section title="Why a written log matters">
        <P>
          The HIPAA Right of Access Initiative is OCR's most active enforcement program. The pattern in
          most settlements is the same: the clinic could not produce a dated record of when the request
          arrived, what was sent, when it was sent, and what was charged. A simple log written from the
          date of request is the cheapest evidence of compliance you can have.
        </P>
        <Callout label="Response deadline">
          Thirty days to respond from receipt under § 164.524(b)(2). One 30-day extension is allowed only
          if you provide the patient a written explanation and a date by which you will act.
        </Callout>
      </Section>

      <Section title="Required log fields">
        <Bullets
          items={[
            'Request received date and channel (paper, portal, fax, email)',
            'Requester name and relationship to the patient',
            'Patient identifier (MRN, not full name in the log row)',
            'Records requested and date range',
            'Format requested (paper, electronic, summary)',
            'Delivery method and address',
            'Staff member handling the request',
            'Response date and what was sent',
            'Fee charged and basis',
            'Denial reason if applicable, with citation to § 164.524(a)(3)',
            'Extension notice date if used',
          ]}
        />
      </Section>

      <Section title="Sample log row structure">
        <Table
          headers={['Field', 'Example entry']}
          rows={[
            ['Request received', '2026-04-15 (portal)'],
            ['Requester', 'Patient (self)'],
            ['Records', 'Visit notes, 2024-01-01 to 2026-04-01'],
            ['Format', 'Electronic PDF via portal'],
            ['Response due', '2026-05-15'],
            ['Response sent', '2026-04-29'],
            ['Fee', '$0.00 (electronic, no labor)'],
            ['Denial', 'N/A'],
          ]}
        />
      </Section>

      <Section title="Permissible fees">
        <P>
          OCR's copying-fee guidance limits charges to actual labor for copying, supplies, postage, and
          preparation of an agreed-upon summary or explanation. Search and retrieval are not chargeable.
          Many states cap per-page rates lower than your actual cost; the lower cap applies.
        </P>
      </Section>

      <Section title="Reasons for denial">
        <P>
          § 164.524(a)(3) limits denial to specific grounds: psychotherapy notes, information compiled in
          reasonably anticipated litigation, and a small set of reviewable grounds. Reviewable denials
          require offering a licensed healthcare professional review process.
        </P>
        <Bullets
          items={[
            'Unreviewable: psychotherapy notes, litigation-prepared information, certain CLIA records',
            'Reviewable: provider judgment that access would endanger life or safety',
            'Reviewable: reference to another person whose access could harm them',
            'Reviewable: request from a personal representative when access would endanger the patient',
          ]}
        />
      </Section>

      <Section title="State-law overlays">
        <P>
          State medical-records laws sometimes require faster response (15 to 25 days) or different fee
          caps. The stricter rule applies. Add a column to your log noting the jurisdiction if you
          operate across state lines.
        </P>
      </Section>

      <Section title="Enforcement gaps to audit monthly">
        <Bullets
          items={[
            'Requests routed to billing instead of the privacy officer',
            'Electronic format requests answered with paper',
            'Third-party directives ignored or treated as patient requests',
            'Fees billed before delivery',
            '30-day clock missed because the request sat in a fax tray',
            'Denials issued without written reason or review-process notice',
          ]}
        />
      </Section>
    </PdfLayout>
  )
}
