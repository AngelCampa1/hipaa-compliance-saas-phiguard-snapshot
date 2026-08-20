import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function PhiDisposalLogTemplate() {
  return (
    <PdfLayout
      title="PHI Disposal & Destruction Tracking Log"
      subtitle="A clinic-ready log for documenting every PHI destruction event"
    >
      <Section title="Why disposal logging matters">
        <P>
          45 CFR 164.310(d)(2)(i) requires policies and procedures for the final disposition of PHI and the
          media on which it is stored. 45 CFR 164.530(c) requires reasonable safeguards. A written log is how
          a clinic proves both happened. Surveyors and OCR investigators ask for disposal evidence early in
          most inquiries. Undocumented destruction reads as no destruction.
        </P>
        <Callout label="Rule of thumb">
          If you cannot show a witnessed log entry for an item, assume the item was not destroyed for audit
          purposes.
        </Callout>
      </Section>

      <Section title="Required log fields">
        <Bullets
          items={[
            'Date of destruction (YYYY-MM-DD).',
            'Item description - describe the media, not the patient. "Intake forms 2024-Q1," not patient names.',
            'Volume or count (sheets, bins, drives, devices).',
            'Destruction method (cross-cut shred, certified vendor, NIST SP 800-88 Purge, physical destruction).',
            'Destroyer initials (the workforce member who performed or witnessed pickup).',
            'Witness initials (second workforce member confirming the event).',
            'Vendor name and BAA on file (only when destruction is outsourced).',
          ]}
        />
      </Section>

      <Section title="Sample log entries">
        <Table
          headers={['Date', 'Item', 'Method', 'Destroyer', 'Witness']}
          rows={[
            ['2026-04-12', 'Intake forms Q1', 'Cross-cut shred', 'AK', 'JM'],
            ['2026-04-15', '2 retired laptop drives', 'Physical destruction + Purge', 'RS', 'AK'],
            ['2026-04-22', 'Mobile phone (factory reset)', 'NIST SP 800-88 Clear', 'JM', 'RS'],
            ['2026-04-28', '4 bins paper PHI', 'Vendor pickup, certificate filed', 'AK', 'JM'],
          ]}
        />
      </Section>

      <Section title="Acceptable destruction methods">
        <Bullets
          items={[
            'Paper PHI: cross-cut shredding to particles roughly 1 by 5 millimeters or smaller. Strip-cut is not sufficient.',
            'Outsourced destruction: certified vendor under a signed BAA, with certificate of destruction retained.',
            'Electronic media leaving the clinic: NIST SP 800-88 Rev. 1 Purge or physical destruction.',
            'Electronic media reused inside the clinic: NIST SP 800-88 Clear with verification.',
            'Mobile devices that touched PHI: factory reset plus device wipe, logged.',
          ]}
        />
      </Section>

      <Section title="Vendor BAA requirements">
        <P>
          A vendor that destroys PHI on the clinic's behalf is a business associate. Sign a BAA before turning
          over any container. Keep the BAA, the certificate of destruction, and the corresponding log entry
          together in the evidence binder. If the vendor sub-contracts destruction, the subcontractor must
          also be covered.
        </P>
      </Section>

      <Section title="Retention of the log itself">
        <P>
          The disposal log is HIPAA documentation. Retain it for at least six years from creation or last
          effective date, per 45 CFR 164.530(j)(2). Do not store the log in a bin headed for destruction. Many
          clinics keep the current sheet at the shred station and archive completed sheets monthly to the
          compliance binder or document store.
        </P>
      </Section>

      <Section title="How to use this template">
        <Bullets
          items={[
            'Print and clip to the shred bin or filing cabinet.',
            'Fill the row at the moment of destruction, not later.',
            'Witness initials are required - two-person verification is the easiest control to demonstrate.',
            'Scan completed pages monthly into the compliance evidence folder.',
            'Review the log quarterly during compliance committee or Privacy Officer review.',
          ]}
        />
      </Section>
    </PdfLayout>
  )
}
