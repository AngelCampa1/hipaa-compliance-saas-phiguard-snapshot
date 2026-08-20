import { Bullets, Callout, P, PdfLayout, Section, Subsection } from '../layout/PdfLayout.js'

export default function BaaTemplateDocument() {
  return (
    <PdfLayout
      title="Free BAA Template Pack"
      subtitle="A Business Associate Agreement your clinic can actually send - plus the pre-signing checklist most practices skip."
    >
      <Section title="What a Business Associate Agreement actually is">
        <P>
          A Business Associate Agreement, or BAA, is the written contract the HIPAA Privacy Rule requires between a
          covered entity and any vendor that creates, receives, maintains, or transmits protected health information on
          the clinic's behalf. The obligation sits in §164.502(e) and the substantive contract requirements are listed
          in §164.504(e). Without a signed BAA in place, every disclosure of PHI to that vendor is an impermissible
          disclosure - regardless of how careful the vendor is, regardless of whether a breach occurs.
        </P>
        <P>
          This template is drafted for a small medical clinic acting as a covered entity and signing a BAA with a
          downstream vendor (EHR, billing service, answering service, transcription, cloud storage, IT contractor, and
          so on). The clauses below are written to be enforceable, short, and easy to explain to a vendor who pushes
          back.
        </P>
      </Section>

      <Section title="When a BAA is required - and when it is not">
        <P>
          A BAA is required whenever a vendor will access PHI as part of delivering a service. It is not required for
          conduits that only transport PHI without storing or accessing its contents (for example, the U.S. Postal
          Service or an internet service provider). It is also not required for treatment disclosures between providers
          - those are permitted under §164.506.
        </P>
        <Callout label="Conduit exception is narrow">
          HHS has made clear the conduit exception applies only to entities that transport PHI transiently and do not
          have routine access to the content. Cloud storage vendors, EHR hosts, and email services that retain PHI do
          not qualify and do require a BAA.
        </Callout>
      </Section>

      <Section title="Template - Business Associate Agreement">
        <Subsection title="1. Parties and effective date">
          <P>
            This Business Associate Agreement ("Agreement") is entered into as of __________ ("Effective Date") by and
            between __________ ("Covered Entity") and __________ ("Business Associate"). Covered Entity and Business
            Associate may be referred to individually as a "Party" and collectively as the "Parties."
          </P>
        </Subsection>

        <Subsection title="2. Definitions">
          <P>
            Terms used but not otherwise defined in this Agreement shall have the meaning given in the HIPAA
            Administrative Simplification regulations at 45 C.F.R. Parts 160 and 164. For clarity:
          </P>
          <Bullets
            items={[
              '"PHI" means Protected Health Information as defined in §160.103, limited to PHI created, received, maintained, or transmitted by Business Associate on behalf of Covered Entity.',
              '"Security Incident" has the meaning given in §164.304.',
              '"Breach" has the meaning given in §164.402, including the four-factor low-probability-of-compromise (LOPC) analysis.',
              '"Subcontractor" has the meaning given in §164.103.',
              '"Required by Law" has the meaning given in §164.103.',
            ]}
          />
        </Subsection>

        <Subsection title="3. Permitted uses and disclosures">
          <P>
            Business Associate may use and disclose PHI only as permitted by this Agreement, as Required by Law, or as
            otherwise permitted or required by the HIPAA Rules. Business Associate may use PHI for the proper management
            and administration of Business Associate or to carry out its legal responsibilities, provided any disclosure
            of PHI for those purposes is either Required by Law or made subject to written assurances from the recipient
            that the PHI will be held confidentially, used only as required by law or for the purpose disclosed, and
            that any breach of confidentiality will be reported to Business Associate. These terms track §164.504(e)(2).
          </P>
          <P>
            Business Associate shall not use or disclose PHI in a manner that would violate Subpart E of Part 164 if
            done by Covered Entity, except that Business Associate may use and disclose PHI for the purposes described
            above.
          </P>
        </Subsection>

        <Subsection title="4. Safeguards">
          <P>
            Pursuant to §164.504(e)(2)(ii)(B), Business Associate shall implement administrative, physical, and
            technical safeguards that reasonably and appropriately protect the confidentiality, integrity, and
            availability of PHI. Safeguards shall, at a minimum, comply with Subpart C of Part 164 (the Security Rule)
            with respect to electronic PHI. Safeguards include encryption of PHI at rest and in transit in accordance
            with guidance issued by the Secretary under §13402(h)(2) of the HITECH Act.
          </P>
        </Subsection>

        <Subsection title="5. Subcontractor flow-down">
          <P>
            In accordance with §164.504(e)(2)(ii)(D) and §164.308(b)(2), Business Associate shall ensure that any
            Subcontractor that creates, receives, maintains, or transmits PHI on behalf of Business Associate agrees in
            writing to restrictions and conditions that are at least as stringent as those applicable to Business
            Associate under this Agreement. Business Associate shall provide Covered Entity with a current list of
            Subcontractors with access to PHI upon request.
          </P>
        </Subsection>

        <Subsection title="6. Reporting security incidents and breaches">
          <P>
            Business Associate shall report to Covered Entity any use or disclosure of PHI not permitted by this
            Agreement, any Security Incident of which it becomes aware, and any Breach of Unsecured PHI as defined in
            §164.402. Reports shall be made without unreasonable delay and in no case later than twenty-four (24) hours
            after discovery. The report shall include, to the extent available: a description of what happened; the
            types of PHI involved; identification of affected individuals; and the mitigation actions taken or planned.
          </P>
          <Callout label="Why 24 hours">
            Covered Entity must notify affected individuals within 60 days of discovery per §164.404. A tight BA-to-CE
            window is what makes that deadline feasible after the BA's internal triage.
          </Callout>
        </Subsection>

        <Subsection title="7. Individual rights">
          <P>
            Business Associate shall support Covered Entity in responding to requests by individuals regarding their
            PHI:
          </P>
          <Bullets
            items={[
              'Access to designated record sets under §164.524, within the timelines applicable to Covered Entity.',
              'Amendment of PHI under §164.526 and incorporation of approved amendments.',
              'Accounting of disclosures under §164.528, maintaining records sufficient to produce such accounting for six years.',
              'Restrictions on uses and disclosures under §164.522 to the extent Covered Entity has agreed to such a restriction.',
            ]}
          />
        </Subsection>

        <Subsection title="8. Termination and return or destruction of PHI">
          <P>
            This Agreement shall terminate upon termination of the underlying services agreement or upon written notice
            for material breach that remains uncured for thirty (30) days. Upon termination, Business Associate shall
            return or destroy all PHI and retain no copies, or, if return or destruction is infeasible, extend the
            protections of this Agreement to such PHI and limit further use and disclosure to those purposes that make
            return or destruction infeasible.
          </P>
        </Subsection>

        <Subsection title="9. Signatures">
          <P>Covered Entity: __________________________ Title: __________ Date: __________</P>
          <P>Business Associate: _____________________ Title: __________ Date: __________</P>
        </Subsection>
      </Section>

      <Section title="Common voidance mistakes">
        <Bullets
          items={[
            'Signing the vendor\'s BAA without reading section 3 - many include broad "data aggregation" or "de-identification for our own purposes" clauses that exceed permitted uses.',
            'Leaving the breach notification window silent or at "as soon as practicable" - you need an enforceable clock, not a feeling.',
            'Omitting the subcontractor flow-down clause, which became mandatory under the Omnibus Rule in 2013.',
            'Not listing who signs for the clinic - front desk staff have signed BAAs they had no authority to sign.',
            'Stale effective dates - a BAA signed in 2016 that predates the HITECH-era breach rules should be re-papered.',
          ]}
        />
      </Section>

      <Section title="Pre-signing checklist">
        <Bullets
          items={[
            'Confirm the vendor actually handles PHI and is not merely a conduit.',
            'Verify permitted uses match the service being delivered - no broader.',
            'Confirm encryption at rest and in transit is required in writing.',
            'Confirm the breach reporting clock is 24 to 48 hours, not "as soon as practicable."',
            'Confirm the subcontractor flow-down obligation is present.',
            'Confirm termination terms cover return or destruction of PHI with a specific timeline.',
            'Log the vendor, BAA effective date, and next review date in your vendor BAA tracker.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks every BAA your clinic signs, surfaces renewal dates before they lapse, and links each vendor
          to the PHI it touches. If you want this checklist built into your daily operations instead of living in a
          shared drive, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
