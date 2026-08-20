import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaMedicalRecordsRetentionScheduleDocument() {
  return (
    <PdfLayout
      title="HIPAA Medical Records Retention Schedule"
      subtitle="Federal minimums, state stricter rules, and record-type guidance for covered entities and business associates."
    >
      <Section title="How to use this schedule">
        <P>
          HIPAA itself does not set a single records retention period for medical records - it sets a 6-year retention
          requirement for documentation of HIPAA compliance (policies, procedures, training records, BAAs, and
          equivalent). Medical records retention is governed primarily by state law. This schedule identifies federal
          baselines, the stricter state rules for 10 high-priority states, and the record categories your clinic must
          track.
        </P>
        <Callout label="The applicable rule">
          Apply the longer of: (a) the state minimum for that record type, or (b) any federal minimum that applies.
          When in doubt, retain longer. The cost of over-retention is lower than the cost of a gap in an OCR
          investigation.
        </Callout>
      </Section>

      <Section title="HIPAA compliance documentation - 6-year federal minimum">
        <P>
          Under 45 CFR § 164.530(j) (Privacy Rule) and 45 CFR § 164.316(b)(2) (Security Rule), covered entities must
          retain documentation of HIPAA policies, procedures, and compliance activities for 6 years from the date of
          creation or the date when it was last in effect, whichever is later.
        </P>
        <Table
          headers={['Document Type', 'Federal Minimum', 'Notes']}
          rows={[
            ['HIPAA privacy policies and procedures', '6 years', '§ 164.530(j)(2) - from creation or last effective date'],
            ['HIPAA security policies and procedures', '6 years', '§ 164.316(b)(2) - from creation or last effective date'],
            ['Business associate agreements (BAAs)', '6 years', 'Retain after termination; document PHI destruction'],
            ['Training records (date, attendees, topics)', '6 years', '§ 164.530(b) - who, when, what was covered'],
            ['Risk analysis documentation', '6 years', '§ 164.308(a)(1) - annual risk analysis and remediation'],
            ['Workforce sanction records', '6 years', '§ 164.530(e) - documented discipline for HIPAA violations'],
            ['Notice of Privacy Practices (each version)', '6 years', '§ 164.530(j) - all issued versions'],
            ['Access log reviews', '6 years', '§ 164.312(b) - evidence that logs were reviewed'],
            ['Incident investigation records', '6 years', '§ 164.308(a)(6) - incident log and outcome documentation'],
            ['Breach notification records', '6 years', '§ 164.408(c) - notification letters, HHS submissions'],
          ]}
        />
      </Section>

      <Section title="Medical records - state minimums by record type">
        <Table
          headers={['Record Type', 'Federal Baseline', 'Common State Minimum', 'Stricter State Examples']}
          rows={[
            ['Adult patient medical records', 'No federal minimum (HIPAA)', '7-10 years from last treatment', 'CA: 7 years (10 for minors); NY: 6 years; IL: 10 years'],
            ['Minor patient records', 'No federal minimum', 'Until age of majority + 3-10 years', 'CA: Until age 28; NY: Until age 21 or 6 years from last treatment, whichever is longer'],
            ['Mental health records', 'No federal minimum', '10 years from last treatment', 'IL: 10 years; NY: 6 years; CA: 7 years minimum'],
            ['Substance use disorder records', '42 CFR Part 2: no explicit minimum', '7 years after discharge or closure of record', 'Many states impose longer periods for SUD treatment records'],
            ['Inpatient hospital records', 'No federal minimum', '10 years from discharge', 'TX: 10 years; FL: 7 years; WA: 10 years'],
            ['Radiology / diagnostic imaging', 'No federal minimum', '5-7 years from date of study', 'CA: 7 years; NY: 6 years from date of study'],
            ['Mammography records', 'FDA/MQSA: 5 years from exam', '5 years minimum; 10 for females < 35', 'Apply stricter of state and MQSA minimum'],
            ['Immunization records', 'No federal minimum', 'Varies widely - 10 to permanent', 'Several states: permanent retention recommended'],
            ['Pathology and lab specimens', 'CLIA: 2 years for most records', '5-7 years for pathology reports', 'CA: 7 years; NY: indefinite for glass slides'],
            ['Billing records / claims', 'Medicare: 7 years', '7 years minimum', 'Apply Medicare standard as floor regardless of state'],
            ['Employee health records', 'OSHA: 30 years for exposure records', '5-30 years depending on type', 'OSHA 30-year rule governs occupational exposure records'],
            ['Authorization forms', '6 years per HIPAA § 164.530(j)', '6 years minimum', 'Retain even after expiration - proof that disclosure was authorized'],
          ]}
        />
      </Section>

      <Section title="State-specific retention rules - 10 key states">
        <Table
          headers={['State', 'Adult Records Min.', 'Minor Records Min.', 'Key Statute']}
          rows={[
            ['California', '7 years from last treatment', 'Until age 28 (or 7 years from last treatment, whichever is longer)', 'Health & Safety Code § 123111'],
            ['Texas', '10 years from last treatment', '7 years after 18th birthday', 'Tex. Health & Safety Code § 241.103'],
            ['New York', '6 years from last treatment', 'Until age 21 or 6 years from last treatment, whichever is longer', '10 NYCRR § 405.10'],
            ['Florida', '7 years from last treatment', 'Until age 18 + 4 years, or 7 years from last treatment, whichever is longer', 'Fla. Stat. § 456.057'],
            ['Illinois', '10 years from date of service', 'Until age 23 or 10 years from date of service, whichever is longer', '410 ILCS 50/3(a)'],
            ['Washington', '10 years from last treatment', 'Until age 21 or 10 years from last treatment, whichever is longer', 'WAC 246-08-400'],
            ['Colorado', '7 years from last treatment', 'Until age 28 or 7 years from last treatment, whichever is longer', '6 CCR 1011-1, Ch. 2'],
            ['Massachusetts', '7 years from last treatment', 'Until age 18 + 7 years, or 7 years from last treatment, whichever is longer', '243 CMR 2.07(13)'],
            ['Virginia', '5 years from last treatment', '5 years after age of majority (age 18)', 'Va. Code § 32.1-127.1:03'],
            ['New Jersey', '7 years from last treatment', 'Until age 23 or 7 years from last treatment, whichever is longer', 'N.J.A.C. 13:35-6.5'],
          ]}
        />
      </Section>

      <Section title="Secure destruction requirements">
        <Bullets
          items={[
            'Paper PHI: shred using a cross-cut shredder rated for PHI, or use a certified destruction vendor. Document destruction date, method, and vendor name.',
            'Electronic media (hard drives, USB, phones): physical destruction or NIST SP 800-88 compliant wiping. Document the media identifier, destruction method, and who performed it.',
            'Cloud-stored data: coordinate with the vendor - confirm deletion under BAA terms and retain vendor-issued destruction certification.',
            'Backup tapes and removable media: include in destruction schedule; document separately from active records.',
          ]}
        />
        <Callout label="Business associates">
          BAAs must specify the business associate's obligation to return or destroy PHI at termination. Obtain written
          certification of destruction. Retain that certification for 6 years under § 164.530(j).
        </Callout>
      </Section>

      <Section title="Retention tracking log">
        <Table
          headers={['Record Category', 'Retention Period', 'Destruction Date', 'Method', 'Authorized By']}
          rows={[
            ['Adult medical records', '', '', '', ''],
            ['Minor medical records', '', '', '', ''],
            ['HIPAA compliance docs', '6 years', '', '', ''],
            ['BAAs', '6 years post-termination', '', '', ''],
            ['Training records', '6 years', '', '', ''],
            ['Billing / claims', '7 years', '', '', ''],
            ['Lab / pathology reports', '', '', '', ''],
            ['Radiology images', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks retention schedules and destruction deadlines alongside your broader compliance calendar so
          nothing goes past its retention date unnoticed. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
