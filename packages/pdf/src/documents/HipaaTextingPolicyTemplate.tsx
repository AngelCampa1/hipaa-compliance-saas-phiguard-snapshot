import { Bullets, Callout, P, PdfLayout, Section } from '../layout/PdfLayout.js'

export default function HipaaTextingPolicyTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Secure Messaging & Texting Policy Template"
      subtitle="Adoption-ready policy aligned to 45 CFR § 164.312(e) transmission security."
    >
      <Section title="Purpose and Scope">
        <P>
          This policy governs the use of text messaging, secure messaging platforms, and any other electronic messaging channels by workforce members of [Clinic Name] for any communication that involves Protected Health Information (PHI). The clinic is a HIPAA covered entity, and all electronic transmissions of PHI are subject to the transmission security standard at 45 CFR § 164.312(e).
        </P>
        <P>
          The policy applies to staff-to-staff communication, staff-to-patient communication, and staff communication with business associates. It applies on every device - clinic-issued or BYOD - and from every location, inside or outside the clinic facility.
        </P>
        <Callout label="Why this matters">
          Standard SMS, iMessage, WhatsApp, and consumer messaging apps do not have a Business Associate Agreement covering PHI transmission. Routing PHI through those channels is a violation of this policy and may constitute a reportable incident under §§ 164.400-414.
        </Callout>
      </Section>

      <Section title="Approved Messaging Platforms">
        <P>
          The clinic has designated a single secure messaging platform for clinical and administrative communication that involves PHI. The approved platform is covered by a signed Business Associate Agreement (BAA), encrypts messages in transit and at rest, supports unique user authentication and audit logging, and integrates with the clinic\'s offboarding procedure for prompt access revocation.
        </P>
        <Bullets items={[
          'Approved secure messaging platform: [Vendor Name]. BAA signed and on file as of [Date].',
          'Approved EHR-internal messaging: [EHR Name] secure messages, where used for clinical communication tied to the patient record.',
          'Approved patient portal messaging: [Portal Name], for documented patient-clinic communication routed through the medical record.',
          'Approved email: [Email Provider] with BAA, where end-to-end encryption is enforced for any message containing PHI.',
        ]} />
        <P>
          No other messaging platform may be used for any communication that contains, references, or could allow re-identification of a patient.
        </P>
      </Section>

      <Section title="Prohibited Platforms and Channels">
        <P>
          The following platforms are prohibited for any communication that contains PHI. The prohibition applies regardless of how brief the message, how convenient the platform, or how minor the apparent disclosure.
        </P>
        <Bullets items={[
          'Standard SMS and MMS messaging on personal or clinic-issued phones for any content containing PHI beyond the limited appointment-reminder use case described later in this policy.',
          'Apple iMessage between any combination of staff or patients for any content containing PHI.',
          'WhatsApp, Signal, Telegram, Facebook Messenger, Instagram direct messages, and other consumer messaging apps.',
          'Personal email accounts (Gmail, Yahoo, iCloud, Outlook.com) for any communication containing PHI, in either direction.',
          'Group chats on any of the prohibited platforms, even if the content is intended to be de-identified.',
          'Voice memos, video, or photo attachments of patient-related content sent through any prohibited platform.',
        ]} />
      </Section>

      <Section title="Patient SMS Communication and Consent">
        <P>
          The clinic may communicate with patients by SMS for limited purposes when the patient has provided their phone number for that purpose and has been informed that SMS is not a fully secure channel. The communication must be limited to the content categories defined in the next section.
        </P>
        <Bullets items={[
          'Patient SMS consent is captured at intake or through the patient portal and recorded in the patient\'s record.',
          'The Notice of Privacy Practices discloses that the clinic uses SMS for appointment reminders and similar limited communications, and explains that SMS is not encrypted end-to-end.',
          'Patients may withdraw SMS consent at any time; withdrawal is honored within one business day and recorded.',
          'Patients who initiate clinical questions over SMS are redirected to the patient portal or a phone call; the clinic does not respond to clinical questions over SMS.',
          'A clinic phone number used for SMS is a clinic-controlled line, not a personal phone of any workforce member.',
        ]} />
      </Section>

      <Section title="Acceptable Content for SMS Appointment Reminders">
        <P>
          When the clinic sends an SMS appointment reminder, the content is limited to the minimum information necessary to identify the appointment. Specialty, diagnosis, treatment, and any sensitive condition information are excluded.
        </P>
        <Bullets items={[
          'Permitted: patient first name or initials, clinic name, appointment date, appointment time, clinic address or location identifier, and a phone number for rescheduling.',
          'Permitted: a generic instruction such as "Please arrive 15 minutes early" or "Bring your insurance card."',
          'Prohibited: specialty of the provider where specialty itself reveals a sensitive condition (e.g., "your oncology appointment").',
          'Prohibited: diagnosis, test name, test result, medication name, or any clinical detail.',
          'Prohibited: any reference that would allow a household member viewing the message to learn information the patient has not chosen to disclose.',
        ]} />
        <P>
          The same content limits apply to automated reminders sent by the EHR or a third-party reminder vendor; vendor configuration must be reviewed at least annually to confirm conformance.
        </P>
      </Section>

      <Section title="Staff-to-Staff PHI Messaging">
        <P>
          Internal coordination among workforce members frequently requires reference to a specific patient. That coordination must occur on the approved secure messaging platform or within the EHR\'s internal messaging.
        </P>
        <Bullets items={[
          'Staff-to-staff messages about a specific patient are sent on the approved secure messaging platform or within the EHR; never on SMS, iMessage, or any consumer app.',
          'The minimum-necessary standard applies: include only the information needed for the recipient to perform the task.',
          'Group chats on the approved platform are limited to workforce members with a legitimate need for the patient information; ad-hoc additions to a group chat are prohibited.',
          'Photos of patient-related content (lab printouts, wound photos, EKG strips) are taken only on clinic-issued devices, sent only through approved platforms, and never stored in personal camera rolls or personal cloud backups.',
          'Discussion of patients in any social or non-work-related group chat - even by initials, by room number, or by anonymized description - is prohibited.',
        ]} />
      </Section>

      <Section title="Retention and Medical Record Inclusion">
        <P>
          Secure messages that document clinical decision-making, patient communications, or care coordination are part of the designated record set under § 164.501 and must be retained accordingly.
        </P>
        <Bullets items={[
          'Secure messages with clinical content are exported or otherwise preserved into the EHR or designated record set per the clinic\'s records retention schedule.',
          'Messages on the approved platform are retained for the period defined in the clinic\'s retention schedule (minimum six years where required by § 164.530(j)(2)).',
          'Patient SMS appointment reminders that contain only scheduling information are retained per the vendor\'s default retention or the clinic\'s configured retention, whichever is shorter, and are not separately added to the medical record.',
          'On termination of a workforce member, that workforce member\'s access to the secure messaging platform is revoked the same day; message history remains in the platform under the clinic\'s account.',
        ]} />
      </Section>

      <Section title="Sanctions and Reporting">
        <P>
          Violations of this policy may result in disciplinary action up to and including termination, in accordance with the clinic\'s Sanctions Policy. Suspected unauthorized disclosure of PHI through a prohibited messaging channel must be reported to the Security Officer the same day it is discovered. The clinic will conduct a breach risk assessment under § 164.402 for every reported incident.
        </P>
      </Section>

      <Section title="Acknowledgment">
        <P>
          By signing below, the workforce member acknowledges receipt of this policy, has read and understands its requirements, and agrees to comply with each requirement as a condition of continued access to clinic communication systems and PHI.
        </P>
        <Bullets items={[
          'Workforce Member Name: ____________________',
          'Role: ____________________',
          'Approved Messaging Platforms Trained On: ____________________',
          'Signature: ____________________',
          'Date: ____________________',
          'Supervisor Signature: ____________________',
          'Security Officer Signature: ____________________',
        ]} />
      </Section>
    </PdfLayout>
  )
}
