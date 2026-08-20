import React from 'react'
import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaPmToolComparisonGuideDocument() {
  return (
    <PdfLayout
      title="HIPAA PM Tool Comparison Guide"
      subtitle="A clinic-focused worksheet for comparing task, workflow, and compliance platforms on BAA posture, auditability, and operating fit."
    >
      <Section title="How to evaluate this category">
        <P>
          Compare compliant options against compliant options. A low starter price is not useful if HIPAA support,
          wider staff access, or auditability only appear at a higher contract tier.
        </P>
        <Callout label="Common buying mistake">
          Clinics often compare a clinic-ready product against a stripped-down self-serve plan on a generic platform.
          That hides the real cost and the real workflow risk.
        </Callout>
      </Section>

      <Section title="Vendor comparison matrix">
        <Table
          headers={[
            'Vendor',
            'BAA available',
            'Pricing model',
            'Audit trail',
            'Workflow fit',
            'Notes',
          ]}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Questions to ask on every demo">
        <Bullets
          items={[
            'At what buying tier is a BAA actually available?',
            'What patient-adjacent data would show up in notifications, comments, exports, or integrations?',
            'Can the product show who completed a task, what changed, and when?',
            'How does pricing change when front desk, billing, compliance, and leadership all need access?',
            'Does the product help the clinic run recurring compliance work, or only generic task management?',
          ]}
        />
      </Section>

      <Section title="Clinic-fit scorecard">
        <Table
          headers={['Criterion', 'Weight', 'Vendor A', 'Vendor B', 'Vendor C']}
          rows={[
            ['BAA availability and contract clarity', 'High', '', '', ''],
            ['Per-clinic or predictable pricing', 'High', '', '', ''],
            ['Auditability and evidence retention', 'High', '', '', ''],
            ['Fit for recurring HIPAA operations', 'High', '', '', ''],
            ['Ease of rollout for small teams', 'Medium', '', '', ''],
            ['Risk of workflow sprawl', 'High', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Signs a tool is the wrong fit">
        <Bullets
          items={[
            'HIPAA support is vague, gated, or only available through enterprise procurement.',
            'The product assumes software-team rituals that a clinic will not maintain consistently.',
            'Audit history is thin or detached from the underlying work.',
            'You need extra tools just to manage BAAs, incidents, or training evidence.',
            'Adding the actual clinic staff who need access turns the rollout into a pricing fight.',
          ]}
        />
      </Section>

      <Section title="Decision summary">
        <P>
          After each demo, capture the winning and losing factors while they are fresh. The right system should make
          the compliant path simpler than the risky one for the people who use it every week.
        </P>
        <Table
          headers={['Vendor', 'Why it stays on the shortlist', 'Why it gets eliminated']}
          rows={[
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard is built for clinics that need task accountability, audit evidence, and a BAA-ready home for
          recurring compliance work without stitching together generic tools. Learn more at phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
