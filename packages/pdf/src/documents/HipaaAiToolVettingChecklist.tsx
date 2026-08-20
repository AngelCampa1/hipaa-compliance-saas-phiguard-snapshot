import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAiToolVettingChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA AI Tool Vetting Checklist"
      subtitle="25-item checklist for evaluating AI tools before allowing them to process, store, or transmit PHI."
    >
      <Section title="How to use this checklist">
        <P>
          Complete this checklist before allowing any AI tool - including AI-assisted clinical, billing, scheduling,
          transcription, or documentation tools - to access PHI. A "No" answer to any item in Sections A through D
          is a disqualifying finding unless the risk can be mitigated and documented. Do not deploy the tool until
          all disqualifying items are resolved or formally accepted by your Privacy or Security Officer.
        </P>
        <Callout label="Consumer AI tools">
          Consumer-grade AI tools (ChatGPT, Gemini, Claude consumer tier, Microsoft Copilot without a Microsoft 365
          business agreement, etc.) do not offer HIPAA BAAs unless specifically contracted for a business tier with
          BAA coverage. Entering PHI into an uncovered AI tool is an impermissible disclosure.
        </Callout>
      </Section>

      <Section title="Section A - Legal and contractual safeguards">
        <Table
          headers={['#', 'Item', 'Yes', 'No', 'N/A', 'Notes']}
          rows={[
            ['1', 'Vendor will sign a HIPAA Business Associate Agreement (BAA) before PHI is processed', '', '', '', ''],
            ['2', 'BAA covers all AI subprocessors and downstream data recipients', '', '', '', ''],
            ['3', 'Vendor provides written documentation of BAA availability in writing (not just a marketing claim)', '', '', '', ''],
            ['4', 'BAA specifies permitted uses of PHI - limited to the contracted service purpose', '', '', '', ''],
            ['5', 'BAA addresses breach notification obligations (recommend: 24-hour notice to covered entity)', '', '', '', ''],
            ['6', 'BAA addresses PHI return or destruction at contract termination', '', '', '', ''],
            ['7', 'Vendor provides a current, complete list of subprocessors that may receive PHI', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section B - Data handling and residency">
        <Table
          headers={['#', 'Item', 'Yes', 'No', 'N/A', 'Notes']}
          rows={[
            ['8', 'PHI entered into the tool is not used to train AI models without explicit authorization', '', '', '', ''],
            ['9', 'Data residency is confirmed - PHI stays within the United States (or jurisdiction acceptable to clinic)', '', '', '', ''],
            ['10', 'Encryption at rest: PHI stored by the vendor is encrypted (AES-256 or equivalent)', '', '', '', ''],
            ['11', 'Encryption in transit: all PHI transmitted to/from the tool uses TLS 1.2 or higher', '', '', '', ''],
            ['12', 'Vendor can confirm PHI is not retained beyond the agreed purpose and retention period', '', '', '', ''],
            ['13', 'Vendor provides a data processing agreement or equivalent that describes data flows', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section C - Access controls and authentication">
        <Table
          headers={['#', 'Item', 'Yes', 'No', 'N/A', 'Notes']}
          rows={[
            ['14', 'Tool supports role-based access controls - access to PHI can be limited by user role', '', '', '', ''],
            ['15', 'Tool supports multi-factor authentication (MFA) for user accounts accessing PHI', '', '', '', ''],
            ['16', 'Tool provides audit logs of user access to PHI-containing outputs', '', '', '', ''],
            ['17', 'Vendor employees who may access PHI (for support, model tuning, QA) are subject to HIPAA training', '', '', '', ''],
            ['18', 'The tool can be configured to prevent PHI from being exported or copied outside the secure environment', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section D - Incident response and compliance history">
        <Table
          headers={['#', 'Item', 'Yes', 'No', 'N/A', 'Notes']}
          rows={[
            ['19', 'Vendor has a documented security incident response program applicable to PHI breaches', '', '', '', ''],
            ['20', 'Vendor has not had a reportable PHI breach in the past 24 months (or discloses past incidents)', '', '', '', ''],
            ['21', 'Vendor provides an annual penetration test report or SOC 2 Type II report upon request', '', '', '', ''],
            ['22', 'Vendor has a documented vulnerability management program', '', '', '', ''],
            ['23', 'Vendor will notify covered entity of material changes to data processing within a defined period (e.g., 30 days)', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section E - Operational fit for the clinic">
        <Table
          headers={['#', 'Item', 'Yes', 'No', 'N/A', 'Notes']}
          rows={[
            ['24', 'Clinic has documented an approved use case - specifically what PHI the tool will process and for what purpose', '', '', '', ''],
            ['25', 'Clinic has updated the staff AI use policy (Approved Tools Registry) to include this tool before deployment', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Scoring and deployment decision">
        <Bullets
          items={[
            'All 7 items in Section A: Yes - required before any PHI is processed. A single "No" blocks deployment.',
            'All items in Sections B and C: "No" items require documented risk acceptance by the Privacy or Security Officer before deployment.',
            'Section D: Any "No" items require specific review and documentation. Past breaches do not automatically disqualify but must be evaluated.',
            'Section E: Both items must be "Yes" before the tool is introduced to clinical staff.',
          ]}
        />
      </Section>

      <Section title="Vetting documentation">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['AI tool name and vendor', ''],
            ['Intended use case (specific workflow)', ''],
            ['PHI types involved', ''],
            ['BAA signed date', ''],
            ['Reviewed by', ''],
            ['Review date', ''],
            ['Approval decision', ''],
            ['Approved by (Privacy / Security Officer)', ''],
            ['Conditions or restrictions on use', ''],
            ['Next review date', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks AI tool approvals, BAA status, and review cycles alongside your vendor management program.
          See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
