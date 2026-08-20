import { Bullets, Callout, P, PdfLayout, Section, Subsection } from '../layout/PdfLayout.js'

export default function HipaaBaaTemplateClinicDocument() {
  return (
    <PdfLayout
      title="HIPAA BAA Template for Small Clinics"
      subtitle="A clinic-ready business associate agreement template with the required content under 45 CFR 164.308(b) and 164.314."
    >
      <Section title="When a BAA is required">
        <P>
          A Business Associate Agreement is required whenever a vendor creates, receives, maintains, or transmits PHI
          on a covered entity's behalf. The statutory obligation sits in §164.502(e). The substantive contract
          requirements are in §164.504(e) (Privacy Rule) and §164.314(a) (Security Rule). This template is drafted
          specifically for a small medical clinic (covered entity) entering a BAA with a downstream vendor.
        </P>
        <Callout label="Common vendors that require a BAA">
          EHR platforms, cloud storage services, billing companies, answering services, transcription vendors,
          IT support contractors, lab result portals, and any cloud software that stores or processes patient data.
          The conduit exception (for pure transport with no PHI storage access) is narrow - when in doubt, get a BAA.
        </Callout>
      </Section>

      <Section title="Template - Business Associate Agreement">
        <Subsection title="Parties and effective date">
          <P>
            This Business Associate Agreement ("Agreement") is entered into as of __________ ("Effective Date")
            by and between __________ ("Covered Entity") and __________ ("Business Associate").
          </P>
        </Subsection>

        <Subsection title="Definitions">
          <P>
            Capitalized terms not otherwise defined have the meanings given in HIPAA, as amended by HITECH (42 U.S.C.
            §17921 et seq.) and its implementing regulations (45 CFR Parts 160 and 164), as each may be amended
            from time to time.
          </P>
        </Subsection>

        <Subsection title="Permitted uses and disclosures by Business Associate">
          <P>
            Business Associate may use or disclose PHI only as necessary to perform the services described in the
            underlying service agreement ("Services") and as permitted or required by this Agreement, and in compliance
            with §164.504(e)(2)(i). Business Associate shall not use or disclose PHI in a manner that would violate
            Subpart E of 45 CFR Part 164 if done by Covered Entity, except as permitted in this Agreement.
          </P>
        </Subsection>

        <Subsection title="Required safeguards">
          <P>
            Business Associate shall implement appropriate administrative, physical, and technical safeguards that
            reasonably and appropriately protect the confidentiality, integrity, and availability of any ePHI that
            it creates, receives, maintains, or transmits on behalf of Covered Entity, as required by the Security
            Rule (45 CFR Part 164, Subpart C).
          </P>
        </Subsection>

        <Subsection title="Subcontractor obligations">
          <P>
            Business Associate shall ensure that any subcontractor that creates, receives, maintains, or transmits
            PHI on behalf of Business Associate enters into an agreement requiring the subcontractor to comply with
            the applicable requirements of the Privacy and Security Rules, consistent with §164.504(e)(2)(ii)(D)
            and §164.314(a)(2)(i)(B).
          </P>
        </Subsection>

        <Subsection title="Breach notification">
          <P>
            Business Associate shall notify Covered Entity without unreasonable delay and in no case later than
            60 calendar days after discovery of a Breach of Unsecured PHI. Notice shall include, to the extent
            possible, the elements listed in §164.410(c). Business Associate shall cooperate fully with Covered
            Entity's investigation and shall provide updates as additional information becomes available.
          </P>
        </Subsection>

        <Subsection title="Individual rights">
          <P>
            Business Associate shall make available PHI in accordance with §164.524 (access), §164.526 (amendment),
            and §164.528 (accounting of disclosures) to enable Covered Entity to comply with its obligations to
            individuals. Business Associate shall accommodate reasonable requests for restrictions on use and
            disclosure under §164.522.
          </P>
        </Subsection>

        <Subsection title="HHS access">
          <P>
            Business Associate shall make internal practices, books, and records available to the Secretary of HHS
            for purposes of determining Covered Entity's compliance with HIPAA, as required by §164.504(e)(2)(ii)(I).
          </P>
        </Subsection>

        <Subsection title="Term and termination">
          <P>
            This Agreement is effective as of the Effective Date and terminates when the underlying Services
            agreement terminates or upon written notice by either party. Upon termination, Business Associate shall,
            at the election of Covered Entity, return or destroy all PHI received from, or created or received on
            behalf of, Covered Entity. If return or destruction is infeasible, protections are extended indefinitely.
          </P>
        </Subsection>
      </Section>

      <Section title="Signature block">
        <P>
          COVERED ENTITY
          Organization: __________________________
          Authorized signatory: __________________________
          Title: __________________________
          Date: __________________________
        </P>
        <P>
          BUSINESS ASSOCIATE
          Organization: __________________________
          Authorized signatory: __________________________
          Title: __________________________
          Date: __________________________
        </P>
      </Section>

      <Section title="Pre-signing checklist">
        <Bullets
          items={[
            'Confirm the vendor actually touches PHI - not just receives demographics or billing codes in isolation.',
            'Verify the signatory has authority to bind the vendor contractually.',
            'Confirm the vendor has a documented security program - ask for their SOC 2 or security summary.',
            'Set a calendar reminder for the contract renewal date so the BAA is reviewed and re-signed as needed.',
            'Log the signed BAA in your vendor register with the vendor name, effective date, and renewal date.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard gives clinics a place to track which vendors have signed BAAs, flag upcoming renewals, and keep
          contract evidence attached to the vendor record. If BAA status still lives in a spreadsheet that no one
          checks until an auditor asks, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
