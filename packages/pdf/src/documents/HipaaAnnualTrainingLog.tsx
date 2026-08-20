import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAnnualTrainingLogDocument() {
  return (
    <PdfLayout
      title="HIPAA Annual Training Log"
      subtitle="An OCR audit-ready training log with attendance table, attestation fields, topics-covered checklist, and 6-year retention guidance."
    >
      <Section title="Training session header">
        <Table
          headers={['Field', 'Detail']}
          rows={[
            ['Practice name', ''],
            ['Training date', ''],
            ['Training type (annual / new hire / policy update)', ''],
            ['Training format (in person / video / online module / written materials)', ''],
            ['Trainer name and title', ''],
            ['Training duration', ''],
            ['Location or platform (if remote)', ''],
          ]}
        />
      </Section>

      <Callout label="Regulatory basis - 45 CFR §164.530(b) and §164.308(a)(5)">
        The Privacy Rule (§164.530(b)) requires training of all workforce members on Privacy Rule policies and
        procedures. The Security Rule (§164.308(a)(5)) requires a security awareness and training program that
        addresses malicious software, log-in monitoring, and password management. Both require training at hire and
        when policies materially change.
      </Callout>

      <Section title="Topics covered - check all that apply">
        <Bullets
          items={[
            '☐  HIPAA Privacy Rule overview - permitted uses and disclosures, TPO exception',
            '☐  HIPAA Security Rule overview - administrative, physical, and technical safeguards',
            '☐  PHI handling procedures - minimum necessary, access controls, disposal',
            '☐  Breach notification - what constitutes a breach, how to report internally',
            '☐  Social media policy - PHI prohibitions, patient photo rules, comment response',
            '☐  AI tool policy - approved tools, PHI prohibitions, incident reporting',
            '☐  Incident response - how to recognize and report a security incident',
            '☐  Workforce sanctions - what happens when policy is violated',
            '☐  Patient rights - access requests, amendments, accounting of disclosures',
            '☐  Clinic-specific policy updates (describe below)',
          ]}
        />
        <P>Clinic-specific topics covered: _______________________________________________</P>
      </Section>

      <Section title="Attendance and attestation table">
        <Table
          headers={['Employee Name', 'Role / Department', 'Date Signed', 'Initials', 'Training Method', 'New Hire (Y/N)']}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
        <P>
          Attestation language: "I confirm that I attended the HIPAA training described above and understand my
          obligations under HIPAA, clinic privacy and security policies, and the workforce sanction policy."
        </P>
      </Section>

      <Section title="Trainer attestation">
        <Table
          headers={['Field', 'Detail']}
          rows={[
            ['I confirm that the training described above was conducted on the date and in the format listed:', ''],
            ['Trainer signature', ''],
            ['Trainer printed name', ''],
            ['Date', ''],
          ]}
        />
      </Section>

      <Section title="Absentee tracking">
        <P>
          Workforce members who were absent for scheduled training must complete a makeup session. Document below:
        </P>
        <Table
          headers={['Employee Name', 'Reason for Absence', 'Makeup Session Date', 'Makeup Completed (Y/N)']}
          rows={[
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Retention reminder">
        <Bullets
          items={[
            'Retain this log for 6 years from the date of training per 45 CFR §164.530(j)',
            'Store in a location accessible to the Privacy Officer for OCR audit requests',
            'Individual training records must be traceable by staff member name and date',
            'Next annual training due date: _______________',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks training completion per staff member with timestamps, schedules annual renewal tasks, and
          maintains the six-year training record in the compliance evidence log. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
