import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function HipaaEmployeeAcknowledgementTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Employee Acknowledgement Template"
      subtitle="A workforce acknowledgement form documenting staff receipt of HIPAA training, policies, and notice of sanctions."
    >
      <Section title="Why documented acknowledgements matter">
        <P>
          Under §164.530(b), covered entities must train all workforce members on privacy policies and procedures
          within a reasonable time after joining and when material changes occur. Under §164.530(e), the sanctions
          policy must be applied consistently. Signed acknowledgements provide the documentation that training
          occurred, that the workforce member understood the sanction policy, and that the obligations were
          communicated before PHI access was granted.
        </P>
        <Callout label="Key compliance function">
          If a workforce member causes a breach and training documentation cannot be produced, OCR treats
          the missing documentation as an aggravating factor - not a mitigating one. The acknowledgement
          form is evidence, not paperwork.
        </Callout>
      </Section>

      <Section title="HIPAA Workforce Acknowledgement Form">
        <Subsection title="Employee information">
          <P>
            Full name: __________________________
            Job title: __________________________
            Department: __________________________
            Start date: __________________________
            Date of acknowledgement: __________________________
          </P>
        </Subsection>

        <Subsection title="Section 1 - Privacy and security training acknowledgement">
          <P>
            I acknowledge that I have received and completed training on [Clinic Name]'s HIPAA Privacy and
            Security policies and procedures, including:
          </P>
          <Bullets
            items={[
              'The HIPAA Privacy Rule and minimum necessary standard',
              'The HIPAA Security Rule and my role in protecting ePHI',
              'The clinic\'s policies for accessing, using, and disclosing PHI',
              'Patient rights under HIPAA, including the right of access and right to amend',
              'How to identify and report a potential privacy or security incident',
              'Consequences of HIPAA violations',
            ]}
          />
          <P>I understand that I am required to complete refresher training annually and whenever policies change.</P>
        </Subsection>

        <Subsection title="Section 2 - Confidentiality obligations">
          <P>
            I understand that in the course of my employment, I may have access to protected health information
            (PHI) about patients and that I have an obligation to protect the confidentiality of that information.
            I agree to:
          </P>
          <Bullets
            items={[
              'Access only the PHI that is necessary for me to perform my job duties.',
              'Not share PHI with coworkers, family members, or any other person unless required by my job function.',
              'Not use PHI for personal purposes.',
              'Not remove PHI from clinic premises without authorization.',
              'Report any suspected violation or security incident to the Privacy Officer immediately.',
            ]}
          />
          <P>
            I understand that my confidentiality obligations continue after my employment ends and that I must
            return or destroy any PHI in my possession upon termination.
          </P>
        </Subsection>

        <Subsection title="Section 3 - Sanctions policy acknowledgement">
          <P>
            I acknowledge that I have been informed of [Clinic Name]'s sanctions policy for HIPAA violations.
            I understand that violations of HIPAA policies and procedures may result in corrective action up
            to and including termination of employment, regardless of my role or seniority. I understand that
            sanctions are applied consistently and that willful violations may be referred to law enforcement
            or regulatory authorities.
          </P>
        </Subsection>

        <Subsection title="Section 4 - System access acknowledgement">
          <P>
            I acknowledge that my access to clinic systems containing ePHI is subject to audit logging and
            that my activity in those systems may be reviewed. I agree to use only my assigned credentials
            and to log out of ePHI systems when not in use. I will not share my login credentials with any
            other person.
          </P>
        </Subsection>

        <Subsection title="Signature">
          <P>
            Employee signature: __________________________ Date: __________
            Employee name (print): __________________________
          </P>
          <P>
            Supervisor/HR signature: __________________________ Date: __________
            Supervisor name (print): __________________________
          </P>
        </Subsection>
      </Section>

      <Section title="Training log - for clinic records">
        <Table
          headers={['Training topic', 'Date completed', 'Trainer/system', 'Verified by']}
          rows={[
            ['Initial HIPAA Privacy orientation', '', '', ''],
            ['Initial HIPAA Security orientation', '', '', ''],
            ['Annual Privacy refresher', '', '', ''],
            ['Annual Security refresher', '', '', ''],
            ['Policy change training (describe below)', '', '', ''],
          ]}
        />
        <P>Policy change or additional training description: __________________________</P>
      </Section>

      <Section title="Record retention">
        <Bullets
          items={[
            'Retain signed acknowledgements for a minimum of six years from the date of creation or last effective date, whichever is later.',
            'Store in a secure location accessible to the Privacy Officer and HR.',
            'Maintain a log of all workforce members and their acknowledgement dates.',
            'Upon termination, retain the acknowledgement in the former employee\'s file for the required retention period.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks training completion and policy acknowledgements per staff member with timestamps,
          so the evidence is ready when an auditor asks who completed what and when. If acknowledgement
          management still lives in email confirmations or a folder of paper forms, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
