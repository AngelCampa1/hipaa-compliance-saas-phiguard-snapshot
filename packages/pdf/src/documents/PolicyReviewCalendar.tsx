import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function PolicyReviewCalendarDocument() {
  return (
    <PdfLayout
      title="HIPAA Policy Review Calendar"
      subtitle="A 12-month calendar showing which policies review when, with owner assignments, attestation deadlines, and a pre-listed Security Rule administrative safeguard policy set."
    >
      <Section title="How to use this calendar">
        <Bullets
          items={[
            'Assign an owner for each policy at the start of the year - the owner is responsible for reviewing, updating, and getting the attestation signed',
            'Set a calendar reminder 30 days before each attestation deadline',
            'Update the \'Last reviewed\' date when the review is complete - do not backdate',
            'Retain all reviewed policy versions for 6 years per §164.530(j)',
          ]}
        />
      </Section>

      <Section title="Q1 - January through March: Privacy Rule policies">
        <Table
          headers={['Policy', 'Owner', 'Review month', 'Attestation deadline', 'Last reviewed']}
          rows={[
            ['Notice of Privacy Practices', '', 'January', 'January 31', ''],
            ['Minimum Necessary Policy', '', 'January', 'January 31', ''],
            ['Privacy Officer designation memo (confirm current)', '', 'January', 'January 15', ''],
            ['Patient rights policy (access, amendment, accounting)', '', 'February', 'February 28', ''],
            ['Use and disclosure policy', '', 'February', 'February 28', ''],
            ['Sanctions policy', '', 'March', 'March 31', ''],
          ]}
        />
      </Section>

      <Section title="Q2 - April through June: Security Rule policies (access and authentication)">
        <Table
          headers={['Policy', 'Owner', 'Review month', 'Attestation deadline', 'Last reviewed']}
          rows={[
            ['Access control policy (unique user IDs, minimum access)', '', 'April', 'April 30', ''],
            ['Automatic logoff policy', '', 'April', 'April 30', ''],
            ['Password and authentication policy', '', 'May', 'May 31', ''],
            ['Workforce security policy (access authorization, supervision)', '', 'May', 'May 31', ''],
            ['Security awareness and training policy', '', 'June', 'June 30', ''],
          ]}
        />
      </Section>

      <Section title="Q3 - July through September: Security Rule policies (devices and transmission)">
        <Table
          headers={['Policy', 'Owner', 'Review month', 'Attestation deadline', 'Last reviewed']}
          rows={[
            ['Workstation use and security policy', '', 'July', 'July 31', ''],
            ['Mobile device and BYOD policy', '', 'July', 'July 31', ''],
            ['Encryption and transmission security policy', '', 'August', 'August 31', ''],
            ['Physical access and facility security policy', '', 'August', 'August 31', ''],
            ['Audit control and log review policy', '', 'September', 'September 30', ''],
          ]}
        />
      </Section>

      <Section title="Q4 - October through December: Incident and contingency policies">
        <Table
          headers={['Policy', 'Owner', 'Review month', 'Attestation deadline', 'Last reviewed']}
          rows={[
            ['Incident response and breach notification policy', '', 'October', 'October 31', ''],
            ['Data backup and recovery policy', '', 'October', 'October 31', ''],
            ['Disaster recovery and emergency mode policy', '', 'November', 'November 30', ''],
            ['Business associate management policy', '', 'November', 'November 30', ''],
            ['HIPAA training policy (annual training requirements)', '', 'December', 'December 31', ''],
          ]}
        />
        <Callout label="Policies most clinics skip">
          Automatic logoff, Unique User ID enforcement, BYOD policy, and Sanction policy
          documentation are consistently identified in OCR enforcement actions as missing or undated.
          These are required - not optional - under 45 CFR §164.308 and §164.312.
        </Callout>
      </Section>

      <Section title="Policy attestation template">
        <Table
          headers={['Field', 'Detail']}
          rows={[
            ['Policy name', ''],
            ['Version', ''],
            ['Review date', ''],
            ['Reviewed by', ''],
            ['Changes made', 'Yes / No - describe if yes:'],
            ['Approved by (Privacy Officer)', ''],
            ['Next review date', ''],
            ['Signature', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard creates a policy review task for each policy on its scheduled month, tracks
          completion with timestamps, and stores signed attestations in the compliance record. See
          phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
