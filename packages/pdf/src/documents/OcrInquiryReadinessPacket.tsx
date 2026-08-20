import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function OcrInquiryReadinessPacketDocument() {
  return (
    <PdfLayout
      title="OCR Inquiry Readiness Packet"
      subtitle="A 24-hour preservation checklist, evidence binder structure, common OCR document requests, and a counsel handoff memo template."
    >
      <Section title="Why you need this before an inquiry arrives">
        <P>
          OCR investigations are triggered by patient complaints, breach reports, and random audits.
          The first request typically arrives with a 10-14 day response window. Clinics that have
          organized their compliance evidence before the inquiry respond faster and with less
          disruption than those assembling it under pressure.
        </P>
      </Section>

      <Section title="Part 1: 24-hour preservation checklist">
        <Bullets
          items={[
            'Preserve all electronic records as-is - do not delete, move, or modify any potentially relevant files',
            'Export and preserve EHR audit logs for the relevant time period',
            'Preserve all email correspondence related to the incident or complaint',
            'Document when you became aware of the OCR inquiry and who was notified',
            'Identify who will serve as the primary contact for OCR communications',
            'Contact legal counsel - do not respond to OCR without counsel review',
            'Notify clinic leadership and any relevant staff who may have information',
          ]}
        />
      </Section>

      <Section title="Part 2: Evidence binder structure">
        <Table
          headers={['Section', 'Contents']}
          rows={[
            [
              '1. Policies and procedures',
              'Current privacy policy, security policy, access control policy, sanctions policy, breach response procedures - all dated and signed',
            ],
            [
              '2. Training records',
              'Training logs for all workforce members - dates, content covered, signatures - for the relevant period',
            ],
            [
              '3. Risk analysis',
              'Most recent risk analysis worksheet with findings, risk ratings, and remediation assignments',
            ],
            [
              '4. Vendor BAA inventory',
              'Complete list of business associates with signed BAAs, including EHR vendor, clearinghouse, billing service, IT support',
            ],
            [
              '5. Incident log',
              'All incidents logged since practice opening - near-misses, security events, and breaches - with 4-factor assessments where applicable',
            ],
            [
              '6. Access reviews',
              'Most recent access review records - system-by-system, with reviewer and date',
            ],
            [
              '7. Audit logs',
              'EHR and other system audit log exports for the relevant period',
            ],
          ]}
        />
      </Section>

      <Section title="Part 3: Common first-round OCR document requests">
        <Bullets
          items={[
            'HIPAA policies and procedures (Privacy Rule and Security Rule)',
            'Training records for all workforce members',
            'Most recent risk analysis and risk management plan',
            'Complete list of business associates and signed BAAs',
            'Incident log and breach notification records',
            'Notice of Privacy Practices and distribution records',
            'Access control policies and recent access review records',
            'Sanction policy and records of sanctions applied',
          ]}
        />
      </Section>

      <Section title="Part 4: Response roles">
        <Table
          headers={['Role', 'Responsibilities']}
          rows={[
            [
              'Privacy Officer',
              'Primary point of contact for OCR; assembles evidence; reviews all outgoing responses before submission',
            ],
            [
              'Clinic Administrator',
              'Ensures staff cooperation; coordinates scheduling around requests; supports evidence collection',
            ],
            [
              'Legal Counsel',
              'Reviews all OCR communications before they are sent; advises on scope of disclosures; manages negotiation',
            ],
            [
              'Providers',
              'Available for interview if requested; do not communicate directly with OCR without counsel present',
            ],
          ]}
        />
        <Callout label="Do not submit without counsel review">
          Every document submitted to OCR becomes part of the investigative record. Submitting too
          much, too little, or responding without understanding the scope of the inquiry can expand
          the investigation. All submissions should be reviewed by counsel.
        </Callout>
      </Section>

      <Section title="Part 5: Counsel handoff memo template">
        <P>Use this memo to brief legal counsel at the outset of an inquiry.</P>
        <Table
          headers={['Field', 'Content']}
          rows={[
            ['Date of OCR contact', ''],
            ['Method of contact (letter, email, phone)', ''],
            ['OCR case number (if provided)', ''],
            ['Complaint or matter description', ''],
            ['Response deadline given', ''],
            ['Documents already preserved', ''],
            ['Key witnesses (staff who have relevant knowledge)', ''],
            ['Any prior OCR contact or enforcement history', ''],
            ['Known gaps in compliance program', 'Be honest with counsel - they need to know'],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard maintains the evidence binder structure as a living compliance record - policies,
          training logs, risk analysis, BAA inventory, incident log, and access reviews - all
          organized and accessible when an OCR inquiry arrives. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
