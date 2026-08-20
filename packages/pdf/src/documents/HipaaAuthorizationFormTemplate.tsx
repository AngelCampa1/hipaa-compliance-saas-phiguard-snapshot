import { Bullets, Callout, P, PdfLayout, Section, Subsection } from '../layout/PdfLayout.js'

export default function HipaaAuthorizationFormTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Authorization Form Template"
      subtitle="A HIPAA-compliant authorization form with all required elements under 45 CFR 164.508 for use and disclosure of PHI."
    >
      <Section title="When this form is required">
        <P>
          A signed authorization is required before a covered entity may use or disclose PHI for purposes
          outside of treatment, payment, and healthcare operations. Common situations requiring a HIPAA
          authorization include: disclosure to a patient's attorney or employer, release to a life insurer,
          use in marketing communications, and disclosure of psychotherapy notes.
        </P>
        <Callout label="Psychotherapy notes exception">
          Authorizations for psychotherapy notes have stricter requirements and may not be combined with other
          authorizations except as permitted by §164.508(b)(3). Always use a separate authorization form when
          psychotherapy notes are involved.
        </Callout>
      </Section>

      <Section title="HIPAA Authorization Form">
        <Subsection title="Patient information">
          <P>
            Patient name: __________________________
            Date of birth: __________________________
            Address: __________________________
            Phone: __________________________
            Medical record number (if applicable): __________________________
          </P>
        </Subsection>

        <Subsection title="1. Description of information to be used or disclosed">
          <P>
            I authorize the following health information to be used or disclosed:
            ________________________________________________________________________________
            (Describe specifically - include dates of service, type of records, diagnosis or treatment, etc.)
            ☐ All medical records from __________ to __________
            ☐ Records related to: __________________________
            ☐ Psychotherapy notes (requires separate authorization process - contact Privacy Officer)
            ☐ Other: __________________________
          </P>
        </Subsection>

        <Subsection title="2. Person or organization authorized to use or disclose">
          <P>
            I authorize: ________________________________________________________________________________
            to use or disclose my health information as described above.
          </P>
        </Subsection>

        <Subsection title="3. Person or organization authorized to receive information">
          <P>
            I authorize the above to disclose my health information to:
            Name/Organization: __________________________
            Address: __________________________
            Phone: __________________________
            Relationship to patient: __________________________
          </P>
        </Subsection>

        <Subsection title="4. Purpose of the use or disclosure">
          <P>
            The purpose of this use or disclosure is:
            ________________________________________________________________________________
            ☐ At patient's request
            ☐ Continuing care with referred provider
            ☐ Legal or insurance purpose
            ☐ Other: __________________________
          </P>
        </Subsection>

        <Subsection title="5. Expiration of this authorization">
          <P>
            This authorization is valid until (select one):
            ☐ Date: __________________________
            ☐ Event: __________________________
            ☐ One year from the date of this signature
          </P>
        </Subsection>

        <Subsection title="6. Your rights regarding this authorization">
          <P>
            Right to revoke: You may revoke this authorization at any time by submitting a written request
            to our Privacy Officer. Your revocation will not affect uses or disclosures made before we
            received your written revocation.
          </P>
          <P>
            Conditioned care: We will not condition your treatment or enrollment on signing this authorization,
            except as permitted under §164.508(b)(4).
          </P>
          <P>
            Re-disclosure risk: Once your health information has been disclosed to the person or organization
            named above, it may no longer be protected by federal privacy law and could be re-disclosed.
          </P>
        </Subsection>

        <Subsection title="7. Signature">
          <P>
            Patient or authorized representative signature: __________________________
            Date: __________
          </P>
          <P>
            If signed by a personal representative:
            Representative name (print): __________________________
            Authority (e.g., parent, legal guardian, power of attorney): __________________________
            Documentation on file: ☐ Yes ☐ No
          </P>
        </Subsection>
      </Section>

      <Section title="For clinic use - documentation log">
        <P>
          Authorization received by: __________________________
          Date received: __________
          Records released: ☐ Yes ☐ No ☐ Pending
          Date released: __________
          Released by: __________________________
          Method of release: ☐ Mail ☐ Fax ☐ Secure portal ☐ In person
        </P>
      </Section>

      <Section title="Invalid authorization - common errors">
        <Bullets
          items={[
            'Missing expiration date or event.',
            'PHI description too vague to identify specific records.',
            'Omitting the re-disclosure warning statement.',
            'Combining psychotherapy notes authorization with other records without following §164.508(b)(3)(ii).',
            'Conditioning treatment on the authorization when the condition is not permitted by §164.508(b)(4).',
            'Obtaining a pre-filled authorization that does not allow the patient to read required statements before signing.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics track authorization status, flag expiring authorizations, and document the
          release chain with an attached audit trail. If authorization tracking still depends on a folder of
          signed forms with no systematic review, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
