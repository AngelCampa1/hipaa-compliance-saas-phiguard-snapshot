import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaSecurityPolicyTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Security Policy Template"
      subtitle="A Security Rule policy template covering administrative, physical, and technical safeguard requirements under 45 CFR Part 164."
    >
      <Section title="Purpose and applicability">
        <P>
          This policy establishes [Clinic Name]'s requirements for protecting electronic protected health information
          (ePHI) in compliance with the HIPAA Security Rule (45 CFR Part 164, Subpart C). It applies to all
          workforce members who create, receive, maintain, or transmit ePHI using clinic systems, devices, or
          networks.
        </P>
        <Callout label="Required vs. addressable specifications">
          The Security Rule distinguishes between "required" specifications (which must be implemented) and
          "addressable" specifications (which must be implemented if reasonable and appropriate, or the clinic
          must document why an equivalent alternative was used instead). Both types must be addressed in your
          policies - not just required ones.
        </Callout>
      </Section>

      <Section title="Administrative safeguards - §164.308">
        <Bullets
          items={[
            'Security Management Process (§164.308(a)(1)): Conduct and document an annual risk analysis covering all systems, applications, and workflows that touch ePHI. Implement a risk management program to reduce identified risks to a reasonable and appropriate level.',
            'Assigned Security Responsibility (§164.308(a)(2)): Designate a Security Officer responsible for developing and implementing security policies.',
            'Workforce Security (§164.308(a)(3)): Implement procedures for workforce authorization and supervision; establish a clearance procedure for workforce members requiring ePHI access; and implement termination procedures to revoke access immediately.',
            'Information Access Management (§164.308(a)(4)): Restrict access to ePHI to authorized workforce members only. Implement a documented access authorization process.',
            'Security Awareness Training (§164.308(a)(5)): Train all workforce members on security awareness, covering malicious software, login monitoring, password management, and incident reporting.',
            'Security Incident Procedures (§164.308(a)(6)): Document and implement procedures for identifying, responding to, and reporting security incidents.',
            'Contingency Plan (§164.308(a)(7)): Establish data backup, disaster recovery, emergency mode operations, testing, and criticality analysis procedures.',
            'Evaluation (§164.308(a)(8)): Conduct periodic technical and non-technical evaluations of the security program.',
          ]}
        />
      </Section>

      <Section title="Physical safeguards - §164.310">
        <Bullets
          items={[
            'Facility Access Controls (§164.310(a)(1)): Limit physical access to systems containing ePHI to authorized persons. Document authorized access levels.',
            'Workstation Use (§164.310(b)): Define acceptable use for workstations that access ePHI. Workstations must be positioned to minimize unauthorized viewing.',
            'Workstation Security (§164.310(c)): Implement physical safeguards on workstations - screen locks, cable locks, or access-controlled rooms.',
            'Device and Media Controls (§164.310(d)(1)): Document the receipt and removal of hardware and electronic media containing ePHI. Implement media disposal and re-use procedures.',
          ]}
        />
      </Section>

      <Section title="Technical safeguards - §164.312">
        <Bullets
          items={[
            'Access Control (§164.312(a)(1)): Implement unique user identification, emergency access procedures, automatic logoff, and encryption/decryption for ePHI.',
            'Audit Controls (§164.312(b)): Implement hardware, software, and procedural mechanisms to record and examine access and activity in ePHI systems.',
            'Integrity (§164.312(c)(1)): Implement measures to ensure ePHI is not improperly altered or destroyed.',
            'Transmission Security (§164.312(e)(1)): Implement technical security measures to guard against unauthorized access to ePHI transmitted over a network.',
          ]}
        />
      </Section>

      <Section title="Security safeguard implementation summary">
        <Table
          headers={['Safeguard', 'Standard', 'Status', 'Owner', 'Review date']}
          rows={[
            ['Risk analysis', '§164.308(a)(1)', '', 'Security Officer', ''],
            ['User access controls', '§164.312(a)(1)', '', 'IT', ''],
            ['Audit logging', '§164.312(b)', '', 'IT', ''],
            ['Workstation locks', '§164.310(c)', '', 'IT', ''],
            ['Workforce training', '§164.308(a)(5)', '', 'Privacy Officer', ''],
            ['Encryption in transit', '§164.312(e)(1)', '', 'IT', ''],
            ['Backup and recovery', '§164.308(a)(7)', '', 'IT', ''],
          ]}
        />
      </Section>

      <Section title="Sanctions for security violations">
        <P>
          Workforce members who violate this security policy are subject to the clinic's sanctions policy,
          consistent with §164.308(a)(1)(ii)(C). Sanctions are applied consistently regardless of role.
          The security officer will document all violations and sanctions in the security incident log.
        </P>
      </Section>

      <Section title="Policy review and revision history">
        <P>
          Policy owner: Security Officer
          Effective date: __________________________
          Last reviewed: __________________________
          Next review due: __________________________
        </P>
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard connects Security Rule policies to recurring safeguard tasks, annual review cycles, and an
          audit trail of actions taken. If your security policy is in a document somewhere but the day-to-day
          compliance work is scattered across email and shared drives, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
