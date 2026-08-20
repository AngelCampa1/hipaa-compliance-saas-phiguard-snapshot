import { Bullets, Callout, P, PdfLayout, Section } from '../layout/PdfLayout.js'

export default function HipaaPrivacyPolicyTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Privacy Policy Template"
      subtitle="An internal privacy policy covering minimum necessary, access, disclosure, and patient rights under the Privacy Rule."
    >
      <Section title="Purpose and scope">
        <P>
          This policy establishes [Clinic Name]'s requirements for protecting the privacy of protected health
          information (PHI) in compliance with the HIPAA Privacy Rule (45 CFR Part 164, Subpart E). It applies
          to all workforce members who create, use, access, or disclose PHI in any format - paper, electronic,
          or verbal - in the course of their duties.
        </P>
        <Callout label="Policy review requirement">
          Under §164.530(i), covered entities must maintain written privacy policies and procedures and review
          and update them as needed in response to environmental or operational changes. Review this policy
          at least annually and document the review.
        </Callout>
      </Section>

      <Section title="Minimum necessary standard">
        <P>
          Under §164.502(b), workforce members must make reasonable efforts to limit uses and disclosures of,
          and requests for, PHI to the minimum necessary to accomplish the intended purpose. The following
          requirements apply:
        </P>
        <Bullets
          items={[
            'Access to PHI is limited to workforce members who need it for their job function.',
            'Workforce members may not access records of patients who are not part of their assigned patient panel without a documented clinical or operational reason.',
            'Verbal discussions about patient care should occur in private areas away from public waiting rooms and hallways.',
            'When disclosing PHI to another covered entity for treatment, disclose only the information reasonably necessary for the treatment purpose.',
            'When billing or processing claims, disclose only the PHI required by the payer.',
          ]}
        />
      </Section>

      <Section title="Uses and disclosures without authorization">
        <P>
          The clinic may use or disclose PHI without patient authorization for the following purposes, provided
          the use or disclosure is consistent with this policy and applicable regulatory requirements:
        </P>
        <Bullets
          items={[
            'Treatment: to provide, coordinate, or manage healthcare and related services.',
            'Payment: to obtain reimbursement for services, including billing, claims submission, and collections.',
            'Healthcare operations: for quality assessment, staff training, licensing, and operational planning.',
            'As required by law: mandatory reporting, judicial orders, law enforcement as permitted by §164.512.',
            'Public health activities: reporting communicable diseases, adverse events, and abuse under §164.512(b) and (c).',
          ]}
        />
      </Section>

      <Section title="Uses and disclosures requiring authorization">
        <P>
          All other uses and disclosures of PHI require a valid written authorization from the patient before
          the use or disclosure may occur. This includes marketing, sale of PHI, and psychotherapy notes.
          Workforce members must contact the Privacy Officer before making any disclosure not covered by the
          permitted uses and disclosures listed above.
        </P>
      </Section>

      <Section title="Patient rights">
        <Bullets
          items={[
            'Access and copy: Patients have the right to inspect and obtain copies of their PHI under §164.524. Requests must be addressed within 30 days (extendable by 30 more days with written notice).',
            'Amendment: Patients may request amendment of PHI under §164.526. The clinic must act on the request within 60 days.',
            'Accounting of disclosures: Patients may request an accounting of certain disclosures for the prior six years under §164.528.',
            'Restrictions: Patients may request restrictions on uses and disclosures under §164.522. Requests for restriction of disclosures to health plans for out-of-pocket payments must be honored.',
            'Confidential communications: Patients may request alternative communication methods or locations under §164.522(b).',
          ]}
        />
      </Section>

      <Section title="Workforce training requirements">
        <P>
          Under §164.530(b), all workforce members must be trained on the clinic's privacy policies and
          procedures. Training must occur:
        </P>
        <Bullets
          items={[
            'Within a reasonable period of time after the workforce member joins the organization.',
            'When a material change to policies or procedures affects the workforce member\'s job function.',
            'Annually as refresher training for all workforce members.',
          ]}
        />
        <P>
          Training completion must be documented with the workforce member's name, date, and training topic.
          Documentation must be retained for a minimum of six years.
        </P>
      </Section>

      <Section title="Sanctions for violations">
        <P>
          Under §164.530(e), the clinic must apply appropriate sanctions against workforce members who fail
          to comply with privacy policies and procedures. Sanctions shall be applied consistently, regardless
          of role or seniority, and may include:
        </P>
        <Bullets
          items={[
            'Verbal or written warning for first-time minor violations.',
            'Mandatory retraining and written corrective action plan.',
            'Suspension or demotion for serious or repeated violations.',
            'Termination for willful violations, particularly those involving impermissible disclosure of PHI.',
          ]}
        />
      </Section>

      <Section title="Privacy Officer responsibilities">
        <Bullets
          items={[
            'Serve as the designated privacy official responsible for developing and implementing policies under §164.530(a).',
            'Receive and process privacy complaints from patients and workforce members.',
            'Investigate and document privacy incidents and potential breaches.',
            'Oversee annual policy review and workforce training.',
            'Coordinate with the Security Officer on matters involving ePHI.',
          ]}
        />
      </Section>

      <Section title="Policy approval and revision history">
        <P>
          Policy owner: Privacy Officer
          Approved by: __________________________
          Effective date: __________________________
          Last reviewed: __________________________
          Next review due: __________________________
        </P>
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics track policy acknowledgements, schedule annual reviews, and document workforce
          training completion against specific policy versions. If privacy policy management still depends on
          calendar reminders and no one is tracking who read the latest version, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
