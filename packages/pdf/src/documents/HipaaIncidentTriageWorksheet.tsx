import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaIncidentTriageWorksheetDocument() {
  return (
    <PdfLayout
      title="HIPAA Incident Triage Worksheet"
      subtitle="A structured intake form, 4-factor breach risk assessment, and escalation decision tree for PHI incidents."
    >
      <Section title="Part 1: Initial incident intake">
        <Table
          headers={['Field', 'Details']}
          rows={[
            ['Date of incident', ''],
            ['Date reported to Privacy Officer', ''],
            ['Reported by (name and role)', ''],
            ['Description of what happened', ''],
            ['Systems or platforms involved', ''],
            ['PHI types involved', ''],
            ['Number of individuals affected (estimated)', ''],
            ['Initial classification', 'Near-miss / Security event / Unknown'],
          ]}
        />
      </Section>

      <Section title="Step 1: Was PHI actually accessed or disclosed?">
        <Bullets
          items={[
            'If NO: This is a near-miss. Log it in the incident log with notation "Near-miss - no PHI accessed or disclosed." No 4-factor assessment required. Stop here.',
            'If YES or UNKNOWN: Proceed to Part 2 - 4-factor breach risk assessment.',
          ]}
        />
      </Section>

      <Callout label="Presumption of breach">
        Under 45 CFR §164.402, any impermissible use or disclosure of unsecured PHI is presumed to be a breach unless
        the covered entity can demonstrate low probability of compromise through the 4-factor assessment.
      </Callout>

      <Section title="Part 2: 4-factor breach risk assessment">
        <P>
          Complete one row per factor. The overall assessment requires low probability of compromise on all four
          factors to support a non-breach determination.
        </P>
        <Table
          headers={['Factor', 'Questions to answer', 'Your findings', 'Risk level (High/Med/Low)']}
          rows={[
            [
              '1. Nature and extent of PHI',
              'What types of PHI were involved? Were clinical details, financial data, or sensitive categories (mental health, substance use, HIV) included? More sensitive and complete PHI = higher risk.',
              '',
              '',
            ],
            [
              '2. The unauthorized recipient',
              'Who received the PHI? A random member of the public creates higher risk than another covered entity. Was the recipient identified? Did they acknowledge receipt?',
              '',
              '',
            ],
            [
              '3. Whether PHI was acquired or viewed',
              'Is there evidence the PHI was actually accessed or viewed? Was it contained in a sealed envelope returned intact? Was it in an email that bounced unread?',
              '',
              '',
            ],
            [
              '4. Extent of risk mitigation',
              'Were steps taken to reduce the risk? Did the recipient cooperate, return or destroy the PHI, and provide written attestation? Was the exposure window short?',
              '',
              '',
            ],
          ]}
        />
      </Section>

      <Section title="Overall assessment">
        <Table
          headers={['Finding', 'Action required']}
          rows={[
            [
              'All 4 factors support LOW probability of compromise',
              'Document as security event (non-breach). Retain documentation. No notification required.',
            ],
            [
              'Any factor supports HIGH probability of compromise',
              'This is a breach. Proceed to breach notification obligations.',
            ],
            [
              'Insufficient information to assess one or more factors',
              'Treat as breach until additional information supports non-breach determination.',
            ],
          ]}
        />
      </Section>

      <Section title="Part 3: Escalation decision tree">
        <Bullets
          items={[
            'Near-miss: Log in incident log. No assessment, no notification. Mark: Near-miss.',
            'Security event (4-factor = low risk): Complete written 4-factor assessment. File documentation. Log as security event. Mark: Non-breach determination.',
            'Breach (4-factor = high risk or unknown): Initiate breach notification. Individual notification within 60 days. HHS notification: within 60 days if 500+ affected; annual log if <500. Media notification if 500+ in a single state.',
          ]}
        />
      </Section>

      <Section title="Part 4: Evidence log">
        <Table
          headers={['Item', 'Collected (Y/N)', 'Location']}
          rows={[
            ['Incident report or original notification', '', ''],
            ['4-factor assessment worksheet (this form)', '', ''],
            ['Communication with unauthorized recipient (emails, attestations)', '', ''],
            ['Audit log export from affected system', '', ''],
            ['Written non-breach determination memo (if applicable)', '', ''],
            ['Breach notification letters sent to individuals (if applicable)', '', ''],
            ['HHS breach notification portal confirmation (if applicable)', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard guides the Privacy Officer through this triage workflow at intake, prompts the 4-factor assessment
          for any security event, and keeps the evidence log attached to the incident record. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
