import { Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaGapAnalysisScorecardDocument() {
  return (
    <PdfLayout
      title="HIPAA Gap Analysis Scorecard"
      subtitle="Scored self-assessment across 8 HIPAA program areas. Use 0 (not in place), 1 (partial), or 2 (fully implemented and evidenced)."
    >
      <Section title="Scoring instructions">
        <P>
          Score each item from 0 to 2 using the rubric below. Complete every item honestly - the purpose is to
          identify gaps, not to claim a clean program. A score of 1 is appropriate when a process exists but is
          undocumented, inconsistently applied, or lacks evidence. After scoring, calculate section totals and refer
          to the risk interpretation at the end.
        </P>
        <Table
          headers={['Score', 'Meaning']}
          rows={[
            ['0', 'Not in place - no defined process, no documentation, no evidence'],
            ['1', 'Partial - process exists but is inconsistent, undocumented, or not evidenced'],
            ['2', 'Fully implemented - process is established, assigned to an owner, documented, and evidenced'],
          ]}
        />
        <Callout label="What counts as evidence">
          Evidence includes: written policies with version dates, training completion records with timestamps,
          signed BAAs on file, dated risk analysis documents, incident logs, access review records. A verbal
          description is not evidence.
        </Callout>
      </Section>

      <Section title="Part 1 - Privacy Rule compliance">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['1.1', 'Current Notice of Privacy Practices distributed to patients and available at point of service', '', ''],
            ['1.2', 'Written minimum necessary policy exists and workforce is trained on it', '', ''],
            ['1.3', 'Procedures for patient rights requests (access, amendment, restriction, accounting of disclosures) are documented and assigned to an owner', '', ''],
            ['1.4', 'Patient authorizations for non-TPO disclosures are collected, tracked, and retained', '', ''],
            ['1.5', 'Privacy Officer is designated in writing and responsibilities are documented', '', ''],
            ['Section 1 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 2 - Security Rule compliance">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['2.1', 'Security Officer is designated and responsibilities are documented', '', ''],
            ['2.2', 'Formal risk analysis completed in the past 12 months, with identified risks ranked by likelihood and impact', '', ''],
            ['2.3', 'Risk management plan exists: identified risks have assigned owners, mitigation actions, and target dates', '', ''],
            ['2.4', 'Security policies (access control, workstation, device/media, audit, transmission) are documented and current', '', ''],
            ['2.5', 'Annual security program evaluation has been conducted and documented per § 164.308(a)(8)', '', ''],
            ['Section 2 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 3 - Breach notification readiness">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['3.1', 'Written incident response plan documents the 4-factor LOPC analysis, escalation path, and notification roles', '', ''],
            ['3.2', 'Breach notification templates (individual, HHS, media) are prepared and accessible', '', ''],
            ['3.3', 'All workforce members know how and to whom to report a suspected incident', '', ''],
            ['3.4', 'Incident log is maintained with event description, investigation notes, and outcome documentation', '', ''],
            ['3.5', 'Breach response timelines (60-day federal; applicable state deadlines) are posted and reviewed at least annually', '', ''],
            ['Section 3 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 4 - Business associate management">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['4.1', 'Comprehensive vendor inventory exists documenting all vendors that may create, receive, maintain, or transmit PHI', '', ''],
            ['4.2', 'Signed BAA on file for each vendor in the inventory; BAA status is current (no lapsed agreements)', '', ''],
            ['4.3', 'BAA renewal review process is in place with tracking of expiration dates', '', ''],
            ['4.4', 'New vendor intake process requires BAA execution before PHI access is granted', '', ''],
            ['4.5', 'Vendor termination process includes PHI return or destruction certification', '', ''],
            ['Section 4 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 5 - Workforce training">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['5.1', 'All workforce members completed HIPAA training at hire and annually thereafter', '', ''],
            ['5.2', 'Training records are retained with names, dates, topics, and trainer per § 164.530(j)', '', ''],
            ['5.3', "Training covers the clinic's specific policies and security practices, not only generic HIPAA content", '', ''],
            ['5.4', 'Workforce sanction policy is documented and has been applied consistently when violations occur', '', ''],
            ['5.5', "Staff know the clinic's specific incident reporting procedure and the identity of the privacy officer", '', ''],
            ['Section 5 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 6 - Audit controls and access management">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['6.1', 'Unique user IDs are used for all ePHI system access (no shared logins)', '', ''],
            ['6.2', 'Access to ePHI systems is based on role with documented access authorization criteria', '', ''],
            ['6.3', 'Access log reviews are conducted on a defined schedule (at minimum quarterly for highest-risk systems)', '', ''],
            ['6.4', 'Access review records document who reviewed, what was reviewed, and what anomalies were found', '', ''],
            ['6.5', 'Terminated employee access is revoked on the last day of employment and documented', '', ''],
            ['Section 6 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 7 - Physical safeguards">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['7.1', 'Facility access controls are in place for areas where ePHI is stored or accessed (locked doors, badge access, visitor logs)', '', ''],
            ['7.2', 'Workstation use policy defines where and how ePHI may be accessed on workstations', '', ''],
            ['7.3', 'Screens are positioned or protected from unauthorized viewing in patient-facing and public areas', '', ''],
            ['7.4', 'Device and media controls policy addresses disposal, re-use, and accountability for devices holding ePHI', '', ''],
            ['7.5', 'Inventory of devices and media that store or transmit ePHI is documented and current', '', ''],
            ['Section 7 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Part 8 - Policies, documentation, and ongoing program management">
        <Table
          headers={['#', 'Control Item', 'Score (0/1/2)', 'Notes']}
          rows={[
            ['8.1', 'Written HIPAA policies and procedures address all required implementation specifications', '', ''],
            ['8.2', 'Policies are reviewed at least annually and updated to reflect operational changes', '', ''],
            ['8.3', 'Policy review is evidenced: reviewer name, review date, and version history are documented', '', ''],
            ['8.4', 'HIPAA compliance documentation is retained for 6 years per §§ 164.530(j) and 164.316(b)(2)', '', ''],
            ['8.5', 'Compliance tasks are assigned to named owners - there is no task that is owned by no one', '', ''],
            ['Section 8 total', '', '', '/10'],
          ]}
        />
      </Section>

      <Section title="Program score summary">
        <Table
          headers={['Section', 'Max Score', 'Your Score', 'Risk Level']}
          rows={[
            ['1 - Privacy Rule', '10', '', ''],
            ['2 - Security Rule', '10', '', ''],
            ['3 - Breach Notification', '10', '', ''],
            ['4 - BAA Management', '10', '', ''],
            ['5 - Workforce Training', '10', '', ''],
            ['6 - Audit Controls', '10', '', ''],
            ['7 - Physical Safeguards', '10', '', ''],
            ['8 - Policies and Documentation', '10', '', ''],
            ['TOTAL', '80', '', ''],
          ]}
        />
        <Table
          headers={['Total Score', 'Risk Level', 'Recommended Action']}
          rows={[
            ['65-80', 'Green - Adequate program', 'Annual review; address any section below 8'],
            ['45-64', 'Yellow - Gaps requiring attention', 'Prioritize sections scored below 6; set 90-day remediation targets'],
            ['0-44', 'Red - Critical gaps', 'Immediate remediation required; engage compliance counsel if score < 30'],
          ]}
        />
      </Section>

      <Section title="Top 3 priority remediation items">
        <Table
          headers={['Priority', 'Section', 'Gap Description', 'Owner', 'Target Date']}
          rows={[
            ['1', '', '', '', ''],
            ['2', '', '', '', ''],
            ['3', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard converts gap analysis findings into assigned remediation tasks with due dates, evidence fields,
          and a live dashboard showing your program score over time. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
