import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAiGovernanceFrameworkDocument() {
  return (
    <PdfLayout
      title="HIPAA AI Governance Framework for Small Clinics"
      subtitle="Govern ambient scribes, AI coding, and AI assistants without leaking PHI"
    >
      <Section title="What this framework covers">
        <P>
          AI tools that create, receive, maintain, or transmit ePHI fall inside the same risk-analysis
          obligations as any other system under 45 CFR § 164.308(a)(1). This framework is sized for a small
          clinic without a full compliance team. It covers ambient scribes, AI-assisted coding, AI prior
          authorization, scheduling assistants, and AI features inside your EHR.
        </P>
        <P>
          Out of scope: deterministic automation that never touches PHI (rules-based reminders that
          reference appointment times only, for example).
        </P>
      </Section>

      <Section title="Step 1 - Risk analysis for AI tools">
        <P>
          A § 164.308(a)(1) risk analysis for an AI tool answers the standard questions plus three
          AI-specific ones.
        </P>
        <Bullets
          items={[
            'What does the vendor do with prompt input data?',
            'What does the vendor do with model output, including caching and logs?',
            'Is any portion of clinic data used to train, fine-tune, or evaluate models, even in aggregate or de-identified form?',
            'Where is the foundation model hosted, and is the underlying provider listed in the BAA flow-down?',
            'How does the vendor handle data subject rights (§ 164.524 access, § 164.526 amendment)?',
          ]}
        />
        <Callout label="Legal review">
          If the answer to the training-data question is anything other than a clean no, escalate to legal
          review before signing.
        </Callout>
      </Section>

      <Section title="Step 2 - BAA vetting checklist">
        <Table
          headers={['Requirement', 'Why it matters']}
          rows={[
            ['Explicit prohibition on training on clinic data', 'Prevents PHI leakage into shared model weights'],
            ['Foundation model flow-down (OpenAI, Anthropic, Google)', 'Each tier handling PHI must be a business associate'],
            ['Data residency (US-only or named regions)', 'Aligns with risk analysis assumptions'],
            ['Retention and deletion windows', 'Limits exposure window for incidents'],
            ['Breach notification timelines', 'Required under § 164.410'],
            ['Subcontractor list with notice on change', 'Maintains awareness of the BA chain'],
          ]}
        />
      </Section>

      <Section title="Step 3 - Approved-tool list">
        <P>
          Maintain one written list. Each entry names the tool, the use case, the BAA effective date, the
          authorized staff role, and the date of last vendor review. Staff may not use any AI tool not on
          the list for any task involving PHI.
        </P>
      </Section>

      <Section title="Step 4 - Prohibited uses">
        <Bullets
          items={[
            'Pasting PHI into consumer ChatGPT, Gemini, or Claude.ai accounts',
            'Personal AI browser extensions on clinic devices that read page content',
            'Uploading patient documents to general-purpose AI summarizers without a BAA',
            'Using AI tools approved for one purpose to handle a different category of PHI',
            'Disabling vendor logging that supports your audit trail',
          ]}
        />
      </Section>

      <Section title="Step 5 - Patient awareness for ambient scribes">
        <P>
          Patients should be informed when an ambient AI scribe is used during their encounter. A short
          intake notice or in-room placard is sufficient. This is good practice and aligns with the spirit
          of the Notice of Privacy Practices.
        </P>
      </Section>

      <Section title="Step 6 - Audit logging">
        <P>
          AI tool use should be logged with the same rigor as any other ePHI access. Capture user, tool,
          timestamp, and the encounter or record affected. Sample audit logs quarterly.
        </P>
      </Section>

      <Section title="Step 7 - Annual vendor review and sanctions">
        <P>
          Schedule an annual review of every AI vendor BAA, training-data clause, and subcontractor list.
          Tie unauthorized AI use of PHI to the same sanctions track as any other workforce policy
          violation under § 164.530(e).
        </P>
      </Section>
    </PdfLayout>
  )
}
