import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function TelehealthComplianceWorkflowChecklistDocument() {
  return (
    <PdfLayout
      title="Telehealth Compliance Workflow Checklist"
      subtitle="A pre-session setup guide, platform BAA checklist, recording policy, cross-state issues, and a quarterly review template."
    >
      <Section title="Post-PHE context">
        <P>
          HHS enforcement discretion for telehealth ended in May 2023. Consumer video platforms
          (FaceTime, Zoom without BAA, Google Meet without BAA) are no longer covered by enforcement
          discretion. Covered entities must use a BAA-covered telehealth platform for all patient
          video encounters.
        </P>
        <Callout label="Enforcement discretion ended May 2023">
          The PHE-era policy allowing non-HIPAA-covered video platforms for telehealth visits
          expired. Operating without a BAA-covered platform is now a HIPAA Privacy and Security Rule
          violation.
        </Callout>
      </Section>

      <Section title="Section 1: Platform BAA verification">
        <Table
          headers={['Question', 'Confirmed (Y/N)']}
          rows={[
            ['Telehealth platform has a signed BAA with the clinic', ''],
            ['BAA covers video sessions, recordings (if used), and messaging', ''],
            ['Platform is on a business/enterprise tier that qualifies for BAA coverage', ''],
            ['BAA expiration date is tracked and renewal is scheduled', ''],
            ['Any AI features in the platform (transcription, summaries) are covered by the BAA', ''],
          ]}
        />
      </Section>

      <Section title="Section 2: Pre-session provider checklist">
        <Bullets
          items={[
            'Use a dedicated workspace with a closed door - no visible PHI in the camera frame',
            'Use clinic-issued or approved device - no personal devices unless covered by written BYOD policy',
            'Use a secure internet connection - no public Wi-Fi without VPN',
            'Confirm the patient\'s identity at the start of each session (name, date of birth)',
            'Log into the session through the BAA-covered platform - not a personal video account',
            'Confirm the patient is in a private space and able to speak freely before beginning',
          ]}
        />
      </Section>

      <Section title="Section 3: Patient consent documentation">
        <Table
          headers={['Item', 'Confirmed (Y/N)']}
          rows={[
            ['Patient has signed telehealth consent form (required in most states)', ''],
            ['Consent documents state the technology being used', ''],
            ['Consent is retained in the patient record', ''],
            ['Consent is re-obtained if the platform changes', ''],
          ]}
        />
      </Section>

      <Section title="Section 4: Recording policy">
        <Bullets
          items={[
            'Obtain explicit patient consent before recording any telehealth session - verbal consent on recording is not sufficient in most states',
            'Store recordings only on the BAA-covered platform or a BAA-covered cloud storage service - never personal device storage',
            'Define a retention period for recordings consistent with your records retention policy',
            'Document who can access recordings and under what circumstances',
            'Never share recordings through non-secure channels (email, personal Dropbox, text)',
          ]}
        />
      </Section>

      <Section title="Section 5: Cross-state telehealth issues">
        <Table
          headers={['Issue', 'What it means']}
          rows={[
            [
              'Licensure',
              'Provider must be licensed in the state where the patient is physically located at the time of the visit - not where the clinic is located',
            ],
            [
              'State-specific telehealth consent laws',
              'Some states require written consent; others require audio-visual capability; others specify disclosure requirements - verify for each patient\'s state',
            ],
            [
              'State breach notification laws',
              'If a telehealth session involving a patient\'s PHI is compromised, breach notification may require compliance with the patient\'s state law (e.g., TX HB 300 for Texas patients)',
            ],
            [
              'Prescribing rules',
              'Controlled substance prescribing via telehealth has specific DEA and state-level rules - verify for each state before prescribing',
            ],
          ]}
        />
      </Section>

      <Section title="Section 6: Incident reporting for telehealth">
        <Bullets
          items={[
            'Session interrupted by technical failure: log as operational event, not a PHI incident, unless PHI was exposed',
            'Wrong patient joined the session: log as security event, complete 4-factor assessment',
            'Recording accidentally shared with wrong party: log as security event, initiate breach assessment',
            'Provider used non-BAA platform: log as security event, initiate breach assessment for PHI disclosed in session',
          ]}
        />
      </Section>

      <Section title="Section 7: Quarterly review">
        <Table
          headers={['Item', 'Reviewed (Y/N)', 'Date', 'Notes']}
          rows={[
            ['BAA for telehealth platform still current', '', '', ''],
            ['Platform still on a BAA-eligible plan tier', '', '', ''],
            ['Recording storage location still BAA-covered', '', '', ''],
            ['New AI features added to platform - assessed for BAA coverage', '', '', ''],
            ['Cross-state patient list reviewed for state-specific requirements', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks the telehealth platform BAA renewal date and triggers a review task when
          the renewal window opens. Telehealth incidents log through the same incident management
          module as in-person events. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
