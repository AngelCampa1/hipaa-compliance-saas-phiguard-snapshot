import React from 'react'
import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaComplianceSelfAssessmentDocument() {
  return (
    <PdfLayout
      title="HIPAA Compliance Self-Assessment"
      subtitle="A 15-minute worksheet for small clinics to score BAA coverage, training evidence, incident readiness, and recurring compliance ownership."
    >
      <Section title="How to use this worksheet">
        <P>
          Score each item from 0 to 2. Use 0 when the clinic has no defined process, 1 when the process exists but is
          inconsistent or undocumented, and 2 when the process is established, assigned, and evidenced.
        </P>
        <Callout label="Scoring rule">
          A weak but documented process should not receive the same score as a process that does not exist. The goal is
          to identify where the clinic is fragile, not to claim perfection.
        </Callout>
      </Section>

      <Section title="Assessment questions">
        <Table
          headers={['Category', 'Question', 'Score (0-2)']}
          rows={[
            ['BAAs', 'Do all vendors that create, receive, maintain, or transmit PHI have a signed BAA?', ''],
            ['BAAs', 'Is there a current owner for reviewing BAAs before renewal or vendor change?', ''],
            ['Access', 'Can the clinic explain who has access to each PHI-adjacent workflow?', ''],
            ['Access', 'Are onboarding and offboarding tasks assigned, tracked, and retained as evidence?', ''],
            ['Training', 'Is HIPAA/security training completed and recorded for every workforce member?', ''],
            ['Training', 'Does the clinic have a repeatable refresher cadence instead of one-time onboarding only?', ''],
            ['Incidents', 'Does the clinic have a written incident response path for suspected HIPAA events?', ''],
            ['Incidents', 'Can the team document investigation steps, containment, and follow-up decisions?', ''],
            ['Tasks', 'Are recurring HIPAA tasks assigned to named owners with due dates?', ''],
            ['Tasks', 'Can leaders see overdue compliance work without checking multiple tools?', ''],
            ['Evidence', 'Is evidence stored with the work itself instead of scattered across email and folders?', ''],
            ['Evidence', 'Can the clinic show what changed, who changed it, and when?', ''],
          ]}
        />
      </Section>

      <Section title="What your score means">
        <Bullets
          items={[
            '0-8: The program is under-controlled. Start with BAAs, task ownership, and a written incident path.',
            '9-16: The program exists but is fragmented. Reduce workflow sprawl and tighten accountability.',
            '17-24: The clinic has real operating discipline. Focus next on evidence quality and annual review cadence.',
          ]}
        />
      </Section>

      <Section title="Red flags to discuss immediately">
        <Bullets
          items={[
            'Staff rely on memory, shared inboxes, or spreadsheets for recurring HIPAA work.',
            'No one can produce a clean vendor list with BAA status in one place.',
            'Training completion is tracked manually and cannot be audited quickly.',
            'Incident handling lives in chat messages or informal conversations.',
            'Patient-adjacent work is spread across generic tools with unclear visibility defaults.',
          ]}
        />
      </Section>

      <Section title="Next-step planning">
        <P>After scoring, write down the first three changes that would reduce risk the fastest:</P>
        <Table
          headers={['Priority', 'Gap', 'Owner', 'Due date']}
          rows={[
            ['1', '', '', ''],
            ['2', '', '', ''],
            ['3', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard gives clinics one operating system for recurring compliance work, BAA tracking, incident follow-up,
          and audit evidence. If this worksheet exposed workflow sprawl, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
