import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaSocialMediaPolicyTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Social Media Policy Template"
      subtitle="A one-page policy for clinic staff covering PHI prohibitions, patient photo consent, comment response rules, and enforcement."
    >
      <Section title="Policy scope">
        <P>
          This policy applies to all workforce members - clinical staff, administrative staff, billing, contractors, and
          volunteers - who use any social media platform for any work-related purpose or who may encounter patient
          information in the course of their work.
        </P>
        <P>
          Covered platforms include but are not limited to: Facebook, Instagram, X (formerly Twitter), TikTok,
          LinkedIn, YouTube, Snapchat, Threads, and any other platform where content can be publicly or semi-publicly
          posted.
        </P>
      </Section>

      <Callout label="PHI prohibition - no exceptions">
        No workforce member may post, share, or reference any patient name, photo, condition, treatment, date of
        service, provider name, or any other information that could identify a patient - on any social media platform,
        under any circumstances, without a valid written HIPAA Authorization signed by the patient.
      </Callout>

      <Section title="Section 1: Prohibited content">
        <Bullets
          items={[
            'Patient names, initials, or any identifier tied to a health condition or visit',
            'Before/after clinical photos, even if the patient verbally agreed - written authorization is required',
            'Case descriptions, even when the condition seems common or the patient seems unidentifiable',
            'Screenshots of EHR screens, patient messages, or any clinical document',
            'Complaints or praise about a specific patient or patient family',
            'Information about a patient encounter shared in a private group, DM, or story',
          ]}
        />
      </Section>

      <Section title="Section 2: Patient photo and before/after content">
        <P>
          Before any patient image or before/after content may be posted, the clinic must obtain a signed HIPAA
          Authorization that specifically describes:
        </P>
        <Bullets
          items={[
            'The exact images or content to be shared',
            'The specific platform(s) where the content will appear',
            'The purpose of the disclosure (e.g., marketing, patient education)',
            'An expiration date or event',
          ]}
        />
        <P>
          Verbal consent is not sufficient. A signed Authorization must be on file before any content is posted.
          Retain Authorizations for six years per 45 CFR §164.530(j).
        </P>
      </Section>

      <Section title="Section 3: Responding to patient comments">
        <P>
          Patients sometimes post about their care experience on the clinic's public pages or tag the clinic in posts.
          The following rules apply to all staff with posting access:
        </P>
        <Bullets
          items={[
            'Never confirm or deny that a person is a patient of the clinic',
            'Never discuss any aspect of care, treatment, or scheduling in a public reply',
            'Acknowledge the comment publicly with a neutral response directing the patient to contact the clinic by phone or email',
            'Route all substantive patient concerns to the designated Privacy Officer or practice administrator',
            'Approved response template: "Thank you for reaching out. Please contact us directly at [phone/email] so we can assist you."',
          ]}
        />
      </Section>

      <Section title="Section 4: Account access controls">
        <Table
          headers={['Platform', 'Authorized Poster(s)', 'Admin Access', 'Password Updated Last']}
          rows={[
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
          ]}
        />
        <P>
          Posting access is limited to designated staff approved by the practice administrator. Access must be reviewed
          and updated when a staff member with posting access is terminated.
        </P>
      </Section>

      <Section title="Section 5: Enforcement and sanctions">
        <P>
          Violations of this policy are subject to the clinic's workforce sanction policy under 45 CFR §164.530(e).
          Depending on severity, sanctions range from documented counseling to termination and, where applicable,
          referral to relevant licensing boards or law enforcement.
        </P>
        <P>
          A confirmed or suspected violation must be reported to the Privacy Officer immediately. The Privacy Officer
          will determine whether the disclosure constitutes a HIPAA breach requiring notification under 45 CFR §164.400.
        </P>
      </Section>

      <Section title="Policy acknowledgement">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Policy effective date', ''],
            ['Reviewed by', ''],
            ['Staff member name', ''],
            ['Staff member role', ''],
            ['Date acknowledged', ''],
            ['Signature', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks policy acknowledgements per staff member with timestamps and schedules annual re-acknowledgement
          as part of the clinic's workforce training cycle. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
