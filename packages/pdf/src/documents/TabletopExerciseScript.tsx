import { Bullets, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function TabletopExerciseScriptDocument() {
  return (
    <PdfLayout
      title="HIPAA Tabletop Exercise Script for Small Clinics"
      subtitle="Three incident scenarios with discussion guides, participant roles, and an after-action template."
    >
      <Section title="Before you start">
        <Bullets
          items={[
            'Block 90 minutes - 20 minutes per scenario, 30 minutes for after-action discussion',
            'Participants: Privacy Officer, office manager, at least one front desk staff member; add providers if available',
            'Ground rules: all responses are for training purposes, no actual regulatory reporting required, the goal is finding gaps not assigning blame',
            'Assign a note-taker to capture action items from the discussion',
          ]}
        />
      </Section>

      <Section title="Scenario 1: Lost device - unencrypted tablet">
        <P>
          A medical assistant realizes their clinic-issued iPad, which contains the EHR app and
          patient scheduling information, is missing. They last used it at home last night and
          believe it may have been left unlocked in their car.
        </P>
        <Table
          headers={['Discussion question', 'Key points to surface']}
          rows={[
            [
              'What is the first thing the clinic should do in the next 60 minutes?',
              'Remote wipe capability; EHR session invalidation; Privacy Officer notification',
            ],
            [
              'Is this a breach?',
              'Depends: is the device encrypted? Was the EHR session active? Can we confirm no one accessed it?',
            ],
            [
              'Who is responsible for notifying the Privacy Officer?',
              'Every workforce member - the reporting obligation is on anyone who discovers or suspects a PHI incident',
            ],
            [
              'What documentation is needed right now?',
              'Time of discovery, last known location, what PHI was accessible, device encryption status',
            ],
            [
              'What would change if the device was encrypted?',
              'Encrypted lost devices meet the safe harbor under §164.312(a)(2)(iv) - breach risk is significantly lower',
            ],
          ]}
        />
      </Section>

      <Section title="Scenario 2: Misdirected fax - clinical records">
        <P>
          A fax containing a patient's full clinical summary - including diagnosis, medications, and
          lab results - was sent to the wrong number. The receiving party is a dental office, not
          associated with your clinic. The dental office called and confirmed receipt.
        </P>
        <Table
          headers={['Discussion question', 'Key points to surface']}
          rows={[
            [
              "What do you do with the dental office's call?",
              'Request they return or destroy the fax; get written attestation; document the call and outcome',
            ],
            [
              'Is this a breach?',
              'Probably yes - unless 4-factor assessment shows low probability. The recipient saw the PHI (they called), which affects factor 3.',
            ],
            [
              'Does the fact that the recipient is another covered entity matter?',
              'Yes - it affects factor 2. Another covered entity with HIPAA obligations creates lower risk than a random member of the public.',
            ],
            [
              'What notification is required if this is a breach?',
              'Individual notification to the patient within 60 days; HHS logging if <500 affected',
            ],
            [
              'What policy would have prevented this?',
              'Fax verification protocols; confirmation call before sending clinical records; double-check fax numbers against verified contact list',
            ],
          ]}
        />
      </Section>

      <Section title="Scenario 3: Former employee access - EHR login after termination">
        <P>
          Your EHR audit log shows that a former employee - terminated three weeks ago - logged
          into the EHR twice in the past week and accessed five patient records. The employee's
          access should have been revoked on the day of termination.
        </P>
        <Table
          headers={['Discussion question', 'Key points to surface']}
          rows={[
            [
              'Why is this a breach (not just a security event)?',
              'An unauthorized access by a former employee with no legitimate purpose is an impermissible disclosure - and the access was confirmed (factor 3).',
            ],
            [
              'What documentation do you need immediately?',
              "EHR audit log export showing the access events, dates, records accessed, and the employee's credentials used",
            ],
            [
              'Who must be notified?',
              'Each patient whose records were accessed must be individually notified within 60 days',
            ],
            [
              'What went wrong in offboarding?',
              'Access revocation was not completed on the day of termination - this is the proximate cause',
            ],
            [
              'What policy change would prevent recurrence?',
              'Same-day termination access revocation protocol with documented confirmation; separation of duties so one person terminates and another confirms revocation',
            ],
          ]}
        />
      </Section>

      <Section title="After-action template">
        <Table
          headers={['Item', 'Notes']}
          rows={[
            ['Date of exercise', ''],
            ['Participants', ''],
            ['Scenarios completed', ''],
            ['Gaps identified (list)', ''],
            ['Action items (specific, assigned, dated)', ''],
            ['Policy changes triggered', ''],
            ['Next exercise date', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard logs tabletop exercises as compliance events, converts after-action items into
          assigned tasks, and keeps the exercise record in the audit trail alongside actual
          incidents. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
