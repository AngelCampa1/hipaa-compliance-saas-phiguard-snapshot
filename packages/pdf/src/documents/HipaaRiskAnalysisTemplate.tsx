import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function HipaaRiskAnalysisTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Risk Analysis Worksheet"
      subtitle="The asset inventory, threat catalog, scoring matrix, and risk register small clinics need to satisfy §164.308(a)(1)(ii)(A)."
    >
      <Section title="Why a risk analysis is non-negotiable">
        <P>
          The Security Rule requires every covered entity and business associate to conduct "an accurate and thorough
          assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of
          electronic protected health information." That language sits in §164.308(a)(1)(ii)(A) and it is the single
          most-cited violation in OCR resolution agreements. A risk analysis is not a one-time document - it must be
          reviewed and updated whenever systems, vendors, or workflows change materially, and at minimum annually.
        </P>
        <Callout label="OCR enforcement reality">
          Nearly every multi-million-dollar OCR settlement since 2016 has cited a missing, stale, or superficial risk
          analysis. Annual risk analysis, with evidence that it happened, is one of the highest-value compliance
          activities a small clinic can undertake.
        </Callout>
      </Section>

      <Section title="Asset inventory template">
        <P>
          Start with what you have. You cannot protect PHI you have not mapped. Include every system, device, and
          vendor that creates, receives, maintains, or transmits ePHI.
        </P>
        <Table
          headers={['Asset', 'Type', 'PHI touched', 'Storage', 'Vendor / BAA status']}
          rows={[
            ['EHR (e.g., Athena)', 'SaaS', 'Full chart', 'Vendor cloud', 'BA - BAA signed'],
            ['Practice management', 'SaaS', 'Demographics, billing', 'Vendor cloud', 'BA - BAA signed'],
            ['Workstations (8)', 'Endpoint', 'Via EHR session', 'Local disk (encrypted)', 'N/A'],
            ['Staff laptops (3)', 'Endpoint', 'Via EHR session', 'Local disk (encrypted)', 'N/A'],
            ['Email', 'SaaS', 'Incidental PHI', 'Vendor cloud', 'BA - BAA signed'],
            ['Backup service', 'SaaS', 'Full chart', 'Vendor cloud', 'BA - BAA signed'],
            ['Paper intake forms', 'Physical', 'Demographics, history', 'Locked cabinet', 'N/A'],
            ['Fax (digital)', 'SaaS', 'Incoming referrals', 'Vendor cloud', 'BA - BAA signed'],
          ]}
        />
      </Section>

      <Section title="Threat catalog">
        <P>
          A threat is an event or actor that could cause harm. For each asset above, consider which of the following
          threats apply. This is the catalog OCR expects to see considered.
        </P>
        <Bullets
          items={[
            'Malware and ransomware - including drive-by downloads, phishing payloads, and supply-chain compromises.',
            'Unauthorized access - weak passwords, shared credentials, lateral movement after a compromised account.',
            'Insider misuse - snooping on coworker or celebrity records, curiosity-driven access, malicious exfiltration.',
            'Physical theft or loss - stolen laptops, misplaced USB drives, office break-ins.',
            'Natural disaster - fire, flood, power outage affecting availability.',
            'Vendor compromise - a business associate breach that exposes your PHI downstream.',
            'Misdelivery - faxes, emails, and mail sent to the wrong recipient.',
            'Ransomware - specifically flagged by HHS as a presumed breach unless LOPC is demonstrated.',
          ]}
        />
      </Section>

      <Section title="Vulnerability, likelihood, and impact scoring">
        <P>
          For each asset and threat pair, score the likelihood and the impact on a 3 by 3 matrix. Likelihood reflects the
          existing controls; impact reflects the potential harm to individuals and the clinic.
        </P>
        <Table
          headers={['Score', 'Likelihood', 'Impact']}
          rows={[
            ['Low (1)', 'Controls strong; event unlikely in a year', 'Minor disclosure; small patient count'],
            ['Moderate (2)', 'Plausible within a year', 'Mid-sized disclosure; operational disruption'],
            ['High (3)', 'Expected or observed within a year', 'Large disclosure; regulatory exposure; care disruption'],
          ]}
        />
        <P>
          Risk score = Likelihood times Impact. A score of 1-2 is Low, 3-4 is Moderate, 6-9 is High. Every Moderate or High
          risk must have a remediation plan with an owner and a target date.
        </P>
      </Section>

      <Section title="Risk register template">
        <Table
          headers={['Risk ID', 'Description', 'L', 'I', 'Score', 'Controls', 'Gap', 'Remediation', 'Owner', 'Target']}
          rows={[
            ['R-001', 'Ransomware via phishing', '', '', '', 'MFA, email filter, training', '', '', '', ''],
            ['R-002', 'Lost laptop with ePHI cache', '', '', '', 'FDE, remote wipe', '', '', '', ''],
            ['R-003', 'Shared login on shared workstation', '', '', '', 'Unique user IDs', '', '', '', ''],
            ['R-004', 'Backup integrity failure', '', '', '', 'Nightly backup, quarterly restore test', '', '', '', ''],
            ['R-005', 'Vendor BAA expired', '', '', '', 'Vendor tracker', '', '', '', ''],
            ['R-006', 'Paper record left at front desk', '', '', '', 'Clean-desk policy', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Safeguard mapping">
        <Subsection title="Administrative safeguards - §164.308">
          <Bullets
            items={[
              'Security management process, including this risk analysis and a risk management plan.',
              'Assigned security responsibility - named security officer.',
              'Workforce security - authorization, clearance, and termination procedures.',
              'Information access management - role-based access and least privilege.',
              'Security awareness and training, applied to all workforce members.',
              'Security incident procedures - identification, response, and documentation.',
              'Contingency plan - backup, disaster recovery, emergency mode operation.',
              'Evaluation - periodic technical and non-technical review.',
              'Business associate contracts under §164.308(b).',
            ]}
          />
        </Subsection>
        <Subsection title="Physical safeguards - §164.310">
          <Bullets
            items={[
              'Facility access controls - locks, badge access, visitor sign-in.',
              'Workstation use and workstation security - placement, privacy screens.',
              'Device and media controls - disposal, re-use, accountability, backup.',
            ]}
          />
        </Subsection>
        <Subsection title="Technical safeguards - §164.312">
          <Bullets
            items={[
              'Access control - unique user IDs, emergency access, automatic logoff, encryption and decryption.',
              'Audit controls - activity logs on systems containing ePHI.',
              'Integrity - controls to prevent improper alteration or destruction.',
              'Person or entity authentication.',
              'Transmission security - integrity controls and encryption.',
            ]}
          />
        </Subsection>
      </Section>

      <Section title="Annual review checklist">
        <Bullets
          items={[
            'Asset inventory refreshed - new vendors, decommissioned systems, new devices.',
            'Threat catalog reviewed against current threat landscape and recent OCR bulletins.',
            'Every Moderate and High risk reviewed with its owner; status updated.',
            'Controls re-tested at least once in the year (penetration test, vulnerability scan, backup restore drill).',
            'Risk analysis signed and dated by the security officer. Retain for six years.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard maintains your asset inventory, risk register, and safeguard mapping in one place with audit trails
          on every change. If your last risk analysis lives in a Word document from two years ago, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
