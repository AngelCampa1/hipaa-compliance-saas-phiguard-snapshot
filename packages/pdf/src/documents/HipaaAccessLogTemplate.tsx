import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAccessLogTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Access Log Template"
      subtitle="An access log template for documenting ePHI system access, user activity reviews, and access anomaly tracking."
    >
      <Section title="Regulatory requirement">
        <P>
          The Security Rule's technical safeguards require covered entities to implement hardware, software,
          and procedural mechanisms that record and examine activity in information systems that contain or
          use ePHI. This is an audit controls standard under §164.312(b). Access logs satisfy the audit
          control requirement only if someone reviews them - retention without review does not demonstrate
          compliance.
        </P>
        <Callout label="The most common finding">
          During OCR investigations, clinics often produce access logs on request but cannot demonstrate
          that the logs were reviewed periodically. Logging without review is incomplete compliance.
        </Callout>
      </Section>

      <Section title="Access log - system activity">
        <P>
          System: ____________________   Review period: ____________________ to ____________________
          Reviewer: ____________________   Review date: ____________________
        </P>
        <Table
          headers={['Date/time', 'User ID', 'Action', 'Record accessed', 'Location/IP', 'Authorized']}
          rows={[
            ['', '', '', '', '', '☐ Yes ☐ No'],
            ['', '', '', '', '', '☐ Yes ☐ No'],
            ['', '', '', '', '', '☐ Yes ☐ No'],
            ['', '', '', '', '', '☐ Yes ☐ No'],
            ['', '', '', '', '', '☐ Yes ☐ No'],
          ]}
        />
        <P>
          Action codes: V = Viewed, E = Edited, D = Deleted, P = Printed, X = Exported, L = Login, O = Logout
        </P>
      </Section>

      <Section title="Access anomaly log">
        <P>
          Use this log to document access patterns that require investigation: after-hours access,
          access to records outside the employee's assigned patient panel, repeated failed login attempts,
          or bulk record access.
        </P>
        <Table
          headers={['Date', 'User', 'System', 'Anomaly description', 'Reviewed by', 'Resolution']}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Log review procedure">
        <Bullets
          items={[
            'Review EHR access logs at least monthly. High-risk environments (large patient volume, prior incidents) should review weekly.',
            'Review for: access to records of VIPs, staff members, or individuals not in the reviewer\'s patient panel; after-hours access; bulk exports or printing.',
            'Investigate any anomaly by speaking with the workforce member and reviewing context before escalating.',
            'Document each review in the access review log, including what was reviewed, anomalies found, and resolution.',
            'Escalate to the Privacy or Security Officer any access event that cannot be explained by normal operations.',
            'Retain access logs and review documentation for a minimum of six years.',
          ]}
        />
      </Section>

      <Section title="Access review log - monthly record">
        <Table
          headers={['Month/Year', 'Systems reviewed', 'Anomalies found', 'Anomalies resolved', 'Reviewer', 'Date completed']}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="User access provisioning and deprovisioning log">
        <P>
          Maintain a separate log for access grants and revocations. Access should be revoked on the day
          of termination, not after equipment is returned.
        </P>
        <Table
          headers={['Date', 'User', 'Action', 'Systems affected', 'Reason', 'Authorized by']}
          rows={[
            ['', '', '☐ Grant ☐ Revoke', '', '', ''],
            ['', '', '☐ Grant ☐ Revoke', '', '', ''],
            ['', '', '☐ Grant ☐ Revoke', '', '', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard helps clinics schedule access log reviews, document findings, and create follow-up tasks
          when an anomaly requires investigation. If access log review is not happening or is happening
          informally with no documentation, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
