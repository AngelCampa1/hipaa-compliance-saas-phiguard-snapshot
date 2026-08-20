import { P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaTaskManagementMaturityScorecardDocument() {
  return (
    <PdfLayout
      title="HIPAA Task Management Maturity Scorecard"
      subtitle="A 5-level rubric across 6 compliance dimensions - score your clinic and identify the highest-value improvements."
    >
      <Section title="How to use this scorecard">
        <P>
          Score each of the 6 dimensions on a 1-5 scale using the rubric below. Total score 6-12 = Ad Hoc (Level
          1-2), 13-18 = Repeatable (Level 2-3), 19-24 = Defined (Level 3-4), 25-30 = Managed-Optimized (Level 4-5).
          The goal for most small clinics is to reach Level 3 across all dimensions.
        </P>
      </Section>

      <Section title="Maturity levels defined">
        <Table
          headers={['Level', 'Name', 'Description']}
          rows={[
            [
              '1 - Ad Hoc',
              'No system',
              'Tasks exist in memory, chat, or email. No owner, no deadline, no evidence.',
            ],
            [
              '2 - Reactive',
              'Checklists exist',
              'Some tasks are written down. Follow-through depends on individual memory. Evidence collected inconsistently.',
            ],
            [
              '3 - Defined',
              'Assigned and tracked',
              'Each task has an owner and due date. Evidence is collected at completion. Reviews happen on schedule.',
            ],
            [
              '4 - Managed',
              'Documented and reviewed',
              'Task completion is reviewed. Gaps trigger corrective action. Evidence is organized and accessible.',
            ],
            [
              '5 - Optimized',
              'Continuous improvement',
              'Program is reviewed annually. Maturity is measured. Improvements are tracked and assigned.',
            ],
          ]}
        />
      </Section>

      <Section title="Dimension 1: Task ownership">
        <Table
          headers={['Score', 'Description']}
          rows={[
            ['1', 'No clear owner for any compliance task'],
            ['2', 'Some tasks have informal owners but nothing documented'],
            ['3', 'Each recurring task has a named owner with a written assignment'],
            ['4', 'Backup owners documented; handoffs happen when someone leaves'],
            ['5', 'Ownership reviewed annually and updated after role changes'],
          ]}
        />
      </Section>

      <Section title="Dimension 2: Evidence documentation">
        <Table
          headers={['Score', 'Description']}
          rows={[
            ['1', 'No evidence collected; no way to demonstrate completion'],
            ['2', 'Some tasks have paper records; not organized or retrievable'],
            ['3', 'Evidence collected at task completion and filed consistently'],
            ['4', 'Evidence organized by task type with retention dates noted'],
            ['5', 'Evidence links to specific HIPAA citations; 6-year retention confirmed'],
          ]}
        />
      </Section>

      <Section title="Dimension 3: Vendor and BAA oversight">
        <Table
          headers={['Score', 'Description']}
          rows={[
            ['1', 'No BAA inventory; unknown which vendors have signed'],
            ['2', 'BAA list exists but renewal dates not tracked'],
            ['3', 'All active vendors with PHI access have signed BAAs with tracked renewal dates'],
            ['4', 'Subprocessor review included; AI vendor assessment documented'],
            ['5', 'Annual vendor review cycle runs; renewal gaps trigger automatic follow-up'],
          ]}
        />
      </Section>

      <Section title="Dimension 4: Workforce training">
        <Table
          headers={['Score', 'Description']}
          rows={[
            ['1', 'No documented training; verbal only'],
            ['2', 'Training happened once; no records, no annual cadence'],
            ['3', 'Annual training with signed acknowledgements on file'],
            ['4', 'Role-specific training tracked per employee; completion documented'],
            ['5', 'Training content reviewed and updated annually; sanctions applied consistently'],
          ]}
        />
      </Section>

      <Section title="Dimension 5: Incident handling">
        <Table
          headers={['Score', 'Description']}
          rows={[
            ['1', 'No incident log; incidents handled ad hoc or not at all'],
            ['2', 'Incidents occasionally noted; no 4-factor assessment completed'],
            ['3', 'All incidents logged; 4-factor assessment completed for security events'],
            ['4', 'Incident log reviewed quarterly; breach determinations documented and retained'],
            ['5', 'Incidents feed annual risk analysis; patterns reviewed for systemic causes'],
          ]}
        />
      </Section>

      <Section title="Dimension 6: Access management">
        <Table
          headers={['Score', 'Description']}
          rows={[
            ['1', 'No access controls documented; shared logins in use'],
            ['2', 'Some role-based access but no periodic review'],
            ['3', 'Access matrix documented; quarterly or semi-annual reviews completed'],
            ['4', 'Termination protocol followed same-day; access log evidence retained'],
            ['5', 'Access reviews trigger risk analysis updates; minimum necessary enforced by role'],
          ]}
        />
      </Section>

      <Section title="Scoring guide">
        <Table
          headers={['Total Score', 'Level', 'Next steps']}
          rows={[
            [
              '6-12',
              'Level 1-2 (Ad Hoc/Reactive)',
              'Prioritize: written task ownership, BAA inventory, and an incident log. Start with those three.',
            ],
            [
              '13-18',
              'Level 2-3 (Reactive/Defined)',
              'Standardize evidence collection. Build an annual training cadence. Add quarterly access reviews.',
            ],
            [
              '19-24',
              'Level 3-4 (Defined/Managed)',
              'Add review cycles for task completion. Connect incident findings to risk analysis. Formalize vendor renewal process.',
            ],
            [
              '25-30',
              'Level 4-5 (Managed/Optimized)',
              'Document improvement actions. Benchmark against last year. Consider third-party gap assessment.',
            ],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard operationalizes Level 3 and above: assigned task ownership, evidence attached at completion, BAA
          renewal tracking, and incident log with built-in 4-factor prompts. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
