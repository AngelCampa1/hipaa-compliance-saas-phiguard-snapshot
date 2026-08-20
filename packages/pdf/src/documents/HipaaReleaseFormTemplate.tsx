import { Bullets, Callout, P, PdfLayout, Section, Subsection } from '../layout/PdfLayout.js'

export default function HipaaReleaseFormTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Authorization and Release Form Template"
      subtitle="A customizable authorization form that meets the required elements under 45 CFR 164.508 for use and disclosure of PHI."
    >
      <Section title="What this form is and when to use it">
        <P>
          A HIPAA authorization is the patient's written permission for a covered entity to use or disclose PHI for
          purposes beyond treatment, payment, and healthcare operations. §164.508 governs when authorizations are
          required, what they must contain, and what makes them invalid. This template provides the required elements so
          that any authorization your clinic collects is valid from the first signature.
        </P>
        <Callout label="Core use cases">
          Authorizations are required for: marketing communications, disclosure to life insurers, sale of PHI,
          psychotherapy notes disclosures, and any use or disclosure that does not fall within treatment, payment,
          or operations.
        </Callout>
      </Section>

      <Section title="Required elements under §164.508(c)">
        <P>
          An authorization must contain all of the following elements to be valid. An authorization that omits any
          required element is defective and does not permit the use or disclosure.
        </P>
        <Bullets
          items={[
            'A description of the PHI to be used or disclosed in specific enough terms that the patient can identify what is covered.',
            'The name or class of persons authorized to make the requested use or disclosure.',
            'The name or class of persons to whom the covered entity may make the disclosure.',
            'A description of each purpose of the requested use or disclosure.',
            'An expiration date or expiration event after which the authorization is no longer valid.',
            'The individual\'s signature and the date of the signature.',
            'If signed by a personal representative, a description of the representative\'s authority.',
          ]}
        />
      </Section>

      <Section title="Required statements under §164.508(c)(2)">
        <P>
          In addition to the core elements above, every authorization must include the following three statements.
          These must appear in plain language and must be legible and prominent.
        </P>
        <Bullets
          items={[
            'The individual\'s right to revoke the authorization in writing, along with the exceptions to that right or how to revoke.',
            'A statement of whether treatment, payment, enrollment, or eligibility is conditioned on the authorization - and if so, the consequences of refusing to sign.',
            'A statement that PHI disclosed pursuant to the authorization may be re-disclosed by the recipient and may no longer be protected by HIPAA.',
          ]}
        />
      </Section>

      <Section title="Authorization template">
        <Subsection title="Header">
          <P>
            AUTHORIZATION FOR USE OR DISCLOSURE OF PROTECTED HEALTH INFORMATION
            [Clinic Name] - [Clinic Address] - [Phone]
          </P>
        </Subsection>

        <Subsection title="Patient information">
          <P>
            Patient name: ________________________________
            Date of birth: ________________________________
            Medical record number (if applicable): ________________________________
          </P>
        </Subsection>

        <Subsection title="Section 1 - Description of PHI">
          <P>
            I authorize the use or disclosure of the following protected health information:
            ________________________________________________________________________________
            (Describe the records, dates, or type of information - e.g., "all medical records from January 1 through
            December 31, 2024" or "records related to diagnosis of ____________________")
          </P>
        </Subsection>

        <Subsection title="Section 2 - Who is authorized to disclose">
          <P>
            I authorize the following person or organization to use or disclose my health information:
            ________________________________________________________________________________
          </P>
        </Subsection>

        <Subsection title="Section 3 - Who may receive the information">
          <P>
            I authorize the above to disclose my health information to:
            ________________________________________________________________________________
          </P>
        </Subsection>

        <Subsection title="Section 4 - Purpose">
          <P>
            The purpose of this use or disclosure is:
            ________________________________________________________________________________
            (If the purpose is at the patient's request, you may state "at the request of the individual.")
          </P>
        </Subsection>

        <Subsection title="Section 5 - Expiration">
          <P>
            This authorization expires on: ________________ (date)
            OR upon the following event: ________________
          </P>
        </Subsection>

        <Subsection title="Section 6 - Required statements">
          <P>
            Right to revoke: You may revoke this authorization at any time by submitting a written request to
            [Clinic Name] at the address above. Revocation takes effect upon receipt. Your revocation will not affect
            any uses or disclosures that were made in reliance on this authorization before we received your revocation.
          </P>
          <P>
            Conditioned treatment: [CHECK ONE]
            ☐ We will not condition your treatment on whether you sign this authorization.
            ☐ This authorization is a condition of receiving the following service: ________________
          </P>
          <P>
            Re-disclosure notice: Once we disclose your health information to the person or organization named
            above, that information may be re-disclosed by the recipient and may no longer be protected by federal
            privacy law.
          </P>
        </Subsection>

        <Subsection title="Section 7 - Signature">
          <P>
            Patient signature: __________________________ Date: __________
            OR
            Personal representative signature: __________________________ Date: __________
            Representative's name (print): __________________________
            Relationship to patient: __________________________
            Authority (attach supporting documentation if required): __________________________
          </P>
        </Subsection>
      </Section>

      <Section title="Common errors that invalidate authorizations">
        <Bullets
          items={[
            'Leaving the expiration date or event blank.',
            'Using vague PHI descriptions such as "all records" without a date range when records span multiple episodes.',
            'Omitting the re-disclosure warning statement.',
            'Obtaining the signature before explaining the right to revoke.',
            'Using a combined consent-and-authorization form without clearly delineating the two.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics track authorization status, flag approaching expiration dates, and document exceptions
          with an attached audit trail. If authorization management still depends on paper folders or a shared drive
          with no systematic review, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
