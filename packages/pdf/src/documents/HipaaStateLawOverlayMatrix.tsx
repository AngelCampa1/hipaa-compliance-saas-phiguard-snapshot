import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaStateLawOverlayMatrixDocument() {
  return (
    <PdfLayout
      title="HIPAA State-Law Overlay Matrix"
      subtitle="A side-by-side comparison of federal HIPAA requirements and state-specific rules in California, Texas, and New York across training, breach notification, patient access, and records retention."
    >
      <Section title="How to read this matrix">
        <P>
          Where state law is stricter than HIPAA (requires more or gives patients more rights), the state law applies.
          Where HIPAA is stricter, HIPAA applies. Covered entities operating in multiple states must satisfy the
          strictest applicable standard in each dimension.
        </P>
      </Section>

      <Section title="Training requirements">
        <Table
          headers={['Dimension', 'Federal HIPAA', 'California CMIA', 'Texas HB 300', 'New York SHIELD Act']}
          rows={[
            [
              'Required training',
              'All workforce members with PHI access (§164.308(a)(5))',
              'All employees with access to medical information',
              'Anyone with access to PHI - stricter than HIPAA',
              'All employees with access to private information',
            ],
            [
              'Training content',
              'Privacy and security policies, procedures, safeguards',
              'Confidentiality of medical information',
              'Privacy policy and consequences of violations',
              'Safeguard policies and procedures',
            ],
            [
              'Training timing',
              'At hire and when policies change; annual recommended',
              'At hire and when policies change',
              'At hire and when policies change',
              'Reasonable frequency - at hire recommended',
            ],
            [
              'Documentation required',
              'Yes - training records with dates',
              'Yes',
              'Yes - violations subject to civil penalties',
              'Reasonable administrative safeguards',
            ],
          ]}
        />
      </Section>

      <Section title="Breach notification">
        <Table
          headers={['Dimension', 'Federal HIPAA', 'California CMIA', 'Texas HB 300', 'New York SHIELD Act']}
          rows={[
            [
              'Trigger',
              'Impermissible use/disclosure of unsecured PHI with high risk of compromise',
              'Unauthorized access to medical information',
              'Unauthorized acquisition, access, use or disclosure of sensitive PHI',
              'Unauthorized access to or disclosure of private information',
            ],
            [
              'Notification timeline',
              '60 days from discovery',
              '5 business days from knowledge (urgent); 30 days otherwise',
              '60 days from discovery',
              'In the most expedient time possible; no specific deadline',
            ],
            [
              'Notification to state',
              'HHS OCR; media if 500+ in a state',
              'California AG if 500+ California residents affected',
              'Texas AG if breach affects 250+ Texas residents',
              'NY AG - required',
            ],
            [
              'Key difference',
              'Baseline federal standard',
              'Shorter timeline for urgent access breaches',
              'Broader scope of sensitive PHI types',
              'Broader \'private information\' definition includes financial data',
            ],
          ]}
        />
      </Section>

      <Section title="Patient access rights">
        <Table
          headers={['Dimension', 'Federal HIPAA', 'California CMIA', 'Texas HB 300', 'New York SHIELD Act']}
          rows={[
            [
              'Access to records',
              '30 days (extendable to 60 days) - §164.524',
              '5 business days for urgent access; 15 days otherwise',
              '15 business days after request',
              'HIPAA applies; no separate access right',
            ],
            [
              'Right to restrict disclosure',
              'Right to request restriction; covered entity can refuse',
              'Right to restrict - insurer cannot use for non-treatment purposes',
              'Right to restrict sensitive PHI disclosures',
              'HIPAA applies',
            ],
            [
              'Sensitive categories',
              'Psychotherapy notes, substance use (42 CFR Part 2)',
              'Mental health, substance use, HIV, abortion',
              'Mental health, substance use, HIV, genetic info, abuse',
              'No specific categories beyond HIPAA',
            ],
          ]}
        />
      </Section>

      <Section title="Records retention">
        <Table
          headers={['Dimension', 'Federal HIPAA', 'California CMIA', 'Texas HB 300', 'New York SHIELD Act']}
          rows={[
            [
              'PHI/ePHI retention',
              '6 years from creation or last effective date (policies and docs)',
              '10 years for minors after majority; 7 years for adults',
              '10 years - stricter than HIPAA',
              '3 years - HIPAA preempts this (6 years applies)',
            ],
            [
              'Key difference',
              '6-year baseline for compliance documents',
              'Minor records longer',
              'Texas requires 10 years - clinics must comply',
              'HIPAA 6-year rule applies',
            ],
          ]}
        />
      </Section>

      <Callout label="Texas HB 300 - stricter in practice">
        Texas HB 300 requires 10-year medical record retention and applies to any entity that "engages in the practice
        of assembling, collecting, analyzing, or distributing PHI." Courts have applied it broadly. Texas-based clinics
        should use 10 years as their records retention baseline.
      </Callout>

      <Section title="How to use this matrix for your clinic">
        <Bullets
          items={[
            'Identify which states your patients are in and which states you practice in',
            'For each dimension, apply the strictest standard across all applicable jurisdictions',
            'Document your retention and notification policies to reflect the stricter requirement',
            'Review annually - state laws change faster than HIPAA regulations',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard's policy review workflow includes state law overlay checkpoints for California, Texas, and New
          York. Multi-state practices can document their jurisdiction-specific obligations alongside their federal
          HIPAA program. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
