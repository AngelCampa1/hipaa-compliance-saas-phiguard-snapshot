import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaWorkforceSanctionsLogTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Workforce Sanctions Log Template"
      subtitle="Documented record of disciplinary actions for HIPAA violations - required under 45 CFR § 164.530(e)."
    >
      <Section title="Regulatory basis and purpose">
        <P>
          Under 45 CFR § 164.530(e), covered entities must have and apply appropriate sanctions against workforce
          members who fail to comply with the entity's privacy policies and procedures. The sanctions policy must be
          documented in writing, and sanctions actually applied must be documented as evidence of consistent
          enforcement.
        </P>
        <P>
          Use this log as the enforcement record. It documents the violation, the workforce member, the
          sanctions applied, approval chain, and closure of any corrective action. Retain this log for 6 years
          per § 164.530(j).
        </P>
        <Callout label="Consistency requirement">
          OCR's enforcement guidance emphasizes consistent application of the sanction policy. A policy that is
          never applied - or applied differently for different employees - undermines the entire compliance program.
          Use this log to demonstrate that sanctions are consistent, documented, and approved.
        </Callout>
      </Section>

      <Section title="Violation severity framework">
        <P>Use the three-tier framework below to classify violations before selecting sanctions. Document the tier in the log.</P>
        <Table
          headers={['Tier', 'Violation Type', 'Examples', 'Sanction Range']}
          rows={[
            ['Tier 1 - Low', 'Unintentional; policy exists; training adequate', 'Curiosity access immediately corrected; misfiled paper document; forgot to lock workstation', 'Written warning; required retraining; documentation in personnel file'],
            ['Tier 2 - Moderate', 'Negligent; repeated behavior; policy circumvented', 'Second offense curiosity access; shared login credential; misdirected fax with no remediation', 'Written warning; retraining; probation; suspension without pay'],
            ['Tier 3 - Severe', 'Intentional; malicious; personal gain; third offense', 'Selling PHI; accessing ex-patient records; forwarding records to unauthorized third party', 'Termination; referral for criminal review; mandatory HHS notification'],
          ]}
        />
      </Section>

      <Section title="Sanctions log - current year">
        <Table
          headers={['Date', 'Employee Name / Role', 'Violation Type', 'Tier', 'Description', 'Sanction Applied', 'Approved By', 'Retraining Completed', 'File Closed Date']}
          rows={[
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Per-incident documentation form">
        <P>Complete this form for each sanctioned violation and attach to the log entry. Retain with personnel file and compliance documentation.</P>
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Incident ID', ''],
            ['Date of violation (or discovery)', ''],
            ['Date sanction initiated', ''],
            ['Employee name', ''],
            ['Employee role / department', ''],
            ['Description of violation', ''],
            ['Regulatory provision affected (e.g., minimum necessary, access control)', ''],
            ['Violation tier (1 / 2 / 3)', ''],
            ['Evidence of violation (e.g., access log, witness account, patient complaint)', ''],
            ['Prior violations by this employee (reference incident IDs if applicable)', ''],
            ['Sanction applied', ''],
            ['Approved by (supervisor and Privacy Officer)', ''],
            ['Employee acknowledgement of sanction (date and signature)', ''],
            ['Retraining assigned (describe)', ''],
            ['Retraining completed date', ''],
            ['Corrective action (if applicable)', ''],
            ['Corrective action completion date', ''],
            ['Case status (open / closed)', ''],
            ['Referred to HR or legal?', ''],
            ['Notes', ''],
          ]}
        />
      </Section>

      <Section title="Sanction policy summary (include reference to your written policy)">
        <Bullets
          items={[
            'All workforce members are subject to the sanctions policy, including clinical staff, administrative staff, contractors, and volunteers.',
            'Violations are investigated by the Privacy Officer in coordination with HR. The Privacy Officer documents the investigation before any sanction is applied.',
            'The sanction is applied consistently - role, tenure, or seniority do not change the tier classification.',
            'Workforce members have the right to be informed of the specific violation alleged and the proposed sanction before the final sanction is applied.',
            'Sanctions records are retained for 6 years per 45 CFR § 164.530(j) and are maintained separately from general personnel files for compliance access.',
          ]}
        />
      </Section>

      <Section title="Annual log summary">
        <Table
          headers={['Year', 'Total Violations', 'Tier 1', 'Tier 2', 'Tier 3', 'Terminations', 'HHS Notifications']}
          rows={[
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks sanction events alongside incident records, keeping investigation notes, approval chains,
          and retraining evidence in one compliance record. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
