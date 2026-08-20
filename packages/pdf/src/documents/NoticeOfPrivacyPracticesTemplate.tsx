import { Bullets, Callout, P, PdfLayout, Section, Subsection } from '../layout/PdfLayout.js'

export default function NoticeOfPrivacyPracticesTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Notice of Privacy Practices Template"
      subtitle="An NPP template with the required content under 45 CFR 164.520 and plain-language patient-facing language."
    >
      <Section title="What the NPP requires">
        <P>
          The Privacy Rule requires covered healthcare providers to give patients a Notice of Privacy Practices that
          describes how the clinic uses and discloses PHI, explains patient rights, and states how patients can
          exercise those rights. The NPP must be provided at the first service delivery, posted in the facility,
          and made available on the clinic's website if one exists. §164.520 governs the content requirements.
        </P>
        <Callout label="When the NPP must be updated">
          Any material change to the clinic's privacy practices that affects the NPP requires a revised notice.
          The revised NPP must be posted and made available at the next patient contact. Keep a version log.
        </Callout>
      </Section>

      <Section title="Notice of Privacy Practices template">
        <Subsection title="Header">
          <P>
            NOTICE OF PRIVACY PRACTICES
            [Clinic Name] - [Address] - [Phone] - [Website]
            Effective Date: __________
            THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN
            GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.
          </P>
        </Subsection>

        <Subsection title="Our legal duty">
          <P>
            We are required by law to maintain the privacy of your protected health information (PHI), to provide
            you with notice of our legal duties and privacy practices, and to notify you following a breach of your
            unsecured PHI. We are required to follow the terms of this Notice while it is in effect. We reserve the
            right to change the terms of this Notice and to make the revised Notice effective for all PHI we maintain.
          </P>
        </Subsection>

        <Subsection title="How we may use and disclose your health information">
          <P>
            Treatment: We may use your PHI to provide, coordinate, and manage your healthcare and related services,
            including sharing information with other providers involved in your care.
          </P>
          <P>
            Payment: We may use or disclose your PHI to obtain payment for services provided to you, including
            billing, claims submission, and coverage verification.
          </P>
          <P>
            Healthcare operations: We may use or disclose your PHI in connection with our operational activities,
            including quality assessment, staff training, licensing, and business planning.
          </P>
          <P>
            Other permitted uses and disclosures: We may use or disclose your PHI as required by law; to public
            health authorities; to report abuse or neglect; for health oversight activities; for judicial proceedings;
            to law enforcement as permitted by law; to coroners, medical examiners, or funeral directors; for
            organ donation; for research with appropriate protections in place; to avert serious threats to health
            or safety; and for workers' compensation purposes.
          </P>
        </Subsection>

        <Subsection title="Uses and disclosures requiring your authorization">
          <P>
            Most uses of your PHI beyond treatment, payment, and operations require your written authorization.
            This includes: marketing communications, sale of your PHI, disclosure of psychotherapy notes, and
            most other uses not listed above. You may revoke an authorization at any time in writing.
          </P>
        </Subsection>

        <Subsection title="Your rights regarding your health information">
          <P>
            Right to inspect and copy: You have the right to inspect and obtain a copy of PHI that may be used
            to make decisions about your care. Submit your request in writing to our Privacy Officer.
          </P>
          <P>
            Right to amend: You have the right to request an amendment to PHI maintained in our records.
            We may deny the request under certain circumstances.
          </P>
          <P>
            Right to an accounting of disclosures: You have the right to request a list of certain disclosures
            of your PHI made in the six years prior to your request.
          </P>
          <P>
            Right to request restrictions: You have the right to request restrictions on uses and disclosures
            of your PHI. We are not required to agree to all requests, except for certain restrictions on
            disclosures to health plans where you pay out-of-pocket in full.
          </P>
          <P>
            Right to confidential communications: You have the right to request that we communicate with you
            about your healthcare in a specific way or at a specific location.
          </P>
          <P>
            Right to a paper copy of this Notice: You have the right to request a paper copy at any time.
          </P>
        </Subsection>

        <Subsection title="Complaints">
          <P>
            If you believe your privacy rights have been violated, you may file a complaint with our clinic or
            with the Secretary of the Department of Health and Human Services. We will not retaliate against you
            for filing a complaint.
            Privacy Officer: __________________________
            Email: __________________________
            HHS Office for Civil Rights: www.hhs.gov/ocr
          </P>
        </Subsection>

        <Subsection title="Contact information">
          <P>
            For questions about this Notice, contact:
            Privacy Officer: __________________________
            Address: __________________________
            Phone: __________________________
            Email: __________________________
          </P>
        </Subsection>
      </Section>

      <Section title="Patient acknowledgement">
        <P>
          I acknowledge that I have received and reviewed a copy of [Clinic Name]'s Notice of Privacy Practices.
        </P>
        <P>
          Patient signature: __________________________ Date: __________
          Patient name (print): __________________________
        </P>
        <P>
          If the patient is unable to sign or refuses to sign, document the reason:
          __________________________
        </P>
      </Section>

      <Section title="Distribution and documentation requirements">
        <Bullets
          items={[
            'Provide the NPP to every new patient at the first service delivery.',
            'Post the NPP in a clear and prominent location at the clinic.',
            'Post on the clinic website if one exists.',
            'Obtain and retain a written acknowledgement of receipt, or document why acknowledgement could not be obtained.',
            'Keep a version history with the effective date of each revision.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics track NPP acknowledgements, document distribution dates, and maintain the evidence
          that patients received and reviewed the notice. If NPP tracking still depends on paper sign-offs and
          periodic manual reconciliation, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
