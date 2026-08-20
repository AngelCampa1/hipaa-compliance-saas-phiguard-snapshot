import { Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAnnualComplianceProgramAuditDocument() {
  return (
    <PdfLayout
      title="HIPAA Annual Compliance Program Audit"
      subtitle="10-section scored audit covering the full HIPAA program. Complete annually or after material operational changes."
    >
      <Section title="Audit instructions">
        <P>
          Complete this audit once per year, or following any material change to your clinic's systems, workforce,
          or operations. Score each item 0 (not implemented), 1 (partial), or 2 (fully implemented with evidence).
          Items scored 0 require a remediation action and due date.
        </P>
        <Table
          headers={['Score', 'Definition']}
          rows={[
            ['0', 'Not implemented - no process, policy, or evidence exists'],
            ['1', 'Partially implemented - process exists but is undocumented or inconsistent'],
            ['2', 'Fully implemented - documented, consistently applied, and evidenced'],
          ]}
        />
        <Callout label="Audit header">
          Audit date: _______ | Audit period: _______ | Conducted by: _______ | Approved by: _______
        </Callout>
      </Section>

      <Section title="Sections 1-4: Governance, Risk, Training, and Vendor Management">
        <Table
          headers={['#', 'Audit Item', 'Score (0/1/2)', 'Owner']}
          rows={[
            ['1.1', 'Privacy Officer is designated in writing with documented responsibilities', '', ''],
            ['1.2', 'Security Officer is designated in writing (may be same as Privacy Officer)', '', ''],
            ['1.3', 'Compliance program has defined objectives, scope, and annual review schedule', '', ''],
            ['1.4', 'Compliance findings reported to clinic leadership at least annually', '', ''],
            ['1.5', 'HIPAA responsibilities are included in job descriptions for applicable roles', '', ''],
            ['2.1', 'Documented risk analysis completed within the past 12 months', '', ''],
            ['2.2', 'Risk register documents identified risks with likelihood and impact scores', '', ''],
            ['2.3', 'Risk management plan assigns each risk to an owner with a target date', '', ''],
            ['2.4', 'All Critical and High risks have been addressed or accepted with rationale', '', ''],
            ['2.5', 'Risk analysis updated after material changes (new EHR, breach, vendor change)', '', ''],
            ['3.1', 'All workforce members completed HIPAA training within the past 12 months', '', ''],
            ['3.2', 'Training records retained with names, dates, topics, and trainer', '', ''],
            ['3.3', 'New hire HIPAA training completed before PHI access is granted', '', ''],
            ['3.4', 'Workforce sanction policy is documented and applied consistently', '', ''],
            ['3.5', 'Sanctions log maintained; sanctions applied where violations occurred', '', ''],
            ['4.1', 'Complete vendor inventory of business associates is documented and current', '', ''],
            ['4.2', 'Signed BAA on file for every vendor - no lapsed or missing agreements', '', ''],
            ['4.3', 'BAA renewal dates tracked; review initiated at least 90 days before expiration', '', ''],
            ['4.4', 'New vendor intake requires BAA execution before PHI access is granted', '', ''],
            ['4.5', 'Vendor termination process includes PHI destruction certification', '', ''],
          ]}
        />
      </Section>

      <Section title="Sections 5-8: Incident Response, Access, Physical, and Technical Safeguards">
        <Table
          headers={['#', 'Audit Item', 'Score (0/1/2)', 'Owner']}
          rows={[
            ['5.1', 'Written incident response plan with roles, escalation triggers, and timelines', '', ''],
            ['5.2', 'All workforce members know how and to whom to report a suspected incident', '', ''],
            ['5.3', 'Incident log maintained with event description, 4-factor analysis, and disposition', '', ''],
            ['5.4', 'All reportable breaches notified to individuals and HHS within 60 days', '', ''],
            ['5.5', 'Breach response plan tested (tabletop exercise) at least once in the past year', '', ''],
            ['6.1', 'Unique user IDs used for all ePHI system access - no shared credentials', '', ''],
            ['6.2', 'Role-based access controls documented; access limited to role requirements', '', ''],
            ['6.3', 'Access reviews conducted on schedule (minimum annually; quarterly for high-risk)', '', ''],
            ['6.4', 'Terminated employee access revoked on last day for all departures in audit period', '', ''],
            ['6.5', 'MFA required for remote access and cloud-based ePHI systems', '', ''],
            ['7.1', 'Facility access controls in place for areas where ePHI is accessed or stored', '', ''],
            ['7.2', 'Workstation screens positioned or protected from unauthorized viewing', '', ''],
            ['7.3', 'Device inventory current - all devices holding ePHI documented with owner', '', ''],
            ['7.4', 'Device and media disposal procedure documented with secure destruction records', '', ''],
            ['7.5', 'Physical access logs for restricted areas reviewed periodically', '', ''],
            ['8.1', 'All ePHI systems enforce automatic session timeout', '', ''],
            ['8.2', 'Encryption in place for ePHI at rest (databases, backups, storage)', '', ''],
            ['8.3', 'Encryption in place for ePHI in transit (TLS 1.2+ for all transmissions)', '', ''],
            ['8.4', 'Audit logs enabled for ePHI system access and reviewed on a defined schedule', '', ''],
            ['8.5', 'Anti-malware protection current on all workstations and servers holding ePHI', '', ''],
          ]}
        />
      </Section>

      <Section title="Sections 9-10: Policies and Contingency Planning">
        <Table
          headers={['#', 'Audit Item', 'Score (0/1/2)', 'Owner']}
          rows={[
            ['9.1', 'HIPAA Privacy Rule policies documented, reviewed annually, and current', '', ''],
            ['9.2', 'HIPAA Security Rule policies (all three safeguard categories) documented and current', '', ''],
            ['9.3', 'Notice of Privacy Practices current, available at point of service and on website', '', ''],
            ['9.4', 'Policy review documented with reviewer name, date, and version history', '', ''],
            ['9.5', 'All HIPAA compliance documentation retained for 6 years per retention schedule', '', ''],
            ['10.1', 'Data backup plan documented with scope, frequency, location, and encryption', '', ''],
            ['10.2', 'Backup restoration tested within the past 12 months with documented results', '', ''],
            ['10.3', 'Disaster recovery plan addresses ePHI restoration with recovery time objectives', '', ''],
            ['10.4', 'Emergency mode operation plan exists for ePHI access during system failures', '', ''],
            ['10.5', 'Application criticality analysis identifies which systems must be restored first', '', ''],
          ]}
        />
      </Section>

      <Section title="Annual audit score summary">
        <Table
          headers={['Section', 'Max', 'Score', 'Gap Items (scored 0 or 1)']}
          rows={[
            ['1 - Program Governance', '10', '', ''],
            ['2 - Risk Analysis', '10', '', ''],
            ['3 - Workforce Training', '10', '', ''],
            ['4 - BAA Management', '10', '', ''],
            ['5 - Incident Response', '10', '', ''],
            ['6 - Access Controls', '10', '', ''],
            ['7 - Physical Safeguards', '10', '', ''],
            ['8 - Technical Safeguards', '10', '', ''],
            ['9 - Policies', '10', '', ''],
            ['10 - Contingency Planning', '10', '', ''],
            ['TOTAL', '100', '', ''],
          ]}
        />
        <Table
          headers={['Score Range', 'Program Status', 'Action']}
          rows={[
            ['80-100', 'Mature - Continue current cadence', 'Document results; schedule next annual audit'],
            ['60-79', 'Developing - Gaps need attention', 'Remediate sections below 6 within 90 days'],
            ['Below 60', 'Underdeveloped - Immediate action required', 'Prioritize sections at 0-4; engage compliance counsel'],
          ]}
        />
      </Section>

      <Section title="Top remediation priorities">
        <Table
          headers={['Priority', 'Section', 'Gap Item', 'Owner', 'Target Date']}
          rows={[
            ['1', '', '', '', ''],
            ['2', '', '', '', ''],
            ['3', '', '', '', ''],
            ['4', '', '', '', ''],
            ['5', '', '', '', ''],
          ]}
        />
        <P>
          PHIGuard maintains your annual audit results as a live program record, converts gap items into assigned
          tasks, and tracks remediation through to closure with attached evidence. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
