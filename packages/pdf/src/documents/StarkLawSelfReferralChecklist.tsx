import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function StarkLawSelfReferralChecklistDocument() {
  return (
    <PdfLayout
      title="Stark Law Self-Referral Checklist"
      subtitle="A self-assessment for physician-owned clinics to identify referral arrangements that may require legal review - with a reference guide to statutory exceptions."
    >
      <Section title="How to use this checklist">
        <P>
          This checklist identifies arrangements that may raise issues under the Physician Self-Referral Law (42 U.S.C.
          §1395nn), commonly known as the Stark Law. A "yes" answer to any question in Sections 1-3 does not mean a
          violation exists - it means the arrangement warrants review against the applicable statutory exceptions with
          legal counsel.
        </P>
        <P>
          This is a screening tool, not a legal opinion. Do not use it as a substitute for advice from healthcare
          counsel familiar with Stark Law compliance.
        </P>
      </Section>

      <Callout label="Stark Law basics">
        The Stark Law prohibits a physician from making referrals for designated health services (DHS) payable by
        Medicare or Medicaid to an entity with which the physician - or an immediate family member - has a financial
        relationship, unless an exception applies. Penalties include repayment of claims, civil monetary penalties, and
        exclusion from federal healthcare programs.
      </Callout>

      <Section title="Section 1: Ownership and investment interests">
        <Table
          headers={['Question', 'Yes', 'No', 'Notes / Exception to Review']}
          rows={[
            [
              'Do any physicians at this practice have an ownership or investment interest in an entity to which they refer Medicare/Medicaid patients for designated health services?',
              '',
              '',
              '',
            ],
            [
              'Do any immediate family members of physicians at this practice have such an ownership interest?',
              '',
              '',
              '',
            ],
            [
              'Does the practice have an ownership interest in a laboratory, imaging center, PT facility, DME supplier, or home health agency?',
              '',
              '',
              '',
            ],
            [
              'Are referrals made to any of these entities by physicians with an ownership interest?',
              '',
              '',
              '',
            ],
          ]}
        />
      </Section>

      <Section title="Section 2: Compensation arrangements">
        <Table
          headers={['Question', 'Yes', 'No', 'Notes / Exception to Review']}
          rows={[
            [
              'Does the practice have any compensation arrangement with an entity to which physicians refer DHS patients (e.g., medical director agreements, consulting arrangements, space/equipment leases)?',
              '',
              '',
              '',
            ],
            [
              'Is any physician compensation - directly or indirectly - tied to the volume or value of referrals made?',
              '',
              '',
              '',
            ],
            [
              'Does any physician receive anything of value from an entity that refers patients to this practice, or to which this practice refers patients?',
              '',
              '',
              '',
            ],
            [
              'Are there co-marketing agreements, shared services arrangements, or joint ventures with referring or referred-to entities?',
              '',
              '',
              '',
            ],
          ]}
        />
      </Section>

      <Section title="Section 3: Ancillary services">
        <Table
          headers={['Ancillary Service', 'Provided In-Office (Y/N)', 'Physicians Refer to Own Service (Y/N)', 'Exception Documented']}
          rows={[
            ['Clinical laboratory services', '', '', ''],
            ['Diagnostic imaging (X-ray, MRI, CT)', '', '', ''],
            ['Physical therapy / occupational therapy', '', '', ''],
            ['Durable medical equipment', '', '', ''],
            ['Home health services', '', '', ''],
            ['Outpatient prescription drugs', '', '', ''],
            ['Radiation therapy services', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 4: Statutory exceptions reference">
        <P>
          If Section 1, 2, or 3 produced a "Yes" answer, review the applicable exceptions below with legal counsel:
        </P>
        <Bullets
          items={[
            'In-office ancillary services exception (42 U.S.C. §1395nn(b)(2)): permits referrals within a group practice for services personally performed or supervised by a group practice physician, billed under the group\'s NPI, in the same building',
            'Employment exception (§1395nn(e)(2)): permits compensation arrangements with bona fide employees where compensation is not based on volume or value of referrals',
            'Group practice exception (§1395nn(b)(1)): physician-members of a qualifying group practice may make referrals within the group',
            'Fair market value compensation exception (§1395nn(e)(8)): non-employee arrangements at fair market value, in writing, not related to referral volume',
            'Space and equipment rental exceptions (§1395nn(e)(1)): written leases at fair market value for identifiable space or equipment',
          ]}
        />
      </Section>

      <Section title="Review sign-off and next steps">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Assessment completed by', ''],
            ['Date of assessment', ''],
            ['Items flagged for legal review', ''],
            ['Legal counsel engaged', 'Y / N'],
            ['Date referred to counsel', ''],
            ['Outcome / exception documented', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard's compliance task tracking helps clinics schedule annual self-referral reviews and attach legal
          counsel sign-offs to the compliance record. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
