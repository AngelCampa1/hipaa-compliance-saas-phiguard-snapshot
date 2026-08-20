import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaCoveredEntityDeterminationGuideDocument() {
  return (
    <PdfLayout
      title="HIPAA Covered Entity Determination Guide"
      subtitle="A decision tree for confirming whether HIPAA applies to your practice"
    >
      <Section title="The three covered entity categories">
        <P>
          Under 45 CFR § 160.103, a covered entity is one of three things: a covered healthcare provider,
          a health plan, or a healthcare clearinghouse. Most clinics analyze the first category. Health
          plans cover insurers, HMOs, certain employer group health plans, and government programs.
          Clearinghouses translate transactions between providers and payers.
        </P>
      </Section>

      <Section title="The transaction trigger for providers">
        <P>
          A healthcare provider becomes a covered entity by transmitting health information in electronic
          form in connection with a transaction for which HHS has adopted a standard. The trigger is
          electronic transmission, not the existence of electronic records.
        </P>
        <Callout label="Transaction trigger">
          A practice that maintains an EHR but submits all claims on paper has not crossed the threshold.
          A practice that uses a billing service to submit claims electronically has crossed it through
          the agent.
        </Callout>
      </Section>

      <Section title="HIPAA standard transactions (45 CFR Part 162)">
        <Bullets
          items={[
            'Health care claims or equivalent encounter information',
            'Eligibility for a health plan',
            'Referral certification and authorization',
            'Health care claim status',
            'Enrollment and disenrollment in a health plan',
            'Health care payment and remittance advice',
            'Health plan premium payments',
            'Coordination of benefits',
            'First report of injury',
          ]}
        />
      </Section>

      <Section title="Decision tree">
        <Table
          headers={['Question', 'If yes', 'If no']}
          rows={[
            ['Are you a healthcare provider, plan, or clearinghouse?', 'Continue', 'Not a covered entity'],
            ['(Provider) Do you electronically transmit any Part 162 transaction, directly or via agent?', 'Covered entity', 'Not a covered entity'],
            ['Do you have mixed covered and non-covered functions?', 'Consider hybrid entity designation under § 164.105', 'Standard covered-entity rules apply'],
            ['Do you handle PHI only on behalf of a covered entity?', 'Business associate, not covered entity', 'Re-evaluate'],
          ]}
        />
      </Section>

      <Section title="Examples that ARE covered">
        <Bullets
          items={[
            'Primary care clinic that submits claims through a clearinghouse',
            'Dental office running eligibility checks through a payer portal',
            'Solo psychiatrist whose biller files Medicare claims electronically',
            'Physical therapy practice receiving electronic remittance advice',
            'Specialist using e-prescribing tied to insurance routing',
          ]}
        />
      </Section>

      <Section title="Examples that are NOT covered">
        <Bullets
          items={[
            'Concierge cash-only practice with no electronic Part 162 transactions',
            'Life insurer underwriting policies (life insurance is not a covered health plan)',
            'Small employer self-funded plan below size threshold with no electronic transactions',
            'A wellness app that does not interact with payers or providers',
            'Most workers-compensation carriers (subject to state law)',
          ]}
        />
      </Section>

      <Section title="Hybrid entity considerations">
        <P>
          Organizations with both covered and non-covered functions can designate themselves a hybrid
          entity under § 164.105 and apply HIPAA only to the healthcare components. The designation must
          be in writing and the components clearly separated. Most small clinics do not need this; mixed
          academic or municipal organizations sometimes do.
        </P>
      </Section>

      <Section title="Business associate vs covered entity">
        <P>
          If you handle PHI only on behalf of a covered entity (billing service, IT vendor,
          transcription service), you are a business associate. Your obligations flow from the BAA you
          sign and from direct application of the Security Rule and parts of the Privacy Rule under
          HITECH.
        </P>
      </Section>

      <Section title="Action steps once you confirm covered status">
        <Bullets
          items={[
            'Designate a Privacy Officer and Security Officer',
            'Complete a § 164.308(a)(1) risk analysis',
            'Inventory business associates and execute BAAs',
            'Adopt written privacy and security policies',
            'Train your workforce and document the training',
            'Build an audit trail you can produce on request',
          ]}
        />
      </Section>
    </PdfLayout>
  )
}
