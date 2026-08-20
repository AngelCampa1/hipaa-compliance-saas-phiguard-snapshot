import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaOffboardingChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA Offboarding Checklist"
      subtitle="A same-day termination checklist for removing ePHI system access, recovering devices, and documenting the full offboarding sequence."
    >
      <Section title="When to start this checklist">
        <Bullets
          items={[
            'Voluntary resignation: start on the last working day, ideally the same hour notice is confirmed',
            'Involuntary termination: start before the conversation, so access revocation happens simultaneously or immediately after',
            'Leave of absence (extended): partial offboarding - revoke EHR access, retain email with monitoring if operationally required',
          ]}
        />
      </Section>

      <Callout label="Same-day is the standard">
        OCR investigations frequently find access revocation delays after termination. A former employee who accesses
        records post-termination using old credentials is an unauthorized access breach - and the delay in revocation
        is an aggravating finding.
      </Callout>

      <Section title="Section 1: ePHI system access revocation">
        <Table
          headers={['System', 'Access Revoked (Y/N)', 'Time/Date', 'Completed by']}
          rows={[
            ['EHR / clinical records system', '', '', ''],
            ['Billing software / clearinghouse', '', '', ''],
            ['Patient portal admin access', '', '', ''],
            ['Secure messaging platform', '', '', ''],
            ['Cloud storage (clinic account)', '', '', ''],
            ['VPN / remote access', '', '', ''],
            ['Email account (disable or transfer)', '', '', ''],
            ['Shared service accounts (if any)', '', '', ''],
            ['Any other system with PHI access', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 2: Physical access">
        <Table
          headers={['Item', 'Returned / Revoked (Y/N)', 'Date', 'Completed by']}
          rows={[
            ['Office keys', '', '', ''],
            ['Key fob / building access card', '', '', ''],
            ['Alarm code (change if needed)', '', '', ''],
            ['Mailbox key', '', '', ''],
            ['Any PHI-containing physical records', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 3: Device return and wipe">
        <Table
          headers={['Device', 'Returned (Y/N)', 'Remote Wipe Issued (Y/N)', 'Data Confirmed Wiped (Y/N)']}
          rows={[
            ['Clinic-issued laptop', '', '', ''],
            ['Clinic-issued mobile device', '', '', ''],
            ['USB drives or external storage', '', '', ''],
            ['Any device used for patient communication', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 4: Email and forwarding">
        <Bullets
          items={[
            'Disable auto-forward from clinic email to personal email if previously set up',
            'Transfer or archive any open patient communication threads',
            'Set out-of-office message directing patients to the clinic main number',
            'Confirm email account is disabled or password changed within 24 hours',
          ]}
        />
      </Section>

      <Section title="Section 5: Exit interview and confidentiality reminder">
        <Table
          headers={['Item', 'Completed (Y/N)']}
          rows={[
            ['Exit interview conducted', ''],
            [
              'Ongoing confidentiality obligation explained (PHI accessed during employment remains protected)',
              '',
            ],
            ['Staff member confirms no PHI retained on personal devices or accounts', ''],
            ['Final HIPAA acknowledgement signed (see template below)', ''],
          ]}
        />
      </Section>

      <Section title="Final attestation language">
        <P>
          "I confirm that I have returned all clinic property, that I have not retained copies of any patient
          information, and that I understand my ongoing obligation to protect the confidentiality of any PHI I
          accessed during my employment. I understand that unauthorized use or disclosure of that information after my
          employment ends remains a violation of HIPAA and clinic policy."
        </P>
        <P>Former employee signature: __________________________ Date: __________</P>
        <P>Privacy Officer signature: __________________________ Date: __________</P>
      </Section>

      <Section title="Section 6: Completion sign-off">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Termination date', ''],
            ['Offboarding completed by', ''],
            ['All systems confirmed revoked', 'Y / N - exceptions noted:'],
            ['All devices returned or wiped', 'Y / N - exceptions noted:'],
            ['Final attestation on file', 'Y / N'],
            ['Logged in incident/access record', 'Y / N'],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard creates a same-day offboarding task the moment a termination is recorded, tracks each revocation
          step with a timestamp, and keeps the completed checklist in the compliance record. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
